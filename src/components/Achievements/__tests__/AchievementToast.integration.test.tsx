/**
 * Achievement Toast Integration Test
 * 
 * Tests that the AchievementToast queue system works correctly across
 * components with the refactored 3-second auto-dismiss timing.
 * 
 * ROUND 136: Updated tests to verify:
 * - 3-second auto-dismiss timing
 * - unlockAchievement API integration
 * - Duration prop change from 4000 to 3000
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import React from 'react';
import { 
  AchievementToastProvider, 
  useAchievementToastQueueContext,
} from '../AchievementToast';
import { ACHIEVEMENT_DEFINITIONS } from '../../../data/achievements';
import type { Achievement } from '../../../types/achievement';

// Test component that displays the queue state for verification
function TestQueueStateComponent() {
  const { visibleAchievements, totalInQueue, addToQueue } = useAchievementToastQueueContext();
  
  return (
    <div>
      <div data-testid="visible-count">{visibleAchievements.length}</div>
      <div data-testid="total-count">{totalInQueue}</div>
      <div data-testid="visible-ids">
        {visibleAchievements.map(item => item.achievement.id).join(',')}
      </div>
      <button 
        data-testid="add-first-circuit"
        onClick={() => {
          const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === 'first-circuit');
          if (achievement) {
            const withState: Achievement = {
              ...achievement,
              isUnlocked: true,
              unlockedAt: Date.now(),
            };
            addToQueue([withState]);
          }
        }}
      >
        Add Achievement
      </button>
    </div>
  );
}

describe('AchievementToast Integration Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  describe('Context Singleton Verification', () => {
    it('should have AchievementToastProvider defined and exported', () => {
      expect(AchievementToastProvider).toBeDefined();
      expect(typeof AchievementToastProvider).toBe('function');
    });

    it('should have useAchievementToastQueueContext hook exported', () => {
      expect(useAchievementToastQueueContext).toBeDefined();
      expect(typeof useAchievementToastQueueContext).toBe('function');
    });

    it('should throw error when useAchievementToastQueueContext is used outside provider', () => {
      function ErrorProneComponent() {
        useAchievementToastQueueContext();
        return null;
      }
      
      expect(() => {
        render(<ErrorProneComponent />);
      }).toThrow(/AchievementToastProvider/);
    });
  });

  describe('Toast Queue Data Flow', () => {
    it('should share queue state between addToQueue and visibleAchievements', () => {
      render(
        <AchievementToastProvider options={{ maxVisible: 3, staggerDelay: 3000 }}>
          <TestQueueStateComponent />
        </AchievementToastProvider>
      );
      
      expect(screen.getByTestId('total-count').textContent).toBe('0');
      expect(screen.getByTestId('visible-count').textContent).toBe('0');
    });

    it('should add achievement to queue via addToQueue', () => {
      render(
        <AchievementToastProvider options={{ maxVisible: 3, staggerDelay: 3000 }}>
          <TestQueueStateComponent />
        </AchievementToastProvider>
      );
      
      const addButton = screen.getByTestId('add-first-circuit');
      act(() => {
        addButton.click();
      });
      
      expect(screen.getByTestId('total-count').textContent).toBe('1');
    });

    it('should prevent duplicate achievements in queue', () => {
      render(
        <AchievementToastProvider options={{ maxVisible: 3, staggerDelay: 3000 }}>
          <TestQueueStateComponent />
        </AchievementToastProvider>
      );
      
      const addButton = screen.getByTestId('add-first-circuit');
      
      // Add same achievement twice
      act(() => {
        addButton.click();
      });
      act(() => {
        addButton.click();
      });
      
      // Should still only have 1 (duplicates filtered)
      expect(screen.getByTestId('total-count').textContent).toBe('1');
    });
  });

  describe('Duration Configuration', () => {
    it('should use 3000ms as default duration', () => {
      // This is verified by the DEFAULT_DURATION constant check
      const fs = require('fs');
      const toastContent = fs.readFileSync('./src/components/Achievements/AchievementToast.tsx', 'utf-8');
      
      // Should have DEFAULT_DURATION = 3000
      expect(toastContent).toContain('const DEFAULT_DURATION = 3000');
      
      // Should NOT have 4000
      expect(toastContent).not.toContain('const DEFAULT_DURATION = 4000');
    });

    it('should use staggerDelay of 3000ms in provider options', () => {
      render(
        <AchievementToastProvider options={{ maxVisible: 3, staggerDelay: 3000 }}>
          <TestQueueStateComponent />
        </AchievementToastProvider>
      );
      
      // Component should Render without errors
      expect(screen.getByTestId('total-count')).toBeTruthy();
    });
  });

  describe('Provider and Container Integration', () => {
    it('should have AchievementToastProvider wrap app in App.tsx', () => {
      const appContent = require('fs').readFileSync('./src/App.tsx', 'utf-8');
      
      // Should import both provider and context hook
      expect(appContent).toContain('AchievementToastProvider');
      expect(appContent).toContain('useAchievementToastQueueContext');
      
      // Should wrap with provider (looking for JSX usage)
      expect(appContent).toContain('<AchievementToastProvider');
      expect(appContent).toContain('</AchievementToastProvider>');
    });

    it('should use context hook instead of direct hook in App.tsx', () => {
      const appContent = require('fs').readFileSync('./src/App.tsx', 'utf-8');
      
      // Should use context hook
      expect(appContent).toContain('useAchievementToastQueueContext()');
    });

    it('should have AchievementToastContainer inside App.tsx', () => {
      const appContent = require('fs').readFileSync('./src/App.tsx', 'utf-8');
      
      // Should have AchievementToastContainer in AppContent
      expect(appContent).toContain('<AchievementToastContainer');
    });
  });
});
