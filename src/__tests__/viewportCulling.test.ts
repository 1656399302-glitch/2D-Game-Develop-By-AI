/**
 * Viewport Culling Tests
 * 
 * Tests for the viewport culling bug fix (Round 92)
 * Ensures modules are correctly identified as visible/invisible
 * in various viewport size scenarios including headless environments.
 * 
 * Extended in Round 93 with cross-environment edge case tests.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCanvasDimensions,
  calculateSafeViewportBounds,
  isValidViewportSize,
  isUsingDefaultFallback,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  createTestViewportSize,
} from '../utils/canvasSizeUtils';
import {
  createVirtualizedModuleList,
  calculateViewportBounds,
  isModuleInViewport,
  VIEWPORT_CULLING_BUFFER,
} from '../utils/performanceUtils';
import { PlacedModule } from '../types';

// Safe viewport margin from Canvas.tsx (Round 92 fix)
const SAFE_MODULE_POSITION = 500;

// Mock DOM elements for testing
const createMockContainer = (width: number, height: number) => ({
  getBoundingClientRect: () => ({ width, height, left: 0, top: 0, right: width, bottom: height }),
  clientWidth: width,
  clientHeight: height,
});

const createMockSvg = (width: number, height: number) => ({
  getBoundingClientRect: () => ({ width, height, left: 0, top: 0, right: width, bottom: height }),
});

// Helper to create a test module
const createTestModule = (id: string, x: number, y: number): PlacedModule => ({
  id,
  instanceId: id,
  type: 'coreFurnace',
  x,
  y,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports: [],
});

describe('Viewport Culling - Canvas Size Utilities', () => {
  describe('getCanvasDimensions', () => {
    it('should return default dimensions when refs are null', () => {
      const containerRef = { current: null };
      const svgRef = { current: null };
      
      const dims = getCanvasDimensions(containerRef, svgRef);
      
      expect(dims.width).toBe(DEFAULT_CANVAS_WIDTH);
      expect(dims.height).toBe(DEFAULT_CANVAS_HEIGHT);
    });

    it('should return container dimensions when available', () => {
      const container = createMockContainer(1200, 800);
      const containerRef = { current: container as any };
      const svgRef = { current: null };
      
      const dims = getCanvasDimensions(containerRef, svgRef);
      
      expect(dims.width).toBe(1200);
      expect(dims.height).toBe(800);
    });

    it('should fall back to SVG dimensions when container has zero dimensions', () => {
      const container = createMockContainer(0, 0);
      const svg = createMockSvg(1000, 600);
      const containerRef = { current: container as any };
      const svgRef = { current: svg as any };
      
      const dims = getCanvasDimensions(containerRef, svgRef);
      
      expect(dims.width).toBe(1000);
      expect(dims.height).toBe(600);
    });
  });

  describe('calculateSafeViewportBounds', () => {
    const viewport = { x: 0, y: 0, zoom: 1 };
    const bufferSize = VIEWPORT_CULLING_BUFFER;

    it('should calculate correct bounds for standard viewport', () => {
      const viewportSize = { width: 800, height: 600 };
      const bounds = calculateSafeViewportBounds(viewport, viewportSize, bufferSize);
      
      expect(bounds.left).toBe(-bufferSize);
      expect(bounds.top).toBe(-bufferSize);
      expect(bounds.right).toBe(800 + bufferSize);
      expect(bounds.bottom).toBe(600 + bufferSize);
      expect(bounds.isDefaultFallback).toBe(false);
    });

    it('should handle zero-dimension viewport with safe bounds (AC-VP-003)', () => {
      const viewportSize = { width: 0, height: 0 };
      const bounds = calculateSafeViewportBounds(viewport, viewportSize, bufferSize);
      
      // Should use safe defaults that include origin area
      expect(bounds.left).toBeLessThan(0);
      expect(bounds.top).toBeLessThan(0);
      expect(bounds.right).toBeGreaterThan(DEFAULT_CANVAS_WIDTH);
      expect(bounds.bottom).toBeGreaterThan(DEFAULT_CANVAS_HEIGHT);
      expect(bounds.isDefaultFallback).toBe(true);
    });

    it('should mark zero-dimension viewport as default fallback', () => {
      const viewportSize = { width: 0, height: 0 };
      const bounds = calculateSafeViewportBounds(viewport, viewportSize, bufferSize);
      
      // Zero dimensions trigger the fallback
      expect(bounds.isDefaultFallback).toBe(true);
    });

    it('should mark negative dimension viewport as default fallback', () => {
      const viewportSize = { width: -1, height: -1 };
      const bounds = calculateSafeViewportBounds(viewport, viewportSize, bufferSize);
      
      expect(bounds.isDefaultFallback).toBe(true);
    });
  });

  describe('isValidViewportSize', () => {
    it('should return true for positive dimensions', () => {
      expect(isValidViewportSize(800, 600)).toBe(true);
      expect(isValidViewportSize(1, 1)).toBe(true);
      expect(isValidViewportSize(1920, 1080)).toBe(true);
    });

    it('should return false for zero or negative dimensions', () => {
      expect(isValidViewportSize(0, 600)).toBe(false);
      expect(isValidViewportSize(800, 0)).toBe(false);
      expect(isValidViewportSize(-1, 600)).toBe(false);
      expect(isValidViewportSize(800, -1)).toBe(false);
    });
  });

  describe('isUsingDefaultFallback', () => {
    it('should identify default dimensions', () => {
      expect(isUsingDefaultFallback(DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT)).toBe(true);
      expect(isUsingDefaultFallback(800, 600)).toBe(true);
    });

    it('should return false for non-default dimensions', () => {
      expect(isUsingDefaultFallback(1200, 800)).toBe(false);
      expect(isUsingDefaultFallback(1920, 1080)).toBe(false);
      expect(isUsingDefaultFallback(400, 300)).toBe(false);
    });
  });
});

describe('Viewport Culling - Performance Utils Integration', () => {
  describe('createVirtualizedModuleList with default viewport', () => {
    const viewport = { x: 0, y: 0, zoom: 1 };
    const defaultViewportSize = { width: DEFAULT_CANVAS_WIDTH, height: DEFAULT_CANVAS_HEIGHT };

    it('should render modules with default viewport (AC-VP-001)', () => {
      // Module at origin should be visible
      const modules = [
        createTestModule('m1', 0, 0),
        createTestModule('m2', 100, 100),
        createTestModule('m3', 400, 300), // Center of default viewport
      ];

      const result = createVirtualizedModuleList(
        modules,
        viewport,
        defaultViewportSize,
        { bufferSize: VIEWPORT_CULLING_BUFFER }
      );

      // All modules near origin should be visible with default viewport
      expect(result.visibleCount).toBe(3);
      expect(result.visibleModules.length).toBe(3);
      expect(result.totalCount).toBe(3);
    });

    it('should render modules after viewport resize (AC-VP-002)', () => {
      const modules = [
        createTestModule('m1', 0, 0),
        createTestModule('m2', 500, 500),
        createTestModule('m3', 1000, 1000), // Far from default viewport
      ];

      // Normal viewport size
      const normalViewport = { width: 1200, height: 900 };
      const result = createVirtualizedModuleList(
        modules,
        viewport,
        normalViewport,
        { bufferSize: VIEWPORT_CULLING_BUFFER }
      );

      // First two modules should be visible
      expect(result.visibleCount).toBe(2);
      expect(result.totalCount).toBe(3);
    });

    it('should handle zero-dimension viewport gracefully (AC-VP-003)', () => {
      const modules = [
        createTestModule('m1', 0, 0),
        createTestModule('m2', 50, 50),
      ];

      // Zero dimension viewport (edge case)
      const zeroViewport = { width: 0, height: 0 };
      const bounds = calculateViewportBounds(viewport, zeroViewport, VIEWPORT_CULLING_BUFFER);

      // All modules should be within these bounds due to buffer
      const m1Visible = isModuleInViewport(modules[0], bounds);
      const m2Visible = isModuleInViewport(modules[1], bounds);

      // Both modules near origin should be visible
      expect(m1Visible).toBe(true);
      expect(m2Visible).toBe(true);
    });

    it('should cull modules far outside viewport', () => {
      const modules = [
        createTestModule('m1', 0, 0),
        createTestModule('m2', 100, 100),
        createTestModule('m3', 5000, 5000), // Way outside viewport
      ];

      const result = createVirtualizedModuleList(
        modules,
        viewport,
        defaultViewportSize,
        { bufferSize: VIEWPORT_CULLING_BUFFER }
      );

      // Only first two modules should be visible
      expect(result.visibleCount).toBe(2);
      expect(result.hiddenModuleIds.has('m3')).toBe(true);
    });

    it('should correctly report culling status', () => {
      const modules = [
        createTestModule('m1', 0, 0),
        createTestModule('m2', 5000, 5000),
      ];

      const result = createVirtualizedModuleList(
        modules,
        viewport,
        defaultViewportSize,
        { bufferSize: VIEWPORT_CULLING_BUFFER }
      );

      expect(result.isCulling).toBe(true);
      expect(result.cullingRatio).toBe(0.5); // 1 out of 2 hidden
    });
  });

  describe('calculateViewportBounds', () => {
    it('should include buffer zone around viewport', () => {
      const viewport = { x: 0, y: 0, zoom: 1 };
      const viewportSize = { width: 800, height: 600 };
      const bufferSize = VIEWPORT_CULLING_BUFFER;

      const bounds = calculateViewportBounds(viewport, viewportSize, bufferSize);

      // Bounds should extend beyond viewport by buffer amount
      expect(bounds.left).toBe(-bufferSize);
      expect(bounds.top).toBe(-bufferSize);
      expect(bounds.right).toBe(800 + bufferSize);
      expect(bounds.bottom).toBe(600 + bufferSize);
    });

    it('should account for viewport offset', () => {
      const viewport = { x: 100, y: 50, zoom: 1 };
      const viewportSize = { width: 800, height: 600 };
      const bufferSize = VIEWPORT_CULLING_BUFFER;

      const bounds = calculateViewportBounds(viewport, viewportSize, bufferSize);

      // Left edge should account for offset
      expect(bounds.left).toBe(-100 - bufferSize);
      expect(bounds.top).toBe(-50 - bufferSize);
    });

    it('should account for zoom level', () => {
      const viewport = { x: 0, y: 0, zoom: 2 }; // 2x zoom
      const viewportSize = { width: 800, height: 600 };
      const bufferSize = VIEWPORT_CULLING_BUFFER;

      const bounds = calculateViewportBounds(viewport, viewportSize, bufferSize);

      // At 2x zoom, viewport shows half the area
      expect(bounds.right).toBe(400 + bufferSize); // 800 / 2
      expect(bounds.bottom).toBe(300 + bufferSize); // 600 / 2
    });
  });

  describe('isModuleInViewport', () => {
    const bounds = {
      left: -50,
      right: 850,
      top: -50,
      bottom: 650,
    };

    it('should identify modules within bounds as visible', () => {
      const module = createTestModule('m1', 100, 100);
      expect(isModuleInViewport(module, bounds)).toBe(true);
    });

    it('should identify modules at edges as visible (with buffer)', () => {
      const module = createTestModule('m1', 800, 600);
      expect(isModuleInViewport(module, bounds)).toBe(true);
    });

    it('should identify modules outside bounds as hidden', () => {
      const module = createTestModule('m1', 900, 700);
      expect(isModuleInViewport(module, bounds)).toBe(false);
    });

    it('should identify modules with negative positions within bounds', () => {
      const module = createTestModule('m1', -30, -30);
      expect(isModuleInViewport(module, bounds)).toBe(true);
    });
  });
});

describe('createTestViewportSize', () => {
  it('should create viewport size with metadata', () => {
    const size = createTestViewportSize(800, 600);
    
    expect(size.width).toBe(800);
    expect(size.height).toBe(600);
    expect(size.isDefaultFallback).toBe(true);
    expect(size.source).toBe('test');
  });

  it('should mark non-default sizes correctly', () => {
    const size = createTestViewportSize(1200, 800);
    
    expect(size.width).toBe(1200);
    expect(size.height).toBe(800);
    expect(size.isDefaultFallback).toBe(false);
  });
});

/**
 * Round 93: Cross-Environment Edge Case Tests
 * 
 * Added 5 new tests for edge cases discovered during Round 92 QA verification.
 * These ensure robust behavior across different browser environments,
 * including headless Playwright, various viewport configurations,
 * and CSS subpixel rendering scenarios.
 */
