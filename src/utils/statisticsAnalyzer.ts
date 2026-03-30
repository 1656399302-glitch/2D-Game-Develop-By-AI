/**
 * Statistics Analyzer Utilities
 * 
 * Provides analysis functions for machine data across the Codex.
 * Used by the enhanced Statistics Dashboard for comparison and trend analysis.
 */

import { CodexEntry, PlacedModule, Connection, Rarity, ModuleType } from '../types';
import { FactionId, FACTIONS, MODULE_TO_FACTION } from '../types/factions';
import { calculateMachineStatistics } from './statisticsUtils';

// ============================================================================
// Types
// ============================================================================

export interface MachinePerformanceScore {
  machineId: string;
  score: number;
  stability: number;
  power: number;
  energyCost: number;
}

export interface ModuleCompositionData {
  moduleType: ModuleType;
  count: number;
  percentage: number;
}

export interface RarityDistributionData {
  rarity: Rarity;
  count: number;
  percentage: number;
}

export interface FactionPopularityData {
  faction: FactionId;
  count: number;
  percentage: number;
}

export interface TrendDataPoint {
  timestamp: number;
  machinesCreated: number;
  activations: number;
  averageStability: number;
}

export interface ConnectionPatternData {
  avgConnectionsPerMachine: number;
  avgModulesPerMachine: number;
  connectionDensity: number;
}

export interface ComparisonResult {
  machineA: MachinePerformanceScore;
  machineB: MachinePerformanceScore;
  differences: {
    stabilityDiff: number;
    powerDiff: number;
    energyCostDiff: number;
    scoreDiff: number;
  };
}

// ============================================================================
// Machine Performance Scoring (AC6)
// ============================================================================

/**
 * Calculate performance score for a machine.
 * Formula: score = (stability * power) / (energyCost + 1)
 * Score rounded to 2 decimal places.
 */
export function calculatePerformanceScore(
  stability: number,
  power: number,
  energyCost: number
): number {
  const score = (stability * power) / (energyCost + 1);
  return Math.round(score * 100) / 100;
}

/**
 * Calculate performance score for all modules in a machine.
 */
export function calculateMachinePerformanceScore(
  modules: PlacedModule[],
  connections: Connection[]
): MachinePerformanceScore {
  const stats = calculateMachineStatistics(modules, connections);
  
  // Calculate energy cost based on module count and connections
  const energyCost = Math.max(1, modules.length + connections.length * 0.5);
  
  const score = calculatePerformanceScore(
    stats.stability,
    stats.power,
    energyCost
  );
  
  return {
    machineId: modules[0]?.instanceId || 'unknown',
    score,
    stability: stats.stability,
    power: stats.power,
    energyCost,
  };
}

// ============================================================================
// Module Composition Analysis (AC3)
// ============================================================================

/**
 * Analyze module composition across all machines.
 * Returns count of each module type used.
 */
export function analyzeModuleComposition(
  entries: CodexEntry[]
): ModuleCompositionData[] {
  const moduleCounts = new Map<ModuleType, number>();
  
  entries.forEach(entry => {
    entry.modules.forEach(module => {
      const count = moduleCounts.get(module.type) || 0;
      moduleCounts.set(module.type, count + 1);
    });
  });
  
  const totalModules = Array.from(moduleCounts.values()).reduce((sum, c) => sum + c, 0);
  
  const result: ModuleCompositionData[] = [];
  moduleCounts.forEach((count, moduleType) => {
    result.push({
      moduleType,
      count,
      percentage: totalModules > 0 ? Math.round((count / totalModules) * 10000) / 100 : 0,
    });
  });
  
  // Sort by count descending
  result.sort((a, b) => b.count - a.count);
  
  return result;
}

// ============================================================================
// Rarity Distribution Analysis (AC4)
// ============================================================================

/**
 * Analyze rarity distribution across all machines.
 */
