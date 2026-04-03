/**
 * Connection Path Test Suite
 * 
 * Round 111: Energy Connection System + Module Animation Hooks
 * 
 * Tests for connectionPath utilities
 */

import { describe, it, expect } from 'vitest';
import {
  calculateBezierPath,
  calculateQuadraticPath,
  isValidPath,
  estimatePathLength,
  getPathBounds,
  calculateFlowDashoffset,
  Point,
} from '../utils/connectionPath';

describe('Path Calculation (AC-111-005)', () => {
  describe('calculateBezierPath', () => {
    it('should calculate path between two points', () => {
      const start: Point = { x: 100, y: 100 };
      const end: Point = { x: 300, y: 200 };
      
      const path = calculateBezierPath(start, end);
      
      expect(path).toBeDefined();
      expect(typeof path).toBe('string');
      expect(path.length).toBeGreaterThan(0);
    });
    
    it('should contain move-to command (M)', () => {
      const start: Point = { x: 100, y: 100 };
      const end: Point = { x: 300, y: 200 };
      
      const path = calculateBezierPath(start, end);
      
      expect(path).toContain('M');
    });
    
    it('should contain cubic bezier command (C) for smooth paths', () => {
      const start: Point = { x: 100, y: 100 };
      const end: Point = { x: 300, y: 200 };
      
      const path = calculateBezierPath(start, end, { style: 'smooth' });
      
      expect(path).toContain('C');
    });
    
    it('should use straight line for very close points', () => {
      const start: Point = { x: 100, y: 100 };
      const end: Point = { x: 110, y: 110 };
      
      const path = calculateBezierPath(start, end, { minDistanceForCurve: 50 });
      
      expect(path).toContain('L');
      expect(path).not.toContain('C');
    });
    
    it('should use straight line when style is straight', () => {
      const start: Point = { x: 100, y: 100 };
      const end: Point = { x: 300, y: 200 };
      
      const path = calculateBezierPath(start, end, { style: 'straight' });
      
      expect(path).toContain('L');
      expect(path).not.toContain('C');
    });
    
    it('should use orthogonal path when style is orthogonal', () => {
      const start: Point = { x: 100, y: 100 };
      const end: Point = { x: 300, y: 200 };
      
      const path = calculateBezierPath(start, end, { style: 'orthogonal' });
      
      expect(path).toContain('L');
    });
    
    it('should respect custom tension', () => {
      const start: Point = { x: 100, y: 100 };
      const end: Point = { x: 300, y: 200 };
      
      const pathLowTension = calculateBezierPath(start, end, { tension: 0.2 });
      const pathHighTension = calculateBezierPath(start, end, { tension: 0.8 });
      
      expect(pathLowTension).toBeDefined();
      expect(pathHighTension).toBeDefined();
      // Both should be valid paths
      expect(isValidPath(pathLowTension)).toBe(true);
      expect(isValidPath(pathHighTension)).toBe(true);
    });
    
    it('should respect custom max control offset', () => {
      const start: Point = { x: 100, y: 100 };
      const end: Point = { x: 500, y: 500 };
      
      const path = calculateBezierPath(start, end, { maxControlOffset: 50 });
      
      expect(isValidPath(path)).toBe(true);
    });
  });
  
  describe('calculateQuadraticPath', () => {
    it('should calculate quadratic path between two points', () => {
      const start: Point = { x: 100, y: 100 };
      const end: Point = { x: 300, y: 200 };
      
      const path = calculateQuadraticPath(start, end);
      
      expect(path).toBeDefined();
      expect(path).toContain('Q');
    });
    
    it('should use custom control point when provided', () => {
      const start: Point = { x: 100, y: 100 };
      const end: Point = { x: 300, y: 200 };
      const control: Point = { x: 200, y: 50 };
      
      const path = calculateQuadraticPath(start, end, control);
      
      expect(path).toContain('200 50');
    });
    
    it('should generate control point if not provided', () => {
      const start: Point = { x: 100, y: 100 };
      const end: Point = { x: 300, y: 200 };
      
      const path = calculateQuadraticPath(start, end);
      
      expect(path).toBeDefined();
      expect(isValidPath(path)).toBe(true);
    });
  });
});

describe('Path Validation', () => {
  it('should validate non-empty path', () => {
    expect(isValidPath('M 0 0 L 100 100')).toBe(true);
  });
  
  it('should invalidate empty path', () => {
    expect(isValidPath('')).toBe(false);
  });
  
  it('should invalidate whitespace-only path', () => {
    expect(isValidPath('   ')).toBe(false);
  });
  
  it('should invalidate null/undefined', () => {
    expect(isValidPath(null as any)).toBe(false);
    expect(isValidPath(undefined as any)).toBe(false);
  });
  
  it('should validate path with multiple segments', () => {
    expect(isValidPath('M 0 0 C 10 10, 20 20, 30 30 L 50 50')).toBe(true);
  });
});

