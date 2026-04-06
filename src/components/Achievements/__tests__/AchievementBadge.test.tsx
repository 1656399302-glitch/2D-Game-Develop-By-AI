/**
 * AchievementBadge Component Tests
 * 
 * Tests for the AchievementBadge component including:
 * - State rendering (unlocked/locked)
 * - Progress indicator for threshold-based locked achievements
 * - Click handling
 * 
 * ROUND 181: New test file created
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AchievementBadge } from '../AchievementBadge';
import type { Achievement } from '../../../types/achievement';

// Mock the stats store
vi.mock('../../../store/useStatsStore', () => ({
  useStatsStore: {
    getState: vi.fn(() => ({
      machinesCreated: 3,
    })),
  },
}));

// Test achievement data
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

describe('AchievementBadge Component', () => {
  describe('State Rendering', () => {
    it('renders unlocked achievement correctly', () => {
      const achievement = createMockAchievement({
        isUnlocked: true,
        unlockedAt: Date.now(),
      });

      render(<AchievementBadge achievement={achievement} />);

      // Should have unlocked data attribute
      const badge = screen.getByTestId(`achievement-badge-${achievement.id}`);
      expect(badge).toBeTruthy();
      expect(badge.getAttribute('data-unlocked')).toBe('true');

      // Should show checkmark (SVG path for check)
      const svg = badge.querySelector('svg');
      expect(svg?.innerHTML).toContain('path');
    });

    it('renders locked achievement correctly', () => {
      const achievement = createMockAchievement({
        isUnlocked: false,
        unlockedAt: null,
      });

      render(<AchievementBadge achievement={achievement} />);

      // Should have locked data attribute
      const badge = screen.getByTestId(`achievement-badge-${achievement.id}`);
      expect(badge).toBeTruthy();
      expect(badge.getAttribute('data-unlocked')).toBe('false');

      // Should show lock icon (rect for lock)
      const svg = badge.querySelector('svg');
      expect(svg?.innerHTML).toContain('rect');
    });

    it('displays achievement name in Chinese', () => {
      const achievement = createMockAchievement();

      render(<AchievementBadge achievement={achievement} />);

      expect(screen.getByText('测试成就')).toBeTruthy();
    });

    it('displays achievement description', () => {
      const achievement = createMockAchievement();

      render(<AchievementBadge achievement={achievement} />);

      expect(screen.getByText('This is a test achievement')).toBeTruthy();
    });

    it('displays achievement icon', () => {
      const achievement = createMockAchievement();

      render(<AchievementBadge achievement={achievement} />);

      // Icon should be visible in the badge
      const badge = screen.getByTestId(`achievement-badge-${achievement.id}`);
      expect(badge.textContent).toContain('🏆');
    });
  });

  describe('Progress Indicator (ROUND 181)', () => {
    it('shows progress for threshold-based locked achievements', () => {
      // 'apprentice-forge' has threshold of 5 machines
      const achievement = createMockAchievement({
        id: 'apprentice-forge',
        nameCn: '学徒锻造师',
        isUnlocked: false,
        unlockedAt: null,
      });

      render(<AchievementBadge achievement={achievement} />);

      // Should show progress indicator
      const progressEl = screen.getByTestId(`achievement-progress-${achievement.id}`);
      expect(progressEl).toBeTruthy();

      // Should show "3 / 5" (mocked machinesCreated is 3)
      expect(progressEl.textContent).toContain('3');
      expect(progressEl.textContent).toContain('5');
    });

    it('does not show progress for unlocked threshold-based achievements', () => {
      const achievement = createMockAchievement({
        id: 'apprentice-forge',
        nameCn: '学徒锻造师',
        isUnlocked: true,
        unlockedAt: Date.now(),
      });

      render(<AchievementBadge achievement={achievement} />);

      // Should NOT show progress indicator
      expect(screen.queryByTestId(`achievement-progress-${achievement.id}`)).toBeNull();
    });

    it('does not show progress for non-threshold achievements', () => {
      // 'first-circuit' has no threshold
      const achievement = createMockAchievement({
        id: 'first-circuit',
        nameCn: '初次布线',
        isUnlocked: false,
        unlockedAt: null,
      });

      render(<AchievementBadge achievement={achievement} />);

      // Should NOT show progress indicator
      expect(screen.queryByTestId(`achievement-progress-${achievement.id}`)).toBeNull();
    });

    it('shows checkmark for unlocked threshold-based achievements', () => {
      const achievement = createMockAchievement({
        id: 'apprentice-forge',
        nameCn: '学徒锻造师',
        isUnlocked: true,
        unlockedAt: Date.now(),
      });

      render(<AchievementBadge achievement={achievement} />);

      // Should show checkmark, not progress
      const badge = screen.getByTestId(`achievement-badge-${achievement.id}`);
      expect(badge.querySelector('svg')?.innerHTML).toContain('path');
      expect(screen.queryByTestId(`achievement-progress-${achievement.id}`)).toBeNull();
    });
  });

  describe('Click Handling', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = vi.fn();
      const achievement = createMockAchievement();

      render(<AchievementBadge achievement={achievement} onClick={handleClick} />);

      const badge = screen.getByTestId(`achievement-badge-${achievement.id}`);
      fireEvent.click(badge);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not crash when onClick is not provided', () => {
      const achievement = createMockAchievement();

      expect(() => {
        render(<AchievementBadge achievement={achievement} />);
      }).not.toThrow();
    });
  });

  describe('Category Badge', () => {
    it('shows category badge when showCategory is true', () => {
      const achievement = createMockAchievement({
        showCategory: true,
      });

      render(<AchievementBadge achievement={achievement} showCategory={true} />);

      // Should show category name
      expect(screen.getByText('电路构建')).toBeTruthy();
    });

    it('hides category badge when showCategory is false', () => {
      const achievement = createMockAchievement();

      render(<AchievementBadge achievement={achievement} showCategory={false} />);

      // Category badge should not be visible
      expect(screen.queryByText('电路构建')).toBeNull();
    });
  });

  describe('Timestamp Display', () => {
    it('shows timestamp for unlocked achievements', () => {
      const timestamp = new Date('2024-01-15T10:30:00').getTime();
      const achievement = createMockAchievement({
        isUnlocked: true,
        unlockedAt: timestamp,
      });

      render(<AchievementBadge achievement={achievement} showTimestamp={true} />);

      // Should show "解锁时间:" label
      expect(screen.getByText(/解锁时间:/)).toBeTruthy();
    });

    it('hides timestamp for locked achievements', () => {
      const achievement = createMockAchievement({
        isUnlocked: false,
        unlockedAt: null,
      });

      render(<AchievementBadge achievement={achievement} showTimestamp={true} />);

      // Should NOT show "解锁时间:" label
      expect(screen.queryByText(/解锁时间:/)).toBeNull();
    });

    it('hides timestamp when showTimestamp is false', () => {
      const timestamp = Date.now();
      const achievement = createMockAchievement({
        isUnlocked: true,
        unlockedAt: timestamp,
      });

      render(<AchievementBadge achievement={achievement} showTimestamp={false} />);

      // Should NOT show "解锁时间:" label
      expect(screen.queryByText(/解锁时间:/)).toBeNull();
    });
  });
});
