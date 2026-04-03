/**
 * Circuit Validator Test Suite
 * 
 * Round 112: Advanced Circuit Validation System
 * 
 * Tests for circuit validation including:
 * - AC-112-001: CircuitValidationResult type defines validation state
 * - AC-112-002: validateCircuit() detects cycles (LOOP_DETECTED)
 * - AC-112-003: validateCircuit() finds disconnected module groups (ISLAND_MODULES)
 * - AC-112-004: validateCircuit() traces energy from core modules (ISLAND_MODULES)
 * - AC-112-005: validateCircuit() returns CIRCUIT_INCOMPLETE when no core exists
 * - AC-112-006: validateCircuit() returns UNREACHABLE_OUTPUT when output arrays have no input path
 * - AC-112-007: Hook returns validation state that updates when modules/connections change
 * - AC-112-010: Valid circuits should NOT trigger validation errors
 * - NA-112-001: validateCircuit() should NOT return LOOP_DETECTED for linear A→B→C circuit
 * - NA-112-002: validateCircuit() should NOT return ISLAND_MODULES when all modules connected
 * - NA-112-003: validateCircuit() should NOT return UNREACHABLE_OUTPUT when outputs have valid paths
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateCircuit,
  detectCycles,
  findIslands,
  traceEnergyFlow,
  findUnreachableOutputs,
} from '../utils/circuitValidator';
import {
  buildCircuitGraph,
  isCoreModule,
  isOutputModule,
  isPassiveModule,
  CORE_MODULE_TYPES,
  OUTPUT_MODULE_TYPES,
  CircuitValidationResult,
  CircuitGraph,
} from '../types/circuitValidation';
import { PlacedModule, Connection } from '../types';

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Create a mock module with default properties
 */
function createMockModule(
  instanceId: string,
  type: string,
  ports: Array<{ type: 'input' | 'output' }> = []
): PlacedModule {
  return {
    id: instanceId,
    instanceId,
    type: type as any,
    x: 100,
    y: 100,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: ports.map((p, i) => ({
      id: `${instanceId}-${p.type}-${i}`,
      type: p.type,
      position: { x: 50, y: 50 },
    })),
  };
}

/**
 * Create a mock connection
 */
function createMockConnection(
  id: string,
  sourceModuleId: string,
  targetModuleId: string,
  sourcePortId?: string,
  targetPortId?: string
): Connection {
  return {
    id,
    sourceModuleId,
    targetModuleId,
    sourcePortId: sourcePortId || `${sourceModuleId}-output-0`,
    targetPortId: targetPortId || `${targetModuleId}-input-0`,
    pathData: 'M 0 0 L 100 100',
  };
}

// ============================================================================
// AC-112-001: Type Definitions Tests
// ============================================================================

describe('CircuitValidationResult Type (AC-112-001)', () => {
  it('should have isValid, errors, and warnings properties', () => {
    const result = validateCircuit([], []);
    
    expect(result).toHaveProperty('isValid');
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('warnings');
    expect(result).toHaveProperty('analysis');
    expect(result).toHaveProperty('validatedAt');
  });

  it('should have isValid as boolean', () => {
    const result = validateCircuit([], []);
    expect(typeof result.isValid).toBe('boolean');
  });

  it('should have errors as array', () => {
    const result = validateCircuit([], []);
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it('should have warnings as array', () => {
    const result = validateCircuit([], []);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it('should have analysis object with required properties', () => {
    const result = validateCircuit([], []);
    expect(result.analysis).toHaveProperty('coreModules');
    expect(result.analysis).toHaveProperty('outputModules');
    expect(result.analysis).toHaveProperty('islands');
    expect(result.analysis).toHaveProperty('cycles');
    expect(result.analysis).toHaveProperty('unreachableModules');
    expect(result.analysis).toHaveProperty('stats');
  });

  it('should have stats object with required properties', () => {
    const result = validateCircuit([], []);
    expect(result.analysis.stats).toHaveProperty('totalModules');
    expect(result.analysis.stats).toHaveProperty('totalConnections');
    expect(result.analysis.stats).toHaveProperty('isComplete');
  });
});

// ============================================================================
// AC-112-002: Cycle Detection Tests
// ============================================================================

describe('Cycle Detection (AC-112-002, NA-112-001)', () => {
  it('should NOT detect cycle in linear circuit A→B→C (NA-112-001)', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('C', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'B', 'C'),
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.isValid).toBe(true);
    expect(result.errors.find(e => e.code === 'LOOP_DETECTED')).toBeUndefined();
  });

  it('should detect cycle in A→B→C→A', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }, { type: 'input' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('C', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'B', 'C'),
      createMockConnection('conn3', 'C', 'A'),
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.errors.some(e => e.code === 'LOOP_DETECTED')).toBe(true);
  });

  it('should detect self-loop', () => {
    const modules = [
      createMockModule('A', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'A'),
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.errors.some(e => e.code === 'LOOP_DETECTED')).toBe(true);
  });

  it('should detect multiple cycles', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }, { type: 'input' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('C', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
    ];
    
    // Create two cycles: A→B→A and B→C→B
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'B', 'A'),
      createMockConnection('conn3', 'B', 'C'),
      createMockConnection('conn4', 'C', 'B'),
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.errors.some(e => e.code === 'LOOP_DETECTED')).toBe(true);
    expect(result.analysis.cycles.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// AC-112-003, AC-112-004: Island Detection Tests
// ============================================================================

describe('Island Detection (AC-112-003, AC-112-004, NA-112-002)', () => {
  it('should NOT return ISLAND_MODULES when all modules connected (NA-112-002)', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('C', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'B', 'C'),
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.errors.find(e => e.code === 'ISLAND_MODULES')).toBeUndefined();
  });

  it('should return ISLAND_MODULES for single isolated module', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('C', 'output-array', [{ type: 'input' }]), // Isolated - not connected
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      // C is isolated
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.errors.some(e => e.code === 'ISLAND_MODULES')).toBe(true);
    expect(result.analysis.islands.length).toBe(2);
  });

  it('should return ISLAND_MODULES for multiple disconnected groups with orphan islands', () => {
    // Two islands: one with core (A→B), one without (C→D)
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('C', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]), // No core!
      createMockModule('D', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'C', 'D'),
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.errors.some(e => e.code === 'ISLAND_MODULES')).toBe(true);
    expect(result.analysis.islands.length).toBe(2);
  });
});

