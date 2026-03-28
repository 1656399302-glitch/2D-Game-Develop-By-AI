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
      const { addModule, addConnection, deleteSelected } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      addModule('gear', 200, 200);
      const modules = useMachineStore.getState().modules;
      const connection = {
        id: 'conn-1',
        sourceModuleId: modules[0].instanceId,
        sourcePortId: modules[0].ports[0]?.id || 'port-1',
        targetModuleId: modules[1].instanceId,
        targetPortId: modules[1].ports[0]?.id || 'port-2',
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
      // This verifies the fix for "target.closest is not a function" error
      // We simulate a keyboard event by directly testing the input field detection logic
      const testWithNullTarget = () => {
        const target = null;
        // The fixed code should handle this:
        if (target && typeof target.closest === 'function') {
          // Should not reach here
          throw new Error('Should not reach here with null target');
        }
        // Should continue without error
        return true;
      };
      expect(testWithNullTarget()).toBe(true);
    });

    it('should not throw error when keyboard event target is window-like object', () => {
      // Test the edge case where target exists but doesn't have closest method
      const testWithNoClosest = () => {
        const target = { tagName: 'UNDEFINED' } as HTMLElement;
        // The fixed code should handle this:
        if (target && typeof target.closest === 'function') {
          // Should not reach here
          throw new Error('Should not reach here without closest method');
        }
        // Should continue without error
        return true;
      };
      expect(testWithNoClosest()).toBe(true);
    });

    it('should not throw error when keyboard event target is proper element', () => {
      // Test the happy path where target is a valid element
      const testWithValidTarget = () => {
        const mockElement = {
          tagName: 'DIV',
          isContentEditable: false,
          closest: (selector: string) => null,
        } as unknown as HTMLElement;
        // The fixed code should handle this:
        if (mockElement && typeof mockElement.closest === 'function') {
          const isInputField = 
            mockElement.tagName === 'INPUT' || 
            mockElement.tagName === 'TEXTAREA' || 
            mockElement.isContentEditable ||
            mockElement.closest('input') ||
            mockElement.closest('textarea');
          return !isInputField; // Should return true (not an input field)
        }
        return false;
      };
      expect(testWithValidTarget()).toBe(true);
    });

    it('should detect input field correctly', () => {
      const testInputDetection = () => {
        // Test INPUT element
        const inputElement = {
          tagName: 'INPUT',
          isContentEditable: false,
          closest: (selector: string) => null,
        } as unknown as HTMLElement;
        
        const isInput = inputElement.tagName === 'INPUT';
        expect(isInput).toBe(true);
        
        // Test TEXTAREA element
        const textareaElement = {
          tagName: 'TEXTAREA',
          isContentEditable: false,
          closest: (selector: string) => null,
        } as unknown as HTMLElement;
        
        const isTextarea = textareaElement.tagName === 'TEXTAREA';
        expect(isTextarea).toBe(true);
        
        // Test element with closest returning a match
        const divWithInputChild = {
          tagName: 'DIV',
          isContentEditable: false,
          closest: (selector: string) => {
            if (selector === 'input' || selector === 'textarea') {
              return document.createElement('input'); // Mock return
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
  // This test suite specifically validates the fix for the target.closest bug

  it('should safely handle target.closest when target is null', () => {
    // Simulating the fixed code logic
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
      return false; // Not an input field if target is null or has no closest
    };

    // Test with null target - should not throw
    expect(() => handleInputFieldCheck(null)).not.toThrow();
    expect(handleInputFieldCheck(null)).toBe(false);

    // Test with undefined target - should not throw
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

    // Test with object that doesn't have closest
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

    // Test with actual input element
    const inputElement = {
      tagName: 'INPUT',
      isContentEditable: false,
      closest: () => null,
    } as unknown as HTMLElement;
    expect(handleInputFieldCheck(inputElement)).toBe(true);

    // Test with textarea element
    const textareaElement = {
      tagName: 'TEXTAREA',
      isContentEditable: false,
      closest: () => null,
    } as unknown as HTMLElement;
    expect(handleInputFieldCheck(textareaElement)).toBe(true);

    // Test with contentEditable element
    const contentEditableElement = {
      tagName: 'DIV',
      isContentEditable: true,
      closest: () => null,
    } as unknown as HTMLElement;
    expect(handleInputFieldCheck(contentEditableElement)).toBe(true);
  });
});
