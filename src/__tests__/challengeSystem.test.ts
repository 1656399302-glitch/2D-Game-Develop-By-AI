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
  it('should have exactly 16 challenges', () => {
    expect(CHALLENGE_DEFINITIONS.length).toBe(16);
  });

  it('should have challenges in all difficulty tiers', () => {
    const difficulties = CHALLENGE_DEFINITIONS.map(c => c.difficulty);
    expect(difficulties).toContain('beginner');
    expect(difficulties).toContain('intermediate');
    expect(difficulties).toContain('advanced');
  });

  it('should have challenges in all categories', () => {
    const categories = CHALLENGE_DEFINITIONS.map(c => c.category);
    expect(categories).toContain('creation');
    expect(categories).toContain('collection');
    expect(categories).toContain('activation');
    expect(categories).toContain('mastery');
  });

  it('each challenge should have valid reward', () => {
    CHALLENGE_DEFINITIONS.forEach(challenge => {
      expect(challenge.reward).toBeDefined();
      expect(challenge.reward.type).toMatch(/^(xp|recipe|badge)$/);
    });
  });

  it('each challenge should have required fields', () => {
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

  it('each challenge should have unique id', () => {
    const ids = CHALLENGE_DEFINITIONS.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(16);
  });

  it('should have 4 Beginner challenges', () => {
    const beginnerCount = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'beginner').length;
    expect(beginnerCount).toBe(4);
  });

  it('should have 5 Intermediate challenges', () => {
    const intermediateCount = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'intermediate').length;
    expect(intermediateCount).toBe(5);
  });

  it('should have 7 Advanced challenges', () => {
    const advancedCount = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'advanced').length;
    expect(advancedCount).toBe(7);
  });

  // Updated per Round 19 contract: Creation=4, Mastery=5
  it('should have 4 Creation challenges', () => {
    const creationCount = CHALLENGE_DEFINITIONS.filter(c => c.category === 'creation').length;
    expect(creationCount).toBe(4);
  });

  it('should have 3 Collection challenges', () => {
    const collectionCount = CHALLENGE_DEFINITIONS.filter(c => c.category === 'collection').length;
    expect(collectionCount).toBe(3);
  });

  it('should have 4 Activation challenges', () => {
    const activationCount = CHALLENGE_DEFINITIONS.filter(c => c.category === 'activation').length;
    expect(activationCount).toBe(4);
  });

  it('should have 5 Mastery challenges', () => {
    const masteryCount = CHALLENGE_DEFINITIONS.filter(c => c.category === 'mastery').length;
    expect(masteryCount).toBe(5);
  });
});

