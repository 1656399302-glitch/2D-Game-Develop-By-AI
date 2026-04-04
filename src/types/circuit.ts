/**
 * Circuit Simulation Type Definitions
 * 
 * Round 121: Circuit Simulation Engine
 * Round 128: Added Timer, Counter, SR Latch, D Latch, D Flip-Flop types
 * 
 * Defines types for logic gates, signal states, and circuit simulation.
 */

// ============================================================================
// Signal States
// ============================================================================

/**
 * Binary signal state for circuit wires and ports
 */
export type SignalState = boolean;

/**
 * Signal states as readable strings for display
 */
export const SignalStateLabels: Record<string, string> = {
  false: 'LOW',
  true: 'HIGH',
};

// ============================================================================
// Gate Types
// ============================================================================

/**
 * Supported logic gate types (including sequential/memory elements)
 */
export type GateType = 
  | 'AND' 
  | 'OR' 
  | 'NOT' 
  | 'NAND' 
  | 'NOR' 
  | 'XOR' 
  | 'XNOR'
  | 'TIMER'
  | 'COUNTER'
  | 'SR_LATCH'
  | 'D_LATCH'
  | 'D_FLIP_FLOP';

/**
 * All supported gate types
 */
export const ALL_GATE_TYPES: GateType[] = [
  'AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR',
  'TIMER', 'COUNTER', 'SR_LATCH', 'D_LATCH', 'D_FLIP_FLOP',
];

/**
 * Gate input count requirements
 */
export const GATE_INPUT_COUNTS: Record<GateType, number> = {
  'AND': 2,
  'OR': 2,
  'NOT': 1,
  'NAND': 2,
  'NOR': 2,
  'XOR': 2,
  'XNOR': 2,
  'TIMER': 2,      // trigger, reset
  'COUNTER': 3,    // increment, decrement, reset
  'SR_LATCH': 2,   // Set, Reset
  'D_LATCH': 2,    // Data, Enable
  'D_FLIP_FLOP': 2, // Data, Clock
};

// ============================================================================
// Circuit Node Types
// ============================================================================

/**
 * Node types in a circuit
 */
export type CircuitNodeType = 'input' | 'output' | 'gate';

/**
 * Base circuit node interface
 */
export interface CircuitNode {
  id: string;
  type: CircuitNodeType;
  position: { x: number; y: number };
  label?: string;
}

/**
 * Input node for circuit testing
 */
export interface InputNode extends CircuitNode {
  type: 'input';
  /** Current signal state */
  state: SignalState;
}

/**
 * Output node (LED indicator)
 */
export interface OutputNode extends CircuitNode {
  type: 'output';
  /** Current input signal */
  inputSignal: SignalState;
}

/**
 * Logic gate node
 */
export interface GateNode extends CircuitNode {
  type: 'gate';
  gateType: GateType;
  /** Current output signal */
  output: SignalState;
  /** Input signals (indexed by input port index) */
  inputs: Map<number, SignalState>;
}

/**
 * Timer state for simulation
 */
export interface TimerState {
  /** Current tick count (0 to delay-1) */
  tickCount: number;
  /** Whether timer is active (counting down) */
  isActive: boolean;
  /** Whether timer has completed */
  done: boolean;
  /** Previous trigger state (for edge detection) */
  prevTrigger: SignalState;
  /** Configured delay in ticks */
  delay: number;
  /** Output signal */
  output: SignalState;
}

/**
 * Counter state for simulation
 */
export interface CounterState {
  /** Current count value */
  count: number;
  /** Maximum value (wraps at max+1) */
  maxValue: number;
  /** Whether overflow occurred on last operation */
  overflow: SignalState;
  /** Previous increment state (for edge detection) */
  prevIncrement: SignalState;
  /** Previous decrement state (for edge detection) */
  prevDecrement: SignalState;
}

/**
 * Memory element state for simulation
 */
export interface MemoryState {
  /** Current Q output */
  q: SignalState;
  /** Current Q-bar output */
  qBar: SignalState;
  /** Previous clock state (for edge detection in flip-flops) */
  prevClock: SignalState;
  /** Previous enable state (for level detection in latches) */
  prevEnable: SignalState;
  /** Whether S=R=HIGH (invalid state for SR Latch) */
  invalidState: boolean;
}

// ============================================================================
// Connection Types
// ============================================================================

/**
 * Connection between circuit nodes
 */
export interface CircuitConnection {
  id: string;
  /** Source node ID (output) */
  sourceNodeId: string;
  /** Target node ID (input) */
  targetNodeId: string;
  /** Target input port index on the target node */
  targetPort: number;
  /** Signal state on this wire */
  signal: SignalState;
}

