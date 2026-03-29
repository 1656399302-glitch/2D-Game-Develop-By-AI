/**
 * Challenge Definitions for Arcane Machine Codex Workshop
 * 
 * This file contains the centralized challenge definitions for the Challenge Mode system.
 * Challenges are organized by category and difficulty tier.
 */

/**
 * Challenge categories
 */
export type ChallengeCategory = 'creation' | 'collection' | 'activation' | 'mastery';

/**
 * Challenge difficulty tiers
 */
export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Challenge reward types
 */
export type ChallengeRewardType = 'xp' | 'recipe' | 'badge';

/**
 * Challenge reward structure
 */
export interface ChallengeReward {
  type: ChallengeRewardType;
  value: string | number;
  displayName: string;
  description: string;
}

/**
 * Challenge unlock condition
 */
export interface ChallengeUnlockCondition {
  type: 'count' | 'achievement' | 'recipe_unlocked';
  value: number | string;
}

/**
 * Challenge definition
 */
export interface ChallengeDefinition {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  target: number;
  reward: ChallengeReward;
}

/**
 * Get difficulty color for styling
 */
export function getChallengeDifficultyColor(difficulty: ChallengeDifficulty): string {
  const colors: Record<ChallengeDifficulty, string> = {
    beginner: '#22c55e',
    intermediate: '#3b82f6',
    advanced: '#a855f7',
  };
  return colors[difficulty];
}

/**
 * Get difficulty label for display (Chinese)
 */
export function getChallengeDifficultyLabel(difficulty: ChallengeDifficulty): string {
  const labels: Record<ChallengeDifficulty, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
  };
  return labels[difficulty];
}

/**
 * Get category label for display (Chinese)
 */
export function getChallengeCategoryLabel(category: ChallengeCategory): string {
  const labels: Record<ChallengeCategory, string> = {
    creation: '创造',
    collection: '收集',
    activation: '激活',
    mastery: '精通',
  };
  return labels[category];
}

/**
 * 8 Challenge Definitions as per contract
 */
export const CHALLENGE_DEFINITIONS: ChallengeDefinition[] = [
  // BEGINNER (3 challenges)
  {
    id: 'first-machine',
    title: '初代锻造',
    description: 'Create your first machine',
    category: 'creation',
    difficulty: 'beginner',
    target: 1,
    reward: {
      type: 'xp',
      value: 100,
      displayName: '+100 XP',
      description: 'Awarded for creating your first machine',
    },
  },
  {
    id: 'energy-master',
    title: '能量大师',
    description: 'Connect 5 energy paths',
    category: 'mastery',
    difficulty: 'beginner',
    target: 5,
    reward: {
      type: 'recipe',
      value: 'recipe-fire-crystal',
      displayName: 'Fire Crystal Recipe',
      description: 'Unlocks the Fire Crystal module recipe',
    },
  },
  {
    id: 'codex-entry',
    title: '图鉴收藏家',
    description: 'Save 3 machines to the codex',
    category: 'collection',
    difficulty: 'beginner',
    target: 3,
    reward: {
      type: 'xp',
      value: 50,
      displayName: '+50 XP',
      description: 'Awarded for saving machines to your codex',
    },
  },

  // INTERMEDIATE (3 challenges)
  {
    id: 'golden-gear',
    title: '黄金齿轮',
    description: 'Create a machine with 5+ gears',
    category: 'creation',
    difficulty: 'intermediate',
    target: 5,
    reward: {
      type: 'badge',
      value: 'golden-gear',
      displayName: 'Golden Gear Badge',
      description: 'Awarded for mastering gear-based machines',
    },
  },
  {
    id: 'overload-specialist',
    title: '过载专家',
    description: 'Trigger an overload effect',
    category: 'activation',
    difficulty: 'intermediate',
    target: 1,
    reward: {
      type: 'recipe',
      value: 'recipe-lightning-conductor',
      displayName: 'Lightning Conductor Recipe',
      description: 'Unlocks the Lightning Conductor module recipe',
    },
  },
  {
    id: 'stability-master',
    title: '稳定大师',
    description: 'Create a machine with 95%+ stability',
    category: 'mastery',
    difficulty: 'intermediate',
    target: 95,
    reward: {
      type: 'recipe',
      value: 'recipe-resonance-chamber',
      displayName: 'Resonance Chamber Recipe',
      description: 'Unlocks the Resonance Chamber module recipe',
    },
  },

  // ADVANCED (2 challenges)
  {
    id: 'legendary-forge',
    title: '传说锻造师',
    description: 'Create 10 machines',
    category: 'creation',
    difficulty: 'advanced',
    target: 10,
    reward: {
      type: 'badge',
      value: 'legendary-forge',
      displayName: 'Legendary Forge Badge',
      description: 'Awarded for creating legendary machines',
    },
  },
  {
    id: 'activation-king',
    title: '激活之王',
    description: 'Activate machines 50 times',
    category: 'activation',
    difficulty: 'advanced',
    target: 50,
    reward: {
      type: 'xp',
      value: 500,
      displayName: '+500 XP',
      description: 'Awarded for mastering machine activation',
    },
  },
];

/**
 * Get challenge by ID
 */
export function getChallengeById(id: string): ChallengeDefinition | undefined {
  return CHALLENGE_DEFINITIONS.find(c => c.id === id);
}

/**
 * Get challenges by category
 */
export function getChallengesByCategory(category: ChallengeCategory): ChallengeDefinition[] {
  return CHALLENGE_DEFINITIONS.filter(c => c.category === category);
}

/**
 * Get challenges by difficulty
 */
export function getChallengesByDifficulty(difficulty: ChallengeDifficulty): ChallengeDefinition[] {
  return CHALLENGE_DEFINITIONS.filter(c => c.difficulty === difficulty);
}

export default CHALLENGE_DEFINITIONS;
