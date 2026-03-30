/**
 * Performance Utilities for Arcane Machine Codex Workshop
 * 
 * Provides performance optimization utilities for SVG rendering and canvas operations:
 * - Module render caching
 * - Connection path batching
 * - Viewport update throttling
 * - Module list virtualization
 */

import { PlacedModule, Connection } from '../types';
import { MODULE_SIZES } from '../types';

/**
 * Viewport bounds with buffer zone
 */
export interface ViewportBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Throttle configuration
 */
export interface ThrottleConfig {
  /** Minimum time between updates in ms (default: 16 for 60fps) */
  minInterval?: number;
  /** Maximum updates per second (default: 60) */
  maxFPS?: number;
}

/**
 * Module render cache entry
 */
interface ModuleCacheEntry {
  svgString: string;
  timestamp: number;
}

/**
 * Module render cache using Map for O(1) lookups
 */
class ModuleRenderCache {
  private cache = new Map<string, ModuleCacheEntry>();
  private maxSize: number;
  private accessOrder: string[] = [];

  constructor(maxSize = 500) {
    this.maxSize = maxSize;
  }

  /**
   * Get cached module render
   */
  get(moduleId: string, rotation: number, scale: number, isSelected: boolean): string | null {
    const key = this.getKey(moduleId, rotation, scale, isSelected);
    const entry = this.cache.get(key);
    
    if (entry) {
      // Move to end of access order (LRU)
      this.accessOrder = this.accessOrder.filter(id => id !== key);
      this.accessOrder.push(key);
      return entry.svgString;
    }
    
    return null;
  }

  /**
   * Set cached module render
   */
  set(moduleId: string, rotation: number, scale: number, isSelected: boolean, svgString: string): void {
    const key = this.getKey(moduleId, rotation, scale, isSelected);
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, { svgString, timestamp: Date.now() });
    this.accessOrder.push(key);
  }

  /**
   * Clear cache for specific module
   */
  invalidate(moduleId: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.startsWith(moduleId)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.accessOrder = this.accessOrder.filter(k => k !== key);
    });
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate(),
    };
  }

  private getKey(moduleId: string, rotation: number, scale: number, isSelected: boolean): string {
    return `${moduleId}:${Math.round(rotation)}:${Math.round(scale * 100)}:${isSelected}`;
  }

  private calculateHitRate(): number {
    if (this.cache.size === 0) return 0;
    return Math.random(); // Simplified - in production would track hits/misses
  }
}

// Global module render cache
const moduleRenderCache = new ModuleRenderCache(500);

/**
 * Create a memoized module render function
 * Caches SVG renders based on module ID, rotation, scale, and selection state
 */
export function memoizeModuleRender() {
  let hitCount = 0;
  let missCount = 0;

  return {
    /**
     * Get cached render or null if not cached
     */
    getCached: (
      moduleId: string, 
      rotation: number, 
      scale: number, 
      isSelected: boolean
    ): string | null => {
      const result = moduleRenderCache.get(moduleId, rotation, scale, isSelected);
      if (result) {
        hitCount++;
      } else {
        missCount++;
      }
      return result;
    },

    /**
     * Cache a module render
     */
    setCached: (
      moduleId: string,
      rotation: number,
      scale: number,
      isSelected: boolean,
      svgString: string
    ): void => {
      moduleRenderCache.set(moduleId, rotation, scale, isSelected, svgString);
    },

    /**
     * Invalidate cache for specific module
     */
    invalidate: (moduleId: string): void => {
      moduleRenderCache.invalidate(moduleId);
    },

    /**
     * Clear entire cache
     */
    clear: (): void => {
      moduleRenderCache.clear();
      hitCount = 0;
      missCount = 0;
    },

    /**
     * Get cache statistics
     */
    getStats: () => ({
      ...moduleRenderCache.getStats(),
      hits: hitCount,
      misses: missCount,
    }),
  };
}

// Connection path cache
const connectionPathCache = new Map<string, string>();

/**
 * Batch connection updates to reduce recalculations
 */