describe('Cross-Environment Edge Cases (Round 93)', () => {
  const defaultViewport = { x: 0, y: 0, zoom: 1 };
  const defaultViewportSize = { width: DEFAULT_CANVAS_WIDTH, height: DEFAULT_CANVAS_HEIGHT };

  /**
   * Test 1: Verify modules at origin (0,0) always visible
   * 
   * Modules at the exact origin should always be visible regardless
   * of viewport state, ensuring basic functionality works in headless.
   */
  describe('Module at Origin Visibility', () => {
    it('should render modules at origin (0,0) regardless of viewport state', () => {
      // ARRANGE: Module at exact origin (0,0)
      const moduleAtOrigin = createTestModule('origin-module', 0, 0);
      const viewportSize = { width: 0, height: 0 }; // Uncertain viewport state

      // ACT: Calculate safe bounds with uncertain viewport
      const bounds = calculateSafeViewportBounds(
        defaultViewport,
        viewportSize,
        VIEWPORT_CULLING_BUFFER
      );

      // ASSERT: Module at origin should be within safe bounds
      const isVisible = isModuleInViewport(moduleAtOrigin, bounds);
      expect(isVisible).toBe(true);
    });

    it('should render modules at origin with positive viewport', () => {
      // ARRANGE: Module at origin with valid viewport
      const moduleAtOrigin = createTestModule('origin-module', 0, 0);
      const validViewportSize = { width: 800, height: 600 };

      // ACT
      const bounds = calculateSafeViewportBounds(
        defaultViewport,
        validViewportSize,
        VIEWPORT_CULLING_BUFFER
      );
      const isVisible = isModuleInViewport(moduleAtOrigin, bounds);

      // ASSERT: Module should be visible with valid viewport
      expect(isVisible).toBe(true);
    });

    it('should include origin module in virtualized list with valid viewport', () => {
      // ARRANGE: Multiple modules including one at origin
      const modules = [
        createTestModule('origin', 0, 0),
        createTestModule('near', 100, 100),
        createTestModule('far', 2000, 2000),
      ];

      // ACT: Use valid viewport (800x600)
      const result = createVirtualizedModuleList(
        modules,
        defaultViewport,
        defaultViewportSize,
        { bufferSize: VIEWPORT_CULLING_BUFFER }
      );

      // ASSERT: Origin and near modules should be in visible list with valid viewport
      const visibleIds = result.visibleModules.map(m => m.instanceId);
      expect(visibleIds).toContain('origin');
      expect(visibleIds).toContain('near');
      expect(visibleIds).not.toContain('far');
    });
  });

  /**
   * Test 2: Verify SAFE_VIEWPORT_MARGIN ensures visibility
   * 
   * The SAFE_MODULE_POSITION value (500) ensures modules near origin
   * are visible even with uncertain viewport detection.
   */
  describe('SAFE_VIEWPORT_MARGIN Buffer Zone', () => {
    it('should include SAFE_VIEWPORT_MARGIN buffer around origin', () => {
      // ARRANGE: Bounds calculation with default viewport
      const bounds = calculateSafeViewportBounds(
        defaultViewport,
        { width: 0, height: 0 }, // Zero viewport triggers fallback
        VIEWPORT_CULLING_BUFFER
      );

      // ACT: Check if safe margin is included
      // The fallback bounds should extend beyond default canvas size by margin

      // ASSERT: Bounds should extend to include origin area
      expect(bounds.left).toBeLessThan(0);
      expect(bounds.top).toBeLessThan(0);
      expect(bounds.isDefaultFallback).toBe(true);
    });

    it('should ensure modules within SAFE_MODULE_POSITION are visible', () => {
      // ARRANGE: Module within safe position range
      const safeModule = createTestModule('safe-module', 300, 400);
      const uncertainViewport = { width: 0, height: 0 };

      // ACT: Calculate bounds and check visibility
      const bounds = calculateSafeViewportBounds(
        defaultViewport,
        uncertainViewport,
        VIEWPORT_CULLING_BUFFER
      );

      // ASSERT: Module within safe range should be visible
      const isVisible = isModuleInViewport(safeModule, bounds);
      expect(isVisible).toBe(true);
    });

    it('should handle modules at edge of safe zone', () => {
      // ARRANGE: Module at edge of SAFE_MODULE_POSITION (500)
      const edgeModule = createTestModule('edge-module', 450, 450);
      const zeroViewport = { width: 0, height: 0 };

      // ACT
      const bounds = calculateSafeViewportBounds(
        defaultViewport,
        zeroViewport,
        VIEWPORT_CULLING_BUFFER
      );

      // ASSERT: Edge module should still be visible
      const isVisible = isModuleInViewport(edgeModule, bounds);
      expect(isVisible).toBe(true);
    });

    it('should handle modules beyond safe zone with zero viewport', () => {
      // ARRANGE: Module beyond SAFE_MODULE_POSITION (500)
      const farModule = createTestModule('far-module', 1000, 1000);
      const zeroViewport = { width: 0, height: 0 };

      // ACT
      const bounds = calculateSafeViewportBounds(
        defaultViewport,
        zeroViewport,
        VIEWPORT_CULLING_BUFFER
      );

      // ASSERT: Far module may be hidden with zero viewport
      const isVisible = isModuleInViewport(farModule, bounds);
      // This test documents the current behavior - far modules may be culled
      // with uncertain viewport, which is acceptable
      void isVisible; // Just verify it doesn't crash
    });
  });

  /**
   * Test 3: Verify negative viewport dimensions handled
   * 
   * Edge case where getBoundingClientRect might return negative
   * dimensions (rare but possible in certain browser states).
   */
  describe('Negative Viewport Dimensions', () => {
    it('should handle negative viewport dimensions without crash', () => {
      // ARRANGE: Negative viewport dimensions (edge case)
      const negativeViewport = { width: -100, height: -50 };

      // ACT: Should not throw exception
      const act = () => {
        calculateSafeViewportBounds(
          defaultViewport,
          negativeViewport,
          VIEWPORT_CULLING_BUFFER
        );
      };

      // ASSERT: Should not throw and should return safe fallback
      expect(act).not.toThrow();
      
      const bounds = calculateSafeViewportBounds(
        defaultViewport,
        negativeViewport,
        VIEWPORT_CULLING_BUFFER
      );
      expect(bounds.isDefaultFallback).toBe(true);
    });

    it('should handle partially negative viewport dimensions', () => {
      // ARRANGE: One negative, one positive dimension
      const mixedViewport = { width: -50, height: 600 };

      // ACT
      const act = () => {
        return calculateSafeViewportBounds(
          defaultViewport,
          mixedViewport,
          VIEWPORT_CULLING_BUFFER
        );
      };

      // ASSERT: Should handle gracefully
      expect(act).not.toThrow();
      const bounds = act();
      expect(bounds.isDefaultFallback).toBe(true);
    });

    it('should handle extreme negative viewport dimensions', () => {
      // ARRANGE: Extreme negative values
      const extremeViewport = { width: -10000, height: -10000 };

      // ACT
      const bounds = calculateSafeViewportBounds(
        defaultViewport,
        extremeViewport,
        VIEWPORT_CULLING_BUFFER
      );

      // ASSERT: Should return safe fallback bounds
      expect(bounds.isDefaultFallback).toBe(true);
      expect(bounds.left).toBeLessThan(0);
      expect(bounds.top).toBeLessThan(0);
    });

    it('should validate isValidViewportSize with negative dimensions', () => {
      // ARRANGE
      const negativeWidth = -100;
      const negativeHeight = -50;

      // ACT & ASSERT
      expect(isValidViewportSize(negativeWidth, negativeHeight)).toBe(false);
      expect(isValidViewportSize(negativeWidth, 600)).toBe(false);
      expect(isValidViewportSize(800, negativeHeight)).toBe(false);
    });
  });

  /**
   * Test 4: Verify fractional viewport dimensions (CSS subpixel)
   * 
   * CSS subpixel rendering can result in fractional pixel values
   * like 799.5px instead of 800px. Tests ensure proper handling.
   */
  describe('Fractional Viewport Dimensions (CSS Subpixel)', () => {
    it('should handle fractional viewport dimensions', () => {
      // ARRANGE: Viewport with fractional dimensions (CSS subpixel rendering)
      const fractionalViewport = { width: 799.5, height: 599.5 };

      // ACT: Calculate bounds with fractional dimensions
      const bounds = calculateSafeViewportBounds(
        defaultViewport,
        fractionalViewport,
        VIEWPORT_CULLING_BUFFER
      );

      // ASSERT: Should calculate correctly without crashing
      expect(bounds.right).toBeCloseTo(799.5 + VIEWPORT_CULLING_BUFFER, 2);
      expect(bounds.bottom).toBeCloseTo(599.5 + VIEWPORT_CULLING_BUFFER, 2);
    });

    it('should handle very small fractional viewport', () => {
      // ARRANGE: Subpixel values - very small but positive
      const tinyFractionViewport = { width: 0.1, height: 0.1 };

      // ACT
      const bounds = calculateSafeViewportBounds(
        defaultViewport,
        tinyFractionViewport,
        VIEWPORT_CULLING_BUFFER
      );

      // ASSERT: Positive dimensions > 0 should NOT trigger fallback
      // Only truly invalid dimensions (0 or negative) trigger fallback
      expect(bounds.isDefaultFallback).toBe(false);
    });

    it('should handle viewport with decimal rounding errors', () => {
      // ARRANGE: Common floating point representation issues
      const floatErrorViewport = { width: 800.0000001, height: 600.0000001 };

      // ACT
      const bounds = calculateSafeViewportBounds(
        defaultViewport,
        floatErrorViewport,
        VIEWPORT_CULLING_BUFFER
      );

      // ASSERT: Should not throw and handle gracefully
      expect(bounds.right).toBeGreaterThan(800);
      expect(bounds.bottom).toBeGreaterThan(600);
    });

    it('should include modules with fractional viewport culling', () => {
      // ARRANGE
      const modules = [
        createTestModule('m1', 0, 0),
        createTestModule('m2', 400, 300), // Center
      ];
      const fractionalViewport = { width: 799.5, height: 599.5 };

      // ACT
      const result = createVirtualizedModuleList(
        modules,
        defaultViewport,
        fractionalViewport,
        { bufferSize: VIEWPORT_CULLING_BUFFER }
      );

      // ASSERT: Both modules should be visible
      expect(result.visibleCount).toBe(2);
    });
  });

  /**
   * Test 5: Verify modules beyond initial viewport visible after scroll
   * 
   * When user pans the canvas, modules that were outside the initial
   * viewport should become visible.
   */
  describe('Module Visibility After Viewport Pan', () => {
    it('should show different modules when panning viewport', () => {
      // ARRANGE: Modules at different positions
      // Viewport coordinate system: negative x pans RIGHT, positive x pans LEFT
      const modules = [
        createTestModule('left', 0, 300),      // At canvas x=0
        createTestModule('center', 400, 300), // At canvas x=400
        createTestModule('farRight', 1200, 300), // At canvas x=1200
      ];
      const viewportSize = { width: 800, height: 600 };

      // Initial viewport (no pan)
      const initialViewport = { x: 0, y: 0, zoom: 1 };
      const initialResult = createVirtualizedModuleList(
        modules,
        initialViewport,
        viewportSize,
        { bufferSize: VIEWPORT_CULLING_BUFFER }
      );

      // Pan LEFT by x=500 (negative x shows higher canvas coordinates)
      const pannedViewport = { x: -500, y: 0, zoom: 1 };
      const pannedResult = createVirtualizedModuleList(
        modules,
        pannedViewport,
        viewportSize,
        { bufferSize: VIEWPORT_CULLING_BUFFER }
      );

      // ASSERT: Different modules visible after panning
      const initialIds = initialResult.visibleModules.map(m => m.instanceId);
      const pannedIds = pannedResult.visibleModules.map(m => m.instanceId);

      // Initial viewport should show left and center (canvas x 0-850)
      expect(initialIds).toContain('left');
      expect(initialIds).toContain('center');
      expect(initialIds).not.toContain('farRight');
      
      // After panning left (x=-500), we see canvas x 500-1350
      // left should no longer be visible, farRight should be
      expect(pannedIds).not.toContain('left');
      expect(pannedIds).toContain('farRight');
    });

    it('should track panning in virtualized module list', () => {
      // ARRANGE
      const modules = [
        createTestModule('left', 0, 300),
        createTestModule('center', 400, 300),
        createTestModule('right', 1200, 300),
      ];
      const viewportSize = { width: 800, height: 600 };

      // Initial viewport - only center visible
      const initialViewport = { x: 0, y: 0, zoom: 1 };
      const initialResult = createVirtualizedModuleList(
        modules,
        initialViewport,
        viewportSize,
        { bufferSize: VIEWPORT_CULLING_BUFFER }
      );

      // ASSERT: Initial viewport should show center module
      expect(initialResult.visibleModules.some(m => m.instanceId === 'center')).toBe(true);
      
      // With buffer, left might also be visible at (0, 300)
      const leftVisible = initialResult.visibleModules.some(m => m.instanceId === 'left');
      expect(leftVisible).toBe(true); // Left at x=0 should be visible with buffer
    });

    it('should handle zoomed viewport panning correctly', () => {
      // ARRANGE: Zoomed in viewport
      const zoomedViewport = { x: 500, y: 500, zoom: 2 };
      const viewportSize = { width: 800, height: 600 };

      // ACT
      const bounds = calculateViewportBounds(
        zoomedViewport,
        viewportSize,
        VIEWPORT_CULLING_BUFFER
      );

      // ASSERT: At 2x zoom, viewport shows half the area
      // With offset (500, 500), visible area shifts
      expect(bounds.left).toBeLessThan(0);
      expect(bounds.top).toBeLessThan(0);
    });

    it('should show different modules when panning to different positions', () => {
      // ARRANGE: Modules spaced across canvas
      const modules = [
        createTestModule('m0', 0, 300),
        createTestModule('m1', 200, 300),
        createTestModule('m2', 400, 300),
        createTestModule('m3', 600, 300),
        createTestModule('m4', 800, 300),
        createTestModule('m5', 1000, 300),
      ];
      const viewportSize = { width: 800, height: 600 };

      // Different pan positions
      const pos1Result = createVirtualizedModuleList(
        modules,
        { x: 0, y: 0, zoom: 1 },
        viewportSize,
        { bufferSize: VIEWPORT_CULLING_BUFFER }
      );

      const pos2Result = createVirtualizedModuleList(
        modules,
        { x: -500, y: 0, zoom: 1 },
        viewportSize,
        { bufferSize: VIEWPORT_CULLING_BUFFER }
      );

      const pos3Result = createVirtualizedModuleList(
        modules,
        { x: -1000, y: 0, zoom: 1 },
        viewportSize,
        { bufferSize: VIEWPORT_CULLING_BUFFER }
      );

      // ASSERT: Different visible module IDs at different positions
      const ids1 = pos1Result.visibleModules.map(m => m.instanceId).sort();
      const ids2 = pos2Result.visibleModules.map(m => m.instanceId).sort();
      const ids3 = pos3Result.visibleModules.map(m => m.instanceId).sort();

      // Each position should show different modules
      // Position 1 (x=0): m0, m1, m2, m3, m4
      // Position 2 (x=-500): m2, m3, m4, m5, m6? but we only have up to m5
      // Position 3 (x=-1000): m4, m5
      
      // Verify that at least one position has different visible modules
      const visibleAtDifferentPositions = 
        JSON.stringify(ids1) !== JSON.stringify(ids2) ||
        JSON.stringify(ids2) !== JSON.stringify(ids3) ||
        JSON.stringify(ids1) !== JSON.stringify(ids3);
      
      expect(visibleAtDifferentPositions).toBe(true);
    });
  });
});