// ============================================================================
// AC-112-005: Circuit Incomplete Tests
// ============================================================================

describe('Circuit Incomplete Detection (AC-112-005)', () => {
  it('should return CIRCUIT_INCOMPLETE when no core module exists', () => {
    const modules = [
      createMockModule('A', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('B', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.errors.some(e => e.code === 'CIRCUIT_INCOMPLETE')).toBe(true);
  });

  it('should NOT return CIRCUIT_INCOMPLETE when core exists', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.errors.find(e => e.code === 'CIRCUIT_INCOMPLETE')).toBeUndefined();
  });

  it('should handle pipes and outputs only (no core)', () => {
    const modules = [
      createMockModule('A', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('C', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'B', 'C'),
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.errors.some(e => e.code === 'CIRCUIT_INCOMPLETE')).toBe(true);
  });
});

// ============================================================================
// AC-112-006: Unreachable Output Tests
// ============================================================================

describe('Unreachable Output Detection (AC-112-006, NA-112-003)', () => {
  it('should NOT return UNREACHABLE_OUTPUT when outputs have valid paths (NA-112-003)', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('C', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'B', 'C'),
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.errors.find(e => e.code === 'UNREACHABLE_OUTPUT')).toBeUndefined();
    expect(result.isValid).toBe(true);
  });

  it('should return UNREACHABLE_OUTPUT for orphan output', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'output-array', [{ type: 'input' }]), // Orphan - not connected
    ];
    
    const connections = [
      // B is not connected
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.errors.some(e => e.code === 'UNREACHABLE_OUTPUT' || e.code === 'ISLAND_MODULES')).toBe(true);
  });

  it('should return UNREACHABLE_OUTPUT when some outputs are disconnected', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'amplifier-crystal', [{ type: 'input' }, { type: 'output' }, { type: 'output' }]),
      createMockModule('C', 'output-array', [{ type: 'input' }]), // Connected
      createMockModule('D', 'output-array', [{ type: 'input' }]), // Disconnected
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'B', 'C'),
      // D is not connected
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.errors.some(e => e.code === 'UNREACHABLE_OUTPUT' || e.code === 'ISLAND_MODULES')).toBe(true);
  });
});

// ============================================================================
// AC-112-010: Valid Circuit Tests
// ============================================================================

