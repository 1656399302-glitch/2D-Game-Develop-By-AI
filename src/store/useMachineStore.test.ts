import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from './useMachineStore';
import { ModuleType } from '../types';

// Helper to reset store to initial state
const resetStore = () => {
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
    history: [{ modules: [], connections: [] }],
    historyIndex: 0,
    gridEnabled: true,
  });
};

beforeEach(() => {
  resetStore();
});

describe('useMachineStore - Module Management', () => {
  it('should add all 7 module types', () => {
    const store = useMachineStore.getState();
    const testTypes: ModuleType[] = [
      'core-furnace',
      'energy-pipe',
      'gear',
      'rune-node',
      'shield-shell',
      'trigger-switch',
      'output-array',
    ];
    
    testTypes.forEach((type, index) => {
      store.addModule(type, 100 + index * 100, 100);
    });
    
    const modules = useMachineStore.getState().modules;
    expect(modules.length).toBe(7);
    expect(modules.map((m) => m.type)).toEqual(testTypes);
  });

  it('should add output-array module with correct properties', () => {
    const store = useMachineStore.getState();
    store.addModule('output-array', 200, 200);
    
    const modules = useMachineStore.getState().modules;
    expect(modules.length).toBe(1);
    expect(modules[0].type).toBe('output-array');
    expect(modules[0].ports).toHaveLength(2);
    expect(modules[0].ports[0].type).toBe('input');
    expect(modules[0].ports[1].type).toBe('output');
  });

  it('should select and deselect modules', () => {
    const store = useMachineStore.getState();
    
    store.addModule('core-furnace', 100, 100);
    const moduleId = useMachineStore.getState().modules[0].instanceId;
    
    // Select
    store.selectModule(moduleId);
    expect(useMachineStore.getState().selectedModuleId).toBe(moduleId);
    
    // Deselect
    store.selectModule(null);
    expect(useMachineStore.getState().selectedModuleId).toBeNull();
  });

  it('should add module at grid-snapped position', () => {
    const store = useMachineStore.getState();
    
    // For core-furnace (100x100), grid of 20px:
    // x=100, subtract half width: 100-50=50
    // snapToGrid(50, 20) = round(50/20) * 20 = round(2.5) * 20 = 3 * 20 = 60
    // (JavaScript uses banker's rounding, round(2.5) = 3)
    store.addModule('core-furnace', 100, 100);
    
    const module = useMachineStore.getState().modules[0];
    expect(module.x).toBe(60);
    expect(module.y).toBe(60);
  });

  it('should delete selected module', () => {
    const store = useMachineStore.getState();
    
    store.addModule('core-furnace', 100, 100);
    const moduleId = useMachineStore.getState().modules[0].instanceId;
    store.selectModule(moduleId);
    
    expect(useMachineStore.getState().modules.length).toBe(1);
    
    store.deleteSelected();
    
    expect(useMachineStore.getState().modules.length).toBe(0);
    expect(useMachineStore.getState().selectedModuleId).toBeNull();
  });

  it('should toggle grid', () => {
    const store = useMachineStore.getState();
    
    expect(useMachineStore.getState().gridEnabled).toBe(true);
    
    store.toggleGrid();
    expect(useMachineStore.getState().gridEnabled).toBe(false);
    
    store.toggleGrid();
    expect(useMachineStore.getState().gridEnabled).toBe(true);
  });

  it('should reset viewport', () => {
    const store = useMachineStore.getState();
    
    store.setViewport({ x: 100, y: 200, zoom: 1.5 });
    expect(useMachineStore.getState().viewport).toEqual({ x: 100, y: 200, zoom: 1.5 });
    
    store.resetViewport();
    expect(useMachineStore.getState().viewport).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('should set machine state', () => {
    const store = useMachineStore.getState();
    
    expect(useMachineStore.getState().machineState).toBe('idle');
    
    store.setMachineState('charging');
    expect(useMachineStore.getState().machineState).toBe('charging');
    
    store.setMachineState('active');
    expect(useMachineStore.getState().machineState).toBe('active');
  });

  it('should clear canvas', () => {
    const store = useMachineStore.getState();
    
    store.addModule('core-furnace', 100, 100);
    store.addModule('energy-pipe', 200, 200);
    
    expect(useMachineStore.getState().modules.length).toBe(2);
    
    store.clearCanvas();
    
    expect(useMachineStore.getState().modules.length).toBe(0);
    expect(useMachineStore.getState().selectedModuleId).toBeNull();
  });

  it('should load machine state', () => {
    const store = useMachineStore.getState();
    
    const modulesToLoad = [{
      id: 'test-1',
      instanceId: 'inst-1',
      type: 'core-furnace' as ModuleType,
      x: 100,
      y: 100,
      rotation: 0,
      scale: 1,
      ports: [],
    }];
    
    store.loadMachine(modulesToLoad, []);
    
    expect(useMachineStore.getState().modules.length).toBe(1);
    expect(useMachineStore.getState().modules[0].type).toBe('core-furnace');
    expect(useMachineStore.getState().historyIndex).toBe(0);
  });

  it('should update module rotation', () => {
    const store = useMachineStore.getState();
    
    store.addModule('gear', 100, 100);
    const moduleId = useMachineStore.getState().modules[0].instanceId;
    
    expect(useMachineStore.getState().modules[0].rotation).toBe(0);
    
    store.updateModuleRotation(moduleId, 90);
    expect(useMachineStore.getState().modules[0].rotation).toBe(90);
    
    store.updateModuleRotation(moduleId, 90);
    expect(useMachineStore.getState().modules[0].rotation).toBe(180);
  });

  it('should cancel connection', () => {
    const store = useMachineStore.getState();
    
    store.addModule('core-furnace', 100, 100);
    store.startConnection(useMachineStore.getState().modules[0].instanceId, 'core-furnace-output');
    
    expect(useMachineStore.getState().isConnecting).toBe(true);
    expect(useMachineStore.getState().connectionStart).not.toBeNull();
    
    store.cancelConnection();
    
    expect(useMachineStore.getState().isConnecting).toBe(false);
    expect(useMachineStore.getState().connectionStart).toBeNull();
  });
});

describe('useMachineStore - Undo/Redo', () => {
  it('should undo add module action', () => {
    const store = useMachineStore.getState();
    
    // Initial state
    expect(useMachineStore.getState().modules.length).toBe(0);
    expect(useMachineStore.getState().historyIndex).toBe(0);
    
    // Add a module
    store.addModule('core-furnace', 100, 100);
    expect(useMachineStore.getState().modules.length).toBe(1);
    
    // Undo - restores to previous history state (empty modules)
    store.undo();
    expect(useMachineStore.getState().modules.length).toBe(0);
  });

  it('should track history after adding modules', () => {
    const store = useMachineStore.getState();
    
    // Initial: 1 state in history (empty)
    expect(useMachineStore.getState().history.length).toBe(1);
    
    store.addModule('core-furnace', 100, 100);
    // After add: initial empty state + current state
    expect(useMachineStore.getState().history.length).toBe(2);
    expect(useMachineStore.getState().historyIndex).toBe(1);
    
    store.addModule('energy-pipe', 200, 200);
    expect(useMachineStore.getState().history.length).toBe(3);
    expect(useMachineStore.getState().historyIndex).toBe(2);
  });

  it('should not undo when at initial state', () => {
    const store = useMachineStore.getState();
    
    // At initial state (historyIndex = 0)
    store.undo();
    
    // Should still have no modules
    expect(useMachineStore.getState().modules.length).toBe(0);
    expect(useMachineStore.getState().historyIndex).toBe(0);
  });
});
