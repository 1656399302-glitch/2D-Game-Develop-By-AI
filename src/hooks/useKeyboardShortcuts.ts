import { useEffect, useCallback } from 'react';
import { useMachineStore } from '../store/useMachineStore';

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  excludeWhenInputFocused?: boolean;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, excludeWhenInputFocused = true } = options;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Don't handle shortcuts when typing in input fields (unless explicitly allowed)
    if (excludeWhenInputFocused) {
      const target = e.target as HTMLElement;
      // Guard against null target or target without closest method
      if (target && typeof target.closest === 'function') {
        const isInputField = 
          target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.isContentEditable ||
          target.closest('input') ||
          target.closest('textarea');
        
        if (isInputField) return;
      }
    }

    const store = useMachineStore.getState();

    // Delete selected module or connection
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (store.selectedModuleId || store.selectedConnectionId) {
        e.preventDefault();
        store.deleteSelected();
      }
    }

    // Escape to deselect or cancel connection
    if (e.key === 'Escape') {
      e.preventDefault();
      if (store.isConnecting) {
        store.cancelConnection();
      } else {
        store.selectModule(null);
        store.selectConnection(null);
      }
    }

    // R key to rotate selected module
    if (e.key === 'r' || e.key === 'R') {
      if (store.selectedModuleId && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        store.updateModuleRotation(store.selectedModuleId, 90);
      }
    }

    // F key to flip selected module (horizontal mirror)
    if (e.key === 'f' || e.key === 'F') {
      if (store.selectedModuleId && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        store.updateModuleFlip(store.selectedModuleId);
      }
    }

    // Ctrl+Z for undo
    if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      store.undo();
    }

    // Ctrl+Y or Ctrl+Shift+Z for redo
    if ((e.key === 'y' || e.key === 'Y') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      store.redo();
    }
    if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault();
      store.redo();
    }

    // Ctrl+D for duplicate
    if ((e.key === 'd' || e.key === 'D') && (e.ctrlKey || e.metaKey)) {
      if (store.selectedModuleId) {
        e.preventDefault();
        store.duplicateModule(store.selectedModuleId);
      }
    }

    // + or = for zoom in
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      store.zoomIn();
    }

    // - for zoom out
    if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      store.zoomOut();
    }

    // 0 for reset zoom
    if (e.key === '0' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      store.resetViewport();
    }

    // Shift+0 for zoom to fit
    if (e.key === '0' && (e.shiftKey)) {
      e.preventDefault();
      store.zoomToFit();
    }
  }, [enabled, excludeWhenInputFocused]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
