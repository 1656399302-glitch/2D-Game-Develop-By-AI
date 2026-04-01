/**
 * Achievement Data Definitions
 * 
 * Defines all achievements with unlock conditions and metadata.
 * Expanded to include milestone achievements for machine creation.
 */

// Re-export types from factions for convenience
export type { Achievement, ExtendedUserStats } from '../types/factions';
export type { FactionId } from '../types/factions';

// Re-export FACTIONS for faction config access
export { FACTIONS } from '../types/factions';

import type { Achievement, FactionId } from '../types/factions';

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
    condition: (stats: { tutorialCompleted?: boolean }): boolean => {
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
    condition: (stats: { activations: number }): boolean => {
      return stats.activations >= 1;
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
  // Faction Achievement Series
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
  // Perfect Activation Achievement
  // ============================================
  {
    id: 'perfect-activation',
    name: 'Perfect Activation',
    nameCn: '完美激活',
    description: 'Activate a machine without errors',
    icon: '✨',
    condition: (stats: { activations: number; errors: number }): boolean => {
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
    condition: (stats: { codexEntries: number }): boolean => {
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
