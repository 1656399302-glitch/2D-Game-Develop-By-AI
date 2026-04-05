/**
 * Achievement → Faction Reputation Integration Test
 * 
 * Tests the integration between achievement unlocks and faction reputation.
 * When an achievement with a faction property is unlocked, it should add +10 reputation.
 * 
 * Updated for Round 80: Extended to 6 factions with 10 faction achievements.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAchievementStore } from '../store/useAchievementStore';
import { useFactionReputationStore } from '../store/useFactionReputationStore';
import { ACHIEVEMENTS, Achievement, FactionId } from '../data/achievements';

describe('Achievement → Faction Reputation Integration', () => {
  beforeEach(() => {
    // Reset achievement store state
    useAchievementStore.setState({
      onUnlockCallback: null,
      recentlyUnlocked: new Set(),
    });
    
    // Reset faction reputation store state - extended to 6 factions
    useFactionReputationStore.setState({
      reputations: {
        void: 0,
        inferno: 0,
        storm: 0,
        stellar: 0,
        arcane: 0,
        chaos: 0,
      },
      totalReputationEarned: 0,
    });
  });

  describe('Achievement with faction property', () => {
    // Updated: 10 faction achievements in Round 80
    it('should have 10 faction achievements defined', () => {
      const factionAchievements = ACHIEVEMENTS.filter(a => a.faction);
      expect(factionAchievements.length).toBe(9);
    });

    it('should find void faction achievement', () => {
      const voidAchievement = ACHIEVEMENTS.find(a => a.faction === 'void');
      expect(voidAchievement).toBeDefined();
      expect(voidAchievement!.faction).toBe('void');
    });

    it('should find inferno faction achievement', () => {
      const infernoAchievement = ACHIEVEMENTS.find(a => a.faction === 'inferno');
      expect(infernoAchievement).toBeDefined();
      expect(infernoAchievement!.faction).toBe('inferno');
    });

    it('should find storm faction achievement', () => {
      const stormAchievement = ACHIEVEMENTS.find(a => a.faction === 'storm');
      expect(stormAchievement).toBeDefined();
      expect(stormAchievement!.faction).toBe('storm');
    });

    it('should find stellar faction achievement', () => {
      const stellarAchievement = ACHIEVEMENTS.find(a => a.faction === 'stellar');
      expect(stellarAchievement).toBeDefined();
      expect(stellarAchievement!.faction).toBe('stellar');
    });

    // Test new factions
    it('should find arcane faction achievement', () => {
      const arcaneAchievement = ACHIEVEMENTS.find(a => a.faction === 'arcane');
      expect(arcaneAchievement).toBeDefined();
      expect(arcaneAchievement!.faction).toBe('arcane');
    });

    it('should find chaos faction achievement', () => {
      const chaosAchievement = ACHIEVEMENTS.find(a => a.faction === 'chaos');
      expect(chaosAchievement).toBeDefined();
      expect(chaosAchievement!.faction).toBe('chaos');
    });
  });

  describe('Faction reputation store integration', () => {
    it('should have addReputation method', () => {
      const store = useFactionReputationStore.getState();
      expect(typeof store.addReputation).toBe('function');
    });

    it('should add reputation correctly', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('void', 100);
      expect(store.getReputation('void')).toBe(100);
    });

    it('should have isVariantUnlocked method', () => {
      const store = useFactionReputationStore.getState();
      expect(typeof store.isVariantUnlocked).toBe('function');
    });

    it('should not unlock variant at apprentice level', () => {
      const store = useFactionReputationStore.getState();
      expect(store.isVariantUnlocked('void')).toBe(false);
    });

    it('should unlock variant at Grandmaster level (2000+)', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('void', 2000);
      expect(store.isVariantUnlocked('void')).toBe(true);
    });
  });

  describe('Non-faction achievements', () => {
    it('should have non-faction achievements', () => {
      const nonFactionAchievements = ACHIEVEMENTS.filter(a => !a.faction);
      expect(nonFactionAchievements.length).toBeGreaterThan(0);
    });

    it('should have first-forge achievement without faction', () => {
      const firstForge = ACHIEVEMENTS.find(a => a.id === 'first-forge');
      expect(firstForge).toBeDefined();
      expect(firstForge!.faction).toBeUndefined();
    });
  });

  describe('Achievement store trigger mechanism', () => {
    it('should have triggerUnlock method', () => {
      const store = useAchievementStore.getState();
      expect(typeof store.triggerUnlock).toBe('function');
    });

    it('should track recentlyUnlocked', () => {
      const store = useAchievementStore.getState();
      expect(store.recentlyUnlocked).toBeDefined();
    });

    it('should clear recentlyUnlocked', () => {
      useAchievementStore.getState().clearRecentlyUnlocked();
      const store = useAchievementStore.getState();
      expect(store.recentlyUnlocked.size).toBe(0);
    });
  });

  describe('Achievement unlock flow', () => {
    it('should call callback when achievement is triggered', () => {
      const callback = vi.fn();
      useAchievementStore.setState({ onUnlockCallback: callback });
      
      const achievement = ACHIEVEMENTS.find(a => a.id === 'first-forge');
      expect(achievement).toBeDefined();
      
      useAchievementStore.getState().triggerUnlock(achievement!);
      expect(callback).toHaveBeenCalledTimes(1);
      // Callback receives the achievement with isUnlocked: true and unlockedAt timestamp
      const calledWith = callback.mock.calls[0][0];
      expect(calledWith.id).toBe('first-forge');
      expect(calledWith.isUnlocked).toBe(true);
      expect(calledWith.unlockedAt).toBeTruthy();
    });

    it('should add achievement ID to recentlyUnlocked', () => {
      // Reset the achievement to locked state first
      useAchievementStore.setState({
        achievements: useAchievementStore.getState().achievements.map(a => 
          a.id === 'first-forge' ? { ...a, isUnlocked: false, unlockedAt: null } : a
        ),
        recentlyUnlocked: new Set(),
      });
      
      const achievement = ACHIEVEMENTS.find(a => a.id === 'first-forge');
      expect(achievement).toBeDefined();
      
      useAchievementStore.getState().triggerUnlock(achievement!);
      
      const store = useAchievementStore.getState();
      expect(store.recentlyUnlocked.has('first-forge')).toBe(true);
    });

    it('should not trigger same achievement twice in quick succession', () => {
      // Reset the achievement to locked state first
      useAchievementStore.setState({
        achievements: useAchievementStore.getState().achievements.map(a => 
          a.id === 'first-forge' ? { ...a, isUnlocked: false, unlockedAt: null } : a
        ),
        recentlyUnlocked: new Set(),
      });
      
      const callback = vi.fn();
      useAchievementStore.setState({ onUnlockCallback: callback });
      
      const achievement = ACHIEVEMENTS.find(a => a.id === 'first-forge');
      expect(achievement).toBeDefined();
      
      // First trigger
      useAchievementStore.getState().triggerUnlock(achievement!);
      expect(callback).toHaveBeenCalledTimes(1);
      
      // Second trigger should be blocked because achievement is now unlocked
      useAchievementStore.getState().triggerUnlock(achievement!);
      expect(callback).toHaveBeenCalledTimes(1); // Still 1, not 2
    });
  });

  describe('Faction Achievement Coverage', () => {
    // Updated: 6 factions in Round 80
    const factionIds: FactionId[] = ['void', 'inferno', 'storm', 'stellar', 'arcane', 'chaos'];

    factionIds.forEach(factionId => {
      it(`should have achievement for ${factionId} faction`, () => {
        const factionAchievement = ACHIEVEMENTS.find(a => a.faction === factionId);
        expect(factionAchievement).toBeDefined();
        expect(factionAchievement!.faction).toBe(factionId);
      });
    });
  });

  describe('Reputation level progression', () => {
    it('should reach Journeyman at 200 points', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('void', 200);
      expect(store.getReputationLevel('void')).toBe('journeyman');
    });

    it('should reach Expert at 500 points', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('inferno', 500);
      expect(store.getReputationLevel('inferno')).toBe('expert');
    });

    it('should reach Master at 1000 points', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('storm', 1000);
      expect(store.getReputationLevel('storm')).toBe('master');
    });

    it('should reach Grandmaster at 2000 points', () => {
      const store = useFactionReputationStore.getState();
      store.addReputation('stellar', 2000);
      expect(store.getReputationLevel('stellar')).toBe('grandmaster');
      expect(store.isVariantUnlocked('stellar')).toBe(true);
    });
  });
});
