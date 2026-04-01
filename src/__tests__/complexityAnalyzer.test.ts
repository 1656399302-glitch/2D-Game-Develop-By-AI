/**
 * Complexity Analyzer Utility Tests
 * 
 * Tests the complexity tier calculation with deterministic thresholds.
 * 
 * ROUND 81 PHASE 2: Test file per contract.
 */

import { describe, it, expect } from 'vitest';
import { 
  analyzeComplexity, 
  getComplexityDetails, 
  getComplexityColor,
  getComplexityTierEnglish,
  RARE_MODULE_TYPES 
} from '../utils/complexityAnalyzer';
import { PlacedModule, Connection, ModuleType } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Test helper to create a simple module
function createModule(type: ModuleType = 'core-furnace', x = 0, y = 0): PlacedModule {
  const id = uuidv4();
  return {
    id,
    instanceId: id,
    type,
    x,
    y,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [
      { id: `${type}-input-0`, type: 'input' as const, position: { x: 25, y: 50 } },
      { id: `${type}-output-0`, type: 'output' as const, position: { x: 75, y: 50 } },
    ],
  };
}

// Test helper to create a connection
function createConnection(sourceIdx: number, targetIdx: number): Connection {
  return {
    id: uuidv4(),
    sourceModuleId: `module-${sourceIdx}`,
    sourcePortId: 'output-0',
    targetModuleId: `module-${targetIdx}`,
    targetPortId: 'input-0',
    pathData: 'M 0 0 L 100 100',
  };
}

