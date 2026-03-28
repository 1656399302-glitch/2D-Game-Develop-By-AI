import { PlacedModule, Port } from '../types';

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

export function calculateConnectionPath(
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

  const moduleSizes: Record<string, { width: number; height: number }> = {
    'core-furnace': { width: 100, height: 100 },
    'energy-pipe': { width: 120, height: 50 },
    'gear': { width: 80, height: 80 },
    'rune-node': { width: 80, height: 80 },
    'shield-shell': { width: 100, height: 60 },
    'trigger-switch': { width: 60, height: 100 },
  };

  const sourceSize = moduleSizes[sourceModule.type] || { width: 80, height: 80 };
  const targetSize = moduleSizes[targetModule.type] || { width: 80, height: 80 };

  const sourcePort = sourceModule.ports.find((p) => p.id === sourcePortId);
  const targetPort = targetModule.ports.find((p) => p.id === targetPortId);

  if (!sourcePort || !targetPort) {
    return '';
  }

  const start = getPortWorldPosition(sourceModule, sourcePort, sourceSize.width, sourceSize.height);
  const end = getPortWorldPosition(targetModule, targetPort, targetSize.width, targetSize.height);

  return createBezierPath(start, end);
}

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
