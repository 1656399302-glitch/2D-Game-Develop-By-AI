/**
 * Time Trial Challenge Definitions
 * 
 * Timed challenge variants with scoring, difficulty multipliers, and objectives.
 */

import { 
  TimeTrialChallenge, 
  TimeTrialDifficulty,
  getDifficultyMultiplier,
} from '../types/challenge';

/**
 * Time Trial Challenge Definitions
 * 
 * 12 challenges across 4 difficulties:
 * - Easy (3): Quick challenges with generous time limits
 * - Normal (3): Standard challenges requiring some skill
 * - Hard (3): Challenging time limits requiring optimization
 * - Extreme (3): Very tight time limits requiring mastery
 */
export const TIME_TRIAL_CHALLENGES: TimeTrialChallenge[] = [
  // ===== EASY CHALLENGES (3) =====
  {
    id: 'time-trial-quick-build',
    title: '快速建造',
    description: '在规定时间内创建一台基础机器',
    timeLimit: 180, // 3 minutes
    difficulty: 'easy',
    baseReward: 100,
    rewardMultiplier: getDifficultyMultiplier('easy'),
    objectives: [
      { id: 'create_machine', type: 'create_machine', description: '创建至少1台机器', target: 1 },
    ],
    targets: { create_machine: 1 },
  },
  {
    id: 'time-trial-stability-seeker',
    title: '稳定追寻者',
    description: '创建一台稳定性达到50%以上的机器',
    timeLimit: 240, // 4 minutes
    difficulty: 'easy',
    baseReward: 150,
    rewardMultiplier: getDifficultyMultiplier('easy'),
    objectives: [
      { id: 'reach_stability', type: 'reach_stability', description: '达到50%稳定性', target: 50 },
    ],
    targets: { reach_stability: 50 },
  },
  {
    id: 'time-trial-connection-master',
    title: '连接大师',
    description: '建立3条能量连接',
    timeLimit: 300, // 5 minutes
    difficulty: 'easy',
    baseReward: 200,
    rewardMultiplier: getDifficultyMultiplier('easy'),
    objectives: [
      { id: 'create_connections', type: 'create_connections', description: '创建3条连接', target: 3 },
    ],
    targets: { create_connections: 3 },
  },

  // ===== NORMAL CHALLENGES (3) =====
  {
    id: 'time-trial-efficiency-expert',
    title: '效率专家',
    description: '创建一台包含5个以上模块且连接完整的机器',
    timeLimit: 300, // 5 minutes
    difficulty: 'normal',
    baseReward: 300,
    rewardMultiplier: getDifficultyMultiplier('normal'),
    objectives: [
      { id: 'use_module_count', type: 'use_module_count', description: '使用至少5个模块', target: 5 },
      { id: 'create_connections', type: 'create_connections', description: '创建至少4条连接', target: 4 },
    ],
    targets: { use_module_count: 5, create_connections: 4 },
  },
  {
    id: 'time-trial-balanced-builder',
    title: '平衡建造者',
    description: '创建一台稳定性达到70%以上且包含核心炉心的机器',
    timeLimit: 360, // 6 minutes
    difficulty: 'normal',
    baseReward: 400,
    rewardMultiplier: getDifficultyMultiplier('normal'),
    objectives: [
      { id: 'reach_stability', type: 'reach_stability', description: '达到70%稳定性', target: 70 },
    ],
    targets: { reach_stability: 70 },
  },
  {
    id: 'time-trial-rarity-hunter',
    title: '稀有猎人',
    description: '生成一台稀有或更高稀有度的机器',
    timeLimit: 420, // 7 minutes
    difficulty: 'normal',
    baseReward: 500,
    rewardMultiplier: getDifficultyMultiplier('normal'),
    objectives: [
      { id: 'reach_rarity', type: 'reach_rarity', description: '达到稀有品质', target: 3 }, // 3 = rare
    ],
    targets: { reach_rarity: 3 },
  },

  // ===== HARD CHALLENGES (3) =====
  {
    id: 'time-trial-speed-optimization',
    title: '速度优化',
    description: '创建一台包含8个模块且稳定性达到80%以上的机器',
    timeLimit: 480, // 8 minutes
    difficulty: 'hard',
    baseReward: 600,
    rewardMultiplier: getDifficultyMultiplier('hard'),
    objectives: [
      { id: 'use_module_count', type: 'use_module_count', description: '使用至少8个模块', target: 8 },
      { id: 'reach_stability', type: 'reach_stability', description: '达到80%稳定性', target: 80 },
    ],
    targets: { use_module_count: 8, reach_stability: 80 },
  },
  {
    id: 'time-trial-output-champion',
    title: '输出冠军',
    description: '创建一台输出达到150以上的机器',
    timeLimit: 540, // 9 minutes
    difficulty: 'hard',
    baseReward: 700,
    rewardMultiplier: getDifficultyMultiplier('hard'),
    objectives: [
      { id: 'reach_output', type: 'reach_output', description: '输出达到150以上', target: 150 },
    ],
    targets: { reach_output: 150 },
  },
  {
    id: 'time-trial-complex-master',
    title: '复杂大师',
    description: '创建一台包含10个模块且有6条以上连接的机器',
    timeLimit: 600, // 10 minutes
    difficulty: 'hard',
    baseReward: 800,
    rewardMultiplier: getDifficultyMultiplier('hard'),
    objectives: [
      { id: 'use_module_count', type: 'use_module_count', description: '使用至少10个模块', target: 10 },
      { id: 'create_connections', type: 'create_connections', description: '创建至少6条连接', target: 6 },
    ],
    targets: { use_module_count: 10, create_connections: 6 },
  },

  // ===== EXTREME CHALLENGES (3) =====
  {
    id: 'time-trial-legendary-builder',
    title: '传奇建造者',
    description: '在极限时间内生成一台传奇稀有度的机器',
    timeLimit: 600, // 10 minutes
    difficulty: 'extreme',
    baseReward: 1000,
    rewardMultiplier: getDifficultyMultiplier('extreme'),
    objectives: [
      { id: 'reach_rarity', type: 'reach_rarity', description: '达到传奇稀有度', target: 5 }, // 5 = legendary
    ],
    targets: { reach_rarity: 5 },
  },
  {
    id: 'time-trial-ultimate-challenge',
    title: '终极挑战',
    description: '创建一台包含12个模块、8条连接、稳定性90%以上的完美机器',
    timeLimit: 720, // 12 minutes
    difficulty: 'extreme',
    baseReward: 1200,
    rewardMultiplier: getDifficultyMultiplier('extreme'),
    objectives: [
      { id: 'use_module_count', type: 'use_module_count', description: '使用至少12个模块', target: 12 },
      { id: 'create_connections', type: 'create_connections', description: '创建至少8条连接', target: 8 },
      { id: 'reach_stability', type: 'reach_stability', description: '达到90%稳定性', target: 90 },
    ],
    targets: { use_module_count: 12, create_connections: 8, reach_stability: 90 },
  },
  {
    id: 'time-trial-perfectionist',
    title: '完美主义者',
    description: '创建一台传奇稀有度、12个模块、稳定性95%以上的究极机器',
    timeLimit: 900, // 15 minutes
    difficulty: 'extreme',
    baseReward: 1500,
    rewardMultiplier: getDifficultyMultiplier('extreme'),
    objectives: [
      { id: 'reach_rarity', type: 'reach_rarity', description: '达到传奇稀有度', target: 5 },
      { id: 'use_module_count', type: 'use_module_count', description: '使用至少12个模块', target: 12 },
      { id: 'reach_stability', type: 'reach_stability', description: '达到95%稳定性', target: 95 },
    ],
    targets: { reach_rarity: 5, use_module_count: 12, reach_stability: 95 },
  },
];

