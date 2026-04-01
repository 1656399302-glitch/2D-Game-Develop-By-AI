import { PlacedModule, Connection, Rarity } from '../types';

/**
 * Activation choreographer for sequential BFS-based module activation.
 * 
 * Algorithm:
 * 1. Find all input modules (trigger-switch type)
 * 2. Run BFS from each input module simultaneously
 * 3. Group modules by depth level (distance from nearest input)
 * 4. Sort modules at same depth by insertion order (creation timestamp)
 * 5. Calculate activation times based on depth
 */

export interface ActivationStep {
  moduleId: string;      // instanceId of the module
  depth: number;         // BFS depth (0 = input modules)
  activationTime: number; // ms from activation start
  connectionsToLight: ConnectionLightUp[]; // connections to activate before this module
}

export interface ConnectionLightUp {
  connectionId: string;
  activationTime: number; // ms from activation start
}

export interface ChoreographyResult {
  steps: ActivationStep[];
  totalDuration: number; // Total duration in ms
  depthCount: number;     // Number of depth levels
}

/**
 * Calculate the sequential activation order for all modules using BFS.
 * 
 * @param modules - All placed modules
 * @param connections - All connections
 * @param depthDelay - Delay between depth levels in ms (default: 67ms)
 * @param connectionLeadTime - How long before module activates to light up connections (default: 33ms)
 * @returns ChoreographyResult with activation steps and timing
 */
export function calculateActivationChoreography(
  modules: PlacedModule[],
  connections: Connection[],
  depthDelay: number = 67,
  connectionLeadTime: number = 33
): ChoreographyResult {
  if (modules.length === 0) {
    return { steps: [], totalDuration: 0, depthCount: 0 };
  }

  // Build adjacency map: moduleId -> array of outgoing connections
  const adjacencyMap = new Map<string, { connection: Connection; targetId: string }[]>();
  modules.forEach(m => adjacencyMap.set(m.instanceId, []));
  connections.forEach(conn => {
    const adj = adjacencyMap.get(conn.sourceModuleId);
    if (adj) {
      adj.push({ connection: conn, targetId: conn.targetModuleId });
    }
  });

  // Find all input modules (trigger-switch)
  const inputModules = modules.filter(m => m.type === 'trigger-switch');
  
  // Track visited modules and their depth
  const visited = new Map<string, number>(); // moduleId -> depth
  const modulesAtDepth = new Map<number, string[]>(); // depth -> array of moduleIds
  
  // BFS queue: [moduleId, depth]
  const queue: [string, number][] = [];
  
  // Initialize with input modules at depth 0
  if (inputModules.length > 0) {
    inputModules.forEach(m => {
      visited.set(m.instanceId, 0);
      addToDepthMap(modulesAtDepth, 0, m.instanceId);
      queue.push([m.instanceId, 0]);
    });
  } else {
    // No input modules - all modules activate at T=0
    // Use insertion order as tiebreaker
    modules.forEach((m) => {
      visited.set(m.instanceId, 0);
      addToDepthMap(modulesAtDepth, 0, m.instanceId);
    });
    return buildChoreographyResult(modules, connections, modulesAtDepth, depthDelay, connectionLeadTime);
  }
  
  // BFS traversal
  while (queue.length > 0) {
    const [currentId, currentDepth] = queue.shift()!;
    
    const adj = adjacencyMap.get(currentId) || [];
    for (const { targetId } of adj) {
      if (!visited.has(targetId)) {
        const newDepth = currentDepth + 1;
        visited.set(targetId, newDepth);
        addToDepthMap(modulesAtDepth, newDepth, targetId);
        queue.push([targetId, newDepth]);
      } else {
        // Module already visited - update depth if this path is shorter (for merging paths)
        const existingDepth = visited.get(targetId)!;
        if (currentDepth + 1 < existingDepth) {
          // Remove from old depth
          removeFromDepthMap(modulesAtDepth, existingDepth, targetId);
          // Add to new depth
          visited.set(targetId, currentDepth + 1);
          addToDepthMap(modulesAtDepth, currentDepth + 1, targetId);
        }
      }
    }
  }
  
  // Handle disconnected components - assign depth = maxDepth + 1
  let maxDepth = 0;
  modulesAtDepth.forEach((_, depth) => {
    maxDepth = Math.max(maxDepth, depth);
  });
  
  modules.forEach(m => {
    if (!visited.has(m.instanceId)) {
      visited.set(m.instanceId, maxDepth + 1);
      addToDepthMap(modulesAtDepth, maxDepth + 1, m.instanceId);
    }
  });
  
  return buildChoreographyResult(modules, connections, modulesAtDepth, depthDelay, connectionLeadTime);
}