export function analyzeRarityDistribution(
  entries: CodexEntry[]
): RarityDistributionData[] {
  const rarityCounts = new Map<Rarity, number>();
  
  entries.forEach(entry => {
    const count = rarityCounts.get(entry.rarity) || 0;
    rarityCounts.set(entry.rarity, count + 1);
  });
  
  const totalMachines = entries.length;
  const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  
  return rarities.map(rarity => ({
    rarity,
    count: rarityCounts.get(rarity) || 0,
    percentage: totalMachines > 0 ? Math.round(((rarityCounts.get(rarity) || 0) / totalMachines) * 10000) / 100 : 0,
  }));
}

// ============================================================================
// Faction Popularity Analysis (P1)
// ============================================================================

/**
 * Analyze faction popularity across all machines.
 */
export function analyzeFactionPopularity(
  entries: CodexEntry[]
): FactionPopularityData[] {
  const factionCounts = new Map<FactionId, number>();
  
  entries.forEach(entry => {
    // Use the dominant faction from attributes or calculate from modules
    const faction = entry.attributes?.tags?.length 
      ? getFactionFromAttributes(entry.attributes)
      : calculateDominantFaction(entry.modules);
    
    if (faction) {
      const count = factionCounts.get(faction) || 0;
      factionCounts.set(faction, count + 1);
    }
  });
  
  const totalMachines = entries.filter(e => e.attributes?.tags?.length).length || entries.length;
  
  const result: FactionPopularityData[] = [];
  (Object.keys(FACTIONS) as FactionId[]).forEach(factionId => {
    const count = factionCounts.get(factionId) || 0;
    result.push({
      faction: factionId,
      count,
      percentage: totalMachines > 0 ? Math.round((count / totalMachines) * 10000) / 100 : 0,
    });
  });
  
  // Sort by count descending
  result.sort((a, b) => b.count - a.count);
  
  return result;
}

/**
 * Get faction from machine attributes tags.
 */
function getFactionFromAttributes(attributes: CodexEntry['attributes']): FactionId | null {
  if (!attributes?.tags?.length) return null;
  
  const tagToFaction: Record<string, FactionId> = {
    void: 'void',
    arcane: 'void',
    inferno: 'inferno',
    fire: 'inferno',
    explosive: 'inferno',
    storm: 'storm',
    lightning: 'storm',
    stellar: 'stellar',
    resonance: 'stellar',
    amplifying: 'stellar',
  };
  
  for (const tag of attributes.tags) {
    const faction = tagToFaction[tag];
    if (faction) return faction;
  }
  
  return null;
}

/**
 * Calculate dominant faction from modules.
 */
