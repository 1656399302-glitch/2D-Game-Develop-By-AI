/**
 * Circuit Validation Type Definitions
 * 
 * Round 112: Advanced Circuit Validation System
 * Round 156: Enhanced Circuit Validation with Auto-Fix Quick Actions
 * 
 * This module defines all types related to circuit validation,
 * including validation results, error types, warnings, and graph structures.
 */

import { ModuleType, PlacedModule, Connection } from './index';

// ============================================================================
// Validation Error Types
// ============================================================================

/**
 * Error codes for circuit validation failures
 */
export type ValidationErrorType =
  | 'CIRCUIT_INCOMPLETE'      // No core module exists
  | 'LOOP_DETECTED'           // Cycle detected in connection graph
  | 'ISLAND_MODULES'          // Disconnected module groups
  | 'UNREACHABLE_OUTPUT';     // Output modules without input path

/**
 * Error severity levels
 */
export type ValidationSeverity = 'error' | 'warning';

/**
 * Quick fix action types for auto-fixing validation errors
 * Round 156: Auto-Fix Quick Actions
 */
export type QuickFixType =
  | 'ISLAND_MODULES'    // Auto-fix: Remove isolated modules
  | 'UNREACHABLE_OUTPUT' // Auto-fix: Disconnect unreachable outputs
  | 'CIRCUIT_INCOMPLETE'; // Auto-fix: Add default wire from nearest input

/**
 * Represents a quick-fix action that can be applied to resolve a validation error
 * Round 156: Auto-Fix Quick Actions
 */
export interface QuickFixAction {
  /** Unique identifier for this fix */
  id: string;
  /** The type of fix */
  type: QuickFixType;
  /** Human-readable label for the fix button */
  label: string;
  /** Description of what the fix will do */
  description: string;
  /** Affected module/connection IDs that will be modified */
  affectedIds: {
    moduleIds?: string[];
    connectionIds?: string[];
  };
  /** Icon emoji for the fix button */
  icon: string;
  /** Whether this fix is currently executing */
  isExecuting?: boolean;
}

/**
 * Represents a single validation error
 * Round 156: Extended with quickFix action definitions
 */
export interface ValidationError {
  /** Unique error code */
  code: ValidationErrorType;
  /** Human-readable error message */
  message: string;
  /** Affected module instance IDs */
  affectedModuleIds: string[];
  /** Affected connection IDs */
  affectedConnectionIds?: string[];
  /** Suggested fix description */
  fixSuggestion?: string;
  /** Quick-fix action for auto-resolving this error (Round 156) */
  quickFix?: QuickFixAction;
}

/**
 * Represents a single validation warning (non-blocking issues)
 */
export interface ValidationWarning {
  /** Warning code */
  code: string;
  /** Human-readable warning message */
  message: string;
  /** Affected module instance IDs */
  affectedModuleIds: string[];
  /** Suggested action */
  suggestion?: string;
}

// ============================================================================
// Validation Result Types
// ============================================================================

/**
 * Result of complete circuit validation
 */
export interface CircuitValidationResult {
  /** Whether the circuit is valid for activation */
  isValid: boolean;
  /** List of validation errors (blocking issues) */
  errors: ValidationError[];
  /** List of validation warnings (non-blocking issues) */
  warnings: ValidationWarning[];
  /** Detailed analysis data */
  analysis: CircuitAnalysis;
  /** Timestamp of validation */
  validatedAt: number;
}

/**
 * Detailed analysis of the circuit structure
 */
export interface CircuitAnalysis {
  /** Core modules in the circuit */
  coreModules: string[];
  /** Output modules in the circuit */
  outputModules: string[];
  /** Isolated module groups (islands) */
  islands: ModuleIsland[];
  /** Detected cycles in the graph */
  cycles: ModuleCycle[];
  /** Modules that cannot receive energy */
  unreachableModules: string[];
  /** Connection statistics */
  stats: CircuitStats;
}

/**
 * Represents a disconnected group of modules (island)
 */
