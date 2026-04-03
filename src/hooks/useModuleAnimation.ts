/**
 * useModuleAnimation Hook
 * 
 * Round 111: Energy Connection System + Module Animation Hooks
 * 
 * This hook manages module animation states and provides:
 * - Animation state machine for each module
 * - Animation triggers based on activation state
 * - Per-module-type animation configurations
 * - Animation lifecycle (enter, active, exit)
 */

import { useCallback, useRef, useState } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { ModuleType } from '../types';

// ============================================================================
// Animation Types
// ============================================================================

/**
 * Animation state for a module
 */
export type AnimationState = 'idle' | 'entering' | 'charging' | 'active' | 'overload' | 'failing' | 'shutdown' | 'exiting';

/**
 * Keyframe property definitions
 */
export interface AnimationKeyframe {
  time: number;           // 0-1 normalized time
  properties: {
    opacity?: number;
    scale?: number;
    rotation?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    filter?: string;
    transform?: string;
    offset?: number;      // For gradient animations
  };
}

/**
 * Animation phase configuration
 */
export interface AnimationPhaseConfig {
  duration: number;      // Duration in milliseconds
  easing: string;        // CSS easing or GSAP ease
  keyframes: AnimationKeyframe[];
}

/**
 * Complete animation configuration for a module type
 */
export interface ModuleAnimationConfig {
  moduleType: ModuleType;
  idle: AnimationPhaseConfig;
  entering: AnimationPhaseConfig;
  charging: AnimationPhaseConfig;
  active: AnimationPhaseConfig;
  overload: AnimationPhaseConfig;
  failing: AnimationPhaseConfig;
  shutdown: AnimationPhaseConfig;
  exiting: AnimationPhaseConfig;
}

/**
 * Module animation state tracking
 */
export interface ModuleAnimationState {
  moduleId: string;
  state: AnimationState;
  progress: number;       // 0-1 progress through current animation
  startTime: number;      // When current animation started
  callbacks: {
    onEnter?: () => void;
    onCharge?: () => void;
    onActivate?: () => void;
    onOverload?: () => void;
    onFail?: () => void;
    onShutdown?: () => void;
    onExit?: () => void;
  };
}

// ============================================================================
// Animation Configurations by Module Type
// ============================================================================

/**
 * Default animation phase config
 */
const defaultPhaseConfig: AnimationPhaseConfig = {
  duration: 500,
  easing: 'ease-in-out',
  keyframes: [
    { time: 0, properties: { opacity: 0.7 } },
    { time: 1, properties: { opacity: 1 } },
  ],
};

/**
 * Animation configurations for all module types
 */
