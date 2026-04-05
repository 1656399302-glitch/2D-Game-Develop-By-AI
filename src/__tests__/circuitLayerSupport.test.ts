/**
 * Circuit Layer Support Tests
 * 
 * Round 144: Circuit Canvas UI
 * 
 * Tests for multi-layer circuit support in useCircuitCanvasStore.
 * Covers AC-144-007 through AC-144-009.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCircuitCanvasStore } from '../store/useCircuitCanvasStore';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Reset store to initial state
 */
const resetStore = () => {
  useCircuitCanvasStore.setState({
    isCircuitMode: false,
    nodes: [],
    wires: [],
    selectedNodeId: null,
    selectedCircuitNodeIds: [],
    selectedWireId: null,
    isDrawingWire: false,
    wireStart: null,
    wirePreviewEnd: null,
    cycleAffectedNodeIds: [],
    isSimulating: false,
    simulationStepCount: 0,
    junctions: [],
    layers: [],
    activeLayerId: null,
  });
};

// ============================================================================
// AC-144-007: Multi-Layer Support — Create Layer
// ============================================================================

describe('AC-144-007: Multi-Layer Support — Create Layer', () => {
  beforeEach(() => {
    resetStore();
  });

  it('should create a new layer with id, name, and visible properties', () => {
    const layer = useCircuitCanvasStore.getState().createLayer();
    
    expect(layer).toBeDefined();
    expect(layer.id).toBeTruthy();
    expect(layer.name).toBeTruthy();
    expect(typeof layer.visible).toBe('boolean');
    expect(layer.visible).toBe(true);
    expect(layer.nodeIds).toEqual([]);
    expect(layer.wireIds).toEqual([]);
  });

  it('should add layer to layers array', () => {
    const initialCount = useCircuitCanvasStore.getState().layers.length;
    
    useCircuitCanvasStore.getState().createLayer();
    
    expect(useCircuitCanvasStore.getState().layers.length).toBe(initialCount + 1);
  });

  it('should generate sequential layer names', () => {
    useCircuitCanvasStore.getState().createLayer();
    useCircuitCanvasStore.getState().createLayer();
    useCircuitCanvasStore.getState().createLayer();
    
    const layers = useCircuitCanvasStore.getState().layers;
    expect(layers.length).toBe(3);
    
    // Check that names follow "Layer N" pattern
    layers.forEach((layer, index) => {
      expect(layer.name).toMatch(/^Layer \d+$/);
    });
  });

  it('should accept custom name', () => {
    const layer = useCircuitCanvasStore.getState().createLayer({ name: 'Custom Layer' });
    
    expect(layer.name).toBe('Custom Layer');
  });

  it('should accept custom color', () => {
    const layer = useCircuitCanvasStore.getState().createLayer({ color: '#ff0000' });
    
    expect(layer.color).toBe('#ff0000');
  });

  it('should set first layer as active automatically', () => {
    useCircuitCanvasStore.getState().createLayer();
    
    const layers = useCircuitCanvasStore.getState().layers;
    const activeLayerId = useCircuitCanvasStore.getState().activeLayerId;
    
    expect(activeLayerId).toBe(layers[0].id);
  });

  it('should not change active layer when creating additional layers', () => {
    const firstLayer = useCircuitCanvasStore.getState().createLayer();
    const initialActiveId = useCircuitCanvasStore.getState().activeLayerId;
    
    useCircuitCanvasStore.getState().createLayer();
    
    expect(useCircuitCanvasStore.getState().activeLayerId).toBe(initialActiveId);
  });

  it('should assign unique IDs to each layer', () => {
    const layer1 = useCircuitCanvasStore.getState().createLayer();
    const layer2 = useCircuitCanvasStore.getState().createLayer();
    
    expect(layer1.id).not.toBe(layer2.id);
  });

  it('should assign order to layers', () => {
    const layer1 = useCircuitCanvasStore.getState().createLayer();
    const layer2 = useCircuitCanvasStore.getState().createLayer();
    
    expect(layer1.order).toBe(0);
    expect(layer2.order).toBe(1);
  });

  it('should assign different colors to layers', () => {
    const layer1 = useCircuitCanvasStore.getState().createLayer();
    const layer2 = useCircuitCanvasStore.getState().createLayer();
    
    expect(layer1.color).not.toBe(layer2.color);
  });
});

// ============================================================================
// AC-144-008: Multi-Layer Support — Switch Layers
// ============================================================================

