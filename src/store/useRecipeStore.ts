import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Recipe, 
  RECIPE_DEFINITIONS,
  isRecipeUnlocked 
} from '../types/recipes';

interface RecipeUnlockState {
  recipeId: string;
  unlockedAt?: number; // Timestamp when unlocked
  discovered: boolean; // Has the player seen this recipe?
}

interface RecipeStoreState {
  unlockedRecipes: RecipeUnlockState[];
  pendingDiscoveries: string[]; // Recipe IDs pending discovery toast
}

interface RecipeStore extends RecipeStoreState {
  // Actions
  unlockRecipe: (recipeId: string) => void;
  discoverRecipe: (recipeId: string) => void;
  markAsSeen: (recipeId: string) => void;
  clearPendingDiscoveries: () => void;
  
  // Queries
  isUnlocked: (recipeId: string) => boolean;
  isPendingDiscovery: (recipeId: string) => boolean;
  getRecipe: (recipeId: string) => Recipe | undefined;
  getUnlockedRecipes: () => Recipe[];
  getLockedRecipes: () => Recipe[];
  getNextPendingDiscovery: () => Recipe | null;
  
  // Challenge integration
  checkChallengeUnlock: (challengeId: string) => void;
  checkChallengeCountUnlock: (count: number) => void;
  checkTutorialUnlock: () => void;
  checkMachinesCreatedUnlock: (count: number) => void;
  checkActivationCountUnlock: (count: number) => void;
}

const RECIPE_STORAGE_KEY = 'arcane-codex-recipes';

