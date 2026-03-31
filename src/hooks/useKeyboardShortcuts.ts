import { useRef, useState, useCallback, useEffect } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { useSelectionStore } from '../store/useSelectionStore';
import { useGroupingStore } from '../store/useGroupingStore';
import { rotateGroup, scaleGroup, flipGroupHorizontal } from '../utils/groupingUtils';

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  excludeWhenInputFocused?: boolean;
  onRandomForge?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, excludeWhenInputFocused = true, onRandomForge } = options;

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

  // Group selected modules (using store)
  const groupSelectedModules = useCallback(() => {
    const store = useMachineStore.getState();
    const selectionStore = useSelectionStore.getState();
    const groupingStore = useGroupingStore.getState();
    
    // Get selected IDs from multi-select or single select
    const selectedIds = selectionStore.selectedModuleIds.length > 0 
      ? selectionStore.selectedModuleIds 
      : (store.selectedModuleId ? [store.selectedModuleId] : []);

    if (selectedIds.length < 2) {
      showFeedback('需要选择至少2个模块才能创建组');
      return;
    }

    try {
      // Create group in grouping store
      const newGroup = groupingStore.createGroup(selectedIds);
      
      if (newGroup) {
        // Update modules with group ID
        const updatedModules = store.modules.map(m => {
          if (newGroup.moduleIds.includes(m.instanceId)) {
            return { ...m, groupId: newGroup.id, groupName: newGroup.name };
          }
          return m;
        });
        
        useMachineStore.setState({ modules: updatedModules });
        store.saveToHistory();
        showFeedback(`已创建组 "${newGroup.name}"`);
      }
    } catch (error) {
      showFeedback('创建组失败');
    }
  }, [showFeedback]);

  // Ungroup selected modules
  const ungroupSelectedModules = useCallback(() => {
    const store = useMachineStore.getState();
    const selectionStore = useSelectionStore.getState();
    const groupingStore = useGroupingStore.getState();
    
    const selectedIds = selectionStore.selectedModuleIds.length > 0 
      ? selectionStore.selectedModuleIds 
      : (store.selectedModuleId ? [store.selectedModuleId] : []);

    if (selectedIds.length === 0) {
      showFeedback('请先选择要取消分组的模块');
      return;
    }

    // Find groups that contain any of the selected modules
    const groupIdsToRemove = new Set<string>();
    selectedIds.forEach(moduleId => {
      const group = groupingStore.getGroupByModuleId(moduleId);
      if (group) {
        groupIdsToRemove.add(group.id);
      }
    });

    if (groupIdsToRemove.size === 0) {
      showFeedback('选中的模块不在任何组中');
      return;
    }

    // Ungroup each group
    groupIdsToRemove.forEach(groupId => {
      groupingStore.ungroup(groupId);
    });

    // Remove group IDs from modules
    const updatedModules = store.modules.map(m => {
      if (groupIdsToRemove.has((m as any).groupId)) {
        const { groupId: _, groupName: __, ...rest } = m as any;
        return rest;
      }
      return m;
    });

    useMachineStore.setState({ modules: updatedModules });
    store.saveToHistory();
    showFeedback(`已取消 ${groupIdsToRemove.size} 个组的分组`);
  }, [showFeedback]);

  // Copy selected modules
  const copySelectedModules = useCallback(() => {
    const store = useMachineStore.getState();
    const selectionStore = useSelectionStore.getState();
    
    const selectedIds = selectionStore.selectedModuleIds.length > 0 
      ? selectionStore.selectedModuleIds 
      : (store.selectedModuleId ? [store.selectedModuleId] : []);

    if (selectedIds.length === 0 && store.modules.length === 0) {
      showFeedback('没有可复制的模块');
      return;
    }

    store.copySelected();
    showFeedback(selectedIds.length > 0 ? `已复制 ${selectedIds.length} 个模块` : '已复制所有模块');
  }, [showFeedback]);

  // Paste modules
  const pasteSelectedModules = useCallback(() => {
    const store = useMachineStore.getState();
    
    if (store.clipboardModules.length === 0) {
      showFeedback('剪贴板为空');
      return;
    }

    store.pasteModules();
    showFeedback(`已粘贴 ${store.clipboardModules.length} 个模块`);
  }, [showFeedback]);

  // Duplicate selected modules
  const duplicateSelectedModules = useCallback(() => {
    const store = useMachineStore.getState();
    const selectionStore = useSelectionStore.getState();
    
    const selectedIds = selectionStore.selectedModuleIds.length > 0 
      ? selectionStore.selectedModuleIds 
      : (store.selectedModuleId ? [store.selectedModuleId] : []);

    if (selectedIds.length === 0) {
      showFeedback('没有选中的模块');
      return;
    }

    // Duplicate all selected modules
    selectedIds.forEach(id => {
      store.duplicateModule(id);
    });
    showFeedback(`已复制 ${selectedIds.length} 个模块`);
  }, [showFeedback]);

  // Rotate selected modules 90° clockwise
  const rotateSelectedModules = useCallback(() => {
    const store = useMachineStore.getState();
    const selectionStore = useSelectionStore.getState();
    
    const selectedIds = selectionStore.selectedModuleIds.length > 0 
      ? selectionStore.selectedModuleIds 
      : (store.selectedModuleId ? [store.selectedModuleId] : []);

    if (selectedIds.length === 0) {
      showFeedback('没有选中的模块');
      return;
    }

    // Use rotateGroup utility to rotate all selected modules
    const updatedModules = rotateGroup(store.modules, selectedIds, 90);
    useMachineStore.setState({ modules: updatedModules });
    store.saveToHistory();
    showFeedback('已旋转 90°');
  }, [showFeedback]);

  // Flip selected modules horizontally
  const flipSelectedModules = useCallback(() => {
    const store = useMachineStore.getState();
    const selectionStore = useSelectionStore.getState();
    
    const selectedIds = selectionStore.selectedModuleIds.length > 0 
      ? selectionStore.selectedModuleIds 
      : (store.selectedModuleId ? [store.selectedModuleId] : []);

    if (selectedIds.length === 0) {
      showFeedback('没有选中的模块');
      return;
    }

    // Use flipGroupHorizontal utility
    const updatedModules = flipGroupHorizontal(store.modules, selectedIds);
    useMachineStore.setState({ modules: updatedModules });
    store.saveToHistory();
    showFeedback('已翻转');
  }, [showFeedback]);

  // Scale selected modules
  const scaleSelectedModules = useCallback((factor: number) => {
    const store = useMachineStore.getState();
    const selectionStore = useSelectionStore.getState();
    
    const selectedIds = selectionStore.selectedModuleIds.length > 0 
      ? selectionStore.selectedModuleIds 
      : (store.selectedModuleId ? [store.selectedModuleId] : []);

    if (selectedIds.length === 0) {
      return;
    }

    // Use scaleGroup utility
    const updatedModules = scaleGroup(store.modules, selectedIds, factor);
    useMachineStore.setState({ modules: updatedModules });
    store.saveToHistory();
  }, [showFeedback]);

  // Delete selected modules and connections
  const deleteSelectedModules = useCallback(() => {
    const store = useMachineStore.getState();
    const selectionStore = useSelectionStore.getState();
    
    const selectedIds = selectionStore.selectedModuleIds.length > 0 
      ? selectionStore.selectedModuleIds 
      : (store.selectedModuleId ? [store.selectedModuleId] : []);

    if (selectedIds.length === 0 && !store.selectedConnectionId) {
      showFeedback('没有选中任何内容');
      return;
    }

    // Delete all selected modules
    if (selectedIds.length > 0) {
      selectedIds.forEach(id => {
        store.removeModule(id);
      });
      // Clear multi-selection
      selectionStore.clearSelection();
    } else if (store.selectedConnectionId) {
      store.removeConnection(store.selectedConnectionId);
    }

    showFeedback('已删除');
  }, [showFeedback]);

  // Select all modules
  const selectAllModules = useCallback(() => {
    const store = useMachineStore.getState();
    const selectionStore = useSelectionStore.getState();
    
    if (store.modules.length === 0) {
      showFeedback('没有模块');
      return;
    }

    const allModuleIds = store.modules.map(m => m.instanceId);
    selectionStore.selectAll(allModuleIds);
    if (allModuleIds.length > 0) {
      store.selectModule(allModuleIds[0]);
    }
    showFeedback(`已选择 ${store.modules.length} 个模块`);
  }, [showFeedback]);

  // Deselect all
  const deselectAll = useCallback(() => {
    const store = useMachineStore.getState();
    const selectionStore = useSelectionStore.getState();
    
    selectionStore.clearSelection();
    store.selectModule(null);
    store.selectConnection(null);
    showFeedback('已取消选择');
  }, [showFeedback]);

  // Random Forge shortcut handler (AC3: Keyboard Shortcuts Expansion - Ctrl+R)
  const handleRandomForge = useCallback(() => {
    if (onRandomForge) {
      onRandomForge();
      showFeedback('随机锻造!');
    } else {
      showFeedback('随机锻造功能未配置');
    }
  }, [onRandomForge, showFeedback]);

  // Main keyboard handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Don't handle shortcuts when typing in input fields (unless explicitly allowed)
    if (excludeWhenInputFocused) {
      const target = e.target;
      if (target instanceof Element && typeof target.closest === 'function') {
        const tagName = target.tagName;
        const isContentEditable = target instanceof HTMLElement && target.isContentEditable;
        const isInputField = 
          tagName === 'INPUT' || 
          tagName === 'TEXTAREA' || 
          isContentEditable ||
          target.closest('input') ||
          target.closest('textarea');
        
        if (isInputField) return;
      }
    }

    const store = useMachineStore.getState();
    const selectionStore = useSelectionStore.getState();

    // === MODIFIER KEY SHORTCUTS ===

    // Ctrl+G for group
    if ((e.key === 'g' || e.key === 'G') && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      e.preventDefault();
      groupSelectedModules();
      return;
    }

    // Ctrl+Shift+G for ungroup
    if ((e.key === 'g' || e.key === 'G') && (e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault();
      ungroupSelectedModules();
      return;
    }

    // Delete selected module or connection
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (store.selectedModuleId || store.selectedConnectionId || selectionStore.selectedModuleIds.length > 0) {
        e.preventDefault();
        deleteSelectedModules();
      }
      return;
    }

    // Escape to deselect or cancel connection
    if (e.key === 'Escape') {
      e.preventDefault();
      if (store.isConnecting) {
        store.cancelConnection();
      } else {
        deselectAll();
      }
      showFeedback('已取消');
      return;
    }

    // Ctrl+C for copy
    if ((e.key === 'c' || e.key === 'C') && (e.ctrlKey || e.metaKey)) {
      if (store.selectedModuleId || store.modules.length > 0 || selectionStore.selectedModuleIds.length > 0) {
        e.preventDefault();
        copySelectedModules();
      }
      return;
    }

    // Ctrl+V for paste
    if ((e.key === 'v' || e.key === 'V') && (e.ctrlKey || e.metaKey)) {
      if (store.clipboardModules.length > 0) {
        e.preventDefault();
        pasteSelectedModules();
      }
      return;
    }

    // Ctrl+A for select all
    if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      if (store.modules.length > 0) {
        e.preventDefault();
        selectAllModules();
      }
      return;
    }

    // Ctrl+D for duplicate
    if ((e.key === 'd' || e.key === 'D') && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      if (store.selectedModuleId || selectionStore.selectedModuleIds.length > 0) {
        e.preventDefault();
        duplicateSelectedModules();
      }
      return;
    }

    // Ctrl+Shift+A for deselect all
    if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault();
      deselectAll();
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

    // === NEW: Ctrl+R for Random Forge (AC3: Keyboard Shortcuts Expansion) ===
    // Note: We intentionally do NOT intercept F5 (browser refresh) or Ctrl+W, Ctrl+T, etc.
    if ((e.key === 'r' || e.key === 'R') && (e.ctrlKey || e.metaKey)) {
      // Only trigger if not conflicting with browser defaults
      // Ctrl+R in most browsers triggers "Find" (not refresh, that's F5)
      e.preventDefault();
      handleRandomForge();
      return;
    }

    // === NON-MODIFIER KEY SHORTCUTS ===

    // R key to rotate selected module (only when not using Ctrl+R)
    if (e.key === 'r' || e.key === 'R') {
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        rotateSelectedModules();
      }
      return;
    }

    // F key to flip selected module (horizontal mirror)
    if (e.key === 'f' || e.key === 'F') {
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        flipSelectedModules();
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

    // 0 for reset zoom (not with modifiers)
    if (e.key === '0' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      store.resetViewport();
      return;
    }

    // Shift+0 for zoom to fit
    if (e.key === '0' && e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      store.zoomToFit();
      return;
    }

    // G for toggle grid (when not using Ctrl+G)
    if (e.key === 'g' || e.key === 'G') {
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        store.toggleGrid();
        showFeedback(store.gridEnabled ? '网格已隐藏' : '网格已显示');
      }
      return;
    }

    // [ for scale down
    if (e.key === '[') {
      e.preventDefault();
      scaleSelectedModules(0.8);
      showFeedback('缩小');
      return;
    }

    // ] for scale up
    if (e.key === ']') {
      e.preventDefault();
      scaleSelectedModules(1.25);
      showFeedback('放大');
      return;
    }
  }, [
    enabled, 
    excludeWhenInputFocused, 
    showFeedback, 
    groupSelectedModules, 
    ungroupSelectedModules, 
    copySelectedModules, 
    pasteSelectedModules, 
    duplicateSelectedModules,
    rotateSelectedModules,
    flipSelectedModules,
    scaleSelectedModules,
    deleteSelectedModules,
    selectAllModules,
    deselectAll,
    handleRandomForge,
  ]);

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
    groupSelectedModules,
    ungroupSelectedModules,
  };
}

export default useKeyboardShortcuts;
