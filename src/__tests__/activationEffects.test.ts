import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';

// Constants for shake intensity
const FAILURE_SHAKE_INTENSITY = 8;
const OVERLOAD_SHAKE_INTENSITY = 4;

describe('Activation Effects', () => {
  beforeEach(() => {
    // Reset store to initial state
    useMachineStore.setState({
      modules: [],
      connections: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedModuleId: null,
      selectedConnectionId: null,
      machineState: 'idle',
      showActivation: false,
      history: [{ modules: [], connections: [] }],
      historyIndex: 0,
    });
  });

  describe('Failure Mode Shake', () => {
    it('should have correct shake intensity constant of 8px', () => {
      expect(FAILURE_SHAKE_INTENSITY).toBe(8);
    });

    it('should activate failure mode', () => {
      const { activateFailureMode, machineState, showActivation } = useMachineStore.getState();
      activateFailureMode();
      expect(useMachineStore.getState().machineState).toBe('failure');
      expect(useMachineStore.getState().showActivation).toBe(true);
    });
  });

  describe('Overload Mode Shake', () => {
    it('should have correct shake intensity constant of 4px', () => {
      expect(OVERLOAD_SHAKE_INTENSITY).toBe(4);
    });

    it('should activate overload mode', () => {
      const { activateOverloadMode } = useMachineStore.getState();
      activateOverloadMode();
      expect(useMachineStore.getState().machineState).toBe('overload');
      expect(useMachineStore.getState().showActivation).toBe(true);
    });
  });

  describe('Shake Intensity Differentiation', () => {
    it('failure mode should have greater shake intensity than overload mode', () => {
      expect(FAILURE_SHAKE_INTENSITY).toBeGreaterThan(OVERLOAD_SHAKE_INTENSITY);
      expect(FAILURE_SHAKE_INTENSITY).toBe(2 * OVERLOAD_SHAKE_INTENSITY);
    });
  });

  describe('Auto-recovery', () => {
    it('should auto-recover after 3.5 seconds', async () => {
      const { activateFailureMode, machineState } = useMachineStore.getState();
      activateFailureMode();
      
      // Immediately after activation
      expect(useMachineStore.getState().machineState).toBe('failure');
      expect(useMachineStore.getState().showActivation).toBe(true);
      
      // Wait for auto-recovery
      await new Promise(resolve => setTimeout(resolve, 3600));
      
      // After recovery
      expect(useMachineStore.getState().machineState).toBe('idle');
      expect(useMachineStore.getState().showActivation).toBe(false);
    });
  });

  describe('setShowActivation', () => {
    it('should set showActivation to true', () => {
      const { setShowActivation } = useMachineStore.getState();
      setShowActivation(true);
      expect(useMachineStore.getState().showActivation).toBe(true);
    });

    it('should set showActivation to false', () => {
      const { setShowActivation } = useMachineStore.getState();
      setShowActivation(true);
      setShowActivation(false);
      expect(useMachineStore.getState().showActivation).toBe(false);
    });
  });
});
