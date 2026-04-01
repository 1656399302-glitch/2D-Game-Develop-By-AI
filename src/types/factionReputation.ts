/**
 * Faction Reputation Types for Arcane Machine Codex Workshop
 * 
 * Reputation system allows players to earn reputation points with factions
 * and unlock faction-exclusive content at higher ranks.
 * 
 * ROUND 80: Extended to 6 factions per contract specification.
 */

/**
 * Research duration in milliseconds
 * Named export required by acceptance criteria
 */
export const RESEARCH_DURATION_MS = 3000;

/**
 * Maximum number of concurrent research items in queue
 */
export const MAX_RESEARCH_QUEUE = 3;

/**
 * Faction reputation levels (5 tiers)
 */
export enum FactionReputationLevel {
  Apprentice = 'apprentice',       // 0 - 199
  Journeyman = 'journeyman',       // 200 - 499
  Expert = 'expert',               // 500 - 999
  Master = 'master',               // 1000 - 1999
  Grandmaster = 'grandmaster',     // 2000+
}

/**
 * Research states for tech tree nodes
 */
export enum ResearchState {
  Locked = 'locked',
  Available = 'available',
  Researching = 'researching',
  Completed = 'completed',
}

/**
 * Research item interface
 */
export interface ResearchItem {
  techId: string;
  startedAt: number;
  durationMs: number;
}

/**
 * Reputation thresholds for each level
 */
export const REPUTATION_THRESHOLDS: Record<FactionReputationLevel, number> = {
  [FactionReputationLevel.Apprentice]: 0,
  [FactionReputationLevel.Journeyman]: 200,
  [FactionReputationLevel.Expert]: 500,
  [FactionReputationLevel.Master]: 1000,
  [FactionReputationLevel.Grandmaster]: 2000,
};

/**
 * Next level thresholds (for progress calculation)
 */
export const NEXT_LEVEL_THRESHOLDS: Record<FactionReputationLevel, number | null> = {
  [FactionReputationLevel.Apprentice]: 200,
  [FactionReputationLevel.Journeyman]: 500,
  [FactionReputationLevel.Expert]: 1000,
  [FactionReputationLevel.Master]: 2000,
  [FactionReputationLevel.Grandmaster]: null, // No next level
};

/**
 * Faction reputation data for a single faction
 */
export interface FactionReputation {
  /** Faction ID */
  factionId: string;
  /** Current reputation points */
  points: number;
  /** Current reputation level */
  level: FactionReputationLevel;
  /** Total reputation ever earned (for tracking) */
  totalEarned: number;
  /** Last updated timestamp */
  lastUpdated: number;
}

/**
 * Reputation level display information
 */
export interface ReputationLevelInfo {
  level: FactionReputationLevel;
  displayName: string;
  displayNameZh: string;
  minPoints: number;
  maxPoints: number | null;
  icon: string;
  color: string;
  description: string;
}

/**
 * Reputation level display configurations
 */
export const REPUTATION_LEVEL_INFO: Record<FactionReputationLevel, ReputationLevelInfo> = {
  [FactionReputationLevel.Apprentice]: {
    level: FactionReputationLevel.Apprentice,
    displayName: 'Apprentice',
    displayNameZh: '学徒',
    minPoints: 0,
    maxPoints: 199,
    icon: '📘',
    color: '#9ca3af',
    description: 'Newcomer to the faction',
  },
  [FactionReputationLevel.Journeyman]: {
    level: FactionReputationLevel.Journeyman,
    displayName: 'Journeyman',
    displayNameZh: '行商',
    minPoints: 200,
    maxPoints: 499,
    icon: '📗',
    color: '#22c55e',
    description: 'Established member of the faction',
  },
  [FactionReputationLevel.Expert]: {
    level: FactionReputationLevel.Expert,
    displayName: 'Expert',
    displayNameZh: '专家',
    minPoints: 500,
    maxPoints: 999,
    icon: '📙',
    color: '#3b82f6',
    description: 'Recognized expert in faction arts',
  },
  [FactionReputationLevel.Master]: {
    level: FactionReputationLevel.Master,
    displayName: 'Master',
    displayNameZh: '大师',
    minPoints: 1000,
    maxPoints: 1999,
    icon: '📕',
    color: '#a855f7',
    description: 'Master of faction techniques',
  },
  [FactionReputationLevel.Grandmaster]: {
    level: FactionReputationLevel.Grandmaster,
    displayName: 'Grandmaster',
    displayNameZh: '宗师',
    minPoints: 2000,
    maxPoints: null,
    icon: '🏆',
    color: '#f59e0b',
    description: 'Legendary master with exclusive access',
  },
};

/**
 * Faction variant module types unlocked at Grandmaster rank - extended to 6 factions
 */
export const FACTION_VARIANT_MODULES: Record<string, string> = {
  'void': 'void-arcane-gear',
  'inferno': 'inferno-blazing-core',
  'storm': 'storm-thundering-pipe',
  'stellar': 'stellar-harmonic-crystal',
  'arcane': 'arcane-order-rune',
  'chaos': 'chaos-disorder-core',
};

/**
 * Get variant module ID for a faction
 */
export function getFactionVariantModule(factionId: string): string | null {
  return FACTION_VARIANT_MODULES[factionId] || null;
}

/**
 * Check if a faction variant is unlocked for a given reputation level
 */
export function isVariantUnlockedForLevel(level: FactionReputationLevel): boolean {
  return level === FactionReputationLevel.Grandmaster;
}

/**
 * Get reputation level from reputation points
 * 
 * @param points - Current reputation points
 * @returns The corresponding reputation level
 */
export function getReputationLevel(points: number): FactionReputationLevel {
  if (points >= REPUTATION_THRESHOLDS[FactionReputationLevel.Grandmaster]) {
    return FactionReputationLevel.Grandmaster;
  }
  if (points >= REPUTATION_THRESHOLDS[FactionReputationLevel.Master]) {
    return FactionReputationLevel.Master;
  }
  if (points >= REPUTATION_THRESHOLDS[FactionReputationLevel.Expert]) {
    return FactionReputationLevel.Expert;
  }
  if (points >= REPUTATION_THRESHOLDS[FactionReputationLevel.Journeyman]) {
    return FactionReputationLevel.Journeyman;
  }
  return FactionReputationLevel.Apprentice;
}
