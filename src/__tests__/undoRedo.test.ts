import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';

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

describe('Undo/Redo System', () => {
  describe('Criterion 1: Ctrl+Z undoes the last add action', () => {
    it('Add 1 module → Undo → canvas has 0 modules', () => {
      const store = useMachineStore.getState();
      
      // Add a module
      store.addModule('core-furnace', 200, 200);
      
      // Verify module was added
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      // Undo
      store.undo();
      
      // Verify module was removed
      expect(useMachineStore.getState().modules.length).toBe(0);
    });
  });

  describe('Criterion 2: Ctrl+Z works for multiple sequential undos', () => {
    it('Add module A, Add module B → Undo twice → canvas has 0 modules', () => {
      const store = useMachineStore.getState();
      
      // Add two different modules
      store.addModule('core-furnace', 200, 200);
      store.addModule('energy-pipe', 300, 200);
      
      // Verify both modules were added
      expect(useMachineStore.getState().modules.length).toBe(2);
      
      // Undo twice
      store.undo();
      store.undo();
      
      // Verify all modules were removed
      expect(useMachineStore.getState().modules.length).toBe(0);
    });
  });

  describe('Criterion 3: Ctrl+Y redoes the last undone action', () => {
    it('Add module → Undo (0 modules) → Redo (1 module)', () => {
      const store = useMachineStore.getState();
      
      // Add a module
      store.addModule('core-furnace', 200, 200);
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      // Undo
      store.undo();
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      // Redo
      store.redo();
      
      expect(useMachineStore.getState().modules.length).toBe(1);
    });
  });

  describe('Criterion 4: Redo stack is correct after multiple operations', () => {
    it('Add A → Add B → Undo → Undo → Redo → canvas has 1 module (A)', () => {
      const store = useMachineStore.getState();
      
      // Add module A
      store.addModule('core-furnace', 200, 200);
      
      // Add module B
      store.addModule('energy-pipe', 300, 200);
      
      expect(useMachineStore.getState().modules.length).toBe(2);
      
      // Undo twice
      store.undo();
      store.undo();
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      // Redo once - should restore only module A
      store.redo();
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      expect(useMachineStore.getState().modules[0].type).toBe('core-furnace');
    });
  });

  describe('Criterion 5: Undo/redo works for delete operation', () => {
    it('Add module → Delete → Undo → module reappears', () => {
      const store = useMachineStore.getState();
      
      // Add a module
      store.addModule('core-furnace', 200, 200);
      
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      // Delete the module
      store.selectModule(moduleId);
      store.deleteSelected();
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      // Undo
      store.undo();
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      expect(useMachineStore.getState().modules[0].instanceId).toBe(moduleId);
    });
  });

  describe('Criterion 6: Undo/redo works for rotation', () => {
    it('Add module → Rotate 90° → Undo → rotation resets to 0°', () => {
      const store = useMachineStore.getState();
      
      // Add a module
      store.addModule('core-furnace', 200, 200);
      
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      expect(useMachineStore.getState().modules[0].rotation).toBe(0);
      
      // Rotate 90 degrees
      store.updateModuleRotation(moduleId, 90);
      
      expect(useMachineStore.getState().modules[0].rotation).toBe(90);
      
      // Undo rotation
      store.undo();
      
      expect(useMachineStore.getState().modules[0].rotation).toBe(0);
    });
  });

  describe('Criterion 7: Undo/redo works for connections', () => {
    it('Add 2 modules → Connect → Undo → connection removed', () => {
      const store = useMachineStore.getState();
      
      // Add two modules
      store.addModule('core-furnace', 200, 200);
      store.addModule('energy-pipe', 400, 200);
      
      expect(useMachineStore.getState().modules.length).toBe(2);
      
      const module1 = useMachineStore.getState().modules[0];
      const module2 = useMachineStore.getState().modules[1];
      
      // Get actual port IDs from the modules (format: ${type}-output-0, ${type}-input-0)
      const sourcePortId = module1.ports.find(p => p.type === 'output')?.id || `${module1.type}-output-0`;
      const targetPortId = module2.ports.find(p => p.type === 'input')?.id || `${module2.type}-input-0`;
      
      // Create connection
      store.startConnection(module1.instanceId, sourcePortId);
      store.completeConnection(module2.instanceId, targetPortId);
      
      expect(useMachineStore.getState().connections.length).toBe(1);
      
      // Undo connection
      store.undo();
      
      expect(useMachineStore.getState().connections.length).toBe(0);
    });
  });

  describe('Criterion 8: Undo/redo works for clear canvas', () => {
    it('Add modules → Clear → Undo → modules reappear', () => {
      const store = useMachineStore.getState();
      
      // Add multiple modules
      store.addModule('core-furnace', 200, 200);
      store.addModule('energy-pipe', 300, 200);
      store.addModule('gear', 400, 200);
      
      expect(useMachineStore.getState().modules.length).toBe(3);
      
      // Clear canvas
      store.clearCanvas();
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      // Undo clear
      store.undo();
      
      expect(useMachineStore.getState().modules.length).toBe(3);
    });
  });

  describe('Criterion 9: Redo stack clears when new action is taken after undo', () => {
    it('Add module → Undo → Add different module → Redo should NOT restore original module', () => {
      const store = useMachineStore.getState();
      
      // Add first module
      store.addModule('core-furnace', 200, 200);
      
      expect(useMachineStore.getState().modules[0].type).toBe('core-furnace');
      
      // Undo
      store.undo();
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      // Add different module
      store.addModule('energy-pipe', 300, 200);
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      expect(useMachineStore.getState().modules[0].type).toBe('energy-pipe');
      
      // Redo should NOT restore the core-furnace (history was truncated)
      store.redo();
      
      // Redo should not change anything because history was truncated
      expect(useMachineStore.getState().modules.length).toBe(1);
      expect(useMachineStore.getState().modules[0].type).toBe('energy-pipe');
    });
  });

  describe('Criterion 10: saveToHistory() is called AFTER state changes', () => {
    it('History should capture the state AFTER mutation, not before', () => {
      const store = useMachineStore.getState();
      
      // Initially history has 1 entry: empty state
      expect(useMachineStore.getState().history.length).toBe(1);
      expect(useMachineStore.getState().history[0].modules.length).toBe(0);
      
      // Add a module
      store.addModule('core-furnace', 200, 200);
      
      // History should now have 2 entries:
      // Entry 0: empty state (initial)
      // Entry 1: state with 1 module (captured AFTER addModule)
      expect(useMachineStore.getState().history.length).toBe(2);
      expect(useMachineStore.getState().history[0].modules.length).toBe(0);  // Initial state
      expect(useMachineStore.getState().history[1].modules.length).toBe(1);  // After addModule
      
      // Undo should restore to empty state
      store.undo();
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      // Redo should restore to 1 module
      store.redo();
      
      expect(useMachineStore.getState().modules.length).toBe(1);
    });
  });

  describe('Additional Edge Cases', () => {
    it('Should not undo past initial empty state', () => {
      const store = useMachineStore.getState();
      
      // Initial state check
      expect(useMachineStore.getState().historyIndex).toBe(0);
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      // Try to undo when already at initial state
      store.undo();
      
      // Should still be at initial state
      expect(useMachineStore.getState().historyIndex).toBe(0);
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('Should not redo when at latest state', () => {
      const store = useMachineStore.getState();
      
      // Add a module
      store.addModule('core-furnace', 200, 200);
      
      // Now at latest state
      const latestIndex = useMachineStore.getState().historyIndex;
      const historyLength = useMachineStore.getState().history.length;
      expect(latestIndex).toBe(historyLength - 1);
      
      // Try to redo
      store.redo();
      
      // Should still be at same state
      expect(useMachineStore.getState().modules.length).toBe(1);
      expect(useMachineStore.getState().historyIndex).toBe(historyLength - 1);
    });

    it('History limit of 51 entries should be respected', () => {
      const store = useMachineStore.getState();
      
      // Add 60 modules rapidly
      for (let i = 0; i < 60; i++) {
        store.addModule('core-furnace', 200 + i * 10, 200);
      }
      
      // History should be limited to 51 entries (initial + 50 undoable actions)
      expect(useMachineStore.getState().history.length).toBeLessThanOrEqual(51);
      expect(useMachineStore.getState().modules.length).toBe(60);
    });
  });
});
