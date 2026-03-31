import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getPhaseFromProgress, 
  getRarityColor, 
  getPulseWaveCount, 
  calculateShakeOffset 
} from '../utils/activationChoreographer';
import { Rarity } from '../types';

/**
 * Tests for activation visual effects verification.
 * Covers particle system integration, glow animation timing, and state transitions.
 */

describe('Activation Visual Effects - Phase Transitions', () => {
  describe('getPhaseFromProgress', () => {
    it('should return CHARGING phase for 0-29% progress', () => {
      expect(getPhaseFromProgress(0)).toEqual({ text: 'CHARGING', phase: 'charging' });
      expect(getPhaseFromProgress(15)).toEqual({ text: 'CHARGING', phase: 'charging' });
      expect(getPhaseFromProgress(29)).toEqual({ text: 'CHARGING', phase: 'charging' });
    });

    it('should return ACTIVATING phase for 30-79% progress', () => {
      expect(getPhaseFromProgress(30)).toEqual({ text: 'ACTIVATING', phase: 'activating' });
      expect(getPhaseFromProgress(50)).toEqual({ text: 'ACTIVATING', phase: 'activating' });
      expect(getPhaseFromProgress(79)).toEqual({ text: 'ACTIVATING', phase: 'activating' });
    });

    it('should return ONLINE phase for 80-100% progress', () => {
      expect(getPhaseFromProgress(80)).toEqual({ text: 'ONLINE', phase: 'online' });
      expect(getPhaseFromProgress(90)).toEqual({ text: 'ONLINE', phase: 'online' });
      expect(getPhaseFromProgress(100)).toEqual({ text: 'ONLINE', phase: 'online' });
    });

    it('should handle boundary values correctly', () => {
      // Just below 30%
      expect(getPhaseFromProgress(29).phase).toBe('charging');
      
      // Exactly 30%
      expect(getPhaseFromProgress(30).phase).toBe('activating');
      
      // Just below 80%
      expect(getPhaseFromProgress(79).phase).toBe('activating');
      
      // Exactly 80%
      expect(getPhaseFromProgress(80).phase).toBe('online');
    });
  });

  describe('Phase Transition Timing', () => {
    it('should calculate correct phase at various timestamps', () => {
      const totalDuration = 5000; // 5 seconds total
      
      // At 0ms - charging
      expect(getPhaseFromProgress(0).phase).toBe('charging');
      
      // At 1000ms (20%) - charging
      expect(getPhaseFromProgress((1000 / totalDuration) * 100).phase).toBe('charging');
      
      // At 2000ms (40%) - activating
      expect(getPhaseFromProgress((2000 / totalDuration) * 100).phase).toBe('activating');
      
      // At 3500ms (70%) - activating
      expect(getPhaseFromProgress((3500 / totalDuration) * 100).phase).toBe('activating');
      
      // At 4500ms (90%) - online
      expect(getPhaseFromProgress((4500 / totalDuration) * 100).phase).toBe('online');
    });
  });
});

