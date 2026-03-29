import { useCallback } from 'react';
import { useChallengeStore } from '../store/useChallengeStore';

/**
 * Challenge Tracker Hook
 * Provides methods to track challenge-relevant events throughout the application.
 * This hook integrates with the challenge system to update progress and check completion.
 */
export function useChallengeTracker() {
  const { updateProgress, challengeProgress, checkChallengeCompletion } = useChallengeStore();

  /**
   * Track when a machine is created
   * Call this after a machine is created/saved
   */
  const trackMachineCreated = useCallback(() => {
    updateProgress({ machinesCreated: challengeProgress.machinesCreated + 1 });
  }, [updateProgress, challengeProgress.machinesCreated]);

  /**
   * Track when a machine is saved to the codex
   * Call this after a machine is saved to the codex
   */
  const trackMachineSaved = useCallback(() => {
    updateProgress({ machinesSaved: challengeProgress.machinesSaved + 1 });
  }, [updateProgress, challengeProgress.machinesSaved]);

  /**
   * Track when an energy connection is created
   * Call this after a connection is established between modules
   */
  const trackConnectionCreated = useCallback(() => {
    updateProgress({ connectionsCreated: challengeProgress.connectionsCreated + 1 });
  }, [updateProgress, challengeProgress.connectionsCreated]);

  /**
   * Track when a machine is activated
   * Call this after a machine activation is triggered
   */
  const trackActivation = useCallback(() => {
    updateProgress({ activations: challengeProgress.activations + 1 });
  }, [updateProgress, challengeProgress.activations]);

  /**
   * Track when an overload effect is triggered
   * Call this when an overload happens during activation
   */
  const trackOverloadTriggered = useCallback(() => {
    updateProgress({ overloadsTriggered: challengeProgress.overloadsTriggered + 1 });
  }, [updateProgress, challengeProgress.overloadsTriggered]);

  /**
   * Track when gears are added to a machine
   * @param count - Number of gears added
   */
  const trackGearsCreated = useCallback((count: number = 1) => {
    updateProgress({ gearsCreated: challengeProgress.gearsCreated + count });
  }, [updateProgress, challengeProgress.gearsCreated]);

  /**
   * Track stability achieved
   * @param value - Stability percentage (0-100)
   * Only updates if the new value is higher than current
   */
  const trackStabilityAchieved = useCallback((value: number) => {
    if (value > challengeProgress.highestStability) {
      updateProgress({ highestStability: value });
    }
  }, [updateProgress, challengeProgress.highestStability]);

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

    return checkChallengeCompletion(challengeType, target);
  }, [checkChallengeCompletion]);

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
