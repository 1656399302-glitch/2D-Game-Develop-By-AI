/**
 * useCanvasPerformance Hook
 * 
 * Provides performance optimizations for canvas operations:
 * - Debounced connection updates (16ms, rAF-aligned)
 * - rAF batching for transform updates
 * - High performance mode detection
 * 
 * ROUND 81 PHASE 2: New hook implementation per contract D8.
 */

import { useCallback, useRef, useState, useEffect } from 'react';

// 16ms debounce = ~60fps
const DEBOUNCE_MS = 16;

// Default rAF interval
const RAF_INTERVAL_MS = 16;

interface UseCanvasPerformanceOptions {
  /** Enable high performance mode (default: auto-detect) */
  forceHighPerformance?: boolean;
  /** Custom debounce delay (default: 16ms) */
  debounceDelay?: number;
}

interface CanvasPerformanceAPI {
  /** Debounced update function - batches rapid calls */
  debouncedUpdate: <T extends (...args: unknown[]) => void>(
    fn: T,
    ...args: Parameters<T>
  ) => void;
  
  /** Batched transform update - coalesces multiple transform updates into one rAF */
  batchedTransform: (transform: {
    x?: number;
    y?: number;
    zoom?: number;
  }) => void;
  
  /** Get the current batched transform */
  getCurrentTransform: () => { x: number; y: number; zoom: number };
  
  /** Whether high performance mode is active */
  isHighPerformance: boolean;
  
  /** Flush pending updates immediately */
  flushUpdates: () => void;
  
  /** Request animation frame ID (for cleanup) */
  rafId: number | null;
}

export function useCanvasPerformance(
  options: UseCanvasPerformanceOptions = {}
): CanvasPerformanceAPI {
  const { forceHighPerformance, debounceDelay = DEBOUNCE_MS } = options;
  
  // High performance mode state
  const [isHighPerformance, setIsHighPerformance] = useState(true);
  const [currentTransform, setCurrentTransform] = useState({ x: 0, y: 0, zoom: 1 });
  
  // Refs for managing debounce and rAF
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingTransformRef = useRef<{ x?: number; y?: number; zoom?: number } | null>(null);
  const lastRafTimeRef = useRef<number>(0);
  const isHighPerformanceRef = useRef(true);
  
  // Performance detection
  useEffect(() => {
    if (forceHighPerformance !== undefined) {
      setIsHighPerformance(forceHighPerformance);
      isHighPerformanceRef.current = forceHighPerformance;
      return;
    }
    
    // Auto-detect based on device memory (if available)
    const nav = navigator as Navigator & { deviceMemory?: number };
    const deviceMemory = nav.deviceMemory;
    
    // Low memory device (< 4GB) = reduced performance
    if (deviceMemory && deviceMemory < 4) {
      setIsHighPerformance(false);
      isHighPerformanceRef.current = false;
      return;
    }
    
    // Check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    if (isMobile) {
      setIsHighPerformance(false);
      isHighPerformanceRef.current = false;
      return;
    }
    
    // Default to high performance on desktop
    setIsHighPerformance(true);
    isHighPerformanceRef.current = true;
  }, [forceHighPerformance]);
  
  /**
   * Debounced update - batches rapid calls within debounce window
   */
  const debouncedUpdate = useCallback(<T extends (...args: unknown[]) => void>(
    fn: T,
    ...args: Parameters<T>
  ) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      fn(...args);
      debounceTimeoutRef.current = null;
    }, debounceDelay);
  }, [debounceDelay]);
  
  /**
   * Batched transform update - coalesces multiple transform updates into single rAF
   */
  const batchedTransform = useCallback((transform: { x?: number; y?: number; zoom?: number }) => {
    // Merge with pending transform
    pendingTransformRef.current = {
      ...pendingTransformRef.current,
      ...transform,
    };
    
    // If already scheduled, skip
    if (rafIdRef.current !== null) {
      return;
    }
    
    // Schedule rAF with a wrapper function
    const rafCallback = (currentTime: number) => {
      // Throttle to ~60fps
      if (currentTime - lastRafTimeRef.current < RAF_INTERVAL_MS && isHighPerformanceRef.current) {
        rafIdRef.current = requestAnimationFrame(rafCallback);
        return;
      }
      
      lastRafTimeRef.current = currentTime;
      
      // Apply pending transform
      if (pendingTransformRef.current) {
        setCurrentTransform((prev) => ({
          x: pendingTransformRef.current?.x ?? prev.x,
          y: pendingTransformRef.current?.y ?? prev.y,
          zoom: pendingTransformRef.current?.zoom ?? prev.zoom,
        }));
        pendingTransformRef.current = null;
      }
      
      // Clear rafId
      rafIdRef.current = null;
    };
    
    rafIdRef.current = requestAnimationFrame(rafCallback);
  }, []);
  
  /**
   * Get current transform state
   */
  const getCurrentTransform = useCallback(() => {
    return { ...currentTransform };
  }, [currentTransform]);
  
  /**
   * Flush pending updates immediately
   */
  const flushUpdates = useCallback(() => {
    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    
    // Apply any pending transform
    if (pendingTransformRef.current) {
      setCurrentTransform((prev) => ({
        x: pendingTransformRef.current?.x ?? prev.x,
        y: pendingTransformRef.current?.y ?? prev.y,
        zoom: pendingTransformRef.current?.zoom ?? prev.zoom,
      }));
      pendingTransformRef.current = null;
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);
  
  return {
    debouncedUpdate,
    batchedTransform,
    getCurrentTransform,
    isHighPerformance,
    flushUpdates,
    rafId: rafIdRef.current,
  };
}

export default useCanvasPerformance;
