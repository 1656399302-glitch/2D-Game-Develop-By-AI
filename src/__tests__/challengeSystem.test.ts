import { describe, it, expect, beforeEach } from 'vitest';
import {
  CHALLENGE_DEFINITIONS,
  getChallengeById,
  getChallengesByCategory,
  getChallengesByDifficulty,
  getChallengeDifficultyColor,
  getChallengeDifficultyLabel,
  getChallengeCategoryLabel,
} from '../data/challenges';
import { useChallengeStore } from '../store/useChallengeStore';

describe('Challenge Definitions', () => {
  test('should have exactly 8 challenges', () => {
    expect(CHALLENGE_DEFINITIONS.length).toBe(8);
  });

  test('should have challenges in all difficulty tiers', () => {
    const difficulties = CHALLENGE_DEFINITIONS.map(c => c.difficulty);
    expect(difficulties).toContain('beginner');
    expect(difficulties).toContain('intermediate');
    expect(difficulties).toContain('advanced');
    expect(new Set(difficulties).size).toBe(3);
  });

  test('should have challenges in all categories', () => {
    const categories = CHALLENGE_DEFINITIONS.map(c => c.category);
    expect(categories).toContain('creation');
    expect(categories).toContain('collection');
    expect(categories).toContain('activation');
    expect(categories).toContain('mastery');
    expect(new Set(categories).size).toBe(4);
  });

  test('each challenge should have valid reward', () => {
    CHALLENGE_DEFINITIONS.forEach(challenge => {
      expect(challenge.reward).toBeDefined();
      expect(challenge.reward.type).toMatch(/^(xp|recipe|badge)$/);
      if (challenge.reward.type === 'recipe') {
        expect(typeof challenge.reward.value).toBe('string');
      }
      if (challenge.reward.type === 'badge') {
        expect(typeof challenge.reward.value).toBe('string');
      }
    });
  });

  test('each challenge should have required fields', () => {
    CHALLENGE_DEFINITIONS.forEach(challenge => {
      expect(challenge.id).toBeDefined();
      expect(challenge.title).toBeTruthy();
      expect(challenge.description).toBeTruthy();
      expect(challenge.category).toBeDefined();
      expect(challenge.difficulty).toBeDefined();
      expect(challenge.target).toBeDefined();
      expect(typeof challenge.target).toBe('number');
      expect(challenge.reward).toBeDefined();
    });
  });

  test('each challenge should have unique id', () => {
    const ids = CHALLENGE_DEFINITIONS.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(8);
  });

  test('should have at least 2 beginner challenges', () => {
    const beginnerCount = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'beginner').length;
    expect(beginnerCount).toBeGreaterThanOrEqual(2);
  });

  test('should have at least 2 intermediate challenges', () => {
    const intermediateCount = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'intermediate').length;
    expect(intermediateCount).toBeGreaterThanOrEqual(2);
  });

  test('should have at least 2 advanced challenges', () => {
    const advancedCount = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'advanced').length;
    expect(advancedCount).toBeGreaterThanOrEqual(2);
  });
});

describe('Challenge Helper Functions', () => {
  test('getChallengeById should return correct challenge', () => {
    const challenge = getChallengeById('first-machine');
    expect(challenge).toBeDefined();
    expect(challenge?.title).toBe('初代锻造');
  });

  test('getChallengeById should return undefined for invalid id', () => {
    const challenge = getChallengeById('invalid-id');
    expect(challenge).toBeUndefined();
  });

  test('getChallengesByCategory should filter correctly', () => {
    const creationChallenges = getChallengesByCategory('creation');
    expect(creationChallenges.length).toBeGreaterThan(0);
    creationChallenges.forEach(c => {
      expect(c.category).toBe('creation');
    });
  });

  test('getChallengesByDifficulty should filter correctly', () => {
    const beginnerChallenges = getChallengesByDifficulty('beginner');
    expect(beginnerChallenges.length).toBeGreaterThan(0);
    beginnerChallenges.forEach(c => {
      expect(c.difficulty).toBe('beginner');
    });
  });

  test('getChallengeDifficultyColor should return valid colors', () => {
    expect(getChallengeDifficultyColor('beginner')).toBe('#22c55e');
    expect(getChallengeDifficultyColor('intermediate')).toBe('#3b82f6');
    expect(getChallengeDifficultyColor('advanced')).toBe('#a855f7');
  });

  test('getChallengeDifficultyLabel should return Chinese labels', () => {
    expect(getChallengeDifficultyLabel('beginner')).toBe('初级');
    expect(getChallengeDifficultyLabel('intermediate')).toBe('中级');
    expect(getChallengeDifficultyLabel('advanced')).toBe('高级');
  });

  test('getChallengeCategoryLabel should return Chinese labels', () => {
    expect(getChallengeCategoryLabel('creation')).toBe('创造');
    expect(getChallengeCategoryLabel('collection')).toBe('收集');
    expect(getChallengeCategoryLabel('activation')).toBe('激活');
    expect(getChallengeCategoryLabel('mastery')).toBe('精通');
  });
});

