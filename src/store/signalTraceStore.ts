/**
 * Signal Trace Store
 * 
 * Round 149: Circuit Signal Visualization
 * 
 * Zustand store for capturing and managing signal trace data
 * during circuit simulation. Records signal states at each
 * simulation step for visualization in timing diagrams.
 */

import { create } from 'zustand';
import { SignalState } from '../types/circuit';

// ============================================================================
// Types
// ============================================================================

/**
 * Signal value at a specific time step
 */
export interface SignalTraceEntry {
  /** Step index (0-based) */
  step: number;
  /** Signal values keyed by node ID or signal name */
  signals: Record<string, SignalState>;
  /** Timestamp when this trace was recorded */
  timestamp: number;
}

/**
 * Signal trace metadata
 */
export interface SignalTraceMetadata {
  /** Total number of steps recorded */
  stepCount: number;
  /** Signal names being tracked */
  signalNames: string[];
  /** Whether trace is currently recording */
  isRecording: boolean;
  /** Maximum steps to retain (for memory management) */
  maxSteps: number;
}

/**
 * Store state interface
 */
interface SignalTraceStoreState {
  /** All recorded trace entries */
  traces: SignalTraceEntry[];
  
  /** Trace metadata */
  metadata: SignalTraceMetadata;
  
  /** Actions */
  recordStep: (signals: Record<string, SignalState>) => void;
  clearTraces: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  setSignalNames: (names: string[]) => void;
  getTrace: () => SignalTraceEntry[];
  getStepCount: () => number;
  getLatestTrace: () => SignalTraceEntry | null;
  getSignalHistory: (signalName: string) => SignalState[];
}

// ============================================================================
// Store Implementation
// ============================================================================

const DEFAULT_MAX_STEPS = 100;

/**
 * Signal Trace Store
 * Manages signal trace data for timing diagram visualization
 */
export const useSignalTraceStore = create<SignalTraceStoreState>((set, get) => ({
  // Initial state
  traces: [],
  
  metadata: {
    stepCount: 0,
    signalNames: [],
    isRecording: false,
    maxSteps: DEFAULT_MAX_STEPS,
  },
  
  /**
   * Record a new simulation step
   * @param signals - Current signal states
   */
  recordStep: (signals) => {
    set((state) => {
      const currentStep = state.traces.length;
      const newEntry: SignalTraceEntry = {
        step: currentStep,
        signals: { ...signals },
        timestamp: Date.now(),
      };
      
      // Add new entry and trim if exceeding max steps
      const newTraces = [...state.traces, newEntry];
      const trimmedTraces = newTraces.length > state.metadata.maxSteps
        ? newTraces.slice(-state.metadata.maxSteps)
        : newTraces;
      
      // Update step indices after trimming
      const reindexedTraces = trimmedTraces.map((entry, index) => ({
        ...entry,
        step: index,
      }));
      
      return {
        traces: reindexedTraces,
        metadata: {
          ...state.metadata,
          stepCount: reindexedTraces.length,
        },
      };
    });
  },
  
  /**
   * Clear all recorded traces
   */
  clearTraces: () => {
    set({
      traces: [],
      metadata: {
        stepCount: 0,
        signalNames: get().metadata.signalNames,
        isRecording: false,
        maxSteps: get().metadata.maxSteps,
      },
    });
  },
  
  /**
   * Start recording signal traces
   */
  startRecording: () => {
    set((state) => ({
      metadata: {
        ...state.metadata,
        isRecording: true,
      },
    }));
  },
  
  /**
   * Stop recording signal traces
   */
  stopRecording: () => {
    set((state) => ({
      metadata: {
        ...state.metadata,
        isRecording: false,
      },
    }));
  },
  
  /**
   * Set the signal names to track
   * @param names - Array of signal names
   */
  setSignalNames: (names) => {
    set((state) => ({
      metadata: {
        ...state.metadata,
        signalNames: names,
      },
    }));
  },
  
  /**
   * Get all recorded traces
   * @returns Array of trace entries
   */
  getTrace: () => {
    return get().traces;
  },
  
  /**
   * Get the current step count
   * @returns Number of recorded steps
   */
  getStepCount: () => {
    return get().traces.length;
  },
  
  /**
   * Get the most recent trace entry
   * @returns Latest trace entry or null if no traces
   */
  getLatestTrace: () => {
    const traces = get().traces;
    return traces.length > 0 ? traces[traces.length - 1] : null;
  },
  
  /**
   * Get the history of a specific signal
   * Returns signal states for each step where the signal exists.
   * Returns an empty array if the signal never existed in any trace.
   * @param signalName - Name of the signal to retrieve
   * @returns Array of signal states for each step where the signal exists
   */
  getSignalHistory: (signalName) => {
    const traces = get().traces;
    
    // First check if the signal exists in any trace
    const signalExists = traces.some((trace) => signalName in trace.signals);
    
    // If signal never existed, return empty array
    if (!signalExists) {
      return [];
    }
    
    // Return signal state for each step (defaulting to false if not present)
    return traces.map((trace) => trace.signals[signalName] ?? false);
  },
}));

// ============================================================================
// Selector Helpers
// ============================================================================

/**
 * Select traces with minimum step count
 */
export const selectTracesWithMinSteps = (minSteps: number) => (state: SignalTraceStoreState) =>
  state.traces.filter((trace) => trace.step >= minSteps);

/**
 * Select traces for specific signals only
 */
export const selectTracesForSignals = (signalNames: string[]) => (state: SignalTraceStoreState) =>
  state.traces.map((trace) => ({
    ...trace,
    signals: Object.fromEntries(
      Object.entries(trace.signals).filter(([key]) => signalNames.includes(key))
    ),
  }));

/**
 * Select trace metadata
 */
export const selectMetadata = (state: SignalTraceStoreState) => state.metadata;

/**
 * Select whether recording is active
 */
export const selectIsRecording = (state: SignalTraceStoreState) => state.metadata.isRecording;
