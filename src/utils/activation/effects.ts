/**
 * Activation Visual Effects Utilities
 * 
 * Provides calculations for:
 * - Screen shake intensity and duration
 * - Vignette opacity based on power output
 * - Glow radius scaling based on machine power
 * - Faction-colored glow variations
 */

import { FactionId, FACTIONS } from '../../types/factions';
import { Rarity } from '../../types';
import { MachineState } from '../../types';

// =============================================================================
// CONSTANTS
// =============================================================================

// Screen shake constants
export const SHAKE_DURATION_MIN = 200;  // ms
export const SHAKE_DURATION_MAX = 400;  // ms
export const SHAKE_INTENSITY_LOW = 2;
export const SHAKE_INTENSITY_MEDIUM = 4;
export const SHAKE_INTENSITY_HIGH = 8;
export const SHAKE_INTENSITY_CRITICAL = 12;

// Vignette constants
export const VIGNETTE_OPACITY_MIN = 0;
export const VIGNETTE_OPACITY_LOW = 0.15;
export const VIGNETTE_OPACITY_MEDIUM = 0.3;
export const VIGNETTE_OPACITY_HIGH = 0.4;
export const VIGNETTE_OPACITY_CRITICAL = 0.5;

// Glow radius constants
export const GLOW_RADIUS_BASELINE = 1.0;
export const GLOW_RADIUS_LOW_POWER = 0.8;
export const GLOW_RADIUS_HIGH_POWER = 1.5;
export const GLOW_RADIUS_MAX = 2.0;

// Power thresholds (0-100)
export const POWER_THRESHOLD_LOW = 30;
export const POWER_THRESHOLD_MEDIUM = 60;
export const POWER_THRESHOLD_HIGH = 80;
export const POWER_THRESHOLD_MAX = 100;

// Animation timing
export const TRANSITION_DURATION_FAST = 150;
export const TRANSITION_DURATION_NORMAL = 300;
export const TRANSITION_DURATION_SLOW = 500;

// =============================================================================
// POWER OUTPUT CALCULATIONS
// =============================================================================

/**
 * Calculate power output based on machine stats
 * Returns value between 0-100
 */
export function calculatePowerOutput(
  stats?: { powerOutput?: number; stability?: number; energyCost?: number }
): number {
  const { powerOutput = 50, stability = 0, energyCost = 0 } = stats || {};
  
  // Base power is the powerOutput parameter (50 is neutral)
  // Stability slightly reduces power (at max stability 100, reduce by ~20%)
  const stabilityModifier = 1 - (stability / 500);
  
  // Energy cost slightly increases power demand (at max cost 100, increase by ~20%)
  const energyModifier = 1 + (energyCost / 500);
  
  // Calculate adjusted power
  const basePower = powerOutput * stabilityModifier * energyModifier;
  
  return Math.max(0, Math.min(100, basePower));
}

/**
 * Get power level category from power output
 */
export function getPowerLevel(powerOutput: number): 'low' | 'medium' | 'high' | 'max' {
  if (powerOutput < POWER_THRESHOLD_LOW) return 'low';
  if (powerOutput < POWER_THRESHOLD_MEDIUM) return 'medium';
  if (powerOutput < POWER_THRESHOLD_HIGH) return 'high';
  return 'max';
}

// =============================================================================
// GLOW RADIUS CALCULATIONS
// =============================================================================

/**
 * Calculate glow radius multiplier based on power output
 * 
 * Scaling:
 * - Low power (0-30): 0.8x baseline
 * - Medium power (31-60): 1.0x baseline
 * - High power (61-80): 1.3x baseline
 * - Max power (81-100): 1.5x baseline
 */
export function calculateGlowRadius(powerOutput: number): number {
  if (powerOutput <= POWER_THRESHOLD_LOW) {
    // Linear interpolation from GLOW_RADIUS_LOW_POWER to GLOW_RADIUS_BASELINE
    const t = powerOutput / POWER_THRESHOLD_LOW;
    return GLOW_RADIUS_LOW_POWER + (GLOW_RADIUS_BASELINE - GLOW_RADIUS_LOW_POWER) * t;
  }
  
  if (powerOutput <= POWER_THRESHOLD_MEDIUM) {
    // Linear interpolation from GLOW_RADIUS_BASELINE to 1.3
    const t = (powerOutput - POWER_THRESHOLD_LOW) / (POWER_THRESHOLD_MEDIUM - POWER_THRESHOLD_LOW);
    return GLOW_RADIUS_BASELINE + 0.3 * t;
  }
  
  if (powerOutput <= POWER_THRESHOLD_HIGH) {
    // Linear interpolation from 1.3 to GLOW_RADIUS_HIGH_POWER
    const t = (powerOutput - POWER_THRESHOLD_MEDIUM) / (POWER_THRESHOLD_HIGH - POWER_THRESHOLD_MEDIUM);
    return 1.3 + (GLOW_RADIUS_HIGH_POWER - 1.3) * t;
  }
  
  // Max power: up to GLOW_RADIUS_MAX
  const t = (powerOutput - POWER_THRESHOLD_HIGH) / (POWER_THRESHOLD_MAX - POWER_THRESHOLD_HIGH);
  return GLOW_RADIUS_HIGH_POWER + (GLOW_RADIUS_MAX - GLOW_RADIUS_HIGH_POWER) * t;
}

