/**
 * RecipeCard Component Tests
 * 
 * Tests for the RecipeCard component including:
 * - Progress indicator display for threshold-based locked recipes
 * - Checkmark display for unlocked recipes
 * - No progress for non-threshold recipes
 * - Visual states for locked/unlocked
 * 
 * ROUND 182: New test file created
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { RecipeCard } from '../RecipeCard';
import type { Recipe } from '../../../data/recipes';

// Mock the stats store
vi.mock('../../../store/useStatsStore', () => ({
  useStatsStore: {
    getState: vi.fn(() => ({
      machinesCreated: 3,
      activations: 5,
    })),
  },
}));

// Test recipe data factory
const createMockRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
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

describe('RecipeCard Component', () => {
  beforeEach(() => {
    cleanup();
  });

  describe('Basic Rendering', () => {
    it('renders with correct data-testid', () => {
      const recipe = createMockRecipe({ id: 'recipe-1' });

      render(<RecipeCard recipe={recipe} isUnlocked={false} />);

      expect(screen.getByTestId('recipe-card-recipe-1')).toBeTruthy();
    });

    it('displays recipe name', () => {
      const recipe = createMockRecipe({ id: 'r1', name: 'Core Furnace' });

      render(<RecipeCard recipe={recipe} isUnlocked={true} />);

      expect(screen.getByText('Core Furnace')).toBeTruthy();
    });

    it('displays recipe description when unlocked', () => {
      const recipe = createMockRecipe({ 
        id: 'r1', 
        description: 'A powerful furnace for machines' 
      });

      render(<RecipeCard recipe={recipe} isUnlocked={true} />);

      expect(screen.getByText('A powerful furnace for machines')).toBeTruthy();
    });

    it('displays hint when locked', () => {
      const recipe = createMockRecipe({ 
        id: 'r1', 
        hint: 'Complete challenges to unlock' 
      });

      render(<RecipeCard recipe={recipe} isUnlocked={false} />);

      expect(screen.getByText('Complete challenges to unlock')).toBeTruthy();
    });

    it('displays rarity badge', () => {
      const recipe = createMockRecipe({ id: 'r1', rarity: 'legendary' });

      render(<RecipeCard recipe={recipe} isUnlocked={true} />);

      expect(screen.getByText('legendary')).toBeTruthy();
    });
  });

  describe('AC-182-005: Progress Indicator', () => {
    describe('Threshold-based locked recipes', () => {
      it('shows progress indicator for machines_created threshold-based locked recipes', () => {
        const recipe = createMockRecipe({ 
          id: 'amplifier-crystal',
          name: 'Amplifier Crystal',
          unlockCondition: { 
            type: 'machines_created', 
            value: 5, 
            description: 'Create 5 unique machines' 
          }
        });

        render(<RecipeCard recipe={recipe} isUnlocked={false} />);

        expect(screen.getByTestId('recipe-progress-amplifier-crystal')).toBeTruthy();
      });

      it('shows progress indicator for activation_count threshold-based locked recipes', () => {
        const recipe = createMockRecipe({ 
          id: 'void-siphon',
          name: 'Void Siphon',
          unlockCondition: { 
            type: 'activation_count', 
            value: 50, 
            description: 'Activate machines 50 times' 
          }
        });

        render(<RecipeCard recipe={recipe} isUnlocked={false} />);

        expect(screen.getByTestId('recipe-progress-void-siphon')).toBeTruthy();
      });

      it('shows progress indicator for challenge_count threshold-based locked recipes', () => {
        const recipe = createMockRecipe({ 
          id: 'lightning-conductor',
          name: 'Lightning Conductor',
          unlockCondition: { 
            type: 'challenge_count', 
            value: 3, 
            description: 'Complete 3 challenges' 
          }
        });

        render(<RecipeCard recipe={recipe} isUnlocked={false} />);

        expect(screen.getByTestId('recipe-progress-lightning-conductor')).toBeTruthy();
      });

      it('shows correct progress format "current / threshold"', () => {
        const recipe = createMockRecipe({ 
          id: 'r1',
          unlockCondition: { 
            type: 'machines_created', 
            value: 5, 
            description: 'Create 5 machines' 
          }
        });

        render(<RecipeCard recipe={recipe} isUnlocked={false} />);

        const progressText = screen.getByTestId('recipe-progress-r1').textContent;
        // Should show something like "3 / 5" based on mock stats store
        expect(progressText).toContain('/');
      });
    });

    describe('Unlocked threshold-based recipes', () => {
      it('does NOT show progress indicator for unlocked threshold-based recipes', () => {
        const recipe = createMockRecipe({ 
          id: 'amplifier-crystal',
          unlockCondition: { 
            type: 'machines_created', 
            value: 5, 
            description: 'Create 5 unique machines' 
          }
        });

        render(<RecipeCard recipe={recipe} isUnlocked={true} />);

        expect(screen.queryByTestId('recipe-progress-amplifier-crystal')).toBeNull();
      });
    });

    describe('Non-threshold locked recipes', () => {
      it('does NOT show progress indicator for tutorial_complete recipes', () => {
        const recipe = createMockRecipe({ 
          id: 'core-furnace',
          unlockCondition: { 
            type: 'tutorial_complete', 
            value: 'first-machine', 
            description: 'Complete the first tutorial' 
          }
        });

        render(<RecipeCard recipe={recipe} isUnlocked={false} />);

        expect(screen.queryByTestId('recipe-progress-core-furnace')).toBeNull();
      });

      it('does NOT show progress indicator for challenge_complete recipes', () => {
        const recipe = createMockRecipe({ 
          id: 'energy-pipe',
          unlockCondition: { 
            type: 'challenge_complete', 
            value: 'challenge-001', 
            description: 'Complete Challenge: First Activation' 
          }
        });

        render(<RecipeCard recipe={recipe} isUnlocked={false} />);

        expect(screen.queryByTestId('recipe-progress-energy-pipe')).toBeNull();
      });

      it('does NOT show progress indicator for tech_level recipes', () => {
        const recipe = createMockRecipe({ 
          id: 'phase-modulator',
          unlockCondition: { 
            type: 'tech_level', 
            value: 'void-t3', 
            description: 'Requires: Void T3 Tech' 
          }
        });

        render(<RecipeCard recipe={recipe} isUnlocked={false} />);

        expect(screen.queryByTestId('recipe-progress-phase-modulator')).toBeNull();
      });

      it('does NOT show progress indicator for connection_count recipes', () => {
        const recipe = createMockRecipe({ 
          id: 'r1',
          unlockCondition: { 
            type: 'connection_count', 
            value: 10, 
            description: 'Create 10 connections' 
          }
        });

        render(<RecipeCard recipe={recipe} isUnlocked={false} />);

        expect(screen.queryByTestId('recipe-progress-r1')).toBeNull();
      });
    });
  });

  describe('Visual States', () => {
    it('has unlocked data attribute when unlocked', () => {
      const recipe = createMockRecipe({ id: 'r1' });

      render(<RecipeCard recipe={recipe} isUnlocked={true} />);

      expect(screen.getByTestId('recipe-card-r1').getAttribute('data-unlocked')).toBe('true');
    });

    it('has unlocked data attribute when locked', () => {
      const recipe = createMockRecipe({ id: 'r1' });

      render(<RecipeCard recipe={recipe} isUnlocked={false} />);

      expect(screen.getByTestId('recipe-card-r1').getAttribute('data-unlocked')).toBe('false');
    });

    it('renders with correct recipe id data attribute', () => {
      const recipe = createMockRecipe({ id: 'my-recipe-id' });

      render(<RecipeCard recipe={recipe} isUnlocked={false} />);

      expect(screen.getByTestId('recipe-card-my-recipe-id').getAttribute('data-recipe-id')).toBe('my-recipe-id');
    });
  });

  describe('Faction Variants', () => {
    it('displays faction variant badge when isFactionVariant is true', () => {
      const recipe = createMockRecipe({ id: 'r1' });

      render(
        <RecipeCard 
          recipe={recipe} 
          isUnlocked={true} 
          isFactionVariant={true}
          factionColor="#ff0000"
        />
      );

      expect(screen.getByText('GM')).toBeTruthy();
    });

    it('does not show GM badge when isFactionVariant is false', () => {
      const recipe = createMockRecipe({ id: 'r1' });

      render(<RecipeCard recipe={recipe} isUnlocked={true} isFactionVariant={false} />);

      expect(screen.queryByText('GM')).toBeNull();
    });
  });

  describe('onClick Handler', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      const recipe = createMockRecipe({ id: 'r1' });

      render(<RecipeCard recipe={recipe} isUnlocked={false} onClick={handleClick} />);

      screen.getByTestId('recipe-card-r1').click();

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not crash when onClick is not provided', () => {
      const recipe = createMockRecipe({ id: 'r1' });

      expect(() => {
        render(<RecipeCard recipe={recipe} isUnlocked={false} />);
      }).not.toThrow();
    });
  });

  describe('showHint Option', () => {
    it('shows hint by default when locked', () => {
      const recipe = createMockRecipe({ id: 'r1', hint: 'Test hint' });

      render(<RecipeCard recipe={recipe} isUnlocked={false} />);

      expect(screen.getByText('Test hint')).toBeTruthy();
    });

    it('hides hint when showHint is false', () => {
      const recipe = createMockRecipe({ id: 'r1', hint: 'Test hint' });

      render(<RecipeCard recipe={recipe} isUnlocked={false} showHint={false} />);

      expect(screen.queryByText('Test hint')).toBeNull();
    });
  });
});
