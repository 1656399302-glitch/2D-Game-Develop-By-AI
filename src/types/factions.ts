/**
 * Faction System Types
 * 
 * Defines the 6 magical factions, their tech trees, and module-to-faction mappings.
 * Factions provide thematic alignment for machines and unlock special abilities.
 * 
 * ROUND 80 MIGRATION: Extended from 4 factions to 6 factions per contract specification.
 * New factions: 虚空深渊 (Void Abyss), 熔星锻造 (Molten Star Forge), 雷霆相位 (Thunder Phase), 
 * 森灵结界 (Forest Spirit Barrier), 奥术秩序 (Arcane Order), 混沌无序 (Chaos Disorder)
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

// Faction identifiers - extended to 6 factions per Round 80 contract
export type FactionId = 'void' | 'inferno' | 'storm' | 'stellar' | 'arcane' | 'chaos';

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

// All 6 factions - extended per Round 80 contract
export const FACTIONS: Record<FactionId, FactionConfig> = {
  void: {
    id: 'void',
    name: 'Void Abyss',
    nameCn: '虚空深渊',
    description: 'Masters of entropy and darkness, channeling energy from the void between dimensions.',
    color: '#7B2FBE',  // Contract specified: #7B2FBE
    secondaryColor: '#581C87',
    glowColor: 'rgba(123, 47, 190, 0.5)',
    icon: '🌑',
    moduleTypes: ['void-siphon', 'phase-modulator'],
  },
  inferno: {
    id: 'inferno',
    name: 'Molten Star Forge',
    nameCn: '熔星锻造',
    description: 'Wielders of primal fire, channeling volcanic fury and thermal destruction.',
    color: '#E85D04',  // Contract specified: #E85D04
    secondaryColor: '#C2410C',
    glowColor: 'rgba(232, 93, 4, 0.5)',
    icon: '🔥',
    moduleTypes: ['fire-crystal', 'core-furnace'],
  },
  storm: {
    id: 'storm',
    name: 'Thunder Phase',
    nameCn: '雷霆相位',
    description: 'Controllers of lightning and electromagnetic forces, harnessing nature\'s raw power.',
    color: '#48CAE4',  // Contract specified: #48CAE4
    secondaryColor: '#0891B2',
    glowColor: 'rgba(72, 202, 228, 0.5)',
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
  // NEW FACTIONS per Round 80 contract
  arcane: {
    id: 'arcane',
    name: 'Arcane Order',
    nameCn: '奥术秩序',
    description: 'Guardians of ancient knowledge and mystical order, wielding pure arcane energies.',
    color: '#3A0CA3',  // Contract specified: #3A0CA3
    secondaryColor: '#2B00A7',
    glowColor: 'rgba(58, 12, 163, 0.5)',
    icon: '🔮',
    moduleTypes: ['arcane-matrix-grid', 'rune-node'],
  },
  chaos: {
    id: 'chaos',
    name: 'Chaos Disorder',
    nameCn: '混沌无序',
    description: 'Embracers of entropy and unpredictable forces, channeling raw chaos energy.',
    color: '#9D0208',  // Contract specified: #9D0208
    secondaryColor: '#7F1D1D',
    glowColor: 'rgba(157, 2, 8, 0.5)',
    icon: '💀',
    moduleTypes: ['temporal-distorter', 'ether-infusion-chamber'],
  },
};

// Neutral modules (not counted for faction)
export const NEUTRAL_MODULES = [
  'gear',
  'shield-shell',
  'trigger-switch',
  'output-array',
  'stabilizer-core',
];

// Module-to-faction mapping - extended with new factions
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
  // Arcane Order modules
  'arcane-matrix-grid': 'arcane',
  'rune-node': 'arcane',
  // Chaos Disorder modules
  'temporal-distorter': 'chaos',
  'ether-infusion-chamber': 'chaos',
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

// Generate all 18 tech tree nodes (6 factions × 3 tiers)
export function generateTechTreeNodes(factionCounts: Record<FactionId, number>): TechTreeNode[] {
  const nodes: TechTreeNode[] = [];
  const factionIds: FactionId[] = ['void', 'inferno', 'storm', 'stellar', 'arcane', 'chaos'];
  
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

// Extended stats for achievement checking - includes tutorial completion and new Round 80 stats
export interface ExtendedUserStats {
  machinesCreated: number;
  activations: number;
  errors: number;
  playtimeMinutes: number;
  factionCounts: Record<FactionId, number>;
  codexEntries: number;
  machinesExported: number;
  complexMachinesCreated: number;
  tutorialCompleted?: boolean;
}

// UserStats is same as ExtendedUserStats for simplicity
export type UserStats = ExtendedUserStats;

// Default stats - extended with new faction counts and new tracking fields
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
    arcane: 0,
    chaos: 0,
  },
  codexEntries: 0,
  machinesExported: 0,
  complexMachinesCreated: 0,
};