/**
 * Get glow color based on faction
 */
export function getFactionGlowColor(
  dominantFaction?: FactionId,
  defaultColor: string = '#00d4ff'
): string {
  if (!dominantFaction) return defaultColor;
  
  const faction = FACTIONS[dominantFaction];
  if (!faction) return defaultColor;
  
  return faction.color; // Return the faction's primary color
}

/**
 * Get faction RGB values for glow effects
 */
export function getFactionGlowRGB(
  dominantFaction?: FactionId
): { r: number; g: number; b: number } {
  if (!dominantFaction) {
    return { r: 0, g: 212, b: 255 }; // Default cyan
  }
  
  const faction = FACTIONS[dominantFaction];
  if (!faction) {
    return { r: 0, g: 212, b: 255 };
  }
  
  // Parse hex color
  const hex = faction.color.replace('#', '');
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  };
}

/**
 * Calculate glow intensity (opacity) based on power output
 */
export function calculateGlowIntensity(powerOutput: number): number {
  // Base intensity + power modifier
  const baseIntensity = 0.3;
  const powerModifier = powerOutput / 100 * 0.5;
  return Math.min(1, baseIntensity + powerModifier);
}

// =============================================================================
// VIGNETTE CALCULATIONS
// =============================================================================

/**
 * Calculate vignette opacity based on machine state and power output
 * 
 * Rules:
 * - Idle: 0 (no vignette)
 * - Charging: 0.15-0.2
 * - Active: 0.2-0.3
 * - Overload: 0.35-0.5 (red tinted)
 * - Failure: 0.4-0.5 (red tinted)
 */
export function calculateVignetteOpacity(
  state: MachineState,
  powerOutput: number = 50,
  isOverload: boolean = false
): number {
  if (state === 'idle') {
    return VIGNETTE_OPACITY_MIN;
  }
  
  if (state === 'failure') {
    // Failure always has maximum vignette
    return VIGNETTE_OPACITY_HIGH;
  }
  
  if (state === 'overload' || isOverload) {
    // Overload vignette scales with power - start higher than medium
    const powerModifier = (powerOutput - 20) / (100 - 20); // 0-1 range from power 20-100
    return 0.35 + powerModifier * (VIGNETTE_OPACITY_CRITICAL - 0.35);
  }
  
  if (state === 'charging') {
    // Charging vignette is subtle
    return VIGNETTE_OPACITY_LOW;
  }
  
  if (state === 'active') {
    // Active vignette scales with power
    const powerModifier = (powerOutput - POWER_THRESHOLD_LOW) / (100 - POWER_THRESHOLD_LOW);
    return VIGNETTE_OPACITY_LOW + powerModifier * (VIGNETTE_OPACITY_MEDIUM - VIGNETTE_OPACITY_LOW);
  }
  
  if (state === 'shutdown') {
    // Shutdown vignette fades quickly
    return VIGNETTE_OPACITY_LOW * 0.5;
  }
  
  return VIGNETTE_OPACITY_MIN;
}

/**
 * Get vignette color based on machine state
 */
export function getVignetteColor(
  state: MachineState,
  isOverload: boolean = false
): string {
  if (state === 'failure') {
    return 'rgba(255, 51, 85, 1)'; // Red
  }
  
  if (state === 'overload' || isOverload) {
    return 'rgba(255, 107, 53, 1)'; // Orange-red
  }
  
  return 'rgba(0, 0, 0, 1)'; // Black for normal states
}

/**
 * Calculate vignette gradient stop positions
 */
export function getVignetteGradientStops(
  intensity: number
): { inner: number; outer: number } {
  // Inner stop (where gradient starts fading in)
  const inner = 50 - intensity * 20; // 50% to 30%
  // Outer stop (fully opaque)
  const outer = 100;
  return { inner, outer };
}

// =============================================================================
// SCREEN SHAKE CALCULATIONS
// =============================================================================

/**
 * Calculate screen shake duration based on machine state
 * Returns duration in milliseconds
 */
