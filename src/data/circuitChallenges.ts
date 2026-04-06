/**
 * Circuit Challenge Definitions
 * 
 * Round 175: Circuit Challenge System Integration
 * 
 * This file contains circuit-specific challenges that players can solve
 * using the circuit canvas. Challenges define input/output specs using
 * the ChallengeObjective[] format from src/types/challenge.ts.
 */

import { ChallengeObjective, OutputState } from '../types/challenge';

/**
 * Circuit challenge difficulty tiers
 */
export type CircuitChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Input node configuration for a challenge
 */
export interface ChallengeInputConfig {
  id: string;
  label: string;
  defaultState: boolean;
}

/**
 * Circuit challenge definition
 */
export interface CircuitChallenge {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Detailed description */
  description: string;
  /** Difficulty tier */
  difficulty: CircuitChallengeDifficulty;
  /** Estimated number of gates needed */
  estimatedGateCount: number;
  /** Challenge objectives with output targets */
  objectives: ChallengeObjective[];
  /** Input node configurations for setup */
  inputConfigs: ChallengeInputConfig[];
  /** Hint text for players */
  hint: string;
  /** Points awarded for completion */
  totalPoints: number;
}

/**
 * Get difficulty color for styling
 */
export function getCircuitChallengeDifficultyColor(difficulty: CircuitChallengeDifficulty): string {
  const colors: Record<CircuitChallengeDifficulty, string> = {
    beginner: '#22c55e',   // green
    intermediate: '#3b82f6', // blue
    advanced: '#a855f7',     // purple
  };
  return colors[difficulty];
}

/**
 * Get difficulty label for display (Chinese)
 */
export function getCircuitChallengeDifficultyLabel(difficulty: CircuitChallengeDifficulty): string {
  const labels: Record<CircuitChallengeDifficulty, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
  };
  return labels[difficulty];
}

/**
 * Create output target configuration
 */
function createOutputTarget(
  nodeId: string,
  name: string,
  expectedState: OutputState
): { nodeId: string; name: string; expectedState: OutputState } {
  return { nodeId, name, expectedState };
}

/**
 * Circuit Challenge Definitions
 * 
 * 5 challenges total: Beginner(2), Intermediate(2), Advanced(1)
 */