function addToDepthMap(map: Map<number, string[]>, depth: number, moduleId: string) {
  if (!map.has(depth)) {
    map.set(depth, []);
  }
  map.get(depth)!.push(moduleId);
}

function removeFromDepthMap(map: Map<number, string[]>, depth: number, moduleId: string) {
  const arr = map.get(depth);
  if (arr) {
    const idx = arr.indexOf(moduleId);
    if (idx !== -1) {
      arr.splice(idx, 1);
    }
  }
}

function buildChoreographyResult(
  modules: PlacedModule[],
  connections: Connection[],
  modulesAtDepth: Map<number, string[]>,
  depthDelay: number,
  connectionLeadTime: number
): ChoreographyResult {
  const steps: ActivationStep[] = [];
  const moduleMap = new Map(modules.map(m => [m.instanceId, m]));
  
  // Build connection map for quick lookup
  const incomingConnections = new Map<string, Connection[]>(); // targetId -> connections
  connections.forEach(conn => {
    if (!incomingConnections.has(conn.targetModuleId)) {
      incomingConnections.set(conn.targetModuleId, []);
    }
    incomingConnections.get(conn.targetModuleId)!.push(conn);
  });
  
  // Process each depth level
  const sortedDepths = Array.from(modulesAtDepth.keys()).sort((a, b) => a - b);
  
  sortedDepths.forEach(depth => {
    const modulesAtThisDepth = modulesAtDepth.get(depth) || [];
    const activationTime = depth * depthDelay;
    
    // Sort modules at same depth by insertion order (first to last)
    // Using the order they appear in the modulesAtDepth array
    modulesAtThisDepth.forEach(moduleId => {
      const module = moduleMap.get(moduleId);
      if (!module) return;
      
      // Find connections to light up before this module activates
      const connLightUps: ConnectionLightUp[] = [];
      const incoming = incomingConnections.get(moduleId) || [];
      incoming.forEach(conn => {
        connLightUps.push({
          connectionId: conn.id,
          activationTime: activationTime - connectionLeadTime,
        });
      });
      
      steps.push({
        moduleId,
        depth,
        activationTime,
        connectionsToLight: connLightUps,
      });
    });
  });
  
  // Calculate total duration
  const maxDepth = sortedDepths[sortedDepths.length - 1] || 0;
  const totalDuration = (maxDepth + 1) * depthDelay + 500; // Add 500ms for module animation
  
  return {
    steps,
    totalDuration,
    depthCount: sortedDepths.length,
  };
}

/**
 * Get rarity color for overlay effects
 */
export function getRarityColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#eab308',
  };
  return colors[rarity] || colors.common;
}

/**
 * Get phase text based on progress percentage
 */
export function getPhaseFromProgress(progress: number): { text: string; phase: 'charging' | 'activating' | 'online' } {
  if (progress < 30) {
    return { text: 'CHARGING', phase: 'charging' };
  } else if (progress < 80) {
    return { text: 'ACTIVATING', phase: 'activating' };
  } else {
    return { text: 'ONLINE', phase: 'online' };
  }
}

/**
 * Calculate camera shake offset for a given timestamp
 * Uses smooth random noise for natural-feeling shake
 */
export function calculateShakeOffset(
  timestamp: number,
  magnitude: number,
  duration: number
): { x: number; y: number; isComplete: boolean } {
  const progress = timestamp / duration;
  
  if (progress >= 1) {
    return { x: 0, y: 0, isComplete: true };
  }
  
  // Use sine-based pseudo-random for smooth shake
  const freq1 = 15;
  const freq2 = 23;
  const freq3 = 31;
  
  const x = Math.sin(timestamp * freq1) * magnitude * (1 - progress) +
           Math.sin(timestamp * freq2) * magnitude * 0.5 * (1 - progress) +
           Math.sin(timestamp * freq3) * magnitude * 0.25 * (1 - progress);
  
  const y = Math.cos(timestamp * freq1) * magnitude * (1 - progress) +
           Math.cos(timestamp * freq2) * magnitude * 0.5 * (1 - progress) +
           Math.cos(timestamp * freq3) * magnitude * 0.25 * (1 - progress);
  
  return { x, y, isComplete: false };
}

/**
 * Get pulse wave count based on path length
 */
export function getPulseWaveCount(pathLength: number): number {
  if (pathLength <= 200) {
    return 1;
  } else if (pathLength <= 400) {
    return 2;
  } else {
    return 3;
  }
}

/**
 * Calculate pulse wave duration based on path length
 */
export function getPulseWaveDuration(pathLength: number): number {
  // Speed: 400px/second
  return (pathLength / 400) * 1000; // ms
}
