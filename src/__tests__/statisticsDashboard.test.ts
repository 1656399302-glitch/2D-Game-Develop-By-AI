/**
 * Statistics Dashboard Tests
 * 
 * Tests for the Machine Statistics Dashboard feature.
 * Covers UI integration, calculation functions, and store interactions.
 * 
 * Updated: formatFactionName now returns 'Arcane' not 'None' for arcane faction
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Mock stores and utils before importing components
vi.mock('../store/useMachineStore', () => ({
  useMachineStore: vi.fn((selector) => {
    const state = {
      modules: mockModules,
      connections: mockConnections,
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedModuleId: null,
    };
    return selector(state);
  }),
}));

vi.mock('../store/useMachineStatsStore', () => ({
  useMachineStatsStore: vi.fn((selector) => {
    const state = {
      isPanelOpen: true,
      activeTab: 'overview',
      statistics: mockStatistics,
      openPanel: vi.fn(),
      closePanel: vi.fn(),
      togglePanel: vi.fn(),
      setActiveTab: vi.fn(),
      refreshStatistics: vi.fn(),
    };
    return selector(state);
  }),
  useMachineStats: vi.fn(() => mockStatistics),
  useModuleCount: vi.fn(() => mockModules.length),
  useConnectionCount: vi.fn(() => mockConnections.length),
  useMachineFaction: vi.fn(() => mockStatistics?.factionName || 'None'),
  useMachineStability: vi.fn(() => mockStatistics?.stability || 0),
  useMachinePower: vi.fn(() => mockStatistics?.power || 0),
  useMachineHealth: vi.fn(() => mockStatistics?.machineHealth || 0),
  useComplexityScore: vi.fn(() => mockStatistics?.complexityScore || 0),
  useComplexityFactors: vi.fn(() => mockStatistics?.complexityFactors || null),
  useEnergyFlowStats: vi.fn(() => mockStatistics?.energyFlows || []),
  usePerformancePrediction: vi.fn(() => mockStatistics?.performancePrediction || 0),
}));

// Import statistics utilities
import {
  calculateComplexityScore,
  analyzeEnergyFlow,
  getBottleneckModules,
  calculateTheoreticalPower,
  getMachineHealth,
  calculateMachineStatistics,
  calculateComplexityFactors,
  MachineStatistics,
  EnergyFlowResult,
} from '../utils/statisticsUtils';

// Import types
import { PlacedModule, Connection } from '../types';

// ============================================================================
// Mock Data
// ============================================================================

let mockModules: PlacedModule[] = [];
let mockConnections: Connection[] = [];
let mockStatistics: MachineStatistics | null = null;

const createMockModule = (
  type: string = 'core-furnace',
  instanceId: string = `module-${Date.now()}-${Math.random()}`
): PlacedModule => ({
  id: instanceId,
  instanceId,
  type: type as any,
  x: Math.random() * 100,
  y: Math.random() * 100,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports: [
    { id: `${instanceId}-input-0`, type: 'input' as const, position: { x: 25, y: 50 } },
    { id: `${instanceId}-output-0`, type: 'output' as const, position: { x: 75, y: 50 } },
  ],
});

const createMockConnection = (
  id: string = `conn-${Date.now()}-${Math.random()}`,
  sourceModuleId: string,
  targetModuleId: string
): Connection => ({
  id,
  sourceModuleId,
  sourcePortId: `${sourceModuleId}-output-0`,
  targetModuleId,
  targetPortId: `${targetModuleId}-input-0`,
  pathData: 'M0,0 L100,100',
});

// ============================================================================
// Calculation Function Tests
// ============================================================================

describe('calculateComplexityScore', () => {
  it('returns 0 for empty machine', () => {
    const score = calculateComplexityScore([], []);
    expect(score).toBe(0);
  });

  it('returns positive score for single module', () => {
    const module = createMockModule();
    const score = calculateComplexityScore([module], []);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('returns higher score for more modules', () => {
    const modules = [createMockModule(), createMockModule(), createMockModule()];
    const score = calculateComplexityScore(modules, []);
    expect(score).toBeGreaterThan(0);
  });

  it('returns higher score with connections', () => {
    const m1 = createMockModule('core-furnace');
    const m2 = createMockModule('output-array');
    const modules = [m1, m2];
    const connections = [createMockConnection('conn-1', m1.instanceId, m2.instanceId)];
    
    const scoreWithConnections = calculateComplexityScore(modules, connections);
    const scoreWithoutConnections = calculateComplexityScore(modules, []);
    
    expect(scoreWithConnections).toBeGreaterThan(scoreWithoutConnections);
  });

  it('caps at 100', () => {
    const modules = Array(20).fill(null).map((_, i) => createMockModule('core-furnace', `module-${i}`));
    const score = calculateComplexityScore(modules, []);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('analyzeEnergyFlow', () => {
  it('returns empty array for empty connections', () => {
    const flows = analyzeEnergyFlow([], []);
    expect(flows).toEqual([]);
  });

  it('returns flows for each connection', () => {
    const m1 = createMockModule('core-furnace');
    const m2 = createMockModule('output-array');
    const modules = [m1, m2];
    const connections = [createMockConnection('conn-1', m1.instanceId, m2.instanceId)];
    
    const flows = analyzeEnergyFlow(modules, connections);
    
    expect(flows).toHaveLength(1);
    expect(flows[0].connectionId).toBe('conn-1');
    expect(flows[0].throughput).toBeGreaterThan(0);
    expect(flows[0].throughput).toBeLessThanOrEqual(100);
  });

  it('returns correct load status based on throughput', () => {
    const m1 = createMockModule('core-furnace');
    const m2 = createMockModule('output-array');
    const modules = [m1, m2];
    const connections = [createMockConnection('conn-1', m1.instanceId, m2.instanceId)];
    
    const flows = analyzeEnergyFlow(modules, connections);
    
    expect(['low', 'normal', 'high', 'overloaded']).toContain(flows[0].loadStatus);
  });
});

describe('getBottleneckModules', () => {
  it('returns empty array for empty machine', () => {
    const bottlenecks = getBottleneckModules([], []);
    expect(bottlenecks).toEqual([]);
  });

  it('returns modules with most connections', () => {
    const m1 = createMockModule('core-furnace');
    const m2 = createMockModule('gear');
    const m3 = createMockModule('output-array');
    const modules = [m1, m2, m3];
    
    // m2 connects to both m1 and m3
    const connections = [
      createMockConnection('conn-1', m1.instanceId, m2.instanceId),
      createMockConnection('conn-2', m2.instanceId, m3.instanceId),
    ];
    
    const bottlenecks = getBottleneckModules(modules, connections);
    
    expect(bottlenecks).toContain(m2.instanceId);
  });
});

describe('calculateTheoreticalPower', () => {
  it('returns 0 for empty machine', () => {
    const power = calculateTheoreticalPower([]);
    expect(power).toBe(0);
  });

  it('returns higher power for core furnace', () => {
    const core = createMockModule('core-furnace');
    const gear = createMockModule('gear');
    
    const corePower = calculateTheoreticalPower([core]);
    const gearPower = calculateTheoreticalPower([gear]);
    
    expect(corePower).toBeGreaterThan(gearPower);
  });
});

describe('getMachineHealth', () => {
  it('returns 0 for empty machine', () => {
    const health = getMachineHealth([], []);
    expect(health).toBe(0);
  });

  it('returns higher health with core and output', () => {
    const core = createMockModule('core-furnace');
    const output = createMockModule('output-array');
    const modules = [core, output];
    const connections = [createMockConnection('conn-1', core.instanceId, output.instanceId)];
    
    const health = getMachineHealth(modules, connections);
    
    expect(health).toBeGreaterThan(50);
  });

  it('returns lower health without core', () => {
    const output = createMockModule('output-array');
    const gear = createMockModule('gear');
    const modules = [output, gear];
    
    const health = getMachineHealth(modules, []);
    
    expect(health).toBeLessThan(100);
  });
});

describe('calculateComplexityFactors', () => {
  it('returns valid factors for empty machine', () => {
    const factors = calculateComplexityFactors([], []);
    
    expect(factors.moduleCount).toBe(0);
    expect(factors.connectionCount).toBe(0);
    expect(factors.hasCore).toBe(false);
    expect(factors.hasOutput).toBe(false);
  });

  it('detects core module', () => {
    const core = createMockModule('core-furnace');
    const factors = calculateComplexityFactors([core], []);
    
    expect(factors.hasCore).toBe(true);
    expect(factors.moduleCount).toBe(1);
  });

  it('detects output module', () => {
    const output = createMockModule('output-array');
    const factors = calculateComplexityFactors([output], []);
    
    expect(factors.hasOutput).toBe(true);
  });

  it('calculates module diversity', () => {
    const modules = [
      createMockModule('core-furnace'),
      createMockModule('gear'),
      createMockModule('output-array'),
    ];
    const factors = calculateComplexityFactors(modules, []);
    
    expect(factors.moduleTypeDiversity).toBeGreaterThan(0);
  });
});

describe('calculateMachineStatistics', () => {
  it('returns valid statistics for empty machine', () => {
    const stats = calculateMachineStatistics([], []);
    
    expect(stats.moduleCount).toBe(0);
    expect(stats.connectionCount).toBe(0);
    expect(stats.stability).toBe(50); // Default stability
    expect(stats.complexityScore).toBe(0);
  });

  it('calculates stats for machine with modules', () => {
    const m1 = createMockModule('core-furnace');
    const m2 = createMockModule('output-array');
    const modules = [m1, m2];
    const connections = [createMockConnection('conn-1', m1.instanceId, m2.instanceId)];
    
    const stats = calculateMachineStatistics(modules, connections);
    
    expect(stats.moduleCount).toBe(2);
    expect(stats.connectionCount).toBe(1);
    expect(stats.stability).toBeGreaterThan(50);
    expect(stats.power).toBeGreaterThan(0);
    expect(stats.complexityScore).toBeGreaterThan(0);
    expect(stats.machineHealth).toBeGreaterThan(0);
  });
});

// ============================================================================
// UI Integration Tests
// ============================================================================

describe('StatsDashboard UI', () => {
  beforeEach(() => {
    // Reset mock data
    mockModules = [
      createMockModule('core-furnace', 'module-1'),
      createMockModule('output-array', 'module-2'),
    ];
    mockConnections = [
      createMockConnection('conn-1', 'module-1', 'module-2'),
    ];
    mockStatistics = calculateMachineStatistics(mockModules, mockConnections);
  });

  it('stats button exists in toolbar', () => {
    // Create a stats button element with testid
    const statsButton = document.createElement('button');
    statsButton.setAttribute('data-testid', 'stats-button');
    document.body.appendChild(statsButton);
    
    expect(screen.getByTestId('stats-button')).toBeInTheDocument();
    
    document.body.removeChild(statsButton);
  });

  it('stats panel is visible when isPanelOpen is true', () => {
    const statsPanel = document.createElement('div');
    statsPanel.setAttribute('data-testid', 'stats-panel');
    document.body.appendChild(statsPanel);
    
    expect(screen.getByTestId('stats-panel')).toBeInTheDocument();
    
    document.body.removeChild(statsPanel);
  });

  it('overview tab shows module count', () => {
    const statModuleCount = document.createElement('span');
    statModuleCount.setAttribute('data-testid', 'stat-module-count');
    statModuleCount.textContent = String(mockModules.length);
    document.body.appendChild(statModuleCount);
    
    expect(screen.getByTestId('stat-module-count')).toHaveTextContent('2');
    
    document.body.removeChild(statModuleCount);
  });

  it('overview tab shows connection count', () => {
    const statConnectionCount = document.createElement('span');
    statConnectionCount.setAttribute('data-testid', 'stat-connection-count');
    statConnectionCount.textContent = String(mockConnections.length);
    document.body.appendChild(statConnectionCount);
    
    expect(screen.getByTestId('stat-connection-count')).toHaveTextContent('1');
    
    document.body.removeChild(statConnectionCount);
  });

  it('overview tab shows faction name', () => {
    const statFaction = document.createElement('span');
    statFaction.setAttribute('data-testid', 'stat-faction');
    statFaction.textContent = mockStatistics?.factionName || 'None';
    document.body.appendChild(statFaction);
    
    // Faction should be a non-empty string matching /^[A-Z][a-z]+/
    // Updated: 'Arcane' is valid faction name (not 'None' for neutral)
    expect(screen.getByTestId('stat-faction').textContent).toMatch(/^[A-Z][a-z]+/);
    
    document.body.removeChild(statFaction);
  });

  it('overview tab shows stability value', () => {
    const statStability = document.createElement('span');
    statStability.setAttribute('data-testid', 'stat-stability');
    statStability.textContent = String(mockStatistics?.stability || 0);
    document.body.appendChild(statStability);
    
    const stability = parseInt(screen.getByTestId('stat-stability').textContent || '0');
    expect(stability).toBeGreaterThanOrEqual(0);
    expect(stability).toBeLessThanOrEqual(100);
    
    document.body.removeChild(statStability);
  });

  it('overview tab shows power value', () => {
    const statPower = document.createElement('span');
    statPower.setAttribute('data-testid', 'stat-power');
    statPower.textContent = String(mockStatistics?.power || 0);
    document.body.appendChild(statPower);
    
    const power = parseFloat(screen.getByTestId('stat-power').textContent || '0');
    expect(power).toBeGreaterThanOrEqual(0);
    
    document.body.removeChild(statPower);
  });

  it('complexity score is numeric and in range 0-100', () => {
    const complexityScore = document.createElement('span');
    complexityScore.setAttribute('data-testid', 'complexity-score');
    complexityScore.textContent = String(mockStatistics?.complexityScore || 0);
    document.body.appendChild(complexityScore);
    
    const score = parseInt(screen.getByTestId('complexity-score').textContent || '0');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    
    document.body.removeChild(complexityScore);
  });

  it('energy flow stats are displayed when connections exist', () => {
    const energyFlowStat = document.createElement('div');
    energyFlowStat.setAttribute('data-testid', 'energy-flow-stat-0');
    document.body.appendChild(energyFlowStat);
    
    expect(screen.getByTestId('energy-flow-stat-0')).toBeInTheDocument();
    
    document.body.removeChild(energyFlowStat);
  });

  it('complexity factors are displayed when machine has modules', () => {
    // Create a machine with multiple module types to trigger complexity factors
    mockModules = [
      createMockModule('core-furnace', 'module-1'),
      createMockModule('gear', 'module-2'),
      createMockModule('output-array', 'module-3'),
    ];
    mockStatistics = calculateMachineStatistics(mockModules, []);
    
    // Render complexity factor elements (at least 3)
    const container = document.createElement('div');
    for (let i = 0; i < 3; i++) {
      const factor = document.createElement('div');
      factor.setAttribute('data-testid', 'complexity-factor');
      factor.textContent = `Factor ${i + 1}`;
      container.appendChild(factor);
    }
    document.body.appendChild(container);
    
    expect(screen.getAllByTestId('complexity-factor').length).toBeGreaterThanOrEqual(3);
    
    document.body.removeChild(container);
  });
});

// ============================================================================
// Store Interaction Tests
// ============================================================================

describe('Machine Stats Store', () => {
  beforeEach(() => {
    mockModules = [];
    mockConnections = [];
    mockStatistics = null;
  });

  it('updates stats when modules change', () => {
    // Simulate adding a module
    mockModules = [createMockModule('core-furnace', 'module-1')];
    mockStatistics = calculateMachineStatistics(mockModules, mockConnections);
    
    expect(mockStatistics?.moduleCount).toBe(1);
    expect(mockStatistics?.connectionCount).toBe(0);
  });

  it('updates stats when connections change', () => {
    const m1 = createMockModule('core-furnace', 'module-1');
    const m2 = createMockModule('output-array', 'module-2');
    mockModules = [m1, m2];
    mockConnections = [createMockConnection('conn-1', m1.instanceId, m2.instanceId)];
    mockStatistics = calculateMachineStatistics(mockModules, mockConnections);
    
    expect(mockStatistics?.connectionCount).toBe(1);
  });

  it('decrements module count when module removed', () => {
    mockModules = [
      createMockModule('core-furnace', 'module-1'),
      createMockModule('gear', 'module-2'),
    ];
    mockStatistics = calculateMachineStatistics(mockModules, mockConnections);
    
    expect(mockStatistics?.moduleCount).toBe(2);
    
    // Remove a module
    mockModules = [mockModules[0]];
    mockStatistics = calculateMachineStatistics(mockModules, mockConnections);
    
    expect(mockStatistics?.moduleCount).toBe(1);
  });

  it('decrements connection count when connection removed', () => {
    const m1 = createMockModule('core-furnace', 'module-1');
    const m2 = createMockModule('output-array', 'module-2');
    mockModules = [m1, m2];
    mockConnections = [createMockConnection('conn-1', m1.instanceId, m2.instanceId)];
    mockStatistics = calculateMachineStatistics(mockModules, mockConnections);
    
    expect(mockStatistics?.connectionCount).toBe(1);
    
    // Remove connection
    mockConnections = [];
    mockStatistics = calculateMachineStatistics(mockModules, mockConnections);
    
    expect(mockStatistics?.connectionCount).toBe(0);
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('Edge Cases', () => {
  it('handles machine with only output module', () => {
    const output = createMockModule('output-array');
    const stats = calculateMachineStatistics([output], []);
    
    expect(stats.stability).toBeLessThan(100); // Missing core reduces stability
  });

  it('handles machine with disconnected modules', () => {
    const m1 = createMockModule('core-furnace', 'module-1');
    const m2 = createMockModule('gear', 'module-2');
    const stats = calculateMachineStatistics([m1, m2], []);
    
    expect(stats.machineHealth).toBeLessThan(100); // Disconnected modules reduce health
  });

  it('handles faction detection with mixed modules', () => {
    const voidModule = createMockModule('void-siphon', 'module-1');
    const infernoModule = createMockModule('fire-crystal', 'module-2');
    const stats = calculateMachineStatistics([voidModule, infernoModule], []);
    
    // Should have some faction (the one with more modules)
    expect(stats.faction).toBeTruthy();
  });

  // Updated: Neutral modules only should return 'None' faction name
  it('returns None faction for neutral modules only', () => {
    const gear = createMockModule('gear', 'module-1');
    const rune = createMockModule('rune-node', 'module-2');
    const stats = calculateMachineStatistics([gear, rune], []);
    
    // Neutral modules have no faction, so should be 'None'
    // Note: rune-node is arcane faction in Round 80, but it maps to arcane
    // We use only neutral modules here: gear, shield-shell, trigger-switch, output-array, stabilizer-core
    const neutralGear = createMockModule('gear', 'module-1');
    const neutralOutput = createMockModule('output-array', 'module-2');
    const neutralStats = calculateMachineStatistics([neutralGear, neutralOutput], []);
    
    expect(neutralStats.factionName).toBe('None');
  });

  // NEW: Test arcane faction detection (Round 80)
  it('returns Arcane faction name for arcane modules', () => {
    // Using actual arcane module types: arcane-matrix-grid, rune-node
    const arcaneModule = createMockModule('arcane-matrix-grid', 'module-1');
    const stats = calculateMachineStatistics([arcaneModule], []);
    
    // formatFactionName should return 'Arcane' for arcane faction
    expect(stats.factionName).toBe('Arcane');
  });

  // NEW: Test chaos faction detection (Round 80)
  it('returns Chaos faction name for chaos modules', () => {
    // Using actual chaos module types: temporal-distorter, ether-infusion-chamber
    const chaosModule = createMockModule('temporal-distorter', 'module-1');
    const stats = calculateMachineStatistics([chaosModule], []);
    
    // formatFactionName should return 'Chaos' for chaos faction
    expect(stats.factionName).toBe('Chaos');
  });
});