describe('AC-144-008: Multi-Layer Support — Switch Layers', () => {
  beforeEach(() => {
    resetStore();
  });

  it('should switch active layer', () => {
    const layer1 = useCircuitCanvasStore.getState().createLayer();
    const layer2 = useCircuitCanvasStore.getState().createLayer();
    
    useCircuitCanvasStore.getState().setActiveLayer(layer2.id);
    
    expect(useCircuitCanvasStore.getState().activeLayerId).toBe(layer2.id);
  });

  it('should not change active layer for invalid layer ID', () => {
    const layer1 = useCircuitCanvasStore.getState().createLayer();
    const initialActiveId = useCircuitCanvasStore.getState().activeLayerId;
    
    useCircuitCanvasStore.getState().setActiveLayer('invalid-id');
    
    expect(useCircuitCanvasStore.getState().activeLayerId).toBe(initialActiveId);
  });

  it('should return nodes on active layer only', () => {
    const layer1 = useCircuitCanvasStore.getState().createLayer();
    useCircuitCanvasStore.getState().setActiveLayer(layer1.id);
    
    // Add node to layer1
    const node1 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
    
    // Create layer2 and switch to it
    const layer2 = useCircuitCanvasStore.getState().createLayer();
    useCircuitCanvasStore.getState().setActiveLayer(layer2.id);
    
    // Add node to layer2
    useCircuitCanvasStore.getState().addCircuitNode('input', 200, 200);
    
    // Get active layer nodes - should only return layer2 nodes
    const activeNodes = useCircuitCanvasStore.getState().getActiveLayerNodes();
    
    expect(activeNodes.length).toBe(1);
    expect(activeNodes[0].position).toEqual({ x: 200, y: 200 });
  });

  it('should return wires on active layer only', () => {
    const layer1 = useCircuitCanvasStore.getState().createLayer();
    useCircuitCanvasStore.getState().setActiveLayer(layer1.id);
    
    // Add nodes and wire to layer1
    const input1 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
    const output1 = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
    useCircuitCanvasStore.getState().addCircuitWire(input1.id, output1.id);
    
    // Create layer2 and switch to it
    useCircuitCanvasStore.getState().createLayer();
    const layer2 = useCircuitCanvasStore.getState().layers[1];
    useCircuitCanvasStore.getState().setActiveLayer(layer2.id);
    
    // Add nodes and wire to layer2
    const input2 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 300);
    const output2 = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 300);
    useCircuitCanvasStore.getState().addCircuitWire(input2.id, output2.id);
    
    // Get active layer wires - should only return layer2 wires
    const activeWires = useCircuitCanvasStore.getState().getActiveLayerWires();
    
    expect(activeWires.length).toBe(1);
  });

  it('should toggle layer visibility', () => {
    const layer = useCircuitCanvasStore.getState().createLayer();
    
    expect(layer.visible).toBe(true);
    
    useCircuitCanvasStore.getState().toggleLayerVisibility(layer.id);
    
    const updatedLayer = useCircuitCanvasStore.getState().layers.find(l => l.id === layer.id);
    expect(updatedLayer?.visible).toBe(false);
  });

  it('should return empty array when active layer is hidden', () => {
    const layer = useCircuitCanvasStore.getState().createLayer();
    useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
    
    // Hide the layer
    useCircuitCanvasStore.getState().toggleLayerVisibility(layer.id);
    
    // Active layer nodes should be empty
    const activeNodes = useCircuitCanvasStore.getState().getActiveLayerNodes();
    expect(activeNodes).toEqual([]);
  });

  it('should return all nodes when no active layer', () => {
    // Reset to state without active layer
    useCircuitCanvasStore.setState({ activeLayerId: null });
    
    // Add some nodes
    useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
    useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
    
    // Should return all nodes
    const nodes = useCircuitCanvasStore.getState().getActiveLayerNodes();
    expect(nodes.length).toBe(2);
  });

  it('should switch layers multiple times', () => {
    const layer1 = useCircuitCanvasStore.getState().createLayer();
    const layer2 = useCircuitCanvasStore.getState().createLayer();
    const layer3 = useCircuitCanvasStore.getState().createLayer();
    
    useCircuitCanvasStore.getState().setActiveLayer(layer2.id);
    expect(useCircuitCanvasStore.getState().activeLayerId).toBe(layer2.id);
    
    useCircuitCanvasStore.getState().setActiveLayer(layer3.id);
    expect(useCircuitCanvasStore.getState().activeLayerId).toBe(layer3.id);
    
    useCircuitCanvasStore.getState().setActiveLayer(layer1.id);
    expect(useCircuitCanvasStore.getState().activeLayerId).toBe(layer1.id);
  });
});

// ============================================================================
// AC-144-009: Multi-Layer Support — Layer Isolation
// ============================================================================

