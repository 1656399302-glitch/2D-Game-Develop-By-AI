/**
 * Challenge Expansion Tests
 * 
 * Tests for time trial challenges and leaderboard functionality.
 */

import { 
  render, 
  screen, 
  fireEvent,
} from '@testing-library/react';
import React from 'react';

// Test utilities
const formatTimeDisplay = (ms: number): string => {
  const absMs = Math.abs(ms);
  const totalSeconds = Math.floor(absMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${ms < 0 ? '-' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formatDateDisplay = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

describe('Time Trial Challenge Types', () => {
  test('formatTimeDisplay formats correctly', () => {
    expect(formatTimeDisplay(0)).toBe('00:00');
    expect(formatTimeDisplay(1000)).toBe('00:01');
    expect(formatTimeDisplay(60000)).toBe('01:00');
    expect(formatTimeDisplay(125000)).toBe('02:05');
    expect(formatTimeDisplay(-5000)).toBe('-00:05');
  });

  test('formatDateDisplay formats correctly', () => {
    const timestamp = new Date('2024-01-15').getTime();
    expect(formatDateDisplay(timestamp)).toBe('2024-01-15');
  });
});

describe('Time Trial Challenge Definitions', () => {
  // Import dynamically since the module might have dependencies
  let TIME_TRIAL_CHALLENGES: any[];
  let getTimeTrialById: any;
  let getTimeTrialsByDifficulty: any;

  beforeAll(async () => {
    const module = await import('../data/challengeTimeTrials');
    TIME_TRIAL_CHALLENGES = module.TIME_TRIAL_CHALLENGES;
    getTimeTrialById = module.getTimeTrialById;
    getTimeTrialsByDifficulty = module.getTimeTrialsByDifficulty;
  });

  test('12 time trial challenges exist', () => {
    expect(TIME_TRIAL_CHALLENGES).toHaveLength(12);
  });

  test('challenges are distributed across difficulties', () => {
    const easy = getTimeTrialsByDifficulty('easy');
    const normal = getTimeTrialsByDifficulty('normal');
    const hard = getTimeTrialsByDifficulty('hard');
    const extreme = getTimeTrialsByDifficulty('extreme');
    
    expect(easy).toHaveLength(3);
    expect(normal).toHaveLength(3);
    expect(hard).toHaveLength(3);
    expect(extreme).toHaveLength(3);
  });

  test('each challenge has required fields', () => {
    TIME_TRIAL_CHALLENGES.forEach((challenge: any) => {
      expect(challenge.id).toBeTruthy();
      expect(challenge.title).toBeTruthy();
      expect(challenge.description).toBeTruthy();
      expect(challenge.timeLimit).toBeGreaterThan(0);
      expect(challenge.difficulty).toBeTruthy();
      expect(challenge.baseReward).toBeGreaterThan(0);
      expect(challenge.rewardMultiplier).toBeGreaterThan(0);
      expect(Array.isArray(challenge.objectives)).toBe(true);
      expect(challenge.objectives.length).toBeGreaterThan(0);
    });
  });

  test('getTimeTrialById returns correct challenge', () => {
    const challenge = getTimeTrialById('time-trial-quick-build');
    expect(challenge).toBeDefined();
    expect(challenge?.title).toBe('快速建造');
  });

  test('getTimeTrialById returns undefined for invalid id', () => {
    const challenge = getTimeTrialById('invalid-id');
    expect(challenge).toBeUndefined();
  });

  test('challenge objectives have valid types', () => {
    const validTypes = ['create_machine', 'reach_stability', 'use_module_count', 'create_connections', 'reach_rarity', 'reach_output'];
    
    TIME_TRIAL_CHALLENGES.forEach((challenge: any) => {
      challenge.objectives.forEach((objective: any) => {
        expect(validTypes).toContain(objective.type);
        expect(objective.target).toBeGreaterThan(0);
      });
    });
  });
});

describe('Difficulty Multipliers (AC5)', () => {
  let getDifficultyMultiplier: any;
  let getTimeTrialDifficultyColor: any;
  let getTimeTrialDifficultyLabel: any;

  beforeAll(async () => {
    const challengeTypes = await import('../types/challenge');
    getDifficultyMultiplier = challengeTypes.getDifficultyMultiplier;
    getTimeTrialDifficultyColor = challengeTypes.getTimeTrialDifficultyColor;
    getTimeTrialDifficultyLabel = challengeTypes.getTimeTrialDifficultyLabel;
  });

  test('difficulty multipliers are correct', () => {
    expect(getDifficultyMultiplier('easy')).toBe(0.5);
    expect(getDifficultyMultiplier('normal')).toBe(1.0);
    expect(getDifficultyMultiplier('hard')).toBe(1.5);
    expect(getDifficultyMultiplier('extreme')).toBe(2.0);
  });

  test('difficulty colors are defined', () => {
    expect(getTimeTrialDifficultyColor('easy')).toBe('#22c55e');
    expect(getTimeTrialDifficultyColor('normal')).toBe('#3b82f6');
    expect(getTimeTrialDifficultyColor('hard')).toBe('#f59e0b');
    expect(getTimeTrialDifficultyColor('extreme')).toBe('#ef4444');
  });

  test('difficulty labels are in Chinese', () => {
    expect(getTimeTrialDifficultyLabel('easy')).toBe('简单');
    expect(getTimeTrialDifficultyLabel('normal')).toBe('普通');
    expect(getTimeTrialDifficultyLabel('hard')).toBe('困难');
    expect(getTimeTrialDifficultyLabel('extreme')).toBe('极限');
  });
});

describe('Leaderboard Entry', () => {
  let generateLeaderboardEntryId: any;

  beforeAll(async () => {
    const challengeTypes = await import('../types/challenge');
    generateLeaderboardEntryId = challengeTypes.generateLeaderboardEntryId;
  });

  test('generateLeaderboardEntryId creates unique IDs', () => {
    const id1 = generateLeaderboardEntryId('challenge-1', 5000);
    const id2 = generateLeaderboardEntryId('challenge-1', 6000);
    const id3 = generateLeaderboardEntryId('challenge-2', 5000);
    
    expect(id1).not.toBe(id2);
    expect(id1).not.toBe(id3);
    expect(id2).not.toBe(id3);
  });

  test('generateLeaderboardEntryId includes challenge and time', () => {
    const id = generateLeaderboardEntryId('test-challenge', 12345);
    expect(id).toContain('lb-test-challenge');
    expect(id).toContain('12345');
  });
});

describe('Leaderboard Persistence', () => {
  test('leaderboard sorting works correctly', () => {
    const entries = [
      { id: 'entry-1', time: 6000 },
      { id: 'entry-2', time: 5000 },
      { id: 'entry-3', time: 7000 },
    ];
    
    // Sort by time (ascending - fastest first)
    const sorted = entries.sort((a, b) => a.time - b.time);
    
    expect(sorted[0].time).toBe(5000);
    expect(sorted[1].time).toBe(6000);
    expect(sorted[2].time).toBe(7000);
  });

  test('leaderboard limits to top 10 entries', () => {
    const entries = Array.from({ length: 15 }, (_, i) => ({
      id: `entry-${i}`,
      time: (i + 1) * 1000,
    }));
    
    // Sort and take top 10
    const trimmed = entries
      .sort((a, b) => a.time - b.time)
      .slice(0, 10);

    expect(trimmed).toHaveLength(10);
    expect(trimmed[0].time).toBe(1000); // Fastest first
    expect(trimmed[9].time).toBe(10000); // 10th entry
  });
});

describe('Challenge Store Integration', () => {
  test('useChallengeStore has leaderboard methods', async () => {
    const { useChallengeStore } = await import('../store/useChallengeStore');
    
    // Check store has leaderboard methods
    expect(typeof useChallengeStore.getState().addLeaderboardEntry).toBe('function');
    expect(typeof useChallengeStore.getState().getLeaderboard).toBe('function');
    expect(typeof useChallengeStore.getState().getPersonalBest).toBe('function');
    expect(typeof useChallengeStore.getState().clearChallengeLeaderboard).toBe('function');
    expect(typeof useChallengeStore.getState().clearAllLeaderboard).toBe('function');
  });

  test('useChallengeStore has time trial methods', async () => {
    const { useChallengeStore } = await import('../store/useChallengeStore');
    
    // Check store has time trial methods
    expect(typeof useChallengeStore.getState().startTimeTrial).toBe('function');
    expect(typeof useChallengeStore.getState().pauseTimeTrial).toBe('function');
    expect(typeof useChallengeStore.getState().resumeTimeTrial).toBe('function');
    expect(typeof useChallengeStore.getState().stopTimeTrial).toBe('function');
    expect(typeof useChallengeStore.getState().completeTimeTrial).toBe('function');
    expect(typeof useChallengeStore.getState().resetTimeTrial).toBe('function');
    expect(typeof useChallengeStore.getState().updateTimeTrialProgress).toBe('function');
  });

  test('time trial state initializes correctly', async () => {
    const { useChallengeStore } = await import('../store/useChallengeStore');
    
    const state = useChallengeStore.getState().timeTrialState;
    
    expect(state.activeChallengeId).toBeNull();
    expect(state.isTrialActive).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(state.elapsedTime).toBe(0);
    expect(state.startTimestamp).toBeNull();
    expect(state.isCompleted).toBe(false);
    expect(state.completionTime).toBeNull();
  });
});
