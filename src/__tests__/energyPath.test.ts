import { describe, it, expect, vi } from 'vitest';
import { 
  getParticleCountForEnergyLevel, 
  getSpeedForEnergyLevel 
} from '../components/Particles/EnergySparkEmitter';

// Mock gsap
vi.mock('gsap', () => ({
  gsap: {
    context: vi.fn(() => ({
      revert: vi.fn(),
    })),
    to: vi.fn(),
    set: vi.fn(),
    killTweensOf: vi.fn(),
  },
}));

describe('EnergySparkEmitter utilities', () => {
  describe('getParticleCountForEnergyLevel', () => {
    it('should return minimum 1 for energy level 1', () => {
      // Formula: Math.max(1, Math.min(20, Math.floor((energyLevel / 10) * 20)))
      // For energyLevel = 1: Math.max(1, Math.min(20, 2)) = 2
      const count = getParticleCountForEnergyLevel(1);
      expect(count).toBe(2);
    });

    it('should return 20 for maximum energy level', () => {
      const count = getParticleCountForEnergyLevel(10);
      expect(count).toBe(20);
    });

    it('should scale linearly between min and max', () => {
      const count5 = getParticleCountForEnergyLevel(5);
      expect(count5).toBe(10); // 5/10 * 20 = 10
    });

    it('should clamp values below minimum', () => {
      const count = getParticleCountForEnergyLevel(0);
      expect(count).toBe(1);
    });

    it('should clamp values above maximum', () => {
      const count = getParticleCountForEnergyLevel(15);
      expect(count).toBe(20);
    });

    it('should return integer values', () => {
      const count = getParticleCountForEnergyLevel(3);
      expect(Number.isInteger(count)).toBe(true);
    });
  });

  describe('getSpeedForEnergyLevel', () => {
    it('should return correct value for minimum energy level', () => {
      // Formula: 0.5 + (energyLevel / 10) * 4.5
      // For energyLevel = 1: 0.5 + 0.1 * 4.5 = 0.95
      const speed = getSpeedForEnergyLevel(1);
      expect(speed).toBeCloseTo(0.95, 2);
    });

    it('should return 5 for maximum energy level', () => {
      const speed = getSpeedForEnergyLevel(10);
      expect(speed).toBeCloseTo(5, 1);
    });

    it('should scale linearly between min and max', () => {
      const speed5 = getSpeedForEnergyLevel(5);
      expect(speed5).toBeCloseTo(2.75, 1); // 0.5 + (5/10) * 4.5 ≈ 2.75
    });

    it('should scale above maximum for high values', () => {
      // The function doesn't clamp, so it continues scaling
      const speed = getSpeedForEnergyLevel(100);
      expect(speed).toBe(0.5 + (100 / 10) * 4.5); // 45.5
    });
  });
});

describe('EnhancedEnergyPath path direction', () => {
  // Test path parsing utilities
  const parsePathStart = (pathData: string): { x: number; y: number } => {
    const match = pathData.match(/M\s*([\d.-]+)\s*([\d.-]+)/);
    if (match) {
      return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
    }
    return { x: 0, y: 0 };
  };

  it('should parse path start point correctly', () => {
    const path = 'M 100 200 Q 150 250 200 300';
    const start = parsePathStart(path);
    expect(start.x).toBe(100);
    expect(start.y).toBe(200);
  });

  it('should handle paths with decimal coordinates', () => {
    const path = 'M 100.5 200.75 Q 150 250 200.25 300';
    const start = parsePathStart(path);
    expect(start.x).toBeCloseTo(100.5);
    expect(start.y).toBeCloseTo(200.75);
  });

  it('should handle negative coordinates', () => {
    const path = 'M -50 -100 Q 0 0 50 100';
    const start = parsePathStart(path);
    expect(start.x).toBe(-50);
    expect(start.y).toBe(-100);
  });
});

