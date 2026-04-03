/**
 * useCopyPaste - Hook for managing module copy/paste functionality
 * 
 * This hook provides copy/paste functionality for modules with:
 * - Internal clipboard state (not system clipboard)
 * - Offset paste positioning (20px by default)
 * - Support for single and multiple selection
 * - Proper ID generation to avoid collisions
 * 
 * @example
 * const { copy, paste, canPaste, clearClipboard } = useCopyPaste();
 */

import { useCallback, useMemo } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { useSelectionStore } from '../store/useSelectionStore';
import { PlacedModule, Connection } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface ClipboardData {
  modules: PlacedModule[];
  connections: Connection[];
}

export interface CopyPasteActions {
  /** Copy selected modules to clipboard */
  copy: () => void;
  /** Paste modules from clipboard */
  paste: () => void;
  /** Check if clipboard has content */
  canPaste: () => boolean;
  /** Get current clipboard contents */
  getClipboard: () => ClipboardData;
  /** Clear clipboard */
  clearClipboard: () => void;
  /** Copy all modules (when nothing selected) */
  copyAll: () => void;
  /** Duplicate selected modules */
  duplicate: () => void;
}

export interface UseCopyPasteOptions {
  /** Offset for pasted modules in pixels */
  pasteOffset?: number;
  /** Enable offset on paste (default: true) */
  enableOffset?: boolean;
}

export function useCopyPaste(_options: UseCopyPasteOptions = {}): CopyPasteActions {
  // Get store actions
  const storeCopySelected = useMachineStore((state) => state.copySelected);
  const storePasteModules = useMachineStore((state) => state.pasteModules);
  const storeDuplicateModule = useMachineStore((state) => state.duplicateModule);

  /**
   * Copy selected modules to clipboard
   * If no modules are selected, copies nothing (user should use copyAll)
   */
  const copy = useCallback(() => {
    // Use store's copySelected which handles selection logic
    storeCopySelected();
  }, [storeCopySelected]);

  /**
   * Paste modules from clipboard
   * Creates new module instances with:
   * - New unique IDs (prevents collision)
   * - Offset position (20px by default)
   * - Updated port IDs
   */
  const paste = useCallback(() => {
    storePasteModules();
  }, [storePasteModules]);

  /**
   * Check if clipboard has content to paste
   */
  const canPaste = useCallback((): boolean => {
    const { clipboardModules: currentClipboard } = useMachineStore.getState();
    return currentClipboard.length > 0;
  }, []);

  /**
   * Get current clipboard contents
   */
  const getClipboard = useCallback((): ClipboardData => {
    const { clipboardModules: currentClipboard, clipboardConnections: currentConnections } = useMachineStore.getState();
    return {
      modules: currentClipboard.map(m => ({ ...m })),
      connections: currentConnections.map(c => ({ ...c })),
    };
  }, []);

  /**
   * Clear clipboard contents
   */
  const clearClipboard = useCallback(() => {
    useMachineStore.setState({
      clipboardModules: [],
      clipboardConnections: [],
    });
  }, []);

  /**
   * Copy all modules when nothing is selected
   */
  const copyAll = useCallback(() => {
    const { modules: allModules, connections: allConnections } = useMachineStore.getState();
    
    if (allModules.length === 0) return;
    
    useMachineStore.setState({
      clipboardModules: allModules.map(m => ({ 
        ...m, 
        ports: [...m.ports.map(p => ({ ...p }))] 
      })),
      clipboardConnections: allConnections.map(c => ({ ...c })),
    });
  }, []);

  /**
   * Duplicate selected modules
   * Creates exact copies with offset position
   */
  const duplicate = useCallback(() => {
    const { selectedModuleId: singleSelected } = useMachineStore.getState();
    const { selectedModuleIds: multiSelected } = useSelectionStore.getState();
    
    // Get modules to duplicate
    const modulesToDuplicate = multiSelected.length > 0
      ? multiSelected
      : (singleSelected ? [singleSelected] : []);

    // Duplicate each module
    modulesToDuplicate.forEach(id => {
      storeDuplicateModule(id);
    });
  }, [storeDuplicateModule]);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    copy,
    paste,
    canPaste,
    getClipboard,
    clearClipboard,
    copyAll,
    duplicate,
  }), [
    copy,
    paste,
    canPaste,
    getClipboard,
    clearClipboard,
    copyAll,
    duplicate,
  ]);
}

/**
 * Generate a unique module ID
 */
export function generateModuleId(): string {
  return `module-${uuidv4()}`;
}

/**
 * Generate a unique connection ID
 */
export function generateConnectionId(): string {
  return `conn-${uuidv4()}`;
}

/**
 * Create a new module instance from a template
 * Generates new IDs to prevent collision
 */
export function createModuleInstance(
  template: PlacedModule,
  offsetX: number = 0,
  offsetY: number = 0
): PlacedModule {
  const newId = generateModuleId();
  
  return {
    ...template,
    id: newId,
    instanceId: newId,
    x: template.x + offsetX,
    y: template.y + offsetY,
    ports: template.ports.map((p, idx) => ({
      ...p,
      id: `${template.type}-${p.type}-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
    })),
  };
}

/**
 * Create a new connection instance with updated module references
 */
export function createConnectionInstance(
  template: Connection,
  idMapping: Map<string, string>
): Connection {
  return {
    ...template,
    id: generateConnectionId(),
    sourceModuleId: idMapping.get(template.sourceModuleId) || template.sourceModuleId,
    targetModuleId: idMapping.get(template.targetModuleId) || template.targetModuleId,
  };
}

/**
 * Validate that clipboard data has proper structure
 */
export function validateClipboardData(data: ClipboardData): boolean {
  if (!Array.isArray(data.modules)) return false;
  if (!Array.isArray(data.connections)) return false;
  
  // Check module structure
  for (const module of data.modules) {
    if (!module.id || !module.instanceId || !module.type) return false;
    if (typeof module.x !== 'number' || typeof module.y !== 'number') return false;
  }
  
  // Check connection structure
  for (const conn of data.connections) {
    if (!conn.id) return false;
    if (!conn.sourceModuleId || !conn.targetModuleId) return false;
  }
  
  return true;
}

/**
 * Calculate the bounding box of clipboard modules
 */
export function getClipboardBounds(data: ClipboardData): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (data.modules.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const module of data.modules) {
    minX = Math.min(minX, module.x);
    minY = Math.min(minY, module.y);
    maxX = Math.max(maxX, module.x);
    maxY = Math.max(maxY, module.y);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export default useCopyPaste;
