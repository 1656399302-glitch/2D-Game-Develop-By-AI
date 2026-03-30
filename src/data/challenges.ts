/**
 * Challenge Definitions for Arcane Machine Codex Workshop
 * 
 * This file contains the centralized challenge definitions for the Challenge Mode system.
 * Challenges are organized by category and difficulty tier.
 * 
 * 16 total challenges: Creation(4), Collection(3), Activation(4), Mastery(5)
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
 * Get category icon for display
 */
export function getChallengeCategoryIcon(category: ChallengeCategory): string {
  const icons: Record<ChallengeCategory, string> = {
    creation: '🔨',
    collection: '📚',
    activation: '⚡',
    mastery: '🎯',
  };
  return icons[category];
}

/**
 * 16 Challenge Definitions
 * Category distribution: Creation(4) + Collection(3) + Activation(4) + Mastery(5) = 16
 * Difficulty distribution: Beginner(4) + Intermediate(5) + Advanced(7)
 * 
 * NOTE: void-initiate is in mastery category (moved from creation per Round 19 contract)
 */
export const CHALLENGE_DEFINITIONS: ChallengeDefinition[] = [
  // BEGINNER (4 challenges)
  {
    id: 'first-machine',
    title: '初代锻造',
    description: '创建你的第一台机器，开启魔法机械师的旅程',
    category: 'creation',
    difficulty: 'beginner',
    target: 1,
    reward: {
      type: 'xp',
      value: 100,
      displayName: '+100 XP',
      description: '用于创建第一台机器',
    },
  },
  {
    id: 'codex-entry',
    title: '图鉴收藏家',
    description: '将3台机器保存到图鉴中，成为真正的收藏家',
    category: 'collection',
    difficulty: 'beginner',
    target: 3,
    reward: {
      type: 'xp',
      value: 50,
      displayName: '+50 XP',
      description: '用于保存机器到图鉴',
    },
  },
  {
    id: 'arcane-artist',
    title: '奥术艺术家',
    description: '创建3台具有独特视觉风格的机器',
    category: 'creation',
    difficulty: 'beginner',
    target: 3,
    reward: {
      type: 'xp',
      value: 75,
      displayName: '+75 XP',
      description: '用于创作独特风格的机器',
    },
  },
  {
    id: 'connection-king',
    title: '连接之王',
    description: '建立5条能量连接，掌握能量流动的奥秘',
    category: 'mastery',
    difficulty: 'beginner',
    target: 5,
    reward: {
      type: 'xp',
      value: 75,
      displayName: '+75 XP',
      description: '用于掌握能量连接',
    },
  },

  // INTERMEDIATE (5 challenges)
  {
    id: 'golden-gear',
    title: '黄金齿轮',
    description: '创建一台包含5个以上齿轮的机器，展现机械之美',
    category: 'creation',
    difficulty: 'intermediate',
    target: 5,
    reward: {
      type: 'badge',
      value: 'golden-gear',
      displayName: '黄金齿轮徽章',
      description: '授予掌握齿轮机械的大师',
    },
  },
  {
    id: 'stability-master',
    title: '稳定大师',
    description: '创建一台稳定性达到95%以上的机器',
    category: 'mastery',
    difficulty: 'intermediate',
    target: 95,
    reward: {
      type: 'recipe',
      value: 'recipe-resonance-chamber',
      displayName: '共振室配方',
      description: '解锁共振室模块配方',
    },
  },
  {
    id: 'rare-collector',
    title: '稀有收藏家',
    description: '收集3台稀有或更高稀有度的机器',
    category: 'collection',
    difficulty: 'intermediate',
    target: 3,
    reward: {
      type: 'xp',
      value: 150,
      displayName: '+150 XP',
      description: '用于收集稀有机器',
    },
  },
  {
    id: 'overload-specialist',
    title: '过载专家',
    description: '触发一次过载效果，掌握能量的极限',
    category: 'activation',
    difficulty: 'intermediate',
    target: 1,
    reward: {
      type: 'recipe',
      value: 'recipe-lightning-conductor',
      displayName: '闪电导体配方',
      description: '解锁闪电导体模块配方',
    },
  },
  {
    id: 'void-initiate',
    title: '虚空入门',
    description: '使用一次虚空虹吸模块，探索虚空维度的力量',
    category: 'mastery',  // Changed from 'creation' to 'mastery' per Round 19 contract
    difficulty: 'intermediate',
    target: 1,
    reward: {
      type: 'xp',
      value: 200,
      displayName: '+200 XP',
      description: '用于首次接触虚空能量',
    },
  },

  // ADVANCED (7 challenges)
  {
    id: 'efficiency-expert',
    title: '效率专家',
    description: '创建一台能效达到90%以上的机器',
    category: 'mastery',
    difficulty: 'advanced',
    target: 90,
    reward: {
      type: 'xp',
      value: 200,
      displayName: '+200 XP',
      description: '用于优化机器效率',
    },
  },
  {
    id: 'inferno-master',
    title: '熔岩大师',
    description: '使用一次熔岩晶体模块，掌握火焰之力',
    category: 'activation',
    difficulty: 'advanced',
    target: 1,
    reward: {
      type: 'recipe',
      value: 'recipe-fire-crystal',
      displayName: '熔岩晶体配方',
      description: '解锁熔岩晶体模块配方',
    },
  },
  {
    id: 'stellar-harmony',
    title: '星辉和谐',
    description: '收集3台星辉派系机器，感受星辰的力量',
    category: 'collection',
    difficulty: 'advanced',
    target: 3,
    reward: {
      type: 'xp',
      value: 300,
      displayName: '+300 XP',
      description: '用于探索星辉派系',
    },
  },
  {
    id: 'legendary-forge',
    title: '传说锻造师',
    description: '创建10台传奇机器，登峰造极',
    category: 'creation',
    difficulty: 'advanced',
    target: 10,
    reward: {
      type: 'badge',
      value: 'legendary-forge',
      displayName: '传说锻造师徽章',
      description: '授予传奇机器的创造者',
    },
  },
  {
    id: 'activation-king',
    title: '激活之王',
    description: '成功激活机器50次，成为激活大师',
    category: 'activation',
    difficulty: 'advanced',
    target: 50,
    reward: {
      type: 'xp',
      value: 500,
      displayName: '+500 XP',
      description: '用于掌握机器激活',
    },
  },
  {
    id: 'speed-demon',
    title: '速度恶魔',
    description: '在时间-trial模式中完成挑战',
    category: 'activation',
    difficulty: 'advanced',
    target: 1,
    reward: {
      type: 'xp',
      value: 400,
      displayName: '+400 XP',
      description: '用于时间挑战',
    },
  },
  {
    id: 'master-architect',
    title: '大师建筑师',
    description: '使用8种以上不同模块类型创建机器',
    category: 'mastery',
    difficulty: 'advanced',
    target: 8,
    reward: {
      type: 'badge',
      value: 'master-architect',
      displayName: '大师建筑师徽章',
      description: '授予建筑大师',
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

/**
 * Get challenge count by category
 */
export function getChallengeCountByCategory(): Record<ChallengeCategory, number> {
  return {
    creation: CHALLENGE_DEFINITIONS.filter(c => c.category === 'creation').length,
    collection: CHALLENGE_DEFINITIONS.filter(c => c.category === 'collection').length,
    activation: CHALLENGE_DEFINITIONS.filter(c => c.category === 'activation').length,
    mastery: CHALLENGE_DEFINITIONS.filter(c => c.category === 'mastery').length,
  };
}

export default CHALLENGE_DEFINITIONS;
