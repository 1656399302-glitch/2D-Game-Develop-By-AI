/**
 * Activation Pulse Enhancer - Improved pulse timing and visual choreography
 * 
 * This module provides enhanced timing and choreography for activation pulses,
 * building upon the existing activationChoreographer to create more refined
 * visual effects during machine activation.
 */

import { PlacedModule, Connection } from '../types';
import { calculateActivationChoreography } from './activationChoreographer';

/**
 * Pulse animation phases
 */
export type PulsePhase = 'idle' | 'charging' | 'activating' | 'online' | 'overload' | 'failure' | 'shutdown';

/**
 * Timing configuration for pulse animations
 */
export interface PulseTimingConfig {
  /** Delay between depth levels in ms (default: 67ms) */
  depthDelay: number;
  /** How long before module activates to light up connections (default: 33ms) */
  connectionLeadTime: number;
  /** Duration of pulse glow effect in ms */
  pulseGlowDuration: number;
  /** Duration of connection flow animation in ms */
  connectionFlowDuration: number;
  /** Stagger between modules at same depth in ms */
  sameDepthStagger: number;
  /** Phase transition thresholds (progress percentages) */
  phaseThresholds: {
    chargingToActivating: number; // e.g., 30
    activatingToOnline: number;   // e.g., 80
  };
}

/**
 * Default timing configuration
 */
export const DEFAULT_PULSE_TIMING: PulseTimingConfig = {
  depthDelay: 67,
  connectionLeadTime: 33,
  pulseGlowDuration: 300,
  connectionFlowDuration: 400,
  sameDepthStagger: 50,
  phaseThresholds: {
    chargingToActivating: 30,
    activatingToOnline: 80,
  },
};

/**
 * Enhanced activation step with pulse information
 */
export interface EnhancedActivationStep {
  moduleId: string;
  depth: number;
  activationTime: number;
  connectionsToLight: {
    connectionId: string;
    activationTime: number;
  }[];
  pulseIntensity: number; // 0-1 for glow intensity
  phase: PulsePhase;
}

/**
 * Enhanced choreography result with pulse timing
 */
export interface EnhancedChoreographyResult {
  steps: EnhancedActivationStep[];
  totalDuration: number;
  depthCount: number;
  pulseTimings: {
    totalDuration: number;
    chargingDuration: number;
    activatingDuration: number;
    onlineDuration: number;
  };
}

/**
 * Get phase text based on progress percentage
 */
export function getPhaseText(progress: number, config: PulseTimingConfig = DEFAULT_PULSE_TIMING): { 
  text: string; 
  phase: PulsePhase;
  isTransitioning: boolean;
} {
  const { chargingToActivating, activatingToOnline } = config.phaseThresholds;
  
  // Check for transition zones (within 5% of threshold)
  const transitionZone = 5;
  
  if (progress < chargingToActivating - transitionZone) {
    return { text: 'CHARGING', phase: 'charging', isTransitioning: false };
  } else if (progress < chargingToActivating + transitionZone) {
    return { text: 'CHARGING', phase: 'charging', isTransitioning: true };
  } else if (progress < activatingToOnline - transitionZone) {
    return { text: 'ACTIVATING', phase: 'activating', isTransitioning: false };
  } else if (progress < activatingToOnline + transitionZone) {
    return { text: 'ACTIVATING', phase: 'activating', isTransitioning: true };
  } else {
    return { text: 'ONLINE', phase: 'online', isTransitioning: false };
  }
}

/**
 * Calculate pulse intensity for a module based on activation progress
 */
export function calculatePulseIntensity(
  moduleId: string,
  activationStartTime: number,
  currentTime: number,
  choreography: EnhancedChoreographyResult,
  config: PulseTimingConfig = DEFAULT_PULSE_TIMING
): number {
  const step = choreography.steps.find(s => s.moduleId === moduleId);
  
  if (!step) {
    return 0;
  }
  
  const elapsed = currentTime - activationStartTime;
  const { pulseGlowDuration } = config;
  
  // Calculate progress within this module's activation window
  const activationWindowStart = step.activationTime;
  const activationWindowEnd = step.activationTime + pulseGlowDuration;
  
  if (elapsed < activationWindowStart) {
    // Not yet reached this module
    return 0;
  } else if (elapsed >= activationWindowStart && elapsed < activationWindowEnd) {
    // Within activation window - calculate intensity based on depth
    const progress = (elapsed - activationWindowStart) / pulseGlowDuration;
    // Deeper modules have slightly delayed and dimmer pulses
    const depthFactor = Math.max(0.5, 1 - (step.depth * 0.1));
    return Math.min(1, progress * depthFactor);
  } else {
    // After activation window - steady glow
    const depthFactor = Math.max(0.6, 1 - (step.depth * 0.08));
    return depthFactor;
  }
}

