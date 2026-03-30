/**
 * Statistics Utilities
 * 
 * Calculation functions for machine statistics analysis.
 * Used by the Machine Statistics Dashboard to compute metrics.
 */

import { PlacedModule, Connection, ModuleType } from '../types';
import { FactionId, MODULE_TO_FACTION } from '../types/factions';

// ============================================================================
// Types
// ============================================================================

export interface EnergyFlowResult {
  connectionId: string;
  sourceModuleId: string;
  targetModuleId: string;
  throughput: number; // 0-100 throughput value
  isActive: boolean;
  loadStatus: 'low' | 'normal' | 'high' | 'overloaded';
}

export interface ComplexityFactors {
  moduleCount: number;
  connectionCount: number;
  avgConnectionsPerModule: number;
  moduleTypeDiversity: number;
  factionDiversity: number;
  hasCore: boolean;
  hasOutput: boolean;
  hasMultiPortModules: boolean;
  maxDepth: number;
  hasCycles: boolean;
}

export interface MachineStatistics {
  moduleCount: number;
  connectionCount: number;
  faction: FactionId | null;
  factionName: string;
  stability: number;
  power: number;
  complexityScore: number;
  complexityFactors: ComplexityFactors;
  theoreticalPower: number;
  machineHealth: number;
  energyFlows: EnergyFlowResult[];
  performancePrediction: number; // 0-100 estimated activation success
}

// ============================================================================
// Module Properties
// ============================================================================

const MULTI_PORT_MODULES: ModuleType[] = [
  'amplifier-crystal',
  'stabilizer-core',
  'void-siphon',
  'phase-modulator',
  'stellar-harmonic-crystal',
];

const CORE_MODULES: ModuleType[] = ['core-furnace', 'inferno-blazing-core'];
const OUTPUT_MODULES: ModuleType[] = ['output-array'];
const INPUT_MODULES: ModuleType[] = ['trigger-switch'];

// ============================================================================
// Core Calculation Functions
// ============================================================================

/**
 * Calculate overall machine statistics
 */
export function calculateMachineStatistics(
  modules: PlacedModule[],
  connections: Connection[]
): MachineStatistics {
  const complexityFactors = calculateComplexityFactors(modules, connections);
  const energyFlows = analyzeEnergyFlow(modules, connections);
  const faction = calculateDominantFaction(modules);
  const stats = calculateStatsFromModules(modules, connections);
  
  return {
    moduleCount: modules.length,
    connectionCount: connections.length,
    faction,
    factionName: faction ? formatFactionName(faction) : 'None',
    stability: stats.stability,
    power: stats.power,
    complexityScore: calculateComplexityScore(modules, connections),
    complexityFactors,
    theoreticalPower: calculateTheoreticalPower(modules),
    machineHealth: getMachineHealth(modules, connections),
    energyFlows,
    performancePrediction: calculatePerformancePrediction(modules, connections, stats.stability),
  };
}

/**
 * Calculate complexity score (0-100) for a machine
 */
