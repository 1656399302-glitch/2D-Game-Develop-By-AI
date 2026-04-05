/**
 * Tech Tree Module
 * 
 * Export all tech tree components and utilities.
 * 
 * ROUND 136: Initial implementation
 */

export { TechTreePanel } from './TechTreePanel';
export { TechTreeCanvas } from './TechTreeCanvas';
export { TechTreeNode } from './TechTreeNode';
export { TechTreeConnections } from './TechTreeConnections';

export { useTechTreeStore } from '../../store/useTechTreeStore';
export { setupAchievementIntegration } from '../../store/useTechTreeStore';

export { TECH_TREE_NODES, getTechTreeNodes, getNodeById, getNodesByCategory } from '../../data/techTreeNodes';
export { TOTAL_TECH_TREE_NODES } from '../../data/techTreeNodes';

export type { TechTreeCategory, TechTreeNodeData, TechTreeState, StoredTechTreeData } from '../../types/techTree';
export { TECH_TREE_CATEGORIES, TECH_TREE_STORAGE_KEY, getAllTechTreeCategories, checkPrerequisitesMet, getUnmetPrerequisites } from '../../types/techTree';
