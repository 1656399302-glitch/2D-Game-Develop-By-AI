/**
 * Canvas Size Utilities
 * 
 * Provides robust cross-environment canvas sizing for reliable viewport culling.
 * Handles both real browsers and headless testing environments (Playwright).
 */

import { useEffect, useState, useRef } from 'react';

// Default dimensions - used as fallback when container size cannot be determined
export const DEFAULT_CANVAS_WIDTH = 800;
export const DEFAULT_CANVAS_HEIGHT = 600;

// Safe margin to ensure modules near origin are visible even with uncertain viewport
const SAFE_VIEWPORT_MARGIN = 100;

/**
 * Get canvas dimensions using multiple detection methods
 * Ensures modules are visible even when resize detection fails
 */
export function getCanvasDimensions(
  containerRef: React.RefObject<HTMLElement | null>,
  svgRef: React.RefObject<SVGSVGElement | null>
): { width: number; height: number } {
  // Method 1: Container bounding rect (most accurate for our use case)
  if (containerRef.current) {
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return { width: rect.width, height: rect.height };
    }
  }

  // Method 2: SVG bounding rect (fallback)
  if (svgRef.current) {
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return { width: rect.width, height: rect.height };
    }
  }

  // Method 3: Container client dimensions (sometimes available when rect is not)
  if (containerRef.current) {
    if (containerRef.current.clientWidth > 0 && containerRef.current.clientHeight > 0) {
      return {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      };
    }
  }

  // Fallback: Use defaults with safe margin for modules near origin
  return {
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
  };
}

/**
 * Calculate viewport bounds ensuring modules at origin are visible
 * 
 * @param viewport - Current viewport state
 * @param viewportSize - Canvas dimensions
 * @param bufferSize - Buffer zone around viewport (default: 50px per AC8)
 * @returns Viewport bounds with safe margins
 */
export function calculateSafeViewportBounds(
  viewport: { x: number; y: number; zoom: number },
  viewportSize: { width: number; height: number },
  bufferSize: number = 50
): {
  left: number;
  right: number;
  top: number;
  bottom: number;
  isDefaultFallback: boolean;
} {
  const { width, height } = viewportSize;

  // Handle edge case of zero or negative dimensions
  if (width <= 0 || height <= 0) {
    // Return bounds that ensure modules at origin (0,0) are visible
    return {
      left: -SAFE_VIEWPORT_MARGIN,
      right: DEFAULT_CANVAS_WIDTH + SAFE_VIEWPORT_MARGIN,
      top: -SAFE_VIEWPORT_MARGIN,
      bottom: DEFAULT_CANVAS_HEIGHT + SAFE_VIEWPORT_MARGIN,
      isDefaultFallback: true,
    };
  }

  // Normal calculation
  return {
    left: -viewport.x / viewport.zoom - bufferSize,
    right: (width - viewport.x) / viewport.zoom + bufferSize,
    top: -viewport.y / viewport.zoom - bufferSize,
    bottom: (height - viewport.y) / viewport.zoom + bufferSize,
    isDefaultFallback: false,
  };
}

/**
 * Check if viewport size is a valid/known size (not a default fallback)
 */
export function isValidViewportSize(
  width: number,
  height: number
): boolean {
  // Consider sizes > 0 as valid
  return width > 0 && height > 0;
}

/**
 * Check if viewport appears to be using default fallback dimensions
 */
export function isUsingDefaultFallback(
  width: number,
  height: number
): boolean {
  return (
    width === DEFAULT_CANVAS_WIDTH &&
    height === DEFAULT_CANVAS_HEIGHT
  );
}

/**
 * Hook for robust viewport size management
 * 
 * Features:
 * - Multiple dimension detection methods
 * - ResizeObserver with fallback
 * - Safe defaults for edge cases
 * - Manual update trigger for testing
 * 
 * @param containerRef - Ref to the container element
 * @param svgRef - Ref to the SVG element
 * @returns Viewport dimensions with metadata
 */
export function useViewportSize(
  containerRef: React.RefObject<HTMLElement | null>,
  svgRef: React.RefObject<SVGSVGElement | null>
) {
  const [viewportSize, setViewportSize] = useState<{
    width: number;
    height: number;
    isDefaultFallback: boolean;
    source: 'initial' | 'container' | 'svg' | 'fallback';
  }>({
    width: DEFAULT_CANVAS_WIDTH,
    height: DEFAULT_CANVAS_HEIGHT,
    isDefaultFallback: true,
    source: 'initial',
  });

  // Manual update trigger for testing
  const forceUpdateRef = useRef<() => void>(() => {
    const dims = getCanvasDimensions(containerRef, svgRef);
    const isFallback = isUsingDefaultFallback(dims.width, dims.height);
    setViewportSize({
      width: dims.width,
      height: dims.height,
      isDefaultFallback: isFallback,
      source: isFallback ? 'fallback' : 'container',
    });
  });

  useEffect(() => {
    // Initial measurement
    forceUpdateRef.current();

    // Set up ResizeObserver
    let resizeObserver: ResizeObserver | null = null;

    const setupObserver = () => {
      if (!containerRef.current) return;

      try {
        resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
              setViewportSize({
                width,
                height,
                isDefaultFallback: false,
                source: 'container',
              });
            }
          }
        });

        resizeObserver.observe(containerRef.current);
      } catch (error) {
        // ResizeObserver not supported or failed - will use fallback
        console.warn('ResizeObserver not available, using fallback dimensions');
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(setupObserver, 0);

    // Also listen to window resize as backup
    const handleWindowResize = () => {
      forceUpdateRef.current();
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleWindowResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [containerRef, svgRef]);

  return viewportSize;
}

/**
 * Create a stable dimension updater function
 * Can be called manually or from ResizeObserver
 */
export function createDimensionUpdater(
  setViewportSize: React.Dispatch<React.SetStateAction<{
    width: number;
    height: number;
    isDefaultFallback: boolean;
    source: 'initial' | 'container' | 'svg' | 'fallback';
  }>>,
  containerRef: React.RefObject<HTMLElement | null>,
  svgRef: React.RefObject<SVGSVGElement | null>
): () => void {
  return () => {
    const dims = getCanvasDimensions(containerRef, svgRef);
    const isFallback = isUsingDefaultFallback(dims.width, dims.height);
    
    setViewportSize({
      width: dims.width,
      height: dims.height,
      isDefaultFallback: isFallback,
      source: isFallback ? 'fallback' : (containerRef.current ? 'container' : 'svg'),
    });
  };
}

/**
 * Test utility: Simulate viewport size update
 * Useful for testing viewport culling logic
 */
export function createTestViewportSize(
  width: number,
  height: number
): { width: number; height: number; isDefaultFallback: boolean; source: 'test' } {
  return {
    width,
    height,
    isDefaultFallback: isUsingDefaultFallback(width, height),
    source: 'test' as const,
  };
}
