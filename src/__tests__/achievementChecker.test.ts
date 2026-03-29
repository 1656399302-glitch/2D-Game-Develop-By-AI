import { describe, it, expect } from 'vitest';
import { 
  checkAchievements, 
  checkAchievementsWithCallback,
  getAllAchievementsWithStatus,
  getAchievementById,
  getTotalAchievementCount,
  getEarnedAchievementCount,
  getAchievementProgress
} from '../utils/achievementChecker';
import { UserStats } from '../types/factions';

describe('achievementChecker', () => {
  const createStats = (overrides: Partial<UserStats>): UserStats => ({
    machinesCreated: 0,
    activations: 0,
    errors: 0,
    playtimeMinutes: 0,
    factionCounts: { void: 0, inferno: 0, storm: 0, stellar: 0 },
    codexEntries: 0,
    ...overrides,
  });
  
  describe('checkAchievements', () => {
    it('returns first-forge when machinesCreated >= 1', () => {
      const stats = createStats({ machinesCreated: 1 });
      const earned = new Set<string>();
      
      const result = checkAchievements(stats, earned);
      
      expect(result).toContain('first-forge');
    });
    
    it('does not return first-forge when already earned', () => {
      const stats = createStats({ machinesCreated: 1 });
      const earned = new Set(['first-forge']);
      
      const result = checkAchievements(stats, earned);
      
      expect(result).not.toContain('first-forge');
    });
    
    it('returns energy-master when machinesCreated >= 10', () => {
      const stats = createStats({ machinesCreated: 10 });
      const earned = new Set();
      
      const result = checkAchievements(stats, earned);
      
      expect(result).toContain('energy-master');
    });
    
    it('returns both first-forge and energy-master when machinesCreated >= 10', () => {
      const stats = createStats({ machinesCreated: 10 });
      const earned = new Set();
      
      const result = checkAchievements(stats, earned);
      
      expect(result).toContain('first-forge');
      expect(result).toContain('energy-master');
    });
    
    it('returns void-conqueror when factionCounts.void >= 5', () => {
      const stats = createStats({ factionCounts: { void: 5, inferno: 0, storm: 0, stellar: 0 } });
      const earned = new Set();
      
      const result = checkAchievements(stats, earned);
      
      expect(result).toContain('void-conqueror');
    });
    
    it('returns perfect-activation when activations >= 1 and errors === 0', () => {
      const stats = createStats({ activations: 1, errors: 0 });
      const earned = new Set();
      
      const result = checkAchievements(stats, earned);
      
      expect(result).toContain('perfect-activation');
    });
    
    it('does not return perfect-activation when errors > 0', () => {
      const stats = createStats({ activations: 1, errors: 1 });
      const earned = new Set();
      
      const result = checkAchievements(stats, earned);
      
      expect(result).not.toContain('perfect-activation');
    });
    
    it('returns codex-collector when codexEntries >= 10', () => {
      const stats = createStats({ codexEntries: 10 });
      const earned = new Set();
      
      const result = checkAchievements(stats, earned);
      
      expect(result).toContain('codex-collector');
    });
    
    it('returns empty array when no achievements are met', () => {
      const stats = createStats({ machinesCreated: 0 });
      const earned = new Set();
      
      const result = checkAchievements(stats, earned);
      
      expect(result).toEqual([]);
    });
  });
  
  describe('checkAchievementsWithCallback', () => {
    it('invokes callback for newly earned achievements', () => {
      const stats = createStats({ machinesCreated: 1 });
      const earned = new Set<string>();
      const callbackResults: string[] = [];
      
      const result = checkAchievementsWithCallback(stats, earned, (achievement) => {
        callbackResults.push(achievement.id);
      });
      
      expect(result).toContain('first-forge');
      expect(callbackResults).toContain('first-forge');
    });
    
    it('does not invoke callback for already earned achievements', () => {
      const stats = createStats({ machinesCreated: 1 });
      const earned = new Set(['first-forge']);
      const callbackResults: string[] = [];
      
      const result = checkAchievementsWithCallback(stats, earned, (achievement) => {
        callbackResults.push(achievement.id);
      });
      
      expect(result).not.toContain('first-forge');
      expect(callbackResults).not.toContain('first-forge');
    });
  });
  
  describe('getAllAchievementsWithStatus', () => {
    it('marks earned achievements correctly', () => {
      const earned = new Set(['first-forge']);
      
      const achievements = getAllAchievementsWithStatus(earned);
      
      const firstForge = achievements.find(a => a.id === 'first-forge');
      expect(firstForge?.earned).toBe(true);
    });
    
    it('marks unearned achievements correctly', () => {
      const earned = new Set(['first-forge']);
      
      const achievements = getAllAchievementsWithStatus(earned);
      
      const energyMaster = achievements.find(a => a.id === 'energy-master');
      expect(energyMaster?.earned).toBe(false);
    });
  });
  
  describe('getAchievementById', () => {
    it('returns achievement for valid id', () => {
      const achievement = getAchievementById('first-forge');
      
      expect(achievement).not.toBeNull();
      expect(achievement?.name).toBe('First Forge');
    });
    
    it('returns null for invalid id', () => {
      const achievement = getAchievementById('invalid-id');
      
      expect(achievement).toBeNull();
    });
  });
  
  describe('getTotalAchievementCount', () => {
    it('returns correct total count', () => {
      const count = getTotalAchievementCount();
      
      expect(count).toBe(5);
    });
  });
  
  describe('getEarnedAchievementCount', () => {
    it('returns correct earned count', () => {
      const earned = new Set(['first-forge', 'energy-master']);
      
      const count = getEarnedAchievementCount(earned);
      
      expect(count).toBe(2);
    });
    
    it('returns 0 for empty set', () => {
      const earned = new Set<string>();
      
      const count = getEarnedAchievementCount(earned);
      
      expect(count).toBe(0);
    });
  });
  
  describe('getAchievementProgress', () => {
    it('returns 0 for no achievements', () => {
      const earned = new Set<string>();
      
      const progress = getAchievementProgress(earned);
      
      expect(progress).toBe(0);
    });
    
    it('returns 20 for 1 of 5 achievements', () => {
      const earned = new Set(['first-forge']);
      
      const progress = getAchievementProgress(earned);
      
      expect(progress).toBe(20);
    });
    
    it('returns 100 for all achievements', () => {
      const earned = new Set(['first-forge', 'energy-master', 'void-conqueror', 'perfect-activation', 'codex-collector']);
      
      const progress = getAchievementProgress(earned);
      
      expect(progress).toBe(100);
    });
  });
});
