/**
 * Circuit Canvas Integration Tests
 * 
 * Round 122: Circuit Canvas Integration
 * 
 * Integration tests for circuit canvas functionality.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { PlacedInputNode, PlacedGateNode } from '../types/circuitCanvas';

// Import the stores
import { useCircuitCanvasStore } from '../store/useCircuitCanvasStore';
import { useMachineStore } from '../store/useMachineStore';

// Helper to reset store between tests
const resetCircuitStore = () => {
  useCircuitCanvasStore.setState({
    isCircuitMode: false,
    nodes: [],
    wires: [],
    selectedNodeId: null,
    selectedWireId: null,
    isDrawingWire: false,
    wireStart: null,
    wirePreviewEnd: null,
    cycleAffectedNodeIds: [],
    isSimulating: false,
    simulationStepCount: 0,
  });
};

// ============================================================================
// AC-122-001: Gate Placement Tests
// ============================================================================

describe('AC-122-001: Gate Placement', () => {
  beforeEach(() => { resetCircuitStore(); });
  afterEach(() => { resetCircuitStore(); });

  it('should add AND gate to canvas', () => {
    useCircuitCanvasStore.getState().addCircuitNode('gate', 400, 300, 'AND', 'AND');
    const nodes = useCircuitCanvasStore.getState().nodes;
    
    expect(nodes.length).toBe(1);
    expect(nodes[0].type).toBe('gate');
    expect((nodes[0] as PlacedGateNode).gateType).toBe('AND');
    expect(nodes[0].position).toEqual({ x: 400, y: 300 });
  });

  it('should add OR gate with correct gateType', () => {
    useCircuitCanvasStore.getState().addCircuitNode('gate', 400, 300, 'OR', 'OR');
    const nodes = useCircuitCanvasStore.getState().nodes;
    
    expect((nodes[0] as PlacedGateNode).gateType).toBe('OR');
  });

  it('should add NOT gate with correct gateType', () => {
    useCircuitCanvasStore.getState().addCircuitNode('gate', 400, 300, 'NOT', 'NOT');
    const nodes = useCircuitCanvasStore.getState().nodes;
    
    expect((nodes[0] as PlacedGateNode).gateType).toBe('NOT');
  });

  it('should add NAND gate with correct gateType', () => {
    useCircuitCanvasStore.getState().addCircuitNode('gate', 400, 300, 'NAND', 'NAND');
    const nodes = useCircuitCanvasStore.getState().nodes;
    
    expect((nodes[0] as PlacedGateNode).gateType).toBe('NAND');
  });

  it('should add NOR gate with correct gateType', () => {
    useCircuitCanvasStore.getState().addCircuitNode('gate', 400, 300, 'NOR', 'NOR');
    const nodes = useCircuitCanvasStore.getState().nodes;
    
    expect((nodes[0] as PlacedGateNode).gateType).toBe('NOR');
  });

  it('should add XOR gate with correct gateType', () => {
    useCircuitCanvasStore.getState().addCircuitNode('gate', 400, 300, 'XOR', 'XOR');
    const nodes = useCircuitCanvasStore.getState().nodes;
    
    expect((nodes[0] as PlacedGateNode).gateType).toBe('XOR');
  });

  it('should add XNOR gate with correct gateType', () => {
    useCircuitCanvasStore.getState().addCircuitNode('gate', 400, 300, 'XNOR', 'XNOR');
    const nodes = useCircuitCanvasStore.getState().nodes;
    
    expect((nodes[0] as PlacedGateNode).gateType).toBe('XNOR');
  });
});

// ============================================================================
// AC-122-002: InputNode/OutputNode Placement Tests
// ============================================================================

describe('AC-122-002: InputNode/OutputNode Placement', () => {
  beforeEach(() => { resetCircuitStore(); });
  afterEach(() => { resetCircuitStore(); });

  it('should add InputNode to canvas', () => {
    useCircuitCanvasStore.getState().addCircuitNode('input', 400, 300, undefined, 'IN');
    const nodes = useCircuitCanvasStore.getState().nodes;
    
    expect(nodes.length).toBe(1);
    expect(nodes[0].type).toBe('input');
    expect(nodes[0].label).toBe('IN');
    expect((nodes[0] as PlacedInputNode).state).toBe(false);
  });

  it('should add OutputNode to canvas', () => {
    useCircuitCanvasStore.getState().addCircuitNode('output', 400, 300, undefined, 'OUT');
    const nodes = useCircuitCanvasStore.getState().nodes;
    
    expect(nodes[0].type).toBe('output');
    expect(nodes[0].label).toBe('OUT');
  });

  it('should track nodes in store after addition', () => {
    useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100, undefined, 'IN1');
    useCircuitCanvasStore.getState().addCircuitNode('output', 500, 100, undefined, 'OUT1');
    const nodes = useCircuitCanvasStore.getState().nodes;
    
    expect(nodes.length).toBe(2);
    expect(nodes.some(n => n.type === 'input')).toBe(true);
    expect(nodes.some(n => n.type === 'output')).toBe(true);
  });
});

// ============================================================================
// AC-122-003: Node Manipulation Tests
// ============================================================================

describe('AC-122-003: Node Manipulation', () => {
  beforeEach(() => { resetCircuitStore(); });
  afterEach(() => { resetCircuitStore(); });

  it('should select node on click', () => {
    const node = useCircuitCanvasStore.getState().addCircuitNode('input', 400, 300);
    useCircuitCanvasStore.getState().selectCircuitNode(node.id);
    
    expect(useCircuitCanvasStore.getState().selectedNodeId).toBe(node.id);
  });

  it('should update node position after drag', () => {
    const node = useCircuitCanvasStore.getState().addCircuitNode('input', 400, 300);
    useCircuitCanvasStore.getState().updateNodePosition(node.id, 500, 400);
    
    const updatedNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === node.id);
    expect(updatedNode?.position).toEqual({ x: 500, y: 400 });
  });

  it('should delete node via store action', () => {
    const node = useCircuitCanvasStore.getState().addCircuitNode('input', 400, 300);
    useCircuitCanvasStore.getState().selectCircuitNode(node.id);
    useCircuitCanvasStore.getState().removeCircuitNode(node.id);
    
    expect(useCircuitCanvasStore.getState().nodes.length).toBe(0);
    expect(useCircuitCanvasStore.getState().selectedNodeId).toBeNull();
  });

  it('should remove all node connections when node is deleted', () => {
    const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 300);
    const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 500, 300);
    
    useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
    useCircuitCanvasStore.getState().removeCircuitNode(inputNode.id);
    
    expect(useCircuitCanvasStore.getState().wires.length).toBe(0);
  });
});

// ============================================================================
// AC-122-004: Wire Signal Visualization Tests
// ============================================================================

describe('AC-122-004: Wire Signal Visualization', () => {
  beforeEach(() => { resetCircuitStore(); });
  afterEach(() => { resetCircuitStore(); });

  it('should create wire between nodes', () => {
    const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 300);
    const gateNode = useCircuitCanvasStore.getState().addCircuitNode('gate', 400, 300, 'AND');
    
    const wire = useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, gateNode.id, 0);
    
    expect(wire).toBeDefined();
    expect(wire?.sourceNodeId).toBe(inputNode.id);
    expect(wire?.targetNodeId).toBe(gateNode.id);
  });

  it('should have wire signal default to LOW', () => {
    const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 300);
    const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 500, 300);
    
    useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
    
    const wire = useCircuitCanvasStore.getState().wires[0];
    expect(wire.signal).toBe(false);
  });
});

// ============================================================================
// AC-122-005: Signal Propagation Tests
// ============================================================================

describe('AC-122-005: Signal Propagation', () => {
  beforeEach(() => { resetCircuitStore(); });
  afterEach(() => { resetCircuitStore(); });

  it('should run simulation', () => {
    const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 300);
    
    useCircuitCanvasStore.getState().toggleCircuitInput(inputNode.id);
    // toggleCircuitInput already runs simulation once, so step count should be >= 1
    expect(useCircuitCanvasStore.getState().simulationStepCount).toBeGreaterThanOrEqual(1);
  });

  it('should toggle input node state', () => {
    const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 300);
    
    expect((node as PlacedInputNode).state).toBe(false);
    
    useCircuitCanvasStore.getState().toggleCircuitInput(node.id);
    
    const updatedNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === node.id) as PlacedInputNode;
    expect(updatedNode.state).toBe(true);
  });
});

// ============================================================================
// AC-122-006: Simulation Controls Tests
// ============================================================================

describe('AC-122-006: Simulation Controls', () => {
  beforeEach(() => { resetCircuitStore(); });
  afterEach(() => { resetCircuitStore(); });

  it('should increment simulation step count on run', () => {
    const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 300);
    
    useCircuitCanvasStore.getState().toggleCircuitInput(inputNode.id);
    // toggleCircuitInput already runs simulation once, so step count should be >= 1
    expect(useCircuitCanvasStore.getState().simulationStepCount).toBeGreaterThanOrEqual(1);
  });

  it('should reset simulation', () => {
    const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 300);
    
    useCircuitCanvasStore.getState().toggleCircuitInput(inputNode.id);
    useCircuitCanvasStore.getState().resetCircuitSimulation();
    
    const input = useCircuitCanvasStore.getState().nodes.find(n => n.id === inputNode.id) as PlacedInputNode;
    expect(input.state).toBe(false);
  });

  it('should clear circuit', () => {
    useCircuitCanvasStore.getState().addCircuitNode('input', 100, 300);
    useCircuitCanvasStore.getState().addCircuitNode('gate', 400, 300, 'AND');
    useCircuitCanvasStore.getState().addCircuitNode('output', 700, 300);
    
    useCircuitCanvasStore.getState().clearCircuitCanvas();
    
    expect(useCircuitCanvasStore.getState().nodes.length).toBe(0);
    expect(useCircuitCanvasStore.getState().wires.length).toBe(0);
  });
});

// ============================================================================
// AC-122-007: Cycle Detection UI Tests
// ============================================================================

describe('AC-122-007: Cycle Detection UI', () => {
  beforeEach(() => { resetCircuitStore(); });
  afterEach(() => { resetCircuitStore(); });

  it('should have empty cycle affected nodes for valid circuit', () => {
    const input = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 300);
    const andGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 400, 300, 'AND');
    const output = useCircuitCanvasStore.getState().addCircuitNode('output', 700, 300);
    
    useCircuitCanvasStore.getState().addCircuitWire(input.id, andGate.id, 0);
    useCircuitCanvasStore.getState().addCircuitWire(andGate.id, output.id, 0);
    
    useCircuitCanvasStore.getState().runCircuitSimulation();
    
    expect(useCircuitCanvasStore.getState().cycleAffectedNodeIds.length).toBe(0);
  });
});

// ============================================================================
// AC-122-008: Non-Regression Tests
// ============================================================================

describe('AC-122-008: Non-Regression', () => {
  beforeEach(() => { resetCircuitStore(); });
  afterEach(() => { resetCircuitStore(); });

  it('should not affect existing module store when operating on circuit store', () => {
    const machineCount = useMachineStore.getState().modules.length;
    
    // Add circuit nodes
    useCircuitCanvasStore.getState().addCircuitNode('input', 100, 300);
    useCircuitCanvasStore.getState().addCircuitNode('output', 500, 300);
    
    // Machine store should be unaffected
    expect(useMachineStore.getState().modules.length).toBe(machineCount);
  });
});

// ============================================================================
// Store Store Tests
// ============================================================================

describe('Circuit Canvas Store', () => {
  beforeEach(() => { resetCircuitStore(); });
  afterEach(() => { resetCircuitStore(); });

  it('should toggle circuit mode', () => {
    expect(useCircuitCanvasStore.getState().isCircuitMode).toBe(false);
    
    useCircuitCanvasStore.getState().setCircuitMode(true);
    expect(useCircuitCanvasStore.getState().isCircuitMode).toBe(true);
    
    useCircuitCanvasStore.getState().setCircuitMode(false);
    expect(useCircuitCanvasStore.getState().isCircuitMode).toBe(false);
  });

  it('should get all input nodes', () => {
    useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100, undefined, 'A');
    useCircuitCanvasStore.getState().addCircuitNode('input', 100, 200, undefined, 'B');
    useCircuitCanvasStore.getState().addCircuitNode('output', 500, 150, undefined, 'Y');
    
    const inputNodes = useCircuitCanvasStore.getState().getInputNodes();
    expect(inputNodes.length).toBe(2);
  });

  it('should get all gate nodes', () => {
    useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
    useCircuitCanvasStore.getState().addCircuitNode('gate', 300, 100, 'AND');
    useCircuitCanvasStore.getState().addCircuitNode('gate', 500, 100, 'OR');
    useCircuitCanvasStore.getState().addCircuitNode('output', 700, 100);
    
    const gateNodes = useCircuitCanvasStore.getState().getGateNodes();
    expect(gateNodes.length).toBe(2);
    expect(gateNodes[0].gateType).toBe('AND');
    expect(gateNodes[1].gateType).toBe('OR');
  });
});
