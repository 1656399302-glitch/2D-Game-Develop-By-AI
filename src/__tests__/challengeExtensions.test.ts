import { describe, it, expect } from 'vitest';
import {
  CHALLENGE_DEFINITIONS,
  getChallengeCountByCategory,
  getChallengeById,
  getChallengesByCategory,
  getTechMasteryChallenges,
} from '../data/challenges';

describe('Challenge System - 20 Challenge Definitions', () => {
  // Updated per Round 51: 20 challenges
  describe('Total Challenge Count', () => {
    it('should have exactly 20 challenges', () => {
      expect(CHALLENGE_DEFINITIONS.length).toBe(20);
    });

    it('each challenge should have unique id', () => {
      const ids = CHALLENGE_DEFINITIONS.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(20);
    });
  });

  // Updated: 6 Beginner, 7 Intermediate, 7 Advanced
  describe('Difficulty Distribution', () => {
    it('should have exactly 6 Beginner challenges', () => {
      const beginnerChallenges = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'beginner');
      expect(beginnerChallenges.length).toBe(6);
    });

    it('should have exactly 7 Intermediate challenges', () => {
      const intermediateChallenges = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'intermediate');
      expect(intermediateChallenges.length).toBe(7);
    });

    it('should have exactly 7 Advanced challenges', () => {
      const advancedChallenges = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'advanced');
      expect(advancedChallenges.length).toBe(7);
    });

    it('total difficulty count should equal total challenges', () => {
      const beginner = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'beginner').length;
      const intermediate = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'intermediate').length;
      const advanced = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'advanced').length;
      expect(beginner + intermediate + advanced).toBe(20);
    });
  });

  // Updated per Round 51: includes tech_mastery
  describe('Category Distribution', () => {
    it('should have exactly 4 Creation challenges', () => {
      const creationChallenges = CHALLENGE_DEFINITIONS.filter(c => c.category === 'creation');
      expect(creationChallenges.length).toBe(4);
    });

    it('should have exactly 3 Collection challenges', () => {
      const collectionChallenges = CHALLENGE_DEFINITIONS.filter(c => c.category === 'collection');
      expect(collectionChallenges.length).toBe(3);
    });

    it('should have exactly 4 Activation challenges', () => {
      const activationChallenges = CHALLENGE_DEFINITIONS.filter(c => c.category === 'activation');
      expect(activationChallenges.length).toBe(4);
    });

    it('should have exactly 5 Mastery challenges', () => {
      const masteryChallenges = CHALLENGE_DEFINITIONS.filter(c => c.category === 'mastery');
      expect(masteryChallenges.length).toBe(5);
    });

    // New per Round 51
    it('should have exactly 4 Tech Mastery challenges', () => {
      const techMasteryChallenges = CHALLENGE_DEFINITIONS.filter(c => c.category === 'tech_mastery');
      expect(techMasteryChallenges.length).toBe(4);
    });

    it('total category count should equal total challenges', () => {
      const counts = getChallengeCountByCategory();
      const total = counts.creation + counts.collection + counts.activation + counts.mastery + counts.tech_mastery;
      expect(total).toBe(20);
    });
  });

  // Updated per Round 51: includes reputation reward type
  describe('Reward Type Distribution', () => {
    it('should have valid reward types', () => {
      CHALLENGE_DEFINITIONS.forEach(challenge => {
        expect(['xp', 'recipe', 'badge', 'reputation']).toContain(challenge.reward.type);
      });
    });

    it('should have exactly 4 reputation reward (tech mastery T1)', () => {
      const reputationRewards = CHALLENGE_DEFINITIONS.filter(c => c.reward.type === 'reputation');
      expect(reputationRewards.length).toBe(4); // All tech mastery challenges have reputation rewards
    });
  });

  describe('Challenge getChallengeById', () => {
    it('should return challenge by id', () => {
      const challenge = getChallengeById('first-machine');
      expect(challenge).toBeDefined();
      expect(challenge?.title).toBe('初代锻造');
    });

    it('should return undefined for invalid id', () => {
      const challenge = getChallengeById('invalid-challenge');
      expect(challenge).toBeUndefined();
    });

    it('should return tech mastery challenges by id', () => {
      const challenge = getChallengeById('tech-mastery-void-t1');
      expect(challenge).toBeDefined();
      expect(challenge?.category).toBe('tech_mastery');
      expect(challenge?.requiresTechTier).toBe(1);
    });
  });

  describe('Challenge getChallengesByCategory', () => {
    it('should return challenges by category', () => {
      const challenges = getChallengesByCategory('creation');
      expect(challenges.length).toBe(4);
      challenges.forEach(c => {
        expect(c.category).toBe('creation');
      });
    });

    it('should return tech mastery challenges', () => {
      const challenges = getChallengesByCategory('tech_mastery');
      expect(challenges.length).toBe(4);
      challenges.forEach(c => {
        expect(c.category).toBe('tech_mastery');
      });
    });
  });

  describe('Tech Mastery Challenges', () => {
    it('should have 4 tech mastery challenges', () => {
      const techChallenges = getTechMasteryChallenges();
      expect(techChallenges.length).toBe(4);
    });

    it('tech mastery challenges should have requiresTechTier', () => {
      const techChallenges = getTechMasteryChallenges();
      techChallenges.forEach(c => {
        expect(c.requiresTechTier).toBeDefined();
        expect(c.requiresTechTier).toBeGreaterThanOrEqual(1);
        expect(c.requiresTechTier).toBeLessThanOrEqual(3);
      });
    });

    it('tech mastery challenges should have baseReputation', () => {
      const techChallenges = getTechMasteryChallenges();
      techChallenges.forEach(c => {
        expect(c.baseReputation).toBeDefined();
        expect(c.baseReputation).toBeGreaterThan(0);
      });
    });

    it('tech mastery challenges should have reputation reward type', () => {
      const techChallenges = getTechMasteryChallenges();
      techChallenges.forEach(c => {
        expect(c.reward.type).toBe('reputation');
      });
    });
  });

  describe('getChallengeCountByCategory', () => {
    it('should return correct counts for all categories', () => {
      const counts = getChallengeCountByCategory();
      expect(counts.creation).toBe(4);
      expect(counts.collection).toBe(3);
      expect(counts.activation).toBe(4);
      expect(counts.mastery).toBe(5);
      expect(counts.tech_mastery).toBe(4);
    });

    it('total should be 20', () => {
      const counts = getChallengeCountByCategory();
      const total = counts.creation + counts.collection + counts.activation + counts.mastery + counts.tech_mastery;
      expect(total).toBe(20);
    });
  });
});
