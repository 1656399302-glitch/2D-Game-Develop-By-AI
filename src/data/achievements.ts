/**
 * Achievement Data Definitions
 * 
 * Defines all achievements with unlock conditions and metadata.
 * Expanded to include milestone achievements for machine creation.
 * 
 * ROUND 80 MIGRATION: Added new faction achievements per contract specification.
 * New achievements: first-export, complex-machine-created, faction-void, faction-forge,
 * faction-phase, faction-barrier, faction-order, faction-chaos
 */

// Re-export types from factions for convenience
export type { Achievement, ExtendedUserStats, FactionId } from '../types/factions';

// Re-export FACTIONS for faction config access
export { FACTIONS, DEFAULT_USER_STATS } from '../types/factions';

import type { Achievement, FactionId, ExtendedUserStats } from '../types/factions';

/**
 * Helper to create achievement conditions that check exact thresholds
 */
const createMachineThresholdCondition = (threshold: number) => {
  return (stats: { machinesCreated: number }): boolean => {
    return stats.machinesCreated === threshold;
  };
};

/**
 * Helper to create achievement conditions that check minimum thresholds
 */
const createMinimumMachineCondition = (minThreshold: number) => {
  return (stats: { machinesCreated: number }): boolean => {
    return stats.machinesCreated >= minThreshold;
  };
};

/**
 * Helper to create faction-specific conditions
 */
const createFactionCondition = (faction: FactionId, count: number) => {
  return (stats: { factionCounts: Record<FactionId, number> }): boolean => {
    return (stats.factionCounts[faction] || 0) >= count;
  };
};

