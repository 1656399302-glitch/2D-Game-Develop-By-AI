/**
 * AC-EDITOR-003: Functional Tests for Activation State Machine
 * 
 * Verifies:
 * - AC-EDITOR-003: Machine activation triggers animation state changes through the state machine
 */

import { describe, it, expect, beforeEach, afterEach, vi, afterAll } from 'vitest';
import { act } from 'react-dom/test-utils';
import { useMachineStore } from '../../store/useMachineStore';
import { MachineState } from '../../types';

describe('Activation State Machine Functional Tests', () => {
  beforeEach(() => {
    // Reset store to clean state
    const state = useMachineStore.getState();
    state.clearCanvas();
    state.setMachineState('idle');
    state.setShowActivation(false);
  });

  afterEach(() => {
    // Cleanup
    const state = useMachineStore.getState();
    state.clearCanvas();
    state.setMachineState('idle');
    state.setShowActivation(false);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('AC-EDITOR-003: Activation State Transitions', () => {
    it('should have idle state initially', () => {
      const state = useMachineStore.getState();
      expect(state.machineState).toBe('idle');
      expect(state.showActivation).toBe(false);
    });

    it('should transition from idle to charging', () => {
      const { setMachineState } = useMachineStore.getState();
      
      act(() => {
        setMachineState('charging');
      });
      
      const state = useMachineStore.getState();
      expect(state.machineState).toBe('charging');
    });

    it('should transition from charging to active', () => {
      const { setMachineState } = useMachineStore.getState();
      
      // Start charging
      act(() => {
        setMachineState('charging');
      });
      
      let state = useMachineStore.getState();
      expect(state.machineState).toBe('charging');
      
      // Transition to active
      act(() => {
        setMachineState('active');
      });
      
      state = useMachineStore.getState();
      expect(state.machineState).toBe('active');
    });

    it('should support transition to overload state', () => {
      const { setMachineState } = useMachineStore.getState();
      
      act(() => {
        setMachineState('overload');
      });
      
      const state = useMachineStore.getState();
      expect(state.machineState).toBe('overload');
    });

    it('should support transition to failure state', () => {
      const { setMachineState } = useMachineStore.getState();
      
      act(() => {
        setMachineState('failure');
      });
      
      const state = useMachineStore.getState();
      expect(state.machineState).toBe('failure');
    });

    it('should support transition to shutdown state', () => {
      const { setMachineState } = useMachineStore.getState();
      
      // First activate
      act(() => {
        setMachineState('active');
      });
      
      // Then shutdown
      act(() => {
        setMachineState('shutdown');
      });
      
      const state = useMachineStore.getState();
      expect(state.machineState).toBe('shutdown');
    });

    it('should return to idle from any state', () => {
      const { setMachineState } = useMachineStore.getState();
      
      const states: MachineState[] = ['charging', 'active', 'overload', 'failure', 'shutdown'];
      
      states.forEach((stateToSet) => {
        act(() => {
          setMachineState(stateToSet);
        });
        
        act(() => {
          setMachineState('idle');
        });
        
        const state = useMachineStore.getState();
        expect(state.machineState).toBe('idle');
      });
    });

    it('should complete full state cycle', () => {
      const { setMachineState } = useMachineStore.getState();
      
      const expectedCycle: MachineState[] = ['idle', 'charging', 'active', 'shutdown', 'idle'];
      
      expectedCycle.forEach((expectedState) => {
        act(() => {
          setMachineState(expectedState);
        });
        
        const state = useMachineStore.getState();
        expect(state.machineState).toBe(expectedState);
      });
    });
  });

  describe('Activation Show Toggle', () => {
    it('should toggle showActivation when activation is triggered', () => {
      const { setMachineState, setShowActivation } = useMachineStore.getState();
      
      expect(useMachineStore.getState().showActivation).toBe(false);
      
      // Start activation
      act(() => {
        setMachineState('charging');
        setShowActivation(true);
      });
      
      let state = useMachineStore.getState();
      expect(state.showActivation).toBe(true);
      expect(state.machineState).toBe('charging');
      
      // End activation
      act(() => {
        setMachineState('idle');
        setShowActivation(false);
      });
      
      state = useMachineStore.getState();
      expect(state.showActivation).toBe(false);
      expect(state.machineState).toBe('idle');
    });
  });

  describe('Activation Failure Mode', () => {
    it('should activate failure mode', () => {
      const { activateFailureMode } = useMachineStore.getState();
      
      act(() => {
        activateFailureMode();
      });
      
      const state = useMachineStore.getState();
      expect(state.machineState).toBe('failure');
      expect(state.showActivation).toBe(true);
    });
  });

  describe('Activation Overload Mode', () => {
    it('should activate overload mode', () => {
      const { activateOverloadMode } = useMachineStore.getState();
      
      act(() => {
        activateOverloadMode();
      });
      
      const state = useMachineStore.getState();
      expect(state.machineState).toBe('overload');
      expect(state.showActivation).toBe(true);
    });
  });

  describe('State Machine with Modules', () => {
    it('should maintain activation state with modules on canvas', () => {
      const { addModule, setMachineState } = useMachineStore.getState();
      
      // Add some modules
      act(() => {
        addModule('core-furnace', 100, 100);
        addModule('gear', 200, 100);
      });
      
      let state = useMachineStore.getState();
      expect(state.modules.length).toBe(2);
      
      // Start activation
      act(() => {
        setMachineState('active');
        state.setShowActivation(true);
      });
      
      state = useMachineStore.getState();
      expect(state.machineState).toBe('active');
      expect(state.showActivation).toBe(true);
      expect(state.modules.length).toBe(2);
    });
  });

  describe('Valid State Transitions', () => {
    const validTransitions: Array<[MachineState, MachineState]> = [
      ['idle', 'charging'],
      ['charging', 'active'],
      ['active', 'shutdown'],
      ['active', 'idle'],
      ['idle', 'failure'],
      ['idle', 'overload'],
    ];

    validTransitions.forEach(([from, to]) => {
      it(`should transition from ${from} to ${to}`, () => {
        const { setMachineState } = useMachineStore.getState();
        
        act(() => {
          setMachineState(from);
        });
        
        let state = useMachineStore.getState();
        expect(state.machineState).toBe(from);
        
        act(() => {
          setMachineState(to);
        });
        
        state = useMachineStore.getState();
        expect(state.machineState).toBe(to);
      });
    });
  });

  describe('State Machine Persistence', () => {
    it('should persist machineState across operations', () => {
      const { addModule, setMachineState } = useMachineStore.getState();
      
      // Set state
      act(() => {
        setMachineState('active');
      });
      
      // Add module
      act(() => {
        addModule('core-furnace', 100, 100);
      });
      
      const state = useMachineStore.getState();
      expect(state.machineState).toBe('active');
      expect(state.modules.length).toBe(1);
      
      // Remove module
      act(() => {
        useMachineStore.getState().removeModule(state.modules[0].instanceId);
      });
      
      const finalState = useMachineStore.getState();
      expect(finalState.machineState).toBe('active');
      expect(finalState.modules.length).toBe(0);
    });
  });

  describe('Activation Zoom State', () => {
    it('should have initial zoom state', () => {
      const state = useMachineStore.getState();
      
      expect(state.activationZoom).toBeDefined();
      expect(state.activationZoom.isZooming).toBe(false);
      expect(state.activationZoom.startViewport).toBeNull();
      expect(state.activationZoom.targetViewport).toBeNull();
    });

    it('should update activation module index', () => {
      const { setActivationModuleIndex } = useMachineStore.getState();
      
      act(() => {
        setActivationModuleIndex(0);
      });
      
      let state = useMachineStore.getState();
      expect(state.activationModuleIndex).toBe(0);
      
      act(() => {
        setActivationModuleIndex(5);
      });
      
      state = useMachineStore.getState();
      expect(state.activationModuleIndex).toBe(5);
    });

    it('should track activation start time', () => {
      const { startActivationZoom } = useMachineStore.getState();
      
      act(() => {
        startActivationZoom();
      });
      
      const state = useMachineStore.getState();
      expect(state.activationZoom.isZooming).toBe(true);
      expect(state.activationZoom.startTime).toBeGreaterThan(0);
      expect(state.activationStartTime).toBeGreaterThan(0);
    });
  });
});
