import { useCallback, useRef } from 'react';
import { useChallengeStore } from '../store/useChallengeStore';

/**
 * Challenge Tracker Hook
 * Provides methods to track challenge-relevant events throughout the application.
 * This hook integrates with the challenge system to update progress and check completion.
 * 
 * FIXED: Uses ref-based store access pattern to prevent React update loops.
 * - Uses refs for stable references to store methods
 * - Uses getState() inside callbacks to read current values
 * - No full store subscriptions that trigger re-renders
 */
export function useChallengeTracker() {
  // Use refs for stable references to store methods
  const updateProgressRef = useRef(useChallengeStore.getState().updateProgress);
  const checkChallengeCompletionRef = useRef(useChallengeStore.getState().checkChallengeCompletion);

  /**
   * Track when a machine is created
   * Call this after a machine is created/saved
   */
  const trackMachineCreated = useCallback(() => {
    const state = useChallengeStore.getState();
    updateProgressRef.current({ machinesCreated: state.challengeProgress.machinesCreated + 1 });
  }, []);

  /**
   * Track when a machine is saved to the codex
   * Call this after a machine is saved to the codex
   */
  const trackMachineSaved = useCallback(() => {
    const state = useChallengeStore.getState();
    updateProgressRef.current({ machinesSaved: state.challengeProgress.machinesSaved + 1 });
  }, []);

  /**
   * Track when an energy connection is created
   * Call this after a connection is established between modules
   */
  const trackConnectionCreated = useCallback(() => {
    const state = useChallengeStore.getState();
    updateProgressRef.current({ connectionsCreated: state.challengeProgress.connectionsCreated + 1 });
  }, []);

  /**
   * Track when a machine is activated
   * Call this after a machine activation is triggered
   */
  const trackActivation = useCallback(() => {
    const state = useChallengeStore.getState();
    updateProgressRef.current({ activations: state.challengeProgress.activations + 1 });
  }, []);

  /**
   * Track when an overload effect is triggered
   * Call this when an overload happens during activation
   */
  const trackOverloadTriggered = useCallback(() => {
    const state = useChallengeStore.getState();
    updateProgressRef.current({ overloadsTriggered: state.challengeProgress.overloadsTriggered + 1 });
  }, []);

  /**
   * Track when gears are added to a machine
   * @param count - Number of gears added
   */
  const trackGearsCreated = useCallback((count: number = 1) => {
    const state = useChallengeStore.getState();
    updateProgressRef.current({ gearsCreated: state.challengeProgress.gearsCreated + count });
  }, []);

  /**
   * Track stability achieved
   * @param value - Stability percentage (0-100)
   * Only updates if the new value is higher than current
   */
  const trackStabilityAchieved = useCallback((value: number) => {
    const state = useChallengeStore.getState();
    if (value > state.challengeProgress.highestStability) {
      updateProgressRef.current({ highestStability: value });
    }
  }, []);

  /**
   * Check if a specific challenge is now complete
   * @param challengeType - The challenge type to check
   * @returns true if the challenge condition is met
   */
  const isChallengeComplete = useCallback((challengeType: string) => {
    // Map challenge types to their target values
    const targetMap: Record<string, number> = {
      'first-machine': 1,
      'energy-master': 5,
      'codex-entry': 3,
      'golden-gear': 5,
      'overload-specialist': 1,
      'stability-master': 95,
      'legendary-forge': 10,
      'activation-king': 50,
    };

    const target = targetMap[challengeType];
    if (target === undefined) return false;

    return checkChallengeCompletionRef.current(challengeType, target);
  }, []);

  return {
    trackMachineCreated,
    trackMachineSaved,
    trackConnectionCreated,
    trackActivation,
    trackOverloadTriggered,
    trackGearsCreated,
    trackStabilityAchieved,
    isChallengeComplete,
  };
}

export default useChallengeTracker;
