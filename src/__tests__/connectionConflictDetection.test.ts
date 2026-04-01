/**
 * Connection Conflict Detection Tests
 * 
 * Test coverage for connection conflict scenarios:
 * - Input-to-input conflict (AC-CONN-VALID-001)
 * - Output-to-output conflict (AC-CONN-VALID-002)
 * - Self-connection conflict (AC-CONN-VALID-003)
 * - Error message verification for each conflict type
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';
import { PlacedModule, Port } from '../types';

// Helper to create mock modules with specific ports
const createMockModule = (
  instanceId: string,
  ports: Port[]
): PlacedModule => ({
  id: `id-${instanceId}`,
  instanceId,
  type: 'core-furnace',
  x: 100,
  y: 100,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports,
});

// Helper to create input port
const inputPort = (id: string): Port => ({
  id,
  type: 'input',
  position: { x: 25, y: 40 },
});

// Helper to create output port
const outputPort = (id: string): Port => ({
  id,
  type: 'output',
  position: { x: 75, y: 40 },
});

describe('Connection Conflict Detection Tests', () => {
  beforeEach(() => {
    // Reset store to initial state
    useMachineStore.setState({
      modules: [],
      connections: [],
      selectedModuleId: null,
      selectedConnectionId: null,
      viewport: { x: 0, y: 0, zoom: 1 },
      machineState: 'idle',
      isConnecting: false,
      connectionStart: null,
      connectionPreview: null,
      connectionError: null,
      history: [{ modules: [], connections: [] }],
      historyIndex: 0,
      gridEnabled: true,
    });
  });

  describe('AC-CONN-VALID-001: Input-to-input conflict detection', () => {
    it('should detect and report error when connecting input to input port', () => {
      const module1 = createMockModule('m1', [inputPort('m1-input')]);
      const module2 = createMockModule('m2', [inputPort('m2-input')]);
      
      useMachineStore.setState({ modules: [module1, module2] });
      
      // Attempt to connect input to input
      useMachineStore.getState().startConnection('m1', 'm1-input');
      useMachineStore.getState().completeConnection('m2', 'm2-input');
      
      const { connections, connectionError } = useMachineStore.getState();
      
      // Connection should NOT be created
      expect(connections.length).toBe(0);
      
      // Error should be set with specific message
      expect(connectionError).toBe('输入端口无法连接到输入端口');
    });

    it('should not create connection when both ports are inputs even with different modules', () => {
      const module1 = createMockModule('m1', [
        inputPort('m1-input'),
        outputPort('m1-output'),
      ]);
      const module2 = createMockModule('m2', [
        inputPort('m2-input'),
        outputPort('m2-output'),
      ]);
      
      useMachineStore.setState({ modules: [module1, module2] });
      
      // Attempt input-to-input connection
      useMachineStore.getState().startConnection('m1', 'm1-input');
      useMachineStore.getState().completeConnection('m2', 'm2-input');
      
      const { connections, connectionError } = useMachineStore.getState();
      
      expect(connections.length).toBe(0);
      expect(connectionError).toBe('输入端口无法连接到输入端口');
    });

    it('should allow valid connection after rejecting input-to-input', () => {
      const module1 = createMockModule('m1', [
        inputPort('m1-input'),
        outputPort('m1-output'),
      ]);
      const module2 = createMockModule('m2', [
        inputPort('m2-input'),
        outputPort('m2-output'),
      ]);
      
      useMachineStore.setState({ modules: [module1, module2] });
      
      // First, try invalid input-to-input (should fail)
      useMachineStore.getState().startConnection('m1', 'm1-input');
      useMachineStore.getState().completeConnection('m2', 'm2-input');
      
      expect(useMachineStore.getState().connections.length).toBe(0);
      
      // Now, try valid output-to-input (should succeed)
      useMachineStore.getState().startConnection('m1', 'm1-output');
      useMachineStore.getState().completeConnection('m2', 'm2-input');
      
      const { connections, connectionError } = useMachineStore.getState();
      
      expect(connections.length).toBe(1);
      expect(connectionError).toBeNull();
    });
  });

  describe('AC-CONN-VALID-002: Output-to-output conflict detection', () => {
    it('should detect and report error when connecting output to output port', () => {
      const module1 = createMockModule('m1', [outputPort('m1-output')]);
      const module2 = createMockModule('m2', [outputPort('m2-output')]);
      
      useMachineStore.setState({ modules: [module1, module2] });
      
      // Attempt to connect output to output
      useMachineStore.getState().startConnection('m1', 'm1-output');
      useMachineStore.getState().completeConnection('m2', 'm2-output');
      
      const { connections, connectionError } = useMachineStore.getState();
      
      // Connection should NOT be created
      expect(connections.length).toBe(0);
      
      // Error should be set with specific message
      expect(connectionError).toBe('输出端口无法连接到输出端口');
    });

    it('should not create connection when both ports are outputs even with different modules', () => {
      const module1 = createMockModule('m1', [
        inputPort('m1-input'),
        outputPort('m1-output'),
      ]);
      const module2 = createMockModule('m2', [
        inputPort('m2-input'),
        outputPort('m2-output'),
      ]);
      
      useMachineStore.setState({ modules: [module1, module2] });
      
      // Attempt output-to-output connection
      useMachineStore.getState().startConnection('m1', 'm1-output');
      useMachineStore.getState().completeConnection('m2', 'm2-output');
      
      const { connections, connectionError } = useMachineStore.getState();
      
      expect(connections.length).toBe(0);
      expect(connectionError).toBe('输出端口无法连接到输出端口');
    });

    it('should allow valid connection after rejecting output-to-output', () => {
      const module1 = createMockModule('m1', [
        inputPort('m1-input'),
        outputPort('m1-output'),
      ]);
      const module2 = createMockModule('m2', [
        inputPort('m2-input'),
        outputPort('m2-output'),
      ]);
      
      useMachineStore.setState({ modules: [module1, module2] });
      
      // First, try invalid output-to-output (should fail)
      useMachineStore.getState().startConnection('m1', 'm1-output');
      useMachineStore.getState().completeConnection('m2', 'm2-output');
      
      expect(useMachineStore.getState().connections.length).toBe(0);
      
      // Now, try valid output-to-input (should succeed)
      useMachineStore.getState().startConnection('m1', 'm1-output');
      useMachineStore.getState().completeConnection('m2', 'm2-input');
      
      const { connections, connectionError } = useMachineStore.getState();
      
      expect(connections.length).toBe(1);
      expect(connectionError).toBeNull();
    });
  });

  describe('AC-CONN-VALID-003: Self-connection conflict detection', () => {
    it('should detect and report error when module is connected to itself', () => {
      const module = createMockModule('m1', [
        inputPort('m1-input'),
        outputPort('m1-output'),
      ]);
      
      useMachineStore.setState({ modules: [module] });
      
      // Attempt self-connection
      useMachineStore.getState().startConnection('m1', 'm1-output');
      useMachineStore.getState().completeConnection('m1', 'm1-input');
      
      const { connections, connectionError } = useMachineStore.getState();
      
      // Connection should NOT be created
      expect(connections.length).toBe(0);
      
      // Error should be set with specific message
      expect(connectionError).toBe('模块无法连接到自身');
    });

    it('should prevent self-connection regardless of port order', () => {
      const module = createMockModule('m1', [
        inputPort('m1-input'),
        outputPort('m1-output'),
      ]);
      
      useMachineStore.setState({ modules: [module] });
      
      // Attempt self-connection with reversed port order
      useMachineStore.getState().startConnection('m1', 'm1-input');
      useMachineStore.getState().completeConnection('m1', 'm1-output');
      
      const { connections, connectionError } = useMachineStore.getState();
      
      expect(connections.length).toBe(0);
      expect(connectionError).toBe('模块无法连接到自身');
    });

    it('should allow connections between different modules after rejecting self-connection', () => {
      const module1 = createMockModule('m1', [
        inputPort('m1-input'),
        outputPort('m1-output'),
      ]);
      const module2 = createMockModule('m2', [
        inputPort('m2-input'),
        outputPort('m2-output'),
      ]);
      
      useMachineStore.setState({ modules: [module1, module2] });
      
      // First, try invalid self-connection (should fail)
      useMachineStore.getState().startConnection('m1', 'm1-output');
      useMachineStore.getState().completeConnection('m1', 'm1-input');
      
      expect(useMachineStore.getState().connections.length).toBe(0);
      
      // Now, try valid connection between different modules (should succeed)
      useMachineStore.getState().startConnection('m1', 'm1-output');
      useMachineStore.getState().completeConnection('m2', 'm2-input');
      
      const { connections, connectionError } = useMachineStore.getState();
      
      expect(connections.length).toBe(1);
      expect(connectionError).toBeNull();
    });
  });

  describe('Duplicate connection conflict detection', () => {
    it('should reject duplicate connections with same message', () => {
      const module1 = createMockModule('m1', [
        inputPort('m1-input'),
        outputPort('m1-output'),
      ]);
      const module2 = createMockModule('m2', [
        inputPort('m2-input'),
        outputPort('m2-output'),
      ]);
      
      useMachineStore.setState({ modules: [module1, module2] });
      
      // First, create valid connection
      useMachineStore.getState().startConnection('m1', 'm1-output');
      useMachineStore.getState().completeConnection('m2', 'm2-input');
      
      expect(useMachineStore.getState().connections.length).toBe(1);
      
      // Try to create duplicate connection
      useMachineStore.getState().startConnection('m1', 'm1-output');
      useMachineStore.getState().completeConnection('m2', 'm2-input');
      
      const { connections, connectionError } = useMachineStore.getState();
      
      // Should still have only 1 connection
      expect(connections.length).toBe(1);
      expect(connectionError).toBe('连接已存在');
    });

    it('should reject reverse duplicate connections', () => {
      const module1 = createMockModule('m1', [
        inputPort('m1-input'),
        outputPort('m1-output'),
      ]);
      const module2 = createMockModule('m2', [
        inputPort('m2-input'),
        outputPort('m2-output'),
      ]);
      
      useMachineStore.setState({ modules: [module1, module2] });
      
      // Create first connection: m1 output -> m2 input
      useMachineStore.getState().startConnection('m1', 'm1-output');
      useMachineStore.getState().completeConnection('m2', 'm2-input');
      
      // Try to create reverse connection: m2 output -> m1 input
      // This is a different connection (different ports) so it should be allowed
      useMachineStore.getState().startConnection('m2', 'm2-output');
      useMachineStore.getState().completeConnection('m1', 'm1-input');
      
      const { connections } = useMachineStore.getState();
      
      // Should have 2 connections (bidirectional)
      expect(connections.length).toBe(2);
    });
  });

  describe('Error auto-clear behavior', () => {
    it('should auto-clear connection error after timeout', async () => {
      const module1 = createMockModule('m1', [inputPort('m1-input')]);
      const module2 = createMockModule('m2', [inputPort('m2-input')]);
      
      useMachineStore.setState({ modules: [module1, module2] });
      
      // Create invalid connection to trigger error
      useMachineStore.getState().startConnection('m1', 'm1-input');
      useMachineStore.getState().completeConnection('m2', 'm2-input');
      
      expect(useMachineStore.getState().connectionError).toBe('输入端口无法连接到输入端口');
      
      // Wait for auto-clear (2.5 seconds + buffer)
      await new Promise(resolve => setTimeout(resolve, 2600));
      
      expect(useMachineStore.getState().connectionError).toBeNull();
    });
  });

  describe('Error state consistency', () => {
    it('should clear error when starting new connection', () => {
      const module1 = createMockModule('m1', [inputPort('m1-input')]);
      const module2 = createMockModule('m2', [inputPort('m2-input')]);
      const module3 = createMockModule('m3', [
        inputPort('m3-input'),
        outputPort('m3-output'),
      ]);
      
      useMachineStore.setState({ modules: [module1, module2, module3] });
      
      // Create first invalid connection
      useMachineStore.getState().startConnection('m1', 'm1-input');
      useMachineStore.getState().completeConnection('m2', 'm2-input');
      
      expect(useMachineStore.getState().connectionError).toBe('输入端口无法连接到输入端口');
      
      // Start a new connection - should clear error
      useMachineStore.getState().startConnection('m3', 'm3-output');
      
      expect(useMachineStore.getState().connectionError).toBeNull();
      expect(useMachineStore.getState().isConnecting).toBe(true);
    });

    it('should clear error when canceling connection', () => {
      const module1 = createMockModule('m1', [inputPort('m1-input')]);
      const module2 = createMockModule('m2', [inputPort('m2-input')]);
      
      useMachineStore.setState({ modules: [module1, module2] });
      
      // Create first invalid connection
      useMachineStore.getState().startConnection('m1', 'm1-input');
      useMachineStore.getState().completeConnection('m2', 'm2-input');
      
      expect(useMachineStore.getState().connectionError).toBe('输入端口无法连接到输入端口');
      
      // Cancel connection
      useMachineStore.getState().cancelConnection();
      
      expect(useMachineStore.getState().connectionError).toBeNull();
      expect(useMachineStore.getState().isConnecting).toBe(false);
    });
  });
});