// ============================================================================
// Simulation State
// ============================================================================

/**
 * Simulation running state
 */
export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed';

/**
 * Complete circuit simulation state
 */
export interface SimulationState {
  /** Current simulation status */
  status: SimulationStatus;
  /** All nodes in the circuit */
  nodes: CircuitNode[];
  /** All connections between nodes */
  connections: CircuitConnection[];
  /** Signal states for all nodes (nodeId -> signal state) */
  nodeSignals: Map<string, SignalState>;
  /** Step count for debugging */
  stepCount: number;
  /** Whether circuit has been modified since last simulation */
  isDirty: boolean;
}

/**
 * Circuit with nodes and connections for simulation
 */
export interface Circuit {
  id: string;
  name: string;
  nodes: CircuitNode[];
  connections: CircuitConnection[];
}

// ============================================================================
// Gate Truth Tables
// ============================================================================

/**
 * Truth table entry
 */
export interface TruthTableEntry {
  inputs: SignalState[];
  output: SignalState;
}

/**
 * Truth table for each gate type
 */
export type TruthTable = TruthTableEntry[];

/**
 * Truth tables for all 2-input gates
 */
export const TWO_INPUT_TRUTH_TABLE: TruthTable = [
  { inputs: [false, false], output: false },
  { inputs: [false, true], output: false },
  { inputs: [true, false], output: false },
  { inputs: [true, true], output: true },
];

/**
 * Truth tables for all gate types (combinational gates only)
 * Note: Timer, Counter, and Memory elements are stateful and handled separately
 */
export const GATE_TRUTH_TABLES: Record<Exclude<GateType, 'TIMER' | 'COUNTER' | 'SR_LATCH' | 'D_LATCH' | 'D_FLIP_FLOP'>, TruthTable> = {
  'AND': [
    { inputs: [false, false], output: false },
    { inputs: [false, true], output: false },
    { inputs: [true, false], output: false },
    { inputs: [true, true], output: true },
  ],
  'OR': [
    { inputs: [false, false], output: false },
    { inputs: [false, true], output: true },
    { inputs: [true, false], output: true },
    { inputs: [true, true], output: true },
  ],
  'NOT': [
    { inputs: [false], output: true },
    { inputs: [true], output: false },
  ],
  'NAND': [
    { inputs: [false, false], output: true },
    { inputs: [false, true], output: true },
    { inputs: [true, false], output: true },
    { inputs: [true, true], output: false },
  ],
  'NOR': [
    { inputs: [false, false], output: true },
    { inputs: [false, true], output: false },
    { inputs: [true, false], output: false },
    { inputs: [true, true], output: false },
  ],
  'XOR': [
    { inputs: [false, false], output: false },
    { inputs: [false, true], output: true },
    { inputs: [true, false], output: true },
    { inputs: [true, true], output: false },
  ],
  'XNOR': [
    { inputs: [false, false], output: true },
    { inputs: [false, true], output: false },
    { inputs: [true, false], output: false },
    { inputs: [true, true], output: true },
  ],
};

// ============================================================================
// BFS Evaluation Types
// ============================================================================

/**
 * Adjacency list representation of circuit graph
 */
export type CircuitGraph = Map<string, {
  node: CircuitNode;
  outgoingConnections: CircuitConnection[];
  incomingConnections: CircuitConnection[];
}>;

/**
 * BFS evaluation result
 */
export interface EvaluationResult {
  /** Node IDs evaluated in order */
  evaluationOrder: string[];
  /** Final signal states for all nodes */
  finalSignals: Map<string, SignalState>;
  /** Whether any cycles were detected */
  cycleDetected: boolean;
  /** Nodes that were skipped due to cycles */
  skippedNodes: string[];
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Gate component props
 */
export interface GateComponentProps {
  gateType: GateType;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  showLabel?: boolean;
  inputSignals?: SignalState[];
  outputSignal?: SignalState;
  onInputChange?: (portIndex: number, value: SignalState) => void;
}

/**
 * Input node component props
 */
export interface InputNodeComponentProps {
  id: string;
  position?: { x: number; y: number };
  initialState?: SignalState;
  label?: string;
  onToggle?: (newState: SignalState) => void;
}

/**
 * Output node component props
 */
export interface OutputNodeComponentProps {
  id: string;
  position?: { x: number; y: number };
  inputSignal?: SignalState;
  label?: string;
}

/**
 * Simulation panel component props
 */
export interface SimulationPanelProps {
  isRunning: boolean;
  onRun: () => void;
  onReset: () => void;
  onStep?: () => void;
  stepCount?: number;
}
