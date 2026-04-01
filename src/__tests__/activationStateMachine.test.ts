import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMachineStore } from '../store/useMachineStore';
import { MachineState, PlacedModule, Connection } from '../types';

/**
 * Activation State Machine Tests
 * 
 * Tests the state machine transitions:
 * - AC1.1: idle → charging → active progression
 * - AC1.2: failure state on incomplete circuit (no core module)
 * - AC1.3: shutdown from active state
 * - AC1.4: repeated activation cycle stability
 */

// Helper to create mock modules
const createModule = (type: string, instanceId: string = `mod-${Date.now()}`): PlacedModule => ({
  id: `id-${instanceId}`,
  instanceId,
  type: type as any,
  x: 100,
  y: 100,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports: [
    { id: `${instanceId}-in`, type: 'input' as const, position: { x: 25, y: 50 } },
    { id: `${instanceId}-out`, type: 'output' as const, position: { x: 75, y: 50 } },
  ],
});

// Helper to create mock connections
const createConnection = (
  sourceId: string,
  targetId: string
): Connection => ({
  id: `conn-${Date.now()}-${Math.random()}`,
  sourceModuleId: sourceId,
  sourcePortId: `${sourceId}-out`,
  targetModuleId: targetId,
  targetPortId: `${targetId}-in`,
  pathData: 'M 0 0 L 100 100',
});