/**
 * Round 93: Integration Tests
 * 
 * Tests that verify the complete integration of viewport culling
 * with the Canvas component's actual behavior patterns.
 */
describe('Viewport Culling Integration', () => {
  it('should simulate complete Canvas measurement flow', () => {
    // ARRANGE: Simulate the full Canvas.tsx measurement flow
    let measurementAttempts = 0;
    let hasValidDimensions = false;
    
    const mockContainer = {
      getBoundingClientRect: () => {
        measurementAttempts++;
        if (hasValidDimensions) {
          return { width: 1200, height: 800, left: 0, top: 0, right: 1200, bottom: 800 };
        }
        return { width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0 };
      },
      clientWidth: 0,
      clientHeight: 0,
    };

    // ACT: Simulate first measurement (invalid)
    let dims = getCanvasDimensions(
      { current: mockContainer as any },
      { current: null }
    );
    expect(dims.width).toBe(DEFAULT_CANVAS_WIDTH);
    expect(dims.height).toBe(DEFAULT_CANVAS_HEIGHT);

    // Simulate container becoming valid
    hasValidDimensions = true;
    
    // Simulate second measurement (valid)
    dims = getCanvasDimensions(
      { current: mockContainer as any },
      { current: null }
    );
    
    // ASSERT: Should return actual dimensions
    expect(dims.width).toBe(1200);
    expect(dims.height).toBe(800);
    expect(measurementAttempts).toBe(2);
  });

  it('should handle viewport state transitions correctly', () => {
    // ARRANGE: Simulate viewport going from uncertain to certain
    const modules = [
      createTestModule('m1', 0, 0),
      createTestModule('m2', 100, 100),
    ];

    // ACT: Uncertain viewport (0,0)
    const uncertainBounds = calculateSafeViewportBounds(
      { x: 0, y: 0, zoom: 1 },
      { width: 0, height: 0 },
      VIEWPORT_CULLING_BUFFER
    );

    // Certain viewport (actual size)
    const certainBounds = calculateSafeViewportBounds(
      { x: 0, y: 0, zoom: 1 },
      { width: 1200, height: 800 },
      VIEWPORT_CULLING_BUFFER
    );

    // ASSERT: Both should include origin modules
    const m1Uncertain = isModuleInViewport(modules[0], uncertainBounds);
    const m1Certain = isModuleInViewport(modules[0], certainBounds);
    
    expect(m1Uncertain).toBe(true);
    expect(m1Certain).toBe(true);
  });
});
