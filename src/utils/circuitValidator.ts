/**
 * Circuit Validator Utility
 * 
 * Round 112: Advanced Circuit Validation System
 * 
 * This module provides functions for validating machine circuits,
 * detecting cycles, finding islands, and tracing energy flow.
 */

import {
  PlacedModule,
  Connection,
} from '../types';
import {
  CircuitValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationErrorType,
  CircuitAnalysis,
  ModuleIsland,
  ModuleCycle,
  CircuitStats,
  CircuitGraph,
  buildCircuitGraph,
  isCoreModule,
  isOutputModule,
  VALIDATION_ERROR_MESSAGES,
  VALIDATION_FIX_SUGGESTIONS,
  VALIDATION_WARNING_MESSAGES,
  CORE_MODULE_TYPES,
  OUTPUT_MODULE_TYPES,
} from '../types/circuitValidation';

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate a circuit for activation readiness
 * 
 * @param modules - Array of placed modules
 * @param connections - Array of connections
 * @returns CircuitValidationResult with errors, warnings, and analysis
 */
export function validateCircuit(
  modules: PlacedModule[],
  connections: Connection[]
): CircuitValidationResult {
  // Empty canvas is valid (no validation needed)
  if (modules.length === 0) {
    return createValidResult({
      coreModules: [],
      outputModules: [],
      islands: [],
      cycles: [],
      unreachableModules: [],
      stats: {
        totalModules: 0,
        totalConnections: 0,
        modulesWithInput: 0,
        modulesWithOutput: 0,
        coreCount: 0,
        outputCount: 0,
        isComplete: false,
      },
    });
  }

  // Build the circuit graph
  const graph = buildCircuitGraph(modules, connections);

  // Collect errors and warnings
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Step 1: Check for core module
  const coreCheck = checkForCoreModule(modules);
  if (!coreCheck.hasCore) {
    errors.push(createError('CIRCUIT_INCOMPLETE', coreCheck.affectedModuleIds));
  }

  // Step 2: Detect cycles
  const cycles = detectCycles(graph);
  if (cycles.length > 0) {
    const affectedIds = cycles.flatMap(c => c.moduleIds);
    errors.push(createError('LOOP_DETECTED', affectedIds, cycles.flatMap(c => c.connectionIds)));
  }

  // Step 3: Find islands (disconnected module groups)
  const islands = findIslands(modules, connections, graph);
  if (islands.length > 1) {
    // Multiple disconnected groups are detected
    // Flag all modules that are part of islands without cores (orphan modules)
    const orphanIslands = islands.filter(island => !island.hasCore);
    
    if (orphanIslands.length > 0) {
      // Some islands don't have cores - flag only the orphan modules
      const affectedIds = orphanIslands.flatMap(island => island.moduleIds);
      errors.push(createError('ISLAND_MODULES', affectedIds));
    }
    // Note: Multiple islands, each with its own core, are considered valid
    // as they represent separate but functional circuits
  }

  // Step 4: Trace energy flow and find unreachable modules
  if (coreCheck.hasCore) {
    const unreachable = findUnreachableOutputs(modules, connections, graph, coreCheck.coreModuleIds);
    if (unreachable.length > 0) {
      errors.push(createError('UNREACHABLE_OUTPUT', unreachable));
    }
  }

  // Generate warnings
  const warningChecks = generateWarnings(modules, connections);
  warnings.push(...warningChecks);

  // Build analysis data
  const analysis: CircuitAnalysis = {
    coreModules: coreCheck.coreModuleIds,
    outputModules: modules.filter(m => isOutputModule(m.type)).map(m => m.instanceId),
    islands,
    cycles,
    unreachableModules: errors
      .filter(e => e.code === 'UNREACHABLE_OUTPUT')
      .flatMap(e => e.affectedModuleIds),
    stats: calculateStats(modules, connections, coreCheck.hasCore),
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    analysis,
    validatedAt: Date.now(),
  };
}

// ============================================================================
// Core Module Detection
// ============================================================================

/**
 * Check if the circuit has at least one core module
 */
function checkForCoreModule(modules: PlacedModule[]): {
  hasCore: boolean;
  coreModuleIds: string[];
  affectedModuleIds: string[];
} {
  const coreModules = modules.filter(m => isCoreModule(m.type));
  const hasCore = coreModules.length > 0;

  return {
    hasCore,
    coreModuleIds: coreModules.map(m => m.instanceId),
    affectedModuleIds: modules.map(m => m.instanceId), // All modules affected
  };
}

// ============================================================================
// Cycle Detection (DFS-based)
// ============================================================================

