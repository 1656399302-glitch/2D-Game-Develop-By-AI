/**
 * Tech Tree Node Definitions
 * 
 * Defines all nodes in the circuit component tech tree.
 * Each node represents an unlockable circuit component organized by category:
 * - Basic Gates: Fundamental logic gates
 * - Advanced Gates: Complex logic gates
 * - Special Components: Timing, memory, and specialized components
 * 
 * Nodes have prerequisites that must be unlocked before they become available.
 * Achievement completion drives the unlock state.
 * 
 * ROUND 136: Initial implementation
 */

import type { TechTreeNode, TechTreeCategory } from '../types/techTree';

/**
 * Helper to create a tech tree node
 */
function createNode(
  id: string,
  name: string,
  nameCn: string,
  description: string,
  category: TechTreeCategory,
  prerequisites: string[],
  position: { x: number; y: number },
  icon: string,
  achievementId?: string
): TechTreeNode {
  return {
    id,
    name,
    nameCn,
    description,
    category,
    prerequisites,
    position,
    icon,
    achievementId,
  };
}

/**
 * All tech tree nodes organized by category
 * 
 * Layout:
 * - Basic Gates (left): 3 columns, starting at x:50
 * - Advanced Gates (middle): 2 columns, starting at x:350  
 * - Special Components (right): 2 columns, starting at x:550
 * 
 * Each column has 4 rows with y positions: 50, 170, 290, 410
 */
