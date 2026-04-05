/**
 * Tech Tree Store
 * 
 * Zustand store for managing circuit component tech tree state.
 * Manages node unlock state, prerequisite tracking, and integration
 * with the achievement store.
 * 
 * ROUND 136: Initial implementation
 * 
 * Key features:
 * - Tracks unlock state for all tech tree nodes
 * - Automatically unlocks nodes when prerequisite achievements are completed
 * - localStorage persistence under key 'tech-tree-progress'
 * - Integration with achievement store for achievement-driven unlocks
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  TECH_TREE_NODES, 
  getTechTreeNodes
} from '../data/techTreeNodes';
import type { 
  TechTreeNodeData, 
  StoredTechTreeData 
} from '../types/techTree';
import { 
  TECH_TREE_STORAGE_KEY, 
  checkPrerequisitesMet,
  getUnmetPrerequisites 
} from '../types/techTree';

// Lazy loaded achievement store to avoid circular dependency
let achievementStoreGetter: (() => any) | null = null;

export function setAchievementStoreGetter(getter: () => any) {
  achievementStoreGetter = getter;
}

/**
 * Load tech tree state from localStorage
 */
function loadFromStorage(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(TECH_TREE_STORAGE_KEY);
    if (stored) {
      const data: StoredTechTreeData = JSON.parse(stored);
      return data.nodes || {};
    }
  } catch (error) {
    console.warn('Failed to load tech tree from localStorage:', error);
  }
  return {};
}

/**
 * Save tech tree state to localStorage
 */
