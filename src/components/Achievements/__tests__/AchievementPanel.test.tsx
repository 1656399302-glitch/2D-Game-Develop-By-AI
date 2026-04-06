/**
 * AchievementPanel Component Tests
 * 
 * Tests for the AchievementPanel component including:
 * - Correct structure and data-testid attributes
 * - Filtering (tabs, category)
 * - Sorting (recent, name, category)
 * - Statistics display
 * - Empty states
 * - Rapid interaction stability
 * 
 * ROUND 181: New test file created
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import React from 'react';
import { AchievementPanel } from '../AchievementPanel';
import type { Achievement } from '../../../types/achievement';

// Mock the stats store
vi.mock('../../../store/useStatsStore', () => ({
  useStatsStore: {
    getState: vi.fn(() => ({
      machinesCreated: 3,
    })),
  },
}));

// Test achievement data factory
const createMockAchievement = (overrides: Partial<Achievement> = {}): Achievement => ({
  id: 'test-achievement',
  name: 'Test Achievement',
  nameCn: '测试成就',
  description: 'This is a test achievement',
  icon: '🏆',
  category: 'circuit-building',
  isUnlocked: false,
  unlockedAt: null,
  ...overrides,
});

describe('AchievementPanel Component', () => {
  beforeEach(() => {
    cleanup();
  });

  describe('AC-181-001: AchievementPanel renders correctly', () => {
    it('renders panel container with correct data-testid', () => {
      const achievements = [createMockAchievement()];

      render(<AchievementPanel achievements={achievements} />);

      expect(screen.getByTestId('achievement-panel')).toBeTruthy();
    });

    it('renders three tab buttons with correct data-testid attributes', () => {
      render(<AchievementPanel achievements={[]} />);

      expect(screen.getByTestId('achievement-tab-all')).toBeTruthy();
      expect(screen.getByTestId('achievement-tab-unlocked')).toBeTruthy();
      expect(screen.getByTestId('achievement-tab-locked')).toBeTruthy();
    });

    it('renders category filter dropdown', () => {
      render(<AchievementPanel achievements={[]} />);

      expect(screen.getByTestId('achievement-category-filter')).toBeTruthy();
    });

    it('renders sort dropdown', () => {
      render(<AchievementPanel achievements={[]} />);

      expect(screen.getByTestId('achievement-sort-select')).toBeTruthy();
    });

    it('renders statistics section at top', () => {
      render(<AchievementPanel achievements={[]} />);

      expect(screen.getByTestId('achievement-stats')).toBeTruthy();
    });

    it('renders achievement list below statistics', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', nameCn: '成就1' }),
        createMockAchievement({ id: 'a2', nameCn: '成就2' }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      expect(screen.getByTestId('achievement-badge-a1')).toBeTruthy();
      expect(screen.getByTestId('achievement-badge-a2')).toBeTruthy();
    });

    it('shows "全部分类" option in category filter', () => {
      render(<AchievementPanel achievements={[]} />);

      const filter = screen.getByTestId('achievement-category-filter');
      expect(filter.querySelector('option[value="all"]')?.textContent).toBe('全部分类');
    });

    it('shows all 4 categories in filter dropdown', () => {
      render(<AchievementPanel achievements={[]} />);

      const filter = screen.getByTestId('achievement-category-filter');
      expect(filter.querySelector('option[value="circuit-building"]')?.textContent).toBe('电路构建');
      expect(filter.querySelector('option[value="recipe-discovery"]')?.textContent).toBe('配方发现');
      expect(filter.querySelector('option[value="subcircuit"]')?.textContent).toBe('子电路');
      expect(filter.querySelector('option[value="exploration"]')?.textContent).toBe('探索');
    });

    it('shows all 3 sort options in sort dropdown', () => {
      render(<AchievementPanel achievements={[]} />);

      const sort = screen.getByTestId('achievement-sort-select');
      expect(sort.querySelector('option[value="recent"]')?.textContent).toBe('最近解锁');
      expect(sort.querySelector('option[value="name"]')?.textContent).toBe('按名称');
      expect(sort.querySelector('option[value="category"]')?.textContent).toBe('按分类');
    });
  });

  describe('AC-181-002: AchievementPanel filtering works', () => {
    it('"All" tab shows all achievements', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: true }),
        createMockAchievement({ id: 'a2', isUnlocked: false }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      expect(screen.getByTestId('achievement-badge-a1')).toBeTruthy();
      expect(screen.getByTestId('achievement-badge-a2')).toBeTruthy();
    });

    it('"Unlocked" tab shows only unlocked achievements', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: true }),
        createMockAchievement({ id: 'a2', isUnlocked: false }),
        createMockAchievement({ id: 'a3', isUnlocked: true }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      // Click unlocked tab
      act(() => {
        screen.getByTestId('achievement-tab-unlocked').click();
      });

      expect(screen.getByTestId('achievement-badge-a1')).toBeTruthy();
      expect(screen.queryByTestId('achievement-badge-a2')).toBeNull();
      expect(screen.getByTestId('achievement-badge-a3')).toBeTruthy();
    });

    it('"Locked" tab shows only locked achievements', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: true }),
        createMockAchievement({ id: 'a2', isUnlocked: false }),
        createMockAchievement({ id: 'a3', isUnlocked: true }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      // Click locked tab
      act(() => {
        screen.getByTestId('achievement-tab-locked').click();
      });

      expect(screen.queryByTestId('achievement-badge-a1')).toBeNull();
      expect(screen.getByTestId('achievement-badge-a2')).toBeTruthy();
      expect(screen.queryByTestId('achievement-badge-a3')).toBeNull();
    });

    it('category filter limits displayed achievements', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', category: 'circuit-building' }),
        createMockAchievement({ id: 'a2', category: 'recipe-discovery' }),
        createMockAchievement({ id: 'a3', category: 'circuit-building' }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      // Select circuit-building category
      const filter = screen.getByTestId('achievement-category-filter');
      act(() => {
        fireEvent.change(filter, { target: { value: 'circuit-building' } });
      });

      expect(screen.getByTestId('achievement-badge-a1')).toBeTruthy();
      expect(screen.queryByTestId('achievement-badge-a2')).toBeNull();
      expect(screen.getByTestId('achievement-badge-a3')).toBeTruthy();
    });

    it('filters can be combined (tab + category)', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', category: 'circuit-building', isUnlocked: true }),
        createMockAchievement({ id: 'a2', category: 'circuit-building', isUnlocked: false }),
        createMockAchievement({ id: 'a3', category: 'recipe-discovery', isUnlocked: true }),
        createMockAchievement({ id: 'a4', category: 'circuit-building', isUnlocked: true }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      // Click unlocked tab
      act(() => {
        screen.getByTestId('achievement-tab-unlocked').click();
      });

      // Select circuit-building category
      const filter = screen.getByTestId('achievement-category-filter');
      act(() => {
        fireEvent.change(filter, { target: { value: 'circuit-building' } });
      });

      // Should show only a1 and a4 (unlocked + circuit-building)
      expect(screen.getByTestId('achievement-badge-a1')).toBeTruthy();
      expect(screen.queryByTestId('achievement-badge-a2')).toBeNull();
      expect(screen.queryByTestId('achievement-badge-a3')).toBeNull();
      expect(screen.getByTestId('achievement-badge-a4')).toBeTruthy();
    });

    it('empty state displays when no achievements match filter', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', category: 'circuit-building', isUnlocked: true }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      // Click locked tab - should show empty state
      act(() => {
        screen.getByTestId('achievement-tab-locked').click();
      });

      expect(screen.getByTestId('achievement-empty-state')).toBeTruthy();
    });

    it('rapid tab switching does not cause stale data display', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: true }),
        createMockAchievement({ id: 'a2', isUnlocked: false }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      // Rapidly click between tabs
      act(() => {
        screen.getByTestId('achievement-tab-unlocked').click();
      });
      act(() => {
        screen.getByTestId('achievement-tab-locked').click();
      });
      act(() => {
        screen.getByTestId('achievement-tab-all').click();
      });
      act(() => {
        screen.getByTestId('achievement-tab-unlocked').click();
      });

      // Final state should match last selection (unlocked)
      expect(screen.getByTestId('achievement-badge-a1')).toBeTruthy();
      expect(screen.queryByTestId('achievement-badge-a2')).toBeNull();
    });
  });

  describe('AC-181-003: AchievementPanel sorting works', () => {
    it('"Recent" sort orders by unlockedAt descending', () => {
      const now = Date.now();
      const achievements = [
        createMockAchievement({ 
          id: 'a1', 
          nameCn: '成就A', 
          isUnlocked: true, 
          unlockedAt: now - 1000 // older
        }),
        createMockAchievement({ 
          id: 'a2', 
          nameCn: '成就B', 
          isUnlocked: true, 
          unlockedAt: now // newer
        }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      // Should be ordered: a2 (newer), a1 (older)
      const badges = screen.getAllByTestId(/achievement-badge-/);
      expect(badges[0].getAttribute('data-achievement-id')).toBe('a2');
      expect(badges[1].getAttribute('data-achievement-id')).toBe('a1');
    });

    it('locked achievements sort to end when using "Recent"', () => {
      const now = Date.now();
      const achievements = [
        createMockAchievement({ 
          id: 'a1', 
          nameCn: '成就A', 
          isUnlocked: false, 
          unlockedAt: null 
        }),
        createMockAchievement({ 
          id: 'a2', 
          nameCn: '成就B', 
          isUnlocked: true, 
          unlockedAt: now 
        }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      // a2 (unlocked) should come before a1 (locked)
      const badges = screen.getAllByTestId(/achievement-badge-/);
      expect(badges[0].getAttribute('data-achievement-id')).toBe('a2');
      expect(badges[1].getAttribute('data-achievement-id')).toBe('a1');
    });

    it('"Name" sort orders alphabetically by nameCn', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', nameCn: '张三' }),
        createMockAchievement({ id: 'a2', nameCn: '李四' }),
        createMockAchievement({ id: 'a3', nameCn: '王五' }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      // Select name sort
      const sort = screen.getByTestId('achievement-sort-select');
      act(() => {
        fireEvent.change(sort, { target: { value: 'name' } });
      });

      const badges = screen.getAllByTestId(/achievement-badge-/);
      expect(badges[0].getAttribute('data-achievement-id')).toBe('a1'); // 张三
      expect(badges[1].getAttribute('data-achievement-id')).toBe('a2'); // 李四
      expect(badges[2].getAttribute('data-achievement-id')).toBe('a3'); // 王五
    });

    it('"Category" sort groups achievements by category', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', nameCn: '成就A', category: 'circuit-building' }),
        createMockAchievement({ id: 'a2', nameCn: '成就B', category: 'exploration' }),
        createMockAchievement({ id: 'a3', nameCn: '成就C', category: 'circuit-building' }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      // Select category sort
      const sort = screen.getByTestId('achievement-sort-select');
      act(() => {
        fireEvent.change(sort, { target: { value: 'category' } });
      });

      const badges = screen.getAllByTestId(/achievement-badge-/);
      // circuit-building comes before exploration alphabetically
      expect(badges[0].getAttribute('data-achievement-id')).toBe('a1');
      expect(badges[1].getAttribute('data-achievement-id')).toBe('a3');
      expect(badges[2].getAttribute('data-achievement-id')).toBe('a2');
    });

    it('sort order persists during session (not reset on filter change)', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', nameCn: '张三', category: 'circuit-building' }),
        createMockAchievement({ id: 'a2', nameCn: '李四', category: 'exploration' }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      // Set name sort
      const sort = screen.getByTestId('achievement-sort-select');
      act(() => {
        fireEvent.change(sort, { target: { value: 'name' } });
      });

      // Apply category filter
      const filter = screen.getByTestId('achievement-category-filter');
      act(() => {
        fireEvent.change(filter, { target: { value: 'circuit-building' } });
      });

      // Remove filter
      act(() => {
        fireEvent.change(filter, { target: { value: 'all' } });
      });

      // Sort should still be name
      const badges = screen.getAllByTestId(/achievement-badge-/);
      expect(badges[0].getAttribute('data-achievement-id')).toBe('a1'); // 张三 (still sorted by name)
      expect(badges[1].getAttribute('data-achievement-id')).toBe('a2'); // 李四
    });

    it('rapid sort changes do not cause race conditions', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', nameCn: '成就A', isUnlocked: false }),
        createMockAchievement({ id: 'a2', nameCn: '成就B', isUnlocked: true, unlockedAt: Date.now() }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      const sort = screen.getByTestId('achievement-sort-select');

      // Rapidly change sort options
      act(() => { fireEvent.change(sort, { target: { value: 'name' } }); });
      act(() => { fireEvent.change(sort, { target: { value: 'recent' } }); });
      act(() => { fireEvent.change(sort, { target: { value: 'category' } }); });
      act(() => { fireEvent.change(sort, { target: { value: 'name' } }); });
      act(() => { fireEvent.change(sort, { target: { value: 'recent' } }); });

      // Final order should match last selection (recent)
      const badges = screen.getAllByTestId(/achievement-badge-/);
      expect(badges[0].getAttribute('data-achievement-id')).toBe('a2'); // unlocked first
      expect(badges[1].getAttribute('data-achievement-id')).toBe('a1'); // locked last
    });
  });

  describe('AC-181-004: Achievement statistics display correctly', () => {
    it('shows correct total unlocked count', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: true }),
        createMockAchievement({ id: 'a2', isUnlocked: false }),
        createMockAchievement({ id: 'a3', isUnlocked: true }),
        createMockAchievement({ id: 'a4', isUnlocked: false }),
        createMockAchievement({ id: 'a5', isUnlocked: false }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      expect(screen.getByTestId('achievement-stats-total').textContent).toBe('2 / 5 已解锁');
    });

    it('shows completion percentage', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: true }),
        createMockAchievement({ id: 'a2', isUnlocked: false }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      expect(screen.getByTestId('achievement-stats-percentage').textContent).toBe('50%');
    });

    it('shows category breakdown with correct counts', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', category: 'circuit-building', isUnlocked: true }),
        createMockAchievement({ id: 'a2', category: 'circuit-building', isUnlocked: false }),
        createMockAchievement({ id: 'a3', category: 'exploration', isUnlocked: false }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      expect(screen.getByTestId('achievement-stats-category-circuit-building').textContent).toContain('1');
      expect(screen.getByTestId('achievement-stats-category-circuit-building').textContent).toContain('2');
      expect(screen.getByTestId('achievement-stats-category-exploration').textContent).toContain('0');
      expect(screen.getByTestId('achievement-stats-category-exploration').textContent).toContain('1');
    });

    it('statistics update when filter selection changes', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', category: 'circuit-building', isUnlocked: true }),
        createMockAchievement({ id: 'a2', category: 'circuit-building', isUnlocked: false }),
        createMockAchievement({ id: 'a3', category: 'exploration', isUnlocked: false }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      // Initial stats show all
      expect(screen.getByTestId('achievement-stats-total').textContent).toBe('1 / 3 已解锁');

      // Select circuit-building category
      const filter = screen.getByTestId('achievement-category-filter');
      act(() => {
        fireEvent.change(filter, { target: { value: 'circuit-building' } });
      });

      // Stats should update to reflect filtered subset
      expect(screen.getByTestId('achievement-stats-total').textContent).toBe('1 / 2 已解锁');
    });
  });

  describe('Empty States', () => {
    it('displays empty state when no achievements exist', () => {
      render(<AchievementPanel achievements={[]} />);

      expect(screen.getByTestId('achievement-empty-state')).toBeTruthy();
      expect(screen.getByText('暂无成就')).toBeTruthy();
    });

    it('displays empty state when no unlocked achievements exist', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: false }),
        createMockAchievement({ id: 'a2', isUnlocked: false }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      act(() => {
        screen.getByTestId('achievement-tab-unlocked').click();
      });

      expect(screen.getByTestId('achievement-empty-state')).toBeTruthy();
      expect(screen.getByText('暂无已解锁的成就')).toBeTruthy();
    });

    it('displays empty state when no locked achievements exist', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: true }),
        createMockAchievement({ id: 'a2', isUnlocked: true }),
      ];

      render(<AchievementPanel achievements={achievements} />);

      act(() => {
        screen.getByTestId('achievement-tab-locked').click();
      });

      expect(screen.getByTestId('achievement-empty-state')).toBeTruthy();
      expect(screen.getByText('暂无未解锁的成就')).toBeTruthy();
    });
  });

  describe('Close Button', () => {
    it('calls onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      render(<AchievementPanel achievements={[]} onClose={handleClose} />);

      const closeButton = screen.getByTestId('achievement-panel').querySelector('[data-close-panel]');
      act(() => {
        closeButton?.click();
      });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not crash when onClose is not provided', () => {
      expect(() => {
        render(<AchievementPanel achievements={[]} />);
      }).not.toThrow();
    });
  });
});
