/**
 * Circuit Canvas Type Definitions
 * 
 * Round 122: Circuit Canvas Integration
 * Round 128: Added Timer, Counter, SR Latch, D Latch, D Flip-Flop types
 * Round 131: Added React import for CanvasCircuitNodeProps onClick signature
 * Round 144: Added Junction and Layer types
 * 
 * Defines types for circuit components placed on the canvas,
 * extending the base circuit simulation types with canvas-specific state.
 */

import { GateType, SignalState, CircuitNodeType } from './circuit';
import React from 'react';

// ============================================================================
// Circuit Node Types for Canvas
// ============================================================================

/**
 * Circuit node placed on canvas
 */
export interface PlacedCircuitNode {
  /** Unique identifier */
  id: string;
  /** Circuit node type */
  type: CircuitNodeType;
  /** Position on canvas */
  position: { x: number; y: number };
  /** Node label for display */
  label?: string;
  /** Gate type for gate nodes */
  gateType?: GateType;
  /** Current signal state */
  signal: SignalState;
  /** Whether node is selected */
  selected?: boolean;
  /** Whether node has a cycle warning */
  cycleWarning?: boolean;
  /** Node dimensions */
  size?: { width: number; height: number };
  /** Component-specific parameters */
  parameters?: Record<string, unknown>;
  /** Layer ID for multi-layer support */
  layerId?: string;
}

/**
 * Canvas circuit node for InputNode
 */
export interface PlacedInputNode extends PlacedCircuitNode {
  type: 'input';
  /** Input state (toggleable) */
  state: SignalState;
}

/**
 * Canvas circuit node for OutputNode
 */
export interface PlacedOutputNode extends PlacedCircuitNode {
  type: 'output';
  /** Input signal from connected wire */
  inputSignal: SignalState;
}

/**
 * Canvas circuit node for GateNode
 */
export interface PlacedGateNode extends PlacedCircuitNode {
  type: 'gate';
  gateType: GateType;
  /** Gate output signal */
  output: SignalState;
  /** Number of inputs required */
  inputCount: number;
  /** Component-specific parameters */
  parameters?: Record<string, unknown>;
}

// ============================================================================
// Wire Types for Canvas
// ============================================================================

/**
 * Wire segment connecting two circuit nodes
 */
export interface CircuitWire {
  /** Unique identifier */
  id: string;
  /** Source node ID (output) */
  sourceNodeId: string;
  /** Target node ID (input) */
  targetNodeId: string;
  /** Target input port index */
  targetPort: number;
  /** Wire path data (SVG path or points) */
  pathData?: string;
  /** Signal state on this wire */
  signal: SignalState;
  /** Whether wire is selected */
  selected?: boolean;
  /** Start point coordinates */
  startPoint?: { x: number; y: number };
  /** End point coordinates */
  endPoint?: { x: number; y: number };
  /** Layer ID for multi-layer support */
  layerId?: string;
}

// ============================================================================
// Junction Types (Round 144)
// ============================================================================

/**
 * Junction point for complex wire routing
 * Allows multiple wires to connect at a single point
 */
export interface CircuitJunction {
  /** Unique identifier */
  id: string;
  /** Junction type */
  type: 'junction';
  /** Position on canvas */
  position: { x: number; y: number };
  /** Signal state */
  signal: SignalState;
  /** Number of connected wires */
  connectionCount: number;
  /** Connected wire IDs */
  connectedWireIds: string[];
  /** Layer ID for multi-layer support */
  layerId?: string;
}

/**
 * Junction port configuration
 */
export interface JunctionPort {
  /** Port index */
  index: number;
  /** Position relative to junction center */
  x: number;
  y: number;
  /** Connected wire ID (if any) */
  wireId?: string;
  /** Signal state */
  signal: SignalState;
}

// ============================================================================
// Layer Types (Round 144)
// ============================================================================

/**
 * Circuit layer for multi-layer support
 * Allows organizing circuits into separate layers
 */
export interface CircuitLayer {
  /** Unique identifier */
  id: string;
  /** Layer name for display */
  name: string;
  /** Whether layer is visible */
  visible: boolean;
  /** Layer color for UI display */
  color: string;
  /** Layer order (z-index) */
  order: number;
  /** Node IDs on this layer */
  nodeIds: string[];
  /** Wire IDs on this layer */
  wireIds: string[];
}

/**
 * Layer creation options
 */
export interface CreateLayerOptions {
  /** Optional custom name */
  name?: string;
  /** Optional custom color */
  color?: string;
}

// ============================================================================
// Canvas Circuit State
// ============================================================================

/**
 * Complete circuit state for canvas
 */
