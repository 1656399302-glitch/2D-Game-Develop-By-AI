import { describe, it, expect, beforeEach } from 'vitest';
import { useRecipeStore } from '../store/useRecipeStore';
import { 
  Recipe, 
  RECIPE_DEFINITIONS, 
  isRecipeUnlocked,
  getRecipeByModuleType,
  RARITY_COLORS,
  RecipeUnlockState
} from '../types/recipes';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Recipe System', () => {
  beforeEach(() => {
    // Reset store state
    useRecipeStore.setState({
      unlockedRecipes: [],
      pendingDiscoveries: [],
    });
    localStorageMock.clear();
  });

  describe('Recipe Definitions', () => {
    it('should have 11 module recipes defined', () => {
      const moduleRecipes = RECIPE_DEFINITIONS.filter(r => r.moduleType);
      expect(moduleRecipes.length).toBe(11);
    });

    it('should have recipes for all module types', () => {
      const moduleTypes = [
        'core-furnace', 'energy-pipe', 'gear', 'rune-node',
        'shield-shell', 'trigger-switch', 'output-array',
        'amplifier-crystal', 'stabilizer-core', 'void-siphon', 'phase-modulator'
      ];
      
      for (const type of moduleTypes) {
        const recipe = getRecipeByModuleType(type);
        expect(recipe).toBeDefined();
        expect(recipe?.moduleType).toBe(type);
      }
    });

    it('should have valid unlock conditions for all recipes', () => {
      for (const recipe of RECIPE_DEFINITIONS) {
        expect(recipe.unlockCondition).toBeDefined();
        expect(recipe.unlockCondition.type).toBeDefined();
        expect(recipe.unlockCondition.description).toBeDefined();
      }
    });

    it('should have all rarity levels represented', () => {
      const rarities = new Set(RECIPE_DEFINITIONS.map(r => r.rarity));
      expect(rarities.has('common')).toBe(true);
      expect(rarities.has('uncommon')).toBe(true);
      expect(rarities.has('rare')).toBe(true);
      expect(rarities.has('epic')).toBe(true);
      expect(rarities.has('legendary')).toBe(true);
    });

    it('should have correct rarity colors for all levels', () => {
      expect(RARITY_COLORS.common).toBeDefined();
      expect(RARITY_COLORS.uncommon).toBeDefined();
      expect(RARITY_COLORS.rare).toBeDefined();
      expect(RARITY_COLORS.epic).toBeDefined();
      expect(RARITY_COLORS.legendary).toBeDefined();
    });
  });

  describe('Recipe Store', () => {
    describe('unlockRecipe', () => {
      it('should add recipe to unlocked list', () => {
        expect(useRecipeStore.getState().unlockedRecipes.length).toBe(0);
        
        useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
        
        expect(useRecipeStore.getState().unlockedRecipes.length).toBe(1);
        expect(useRecipeStore.getState().unlockedRecipes[0].recipeId).toBe('recipe-core-furnace');
      });

      it('should add recipe to pending discoveries when unlocked', () => {
        useRecipeStore.getState().unlockRecipe('recipe-energy-pipe');
        
        expect(useRecipeStore.getState().pendingDiscoveries).toContain('recipe-energy-pipe');
      });

      it('should not duplicate already unlocked recipes', () => {
        useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
        useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
        
        expect(useRecipeStore.getState().unlockedRecipes.length).toBe(1);
      });

      it('should set unlockedAt timestamp', () => {
        const beforeTime = Date.now();
        useRecipeStore.getState().unlockRecipe('recipe-gear');
        const afterTime = Date.now();
        
        const state = useRecipeStore.getState();
        expect(state.unlockedRecipes[0].unlockedAt).toBeGreaterThanOrEqual(beforeTime);
        expect(state.unlockedRecipes[0].unlockedAt).toBeLessThanOrEqual(afterTime);
      });
    });

    describe('isUnlocked', () => {
      it('should return false for locked recipes', () => {
        expect(useRecipeStore.getState().isUnlocked('recipe-core-furnace')).toBe(false);
      });

      it('should return true for unlocked recipes', () => {
        useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
        useRecipeStore.getState().markAsSeen('recipe-core-furnace');
        expect(useRecipeStore.getState().isUnlocked('recipe-core-furnace')).toBe(true);
      });

      it('should return false for recipes not yet discovered', () => {
        useRecipeStore.getState().unlockRecipe('recipe-rune-node');
        // Should be false because not discovered yet
        expect(useRecipeStore.getState().isUnlocked('recipe-rune-node')).toBe(false);
        
        // Mark as discovered
        useRecipeStore.getState().markAsSeen('recipe-rune-node');
        expect(useRecipeStore.getState().isUnlocked('recipe-rune-node')).toBe(true);
      });
    });

    describe('getRecipe', () => {
      it('should return recipe definition by ID', () => {
        const recipe = useRecipeStore.getState().getRecipe('recipe-core-furnace');
        
        expect(recipe).toBeDefined();
        expect(recipe?.name).toBe('Core Furnace');
      });

      it('should return undefined for invalid ID', () => {
        const recipe = useRecipeStore.getState().getRecipe('invalid-recipe-id');
        
        expect(recipe).toBeUndefined();
      });
    });

    describe('getUnlockedRecipes', () => {
      it('should return empty array when no recipes unlocked', () => {
        expect(useRecipeStore.getState().getUnlockedRecipes()).toEqual([]);
      });

      it('should return only unlocked recipes', () => {
        useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
        useRecipeStore.getState().unlockRecipe('recipe-energy-pipe');
        useRecipeStore.getState().markAsSeen('recipe-core-furnace');
        
        const unlocked = useRecipeStore.getState().getUnlockedRecipes();
        expect(unlocked.length).toBe(1);
        expect(unlocked[0].id).toBe('recipe-core-furnace');
      });
    });

    describe('getLockedRecipes', () => {
      it('should return all recipes when none unlocked', () => {
        const locked = useRecipeStore.getState().getLockedRecipes();
        
        expect(locked.length).toBe(RECIPE_DEFINITIONS.length);
      });

      it('should exclude unlocked recipes', () => {
        useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
        useRecipeStore.getState().markAsSeen('recipe-core-furnace');
        
        const locked = useRecipeStore.getState().getLockedRecipes();
        expect(locked.some(r => r.id === 'recipe-core-furnace')).toBe(false);
      });
    });
  });

  describe('Challenge Integration', () => {
    describe('checkChallengeUnlock', () => {
      it('should unlock recipes associated with completed challenge', () => {
        // Challenge 001 should unlock energy-pipe
        useRecipeStore.getState().checkChallengeUnlock('challenge-001');
        
        expect(useRecipeStore.getState().pendingDiscoveries).toContain('recipe-energy-pipe');
      });

      it('should unlock multiple recipes for same challenge', () => {
        useRecipeStore.getState().checkChallengeUnlock('challenge-001');
        
        // Energy pipe is unlocked for challenge-001
        expect(useRecipeStore.getState().isUnlocked('recipe-energy-pipe')).toBe(false); // Not discovered yet
        expect(useRecipeStore.getState().pendingDiscoveries).toContain('recipe-energy-pipe');
      });
    });

    describe('checkTutorialUnlock', () => {
      it('should unlock tutorial recipes', () => {
        useRecipeStore.getState().checkTutorialUnlock();
        
        expect(useRecipeStore.getState().pendingDiscoveries).toContain('recipe-core-furnace');
      });
    });

    describe('checkMachinesCreatedUnlock', () => {
      it('should unlock recipes when threshold met', () => {
        // Amplifier crystal requires 5 machines
        useRecipeStore.getState().checkMachinesCreatedUnlock(5);
        
        expect(useRecipeStore.getState().pendingDiscoveries).toContain('recipe-amplifier-crystal');
      });

      it('should not unlock if threshold not met', () => {
        useRecipeStore.getState().checkMachinesCreatedUnlock(4);
        
        expect(useRecipeStore.getState().pendingDiscoveries).not.toContain('recipe-amplifier-crystal');
      });
    });

    describe('checkActivationCountUnlock', () => {
      it('should unlock void siphon after 50 activations', () => {
        useRecipeStore.getState().checkActivationCountUnlock(50);
        
        expect(useRecipeStore.getState().pendingDiscoveries).toContain('recipe-void-siphon');
      });
    });
  });

  describe('State Management', () => {
    it('should have correct initial state', () => {
      const state = useRecipeStore.getState();
      expect(state.unlockedRecipes).toEqual([]);
      expect(state.pendingDiscoveries).toEqual([]);
    });

    it('should reset state correctly', () => {
      // Add some recipes
      useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
      useRecipeStore.getState().unlockRecipe('recipe-energy-pipe');
      
      // Reset
      useRecipeStore.setState({
        unlockedRecipes: [],
        pendingDiscoveries: [],
      });
      
      const state = useRecipeStore.getState();
      expect(state.unlockedRecipes).toEqual([]);
      expect(state.pendingDiscoveries).toEqual([]);
    });
  });

  describe('isRecipeUnlocked helper', () => {
    it('should correctly check unlocked state', () => {
      const unlockedRecipes: RecipeUnlockState[] = [
        { recipeId: 'recipe-core-furnace', discovered: true },
        { recipeId: 'recipe-energy-pipe', discovered: false },
      ];
      
      expect(isRecipeUnlocked('recipe-core-furnace', unlockedRecipes)).toBe(true);
      expect(isRecipeUnlocked('recipe-energy-pipe', unlockedRecipes)).toBe(false); // Not discovered
      expect(isRecipeUnlocked('recipe-gear', unlockedRecipes)).toBe(false);
    });
  });

  describe('Clear pending discoveries', () => {
    it('should clear pending discoveries array', () => {
      useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
      expect(useRecipeStore.getState().pendingDiscoveries.length).toBe(1);
      
      useRecipeStore.getState().clearPendingDiscoveries();
      expect(useRecipeStore.getState().pendingDiscoveries.length).toBe(0);
    });
  });

  describe('getNextPendingDiscovery', () => {
    it('should return first pending recipe', () => {
      useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
      useRecipeStore.getState().unlockRecipe('recipe-energy-pipe');
      
      const next = useRecipeStore.getState().getNextPendingDiscovery();
      expect(next?.id).toBe('recipe-core-furnace');
    });

    it('should return null when no pending discoveries', () => {
      const next = useRecipeStore.getState().getNextPendingDiscovery();
      
      expect(next).toBeNull();
    });
  });
});
