/**
 * Circuit Simulator Engine
 * 
 * Round 121: Circuit Simulation Engine
 * Round 128: Added Timer, Counter, SR Latch, D Latch, D Flip-Flop support
 * 
 * Implements BFS-based signal propagation through logic gates.
 * Evaluates boolean logic for AND, OR, NOT, XOR, NAND, NOR, XNOR gates.
 * Handles stateful components (Timer, Counter, Memory) with tick-based simulation.
 */

import {
  GateType,
  SignalState,
  CircuitNode,
  CircuitConnection,
  CircuitGraph,
  EvaluationResult,
  GateNode,
  InputNode,
  GATE_TRUTH_TABLES,
  TimerState,
  CounterState,
  MemoryState,
} from '../types/circuit';

// ============================================================================
// Simulation State Storage (stateful components)
// ============================================================================

/**
 * Global state storage for stateful components
 * Maintained across simulation ticks
 */
interface ComponentStateStore {
  timerStates: Map<string, TimerState>;
  counterStates: Map<string, CounterState>;
  memoryStates: Map<string, MemoryState>;
  previousInputStates: Map<string, Map<string, SignalState>>;
}

const componentStateStore: ComponentStateStore = {
  timerStates: new Map(),
  counterStates: new Map(),
  memoryStates: new Map(),
  previousInputStates: new Map(),
};

/**
 * Reset all component states (for simulation reset)
 */
export function resetComponentStates(): void {
  componentStateStore.timerStates.clear();
  componentStateStore.counterStates.clear();
  componentStateStore.memoryStates.clear();
  componentStateStore.previousInputStates.clear();
}

/**
 * Get timer state for a component
 */
export function getTimerState(nodeId: string, defaultDelay: number = 5): TimerState {
  if (!componentStateStore.timerStates.has(nodeId)) {
    componentStateStore.timerStates.set(nodeId, {
      tickCount: 0,
      isActive: false,
      done: false,
      prevTrigger: false,
      delay: defaultDelay,
      output: false,
    });
  }
  return componentStateStore.timerStates.get(nodeId)!;
}

/**
 * Get counter state for a component
 */
export function getCounterState(nodeId: string, defaultMax: number = 8): CounterState {
  if (!componentStateStore.counterStates.has(nodeId)) {
    componentStateStore.counterStates.set(nodeId, {
      count: 0,
      maxValue: defaultMax,
      overflow: false,
      prevIncrement: false,
      prevDecrement: false,
    });
  }
  return componentStateStore.counterStates.get(nodeId)!;
}

/**
 * Get memory state for a component
 */
export function getMemoryState(nodeId: string): MemoryState {
  if (!componentStateStore.memoryStates.has(nodeId)) {
    componentStateStore.memoryStates.set(nodeId, {
      q: false,
      qBar: true,
      prevClock: false,
      prevEnable: false,
      invalidState: false,
    });
  }
  return componentStateStore.memoryStates.get(nodeId)!;
}

// ============================================================================
// Gate Evaluation Functions (Combinational)
// ============================================================================

/**
 * Evaluate a logic gate with given inputs
 * @param gateType - The type of gate to evaluate
 * @param inputs - Array of input signal states
 * @returns The output signal state
 */
export function evaluateGate(gateType: GateType, inputs: SignalState[]): SignalState {
  // Handle stateful gates separately
  if (gateType === 'TIMER' || gateType === 'COUNTER' || 
      gateType === 'SR_LATCH' || gateType === 'D_LATCH' || gateType === 'D_FLIP_FLOP') {
    // These should be handled by evaluateStatefulGate
    return false;
  }

  // Find matching truth table entry
  const truthTable = GATE_TRUTH_TABLES[gateType];
  
  if (!truthTable) {
    throw new Error(`Unknown gate type: ${gateType}`);
  }
  
  for (const entry of truthTable) {
    if (arraysEqual(entry.inputs, inputs)) {
      return entry.output;
    }
  }
  
  // If inputs don't match any entry, return false (default)
  // This can happen if not all inputs are connected
  return false;
}

/**
 * Check if two arrays are equal
 */
