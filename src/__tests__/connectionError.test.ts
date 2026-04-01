import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';

describe('Connection Error Feedback', () => {
  beforeEach(() => {
    // Reset store to initial state
    useMachineStore.setState({
      modules: [],
      connections: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedModuleId: null,
      selectedConnectionId: null,
      isConnecting: false,
      connectionStart: null,
      connectionPreview: null,
      connectionError: null,
      history: [{ modules: [], connections: [] }],
      historyIndex: 0,
    });
  });

  describe('Same-type port connection error', () => {
    it('should set connection error when connecting same-type ports', () => {
      const { addModule, startConnection, completeConnection } = useMachineStore.getState();
      
      // Add two modules
      addModule('core-furnace', 100, 100);
      addModule('core-furnace', 300, 100);
      
      const modules = useMachineStore.getState().modules;
      const module1 = modules[0];
      const module2 = modules[1];
      
      // Get input ports (both are input type for core-furnace based on config)
      const inputPort1 = module1.ports.find(p => p.type === 'input');
      const inputPort2 = module2.ports.find(p => p.type === 'input');
      
      if (inputPort1 && inputPort2) {
        startConnection(module1.instanceId, inputPort1.id);
        completeConnection(module2.instanceId, inputPort2.id);
        
        const state = useMachineStore.getState();
        expect(state.connectionError).toBeTruthy();
        // Updated to match new specific error message (AC-CONN-VALID-001)
        expect(state.connectionError).toContain('输入端口无法连接到输入端口');
      }
    });
  });

  describe('Duplicate connection error', () => {
    it('should set connection error when connection already exists', () => {
      const { addModule, startConnection, completeConnection } = useMachineStore.getState();
      
      // Add two modules
      addModule('core-furnace', 100, 100);
      addModule('gear', 300, 100);
      
      const modules = useMachineStore.getState().modules;
      const module1 = modules[0];
      const module2 = modules[1];
      
      // Get output and input ports
      const outputPort = module1.ports.find(p => p.type === 'output');
      const inputPort = module2.ports.find(p => p.type === 'input');
      
      if (outputPort && inputPort) {
        // Create first connection
        startConnection(module1.instanceId, outputPort.id);
        completeConnection(module2.instanceId, inputPort.id);
        
        expect(useMachineStore.getState().connections.length).toBe(1);
        expect(useMachineStore.getState().connectionError).toBeNull();
        
        // Try to create duplicate connection
        startConnection(module1.instanceId, outputPort.id);
        completeConnection(module2.instanceId, inputPort.id);
        
        const state = useMachineStore.getState();
        expect(state.connectionError).toBeTruthy();
        expect(state.connectionError).toContain('连接已存在');
      }
    });
  });

  describe('Error auto-clear', () => {
    it('should auto-clear connection error after 2.5 seconds', async () => {
      const { addModule, startConnection, completeConnection, setConnectionError } = useMachineStore.getState();
      
      // Manually set an error
      setConnectionError('Test error');
      expect(useMachineStore.getState().connectionError).toBe('Test error');
      
      // Wait for auto-clear (2.5 seconds + buffer)
      await new Promise(resolve => setTimeout(resolve, 2600));
      
      expect(useMachineStore.getState().connectionError).toBeNull();
    });
  });

  describe('setConnectionError action', () => {
    it('should set connection error to specified value', () => {
      const { setConnectionError } = useMachineStore.getState();
      setConnectionError('Custom error message');
      expect(useMachineStore.getState().connectionError).toBe('Custom error message');
    });

    it('should clear connection error when set to null', () => {
      const { setConnectionError } = useMachineStore.getState();
      setConnectionError('Some error');
      expect(useMachineStore.getState().connectionError).toBeTruthy();
      setConnectionError(null);
      expect(useMachineStore.getState().connectionError).toBeNull();
    });
  });
});
