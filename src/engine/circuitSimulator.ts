/**
 * Circuit Simulator Engine
 * 
 * Round 121: Circuit Simulation Engine
 * 
 * Implements BFS-based signal propagation through logic gates.
 * Evaluates boolean logic for AND, OR, NOT, XOR, NAND, NOR, XNOR gates.
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
} from '../types/circuit';

// ============================================================================
// Gate Evaluation Functions
// ============================================================================

/**
 * Evaluate a logic gate with given inputs
 * @param gateType - The type of gate to evaluate
 * @param inputs - Array of input signal states
 * @returns The output signal state
 */
export function evaluateGate(gateType: GateType, inputs: SignalState[]): SignalState {
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
      
      // Evaluate gate
      const output = evaluateGate(gateNode.gateType, inputs);
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
