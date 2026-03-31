/**
 * Tech-Recipe Integration Tests
 * 
 * Tests for tech-level recipe unlock conditions and relock behavior.
 * Validates that recipes unlock when tech is completed and relock when tech is reset.
 * Note: relockTechRecipes removes ALL tech-locked recipes - they must be re-unlocked
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useFactionReputationStore } from '../store/useFactionReputationStore';
import { useRecipeStore } from '../store/useRecipeStore';
import { RECIPE_DEFINITIONS, checkTechLevelRequirement } from '../data/recipes';
import { RESEARCH_DURATION_MS } from '../types/factionReputation';

// Reset stores helper
function resetStores() {
  useFactionReputationStore.setState({
    reputations: { void: 0, inferno: 0, storm: 0, stellar: 0 },
    totalReputationEarned: 0,
    currentResearch: {},
    completedResearch: { void: [], inferno: [], storm: [], stellar: [] },
  });
  
  useRecipeStore.setState({
    unlockedRecipes: [],
    pendingDiscoveries: [],
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

// Helper to check if recipe is in unlocked list (regardless of discovered state)
function isInUnlockedList(recipeId: string): boolean {
  const unlockedRecipes = useRecipeStore.getState().unlockedRecipes;
  return unlockedRecipes.some(r => r.recipeId === recipeId);
}

/**
 * Helper to perform full faction tech reset including recipe relocking
 * relockTechRecipes removes ALL tech-locked recipes (not just the faction's)
 */
function resetFactionTechWithRelock(factionId: string) {
  useFactionReputationStore.getState().resetFactionTech(factionId);
  useRecipeStore.getState().relockTechRecipes();
}

