import { v4 as uuidv4 } from 'uuid';
import { PlacedModule, ModuleType, MODULE_SIZES } from '../types';
import { calculateBounds, Bounds } from './clipboardUtils';

/**
 * Group instance interface
 */
export interface GroupInstance {
  id: string;
  name: string;
  moduleIds: string[];
  createdAt: number;
  locked: boolean;
}

/**
 * Extended PlacedModule with group information
 */
export interface GroupedModule extends PlacedModule {
  groupId?: string;
  groupName?: string;
}

/**
 * Calculate the bounding box for a set of module IDs
 * @param modules - Array of all modules in the canvas
 * @param moduleIds - Array of module instance IDs to calculate bounds for
 * @returns Bounds or null if no valid modules
 */
export function calculateGroupBounds(
  modules: PlacedModule[],
  moduleIds: string[]
): Bounds | null {
  const targetModules = modules.filter(m => moduleIds.includes(m.instanceId));
  return calculateBounds(targetModules);
}

/**
 * Calculate the center point of a group
 * @param modules - Array of all modules in the canvas
 * @param moduleIds - Array of module instance IDs
 * @returns Center point { x, y } or null
 */
export function calculateGroupCenter(
  modules: PlacedModule[],
  moduleIds: string[]
): { x: number; y: number } | null {
  const bounds = calculateGroupBounds(modules, moduleIds);
  if (!bounds) return null;
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
}

/**
 * Rotate all modules in a group around the group center
 * @param modules - Array of all modules (will be modified)
 * @param moduleIds - Array of module instance IDs to rotate
 * @param degrees - Rotation angle in degrees (positive = clockwise)
 * @returns Updated modules array
 */
export function rotateGroup(
  modules: PlacedModule[],
  moduleIds: string[],
  degrees: number
): PlacedModule[] {
  if (moduleIds.length === 0) return modules;
  
  const center = calculateGroupCenter(modules, moduleIds);
  if (!center) return modules;

  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const targetModuleIds = new Set(moduleIds);

  return modules.map(module => {
    if (!targetModuleIds.has(module.instanceId)) {
      return module;
    }

    // Get module center
    const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
    const moduleCenterX = module.x + size.width / 2;
    const moduleCenterY = module.y + size.height / 2;

    // Rotate module center around group center
    const dx = moduleCenterX - center.x;
    const dy = moduleCenterY - center.y;
    const newModuleCenterX = center.x + dx * cos - dy * sin;
    const newModuleCenterY = center.y + dx * sin + dy * cos;

    // Calculate new position (top-left corner)
    const newX = newModuleCenterX - size.width / 2;
    const newY = newModuleCenterY - size.height / 2;

    // Update rotation
    const newRotation = (module.rotation + degrees) % 360;

    return {
      ...module,
      x: Math.round(newX),
      y: Math.round(newY),
      rotation: newRotation,
    };
  });
}

/**
 * Scale all modules in a group from the group center
 * @param modules - Array of all modules (will be modified)
 * @param moduleIds - Array of module instance IDs to scale
 * @param factor - Scale factor (> 1 = enlarge, < 1 = shrink)
 * @param minScale - Minimum scale clamp (default 0.25)
 * @param maxScale - Maximum scale clamp (default 4.0)
 * @returns Updated modules array
 */
export function scaleGroup(
  modules: PlacedModule[],
  moduleIds: string[],
  factor: number,
  minScale: number = 0.25,
  maxScale: number = 4.0
): PlacedModule[] {
  if (moduleIds.length === 0) return modules;
  
  const center = calculateGroupCenter(modules, moduleIds);
  if (!center) return modules;

  const targetModuleIds = new Set(moduleIds);

  return modules.map(module => {
    if (!targetModuleIds.has(module.instanceId)) {
      return module;
    }

    // Get module center
    const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
    const moduleCenterX = module.x + size.width / 2;
    const moduleCenterY = module.y + size.height / 2;

    // Scale position relative to center
    const dx = moduleCenterX - center.x;
    const dy = moduleCenterY - center.y;
    const newModuleCenterX = center.x + dx * factor;
    const newModuleCenterY = center.y + dy * factor;

    // Calculate new position (top-left corner)
    const newX = newModuleCenterX - size.width / 2;
    const newY = newModuleCenterY - size.height / 2;

    // Calculate new scale, clamped
    const newScale = Math.max(minScale, Math.min(maxScale, module.scale * factor));

    return {
      ...module,
      x: Math.round(newX),
      y: Math.round(newY),
      scale: newScale,
    };
  });
}

