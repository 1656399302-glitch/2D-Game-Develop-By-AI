/**
 * Grouping Store Integration Tests
 * 
 * Tests for the Grouping store which manages module groups.
 * Tests group creation, transformation, and management.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGroupingStore, GroupData } from '../store/useGroupingStore';

describe('GroupingStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useGroupingStore.setState({
      groups: new Map(),
    });
  });

  describe('initial state', () => {
    it('should initialize with empty groups', () => {
      const state = useGroupingStore.getState();
      expect(state.groups.size).toBe(0);
    });
  });

  describe('createGroup', () => {
    it('should create a group with at least 2 modules', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      
      expect(group).toBeDefined();
      expect(group?.moduleIds).toEqual(['mod-1', 'mod-2']);
      expect(group?.locked).toBe(false);
    });

    it('should return null for single module', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1']);
      expect(group).toBeNull();
    });

    it('should return null for empty array', () => {
      const group = useGroupingStore.getState().createGroup([]);
      expect(group).toBeNull();
    });

    it('should use custom name when provided', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2'], 'Custom Group');
      expect(group?.name).toBe('Custom Group');
    });

    it('should generate default name when not provided', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2', 'mod-3']);
      expect(group?.name).toBe('组 3 模块');
    });

    it('should add group to store', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      
      const state = useGroupingStore.getState();
      expect(state.groups.has(group!.id)).toBe(true);
      expect(state.groups.get(group!.id)).toEqual(group);
    });

    it('should create multiple groups', () => {
      const group1 = useGroupingStore.getState().createGroup(['mod-1', 'mod-2'], 'Group 1');
      const group2 = useGroupingStore.getState().createGroup(['mod-3', 'mod-4'], 'Group 2');
      
      const state = useGroupingStore.getState();
      expect(state.groups.size).toBe(2);
      expect(state.groups.has(group1!.id)).toBe(true);
      expect(state.groups.has(group2!.id)).toBe(true);
    });

    it('should set createdAt timestamp', () => {
      const before = Date.now();
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      const after = Date.now();

      expect(group?.createdAt).toBeDefined();
      expect(group?.createdAt! >= before).toBe(true);
      expect(group?.createdAt! <= after).toBe(true);
    });
  });

  describe('ungroup', () => {
    it('should remove group and return module IDs', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      
      const moduleIds = useGroupingStore.getState().ungroup(group!.id);
      
      expect(moduleIds).toEqual(['mod-1', 'mod-2']);
      expect(useGroupingStore.getState().groups.size).toBe(0);
    });

    it('should return empty array for non-existent group', () => {
      const moduleIds = useGroupingStore.getState().ungroup('non-existent');
      expect(moduleIds).toEqual([]);
    });

    it('should not affect other groups', () => {
      const group1 = useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      const group2 = useGroupingStore.getState().createGroup(['mod-3', 'mod-4']);
      
      useGroupingStore.getState().ungroup(group1!.id);
      
      const state = useGroupingStore.getState();
      expect(state.groups.size).toBe(1);
      expect(state.groups.has(group2!.id)).toBe(true);
    });
  });

  describe('getGroupModules', () => {
    it('should return module IDs for a group', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2', 'mod-3']);
      
      const moduleIds = useGroupingStore.getState().getGroupModules(group!.id);
      expect(moduleIds).toEqual(['mod-1', 'mod-2', 'mod-3']);
    });

    it('should return empty array for non-existent group', () => {
      const moduleIds = useGroupingStore.getState().getGroupModules('non-existent');
      expect(moduleIds).toEqual([]);
    });
  });

  describe('transformGroup', () => {
    it('should not throw when transforming group', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      
      expect(() => {
        useGroupingStore.getState().transformGroup(group!.id, { x: 10, y: 20 });
      }).not.toThrow();
    });

    it('should handle rotation transform', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      
      expect(() => {
        useGroupingStore.getState().transformGroup(group!.id, { rotation: 45 });
      }).not.toThrow();
    });

    it('should handle scale transform', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      
      expect(() => {
        useGroupingStore.getState().transformGroup(group!.id, { scale: 2 });
      }).not.toThrow();
    });
  });

  describe('renameGroup', () => {
    it('should rename a group', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      
      useGroupingStore.getState().renameGroup(group!.id, 'New Name');
      
      const updated = useGroupingStore.getState().groups.get(group!.id);
      expect(updated?.name).toBe('New Name');
    });

    it('should not affect other groups', () => {
      const group1 = useGroupingStore.getState().createGroup(['mod-1', 'mod-2'], 'Group 1');
      const group2 = useGroupingStore.getState().createGroup(['mod-3', 'mod-4'], 'Group 2');
      
      useGroupingStore.getState().renameGroup(group1!.id, 'Renamed');
      
      const state = useGroupingStore.getState();
      expect(state.groups.get(group1!.id)?.name).toBe('Renamed');
      expect(state.groups.get(group2!.id)?.name).toBe('Group 2');
    });
  });

  describe('lockGroup', () => {
    it('should lock a group', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      
      useGroupingStore.getState().lockGroup(group!.id);
      
      const locked = useGroupingStore.getState().groups.get(group!.id);
      expect(locked?.locked).toBe(true);
    });

    it('should not affect other groups', () => {
      const group1 = useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      const group2 = useGroupingStore.getState().createGroup(['mod-3', 'mod-4']);
      
      useGroupingStore.getState().lockGroup(group1!.id);
      
      const state = useGroupingStore.getState();
      expect(state.groups.get(group1!.id)?.locked).toBe(true);
      expect(state.groups.get(group2!.id)?.locked).toBe(false);
    });
  });

  describe('unlockGroup', () => {
    it('should unlock a group', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      
      useGroupingStore.getState().lockGroup(group!.id);
      useGroupingStore.getState().unlockGroup(group!.id);
      
      const unlocked = useGroupingStore.getState().groups.get(group!.id);
      expect(unlocked?.locked).toBe(false);
    });
  });

  describe('toggleGroupLock', () => {
    it('should toggle lock from unlocked to locked', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      
      useGroupingStore.getState().toggleGroupLock(group!.id);
      
      const toggled = useGroupingStore.getState().groups.get(group!.id);
      expect(toggled?.locked).toBe(true);
    });

    it('should toggle lock from locked to unlocked', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      
      useGroupingStore.getState().lockGroup(group!.id);
      useGroupingStore.getState().toggleGroupLock(group!.id);
      
      const toggled = useGroupingStore.getState().groups.get(group!.id);
      expect(toggled?.locked).toBe(false);
    });
  });

  describe('getGroupByModuleId', () => {
    it('should return group containing the module', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2', 'mod-3']);
      
      const found = useGroupingStore.getState().getGroupByModuleId('mod-2');
      expect(found?.id).toBe(group?.id);
    });

    it('should return undefined for module not in any group', () => {
      useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      
      const found = useGroupingStore.getState().getGroupByModuleId('mod-999');
      expect(found).toBeUndefined();
    });
  });

  describe('isModuleInGroup', () => {
    it('should return true for module in a group', () => {
      useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      
      expect(useGroupingStore.getState().isModuleInGroup('mod-1')).toBe(true);
      expect(useGroupingStore.getState().isModuleInGroup('mod-2')).toBe(true);
    });

    it('should return false for module not in any group', () => {
      useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      
      expect(useGroupingStore.getState().isModuleInGroup('mod-999')).toBe(false);
    });
  });

  describe('getGroupModuleIds', () => {
    it('should return module IDs for a group', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2', 'mod-3']);
      
      const moduleIds = useGroupingStore.getState().getGroupModuleIds(group!.id);
      expect(moduleIds).toEqual(['mod-1', 'mod-2', 'mod-3']);
    });

    it('should return empty array for non-existent group', () => {
      const moduleIds = useGroupingStore.getState().getGroupModuleIds('non-existent');
      expect(moduleIds).toEqual([]);
    });
  });

  describe('clearAllGroups', () => {
    it('should clear all groups', () => {
      useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      useGroupingStore.getState().createGroup(['mod-3', 'mod-4']);
      useGroupingStore.getState().createGroup(['mod-5', 'mod-6']);
      
      useGroupingStore.getState().clearAllGroups();
      
      expect(useGroupingStore.getState().groups.size).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle creating group with many modules', () => {
      const moduleIds = Array.from({ length: 50 }, (_, i) => `mod-${i}`);
      const group = useGroupingStore.getState().createGroup(moduleIds);
      
      expect(group).toBeDefined();
      expect(group?.moduleIds).toHaveLength(50);
    });

    it('should handle duplicate module IDs in creation', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-1', 'mod-2']);
      
      expect(group).toBeDefined();
      expect(group?.moduleIds).toEqual(['mod-1', 'mod-1', 'mod-2']);
    });

    it('should handle rapid group creation', () => {
      const groups: GroupData[] = [];
      for (let i = 0; i < 100; i++) {
        const group = useGroupingStore.getState().createGroup([`mod-${i}-a`, `mod-${i}-b`]);
        if (group) groups.push(group);
      }

      expect(useGroupingStore.getState().groups.size).toBe(100);
    });

    it('should handle alternating lock/unlock operations', () => {
      const group = useGroupingStore.getState().createGroup(['mod-1', 'mod-2']);
      
      for (let i = 0; i < 10; i++) {
        useGroupingStore.getState().toggleGroupLock(group!.id);
      }
      
      // Should be back to original state (unlocked)
      expect(useGroupingStore.getState().groups.get(group!.id)?.locked).toBe(false);
    });
  });
});