describe('Path Length Estimation', () => {
  it('should estimate length for simple line', () => {
    const path = 'M 0 0 L 100 0';
    const length = estimatePathLength(path);
    
    expect(length).toBe(100);
  });
  
  it('should estimate length for diagonal line', () => {
    const path = 'M 0 0 L 100 100';
    const length = estimatePathLength(path);
    
    // Should be approximately 141.42 (sqrt(2) * 100)
    expect(length).toBeGreaterThan(140);
    expect(length).toBeLessThan(142);
  });
  
  it('should estimate length for multi-segment path', () => {
    const path = 'M 0 0 L 50 0 L 50 50 L 100 50';
    const length = estimatePathLength(path);
    
    // Bounding box diagonal: sqrt(100^2 + 50^2) = ~111.8
    expect(length).toBeCloseTo(111.8, 1);
  });
  
  it('should return 0 for empty path', () => {
    const length = estimatePathLength('');
    expect(length).toBe(0);
  });
});

describe('Path Bounds', () => {
  it('should calculate bounds for simple path', () => {
    const path = 'M 10 10 L 100 100';
    const bounds = getPathBounds(path);
    
    expect(bounds.minX).toBe(10);
    expect(bounds.minY).toBe(10);
    expect(bounds.maxX).toBe(100);
    expect(bounds.maxY).toBe(100);
  });
  
  it('should calculate bounds for path with control points', () => {
    const path = 'M 10 10 C 50 0, 60 100, 100 100';
    const bounds = getPathBounds(path);
    
    expect(bounds.minX).toBeLessThanOrEqual(10);
    expect(bounds.minY).toBeLessThanOrEqual(10);
    expect(bounds.maxX).toBeGreaterThanOrEqual(100);
    expect(bounds.maxY).toBeGreaterThanOrEqual(100);
  });
  
  it('should return zeros for empty path', () => {
    const bounds = getPathBounds('');
    
    expect(bounds.minX).toBe(0);
    expect(bounds.minY).toBe(0);
    expect(bounds.maxX).toBe(0);
    expect(bounds.maxY).toBe(0);
  });
});

describe('Energy Flow Animation', () => {
  describe('calculateFlowDashoffset', () => {
    it('should return 0 at progress 0', () => {
      const offset = calculateFlowDashoffset(1000, 0);
      expect(offset).toBeCloseTo(0, 2); // toBeCloseTo handles -0 correctly
    });
    
    it('should return negative value for progress > 0', () => {
      const offset = calculateFlowDashoffset(1000, 0.5);
      expect(offset).toBeLessThan(0);
    });
    
    it('should increase in magnitude with progress', () => {
      const offset1 = calculateFlowDashoffset(1000, 0.25);
      const offset2 = calculateFlowDashoffset(1000, 0.5);
      
      expect(Math.abs(offset2)).toBeGreaterThan(Math.abs(offset1));
    });
    
    it('should scale with path length', () => {
      const offset1 = calculateFlowDashoffset(500, 0.5);
      const offset2 = calculateFlowDashoffset(1000, 0.5);
      
      expect(Math.abs(offset2)).toBeGreaterThan(Math.abs(offset1));
    });
  });
});

describe('Path Edge Cases', () => {
  it('should handle horizontal path', () => {
    const path = calculateBezierPath(
      { x: 0, y: 50 },
      { x: 200, y: 50 }
    );
    
    expect(isValidPath(path)).toBe(true);
  });
  
  it('should handle vertical path', () => {
    const path = calculateBezierPath(
      { x: 50, y: 0 },
      { x: 50, y: 200 }
    );
    
    expect(isValidPath(path)).toBe(true);
  });
  
  it('should handle diagonal path', () => {
    const path = calculateBezierPath(
      { x: 0, y: 0 },
      { x: 200, y: 200 }
    );
    
    expect(isValidPath(path)).toBe(true);
  });
  
  it('should handle reverse direction path', () => {
    const path = calculateBezierPath(
      { x: 200, y: 200 },
      { x: 0, y: 0 }
    );
    
    expect(isValidPath(path)).toBe(true);
  });
  
  it('should handle long distance path', () => {
    const path = calculateBezierPath(
      { x: 0, y: 0 },
      { x: 1000, y: 1000 }
    );
    
    expect(isValidPath(path)).toBe(true);
  });
  
  it('should handle short distance path', () => {
    const path = calculateBezierPath(
      { x: 100, y: 100 },
      { x: 105, y: 105 }
    );
    
    expect(isValidPath(path)).toBe(true);
  });
});

describe('Path Properties', () => {
  it('should produce valid SVG path format', () => {
    const path = calculateBezierPath(
      { x: 100, y: 100 },
      { x: 300, y: 200 }
    );
    
    // Should match pattern: M x y C x1 y1, x2 y2, x3 y3
    const svgPattern = /^M\s*[\d.-]+\s+[\d.-]+\s+C\s+[\d.-]+\s+[\d.-]+,\s*[\d.-]+\s+[\d.-]+,\s*[\d.-]+\s+[\d.-]+$/;
    expect(svgPattern.test(path.trim())).toBe(true);
  });
  
  it('should include numeric coordinates', () => {
    const path = calculateBezierPath(
      { x: 100.5, y: 200.75 },
      { x: 300.25, y: 400.5 }
    );
    
    expect(path).toContain('100.5');
    expect(path).toContain('200.75');
    expect(path).toContain('300.25');
    expect(path).toContain('400.5');
  });
  
  it('should handle negative coordinates', () => {
    const path = calculateBezierPath(
      { x: -100, y: -100 },
      { x: 100, y: 100 }
    );
    
    expect(isValidPath(path)).toBe(true);
  });
});
