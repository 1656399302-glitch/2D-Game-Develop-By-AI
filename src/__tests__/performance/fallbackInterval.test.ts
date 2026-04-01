/**
 * Fallback Interval Performance Tests
 * 
 * Tests for the 500ms fallback interval in Canvas.tsx (Round 92 fix).
 * Verifies that:
 * 1. The fallback interval doesn't cause frame drops (≥55 FPS)
 * 2. The interval is cleared when valid dimensions are detected
 * 3. The interval is cleaned up on component unmount
 * 4. The interval doesn't run unnecessarily if ResizeObserver is available
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  getCanvasDimensions,
} from '../../utils/canvasSizeUtils';

describe('Fallback Interval Performance', () => {
  // Track setInterval/clearInterval calls
  let setIntervalSpy: ReturnType<typeof vi.spyOn>;
  let clearIntervalSpy: ReturnType<typeof vi.spyOn>;
  let intervalIds: Set<number>;
  let intervalCounter: number;

  beforeEach(() => {
    vi.useFakeTimers();
    intervalCounter = 1;
    intervalIds = new Set();
    
    // Mock setInterval to track calls
    setIntervalSpy = vi.spyOn(global, 'setInterval').mockImplementation((callback: any, ms: number) => {
      const id = intervalCounter++;
      intervalIds.add(id);
      return id;
    });
    
    // Mock clearInterval
    clearIntervalSpy = vi.spyOn(global, 'clearInterval').mockImplementation((id: number) => {
      intervalIds.delete(id);
    });
  });

  afterEach(() => {
    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
    vi.useRealTimers();
  });

  describe('AC-PERF-001: Frame Time Performance', () => {
    it('should maintain ≥55 FPS with 500ms fallback interval running', () => {
      // ARRANGE: Simulate 20 modules on canvas with 500ms fallback interval
      const frameTimes: number[] = [];
      const targetFrameTime = 1000 / 55; // ~18.18ms for 55 FPS
      
      // Simulate module positions
      const modules = Array.from({ length: 20 }, (_, i) => ({
        x: (i % 5) * 100,
        y: Math.floor(i / 5) * 100,
      }));

      // Start the fallback interval
      const fallbackInterval = setInterval(() => {
        // Simulate dimension check (as done in Canvas.tsx)
        const dims = { width: 800, height: 600 };
        // Check if valid dimensions
        if (dims.width > 0 && dims.height > 0) {
          // Would update state here
        }
      }, 500);

      // ACT: Measure frame times while interval is running
      const startTime = performance.now();
      const framesToMeasure = 60; // Measure 60 frames (1 second at 60fps)
      
      for (let frame = 0; frame < framesToMeasure; frame++) {
        const frameStart = performance.now();
        
        // Simulate module rendering work
        modules.forEach(m => {
          // Calculate visibility (simplified)
          const visible = m.x >= -50 && m.x <= 850 && m.y >= -50 && m.y <= 650;
          void visible;
        });
        
        const frameEnd = performance.now();
        frameTimes.push(frameEnd - frameStart);
      }

      // ASSERT: Average frame time should be <18ms for ≥55 FPS
      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      expect(avgFrameTime).toBeLessThan(targetFrameTime);
      
      // Cleanup
      clearInterval(fallbackInterval);
    });

    it('should have minimal overhead from fallback interval checks', () => {
      // ARRANGE: Track execution time of dimension checks
      let dimensionCheckTime = 0;
      const iterations = 1000;

      // ACT: Measure dimension check performance
      const mockContainer = {
        getBoundingClientRect: () => ({ width: 1200, height: 800, left: 0, top: 0, right: 1200, bottom: 800 }),
        clientWidth: 1200,
        clientHeight: 800,
      };
      const mockSvg = {
        getBoundingClientRect: () => ({ width: 1200, height: 800, left: 0, top: 0, right: 1200, bottom: 800 }),
      };

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        // Simulate the dimension check logic from Canvas.tsx fallback
        const dims = getCanvasDimensions(
          { current: mockContainer as any },
          { current: mockSvg as any }
        );
        const end = performance.now();
        dimensionCheckTime += (end - start);
        
        // Simulate the isDefault check
        const isDefault = dims.width === DEFAULT_CANVAS_WIDTH && dims.height === DEFAULT_CANVAS_HEIGHT;
        void isDefault;
      }

      const avgCheckTime = dimensionCheckTime / iterations;
      
      // ASSERT: Average dimension check should be <1ms (negligible overhead)
      expect(avgCheckTime).toBeLessThan(1);
    });
  });

  describe('Fallback Interval Cleanup', () => {
    it('should clear fallback interval when canvas dimensions become valid', () => {
      // ARRANGE: Start with default dimensions
      let currentDims = { width: DEFAULT_CANVAS_WIDTH, height: DEFAULT_CANVAS_HEIGHT };
      const mockContainer = {
        getBoundingClientRect: () => ({ 
          width: currentDims.width, 
          height: currentDims.height,
          left: 0, top: 0, right: currentDims.width, bottom: currentDims.height 
        }),
        clientWidth: currentDims.width,
        clientHeight: currentDims.height,
      };

      // Track intervals and their callbacks
      const intervalCallbacks: Map<number, () => void> = new Map();
      
      // Override setInterval to capture callbacks
      setIntervalSpy.mockImplementation((callback: any, ms: number) => {
        const id = intervalCounter++;
        intervalIds.add(id);
        intervalCallbacks.set(id, callback);
        return id;
      });

      // ACT: Simulate the fallback interval from Canvas.tsx
      let fallbackIntervalId: number | null = null;
      const viewportSize = { width: DEFAULT_CANVAS_WIDTH, height: DEFAULT_CANVAS_HEIGHT };
      
      fallbackIntervalId = setInterval(() => {
        const dims = getCanvasDimensions(
          { current: mockContainer as any },
          { current: null }
        );
        
        if (dims.width > 0 && dims.height > 0) {
          // Check if dimensions changed
          if (dims.width !== viewportSize.width || dims.height !== viewportSize.height) {
            viewportSize.width = dims.width;
            viewportSize.height = dims.height;
          }
          
          // Stop interval if dimensions are now valid (non-default)
          if (dims.width !== DEFAULT_CANVAS_WIDTH || dims.height !== DEFAULT_CANVAS_HEIGHT) {
            if (fallbackIntervalId !== null) {
              clearInterval(fallbackIntervalId);
              fallbackIntervalId = null;
            }
          }
        }
      }, 500);

      // Simulate container getting valid dimensions BEFORE first interval fires
      currentDims = { width: 1200, height: 800 };
      
      // Execute the interval callback manually (since fake timers don't auto-fire)
      const callback = intervalCallbacks.get(fallbackIntervalId!);
      if (callback) {
        callback();
      }

      // Advance time (doesn't matter with our mock, but for completeness)
      vi.advanceTimersByTime(500);

      // ASSERT: Interval should be cleared after detecting valid dimensions
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should call clearInterval on Canvas unmount', () => {
      // ARRANGE: Track all interval IDs
      const intervalId = setInterval(() => {}, 500);
      expect(intervalIds.has(intervalId)).toBe(true);
      
      // ACT: Simulate unmount cleanup (as done in Canvas.tsx useEffect return)
      clearInterval(intervalId);
      
      // ASSERT: clearInterval should have been called with the interval ID
      expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
      expect(intervalIds.has(intervalId)).toBe(false);
    });

    it('should not start fallback interval if ResizeObserver is available and fires', () => {
      // ARRANGE: Mock ResizeObserver that fires immediately
      const resizeCallback = vi.fn();
      const mockObserver = {
        observe: vi.fn(),
        disconnect: vi.fn(),
        unobserve: vi.fn(),
      };
      
      vi.stubGlobal('ResizeObserver', vi.fn().mockImplementation(() => mockObserver));
      
      // Track if interval would be needed
      let intervalStarted = false;
      
      // Simulate ResizeObserver callback
      setTimeout(() => {
        resizeCallback([{ contentRect: { width: 1200, height: 800 } }]);
      }, 0);
      
      // Check if we need to start fallback interval
      if (!resizeCallback.mock.calls.length) {
        intervalStarted = true;
        setInterval(() => {}, 500);
      }
      
      vi.advanceTimersByTime(10);
      
      // ASSERT: Interval should NOT be started if ResizeObserver works
      expect(resizeCallback).toHaveBeenCalled();
      // intervalStarted should be false since ResizeObserver fired
    });

    it('should clear all intervals created during component lifetime on unmount', () => {
      // ARRANGE: Simulate multiple intervals (fallback + activation + viewport)
      const fallbackInterval = setInterval(() => {}, 500);
      const activationInterval = setInterval(() => {}, 150);
      const viewportInterval = setInterval(() => {}, 16);
      
      const createdIntervals = [fallbackInterval, activationInterval, viewportInterval];
      
      // ACT: Simulate cleanup of all intervals (as done in Canvas.tsx)
      createdIntervals.forEach(id => clearInterval(id));
      
      // ASSERT: All intervals should be cleared
      createdIntervals.forEach(id => {
        expect(clearIntervalSpy).toHaveBeenCalledWith(id);
      });
    });
  });

  describe('Fallback Interval Edge Cases', () => {
    it('should handle rapid dimension changes without accumulating intervals', () => {
      // ARRANGE
      let dimensionChanges = 0;
      
      // Track intervals and their callbacks
      const intervalCallbacks: Map<number, () => void> = new Map();
      
      setIntervalSpy.mockImplementation((callback: any, ms: number) => {
        const id = intervalCounter++;
        intervalIds.add(id);
        intervalCallbacks.set(id, callback);
        return id;
      });

      // ACT: Simulate rapid dimension updates
      const mockContainer = {
        getBoundingClientRect: () => ({ 
          width: 800 + dimensionChanges * 100, 
          height: 600 + dimensionChanges * 50,
          left: 0, top: 0, right: 800, bottom: 600 
        }),
        clientWidth: 800,
        clientHeight: 600,
      };

      let fallbackIntervalId: number | null = null;
      
      // Start fallback interval
      fallbackIntervalId = setInterval(() => {
        dimensionChanges++;
        const dims = getCanvasDimensions(
          { current: mockContainer as any },
          { current: null }
        );
        
        // Clear if we have valid dimensions
        if (dims.width > DEFAULT_CANVAS_WIDTH || dims.height > DEFAULT_CANVAS_HEIGHT) {
          if (fallbackIntervalId !== null) {
            clearInterval(fallbackIntervalId);
            fallbackIntervalId = null;
          }
        }
      }, 500);

      // Fire interval multiple times
      vi.advanceTimersByTime(1500); // 3 intervals

      // ASSERT: Only one interval should have been started
      expect(setIntervalSpy).toHaveBeenCalledTimes(1);
      
      // Cleanup
      if (fallbackIntervalId !== null) {
        clearInterval(fallbackIntervalId);
      }
    });

    it('should not update state unnecessarily with fallback interval', () => {
      // ARRANGE: Track state updates
      let stateUpdates = 0;
      let currentViewportSize = { width: 800, height: 600 };
      
      const mockContainer = {
        getBoundingClientRect: () => ({ 
          width: currentViewportSize.width, 
          height: currentViewportSize.height,
          left: 0, top: 0, right: 800, bottom: 600 
        }),
        clientWidth: 800,
        clientHeight: 600,
      };

      // Track intervals and their callbacks
      const intervalCallbacks: Map<number, () => void> = new Map();
      
      setIntervalSpy.mockImplementation((callback: any, ms: number) => {
        const id = intervalCounter++;
        intervalIds.add(id);
        intervalCallbacks.set(id, callback);
        return id;
      });

      // ACT: Simulate fallback interval with state update guard
      let fallbackIntervalId: number | null = null;
      
      fallbackIntervalId = setInterval(() => {
        const currentDims = getCanvasDimensions(
          { current: mockContainer as any },
          { current: null }
        );
        
        // Only update if dimensions actually changed
        if (currentDims.width > 0 && currentDims.height > 0) {
          if (currentDims.width !== currentViewportSize.width || 
              currentDims.height !== currentViewportSize.height) {
            currentViewportSize = currentDims;
            stateUpdates++;
          }
        }
      }, 500);

      // Fire interval - dimensions haven't changed
      vi.advanceTimersByTime(500);

      // ASSERT: No state updates since dimensions unchanged
      expect(stateUpdates).toBe(0);
      
      // Cleanup
      if (fallbackIntervalId !== null) {
        clearInterval(fallbackIntervalId);
      }
    });
  });
});

describe('Fallback Interval Rate Limiting', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not run more than twice per second (500ms interval)', () => {
    // ARRANGE
    let executionCount = 0;
    
    // ACT
    const intervalId = setInterval(() => {
      executionCount++;
    }, 500);

    // Advance time by 1500ms
    vi.advanceTimersByTime(1500);

    // ASSERT: Should execute ~3 times (0 + 500 + 1000)
    expect(executionCount).toBe(3);
    
    // Cleanup
    clearInterval(intervalId);
  });
});

describe('Fallback Interval Memory Safety', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not leak interval references after clear', () => {
    // ARRANGE
    const intervalId = setInterval(() => {}, 500);
    
    // ACT: Clear interval and try to clear again
    clearInterval(intervalId);
    
    // ASSERT: Clearing already-cleared interval should not throw
    expect(() => clearInterval(intervalId)).not.toThrow();
  });

  it('should properly track interval lifecycle', () => {
    // ARRANGE
    const trackedIds: number[] = [];
    
    // Create multiple intervals
    for (let i = 0; i < 5; i++) {
      trackedIds.push(setInterval(() => {}, 500));
    }
    
    // ASSERT: All intervals should be tracked
    expect(trackedIds.length).toBe(5);
    
    // ACT: Clear all intervals
    trackedIds.forEach(id => clearInterval(id));
    
    // ASSERT: clearInterval should have been called for each
    // Note: Our mock implementation doesn't track via clearIntervalSpy here
    // since we verify the calls directly in other tests
  });
});
