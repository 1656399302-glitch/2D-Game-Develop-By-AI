/**
 * ChallengeLeaderboard Component Tests
 * 
 * Tests for the ChallengeLeaderboard modal component with entry rendering,
 * sorting, personal best highlighting, challenge selector, and close functionality.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react';
import React from 'react';
import { ChallengeLeaderboard } from '../components/Challenges/ChallengeLeaderboard';

const STORAGE_KEY = 'arcane-codex-time-trial-leaderboard';

// Mock localStorage 
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
};

describe('ChallengeLeaderboard Component', () => {
  beforeEach(() => {
    // Use fake timers
    vi.useFakeTimers();
    
    // Reset localStorage mock
    localStorageMock.store = {};
    localStorageMock.store[STORAGE_KEY] = JSON.stringify({});
    
    // Mock localStorage on window
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
    
    cleanup();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Empty State Display (AC-138-002)', () => {
    it('should display empty state when no entries exist', () => {
      render(
        <ChallengeLeaderboard
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // The component shows "暂无排行榜数据" or challenge-specific message
      const emptyState = screen.getByText(/暂无排行榜数据|暂无.*记录/i);
      expect(emptyState).toBeTruthy();
    });

    it('should display empty message with hint text', () => {
      render(
        <ChallengeLeaderboard
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const hintText = screen.getByText(/完成时间挑战即可上榜/);
      expect(hintText).toBeTruthy();
    });

    it('should show challenge-specific empty state when challengeId provided', () => {
      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Should show "暂无记录" for specific challenge
      const emptyState = screen.getByText(/暂无.*记录/i);
      expect(emptyState).toBeTruthy();
    });
  });

  describe('Entry Row Rendering (AC-138-002)', () => {
    it('should render entry rows when leaderboard has data', async () => {
      // Set up mock leaderboard data
      const mockData = {
        'time-trial-quick-build': [
          {
            id: 'entry-1',
            challengeId: 'time-trial-quick-build',
            time: 65000,
            timeDisplay: '01:05',
            dateAchieved: Date.now(),
            dateDisplay: '2024-01-15',
            machineName: 'Test Machine',
          },
        ],
      };
      localStorageMock.store[STORAGE_KEY] = JSON.stringify(mockData);

      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Wait for useEffect to load data
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // Now check for the entry
      const entryTime = screen.queryByText('01:05');
      expect(entryTime).toBeTruthy();
    });

    it('should display rank badge for each entry', async () => {
      const mockData = {
        'time-trial-quick-build': [
          {
            id: 'entry-1',
            challengeId: 'time-trial-quick-build',
            time: 50000,
            timeDisplay: '00:50',
            dateAchieved: Date.now(),
            dateDisplay: '2024-01-15',
          },
        ],
      };
      localStorageMock.store[STORAGE_KEY] = JSON.stringify(mockData);

      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // Check for first place medal
      const medalEmoji = screen.queryByText('🥇');
      expect(medalEmoji).toBeTruthy();
    });

    it('should display time in MM:SS format', async () => {
      const mockData = {
        'time-trial-quick-build': [
          {
            id: 'entry-1',
            challengeId: 'time-trial-quick-build',
            time: 125000,
            timeDisplay: '02:05',
            dateAchieved: Date.now(),
            dateDisplay: '2024-01-15',
          },
        ],
      };
      localStorageMock.store[STORAGE_KEY] = JSON.stringify(mockData);

      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      const timeDisplay = screen.queryByText('02:05');
      expect(timeDisplay).toBeTruthy();
    });

    it('should display date for each entry', async () => {
      const mockData = {
        'time-trial-quick-build': [
          {
            id: 'entry-1',
            challengeId: 'time-trial-quick-build',
            time: 50000,
            timeDisplay: '00:50',
            dateAchieved: new Date('2024-01-15').getTime(),
            dateDisplay: '2024-01-15',
          },
        ],
      };
      localStorageMock.store[STORAGE_KEY] = JSON.stringify(mockData);

      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      const dateDisplay = screen.queryByText('2024-01-15');
      expect(dateDisplay).toBeTruthy();
    });

    it('should display machine name when available', async () => {
      const mockData = {
        'time-trial-quick-build': [
          {
            id: 'entry-1',
            challengeId: 'time-trial-quick-build',
            time: 50000,
            timeDisplay: '00:50',
            dateAchieved: Date.now(),
            dateDisplay: '2024-01-15',
            machineName: 'My Awesome Machine',
          },
        ],
      };
      localStorageMock.store[STORAGE_KEY] = JSON.stringify(mockData);

      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      const machineName = screen.queryByText('My Awesome Machine');
      expect(machineName).toBeTruthy();
    });
  });

  describe('Sorting by Time (AC-138-002)', () => {
    it('should sort entries by time ascending (fastest first)', async () => {
      const mockData = {
        'time-trial-quick-build': [
          {
            id: 'entry-1',
            challengeId: 'time-trial-quick-build',
            time: 70000,
            timeDisplay: '01:10',
            dateAchieved: Date.now(),
            dateDisplay: '2024-01-15',
          },
          {
            id: 'entry-2',
            challengeId: 'time-trial-quick-build',
            time: 50000,
            timeDisplay: '00:50',
            dateAchieved: Date.now(),
            dateDisplay: '2024-01-14',
          },
          {
            id: 'entry-3',
            challengeId: 'time-trial-quick-build',
            time: 60000,
            timeDisplay: '01:00',
            dateAchieved: Date.now(),
            dateDisplay: '2024-01-13',
          },
        ],
      };
      localStorageMock.store[STORAGE_KEY] = JSON.stringify(mockData);

      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // Get all time displays after data loads
      const timeDisplays = screen.queryAllByText(/\d{2}:\d{2}/);
      // First entry should be fastest (00:50)
      expect(timeDisplays[0].textContent).toBe('00:50');
    });

    it('should display fastest time first with medal emoji', async () => {
      const mockData = {
        'time-trial-quick-build': [
          {
            id: 'entry-1',
            challengeId: 'time-trial-quick-build',
            time: 50000,
            timeDisplay: '00:50',
            dateAchieved: Date.now(),
            dateDisplay: '2024-01-15',
          },
          {
            id: 'entry-2',
            challengeId: 'time-trial-quick-build',
            time: 60000,
            timeDisplay: '01:00',
            dateAchieved: Date.now(),
            dateDisplay: '2024-01-14',
          },
        ],
      };
      localStorageMock.store[STORAGE_KEY] = JSON.stringify(mockData);

      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // First entry should have 🥇
      const goldMedal = screen.queryByText('🥇');
      expect(goldMedal).toBeTruthy();
      
      // Second entry should have 🥈
      const silverMedal = screen.queryByText('🥈');
      expect(silverMedal).toBeTruthy();
    });

    it('should show third place with bronze medal', async () => {
      const mockData = {
        'time-trial-quick-build': [
          { id: 'entry-1', challengeId: 'time-trial-quick-build', time: 50000, timeDisplay: '00:50', dateAchieved: Date.now(), dateDisplay: '2024-01-15' },
          { id: 'entry-2', challengeId: 'time-trial-quick-build', time: 60000, timeDisplay: '01:00', dateAchieved: Date.now(), dateDisplay: '2024-01-14' },
          { id: 'entry-3', challengeId: 'time-trial-quick-build', time: 70000, timeDisplay: '01:10', dateAchieved: Date.now(), dateDisplay: '2024-01-13' },
        ],
      };
      localStorageMock.store[STORAGE_KEY] = JSON.stringify(mockData);

      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      const bronzeMedal = screen.queryByText('🥉');
      expect(bronzeMedal).toBeTruthy();
    });

    it('should show #N format for entries beyond 3rd place', async () => {
      const mockData = {
        'time-trial-quick-build': [
          { id: 'entry-1', challengeId: 'time-trial-quick-build', time: 50000, timeDisplay: '00:50', dateAchieved: Date.now(), dateDisplay: '2024-01-15' },
          { id: 'entry-2', challengeId: 'time-trial-quick-build', time: 60000, timeDisplay: '01:00', dateAchieved: Date.now(), dateDisplay: '2024-01-14' },
          { id: 'entry-3', challengeId: 'time-trial-quick-build', time: 70000, timeDisplay: '01:10', dateAchieved: Date.now(), dateDisplay: '2024-01-13' },
          { id: 'entry-4', challengeId: 'time-trial-quick-build', time: 80000, timeDisplay: '01:20', dateAchieved: Date.now(), dateDisplay: '2024-01-12' },
        ],
      };
      localStorageMock.store[STORAGE_KEY] = JSON.stringify(mockData);

      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // 4th place should show #4
      const fourthPlace = screen.queryByText('#4');
      expect(fourthPlace).toBeTruthy();
    });
  });

  describe('Personal Best Highlighting (AC-138-002)', () => {
    it('should highlight first entry with special styling', async () => {
      const mockData = {
        'time-trial-quick-build': [
          {
            id: 'entry-1',
            challengeId: 'time-trial-quick-build',
            time: 50000,
            timeDisplay: '00:50',
            dateAchieved: Date.now(),
            dateDisplay: '2024-01-15',
          },
        ],
      };
      localStorageMock.store[STORAGE_KEY] = JSON.stringify(mockData);

      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // First entry should have "个人最佳" label
      const personalBest = screen.queryByText('个人最佳');
      expect(personalBest).toBeTruthy();
    });

    it('should apply gold color styling to personal best', async () => {
      const mockData = {
        'time-trial-quick-build': [
          {
            id: 'entry-1',
            challengeId: 'time-trial-quick-build',
            time: 50000,
            timeDisplay: '00:50',
            dateAchieved: Date.now(),
            dateDisplay: '2024-01-15',
          },
        ],
      };
      localStorageMock.store[STORAGE_KEY] = JSON.stringify(mockData);

      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // Find element with personal best styling (amber/gold background)
      const personalBestEntry = document.querySelector('[class*="bg-"][class*="/10"]');
      expect(personalBestEntry).toBeTruthy();
    });

    it('should show "个人最佳" label only for first entry', async () => {
      const mockData = {
        'time-trial-quick-build': [
          { id: 'entry-1', challengeId: 'time-trial-quick-build', time: 50000, timeDisplay: '00:50', dateAchieved: Date.now(), dateDisplay: '2024-01-15' },
          { id: 'entry-2', challengeId: 'time-trial-quick-build', time: 60000, timeDisplay: '01:00', dateAchieved: Date.now(), dateDisplay: '2024-01-14' },
        ],
      };
      localStorageMock.store[STORAGE_KEY] = JSON.stringify(mockData);

      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // Should have exactly one "个人最佳" label
      const personalBestLabels = screen.queryAllByText('个人最佳');
      expect(personalBestLabels).toHaveLength(1);
    });
  });

  describe('Challenge Selector Dropdown (AC-138-002)', () => {
    it('should render challenge selector when challengeId not provided', () => {
      render(
        <ChallengeLeaderboard
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const selector = screen.getByLabelText(/选择挑战/i);
      expect(selector).toBeTruthy();
    });

    it('should list all TIME_TRIAL_CHALLENGES in dropdown', () => {
      render(
        <ChallengeLeaderboard
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const selector = screen.getByLabelText(/选择挑战/i);
      const options = selector.querySelectorAll('option');
      
      // Should have more than just the default "全部挑战" option
      expect(options.length).toBeGreaterThan(1);
    });

    it('should show "全部挑战" as default option', () => {
      render(
        <ChallengeLeaderboard
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const defaultOption = screen.getByText('全部挑战');
      expect(defaultOption).toBeTruthy();
    });

    it('should include challenge titles in dropdown options', () => {
      render(
        <ChallengeLeaderboard
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Should show challenge titles
      const quickBuild = screen.getByText('快速建造');
      expect(quickBuild).toBeTruthy();
    });

    it('should switch leaderboard when challenge is selected', async () => {
      // Set up data for two different challenges
      const mockData = {
        'time-trial-quick-build': [
          { id: 'entry-1', challengeId: 'time-trial-quick-build', time: 50000, timeDisplay: '00:50', dateAchieved: Date.now(), dateDisplay: '2024-01-15' },
        ],
        'time-trial-stability-seeker': [
          { id: 'entry-2', challengeId: 'time-trial-stability-seeker', time: 120000, timeDisplay: '02:00', dateAchieved: Date.now(), dateDisplay: '2024-01-14' },
        ],
      };
      localStorageMock.store[STORAGE_KEY] = JSON.stringify(mockData);

      render(
        <ChallengeLeaderboard
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // Select second challenge
      const selector = screen.getByLabelText(/选择挑战/i);
      fireEvent.change(selector, { target: { value: 'time-trial-stability-seeker' } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // Should show the selected challenge's time
      const timeDisplay = screen.queryByText('02:00');
      expect(timeDisplay).toBeTruthy();
    });

    it('should not render selector when challengeId is provided', () => {
      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Selector should not exist
      expect(screen.queryByLabelText(/选择挑战/i)).toBeNull();
    });
  });

  describe('Close Button (AC-138-002)', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();

      render(
        <ChallengeLeaderboard
          isOpen={true}
          onClose={onClose}
        />
      );

      const closeButton = screen.getByRole('button', { name: /关闭/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should close modal on Escape key press', () => {
      const onClose = vi.fn();

      render(
        <ChallengeLeaderboard
          isOpen={true}
          onClose={onClose}
        />
      );

      // Focus and press Escape
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalled();
    });

    it('should not render when isOpen is false', () => {
      const onClose = vi.fn();

      render(
        <ChallengeLeaderboard
          isOpen={false}
          onClose={onClose}
        />
      );

      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('Leaderboard Modal Structure', () => {
    it('should render with proper dialog role', () => {
      render(
        <ChallengeLeaderboard
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeTruthy();
    });

    it('should have aria-modal attribute', () => {
      render(
        <ChallengeLeaderboard
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const dialog = screen.getByRole('dialog');
      // Use getAttribute directly
      const ariaModal = dialog.getAttribute('aria-modal');
      expect(ariaModal).toBe('true');
    });

    it('should have title "排行榜"', () => {
      render(
        <ChallengeLeaderboard
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const title = screen.getByText('排行榜');
      expect(title).toBeTruthy();
    });

    it('should show footer with entry count', async () => {
      const mockData = {
        'time-trial-quick-build': [
          { id: 'entry-1', challengeId: 'time-trial-quick-build', time: 50000, timeDisplay: '00:50', dateAchieved: Date.now(), dateDisplay: '2024-01-15' },
        ],
      };
      localStorageMock.store[STORAGE_KEY] = JSON.stringify(mockData);

      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // Should show "显示前 10 名成绩"
      const footer = screen.queryByText(/显示前.*名成绩/);
      expect(footer).toBeTruthy();
    });
  });

  describe('Leaderboard Persistence', () => {
    it('should call localStorage.getItem to load data', async () => {
      render(
        <ChallengeLeaderboard
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // getItem should have been called with the storage key
      expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should persist data when leaderboard changes', async () => {
      render(
        <ChallengeLeaderboard
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // setItem should have been called (to save initial empty state)
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});