describe('Complexity Analyzer', () => {
  // TM3 Test Cases from contract
  describe('Base tier thresholds', () => {
    it('should return 简陋 for ≤3 modules', () => {
      // 2 modules
      const modules = [createModule(), createModule()];
      const connections: Connection[] = [createConnection(0, 1)];
      expect(analyzeComplexity(modules, connections)).toBe('简陋');
      
      // 3 modules
      const modules3 = [createModule(), createModule(), createModule()];
      const connections3 = [
        createConnection(0, 1),
        createConnection(1, 2),
      ];
      expect(analyzeComplexity(modules3, connections3)).toBe('简陋');
    });

    it('should return 普通 for 4–8 modules', () => {
      // 4 modules
      const modules = Array(4).fill(null).map((_, i) => createModule('gear', i * 100, 0));
      const connections = [
        createConnection(0, 1),
        createConnection(1, 2),
        createConnection(2, 3),
      ];
      expect(analyzeComplexity(modules, connections)).toBe('普通');
      
      // 6 modules
      const modules6 = Array(6).fill(null).map((_, i) => createModule('gear', i * 100, 0));
      const connections6 = [
        createConnection(0, 1),
        createConnection(1, 2),
        createConnection(2, 3),
        createConnection(3, 4),
        createConnection(4, 5),
      ];
      expect(analyzeComplexity(modules6, connections6)).toBe('普通');
    });

    it('should return 精致 for 9–15 modules', () => {
      // 9 modules
      const modules = Array(9).fill(null).map((_, i) => createModule('gear', i * 100, 0));
      const connections = Array(8).fill(null).map((_, i) => createConnection(i, i + 1));
      expect(analyzeComplexity(modules, connections)).toBe('精致');
      
      // 12 modules
      const modules12 = Array(12).fill(null).map((_, i) => createModule('gear', i * 100, 0));
      const connections12 = Array(8).fill(null).map((_, i) => createConnection(i, i + 1));
      expect(analyzeComplexity(modules12, connections12)).toBe('精致');
    });

    it('should return 复杂 for 16–30 modules', () => {
      // 16 modules
      const modules = Array(16).fill(null).map((_, i) => createModule('gear', i * 100, 0));
      const connections = Array(15).fill(null).map((_, i) => createConnection(i, i + 1));
      expect(analyzeComplexity(modules, connections)).toBe('复杂');
      
      // 22 modules
      const modules22 = Array(22).fill(null).map((_, i) => createModule('gear', i * 100, 0));
      const connections22 = Array(25).fill(null).map((_, i) => createConnection(i, (i + 1) % 22));
      expect(analyzeComplexity(modules22, connections22)).toBe('复杂');
    });

    it('should return 史诗 for 31+ modules', () => {
      // 31 modules
      const modules = Array(31).fill(null).map((_, i) => createModule('gear', i * 100, 0));
      const connections = Array(30).fill(null).map((_, i) => createConnection(i, i + 1));
      expect(analyzeComplexity(modules, connections)).toBe('史诗');
      
      // 40 modules
      const modules40 = Array(40).fill(null).map((_, i) => createModule('gear', i * 100, 0));
      const connections40 = Array(20).fill(null).map((_, i) => createConnection(i, i + 1));
      expect(analyzeComplexity(modules40, connections40)).toBe('史诗');
    });
  });

  // Escalation bonuses tests
  describe('Escalation bonuses', () => {
    it('should add +1 tier for connection density > 2.5', () => {
      // 8 modules, 25 connections = density 3.125 > 2.5
      const modules = Array(8).fill(null).map((_, i) => createModule('gear', i * 100, 0));
      const connections = Array(25).fill(null).map((_, i) => createConnection(i, (i + 1) % 8));
      
      // 8 modules normally = 普通, but +1 tier = 精致
      expect(analyzeComplexity(modules, connections)).toBe('精致');
    });

    it('should add +1 tier for ≥3 rare modules', () => {
      // 6 modules, 3 rare modules = +1 tier
      const modules = [
        createModule('temporal-distorter', 0, 0),    // rare
        createModule('ether-infusion-chamber', 100, 0), // rare
        createModule('arcane-matrix-grid', 200, 0),  // rare
        createModule('gear', 300, 0),
        createModule('gear', 400, 0),
        createModule('gear', 500, 0),
      ];
      const connections = [
        createConnection(0, 1),
        createConnection(1, 2),
        createConnection(2, 3),
        createConnection(3, 4),
        createConnection(4, 5),
      ];
      
      // 6 modules normally = 普通, but +1 tier = 精致
      expect(analyzeComplexity(modules, connections)).toBe('精致');
    });

    it('should add +1 tier for balanced symmetric layout', () => {
      // Create a balanced layout (grid pattern)
      const modules: PlacedModule[] = [];
      let idx = 0;
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          modules.push(createModule('gear', col * 100, row * 100));
          idx++;
        }
      }
      // Add 2 more to reach 6 modules with balanced aspect ratio
      modules.push(createModule('gear', 0, 200));
      modules.push(createModule('gear', 100, 200));
      
      const connections = [
        createConnection(0, 1),
        createConnection(2, 3),
        createConnection(4, 5),
        createConnection(1, 2),
        createConnection(3, 4),
      ];
      
      // 6 modules normally = 普通, but +1 tier = 精致
      expect(analyzeComplexity(modules, connections)).toBe('精致');
    });

    it('should apply multiple bonuses cumulatively', () => {
      // 8 modules with high density + 3 rare modules
      const modules = [
        createModule('temporal-distorter', 0, 0),    // rare
        createModule('ether-infusion-chamber', 100, 0), // rare
        createModule('arcane-matrix-grid', 200, 0),  // rare
        createModule('gear', 300, 0),
        createModule('gear', 400, 0),
        createModule('gear', 500, 0),
        createModule('gear', 600, 0),
        createModule('gear', 700, 0),
      ];
      // High density: 25 connections / 8 modules = 3.125
      const connections = Array(25).fill(null).map((_, i) => createConnection(i, (i + 1) % 8));
      
      // 8 modules normally = 普通, density bonus = +1, rare bonus = +1 = 复杂
      expect(analyzeComplexity(modules, connections)).toBe('复杂');
    });
  });

  // Edge cases
  describe('Edge cases', () => {
    it('should handle empty modules array', () => {
      expect(analyzeComplexity([], [])).toBe('简陋');
    });

    it('should handle no connections', () => {
      const modules = [createModule(), createModule(), createModule()];
      expect(analyzeComplexity(modules, [])).toBe('简陋');
    });

    it('should cap tier at 史诗', () => {
      // Maximum bonuses scenario
      const modules: PlacedModule[] = [];
      for (let i = 0; i < 10; i++) {
        modules.push(createModule('temporal-distorter', i * 100, 0));
      }
      // All modules are rare, high density, balanced
      const connections = Array(30).fill(null).map((_, i) => createConnection(i, (i + 1) % 10));
      
      // Should cap at 史诗
      expect(analyzeComplexity(modules, connections)).toBe('史诗');
    });
  });

  // Helper function tests
  describe('getComplexityDetails', () => {
    it('should return complete complexity details', () => {
      const modules = [createModule(), createModule()];
      const connections = [createConnection(0, 1)];
      
      const details = getComplexityDetails(modules, connections);
      
      expect(details.tier).toBe('简陋');
      expect(details.moduleCount).toBe(2);
      expect(details.connectionCount).toBe(1);
      expect(details.connectionDensity).toBe(0.5);
      expect(details.rareModuleCount).toBe(0);
      expect(details.hasBalancedLayout).toBe(false);
      expect(Array.isArray(details.bonuses)).toBe(true);
    });
  });

  describe('Color and label helpers', () => {
    it('should return correct colors for each tier', () => {
      const tiers = ['简陋', '普通', '精致', '复杂', '史诗'] as const;
      const colors = ['#9ca3af', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b'];
      
      tiers.forEach((tier, index) => {
        expect(getComplexityColor(tier)).toBe(colors[index]);
      });
    });

    it('should return correct English labels', () => {
      const expected = {
        '简陋': 'Crude',
        '普通': 'Ordinary',
        '精致': 'Exquisite',
        '复杂': 'Complex',
        '史诗': 'Epic',
      };
      
      Object.entries(expected).forEach(([tier, english]) => {
        expect(getComplexityTierEnglish(tier as any)).toBe(english);
      });
    });
  });
});
