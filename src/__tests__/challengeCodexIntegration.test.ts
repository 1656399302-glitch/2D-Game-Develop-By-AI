/**
 * Challenge-Codex Integration Tests (Round 86)
 * 
 * Tests the integration between the Challenge System and the Codex System,
 * verifying that machines used in completed challenges display "Challenge Mastery" badges.
 * 
 * Acceptance Criteria:
 * - AC-CHALLENGE-BADGE-VISIBLE: Machines created during/completed challenges display badges
 * - AC-CHALLENGE-BADGE-CONTENT: Badge displays challenge name, completion date, faction color
 * - AC-MULTI-CHALLENGE: Machine used in multiple challenges shows all badges
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useChallengeStore } from '../store/useChallengeStore';
import { useCodexStore } from '../store/useCodexStore';
import { ChallengeCompletion } from '../types/challenge';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Helper to create a mock codex entry
function createMockCodexEntry(id: string, name: string, codexId: string) {
  return {
    id,
    codexId,
    name,
    rarity: 'common' as const,
    modules: [{ id: 'mod1', instanceId: 'inst1', type: 'core-furnace' as const, x: 100, y: 100, rotation: 0, scale: 1, flipped: false, ports: [] }],
    connections: [],
    attributes: {
      name,
      rarity: 'common' as const,
      stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 20 },
      tags: ['fire'],
      description: 'Test machine',
      codexId,
    },
    createdAt: Date.now(),
  };
}

describe('Challenge-Codex Integration', () => {
  beforeEach(() => {
    // Reset stores before each test
    useChallengeStore.setState({
      completedChallenges: [],
      claimedRewards: [],
      challengeCompletions: [],
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
    });

    useCodexStore.setState({
      entries: [],
    });

    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockClear();
  });

  describe('AC-CHALLENGE-BADGE-VISIBLE: Machines created during/completed challenges display badges', () => {
    it('should return true for hasChallengeMastery when machine was used in completed challenge', () => {
      const machineId = 'machine-123';
      
      // Add a challenge completion with the machine
      const completion: ChallengeCompletion = {
        challengeId: 'first-machine',
        machinesUsed: [machineId],
        completedAt: '2024-01-01T00:00:00.000Z',
      };

      useChallengeStore.setState({
        challengeCompletions: [completion],
      });

      // Verify hasChallengeMastery returns true
      expect(useChallengeStore.getState().hasChallengeMastery(machineId)).toBe(true);
    });

    it('should return false for hasChallengeMastery when machine was never used in challenge', () => {
      const machineId = 'machine-unused';

      // No challenge completions
      useChallengeStore.setState({
        challengeCompletions: [],
      });

      // Verify hasChallengeMastery returns false
      expect(useChallengeStore.getState().hasChallengeMastery(machineId)).toBe(false);
    });

    it('should return completions for a machine via getCompletionsForMachine', () => {
      const machineId = 'machine-456';
      
      const completion: ChallengeCompletion = {
        challengeId: 'codex-entry',
        machinesUsed: [machineId],
        completedAt: '2024-01-15T10:30:00.000Z',
      };

      useChallengeStore.setState({
        challengeCompletions: [completion],
      });

      const completions = useChallengeStore.getState().getCompletionsForMachine(machineId);
      
      expect(completions).toHaveLength(1);
      expect(completions[0].challengeId).toBe('codex-entry');
    });
  });

  describe('AC-CHALLENGE-BADGE-CONTENT: Badge displays challenge name, completion date, faction color', () => {
    it('should store completion with correct timestamp format', () => {
      const machineId = 'machine-789';
      const completionTime = '2024-06-15T14:22:30.000Z';
      
      const completion: ChallengeCompletion = {
        challengeId: 'arcane-artist',
        machinesUsed: [machineId],
        completedAt: completionTime,
      };

      useChallengeStore.setState({
        challengeCompletions: [completion],
      });

      const storedCompletions = useChallengeStore.getState().challengeCompletions;
      
      expect(storedCompletions).toHaveLength(1);
      expect(storedCompletions[0].completedAt).toBe(completionTime);
    });

    it('should track machines used in challenge completion', () => {
      const machine1 = 'machine-a';
      const machine2 = 'machine-b';
      
      const completion: ChallengeCompletion = {
        challengeId: 'legendary-forge',
        machinesUsed: [machine1, machine2],
        completedAt: '2024-03-20T08:00:00.000Z',
      };

      useChallengeStore.setState({
        challengeCompletions: [completion],
      });

      // Both machines should have challenge mastery
      expect(useChallengeStore.getState().hasChallengeMastery(machine1)).toBe(true);
      expect(useChallengeStore.getState().hasChallengeMastery(machine2)).toBe(true);
    });

    it('should return correct challenge metadata via getChallengeById', async () => {
      // Import dynamically to ensure data is loaded
      const { getChallengeById } = await import('../data/challenges');
      
      const challenge = getChallengeById('void-initiate');
      
      expect(challenge).toBeDefined();
      expect(challenge?.title).toBe('虚空入门');
      expect(challenge?.category).toBe('mastery');
    });
  });

  describe('AC-MULTI-CHALLENGE: Machine used in multiple challenges shows all badges', () => {
    it('should return multiple completions for a machine used in several challenges', () => {
      const machineId = 'machine-multi';
      
      const completions: ChallengeCompletion[] = [
        {
          challengeId: 'first-machine',
          machinesUsed: [machineId],
          completedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          challengeId: 'codex-entry',
          machinesUsed: [machineId],
          completedAt: '2024-01-05T00:00:00.000Z',
        },
        {
          challengeId: 'arcane-artist',
          machinesUsed: [machineId],
          completedAt: '2024-01-10T00:00:00.000Z',
        },
      ];

      useChallengeStore.setState({
        challengeCompletions: completions,
      });

      const machineCompletions = useChallengeStore.getState().getCompletionsForMachine(machineId);
      
      expect(machineCompletions).toHaveLength(3);
      expect(machineCompletions.map(c => c.challengeId)).toEqual([
        'first-machine',
        'codex-entry',
        'arcane-artist',
      ]);
    });

    it('should correctly associate different machines with different challenges', () => {
      const machineA = 'machine-alpha';
      const machineB = 'machine-beta';
      const machineC = 'machine-gamma';
      
      const completions: ChallengeCompletion[] = [
        {
          challengeId: 'first-machine',
          machinesUsed: [machineA],
          completedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          challengeId: 'connection-king',
          machinesUsed: [machineA, machineB],
          completedAt: '2024-01-05T00:00:00.000Z',
        },
        {
          challengeId: 'golden-gear',
          machinesUsed: [machineB, machineC],
          completedAt: '2024-01-10T00:00:00.000Z',
        },
      ];

      useChallengeStore.setState({
        challengeCompletions: completions,
      });

      // Verify machine associations
      expect(useChallengeStore.getState().getCompletionsForMachine(machineA)).toHaveLength(2);
      expect(useChallengeStore.getState().getCompletionsForMachine(machineB)).toHaveLength(2);
      expect(useChallengeStore.getState().getCompletionsForMachine(machineC)).toHaveLength(1);
    });

    it('should return machines for a specific challenge via getMachinesForChallenge', () => {
      const completion: ChallengeCompletion = {
        challengeId: 'master-architect',
        machinesUsed: ['m1', 'm2', 'm3'],
        completedAt: '2024-02-01T00:00:00.000Z',
      };

      useChallengeStore.setState({
        challengeCompletions: [completion],
      });

      const machines = useChallengeStore.getState().getMachinesForChallenge('master-architect');
      
      expect(machines).toEqual(['m1', 'm2', 'm3']);
    });
  });

  describe('claimRewardWithMachines integration', () => {
    it('should create challenge completion with machines when claiming reward', () => {
      const machineIds = ['codex-machine-1', 'codex-machine-2'];
      
      // Call claimRewardWithMachines
      useChallengeStore.getState().claimRewardWithMachines('first-machine', machineIds);

      // Verify completion was created
      const completions = useChallengeStore.getState().challengeCompletions;
      
      expect(completions).toHaveLength(1);
      expect(completions[0].challengeId).toBe('first-machine');
      expect(completions[0].machinesUsed).toEqual(machineIds);
      expect(completions[0].completedAt).toBeDefined();
      
      // Verify challenge is marked as completed
      expect(useChallengeStore.getState().isChallengeCompleted('first-machine')).toBe(true);
    });

    it('should not create duplicate completions for already completed challenges', () => {
      const machineIds = ['m1', 'm2'];
      
      // First claim
      useChallengeStore.getState().claimRewardWithMachines('first-machine', machineIds);
      
      // Second claim attempt
      useChallengeStore.getState().claimRewardWithMachines('first-machine', ['m3']);

      // Should only have one completion
      const completions = useChallengeStore.getState().challengeCompletions;
      
      expect(completions).toHaveLength(1);
      expect(completions[0].machinesUsed).toEqual(machineIds);
    });
  });

  describe('Persistence and Reset', () => {
    it('should persist challenge completions in store state', () => {
      const completion: ChallengeCompletion = {
        challengeId: 'activation-king',
        machinesUsed: ['persistent-machine'],
        completedAt: '2024-04-01T12:00:00.000Z',
      };

      useChallengeStore.setState({
        challengeCompletions: [completion],
      });

      // Verify state includes completions
      expect(useChallengeStore.getState().challengeCompletions).toHaveLength(1);
    });

    it('should reset completions when resetting challenges', () => {
      const completion: ChallengeCompletion = {
        challengeId: 'first-machine',
        machinesUsed: ['reset-test'],
        completedAt: '2024-04-01T00:00:00.000Z',
      };

      useChallengeStore.setState({
        challengeCompletions: [completion],
        completedChallenges: ['first-machine'],
      });

      // Reset challenges
      useChallengeStore.getState().resetChallenges();

      // Verify completions are cleared
      expect(useChallengeStore.getState().challengeCompletions).toHaveLength(0);
      expect(useChallengeStore.getState().completedChallenges).toHaveLength(0);
    });
  });

  describe('Challenge Types', () => {
    it('should have valid ChallengeCompletion interface structure', () => {
      const completion: ChallengeCompletion = {
        challengeId: 'test-challenge',
        machinesUsed: ['m1', 'm2'],
        completedAt: new Date().toISOString(),
      };

      // Verify all required fields are present
      expect(completion).toHaveProperty('challengeId');
      expect(completion).toHaveProperty('machinesUsed');
      expect(completion).toHaveProperty('completedAt');
      
      // Verify types
      expect(typeof completion.challengeId).toBe('string');
      expect(Array.isArray(completion.machinesUsed)).toBe(true);
      expect(typeof completion.completedAt).toBe('string');
    });

    it('should accept empty machinesUsed array', () => {
      const completion: ChallengeCompletion = {
        challengeId: 'no-machine-challenge',
        machinesUsed: [],
        completedAt: '2024-05-01T00:00:00.000Z',
      };

      expect(completion.machinesUsed).toHaveLength(0);
      expect(useChallengeStore.getState().hasChallengeMastery('any-machine')).toBe(false);
    });
  });
});