function arraysEqual(a: SignalState[], b: SignalState[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Get default inputs for a gate type
 * Used when inputs are not connected
 */
export function getDefaultInputs(gateType: GateType): SignalState[] {
  const inputCount = gateType === 'NOT' ? 1 : 2;
  return new Array(inputCount).fill(false);
}

// ============================================================================
// Stateful Gate Evaluation
// ============================================================================

/**
 * Evaluate Timer gate
 * Port 0: Trigger (rising edge starts timer)
 * Port 1: Reset (HIGH resets timer)
 * Output: HIGH after delay ticks
 * Done flag output: HIGH when timer completes
 * 
 * @param nodeId - Unique identifier for state persistence
 * @param trigger - Trigger input signal
 * @param reset - Reset input signal
 * @param delay - Number of ticks before output goes HIGH
 * @returns { output: SignalState, done: SignalState }
 */
export function evaluateTimer(
  nodeId: string,
  trigger: SignalState,
  reset: SignalState,
  delay: number = 5
): { output: SignalState; done: SignalState; state: TimerState } {
  const state = getTimerState(nodeId, delay);
  
  // Synchronous reset - immediately clears timer
  if (reset) {
    state.tickCount = 0;
    state.isActive = false;
    state.done = false;
    state.prevTrigger = trigger;
    return { output: false, done: false, state };
  }
  
  // Rising edge detection on trigger
  const risingEdge = trigger && !state.prevTrigger;
  
  if (risingEdge && !state.isActive) {
    // Start timer on rising edge
    state.isActive = true;
    state.tickCount = 0;
    state.done = false;
  }
  
  if (state.isActive) {
    state.tickCount++;
    
    if (state.tickCount >= delay) {
      // Timer complete
      state.output = true;
      state.done = true;
      state.isActive = false;
    } else {
      state.output = false;
    }
  } else {
    state.output = false;
  }
  
  state.prevTrigger = trigger;
  
  return { 
    output: state.output, 
    done: state.done, 
    state 
  };
}

/**
 * Evaluate Counter gate
 * Port 0: Increment (rising edge increments)
 * Port 1: Decrement (rising edge decrements)
 * Port 2: Reset (HIGH resets to 0)
 * Output: Current count value
 * Overflow flag: HIGH when wraps
 * 
 * @param nodeId - Unique identifier for state persistence
 * @param increment - Increment input signal
 * @param decrement - Decrement input signal
 * @param reset - Reset input signal
 * @param maxValue - Maximum value before wrap
 * @returns { output: SignalState, overflow: SignalState, state: CounterState }
 */
export function evaluateCounter(
  nodeId: string,
  increment: SignalState,
  decrement: SignalState,
  reset: SignalState,
  maxValue: number = 8
): { output: SignalState; overflow: SignalState; state: CounterState } {
  const state = getCounterState(nodeId, maxValue);
  state.maxValue = maxValue;
  
  // Reset takes priority
  if (reset) {
    state.count = 0;
    state.overflow = false;
    state.prevIncrement = increment;
    state.prevDecrement = decrement;
    return { output: false, overflow: false, state };
  }
  
  // Rising edge detection
  const incRising = increment && !state.prevIncrement;
  const decRising = decrement && !state.prevDecrement;
  
  // Only clear overflow if an operation actually happens
  
  if (incRising) {
    if (state.count >= maxValue) {
      // Wrap to 0
      state.count = 0;
      state.overflow = true;
    } else {
      state.count++;
    }
  }
  
  if (decRising) {
    if (state.count <= 0) {
      // Wrap to max
      state.count = maxValue;
      state.overflow = true;
    } else {
      state.count--;
    }
  }
  
  // Clear overflow only if an increment/decrement happened (but not if wrapping)
  if ((incRising || decRising) && !state.overflow) {
    state.overflow = false;
  }
  
  state.prevIncrement = increment;
  state.prevDecrement = decrement;
  
  // Output is HIGH if count > 0 (simplified - for multi-bit, would need bit extraction)
  const output = state.count > 0;
  
  return { output, overflow: state.overflow, state };
}

/**
 * Evaluate SR Latch
 * Port 0: Set (S)
 * Port 1: Reset (R)
 * Output Q
 * Output Q-bar (complement)
 * 
 * @param nodeId - Unique identifier for state persistence
 * @param set - Set input signal
 * @param reset - Reset input signal
 * @returns { q: SignalState, qBar: SignalState, invalidState: boolean, state: MemoryState }
 */
export function evaluateSRLatch(
  nodeId: string,
  set: SignalState,
  reset: SignalState
): { q: SignalState; qBar: SignalState; invalidState: boolean; state: MemoryState } {
  const state = getMemoryState(nodeId);
  
  // Invalid state: both S and R are HIGH
  if (set && reset) {
    state.q = false;
    state.qBar = false;
    state.invalidState = true;
    return { q: false, qBar: false, invalidState: true, state };
  }
  
  state.invalidState = false;
  
  // Set=HIGH, Reset=LOW → Q=HIGH
  if (set && !reset) {
    state.q = true;
  }
  // Set=LOW, Reset=HIGH → Q=LOW
  else if (!set && reset) {
    state.q = false;
  }
  // Both LOW → hold state (no change)
  // Both HIGH is handled above (invalid)
  
  state.qBar = !state.q;
  
  return { q: state.q, qBar: state.qBar, invalidState: state.invalidState, state };
}

/**
 * Evaluate D Latch (level-sensitive)
 * Port 0: Data (D)
 * Port 1: Enable (E)
 * Output Q
 * Output Q-bar (complement)
 * 
 * @param nodeId - Unique identifier for state persistence
 * @param data - Data input signal
 * @param enable - Enable input signal
 * @returns { q: SignalState; qBar: SignalState; state: MemoryState }
 */
export function evaluateDLatch(
  nodeId: string,
  data: SignalState,
  enable: SignalState
): { q: SignalState; qBar: SignalState; state: MemoryState } {
  const state = getMemoryState(nodeId);
  
  // E=HIGH → Q=D
  if (enable) {
    state.q = data;
    state.prevEnable = true;
  } else {
    // E=LOW → hold state
    state.prevEnable = false;
  }
  
  state.qBar = !state.q;
  
  return { q: state.q, qBar: state.qBar, state };
}

/**
 * Evaluate D Flip-Flop (edge-triggered)
 * Port 0: Data (D)
 * Port 1: Clock (CLK)
 * Output Q
 * Output Q-bar (complement)
 * 
 * @param nodeId - Unique identifier for state persistence
 * @param data - Data input signal
 * @param clock - Clock input signal
 * @returns { q: SignalState; qBar: SignalState; state: MemoryState }
 */
export function evaluateDFlipFlop(
  nodeId: string,
  data: SignalState,
  clock: SignalState
): { q: SignalState; qBar: SignalState; state: MemoryState } {
  const state = getMemoryState(nodeId);
  
  // Rising edge detection (LOW → HIGH)
  const risingEdge = clock && !state.prevClock;
  
  if (risingEdge) {
    // Sample D on rising edge
    state.q = data;
  }
  
  state.prevClock = clock;
  state.qBar = !state.q;
  
  return { q: state.q, qBar: state.qBar, state };
}

/**
 * Evaluate a stateful gate with current inputs
 * Used by the simulation engine to handle Timer, Counter, and Memory elements
 */
export function evaluateStatefulGate(
  gateType: GateType,
  nodeId: string,
  inputs: SignalState[],
  parameters?: Record<string, unknown>
): { output: SignalState; additionalOutputs?: SignalState[]; invalidState?: boolean } {
  switch (gateType) {
    case 'TIMER': {
      const trigger = inputs[0] ?? false;
      const reset = inputs[1] ?? false;
      const delay = (parameters?.delay as number) ?? 5;
      const result = evaluateTimer(nodeId, trigger, reset, delay);
      return { output: result.output, additionalOutputs: [result.done] };
    }
    
    case 'COUNTER': {
      const increment = inputs[0] ?? false;
      const decrement = inputs[1] ?? false;
      const reset = inputs[2] ?? false;
      const maxValue = (parameters?.maxValue as number) ?? 8;
      const result = evaluateCounter(nodeId, increment, decrement, reset, maxValue);
      return { output: result.output, additionalOutputs: [result.overflow] };
    }
    
    case 'SR_LATCH': {
      const set = inputs[0] ?? false;
      const reset = inputs[1] ?? false;
      const result = evaluateSRLatch(nodeId, set, reset);
      return { output: result.q, additionalOutputs: [result.qBar], invalidState: result.invalidState };
    }
    
    case 'D_LATCH': {
      const data = inputs[0] ?? false;
      const enable = inputs[1] ?? false;
      const result = evaluateDLatch(nodeId, data, enable);
      return { output: result.q, additionalOutputs: [result.qBar] };
    }
    
    case 'D_FLIP_FLOP': {
      const data = inputs[0] ?? false;
      const clock = inputs[1] ?? false;
      const result = evaluateDFlipFlop(nodeId, data, clock);
      return { output: result.q, additionalOutputs: [result.qBar] };
    }
    
    default:
      // Should not reach here for stateful gates
      return { output: false };
  }
}

// ============================================================================
// Circuit Graph Construction
// ============================================================================

/**
 * Build adjacency list representation of circuit
 */
export function buildCircuitGraph(
  nodes: CircuitNode[],
  connections: CircuitConnection[]
): CircuitGraph {
  const graph: CircuitGraph = new Map();
  
  // Initialize graph with all nodes
  for (const node of nodes) {
    graph.set(node.id, {
      node,
      outgoingConnections: [],
      incomingConnections: [],
    });
  }
  
  // Add connections to graph
  for (const connection of connections) {
    const sourceEntry = graph.get(connection.sourceNodeId);
    const targetEntry = graph.get(connection.targetNodeId);
    
    if (sourceEntry && targetEntry) {
      sourceEntry.outgoingConnections.push(connection);
      targetEntry.incomingConnections.push(connection);
    }
  }
  
  return graph;
}

// ============================================================================
// BFS Evaluation
// ============================================================================

/**
 * Get topological order using BFS (Kahn's algorithm variant)
 * Handles cycles by detecting and skipping already-visited nodes
 */
function getTopologicalOrder(graph: CircuitGraph): string[] {
  const order: string[] = [];
  const visited = new Set<string>();
  const inDegree = new Map<string, number>();
  
  // Calculate in-degree for each node
  for (const [nodeId, entry] of graph) {
    inDegree.set(nodeId, entry.incomingConnections.length);
  }
  
  // Queue for BFS - start with input nodes (in-degree 0)
  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) {
      queue.push(nodeId);
    }
  }
  
  // BFS traversal
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    
    if (visited.has(nodeId)) continue;
    
    visited.add(nodeId);
    order.push(nodeId);
    
    const entry = graph.get(nodeId);
    if (!entry) continue;
    
    // Process outgoing connections
    for (const conn of entry.outgoingConnections) {
      const targetDegree = inDegree.get(conn.targetNodeId) || 0;
      inDegree.set(conn.targetNodeId, targetDegree - 1);
      
      // Add to queue if in-degree becomes 0
      if (targetDegree - 1 === 0) {
        queue.push(conn.targetNodeId);
      }
    }
  }
  
  return order;
}