export interface ModuleIsland {
  /** Unique identifier for this island */
  id: string;
  /** Module instance IDs in this island */
  moduleIds: string[];
  /** Whether this island contains a core */
  hasCore: boolean;
}

/**
 * Represents a cycle in the connection graph
 */
export interface ModuleCycle {
  /** Unique identifier for this cycle */
  id: string;
  /** Module instance IDs forming the cycle */
  moduleIds: string[];
  /** Connection IDs forming the cycle */
  connectionIds: string[];
  /** Cycle length (number of modules) */
  length: number;
}

/**
 * Circuit statistics
 */
export interface CircuitStats {
  /** Total module count */
  totalModules: number;
  /** Total connection count */
  totalConnections: number;
  /** Modules with inputs connected */
  modulesWithInput: number;
  /** Modules with outputs connected */
  modulesWithOutput: number;
  /** Core modules count */
  coreCount: number;
  /** Output modules count */
  outputCount: number;
  /** Whether the circuit is complete (core + outputs) */
  isComplete: boolean;
}

// ============================================================================
// Circuit Graph Types (for path analysis)
// ============================================================================

/**
 * Node in the circuit graph
 */
export interface GraphNode {
  /** Module instance ID */
  moduleId: string;
  /** Module type */
  moduleType: ModuleType;
  /** Input port IDs */
  inputPorts: string[];
  /** Output port IDs */
  outputPorts: string[];
}

/**
 * Edge in the circuit graph (connection between ports)
 */
export interface GraphEdge {
  /** Connection ID */
  connectionId: string;
  /** Source module ID */
  sourceModuleId: string;
  /** Source port ID */
  sourcePortId: string;
  /** Target module ID */
  targetModuleId: string;
  /** Target port ID */
  targetPortId: string;
}

/**
 * Adjacency list representation of the circuit graph
 */
export interface CircuitGraph {
  /** Nodes indexed by module ID */
  nodes: Map<string, GraphNode>;
  /** Edges indexed by connection ID */
  edges: Map<string, GraphEdge>;
  /** Adjacency list: moduleId -> [targetModuleId, ...] */
  adjacencyList: Map<string, string[]>;
  /** Reverse adjacency list: moduleId -> [sourceModuleId, ...] */
  reverseAdjacencyList: Map<string, string[]>;
}

/**
 * Build a graph from modules and connections
 */
export function buildCircuitGraph(
  modules: PlacedModule[],
  connections: Connection[]
): CircuitGraph {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();
  const adjacencyList = new Map<string, string[]>();
  const reverseAdjacencyList = new Map<string, string[]>();

  // Build nodes
  for (const module of modules) {
    nodes.set(module.instanceId, {
      moduleId: module.instanceId,
      moduleType: module.type,
      inputPorts: module.ports.filter(p => p.type === 'input').map(p => p.id),
      outputPorts: module.ports.filter(p => p.type === 'output').map(p => p.id),
    });
    adjacencyList.set(module.instanceId, []);
    reverseAdjacencyList.set(module.instanceId, []);
  }

  // Build edges and adjacency lists
  for (const connection of connections) {
    edges.set(connection.id, {
      connectionId: connection.id,
      sourceModuleId: connection.sourceModuleId,
      sourcePortId: connection.sourcePortId,
      targetModuleId: connection.targetModuleId,
      targetPortId: connection.targetPortId,
    });

    // Update adjacency list
    const neighbors = adjacencyList.get(connection.sourceModuleId);
    if (neighbors) {
      neighbors.push(connection.targetModuleId);
    }

    // Update reverse adjacency list
    const sources = reverseAdjacencyList.get(connection.targetModuleId);
    if (sources) {
      sources.push(connection.sourceModuleId);
    }
  }

  return {
    nodes,
    edges,
    adjacencyList,
    reverseAdjacencyList,
  };
}

// ============================================================================
// Validation Error Messages
// ============================================================================

/**
 * Error messages for validation failures
 */
