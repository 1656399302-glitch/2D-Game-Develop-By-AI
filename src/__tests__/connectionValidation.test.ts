/**
 * Connection Validation Tests
 * 
 * Test coverage for connection validation logic (AC-CONN-VALID-001, AC-CONN-VALID-002, AC-CONN-VALID-003)
 * Verifies:
 * - Self-connection prevention
 * - Same port type connection prevention (input-input, output-output)
 * - Duplicate connection detection
 * - Valid connection acceptance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { validateConnection, validateSourcePort, validateTargetPort } from '../utils/connectionValidator';
import { PlacedModule, Connection, Port } from '../types';

// Helper to create mock ports
const createInputPort = (id: string): Port => ({
  id,
  type: 'input',
  position: { x: 0, y: 40 },
});

const createOutputPort = (id: string): Port => ({
  id,
  type: 'output',
  position: { x: 80, y: 40 },
});

// Helper to create mock modules
const createMockModule = (
  instanceId: string,
  type: string = 'core-furnace',
  ports: Port[] = [createInputPort(`${type}-input-0`), createOutputPort(`${type}-output-0`)]
): PlacedModule => ({
  id: `id-${instanceId}`,
  instanceId,
  type: type as any,
  x: 100,
  y: 100,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports,
});

// Helper to create mock connections
const createMockConnection = (
  id: string,
  sourceModuleId: string,
  sourcePortId: string,
  targetModuleId: string,
  targetPortId: string
): Connection => ({
  id,
  sourceModuleId,
  sourcePortId,
  targetModuleId,
  targetPortId,
  pathData: `M0,0 L100,100`,
});

describe('Connection Validation Tests', () => {
  describe('AC-CONN-VALID-003: Self-connection prevention', () => {
    it('should reject connection when source and target module are the same', () => {
      const modules = [createMockModule('m1')];
      const connections: Connection[] = [];
      
      const result = validateConnection(
        'm1',
        modules[0].ports[0], // input port
        'm1',
        modules[0].ports[1], // output port
        connections,
        modules
      );
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('SELF_CONNECTION');
      expect(result.error?.message).toBe('模块无法连接到自身');
    });

    it('should reject self-connection regardless of port types', () => {
      const modules = [createMockModule('m1')];
      const connections: Connection[] = [];
      
      // Both are input ports (should still fail due to self-connection)
      const result = validateConnection(
        'm1',
        modules[0].ports[0], // input port
        'm1',
        modules[0].ports[0], // same input port
        connections,
        modules
      );
      
      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('SELF_CONNECTION');
    });
  });

  describe('AC-CONN-VALID-001: Input-to-input connection prevention', () => {
    it('should reject connection between two input ports', () => {
      const module1 = createMockModule('m1', 'core-furnace', [createInputPort('input1')]);
      const module2 = createMockModule('m2', 'gear', [createInputPort('input2')]);
      const modules = [module1, module2];
      const connections: Connection[] = [];
      
      const result = validateConnection(
        'm1',
        module1.ports[0], // input port
        'm2',
        module2.ports[0], // input port
        connections,
        modules
      );
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('SAME_PORT_TYPE');
      expect(result.error?.message).toBe('输入端口无法连接到输入端口');
    });

    it('should reject connection between multiple input ports on same module', () => {
      const multiInputModule = createMockModule('m1', 'stabilizer-core', [
        createInputPort('input1'),
        createInputPort('input2'),
        createOutputPort('output1'),
      ]);
      const modules = [multiInputModule];
      const connections: Connection[] = [];
      
      const result = validateConnection(
        'm1',
        multiInputModule.ports[0], // first input
        'm1',
        multiInputModule.ports[1], // second input
        connections,
        modules
      );
      
      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('SELF_CONNECTION'); // Self-connection takes priority
    });
  });

  describe('AC-CONN-VALID-002: Output-to-output connection prevention', () => {
    it('should reject connection between two output ports', () => {
      const module1 = createMockModule('m1', 'core-furnace', [createOutputPort('output1')]);
      const module2 = createMockModule('m2', 'gear', [createOutputPort('output2')]);
      const modules = [module1, module2];
      const connections: Connection[] = [];
      
      const result = validateConnection(
        'm1',
        module1.ports[0], // output port
        'm2',
        module2.ports[0], // output port
        connections,
        modules
      );
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('SAME_PORT_TYPE');
      expect(result.error?.message).toBe('输出端口无法连接到输出端口');
    });

    it('should reject output-to-output even with multiple output ports', () => {
      const multiOutputModule = createMockModule('m1', 'amplifier-crystal', [
        createInputPort('input1'),
        createOutputPort('output1'),
        createOutputPort('output2'),
      ]);
      const modules = [multiOutputModule];
      const connections: Connection[] = [];
      
      const result = validateConnection(
        'm1',
        multiOutputModule.ports[1], // first output
        'm1',
        multiOutputModule.ports[2], // second output
        connections,
        modules
      );
      
      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('SELF_CONNECTION'); // Self-connection takes priority
    });
  });

  describe('Duplicate connection detection', () => {
    it('should reject duplicate connections between same ports', () => {
      const module1 = createMockModule('m1');
      const module2 = createMockModule('m2');
      const modules = [module1, module2];
      
      const existingConnection = createMockConnection(
        'conn-1',
        'm1',
        'core-furnace-output-0',
        'm2',
        'core-furnace-input-0'
      );
      const connections = [existingConnection];
      
      const result = validateConnection(
        'm1',
        module1.ports[1], // output port
        'm2',
        module2.ports[0], // input port
        connections,
        modules
      );
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('DUPLICATE_CONNECTION');
      expect(result.error?.message).toBe('连接已存在');
    });

    it('should allow reverse direction connections (different ports)', () => {
      const module1 = createMockModule('m1');
      const module2 = createMockModule('m2');
      const modules = [module1, module2];
      
      // Existing connection: m1 -> m2 (m1 output -> m2 input)
      const existingConnection = createMockConnection(
        'conn-1',
        'm1',
        'core-furnace-output-0',
        'm2',
        'core-furnace-input-0'
      );
      const connections = [existingConnection];
      
      // Try to create reverse: m2 -> m1 (m2 output -> m1 input)
      // This is a VALID connection because it uses different ports
      const result = validateConnection(
        'm2',
        module2.ports[1], // output port of m2
        'm1',
        module1.ports[0], // input port of m1
        connections,
        modules
      );
      
      // This is valid - bidirectional connections are allowed
      expect(result.valid).toBe(true);
    });
  });

  describe('Valid connection acceptance', () => {
    it('should accept valid output-to-input connection', () => {
      const module1 = createMockModule('m1');
      const module2 = createMockModule('m2');
      const modules = [module1, module2];
      const connections: Connection[] = [];
      
      const result = validateConnection(
        'm1',
        module1.ports[1], // output port
        'm2',
        module2.ports[0], // input port
        connections,
        modules
      );
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid input-to-output connection (reversed direction)', () => {
      const module1 = createMockModule('m1');
      const module2 = createMockModule('m2');
      const modules = [module1, module2];
      const connections: Connection[] = [];
      
      // Note: The port types still need to be different
      const result = validateConnection(
        'm2',
        module2.ports[1], // output port
        'm1',
        module1.ports[0], // input port
        connections,
        modules
      );
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept multiple connections from same module to different targets', () => {
      const module1 = createMockModule('m1');
      const module2 = createMockModule('m2');
      const module3 = createMockModule('m3');
      const modules = [module1, module2, module3];
      
      const existingConnection = createMockConnection(
        'conn-1',
        'm1',
        'core-furnace-output-0',
        'm2',
        'core-furnace-input-0'
      );
      const connections = [existingConnection];
      
      // Second connection from m1 to m3 (different target)
      const result = validateConnection(
        'm1',
        module1.ports[1], // output port
        'm3',
        module3.ports[0], // input port
        connections,
        modules
      );
      
      expect(result.valid).toBe(true);
    });

    it('should accept connections between different port indices', () => {
      const multiPortModule = createMockModule('m1', 'amplifier-crystal', [
        createInputPort('input1'),
        createOutputPort('output1'),
        createOutputPort('output2'),
      ]);
      const targetModule = createMockModule('m2', 'output-array', [
        createInputPort('input1'),
        createOutputPort('output1'),
      ]);
      const modules = [multiPortModule, targetModule];
      const connections: Connection[] = [];
      
      // Connect second output port
      const result = validateConnection(
        'm1',
        multiPortModule.ports[2], // output2
        'm2',
        targetModule.ports[0], // input1
        connections,
        modules
      );
      
      expect(result.valid).toBe(true);
    });
  });

  describe('Module and port existence validation', () => {
    it('should reject connection when source module does not exist', () => {
      const module = createMockModule('m1');
      const modules = [module];
      const connections: Connection[] = [];
      
      const result = validateConnection(
        'non-existent',
        module.ports[1],
        'm1',
        module.ports[0],
        connections,
        modules
      );
      
      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('SOURCE_NOT_FOUND');
    });

    it('should reject connection when target module does not exist', () => {
      const module = createMockModule('m1');
      const modules = [module];
      const connections: Connection[] = [];
      
      const result = validateConnection(
        'm1',
        module.ports[1],
        'non-existent',
        module.ports[0],
        connections,
        modules
      );
      
      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('TARGET_NOT_FOUND');
    });

    it('should reject connection when source port does not exist on module', () => {
      const sourceModule = createMockModule('source');
      const targetModule = createMockModule('target');
      const modules = [sourceModule, targetModule];
      const connections: Connection[] = [];
      
      // Use fake port ID that doesn't exist on the source module
      const fakeSourcePort: Port = { id: 'fake-source-port', type: 'output', position: { x: 50, y: 50 } };
      
      const result = validateConnection(
        'source',
        fakeSourcePort,
        'target',
        targetModule.ports[0],
        connections,
        modules
      );
      
      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('SOURCE_NOT_FOUND');
    });

    it('should reject connection when target port does not exist on module', () => {
      const sourceModule = createMockModule('source');
      const targetModule = createMockModule('target');
      const modules = [sourceModule, targetModule];
      const connections: Connection[] = [];
      
      // Use fake port ID that doesn't exist on the target module
      const fakeTargetPort: Port = { id: 'fake-target-port', type: 'input', position: { x: 50, y: 50 } };
      
      const result = validateConnection(
        'source',
        sourceModule.ports[1],
        'target',
        fakeTargetPort,
        connections,
        modules
      );
      
      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('TARGET_NOT_FOUND');
    });
  });

  describe('Source and target port validation helpers', () => {
    it('validateSourcePort should reject input port', () => {
      const module = createMockModule('m1');
      const modules = [module];
      
      const result = validateSourcePort('m1', 'core-furnace-input-0', modules);
      
      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('INVALID_PORT_TYPE');
    });

    it('validateSourcePort should accept output port', () => {
      const module = createMockModule('m1');
      const modules = [module];
      
      const result = validateSourcePort('m1', 'core-furnace-output-0', modules);
      
      expect(result.valid).toBe(true);
    });

    it('validateTargetPort should reject output port', () => {
      const module = createMockModule('m1');
      const modules = [module];
      
      const result = validateTargetPort('m1', 'core-furnace-output-0', modules);
      
      expect(result.valid).toBe(false);
      expect(result.error?.code).toBe('INVALID_PORT_TYPE');
    });

    it('validateTargetPort should accept input port', () => {
      const module = createMockModule('m1');
      const modules = [module];
      
      const result = validateTargetPort('m1', 'core-furnace-input-0', modules);
      
      expect(result.valid).toBe(true);
    });
  });
});
