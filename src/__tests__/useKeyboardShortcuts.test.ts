import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';

describe('Keyboard Shortcuts - Store Actions', () => {
  beforeEach(() => {
    // Reset store to initial state
    useMachineStore.setState({
      modules: [],
      connections: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedModuleId: null,
      selectedConnectionId: null,
      history: [{ modules: [], connections: [] }],
      historyIndex: 0,
    });
  });

  describe('Delete', () => {
    it('should delete selected module when Delete key is pressed', () => {
      const { addModule, deleteSelected } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      useMachineStore.setState({ selectedModuleId: moduleId });
      deleteSelected();
      expect(useMachineStore.getState().modules.length).toBe(0);
    });
  });

  describe('Escape', () => {
    it('should deselect module when Escape is pressed', () => {
      const { addModule, selectModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      selectModule(moduleId);
      expect(useMachineStore.getState().selectedModuleId).toBe(moduleId);
      useMachineStore.setState({ selectedModuleId: null });
      expect(useMachineStore.getState().selectedModuleId).toBeNull();
    });

    it('should cancel connection when Escape is pressed during connection', () => {
      const { startConnection, cancelConnection } = useMachineStore.getState();
      startConnection('module1', 'port1');
      expect(useMachineStore.getState().isConnecting).toBe(true);
      cancelConnection();
      expect(useMachineStore.getState().isConnecting).toBe(false);
    });
  });

  describe('Ctrl+Z Undo', () => {
    it('should revert last action when Ctrl+Z is pressed', () => {
      const { addModule, undo, modules } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      expect(useMachineStore.getState().modules.length).toBe(1);
      undo();
      expect(useMachineStore.getState().modules.length).toBe(0);
    });
  });

  describe('Ctrl+Y Redo', () => {
    it('should restore previously undone action when Ctrl+Y is pressed', () => {
      const { addModule, undo, redo } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      undo();
      expect(useMachineStore.getState().modules.length).toBe(0);
      redo();
      expect(useMachineStore.getState().modules.length).toBe(1);
    });
  });

  describe('Ctrl+D Duplicate', () => {
    it('should duplicate selected module when Ctrl+D is pressed', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModuleId = useMachineStore.getState().modules[0].instanceId;
      useMachineStore.setState({ selectedModuleId: originalModuleId });
      duplicateModule(originalModuleId);
      expect(useMachineStore.getState().modules.length).toBe(2);
    });

    it('should offset duplicated module by 20px right and down', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModule = useMachineStore.getState().modules[0];
      const originalModuleId = originalModule.instanceId;
      useMachineStore.setState({ selectedModuleId: originalModuleId });
      duplicateModule(originalModuleId);
      const duplicatedModule = useMachineStore.getState().modules[1];
      expect(duplicatedModule.x).toBe(originalModule.x + 20);
      expect(duplicatedModule.y).toBe(originalModule.y + 20);
    });
  });

  describe('F Key Flip', () => {
    it('should toggle flipped state on selected module', () => {
      const { addModule, updateModuleFlip } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      const moduleBefore = useMachineStore.getState().modules[0];
      expect(moduleBefore.flipped).toBe(false);
      updateModuleFlip(moduleId);
      const moduleAfter = useMachineStore.getState().modules[0];
      expect(moduleAfter.flipped).toBe(true);
      updateModuleFlip(moduleId);
      const moduleToggled = useMachineStore.getState().modules[0];
      expect(moduleToggled.flipped).toBe(false);
    });
  });

  describe('Scale Slider', () => {
    it('should update module scale', () => {
      const { addModule, updateModuleScale } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      updateModuleScale(moduleId, 1.5);
      const module = useMachineStore.getState().modules[0];
      expect(module.scale).toBe(1.5);
    });

    it('should clamp scale between 0.5 and 2.0', () => {
      const { addModule, updateModuleScale } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      // Below minimum
      updateModuleScale(moduleId, 0.2);
      let module = useMachineStore.getState().modules[0];
      expect(module.scale).toBe(0.5);
      // Above maximum
      updateModuleScale(moduleId, 3.0);
      module = useMachineStore.getState().modules[0];
      expect(module.scale).toBe(2.0);
    });
  });
});
