/**
 * Favorites Store - Manages personal favorites for community machines
 * 
 * Provides localStorage persistence for favorited community machines.
 * Maximum 101 favorites to prevent localStorage overflow.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_FAVORITES = 101;

interface FavoritesStore {
  favoriteIds: string[];
  addFavorite: (machineId: string) => boolean;
  removeFavorite: (machineId: string) => void;
  toggleFavorite: (machineId: string) => boolean;
  isFavorite: (machineId: string) => boolean;
  getFavoritesCount: () => number;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      addFavorite: (machineId: string): boolean => {
        const { favoriteIds } = get();
        
        // Check limit
        if (favoriteIds.length >= MAX_FAVORITES) {
          console.warn(`Maximum favorites limit (${MAX_FAVORITES}) reached`);
          return false;
        }
        
        // Check if already favorited
        if (favoriteIds.includes(machineId)) {
          return false;
        }
        
        set({ favoriteIds: [...favoriteIds, machineId] });
        return true;
      },

      removeFavorite: (machineId: string): void => {
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((id) => id !== machineId),
        }));
      },

      toggleFavorite: (machineId: string): boolean => {
        const { favoriteIds, addFavorite, removeFavorite } = get();
        
        if (favoriteIds.includes(machineId)) {
          removeFavorite(machineId);
          return false;
        } else {
          return addFavorite(machineId);
        }
      },

      isFavorite: (machineId: string): boolean => {
        return get().favoriteIds.includes(machineId);
      },

      getFavoritesCount: (): number => {
        return get().favoriteIds.length;
      },

      clearFavorites: (): void => {
        set({ favoriteIds: [] });
      },
    }),
    {
      name: 'arcane-favorites-storage',
      // Skip automatic hydration to prevent cascading state updates
      skipHydration: true,
    }
  )
);

// Helper to manually trigger hydration
export const hydrateFavoritesStore = () => {
  useFavoritesStore.persist.rehydrate();
};

// Helper to check if hydration is complete
export const isFavoritesHydrated = () => {
  return useFavoritesStore.persist.hasHydrated();
};
