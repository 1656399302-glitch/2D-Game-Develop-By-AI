/**
 * AC-CODEX-001: Functional Tests for Codex System
 * 
 * Verifies:
 * - AC-CODEX-001: Machine can be saved to codex and retrieved with correct data
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react-dom/test-utils';
import { useCodexStore } from '../../store/useCodexStore';
import { useMachineStore } from '../../store/useMachineStore';
import { PlacedModule, Connection, GeneratedAttributes, Rarity } from '../../types';

describe('Codex System Functional Tests', () => {
  beforeEach(() => {
    // Reset stores to clean state
    const codexState = useCodexStore.getState();
    const machineState = useMachineStore.getState();
    
    // Clear codex entries
    codexState.entries.forEach(e => codexState.removeEntry(e.id));
    
    // Clear machine canvas
    machineState.clearCanvas();
  });

  afterEach(() => {
    // Cleanup
    const codexState = useCodexStore.getState();
    const machineState = useMachineStore.getState();
    
    codexState.entries.forEach(e => codexState.removeEntry(e.id));
    machineState.clearCanvas();
  });

  describe('AC-CODEX-001: Codex Save and Retrieve', () => {
    it('should save machine to codex with basic attributes', async () => {
      const codexState = useCodexStore.getState();
      
      const name = 'Test Machine Alpha';
      const attributes: GeneratedAttributes = {
        rarity: 'rare',
        stability: 0.8,
        energy: 100,
        failureRate: 0.1,
        output: 'fire',
        能耗: 'medium',
        coreFaction: 'arcane',
        description: 'A test machine',
        tags: ['test', 'demo'],
        codexNumber: 'MC-0001',
      };
      
      await act(async () => {
        codexState.addEntry(name, [], [], attributes);
      });

      const entries = useCodexStore.getState().entries;
      expect(entries.length).toBe(1);
      
      const savedEntry = entries[0];
      expect(savedEntry.name).toBe(name);
      expect(savedEntry.rarity).toBe('rare');
      expect(savedEntry.attributes.stability).toBe(0.8);
      expect(savedEntry.attributes.coreFaction).toBe('arcane');
    });

    it('should save machine with modules and connections', async () => {
      const codexState = useCodexStore.getState();
      const machineState = useMachineStore.getState();
      
      // Create modules on canvas
      const modules: PlacedModule[] = [
        {
          id: 'mod-1',
          instanceId: 'inst-1',
          type: 'core-furnace',
          category: 'core',
          x: 100,
          y: 100,
          rotation: 0,
          scale: 1,
          ports: [
            { id: 'p1', type: 'output', position: { x: 50, y: 25 } },
            { id: 'p2', type: 'input', position: { x: 50, y: 75 } },
          ],
          properties: {},
        },
        {
          id: 'mod-2',
          instanceId: 'inst-2',
          type: 'gear',
          category: 'gear',
          x: 200,
          y: 100,
          rotation: 45,
          scale: 1,
          ports: [
            { id: 'p3', type: 'input', position: { x: 50, y: 25 } },
            { id: 'p4', type: 'output', position: { x: 50, y: 75 } },
          ],
          properties: {},
        },
      ];
      
      const connections: Connection[] = [
        {
          id: 'conn-1',
          sourceModuleId: 'inst-1',
          sourcePortId: 'p1',
          targetModuleId: 'inst-2',
          targetPortId: 'p3',
          pathData: 'M 125 125 Q 162 100 175 100',
        },
      ];
      
      const attributes: GeneratedAttributes = {
        rarity: 'epic',
        stability: 0.7,
        energy: 150,
        failureRate: 0.15,
        output: 'lightning',
        能耗: 'high',
        coreFaction: 'storm',
        description: 'Storm-infused gear mechanism',
        tags: ['storm', 'gear'],
        codexNumber: 'MC-0002',
      };
      
      await act(async () => {
        codexState.addEntry('Storm Gear Machine', modules, connections, attributes);
      });
      
      const entries = useCodexStore.getState().entries;
      expect(entries.length).toBe(1);
      
      const savedEntry = entries[0];
      expect(savedEntry.modules.length).toBe(2);
      expect(savedEntry.connections.length).toBe(1);
      expect(savedEntry.modules[0].type).toBe('core-furnace');
      expect(savedEntry.modules[1].type).toBe('gear');
      expect(savedEntry.connections[0].sourceModuleId).toBe('inst-1');
    });

    it('should generate unique codex ID for each entry', async () => {
      const codexState = useCodexStore.getState();
      
      await act(async () => {
        codexState.addEntry('Machine 1', [], [], {
          rarity: 'common',
          stability: 0.5,
          energy: 50,
          failureRate: 0.3,
          output: 'none',
          能耗: 'low',
          coreFaction: 'stellar',
          description: 'Test 1',
          tags: ['test'],
          codexNumber: 'MC-0001',
        });
      });
      
      await act(async () => {
        codexState.addEntry('Machine 2', [], [], {
          rarity: 'rare',
          stability: 0.7,
          energy: 100,
          failureRate: 0.2,
          output: 'fire',
          能耗: 'medium',
          coreFaction: 'arcane',
          description: 'Test 2',
          tags: ['test'],
          codexNumber: 'MC-0002',
        });
      });
      
      const entries = useCodexStore.getState().entries;
      expect(entries.length).toBe(2);
      
      // Each entry should have unique codexId
      expect(entries[0].codexId).toBeDefined();
      expect(entries[1].codexId).toBeDefined();
      expect(entries[0].codexId).not.toBe(entries[1].codexId);
      
      // Code IDs should follow pattern MC-XXXX
      expect(entries[0].codexId).toMatch(/^MC-\d{4}$/);
      expect(entries[1].codexId).toMatch(/^MC-\d{4}$/);
    });

    it('should retrieve entry by ID', async () => {
      const codexState = useCodexStore.getState();
      
      await act(async () => {
        codexState.addEntry('Retrievable Machine', [], [], {
          rarity: 'legendary',
          stability: 0.95,
          energy: 200,
          failureRate: 0.05,
          output: 'void',
          能耗: 'extreme',
          coreFaction: 'void',
          description: 'A legendary machine',
          tags: ['legendary', 'void'],
          codexNumber: 'MC-9999',
        });
      });
      
      const entries = useCodexStore.getState().entries;
      const savedEntry = entries[0];
      
      // Retrieve by ID
      const retrievedEntry = codexState.getEntry(savedEntry.id);
      
      expect(retrievedEntry).toBeDefined();
      expect(retrievedEntry?.name).toBe('Retrievable Machine');
      expect(retrievedEntry?.rarity).toBe('legendary');
    });

    it('should return undefined for non-existent entry', () => {
      const codexState = useCodexStore.getState();
      
      const entry = codexState.getEntry('non-existent-id');
      expect(entry).toBeUndefined();
    });

    it('should filter entries by rarity', async () => {
      const codexState = useCodexStore.getState();
      
      // Add entries with different rarities
      const rarities: Rarity[] = ['common', 'rare', 'epic', 'rare', 'legendary'];
      const names = ['C1', 'R1', 'E1', 'R2', 'L1'];
      
      for (let i = 0; i < rarities.length; i++) {
        await act(async () => {
          codexState.addEntry(names[i], [], [], {
            rarity: rarities[i],
            stability: 0.5,
            energy: 50,
            failureRate: 0.3,
            output: 'none',
            能耗: 'low',
            coreFaction: 'stellar',
            description: `Entry ${i}`,
            tags: ['test'],
            codexNumber: `MC-${String(i).padStart(4, '0')}`,
          });
        });
      }
      
      // Filter by rare
      const rareEntries = codexState.getEntriesByRarity('rare');
      expect(rareEntries.length).toBe(2);
      expect(rareEntries.every(e => e.rarity === 'rare')).toBe(true);
      
      // Filter by legendary
      const legendaryEntries = codexState.getEntriesByRarity('legendary');
      expect(legendaryEntries.length).toBe(1);
      expect(legendaryEntries[0].name).toBe('L1');
    });

    it('should count entries correctly', async () => {
      const codexState = useCodexStore.getState();
      
      let count = codexState.getEntryCount();
      expect(count).toBe(0);
      
      await act(async () => {
        codexState.addEntry('Entry 1', [], [], {
          rarity: 'common',
          stability: 0.5,
          energy: 50,
          failureRate: 0.3,
          output: 'none',
          能耗: 'low',
          coreFaction: 'stellar',
          description: 'Test 1',
          tags: ['test'],
          codexNumber: 'MC-0001',
        });
      });
      
      count = codexState.getEntryCount();
      expect(count).toBe(1);
      
      await act(async () => {
        codexState.addEntry('Entry 2', [], [], {
          rarity: 'rare',
          stability: 0.7,
          energy: 100,
          failureRate: 0.2,
          output: 'fire',
          能耗: 'medium',
          coreFaction: 'arcane',
          description: 'Test 2',
          tags: ['test'],
          codexNumber: 'MC-0002',
        });
      });
      
      count = codexState.getEntryCount();
      expect(count).toBe(2);
    });

    it('should remove entry correctly', async () => {
      const codexState = useCodexStore.getState();
      
      await act(async () => {
        codexState.addEntry('Removable Machine', [], [], {
          rarity: 'common',
          stability: 0.5,
          energy: 50,
          failureRate: 0.3,
          output: 'none',
          能耗: 'low',
          coreFaction: 'stellar',
          description: 'Test',
          tags: ['test'],
          codexNumber: 'MC-0001',
        });
      });
      
      let entries = useCodexStore.getState().entries;
      expect(entries.length).toBe(1);
      
      const entryToRemove = entries[0];
      
      await act(async () => {
        codexState.removeEntry(entryToRemove.id);
      });
      
      entries = useCodexStore.getState().entries;
      expect(entries.length).toBe(0);
      
      // Verify entry no longer retrievable
      const retrieved = codexState.getEntry(entryToRemove.id);
      expect(retrieved).toBeUndefined();
    });

    it('should preserve entry data integrity after multiple operations', async () => {
      const codexState = useCodexStore.getState();
      
      const attributes: GeneratedAttributes = {
        rarity: 'epic',
        stability: 0.85,
        energy: 180,
        failureRate: 0.08,
        output: 'arcane',
        能耗: 'high',
        coreFaction: 'arcane',
        description: 'Complex arcane machinery',
        tags: ['arcane', 'complex', 'powerful'],
        codexNumber: 'MC-0001',
      };
      
      await act(async () => {
        codexState.addEntry('Arcane Engine', [
          {
            id: 'm1',
            instanceId: 'i1',
            type: 'core-furnace',
            category: 'core',
            x: 100,
            y: 100,
            rotation: 0,
            scale: 1,
            ports: [],
            properties: {},
          },
        ], [], attributes);
      });
      
      // Get entry
      const entries = useCodexStore.getState().entries;
      const entry = entries[0];
      
      // Verify all attributes preserved
      expect(entry.attributes.rarity).toBe('epic');
      expect(entry.attributes.stability).toBe(0.85);
      expect(entry.attributes.energy).toBe(180);
      expect(entry.attributes.failureRate).toBe(0.08);
      expect(entry.attributes.output).toBe('arcane');
      expect(entry.attributes.coreFaction).toBe('arcane');
      expect(entry.attributes.tags).toEqual(['arcane', 'complex', 'powerful']);
      
      // Verify module data
      expect(entry.modules.length).toBe(1);
      expect(entry.modules[0].type).toBe('core-furnace');
      
      // Verify timestamps
      expect(entry.createdAt).toBeGreaterThan(0);
    });
  });

  describe('Codex Integration with Machine Store', () => {
    it('should save current machine state to codex', async () => {
      const codexState = useCodexStore.getState();
      const machineState = useMachineStore.getState();
      
      // Create machine on canvas
      act(() => {
        machineState.addModule('core-furnace', 100, 100);
        machineState.addModule('gear', 200, 100);
      });
      
      let machine = useMachineStore.getState();
      const modulesCopy = [...machine.modules];
      const connectionsCopy = [...machine.connections];
      
      // Save to codex
      await act(async () => {
        codexState.addEntry('Canvas Machine', modulesCopy, connectionsCopy, {
          rarity: 'rare',
          stability: 0.75,
          energy: 120,
          failureRate: 0.12,
          output: 'fire',
          能耗: 'medium',
          coreFaction: 'arcane',
          description: 'Machine from canvas',
          tags: ['canvas'],
          codexNumber: 'MC-0001',
        });
      });
      
      // Verify codex entry
      const entries = useCodexStore.getState().entries;
      expect(entries.length).toBe(1);
      expect(entries[0].modules.length).toBe(2);
      expect(entries[0].modules[0].type).toBe('core-furnace');
      expect(entries[0].modules[1].type).toBe('gear');
      
      // Original canvas should still have modules
      machine = useMachineStore.getState();
      expect(machine.modules.length).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty modules array', async () => {
      const codexState = useCodexStore.getState();
      
      await act(async () => {
        codexState.addEntry('Empty Machine', [], [], {
          rarity: 'common',
          stability: 0.5,
          energy: 0,
          failureRate: 0,
          output: 'none',
          能耗: 'none',
          coreFaction: 'stellar',
          description: 'No modules',
          tags: [],
          codexNumber: 'MC-0001',
        });
      });
      
      const entries = useCodexStore.getState().entries;
      expect(entries.length).toBe(1);
      expect(entries[0].modules.length).toBe(0);
      expect(entries[0].connections.length).toBe(0);
    });

    it('should handle special characters in name', async () => {
      const codexState = useCodexStore.getState();
      
      await act(async () => {
        codexState.addEntry(' Machine "Alpha" <Special> & More! ', [], [], {
          rarity: 'legendary',
          stability: 0.9,
          energy: 250,
          failureRate: 0.02,
          output: 'void',
          能耗: 'extreme',
          coreFaction: 'void',
          description: 'Special chars',
          tags: ['special'],
          codexNumber: 'MC-0001',
        });
      });
      
      const entries = useCodexStore.getState().entries;
      expect(entries[0].name).toContain('Machine');
      expect(entries[0].name).toContain('Alpha');
    });

    it('should handle empty tags array', async () => {
      const codexState = useCodexStore.getState();
      
      await act(async () => {
        codexState.addEntry('No Tags Machine', [], [], {
          rarity: 'common',
          stability: 0.5,
          energy: 50,
          failureRate: 0.3,
          output: 'none',
          能耗: 'low',
          coreFaction: 'stellar',
          description: 'No tags here',
          tags: [],
          codexNumber: 'MC-0001',
        });
      });
      
      const entries = useCodexStore.getState().entries;
      expect(entries[0].attributes.tags).toEqual([]);
    });
  });
});