export const VALIDATION_ERROR_MESSAGES: Record<ValidationErrorType, string> = {
  'CIRCUIT_INCOMPLETE': '缺少核心模块：电路必须包含至少一个核心炉心才能激活',
  'LOOP_DETECTED': '检测到能量回路：存在循环连接，能量无法正常流动',
  'ISLAND_MODULES': '存在孤立模块：部分模块未连接到能量网络',
  'UNREACHABLE_OUTPUT': '输出模块无能量输入：输出法阵无法接收能量',
};

/**
 * Fix suggestions for validation errors
 */
export const VALIDATION_FIX_SUGGESTIONS: Record<ValidationErrorType, string> = {
  'CIRCUIT_INCOMPLETE': '从模块面板拖入一个核心炉心 (Core Furnace) 到画布上',
  'LOOP_DETECTED': '移除形成循环的连接之一，或调整模块布局',
  'ISLAND_MODULES': '将孤立模块通过管道连接到能量网络',
  'UNREACHABLE_OUTPUT': '确保输出模块之前有核心或其他模块提供能量',
};

/**
 * Warning messages for validation
 */
export const VALIDATION_WARNING_MESSAGES: Record<string, string> = {
  'NO_CONNECTIONS': '电路中没有任何连接',
  'SINGLE_MODULE': '电路中只有一个模块',
  'NO_OUTPUTS': '电路中没有输出模块',
  'UNSTABLE_LAYOUT': '模块布局可能导致能量不稳定',
};

/**
 * Module types that are considered "core" (energy sources)
 */
export const CORE_MODULE_TYPES: ModuleType[] = [
  'core-furnace',
  'inferno-blazing-core',
];

/**
 * Module types that are considered "output" (energy sinks)
 */
export const OUTPUT_MODULE_TYPES: ModuleType[] = [
  'output-array',
  'trigger-switch',
];

/**
 * Module types that are considered "passive" (no energy input/output)
 */
export const PASSIVE_MODULE_TYPES: ModuleType[] = [
  'gear',
  'shield-shell',
  'void-arcane-gear',
];

/**
 * Check if a module type is a core (energy source)
 */
export function isCoreModule(moduleType: ModuleType): boolean {
  return CORE_MODULE_TYPES.includes(moduleType);
}

/**
 * Check if a module type is an output (energy sink)
 */
export function isOutputModule(moduleType: ModuleType): boolean {
  return OUTPUT_MODULE_TYPES.includes(moduleType);
}

/**
 * Check if a module type is passive (no energy flow)
 */
export function isPassiveModule(moduleType: ModuleType): boolean {
  return PASSIVE_MODULE_TYPES.includes(moduleType);
}

/**
 * Check if a module type has ports for connections
 */
export function canBeConnected(moduleType: ModuleType): boolean {
  return !isPassiveModule(moduleType);
}

/**
 * Error types that support auto-fix (Round 156)
 */
export const FIXABLE_ERROR_TYPES: ValidationErrorType[] = [
  'ISLAND_MODULES',
  'UNREACHABLE_OUTPUT',
  'CIRCUIT_INCOMPLETE',
];

/**
 * Check if an error type supports auto-fix (Round 156)
 */
export function isFixableError(errorCode: ValidationErrorType): boolean {
  return FIXABLE_ERROR_TYPES.includes(errorCode);
}

/**
 * Quick fix button labels and descriptions (Round 156)
 */
export const QUICK_FIX_LABELS: Record<QuickFixType, { label: string; description: string; icon: string }> = {
  'ISLAND_MODULES': {
    label: '快速修复',
    description: '删除孤立模块',
    icon: '🗑️',
  },
  'UNREACHABLE_OUTPUT': {
    label: '快速修复',
    description: '断开无法到达的输出',
    icon: '✂️',
  },
  'CIRCUIT_INCOMPLETE': {
    label: '快速修复',
    description: '添加默认连接',
    icon: '⚡',
  },
};