/**
 * Calculate connection pulse progress
 */
export function calculateConnectionPulseProgress(
  connectionId: string,
  activationStartTime: number,
  currentTime: number,
  choreography: EnhancedChoreographyResult,
  pathLength: number,
  config: PulseTimingConfig = DEFAULT_PULSE_TIMING
): { progress: number; isActive: boolean; waveCount: number } {
  const { connectionFlowDuration } = config;
  
  // Find all steps that light up this connection
  const lightUpTimes = choreography.steps.flatMap(step =>
    step.connectionsToLight
      .filter(conn => conn.connectionId === connectionId)
      .map(conn => ({
        activationTime: conn.activationTime,
        moduleActivationTime: step.activationTime,
      }))
  );
  
  if (lightUpTimes.length === 0) {
    return { progress: 0, isActive: false, waveCount: 0 };
  }
  
  const elapsed = currentTime - activationStartTime;
  const currentLightUp = lightUpTimes[0];
  
  // Calculate when the pulse should start and end on this connection
  const pulseStartTime = currentLightUp.activationTime;
  const pulseEndTime = pulseStartTime + connectionFlowDuration;
  
  // Determine if pulse is currently active on this connection
  const isActive = elapsed >= pulseStartTime && elapsed <= pulseEndTime;
  
  if (!isActive) {
    if (elapsed < pulseStartTime) {
      return { progress: 0, isActive: false, waveCount: 0 };
    } else {
      // Pulse has passed - show completed state
      return { progress: 1, isActive: false, waveCount: 1 };
    }
  }
  
  // Calculate progress of pulse on path
  const pulseProgress = (elapsed - pulseStartTime) / connectionFlowDuration;
  
  // Determine wave count based on path length
  let waveCount = 1;
  if (pathLength > 300) {
    waveCount = 2;
  } else if (pathLength > 500) {
    waveCount = 3;
  }
  
  return { progress: pulseProgress, isActive: true, waveCount };
}

/**
 * Calculate enhanced activation choreography with pulse timings
 */
export function calculateEnhancedChoreography(
  modules: PlacedModule[],
  connections: Connection[],
  config: PulseTimingConfig = DEFAULT_PULSE_TIMING
): EnhancedChoreographyResult {
  // Get base choreography
  const baseChoreography = calculateActivationChoreography(
    modules,
    connections,
    config.depthDelay,
    config.connectionLeadTime
  );
  
  if (modules.length === 0) {
    return {
      steps: [],
      totalDuration: 0,
      depthCount: 0,
      pulseTimings: {
        totalDuration: 0,
        chargingDuration: 0,
        activatingDuration: 0,
        onlineDuration: 0,
      },
    };
  }
  
  // Enhance steps with pulse information
  const enhancedSteps: EnhancedActivationStep[] = baseChoreography.steps.map((step) => {
    // Determine phase based on depth
    let phase: PulsePhase = 'charging';
    if (step.depth === 0) {
      phase = 'activating';
    } else if (step.depth >= baseChoreography.depthCount - 1) {
      phase = 'online';
    }
    
    // Calculate pulse intensity based on depth (deeper = slightly less intense initially)
    const pulseIntensity = Math.max(0.6, 1 - (step.depth * 0.15));
    
    return {
      moduleId: step.moduleId,
      depth: step.depth,
      activationTime: step.activationTime,
      connectionsToLight: step.connectionsToLight,
      pulseIntensity,
      phase,
    };
  });
  
  // Calculate timing breakdown
  const { chargingToActivating, activatingToOnline } = config.phaseThresholds;
  const totalDuration = baseChoreography.totalDuration;
  const chargingDuration = (chargingToActivating / 100) * totalDuration;
  const activatingDuration = ((activatingToOnline - chargingToActivating) / 100) * totalDuration;
  const onlineDuration = totalDuration - chargingDuration - activatingDuration;
  
  return {
    steps: enhancedSteps,
    totalDuration: baseChoreography.totalDuration,
    depthCount: baseChoreography.depthCount,
    pulseTimings: {
      totalDuration,
      chargingDuration,
      activatingDuration,
      onlineDuration,
    },
  };
}

/**
 * Easing functions for smooth animations
 */
export const easings = {
  /** Ease-out cubic for smooth deceleration */
  easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),
  
  /** Ease-in-out for back and forth effects */
  easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  
  /** Spring-like bounce effect */
  spring: (t: number, damping: number = 0.5): number => {
    const frequency = Math.PI * 2;
    return 1 - Math.cos(t * frequency) * Math.exp(-t / damping);
  },
};

/**
 * Calculate shake offset for failure/overload effects
 */
