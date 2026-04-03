/**
 * Circuit Simulation Hook
 * 
 * Round 121: Circuit Simulation Engine
 * 
 * React hook for managing circuit simulation state and actions.
 */

import { useCallback, useEffect } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import {
  GateType,
  SignalState,
  CircuitNode,
  CircuitConnection,
  InputNode,
  GateNode,
  SimulationStatus,
} from '../types/circuit';
import { evaluateGate } from '../engine/circuitSimulator';

/**
 * Hook return type
 */
export interface UseCircuitSimulationReturn {
  // State
  status: SimulationStatus;
  nodes: CircuitNode[];
  connections: CircuitConnection[];
  nodeSignals: Map<string, SignalState>;
  stepCount: number;
  isDirty: boolean;
  
  // Node management
  addInputNode: (x: number, y: number, label?: string) => InputNode;
  addGateNode: (gateType: GateType, x: number, y: number, label?: string) => GateNode;
  removeNode: (nodeId: string) => void;
  
  // Connection management
  addConnection: (sourceNodeId: string, targetNodeId: string, targetPort?: number) => CircuitConnection | null;
  removeConnection: (connectionId: string) => void;
  
  // Signal management
  toggleInput: (nodeId: string) => void;
  getNodeSignal: (nodeId: string) => SignalState;
  
  // Simulation control
  run: () => void;
  reset: () => void;
  step: () => void;
  
  // Circuit management
  clear: () => void;
  load: (nodes: CircuitNode[], connections: CircuitConnection[]) => void;
  
  // Queries
  getInputNodes: InputNode[];
  getGateNodes: GateNode[];
  isRunning: boolean;
  isIdle: boolean;
}

/**
 * Circuit simulation hook
 * Provides state and actions for circuit simulation
 */
export function useCircuitSimulation(): UseCircuitSimulationReturn {
  const store = useSimulationStore();
  
  // Auto-run simulation when circuit changes
  useEffect(() => {
    if (store.isDirty && store.nodes.length > 0) {
      store.runSimulation();
    }
  }, [store.nodes, store.connections, store.isDirty, store.nodes.length]);
  
  // Callbacks for actions
  const run = useCallback(() => {
    store.runSimulation();
  }, [store]);
  
  const reset = useCallback(() => {
    store.resetSimulation();
  }, [store]);
  
  const step = useCallback(() => {
    store.stepSimulation();
  }, [store]);
  
  const clear = useCallback(() => {
    store.clearCircuit();
  }, [store]);
  
  const load = useCallback((nodes: CircuitNode[], connections: CircuitConnection[]) => {
    store.loadCircuit(nodes, connections);
  }, [store]);
  
  return {
    // State
    status: store.status,
    nodes: store.nodes,
    connections: store.connections,
    nodeSignals: store.nodeSignals,
    stepCount: store.stepCount,
    isDirty: store.isDirty,
    
    // Node management
    addInputNode: store.addInputNode,
    addGateNode: store.addGateNode,
    removeNode: store.removeNode,
    
    // Connection management
    addConnection: store.addConnection,
    removeConnection: store.removeConnection,
    
    // Signal management
    toggleInput: store.toggleInput,
    getNodeSignal: store.getNodeSignal,
    
    // Simulation control
    run,
    reset,
    step,
    
    // Circuit management
    clear,
    load,
    
    // Queries
    getInputNodes: store.getInputNodes(),
    getGateNodes: store.getGateNodes(),
    isRunning: store.status === 'running' || store.status === 'completed',
    isIdle: store.status === 'idle',
  };
}

/**
 * Hook for single gate evaluation (no circuit context)
 * Useful for testing truth tables
 */
export function useGateEvaluator() {
  const evaluate = useCallback((gateType: GateType, inputs: SignalState[]): SignalState => {
    return evaluateGate(gateType, inputs);
  }, []);
  
  return { evaluate };
}
