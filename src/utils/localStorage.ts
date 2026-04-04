/**
 * LocalStorage utilities for canvas state persistence
 * 
 * Round 124: Added circuit state persistence for AC-124-009
 */

import { PlacedModule, Connection, ViewportState } from '../types';
import { PlacedCircuitNode, CircuitWire } from '../types/circuitCanvas';

const CANVAS_STATE_KEY = 'arcane-canvas-state';
const CIRCUIT_STATE_KEY = 'arcane-circuit-state';

/**
 * Canvas state data including machine modules and connections
 */
export interface CanvasStateData {
  modules: PlacedModule[];
  connections: Connection[];
  viewport: ViewportState;
  gridEnabled: boolean;
  savedAt: number;
  version?: number;
}

/**
 * Circuit state data for canvas circuit persistence (AC-124-009)
 * Circuit state is saved separately from machine state to support
 * cross-machine circuit work, but is also embedded in machine saves.
 */
export interface CircuitStateData {
  nodes: PlacedCircuitNode[];
  wires: CircuitWire[];
  savedAt: number;
  version?: number;
}

/**
 * Combined save data including machine + circuit state
 * Used when saving a machine with its associated circuit
 */
export interface MachineSaveData {
  machine: CanvasStateData;
  circuit: CircuitStateData;
  savedAt: number;
}

/**
 * Save canvas state to localStorage
 */
export const saveCanvasState = (state: CanvasStateData): boolean => {
  try {
    const serialized = JSON.stringify(state);
    
    // Check size to prevent quota exceeded errors (4MB warning threshold)
    const sizeInBytes = new Blob([serialized]).size;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    if (sizeInMB > 4) {
      console.warn(`Canvas state is ${sizeInMB.toFixed(2)}MB, which may exceed localStorage limits. Consider simplifying your machine.`);
    }
    
    localStorage.setItem(CANVAS_STATE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save canvas state to localStorage:', error);
    return false;
  }
};

/**
 * Load canvas state from localStorage
 */
export const loadCanvasState = (): CanvasStateData | null => {
  try {
    const serialized = localStorage.getItem(CANVAS_STATE_KEY);
    if (!serialized) {
      return null;
    }
    
    const state = JSON.parse(serialized) as CanvasStateData;
    
    // Validate the loaded state has required fields
    if (!Array.isArray(state.modules) || !Array.isArray(state.connections)) {
      console.warn('Invalid canvas state format in localStorage');
      return null;
    }
    
    return state;
  } catch (error) {
    console.error('Failed to load canvas state from localStorage:', error);
    return null;
  }
};

/**
 * Clear canvas state from localStorage
 */
export const clearCanvasState = (): boolean => {
  try {
    localStorage.removeItem(CANVAS_STATE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear canvas state from localStorage:', error);
    return false;
  }
};

/**
 * Save circuit state to localStorage (AC-124-009)
 * Circuit state is saved separately so it can persist across machine loads
 */
export const saveCircuitState = (circuitState: CircuitStateData): boolean => {
  try {
    const serialized = JSON.stringify(circuitState);
    localStorage.setItem(CIRCUIT_STATE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save circuit state to localStorage:', error);
    return false;
  }
};

/**
 * Load circuit state from localStorage (AC-124-009)
 */
export const loadCircuitState = (): CircuitStateData | null => {
  try {
    const serialized = localStorage.getItem(CIRCUIT_STATE_KEY);
    if (!serialized) {
      return null;
    }
    
    const state = JSON.parse(serialized) as CircuitStateData;
    
    // Validate the loaded state has required fields
    if (!Array.isArray(state.nodes) || !Array.isArray(state.wires)) {
      console.warn('Invalid circuit state format in localStorage');
      return null;
    }
    
    return state;
  } catch (error) {
    console.error('Failed to load circuit state from localStorage:', error);
    return null;
  }
};

/**
 * Clear circuit state from localStorage (AC-124-009)
 */
export const clearCircuitState = (): boolean => {
  try {
    localStorage.removeItem(CIRCUIT_STATE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear circuit state from localStorage:', error);
    return false;
  }
};

/**
 * Check if saved canvas state exists
 */
export const hasSavedState = (): boolean => {
  try {
    return localStorage.getItem(CANVAS_STATE_KEY) !== null;
  } catch (error) {
    console.error('Failed to check for saved state:', error);
    return false;
  }
};

/**
 * Check if saved circuit state exists
 */
export const hasSavedCircuitState = (): boolean => {
  try {
    return localStorage.getItem(CIRCUIT_STATE_KEY) !== null;
  } catch (error) {
    console.error('Failed to check for saved circuit state:', error);
    return false;
  }
};

/**
 * Save a complete machine including its circuit state (AC-124-009)
 * This is called by the machine store when the user clicks "Save"
 */
export const saveMachineWithCircuit = (machineData: CanvasStateData, circuitData: CircuitStateData): boolean => {
  const machineSave: MachineSaveData = {
    machine: { ...machineData, version: 1 },
    circuit: { ...circuitData, version: 1 },
    savedAt: Date.now(),
  };
  
  try {
    const serialized = JSON.stringify(machineSave);
    localStorage.setItem(CANVAS_STATE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save machine with circuit state:', error);
    return false;
  }
};

/**
 * Load a complete machine including its circuit state (AC-124-009)
 * This restores both machine and circuit state from a single save
 */
export const loadMachineWithCircuit = (): { machine: CanvasStateData; circuit: CircuitStateData } | null => {
  try {
    const serialized = localStorage.getItem(CANVAS_STATE_KEY);
    if (!serialized) {
      return null;
    }
    
    const saveData = JSON.parse(serialized) as MachineSaveData;
    
    // Support both new format (with machine/circuit) and legacy format (just machine)
    if (saveData.machine && saveData.circuit) {
      return {
        machine: saveData.machine,
        circuit: saveData.circuit,
      };
    }
    
    // Legacy format: return empty circuit
    return {
      machine: saveData as unknown as CanvasStateData,
      circuit: { nodes: [], wires: [], savedAt: 0 },
    };
  } catch (error) {
    console.error('Failed to load machine with circuit state:', error);
    return null;
  }
};
