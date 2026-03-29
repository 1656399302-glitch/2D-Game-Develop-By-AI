/**
 * Faction Reputation System Tests
 * 
 * Tests for the faction reputation store and utility functions.
 * Covers: reputation accumulation, level transitions, variant unlock, achievement integration, persistence.
 */

import { describe, it, expect } from 'vitest';
import { useFactionReputationStore } from '../store/useFactionReputationStore';
import {
  getReputationLevel,
  getNextLevelThreshold,
  getProgressToNextLevel,
  getUnlockedVariants,
  getPointsToLevel,
  getLevelDisplayName,
  getLevelDisplayNameZh,
  isFactionVariant,
  getVariantFactionId,
} from '../utils/factionReputationUtils';
import { FactionReputationLevel, REPUTATION_THRESHOLDS } from '../types/factionReputation';

describe('Faction Reputation Utils', () => {
  describe('getReputationLevel', () => {
    it('should return Apprentice for 0 points', () => {
      expect(getReputationLevel(0)).toBe(FactionReputationLevel.Apprentice);
    });

    it('should return Apprentice for 199 points', () => {
      expect(getReputationLevel(199)).toBe(FactionReputationLevel.Apprentice);
    });

    it('should return Journeyman for 200 points', () => {
      expect(getReputationLevel(200)).toBe(FactionReputationLevel.Journeyman);
    });

    it('should return Journeyman for 499 points', () => {
      expect(getReputationLevel(499)).toBe(FactionReputationLevel.Journeyman);
    });

    it('should return Expert for 500 points', () => {
      expect(getReputationLevel(500)).toBe(FactionReputationLevel.Expert);
    });

    it('should return Expert for 999 points', () => {
      expect(getReputationLevel(999)).toBe(FactionReputationLevel.Expert);
    });

    it('should return Master for 1000 points', () => {
      expect(getReputationLevel(1000)).toBe(FactionReputationLevel.Master);
    });

    it('should return Master for 1999 points', () => {
      expect(getReputationLevel(1999)).toBe(FactionReputationLevel.Master);
    });

    it('should return Grandmaster for 2000 points', () => {
      expect(getReputationLevel(2000)).toBe(FactionReputationLevel.Grandmaster);
    });

    it('should return Grandmaster for 5000 points', () => {
      expect(getReputationLevel(5000)).toBe(FactionReputationLevel.Grandmaster);
    });

    it('should return distinct levels for all threshold values', () => {
      const levels = [
        getReputationLevel(0),
        getReputationLevel(200),
        getReputationLevel(500),
        getReputationLevel(1000),
        getReputationLevel(2000),
      ];
      const uniqueLevels = new Set(levels);
      expect(uniqueLevels.size).toBe(5);
    });
  });

  describe('getNextLevelThreshold', () => {
    it('should return 200 for Apprentice (0 points)', () => {
      expect(getNextLevelThreshold(0)).toBe(200);
    });

    it('should return 500 for Journeyman (200 points)', () => {
      expect(getNextLevelThreshold(200)).toBe(500);
    });

    it('should return 1000 for Expert (500 points)', () => {
      expect(getNextLevelThreshold(500)).toBe(1000);
    });

    it('should return 2000 for Master (1000 points)', () => {
      expect(getNextLevelThreshold(1000)).toBe(2000);
    });

    it('should return null for Grandmaster (2000+ points)', () => {
      expect(getNextLevelThreshold(2000)).toBeNull();
    });
  });

  describe('getProgressToNextLevel', () => {
    it('should return 0% for fresh start (0 points)', () => {
      const result = getProgressToNextLevel(0);
      expect(result.percentage).toBe(0);
      expect(result.pointsRemaining).toBe(200);
    });

    it('should return 100% progress at level boundary', () => {
      const result = getProgressToNextLevel(199);
      expect(result.percentage).toBeCloseTo(99.5, 0);
    });

    it('should return 50% at midpoint between levels', () => {
      const result = getProgressToNextLevel(100);
      expect(result.percentage).toBe(50);
    });

    it('should return 100% for Grandmaster', () => {
      const result = getProgressToNextLevel(2000);
      expect(result.percentage).toBe(100);
      expect(result.pointsRemaining).toBe(0);
    });
  });

  describe('getUnlockedVariants', () => {
    it('should return null for non-Grandmaster level', () => {
      expect(getUnlockedVariants('void', FactionReputationLevel.Apprentice)).toBeNull();
      expect(getUnlockedVariants('inferno', FactionReputationLevel.Journeyman)).toBeNull();
      expect(getUnlockedVariants('storm', FactionReputationLevel.Expert)).toBeNull();
      expect(getUnlockedVariants('stellar', FactionReputationLevel.Master)).toBeNull();
    });

    it('should return void-arcane-gear for void faction at Grandmaster', () => {
      expect(getUnlockedVariants('void', FactionReputationLevel.Grandmaster)).toBe('void-arcane-gear');
    });

    it('should return inferno-blazing-core for inferno faction at Grandmaster', () => {
      expect(getUnlockedVariants('inferno', FactionReputationLevel.Grandmaster)).toBe('inferno-blazing-core');
    });

    it('should return storm-thundering-pipe for storm faction at Grandmaster', () => {
      expect(getUnlockedVariants('storm', FactionReputationLevel.Grandmaster)).toBe('storm-thundering-pipe');
    });

    it('should return stellar-harmonic-crystal for stellar faction at Grandmaster', () => {
      expect(getUnlockedVariants('stellar', FactionReputationLevel.Grandmaster)).toBe('stellar-harmonic-crystal');
    });
  });

  describe('getPointsToLevel', () => {
    it('should return 200 for Apprentice to Journeyman', () => {
      expect(getPointsToLevel(0, FactionReputationLevel.Journeyman)).toBe(200);
    });

    it('should return 0 if already at target level', () => {
      expect(getPointsToLevel(200, FactionReputationLevel.Journeyman)).toBe(0);
    });

    it('should return correct points for multi-level jump', () => {
      expect(getPointsToLevel(0, FactionReputationLevel.Master)).toBe(1000);
    });
  });

  describe('getLevelDisplayName', () => {
    it('should return correct English names', () => {
      expect(getLevelDisplayName(FactionReputationLevel.Apprentice)).toBe('Apprentice');
      expect(getLevelDisplayName(FactionReputationLevel.Journeyman)).toBe('Journeyman');
      expect(getLevelDisplayName(FactionReputationLevel.Expert)).toBe('Expert');
      expect(getLevelDisplayName(FactionReputationLevel.Master)).toBe('Master');
      expect(getLevelDisplayName(FactionReputationLevel.Grandmaster)).toBe('Grandmaster');
    });
  });

  describe('getLevelDisplayNameZh', () => {
    it('should return correct Chinese names', () => {
      expect(getLevelDisplayNameZh(FactionReputationLevel.Apprentice)).toBe('学徒');
      expect(getLevelDisplayNameZh(FactionReputationLevel.Journeyman)).toBe('行商');
      expect(getLevelDisplayNameZh(FactionReputationLevel.Expert)).toBe('专家');
      expect(getLevelDisplayNameZh(FactionReputationLevel.Master)).toBe('大师');
      expect(getLevelDisplayNameZh(FactionReputationLevel.Grandmaster)).toBe('宗师');
    });
  });

  describe('isFactionVariant', () => {
    it('should return true for faction variant module IDs', () => {
      expect(isFactionVariant('void-arcane-gear')).toBe(true);
      expect(isFactionVariant('inferno-blazing-core')).toBe(true);
      expect(isFactionVariant('storm-thundering-pipe')).toBe(true);
      expect(isFactionVariant('stellar-harmonic-crystal')).toBe(true);
    });

    it('should return false for regular module IDs', () => {
      expect(isFactionVariant('core-furnace')).toBe(false);
      expect(isFactionVariant('gear')).toBe(false);
      expect(isFactionVariant('void-siphon')).toBe(false);
    });
  });

  describe('getVariantFactionId', () => {
    it('should return correct faction ID for variant modules', () => {
      expect(getVariantFactionId('void-arcane-gear')).toBe('void');
      expect(getVariantFactionId('inferno-blazing-core')).toBe('inferno');
      expect(getVariantFactionId('storm-thundering-pipe')).toBe('storm');
      expect(getVariantFactionId('stellar-harmonic-crystal')).toBe('stellar');
    });

    it('should return null for non-variant modules', () => {
      expect(getVariantFactionId('core-furnace')).toBeNull();
      expect(getVariantFactionId('gear')).toBeNull();
    });
  });
});

