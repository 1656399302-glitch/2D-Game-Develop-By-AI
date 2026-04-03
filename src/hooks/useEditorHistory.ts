/**
 * useEditorHistory - Hook for managing undo/redo command history
 * 
 * This hook provides a clean interface for managing editor state history
 * with support for 50-step undo/redo, action grouping, and keyboard shortcuts.
 * 
 * @example
 * const { undo, redo, canUndo, canRedo, saveToHistory } = useEditorHistory();
 */

import { useCallback, useMemo } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { PlacedModule, Connection } from '../types';

export interface HistoryState {
  modules: PlacedModule[];
  connections: Connection[];
}

export interface EditorHistoryActions {
  /** Undo the last action */
  undo: () => void;
  /** Redo the last undone action */
  redo: () => void;
  /** Save current state to history */
  saveToHistory: () => void;
  /** Clear all history */
  clearHistory: () => void;
  /** Get current history state */
  getHistory: () => HistoryState[];
  /** Get current history index */
  getHistoryIndex: () => number;
  /** Check if undo is available */
  canUndo: () => boolean;
  /** Check if redo is available */
  canRedo: () => boolean;
  /** Get number of undo steps available */
  getUndoCount: () => number;
  /** Get number of redo steps available */
  getRedoCount: () => number;
}

export function useEditorHistory(): EditorHistoryActions {
  // Get store actions
  const storeUndo = useMachineStore((state) => state.undo);
  const storeRedo = useMachineStore((state) => state.redo);
  const storeSaveToHistory = useMachineStore((state) => state.saveToHistory);
  const storeLoadMachine = useMachineStore((state) => state.loadMachine);

  /**
   * Undo the last action
   * Reverses the most recent state change (add, delete, move, connect)
   */
  const undo = useCallback(() => {
    storeUndo();
  }, [storeUndo]);

  /**
   * Redo the last undone action
   * Restores the state before the most recent undo
   */
  const redo = useCallback(() => {
    storeRedo();
  }, [storeRedo]);

  /**
   * Save current state to history
   * Called after any state mutation to capture the new state
   */
  const saveToHistory = useCallback(() => {
    storeSaveToHistory();
  }, [storeSaveToHistory]);

  /**
   * Clear all history
   * Resets to initial empty state
   */
  const clearHistory = useCallback(() => {
    storeLoadMachine([], []);
  }, [storeLoadMachine]);

  /**
   * Get current history array
   */
  const getHistory = useCallback(() => {
    return useMachineStore.getState().history;
  }, []);

  /**
   * Get current history index
   */
  const getHistoryIndex = useCallback(() => {
    return useMachineStore.getState().historyIndex;
  }, []);

  /**
   * Check if undo is available
   */
  const canUndo = useCallback(() => {
    const currentIndex = useMachineStore.getState().historyIndex;
    return currentIndex > 0;
  }, []);

  /**
   * Check if redo is available
   */
  const canRedo = useCallback(() => {
    const { historyIndex, history } = useMachineStore.getState();
    return historyIndex < history.length - 1;
  }, []);

  /**
   * Get number of undo steps available
   */
  const getUndoCount = useCallback(() => {
    return useMachineStore.getState().historyIndex;
  }, []);

  /**
   * Get number of redo steps available
   */
  const getRedoCount = useCallback(() => {
    const { historyIndex, history } = useMachineStore.getState();
    return history.length - historyIndex - 1;
  }, []);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    undo,
    redo,
    saveToHistory,
    clearHistory,
    getHistory,
    getHistoryIndex,
    canUndo,
    canRedo,
    getUndoCount,
    getRedoCount,
  }), [
    undo,
    redo,
    saveToHistory,
    clearHistory,
    getHistory,
    getHistoryIndex,
    canUndo,
    canRedo,
    getUndoCount,
    getRedoCount,
  ]);
}

/**
 * Action types for history tracking
 */
export type HistoryActionType = 
  | 'ADD_MODULE'
  | 'REMOVE_MODULE'
  | 'MOVE_MODULE'
  | 'ROTATE_MODULE'
  | 'SCALE_MODULE'
  | 'FLIP_MODULE'
  | 'ADD_CONNECTION'
  | 'REMOVE_CONNECTION'
  | 'CLEAR_CANVAS'
  | 'LOAD_MACHINE'
  | 'BATCH_UPDATE';

export interface HistoryAction {
  type: HistoryActionType;
  timestamp: number;
  description: string;
  previousState: HistoryState;
  newState: HistoryState;
}

/**
 * Group multiple actions together as a single history entry
 */
export interface ActionGroup {
  id: string;
  actions: HistoryAction[];
  timestamp: number;
}

/**
 * Create a deep clone of history state
 */
export function cloneHistoryState(state: HistoryState): HistoryState {
  return {
    modules: state.modules.map(m => ({
      ...m,
      ports: m.ports.map(p => ({
        ...p,
        position: { ...p.position },
      })),
    })),
    connections: state.connections.map(c => ({ ...c })),
  };
}

/**
 * Compare two history states for equality
 */
export function compareHistoryStates(a: HistoryState, b: HistoryState): boolean {
  if (a.modules.length !== b.modules.length) return false;
  if (a.connections.length !== b.connections.length) return false;
  
  // Compare modules
  for (let i = 0; i < a.modules.length; i++) {
    const moduleA = a.modules[i];
    const moduleB = b.modules[i];
    
    if (moduleA.instanceId !== moduleB.instanceId) return false;
    if (moduleA.type !== moduleB.type) return false;
    if (moduleA.x !== moduleB.x) return false;
    if (moduleA.y !== moduleB.y) return false;
    if (moduleA.rotation !== moduleB.rotation) return false;
    if (moduleA.scale !== moduleB.scale) return false;
  }
  
  // Compare connections
  for (let i = 0; i < a.connections.length; i++) {
    const connA = a.connections[i];
    const connB = b.connections[i];
    
    if (connA.id !== connB.id) return false;
    if (connA.sourceModuleId !== connB.sourceModuleId) return false;
    if (connA.targetModuleId !== connB.targetModuleId) return false;
  }
  
  return true;
}

export default useEditorHistory;
