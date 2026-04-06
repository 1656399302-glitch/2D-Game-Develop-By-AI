/**
 * Circuit Canvas Store
 * 
 * Round 122: Circuit Canvas Integration
 * Round 128: Added Timer, Counter, SR Latch, D Latch, D Flip-Flop support
 * Round 131: Multi-selection support for sub-circuit creation
 * Round 144: Added Junction and Layer support
 * Round 150: Signal Trace Integration for Timing Diagram
 * Round 151: Circuit Persistence System Integration
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
  CircuitJunction,
  CircuitLayer,
  CreateLayerOptions,
  DEFAULT_LAYER_COLORS,
} from '../types/circuitCanvas';
import {
  GateType,
  SignalState,
  CircuitNodeType,
  InputNode,
  GateNode,
  OutputNode,
  CircuitConnection,
  GATE_INPUT_COUNTS,
} from '../types/circuit';
import {
  propagateSignals,
  resetComponentStates,
} from '../engine/circuitSimulator';
import { v4 as uuidv4 } from 'uuid';
import { useSignalTraceStore } from './signalTraceStore';

// Round 151: Import persistence utilities
import {
  saveCircuitState as persistCircuitState,
  loadCircuitState as loadPersistedCircuitState,
  clearCircuitState as clearPersistedCircuitState,
  getRecentCircuits as getPersistedRecentCircuits,
  loadCircuitStateById,
  clearCircuitById,
  CircuitMetadata,
  SaveResult,
} from './circuitPersistence';

// ============================================================================
// Auto-save Configuration
// ============================================================================

/** Debounce delay for auto-save (ms) */
const AUTO_SAVE_DEBOUNCE = 500;

/** Auto-save timeout handle */
let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

// ============================================================================
// Store Interface
// ============================================================================

interface CircuitCanvasStore extends CanvasCircuitState {
  // Circuit mode
  setCircuitMode: (enabled: boolean) => void;
  
  // Node operations
  addCircuitNode: (type: CircuitNodeType, x: number, y: number, gateType?: GateType, label?: string, parameters?: Record<string, unknown>) => PlacedCircuitNode;
  removeCircuitNode: (nodeId: string) => void;
  selectCircuitNode: (nodeId: string | null) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  updateNodeParameters: (nodeId: string, parameters: Record<string, unknown>) => void;
  
  // Multi-selection operations (Round 131)
  selectCircuitNodes: (nodeIds: string[]) => void;
  toggleCircuitNodeSelection: (nodeId: string) => void;
  clearCircuitNodeSelection: () => void;
  addToCircuitSelection: (nodeIds: string[]) => void;
  removeFromCircuitSelection: (nodeIds: string[]) => void;
  
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
  
  // Junction operations (Round 144)
  createJunction: (x: number, y: number) => CircuitJunction;
  removeJunction: (junctionId: string) => void;
  selectJunction: (junctionId: string | null) => void;
  updateJunctionSignal: (junctionId: string, signal: SignalState) => void;
  connectWireToJunction: (wireId: string, junctionId: string) => void;
  
  // Layer operations (Round 144)
  createLayer: (options?: CreateLayerOptions) => CircuitLayer;
  removeLayer: (layerId: string) => boolean;
  setActiveLayer: (layerId: string) => void;
  renameLayer: (layerId: string, name: string) => void;
  toggleLayerVisibility: (layerId: string) => void;
  getActiveLayerNodes: () => PlacedCircuitNode[];
  getActiveLayerWires: () => CircuitWire[];
  moveNodesToLayer: (nodeIds: string[], targetLayerId: string) => void;

