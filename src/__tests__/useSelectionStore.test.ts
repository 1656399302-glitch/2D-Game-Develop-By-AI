import { describe, it, expect, beforeEach } from 'vitest';
import { useSelectionStore } from '../store/useSelectionStore';

describe('useSelectionStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSelectionStore.setState({
      selectedModuleIds: [],
      isBoxSelecting: false,
      boxStart: null,
      boxEnd: null,
    });
  });

  describe('basic selection operations', () => {
    it('should add module to selection', () => {
      const { addToSelection } = useSelectionStore.getState();
      
      addToSelection('module-1');
      
      expect(useSelectionStore.getState().selectedModuleIds).toContain('module-1');
    });

    it('should add multiple modules to selection', () => {
      const { addToSelection } = useSelectionStore.getState();
      
      addToSelection('module-1');
      addToSelection('module-2');
      addToSelection('module-3');
      
      expect(useSelectionStore.getState().selectedModuleIds).toHaveLength(3);
      expect(useSelectionStore.getState().selectedModuleIds).toEqual(['module-1', 'module-2', 'module-3']);
    });

    it('should not add duplicate module to selection', () => {
      const { addToSelection } = useSelectionStore.getState();
      
      addToSelection('module-1');
      addToSelection('module-1');
      
      expect(useSelectionStore.getState().selectedModuleIds).toHaveLength(1);
    });

    it('should remove module from selection', () => {
      const { addToSelection, removeFromSelection } = useSelectionStore.getState();
      
      addToSelection('module-1');
      addToSelection('module-2');
      removeFromSelection('module-1');
      
      expect(useSelectionStore.getState().selectedModuleIds).toHaveLength(1);
      expect(useSelectionStore.getState().selectedModuleIds).not.toContain('module-1');
      expect(useSelectionStore.getState().selectedModuleIds).toContain('module-2');
    });

    it('should clear all selections', () => {
      const { addToSelection, clearSelection } = useSelectionStore.getState();
      
      addToSelection('module-1');
      addToSelection('module-2');
      addToSelection('module-3');
      clearSelection();
      
      expect(useSelectionStore.getState().selectedModuleIds).toHaveLength(0);
    });

    it('should select all modules at once', () => {
      const { selectAll } = useSelectionStore.getState();
      
      selectAll(['module-1', 'module-2', 'module-3', 'module-4']);
      
      expect(useSelectionStore.getState().selectedModuleIds).toHaveLength(4);
      expect(useSelectionStore.getState().selectedModuleIds).toEqual(['module-1', 'module-2', 'module-3', 'module-4']);
    });
  });

  describe('toggle selection', () => {
    it('should add module when toggling unselected module', () => {
      const { toggleSelection } = useSelectionStore.getState();
      
      toggleSelection('module-1');
      
      expect(useSelectionStore.getState().selectedModuleIds).toContain('module-1');
    });

    it('should remove module when toggling selected module', () => {
      const { addToSelection, toggleSelection } = useSelectionStore.getState();
      
      addToSelection('module-1');
      toggleSelection('module-1');
      
      expect(useSelectionStore.getState().selectedModuleIds).not.toContain('module-1');
    });
  });

  describe('set selection', () => {
    it('should replace current selection with new set of modules', () => {
      const { addToSelection, setSelection } = useSelectionStore.getState();
      
      addToSelection('module-1');
      addToSelection('module-2');
      setSelection(['module-3', 'module-4']);
      
      expect(useSelectionStore.getState().selectedModuleIds).toHaveLength(2);
      expect(useSelectionStore.getState().selectedModuleIds).toEqual(['module-3', 'module-4']);
    });
  });

  describe('box selection', () => {
    it('should start box selection', () => {
      const { startBoxSelection } = useSelectionStore.getState();
      
      startBoxSelection(100, 200);
      
      expect(useSelectionStore.getState().isBoxSelecting).toBe(true);
      expect(useSelectionStore.getState().boxStart).toEqual({ x: 100, y: 200 });
      expect(useSelectionStore.getState().boxEnd).toEqual({ x: 100, y: 200 });
    });

    it('should update box selection end point', () => {
      const { startBoxSelection, updateBoxSelection } = useSelectionStore.getState();
      
      startBoxSelection(100, 200);
      updateBoxSelection(300, 400);
      
      expect(useSelectionStore.getState().boxEnd).toEqual({ x: 300, y: 400 });
    });

    it('should end box selection and reset state', () => {
      const { startBoxSelection, endBoxSelection } = useSelectionStore.getState();
      
      startBoxSelection(100, 200);
      endBoxSelection();
      
      expect(useSelectionStore.getState().isBoxSelecting).toBe(false);
      expect(useSelectionStore.getState().boxStart).toBeNull();
      expect(useSelectionStore.getState().boxEnd).toBeNull();
    });

    it('should cancel box selection and reset state', () => {
      const { startBoxSelection, cancelBoxSelection } = useSelectionStore.getState();
      
      startBoxSelection(100, 200);
      cancelBoxSelection();
      
      expect(useSelectionStore.getState().isBoxSelecting).toBe(false);
      expect(useSelectionStore.getState().boxStart).toBeNull();
      expect(useSelectionStore.getState().boxEnd).toBeNull();
    });
  });
});
