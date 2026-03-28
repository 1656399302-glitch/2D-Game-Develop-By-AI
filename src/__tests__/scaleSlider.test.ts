import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';

describe('Scale Slider', () => {
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

  describe('updateModuleScale', () => {
    it('should update module scale to specified value', () => {
      const { addModule, updateModuleScale } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      updateModuleScale(moduleId, 1.5);
      expect(useMachineStore.getState().modules[0].scale).toBe(1.5);
    });

    it('should clamp scale at minimum of 0.5', () => {
      const { addModule, updateModuleScale } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      updateModuleScale(moduleId, 0.2);
      expect(useMachineStore.getState().modules[0].scale).toBe(0.5);
    });

    it('should clamp scale at maximum of 2.0', () => {
      const { addModule, updateModuleScale } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      updateModuleScale(moduleId, 3.0);
      expect(useMachineStore.getState().modules[0].scale).toBe(2.0);
    });

    it('should accept values at exact boundaries', () => {
      const { addModule, updateModuleScale } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      // Minimum boundary
      updateModuleScale(moduleId, 0.5);
      expect(useMachineStore.getState().modules[0].scale).toBe(0.5);
      
      // Maximum boundary
      updateModuleScale(moduleId, 2.0);
      expect(useMachineStore.getState().modules[0].scale).toBe(2.0);
    });

    it('should only update selected module, not others', () => {
      const { addModule, updateModuleScale } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      addModule('gear', 200, 200);
      
      const module1Id = useMachineStore.getState().modules[0].instanceId;
      const module2Id = useMachineStore.getState().modules[1].instanceId;
      
      updateModuleScale(module1Id, 1.5);
      
      expect(useMachineStore.getState().modules[0].scale).toBe(1.5);
      expect(useMachineStore.getState().modules[1].scale).toBe(1); // default scale
    });
  });

  describe('Scale range 0.5x to 2.0x', () => {
    it('should support the full range from 0.5x to 2.0x', () => {
      const { addModule, updateModuleScale } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      const testValues = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
      
      testValues.forEach(value => {
        updateModuleScale(moduleId, value);
        expect(useMachineStore.getState().modules[0].scale).toBe(value);
      });
    });
  });
});
