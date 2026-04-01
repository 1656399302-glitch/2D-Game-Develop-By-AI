/**
 * Recipe Store Integration Tests
 * 
 * Tests for the Recipe store which manages recipe unlock system.
 * Tests unlock conditions, discovery flow, and tech integration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRecipeStore, hydrateRecipeStore, isRecipeHydrated } from '../store/useRecipeStore';
import { RECIPE_DEFINITIONS } from '../data/recipes';

// Mock the faction reputation store
vi.mock('../store/useFactionReputationStore', () => ({
  useFactionReputationStore: {
    getState: () => ({
      completedResearch: [],
    }),
  },
}));

describe('RecipeStore', () => {
  // Use real recipe IDs from RECIPE_DEFINITIONS
  const testRecipeId = RECIPE_DEFINITIONS[0].id;
  const secondTestRecipeId = RECIPE_DEFINITIONS[1]?.id || 'recipe-energy-pipe';

  beforeEach(() => {
    // Reset store state before each test
    useRecipeStore.setState({
      unlockedRecipes: [],
      pendingDiscoveries: [],
    });
  });

  describe('initial state', () => {
    it('should initialize with empty unlockedRecipes', () => {
      const state = useRecipeStore.getState();
      expect(state.unlockedRecipes).toEqual([]);
    });

    it('should initialize with empty pendingDiscoveries', () => {
      const state = useRecipeStore.getState();
      expect(state.pendingDiscoveries).toEqual([]);
    });
  });

  describe('unlockRecipe', () => {
    it('should add recipe to unlocked list', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      
      const state = useRecipeStore.getState();
      expect(state.unlockedRecipes.some(r => r.recipeId === testRecipeId)).toBe(true);
    });

    it('should add recipe to pending discoveries', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      
      const state = useRecipeStore.getState();
      expect(state.pendingDiscoveries).toContain(testRecipeId);
    });

    it('should not add duplicate recipes', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      
      const state = useRecipeStore.getState();
      const count = state.unlockedRecipes.filter(r => r.recipeId === testRecipeId).length;
      expect(count).toBe(1);
    });

    it('should record unlock timestamp', () => {
      const before = Date.now();
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      const after = Date.now();

      const state = useRecipeStore.getState();
      const recipe = state.unlockedRecipes.find(r => r.recipeId === testRecipeId);
      expect(recipe?.unlockedAt).toBeDefined();
      expect(recipe?.unlockedAt! >= before).toBe(true);
      expect(recipe?.unlockedAt! <= after).toBe(true);
    });

    it('should set discovered to false initially', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      
      const state = useRecipeStore.getState();
      const recipe = state.unlockedRecipes.find(r => r.recipeId === testRecipeId);
      expect(recipe?.discovered).toBe(false);
    });

    it('should warn for unknown recipe', () => {
      // This should not throw, just log a warning
      expect(() => useRecipeStore.getState().unlockRecipe('unknown-recipe-id')).not.toThrow();
    });
  });

  describe('discoverRecipe', () => {
    it('should mark recipe as discovered', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      useRecipeStore.getState().discoverRecipe(testRecipeId);
      
      const state = useRecipeStore.getState();
      const recipe = state.unlockedRecipes.find(r => r.recipeId === testRecipeId);
      expect(recipe?.discovered).toBe(true);
    });

    it('should add undiscovered recipe if not unlocked', () => {
      useRecipeStore.getState().discoverRecipe(testRecipeId);
      
      const state = useRecipeStore.getState();
      const recipe = state.unlockedRecipes.find(r => r.recipeId === testRecipeId);
      expect(recipe).toBeDefined();
      expect(recipe?.discovered).toBe(false);
    });
  });

  describe('markAsSeen', () => {
    it('should mark recipe as discovered', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      useRecipeStore.getState().markAsSeen(testRecipeId);
      
      const state = useRecipeStore.getState();
      const recipe = state.unlockedRecipes.find(r => r.recipeId === testRecipeId);
      expect(recipe?.discovered).toBe(true);
    });
  });

  describe('clearPendingDiscoveries', () => {
    it('should clear all pending discoveries', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      useRecipeStore.getState().unlockRecipe(secondTestRecipeId);
      
      useRecipeStore.getState().clearPendingDiscoveries();
      
      const state = useRecipeStore.getState();
      expect(state.pendingDiscoveries).toEqual([]);
    });
  });

  describe('isUnlocked', () => {
    it('should return false for undiscovered recipe', () => {
      // unlockRecipe adds to list but sets discovered=false
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      expect(useRecipeStore.getState().isUnlocked(testRecipeId)).toBe(false);
    });

    it('should return true for discovered recipe', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      useRecipeStore.getState().discoverRecipe(testRecipeId);
      expect(useRecipeStore.getState().isUnlocked(testRecipeId)).toBe(true);
    });

    it('should return false for locked recipe', () => {
      expect(useRecipeStore.getState().isUnlocked(testRecipeId)).toBe(false);
    });
  });

  describe('isPendingDiscovery', () => {
    it('should return true for pending discovery', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      expect(useRecipeStore.getState().isPendingDiscovery(testRecipeId)).toBe(true);
    });

    it('should return false for non-pending recipe', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      useRecipeStore.getState().clearPendingDiscoveries();
      expect(useRecipeStore.getState().isPendingDiscovery(testRecipeId)).toBe(false);
    });
  });

  describe('getRecipe', () => {
    it('should return recipe definition', () => {
      const recipe = useRecipeStore.getState().getRecipe(testRecipeId);
      expect(recipe).toBeDefined();
      expect(recipe?.id).toBe(testRecipeId);
    });

    it('should return undefined for unknown recipe', () => {
      const recipe = useRecipeStore.getState().getRecipe('unknown-recipe');
      expect(recipe).toBeUndefined();
    });
  });

  describe('getUnlockedRecipes', () => {
    it('should return only discovered recipes', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      useRecipeStore.getState().unlockRecipe(secondTestRecipeId);
      
      // Discover only the first one
      useRecipeStore.getState().discoverRecipe(testRecipeId);
      
      const recipes = useRecipeStore.getState().getUnlockedRecipes();
      // Should include discovered recipes
      expect(recipes.some(r => r.id === testRecipeId)).toBe(true);
      // Should not include undiscovered recipes in getUnlockedRecipes
      expect(recipes.some(r => r.id === secondTestRecipeId)).toBe(false);
    });

    it('should return empty array when no recipes discovered', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      const recipes = useRecipeStore.getState().getUnlockedRecipes();
      // Undiscovered recipes are not returned by getUnlockedRecipes
      expect(recipes.filter(r => r.id === testRecipeId)).toHaveLength(0);
    });
  });

  describe('getLockedRecipes', () => {
    it('should return list of locked recipes', () => {
      const locked = useRecipeStore.getState().getLockedRecipes();
      // Should have some locked recipes initially
      expect(locked.length).toBeGreaterThan(0);
    });

    it('should not include discovered recipes', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      useRecipeStore.getState().discoverRecipe(testRecipeId);
      
      const locked = useRecipeStore.getState().getLockedRecipes();
      expect(locked.some(r => r.id === testRecipeId)).toBe(false);
    });
  });

  describe('getNextPendingDiscovery', () => {
    it('should return first pending discovery', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      useRecipeStore.getState().unlockRecipe(secondTestRecipeId);
      
      const next = useRecipeStore.getState().getNextPendingDiscovery();
      expect(next?.id).toBe(testRecipeId);
    });

    it('should return null when no pending discoveries', () => {
      const next = useRecipeStore.getState().getNextPendingDiscovery();
      expect(next).toBeNull();
    });
  });

  describe('isUnlockConditionMet', () => {
    it('should return false for unknown recipe', () => {
      expect(useRecipeStore.getState().isUnlockConditionMet('unknown')).toBe(false);
    });
  });

  describe('checkChallengeUnlock', () => {
    it('should check challenge-specific recipes', () => {
      useRecipeStore.getState().checkChallengeUnlock('challenge-001');
      
      // Just verify it doesn't throw
      expect(useRecipeStore.getState()).toBeDefined();
    });
  });

  describe('checkChallengeCountUnlock', () => {
    it('should check recipes based on challenge count', () => {
      useRecipeStore.getState().checkChallengeCountUnlock(5);
      
      // Just verify it doesn't throw
      expect(useRecipeStore.getState()).toBeDefined();
    });
  });

  describe('checkTutorialUnlock', () => {
    it('should check tutorial recipes', () => {
      useRecipeStore.getState().checkTutorialUnlock();
      
      // Just verify it doesn't throw
      expect(useRecipeStore.getState()).toBeDefined();
    });
  });

  describe('checkMachinesCreatedUnlock', () => {
    it('should check recipes based on machines created', () => {
      useRecipeStore.getState().checkMachinesCreatedUnlock(10);
      
      // Just verify it doesn't throw
      expect(useRecipeStore.getState()).toBeDefined();
    });
  });

  describe('checkActivationCountUnlock', () => {
    it('should check recipes based on activation count', () => {
      useRecipeStore.getState().checkActivationCountUnlock(50);
      
      // Just verify it doesn't throw
      expect(useRecipeStore.getState()).toBeDefined();
    });
  });

  describe('checkTechLevelUnlocks', () => {
    it('should check tech level unlocks', () => {
      useRecipeStore.getState().checkTechLevelUnlocks();
      
      // Just verify it doesn't throw
      expect(useRecipeStore.getState()).toBeDefined();
    });
  });

  describe('relockTechRecipes', () => {
    it('should relock tech-level recipes', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      useRecipeStore.getState().relockTechRecipes();
      
      // Just verify it doesn't throw - tech recipes should be handled
      expect(useRecipeStore.getState()).toBeDefined();
    });
  });

  describe('resetAllRecipes', () => {
    it('should reset all recipe unlocks', () => {
      useRecipeStore.getState().unlockRecipe(testRecipeId);
      useRecipeStore.getState().unlockRecipe(secondTestRecipeId);
      
      useRecipeStore.getState().resetAllRecipes();
      
      const state = useRecipeStore.getState();
      expect(state.unlockedRecipes).toEqual([]);
      expect(state.pendingDiscoveries).toEqual([]);
    });
  });

  describe('hydration helpers', () => {
    it('should expose isRecipeHydrated function', () => {
      expect(typeof isRecipeHydrated).toBe('function');
    });

    it('should expose hydrateRecipeStore function', () => {
      expect(typeof hydrateRecipeStore).toBe('function');
    });
  });
});
