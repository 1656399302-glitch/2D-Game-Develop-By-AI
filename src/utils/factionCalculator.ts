/**
 * Faction Calculator Utility
 * 
 * Calculates the dominant faction for a machine based on its module composition.
 * 
 * ROUND 80: Extended to 6 factions per contract specification.
 */

import { FactionId, FACTIONS, MODULE_TO_FACTION } from '../types/factions';
import { ModuleType } from '../types';

export type { FactionId } from '../types/factions';

/**
 * Calculate the dominant faction for a set of modules
 * @param modules - Array of placed modules
 * @returns The dominant faction ID, or null if no faction modules
 */
export function calculateFaction(modules: { type: ModuleType }[]): FactionId | null {
  // Count modules per faction - extended to 6 factions
  const factionCounts: Record<FactionId, number> = {
    void: 0,
    inferno: 0,
    storm: 0,
    stellar: 0,
    arcane: 0,
    chaos: 0,
  };
  
  modules.forEach((module) => {
    const faction = MODULE_TO_FACTION[module.type];
    if (faction) {
      factionCounts[faction]++;
    }
  });
  
  // Find the faction with the most modules
  let maxCount = 0;
  let dominantFaction: FactionId | null = null;
  
  (Object.keys(factionCounts) as FactionId[]).forEach((faction) => {
    if (factionCounts[faction] > maxCount) {
      maxCount = factionCounts[faction];
      dominantFaction = faction;
    }
  });
  
  return dominantFaction;
}

/**
 * Get faction counts for a set of modules
 * @param modules - Array of placed modules
 * @returns Object with faction counts - extended to 6 factions
 */
export function getFactionCounts(modules: { type: ModuleType }[]): Record<FactionId, number> {
  const factionCounts: Record<FactionId, number> = {
    void: 0,
    inferno: 0,
    storm: 0,
    stellar: 0,
    arcane: 0,
    chaos: 0,
  };
  
  modules.forEach((module) => {
    const faction = MODULE_TO_FACTION[module.type];
    if (faction) {
      factionCounts[faction]++;
    }
  });
  
  return factionCounts;
}

/**
 * Get the faction configuration for a given faction ID
 * @param factionId - The faction ID
 * @returns Faction configuration or null if not found
 */
export function getFactionConfig(factionId: FactionId) {
  return FACTIONS[factionId] || null;
}

/**
 * Get all faction IDs - extended to 6 factions
 * @returns Array of faction IDs
 */
export function getAllFactionIds(): FactionId[] {
  return ['void', 'inferno', 'storm', 'stellar', 'arcane', 'chaos'];
}

/**
 * Check if a module type belongs to a specific faction
 * @param moduleType - The module type
 * @param factionId - The faction ID to check
 * @returns True if the module belongs to the faction
 */
export function isModuleInFaction(moduleType: ModuleType, factionId: FactionId): boolean {
  return MODULE_TO_FACTION[moduleType] === factionId;
}