const MODULE_ANIMATION_CONFIGS: Partial<Record<ModuleType, Omit<ModuleAnimationConfig, 'moduleType'>>> = {
  'core-furnace': {
    idle: {
      duration: 2000,
      easing: 'ease-in-out',
      keyframes: [
        { time: 0, properties: { opacity: 0.7, scale: 1 } },
        { time: 0.5, properties: { opacity: 1, scale: 1.02 } },
        { time: 1, properties: { opacity: 0.7, scale: 1 } },
      ],
    },
    entering: {
      duration: 300,
      easing: 'ease-out',
      keyframes: [
        { time: 0, properties: { opacity: 0, scale: 0.8 } },
        { time: 1, properties: { opacity: 1, scale: 1 } },
      ],
    },
    charging: {
      duration: 800,
      easing: 'ease-in',
      keyframes: [
        { time: 0, properties: { opacity: 0.7 } },
        { time: 0.5, properties: { opacity: 1, scale: 1.05 } },
        { time: 1, properties: { opacity: 1, scale: 1.1 } },
      ],
    },
    active: {
      duration: 500,
      easing: 'linear',
      keyframes: [
        { time: 0, properties: { scale: 1.05 } },
        { time: 0.25, properties: { scale: 1.1 } },
        { time: 0.5, properties: { scale: 1.05 } },
        { time: 0.75, properties: { scale: 1.1 } },
        { time: 1, properties: { scale: 1.05 } },
      ],
    },
    overload: {
      duration: 200,
      easing: 'linear',
      keyframes: [
        { time: 0, properties: { scale: 1.1 } },
        { time: 0.5, properties: { scale: 1.2, strokeWidth: 3 } },
        { time: 1, properties: { scale: 1.3 } },
      ],
    },
    failing: {
      duration: 400,
      easing: 'ease-out',
      keyframes: [
        { time: 0, properties: { opacity: 1 } },
        { time: 0.3, properties: { opacity: 0.5, scale: 0.9 } },
        { time: 0.6, properties: { opacity: 0.8, scale: 0.85 } },
        { time: 1, properties: { opacity: 0.3, scale: 0.8 } },
      ],
    },
    shutdown: {
      duration: 600,
      easing: 'ease-in-out',
      keyframes: [
        { time: 0, properties: { opacity: 1, scale: 1 } },
        { time: 0.5, properties: { opacity: 0.6, scale: 0.95 } },
        { time: 1, properties: { opacity: 0.7, scale: 1 } },
      ],
    },
    exiting: {
      duration: 300,
      easing: 'ease-in',
      keyframes: [
        { time: 0, properties: { opacity: 1, scale: 1 } },
        { time: 1, properties: { opacity: 0, scale: 0.5 } },
      ],
    },
  },

  'energy-pipe': {
    idle: {
      duration: 1000,
      easing: 'linear',
      keyframes: [
        { time: 0, properties: { opacity: 0.5 } },
        { time: 1, properties: { opacity: 0.7 } },
      ],
    },
    entering: { duration: 200, easing: 'ease-out', keyframes: [{ time: 0, properties: { opacity: 0 } }, { time: 1, properties: { opacity: 1 } }] },
    charging: { duration: 400, easing: 'ease-in', keyframes: [{ time: 0, properties: { opacity: 0.7 } }, { time: 1, properties: { opacity: 1 } }] },
    active: { duration: 300, easing: 'linear', keyframes: [{ time: 0, properties: { strokeWidth: 2 } }, { time: 1, properties: { strokeWidth: 3 } }] },
    overload: { duration: 100, easing: 'linear', keyframes: [{ time: 0, properties: { strokeWidth: 3 } }, { time: 1, properties: { strokeWidth: 5 } }] },
    failing: { duration: 300, easing: 'ease-out', keyframes: [{ time: 0, properties: { opacity: 1 } }, { time: 1, properties: { opacity: 0.3 } }] },
    shutdown: { duration: 400, easing: 'ease-in', keyframes: [{ time: 0, properties: { opacity: 1 } }, { time: 1, properties: { opacity: 0.5 } }] },
    exiting: { duration: 200, easing: 'ease-in', keyframes: [{ time: 0, properties: { opacity: 1 } }, { time: 1, properties: { opacity: 0 } }] },
  },

  'gear': {
    idle: {
      duration: 4000,
      easing: 'linear',
      keyframes: [
        { time: 0, properties: { rotation: 0 } },
        { time: 1, properties: { rotation: 360 } },
      ],
    },
    entering: { duration: 300, easing: 'ease-out', keyframes: [{ time: 0, properties: { opacity: 0 } }, { time: 1, properties: { opacity: 1 } }] },
    charging: { duration: 500, easing: 'ease-in-out', keyframes: [{ time: 0, properties: { rotation: 0 } }, { time: 1, properties: { rotation: 180 } }] },
    active: { duration: 1000, easing: 'linear', keyframes: [{ time: 0, properties: { rotation: 0 } }, { time: 1, properties: { rotation: 360 } }] },
    overload: { duration: 200, easing: 'linear', keyframes: [{ time: 0, properties: { rotation: 0 } }, { time: 1, properties: { rotation: 90 } }] },
    failing: { duration: 400, easing: 'ease-out', keyframes: [{ time: 0, properties: { rotation: 0 } }, { time: 1, properties: { rotation: 45 } }] },
    shutdown: { duration: 600, easing: 'ease-out', keyframes: [{ time: 0, properties: { rotation: 0 } }, { time: 1, properties: { rotation: 90 } }] },
    exiting: { duration: 300, easing: 'ease-in', keyframes: [{ time: 0, properties: { opacity: 1 } }, { time: 1, properties: { opacity: 0 } }] },
  },

  'rune-node': {
    idle: { duration: 1500, easing: 'ease-in-out', keyframes: [{ time: 0, properties: { opacity: 0.6 } }, { time: 1, properties: { opacity: 0.8 } }] },
    entering: { duration: 250, easing: 'ease-out', keyframes: [{ time: 0, properties: { opacity: 0, scale: 0.5 } }, { time: 1, properties: { opacity: 1, scale: 1 } }] },
    charging: { duration: 600, easing: 'ease-in', keyframes: [{ time: 0, properties: { opacity: 0.7 } }, { time: 1, properties: { opacity: 1, scale: 1.05 } }] },
    active: { duration: 400, easing: 'linear', keyframes: [{ time: 0, properties: { scale: 1, offset: 0 } }, { time: 0.5, properties: { scale: 1.1, offset: 0.5 } }, { time: 1, properties: { scale: 1, offset: 1 } }] },
    overload: { duration: 150, easing: 'linear', keyframes: [{ time: 0, properties: { scale: 1.1 } }, { time: 1, properties: { scale: 1.3 } }] },
    failing: { duration: 350, easing: 'ease-out', keyframes: [{ time: 0, properties: { opacity: 1 } }, { time: 1, properties: { opacity: 0.4 } }] },
    shutdown: { duration: 500, easing: 'ease-in-out', keyframes: [{ time: 0, properties: { opacity: 1 } }, { time: 1, properties: { opacity: 0.6 } }] },
    exiting: { duration: 250, easing: 'ease-in', keyframes: [{ time: 0, properties: { opacity: 1, scale: 1 } }, { time: 1, properties: { opacity: 0, scale: 0.3 } }] },
  },

  'shield-shell': {
    idle: { duration: 2000, easing: 'linear', keyframes: [{ time: 0, properties: { opacity: 0.5 } }, { time: 1, properties: { opacity: 0.7 } }] },
    entering: { duration: 400, easing: 'ease-out', keyframes: [{ time: 0, properties: { opacity: 0, scale: 0.8 } }, { time: 1, properties: { opacity: 0.7, scale: 1 } }] },
    charging: { duration: 700, easing: 'ease-in', keyframes: [{ time: 0, properties: { opacity: 0.5 } }, { time: 1, properties: { opacity: 0.8 } }] },
    active: { duration: 500, easing: 'linear', keyframes: [{ time: 0, properties: { opacity: 0.7 } }, { time: 1, properties: { opacity: 0.9 } }] },
    overload: { duration: 100, easing: 'linear', keyframes: [{ time: 0, properties: { opacity: 0.9 } }, { time: 1, properties: { opacity: 1, strokeWidth: 4 } }] },
    failing: { duration: 300, easing: 'ease-out', keyframes: [{ time: 0, properties: { opacity: 0.9 } }, { time: 1, properties: { opacity: 0.3 } }] },
    shutdown: { duration: 800, easing: 'ease-out', keyframes: [{ time: 0, properties: { opacity: 0.8 } }, { time: 1, properties: { opacity: 0.5 } }] },
    exiting: { duration: 400, easing: 'ease-in', keyframes: [{ time: 0, properties: { opacity: 0.7 } }, { time: 1, properties: { opacity: 0 } }] },
  },

  'trigger-switch': {
    idle: { duration: 1000, easing: 'ease-in-out', keyframes: [{ time: 0, properties: { opacity: 0.6 } }, { time: 1, properties: { opacity: 0.8 } }] },
    entering: { duration: 200, easing: 'ease-out', keyframes: [{ time: 0, properties: { opacity: 0 } }, { time: 1, properties: { opacity: 1 } }] },
    charging: { duration: 300, easing: 'ease-in', keyframes: [{ time: 0, properties: { opacity: 0.7 } }, { time: 1, properties: { opacity: 1 } }] },
    active: { duration: 200, easing: 'linear', keyframes: [{ time: 0, properties: { scale: 1 } }, { time: 0.5, properties: { scale: 1.15 } }, { time: 1, properties: { scale: 1 } }] },
    overload: { duration: 100, easing: 'linear', keyframes: [{ time: 0, properties: { scale: 1.1 } }, { time: 1, properties: { scale: 1.2 } }] },
    failing: { duration: 250, easing: 'ease-out', keyframes: [{ time: 0, properties: { opacity: 1 } }, { time: 1, properties: { opacity: 0.4 } }] },
    shutdown: { duration: 400, easing: 'ease-in', keyframes: [{ time: 0, properties: { opacity: 1 } }, { time: 1, properties: { opacity: 0.6 } }] },
    exiting: { duration: 200, easing: 'ease-in', keyframes: [{ time: 0, properties: { opacity: 1 } }, { time: 1, properties: { opacity: 0 } }] },
  },

  'output-array': {
    idle: { duration: 1200, easing: 'ease-in-out', keyframes: [{ time: 0, properties: { opacity: 0.5 } }, { time: 1, properties: { opacity: 0.7 } }] },
    entering: { duration: 350, easing: 'ease-out', keyframes: [{ time: 0, properties: { opacity: 0 } }, { time: 1, properties: { opacity: 1 } }] },
    charging: { duration: 600, easing: 'ease-in', keyframes: [{ time: 0, properties: { opacity: 0.6 } }, { time: 1, properties: { opacity: 1, scale: 1.02 } }] },
    active: { duration: 400, easing: 'linear', keyframes: [{ time: 0, properties: { scale: 1, opacity: 1 } }, { time: 0.5, properties: { scale: 1.08, opacity: 1 } }, { time: 1, properties: { scale: 1, opacity: 1 } }] },
    overload: { duration: 120, easing: 'linear', keyframes: [{ time: 0, properties: { scale: 1.08 } }, { time: 1, properties: { scale: 1.15 } }] },
    failing: { duration: 300, easing: 'ease-out', keyframes: [{ time: 0, properties: { opacity: 1 } }, { time: 1, properties: { opacity: 0.3 } }] },
    shutdown: { duration: 700, easing: 'ease-out', keyframes: [{ time: 0, properties: { opacity: 1 } }, { time: 1, properties: { opacity: 0.5 } }] },
    exiting: { duration: 300, easing: 'ease-in', keyframes: [{ time: 0, properties: { opacity: 1, scale: 1 } }, { time: 1, properties: { opacity: 0, scale: 0.5 } }] },
  },
};

