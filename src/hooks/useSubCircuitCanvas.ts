/**
 * Use Sub-Circuit Canvas Hook
 * 
 * Round 129: Sub-circuit Module System
 * 
 * Hook orchestrating sub-circuit creation workflow:
 * - Selection detection
 * - Modal state management
 * - Store integration
 * - Canvas cleanup on deletion
 */

import { useState, useCallback, useMemo } from 'react';
import { useSubCircuitStore } from '../store/useSubCircuitStore';
import { useCircuitCanvasStore } from '../store/useCircuitCanvasStore';
import { 
  CreateSubCircuitInput, 
  CreateSubCircuitResult,
  SubCircuitModule,
} from '../types/subCircuit';

// ============================================================================
// Hook State
// ============================================================================

export interface UseSubCircuitCanvasState {
  /** Whether the create modal is open */
  isCreateModalOpen: boolean;
  /** Number of currently selected modules */
  selectedModuleCount: number;
  /** IDs of selected modules */
  selectedModuleIds: string[];
  /** Whether sub-circuits can be created (based on selection and limit) */
  canCreate: boolean;
  /** Current error message */
  error: string | null;
  /** Toast message for success feedback */
  toastMessage: string | null;
}

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseSubCircuitCanvasReturn extends UseSubCircuitCanvasState {
  // Actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  createSubCircuit: (name: string, description?: string) => CreateSubCircuitResult;
  deleteSubCircuit: (subCircuitId: string) => void;
  
  // Canvas integration
  addSubCircuitToCanvas: (subCircuitId: string, x: number, y: number) => void;
  removeSubCircuitInstancesFromCanvas: (subCircuitId: string) => void;
  
  // Toast control
  clearToast: () => void;
}

// ============================================================================
// Helper Function (defined outside component to avoid hoisting issues)
// ============================================================================

/**
 * Remove sub-circuit instances from canvas
 */
function removeInstancesFromCanvas(
  circuitNodes: ReturnType<typeof useCircuitCanvasStore.getState>['nodes'],
  removeCircuitNode: (nodeId: string) => void,
  subCircuitId: string
): void {
  // Find all nodes that are instances of this sub-circuit
  const instancesToRemove = circuitNodes.filter((node) => {
    return node.parameters?.isSubCircuit === true && 
           node.parameters?.subCircuitId === subCircuitId;
  });
  
  // Remove each instance
  instancesToRemove.forEach((instance) => {
    removeCircuitNode(instance.id);
  });
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing sub-circuit creation workflow
 */
export function useSubCircuitCanvas(): UseSubCircuitCanvasReturn {
  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Get store state and actions
  const subCircuits = useSubCircuitStore((state) => state.subCircuits);
  const createSubCircuitStore = useSubCircuitStore((state) => state.createSubCircuit);
  const deleteSubCircuitStore = useSubCircuitStore((state) => state.deleteSubCircuit);
  const canCreateMore = useSubCircuitStore((state) => state.canCreateMore);
  
  // Get circuit canvas state
  const circuitNodes = useCircuitCanvasStore((state) => state.nodes);
  const removeCircuitNode = useCircuitCanvasStore((state) => state.removeCircuitNode);
  const addCircuitNode = useCircuitCanvasStore((state) => state.addCircuitNode);
  const setCircuitMode = useCircuitCanvasStore((state) => state.setCircuitMode);
  
  // Get selected node IDs from the circuit canvas
  const selectedModuleIds = useMemo(() => {
    return circuitNodes
      .filter((n) => n.selected)
      .map((n) => n.id);
  }, [circuitNodes]);
  
  const selectedModuleCount = selectedModuleIds.length;
  
  // Check if sub-circuits can be created
  const canCreate = selectedModuleCount >= 2 && canCreateMore();
  
  // Open create modal
  const openCreateModal = useCallback(() => {
    if (!canCreateMore()) {
      setError('已达到最大数量限制（20个），请删除现有子电路后再试');
      return;
    }
    if (selectedModuleCount < 2) {
      setError('请先选择至少2个模块');
      return;
    }
    setError(null);
    setIsCreateModalOpen(true);
  }, [selectedModuleCount, canCreateMore]);
  
  // Close create modal
  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setError(null);
  }, []);
  
  // Add sub-circuit instance to canvas
  const addSubCircuitToCanvas = useCallback((subCircuitId: string, x: number, y: number) => {
    // Enable circuit mode if not already
    setCircuitMode(true);
    
    // Create a special gate node for the sub-circuit
    const subCircuit = subCircuits.find((sc) => sc.id === subCircuitId);
    if (!subCircuit) return;
    
    // Add the sub-circuit as a special node type
    addCircuitNode(
      'gate',
      x,
      y,
      undefined, // No gateType for sub-circuits
      subCircuit.name,
      { 
        isSubCircuit: true,
        subCircuitId,
        moduleCount: subCircuit.moduleIds.length,
      }
    );
  }, [subCircuits, setCircuitMode, addCircuitNode]);
  
  // Remove sub-circuit instances from canvas
  const removeSubCircuitInstancesFromCanvas = useCallback((subCircuitId: string) => {
    removeInstancesFromCanvas(circuitNodes, removeCircuitNode, subCircuitId);
  }, [circuitNodes, removeCircuitNode]);
  
  // Create sub-circuit
  const createSubCircuit = useCallback((name: string, description?: string): CreateSubCircuitResult => {
    if (selectedModuleCount < 2) {
      const result: CreateSubCircuitResult = {
        success: false,
        error: '至少需要选择2个模块',
      };
      return result;
    }
    
    const input: CreateSubCircuitInput = {
      name,
      moduleIds: selectedModuleIds,
      description,
    };
    
    const result = createSubCircuitStore(input);
    
    if (result.success) {
      setToastMessage(`子电路 "${name}" 创建成功！`);
      setTimeout(() => setToastMessage(null), 3000);
      closeCreateModal();
    } else {
      setError(result.error || '创建失败');
    }
    
    return result;
  }, [selectedModuleIds, selectedModuleCount, createSubCircuitStore, closeCreateModal]);
  
  // Delete sub-circuit
  const deleteSubCircuit = useCallback((subCircuitId: string) => {
    const result = deleteSubCircuitStore(subCircuitId);
    
    if (result.success) {
      // Remove instances from canvas
      removeInstancesFromCanvas(circuitNodes, removeCircuitNode, subCircuitId);
      
      // Find the deleted sub-circuit for the toast
      const deleted = subCircuits.find((sc) => sc.id === subCircuitId);
      if (deleted) {
        setToastMessage(`子电路 "${deleted.name}" 已删除`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } else {
      setError(result.error || '删除失败');
    }
  }, [deleteSubCircuitStore, subCircuits, circuitNodes, removeCircuitNode]);
  
  // Clear toast
  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);
  
  return {
    // State
    isCreateModalOpen,
    selectedModuleCount,
    selectedModuleIds,
    canCreate,
    error,
    toastMessage,
    
    // Actions
    openCreateModal,
    closeCreateModal,
    createSubCircuit,
    deleteSubCircuit,
    addSubCircuitToCanvas,
    removeSubCircuitInstancesFromCanvas,
    clearToast,
  };
}