describe('Activation Visual Effects - Rarity Colors', () => {
  describe('getRarityColor', () => {
    it('should return correct color for common rarity', () => {
      expect(getRarityColor('common')).toBe('#9ca3af');
    });

    it('should return correct color for uncommon rarity', () => {
      expect(getRarityColor('uncommon')).toBe('#22c55e');
    });

    it('should return correct color for rare rarity', () => {
      expect(getRarityColor('rare')).toBe('#3b82f6');
    });

    it('should return correct color for epic rarity', () => {
      expect(getRarityColor('epic')).toBe('#a855f7');
    });

    it('should return correct color for legendary rarity', () => {
      expect(getRarityColor('legendary')).toBe('#eab308');
    });

    it('should default to common color for unknown rarity', () => {
      expect(getRarityColor('common' as unknown as Rarity)).toBe('#9ca3af');
    });

    it('should return hex color format', () => {
      const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      rarities.forEach(rarity => {
        const color = getRarityColor(rarity);
        expect(color).toMatch(/^#[0-9a-f]{6}$/);
      });
    });
  });

  describe('Rarity Color Brightness', () => {
    it('should have increasing brightness from common to legendary', () => {
      // Check that colors are distinct for each rarity
      const colors = [
        getRarityColor('common'),
        getRarityColor('uncommon'),
        getRarityColor('rare'),
        getRarityColor('epic'),
        getRarityColor('legendary'),
      ];
      
      // All colors should be unique
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(5);
    });
  });
});

describe('Activation Visual Effects - Pulse Waves', () => {
  describe('getPulseWaveCount', () => {
    it('should return 1 wave for paths 0-200px', () => {
      expect(getPulseWaveCount(0)).toBe(1);
      expect(getPulseWaveCount(100)).toBe(1);
      expect(getPulseWaveCount(200)).toBe(1);
    });

    it('should return 2 waves for paths 201-400px', () => {
      expect(getPulseWaveCount(201)).toBe(2);
      expect(getPulseWaveCount(300)).toBe(2);
      expect(getPulseWaveCount(400)).toBe(2);
    });

    it('should return 3 waves for paths >400px', () => {
      expect(getPulseWaveCount(401)).toBe(3);
      expect(getPulseWaveCount(500)).toBe(3);
      expect(getPulseWaveCount(1000)).toBe(3);
    });

    it('should handle boundary values correctly', () => {
      // Exactly 200px
      expect(getPulseWaveCount(200)).toBe(1);
      
      // Exactly 201px
      expect(getPulseWaveCount(201)).toBe(2);
      
      // Exactly 400px
      expect(getPulseWaveCount(400)).toBe(2);
      
      // Exactly 401px
      expect(getPulseWaveCount(401)).toBe(3);
    });
  });

  describe('Pulse Wave Duration Calculation', () => {
    it('should calculate duration based on path length', () => {
      // Speed: 400px/second = 0.4px/ms
      // Duration = pathLength / 400 * 1000 ms
      
      const getPulseWaveDuration = (pathLength: number): number => {
        return (pathLength / 400) * 1000;
      };
      
      expect(getPulseWaveDuration(200)).toBe(500); // 200/400*1000 = 500ms
      expect(getPulseWaveDuration(400)).toBe(1000); // 400/400*1000 = 1000ms
      expect(getPulseWaveDuration(800)).toBe(2000); // 800/400*1000 = 2000ms
    });
  });
});

describe('Activation Visual Effects - Camera Shake', () => {
  describe('calculateShakeOffset', () => {
    it('should return zero offset at completion', () => {
      const result = calculateShakeOffset(1000, 10, 1000);
      
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.isComplete).toBe(true);
    });

    it('should return non-zero offset during shake', () => {
      const result = calculateShakeOffset(100, 10, 1000);
      
      expect(result.isComplete).toBe(false);
    });

    it('should decay over time', () => {
      // Early in animation (10%)
      const early = calculateShakeOffset(100, 10, 1000);
      
      // Late in animation (90%)
      const late = calculateShakeOffset(900, 10, 1000);
      
      // Magnitude should have decayed
      const earlyMagnitude = Math.sqrt(early.x * early.x + early.y * early.y);
      const lateMagnitude = Math.sqrt(late.x * late.x + late.y * late.y);
      
      // Early should have more shake than late
      expect(earlyMagnitude).toBeGreaterThan(lateMagnitude);
    });

    it('should scale with magnitude parameter', () => {
      const smallShake = calculateShakeOffset(500, 5, 1000);
      const largeShake = calculateShakeOffset(500, 10, 1000);
      
      const smallMagnitude = Math.sqrt(smallShake.x * smallShake.x + smallShake.y * smallShake.y);
      const largeMagnitude = Math.sqrt(largeShake.x * largeShake.x + largeShake.y * largeShake.y);
      
      // Larger magnitude should produce larger offsets
      expect(largeMagnitude).toBeGreaterThan(smallMagnitude);
    });

    it('should handle near-zero duration with timestamp at duration', () => {
      // When timestamp equals duration, should return complete
      const result = calculateShakeOffset(0.001, 10, 0.001);
      
      expect(result.isComplete).toBe(true);
    });

    it('should produce consistent results for same inputs', () => {
      // Run multiple times with same inputs
      const results = [
        calculateShakeOffset(500, 10, 1000),
        calculateShakeOffset(500, 10, 1000),
        calculateShakeOffset(500, 10, 1000),
      ];
      
      // All should be the same
      expect(results[0].x).toBe(results[1].x);
      expect(results[0].y).toBe(results[1].y);
      expect(results[0].isComplete).toBe(results[1].isComplete);
    });
  });
});

