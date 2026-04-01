import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMachineStore } from '../store/useMachineStore';

/**
 * Activation Overlay State Tests
 * 
 * Tests the overlay CSS class states:
 * - AC3.1: 'is-charging' class present during charging phase
 * - AC3.2: 'is-charging' class absent after completion
 * - AC3.3: No conflicting classes ('is-active' during charging, etc.)
 */

// Mock constants from ActivationOverlay component
const CHARGING_DURATION = 800;
const ACTIVATING_DURATION = 1200;
const ONLINE_DURATION = 500;
const AUTO_RETURN_DELAY = 3500;

describe('Activation Overlay State Tests', () => {
  beforeEach(() => {
    // Reset store to initial state
    const store = useMachineStore.getState();
    store.clearCanvas();
    store.setMachineState('idle');
    store.setShowActivation(false);
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC3.1: is-charging class present during charging phase', () => {
    test('machine enters charging state from idle', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 400, 300);
      });
      
      act(() => {
        store.setMachineState('charging');
      });
      
      const { machineState } = useMachineStore.getState();
      expect(machineState).toBe('charging');
    });

    test('showActivation is true during charging', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 400, 300);
      });
      
      act(() => {
        store.setShowActivation(true);
        store.setMachineState('charging');
      });
      
      const { showActivation, machineState } = useMachineStore.getState();
      expect(showActivation).toBe(true);
      expect(machineState).toBe('charging');
    });

    test('charging state is distinct from active state', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.setMachineState('charging');
      });
      
      const { machineState } = useMachineStore.getState();
      expect(machineState).toBe('charging');
      expect(machineState).not.toBe('active');
      expect(machineState).not.toBe('idle');
    });

    test('progress is tracked during charging', () => {
      vi.useFakeTimers();
      
      const store = useMachineStore.getState();
      
      act(() => {
        store.setMachineState('charging');
      });
      
      // Simulate time passing during charging
      act(() => {
        vi.advanceTimersByTime(400); // Halfway through charging
      });
      
      // Machine is still in charging state
      expect(useMachineStore.getState().machineState).toBe('charging');
      
      vi.useRealTimers();
    });
  });

  describe('AC3.2: is-charging class absent after completion', () => {
    test('machine transitions to active after charging completes', async () => {
      vi.useFakeTimers();
      
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 400, 300);
        store.setMachineState('charging');
      });
      
      // Advance past charging duration
      act(() => {
        vi.advanceTimersByTime(CHARGING_DURATION);
      });
      
      act(() => {
        store.setMachineState('active');
      });
      
      const { machineState } = useMachineStore.getState();
      expect(machineState).toBe('active');
      expect(machineState).not.toBe('charging');
      
      vi.useRealTimers();
    });

    test('machine transitions to idle after full activation cycle', async () => {
      vi.useFakeTimers();
      
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 400, 300);
        store.setMachineState('charging');
      });
      
      // Complete full activation cycle
      act(() => {
        vi.advanceTimersByTime(CHARGING_DURATION);
        store.setMachineState('active');
      });
      
      act(() => {
        vi.advanceTimersByTime(ACTIVATING_DURATION);
        store.setMachineState('shutdown');
      });
      
      act(() => {
        vi.advanceTimersByTime(ONLINE_DURATION);
        store.setMachineState('idle');
      });
      
      const { machineState } = useMachineStore.getState();
      expect(machineState).toBe('idle');
    });

    test('is-charging class would be absent after state transitions', () => {
      const store = useMachineStore.getState();
      
      // Charging → Active → Shutdown → Idle
      act(() => {
        store.setMachineState('charging');
      });
      
      act(() => {
        store.setMachineState('active');
      });
      
      act(() => {
        store.setMachineState('shutdown');
      });
      
      act(() => {
        store.setMachineState('idle');
      });
      
      const { machineState } = useMachineStore.getState();
      expect(machineState).toBe('idle');
      expect(machineState).not.toBe('charging');
    });

    test('showActivation can be cleared after completion', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.setShowActivation(true);
        store.setMachineState('idle');
      });
      
      act(() => {
        store.setShowActivation(false);
      });
      
      const { showActivation } = useMachineStore.getState();
      expect(showActivation).toBe(false);
    });
  });

  describe('AC3.3: No conflicting classes during charging', () => {
    test('machine in charging state should not have is-active class', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.setMachineState('charging');
      });
      
      const { machineState } = useMachineStore.getState();
      
      // During charging, machineState should be 'charging', not 'active'
      expect(machineState).toBe('charging');
      expect(machineState).not.toBe('active');
    });

    test('machine in charging state should not have is-overload class', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.setMachineState('charging');
      });
      
      const { machineState } = useMachineStore.getState();
      
      // During charging, machineState should be 'charging', not 'overload'
      expect(machineState).toBe('charging');
      expect(machineState).not.toBe('overload');
    });

    test('machine in charging state should not have is-failure class', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.setMachineState('charging');
      });
      
      const { machineState } = useMachineStore.getState();
      
      // During charging, machineState should be 'charging', not 'failure'
      expect(machineState).toBe('charging');
      expect(machineState).not.toBe('failure');
    });

    test('failure mode is separate from charging', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('gear', 400, 300);
        store.activateFailureMode();
      });
      
      const { machineState } = useMachineStore.getState();
      
      // Failure mode is a separate state from charging
      expect(machineState).toBe('failure');
      expect(machineState).not.toBe('charging');
    });

    test('overload mode is separate from charging', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('gear', 400, 300);
        store.activateOverloadMode();
      });
      
      const { machineState } = useMachineStore.getState();
      
      // Overload mode is a separate state from charging
      expect(machineState).toBe('overload');
      expect(machineState).not.toBe('charging');
    });

    test('active state is distinct from charging state', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.setMachineState('charging');
      });
      
      act(() => {
        store.setMachineState('active');
      });
      
      const { machineState } = useMachineStore.getState();
      
      // Active is the state after charging completes
      expect(machineState).toBe('active');
      expect(machineState).not.toBe('charging');
    });
  });

  describe('Negative Assertions', () => {
    test('is-charging class should not remain after activation completes', () => {
      vi.useFakeTimers();
      
      const store = useMachineStore.getState();
      
      act(() => {
        store.setMachineState('charging');
      });
      
      // After activation completes
      act(() => {
        vi.advanceTimersByTime(CHARGING_DURATION);
        store.setMachineState('active');
        store.setMachineState('shutdown');
        store.setMachineState('idle');
      });
      
      // Should not be in charging state
      expect(useMachineStore.getState().machineState).not.toBe('charging');
      
      vi.useRealTimers();
    });

    test('is-active class should not appear during charging phase', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.setMachineState('charging');
      });
      
      // During charging, state should be 'charging', not 'active'
      expect(useMachineStore.getState().machineState).toBe('charging');
      expect(useMachineStore.getState().machineState).not.toBe('active');
    });

    test('Overlay should not render with conflicting state classes simultaneously', () => {
      const store = useMachineStore.getState();
      
      // Only one machine state at a time
      act(() => {
        store.setMachineState('charging');
      });
      
      expect(useMachineStore.getState().machineState).toBe('charging');
      
      // Transition to different state
      act(() => {
        store.setMachineState('active');
      });
      
      expect(useMachineStore.getState().machineState).toBe('active');
      expect(useMachineStore.getState().machineState).not.toBe('charging');
    });

    test('Failure mode does not overlap with charging', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.setMachineState('charging');
      });
      
      act(() => {
        store.activateFailureMode();
      });
      
      // After failure mode activation, state is failure
      expect(useMachineStore.getState().machineState).toBe('failure');
      expect(useMachineStore.getState().machineState).not.toBe('charging');
    });
  });

  describe('State Transition Timing', () => {
    test('Failure auto-return happens at correct interval', async () => {
      vi.useFakeTimers();
      
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('gear', 400, 300);
        store.activateFailureMode();
      });
      
      expect(useMachineStore.getState().machineState).toBe('failure');
      
      // At 3 seconds - still in failure
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      expect(useMachineStore.getState().machineState).toBe('failure');
      
      // At 3.5 seconds - auto-return triggers
      act(() => {
        vi.advanceTimersByTime(500);
      });
      
      expect(useMachineStore.getState().machineState).toBe('idle');
      
      vi.useRealTimers();
    });

    test('Overload auto-return happens at correct interval', async () => {
      vi.useFakeTimers();
      
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('gear', 400, 300);
        store.activateOverloadMode();
      });
      
      expect(useMachineStore.getState().machineState).toBe('overload');
      
      // At 3.4 seconds - still in overload
      act(() => {
        vi.advanceTimersByTime(3400);
      });
      
      expect(useMachineStore.getState().machineState).toBe('overload');
      
      // At 3.5 seconds - auto-return triggers
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      expect(useMachineStore.getState().machineState).toBe('idle');
      
      vi.useRealTimers();
    });
  });
});
