/**
 * Circuit Canvas Store
 * 
 * Round 122: Circuit Canvas Integration
 * 
 * Zustand store for managing circuit components on the canvas.
 * Extends the circuit simulation engine with canvas-specific state.
 */

import { create } from 'zustand';
import {
  PlacedCircuitNode,
  PlacedInputNode,
  PlacedOutputNode,
  PlacedGateNode,
  CircuitWire,
  CanvasCircuitState,
  CIRCUIT_NODE_SIZES,
} from '../types/circuitCanvas';
import {
  GateType,
  SignalState,
  CircuitNodeType,
  InputNode,
  GateNode,
  OutputNode,
  CircuitConnection,
} from '../types/circuit';
import {
  propagateSignals,
} from '../engine/circuitSimulator';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// Store Interface
// ============================================================================

interface CircuitCanvasStore extends CanvasCircuitState {
  // Circuit mode
  setCircuitMode: (enabled: boolean) => void;
  
  // Node operations
  addCircuitNode: (type: CircuitNodeType, x: number, y: number, gateType?: GateType, label?: string) => PlacedCircuitNode;
  removeCircuitNode: (nodeId: string) => void;
  selectCircuitNode: (nodeId: string | null) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  
  // Wire operations
  addCircuitWire: (sourceNodeId: string, targetNodeId: string, targetPort?: number) => CircuitWire | null;
  removeCircuitWire: (wireId: string) => void;
  selectCircuitWire: (wireId: string | null) => void;
  
  // Wire drawing
  startWireDrawing: (nodeId: string, portIndex: number) => void;
  updateWirePreview: (x: number, y: number) => void;
  finishWireDrawing: (targetNodeId: string, targetPort: number) => void;
  cancelWireDrawing: () => void;
  
  // Input node operations
  toggleCircuitInput: (nodeId: string) => void;
  
  // Simulation
  runCircuitSimulation: () => void;
  resetCircuitSimulation: () => void;
  
  // Clear
  clearCircuitCanvas: () => void;
  
  // Cycle detection
  setCycleAffectedNodes: (nodeIds: string[]) => void;
  