describe('Challenge Helper Functions', () => {
  it('getChallengeById should return correct challenge', () => {
    const challenge = getChallengeById('first-machine');
    expect(challenge).toBeDefined();
    expect(challenge?.title).toBe('初代锻造');
  });

  it('getChallengeById should return undefined for invalid id', () => {
    const challenge = getChallengeById('invalid-id');
    expect(challenge).toBeUndefined();
  });

  // Updated per Round 19 contract: Creation=4, Mastery=5
  it('getChallengesByCategory should filter correctly', () => {
    const creationChallenges = getChallengesByCategory('creation');
    expect(creationChallenges.length).toBe(4);
    creationChallenges.forEach(c => {
      expect(c.category).toBe('creation');
    });
  });

  it('getChallengesByDifficulty should filter correctly', () => {
    const beginnerChallenges = getChallengesByDifficulty('beginner');
    expect(beginnerChallenges.length).toBe(4);
    beginnerChallenges.forEach(c => {
      expect(c.difficulty).toBe('beginner');
    });
  });

  it('getChallengeDifficultyColor should return valid colors', () => {
    expect(getChallengeDifficultyColor('beginner')).toBe('#22c55e');
    expect(getChallengeDifficultyColor('intermediate')).toBe('#3b82f6');
    expect(getChallengeDifficultyColor('advanced')).toBe('#a855f7');
  });

  it('getChallengeDifficultyLabel should return Chinese labels', () => {
    expect(getChallengeDifficultyLabel('beginner')).toBe('初级');
    expect(getChallengeDifficultyLabel('intermediate')).toBe('中级');
    expect(getChallengeDifficultyLabel('advanced')).toBe('高级');
  });

  it('getChallengeCategoryLabel should return Chinese labels', () => {
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

  it('should initialize with empty completedChallenges', () => {
    expect(useChallengeStore.getState().completedChallenges).toEqual([]);
    expect(useChallengeStore.getState().completedChallenges.length).toBe(0);
  });

  it('should initialize with empty badges', () => {
    expect(useChallengeStore.getState().badges).toEqual([]);
  });

  it('should initialize with 0 totalXP', () => {
    expect(useChallengeStore.getState().totalXP).toBe(0);
  });

  it('should initialize with default challengeProgress', () => {
    const progress = useChallengeStore.getState().challengeProgress;
    expect(progress.machinesCreated).toBe(0);
    expect(progress.machinesSaved).toBe(0);
    expect(progress.connectionsCreated).toBe(0);
    expect(progress.activations).toBe(0);
    expect(progress.overloadsTriggered).toBe(0);
    expect(progress.gearsCreated).toBe(0);
    expect(progress.highestStability).toBe(0);
  });

  it('checkChallengeCompletion should return false for incomplete challenges', () => {
    const result = useChallengeStore.getState().checkChallengeCompletion('machines_created', 1);
    expect(result).toBe(false);
  });

  it('checkChallengeCompletion should return true when target met', () => {
    useChallengeStore.getState().updateProgress({ machinesCreated: 1 });
    const result = useChallengeStore.getState().checkChallengeCompletion('machines_created', 1);
    expect(result).toBe(true);
  });

  it('checkChallengeCompletion should work with higher targets', () => {
    useChallengeStore.getState().updateProgress({ connectionsCreated: 10 });
    const result = useChallengeStore.getState().checkChallengeCompletion('connections_created', 5);
    expect(result).toBe(true);
  });

  it('claimReward should add challenge to completedChallenges for XP reward', () => {
    useChallengeStore.getState().claimReward('first-machine');
    expect(useChallengeStore.getState().completedChallenges).toContain('first-machine');
  });

  it('claiming XP reward should increment totalXP by correct amount', () => {
    useChallengeStore.getState().claimReward('first-machine'); // 100 XP reward
    expect(useChallengeStore.getState().totalXP).toBe(100);
  });

  it('claiming badge reward should add badge to badges array', () => {
    useChallengeStore.getState().claimReward('golden-gear'); // Golden Gear badge
    const badges = useChallengeStore.getState().badges;
    expect(badges.some(b => b.id === 'golden-gear')).toBe(true);
  });

  it('claiming badge should mark it as completed', () => {
    useChallengeStore.getState().claimReward('golden-gear');
    expect(useChallengeStore.getState().completedChallenges).toContain('golden-gear');
  });

  // Updated per Round 19 contract: Creation=4, Mastery=5
  it('getChallengesByCategory should return correct challenges', () => {
    const creationChallenges = useChallengeStore.getState().getChallengesByCategory('creation');
    expect(creationChallenges.length).toBe(4);
    creationChallenges.forEach(c => {
      expect(c.category).toBe('creation');
    });
  });

  it('getChallengesByDifficulty should return correct challenges', () => {
    const beginnerChallenges = useChallengeStore.getState().getChallengesByDifficulty('beginner');
    expect(beginnerChallenges.length).toBe(4);
    beginnerChallenges.forEach(c => {
      expect(c.difficulty).toBe('beginner');
    });
  });

  it('getCompletedChallenges should return empty array initially', () => {
    const completed = useChallengeStore.getState().getCompletedChallenges();
    expect(completed).toEqual([]);
  });

  it('getAvailableChallenges should return all challenges initially', () => {
    const available = useChallengeStore.getState().getAvailableChallenges();
    expect(available.length).toBe(16);
  });

  it('isChallengeCompleted should return false for incomplete challenges', () => {
    expect(useChallengeStore.getState().isChallengeCompleted('first-machine')).toBe(false);
  });

  it('isChallengeCompleted should return true for completed challenges', () => {
    useChallengeStore.getState().claimReward('first-machine');
    expect(useChallengeStore.getState().isChallengeCompleted('first-machine')).toBe(true);
  });

  it('isRewardClaimed should return false for unclaimed rewards', () => {
    expect(useChallengeStore.getState().isRewardClaimed('first-machine')).toBe(false);
  });

  it('isRewardClaimed should return true for claimed rewards', () => {
    useChallengeStore.getState().claimReward('first-machine');
    expect(useChallengeStore.getState().isRewardClaimed('first-machine')).toBe(true);
  });

  it('updateProgress should increment progress correctly', () => {
    useChallengeStore.getState().updateProgress({ machinesCreated: 5 });
    expect(useChallengeStore.getState().challengeProgress.machinesCreated).toBe(5);
  });

  it('updateProgress should preserve existing progress', () => {
    useChallengeStore.getState().updateProgress({ machinesCreated: 3 });
    useChallengeStore.getState().updateProgress({ activations: 2 });
    expect(useChallengeStore.getState().challengeProgress.machinesCreated).toBe(3);
    expect(useChallengeStore.getState().challengeProgress.activations).toBe(2);
  });

  it('updateProgress should not decrease highestStability', () => {
    useChallengeStore.getState().updateProgress({ highestStability: 80 });
    useChallengeStore.getState().updateProgress({ highestStability: 70 });
    expect(useChallengeStore.getState().challengeProgress.highestStability).toBe(80);
  });

  it('updateProgress should update when new stability is higher', () => {
    useChallengeStore.getState().updateProgress({ highestStability: 80 });
    useChallengeStore.getState().updateProgress({ highestStability: 95 });
    expect(useChallengeStore.getState().challengeProgress.highestStability).toBe(95);
  });

  it('resetChallenges should clear all progress', () => {
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

  it('getChallengeProgress should return correct progress for challenge', () => {
    useChallengeStore.getState().updateProgress({ machinesCreated: 3 });
    const progress = useChallengeStore.getState().getChallengeProgress('first-machine');
    expect(progress).toBe(3);
  });

  it('getChallengeProgress should return 0 for unknown challenge', () => {
    const progress = useChallengeStore.getState().getChallengeProgress('unknown');
    expect(progress).toBe(0);
  });

  it('cannot claim reward twice', () => {
    useChallengeStore.getState().claimReward('first-machine');
    const initialXP = useChallengeStore.getState().totalXP;
    useChallengeStore.getState().claimReward('first-machine');
    expect(useChallengeStore.getState().totalXP).toBe(initialXP);
  });

  it('cannot complete already completed challenge', () => {
    useChallengeStore.getState().claimReward('first-machine');
    expect(useChallengeStore.getState().completedChallenges).toContain('first-machine');
    useChallengeStore.getState().claimReward('first-machine');
    // Should still only be once
    const count = useChallengeStore.getState().completedChallenges.filter(id => id === 'first-machine').length;
    expect(count).toBe(1);
  });

  it('claiming recipe reward should mark challenge as completed', () => {
    useChallengeStore.getState().claimReward('stability-master');
    expect(useChallengeStore.getState().completedChallenges).toContain('stability-master');
  });

  it('claiming recipe reward should mark reward as claimed', () => {
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

  it('XP rewards should increment totalXP', () => {
    useChallengeStore.getState().claimReward('first-machine'); // +100 XP
    expect(useChallengeStore.getState().totalXP).toBe(100);
    
    useChallengeStore.getState().claimReward('codex-entry'); // +50 XP
    expect(useChallengeStore.getState().totalXP).toBe(150);
  });

  it('Badge rewards should add to badges array', () => {
    useChallengeStore.getState().claimReward('golden-gear');
    
    expect(useChallengeStore.getState().badges.length).toBe(1);
    expect(useChallengeStore.getState().badges[0].id).toBe('golden-gear');
    expect(useChallengeStore.getState().badges[0].displayName).toBe('黄金齿轮徽章');
  });

  it('Badge rewards should have earnedAt timestamp', () => {
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