export const TECH_TREE_NODES: TechTreeNode[] = [
  // ============================================
  // BASIC GATES (3 nodes)
  // ============================================
  createNode(
    'and-gate',
    'AND Gate',
    '与门',
    'Outputs HIGH only when all inputs are HIGH. Fundamental for creating conditions.',
    'basic-gates',
    [], // No prerequisites - always available
    { x: 50, y: 50 },
    '🔌',
    'first-circuit'
  ),
  createNode(
    'or-gate',
    'OR Gate',
    '或门',
    'Outputs HIGH when any input is HIGH. Used for combining multiple signals.',
    'basic-gates',
    [], // No prerequisites
    { x: 180, y: 50 },
    '⚡',
    'five-circuits'
  ),
  createNode(
    'not-gate',
    'NOT Gate',
    '非门',
    'Inverts the input signal. Essential for creating logic inversions.',
    'basic-gates',
    [], // No prerequisites
    { x: 310, y: 50 },
    '🔄',
    'complex-circuit'
  ),

  // ============================================
  // BASIC GATES ROW 2 (3 nodes)
  // ============================================
  createNode(
    'buffer-gate',
    'Buffer Gate',
    '缓冲门',
    'Amplifies weak signals without inversion. Useful for signal strength.',
    'basic-gates',
    ['not-gate'], // Requires understanding of NOT gate
    { x: 50, y: 170 },
    '📤',
    'first-subcircuit'
  ),
  createNode(
    'nand-gate',
    'NAND Gate',
    '与非门',
    'Universal gate - can build any logic circuit from NAND gates alone.',
    'basic-gates',
    ['and-gate'], // Requires understanding of AND gate
    { x: 180, y: 170 },
    '🔐',
    'five-subcircuits'
  ),
  createNode(
    'nor-gate',
    'NOR Gate',
    '或非门',
    'Universal gate - can build any logic circuit from NOR gates alone.',
    'basic-gates',
    ['or-gate'], // Requires understanding of OR gate
    { x: 310, y: 170 },
    '🔒',
    'reuse-subcircuit'
  ),

  // ============================================
  // ADVANCED GATES (3 nodes)
  // ============================================
  createNode(
    'xor-gate',
    'XOR Gate',
    '异或门',
    'Exclusive OR - outputs HIGH when inputs differ. Key for parity and comparison.',
    'advanced-gates',
    ['and-gate', 'or-gate'], // Requires understanding of both basic gates
    { x: 450, y: 50 },
    '⚖️',
    'first-recipe'
  ),
  createNode(
    'xnor-gate',
    'XNOR Gate',
    '同或门',
    'Exclusive NOR - outputs HIGH when inputs are the same. Used for equality detection.',
    'advanced-gates',
    ['xor-gate', 'not-gate'], // Requires XOR and NOT
    { x: 580, y: 50 },
    '🔄',
    'five-recipes'
  ),
  createNode(
    'and-3',
    '3-Input AND',
    '三输入与门',
    'AND gate with 3 inputs. Outputs HIGH when all 3 inputs are HIGH.',
    'advanced-gates',
    ['and-gate'], // Requires basic AND
    { x: 450, y: 170 },
    '🎚️',
    'rare-recipe'
  ),

  // ============================================
  // ADVANCED GATES ROW 2 (2 nodes)
  // ============================================
  createNode(
    'or-3',
    '3-Input OR',
    '三输入或门',
    'OR gate with 3 inputs. Outputs HIGH when any of the 3 inputs are HIGH.',
    'advanced-gates',
    ['or-gate'], // Requires basic OR
    { x: 580, y: 170 },
    '🎚️',
    'explore-tech-tree'
  ),
  createNode(
    'mux-2',
    '2:1 Multiplexer',
    '2选1多路复用器',
    'Selects between 2 inputs based on a select line. Fundamental for data routing.',
    'advanced-gates',
    ['xor-gate', 'and-gate', 'or-gate'], // Requires multiple basic gates
    { x: 450, y: 290 },
    '🔀',
    'explore-gallery'
  ),

  // ============================================
  // SPECIAL COMPONENTS (3 nodes)
  // ============================================
  createNode(
    'timer-component',
    'Timer Component',
    '定时器组件',
    'Generates pulses at configurable intervals. Essential for timing circuits.',
    'special-components',
    ['and-gate', 'not-gate'], // Requires basic gates understanding
    { x: 720, y: 50 },
    '⏱️',
    'explore-achievements'
  ),
  createNode(
    'counter-component',
    'Counter Component',
    '计数器组件',
    'Counts pulses and outputs binary representation. Used for event counting.',
    'special-components',
    ['timer-component', 'xor-gate'], // Requires timer and XOR
    { x: 720, y: 170 },
    '🔢',
    'codex-collector'
  ),
  createNode(
    'flipflop-d',
    'D Flip-Flop',
    'D触发器',
    'Data flip-flop - captures and holds data on clock edge. Memory fundamentals.',
    'special-components',
    ['counter-component', 'and-3'], // Requires counter and multi-input gates
    { x: 720, y: 290 },
    '💾',
    'master-creator'
  ),

  // ============================================
  // SPECIAL COMPONENTS ROW 2 (1 node)
  // ============================================
  createNode(
    'latch-sr',
    'SR Latch',
    'SR锁存器',
    'Set-Reset latch - basic memory element that holds state.',
    'special-components',
    ['nor-gate', 'nand-gate'], // Requires universal gates
    { x: 720, y: 410 },
    '🔐',
    'legendary-machinist'
  ),
];

/**
 * Get all tech tree nodes
 */
export function getTechTreeNodes(): TechTreeNode[] {
  return TECH_TREE_NODES;
}

/**
 * Get nodes by category
 */
export function getNodesByCategory(category: TechTreeCategory): TechTreeNode[] {
  return TECH_TREE_NODES.filter(node => node.category === category);
}

/**
 * Get node by ID
 */
export function getNodeById(id: string): TechTreeNode | undefined {
  return TECH_TREE_NODES.find(node => node.id === id);
}

/**
 * Get all unique categories used in the tech tree
 */
export function getUsedCategories(): TechTreeCategory[] {
  const categories = new Set(TECH_TREE_NODES.map(node => node.category));
  return Array.from(categories);
}

/**
 * Validate that all prerequisite references are valid
 */
export function validatePrerequisites(): boolean {
  const nodeIds = new Set(TECH_TREE_NODES.map(node => node.id));
  
  for (const node of TECH_TREE_NODES) {
    for (const prereq of node.prerequisites) {
      if (!nodeIds.has(prereq)) {
        console.error(`Invalid prerequisite "${prereq}" for node "${node.id}"`);
        return false;
      }
    }
  }
  
  return true;
}

// Run validation on import (will log errors in console if invalid)
validatePrerequisites();

// Total node count
export const TOTAL_TECH_TREE_NODES = TECH_TREE_NODES.length;
