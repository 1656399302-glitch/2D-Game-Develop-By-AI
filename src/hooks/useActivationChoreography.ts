/**
 * useActivationChoreography Hook
 * 
 * Manages sequential module activation based on connection topology.
 * Implements BFS-based activation waves where modules activate in depth order.
 * 
 * Round 109: Sequential Activation Enhancement
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { calculateActivationChoreography, ActivationStep } from '../utils/activationChoreographer';

export interface ActivationWave {
  depth: number;
  modules: string[]; // module instanceIds
  activationTime: number; // ms from start
}

export interface ActivationSequence {
  waves: ActivationWave[];
  totalDuration: number;
  steps: ActivationStep[];
}

export interface ChoreographyState {
  isActive: boolean;
  currentWave: number;
  currentStep: number;
  elapsedTime: number;
  activatedModules: Set<string>;
}

/**
 * Hook to manage activation choreography sequencing
 * 
 * Features:
 * - BFS-based wave calculation
 * - Sequential module activation by depth
 * - Connection lead-time lighting
 * - Configurable timing parameters
 */
export function useActivationChoreography() {
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const machineState = useMachineStore((state) => state.machineState);
  
  const [choreographyState, setChoreographyState] = useState<ChoreographyState>({
    isActive: false,
    currentWave: 0,
    currentStep: 0,
    elapsedTime: 0,
    activatedModules: new Set(),
  });
  
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Calculate activation sequence based on connection topology
  const activationSequence = useMemo((): ActivationSequence => {
    if (modules.length === 0) {
      return { waves: [], totalDuration: 0, steps: [] };
    }
    
    const result = calculateActivationChoreography(modules, connections);
    
    // Group modules by depth into waves
    const waveMap = new Map<number, ActivationWave>();
    
    result.steps.forEach((step) => {
      if (!waveMap.has(step.depth)) {
        waveMap.set(step.depth, {
          depth: step.depth,
          modules: [],
          activationTime: step.activationTime,
        });
      }
      waveMap.get(step.depth)!.modules.push(step.moduleId);
    });
    
    const waves = Array.from(waveMap.values()).sort((a, b) => a.depth - b.depth);
    
    return {
      waves,
      totalDuration: result.totalDuration,
      steps: result.steps,
    };
  }, [modules, connections]);
  
  // Get modules that should be active at a given elapsed time
  const getActiveModulesAtTime = useCallback((elapsedTime: number): Set<string> => {
    const activeModules = new Set<string>();
    
    activationSequence.waves.forEach((wave) => {
      if (elapsedTime >= wave.activationTime) {
        wave.modules.forEach((moduleId) => {
          activeModules.add(moduleId);
        });
      }
    });
    
    return activeModules;
  }, [activationSequence.waves]);
  
  // Get the current wave index at elapsed time
  const getCurrentWaveAtTime = useCallback((elapsedTime: number): number => {
    for (let i = activationSequence.waves.length - 1; i >= 0; i--) {
      if (elapsedTime >= activationSequence.waves[i].activationTime) {
        return i;
      }
    }
    return -1;
  }, [activationSequence.waves]);
  
  // Start the activation sequence
  const startSequence = useCallback(() => {
    startTimeRef.current = performance.now();
    
    setChoreographyState({
      isActive: true,
      currentWave: -1,
      currentStep: 0,
      elapsedTime: 0,
      activatedModules: new Set(),
    });
    
    // Get the current activation module index setter
    const setActivationModuleIndex = useMachineStore.getState().setActivationModuleIndex;
    
    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTimeRef.current;
      const activeModules = getActiveModulesAtTime(elapsed);
      const currentWave = getCurrentWaveAtTime(elapsed);
      
      setChoreographyState((prev) => ({
        ...prev,
        elapsedTime: elapsed,
        activatedModules: activeModules,
        currentWave: currentWave,
      }));
      
      // Update store with current activation index (number of activated modules)
      setActivationModuleIndex(activeModules.size - 1);
      
      // Continue animation until all modules are activated or sequence ends
      if (elapsed < activationSequence.totalDuration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Sequence complete
        setChoreographyState((prev) => ({
          ...prev,
          isActive: false,
        }));
        setActivationModuleIndex(-1);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [getActiveModulesAtTime, getCurrentWaveAtTime, activationSequence.totalDuration]);
  
  // Stop the activation sequence
  const stopSequence = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setChoreographyState({
      isActive: false,
      currentWave: 0,
      currentStep: 0,
      elapsedTime: 0,
      activatedModules: new Set(),
    });
    
    // Reset store activation index
    const setActivationModuleIndex = useMachineStore.getState().setActivationModuleIndex;
    setActivationModuleIndex(-1);
  }, []);
  
  // Reset sequence state
  const resetSequence = useCallback(() => {
    stopSequence();
  }, [stopSequence]);
  
  // Check if a module should be activated at current time
  const isModuleActive = useCallback((moduleId: string): boolean => {
    return choreographyState.activatedModules.has(moduleId);
  }, [choreographyState.activatedModules]);
  
  // Get activation progress for a specific module (0-1)
  const getModuleActivationProgress = useCallback((moduleId: string): number => {
    const step = activationSequence.steps.find((s) => s.moduleId === moduleId);
    if (!step) return 0;
    
    const progress = Math.min(1, choreographyState.elapsedTime / step.activationTime);
    return progress;
  }, [activationSequence.steps, choreographyState.elapsedTime]);
  
  // Get connection activation timing
  const getConnectionActivationTime = useCallback((connectionId: string): number | null => {
    for (const step of activationSequence.steps) {
      const connectionLightup = step.connectionsToLight.find(
        (c) => c.connectionId === connectionId
      );
      if (connectionLightup) {
        return connectionLightup.activationTime;
      }
    }
    return null;
  }, [activationSequence.steps]);
  
  // Check if machine should be activating based on machine state
  const shouldActivate = machineState === 'charging' || machineState === 'active';
  
  return {
    // State
    choreographyState,
    activationSequence,
    
    // Computed
    shouldActivate,
    totalModules: modules.length,
    totalWaves: activationSequence.waves.length,
    
    // Actions
    startSequence,
    stopSequence,
    resetSequence,
    
    // Queries
    isModuleActive,
    getModuleActivationProgress,
    getConnectionActivationTime,
    getActiveModulesAtTime,
    getCurrentWaveAtTime,
  };
}

export default useActivationChoreography;
