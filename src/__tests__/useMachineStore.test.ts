import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';
import { ModuleType, PortType } from '../types';

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

describe('useMachineStore - Core Functions', () => {
  describe('Module Management', () => {
    it('adds a module to the canvas', () => {
      const store = useMachineStore.getState();
      
      store.addModule('core-furnace', 200, 200);
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      expect(useMachineStore.getState().modules[0].type).toBe('core-furnace');
      expect(useMachineStore.getState().selectedModuleId).toBe(useMachineStore.getState().modules[0].instanceId);
    });

    it('adds multiple modules of different types', () => {
      const store = useMachineStore.getState();
      
      store.addModule('core-furnace', 100, 100);
      store.addModule('energy-pipe', 200, 100);
      store.addModule('gear', 300, 100);
      
      expect(useMachineStore.getState().modules.length).toBe(3);
      expect(useMachineStore.getState().modules[0].type).toBe('core-furnace');
      expect(useMachineStore.getState().modules[1].type).toBe('energy-pipe');
      expect(useMachineStore.getState().modules[2].type).toBe('gear');
    });

    it('selects a module', () => {
      const store = useMachineStore.getState();
      
      store.addModule('core-furnace', 200, 200);
      
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      store.selectModule(moduleId);
      
      expect(useMachineStore.getState().selectedModuleId).toBe(moduleId);
    });

    it('removes a module from the canvas', () => {
      const store = useMachineStore.getState();
      
      store.addModule('core-furnace', 200, 200);
      
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      store.removeModule(moduleId);
      
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('updates module position with grid snapping', () => {
      const store = useMachineStore.getState();
      
      store.addModule('core-furnace', 205, 215); // Should snap to 200, 220
      
      const module = useMachineStore.getState().modules[0];
      // Grid size is 20, so values should be snapped to multiples of 20
      expect(module.x % 20).toBe(0);
      expect(module.y % 20).toBe(0);
    });

    it('updates module rotation', () => {
      const store = useMachineStore.getState();
      
      store.addModule('core-furnace', 200, 200);
      
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      store.updateModuleRotation(moduleId, 90);
      
      expect(useMachineStore.getState().modules[0].rotation).toBe(90);
    });
  });

  describe('Connection Management', () => {
    it('starts a connection from a port', () => {
      const store = useMachineStore.getState();
      
      store.addModule('core-furnace', 200, 200);
      
      const module = useMachineStore.getState().modules[0];
      const outputPort = module.ports.find((p: { type: PortType }) => p.type === 'output');
      
      store.startConnection(module.instanceId, outputPort!.id);
      
      expect(useMachineStore.getState().isConnecting).toBe(true);
      expect(useMachineStore.getState().connectionStart?.moduleId).toBe(module.instanceId);
      expect(useMachineStore.getState().connectionStart?.portId).toBe(outputPort!.id);
    });

    it('updates connection preview position', () => {
      const store = useMachineStore.getState();
      
      store.startConnection('module1', 'port1');
      store.updateConnectionPreview(300, 300);
      
      expect(useMachineStore.getState().connectionPreview).toEqual({ x: 300, y: 300 });
    });

    it('completes a connection between two modules', () => {
      const store = useMachineStore.getState();
      
      // Add two modules
      store.addModule('core-furnace', 100, 200);
      store.addModule('energy-pipe', 300, 200);
      
      const module1 = useMachineStore.getState().modules[0];
      const module2 = useMachineStore.getState().modules[1];
      const outputPort = module1.ports.find((p: { type: PortType }) => p.type === 'output');
      const inputPort = module2.ports.find((p: { type: PortType }) => p.type === 'input');
      
      // Connect them
      store.startConnection(module1.instanceId, outputPort!.id);
      store.completeConnection(module2.instanceId, inputPort!.id);
      
      expect(useMachineStore.getState().connections.length).toBe(1);
      expect(useMachineStore.getState().isConnecting).toBe(false);
      expect(useMachineStore.getState().connectionStart).toBeNull();
    });

    it('cancels a connection', () => {
      const store = useMachineStore.getState();
      
      store.startConnection('module1', 'port1');
      store.cancelConnection();
      
      expect(useMachineStore.getState().isConnecting).toBe(false);
      expect(useMachineStore.getState().connectionStart).toBeNull();
      expect(useMachineStore.getState().connectionPreview).toBeNull();
    });

    it('removes a connection', () => {
      const store = useMachineStore.getState();
      
      // Add two modules and connect them
      store.addModule('core-furnace', 100, 200);
      store.addModule('energy-pipe', 300, 200);
      
      const module1 = useMachineStore.getState().modules[0];
      const module2 = useMachineStore.getState().modules[1];
      const outputPort = module1.ports.find((p: { type: PortType }) => p.type === 'output');
      const inputPort = module2.ports.find((p: { type: PortType }) => p.type === 'input');
      
      store.startConnection(module1.instanceId, outputPort!.id);
      store.completeConnection(module2.instanceId, inputPort!.id);
      
      const connectionId = useMachineStore.getState().connections[0].id;
      
      store.removeConnection(connectionId);
      
      expect(useMachineStore.getState().connections.length).toBe(0);
    });
  });

  describe('Viewport Management', () => {
    it('sets viewport state', () => {
      const store = useMachineStore.getState();
      
      store.setViewport({ x: 100, y: 200, zoom: 1.5 });
      
      expect(useMachineStore.getState().viewport.x).toBe(100);
      expect(useMachineStore.getState().viewport.y).toBe(200);
      expect(useMachineStore.getState().viewport.zoom).toBe(1.5);
    });

    it('resets viewport to default', () => {
      const store = useMachineStore.getState();
      
      store.setViewport({ x: 100, y: 200, zoom: 2 });
      store.resetViewport();
      
      expect(useMachineStore.getState().viewport).toEqual({ x: 0, y: 0, zoom: 1 });
    });
  });

  describe('Machine State', () => {
    it('sets machine state', () => {
      const store = useMachineStore.getState();
      
      store.setMachineState('active');
      
      expect(useMachineStore.getState().machineState).toBe('active');
    });
  });

  describe('Grid', () => {
    it('toggles grid on/off', () => {
      const store = useMachineStore.getState();
      
      expect(useMachineStore.getState().gridEnabled).toBe(true);
      
      store.toggleGrid();
      
      expect(useMachineStore.getState().gridEnabled).toBe(false);
    });
  });

  describe('History (Undo/Redo)', () => {
    it('saves state to history', () => {
      const store = useMachineStore.getState();
      
      expect(useMachineStore.getState().history.length).toBe(1);
      expect(useMachineStore.getState().history[0].modules.length).toBe(0);
      
      store.addModule('core-furnace', 200, 200);
      
      // History should have 2 entries after addModule
      expect(useMachineStore.getState().history.length).toBe(2);
      expect(useMachineStore.getState().history[1].modules.length).toBe(1);
    });

    it('undoes last action', () => {
      const store = useMachineStore.getState();
      
      store.addModule('core-furnace', 200, 200);
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      store.undo();
      
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('redoes last undone action', () => {
      const store = useMachineStore.getState();
      
      store.addModule('core-furnace', 200, 200);
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      store.undo();
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      store.redo();
      
      expect(useMachineStore.getState().modules.length).toBe(1);
    });

    it('does not undo past initial state', () => {
      const store = useMachineStore.getState();
      
      store.undo();
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      expect(useMachineStore.getState().historyIndex).toBe(0);
    });
  });

  describe('Canvas Operations', () => {
    it('clears the canvas', () => {
      const store = useMachineStore.getState();
      
      store.addModule('core-furnace', 200, 200);
      store.addModule('energy-pipe', 300, 200);
      store.clearCanvas();
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      expect(useMachineStore.getState().connections.length).toBe(0);
      expect(useMachineStore.getState().selectedModuleId).toBeNull();
    });

    it('loads a machine', () => {
      const store = useMachineStore.getState();
      
      const modules = [
        {
          id: 'test-id-1',
          instanceId: 'test-instance-1',
          type: 'core-furnace' as ModuleType,
          x: 100,
          y: 100,
          rotation: 0,
          scale: 1,
          ports: [],
        },
        {
          id: 'test-id-2',
          instanceId: 'test-instance-2',
          type: 'energy-pipe' as ModuleType,
          x: 200,
          y: 100,
          rotation: 0,
          scale: 1,
          ports: [],
        },
      ];
      
      const connections = [
        {
          id: 'conn-1',
          sourceModuleId: 'test-instance-1',
          sourcePortId: 'port-1',
          targetModuleId: 'test-instance-2',
          targetPortId: 'port-2',
          pathData: 'M 100 100 L 200 100',
        },
      ];
      
      store.loadMachine(modules, connections);
      
      expect(useMachineStore.getState().modules.length).toBe(2);
      expect(useMachineStore.getState().connections.length).toBe(1);
      expect(useMachineStore.getState().selectedModuleId).toBeNull();
      expect(useMachineStore.getState().historyIndex).toBe(0);
    });
  });

  describe('Delete Operations', () => {
    it('deletes selected module', () => {
      const store = useMachineStore.getState();
      
      store.addModule('core-furnace', 200, 200);
      
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      store.selectModule(moduleId);
      store.deleteSelected();
      
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('deletes selected connection', () => {
      const store = useMachineStore.getState();
      
      // Add two modules and connect them
      store.addModule('core-furnace', 100, 200);
      store.addModule('energy-pipe', 300, 200);
      
      const module1 = useMachineStore.getState().modules[0];
      const module2 = useMachineStore.getState().modules[1];
      const outputPort = module1.ports.find((p: { type: PortType }) => p.type === 'output');
      const inputPort = module2.ports.find((p: { type: PortType }) => p.type === 'input');
      
      store.startConnection(module1.instanceId, outputPort!.id);
      store.completeConnection(module2.instanceId, inputPort!.id);
      
      const connectionId = useMachineStore.getState().connections[0].id;
      
      store.selectConnection(connectionId);
      store.deleteSelected();
      
      expect(useMachineStore.getState().connections.length).toBe(0);
    });
  });
});
