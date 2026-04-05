/**
 * Achievement System Type Definitions
 * 
 * Defines the core types for the achievement system including
 * achievement definitions, categories, and user achievement state.
 * 
 * ROUND 136: Created new types to support achievement store refactoring
 * with unlocked state tracking and localStorage persistence.
 * 
 * Maintains backward compatibility with existing condition-based system.
 */

// Achievement categories for taxonomy
export type AchievementCategory = 
  | 'circuit-building'  // Achievements related to building circuits
  | 'recipe-discovery'  // Achievements for discovering recipes
  | 'subcircuit'         // Achievements for sub-circuit creation
  | 'exploration';       // Achievements for exploring the game

// Extended user stats for condition checking
export interface ExtendedUserStats {
  machinesCreated: number;
  activations: number;
  errors: number;
  playtimeMinutes: number;
  factionCounts: Record<string, number>;
  codexEntries: number;
  machinesExported: number;
  complexMachinesCreated: number;
  tutorialCompleted?: boolean;
}

// Achievement definition - static data for an achievement
export interface AchievementDefinition {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  // Optional faction association
  faction?: string;
  // Condition for automatic unlock checking (backward compatibility)
  condition?: (stats: ExtendedUserStats) => boolean;
}

// User's achievement state - tracks unlock status
export interface AchievementState {
  isUnlocked: boolean;
  unlockedAt: number | null; // Unix timestamp when unlocked
}

// Combined achievement with state (for display)
export interface Achievement extends AchievementDefinition {
  isUnlocked: boolean;
  unlockedAt: number | null;
}

// Stored achievement data in localStorage
export interface StoredAchievementData {
  achievements: Record<string, AchievementState>;
  lastUpdated: number;
}

// localStorage key for achievement persistence
export const ACHIEVEMENT_STORAGE_KEY = 'tech-tree-achievements';

// Helper to create default achievement state
export function createDefaultAchievementState(): AchievementState {
  return {
    isUnlocked: false,
    unlockedAt: null,
  };
}

// Helper to check if an achievement state is unlocked
export function isAchievementUnlocked(state: AchievementState): boolean {
  return state.isUnlocked === true;
}

// Helper to format unlock timestamp
export function formatUnlockTime(unlockedAt: number | null): string {
  if (unlockedAt === null) {
    return '';
  }
  
  const date = new Date(unlockedAt);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Backward compatibility: Re-export from factions
export type { FactionId } from './factions';
