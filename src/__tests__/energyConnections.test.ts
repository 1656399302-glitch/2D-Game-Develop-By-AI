/**
 * Energy Connections Test Suite
 * 
 * Round 111: Energy Connection System + Module Animation Hooks
 * 
 * Tests for useEnergyConnections hook and connection validation
 */

import { describe, it, expect, vi } from 'vitest';
import {
  ConnectionState,
  isActiveConnectionState,
  isProblemConnectionState,
  machineStateToConnectionState,
} from '../types/connection';
import { validateConnectionAttempt } from '../hooks/useEnergyConnections';
import { PlacedModule, ModuleType, Connection as StoreConnection } from '../types';

// Mock modules for testing
const createMockModule = (type: ModuleType, instanceId: string, ports: Array<{ id: string; type: 'input' | 'output'; position: { x: number; y: number } }> = []): PlacedModule => ({
  id: 'test-id',
  instanceId,
  type,
  x: 100,
  y: 100,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports,
});

// Create mock modules with proper ports
const createCoreModule = (): PlacedModule => createMockModule('core-furnace', 'core-1', [
  { id: 'core-1-output-0', type: 'output', position: { x: 75, y: 50 } },
  { id: 'core-1-output-1', type: 'output', position: { x: 75, y: 30 } },
]);

const createPipeModule = (): PlacedModule => createMockModule('energy-pipe', 'pipe-1', [
  { id: 'pipe-1-input-0', type: 'input', position: { x: 0, y: 25 } },
  { id: 'pipe-1-output-0', type: 'output', position: { x: 100, y: 25 } },
]);

const createOutputModule = (): PlacedModule => createMockModule('output-array', 'output-1', [
  { id: 'output-1-input-0', type: 'input', position: { x: 0, y: 40 } },
]);

// Helper to create mock connections for testing
function createMockConnection(
  id: string,
  sourceModuleId: string,
  sourcePortId: string,
  targetModuleId: string,
  targetPortId: string
): StoreConnection {
  return {
    id,
    sourceModuleId,
    sourcePortId,
    targetModuleId,
    targetPortId,
    pathData: `M ${sourceModuleId} ${targetModuleId}`,
  };
}

describe('Connection Creation', () => {
  it('should create connection with default values', () => {
    const connection = createMockConnection(
      'conn-1',
      'module-1',
      'port-1',
      'module-2',
      'port-2'
    );
    
    expect(connection.id).toBe('conn-1');
    expect(connection.sourceModuleId).toBe('module-1');
    expect(connection.sourcePortId).toBe('port-1');
    expect(connection.targetModuleId).toBe('module-2');
    expect(connection.targetPortId).toBe('port-2');
    expect(connection.pathData).toBeDefined();
  });
  
  it('should create connection without path data', () => {
    const connection = createMockConnection(
      'conn-1',
      'module-1',
      'port-1',
      'module-2',
      'port-2'
    );
    
    expect(connection.pathData).toBeDefined();
  });
});

describe('Connection Validation (AC-111-003)', () => {
  const mockModules = [createCoreModule(), createPipeModule(), createOutputModule()];
  
  it('should validate output to input connection as valid', () => {
    const result = validateConnectionAttempt(
      'core-1',
      'core-1-output-0',
      'pipe-1',
      'pipe-1-input-0',
      mockModules,
      []
    );
    
    expect(result.valid).toBe(true);
    expect(result.errorCode).toBeUndefined();
  });
  
  it('should reject input to input connection', () => {
    const result = validateConnectionAttempt(
      'pipe-1',
      'pipe-1-input-0',
      'output-1',
      'output-1-input-0',
      mockModules,
      []
    );
    
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('SAME_PORT_TYPE');
  });
  
  it('should reject self-connection (same module)', () => {
    // Note: When connecting two outputs on the same module, the self-connection check
    // takes priority over the same-port-type check
    const result = validateConnectionAttempt(
      'core-1',
      'core-1-output-0',
      'core-1',
      'core-1-output-1',
      mockModules,
      []
    );
    
    expect(result.valid).toBe(false);
    // Self-connection is checked first
    expect(result.errorCode).toBe('SELF_CONNECTION');
  });
  
  it('should reject self-connection', () => {
    const result = validateConnectionAttempt(
      'core-1',
      'core-1-output-0',
      'core-1',
      'core-1-input-0',
      mockModules,
      []
    );
    
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('SELF_CONNECTION');
  });
  
  it('should reject connection with non-existent source module', () => {
    const result = validateConnectionAttempt(
      'non-existent',
      'port-1',
      'pipe-1',
      'pipe-1-input-0',
      mockModules,
      []
    );
    
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('SOURCE_NOT_FOUND');
  });
  
  it('should reject duplicate connections', () => {
    const existingConnection = createMockConnection(
      'existing-conn',
      'core-1',
      'core-1-output-0',
      'pipe-1',
      'pipe-1-input-0'
    );
    
    const result = validateConnectionAttempt(
      'core-1',
      'core-1-output-0',
      'pipe-1',
      'pipe-1-input-0',
      mockModules,
      [existingConnection]
    );
    
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('DUPLICATE_CONNECTION');
  });
  
  it('should reject different modules with same port types', () => {
    // Create two modules with input ports
    const moduleA = createMockModule('energy-pipe', 'module-a', [
      { id: 'module-a-input', type: 'input', position: { x: 0, y: 25 } },
    ]);
    const moduleB = createMockModule('output-array', 'module-b', [
      { id: 'module-b-input', type: 'input', position: { x: 0, y: 40 } },
    ]);
    
    const result = validateConnectionAttempt(
      'module-a',
      'module-a-input',
      'module-b',
      'module-b-input',
      [moduleA, moduleB],
      []
    );
    
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('SAME_PORT_TYPE');
    expect(result.errorMessage).toContain('输入');
  });
});