/**
 * Flip modules horizontally around the group center
 * @param modules - Array of all modules (will be modified)
 * @param moduleIds - Array of module instance IDs to flip
 * @returns Updated modules array
 */
export function flipGroupHorizontal(
  modules: PlacedModule[],
  moduleIds: string[]
): PlacedModule[] {
  if (moduleIds.length === 0) return modules;
  
  const center = calculateGroupCenter(modules, moduleIds);
  if (!center) return modules;

  const targetModuleIds = new Set(moduleIds);

  return modules.map(module => {
    if (!targetModuleIds.has(module.instanceId)) {
      return module;
    }

    // Get module center
    const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
    const moduleCenterX = module.x + size.width / 2;

    // Mirror X position around center
    const dx = moduleCenterX - center.x;
    const newModuleCenterX = center.x - dx;

    // Calculate new position (top-left corner)
    const newX = newModuleCenterX - size.width / 2;

    return {
      ...module,
      x: Math.round(newX),
      flipped: !module.flipped,
    };
  });
}

/**
 * Flip modules vertically around the group center
 * @param modules - Array of all modules (will be modified)
 * @param moduleIds - Array of module instance IDs to flip
 * @returns Updated modules array
 */
export function flipGroupVertical(
  modules: PlacedModule[],
  moduleIds: string[]
): PlacedModule[] {
  if (moduleIds.length === 0) return modules;
  
  const center = calculateGroupCenter(modules, moduleIds);
  if (!center) return modules;

  const targetModuleIds = new Set(moduleIds);

  return modules.map(module => {
    if (!targetModuleIds.has(module.instanceId)) {
      return module;
    }

    // Get module center
    const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
    const moduleCenterY = module.y + size.height / 2;

    // Mirror Y position around center
    const dy = moduleCenterY - center.y;
    const newModuleCenterY = center.y - dy;

    // Calculate new position (top-left corner)
    const newY = newModuleCenterY - size.height / 2;

    return {
      ...module,
      y: Math.round(newY),
      flipped: !module.flipped,
    };
  });
}

/**
 * Create a new group from selected modules
 * @param moduleIds - Array of module instance IDs to group
 * @param name - Optional name for the group
 * @returns GroupInstance with the grouped modules
 */
export function createGroup(moduleIds: string[], name?: string): GroupInstance {
  if (moduleIds.length < 2) {
    throw new Error('需要至少2个模块才能创建组');
  }

  return {
    id: uuidv4(),
    name: name || `组 ${moduleIds.length} 模块`,
    moduleIds: [...moduleIds],
    createdAt: Date.now(),
    locked: false,
  };
}

/**
 * Ungroup modules - returns the constituent module IDs
 * @param _groupId - The group ID to ungroup
 * @returns Empty array (the actual module update happens in the store)
 */
export function ungroupModules(_groupId: string): string[] {
  // This function is used to identify which modules belonged to a group
  // The actual module state update happens in the store
  // Returns an empty array since the group no longer exists
  return [];
}

/**
 * Get the bounding box for a set of modules
 * Alias for calculateBounds from clipboardUtils for convenience
 */
export function getGroupBounds(modules: PlacedModule[]): Bounds | null {
  return calculateBounds(modules);
}

/**
 * Calculate the center point of a group
 */
export function getGroupCenter(modules: PlacedModule[]): { x: number; y: number } | null {
  const bounds = getGroupBounds(modules);
  if (!bounds) return null;
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
}

/**
 * Calculate delta movement for each module in a group when moving the group
 * @param modules - All modules in the group
 * @param deltaX - Movement delta X
 * @param deltaY - Movement delta Y
 * @returns Array of updates for each module
 */
export function calculateGroupMovement(
  modules: PlacedModule[],
  deltaX: number,
  deltaY: number
): Array<{ instanceId: string; x: number; y: number }> {
  return modules.map(m => ({
    instanceId: m.instanceId,
    x: m.x + deltaX,
    y: m.y + deltaY,
  }));
}

