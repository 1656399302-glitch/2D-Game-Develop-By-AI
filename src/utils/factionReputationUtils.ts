/**
 * Faction Reputation Utility Functions
 * 
 * Pure functions for reputation calculations and level management.
 */

import {
  FactionReputationLevel,
  REPUTATION_THRESHOLDS,
  NEXT_LEVEL_THRESHOLDS,
  FACTION_VARIANT_MODULES,
  getFactionVariantModule,
  isVariantUnlockedForLevel,
} from '../types/factionReputation';

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

/**
 * Get the next level threshold for a given reputation level
 * 
 * @param points - Current reputation points
 * @returns Points needed for next level, or null if at max level
 */
export function getNextLevelThreshold(points: number): number | null {
  const currentLevel = getReputationLevel(points);
  return NEXT_LEVEL_THRESHOLDS[currentLevel];
}

/**
 * Get progress percentage to next level
 * 
 * @param points - Current reputation points
 * @returns Object with progress percentage and points remaining
 */
export function getProgressToNextLevel(points: number): {
  percentage: number;
  pointsRemaining: number;
  pointsInCurrentLevel: number;
} {
  const currentLevel = getReputationLevel(points);
  const currentThreshold = REPUTATION_THRESHOLDS[currentLevel];
  const nextThreshold = NEXT_LEVEL_THRESHOLDS[currentLevel];

  if (nextThreshold === null) {
    // At max level
    return {
      percentage: 100,
      pointsRemaining: 0,
      pointsInCurrentLevel: points - currentThreshold,
    };
  }

  const pointsInCurrentLevel = points - currentThreshold;
  const pointsNeededForNextLevel = nextThreshold - currentThreshold;
  const percentage = Math.min(100, (pointsInCurrentLevel / pointsNeededForNextLevel) * 100);
  const pointsRemaining = Math.max(0, nextThreshold - points);

  return {
    percentage,
    pointsRemaining,
    pointsInCurrentLevel,
  };
}

/**
 * Get unlocked faction variants for a given reputation level
 * 
 * @param faction - The faction ID to check
 * @param level - The reputation level achieved
 * @returns The variant module ID if unlocked, or null
 */
export function getUnlockedVariants(
  faction: string,
  level: FactionReputationLevel
): string | null {
  if (!isVariantUnlockedForLevel(level)) {
    return null;
  }
  return getFactionVariantModule(faction);
}

/**
 * Check if a faction variant module is unlocked based on reputation points
 * 
 * @param faction - The faction ID to check
 * @param points - Current reputation points
 * @returns True if variant is unlocked (Grandmaster rank)
 */
export function isVariantUnlockedByPoints(_faction: string, points: number): boolean {
  const level = getReputationLevel(points);
  return isVariantUnlockedForLevel(level);
}

/**
 * Calculate points needed to reach a target level
 * 
 * @param currentPoints - Current reputation points
 * @param targetLevel - The level to reach
 * @returns Points needed, or 0 if already at or above target
 */
export function getPointsToLevel(
  currentPoints: number,
  targetLevel: FactionReputationLevel
): number {
  const targetThreshold = REPUTATION_THRESHOLDS[targetLevel];
  return Math.max(0, targetThreshold - currentPoints);
}

/**
 * Get reputation level display name
 * 
 * @param level - The reputation level
 * @returns Display name (English)
 */
export function getLevelDisplayName(level: FactionReputationLevel): string {
  const names: Record<FactionReputationLevel, string> = {
    [FactionReputationLevel.Apprentice]: 'Apprentice',
    [FactionReputationLevel.Journeyman]: 'Journeyman',
    [FactionReputationLevel.Expert]: 'Expert',
    [FactionReputationLevel.Master]: 'Master',
    [FactionReputationLevel.Grandmaster]: 'Grandmaster',
  };
  return names[level];
}

/**
 * Get reputation level display name (Chinese)
 * 
 * @param level - The reputation level
 * @returns Display name (Chinese)
 */
export function getLevelDisplayNameZh(level: FactionReputationLevel): string {
  const names: Record<FactionReputationLevel, string> = {
    [FactionReputationLevel.Apprentice]: '学徒',
    [FactionReputationLevel.Journeyman]: '行商',
    [FactionReputationLevel.Expert]: '专家',
    [FactionReputationLevel.Master]: '大师',
    [FactionReputationLevel.Grandmaster]: '宗师',
  };
  return names[level];
}

/**
 * Get all faction IDs that have variant modules
 * 
 * @returns Array of faction IDs
 */
export function getFactionVariantIds(): string[] {
  return Object.keys(FACTION_VARIANT_MODULES);
}

/**
 * Get all variant module IDs
 * 
 * @returns Array of variant module IDs
 */
export function getAllVariantModuleIds(): string[] {
  return Object.values(FACTION_VARIANT_MODULES);
}

/**
 * Check if a module ID is a faction variant
 * 
 * @param moduleId - Module ID to check
 * @returns True if the module is a faction variant
 */
export function isFactionVariant(moduleId: string): boolean {
  return getAllVariantModuleIds().includes(moduleId);
}

/**
 * Get the faction ID that a variant module belongs to
 * 
 * @param moduleId - Variant module ID
 * @returns Faction ID or null if not a variant
 */
export function getVariantFactionId(moduleId: string): string | null {
  for (const [factionId, variantModule] of Object.entries(FACTION_VARIANT_MODULES)) {
    if (variantModule === moduleId) {
      return factionId;
    }
  }
  return null;
}
