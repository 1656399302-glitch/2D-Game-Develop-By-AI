/**
 * Achievement Data Definitions
 * 
 * Defines all achievements with unlock conditions and metadata.
 * Extended with new categories per Round 136 contract: circuit-building,
 * recipe-discovery, subcircuit, exploration.
 * 
 * ROUND 136: Refactored to use AchievementDefinition type from achievement.ts
 * and new category taxonomy. Includes both new category-based achievements
 * and legacy condition-based achievements for backward compatibility.
 */

import type { AchievementDefinition, AchievementCategory, ExtendedUserStats } from '../types/achievement';
import { FACTIONS, DEFAULT_USER_STATS, type FactionId } from '../types/factions';

/**
 * Achievement categories used in this file
 */
const CATEGORIES = {
  CIRCUIT_BUILDING: 'circuit-building' as AchievementCategory,
  RECIPE_DISCOVERY: 'recipe-discovery' as AchievementCategory,
  SUBCIRCUIT: 'subcircuit' as AchievementCategory,
  EXPLORATION: 'exploration' as AchievementCategory,
};

// ============================================
// LEGACY ACHIEVEMENTS (for backward compatibility with App.tsx)
// ============================================

/**
 * Helper to create achievement conditions that check exact thresholds
 */
const createMachineThresholdCondition = (threshold: number) => {
  return (stats: ExtendedUserStats): boolean => {
    return stats.machinesCreated === threshold;
  };
};

/**
 * Helper to create minimum machine condition
 */
const createMinimumMachineCondition = (minThreshold: number) => {
  return (stats: ExtendedUserStats): boolean => {
    return stats.machinesCreated >= minThreshold;
  };
};

/**
 * Helper to create faction-specific conditions
 */
const createFactionCondition = (faction: string, count: number) => {
  return (stats: ExtendedUserStats): boolean => {
    return (stats.factionCounts[faction] || 0) >= count;
  };
};