export function calculateShakeDuration(state: MachineState): number {
  switch (state) {
    case 'charging':
      return SHAKE_DURATION_MIN;
    case 'active':
      return SHAKE_DURATION_MIN + (SHAKE_DURATION_MAX - SHAKE_DURATION_MIN) * 0.5;
    case 'overload':
      return SHAKE_DURATION_MAX;
    case 'failure':
      return SHAKE_DURATION_MAX;
    default:
      return 0;
  }
}

/**
 * Calculate screen shake intensity based on machine state and power output
 */
export function calculateShakeIntensity(
  state: MachineState,
  powerOutput: number = 50,
  isOverload: boolean = false
): number {
  // Determine base intensity from state
  let baseIntensity: number;
  
  switch (state) {
    case 'failure':
      baseIntensity = SHAKE_INTENSITY_CRITICAL;
      break;
    case 'overload':
      baseIntensity = SHAKE_INTENSITY_HIGH;
      break;
    case 'active':
      baseIntensity = isOverload ? SHAKE_INTENSITY_HIGH : SHAKE_INTENSITY_MEDIUM;
      break;
    case 'charging':
      baseIntensity = SHAKE_INTENSITY_LOW;
      break;
    default:
      return 0;
  }
  
  // Scale intensity with power output
  const powerModifier = 1 + (powerOutput - 50) / 100;
  return Math.min(SHAKE_INTENSITY_CRITICAL, baseIntensity * powerModifier);
}

/**
 * Calculate shake offset for a given timestamp
 * Uses smooth noise for natural-feeling shake
 */
export function calculateShakeOffset(
  timestamp: number,
  intensity: number,
  duration: number
): { x: number; y: number; isComplete: boolean } {
  if (duration <= 0 || intensity <= 0) {
    return { x: 0, y: 0, isComplete: true };
  }
  
  const progress = timestamp / duration;
  
  if (progress >= 1) {
    return { x: 0, y: 0, isComplete: true };
  }
  
  // Use sine-based pseudo-random for smooth shake
  // Multiple frequencies for more organic movement
  const freq1 = 15;
  const freq2 = 23;
  const freq3 = 31;
  
  // Decay factor - shake decreases over time
  const decay = 1 - progress;
  
  const x = (
    Math.sin(timestamp * freq1) * intensity * 0.5 +
    Math.sin(timestamp * freq2) * intensity * 0.3 +
    Math.sin(timestamp * freq3) * intensity * 0.2
  ) * decay;
  
  const y = (
    Math.cos(timestamp * freq1) * intensity * 0.5 +
    Math.cos(timestamp * freq2) * intensity * 0.3 +
    Math.cos(timestamp * freq3) * intensity * 0.2
  ) * decay;
  
  return { x, y, isComplete: false };
}

/**
 * Check if screen shake should be active
 */
export function shouldShake(state: MachineState): boolean {
  return ['charging', 'active', 'overload', 'failure'].includes(state);
}

// =============================================================================
// PHASE TRANSITION UTILITIES
// =============================================================================

/**
 * Get transition duration based on phase change
 */
export function getTransitionDuration(
  fromPhase: MachineState,
  toPhase: MachineState
): number {
  // Critical transitions get longer transitions
  if (
    (fromPhase === 'idle' && toPhase === 'charging') ||
    (fromPhase === 'failure' && toPhase === 'idle') ||
    (fromPhase === 'overload' && toPhase === 'idle')
  ) {
    return TRANSITION_DURATION_SLOW;
  }
  
  // Normal transitions
  if (
    (fromPhase === 'charging' && toPhase === 'active') ||
    (fromPhase === 'active' && toPhase === 'shutdown')
  ) {
    return TRANSITION_DURATION_NORMAL;
  }
  
  // Quick transitions
  return TRANSITION_DURATION_FAST;
}

/**
 * Calculate energy buildup indicator for charging phase
 */
export function calculateEnergyBuildup(progress: number): number {
  // Progress from 0 to 1 representing energy accumulation
  return Math.min(1, Math.max(0, progress));
}

/**
 * Get phase display information
 */
export function getPhaseInfo(state: MachineState): {
  title: string;
  subtitle: string;
  color: string;
} {
  switch (state) {
    case 'idle':
      return { title: 'IDLE', subtitle: 'Machine ready', color: '#9ca3af' };
    case 'charging':
      return { title: 'CHARGING', subtitle: 'Initializing energy flow...', color: '#00d4ff' };
    case 'active':
      return { title: 'ACTIVATING', subtitle: 'Modules engaging...', color: '#00ffcc' };
    case 'overload':
      return { title: 'OVERLOAD', subtitle: 'Critical energy warning', color: '#ff6b35' };
    case 'failure':
      return { title: 'FAILURE', subtitle: 'System failure detected', color: '#ff3355' };
    case 'shutdown':
      return { title: 'ONLINE', subtitle: 'Machine ready for operation', color: '#22c55e' };
    default:
      return { title: 'UNKNOWN', subtitle: '', color: '#9ca3af' };
  }
}

