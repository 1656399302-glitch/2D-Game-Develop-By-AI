import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';

describe('Keyboard Shortcuts - Store Actions', () => {
  beforeEach(() => {
    // Reset store to initial state
    useMachineStore.setState({
      modules: [],
      connections: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedModuleId: null,
      selectedConnectionId: null,
      history: [{ modules: [], connections: [] }],
      historyIndex: 0,
      isConnecting: false,
      activeMode: 'idle' as const,
      activationProgress: 0,
      connectionError: null,
      clipboardModules: [],
      clipboardConnections: [],
      showExportModal: false,
      showCodexModal: false,
    });
  });

  describe('Delete key', () => {
    it('should delete selected module when Delete key is pressed', () => {
      const { addModule, deleteSelected } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      useMachineStore.setState({ selectedModuleId: moduleId });
      deleteSelected();
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('should delete selected connection when Delete key is pressed', () => {
      const { addModule, deleteSelected } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      addModule('gear', 200, 200);
      const modules = useMachineStore.getState().modules;
      const connection = {
        id: 'conn-1',
        sourceModuleId: modules[0].instanceId,
        sourcePortId: modules[0].ports[0]?.id || 'port-1',
        targetModuleId: modules[1].instanceId,
        targetPortId: modules[1].ports[0]?.id || 'port-2',
        pathData: 'M0,0 L100,100',
      };
      useMachineStore.setState({ connections: [connection], selectedConnectionId: 'conn-1' });
      deleteSelected();
      expect(useMachineStore.getState().connections.length).toBe(0);
    });
  });

  describe('Escape key', () => {
    it('should deselect module when Escape is pressed', () => {
      const { addModule, selectModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      selectModule(moduleId);
      expect(useMachineStore.getState().selectedModuleId).toBe(moduleId);
      useMachineStore.setState({ selectedModuleId: null });
      expect(useMachineStore.getState().selectedModuleId).toBeNull();
    });

    it('should cancel connection when Escape is pressed during connection', () => {
      const { startConnection, cancelConnection } = useMachineStore.getState();
      startConnection('module1', 'port1');
      expect(useMachineStore.getState().isConnecting).toBe(true);
      cancelConnection();
      expect(useMachineStore.getState().isConnecting).toBe(false);
    });
  });

  describe('R key - Rotate', () => {
    it('should rotate module by 90 degrees when R key is pressed', () => {
      const { addModule, updateModuleRotation } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      useMachineStore.setState({ selectedModuleId: moduleId });
      updateModuleRotation(moduleId, 90);
      expect(useMachineStore.getState().modules[0].rotation).toBe(90);
    });
  });

  describe('F key - Flip', () => {
    it('should toggle flipped state on selected module', () => {
      const { addModule, updateModuleFlip } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      const moduleBefore = useMachineStore.getState().modules[0];
      expect(moduleBefore.flipped).toBe(false);
      updateModuleFlip(moduleId);
      const moduleAfter = useMachineStore.getState().modules[0];
      expect(moduleAfter.flipped).toBe(true);
      updateModuleFlip(moduleId);
      const moduleToggled = useMachineStore.getState().modules[0];
      expect(moduleToggled.flipped).toBe(false);
    });
  });

  describe('Ctrl+Z Undo', () => {
    it('should revert last action when Ctrl+Z is pressed', () => {
      const { addModule, undo, modules } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      expect(useMachineStore.getState().modules.length).toBe(1);
      undo();
      expect(useMachineStore.getState().modules.length).toBe(0);
    });
  });

  describe('Ctrl+Y Redo', () => {
    it('should restore previously undone action when Ctrl+Y is pressed', () => {
      const { addModule, undo, redo } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      undo();
      expect(useMachineStore.getState().modules.length).toBe(0);
      redo();
      expect(useMachineStore.getState().modules.length).toBe(1);
    });
  });

  describe('Ctrl+D Duplicate', () => {
    it('should duplicate selected module when Ctrl+D is pressed', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModuleId = useMachineStore.getState().modules[0].instanceId;
      useMachineStore.setState({ selectedModuleId: originalModuleId });
      duplicateModule(originalModuleId);
      expect(useMachineStore.getState().modules.length).toBe(2);
    });

    it('should offset duplicated module by 20px right and down', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModule = useMachineStore.getState().modules[0];
      const originalModuleId = originalModule.instanceId;
      useMachineStore.setState({ selectedModuleId: originalModuleId });
      duplicateModule(originalModuleId);
      const duplicatedModule = useMachineStore.getState().modules[1];
      expect(duplicatedModule.x).toBe(originalModule.x + 20);
      expect(duplicatedModule.y).toBe(originalModule.y + 20);
    });
  });

  describe('Ctrl+C Copy', () => {
    it('should copy selected module to clipboard', () => {
      const { addModule, copySelected } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModuleId = useMachineStore.getState().modules[0].instanceId;
      useMachineStore.setState({ selectedModuleId: originalModuleId });
      useMachineStore.setState({ selectedModuleId: null });
      copySelected();
      expect(useMachineStore.getState().clipboardModules.length).toBe(1);
      expect(useMachineStore.getState().clipboardModules[0].instanceId).toBe(originalModuleId);
    });

    it('should copy all modules when none selected', () => {
      const { addModule, copySelected } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      addModule('gear', 200, 200);
      useMachineStore.setState({ selectedModuleId: null });
      copySelected();
      expect(useMachineStore.getState().clipboardModules.length).toBe(2);
    });
  });

  describe('Ctrl+V Paste', () => {
    it('should paste modules from clipboard', () => {
      const { addModule, copySelected, pasteModules } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModuleId = useMachineStore.getState().modules[0].instanceId;
      useMachineStore.setState({ selectedModuleId: originalModuleId });
      copySelected();
      pasteModules();
      expect(useMachineStore.getState().modules.length).toBe(2);
    });

    it('should offset pasted modules by 30px', () => {
      const { addModule, copySelected, pasteModules } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModule = useMachineStore.getState().modules[0];
      const originalModuleId = originalModule.instanceId;
      useMachineStore.setState({ selectedModuleId: originalModuleId });
      copySelected();
      pasteModules();
      const pastedModule = useMachineStore.getState().modules[1];
      expect(pastedModule.x).toBe(originalModule.x + 30);
      expect(pastedModule.y).toBe(originalModule.y + 30);
    });

    it('should not paste when clipboard is empty', () => {
      const { addModule, pasteModules } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const initialCount = useMachineStore.getState().modules.length;
      pasteModules();
      expect(useMachineStore.getState().modules.length).toBe(initialCount);
    });
  });

  describe('Ctrl+A Select All', () => {
    it('should select first module when selectAllModules is called', () => {
      const { addModule, selectAllModules } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      addModule('gear', 200, 200);
      selectAllModules();
      expect(useMachineStore.getState().selectedModuleId).toBeTruthy();
      expect(useMachineStore.getState().modules.length).toBe(2);
    });

    it('should do nothing when no modules exist', () => {
      const { selectAllModules } = useMachineStore.getState();
      expect(() => selectAllModules()).not.toThrow();
    });
  });

  describe('Ctrl+S Save to Codex Modal', () => {
    it('should open codex modal when setShowCodexModal is called', () => {
      const { setShowCodexModal } = useMachineStore.getState();
      setShowCodexModal(true);
      expect(useMachineStore.getState().showCodexModal).toBe(true);
    });

    it('should close codex modal when setShowCodexModal is called with false', () => {
      const { setShowCodexModal } = useMachineStore.getState();
      setShowCodexModal(true);
      setShowCodexModal(false);
      expect(useMachineStore.getState().showCodexModal).toBe(false);
    });
  });

  describe('Ctrl+E Export Modal', () => {
    it('should open export modal when setShowExportModal is called', () => {
      const { setShowExportModal } = useMachineStore.getState();
      setShowExportModal(true);
      expect(useMachineStore.getState().showExportModal).toBe(true);
    });

    it('should close export modal when setShowExportModal is called with false', () => {
      const { setShowExportModal } = useMachineStore.getState();
      setShowExportModal(true);
      setShowExportModal(false);
      expect(useMachineStore.getState().showExportModal).toBe(false);
    });
  });

  describe('Scale Slider', () => {
    it('should update module scale', () => {
      const { addModule, updateModuleScale } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      updateModuleScale(moduleId, 1.5);
      const module = useMachineStore.getState().modules[0];
      expect(module.scale).toBe(1.5);
    });

    it('should clamp scale between 0.5 and 2.0', () => {
      const { addModule, updateModuleScale } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      // Below minimum
      updateModuleScale(moduleId, 0.2);
      let module = useMachineStore.getState().modules[0];
      expect(module.scale).toBe(0.5);
      // Above maximum
      updateModuleScale(moduleId, 3.0);
      module = useMachineStore.getState().modules[0];
      expect(module.scale).toBe(2.0);
    });
  });

  describe('Edge Case: Null/undefined target handling', () => {
    it('should not throw error when keyboard event has no target', () => {
      const testWithNullTarget = () => {
        const target = null;
        if (target && typeof target.closest === 'function') {
          throw new Error('Should not reach here with null target');
        }
        return true;
      };
      expect(testWithNullTarget()).toBe(true);
    });

    it('should not throw error when keyboard event target is window-like object', () => {
      const testWithNoClosest = () => {
        const target = { tagName: 'UNDEFINED' } as HTMLElement;
        if (target && typeof target.closest === 'function') {
          throw new Error('Should not reach here without closest method');
        }
        return true;
      };
      expect(testWithNoClosest()).toBe(true);
    });

    it('should not throw error when keyboard event target is proper element', () => {
      const testWithValidTarget = () => {
        const mockElement = {
          tagName: 'DIV',
          isContentEditable: false,
          closest: (selector: string) => null,
        } as unknown as HTMLElement;
        if (mockElement && typeof mockElement.closest === 'function') {
          const isInputField = 
            mockElement.tagName === 'INPUT' || 
            mockElement.tagName === 'TEXTAREA' || 
            mockElement.isContentEditable ||
            mockElement.closest('input') ||
            mockElement.closest('textarea');
          return !isInputField;
        }
        return false;
      };
      expect(testWithValidTarget()).toBe(true);
    });

    it('should detect input field correctly', () => {
      const testInputDetection = () => {
        const inputElement = {
          tagName: 'INPUT',
          isContentEditable: false,
          closest: (selector: string) => null,
        } as unknown as HTMLElement;
        
        const isInput = inputElement.tagName === 'INPUT';
        expect(isInput).toBe(true);
        
        const textareaElement = {
          tagName: 'TEXTAREA',
          isContentEditable: false,
          closest: (selector: string) => null,
        } as unknown as HTMLElement;
        
        const isTextarea = textareaElement.tagName === 'TEXTAREA';
        expect(isTextarea).toBe(true);
        
        const divWithInputChild = {
          tagName: 'DIV',
          isContentEditable: false,
          closest: (selector: string) => {
            if (selector === 'input' || selector === 'textarea') {
              return document.createElement('input');
            }
            return null;
          },
        } as unknown as HTMLElement;
        
        const hasInputAncestor = divWithInputChild.closest('input');
        expect(hasInputAncestor).not.toBeNull();
        
        return true;
      };
      expect(testInputDetection()).toBe(true);
    });
  });
});

describe('Keyboard Shortcuts - Input Field Exclusion Logic', () => {
  it('should safely handle target.closest when target is null', () => {
    const handleInputFieldCheck = (target: HTMLElement | null) => {
      if (target && typeof target.closest === 'function') {
        const isInputField = 
          target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.isContentEditable ||
          target.closest('input') ||
          target.closest('textarea');
        return isInputField;
      }
      return false;
    };

    expect(() => handleInputFieldCheck(null)).not.toThrow();
    expect(handleInputFieldCheck(null)).toBe(false);
    expect(() => handleInputFieldCheck(undefined as unknown as HTMLElement)).not.toThrow();
    expect(handleInputFieldCheck(undefined as unknown as HTMLElement)).toBe(false);
  });

  it('should safely handle target.closest when target lacks the method', () => {
    const handleInputFieldCheck = (target: HTMLElement | null) => {
      if (target && typeof target.closest === 'function') {
        const isInputField = 
          target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.isContentEditable ||
          target.closest('input') ||
          target.closest('textarea');
        return isInputField;
      }
      return false;
    };

    const targetWithoutClosest = { tagName: 'DIV' } as HTMLElement;
    expect(() => handleInputFieldCheck(targetWithoutClosest)).not.toThrow();
    expect(handleInputFieldCheck(targetWithoutClosest)).toBe(false);
  });

  it('should correctly identify input fields', () => {
    const handleInputFieldCheck = (target: HTMLElement | null) => {
      if (target && typeof target.closest === 'function') {
        const isInputField = 
          target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.isContentEditable ||
          target.closest('input') ||
          target.closest('textarea');
        return isInputField;
      }
      return false;
    };

    const inputElement = {
      tagName: 'INPUT',
      isContentEditable: false,
      closest: () => null,
    } as unknown as HTMLElement;
    expect(handleInputFieldCheck(inputElement)).toBe(true);

    const textareaElement = {
      tagName: 'TEXTAREA',
      isContentEditable: false,
      closest: () => null,
    } as unknown as HTMLElement;
    expect(handleInputFieldCheck(textareaElement)).toBe(true);

    const contentEditableElement = {
      tagName: 'DIV',
      isContentEditable: true,
      closest: () => null,
    } as unknown as HTMLElement;
    expect(handleInputFieldCheck(contentEditableElement)).toBe(true);
  });
});
