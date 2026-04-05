/**
 * Tech Tree System Type Definitions
 * 
 * Defines the core types for the circuit component tech tree system.
 * The tech tree shows unlockable circuit components organized by categories,
 * driven by achievement completion.
 * 
 * ROUND 136: Initial implementation
 */

// Node categories for circuit components
export type TechTreeCategory = 
  | 'basic-gates'      // Basic logic gates (AND, OR, NOT, etc.)
  | 'advanced-gates'    // Advanced gates (NAND, NOR, XOR, XNOR)
  | 'special-components'; // Special components (Timer, Counter, Memory)

// Tech tree node - represents an unlockable circuit component
export interface TechTreeNodeData {
  id: string;
  name: string;
  nameCn: string;
  description: string;
  category: TechTreeCategory;
  // Prerequisites: array of node IDs that must be unlocked first
  prerequisites: string[];
  // Position in the tech tree visualization
  position: {
    x: number;
    y: number;
  };
  // Icon for display
  icon: string;
  // Achievement ID that unlocks this node (maps to achievement system)
  achievementId?: string;
}

// Alias for backward compatibility
export type TechTreeNode = TechTreeNodeData;

// Tech tree state - tracks unlock status
export interface TechTreeState {
  nodes: Record<string, boolean>; // nodeId -> isUnlocked
  lastUpdated: number;
}

// Stored tech tree data in localStorage
export interface StoredTechTreeData {
  nodes: Record<string, boolean>;
  lastUpdated: number;
}

// localStorage key for persistence
export const TECH_TREE_STORAGE_KEY = 'tech-tree-progress';

// Category display information
export const TECH_TREE_CATEGORIES: Record<TechTreeCategory, { 
  name: string; 
  nameCn: string;
  color: string;
  description: string;
}> = {
  'basic-gates': {
    name: 'Basic Gates',
    nameCn: '基础门电路',
    color: '#22c55e', // green
    description: 'Fundamental logic gates for building circuits',
  },
  'advanced-gates': {
    name: 'Advanced Gates',
    nameCn: '高级门电路',
    color: '#3b82f6', // blue
    description: 'Complex logic gates for advanced circuit designs',
  },
  'special-components': {
    name: 'Special Components',
    nameCn: '特殊组件',
    color: '#f59e0b', // amber
    description: 'Specialized components for timing and memory',
  },
};

// Helper to get all categories
export function getAllTechTreeCategories(): TechTreeCategory[] {
  return ['basic-gates', 'advanced-gates', 'special-components'];
}

// Helper to check if prerequisites are met
export function checkPrerequisitesMet(
  nodeId: string,
  allNodes: TechTreeNodeData[],
  unlockedNodes: Record<string, boolean>
): boolean {
  const node = allNodes.find(n => n.id === nodeId);
  if (!node) return false;
  
  // No prerequisites means it's available
  if (node.prerequisites.length === 0) return true;
  
  // All prerequisites must be unlocked
  return node.prerequisites.every(prereqId => unlockedNodes[prereqId] === true);
}

// Helper to get unmet prerequisites
export function getUnmetPrerequisites(
  nodeId: string,
  allNodes: TechTreeNodeData[],
  unlockedNodes: Record<string, boolean>
): string[] {
  const node = allNodes.find(n => n.id === nodeId);
  if (!node) return [];
  
  return node.prerequisites.filter(prereqId => unlockedNodes[prereqId] !== true);
}