function calculateDominantFaction(modules: PlacedModule[]): FactionId | null {
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

// ============================================================================
// Trend Analysis (AC2)
// ============================================================================

/**
 * Generate trend data from codex entries over time.
 */
export function generateTrendData(
  entries: CodexEntry[],
  totalActivations: number = 0
): TrendDataPoint[] {
  // If no entries, return single point with current stats
  if (entries.length === 0) {
    return [{
      timestamp: Date.now(),
      machinesCreated: 0,
      activations: totalActivations,
      averageStability: 0,
    }];
  }
  
  // Sort entries by creation time
  const sortedEntries = [...entries].sort((a, b) => a.createdAt - b.createdAt);
  
  const trendData: TrendDataPoint[] = [];
  let cumulativeMachines = 0;
  let cumulativeActivations = 0;
  
  // Group by day
  const entriesByDay = new Map<string, CodexEntry[]>();
  sortedEntries.forEach(entry => {
    const date = new Date(entry.createdAt).toDateString();
    const dayEntries = entriesByDay.get(date) || [];
    dayEntries.push(entry);
    entriesByDay.set(date, dayEntries);
  });
  
  entriesByDay.forEach((dayEntries) => {
    cumulativeMachines += dayEntries.length;
    
    // Calculate average stability for this day
    let totalStability = 0;
    dayEntries.forEach(entry => {
      const stats = calculateMachineStatistics(entry.modules, entry.connections);
      totalStability += stats.stability;
    });
    const avgStability = dayEntries.length > 0 ? totalStability / dayEntries.length : 0;
    
    trendData.push({
      timestamp: dayEntries[0].createdAt,
      machinesCreated: cumulativeMachines,
      activations: cumulativeActivations,
      averageStability: Math.round(avgStability * 100) / 100,
    });
  });
  
  return trendData;
}

// ============================================================================
// Connection Pattern Analysis (P1)
// ============================================================================

/**
 * Analyze connection patterns across all machines.
 */
export function analyzeConnectionPatterns(
  entries: CodexEntry[]
): ConnectionPatternData {
  if (entries.length === 0) {
    return {
      avgConnectionsPerMachine: 0,
      avgModulesPerMachine: 0,
      connectionDensity: 0,
    };
  }
  
  let totalConnections = 0;
  let totalModules = 0;
  
  entries.forEach(entry => {
    totalConnections += entry.connections.length;
    totalModules += entry.modules.length;
  });
  
  const avgConnectionsPerMachine = totalConnections / entries.length;
  const avgModulesPerMachine = totalModules / entries.length;
  
  // Connection density: connections / (modules * (modules - 1) / 2)
  // This represents how connected the typical machine is
  const connectionDensity = avgModulesPerMachine > 1 
    ? avgConnectionsPerMachine / (avgModulesPerMachine * (avgModulesPerMachine - 1) / 2)
    : 0;
  
  return {
    avgConnectionsPerMachine: Math.round(avgConnectionsPerMachine * 100) / 100,
    avgModulesPerMachine: Math.round(avgModulesPerMachine * 100) / 100,
    connectionDensity: Math.round(connectionDensity * 10000) / 100,
  };
}

// ============================================================================
// Machine Comparison (AC1)
// ============================================================================

/**
 * Compare two machines and return detailed comparison result.
 */
export function compareMachines(
  entryA: CodexEntry,
  entryB: CodexEntry
): ComparisonResult {
  const scoreA = calculateMachinePerformanceScore(entryA.modules, entryA.connections);
  const scoreB = calculateMachinePerformanceScore(entryB.modules, entryB.connections);
  
  return {
    machineA: scoreA,
    machineB: scoreB,
    differences: {
      stabilityDiff: Math.round((scoreA.stability - scoreB.stability) * 100) / 100,
      powerDiff: Math.round((scoreA.power - scoreB.power) * 100) / 100,
      energyCostDiff: Math.round((scoreA.energyCost - scoreB.energyCost) * 100) / 100,
      scoreDiff: Math.round((scoreA.score - scoreB.score) * 100) / 100,
    },
  };
}

/**
 * Get all performance scores for sorting.
 */
export function getAllPerformanceScores(
  entries: CodexEntry[]
): MachinePerformanceScore[] {
  return entries.map(entry => {
    return calculateMachinePerformanceScore(entry.modules, entry.connections);
  });
}

// ============================================================================
// Statistics Export (AC5)
// ============================================================================

export interface ExportedStatistics {
  exportDate: string;
  machinesCreated: number;
  activations: number;
  averageStability: number;
  totalMachinesByFaction: Record<FactionId, number>;
  totalMachinesByRarity: Record<Rarity, number>;
  moduleUsageCounts: Record<ModuleType, number>;
  performanceScores: MachinePerformanceScore[];
}

export interface StatisticsExport {
  machinesCreated: number;
  activations: number;
  averageStability: number;
  totalMachinesByFaction: Record<FactionId, number>;
  totalMachinesByRarity: Record<Rarity, number>;
  moduleUsageCounts: Record<string, number>;
  performanceScores: Array<{
    machineId: string;
    score: number;
    stability: number;
    power: number;
    energyCost: number;
  }>;
}

/**
 * Generate export data for statistics.
 */
export function generateStatisticsExport(
  entries: CodexEntry[],
  userStats: {
    machinesCreated: number;
    activations: number;
    factionCounts: Record<FactionId, number>;
  }
): StatisticsExport {
  const moduleComposition = analyzeModuleComposition(entries);
  const rarityDistribution = analyzeRarityDistribution(entries);
  const performanceScores = getAllPerformanceScores(entries);
  
  // Calculate average stability
  let totalStability = 0;
  entries.forEach(entry => {
    const stats = calculateMachineStatistics(entry.modules, entry.connections);
    totalStability += stats.stability;
  });
  const averageStability = entries.length > 0 ? totalStability / entries.length : 0;
  
  // Build rarity counts
  const totalMachinesByRarity: Record<Rarity, number> = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };
  rarityDistribution.forEach(r => {
    totalMachinesByRarity[r.rarity] = r.count;
  });
  
  // Build module usage counts
  const moduleUsageCounts: Record<string, number> = {};
  moduleComposition.forEach(m => {
    moduleUsageCounts[m.moduleType] = m.count;
  });
  
  return {
    machinesCreated: userStats.machinesCreated,
    activations: userStats.activations,
    averageStability: Math.round(averageStability * 100) / 100,
    totalMachinesByFaction: userStats.factionCounts,
    totalMachinesByRarity,
    moduleUsageCounts,
    performanceScores: performanceScores.map(ps => ({
      machineId: ps.machineId,
      score: ps.score,
      stability: ps.stability,
      power: ps.power,
      energyCost: ps.energyCost,
    })),
  };
}