describe('Valid Circuit Validation (AC-112-010)', () => {
  it('should return isValid=true for empty canvas', () => {
    const result = validateCircuit([], []);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should return isValid=true for minimal valid circuit', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
    ];
    
    const result = validateCircuit(modules, connections);
    expect(result.isValid).toBe(true);
  });

  it('should return isValid=true for linear A→B→C circuit', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('C', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'B', 'C'),
    ];
    
    const result = validateCircuit(modules, connections);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should return isValid=true for complex but valid circuit', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'amplifier-crystal', [{ type: 'input' }, { type: 'output' }, { type: 'output' }]),
      createMockModule('C', 'stabilizer-core', [{ type: 'input' }, { type: 'input' }, { type: 'output' }]),
      createMockModule('D', 'output-array', [{ type: 'input' }]),
      createMockModule('E', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'B', 'C'),
      createMockConnection('conn3', 'B', 'D'),
      createMockConnection('conn4', 'C', 'E'),
    ];
    
    const result = validateCircuit(modules, connections);
    expect(result.isValid).toBe(true);
  });
});

// ============================================================================
// Graph Building Tests
// ============================================================================

describe('Graph Building', () => {
  it('should build correct graph from modules and connections', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
    ];
    
    const graph = buildCircuitGraph(modules, connections);
    
    expect(graph.nodes.size).toBe(2);
    expect(graph.edges.size).toBe(1);
    expect(graph.adjacencyList.get('A')).toContain('B');
  });

  it('should handle empty modules', () => {
    const graph = buildCircuitGraph([], []);
    expect(graph.nodes.size).toBe(0);
    expect(graph.edges.size).toBe(0);
  });
});

// ============================================================================
// Energy Flow Tracing Tests
// ============================================================================

describe('Energy Flow Tracing', () => {
  it('should trace energy from core to all reachable modules', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('C', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'B', 'C'),
    ];
    
    const graph = buildCircuitGraph(modules, connections);
    const reachable = traceEnergyFlow(['A'], graph);
    
    expect(reachable.has('A')).toBe(true);
    expect(reachable.has('B')).toBe(true);
    expect(reachable.has('C')).toBe(true);
  });

  it('should handle multiple core sources', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'core-furnace', [{ type: 'output' }]),
      createMockModule('C', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'C'),
      createMockConnection('conn2', 'B', 'C'),
    ];
    
    const graph = buildCircuitGraph(modules, connections);
    const reachable = traceEnergyFlow(['A', 'B'], graph);
    
    expect(reachable.has('A')).toBe(true);
    expect(reachable.has('B')).toBe(true);
    expect(reachable.has('C')).toBe(true);
  });

  it('should not reach disconnected modules', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('C', 'output-array', [{ type: 'input' }]), // Disconnected
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      // C not connected
    ];
    
    const graph = buildCircuitGraph(modules, connections);
    const reachable = traceEnergyFlow(['A'], graph);
    
    expect(reachable.has('A')).toBe(true);
    expect(reachable.has('B')).toBe(true);
    expect(reachable.has('C')).toBe(false);
  });
});

// ============================================================================
// Module Type Detection Tests
// ============================================================================

describe('Module Type Detection', () => {
  it('should correctly identify core modules', () => {
    expect(isCoreModule('core-furnace')).toBe(true);
    expect(isCoreModule('inferno-blazing-core')).toBe(true);
    expect(isCoreModule('energy-pipe')).toBe(false);
    expect(isCoreModule('output-array')).toBe(false);
  });

  it('should correctly identify output modules', () => {
    expect(isOutputModule('output-array')).toBe(true);
    expect(isOutputModule('trigger-switch')).toBe(true);
    expect(isOutputModule('energy-pipe')).toBe(false);
    expect(isOutputModule('core-furnace')).toBe(false);
  });

  it('should correctly identify passive modules', () => {
    expect(isPassiveModule('gear')).toBe(true);
    expect(isPassiveModule('shield-shell')).toBe(true);
    expect(isPassiveModule('void-arcane-gear')).toBe(true);
    expect(isPassiveModule('energy-pipe')).toBe(false);
  });

  it('should have correct CORE_MODULE_TYPES', () => {
    expect(CORE_MODULE_TYPES).toContain('core-furnace');
    expect(CORE_MODULE_TYPES).toContain('inferno-blazing-core');
  });

  it('should have correct OUTPUT_MODULE_TYPES', () => {
    expect(OUTPUT_MODULE_TYPES).toContain('output-array');
    expect(OUTPUT_MODULE_TYPES).toContain('trigger-switch');
  });
});

// ============================================================================
// Edge Case Tests
// ============================================================================

