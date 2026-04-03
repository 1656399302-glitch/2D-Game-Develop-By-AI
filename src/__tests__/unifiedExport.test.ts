/**
 * Unified Export Utils Tests - Round 115
 * Tests for consolidated export functions and dimension validation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateCodexCardSVG,
  exportAsCodexCard,
  validateDimensions,
  clampDimensions,
  getDefaultDimensionsForFormat,
  FORMAT_PRESETS,
  POSTER_WIDTH,
  POSTER_HEIGHT,
} from '../utils/unifiedExportUtils';
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

describe('unifiedExportUtils', () => {
  describe('generateCodexCardSVG', () => {
    // TM-115-001: Verify unified export module generates valid SVG
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

    it('should have valid SVG structure', () => {
      const svg = generateCodexCardSVG([mockModule], [], mockAttributes, mockFaction);
      expect(svg).toContain('<?xml version="1.0"');
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain(`width="${POSTER_WIDTH}"`);
      expect(svg).toContain(`height="${POSTER_HEIGHT}"`);
    });

    it('should use faction colors in SVG', () => {
      const svg = generateCodexCardSVG([mockModule], [], mockAttributes, mockFaction);
      expect(svg).toContain(mockFaction.color);
    });
  });

  describe('exportAsCodexCard', () => {
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
  });

  describe('validateDimensions', () => {
    // TM-115-002: Test dimension validation boundary cases

    it('should accept valid dimensions (800x1000)', () => {
      const result = validateDimensions(800, 1000);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should accept boundary value 400x400', () => {
      const result = validateDimensions(400, 400);
      expect(result.isValid).toBe(true);
    });

    it('should accept boundary value 2000x2000', () => {
      const result = validateDimensions(2000, 2000);
      expect(result.isValid).toBe(true);
    });

    // AC-115-002a: Below-range validation
    it('should reject width below minimum (399)', () => {
      const result = validateDimensions(399, 1000);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Width');
      expect(result.errorMessage).toContain('400');
    });

    it('should reject height below minimum (399)', () => {
      const result = validateDimensions(800, 399);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Height');
      expect(result.errorMessage).toContain('400');
    });

    it('should reject width 350', () => {
      const result = validateDimensions(350, 1000);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Width must be at least 400px');
    });

    // AC-115-002b: Above-range validation
    it('should reject width above maximum (2001)', () => {
      const result = validateDimensions(2001, 1000);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Width');
      expect(result.errorMessage).toContain('2000');
    });

    it('should reject height above maximum (2001)', () => {
      const result = validateDimensions(800, 2001);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Height');
      expect(result.errorMessage).toContain('2000');
    });

    it('should reject height 2001', () => {
      const result = validateDimensions(1000, 2001);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Height must be at most 2000px');
    });

    // AC-115-002c: Valid dimensions
    it('should accept valid dimensions 1000x1200', () => {
      const result = validateDimensions(1000, 1200);
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should accept valid dimensions 1200x675 (Twitter)', () => {
      const result = validateDimensions(1200, 675);
      expect(result.isValid).toBe(true);
    });

    // Edge cases
    it('should reject empty width (0)', () => {
      const result = validateDimensions(0, 1000);
      expect(result.isValid).toBe(false);
    });

    it('should reject empty height (0)', () => {
      const result = validateDimensions(800, 0);
      expect(result.isValid).toBe(false);
    });

    it('should reject NaN width', () => {
      const result = validateDimensions(NaN, 1000);
      expect(result.isValid).toBe(false);
    });

    it('should reject NaN height', () => {
      const result = validateDimensions(800, NaN);
      expect(result.isValid).toBe(false);
    });

    it('should reject negative dimensions', () => {
      const result = validateDimensions(-100, 1000);
      expect(result.isValid).toBe(false);
    });
  });

  describe('clampDimensions', () => {
    it('should clamp dimensions within valid range', () => {
      const result = clampDimensions(500, 1500);
      expect(result.width).toBe(500);
      expect(result.height).toBe(1500);
    });

    it('should clamp width below minimum to 400', () => {
      const result = clampDimensions(350, 1000);
      expect(result.width).toBe(400);
      expect(result.height).toBe(1000);
    });

    it('should clamp width above maximum to 2000', () => {
      const result = clampDimensions(2001, 1000);
      expect(result.width).toBe(2000);
      expect(result.height).toBe(1000);
    });

    it('should clamp height below minimum to 400', () => {
      const result = clampDimensions(800, 350);
      expect(result.width).toBe(800);
      expect(result.height).toBe(400);
    });

    it('should clamp height above maximum to 2000', () => {
      const result = clampDimensions(800, 2001);
      expect(result.width).toBe(800);
      expect(result.height).toBe(2000);
    });

    it('should clamp both dimensions when out of range', () => {
      const result = clampDimensions(100, 3000);
      expect(result.width).toBe(400);
      expect(result.height).toBe(2000);
    });

    it('should return exact values for valid dimensions', () => {
      const result = clampDimensions(1200, 675);
      expect(result.width).toBe(1200);
      expect(result.height).toBe(675);
    });
  });

  describe('getDefaultDimensionsForFormat', () => {
    it('should return 800x1000 for poster format', () => {
      const dims = getDefaultDimensionsForFormat('poster');
      expect(dims.width).toBe(800);
      expect(dims.height).toBe(1000);
    });

    it('should return 1200x675 for twitter format', () => {
      const dims = getDefaultDimensionsForFormat('twitter');
      expect(dims.width).toBe(1200);
      expect(dims.height).toBe(675);
    });

    it('should return 1080x1080 for instagram format', () => {
      const dims = getDefaultDimensionsForFormat('instagram');
      expect(dims.width).toBe(1080);
      expect(dims.height).toBe(1080);
    });

    it('should return 600x400 for discord format', () => {
      const dims = getDefaultDimensionsForFormat('discord');
      expect(dims.width).toBe(600);
      expect(dims.height).toBe(400);
    });
  });

  describe('FORMAT_PRESETS', () => {
    it('should have poster preset with correct dimensions', () => {
      expect(FORMAT_PRESETS.poster).toEqual({ width: 800, height: 1000 });
    });

    it('should have twitter preset with correct dimensions', () => {
      expect(FORMAT_PRESETS.twitter).toEqual({ width: 1200, height: 675 });
    });

    it('should have instagram preset with correct dimensions', () => {
      expect(FORMAT_PRESETS.instagram).toEqual({ width: 1080, height: 1080 });
    });

    it('should have discord preset with correct dimensions', () => {
      expect(FORMAT_PRESETS.discord).toEqual({ width: 600, height: 400 });
    });
  });

  describe('POSTER constants', () => {
    it('should have correct poster width', () => {
      expect(POSTER_WIDTH).toBe(800);
    });

    it('should have correct poster height', () => {
      expect(POSTER_HEIGHT).toBe(1000);
    });
  });

  describe('Error handling paths', () => {
    // TM-115-003: Test error handling for SVG and PNG failure paths

    it('should throw meaningful error for invalid SVG', async () => {
      global.DOMParser = class DOMParser {
        parseFromString() {
          return { querySelector: () => ({ textContent: 'parser error' }) };
        }
      } as any;

      await expect(
        exportAsCodexCard([mockModule], [], mockAttributes, mockFaction, 'svg')
      ).rejects.toThrow('Invalid SVG');
    });

    it('should handle export with empty modules gracefully', async () => {
      const result = await exportAsCodexCard([], [], mockAttributes, mockFaction, 'svg');
      expect(typeof result).toBe('string');
      expect(result as string).toContain('<svg');
    });
  });

  describe('Preview accuracy (AC-115-004)', () => {
    it('should generate SVG with correct poster aspect ratio (0.8)', () => {
      const svg = generateCodexCardSVG([mockModule], [], mockAttributes, mockFaction);
      // Poster format is 800x1000 = 0.8 aspect ratio
      expect(svg).toContain('width="800"');
      expect(svg).toContain('height="1000"');
    });

    it('should include all required poster elements', () => {
      const svg = generateCodexCardSVG([mockModule], [mockConnection], mockAttributes, mockFaction);
      
      // 1. Machine title
      expect(svg).toContain(mockAttributes.name);
      
      // 2. Machine visualization (module SVG)
      expect(svg).toContain('polygon');
      
      // 3. Attribute panel (stats)
      expect(svg).toContain('Stability:');
      expect(svg).toContain('Power:');
      
      // 4. Decorative border
      expect(svg).toContain('stroke-width="3"');
      
      // 5. Faction seal
      expect(svg).toContain(mockFaction.icon);
      
      // 6. Machine ID
      expect(svg).toContain('CODEX ID:');
    });
  });
});