// Legacy achievements with condition fields (for App.tsx backward compatibility)
const LEGACY_ACHIEVEMENTS: AchievementDefinition[] = [
  // ============================================
  // Tutorial Completion Achievement
  // ============================================
  {
    id: 'getting-started',
    name: 'Getting Started',
    nameCn: '入门者',
    description: 'Complete the tutorial',
    icon: '🎓',
    category: 'exploration',
    condition: (stats: ExtendedUserStats): boolean => {
      return stats.tutorialCompleted === true;
    },
  },

  // ============================================
  // First Machine Achievements
  // ============================================
  {
    id: 'first-forge',
    name: 'First Forge',
    nameCn: '初次锻造',
    description: 'Create your first machine',
    icon: '🔨',
    category: 'circuit-building',
    condition: createMachineThresholdCondition(1),
  },
  {
    id: 'first-activation',
    name: 'First Activation',
    nameCn: '初次激活',
    description: 'Activate a machine for the first time',
    icon: '⚡',
    category: 'circuit-building',
    condition: (stats: ExtendedUserStats): boolean => {
      return stats.activations >= 1;
    },
  },

  // ============================================
  // First Export Achievement
  // ============================================
  {
    id: 'first-export',
    name: 'First Export',
    nameCn: '初次导出',
    description: 'Export a machine for the first time',
    icon: '📤',
    category: 'exploration',
    condition: (stats: ExtendedUserStats): boolean => {
      return (stats.machinesExported || 0) >= 1;
    },
  },

  // ============================================
  // Complex Machine Achievement
  // ============================================
  {
    id: 'complex-machine-created',
    name: 'Complex Machine Creator',
    nameCn: '复杂机器制造者',
    description: 'Create a machine of 精致 (Exquisite) tier or higher complexity',
    icon: '🏗️',
    category: 'circuit-building',
    condition: (stats: ExtendedUserStats): boolean => {
      return (stats.complexMachinesCreated || 0) >= 1;
    },
  },

  // ============================================
  // Milestone Achievements
  // ============================================
  {
    id: 'apprentice-forge',
    name: 'Apprentice Forger',
    nameCn: '学徒锻造师',
    description: 'Create 5 machines',
    icon: '⚒️',
    category: 'circuit-building',
    condition: createMachineThresholdCondition(5),
  },
  {
    id: 'skilled-artisan',
    name: 'Skilled Artisan',
    nameCn: '熟练工匠',
    description: 'Create 10 machines',
    icon: '🛠️',
    category: 'circuit-building',
    condition: createMachineThresholdCondition(10),
  },
  {
    id: 'master-creator',
    name: 'Master Creator',
    nameCn: '大师级创作者',
    description: 'Create 25 machines',
    icon: '🏆',
    category: 'circuit-building',
    condition: createMachineThresholdCondition(25),
  },
  {
    id: 'legendary-machinist',
    name: 'Legendary Machinist',
    nameCn: '传奇机械师',
    description: 'Create 50 machines',
    icon: '👑',
    category: 'circuit-building',
    condition: createMachineThresholdCondition(50),
  },
  {
    id: 'eternal-forger',
    name: 'Eternal Forger',
    nameCn: '永恒锻造者',
    description: 'Create 100 machines',
    icon: '🌟',
    category: 'circuit-building',
    condition: createMachineThresholdCondition(100),
  },

  // ============================================
  // Faction Achievements
  // ============================================
  {
    id: 'void-conqueror',
    name: 'Void Conqueror',
    nameCn: '虚空征服者',
    description: 'Create 5 Void-aligned machines',
    icon: '🌑',
    category: 'circuit-building',
    condition: createFactionCondition('void', 5),
    faction: 'void',
  },
  {
    id: 'inferno-master',
    name: 'Inferno Master',
    nameCn: '熔岩大师',
    description: 'Create 5 Inferno-aligned machines',
    icon: '🔥',
    category: 'circuit-building',
    condition: createFactionCondition('inferno', 5),
    faction: 'inferno',
  },
  {
    id: 'storm-ruler',
    name: 'Storm Ruler',
    nameCn: '雷霆主宰',
    description: 'Create 5 Storm-aligned machines',
    icon: '⚡',
    category: 'circuit-building',
    condition: createFactionCondition('storm', 5),
    faction: 'storm',
  },
  {
    id: 'stellar-harmonizer',
    name: 'Stellar Harmonizer',
    nameCn: '星辉和谐者',
    description: 'Create 5 Stellar-aligned machines',
    icon: '✨',
    category: 'circuit-building',
    condition: createFactionCondition('stellar', 5),
    faction: 'stellar',
  },
  {
    id: 'faction-void',
    name: 'Void Abyss Master',
    nameCn: '虚空深渊大师',
    description: 'Create 5 machines using Void Abyss faction',
    icon: '🌑',
    category: 'circuit-building',
    condition: createFactionCondition('void', 5),
    faction: 'void',
  },
  {
    id: 'faction-forge',
    name: 'Molten Star Forge Master',
    nameCn: '熔星锻造大师',
    description: 'Create 5 machines using Molten Star Forge faction',
    icon: '🔥',
    category: 'circuit-building',
    condition: createFactionCondition('inferno', 5),
    faction: 'inferno',
  },
  {
    id: 'faction-phase',
    name: 'Thunder Phase Master',
    nameCn: '雷霆相位大师',
    description: 'Create 5 machines using Thunder Phase faction',
    icon: '⚡',
    category: 'circuit-building',
    condition: createFactionCondition('storm', 5),
    faction: 'storm',
  },
  {
    id: 'faction-arcane',
    name: 'Arcane Order Master',
    nameCn: '奥术秩序大师',
    description: 'Create 5 machines using Arcane Order faction',
    icon: '🔮',
    category: 'circuit-building',
    condition: createFactionCondition('arcane', 5),
    faction: 'arcane',
  },
  {
    id: 'faction-chaos',
    name: 'Chaos Disorder Master',
    nameCn: '混沌无序大师',
    description: 'Create 5 machines using Chaos Disorder faction',
    icon: '💀',
    category: 'circuit-building',
    condition: createFactionCondition('chaos', 5),
    faction: 'chaos',
  },

  // ============================================
  // Perfect Activation Achievement
  // ============================================
  {
    id: 'perfect-activation',
    name: 'Perfect Activation',
    nameCn: '完美激活',
    description: 'Activate a machine without errors',
    icon: '✨',
    category: 'circuit-building',
    condition: (stats: ExtendedUserStats): boolean => {
      return stats.activations >= 1 && stats.errors === 0;
    },
  },

  // ============================================
  // Energy Master Achievement
  // ============================================
  {
    id: 'energy-master',
    name: 'Energy Master',
    nameCn: '能量大师',
    description: 'Create 10 machines',
    icon: '⚡',
    category: 'circuit-building',
    condition: createMinimumMachineCondition(10),
  },

  // ============================================
  // Collection Achievement
  // ============================================
  {
    id: 'codex-collector',
    name: 'Codex Collector',
    nameCn: '图鉴收藏家',
    description: 'Collect 10 machines in your codex',
    icon: '📖',
    category: 'exploration',
    condition: (stats: ExtendedUserStats): boolean => {
      return stats.codexEntries >= 10;
    },
  },
];

