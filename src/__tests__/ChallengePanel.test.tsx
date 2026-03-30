import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChallengePanel } from '../components/Challenge/ChallengePanel';
import { useChallengeStore } from '../store/useChallengeStore';

describe('ChallengePanel Accessibility', () => {
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
  });

  it('should render with accessible list structure', () => {
    render(<ChallengePanel />);
    const list = screen.getByRole('list');
    expect(list).toBeTruthy();
  });

  it('should render 16 challenge list items', () => {
    render(<ChallengePanel />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(16);
  });
});
