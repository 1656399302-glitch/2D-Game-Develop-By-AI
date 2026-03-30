import { useEffect, useRef, useCallback, useState, useMemo } from 'react';

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
  /** Minimum scale for pinch zoom (AC1: 0.5x) */
  minScale?: number;
  /** Maximum scale for pinch zoom (AC1: 2.0x) */
  maxScale?: number;
  /** Long-press delay in ms */
  longPressDelay?: number;
  /** Pan threshold in px */
  panThreshold?: number;
  /** Debounce threshold for gesture detection in ms (150ms per spec) */
  gestureDebounce?: number;
}

/**
 * Touch feedback style
 */
export type TouchFeedback = 'ripple' | 'glow' | 'scale' | 'none';

/**
 * Touch point data for visualization
 */
interface TouchPoint {
  x: number;
  y: number;
  id: number;
  startTime: number;
}

/**
 * Gesture trail data for visualization
 */
interface GestureTrail {
  points: Array<{ x: number; y: number; timestamp: number }>;
  type: GestureType | null;
}

/**
 * Default configuration (updated for Round 28 contract)
 */
const DEFAULT_CONFIG: Required<TouchEnhancerConfig> = {
  enablePinchZoom: true,
  enableTwoFingerPan: true,
  enableLongPress: true,
  minScale: 0.5,  // AC1: 0.5x - 2.0x range
  maxScale: 2.0,  // AC1: 0.5x - 2.0x range
  longPressDelay: 500,
  panThreshold: 10,
  gestureDebounce: 150, // 150ms threshold per contract
};

