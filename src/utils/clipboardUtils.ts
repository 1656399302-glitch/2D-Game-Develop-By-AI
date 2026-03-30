import { v4 as uuidv4 } from 'uuid';
import { PlacedModule, Connection, ModuleType, Port } from '../types';
import { MODULE_SIZES, MODULE_PORT_CONFIGS } from '../types';
import { calculateConnectionPath } from './connectionEngine';

/**
 * Clipboard data structure for storing copied modules and connections
 */
export interface ClipboardData {
  modules: PlacedModule[];
  connections: Connection[];
  copiedAt: number;
}

/**
 * Point interface for positioning
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Bounds interface for group calculations
 */
export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Calculate the bounding box of a set of modules
 */
export function calculateBounds(modules: PlacedModule[]): Bounds | null {
  if (modules.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  modules.forEach((module) => {
    const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
    minX = Math.min(minX, module.x);
    minY = Math.min(minY, module.y);
    maxX = Math.max(maxX, module.x + size.width);
    maxY = Math.max(maxY, module.y + size.height);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Get the center point of a set of modules
 */
export function getCenterPoint(modules: PlacedModule[]): Point | null {
  const bounds = calculateBounds(modules);
  if (!bounds) return null;
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
}

/**
 * Copy modules to clipboard
 * @param moduleIds - Array of module instance IDs to copy
 * @param allModules - All modules in the store
 * @param allConnections - All connections in the store
 * @returns ClipboardData containing copied modules and connections
 */
export function copyModules(
  moduleIds: string[],
  allModules: PlacedModule[],
  allConnections: Connection[]
): ClipboardData {
  if (moduleIds.length === 0) {
    // Copy all modules if none selected
    return {
      modules: allModules.map(m => ({ ...m, ports: [...m.ports.map(p => ({ ...p }))] })),
      connections: allConnections.map(c => ({ ...c })),
      copiedAt: Date.now(),
    };
  }

  const moduleSet = new Set(moduleIds);
  const copiedModules = allModules
    .filter(m => moduleSet.has(m.instanceId))
    .map(m => ({
      ...m,
      ports: m.ports.map(p => ({ ...p })),
    }));

  const copiedConnections = allConnections
    .filter(c => moduleSet.has(c.sourceModuleId) || moduleSet.has(c.targetModuleId))
    .map(c => ({ ...c }));

  return {
    modules: copiedModules,
    connections: copiedConnections,
    copiedAt: Date.now(),
  };
}

/**
 * Get default ports for a module type
 */
function getDefaultPorts(type: ModuleType, moduleId: string): Port[] {
  const config = MODULE_PORT_CONFIGS[type];
  if (!config) {
    return [
      { id: `${moduleId}-input-0`, type: 'input', position: { x: 25, y: 40 } },
      { id: `${moduleId}-output-0`, type: 'output', position: { x: 75, y: 40 } },
    ];
  }
  
  const ports: Port[] = [];
  const inputConfig = config.input;
  if (Array.isArray(inputConfig)) {
    inputConfig.forEach((pos, idx) => {
      ports.push({ id: `${moduleId}-input-${idx}`, type: 'input', position: pos });
    });
  } else {
    ports.push({ id: `${moduleId}-input-0`, type: 'input', position: inputConfig });
  }
  
  const outputConfig = config.output;
  if (Array.isArray(outputConfig)) {
    outputConfig.forEach((pos, idx) => {
      ports.push({ id: `${moduleId}-output-${idx}`, type: 'output', position: pos });
    });
  } else {
    ports.push({ id: `${moduleId}-output-0`, type: 'output', position: outputConfig });
  }
  
  return ports;
}

/**
 * Paste modules from clipboard at a new position
 * @param clipboard - The clipboard data to paste
 * @param position - The target position (usually cursor position)
 * @param allModules - All modules currently on canvas (for connection path calculation)
 * @param pasteOffset - Additional offset from the original position (default: 30px)
 * @returns Array of newly created module instances
 */
export function pasteModules(
  clipboard: ClipboardData,
  position: Point,
  allModules: PlacedModule[],
  pasteOffset: number = 30
): { modules: PlacedModule[]; connections: Connection[] } {
  if (clipboard.modules.length === 0) {
    return { modules: [], connections: [] };
  }

  // Calculate the offset from original position
  const originalCenter = getCenterPoint(clipboard.modules);
  if (!originalCenter) {
    return { modules: [], connections: [] };
  }

  const offsetX = position.x - originalCenter.x + pasteOffset;
  const offsetY = position.y - originalCenter.y + pasteOffset;

  // Create ID mapping for modules and connections
  const idMapping = new Map<string, string>();
  clipboard.modules.forEach(m => {
    idMapping.set(m.instanceId, uuidv4());
  });

  // Create new modules with new IDs and positions
  const newModules: PlacedModule[] = clipboard.modules.map(m => {
    const newInstanceId = idMapping.get(m.instanceId)!;
    return {
      ...m,
      id: uuidv4(),
      instanceId: newInstanceId,
      x: m.x + offsetX,
      y: m.y + offsetY,
      ports: getDefaultPorts(m.type, newInstanceId),
    };
  });

  // Create new connections with updated module references
  const newConnections: Connection[] = clipboard.connections
    .filter(c => {
      // Only include connections where both modules are in the clipboard
      return idMapping.has(c.sourceModuleId) && idMapping.has(c.targetModuleId);
    })
    .map(c => {
      const newConnection: Connection = {
        id: uuidv4(),
        sourceModuleId: idMapping.get(c.sourceModuleId)!,
        sourcePortId: c.sourcePortId,
        targetModuleId: idMapping.get(c.targetModuleId)!,
        targetPortId: c.targetPortId,
        pathData: '',
      };

      // Calculate path data using the new module positions
      const allNewModules = [...allModules, ...newModules];
      newConnection.pathData = calculateConnectionPath(
        allNewModules,
        newConnection.sourceModuleId,
        newConnection.sourcePortId,
        newConnection.targetModuleId,
        newConnection.targetPortId
      );

      return newConnection;
    });

  return { modules: newModules, connections: newConnections };
}

/**
 * Duplicate modules at an offset from their original position
 * @param moduleIds - Array of module instance IDs to duplicate
 * @param allModules - All modules in the store
 * @param allConnections - All connections in the store
 * @param duplicateOffset - Offset for the duplicated modules (default: 20px)
 * @returns Array of newly created module instances
 */
export function duplicateModules(
  moduleIds: string[],
  allModules: PlacedModule[],
  allConnections: Connection[],
  duplicateOffset: number = 20
): { modules: PlacedModule[]; connections: Connection[] } {
  if (moduleIds.length === 0) {
    return { modules: [], connections: [] };
  }

  const moduleSet = new Set(moduleIds);

  // Get modules to duplicate
  const modulesToDuplicate = allModules.filter(m => moduleSet.has(m.instanceId));
  if (modulesToDuplicate.length === 0) {
    return { modules: [], connections: [] };
  }

  // Calculate bounds to determine center offset
  const bounds = calculateBounds(modulesToDuplicate);
  if (!bounds) {
    return { modules: [], connections: [] };
  }

  // Create ID mapping
  const idMapping = new Map<string, string>();
  modulesToDuplicate.forEach(m => {
    idMapping.set(m.instanceId, uuidv4());
  });

  // Create new modules
  const newModules: PlacedModule[] = modulesToDuplicate.map(m => {
    const newInstanceId = idMapping.get(m.instanceId)!;
    return {
      ...m,
      id: uuidv4(),
      instanceId: newInstanceId,
      x: m.x + duplicateOffset,
      y: m.y + duplicateOffset,
      ports: getDefaultPorts(m.type, newInstanceId),
    };
  });

  // Get connections that only involve the selected modules
  const newConnections: Connection[] = allConnections
    .filter(c => moduleSet.has(c.sourceModuleId) && moduleSet.has(c.targetModuleId))
    .map(c => {
      const newConnection: Connection = {
        id: uuidv4(),
        sourceModuleId: idMapping.get(c.sourceModuleId)!,
        sourcePortId: c.sourcePortId,
        targetModuleId: idMapping.get(c.targetModuleId)!,
        targetPortId: c.targetPortId,
        pathData: '',
      };

      // Calculate path data
      const allNewModules = [...allModules, ...newModules];
      newConnection.pathData = calculateConnectionPath(
        allNewModules,
        newConnection.sourceModuleId,
        newConnection.sourcePortId,
        newConnection.targetModuleId,
        newConnection.targetPortId
      );

      return newConnection;
    });

  return { modules: newModules, connections: newConnections };
}

/**
 * Validate clipboard data integrity
 */
export function validateClipboard(clipboard: ClipboardData): boolean {
  if (!clipboard || !Array.isArray(clipboard.modules) || !Array.isArray(clipboard.connections)) {
    return false;
  }

  // Check that each module has required properties
  for (const module of clipboard.modules) {
    if (!module.instanceId || !module.type || typeof module.x !== 'number' || typeof module.y !== 'number') {
      return false;
    }
  }

  return true;
}

/**
 * Check if clipboard is empty
 */
export function isClipboardEmpty(clipboard: ClipboardData | null): boolean {
  return !clipboard || clipboard.modules.length === 0;
}

/**
 * Get clipboard summary for UI display
 */
export function getClipboardSummary(clipboard: ClipboardData): string {
  if (clipboard.modules.length === 0) {
    return '空';
  }
  
  const moduleCount = clipboard.modules.length;
  const connectionCount = clipboard.connections.length;
  const timeAgo = Math.round((Date.now() - clipboard.copiedAt) / 1000);
  
  return `${moduleCount} 模块, ${connectionCount} 连接 (${timeAgo}s前复制)`;
}