// ============================================================================
// Animation Utilities
// ============================================================================

/**
 * Get animation configuration for a module type
 */
export function getModuleAnimationConfig(moduleType: ModuleType): ModuleAnimationConfig {
  const config = MODULE_ANIMATION_CONFIGS[moduleType];
  
  const phases: Array<keyof Omit<ModuleAnimationConfig, 'moduleType'>> = [
    'idle', 'entering', 'charging', 'active', 'overload', 'failing', 'shutdown', 'exiting'
  ];
  
  const result: Record<string, AnimationPhaseConfig> = {};
  phases.forEach(phase => {
    result[phase] = config?.[phase] || { ...defaultPhaseConfig };
  });
  
  return {
    moduleType,
    ...result,
  } as ModuleAnimationConfig;
}

/**
 * Interpolate between two keyframe values
 */
function interpolateKeyframes(
  keyframes: AnimationKeyframe[],
  progress: number
): Record<string, number | string> {
  if (keyframes.length === 0) return {};
  if (keyframes.length === 1) return keyframes[0].properties;

  // Find surrounding keyframes
  let startFrame = keyframes[0];
  let endFrame = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (progress >= keyframes[i].time && progress <= keyframes[i + 1].time) {
      startFrame = keyframes[i];
      endFrame = keyframes[i + 1];
      break;
    }
  }

  // Calculate local progress between frames
  const frameDuration = endFrame.time - startFrame.time;
  const localProgress = frameDuration > 0 ? (progress - startFrame.time) / frameDuration : 0;

  // Interpolate properties
  const result: Record<string, number | string> = {};
  const allKeys = new Set([
    ...Object.keys(startFrame.properties),
    ...Object.keys(endFrame.properties),
  ]);

  allKeys.forEach(key => {
    const startVal = startFrame.properties[key as keyof typeof startFrame.properties];
    const endVal = endFrame.properties[key as keyof typeof endFrame.properties];

    if (typeof startVal === 'number' && typeof endVal === 'number') {
      result[key] = startVal + (endVal - startVal) * localProgress;
    } else if (startVal !== undefined) {
      result[key] = startVal;
    } else if (endVal !== undefined) {
      result[key] = endVal;
    }
  });

  return result;
}

