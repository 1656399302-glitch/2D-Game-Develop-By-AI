/**
 * Tech Tree Store Tests
 * 
 * Unit tests for the circuit component tech tree store.
 * Tests initialization, unlock logic, prerequisite validation,
 * achievement integration, and localStorage persistence.
 * 
 * ROUND 136: Initial implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useTechTreeStore } from '../../store/useTechTreeStore';
import { TECH_TREE_NODES, TOTAL_TECH_TREE_NODES } from '../../data/techTreeNodes';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

// Replace global localStorage
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

/**
 * Reset the store to initial state
 */
function resetStore() {
  useTechTreeStore.setState({
    unlockedNodes: TECH_TREE_NODES.reduce((acc, node) => {
      acc[node.id] = false;
      return acc;
    }, {} as Record<string, boolean>),
    selectedNodeId: null,
  });
  localStorageMock.clear();
}

describe('TechTreeStore', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    resetStore();
  });

  describe('Initialization', () => {
    it('should initialize with all nodes defined', () => {
      const state = useTechTreeStore.getState();
      expect(state.nodes.length).toBe(TOTAL_TECH_TREE_NODES);
    });

    it('should have at least 10 nodes', () => {
      const state = useTechTreeStore.getState();
      expect(state.nodes.length).toBeGreaterThanOrEqual(10);
    });

    it('should have nodes across at least 3 categories', () => {
      const state = useTechTreeStore.getState();
      const categories = new Set(state.nodes.map(n => n.category));
      expect(categories.size).toBeGreaterThanOrEqual(3);
    });

    it('should have basic-gates category', () => {
      const state = useTechTreeStore.getState();
      const hasBasicGates = state.nodes.some(n => n.category === 'basic-gates');
      expect(hasBasicGates).toBe(true);
    });

    it('should have advanced-gates category', () => {
      const state = useTechTreeStore.getState();
      const hasAdvancedGates = state.nodes.some(n => n.category === 'advanced-gates');
      expect(hasAdvancedGates).toBe(true);
    });

    it('should have special-components category', () => {
      const state = useTechTreeStore.getState();
      const hasSpecial = state.nodes.some(n => n.category === 'special-components');
      expect(hasSpecial).toBe(true);
    });

    it('should initialize all nodes as locked', () => {
      const state = useTechTreeStore.getState();
      for (const node of state.nodes) {
        expect(state.unlockedNodes[node.id]).toBe(false);
      }
    });

    it('should have valid prerequisite references for all nodes', () => {
      const state = useTechTreeStore.getState();
      const nodeIds = new Set(state.nodes.map(n => n.id));
      
      for (const node of state.nodes) {
        for (const prereqId of node.prerequisites) {
          expect(nodeIds.has(prereqId)).toBe(true);
        }
      }
    });

    it('each node should have required fields', () => {
      const state = useTechTreeStore.getState();
      
      for (const node of state.nodes) {
        expect(node.id).toBeDefined();
        expect(typeof node.id).toBe('string');
        expect(node.name).toBeDefined();
        expect(typeof node.name).toBe('string');
        expect(node.description).toBeDefined();
        expect(typeof node.description).toBe('string');
        expect(node.category).toBeDefined();
        expect(node.prerequisites).toBeDefined();
        expect(Array.isArray(node.prerequisites)).toBe(true);
        expect(node.position).toBeDefined();
        expect(node.position.x).toBeDefined();
        expect(node.position.y).toBeDefined();
        expect(typeof node.position.x).toBe('number');
        expect(typeof node.position.y).toBe('number');
      }
    });
  });

  describe('Node Selection', () => {
    it('should start with no selected node', () => {
      const state = useTechTreeStore.getState();
      expect(state.selectedNodeId).toBeNull();
    });

    it('should select a node by ID', () => {
      const state = useTechTreeStore.getState();
      const firstNode = state.nodes[0];
      
      state.selectNode(firstNode.id);
      
      expect(useTechTreeStore.getState().selectedNodeId).toBe(firstNode.id);
    });

    it('should deselect node when selecting null', () => {
      const state = useTechTreeStore.getState();
      const firstNode = state.nodes[0];
      
      state.selectNode(firstNode.id);
      state.selectNode(null);
      
      expect(useTechTreeStore.getState().selectedNodeId).toBeNull();
    });
  });

  describe('Unlock Logic', () => {
    it('should unlock a node with no prerequisites', () => {
      const state = useTechTreeStore.getState();
      // Find a node with no prerequisites
      const noPrereqNode = state.nodes.find(n => n.prerequisites.length === 0);
      expect(noPrereqNode).toBeDefined();
      
      if (noPrereqNode) {
        state.unlockNode(noPrereqNode.id);
        expect(state.isNodeUnlocked(noPrereqNode.id)).toBe(true);
      }
    });

    it('should not unlock a node with unmet prerequisites', () => {
      const state = useTechTreeStore.getState();
      // Find a node with prerequisites
      const prereqNode = state.nodes.find(n => n.prerequisites.length > 0);
      expect(prereqNode).toBeDefined();
      
      if (prereqNode) {
        // Attempt to unlock without prerequisites
        state.unlockNode(prereqNode.id);
        expect(state.isNodeUnlocked(prereqNode.id)).toBe(false);
      }
    });

    it('should unlock a node when prerequisites are met', () => {
      const state = useTechTreeStore.getState();
      // Find a node with prerequisites
      const prereqNode = state.nodes.find(n => n.prerequisites.length > 0);
      expect(prereqNode).toBeDefined();
      
      if (prereqNode && prereqNode.prerequisites.length > 0) {
        // Unlock prerequisites first
        for (const prereqId of prereqNode.prerequisites) {
          state.unlockNode(prereqId);
        }
        
        // Now unlock the target node
        state.unlockNode(prereqNode.id);
        expect(state.isNodeUnlocked(prereqNode.id)).toBe(true);
      }
    });

    it('should lock a node', () => {
      const state = useTechTreeStore.getState();
      const firstNode = state.nodes[0];
      
      // Unlock first
      state.unlockNode(firstNode.id);
      expect(state.isNodeUnlocked(firstNode.id)).toBe(true);
      
      // Lock
      state.lockNode(firstNode.id);
      expect(state.isNodeUnlocked(firstNode.id)).toBe(false);
    });

    it('should track multiple unlocked nodes', () => {
      const state = useTechTreeStore.getState();
      const nodesToUnlock = state.nodes.slice(0, 3);
      
      for (const node of nodesToUnlock) {
        state.unlockNode(node.id);
      }
      
      const unlockedIds = state.getUnlockedNodeIds();
      expect(unlockedIds.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Prerequisite Validation', () => {
    it('canUnlock returns true for node with no prerequisites', () => {
      const state = useTechTreeStore.getState();
      const noPrereqNode = state.nodes.find(n => n.prerequisites.length === 0);
      expect(noPrereqNode).toBeDefined();
      
      if (noPrereqNode) {
        expect(state.canUnlock(noPrereqNode.id)).toBe(true);
      }
    });

    it('canUnlock returns false for node with unmet prerequisites', () => {
      const state = useTechTreeStore.getState();
      const prereqNode = state.nodes.find(n => n.prerequisites.length > 0);
      expect(prereqNode).toBeDefined();
      
      if (prereqNode) {
        expect(state.canUnlock(prereqNode.id)).toBe(false);
      }
    });

    it('canUnlock returns true when all prerequisites are unlocked', () => {
      const state = useTechTreeStore.getState();
      const prereqNode = state.nodes.find(n => n.prerequisites.length > 0);
      expect(prereqNode).toBeDefined();
      
      if (prereqNode && prereqNode.prerequisites.length > 0) {
        // Unlock all prerequisites
        for (const prereqId of prereqNode.prerequisites) {
          state.unlockNode(prereqId);
        }
        
        expect(state.canUnlock(prereqNode.id)).toBe(true);
      }
    });

    it('getUnmetPrerequisites returns empty for unlocked nodes', () => {
      const state = useTechTreeStore.getState();
      const noPrereqNode = state.nodes.find(n => n.prerequisites.length === 0);
      expect(noPrereqNode).toBeDefined();
      
      if (noPrereqNode) {
        state.unlockNode(noPrereqNode.id);
        expect(state.getUnmetPrerequisites(noPrereqNode.id)).toEqual([]);
      }
    });

    it('getUnmetPrerequisites returns unmet prerequisites', () => {
      const state = useTechTreeStore.getState();
      const prereqNode = state.nodes.find(n => n.prerequisites.length > 0);
      expect(prereqNode).toBeDefined();
      
      if (prereqNode) {
        const unmet = state.getUnmetPrerequisites(prereqNode.id);
        expect(unmet.length).toBeGreaterThan(0);
        expect(unmet).toEqual(expect.arrayContaining(prereqNode.prerequisites));
      }
    });
  });

  describe('Node Queries', () => {
    it('getNode returns correct node', () => {
      const state = useTechTreeStore.getState();
      const node = state.nodes[0];
      
      const found = state.getNode(node.id);
      expect(found).toEqual(node);
    });

    it('getNode returns undefined for invalid ID', () => {
      const state = useTechTreeStore.getState();
      const found = state.getNode('non-existent-id');
      expect(found).toBeUndefined();
    });

    it('getNodesByCategory returns nodes for valid category', () => {
      const state = useTechTreeStore.getState();
      const basicNodes = state.getNodesByCategory('basic-gates');
      expect(basicNodes.length).toBeGreaterThan(0);
      expect(basicNodes.every(n => n.category === 'basic-gates')).toBe(true);
    });

    it('getNodesByCategory returns empty for invalid category', () => {
      const state = useTechTreeStore.getState();
      const nodes = state.getNodesByCategory('invalid-category');
      expect(nodes.length).toBe(0);
    });

    it('getUnlockedNodeIds returns empty initially', () => {
      const state = useTechTreeStore.getState();
      const unlocked = state.getUnlockedNodeIds();
      expect(unlocked.length).toBe(0);
    });

    it('getUnlockedNodeIds returns correct count after unlocking', () => {
      const state = useTechTreeStore.getState();
      const nodesToUnlock = state.nodes.slice(0, 3);
      
      for (const node of nodesToUnlock) {
        state.unlockNode(node.id);
      }
      
      const unlocked = state.getUnlockedNodeIds();
      expect(unlocked.length).toBe(3);
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist unlock state to localStorage', () => {
      const state = useTechTreeStore.getState();
      const nodeToUnlock = state.nodes[0];
      
      state.unlockNode(nodeToUnlock.id);
      
      const stored = localStorageMock.getItem('tech-tree-progress');
      expect(stored).toBeDefined();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.nodes[nodeToUnlock.id]).toBe(true);
    });

    it('should restore unlock state from localStorage', () => {
      // Set up localStorage with unlocked node
      const nodeId = TECH_TREE_NODES[0].id;
      localStorageMock.setItem('tech-tree-progress', JSON.stringify({
        nodes: { [nodeId]: true },
        lastUpdated: Date.now(),
      }));
      
      // Re-initialize store (simulate page reload)
      useTechTreeStore.getState()._loadFromStorage();
      
      const state = useTechTreeStore.getState();
      expect(state.unlockedNodes[nodeId]).toBe(true);
    });

    it('should persist newly unlocked nodes to localStorage', () => {
      const state = useTechTreeStore.getState();
      const node0 = state.nodes[0];
      const node1 = state.nodes[1];
      
      // Unlock two nodes
      state.unlockNode(node0.id);
      state.unlockNode(node1.id);
      
      // Check localStorage was updated
      const stored = localStorageMock.getItem('tech-tree-progress');
      expect(stored).toBeDefined();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.nodes[node0.id]).toBe(true);
      expect(parsed.nodes[node1.id]).toBe(true);
    });
  });

  describe('Achievement Integration', () => {
    it('syncWithAchievements should unlock nodes with completed achievements', () => {
      const state = useTechTreeStore.getState();
      
      // Find a node with an achievement requirement
      const nodeWithAchievement = state.nodes.find(
        n => n.achievementId && n.prerequisites.length === 0
      );
      
      expect(nodeWithAchievement).toBeDefined();
      expect(nodeWithAchievement?.achievementId).toBeDefined();
      
      if (nodeWithAchievement) {
        // Sync with achievement
        state.syncWithAchievements([nodeWithAchievement.achievementId!]);
        
        expect(state.isNodeUnlocked(nodeWithAchievement.id)).toBe(true);
      }
    });

    it('syncWithAchievements should not unlock nodes with unmet prerequisites', () => {
      const state = useTechTreeStore.getState();
      
      // Find a node with an achievement and prerequisites
      const nodeWithPrereqs = state.nodes.find(
        n => n.achievementId && n.prerequisites.length > 0
      );
      
      expect(nodeWithPrereqs).toBeDefined();
      
      if (nodeWithPrereqs) {
        // Try to sync without unlocking prerequisites
        state.syncWithAchievements([nodeWithPrereqs.achievementId!]);
        
        expect(state.isNodeUnlocked(nodeWithPrereqs.id)).toBe(false);
      }
    });

    it('syncWithAchievements should handle multiple achievements', () => {
      const state = useTechTreeStore.getState();
      
      // Get first two nodes that have achievements and no prerequisites
      const nodesWithAchievements = state.nodes
        .filter(n => n.achievementId && n.prerequisites.length === 0)
        .slice(0, 2);
      
      expect(nodesWithAchievements.length).toBeGreaterThanOrEqual(2);
      
      if (nodesWithAchievements.length >= 2) {
        const achievementIds = nodesWithAchievements.map(n => n.achievementId!);
        state.syncWithAchievements(achievementIds);
        
        for (const node of nodesWithAchievements) {
          expect(state.isNodeUnlocked(node.id)).toBe(true);
        }
      }
    });
  });

  describe('Reset Progress', () => {
    it('should reset all progress', () => {
      const state = useTechTreeStore.getState();
      
      // Unlock several nodes
      for (const node of state.nodes.slice(0, 5)) {
        state.unlockNode(node.id);
      }
      
      // Reset
      state.resetProgress();
      
      const newState = useTechTreeStore.getState();
      const unlocked = newState.getUnlockedNodeIds();
      expect(unlocked.length).toBe(0);
      expect(newState.selectedNodeId).toBeNull();
    });

    it('should clear localStorage on reset', () => {
      const state = useTechTreeStore.getState();
      
      // Unlock and persist
      state.unlockNode(state.nodes[0].id);
      
      // Reset
      state.resetProgress();
      
      const stored = localStorageMock.getItem('tech-tree-progress');
      const parsed = JSON.parse(stored!);
      
      // All nodes should be false
      const allFalse = Object.values(parsed.nodes).every(v => v === false);
      expect(allFalse).toBe(true);
    });
  });

  describe('Store Subscription', () => {
    it('should update when state changes', () => {
      let updateCount = 0;
      
      const unsubscribe = useTechTreeStore.subscribe(() => {
        updateCount++;
      });
      
      const state = useTechTreeStore.getState();
      state.unlockNode(state.nodes[0].id);
      state.selectNode(state.nodes[1].id);
      state.lockNode(state.nodes[0].id);
      
      expect(updateCount).toBeGreaterThan(0);
      
      unsubscribe();
    });
  });
});