// ============================================
// NEW ROUND 136 ACHIEVEMENTS (category-based)
// ============================================

/**
 * Helper to create achievement definitions
 */
function createAchievement(
  id: string,
  name: string,
  nameCn: string,
  description: string,
  icon: string,
  category: AchievementCategory,
  faction?: string
): AchievementDefinition {
  return {
    id,
    name,
    nameCn,
    description,
    icon,
    category,
    faction,
  };
}

/**
 * All NEW achievement definitions organized by category
 */
const NEW_ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // ============================================
  // CIRCUIT BUILDING Category
  // ============================================
  createAchievement(
    'first-circuit',
    'First Circuit',
    '初次布线',
    'Build your first circuit on the canvas',
    '🔌',
    CATEGORIES.CIRCUIT_BUILDING
  ),
  createAchievement(
    'five-circuits',
    'Circuit Apprentice',
    '电路学徒',
    'Build 5 circuits on the canvas',
    '⚡',
    CATEGORIES.CIRCUIT_BUILDING
  ),
  createAchievement(
    'complex-circuit',
    'Complex Circuit',
    '复杂电路',
    'Build a circuit with 10 or more components',
    '🔧',
    CATEGORIES.CIRCUIT_BUILDING
  ),
  
  // ============================================
  // RECIPE DISCOVERY Category
  // ============================================
  createAchievement(
    'first-recipe',
    'First Discovery',
    '初次发现',
    'Discover your first recipe through experimentation',
    '🔬',
    CATEGORIES.RECIPE_DISCOVERY
  ),
  createAchievement(
    'five-recipes',
    'Recipe Collector',
    '配方收集者',
    'Discover 5 different recipes',
    '📚',
    CATEGORIES.RECIPE_DISCOVERY
  ),
  createAchievement(
    'rare-recipe',
    'Rare Recipe Hunter',
    '珍稀配方猎人',
    'Discover a rare recipe combination',
    '💎',
    CATEGORIES.RECIPE_DISCOVERY
  ),
  
  // ============================================
  // SUBCIRCUIT Category
  // ============================================
  createAchievement(
    'first-subcircuit',
    'Modular Thinker',
    '模块化思维',
    'Create your first sub-circuit module',
    '🧩',
    CATEGORIES.SUBCIRCUIT
  ),
  createAchievement(
    'five-subcircuits',
    'Sub-circuit Architect',
    '子电路架构师',
    'Create 5 different sub-circuit modules',
    '🏗️',
    CATEGORIES.SUBCIRCUIT
  ),
  createAchievement(
    'reuse-subcircuit',
    'Efficiency Expert',
    '效率专家',
    'Reuse a sub-circuit module 3 times',
    '♻️',
    CATEGORIES.SUBCIRCUIT
  ),
  
  // ============================================
  // EXPLORATION Category
  // ============================================
  createAchievement(
    'explore-tech-tree',
    'Tech Explorer',
    '科技探索者',
    'View the technology tree for the first time',
    '🌳',
    CATEGORIES.EXPLORATION
  ),
  createAchievement(
    'explore-gallery',
    'Gallery Visitor',
    '画廊访客',
    'Browse the community gallery',
    '🖼️',
    CATEGORIES.EXPLORATION
  ),
  createAchievement(
    'explore-achievements',
    'Achievement Seeker',
    '成就追求者',
    'Open the achievement panel to view progress',
    '🏆',
    CATEGORIES.EXPLORATION
  ),
];