/**
 * Map machine state to animation state
 */
export function machineStateToAnimationState(machineState: string): AnimationState {
  switch (machineState) {
    case 'idle':
      return 'idle';
    case 'charging':
      return 'charging';
    case 'active':
      return 'active';
    case 'overload':
      return 'overload';
    case 'failure':
      return 'failing';
    case 'shutdown':
      return 'shutdown';
    default:
      return 'idle';
  }
}

// ============================================================================
// useModuleAnimation Hook
// ============================================================================

/**
 * useModuleAnimation Hook
 * 
 * React hook for managing module animation states and triggers
 */
export function useModuleAnimation() {
  const modules = useMachineStore((state) => state.modules);
  const machineState = useMachineStore((state) => state.machineState);
  
  // Track animation states per module
  const [animationStates, setAnimationStates] = useState<Map<string, ModuleAnimationState>>(new Map());
  
  // Animation frame reference for continuous updates
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<Map<string, number>>(new Map());
  
  // Get animation configuration for a module type
  const getAnimationConfig = useCallback((moduleType: ModuleType): ModuleAnimationConfig => {
    return getModuleAnimationConfig(moduleType);
  }, []);
  
  // Get animation state for a specific module
  const getModuleState = useCallback((moduleId: string): ModuleAnimationState | undefined => {
    return animationStates.get(moduleId);
  }, [animationStates]);
  
  // Set animation state for a module
  const setModuleState = useCallback((
    moduleId: string,
    state: AnimationState,
    callbacks?: ModuleAnimationState['callbacks']
  ) => {
    setAnimationStates(prev => {
      const newMap = new Map(prev);
      const currentState = newMap.get(moduleId);
      
      newMap.set(moduleId, {
        moduleId,
        state,
        progress: 0,
        startTime: performance.now(),
        callbacks: callbacks || currentState?.callbacks || {},
      });
      
      return newMap;
    });
    
    // Record start time for this animation
    startTimeRef.current.set(moduleId, performance.now());
  }, []);
  
  // Transition to a new animation state
  const transitionTo = useCallback((
    moduleId: string,
    newState: AnimationState
  ) => {
    const currentState = animationStates.get(moduleId);
    
    // Trigger exit callback if exists
    if (currentState?.callbacks?.onExit) {
      currentState.callbacks.onExit();
    }
    
    // Set new state with appropriate enter callback
    const callbacks = {
      ...currentState?.callbacks,
    };
    
    // Set appropriate enter callback based on new state
    switch (newState) {
      case 'active':
        if (callbacks.onActivate) {
          setTimeout(() => callbacks.onActivate?.(), 50);
        }
        break;
      case 'charging':
        if (callbacks.onCharge) {
          setTimeout(() => callbacks.onCharge?.(), 50);
        }
        break;
      case 'overload':
        if (callbacks.onOverload) {
          setTimeout(() => callbacks.onOverload?.(), 50);
        }
        break;
      case 'failing':
        if (callbacks.onFail) {
          setTimeout(() => callbacks.onFail?.(), 50);
        }
        break;
      case 'shutdown':
        if (callbacks.onShutdown) {
          setTimeout(() => callbacks.onShutdown?.(), 50);
        }
        break;
    }
    
    setModuleState(moduleId, newState, callbacks);
  }, [animationStates, setModuleState]);
  
  // Register animation callbacks for a module
  const registerCallbacks = useCallback((
    moduleId: string,
    callbacks: ModuleAnimationState['callbacks']
  ) => {
    setAnimationStates(prev => {
      const newMap = new Map(prev);
      const currentState = newMap.get(moduleId) || {
        moduleId,
        state: 'idle' as AnimationState,
        progress: 0,
        startTime: performance.now(),
        callbacks: {},
      };
      
      newMap.set(moduleId, {
        ...currentState,
        callbacks: {
          ...currentState.callbacks,
          ...callbacks,
        },
      });
      
      return newMap;
    });
  }, []);
  
  // Calculate current animation properties for a module
  const getAnimationProperties = useCallback((
    moduleId: string
  ): Record<string, number | string> | null => {
    const state = animationStates.get(moduleId);
    if (!state) return null;
    
    const module = modules.find(m => m.instanceId === moduleId);
    if (!module) return null;
    
    const config = getModuleAnimationConfig(module.type);
    const phaseConfig = config[state.state];
    
    // Calculate progress through current animation
    const elapsed = performance.now() - state.startTime;
    const rawProgress = Math.min(1, elapsed / phaseConfig.duration);
    
    // Apply easing
    const progress = applyEasing(rawProgress, phaseConfig.easing);
    
    // Interpolate keyframes
    return interpolateKeyframes(phaseConfig.keyframes, progress);
  }, [animationStates, modules]);
  
  // Sync animation states with machine activation state
  const syncWithMachineState = useCallback(() => {
    const targetState = machineStateToAnimationState(machineState);
    
    modules.forEach(module => {
      const currentState = animationStates.get(module.instanceId);
      
      if (!currentState || currentState.state === 'idle') {
        // Module is idle, start transition to target state
        if (targetState !== 'idle') {
          transitionTo(module.instanceId, targetState);
        }
      } else if (currentState.state !== targetState) {
        // State mismatch, transition to new state
        transitionTo(module.instanceId, targetState);
      }
    });
  }, [machineState, modules, animationStates, transitionTo]);
  
  // Update animation progress for all modules
  const updateAnimations = useCallback(() => {
    setAnimationStates(prev => {
      let hasChanges = false;
      const newMap = new Map(prev);
      
      newMap.forEach((state, moduleId) => {
        const module = modules.find(m => m.instanceId === moduleId);
        if (!module) return;
        
        const config = getModuleAnimationConfig(module.type);
        const phaseConfig = config[state.state];
        const elapsed = performance.now() - state.startTime;
        const progress = Math.min(1, elapsed / phaseConfig.duration);
        
        if (progress !== state.progress) {
          hasChanges = true;
          newMap.set(moduleId, {
            ...state,
            progress,
          });
        }
      });
      
      return hasChanges ? newMap : prev;
    });
    
    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(updateAnimations);
  }, [modules]);
  
  // Start animation loop
  const startAnimationLoop = useCallback(() => {
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(updateAnimations);
    }
  }, [updateAnimations]);
  
  // Stop animation loop
  const stopAnimationLoop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);
  
  // Reset all modules to idle state
  const resetAllAnimations = useCallback(() => {
    modules.forEach(module => {
      setModuleState(module.instanceId, 'idle');
    });
  }, [modules, setModuleState]);
  
  // Get all modules in a specific animation state
  const getModulesInState = useCallback((state: AnimationState): string[] => {
    const result: string[] = [];
    animationStates.forEach((animState, moduleId) => {
      if (animState.state === state) {
        result.push(moduleId);
      }
    });
    return result;
  }, [animationStates]);
  
  // Check if all modules have completed their animations
  const areAnimationsComplete = useCallback((): boolean => {
    let complete = true;
    animationStates.forEach(state => {
      if (state.progress < 1 && state.state !== 'idle') {
        complete = false;
      }
    });
    return complete;
  }, [animationStates]);
  
  return {
    // State management
    animationStates,
    getModuleState,
    setModuleState,
    transitionTo,
    registerCallbacks,
    
    // Configuration
    getAnimationConfig,
    getAnimationProperties,
    
    // Animation loop control
    startAnimationLoop,
    stopAnimationLoop,
    updateAnimations,
    
    // Machine state sync
    syncWithMachineState,
    resetAllAnimations,
    
    // Queries
    getModulesInState,
    areAnimationsComplete,
    
    // Computed
    totalModules: modules.length,
    currentMachineState: machineState,
  };
}

/**
 * Apply easing function to progress value
 */
function applyEasing(progress: number, easing: string): number {
  // Handle common CSS easing functions
  switch (easing) {
    case 'ease-in':
      return progress * progress;
    case 'ease-out':
      return 1 - Math.pow(1 - progress, 2);
    case 'ease-in-out':
      return progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    case 'linear':
    default:
      return progress;
  }
}

export default useModuleAnimation;