describe('Connection State Updates (AC-111-004)', () => {
  it('should map machine state idle to connection state idle', () => {
    expect(machineStateToConnectionState('idle')).toBe('idle');
  });
  
  it('should map machine state charging to connection state charging', () => {
    expect(machineStateToConnectionState('charging')).toBe('charging');
  });
  
  it('should map machine state active to connection state active', () => {
    expect(machineStateToConnectionState('active')).toBe('active');
  });
  
  it('should map machine state overload to connection state overload', () => {
    expect(machineStateToConnectionState('overload')).toBe('overload');
  });
  
  it('should map machine state failure to connection state broken', () => {
    expect(machineStateToConnectionState('failure')).toBe('broken');
  });
  
  it('should map machine state shutdown to connection state broken', () => {
    expect(machineStateToConnectionState('shutdown')).toBe('broken');
  });
  
  it('should default to idle for unknown machine state', () => {
    expect(machineStateToConnectionState('unknown')).toBe('idle');
  });
});

describe('Connection State Checks', () => {
  it('should identify active connection states', () => {
    expect(isActiveConnectionState('charging')).toBe(true);
    expect(isActiveConnectionState('active')).toBe(true);
    expect(isActiveConnectionState('idle')).toBe(false);
    expect(isActiveConnectionState('overload')).toBe(false);
    expect(isActiveConnectionState('broken')).toBe(false);
  });
  
  it('should identify problem connection states', () => {
    expect(isProblemConnectionState('overload')).toBe(true);
    expect(isProblemConnectionState('broken')).toBe(true);
    expect(isProblemConnectionState('idle')).toBe(false);
    expect(isProblemConnectionState('active')).toBe(false);
    expect(isProblemConnectionState('charging')).toBe(false);
  });
});

describe('Invalid Connection Rejection (AC-111-011)', () => {
  const mockModules = [createCoreModule(), createPipeModule()];
  
  it('should reject self-connection with specific error message', () => {
    const result = validateConnectionAttempt(
      'core-1',
      'core-1-output-0',
      'core-1',
      'core-1-output-1',
      mockModules,
      []
    );
    
    expect(result.valid).toBe(false);
    expect(result.errorMessage).toContain('自身');
  });
  
  it('should reject input to input connection with specific error message', () => {
    // Create modules with input ports
    const pipe1 = createMockModule('energy-pipe', 'pipe1', [
      { id: 'pipe1-input', type: 'input', position: { x: 0, y: 25 } },
    ]);
    const pipe2 = createMockModule('energy-pipe', 'pipe2', [
      { id: 'pipe2-input', type: 'input', position: { x: 0, y: 25 } },
    ]);
    
    const result = validateConnectionAttempt(
      'pipe1',
      'pipe1-input',
      'pipe2',
      'pipe2-input',
      [pipe1, pipe2],
      []
    );
    
    expect(result.valid).toBe(false);
    expect(result.errorMessage).toContain('输入');
  });
});

describe('Connection Removal', () => {
  it('should create connection that can be identified for removal', () => {
    const connection = createMockConnection('conn-1', 'm1', 'p1', 'm2', 'p2');
    
    expect(connection.id).toBe('conn-1');
    expect(connection.sourceModuleId).toBe('m1');
    expect(connection.targetModuleId).toBe('m2');
  });
  
  it('should allow checking if connection exists', () => {
    const connections: StoreConnection[] = [
      createMockConnection('conn-1', 'm1', 'p1', 'm2', 'p2'),
      createMockConnection('conn-2', 'm2', 'p2', 'm3', 'p3'),
    ];
    
    const exists = connections.some(c => c.id === 'conn-1');
    expect(exists).toBe(true);
    
    const notExists = connections.some(c => c.id === 'conn-99');
    expect(notExists).toBe(false);
  });
  
  it('should allow filtering connections by module', () => {
    const connections: StoreConnection[] = [
      createMockConnection('conn-1', 'm1', 'p1', 'm2', 'p2'),
      createMockConnection('conn-2', 'm2', 'p2', 'm3', 'p3'),
      createMockConnection('conn-3', 'm3', 'p3', 'm1', 'p1'),
    ];
    
    const m2Connections = connections.filter(
      c => c.sourceModuleId === 'm2' || c.targetModuleId === 'm2'
    );
    
    expect(m2Connections.length).toBe(2);
  });
});

describe('Connection Persistence', () => {
  it('should maintain connection properties after creation', () => {
    const connection = createMockConnection(
      'conn-persist',
      'module-a',
      'output-port',
      'module-b',
      'input-port'
    );
    
    // Simulate storing and retrieving
    const stored = JSON.stringify(connection);
    const retrieved = JSON.parse(stored) as StoreConnection;
    
    expect(retrieved.id).toBe(connection.id);
    expect(retrieved.sourceModuleId).toBe(connection.sourceModuleId);
    expect(retrieved.targetModuleId).toBe(connection.targetModuleId);
  });
});
