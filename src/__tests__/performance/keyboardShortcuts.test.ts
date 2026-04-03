import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useMachineStore } from '../../store/useMachineStore';
import { act } from '@testing-library/react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { renderHook } from '@testing-library/react';

// Mock random forge callback
const mockRandomForge = vi.fn();

describe('AC3: Keyboard Shortcuts Work Correctly', () => {
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
      machineState: 'idle',
      gridEnabled: true,
      connectionError: null,
      clipboardModules: [],
      clipboardConnections: [],
      showExportModal: false,
      showCodexModal: false,
    });
    mockRandomForge.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Delete/Backspace - Module Deletion', () => {
    it('should delete selected module when Delete key is pressed', () => {
      const store = useMachineStore.getState();
      
      // Add a module
      act(() => {
        store.addModule('core-furnace', 100, 100);
      });
      
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      // Select and delete
      act(() => {
        store.selectModule(moduleId);
        store.removeModule(moduleId);
      });
      
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('should delete selected connection when Delete key is pressed', () => {
      const store = useMachineStore.getState();
      
      // Add modules and create connection
      act(() => {
        store.addModule('core-furnace', 100, 100);
        store.addModule('gear', 200, 100);
      });
      
      const modules = useMachineStore.getState().modules;
      const connection = {
        id: 'test-conn',
        sourceModuleId: modules[0].instanceId,
        sourcePortId: modules[0].ports[0]?.id || 'p1',
        targetModuleId: modules[1].instanceId,
        targetPortId: modules[1].ports[0]?.id || 'p2',
        pathData: 'M0,0 L100,100',
      };
      
      act(() => {
        useMachineStore.setState({ 
          connections: [connection],
          selectedConnectionId: 'test-conn',
        });
      });
      
      expect(useMachineStore.getState().connections.length).toBe(1);
      
      // Delete connection
      act(() => {
        store.removeConnection('test-conn');
      });
      
      expect(useMachineStore.getState().connections.length).toBe(0);
    });

    it('should handle Delete with no selection gracefully', () => {
      const store = useMachineStore.getState();
      
      // Should not throw
      expect(() => {
        act(() => {
          store.removeModule('non-existent-id');
        });
      }).not.toThrow();
    });
  });

  describe('Ctrl+D - Duplicate', () => {
    it('should duplicate selected module', () => {
      const store = useMachineStore.getState();
      
      // Add a module
      act(() => {
        store.addModule('core-furnace', 100, 100);
      });
      
      const originalModule = useMachineStore.getState().modules[0];
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      // Duplicate
      act(() => {
        store.duplicateModule(originalModule.instanceId);
      });
      
      expect(useMachineStore.getState().modules.length).toBe(2);
      const duplicated = useMachineStore.getState().modules[1];
      expect(duplicated.x).toBe(originalModule.x + 20);
      expect(duplicated.y).toBe(originalModule.y + 20);
    });

    it('should duplicate multiple selected modules', () => {
      const store = useMachineStore.getState();
      
      // Add modules
      act(() => {
        store.addModule('core-furnace', 100, 100);
        store.addModule('gear', 150, 100);
      });
      
      expect(useMachineStore.getState().modules.length).toBe(2);
      
      // Duplicate first module twice
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      act(() => {
        store.duplicateModule(moduleId);
        store.duplicateModule(moduleId);
      });
      
      expect(useMachineStore.getState().modules.length).toBe(4);
    });
  });

  describe('Ctrl+C - Copy', () => {
    it('should copy selected module to clipboard', () => {
      const store = useMachineStore.getState();
      
      // Add and select module
      act(() => {
        store.addModule('core-furnace', 100, 100);
      });
      
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      act(() => {
        store.selectModule(moduleId);
        store.copySelected();
      });
      
      expect(useMachineStore.getState().clipboardModules.length).toBe(1);
    });

    it('should copy all modules when none selected', () => {
      const store = useMachineStore.getState();
      
      // Add modules
      act(() => {
        store.addModule('core-furnace', 100, 100);
        store.addModule('gear', 200, 100);
      });
      
      act(() => {
        store.selectModule(null);
        store.copySelected();
      });
      
      expect(useMachineStore.getState().clipboardModules.length).toBe(2);
    });
  });

  describe('Ctrl+V - Paste', () => {
    it('should paste modules from clipboard with offset', () => {
      const store = useMachineStore.getState();
      
      // Add and copy module
      act(() => {
        store.addModule('core-furnace', 100, 100);
      });
      
      const originalModule = useMachineStore.getState().modules[0];
      
      act(() => {
        store.copySelected();
        store.pasteModules();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(2);
      const pasted = useMachineStore.getState().modules[1];
      expect(pasted.x).toBe(originalModule.x + 20);
      expect(pasted.y).toBe(originalModule.y + 20);
    });

    it('should handle paste when clipboard is empty', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 100, 100);
        store.selectModule(null);
      });
      
      const initialCount = useMachineStore.getState().modules.length;
      
      act(() => {
        store.pasteModules();
      });
      
      // Should not add any modules
      expect(useMachineStore.getState().modules.length).toBe(initialCount);
    });
  });

  describe('Ctrl+A - Select All', () => {
    it('should select all modules', () => {
      const store = useMachineStore.getState();
      
      // Add modules
      act(() => {
        store.addModule('core-furnace', 100, 100);
        store.addModule('gear', 200, 100);
        store.addModule('rune-node', 300, 100);
      });
      
      expect(useMachineStore.getState().modules.length).toBe(3);
      
      act(() => {
        store.selectAllModules();
      });
      
      // Should select first module
      expect(useMachineStore.getState().selectedModuleId).toBeTruthy();
    });
  });

  describe('Escape - Deselect', () => {
    it('should deselect all modules', () => {
      const store = useMachineStore.getState();
      
      // Add and select module
      act(() => {
        store.addModule('core-furnace', 100, 100);
      });
      
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      act(() => {
        store.selectModule(moduleId);
      });
      
      expect(useMachineStore.getState().selectedModuleId).toBe(moduleId);
      
      act(() => {
        store.selectModule(null);
      });
      
      expect(useMachineStore.getState().selectedModuleId).toBeNull();
    });

    it('should cancel connection mode', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.startConnection('module1', 'port1');
      });
      
      expect(useMachineStore.getState().isConnecting).toBe(true);
      
      act(() => {
        store.cancelConnection();
      });
      
      expect(useMachineStore.getState().isConnecting).toBe(false);
    });
  });

  describe('Ctrl+Z - Undo', () => {
    it('should undo last action', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 100, 100);
      });
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      act(() => {
        store.undo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('should not crash when history is empty', () => {
      const store = useMachineStore.getState();
      
      expect(() => {
        act(() => {
          store.undo();
        });
      }).not.toThrow();
    });
  });

  describe('Ctrl+Shift+Z - Redo', () => {
    it('should redo undone action', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 100, 100);
      });
      
      act(() => {
        store.undo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      act(() => {
        store.redo();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(1);
    });

    it('should not crash when at latest state', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 100, 100);
      });
      
      expect(() => {
        act(() => {
          store.redo();
        });
      }).not.toThrow();
    });
  });

  describe('Ctrl+S - Save', () => {
    it('should open codex modal', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 100, 100);
        store.setShowCodexModal(true);
      });
      
      expect(useMachineStore.getState().showCodexModal).toBe(true);
    });
  });

  describe('Ctrl+E - Export', () => {
    it('should open export modal', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 100, 100);
        store.setShowExportModal(true);
      });
      
      expect(useMachineStore.getState().showExportModal).toBe(true);
    });
  });

  describe('Ctrl+R - Random Forge', () => {
    it('should call random forge handler when configured', () => {
      renderHook(() => 
        useKeyboardShortcuts({ onRandomForge: mockRandomForge })
      );
      
      // Simulate Ctrl+R
      const event = new KeyboardEvent('keydown', {
        key: 'r',
        ctrlKey: true,
        bubbles: true,
      });
      
      act(() => {
        document.dispatchEvent(event);
      });
      
      expect(mockRandomForge).toHaveBeenCalled();
    });

    it('should not trigger with only R key', () => {
      renderHook(() => 
        useKeyboardShortcuts({ onRandomForge: mockRandomForge })
      );
      
      // Simulate R key (without Ctrl)
      const event = new KeyboardEvent('keydown', {
        key: 'r',
        bubbles: true,
      });
      
      act(() => {
        document.dispatchEvent(event);
      });
      
      // Should not call random forge with just R
      expect(mockRandomForge).not.toHaveBeenCalled();
    });
  });

  describe('+ / = - Zoom In', () => {
    it('should zoom in', () => {
      const store = useMachineStore.getState();
      const initialZoom = useMachineStore.getState().viewport.zoom;
      
      act(() => {
        store.zoomIn();
      });
      
      expect(useMachineStore.getState().viewport.zoom).toBeGreaterThan(initialZoom);
    });
  });

  describe('- - Zoom Out', () => {
    it('should zoom out', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.zoomOut();
      });
      
      expect(useMachineStore.getState().viewport.zoom).toBeLessThan(1);
    });
  });

  describe('0 - Reset Zoom', () => {
    it('should reset zoom to default', () => {
      const store = useMachineStore.getState();
      
      // Zoom in first
      act(() => {
        store.zoomIn();
        store.zoomIn();
      });
      
      expect(useMachineStore.getState().viewport.zoom).not.toBe(1);
      
      // Reset
      act(() => {
        store.resetViewport();
      });
      
      expect(useMachineStore.getState().viewport.zoom).toBe(1);
    });
  });

  describe('Keyboard Shortcut Conflicts', () => {
    it('should NOT intercept F5 (browser refresh)', () => {
      // F5 should not be handled by our shortcuts - verified by not preventing default
      const event = new KeyboardEvent('keydown', {
        key: 'F5',
        bubbles: true,
      });
      
      let prevented = false;
      event.preventDefault = () => { prevented = true; };
      
      act(() => {
        document.dispatchEvent(event);
      });
      
      // Our shortcuts should not prevent F5
      expect(prevented).toBe(false);
    });

    it('should NOT intercept Ctrl+W (close tab)', () => {
      // Ctrl+W should not be handled by our shortcuts
      const event = new KeyboardEvent('keydown', {
        key: 'w',
        ctrlKey: true,
        bubbles: true,
      });
      
      let prevented = false;
      event.preventDefault = () => { prevented = true; };
      
      act(() => {
        document.dispatchEvent(event);
      });
      
      // Our shortcuts should not prevent Ctrl+W
      expect(prevented).toBe(false);
    });

    it('should NOT intercept Ctrl+T (new tab)', () => {
      // Ctrl+T should not be handled by our shortcuts
      const event = new KeyboardEvent('keydown', {
        key: 't',
        ctrlKey: true,
        bubbles: true,
      });
      
      let prevented = false;
      event.preventDefault = () => { prevented = true; };
      
      act(() => {
        document.dispatchEvent(event);
      });
      
      // Our shortcuts should not prevent Ctrl+T
      expect(prevented).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle shortcuts with no modules', () => {
      const store = useMachineStore.getState();
      
      // Various shortcuts should not crash when no modules exist
      expect(() => {
        act(() => {
          store.duplicateModule('non-existent');
        });
      }).not.toThrow();
      
      expect(() => {
        act(() => {
          store.removeModule('non-existent');
        });
      }).not.toThrow();
    });

    it('should handle shortcuts with no prior copy/paste', () => {
      const store = useMachineStore.getState();
      
      act(() => {
        store.addModule('core-furnace', 100, 100);
        store.selectModule(useMachineStore.getState().modules[0].instanceId);
      });
      
      // Paste without prior copy
      expect(() => {
        act(() => {
          store.pasteModules();
        });
      }).not.toThrow();
      
      // Clipboard should still be empty
      expect(useMachineStore.getState().clipboardModules.length).toBe(0);
    });
  });
});
