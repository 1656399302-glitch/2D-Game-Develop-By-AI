/**
 * Circuit Wire Connection Test Suite
 * 
 * Round 173: Circuit Wire Connection Workflow
 * 
 * Tests for wire drawing initiation, preview rendering, valid/invalid
 * connection handling, Escape cancellation, Delete removal, and node
 * deletion wire cleanup.
 */

import { act } from '@testing-library/react';
import { useCircuitCanvasStore } from '../store/useCircuitCanvasStore';

// Helper to reset store state before each test
const resetStore = () => {
  const state = useCircuitCanvasStore.getState();
  state.clearCircuitCanvas();
  state.setCircuitMode(false);
};

describe('Circuit Wire Connection', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    resetStore();
  });

  describe('Wire Drawing Initiation (AC-173-001)', () => {
    it('clicking an output port initiates wire drawing mode', () => {
      // Enable circuit mode
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      // Add an input node (to be the source/output of wire)
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      
      // Verify initial state - not drawing wire
      const state1 = useCircuitCanvasStore.getState();
      expect(state1.isDrawingWire).toBe(false);
      expect(state1.wireStart).toBe(null);
      
      // Start wire drawing from input node
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
      });
      
      // Verify wire drawing state
      const state2 = useCircuitCanvasStore.getState();
      expect(state2.isDrawingWire).toBe(true);
      expect(state2.wireStart).not.toBe(null);
      expect(state2.wireStart?.nodeId).toBe(inputNode.id);
      expect(state2.wireStart?.portIndex).toBe(0);
    });

    it('wireStart contains correct nodeId and portIndex', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      const gateNode = useCircuitCanvasStore.getState().addCircuitNode('gate', 300, 100, 'AND');
      
      // Start wire from input node, port 0
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
      });
      
      const state = useCircuitCanvasStore.getState();
      expect(state.wireStart).toEqual({
        nodeId: inputNode.id,
        portIndex: 0,
      });
      
      // Start new wire from gate node, port 0
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(gateNode.id, 0);
      });
      
      const state2 = useCircuitCanvasStore.getState();
      expect(state2.wireStart).toEqual({
        nodeId: gateNode.id,
        portIndex: 0,
      });
    });

    it('starting wire drawing clears previous wireStart', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      const gateNode = useCircuitCanvasStore.getState().addCircuitNode('gate', 300, 100, 'AND');
      
      // Start wire from first node
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
      });
      
      // Start wire from second node (should clear first)
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(gateNode.id, 0);
      });
      
      const state = useCircuitCanvasStore.getState();
      expect(state.wireStart?.nodeId).toBe(gateNode.id);
    });
  });

  describe('Wire Preview Updates (AC-173-002)', () => {
    it('updateWirePreview sets wirePreviewEnd position', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      
      // Start wire drawing
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
      });
      
      // Initial state - wirePreviewEnd should be null
      expect(useCircuitCanvasStore.getState().wirePreviewEnd).toBe(null);
      
      // Update preview with mouse position
      act(() => {
        useCircuitCanvasStore.getState().updateWirePreview(200, 150);
      });
      
      // Verify wire preview end position
      const state = useCircuitCanvasStore.getState();
      expect(state.wirePreviewEnd).toEqual({ x: 200, y: 150 });
      
      // Update again with different position
      act(() => {
        useCircuitCanvasStore.getState().updateWirePreview(300, 200);
      });
      
      expect(useCircuitCanvasStore.getState().wirePreviewEnd).toEqual({ x: 300, y: 200 });
    });

    it('wirePreviewEnd is cleared when drawing is cancelled', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
        useCircuitCanvasStore.getState().updateWirePreview(200, 150);
      });
      
      expect(useCircuitCanvasStore.getState().wirePreviewEnd).toEqual({ x: 200, y: 150 });
      
      // Cancel drawing
      act(() => {
        useCircuitCanvasStore.getState().cancelWireDrawing();
      });
      
      expect(useCircuitCanvasStore.getState().wirePreviewEnd).toBe(null);
    });
  });

  describe('Valid Connection Creation (AC-173-003)', () => {
    it('valid connection creates wire between nodes', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      // Add input (source) and gate (target) nodes
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      const andGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 300, 100, 'AND');
      
      // Initial state - no wires
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(0);
      
      // Start wire from input, finish at AND gate
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(andGate.id, 0);
      });
      
      // Verify wire was created
      const state = useCircuitCanvasStore.getState();
      expect(state.wires).toHaveLength(1);
      expect(state.wires[0].sourceNodeId).toBe(inputNode.id);
      expect(state.wires[0].targetNodeId).toBe(andGate.id);
      expect(state.wires[0].targetPort).toBe(0);
      
      // Verify wire drawing state is reset
      expect(state.isDrawingWire).toBe(false);
      expect(state.wireStart).toBe(null);
    });

    it('valid connection clears drawing state', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
      
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
      });
      
      // Verify drawing state is active
      const state1 = useCircuitCanvasStore.getState();
      expect(state1.isDrawingWire).toBe(true);
      expect(state1.wireStart).not.toBe(null);
      
      // Complete the connection
      act(() => {
        useCircuitCanvasStore.getState().finishWireDrawing(outputNode.id, 0);
      });
      
      // Verify drawing state is reset
      const state2 = useCircuitCanvasStore.getState();
      expect(state2.isDrawingWire).toBe(false);
      expect(state2.wireStart).toBe(null);
      expect(state2.wirePreviewEnd).toBe(null);
    });

    it('multiple valid connections create multiple wires', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 80);
      const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 120);
      const andGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 300, 100, 'AND');
      
      // Connect first input
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(input1.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(andGate.id, 0);
      });
      
      // Connect second input
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(input2.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(andGate.id, 1);
      });
      
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(2);
    });
  });

  describe('Invalid Connection Rejection (AC-173-004)', () => {
    it('finishing wire drawing with no start cancels correctly', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      
      // Try to finish without starting
      act(() => {
        useCircuitCanvasStore.getState().finishWireDrawing(inputNode.id, 0);
      });
      
      // Should not create any wire
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(0);
      expect(useCircuitCanvasStore.getState().isDrawingWire).toBe(false);
    });

    it('wire to same node is rejected', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      
      // Try to connect input to itself
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(inputNode.id, 0);
      });
      
      // Should not create wire to self
      const wires = useCircuitCanvasStore.getState().wires;
      const selfWire = wires.find(w => w.sourceNodeId === w.targetNodeId);
      expect(selfWire).toBeUndefined();
    });

    it('drawing state is reset after invalid finish attempt', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
      });
      
      // Try to finish without valid target
      act(() => {
        useCircuitCanvasStore.getState().finishWireDrawing('non-existent-id', 0);
      });
      
      // Drawing state should still be reset
      const state = useCircuitCanvasStore.getState();
      expect(state.isDrawingWire).toBe(false);
      expect(state.wireStart).toBe(null);
    });
  });

  describe('Escape Cancellation (AC-173-005)', () => {
    it('cancelWireDrawing resets isDrawingWire to false', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      
      // Start wire drawing
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
      });
      
      expect(useCircuitCanvasStore.getState().isDrawingWire).toBe(true);
      
      // Cancel drawing
      act(() => {
        useCircuitCanvasStore.getState().cancelWireDrawing();
      });
      
      expect(useCircuitCanvasStore.getState().isDrawingWire).toBe(false);
    });

    it('cancelWireDrawing clears wireStart', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
      });
      
      expect(useCircuitCanvasStore.getState().wireStart).not.toBe(null);
      
      act(() => {
        useCircuitCanvasStore.getState().cancelWireDrawing();
      });
      
      expect(useCircuitCanvasStore.getState().wireStart).toBe(null);
    });

    it('cancelWireDrawing clears wirePreviewEnd', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
        useCircuitCanvasStore.getState().updateWirePreview(200, 150);
      });
      
      expect(useCircuitCanvasStore.getState().wirePreviewEnd).not.toBe(null);
      
      act(() => {
        useCircuitCanvasStore.getState().cancelWireDrawing();
      });
      
      expect(useCircuitCanvasStore.getState().wirePreviewEnd).toBe(null);
    });

    it('cancelWireDrawing while not drawing does nothing', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      // Try to cancel when not drawing
      act(() => {
        useCircuitCanvasStore.getState().cancelWireDrawing();
      });
      
      // Should remain in idle state
      const state = useCircuitCanvasStore.getState();
      expect(state.isDrawingWire).toBe(false);
      expect(state.wireStart).toBe(null);
      expect(state.wirePreviewEnd).toBe(null);
    });
  });

  describe('Wire Deletion (AC-173-006)', () => {
    it('removeCircuitWire removes wire from wires array', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
      
      // Create wire
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(outputNode.id, 0);
      });
      
      const wire = useCircuitCanvasStore.getState().wires[0];
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(1);
      
      // Remove wire
      act(() => {
        useCircuitCanvasStore.getState().removeCircuitWire(wire.id);
      });
      
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(0);
    });

    it('selecting wire before deletion is tracked', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
      
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(outputNode.id, 0);
      });
      
      const wire = useCircuitCanvasStore.getState().wires[0];
      
      // Select wire
      act(() => {
        useCircuitCanvasStore.getState().selectCircuitWire(wire.id);
      });
      
      expect(useCircuitCanvasStore.getState().selectedWireId).toBe(wire.id);
    });

    it('removing non-existent wire does not throw', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      // Should not throw
      act(() => {
        useCircuitCanvasStore.getState().removeCircuitWire('non-existent-id');
      });
      
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(0);
    });

    it('clearing selection after wire deletion', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
      
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(outputNode.id, 0);
      });
      
      const wire = useCircuitCanvasStore.getState().wires[0];
      
      // Select and remove wire
      act(() => {
        useCircuitCanvasStore.getState().selectCircuitWire(wire.id);
        useCircuitCanvasStore.getState().removeCircuitWire(wire.id);
      });
      
      // Selection should be cleared
      expect(useCircuitCanvasStore.getState().selectedWireId).toBe(null);
    });
  });

  describe('Node Deletion Wire Cleanup (AC-173-007)', () => {
    it('node deletion removes all connected wires', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 80);
      const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 120);
      const andGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 300, 100, 'AND');
      
      // Create two wires to AND gate
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(input1.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(andGate.id, 0);
        useCircuitCanvasStore.getState().startWireDrawing(input2.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(andGate.id, 1);
      });
      
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(2);
      
      // Delete the AND gate
      act(() => {
        useCircuitCanvasStore.getState().removeCircuitNode(andGate.id);
      });
      
      // All wires to/from AND gate should be removed
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(0);
    });

    it('source node deletion removes outgoing wires', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      const output1 = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 80);
      const output2 = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 120);
      
      // Create two wires from input
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(output1.id, 0);
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(output2.id, 0);
      });
      
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(2);
      
      // Delete source node
      act(() => {
        useCircuitCanvasStore.getState().removeCircuitNode(inputNode.id);
      });
      
      // All wires should be removed
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(0);
    });

    it('target node deletion removes incoming wires', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 80);
      const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 120);
      const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
      
      // Create two wires to output
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(input1.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(outputNode.id, 0);
        useCircuitCanvasStore.getState().startWireDrawing(input2.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(outputNode.id, 0);
      });
      
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(2);
      
      // Delete target node
      act(() => {
        useCircuitCanvasStore.getState().removeCircuitNode(outputNode.id);
      });
      
      // All wires should be removed
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(0);
    });

    it('deleting node clears its selection', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      
      // Select the node
      act(() => {
        useCircuitCanvasStore.getState().selectCircuitNode(inputNode.id);
      });
      
      expect(useCircuitCanvasStore.getState().selectedNodeId).toBe(inputNode.id);
      
      // Delete the node
      act(() => {
        useCircuitCanvasStore.getState().removeCircuitNode(inputNode.id);
      });
      
      // Selection should be cleared
      expect(useCircuitCanvasStore.getState().selectedNodeId).toBe(null);
    });

    it('remaining wires are unaffected when unrelated node is deleted', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 80);
      const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 120);
      const andGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 300, 100, 'AND');
      
      // Create wire only from input1 to AND
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(input1.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(andGate.id, 0);
      });
      
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(1);
      
      // Delete unrelated node (input2)
      act(() => {
        useCircuitCanvasStore.getState().removeCircuitNode(input2.id);
      });
      
      // Wire should remain
      expect(useCircuitCanvasStore.getState().wires).toHaveLength(1);
    });
  });

  describe('Wire Signal Updates (AC-173-008 - Regression)', () => {
    it('wires inherit signal from source node', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
      const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
      
      // Create wire
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(inputNode.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(outputNode.id, 0);
      });
      
      const wire = useCircuitCanvasStore.getState().wires[0];
      
      // Initially, wire signal should be false (input is off)
      expect(wire.signal).toBe(false);
      
      // Toggle input ON
      act(() => {
        useCircuitCanvasStore.getState().toggleCircuitInput(inputNode.id);
        useCircuitCanvasStore.getState().runCircuitSimulation();
      });
      
      // After simulation, wire should have updated signal
      const updatedWire = useCircuitCanvasStore.getState().wires.find(w => w.id === wire.id);
      expect(updatedWire?.signal).toBe(true);
    });

    it('simulation updates all wire signals', () => {
      useCircuitCanvasStore.getState().setCircuitMode(true);
      
      const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 80);
      const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 120);
      const andGate = useCircuitCanvasStore.getState().addCircuitNode('gate', 300, 100, 'AND');
      
      // Create wires
      act(() => {
        useCircuitCanvasStore.getState().startWireDrawing(input1.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(andGate.id, 0);
        useCircuitCanvasStore.getState().startWireDrawing(input2.id, 0);
        useCircuitCanvasStore.getState().finishWireDrawing(andGate.id, 1);
      });
      
      // All wires initially false
      expect(useCircuitCanvasStore.getState().wires.every(w => !w.signal)).toBe(true);
      
      // Turn on both inputs
      act(() => {
        useCircuitCanvasStore.getState().toggleCircuitInput(input1.id);
        useCircuitCanvasStore.getState().toggleCircuitInput(input2.id);
        useCircuitCanvasStore.getState().runCircuitSimulation();
      });
      
      // Both wires should now have true signal
      expect(useCircuitCanvasStore.getState().wires.every(w => w.signal)).toBe(true);
    });
  });

  describe('Existing Tests Regression (AC-173-008)', () => {
    it('circuit canvas store exports required functions', () => {
      const state = useCircuitCanvasStore.getState();
      
      // Verify all required wire drawing functions exist
      expect(typeof state.startWireDrawing).toBe('function');
      expect(typeof state.updateWirePreview).toBe('function');
      expect(typeof state.finishWireDrawing).toBe('function');
      expect(typeof state.cancelWireDrawing).toBe('function');
      expect(typeof state.addCircuitWire).toBe('function');
      expect(typeof state.removeCircuitWire).toBe('function');
      expect(typeof state.selectCircuitWire).toBe('function');
    });

    it('store maintains correct initial state', () => {
      resetStore();
      
      const state = useCircuitCanvasStore.getState();
      
      expect(state.isDrawingWire).toBe(false);
      expect(state.wireStart).toBe(null);
      expect(state.wirePreviewEnd).toBe(null);
      expect(state.selectedWireId).toBe(null);
      expect(state.wires).toEqual([]);
    });
  });
});
