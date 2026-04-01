/**
 * Viewport Culling Tests
 * 
 * Tests for the viewport culling bug fix (Round 92)
 * Ensures modules are correctly identified as visible/invisible
 * in various viewport size scenarios including headless environments.
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
