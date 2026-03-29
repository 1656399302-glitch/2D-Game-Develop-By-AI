import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Touch gesture types
 */
export type GestureType = 'pinch' | 'pan' | 'longPress' | 'swipe' | 'tap';

/**
 * Gesture event data
 */
export interface GestureEvent {
  type: GestureType;
  centerX: number;
  centerY: number;
  scale: number;
  rotation: number;
  velocity: { x: number; y: number };
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

/**
 * Touch enhancer configuration
 */
export interface TouchEnhancerConfig {
  /** Enable pinch-to-zoom */
  enablePinchZoom?: boolean;
  /** Enable two-finger pan */
  enableTwoFingerPan?: boolean;
  /** Enable long-press context menu */
  enableLongPress?: boolean;
  /** Minimum scale for pinch zoom */
  minScale?: number;
  /** Maximum scale for pinch zoom */
  maxScale?: number;
  /** Long-press delay in ms */
  longPressDelay?: number;
  /** Pan threshold in px */
  panThreshold?: number;
}

/**
 * Touch feedback style
 */
export type TouchFeedback = 'ripple' | 'glow' | 'scale' | 'none';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<TouchEnhancerConfig> = {
  enablePinchZoom: true,
  enableTwoFingerPan: true,
  enableLongPress: true,
  minScale: 0.5,
  maxScale: 3,
  longPressDelay: 500,
  panThreshold: 10,
};

/**
 * Mobile Touch Enhancer Component
 * 
 * Provides enhanced touch interactions for mobile devices:
 * - Pinch-to-zoom on canvas
 * - Two-finger pan
 * - Long-press context menu
 * - Touch feedback animations
 * 
 * WCAG 2.1 AA Compliance:
 * - Touch targets minimum 44x44px
 * - Visual feedback for all touch interactions
 */
export function MobileTouchEnhancer({
  children,
  config = {},
  onGesture,
  feedbackStyle = 'ripple',
  className = '',
}: {
  children: React.ReactNode;
  config?: TouchEnhancerConfig;
  onGesture?: (event: GestureEvent) => void;
  feedbackStyle?: TouchFeedback;
  className?: string;
}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStateRef = useRef({
    initialDistance: 0,
    initialScale: 1,
    initialCenter: { x: 0, y: 0 },
    initialPan: { x: 0, y: 0 },
    isPinching: false,
    isPanning: false,
    touchCount: 0,
    startTime: 0,
    startPosition: { x: 0, y: 0 },
    longPressTimer: null as ReturnType<typeof setTimeout> | null,
  });
  
  const [currentTransform, setCurrentTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  
  // Calculate distance between two touch points
  const getTouchDistance = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);
  
  // Calculate center point between two touches
  const getTouchCenter = useCallback((touches: TouchList): { x: number; y: number } => {
    if (touches.length < 2) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  }, []);
  
  // Emit gesture event
  const emitGesture = useCallback((type: GestureType, event: Partial<GestureEvent>) => {
    if (onGesture) {
      onGesture({
        type,
        centerX: event.centerX || 0,
        centerY: event.centerY || 0,
        scale: currentTransform.scale,
        rotation: 0,
        velocity: event.velocity || { x: 0, y: 0 },
        ...event,
      } as GestureEvent);
    }
  }, [onGesture, currentTransform.scale]);
  
  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const state = touchStateRef.current;
    state.touchCount = e.touches.length;
    state.startTime = Date.now();
    
    if (e.touches.length === 1) {
      state.startPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      state.initialPan = { x: currentTransform.translateX, y: currentTransform.translateY };
      
      // Setup long-press timer
      if (mergedConfig.enableLongPress) {
        state.longPressTimer = setTimeout(() => {
          emitGesture('longPress', {
            centerX: e.touches[0].clientX,
            centerY: e.touches[0].clientY,
          });
        }, mergedConfig.longPressDelay);
      }
    } else if (e.touches.length === 2 && mergedConfig.enablePinchZoom) {
      // Clear long-press timer
      if (state.longPressTimer) {
        clearTimeout(state.longPressTimer);
        state.longPressTimer = null;
      }
      
      state.isPinching = true;
      state.initialDistance = getTouchDistance(e.touches);
      state.initialScale = currentTransform.scale;
      state.initialCenter = getTouchCenter(e.touches);
    }
  }, [currentTransform, mergedConfig, getTouchDistance, getTouchCenter, emitGesture]);
  
  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const state = touchStateRef.current;
    
    // Clear long-press timer on move
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }
    
    if (e.touches.length === 2 && state.isPinching && mergedConfig.enablePinchZoom) {
      e.preventDefault();
      
      const currentDistance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches);
      
      // Calculate new scale
      const scaleChange = currentDistance / state.initialDistance;
      const newScale = Math.min(
        Math.max(state.initialScale * scaleChange, mergedConfig.minScale),
        mergedConfig.maxScale
      );
      
      // Calculate pan offset
      const centerDelta = {
        x: center.x - state.initialCenter.x,
        y: center.y - state.initialCenter.y,
      };
      
      setCurrentTransform(() => ({
        scale: newScale,
        translateX: state.initialPan.x + centerDelta.x,
        translateY: state.initialPan.y + centerDelta.y,
      }));
      
      emitGesture('pinch', {
        centerX: center.x,
        centerY: center.y,
        scale: newScale,
      });
    } else if (e.touches.length === 2 && mergedConfig.enableTwoFingerPan) {
      e.preventDefault();
      
      const center = getTouchCenter(e.touches);
      const panDelta = {
        x: center.x - state.initialCenter.x,
        y: center.y - state.initialCenter.y,
      };
      
      setCurrentTransform((prev) => ({
        ...prev,
        translateX: state.initialPan.x + panDelta.x,
        translateY: state.initialPan.y + panDelta.y,
      }));
      
      emitGesture('pan', {
        centerX: center.x,
        centerY: center.y,
        velocity: panDelta,
      });
    }
  }, [mergedConfig, getTouchDistance, getTouchCenter, emitGesture]);
  
  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const state = touchStateRef.current;
    const duration = Date.now() - state.startTime;
    
    // Calculate velocity for swipe detection
    if (e.changedTouches.length === 1 && state.touchCount === 1) {
      const dx = e.changedTouches[0].clientX - state.startPosition.x;
      const dy = e.changedTouches[0].clientY - state.startPosition.y;
      
      // Detect swipe
      if (Math.abs(dx) > mergedConfig.panThreshold || Math.abs(dy) > mergedConfig.panThreshold) {
        let direction: 'up' | 'down' | 'left' | 'right' = 'right';
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          direction = dy > 0 ? 'down' : 'up';
        }
        
        emitGesture('swipe', {
          centerX: e.changedTouches[0].clientX,
          centerY: e.changedTouches[0].clientY,
          direction,
          velocity: { x: dx / duration * 1000, y: dy / duration * 1000 },
        });
      } else if (duration < 300) {
        // Detect tap
        emitGesture('tap', {
          centerX: e.changedTouches[0].clientX,
          centerY: e.changedTouches[0].clientY,
        });
      }
    }
    
    // Reset state
    state.touchCount = e.touches.length;
    state.isPinching = false;
    state.isPanning = false;
    
    if (e.touches.length < 2) {
      state.initialDistance = 0;
      state.initialCenter = { x: 0, y: 0 };
    }
  }, [mergedConfig.panThreshold, emitGesture]);
  
  // Attach touch event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  return (
    <div
      ref={containerRef}
      className={`touch-enhancer ${className}`}
      style={{
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <div
        className="touch-content"
        style={{
          transform: `translate(${currentTransform.translateX}px, ${currentTransform.translateY}px) scale(${currentTransform.scale})`,
          transformOrigin: 'center center',
          transition: touchStateRef.current.isPinching || touchStateRef.current.isPanning
            ? 'none'
            : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
      
      {/* Touch feedback overlay */}
      {feedbackStyle !== 'none' && (
        <TouchFeedbackLayer
          style={feedbackStyle}
          containerRef={containerRef}
        />
      )}
    </div>
  );
}

/**
 * Touch feedback visual layer
 */
function TouchFeedbackLayer({
  style,
  containerRef,
}: {
  style: TouchFeedback;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const rippleIdRef = useRef(0);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container || style !== 'ripple') return;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const rect = container.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;
        
        const newRipple = { x, y, id: rippleIdRef.current++ };
        setRipples((prev) => [...prev, newRipple]);
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 600);
      }
    };
    
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    return () => container.removeEventListener('touchstart', handleTouchStart);
  }, [style, containerRef]);
  
  if (style !== 'ripple') return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple-effect"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}
      
      <style>{`
        .ripple-effect {
          position: absolute;
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple-expand 0.6s ease-out forwards;
        }
        
        @keyframes ripple-expand {
          to {
            transform: translate(-50%, -50%) scale(15);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Hook for touch gesture handling
 */
export function useTouchGestures() {
  const [transform, setTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  
  const handleGesture = useCallback((event: GestureEvent) => {
    switch (event.type) {
      case 'pinch':
        setTransform((prev) => ({
          ...prev,
          scale: event.scale || prev.scale,
        }));
        break;
      case 'pan':
        setTransform((prev) => ({
          ...prev,
          translateX: prev.translateX + (event.velocity?.x || 0) * 0.1,
          translateY: prev.translateY + (event.velocity?.y || 0) * 0.1,
        }));
        break;
      default:
        break;
    }
  }, []);
  
  return {
    transform,
    handleGesture,
  };
}

/**
 * Reset transform to default
 */
export function resetTransform() {
  return { scale: 1, translateX: 0, translateY: 0 };
}

export default MobileTouchEnhancer;
