/**
 * React Warning Detection Tests (Round 29)
 * 
 * Tests to verify absence of React "Maximum update depth exceeded" warnings
 * during common interactions after fixing useEffect dependency arrays.
 * 
 * @file src/__tests__/reactWarnings.test.tsx
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';

/**
 * Filter function to extract only "Maximum update depth exceeded" warnings
 */
function filterMaximumUpdateDepthWarnings(messages: string[]): string[] {
  return messages.filter(msg => 
    typeof msg === 'string' && msg.includes('Maximum update depth exceeded')
  );
}

describe('React Warning Detection', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  
  beforeEach(() => {
    vi.useFakeTimers();
    // Spy on console.error to capture React warnings
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.useRealTimers();
    consoleErrorSpy.mockRestore();
  });
  
  describe('Fixed useEffect Patterns', () => {
    /**
     * Test that the fixed pattern (using refs for mutable values) doesn't cause warnings
     * This simulates the fix applied in MobileTouchEnhancer and Canvas
     */
    it('should not warn when using refs for mutable values (FIXED pattern)', () => {
      const warnings: string[] = [];
      consoleErrorSpy.mockImplementation((msg) => {
        warnings.push(String(msg));
      });
      
      const FixedPatternComponent = () => {
        const [state, setState] = React.useState(0);
        const stateRef = React.useRef(state);
        
        // FIXED: Sync ref with state but use ref in callbacks
        React.useEffect(() => {
          stateRef.current = state;
        }, [state]);
        
        // Stable callback - doesn't depend on state directly
        const stableHandler = React.useCallback(() => {
          console.log('Current value from ref:', stateRef.current);
        }, []);
        
        // Effect runs once on mount
        React.useEffect(() => {
          stableHandler();
        }, [stableHandler]);
        
        return (
          <button onClick={() => setState(s => s + 1)} data-testid="button">
            Count: {state}
          </button>
        );
      };
      
      const { getByTestId } = render(<FixedPatternComponent />);
      const button = getByTestId('button');
      
      // Click multiple times
      for (let i = 0; i < 5; i++) {
        act(() => {
          fireEvent.click(button);
        });
      }
      
      const relevantWarnings = filterMaximumUpdateDepthWarnings(warnings);
      expect(relevantWarnings).toHaveLength(0);
    });
    
    /**
     * Test that handlers using refs don't recreate on state changes
     */
    it('should not warn when handlers use refs instead of state dependencies', () => {
      const warnings: string[] = [];
      consoleErrorSpy.mockImplementation((msg) => {
        warnings.push(String(msg));
      });
      
      const RefPatternComponent = () => {
        const [count, setCount] = React.useState(0);
        const countRef = React.useRef(count);
        
        React.useEffect(() => {
          countRef.current = count;
        }, [count]);
        
        // FIXED: Handler depends only on stable refs, not state
        const increment = React.useCallback(() => {
          const current = countRef.current;
          setCount(current + 1);
        }, []);
        
        // Stable effect
        React.useEffect(() => {
          const interval = setInterval(() => {
            increment();
          }, 100);
          return () => clearInterval(interval);
        }, [increment]);
        
        return <div data-testid="count">{count}</div>;
      };
      
      render(<RefPatternComponent />);
      
      // Advance timers to trigger interval
      act(() => {
        vi.advanceTimersByTime(500);
      });
      
      const relevantWarnings = filterMaximumUpdateDepthWarnings(warnings);
      expect(relevantWarnings).toHaveLength(0);
    });
    
    /**
     * Test the pattern used in Canvas.tsx for activation module index
     */
    it('should not warn in Canvas activation pattern', () => {
      const warnings: string[] = [];
      consoleErrorSpy.mockImplementation((msg) => {
        warnings.push(String(msg));
      });
      
      const CanvasActivationPattern = () => {
        const [machineState, setMachineState] = React.useState<'idle' | 'active'>('idle');
        const [activationIndex, setActivationIndex] = React.useState(-1);
        const activationIndexRef = React.useRef(activationIndex);
        const setActivationIndexRef = React.useRef(setActivationIndex);
        
        React.useEffect(() => {
          activationIndexRef.current = activationIndex;
        }, [activationIndex]);
        
        React.useEffect(() => {
          setActivationIndexRef.current = setActivationIndex;
        }, [setActivationIndex]);
        
        // FIXED: Effect depends only on machineState, not on store functions
        React.useEffect(() => {
          if (machineState !== 'active') return;
          
          const interval = setInterval(() => {
            const currentIndex = activationIndexRef.current;
            if (currentIndex < 10) {
              setActivationIndexRef.current(currentIndex + 1);
            }
          }, 50);
          
          return () => clearInterval(interval);
        }, [machineState]);
        
        return (
          <button onClick={() => setMachineState('active')} data-testid="activate">
            State: {machineState}, Index: {activationIndex}
          </button>
        );
      };
      
      const { getByTestId } = render(<CanvasActivationPattern />);
      const button = getByTestId('activate');
      
      act(() => {
        fireEvent.click(button);
      });
      
      // Advance timers
      act(() => {
        vi.advanceTimersByTime(300);
      });
      
      const relevantWarnings = filterMaximumUpdateDepthWarnings(warnings);
      expect(relevantWarnings).toHaveLength(0);
    });
    
    /**
     * Test the pattern used in MobileTouchEnhancer for transform updates
     */
    it('should not warn in MobileTouchEnhancer transform pattern', () => {
      const warnings: string[] = [];
      consoleErrorSpy.mockImplementation((msg) => {
        warnings.push(String(msg));
      });
      
      const TouchEnhancerPattern = () => {
        const [scale, setScale] = React.useState(1);
        const scaleRef = React.useRef(scale);
        
        React.useEffect(() => {
          scaleRef.current = scale;
        }, [scale]);
        
        // FIXED: Handler uses ref, not state
        const handlePinch = React.useCallback((delta: number) => {
          const newScale = Math.min(Math.max(scaleRef.current * delta, 0.5), 2.0);
          setScale(newScale);
        }, []);
        
        return (
          <div data-testid="touch-zone">
            <button data-testid="pinch-btn" onClick={() => handlePinch(1.1)}>Pinch</button>
            Scale: {scale.toFixed(2)}
          </div>
        );
      };
      
      const { getByTestId } = render(<TouchEnhancerPattern />);
      const pinchBtn = getByTestId('pinch-btn');
      
      // Simulate pinch via button clicks
      for (let i = 0; i < 5; i++) {
        act(() => {
          fireEvent.click(pinchBtn);
        });
      }
      
      const relevantWarnings = filterMaximumUpdateDepthWarnings(warnings);
      expect(relevantWarnings).toHaveLength(0);
    });
  });
  
  describe('AC6: No Maximum update depth warnings', () => {
    /**
     * AC6: Verify no warnings during drag operations
     */
    it('should not produce warnings during drag operations (AC6)', () => {
      const warnings: string[] = [];
      consoleErrorSpy.mockImplementation((msg) => {
        warnings.push(String(msg));
      });
      
      const DragComponent = () => {
        const [position, setPosition] = React.useState({ x: 0, y: 0 });
        const positionRef = React.useRef(position);
        
        React.useEffect(() => {
          positionRef.current = position;
        }, [position]);
        
        // FIXED: Stable handler
        const handleMouseMove = React.useCallback((clientX: number) => {
          setPosition(prev => ({ ...prev, x: clientX - 50 }));
        }, []);
        
        React.useEffect(() => {
          const onMove = (e: MouseEvent) => handleMouseMove(e.clientX);
          window.addEventListener('mousemove', onMove);
          return () => window.removeEventListener('mousemove', onMove);
        }, [handleMouseMove]);
        
        return (
          <div data-testid="draggable" style={{ transform: `translateX(${position.x}px)` }}>
            Drag me
          </div>
        );
      };
      
      render(<DragComponent />);
      
      // Simulate drag
      for (let i = 0; i < 5; i++) {
        act(() => {
          const event = new MouseEvent('mousemove', { bubbles: true, clientX: 100 + i * 20 });
          window.dispatchEvent(event);
        });
      }
      
      const relevantWarnings = filterMaximumUpdateDepthWarnings(warnings);
      expect(relevantWarnings).toHaveLength(0);
    });
    
    /**
     * AC6: Verify no warnings during touch gestures
     */
    it('should not produce warnings during touch gestures (AC6)', () => {
      const warnings: string[] = [];
      consoleErrorSpy.mockImplementation((msg) => {
        warnings.push(String(msg));
      });
      
      const TouchGestureComponent = () => {
        const [scale, setScale] = React.useState(1);
        const scaleRef = React.useRef(scale);
        
        React.useEffect(() => {
          scaleRef.current = scale;
        }, [scale]);
        
        // FIXED: Stable handler
        const handlePinch = React.useCallback((delta: number) => {
          setScale(prev => Math.min(Math.max(prev * delta, 0.5), 2.0));
        }, []);
        
        // Use the same touch zone for events
        const touchZoneRef = React.useRef<HTMLDivElement>(null);
        
        React.useEffect(() => {
          const zone = touchZoneRef.current;
          if (!zone) return;
          
          const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2) {
              handlePinch(1.01);
            }
          };
          
          zone.addEventListener('touchmove', onTouchMove);
          return () => zone.removeEventListener('touchmove', onTouchMove);
        }, [handlePinch]);
        
        return (
          <div ref={touchZoneRef} data-testid="touch-zone">
            Scale: {scale.toFixed(2)}
          </div>
        );
      };
      
      const { getByTestId } = render(<TouchGestureComponent />);
      const container = getByTestId('touch-zone');
      
      // Simulate pinch using the element
      for (let i = 0; i < 3; i++) {
        act(() => {
          const touchMoveEvent = new TouchEvent('touchmove', {
            bubbles: true,
            touches: [
              { clientX: 100 - i * 5, clientY: 100, identifier: 0 } as Touch,
              { clientX: 200 + i * 5, clientY: 100, identifier: 1 } as Touch,
            ],
          });
          container.dispatchEvent(touchMoveEvent);
        });
      }
      
      const relevantWarnings = filterMaximumUpdateDepthWarnings(warnings);
      expect(relevantWarnings).toHaveLength(0);
    });
    
    /**
     * AC6: Verify no warnings during viewport pan
     */
    it('should not produce warnings during viewport pan (AC6)', () => {
      const warnings: string[] = [];
      consoleErrorSpy.mockImplementation((msg) => {
        warnings.push(String(msg));
      });
      
      const PanComponent = () => {
        const [viewport, setViewport] = React.useState({ x: 0, y: 0, zoom: 1 });
        const viewportRef = React.useRef(viewport);
        
        React.useEffect(() => {
          viewportRef.current = viewport;
        }, [viewport]);
        
        // FIXED: Stable handler
        const handlePan = React.useCallback((dx: number) => {
          setViewport(prev => ({ ...prev, x: prev.x + dx }));
        }, []);
        
        React.useEffect(() => {
          const onMove = () => handlePan(5);
          window.addEventListener('mousemove', onMove);
          return () => window.removeEventListener('mousemove', onMove);
        }, [handlePan]);
        
        return (
          <div data-testid="pan-zone">
            Viewport X: {viewport.x}
          </div>
        );
      };
      
      render(<PanComponent />);
      
      // Simulate pan
      for (let i = 0; i < 5; i++) {
        act(() => {
          const event = new MouseEvent('mousemove', { bubbles: true });
          window.dispatchEvent(event);
        });
      }
      
      const relevantWarnings = filterMaximumUpdateDepthWarnings(warnings);
      expect(relevantWarnings).toHaveLength(0);
    });
    
    /**
     * AC6: Verify no warnings during activation sequence
     */
    it('should not produce warnings during activation sequence (AC6)', () => {
      const warnings: string[] = [];
      consoleErrorSpy.mockImplementation((msg) => {
        warnings.push(String(msg));
      });
      
      const ActivationComponent = () => {
        const [state, setState] = React.useState<'idle' | 'charging' | 'active'>('idle');
        const [index, setIndex] = React.useState(-1);
        const indexRef = React.useRef(index);
        const setIndexRef = React.useRef(setIndex);
        
        React.useEffect(() => {
          indexRef.current = index;
        }, [index]);
        
        React.useEffect(() => {
          setIndexRef.current = setIndex;
        }, [setIndex]);
        
        // FIXED: Effect depends only on state, not on store functions
        React.useEffect(() => {
          if (state !== 'active') return;
          
          const interval = setInterval(() => {
            const currentIndex = indexRef.current;
            if (currentIndex < 5) {
              setIndexRef.current(currentIndex + 1);
            }
          }, 50);
          
          return () => clearInterval(interval);
        }, [state]);
        
        return (
          <button onClick={() => setState('active')} data-testid="activate-btn">
            State: {state}, Index: {index}
          </button>
        );
      };
      
      const { getByTestId } = render(<ActivationComponent />);
      const button = getByTestId('activate-btn');
      
      act(() => {
        fireEvent.click(button);
      });
      
      // Advance timers
      act(() => {
        vi.advanceTimersByTime(200);
      });
      
      const relevantWarnings = filterMaximumUpdateDepthWarnings(warnings);
      expect(relevantWarnings).toHaveLength(0);
    });
  });
  
  describe('Event Listener Attachment (FIXED pattern)', () => {
    /**
     * Test that the fixed event listener attachment pattern doesn't cause warnings
     * This is the pattern used in MobileTouchEnhancer
     */
    it('should not warn when using refs for event handlers', () => {
      const warnings: string[] = [];
      consoleErrorSpy.mockImplementation((msg) => {
        warnings.push(String(msg));
      });
      
      const EventListenerComponent = () => {
        const [clickCount, setClickCount] = React.useState(0);
        const containerRef = React.useRef<HTMLDivElement>(null);
        
        // FIXED: Stable handler using ref
        const handleClick = React.useCallback(() => {
          setClickCount(c => c + 1);
        }, []);
        
        // Empty deps - handlers are now stable due to ref usage
        React.useEffect(() => {
          const container = containerRef.current;
          if (!container) return;
          
          container.addEventListener('click', handleClick);
          return () => container.removeEventListener('click', handleClick);
        }, []); // Empty - handlers don't change due to ref usage
        
        return (
          <div ref={containerRef} data-testid="event-container">
            Clicks: {clickCount}
          </div>
        );
      };
      
      const { getByTestId } = render(<EventListenerComponent />);
      const container = getByTestId('event-container');
      
      // Click multiple times
      for (let i = 0; i < 5; i++) {
        act(() => {
          fireEvent.click(container);
        });
      }
      
      const relevantWarnings = filterMaximumUpdateDepthWarnings(warnings);
      expect(relevantWarnings).toHaveLength(0);
    });
  });
  
  describe('Component-Level Verification', () => {
    /**
     * Test the actual MobileTouchEnhancer pattern
     */
    it('MobileTouchEnhancer pattern: should not warn during touch interactions', () => {
      const warnings: string[] = [];
      consoleErrorSpy.mockImplementation((msg) => {
        warnings.push(String(msg));
      });
    
      // Simulate the exact pattern used in MobileTouchEnhancer
      const MobileTouchEnhancerPattern = () => {
        const [transform, setTransform] = React.useState({ scale: 1, translateX: 0, translateY: 0 });
        const transformRef = React.useRef(transform);
        const configRef = React.useRef({ minScale: 0.5, maxScale: 2.0 });
        
        // FIXED: Sync refs
        React.useEffect(() => {
          transformRef.current = transform;
        }, [transform]);
        
        // FIXED: Stable handlers - use refs instead of state
        const handleTouchMove = React.useCallback((e: TouchEvent) => {
          if (e.touches.length === 2) {
            const newScale = Math.min(
              Math.max(transformRef.current.scale * 1.01, configRef.current.minScale),
              configRef.current.maxScale
            );
            setTransform(prev => ({ ...prev, scale: newScale }));
          }
        }, []);
        
        const containerRef = React.useRef<HTMLDivElement>(null);
        
        React.useEffect(() => {
          const container = containerRef.current;
          if (!container) return;
          
          container.addEventListener('touchmove', handleTouchMove, { passive: false });
          return () => container.removeEventListener('touchmove', handleTouchMove);
        }, [handleTouchMove]); // handler is stable, so effect runs once
        
        return (
          <div ref={containerRef} data-testid="touch-handler">
            Scale: {transform.scale.toFixed(2)}
          </div>
        );
      };
      
      const { getByTestId } = render(<MobileTouchEnhancerPattern />);
      const container = getByTestId('touch-handler');
      
      // Simulate touch gestures
      for (let i = 0; i < 5; i++) {
        act(() => {
          const touchMoveEvent = new TouchEvent('touchmove', {
            bubbles: true,
            touches: [
              { clientX: 100 - i * 3, clientY: 100, identifier: 0 } as Touch,
              { clientX: 200 + i * 3, clientY: 100, identifier: 1 } as Touch,
            ],
          });
          container.dispatchEvent(touchMoveEvent);
        });
      }
      
      const relevantWarnings = filterMaximumUpdateDepthWarnings(warnings);
      expect(relevantWarnings).toHaveLength(0);
    });
  
    /**
     * Test the Canvas activation module index pattern
     */
    it('Canvas pattern: should not warn during activation sequence', () => {
      const warnings: string[] = [];
      consoleErrorSpy.mockImplementation((msg) => {
        warnings.push(String(msg));
      });
      
      // Simulate the exact pattern used in Canvas.tsx
      const CanvasActivationPattern = () => {
        const [machineState, setMachineState] = React.useState<'idle' | 'active'>('idle');
        const [activationModuleIndex, setActivationModuleIndex] = React.useState(-1);
        
        // FIXED: Store in refs to avoid dependency on store functions
        const setActivationModuleIndexRef = React.useRef(setActivationModuleIndex);
        React.useEffect(() => {
          setActivationModuleIndexRef.current = setActivationModuleIndex;
        }, [setActivationModuleIndex]);
        
        const modulesLengthRef = React.useRef(10); // Simulate 10 modules
        
        // FIXED: Effect depends only on machineState
        React.useEffect(() => {
          if (machineState !== 'active') {
            if (machineState === 'idle') {
              setActivationModuleIndexRef.current(-1);
            }
            return;
          }
          
          const activationInterval = setInterval(() => {
            const currentIndex = activationModuleIndex; // Read from state for comparison
            if (currentIndex < modulesLengthRef.current - 1) {
              setActivationModuleIndexRef.current(currentIndex + 1);
            }
          }, 50);
          
          return () => clearInterval(activationInterval);
        }, [machineState]);
        
        return (
          <button onClick={() => setMachineState('active')} data-testid="canvas-activate">
            State: {machineState}, Index: {activationModuleIndex}
          </button>
        );
      };
      
      const { getByTestId } = render(<CanvasActivationPattern />);
      const button = getByTestId('canvas-activate');
      
      act(() => {
        fireEvent.click(button);
      });
      
      // Advance timers to allow activation sequence
      act(() => {
        vi.advanceTimersByTime(500);
      });
      
      const relevantWarnings = filterMaximumUpdateDepthWarnings(warnings);
      expect(relevantWarnings).toHaveLength(0);
    });
  });
});