export const CIRCUIT_CHALLENGES: CircuitChallenge[] = [
  // ===== BEGINNER CHALLENGES (2) =====
  {
    id: 'circuit-b-001',
    title: '恒高输出',
    description: '创建一个电路，使输出节点始终输出 HIGH（高电平）。这是一个最简单的挑战，用于熟悉电路画布。',
    difficulty: 'beginner',
    estimatedGateCount: 1,
    totalPoints: 100,
    hint: '提示：使用一个 NOT（非）门，将输入连接到 NOT 门，然后将 NOT 门连接到输出。NOT 门将反转输入信号。',
    inputConfigs: [
      { id: 'input-1', label: '输入 A', defaultState: false },
    ],
    objectives: [
      {
        id: 'obj-output-high',
        name: '输出 HIGH',
        description: '输出节点必须输出 HIGH',
        objectiveType: 'output',
        priority: 1,
        points: 100,
        outputTarget: createOutputTarget('output-1', '输出', 'HIGH'),
      },
    ],
  },

  {
    id: 'circuit-b-002',
    title: '直接传递',
    description: '创建一个电路，使输出直接反映输入状态。输入 HIGH 时输出 HIGH，输入 LOW 时输出 LOW。',
    difficulty: 'beginner',
    estimatedGateCount: 0,
    totalPoints: 100,
    hint: '提示：直接用导线将输入连接到输出即可。也可以使用一个 Buffer（缓冲器）或直接连接。',
    inputConfigs: [
      { id: 'input-1', label: '输入 A', defaultState: false },
    ],
    objectives: [
      {
        id: 'obj-output-match',
        name: '输出匹配输入',
        description: '输出必须与输入状态一致',
        objectiveType: 'output',
        priority: 1,
        points: 100,
        outputTarget: createOutputTarget('output-1', '输出', 'LOW'),
      },
    ],
  },

  // ===== INTERMEDIATE CHALLENGES (2) =====
  {
    id: 'circuit-i-001',
    title: 'AND 逻辑门',
    description: '创建一个 AND（与）门电路。两个输入都为 HIGH 时输出才为 HIGH。',
    difficulty: 'intermediate',
    estimatedGateCount: 1,
    totalPoints: 200,
    hint: '提示：使用一个 AND 门，将输入 A 连接到 AND 的第一个输入端，输入 B 连接到第二个输入端，然后将 AND 的输出连接到输出节点。',
    inputConfigs: [
      { id: 'input-1', label: '输入 A', defaultState: false },
      { id: 'input-2', label: '输入 B', defaultState: false },
    ],
    objectives: [
      {
        id: 'obj-and-low-low',
        name: 'LOW-LOW → LOW',
        description: '当两个输入都为 LOW 时，输出必须为 LOW',
        objectiveType: 'output',
        priority: 1,
        points: 50,
        outputTarget: createOutputTarget('output-1', '输出', 'LOW'),
      },
      {
        id: 'obj-and-high-low',
        name: 'HIGH-LOW → LOW',
        description: '当一个输入为 HIGH、一个为 LOW 时，输出必须为 LOW',
        objectiveType: 'output',
        priority: 2,
        points: 50,
        outputTarget: createOutputTarget('output-1', '输出', 'LOW'),
      },
      {
        id: 'obj-and-high-high',
        name: 'HIGH-HIGH → HIGH',
        description: '当两个输入都为 HIGH 时，输出必须为 HIGH',
        objectiveType: 'output',
        priority: 3,
        points: 100,
        outputTarget: createOutputTarget('output-1', '输出', 'HIGH'),
      },
    ],
  },

  {
    id: 'circuit-i-002',
    title: 'OR 逻辑门',
    description: '创建一个 OR（或）门电路。任意一个输入为 HIGH 时输出就为 HIGH。',
    difficulty: 'intermediate',
    estimatedGateCount: 1,
    totalPoints: 200,
    hint: '提示：使用一个 OR 门，将输入 A 连接到 OR 的第一个输入端，输入 B 连接到第二个输入端，然后将 OR 的输出连接到输出节点。',
    inputConfigs: [
      { id: 'input-1', label: '输入 A', defaultState: false },
      { id: 'input-2', label: '输入 B', defaultState: false },
    ],
    objectives: [
      {
        id: 'obj-or-low-low',
        name: 'LOW-LOW → LOW',
        description: '当两个输入都为 LOW 时，输出必须为 LOW',
        objectiveType: 'output',
        priority: 1,
        points: 50,
        outputTarget: createOutputTarget('output-1', '输出', 'LOW'),
      },
      {
        id: 'obj-or-high-low',
        name: 'HIGH-LOW → HIGH',
        description: '当一个输入为 HIGH、一个为 LOW 时，输出必须为 HIGH',
        objectiveType: 'output',
        priority: 2,
        points: 75,
        outputTarget: createOutputTarget('output-1', '输出', 'HIGH'),
      },
      {
        id: 'obj-or-high-high',
        name: 'HIGH-HIGH → HIGH',
        description: '当两个输入都为 HIGH 时，输出必须为 HIGH',
        objectiveType: 'output',
        priority: 3,
        points: 75,
        outputTarget: createOutputTarget('output-1', '输出', 'HIGH'),
      },
    ],
  },

  // ===== ADVANCED CHALLENGES (1) =====
  {
    id: 'circuit-a-001',
    title: 'XOR 门电路',
    description: '使用基本的 AND、OR、NOT 门构建一个 XOR（异或）门电路。当两个输入不同时输出 HIGH，相同时输出 LOW。',
    difficulty: 'advanced',
    estimatedGateCount: 4,
    totalPoints: 300,
    hint: '提示：XOR 可以用以下公式实现：A XOR B = (A AND NOT B) OR (NOT A AND B)。需要使用两个 NOT 门、两个 AND 门和一个 OR 门。',
    inputConfigs: [
      { id: 'input-1', label: '输入 A', defaultState: false },
      { id: 'input-2', label: '输入 B', defaultState: false },
    ],
    objectives: [
      {
        id: 'obj-xor-low-low',
        name: 'LOW-LOW → LOW',
        description: '当两个输入都为 LOW 时，输出必须为 LOW',
        objectiveType: 'output',
        priority: 1,
        points: 50,
        outputTarget: createOutputTarget('output-1', '输出', 'LOW'),
      },
      {
        id: 'obj-xor-high-low',
        name: 'HIGH-LOW → HIGH',
        description: '当输入不同时（一个 HIGH、一个 LOW），输出必须为 HIGH',
        objectiveType: 'output',
        priority: 2,
        points: 100,
        outputTarget: createOutputTarget('output-1', '输出', 'HIGH'),
      },
      {
        id: 'obj-xor-low-high',
        name: 'LOW-HIGH → HIGH',
        description: '当输入不同时（一个 LOW、一个 HIGH），输出必须为 HIGH',
        objectiveType: 'output',
        priority: 3,
        points: 50,
        outputTarget: createOutputTarget('output-1', '输出', 'HIGH'),
      },
      {
        id: 'obj-xor-high-high',
        name: 'HIGH-HIGH → LOW',
        description: '当两个输入都为 HIGH 时，输出必须为 LOW',
        objectiveType: 'output',
        priority: 4,
        points: 100,
        outputTarget: createOutputTarget('output-1', '输出', 'LOW'),
      },
    ],
  },
];

/**
 * Get circuit challenge by ID
 */
export function getCircuitChallengeById(id: string): CircuitChallenge | undefined {
  return CIRCUIT_CHALLENGES.find(c => c.id === id);
}

/**
 * Get circuit challenges by difficulty
 */
export function getCircuitChallengesByDifficulty(
  difficulty: CircuitChallengeDifficulty
): CircuitChallenge[] {
  return CIRCUIT_CHALLENGES.filter(c => c.difficulty === difficulty);
}

/**
 * Get total challenge count
 */
export function getCircuitChallengeCount(): number {
  return CIRCUIT_CHALLENGES.length;
}

/**
 * Get challenge count by difficulty
 */
export function getCircuitChallengeCountByDifficulty(): Record<CircuitChallengeDifficulty, number> {
  return {
    beginner: CIRCUIT_CHALLENGES.filter(c => c.difficulty === 'beginner').length,
    intermediate: CIRCUIT_CHALLENGES.filter(c => c.difficulty === 'intermediate').length,
    advanced: CIRCUIT_CHALLENGES.filter(c => c.difficulty === 'advanced').length,
  };
}

export default CIRCUIT_CHALLENGES;
