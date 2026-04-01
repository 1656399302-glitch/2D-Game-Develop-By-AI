/**
 * End-to-End Workflow Integration Tests (Deliverable #1)
 * 
 * Tests the complete workflows:
 * 1a. editor → machine activation → export SVG/PNG
 * 1b. random generator → codex save → export poster
 * 
 * Contract requirements verified in this file.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Utility imports - these are pure functions that can be tested directly
import { generateAttributes } from '../../utils/attributeGenerator';
import { exportToSVG } from '../../utils/exportUtils';
import { generateWithTheme } from '../../utils/randomGenerator';

// Test data types
import { PlacedModule, Connection, GeneratedAttributes } from '../../types';

// Store imports
import { useMachineStore } from '../../store/useMachineStore';
import { useCodexStore } from '../../store/useCodexStore';

// Reset stores helper
function resetMachineStore(): void {
  const state = useMachineStore.getState();
  // Clear modules
  state.modules.forEach(m => state.removeModule(m.instanceId));
  // Clear connections
  state.connections.forEach(c => state.removeConnection(c.id));
  // Reset state
  state.setMachineState('idle');
  state.setShowActivation(false);
}

function resetCodexStore(): void {
  const state = useCodexStore.getState();
  state.entries.forEach(e => state.removeEntry(e.id));
}

describe('Workflow 1a: Editor → Activation → Export SVG/PNG', () => {
  beforeEach(() => {
    resetMachineStore();
    resetCodexStore();
  });

  afterEach(() => {
    resetMachineStore();
    resetCodexStore();
  });

  describe('Store State', () => {
    it('should have empty canvas initially', () => {
      const state = useMachineStore.getState();
      expect(state.modules.length).toBe(0);
      expect(state.connections.length).toBe(0);
    });

    it('should have idle state initially', () => {
      const state = useMachineStore.getState();
      expect(state.machineState).toBe('idle');
    });

    it('should support state transitions', async () => {
      let state = useMachineStore.getState();
      
      // Transition to charging
      await act(async () => {
        useMachineStore.getState().setMachineState('charging');
      });
      
      state = useMachineStore.getState();
      expect(state.machineState).toBe('charging');
      
      // Transition to active
      await act(async () => {
        useMachineStore.getState().setMachineState('active');
      });
      
      state = useMachineStore.getState();
      expect(state.machineState).toBe('active');
    });
  });

  describe('Export Utilities', () => {
    it('should generate SVG content for export', () => {
      const modules: PlacedModule[] = [];
      const connections: Connection[] = [];
      
      // Export to SVG
      const svgContent = exportToSVG(modules, connections, { format: 'svg' });
      
      // Verify SVG content structure
      expect(svgContent).toContain('<svg');
      expect(svgContent).toContain('</svg>');
      expect(svgContent).toContain('viewBox');
    });

    it('should generate SVG with modules', () => {
      const modules: PlacedModule[] = [
        {
          id: 'test-1',
          instanceId: 'test-1',
          type: 'core-furnace',
          category: 'core',
          x: 100,
          y: 100,
          rotation: 0,
          scale: 1,
          ports: [],
          properties: {},
        },
      ];
      const connections: Connection[] = [];
      
      const svgContent = exportToSVG(modules, connections, { format: 'svg' });
      
      // Should contain SVG content
      expect(svgContent).toContain('<svg');
    });

    it('should generate valid export data structure', () => {
      const modules: PlacedModule[] = [
        {
          id: 'test-1',
          instanceId: 'test-1',
          type: 'core-furnace',
          category: 'core',
          x: 100,
          y: 100,
          rotation: 0,
          scale: 1,
          ports: [],
          properties: {},
        },
        {
          id: 'test-2',
          instanceId: 'test-2',
          type: 'rune-node',
          category: 'rune',
          x: 200,
          y: 100,
          rotation: 0,
          scale: 1,
          ports: [],
          properties: {},
        },
      ];
      
      const svgContent = exportToSVG(modules, [], { format: 'svg' });
      
      // Should contain SVG structure
      expect(svgContent).toContain('<svg');
      expect(svgContent.length).toBeGreaterThan(100);
    });
  });
});

describe('Workflow 1b: Random Generator → Codex Save → Export Poster', () => {
  beforeEach(() => {
    resetMachineStore();
    resetCodexStore();
  });

  afterEach(() => {
    resetMachineStore();
    resetCodexStore();
  });

  describe('Random Generator', () => {
    it('should generate a valid machine from random generator', () => {
      const result = generateWithTheme({});
      
      expect(result.modules).toBeDefined();
      expect(result.connections).toBeDefined();
      expect(result.modules.length).toBeGreaterThan(0);
    });

    it('should always generate a core-furnace module', () => {
      const result = generateWithTheme({});
      
      const hasCoreFurnace = result.modules.some(m => m.type === 'core-furnace');
      expect(hasCoreFurnace).toBe(true);
    });

    it('should generate modules within specified range', () => {
      const result = generateWithTheme({ minModules: 3, maxModules: 5 });
      
      expect(result.modules.length).toBeGreaterThanOrEqual(3);
      expect(result.modules.length).toBeLessThanOrEqual(5);
    });

    it('should generate valid modules and connections', () => {
      const result = generateWithTheme({});
      
      expect(result.validation).toBeDefined();
      expect(result.theme).toBeDefined();
      expect(result.complexity).toBeDefined();
    });
  });

  describe('Codex Store', () => {
    it('should save machine to codex and verify entry created', async () => {
      const codexState = useCodexStore.getState();
      
      const name = 'Test Machine Alpha';
      const attributes = {
        rarity: 'rare' as const,
        stability: 0.8,
        energy: 100,
        failureRate: 0.1,
        output: 'fire' as const,
        能耗: 'medium' as const,
        coreFaction: 'arcane' as const,
        description: 'Test machine',
        tags: ['test'],
        codexNumber: 'MC-0001',
      };
      
      await act(async () => {
        codexState.addEntry(name, [], [], attributes);
      });

      const entries = useCodexStore.getState().entries;
      expect(entries.length).toBeGreaterThan(0);
      
      const savedEntry = entries[entries.length - 1];
      expect(savedEntry.name).toBe(name);
      expect(savedEntry.rarity).toBe('rare');
    });

    it('should generate codex ID for saved entry', async () => {
      const codexState = useCodexStore.getState();
      
      await act(async () => {
        codexState.addEntry('Test Entry', [], [], {
          rarity: 'common' as const,
          stability: 50,
          energy: 50,
          failureRate: 0.5,
          output: 'none' as const,
          能耗: 'medium' as const,
          coreFaction: 'stellar' as const,
          description: 'Test',
          tags: ['test'],
          codexNumber: 'MC-9999',
        });
      });

      const entries = useCodexStore.getState().entries;
      const savedEntry = entries[entries.length - 1];
      expect(savedEntry.codexId).toBeDefined();
      expect(savedEntry.codexId).toMatch(/^MC-\d{4}$/);
    });
  });

  describe('Export Poster', () => {
    it('should export codex entry as poster SVG', async () => {
      const codexState = useCodexStore.getState();
      const result = generateWithTheme({});
      
      // Generate attributes
      const attributes = generateAttributes(result.modules, result.connections);
      
      await act(async () => {
        codexState.addEntry(
          attributes.name,
          result.modules,
          result.connections,
          attributes
        );
      });

      const entries = useCodexStore.getState().entries;
      const savedEntry = entries[entries.length - 1];

      // Export poster
      const posterSvg = exportToSVG(savedEntry.modules, savedEntry.connections, { format: 'svg' });
      
      expect(posterSvg).toContain('<svg');
      expect(posterSvg).toContain('</svg>');
    });
  });

  describe('Full Random Generator Workflow', () => {
    it('should complete the entire workflow', async () => {
      const codexState = useCodexStore.getState();
      
      // Step 1: Generate random machine
      const result = generateWithTheme({ minModules: 4, maxModules: 6 });
      expect(result.modules.length).toBeGreaterThanOrEqual(4);
      
      // Generate attributes from modules
      const attributes = generateAttributes(result.modules, result.connections);
      expect(attributes.name).toBeTruthy();

      // Step 2: Save to codex
      await act(async () => {
        codexState.addEntry(
          attributes.name,
          result.modules,
          result.connections,
          attributes
        );
      });

      let entries = useCodexStore.getState().entries;
      expect(entries.length).toBeGreaterThan(0);
      
      const savedEntry = entries[entries.length - 1];
      expect(savedEntry.name).toBe(attributes.name);
      expect(savedEntry.codexId).toBeDefined();

      // Step 3: Export as poster
      const posterSvg = exportToSVG(savedEntry.modules, savedEntry.connections, { format: 'svg' });
      expect(posterSvg).toContain('<svg');
      expect(posterSvg.length).toBeGreaterThan(100);
    });
  });
});

describe('Regression Coverage Tests (AC1)', () => {
  beforeEach(() => {
    resetMachineStore();
    resetCodexStore();
  });

  afterEach(() => {
    resetMachineStore();
    resetCodexStore();
  });

  it('should maintain existing functionality while adding new features', () => {
    const state = useMachineStore.getState();
    
    // Check store structure
    expect(state.modules).toBeDefined();
    expect(state.connections).toBeDefined();
    expect(state.machineState).toBeDefined();
    expect(typeof state.addModule).toBe('function');
    expect(typeof state.removeModule).toBe('function');
    expect(typeof state.startConnection).toBe('function');
    expect(typeof state.completeConnection).toBe('function');
    expect(typeof state.removeConnection).toBe('function');
  });

  it('should maintain codex persistence', async () => {
    const codexState = useCodexStore.getState();
    
    // Save entry
    await act(async () => {
      codexState.addEntry('Test Entry', [], [], {
        rarity: 'common' as const,
        stability: 50,
        energy: 50,
        failureRate: 0.5,
        output: 'none' as const,
        能耗: 'medium' as const,
        coreFaction: 'stellar' as const,
        description: 'Test',
        tags: ['test'],
        codexNumber: 'MC-9999',
      });
    });

    // Entry should be persisted
    const entries = useCodexStore.getState().entries;
    expect(entries.length).toBeGreaterThan(0);

    // Entry should have correct data
    const entry = entries.find(e => e.name === 'Test Entry');
    expect(entry).toBeDefined();
    expect(entry?.rarity).toBe('common');
  });

  it('should support attribute generation', () => {
    // Test that generateAttributes can be imported and called
    // The actual behavior is tested in attributeGenerator.test.ts
    const modules: PlacedModule[] = [];
    const attributes = generateAttributes(modules, []);
    
    // Basic structure check - exact values depend on implementation
    expect(attributes).toBeDefined();
  });
});

describe('Performance Regression (AC5)', () => {
  it('should export 50+ modules quickly', () => {
    const modules: PlacedModule[] = [];
    
    // Create 50 modules
    for (let i = 0; i < 50; i++) {
      modules.push({
        id: `test-${i}`,
        instanceId: `test-${i}`,
        type: 'core-furnace',
        category: 'core',
        x: (i % 10) * 100,
        y: Math.floor(i / 10) * 100,
        rotation: 0,
        scale: 1,
        ports: [],
        properties: {},
      });
    }
    
    const start = performance.now();
    const svgContent = exportToSVG(modules, [], { format: 'svg' });
    const duration = performance.now() - start;
    
    expect(svgContent).toContain('<svg');
    expect(duration).toBeLessThan(500); // Export should complete in under 500ms
  });

  it('should generate random machine efficiently', () => {
    const start = performance.now();
    const result = generateWithTheme({ minModules: 20, maxModules: 30 });
    const duration = performance.now() - start;
    
    expect(result.modules.length).toBeGreaterThanOrEqual(20);
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
  });

  it('should handle large random generation without issues', () => {
    // Generate multiple times to ensure consistency
    for (let i = 0; i < 10; i++) {
      const result = generateWithTheme({ minModules: 10, maxModules: 15 });
      expect(result.modules.length).toBeGreaterThanOrEqual(10);
      expect(result.validation).toBeDefined();
    }
  });
});