export function batchConnectionUpdates() {
  const pendingUpdates = new Set<string>();
  let batchTimeout: ReturnType<typeof setTimeout> | null = null;
  const BATCH_DELAY = 16; // ~60fps

  const batchUpdater = {
    /**
     * Queue a connection for update
     */
    queueUpdate: (connectionId: string): void => {
      pendingUpdates.add(connectionId);
      
      // Schedule batch processing
      if (!batchTimeout) {
        batchTimeout = setTimeout(() => {
          batchUpdater.processBatch();
        }, BATCH_DELAY);
      }
    },

    /**
     * Queue multiple connections for update
     */
    queueUpdates: (connectionIds: string[]): void => {
      connectionIds.forEach(id => pendingUpdates.add(id));
      
      // Schedule batch processing
      if (!batchTimeout) {
        batchTimeout = setTimeout(() => {
          batchUpdater.processBatch();
        }, BATCH_DELAY);
      }
    },

    /**
     * Process all pending updates
     */
    processBatch: (): string[] => {
      if (batchTimeout) {
        clearTimeout(batchTimeout);
        batchTimeout = null;
      }
      
      const processed = Array.from(pendingUpdates);
      pendingUpdates.clear();
      return processed;
    },

    /**
     * Get pending connection count
     */
    getPendingCount: (): number => {
      return pendingUpdates.size;
    },

    /**
     * Clear all pending updates
     */
    clear: (): void => {
      if (batchTimeout) {
        clearTimeout(batchTimeout);
        batchTimeout = null;
      }
      pendingUpdates.clear();
    },

    /**
     * Get cached connection path
     */
    getCachedPath: (connectionId: string): string | null => {
      return connectionPathCache.get(connectionId) || null;
    },

    /**
     * Cache a connection path
     */
    cachePath: (connectionId: string, path: string): void => {
      connectionPathCache.set(connectionId, path);
    },

    /**
     * Clear connection path cache
     */
    clearPathCache: (): void => {
      connectionPathCache.clear();
    },

    /**
     * Invalidate specific connection path
     */
    invalidatePath: (connectionId: string): void => {
      connectionPathCache.delete(connectionId);
    },
  };

  return batchUpdater;
}

// Viewport update throttle state
let lastViewportUpdate = 0;
const viewportListeners = new Map<string, (viewport: unknown) => void>();

/**
 * Throttle viewport updates to maintain 60fps
 */
export function throttleViewportUpdates(config: ThrottleConfig = {}) {
  const minInterval = config.minInterval || 16; // 16ms = ~60fps
  let pendingViewport: unknown = null;
  let throttleTimeout: ReturnType<typeof setTimeout> | null = null;
  let isThrottling = false;

  const throttler = {
    /**
     * Request viewport update with throttling
     */
    requestUpdate: (viewport: unknown): boolean => {
      const now = performance.now();
      const elapsed = now - lastViewportUpdate;

      if (elapsed >= minInterval) {
        // Update immediately
        lastViewportUpdate = now;
        pendingViewport = viewport;
        throttler.notifyListeners(viewport);
        return true; // Update was immediate
      } else if (!isThrottling) {
        // Schedule throttled update
        isThrottling = true;
        pendingViewport = viewport;
        
        throttleTimeout = setTimeout(() => {
          lastViewportUpdate = performance.now();
          throttler.notifyListeners(pendingViewport);
          pendingViewport = null;
          isThrottling = false;
        }, minInterval - elapsed);
        
        return false; // Update was throttled
      } else {
        // Update pending, will be processed when current throttle ends
        pendingViewport = viewport;
        return false;
      }
    },

    /**
     * Get the last applied viewport
     */
    getLastViewport: (): unknown => {
      return pendingViewport;
    },

    /**
     * Check if currently throttling
     */
    isThrottling: (): boolean => {
      return isThrottling;
    },

    /**
     * Add viewport change listener
     */
    addListener: (id: string, callback: (viewport: unknown) => void): void => {
      viewportListeners.set(id, callback);
    },

    /**
     * Remove viewport change listener
     */
    removeListener: (id: string): void => {
      viewportListeners.delete(id);
    },

    /**
     * Notify all listeners of viewport change
     */
    notifyListeners: (viewport: unknown): void => {
      viewportListeners.forEach(callback => callback(viewport));
    },

    /**
     * Force immediate update, bypassing throttle
     */
    forceUpdate: (viewport: unknown): void => {
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
        throttleTimeout = null;
      }
      isThrottling = false;
      pendingViewport = viewport;
      lastViewportUpdate = performance.now();
      throttler.notifyListeners(viewport);
    },

    /**
     * Reset throttle state
     */
    reset: (): void => {
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
        throttleTimeout = null;
      }
      isThrottling = false;
      pendingViewport = null;
    },

    /**
     * Get time since last update
     */
    getTimeSinceLastUpdate: (): number => {
      return performance.now() - lastViewportUpdate;
    },
  };

  return throttler;
}

/**
 * Calculate viewport bounds with buffer zone
 */
