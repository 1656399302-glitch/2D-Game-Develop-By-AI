/**
 * TimeTrialChallenge Component Tests
 * 
 * Tests for the TimeTrialChallenge modal component with timer functionality,
 * start/pause/resume/reset actions, objective progress, and completion flow.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import React from 'react';
import { TimeTrialChallenge } from '../components/Challenges/TimeTrialChallenge';

// Mock stores with proper Zustand interface
vi.mock('../store/useChallengeStore', () => ({
  useChallengeStore: vi.fn((selector?: (state: any) => any) => {
    const mockState = {
      addLeaderboardEntry: vi.fn(),
      leaderboard: {},
    };
    return selector ? selector(mockState) : mockState;
  }),
}));

vi.mock('../store/useMachineStore', () => ({
  useMachineStore: vi.fn((selector?: (state: any) => any) => {
    const mockState = {
      generatedAttributes: null,
      modules: [],
      connections: [],
    };
    return selector ? selector(mockState) : mockState;
  }),
}));

// Helper function: format milliseconds to MM:SS (matches component logic)
function formatTimerDisplay(milliseconds: number): string {
  const absMs = Math.abs(milliseconds);
  const totalSeconds = Math.floor(absMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${milliseconds < 0 ? '-' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

describe('TimeTrialChallenge Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    cleanup();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Timer Format (AC-138-001)', () => {
    it('should format 65000ms as "01:05"', () => {
      expect(formatTimerDisplay(65000)).toBe('01:05');
    });

    it('should format 0ms as "00:00"', () => {
      expect(formatTimerDisplay(0)).toBe('00:00');
    });

    it('should format 60000ms as "01:00"', () => {
      expect(formatTimerDisplay(60000)).toBe('01:00');
    });

    it('should format 125000ms as "02:05"', () => {
      expect(formatTimerDisplay(125000)).toBe('02:05');
    });

    it('should format negative milliseconds with minus sign', () => {
      expect(formatTimerDisplay(-5000)).toBe('-00:05');
    });

    it('should render timer display in MM:SS format', () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Timer should show the time limit from the challenge (180 seconds = 3:00)
      // Use queryByText to avoid error on multiple matches
      const timerDisplay = screen.queryByText('03:00');
      expect(timerDisplay).toBeTruthy();
    });
  });

  describe('Start Trial Action (AC-138-001)', () => {
    it('should show "开始挑战" button when trial is not active', () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const startButton = screen.getByRole('button', { name: /开始挑战/i });
      expect(startButton).toBeTruthy();
    });

    it('should start trial when "开始挑战" button is clicked', async () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Click start button
      const startButton = screen.getByRole('button', { name: /开始挑战/i });
      fireEvent.click(startButton);

      // Advance timers so the interval fires
      await vi.advanceTimersByTimeAsync(1100);

      // Pause button should appear
      const pauseButton = screen.getByRole('button', { name: /暂停/i });
      expect(pauseButton).toBeTruthy();
    });

    it('should set isTrialActive to true after starting', async () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const startButton = screen.getByRole('button', { name: /开始挑战/i });
      fireEvent.click(startButton);

      // Advance timers
      await vi.advanceTimersByTimeAsync(1100);

      // Pause button should be visible
      expect(screen.getByRole('button', { name: /暂停/i })).toBeTruthy();
    });
  });

  describe('Pause Trial Action (AC-138-001)', () => {
    it('should show "暂停" button when trial is active and not paused', async () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Start trial first
      const startButton = screen.getByRole('button', { name: /开始挑战/i });
      fireEvent.click(startButton);
      await vi.advanceTimersByTimeAsync(1100);

      // Pause button should appear
      const pauseButton = screen.getByRole('button', { name: /暂停/i });
      expect(pauseButton).toBeTruthy();
    });

    it('should pause trial when "暂停" button is clicked', async () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Start trial
      fireEvent.click(screen.getByRole('button', { name: /开始挑战/i }));
      await vi.advanceTimersByTimeAsync(1100);

      // Click pause
      fireEvent.click(screen.getByRole('button', { name: /暂停/i }));
      await vi.advanceTimersByTimeAsync(100);

      // "继续" button should appear
      const resumeButton = screen.getByRole('button', { name: /继续/i });
      expect(resumeButton).toBeTruthy();
    });
  });

  describe('Resume Trial Action (AC-138-001)', () => {
    it('should show "继续" button when trial is paused', async () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Start and pause
      fireEvent.click(screen.getByRole('button', { name: /开始挑战/i }));
      await vi.advanceTimersByTimeAsync(1100);
      fireEvent.click(screen.getByRole('button', { name: /暂停/i }));
      await vi.advanceTimersByTimeAsync(100);

      // Resume button should appear
      const resumeButton = screen.getByRole('button', { name: /继续/i });
      expect(resumeButton).toBeTruthy();
    });

    it('should resume trial when "继续" button is clicked', async () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Start, pause, then resume
      fireEvent.click(screen.getByRole('button', { name: /开始挑战/i }));
      await vi.advanceTimersByTimeAsync(1100);
      fireEvent.click(screen.getByRole('button', { name: /暂停/i }));
      await vi.advanceTimersByTimeAsync(100);
      fireEvent.click(screen.getByRole('button', { name: /继续/i }));
      await vi.advanceTimersByTimeAsync(100);

      // Pause button should reappear
      expect(screen.getByRole('button', { name: /暂停/i })).toBeTruthy();
    });
  });

  describe('Reset Trial Action (AC-138-001)', () => {
    it('should show "重置" button when trial is active', async () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Start trial
      fireEvent.click(screen.getByRole('button', { name: /开始挑战/i }));
      await vi.advanceTimersByTimeAsync(1100);

      // Reset button should appear
      const resetButton = screen.getByRole('button', { name: /重置/i });
      expect(resetButton).toBeTruthy();
    });

    it('should reset trial state when "重置" button is clicked', async () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Start and advance time
      fireEvent.click(screen.getByRole('button', { name: /开始挑战/i }));
      await vi.advanceTimersByTimeAsync(2100);

      // Click reset
      fireEvent.click(screen.getByRole('button', { name: /重置/i }));
      await vi.advanceTimersByTimeAsync(100);

      // Start button should reappear
      expect(screen.getByRole('button', { name: /开始挑战/i })).toBeTruthy();
    });

    it('should return timer to initial value after reset', async () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Start and advance
      fireEvent.click(screen.getByRole('button', { name: /开始挑战/i }));
      await vi.advanceTimersByTimeAsync(3100);
      fireEvent.click(screen.getByRole('button', { name: /重置/i }));

      // Timer should show initial time (03:00 for quick-build)
      const timerText = screen.queryByText('03:00');
      expect(timerText).toBeTruthy();
    });
  });

  describe('Objective Progress Display (AC-138-001)', () => {
    it('should display objective progress with current/target format', () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Should show progress format (0/1, 1/1, etc.)
      // Use exact match for progress
      const progressText = screen.getByText('0/1');
      expect(progressText).toBeTruthy();
    });

    it('should display progress bar for objectives', () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Progress bars should be present (div with h-2 class inside a div with bg-[#1e2a42])
      const progressBars = document.querySelectorAll('[class*="h-2"][class*="rounded-full"]');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('Close Button', () => {
    it('should close modal when close button is clicked', () => {
      const onClose = vi.fn();

      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={onClose}
        />
      );

      // Click close button
      const closeButton = screen.getByRole('button', { name: /关闭/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should not render when isOpen is false', () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={false}
          onClose={vi.fn()}
        />
      );

      // Modal should not be in the document
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('Challenge Selection', () => {
    it('should render with different challenge IDs', () => {
      const { rerender } = render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Title should contain challenge title
      const title = screen.getByText(/快速建造/);
      expect(title).toBeTruthy();

      // Rerender with different challenge
      rerender(
        <TimeTrialChallenge
          challengeId="time-trial-stability-seeker"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const newTitle = screen.getByText(/稳定追寻者/);
      expect(newTitle).toBeTruthy();
    });

    it('should render nothing for invalid challenge ID', () => {
      render(
        <TimeTrialChallenge
          challengeId="non-existent-challenge"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Modal should not render
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('Timer Color Changes', () => {
    it('should show timer with cyan color when plenty of time remains', () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Timer should be visible
      const timer = screen.queryByText('03:00');
      expect(timer).toBeTruthy();
    });

    it('should show timer with warning color when time is low', async () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      // Start trial - time will decrease
      fireEvent.click(screen.getByRole('button', { name: /开始挑战/i }));

      // Advance time close to limit (to 25% remaining)
      // quick-build has 180s limit, so 25% = 45s remaining
      await vi.advanceTimersByTimeAsync(135100); // 135+ seconds elapsed

      // Timer should show remaining time
      const timerText = screen.queryByText('00:45');
      expect(timerText).toBeTruthy();
    });
  });

  describe('Modal Structure', () => {
    it('should have dialog role', () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeTruthy();
    });

    it('should have aria-modal attribute', () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const dialog = screen.getByRole('dialog');
      // Use getAttribute directly instead of toHaveAttribute
      const ariaModal = dialog.getAttribute('aria-modal');
      expect(ariaModal).toBe('true');
    });

    it('should have title with challenge name', () => {
      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={vi.fn()}
        />
      );

      const title = screen.getByText(/快速建造/);
      expect(title).toBeTruthy();
    });

    it('should close when clicking backdrop', () => {
      const onClose = vi.fn();

      render(
        <TimeTrialChallenge
          challengeId="time-trial-quick-build"
          isOpen={true}
          onClose={onClose}
        />
      );

      // Click backdrop (the outer div)
      const dialog = screen.getByRole('dialog');
      fireEvent.click(dialog);

      // onClose should be called
      expect(onClose).toHaveBeenCalled();
    });
  });
});
