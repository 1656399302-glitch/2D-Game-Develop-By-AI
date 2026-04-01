/**
 * Challenge Integration Tests
 * 
 * Tests for verifying ChallengePanel integration and AchievementToast callbacks.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ChallengePanel } from '../components/Challenge/ChallengePanel';
import { useAchievementStore } from '../store/useAchievementStore';
import { useChallengeStore } from '../store/useChallengeStore';
import { ACHIEVEMENTS } from '../data/achievements';
import React from 'react';

describe('ChallengePanel Integration', () => {
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
    // Reset achievement store state including recentlyUnlocked
    useAchievementStore.setState({
      onUnlockCallback: null,
      recentlyUnlocked: new Set(),
    });
    cleanup();
  });

  it('ChallengePanel renders with accessible list structure', () => {
    render(<ChallengePanel />);
    const list = screen.getByRole('list');
    expect(list).toBeTruthy();
  });

  // Updated per Round 51: 20 challenges
  it('ChallengePanel renders 20 challenge list items', () => {
    render(<ChallengePanel />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(20);
  });

  it('ChallengePanel displays XP and completion count', () => {
    render(<ChallengePanel />);
    
    // Should show 0 XP initially (use getAllByText for multiple matches)
    const xpElements = screen.getAllByText(/0 XP/i);
    expect(xpElements.length).toBeGreaterThanOrEqual(1);
    
    // Updated per Round 51: Should show 0/20 completion
    expect(screen.getByText(/0\/20/)).toBeTruthy();
  });

  it('ChallengePanel has category filter tabs', () => {
    render(<ChallengePanel />);
    
    // Should have category tabs - use getAllByText for duplicate text
    expect(screen.getAllByText(/全部/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/创造/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/收集/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/激活/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/精通/).length).toBeGreaterThanOrEqual(1);
  });

  it('ChallengePanel has difficulty filters', () => {
    render(<ChallengePanel />);
    
    // Should have difficulty filters - use getAllByText for duplicate text
    expect(screen.getAllByText(/全部/).length).toBeGreaterThanOrEqual(1);
  });
});

describe('AchievementStore Integration', () => {
  beforeEach(() => {
    // Reset achievement store
    useAchievementStore.setState({
      onUnlockCallback: null,
      recentlyUnlocked: new Set(),
    });
  });

  it('has onUnlockCallback state', () => {
    const store = useAchievementStore.getState();
    expect(store).toHaveProperty('onUnlockCallback');
    expect(store.onUnlockCallback).toBeNull();
  });

  it('can set onUnlockCallback', () => {
    const mockCallback = () => {};
    const store = useAchievementStore.getState();
    
    store.setOnUnlockCallback(mockCallback);
    
    expect(useAchievementStore.getState().onUnlockCallback).toBe(mockCallback);
  });

  it('can remove onUnlockCallback by setting to null', () => {
    const mockCallback = () => {};
    const store = useAchievementStore.getState();
    
    store.setOnUnlockCallback(mockCallback);
    expect(useAchievementStore.getState().onUnlockCallback).toBe(mockCallback);
    
    store.setOnUnlockCallback(null);
    expect(useAchievementStore.getState().onUnlockCallback).toBeNull();
  });

  it('triggerUnlock calls the callback if set', () => {
    let callbackCalled = false;
    let receivedAchievement = null;
    
    const mockCallback = (achievement: typeof ACHIEVEMENTS[0]) => {
      callbackCalled = true;
      receivedAchievement = achievement;
    };
    
    const store = useAchievementStore.getState();
    store.setOnUnlockCallback(mockCallback);
    
    const achievement = ACHIEVEMENTS[0];
    store.triggerUnlock(achievement);
    
    expect(callbackCalled).toBe(true);
    expect(receivedAchievement).toBe(achievement);
  });

  it('triggerUnlock does nothing if callback is null', () => {
    const store = useAchievementStore.getState();
    store.setOnUnlockCallback(null);
    
    // Should not throw
    expect(() => {
      store.triggerUnlock(ACHIEVEMENTS[0]);
    }).not.toThrow();
  });
});

describe('ChallengeBrowser Removal Verification', () => {
  it('ChallengeBrowser is not imported in App.tsx', () => {
    // Read the App.tsx file to verify ChallengeBrowser is not imported
    const fs = require('fs');
    const path = require('path');
    const appContent = fs.readFileSync(
      path.join(__dirname, '../App.tsx'),
      'utf8'
    );
    
    expect(appContent).not.toMatch(/ChallengeBrowser/);
  });
});

describe('Modal Open/Close Stability', () => {
  it('can render ChallengePanel in isolation multiple times', () => {
    const { unmount } = render(<ChallengePanel />);
    expect(screen.getByRole('list')).toBeTruthy();
    unmount();
    
    // Re-render
    const { unmount: unmount2 } = render(<ChallengePanel />);
    expect(screen.getByRole('list')).toBeTruthy();
    unmount2();
    
    // Re-render again
    const { unmount: unmount3 } = render(<ChallengePanel />);
    expect(screen.getByRole('list')).toBeTruthy();
    unmount3();
  });
});

describe('AchievementToast Callback Integration', () => {
  beforeEach(() => {
    useAchievementStore.setState({
      onUnlockCallback: null,
      recentlyUnlocked: new Set(),
    });
  });

  it('achievement store can be used with callback pattern', () => {
    const store = useAchievementStore.getState();
    let callbackCalled = false;
    let receivedAchievement = null;
    
    const mockCallback = (achievement: typeof ACHIEVEMENTS[0]) => {
      callbackCalled = true;
      receivedAchievement = achievement;
    };
    
    // Set callback
    store.setOnUnlockCallback(mockCallback);
    
    // Trigger unlock
    store.triggerUnlock(ACHIEVEMENTS[0]);
    
    // Verify callback was called
    expect(callbackCalled).toBe(true);
    expect(receivedAchievement).toBe(ACHIEVEMENTS[0]);
  });

  it('achievement store supports removing callback', () => {
    const store = useAchievementStore.getState();
    let callbackCalled = false;
    
    const mockCallback = () => {
      callbackCalled = true;
    };
    
    store.setOnUnlockCallback(mockCallback);
    store.setOnUnlockCallback(null);
    
    store.triggerUnlock(ACHIEVEMENTS[0]);
    
    expect(callbackCalled).toBe(false);
  });
});
