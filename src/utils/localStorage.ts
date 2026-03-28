/**
 * LocalStorage utilities for canvas state persistence
 */

import { PlacedModule, Connection, ViewportState } from '../types';

const CANVAS_STATE_KEY = 'arcane-canvas-state';

export interface CanvasStateData {
  modules: PlacedModule[];
  connections: Connection[];
  viewport: ViewportState;
  gridEnabled: boolean;
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
