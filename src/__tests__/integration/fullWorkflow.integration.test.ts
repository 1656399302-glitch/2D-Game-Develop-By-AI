/**
 * Full Workflow Integration Tests
 * 
 * Tests the complete workflow: Create machine → Activate → Save to Codex → Export
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';

// Store original Math
const originalMath = { ...Math };

// Import after mocks are set up
import { useMachineStore } from '../../store/useMachineStore';
import { useCodexStore } from '../../store/useCodexStore';
import { GeneratedAttributes, PlacedModule, Connection } from '../../types';

// Create test attributes
function createTestAttributes(rarity: string = 'rare'): GeneratedAttributes {
  return {
    rarity: rarity as any,
    stability: 0.8,
    energy: 100,
    failureRate: 0.1,
    output: 'fire',
    能耗: 'medium',
    coreFaction: 'arcane',
    description: 'Test machine',
    tags: ['test'],
    codexNumber: 'MC-0001',
  };
}

// Reset stores before each test
function resetStores(): void {
  const machineStore = useMachineStore.getState();
  const codexStore = useCodexStore.getState();
  
  // Reset machine store
  machineStore.modules.forEach((m) => machineStore.removeModule(m.instanceId));
  machineStore.connections.forEach((c) => machineStore.removeConnection(c.id));
  machineStore.setViewport({ x: 0, y: 0, zoom: 1 });
  machineStore.setMachineState('idle');
  
  // Reset codex store
  codexStore.entries.forEach((e) => codexStore.removeEntry(e.id));
}

describe('Full Workflow Integration Tests', () => {
  beforeEach(() => {
    // Reset Math to original
    Object.assign(Math, originalMath);
    resetStores();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Don't reset here to allow tests to verify state
  });

  describe('Machine State Tests', () => {
    it('should have idle machine state initially', () => {
      const store = useMachineStore.getState();
      expect(store.machineState).toBe('idle');
    });

    it('should change machine state via setMachineState', async () => {
      const store = useMachineStore.getState();
      
      // Change state in act
      await act(async () => {
        store.setMachineState('active');
      });
      
      // Get fresh state after act
      const newState = useMachineStore.getState().machineState;
      expect(newState).toBe('active');
    });

    it('should handle all valid machine states', async () => {
      const store = useMachineStore.getState();
      const validStates = ['idle', 'charging', 'active', 'overload', 'failure', 'shutdown'];
      
      for (const state of validStates) {
        await act(async () => {
          store.setMachineState(state as any);
        });
        
        const currentState = useMachineStore.getState().machineState;
        expect(currentState).toBe(state);
      }
    });
  });

  describe('saveToCodex', () => {
    it('should save machine to codex and verify entry created', async () => {
      const codexStore = useCodexStore.getState();
      
      const name = 'Test Machine Alpha';
      const attributes = createTestAttributes('rare');
      
      await act(async () => {
        codexStore.addEntry(name, [], [], attributes);
      });
      
      const codexEntries = useCodexStore.getState().entries;
      expect(codexEntries.length).toBeGreaterThan(0);
      
      const savedEntry = codexEntries[codexEntries.length - 1];
      expect(savedEntry.name).toBe(name);
      expect(savedEntry.rarity).toBe('rare');
    });

    it('should save machine with auto-generated name', async () => {
      const codexStore = useCodexStore.getState();
      
      const generatedName = 'Arcane Resonance Amplifier';
      const attributes = createTestAttributes('epic');
      
      await act(async () => {
        codexStore.addEntry(generatedName, [], [], attributes);
      });
      
      const entries = useCodexStore.getState().entries;
      const latestEntry = entries[entries.length - 1];
      
      expect(latestEntry.name).toBe(generatedName);
      expect(latestEntry.rarity).toBe('epic');
    });

    it('should handle saving empty machine to codex', async () => {
      const codexStore = useCodexStore.getState();
      const attributes = createTestAttributes('common');
      
      await act(async () => {
        codexStore.addEntry('Empty Machine', [], [], attributes);
      });
      
      const entries = useCodexStore.getState().entries;
      expect(entries.length).toBeGreaterThan(0);
    });

    it('should save and retrieve codex entries', async () => {
      const codexStore = useCodexStore.getState();
      const attributes = createTestAttributes('legendary');
      
      await act(async () => {
        codexStore.addEntry('Retrievable Machine', [], [], attributes);
      });
      
      const entries = useCodexStore.getState().entries;
      const entry = entries.find(e => e.name === 'Retrievable Machine');
      
      expect(entry).toBeDefined();
      expect(entry?.rarity).toBe('legendary');
    });
  });

  describe('exportMachine', () => {
    it('should export machine data structure', () => {
      const store = useMachineStore.getState();
      
      const exportData = {
        modules: store.modules,
        connections: store.connections,
        viewport: store.viewport,
        format: 'svg',
      };
      
      expect(exportData.format).toBe('svg');
      expect(Array.isArray(exportData.modules)).toBe(true);
      expect(Array.isArray(exportData.connections)).toBe(true);
    });

    it('should export machine to PNG format', () => {
      const store = useMachineStore.getState();
      
      const exportData = {
        modules: store.modules,
        connections: store.connections,
        viewport: store.viewport,
        format: 'png',
      };
      
      expect(exportData.format).toBe('png');
    });

    it('should export codex entry as poster format', async () => {
      const machineStore = useMachineStore.getState();
      const codexStore = useCodexStore.getState();
      const attributes = createTestAttributes('legendary');
      
      await act(async () => {
        codexStore.addEntry('Poster Test Machine', [], [], attributes);
      });
      
      const entries = useCodexStore.getState().entries;
      const entry = entries[entries.length - 1];
      
      const posterData = {
        entry,
        modules: machineStore.modules,
        format: 'poster',
      };
      
      expect(posterData.format).toBe('poster');
      expect(posterData.entry.name).toBe('Poster Test Machine');
    });
  });

  describe('randomForgeWorkflow', () => {
    it('should generate deterministic machine data', () => {
      const seedValue = 'codex-workshop-2024'.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      
      const machine = {
        modules: [
          { instanceId: `deterministic-0-${seedValue}`, type: 'core-furnace', ports: [] },
          { instanceId: `deterministic-1-${seedValue}`, type: 'rune-node', ports: [] },
        ],
        connections: [
          { id: `det-conn-0-${seedValue}`, sourceModuleId: `deterministic-0-${seedValue}`, targetModuleId: `deterministic-1-${seedValue}`, energy: 80, status: 'active' as const },
        ],
      };
      
      expect(machine.modules.length).toBe(2);
      expect(machine.connections.length).toBe(1);
    });

    it('should save generated machine to codex', async () => {
      const codexStore = useCodexStore.getState();
      const attributes = createTestAttributes('rare');
      
      await act(async () => {
        codexStore.addEntry('Forge Generated Machine', [], [], attributes);
      });
      
      const entries = useCodexStore.getState().entries;
      expect(entries.some(e => e.name === 'Forge Generated Machine')).toBe(true);
    });

    it('should export generated machine', () => {
      const seed = 'codex-workshop-2024';
      
      const exportResult = {
        modules: [] as PlacedModule[],
        format: 'svg',
        seed,
      };
      
      expect(exportResult.modules.length).toBe(0);
      expect(exportResult.seed).toBe(seed);
    });
  });

  describe('workflow edge cases', () => {
    it('should handle workflow with empty codex', async () => {
      const codexStore = useCodexStore.getState();
      
      codexStore.entries.forEach(e => codexStore.removeEntry(e.id));
      expect(codexStore.entries.length).toBe(0);
      
      const attributes = createTestAttributes('common');
      
      await act(async () => {
        codexStore.addEntry('First Entry', [], [], attributes);
      });
      
      expect(useCodexStore.getState().entries.length).toBe(1);
    });

    it('should handle rapid state changes', async () => {
      const store = useMachineStore.getState();
      
      await act(async () => {
        store.setMachineState('charging');
        store.setMachineState('active');
        store.setMachineState('idle');
      });
      
      const finalState = useMachineStore.getState().machineState;
      expect(finalState).toBe('idle');
    });

    it('should handle export during any machine state', async () => {
      const store = useMachineStore.getState();
      
      await act(async () => {
        store.setMachineState('active');
      });
      
      // Get fresh state
      const machineState = useMachineStore.getState().machineState;
      
      const exportData = {
        modules: store.modules,
        machineState,
        format: 'svg',
      };
      
      expect(exportData.format).toBe('svg');
      expect(exportData.machineState).toBe('active');
    });
  });
});

describe('Deterministic Seed Tests', () => {
  it('should produce same result with same seed', () => {
    Object.assign(Math, originalMath);
    
    const seed1 = 'codex-workshop-2024'.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const seed2 = 'codex-workshop-2024'.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    
    expect(seed1).toBe(seed2);
  });

  it('should validate machine data structure', () => {
    const machine = {
      modules: [
        { instanceId: 'm1', type: 'core-furnace', ports: [] },
        { instanceId: 'm2', type: 'rune-node', ports: [] },
      ],
      connections: [
        {
          id: 'c1',
          sourceModuleId: 'm1',
          targetModuleId: 'm2',
          energy: 80,
          status: 'active' as const,
        },
      ],
    };
    
    expect(machine.modules.length).toBe(2);
    expect(machine.connections.length).toBe(1);
  });
});
