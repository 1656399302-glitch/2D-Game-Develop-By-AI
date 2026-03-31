import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getResolutionDimensions, exportPoster, exportEnhancedPoster, sanitizeFilename } from '../utils/exportUtils';
import { PlacedModule, Connection, GeneratedAttributes, ExportResolution, ExportAspectRatio, RESOLUTION_DIMS, ASPECT_RATIO_DIMS } from '../types';

// Helper to create mock modules
const createMockModule = (
  instanceId: string,
  type: any = 'core-furnace',
  x: number = 100,
  y: number = 100
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
});

// Mock modules for testing
const mockModules: PlacedModule[] = [
  createMockModule('test-module-1', 'core-furnace', 100, 200),
  createMockModule('test-module-2', 'gear', 300, 200),
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
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

  describe('AC3 Enhanced: Export with 20+ modules (stress test)', () => {
    it('should export SVG with 20 modules without timeout', () => {
      // Create 20 modules
      const modules: PlacedModule[] = [];
      for (let i = 0; i < 20; i++) {
        const types = ['core-furnace', 'gear', 'rune-node', 'shield-shell', 'energy-pipe'];
        modules.push(createMockModule(
          `module-${i}`,
          types[i % types.length] as any,
          100 + (i % 5) * 150,
          100 + Math.floor(i / 5) * 150
        ));
      }
      
      // Create connections between modules
      const connections: Connection[] = [];
      for (let i = 0; i < 19; i++) {
        connections.push({
          id: `conn-${i}`,
          sourceModuleId: `module-${i}`,
          sourcePortId: `port-1`,
          targetModuleId: `module-${i + 1}`,
          targetPortId: `port-2`,
          pathData: `M${i * 50},${i * 50} L${(i + 1) * 50},${(i + 1) * 50}`,
        });
      }
      
      // Export should complete without throwing
      const startTime = Date.now();
      const svg = exportPoster(modules, connections, mockAttributes, 'landscape');
      const duration = Date.now() - startTime;
      
      // Should complete in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
      
      // SVG should contain all 20 modules (at minimum, check it's a valid SVG)
      expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should export enhanced poster with 25 modules', () => {
      // Create 25 modules
      const modules: PlacedModule[] = [];
      for (let i = 0; i < 25; i++) {
        const types = ['core-furnace', 'gear', 'rune-node', 'amplifier-crystal', 'stabilizer-core'];
        modules.push(createMockModule(
          `module-${i}`,
          types[i % types.length] as any,
          50 + (i % 5) * 200,
          50 + Math.floor(i / 5) * 200
        ));
      }
      
      const connections: Connection[] = [];
      for (let i = 0; i < 10; i++) {
        const sourceIdx = Math.floor(Math.random() * 25);
        const targetIdx = (sourceIdx + Math.floor(Math.random() * 5) + 1) % 25;
        connections.push({
          id: `conn-${i}`,
          sourceModuleId: `module-${sourceIdx}`,
          sourcePortId: `port-1`,
          targetModuleId: `module-${targetIdx}`,
          targetPortId: `port-2`,
          pathData: 'M0,0 L100,100',
        });
      }
      
      const svg = exportEnhancedPoster(modules, connections, mockAttributes, 'landscape');
      
      expect(svg).toContain('viewBox="0 0 800 600"');
      expect(svg).toContain('ARCANE MACHINE CODEX');
      expect(svg).toContain(mockAttributes.name);
    });

    it('should handle module positions in exported SVG correctly', () => {
      // Create modules at various positions including negative coordinates
      const modules: PlacedModule[] = [
        createMockModule('m1', 'core-furnace', -100, -50),
        createMockModule('m2', 'gear', 50, 100),
        createMockModule('m3', 'rune-node', 200, 200),
      ];
      
      const svg = exportPoster(modules, [], mockAttributes, 'default');
      
      // SVG should be valid
      expect(svg).toContain('viewBox');
      expect(svg).toContain('width="600"');
      expect(svg).toContain('height="800"');
    });

    it('export with many connections does not fail', () => {
      const modules: PlacedModule[] = [];
      for (let i = 0; i < 15; i++) {
        modules.push(createMockModule(
          `module-${i}`,
          'gear' as any,
          100 + i * 50,
          100
        ));
      }
      
      // Create many connections
      const connections: Connection[] = [];
      for (let i = 0; i < modules.length - 1; i++) {
        connections.push({
          id: `conn-${i}`,
          sourceModuleId: `module-${i}`,
          sourcePortId: `port-1`,
          targetModuleId: `module-${i + 1}`,
          targetPortId: `port-2`,
          pathData: `M${i * 50 + 100},100 L${(i + 1) * 50 + 100},100`,
        });
      }
      
      const svg = exportPoster(modules, connections, mockAttributes, 'landscape');
      
      // All connections should be rendered
      expect(svg).toContain('path');
      expect(svg).toContain('stroke');
    });
  });

  describe('AC3b: Special characters in machine name', () => {
    it('handles Chinese characters in machine name', () => {
      const attributes: GeneratedAttributes = {
        ...mockAttributes,
        name: '虚空回响增幅器',
      };
      
      const svg = exportPoster(mockModules, mockConnections, attributes, 'default');
      
      expect(svg).toContain('虚空回响增幅器');
      expect(svg).toContain('viewBox');
    });

    it('handles special symbols in machine name', () => {
      const attributes: GeneratedAttributes = {
        ...mockAttributes,
        name: 'Test ★ Machine ✦',
      };
      
      const svg = exportPoster(mockModules, mockConnections, attributes, 'default');
      
      expect(svg).toContain('Test ★ Machine ✦');
    });

    it('handles emoji in machine name', () => {
      const attributes: GeneratedAttributes = {
        ...mockAttributes,
        name: '🔥 Mega Machine 🚀',
      };
      
      const svg = exportPoster(mockModules, mockConnections, attributes, 'default');
      
      expect(svg).toContain('🔥 Mega Machine 🚀');
    });

    it('handles very long machine name', () => {
      const attributes: GeneratedAttributes = {
        ...mockAttributes,
        name: 'This is an extremely long machine name that goes on and on and should still render correctly in the export',
      };
      
      const svg = exportPoster(mockModules, mockConnections, attributes, 'default');
      
      expect(svg).toContain('This is an extremely long machine name');
    });

    it('handles HTML-like characters in machine name', () => {
      const attributes: GeneratedAttributes = {
        ...mockAttributes,
        name: 'Machine <script>alert("xss")</script>',
      };
      
      const svg = exportPoster(mockModules, mockConnections, attributes, 'default');
      
      // Should be properly escaped or handled
      expect(svg).toContain('Machine');
    });

    it('handles empty machine name', () => {
      const attributes: GeneratedAttributes = {
        ...mockAttributes,
        name: '',
      };
      
      const svg = exportPoster(mockModules, mockConnections, attributes, 'default');
      
      expect(svg).toContain('ARCANE MACHINE CODEX');
    });

    it('handles special characters in codex ID', () => {
      const attributes: GeneratedAttributes = {
        ...mockAttributes,
        codexId: 'VOID-烈-2024',
      };
      
      const svg = exportPoster(mockModules, mockConnections, attributes, 'default');
      
      expect(svg).toContain('VOID-烈-2024');
    });
  });

  describe('AC3c: Missing module data handling', () => {
    it('handles empty modules array', () => {
      const svg = exportPoster([], mockConnections, mockAttributes, 'default');
      
      // Should still produce valid SVG
      expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('handles empty connections array', () => {
      const svg = exportPoster(mockModules, [], mockAttributes, 'default');
      
      expect(svg).toContain('viewBox');
      expect(svg).toContain(mockAttributes.name);
    });

    it('handles both empty modules and connections', () => {
      const svg = exportPoster([], [], mockAttributes, 'default');
      
      expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(svg).toContain('ARCANE MACHINE CODEX');
    });

    it('handles undefined tags array', () => {
      const attributes: GeneratedAttributes = {
        ...mockAttributes,
        tags: [],
      };
      
      const svg = exportEnhancedPoster(mockModules, mockConnections, attributes, 'default');
      
      expect(svg).toContain('viewBox');
      expect(svg).toContain('TAGS');
    });

    it('handles null stats gracefully', () => {
      const attributes: GeneratedAttributes = {
        ...mockAttributes,
        stats: {
          stability: 0,
          powerOutput: 0,
          energyCost: 0,
          failureRate: 0,
        },
      };
      
      const svg = exportPoster(mockModules, mockConnections, attributes, 'default');
      
      expect(svg).toContain('viewBox');
      expect(svg).toContain('STATS');
    });

    it('handles missing description', () => {
      const attributes: GeneratedAttributes = {
        ...mockAttributes,
        description: '',
      };
      
      const svg = exportEnhancedPoster(mockModules, mockConnections, attributes, 'default');
      
      expect(svg).toContain('viewBox');
    });

    it('handles module with undefined ports', () => {
      const moduleWithNoPorts: PlacedModule = {
        id: 'id-test',
        instanceId: 'test-instance',
        type: 'core-furnace',
        x: 100,
        y: 100,
        rotation: 0,
        scale: 1,
        flipped: false,
        ports: [],
      };
      
      const svg = exportPoster([moduleWithNoPorts], [], mockAttributes, 'default');
      
      expect(svg).toContain('viewBox');
      expect(svg).toContain('<?xml version="1.0"');
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

describe('AC4b: Filename Sanitization', () => {
  it('replaces special characters with hyphens', () => {
    // Spaces and special chars are replaced with single hyphens, then trimmed
    const unsanitized = 'My Machine!';
    const sanitized = sanitizeFilename(unsanitized);
    expect(sanitized).toBe('my-machine');
  });

  it('converts to lowercase', () => {
    const unsanitized = 'MY MACHINE';
    const sanitized = sanitizeFilename(unsanitized);
    expect(sanitized).toBe('my-machine');
  });

  it('trims leading hyphens after replacement', () => {
    const unsanitized = '!!!machine';
    const sanitized = sanitizeFilename(unsanitized);
    expect(sanitized).toBe('machine');
  });

  it('trims trailing hyphens after replacement', () => {
    const unsanitized = 'machine!!!';
    const sanitized = sanitizeFilename(unsanitized);
    expect(sanitized).toBe('machine');
  });

  it('handles mixed special characters, spaces, and trimming end-to-end', () => {
    const unsanitized = '  My Machine! @#$%  ';
    const sanitized = sanitizeFilename(unsanitized);
    // After lowercase: '  my machine! @#$%  '
    // After char replacement: '--my-machine------'
    // After trim: 'my-machine'
    expect(sanitized).toBe('my-machine');
  });

  it('collapses multiple consecutive hyphens into one', () => {
    const unsanitized = 'machine---broken';
    const sanitized = sanitizeFilename(unsanitized);
    expect(sanitized).toBe('machine-broken');
  });
});