describe('useChallengeStore', () => {
  // Reset store state before each test
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

  test('should initialize with empty completedChallenges', () => {
    expect(useChallengeStore.getState().completedChallenges).toEqual([]);
    expect(useChallengeStore.getState().completedChallenges.length).toBe(0);
  });

  test('should initialize with empty badges', () => {
    expect(useChallengeStore.getState().badges).toEqual([]);
  });

  test('should initialize with 0 totalXP', () => {
    expect(useChallengeStore.getState().totalXP).toBe(0);
  });

  test('should initialize with default challengeProgress', () => {
    const progress = useChallengeStore.getState().challengeProgress;
    expect(progress.machinesCreated).toBe(0);
    expect(progress.machinesSaved).toBe(0);
    expect(progress.connectionsCreated).toBe(0);
    expect(progress.activations).toBe(0);
    expect(progress.overloadsTriggered).toBe(0);
    expect(progress.gearsCreated).toBe(0);
    expect(progress.highestStability).toBe(0);
  });

  test('checkChallengeCompletion should return false for incomplete challenges', () => {
    const result = useChallengeStore.getState().checkChallengeCompletion('machines_created', 1);
    expect(result).toBe(false);
  });

  test('checkChallengeCompletion should return true when target met', () => {
    useChallengeStore.getState().updateProgress({ machinesCreated: 1 });
    const result = useChallengeStore.getState().checkChallengeCompletion('machines_created', 1);
    expect(result).toBe(true);
  });

  test('checkChallengeCompletion should work with higher targets', () => {
    useChallengeStore.getState().updateProgress({ connectionsCreated: 10 });
    const result = useChallengeStore.getState().checkChallengeCompletion('connections_created', 5);
    expect(result).toBe(true);
  });

  test('claimReward should add challenge to completedChallenges for XP reward', () => {
    useChallengeStore.getState().claimReward('first-machine');
    expect(useChallengeStore.getState().completedChallenges).toContain('first-machine');
  });

  test('claiming XP reward should increment totalXP by correct amount', () => {
    useChallengeStore.getState().claimReward('first-machine'); // 100 XP reward
    expect(useChallengeStore.getState().totalXP).toBe(100);
  });

  test('claiming badge reward should add badge to badges array', () => {
    useChallengeStore.getState().claimReward('golden-gear'); // Golden Gear badge
    const badges = useChallengeStore.getState().badges;
    expect(badges.some(b => b.id === 'golden-gear')).toBe(true);
  });

  test('claiming badge should mark it as completed', () => {
    useChallengeStore.getState().claimReward('golden-gear');
    expect(useChallengeStore.getState().completedChallenges).toContain('golden-gear');
  });

  test('getChallengesByCategory should return correct challenges', () => {
    const creationChallenges = useChallengeStore.getState().getChallengesByCategory('creation');
    expect(creationChallenges.length).toBeGreaterThan(0);
    creationChallenges.forEach(c => {
      expect(c.category).toBe('creation');
    });
  });

  test('getChallengesByDifficulty should return correct challenges', () => {
    const beginnerChallenges = useChallengeStore.getState().getChallengesByDifficulty('beginner');
    expect(beginnerChallenges.length).toBeGreaterThan(0);
    beginnerChallenges.forEach(c => {
      expect(c.difficulty).toBe('beginner');
    });
  });

  test('getCompletedChallenges should return empty array initially', () => {
    const completed = useChallengeStore.getState().getCompletedChallenges();
    expect(completed).toEqual([]);
  });

  test('getAvailableChallenges should return all challenges initially', () => {
    const available = useChallengeStore.getState().getAvailableChallenges();
    expect(available.length).toBe(8);
  });

  test('isChallengeCompleted should return false for incomplete challenges', () => {
    expect(useChallengeStore.getState().isChallengeCompleted('first-machine')).toBe(false);
  });

  test('isChallengeCompleted should return true for completed challenges', () => {
    useChallengeStore.getState().claimReward('first-machine');
    expect(useChallengeStore.getState().isChallengeCompleted('first-machine')).toBe(true);
  });

  test('isRewardClaimed should return false for unclaimed rewards', () => {
    expect(useChallengeStore.getState().isRewardClaimed('first-machine')).toBe(false);
  });

  test('isRewardClaimed should return true for claimed rewards', () => {
    useChallengeStore.getState().claimReward('first-machine');
    expect(useChallengeStore.getState().isRewardClaimed('first-machine')).toBe(true);
  });

  test('updateProgress should increment progress correctly', () => {
    useChallengeStore.getState().updateProgress({ machinesCreated: 5 });
    expect(useChallengeStore.getState().challengeProgress.machinesCreated).toBe(5);
  });

  test('updateProgress should preserve existing progress', () => {
    useChallengeStore.getState().updateProgress({ machinesCreated: 3 });
    useChallengeStore.getState().updateProgress({ activations: 2 });
    expect(useChallengeStore.getState().challengeProgress.machinesCreated).toBe(3);
    expect(useChallengeStore.getState().challengeProgress.activations).toBe(2);
  });

  test('updateProgress should not decrease highestStability', () => {
    useChallengeStore.getState().updateProgress({ highestStability: 80 });
    useChallengeStore.getState().updateProgress({ highestStability: 70 });
    expect(useChallengeStore.getState().challengeProgress.highestStability).toBe(80);
  });

  test('updateProgress should update when new stability is higher', () => {
    useChallengeStore.getState().updateProgress({ highestStability: 80 });
    useChallengeStore.getState().updateProgress({ highestStability: 95 });
    expect(useChallengeStore.getState().challengeProgress.highestStability).toBe(95);
  });

  test('resetChallenges should clear all progress', () => {
    useChallengeStore.getState().claimReward('first-machine');
    useChallengeStore.getState().updateProgress({ machinesCreated: 5 });
    useChallengeStore.getState().resetChallenges();
    
    const state = useChallengeStore.getState();
    expect(state.completedChallenges.length).toBe(0);
    expect(state.claimedRewards.length).toBe(0);
    expect(state.totalXP).toBe(0);
    expect(state.badges).toEqual([]);
    expect(state.challengeProgress.machinesCreated).toBe(0);
  });

  test('getChallengeProgress should return correct progress for challenge', () => {
    useChallengeStore.getState().updateProgress({ machinesCreated: 3 });
    const progress = useChallengeStore.getState().getChallengeProgress('first-machine');
    expect(progress).toBe(3);
  });

  test('getChallengeProgress should return 0 for unknown challenge', () => {
    const progress = useChallengeStore.getState().getChallengeProgress('unknown');
    expect(progress).toBe(0);
  });

  test('cannot claim reward twice', () => {
    useChallengeStore.getState().claimReward('first-machine');
    const initialXP = useChallengeStore.getState().totalXP;
    useChallengeStore.getState().claimReward('first-machine');
    expect(useChallengeStore.getState().totalXP).toBe(initialXP);
  });

  test('cannot complete already completed challenge', () => {
    useChallengeStore.getState().claimReward('first-machine');
    expect(useChallengeStore.getState().completedChallenges).toContain('first-machine');
    useChallengeStore.getState().claimReward('first-machine');
    // Should still only be once
    const count = useChallengeStore.getState().completedChallenges.filter(id => id === 'first-machine').length;
    expect(count).toBe(1);
  });

  test('claiming recipe reward should mark challenge as completed', () => {
    useChallengeStore.getState().claimReward('energy-master');
    expect(useChallengeStore.getState().completedChallenges).toContain('energy-master');
  });

  test('claiming recipe reward should mark reward as claimed', () => {
    useChallengeStore.getState().claimReward('overload-specialist');
    expect(useChallengeStore.getState().claimedRewards).toContain('overload-specialist');
  });
});

describe('Challenge Reward Types', () => {
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

  test('XP rewards should increment totalXP', () => {
    useChallengeStore.getState().claimReward('first-machine'); // +100 XP
    expect(useChallengeStore.getState().totalXP).toBe(100);
    
    useChallengeStore.getState().claimReward('codex-entry'); // +50 XP
    expect(useChallengeStore.getState().totalXP).toBe(150);
  });

  test('Badge rewards should add to badges array', () => {
    useChallengeStore.getState().claimReward('golden-gear');
    
    expect(useChallengeStore.getState().badges.length).toBe(1);
    expect(useChallengeStore.getState().badges[0].id).toBe('golden-gear');
    expect(useChallengeStore.getState().badges[0].displayName).toBe('Golden Gear Badge');
  });

  test('Badge rewards should have earnedAt timestamp', () => {
    const beforeTime = Date.now();
    useChallengeStore.getState().claimReward('golden-gear');
    const afterTime = Date.now();
    
    const badges = useChallengeStore.getState().badges;
    expect(badges.length).toBe(1);
    const badge = badges[0];
    expect(badge.earnedAt).toBeGreaterThanOrEqual(beforeTime);
    expect(badge.earnedAt).toBeLessThanOrEqual(afterTime);
  });
});
