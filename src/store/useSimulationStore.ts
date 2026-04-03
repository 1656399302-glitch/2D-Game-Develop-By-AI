/**
 * Simulation Store
 * 
 * Round 121: Circuit Simulation Engine
 * 
 * Zustand store for managing circuit simulation state.
 */

import { create } from 'zustand';
import {
  CircuitNode,
  CircuitConnection,
  SignalState,
  SimulationStatus,
  GateType,
  GateNode,
  InputNode,
} from '../types/circuit';
import {
  createInputNode,
  createGateNode,
  createConnection,
  propagateSignals,
} from '../engine/circuitSimulator';

interface SimulationStore {
  // Simulation status
  status: SimulationStatus;
  
  // Circuit data
  nodes: CircuitNode[];
  connections: CircuitConnection[];
  
  // Signal states (nodeId -> signal state)
  nodeSignals: Map<string, SignalState>;
  
  // Step count for debugging
  stepCount: number;
  
  // Dirty flag - true when circuit has been modified
  isDirty: boolean;
  
  // Actions
  addInputNode: (x: number, y: number, label?: string) => InputNode;
  addGateNode: (gateType: GateType, x: number, y: number, label?: string) => GateNode;
  removeNode: (nodeId: string) => void;
  addConnection: (sourceNodeId: string, targetNodeId: string, targetPort?: number) => CircuitConnection | null;
  removeConnection: (connectionId: string) => void;
  
  // Signal management
  toggleInput: (nodeId: string) => void;
  setInputState: (nodeId: string, state: SignalState) => void;
  getNodeSignal: (nodeId: string) => SignalState;
  
  // Simulation control
  runSimulation: () => void;
  resetSimulation: () => void;
  stepSimulation: () => void;
  
  // Circuit management
  clearCircuit: () => void;
  loadCircuit: (nodes: CircuitNode[], connections: CircuitConnection[]) => void;
  
  // Getters
  getInputNodes: () => InputNode[];
  getGateNodes: () => GateNode[];
  getNodesByType: (type: CircuitNode['type']) => CircuitNode[];
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state
  status: 'idle',
  nodes: [],
  connections: [],
  nodeSignals: new Map(),
  stepCount: 0,
  isDirty: false,
  
  // Add input node
  addInputNode: (x, y, label) => {
    const node = createInputNode({ x, y }, label);
    set((state) => ({
      nodes: [...state.nodes, node],
      nodeSignals: new Map(state.nodeSignals).set(node.id, false),
      isDirty: true,
    }));
    return node;
  },
  
  // Add gate node
  addGateNode: (gateType, x, y, label) => {
    const node = createGateNode(gateType, { x, y }, label);
    set((state) => ({
      nodes: [...state.nodes, node],
      nodeSignals: new Map(state.nodeSignals).set(node.id, false),
      isDirty: true,
    }));
    return node;
  },
  