/**
 * Propagate signals through the circuit using BFS
 */
export function propagateSignals(
  nodes: CircuitNode[],
  connections: CircuitConnection[],
  inputStates: Map<string, SignalState>
): EvaluationResult {
  const graph = buildCircuitGraph(nodes, connections);
  const nodeSignals = new Map<string, SignalState>();
  const evaluationOrder: string[] = [];
  const skippedNodes: string[] = [];
  
  // Initialize node signals from input states
  for (const node of nodes) {
    if (node.type === 'input') {
      nodeSignals.set(node.id, inputStates.get(node.id) ?? false);
    } else if (node.type === 'gate') {
      nodeSignals.set(node.id, false); // Default output is false until evaluated
    } else if (node.type === 'output') {
      nodeSignals.set(node.id, false); // Default input is false until connected
    }
  }
  
  // Get evaluation order
  const order = getTopologicalOrder(graph);
  
  // Process nodes in order
  for (const nodeId of order) {
    const entry = graph.get(nodeId);
    if (!entry) continue;
    
    const node = entry.node;
    
    if (node.type === 'input') {
      // Input nodes are already set from inputStates
      evaluationOrder.push(nodeId);
    } else if (node.type === 'gate') {
      const gateNode = node as GateNode;
      
      // Collect inputs from incoming connections
      const inputs: SignalState[] = [];
      for (const conn of entry.incomingConnections) {
        const sourceSignal = nodeSignals.get(conn.sourceNodeId) ?? false;
        // Use targetPort to index inputs correctly
        while (inputs.length <= conn.targetPort) {
          inputs.push(false);
        }
        inputs[conn.targetPort] = sourceSignal;
      }
      
      // Evaluate gate based on type
      let output: SignalState;
      
      if (gateNode.gateType === 'TIMER' || gateNode.gateType === 'COUNTER' ||
          gateNode.gateType === 'SR_LATCH' || gateNode.gateType === 'D_LATCH' ||
          gateNode.gateType === 'D_FLIP_FLOP') {
        // Stateful gates use separate evaluation
        const params = (gateNode as GateNode & { parameters?: Record<string, unknown> }).parameters;
        const result = evaluateStatefulGate(gateNode.gateType, gateNode.id, inputs, params);
        output = result.output;
      } else {
        // Combinational gates use truth table
        output = evaluateGate(gateNode.gateType, inputs);
      }
      
      nodeSignals.set(nodeId, output);
      evaluationOrder.push(nodeId);
    } else if (node.type === 'output') {
      // Output nodes receive signal from their single incoming connection
      if (entry.incomingConnections.length > 0) {
        const sourceSignal = nodeSignals.get(entry.incomingConnections[0].sourceNodeId) ?? false;
        nodeSignals.set(nodeId, sourceSignal);
      }
      evaluationOrder.push(nodeId);
    }
  }
  
  // Detect cycles - if some nodes weren't visited
  const visited = new Set(evaluationOrder);
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      skippedNodes.push(node.id);
    }
  }
  
  return {
    evaluationOrder,
    finalSignals: nodeSignals,
    cycleDetected: skippedNodes.length > 0,
    skippedNodes,
  };
}

