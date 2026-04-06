/**
 * RecipeStats Component Tests
 * 
 * Tests for the RecipeStats component including:
 * - Total count display
 * - Percentage calculation
 * - Category breakdown
 * - Empty state handling
 * 
 * ROUND 182: New test file created
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { RecipeStats, getRecipeCategory, getAllRecipeCategories } from '../RecipeStats';
import type { Recipe } from '../../../data/recipes';

// Test recipe data factory
const createMockRecipe = (overrides: Partial<Recipe> & { isUnlocked?: boolean } = {}): Recipe & { isUnlocked?: boolean } => ({
  id: 'test-recipe',
  name: 'Test Recipe',
  description: 'This is a test recipe',
  rarity: 'common',
  unlockCondition: {
    type: 'tutorial_complete',
    value: 'first-machine',
    description: 'Complete the first tutorial',
  },
  hint: 'Available from the start',
  ...overrides,
});

describe('RecipeStats Component', () => {
  beforeEach(() => {
    cleanup();
  });

  describe('Total Count Display', () => {
    it('renders with correct data-testid', () => {
      render(<RecipeStats recipes={[]} />);

      expect(screen.getByTestId('recipe-stats')).toBeTruthy();
    });

    it('shows correct total unlocked count', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', isUnlocked: true }),
        createMockRecipe({ id: 'r2', isUnlocked: false }),
        createMockRecipe({ id: 'r3', isUnlocked: true }),
        createMockRecipe({ id: 'r4', isUnlocked: false }),
        createMockRecipe({ id: 'r5', isUnlocked: false }),
      ];

      render(<RecipeStats recipes={recipes} />);

      expect(screen.getByTestId('recipe-stats-total').textContent).toBe('2 / 5 已解锁');
    });

    it('shows 0 / 0 when no recipes', () => {
      render(<RecipeStats recipes={[]} />);

      expect(screen.getByTestId('recipe-stats-total').textContent).toBe('0 / 0 已解锁');
    });

    it('shows 0 / N when no recipes unlocked', () => {
      const recipes = [
        createMockRecipe({ id: 'r1' }),
        createMockRecipe({ id: 'r2' }),
      ];

      render(<RecipeStats recipes={recipes} />);

      expect(screen.getByTestId('recipe-stats-total').textContent).toBe('0 / 2 已解锁');
    });

    it('shows N / N when all recipes unlocked', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', isUnlocked: true }),
        createMockRecipe({ id: 'r2', isUnlocked: true }),
        createMockRecipe({ id: 'r3', isUnlocked: true }),
      ];

      render(<RecipeStats recipes={recipes} />);

      expect(screen.getByTestId('recipe-stats-total').textContent).toBe('3 / 3 已解锁');
    });
  });

  describe('Percentage Calculation', () => {
    it('shows 0% when no recipes unlocked', () => {
      const recipes = [
        createMockRecipe({ id: 'r1' }),
        createMockRecipe({ id: 'r2' }),
      ];

      render(<RecipeStats recipes={recipes} />);

      expect(screen.getByTestId('recipe-stats-percentage').textContent).toBe('0%');
    });

    it('shows 50% when half unlocked', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', isUnlocked: true }),
        createMockRecipe({ id: 'r2', isUnlocked: false }),
      ];

      render(<RecipeStats recipes={recipes} />);

      expect(screen.getByTestId('recipe-stats-percentage').textContent).toBe('50%');
    });

    it('shows 100% when all unlocked', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', isUnlocked: true }),
        createMockRecipe({ id: 'r2', isUnlocked: true }),
      ];

      render(<RecipeStats recipes={recipes} />);

      expect(screen.getByTestId('recipe-stats-percentage').textContent).toBe('100%');
    });

    it('rounds percentage correctly', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', isUnlocked: true }),
        createMockRecipe({ id: 'r2', isUnlocked: false }),
        createMockRecipe({ id: 'r3', isUnlocked: false }),
      ];

      render(<RecipeStats recipes={recipes} />);

      expect(screen.getByTestId('recipe-stats-percentage').textContent).toBe('33%');
    });

    it('shows 0% when no recipes', () => {
      render(<RecipeStats recipes={[]} />);

      expect(screen.getByTestId('recipe-stats-percentage').textContent).toBe('0%');
    });
  });

  describe('Category Breakdown', () => {
    it('shows module category breakdown when recipes have moduleType', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', moduleType: 'core-furnace', isUnlocked: true }),
        createMockRecipe({ id: 'r2', moduleType: 'gear', isUnlocked: false }),
      ];

      render(<RecipeStats recipes={recipes} />);

      expect(screen.getByTestId('recipe-stats-category-modules')).toBeTruthy();
    });

    it('shows challenge category breakdown for challenge_complete recipes', () => {
      const recipes = [
        createMockRecipe({ 
          id: 'r1', 
          unlockCondition: { 
            type: 'challenge_complete', 
            value: 'challenge-001', 
            description: 'Complete challenge' 
          } 
        }),
      ];

      render(<RecipeStats recipes={recipes} />);

      expect(screen.getByTestId('recipe-stats-category-challenges')).toBeTruthy();
    });

    it('shows achievement category breakdown for threshold-based recipes', () => {
      const recipes = [
        createMockRecipe({ 
          id: 'r1', 
          unlockCondition: { 
            type: 'machines_created', 
            value: 5, 
            description: 'Create 5 machines' 
          } 
        }),
      ];

      render(<RecipeStats recipes={recipes} />);

      expect(screen.getByTestId('recipe-stats-category-achievements')).toBeTruthy();
    });

    it('shows tech category breakdown for tech_level recipes', () => {
      const recipes = [
        createMockRecipe({ 
          id: 'r1', 
          unlockCondition: { 
            type: 'tech_level', 
            value: 'void-t3', 
            description: 'Requires Void T3 Tech' 
          } 
        }),
      ];

      render(<RecipeStats recipes={recipes} />);

      expect(screen.getByTestId('recipe-stats-category-tech')).toBeTruthy();
    });

    it('hides category breakdown when showCategoryBreakdown is false', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', moduleType: 'core-furnace' }),
      ];

      render(<RecipeStats recipes={recipes} showCategoryBreakdown={false} />);

      expect(screen.queryByTestId('recipe-stats-category-modules')).toBeNull();
    });
  });

  describe('Helper Functions', () => {
    describe('getRecipeCategory', () => {
      it('returns modules for recipes with moduleType', () => {
        const recipe = createMockRecipe({ moduleType: 'core-furnace' });
        expect(getRecipeCategory(recipe as Recipe)).toBe('modules');
      });

      it('returns challenges for challenge_complete recipes', () => {
        const recipe = createMockRecipe({ 
          unlockCondition: { 
            type: 'challenge_complete', 
            value: 'challenge-001', 
            description: 'Test' 
          } 
        });
        expect(getRecipeCategory(recipe as Recipe)).toBe('challenges');
      });

      it('returns achievements for machines_created recipes', () => {
        const recipe = createMockRecipe({ 
          unlockCondition: { 
            type: 'machines_created', 
            value: 5, 
            description: 'Test' 
          } 
        });
        expect(getRecipeCategory(recipe as Recipe)).toBe('achievements');
      });

      it('returns achievements for activation_count recipes', () => {
        const recipe = createMockRecipe({ 
          unlockCondition: { 
            type: 'activation_count', 
            value: 50, 
            description: 'Test' 
          } 
        });
        expect(getRecipeCategory(recipe as Recipe)).toBe('achievements');
      });

      it('returns tech for tech_level recipes', () => {
        const recipe = createMockRecipe({ 
          unlockCondition: { 
            type: 'tech_level', 
            value: 'void-t3', 
            description: 'Test' 
          } 
        });
        expect(getRecipeCategory(recipe as Recipe)).toBe('tech');
      });

      it('returns achievements for tutorial_complete recipes', () => {
        const recipe = createMockRecipe({ 
          unlockCondition: { 
            type: 'tutorial_complete', 
            value: 'first-machine', 
            description: 'Test' 
          } 
        });
        expect(getRecipeCategory(recipe as Recipe)).toBe('achievements');
      });
    });

    describe('getAllRecipeCategories', () => {
      it('returns all 4 categories', () => {
        const categories = getAllRecipeCategories();
        expect(categories).toContain('modules');
        expect(categories).toContain('challenges');
        expect(categories).toContain('achievements');
        expect(categories).toContain('tech');
        expect(categories.length).toBe(4);
      });
    });
  });

  describe('Empty States', () => {
    it('renders with 0% when recipes array is empty', () => {
      render(<RecipeStats recipes={[]} />);

      expect(screen.getByTestId('recipe-stats-percentage').textContent).toBe('0%');
    });

    it('renders without category breakdown when no recipes', () => {
      render(<RecipeStats recipes={[]} />);

      expect(screen.queryByTestId('recipe-stats-category-modules')).toBeNull();
    });
  });
});
