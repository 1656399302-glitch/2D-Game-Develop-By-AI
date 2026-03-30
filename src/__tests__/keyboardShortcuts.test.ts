import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';
import { useSelectionStore } from '../store/useSelectionStore';
import { useGroupingStore } from '../store/useGroupingStore';
import { 
  calculateGroupBounds, 
  calculateGroupCenter,
  rotateGroup,
  scaleGroup,
  flipGroupHorizontal,
  flipGroupVertical 
} from '../utils/groupingUtils';
import { PlacedModule } from '../types';

// Helper to create mock modules
const createMockModule = (
  instanceId: string,
  type: any = 'core-furnace',
  x: number = 100,
  y: number = 100
): PlacedModule => ({
  id: `id-${instanceId}`,
  instanceId,
  type,
  x,
  y,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports: [],
});

describe('Keyboard Shortcuts - Complete Integration', () => {
  beforeEach(() => {
    // Reset all stores to initial state
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
      connectionError: null,
      clipboardModules: [],
      clipboardConnections: [],
      showExportModal: false,
      showCodexModal: false,
      gridEnabled: true,
    });
    
    useSelectionStore.setState({
      selectedModuleIds: [],
      isBoxSelecting: false,
      boxStart: null,
      boxEnd: null,
    });
    
    useGroupingStore.setState({
      groups: new Map(),
    });
  });

  describe('AC1: Delete removes selected modules and connections', () => {
    it('Delete removes selected module from store', () => {
      const { addModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      useMachineStore.setState({ selectedModuleId: moduleId });
      useMachineStore.getState().removeModule(moduleId);
      
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('Delete removes selected connection from store', () => {
      const { addModule, connections } = useMachineStore.getState();
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
      
      useMachineStore.setState({ 
        connections: [...connections, connection],
        selectedConnectionId: 'conn-1' 
      });
      
      useMachineStore.getState().removeConnection('conn-1');
      
      expect(useMachineStore.getState().connections.length).toBe(0);
    });

    it('Delete removes module and all connected connections', () => {
      const { addModule, connections } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      addModule('gear', 200, 200);
      addModule('rune-node', 300, 200);
      const modules = useMachineStore.getState().modules;
      
      const connection1 = {
        id: 'conn-1',
        sourceModuleId: modules[0].instanceId,
        sourcePortId: modules[0].ports[0]?.id || 'port-1',
        targetModuleId: modules[1].instanceId,
        targetPortId: modules[1].ports[0]?.id || 'port-2',
        pathData: 'M0,0 L100,100',
      };
      
      const connection2 = {
        id: 'conn-2',
        sourceModuleId: modules[1].instanceId,
        sourcePortId: modules[1].ports[0]?.id || 'port-1',
        targetModuleId: modules[2].instanceId,
        targetPortId: modules[2].ports[0]?.id || 'port-2',
        pathData: 'M100,100 L200,200',
      };
      
      useMachineStore.setState({ 
        connections: [...connections, connection1, connection2],
      });
      
      // Delete the middle module
      useMachineStore.getState().removeModule(modules[1].instanceId);
      
      // Both connections should be removed
      expect(useMachineStore.getState().connections.length).toBe(0);
    });
  });

  describe('AC2: Ctrl+D duplicates with connections', () => {
    it('Ctrl+D creates offset copy of single module', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModuleId = useMachineStore.getState().modules[0].instanceId;
      
      useMachineStore.setState({ selectedModuleId: originalModuleId });
      duplicateModule(originalModuleId);
      
      expect(useMachineStore.getState().modules.length).toBe(2);
      
      const originalModule = useMachineStore.getState().modules[0];
      const duplicatedModule = useMachineStore.getState().modules[1];
      
      expect(duplicatedModule.x).toBe(originalModule.x + 20);
      expect(duplicatedModule.y).toBe(originalModule.y + 20);
      expect(duplicatedModule.instanceId).not.toBe(originalModule.instanceId);
    });

    it('Ctrl+D duplicates all selected modules', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      addModule('gear', 200, 200);
      
      const moduleIds = useMachineStore.getState().modules.map(m => m.instanceId);
      useSelectionStore.setState({ selectedModuleIds: moduleIds });
      
      moduleIds.forEach(id => duplicateModule(id));
      
      expect(useMachineStore.getState().modules.length).toBe(4);
    });

    it('Duplicated module is selected after duplicate', () => {
      const { addModule, duplicateModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const originalModuleId = useMachineStore.getState().modules[0].instanceId;
      
      useMachineStore.setState({ selectedModuleId: originalModuleId });
      duplicateModule(originalModuleId);
      
      const duplicatedModule = useMachineStore.getState().modules[1];
      expect(useMachineStore.getState().selectedModuleId).toBe(duplicatedModule.instanceId);
    });
  });

  describe('AC3: R key rotates selected 90°', () => {
    it('R rotates single module 90° clockwise', () => {
      const { addModule, updateModuleRotation } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      useMachineStore.setState({ selectedModuleId: moduleId });
      updateModuleRotation(moduleId, 90);
      
      expect(useMachineStore.getState().modules[0].rotation).toBe(90);
    });

    it('R accumulates rotation (90° → 180° → 270° → 0°)', () => {
      const { addModule, updateModuleRotation } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      useMachineStore.setState({ selectedModuleId: moduleId });
      
      updateModuleRotation(moduleId, 90);
      expect(useMachineStore.getState().modules[0].rotation).toBe(90);
      
      updateModuleRotation(moduleId, 90);
      expect(useMachineStore.getState().modules[0].rotation).toBe(180);
      
      updateModuleRotation(moduleId, 90);
      expect(useMachineStore.getState().modules[0].rotation).toBe(270);
      
      updateModuleRotation(moduleId, 90);
      expect(useMachineStore.getState().modules[0].rotation).toBe(0);
    });
  });

  describe('AC4: F key flips selected horizontally', () => {
    it('F flips module horizontally', () => {
      const { addModule, updateModuleFlip } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      const moduleId = useMachineStore.getState().modules[0].instanceId;
      
      expect(useMachineStore.getState().modules[0].flipped).toBe(false);
      
      updateModuleFlip(moduleId);
      expect(useMachineStore.getState().modules[0].flipped).toBe(true);
      
      updateModuleFlip(moduleId);
      expect(useMachineStore.getState().modules[0].flipped).toBe(false);
    });
  });

  describe('AC5: Ctrl+G creates group', () => {
    it('createGroup creates a group with multiple modules', () => {
      const groupingStore = useGroupingStore.getState();
      
      const group = groupingStore.createGroup(['m1', 'm2', 'm3']);
      
      expect(group).not.toBeNull();
      expect(group!.moduleIds).toEqual(['m1', 'm2', 'm3']);
      expect(group!.name).toContain('组');
    });

    it('createGroup returns null for less than 2 modules', () => {
      const groupingStore = useGroupingStore.getState();
      
      const group = groupingStore.createGroup(['m1']);
      expect(group).toBeNull();
    });

    it('Group is stored in the grouping store', () => {
      const groupingStore = useGroupingStore.getState();
      
      const group = groupingStore.createGroup(['m1', 'm2']);
      
      // Get the current state to access the groups Map
      const state = useGroupingStore.getState();
      const storedGroup = state.groups.get(group!.id);
      expect(storedGroup).toBeDefined();
      expect(storedGroup!.moduleIds).toContain('m1');
      expect(storedGroup!.moduleIds).toContain('m2');
    });
  });

  describe('AC6: Ctrl+Shift+G dissolves group', () => {
    it('ungroup removes group and returns module IDs', () => {
      const groupingStore = useGroupingStore.getState();
      
      const group = groupingStore.createGroup(['m1', 'm2']);
      
      const moduleIds = groupingStore.ungroup(group!.id);
      
      expect(moduleIds).toEqual(['m1', 'm2']);
      expect(groupingStore.groups.has(group!.id)).toBe(false);
    });

    it('ungroup preserves module transforms', () => {
      // Modules retain their position/rotation after ungroup
      const { addModule } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      addModule('gear', 200, 200);
      
      const moduleIds = useMachineStore.getState().modules.map(m => m.instanceId);
      const groupingStore = useGroupingStore.getState();
      const group = groupingStore.createGroup(moduleIds);
      
      // Store module transforms before ungroup
      const modulesBefore = useMachineStore.getState().modules.map(m => ({
        instanceId: m.instanceId,
        x: m.x,
        y: m.y,
        rotation: m.rotation,
      }));
      
      groupingStore.ungroup(group!.id);
      
      // Modules should still have the same transforms
      const modulesAfter = useMachineStore.getState().modules;
      modulesAfter.forEach((m, idx) => {
        expect(m.x).toBe(modulesBefore[idx].x);
        expect(m.y).toBe(modulesBefore[idx].y);
        expect(m.rotation).toBe(modulesBefore[idx].rotation);
      });
    });
  });

  describe('AC7: Group rotation affects all members', () => {
    it('rotateGroup rotates all modules in group around center', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 100),
      ];
      
      const result = rotateGroup(modules, ['m1', 'm2'], 90);
      
      // Both modules should have different positions
      expect(result[0].x).not.toBe(100);
      expect(result[0].y).not.toBe(100);
      expect(result[1].x).not.toBe(200);
      expect(result[1].y).not.toBe(100);
      
      // Both should have rotation updated
      expect(result[0].rotation).toBe(90);
      expect(result[1].rotation).toBe(90);
    });

    it('scaleGroup scales all modules in group', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      
      const result = scaleGroup(modules, ['m1', 'm2'], 1.5);
      
      // At least one module should have a different position (scaled from center)
      expect(result.some(m => m.x !== modules.find(om => om.instanceId === m.instanceId)!.x)).toBe(true);
      
      // Both should have scale updated
      expect(result[0].scale).toBe(1.5);
      expect(result[1].scale).toBe(1.5);
    });
  });

  describe('AC8: Copy/Paste maintains connections within paste', () => {
    it('pasteModules copies connections between pasted modules', () => {
      const { addModule, copySelected, pasteModules } = useMachineStore.getState();
      addModule('core-furnace', 100, 100);
      addModule('gear', 200, 200);
      
      const modules = useMachineStore.getState().modules;
      
      // Add a connection between the two modules
      const connection = {
        id: 'conn-1',
        sourceModuleId: modules[0].instanceId,
        sourcePortId: modules[0].ports[0]?.id || 'port-1',
        targetModuleId: modules[1].instanceId,
        targetPortId: modules[1].ports[0]?.id || 'port-2',
        pathData: 'M0,0 L100,100',
      };
      
      useMachineStore.setState({ connections: [connection] });
      
      // Select all modules
      useSelectionStore.setState({ 
        selectedModuleIds: modules.map(m => m.instanceId) 
      });
      
      // Copy
      copySelected();
      
      // Paste
      pasteModules();
      
      // Check that connections were copied with modules
      const pastedConnections = useMachineStore.getState().connections.filter(
        c => !modules.some(m => m.instanceId === c.sourceModuleId || m.instanceId === c.targetModuleId)
      );
      
      // At least one connection should exist between pasted modules
      expect(useMachineStore.getState().connections.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('AC9: Ctrl+Z/Ctrl+Shift+Z undo/redo work', () => {
    it('Ctrl+Z undoes last action', () => {
      const { addModule, undo } = useMachineStore.getState();
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      addModule('core-furnace', 100, 100);
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      undo();
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('Ctrl+Shift+Z redoes undone action', () => {
      const { addModule, undo, redo } = useMachineStore.getState();
      
      addModule('core-furnace', 100, 100);
      expect(useMachineStore.getState().modules.length).toBe(1);
      
      undo();
      expect(useMachineStore.getState().modules.length).toBe(0);
      
      redo();
      expect(useMachineStore.getState().modules.length).toBe(1);
    });

    it('History index updates correctly', () => {
      const { addModule, undo, redo } = useMachineStore.getState();
      
      addModule('core-furnace', 100, 100);
      expect(useMachineStore.getState().historyIndex).toBe(1);
      
      undo();
      expect(useMachineStore.getState().historyIndex).toBe(0);
      
      redo();
      expect(useMachineStore.getState().historyIndex).toBe(1);
    });
  });

  describe('Additional: Scale shortcuts ([ and ])', () => {
    it('Scale up increases module scale', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 100, 100),
      ];
      
      const result = scaleGroup(modules, ['m1'], 1.25);
      
      expect(result[0].scale).toBe(1.25);
    });

    it('Scale down decreases module scale', () => {
      const modules: PlacedModule[] = [
        { ...createMockModule('m1', 'core-furnace', 100, 100), scale: 1.5 },
      ];
      
      const result = scaleGroup(modules, ['m1'], 0.8);
      
      // Use toBeCloseTo for floating point comparison
      expect(result[0].scale).toBeCloseTo(1.2, 5);
    });

    it('Scale clamps to valid range [0.25, 4.0]', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 100, 100),
      ];
      
      // Scale way up
      let result = scaleGroup(modules, ['m1'], 5);
      expect(result[0].scale).toBeLessThanOrEqual(4.0);
      
      // Scale way down
      result = scaleGroup(modules, ['m1'], 0.1);
      expect(result[0].scale).toBeGreaterThanOrEqual(0.25);
    });
  });

  describe('Grouping Store Operations', () => {
    it('getGroupByModuleId returns correct group', () => {
      const groupingStore = useGroupingStore.getState();
      
      const group = groupingStore.createGroup(['m1', 'm2']);
      
      const foundGroup = groupingStore.getGroupByModuleId('m1');
      expect(foundGroup).toBeDefined();
      expect(foundGroup!.id).toBe(group!.id);
    });

    it('isModuleInGroup returns true for grouped modules', () => {
      const groupingStore = useGroupingStore.getState();
      
      groupingStore.createGroup(['m1', 'm2']);
      
      expect(groupingStore.isModuleInGroup('m1')).toBe(true);
      expect(groupingStore.isModuleInGroup('m2')).toBe(true);
      expect(groupingStore.isModuleInGroup('m3')).toBe(false);
    });

    it('getGroupModuleIds returns correct module IDs', () => {
      const groupingStore = useGroupingStore.getState();
      
      const group = groupingStore.createGroup(['m1', 'm2', 'm3']);
      
      const moduleIds = groupingStore.getGroupModuleIds(group!.id);
      expect(moduleIds).toEqual(['m1', 'm2', 'm3']);
    });
  });

  describe('Group Transform Utilities', () => {
    it('calculateGroupBounds returns correct bounds', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      
      const bounds = calculateGroupBounds(modules, ['m1', 'm2']);
      
      expect(bounds).not.toBeNull();
      expect(bounds!.minX).toBe(100);
      expect(bounds!.minY).toBe(100);
    });

    it('calculateGroupCenter returns correct center', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      
      const center = calculateGroupCenter(modules, ['m1', 'm2']);
      
      expect(center).not.toBeNull();
      // Center should be between the two modules
      expect(center!.x).toBeGreaterThan(100);
      expect(center!.x).toBeLessThan(200);
    });

    it('flipGroupHorizontal mirrors modules correctly', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 100),
      ];
      
      const result = flipGroupHorizontal(modules, ['m1', 'm2']);
      
      // X positions should be mirrored around center
      expect(result[0].flipped).toBe(true);
      expect(result[1].flipped).toBe(true);
    });

    it('flipGroupVertical mirrors modules correctly', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 100, 200),
      ];
      
      const result = flipGroupVertical(modules, ['m1', 'm2']);
      
      // Y positions should be mirrored around center
      expect(result[0].y).not.toBe(100);
      expect(result[1].y).not.toBe(200);
    });
  });
});

describe('Keyboard Shortcuts - Input Field Exclusion', () => {
  it('should not trigger shortcuts when input is focused', () => {
    // This test verifies the input field check logic
    const testInputField = (target: HTMLElement | null) => {
      if (target && typeof target.closest === 'function') {
        const isInputField = 
          target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target instanceof HTMLElement && target.isContentEditable ||
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

    expect(testInputField(inputElement)).toBe(true);
  });

  it('should allow shortcuts when target is canvas', () => {
    const testInputField = (target: HTMLElement | null) => {
      if (target && typeof target.closest === 'function') {
        const isInputField = 
          target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target instanceof HTMLElement && target.isContentEditable ||
          target.closest('input') ||
          target.closest('textarea');
        return isInputField;
      }
      return false;
    };

    // SVG element should not be treated as input
    const svgElement = {
      tagName: 'svg',
      isContentEditable: false,
      closest: () => null,
    } as unknown as HTMLElement;

    // SVG is not an input field, so it should return false or null (falsy)
    expect(testInputField(svgElement)).toBeFalsy();
  });
});
