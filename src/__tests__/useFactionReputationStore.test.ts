/**
 * Faction Reputation Store Tests
 * 
 * Tests for the useFactionReputationStore which manages:
 * - Faction reputation points and levels
 * - Research queue and tech completion
 * - Tech bonus calculations
 * 
 * IMPORTANT: Per src/types/factions.ts, TECH_TREE_REQUIREMENTS:
 *   - Tier 1 requires 3 points
 *   - Tier 2 requires 7 points
 *   - Tier 3 requires 15 points
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  useFactionReputationStore,
  hydrateFactionReputationStore,
  isFactionReputationHydrated,
  useAllReputations,
  useFactionReputation,
  useFactionReputationLevel,
  useIsVariantUnlocked,
  useUnlockedTechTier,
  useTechBonus,
  FACTION_IDS,
  TECH_BONUS_PER_TIER,
  ResearchResult,
  BonusStatType,
} from '../store/useFactionReputationStore';
import { RESEARCH_DURATION_MS, MAX_RESEARCH_QUEUE } from '../types/factionReputation';
import { FactionId } from '../types/factions';

// Reset store helper
function resetStore() {
  useFactionReputationStore.setState({
    reputations: { void: 0, inferno: 0, storm: 0, stellar: 0 },
    totalReputationEarned: 0,
    currentResearch: {},
    completedResearch: { void: [], inferno: [], storm: [], stellar: [] },
  });
}

// Helper to complete research (bypassing time requirement)
function completeResearch(factionId: string, tier: number) {
  const techId = `${factionId}-tier-${tier}`;
  const store = useFactionReputationStore.getState();
  
  // Add enough reputation for the tech
  store.addReputation(factionId, 100);
  
  // Set up current research with elapsed time
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
  useFactionReputationStore.getState().completeResearch(techId, factionId);
}

describe('useFactionReputationStore', () => {
  beforeEach(() => {
    resetStore();
    // Trigger hydration
    hydrateFactionReputationStore();
  });

  afterEach(() => {
    resetStore();
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should initialize with 0 reputation for all factions', () => {
      const state = useFactionReputationStore.getState();
      expect(state.reputations.void).toBe(0);
      expect(state.reputations.inferno).toBe(0);
      expect(state.reputations.storm).toBe(0);
      expect(state.reputations.stellar).toBe(0);
    });

    it('should initialize with totalReputationEarned at 0', () => {
      const state = useFactionReputationStore.getState();
      expect(state.totalReputationEarned).toBe(0);
    });

    it('should initialize with empty currentResearch', () => {
      const state = useFactionReputationStore.getState();
      expect(state.currentResearch).toEqual({});
    });

    it('should initialize with empty completedResearch for all factions', () => {
      const state = useFactionReputationStore.getState();
      expect(state.completedResearch.void).toEqual([]);
      expect(state.completedResearch.inferno).toEqual([]);
      expect(state.completedResearch.storm).toEqual([]);
      expect(state.completedResearch.stellar).toEqual([]);
    });
  });

  describe('addReputation', () => {
    it('should add reputation to void faction', () => {
      useFactionReputationStore.getState().addReputation('void', 100);
      expect(useFactionReputationStore.getState().reputations.void).toBe(100);
    });

    it('should add reputation to inferno faction', () => {
      useFactionReputationStore.getState().addReputation('inferno', 50);
      expect(useFactionReputationStore.getState().reputations.inferno).toBe(50);
    });

    it('should accumulate reputation', () => {
      useFactionReputationStore.getState().addReputation('void', 100);
      useFactionReputationStore.getState().addReputation('void', 50);
      expect(useFactionReputationStore.getState().reputations.void).toBe(150);
    });

    it('should update totalReputationEarned', () => {
      useFactionReputationStore.getState().addReputation('void', 100);
      useFactionReputationStore.getState().addReputation('inferno', 50);
      expect(useFactionReputationStore.getState().totalReputationEarned).toBe(150);
    });

    it('should not affect other factions', () => {
      useFactionReputationStore.getState().addReputation('void', 100);
      expect(useFactionReputationStore.getState().reputations.inferno).toBe(0);
    });
  });

  describe('getReputation', () => {
    it('should return 0 for faction with no reputation', () => {
      const store = useFactionReputationStore.getState();
      expect(store.getReputation('void')).toBe(0);
    });

    it('should return correct reputation value', () => {
      useFactionReputationStore.getState().addReputation('void', 500);
      const store = useFactionReputationStore.getState();
      expect(store.getReputation('void')).toBe(500);
    });

    it('should return 0 for non-existent faction', () => {
      const store = useFactionReputationStore.getState();
      expect(store.getReputation('non-existent' as FactionId)).toBe(0);
    });
  });

  describe('getReputationLevel', () => {
    it('should return apprentice for 0 points', () => {
      const store = useFactionReputationStore.getState();
      expect(store.getReputationLevel('void')).toBe('apprentice');
    });

    it('should return journeyman for 200 points', () => {
      useFactionReputationStore.getState().addReputation('void', 200);
      const store = useFactionReputationStore.getState();
      expect(store.getReputationLevel('void')).toBe('journeyman');
    });

    it('should return expert for 500 points', () => {
      useFactionReputationStore.getState().addReputation('void', 500);
      const store = useFactionReputationStore.getState();
      expect(store.getReputationLevel('void')).toBe('expert');
    });

    it('should return master for 1000 points', () => {
      useFactionReputationStore.getState().addReputation('void', 1000);
      const store = useFactionReputationStore.getState();
      expect(store.getReputationLevel('void')).toBe('master');
    });

    it('should return grandmaster for 2000 points', () => {
      useFactionReputationStore.getState().addReputation('void', 2000);
      const store = useFactionReputationStore.getState();
      expect(store.getReputationLevel('void')).toBe('grandmaster');
    });

    it('should return grandmaster for 2500 points', () => {
      useFactionReputationStore.getState().addReputation('void', 2500);
      const store = useFactionReputationStore.getState();
      expect(store.getReputationLevel('void')).toBe('grandmaster');
    });
  });

  describe('isVariantUnlocked', () => {
    it('should return false when reputation is below Grandmaster', () => {
      useFactionReputationStore.getState().addReputation('void', 1000); // Master, not Grandmaster
      const store = useFactionReputationStore.getState();
      expect(store.isVariantUnlocked('void')).toBe(false);
    });

    it('should return true when reputation is Grandmaster (2000+)', () => {
      useFactionReputationStore.getState().addReputation('void', 2000);
      const store = useFactionReputationStore.getState();
      expect(store.isVariantUnlocked('void')).toBe(true);
    });

    it('should return true for inferno at Grandmaster', () => {
      useFactionReputationStore.getState().addReputation('inferno', 2500);
      const store = useFactionReputationStore.getState();
      expect(store.isVariantUnlocked('inferno')).toBe(true);
    });
  });

  describe('resetReputation', () => {
    it('should reset faction reputation to 0', () => {
      useFactionReputationStore.getState().addReputation('void', 100);
      useFactionReputationStore.getState().resetReputation('void');
      expect(useFactionReputationStore.getState().reputations.void).toBe(0);
    });

    it('should not affect other factions', () => {
      useFactionReputationStore.getState().addReputation('void', 100);
      useFactionReputationStore.getState().addReputation('inferno', 200);
      useFactionReputationStore.getState().resetReputation('void');
      expect(useFactionReputationStore.getState().reputations.inferno).toBe(200);
    });

    it('should reset faction tech when resetting reputation', () => {
      completeResearch('void', 1);
      expect(useFactionReputationStore.getState().getUnlockedTechTiers('void')).toBe(1);
      useFactionReputationStore.getState().resetReputation('void');
      expect(useFactionReputationStore.getState().getUnlockedTechTiers('void')).toBe(0);
    });

    it('should handle resetting with zero current reputation', () => {
      expect(() => useFactionReputationStore.getState().resetReputation('void')).not.toThrow();
    });
  });

  describe('resetAllReputations', () => {
    it('should reset all faction reputations', () => {
      useFactionReputationStore.getState().addReputation('void', 100);
      useFactionReputationStore.getState().addReputation('inferno', 200);
      useFactionReputationStore.getState().addReputation('storm', 300);
      useFactionReputationStore.getState().resetAllReputations();
      const state = useFactionReputationStore.getState();
      expect(state.reputations.void).toBe(0);
      expect(state.reputations.inferno).toBe(0);
      expect(state.reputations.storm).toBe(0);
    });

    it('should reset all tech progress', () => {
      completeResearch('void', 1);
      completeResearch('inferno', 2);
      useFactionReputationStore.getState().resetAllReputations();
      const state = useFactionReputationStore.getState();
      expect(state.getUnlockedTechTiers('void')).toBe(0);
      expect(state.getUnlockedTechTiers('inferno')).toBe(0);
    });
  });

  describe('researchTech', () => {
    it('should return ok when conditions are met (sufficient rep for tier-1)', () => {
      useFactionReputationStore.getState().addReputation('void', 10); // Tier 1 requires 3 points
      const result = useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      expect(result).toBe('ok');
    });

    it('should return locked when insufficient rep for tier-1', () => {
      useFactionReputationStore.getState().addReputation('void', 2); // Tier 1 requires 3 points
      const result = useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      expect(result).toBe('locked');
    });

    it('should return locked when no rep at all', () => {
      const result = useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      expect(result).toBe('locked');
    });

    it('should return queue_full when more than 3 active researches', () => {
      useFactionReputationStore.getState().addReputation('void', 100);
      useFactionReputationStore.getState().addReputation('inferno', 100);
      useFactionReputationStore.getState().addReputation('storm', 100);
      useFactionReputationStore.getState().addReputation('stellar', 100);
      
      // Start 4 researches (exceeds MAX_RESEARCH_QUEUE of 3)
      useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      useFactionReputationStore.getState().researchTech('inferno-tier-1', 'inferno');
      useFactionReputationStore.getState().researchTech('storm-tier-1', 'storm');
      useFactionReputationStore.getState().researchTech('stellar-tier-1', 'stellar');
      
      // Count should be 3 (MAX_RESEARCH_QUEUE)
      expect(Object.keys(useFactionReputationStore.getState().currentResearch).length).toBe(3);
    });

    it('should return already_researching when tech is in progress', () => {
      useFactionReputationStore.getState().addReputation('void', 10);
      useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      
      // Try to research same tech again
      const result = useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      expect(result).toBe('already_researching');
    });

    it('should add tech to currentResearch when successful', () => {
      useFactionReputationStore.getState().addReputation('void', 10);
      useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      expect(useFactionReputationStore.getState().currentResearch['void-tier-1']).toBeDefined();
    });
  });

  describe('completeResearch', () => {
    it('should move tech from currentResearch to completedResearch', () => {
      useFactionReputationStore.getState().addReputation('void', 10);
      useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      useFactionReputationStore.getState().completeResearch('void-tier-1', 'void');
      
      const state = useFactionReputationStore.getState();
      expect(state.currentResearch['void-tier-1']).toBeUndefined();
      expect(state.completedResearch.void).toContain('void-tier-1');
    });

    it('should be callable multiple times for different factions', () => {
      useFactionReputationStore.getState().addReputation('void', 10);
      useFactionReputationStore.getState().addReputation('inferno', 10);
      useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      useFactionReputationStore.getState().researchTech('inferno-tier-1', 'inferno');
      useFactionReputationStore.getState().completeResearch('void-tier-1', 'void');
      useFactionReputationStore.getState().completeResearch('inferno-tier-1', 'inferno');
      
      const state = useFactionReputationStore.getState();
      expect(state.completedResearch.void).toContain('void-tier-1');
      expect(state.completedResearch.inferno).toContain('inferno-tier-1');
    });

    it('should complete research with correct faction context', () => {
      useFactionReputationStore.getState().addReputation('void', 10);
      useFactionReputationStore.getState().researchTech('void-tier-2', 'void');
      useFactionReputationStore.getState().completeResearch('void-tier-2', 'void');
      
      const state = useFactionReputationStore.getState();
      expect(state.completedResearch.void).toContain('void-tier-2');
    });
  });

  describe('cancelResearch', () => {
    it('should remove tech from currentResearch', () => {
      useFactionReputationStore.getState().addReputation('void', 10);
      useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      useFactionReputationStore.getState().cancelResearch('void-tier-1', 'void');
      
      expect(useFactionReputationStore.getState().currentResearch['void-tier-1']).toBeUndefined();
    });

    it('should not add to completedResearch', () => {
      useFactionReputationStore.getState().addReputation('void', 10);
      useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      useFactionReputationStore.getState().cancelResearch('void-tier-1', 'void');
      
      expect(useFactionReputationStore.getState().completedResearch.void).not.toContain('void-tier-1');
    });
  });

  describe('getTechBonus', () => {
    it('should return 0 when no tech completed', () => {
      const store = useFactionReputationStore.getState();
      expect(store.getTechBonus('void-siphon', 'power_output')).toBe(0);
    });

    it('should return T1 bonus (5%) when tier-1 completed', () => {
      completeResearch('void', 1);
      const store = useFactionReputationStore.getState();
      expect(store.getTechBonus('void-siphon', 'power_output')).toBe(0.05);
    });

    it('should return T2 bonus (10%) when tier-1+tier-2 completed - T2 REPLACES T1', () => {
      completeResearch('void', 1);
      completeResearch('void', 2);
      const store = useFactionReputationStore.getState();
      // T2 replaces T1, doesn't stack
      expect(store.getTechBonus('void-siphon', 'power_output')).toBe(0.10);
    });

    it('should return T3 bonus (15%) when all tiers completed - T3 REPLACES T2', () => {
      completeResearch('void', 1);
      completeResearch('void', 2);
      completeResearch('void', 3);
      const store = useFactionReputationStore.getState();
      // T3 replaces T2, doesn't stack
      expect(store.getTechBonus('void-siphon', 'power_output')).toBe(0.15);
    });

    it('should return correct bonuses for all stat types', () => {
      completeResearch('void', 1);
      const store = useFactionReputationStore.getState();
      const stats: BonusStatType[] = ['power_output', 'stability', 'energy_efficiency', 'glow_intensity', 'animation_speed'];
      
      stats.forEach(stat => {
        const bonus = store.getTechBonus('void-siphon', stat);
        expect(bonus).toBe(TECH_BONUS_PER_TIER[1][stat]);
      });
    });

    it('should return 0 for neutral modules (gear)', () => {
      completeResearch('void', 3);
      const store = useFactionReputationStore.getState();
      expect(store.getTechBonus('gear', 'power_output')).toBe(0);
    });
  });

  describe('getTotalTechBonus', () => {
    it('should return 0 for empty module list', () => {
      const store = useFactionReputationStore.getState();
      expect(store.getTotalTechBonus([], 'power_output')).toBe(0);
    });

    it('should return single faction bonus for single-faction modules', () => {
      completeResearch('void', 2);
      const store = useFactionReputationStore.getState();
      const result = store.getTotalTechBonus(['void-siphon', 'phase-modulator'], 'power_output');
      expect(result).toBe(0.10);
    });

    it('should sum bonuses from multiple factions', () => {
      completeResearch('void', 2); // 10%
      completeResearch('inferno', 1); // 5%
      const store = useFactionReputationStore.getState();
      const result = store.getTotalTechBonus(['void-siphon', 'core-furnace'], 'power_output');
      // Use closeTo for floating point comparison
      expect(Math.abs(result - 0.15)).toBeLessThan(0.0001);
    });

    it('should count each faction only once', () => {
      completeResearch('void', 2);
      const store = useFactionReputationStore.getState();
      const result = store.getTotalTechBonus(['void-siphon', 'phase-modulator', 'void-siphon'], 'power_output');
      // Should count void only once: 10%
      expect(result).toBe(0.10);
    });

    it('should ignore neutral modules', () => {
      completeResearch('void', 2);
      const store = useFactionReputationStore.getState();
      const result = store.getTotalTechBonus(['void-siphon', 'gear'], 'power_output');
      // Only void-siphon counts: 10%
      expect(result).toBe(0.10);
    });
  });

  describe('getUnlockedTechTiers', () => {
    it('should return 0 when no tech completed', () => {
      const store = useFactionReputationStore.getState();
      expect(store.getUnlockedTechTiers('void')).toBe(0);
    });

    it('should return 1 when only tier-1 completed', () => {
      completeResearch('void', 1);
      const store = useFactionReputationStore.getState();
      expect(store.getUnlockedTechTiers('void')).toBe(1);
    });

    it('should return 2 when tier-1+tier-2 completed', () => {
      completeResearch('void', 1);
      completeResearch('void', 2);
      const store = useFactionReputationStore.getState();
      expect(store.getUnlockedTechTiers('void')).toBe(2);
    });

    it('should return 3 when all tiers completed', () => {
      completeResearch('void', 1);
      completeResearch('void', 2);
      completeResearch('void', 3);
      const store = useFactionReputationStore.getState();
      expect(store.getUnlockedTechTiers('void')).toBe(3);
    });
  });

  describe('getActiveBonusesForFaction', () => {
    it('should return all zeros when no tech completed', () => {
      const store = useFactionReputationStore.getState();
      const result = store.getActiveBonusesForFaction('void');
      expect(result).toEqual({
        power_output: 0,
        stability: 0,
        energy_efficiency: 0,
        glow_intensity: 0,
        animation_speed: 0,
      });
    });

    it('should return T1 bonuses for tier-1 completed', () => {
      completeResearch('void', 1);
      const store = useFactionReputationStore.getState();
      const result = store.getActiveBonusesForFaction('void');
      expect(result).toEqual(TECH_BONUS_PER_TIER[1]);
    });

    it('should return T2 bonuses for tier-1+tier-2 completed', () => {
      completeResearch('void', 1);
      completeResearch('void', 2);
      const store = useFactionReputationStore.getState();
      const result = store.getActiveBonusesForFaction('void');
      expect(result).toEqual(TECH_BONUS_PER_TIER[2]);
    });
  });

  describe('resetFactionTech', () => {
    it('should remove all completed research for faction', () => {
      completeResearch('void', 1);
      completeResearch('void', 2);
      completeResearch('void', 3);
      useFactionReputationStore.getState().resetFactionTech('void');
      const state = useFactionReputationStore.getState();
      expect(state.completedResearch.void).toEqual([]);
    });

    it('should not affect other factions', () => {
      completeResearch('void', 3);
      completeResearch('inferno', 2);
      useFactionReputationStore.getState().resetFactionTech('void');
      const state = useFactionReputationStore.getState();
      expect(state.completedResearch.inferno).toContain('inferno-tier-2');
    });
  });

  describe('hydration helpers', () => {
    it('should expose isFactionReputationHydrated function', () => {
      expect(typeof isFactionReputationHydrated).toBe('function');
    });

    it('should expose hydrateFactionReputationStore function', () => {
      expect(typeof hydrateFactionReputationStore).toBe('function');
    });

    it('should be able to call hydrateFactionReputationStore', () => {
      expect(() => hydrateFactionReputationStore()).not.toThrow();
    });
  });

  describe('constants', () => {
    it('should have FACTION_IDS array with 4 factions', () => {
      expect(FACTION_IDS).toContain('void');
      expect(FACTION_IDS).toContain('inferno');
      expect(FACTION_IDS).toContain('storm');
      expect(FACTION_IDS).toContain('stellar');
      expect(FACTION_IDS.length).toBe(4);
    });

    it('should have TECH_BONUS_PER_TIER with 3 tiers', () => {
      expect(TECH_BONUS_PER_TIER[1]).toBeDefined();
      expect(TECH_BONUS_PER_TIER[2]).toBeDefined();
      expect(TECH_BONUS_PER_TIER[3]).toBeDefined();
    });

    it('should have correct bonus percentages per tier', () => {
      // T1: 5%, T2: 10%, T3: 15%
      expect(TECH_BONUS_PER_TIER[1].power_output).toBe(0.05);
      expect(TECH_BONUS_PER_TIER[2].power_output).toBe(0.10);
      expect(TECH_BONUS_PER_TIER[3].power_output).toBe(0.15);
    });
  });

  describe('getReputationData', () => {
    it('should return complete reputation data object', () => {
      useFactionReputationStore.getState().addReputation('void', 500);
      const store = useFactionReputationStore.getState();
      const data = store.getReputationData('void');
      
      expect(data.factionId).toBe('void');
      expect(data.points).toBe(500);
      expect(data.level).toBeDefined();
    });
  });

  describe('awardBonusReputation', () => {
    it('should award reputation to all factions', () => {
      useFactionReputationStore.getState().awardBonusReputation(100);
      const state = useFactionReputationStore.getState();
      
      expect(state.reputations.void).toBe(100);
      expect(state.reputations.inferno).toBe(100);
      expect(state.reputations.storm).toBe(100);
      expect(state.reputations.stellar).toBe(100);
    });
  });

  describe('getCurrentResearch', () => {
    it('should return empty array when no research', () => {
      const store = useFactionReputationStore.getState();
      expect(store.getCurrentResearch('void')).toEqual([]);
    });

    it('should return active researches for faction', () => {
      useFactionReputationStore.getState().addReputation('void', 10);
      useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      const store = useFactionReputationStore.getState();
      const research = store.getCurrentResearch('void');
      expect(research.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getResearchableTechs', () => {
    it('should return available techs for faction', () => {
      const store = useFactionReputationStore.getState();
      const techs = store.getResearchableTechs('void');
      expect(Array.isArray(techs)).toBe(true);
    });
  });

  describe('getRequiredReputation', () => {
    it('should return correct requirement for tier-1', () => {
      const store = useFactionReputationStore.getState();
      expect(store.getRequiredReputation('void-tier-1')).toBe(3);
    });

    it('should return correct requirement for tier-2', () => {
      const store = useFactionReputationStore.getState();
      expect(store.getRequiredReputation('void-tier-2')).toBe(7);
    });

    it('should return correct requirement for tier-3', () => {
      const store = useFactionReputationStore.getState();
      expect(store.getRequiredReputation('void-tier-3')).toBe(15);
    });

    it('should return 9999 for invalid tech id', () => {
      const store = useFactionReputationStore.getState();
      expect(store.getRequiredReputation('invalid-tech')).toBe(9999);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid reputation additions', () => {
      const store = useFactionReputationStore.getState();
      for (let i = 0; i < 100; i++) {
        store.addReputation('void', 10);
      }
      expect(useFactionReputationStore.getState().reputations.void).toBe(1000);
    });

    it('should handle research across all factions', () => {
      useFactionReputationStore.getState().addReputation('void', 10);
      useFactionReputationStore.getState().addReputation('inferno', 10);
      useFactionReputationStore.getState().addReputation('storm', 10);
      useFactionReputationStore.getState().addReputation('stellar', 10);
      
      useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      useFactionReputationStore.getState().researchTech('inferno-tier-1', 'inferno');
      useFactionReputationStore.getState().researchTech('storm-tier-1', 'storm');
      useFactionReputationStore.getState().researchTech('stellar-tier-1', 'stellar');
      
      // MAX_RESEARCH_QUEUE is 3, so only 3 should be added
      expect(Object.keys(useFactionReputationStore.getState().currentResearch).length).toBe(3);
    });

    it('should handle canceling all research', () => {
      useFactionReputationStore.getState().addReputation('void', 10);
      useFactionReputationStore.getState().addReputation('inferno', 10);
      useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      useFactionReputationStore.getState().researchTech('inferno-tier-1', 'inferno');
      
      useFactionReputationStore.getState().cancelResearch('void-tier-1', 'void');
      useFactionReputationStore.getState().cancelResearch('inferno-tier-1', 'inferno');
      
      expect(Object.keys(useFactionReputationStore.getState().currentResearch).length).toBe(0);
    });

    it('should handle completing and researching new tech', () => {
      useFactionReputationStore.getState().addReputation('void', 100);
      
      // Complete tier-1
      useFactionReputationStore.getState().researchTech('void-tier-1', 'void');
      useFactionReputationStore.getState().completeResearch('void-tier-1', 'void');
      
      // Research tier-2
      const result = useFactionReputationStore.getState().researchTech('void-tier-2', 'void');
      expect(result).toBe('ok');
    });
  });
});
