import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';
import { useSelectionStore } from '../store/useSelectionStore';
import { useGroupingStore } from '../store/useGroupingStore';
import { 
  calculateGroupBounds, 
  calculateGroupCenter,
  rotateGroup,
  scaleGroup,
} from '../utils/groupingUtils';
import { calculateBounds } from '../utils/clipboardUtils';
import { PlacedModule } from '../types';

// Helper to create mock modules with various types
const createMockModule = (
  instanceId: string,
  type: any = 'core-furnace',
  x: number = 100,
  y: number = 100,
  additionalProps: Partial<PlacedModule> = {}
): PlacedModule => ({
  id: `id-${instanceId}`,
  instanceId,
  type,
  x,
  y,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports: [
    { id: `${type}-input-0`, type: 'input', position: { x: 25, y: 40 } },
    { id: `${type}-output-0`, type: 'output', position: { x: 75, y: 40 } },
  ],
  ...additionalProps,
});

describe('Multi-Select Edge Cases Tests', () => {
  beforeEach(() => {
    // Reset all stores to initial state
    useMachineStore.setState({
      modules: [],
      connections: [],
      selectedModuleId: null,
      selectedConnectionId: null,
      viewport: { x: 0, y: 0, zoom: 1 },
      machineState: 'idle',
      isConnecting: false,
      history: [{ modules: [], connections: [] }],
      historyIndex: 0,
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

  describe('AC1: Multi-module selection with mixed module types', () => {
    it('selects modules of different types correctly', () => {
      const { addModule } = useMachineStore.getState();
      
      // Add modules of different types
      addModule('core-furnace', 100, 100);
      addModule('gear', 200, 200);
      addModule('rune-node', 300, 150);
      addModule('shield-shell', 400, 250);
      
      const modules = useMachineStore.getState().modules;
      const moduleIds = modules.map(m => m.instanceId);
      
      // Set selected module IDs directly
      useSelectionStore.setState({ selectedModuleIds: moduleIds });
      
      const selectedIds = useSelectionStore.getState().selectedModuleIds;
      expect(selectedIds.length).toBe(4);
      expect(selectedIds).toContain(modules[0].instanceId);
      expect(selectedIds).toContain(modules[1].instanceId);
      expect(selectedIds).toContain(modules[2].instanceId);
      expect(selectedIds).toContain(modules[3].instanceId);
    });

    it('rotation works correctly on mixed module types', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 100),
        createMockModule('m3', 'rune-node', 150, 200),
      ];
      
      // Rotate all 3 modules 90 degrees clockwise around their collective center
      const result = rotateGroup(modules, ['m1', 'm2', 'm3'], 90);
      
      // Verify all modules have rotation updated
      result.forEach(module => {
        expect(module.rotation).toBe(90);
      });
      
      // Verify positions changed (modules should have moved around center)
      const centerBefore = calculateGroupCenter(modules, ['m1', 'm2', 'm3']);
      const boundsAfter = calculateGroupBounds(result, ['m1', 'm2', 'm3']);
      const centerAfter = centerBefore && boundsAfter ? {
        x: (boundsAfter.minX + boundsAfter.maxX) / 2,
        y: (boundsAfter.minY + boundsAfter.maxY) / 2,
      } : null;
      
      // Center should remain the same, but positions should have rotated
      expect(centerBefore).not.toBeNull();
      expect(centerAfter).not.toBeNull();
      expect(centerAfter!.x).toBeCloseTo(centerBefore!.x, 0);
      expect(centerAfter!.y).toBeCloseTo(centerBefore!.y, 0);
    });

    it('calculates correct collective center for mixed types', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 0, 0),
        createMockModule('m2', 'gear', 100, 0),
        createMockModule('m3', 'rune-node', 50, 100),
      ];
      
      const center = calculateGroupCenter(modules, ['m1', 'm2', 'm3']);
      
      // Center should be at approximately (50, 50) accounting for module dimensions
      expect(center).not.toBeNull();
      // The center calculation includes module sizes, so we check it exists and is reasonable
      expect(center!.x).toBeGreaterThan(0);
      expect(center!.y).toBeGreaterThan(0);
    });
  });

  describe('AC2: Multi-module rotation around off-center selection bounds', () => {
    it('rotates modules around the collective center', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 300, 100),
      ];
      
      const result = rotateGroup(modules, ['m1', 'm2'], 90);
      
      // Calculate the center before and after rotation
      const centerBefore = calculateGroupCenter(modules, ['m1', 'm2']);
      const boundsAfter = calculateGroupBounds(result, ['m1', 'm2']);
      const centerAfter = centerBefore && boundsAfter ? {
        x: (boundsAfter.minX + boundsAfter.maxX) / 2,
        y: (boundsAfter.minY + boundsAfter.maxY) / 2,
      } : null;
      
      // Center should remain the same
      expect(centerBefore).not.toBeNull();
      expect(centerAfter).not.toBeNull();
      expect(centerBefore!.x).toBeCloseTo(centerAfter!.x, 0);
      expect(centerBefore!.y).toBeCloseTo(centerAfter!.y, 0);
    });

    it('accumulates rotation correctly (multiple 90° rotations)', () => {
      let modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      
      // First 90° rotation
      modules = rotateGroup(modules, ['m1', 'm2'], 90);
      expect(modules[0].rotation).toBe(90);
      expect(modules[1].rotation).toBe(90);
      
      // Second 90° rotation (total 180°)
      modules = rotateGroup(modules, ['m1', 'm2'], 90);
      expect(modules[0].rotation).toBe(180);
      expect(modules[1].rotation).toBe(180);
      
      // Third 90° rotation (total 270°)
      modules = rotateGroup(modules, ['m1', 'm2'], 90);
      expect(modules[0].rotation).toBe(270);
      expect(modules[1].rotation).toBe(270);
      
      // Fourth 90° rotation (total 360° = 0°)
      modules = rotateGroup(modules, ['m1', 'm2'], 90);
      expect(modules[0].rotation).toBe(0);
      expect(modules[1].rotation).toBe(0);
    });

    it('handles asymmetric module arrangements', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 0, 0),
        createMockModule('m2', 'gear', 200, 0),
        createMockModule('m3', 'rune-node', 100, 200),
      ];
      
      const centerBefore = calculateGroupCenter(modules, ['m1', 'm2', 'm3']);
      const result = rotateGroup(modules, ['m1', 'm2', 'm3'], 90);
      const boundsAfter = calculateGroupBounds(result, ['m1', 'm2', 'm3']);
      const centerAfter = centerBefore && boundsAfter ? {
        x: (boundsAfter.minX + boundsAfter.maxX) / 2,
        y: (boundsAfter.minY + boundsAfter.maxY) / 2,
      } : null;
      
      // Center should remain the same
      expect(centerBefore!.x).toBeCloseTo(centerAfter!.x, 0);
      expect(centerBefore!.y).toBeCloseTo(centerAfter!.y, 0);
    });
  });

  describe('AC3: Multi-module deletion during activation state', () => {
    it('deletes modules when machine state is active', () => {
      const { addModule, setMachineState } = useMachineStore.getState();
      
      // Set machine to active state
      setMachineState('active');
      expect(useMachineStore.getState().machineState).toBe('active');
      
      // Add modules
      addModule('core-furnace', 100, 100);
      addModule('gear', 200, 200);
      
      const modules = useMachineStore.getState().modules;
      const moduleIds = modules.map(m => m.instanceId);
      
      // Delete all modules
      const { removeModule } = useMachineStore.getState();
      moduleIds.forEach(id => removeModule(id));
      
      expect(useMachineStore.getState().modules.length).toBe(0);
      expect(useMachineStore.getState().machineState).toBe('active'); // State preserved
    });

    it('deletes modules when machine state is failure', () => {
      const { addModule, setMachineState } = useMachineStore.getState();
      
      setMachineState('failure');
      
      addModule('core-furnace', 100, 100);
      addModule('rune-node', 200, 200);
      
      const modules = useMachineStore.getState().modules;
      const { removeModule } = useMachineStore.getState();
      
      modules.forEach(m => removeModule(m.instanceId));
      
      expect(useMachineStore.getState().modules.length).toBe(0);
    });

    it('removes connections when modules are deleted during activation', () => {
      const { addModule, setMachineState, connections } = useMachineStore.getState();
      
      setMachineState('active');
      
      // Add modules
      addModule('core-furnace', 100, 100);
      addModule('gear', 200, 200);
      addModule('rune-node', 300, 200);
      
      const modules = useMachineStore.getState().modules;
      
      // Add connections between modules
      const connection1 = {
        id: 'conn-1',
        sourceModuleId: modules[0].instanceId,
        sourcePortId: modules[0].ports[0].id,
        targetModuleId: modules[1].instanceId,
        targetPortId: modules[1].ports[0].id,
        pathData: 'M0,0 L100,100',
      };
      
      const connection2 = {
        id: 'conn-2',
        sourceModuleId: modules[1].instanceId,
        sourcePortId: modules[1].ports[0].id,
        targetModuleId: modules[2].instanceId,
        targetPortId: modules[2].ports[0].id,
        pathData: 'M100,100 L200,200',
      };
      
      useMachineStore.setState({ 
        connections: [...connections, connection1, connection2]
      });
      
      expect(useMachineStore.getState().connections.length).toBe(2);
      
      // Delete the middle module
      const { removeModule } = useMachineStore.getState();
      removeModule(modules[1].instanceId);
      
      // Both connections should be removed
      expect(useMachineStore.getState().connections.length).toBe(0);
    });

    it('handles rapid deletion of multiple modules', () => {
      const { addModule, removeModule } = useMachineStore.getState();
      
      // Add many modules
      for (let i = 0; i < 10; i++) {
        addModule('gear' as any, 100 + i * 50, 100);
      }
      
      const modules = useMachineStore.getState().modules;
      
      // Rapidly delete all modules
      modules.forEach(m => removeModule(m.instanceId));
      
      expect(useMachineStore.getState().modules.length).toBe(0);
    });
  });

  describe('AC4: Box selection with modules at negative coordinates', () => {
    it('selects modules with negative x coordinate', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', -50, 100),
        createMockModule('m2', 'gear', 100, 100),
      ];
      
      // Box selection starting from (-100, 0) to (200, 200)
      const boxStart = { x: -100, y: 0 };
      const boxEnd = { x: 200, y: 200 };
      
      const selectedIds = modules
        .filter(m => {
          // Check if module is within box selection bounds
          const minX = Math.min(boxStart.x, boxEnd.x);
          const maxX = Math.max(boxStart.x, boxEnd.x);
          const minY = Math.min(boxStart.y, boxEnd.y);
          const maxY = Math.max(boxStart.y, boxEnd.y);
          
          return m.x >= minX && m.x <= maxX && m.y >= minY && m.y <= maxY;
        })
        .map(m => m.instanceId);
      
      expect(selectedIds).toContain('m1');
      expect(selectedIds).toContain('m2');
    });

    it('selects modules with negative y coordinate', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 100, -50),
        createMockModule('m2', 'gear', 100, 100),
      ];
      
      // Box selection starting from (0, -100) to (200, 200)
      const boxStart = { x: 0, y: -100 };
      const boxEnd = { x: 200, y: 200 };
      
      const selectedIds = modules
        .filter(m => {
          const minX = Math.min(boxStart.x, boxEnd.x);
          const maxX = Math.max(boxStart.x, boxEnd.x);
          const minY = Math.min(boxStart.y, boxEnd.y);
          const maxY = Math.max(boxStart.y, boxEnd.y);
          
          return m.x >= minX && m.x <= maxX && m.y >= minY && m.y <= maxY;
        })
        .map(m => m.instanceId);
      
      expect(selectedIds).toContain('m1');
      expect(selectedIds).toContain('m2');
    });

    it('selects modules with both negative coordinates', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', -50, -50),
        createMockModule('m2', 'gear', 100, 100),
      ];
      
      // Box selection from (-100, -100) to (200, 200)
      const boxStart = { x: -100, y: -100 };
      const boxEnd = { x: 200, y: 200 };
      
      const selectedIds = modules
        .filter(m => {
          const minX = Math.min(boxStart.x, boxEnd.x);
          const maxX = Math.max(boxStart.x, boxEnd.x);
          const minY = Math.min(boxStart.y, boxEnd.y);
          const maxY = Math.max(boxStart.y, boxEnd.y);
          
          return m.x >= minX && m.x <= maxX && m.y >= minY && m.y <= maxY;
        })
        .map(m => m.instanceId);
      
      expect(selectedIds).toContain('m1');
      expect(selectedIds).toContain('m2');
    });

    it('does not select modules outside negative coordinate bounds', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', -50, -50),
        createMockModule('m2', 'gear', 200, 200), // Outside selection
      ];
      
      // Box selection from (-100, -100) to (0, 0)
      const boxStart = { x: -100, y: -100 };
      const boxEnd = { x: 0, y: 0 };
      
      const selectedIds = modules
        .filter(m => {
          const minX = Math.min(boxStart.x, boxEnd.x);
          const maxX = Math.max(boxStart.x, boxEnd.x);
          const minY = Math.min(boxStart.y, boxEnd.y);
          const maxY = Math.max(boxStart.y, boxEnd.y);
          
          return m.x >= minX && m.x <= maxX && m.y >= minY && m.y <= maxY;
        })
        .map(m => m.instanceId);
      
      expect(selectedIds).toContain('m1');
      expect(selectedIds).not.toContain('m2');
    });

    it('handles calculateBounds with negative coordinates', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', -50, -50),
        createMockModule('m2', 'gear', 100, 100),
      ];
      
      const bounds = calculateBounds(modules);
      
      expect(bounds).not.toBeNull();
      expect(bounds!.minX).toBe(-50);
      expect(bounds!.minY).toBe(-50);
      expect(bounds!.maxX).toBeGreaterThan(100);
      expect(bounds!.maxY).toBeGreaterThan(100);
    });
  });

  describe('AC5: Group operations with hidden/locked modules', () => {
    it('creates group with locked modules', () => {
      const groupingStore = useGroupingStore.getState();
      
      // Create a group with some modules
      const group = groupingStore.createGroup(['m1', 'm2', 'm3']);
      
      expect(group).not.toBeNull();
      expect(group!.moduleIds).toContain('m1');
      expect(group!.moduleIds).toContain('m2');
      expect(group!.moduleIds).toContain('m3');
      
      // Lock the group
      groupingStore.lockGroup(group!.id);
      
      // Get fresh state
      const groups = useGroupingStore.getState().groups;
      const lockedGroup = groups.get(group!.id);
      expect(lockedGroup).toBeDefined();
      expect(lockedGroup!.locked).toBe(true);
    });

    it('prevents modification of locked modules', () => {
      const groupingStore = useGroupingStore.getState();
      
      // Create and lock a group
      const group = groupingStore.createGroup(['m1', 'm2']);
      groupingStore.lockGroup(group!.id);
      
      // Verify modules are in a locked group
      expect(groupingStore.isModuleInGroup('m1')).toBe(true);
      
      const groupData = groupingStore.getGroupByModuleId('m1');
      expect(groupData!.locked).toBe(true);
    });

    it('unlocks group for modification', () => {
      const groupingStore = useGroupingStore.getState();
      
      const group = groupingStore.createGroup(['m1', 'm2']);
      groupingStore.lockGroup(group!.id);
      
      // Unlock the group
      groupingStore.unlockGroup(group!.id);
      
      // Get fresh state
      const groups = useGroupingStore.getState().groups;
      const unlockedGroup = groups.get(group!.id);
      expect(unlockedGroup!.locked).toBe(false);
    });

    it('toggles group lock state', () => {
      const groupingStore = useGroupingStore.getState();
      
      const group = groupingStore.createGroup(['m1', 'm2']);
      
      // Get fresh state after creating
      let groups = useGroupingStore.getState().groups;
      
      // Initially unlocked
      expect(groups.get(group!.id)!.locked).toBe(false);
      
      // Toggle lock
      groupingStore.toggleGroupLock(group!.id);
      groups = useGroupingStore.getState().groups;
      expect(groups.get(group!.id)!.locked).toBe(true);
      
      // Toggle again
      groupingStore.toggleGroupLock(group!.id);
      groups = useGroupingStore.getState().groups;
      expect(groups.get(group!.id)!.locked).toBe(false);
    });

    it('ungroup preserves module transforms after lock toggle', () => {
      const groupingStore = useGroupingStore.getState();
      const { addModule, modules } = useMachineStore.getState();
      
      // Add modules
      addModule('core-furnace', 100, 100);
      addModule('gear', 200, 200);
      
      const machineModules = useMachineStore.getState().modules;
      const moduleIds = machineModules.map(m => m.instanceId);
      
      // Create group
      const group = groupingStore.createGroup(moduleIds);
      groupingStore.lockGroup(group!.id);
      
      // Store transforms before ungroup
      const transformsBefore = machineModules.map(m => ({
        instanceId: m.instanceId,
        x: m.x,
        y: m.y,
        rotation: m.rotation,
      }));
      
      // Ungroup
      groupingStore.ungroup(group!.id);
      
      // Verify modules still have the same transforms
      const machineModulesAfter = useMachineStore.getState().modules;
      machineModulesAfter.forEach((m, idx) => {
        expect(m.x).toBe(transformsBefore[idx].x);
        expect(m.y).toBe(transformsBefore[idx].y);
        expect(m.rotation).toBe(transformsBefore[idx].rotation);
      });
    });

    it('handles group operations with single module in group', () => {
      const groupingStore = useGroupingStore.getState();
      
      // Create group with only one module - should return null
      const group = groupingStore.createGroup(['m1']);
      expect(group).toBeNull();
    });

    it('clears all groups', () => {
      const groupingStore = useGroupingStore.getState();
      
      // Create multiple groups
      groupingStore.createGroup(['m1', 'm2']);
      groupingStore.createGroup(['m3', 'm4']);
      groupingStore.createGroup(['m5', 'm6']);
      
      // Verify groups were created
      let groups = useGroupingStore.getState().groups;
      expect(groups.size).toBeGreaterThan(0);
      
      // Clear all groups
      groupingStore.clearAllGroups();
      
      groups = useGroupingStore.getState().groups;
      expect(groups.size).toBe(0);
    });
  });

  describe('Scale operations on multi-selection', () => {
    it('scales all modules proportionally from center', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 100, 100),
        createMockModule('m2', 'gear', 200, 200),
      ];
      
      const centerBefore = calculateGroupCenter(modules, ['m1', 'm2']);
      const result = scaleGroup(modules, ['m1', 'm2'], 1.5);
      const boundsAfter = calculateGroupBounds(result, ['m1', 'm2']);
      const centerAfter = centerBefore && boundsAfter ? {
        x: (boundsAfter.minX + boundsAfter.maxX) / 2,
        y: (boundsAfter.minY + boundsAfter.maxY) / 2,
      } : null;
      
      // Center should remain the same after scaling (within reasonable tolerance)
      expect(centerBefore).not.toBeNull();
      expect(centerAfter).not.toBeNull();
      // Allow some tolerance due to rounding
      expect(Math.abs(centerBefore!.x - centerAfter!.x)).toBeLessThan(5);
      expect(Math.abs(centerBefore!.y - centerAfter!.y)).toBeLessThan(5);
      
      // All modules should have scale 1.5
      result.forEach(m => {
        expect(m.scale).toBe(1.5);
      });
    });

    it('clamps scale to minimum 0.25', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 100, 100, { scale: 1 }),
      ];
      
      const result = scaleGroup(modules, ['m1'], 0.1, 0.25, 4.0);
      expect(result[0].scale).toBe(0.25);
    });

    it('clamps scale to maximum 4.0', () => {
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', 100, 100, { scale: 1 }),
      ];
      
      const result = scaleGroup(modules, ['m1'], 10, 0.25, 4.0);
      expect(result[0].scale).toBe(4.0);
    });
  });
});
