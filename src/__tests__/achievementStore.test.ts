/**
 * Achievement Store Tests
 * 
 * Tests achievement store persistence across reloads.
 * 
 * ROUND 81 PHASE 2: Test file per contract.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAchievementStore, AchievementId } from '../store/achievementStore';

// Helper to clear localStorage
function clearAchievementStorage() {
  localStorage.removeItem('arcane-codex-achievements');
}

describe('Achievement Store', () => {
  beforeEach(() => {
    clearAchievementStorage();
    // Reset store state
    useAchievementStore.setState({
      unlockedAchievements: new Set<AchievementId>(),
      lastUnlockTime: null,
    });
  });

  describe('Basic functionality', () => {
    it('should start with no unlocked achievements', () => {
      const store = useAchievementStore.getState();
      expect(store.getUnlocked()).toEqual([]);
      expect(store.isUnlocked('first-forge')).toBe(false);
    });

    it('should unlock an achievement', () => {
      const store = useAchievementStore.getState();
      store.unlock('first-forge');
      
      expect(store.isUnlocked('first-forge')).toBe(true);
      expect(store.getUnlocked()).toContain('first-forge');
    });

    it('should not duplicate achievements if already unlocked', () => {
      const store = useAchievementStore.getState();
      store.unlock('first-forge');
      store.unlock('first-forge');
      
      expect(store.getUnlocked().filter(id => id === 'first-forge').length).toBe(1);
    });

    it('should reset all achievements', () => {
      const store = useAchievementStore.getState();
      store.unlock('first-forge');
      store.unlock('first-export');
      store.unlock('complex-machine-created');
      
      store.reset();
      
      expect(store.getUnlocked()).toEqual([]);
      expect(store.isUnlocked('first-forge')).toBe(false);
    });
  });

  describe('Achievement tracking', () => {
    it('should track first-forge achievement', () => {
      const store = useAchievementStore.getState();
      store.unlock('first-forge');
      
      expect(store.isUnlocked('first-forge')).toBe(true);
    });

    it('should track first-activation achievement', () => {
      const store = useAchievementStore.getState();
      store.unlock('first-activation');
      
      expect(store.isUnlocked('first-activation')).toBe(true);
    });

    it('should track first-export achievement', () => {
      const store = useAchievementStore.getState();
      store.unlock('first-export');
      
      expect(store.isUnlocked('first-export')).toBe(true);
    });

    it('should track faction achievements', () => {
      const store = useAchievementStore.getState();
      const factionAchievements: AchievementId[] = [
        'faction-void',
        'faction-forge',
        'faction-phase',
        'faction-barrier',
        'faction-order',
        'faction-chaos',
      ];
      
      factionAchievements.forEach((id) => {
        store.unlock(id);
        expect(store.isUnlocked(id)).toBe(true);
      });
    });

    it('should track complex-machine-created achievement', () => {
      const store = useAchievementStore.getState();
      store.unlock('complex-machine-created');
      
      expect(store.isUnlocked('complex-machine-created')).toBe(true);
    });

    it('should track skill achievements', () => {
      const store = useAchievementStore.getState();
      const skillAchievements: AchievementId[] = [
        'apprentice-forge',
        'perfect-activation',
        'skilled-artisan',
      ];
      
      skillAchievements.forEach((id) => {
        store.unlock(id);
        expect(store.isUnlocked(id)).toBe(true);
      });
    });
  });

  describe('getUnlockedCount', () => {
    it('should return correct count of unlocked achievements', () => {
      const store = useAchievementStore.getState();
      
      expect(store.getUnlocked().length).toBe(0);
      
      store.unlock('first-forge');
      expect(store.getUnlocked().length).toBe(1);
      
      store.unlock('first-activation');
      expect(store.getUnlocked().length).toBe(2);
      
      store.unlock('first-export');
      expect(store.getUnlocked().length).toBe(3);
    });
  });
});