describe('AC-144-009: Multi-Layer Support — Layer Isolation', () => {
  beforeEach(() => {
    resetStore();
  });

  it('should isolate nodes on different layers', () => {
    const layer1 = useCircuitCanvasStore.getState().createLayer();
    const layer2 = useCircuitCanvasStore.getState().createLayer();
    
    useCircuitCanvasStore.getState().setActiveLayer(layer1.id);
    const node1 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
    
    useCircuitCanvasStore.getState().setActiveLayer(layer2.id);
    const node2 = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
    
    // Verify nodes are on different layers
    const updatedNode1 = useCircuitCanvasStore.getState().nodes.find(n => n.id === node1.id);
    const updatedNode2 = useCircuitCanvasStore.getState().nodes.find(n => n.id === node2.id);
    
    expect(updatedNode1?.layerId).toBe(layer1.id);
    expect(updatedNode2?.layerId).toBe(layer2.id);
  });

  it('should not create wire between nodes on different layers', () => {
    const layer1 = useCircuitCanvasStore.getState().createLayer();
    const layer2 = useCircuitCanvasStore.getState().createLayer();
    
    useCircuitCanvasStore.getState().setActiveLayer(layer1.id);
    const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
    
    useCircuitCanvasStore.getState().setActiveLayer(layer2.id);
    const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
    
    // Attempt to create wire between nodes on different layers
    const wire = useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id);
    
    // Wire should not be created
    expect(wire).toBeNull();
    expect(useCircuitCanvasStore.getState().wires.length).toBe(0);
  });

  it('should create wire between nodes on same layer', () => {
    const layer = useCircuitCanvasStore.getState().createLayer();
    useCircuitCanvasStore.getState().setActiveLayer(layer.id);
    
    const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
    const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
    
    // Create wire between nodes on same layer
    const wire = useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id);
    
    // Wire should be created
    expect(wire).not.toBeNull();
    expect(useCircuitCanvasStore.getState().wires.length).toBe(1);
    expect(wire?.layerId).toBe(layer.id);
  });

  it('should move nodes between layers', () => {
    const layer1 = useCircuitCanvasStore.getState().createLayer();
    const layer2 = useCircuitCanvasStore.getState().createLayer();
    
    useCircuitCanvasStore.getState().setActiveLayer(layer1.id);
    const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
    
    // Move node to layer2
    useCircuitCanvasStore.getState().moveNodesToLayer([node.id], layer2.id);
    
    // Verify node is now on layer2
    const updatedNode = useCircuitCanvasStore.getState().nodes.find(n => n.id === node.id);
    expect(updatedNode?.layerId).toBe(layer2.id);
  });

  it('should remove nodes when layer is deleted', () => {
    const layer1 = useCircuitCanvasStore.getState().createLayer();
    const layer2 = useCircuitCanvasStore.getState().createLayer();
    
    useCircuitCanvasStore.getState().setActiveLayer(layer1.id);
    const node = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
    
    // Delete layer1
    const result = useCircuitCanvasStore.getState().removeLayer(layer1.id);
    
    expect(result).toBe(true);
    expect(useCircuitCanvasStore.getState().nodes.find(n => n.id === node.id)).toBeUndefined();
  });

  it('should not allow removing the last layer', () => {
    const layer = useCircuitCanvasStore.getState().createLayer();
    
    const result = useCircuitCanvasStore.getState().removeLayer(layer.id);
    
    expect(result).toBe(false);
    expect(useCircuitCanvasStore.getState().layers.length).toBe(1);
  });

  it('should switch to remaining layer when deleting active layer', () => {
    const layer1 = useCircuitCanvasStore.getState().createLayer();
    const layer2 = useCircuitCanvasStore.getState().createLayer();
    
    useCircuitCanvasStore.getState().setActiveLayer(layer1.id);
    
    // Delete active layer
    useCircuitCanvasStore.getState().removeLayer(layer1.id);
    
    // Should switch to layer2
    expect(useCircuitCanvasStore.getState().activeLayerId).toBe(layer2.id);
  });

  it('should rename layer', () => {
    const layer = useCircuitCanvasStore.getState().createLayer();
    
    useCircuitCanvasStore.getState().renameLayer(layer.id, 'New Name');
    
    const updatedLayer = useCircuitCanvasStore.getState().layers.find(l => l.id === layer.id);
    expect(updatedLayer?.name).toBe('New Name');
  });

  it('should track node IDs in layer', () => {
    const layer = useCircuitCanvasStore.getState().createLayer();
    useCircuitCanvasStore.getState().setActiveLayer(layer.id);
    
    const node1 = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
    const node2 = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
    
    const updatedLayer = useCircuitCanvasStore.getState().layers.find(l => l.id === layer.id);
    expect(updatedLayer?.nodeIds).toContain(node1.id);
    expect(updatedLayer?.nodeIds).toContain(node2.id);
  });

  it('should track wire IDs in layer', () => {
    const layer = useCircuitCanvasStore.getState().createLayer();
    useCircuitCanvasStore.getState().setActiveLayer(layer.id);
    
    const inputNode = useCircuitCanvasStore.getState().addCircuitNode('input', 100, 100);
    const outputNode = useCircuitCanvasStore.getState().addCircuitNode('output', 300, 100);
    const wire = useCircuitCanvasStore.getState().addCircuitWire(inputNode.id, outputNode.id);
    
    const updatedLayer = useCircuitCanvasStore.getState().layers.find(l => l.id === layer.id);
    expect(updatedLayer?.wireIds).toContain(wire?.id);
  });
});
