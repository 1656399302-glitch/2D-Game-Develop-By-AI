/**
 * Achievement Checker Utility
 * 
 * Detects when achievements are earned based on user statistics.
 * Triggers callbacks when achievements are unlocked.
 * 
 * ROUND 136: Updated to use new Achievement types from achievement.ts
 */

import type { Achievement, AchievementDefinition, ExtendedUserStats } from '../types/achievement';
import { ACHIEVEMENTS } from '../data/achievements';

export type AchievementCallback = (achievement: Achievement) => void;

/**
 * Check which achievements have been earned based on current stats
 * @param stats - Current user statistics
 * @param earnedIds - Set of already earned achievement IDs
 * @returns Array of newly earned achievement IDs
 */
export function checkAchievements(
  stats: ExtendedUserStats,
  earnedIds: Set<string> = new Set()
): string[] {
  const newlyEarned: string[] = [];
  
  ACHIEVEMENTS.forEach((achievement) => {
    // Skip already earned achievements
    if (earnedIds.has(achievement.id)) {
      return;
    }
    
    // Check if the achievement has a condition and if it's met
    if (achievement.condition && achievement.condition(stats)) {
      newlyEarned.push(achievement.id);
    }
  });
  
  return newlyEarned;
}

/**
 * Check achievements and invoke callbacks for newly earned ones
 * @param stats - Current user statistics
 * @param earnedIds - Set of already earned achievement IDs
 * @param callback - Function to call for each newly earned achievement
 * @returns Array of newly earned achievement IDs
 */
export function checkAchievementsWithCallback(
  stats: ExtendedUserStats,
  earnedIds: Set<string>,
  callback: AchievementCallback
): string[] {
  const newlyEarned = checkAchievements(stats, earnedIds);
  
  // Invoke callback for each newly earned achievement
  newlyEarned.forEach((id) => {
    const achievement = ACHIEVEMENTS.find((a) => a.id === id);
    if (achievement) {
      callback(achievement as Achievement);
    }
  });
  
  return newlyEarned;
}

/**
 * Get all achievements with their earned status
 * @param earnedIds - Set of earned achievement IDs
 * @returns Array of achievements with earned status
 */
export function getAllAchievementsWithStatus(
  earnedIds: Set<string>
): Array<AchievementDefinition & { earned: boolean }> {
  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    earned: earnedIds.has(achievement.id),
  }));
}

/**
 * Get achievement by ID
 * @param id - Achievement ID
 * @returns Achievement or null if not found
 */
export function getAchievementById(id: string): AchievementDefinition | null {
  return ACHIEVEMENTS.find((a) => a.id === id) || null;
}

/**
 * Get total achievement count
 * @returns Total number of achievements
 */
export function getTotalAchievementCount(): number {
  return ACHIEVEMENTS.length;
}

/**
 * Get earned achievement count
 * @param earnedIds - Set of earned achievement IDs
 * @returns Number of earned achievements
 */
export function getEarnedAchievementCount(earnedIds: Set<string>): number {
  return ACHIEVEMENTS.filter((a) => earnedIds.has(a.id)).length;
}

/**
 * Calculate achievement progress percentage
 * @param earnedIds - Set of earned achievement IDs
 * @returns Progress percentage (0-100)
 */
export function getAchievementProgress(earnedIds: Set<string>): number {
  const total = ACHIEVEMENTS.length;
  const earned = getEarnedAchievementCount(earnedIds);
  return Math.round((earned / total) * 100);
}
