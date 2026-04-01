/**
 * Machine Presets Tests
 * 
 * Tests that all 5 presets load with ≥4 modules + ≥3 connections.
 * 
 * ROUND 81 PHASE 2: Test file per contract.
 */

import { describe, it, expect } from 'vitest';
import { 
  MACHINE_PRESETS, 
  getPresetById, 
  getPresetsByFaction, 
  validatePreset,
  MachinePreset 
} from '../data/machinePresets';
import { PortType } from '../types';

describe('Machine Presets', () => {
  // TM8: All 5 presets must have ≥4 modules and ≥3 connections
  describe('Preset validation (TM8)', () => {
    it('should have exactly 5 presets', () => {
      expect(MACHINE_PRESETS).toHaveLength(5);
    });

    it('should have void-reverence preset with ≥4 modules and ≥3 connections', () => {
      const preset = getPresetById('void-reverence');
      expect(preset).toBeDefined();
      expect(preset!.modules.length).toBeGreaterThanOrEqual(4);
      expect(preset!.connections.length).toBeGreaterThanOrEqual(3);
    });

    it('should have molten-forge preset with ≥4 modules and ≥3 connections', () => {
      const preset = getPresetById('molten-forge');
      expect(preset).toBeDefined();
      expect(preset!.modules.length).toBeGreaterThanOrEqual(4);
      expect(preset!.connections.length).toBeGreaterThanOrEqual(3);
    });

    it('should have thunder-resonance preset with ≥4 modules and ≥3 connections', () => {
      const preset = getPresetById('thunder-resonance');
      expect(preset).toBeDefined();
      expect(preset!.modules.length).toBeGreaterThanOrEqual(4);
      expect(preset!.connections.length).toBeGreaterThanOrEqual(3);
    });

    it('should have arcane-matrix preset with ≥4 modules and ≥3 connections', () => {
      const preset = getPresetById('arcane-matrix');
      expect(preset).toBeDefined();
      expect(preset!.modules.length).toBeGreaterThanOrEqual(4);
      expect(preset!.connections.length).toBeGreaterThanOrEqual(3);
    });

    it('should have stellar-harmony preset with ≥4 modules and ≥3 connections', () => {
      const preset = getPresetById('stellar-harmony');
      expect(preset).toBeDefined();
      expect(preset!.modules.length).toBeGreaterThanOrEqual(4);
      expect(preset!.connections.length).toBeGreaterThanOrEqual(3);
    });

    // Validate all presets using the validation function
    it('should pass validation for all presets', () => {
      MACHINE_PRESETS.forEach((preset) => {
        const result = validatePreset(preset);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describe('Preset structure', () => {
    it('should have required fields for each preset', () => {
      MACHINE_PRESETS.forEach((preset) => {
        expect(preset.id).toBeDefined();
        expect(preset.name).toBeDefined();
        expect(preset.nameCn).toBeDefined();
        expect(preset.description).toBeDefined();
        expect(preset.factionId).toBeDefined();
        expect(Array.isArray(preset.modules)).toBe(true);
        expect(Array.isArray(preset.connections)).toBe(true);
      });
    });

    it('should have valid faction IDs', () => {
      const validFactions = ['void', 'inferno', 'storm', 'stellar', 'arcane', 'chaos'];
      
      MACHINE_PRESETS.forEach((preset) => {
        expect(validFactions).toContain(preset.factionId);
      });
    });

    it('should have unique IDs for all presets', () => {
      const ids = MACHINE_PRESETS.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Module validity', () => {
    it('should have valid module instances with all required fields', () => {
      MACHINE_PRESETS.forEach((preset) => {
        preset.modules.forEach((module) => {
          expect(module.id).toBeDefined();
          expect(module.instanceId).toBeDefined();
          expect(module.type).toBeDefined();
          expect(typeof module.x).toBe('number');
          expect(typeof module.y).toBe('number');
          expect(typeof module.rotation).toBe('number');
          expect(typeof module.scale).toBe('number');
          expect(typeof module.flipped).toBe('boolean');
          expect(Array.isArray(module.ports)).toBe(true);
          expect(module.ports.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have modules with valid port configurations', () => {
      MACHINE_PRESETS.forEach((preset) => {
        preset.modules.forEach((module) => {
          module.ports.forEach((port) => {
            expect(port.id).toBeDefined();
            // Port type should be either 'input' or 'output'
            expect(port.type === 'input' || port.type === 'output').toBe(true);
            expect(port.position).toBeDefined();
            expect(typeof port.position.x).toBe('number');
            expect(typeof port.position.y).toBe('number');
          });
        });
      });
    });
  });

  describe('Connection validity', () => {
    it('should have valid connection instances with all required fields', () => {
      MACHINE_PRESETS.forEach((preset) => {
        preset.connections.forEach((connection) => {
          expect(connection.id).toBeDefined();
          expect(connection.sourceModuleId).toBeDefined();
          expect(connection.sourcePortId).toBeDefined();
          expect(connection.targetModuleId).toBeDefined();
          expect(connection.targetPortId).toBeDefined();
          expect(connection.pathData).toBeDefined();
        });
      });
    });

    it('should reference valid module instances in connections', () => {
      MACHINE_PRESETS.forEach((preset) => {
        const moduleIds = new Set(preset.modules.map((m) => m.instanceId));
        
        preset.connections.forEach((connection) => {
          expect(moduleIds.has(connection.sourceModuleId)).toBe(true);
          expect(moduleIds.has(connection.targetModuleId)).toBe(true);
        });
      });
    });
  });

  describe('getPresetById', () => {
    it('should return correct preset for valid ID', () => {
      const preset = getPresetById('void-reverence');
      expect(preset).toBeDefined();
      expect(preset!.name).toBe('Void Reverence');
    });

    it('should return undefined for invalid ID', () => {
      const preset = getPresetById('non-existent');
      expect(preset).toBeUndefined();
    });
  });

  describe('getPresetsByFaction', () => {
    it('should return presets for a specific faction', () => {
      const voidPresets = getPresetsByFaction('void');
      expect(voidPresets.length).toBeGreaterThan(0);
      voidPresets.forEach((preset) => {
        expect(preset.factionId).toBe('void');
      });
    });

    it('should return empty array for faction with no presets', () => {
      // This assumes not all factions have presets
      const presets = getPresetsByFaction('non-existent');
      expect(presets).toEqual([]);
    });
  });

  describe('Preset diversity', () => {
    it('should have different factions represented', () => {
      const factions = new Set(MACHINE_PRESETS.map((p) => p.factionId));
      // At least 3 different factions should be represented
      expect(factions.size).toBeGreaterThanOrEqual(3);
    });

    it('should have modules with different types in each preset', () => {
      MACHINE_PRESETS.forEach((preset) => {
        const moduleTypes = new Set(preset.modules.map((m) => m.type));
        // Should have at least 2 different module types
        expect(moduleTypes.size).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
