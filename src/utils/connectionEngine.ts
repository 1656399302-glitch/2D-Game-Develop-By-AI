import { PlacedModule, Port, MODULE_SIZES } from '../types';

/**
 * Connection Path Engine
 * P0: AC2 - Fix connection path rendering when modules are repositioned
 * 
 * This module handles all connection path calculations and memoization
 * to ensure paths update correctly when modules are moved.
 */

// Memoization cache for path calculations
const pathCache = new Map<string, string>();
const CACHE_MAX_SIZE = 1000;

/**
 * Generate a cache key for path calculation
 */
function getPathCacheKey(
  modules: PlacedModule[],
  sourceModuleId: string,
  sourcePortId: string,
  targetModuleId: string,
  targetPortId: string
): string {
  // Create a unique key based on module positions and port IDs
  const modulePositions = modules
    .filter(m => m.instanceId === sourceModuleId || m.instanceId === targetModuleId)
    .map(m => `${m.instanceId}:${m.x},${m.y}:${m.rotation}`)
    .join('|');
  
  return `${sourceModuleId}:${sourcePortId}:${targetModuleId}:${targetPortId}:${modulePositions}`;
}

/**
 * Clear path cache for a specific module
 * Called when a module is moved to invalidate stale paths
 */
export function clearPathCacheForModule(moduleId: string): void {
  const keysToDelete: string[] = [];
  
  pathCache.forEach((_, key) => {
    if (key.includes(moduleId)) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => pathCache.delete(key));
}

/**
 * Clear all path caches
 * Called when significant changes occur
 */
export function clearAllPathCaches(): void {
  pathCache.clear();
}

/**
 * Get cached path or calculate and cache it
 */
function getCachedPath(
  modules: PlacedModule[],
  sourceModuleId: string,
  sourcePortId: string,
  targetModuleId: string,
  targetPortId: string
): string {
  const cacheKey = getPathCacheKey(modules, sourceModuleId, sourcePortId, targetModuleId, targetPortId);
  
  // Check cache first
  const cached = pathCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Calculate path
  const path = calculatePathInternal(modules, sourceModuleId, sourcePortId, targetModuleId, targetPortId);
  
  // Cache the result (with size limit)
  if (pathCache.size >= CACHE_MAX_SIZE) {
    // Clear oldest entries (first 25%)
    const keys = Array.from(pathCache.keys());
    for (let i = 0; i < Math.floor(CACHE_MAX_SIZE / 4); i++) {
      pathCache.delete(keys[i]);
    }
  }
  
  pathCache.set(cacheKey, path);
  return path;
}

/**
 * Get port world position considering module rotation
 * P0: AC2 - Core function for path calculation
 */
export function getPortWorldPosition(
  module: PlacedModule,
  port: Port,
  width: number,
  height: number
): { x: number; y: number } {
  // Apply rotation to port position
  const angle = (module.rotation * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  
  // Calculate center offset
  const cx = width / 2;
  const cy = height / 2;
  
  // Port position relative to center
  const px = port.position.x - cx;
  const py = port.position.y - cy;
  
  // Rotate point around center
  const rx = px * cos - py * sin;
  const ry = px * sin + py * cos;
  
  // Add module position and center back
  return {
    x: module.x + cx + rx,
    y: module.y + cy + ry,
  };
}

/**
 * Calculate path between two ports on modules
 * P0: AC2 - Path recalculation on module position change
 */
export function calculateConnectionPath(
  modules: PlacedModule[],
  sourceModuleId: string,
  sourcePortId: string,
  targetModuleId: string,
  targetPortId: string
): string {
  return getCachedPath(modules, sourceModuleId, sourcePortId, targetModuleId, targetPortId);
}

/**
 * Internal path calculation (non-cached)
 */
function calculatePathInternal(
  modules: PlacedModule[],
  sourceModuleId: string,
  sourcePortId: string,
  targetModuleId: string,
  targetPortId: string
): string {
  const sourceModule = modules.find((m) => m.instanceId === sourceModuleId);
  const targetModule = modules.find((m) => m.instanceId === targetModuleId);

  if (!sourceModule || !targetModule) {
    return '';
  }

  const sourceSize = MODULE_SIZES[sourceModule.type] || { width: 80, height: 80 };
  const targetSize = MODULE_SIZES[targetModule.type] || { width: 80, height: 80 };

  const sourcePort = sourceModule.ports.find((p) => p.id === sourcePortId);
  const targetPort = targetModule.ports.find((p) => p.id === targetPortId);

  if (!sourcePort || !targetPort) {
    return '';
  }

  const start = getPortWorldPosition(sourceModule, sourcePort, sourceSize.width, sourceSize.height);
  const end = getPortWorldPosition(targetModule, targetPort, targetSize.width, targetSize.height);

  return createBezierPath(start, end);
}

/**
 * Create a bezier curve path between two points
 */
function createBezierPath(start: { x: number; y: number }, end: { x: number; y: number }): string {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Control point offset - more curve for longer distances
  const controlOffset = Math.min(distance * 0.5, 100);
  
  // Determine curve direction based on relative positions
  let cp1x = start.x + controlOffset;
  let cp1y = start.y;
  let cp2x = end.x - controlOffset;
  let cp2y = end.y;
  
  // If start is to the right of end, curve vertically
  if (dx < 0) {
    cp1x = start.x;
    cp1y = start.y + controlOffset;
    cp2x = end.x;
    cp2y = end.y - controlOffset;
  }
  
  return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
}

/**
 * Recalculate all connection paths for a specific module
 * P0: AC2 - Fix for ghost/stale paths when module is moved
 */
export function updatePathsForModule(
  modules: PlacedModule[],
  connections: Array<{
    id: string;
    sourceModuleId: string;
    sourcePortId: string;
    targetModuleId: string;
    targetPortId: string;
    pathData: string;
  }>,
  movedModuleId: string
): Array<{ id: string; pathData: string }> {
  // Clear cache for the moved module
  clearPathCacheForModule(movedModuleId);
  
  // Recalculate only affected paths
  const updatedPaths: Array<{ id: string; pathData: string }> = [];
  
  connections.forEach((conn) => {
    if (conn.sourceModuleId === movedModuleId || conn.targetModuleId === movedModuleId) {
      const newPath = calculateConnectionPath(
        modules,
        conn.sourceModuleId,
        conn.sourcePortId,
        conn.targetModuleId,
        conn.targetPortId
      );
      
      updatedPaths.push({
        id: conn.id,
        pathData: newPath,
      });
    }
  });
  
  return updatedPaths;
}

/**
 * Recalculate all connection paths
 * P0: AC2 - Full path recalculation
 */
export function recalculateAllPaths(
  modules: PlacedModule[],
  connections: Array<{
    id: string;
    sourceModuleId: string;
    sourcePortId: string;
    targetModuleId: string;
    targetPortId: string;
  }>
): Array<{ id: string; pathData: string }> {
  // Clear all caches
  clearAllPathCaches();
  
  // Recalculate all paths
  return connections.map((conn) => ({
    id: conn.id,
    pathData: calculateConnectionPath(
      modules,
      conn.sourceModuleId,
      conn.sourcePortId,
      conn.targetModuleId,
      conn.targetPortId
    ),
  }));
}

/**
 * Validate a connection between modules
 */
export function validateConnection(
  modules: PlacedModule[],
  sourceModuleId: string,
  sourcePortId: string,
  targetModuleId: string,
  targetPortId: string
): { valid: boolean; error?: string } {
  if (sourceModuleId === targetModuleId) {
    return { valid: false, error: 'Cannot connect module to itself' };
  }

  const sourceModule = modules.find((m) => m.instanceId === sourceModuleId);
  const targetModule = modules.find((m) => m.instanceId === targetModuleId);

  if (!sourceModule || !targetModule) {
    return { valid: false, error: 'Module not found' };
  }

  const sourcePort = sourceModule.ports.find((p) => p.id === sourcePortId);
  const targetPort = targetModule.ports.find((p) => p.id === targetPortId);

  if (!sourcePort || !targetPort) {
    return { valid: false, error: 'Port not found' };
  }

  if (sourcePort.type === targetPort.type) {
    return { valid: false, error: 'Cannot connect same port types' };
  }

  return { valid: true };
}

/**
 * Get connection flow order using BFS
 */
export function getConnectionFlowOrder(
  modules: PlacedModule[],
  connections: { sourceModuleId: string; targetModuleId: string }[]
): string[] {
  // Find the core furnace or first module
  const coreModule = modules.find((m) => m.type === 'core-furnace');
  const startModuleId = coreModule?.instanceId || modules[0]?.instanceId;
  
  if (!startModuleId) return [];

  // Build adjacency list
  const adjacency = new Map<string, string[]>();
  modules.forEach((m) => adjacency.set(m.instanceId, []));
  
  connections.forEach((conn) => {
    const targets = adjacency.get(conn.sourceModuleId);
    if (targets) {
      targets.push(conn.targetModuleId);
    }
  });

  // BFS to get order
  const visited = new Set<string>();
  const order: string[] = [];
  const queue: string[] = [startModuleId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    
    visited.add(current);
    order.push(current);
    
    const neighbors = adjacency.get(current) || [];
    neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    });
  }

  // Add any unvisited modules
  modules.forEach((m) => {
    if (!visited.has(m.instanceId)) {
      order.push(m.instanceId);
    }
  });

  return order;
}

