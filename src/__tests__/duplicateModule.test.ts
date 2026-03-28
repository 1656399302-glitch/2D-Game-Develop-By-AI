import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';

describe('Duplicate Module', () => {
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

  describe('duplicateModule action', () => {
    it('should create a copy of the selected module', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModuleId = useMachineStore.getState().modules[0].instanceId;
      
      duplicateModule(originalModuleId);
      
      expect(useMachineStore.getState().modules.length).toBe(2);
    });

    it('should offset duplicated module by 20px in both directions', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModule = useMachineStore.getState().modules[0];
      const originalModuleId = originalModule.instanceId;
      
      duplicateModule(originalModuleId);
      
      const duplicatedModule = useMachineStore.getState().modules[1];
      expect(duplicatedModule.x).toBe(originalModule.x + 20);
      expect(duplicatedModule.y).toBe(originalModule.y + 20);
    });

    it('should preserve module type', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('gear', 150, 200);
      const originalModuleId = useMachineStore.getState().modules[0].instanceId;
      
      duplicateModule(originalModuleId);
      
      const duplicatedModule = useMachineStore.getState().modules[1];
      expect(duplicatedModule.type).toBe('gear');
    });

    it('should preserve ports configuration', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModule = useMachineStore.getState().modules[0];
      const originalModuleId = originalModule.instanceId;
      
      duplicateModule(originalModuleId);
      
      const duplicatedModule = useMachineStore.getState().modules[1];
      expect(duplicatedModule.ports.length).toBe(originalModule.ports.length);
      expect(duplicatedModule.ports[0].type).toBe(originalModule.ports[0].type);
    });

    it('should assign new unique instanceId', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModule = useMachineStore.getState().modules[0];
      const originalModuleId = originalModule.instanceId;
      
      duplicateModule(originalModuleId);
      
      const duplicatedModule = useMachineStore.getState().modules[1];
      expect(duplicatedModule.instanceId).not.toBe(originalModuleId);
    });

    it('should generate unique port IDs', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModule = useMachineStore.getState().modules[0];
      const originalModuleId = originalModule.instanceId;
      
      duplicateModule(originalModuleId);
      
      const duplicatedModule = useMachineStore.getState().modules[1];
      originalModule.ports.forEach((port, index) => {
        expect(duplicatedModule.ports[index].id).not.toBe(port.id);
      });
    });

    it('should select the duplicated module', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModuleId = useMachineStore.getState().modules[0].instanceId;
      useMachineStore.setState({ selectedModuleId: originalModuleId });
      
      duplicateModule(originalModuleId);
      
      const duplicatedModule = useMachineStore.getState().modules[1];
      expect(useMachineStore.getState().selectedModuleId).toBe(duplicatedModule.instanceId);
    });

    it('should save to history', () => {
      const { addModule, duplicateModule, undo } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModuleId = useMachineStore.getState().modules[0].instanceId;
      
      duplicateModule(originalModuleId);
      
      expect(useMachineStore.getState().modules.length).toBe(2);
      undo();
      expect(useMachineStore.getState().modules.length).toBe(1);
    });

    it('should do nothing when module does not exist', () => {
      const { duplicateModule } = useMachineStore.getState();
      const initialCount = useMachineStore.getState().modules.length;
      
      duplicateModule('non-existent-id');
      
      expect(useMachineStore.getState().modules.length).toBe(initialCount);
    });

    it('should duplicate module with all properties preserved', () => {
      const { addModule, updateModuleScale, updateModuleRotation, updateModuleFlip, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModuleId = useMachineStore.getState().modules[0].instanceId;
      
      // Modify properties
      updateModuleScale(originalModuleId, 1.5);
      updateModuleRotation(originalModuleId, 90);
      updateModuleFlip(originalModuleId);
      
      duplicateModule(originalModuleId);
      
      const originalModule = useMachineStore.getState().modules[0];
      const duplicatedModule = useMachineStore.getState().modules[1];
      
      expect(duplicatedModule.scale).toBe(originalModule.scale);
      expect(duplicatedModule.rotation).toBe(originalModule.rotation);
      expect(duplicatedModule.flipped).toBe(originalModule.flipped);
    });
  });

  describe('Multiple duplications', () => {
    it('should allow multiple duplications in succession', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModuleId = useMachineStore.getState().modules[0].instanceId;
      
      duplicateModule(originalModuleId);
      duplicateModule(useMachineStore.getState().modules[1].instanceId);
      duplicateModule(useMachineStore.getState().modules[2].instanceId);
      
      expect(useMachineStore.getState().modules.length).toBe(4);
    });

    it('should stack offsets correctly for consecutive duplications', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModuleId = useMachineStore.getState().modules[0].instanceId;
      const originalX = useMachineStore.getState().modules[0].x;
      
      duplicateModule(originalModuleId);
      const secondX = useMachineStore.getState().modules[1].x;
      expect(secondX).toBe(originalX + 20);
      
      duplicateModule(useMachineStore.getState().modules[1].instanceId);
      const thirdX = useMachineStore.getState().modules[2].x;
      expect(thirdX).toBe(secondX + 20);
      
      duplicateModule(useMachineStore.getState().modules[2].instanceId);
      const fourthX = useMachineStore.getState().modules[3].x;
      expect(fourthX).toBe(thirdX + 20);
    });

    it('should each duplicate be offset from its source by 20px', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      
      // Create first duplicate
      duplicateModule(useMachineStore.getState().modules[0].instanceId);
      const duplicate1 = useMachineStore.getState().modules[1];
      const original = useMachineStore.getState().modules[0];
      expect(duplicate1.x).toBe(original.x + 20);
      expect(duplicate1.y).toBe(original.y + 20);
    });
  });
});
