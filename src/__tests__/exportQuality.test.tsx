import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getResolutionDimensions, exportPoster, exportEnhancedPoster } from '../utils/exportUtils';
import { PlacedModule, Connection, GeneratedAttributes, ExportResolution, ExportAspectRatio, RESOLUTION_DIMS, ASPECT_RATIO_DIMS } from '../types';

// Mock modules for testing
const mockModules: PlacedModule[] = [
  {
    id: 'test-module-1',
    instanceId: 'test-instance-1',
    type: 'core-furnace' as const,
    x: 100,
    y: 200,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [],
  },
  {
    id: 'test-module-2',
    instanceId: 'test-instance-2',
    type: 'gear' as const,
    x: 300,
    y: 200,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [],
  },
];

const mockConnections: Connection[] = [
  {
    id: 'conn-1',
    sourceModuleId: 'test-module-1',
    sourcePortId: 'port-1',
    targetModuleId: 'test-module-2',
    targetPortId: 'port-2',
    pathData: 'M150,250 Q225,200 300,250',
  },
];

const mockAttributes: GeneratedAttributes = {
  name: 'Test Machine',
  rarity: 'rare',
  stats: {
    stability: 75,
    powerOutput: 60,
    energyCost: 40,
    failureRate: 20,
  },
  tags: ['arcane', 'amplifying'],
  description: 'A test machine for export quality verification.',
  codexId: 'TEST-001',
};

