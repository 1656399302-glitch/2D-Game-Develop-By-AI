/**
 * Achievement List Component Tests
 * 
 * Tests for the refactored AchievementList component with new category taxonomy.
 * 
 * ROUND 136: Tests for AC-136-003: Achievement panel display
 * ROUND 162: Fixed act() warning by wrapping state mutations in act()
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { AchievementList } from '../../../components/Achievements/AchievementList';
import { useAchievementStore } from '../../../store/useAchievementStore';

// Wrapper to provide store state
function renderWithStore() {
  return render(<AchievementList onClose={vi.fn()} />);
}

describe('AchievementList Component Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  describe('AC-136-003: Achievement Panel Display', () => {
    it('should display panel heading with 成就 (Achievements)', () => {
      renderWithStore();
      
      expect(screen.getByText('成就')).toBeTruthy();
    });

    it('should display all predefined achievements (≥10)', () => {
      renderWithStore();
      
      const state = useAchievementStore.getState();
      expect(state.achievements.length).toBeGreaterThanOrEqual(10);
    });

    it('should show unlocked/total count', () => {
      renderWithStore();
      
      const state = useAchievementStore.getState();
      const unlockedCount = state.getUnlockedCount();
      const totalCount = state.achievements.length;
      
      expect(screen.getByText(`${unlockedCount} / ${totalCount} 已解锁`)).toBeTruthy();
    });

    it('should organize achievements by category', () => {
      renderWithStore();
      
      // Should have category headers
      expect(screen.getByText('电路构建')).toBeTruthy();
      expect(screen.getByText('配方发现')).toBeTruthy();
      expect(screen.getByText('子电路')).toBeTruthy();
      expect(screen.getByText('探索')).toBeTruthy();
    });
  });

  describe('Component Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<AchievementList onClose={onClose} />);
      
      const closeButton = screen.getByRole('button', { name: '关闭' });
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dynamic Updates', () => {
    it('should update count when achievement is unlocked', () => {
      const { rerender } = renderWithStore();
      
      const state = useAchievementStore.getState();
      const achievementId = state.achievements[0].id;
      
      // Wrap state mutation in act() to avoid React act() warning
      act(() => {
        useAchievementStore.getState().unlockAchievement(achievementId);
      });
      
      rerender(<AchievementList onClose={vi.fn()} />);
      
      // Should show 1 unlocked now
      expect(screen.getByText(`1 / ${state.achievements.length} 已解锁`)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have close button with aria-label', () => {
      renderWithStore();
      
      const closeButton = screen.getByRole('button', { name: '关闭' });
      expect(closeButton).toBeTruthy();
    });
  });
});
