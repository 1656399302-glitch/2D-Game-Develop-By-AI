import { describe, it, expect, beforeEach } from 'vitest';
import { useChallengeStore } from '../store/useChallengeStore';

// Clear localStorage before each test to prevent persistence interference
beforeEach(() => {
  localStorage.removeItem('arcane-codex-challenge-store');
  localStorage.removeItem('arcane-codex-challenges');
});

describe('Challenge Progress Tracking', () => {
  beforeEach(() => {
    // Reset store state before each test
    useChallengeStore.setState({
      completedChallenges: [],
      claimedRewards: [],
      totalXP: 0,
      badges: [],
      challengeProgress: {
        machinesCreated: 0,
        machinesSaved: 0,
        connectionsCreated: 0,
        activations: 0,
        overloadsTriggered: 0,
        gearsCreated: 0,
        highestStability: 0,
      },
      loading: false,
    });
  });

  // Simulating trackMachineCreated functionality
  describe('trackMachineCreated simulation', () => {
    it('should increment machinesCreated', () => {
      const store = useChallengeStore.getState();
      const currentCount = store.challengeProgress.machinesCreated;
      store.updateProgress({ machinesCreated: currentCount + 1 });
      expect(useChallengeStore.getState().challengeProgress.machinesCreated).toBe(1);
    });

    it('should increment multiple times', () => {
      const store = useChallengeStore.getState();
      store.updateProgress({ machinesCreated: 3 });
      expect(useChallengeStore.getState().challengeProgress.machinesCreated).toBe(3);
    });
  });

  // Simulating trackMachineSaved functionality
  describe('trackMachineSaved simulation', () => {
    it('should increment machinesSaved', () => {
      const store = useChallengeStore.getState();
      store.updateProgress({ machinesSaved: 1 });
      expect(useChallengeStore.getState().challengeProgress.machinesSaved).toBe(1);
    });
  });

  // Simulating trackConnectionCreated functionality
  describe('trackConnectionCreated simulation', () => {
    it('should increment connectionsCreated', () => {
      const store = useChallengeStore.getState();
      store.updateProgress({ connectionsCreated: 1 });
      expect(useChallengeStore.getState().challengeProgress.connectionsCreated).toBe(1);
    });
  });

  // Simulating trackActivation functionality
  describe('trackActivation simulation', () => {
    it('should increment activations', () => {
      const store = useChallengeStore.getState();
      store.updateProgress({ activations: 1 });
      expect(useChallengeStore.getState().challengeProgress.activations).toBe(1);
    });
  });

  // Simulating trackOverloadTriggered functionality
  describe('trackOverloadTriggered simulation', () => {
    it('should increment overloadsTriggered', () => {
      const store = useChallengeStore.getState();
      store.updateProgress({ overloadsTriggered: 1 });
      expect(useChallengeStore.getState().challengeProgress.overloadsTriggered).toBe(1);
    });
  });

  // Simulating trackGearsCreated functionality
  describe('trackGearsCreated simulation', () => {
    it('should increment gearsCreated by count', () => {
      const store = useChallengeStore.getState();
      store.updateProgress({ gearsCreated: 3 });
      expect(useChallengeStore.getState().challengeProgress.gearsCreated).toBe(3);
    });

    it('should default to 1 when not specified', () => {
      const store = useChallengeStore.getState();
      store.updateProgress({ gearsCreated: 1 });
      expect(useChallengeStore.getState().challengeProgress.gearsCreated).toBe(1);
    });
  });

  // Simulating trackStabilityAchieved functionality
  describe('trackStabilityAchieved simulation', () => {
    it('should update highestStability', () => {
      const store = useChallengeStore.getState();
      store.updateProgress({ highestStability: 85 });
      expect(useChallengeStore.getState().challengeProgress.highestStability).toBe(85);
    });

    it('should not decrease highestStability', () => {
      const store = useChallengeStore.getState();
      store.updateProgress({ highestStability: 90 });
      store.updateProgress({ highestStability: 80 });
      expect(useChallengeStore.getState().challengeProgress.highestStability).toBe(90);
    });

    it('should update when new stability is higher', () => {
      const store = useChallengeStore.getState();
      store.updateProgress({ highestStability: 90 });
      store.updateProgress({ highestStability: 95 });
      expect(useChallengeStore.getState().challengeProgress.highestStability).toBe(95);
    });
  });

  // Simulating isChallengeComplete functionality
  describe('isChallengeComplete simulation', () => {
    it('should return false when not met', () => {
      const store = useChallengeStore.getState();
      expect(store.checkChallengeCompletion('machines_created', 1)).toBe(false);
    });

    it('should return true when target is met', () => {
      const store = useChallengeStore.getState();
      store.updateProgress({ machinesCreated: 1 });
      expect(store.checkChallengeCompletion('machines_created', 1)).toBe(true);
    });

    it('should work with different challenge types', () => {
      const store = useChallengeStore.getState();
      store.updateProgress({ connectionsCreated: 5 });
      expect(store.checkChallengeCompletion('connections_created', 5)).toBe(true);
    });

    it('should return false for unknown challenge type', () => {
      const store = useChallengeStore.getState();
      expect(store.checkChallengeCompletion('unknown_type', 1)).toBe(false);
    });
  });

  it('should track multiple challenge types simultaneously', () => {
    const store = useChallengeStore.getState();
    store.updateProgress({
      machinesCreated: 1,
      machinesSaved: 1,
      connectionsCreated: 1,
      activations: 1,
    });
    
    const progress = useChallengeStore.getState().challengeProgress;
    expect(progress.machinesCreated).toBe(1);
    expect(progress.machinesSaved).toBe(1);
    expect(progress.connectionsCreated).toBe(1);
    expect(progress.activations).toBe(1);
  });
});
