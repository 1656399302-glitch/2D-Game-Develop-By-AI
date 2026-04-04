/**
 * useCircuitCanvas Hook
 * 
 * Round 122: Circuit Canvas Integration
 * 
 * Hook connecting canvas interactions to circuit simulation.
 * Provides state and actions for circuit canvas operations.
 */

import { useCallback, useEffect } from 'react';
import { useCircuitCanvasStore } from '../store/useCircuitCanvasStore';
import { GateType, CircuitNodeType } from '../types/circuit';
import { CIRCUIT_NODE_SIZES } from '../types/circuitCanvas';
import type { PlacedCircuitNode } from '../types/circuitCanvas';
import type { CircuitWire } from '../types/circuitCanvas';

// ============================================================================
// Hook Interface
// ============================================================================

export interface UseCircuitCanvasOptions {
  /** Center of viewport for placing nodes */
  viewportCenter?: { x: number; y: number };
  /** Grid size for snapping */
  gridSize?: number;
  /** Enable grid snapping */
  enableSnap?: boolean;
}

export interface UseCircuitCanvasReturn {
  // State
  isCircuitMode: boolean;
  nodes: PlacedCircuitNode[];
  wires: CircuitWire[];
  selectedNodeId: string | null;
  selectedWireId: string | null;
  isDrawingWire: boolean;
  cycleAffectedNodeIds: string[];
  isSimulating: boolean;
  simulationStepCount: number;
  
  // Mode controls
  setCircuitMode: (enabled: boolean) => void;
  toggleCircuitMode: () => void;
  
  // Node operations
  addCircuitNode: (type: CircuitNodeType, x: number, y: number, gateType?: GateType, label?: string) => PlacedCircuitNode;
  removeSelectedNode: () => void;
  selectNode: (nodeId: string | null) => void;
  moveNode: (nodeId: string, x: number, y: number) => void;
  
  // Wire operations
  startWire: (nodeId: string, portIndex: number) => void;
  updateWirePreview: (x: number, y: number) => void;
  finishWire: (targetNodeId: string, targetPort: number) => void;
  cancelWire: () => void;
  removeSelectedWire: () => void;
  selectWire: (wireId: string | null) => void;
  
  // Input operations
  toggleInput: (nodeId: string) => void;
  
  // Simulation
  runSimulation: () => void;
  resetSimulation: () => void;
  
  // Canvas operations
  clearCanvas: () => void;
  
  // Node position helpers
  getNodePosition: (nodeId: string) => { x: number; y: number } | null;
  getNodeSize: (nodeId: string) => { width: number; height: number } | null;
  getPortPosition: (nodeId: string, portIndex: number, isOutput: boolean) => { x: number; y: number } | null;
  