/**
 * Assign group information to modules
 */
export function assignGroupToModules(
  modules: PlacedModule[],
  group: GroupInstance
): GroupedModule[] {
  return modules.map(m => {
    if (group.moduleIds.includes(m.instanceId)) {
      return {
        ...m,
        groupId: group.id,
        groupName: group.name,
      };
    }
    return m;
  });
}

/**
 * Remove group information from modules
 */
export function removeGroupFromModules(
  modules: PlacedModule[],
  groupId: string
): PlacedModule[] {
  return modules.map(m => {
    if ((m as any).groupId === groupId) {
      const { groupId: _, groupName: __, ...rest } = m as any;
      return rest as PlacedModule;
    }
    return m;
  });
}

/**
 * Check if a module is part of a group
 */
export function isModuleInGroup(moduleId: string, groups: GroupInstance[]): boolean {
  return groups.some(g => g.moduleIds.includes(moduleId));
}

/**
 * Get the group that contains a specific module
 */
export function getModuleGroup(moduleId: string, groups: GroupInstance[]): GroupInstance | undefined {
  return groups.find(g => g.moduleIds.includes(moduleId));
}

/**
 * Get all modules in a specific group
 */
export function getGroupModules(moduleId: string, allModules: PlacedModule[], groups: GroupInstance[]): PlacedModule[] {
  const group = getModuleGroup(moduleId, groups);
  if (!group) return [];
  return allModules.filter(m => group.moduleIds.includes(m.instanceId));
}

/**
 * Merge modules into a single group
 */
export function mergeGroups(groupIds: string[], allGroups: GroupInstance[]): GroupInstance | null {
  if (groupIds.length < 2) return null;

  const groupsToMerge = allGroups.filter(g => groupIds.includes(g.id));
  if (groupsToMerge.length !== groupIds.length) return null;

  const allModuleIds = groupsToMerge.flatMap(g => g.moduleIds);
  const uniqueModuleIds = [...new Set(allModuleIds)];

  return {
    id: uuidv4(),
    name: `合并组 ${uniqueModuleIds.length} 模块`,
    moduleIds: uniqueModuleIds,
    createdAt: Date.now(),
    locked: false,
  };
}

/**
 * Split a group into individual modules
 */
export function splitGroup(groupId: string, groups: GroupInstance[]): string[] {
  const group = groups.find(g => g.id === groupId);
  if (!group) return [];
  return [...group.moduleIds];
}

/**
 * Rename a group - mutates the array in place
 * @deprecated Use renameGroupFn instead for immutable operations
 */
export function renameGroup(groupId: string, newName: string, groups: GroupInstance[]): GroupInstance[] {
  return groups.map(g => {
    if (g.id === groupId) {
      return { ...g, name: newName };
    }
    return g;
  });
}

/**
 * Rename a group (alias for renameGroup)
 */
export const renameGroupFn = renameGroup;

/**
 * Lock/unlock a group
 */
export function toggleGroupLock(groupId: string, groups: GroupInstance[]): GroupInstance[] {
  return groups.map(g => {
    if (g.id === groupId) {
      return { ...g, locked: !g.locked };
    }
    return g;
  });
}

/**
 * Get group statistics
 */
export function getGroupStats(group: GroupInstance, allModules: PlacedModule[]): {
  moduleCount: number;
  moduleTypes: ModuleType[];
  bounds: Bounds | null;
} {
  const groupModules = allModules.filter(m => group.moduleIds.includes(m.instanceId));
  const moduleTypes = [...new Set(groupModules.map(m => m.type))];

  return {
    moduleCount: groupModules.length,
    moduleTypes,
    bounds: getGroupBounds(groupModules),
  };
}

/**
 * Validate group - check if all modules still exist
 */
export function validateGroup(group: GroupInstance, allModules: PlacedModule[]): boolean {
  const moduleIds = new Set(allModules.map(m => m.instanceId));
  return group.moduleIds.every(id => moduleIds.has(id));
}

/**
 * Clean up invalid groups (groups whose modules no longer exist)
 */
export function cleanupInvalidGroups(groups: GroupInstance[], allModules: PlacedModule[]): GroupInstance[] {
  return groups.filter(g => validateGroup(g, allModules));
}