export function calculateEnhancedShakeOffset(
  timestamp: number,
  magnitude: number,
  duration: number,
  mode: 'failure' | 'overload' = 'failure'
): { x: number; y: number; isComplete: boolean; intensity: number } {
  const progress = timestamp / duration;
  
  if (progress >= 1) {
    return { x: 0, y: 0, isComplete: true, intensity: 0 };
  }
  
  // Different patterns for failure vs overload
  const intensity = 1 - Math.pow(progress, 2); // Decay curve
  
  if (mode === 'failure') {
    // Erratic shake pattern
    const freq1 = 23;
    const freq2 = 37;
    const freq3 = 51;
    
    const x = (Math.sin(timestamp * freq1) + Math.sin(timestamp * freq2 * 1.3)) * magnitude * intensity * 0.7 +
             Math.sin(timestamp * freq3 * 0.7) * magnitude * intensity * 0.3;
    const y = (Math.cos(timestamp * freq1) + Math.cos(timestamp * freq2 * 1.1)) * magnitude * intensity * 0.7 +
             Math.cos(timestamp * freq3 * 0.9) * magnitude * intensity * 0.3;
    
    return { x, y, isComplete: false, intensity };
  } else {
    // Overload - more rhythmic but increasing
    const freq1 = 12;
    const freq2 = 18;
    const buildup = Math.sin(progress * Math.PI); // 0 -> 1 -> 0
    
    const x = Math.sin(timestamp * freq1) * magnitude * intensity +
             Math.sin(timestamp * freq2 * 1.5) * magnitude * intensity * 0.5 * buildup;
    const y = Math.cos(timestamp * freq1) * magnitude * intensity +
             Math.cos(timestamp * freq2 * 1.5) * magnitude * intensity * 0.5 * buildup;
    
    return { x, y, isComplete: false, intensity: intensity * (1 + buildup * 0.5) };
  }
}

/**
 * Get CSS animation keyframes for pulse effects
 */
export function getPulseAnimationKeyframes(
  _moduleType: string,
  phase: PulsePhase,
  intensity: number = 1
): string {
  switch (phase) {
    case 'charging':
      return `
        0% { filter: drop-shadow(0 0 2px var(--glow-color)) brightness(1); }
        50% { filter: drop-shadow(0 0 ${4 * intensity}px var(--glow-color)) brightness(${1 + 0.1 * intensity}); }
        100% { filter: drop-shadow(0 0 ${2 * intensity}px var(--glow-color)) brightness(1); }
      `;
    case 'activating':
      return `
        0% { filter: drop-shadow(0 0 ${4 * intensity}px var(--glow-color)) brightness(1); }
        30% { filter: drop-shadow(0 0 ${8 * intensity}px var(--glow-color)) brightness(${1 + 0.2 * intensity}); }
        60% { filter: drop-shadow(0 0 ${6 * intensity}px var(--glow-color)) brightness(${1 + 0.15 * intensity}); }
        100% { filter: drop-shadow(0 0 ${5 * intensity}px var(--glow-color)) brightness(${1 + 0.1 * intensity}); }
      `;
    case 'online':
      return `
        0% { filter: drop-shadow(0 0 ${3 * intensity}px var(--glow-color)) brightness(1); }
        100% { filter: drop-shadow(0 0 ${4 * intensity}px var(--glow-color)) brightness(${1 + 0.05 * intensity}); }
      `;
    case 'failure':
      return `
        0% { filter: drop-shadow(0 0 4px #ef4444) brightness(1); }
        25% { filter: drop-shadow(0 0 8px #ef4444) brightness(1.3); }
        50% { filter: drop-shadow(0 0 2px #ef4444) brightness(0.8); }
        75% { filter: drop-shadow(0 0 6px #ef4444) brightness(1.1); }
        100% { filter: drop-shadow(0 0 4px #ef4444) brightness(1); }
      `;
    case 'overload':
      return `
        0% { filter: drop-shadow(0 0 4px #f97316) brightness(1); }
        20% { filter: drop-shadow(0 0 10px #f97316) brightness(1.5); }
        40% { filter: drop-shadow(0 0 6px #fbbf24) brightness(1.2); }
        60% { filter: drop-shadow(0 0 12px #f97316) brightness(1.8); }
        80% { filter: drop-shadow(0 0 8px #fbbf24) brightness(1.4); }
        100% { filter: drop-shadow(0 0 10px #f97316) brightness(2); }
      `;
    default:
      return '';
  }
}

/**
 * Generate staggered delay for CSS animation
 */
export function getStaggeredDelay(depth: number, _index: number, baseDelay: number = 67): string {
  return `${(depth * baseDelay) / 1000}s`;
}