export interface CanvasCircuitState {
  /** Circuit mode active */
  isCircuitMode: boolean;
  /** All circuit nodes on canvas */
  nodes: PlacedCircuitNode[];
  /** All wires between nodes */
  wires: CircuitWire[];
  /** Selected node ID (single selection - backward compatibility) */
  selectedNodeId: string | null;
  /** Selected circuit node IDs (multi-selection - Round 131) */
  selectedCircuitNodeIds: string[];
  /** Selected wire ID */
  selectedWireId: string | null;
  /** Wire drawing state */
  isDrawingWire: boolean;
  /** Wire drawing start info */
  wireStart: { nodeId: string; portIndex: number } | null;
  /** Wire drawing preview end point */
  wirePreviewEnd: { x: number; y: number } | null;
  /** Nodes affected by cycle detection */
  cycleAffectedNodeIds: string[];
  /** Simulation running */
  isSimulating: boolean;
  /** Simulation step count */
  simulationStepCount: number;
  /** Junction nodes */
  junctions: CircuitJunction[];
  /** Circuit layers */
  layers: CircuitLayer[];
  /** Active layer ID */
  activeLayerId: string | null;
}

// ============================================================================
// Canvas Circuit Events
// ============================================================================

/**
 * Events emitted by circuit canvas interactions
 */
export interface CircuitCanvasEvents {
  /** Node was added */
  onNodeAdd?: (node: PlacedCircuitNode) => void;
  /** Node was removed */
  onNodeRemove?: (nodeId: string) => void;
  /** Node was selected */
  onNodeSelect?: (nodeId: string | null) => void;
  /** Node position changed */
  onNodeMove?: (nodeId: string, position: { x: number; y: number }) => void;
  /** Wire was added */
  onWireAdd?: (wire: CircuitWire) => void;
  /** Wire was removed */
  onWireRemove?: (wireId: string) => void;
  /** Input node was toggled */
  onInputToggle?: (nodeId: string, newState: SignalState) => void;
  /** Simulation ran */
  onSimulationRun?: () => void;
  /** Simulation reset */
  onSimulationReset?: () => void;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Canvas circuit node component props
 * Round 131: Updated onClick to optionally receive React.MouseEvent for modifier key detection
 */
export interface CanvasCircuitNodeProps {
  /** Node data */
  node: PlacedCircuitNode;
  /** Whether node is selected */
  isSelected?: boolean;
  /** Viewport zoom level */
  zoom?: number;
  /** Whether node is affected by cycle detection */
  cycleWarning?: boolean;
  /** Click handler - optionally receives mouse event for modifier key detection (Shift+Click, Cmd/Ctrl+Click) */
  onClick?: (nodeId: string, event?: React.MouseEvent) => void;
  /** Drag start handler */
  onDragStart?: (nodeId: string, event: React.MouseEvent) => void;
  /** Port click handler for wire drawing */
  onPortClick?: (nodeId: string, portIndex: number, isOutput: boolean) => void;
  /** Input toggle handler (for input nodes) */
  onInputToggle?: (nodeId: string) => void;
}

/**
 * Circuit wire component props
 */
export interface CircuitWireProps {
  /** Wire data */
  wire: CircuitWire;
  /** Start point coordinates */
  startPoint: { x: number; y: number };
  /** End point coordinates */
  endPoint: { x: number; y: number };
  /** Whether wire is selected */
  isSelected?: boolean;
  /** Click handler */
  onClick?: (wireId: string) => void;
}

/**
 * Junction component props
 */
export interface CircuitJunctionProps {
  /** Junction data */
  junction: CircuitJunction;
  /** Whether junction is selected */
  isSelected?: boolean;
  /** Zoom level */
  zoom?: number;
  /** Click handler */
  onClick?: (junctionId: string) => void;
  /** Port click handler */
  onPortClick?: (junctionId: string, portIndex: number) => void;
}

// ============================================================================
// Gate Size Constants
// ============================================================================

/**
 * Standard sizes for circuit nodes on canvas
 */
export const CIRCUIT_NODE_SIZES: Record<string, { width: number; height: number }> = {
  input: { width: 60, height: 60 },
  output: { width: 60, height: 60 },
  AND: { width: 80, height: 50 },
  OR: { width: 80, height: 50 },
  NOT: { width: 60, height: 40 },
  NAND: { width: 80, height: 50 },
  NOR: { width: 80, height: 50 },
  XOR: { width: 80, height: 50 },
  XNOR: { width: 80, height: 50 },
  // New sequential/memory elements (larger to fit labels)
  TIMER: { width: 80, height: 70 },
  COUNTER: { width: 80, height: 70 },
  SR_LATCH: { width: 80, height: 70 },
  D_LATCH: { width: 80, height: 70 },
  D_FLIP_FLOP: { width: 80, height: 70 },
};

/**
 * Signal colors for wires
 */
export const SIGNAL_COLORS = {
  HIGH: '#22c55e',
  LOW: '#64748b',
  SELECTED: '#3b82f6',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
};

/**
 * Default labels for circuit nodes
 */
export const DEFAULT_NODE_LABELS: Record<string, string> = {
  input: 'IN',
  output: 'OUT',
  TIMER: 'TIMER',
  COUNTER: 'COUNT',
  SR_LATCH: 'SR',
  D_LATCH: 'D',
  D_FLIP_FLOP: 'D-FF',
};

/**
 * Default layer colors
 */
export const DEFAULT_LAYER_COLORS = [
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#f59e0b', // Orange
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
];