/**
 * Mobile Touch Enhancer Component
 * 
 * Provides enhanced touch interactions for mobile devices:
 * - Pinch-to-zoom on canvas (0.5x - 2.0x range as per AC1)
 * - Two-finger pan (AC2)
 * - Long-press context menu
 * - Touch point indicator - Visual feedback showing touch contact points (AC5)
 * - Gesture visualization overlay - Animated arc/line during pan (AC6)
 * - Touch/mouse coexistence (F6)
 * 
 * WCAG 2.1 AA Compliance:
 * - Touch targets minimum 44x44px
 * - Visual feedback for all touch interactions
 * 
 * FIXED (Round 29): useEffect dependency arrays to prevent infinite update loops
 * - Uses refs for mutable values that shouldn't trigger re-renders
 * - Stable callback references via useCallback with stable dependencies
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
    lastGestureTime: 0,
  });
  
  // Touch points for visualization (AC5)
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  
  // Gesture trail for visualization overlay (AC6)
  const [gestureTrail, setGestureTrail] = useState<GestureTrail>({ points: [], type: null });
  
  const [currentTransform, setCurrentTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  
  // FIX: Use refs for values that are read in callbacks but shouldn't cause re-creation
  // This prevents the infinite update loop caused by:
  // setCurrentTransform -> currentTransform changes -> emitGestureDebounced re-created -> handlers re-created -> effect re-runs
  const currentTransformRef = useRef(currentTransform);
  useEffect(() => {
    currentTransformRef.current = currentTransform;
  }, [currentTransform]);
  
  // Store mergedConfig in ref so callbacks don't need to depend on it
  const mergedConfigRef = useRef(mergedConfig);
  useEffect(() => {
    mergedConfigRef.current = mergedConfig;
  }, [mergedConfig]);
  
  // Store onGesture callback in ref
  const onGestureRef = useRef(onGesture);
  useEffect(() => {
    onGestureRef.current = onGesture;
  }, [onGesture]);
  
  // Memoized touch point IDs
  const touchPointIdRef = useRef(0);
  
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
  
  // FIX: Debounced gesture emit - uses refs instead of state to avoid dependency chain
  const emitGestureDebounced = useCallback((
    type: GestureType,
    event: Partial<GestureEvent>,
    debounceMs: number = mergedConfig.gestureDebounce
  ) => {
    const state = touchStateRef.current;
    const now = Date.now();
    
    // Only emit if enough time has passed since last gesture (debounce)
    if (now - state.lastGestureTime >= debounceMs) {
      state.lastGestureTime = now;
      
      const callback = onGestureRef.current;
      if (callback) {
        callback({
          type,
          centerX: event.centerX || 0,
          centerY: event.centerY || 0,
          scale: currentTransformRef.current.scale, // Use ref instead of state
          rotation: 0,
          velocity: event.velocity || { x: 0, y: 0 },
          ...event,
        } as GestureEvent);
      }
    }
  }, [mergedConfig.gestureDebounce]); // Only depend on primitive values, not callbacks or state
  
  // FIX: Handle touch start - use refs for all values that might cause re-creation
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const state = touchStateRef.current;
    const config = mergedConfigRef.current;
    state.touchCount = e.touches.length;
    state.startTime = Date.now();
    
    // Update touch points for visualization (AC5)
    const newTouchPoints: TouchPoint[] = [];
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      newTouchPoints.push({
        x: touch.clientX,
        y: touch.clientY,
        id: touchPointIdRef.current++,
        startTime: Date.now(),
      });
    }
    setTouchPoints(newTouchPoints);
    
    // Reset gesture trail
    setGestureTrail({ points: [], type: null });
    
    if (e.touches.length === 1) {
      state.startPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      state.initialPan = { x: currentTransformRef.current.translateX, y: currentTransformRef.current.translateY };
      
      // Setup long-press timer
      if (config.enableLongPress) {
        state.longPressTimer = setTimeout(() => {
          emitGestureDebounced('longPress', {
            centerX: e.touches[0].clientX,
            centerY: e.touches[0].clientY,
          });
        }, config.longPressDelay);
      }
    } else if (e.touches.length === 2 && config.enablePinchZoom) {
      // Clear long-press timer
      if (state.longPressTimer) {
        clearTimeout(state.longPressTimer);
        state.longPressTimer = null;
      }
      
      state.isPinching = true;
      state.initialDistance = getTouchDistance(e.touches);
      state.initialScale = currentTransformRef.current.scale;
      state.initialCenter = getTouchCenter(e.touches);
      
      // Set gesture trail type
      setGestureTrail({ points: [], type: 'pinch' });
    }
  }, [getTouchDistance, getTouchCenter, emitGestureDebounced]); // No state dependencies - use refs instead
  
  // FIX: Handle touch move - use refs for values that might cause re-creation
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const state = touchStateRef.current;
    const config = mergedConfigRef.current;
    
    // Clear long-press timer on move
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }
    
    // Update touch points
    const newTouchPoints: TouchPoint[] = [];
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      newTouchPoints.push({
        x: touch.clientX,
        y: touch.clientY,
        id: touchPointIdRef.current++,
        startTime: Date.now(),
      });
    }
    setTouchPoints(newTouchPoints);
    
    // Update gesture trail (AC6)
    if (e.touches.length >= 1) {
      const center = getTouchCenter(e.touches);
      setGestureTrail(prev => ({
        points: [...prev.points.slice(-20), { x: center.x, y: center.y, timestamp: Date.now() }],
        type: e.touches.length >= 2 ? 'pinch' : 'pan',
      }));
    }
    
    if (e.touches.length === 2 && state.isPinching && config.enablePinchZoom) {
      e.preventDefault();
      
      const currentDistance = getTouchDistance(e.touches);
      const center = getTouchCenter(e.touches);
      
      // Calculate new scale with 0.5x - 2.0x range (AC1)
      const scaleChange = currentDistance / state.initialDistance;
      const newScale = Math.min(
        Math.max(state.initialScale * scaleChange, config.minScale),
        config.maxScale
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
      
      emitGestureDebounced('pinch', {
        centerX: center.x,
        centerY: center.y,
        scale: newScale,
      });
    } else if (e.touches.length === 2 && config.enableTwoFingerPan) {
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
      
      emitGestureDebounced('pan', {
        centerX: center.x,
        centerY: center.y,
        velocity: panDelta,
      });
    } else if (e.touches.length === 1) {
      // Single finger pan when pinch is disabled
      const dx = e.touches[0].clientX - state.startPosition.x;
      const dy = e.touches[0].clientY - state.startPosition.y;
      
      if (Math.abs(dx) > config.panThreshold || Math.abs(dy) > config.panThreshold) {
        setCurrentTransform((prev) => ({
          ...prev,
          translateX: prev.translateX + dx * 0.1,
          translateY: prev.translateY + dy * 0.1,
        }));
        
        state.startPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        
        emitGestureDebounced('pan', {
          centerX: e.touches[0].clientX,
          centerY: e.touches[0].clientY,
          velocity: { x: dx, y: dy },
        });
      }
    }
  }, [getTouchDistance, getTouchCenter, emitGestureDebounced]); // No state dependencies - use refs instead
  
  // FIX: Handle touch end - use refs for values that might cause re-creation
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const state = touchStateRef.current;
    const config = mergedConfigRef.current;
    const duration = Date.now() - state.startTime;
    
    // Clear touch points
    setTouchPoints([]);
    
    // Calculate velocity for swipe detection
    if (e.changedTouches.length === 1 && state.touchCount === 1) {
      const dx = e.changedTouches[0].clientX - state.startPosition.x;
      const dy = e.changedTouches[0].clientY - state.startPosition.y;
      
      // Detect swipe
      if (Math.abs(dx) > config.panThreshold || Math.abs(dy) > config.panThreshold) {
        let direction: 'up' | 'down' | 'left' | 'right' = 'right';
        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? 'right' : 'left';
        } else {
          direction = dy > 0 ? 'down' : 'up';
        }
        
        emitGestureDebounced('swipe', {
          centerX: e.changedTouches[0].clientX,
          centerY: e.changedTouches[0].clientY,
          direction,
          velocity: { x: dx / duration * 1000, y: dy / duration * 1000 },
        });
      } else if (duration < 300) {
        // Detect tap
        emitGestureDebounced('tap', {
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
    
    // Clear gesture trail after delay
    setTimeout(() => {
      setGestureTrail({ points: [], type: null });
    }, 300);
  }, [emitGestureDebounced]); // Only depends on stable function, not config values directly
  
  // FIX: Attach touch event listeners with empty dependencies after defining stable handlers
  // The handlers are now stable (no state dependencies), so this effect only runs on mount/unmount
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
  }, []); // Empty dependency array - handlers are now stable due to ref usage
  
  // Memoize touch point indicator positions
  const touchPointIndicators = useMemo(() => {
    return touchPoints.map((point, idx) => (
      <div
        key={point.id}
        data-testid={`touch-point-indicator-${idx}`}
        className="absolute w-8 h-8 rounded-full border-2 border-[#00d4ff] bg-[#00d4ff]/20 pointer-events-none animate-pulse"
        style={{
          left: point.x,
          top: point.y,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff/50%',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-[#00d4ff] text-xs font-bold">
          {idx + 1}
        </div>
      </div>
    ));
  }, [touchPoints]);
  
  // Memoize gesture trail SVG
  const gestureTrailPath = useMemo(() => {
    if (gestureTrail.points.length < 2) return null;
    
    const pathData = gestureTrail.points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
    
    return pathData;
  }, [gestureTrail.points]);
  
  // Memoize gesture direction indicator
  const gestureDirectionIndicator = useMemo(() => {
    if (gestureTrail.points.length < 2) return null;
    
    const lastTwo = gestureTrail.points.slice(-2);
    const dx = lastTwo[1].x - lastTwo[0].x;
    const dy = lastTwo[1].y - lastTwo[0].y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    return {
      x: lastTwo[1].x,
      y: lastTwo[1].y,
      angle,
    };
  }, [gestureTrail.points]);
  
  return (
    <div
      ref={containerRef}
      className={`touch-enhancer relative ${className}`}
      data-testid="touch-enhancer"
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
      
      {/* Touch point indicators (AC5) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" data-testid="touch-point-indicators">
        {touchPointIndicators}
      </div>
      
      {/* Gesture visualization overlay (AC6) */}
      {gestureTrail.points.length >= 2 && gestureTrailPath && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          data-testid="gesture-visualization-overlay"
          style={{ overflow: 'visible' }}
        >
          {/* Gesture trail path */}
          <path
            d={gestureTrailPath}
            fill="none"
            stroke="#00d4ff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
            style={{
              filter: 'drop-shadow(0 0 4px #00d4ff) drop-shadow(0 0 8px #00d4ff/50%)',
            }}
          />
          
          {/* Animated glow effect */}
          <path
            d={gestureTrailPath}
            fill="none"
            stroke="#00d4ff"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
            style={{
              filter: 'blur(4px)',
            }}
          />
          
          {/* Direction indicator */}
          {gestureDirectionIndicator && gestureTrail.type === 'pan' && (
            <g transform={`translate(${gestureDirectionIndicator.x}, ${gestureDirectionIndicator.y}) rotate(${gestureDirectionIndicator.angle})`}>
              <polygon
                points="12,0 -6,-6 -6,6"
                fill="#00d4ff"
                opacity="0.9"
                style={{
                  filter: 'drop-shadow(0 0 4px #00d4ff)',
                }}
              />
            </g>
          )}
          
          {/* Pinch indicator (two circles connected) */}
          {gestureTrail.type === 'pinch' && gestureTrail.points.length >= 2 && (
            <g>
              {gestureTrail.points.slice(-2).map((point, idx) => (
                <circle
                  key={idx}
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  fill="none"
                  stroke="#00d4ff"
                  strokeWidth="2"
                  opacity="0.8"
                  style={{
                    filter: 'drop-shadow(0 0 4px #00d4ff)',
                  }}
                >
                  <animate
                    attributeName="r"
                    values="6;12;6"
                    dur="0.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </g>
          )}
        </svg>
      )}
      
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
  const styleRef = useRef(style);
  
  // Keep style ref in sync
  useEffect(() => {
    styleRef.current = style;
  }, [style]);
  
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
    <div className="absolute inset-0 pointer-events-none overflow-hidden" data-testid="touch-feedback-layer">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple-effect"
          data-testid={`ripple-${ripple.id}`}
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
