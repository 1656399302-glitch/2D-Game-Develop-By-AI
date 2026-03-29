/**
 * Challenge Extensions Tests
 * 
 * Tests for the expanded challenge system (16 challenges).
 * Covers: challenge definitions, categories, difficulty distribution, and uniqueness.
 */

import { describe, it, expect } from 'vitest';
import {
  CHALLENGE_DEFINITIONS,
  getChallengeById,
  getChallengesByCategory,
  getChallengesByDifficulty,
  getChallengeCountByCategory,
  getChallengeDifficultyColor,
  getChallengeDifficultyLabel,
  getChallengeCategoryLabel,
  getChallengeCategoryIcon,
} from '../data/challenges';
import { ChallengeCategory, ChallengeDifficulty } from '../data/challenges';

describe('Challenge System - 16 Challenge Definitions', () => {
  describe('Total Challenge Count', () => {
    it('should have exactly 16 challenges', () => {
      expect(CHALLENGE_DEFINITIONS.length).toBe(16);
    });

    it('should have unique IDs for all challenges', () => {
      const ids = CHALLENGE_DEFINITIONS.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Category Distribution', () => {
    it('should have exactly 5 Creation challenges', () => {
      const creation = CHALLENGE_DEFINITIONS.filter(c => c.category === 'creation');
      expect(creation.length).toBe(5);
    });

    it('should have exactly 3 Collection challenges', () => {
      const collection = CHALLENGE_DEFINITIONS.filter(c => c.category === 'collection');
      expect(collection.length).toBe(3);
    });

    it('should have exactly 4 Activation challenges', () => {
      const activation = CHALLENGE_DEFINITIONS.filter(c => c.category === 'activation');
      expect(activation.length).toBe(4);
    });

    it('should have exactly 4 Mastery challenges', () => {
      const mastery = CHALLENGE_DEFINITIONS.filter(c => c.category === 'mastery');
      expect(mastery.length).toBe(4);
    });

    it('should sum to 16 challenges across all categories', () => {
      const count = getChallengeCountByCategory();
      const total = count.creation + count.collection + count.activation + count.mastery;
      expect(total).toBe(16);
    });
  });

  describe('Difficulty Distribution', () => {
    it('should have exactly 4 Beginner challenges', () => {
      const beginner = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'beginner');
      expect(beginner.length).toBe(4);
    });

    it('should have exactly 5 Intermediate challenges', () => {
      const intermediate = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'intermediate');
      expect(intermediate.length).toBe(5);
    });

    it('should have exactly 7 Advanced challenges', () => {
      const advanced = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'advanced');
      expect(advanced.length).toBe(7);
    });

    it('should not have any Master difficulty challenges', () => {
      const master = CHALLENGE_DEFINITIONS.filter(c => c.difficulty === 'master');
      expect(master.length).toBe(0);
    });
  });

  describe('Challenge Structure', () => {
    it('should have valid id for each challenge', () => {
      CHALLENGE_DEFINITIONS.forEach(challenge => {
        expect(challenge.id).toBeDefined();
        expect(typeof challenge.id).toBe('string');
        expect(challenge.id.length).toBeGreaterThan(0);
      });
    });

    it('should have valid title for each challenge', () => {
      CHALLENGE_DEFINITIONS.forEach(challenge => {
        expect(challenge.title).toBeDefined();
        expect(typeof challenge.title).toBe('string');
        expect(challenge.title.length).toBeGreaterThan(0);
      });
    });

    it('should have valid description for each challenge', () => {
      CHALLENGE_DEFINITIONS.forEach(challenge => {
        expect(challenge.description).toBeDefined();
        expect(typeof challenge.description).toBe('string');
        expect(challenge.description.length).toBeGreaterThan(0);
      });
    });

    it('should have valid category for each challenge', () => {
      const validCategories: ChallengeCategory[] = ['creation', 'collection', 'activation', 'mastery'];
      CHALLENGE_DEFINITIONS.forEach(challenge => {
        expect(validCategories.includes(challenge.category)).toBe(true);
      });
    });

    it('should have valid difficulty for each challenge', () => {
      const validDifficulties: ChallengeDifficulty[] = ['beginner', 'intermediate', 'advanced'];
      CHALLENGE_DEFINITIONS.forEach(challenge => {
        expect(validDifficulties.includes(challenge.difficulty)).toBe(true);
      });
    });

    it('should have positive target for each challenge', () => {
      CHALLENGE_DEFINITIONS.forEach(challenge => {
        expect(challenge.target).toBeGreaterThan(0);
      });
    });

    it('should have valid reward for each challenge', () => {
      CHALLENGE_DEFINITIONS.forEach(challenge => {
        expect(challenge.reward).toBeDefined();
        expect(challenge.reward.type).toBeDefined();
        expect(['xp', 'recipe', 'badge'].includes(challenge.reward.type)).toBe(true);
        expect(challenge.reward.displayName).toBeDefined();
        expect(challenge.reward.description).toBeDefined();
      });
    });
  });

  describe('Challenge ID Verification', () => {
    const requiredIds = [
      'first-machine',
      'codex-entry',
      'arcane-artist',
      'connection-king',
      'golden-gear',
      'stability-master',
      'rare-collector',
      'void-initiate',
      'overload-specialist',
      'efficiency-expert',
      'inferno-master',
      'stellar-harmony',
      'legendary-forge',
      'activation-king',
      'speed-demon',
      'master-architect',
    ];

    requiredIds.forEach(id => {
      it(`should have challenge with id: ${id}`, () => {
        const challenge = CHALLENGE_DEFINITIONS.find(c => c.id === id);
        expect(challenge).toBeDefined();
      });
    });
  });

  describe('getChallengeById', () => {
    it('should return challenge for valid ID', () => {
      const challenge = getChallengeById('first-machine');
      expect(challenge).toBeDefined();
      expect(challenge?.id).toBe('first-machine');
    });

    it('should return undefined for invalid ID', () => {
      const challenge = getChallengeById('invalid-id');
      expect(challenge).toBeUndefined();
    });
  });

  describe('getChallengesByCategory', () => {
    it('should return only creation challenges', () => {
      const challenges = getChallengesByCategory('creation');
      challenges.forEach(c => {
        expect(c.category).toBe('creation');
      });
    });

    it('should return only collection challenges', () => {
      const challenges = getChallengesByCategory('collection');
      challenges.forEach(c => {
        expect(c.category).toBe('collection');
      });
    });

    it('should return only activation challenges', () => {
      const challenges = getChallengesByCategory('activation');
      challenges.forEach(c => {
        expect(c.category).toBe('activation');
      });
    });

    it('should return only mastery challenges', () => {
      const challenges = getChallengesByCategory('mastery');
      challenges.forEach(c => {
        expect(c.category).toBe('mastery');
      });
    });
  });

  describe('getChallengesByDifficulty', () => {
    it('should return only beginner challenges', () => {
      const challenges = getChallengesByDifficulty('beginner');
      challenges.forEach(c => {
        expect(c.difficulty).toBe('beginner');
      });
    });

    it('should return only intermediate challenges', () => {
      const challenges = getChallengesByDifficulty('intermediate');
      challenges.forEach(c => {
        expect(c.difficulty).toBe('intermediate');
      });
    });

    it('should return only advanced challenges', () => {
      const challenges = getChallengesByDifficulty('advanced');
      challenges.forEach(c => {
        expect(c.difficulty).toBe('advanced');
      });
    });
  });

  describe('Display Functions', () => {
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

    it('getChallengeCategoryIcon should return emoji icons', () => {
      expect(getChallengeCategoryIcon('creation')).toBe('🔨');
      expect(getChallengeCategoryIcon('collection')).toBe('📚');
      expect(getChallengeCategoryIcon('activation')).toBe('⚡');
      expect(getChallengeCategoryIcon('mastery')).toBe('🎯');
    });
  });
});
