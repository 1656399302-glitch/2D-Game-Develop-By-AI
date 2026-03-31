/**
 * ChallengePanel Component Tests
 * 
 * Tests for the ChallengePanel component accessibility and rendering.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ChallengePanel } from '../components/Challenge/ChallengePanel';
import { useChallengeStore } from '../store/useChallengeStore';
import React from 'react';

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