describe('Tech-Recipe Integration', () => {
  beforeEach(() => {
    resetStores();
  });

  afterEach(() => {
    resetStores();
  });

  describe('checkTechLevelRequirement helper', () => {
    it('returns false when no research completed', () => {
      const result = checkTechLevelRequirement('void-t3', { void: [], inferno: [], storm: [], stellar: [] });
      expect(result).toBe(false);
    });

    it('returns false when wrong faction has completed research', () => {
      const result = checkTechLevelRequirement('void-t3', { 
        void: [], 
        inferno: ['inferno-tier-3'], 
        storm: [], 
        stellar: [] 
      });
      expect(result).toBe(false);
    });

    it('returns true when exact required tech is completed', () => {
      const result = checkTechLevelRequirement('void-t3', { 
        void: ['void-tier-1', 'void-tier-2', 'void-tier-3'], 
        inferno: [], 
        storm: [], 
        stellar: [] 
      });
      expect(result).toBe(true);
    });

    it('returns true when required tier is completed (even if higher tiers not done)', () => {
      const result = checkTechLevelRequirement('void-t1', { 
        void: ['void-tier-1'], 
        inferno: [], 
        storm: [], 
        stellar: [] 
      });
      expect(result).toBe(true);
    });

    it('returns false when required tier not completed', () => {
      const result = checkTechLevelRequirement('void-t3', { 
        void: ['void-tier-1', 'void-tier-2'], 
        inferno: [], 
        storm: [], 
        stellar: [] 
      });
      expect(result).toBe(false);
    });

    it('handles OR condition (array) - true when first matches', () => {
      const result = checkTechLevelRequirement(['void-t2', 'storm-t1'], { 
        void: ['void-tier-2'], 
        inferno: [], 
        storm: [], 
        stellar: [] 
      });
      expect(result).toBe(true);
    });

    it('handles OR condition (array) - true when second matches', () => {
      const result = checkTechLevelRequirement(['void-t2', 'storm-t1'], { 
        void: [], 
        inferno: [], 
        storm: ['storm-tier-1'], 
        stellar: [] 
      });
      expect(result).toBe(true);
    });

    it('handles OR condition (array) - false when neither matches', () => {
      const result = checkTechLevelRequirement(['void-t2', 'storm-t1'], { 
        void: ['void-tier-1'], 
        inferno: [], 
        storm: [], 
        stellar: [] 
      });
      expect(result).toBe(false);
    });

    it('handles OR condition (array) - true when both match', () => {
      const result = checkTechLevelRequirement(['void-t2', 'storm-t1'], { 
        void: ['void-tier-2'], 
        inferno: [], 
        storm: ['storm-tier-1'], 
        stellar: [] 
      });
      expect(result).toBe(true);
    });
  });

  describe('Phase Modulator Recipe (requires void-t3)', () => {
    it('recipe is not in unlocked list initially', () => {
      expect(isInUnlockedList('recipe-phase-modulator')).toBe(false);
    });

    it('recipe is added to unlocked list when void-t3 is completed', () => {
      completeResearch('void', 3);
      useRecipeStore.getState().checkTechLevelUnlocks();
      expect(isInUnlockedList('recipe-phase-modulator')).toBe(true);
    });

    it('recipe is NOT added with only void-t1 (lower tier)', () => {
      completeResearch('void', 1);
      useRecipeStore.getState().checkTechLevelUnlocks();
      expect(isInUnlockedList('recipe-phase-modulator')).toBe(false);
    });

    it('recipe is NOT added with only void-t2 (still lower than required)', () => {
      completeResearch('void', 2);
      useRecipeStore.getState().checkTechLevelUnlocks();
      expect(isInUnlockedList('recipe-phase-modulator')).toBe(false);
    });

    it('recipe is REMOVED when void faction is reset', () => {
      // Complete void T3
      completeResearch('void', 3);
      useRecipeStore.getState().checkTechLevelUnlocks();
      expect(isInUnlockedList('recipe-phase-modulator')).toBe(true);
      
      // Reset void faction WITH relock
      resetFactionTechWithRelock('void');
      
      // Recipe should be removed from unlocked list
      expect(isInUnlockedList('recipe-phase-modulator')).toBe(false);
    });

    it('recipe is REMOVED when void reputation is reset', () => {
      // Complete void T3
      completeResearch('void', 3);
      useRecipeStore.getState().checkTechLevelUnlocks();
      expect(isInUnlockedList('recipe-phase-modulator')).toBe(true);
      
      // Reset void reputation WITH relock
      useFactionReputationStore.getState().resetReputation('void');
      useRecipeStore.getState().relockTechRecipes();
      
      // Recipe should be removed from unlocked list
      expect(isInUnlockedList('recipe-phase-modulator')).toBe(false);
    });
  });

  describe('Dimension Rift Recipe (OR condition: void-t2 OR storm-t1)', () => {
    it('recipe is added with void-t2 (first option)', () => {
      completeResearch('void', 2);
      useRecipeStore.getState().checkTechLevelUnlocks();
      expect(isInUnlockedList('recipe-dimension-rift')).toBe(true);
    });

    it('recipe is added with storm-t1 (second option)', () => {
      completeResearch('storm', 1);
      useRecipeStore.getState().checkTechLevelUnlocks();
      expect(isInUnlockedList('recipe-dimension-rift')).toBe(true);
    });

    it('recipe is NOT added with void-t1 only (not enough)', () => {
      completeResearch('void', 1);
      useRecipeStore.getState().checkTechLevelUnlocks();
      expect(isInUnlockedList('recipe-dimension-rift')).toBe(false);
    });

    it('recipe is REMOVED when OR option is reset', () => {
      // Complete storm-t1 (unlocks via second option)
      completeResearch('storm', 1);
      useRecipeStore.getState().checkTechLevelUnlocks();
      expect(isInUnlockedList('recipe-dimension-rift')).toBe(true);
      
      // Reset storm faction WITH relock
      resetFactionTechWithRelock('storm');
      
      // Recipe should be removed from unlocked list
      expect(isInUnlockedList('recipe-dimension-rift')).toBe(false);
    });
  });

  describe('Non-tech recipes are unaffected', () => {
    it('non-tech recipes can still be unlocked normally', () => {
      const coreFurnaceRecipe = RECIPE_DEFINITIONS.find(r => r.id === 'recipe-core-furnace');
      expect(coreFurnaceRecipe?.unlockCondition.type).toBe('tutorial_complete');
    });

    it('tech reset does not affect non-tech recipes', () => {
      // Manually unlock a non-tech recipe
      useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
      expect(isInUnlockedList('recipe-core-furnace')).toBe(true);
      
      // Reset void faction (this resets ALL tech recipes)
      completeResearch('void', 3);
      resetFactionTechWithRelock('void');
      
      // Non-tech recipe should still be in unlocked list
      expect(isInUnlockedList('recipe-core-furnace')).toBe(true);
    });
  });

  describe('isUnlockConditionMet reactive check', () => {
    it('returns true when tech requirement is met', () => {
      completeResearch('void', 3);
      expect(useRecipeStore.getState().isUnlockConditionMet('recipe-phase-modulator')).toBe(true);
    });

    it('returns false when tech requirement is not met', () => {
      completeResearch('void', 2);
      expect(useRecipeStore.getState().isUnlockConditionMet('recipe-phase-modulator')).toBe(false);
    });

    it('returns false for non-tech recipes', () => {
      expect(useRecipeStore.getState().isUnlockConditionMet('recipe-core-furnace')).toBe(false);
    });
  });

  describe('relockTechRecipes action', () => {
    it('relockTechRecipes removes ALL tech-level recipes from unlocked list', () => {
      // Complete multiple tech researches
      completeResearch('void', 3);
      completeResearch('storm', 1);
      useRecipeStore.getState().checkTechLevelUnlocks();
      
      expect(isInUnlockedList('recipe-phase-modulator')).toBe(true);
      expect(isInUnlockedList('recipe-dimension-rift')).toBe(true);
      
      // Call relock - this removes ALL tech recipes
      useRecipeStore.getState().relockTechRecipes();
      
      expect(isInUnlockedList('recipe-phase-modulator')).toBe(false);
      expect(isInUnlockedList('recipe-dimension-rift')).toBe(false);
    });

    it('relockTechRecipes does not remove non-tech recipes', () => {
      useRecipeStore.getState().unlockRecipe('recipe-core-furnace');
      useRecipeStore.getState().relockTechRecipes();
      expect(isInUnlockedList('recipe-core-furnace')).toBe(true);
    });
  });

  describe('Recipe hint display', () => {
    it('Phase Modulator shows correct hint', () => {
      const recipe = RECIPE_DEFINITIONS.find(r => r.id === 'recipe-phase-modulator');
      expect(recipe?.hint).toContain('Void T3');
    });

    it('Dimension Rift shows OR hint', () => {
      const recipe = RECIPE_DEFINITIONS.find(r => r.id === 'recipe-dimension-rift');
      expect(recipe?.hint).toContain('Void T2 or Storm T1');
    });
  });

  describe('Negative tests', () => {
    it('unlocking recipe with wrong tech does not work', () => {
      completeResearch('inferno', 3);
      useRecipeStore.getState().checkTechLevelUnlocks();
      expect(isInUnlockedList('recipe-phase-modulator')).toBe(false);
    });

    it('resetting faction removes all tech-locked recipes (not just faction-specific)', () => {
      // Complete void T3 (unlocks phase modulator)
      // AND storm T1 (also unlocks dimension rift)
      completeResearch('void', 3);
      completeResearch('storm', 1);
      useRecipeStore.getState().checkTechLevelUnlocks();
      
      expect(isInUnlockedList('recipe-phase-modulator')).toBe(true);
      expect(isInUnlockedList('recipe-dimension-rift')).toBe(true);
      
      // Resetting VOID faction removes ALL tech recipes (not just void-related)
      resetFactionTechWithRelock('void');
      
      // Both tech recipes should be removed
      expect(isInUnlockedList('recipe-phase-modulator')).toBe(false);
      expect(isInUnlockedList('recipe-dimension-rift')).toBe(false);
    });
  });
});
