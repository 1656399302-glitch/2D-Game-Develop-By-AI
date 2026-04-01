/**
 * Faction System Types
 * 
 * Defines the 4 magical factions, their tech trees, and module-to-faction mappings.
 * Factions provide thematic alignment for machines and unlock special abilities.
 */

// Re-export faction reputation types
export { FactionReputationLevel } from './factionReputation';
export type { FactionReputation } from './factionReputation';

export {
  REPUTATION_THRESHOLDS,
  NEXT_LEVEL_THRESHOLDS,
  REPUTATION_LEVEL_INFO,
  FACTION_VARIANT_MODULES,
  getFactionVariantModule,
  isVariantUnlockedForLevel,
} from './factionReputation';

// Faction identifiers
export type FactionId = 'void' | 'inferno' | 'storm' | 'stellar';

// Faction configuration
export interface FactionConfig {
  id: FactionId;
  name: string;
  nameCn: string;
  description: string;
  color: string;        // Primary color (hex)
  secondaryColor: string; // Secondary/accent color
  glowColor: string;     // Glow effect color
  icon: string;          // Emoji or icon identifier
  moduleTypes: string[]; // Module types associated with this faction
}

// Tech tree node tier
export type TechTreeTier = 1 | 2 | 3;

// Tech tree node configuration
export interface TechTreeNode {
  id: string;
  faction: FactionId;
  tier: TechTreeTier;
  name: string;
  description: string;
  unlockRequirement: number; // Machines created with this faction to unlock
  isUnlocked: boolean;
  position: { row: number; col: number }; // Grid position
}

// All 4 factions
export const FACTIONS: Record<FactionId, FactionConfig> = {
  void: {
    id: 'void',
    name: 'Void',
    nameCn: '深渊派系',
    description: 'Masters of entropy and darkness, channeling energy from the void between dimensions.',
    color: '#a78bfa',
    secondaryColor: '#7c3aed',
    glowColor: 'rgba(167, 139, 250, 0.5)',
    icon: '🌑',
    moduleTypes: ['void-siphon', 'phase-modulator'],
  },
  inferno: {
    id: 'inferno',
    name: 'Inferno',
    nameCn: '熔岩派系',
    description: 'Wielders of primal fire, channeling volcanic fury and thermal destruction.',
    color: '#f97316',
    secondaryColor: '#ea580c',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    icon: '🔥',
    moduleTypes: ['fire-crystal', 'core-furnace'],
  },
  storm: {
    id: 'storm',
    name: 'Storm',
    nameCn: '雷霆派系',
    description: 'Controllers of lightning and electromagnetic forces, harnessing nature\'s raw power.',
    color: '#22d3ee',
    secondaryColor: '#06b6d4',
    glowColor: 'rgba(34, 211, 238, 0.5)',
    icon: '⚡',
    moduleTypes: ['lightning-conductor', 'energy-pipe'],
  },
  stellar: {
    id: 'stellar',
    name: 'Stellar',
    nameCn: '星辉派系',
    description: 'Harnessed the power of stars, channeling cosmic energy and harmony.',
    color: '#fbbf24',
    secondaryColor: '#f59e0b',
    glowColor: 'rgba(251, 191, 36, 0.5)',
    icon: '✨',
    moduleTypes: ['amplifier-crystal', 'resonance-chamber'],
  },
};

// Neutral modules (not counted for faction)
export const NEUTRAL_MODULES = [
  'gear',
  'rune-node',
  'shield-shell',
  'trigger-switch',
  'output-array',
  'stabilizer-core',
];

// Module-to-faction mapping
export interface ModuleFactionMapping {
  [moduleType: string]: FactionId;
}

export const MODULE_TO_FACTION: ModuleFactionMapping = {
  // Void modules
  'void-siphon': 'void',
  'phase-modulator': 'void',
  // Inferno modules
  'fire-crystal': 'inferno',
  'core-furnace': 'inferno',
  // Storm modules
  'lightning-conductor': 'storm',
  'energy-pipe': 'storm',
  // Stellar modules
  'amplifier-crystal': 'stellar',
  'resonance-chamber': 'stellar',
  // Neutral modules (not mapped)
};

// Tech tree unlock requirements
export const TECH_TREE_REQUIREMENTS = {
  // Tier 1: Basic unlocks
  1: 3,
  // Tier 2: Advanced features
  2: 7,
  // Tier 3: Ultimate abilities
  3: 15,
};

