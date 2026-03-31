/**
 * Favorites Store Tests
 */

import { useFavoritesStore } from '../store/useFavoritesStore';

describe('useFavoritesStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useFavoritesStore.setState({ favoriteIds: [] });
  });

  describe('addFavorite', () => {
    it('should add a machine to favorites', () => {
      const { addFavorite } = useFavoritesStore.getState();
      
      const result = addFavorite('machine-1');
      
      expect(result).toBe(true);
      expect(useFavoritesStore.getState().favoriteIds).toContain('machine-1');
    });

    it('should not add duplicate favorites', () => {
      const { addFavorite } = useFavoritesStore.getState();
      
      addFavorite('machine-1');
      const result = addFavorite('machine-1');
      
      expect(result).toBe(false);
      expect(useFavoritesStore.getState().favoriteIds.filter(id => id === 'machine-1').length).toBe(1);
    });

    it('should not exceed maximum favorites limit', () => {
      const { addFavorite } = useFavoritesStore.getState();
      
      // Add 101 favorites (max is 101)
      for (let i = 0; i < 101; i++) {
        addFavorite(`machine-${i}`);
      }
      
      // 102nd should fail
      const result = addFavorite('machine-102');
      expect(result).toBe(false);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a machine from favorites', () => {
      const { addFavorite, removeFavorite } = useFavoritesStore.getState();
      
      addFavorite('machine-1');
      removeFavorite('machine-1');
      
      expect(useFavoritesStore.getState().favoriteIds).not.toContain('machine-1');
    });

    it('should handle removing non-existent favorite', () => {
      const { removeFavorite } = useFavoritesStore.getState();
      
      expect(() => removeFavorite('non-existent')).not.toThrow();
    });
  });

  describe('toggleFavorite', () => {
    it('should add favorite when not favorited', () => {
      const { toggleFavorite } = useFavoritesStore.getState();
      
      const result = toggleFavorite('machine-1');
      
      expect(result).toBe(true);
      expect(useFavoritesStore.getState().favoriteIds).toContain('machine-1');
    });

    it('should remove favorite when already favorited', () => {
      const { addFavorite, toggleFavorite } = useFavoritesStore.getState();
      
      addFavorite('machine-1');
      const result = toggleFavorite('machine-1');
      
      expect(result).toBe(false);
      expect(useFavoritesStore.getState().favoriteIds).not.toContain('machine-1');
    });
  });

  describe('isFavorite', () => {
    it('should return true for favorited machine', () => {
      const { addFavorite, isFavorite } = useFavoritesStore.getState();
      
      addFavorite('machine-1');
      
      expect(isFavorite('machine-1')).toBe(true);
    });

    it('should return false for non-favorited machine', () => {
      const { isFavorite } = useFavoritesStore.getState();
      
      expect(isFavorite('machine-1')).toBe(false);
    });
  });

  describe('getFavoritesCount', () => {
    it('should return correct count', () => {
      const { addFavorite, getFavoritesCount } = useFavoritesStore.getState();
      
      addFavorite('machine-1');
      addFavorite('machine-2');
      addFavorite('machine-3');
      
      expect(getFavoritesCount()).toBe(3);
    });

    it('should return 0 for empty favorites', () => {
      const { getFavoritesCount } = useFavoritesStore.getState();
      
      expect(getFavoritesCount()).toBe(0);
    });
  });

  describe('clearFavorites', () => {
    it('should clear all favorites', () => {
      const { addFavorite, clearFavorites, getFavoritesCount } = useFavoritesStore.getState();
      
      addFavorite('machine-1');
      addFavorite('machine-2');
      clearFavorites();
      
      expect(getFavoritesCount()).toBe(0);
    });
  });
});