/**
 * Detect cycles in the connection graph using DFS
 * 
 * @param graph - The circuit graph
 * @returns Array of detected cycles
 */
export function detectCycles(graph: CircuitGraph): ModuleCycle[] {
  const cycles: ModuleCycle[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const parent = new Map<string, string>();
  const nodeStack: string[] = [];

  // Track edges for cycle identification
  const edgeToConnection = new Map<string, string>();
  for (const [connId, edge] of graph.edges) {
    const key = `${edge.sourceModuleId}-${edge.targetModuleId}`;
    edgeToConnection.set(key, connId);
  }

  function dfs(nodeId: string): void {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    nodeStack.push(nodeId);

    const neighbors = graph.adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      // Check for self-loop
      if (neighbor === nodeId) {
        const cycleIds = [...nodeStack, neighbor];
        cycles.push(createCycle(cycleIds, edgeToConnection));
        continue;
      }

      if (!visited.has(neighbor)) {
        parent.set(neighbor, nodeId);
        dfs(neighbor);
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle! Reconstruct it from parent pointers
        const cycleIds: string[] = [neighbor];
        let current = nodeId;
        while (current !== neighbor) {
          cycleIds.push(current);
          current = parent.get(current) || neighbor;
        }
        cycleIds.push(neighbor); // Complete the cycle
        cycles.push(createCycle(cycleIds, edgeToConnection));
      }
    }

    nodeStack.pop();
    recursionStack.delete(nodeId);
  }

  // Run DFS from each unvisited node
  for (const nodeId of graph.nodes.keys()) {
    if (!visited.has(nodeId)) {
      dfs(nodeId);
    }
  }

  // Deduplicate cycles (same cycle may be found multiple times)
  return deduplicateCycles(cycles);
}

/**
 * Create a ModuleCycle from a list of module IDs
 */
function createCycle(
  moduleIds: string[],
  edgeToConnection: Map<string, string>
): ModuleCycle {
  const connectionIds: string[] = [];
  
  // Build connection IDs from module sequence
  for (let i = 0; i < moduleIds.length - 1; i++) {
    const source = moduleIds[i];
    const target = moduleIds[i + 1];
    const connId = edgeToConnection.get(`${source}-${target}`);
    if (connId) {
      connectionIds.push(connId);
    }
  }

  return {
    id: `cycle-${moduleIds.join('-')}`,
    moduleIds: [...new Set(moduleIds)], // Remove duplicates
    connectionIds,
    length: moduleIds.length - 1,
  };
}

/**
 * Remove duplicate cycles from the result
 */
