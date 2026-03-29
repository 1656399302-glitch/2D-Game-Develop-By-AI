import { Rarity, ModuleType } from './index';

/**
 * Challenge difficulty levels
 */
export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'master';

/**
 * Requirements for completing a challenge
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
 * A challenge that users can complete
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
  /** Actual value found */
  actualValue: string | number;
  /** Expected value */
  expectedValue: string | number;
}

/**
 * Get difficulty color for styling
 */
export function getDifficultyColor(difficulty: ChallengeDifficulty): string {
  const colors: Record<ChallengeDifficulty, string> = {
    beginner: '#22c55e',
    intermediate: '#3b82f6',
    advanced: '#a855f7',
    master: '#f59e0b',
  };
  return colors[difficulty];
}

/**
 * Get difficulty label for display
 */
export function getDifficultyLabel(difficulty: ChallengeDifficulty): string {
  const labels: Record<ChallengeDifficulty, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    master: 'Master',
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
 * 8 Preset Challenges
 */
export const CHALLENGES: Challenge[] = [
  // BEGINNER (2 challenges)
  {
    id: 'ch-1',
    title: 'First Steps',
    description: 'Create your first machine by placing at least 3 modules. Every great invention starts with a simple foundation.',
    difficulty: 'beginner',
    requirements: {
      minModules: 3,
    },
    reward: {
      type: 'badge',
      id: 'first-steps',
      displayName: 'First Steps Badge',
      description: 'Awarded for creating your first machine with 3+ modules.',
    },
  },
  {
    id: 'ch-2',
    title: 'Connection Master',
    description: 'Connect your modules together. A machine is more than just parts—it needs energy flowing between them.',
    difficulty: 'beginner',
    requirements: {
      minModules: 2,
      minConnections: 2,
    },
    reward: {
      type: 'badge',
      id: 'connection-master',
      displayName: 'Connection Master Badge',
      description: 'Awarded for creating a machine with 2+ connections.',
    },
  },

  // INTERMEDIATE (2 challenges)
  {
    id: 'ch-3',
    title: 'Elemental Attuned',
    description: 'Harness the power of elemental attributes. Create a machine with fire, lightning, or arcane tags.',
    difficulty: 'intermediate',
    requirements: {
      minModules: 4,
      requiredTags: ['fire', 'lightning', 'arcane'],
    },
    reward: {
      type: 'badge',
      id: 'elemental-attuned',
      displayName: 'Elemental Attuned Badge',
      description: 'Awarded for creating a machine with elemental tags.',
    },
  },
  {
    id: 'ch-4',
    title: 'Balanced Design',
    description: 'Build a stable machine that won\'t explode in your face. Create something with at least 60% stability.',
    difficulty: 'intermediate',
    requirements: {
      minModules: 3,
      minStability: 60,
    },
    reward: {
      type: 'badge',
      id: 'balanced-design',
      displayName: 'Balanced Design Badge',
      description: 'Awarded for creating a machine with high stability.',
    },
  },

  // ADVANCED (2 challenges)
  {
    id: 'ch-5',
    title: 'Core Specialist',
    description: 'Master the core modules. Create a machine using both the Core Furnace and the Stabilizer Core.',
    difficulty: 'advanced',
    requirements: {
      minModules: 4,
      specificModuleTypes: ['core-furnace', 'stabilizer-core'],
      minConnections: 2,
    },
    reward: {
      type: 'badge',
      id: 'core-specialist',
      displayName: 'Core Specialist Badge',
      description: 'Awarded for mastering core modules.',
    },
  },
  {
    id: 'ch-6',
    title: 'Rare Collection',
    description: 'Craft a machine worthy of the arcane codices. Reach rare rarity or higher through complex construction.',
    difficulty: 'advanced',
    requirements: {
      minModules: 5,
      minConnections: 3,
      requiredRarity: 'rare',
    },
    reward: {
      type: 'badge',
      id: 'rare-collection',
      displayName: 'Rare Collection Badge',
      description: 'Awarded for creating a rare-quality machine.',
    },
  },

  // MASTER (2 challenges)
  {
    id: 'ch-7',
    title: 'Void Walker',
    description: 'Tap into forbidden dimensions. Include the Void Siphon module to channel the power of the void.',
    difficulty: 'master',
    requirements: {
      specificModuleTypes: ['void-siphon'],
      minConnections: 3,
    },
    reward: {
      type: 'badge',
      id: 'void-walker',
      displayName: 'Void Walker Badge',
      description: 'Awarded for mastering void energy.',
    },
  },
  {
    id: 'ch-8',
    title: 'Legendary Architect',
    description: 'Build the ultimate machine. Create a legendary rarity creation with 8+ modules and 6+ connections.',
    difficulty: 'master',
    requirements: {
      minModules: 8,
      minConnections: 6,
      requiredRarity: 'legendary',
    },
    reward: {
      type: 'title',
      id: 'legendary-architect',
      displayName: 'Legendary Architect Title',
      description: 'You have proven yourself a master of arcane engineering.',
    },
  },
];

export default CHALLENGES;
