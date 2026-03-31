/**
 * Tech Bonus System Tests
 * 
 * Tests for the tech tree bonus system in useFactionReputationStore.
 * Validates bonus calculation, module-faction interactions, and tier replacement logic.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useFactionReputationStore, TECH_BONUS_PER_TIER, BonusStatType } from '../store/useFactionReputationStore';
import { RESEARCH_DURATION_MS } from '../types/factionReputation';
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

// Helper to compare floating point numbers
function expectCloseTo(actual: number, expected: number, epsilon = 0.0001) {
  expect(Math.abs(actual - expected)).toBeLessThan(epsilon);
}

describe('Tech Bonus System', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    resetStore();
  });

  describe('getUnlockedTechTiers', () => {
    it('returns 0 when no tech is completed for a faction', () => {
      const result = useFactionReputationStore.getState().getUnlockedTechTiers('void');
      expect(result).toBe(0);
    });

    it('returns 1 when only T1 is completed', () => {
      completeResearch('void', 1);
      const result = useFactionReputationStore.getState().getUnlockedTechTiers('void');
      expect(result).toBe(1);
    });

    it('returns 2 when T1 and T2 are completed (T1+T2)', () => {
      completeResearch('void', 1);
      completeResearch('void', 2);
      const result = useFactionReputationStore.getState().getUnlockedTechTiers('void');
      expect(result).toBe(2);
    });

    it('returns 3 when all tiers are completed (T1+T2+T3)', () => {
      completeResearch('void', 1);
      completeResearch('void', 2);
      completeResearch('void', 3);
      const result = useFactionReputationStore.getState().getUnlockedTechTiers('void');
      expect(result).toBe(3);
    });

    it('returns correct tier when only T2 is completed (skipping T1)', () => {
      // Manually add T2 to completed without T1
      useFactionReputationStore.setState({
        completedResearch: {
          ...useFactionReputationStore.getState().completedResearch,
          void: ['void-tier-2'],
        },
      });
      const result = useFactionReputationStore.getState().getUnlockedTechTiers('void');
      expect(result).toBe(2);
    });

    it('returns 0 for faction with no completed research', () => {
      completeResearch('void', 1);
      const result = useFactionReputationStore.getState().getUnlockedTechTiers('inferno');
      expect(result).toBe(0);
    });
  });

  describe('getTechBonus', () => {
    it('returns 0 for neutral modules (no faction)', () => {
      const result = useFactionReputationStore.getState().getTechBonus('gear', 'power_output');
      expect(result).toBe(0);
    });

    it('returns 0 when no tech completed for module faction', () => {
      const result = useFactionReputationStore.getState().getTechBonus('void-siphon', 'power_output');
      expect(result).toBe(0);
    });

    it('returns T1 bonus (5%) when T1 completed', () => {
      completeResearch('void', 1);
      const result = useFactionReputationStore.getState().getTechBonus('void-siphon', 'power_output');
      expect(result).toBe(0.05);
    });

    it('returns T2 bonus (10%) when T1+T2 completed - T2 REPLACES T1', () => {
      completeResearch('void', 1);
      completeResearch('void', 2);
      const result = useFactionReputationStore.getState().getTechBonus('void-siphon', 'power_output');
      // Should be 10%, NOT 15% (T2 replaces T1, doesn't stack)
      expect(result).toBe(0.10);
    });

    it('returns T3 bonus (15%) when T1+T2+T3 completed - T3 REPLACES T2', () => {
      completeResearch('void', 1);
      completeResearch('void', 2);
      completeResearch('void', 3);
      const result = useFactionReputationStore.getState().getTechBonus('void-siphon', 'power_output');
      // Should be 15%, NOT 25% (T3 replaces T2, doesn't stack)
      expect(result).toBe(0.15);
    });

    it('returns correct bonuses for all stat types at T1', () => {
      completeResearch('void', 1);
      const stats: BonusStatType[] = ['power_output', 'stability', 'energy_efficiency', 'glow_intensity', 'animation_speed'];
      
      for (const stat of stats) {
        const result = useFactionReputationStore.getState().getTechBonus('void-siphon', stat);
        expect(result).toBe(TECH_BONUS_PER_TIER[1][stat]);
      }
    });

    it('returns correct bonuses for all stat types at T2', () => {
      completeResearch('void', 2);
      const stats: BonusStatType[] = ['power_output', 'stability', 'energy_efficiency', 'glow_intensity', 'animation_speed'];
      
      for (const stat of stats) {
        const result = useFactionReputationStore.getState().getTechBonus('void-siphon', stat);
        expect(result).toBe(TECH_BONUS_PER_TIER[2][stat]);
      }
    });

    it('returns correct bonuses for all stat types at T3', () => {
      completeResearch('void', 3);
      const stats: BonusStatType[] = ['power_output', 'stability', 'energy_efficiency', 'glow_intensity', 'animation_speed'];
      
      for (const stat of stats) {
        const result = useFactionReputationStore.getState().getTechBonus('void-siphon', stat);
        expect(result).toBe(TECH_BONUS_PER_TIER[3][stat]);
      }
    });

    it('bonus is per-faction, not per-module', () => {
      completeResearch('void', 2);
      // Both void-siphon and phase-modulator are void modules
      const siphonBonus = useFactionReputationStore.getState().getTechBonus('void-siphon', 'power_output');
      const modulatorBonus = useFactionReputationStore.getState().getTechBonus('phase-modulator', 'power_output');
      expect(siphonBonus).toBe(modulatorBonus);
    });
  });

  describe('getTotalTechBonus (multi-faction machines)', () => {
    it('returns 0 for empty module list', () => {
      const result = useFactionReputationStore.getState().getTotalTechBonus([], 'power_output');
      expect(result).toBe(0);
    });

    it('returns single faction bonus for single-faction modules', () => {
      completeResearch('void', 2);
      const result = useFactionReputationStore.getState().getTotalTechBonus(
        ['void-siphon', 'phase-modulator'],
        'power_output'
      );
      expect(result).toBe(0.10);
    });

    it('sums bonuses from multiple factions - T2 Void + T1 Inferno = 15%', () => {
      completeResearch('void', 2);
      completeResearch('inferno', 1);
      const result = useFactionReputationStore.getState().getTotalTechBonus(
        ['void-siphon', 'core-furnace'],
        'power_output'
      );
      // Void T2 = 10%, Inferno T1 = 5%, Total = 15%
      expectCloseTo(result, 0.15);
    });

    it('each faction contributes its highest tier independently', () => {
      completeResearch('void', 3); // 15%
      completeResearch('inferno', 1); // 5%
      completeResearch('storm', 2); // 10%
      const result = useFactionReputationStore.getState().getTotalTechBonus(
        ['void-siphon', 'core-furnace', 'energy-pipe'],
        'power_output'
      );
      // 15% + 5% + 10% = 30%
      expectCloseTo(result, 0.30);
    });

    it('ignores duplicate factions in module list', () => {
      completeResearch('void', 2);
      const result = useFactionReputationStore.getState().getTotalTechBonus(
        ['void-siphon', 'phase-modulator', 'void-siphon'],
        'power_output'
      );
      // Should count void only once: 10%
      expect(result).toBe(0.10);
    });

    it('ignores neutral modules in bonus calculation', () => {
      completeResearch('void', 2);
      const result = useFactionReputationStore.getState().getTotalTechBonus(
        ['void-siphon', 'gear', 'rune-node'],
        'power_output'
      );
      // Only void-siphon counts: 10%
      expect(result).toBe(0.10);
    });

    it('only counts factions with completed tech', () => {
      completeResearch('void', 2);
      // inferno has no tech
      const result = useFactionReputationStore.getState().getTotalTechBonus(
        ['void-siphon', 'core-furnace'],
        'power_output'
      );
      // Only void counts: 10%
      expect(result).toBe(0.10);
    });
  });

  describe('getActiveBonusesForFaction', () => {
    it('returns all zeros when no tech completed', () => {
      const result = useFactionReputationStore.getState().getActiveBonusesForFaction('void');
      expect(result).toEqual({
        power_output: 0,
        stability: 0,
        energy_efficiency: 0,
        glow_intensity: 0,
        animation_speed: 0,
      });
    });

    it('returns T1 bonuses for T1 completed', () => {
      completeResearch('void', 1);
      const result = useFactionReputationStore.getState().getActiveBonusesForFaction('void');
      expect(result).toEqual(TECH_BONUS_PER_TIER[1]);
    });

    it('returns T2 bonuses for T2 completed', () => {
      completeResearch('void', 2);
      const result = useFactionReputationStore.getState().getActiveBonusesForFaction('void');
      expect(result).toEqual(TECH_BONUS_PER_TIER[2]);
    });

    it('returns T3 bonuses for T3 completed', () => {
      completeResearch('void', 3);
      const result = useFactionReputationStore.getState().getActiveBonusesForFaction('void');
      expect(result).toEqual(TECH_BONUS_PER_TIER[3]);
    });
  });

  describe('Module-Faction Independence (Critical for Cross-Faction Machines)', () => {
    it('adding modules of one faction does not affect bonuses for another', () => {
      // Setup: Void T2, Inferno T1
      completeResearch('void', 2);
      completeResearch('inferno', 1);
      
      // Get initial total bonus
      const initialBonus = useFactionReputationStore.getState().getTotalTechBonus(
        ['void-siphon', 'core-furnace'],
        'power_output'
      );
      expectCloseTo(initialBonus, 0.15); // 10% + 5%
      
      // Add another void module - bonus should not disappear
      const withExtraVoid = useFactionReputationStore.getState().getTotalTechBonus(
        ['void-siphon', 'phase-modulator', 'core-furnace'],
        'power_output'
      );
      expectCloseTo(withExtraVoid, 0.15); // Still 10% + 5%
      
      // Add another inferno module - bonus should add correctly
      const withExtraInferno = useFactionReputationStore.getState().getTotalTechBonus(
        ['void-siphon', 'core-furnace', 'fire-crystal'],
        'power_output'
      );
      expectCloseTo(withExtraInferno, 0.15); // Still 10% + 5% (same faction)
    });

    it('removing modules of one faction does not affect bonuses for another', () => {
      // Setup: Void T2, Inferno T1
      completeResearch('void', 2);
      completeResearch('inferno', 1);
      
      // Start with mixed machine
      const mixedBonus = useFactionReputationStore.getState().getTotalTechBonus(
        ['void-siphon', 'core-furnace'],
        'power_output'
      );
      expectCloseTo(mixedBonus, 0.15);
      
      // Remove inferno module - void bonus should persist
      const voidOnlyBonus = useFactionReputationStore.getState().getTotalTechBonus(
        ['void-siphon'],
        'power_output'
      );
      expectCloseTo(voidOnlyBonus, 0.10); // Only void T2
      
      // Remove void module - inferno bonus should persist
      const infernoOnlyBonus = useFactionReputationStore.getState().getTotalTechBonus(
        ['core-furnace'],
        'power_output'
      );
      expectCloseTo(infernoOnlyBonus, 0.05); // Only inferno T1
    });

    it('machine with 3+ factions calculates each independently', () => {
      completeResearch('void', 3);
      completeResearch('inferno', 2);
      completeResearch('storm', 1);
      
      const result = useFactionReputationStore.getState().getTotalTechBonus(
        ['void-siphon', 'core-furnace', 'energy-pipe'],
        'power_output'
      );
      
      // 15% (void T3) + 10% (inferno T2) + 5% (storm T1) = 30%
      expectCloseTo(result, 0.30);
    });
  });

  describe('Tech Reset Behavior', () => {
    it('resetFactionTech removes all completed research for faction', () => {
      completeResearch('void', 1);
      completeResearch('void', 2);
      completeResearch('void', 3);
      
      expect(useFactionReputationStore.getState().getUnlockedTechTiers('void')).toBe(3);
      
      useFactionReputationStore.getState().resetFactionTech('void');
      
      expect(useFactionReputationStore.getState().getUnlockedTechTiers('void')).toBe(0);
      expect(useFactionReputationStore.getState().getTechBonus('void-siphon', 'power_output')).toBe(0);
    });

    it('resetFactionTech does not affect other factions', () => {
      completeResearch('void', 3);
      completeResearch('inferno', 2);
      
      useFactionReputationStore.getState().resetFactionTech('void');
      
      expect(useFactionReputationStore.getState().getUnlockedTechTiers('void')).toBe(0);
      expect(useFactionReputationStore.getState().getUnlockedTechTiers('inferno')).toBe(2);
    });

    it('resetReputation also resets tech', () => {
      completeResearch('void', 3);
      
      expect(useFactionReputationStore.getState().getUnlockedTechTiers('void')).toBe(3);
      
      useFactionReputationStore.getState().resetReputation('void');
      
      expect(useFactionReputationStore.getState().getUnlockedTechTiers('void')).toBe(0);
    });

    it('resetAllReputations resets all tech', () => {
      completeResearch('void', 3);
      completeResearch('inferno', 2);
      completeResearch('storm', 1);
      
      useFactionReputationStore.getState().resetAllReputations();
      
      expect(useFactionReputationStore.getState().getUnlockedTechTiers('void')).toBe(0);
      expect(useFactionReputationStore.getState().getUnlockedTechTiers('inferno')).toBe(0);
      expect(useFactionReputationStore.getState().getUnlockedTechTiers('storm')).toBe(0);
    });
  });

  describe('Bonus Persistence', () => {
    it('bonus state is preserved in store', () => {
      completeResearch('void', 2);
      
      const bonus = useFactionReputationStore.getState().getTechBonus('void-siphon', 'power_output');
      expect(bonus).toBe(0.10);
      
      // Simulate store access (which would happen on re-render)
      const state = useFactionReputationStore.getState();
      expect(state.getTechBonus('void-siphon', 'power_output')).toBe(0.10);
    });
  });
});
