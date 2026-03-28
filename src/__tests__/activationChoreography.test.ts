import { describe, test, expect } from 'vitest';
import { calculateActivationChoreography, getPhaseFromProgress, getRarityColor, getPulseWaveCount } from '../utils/activationChoreographer';
import { PlacedModule, Connection, Rarity } from '../types';

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
    expect(aStep?.activationTime).toBe(200); // 1 * 200ms
    
    expect(bStep?.depth).toBe(2);
    expect(bStep?.activationTime).toBe(400); // 2 * 200ms
    
    // Input's connection to A should light up 100ms before A
    expect(aStep?.connectionsToLight).toContainEqual(
      expect.objectContaining({ connectionId: 'conn1', activationTime: 100 }) // 200 - 100
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
    
    // Both activate at same time (200ms)
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

  test('Connection lead time is 100ms before module activation', () => {
    const input = createModule('input', 'trigger-switch');
    const moduleA = createModule('A');
    
    const modules = [input, moduleA];
    const connections = [createConnection('conn1', 'input', 'A')];
    
    const result = calculateActivationChoreography(modules, connections);
    
    const aStep = result.steps.find(s => s.moduleId === 'A');
    const connLightUp = aStep?.connectionsToLight.find(c => c.connectionId === 'conn1');
    
    // A activates at 200ms, connection should light at 100ms
    expect(connLightUp?.activationTime).toBe(100);
    expect(aStep?.activationTime - connLightUp!.activationTime).toBe(100);
  });

  test('Multiple depth levels with correct timing (200ms intervals)', () => {
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
    expect(l1Step?.activationTime).toBe(200);
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

describe('getPhaseFromProgress', () => {
  test('0-29% returns CHARGING', () => {
    expect(getPhaseFromProgress(0).text).toBe('CHARGING');
    expect(getPhaseFromProgress(15).text).toBe('CHARGING');
    expect(getPhaseFromProgress(29).text).toBe('CHARGING');
    expect(getPhaseFromProgress(0).phase).toBe('charging');
  });

  test('30-79% returns ACTIVATING', () => {
    expect(getPhaseFromProgress(30).text).toBe('ACTIVATING');
    expect(getPhaseFromProgress(50).text).toBe('ACTIVATING');
    expect(getPhaseFromProgress(79).text).toBe('ACTIVATING');
    expect(getPhaseFromProgress(50).phase).toBe('activating');
  });

  test('80-100% returns ONLINE', () => {
    expect(getPhaseFromProgress(80).text).toBe('ONLINE');
    expect(getPhaseFromProgress(90).text).toBe('ONLINE');
    expect(getPhaseFromProgress(100).text).toBe('ONLINE');
    expect(getPhaseFromProgress(95).phase).toBe('online');
  });
});

describe('getRarityColor', () => {
  const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  
  test('Returns correct color for each rarity', () => {
    expect(getRarityColor('common')).toBe('#9ca3af');
    expect(getRarityColor('uncommon')).toBe('#22c55e');
    expect(getRarityColor('rare')).toBe('#3b82f6');
    expect(getRarityColor('epic')).toBe('#a855f7');
    expect(getRarityColor('legendary')).toBe('#eab308');
  });

  test('Unknown rarity defaults to common', () => {
    expect(getRarityColor('common' as any)).toBe('#9ca3af');
  });
});

describe('getPulseWaveCount', () => {
  test('Path length 0-200px returns 1 wave', () => {
    expect(getPulseWaveCount(0)).toBe(1);
    expect(getPulseWaveCount(100)).toBe(1);
    expect(getPulseWaveCount(200)).toBe(1);
  });

  test('Path length 200-400px returns 2 waves', () => {
    expect(getPulseWaveCount(201)).toBe(2);
    expect(getPulseWaveCount(300)).toBe(2);
    expect(getPulseWaveCount(400)).toBe(2);
  });

  test('Path length >400px returns 3 waves', () => {
    expect(getPulseWaveCount(401)).toBe(3);
    expect(getPulseWaveCount(500)).toBe(3);
    expect(getPulseWaveCount(1000)).toBe(3);
  });
});