/**
 * Check if a connection already exists
 */
export function connectionExists(
  connections: Array<{
    sourceModuleId: string;
    sourcePortId: string;
    targetModuleId: string;
    targetPortId: string;
  }>,
  sourceModuleId: string,
  sourcePortId: string,
  targetModuleId: string,
  targetPortId: string
): boolean {
  return connections.some(
    (c) =>
      (c.sourceModuleId === sourceModuleId && c.sourcePortId === sourcePortId &&
       c.targetModuleId === targetModuleId && c.targetPortId === targetPortId) ||
      (c.sourceModuleId === targetModuleId && c.sourcePortId === targetPortId &&
       c.targetModuleId === sourceModuleId && c.targetPortId === sourcePortId)
  );
}

/**
 * Get all connections for a specific module
 */
export function getModuleConnections(
  connections: Array<{
    id: string;
    sourceModuleId: string;
    targetModuleId: string;
  }>,
  moduleId: string
): Array<{ id: string; sourceModuleId: string; targetModuleId: string }> {
  return connections.filter(
    (c) => c.sourceModuleId === moduleId || c.targetModuleId === moduleId
  );
}

/**
 * Get connection stats for debugging
 */
export function getConnectionStats(): { cacheSize: number; maxSize: number } {
  return {
    cacheSize: pathCache.size,
    maxSize: CACHE_MAX_SIZE,
  };
}
