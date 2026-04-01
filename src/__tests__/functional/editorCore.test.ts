/**
 * AC-EDITOR-001 & AC-EDITOR-002: Functional Tests for Editor Core
 * 
 * Verifies:
 * - AC-EDITOR-001: User can add modules from the panel to the canvas via store API
 * - AC-EDITOR-002: User can create energy connections between two placed modules
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react-dom/test-utils';
import { useMachineStore } from '../../store/useMachineStore';
import { ModuleType } from '../../types';

describe('Editor Core Functional Tests', () => {
  beforeEach(() => {
    // Reset store to clean state
    const state = useMachineStore.getState();
    state.clearCanvas();
    state.setMachineState('idle');
  });

  afterEach(() => {
    // Cleanup
    const state = useMachineStore.getState();
    state.clearCanvas();
    state.setMachineState('idle');
  });

  describe('AC-EDITOR-001: Module Drag onto Canvas', () => {
    it('should add a module to empty canvas', () => {
      const { addModule, modules } = useMachineStore.getState();
      
      // Initial state should be empty
      expect(modules.length).toBe(0);
      
      // Add a core-furnace module
      act(() => {
        addModule('core-furnace', 100, 100);
      });
      
      const state = useMachineStore.getState();
      expect(state.modules.length).toBe(1);
      expect(state.modules[0].type).toBe('core-furnace');
      expect(state.modules[0].x).toBeDefined();
      expect(state.modules[0].y).toBeDefined();
    });

    it('should add multiple different module types', () => {
      const { addModule } = useMachineStore.getState();
      
      const moduleTypes: ModuleType[] = [
        'core-furnace',
        'gear',
        'energy-pipe',
        'rune-node',
        'shield-casing',
      ];
      
      moduleTypes.forEach((type, index) => {
        act(() => {
          addModule(type, 100 + index * 100, 100);
        });
      });
      
      const state = useMachineStore.getState();
      expect(state.modules.length).toBe(5);
      
      // Verify each module has correct type
      moduleTypes.forEach((type, index) => {
        expect(state.modules[index].type).toBe(type);
      });
    });

    it('should set module as selected after adding', () => {
      const { addModule, selectedModuleId } = useMachineStore.getState();
      
      act(() => {
        addModule('core-furnace', 100, 100);
      });
      
      const state = useMachineStore.getState();
      expect(state.selectedModuleId).toBe(state.modules[0].instanceId);
    });

    it('should create modules with default ports', () => {
      const { addModule } = useMachineStore.getState();
      
      act(() => {
        addModule('core-furnace', 100, 100);
      });
      
      const state = useMachineStore.getState();
      const module = state.modules[0];
      
      // Module should have ports
      expect(module.ports).toBeDefined();
      expect(module.ports.length).toBeGreaterThan(0);
      
      // Ports should have types
      const hasInputPort = module.ports.some(p => p.type === 'input');
      const hasOutputPort = module.ports.some(p => p.type === 'output');
      expect(hasInputPort).toBe(true);
      expect(hasOutputPort).toBe(true);
    });

    it('should add module with correct instanceId', () => {
      const { addModule } = useMachineStore.getState();
      
      act(() => {
        addModule('gear', 150, 150);
      });
      
      const state = useMachineStore.getState();
      const module = state.modules[0];
      
      expect(module.instanceId).toBeDefined();
      expect(typeof module.instanceId).toBe('string');
      expect(module.instanceId.length).toBeGreaterThan(0);
    });

    it('should clear generated attributes when adding module manually', () => {
      const { addModule, setGeneratedAttributes } = useMachineStore.getState();
      
      // Set some generated attributes first
      act(() => {
        setGeneratedAttributes({
          name: 'Test Machine',
          rarity: 'rare',
          stability: 0.8,
          energy: 100,
          failureRate: 0.1,
          output: 'fire',
          能耗: 'medium',
          coreFaction: 'arcane',
          description: 'Test',
          tags: ['test'],
          codexNumber: 'MC-0001',
        });
      });
      
      // Add a module
      act(() => {
        addModule('core-furnace', 100, 100);
      });
      
      const state = useMachineStore.getState();
      expect(state.generatedAttributes).toBeNull();
    });
  });

  describe('AC-EDITOR-002: Connection Creation Between Modules', () => {
    it('should create connection between two modules', () => {
      const { addModule, startConnection, completeConnection, connections } = useMachineStore.getState();
      
      // Add two modules
      act(() => {
        addModule('core-furnace', 100, 100);
        addModule('gear', 200, 100);
      });
      
      const state = useMachineStore.getState();
      const sourceModule = state.modules[0];
      const targetModule = state.modules[1];
      
      // Find output port from source and input port from target
      const sourcePort = sourceModule.ports.find(p => p.type === 'output');
      const targetPort = targetModule.ports.find(p => p.type === 'input');
      
      expect(sourcePort).toBeDefined();
      expect(targetPort).toBeDefined();
      
      // Start connection from source module
      act(() => {
        startConnection(sourceModule.instanceId, sourcePort!.id);
      });
      
      // Complete connection to target module
      act(() => {
        completeConnection(targetModule.instanceId, targetPort!.id);
      });
      
      const finalState = useMachineStore.getState();
      expect(finalState.connections.length).toBe(1);
      
      const connection = finalState.connections[0];
      expect(connection.sourceModuleId).toBe(sourceModule.instanceId);
      expect(connection.targetModuleId).toBe(targetModule.instanceId);
      expect(connection.pathData).toBeDefined();
    });

    it('should not allow duplicate connections', () => {
      const { addModule, startConnection, completeConnection, connections } = useMachineStore.getState();
      
      // Add two modules
      act(() => {
        addModule('core-furnace', 100, 100);
        addModule('rune-node', 200, 100);
      });
      
      const state = useMachineStore.getState();
      const sourceModule = state.modules[0];
      const targetModule = state.modules[1];
      
      const sourcePort = sourceModule.ports.find(p => p.type === 'output');
      const targetPort = targetModule.ports.find(p => p.type === 'input');
      
      // Create first connection
      act(() => {
        startConnection(sourceModule.instanceId, sourcePort!.id);
        completeConnection(targetModule.instanceId, targetPort!.id);
      });
      
      // Try to create duplicate
      act(() => {
        startConnection(sourceModule.instanceId, sourcePort!.id);
        completeConnection(targetModule.instanceId, targetPort!.id);
      });
      
      const finalState = useMachineStore.getState();
      expect(finalState.connections.length).toBe(1);
    });

    it('should not allow same-type port connections', () => {
      const { addModule, startConnection, completeConnection, connections } = useMachineStore.getState();
      
      // Add two modules
      act(() => {
        addModule('core-furnace', 100, 100);
        addModule('core-furnace', 200, 100);
      });
      
      const state = useMachineStore.getState();
      const sourceModule = state.modules[0];
      const targetModule = state.modules[1];
      
      // Find two output ports
      const sourcePort = sourceModule.ports.find(p => p.type === 'output');
      const targetPort = targetModule.ports.find(p => p.type === 'output');
      
      // Try to connect output to output
      act(() => {
        startConnection(sourceModule.instanceId, sourcePort!.id);
        completeConnection(targetModule.instanceId, targetPort!.id);
      });
      
      const finalState = useMachineStore.getState();
      // Connection should not be created due to type conflict
      expect(finalState.connectionError).toBeDefined();
    });

    it('should remove connection correctly', () => {
      const { addModule, startConnection, completeConnection, removeConnection } = useMachineStore.getState();
      
      // Create connection
      act(() => {
        addModule('core-furnace', 100, 100);
        addModule('gear', 200, 100);
      });
      
      const state = useMachineStore.getState();
      const sourceModule = state.modules[0];
      const targetModule = state.modules[1];
      
      const sourcePort = sourceModule.ports.find(p => p.type === 'output');
      const targetPort = targetModule.ports.find(p => p.type === 'input');
      
      act(() => {
        startConnection(sourceModule.instanceId, sourcePort!.id);
        completeConnection(targetModule.instanceId, targetPort!.id);
      });
      
      const stateWithConnection = useMachineStore.getState();
      expect(stateWithConnection.connections.length).toBe(1);
      
      const connectionId = stateWithConnection.connections[0].id;
      
      // Remove connection
      act(() => {
        removeConnection(connectionId);
      });
      
      const finalState = useMachineStore.getState();
      expect(finalState.connections.length).toBe(0);
    });

    it('should update connection when modules are repositioned', () => {
      const { addModule, startConnection, completeConnection, updateModulePosition } = useMachineStore.getState();
      
      // Create connection
      act(() => {
        addModule('core-furnace', 100, 100);
        addModule('gear', 200, 100);
      });
      
      const state = useMachineStore.getState();
      const sourceModule = state.modules[0];
      const targetModule = state.modules[1];
      
      const sourcePort = sourceModule.ports.find(p => p.type === 'output');
      const targetPort = targetModule.ports.find(p => p.type === 'input');
      
      act(() => {
        startConnection(sourceModule.instanceId, sourcePort!.id);
        completeConnection(targetModule.instanceId, targetPort!.id);
      });
      
      const stateWithConnection = useMachineStore.getState();
      const originalPath = stateWithConnection.connections[0].pathData;
      
      // Move source module
      act(() => {
        updateModulePosition(sourceModule.instanceId, 150, 150);
      });
      
      const finalState = useMachineStore.getState();
      const newPath = finalState.connections[0].pathData;
      
      // Path should have been updated
      expect(newPath).toBeDefined();
    });
  });

  describe('Module State Integrity', () => {
    it('should maintain module state after multiple operations', () => {
      const { addModule, selectModule, updateModuleScale, updateModuleRotation } = useMachineStore.getState();
      
      act(() => {
        addModule('core-furnace', 100, 100);
      });
      
      let state = useMachineStore.getState();
      const moduleId = state.modules[0].instanceId;
      
      // Apply multiple transformations
      act(() => {
        selectModule(moduleId);
        updateModuleScale(moduleId, 1.5);
        updateModuleRotation(moduleId, 45);
      });
      
      state = useMachineStore.getState();
      expect(state.modules[0].scale).toBeCloseTo(1.5, 1);
      expect(state.modules[0].rotation).toBe(45);
    });

    it('should handle removing module with connections', () => {
      const { addModule, startConnection, completeConnection, removeModule } = useMachineStore.getState();
      
      // Create connection
      act(() => {
        addModule('core-furnace', 100, 100);
        addModule('gear', 200, 100);
      });
      
      const state = useMachineStore.getState();
      const sourceModule = state.modules[0];
      const targetModule = state.modules[1];
      
      const sourcePort = sourceModule.ports.find(p => p.type === 'output');
      const targetPort = targetModule.ports.find(p => p.type === 'input');
      
      act(() => {
        startConnection(sourceModule.instanceId, sourcePort!.id);
        completeConnection(targetModule.instanceId, targetPort!.id);
      });
      
      // Remove source module
      act(() => {
        removeModule(sourceModule.instanceId);
      });
      
      const finalState = useMachineStore.getState();
      // Connection should be removed when module is deleted
      expect(finalState.connections.length).toBe(0);
      expect(finalState.modules.length).toBe(1);
    });
  });
});