export function calculateComplexityScore(
  modules: PlacedModule[],
  connections: Connection[]
): number {
  if (modules.length === 0) return 0;
  
  const factors = calculateComplexityFactors(modules, connections);
  
  // Weight different factors
  let score = 0;
  
  // Module count factor (0-25)
  score += Math.min(25, modules.length * 3);
  
  // Connection factor (0-25)
  const avgConnections = modules.length > 0 ? connections.length / modules.length : 0;
  score += Math.min(25, avgConnections * 15);
  
  // Module type diversity (0-15)
  const uniqueTypes = new Set(modules.map(m => m.type)).size;
  score += Math.min(15, uniqueTypes * 3);
  
  // Faction diversity (0-10)
  const uniqueFactions = new Set(
    modules.map(m => MODULE_TO_FACTION[m.type]).filter(Boolean)
  ).size;
  score += Math.min(10, uniqueFactions * 5);
  
  // Structure completeness (0-15)
  if (factors.hasCore) score += 5;
  if (factors.hasOutput) score += 5;
  if (factors.maxDepth > 2) score += 5;
  
  // Multi-port module bonus (0-10)
  if (factors.hasMultiPortModules) score += 10;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate detailed complexity factors
 */
export function calculateComplexityFactors(
  modules: PlacedModule[],
  connections: Connection[]
): ComplexityFactors {
  if (modules.length === 0) {
    return {
      moduleCount: 0,
      connectionCount: 0,
      avgConnectionsPerModule: 0,
      moduleTypeDiversity: 0,
      factionDiversity: 0,
      hasCore: false,
      hasOutput: false,
      hasMultiPortModules: false,
      maxDepth: 0,
      hasCycles: false,
    };
  }
  
  const moduleCount = modules.length;
  const connectionCount = connections.length;
  const avgConnectionsPerModule = moduleCount > 0 ? connectionCount / moduleCount : 0;
  
  // Module type diversity
  const uniqueTypes = new Set(modules.map(m => m.type)).size;
  const maxPossibleTypes = 18; // Total module types available
  const moduleTypeDiversity = (uniqueTypes / maxPossibleTypes) * 100;
  
  // Faction diversity
  const factions = modules.map(m => MODULE_TO_FACTION[m.type]).filter(Boolean);
  const uniqueFactions = new Set(factions).size;
  const factionDiversity = (uniqueFactions / 4) * 100; // 4 total factions
  
  // Has essential modules
  const moduleTypes = new Set(modules.map(m => m.type));
  const hasCore = CORE_MODULES.some(t => moduleTypes.has(t));
  const hasOutput = OUTPUT_MODULES.some(t => moduleTypes.has(t));
  const hasMultiPortModules = modules.some(m => MULTI_PORT_MODULES.includes(m.type));
  
  // Graph analysis
  const { maxDepth, hasCycles } = analyzeGraphStructure(modules, connections);
  
  return {
    moduleCount,
    connectionCount,
    avgConnectionsPerModule,
    moduleTypeDiversity,
    factionDiversity,
    hasCore,
    hasOutput,
    hasMultiPortModules,
    maxDepth,
    hasCycles,
  };
}

/**
 * Analyze energy flow through connections
 */
export function analyzeEnergyFlow(
  modules: PlacedModule[],
  connections: Connection[]
): EnergyFlowResult[] {
  if (connections.length === 0) return [];
  
  // Build module map for quick lookup
  const moduleMap = new Map(modules.map(m => [m.instanceId, m]));
  
  // Calculate base throughput per module
  const moduleThroughput = new Map<string, number>();
  modules.forEach(m => {
    // Base throughput depends on module type
    let baseThroughput = 50;
    if (CORE_MODULES.includes(m.type)) baseThroughput = 100;
    if (OUTPUT_MODULES.includes(m.type)) baseThroughput = 80;
    if (MULTI_PORT_MODULES.includes(m.type)) baseThroughput = 70;
    if (INPUT_MODULES.includes(m.type)) baseThroughput = 60;
    moduleThroughput.set(m.instanceId, baseThroughput);
  });
  
  // Calculate throughput for each connection
  return connections.map(conn => {
    const sourceThroughput = moduleThroughput.get(conn.sourceModuleId) || 50;
    const targetThroughput = moduleThroughput.get(conn.targetModuleId) || 50;
    
    // Throughput is the minimum of source and target throughputs
    const throughput = Math.min(sourceThroughput, targetThroughput);
    
    // Determine load status
    let loadStatus: EnergyFlowResult['loadStatus'];
    if (throughput < 40) loadStatus = 'low';
    else if (throughput < 70) loadStatus = 'normal';
    else if (throughput < 90) loadStatus = 'high';
    else loadStatus = 'overloaded';
    
    // Check if both modules exist (connection is valid)
    const isActive = moduleMap.has(conn.sourceModuleId) && moduleMap.has(conn.targetModuleId);
    
    return {
      connectionId: conn.id,
      sourceModuleId: conn.sourceModuleId,
      targetModuleId: conn.targetModuleId,
      throughput,
      isActive,
      loadStatus,
    };
  });
}

/**
 * Get modules with the most connections (bottlenecks)
 */
export function getBottleneckModules(
  modules: PlacedModule[],
  connections: Connection[]
): string[] {
  if (modules.length === 0) return [];
  
  // Count connections per module
  const connectionCounts = new Map<string, number>();
  modules.forEach(m => connectionCounts.set(m.instanceId, 0));
  
  connections.forEach(conn => {
    connectionCounts.set(
      conn.sourceModuleId,
      (connectionCounts.get(conn.sourceModuleId) || 0) + 1
    );
    connectionCounts.set(
      conn.targetModuleId,
      (connectionCounts.get(conn.targetModuleId) || 0) + 1
    );
  });
  
  // Find max connection count
  const maxCount = Math.max(...connectionCounts.values());
  if (maxCount === 0) return [];
  
  // Return modules with max connections
  return modules
    .filter(m => connectionCounts.get(m.instanceId) === maxCount)
    .map(m => m.instanceId);
}

/**
 * Calculate theoretical power output
 */
export function calculateTheoreticalPower(modules: PlacedModule[]): number {
  if (modules.length === 0) return 0;
  
  let power = 0;
  
  modules.forEach(m => {
    // Base power from module type
    let basePower = 10;
    if (CORE_MODULES.includes(m.type)) basePower = 30;
    if (OUTPUT_MODULES.includes(m.type)) basePower = 25;
    if (MULTI_PORT_MODULES.includes(m.type)) basePower = 20;
    
    // Scale with module scale property
    power += basePower * m.scale;
  });
  
  return Math.round(power);
}

/**
 * Calculate machine health score (0-100)
 */
export function getMachineHealth(
  modules: PlacedModule[],
  connections: Connection[]
): number {
  if (modules.length === 0) return 0;
  
  let health = 100;
  
  // Penalize for missing core
  const hasCore = modules.some(m => CORE_MODULES.includes(m.type));
  if (!hasCore) health -= 30;
  
  // Penalize for missing output
  const hasOutput = modules.some(m => OUTPUT_MODULES.includes(m.type));
  if (!hasOutput) health -= 20;
  
  // Penalize for disconnected modules
  const connectedModules = new Set<string>();
  connections.forEach(c => {
    connectedModules.add(c.sourceModuleId);
    connectedModules.add(c.targetModuleId);
  });
  const disconnectedCount = modules.length - connectedModules.size;
  if (disconnectedCount > 0) {
    health -= disconnectedCount * 10;
  }
  
  // Penalize for unbalanced load (cycles detection)
  const hasCycles = analyzeGraphStructure(modules, connections).hasCycles;
  if (hasCycles) health -= 10;
  
  return Math.max(0, Math.min(100, health));
}

/**
 * Calculate stats from modules and connections (stability, power)
 */
function calculateStatsFromModules(
  modules: PlacedModule[],
  connections: Connection[]
): { stability: number; power: number } {
  if (modules.length === 0) {
    return { stability: 50, power: 0 };
  }
  
  let stability = 50;
  let power = 10;
  
  modules.forEach(m => {
    // Stability modifiers based on module type
    if (CORE_MODULES.includes(m.type)) {
      stability += 10;
      power += 20;
    }
    if (OUTPUT_MODULES.includes(m.type)) {
      stability += 5;
      power += 15;
    }
    if (INPUT_MODULES.includes(m.type)) {
      stability -= 5;
      power += 10;
    }
    if (MULTI_PORT_MODULES.includes(m.type)) {
      stability += 3;
      power += 8;
    }
  });
  
  // Connection bonuses
  stability += Math.floor(connections.length * 0.5);
  power += connections.length * 2;
  
  return {
    stability: Math.max(0, Math.min(100, stability)),
    power: Math.max(0, Math.min(100, power)),
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate dominant faction based on module composition
 */
function calculateDominantFaction(modules: PlacedModule[]): FactionId | null {
  if (modules.length === 0) return null;
  
  const factionCounts: Record<FactionId, number> = {
    void: 0,
    inferno: 0,
    storm: 0,
    stellar: 0,
  };
  
  modules.forEach(m => {
    const faction = MODULE_TO_FACTION[m.type];
    if (faction) {
      factionCounts[faction]++;
    }
  });
  
  let maxCount = 0;
  let dominantFaction: FactionId | null = null;
  
  (Object.keys(factionCounts) as FactionId[]).forEach(faction => {
    if (factionCounts[faction] > maxCount) {
      maxCount = factionCounts[faction];
      dominantFaction = faction;
    }
  });
  
  return dominantFaction;
}

/**
 * Format faction ID to display name
 */
function formatFactionName(faction: FactionId): string {
  const names: Record<FactionId, string> = {
    void: 'Void',
    inferno: 'Inferno',
    storm: 'Storm',
    stellar: 'Stellar',
  };
  return names[faction] || 'Unknown';
}

/**
 * Analyze graph structure (depth and cycles)
 */
function analyzeGraphStructure(
  modules: PlacedModule[],
  connections: Connection[]
): { maxDepth: number; hasCycles: boolean } {
  if (modules.length === 0 || connections.length === 0) {
    return { maxDepth: 0, hasCycles: false };
  }
  
  // Build adjacency list
  const adjacency = new Map<string, string[]>();
  modules.forEach(m => adjacency.set(m.instanceId, []));
  
  connections.forEach(c => {
    const neighbors = adjacency.get(c.sourceModuleId);
    if (neighbors) neighbors.push(c.targetModuleId);
  });
  
  // DFS to find max depth and detect cycles
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  let hasCycles = false;
  let maxDepth = 0;
  
  function dfs(nodeId: string, depth: number): void {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    maxDepth = Math.max(maxDepth, depth);
    
    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, depth + 1);
      } else if (recursionStack.has(neighbor)) {
        hasCycles = true;
      }
    }
    
    recursionStack.delete(nodeId);
  }
  
  // Start DFS from each unvisited node
  modules.forEach(m => {
    if (!visited.has(m.instanceId)) {
      dfs(m.instanceId, 1);
    }
  });
  
  return { maxDepth, hasCycles };
}

/**
 * Calculate performance prediction (0-100 estimated activation success)
 */
function calculatePerformancePrediction(
  modules: PlacedModule[],
  connections: Connection[],
  stability: number
): number {
  if (modules.length === 0) return 0;
  
  let prediction = 50; // Base prediction
  
  // Stability factor (0-40)
  prediction += stability * 0.4;
  
  // Has essential components (0-30)
  const hasCore = modules.some(m => CORE_MODULES.includes(m.type));
  const hasOutput = modules.some(m => OUTPUT_MODULES.includes(m.type));
  if (hasCore) prediction += 15;
  if (hasOutput) prediction += 15;
  
  // Has proper connections (0-20)
  const avgConnections = modules.length > 0 ? connections.length / modules.length : 0;
  if (avgConnections >= 0.5) prediction += 10;
  if (avgConnections >= 1.0) prediction += 10;
  
  // Penalty for too many or too few connections
  if (connections.length > modules.length * 2) prediction -= 15;
  if (connections.length < modules.length * 0.3) prediction -= 10;
  
  return Math.max(0, Math.min(100, Math.round(prediction)));
}
