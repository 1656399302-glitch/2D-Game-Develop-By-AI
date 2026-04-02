/**
 * Unit tests for Activation Visual Effects Utilities
 * Tests screen shake, vignette, glow, and faction color calculations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  // Power calculations
  calculatePowerOutput,
  getPowerLevel,
  POWER_THRESHOLD_LOW,
  POWER_THRESHOLD_MEDIUM,
  POWER_THRESHOLD_HIGH,
  POWER_THRESHOLD_MAX,
  
  // Glow calculations
  calculateGlowRadius,
  getFactionGlowColor,
  getFactionGlowRGB,
  calculateGlowIntensity,
  GLOW_RADIUS_LOW_POWER,
  GLOW_RADIUS_BASELINE,
  GLOW_RADIUS_HIGH_POWER,
  GLOW_RADIUS_MAX,
  
  // Vignette calculations
  calculateVignetteOpacity,
  getVignetteColor,
  getVignetteGradientStops,
  VIGNETTE_OPACITY_MIN,
  VIGNETTE_OPACITY_LOW,
  VIGNETTE_OPACITY_MEDIUM,
  VIGNETTE_OPACITY_HIGH,
  VIGNETTE_OPACITY_CRITICAL,
  
  // Screen shake calculations
  calculateShakeDuration,
  calculateShakeIntensity,
  calculateShakeOffset,
  shouldShake,
  SHAKE_DURATION_MIN,
  SHAKE_DURATION_MAX,
  SHAKE_INTENSITY_LOW,
  SHAKE_INTENSITY_MEDIUM,
  SHAKE_INTENSITY_HIGH,
  SHAKE_INTENSITY_CRITICAL,
  
  // Phase transition utilities
  getTransitionDuration,
  calculateEnergyBuildup,
  getPhaseInfo,
  
  // Particle utilities
  calculateParticleCount,
  calculateParticleSpeed,
  getParticleColors,
  
  // Distortion utilities
  calculateDistortionIntensity,
  calculateNoiseOffset,
  
  // Rarity effects
  getRarityEffectColor,
  applyRarityModifier,
  
  // Dominant faction
  calculateDominantFaction,
} from '../utils/activation/effects';

import { MachineState } from '../types';

// =============================================================================
// POWER OUTPUT TESTS
// =============================================================================

describe('Power Output Calculations', () => {
  describe('calculatePowerOutput', () => {
    it('should return 50 as default when no stats provided', () => {
      expect(calculatePowerOutput()).toBe(50);
    });

    it('should return 50 when empty stats object provided', () => {
      expect(calculatePowerOutput({})).toBe(50);
    });

    it('should use powerOutput directly when provided', () => {
      expect(calculatePowerOutput({ powerOutput: 80 })).toBeGreaterThan(50);
      expect(calculatePowerOutput({ powerOutput: 20 })).toBeLessThan(50);
    });

    it('should factor in stability - higher stability reduces power', () => {
      const highStability = calculatePowerOutput({ powerOutput: 80, stability: 100 });
      const lowStability = calculatePowerOutput({ powerOutput: 80, stability: 0 });
      expect(highStability).toBeLessThan(lowStability);
    });

    it('should factor in energyCost - higher cost increases power demand', () => {
      const highCost = calculatePowerOutput({ energyCost: 100 });
      const lowCost = calculatePowerOutput({ energyCost: 0 });
      expect(highCost).toBeGreaterThan(lowCost);
    });

    it('should clamp output between 0 and 100', () => {
      expect(calculatePowerOutput({ powerOutput: -50 })).toBe(0);
      // Very high power output after modifiers should still be clamped
      const result = calculatePowerOutput({ powerOutput: 150 });
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  describe('getPowerLevel', () => {
    it('should return "low" for power output < 30', () => {
      expect(getPowerLevel(0)).toBe('low');
      expect(getPowerLevel(29)).toBe('low');
      expect(getPowerLevel(30)).not.toBe('low');
    });

    it('should return "medium" for power output 30-59', () => {
      expect(getPowerLevel(30)).toBe('medium');
      expect(getPowerLevel(59)).toBe('medium');
      expect(getPowerLevel(60)).not.toBe('medium');
    });

    it('should return "high" for power output 60-79', () => {
      expect(getPowerLevel(60)).toBe('high');
      expect(getPowerLevel(79)).toBe('high');
      expect(getPowerLevel(80)).not.toBe('high');
    });

    it('should return "max" for power output 80-100', () => {
      expect(getPowerLevel(80)).toBe('max');
      expect(getPowerLevel(100)).toBe('max');
    });
  });
});

// =============================================================================
// GLOW RADIUS TESTS
// =============================================================================

describe('Glow Radius Calculations', () => {
  describe('calculateGlowRadius', () => {
    it('should return GLOW_RADIUS_LOW_POWER at power 0', () => {
      expect(calculateGlowRadius(0)).toBeCloseTo(GLOW_RADIUS_LOW_POWER, 2);
    });

    it('should return GLOW_RADIUS_BASELINE at power 30', () => {
      expect(calculateGlowRadius(30)).toBeCloseTo(GLOW_RADIUS_BASELINE, 2);
    });

    it('should scale linearly from 0-30 power', () => {
      const r0 = calculateGlowRadius(0);
      const r15 = calculateGlowRadius(15);
      const r30 = calculateGlowRadius(30);
      expect(r15).toBeCloseTo((r0 + r30) / 2, 1);
    });

    it('should return approximately 1.3 at power 60', () => {
      expect(calculateGlowRadius(60)).toBeCloseTo(1.3, 1);
    });

    it('should return GLOW_RADIUS_HIGH_POWER (1.5) at power 80', () => {
      expect(calculateGlowRadius(80)).toBeCloseTo(GLOW_RADIUS_HIGH_POWER, 2);
    });

    it('should return GLOW_RADIUS_MAX at power 100', () => {
      expect(calculateGlowRadius(100)).toBeCloseTo(GLOW_RADIUS_MAX, 2);
    });

    it('should handle edge cases at threshold values', () => {
      expect(calculateGlowRadius(30)).toBeGreaterThanOrEqual(GLOW_RADIUS_BASELINE);
      expect(calculateGlowRadius(60)).toBeGreaterThanOrEqual(1.3);
      expect(calculateGlowRadius(80)).toBeGreaterThanOrEqual(GLOW_RADIUS_HIGH_POWER);
    });
  });

  describe('getFactionGlowColor', () => {
    it('should return default color when no faction provided', () => {
      expect(getFactionGlowColor()).toBe('#00d4ff');
    });

    it('should return default color for undefined faction', () => {
      expect(getFactionGlowColor(undefined, '#ff0000')).toBe('#ff0000');
    });

    it('should return faction glow color for valid factions', () => {
      // Void faction
      const voidColor = getFactionGlowColor('void');
      expect(voidColor).toBe('#7B2FBE');
      
      // Inferno faction
      const infernoColor = getFactionGlowColor('inferno');
      expect(infernoColor).toBe('#E85D04');
      
      // Storm faction
      const stormColor = getFactionGlowColor('storm');
      expect(stormColor).toBe('#48CAE4');
    });

    it('should return default for unknown faction', () => {
      const unknownColor = getFactionGlowColor('unknown' as any);
      expect(unknownColor).toBe('#00d4ff');
    });
  });

  describe('getFactionGlowRGB', () => {
    it('should return default cyan RGB when no faction', () => {
      const rgb = getFactionGlowRGB();
      expect(rgb).toEqual({ r: 0, g: 212, b: 255 });
    });

    it('should return correct RGB for void faction', () => {
      const rgb = getFactionGlowRGB('void');
      expect(rgb.r).toBe(123); // 0x7B
      expect(rgb.g).toBe(47);  // 0x2F
      expect(rgb.b).toBe(190); // 0xBE
    });

    it('should return correct RGB for inferno faction', () => {
      const rgb = getFactionGlowRGB('inferno');
      expect(rgb.r).toBe(232); // 0xE8
      expect(rgb.g).toBe(93);  // 0x5D
      expect(rgb.b).toBe(4);   // 0x04
    });

    it('should return correct RGB for storm faction', () => {
      const rgb = getFactionGlowRGB('storm');
      expect(rgb.r).toBe(72);  // 0x48
      expect(rgb.g).toBe(202); // 0xCA
      expect(rgb.b).toBe(228); // 0xE4
    });
  });

  describe('calculateGlowIntensity', () => {
    it('should return base intensity at power 0', () => {
      const intensity = calculateGlowIntensity(0);
      expect(intensity).toBeGreaterThanOrEqual(0.3);
      expect(intensity).toBeLessThan(0.5);
    });

    it('should increase with power output', () => {
      const lowPower = calculateGlowIntensity(20);
      const highPower = calculateGlowIntensity(80);
      expect(highPower).toBeGreaterThan(lowPower);
    });

    it('should not exceed 1.0', () => {
      expect(calculateGlowIntensity(100)).toBeLessThanOrEqual(1);
    });

    it('should scale properly across full range', () => {
      expect(calculateGlowIntensity(0)).toBeLessThan(calculateGlowIntensity(50));
      expect(calculateGlowIntensity(50)).toBeLessThan(calculateGlowIntensity(100));
    });
  });
});

// =============================================================================
// VIGNETTE TESTS
// =============================================================================

describe('Vignette Calculations', () => {
  describe('calculateVignetteOpacity', () => {
    it('should return 0 for idle state', () => {
      expect(calculateVignetteOpacity('idle')).toBe(VIGNETTE_OPACITY_MIN);
    });

    it('should return low opacity for charging state', () => {
      const opacity = calculateVignetteOpacity('charging', 50);
      expect(opacity).toBe(VIGNETTE_OPACITY_LOW);
    });

    it('should return medium opacity for active state', () => {
      const opacity = calculateVignetteOpacity('active', 50);
      expect(opacity).toBeGreaterThan(VIGNETTE_OPACITY_LOW);
      expect(opacity).toBeLessThanOrEqual(VIGNETTE_OPACITY_MEDIUM);
    });

    it('should scale with power output for active state', () => {
      const lowPower = calculateVignetteOpacity('active', 30);
      const highPower = calculateVignetteOpacity('active', 90);
      expect(highPower).toBeGreaterThan(lowPower);
    });

    it('should return high opacity for overload state', () => {
      const opacity = calculateVignetteOpacity('overload', 50);
      expect(opacity).toBeGreaterThanOrEqual(0.35);
    });

    it('should return high opacity for failure state regardless of power', () => {
      expect(calculateVignetteOpacity('failure', 0)).toBe(VIGNETTE_OPACITY_HIGH);
      expect(calculateVignetteOpacity('failure', 100)).toBe(VIGNETTE_OPACITY_HIGH);
    });

    it('should return low opacity for shutdown state', () => {
      const opacity = calculateVignetteOpacity('shutdown', 50);
      expect(opacity).toBeLessThan(VIGNETTE_OPACITY_LOW);
    });

    it('should handle isOverload flag', () => {
      const normalActive = calculateVignetteOpacity('active', 80, false);
      const overloadActive = calculateVignetteOpacity('active', 80, true);
      expect(overloadActive).toBeGreaterThan(normalActive);
    });
  });

  describe('getVignetteColor', () => {
    it('should return black for idle state', () => {
      expect(getVignetteColor('idle')).toContain('0, 0, 0');
    });

    it('should return red for failure state', () => {
      expect(getVignetteColor('failure')).toContain('255, 51, 85');
    });

    it('should return orange-red for overload state', () => {
      expect(getVignetteColor('overload')).toContain('255, 107, 53');
    });

    it('should return orange-red when isOverload flag is true', () => {
      expect(getVignetteColor('active', true)).toContain('255, 107, 53');
    });

    it('should return black for charging and active states', () => {
      expect(getVignetteColor('charging')).toContain('0, 0, 0');
      expect(getVignetteColor('active')).toContain('0, 0, 0');
    });
  });

  describe('getVignetteGradientStops', () => {
    it('should return 50% inner stop at intensity 0', () => {
      const stops = getVignetteGradientStops(0);
      expect(stops.inner).toBe(50);
    });

    it('should decrease inner stop as intensity increases', () => {
      const lowIntensity = getVignetteGradientStops(0.3);
      const highIntensity = getVignetteGradientStops(0.8);
      expect(highIntensity.inner).toBeLessThan(lowIntensity.inner);
    });

    it('should always return 100 for outer stop', () => {
      const stops = getVignetteGradientStops(1);
      expect(stops.outer).toBe(100);
    });
  });
});

// =============================================================================
// SCREEN SHAKE TESTS
// =============================================================================

describe('Screen Shake Calculations', () => {
  describe('calculateShakeDuration', () => {
    it('should return 0 for idle state', () => {
      expect(calculateShakeDuration('idle')).toBe(0);
    });

    it('should return minimum duration for charging', () => {
      expect(calculateShakeDuration('charging')).toBe(SHAKE_DURATION_MIN);
    });

    it('should return medium duration for active', () => {
      const duration = calculateShakeDuration('active');
      expect(duration).toBeGreaterThan(SHAKE_DURATION_MIN);
      expect(duration).toBeLessThan(SHAKE_DURATION_MAX);
    });

    it('should return maximum duration for overload', () => {
      expect(calculateShakeDuration('overload')).toBe(SHAKE_DURATION_MAX);
    });

    it('should return maximum duration for failure', () => {
      expect(calculateShakeDuration('failure')).toBe(SHAKE_DURATION_MAX);
    });

    it('should return 0 for shutdown state', () => {
      expect(calculateShakeDuration('shutdown')).toBe(0);
    });
  });

  describe('calculateShakeIntensity', () => {
    it('should return 0 for idle state', () => {
      expect(calculateShakeIntensity('idle')).toBe(0);
    });

    it('should return low intensity for charging', () => {
      const intensity = calculateShakeIntensity('charging');
      expect(intensity).toBe(SHAKE_INTENSITY_LOW);
    });

    it('should return medium intensity for active', () => {
      const intensity = calculateShakeIntensity('active');
      expect(intensity).toBe(SHAKE_INTENSITY_MEDIUM);
    });

    it('should return high intensity for overload', () => {
      const intensity = calculateShakeIntensity('overload');
      expect(intensity).toBe(SHAKE_INTENSITY_HIGH);
    });

    it('should return critical intensity for failure', () => {
      const intensity = calculateShakeIntensity('failure');
      expect(intensity).toBe(SHAKE_INTENSITY_CRITICAL);
    });

    it('should scale with power output', () => {
      const lowPower = calculateShakeIntensity('active', 30);
      const highPower = calculateShakeIntensity('active', 90);
      expect(highPower).toBeGreaterThan(lowPower);
    });

    it('should not exceed critical intensity', () => {
      const intensity = calculateShakeIntensity('failure', 100);
      expect(intensity).toBeLessThanOrEqual(SHAKE_INTENSITY_CRITICAL);
    });

    it('should handle isOverload flag', () => {
      const normalActive = calculateShakeIntensity('active', 80, false);
      const overloadActive = calculateShakeIntensity('active', 80, true);
      expect(overloadActive).toBeGreaterThan(normalActive);
    });
  });

  describe('calculateShakeOffset', () => {
    it('should return complete at duration 0', () => {
      const result = calculateShakeOffset(0, 5, 0);
      expect(result.isComplete).toBe(true);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('should return complete at intensity 0', () => {
      const result = calculateShakeOffset(100, 0, 1000);
      expect(result.isComplete).toBe(true);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('should return incomplete at progress < 1', () => {
      const result = calculateShakeOffset(100, 5, 1000);
      expect(result.isComplete).toBe(false);
    });

    it('should return complete at progress >= 1', () => {
      const result = calculateShakeOffset(1001, 5, 1000);
      expect(result.isComplete).toBe(true);
    });

    it('should produce non-zero offsets during active shake', () => {
      const result1 = calculateShakeOffset(100, 5, 1000);
      const result2 = calculateShakeOffset(200, 5, 1000);
      // Offsets should be different at different timestamps
      expect(result1.x).not.toBe(result2.x);
    });

    it('should decay over time', () => {
      const early = calculateShakeOffset(100, 5, 1000);
      const late = calculateShakeOffset(900, 5, 1000);
      // Late offsets should be smaller due to decay
      const earlyMagnitude = Math.abs(early.x) + Math.abs(early.y);
      const lateMagnitude = Math.abs(late.x) + Math.abs(late.y);
      expect(lateMagnitude).toBeLessThan(earlyMagnitude);
    });
  });

  describe('shouldShake', () => {
    it('should return false for idle', () => {
      expect(shouldShake('idle')).toBe(false);
    });

    it('should return true for charging', () => {
      expect(shouldShake('charging')).toBe(true);
    });

    it('should return true for active', () => {
      expect(shouldShake('active')).toBe(true);
    });

    it('should return true for overload', () => {
      expect(shouldShake('overload')).toBe(true);
    });

    it('should return true for failure', () => {
      expect(shouldShake('failure')).toBe(true);
    });

    it('should return false for shutdown', () => {
      expect(shouldShake('shutdown')).toBe(false);
    });
  });
});

// =============================================================================
// PHASE TRANSITION TESTS
// =============================================================================

describe('Phase Transition Utilities', () => {
  describe('getTransitionDuration', () => {
    it('should return slow duration for idle to charging', () => {
      const duration = getTransitionDuration('idle', 'charging');
      expect(duration).toBe(500);
    });

    it('should return normal duration for charging to active', () => {
      const duration = getTransitionDuration('charging', 'active');
      expect(duration).toBe(300);
    });

    it('should return normal duration for active to shutdown', () => {
      const duration = getTransitionDuration('active', 'shutdown');
      expect(duration).toBe(300);
    });

    it('should return slow duration for failure to idle', () => {
      const duration = getTransitionDuration('failure', 'idle');
      expect(duration).toBe(500);
    });

    it('should return slow duration for overload to idle', () => {
      const duration = getTransitionDuration('overload', 'idle');
      expect(duration).toBe(500);
    });

    it('should return fast duration for quick transitions', () => {
      const duration = getTransitionDuration('idle', 'idle');
      expect(duration).toBe(150);
    });
  });

  describe('calculateEnergyBuildup', () => {
    it('should return 0 for progress 0', () => {
      expect(calculateEnergyBuildup(0)).toBe(0);
    });

    it('should return 1 for progress >= 1', () => {
      expect(calculateEnergyBuildup(1)).toBe(1);
      expect(calculateEnergyBuildup(2)).toBe(1);
    });

    it('should scale linearly for progress 0-1', () => {
      expect(calculateEnergyBuildup(0.5)).toBe(0.5);
    });

    it('should clamp negative values to 0', () => {
      expect(calculateEnergyBuildup(-0.5)).toBe(0);
    });
  });

  describe('getPhaseInfo', () => {
    it('should return correct info for idle', () => {
      const info = getPhaseInfo('idle');
      expect(info.title).toBe('IDLE');
      expect(info.color).toBe('#9ca3af');
    });

    it('should return correct info for charging', () => {
      const info = getPhaseInfo('charging');
      expect(info.title).toBe('CHARGING');
      expect(info.color).toBe('#00d4ff');
    });

    it('should return correct info for active', () => {
      const info = getPhaseInfo('active');
      expect(info.title).toBe('ACTIVATING');
      expect(info.color).toBe('#00ffcc');
    });

    it('should return correct info for overload', () => {
      const info = getPhaseInfo('overload');
      expect(info.title).toBe('OVERLOAD');
      expect(info.color).toBe('#ff6b35');
    });

    it('should return correct info for failure', () => {
      const info = getPhaseInfo('failure');
      expect(info.title).toBe('FAILURE');
      expect(info.color).toBe('#ff3355');
    });

    it('should return correct info for shutdown', () => {
      const info = getPhaseInfo('shutdown');
      expect(info.title).toBe('ONLINE');
      expect(info.color).toBe('#22c55e');
    });
  });
});

// =============================================================================
// PARTICLE EFFECT TESTS
// =============================================================================

describe('Particle Effect Utilities', () => {
  describe('calculateParticleCount', () => {
    it('should return base count when power is low', () => {
      const count = calculateParticleCount(10, 20, 'active');
      expect(count).toBe(10);
    });

    it('should increase count for high power output', () => {
      const lowPower = calculateParticleCount(10, 40, 'active');
      const highPower = calculateParticleCount(10, 90, 'active');
      expect(highPower).toBeGreaterThan(lowPower);
    });

    it('should increase count during overload', () => {
      const normal = calculateParticleCount(10, 50, 'active', false);
      const overload = calculateParticleCount(10, 50, 'active', true);
      expect(overload).toBeGreaterThan(normal);
    });

    it('should double count during failure', () => {
      const active = calculateParticleCount(10, 50, 'active');
      const failure = calculateParticleCount(10, 50, 'failure');
      expect(failure).toBe(active * 2);
    });
  });

  describe('calculateParticleSpeed', () => {
    it('should return slower speed at low power', () => {
      const speed = calculateParticleSpeed(5, 0);
      expect(speed).toBe(4); // 0.8 * 5 = 4
    });

    it('should return faster speed at high power', () => {
      const lowPower = calculateParticleSpeed(5, 30);
      const highPower = calculateParticleSpeed(5, 90);
      expect(highPower).toBeGreaterThan(lowPower);
    });

    it('should scale properly across full range', () => {
      expect(calculateParticleSpeed(5, 0)).toBe(4);
      expect(calculateParticleSpeed(5, 100)).toBe(7);
    });
  });

  describe('getParticleColors', () => {
    it('should return array of colors', () => {
      const colors = getParticleColors();
      expect(Array.isArray(colors)).toBe(true);
      expect(colors.length).toBeGreaterThan(0);
    });

    it('should include white sparkle', () => {
      const colors = getParticleColors();
      expect(colors.some(c => c.includes('255, 255, 255'))).toBe(true);
    });

    it('should include faction color variations', () => {
      const voidColors = getParticleColors('void');
      expect(voidColors.some(c => c.includes('123'))).toBe(true); // Void r value
    });

    it('should return different colors for different factions', () => {
      const voidColors = getParticleColors('void');
      const infernoColors = getParticleColors('inferno');
      expect(voidColors[0]).not.toBe(infernoColors[0]);
    });
  });
});

// =============================================================================
// DISTORTION EFFECT TESTS
// =============================================================================

describe('Distortion Effect Utilities', () => {
  describe('calculateDistortionIntensity', () => {
    it('should return 0 for idle state', () => {
      expect(calculateDistortionIntensity('idle')).toBe(0);
    });

    it('should return 0 for charging state', () => {
      expect(calculateDistortionIntensity('charging')).toBe(0);
    });

    it('should return 0 for active state', () => {
      expect(calculateDistortionIntensity('active')).toBe(0);
    });

    it('should return 0.15 for overload at low power', () => {
      const intensity = calculateDistortionIntensity('overload', 0);
      expect(intensity).toBeCloseTo(0.15, 1);
    });

    it('should return 0.3 for overload at high power', () => {
      const intensity = calculateDistortionIntensity('overload', 100);
      expect(intensity).toBeCloseTo(0.3, 1);
    });

    it('should return 0.3 for failure state regardless of power', () => {
      expect(calculateDistortionIntensity('failure', 0)).toBe(0.3);
      expect(calculateDistortionIntensity('failure', 100)).toBe(0.3);
    });

    it('should scale overload distortion with power', () => {
      const lowPower = calculateDistortionIntensity('overload', 30);
      const highPower = calculateDistortionIntensity('overload', 90);
      expect(highPower).toBeGreaterThan(lowPower);
    });
  });

  describe('calculateNoiseOffset', () => {
    it('should return x and y offsets', () => {
      const offset = calculateNoiseOffset(0.5, 100);
      expect(typeof offset.x).toBe('number');
      expect(typeof offset.y).toBe('number');
    });

    it('should return bounded offsets', () => {
      const offset = calculateNoiseOffset(0.5, 100);
      // With intensity 0.5, max offset should be 0.5 * 20 = 10
      expect(Math.abs(offset.x)).toBeLessThanOrEqual(10);
    });

    it('should return different offsets at different times', () => {
      const offset1 = calculateNoiseOffset(0.5, 100);
      const offset2 = calculateNoiseOffset(0.5, 200);
      // With sin-based y component, they should be different
      expect(offset1.y).not.toBe(offset2.y);
    });
  });
});

// =============================================================================
// RARITY EFFECT TESTS
// =============================================================================

describe('Rarity Effect Utilities', () => {
  describe('getRarityEffectColor', () => {
    it('should return gray for common', () => {
      expect(getRarityEffectColor('common')).toBe('#9ca3af');
    });

    it('should return green for uncommon', () => {
      expect(getRarityEffectColor('uncommon')).toBe('#22c55e');
    });

    it('should return blue for rare', () => {
      expect(getRarityEffectColor('rare')).toBe('#3b82f6');
    });

    it('should return purple for epic', () => {
      expect(getRarityEffectColor('epic')).toBe('#a855f7');
    });

    it('should return gold for legendary', () => {
      expect(getRarityEffectColor('legendary')).toBe('#eab308');
    });

    it('should default to common for unknown rarity', () => {
      expect(getRarityEffectColor('unknown' as any)).toBe('#9ca3af');
    });
  });

  describe('applyRarityModifier', () => {
    it('should return same value for common', () => {
      expect(applyRarityModifier(100, 'common')).toBe(100);
    });

    it('should increase value for higher rarities', () => {
      expect(applyRarityModifier(100, 'uncommon')).toBeCloseTo(110, 1);
      expect(applyRarityModifier(100, 'rare')).toBeCloseTo(120, 1);
      expect(applyRarityModifier(100, 'epic')).toBeCloseTo(130, 1);
      expect(applyRarityModifier(100, 'legendary')).toBeCloseTo(150, 1);
    });

    it('should scale proportionally', () => {
      expect(applyRarityModifier(50, 'legendary')).toBeCloseTo(75, 1);
      expect(applyRarityModifier(200, 'legendary')).toBeCloseTo(300, 1);
    });
  });
});

// =============================================================================
// DOMINANT FACTION TESTS
// =============================================================================

describe('Dominant Faction Calculation', () => {
  describe('calculateDominantFaction', () => {
    it('should return undefined for empty array', () => {
      expect(calculateDominantFaction([])).toBeUndefined();
    });

    it('should return undefined when no faction modules', () => {
      const modules = ['gear', 'shield-shell', 'trigger-switch'];
      expect(calculateDominantFaction(modules)).toBeUndefined();
    });

    it('should return void for void-siphon and phase-modulator', () => {
      const modules = ['void-siphon', 'phase-modulator'];
      expect(calculateDominantFaction(modules)).toBe('void');
    });

    it('should return inferno for fire-crystal and core-furnace', () => {
      const modules = ['fire-crystal', 'core-furnace'];
      expect(calculateDominantFaction(modules)).toBe('inferno');
    });

    it('should return storm for lightning-conductor and energy-pipe', () => {
      const modules = ['lightning-conductor', 'energy-pipe'];
      expect(calculateDominantFaction(modules)).toBe('storm');
    });

    it('should return stellar for amplifier-crystal and resonance-chamber', () => {
      const modules = ['amplifier-crystal', 'resonance-chamber'];
      expect(calculateDominantFaction(modules)).toBe('stellar');
    });

    it('should return arcane for arcane-matrix-grid and rune-node', () => {
      const modules = ['arcane-matrix-grid', 'rune-node'];
      expect(calculateDominantFaction(modules)).toBe('arcane');
    });

    it('should return chaos for temporal-distorter and ether-infusion-chamber', () => {
      const modules = ['temporal-distorter', 'ether-infusion-chamber'];
      expect(calculateDominantFaction(modules)).toBe('chaos');
    });

    it('should return undefined when only 1 faction module', () => {
      const modules = ['void-siphon'];
      expect(calculateDominantFaction(modules)).toBeUndefined();
    });

    it('should return the faction with most modules when clear majority', () => {
      // 3 void modules, 1 inferno module
      const modules = ['void-siphon', 'void-siphon', 'void-siphon', 'fire-crystal'];
      expect(calculateDominantFaction(modules)).toBe('void');
    });

    it('should return undefined when tie (1 void, 1 inferno)', () => {
      // Only 1 module per faction - no dominant faction
      const modules = ['void-siphon', 'fire-crystal'];
      expect(calculateDominantFaction(modules)).toBeUndefined();
    });
  });
});