function saveToStorage(nodes: Record<string, boolean>): void {
  try {
    const data: StoredTechTreeData = {
      nodes,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(TECH_TREE_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save tech tree to localStorage:', error);
  }
}

/**
 * Initialize unlock state from persisted data and node definitions
 */
function initializeUnlockState(): Record<string, boolean> {
  const persisted = loadFromStorage();
  const state: Record<string, boolean> = {};
  
  // Initialize all nodes as locked (false)
  for (const node of TECH_TREE_NODES) {
    state[node.id] = persisted[node.id] ?? false;
  }
  
  return state;
}

interface TechTreeStore {
  // All tech tree nodes (static definitions)
  nodes: TechTreeNodeData[];
  
  // Unlock state: nodeId -> isUnlocked
  unlockedNodes: Record<string, boolean>;
  
  // Currently selected node (for detail display)
  selectedNodeId: string | null;
  
  // Actions
  
  /**
   * Manually unlock a node (for testing or manual unlock)
   */
  unlockNode: (nodeId: string) => void;
  
  /**
   * Lock a node (for testing or reset)
   */
  lockNode: (nodeId: string) => void;
  
  /**
   * Select a node to show details
   */
  selectNode: (nodeId: string | null) => void;
  
  /**
   * Check if a node can be unlocked (prerequisites met)
   */
  canUnlock: (nodeId: string) => boolean;
  
  /**
   * Get unmet prerequisites for a node
   */
  getUnmetPrerequisites: (nodeId: string) => string[];
  
  /**
   * Get all unlocked node IDs
   */
  getUnlockedNodeIds: () => string[];
  
  /**
   * Get nodes by category
   */
  getNodesByCategory: (category: string) => TechTreeNodeData[];
  
  /**
   * Get node by ID
   */
  getNode: (nodeId: string) => TechTreeNodeData | undefined;
  
  /**
   * Check if a node is unlocked
   */
  isNodeUnlocked: (nodeId: string) => boolean;
  
  /**
   * Sync with achievement store - called when achievements change
   * Automatically unlocks nodes whose prerequisite achievements are completed
   */
  syncWithAchievements: (unlockedAchievementIds: string[]) => void;
  
  /**
   * Reset all progress (for testing)
   */
  resetProgress: () => void;
  
  // Persistence helpers
  _loadFromStorage: () => void;
  _saveToStorage: () => void;
}

export const useTechTreeStore = create<TechTreeStore>()(
  subscribeWithSelector((set, get) => {
    // Initialize with persisted state
    const initialUnlockedNodes = initializeUnlockState();
    
    return {
      // Static node definitions
      nodes: getTechTreeNodes(),
      
      // Initialize unlock state from localStorage
      unlockedNodes: initialUnlockedNodes,
      
      // No node selected initially
      selectedNodeId: null,
      
      /**
       * Manually unlock a node
       */
      unlockNode: (nodeId: string) => {
        const state = get();
        const node = state.nodes.find(n => n.id === nodeId);
        
        if (!node) {
          console.warn(`Node "${nodeId}" not found`);
          return;
        }
        
        // Check if prerequisites are met
        if (!state.canUnlock(nodeId)) {
          console.warn(`Cannot unlock "${nodeId}" - prerequisites not met`);
          return;
        }
        
        set((state) => {
          const updatedNodes = {
            ...state.unlockedNodes,
            [nodeId]: true,
          };
          
          // Persist to localStorage
          saveToStorage(updatedNodes);
          
          return { unlockedNodes: updatedNodes };
        });
      },
      
      /**
       * Lock a node
       */
      lockNode: (nodeId: string) => {
        set((state) => {
          const updatedNodes = {
            ...state.unlockedNodes,
            [nodeId]: false,
          };
          
          // Persist to localStorage
          saveToStorage(updatedNodes);
          
          return { unlockedNodes: updatedNodes };
        });
      },
      
      /**
       * Select a node
       */
      selectNode: (nodeId: string | null) => {
        set({ selectedNodeId: nodeId });
      },
      
      /**
       * Check if a node can be unlocked (prerequisites met)
       */
      canUnlock: (nodeId: string) => {
        const state = get();
        return checkPrerequisitesMet(nodeId, state.nodes, state.unlockedNodes);
      },
      
      /**
       * Get unmet prerequisites for a node
       */
      getUnmetPrerequisites: (nodeId: string) => {
        const state = get();
        return getUnmetPrerequisites(nodeId, state.nodes, state.unlockedNodes);
      },
      
      /**
       * Get all unlocked node IDs
       */
      getUnlockedNodeIds: () => {
        const state = get();
        return Object.entries(state.unlockedNodes)
          .filter(([_, unlocked]) => unlocked)
          .map(([id]) => id);
      },
      
      /**
       * Get nodes by category
       */
      getNodesByCategory: (category: string) => {
        const state = get();
        return state.nodes.filter(node => node.category === category);
      },
      
      /**
       * Get node by ID
       */
      getNode: (nodeId: string) => {
        const state = get();
        return state.nodes.find(n => n.id === nodeId);
      },
      
      /**
       * Check if a node is unlocked
       */
      isNodeUnlocked: (nodeId: string) => {
        const state = get();
        return state.unlockedNodes[nodeId] ?? false;
      },
      
      /**
       * Sync with achievement store - unlock nodes whose prerequisite achievements are completed
       */
      syncWithAchievements: (unlockedAchievementIds: string[]) => {
        const state = get();
        const achievementIdSet = new Set(unlockedAchievementIds);
        
        let hasChanges = false;
        const updatedNodes = { ...state.unlockedNodes };
        
        // Check each node to see if its achievement requirement is met
        for (const node of state.nodes) {
          // Skip if already unlocked
          if (updatedNodes[node.id]) continue;
          
          // Skip if no achievement requirement
          if (!node.achievementId) continue;
          
          // Check if prerequisite achievements are met
          // Also check that the node's direct prerequisites are unlocked
          const prereqsMet = checkPrerequisitesMet(node.id, state.nodes, updatedNodes);
          const achievementMet = achievementIdSet.has(node.achievementId);
          
          // Node can be unlocked if prerequisites are met AND achievement is completed
          if (prereqsMet && achievementMet) {
            updatedNodes[node.id] = true;
            hasChanges = true;
          }
        }
        
        if (hasChanges) {
          saveToStorage(updatedNodes);
          set({ unlockedNodes: updatedNodes });
        }
      },
      
      /**
       * Reset all progress
       */
      resetProgress: () => {
        const resetState: Record<string, boolean> = {};
        for (const node of TECH_TREE_NODES) {
          resetState[node.id] = false;
        }
        saveToStorage(resetState);
        set({ unlockedNodes: resetState, selectedNodeId: null });
      },
      
      /**
       * Load from localStorage
       */
      _loadFromStorage: () => {
        const persisted = loadFromStorage();
        const currentState = get().unlockedNodes;
        
        // Merge persisted state (only apply persisted values, don't overwrite)
        const mergedState = { ...currentState };
        let hasChanges = false;
        
        for (const [nodeId, unlocked] of Object.entries(persisted)) {
          if (mergedState[nodeId] !== unlocked) {
            mergedState[nodeId] = unlocked;
            hasChanges = true;
          }
        }
        
        if (hasChanges) {
          set({ unlockedNodes: mergedState });
        }
      },
      
      /**
       * Save to localStorage
       */
      _saveToStorage: () => {
        saveToStorage(get().unlockedNodes);
      },
    };
  })
);

/**
 * Set up subscription to achievement store changes
 * This allows tech tree to automatically update when achievements are unlocked
 */
export function setupAchievementIntegration() {
  if (!achievementStoreGetter) {
    console.warn('Achievement store getter not set. Call setAchievementStoreGetter first.');
    return;
  }
  
  try {
    const achievementStore = achievementStoreGetter();
    if (!achievementStore) return;
    
    // Subscribe to achievement changes
    achievementStore.subscribe((state: any) => state.achievements, (achievements: any[], prev: any[]) => {
      if (!achievements || !prev) return;
      
      // Find newly unlocked achievements
      const prevUnlocked = new Set(
        prev.filter((a: any) => a.isUnlocked).map((a: any) => a.id)
      );
      
      const newlyUnlocked = achievements
        .filter((a: any) => a.isUnlocked && !prevUnlocked.has(a.id))
        .map((a: any) => a.id);
      
      if (newlyUnlocked.length > 0) {
        // Sync tech tree with new achievements
        const allUnlocked = achievements
          .filter((a: any) => a.isUnlocked)
          .map((a: any) => a.id);
        
        useTechTreeStore.getState().syncWithAchievements(allUnlocked);
      }
    });
  } catch (error) {
    console.warn('Failed to set up achievement integration:', error);
  }
}

// Default export
export default useTechTreeStore;
