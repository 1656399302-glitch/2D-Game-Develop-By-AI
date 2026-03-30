/**
 * Challenge Types for Arcane Machine Codex Workshop
 * 
 * This file contains type definitions for challenges.
 * The actual challenge data is in src/data/challenges.ts (CHALLENGE_DEFINITIONS).
 */

import { Rarity, ModuleType } from './index';

/**
 * Challenge difficulty levels
 * Used in ChallengeDefinition from src/data/challenges.ts
 */
export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Requirements for completing a validation-based challenge
 * (Legacy system - not used in current progress-based challenges)
 */
export interface ChallengeRequirement {
  /** Minimum number of modules in the machine */
  minModules?: number;
  /** Maximum number of modules allowed */
  maxModules?: number;
  /** Minimum number of connections */
  minConnections?: number;
  /** Maximum number of connections allowed */
  maxConnections?: number;
  /** Required attribute tags (at least one must be present) */
  requiredTags?: string[];
  /** Required rarity level or higher */
  requiredRarity?: Rarity;
  /** Specific module types that must be present */
  specificModuleTypes?: ModuleType[];
  /** All tags in this array must be present */
  allTags?: string[];
  /** Maximum failure rate percentage */
  maxFailureRate?: number;
  /** Minimum stability percentage */
  minStability?: number;
}

/**
 * Reward structure for completed challenges
 * (Legacy system - not used in current progress-based challenges)
 */
export interface ChallengeReward {
  /** Type of reward */
  type: 'badge' | 'title' | 'unlock';
  /** Reward identifier */
  id: string;
  /** Display name of the reward */
  displayName: string;
  /** Description of the reward */
  description: string;
}

/**
 * A validation-based challenge (Legacy)
 * @deprecated Use CHALLENGE_DEFINITIONS from src/data/challenges.ts with progress-based challenges
 */
export interface Challenge {
  /** Unique identifier */
  id: string;
  /** Challenge title */
  title: string;
  /** Detailed description of the challenge */
  description: string;
  /** Difficulty level */
  difficulty: ChallengeDifficulty;
  /** Requirements to complete this challenge */
  requirements: ChallengeRequirement;
  /** Reward for completing this challenge */
  reward: ChallengeReward;
}

/**
 * Validation result for a challenge
 */
export interface ValidationResult {
  /** Whether the machine passed all requirements */
  passed: boolean;
  /** Individual requirement check results */
  details: RequirementDetail[];
}

/**
 * Individual requirement check result
 */
export interface RequirementDetail {
  /** Description of the requirement */
  requirement: string;
  /** Whether this requirement was met */
  met: boolean;
  /** Actual value found (can be string, number, or array of strings) */
  actualValue: string | number | string[];
  /** Expected value (can be string, number, or array of strings) */
  expectedValue: string | number | string[];
}

/**
 * Get difficulty color for styling
 * @deprecated Use getChallengeDifficultyColor from src/data/challenges.ts
 */
export function getDifficultyColor(difficulty: ChallengeDifficulty): string {
  const colors: Record<ChallengeDifficulty, string> = {
    beginner: '#22c55e',
    intermediate: '#3b82f6',
    advanced: '#a855f7',
  };
  return colors[difficulty];
}

/**
 * Get difficulty label for display
 * @deprecated Use getChallengeDifficultyLabel from src/data/challenges.ts
 */
export function getDifficultyLabel(difficulty: ChallengeDifficulty): string {
  const labels: Record<ChallengeDifficulty, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  return labels[difficulty];
}

/**
 * Check if rarity meets requirement
 * Rarity meets requirement if machine rarity >= required rarity
 */
export function rarityMeetsRequirement(machineRarity: Rarity, requiredRarity: Rarity): boolean {
  const rarityOrder: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const machineIndex = rarityOrder.indexOf(machineRarity);
  const requiredIndex = rarityOrder.indexOf(requiredRarity);
  return machineIndex >= requiredIndex;
}

/**
 * Validate a machine against challenge requirements
 */
export function validateChallengeRequirements(
  machine: {
    modules: unknown[];
    connections: unknown[];
    tags?: string[];
    rarity?: Rarity;
  },
  requirements: ChallengeRequirement
): ValidationResult {
  const details: RequirementDetail[] = [];
  let passed = true;

  // Check module count
  if (requirements.minModules !== undefined) {
    const met = (machine.modules?.length || 0) >= requirements.minModules;
    details.push({
      requirement: `Minimum ${requirements.minModules} modules`,
      met,
      actualValue: machine.modules?.length || 0,
      expectedValue: requirements.minModules,
    });
    if (!met) passed = false;
  }

  if (requirements.maxModules !== undefined) {
    const met = (machine.modules?.length || 0) <= requirements.maxModules;
    details.push({
      requirement: `Maximum ${requirements.maxModules} modules`,
      met,
      actualValue: machine.modules?.length || 0,
      expectedValue: requirements.maxModules,
    });
    if (!met) passed = false;
  }

  // Check connection count
  if (requirements.minConnections !== undefined) {
    const met = (machine.connections?.length || 0) >= requirements.minConnections;
    details.push({
      requirement: `Minimum ${requirements.minConnections} connections`,
      met,
      actualValue: machine.connections?.length || 0,
      expectedValue: requirements.minConnections,
    });
    if (!met) passed = false;
  }

  if (requirements.maxConnections !== undefined) {
    const met = (machine.connections?.length || 0) <= requirements.maxConnections;
    details.push({
      requirement: `Maximum ${requirements.maxConnections} connections`,
      met,
      actualValue: machine.connections?.length || 0,
      expectedValue: requirements.maxConnections,
    });
    if (!met) passed = false;
  }

  // Check required tags
  if (requirements.requiredTags && requirements.requiredTags.length > 0) {
    const machineTags = machine.tags || [];
    const matchedTags = requirements.requiredTags.filter(tag => machineTags.includes(tag));
    const hasAnyTag = matchedTags.length > 0;
    details.push({
      requirement: `Required at least one of: ${requirements.requiredTags.join(', ')}`,
      met: hasAnyTag,
      actualValue: matchedTags.length > 0 ? matchedTags.join(', ') : '(none)',
      expectedValue: requirements.requiredTags.join(', '),
    });
    if (!hasAnyTag) passed = false;
  }

  // Check rarity
  if (requirements.requiredRarity && machine.rarity) {
    const met = rarityMeetsRequirement(machine.rarity, requirements.requiredRarity);
    details.push({
      requirement: `Required rarity: ${requirements.requiredRarity} or higher`,
      met,
      actualValue: machine.rarity,
      expectedValue: requirements.requiredRarity,
    });
    if (!met) passed = false;
  }

  return { passed, details };
}