// Generate all 12 tech tree nodes (4 factions × 3 tiers)
export function generateTechTreeNodes(factionCounts: Record<FactionId, number>): TechTreeNode[] {
  const nodes: TechTreeNode[] = [];
  const factionIds: FactionId[] = ['void', 'inferno', 'storm', 'stellar'];
  
  factionIds.forEach((factionId, factionIndex) => {
    for (let tier = 1; tier <= 3; tier++) {
      const faction = FACTIONS[factionId];
      const requirement = TECH_TREE_REQUIREMENTS[tier as TechTreeTier];
      const count = factionCounts[factionId] || 0;
      
      const tierNames: Record<number, string> = {
        1: `${faction.name} 基础`,
        2: `${faction.name} 进阶`,
        3: `${faction.name} 究极`,
      };
      
      const tierDescriptions: Record<number, string> = {
        1: `解锁 ${faction.nameCn} 的基础模块变体`,
        2: `解锁 ${faction.nameCn} 的高级动画效果`,
        3: `解锁 ${faction.nameCn} 的专属终极技能`,
      };
      
      nodes.push({
        id: `${factionId}-tier-${tier}`,
        faction: factionId,
        tier: tier as TechTreeTier,
        name: tierNames[tier],
        description: tierDescriptions[tier],
        unlockRequirement: requirement,
        isUnlocked: count >= requirement,
        position: { row: factionIndex, col: tier - 1 },
      });
    }
  });
  
  return nodes;
}

// Extended stats for achievement checking - includes tutorial completion
export interface ExtendedUserStats extends UserStats {
  tutorialCompleted?: boolean;
}

// Achievement definitions
export interface Achievement {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  icon: string;
  condition: (stats: ExtendedUserStats) => boolean;
  faction?: FactionId; // Associated faction for badge display
}

export interface UserStats {
  machinesCreated: number;
  activations: number;
  errors: number;
  playtimeMinutes: number;
  factionCounts: Record<FactionId, number>;
  codexEntries: number;
}

// All achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-forge',
    name: 'First Forge',
    nameCn: '初次锻造',
    description: 'Create your first machine',
    icon: '🔨',
    condition: (stats) => stats.machinesCreated >= 1,
  },
  {
    id: 'energy-master',
    name: 'Energy Master',
    nameCn: '能量大师',
    description: 'Create 10 machines',
    icon: '⚡',
    condition: (stats) => stats.machinesCreated >= 10,
  },
  {
    id: 'void-conqueror',
    name: 'Void Conqueror',
    nameCn: '虚空征服者',
    description: 'Create 5 Void-aligned machines',
    icon: '🌑',
    condition: (stats) => (stats.factionCounts['void'] || 0) >= 5,
    faction: 'void',
  },
  {
    id: 'inferno-master',
    name: 'Inferno Master',
    nameCn: '熔岩大师',
    description: 'Create 5 Inferno-aligned machines',
    icon: '🔥',
    condition: (stats) => (stats.factionCounts['inferno'] || 0) >= 5,
    faction: 'inferno',
  },
  {
    id: 'storm-ruler',
    name: 'Storm Ruler',
    nameCn: '雷霆主宰',
    description: 'Create 5 Storm-aligned machines',
    icon: '⚡',
    condition: (stats) => (stats.factionCounts['storm'] || 0) >= 5,
    faction: 'storm',
  },
  {
    id: 'stellar-harmonizer',
    name: 'Stellar Harmonizer',
    nameCn: '星辉和谐者',
    description: 'Create 5 Stellar-aligned machines',
    icon: '✨',
    condition: (stats) => (stats.factionCounts['stellar'] || 0) >= 5,
    faction: 'stellar',
  },
  {
    id: 'perfect-activation',
    name: 'Perfect Activation',
    nameCn: '完美激活',
    description: 'Activate a machine without errors',
    icon: '✨',
    condition: (stats) => stats.activations >= 1 && stats.errors === 0,
  },
  {
    id: 'codex-collector',
    name: 'Codex Collector',
    nameCn: '图鉴收藏家',
    description: 'Collect 10 machines in your codex',
    icon: '📖',
    condition: (stats) => stats.codexEntries >= 10,
  },
];

// Default stats
export const DEFAULT_USER_STATS: UserStats = {
  machinesCreated: 0,
  activations: 0,
  errors: 0,
  playtimeMinutes: 0,
  factionCounts: {
    void: 0,
    inferno: 0,
    storm: 0,
    stellar: 0,
  },
  codexEntries: 0,
};