/**
 * Get time trial challenge by ID
 */
export function getTimeTrialById(id: string): TimeTrialChallenge | undefined {
  return TIME_TRIAL_CHALLENGES.find((c) => c.id === id);
}

/**
 * Get time trials by difficulty
 */
export function getTimeTrialsByDifficulty(
  difficulty: TimeTrialDifficulty
): TimeTrialChallenge[] {
  return TIME_TRIAL_CHALLENGES.filter((c) => c.difficulty === difficulty);
}

/**
 * Get time trials by category
 */
export function getTimeTrialsByCategory(): Record<TimeTrialDifficulty, TimeTrialChallenge[]> {
  return {
    easy: getTimeTrialsByDifficulty('easy'),
    normal: getTimeTrialsByDifficulty('normal'),
    hard: getTimeTrialsByDifficulty('hard'),
    extreme: getTimeTrialsByDifficulty('extreme'),
  };
}

/**
 * Get total count of time trial challenges
 */
export function getTimeTrialCount(): number {
  return TIME_TRIAL_CHALLENGES.length;
}

/**
 * Get count by difficulty
 */
export function getTimeTrialCountByDifficulty(): Record<TimeTrialDifficulty, number> {
  return {
    easy: getTimeTrialsByDifficulty('easy').length,
    normal: getTimeTrialsByDifficulty('normal').length,
    hard: getTimeTrialsByDifficulty('hard').length,
    extreme: getTimeTrialsByDifficulty('extreme').length,
  };
}

export default TIME_TRIAL_CHALLENGES;