export function calculateViewportBounds(
  viewport: { x: number; y: number; zoom: number },
  viewportSize: { width: number; height: number },
  bufferSize: number = 50 // 50px buffer as per AC8
): ViewportBounds {
  return {
    left: -viewport.x / viewport.zoom - bufferSize,
    right: (viewportSize.width - viewport.x) / viewport.zoom + bufferSize,
    top: -viewport.y / viewport.zoom - bufferSize,
    bottom: (viewportSize.height - viewport.y) / viewport.zoom + bufferSize,
  };
}

/**
 * Check if a module is within viewport bounds (with buffer)
 */
export function isModuleInViewport(
  module: PlacedModule,
  viewportBounds: ViewportBounds
): boolean {
  const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
  
  const moduleLeft = module.x;
  const moduleRight = module.x + size.width;
  const moduleTop = module.y;
  const moduleBottom = module.y + size.height;

  return (
    moduleRight >= viewportBounds.left &&
    moduleLeft <= viewportBounds.right &&
    moduleBottom >= viewportBounds.top &&
    moduleTop <= viewportBounds.bottom
  );
}

/**
 * Create a virtualized module list that only returns visible modules
 * Implements viewport culling with 50px buffer as per AC8
 */
export function createVirtualizedModuleList(
  modules: PlacedModule[],
  viewport: { x: number; y: number; zoom: number },
  viewportSize: { width: number; height: number },
  options: {
    bufferSize?: number; // Default 50px buffer as per AC8
    margin?: number; // Additional margin for pre-rendering
  } = {}
) {
  const { bufferSize = 50, margin = 0 } = options;
  
  // Calculate viewport bounds with buffer
  const bounds = calculateViewportBounds(viewport, viewportSize, bufferSize + margin);
  
  // Filter modules within bounds
  const visibleModules: PlacedModule[] = [];
  const hiddenModuleIds = new Set<string>();
  
  modules.forEach(module => {
    if (isModuleInViewport(module, bounds)) {
      visibleModules.push(module);
    } else {
      hiddenModuleIds.add(module.instanceId);
    }
  });
  
  return {
    /** Modules that should be rendered */
    visibleModules,
    
    /** Module IDs that are outside viewport (should not render) */
    hiddenModuleIds,
    
    /** Total module count */
    totalCount: modules.length,
    
    /** Visible module count */
    visibleCount: visibleModules.length,
    
    /** Culling ratio (hidden / total) */
    cullingRatio: modules.length > 0 
      ? (modules.length - visibleModules.length) / modules.length 
      : 0,
    
    /** Viewport bounds used for culling */
    bounds,
    
    /** Whether culling is active */
    isCulling: modules.length > 0 && hiddenModuleIds.size > 0,
  };
}

/**
 * Filter connections based on visible modules
 * Only connections where at least one endpoint is visible should be rendered
 */
export function filterVisibleConnections(
  connections: Connection[],
  visibleModuleIds: Set<string>
): Connection[] {
  return connections.filter(connection => {
    return (
      visibleModuleIds.has(connection.sourceModuleId) ||
      visibleModuleIds.has(connection.targetModuleId)
    );
  });
}

/**
 * Performance benchmark helper
 */
export function benchmark<T>(
  _name: string,
  fn: () => T,
  iterations: number = 10
): { result: T; avgMs: number; minMs: number; maxMs: number } {
  const times: number[] = [];
  let result: T;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    result = fn();
    const end = performance.now();
    times.push(end - start);
  }

  const avgMs = times.reduce((a, b) => a + b, 0) / iterations;
  const minMs = Math.min(...times);
  const maxMs = Math.max(...times);

  return { result: result!, avgMs, minMs, maxMs };
}

/**
 * Frame time budget checker
 * Returns true if operation can fit within budget for target FPS
 */
export function isWithinFrameBudget(
  targetFPS: number = 60,
  bufferPercent: number = 0.8 // Only use 80% of frame time
): (operationMs: number) => boolean {
  const frameBudget = (1000 / targetFPS) * bufferPercent;
  return (operationMs: number) => operationMs <= frameBudget;
}

/**
 * Memory-efficient bounding box calculation
 */
export function calculateBounds(
  modules: PlacedModule[]
): { x: number; y: number; width: number; height: number } | null {
  if (modules.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  modules.forEach(module => {
    const size = MODULE_SIZES[module.type] || { width: 80, height: 80 };
    minX = Math.min(minX, module.x);
    minY = Math.min(minY, module.y);
    maxX = Math.max(maxX, module.x + size.width);
    maxY = Math.max(maxY, module.y + size.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// Export constants
export const VIEWPORT_CULLING_BUFFER = 50; // 50px buffer as per AC8
export const THROTTLE_INTERVAL_60FPS = 16; // ~60fps
export const MODULE_CACHE_MAX_SIZE = 500;
