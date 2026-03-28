import { describe, it, expect, beforeEach } from 'vitest';
import { useMachineStore } from '../store/useMachineStore';
import { generateRandomMachine } from '../utils/randomGenerator';
import { generateAttributes } from '../utils/attributeGenerator';

// Helper to reset store to initial state (including new random forge state)
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
    gridEnabled: true,
    connectionError: null,
    generatedAttributes: null,
    randomForgeToastVisible: false,
    randomForgeToastMessage: '',
  });
};

beforeEach(() => {
  resetStore();
});

describe('Random Forge Feature', () => {
  describe('generateRandomMachine', () => {
    it('should generate between 2-6 modules', () => {
      const result = generateRandomMachine();
      expect(result.modules.length).toBeGreaterThanOrEqual(2);
      expect(result.modules.length).toBeLessThanOrEqual(6);
    });

    it('should create at least one connection when there are 2+ modules', () => {
      const result = generateRandomMachine();
      if (result.modules.length >= 2) {
        expect(result.connections.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should generate modules with valid properties', () => {
      const { modules } = generateRandomMachine();
      
      modules.forEach((module) => {
        expect(module).toHaveProperty('id');
        expect(module).toHaveProperty('instanceId');
        expect(module).toHaveProperty('type');
        expect(module).toHaveProperty('x');
        expect(module).toHaveProperty('y');
        expect(module).toHaveProperty('rotation');
        expect(module).toHaveProperty('scale');
        expect(module).toHaveProperty('flipped');
        expect(module).toHaveProperty('ports');
        
        expect(typeof module.x).toBe('number');
        expect(typeof module.y).toBe('number');
        expect(Array.isArray(module.ports)).toBe(true);
      });
    });

    it('should generate modules with valid positions', () => {
      const { modules } = generateRandomMachine();
      
      const CANVAS_WIDTH = 800;
      const CANVAS_HEIGHT = 600;
      const PADDING = 100;
      
      modules.forEach((module) => {
        expect(module.x).toBeGreaterThanOrEqual(PADDING);
        expect(module.x).toBeLessThanOrEqual(CANVAS_WIDTH - PADDING);
        expect(module.y).toBeGreaterThanOrEqual(PADDING);
        expect(module.y).toBeLessThanOrEqual(CANVAS_HEIGHT - PADDING);
      });
    });
  });

  describe('generateAttributes', () => {
    it('should generate non-empty attributes for valid modules', () => {
      const { modules, connections } = generateRandomMachine();
      const attributes = generateAttributes(modules, connections);
      
      expect(attributes).toHaveProperty('name');
      expect(attributes).toHaveProperty('rarity');
      expect(attributes).toHaveProperty('stats');
      expect(attributes).toHaveProperty('tags');
      expect(attributes).toHaveProperty('description');
      expect(attributes).toHaveProperty('codexId');
      
      expect(typeof attributes.name).toBe('string');
      expect(attributes.name.length).toBeGreaterThan(0);
      
      expect(['common', 'uncommon', 'rare', 'epic', 'legendary']).toContain(attributes.rarity);
      
      expect(attributes.stats).toHaveProperty('stability');
      expect(attributes.stats).toHaveProperty('powerOutput');
      expect(attributes.stats).toHaveProperty('energyCost');
      expect(attributes.stats).toHaveProperty('failureRate');
      
      expect(Array.isArray(attributes.tags)).toBe(true);
      expect(attributes.tags.length).toBeGreaterThan(0);
    });

    it('should generate unique codex IDs', () => {
      const { modules, connections } = generateRandomMachine();
      
      const codexIds = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const attributes = generateAttributes(modules, connections);
        codexIds.add(attributes.codexId);
      }
      
      // All codex IDs should be unique
      expect(codexIds.size).toBe(10);
    });
  });

  describe('useMachineStore - Random Forge State', () => {
    it('should have no generated attributes initially', () => {
      const store = useMachineStore.getState();
      expect(store.generatedAttributes).toBeNull();
    });

    it('should have randomForgeToastVisible as false initially', () => {
      const store = useMachineStore.getState();
      expect(store.randomForgeToastVisible).toBe(false);
    });

    it('should have empty message initially', () => {
      const store = useMachineStore.getState();
      expect(store.randomForgeToastMessage).toBe('');
    });

    it('should show random forge toast with message', () => {
      const store = useMachineStore.getState();
      
      store.showRandomForgeToast('✨ Test Machine Forged!');
      
      const state = useMachineStore.getState();
      expect(state.randomForgeToastVisible).toBe(true);
      expect(state.randomForgeToastMessage).toBe('✨ Test Machine Forged!');
    });

    it('should hide random forge toast', () => {
      const store = useMachineStore.getState();
      
      store.showRandomForgeToast('✨ Test Machine Forged!');
      
      let state = useMachineStore.getState();
      expect(state.randomForgeToastVisible).toBe(true);
      
      store.hideRandomForgeToast();
      
      state = useMachineStore.getState();
      expect(state.randomForgeToastVisible).toBe(false);
    });

    it('should set generated attributes', () => {
      const store = useMachineStore.getState();
      
      const mockAttributes = {
        name: 'Test Machine',
        rarity: 'rare' as const,
        stats: { stability: 50, powerOutput: 75, energyCost: 25, failureRate: 20 },
        tags: ['arcane', 'amplifying'] as const,
        description: 'A test machine',
        codexId: 'MC-TEST',
      };
      
      store.setGeneratedAttributes(mockAttributes);
      
      const state = useMachineStore.getState();
      expect(state.generatedAttributes).toEqual(mockAttributes);
    });

    it('should clear generated attributes when adding a module', () => {
      const store = useMachineStore.getState();
      
      // Set generated attributes
      store.setGeneratedAttributes({
        name: 'Random Machine',
        rarity: 'epic' as const,
        stats: { stability: 50, powerOutput: 75, energyCost: 25, failureRate: 20 },
        tags: ['arcane'] as const,
        description: 'A random machine',
        codexId: 'MC-RAND',
      });
      
      let state = useMachineStore.getState();
      expect(state.generatedAttributes).not.toBeNull();
      
      // Add a module manually
      store.addModule('core-furnace', 400, 300);
      
      // Generated attributes should be cleared
      state = useMachineStore.getState();
      expect(state.generatedAttributes).toBeNull();
    });

    it('should clear canvas and generated attributes', () => {
      const store = useMachineStore.getState();
      
      // Add a module and set generated attributes
      store.addModule('core-furnace', 400, 300);
      store.setGeneratedAttributes({
        name: 'Test Machine',
        rarity: 'common' as const,
        stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 50 },
        tags: ['stable'] as const,
        description: 'Test',
        codexId: 'MC-TEST',
      });
      
      let state = useMachineStore.getState();
      expect(state.modules.length).toBe(1);
      expect(state.generatedAttributes).not.toBeNull();
      
      // Clear canvas
      store.clearCanvas();
      
      state = useMachineStore.getState();
      expect(state.modules.length).toBe(0);
      expect(state.generatedAttributes).toBeNull();
    });

    it('should load machine with empty generated attributes', () => {
      const store = useMachineStore.getState();
      
      // Set some generated attributes first
      store.setGeneratedAttributes({
        name: 'Old Machine',
        rarity: 'legendary' as const,
        stats: { stability: 80, powerOutput: 90, energyCost: 10, failureRate: 10 },
        tags: ['stable', 'resonance'] as const,
        description: 'An old machine',
        codexId: 'MC-OLD',
      });
      
      let state = useMachineStore.getState();
      expect(state.generatedAttributes).not.toBeNull();
      
      // Load a machine from codex
      const loadedModules = [{
        id: 'loaded-1',
        instanceId: 'loaded-inst-1',
        type: 'gear' as const,
        x: 200,
        y: 200,
        rotation: 0,
        scale: 1,
        ports: [],
      }];
      
      store.loadMachine(loadedModules, []);
      
      // Generated attributes should be cleared when loading
      state = useMachineStore.getState();
      expect(state.generatedAttributes).toBeNull();
      expect(state.modules.length).toBe(1);
    });
  });

  describe('Integration - Random Forge Flow', () => {
    it('should generate machine with proper structure', () => {
      // This simulates what the handleRandomForge function does
      const { modules, connections } = generateRandomMachine();
      const attributes = generateAttributes(modules, connections);
      
      // Verify structure
      expect(modules.length).toBeGreaterThanOrEqual(2);
      expect(modules.length).toBeLessThanOrEqual(6);
      
      if (modules.length >= 2) {
        expect(connections.length).toBeGreaterThanOrEqual(1);
      }
      
      expect(attributes.name).toBeTruthy();
      expect(attributes.rarity).toBeTruthy();
      expect(attributes.stats).toBeTruthy();
      expect(attributes.tags.length).toBeGreaterThan(0);
    });

    it('should be able to simulate full random forge workflow', () => {
      const store = useMachineStore.getState();
      
      // Step 1: Generate random machine
      const { modules, connections } = generateRandomMachine();
      const attributes = generateAttributes(modules, connections);
      const moduleCount = modules.length;
      
      // Step 2: Load into store
      store.loadMachine(modules, connections);
      
      // Step 3: Set generated attributes
      store.setGeneratedAttributes(attributes);
      
      // Step 4: Show toast
      store.showRandomForgeToast(`✨ ${attributes.name} Forged!`);
      
      const state = useMachineStore.getState();
      
      // Verify all steps worked
      expect(state.modules.length).toBe(moduleCount);
      expect(state.generatedAttributes).not.toBeNull();
      expect(state.generatedAttributes?.name).toBe(attributes.name);
      expect(state.randomForgeToastVisible).toBe(true);
      expect(state.randomForgeToastMessage).toContain('Forged');
      
      // Step 5: Verify toast message content
      expect(state.randomForgeToastMessage).toBe(`✨ ${attributes.name} Forged!`);
    });

    it('should save to codex after random forge', () => {
      const store = useMachineStore.getState();
      
      // Generate and load
      const { modules, connections } = generateRandomMachine();
      const attributes = generateAttributes(modules, connections);
      
      store.loadMachine(modules, connections);
      store.setGeneratedAttributes(attributes);
      
      const state = useMachineStore.getState();
      
      // Machine should be ready for codex
      expect(state.modules.length).toBe(modules.length);
      expect(state.generatedAttributes).not.toBeNull();
      expect(state.generatedAttributes?.name).toBe(attributes.name);
    });

    it('should be able to export after random forge', () => {
      const store = useMachineStore.getState();
      
      // Generate and load
      const { modules, connections } = generateRandomMachine();
      const attributes = generateAttributes(modules, connections);
      
      store.loadMachine(modules, connections);
      store.setGeneratedAttributes(attributes);
      
      const state = useMachineStore.getState();
      
      // Machine should have modules for export
      expect(state.modules.length).toBeGreaterThan(0);
      
      // Verify connection data exists for rendering
      if (connections.length > 0) {
        expect(connections[0].pathData).toBeTruthy();
      }
    });

    it('should support manual editing after random forge', () => {
      const store = useMachineStore.getState();
      
      // Generate and load
      const { modules, connections } = generateRandomMachine();
      store.loadMachine(modules, connections);
      
      let state = useMachineStore.getState();
      const initialCount = state.modules.length;
      
      // Add a manual module
      store.addModule('core-furnace', 300, 300);
      
      state = useMachineStore.getState();
      expect(state.modules.length).toBe(initialCount + 1);
      
      // Generated attributes should be cleared when manually editing
      expect(state.generatedAttributes).toBeNull();
    });

    it('should clear generated attributes when duplicating a module after random forge', () => {
      const store = useMachineStore.getState();
      
      // Generate and load
      const { modules, connections } = generateRandomMachine();
      store.loadMachine(modules, connections);
      store.setGeneratedAttributes({
        name: 'Random Machine',
        rarity: 'rare' as const,
        stats: { stability: 50, powerOutput: 75, energyCost: 25, failureRate: 20 },
        tags: ['arcane'] as const,
        description: 'A random machine',
        codexId: 'MC-RAND',
      });
      
      let state = useMachineStore.getState();
      expect(state.generatedAttributes).not.toBeNull();
      
      // Select a module and duplicate
      const moduleId = state.modules[0].instanceId;
      store.selectModule(moduleId);
      store.duplicateModule(moduleId);
      
      state = useMachineStore.getState();
      expect(state.modules.length).toBe(modules.length + 1);
      
      // Generated attributes should be cleared when manually editing
      expect(state.generatedAttributes).toBeNull();
    });
  });
});
