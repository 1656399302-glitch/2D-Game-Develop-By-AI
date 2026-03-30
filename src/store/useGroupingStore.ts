import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

/**
 * Group data structure
 */
export interface GroupData {
  id: string;
  name: string;
  moduleIds: string[];
  createdAt: number;
  locked: boolean;
}

/**
 * Grouping store interface
 */
interface GroupingStore {
  // State
  groups: Map<string, GroupData>;
  
  // Actions
  createGroup: (moduleIds: string[], name?: string) => GroupData | null;
  ungroup: (groupId: string) => string[];
  getGroupModules: (groupId: string) => string[];
  transformGroup: (groupId: string, _delta: { x?: number; y?: number; rotation?: number; scale?: number }) => void;
  renameGroup: (groupId: string, name: string) => void;
  lockGroup: (groupId: string) => void;
  unlockGroup: (groupId: string) => void;
  toggleGroupLock: (groupId: string) => void;
  getGroupByModuleId: (moduleId: string) => GroupData | undefined;
  isModuleInGroup: (moduleId: string) => boolean;
  getGroupModuleIds: (groupId: string) => string[];
  clearAllGroups: () => void;
}

/**
 * Create a default group name based on module count
 */
const createDefaultName = (moduleIds: string[]): string => {
  return `组 ${moduleIds.length} 模块`;
};

/**
 * Grouping store for managing module groups
 */
export const useGroupingStore = create<GroupingStore>((set, get) => ({
  groups: new Map(),

  /**
   * Create a new group from selected module IDs
   * @param moduleIds - Array of module instance IDs to group
   * @param name - Optional custom name for the group
   * @returns The created GroupData or null if fewer than 2 modules
   */
  createGroup: (moduleIds: string[], name?: string): GroupData | null => {
    if (moduleIds.length < 2) {
      return null;
    }

    const newGroup: GroupData = {
      id: uuidv4(),
      name: name || createDefaultName(moduleIds),
      moduleIds: [...moduleIds],
      createdAt: Date.now(),
      locked: false,
    };

    set((state) => {
      const newGroups = new Map(state.groups);
      newGroups.set(newGroup.id, newGroup);
      return { groups: newGroups };
    });

    return newGroup;
  },

  /**
   * Dissolve a group, preserving module transforms
   * @param groupId - The group ID to ungroup
   * @returns Array of module IDs that were in the group
   */
  ungroup: (groupId: string): string[] => {
    const { groups } = get();
    const group = groups.get(groupId);
    
    if (!group) {
      return [];
    }

    const moduleIds = [...group.moduleIds];

    set((state) => {
      const newGroups = new Map(state.groups);
      newGroups.delete(groupId);
      return { groups: newGroups };
    });

    return moduleIds;
  },

  /**
   * Get all module IDs in a group
   * @param groupId - The group ID
   * @returns Array of module instance IDs
   */
  getGroupModules: (groupId: string): string[] => {
    const { groups } = get();
    const group = groups.get(groupId);
    return group ? [...group.moduleIds] : [];
  },

  /**
   * Apply transform to all modules in a group
   * Note: This doesn't directly modify modules - it returns the deltas to apply
   * @param groupId - The group ID
   * @param _delta - Transform deltas (x, y, rotation, scale)
   */
  transformGroup: (_groupId: string, _delta: { x?: number; y?: number; rotation?: number; scale?: number }): void => {
    // Transform is applied to modules in the store via useMachineStore
    // This function is a marker that a group transform is happening
    // The actual transform logic is in groupingUtils.rotateGroup, scaleGroup, etc.
  },

  /**
   * Rename a group
   * @param groupId - The group ID
   * @param name - New name for the group
   */
  renameGroup: (groupId: string, name: string): void => {
    set((state) => {
      const newGroups = new Map(state.groups);
      const group = newGroups.get(groupId);
      if (group) {
        newGroups.set(groupId, { ...group, name });
      }
      return { groups: newGroups };
    });
  },

  /**
   * Lock a group
   * @param groupId - The group ID
   */
  lockGroup: (groupId: string): void => {
    set((state) => {
      const newGroups = new Map(state.groups);
      const group = newGroups.get(groupId);
      if (group) {
        newGroups.set(groupId, { ...group, locked: true });
      }
      return { groups: newGroups };
    });
  },

  /**
   * Unlock a group
   * @param groupId - The group ID
   */
  unlockGroup: (groupId: string): void => {
    set((state) => {
      const newGroups = new Map(state.groups);
      const group = newGroups.get(groupId);
      if (group) {
        newGroups.set(groupId, { ...group, locked: false });
      }
      return { groups: newGroups };
    });
  },

  /**
   * Toggle group lock state
   * @param groupId - The group ID
   */
  toggleGroupLock: (groupId: string): void => {
    set((state) => {
      const newGroups = new Map(state.groups);
      const group = newGroups.get(groupId);
      if (group) {
        newGroups.set(groupId, { ...group, locked: !group.locked });
      }
      return { groups: newGroups };
    });
  },

  /**
   * Get the group that contains a specific module
   * @param moduleId - The module instance ID
   * @returns The GroupData or undefined
   */
  getGroupByModuleId: (moduleId: string): GroupData | undefined => {
    const { groups } = get();
    for (const group of groups.values()) {
      if (group.moduleIds.includes(moduleId)) {
        return group;
      }
    }
    return undefined;
  },

  /**
   * Check if a module is in any group
   * @param moduleId - The module instance ID
   * @returns boolean
   */
  isModuleInGroup: (moduleId: string): boolean => {
    return get().getGroupByModuleId(moduleId) !== undefined;
  },

  /**
   * Get module IDs for a group
   * @param groupId - The group ID
   * @returns Array of module instance IDs
   */
  getGroupModuleIds: (groupId: string): string[] => {
    const { groups } = get();
    const group = groups.get(groupId);
    return group ? [...group.moduleIds] : [];
  },

  /**
   * Clear all groups
   */
  clearAllGroups: (): void => {
    set({ groups: new Map() });
  },
}));

export default useGroupingStore;