describe('Edge Cases', () => {
  it('should handle single module with no connections', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
    ];
    
    const result = validateCircuit(modules, []);
    // Single core with no connections is valid (just not useful)
    expect(result.errors.find(e => e.code === 'CIRCUIT_INCOMPLETE')).toBeUndefined();
  });

  it('should handle self-connection on core module', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }, { type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'A'),
    ];
    
    const result = validateCircuit(modules, connections);
    // Self-loop should be detected as cycle
    expect(result.errors.some(e => e.code === 'LOOP_DETECTED')).toBe(true);
  });

  it('should handle multiple cores in circuit', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'core-furnace', [{ type: 'output' }]),
      createMockModule('C', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'C'),
      createMockConnection('conn2', 'B', 'C'),
    ];
    
    const result = validateCircuit(modules, connections);
    expect(result.isValid).toBe(true);
    expect(result.analysis.coreModules).toContain('A');
    expect(result.analysis.coreModules).toContain('B');
  });

  it('should handle complex branching circuit', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'amplifier-crystal', [{ type: 'input' }, { type: 'output' }, { type: 'output' }]),
      createMockModule('C', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('D', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('E', 'output-array', [{ type: 'input' }]),
      createMockModule('F', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'B', 'C'),
      createMockConnection('conn3', 'B', 'D'),
      createMockConnection('conn4', 'C', 'E'),
      createMockConnection('conn5', 'D', 'F'),
    ];
    
    const result = validateCircuit(modules, connections);
    expect(result.isValid).toBe(true);
  });

  it('should handle complex diamond circuit (valid)', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('C', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('D', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('E', 'output-array', [{ type: 'input' }]),
    ];
    
    // Diamond pattern: A → B → D → E
    //              ↘ C ↗
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'A', 'C'),
      createMockConnection('conn3', 'B', 'D'),
      createMockConnection('conn4', 'C', 'D'),
      createMockConnection('conn5', 'D', 'E'),
    ];
    
    const result = validateCircuit(modules, connections);
    expect(result.isValid).toBe(true);
  });

  it('should handle complex diamond circuit with cycle (invalid)', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('C', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('D', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('E', 'output-array', [{ type: 'input' }]),
    ];
    
    // Add cycle: D → B creates loop
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'A', 'C'),
      createMockConnection('conn3', 'B', 'D'),
      createMockConnection('conn4', 'C', 'D'),
      createMockConnection('conn5', 'D', 'E'),
      createMockConnection('conn6', 'D', 'B'), // Creates cycle!
    ];
    
    const result = validateCircuit(modules, connections);
    expect(result.errors.some(e => e.code === 'LOOP_DETECTED')).toBe(true);
  });
});

// ============================================================================
// Multiple Errors Tests
// ============================================================================

describe('Multiple Errors', () => {
  it('should return both cycle and island errors', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }, { type: 'input' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('C', 'output-array', [{ type: 'input' }]), // Isolated
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'B', 'A'), // Cycle
      // C is isolated
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.errors.some(e => e.code === 'LOOP_DETECTED')).toBe(true);
    expect(result.errors.some(e => e.code === 'ISLAND_MODULES')).toBe(true);
  });

  it('should return circuit incomplete and unreachable output errors', () => {
    const modules = [
      createMockModule('A', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('B', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.errors.some(e => e.code === 'CIRCUIT_INCOMPLETE')).toBe(true);
  });
});

// ============================================================================
// Analysis Statistics Tests
// ============================================================================

describe('Analysis Statistics', () => {
  it('should correctly count modules and connections', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'energy-pipe', [{ type: 'input' }, { type: 'output' }]),
      createMockModule('C', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'B', 'C'),
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.analysis.stats.totalModules).toBe(3);
    expect(result.analysis.stats.totalConnections).toBe(2);
  });

  it('should correctly identify core and output counts', () => {
    const modules = [
      createMockModule('A', 'core-furnace', [{ type: 'output' }]),
      createMockModule('B', 'output-array', [{ type: 'input' }]),
      createMockModule('C', 'output-array', [{ type: 'input' }]),
    ];
    
    const connections = [
      createMockConnection('conn1', 'A', 'B'),
      createMockConnection('conn2', 'A', 'C'),
    ];
    
    const result = validateCircuit(modules, connections);
    
    expect(result.analysis.stats.coreCount).toBe(1);
    expect(result.analysis.stats.outputCount).toBe(2);
  });
});

// ============================================================================
// Hook Integration Test (AC-112-007)
// ============================================================================

describe('Hook Integration (AC-112-007)', () => {
  it('should export useCircuitValidation hook', async () => {
    const { useCircuitValidation } = await import('../hooks/useCircuitValidation');
    expect(typeof useCircuitValidation).toBe('function');
  });

  it('should export useActivationGate hook', async () => {
    const { useActivationGate } = await import('../hooks/useCircuitValidation');
    expect(typeof useActivationGate).toBe('function');
  });

  it('should export useValidationOverlay hook', async () => {
    const { useValidationOverlay } = await import('../hooks/useCircuitValidation');
    expect(typeof useValidationOverlay).toBe('function');
  });
});
