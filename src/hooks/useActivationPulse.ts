import { useMemo, useCallback } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { calculateActivationChoreography } from '../utils/activationChoreographer';

export interface ActivePulse {
  connectionId: string;
  startTime: number;
  duration: number;
  progress: number;
}

export interface ModuleActivationState {
  moduleId: string;
  isActivated: boolean;
  activationTime: number;
  intensity: number; // 0-1 for glow intensity
}

/**
 * Hook to manage pulse timing based on activation choreography.
 * Returns active pulses and their animation progress.
 */
export function useActivationPulse() {
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const machineState = useMachineStore((state) => state.machineState);
  
  // Calculate activation choreography based on BFS order
  const choreography = useMemo(() => {
    if (modules.length === 0) {
      return calculateActivationChoreography([], [], 200, 100);
    }
    return calculateActivationChoreography(modules, connections, 200, 100);
  }, [modules, connections]);
  
  // Get module activation state at a given time
  const getModuleActivationState = useCallback((moduleId: string, currentTime: number): ModuleActivationState => {
    const step = choreography.steps.find(s => s.moduleId === moduleId);
    
    if (!step) {
      return {
        moduleId,
        isActivated: false,
        activationTime: 0,
        intensity: 0,
      };
    }
    
    const elapsed = currentTime - step.activationTime;
    const isActivated = elapsed >= 0;
    
    // Calculate intensity: ramps up to 1 when activating, then fades slightly
    let intensity = 0;
    if (isActivated) {
      // Quick ramp up in first 100ms
      intensity = Math.min(1, elapsed / 100);
      // Then settle to 0.8 for sustained glow
      if (elapsed > 200) {
        intensity = 0.8 + Math.sin(elapsed / 500) * 0.2; // Subtle pulse
      }
    }
    
    return {
      moduleId,
      isActivated,
      activationTime: step.activationTime,
      intensity,
    };
  }, [choreography]);
  
  // Get active connections (pulses) at a given time
  const getActivePulses = useCallback((currentTime: number): ActivePulse[] => {
    const pulses: ActivePulse[] = [];
    
    choreography.steps.forEach(step => {
      step.connectionsToLight.forEach(conn => {
        const elapsed = currentTime - conn.activationTime;
        if (elapsed >= 0) {
          // Default pulse duration: 200ms
          const duration = 200;
          const progress = Math.min(1, elapsed / duration);
          
          pulses.push({
            connectionId: conn.connectionId,
            startTime: conn.activationTime,
            duration,
            progress,
          });
        }
      });
    });
    
    return pulses;
  }, [choreography]);
  
  // Get BFS activation order with timing
  const getActivationOrder = useMemo((): Array<{
    moduleId: string;
    depth: number;
    activationTime: number;
    isSourceModule: boolean;
  }> => {
    return choreography.steps.map(step => ({
      moduleId: step.moduleId,
      depth: step.depth,
      activationTime: step.activationTime,
      isSourceModule: step.depth === 0,
    }));
  }, [choreography]);
  
  // Calculate total activation duration
  const totalDuration = choreography.totalDuration;
  
  // Check if a connection should show a pulse at given time
  const shouldShowConnectionPulse = useCallback((connectionId: string, currentTime: number): boolean => {
    return choreography.steps.some(step => 
      step.connectionsToLight.some(conn => 
        conn.connectionId === connectionId && 
        Math.abs(currentTime - conn.activationTime) < 300
      )
    );
  }, [choreography]);
  
  return {
    choreography,
    getModuleActivationState,
    getActivePulses,
    getActivationOrder,
    totalDuration,
    shouldShowConnectionPulse,
    isActivationActive: machineState === 'charging' || machineState === 'active' || machineState === 'shutdown',
  };
}

export default useActivationPulse;