// ============================================
// Additional Integration Tests
// ============================================

describe('TechTreeStore Integration', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    resetStore();
  });

  describe('Complex Unlock Scenarios', () => {
    it('should handle sequential unlocking of dependent nodes', () => {
      const state = useTechTreeStore.getState();
      
      // Find xor-gate which depends on and-gate and or-gate
      const xorNode = state.nodes.find(n => n.id === 'xor-gate');
      expect(xorNode).toBeDefined();
      expect(xorNode?.prerequisites).toContain('and-gate');
      expect(xorNode?.prerequisites).toContain('or-gate');
      
      // Initially, xor-gate should not be unlockable
      expect(state.canUnlock('xor-gate')).toBe(false);
      
      // Unlock only and-gate - xor-gate still not unlockable
      state.unlockNode('and-gate');
      expect(state.canUnlock('xor-gate')).toBe(false);
      
      // Unlock or-gate - now xor-gate should be unlockable
      state.unlockNode('or-gate');
      expect(state.canUnlock('xor-gate')).toBe(true);
      
      // Unlock xor-gate
      state.unlockNode('xor-gate');
      expect(state.isNodeUnlocked('xor-gate')).toBe(true);
    });

    it('should handle multiple prerequisites being unlocked sequentially', () => {
      const state = useTechTreeStore.getState();
      
      // Find mux-2 which depends on xor-gate, and-gate, or-gate
      const muxNode = state.nodes.find(n => n.id === 'mux-2');
      expect(muxNode).toBeDefined();
      
      if (muxNode) {
        // Initially not unlockable
        expect(state.canUnlock('mux-2')).toBe(false);
        
        // Unlock some but not all prerequisites
        state.unlockNode('and-gate');
        state.unlockNode('or-gate');
        expect(state.canUnlock('mux-2')).toBe(false);
        
        // Unlock xor-gate (which itself depends on and-gate and or-gate)
        state.unlockNode('xor-gate');
        expect(state.canUnlock('mux-2')).toBe(true);
      }
    });
  });

  describe('Data Consistency', () => {
    it('should have consistent node counts across categories', () => {
      const state = useTechTreeStore.getState();
      const categoryCounts: Record<string, number> = {};
      
      for (const node of state.nodes) {
        categoryCounts[node.category] = (categoryCounts[node.category] || 0) + 1;
      }
      
      // Each category should have at least 1 node
      for (const count of Object.values(categoryCounts)) {
        expect(count).toBeGreaterThan(0);
      }
    });

    it('should have unique node IDs', () => {
      const state = useTechTreeStore.getState();
      const ids = state.nodes.map(n => n.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique positions', () => {
      const state = useTechTreeStore.getState();
      const positions = state.nodes.map(n => `${n.position.x},${n.position.y}`);
      const uniquePositions = new Set(positions);
      
      expect(uniquePositions.size).toBe(positions.length);
    });
  });
});
