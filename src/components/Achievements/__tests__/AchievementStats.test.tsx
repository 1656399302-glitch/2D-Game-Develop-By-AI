/**
 * AchievementStats Component Tests
 * 
 * Tests for the AchievementStats component including:
 * - Total unlocked count and percentage calculation
 * - Category breakdown display
 * - Progress bar rendering
 * 
 * ROUND 181: New test file created
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AchievementStats } from '../AchievementStats';
import type { Achievement } from '../../../types/achievement';

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

describe('AchievementStats Component', () => {
  describe('Total Count Display', () => {
    it('displays correct total count format "X / Y 已解锁"', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: true, category: 'circuit-building' }),
        createMockAchievement({ id: 'a2', isUnlocked: true, category: 'circuit-building' }),
        createMockAchievement({ id: 'a3', isUnlocked: false, category: 'circuit-building' }),
        createMockAchievement({ id: 'a4', isUnlocked: false, category: 'circuit-building' }),
        createMockAchievement({ id: 'a5', isUnlocked: false, category: 'circuit-building' }),
      ];

      render(<AchievementStats achievements={achievements} />);

      // Should show "2 / 5 已解锁"
      expect(screen.getByTestId('achievement-stats-total').textContent).toBe('2 / 5 已解锁');
    });

    it('displays "0 / 0 已解锁" for empty achievements list', () => {
      render(<AchievementStats achievements={[]} />);

      expect(screen.getByTestId('achievement-stats-total').textContent).toBe('0 / 0 已解锁');
    });

    it('displays "5 / 5 已解锁" when all achievements are unlocked', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: true }),
        createMockAchievement({ id: 'a2', isUnlocked: true }),
        createMockAchievement({ id: 'a3', isUnlocked: true }),
        createMockAchievement({ id: 'a4', isUnlocked: true }),
        createMockAchievement({ id: 'a5', isUnlocked: true }),
      ];

      render(<AchievementStats achievements={achievements} />);

      expect(screen.getByTestId('achievement-stats-total').textContent).toBe('5 / 5 已解锁');
    });
  });

  describe('Percentage Calculation', () => {
    it('calculates 50% correctly', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: true }),
        createMockAchievement({ id: 'a2', isUnlocked: false }),
      ];

      render(<AchievementStats achievements={achievements} />);

      // Should show 50%
      expect(screen.getByTestId('achievement-stats-percentage').textContent).toBe('50%');
    });

    it('calculates 0% when no achievements are unlocked', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: false }),
        createMockAchievement({ id: 'a2', isUnlocked: false }),
        createMockAchievement({ id: 'a3', isUnlocked: false }),
      ];

      render(<AchievementStats achievements={achievements} />);

      expect(screen.getByTestId('achievement-stats-percentage').textContent).toBe('0%');
    });

    it('calculates 100% when all achievements are unlocked', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: true }),
        createMockAchievement({ id: 'a2', isUnlocked: true }),
      ];

      render(<AchievementStats achievements={achievements} />);

      expect(screen.getByTestId('achievement-stats-percentage').textContent).toBe('100%');
    });

    it('rounds percentage to nearest integer', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: true }),
        createMockAchievement({ id: 'a2', isUnlocked: false }),
        createMockAchievement({ id: 'a3', isUnlocked: false }),
      ];

      render(<AchievementStats achievements={achievements} />);

      // 1/3 = 33.33...% rounded to 33%
      expect(screen.getByTestId('achievement-stats-percentage').textContent).toBe('33%');
    });
  });

  describe('Progress Bar', () => {
    it('renders progress bar element', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: true }),
        createMockAchievement({ id: 'a2', isUnlocked: false }),
      ];

      render(<AchievementStats achievements={achievements} />);

      // Should have progress bar with gradient
      const stats = screen.getByTestId('achievement-stats');
      const progressBar = stats.querySelector('.bg-gradient-to-r');
      expect(progressBar).toBeTruthy();
    });

    it('progress bar has correct width style', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', isUnlocked: true }),
        createMockAchievement({ id: 'a2', isUnlocked: true }),
        createMockAchievement({ id: 'a3', isUnlocked: false }),
        createMockAchievement({ id: 'a4', isUnlocked: false }),
      ];

      render(<AchievementStats achievements={achievements} />);

      // Should have 50% width
      const stats = screen.getByTestId('achievement-stats');
      const progressBar = stats.querySelector('[style*="width"]');
      expect(progressBar?.getAttribute('style')).toContain('width: 50%');
    });
  });

  describe('Category Breakdown', () => {
    it('displays category breakdown when showCategoryBreakdown is true', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', category: 'circuit-building', isUnlocked: true }),
        createMockAchievement({ id: 'a2', category: 'circuit-building', isUnlocked: false }),
        createMockAchievement({ id: 'a3', category: 'recipe-discovery', isUnlocked: false }),
      ];

      render(<AchievementStats achievements={achievements} showCategoryBreakdown={true} />);

      // Should show circuit-building category
      expect(screen.getByTestId('achievement-stats-category-circuit-building')).toBeTruthy();
      expect(screen.getByText('电路构建')).toBeTruthy();

      // Should show recipe-discovery category
      expect(screen.getByTestId('achievement-stats-category-recipe-discovery')).toBeTruthy();
      expect(screen.getByText('配方发现')).toBeTruthy();
    });

    it('hides category breakdown when showCategoryBreakdown is false', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', category: 'circuit-building', isUnlocked: true }),
        createMockAchievement({ id: 'a2', category: 'circuit-building', isUnlocked: false }),
      ];

      render(<AchievementStats achievements={achievements} showCategoryBreakdown={false} />);

      // Should NOT show category breakdown
      expect(screen.queryByTestId('achievement-stats-category-circuit-building')).toBeNull();
      expect(screen.queryByText('电路构建')).toBeNull();
    });

    it('shows correct counts per category', () => {
      const achievements = [
        // circuit-building: 1/2
        createMockAchievement({ id: 'a1', category: 'circuit-building', isUnlocked: true }),
        createMockAchievement({ id: 'a2', category: 'circuit-building', isUnlocked: false }),
        // exploration: 1/1
        createMockAchievement({ id: 'a3', category: 'exploration', isUnlocked: true }),
      ];

      render(<AchievementStats achievements={achievements} />);

      // circuit-building: 1/2
      const circuitCategory = screen.getByTestId('achievement-stats-category-circuit-building');
      expect(circuitCategory.textContent).toContain('1');
      expect(circuitCategory.textContent).toContain('2');

      // exploration: 1/1
      const explorationCategory = screen.getByTestId('achievement-stats-category-exploration');
      expect(explorationCategory.textContent).toContain('1');
      expect(explorationCategory.textContent).toContain('1');
    });

    it('only shows categories with achievements', () => {
      const achievements = [
        createMockAchievement({ id: 'a1', category: 'circuit-building', isUnlocked: false }),
      ];

      render(<AchievementStats achievements={achievements} />);

      // Should show circuit-building
      expect(screen.getByTestId('achievement-stats-category-circuit-building')).toBeTruthy();

      // Should NOT show other empty categories
      expect(screen.queryByTestId('achievement-stats-category-recipe-discovery')).toBeNull();
      expect(screen.queryByTestId('achievement-stats-category-subcircuit')).toBeNull();
      expect(screen.queryByTestId('achievement-stats-category-exploration')).toBeNull();
    });
  });

  describe('Stats Container', () => {
    it('renders with correct data-testid', () => {
      render(<AchievementStats achievements={[]} />);

      expect(screen.getByTestId('achievement-stats')).toBeTruthy();
    });

    it('renders total count with correct data-testid', () => {
      render(<AchievementStats achievements={[]} />);

      expect(screen.getByTestId('achievement-stats-total')).toBeTruthy();
    });

    it('renders percentage with correct data-testid', () => {
      render(<AchievementStats achievements={[]} />);

      expect(screen.getByTestId('achievement-stats-percentage')).toBeTruthy();
    });
  });
});
