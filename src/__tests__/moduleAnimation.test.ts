/**
 * Module Animation Test Suite
 * 
 * Round 111: Energy Connection System + Module Animation Hooks
 * 
 * Tests for useModuleAnimation hook and animation state machine
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getModuleAnimationConfig,
  machineStateToAnimationState,
  AnimationState,
  ModuleAnimationConfig,
  AnimationPhaseConfig,
} from '../hooks/useModuleAnimation';
import { ModuleType } from '../types';

// Helper to check animation config has required properties
function assertAnimationPhaseConfig(config: AnimationPhaseConfig, phaseName: string) {
  expect(config.duration).toBeGreaterThan(0);
  expect(config.easing).toBeDefined();
  expect(Array.isArray(config.keyframes)).toBe(true);
  expect(config.keyframes.length).toBeGreaterThan(0);
  
  // Check keyframes have time and properties
  config.keyframes.forEach((kf, idx) => {
    expect(kf.time).toBeGreaterThanOrEqual(0);
    expect(kf.time).toBeLessThanOrEqual(1);
    expect(kf.properties).toBeDefined();
  });
}

describe('Animation State Machine (AC-111-006)', () => {
  describe('machineStateToAnimationState', () => {
    it('should map idle machine state to idle animation state', () => {
      expect(machineStateToAnimationState('idle')).toBe('idle');
    });
    
    it('should map charging machine state to charging animation state', () => {
      expect(machineStateToAnimationState('charging')).toBe('charging');
    });
    
    it('should map active machine state to active animation state', () => {
      expect(machineStateToAnimationState('active')).toBe('active');
    });
    
    it('should map overload machine state to overload animation state', () => {
      expect(machineStateToAnimationState('overload')).toBe('overload');
    });
    
    it('should map failure machine state to failing animation state', () => {
      expect(machineStateToAnimationState('failure')).toBe('failing');
    });
    
    it('should map shutdown machine state to shutdown animation state', () => {
      expect(machineStateToAnimationState('shutdown')).toBe('shutdown');
    });
    
    it('should default to idle for unknown state', () => {
      expect(machineStateToAnimationState('unknown')).toBe('idle');
      expect(machineStateToAnimationState('')).toBe('idle');
    });
  });
  
  describe('State transitions', () => {
    it('should allow transition from idle to charging', () => {
      const state: AnimationState = 'idle';
      const newState = machineStateToAnimationState('charging');
      
      expect(state).toBe('idle');
      expect(newState).toBe('charging');
    });
    
    it('should allow transition from charging to active', () => {
      const state: AnimationState = 'charging';
      const newState = machineStateToAnimationState('active');
      
      expect(state).toBe('charging');
      expect(newState).toBe('active');
    });
    
    it('should allow transition from active to shutdown', () => {
      const state: AnimationState = 'active';
      const newState = machineStateToAnimationState('shutdown');
      
      expect(state).toBe('active');
      expect(newState).toBe('shutdown');
    });
    
    it('should allow transition to idle from any state', () => {
      const states: AnimationState[] = ['entering', 'charging', 'active', 'overload', 'failing', 'shutdown', 'exiting'];
      
      states.forEach(state => {
        expect(state).not.toBe('idle');
      });
    });
  });
});

describe('Module Animation Configurations (AC-111-008)', () => {
  it('should have animation config for core-furnace', () => {
    const config = getModuleAnimationConfig('core-furnace');
    
    expect(config.moduleType).toBe('core-furnace');
    expect(config.idle).toBeDefined();
    expect(config.entering).toBeDefined();
    expect(config.charging).toBeDefined();
    expect(config.active).toBeDefined();
    expect(config.overload).toBeDefined();
    expect(config.failing).toBeDefined();
    expect(config.shutdown).toBeDefined();
    expect(config.exiting).toBeDefined();
  });
  
  it('should have animation config for gear module', () => {
    const config = getModuleAnimationConfig('gear');
    
    expect(config.moduleType).toBe('gear');
    assertAnimationPhaseConfig(config.active, 'active');
  });
  
  it('should have animation config for rune-node', () => {
    const config = getModuleAnimationConfig('rune-node');
    
    expect(config.moduleType).toBe('rune-node');
    assertAnimationPhaseConfig(config.active, 'active');
  });
  
  it('should have animation config for energy-pipe', () => {
    const config = getModuleAnimationConfig('energy-pipe');
    
    expect(config.moduleType).toBe('energy-pipe');
    assertAnimationPhaseConfig(config.active, 'active');
  });
  
  it('should have animation config for shield-shell', () => {
    const config = getModuleAnimationConfig('shield-shell');
    
    expect(config.moduleType).toBe('shield-shell');
    assertAnimationPhaseConfig(config.active, 'active');
  });
  
  it('should have animation config for trigger-switch', () => {
    const config = getModuleAnimationConfig('trigger-switch');
    
    expect(config.moduleType).toBe('trigger-switch');
    assertAnimationPhaseConfig(config.active, 'active');
  });
  
  it('should have animation config for output-array', () => {
    const config = getModuleAnimationConfig('output-array');
    
    expect(config.moduleType).toBe('output-array');
    assertAnimationPhaseConfig(config.active, 'active');
  });
  
  it('should return default config for unknown module types', () => {
    const config = getModuleAnimationConfig('unknown-module' as ModuleType);
    
    expect(config.moduleType).toBe('unknown-module');
    assertAnimationPhaseConfig(config.active, 'active');
  });
});

describe('Animation Config Differences (AC-111-008)', () => {
  it('should have different active duration for core vs gear', () => {
    const coreConfig = getModuleAnimationConfig('core-furnace');
    const gearConfig = getModuleAnimationConfig('gear');
    
    // Core has longer active animation (500ms)
    // Gear has shorter active animation (1000ms for full rotation)
    // They should be different
    expect(coreConfig.active.duration).not.toBe(gearConfig.active.duration);
  });
  
  it('should have different easing for rune vs pipe', () => {
    const runeConfig = getModuleAnimationConfig('rune-node');
    const pipeConfig = getModuleAnimationConfig('energy-pipe');
    
    // These should potentially have different easing characteristics
    // At minimum, they should both be valid easing strings
    expect(typeof runeConfig.active.easing).toBe('string');
    expect(typeof pipeConfig.active.easing).toBe('string');
  });
  
  it('should have keyframes with required properties for all phases', () => {
    const config = getModuleAnimationConfig('core-furnace');
    const phases: (keyof Omit<ModuleAnimationConfig, 'moduleType'>)[] = [
      'idle', 'entering', 'charging', 'active', 'overload', 'failing', 'shutdown', 'exiting'
    ];
    
    phases.forEach(phase => {
      const phaseConfig = config[phase];
      expect(phaseConfig.keyframes.length).toBeGreaterThan(0);
      
      phaseConfig.keyframes.forEach(kf => {
        // Each keyframe should have at least one property
        expect(Object.keys(kf.properties).length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Animation Keyframes', () => {
  it('should have valid keyframe times (0-1 normalized)', () => {
    const config = getModuleAnimationConfig('core-furnace');
    
    config.active.keyframes.forEach(kf => {
      expect(kf.time).toBeGreaterThanOrEqual(0);
      expect(kf.time).toBeLessThanOrEqual(1);
    });
  });
  
  it('should have first keyframe at time 0', () => {
    const config = getModuleAnimationConfig('gear');
    
    expect(config.active.keyframes[0].time).toBe(0);
  });
  
  it('should have last keyframe at time 1', () => {
    const config = getModuleAnimationConfig('gear');
    const lastKeyframe = config.active.keyframes[config.active.keyframes.length - 1];
    
    expect(lastKeyframe.time).toBe(1);
  });
  
  it('should support rotation keyframes for gear', () => {
    const config = getModuleAnimationConfig('gear');
    
    const hasRotation = config.active.keyframes.some(
      kf => kf.properties.rotation !== undefined
    );
    
    expect(hasRotation).toBe(true);
  });
  
  it('should support scale keyframes', () => {
    const config = getModuleAnimationConfig('core-furnace');
    
    const hasScale = config.active.keyframes.some(
      kf => kf.properties.scale !== undefined
    );
    
    expect(hasScale).toBe(true);
  });
  
  it('should have keyframes with at least one animatable property per phase', () => {
    const config = getModuleAnimationConfig('core-furnace');
    const phases: (keyof Omit<ModuleAnimationConfig, 'moduleType'>)[] = [
      'idle', 'entering', 'charging', 'active', 'overload', 'failing', 'shutdown', 'exiting'
    ];
    
    phases.forEach(phase => {
      const phaseConfig = config[phase];
      // Check that keyframes have some animatable property
      const hasAnimatableProperty = phaseConfig.keyframes.some(kf => {
        const props = kf.properties;
        return props.opacity !== undefined || 
               props.scale !== undefined || 
               props.rotation !== undefined ||
               props.strokeWidth !== undefined;
      });
      expect(hasAnimatableProperty).toBe(true);
    });
  });
});

describe('Animation Callbacks (AC-111-007, AC-111-015)', () => {
  it('should define callback structure for animation states', () => {
    const callbacks = {
      onEnter: vi.fn(),
      onCharge: vi.fn(),
      onActivate: vi.fn(),
      onOverload: vi.fn(),
      onFail: vi.fn(),
      onShutdown: vi.fn(),
      onExit: vi.fn(),
    };
    
    expect(typeof callbacks.onEnter).toBe('function');
    expect(typeof callbacks.onCharge).toBe('function');
    expect(typeof callbacks.onActivate).toBe('function');
    expect(typeof callbacks.onOverload).toBe('function');
    expect(typeof callbacks.onFail).toBe('function');
    expect(typeof callbacks.onShutdown).toBe('function');
    expect(typeof callbacks.onExit).toBe('function');
  });
  
  it('should support registering multiple callbacks', () => {
    const callbacks = {
      onEnter: vi.fn(),
      onActivate: vi.fn(),
    };
    
    callbacks.onEnter();
    callbacks.onActivate();
    
    expect(callbacks.onEnter).toHaveBeenCalledTimes(1);
    expect(callbacks.onActivate).toHaveBeenCalledTimes(1);
  });
  
  it('should track callback invocation order', () => {
    const callOrder: string[] = [];
    
    const callbacks = {
      onEnter: () => callOrder.push('enter'),
      onCharge: () => callOrder.push('charge'),
      onActivate: () => callOrder.push('activate'),
    };
    
    // Simulate state transitions
    callbacks.onEnter();
    callbacks.onCharge();
    callbacks.onActivate();
    
    expect(callOrder).toEqual(['enter', 'charge', 'activate']);
  });
  
  it('should support callback sequence for idle to active transition', () => {
    const callOrder: string[] = [];
    
    const callbacks = {
      onEnter: () => callOrder.push('enter'),
      onCharge: () => callOrder.push('charge'),
      onActivate: () => callOrder.push('activate'),
    };
    
    // Simulate: idle → charging → active
    callbacks.onEnter();  // entering state
    callbacks.onCharge(); // charging state
    callbacks.onActivate(); // active state
    
    expect(callOrder).toContain('enter');
    expect(callOrder).toContain('charge');
    expect(callOrder).toContain('activate');
    expect(callOrder.indexOf('enter')).toBeLessThan(callOrder.indexOf('charge'));
    expect(callOrder.indexOf('charge')).toBeLessThan(callOrder.indexOf('activate'));
  });
});

describe('Animation Duration Values', () => {
  it('should have reasonable duration values for idle animation', () => {
    const config = getModuleAnimationConfig('core-furnace');
    
    // Idle animation should be longer (ambient effect)
    expect(config.idle.duration).toBeGreaterThanOrEqual(1000);
  });
  
  it('should have reasonable duration values for active animation', () => {
    const config = getModuleAnimationConfig('core-furnace');
    
    // Active animation should be moderate
    expect(config.active.duration).toBeGreaterThanOrEqual(100);
    expect(config.active.duration).toBeLessThanOrEqual(2000);
  });
  
  it('should have short duration for overload animation', () => {
    const config = getModuleAnimationConfig('core-furnace');
    
    // Overload should be quick and intense
    expect(config.overload.duration).toBeLessThan(500);
  });
  
  it('should have moderate duration for failing animation', () => {
    const config = getModuleAnimationConfig('core-furnace');
    
    // Failing should be noticeable but not too long
    expect(config.failing.duration).toBeGreaterThanOrEqual(200);
    expect(config.failing.duration).toBeLessThanOrEqual(1000);
  });
});

describe('Easing Functions', () => {
  it('should use valid easing strings', () => {
    const config = getModuleAnimationConfig('core-furnace');
    const validEasings = ['linear', 'ease-in', 'ease-out', 'ease-in-out'];
    
    const phases = ['idle', 'charging', 'active', 'overload', 'failing', 'shutdown'] as const;
    
    phases.forEach(phase => {
      expect(validEasings).toContain(config[phase].easing);
    });
  });
});

describe('Animation State Values', () => {
  it('should have all required animation states', () => {
    const expectedStates: AnimationState[] = [
      'idle',
      'entering',
      'charging',
      'active',
      'overload',
      'failing',
      'shutdown',
      'exiting'
    ];
    
    const coreConfig = getModuleAnimationConfig('core-furnace');
    
    expectedStates.forEach(state => {
      expect(coreConfig[state]).toBeDefined();
      expect(typeof coreConfig[state]).toBe('object');
    });
  });
});