  // Remove node and its connections
  removeNode: (nodeId) => {
    set((state) => {
      const newNodes = state.nodes.filter((n) => n.id !== nodeId);
      const newConnections = state.connections.filter(
        (c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
      );
      const newSignals = new Map(state.nodeSignals);
      newSignals.delete(nodeId);
      return {
        nodes: newNodes,
        connections: newConnections,
        nodeSignals: newSignals,
        isDirty: true,
      };
    });
  },
  
  // Add connection
  addConnection: (sourceNodeId, targetNodeId, targetPort = 0) => {
    const state = get();
    
    // Validate nodes exist
    const sourceNode = state.nodes.find((n) => n.id === sourceNodeId);
    const targetNode = state.nodes.find((n) => n.id === targetNodeId);
    
    if (!sourceNode || !targetNode) {
      return null;
    }
    
    // Check for duplicate connection
    const existingConnection = state.connections.find(
      (c) => c.sourceNodeId === sourceNodeId && 
            c.targetNodeId === targetNodeId && 
            c.targetPort === targetPort
    );
    
    if (existingConnection) {
      return null;
    }
    
    const connection = createConnection(sourceNodeId, targetNodeId, targetPort);
    set((state) => ({
      connections: [...state.connections, connection],
      isDirty: true,
    }));
    return connection;
  },
  
  // Remove connection
  removeConnection: (connectionId) => {
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== connectionId),
      isDirty: true,
    }));
  },
  
  // Toggle input node state
  toggleInput: (nodeId) => {
    set((state) => {
      const node = state.nodes.find((n) => n.id === nodeId);
      if (!node || node.type !== 'input') return state;
      
      const inputNode = node as InputNode;
      const newState = !inputNode.state;
      const newSignals = new Map(state.nodeSignals);
      newSignals.set(nodeId, newState);
      
      return {
        nodes: state.nodes.map((n) =>
          n.id === nodeId ? { ...n, state: newState } : n
        ),
        nodeSignals: newSignals,
        isDirty: true,
      };
    });
  },
  
  // Set input state directly
  setInputState: (nodeId, newState) => {
    set((state) => {
      const newSignals = new Map(state.nodeSignals);
      newSignals.set(nodeId, newState);
      
      return {
        nodes: state.nodes.map((n) =>
          n.id === nodeId && n.type === 'input' 
            ? { ...n, state: newState } 
            : n
        ),
        nodeSignals: newSignals,
        isDirty: true,
      };
    });
  },
  
  // Get signal for a node
  getNodeSignal: (nodeId) => {
    return get().nodeSignals.get(nodeId) ?? false;
  },
  
  // Run simulation
  runSimulation: () => {
    const state = get();
    set({ status: 'running' });
    
    // Build input states map
    const inputStates = new Map<string, SignalState>();
    for (const node of state.nodes) {
      if (node.type === 'input') {
        inputStates.set(node.id, (node as InputNode).state);
      }
    }
    
    // Propagate signals
    const result = propagateSignals(state.nodes, state.connections, inputStates);
    
    set((prevState) => ({
      nodeSignals: result.finalSignals,
      stepCount: prevState.stepCount + 1,
      status: 'completed',
      isDirty: false,
    }));
  },
  
  // Reset simulation
  resetSimulation: () => {
    set((state) => {
      const newSignals = new Map<string, SignalState>();
      
      // Reset input nodes to false, others to false
      for (const node of state.nodes) {
        if (node.type === 'input') {
          newSignals.set(node.id, false);
        } else {
          newSignals.set(node.id, false);
        }
      }
      
      return {
        status: 'idle',
        nodeSignals: newSignals,
        stepCount: 0,
      };
    });
  },
  
  // Step simulation (single evaluation pass)
  stepSimulation: () => {
    const state = get();
    
    // Run a single propagation pass
    const inputStates = new Map<string, SignalState>();
    for (const node of state.nodes) {
      if (node.type === 'input') {
        inputStates.set(node.id, (node as InputNode).state);
      }
    }
    
    const result = propagateSignals(state.nodes, state.connections, inputStates);
    
    set((prevState) => ({
      nodeSignals: result.finalSignals,
      stepCount: prevState.stepCount + 1,
      status: 'running',
    }));
  },
  
  // Clear entire circuit
  clearCircuit: () => {
    set({
      nodes: [],
      connections: [],
      nodeSignals: new Map(),
      stepCount: 0,
      status: 'idle',
      isDirty: false,
    });
  },
  
  // Load a circuit
  loadCircuit: (nodes, connections) => {
    const nodeSignals = new Map<string, SignalState>();
    for (const node of nodes) {
      if (node.type === 'input') {
        nodeSignals.set(node.id, (node as InputNode).state);
      } else {
        nodeSignals.set(node.id, false);
      }
    }
    
    set({
      nodes,
      connections,
      nodeSignals,
      stepCount: 0,
      status: 'idle',
      isDirty: false,
    });
  },
  
  // Get all input nodes
  getInputNodes: () => {
    return get().nodes.filter((n) => n.type === 'input') as InputNode[];
  },
  
  // Get all gate nodes
  getGateNodes: () => {
    return get().nodes.filter((n) => n.type === 'gate') as GateNode[];
  },
  
  // Get nodes by type
  getNodesByType: (type) => {
    return get().nodes.filter((n) => n.type === type);
  },
}));
