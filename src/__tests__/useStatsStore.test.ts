import { describe, it, expect, beforeEach } from 'vitest';
import { useStatsStore } from '../store/useStatsStore';

describe('useStatsStore', () => {
  beforeEach(() => {
    // Reset store state
    useStatsStore.setState({
      machinesCreated: 0,
      activations: 0,
      errors: 0,
      playtimeMinutes: 0,
      factionCounts: { void: 0, inferno: 0, storm: 0, stellar: 0 },
      codexEntries: 0,
      earnedAchievements: [],
    });
  });
  
  describe('machines created', () => {
    it('starts at zero', () => {
      const state = useStatsStore.getState();
      
      expect(state.machinesCreated).toBe(0);
    });
    
    it('increments machines created', () => {
      const store = useStatsStore.getState();
      
      store.incrementMachinesCreated();
      
      expect(useStatsStore.getState().machinesCreated).toBe(1);
    });
    
    it('increments multiple times', () => {
      const store = useStatsStore.getState();
      
      store.incrementMachinesCreated();
      store.incrementMachinesCreated();
      store.incrementMachinesCreated();
      
      expect(useStatsStore.getState().machinesCreated).toBe(3);
    });
  });
  
  describe('activations', () => {
    it('starts at zero', () => {
      const state = useStatsStore.getState();
      
      expect(state.activations).toBe(0);
    });
    
    it('increments activations', () => {
      const store = useStatsStore.getState();
      
      store.incrementActivations();
      
      expect(useStatsStore.getState().activations).toBe(1);
    });
  });
  
  describe('errors', () => {
    it('starts at zero', () => {
      const state = useStatsStore.getState();
      
      expect(state.errors).toBe(0);
    });
    
    it('increments errors', () => {
      const store = useStatsStore.getState();
      
      store.incrementErrors();
      
      expect(useStatsStore.getState().errors).toBe(1);
    });
  });
  
  describe('playtime', () => {
    it('starts at zero', () => {
      const state = useStatsStore.getState();
      
      expect(state.playtimeMinutes).toBe(0);
    });
    
    it('adds playtime', () => {
      const store = useStatsStore.getState();
      
      store.addPlaytime(30);
      
      expect(useStatsStore.getState().playtimeMinutes).toBe(30);
    });
    
    it('accumulates playtime', () => {
      const store = useStatsStore.getState();
      
      store.addPlaytime(30);
      store.addPlaytime(45);
      
      expect(useStatsStore.getState().playtimeMinutes).toBe(75);
    });
  });
  
  describe('faction counts', () => {
    it('starts with zero for all factions', () => {
      const state = useStatsStore.getState();
      
      expect(state.factionCounts.void).toBe(0);
      expect(state.factionCounts.inferno).toBe(0);
      expect(state.factionCounts.storm).toBe(0);
      expect(state.factionCounts.stellar).toBe(0);
    });
    
    it('updates faction count', () => {
      const store = useStatsStore.getState();
      
      store.updateFactionCount('void', 5);
      
      expect(useStatsStore.getState().factionCounts.void).toBe(5);
    });
  });
  
  describe('codex entries', () => {
    it('starts at zero', () => {
      const state = useStatsStore.getState();
      
      expect(state.codexEntries).toBe(0);
    });
    
    it('increments codex entries', () => {
      const store = useStatsStore.getState();
      
      store.incrementCodexEntries();
      
      expect(useStatsStore.getState().codexEntries).toBe(1);
    });
  });
  
  describe('achievements', () => {
    it('starts with no earned achievements', () => {
      const state = useStatsStore.getState();
      
      expect(state.earnedAchievements).toEqual([]);
    });
    
    it('adds earned achievement', () => {
      const store = useStatsStore.getState();
      
      store.addEarnedAchievement('first-forge');
      
      expect(useStatsStore.getState().earnedAchievements).toContain('first-forge');
    });
    
    it('does not add duplicate achievements', () => {
      const store = useStatsStore.getState();
      
      store.addEarnedAchievement('first-forge');
      store.addEarnedAchievement('first-forge');
      
      const achievements = useStatsStore.getState().earnedAchievements;
      expect(achievements.filter(a => a === 'first-forge').length).toBe(1);
    });
    
    it('adds multiple achievements', () => {
      const store = useStatsStore.getState();
      
      store.addEarnedAchievement('first-forge');
      store.addEarnedAchievement('energy-master');
      
      const achievements = useStatsStore.getState().earnedAchievements;
      expect(achievements).toContain('first-forge');
      expect(achievements).toContain('energy-master');
    });
    
    it('checks if achievement is earned', () => {
      const store = useStatsStore.getState();
      
      store.addEarnedAchievement('first-forge');
      
      expect(store.hasEarnedAchievement('first-forge')).toBe(true);
      expect(store.hasEarnedAchievement('energy-master')).toBe(false);
    });
  });
  
  describe('getStats', () => {
    it('returns complete stats object', () => {
      const store = useStatsStore.getState();
      
      store.incrementMachinesCreated();
      store.incrementActivations();
      store.incrementCodexEntries();
      store.addPlaytime(60);
      
      const stats = store.getStats();
      
      expect(stats.machinesCreated).toBe(1);
      expect(stats.activations).toBe(1);
      expect(stats.codexEntries).toBe(1);
      expect(stats.playtimeMinutes).toBe(60);
    });
  });
  
  describe('resetStats', () => {
    it('resets all stats to defaults', () => {
      const store = useStatsStore.getState();
      
      store.incrementMachinesCreated();
      store.incrementActivations();
      store.incrementCodexEntries();
      store.addEarnedAchievement('first-forge');
      store.resetStats();
      
      const state = useStatsStore.getState();
      
      expect(state.machinesCreated).toBe(0);
      expect(state.activations).toBe(0);
      expect(state.codexEntries).toBe(0);
      expect(state.earnedAchievements).toEqual([]);
    });
  });
});
