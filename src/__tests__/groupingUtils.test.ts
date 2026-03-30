import { describe, it, expect, beforeEach } from 'vitest';
import {
  createGroup,
  ungroupModules,
  getGroupBounds,
  getGroupCenter,
  calculateGroupMovement,
  assignGroupToModules,
  removeGroupFromModules,
  isModuleInGroup,
  getModuleGroup,
  getGroupModules,
  mergeGroups,
  splitGroup,
  renameGroup,
  toggleGroupLock,
  getGroupStats,
  validateGroup,
  cleanupInvalidGroups,
  GroupInstance,
} from '../utils/groupingUtils';
import { PlacedModule, ModuleType } from '../types';

// Helper to create mock modules
const createMockModule = (
  instanceId: string,
  type: ModuleType = 'core-furnace',
  x: number = 100,
  y: number = 100
): PlacedModule => ({
  id: `id-${instanceId}`,
  instanceId,
  type,
  x,
  y,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports: [],
});

describe('groupingUtils', () => {
  describe('createGroup', () => {
    it('should create a group from module IDs', () => {
      const group = createGroup(['m1', 'm2', 'm3']);
      
      expect(group.id).toBeDefined();
      expect(group.moduleIds).toEqual(['m1', 'm2', 'm3']);
      expect(group.name).toContain('组');
      expect(group.createdAt).toBeDefined();
      expect(group.locked).toBe(false);
    });

    it('should use provided name if given', () => {
      const group = createGroup(['m1', 'm2'], 'My Custom Group');
      
      expect(group.name).toBe('My Custom Group');
    });

    it('should throw error for less than 2 modules', () => {
      expect(() => createGroup(['m1'])).toThrow('需要至少2个模块才能创建组');
      expect(() => createGroup([])).toThrow('需要至少2个模块才能创建组');
    });
  });

  describe('ungroupModules', () => {
    it('should return empty array (group no longer exists after ungroup)', () => {
      const result = ungroupModules('some-group-id');
      expect(result).toEqual([]);
    });
  });

  describe('getGroupBounds', () => {
    it('should calculate bounds for group modules', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      
      const bounds = getGroupBounds(modules);
      
      expect(bounds).not.toBeNull();
      expect(bounds!.minX).toBe(100);
      expect(bounds!.minY).toBe(100);
      expect(bounds!.maxX).toBe(280); // 200 + 80 (gear width)
      expect(bounds!.maxY).toBe(280); // 200 + 80 (gear height)
    });

    it('should return null for empty array', () => {
      const bounds = getGroupBounds([]);
      expect(bounds).toBeNull();
    });
  });

  describe('getGroupCenter', () => {
    it('should calculate center point of group', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      
      const center = getGroupCenter(modules);
      
      expect(center).not.toBeNull();
      expect(center!.x).toBe(190); // (100 + 280) / 2
      expect(center!.y).toBe(190); // (100 + 280) / 2
    });

    it('should return null for empty array', () => {
      const center = getGroupCenter([]);
      expect(center).toBeNull();
    });
  });

  describe('calculateGroupMovement', () => {
    it('should calculate new positions for all modules in group', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      
      const updates = calculateGroupMovement(modules, 50, 50);
      
      expect(updates.length).toBe(2);
      expect(updates[0]).toEqual({ instanceId: 'm1', x: 150, y: 150 });
      expect(updates[1]).toEqual({ instanceId: 'm2', x: 250, y: 250 });
    });

    it('should handle negative delta', () => {
      const modules = [createMockModule('m1', 'core-furnace', 100, 100)];
      
      const updates = calculateGroupMovement(modules, -25, -25);
      
      expect(updates[0]).toEqual({ instanceId: 'm1', x: 75, y: 75 });
    });
  });

  describe('assignGroupToModules', () => {
    it('should assign group ID to modules in group', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
        createMockModule('m3', 'rune-node', 300, 300),
      ];
      const group: GroupInstance = {
        id: 'group-1',
        name: 'Test Group',
        moduleIds: ['m1', 'm2'],
        createdAt: Date.now(),
        locked: false,
      };
      
      const result = assignGroupToModules(modules, group);
      
      expect(result[0].groupId).toBe('group-1');
      expect(result[1].groupId).toBe('group-1');
      expect(result[2].groupId).toBeUndefined();
      expect(result[0].groupName).toBe('Test Group');
    });
  });

  describe('removeGroupFromModules', () => {
    it('should remove group ID from modules', () => {
      const modules = [
        { ...createMockModule('m1', 'core-furnace', 100, 100), groupId: 'group-1', groupName: 'Test' },
        { ...createMockModule('m2', 'gear', 200, 200), groupId: 'group-1', groupName: 'Test' },
      ];
      
      const result = removeGroupFromModules(modules, 'group-1');
      
      expect(result[0].groupId).toBeUndefined();
      expect(result[1].groupId).toBeUndefined();
      expect(result[0].groupName).toBeUndefined();
    });

    it('should not affect modules not in group', () => {
      const modules = [
        { ...createMockModule('m1', 'core-furnace', 100, 100), groupId: 'group-1', groupName: 'Test' },
        { ...createMockModule('m2', 'gear', 200, 200), groupId: 'group-2', groupName: 'Other' },
      ];
      
      const result = removeGroupFromModules(modules, 'group-1');
      
      expect(result[0].groupId).toBeUndefined();
      expect(result[1].groupId).toBe('group-2');
    });
  });

  describe('isModuleInGroup', () => {
    it('should return true if module is in any group', () => {
      const groups: GroupInstance[] = [
        { id: 'group-1', name: 'Group 1', moduleIds: ['m1', 'm2'], createdAt: Date.now(), locked: false },
      ];
      
      expect(isModuleInGroup('m1', groups)).toBe(true);
      expect(isModuleInGroup('m3', groups)).toBe(false);
    });
  });

  describe('getModuleGroup', () => {
    it('should return the group containing the module', () => {
      const groups: GroupInstance[] = [
        { id: 'group-1', name: 'Group 1', moduleIds: ['m1', 'm2'], createdAt: Date.now(), locked: false },
        { id: 'group-2', name: 'Group 2', moduleIds: ['m3'], createdAt: Date.now(), locked: false },
      ];
      
      const result = getModuleGroup('m2', groups);
      
      expect(result).not.toBeUndefined();
      expect(result!.id).toBe('group-1');
    });

    it('should return undefined if module is not in any group', () => {
      const groups: GroupInstance[] = [
        { id: 'group-1', name: 'Group 1', moduleIds: ['m1'], createdAt: Date.now(), locked: false },
      ];
      
      const result = getModuleGroup('m2', groups);
      
      expect(result).toBeUndefined();
    });
  });

  describe('getGroupModules', () => {
    it('should return all modules in a group', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
        createMockModule('m3', 'rune-node', 300, 300),
      ];
      const groups: GroupInstance[] = [
        { id: 'group-1', name: 'Group 1', moduleIds: ['m1', 'm2'], createdAt: Date.now(), locked: false },
      ];
      
      const result = getGroupModules('m1', modules, groups);
      
      expect(result.length).toBe(2);
      expect(result.map(m => m.instanceId)).toContain('m1');
      expect(result.map(m => m.instanceId)).toContain('m2');
    });
  });

  describe('mergeGroups', () => {
    it('should merge multiple groups into one', () => {
      const groups: GroupInstance[] = [
        { id: 'group-1', name: 'Group 1', moduleIds: ['m1', 'm2'], createdAt: Date.now(), locked: false },
        { id: 'group-2', name: 'Group 2', moduleIds: ['m3', 'm4'], createdAt: Date.now(), locked: false },
      ];
      
      const result = mergeGroups(['group-1', 'group-2'], groups);
      
      expect(result).not.toBeNull();
      expect(result!.moduleIds).toContain('m1');
      expect(result!.moduleIds).toContain('m2');
      expect(result!.moduleIds).toContain('m3');
      expect(result!.moduleIds).toContain('m4');
    });

    it('should return null for less than 2 groups', () => {
      const groups: GroupInstance[] = [
        { id: 'group-1', name: 'Group 1', moduleIds: ['m1'], createdAt: Date.now(), locked: false },
      ];
      
      expect(mergeGroups(['group-1'], groups)).toBeNull();
    });

    it('should handle duplicate module IDs', () => {
      const groups: GroupInstance[] = [
        { id: 'group-1', name: 'Group 1', moduleIds: ['m1', 'm2'], createdAt: Date.now(), locked: false },
        { id: 'group-2', name: 'Group 2', moduleIds: ['m2', 'm3'], createdAt: Date.now(), locked: false },
      ];
      
      const result = mergeGroups(['group-1', 'group-2'], groups);
      
      expect(result!.moduleIds.length).toBe(3); // Should deduplicate m2
    });
  });

  describe('splitGroup', () => {
    it('should return module IDs from group', () => {
      const groups: GroupInstance[] = [
        { id: 'group-1', name: 'Group 1', moduleIds: ['m1', 'm2', 'm3'], createdAt: Date.now(), locked: false },
      ];
      
      const result = splitGroup('group-1', groups);
      
      expect(result).toEqual(['m1', 'm2', 'm3']);
    });

    it('should return empty array for non-existent group', () => {
      const groups: GroupInstance[] = [];
      
      const result = splitGroup('group-1', groups);
      
      expect(result).toEqual([]);
    });
  });

  describe('renameGroup', () => {
    it('should rename group', () => {
      const groups: GroupInstance[] = [
        { id: 'group-1', name: 'Old Name', moduleIds: ['m1'], createdAt: Date.now(), locked: false },
      ];
      
      const result = renameGroup('group-1', 'New Name', groups);
      
      expect(result[0].name).toBe('New Name');
    });

    it('should not modify other groups', () => {
      const groups: GroupInstance[] = [
        { id: 'group-1', name: 'Group 1', moduleIds: ['m1'], createdAt: Date.now(), locked: false },
        { id: 'group-2', name: 'Group 2', moduleIds: ['m2'], createdAt: Date.now(), locked: false },
      ];
      
      const result = renameGroup('group-1', 'New Name', groups);
      
      expect(result[1].name).toBe('Group 2');
    });
  });

  describe('toggleGroupLock', () => {
    it('should toggle lock state', () => {
      const groups: GroupInstance[] = [
        { id: 'group-1', name: 'Group 1', moduleIds: ['m1'], createdAt: Date.now(), locked: false },
      ];
      
      const result = toggleGroupLock('group-1', groups);
      
      expect(result[0].locked).toBe(true);
      
      const result2 = toggleGroupLock('group-1', result);
      
      expect(result2[0].locked).toBe(false);
    });
  });

  describe('getGroupStats', () => {
    it('should return group statistics', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
        createMockModule('m3', 'core-furnace', 300, 300),
      ];
      const group: GroupInstance = {
        id: 'group-1',
        name: 'Group 1',
        moduleIds: ['m1', 'm2', 'm3'],
        createdAt: Date.now(),
        locked: false,
      };
      
      const stats = getGroupStats(group, modules);
      
      expect(stats.moduleCount).toBe(3);
      expect(stats.moduleTypes).toContain('core-furnace');
      expect(stats.moduleTypes).toContain('gear');
      expect(stats.bounds).not.toBeNull();
    });
  });

  describe('validateGroup', () => {
    it('should return true if all modules exist', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      const group: GroupInstance = {
        id: 'group-1',
        name: 'Group 1',
        moduleIds: ['m1', 'm2'],
        createdAt: Date.now(),
        locked: false,
      };
      
      expect(validateGroup(group, modules)).toBe(true);
    });

    it('should return false if any module is missing', () => {
      const modules = [createMockModule('m1', 'core-furnace', 100, 100)];
      const group: GroupInstance = {
        id: 'group-1',
        name: 'Group 1',
        moduleIds: ['m1', 'm2'],
        createdAt: Date.now(),
        locked: false,
      };
      
      expect(validateGroup(group, modules)).toBe(false);
    });
  });

  describe('cleanupInvalidGroups', () => {
    it('should remove groups with missing modules', () => {
      const modules = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      const groups: GroupInstance[] = [
        { id: 'group-1', name: 'Valid Group', moduleIds: ['m1', 'm2'], createdAt: Date.now(), locked: false },
        { id: 'group-2', name: 'Invalid Group', moduleIds: ['m1', 'm3'], createdAt: Date.now(), locked: false },
      ];
      
      const result = cleanupInvalidGroups(groups, modules);
      
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('group-1');
    });
  });
});
