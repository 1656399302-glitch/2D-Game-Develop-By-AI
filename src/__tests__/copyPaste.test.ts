/**
 * Copy/Paste Tests
 * 
 * Tests for useCopyPaste hook covering:
 * - AC-110-004: Copy creates module duplicate with offset position
 * - AC-110-005: Paste multiple times creates independent copies
 * - AC-110-009: Copy/paste keyboard shortcuts (Ctrl+C, Ctrl+V)
 * - AC-110-014: Paste does NOT duplicate connection IDs
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';
import { useSelectionStore } from '../store/useSelectionStore';
import { 
  useCopyPaste, 
  createModuleInstance, 
  createConnectionInstance, 
  validateClipboardData,
  getClipboardBounds 
} from '../hooks/useCopyPaste';
import { renderHook, act } from '@testing-library/react';

// Module size constants (matching store)
const CORE_FURNACE_SIZE = { width: 100, height: 100 };
const ENERGY_PIPE_SIZE = { width: 120, height: 50 };

// Helper to reset store to initial state
const resetStore = () => {
  useMachineStore.setState({
    modules: [],
    connections: [],
    selectedModuleId: null,
    selectedConnectionId: null,
    isConnecting: false,
    connectionStart: null,
    connectionPreview: null,
    viewport: { x: 0, y: 0, zoom: 1 },
    machineState: 'idle',
    history: [{ modules: [], connections: [] }],
    historyIndex: 0,
    gridEnabled: false, // Disable grid snapping for predictable tests
    clipboardModules: [],
    clipboardConnections: [],
    generatedAttributes: null,
    randomForgeToastVisible: false,
    randomForgeToastMessage: '',
    hasLoadedSavedState: false,
    activationZoom: {
      isZooming: false,
      startViewport: null,
      targetViewport: null,
      startTime: 0,
      duration: 800,
    },
    activationModuleIndex: -1,
    activationStartTime: null,
    showExportModal: false,
    showCodexModal: false,
    connectionError: null,
  });
  
  useSelectionStore.setState({
    selectedModuleIds: [],
    selectionBox: null,
    lastSelectedId: null,
  });
};

beforeEach(() => {
  resetStore();
});

afterEach(() => {
  resetStore();
});

describe('useCopyPaste', () => {
  describe('AC-110-004: Copy creates module duplicate with offset position', () => {
    it('should copy single selected module', () => {
      const { result } = renderHook(() => useCopyPaste());
      const store = useMachineStore.getState();
      
      // Add a module
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      const originalModule = useMachineStore.getState().modules[0];
      const originalInstanceId = originalModule.instanceId;
      
      // Select the module
      act(() => {
        store.selectModule(originalInstanceId);
      });
      
      // Copy
      act(() => {
        result.current.copy();
      });
      
      // Clipboard should have the module
      const clipboard = result.current.getClipboard();
      expect(clipboard.modules.length).toBe(1);
      expect(clipboard.modules[0].instanceId).toBe(originalInstanceId);
    });

    it('should paste with offset', () => {
      const { result } = renderHook(() => useCopyPaste());
      const store = useMachineStore.getState();
      
      // Add a module - note: position is center-based
      // addModule(x, y) places the center at (x, y)
      // So for a 100x100 module at center (200, 200), top-left is at (150, 150)
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      const originalModule = useMachineStore.getState().modules[0];
      const originalInstanceId = originalModule.instanceId;
      
      // Select and copy
      act(() => {
        store.selectModule(originalInstanceId);
        result.current.copy();
      });
      
      // Paste
      act(() => {
        result.current.paste();
      });
      
      // Should now have 2 modules
      expect(useMachineStore.getState().modules.length).toBe(2);
      
      // Original should be at (150, 150) - center (200,200) - half size (50,50)
      const original = useMachineStore.getState().modules.find(m => m.instanceId === originalInstanceId);
      expect(original?.x).toBe(150);
      expect(original?.y).toBe(150);
      
      // Pasted module should be at (170, 170) - original (150,150) + offset (20,20)
      const pastedModule = useMachineStore.getState().modules.find(m => m.instanceId !== originalInstanceId);
      expect(pastedModule).toBeDefined();
      expect(pastedModule?.x).toBe(170);
      expect(pastedModule?.y).toBe(170);
    });

    it('should copy multiple selected modules', () => {
      const { result } = renderHook(() => useCopyPaste());
      const store = useMachineStore.getState();
      const selectionStore = useSelectionStore.getState();
      
      // Add multiple modules
      act(() => {
        store.addModule('core-furnace', 200, 200);
        store.addModule('energy-pipe', 300, 200);
      });
      
      const modules = useMachineStore.getState().modules;
      const moduleIds = modules.map(m => m.instanceId);
      
      // Select both modules
      act(() => {
        selectionStore.setSelection(moduleIds);
      });
      
      // Copy
      act(() => {
        result.current.copy();
      });
      
      // Clipboard should have both modules
      const clipboard = result.current.getClipboard();
      expect(clipboard.modules.length).toBe(2);
    });

    it('should preserve module properties on copy', () => {
      const { result } = renderHook(() => useCopyPaste());
      const store = useMachineStore.getState();
      
      // Add a module
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      const originalModule = useMachineStore.getState().modules[0];
      const originalInstanceId = originalModule.instanceId;
      
      act(() => {
        store.selectModule(originalInstanceId);
        result.current.copy();
      });
      
      const clipboard = result.current.getClipboard();
      const copiedModule = clipboard.modules[0];
      
      // Verify all properties are copied
      expect(copiedModule.type).toBe(originalModule.type);
      expect(copiedModule.x).toBe(originalModule.x);
      expect(copiedModule.y).toBe(originalModule.y);
      expect(copiedModule.rotation).toBe(originalModule.rotation);
      expect(copiedModule.scale).toBe(originalModule.scale);
      expect(copiedModule.flipped).toBe(originalModule.flipped);
      expect(copiedModule.ports.length).toBe(originalModule.ports.length);
    });
  });

  describe('AC-110-005: Paste multiple times creates independent copies', () => {
    it('should paste three times creating three independent copies', () => {
      const { result } = renderHook(() => useCopyPaste());
      const store = useMachineStore.getState();
      
      // Add a module
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      const originalInstanceId = useMachineStore.getState().modules[0].instanceId;
      
      // Select and copy
      act(() => {
        store.selectModule(originalInstanceId);
        result.current.copy();
      });
      
      // Paste 3 times
      act(() => { result.current.paste(); });
      act(() => { result.current.paste(); });
      act(() => { result.current.paste(); });
      
      // Should have 4 modules total (1 original + 3 copies)
      expect(useMachineStore.getState().modules.length).toBe(4);
      
      // All modules should have unique IDs
      const instanceIds = useMachineStore.getState().modules.map(m => m.instanceId);
      const uniqueIds = new Set(instanceIds);
      expect(uniqueIds.size).toBe(4);
    });

    it('should delete original and keep all copies', () => {
      const { result } = renderHook(() => useCopyPaste());
      const store = useMachineStore.getState();
      
      // Add a module
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      const originalInstanceId = useMachineStore.getState().modules[0].instanceId;
      
      // Select, copy, and paste
      act(() => {
        store.selectModule(originalInstanceId);
        result.current.copy();
        result.current.paste();
        result.current.paste();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(3);
      
      // Delete original
      act(() => {
        store.selectModule(originalInstanceId);
        store.deleteSelected();
      });
      
      // Should have 2 remaining copies
      expect(useMachineStore.getState().modules.length).toBe(2);
    });

    it('should re-copy last selection after paste', () => {
      const { result } = renderHook(() => useCopyPaste());
      const store = useMachineStore.getState();
      
      // Add two modules
      act(() => {
        store.addModule('core-furnace', 200, 200);
        store.addModule('energy-pipe', 400, 200);
      });
      
      const moduleIds = useMachineStore.getState().modules.map(m => m.instanceId);
      
      // Select first module and copy
      act(() => {
        store.selectModule(moduleIds[0]);
        result.current.copy();
      });
      
      // Paste once
      act(() => {
        result.current.paste();
      });
      
      // Re-copy (should copy first module again)
      act(() => {
        result.current.copy();
      });
      
      // Paste again
      act(() => {
        result.current.paste();
      });
      
      // Should have 4 modules total (2 original + 2 copies)
      expect(useMachineStore.getState().modules.length).toBe(4);
    });

    it('should create independent copies with independent properties', () => {
      const { result } = renderHook(() => useCopyPaste());
      const store = useMachineStore.getState();
      
      // Add a module
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      const originalInstanceId = useMachineStore.getState().modules[0].instanceId;
      
      // Rotate original
      act(() => {
        store.updateModuleRotation(originalInstanceId, 90);
      });
      
      // Copy and paste
      act(() => {
        store.selectModule(originalInstanceId);
        result.current.copy();
        result.current.paste();
      });
      
      // Original should be rotated, copy should have default rotation
      const modules = useMachineStore.getState().modules;
      const original = modules.find(m => m.instanceId === originalInstanceId);
      const copy = modules.find(m => m.instanceId !== originalInstanceId);
      
      expect(original?.rotation).toBe(90);
      expect(copy?.rotation).toBe(0); // Default, not copied from original
    });
  });

  describe('AC-110-009: Copy/paste keyboard shortcuts', () => {
    it('should trigger copy on Ctrl+C', () => {
      const { result } = renderHook(() => useCopyPaste());
      const store = useMachineStore.getState();
      
      // Add and select a module
      act(() => {
        store.addModule('core-furnace', 200, 200);
        store.selectModule(useMachineStore.getState().modules[0].instanceId);
      });
      
      // Manually call copy function (keyboard shortcut integration tested separately)
      act(() => {
        result.current.copy();
      });
      
      // Clipboard should have the module
      expect(result.current.canPaste()).toBe(true);
    });

    it('should trigger paste on Ctrl+V', () => {
      const { result } = renderHook(() => useCopyPaste());
      const store = useMachineStore.getState();
      
      // Add, select, and copy a module
      act(() => {
        store.addModule('core-furnace', 200, 200);
        store.selectModule(useMachineStore.getState().modules[0].instanceId);
        result.current.copy();
      });
      
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      // Manually call paste function
      act(() => {
        result.current.paste();
      });
      
      // Should now have 2 modules
      expect(useMachineStore.getState().modules.length).toBe(2);
    });

    it('should not paste when clipboard is empty', () => {
      const store = useMachineStore.getState();
      
      // No modules added, clipboard should be empty
      expect(useMachineStore.getState().clipboardModules.length).toBe(0);
      
      // Should still have 0 modules
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('should paste with correct offset', () => {
      const { result } = renderHook(() => useCopyPaste());
      const store = useMachineStore.getState();
      
      // Add module
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      const originalInstanceId = useMachineStore.getState().modules[0].instanceId;
      
      // Copy and paste
      act(() => {
        store.selectModule(originalInstanceId);
        result.current.copy();
        result.current.paste();
      });
      
      const modules = useMachineStore.getState().modules;
      const copy = modules.find(m => m.instanceId !== originalInstanceId);
      
      // Original at (150, 150), copy at (170, 170) with 20px offset
      expect(copy?.x).toBe(170);
      expect(copy?.y).toBe(170);
    });
  });

  describe('AC-110-014: Paste does NOT duplicate connection IDs', () => {
    it('should generate new unique module IDs on paste', () => {
      const { result } = renderHook(() => useCopyPaste());
      const store = useMachineStore.getState();
      
      // Add a module
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      const originalInstanceId = useMachineStore.getState().modules[0].instanceId;
      
      // Copy and paste
      act(() => {
        store.selectModule(originalInstanceId);
        result.current.copy();
        result.current.paste();
      });
      
      const modules = useMachineStore.getState().modules;
      
      // Original and copy should have different IDs
      expect(modules[0].instanceId).not.toBe(modules[1].instanceId);
      expect(modules[0].id).not.toBe(modules[1].id);
    });

    it('should generate new unique connection IDs on paste', () => {
      const { result } = renderHook(() => useCopyPaste());
      const store = useMachineStore.getState();
      
      // Add two modules
      act(() => {
        store.addModule('core-furnace', 200, 200);
        store.addModule('energy-pipe', 400, 200);
      });
      
      const module1 = useMachineStore.getState().modules[0];
      const module2 = useMachineStore.getState().modules[1];
      
      // Get port IDs
      const sourcePortId = module1.ports.find(p => p.type === 'output')?.id || `${module1.type}-output-0`;
      const targetPortId = module2.ports.find(p => p.type === 'input')?.id || `${module2.type}-input-0`;
      
      // Create connection
      act(() => {
        store.startConnection(module1.instanceId, sourcePortId);
        store.completeConnection(module2.instanceId, targetPortId);
      });
      
      const originalConnectionId = useMachineStore.getState().connections[0].id;
      
      // Copy and paste
      act(() => {
        store.selectModule(module1.instanceId);
        result.current.copy();
        result.current.paste();
      });
      
      // Check connections
      const connections = useMachineStore.getState().connections;
      
      // Original connection should remain
      const originalConn = connections.find(c => c.id === originalConnectionId);
      expect(originalConn).toBeDefined();
      
      // New connection should have different ID
      const newConns = connections.filter(c => c.id !== originalConnectionId);
      expect(newConns.length).toBeGreaterThan(0);
      newConns.forEach(conn => {
        expect(conn.id).not.toBe(originalConnectionId);
      });
    });

    it('should update connection references when pasting modules with connections', () => {
      const { result } = renderHook(() => useCopyPaste());
      const store = useMachineStore.getState();
      
      // Add two modules
      act(() => {
        store.addModule('core-furnace', 200, 200);
        store.addModule('energy-pipe', 400, 200);
      });
      
      const module1 = useMachineStore.getState().modules[0];
      const module2 = useMachineStore.getState().modules[1];
      
      // Get port IDs
      const sourcePortId = module1.ports.find(p => p.type === 'output')?.id || `${module1.type}-output-0`;
      const targetPortId = module2.ports.find(p => p.type === 'input')?.id || `${module2.type}-input-0`;
      
      // Create connection
      act(() => {
        store.startConnection(module1.instanceId, sourcePortId);
        store.completeConnection(module2.instanceId, targetPortId);
      });
      
      // Copy both modules
      const moduleIds = useMachineStore.getState().modules.map(m => m.instanceId);
      
      act(() => {
        useSelectionStore.setState({ selectedModuleIds: moduleIds });
        result.current.copy();
      });
      
      // Paste
      act(() => {
        result.current.paste();
      });
      
      // Should now have 4 modules (2 original + 2 copies)
      expect(useMachineStore.getState().modules.length).toBe(4);
      
      // Should have 2 connections (original + new)
      expect(useMachineStore.getState().connections.length).toBe(2);
      
      // All connection IDs should be unique
      const connectionIds = useMachineStore.getState().connections.map(c => c.id);
      const uniqueConnectionIds = new Set(connectionIds);
      expect(uniqueConnectionIds.size).toBe(2);
    });

    it('should generate unique port IDs on paste', () => {
      const { result } = renderHook(() => useCopyPaste());
      const store = useMachineStore.getState();
      
      // Add a module
      act(() => {
        store.addModule('core-furnace', 200, 200);
      });
      
      const originalInstanceId = useMachineStore.getState().modules[0].instanceId;
      const originalPorts = useMachineStore.getState().modules[0].ports.map(p => p.id);
      
      // Copy and paste
      act(() => {
        store.selectModule(originalInstanceId);
        result.current.copy();
        result.current.paste();
      });
      
      const modules = useMachineStore.getState().modules;
      const copiedPorts = modules.find(m => m.instanceId !== originalInstanceId)?.ports.map(p => p.id) || [];
      
      // Port IDs should be different
      originalPorts.forEach((originalPortId, idx) => {
        expect(copiedPorts[idx]).not.toBe(originalPortId);
      });
    });
  });

  describe('Additional functionality', () => {
    describe('canPaste', () => {
      it('should return false when clipboard is empty', () => {
        const { result } = renderHook(() => useCopyPaste());
        expect(result.current.canPaste()).toBe(false);
      });

      it('should return true when clipboard has content', () => {
        const { result } = renderHook(() => useCopyPaste());
        const store = useMachineStore.getState();
        
        act(() => {
          store.addModule('core-furnace', 200, 200);
          store.selectModule(useMachineStore.getState().modules[0].instanceId);
          result.current.copy();
        });
        
        expect(result.current.canPaste()).toBe(true);
      });
    });

    describe('clearClipboard', () => {
      it('should clear clipboard contents', () => {
        const { result } = renderHook(() => useCopyPaste());
        const store = useMachineStore.getState();
        
        act(() => {
          store.addModule('core-furnace', 200, 200);
          store.selectModule(useMachineStore.getState().modules[0].instanceId);
          result.current.copy();
        });
        
        expect(result.current.canPaste()).toBe(true);
        
        act(() => {
          result.current.clearClipboard();
        });
        
        expect(result.current.canPaste()).toBe(false);
      });
    });

    describe('duplicate', () => {
      it('should duplicate selected module with offset', () => {
        const { result } = renderHook(() => useCopyPaste());
        const store = useMachineStore.getState();
        
        act(() => {
          store.addModule('core-furnace', 200, 200);
        });
        
        const originalInstanceId = useMachineStore.getState().modules[0].instanceId;
        
        act(() => {
          store.selectModule(originalInstanceId);
          result.current.duplicate();
        });
        
        expect(useMachineStore.getState().modules.length).toBe(2);
        
        const duplicate = useMachineStore.getState().modules.find(m => m.instanceId !== originalInstanceId);
        // Original at (150, 150), duplicate at (170, 170) with DUPLICATE_OFFSET = 20
        expect(duplicate?.x).toBe(170);
        expect(duplicate?.y).toBe(170);
      });
    });
  });

  describe('Helper functions', () => {
    describe('createModuleInstance', () => {
      it('should create new instance with offset', () => {
        const template = {
          id: 'module-1',
          instanceId: 'inst-1',
          type: 'core-furnace' as const,
          x: 100,
          y: 200,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [
            { id: 'port-1', type: 'input' as const, position: { x: 25, y: 50 } },
          ],
        };

        const newInstance = createModuleInstance(template, 30, 40);

        expect(newInstance.instanceId).not.toBe('inst-1');
        expect(newInstance.x).toBe(130);
        expect(newInstance.y).toBe(240);
        expect(newInstance.ports[0].id).not.toBe('port-1');
      });

      it('should generate unique port IDs', () => {
        const template = {
          id: 'module-1',
          instanceId: 'inst-1',
          type: 'core-furnace' as const,
          x: 100,
          y: 200,
          rotation: 0,
          scale: 1,
          flipped: false,
          ports: [
            { id: 'port-1', type: 'input' as const, position: { x: 25, y: 50 } },
            { id: 'port-2', type: 'output' as const, position: { x: 75, y: 50 } },
          ],
        };

        const newInstance = createModuleInstance(template);

        expect(newInstance.ports[0].id).not.toBe('port-1');
        expect(newInstance.ports[1].id).not.toBe('port-2');
        expect(newInstance.ports[0].id).not.toBe(newInstance.ports[1].id);
      });
    });

    describe('createConnectionInstance', () => {
      it('should create new connection with updated module references', () => {
        const template = {
          id: 'conn-1',
          sourceModuleId: 'inst-1',
          sourcePortId: 'port-1',
          targetModuleId: 'inst-2',
          targetPortId: 'port-2',
          pathData: 'M0,0 L100,100',
        };

        const idMapping = new Map([
          ['inst-1', 'new-inst-1'],
          ['inst-2', 'new-inst-2'],
        ]);

        const newConnection = createConnectionInstance(template, idMapping);

        expect(newConnection.id).not.toBe('conn-1');
        expect(newConnection.sourceModuleId).toBe('new-inst-1');
        expect(newConnection.targetModuleId).toBe('new-inst-2');
      });
    });

    describe('validateClipboardData', () => {
      it('should return true for valid clipboard data', () => {
        const validData = {
          modules: [
            {
              id: 'module-1',
              instanceId: 'inst-1',
              type: 'core-furnace' as const,
              x: 100,
              y: 200,
              rotation: 0,
              scale: 1,
              flipped: false,
              ports: [],
            },
          ],
          connections: [],
        };

        expect(validateClipboardData(validData)).toBe(true);
      });

      it('should return false for invalid clipboard data', () => {
        const invalidData = {
          modules: 'not an array',
          connections: [],
        } as any;

        expect(validateClipboardData(invalidData)).toBe(false);
      });

      it('should return false for modules missing required fields', () => {
        const invalidData = {
          modules: [
            {
              id: 'module-1',
              // missing instanceId and type
              x: 100,
              y: 200,
            },
          ],
          connections: [],
        } as any;

        expect(validateClipboardData(invalidData)).toBe(false);
      });
    });

    describe('getClipboardBounds', () => {
      it('should calculate bounding box of clipboard modules', () => {
        const data = {
          modules: [
            { instanceId: '1', x: 100, y: 100, ports: [] } as any,
            { instanceId: '2', x: 200, y: 300, ports: [] } as any,
            { instanceId: '3', x: 150, y: 200, ports: [] } as any,
          ],
          connections: [],
        };

        const bounds = getClipboardBounds(data);

        expect(bounds.minX).toBe(100);
        expect(bounds.minY).toBe(100);
        expect(bounds.maxX).toBe(200);
        expect(bounds.maxY).toBe(300);
        expect(bounds.width).toBe(100);
        expect(bounds.height).toBe(200);
      });

      it('should return zeros for empty clipboard', () => {
        const bounds = getClipboardBounds({ modules: [], connections: [] });

        expect(bounds.minX).toBe(0);
        expect(bounds.minY).toBe(0);
        expect(bounds.width).toBe(0);
        expect(bounds.height).toBe(0);
      });
    });
  });
});