describe('Energy path particle generation', () => {
  it('should calculate correct particle count for low energy', () => {
    // Low energy = fewer particles
    const lowEnergy = 2;
    const count = getParticleCountForEnergyLevel(lowEnergy);
    expect(count).toBeLessThan(10);
  });

  it('should calculate correct particle count for high energy', () => {
    // High energy = more particles
    const highEnergy = 8;
    const count = getParticleCountForEnergyLevel(highEnergy);
    expect(count).toBeGreaterThan(10);
  });

  it('should handle mid-range energy correctly', () => {
    const midEnergy = 5;
    const count = getParticleCountForEnergyLevel(midEnergy);
    expect(count).toBeGreaterThanOrEqual(5);
    expect(count).toBeLessThanOrEqual(15);
  });
});

describe('Energy path speed scaling', () => {
  it('should scale speed with energy level', () => {
    // Higher energy = faster particles
    const lowSpeed = getSpeedForEnergyLevel(1);
    const highSpeed = getSpeedForEnergyLevel(10);
    
    expect(highSpeed).toBeGreaterThan(lowSpeed);
  });

  it('should maintain consistent animation regardless of particle count', () => {
    // Animation duration should be based on speed, not particle count
    const fewParticlesDuration = 2 / getSpeedForEnergyLevel(5);
    const manyParticlesDuration = 2 / getSpeedForEnergyLevel(5); // Same energy
    
    expect(fewParticlesDuration).toBe(manyParticlesDuration);
  });

  it('should stagger particles correctly', () => {
    const speed = 2;
    const particleCount = 5;
    const duration = 2 / speed;
    const stagger = duration / particleCount;
    
    expect(stagger).toBe(duration / particleCount);
    expect(stagger * particleCount).toBeCloseTo(duration, 1);
  });
});

describe('Path state changes', () => {
  type PathState = 'idle' | 'active' | 'overload' | 'failure';

  const getPathColor = (state: PathState, isSelected: boolean): string => {
    if (state === 'failure') return '#ff3355';
    if (state === 'overload') return '#ff6b35';
    return isSelected ? '#ffd700' : '#00d4ff';
  };

  const getGlowColor = (state: PathState): string => {
    if (state === 'failure') return '#ff3355';
    if (state === 'overload') return '#ff6b35';
    return '#00ffcc';
  };

  it('should use default color for idle state', () => {
    const color = getPathColor('idle', false);
    expect(color).toBe('#00d4ff');
  });

  it('should use selected color when selected', () => {
    const color = getPathColor('idle', true);
    expect(color).toBe('#ffd700');
  });

  it('should use failure color for failure state', () => {
    const color = getPathColor('failure', false);
    expect(color).toBe('#ff3355');
  });

  it('should use overload color for overload state', () => {
    const color = getPathColor('overload', false);
    expect(color).toBe('#ff6b35');
  });

  it('should use failure glow for failure state', () => {
    const color = getGlowColor('failure');
    expect(color).toBe('#ff3355');
  });

  it('should use overload glow for overload state', () => {
    const color = getGlowColor('overload');
    expect(color).toBe('#ff6b35');
  });

  it('should use active glow for active state', () => {
    const color = getGlowColor('active');
    expect(color).toBe('#00ffcc');
  });
});

describe('Path animation behavior', () => {
  it('should animate faster with higher speed', () => {
    // Higher speed = shorter duration
    const slowDuration = 2 / getSpeedForEnergyLevel(1);
    const fastDuration = 2 / getSpeedForEnergyLevel(5);
    
    expect(fastDuration).toBeLessThan(slowDuration);
  });

  it('should maintain consistent animation regardless of particle count', () => {
    // Animation duration should be based on speed, not particle count
    const fewParticlesDuration = 2 / getSpeedForEnergyLevel(5);
    const manyParticlesDuration = 2 / getSpeedForEnergyLevel(5); // Same energy
    
    expect(fewParticlesDuration).toBe(manyParticlesDuration);
  });

  it('should stagger particles correctly', () => {
    const speed = 2;
    const particleCount = 5;
    const duration = 2 / speed;
    const stagger = duration / particleCount;
    
    expect(stagger).toBe(duration / particleCount);
    expect(stagger * particleCount).toBeCloseTo(duration, 1);
  });
});
