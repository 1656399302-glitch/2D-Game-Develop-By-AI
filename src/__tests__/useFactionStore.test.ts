import { describe, it, expect, beforeEach } from 'vitest';
import { useFactionStore } from '../store/useFactionStore';

describe('useFactionStore', () => {
  beforeEach(() => {
    // Reset store state
    useFactionStore.setState({
      factionCounts: { void: 0, inferno: 0, storm: 0, stellar: 0 },
      techTreeUnlocks: {},
      selectedFaction: null,
    });
  });
  
  describe('faction counts', () => {
    it('starts with zero counts', () => {
      const state = useFactionStore.getState();
      
      expect(state.factionCounts.void).toBe(0);
      expect(state.factionCounts.inferno).toBe(0);
      expect(state.factionCounts.storm).toBe(0);
      expect(state.factionCounts.stellar).toBe(0);
    });
    
    it('increments void faction count', () => {
      const store = useFactionStore.getState();
      
      store.incrementFactionCount('void');
      
      expect(useFactionStore.getState().factionCounts.void).toBe(1);
    });
    
    it('increments inferno faction count', () => {
      const store = useFactionStore.getState();
      
      store.incrementFactionCount('inferno');
      
      expect(useFactionStore.getState().factionCounts.inferno).toBe(1);
    });
    
    it('increments storm faction count', () => {
      const store = useFactionStore.getState();
      
      store.incrementFactionCount('storm');
      
      expect(useFactionStore.getState().factionCounts.storm).toBe(1);
    });
    
    it('increments stellar faction count', () => {
      const store = useFactionStore.getState();
      
      store.incrementFactionCount('stellar');
      
      expect(useFactionStore.getState().factionCounts.stellar).toBe(1);
    });
    
    it('increments multiple times', () => {
      const store = useFactionStore.getState();
      
      store.incrementFactionCount('void');
      store.incrementFactionCount('void');
      store.incrementFactionCount('inferno');
      
      expect(useFactionStore.getState().factionCounts.void).toBe(2);
      expect(useFactionStore.getState().factionCounts.inferno).toBe(1);
    });
  });
  
  describe('selected faction', () => {
    it('starts with null selected faction', () => {
      const state = useFactionStore.getState();
      
      expect(state.selectedFaction).toBeNull();
    });
    
    it('sets selected faction', () => {
      const store = useFactionStore.getState();
      
      store.setSelectedFaction('void');
      
      expect(useFactionStore.getState().selectedFaction).toBe('void');
    });
    
    it('changes selected faction', () => {
      const store = useFactionStore.getState();
      
      store.setSelectedFaction('void');
      store.setSelectedFaction('inferno');
      
      expect(useFactionStore.getState().selectedFaction).toBe('inferno');
    });
    
    it('clears selected faction', () => {
      const store = useFactionStore.getState();
      
      store.setSelectedFaction('void');
      store.setSelectedFaction(null);
      
      expect(useFactionStore.getState().selectedFaction).toBeNull();
    });
  });
  
  describe('tech tree', () => {
    it('generates 12 nodes (4 factions x 3 tiers)', () => {
      const store = useFactionStore.getState();
      
      const nodes = store.getTechTreeNodes();
      
      expect(nodes.length).toBe(12);
    });
    
    it('returns nodes grouped by faction', () => {
      const store = useFactionStore.getState();
      
      const nodes = store.getTechTreeNodes();
      
      const voidNodes = nodes.filter(n => n.faction === 'void');
      expect(voidNodes.length).toBe(3);
      
      const infernoNodes = nodes.filter(n => n.faction === 'inferno');
      expect(infernoNodes.length).toBe(3);
    });
    
    it('starts with all nodes locked', () => {
      const store = useFactionStore.getState();
      
      const nodes = store.getTechTreeNodes();
      
      nodes.forEach(node => {
        expect(node.isUnlocked).toBe(false);
      });
    });
    
    it('unlocks tier 1 nodes when void count >= 3', () => {
      const store = useFactionStore.getState();
      
      // Increment void count to 3
      store.incrementFactionCount('void');
      store.incrementFactionCount('void');
      store.incrementFactionCount('void');
      
      const nodes = store.getTechTreeNodes();
      const voidTier1 = nodes.find(n => n.faction === 'void' && n.tier === 1);
      
      expect(voidTier1?.isUnlocked).toBe(true);
    });
    
    it('does not unlock tier 2 until count >= 7', () => {
      const store = useFactionStore.getState();
      
      // Increment void count to 5 (still not enough for tier 2)
      for (let i = 0; i < 5; i++) {
        store.incrementFactionCount('void');
      }
      
      const nodes = store.getTechTreeNodes();
      const voidTier2 = nodes.find(n => n.faction === 'void' && n.tier === 2);
      
      expect(voidTier2?.isUnlocked).toBe(false);
    });
    
    it('unlocks tier 2 nodes when void count >= 7', () => {
      const store = useFactionStore.getState();
      
      // Increment void count to 7
      for (let i = 0; i < 7; i++) {
        store.incrementFactionCount('void');
      }
      
      const nodes = store.getTechTreeNodes();
      const voidTier2 = nodes.find(n => n.faction === 'void' && n.tier === 2);
      
      expect(voidTier2?.isUnlocked).toBe(true);
    });
    
    it('unlocks tier 3 nodes when void count >= 15', () => {
      const store = useFactionStore.getState();
      
      // Increment void count to 15
      for (let i = 0; i < 15; i++) {
        store.incrementFactionCount('void');
      }
      
      const nodes = store.getTechTreeNodes();
      const voidTier3 = nodes.find(n => n.faction === 'void' && n.tier === 3);
      
      expect(voidTier3?.isUnlocked).toBe(true);
    });
    
    it('does not affect other factions when one faction is incremented', () => {
      const store = useFactionStore.getState();
      
      store.incrementFactionCount('void');
      
      const nodes = store.getTechTreeNodes();
      const infernoTier1 = nodes.find(n => n.faction === 'inferno' && n.tier === 1);
      
      expect(infernoTier1?.isUnlocked).toBe(false);
    });
  });
  
  describe('getFactionCount', () => {
    it('returns correct faction count', () => {
      const store = useFactionStore.getState();
      
      store.incrementFactionCount('void');
      store.incrementFactionCount('void');
      
      expect(store.getFactionCount('void')).toBe(2);
      expect(store.getFactionCount('inferno')).toBe(0);
    });
  });
  
  describe('resetFactionProgress', () => {
    it('resets all counts to zero', () => {
      const store = useFactionStore.getState();
      
      store.incrementFactionCount('void');
      store.incrementFactionCount('inferno');
      store.setSelectedFaction('void');
      store.resetFactionProgress();
      
      expect(useFactionStore.getState().factionCounts.void).toBe(0);
      expect(useFactionStore.getState().factionCounts.inferno).toBe(0);
      expect(useFactionStore.getState().selectedFaction).toBeNull();
    });
  });
});
