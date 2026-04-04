/**
 * Layer State Management Unit Tests
 * Round 127: Multi-layer support for circuit canvas
 * 
 * Tests cover AC-127-001 through AC-127-007
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';
import { ModuleType } from '../types';

/**
 * Helper to create a fresh layer setup and return the layer IDs
 */
function createFreshLayers(count: number = 1): string[] {
  const store = useMachineStore.getState();
  const layerIds: string[] = [];
  
  // Get the current default layer
  const currentLayers = store.layers;
  if (currentLayers.length > 0) {
    layerIds.push(currentLayers[0].id);
  }
  
  // Add more layers if needed
  for (let i = 1; i < count; i++) {
    const newId = store.addLayer();
    layerIds.push(newId);
  }
  
  return layerIds;
}

/**
 * Helper to fully reset the store with a single fresh layer
 */
function fullReset(): { layerId: string } {
  const freshId = 'test-layer-' + Math.random().toString(36).substr(2, 9);
  const freshLayer = { id: freshId, name: 'Layer 1', visible: true, color: '#3b82f6', order: 0 };
  const newHistory = [{ modules: [], connections: [] }];
  
  // Single setState call - replaces ALL relevant state fields
  useMachineStore.setState({
    modules: [],
    connections: [],
    selectedModuleId: null,
    selectedConnectionId: null,
    isConnecting: false,
    connectionStart: null,
    connectionPreview: null,
    viewport: { x: 0, y: 0, zoom: 1 },
    machineState: 'idle',
    history: newHistory,
    historyIndex: 0,
    gridEnabled: true,
    layers: [freshLayer],
    activeLayerId: freshId,
    circuitNodes: [],
    circuitWires: [],
    generatedAttributes: null,
    randomForgeToastVisible: false,
    randomForgeToastMessage: '',
    showExportModal: false,
    showCodexModal: false,
  });
  return { layerId: freshId };
}

beforeEach(() => {
  fullReset();
});