// ============================================================================
// Helper Hooks
// ============================================================================

/**
 * Hook to get sub-circuit from canvas selection
 * Returns the sub-circuit module and its contained node IDs if selected
 */
export function useSubCircuitFromSelection(): SubCircuitModule | null {
  const subCircuits = useSubCircuitStore((state) => state.subCircuits);
  const circuitNodes = useCircuitCanvasStore((state) => state.nodes);
  
  // Get selected node IDs
  const selectedNodeIds = circuitNodes
    .filter((n) => n.selected)
    .map((n) => n.id);
  
  if (selectedNodeIds.length < 2) return null;
  
  // Find a sub-circuit that contains exactly these nodes
  const matchingSubCircuit = subCircuits.find((sc) => {
    if (sc.moduleIds.length !== selectedNodeIds.length) return false;
    
    const sortedScIds = [...sc.moduleIds].sort();
    const sortedSelectedIds = [...selectedNodeIds].sort();
    
    return sortedScIds.every((id, index) => id === sortedSelectedIds[index]);
  });
  
  return matchingSubCircuit || null;
}

/**
 * Hook to check if a sub-circuit exists on canvas
 */
export function useSubCircuitOnCanvas(subCircuitId: string): boolean {
  const circuitNodes = useCircuitCanvasStore((state) => state.nodes);
  
  return circuitNodes.some((node) => {
    return node.parameters?.isSubCircuit === true && 
           node.parameters?.subCircuitId === subCircuitId;
  });
}

/**
 * Hook to get all sub-circuit instances on canvas
 */
export function useSubCircuitInstances(): string[] {
  const circuitNodes = useCircuitCanvasStore((state) => state.nodes);
  
  return circuitNodes
    .filter((node) => node.parameters?.isSubCircuit === true)
    .map((node) => node.parameters?.subCircuitId as string)
    .filter(Boolean);
}

export default useSubCircuitCanvas;