  // Round 151: Circuit Persistence Methods
  /** Save circuit state to localStorage (auto-save on state changes) */
  saveCircuitToStorage: (name?: string) => SaveResult;
  /** Load circuit state from localStorage */
  loadCircuitFromStorage: (slotIndex?: number) => boolean;
  /** Load circuit by ID */
  loadCircuitFromStorageById: (circuitId: string) => boolean;
  /** Get list of recent saved circuits */
  getRecentCircuits: () => CircuitMetadata[];
  /** Clear specific circuit slot or all circuits */
  clearStoredCircuit: (slotIndex?: number) => boolean;
  /** Trigger auto-save (debounced) */
  triggerAutoSave: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get input count for a gate type
 */
function getInputCount(gateType?: GateType): number {
  if (!gateType) return 2;
  return GATE_INPUT_COUNTS[gateType] ?? 2;
}

/**
 * Create a canvas circuit node from a simulation node
 */
function createPlacedNode(
  type: CircuitNodeType,
  x: number,
  y: number,
  gateType?: GateType,
  label?: string,
  parameters?: Record<string, unknown>,
  layerId?: string
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
    parameters,
    layerId,
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
      inputCount: getInputCount(gateType),
    } as PlacedGateNode;
  }
  
  return baseNode;
}

/**
 * Get Y position for a port on a node
 */
function getPortYPosition(gateType: GateType | undefined, portIndex: number, height: number): number {
  if (!gateType) {
    // Default: input/output nodes have single port in center
    return height / 2;
  }
  
  // Gate-specific port positions
  switch (gateType) {
    case 'AND':
    case 'OR':
    case 'NAND':
    case 'NOR':
    case 'XOR':
    case 'XNOR':
      // Two inputs, one output
      if (portIndex === 0) return height * 0.36;
      if (portIndex === 1) return height * 0.64;
      return height / 2;
    
    case 'NOT':
      // One input, one output
      return height / 2;
    
    case 'TIMER':
      // Two inputs (trigger, reset), two outputs (Q, done)
      if (portIndex === 0) return height * 0.36; // Trigger
      if (portIndex === 1) return height * 0.64; // Reset
      return height / 2;
    
    case 'COUNTER':
      // Three inputs (+, -, R), two outputs (Q, overflow)
      if (portIndex === 0) return height * 0.28; // +
      if (portIndex === 1) return height * 0.57; // -
      if (portIndex === 2) return height * 0.79; // R
      return height / 2;
    
    case 'SR_LATCH':
    case 'D_LATCH':
    case 'D_FLIP_FLOP':
      // Two inputs, two outputs
      if (portIndex === 0) return height * 0.36;
      if (portIndex === 1) return height * 0.57;
      return height / 2;
    
    default:
      return height / 2;
  }
}

/**
 * Generate next layer name
 */
function generateLayerName(existingNames: string[]): string {
  let counter = 1;
  let name = `Layer ${counter}`;
  
  while (existingNames.includes(name)) {
    counter++;
    name = `Layer ${counter}`;
  }
  
  return name;
}

/**
 * Map node IDs to readable signal names for timing diagram
 * Round 150: Signal trace integration
 */
