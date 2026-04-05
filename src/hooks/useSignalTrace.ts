/**
 * useSignalTrace Hook
 * 
 * Round 149: Circuit Signal Visualization
 * 
 * Custom hook for capturing and managing signal traces during
 * circuit simulation. Integrates with the simulation store to
 * automatically record signal states at each simulation step.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSimulationStore } from '../store/useSimulationStore';
import {
  useSignalTraceStore,
  SignalTraceEntry,
} from '../store/signalTraceStore';
import { SignalState, GateNode } from '../types/circuit';

// ============================================================================
// Types
// ============================================================================

/**
 * Signal trace hook configuration
 */
export interface UseSignalTraceConfig {
  /** Whether to auto-record on simulation step */
  autoRecord?: boolean;
  /** Maximum number of steps to retain */
  maxSteps?: number;
  /** Custom signal names (if not provided, uses node labels) */
  signalNames?: string[];
}

/**
 * Signal trace hook return type
 */
export interface UseSignalTraceReturn {
  /** Current traces */
  traces: SignalTraceEntry[];
  /** Current step count */
  stepCount: number;
  /** Whether recording is active */
  isRecording: boolean;
  /** Latest trace entry */
  latestTrace: SignalTraceEntry | null;
  /** Record current simulation state */
  recordCurrentState: () => void;
  /** Clear all traces */
  clearTraces: () => void;
  /** Start recording */
  startRecording: () => void;
  /** Stop recording */
  stopRecording: () => void;
  /** Get signal history for a specific signal */
  getSignalHistory: (signalName: string) => SignalState[];
  /** Get signals from a specific step */
  getStepSignals: (step: number) => Record<string, SignalState> | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for capturing signal traces during circuit simulation
 * 
 * @param config - Configuration options
 * @returns Signal trace utilities and state
 */
export function useSignalTrace(config: UseSignalTraceConfig = {}): UseSignalTraceReturn {
  const {
    autoRecord = true,
    maxSteps = 100,
    signalNames: customSignalNames,
  } = config;

  // Get simulation store state and actions
  const nodes = useSimulationStore((state) => state.nodes);
  const nodeSignals = useSimulationStore((state) => state.nodeSignals);
  const simulationStepCount = useSimulationStore((state) => state.stepCount);
  
  // Get signal trace store state and actions
  const traces = useSignalTraceStore((state) => state.traces);
  const isRecording = useSignalTraceStore((state) => state.metadata.isRecording);
  const recordStep = useSignalTraceStore((state) => state.recordStep);
  const clearTraces = useSignalTraceStore((state) => state.clearTraces);
  const startRecording = useSignalTraceStore((state) => state.startRecording);
  const stopRecording = useSignalTraceStore((state) => state.stopRecording);
  const setSignalNames = useSignalTraceStore((state) => state.setSignalNames);
  const getSignalHistory = useSignalTraceStore((state) => state.getSignalHistory);
  const getLatestTrace = useSignalTraceStore((state) => state.getLatestTrace);
  const getTrace = useSignalTraceStore((state) => state.getTrace);
  
  // Store config values in refs for use in callbacks
  const autoRecordRef = useRef(autoRecord);
  autoRecordRef.current = autoRecord;
  
  // Set max steps on mount
  useEffect(() => {
    useSignalTraceStore.setState((state) => ({
      metadata: {
        ...state.metadata,
        maxSteps,
      },
    }));
  }, [maxSteps]);
  
  // Set custom signal names if provided
  useEffect(() => {
    if (customSignalNames && customSignalNames.length > 0) {
      setSignalNames(customSignalNames);
    }
  }, [customSignalNames, setSignalNames]);
  
  /**
   * Record the current simulation state as a trace entry
   * Defined as a callback to avoid dependency issues
   */
  const recordCurrentState = useCallback(() => {
    // Build signals object from node states
    const signals: Record<string, SignalState> = {};
    
    for (const node of nodes) {
      const signalValue = nodeSignals.get(node.id) ?? false;
      
      // Use label if available, otherwise use node type + id
      const signalName = node.label || `${node.type}-${node.id}`;
      signals[signalName] = signalValue;
      
      // Also store by ID for direct lookup
      signals[node.id] = signalValue;
      
      // For input nodes, also store by label if present
      if (node.type === 'input' && node.label) {
        signals[node.label] = signalValue;
      }
      
      // For gate nodes, store by gate type and label
      if (node.type === 'gate') {
        const gateNode = node as GateNode;
        signals[`gate-${gateNode.gateType}-${node.id}`] = signalValue;
        if (node.label) {
          signals[node.label] = signalValue;
        }
      }
    }
    
    recordStep(signals);
  }, [nodes, nodeSignals, recordStep]);
  
  // Auto-record on simulation step changes (when autoRecord is enabled)
  useEffect(() => {
    if (autoRecordRef.current && isRecording && simulationStepCount > traces.length) {
      // Build signals object from node states
      const signals: Record<string, SignalState> = {};
      
      for (const node of nodes) {
        const signalValue = nodeSignals.get(node.id) ?? false;
        const signalName = node.label || `${node.type}-${node.id}`;
        signals[signalName] = signalValue;
        signals[node.id] = signalValue;
        
        if (node.type === 'input' && node.label) {
          signals[node.label] = signalValue;
        }
        
        if (node.type === 'gate') {
          const gateNode = node as GateNode;
          signals[`gate-${gateNode.gateType}-${node.id}`] = signalValue;
          if (node.label) {
            signals[node.label] = signalValue;
          }
        }
      }
      
      recordStep(signals);
    }
  }, [simulationStepCount, isRecording, nodes, nodeSignals, recordStep, traces.length]);
  
  /**
   * Get signals from a specific step
   * @param step - Step index
   * @returns Signals at that step or null if not found
   */
  const getStepSignals = useCallback((step: number): Record<string, SignalState> | null => {
    const trace = getTrace().find((t) => t.step === step);
    return trace ? trace.signals : null;
  }, [getTrace]);
  
  return {
    traces,
    stepCount: traces.length,
    isRecording,
    latestTrace: getLatestTrace(),
    recordCurrentState,
    clearTraces,
    startRecording,
    stopRecording,
    getSignalHistory,
    getStepSignals,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract unique signal names from traces
 * @param traces - Array of trace entries
 * @returns Array of unique signal names
 */
export function extractSignalNames(traces: SignalTraceEntry[]): string[] {
  const nameSet = new Set<string>();
  
  for (const trace of traces) {
    for (const key of Object.keys(trace.signals)) {
      // Skip ID-based keys, keep label-based keys
      if (!key.startsWith('input-') && !key.startsWith('gate-') && !key.startsWith('output-')) {
        nameSet.add(key);
      }
    }
  }
  
  return Array.from(nameSet);
}

/**
 * Format signal state for display
 * @param state - Signal state
 * @returns Formatted string
 */
export function formatSignalState(state: SignalState): string {
  return state ? 'HIGH' : 'LOW';
}

/**
 * Get step labels for timing diagram
 * @param stepCount - Total number of steps
 * @param format - Format function for each step
 * @returns Array of step labels
 */
export function getStepLabels(
  stepCount: number,
  format: (step: number) => string = (s) => `t${s}`
): string[] {
  return Array.from({ length: stepCount }, (_, i) => format(i));
}

export default useSignalTrace;
