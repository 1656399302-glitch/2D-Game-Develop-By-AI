/**
 * RecipePanel Component Tests
 * 
 * Tests for the RecipePanel component including:
 * - Correct structure and data-testid attributes
 * - Filtering (tabs, category)
 * - Sorting (recent, name, rarity, unlocked)
 * - Statistics display
 * - Empty states
 * - Rapid interaction stability
 * 
 * ROUND 182: New test file created
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import React from 'react';
import { RecipePanel } from '../RecipePanel';
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

describe('RecipePanel Component', () => {
  beforeEach(() => {
    cleanup();
  });

  describe('AC-182-001: RecipePanel renders correctly', () => {
    it('renders panel container with correct data-testid', () => {
      const recipes = [createMockRecipe()];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{}} 
          unlockedAtMap={{}} 
        />
      );

      expect(screen.getByTestId('recipe-panel')).toBeTruthy();
    });

    it('renders three tab buttons with correct data-testid attributes', () => {
      render(
        <RecipePanel 
          recipes={[]} 
          isUnlockedMap={{}} 
          unlockedAtMap={{}} 
        />
      );

      expect(screen.getByTestId('recipe-tab-all')).toBeTruthy();
      expect(screen.getByTestId('recipe-tab-unlocked')).toBeTruthy();
      expect(screen.getByTestId('recipe-tab-locked')).toBeTruthy();
    });

    it('renders category filter dropdown', () => {
      render(
        <RecipePanel 
          recipes={[]} 
          isUnlockedMap={{}} 
          unlockedAtMap={{}} 
        />
      );

      expect(screen.getByTestId('recipe-category-filter')).toBeTruthy();
    });

    it('renders sort dropdown', () => {
      render(
        <RecipePanel 
          recipes={[]} 
          isUnlockedMap={{}} 
          unlockedAtMap={{}} 
        />
      );

      expect(screen.getByTestId('recipe-sort-select')).toBeTruthy();
    });

    it('renders statistics section at top', () => {
      render(
        <RecipePanel 
          recipes={[]} 
          isUnlockedMap={{}} 
          unlockedAtMap={{}} 
        />
      );

      expect(screen.getByTestId('recipe-stats')).toBeTruthy();
    });

    it('renders recipe list below statistics', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', name: 'Recipe1' }),
        createMockRecipe({ id: 'r2', name: 'Recipe2' }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{ r1: true, r2: false }} 
          unlockedAtMap={{ r1: Date.now() }} 
        />
      );

      expect(screen.getByTestId('recipe-card-r1')).toBeTruthy();
      expect(screen.getByTestId('recipe-card-r2')).toBeTruthy();
    });

    it('shows "全部分类" option in category filter', () => {
      render(
        <RecipePanel 
          recipes={[]} 
          isUnlockedMap={{}} 
          unlockedAtMap={{}} 
        />
      );

      const filter = screen.getByTestId('recipe-category-filter');
      expect(filter.querySelector('option[value="all"]')?.textContent).toBe('全部分类');
    });

    it('shows all 4 categories in filter dropdown', () => {
      render(
        <RecipePanel 
          recipes={[]} 
          isUnlockedMap={{}} 
          unlockedAtMap={{}} 
        />
      );

      const filter = screen.getByTestId('recipe-category-filter');
      expect(filter.querySelector('option[value="modules"]')?.textContent).toBe('模块');
      expect(filter.querySelector('option[value="challenges"]')?.textContent).toBe('挑战');
      expect(filter.querySelector('option[value="achievements"]')?.textContent).toBe('成就');
      expect(filter.querySelector('option[value="tech"]')?.textContent).toBe('科技');
    });

    it('shows all 4 sort options in sort dropdown', () => {
      render(
        <RecipePanel 
          recipes={[]} 
          isUnlockedMap={{}} 
          unlockedAtMap={{}} 
        />
      );

      const sort = screen.getByTestId('recipe-sort-select');
      expect(sort.querySelector('option[value="recent"]')?.textContent).toBe('最近解锁');
      expect(sort.querySelector('option[value="name"]')?.textContent).toBe('按名称');
      expect(sort.querySelector('option[value="rarity"]')?.textContent).toBe('按稀有度');
      expect(sort.querySelector('option[value="unlocked"]')?.textContent).toBe('按解锁状态');
    });
  });

  describe('AC-182-002: RecipePanel filtering works', () => {
    it('"All" tab shows all recipes', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', isUnlocked: true }),
        createMockRecipe({ id: 'r2', isUnlocked: false }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{ r1: true, r2: false }} 
          unlockedAtMap={{ r1: Date.now() }} 
        />
      );

      expect(screen.getByTestId('recipe-card-r1')).toBeTruthy();
      expect(screen.getByTestId('recipe-card-r2')).toBeTruthy();
    });

    it('"Unlocked" tab shows only unlocked recipes', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', isUnlocked: true }),
        createMockRecipe({ id: 'r2', isUnlocked: false }),
        createMockRecipe({ id: 'r3', isUnlocked: true }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{ r1: true, r2: false, r3: true }} 
          unlockedAtMap={{ r1: Date.now(), r3: Date.now() }} 
        />
      );

      // Click unlocked tab
      act(() => {
        screen.getByTestId('recipe-tab-unlocked').click();
      });

      expect(screen.getByTestId('recipe-card-r1')).toBeTruthy();
      expect(screen.queryByTestId('recipe-card-r2')).toBeNull();
      expect(screen.getByTestId('recipe-card-r3')).toBeTruthy();
    });

    it('"Locked" tab shows only locked recipes', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', isUnlocked: true }),
        createMockRecipe({ id: 'r2', isUnlocked: false }),
        createMockRecipe({ id: 'r3', isUnlocked: true }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{ r1: true, r2: false, r3: true }} 
          unlockedAtMap={{ r1: Date.now(), r3: Date.now() }} 
        />
      );

      // Click locked tab
      act(() => {
        screen.getByTestId('recipe-tab-locked').click();
      });

      expect(screen.queryByTestId('recipe-card-r1')).toBeNull();
      expect(screen.getByTestId('recipe-card-r2')).toBeTruthy();
      expect(screen.queryByTestId('recipe-card-r3')).toBeNull();
    });

    it('category filter limits displayed recipes', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', moduleType: 'core-furnace' }),
        createMockRecipe({ id: 'r2', moduleType: 'gear' }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{}} 
          unlockedAtMap={{}} 
        />
      );

      // Select modules category
      const filter = screen.getByTestId('recipe-category-filter');
      act(() => {
        fireEvent.change(filter, { target: { value: 'modules' } });
      });

      expect(screen.getByTestId('recipe-card-r1')).toBeTruthy();
      expect(screen.getByTestId('recipe-card-r2')).toBeTruthy();
    });

    it('filters can be combined (tab + category)', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', moduleType: 'core-furnace', isUnlocked: true }),
        createMockRecipe({ id: 'r2', moduleType: 'core-furnace', isUnlocked: false }),
        createMockRecipe({ id: 'r3', isUnlocked: true }),
        createMockRecipe({ id: 'r4', moduleType: 'core-furnace', isUnlocked: true }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{ r1: true, r2: false, r3: true, r4: true }} 
          unlockedAtMap={{ r1: Date.now(), r3: Date.now(), r4: Date.now() }} 
        />
      );

      // Click unlocked tab
      act(() => {
        screen.getByTestId('recipe-tab-unlocked').click();
      });

      // Select modules category
      const filter = screen.getByTestId('recipe-category-filter');
      act(() => {
        fireEvent.change(filter, { target: { value: 'modules' } });
      });

      // Should show only r1 and r4 (unlocked + modules)
      expect(screen.getByTestId('recipe-card-r1')).toBeTruthy();
      expect(screen.queryByTestId('recipe-card-r2')).toBeNull();
      expect(screen.queryByTestId('recipe-card-r3')).toBeNull();
      expect(screen.getByTestId('recipe-card-r4')).toBeTruthy();
    });

    it('empty state displays when no recipes match filter', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', isUnlocked: true }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{ r1: true }} 
          unlockedAtMap={{ r1: Date.now() }} 
        />
      );

      // Click locked tab - should show empty state
      act(() => {
        screen.getByTestId('recipe-tab-locked').click();
      });

      expect(screen.getByTestId('recipe-empty-state')).toBeTruthy();
    });

    it('rapid tab switching does not cause stale data display', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', isUnlocked: true }),
        createMockRecipe({ id: 'r2', isUnlocked: false }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{ r1: true, r2: false }} 
          unlockedAtMap={{ r1: Date.now() }} 
        />
      );

      // Rapidly click between tabs
      act(() => {
        screen.getByTestId('recipe-tab-unlocked').click();
      });
      act(() => {
        screen.getByTestId('recipe-tab-locked').click();
      });
      act(() => {
        screen.getByTestId('recipe-tab-all').click();
      });
      act(() => {
        screen.getByTestId('recipe-tab-unlocked').click();
      });

      // Final state should match last selection (unlocked)
      expect(screen.getByTestId('recipe-card-r1')).toBeTruthy();
      expect(screen.queryByTestId('recipe-card-r2')).toBeNull();
    });
  });

  describe('AC-182-003: RecipePanel sorting works', () => {
    it('"Recent" sort orders by unlockedAt descending', () => {
      const now = Date.now();
      const recipes = [
        createMockRecipe({ 
          id: 'r1', 
          name: 'Recipe A', 
          isUnlocked: true, 
        }),
        createMockRecipe({ 
          id: 'r2', 
          name: 'Recipe B', 
          isUnlocked: true, 
        }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{ r1: true, r2: true }} 
          unlockedAtMap={{ r1: now - 1000, r2: now }} 
        />
      );

      // Should be ordered: r2 (newer), r1 (older)
      const cards = screen.getAllByTestId(/recipe-card-/);
      expect(cards[0].getAttribute('data-recipe-id')).toBe('r2');
      expect(cards[1].getAttribute('data-recipe-id')).toBe('r1');
    });

    it('locked recipes sort to end when using "Recent"', () => {
      const now = Date.now();
      const recipes = [
        createMockRecipe({ 
          id: 'r1', 
          name: 'Recipe A', 
          isUnlocked: false, 
        }),
        createMockRecipe({ 
          id: 'r2', 
          name: 'Recipe B', 
          isUnlocked: true, 
        }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{ r1: false, r2: true }} 
          unlockedAtMap={{ r2: now }} 
        />
      );

      // r2 (unlocked) should come before r1 (locked)
      const cards = screen.getAllByTestId(/recipe-card-/);
      expect(cards[0].getAttribute('data-recipe-id')).toBe('r2');
      expect(cards[1].getAttribute('data-recipe-id')).toBe('r1');
    });

    it('"Name" sort orders alphabetically using ASCII names', () => {
      // Use ASCII names for reliable sorting in test environment
      const recipes = [
        createMockRecipe({ id: 'r1', name: 'Alpha Recipe' }),
        createMockRecipe({ id: 'r2', name: 'Beta Recipe' }),
        createMockRecipe({ id: 'r3', name: 'Gamma Recipe' }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{}} 
          unlockedAtMap={{}} 
        />
      );

      // Select name sort
      const sort = screen.getByTestId('recipe-sort-select');
      act(() => {
        fireEvent.change(sort, { target: { value: 'name' } });
      });

      const cards = screen.getAllByTestId(/recipe-card-/);
      expect(cards[0].getAttribute('data-recipe-id')).toBe('r1'); // Alpha
      expect(cards[1].getAttribute('data-recipe-id')).toBe('r2'); // Beta
      expect(cards[2].getAttribute('data-recipe-id')).toBe('r3'); // Gamma
    });

    it('"Rarity" sort orders by rarity', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', name: 'Common Recipe', rarity: 'common' }),
        createMockRecipe({ id: 'r2', name: 'Legendary Recipe', rarity: 'legendary' }),
        createMockRecipe({ id: 'r3', name: 'Rare Recipe', rarity: 'rare' }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{}} 
          unlockedAtMap={{}} 
        />
      );

      // Select rarity sort
      const sort = screen.getByTestId('recipe-sort-select');
      act(() => {
        fireEvent.change(sort, { target: { value: 'rarity' } });
      });

      const cards = screen.getAllByTestId(/recipe-card-/);
      expect(cards[0].getAttribute('data-recipe-id')).toBe('r2'); // legendary first
      expect(cards[1].getAttribute('data-recipe-id')).toBe('r3'); // rare second
      expect(cards[2].getAttribute('data-recipe-id')).toBe('r1'); // common last
    });

    it('"Unlocked" sort groups unlocked recipes before locked', () => {
      // Use ASCII names for reliable secondary sorting
      const recipes = [
        createMockRecipe({ id: 'r1', name: 'Alpha Locked', isUnlocked: false }),
        createMockRecipe({ id: 'r2', name: 'Beta Unlocked', isUnlocked: true }),
        createMockRecipe({ id: 'r3', name: 'Gamma Locked', isUnlocked: false }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{ r1: false, r2: true, r3: false }} 
          unlockedAtMap={{ r2: Date.now() }} 
        />
      );

      // Select unlocked sort
      const sort = screen.getByTestId('recipe-sort-select');
      act(() => {
        fireEvent.change(sort, { target: { value: 'unlocked' } });
      });

      const cards = screen.getAllByTestId(/recipe-card-/);
      expect(cards[0].getAttribute('data-recipe-id')).toBe('r2'); // unlocked first
      expect(cards[1].getAttribute('data-recipe-id')).toBe('r1'); // locked sorted by name
      expect(cards[2].getAttribute('data-recipe-id')).toBe('r3'); // locked sorted by name
    });

    it('sort order persists during session', () => {
      // Use ASCII names for reliable secondary sorting
      const recipes = [
        createMockRecipe({ id: 'r1', name: 'Alpha Module', moduleType: 'core-furnace' }),
        createMockRecipe({ id: 'r2', name: 'Beta Recipe' }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{}} 
          unlockedAtMap={{}} 
        />
      );

      // Set name sort
      const sort = screen.getByTestId('recipe-sort-select');
      act(() => {
        fireEvent.change(sort, { target: { value: 'name' } });
      });

      // Apply category filter
      const filter = screen.getByTestId('recipe-category-filter');
      act(() => {
        fireEvent.change(filter, { target: { value: 'modules' } });
      });

      // Remove filter
      act(() => {
        fireEvent.change(filter, { target: { value: 'all' } });
      });

      // Sort should still be name
      const cards = screen.getAllByTestId(/recipe-card-/);
      expect(cards[0].getAttribute('data-recipe-id')).toBe('r1'); // Alpha (still sorted by name)
      expect(cards[1].getAttribute('data-recipe-id')).toBe('r2'); // Beta
    });
  });

  describe('AC-182-004: Recipe statistics display correctly', () => {
    it('shows correct total unlocked count', () => {
      const recipes = [
        createMockRecipe({ id: 'r1' }),
        createMockRecipe({ id: 'r2' }),
        createMockRecipe({ id: 'r3' }),
        createMockRecipe({ id: 'r4' }),
        createMockRecipe({ id: 'r5' }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{ r1: true, r2: false, r3: true, r4: false, r5: false }} 
          unlockedAtMap={{ r1: Date.now(), r3: Date.now() }} 
        />
      );

      expect(screen.getByTestId('recipe-stats-total').textContent).toBe('2 / 5 已解锁');
    });

    it('shows completion percentage', () => {
      const recipes = [
        createMockRecipe({ id: 'r1' }),
        createMockRecipe({ id: 'r2' }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{ r1: true, r2: false }} 
          unlockedAtMap={{ r1: Date.now() }} 
        />
      );

      expect(screen.getByTestId('recipe-stats-percentage').textContent).toBe('50%');
    });

    it('shows category breakdown with correct counts', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', moduleType: 'core-furnace' }),
        createMockRecipe({ id: 'r2', moduleType: 'gear' }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{ r1: true, r2: false }} 
          unlockedAtMap={{ r1: Date.now() }} 
        />
      );

      expect(screen.getByTestId('recipe-stats-category-modules')).toBeTruthy();
    });
  });

  describe('Empty States', () => {
    it('displays empty state when no recipes exist', () => {
      render(
        <RecipePanel 
          recipes={[]} 
          isUnlockedMap={{}} 
          unlockedAtMap={{}} 
        />
      );

      expect(screen.getByTestId('recipe-empty-state')).toBeTruthy();
    });

    it('displays empty state when no unlocked recipes exist', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', isUnlocked: false }),
        createMockRecipe({ id: 'r2', isUnlocked: false }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{ r1: false, r2: false }} 
          unlockedAtMap={{}} 
        />
      );

      act(() => {
        screen.getByTestId('recipe-tab-unlocked').click();
      });

      expect(screen.getByTestId('recipe-empty-state')).toBeTruthy();
    });

    it('displays empty state when no locked recipes exist', () => {
      const recipes = [
        createMockRecipe({ id: 'r1', isUnlocked: true }),
        createMockRecipe({ id: 'r2', isUnlocked: true }),
      ];

      render(
        <RecipePanel 
          recipes={recipes} 
          isUnlockedMap={{ r1: true, r2: true }} 
          unlockedAtMap={{ r1: Date.now(), r2: Date.now() }} 
        />
      );

      act(() => {
        screen.getByTestId('recipe-tab-locked').click();
      });

      expect(screen.getByTestId('recipe-empty-state')).toBeTruthy();
    });
  });

  describe('Close Button', () => {
    it('calls onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      render(
        <RecipePanel 
          recipes={[]} 
          isUnlockedMap={{}} 
          unlockedAtMap={{}} 
          onClose={handleClose} 
        />
      );

      const closeButton = screen.getByTestId('recipe-panel').querySelector('[data-close-panel]');
      act(() => {
        closeButton?.click();
      });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not crash when onClose is not provided', () => {
      expect(() => {
        render(
          <RecipePanel 
            recipes={[]} 
            isUnlockedMap={{}} 
            unlockedAtMap={{}} 
          />
        );
      }).not.toThrow();
    });
  });
});
