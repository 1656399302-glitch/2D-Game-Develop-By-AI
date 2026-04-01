/**
 * Complexity Analyzer Utility
 * 
 * Analyzes machine complexity based on module count, connection density,
 * rare modules, and layout balance. Returns deterministic tier classification.
 * 
 * ROUND 81 PHASE 2: New utility implementation per contract D2.
 * 
 * Tier thresholds (deterministic):
 * - ≤3 modules = 简陋 (Crude)
 * - 4–8 modules = 普通 (Ordinary)
 * - 9–15 modules = 精致 (Exquisite)
 * - 16–30 modules = 复杂 (Complex)
 * - 31+ modules = 史诗 (Epic)
 * 
 * Escalation bonuses (each +1 tier, no cap):
 * - Connection density > 2.5 → +1 tier
 * - ≥3 rare modules → +1 tier (rare = temporal-distorter, ether-infusion-chamber, arcane-matrix-grid)
 * - Balanced symmetric layout → +1 tier (aspect ratio 0.4–2.5 AND ≥4 modules)
 */

import { PlacedModule, Connection } from '../types';
import { MODULE_SIZES } from '../types';

// Complexity tiers
export type ComplexityTier = '简陋' | '普通' | '精致' | '复杂' | '史诗';

// Rare module types that count toward rare module bonus
export const RARE_MODULE_TYPES = [
  'temporal-distorter',
  'ether-infusion-chamber',
  'arcane-matrix-grid',
] as const;

export type RareModuleType = typeof RARE_MODULE_TYPES[number];

// Base tier thresholds
const TIER_THRESHOLDS = {
  简陋: 3,
  普通: 8,
  精致: 15,
  复杂: 30,
  // 31+ = 史诗
} as const;

// Tier order for escalation
const TIER_ORDER: ComplexityTier[] = ['简陋', '普通', '精致', '复杂', '史诗'];

/**
 * Get base tier from module count alone
 */
function getBaseTier(moduleCount: number): ComplexityTier {
  if (moduleCount <= TIER_THRESHOLDS['简陋']) return '简陋';
  if (moduleCount <= TIER_THRESHOLDS['普通']) return '普通';
  if (moduleCount <= TIER_THRESHOLDS['精致']) return '精致';
  if (moduleCount <= TIER_THRESHOLDS['复杂']) return '复杂';
  return '史诗';
}

/**
 * Calculate connection density (connections / modules)
 */
function calculateConnectionDensity(moduleCount: number, connectionCount: number): number {
  if (moduleCount === 0) return 0;
  return connectionCount / moduleCount;
}

/**
 * Count rare modules in the machine
 */
function countRareModules(modules: PlacedModule[]): number {
  return modules.filter(m => RARE_MODULE_TYPES.includes(m.type as RareModuleType)).length;
}

/**
 * Check if layout is balanced/symmetric
 * Layout is balanced if aspect ratio is between 0.4 and 2.5 AND has ≥4 modules
 */
function isLayoutBalanced(modules: PlacedModule[]): boolean {
  if (modules.length < 4) return false;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  modules.forEach((module) => {
    const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
    minX = Math.min(minX, module.x);
    minY = Math.min(minY, module.y);
    maxX = Math.max(maxX, module.x + size.width);
    maxY = Math.max(maxY, module.y + size.height);
  });

  const width = maxX - minX;
  const height = maxY - minY;

  // Avoid division by zero
  if (width === 0 || height === 0) return false;

  const aspectRatio = Math.min(width, height) / Math.max(width, height);
  
  return aspectRatio >= 0.4 && aspectRatio <= 2.5;
}

/**
 * Get the index of a tier in the tier order array
 */
function getTierIndex(tier: ComplexityTier): number {
  return TIER_ORDER.indexOf(tier);
}

/**
 * Main complexity analysis function
 * 
 * @param modules - Array of placed modules
 * @param connections - Array of connections
 * @returns The final complexity tier
 */
export function analyzeComplexity(
  modules: PlacedModule[],
  connections: Connection[]
): ComplexityTier {
  // Start with base tier from module count
  let tier = getBaseTier(modules.length);

  // Calculate bonuses
  let bonusCount = 0;

  // Bonus 1: Connection density > 2.5
  const density = calculateConnectionDensity(modules.length, connections.length);
  if (density > 2.5) {
    bonusCount++;
  }

  // Bonus 2: ≥3 rare modules
  const rareCount = countRareModules(modules);
  if (rareCount >= 3) {
    bonusCount++;
  }

  // Bonus 3: Balanced symmetric layout
  if (isLayoutBalanced(modules)) {
    bonusCount++;
  }

  // Apply bonuses (each +1 tier, no cap)
  const currentIndex = getTierIndex(tier);
  const newIndex = Math.min(currentIndex + bonusCount, TIER_ORDER.length - 1);
  
  return TIER_ORDER[newIndex];
}

/**
 * Get complexity tier details for display
 */
export interface ComplexityDetails {
  tier: ComplexityTier;
  moduleCount: number;
  connectionCount: number;
  connectionDensity: number;
  rareModuleCount: number;
  hasBalancedLayout: boolean;
  bonuses: string[];
}

export function getComplexityDetails(
  modules: PlacedModule[],
  connections: Connection[]
): ComplexityDetails {
  const tier = analyzeComplexity(modules, connections);
  const density = calculateConnectionDensity(modules.length, connections.length);
  const rareCount = countRareModules(modules);
  const balanced = isLayoutBalanced(modules);

  const bonuses: string[] = [];
  if (density > 2.5) bonuses.push('高连接密度 (+1)');
  if (rareCount >= 3) bonuses.push('稀有模块 (+1)');
  if (balanced) bonuses.push('均衡布局 (+1)');

  return {
    tier,
    moduleCount: modules.length,
    connectionCount: connections.length,
    connectionDensity: Math.round(density * 100) / 100,
    rareModuleCount: rareCount,
    hasBalancedLayout: balanced,
    bonuses,
  };
}

/**
 * Get the color associated with a complexity tier
 */
export function getComplexityColor(tier: ComplexityTier): string {
  const colors: Record<ComplexityTier, string> = {
    '简陋': '#9ca3af',   // Gray
    '普通': '#22c55e',   // Green
    '精致': '#3b82f6',   // Blue
    '复杂': '#a855f7',   // Purple
    '史诗': '#f59e0b',   // Gold
  };
  return colors[tier];
}

/**
 * Get the English name for a complexity tier
 */
export function getComplexityTierEnglish(tier: ComplexityTier): string {
  const names: Record<ComplexityTier, string> = {
    '简陋': 'Crude',
    '普通': 'Ordinary',
    '精致': 'Exquisite',
    '复杂': 'Complex',
    '史诗': 'Epic',
  };
  return names[tier];
}