/**
 * Validate exported statistics JSON structure.
 */
export function validateExportedStatistics(data: unknown): data is StatisticsExport {
  if (typeof data !== 'object' || data === null) return false;
  
  const obj = data as Record<string, unknown>;
  
  // Check required fields
  if (typeof obj.machinesCreated !== 'number') return false;
  if (typeof obj.activations !== 'number') return false;
  if (typeof obj.averageStability !== 'number') return false;
  if (typeof obj.totalMachinesByFaction !== 'object') return false;
  if (typeof obj.totalMachinesByRarity !== 'object') return false;
  if (typeof obj.moduleUsageCounts !== 'object') return false;
  if (!Array.isArray(obj.performanceScores)) return false;
  
  // Validate performance scores structure
  for (const score of obj.performanceScores) {
    if (typeof score !== 'object' || score === null) return false;
    const s = score as Record<string, unknown>;
    if (typeof s.machineId !== 'string') return false;
    if (typeof s.score !== 'number') return false;
    if (typeof s.stability !== 'number') return false;
    if (typeof s.power !== 'number') return false;
    if (typeof s.energyCost !== 'number') return false;
  }
  
  return true;
}

// ============================================================================
// Rarity Color Helpers
// ============================================================================

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: '普通',
  uncommon: '优秀',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

// ============================================================================
// Module Type Labels
// ============================================================================

export const MODULE_TYPE_LABELS: Record<ModuleType, string> = {
  'core-furnace': '核心炉心',
  'energy-pipe': '能量管道',
  'gear': '齿轮机构',
  'rune-node': '符文节点',
  'shield-shell': '防护外壳',
  'trigger-switch': '触发开关',
  'output-array': '输出法阵',
  'amplifier-crystal': '增幅水晶',
  'stabilizer-core': '稳定核心',
  'void-siphon': '虚空抽取',
  'phase-modulator': '相位调节',
  'resonance-chamber': '共振腔室',
  'fire-crystal': '火焰水晶',
  'lightning-conductor': '引雷导体',
  'void-arcane-gear': '虚空齿轮',
  'inferno-blazing-core': '烈焰核心',
  'storm-thundering-pipe': '雷霆管道',
  'stellar-harmonic-crystal': '星辉水晶',
};
