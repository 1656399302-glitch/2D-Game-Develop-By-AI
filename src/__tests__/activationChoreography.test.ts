/**
 * Activation Choreography Tests
 * 
 * Tests for sequential module activation based on connection topology.
 * Verifies that modules activate in waves, not simultaneously.
 * 
 * Round 109: AC-109-001 Verification
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActivationChoreography } from '../hooks/useActivationChoreography';
import { useMachineStore } from '../store/useMachineStore';
import { calculateActivationChoreography } from '../utils/activationChoreographer';
import { PlacedModule, Connection } from '../types';

// Helper to create a mock module
const createModule = (id: string, type: string = 'core-furnace'): PlacedModule => ({
  id,
  instanceId: id,
  type: type as any,
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports: [
    { id: `${id}-in`, type: 'input', position: { x: 25, y: 50 } },
    { id: `${id}-out`, type: 'output', position: { x: 75, y: 50 } },
  ],
});

// Helper to create a connection
const createConnection = (id: string, sourceId: string, targetId: string): Connection => ({
  id,
  sourceModuleId: sourceId,
  sourcePortId: `${sourceId}-out`,
  targetModuleId: targetId,
  targetPortId: `${targetId}-in`,
  pathData: 'M 0 0 L 100 100',
});

describe('calculateActivationChoreography', () => {
  test('Empty modules returns empty steps', () => {
    const result = calculateActivationChoreography([], []);
    expect(result.steps).toHaveLength(0);
    expect(result.totalDuration).toBe(0);
  });

  test('Single module without input activates at T=0', () => {
    const modules = [createModule('mod1')];
    const result = calculateActivationChoreography(modules, []);
    
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].activationTime).toBe(0);
    expect(result.steps[0].depth).toBe(0);
  });

  test('BFS order: Input → A → B activates in correct order', () => {
    const input = createModule('input', 'trigger-switch');
    const moduleA = createModule('A');
    const moduleB = createModule('B');
    
    const modules = [input, moduleA, moduleB];
    const connections = [
      createConnection('conn1', 'input', 'A'),
      createConnection('conn2', 'A', 'B'),
    ];
    
    const result = calculateActivationChoreography(modules, connections);
    
    // Input at depth 0, A at depth 1, B at depth 2
    const inputStep = result.steps.find(s => s.moduleId === 'input');
    const aStep = result.steps.find(s => s.moduleId === 'A');
    const bStep = result.steps.find(s => s.moduleId === 'B');
    
    expect(inputStep?.depth).toBe(0);
    expect(inputStep?.activationTime).toBe(0);
    
    expect(aStep?.depth).toBe(1);
    expect(aStep?.activationTime).toBe(67); // 1 * 67ms
    
    expect(bStep?.depth).toBe(2);
    expect(bStep?.activationTime).toBe(134); // 2 * 67ms
    
    // Input's connection to A should light up 100ms before A
    expect(aStep?.connectionsToLight).toContainEqual(
      expect.objectContaining({ connectionId: 'conn1', activationTime: 34 }) // FIX (Round 85): 67 - 33
    );
  });

  test('Parallel paths: Input → A and Input → B at same depth', () => {
    const input = createModule('input', 'trigger-switch');
    const moduleA = createModule('A');
    const moduleB = createModule('B');
    
    const modules = [input, moduleA, moduleB];
    const connections = [
      createConnection('conn1', 'input', 'A'),
      createConnection('conn2', 'input', 'B'),
    ];
    
    const result = calculateActivationChoreography(modules, connections);
    
    const aStep = result.steps.find(s => s.moduleId === 'A');
    const bStep = result.steps.find(s => s.moduleId === 'B');
    
    // Both at depth 1
    expect(aStep?.depth).toBe(1);
    expect(bStep?.depth).toBe(1);
    
    // Both activate at same time (within 50ms tolerance)
    expect(Math.abs(aStep!.activationTime - bStep!.activationTime)).toBeLessThanOrEqual(50);
  });

  test('Merging paths with input module: A → C and B → C', () => {
    const input = createModule('input', 'trigger-switch');
    const moduleA = createModule('A');
    const moduleB = createModule('B');
    const moduleC = createModule('C');
    
    const modules = [input, moduleA, moduleB, moduleC];
    const connections = [
      createConnection('c1', 'input', 'A'),
      createConnection('c2', 'input', 'B'),
      createConnection('c3', 'A', 'C'),
      createConnection('c4', 'B', 'C'),
    ];
    
    const result = calculateActivationChoreography(modules, connections);
    
    const aStep = result.steps.find(s => s.moduleId === 'A');
    const bStep = result.steps.find(s => s.moduleId === 'B');
    const cStep = result.steps.find(s => s.moduleId === 'C');
    
    // A and B at depth 1
    expect(aStep?.depth).toBe(1);
    expect(bStep?.depth).toBe(1);
    
    // C at depth 2 (max of A's depth + 1 and B's depth + 1)
    expect(cStep?.depth).toBe(2);
  });

  test('No input modules: all modules activate at T=0', () => {
    const modules = [createModule('A'), createModule('B'), createModule('C')];
    
    const result = calculateActivationChoreography(modules, []);
    
    // All at depth 0
    result.steps.forEach(step => {
      expect(step.depth).toBe(0);
      expect(step.activationTime).toBe(0);
    });
  });

  test('Connection lead time is 33ms before module activation', () => {
    const input = createModule('input', 'trigger-switch');
    const moduleA = createModule('A');
    
    const modules = [input, moduleA];
    const connections = [createConnection('conn1', 'input', 'A')];
    
    const result = calculateActivationChoreography(modules, connections);
    
    const aStep = result.steps.find(s => s.moduleId === 'A');
    const connLightUp = aStep?.connectionsToLight.find(c => c.connectionId === 'conn1');
    
    // A activates at 67ms, connection should light at 34ms
    expect(connLightUp?.activationTime).toBe(34);
    expect(aStep?.activationTime - connLightUp!.activationTime).toBe(33); // FIX (Round 85): lead time
  });

  test('Multiple depth levels with correct timing (67ms intervals)', () => {
    const input = createModule('input', 'trigger-switch');
    const level1 = createModule('L1');
    const level2a = createModule('L2a');
    const level2b = createModule('L2b');
    const level3 = createModule('L3');
    
    const modules = [input, level1, level2a, level2b, level3];
    const connections = [
      createConnection('c1', 'input', 'L1'),
      createConnection('c2', 'L1', 'L2a'),
      createConnection('c3', 'L1', 'L2b'),
      createConnection('c4', 'L2a', 'L3'),
      createConnection('c5', 'L2b', 'L3'),
    ];
    
    const result = calculateActivationChoreography(modules, connections);
    
    const inputStep = result.steps.find(s => s.moduleId === 'input');
    const l1Step = result.steps.find(s => s.moduleId === 'L1');
    const l2aStep = result.steps.find(s => s.moduleId === 'L2a');
    const l2bStep = result.steps.find(s => s.moduleId === 'L2b');
    const l3Step = result.steps.find(s => s.moduleId === 'L3');
    
    expect(inputStep?.activationTime).toBe(0);
    expect(l1Step?.activationTime).toBe(67);
    // L2a and L2b at same depth
    expect(Math.abs(l2aStep!.activationTime - l2bStep!.activationTime)).toBeLessThanOrEqual(50);
    expect(l3Step?.activationTime).toBeGreaterThan(l2aStep!.activationTime);
  });

  test('Disconnected modules get maxDepth + 1', () => {
    const input = createModule('input', 'trigger-switch');
    const connected = createModule('connected');
    const disconnected = createModule('disconnected');
    
    const modules = [input, connected, disconnected];
    const connections = [createConnection('c1', 'input', 'connected')];
    
    const result = calculateActivationChoreography(modules, connections);
    
    const inputStep = result.steps.find(s => s.moduleId === 'input');
    const connectedStep = result.steps.find(s => s.moduleId === 'connected');
    const disconnectedStep = result.steps.find(s => s.moduleId === 'disconnected');
    
    expect(inputStep?.depth).toBe(0);
    expect(connectedStep?.depth).toBe(1);
    expect(disconnectedStep?.depth).toBeGreaterThan(1);
  });
});

describe('useActivationChoreography Hook', () => {
  beforeEach(() => {
    // Reset store state
    useMachineStore.setState({
      modules: [],
      connections: [],
      machineState: 'idle',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Returns empty sequence when no modules', () => {
    const { result } = renderHook(() => useActivationChoreography());
    
    expect(result.current.activationSequence.waves).toHaveLength(0);
    expect(result.current.totalModules).toBe(0);
  });

  test('Calculates correct wave count for chain topology', () => {
    const modules = [
      createModule('input', 'trigger-switch'),
      createModule('A'),
      createModule('B'),
      createModule('C'),
    ];
    
    const connections = [
      createConnection('c1', 'input', 'A'),
      createConnection('c2', 'A', 'B'),
      createConnection('c3', 'B', 'C'),
    ];
    
    useMachineStore.setState({ modules, connections });
    
    const { result } = renderHook(() => useActivationChoreography());
    
    // 4 depths: input (0), A (1), B (2), C (3)
    expect(result.current.activationSequence.waves).toHaveLength(4);
    expect(result.current.totalWaves).toBe(4);
  });

  test('Calculates correct wave count for parallel topology', () => {
    const modules = [
      createModule('input', 'trigger-switch'),
      createModule('A'),
      createModule('B'),
      createModule('C'),
    ];
    
    const connections = [
      createConnection('c1', 'input', 'A'),
      createConnection('c2', 'input', 'B'),
      createConnection('c3', 'A', 'C'),
      createConnection('c4', 'B', 'C'),
    ];
    
    useMachineStore.setState({ modules, connections });
    
    const { result } = renderHook(() => useActivationChoreography());
    
    // 3 depths: input (0), A+B (1), C (2)
    expect(result.current.activationSequence.waves).toHaveLength(3);
    expect(result.current.totalWaves).toBe(3);
  });

  test('isModuleActive returns correct state', () => {
    const modules = [
      createModule('input', 'trigger-switch'),
      createModule('A'),
    ];
    
    const connections = [createConnection('c1', 'input', 'A')];
    
    useMachineStore.setState({ modules, connections, machineState: 'charging' });
    
    const { result } = renderHook(() => useActivationChoreography());
    
    // Initially no modules active
    expect(result.current.isModuleActive('input')).toBe(false);
    expect(result.current.isModuleActive('A')).toBe(false);
  });

  test('Wave activation times are distinct', () => {
    const modules = [
      createModule('input', 'trigger-switch'),
      createModule('A'),
      createModule('B'),
      createModule('C'),
    ];
    
    const connections = [
      createConnection('c1', 'input', 'A'),
      createConnection('c2', 'A', 'B'),
      createConnection('c3', 'B', 'C'),
    ];
    
    useMachineStore.setState({ modules, connections });
    
    const { result } = renderHook(() => useActivationChoreography());
    
    const activationTimes = result.current.activationSequence.waves.map(w => w.activationTime);
    
    // All activation times should be distinct
    const uniqueTimes = [...new Set(activationTimes)];
    expect(uniqueTimes.length).toBe(activationTimes.length);
  });

  test('First wave activates at T=0', () => {
    const modules = [
      createModule('input', 'trigger-switch'),
      createModule('A'),
    ];
    
    const connections = [createConnection('c1', 'input', 'A')];
    
    useMachineStore.setState({ modules, connections });
    
    const { result } = renderHook(() => useActivationChoreography());
    
    const firstWave = result.current.activationSequence.waves[0];
    expect(firstWave.activationTime).toBe(0);
  });

  test('All modules in same wave have same activation time', () => {
    const modules = [
      createModule('input', 'trigger-switch'),
      createModule('A'),
      createModule('B'),
    ];
    
    const connections = [
      createConnection('c1', 'input', 'A'),
      createConnection('c2', 'input', 'B'),
    ];
    
    useMachineStore.setState({ modules, connections });
    
    const { result } = renderHook(() => useActivationChoreography());
    
    // Find the wave containing A and B (should be wave at depth 1)
    const wave1 = result.current.activationSequence.waves.find(w => 
      w.modules.includes('A') && w.modules.includes('B')
    );
    
    expect(wave1).toBeDefined();
    // Both should have same activation time
    expect(result.current.activationSequence.steps.find(s => s.moduleId === 'A')?.activationTime)
      .toBe(result.current.activationSequence.steps.find(s => s.moduleId === 'B')?.activationTime);
  });
});

describe('AC-109-001: Sequential Activation Verification', () => {
  test('Modules reach active state at different times (not simultaneous)', () => {
    // Create a machine with 5 modules in a chain
    const modules = [
      createModule('input', 'trigger-switch'),
      createModule('core1', 'core-furnace'),
      createModule('rune1', 'rune-node'),
      createModule('pipe1', 'energy-pipe'),
      createModule('output1', 'output-array'),
    ];
    
    const connections = [
      createConnection('c1', 'input', 'core1'),
      createConnection('c2', 'core1', 'rune1'),
      createConnection('c3', 'rune1', 'pipe1'),
      createConnection('c4', 'pipe1', 'output1'),
    ];
    
    const result = calculateActivationChoreography(modules, connections);
    
    // Get all activation times
    const activationTimes = result.steps.map(s => s.activationTime);
    
    // All activation times should NOT be the same (at least 3 distinct times)
    const uniqueTimes = [...new Set(activationTimes)];
    expect(uniqueTimes.length).toBeGreaterThanOrEqual(3);
    
    // Verify modules activate at different times
    // Depth 0 (input): 0ms
    // Depth 1 (core1): 67ms
    // Depth 2 (rune1): 134ms
    // Depth 3 (pipe1): 201ms
    // Depth 4 (output1): 268ms
    
    const inputTime = result.steps.find(s => s.moduleId === 'input')?.activationTime;
    const coreTime = result.steps.find(s => s.moduleId === 'core1')?.activationTime;
    const runeTime = result.steps.find(s => s.moduleId === 'rune1')?.activationTime;
    const pipeTime = result.steps.find(s => s.moduleId === 'pipe1')?.activationTime;
    const outputTime = result.steps.find(s => s.moduleId === 'output1')?.activationTime;
    
    expect(inputTime).toBe(0);
    expect(coreTime).toBe(67);
    expect(runeTime).toBe(134);
    expect(pipeTime).toBe(201);
    expect(outputTime).toBe(268);
  });

  test('NEGATIVE: Simultaneous activation would fail this test', () => {
    // This test verifies that modules DO NOT all activate at the same time
    // If they did, this test would fail
    
    const modules = [
      createModule('A'),
      createModule('B'),
      createModule('C'),
      createModule('D'),
      createModule('E'),
    ];
    
    const result = calculateActivationChoreography(modules, []);
    
    // When there's no input module, all modules activate at T=0
    // This is an edge case - in a real machine with connections,
    // modules should NOT activate simultaneously
    
    const allAtZero = result.steps.every(s => s.activationTime === 0);
    expect(allAtZero).toBe(true); // This is expected for disconnected modules
    
    // But with connections, they should be staggered
    const connectedModules = [
      createModule('input', 'trigger-switch'),
      createModule('A'),
      createModule('B'),
    ];
    
    const connectedResult = calculateActivationChoreography(
      connectedModules,
      [createConnection('c1', 'input', 'A'), createConnection('c2', 'A', 'B')]
    );
    
    const connectedAllAtZero = connectedResult.steps.every(s => s.activationTime === 0);
    expect(connectedAllAtZero).toBe(false); // With connections, they should NOT all be at zero
  });
});