// ============================================
// COMBINED EXPORTS
// ============================================

/**
 * All achievement definitions combined
 * Legacy achievements + new category-based achievements
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  ...LEGACY_ACHIEVEMENTS,
  ...NEW_ACHIEVEMENT_DEFINITIONS,
];

/**
 * Get achievement definition by ID
 */
export function getAchievementDefinition(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find(a => a.id === id);
}

/**
 * Get all achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter(a => a.category === category);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): AchievementCategory[] {
  return [
    CATEGORIES.CIRCUIT_BUILDING,
    CATEGORIES.RECIPE_DISCOVERY,
    CATEGORIES.SUBCIRCUIT,
    CATEGORIES.EXPLORATION,
  ];
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: AchievementCategory): { name: string; nameCn: string } {
  const names: Record<AchievementCategory, { name: string; nameCn: string }> = {
    'circuit-building': { name: 'Circuit Building', nameCn: '电路构建' },
    'recipe-discovery': { name: 'Recipe Discovery', nameCn: '配方发现' },
    'subcircuit': { name: 'Sub-circuit', nameCn: '子电路' },
    'exploration': { name: 'Exploration', nameCn: '探索' },
  };
  return names[category];
}

// ============================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================

/**
 * Get milestone achievements (legacy function for backward compatibility)
 */
export function getMilestoneAchievements(): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter(a => 
    a.id === 'apprentice-forge' ||
    a.id === 'skilled-artisan' ||
    a.id === 'master-creator' ||
    a.id === 'legendary-machinist' ||
    a.id === 'eternal-forger'
  );
}

/**
 * Check which milestone threshold an achievement corresponds to (legacy function)
 */
export function getMilestoneThreshold(achievementId: string): number | null {
  const thresholds: Record<string, number> = {
    'apprentice-forge': 5,
    'skilled-artisan': 10,
    'master-creator': 25,
    'legendary-machinist': 50,
    'eternal-forger': 100,
  };
  return thresholds[achievementId] ?? null;
}

/**
 * Get all achievements for a specific faction (legacy function)
 */
export function getAchievementsByFaction(faction: FactionId): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter(a => a.faction === faction);
}

/**
 * Total number of achievement definitions
 */
export const TOTAL_ACHIEVEMENT_DEFINITIONS = ACHIEVEMENT_DEFINITIONS.length;

/**
 * Legacy export name for backward compatibility
 */
export const ACHIEVEMENTS = ACHIEVEMENT_DEFINITIONS;

/**
 * Legacy constant for total achievements
 */
export const TOTAL_ACHIEVEMENTS = ACHIEVEMENT_DEFINITIONS.length;

// Alias for backward compatibility with existing code
export const getAchievementById = getAchievementDefinition;

// Re-export for backward compatibility with faction system
export { FACTIONS, DEFAULT_USER_STATS };

// Re-export types
export type { AchievementDefinition, AchievementCategory, ExtendedUserStats } from '../types/achievement';
export type { FactionId } from '../types/factions';
