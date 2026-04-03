/**
 * Connection Type Definitions
 * 
 * Round 111: Energy Connection System + Module Animation Hooks
 * 
 * This module defines all types related to energy connections between modules,
 * including connection points, connection states, and animation configurations.
 */

import { ModuleType, Connection as StoreConnection } from './index';

// ============================================================================
// Re-export the store connection type for compatibility
// ============================================================================
export type Connection = StoreConnection;

// ============================================================================
// Connection Point Types
// ============================================================================

/**
 * Port type for connection points
 */
export type PortType = 'input' | 'output';

/**
 * Connection point interface representing a port on a module where
 * energy can flow in or out
 */
export interface ConnectionPoint {
  /** Unique identifier for this connection point */
  id: string;
  /** The module instance this point belongs to */
  moduleId: string;
  /** The module type (for default point definitions) */
  moduleType: ModuleType;
  /** Type of port: input receives energy, output sends energy */
  type: PortType;
  /** Position relative to module center (0-100 percentage) */
  relativePosition: { x: number; y: number };
  /** Whether this point is currently connected */
  isConnected: boolean;
  /** Optional label for the port */
  label?: string;
}

/**
 * Create a connection point with default values
 */
export function createConnectionPoint(
  moduleId: string,
  moduleType: ModuleType,
  type: PortType,
  relativePosition: { x: number; y: number },
  label?: string
): ConnectionPoint {
  return {
    id: `${moduleId}-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    moduleId,
    moduleType,
    type,
    relativePosition,
    isConnected: false,
    label,
  };
}

// ============================================================================
// Connection State Types (for enhanced connection tracking)
// ============================================================================

/**
 * Connection state enum representing the energy flow state
 */
export type ConnectionState = 'idle' | 'charging' | 'active' | 'overload' | 'broken';

/**
 * Energy flow direction through a connection
 */
export type EnergyFlowDirection = 'forward' | 'reverse';

/**
 * Extended connection interface with state tracking
 */
export interface EnhancedConnection extends Connection {
  /** Current energy flow state */
  state: ConnectionState;
  /** Energy flow rate (0-1) */
  energyFlow: number;
  /** Direction of energy flow */
  direction: EnergyFlowDirection;
  /** When this connection was created */
  createdAt: number;
}

// ============================================================================
// Connection Point Definitions by Module Type
// ============================================================================

/**
 * Connection point configuration for each module type
 * Defines which ports are available and their default positions
 */
export interface ModuleConnectionConfig {
  /** Module type */
  moduleType: ModuleType;
  /** Available input points (relative positions 0-100) */
  inputs: { x: number; y: number; label?: string }[];
  /** Available output points (relative positions 0-100) */
  outputs: { x: number; y: number; label?: string }[];
}

/**
 * Connection point definitions by module type
 */
export const MODULE_CONNECTION_CONFIGS: ModuleConnectionConfig[] = [
  // core-furnace: Energy source, 2 outputs, no inputs
  {
    moduleType: 'core-furnace',
    inputs: [],
    outputs: [
      { x: 75, y: 50, label: '能量输出' },
      { x: 75, y: 30, label: '能量输出' },
    ],
  },
  
  // energy-pipe: Pass-through, 1 input, 1 output
  {
    moduleType: 'energy-pipe',
    inputs: [{ x: 0, y: 25, label: '能量输入' }],
    outputs: [{ x: 100, y: 25, label: '能量输出' }],
  },
  
  // gear: Mechanical, no connections
  {
    moduleType: 'gear',
    inputs: [],
    outputs: [],
  },
  
  // rune-node: Transform energy, 1 input, 1 output
  {
    moduleType: 'rune-node',
    inputs: [{ x: 0, y: 40, label: '能量输入' }],
    outputs: [{ x: 100, y: 40, label: '能量输出' }],
  },
  
  // shield-shell: Structural, no connections
  {
    moduleType: 'shield-shell',
    inputs: [],
    outputs: [],
  },
  
  // trigger-switch: Trigger output only, no inputs
  {
    moduleType: 'trigger-switch',
    inputs: [],
    outputs: [{ x: 50, y: 100, label: '触发输出' }],
  },
  
  // output-array: Energy sink, 1 input, no outputs
  {
    moduleType: 'output-array',
    inputs: [{ x: 0, y: 40, label: '能量输入' }],
    outputs: [],
  },
  
  // amplifier-crystal: 1 input, 2 outputs
  {
    moduleType: 'amplifier-crystal',
    inputs: [{ x: 0, y: 40, label: '能量输入' }],
    outputs: [
      { x: 80, y: 20, label: '放大输出' },
      { x: 80, y: 60, label: '放大输出' },
    ],
  },
  
  // stabilizer-core: 2 inputs, 1 output
  {
    moduleType: 'stabilizer-core',
    inputs: [
      { x: 0, y: 25, label: '输入A' },
      { x: 0, y: 55, label: '输入B' },
    ],
    outputs: [{ x: 80, y: 40, label: '稳定输出' }],
  },
  
  // void-siphon: 1 input at top, 2 outputs at bottom
  {
    moduleType: 'void-siphon',
    inputs: [{ x: 40, y: 0, label: '能量输入' }],
    outputs: [
      { x: 22.5, y: 80, label: '虚空输出A' },
      { x: 57.5, y: 80, label: '虚空输出B' },
    ],
  },
  
  // phase-modulator: 2 inputs left, 2 outputs right
  {
    moduleType: 'phase-modulator',
    inputs: [
      { x: 0, y: 25, label: '相位输入A' },
      { x: 0, y: 50, label: '相位输入B' },
    ],
    outputs: [
      { x: 80, y: 25, label: '相位输出A' },
      { x: 80, y: 50, label: '相位输出B' },
    ],
  },
  
  // resonance-chamber: 1 input, 1 output
  {
    moduleType: 'resonance-chamber',
    inputs: [{ x: 0, y: 40, label: '共振输入' }],
    outputs: [{ x: 80, y: 40, label: '共振输出' }],
  },
  
  // fire-crystal: 1 input, 1 output
  {
    moduleType: 'fire-crystal',
    inputs: [{ x: 0, y: 40, label: '火焰输入' }],
    outputs: [{ x: 80, y: 40, label: '火焰输出' }],
  },
  
  // lightning-conductor: 1 input, 1 output
  {
    moduleType: 'lightning-conductor',
    inputs: [{ x: 0, y: 40, label: '雷电输入' }],
    outputs: [{ x: 80, y: 40, label: '雷电输出' }],
  },
  
  // Faction variant modules
  {
    moduleType: 'void-arcane-gear',
    inputs: [],
    outputs: [],
  },
  {
    moduleType: 'inferno-blazing-core',
    inputs: [{ x: 25, y: 55, label: '能量输入' }],
    outputs: [{ x: 85, y: 55, label: '能量输出' }],
  },
  {
    moduleType: 'storm-thundering-pipe',
    inputs: [{ x: 0, y: 30, label: '能量输入' }],
    outputs: [{ x: 100, y: 30, label: '能量输出' }],
  },
  {
    moduleType: 'stellar-harmonic-crystal',
    inputs: [{ x: 0, y: 42, label: '能量输入' }],
    outputs: [
      { x: 85, y: 25, label: '谐波输出A' },
      { x: 85, y: 60, label: '谐波输出B' },
    ],
  },
  
  // Round 64: Advanced Modules
  {
    moduleType: 'temporal-distorter',
    inputs: [{ x: 0, y: 45, label: '时间输入' }],
    outputs: [{ x: 90, y: 45, label: '时间输出' }],
  },
  {
    moduleType: 'arcane-matrix-grid',
    inputs: [{ x: 0, y: 40, label: '矩阵输入' }],
    outputs: [
      { x: 80, y: 25, label: '矩阵输出A' },
      { x: 80, y: 55, label: '矩阵输出B' },
    ],
  },
  {
    moduleType: 'ether-infusion-chamber',
    inputs: [
      { x: 0, y: 35, label: '以太输入A' },
      { x: 0, y: 65, label: '以太输入B' },
    ],
    outputs: [{ x: 100, y: 50, label: '以太输出' }],
  },
];

/**
 * Get connection config for a module type
 */
export function getModuleConnectionConfig(moduleType: ModuleType): ModuleConnectionConfig | undefined {
  return MODULE_CONNECTION_CONFIGS.find(c => c.moduleType === moduleType);
}

/**
 * Check if a module type has input ports
 */
export function hasInputPorts(moduleType: ModuleType): boolean {
  const config = getModuleConnectionConfig(moduleType);
  return (config?.inputs.length ?? 0) > 0;
}

/**
 * Check if a module type has output ports
 */
export function hasOutputPorts(moduleType: ModuleType): boolean {
  const config = getModuleConnectionConfig(moduleType);
  return (config?.outputs.length ?? 0) > 0;
}

/**
 * Check if a module type can be connected (has any ports)
 */
export function canBeConnected(moduleType: ModuleType): boolean {
  return hasInputPorts(moduleType) || hasOutputPorts(moduleType);
}

// ============================================================================
// Connection Validation Types
// ============================================================================

/**
 * Result of connection validation
 */
export interface ConnectionValidationResult {
  /** Whether the connection is valid */
  valid: boolean;
  /** Error code if invalid */
  errorCode?: ConnectionValidationErrorCode;
  /** Error message if invalid */
  errorMessage?: string;
}

/**
 * Error codes for connection validation failures
 */
export type ConnectionValidationErrorCode =
  | 'SELF_CONNECTION'           // Module connected to itself
  | 'SAME_PORT_TYPE'           // Input connected to input OR output connected to output
  | 'DUPLICATE_CONNECTION'     // Connection already exists
  | 'SOURCE_NOT_FOUND'         // Source module or port not found
  | 'TARGET_NOT_FOUND'         // Target module or port not found
  | 'INVALID_PORT_TYPE';       // Port type is neither input nor output

/**
 * Error messages for validation failures
 */
export const CONNECTION_ERROR_MESSAGES: Record<ConnectionValidationErrorCode, string> = {
  'SELF_CONNECTION': '模块无法连接到自身',
  'SAME_PORT_TYPE': '端口类型不匹配',
  'DUPLICATE_CONNECTION': '连接已存在',
  'SOURCE_NOT_FOUND': '源模块或端口不存在',
  'TARGET_NOT_FOUND': '目标模块或端口不存在',
  'INVALID_PORT_TYPE': '端口类型无效',
};

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a point is an input port
 */
export function isInputPort(point: ConnectionPoint): boolean {
  return point.type === 'input';
}

/**
 * Type guard to check if a point is an output port
 */
export function isOutputPort(point: ConnectionPoint): boolean {
  return point.type === 'output';
}

/**
 * Type guard to check if connection state indicates active flow
 */
export function isActiveConnectionState(state: ConnectionState): boolean {
  return state === 'active' || state === 'charging';
}

/**
 * Type guard to check if connection state indicates problem
 */
export function isProblemConnectionState(state: ConnectionState): boolean {
  return state === 'overload' || state === 'broken';
}

// ============================================================================
// State Conversion
// ============================================================================

/**
 * Map machine state to connection state
 */
export function machineStateToConnectionState(machineState: string): ConnectionState {
  switch (machineState) {
    case 'idle':
      return 'idle';
    case 'charging':
      return 'charging';
    case 'active':
      return 'active';
    case 'overload':
      return 'overload';
    case 'failure':
    case 'shutdown':
      return 'broken';
    default:
      return 'idle';
  }
}
