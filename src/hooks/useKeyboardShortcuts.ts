import { useRef, useState, useCallback, useEffect } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { useSelectionStore } from '../store/useSelectionStore';
import { createGroup, GroupInstance } from '../utils/groupingUtils';

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  excludeWhenInputFocused?: boolean;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, excludeWhenInputFocused = true } = options;

  // Toast feedback state
  const [shortcutFeedback, setShortcutFeedback] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Group state - stores all created groups
  const [groups, setGroups] = useState<GroupInstance[]>([]);

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

  // Group selected modules
  const groupSelectedModules = useCallback(() => {
    const store = useMachineStore.getState();
    const selectionStore = useSelectionStore.getState();
    
    const selectedIds = selectionStore.selectedModuleIds.length > 0 
      ? selectionStore.selectedModuleIds 
      : (store.selectedModuleId ? [store.selectedModuleId] : []);

    if (selectedIds.length < 2) {
      showFeedback('需要选择至少2个模块才能创建组');
      return;
    }

    try {
      const newGroup = createGroup(selectedIds);
      setGroups(prev => [...prev, newGroup]);
      
      // Update modules with group ID
      const updatedModules = store.modules.map(m => {
        if (newGroup.moduleIds.includes(m.instanceId)) {
          return { ...m, groupId: newGroup.id, groupName: newGroup.name } as any;
        }
        return m;
      });
      
      useMachineStore.setState({ modules: updatedModules });
      store.saveToHistory();
      showFeedback(`已创建组 "${newGroup.name}"`);
    } catch (error) {
      showFeedback('创建组失败');
    }
  }, [showFeedback]);

  // Ungroup selected modules
  const ungroupSelectedModules = useCallback(() => {
    const store = useMachineStore.getState();
    const selectionStore = useSelectionStore.getState();
    
    const selectedIds = selectionStore.selectedModuleIds.length > 0 
      ? selectionStore.selectedModuleIds 
      : (store.selectedModuleId ? [store.selectedModuleId] : []);

    if (selectedIds.length === 0) {
      showFeedback('请先选择要取消分组的模块');
      return;
    }

    // Find groups that contain any of the selected modules
    const groupsToRemove = groups.filter(g => 
      g.moduleIds.some(id => selectedIds.includes(id))
    );

    if (groupsToRemove.length === 0) {
      showFeedback('选中的模块不在任何组中');
      return;
    }

    // Remove group IDs from modules
    const groupIdsToRemove = new Set(groupsToRemove.map(g => g.id));
    const updatedModules = store.modules.map(m => {
      if (groupIdsToRemove.has((m as any).groupId)) {
        const { groupId: _, groupName: __, ...rest } = m as any;
        return rest as any;
      }
      return m;
    });

    // Remove the groups
    setGroups(prev => prev.filter(g => !groupIdsToRemove.has(g.id)));
    useMachineStore.setState({ modules: updatedModules });
    store.saveToHistory();
    showFeedback(`已取消 ${groupsToRemove.length} 个组的分组`);
  }, [groups, showFeedback]);

  // Copy selected modules (enhanced)
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

  // Paste modules (enhanced - pastes at cursor position)
  const pasteSelectedModules = useCallback(() => {
    const store = useMachineStore.getState();
    
    if (store.clipboardModules.length === 0) {
      showFeedback('剪贴板为空');
      return;
    }

    store.pasteModules();
    showFeedback(`已粘贴 ${store.clipboardModules.length} 个模块`);
  }, [showFeedback]);

  // Duplicate selected modules (enhanced - at offset)
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

    selectedIds.forEach(id => {
      store.duplicateModule(id);
    });
    showFeedback(`已复制 ${selectedIds.length} 个模块`);
  }, [showFeedback]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Don't handle shortcuts when typing in input fields (unless explicitly allowed)
    if (excludeWhenInputFocused) {
      const target = e.target;
      // Guard against null target or target without closest method
      // Use Element for tagName and closest, HTMLElement for isContentEditable
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
        // Also clear multi-selection
        selectionStore.clearSelection();
      }
      showFeedback('已取消');
      return;
    }

    // Ctrl+C for copy
    if ((e.key === 'c' || e.key === 'C') && (e.ctrlKey || e.metaKey)) {
      if (store.selectedModuleId || store.modules.length > 0) {
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
    if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey)) {
      if (store.modules.length > 0) {
        e.preventDefault();
        // Select all modules
        const allModuleIds = store.modules.map(m => m.instanceId);
        selectionStore.selectAll(allModuleIds);
        // Also set the first module as the primary selected module
        store.selectModule(allModuleIds[0]);
        showFeedback(`已选择 ${store.modules.length} 个模块`);
      }
      return;
    }

    // Ctrl+D for deselect all OR duplicate (depends on selection)
    if ((e.key === 'd' || e.key === 'D') && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
      if (store.selectedModuleId) {
        e.preventDefault();
        duplicateSelectedModules();
      }
      return;
    }

    // Ctrl+Shift+A or Ctrl+D (with shift) for deselect all
    if ((e.key === 'a' || e.key === 'A') && (e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault();
      selectionStore.clearSelection();
      store.selectModule(null);
      store.selectConnection(null);
      showFeedback('已取消全选');
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

    // G for toggle grid (when not using Ctrl+G)
    if (e.key === 'g' || e.key === 'G') {
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        store.toggleGrid();
        showFeedback(store.gridEnabled ? '网格已隐藏' : '网格已显示');
      }
      return;
    }
  }, [enabled, excludeWhenInputFocused, showFeedback, groupSelectedModules, ungroupSelectedModules, copySelectedModules, pasteSelectedModules, duplicateSelectedModules]);

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
    groups,
    groupSelectedModules,
    ungroupSelectedModules,
  };
}

export default useKeyboardShortcuts;