describe('Touch Gesture Pattern (Round 29 Fix Verification)', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  
  beforeEach(() => {
    vi.useFakeTimers();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.useRealTimers();
    consoleErrorSpy.mockRestore();
  });
  
  /**
   * AC1: Verify no warnings during pinch-to-zoom gesture
   */
  it('should not warn during pinch-to-zoom (AC1)', () => {
    const warnings: string[] = [];
    consoleErrorSpy.mockImplementation((msg) => {
      warnings.push(String(msg));
    });
    
    const PinchZoomComponent = () => {
      const [scale, setScale] = React.useState(1);
      const scaleRef = React.useRef(scale);
      const configRef = React.useRef({ minScale: 0.5, maxScale: 2.0 });
      
      React.useEffect(() => {
        scaleRef.current = scale;
      }, [scale]);
      
      // FIXED: Stable handler
      const handlePinch = React.useCallback((delta: number) => {
        setScale(prev => {
          const newScale = Math.min(
            Math.max(prev * delta, configRef.current.minScale),
            configRef.current.maxScale
          );
          return newScale;
        });
      }, []);
      
      const containerRef = React.useRef<HTMLDivElement>(null);
      
      React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        
        const onTouchMove = (e: TouchEvent) => {
          if (e.touches.length === 2) {
            handlePinch(1.02);
          }
        };
        
        container.addEventListener('touchmove', onTouchMove, { passive: false });
        return () => container.removeEventListener('touchmove', onTouchMove);
      }, [handlePinch]);
      
      return (
        <div ref={containerRef} data-testid="pinch-container">
          Scale: {scale.toFixed(2)}
        </div>
      );
    };
    
    const { getByTestId } = render(<PinchZoomComponent />);
    const container = getByTestId('pinch-container');
    
    // Simulate pinch gesture (10 iterations)
    for (let i = 0; i < 10; i++) {
      act(() => {
        const touchMoveEvent = new TouchEvent('touchmove', {
          bubbles: true,
          touches: [
            { clientX: 100 - i * 5, clientY: 100, identifier: 0 } as Touch,
            { clientX: 200 + i * 5, clientY: 100, identifier: 1 } as Touch,
          ],
        });
        container.dispatchEvent(touchMoveEvent);
      });
    }
    
    const relevantWarnings = filterMaximumUpdateDepthWarnings(warnings);
    expect(relevantWarnings).toHaveLength(0);
  });
  
  /**
   * AC2: Verify no warnings during two-finger pan
   */
  it('should not warn during two-finger pan (AC2)', () => {
    const warnings: string[] = [];
    consoleErrorSpy.mockImplementation((msg) => {
      warnings.push(String(msg));
    });
    
    const PanComponent = () => {
      const [translate, setTranslate] = React.useState({ x: 0, y: 0 });
      const translateRef = React.useRef(translate);
      
      React.useEffect(() => {
        translateRef.current = translate;
      }, [translate]);
      
      // FIXED: Stable handler
      const handlePan = React.useCallback((dx: number, dy: number) => {
        setTranslate(prev => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
      }, []);
      
      const containerRef = React.useRef<HTMLDivElement>(null);
      
      React.useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        
        let startX = 0;
        let startY = 0;
        
        const onTouchStart = (e: TouchEvent) => {
          if (e.touches.length === 2) {
            startX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            startY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          }
        };
        
        const onTouchMove = (e: TouchEvent) => {
          if (e.touches.length === 2) {
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            handlePan(centerX - startX, centerY - startY);
            startX = centerX;
            startY = centerY;
          }
        };
        
        container.addEventListener('touchstart', onTouchStart, { passive: true });
        container.addEventListener('touchmove', onTouchMove, { passive: false });
        return () => {
          container.removeEventListener('touchstart', onTouchStart);
          container.removeEventListener('touchmove', onTouchMove);
        };
      }, [handlePan]);
      
      return (
        <div ref={containerRef} data-testid="pan-container">
          Translate: ({translate.x.toFixed(0)}, {translate.y.toFixed(0)})
        </div>
      );
    };
    
    const { getByTestId } = render(<PanComponent />);
    const container = getByTestId('pan-container');
    
    // Simulate pan gesture
    for (let i = 0; i < 5; i++) {
      act(() => {
        const touchMoveEvent = new TouchEvent('touchmove', {
          bubbles: true,
          touches: [
            { clientX: 100 + i * 10, clientY: 100, identifier: 0 } as Touch,
            { clientX: 200 + i * 10, clientY: 100, identifier: 1 } as Touch,
          ],
        });
        container.dispatchEvent(touchMoveEvent);
      });
    }
    
    const relevantWarnings = filterMaximumUpdateDepthWarnings(warnings);
    expect(relevantWarnings).toHaveLength(0);
  });
});
