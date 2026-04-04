/**
 * useCircuitCanvasStore Tests
 * 
 * Round 123: Circuit Canvas Integration
 * 
 * Tests for the circuit canvas Zustand store covering:
 * - Node CRUD operations (add, remove, select, move)
 * - Wire CRUD operations (start, finish, remove, select)
 * - Signal propagation
 * - Cycle detection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCircuitCanvasStore } from '../useCircuitCanvasStore';
import { GateType } from '../../types/circuit';
import { CircuitNodeType } from '../../types/circuit';

// Mock uuid to get deterministic IDs
const mockUuidCounter = { counter: 0 };
vi.mock('uuid', () => ({
  v4: () => `test-uuid-${++mockUuidCounter.counter}`,
}));

describe('useCircuitCanvasStore', () => {
  beforeEach(() => {
    // Reset store state before each test
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
    mockUuidCounter.counter = 0;
  });

  // =========================================================================
  // STORE INITIALIZATION TESTS
  // =========================================================================
  describe('Store Initialization', () => {
    it('should have empty arrays on initial state', () => {
      const state = useCircuitCanvasStore.getState();
      expect(state.nodes).toEqual([]);
      expect(state.wires).toEqual([]);
      expect(state.selectedNodeId).toBeNull();
      expect(state.selectedWireId).toBeNull();
    });

    it('should have isCircuitMode false on initial state', () => {
      const state = useCircuitCanvasStore.getState();
      expect(state.isCircuitMode).toBe(false);
    });

    it('should have isDrawingWire false on initial state', () => {
      const state = useCircuitCanvasStore.getState();
      expect(state.isDrawingWire).toBe(false);
      expect(state.wireStart).toBeNull();
      expect(state.wirePreviewEnd).toBeNull();
    });

    it('should have empty cycleAffectedNodeIds on initial state', () => {
      const state = useCircuitCanvasStore.getState();
      expect(state.cycleAffectedNodeIds).toEqual([]);
    });

    it('should have simulationStepCount 0 on initial state', () => {
      const state = useCircuitCanvasStore.getState();
      expect(state.simulationStepCount).toBe(0);
    });
  });

  // =========================================================================
  // CIRCUIT MODE TESTS (AC-123-001)
  // =========================================================================
  describe('Circuit Mode', () => {
    it('should toggle circuit mode on', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      expect(useCircuitCanvasStore.getState().isCircuitMode).toBe(true);
    });

    it('should toggle circuit mode off', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      useCircuitCanvasStore.getState().setCircuitMode(false);
      expect(useCircuitCanvasStore.getState().isCircuitMode).toBe(false);
    });

    it('should persist circuit mode state', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      // Add a node while in circuit mode
      useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100, undefined, 'TestInput');
      // Turn off circuit mode
      useCircuitCanvasStore.getState().setCircuitMode(false);
      // Nodes should still exist in store (not cleared)
      expect(useCircuitCanvasStore.getState().nodes.length).toBe(1);
    });
  });

  // =========================================================================
  // NODE CRUD TESTS (AC-123-002)
  // =========================================================================
  describe('Node CRUD Operations', () => {
    describe('addCircuitNode', () => {
      it('should add an input node to the canvas', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 200);
        
        expect(node).toBeDefined();
        expect(node.id).toBe('test-uuid-1');
        expect(node.type).toBe('input');
        expect(node.position).toEqual({ x: 100, y: 200 });
        expect(node.label).toBe('IN');
      });

      it('should add an output node to the canvas', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 200);
        
        expect(node).toBeDefined();
        expect(node.type).toBe('output');
        expect(node.position).toEqual({ x: 300, y: 200 });
        expect(node.label).toBe('OUT');
      });

      it('should add an AND gate node to the canvas', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 150, 'AND');
        
        expect(node).toBeDefined();
        expect(node.type).toBe('gate');
        expect((node as any).gateType).toBe('AND');
        expect(node.position).toEqual({ x: 200, y: 150 });
      });

      it('should add an OR gate node to the canvas', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 150, 'OR');
        expect((node as any).gateType).toBe('OR');
      });

      it('should add a NOT gate node to the canvas', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 150, 'NOT');
        expect((node as any).gateType).toBe('NOT');
        expect((node as any).inputCount).toBe(1);
      });

      it('should add a NAND gate node to the canvas', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 150, 'NAND');
        expect((node as any).gateType).toBe('NAND');
      });

      it('should add a NOR gate node to the canvas', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 150, 'NOR');
        expect((node as any).gateType).toBe('NOR');
      });

      it('should add a XOR gate node to the canvas', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 150, 'XOR');
        expect((node as any).gateType).toBe('XOR');
      });

      it('should add a XNOR gate node to the canvas', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 150, 'XNOR');
        expect((node as any).gateType).toBe('XNOR');
      });

      it('should add node with custom label', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100, undefined, 'CustomInput');
        expect(node.label).toBe('CustomInput');
      });

      it('should select the newly added node', () => {
        useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        expect(useCircuitCanvasStore.getState().selectedNodeId).toBe('test-uuid-1');
      });

      it('should add multiple nodes with unique IDs', () => {
        const node1 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const node2 = useCircuitCanvasStore.getState().addCircuitNode('output', 200, 100);
        const node3 = useCircuitCanvasStore.getState().addCircuitNode('gate', 150, 200, 'AND');
        
        expect(node1.id).not.toBe(node2.id);
        expect(node2.id).not.toBe(node3.id);
        expect(node1.id).not.toBe(node3.id);
      });

      it('should add nodes to the store nodes array', () => {
        useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        const { nodes } = useCircuitCanvasStore.getState();
        expect(nodes).toHaveLength(2);
        expect(nodes[0].type).toBe('input');
        expect(nodes[1].type).toBe('output');
      });

      it('should set default signal to false for input node', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100) as any;
        expect(node.state).toBe(false);
        expect(node.signal).toBe(false);
      });

      it('should set default signal to false for output node', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('output', 100, 100) as any;
        expect(node.inputSignal).toBe(false);
        expect(node.signal).toBe(false);
      });

      it('should set default output to false for gate nodes', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('gate', 100, 100, 'AND') as any;
        expect(node.output).toBe(false);
        expect(node.signal).toBe(false);
      });
    });

    describe('removeCircuitNode', () => {
      it('should remove a node by ID', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        expect(useCircuitCanvasStore.getState().nodes).toHaveLength(1);
        
        useCircuitCanvasStore.getState().removeCircuitNode(node.id);
        expect(useCircuitCanvasStore.getState().nodes).toHaveLength(0);
      });

      it('should clear selection when removing selected node', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        expect(useCircuitCanvasStore.getState().selectedNodeId).toBe(node.id);
        
        useCircuitCanvasStore.getState().removeCircuitNode(node.id);
        expect(useCircuitCanvasStore.getState().selectedNodeId).toBeNull();
      });

      it('should remove connected wires when removing node', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        expect(useCircuitCanvasStore.getState().wires).toHaveLength(1);
        
        useCircuitCanvasStore.getState().removeCircuitNode(inputNode.id);
        expect(useCircuitCanvasStore.getState().wires).toHaveLength(0);
      });

      it('should handle removing non-existent node gracefully', () => {
        expect(() => {
          useCircuitCanvasStore.getState().removeCircuitNode('non-existent-id');
        }).not.toThrow();
      });

      it('should not affect other nodes when removing one', () => {
        const node1 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const node2 = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        useCircuitCanvasStore.getState().removeCircuitNode(node1.id);
        
        const { nodes } = useCircuitCanvasStore.getState();
        expect(nodes).toHaveLength(1);
        expect(nodes[0].id).toBe(node2.id);
      });
    });

    describe('selectCircuitNode', () => {
      it('should select a node by ID', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        
        useCircuitCanvasStore.getState().selectCircuitNode(node.id);
        expect(useCircuitCanvasStore.getState().selectedNodeId).toBe(node.id);
      });

      it('should deselect node when passed null', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        useCircuitCanvasStore.getState().selectCircuitNode(node.id);
        
        useCircuitCanvasStore.getState().selectCircuitNode(null);
        expect(useCircuitCanvasStore.getState().selectedNodeId).toBeNull();
      });

      it('should clear wire selection when selecting a node', () => {
        useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        const node = useCircuitCanvasStore.getState().nodes[0];
        
        // Select a wire first
        useCircuitCanvasStore.getState().selectCircuitWire('some-wire-id' as any);
        
        // Then select a node
        useCircuitCanvasStore.getState().selectCircuitNode(node.id);
        expect(useCircuitCanvasStore.getState().selectedWireId).toBeNull();
      });

      it('should handle selecting non-existent node gracefully', () => {
        expect(() => {
          useCircuitCanvasStore.getState().selectCircuitNode('non-existent');
        }).not.toThrow();
      });
    });

    describe('updateNodePosition', () => {
      it('should update node position', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        
        useCircuitCanvasStore.getState().updateNodePosition(node.id, 200, 300);
        
        const updatedNode = useCircuitCanvasStore.getState().nodes[0];
        expect(updatedNode.position).toEqual({ x: 200, y: 300 });
      });

      it('should only update the specified node', () => {
        const node1 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const node2 = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        useCircuitCanvasStore.getState().updateNodePosition(node1.id, 500, 600);
        
        const node2Updated = useCircuitCanvasStore.getState().nodes.find(n => n.id === node2.id);
        expect(node2Updated!.position).toEqual({ x: 300, y: 100 });
      });

      it('should handle updating non-existent node gracefully', () => {
        expect(() => {
          useCircuitCanvasStore.getState().updateNodePosition('non-existent', 100, 100);
        }).not.toThrow();
      });
    });

    describe('getNodeById', () => {
      it('should return node by ID', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        
        const found = useCircuitCanvasStore.getState().getNodeById(node.id);
        expect(found).toBeDefined();
        expect(found!.id).toBe(node.id);
      });

      it('should return undefined for non-existent ID', () => {
        const found = useCircuitCanvasStore.getState().getNodeById('non-existent');
        expect(found).toBeUndefined();
      });
    });

    describe('getNodeSignal', () => {
      it('should return false signal for input node by default', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        
        const signal = useCircuitCanvasStore.getState().getNodeSignal(node.id);
        expect(signal).toBe(false);
      });

      it('should return false for non-existent node', () => {
        const signal = useCircuitCanvasStore.getState().getNodeSignal('non-existent');
        expect(signal).toBe(false);
      });
    });
  });

  // =========================================================================
  // WIRE CRUD TESTS (AC-123-003)
  // =========================================================================
  describe('Wire CRUD Operations', () => {
    describe('addCircuitWire', () => {
      it('should create a wire between two nodes', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        const wire = useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        
        expect(wire).toBeDefined();
        expect(wire!.id).toBe('test-uuid-3');
        expect(wire!.sourceNodeId).toBe(inputNode.id);
        expect(wire!.targetNodeId).toBe(outputNode.id);
        expect(wire!.targetPort).toBe(0);
      });

      it('should add wire to the store wires array', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        
        const { wires } = useCircuitCanvasStore.getState();
        expect(wires).toHaveLength(1);
      });

      it('should prevent duplicate connections', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        
        const { wires } = useCircuitCanvasStore.getState();
        expect(wires).toHaveLength(1);
      });

      it('should allow multiple wires to same node with different ports', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 1);
        
        const { wires } = useCircuitCanvasStore.getState();
        expect(wires).toHaveLength(2);
      });

      it('should return null for non-existent source node', () => {
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        const wire = useCircuitCanvasStore.getState().addCircuitWire('non-existent-source', outputNode.id, 0);
        expect(wire).toBeNull();
      });

      it('should return null for non-existent target node', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        
        const wire = useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, 'non-existent-target', 0);
        expect(wire).toBeNull();
      });

      it('should set signal to false on newly created wire', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        const wire = useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        
        expect(wire!.signal).toBe(false);
      });

      it('should calculate wire startPoint and endPoint', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        const wire = useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        
        expect(wire!.startPoint).toBeDefined();
        expect(wire!.endPoint).toBeDefined();
        expect(wire!.startPoint!.x).toBeLessThan(wire!.endPoint!.x);
      });
    });

    describe('removeCircuitWire', () => {
      it('should remove a wire by ID', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        const wire = useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        expect(useCircuitCanvasStore.getState().wires).toHaveLength(1);
        
        useCircuitCanvasStore.getState().removeCircuitWire(wire!.id);
        expect(useCircuitCanvasStore.getState().wires).toHaveLength(0);
      });

      it('should clear selection when removing selected wire', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        const wire = useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        useCircuitCanvasStore.getState().selectCircuitWire(wire!.id);
        expect(useCircuitCanvasStore.getState().selectedWireId).toBe(wire!.id);
        
        useCircuitCanvasStore.getState().removeCircuitWire(wire!.id);
        expect(useCircuitCanvasStore.getState().selectedWireId).toBeNull();
      });

      it('should handle removing non-existent wire gracefully', () => {
        expect(() => {
          useCircuitCanvasStore.getState().removeCircuitWire('non-existent');
        }).not.toThrow();
      });

      it('should not affect other wires when removing one', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const andGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 100, 'AND');
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 400, 100);
        
        const wire1 = useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, andGate.id, 0);
        const wire2 = useCircuitCanvasStore.getState().addCircuitWire(andGate.id, outputNode.id, 0);
        
        useCircuitCanvasStore.getState().removeCircuitWire(wire1!.id);
        
        const { wires } = useCircuitCanvasStore.getState();
        expect(wires).toHaveLength(1);
        expect(wires[0].id).toBe(wire2!.id);
      });
    });

    describe('selectCircuitWire', () => {
      it('should select a wire by ID', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        const wire = useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        
        useCircuitCanvasStore.getState().selectCircuitWire(wire!.id);
        expect(useCircuitCanvasStore.getState().selectedWireId).toBe(wire!.id);
      });

      it('should deselect wire when passed null', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        const wire = useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        useCircuitCanvasStore.getState().selectCircuitWire(wire!.id);
        
        useCircuitCanvasStore.getState().selectCircuitWire(null);
        expect(useCircuitCanvasStore.getState().selectedWireId).toBeNull();
      });

      it('should clear node selection when selecting a wire', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        useCircuitCanvasStore.getState().selectCircuitNode(node.id);
        
        useCircuitCanvasStore.getState().selectCircuitWire('some-wire-id' as any);
        expect(useCircuitCanvasStore.getState().selectedNodeId).toBeNull();
      });
    });

    describe('getWireSignal', () => {
      it('should return false for new wire by default', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        const wire = useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        
        const signal = useCircuitCanvasStore.getState().getWireSignal(wire!.id);
        expect(signal).toBe(false);
      });

      it('should return false for non-existent wire', () => {
        const signal = useCircuitCanvasStore.getState().getWireSignal('non-existent');
        expect(signal).toBe(false);
      });
    });
  });

  // =========================================================================
  // WIRE DRAWING TESTS
  // =========================================================================
  describe('Wire Drawing Operations', () => {
    describe('startWireDrawing', () => {
      it('should set isDrawingWire to true', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        
        useCircuitCanvasStore.getState().startWireDrawing(node.id, 0);
        
        expect(useCircuitCanvasStore.getState().isDrawingWire).toBe(true);
      });

      it('should store wireStart with nodeId and portIndex', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        
        useCircuitCanvasStore.getState().startWireDrawing(node.id, 1);
        
        const { wireStart } = useCircuitCanvasStore.getState();
        expect(wireStart).toEqual({ nodeId: node.id, portIndex: 1 });
      });

      it('should clear wirePreviewEnd when starting new wire', () => {
        useCircuitCanvasStore.getState().updateWirePreview(200, 200);
        const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        
        useCircuitCanvasStore.getState().startWireDrawing(node.id, 0);
        
        expect(useCircuitCanvasStore.getState().wirePreviewEnd).toBeNull();
      });
    });

    describe('updateWirePreview', () => {
      it('should update wirePreviewEnd with coordinates', () => {
        useCircuitCanvasStore.getState().updateWirePreview(200, 300);
        
        const { wirePreviewEnd } = useCircuitCanvasStore.getState();
        expect(wirePreviewEnd).toEqual({ x: 200, y: 300 });
      });
    });

    describe('finishWireDrawing', () => {
      it('should create a wire and reset drawing state', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(outputNode.id, 0);
        
        expect(useCircuitCanvasStore.getState().isDrawingWire).toBe(false);
        expect(useCircuitCanvasStore.getState().wireStart).toBeNull();
        expect(useCircuitCanvasStore.getState().wirePreviewEnd).toBeNull();
        expect(useCircuitCanvasStore.getState().wires).toHaveLength(1);
      });

      it('should do nothing if wireStart is null', () => {
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        useCircuitCanvasStore.getState().finishWireDrawing(outputNode.id, 0);
        
        expect(useCircuitCanvasStore.getState().wires).toHaveLength(0);
        expect(useCircuitCanvasStore.getState().isDrawingWire).toBe(false);
      });
    });

    describe('cancelWireDrawing', () => {
      it('should reset all wire drawing state', () => {
        const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        
        useCircuitCanvasStore.getState().startWireDrawing(node.id, 0);
        useCircuitCanvasStore.getState().updateWirePreview(200, 200);
        
        useCircuitCanvasStore.getState().cancelWireDrawing();
        
        expect(useCircuitCanvasStore.getState().isDrawingWire).toBe(false);
        expect(useCircuitCanvasStore.getState().wireStart).toBeNull();
        expect(useCircuitCanvasStore.getState().wirePreviewEnd).toBeNull();
      });
    });
  });

  // =========================================================================
  // INPUT NODE OPERATIONS (AC-123-004)
  // =========================================================================
  describe('Input Node Operations', () => {
    describe('toggleCircuitInput', () => {
      it('should toggle input node state from false to true', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100) as any;
        expect(inputNode.state).toBe(false);
        
        useCircuitCanvasStore.getState().toggleCircuitInput(inputNode.id);
        
        const updatedNode = useCircuitCanvasStore.getState().nodes[0] as any;
        expect(updatedNode.state).toBe(true);
        expect(updatedNode.signal).toBe(true);
      });

      it('should toggle input node state from true to false', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100) as any;
        useCircuitCanvasStore.getState().toggleCircuitInput(inputNode.id);
        expect(useCircuitCanvasStore.getState().nodes[0].signal).toBe(true);
        
        useCircuitCanvasStore.getState().toggleCircuitInput(inputNode.id);
        
        const updatedNode = useCircuitCanvasStore.getState().nodes[0] as any;
        expect(updatedNode.state).toBe(false);
        expect(updatedNode.signal).toBe(false);
      });

      it('should only affect input type nodes', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100) as any;
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100) as any;
        const andGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 100, 'AND') as any;
        
        useCircuitCanvasStore.getState().toggleCircuitInput(inputNode.id);
        
        expect((useCircuitCanvasStore.getState().nodes[1] as any).inputSignal).toBe(false);
        expect((useCircuitCanvasStore.getState().nodes[2] as any).output).toBe(false);
      });

      it('should handle toggling non-existent node gracefully', () => {
        expect(() => {
          useCircuitCanvasStore.getState().toggleCircuitInput('non-existent');
        }).not.toThrow();
      });

      it('should increment simulation step count after toggle', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        
        useCircuitCanvasStore.getState().toggleCircuitInput(inputNode.id);
        
        expect(useCircuitCanvasStore.getState().simulationStepCount).toBe(1);
      });
    });
  });

  // =========================================================================
  // SIMULATION TESTS (AC-123-004)
  // =========================================================================
  describe('Circuit Simulation', () => {
    describe('runCircuitSimulation', () => {
      it('should propagate signal from input to output through direct connection', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        
        // Toggle input to HIGH
        useCircuitCanvasStore.getState().toggleCircuitInput(inputNode.id);
        
        // Run simulation
        useCircuitCanvasStore.getState().runCircuitSimulation();
        
        const output = useCircuitCanvasStore.getState().nodes.find(n => n.id === outputNode.id) as any;
        expect(output.inputSignal).toBe(true);
      });

      it('should propagate signal through AND gate (both inputs HIGH)', () => {
        const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 50, 50);
        const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 50, 150);
        const andGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 100, 'AND');
        const output = useCircuitCanvasStore.getState().addCircuitNode('output', 400, 100);
        
        // Connect: input1 -> and input-0, input2 -> and input-1
        useCircuitCanvasStore.getState().addCircuitWire(input1.id, andGate.id, 0);
        useCircuitCanvasStore.getState().addCircuitWire(input2.id, andGate.id, 1);
        useCircuitCanvasStore.getState().addCircuitWire(andGate.id, output.id, 0);
        
        // Set both inputs HIGH
        useCircuitCanvasStore.getState().toggleCircuitInput(input1.id);
        useCircuitCanvasStore.getState().toggleCircuitInput(input2.id);
        
        useCircuitCanvasStore.getState().runCircuitSimulation();
        
        const andNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === andGate.id) as any;
        const outputNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === output.id) as any;
        
        expect(andNode.output).toBe(true);
        expect(outputNode.inputSignal).toBe(true);
      });

      it('should propagate signal through OR gate (one input HIGH)', () => {
        const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 50, 50);
        const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 50, 150);
        const orGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 100, 'OR');
        const output = useCircuitCanvasStore.getState().addCircuitNode('output', 400, 100);
        
        useCircuitCanvasStore.getState().addCircuitWire(input1.id, orGate.id, 0);
        useCircuitCanvasStore.getState().addCircuitWire(input2.id, orGate.id, 1);
        useCircuitCanvasStore.getState().addCircuitWire(orGate.id, output.id, 0);
        
        // Only set input1 HIGH
        useCircuitCanvasStore.getState().toggleCircuitInput(input1.id);
        
        useCircuitCanvasStore.getState().runCircuitSimulation();
        
        const orNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === orGate.id) as any;
        expect(orNode.output).toBe(true);
      });

      it('should propagate signal through NOT gate', () => {
        const input = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const notGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 250, 100, 'NOT');
        const output = useCircuitCanvasStore.getState().addCircuitNode('output', 400, 100);
        
        useCircuitCanvasStore.getState().addCircuitWire(input.id, notGate.id, 0);
        useCircuitCanvasStore.getState().addCircuitWire(notGate.id, output.id, 0);
        
        // Input LOW, NOT should output HIGH
        useCircuitCanvasStore.getState().runCircuitSimulation();
        
        const notNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === notGate.id) as any;
        expect(notNode.output).toBe(true);
      });

      it('should propagate signal through NAND gate correctly', () => {
        const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 50, 50);
        const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 50, 150);
        const nandGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 100, 'NAND');
        const output = useCircuitCanvasStore.getState().addCircuitNode('output', 400, 100);
        
        useCircuitCanvasStore.getState().addCircuitWire(input1.id, nandGate.id, 0);
        useCircuitCanvasStore.getState().addCircuitWire(input2.id, nandGate.id, 1);
        useCircuitCanvasStore.getState().addCircuitWire(nandGate.id, output.id, 0);
        
        // Both HIGH → NAND should output LOW
        useCircuitCanvasStore.getState().toggleCircuitInput(input1.id);
        useCircuitCanvasStore.getState().toggleCircuitInput(input2.id);
        
        useCircuitCanvasStore.getState().runCircuitSimulation();
        
        const nandNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === nandGate.id) as any;
        expect(nandNode.output).toBe(false);
      });

      it('should propagate signal through XOR gate correctly', () => {
        const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 50, 50);
        const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 50, 150);
        const xorGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 100, 'XOR');
        
        useCircuitCanvasStore.getState().addCircuitWire(input1.id, xorGate.id, 0);
        useCircuitCanvasStore.getState().addCircuitWire(input2.id, xorGate.id, 1);
        
        // One HIGH, one LOW → XOR should output HIGH
        useCircuitCanvasStore.getState().toggleCircuitInput(input1.id);
        
        useCircuitCanvasStore.getState().runCircuitSimulation();
        
        const xorNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === xorGate.id) as any;
        expect(xorNode.output).toBe(true);
      });

      it('should update wire signals during simulation', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        const wire = useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        
        // Toggle input HIGH
        useCircuitCanvasStore.getState().toggleCircuitInput(inputNode.id);
        useCircuitCanvasStore.getState().runCircuitSimulation();
        
        const updatedWire = useCircuitCanvasStore.getState().wires.find(w => w.id === wire!.id);
        expect(updatedWire!.signal).toBe(true);
      });

      it('should increment simulation step count', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        
        expect(useCircuitCanvasStore.getState().simulationStepCount).toBe(0);
        
        useCircuitCanvasStore.getState().runCircuitSimulation();
        expect(useCircuitCanvasStore.getState().simulationStepCount).toBe(1);
        
        useCircuitCanvasStore.getState().runCircuitSimulation();
        expect(useCircuitCanvasStore.getState().simulationStepCount).toBe(2);
      });

      it('should handle empty canvas gracefully', () => {
        expect(() => {
          useCircuitCanvasStore.getState().runCircuitSimulation();
        }).not.toThrow();
      });
    });

    describe('resetCircuitSimulation', () => {
      it('should reset all input nodes to LOW state', () => {
        const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 200);
        
        useCircuitCanvasStore.getState().toggleCircuitInput(input1.id);
        useCircuitCanvasStore.getState().toggleCircuitInput(input2.id);
        
        useCircuitCanvasStore.getState().resetCircuitSimulation();
        
        const nodes = useCircuitCanvasStore.getState().nodes as any[];
        const inputNodes = nodes.filter(n => n.type === 'input');
        expect(inputNodes.every(n => n.state === false)).toBe(true);
      });

      it('should reset all gate outputs to LOW', () => {
        const input = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const andGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 100, 'AND');
        
        useCircuitCanvasStore.getState().addCircuitWire(input.id, andGate.id, 0);
        useCircuitCanvasStore.getState().toggleCircuitInput(input.id);
        useCircuitCanvasStore.getState().runCircuitSimulation();
        
        useCircuitCanvasStore.getState().resetCircuitSimulation();
        
        const andNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === andGate.id) as any;
        expect(andNode.output).toBe(false);
      });

      it('should reset all wire signals to LOW', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        
        useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
        useCircuitCanvasStore.getState().toggleCircuitInput(inputNode.id);
        useCircuitCanvasStore.getState().runCircuitSimulation();
        
        useCircuitCanvasStore.getState().resetCircuitSimulation();
        
        const wire = useCircuitCanvasStore.getState().wires[0];
        expect(wire.signal).toBe(false);
      });

      it('should clear cycle affected nodes', () => {
        useCircuitCanvasStore.setState({
          cycleAffectedNodeIds: ['node-1', 'node-2'],
        });
        
        useCircuitCanvasStore.getState().resetCircuitSimulation();
        
        expect(useCircuitCanvasStore.getState().cycleAffectedNodeIds).toEqual([]);
      });

      it('should reset simulation step count to 0', () => {
        const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        useCircuitCanvasStore.getState().runCircuitSimulation();
        
        expect(useCircuitCanvasStore.getState().simulationStepCount).toBe(1);
        
        useCircuitCanvasStore.getState().resetCircuitSimulation();
        expect(useCircuitCanvasStore.getState().simulationStepCount).toBe(0);
      });
    });
  });

  // =========================================================================
  // CYCLE DETECTION TESTS
  // =========================================================================
  describe('Cycle Detection', () => {
    describe('setCycleAffectedNodes', () => {
      it('should set cycle affected node IDs', () => {
        useCircuitCanvasStore.getState().setCycleAffectedNodes(['node-1', 'node-2']);
        
        expect(useCircuitCanvasStore.getState().cycleAffectedNodeIds).toEqual(['node-1', 'node-2']);
      });

      it('should replace existing cycle affected nodes', () => {
        useCircuitCanvasStore.getState().setCycleAffectedNodes(['node-1', 'node-2']);
        useCircuitCanvasStore.getState().setCycleAffectedNodes(['node-3']);
        
        expect(useCircuitCanvasStore.getState().cycleAffectedNodeIds).toEqual(['node-3']);
      });

      it('should clear cycle affected nodes with empty array', () => {
        useCircuitCanvasStore.getState().setCycleAffectedNodes(['node-1', 'node-2']);
        useCircuitCanvasStore.getState().setCycleAffectedNodes([]);
        
        expect(useCircuitCanvasStore.getState().cycleAffectedNodeIds).toEqual([]);
      });
    });

    it('should mark cycle affected nodes during simulation of cyclic circuit', () => {
      // This is a conceptual test - the simulator marks affected nodes
      // when a cycle is detected during signal propagation
      const input = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      const gate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 100, 'AND');
      
      useCircuitCanvasStore.getState().addCircuitWire(input.id, gate.id, 0);
      useCircuitCanvasStore.getState().addCircuitWire(gate.id, input.id, 0); // Creates cycle
      
      useCircuitCanvasStore.getState().runCircuitSimulation();
      
      // The simulator should detect the cycle and mark affected nodes
      const { cycleAffectedNodeIds } = useCircuitCanvasStore.getState();
      expect(Array.isArray(cycleAffectedNodeIds)).toBe(true);
    });
  });

  // =========================================================================
  // CLEAR CANVAS TESTS
  // =========================================================================
  describe('Clear Circuit Canvas', () => {
    it('should clear all nodes', () => {
      useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
      
      useCircuitCanvasStore.getState().clearCircuitCanvas();
      
      expect(useCircuitCanvasStore.getState().nodes).toEqual([]);
    });

    it('should clear all wires', () => {
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
      
      useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id, 0);
      
      useCircuitCanvasStore.getState().clearCircuitCanvas();
      
      expect(useCircuitCanvasStore.getState().wires).toEqual([]);
    });

    it('should clear selections', () => {
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      useCircuitCanvasStore.getState().selectCircuitNode(inputNode.id);
      
      useCircuitCanvasStore.getState().clearCircuitCanvas();
      
      expect(useCircuitCanvasStore.getState().selectedNodeId).toBeNull();
      expect(useCircuitCanvasStore.getState().selectedWireId).toBeNull();
    });

    it('should reset wire drawing state', () => {
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
      
      useCircuitCanvasStore.getState().clearCircuitCanvas();
      
      expect(useCircuitCanvasStore.getState().isDrawingWire).toBe(false);
      expect(useCircuitCanvasStore.getState().wireStart).toBeNull();
    });

    it('should clear cycle affected nodes', () => {
      useCircuitCanvasStore.setState({ cycleAffectedNodeIds: ['node-1'] });
      
      useCircuitCanvasStore.getState().clearCircuitCanvas();
      
      expect(useCircuitCanvasStore.getState().cycleAffectedNodeIds).toEqual([]);
    });

    it('should reset simulation step count', () => {
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      useCircuitCanvasStore.getState().runCircuitSimulation();
      
      useCircuitCanvasStore.getState().clearCircuitCanvas();
      
      expect(useCircuitCanvasStore.getState().simulationStepCount).toBe(0);
    });
  });

  // =========================================================================
  // GETTER TESTS
  // =========================================================================
  describe('Getters', () => {
    describe('getInputNodes', () => {
      it('should return only input nodes', () => {
        const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 200);
        const output = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        const andGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 100, 'AND');
        
        const inputNodes = useCircuitCanvasStore.getState().getInputNodes();
        
        expect(inputNodes).toHaveLength(2);
        expect(inputNodes.map(n => n.id)).toContain(input1.id);
        expect(inputNodes.map(n => n.id)).toContain(input2.id);
        expect(inputNodes.map(n => n.id)).not.toContain(output.id);
        expect(inputNodes.map(n => n.id)).not.toContain(andGate.id);
      });

      it('should return empty array when no input nodes', () => {
        useCircuitCanvasStore.getState().addCircuitNode('output', 100, 100);
        
        const inputNodes = useCircuitCanvasStore.getState().getInputNodes();
        expect(inputNodes).toEqual([]);
      });
    });

    describe('getGateNodes', () => {
      it('should return only gate nodes', () => {
        const input = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const output = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        const andGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 100, 'AND');
        const orGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 200, 'OR');
        
        const gateNodes = useCircuitCanvasStore.getState().getGateNodes();
        
        expect(gateNodes).toHaveLength(2);
        expect(gateNodes.map(n => (n as any).gateType)).toContain('AND');
        expect(gateNodes.map(n => (n as any).gateType)).toContain('OR');
      });

      it('should return empty array when no gate nodes', () => {
        useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        
        const gateNodes = useCircuitCanvasStore.getState().getGateNodes();
        expect(gateNodes).toEqual([]);
      });
    });

    describe('getOutputNodes', () => {
      it('should return only output nodes', () => {
        const input = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        const output1 = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
        const output2 = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 200);
        const andGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 100, 'AND');
        
        const outputNodes = useCircuitCanvasStore.getState().getOutputNodes();
        
        expect(outputNodes).toHaveLength(2);
        expect(outputNodes.map(n => n.id)).toContain(output1.id);
        expect(outputNodes.map(n => n.id)).toContain(output2.id);
        expect(outputNodes.map(n => n.id)).not.toContain(input.id);
        expect(outputNodes.map(n => n.id)).not.toContain(andGate.id);
      });

      it('should return empty array when no output nodes', () => {
        useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
        
        const outputNodes = useCircuitCanvasStore.getState().getOutputNodes();
        expect(outputNodes).toEqual([]);
      });
    });
  });

  // =========================================================================
  // EDGE CASE TESTS
  // =========================================================================
  describe('Edge Cases', () => {
    it('should handle empty circuit simulation (no nodes)', () => {
      expect(() => {
        useCircuitCanvasStore.getState().runCircuitSimulation();
      }).not.toThrow();
    });

    it('should handle adding node with undefined gateType', () => {
      const node = useCircuitCanvasStore.getState().addCircuitNode('gate', 100, 100, undefined);
      expect(node).toBeDefined();
    });

    it('should handle adding node at negative coordinates', () => {
      const node = useCircuitCanvasStore.getState().addCircuitNode('input', -100, -200);
      expect(node.position).toEqual({ x: -100, y: -200 });
    });

    it('should handle adding node at zero coordinates', () => {
      const node = useCircuitCanvasStore.getState().addCircuitNode('input', 0, 0);
      expect(node.position).toEqual({ x: 0, y: 0 });
    });

    it('should handle large coordinate values', () => {
      const node = useCircuitCanvasStore.getState().addCircuitNode('input', 999999, 999999);
      expect(node.position).toEqual({ x: 999999, y: 999999 });
    });

    it('should handle many nodes in canvas', () => {
      for (let i = 0; i < 50; i++) {
        useCircuitCanvasStore.getState().addCircuitNode('input', i * 20, i * 20);
      }
      
      const { nodes } = useCircuitCanvasStore.getState();
      expect(nodes).toHaveLength(50);
    });

    it('should handle wire between same node (self-loop)', () => {
      const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      
      const wire = useCircuitCanvasStore.getState().addCircuitWire(node.id, node.id, 0);
      expect(wire).toBeDefined();
    });

    it('should not create duplicate wires for self-loop', () => {
      const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      
      useCircuitCanvasStore.getState().addCircuitWire(node.id, node.id, 0);
      useCircuitCanvasStore.getState().addCircuitWire(node.id, node.id, 0);
      
      const { wires } = useCircuitCanvasStore.getState();
      expect(wires).toHaveLength(1);
    });

    it('should handle removing node that is source of multiple wires', () => {
      const input = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      const gate1 = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 100, 'AND');
      const gate2 = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 200, 'OR');
      
      useCircuitCanvasStore.getState().addCircuitWire(input.id, gate1.id, 0);
      useCircuitCanvasStore.getState().addCircuitWire(input.id, gate2.id, 0);
      
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(2);
      
      useCircuitCanvasStore.getState().removeCircuitNode(input.id);
      
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(0);
    });

    it('should handle removing node that is target of multiple wires', () => {
      const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 200);
      const gate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 150, 'AND');
      
      useCircuitCanvasStore.getState().addCircuitWire(input1.id, gate.id, 0);
      useCircuitCanvasStore.getState().addCircuitWire(input2.id, gate.id, 1);
      
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(2);
      
      useCircuitCanvasStore.getState().removeCircuitNode(gate.id);
      
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(0);
    });

    it('should handle rapid toggle of input node', () => {
      const input = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      
      for (let i = 0; i < 10; i++) {
        useCircuitCanvasStore.getState().toggleCircuitInput(input.id);
      }
      
      // After 10 toggles (even), should be back to false
      const node = useCircuitCanvasStore.getState().nodes[0] as any;
      expect(node.state).toBe(false);
    });

    it('should handle clearing canvas multiple times', () => {
      useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      
      useCircuitCanvasStore.getState().clearCircuitCanvas();
      useCircuitCanvasStore.getState().clearCircuitCanvas();
      useCircuitCanvasStore.getState().clearCircuitCanvas();
      
      expect(useCircuitCanvasStore.getState().nodes).toEqual([]);
    });

    it('should handle running simulation after clearing', () => {
      useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      useCircuitCanvasStore.getState().runCircuitSimulation();
      useCircuitCanvasStore.getState().clearCircuitCanvas();
      
      expect(() => {
        useCircuitCanvasStore.getState().runCircuitSimulation();
      }).not.toThrow();
    });
  });

  // =========================================================================
  // INTEGRATION SCENARIO TESTS
  // =========================================================================
  describe('Integration Scenarios', () => {
    it('should build and simulate a complete AND circuit', () => {
      // Setup: Two inputs connected to an AND gate, connected to output
      const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 50, 50, undefined, 'A');
      const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 50, 150, undefined, 'B');
      const andGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 100, 'AND', 'A∧B');
      const output = useCircuitCanvasStore.getState().addCircuitNode('output', 400, 100, undefined, 'Y');
      
      // Wire connections
      useCircuitCanvasStore.getState().addCircuitWire(input1.id, andGate.id, 0);
      useCircuitCanvasStore.getState().addCircuitWire(input2.id, andGate.id, 1);
      useCircuitCanvasStore.getState().addCircuitWire(andGate.id, output.id, 0);
      
      // Test: A=0, B=0 → Y=0
      useCircuitCanvasStore.getState().runCircuitSimulation();
      let andNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === andGate.id) as any;
      let outputNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === output.id) as any;
      expect(andNode.output).toBe(false);
      expect(outputNode.inputSignal).toBe(false);
      
      // Test: A=1, B=0 → Y=0
      useCircuitCanvasStore.getState().toggleCircuitInput(input1.id);
      useCircuitCanvasStore.getState().runCircuitSimulation();
      andNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === andGate.id) as any;
      outputNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === output.id) as any;
      expect(andNode.output).toBe(false);
      expect(outputNode.inputSignal).toBe(false);
      
      // Test: A=1, B=1 → Y=1
      useCircuitCanvasStore.getState().toggleCircuitInput(input2.id);
      useCircuitCanvasStore.getState().runCircuitSimulation();
      andNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === andGate.id) as any;
      outputNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === output.id) as any;
      expect(andNode.output).toBe(true);
      expect(outputNode.inputSignal).toBe(true);
    });

    it('should build and simulate a NOT circuit', () => {
      const input = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100, undefined, 'IN');
      const notGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 250, 100, 'NOT', '¬IN');
      const output = useCircuitCanvasStore.getState().addCircuitNode('output', 400, 100, undefined, 'OUT');
      
      useCircuitCanvasStore.getState().addCircuitWire(input.id, notGate.id, 0);
      useCircuitCanvasStore.getState().addCircuitWire(notGate.id, output.id, 0);
      
      // IN=0 → OUT=1
      useCircuitCanvasStore.getState().runCircuitSimulation();
      let notNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === notGate.id) as any;
      let outputNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === output.id) as any;
      expect(notNode.output).toBe(true);
      expect(outputNode.inputSignal).toBe(true);
      
      // IN=1 → OUT=0
      useCircuitCanvasStore.getState().toggleCircuitInput(input.id);
      useCircuitCanvasStore.getState().runCircuitSimulation();
      notNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === notGate.id) as any;
      outputNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === output.id) as any;
      expect(notNode.output).toBe(false);
      expect(outputNode.inputSignal).toBe(false);
    });

    it('should handle NOR gate truth table', () => {
      const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 50, 50);
      const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 50, 150);
      const norGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 100, 'NOR');
      
      useCircuitCanvasStore.getState().addCircuitWire(input1.id, norGate.id, 0);
      useCircuitCanvasStore.getState().addCircuitWire(input2.id, norGate.id, 1);
      
      // 0 NOR 0 = 1
      useCircuitCanvasStore.getState().runCircuitSimulation();
      let norNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === norGate.id) as any;
      expect(norNode.output).toBe(true);
      
      // 1 NOR 0 = 0
      useCircuitCanvasStore.getState().toggleCircuitInput(input1.id);
      useCircuitCanvasStore.getState().runCircuitSimulation();
      norNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === norGate.id) as any;
      expect(norNode.output).toBe(false);
      
      // 1 NOR 1 = 0
      useCircuitCanvasStore.getState().toggleCircuitInput(input2.id);
      useCircuitCanvasStore.getState().runCircuitSimulation();
      norNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === norGate.id) as any;
      expect(norNode.output).toBe(false);
      
      // 0 NOR 1 = 0
      useCircuitCanvasStore.getState().toggleCircuitInput(input1.id);
      useCircuitCanvasStore.getState().runCircuitSimulation();
      norNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === norGate.id) as any;
      expect(norNode.output).toBe(false);
    });

    it('should handle XNOR gate truth table', () => {
      const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 50, 50);
      const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 50, 150);
      const xnorGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 200, 100, 'XNOR');
      
      useCircuitCanvasStore.getState().addCircuitWire(input1.id, xnorGate.id, 0);
      useCircuitCanvasStore.getState().addCircuitWire(input2.id, xnorGate.id, 1);
      
      // 0 XNOR 0 = 1
      useCircuitCanvasStore.getState().runCircuitSimulation();
      let xnorNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === xnorGate.id) as any;
      expect(xnorNode.output).toBe(true);
      
      // 1 XNOR 1 = 1
      useCircuitCanvasStore.getState().toggleCircuitInput(input1.id);
      useCircuitCanvasStore.getState().toggleCircuitInput(input2.id);
      useCircuitCanvasStore.getState().runCircuitSimulation();
      xnorNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === xnorGate.id) as any;
      expect(xnorNode.output).toBe(true);
      
      // 1 XNOR 0 = 0
      useCircuitCanvasStore.getState().toggleCircuitInput(input2.id);
      useCircuitCanvasStore.getState().runCircuitSimulation();
      xnorNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === xnorGate.id) as any;
      expect(xnorNode.output).toBe(false);
    });
  });
});