  // Getters
  getNodeById: (nodeId: string) => PlacedCircuitNode | undefined;
  getNodeSignal: (nodeId: string) => SignalState;
  getWireSignal: (wireId: string) => SignalState;
  getInputNodes: () => PlacedInputNode[];
  getGateNodes: () => PlacedGateNode[];
  getOutputNodes: () => PlacedOutputNode[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a canvas circuit node from a simulation node
 */
function createPlacedNode(
  type: CircuitNodeType,
  x: number,
  y: number,
  gateType?: GateType,
  label?: string
): PlacedCircuitNode {
  const size = gateType
    ? CIRCUIT_NODE_SIZES[gateType]
    : CIRCUIT_NODE_SIZES[type] || { width: 60, height: 60 };
  
  const defaultLabel = label || (type === 'input' ? 'IN' : type === 'output' ? 'OUT' : gateType);
  
  const baseNode: PlacedCircuitNode = {
    id: uuidv4(),
    type,
    position: { x, y },
    label: defaultLabel,
    signal: false,
    size,
  };
  
  if (type === 'input') {
    return {
      ...baseNode,
      type: 'input',
      state: false,
    } as PlacedInputNode;
  }
  
  if (type === 'output') {
    return {
      ...baseNode,
      type: 'output',
      inputSignal: false,
    } as PlacedOutputNode;
  }
  
  if (type === 'gate' && gateType) {
    return {
      ...baseNode,
      type: 'gate',
      gateType,
      output: false,
      inputCount: gateType === 'NOT' ? 1 : 2,
    } as PlacedGateNode;
  }
  
  return baseNode;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useCircuitCanvasStore = create<CircuitCanvasStore>((set, _get) => ({
  // Initial state
  isCircuitMode: false,
  nodes: [],
  wires: [],
  selectedNodeId: null,
  selectedWireId: null,
  isDrawingWire: false,
  wireStart: null,
  wirePreviewEnd: null,
  cycleAffectedNodeIds: [],
  isSimulating: false,
  simulationStepCount: 0,
  
  // Circuit mode toggle
  setCircuitMode: (enabled: boolean) => {
    set({ isCircuitMode: enabled });
  },
  
  // Add circuit node
  addCircuitNode: (type: CircuitNodeType, x: number, y: number, gateType?: GateType, label?: string) => {
    const node = createPlacedNode(type, x, y, gateType, label);
    
    set((state: CircuitCanvasStore) => ({
      nodes: [...state.nodes, node],
      selectedNodeId: node.id,
    }));
    
    return node;
  },
  
  // Remove circuit node
  removeCircuitNode: (nodeId: string) => {
    set((state: CircuitCanvasStore) => ({
      nodes: state.nodes.filter((n: PlacedCircuitNode) => n.id !== nodeId),
      wires: state.wires.filter(
        (w: CircuitWire) => w.sourceNodeId !== nodeId && w.targetNodeId !== nodeId
      ),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }));
  },
  
  // Select circuit node
  selectCircuitNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId, selectedWireId: null });
  },
  
  // Update node position
  updateNodePosition: (nodeId: string, x: number, y: number) => {
    set((state: CircuitCanvasStore) => ({
      nodes: state.nodes.map((n: PlacedCircuitNode) =>
        n.id === nodeId ? { ...n, position: { x, y } } : n
      ),
    }));
  },
  
  // Add circuit wire
  addCircuitWire: (sourceNodeId: string, targetNodeId: string, targetPort: number = 0) => {
    let wire: CircuitWire | null = null;
    
    set((state: CircuitCanvasStore) => {
      // Validate nodes exist
      const sourceNode = state.nodes.find((n: PlacedCircuitNode) => n.id === sourceNodeId);
      const targetNode = state.nodes.find((n: PlacedCircuitNode) => n.id === targetNodeId);
      
      if (!sourceNode || !targetNode) {
        return state;
      }
      
      // Check for duplicate connection
      const existingWire = state.wires.find(
        (w: CircuitWire) =>
          w.sourceNodeId === sourceNodeId &&
          w.targetNodeId === targetNodeId &&
          w.targetPort === targetPort
      );
      
      if (existingWire) {
        return state;
      }
      
      // Calculate wire positions
      const sourceSize = sourceNode.size || CIRCUIT_NODE_SIZES.output || { width: 60, height: 60 };
      const targetSize = targetNode.size || CIRCUIT_NODE_SIZES.input || { width: 60, height: 60 };
      
      const startPoint = {
        x: sourceNode.position.x + sourceSize.width,
        y: sourceNode.position.y + sourceSize.height / 2,
      };
      
      const endPoint = {
        x: targetNode.position.x,
        y: targetNode.position.y + targetSize.height / 2,
      };
      
      wire = {
        id: uuidv4(),
        sourceNodeId,
        targetNodeId,
        targetPort,
        signal: false,
        startPoint,
        endPoint,
      };
      
      return {
        wires: [...state.wires, wire],
      };
    });
    
    return wire;
  },
  
  // Remove circuit wire
  removeCircuitWire: (wireId: string) => {
    set((state: CircuitCanvasStore) => ({
      wires: state.wires.filter((w: CircuitWire) => w.id !== wireId),
      selectedWireId: state.selectedWireId === wireId ? null : state.selectedWireId,
    }));
  },
  
  // Select circuit wire
  selectCircuitWire: (wireId: string | null) => {
    set({ selectedWireId: wireId, selectedNodeId: null });
  },
  
  // Wire drawing - start
  startWireDrawing: (nodeId: string, portIndex: number) => {
    set({
      isDrawingWire: true,
      wireStart: { nodeId, portIndex },
      wirePreviewEnd: null,
    });
  },
  
  // Wire drawing - update preview
  updateWirePreview: (x: number, y: number) => {
    set({ wirePreviewEnd: { x, y } });
  },
  
  // Wire drawing - finish
  finishWireDrawing: (targetNodeId: string, targetPort: number) => {
    const wireStart = useCircuitCanvasStore.getState().wireStart;
    if (!wireStart) {
      set({ isDrawingWire: false, wireStart: null, wirePreviewEnd: null });
      return;
    }
    
    // Add the wire
    useCircuitCanvasStore.getState().addCircuitWire(wireStart.nodeId, targetNodeId, targetPort);
    
    set({
      isDrawingWire: false,
      wireStart: null,
      wirePreviewEnd: null,
    });
  },
  
  // Wire drawing - cancel
  cancelWireDrawing: () => {
    set({
      isDrawingWire: false,
      wireStart: null,
      wirePreviewEnd: null,
    });
  },
  
  // Toggle input node state
  toggleCircuitInput: (nodeId: string) => {
    set((state: CircuitCanvasStore) => ({
      nodes: state.nodes.map((n: PlacedCircuitNode) => {
        if (n.id === nodeId && n.type === 'input') {
          const inputNode = n as PlacedInputNode;
          const newState = !inputNode.state;
          return {
            ...n,
            state: newState,
            signal: newState,
          };
        }
        return n;
      }),
      isDirty: true,
    }));
    
    // Auto-run simulation after toggle
    useCircuitCanvasStore.getState().runCircuitSimulation();
  },
  
  // Run circuit simulation
  runCircuitSimulation: () => {
    const state = useCircuitCanvasStore.getState();
    
    if (state.nodes.length === 0) return;
    
    // Convert canvas nodes to simulation format
    const simNodes: (InputNode | GateNode | OutputNode)[] = state.nodes.map((n: PlacedCircuitNode) => {
      if (n.type === 'input') {
        const inputNode = n as PlacedInputNode;
        return {
          id: n.id,
          type: 'input' as const,
          position: n.position,
          state: inputNode.state,
          label: n.label,
        };
      }
      if (n.type === 'gate') {
        const gateNode = n as PlacedGateNode;
        return {
          id: n.id,
          type: 'gate' as const,
          position: n.position,
          gateType: gateNode.gateType!,
          output: false,
          inputs: new Map(),
          label: n.label,
        };
      }
      // output
      return {
        id: n.id,
        type: 'output' as const,
        position: n.position,
        inputSignal: false,
        label: n.label,
      };
    });
    
    // Convert wires to connections
    const simConnections: CircuitConnection[] = state.wires.map((w: CircuitWire) => ({
      id: w.id,
      sourceNodeId: w.sourceNodeId,
      targetNodeId: w.targetNodeId,
      targetPort: w.targetPort,
      signal: w.signal,
    }));
    
    // Build input states
    const inputStates = new Map<string, SignalState>();
    for (const node of state.nodes) {
      if (node.type === 'input') {
        const inputNode = node as PlacedInputNode;
        inputStates.set(node.id, inputNode.state);
      }
    }
    
    // Run propagation
    const result = propagateSignals(simNodes, simConnections, inputStates);
    
    // Update node signals
    set((prevState: CircuitCanvasStore) => ({
      nodes: prevState.nodes.map((n: PlacedCircuitNode) => {
        const signal = result.finalSignals.get(n.id) ?? false;
        
        if (n.type === 'input') {
          return { ...n, signal };
        }
        if (n.type === 'gate') {
          return { ...n, output: signal, signal };
        }
        // output
        return { ...n, inputSignal: signal, signal };
      }),
      wires: prevState.wires.map((w: CircuitWire) => {
        const signal = result.finalSignals.get(w.sourceNodeId) ?? false;
        return { ...w, signal };
      }),
      cycleAffectedNodeIds: result.cycleDetected ? result.skippedNodes : [],
      isSimulating: false,
      simulationStepCount: prevState.simulationStepCount + 1,
    }));
  },
  
  // Reset circuit simulation
  resetCircuitSimulation: () => {
    set((state: CircuitCanvasStore) => {
      return {
        nodes: state.nodes.map((n: PlacedCircuitNode) => {
          if (n.type === 'input') {
            return { ...n, state: false, signal: false } as PlacedInputNode;
          }
          return { ...n, signal: false, output: false, inputSignal: false };
        }),
        wires: state.wires.map((w: CircuitWire) => ({ ...w, signal: false })),
        cycleAffectedNodeIds: [],
        simulationStepCount: 0,
      };
    });
  },
  
  // Clear circuit canvas
  clearCircuitCanvas: () => {
    set({
      nodes: [],
      wires: [],
      selectedNodeId: null,
      selectedWireId: null,
      isDrawingWire: false,
      wireStart: null,
      wirePreviewEnd: null,
      cycleAffectedNodeIds: [],
      simulationStepCount: 0,
    });
  },
  
  // Set cycle affected nodes
  setCycleAffectedNodes: (nodeIds: string[]) => {
    set({ cycleAffectedNodeIds: nodeIds });
  },
  
  // Get node by ID
  getNodeById: (nodeId: string): PlacedCircuitNode | undefined => {
    const state = useCircuitCanvasStore.getState();
    return state.nodes.find((n: PlacedCircuitNode) => n.id === nodeId);
  },
  
  // Get node signal
  getNodeSignal: (nodeId: string): SignalState => {
    const state = useCircuitCanvasStore.getState();
    const node = state.nodes.find((n: PlacedCircuitNode) => n.id === nodeId);
    return node?.signal ?? false;
  },
  
  // Get wire signal
  getWireSignal: (wireId: string): SignalState => {
    const state = useCircuitCanvasStore.getState();
    const wire = state.wires.find((w: CircuitWire) => w.id === wireId);
    return wire?.signal ?? false;
  },
  
  // Get all input nodes
  getInputNodes: (): PlacedInputNode[] => {
    const state = useCircuitCanvasStore.getState();
    return state.nodes.filter((n: PlacedCircuitNode) => n.type === 'input') as PlacedInputNode[];
  },
  
  // Get all gate nodes
  getGateNodes: (): PlacedGateNode[] => {
    const state = useCircuitCanvasStore.getState();
    return state.nodes.filter((n: PlacedCircuitNode) => n.type === 'gate') as PlacedGateNode[];
  },
  
  // Get all output nodes
  getOutputNodes: (): PlacedOutputNode[] => {
    const state = useCircuitCanvasStore.getState();
    return state.nodes.filter((n: PlacedCircuitNode) => n.type === 'output') as PlacedOutputNode[];
  },
}));
