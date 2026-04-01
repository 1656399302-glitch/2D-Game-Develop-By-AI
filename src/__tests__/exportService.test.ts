/**
 * Export Service Tests - Round 95
 * Tests for CodexCard poster export system
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateCodexCardSVG,
  exportAsCodexCard,
} from '../services/exportService';
import { PlacedModule, Connection, GeneratedAttributes } from '../types';
import { FactionConfig } from '../types/factions';

// Mock data
const mockModule: PlacedModule = {
  id: 'test-module-1',
  instanceId: 'inst-1',
  type: 'core-furnace',
  x: 100,
  y: 100,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports: [],
};

const mockConnection: Connection = {
  id: 'conn-1',
  sourceModuleId: 'inst-1',
  sourcePortId: 'core-furnace-output-0',
  targetModuleId: 'inst-2',
  targetPortId: 'gear-input-0',
  pathData: 'M 150 100 L 250 100',
};

const mockAttributes: GeneratedAttributes = {
  name: 'Test Machine Alpha',
  rarity: 'rare',
  stats: {
    stability: 75,
    powerOutput: 65,
    energyCost: 45,
    failureRate: 25,
  },
  tags: ['arcane', 'amplifying'],
  description: 'A test machine for unit testing purposes.',
  codexId: 'TEST1234',
};

const mockFaction: FactionConfig = {
  id: 'stellar',
  name: 'Stellar',
  nameCn: '星辉派系',
  color: '#22d3ee',
  secondaryColor: '#0891b2',
  icon: '✦',
  description: 'Celestial energy manipulation',
  bonusType: 'power',
  bonusValue: 15,
  glowColor: 'rgba(34, 211, 238, 0.3)',
  reputationRequired: 100,
};

// Setup DOMParser mock before tests
beforeEach(() => {
  vi.clearAllMocks();
  global.DOMParser = class DOMParser {
    parseFromString(str: string, _type: string) {
      return {
        querySelector: (sel: string) => {
          if (str.includes('parsererror') || !str.includes('<svg')) return { textContent: 'error' };
          return null;
        },
      };
    }
  } as any;
});

describe('exportService', () => {
  describe('generateCodexCardSVG', () => {
    // TM-EXPORT-002: Poster Element Presence (SVG Parsing)
    it('should generate valid SVG with machine title', () => {
      const svg = generateCodexCardSVG([mockModule], [], mockAttributes, mockFaction);
      expect(svg).toContain('<svg');
      expect(svg).toContain('ARCANE MACHINE CODEX');
      expect(svg).toContain(mockAttributes.name);
    });

    it('should generate SVG with machine visualization', () => {
      const svg = generateCodexCardSVG([mockModule], [], mockAttributes, mockFaction);
      // Check for SVG elements that represent the machine visualization
      expect(svg).toContain('polygon'); // core-furnace uses polygon
      expect(svg).toContain('transform=');
    });

    it('should generate SVG with attribute panel', () => {
      const svg = generateCodexCardSVG([mockModule], [], mockAttributes, mockFaction);
      expect(svg).toContain('Stability:');
      expect(svg).toContain('Power:');
      expect(svg).toContain('Energy:');
      expect(svg).toContain('Failure:');
    });

    it('should generate SVG with decorative border', () => {
      const svg = generateCodexCardSVG([mockModule], [], mockAttributes, mockFaction);
      expect(svg).toContain('stroke-width="3"');
      expect(svg).toContain('stroke-dasharray');
    });

    it('should generate SVG with faction seal', () => {
      const svg = generateCodexCardSVG([mockModule], [], mockAttributes, mockFaction);
      expect(svg).toContain(mockFaction.icon);
      expect(svg).toContain(mockFaction.nameCn);
    });

    it('should generate SVG with machine ID', () => {
      const svg = generateCodexCardSVG([mockModule], [], mockAttributes, mockFaction);
      expect(svg).toContain('CODEX ID:');
      expect(svg).toContain(mockAttributes.codexId);
    });

    it('should handle empty modules array', () => {
      const svg = generateCodexCardSVG([], [], mockAttributes, mockFaction);
      expect(svg).toContain('<svg');
      expect(svg).toContain(mockAttributes.name);
    });

    it('should include connections in SVG', () => {
      const svg = generateCodexCardSVG([mockModule], [mockConnection], mockAttributes, mockFaction);
      expect(svg).toContain('path');
      expect(svg).toContain(mockConnection.pathData);
    });

    it('should include rarity badge in SVG', () => {
      const svg = generateCodexCardSVG([mockModule], [], mockAttributes, mockFaction);
      expect(svg).toContain(mockAttributes.rarity.toUpperCase());
    });

    it('should include faction color theming', () => {
      const svg = generateCodexCardSVG([mockModule], [], mockAttributes, mockFaction);
      expect(svg).toContain(mockFaction.color);
    });

    it('should have valid SVG structure', () => {
      const svg = generateCodexCardSVG([mockModule], [], mockAttributes, mockFaction);
      expect(svg).toContain('<?xml version="1.0"');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('viewBox="0 0 800 1000"');
    });
  });

  describe('exportAsCodexCard', () => {
    // TM-EXPORT-004: SVG Export Validation
    it('should export as SVG when format is svg', async () => {
      const result = await exportAsCodexCard(
        [mockModule], [], mockAttributes, mockFaction, 'svg'
      );
      expect(typeof result).toBe('string');
      expect(result as string).toContain('<svg');
    });

    it('should produce valid SVG when exporting as svg', async () => {
      const result = await exportAsCodexCard(
        [mockModule], [], mockAttributes, mockFaction, 'svg'
      );
      const svg = result as string;
      expect(svg).toContain('<?xml');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    });

    it('should throw error for invalid SVG', async () => {
      // Reset DOMParser mock to return error
      global.DOMParser = class DOMParser {
        parseFromString() {
          return { querySelector: () => ({ textContent: 'error' }) };
        }
      } as any;

      await expect(
        exportAsCodexCard([mockModule], [], mockAttributes, mockFaction, 'svg')
      ).rejects.toThrow('Invalid SVG');
    });

    // TM-EXPORT-005: Export Performance
    it('should complete export within reasonable time for small machine', async () => {
      const start = performance.now();
      await exportAsCodexCard([mockModule], [], mockAttributes, mockFaction, 'svg');
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(2000);
    });

    it('should include all required poster elements in exported SVG', async () => {
      const result = await exportAsCodexCard(
        [mockModule], [mockConnection], mockAttributes, mockFaction, 'svg'
      ) as string;
      
      // AC-EXPORT-002: All 6 required elements
      expect(result).toContain(mockAttributes.name); // 1. Machine title
      expect(result).toContain('polygon'); // 2. Machine visualization
      expect(result).toContain('Stability:'); // 3. Attribute panel
      expect(result).toContain('stroke-width="3"'); // 4. Decorative border
      expect(result).toContain(mockFaction.icon); // 5. Faction seal
      expect(result).toContain(mockAttributes.codexId); // 6. Machine ID
    });
  });
});