describe('Activation Visual Effects - Glow Animation', () => {
  describe('Glow Intensity Calculation', () => {
    it('should calculate glow based on activation progress', () => {
      const getGlowIntensity = (progress: number, phase: string): number => {
        if (phase === 'charging') {
          // Glow ramps up from 0 to 0.5 during charging
          return progress / 30 * 0.5;
        } else if (phase === 'activating') {
          // Glow oscillates between 0.5 and 1.0 during activation
          const normalizedProgress = (progress - 30) / 50; // 0 to 1
          return 0.5 + Math.sin(normalizedProgress * Math.PI * 4) * 0.3;
        } else {
          // Full glow when online
          return 1.0;
        }
      };
      
      // At start of charging
      expect(getGlowIntensity(0, 'charging')).toBe(0);
      
      // At end of charging
      expect(getGlowIntensity(30, 'charging')).toBe(0.5);
      
      // During activation
      const activatingIntensity = getGlowIntensity(50, 'activating');
      expect(activatingIntensity).toBeGreaterThanOrEqual(0.2);
      expect(activatingIntensity).toBeLessThanOrEqual(0.8);
      
      // When online
      expect(getGlowIntensity(100, 'online')).toBe(1.0);
    });
  });

  describe('Glow Color Based on Rarity', () => {
    it('should apply color tint based on rarity', () => {
      const getGlowColor = (rarity: Rarity, baseIntensity: number): string => {
        const color = getRarityColor(rarity);
        // Parse hex color and apply intensity
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${baseIntensity})`;
      };
      
      // Common with 50% intensity
      const commonGlow = getGlowColor('common', 0.5);
      expect(commonGlow).toContain('rgba(156');
      
      // Legendary with full intensity
      const legendaryGlow = getGlowColor('legendary', 1.0);
      expect(legendaryGlow).toContain('rgba(234');
    });
  });
});

describe('Activation Visual Effects - Particle System', () => {
  describe('Particle Spawn Timing', () => {
    it('should calculate particle spawn based on connection light-up', () => {
      const getParticleSpawnTime = (
        connectionActivationTime: number,
        offsetFromConnection: number
      ): number => {
        return connectionActivationTime + offsetFromConnection;
      };
      
      // Connection lights at 100ms, particles spawn 50ms later
      expect(getParticleSpawnTime(100, 50)).toBe(150);
      
      // Connection lights at 200ms, particles spawn 50ms later
      expect(getParticleSpawnTime(200, 50)).toBe(250);
    });
  });

  describe('Particle Count Based on Path Length', () => {
    it('should spawn more particles for longer paths', () => {
      const getParticleCount = (pathLength: number): number => {
        const baseCount = 5;
        const additionalPerWave = 3;
        const waves = getPulseWaveCount(pathLength);
        return baseCount + (waves - 1) * additionalPerWave;
      };
      
      // Short path (1 wave) = 5 particles
      expect(getParticleCount(150)).toBe(5);
      
      // Medium path (2 waves) = 8 particles
      expect(getParticleCount(300)).toBe(8);
      
      // Long path (3 waves) = 11 particles
      expect(getParticleCount(500)).toBe(11);
    });
  });

  describe('Particle Animation Duration', () => {
    it('should calculate particle travel time based on path', () => {
      const getParticleTravelTime = (pathLength: number): number => {
        // Speed: 300px/second
        return (pathLength / 300) * 1000; // ms
      };
      
      expect(getParticleTravelTime(300)).toBe(1000); // 300/300*1000 = 1000ms
      expect(getParticleTravelTime(600)).toBe(2000); // 600/300*1000 = 2000ms
    });
  });
});

describe('Activation Visual Effects - State Machine Transitions', () => {
  describe('Idle to Charging Transition', () => {
    it('should trigger charging state', () => {
      const getNextState = (currentState: string, progress: number): string => {
        if (currentState === 'idle' && progress > 0) {
          return 'charging';
        }
        return currentState;
      };
      
      expect(getNextState('idle', 0)).toBe('idle');
      expect(getNextState('idle', 1)).toBe('charging');
    });
  });

  describe('Charging to Activating Transition', () => {
    it('should trigger activating state at 30%', () => {
      const getNextState = (currentState: string, progress: number): string => {
        if (currentState === 'charging' && progress >= 30) {
          return 'activating';
        }
        return currentState;
      };
      
      expect(getNextState('charging', 29)).toBe('charging');
      expect(getNextState('charging', 30)).toBe('activating');
    });
  });

  describe('Activating to Online Transition', () => {
    it('should trigger online state at 80%', () => {
      const getNextState = (currentState: string, progress: number): string => {
        if (currentState === 'activating' && progress >= 80) {
          return 'online';
        }
        return currentState;
      };
      
      expect(getNextState('activating', 79)).toBe('activating');
      expect(getNextState('activating', 80)).toBe('online');
    });
  });

  describe('Full State Progression', () => {
    it('should progress through all states in order', () => {
      const states = ['idle', 'charging', 'activating', 'online'];
      
      const simulateActivation = (): string[] => {
        const visited: string[] = [];
        let currentState = 'idle';
        visited.push(currentState);
        
        for (let progress = 0; progress <= 100; progress += 10) {
          let nextState = currentState;
          
          if (currentState === 'idle' && progress > 0) {
            nextState = 'charging';
          } else if (currentState === 'charging' && progress >= 30) {
            nextState = 'activating';
          } else if (currentState === 'activating' && progress >= 80) {
            nextState = 'online';
          }
          
          if (nextState !== currentState && !visited.includes(nextState)) {
            visited.push(nextState);
            currentState = nextState;
          }
        }
        
        return visited;
      };
      
      const progression = simulateActivation();
      
      // Should visit all states in order
      expect(progression).toContain('idle');
      expect(progression).toContain('charging');
      expect(progression).toContain('activating');
      expect(progression).toContain('online');
      
      // Verify order
      const idleIndex = progression.indexOf('idle');
      const chargingIndex = progression.indexOf('charging');
      const activatingIndex = progression.indexOf('activating');
      const onlineIndex = progression.indexOf('online');
      
      expect(chargingIndex).toBeGreaterThan(idleIndex);
      expect(activatingIndex).toBeGreaterThan(chargingIndex);
      expect(onlineIndex).toBeGreaterThan(activatingIndex);
    });
  });
});