  // Wire preview helpers
  isValidWireTarget: (nodeId: string) => boolean;
  getWirePreviewStart: () => { x: number; y: number } | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * useCircuitCanvas Hook
 * Provides circuit canvas state and operations
 */
export function useCircuitCanvas(options: UseCircuitCanvasOptions = {}): UseCircuitCanvasReturn {
  const {
    gridSize = 20,
    enableSnap = true,
  } = options;
  
  // Get store state and actions
  const store = useCircuitCanvasStore();
  
  // Snap position to grid
  const snapPosition = useCallback((x: number, y: number) => {
    if (!enableSnap) return { x, y };
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  }, [gridSize, enableSnap]);
  
  // Toggle circuit mode
  const toggleCircuitMode = useCallback(() => {
    store.setCircuitMode(!store.isCircuitMode);
  }, [store.isCircuitMode, store.setCircuitMode]);
  
  // Add circuit node with grid snapping
  const addCircuitNode = useCallback((
    type: CircuitNodeType,
    x: number,
    y: number,
    gateType?: GateType,
    label?: string
  ) => {
    const snapped = snapPosition(x, y);
    
    // Adjust position to center the node
    const size = gateType
      ? CIRCUIT_NODE_SIZES[gateType]
      : CIRCUIT_NODE_SIZES[type] || { width: 60, height: 60 };
    
    const centeredX = snapped.x - size.width / 2;
    const centeredY = snapped.y - size.height / 2;
    
    return store.addCircuitNode(type, centeredX, centeredY, gateType, label);
  }, [snapPosition, store]);
  
  // Remove selected node
  const removeSelectedNode = useCallback(() => {
    if (store.selectedNodeId) {
      store.removeCircuitNode(store.selectedNodeId);
    }
  }, [store.selectedNodeId, store]);
  
  // Move node with grid snapping
  const moveNode = useCallback((nodeId: string, x: number, y: number) => {
    const snapped = snapPosition(x, y);
    store.updateNodePosition(nodeId, snapped.x, snapped.y);
  }, [snapPosition, store]);
  
  // Start wire drawing
  const startWire = useCallback((nodeId: string, portIndex: number) => {
    store.startWireDrawing(nodeId, portIndex);
  }, [store]);
  
  // Finish wire drawing
  const finishWire = useCallback((targetNodeId: string, targetPort: number) => {
    store.finishWireDrawing(targetNodeId, targetPort);
    // Run simulation after connecting
    store.runCircuitSimulation();
  }, [store]);
  
  // Remove selected wire
  const removeSelectedWire = useCallback(() => {
    if (store.selectedWireId) {
      store.removeCircuitWire(store.selectedWireId);
    }
  }, [store.selectedWireId, store]);
  
  // Get node position
  const getNodePosition = useCallback((nodeId: string) => {
    const node = store.nodes.find((n: PlacedCircuitNode) => n.id === nodeId);
    return node ? { ...node.position } : null;
  }, [store.nodes]);
  
  // Get node size
  const getNodeSize = useCallback((nodeId: string) => {
    const node = store.nodes.find((n: PlacedCircuitNode) => n.id === nodeId);
    if (!node) return null;
    
    if (node.type === 'gate' && node.gateType) {
      return CIRCUIT_NODE_SIZES[node.gateType] || { width: 80, height: 50 };
    }
    return CIRCUIT_NODE_SIZES[node.type] || { width: 60, height: 60 };
  }, [store.nodes]);
  
  // Get port position
  const getPortPosition = useCallback((nodeId: string, portIndex: number, isOutput: boolean) => {
    const pos = getNodePosition(nodeId);
    const size = getNodeSize(nodeId);
    const node = store.nodes.find((n: PlacedCircuitNode) => n.id === nodeId);
    
    if (!pos || !size || !node) return null;
    
    if (isOutput) {
      // Output port on right side
      return {
        x: pos.x + size.width,
        y: pos.y + size.height / 2,
      };
    }
    
    // Input ports on left side
    if (node.type === 'gate' && node.gateType === 'NOT') {
      // Single input port for NOT gate
      return {
        x: pos.x,
        y: pos.y + size.height / 2,
      };
    }
    
    // Two input ports for other gates
    const portSpacing = size.height / 3;
    return {
      x: pos.x,
      y: pos.y + portSpacing * (portIndex + 1),
    };
  }, [getNodePosition, getNodeSize, store.nodes]);
  
  // Check if node is valid wire target
  const isValidWireTarget = useCallback((nodeId: string) => {
    const { wireStart, wires } = store;
    if (!wireStart) return false;
    
    // Can't connect to self
    if (nodeId === wireStart.nodeId) return false;
    
    // Check if connection already exists
    const existingWire = wires.find(
      (w: CircuitWire) => w.sourceNodeId === wireStart.nodeId && w.targetNodeId === nodeId
    );
    
    return !existingWire;
  }, [store.wires, store.wireStart]);
  
  // Get wire preview start position
  const getWirePreviewStart = useCallback(() => {
    const { wireStart, nodes } = store;
    if (!wireStart) return null;
    
    const node = nodes.find((n: PlacedCircuitNode) => n.id === wireStart.nodeId);
    if (!node) return null;
    
    const size = node.type === 'gate' && node.gateType
      ? CIRCUIT_NODE_SIZES[node.gateType]
      : CIRCUIT_NODE_SIZES[node.type] || { width: 60, height: 60 };
    
    // Output port on right side
    return {
      x: node.position.x + size.width,
      y: node.position.y + size.height / 2,
    };
  }, [store.nodes, store.wireStart]);
  
  // Run simulation
  const runSimulation = useCallback(() => {
    store.runCircuitSimulation();
  }, [store]);
  
  // Reset simulation
  const resetSimulation = useCallback(() => {
    store.resetCircuitSimulation();
  }, [store]);
  
  // Keyboard shortcuts
  useEffect(() => {
    if (!store.isCircuitMode) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected node or wire
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.selectedNodeId) {
          store.removeCircuitNode(store.selectedNodeId);
        } else if (store.selectedWireId) {
          store.removeCircuitWire(store.selectedWireId);
        }
      }
      
      // Escape to cancel wire drawing
      if (e.key === 'Escape') {
        if (store.isDrawingWire) {
          store.cancelWireDrawing();
        } else {
          store.selectCircuitNode(null);
        }
      }
      
      // R to run simulation
      if (e.key === 'r' || e.key === 'R') {
        if (!e.ctrlKey && !e.metaKey) {
          store.runCircuitSimulation();
        }
      }
      
      // X to reset simulation
      if (e.key === 'x' || e.key === 'X') {
        if (!e.ctrlKey && !e.metaKey) {
          store.resetCircuitSimulation();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);
  
  return {
    // State
    isCircuitMode: store.isCircuitMode,
    nodes: store.nodes,
    wires: store.wires,
    selectedNodeId: store.selectedNodeId,
    selectedWireId: store.selectedWireId,
    isDrawingWire: store.isDrawingWire,
    cycleAffectedNodeIds: store.cycleAffectedNodeIds,
    isSimulating: store.isSimulating,
    simulationStepCount: store.simulationStepCount,
    
    // Mode controls
    setCircuitMode: store.setCircuitMode,
    toggleCircuitMode,
    
    // Node operations
    addCircuitNode,
    removeSelectedNode,
    selectNode: store.selectCircuitNode,
    moveNode,
    
    // Wire operations
    startWire,
    updateWirePreview: store.updateWirePreview,
    finishWire,
    cancelWire: store.cancelWireDrawing,
    removeSelectedWire,
    selectWire: store.selectCircuitWire,
    
    // Input operations
    toggleInput: store.toggleCircuitInput,
    
    // Simulation
    runSimulation,
    resetSimulation,
    
    // Canvas operations
    clearCanvas: store.clearCircuitCanvas,
    
    // Node position helpers
    getNodePosition,
    getNodeSize,
    getPortPosition,
    
    // Wire preview helpers
    isValidWireTarget,
    getWirePreviewStart,
  };
}

// ============================================================================
// Export
// ============================================================================

export default useCircuitCanvas;