// All achievements with expanded milestone system
export const ACHIEVEMENTS: Achievement[] = [
  // ============================================
  // Tutorial Completion Achievement
  // ============================================
  {
    id: 'getting-started',
    name: 'Getting Started',
    nameCn: '入门者',
    description: 'Complete the tutorial',
    icon: '🎓',
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
    condition: createMachineThresholdCondition(1),
  },
  {
    id: 'first-activation',
    name: 'First Activation',
    nameCn: '初次激活',
    description: 'Activate a machine for the first time',
    icon: '⚡',
    condition: (stats: ExtendedUserStats): boolean => {
      return stats.activations >= 1;
    },
  },

  // ============================================
  // NEW: First Export Achievement (Round 80 Contract)
  // ============================================
  {
    id: 'first-export',
    name: 'First Export',
    nameCn: '初次导出',
    description: 'Export a machine for the first time',
    icon: '📤',
    condition: (stats: ExtendedUserStats): boolean => {
      return (stats.machinesExported || 0) >= 1;
    },
  },

  // ============================================
  // NEW: Complex Machine Achievement (Round 80 Contract)
  // ============================================
  {
    id: 'complex-machine-created',
    name: 'Complex Machine Creator',
    nameCn: '复杂机器制造者',
    description: 'Create a machine of 精致 (Exquisite) tier or higher complexity',
    icon: '🏗️',
    condition: (stats: ExtendedUserStats): boolean => {
      return (stats.complexMachinesCreated || 0) >= 1;
    },
  },

  // ============================================
  // Milestone Achievements (P0 - Must Unlock at Exact Threshold)
  // ============================================
  {
    id: 'apprentice-forge',
    name: 'Apprentice Forger',
    nameCn: '学徒锻造师',
    description: 'Create 5 machines',
    icon: '⚒️',
    condition: createMachineThresholdCondition(5),
  },
  {
    id: 'skilled-artisan',
    name: 'Skilled Artisan',
    nameCn: '熟练工匠',
    description: 'Create 10 machines',
    icon: '🛠️',
    condition: createMachineThresholdCondition(10),
  },
  {
    id: 'master-creator',
    name: 'Master Creator',
    nameCn: '大师级创作者',
    description: 'Create 25 machines',
    icon: '🏆',
    condition: createMachineThresholdCondition(25),
  },
  {
    id: 'legendary-machinist',
    name: 'Legendary Machinist',
    nameCn: '传奇机械师',
    description: 'Create 50 machines',
    icon: '👑',
    condition: createMachineThresholdCondition(50),
  },
  {
    id: 'eternal-forger',
    name: 'Eternal Forger',
    nameCn: '永恒锻造者',
    description: 'Create 100 machines',
    icon: '🌟',
    condition: createMachineThresholdCondition(100),
  },

  // ============================================
  // Legacy Faction Achievements (preserved for backward compatibility)
  // ============================================
  {
    id: 'void-conqueror',
    name: 'Void Conqueror',
    nameCn: '虚空征服者',
    description: 'Create 5 Void-aligned machines',
    icon: '🌑',
    condition: createFactionCondition('void', 5),
    faction: 'void',
  },
  {
    id: 'inferno-master',
    name: 'Inferno Master',
    nameCn: '熔岩大师',
    description: 'Create 5 Inferno-aligned machines',
    icon: '🔥',
    condition: createFactionCondition('inferno', 5),
    faction: 'inferno',
  },
  {
    id: 'storm-ruler',
    name: 'Storm Ruler',
    nameCn: '雷霆主宰',
    description: 'Create 5 Storm-aligned machines',
    icon: '⚡',
    condition: createFactionCondition('storm', 5),
    faction: 'storm',
  },
  {
    id: 'stellar-harmonizer',
    name: 'Stellar Harmonizer',
    nameCn: '星辉和谐者',
    description: 'Create 5 Stellar-aligned machines',
    icon: '✨',
    condition: createFactionCondition('stellar', 5),
    faction: 'stellar',
  },

  // ============================================
  // NEW Faction Achievements per Round 80 Contract
  // ============================================
  {
    id: 'faction-void',
    name: 'Void Abyss Master',
    nameCn: '虚空深渊大师',
    description: 'Create 5 machines using Void Abyss faction',
    icon: '🌑',
    condition: createFactionCondition('void', 5),
    faction: 'void',
  },
  {
    id: 'faction-forge',
    name: 'Molten Star Forge Master',
    nameCn: '熔星锻造大师',
    description: 'Create 5 machines using Molten Star Forge faction',
    icon: '🔥',
    condition: createFactionCondition('inferno', 5),
    faction: 'inferno',
  },
  {
    id: 'faction-phase',
    name: 'Thunder Phase Master',
    nameCn: '雷霆相位大师',
    description: 'Create 5 machines using Thunder Phase faction',
    icon: '⚡',
    condition: createFactionCondition('storm', 5),
    faction: 'storm',
  },
  {
    id: 'faction-barrier',
    name: 'Forest Spirit Barrier Master',
    nameCn: '森灵结界大师',
    description: 'Create 5 machines using Forest Spirit Barrier faction',
    icon: '🌲',
    condition: createFactionCondition('arcane', 5), // Using arcane as base since Forest Spirit Barrier maps to arcane
    faction: 'arcane',
  },
  {
    id: 'faction-order',
    name: 'Arcane Order Master',
    nameCn: '奥术秩序大师',
    description: 'Create 5 machines using Arcane Order faction',
    icon: '🔮',
    condition: createFactionCondition('arcane', 5),
    faction: 'arcane',
  },
  {
    id: 'faction-chaos',
    name: 'Chaos Disorder Master',
    nameCn: '混沌无序大师',
    description: 'Create 5 machines using Chaos Disorder faction',
    icon: '💀',
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
    condition: (stats: ExtendedUserStats): boolean => {
      return stats.activations >= 1 && stats.errors === 0;
    },
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
    condition: (stats: ExtendedUserStats): boolean => {
      return stats.codexEntries >= 10;
    },
  },

  // ============================================
  // Energy Master - Requires minimum threshold, not exact
  // ============================================
  {
    id: 'energy-master',
    name: 'Energy Master',
    nameCn: '能量大师',
    description: 'Create 10 machines',
    icon: '⚡',
    condition: createMinimumMachineCondition(10),
  },
];

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

/**
 * Get all achievements for a specific faction
 */
export function getAchievementsByFaction(faction: FactionId): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.faction === faction);
}

/**
 * Get milestone achievements
 */
export function getMilestoneAchievements(): Achievement[] {
  return ACHIEVEMENTS.filter(a => 
    a.id === 'apprentice-forge' ||
    a.id === 'skilled-artisan' ||
    a.id === 'master-creator' ||
    a.id === 'legendary-machinist' ||
    a.id === 'eternal-forger'
  );
}

/**
 * Check which milestone threshold an achievement corresponds to
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
 * Total number of achievements
 */
export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length;

export default ACHIEVEMENTS;