function mapSignalsToReadableNames(
  signals: Map<string, SignalState>,
  nodes: PlacedCircuitNode[]
): Record<string, SignalState> {
  const result: Record<string, SignalState> = {};
  
  for (const node of nodes) {
    const signal = signals.get(node.id) ?? false;
    
    // Create readable names based on node type and label
    switch (node.type) {
      case 'input':
        // Use label or default name
        result[node.label || `IN-${node.id.slice(0, 4)}`] = signal;
        break;
      case 'gate':
        // Use gate type as name
        const gateNode = node as PlacedGateNode;
        result[gateNode.gateType || node.label || 'GATE'] = signal;
        break;
      case 'output':
        // Use label or default name
        result[node.label || `OUT-${node.id.slice(0, 4)}`] = signal;
        break;
      default:
        result[node.id] = signal;
    }
  }
  
  return result;
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
  selectedCircuitNodeIds: [], // Round 131: Multi-selection support
  selectedWireId: null,
  isDrawingWire: false,
  wireStart: null,
  wirePreviewEnd: null,
  cycleAffectedNodeIds: [],
  isSimulating: false,
  simulationStepCount: 0,
  // Round 144: Junction and Layer support
  junctions: [],
  layers: [],
  activeLayerId: null,
  
  // Circuit mode toggle
  setCircuitMode: (enabled: boolean) => {
    set({ isCircuitMode: enabled });
  },
  
  // Add circuit node
  addCircuitNode: (type: CircuitNodeType, x: number, y: number, gateType?: GateType, label?: string, parameters?: Record<string, unknown>) => {
    const state = _get();
    const activeLayerId = state.activeLayerId;
    
    const node = createPlacedNode(type, x, y, gateType, label, parameters, activeLayerId || undefined);
    
    set((prevState: CircuitCanvasStore) => ({
      nodes: [...prevState.nodes, node],
      selectedNodeId: node.id,
      // Round 131: Also update multi-selection
      selectedCircuitNodeIds: [node.id],
      // Round 144: Update layer nodeIds
      layers: activeLayerId
        ? prevState.layers.map(l =>
            l.id === activeLayerId
              ? { ...l, nodeIds: [...l.nodeIds, node.id] }
              : l
          )
        : prevState.layers,
    }));
    
    // Round 151: Trigger auto-save after adding node
    _get().triggerAutoSave();
    
    return node;
  },
  
  // Remove circuit node
  removeCircuitNode: (nodeId: string) => {
    set((state: CircuitCanvasStore) => {
      const node = state.nodes.find(n => n.id === nodeId);
      
      return {
        nodes: state.nodes.filter((n: PlacedCircuitNode) => n.id !== nodeId),
        wires: state.wires.filter(
          (w: CircuitWire) => w.sourceNodeId !== nodeId && w.targetNodeId !== nodeId
        ),
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        // Round 131: Remove from multi-selection
        selectedCircuitNodeIds: state.selectedCircuitNodeIds.filter(id => id !== nodeId),
        // Round 144: Update layer nodeIds
        layers: node?.layerId
          ? state.layers.map(l =>
              l.id === node.layerId
                ? { ...l, nodeIds: l.nodeIds.filter(id => id !== nodeId) }
                : l
            )
          : state.layers,
      };
    });
    
    // Round 151: Trigger auto-save after removing node
    _get().triggerAutoSave();
  },
  
  // Select circuit node (single selection - backward compatibility)
  selectCircuitNode: (nodeId: string | null) => {
    set((state: CircuitCanvasStore) => ({
      selectedNodeId: nodeId,
      // Round 131: Update multi-selection to match single selection for compatibility
      selectedCircuitNodeIds: nodeId ? [nodeId] : [],
      // Clear wire selection when selecting a node (backward compatibility)
      selectedWireId: nodeId ? null : state.selectedWireId,
    }));
  },
  
  // Round 131: Multi-selection operations
  // Select multiple nodes at once (replaces selection)
  selectCircuitNodes: (nodeIds: string[]) => {
    set({
      selectedCircuitNodeIds: nodeIds,
      // Keep first node ID for backward compatibility with single selection
      selectedNodeId: nodeIds.length > 0 ? nodeIds[0] : null,
    });
  },
  
  // Toggle selection of a single node (add if not selected, remove if selected)
  toggleCircuitNodeSelection: (nodeId: string) => {
    set((state: CircuitCanvasStore) => {
      const isSelected = state.selectedCircuitNodeIds.includes(nodeId);
      let newSelection: string[];
      
      if (isSelected) {
        // Remove from selection
        newSelection = state.selectedCircuitNodeIds.filter(id => id !== nodeId);
      } else {
        // Add to selection
        newSelection = [...state.selectedCircuitNodeIds, nodeId];
      }
      
      return {
        selectedCircuitNodeIds: newSelection,
        // Update single selection for backward compatibility
        selectedNodeId: newSelection.length > 0 ? newSelection[newSelection.length - 1] : null,
      };
    });
  },
  
  // Clear all multi-selection
  clearCircuitNodeSelection: () => {
    set({
      selectedCircuitNodeIds: [],
      selectedNodeId: null,
    });
  },
  
  // Add multiple nodes to existing selection
  addToCircuitSelection: (nodeIds: string[]) => {
    set((state: CircuitCanvasStore) => {
      const existingSet = new Set(state.selectedCircuitNodeIds);
      const newIds = nodeIds.filter(id => !existingSet.has(id));
      
      if (newIds.length === 0) {
        return state; // No new nodes to add
      }
      
      const newSelection = [...state.selectedCircuitNodeIds, ...newIds];
      
      return {
        selectedCircuitNodeIds: newSelection,
        selectedNodeId: newSelection.length > 0 ? newSelection[newSelection.length - 1] : null,
      };
    });
  },
  
  // Remove multiple nodes from selection
  removeFromCircuitSelection: (nodeIds: string[]) => {
    set((state: CircuitCanvasStore) => {
      const idsToRemove = new Set(nodeIds);
      const newSelection = state.selectedCircuitNodeIds.filter(id => !idsToRemove.has(id));
      
      return {
        selectedCircuitNodeIds: newSelection,
        selectedNodeId: newSelection.length > 0 ? newSelection[newSelection.length - 1] : null,
      };
    });
  },
  
  // Update node position
  updateNodePosition: (nodeId: string, x: number, y: number) => {
    set((state: CircuitCanvasStore) => ({
      nodes: state.nodes.map((n: PlacedCircuitNode) =>
        n.id === nodeId ? { ...n, position: { x, y } } : n
      ),
    }));
    
    // Round 151: Trigger auto-save after position update
    _get().triggerAutoSave();
  },
  
  // Update node parameters (for Timer/Counter configuration)
  updateNodeParameters: (nodeId: string, parameters: Record<string, unknown>) => {
    set((state: CircuitCanvasStore) => ({
      nodes: state.nodes.map((n: PlacedCircuitNode) =>
        n.id === nodeId ? { ...n, parameters: { ...n.parameters, ...parameters } } : n
      ),
    }));
    
    // Round 151: Trigger auto-save after parameter update
    _get().triggerAutoSave();
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
      
      // Round 173: Reject self-connections
      if (sourceNodeId === targetNodeId) {
        console.warn('Cannot create wire from a node to itself');
        return state;
      }
      
      // Round 144: Check layer isolation
      if (sourceNode.layerId && targetNode.layerId && sourceNode.layerId !== targetNode.layerId) {
        // Cannot create wire between different layers
        console.warn('Cannot create wire between nodes on different layers');
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
      
      // Calculate wire positions based on port locations
      const sourceSize = sourceNode.size || CIRCUIT_NODE_SIZES[sourceNode.type] || { width: 60, height: 60 };
      const targetSize = targetNode.size || CIRCUIT_NODE_SIZES[targetNode.type] || { width: 60, height: 60 };
      
      // Determine port y positions
      const sourceGateType = sourceNode.type === 'gate' ? (sourceNode as PlacedGateNode).gateType : undefined;
      const targetGateType = targetNode.type === 'gate' ? (targetNode as PlacedGateNode).gateType : undefined;
      
      const sourcePortY = getPortYPosition(sourceGateType, targetPort, sourceSize.height);
      const targetPortY = getPortYPosition(targetGateType, targetPort, targetSize.height);
      
      const startPoint = {
        x: sourceNode.position.x + sourceSize.width,
        y: sourceNode.position.y + sourcePortY,
      };
      
      const endPoint = {
        x: targetNode.position.x,
        y: targetNode.position.y + targetPortY,
      };
      
      // Determine layer ID (from source node)
      const layerId = sourceNode.layerId || undefined;
      
      wire = {
        id: uuidv4(),
        sourceNodeId,
        targetNodeId,
        targetPort,
        signal: false,
        startPoint,
        endPoint,
        layerId,
      };
      
      return {
        wires: [...state.wires, wire],
        // Round 144: Update layer wireIds
        layers: layerId
          ? state.layers.map(l =>
              l.id === layerId
                ? { ...l, wireIds: [...l.wireIds, wire!.id] }
                : l
            )
          : state.layers,
      };
    });
    
    // Round 151: Trigger auto-save after adding wire
    _get().triggerAutoSave();
    
    return wire;
  },
  
  // Remove circuit wire
  removeCircuitWire: (wireId: string) => {
    set((state: CircuitCanvasStore) => {
      const wire = state.wires.find(w => w.id === wireId);
      
      return {
        wires: state.wires.filter((w: CircuitWire) => w.id !== wireId),
        selectedWireId: state.selectedWireId === wireId ? null : state.selectedWireId,
        // Round 144: Update layer wireIds
        layers: wire?.layerId
          ? state.layers.map(l =>
              l.id === wire.layerId
                ? { ...l, wireIds: l.wireIds.filter(id => id !== wireId) }
                : l
            )
          : state.layers,
        // Round 144: Update junction connection counts
        junctions: state.junctions.map(j =>
          j.connectedWireIds.includes(wireId)
            ? {
                ...j,
                connectedWireIds: j.connectedWireIds.filter(id => id !== wireId),
                connectionCount: j.connectionCount - 1,
              }
            : j
        ),
      };
    });
    
    // Round 151: Trigger auto-save after removing wire
    _get().triggerAutoSave();
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
    const wireStart = _get().wireStart;
    if (!wireStart) {
      set({ isDrawingWire: false, wireStart: null, wirePreviewEnd: null });
      return;
    }
    
    // Add the wire
    _get().addCircuitWire(wireStart.nodeId, targetNodeId, targetPort);
    
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
    }));
    
    // Auto-run simulation after toggle
    _get().runCircuitSimulation();
  },
  
  // Run circuit simulation
  runCircuitSimulation: () => {
    const state = _get();
    
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
          parameters: n.parameters,
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
    
    // Round 150: Record signals for timing diagram
    // Map node signals to readable names
    const mappedSignals = mapSignalsToReadableNames(result.finalSignals, state.nodes);
    useSignalTraceStore.getState().recordStep(mappedSignals);
    
    // Update node signals
    set((prevState: CircuitCanvasStore) => ({
      nodes: prevState.nodes.map((n: PlacedCircuitNode) => {
        const signal = result.finalSignals.get(n.id) ?? false;
        
        if (n.type === 'input') {
          return { ...n, signal };
        }
        if (n.type === 'gate') {
          // Preserve parameters for stateful gates
          const gateNode = n as PlacedGateNode;
          const params = { ...n.parameters };
          
          // For stateful gates, preserve internal state from parameters
          if (gateNode.gateType === 'TIMER') {
            // Timer parameters
          } else if (gateNode.gateType === 'COUNTER') {
            // Counter parameters
          } else if (gateNode.gateType === 'SR_LATCH' || gateNode.gateType === 'D_LATCH' || gateNode.gateType === 'D_FLIP_FLOP') {
            // Memory parameters
          }
          
          return { ...n, output: signal, signal, parameters: params };
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
    // Reset component states
    resetComponentStates();
    
    // Round 150: Clear signal traces on reset
    useSignalTraceStore.getState().clearTraces();
    
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
    // Reset component states
    resetComponentStates();
    
    // Round 150: Clear signal traces on clear
    useSignalTraceStore.getState().clearTraces();
    
    set({
      nodes: [],
      wires: [],
      selectedNodeId: null,
      selectedCircuitNodeIds: [], // Round 131: Clear multi-selection
      selectedWireId: null,
      isDrawingWire: false,
      wireStart: null,
      wirePreviewEnd: null,
      cycleAffectedNodeIds: [],
      simulationStepCount: 0,
      junctions: [], // Round 144: Clear junctions
      // Keep layers but clear their node/wire references
      layers: _get().layers.map(l => ({ ...l, nodeIds: [], wireIds: [] })),
    });
    
    // Round 151: Clear persisted circuit state when canvas is cleared
    clearPersistedCircuitState();
  },
  
  // Set cycle affected nodes
  setCycleAffectedNodes: (nodeIds: string[]) => {
    set({ cycleAffectedNodeIds: nodeIds });
  },
  
  // Get node by ID
  getNodeById: (nodeId: string): PlacedCircuitNode | undefined => {
    const state = _get();
    return state.nodes.find((n: PlacedCircuitNode) => n.id === nodeId);
  },
  
  // Get node signal
  getNodeSignal: (nodeId: string): SignalState => {
    const state = _get();
    const node = state.nodes.find((n: PlacedCircuitNode) => n.id === nodeId);
    return node?.signal ?? false;
  },
  
  // Get wire signal
  getWireSignal: (wireId: string): SignalState => {
    const state = _get();
    const wire = state.wires.find((w: CircuitWire) => w.id === wireId);
    return wire?.signal ?? false;
  },
  
  // Get all input nodes
  getInputNodes: (): PlacedInputNode[] => {
    const state = _get();
    return state.nodes.filter((n: PlacedCircuitNode) => n.type === 'input') as PlacedInputNode[];
  },
  
  // Get all gate nodes
  getGateNodes: (): PlacedGateNode[] => {
    const state = _get();
    return state.nodes.filter((n: PlacedCircuitNode) => n.type === 'gate') as PlacedGateNode[];
  },
  
  // Get all output nodes
  getOutputNodes: (): PlacedOutputNode[] => {
    const state = _get();
    return state.nodes.filter((n: PlacedCircuitNode) => n.type === 'output') as PlacedOutputNode[];
  },
  
  // ============================================================
  // Junction Operations (Round 144)
  // ============================================================
  
  /**
   * Create a new junction at the specified position
   */
  createJunction: (x: number, y: number): CircuitJunction => {
    const state = _get();
    const activeLayerId = state.activeLayerId;
    
    const junction: CircuitJunction = {
      id: uuidv4(),
      type: 'junction',
      position: { x, y },
      signal: false,
      connectionCount: 0,
      connectedWireIds: [],
      layerId: activeLayerId || undefined,
    };
    
    set((prevState: CircuitCanvasStore) => ({
      junctions: [...prevState.junctions, junction],
    }));
    
    return junction;
  },
  
  /**
   * Remove a junction
   */
  removeJunction: (junctionId: string) => {
    set((state: CircuitCanvasStore) => ({
      junctions: state.junctions.filter(j => j.id !== junctionId),
    }));
  },
  
  /**
   * Select a junction (for UI highlighting)
   */
  selectJunction: (junctionId: string | null) => {
    // Junction selection could be handled via a separate state if needed
    // For now, we just log it
    console.log('Selected junction:', junctionId);
  },
  
  /**
   * Update junction signal state
   */
  updateJunctionSignal: (junctionId: string, signal: SignalState) => {
    set((state: CircuitCanvasStore) => ({
      junctions: state.junctions.map(j =>
        j.id === junctionId ? { ...j, signal } : j
      ),
    }));
  },
  
  /**
   * Connect a wire to a junction
   */
  connectWireToJunction: (wireId: string, junctionId: string) => {
    set((state: CircuitCanvasStore) => ({
      junctions: state.junctions.map(j =>
        j.id === junctionId
          ? {
              ...j,
              connectedWireIds: [...j.connectedWireIds, wireId],
              connectionCount: j.connectionCount + 1,
            }
          : j
      ),
    }));
  },
  
  // ============================================================
  // Layer Operations (Round 144)
  // ============================================================
  
  /**
   * Create a new layer
   */
  createLayer: (options?: CreateLayerOptions): CircuitLayer => {
    const state = _get();
    const existingNames = state.layers.map(l => l.name);
    const name = options?.name || generateLayerName(existingNames);
    const color = options?.color || DEFAULT_LAYER_COLORS[state.layers.length % DEFAULT_LAYER_COLORS.length];
    
    const layer: CircuitLayer = {
      id: uuidv4(),
      name,
      visible: true,
      color,
      order: state.layers.length,
      nodeIds: [],
      wireIds: [],
    };
    
    set((prevState: CircuitCanvasStore) => ({
      layers: [...prevState.layers, layer],
      // If this is the first layer, set it as active
      activeLayerId: prevState.activeLayerId || layer.id,
    }));
    
    return layer;
  },
  
  /**
   * Remove a layer
   */
  removeLayer: (layerId: string): boolean => {
    const state = _get();
    
    // Cannot remove if it's the last layer
    if (state.layers.length <= 1) {
      return false;
    }
    
    const layer = state.layers.find(l => l.id === layerId);
    if (!layer) {
      return false;
    }
    
    set((prevState: CircuitCanvasStore) => {
      // Remove nodes and wires on this layer
      const nodesToRemove = new Set(layer.nodeIds);
      const wiresToRemove = new Set(layer.wireIds);
      
      const newLayers = prevState.layers.filter(l => l.id !== layerId);
      
      // If removing active layer, switch to first remaining layer
      const newActiveLayerId = prevState.activeLayerId === layerId
        ? newLayers[0]?.id || null
        : prevState.activeLayerId;
      
      return {
        layers: newLayers,
        activeLayerId: newActiveLayerId,
        nodes: prevState.nodes.filter(n => !nodesToRemove.has(n.id)),
        wires: prevState.wires.filter(w => !wiresToRemove.has(w.id)),
        // Clear selection if selected nodes were removed
        selectedNodeId: nodesToRemove.has(prevState.selectedNodeId || '') ? null : prevState.selectedNodeId,
        selectedCircuitNodeIds: prevState.selectedCircuitNodeIds.filter(id => !nodesToRemove.has(id)),
      };
    });
    
    return true;
  },
  
  /**
   * Set active layer
   */
  setActiveLayer: (layerId: string) => {
    const state = _get();
    const layer = state.layers.find(l => l.id === layerId);
    
    if (layer) {
      set({ activeLayerId: layerId });
    }
  },
  
  /**
   * Rename a layer
   */
  renameLayer: (layerId: string, name: string) => {
    set((state: CircuitCanvasStore) => ({
      layers: state.layers.map(l =>
        l.id === layerId ? { ...l, name } : l
      ),
    }));
  },
  
  /**
   * Toggle layer visibility
   */
  toggleLayerVisibility: (layerId: string) => {
    set((state: CircuitCanvasStore) => ({
      layers: state.layers.map(l =>
        l.id === layerId ? { ...l, visible: !l.visible } : l
      ),
    }));
  },
  
  /**
   * Get nodes on the active layer
   */
  getActiveLayerNodes: (): PlacedCircuitNode[] => {
    const state = _get();
    
    if (!state.activeLayerId) {
      // If no active layer, return all nodes
      return state.nodes;
    }
    
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
    if (!activeLayer) {
      return state.nodes;
    }
    
    // Only return visible layers
    if (!activeLayer.visible) {
      return [];
    }
    
    return state.nodes.filter(n => n.layerId === state.activeLayerId);
  },
  
  /**
   * Get wires on the active layer
   */
  getActiveLayerWires: (): CircuitWire[] => {
    const state = _get();
    
    if (!state.activeLayerId) {
      // If no active layer, return all wires
      return state.wires;
    }
    
    const activeLayer = state.layers.find(l => l.id === state.activeLayerId);
    if (!activeLayer) {
      return state.wires;
    }
    
    // Only return visible layers
    if (!activeLayer.visible) {
      return [];
    }
    
    return state.wires.filter(w => w.layerId === state.activeLayerId);
  },
  
  /**
   * Move nodes to a different layer
   */
  moveNodesToLayer: (nodeIds: string[], targetLayerId: string) => {
    set((state: CircuitCanvasStore) => {
      const sourceLayerIds = new Set(nodeIds.map(id => {
        const node = state.nodes.find(n => n.id === id);
        return node?.layerId;
      }));
      
      return {
        nodes: state.nodes.map(n =>
          nodeIds.includes(n.id)
            ? { ...n, layerId: targetLayerId }
            : n
        ),
        layers: state.layers.map(l => {
          // Remove nodeIds from source layers
          if (sourceLayerIds.has(l.id) && l.id !== targetLayerId) {
            return {
              ...l,
              nodeIds: l.nodeIds.filter(id => !nodeIds.includes(id)),
            };
          }
          // Add nodeIds to target layer
          if (l.id === targetLayerId) {
            const existingIds = new Set(l.nodeIds);
            const newIds = nodeIds.filter(id => !existingIds.has(id));
            return {
              ...l,
              nodeIds: [...l.nodeIds, ...newIds],
            };
          }
          return l;
        }),
      };
    });
  },

  // ============================================================
  // Round 151: Circuit Persistence Methods
  // ============================================================
  
  /**
   * Save circuit state to localStorage
   * Called after every state mutation (auto-save)
   */
  saveCircuitToStorage: (name?: string): SaveResult => {
    const state = _get();
    
    const result = persistCircuitState(
      state.nodes,
      state.wires,
      state.junctions,
      state.layers,
      state.activeLayerId,
      undefined, // Generate new ID for new saves
      name
    );
    
    return result;
  },
  
  /**
   * Load circuit state from localStorage
   * Called on store initialization to restore previous session
   */
  loadCircuitFromStorage: (slotIndex?: number): boolean => {
    const data = loadPersistedCircuitState(slotIndex);
    
    if (!data) {
      return false;
    }
    
    set({
      nodes: data.nodes || [],
      wires: data.wires || [],
      junctions: data.junctions || [],
      layers: data.layers || [],
      activeLayerId: data.activeLayerId || null,
      selectedNodeId: null,
      selectedCircuitNodeIds: [],
      selectedWireId: null,
      isDrawingWire: false,
      wireStart: null,
      wirePreviewEnd: null,
      cycleAffectedNodeIds: [],
      simulationStepCount: 0,
    });
    
    return true;
  },
  
  /**
   * Load circuit by specific ID
   */
  loadCircuitFromStorageById: (circuitId: string): boolean => {
    const data = loadCircuitStateById(circuitId);
    
    if (!data) {
      return false;
    }
    
    set({
      nodes: data.nodes || [],
      wires: data.wires || [],
      junctions: data.junctions || [],
      layers: data.layers || [],
      activeLayerId: data.activeLayerId || null,
      selectedNodeId: null,
      selectedCircuitNodeIds: [],
      selectedWireId: null,
      isDrawingWire: false,
      wireStart: null,
      wirePreviewEnd: null,
      cycleAffectedNodeIds: [],
      simulationStepCount: 0,
    });
    
    return true;
  },
  
  /**
   * Get list of recent saved circuits
   */
  getRecentCircuits: (): CircuitMetadata[] => {
    return getPersistedRecentCircuits();
  },
  
  /**
   * Clear circuit from storage
   */
  clearStoredCircuit: (slotIndex?: number): boolean => {
    if (slotIndex !== undefined) {
      // Clear specific slot by finding the circuit ID first
      const recent = getPersistedRecentCircuits();
      const metadata = recent.find(c => c.slotIndex === slotIndex);
      if (metadata) {
        clearCircuitById(metadata.id);
        return true;
      }
    }
    
    // Clear all circuit data
    return clearPersistedCircuitState();
  },
  
  /**
   * Trigger auto-save with debouncing
   * Called after state mutations to persist changes
   */
  triggerAutoSave: () => {
    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Set new timeout for debounced save
    autoSaveTimeout = setTimeout(() => {
      const state = _get();
      
      // Only save if there's actual content
      if (state.nodes.length > 0 || state.wires.length > 0) {
        persistCircuitState(
          state.nodes,
          state.wires,
          state.junctions,
          state.layers,
          state.activeLayerId
        );
      }
    }, AUTO_SAVE_DEBOUNCE);
  },
}));