// Helper to check if a recipe exists in the unlocked list (regardless of discovered state)
const isRecipeInList = (
  recipeId: string,
  unlockedRecipes: RecipeUnlockState[]
): boolean => {
  return unlockedRecipes.some((state) => state.recipeId === recipeId);
};

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      unlockedRecipes: [],
      pendingDiscoveries: [],

      // Unlock a recipe (makes it available for use)
      unlockRecipe: (recipeId: string) => {
        const state = get();
        
        // Check if already in the list (unlocked or not yet discovered)
        if (isRecipeInList(recipeId, state.unlockedRecipes)) {
          return;
        }
        
        const recipe = RECIPE_DEFINITIONS.find(r => r.id === recipeId);
        if (!recipe) {
          console.warn(`Recipe not found: ${recipeId}`);
          return;
        }
        
        set((state) => ({
          unlockedRecipes: [
            ...state.unlockedRecipes,
            {
              recipeId,
              unlockedAt: Date.now(),
              discovered: false,
            },
          ],
          pendingDiscoveries: [...state.pendingDiscoveries, recipeId],
        }));
      },

      // Mark recipe as discovered (player has seen the toast)
      discoverRecipe: (recipeId: string) => {
        const state = get();
        const existing = state.unlockedRecipes.find(r => r.recipeId === recipeId);
        
        if (existing) {
          set((state) => ({
            unlockedRecipes: state.unlockedRecipes.map(r =>
              r.recipeId === recipeId ? { ...r, discovered: true } : r
            ),
          }));
        } else {
          // If not unlocked, add as undiscovered
          set((state) => ({
            unlockedRecipes: [
              ...state.unlockedRecipes,
              { recipeId, discovered: false },
            ],
          }));
        }
      },

      // Mark recipe as seen (dismissed the discovery toast)
      markAsSeen: (recipeId: string) => {
        set((state) => ({
          unlockedRecipes: state.unlockedRecipes.map(r =>
            r.recipeId === recipeId ? { ...r, discovered: true } : r
          ),
        }));
      },

      // Clear pending discoveries after showing toast
      clearPendingDiscoveries: () => {
        set({ pendingDiscoveries: [] });
      },

      // Check if recipe is unlocked (available for use)
      isUnlocked: (recipeId: string) => {
        return isRecipeUnlocked(recipeId, get().unlockedRecipes);
      },

      // Check if recipe is pending discovery
      isPendingDiscovery: (recipeId: string) => {
        return get().pendingDiscoveries.includes(recipeId);
      },

      // Get recipe definition by ID
      getRecipe: (recipeId: string) => {
        return RECIPE_DEFINITIONS.find(r => r.id === recipeId);
      },

      // Get all unlocked recipes with their definitions
      getUnlockedRecipes: () => {
        const state = get();
        return RECIPE_DEFINITIONS.filter(recipe => 
          state.isUnlocked(recipe.id)
        );
      },

      // Get all locked recipes with their definitions
      getLockedRecipes: () => {
        const state = get();
        return RECIPE_DEFINITIONS.filter(recipe => 
          !state.isUnlocked(recipe.id)
        );
      },

      // Get next recipe pending discovery
      getNextPendingDiscovery: () => {
        const state = get();
        const pendingId = state.pendingDiscoveries[0];
        if (pendingId) {
          return RECIPE_DEFINITIONS.find(r => r.id === pendingId) || null;
        }
        return null;
      },

      // Check if completing a challenge unlocks any recipes
      checkChallengeUnlock: (challengeId: string) => {
        const recipesToUnlock = RECIPE_DEFINITIONS.filter(
          recipe => 
            recipe.unlockCondition.type === 'challenge_complete' &&
            recipe.unlockCondition.value === challengeId
        );
        
        recipesToUnlock.forEach(recipe => {
          get().unlockRecipe(recipe.id);
        });
      },

      // Check if completing a certain number of challenges unlocks any recipes
      checkChallengeCountUnlock: (count: number) => {
        const recipesToUnlock = RECIPE_DEFINITIONS.filter(
          recipe => 
            recipe.unlockCondition.type === 'challenge_count' &&
            typeof recipe.unlockCondition.value === 'number' &&
            recipe.unlockCondition.value <= count
        );
        
        recipesToUnlock.forEach(recipe => {
          get().unlockRecipe(recipe.id);
        });
      },

      // Check if tutorial completion unlocks any recipes
      checkTutorialUnlock: () => {
        const recipesToUnlock = RECIPE_DEFINITIONS.filter(
          recipe => recipe.unlockCondition.type === 'tutorial_complete'
        );
        
        recipesToUnlock.forEach(recipe => {
          get().unlockRecipe(recipe.id);
        });
      },

      // Check if machines created count unlocks any recipes
      checkMachinesCreatedUnlock: (count: number) => {
        const recipesToUnlock = RECIPE_DEFINITIONS.filter(
          recipe => 
            recipe.unlockCondition.type === 'machines_created' &&
            typeof recipe.unlockCondition.value === 'number' &&
            recipe.unlockCondition.value <= count
        );
        
        recipesToUnlock.forEach(recipe => {
          get().unlockRecipe(recipe.id);
        });
      },

      // Check if activation count unlocks any recipes
      checkActivationCountUnlock: (count: number) => {
        const recipesToUnlock = RECIPE_DEFINITIONS.filter(
          recipe => 
            recipe.unlockCondition.type === 'activation_count' &&
            typeof recipe.unlockCondition.value === 'number' &&
            recipe.unlockCondition.value <= count
        );
        
        recipesToUnlock.forEach(recipe => {
          get().unlockRecipe(recipe.id);
        });
      },
    }),
    {
      name: RECIPE_STORAGE_KEY,
      // FIX: Skip automatic hydration to prevent cascading state updates
      skipHydration: true,
    }
  )
);

// FIX: Helper to manually trigger hydration
export const hydrateRecipeStore = () => {
  useRecipeStore.persist.rehydrate();
};

// FIX: Helper to check if hydration is complete
export const isRecipeHydrated = () => {
  return useRecipeStore.persist.hasHydrated();
};

// FIX: Selector for isUnlocked to prevent full store subscription
export const selectIsUnlocked = (recipeId: string) => (state: RecipeStore) => {
  return isRecipeUnlocked(recipeId, state.unlockedRecipes);
};

// FIX: Selector for unlocked recipes count
export const selectUnlockedCount = (state: RecipeStore) => {
  return state.unlockedRecipes.filter(recipe => 
    isRecipeUnlocked(recipe.recipeId, state.unlockedRecipes)
  ).length;
};
