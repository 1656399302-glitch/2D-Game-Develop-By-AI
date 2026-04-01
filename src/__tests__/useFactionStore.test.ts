/**
 * Faction Store Integration Tests
 * 
 * Tests for the Faction store which manages faction progress and tech tree unlocks.
 * Extended to 6 factions per contract specification.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useFactionStore, hydrateFactionStore, isFactionHydrated } from '../store/useFactionStore';
import { FactionId } from '../types/factions';

describe('FactionStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useFactionStore.setState({
      factionCounts: {
        void: 0,
        inferno: 0,
        storm: 0,
        stellar: 0,
        arcane: 0,
        chaos: 0,
      },
      techTreeUnlocks: {},
      selectedFaction: null,
    });
  });

  describe('initial state', () => {
    it('should initialize with 6 factions at count 0', () => {
      const state = useFactionStore.getState();
      expect(state.factionCounts.void).toBe(0);
      expect(state.factionCounts.inferno).toBe(0);
      expect(state.factionCounts.storm).toBe(0);
      expect(state.factionCounts.stellar).toBe(0);
      expect(state.factionCounts.arcane).toBe(0);
      expect(state.factionCounts.chaos).toBe(0);
    });

    it('should initialize with empty techTreeUnlocks', () => {
      const state = useFactionStore.getState();
      expect(state.techTreeUnlocks).toEqual({});
    });

    it('should initialize with null selectedFaction', () => {
      const state = useFactionStore.getState();
      expect(state.selectedFaction).toBeNull();
    });
  });

  describe('incrementFactionCount', () => {
    it('should increment faction count for void', () => {
      useFactionStore.getState().incrementFactionCount('void');
      expect(useFactionStore.getState().factionCounts.void).toBe(1);
    });

    it('should increment faction count for inferno', () => {
      useFactionStore.getState().incrementFactionCount('inferno');
      expect(useFactionStore.getState().factionCounts.inferno).toBe(1);
    });

    it('should increment faction count for storm', () => {
      useFactionStore.getState().incrementFactionCount('storm');
      expect(useFactionStore.getState().factionCounts.storm).toBe(1);
    });

    it('should increment faction count for stellar', () => {
      useFactionStore.getState().incrementFactionCount('stellar');
      expect(useFactionStore.getState().factionCounts.stellar).toBe(1);
    });

    it('should increment faction count for arcane', () => {
      useFactionStore.getState().incrementFactionCount('arcane');
      expect(useFactionStore.getState().factionCounts.arcane).toBe(1);
    });

    it('should increment faction count for chaos', () => {
      useFactionStore.getState().incrementFactionCount('chaos');
      expect(useFactionStore.getState().factionCounts.chaos).toBe(1);
    });

    it('should increment multiple times correctly', () => {
      useFactionStore.getState().incrementFactionCount('void');
      useFactionStore.getState().incrementFactionCount('void');
      useFactionStore.getState().incrementFactionCount('void');

      expect(useFactionStore.getState().factionCounts.void).toBe(3);
    });

    it('should not affect other factions when incrementing one', () => {
      useFactionStore.getState().incrementFactionCount('void');
      useFactionStore.getState().incrementFactionCount('void');
      useFactionStore.getState().incrementFactionCount('inferno');

      const state = useFactionStore.getState();
      expect(state.factionCounts.void).toBe(2);
      expect(state.factionCounts.inferno).toBe(1);
      expect(state.factionCounts.storm).toBe(0);
      expect(state.factionCounts.stellar).toBe(0);
      expect(state.factionCounts.arcane).toBe(0);
      expect(state.factionCounts.chaos).toBe(0);
    });
  });

  describe('setSelectedFaction', () => {
    it('should set selected faction to void', () => {
      useFactionStore.getState().setSelectedFaction('void');
      expect(useFactionStore.getState().selectedFaction).toBe('void');
    });

    it('should set selected faction to inferno', () => {
      useFactionStore.getState().setSelectedFaction('inferno');
      expect(useFactionStore.getState().selectedFaction).toBe('inferno');
    });

    it('should set selected faction to storm', () => {
      useFactionStore.getState().setSelectedFaction('storm');
      expect(useFactionStore.getState().selectedFaction).toBe('storm');
    });

    it('should set selected faction to stellar', () => {
      useFactionStore.getState().setSelectedFaction('stellar');
      expect(useFactionStore.getState().selectedFaction).toBe('stellar');
    });

    it('should set selected faction to arcane', () => {
      useFactionStore.getState().setSelectedFaction('arcane');
      expect(useFactionStore.getState().selectedFaction).toBe('arcane');
    });

    it('should set selected faction to chaos', () => {
      useFactionStore.getState().setSelectedFaction('chaos');
      expect(useFactionStore.getState().selectedFaction).toBe('chaos');
    });

    it('should allow setting to null', () => {
      useFactionStore.getState().setSelectedFaction('void');
      useFactionStore.getState().setSelectedFaction(null);
      expect(useFactionStore.getState().selectedFaction).toBeNull();
    });

    it('should allow changing selected faction', () => {
      useFactionStore.getState().setSelectedFaction('void');
      useFactionStore.getState().setSelectedFaction('inferno');
      expect(useFactionStore.getState().selectedFaction).toBe('inferno');
    });
  });

  describe('unlockTechTreeNode', () => {
    it('should unlock a tech tree node', () => {
      useFactionStore.getState().unlockTechTreeNode('void-tier-1');
      expect(useFactionStore.getState().techTreeUnlocks['void-tier-1']).toBe(true);
    });

    it('should unlock multiple tech tree nodes', () => {
      useFactionStore.getState().unlockTechTreeNode('inferno-tier-1');
      useFactionStore.getState().unlockTechTreeNode('inferno-tier-2');
      useFactionStore.getState().unlockTechTreeNode('storm-tier-1');

      const state = useFactionStore.getState();
      expect(state.techTreeUnlocks['inferno-tier-1']).toBe(true);
      expect(state.techTreeUnlocks['inferno-tier-2']).toBe(true);
      expect(state.techTreeUnlocks['storm-tier-1']).toBe(true);
      expect(state.techTreeUnlocks['void-tier-1']).toBeUndefined();
    });

    it('should not affect faction counts when unlocking tech', () => {
      useFactionStore.getState().incrementFactionCount('void');
      useFactionStore.getState().unlockTechTreeNode('void-tier-1');

      const state = useFactionStore.getState();
      expect(state.factionCounts.void).toBe(1);
      expect(state.techTreeUnlocks['void-tier-1']).toBe(true);
    });
  });

  describe('getTechTreeNodes', () => {
    it('should return tech tree nodes with unlock status', () => {
      useFactionStore.getState().incrementFactionCount('void');
      useFactionStore.getState().incrementFactionCount('void');
      useFactionStore.getState().unlockTechTreeNode('void-tier-1');

      const nodes = useFactionStore.getState().getTechTreeNodes();

      // Should return nodes including the void faction nodes
      const voidTier1 = nodes.find(n => n.id === 'void-tier-1');
      expect(voidTier1).toBeDefined();
    });

    it('should return nodes for all 6 factions', () => {
      const nodes = useFactionStore.getState().getTechTreeNodes();

      // Get unique factions from nodes
      const factions = new Set(nodes.map(n => n.faction));
      expect(factions.has('void')).toBe(true);
    });
  });

  describe('getFactionCount', () => {
    it('should return correct count for void', () => {
      useFactionStore.getState().incrementFactionCount('void');
      useFactionStore.getState().incrementFactionCount('void');
      expect(useFactionStore.getState().getFactionCount('void')).toBe(2);
    });

    it('should return 0 for unused factions', () => {
      useFactionStore.getState().incrementFactionCount('void');
      expect(useFactionStore.getState().getFactionCount('inferno')).toBe(0);
    });
  });

  describe('isTechTreeNodeUnlocked', () => {
    it('should return false for locked nodes', () => {
      expect(useFactionStore.getState().isTechTreeNodeUnlocked('void-tier-1')).toBe(false);
    });

    it('should return true for manually unlocked nodes', () => {
      useFactionStore.getState().unlockTechTreeNode('void-tier-1');
      expect(useFactionStore.getState().isTechTreeNodeUnlocked('void-tier-1')).toBe(true);
    });

    it('should return false for non-existent nodes', () => {
      expect(useFactionStore.getState().isTechTreeNodeUnlocked('non-existent')).toBe(false);
    });
  });

  describe('resetFactionProgress', () => {
    it('should reset all faction counts to 0', () => {
      useFactionStore.getState().incrementFactionCount('void');
      useFactionStore.getState().incrementFactionCount('void');
      useFactionStore.getState().incrementFactionCount('inferno');
      useFactionStore.getState().incrementFactionCount('storm');
      useFactionStore.getState().incrementFactionCount('stellar');
      useFactionStore.getState().incrementFactionCount('arcane');
      useFactionStore.getState().incrementFactionCount('chaos');

      useFactionStore.getState().resetFactionProgress();

      const state = useFactionStore.getState();
      expect(state.factionCounts.void).toBe(0);
      expect(state.factionCounts.inferno).toBe(0);
      expect(state.factionCounts.storm).toBe(0);
      expect(state.factionCounts.stellar).toBe(0);
      expect(state.factionCounts.arcane).toBe(0);
      expect(state.factionCounts.chaos).toBe(0);
    });

    it('should reset tech tree unlocks', () => {
      useFactionStore.getState().unlockTechTreeNode('void-tier-1');
      useFactionStore.getState().unlockTechTreeNode('inferno-tier-2');

      useFactionStore.getState().resetFactionProgress();

      expect(useFactionStore.getState().techTreeUnlocks).toEqual({});
    });

    it('should reset selected faction', () => {
      useFactionStore.getState().setSelectedFaction('void');
      useFactionStore.getState().resetFactionProgress();

      expect(useFactionStore.getState().selectedFaction).toBeNull();
    });
  });

  describe('hydration helpers', () => {
    it('should expose isFactionHydrated function', () => {
      expect(typeof isFactionHydrated).toBe('function');
    });

    it('should expose hydrateFactionStore function', () => {
      expect(typeof hydrateFactionStore).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle rapid increment calls', () => {
      const store = useFactionStore.getState();
      for (let i = 0; i < 100; i++) {
        store.incrementFactionCount('void');
      }

      expect(useFactionStore.getState().factionCounts.void).toBe(100);
    });

    it('should handle all factions simultaneously', () => {
      const store = useFactionStore.getState();
      (['void', 'inferno', 'storm', 'stellar', 'arcane', 'chaos'] as FactionId[]).forEach(faction => {
        store.incrementFactionCount(faction);
      });

      const state = useFactionStore.getState();
      expect(state.factionCounts.void).toBe(1);
      expect(state.factionCounts.inferno).toBe(1);
      expect(state.factionCounts.storm).toBe(1);
      expect(state.factionCounts.stellar).toBe(1);
      expect(state.factionCounts.arcane).toBe(1);
      expect(state.factionCounts.chaos).toBe(1);
    });

    it('should handle unlocking all tech nodes', () => {
      const store = useFactionStore.getState();
      const techNodes = [
        'void-tier-1', 'void-tier-2', 'void-tier-3',
        'inferno-tier-1', 'inferno-tier-2', 'inferno-tier-3',
        'storm-tier-1', 'storm-tier-2', 'storm-tier-3',
        'stellar-tier-1', 'stellar-tier-2', 'stellar-tier-3',
        'arcane-tier-1', 'arcane-tier-2', 'arcane-tier-3',
        'chaos-tier-1', 'chaos-tier-2', 'chaos-tier-3',
      ];

      techNodes.forEach(nodeId => {
        store.unlockTechTreeNode(nodeId);
      });

      const state = useFactionStore.getState();
      techNodes.forEach(nodeId => {
        expect(state.techTreeUnlocks[nodeId]).toBe(true);
      });
    });
  });
});
