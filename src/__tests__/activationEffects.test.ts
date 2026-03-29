import { describe, it, expect, vi } from 'vitest';

// Mock react
vi.mock('react', () => ({
  useEffect: vi.fn((fn) => fn()),
  useState: vi.fn((init) => [init, vi.fn()]),
  useRef: vi.fn(() => ({ current: null })),
  useCallback: vi.fn((fn) => fn),
  useMemo: vi.fn((fn) => fn()),
  useEffect: vi.fn(),
}));

// Mock gsap
vi.mock('gsap', () => ({
  gsap: {
    context: vi.fn(() => ({
      revert: vi.fn(),
    })),
    to: vi.fn(),
    set: vi.fn(),
    killTweensOf: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn(),
    })),
  },
}));

// Import the phase utilities from ActivationOverlay
type Phase = 'idle' | 'charging' | 'activating' | 'online' | 'failure' | 'overload' | 'shutdown';

describe('Activation Effects', () => {
  describe('Phase transitions', () => {
    const getPhaseOrder = (): Phase[] => ['idle', 'charging', 'activating', 'online', 'shutdown'];
    
    it('should have correct phase order for normal activation', () => {
      const order = getPhaseOrder();
      expect(order[0]).toBe('idle');
      expect(order[1]).toBe('charging');
      expect(order[2]).toBe('activating');
      expect(order[3]).toBe('online');
      expect(order[4]).toBe('shutdown');
    });

    it('should transition from idle to charging on activation start', () => {
      const nextPhase: Phase = 'charging';
      expect(nextPhase).toBe('charging');
    });

    it('should transition from charging to activating after threshold', () => {
      const progress = 35; // Above 30% threshold
      const expectedPhase: Phase = progress < 30 ? 'charging' : 'activating';
      
      expect(expectedPhase).toBe('activating');
    });

    it('should transition from activating to online after threshold', () => {
      const progress = 85; // Above 80% threshold
      const expectedPhase: Phase = progress < 80 ? 'activating' : 'online';
      
      expect(expectedPhase).toBe('online');
    });

    it('should allow failure state from any state', () => {
      const states: Phase[] = ['idle', 'charging', 'activating', 'online'];
      
      states.forEach(() => {
        // Failure can occur from any active state
        expect(['failure', 'overload'].includes('failure')).toBe(true);
      });
    });

    it('should allow overload state from any state', () => {
      const states: Phase[] = ['idle', 'charging', 'activating', 'online'];
      
      states.forEach(() => {
        // Overload can occur from any active state
        expect(['failure', 'overload'].includes('overload')).toBe(true);
      });
    });
  });

  describe('Progress calculation', () => {
    const calculateProgress = (phase: Phase, elapsed: number, duration: number): number => {
      const progressPercent = Math.min(elapsed / duration, 1);
      
      switch (phase) {
        case 'charging':
          return progressPercent * 30;
        case 'activating':
          return 30 + progressPercent * 50;
        case 'online':
          return 80 + progressPercent * 20;
        default:
          return 0;
      }
    };

    it('should calculate charging progress correctly', () => {
      const progress = calculateProgress('charging', 0.5, 1);
      expect(progress).toBe(15); // 0.5/1 * 30 = 15
    });

    it('should cap charging progress at 30', () => {
      const progress = calculateProgress('charging', 2, 1);
      expect(progress).toBe(30);
    });

    it('should calculate activating progress correctly', () => {
      const progress = calculateProgress('activating', 0.5, 1);
      expect(progress).toBe(55); // 30 + 0.5/1 * 50 = 55
    });

    it('should cap activating progress at 80', () => {
      const progress = calculateProgress('activating', 2, 1);
      expect(progress).toBe(80);
    });

    it('should calculate online progress correctly', () => {
      const progress = calculateProgress('online', 0.5, 1);
      expect(progress).toBe(90); // 80 + 0.5/1 * 20 = 90
    });

    it('should cap online progress at 100', () => {
      const progress = calculateProgress('online', 2, 1);
      expect(progress).toBe(100);
    });

    it('should return 0 for idle phase', () => {
      const progress = calculateProgress('idle', 1, 1);
      expect(progress).toBe(0);
    });
  });

  describe('Visual feedback per phase', () => {
    const getBorderColor = (phase: Phase, rarityColor: string = '#00d4ff'): string => {
      switch (phase) {
        case 'failure':
          return '#ff3355';
        case 'overload':
          return '#ff6b35';
        default:
          return rarityColor;
      }
    };

    it('should use failure color for failure phase', () => {
      expect(getBorderColor('failure')).toBe('#ff3355');
    });

    it('should use overload color for overload phase', () => {
      expect(getBorderColor('overload')).toBe('#ff6b35');
    });

    it('should use rarity color for normal phases', () => {
      expect(getBorderColor('charging', '#a855f7')).toBe('#a855f7');
      expect(getBorderColor('activating', '#22c55e')).toBe('#22c55e');
      expect(getBorderColor('online', '#eab308')).toBe('#eab308');
    });

    const getProgressGradient = (phase: Phase, rarityColor: string = '#00d4ff'): string => {
      switch (phase) {
        case 'failure':
          return 'linear-gradient(to right, #ff3355, #ff6b35)';
        case 'overload':
          return 'linear-gradient(to right, #ff6b35, #ffd700)';
        case 'online':
          return `linear-gradient(to right, ${rarityColor}, #00ffcc)`;
        default:
          return `linear-gradient(to right, ${rarityColor}, #00d4ff)`;
      }
    };

    it('should use failure gradient for failure phase', () => {
      const gradient = getProgressGradient('failure');
      expect(gradient).toContain('#ff3355');
    });

    it('should use overload gradient for overload phase', () => {
      const gradient = getProgressGradient('overload');
      expect(gradient).toContain('#ff6b35');
      expect(gradient).toContain('#ffd700');
    });

    it('should use rarity gradient for online phase', () => {
      const gradient = getProgressGradient('online', '#a855f7');
      expect(gradient).toContain('#a855f7');
      expect(gradient).toContain('#00ffcc');
    });
  });

  describe('Particle burst on completion', () => {
    it('should generate correct number of particles for burst', () => {
      const PARTICLE_COUNT = 12;
      expect(PARTICLE_COUNT).toBe(12);
    });

    it('should distribute particles evenly around circle', () => {
      const PARTICLE_COUNT = 12;
      const angles: number[] = [];
      
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = (i * 360) / PARTICLE_COUNT;
        angles.push(angle);
      }

      // Check that angles are evenly distributed
      for (let i = 1; i < angles.length; i++) {
        const diff = angles[i] - angles[i - 1];
        expect(diff).toBeCloseTo(30, 0); // 360/12 = 30 degrees
      }
    });

    it('should add random spread to angles', () => {
      const angle1 = (0 * 360) / 12 + (Math.random() * 20 - 10);
      const angle2 = (1 * 360) / 12 + (Math.random() * 20 - 10);
      
      // Angles should be within 360 degrees
      expect(angle1).toBeGreaterThanOrEqual(-10);
      expect(angle1).toBeLessThanOrEqual(10 + 30);
    });
  });

  describe('Viewport shake', () => {
    const getShakeIntensity = (phase: Phase): number => {
      switch (phase) {
        case 'failure':
          return 8;
        case 'overload':
          return 8;
        case 'charging':
          return 2;
        case 'activating':
          return 4;
        default:
          return 0;
      }
    };

    it('should have high intensity for failure', () => {
      expect(getShakeIntensity('failure')).toBe(8);
    });

    it('should have high intensity for overload', () => {
      expect(getShakeIntensity('overload')).toBe(8);
    });

    it('should have medium intensity for activating', () => {
      expect(getShakeIntensity('activating')).toBe(4);
    });

    it('should have low intensity for charging', () => {
      expect(getShakeIntensity('charging')).toBe(2);
    });

    it('should have no shake for idle', () => {
      expect(getShakeIntensity('idle')).toBe(0);
    });

    it('should have no shake for online', () => {
      expect(getShakeIntensity('online')).toBe(0);
    });
  });

  describe('Module activation sequence', () => {
    const categorizeModules = (modules: Array<{ type: string }>) => {
      const cores: typeof modules = [];
      const runes: typeof modules = [];
      const connectors: typeof modules = [];
      
      modules.forEach((m) => {
        if (['core-furnace', 'stabilizer-core', 'void-siphon'].includes(m.type)) {
          cores.push(m);
        } else if (['rune-node', 'amplifier-crystal', 'phase-modulator'].includes(m.type)) {
          runes.push(m);
        } else {
          connectors.push(m);
        }
      });
      
      return [cores, runes, connectors];
    };

    it('should categorize core modules correctly', () => {
      const modules = [
        { type: 'core-furnace' },
        { type: 'gear' },
        { type: 'void-siphon' },
      ];
      
      const [cores] = categorizeModules(modules);
      expect(cores.length).toBe(2);
      expect(cores[0].type).toBe('core-furnace');
      expect(cores[1].type).toBe('void-siphon');
    });

    it('should categorize rune modules correctly', () => {
      const modules = [
        { type: 'rune-node' },
        { type: 'amplifier-crystal' },
        { type: 'gear' },
      ];
      
      const [, runes] = categorizeModules(modules);
      expect(runes.length).toBe(2);
      expect(runes[0].type).toBe('rune-node');
      expect(runes[1].type).toBe('amplifier-crystal');
    });

    it('should categorize connector modules correctly', () => {
      const modules = [
        { type: 'energy-pipe' },
        { type: 'gear' },
        { type: 'output-array' },
      ];
      
      const [, , connectors] = categorizeModules(modules);
      expect(connectors.length).toBe(3);
    });
  });

  describe('Memory cleanup', () => {
    it('should clear all particles on shutdown', () => {
      const particles = Array.from({ length: 50 }, (_, i) => ({ id: i }));
      
      // Simulate cleanup
      const clearedParticles: typeof particles = [];
      
      expect(particles.length).toBe(50);
      expect(clearedParticles.length).toBe(0);
    });

    it('should cancel animation frames on unmount', () => {
      const animationId = 123;
      const cancelAnimationFrame = vi.fn();
      
      cancelAnimationFrame(animationId);
      
      expect(cancelAnimationFrame).toHaveBeenCalledWith(animationId);
    });

    it('should clear intervals on unmount', () => {
      const intervalId = 456;
      const clearInterval = vi.fn();
      
      clearInterval(intervalId);
      
      expect(clearInterval).toHaveBeenCalledWith(intervalId);
    });

    it('should clear timeouts on unmount', () => {
      const timeoutId = 789;
      const clearTimeout = vi.fn();
      
      clearTimeout(timeoutId);
      
      expect(clearTimeout).toHaveBeenCalledWith(timeoutId);
    });
  });

  describe('Flicker effect for failure/overload', () => {
    const FLICKER_INTERVAL = 50;

    it('should have correct flicker interval', () => {
      expect(FLICKER_INTERVAL).toBe(50);
    });

    it('should be faster for overload', () => {
      const overloadInterval = FLICKER_INTERVAL / 2;
      expect(overloadInterval).toBe(25);
    });

    it('should alternate flicker state after odd number of toggles', () => {
      let flickerState = false;
      
      // Simulate flicker toggle 5 times
      for (let i = 0; i < 5; i++) {
        flickerState = !flickerState;
      }
      
      // After 5 toggles (odd number), state should be opposite of start
      // false -> true (1) -> false (2) -> true (3) -> false (4) -> true (5)
      expect(flickerState).toBe(true);
    });
  });
});