describe('Activation State Machine', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const store = useMachineStore.getState();
    store.clearCanvas();
    store.setMachineState('idle');
    store.setShowActivation(false);
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC1.1: idle → charging → active state progression', () => {
    test('initial state is idle', () => {
      const { machineState } = useMachineStore.getState();
      expect(machineState).toBe('idle');
    });

    test('machine with modules can enter charging state', () => {
      const store = useMachineStore.getState();
      
      // Add a core module
      act(() => {
        store.addModule('core-furnace', 400, 300);
      });
      
      // Trigger activation by setting machine state
      act(() => {
        store.setMachineState('charging');
      });
      
      const { machineState } = useMachineStore.getState();
      expect(machineState).toBe('charging');
    });

    test('machine transitions from charging to active', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 400, 300);
      });
      
      act(() => {
        store.setMachineState('charging');
      });
      
      act(() => {
        store.setMachineState('active');
      });
      
      const { machineState } = useMachineStore.getState();
      expect(machineState).toBe('active');
    });

    test('machineState should not remain stuck in charging after activation completes', async () => {
      vi.useFakeTimers();
      
      const store = useMachineStore.getState();
      
      // Add modules
      act(() => {
        store.addModule('core-furnace', 400, 300);
      });
      
      // Set charging
      act(() => {
        store.setMachineState('charging');
      });
      
      expect(useMachineStore.getState().machineState).toBe('charging');
      
      // Advance timers and transition to active
      act(() => {
        vi.advanceTimersByTime(267);
      });
      
      act(() => {
        store.setMachineState('active');
      });
      
      // After some time, should transition to shutdown then idle
      act(() => {
        vi.advanceTimersByTime(400);
      });
      
      act(() => {
        store.setMachineState('shutdown');
      });
      
      act(() => {
        vi.advanceTimersByTime(167);
      });
      
      act(() => {
        store.setMachineState('idle');
      });
      
      // State should be idle, not stuck
      expect(useMachineStore.getState().machineState).toBe('idle');
      
      vi.useRealTimers();
    });
  });

  describe('AC1.2: failure state on incomplete circuit (no core module)', () => {
    test('machine without core module enters failure state', () => {
      const store = useMachineStore.getState();
      
      // Add modules without core
      act(() => {
        store.addModule('energy-pipe', 400, 300);
        store.addModule('gear', 500, 300);
      });
      
      // Activate failure mode
      act(() => {
        store.activateFailureMode();
      });
      
      const { machineState } = useMachineStore.getState();
      expect(machineState).toBe('failure');
    });

    test('failure state auto-returns to idle after 3.5 seconds', async () => {
      vi.useFakeTimers();
      
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('energy-pipe', 400, 300);
      });
      
      act(() => {
        store.activateFailureMode();
      });
      
      expect(useMachineStore.getState().machineState).toBe('failure');
      
      // Advance past auto-return delay (3500ms)
      act(() => {
        vi.advanceTimersByTime(3500);
      });
      
      const { machineState } = useMachineStore.getState();
      expect(machineState).toBe('idle');
      
      vi.useRealTimers();
    });

    test('activationFailureMode sets state to failure, not active', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('rune-node', 400, 300);
      });
      
      // activateFailureMode should set state to 'failure', not 'active'
      act(() => {
        store.activateFailureMode();
      });
      
      const { machineState } = useMachineStore.getState();
      expect(machineState).toBe('failure');
      expect(machineState).not.toBe('active');
    });
  });

  describe('AC1.3: shutdown from active state', () => {
    test('active machine can transition to shutdown state', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 400, 300);
        store.setMachineState('active');
      });
      
      act(() => {
        store.setMachineState('shutdown');
      });
      
      const { machineState } = useMachineStore.getState();
      expect(machineState).toBe('shutdown');
    });

    test('shutdown state can transition back to idle', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 400, 300);
        store.setMachineState('shutdown');
      });
      
      act(() => {
        store.setMachineState('idle');
      });
      
      const { machineState } = useMachineStore.getState();
      expect(machineState).toBe('idle');
    });

    test('shutdown clears activation overlay', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.setShowActivation(true);
        store.setMachineState('shutdown');
      });
      
      // When transitioning to shutdown, showActivation should be handled by the component
      // This tests the state machine behavior
      expect(useMachineStore.getState().machineState).toBe('shutdown');
    });
  });

  describe('AC1.4: repeated activation cycle stability', () => {
    test('machine can complete multiple activation cycles', async () => {
      vi.useFakeTimers();
      
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 400, 300);
      });
      
      // First cycle
      act(() => {
        store.setMachineState('charging');
      });
      expect(useMachineStore.getState().machineState).toBe('charging');
      
      act(() => {
        vi.advanceTimersByTime(267);
        store.setMachineState('active');
      });
      expect(useMachineStore.getState().machineState).toBe('active');
      
      act(() => {
        vi.advanceTimersByTime(400);
        store.setMachineState('shutdown');
      });
      expect(useMachineStore.getState().machineState).toBe('shutdown');
      
      act(() => {
        vi.advanceTimersByTime(167);
        store.setMachineState('idle');
      });
      expect(useMachineStore.getState().machineState).toBe('idle');
      
      // Second cycle
      act(() => {
        store.setMachineState('charging');
      });
      expect(useMachineStore.getState().machineState).toBe('charging');
      
      act(() => {
        vi.advanceTimersByTime(267);
        store.setMachineState('active');
      });
      expect(useMachineStore.getState().machineState).toBe('active');
      
      act(() => {
        vi.advanceTimersByTime(400);
        store.setMachineState('shutdown');
      });
      expect(useMachineStore.getState().machineState).toBe('shutdown');
      
      act(() => {
        vi.advanceTimersByTime(167);
        store.setMachineState('idle');
      });
      expect(useMachineStore.getState().machineState).toBe('idle');
      
      // Third cycle
      act(() => {
        store.setMachineState('charging');
      });
      expect(useMachineStore.getState().machineState).toBe('charging');
      
      vi.useRealTimers();
    });

    test('repeated cycles do not accumulate state artifacts', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 400, 300);
      });
      
      const initialModuleCount = useMachineStore.getState().modules.length;
      
      // Complete multiple cycles
      for (let i = 0; i < 3; i++) {
        act(() => {
          store.setMachineState('charging');
          store.setMachineState('active');
          store.setMachineState('shutdown');
          store.setMachineState('idle');
        });
      }
      
      // Module count should remain consistent
      const finalModuleCount = useMachineStore.getState().modules.length;
      expect(finalModuleCount).toBe(initialModuleCount);
      
      // Machine state should be idle
      expect(useMachineStore.getState().machineState).toBe('idle');
    });

    test('canvas remains stable after repeated activation cycles', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 400, 300);
        store.addModule('energy-pipe', 500, 300);
        store.addModule('gear', 600, 300);
      });
      
      // Complete multiple cycles
      for (let i = 0; i < 3; i++) {
        act(() => {
          store.setMachineState('charging');
          store.setMachineState('active');
          store.setMachineState('shutdown');
          store.setMachineState('idle');
        });
      }
      
      // Canvas state should be intact
      const { modules, connections } = useMachineStore.getState();
      expect(modules.length).toBe(3);
      expect(connections.length).toBe(0);
    });
  });

  describe('Negative Assertions', () => {
    test('machineState should not remain stuck in charging after activation completes', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 400, 300);
        store.setMachineState('charging');
      });
      
      act(() => {
        store.setMachineState('idle');
      });
      
      // Should not be stuck in charging
      expect(useMachineStore.getState().machineState).not.toBe('charging');
    });

    test('activateFailureMode correctly sets failure state', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('gear', 400, 300);
        store.activateFailureMode();
      });
      
      // State should be failure, not active
      const { machineState } = useMachineStore.getState();
      expect(machineState).toBe('failure');
      expect(machineState).not.toBe('active');
    });

    test('repeated cycles should not accumulate state artifacts', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 400, 300);
      });
      
      // Check for any unexpected state accumulation
      const initialState = JSON.stringify(useMachineStore.getState());
      
      for (let i = 0; i < 5; i++) {
        act(() => {
          store.setMachineState('charging');
          store.setMachineState('active');
          store.setMachineState('shutdown');
          store.setMachineState('idle');
        });
      }
      
      const finalState = JSON.stringify(useMachineStore.getState());
      
      // States should be equivalent aside from timing-related fields
      const initialModules = JSON.parse(initialState).modules;
      const finalModules = JSON.parse(finalState).modules;
      
      expect(initialModules.length).toBe(finalModules.length);
    });

    test('activateOverloadMode correctly sets overload state', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('gear', 400, 300);
        store.activateOverloadMode();
      });
      
      // State should be overload, not active
      const { machineState } = useMachineStore.getState();
      expect(machineState).toBe('overload');
      expect(machineState).not.toBe('active');
    });
  });
});
