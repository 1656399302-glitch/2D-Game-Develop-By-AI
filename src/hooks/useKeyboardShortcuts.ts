import { useRef, useState, useCallback, useEffect } from 'react';
import { useMachineStore } from '../store/useMachineStore';

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  excludeWhenInputFocused?: boolean;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, excludeWhenInputFocused = true } = options;

  // Toast feedback state
  const [shortcutFeedback, setShortcutFeedback] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show feedback toast
  const showFeedback = useCallback((message: string) => {
    setShortcutFeedback(message);
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = setTimeout(() => {
      setShortcutFeedback(null);
    }, 1500);
  }, []);

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
        showFeedback('已删除');
      }
      return;
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
      showFeedback('已取消');
      return;
    }

    // Ctrl+C for copy
    if ((e.key === 'c' || e.key === 'C') && (e.ctrlKey || e.metaKey)) {
      if (store.selectedModuleId || store.modules.length > 0) {
        e.preventDefault();
        store.copySelected();
        showFeedback('已复制');
      }
      return;
    }

    // Ctrl+V for paste
    if ((e.key === 'v' || e.key === 'V') && (e.ctrlKey || e.metaKey)) {
      if (store.clipboardModules.length > 0) {
        e.preventDefault();
        store.pasteModules();
        showFeedback('已粘贴');
      }
      return;
    }

    // Ctrl+A for select all
    if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey)) {
      if (store.modules.length > 0) {
        e.preventDefault();
        store.selectAllModules();
        showFeedback(`已选择 ${store.modules.length} 个模块`);
      }
      return;
    }

    // Ctrl+S for save to codex
    if ((e.key === 's' || e.key === 'S') && (e.ctrlKey || e.metaKey)) {
      if (store.modules.length > 0) {
        e.preventDefault();
        store.setShowCodexModal(true);
        showFeedback('保存到图鉴');
      }
      return;
    }

    // Ctrl+E for export modal
    if ((e.key === 'e' || e.key === 'E') && (e.ctrlKey || e.metaKey)) {
      if (store.modules.length > 0) {
        e.preventDefault();
        store.setShowExportModal(true);
        showFeedback('打开导出');
      }
      return;
    }

    // R key to rotate selected module
    if (e.key === 'r' || e.key === 'R') {
      if (store.selectedModuleId && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        store.updateModuleRotation(store.selectedModuleId, 90);
        showFeedback('已旋转 90°');
      }
      return;
    }

    // F key to flip selected module (horizontal mirror)
    if (e.key === 'f' || e.key === 'F') {
      if (store.selectedModuleId && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        store.updateModuleFlip(store.selectedModuleId);
        showFeedback('已翻转');
      }
      return;
    }

    // Ctrl+Z for undo
    if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      store.undo();
      showFeedback('撤销');
      return;
    }

    // Ctrl+Y or Ctrl+Shift+Z for redo
    if ((e.key === 'y' || e.key === 'Y') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      store.redo();
      showFeedback('重做');
      return;
    }
    if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault();
      store.redo();
      showFeedback('重做');
      return;
    }

    // Ctrl+D for duplicate
    if ((e.key === 'd' || e.key === 'D') && (e.ctrlKey || e.metaKey)) {
      if (store.selectedModuleId) {
        e.preventDefault();
        store.duplicateModule(store.selectedModuleId);
        showFeedback('已复制模块');
      }
      return;
    }

    // + or = for zoom in
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      store.zoomIn();
      return;
    }

    // - for zoom out
    if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      store.zoomOut();
      return;
    }

    // 0 for reset zoom
    if (e.key === '0' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      store.resetViewport();
      return;
    }

    // Shift+0 for zoom to fit
    if (e.key === '0' && e.shiftKey) {
      e.preventDefault();
      store.zoomToFit();
      return;
    }

    // G for toggle grid
    if (e.key === 'g' || e.key === 'G') {
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        store.toggleGrid();
        showFeedback(store.gridEnabled ? '网格已隐藏' : '网格已显示');
      }
      return;
    }
  }, [enabled, excludeWhenInputFocused, showFeedback]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  return {
    shortcutFeedback,
  };
}

export default useKeyboardShortcuts;