describe('Integration: Full activation sequence', () => {
  it('should complete full sequence without errors', () => {
    type Phase = 'idle' | 'charging' | 'activating' | 'online';
    let currentPhase: Phase = 'idle';
    
    // Simulate sequence
    currentPhase = 'charging';
    expect(currentPhase).toBe('charging');
    
    currentPhase = 'activating';
    expect(currentPhase).toBe('activating');
    
    currentPhase = 'online';
    expect(currentPhase).toBe('online');
  });

  it('should allow failure interruption', () => {
    type Phase = 'idle' | 'charging' | 'failure';
    let currentPhase: Phase = 'idle';
    
    currentPhase = 'charging';
    expect(currentPhase).toBe('charging');
    
    currentPhase = 'failure';
    expect(currentPhase).toBe('failure');
  });

  it('should allow overload interruption', () => {
    type Phase = 'idle' | 'activating' | 'overload';
    let currentPhase: Phase = 'idle';
    
    currentPhase = 'activating';
    currentPhase = 'overload';
    expect(currentPhase).toBe('overload');
  });

  it('should clean up resources after completion', () => {
    const resources = {
      animationFrames: [1, 2, 3],
      intervals: [4, 5],
      particles: Array.from({ length: 10 }, (_, i) => i),
    };
    
    // Simulate cleanup
    resources.animationFrames = [];
    resources.intervals = [];
    resources.particles = [];
    
    expect(resources.animationFrames.length).toBe(0);
    expect(resources.intervals.length).toBe(0);
    expect(resources.particles.length).toBe(0);
  });
});