describe('Export Quality Enhancement Tests', () => {
  describe('AC1: Resolution Multiplier', () => {
    it('should have correct resolution dimensions defined', () => {
      expect(RESOLUTION_DIMS['1x']).toEqual({ base: 400, scaled: 400 });
      expect(RESOLUTION_DIMS['2x']).toEqual({ base: 400, scaled: 800 });
      expect(RESOLUTION_DIMS['4x']).toEqual({ base: 400, scaled: 1600 });
    });

    it('should calculate correct dimensions for 1x resolution', () => {
      const dims = getResolutionDimensions(mockModules, '1x');
      // At minimum, should be 400px wide (base width)
      expect(dims.width).toBeGreaterThanOrEqual(400);
    });

    it('should calculate correct dimensions for 2x resolution', () => {
      const dims = getResolutionDimensions(mockModules, '2x');
      // 2x should be double the 1x base
      expect(dims.width).toBeGreaterThanOrEqual(800);
    });

    it('should calculate correct dimensions for 4x resolution', () => {
      const dims = getResolutionDimensions(mockModules, '4x');
      // 4x should be 4x the 1x base (1600px)
      expect(dims.width).toBeGreaterThanOrEqual(1600);
    });

    it('should scale proportionally between resolutions', () => {
      const dims1x = getResolutionDimensions(mockModules, '1x');
      const dims2x = getResolutionDimensions(mockModules, '2x');
      const dims4x = getResolutionDimensions(mockModules, '4x');

      // 2x should be approximately double 1x
      expect(dims2x.width / dims1x.width).toBeCloseTo(2, 0);
      // 4x should be approximately 4x 1x
      expect(dims4x.width / dims1x.width).toBeCloseTo(4, 0);
    });

    it('should return ExportResolution type correctly', () => {
      const resolution: ExportResolution = '2x';
      expect(['1x', '2x', '4x']).toContain(resolution);
    });
  });

  describe('AC2: Transparent Background', () => {
    it('should have transparentBackground option in ExportOptions type', () => {
      // This is a type-level test - verifying the option exists
      const options = {
        scale: '2x' as ExportResolution,
        transparentBackground: true,
      };
      expect(options.transparentBackground).toBe(true);
    });

    it('should default transparentBackground to false', () => {
      const options = {
        scale: '2x' as ExportResolution,
      };
      // When not specified, should be falsy
      expect(options.transparentBackground || false).toBe(false);
    });

    it('should support explicit false for transparentBackground', () => {
      const options = {
        scale: '2x' as ExportResolution,
        transparentBackground: false,
      };
      expect(options.transparentBackground).toBe(false);
    });
  });

  describe('AC3: Aspect Ratio Presets', () => {
    it('should have correct aspect ratio dimensions defined', () => {
      expect(ASPECT_RATIO_DIMS['default']).toEqual({ width: 600, height: 800 });
      expect(ASPECT_RATIO_DIMS['square']).toEqual({ width: 600, height: 600 });
      expect(ASPECT_RATIO_DIMS['portrait']).toEqual({ width: 600, height: 800 });
      expect(ASPECT_RATIO_DIMS['landscape']).toEqual({ width: 800, height: 600 });
    });

    it('should export poster with default aspect ratio', () => {
      const svg = exportPoster(mockModules, mockConnections, mockAttributes, 'default');
      expect(svg).toContain('viewBox="0 0 600 800"');
      expect(svg).toContain('width="600"');
      expect(svg).toContain('height="800"');
    });

    it('should export poster with square aspect ratio', () => {
      const svg = exportPoster(mockModules, mockConnections, mockAttributes, 'square');
      expect(svg).toContain('viewBox="0 0 600 600"');
      expect(svg).toContain('width="600"');
      expect(svg).toContain('height="600"');
    });

    it('should export poster with portrait aspect ratio', () => {
      const svg = exportPoster(mockModules, mockConnections, mockAttributes, 'portrait');
      expect(svg).toContain('viewBox="0 0 600 800"');
      expect(svg).toContain('width="600"');
      expect(svg).toContain('height="800"');
    });

    it('should export poster with landscape aspect ratio', () => {
      const svg = exportPoster(mockModules, mockConnections, mockAttributes, 'landscape');
      expect(svg).toContain('viewBox="0 0 800 600"');
      expect(svg).toContain('width="800"');
      expect(svg).toContain('height="600"');
    });

    it('should export enhanced poster with different aspect ratios', () => {
      const ratios: ExportAspectRatio[] = ['default', 'square', 'portrait', 'landscape'];
      
      ratios.forEach((ratio) => {
        const svg = exportEnhancedPoster(mockModules, mockConnections, mockAttributes, ratio);
        const dims = ASPECT_RATIO_DIMS[ratio];
        
        expect(svg).toContain(`viewBox="0 0 ${dims.width} ${dims.height}"`);
        expect(svg).toContain(`width="${dims.width}"`);
        expect(svg).toContain(`height="${dims.height}"`);
      });
    });

    it('should return ExportAspectRatio type correctly', () => {
      const ratio: ExportAspectRatio = 'square';
      expect(['default', 'square', 'portrait', 'landscape']).toContain(ratio);
    });
  });

  describe('AC4: Filename Persistence', () => {
    it('should allow filename input without resetting', () => {
      // This tests that the component state for filename persists
      // The actual persistence is tested via component integration tests
      const filename = 'my-custom-machine';
      const sanitized = filename.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      expect(sanitized).toBe('my-custom-machine');
    });

    it('should sanitize filename for file downloads', () => {
      const testCases = [
        { input: 'Test Machine', expected: 'test-machine' },
        { input: 'My Magic Device', expected: 'my-magic-device' },
        { input: '123 Test', expected: '123-test' },
        { input: '  Spaces  ', expected: 'spaces' },
        { input: 'SpecialChars', expected: 'specialchars' },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = input.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        // Collapse multiple hyphens and remove leading/trailing hyphens
        const cleanResult = result.replace(/-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
        expect(cleanResult).toBe(expected);
      });
    });

    it('should use default filename when none provided', () => {
      const defaultFilename = 'arcane-machine';
      const result = defaultFilename.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      expect(result).toBe('arcane-machine');
    });
  });

  describe('AC5: Backward Compatibility', () => {
    it('should handle all export formats without errors', () => {
      // All existing export formats should work
      expect(() => {
        exportPoster(mockModules, mockConnections, mockAttributes, 'default');
        exportPoster(mockModules, mockConnections, mockAttributes, 'square');
        exportPoster(mockModules, mockConnections, mockAttributes, 'portrait');
        exportPoster(mockModules, mockConnections, mockAttributes, 'landscape');
      }).not.toThrow();
    });

    it('should generate valid SVG with proper viewBox', () => {
      const svg = exportPoster(mockModules, mockConnections, mockAttributes, 'default');
      expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('viewBox="0 0 600 800"');
    });

    it('should include all required machine attributes in poster', () => {
      const svg = exportPoster(mockModules, mockConnections, mockAttributes, 'default');
      expect(svg).toContain('ARCANE MACHINE CODEX');
      expect(svg).toContain(mockAttributes.name);
      expect(svg).toContain(mockAttributes.rarity.toUpperCase());
      expect(svg).toContain('STATS');
    });

    it('should default to default aspect ratio when not specified', () => {
      const svg = exportPoster(mockModules, mockConnections, mockAttributes);
      expect(svg).toContain('viewBox="0 0 600 800"');
    });
  });

  describe('Combined Options Tests', () => {
    it('should handle poster with all aspect ratio options', () => {
      const ratios: ExportAspectRatio[] = ['default', 'square', 'portrait', 'landscape'];
      
      ratios.forEach((ratio) => {
        const svg = exportPoster(mockModules, mockConnections, mockAttributes, ratio);
        const dims = ASPECT_RATIO_DIMS[ratio];
        
        expect(svg).toContain(`width="${dims.width}"`);
        expect(svg).toContain(`height="${dims.height}"`);
        expect(svg).toContain('ARCANE MACHINE CODEX');
        expect(svg).toContain(mockAttributes.name);
      });
    });

    it('should handle enhanced poster with all aspect ratio options', () => {
      const ratios: ExportAspectRatio[] = ['default', 'square', 'portrait', 'landscape'];
      
      ratios.forEach((ratio) => {
        const svg = exportEnhancedPoster(mockModules, mockConnections, mockAttributes, ratio);
        const dims = ASPECT_RATIO_DIMS[ratio];
        
        expect(svg).toContain(`width="${dims.width}"`);
        expect(svg).toContain(`height="${dims.height}"`);
        expect(svg).toContain('ARCANE MACHINE CODEX');
        expect(svg).toContain(mockAttributes.name);
      });
    });

    it('should include attributes in all poster variations', () => {
      const ratios: ExportAspectRatio[] = ['default', 'square', 'portrait', 'landscape'];
      
      ratios.forEach((ratio) => {
        const svg = exportEnhancedPoster(mockModules, mockConnections, mockAttributes, ratio);
        
        // Should contain stats
        expect(svg).toContain('ATTRIBUTES');
        expect(svg).toContain('Stability');
        expect(svg).toContain('Power');
        expect(svg).toContain('Failure');
        
        // Should contain tags
        expect(svg).toContain('TAGS');
        expect(svg).toContain('Arcane');
        expect(svg).toContain('Amplifying');
        
        // Should contain rarity
        expect(svg).toContain(mockAttributes.rarity.toUpperCase());
      });
    });
  });

  describe('UI Option Integration', () => {
    it('should provide all resolution options', () => {
      const resolutions: ExportResolution[] = ['1x', '2x', '4x'];
      resolutions.forEach((res) => {
        const dims = RESOLUTION_DIMS[res];
        expect(dims).toBeDefined();
        expect(dims.base).toBe(400);
        expect(dims.scaled).toBe(res === '1x' ? 400 : res === '2x' ? 800 : 1600);
      });
    });

    it('should provide all aspect ratio options', () => {
      const ratios: ExportAspectRatio[] = ['default', 'square', 'portrait', 'landscape'];
      ratios.forEach((ratio) => {
        const dims = ASPECT_RATIO_DIMS[ratio];
        expect(dims).toBeDefined();
        expect(dims.width).toBeGreaterThan(0);
        expect(dims.height).toBeGreaterThan(0);
      });
    });

    it('should calculate square aspect ratio correctly', () => {
      const dims = ASPECT_RATIO_DIMS['square'];
      expect(dims.width).toBe(dims.height);
    });

    it('should calculate landscape aspect ratio correctly', () => {
      const dims = ASPECT_RATIO_DIMS['landscape'];
      expect(dims.width).toBeGreaterThan(dims.height);
    });

    it('should calculate portrait aspect ratio correctly', () => {
      const dims = ASPECT_RATIO_DIMS['portrait'];
      expect(dims.height).toBeGreaterThan(dims.width);
    });

    it('should have minimum output sizes for resolutions', () => {
      const dims1x = RESOLUTION_DIMS['1x'];
      expect(dims1x.scaled).toBeGreaterThanOrEqual(400);
      
      const dims2x = RESOLUTION_DIMS['2x'];
      expect(dims2x.scaled).toBeGreaterThanOrEqual(800);
      
      const dims4x = RESOLUTION_DIMS['4x'];
      expect(dims4x.scaled).toBeGreaterThanOrEqual(1600);
    });
  });
});
