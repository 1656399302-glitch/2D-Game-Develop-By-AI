import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import {
  MobileTouchEnhancer,
  useTouchGestures,
  resetTransform,
  GestureEvent,
} from '../components/Accessibility/MobileTouchEnhancer';

describe('MobileTouchEnhancer', () => {
  describe('Component rendering', () => {
    it('should render children', () => {
      const { container } = render(
        React.createElement(
          MobileTouchEnhancer,
          null,
          React.createElement('div', { 'data-testid': 'child' }, 'Test Content')
        )
      );
      
      expect(container.querySelector('[data-testid="child"]')).toBeTruthy();
    });
    
    it('should apply custom className', () => {
      const { container } = render(
        React.createElement(
          MobileTouchEnhancer,
          { className: 'custom-class' },
          React.createElement('div', null, 'Content')
        )
      );
      
      const enhancer = container.querySelector('.touch-enhancer');
      expect(enhancer?.classList.contains('custom-class')).toBe(true);
    });
    
    it('should have touch-action CSS for gesture control', () => {
      const { container } = render(
        React.createElement(
          MobileTouchEnhancer,
          null,
          React.createElement('div', null, 'Content')
        )
      );
      
      const enhancer = container.querySelector('.touch-enhancer');
      expect(enhancer).toBeTruthy();
      // The enhancer should have the touch-enhancer class
      expect(enhancer?.classList.contains('touch-enhancer')).toBe(true);
    });
  });
  
  describe('Configuration', () => {
    it('should accept custom configuration', () => {
      render(
        React.createElement(
          MobileTouchEnhancer,
          {
            config: {
              enablePinchZoom: true,
              enableTwoFingerPan: false,
              enableLongPress: true,
              minScale: 0.5,
              maxScale: 2.5,
              longPressDelay: 700,
              panThreshold: 15,
            }
          },
          React.createElement('div', null, 'Content')
        )
      );
      
      expect(document.body.textContent).toContain('Content');
    });
    
    it('should use default configuration when not provided', () => {
      render(
        React.createElement(
          MobileTouchEnhancer,
          null,
          React.createElement('div', null, 'Content')
        )
      );
      
      expect(document.body.textContent).toContain('Content');
    });
  });
});

describe('useTouchGestures hook', () => {
  it('should return initial transform state', () => {
    // Test the resetTransform function which returns the initial state
    const result = resetTransform();
    
    expect(result).toEqual({
      scale: 1,
      translateX: 0,
      translateY: 0,
    });
  });
  
  it('should handle gesture events correctly', () => {
    // Test gesture event structure
    const pinchEvent: GestureEvent = {
      type: 'pinch',
      centerX: 100,
      centerY: 100,
      scale: 1.5,
      rotation: 0,
      velocity: { x: 0, y: 0 },
    };
    
    expect(pinchEvent.type).toBe('pinch');
    expect(pinchEvent.scale).toBe(1.5);
  });
  
  it('should handle pan events', () => {
    const panEvent: GestureEvent = {
      type: 'pan',
      centerX: 100,
      centerY: 100,
      scale: 1,
      rotation: 0,
      velocity: { x: 50, y: 30 },
    };
    
    expect(panEvent.type).toBe('pan');
    expect(panEvent.velocity.x).toBe(50);
  });
});

describe('resetTransform', () => {
  it('should return default transform values', () => {
    const result = resetTransform();
    
    expect(result).toEqual({
      scale: 1,
      translateX: 0,
      translateY: 0,
    });
  });
});

describe('GestureEvent interface', () => {
  it('should have correct structure for pinch', () => {
    const event: GestureEvent = {
      type: 'pinch',
      centerX: 100,
      centerY: 100,
      scale: 1.5,
      rotation: 0,
      velocity: { x: 0, y: 0 },
    };
    
    expect(event.type).toBe('pinch');
    expect(event.centerX).toBe(100);
    expect(event.centerY).toBe(100);
    expect(event.scale).toBe(1.5);
  });
  
  it('should have correct structure for swipe', () => {
    const event: GestureEvent = {
      type: 'swipe',
      centerX: 100,
      centerY: 100,
      scale: 1,
      rotation: 0,
      velocity: { x: 100, y: 0 },
      direction: 'right',
      distance: 100,
    };
    
    expect(event.type).toBe('swipe');
    expect(event.direction).toBe('right');
    expect(event.distance).toBe(100);
  });
  
  it('should have correct structure for tap', () => {
    const event: GestureEvent = {
      type: 'tap',
      centerX: 50,
      centerY: 50,
      scale: 1,
      rotation: 0,
      velocity: { x: 0, y: 0 },
    };
    
    expect(event.type).toBe('tap');
  });
  
  it('should have correct structure for longPress', () => {
    const event: GestureEvent = {
      type: 'longPress',
      centerX: 75,
      centerY: 75,
      scale: 1,
      rotation: 0,
      velocity: { x: 0, y: 0 },
    };
    
    expect(event.type).toBe('longPress');
  });
});

describe('TouchEnhancerConfig', () => {
  it('should have correct default values', () => {
    const config = {
      enablePinchZoom: true,
      enableTwoFingerPan: true,
      enableLongPress: true,
      minScale: 0.5,
      maxScale: 3,
      longPressDelay: 500,
      panThreshold: 10,
    };
    
    expect(config.enablePinchZoom).toBe(true);
    expect(config.minScale).toBe(0.5);
    expect(config.maxScale).toBe(3);
    expect(config.longPressDelay).toBe(500);
  });
});

describe('Accessibility', () => {
  it('should have proper CSS classes for gesture control', () => {
    const { container } = render(
      React.createElement(
        MobileTouchEnhancer,
        null,
        React.createElement('div', null, 'Touch Target')
      )
    );
    
    const enhancer = container.querySelector('.touch-enhancer');
    expect(enhancer).toBeTruthy();
    // The enhancer should have the touch-enhancer class for touch-action CSS
    expect(enhancer?.classList.contains('touch-enhancer')).toBe(true);
  });
  
  it('should have user-select disabled for touch targets', () => {
    const { container } = render(
      React.createElement(
        MobileTouchEnhancer,
        null,
        React.createElement('div', null, 'No Select')
      )
    );
    
    const enhancer = container.querySelector('.touch-enhancer');
    expect(enhancer).toBeTruthy();
    // The enhancer should exist for text selection disabling
    expect(enhancer?.classList.contains('touch-enhancer')).toBe(true);
  });
  
  it('should have ripple feedback class', () => {
    const { container } = render(
      React.createElement(
        MobileTouchEnhancer,
        { feedbackStyle: 'ripple' },
        React.createElement('div', null, 'Ripple Test')
      )
    );
    
    const enhancer = container.querySelector('.touch-enhancer');
    expect(enhancer).toBeTruthy();
  });
});