// =============================================================================
// PARTICLE EFFECT UTILITIES
// =============================================================================

/**
 * Calculate particle count based on power output and state
 */
export function calculateParticleCount(
  baseCount: number,
  powerOutput: number,
  state: MachineState,
  isOverload: boolean = false
): number {
  let multiplier = 1;
  
  // Power-based multiplier
  if (powerOutput > POWER_THRESHOLD_HIGH) {
    multiplier = 1.5;
  } else if (powerOutput > POWER_THRESHOLD_MEDIUM) {
    multiplier = 1.25;
  }
  
  // State-based multiplier
  if (state === 'overload' || isOverload) {
    multiplier *= 1.5;
  } else if (state === 'failure') {
    multiplier *= 2;
  }
  
  return Math.round(baseCount * multiplier);
}

/**
 * Calculate particle speed based on power output
 */
export function calculateParticleSpeed(
  baseSpeed: number,
  powerOutput: number
): number {
  // Faster particles at higher power
  return baseSpeed * (0.8 + (powerOutput / 100) * 0.6);
}

/**
 * Get particle color variations based on faction
 */
export function getParticleColors(
  dominantFaction?: FactionId
): string[] {
  const factionRGB = getFactionGlowRGB(dominantFaction);
  
  return [
    `rgb(${factionRGB.r}, ${factionRGB.g}, ${factionRGB.b})`,
    `rgba(${factionRGB.r}, ${factionRGB.g}, ${factionRGB.b}, 0.8)`,
    `rgba(${factionRGB.r}, ${factionRGB.g}, ${factionRGB.b}, 0.6)`,
    `rgba(255, 255, 255, 0.9)`, // White sparkle
    `rgba(${factionRGB.r}, ${factionRGB.g}, ${factionRGB.b}, 0.4)`,
  ];
}

// =============================================================================
// DISTORTION EFFECT UTILITIES
// =============================================================================

/**
 * Calculate distortion intensity based on state
 */
export function calculateDistortionIntensity(
  state: MachineState,
  powerOutput: number = 50
): number {
  if (state === 'failure') {
    return 0.3;
  }
  
  if (state === 'overload') {
    return 0.15 + (powerOutput / 100) * 0.15;
  }
  
  return 0;
}

/**
 * Calculate noise offset for glitch effects
 */
export function calculateNoiseOffset(
  intensity: number,
  time: number
): { x: number; y: number } {
  const frequency = 20;
  
  return {
    x: (Math.random() - 0.5) * intensity * 20,
    y: (Math.sin(time * frequency) * 0.5 + Math.random() - 0.5) * intensity * 10,
  };
}

// =============================================================================
// RARITY-BASED EFFECTS
// =============================================================================

/**
 * Get rarity color for effects
 */
export function getRarityEffectColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#eab308',
  };
  return colors[rarity] || colors.common;
}

/**
 * Apply rarity modifier to effect intensity
 */
export function applyRarityModifier(
  baseValue: number,
  rarity: Rarity
): number {
  const modifiers: Record<Rarity, number> = {
    common: 1.0,
    uncommon: 1.1,
    rare: 1.2,
    epic: 1.3,
    legendary: 1.5,
  };
  return baseValue * (modifiers[rarity] || 1.0);
}

// =============================================================================
// DOMINANT FACTION CALCULATION
// =============================================================================

/**
 * Calculate dominant faction based on module types
 */
export function calculateDominantFaction(
  moduleTypes: string[]
): FactionId | undefined {
  const factionCounts: Record<FactionId, number> = {
    void: 0,
    inferno: 0,
    storm: 0,
    stellar: 0,
    arcane: 0,
    chaos: 0,
  };
  
  // Count modules per faction
  moduleTypes.forEach((type) => {
    Object.entries(FACTIONS).forEach(([factionId, faction]) => {
      if (faction.moduleTypes.includes(type)) {
        factionCounts[factionId as FactionId]++;
      }
    });
  });
  
  // Find dominant faction
  let maxCount = 0;
  let dominantFaction: FactionId | undefined;
  
  Object.entries(factionCounts).forEach(([factionId, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantFaction = factionId as FactionId;
    }
  });
  
  // Only return if there's a clear dominant faction (at least 2 modules)
  return maxCount >= 2 ? dominantFaction : undefined;
}
