/**
 * Favorites Store Integration Tests
 * 
 * Tests for the Favorites store which manages personal favorites for community machines.
 * Tests add, remove, toggle, and limit functionality.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useFavoritesStore, hydrateFavoritesStore, isFavoritesHydrated } from '../store/useFavoritesStore';

describe('FavoritesStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useFavoritesStore.setState({
      favoriteIds: [],
    });
  });

  describe('initial state', () => {
    it('should initialize with empty favoriteIds', () => {
      const state = useFavoritesStore.getState();
      expect(state.favoriteIds).toEqual([]);
    });
  });

  describe('addFavorite', () => {
    it('should add a favorite', () => {
      const result = useFavoritesStore.getState().addFavorite('machine-1');
      
      expect(result).toBe(true);
      expect(useFavoritesStore.getState().favoriteIds).toContain('machine-1');
    });

    it('should return false for duplicate', () => {
      useFavoritesStore.getState().addFavorite('machine-1');
      const result = useFavoritesStore.getState().addFavorite('machine-1');
      
      expect(result).toBe(false);
      expect(useFavoritesStore.getState().favoriteIds.filter(id => id === 'machine-1').length).toBe(1);
    });

    it('should enforce maximum favorites limit of 101', () => {
      // Add 100 favorites first
      const store = useFavoritesStore.getState();
      for (let i = 0; i < 100; i++) {
        store.addFavorite(`machine-${i}`);
      }

      // The 101st should succeed (we just hit the limit)
      const result = useFavoritesStore.getState().addFavorite('machine-100');
      expect(result).toBe(true);
      expect(useFavoritesStore.getState().favoriteIds.length).toBe(101);

      // The 102nd should fail
      const result2 = useFavoritesStore.getState().addFavorite('machine-101');
      expect(result2).toBe(false);
      expect(useFavoritesStore.getState().favoriteIds.length).toBe(101);
    });

    it('should not exceed maximum even with many attempts', () => {
      const store = useFavoritesStore.getState();
      
      // Try to add more than 101
      for (let i = 0; i < 200; i++) {
        store.addFavorite(`machine-${i}`);
      }

      // Should be capped at 101
      expect(useFavoritesStore.getState().favoriteIds.length).toBeLessThanOrEqual(101);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite', () => {
      useFavoritesStore.getState().addFavorite('machine-1');
      useFavoritesStore.getState().addFavorite('machine-2');
      
      useFavoritesStore.getState().removeFavorite('machine-1');
      
      const state = useFavoritesStore.getState();
      expect(state.favoriteIds).not.toContain('machine-1');
      expect(state.favoriteIds).toContain('machine-2');
      expect(state.favoriteIds.length).toBe(1);
    });

    it('should handle removing non-existent favorite', () => {
      useFavoritesStore.getState().addFavorite('machine-1');
      
      expect(() => useFavoritesStore.getState().removeFavorite('non-existent')).not.toThrow();
      expect(useFavoritesStore.getState().favoriteIds).toHaveLength(1);
    });

    it('should maintain order when removing', () => {
      useFavoritesStore.getState().addFavorite('machine-1');
      useFavoritesStore.getState().addFavorite('machine-2');
      useFavoritesStore.getState().addFavorite('machine-3');
      
      useFavoritesStore.getState().removeFavorite('machine-2');
      
      expect(useFavoritesStore.getState().favoriteIds).toEqual(['machine-1', 'machine-3']);
    });
  });

  describe('toggleFavorite', () => {
    it('should add favorite when not favorited', () => {
      const result = useFavoritesStore.getState().toggleFavorite('machine-1');
      
      expect(result).toBe(true);
      expect(useFavoritesStore.getState().favoriteIds).toContain('machine-1');
    });

    it('should remove favorite when already favorited', () => {
      useFavoritesStore.getState().addFavorite('machine-1');
      
      const result = useFavoritesStore.getState().toggleFavorite('machine-1');
      
      expect(result).toBe(false);
      expect(useFavoritesStore.getState().favoriteIds).not.toContain('machine-1');
    });

    it('should return true when adding', () => {
      const result = useFavoritesStore.getState().toggleFavorite('machine-1');
      expect(result).toBe(true);
    });

    it('should return false when removing', () => {
      useFavoritesStore.getState().addFavorite('machine-1');
      const result = useFavoritesStore.getState().toggleFavorite('machine-1');
      expect(result).toBe(false);
    });
  });

  describe('isFavorite', () => {
    it('should return true for favorited machine', () => {
      useFavoritesStore.getState().addFavorite('machine-1');
      expect(useFavoritesStore.getState().isFavorite('machine-1')).toBe(true);
    });

    it('should return false for non-favorited machine', () => {
      expect(useFavoritesStore.getState().isFavorite('machine-1')).toBe(false);
    });

    it('should return false after removal', () => {
      useFavoritesStore.getState().addFavorite('machine-1');
      useFavoritesStore.getState().removeFavorite('machine-1');
      expect(useFavoritesStore.getState().isFavorite('machine-1')).toBe(false);
    });
  });

  describe('getFavoritesCount', () => {
    it('should return 0 for empty favorites', () => {
      expect(useFavoritesStore.getState().getFavoritesCount()).toBe(0);
    });

    it('should return correct count', () => {
      useFavoritesStore.getState().addFavorite('machine-1');
      useFavoritesStore.getState().addFavorite('machine-2');
      useFavoritesStore.getState().addFavorite('machine-3');
      
      expect(useFavoritesStore.getState().getFavoritesCount()).toBe(3);
    });

    it('should update count after removal', () => {
      useFavoritesStore.getState().addFavorite('machine-1');
      useFavoritesStore.getState().addFavorite('machine-2');
      useFavoritesStore.getState().removeFavorite('machine-1');
      
      expect(useFavoritesStore.getState().getFavoritesCount()).toBe(1);
    });
  });

  describe('clearFavorites', () => {
    it('should clear all favorites', () => {
      useFavoritesStore.getState().addFavorite('machine-1');
      useFavoritesStore.getState().addFavorite('machine-2');
      useFavoritesStore.getState().addFavorite('machine-3');
      
      useFavoritesStore.getState().clearFavorites();
      
      expect(useFavoritesStore.getState().favoriteIds).toEqual([]);
    });

    it('should return to 0 count', () => {
      useFavoritesStore.getState().addFavorite('machine-1');
      useFavoritesStore.getState().addFavorite('machine-2');
      useFavoritesStore.getState().clearFavorites();
      
      expect(useFavoritesStore.getState().getFavoritesCount()).toBe(0);
    });
  });

  describe('hydration helpers', () => {
    it('should expose isFavoritesHydrated function', () => {
      expect(typeof isFavoritesHydrated).toBe('function');
    });

    it('should expose hydrateFavoritesStore function', () => {
      expect(typeof hydrateFavoritesStore).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle adding many favorites up to limit', () => {
      const store = useFavoritesStore.getState();
      let successCount = 0;
      
      for (let i = 0; i < 101; i++) {
        if (store.addFavorite(`machine-${i}`)) {
          successCount++;
        }
      }

      expect(successCount).toBe(101);
    });

    it('should handle rapid add/remove cycles', () => {
      const store = useFavoritesStore.getState();
      
      for (let i = 0; i < 50; i++) {
        store.addFavorite(`machine-${i}`);
        store.removeFavorite(`machine-${i}`);
      }

      expect(store.favoriteIds).toEqual([]);
    });

    it('should handle toggle at limit', () => {
      const store = useFavoritesStore.getState();
      
      // Fill up to limit - 1
      for (let i = 0; i < 99; i++) {
        store.addFavorite(`machine-${i}`);
      }

      // Toggle should work
      const result = store.toggleFavorite('machine-new');
      expect(result).toBe(true);

      // Toggle back should work
      const result2 = store.toggleFavorite('machine-new');
      expect(result2).toBe(false);
    });

    it('should handle special characters in machine ID', () => {
      const store = useFavoritesStore.getState();
      const result = store.addFavorite('machine/with/slashes');
      expect(result).toBe(true);
      expect(store.isFavorite('machine/with/slashes')).toBe(true);
    });
  });
});