// ============================================================
// AC-127-001: Layer creation
// ============================================================
describe('AC-127-001: Layer creation', () => {
  it('should create a new layer with default name', () => {
    const initialCount = useMachineStore.getState().layers.length;
    
    const newLayerId = useMachineStore.getState().addLayer();
    
    expect(useMachineStore.getState().layers.length).toBe(initialCount + 1);
    expect(newLayerId).toBeTruthy();
    expect(typeof newLayerId).toBe('string');
    expect(newLayerId.length).toBeGreaterThan(0);
  });

  it('should name new layer with "Layer N" pattern', () => {
    const newLayerId = useMachineStore.getState().addLayer();
    const state = useMachineStore.getState();
    const newLayer = state.layers.find(l => l.id === newLayerId);
    
    expect(newLayer).toBeTruthy();
    expect(newLayer?.name).toMatch(/^Layer \d+$/);
  });

  it('should use custom name when provided', () => {
    useMachineStore.getState().addLayer('My Custom Layer');
    const state = useMachineStore.getState();
    const lastLayer = state.layers[state.layers.length - 1];
    expect(lastLayer.name).toBe('My Custom Layer');
  });

  it('should assign unique IDs to each layer', () => {
    const id1 = useMachineStore.getState().addLayer();
    const id2 = useMachineStore.getState().addLayer();
    const id3 = useMachineStore.getState().addLayer();
    
    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
    
    const ids = useMachineStore.getState().layers.map(l => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should not change activeLayerId on addLayer', () => {
    const initialActiveId = useMachineStore.getState().activeLayerId;
    
    useMachineStore.getState().addLayer();
    useMachineStore.getState().addLayer();
    
    expect(useMachineStore.getState().activeLayerId).toBe(initialActiveId);
  });
});

// ============================================================
// AC-127-002: Layer switching
// ============================================================
describe('AC-127-002: Layer switching', () => {
  it('should set activeLayerId when setActiveLayer is called', () => {
    const newLayerId = useMachineStore.getState().addLayer();
    useMachineStore.getState().setActiveLayer(newLayerId);
    
    expect(useMachineStore.getState().activeLayerId).toBe(newLayerId);
  });

  it('should not change activeLayerId for invalid layer ID', () => {
    const initialActiveId = useMachineStore.getState().activeLayerId;
    
    useMachineStore.getState().setActiveLayer('invalid-layer-id-123');
    
    expect(useMachineStore.getState().activeLayerId).toBe(initialActiveId);
  });

  it('should switch active layer multiple times', () => {
    const layer1Id = useMachineStore.getState().layers[0].id;
    const layer2Id = useMachineStore.getState().addLayer();
    const layer3Id = useMachineStore.getState().addLayer();
    
    useMachineStore.getState().setActiveLayer(layer2Id);
    expect(useMachineStore.getState().activeLayerId).toBe(layer2Id);
    
    useMachineStore.getState().setActiveLayer(layer3Id);
    expect(useMachineStore.getState().activeLayerId).toBe(layer3Id);
    
    useMachineStore.getState().setActiveLayer(layer1Id);
    expect(useMachineStore.getState().activeLayerId).toBe(layer1Id);
  });
});

// ============================================================
// AC-127-003: Layer deletion
// ============================================================
describe('AC-127-003: Layer deletion', () => {
  it('should remove a layer and decrease layer count', () => {
    const layer2Id = useMachineStore.getState().addLayer();
    const initialCount = useMachineStore.getState().layers.length;
    
    const result = useMachineStore.getState().removeLayer(layer2Id);
    
    expect(result).toBe(true);
    expect(useMachineStore.getState().layers.length).toBe(initialCount - 1);
  });

  it('should return false when trying to delete the last layer', () => {
    const onlyLayerId = useMachineStore.getState().layers[0].id;
    const initialCount = useMachineStore.getState().layers.length;
    
    const result = useMachineStore.getState().removeLayer(onlyLayerId);
    
    expect(result).toBe(false);
    expect(useMachineStore.getState().layers.length).toBe(initialCount);
  });

  it('should not allow layers.length to reach 0', () => {
    const store = useMachineStore.getState();
    const onlyLayerId = store.layers[0].id;
    
    store.removeLayer(onlyLayerId);
    
    expect(useMachineStore.getState().layers.length).toBeGreaterThanOrEqual(1);
  });

  it('should switch to remaining layer when deleting active layer', () => {
    const layer2Id = useMachineStore.getState().addLayer();
    useMachineStore.getState().setActiveLayer(layer2Id);
    
    useMachineStore.getState().removeLayer(layer2Id);
    
    const remainingLayer = useMachineStore.getState().layers[0];
    expect(useMachineStore.getState().activeLayerId).toBe(remainingLayer.id);
  });

  it('should remove components from deleted layer', () => {
    const layer1Id = useMachineStore.getState().layers[0].id;
    const layer2Id = useMachineStore.getState().addLayer();
    
    useMachineStore.getState().addModule('core-furnace' as ModuleType, 100, 100);
    useMachineStore.getState().addModule('gear' as ModuleType, 200, 200);
    useMachineStore.getState().setActiveLayer(layer2Id);
    useMachineStore.getState().addModule('core-furnace' as ModuleType, 300, 300);
    
    useMachineStore.getState().removeLayer(layer1Id);
    
    const remainingModules = useMachineStore.getState().modules;
    expect(remainingModules.length).toBe(1);
    expect((remainingModules[0] as any).layerId).toBe(layer2Id);
  });

  it('should return false for non-existent layer ID', () => {
    const result = useMachineStore.getState().removeLayer('non-existent-id');
    
    expect(result).toBe(false);
  });
});

// ============================================================
// AC-127-004: Layer renaming
// ============================================================
describe('AC-127-004: Layer renaming', () => {
  it('should rename a layer', () => {
    const layerId = useMachineStore.getState().layers[0].id;
    
    useMachineStore.getState().renameLayer(layerId, 'Alpha');
    
    const updatedLayer = useMachineStore.getState().layers.find(l => l.id === layerId);
    expect(updatedLayer?.name).toBe('Alpha');
  });

  it('should only rename the specified layer', () => {
    const layer1Id = useMachineStore.getState().layers[0].id;
    const layer2Id = useMachineStore.getState().addLayer();
    
    useMachineStore.getState().renameLayer(layer1Id, 'First Layer');
    
    const layer1 = useMachineStore.getState().layers.find(l => l.id === layer1Id);
    const layer2 = useMachineStore.getState().layers.find(l => l.id === layer2Id);
    
    expect(layer1?.name).toBe('First Layer');
    expect(layer2?.name).toMatch(/^Layer \d+$/);
  });
});

// ============================================================
// AC-127-005: Component-layer assignment
// ============================================================
describe('AC-127-005: Component-layer assignment', () => {
  it('should assign new module to active layer', () => {
    const layer2Id = useMachineStore.getState().addLayer();
    useMachineStore.getState().setActiveLayer(layer2Id);
    
    useMachineStore.getState().addModule('core-furnace' as ModuleType, 100, 100);
    
    const modules = useMachineStore.getState().modules;
    expect(modules.length).toBe(1);
    expect((modules[0] as any).layerId).toBe(layer2Id);
  });

  it('should move components to target layer', () => {
    const layer1Id = useMachineStore.getState().layers[0].id;
    const layer2Id = useMachineStore.getState().addLayer();
    
    useMachineStore.getState().addModule('core-furnace' as ModuleType, 100, 100);
    useMachineStore.getState().addModule('gear' as ModuleType, 200, 200);
    
    const modules = useMachineStore.getState().modules;
    const moduleA = modules[0];
    const moduleB = modules[1];
    
    useMachineStore.getState().moveComponentsToLayer([moduleA.instanceId], layer2Id);
    
    const updatedModules = useMachineStore.getState().modules;
    const updatedA = updatedModules.find(m => m.instanceId === moduleA.instanceId);
    const updatedB = updatedModules.find(m => m.instanceId === moduleB.instanceId);
    
    expect((updatedA as any).layerId).toBe(layer2Id);
    expect((updatedB as any).layerId).toBe(layer1Id);
  });

  it('should move multiple components to layer', () => {
    const layer1Id = useMachineStore.getState().layers[0].id;
    const layer2Id = useMachineStore.getState().addLayer();
    
    useMachineStore.getState().addModule('core-furnace' as ModuleType, 100, 100);
    useMachineStore.getState().addModule('gear' as ModuleType, 200, 200);
    useMachineStore.getState().addModule('rune-node' as ModuleType, 300, 300);
    
    const modules = useMachineStore.getState().modules;
    const toMove = [modules[0].instanceId, modules[2].instanceId];
    
    useMachineStore.getState().moveComponentsToLayer(toMove, layer2Id);
    
    const updatedModules = useMachineStore.getState().modules;
    const onLayer1 = updatedModules.filter(m => (m as any).layerId === layer1Id);
    const onLayer2 = updatedModules.filter(m => (m as any).layerId === layer2Id);
    
    expect(onLayer1.length).toBe(1);
    expect(onLayer2.length).toBe(2);
  });

  it('should not move components when target layer is invalid', () => {
    useMachineStore.getState().addModule('core-furnace' as ModuleType, 100, 100);
    
    const module = useMachineStore.getState().modules[0];
    const originalLayerId = (module as any).layerId;
    
    useMachineStore.getState().moveComponentsToLayer([module.instanceId], 'invalid-layer');
    
    const updatedModule = useMachineStore.getState().modules[0];
    expect((updatedModule as any).layerId).toBe(originalLayerId);
  });
});

// ============================================================
// AC-127-006: Layer visibility toggle
// ============================================================
describe('AC-127-006: Layer visibility toggle', () => {
  it('should toggle layer visibility via store state', () => {
    const layerId = useMachineStore.getState().layers[0].id;
    
    useMachineStore.setState((state: any) => ({
      layers: state.layers.map((l: any) =>
        l.id === layerId ? { ...l, visible: !l.visible } : l
      ),
    }));
    
    const layer = useMachineStore.getState().layers.find(l => l.id === layerId);
    expect(layer?.visible).toBe(false);
  });

  it('should exclude components from hidden layer in getActiveLayerComponents', () => {
    const layer1Id = useMachineStore.getState().layers[0].id;
    const layer2Id = useMachineStore.getState().addLayer();
    
    useMachineStore.getState().addModule('core-furnace' as ModuleType, 100, 100);
    useMachineStore.getState().setActiveLayer(layer2Id);
    useMachineStore.getState().addModule('gear' as ModuleType, 200, 200);
    
    // Hide layer 1
    useMachineStore.setState((state: any) => ({
      layers: state.layers.map((l: any) =>
        l.id === layer1Id ? { ...l, visible: false } : l
      ),
    }));
    
    // Layer 2 is active and visible
    const activeComponents = useMachineStore.getState().getActiveLayerComponents();
    expect(activeComponents.length).toBe(1);
    expect(activeComponents[0].type).toBe('gear');
  });

  it('should return empty when all layers are hidden', () => {
    const layerId = useMachineStore.getState().layers[0].id;
    
    useMachineStore.getState().addModule('core-furnace' as ModuleType, 100, 100);
    
    // Hide the active layer
    useMachineStore.setState((state: any) => ({
      layers: state.layers.map((l: any) => ({ ...l, visible: false })),
    }));
    
    const activeComponents = useMachineStore.getState().getActiveLayerComponents();
    expect(activeComponents).toEqual([]);
  });

  it('should show components when layer is un-hidden', () => {
    const layerId = useMachineStore.getState().layers[0].id;
    
    useMachineStore.getState().addModule('core-furnace' as ModuleType, 100, 100);
    
    // Hide then show
    useMachineStore.setState((state: any) => ({
      layers: state.layers.map((l: any) =>
        l.id === layerId ? { ...l, visible: false } : l
      ),
    }));
    
    useMachineStore.setState((state: any) => ({
      layers: state.layers.map((l: any) =>
        l.id === layerId ? { ...l, visible: true } : l
      ),
    }));
    
    const activeComponents = useMachineStore.getState().getActiveLayerComponents();
    expect(activeComponents.length).toBe(1);
  });
});

// ============================================================
// AC-127-007: Minimum one layer invariant
// ============================================================
describe('AC-127-007: Minimum one layer invariant', () => {
  it('should never have 0 layers', () => {
    const onlyLayerId = useMachineStore.getState().layers[0].id;
    
    // Try various delete attempts
    useMachineStore.getState().removeLayer(onlyLayerId);
    useMachineStore.getState().removeLayer(onlyLayerId);
    useMachineStore.getState().removeLayer(onlyLayerId);
    
    expect(useMachineStore.getState().layers.length).toBeGreaterThanOrEqual(1);
  });

  it('should always have a valid activeLayerId', () => {
    const onlyLayerId = useMachineStore.getState().layers[0].id;
    
    useMachineStore.getState().removeLayer(onlyLayerId);
    
    const state = useMachineStore.getState();
    expect(state.layers.length).toBeGreaterThanOrEqual(1);
    expect(state.activeLayerId).toBeTruthy();
    expect(state.layers.some(l => l.id === state.activeLayerId)).toBe(true);
  });

  it('should not change layer count when removeLayer returns false', () => {
    const onlyLayerId = useMachineStore.getState().layers[0].id;
    const initialCount = useMachineStore.getState().layers.length;
    
    const result = useMachineStore.getState().removeLayer(onlyLayerId);
    
    expect(result).toBe(false);
    expect(useMachineStore.getState().layers.length).toBe(initialCount);
  });
});

// ============================================================
// Store Selectors
// ============================================================
describe('Store Selectors', () => {
  it('should return only active layer components via getActiveLayerComponents', () => {
    const layer1Id = useMachineStore.getState().layers[0].id;
    const layer2Id = useMachineStore.getState().addLayer();
    
    useMachineStore.getState().addModule('core-furnace' as ModuleType, 100, 100);
    useMachineStore.getState().addModule('gear' as ModuleType, 200, 200);
    useMachineStore.getState().setActiveLayer(layer2Id);
    useMachineStore.getState().addModule('rune-node' as ModuleType, 300, 300);
    
    // With layer 2 active, should only return layer 2 modules
    const activeComponents = useMachineStore.getState().getActiveLayerComponents();
    expect(activeComponents.length).toBe(1);
    expect(activeComponents[0].type).toBe('rune-node');
  });

  it('should return only active layer wires via getActiveLayerWires', () => {
    const layer1Id = useMachineStore.getState().layers[0].id;
    const layer2Id = useMachineStore.getState().addLayer();
    
    // Add modules to layer 1 and create a connection
    useMachineStore.getState().addModule('core-furnace' as ModuleType, 100, 100);
    useMachineStore.getState().addModule('gear' as ModuleType, 200, 200);
    
    // Get module info - use output port of m1 and input port of m2
    const s1 = useMachineStore.getState();
    const m1 = s1.modules[0];
    const m2 = s1.modules[1];
    
    expect(m1).toBeTruthy();
    expect(m2).toBeTruthy();
    
    // core-furnace: ports[0]=input, ports[1]=output
    // gear: ports[0]=input, ports[1]=output
    // Connect m1.output -> m2.input (output port index 1, input port index 0)
    useMachineStore.getState().startConnection(m1.instanceId, m1.ports[1].id);
    useMachineStore.getState().completeConnection(m2.instanceId, m2.ports[0].id);
    
    // Verify connection was created
    const afterConnect = useMachineStore.getState();
    expect(afterConnect.connections.length).toBe(1);
    
    // Switch to layer 2 - should have 0 wires (no modules on layer 2)
    useMachineStore.getState().setActiveLayer(layer2Id);
    const activeWires = useMachineStore.getState().getActiveLayerWires();
    expect(activeWires.length).toBe(0);
    
    // Switch back to layer 1 - should have 1 wire
    useMachineStore.getState().setActiveLayer(layer1Id);
    const layer1Wires = useMachineStore.getState().getActiveLayerWires();
    expect(layer1Wires.length).toBe(1);
  });
});

// ============================================================
// Migration: Existing circuits without layerId
// ============================================================
describe('Migration: Existing circuits without layerId', () => {
  it('should default unsaved modules to active layer on load', () => {
    const defaultLayerId = useMachineStore.getState().activeLayerId;
    
    // Simulate loading a circuit with modules that have no layerId
    const legacyModules = [
      { id: 'm1', instanceId: 'i1', type: 'core-furnace' as ModuleType, x: 100, y: 100, rotation: 0, scale: 1, flipped: false, ports: [] },
      { id: 'm2', instanceId: 'i2', type: 'gear' as ModuleType, x: 200, y: 200, rotation: 0, scale: 1, flipped: false, ports: [] },
    ];
    
    useMachineStore.getState().loadMachine(legacyModules as any, []);
    
    const loadedModules = useMachineStore.getState().modules;
    expect(loadedModules.length).toBe(2);
    // Both should be assigned to the active layer
    expect((loadedModules[0] as any).layerId).toBe(defaultLayerId);
    expect((loadedModules[1] as any).layerId).toBe(defaultLayerId);
  });

  it('should preserve layerId when loading circuits with layers', () => {
    const layer2Id = useMachineStore.getState().addLayer();
    
    const modulesWithLayers = [
      { id: 'm1', instanceId: 'i1', type: 'core-furnace' as ModuleType, x: 100, y: 100, rotation: 0, scale: 1, flipped: false, ports: [], layerId: layer2Id },
    ];
    
    useMachineStore.getState().loadMachine(modulesWithLayers as any, []);
    
    const loadedModules = useMachineStore.getState().modules;
    expect((loadedModules[0] as any).layerId).toBe(layer2Id);
  });
});
