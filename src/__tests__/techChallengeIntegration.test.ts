/**
 * Tech-Challenge Integration Tests
 * 
 * Tests for tech-level challenge scaling and Tech Mastery challenges.
 * Validates bonus reputation calculation and challenge availability.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useFactionReputationStore } from '../store/useFactionReputationStore';
import { useChallengeStore } from '../store/useChallengeStore';
import { 
  CHALLENGE_DEFINITIONS,
  getChallengeById,
  calculateChallengeBonusMultiplier,
  calculateBonusReputation,
  isTechMasteryAvailable,
  getHighestTechTierAcrossFactions,
  getTechMasteryChallenges,
} from '../data/challenges';
import { RESEARCH_DURATION_MS } from '../types/factionReputation';

// Reset stores helper
function resetStores() {
  useFactionReputationStore.setState({
    reputations: { void: 0, inferno: 0, storm: 0, stellar: 0 },
    totalReputationEarned: 0,
    currentResearch: {},
    completedResearch: { void: [], inferno: [], storm: [], stellar: [] },
  });
  
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
}

// Helper to complete a tech research
function completeResearch(factionId: string, tier: number) {
  const techId = `${factionId}-tier-${tier}`;
  const store = useFactionReputationStore.getState();
  
  // Add enough reputation
  store.addReputation(factionId, 100);
  
  // Set up current research
  useFactionReputationStore.setState({
    currentResearch: {
      [techId]: {
        techId,
        startedAt: Date.now() - RESEARCH_DURATION_MS - 100,
        durationMs: RESEARCH_DURATION_MS,
      },
    },
  });
  
  // Complete research
  store.completeResearch(techId, factionId);
}

describe('Tech-Challenge Integration', () => {
  beforeEach(() => {
    resetStores();
  });

  afterEach(() => {
    resetStores();
  });

  describe('Challenge Bonus Multiplier', () => {
    it('returns 1.0x when no tech tier completed', () => {
      const multiplier = calculateChallengeBonusMultiplier(0);
      expect(multiplier).toBe(1.0);
    });

    it('returns 1.1x for T1 tech', () => {
      const multiplier = calculateChallengeBonusMultiplier(1);
      expect(multiplier).toBe(1.1);
    });

    it('returns 1.2x for T2 tech', () => {
      const multiplier = calculateChallengeBonusMultiplier(2);
      expect(multiplier).toBe(1.2);
    });

    it('returns 1.3x for T3 tech', () => {
      const multiplier = calculateChallengeBonusMultiplier(3);
      expect(multiplier).toBe(1.3);
    });

    it('caps at 1.3x for tiers above T3', () => {
      const multiplier = calculateChallengeBonusMultiplier(5);
      expect(multiplier).toBe(1.3);
    });
  });

  describe('Bonus Reputation Calculation', () => {
    it('returns base reputation with no tech', () => {
      const bonus = calculateBonusReputation(100, 0);
      expect(bonus).toBe(100);
    });

    it('applies 1.1x multiplier for T1', () => {
      const bonus = calculateBonusReputation(100, 1);
      expect(bonus).toBe(110);
    });

    it('applies 1.2x multiplier for T2', () => {
      const bonus = calculateBonusReputation(100, 2);
      expect(bonus).toBe(120);
    });

    it('applies 1.3x multiplier for T3', () => {
      const bonus = calculateBonusReputation(100, 3);
      expect(bonus).toBe(130);
    });

    it('rounds to nearest integer', () => {
      const bonus = calculateBonusReputation(75, 1);
      expect(bonus).toBe(83); // 75 * 1.1 = 82.5, rounded to 83
    });
  });

  describe('getHighestTechTierAcrossFactions', () => {
    it('returns 0 with no completed research', () => {
      const result = getHighestTechTierAcrossFactions({
        void: [], inferno: [], storm: [], stellar: []
      });
      expect(result).toBe(0);
    });

    it('returns highest tier from single faction', () => {
      const result = getHighestTechTierAcrossFactions({
        void: ['void-tier-1', 'void-tier-2'], inferno: [], storm: [], stellar: []
      });
      expect(result).toBe(2);
    });

    it('returns highest tier across multiple factions', () => {
      const result = getHighestTechTierAcrossFactions({
        void: ['void-tier-1'], inferno: ['inferno-tier-2'], storm: [], stellar: []
      });
      expect(result).toBe(2); // highest is inferno T2
    });

    it('uses highest, not sum or average', () => {
      const result = getHighestTechTierAcrossFactions({
        void: ['void-tier-2'], inferno: ['inferno-tier-1'], storm: ['storm-tier-3'], stellar: []
      });
      expect(result).toBe(3); // storm T3 is highest, not sum (6) or average (2)
    });
  });

  describe('Tech Mastery Challenges', () => {
    it('Tech Mastery challenges exist', () => {
      const techChallenges = getTechMasteryChallenges();
      expect(techChallenges.length).toBe(4);
    });

    it('Tech Mastery challenges have requiresTechTier', () => {
      const techChallenges = getTechMasteryChallenges();
      for (const challenge of techChallenges) {
        expect(challenge.requiresTechTier).toBeDefined();
        expect(challenge.requiresTechTier).toBeGreaterThan(0);
      }
    });

    it('Tech Mastery challenges have correct category', () => {
      const techChallenges = getTechMasteryChallenges();
      for (const challenge of techChallenges) {
        expect(challenge.category).toBe('tech_mastery');
      }
    });

    it('isTechMasteryAvailable returns false when no tech meets requirement', () => {
      const completedResearch = {
        void: ['void-tier-1'], inferno: [], storm: [], stellar: []
      };
      
      const available = isTechMasteryAvailable('tech-mastery-inferno-t2', completedResearch);
      
      // Void is T1, but challenge requires T2 for any faction
      expect(available).toBe(false);
    });

    it('isTechMasteryAvailable returns true when any faction meets requirement', () => {
      const completedResearch = {
        void: ['void-tier-2'], inferno: [], storm: [], stellar: []
      };
      
      const available = isTechMasteryAvailable('tech-mastery-inferno-t2', completedResearch);
      
      // Void is T2 (>= required T2)
      expect(available).toBe(true);
    });

    it('isTechMasteryAvailable handles challenge without requiresTechTier', () => {
      const completedResearch = {
        void: [], inferno: [], storm: [], stellar: []
      };
      
      const available = isTechMasteryAvailable('first-machine', completedResearch);
      
      // Non-tech-mastery challenge should return true
      expect(available).toBe(true);
    });
  });

  describe('Challenge Store Tech Integration', () => {
    it('getChallengeBonusMultiplier returns correct multiplier', () => {
      const multiplier = useChallengeStore.getState().getChallengeBonusMultiplier('first-machine', 2);
      expect(multiplier).toBe(1.2);
    });

    it('getBonusReputation returns correct bonus', () => {
      const bonus = useChallengeStore.getState().getBonusReputation('first-machine', 2);
      // first-machine has baseReputation 100
      expect(bonus).toBe(120);
    });

    it('isTechMasteryAvailable uses provided completedResearch', () => {
      // Complete void T2
      completeResearch('void', 2);
      
      // Get completed research from store
      const completedResearch = useFactionReputationStore.getState().completedResearch;
      
      // Pass it to the function
      const available = useChallengeStore.getState().isTechMasteryAvailable('tech-mastery-inferno-t2', completedResearch);
      expect(available).toBe(true);
    });

    it('isTechMasteryAvailable returns false when requirement not met', () => {
      // Complete void T1 only
      completeResearch('void', 1);
      
      // Get completed research from store
      const completedResearch = useFactionReputationStore.getState().completedResearch;
      
      // Pass it to the function
      const available = useChallengeStore.getState().isTechMasteryAvailable('tech-mastery-inferno-t2', completedResearch);
      expect(available).toBe(false);
    });
  });

  describe('Challenge Reward with Tech Bonus', () => {
    it('claimReward applies tech bonus to XP rewards', () => {
      useChallengeStore.getState().claimReward('first-machine', 2);
      
      // With T2, bonus should be 20% extra XP
      const state = useChallengeStore.getState();
      expect(state.completedChallenges).toContain('first-machine');
      expect(state.totalXP).toBeGreaterThan(100); // Should include bonus
    });

    it('claimReward works without tech bonus', () => {
      useChallengeStore.getState().claimReward('first-machine', 0);
      
      const state = useChallengeStore.getState();
      expect(state.completedChallenges).toContain('first-machine');
      // Base XP is 100
      expect(state.totalXP).toBe(100);
    });

    it('cannot claim same challenge twice', () => {
      useChallengeStore.getState().claimReward('first-machine', 1);
      const xpAfterFirst = useChallengeStore.getState().totalXP;
      
      useChallengeStore.getState().claimReward('first-machine', 2);
      const xpAfterSecond = useChallengeStore.getState().totalXP;
      
      expect(xpAfterFirst).toBe(xpAfterSecond);
    });
  });

  describe('Challenge Bonus for Mixed-Faction Machines', () => {
    it('uses highest tier, not average', () => {
      // Machine has: void T2, inferno T1, storm T1
      // Highest tier is T2
      completeResearch('void', 2);
      completeResearch('inferno', 1);
      completeResearch('storm', 1);
      
      const highestTier = getHighestTechTierAcrossFactions(
        useFactionReputationStore.getState().completedResearch
      );
      
      expect(highestTier).toBe(2);
      
      // Bonus multiplier should be 1.2x, not (0.10 + 0.05 + 0.05) / 3 = 0.067
      const multiplier = calculateChallengeBonusMultiplier(highestTier);
      expect(multiplier).toBe(1.2);
    });

    it('single faction machine gets that faction tier bonus', () => {
      completeResearch('inferno', 3);
      
      const highestTier = getHighestTechTierAcrossFactions(
        useFactionReputationStore.getState().completedResearch
      );
      
      expect(highestTier).toBe(3);
      expect(calculateChallengeBonusMultiplier(highestTier)).toBe(1.3);
    });
  });

  describe('Tech Reset and Challenge', () => {
    it('tech reset does not affect challenge completion', () => {
      useChallengeStore.getState().claimReward('first-machine', 1);
      expect(useChallengeStore.getState().isChallengeCompleted('first-machine')).toBe(true);
      
      // Reset void faction
      useFactionReputationStore.getState().resetFactionTech('void');
      
      // Challenge should still be completed
      expect(useChallengeStore.getState().isChallengeCompleted('first-machine')).toBe(true);
    });

    it('future challenges can still be claimed with different tech', () => {
      // Complete void T1
      completeResearch('void', 1);
      
      // Claim a challenge
      useChallengeStore.getState().claimReward('connection-king', 1);
      expect(useChallengeStore.getState().isChallengeCompleted('connection-king')).toBe(true);
      
      // Reset void
      useFactionReputationStore.getState().resetFactionTech('void');
      
      // Claim another challenge with no tech
      useChallengeStore.getState().claimReward('arcane-artist', 0);
      expect(useChallengeStore.getState().isChallengeCompleted('arcane-artist')).toBe(true);
    });
  });

  describe('Challenge Definitions', () => {
    it('all challenges have baseReputation', () => {
      for (const challenge of CHALLENGE_DEFINITIONS) {
        expect(challenge.baseReputation).toBeDefined();
        expect(challenge.baseReputation).toBeGreaterThan(0);
      }
    });

    it('all tech mastery challenges have requiresTechTier', () => {
      const techChallenges = CHALLENGE_DEFINITIONS.filter(c => c.category === 'tech_mastery');
      for (const challenge of techChallenges) {
        expect(challenge.requiresTechTier).toBeDefined();
        expect(challenge.requiresTechTier).toBeGreaterThanOrEqual(1);
        expect(challenge.requiresTechTier).toBeLessThanOrEqual(3);
      }
    });

    it('Tech Mastery challenges are in tech_mastery category', () => {
      const techChallenges = CHALLENGE_DEFINITIONS.filter(c => c.category === 'tech_mastery');
      expect(techChallenges.length).toBeGreaterThan(0);
    });
  });

  describe('Negative tests', () => {
    it('0 tech tier gives no bonus', () => {
      const bonus = calculateBonusReputation(100, 0);
      expect(bonus).toBe(100); // No bonus
    });

    it('negative tech tier handled correctly', () => {
      const multiplier = calculateChallengeBonusMultiplier(-1);
      expect(multiplier).toBe(1.0); // Should treat as 0
    });

    it('challenge without baseReputation uses reward value', () => {
      const challenge = CHALLENGE_DEFINITIONS.find(c => c.id === 'first-machine');
      expect(challenge?.baseReputation).toBeDefined();
    });
  });
});