function deduplicateCycles(cycles: ModuleCycle[]): ModuleCycle[] {
  const seen = new Set<string>();
  return cycles.filter(cycle => {
    const normalized = [...cycle.moduleIds].sort().join('-');
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

// ============================================================================
// Island Detection (Disconnected Module Groups)
// ============================================================================

/**
 * Find disconnected module groups (islands) in the circuit
 * 
 * @param modules - Array of placed modules
 * @param connections - Array of connections
 * @param graph - The circuit graph
 * @returns Array of detected islands
 */
export function findIslands(
  modules: PlacedModule[],
  _connections: Connection[],
  graph: CircuitGraph
): ModuleIsland[] {
  // If no connections, each module is its own island
  if (modules.length > 0 && graph.edges.size === 0) {
    return modules.map((m, index) => ({
      id: `island-${index}`,
      moduleIds: [m.instanceId],
      hasCore: isCoreModule(m.type),
    }));
  }

  const visited = new Set<string>();
  const islands: ModuleIsland[] = [];

  function bfs(startModuleId: string): ModuleIsland {
    const queue = [startModuleId];
    const moduleIds: string[] = [];
    let hasCore = false;

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      moduleIds.push(current);

      const node = graph.nodes.get(current);
      if (node && isCoreModule(node.moduleType)) {
        hasCore = true;
      }

      // Add connected modules
      const neighbors = graph.adjacencyList.get(current) || [];
      const reverseNeighbors = graph.reverseAdjacencyList.get(current) || [];
      
      for (const neighbor of [...neighbors, ...reverseNeighbors]) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }

    return {
      id: `island-${islands.length}`,
      moduleIds,
      hasCore,
    };
  }

  // Find all connected components
  for (const module of modules) {
    if (!visited.has(module.instanceId)) {
      const island = bfs(module.instanceId);
      islands.push(island);
    }
  }

  return islands;
}

// ============================================================================
// Energy Flow Tracing
// ============================================================================

/**
 * Trace energy flow from core modules through the circuit
 * 
 * @param sourceModuleIds - IDs of source (core) modules
 * @param graph - The circuit graph
 * @returns Set of module IDs that can receive energy
 */
export function traceEnergyFlow(
  sourceModuleIds: string[],
  graph: CircuitGraph
): Set<string> {
  const reachable = new Set<string>();
  const queue = [...sourceModuleIds];

  // Add source modules to reachable
  for (const id of sourceModuleIds) {
    reachable.add(id);
  }

  // BFS through the graph
  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = graph.adjacencyList.get(current) || [];

    for (const neighbor of neighbors) {
      if (!reachable.has(neighbor)) {
        reachable.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return reachable;
}

/**
 * Find output modules that cannot receive energy from any core
 * 
 * @param modules - Array of placed modules
 * @param connections - Array of connections
 * @param graph - The circuit graph
 * @param coreModuleIds - IDs of core modules
 * @returns Array of unreachable output module IDs
 */
export function findUnreachableOutputs(
  modules: PlacedModule[],
  _connections: Connection[],
  graph: CircuitGraph,
  coreModuleIds: string[]
): string[] {
  // If no cores, all outputs are unreachable
  if (coreModuleIds.length === 0) {
    return modules
      .filter(m => isOutputModule(m.type))
      .map(m => m.instanceId);
  }

  // Trace energy flow from cores
  const reachable = traceEnergyFlow(coreModuleIds, graph);

  // Find outputs that are not reachable
  const unreachableOutputs = modules
    .filter(m => isOutputModule(m.type) && !reachable.has(m.instanceId))
    .map(m => m.instanceId);

  return unreachableOutputs;
}

// ============================================================================
// Statistics Calculation
// ============================================================================

/**
 * Calculate circuit statistics
 */
function calculateStats(
  modules: PlacedModule[],
  connections: Connection[],
  hasCore: boolean
): CircuitStats {
  // Count modules with input connections
  const modulesWithInput = new Set<string>();
  const modulesWithOutput = new Set<string>();

  for (const conn of connections) {
    modulesWithOutput.add(conn.sourceModuleId);
    modulesWithInput.add(conn.targetModuleId);
  }

  const coreCount = modules.filter(m => isCoreModule(m.type)).length;
  const outputCount = modules.filter(m => isOutputModule(m.type)).length;

  return {
    totalModules: modules.length,
    totalConnections: connections.length,
    modulesWithInput: modulesWithInput.size,
    modulesWithOutput: modulesWithOutput.size,
    coreCount,
    outputCount,
    isComplete: hasCore && outputCount > 0,
  };
}

// ============================================================================
// Warning Generation
// ============================================================================

/**
 * Generate validation warnings
 */
function generateWarnings(
  modules: PlacedModule[],
  connections: Connection[]
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // No connections warning
  if (connections.length === 0 && modules.length > 1) {
    warnings.push({
      code: 'NO_CONNECTIONS',
      message: VALIDATION_WARNING_MESSAGES['NO_CONNECTIONS'],
      affectedModuleIds: modules.map(m => m.instanceId),
      suggestion: '使用管道连接模块以创建能量流动路径',
    });
  }

  // Single module warning
  if (modules.length === 1 && !isCoreModule(modules[0].type)) {
    warnings.push({
      code: 'SINGLE_MODULE',
      message: '电路中只有一个模块',
      affectedModuleIds: [modules[0].instanceId],
      suggestion: '添加更多模块以构建完整的机器',
    });
  }

  // No outputs warning
  const hasOutput = modules.some(m => isOutputModule(m.type));
  if (!hasOutput && modules.length > 0) {
    warnings.push({
      code: 'NO_OUTPUTS',
      message: VALIDATION_WARNING_MESSAGES['NO_OUTPUTS'],
      affectedModuleIds: modules.map(m => m.instanceId),
      suggestion: '添加输出法阵以使机器能够输出能量',
    });
  }

  return warnings;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a validation error
 */
function createError(
  code: ValidationErrorType,
  affectedModuleIds: string[],
  affectedConnectionIds?: string[]
): ValidationError {
  return {
    code,
    message: VALIDATION_ERROR_MESSAGES[code],
    affectedModuleIds,
    affectedConnectionIds,
    fixSuggestion: VALIDATION_FIX_SUGGESTIONS[code],
  };
}

/**
 * Create a valid validation result
 */
function createValidResult(analysis: CircuitAnalysis): CircuitValidationResult {
  return {
    isValid: true,
    errors: [],
    warnings: [],
    analysis,
    validatedAt: Date.now(),
  };
}

// ============================================================================
// Export for testing
// ============================================================================

export {
  CORE_MODULE_TYPES,
  OUTPUT_MODULE_TYPES,
};