/**
 * Simple gate evaluation for truth table testing
 * Directly evaluates a gate without circuit context
 */
export function evaluateTruthTable(
  gateType: GateType,
  inputA: SignalState,
  inputB: SignalState
): SignalState {
  if (gateType === 'NOT') {
    return evaluateGate(gateType, [inputA]);
  }
  if (gateType === 'TIMER' || gateType === 'COUNTER' ||
      gateType === 'SR_LATCH' || gateType === 'D_LATCH' ||
      gateType === 'D_FLIP_FLOP') {
    // These require state - use stateful evaluation
    const result = evaluateStatefulGate(gateType, `test-${gateType}`, [inputA, inputB]);
    return result.output;
  }
  return evaluateGate(gateType, [inputA, inputB]);
}

// ============================================================================
// Circuit Creation Helpers
// ============================================================================

let nodeIdCounter = 0;
let connectionIdCounter = 0;

/**
 * Generate unique node ID
 */
export function generateNodeId(): string {
  return `node-${++nodeIdCounter}`;
}

/**
 * Generate unique connection ID
 */
export function generateConnectionId(): string {
  return `conn-${++connectionIdCounter}`;
}

/**
 * Create an input node
 */
export function createInputNode(
  position: { x: number; y: number },
  label?: string
): InputNode {
  return {
    id: generateNodeId(),
    type: 'input',
    position,
    state: false,
    label,
  };
}

/**
 * Create a gate node
 */
export function createGateNode(
  gateType: GateType,
  position: { x: number; y: number },
  label?: string
): GateNode {
  return {
    id: generateNodeId(),
    type: 'gate',
    gateType,
    position,
    output: false,
    inputs: new Map(),
    label,
  };
}

/**
 * Create a connection between nodes
 */
export function createConnection(
  sourceNodeId: string,
  targetNodeId: string,
  targetPort: number = 0
): CircuitConnection {
  return {
    id: generateConnectionId(),
    sourceNodeId,
    targetNodeId,
    targetPort,
    signal: false,
  };
}

/**
 * Reset ID counters (for testing)
 */
export function resetCounters(): void {
  nodeIdCounter = 0;
  connectionIdCounter = 0;
}


/**
 * Get all counter states for the CounterPanel
 * ROUND 183: Added for CounterPanel integration
 */
export function getAllCounterStates(): Map<string, CounterState> {
  return componentStateStore.counterStates;
}

/**
 * Get counter state by node ID (for external access)
 * ROUND 183: Added for CounterPanel integration
 */
export function getCounterStateByNodeId(nodeId: string): CounterState | undefined {
  return componentStateStore.counterStates.get(nodeId);
}
