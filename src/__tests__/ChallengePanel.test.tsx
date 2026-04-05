/**
 * ChallengePanel Component Tests
 * 
 * Tests for the ChallengePanel component accessibility, rendering,
 * and Time Trial tab functionality.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { ChallengePanel } from '../components/Challenge/ChallengePanel';
import { useChallengeStore } from '../store/useChallengeStore';
import React from 'react';

// Mock TimeTrialChallenge and ChallengeLeaderboard to avoid complex dependencies
vi.mock('../components/Challenges/TimeTrialChallenge', () => ({
  TimeTrialChallenge: vi.fn(({ isOpen, onClose, challengeId, onComplete }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="time-trial-modal">
        <span>Time Trial Modal - {challengeId}</span>
        <button onClick={onClose}>Close</button>
        <button onClick={() => onComplete?.(50000, 100)}>Complete</button>
      </div>
    );
  }),
}));

vi.mock('../components/Challenges/ChallengeLeaderboard', () => ({
  ChallengeLeaderboard: vi.fn(({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="leaderboard-modal">
        <span>Leaderboard Modal</span>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }),
}));

describe('ChallengePanel Accessibility', () => {
  beforeEach(() => {
    // Reset challenge store state
    useChallengeStore.setState({
      completedChallenges: [],
      claimedRewards: [],
      totalXP: 0,
      badges: [],
      challengeProgress: {
        machinesCreated: 0,
        machinesSaved: 0,
        connectionsCreated: 0,
        activations: 0,
        overloadsTriggered: 0,
        gearsCreated: 0,
        highestStability: 0,
      },
      loading: false,
    });
    cleanup();
  });

  // Updated per Round 51: 20 challenges
  it('should render 20 challenge list items', () => {
    render(<ChallengePanel />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(20);
  });

  it('should render with proper list structure', () => {
    render(<ChallengePanel />);
    const list = screen.getByRole('list');
    expect(list).toBeTruthy();
  });
});

describe('ChallengePanel Content', () => {
  beforeEach(() => {
    useChallengeStore.setState({
      completedChallenges: [],
      claimedRewards: [],
      totalXP: 0,
      badges: [],
      challengeProgress: {
        machinesCreated: 0,
        machinesSaved: 0,
        connectionsCreated: 0,
        activations: 0,
        overloadsTriggered: 0,
        gearsCreated: 0,
        highestStability: 0,
      },
      loading: false,
    });
    cleanup();
  });

  // Updated per Round 51: 20 challenges
  it('should display 0/20 completion count', () => {
    render(<ChallengePanel />);
    expect(screen.getByText(/0\/20/)).toBeTruthy();
  });

  it('should display XP information', () => {
    render(<ChallengePanel />);
    // Should have XP text somewhere in the component
    const xpText = screen.getAllByText(/XP/i);
    expect(xpText.length).toBeGreaterThan(0);
  });
});

describe('ChallengePanel Time Trial Tab (AC-138-003)', () => {
  beforeEach(() => {
    useChallengeStore.setState({
      completedChallenges: [],
      claimedRewards: [],
      totalXP: 0,
      badges: [],
      challengeProgress: {
        machinesCreated: 0,
        machinesSaved: 0,
        connectionsCreated: 0,
        activations: 0,
        overloadsTriggered: 0,
        gearsCreated: 0,
        highestStability: 0,
      },
      loading: false,
    });
    cleanup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should switch to Time Trial tab when clicked (AC-138-003)', () => {
    render(<ChallengePanel />);

    // Initially on challenges tab
    expect(screen.getByText('常规挑战')).toBeTruthy();

    // Click on Time Trial tab
    const timeTrialTab = screen.getByRole('button', { name: /⏱️ 时间挑战/i });
    fireEvent.click(timeTrialTab);

    // Time Trial content should be visible
    // Time Trial cards should appear with start buttons
    const startButtons = screen.getAllByRole('button', { name: /开始挑战/i });
    expect(startButtons.length).toBeGreaterThan(0);
  });

  it('should render TimeTrialCard with difficulty badge and start button (AC-138-003)', () => {
    render(<ChallengePanel />);

    // Switch to Time Trial tab
    const timeTrialTab = screen.getByRole('button', { name: /⏱️ 时间挑战/i });
    fireEvent.click(timeTrialTab);

    // Should show difficulty badges (简单/普通/困难/极限)
    const difficultyBadges = screen.getAllByText(/(简单|普通|困难|极限)/i);
    expect(difficultyBadges.length).toBeGreaterThan(0);

    // Should show "开始挑战" buttons
    const startButtons = screen.getAllByRole('button', { name: /开始挑战/i });
    expect(startButtons.length).toBeGreaterThan(0);
  });

  it('should show two tabs: "常规挑战" and "⏱️ 时间挑战"', () => {
    render(<ChallengePanel />);

    // Tab 1: Regular challenges
    expect(screen.getByText('常规挑战')).toBeTruthy();

    // Tab 2: Time trials
    expect(screen.getByText('⏱️ 时间挑战')).toBeTruthy();
  });

  it('should display all 12 time trial challenges', () => {
    render(<ChallengePanel />);

    // Switch to Time Trial tab
    const timeTrialTab = screen.getByRole('button', { name: /⏱️ 时间挑战/i });
    fireEvent.click(timeTrialTab);

    // Should show at least 12 start buttons (12 time trials)
    const startButtons = screen.getAllByRole('button', { name: /开始挑战/i });
    expect(startButtons.length).toBeGreaterThanOrEqual(12);
  });

  it('should show Time Trial specific titles', () => {
    render(<ChallengePanel />);

    // Switch to Time Trial tab
    const timeTrialTab = screen.getByRole('button', { name: /⏱️ 时间挑战/i });
    fireEvent.click(timeTrialTab);

    // Should show Time Trial specific challenge titles - use queryAllByText
    const titles = screen.queryAllByText(/快速建造|稳定追寻者|连接大师/i);
    expect(titles.length).toBeGreaterThan(0);
  });

  it('should show difficulty filter buttons when on Time Trial tab', () => {
    render(<ChallengePanel />);

    // Switch to Time Trial tab
    const timeTrialTab = screen.getByRole('button', { name: /⏱️ 时间挑战/i });
    fireEvent.click(timeTrialTab);

    // Should show difficulty filters - use partial text matching
    const filters = screen.getAllByText(/(全部|简单|普通|困难|极限)/i);
    expect(filters.length).toBeGreaterThanOrEqual(5);
  });

  it('should show leaderboard button when on Time Trial tab', () => {
    render(<ChallengePanel />);

    // Switch to Time Trial tab
    const timeTrialTab = screen.getByRole('button', { name: /⏱️ 时间挑战/i });
    fireEvent.click(timeTrialTab);

    // Should show leaderboard button
    const leaderboardButton = screen.getByRole('button', { name: /🏆 排行榜/i });
    expect(leaderboardButton).toBeTruthy();
  });

  it('should open TimeTrialChallenge modal when start button is clicked', async () => {
    render(<ChallengePanel />);

    // Switch to Time Trial tab
    const timeTrialTab = screen.getByRole('button', { name: /⏱️ 时间挑战/i });
    fireEvent.click(timeTrialTab);

    // Click first "开始挑战" button
    const startButton = screen.getAllByRole('button', { name: /开始挑战/i })[0];
    fireEvent.click(startButton);

    // Modal should open
    await waitFor(() => {
      const modal = screen.getByTestId('time-trial-modal');
      expect(modal).toBeTruthy();
    });
  });

  it('should show time limit information on Time Trial cards', () => {
    render(<ChallengePanel />);

    // Switch to Time Trial tab
    const timeTrialTab = screen.getByRole('button', { name: /⏱️ 时间挑战/i });
    fireEvent.click(timeTrialTab);

    // Should show time icon and limit (⏱️ followed by time)
    const timeIcons = screen.getAllByText('⏱️');
    expect(timeIcons.length).toBeGreaterThan(0);
  });

  it('should filter time trials by difficulty when filter clicked', async () => {
    render(<ChallengePanel />);

    // Switch to Time Trial tab
    const timeTrialTab = screen.getByRole('button', { name: /⏱️ 时间挑战/i });
    fireEvent.click(timeTrialTab);

    // Count all start buttons
    const allStartButtons = screen.getAllByRole('button', { name: /开始挑战/i });
    const totalCards = allStartButtons.length;

    // Click on "简单" (easy) filter - use regex to match
    const easyFilter = screen.getByRole('button', { name: /^简单$/i });
    fireEvent.click(easyFilter);

    // Should show fewer cards (only easy challenges)
    const filteredStartButtons = screen.getAllByRole('button', { name: /开始挑战/i });
    expect(filteredStartButtons.length).toBeLessThan(totalCards);
  });

  it('should switch back to regular challenges tab', () => {
    render(<ChallengePanel />);

    // Go to Time Trial tab first
    const timeTrialTab = screen.getByRole('button', { name: /⏱️ 时间挑战/i });
    fireEvent.click(timeTrialTab);

    // Go back to regular challenges tab
    const regularTab = screen.getByRole('button', { name: /常规挑战/i });
    fireEvent.click(regularTab);

    // Should show regular challenge content (list items)
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(20);
  });
});