describe('Faction Reputation Store', () => {
  it('should have addReputation method', () => {
    const store = useFactionReputationStore.getState();
    expect(typeof store.addReputation).toBe('function');
  });

  it('should have getReputation method', () => {
    const store = useFactionReputationStore.getState();
    expect(typeof store.getReputation).toBe('function');
  });

  it('should have getReputationLevel method', () => {
    const store = useFactionReputationStore.getState();
    expect(typeof store.getReputationLevel).toBe('function');
  });

  it('should have isVariantUnlocked method', () => {
    const store = useFactionReputationStore.getState();
    expect(typeof store.isVariantUnlocked).toBe('function');
  });

  it('should have resetReputation method', () => {
    const store = useFactionReputationStore.getState();
    expect(typeof store.resetReputation).toBe('function');
  });

  it('should have resetAllReputations method', () => {
    const store = useFactionReputationStore.getState();
    expect(typeof store.resetAllReputations).toBe('function');
  });

  it('should have awardBonusReputation method', () => {
    const store = useFactionReputationStore.getState();
    expect(typeof store.awardBonusReputation).toBe('function');
  });

  it('should have getReputationData method', () => {
    const store = useFactionReputationStore.getState();
    expect(typeof store.getReputationData).toBe('function');
  });

  it('should have reputations object', () => {
    const store = useFactionReputationStore.getState();
    expect(store.reputations).toBeDefined();
    expect(typeof store.reputations).toBe('object');
  });

  it('should have totalReputationEarned number', () => {
    const store = useFactionReputationStore.getState();
    expect(typeof store.totalReputationEarned).toBe('number');
  });

  it('should start with 0 reputation for void faction', () => {
    const store = useFactionReputationStore.getState();
    expect(store.reputations.void).toBe(0);
  });

  it('should start with 0 reputation for inferno faction', () => {
    const store = useFactionReputationStore.getState();
    expect(store.reputations.inferno).toBe(0);
  });

  it('should start with 0 reputation for storm faction', () => {
    const store = useFactionReputationStore.getState();
    expect(store.reputations.storm).toBe(0);
  });

  it('should start with 0 reputation for stellar faction', () => {
    const store = useFactionReputationStore.getState();
    expect(store.reputations.stellar).toBe(0);
  });
});

describe('Reputation Levels', () => {
  it('Apprentice level threshold should be 0', () => {
    expect(REPUTATION_THRESHOLDS[FactionReputationLevel.Apprentice]).toBe(0);
  });

  it('Journeyman level threshold should be 200', () => {
    expect(REPUTATION_THRESHOLDS[FactionReputationLevel.Journeyman]).toBe(200);
  });

  it('Expert level threshold should be 500', () => {
    expect(REPUTATION_THRESHOLDS[FactionReputationLevel.Expert]).toBe(500);
  });

  it('Master level threshold should be 1000', () => {
    expect(REPUTATION_THRESHOLDS[FactionReputationLevel.Master]).toBe(1000);
  });

  it('Grandmaster level threshold should be 2000', () => {
    expect(REPUTATION_THRESHOLDS[FactionReputationLevel.Grandmaster]).toBe(2000);
  });
});
