/**
 * useConnectionPoints Hook
 * 
 * Round 111: Energy Connection System + Module Animation Hooks
 * 
 * This hook manages connection point definitions and queries for modules.
 * It provides utilities to:
 * - Define connection points per module type
 * - Query connection points for a module
 * - Check if a point is available/connected
 */

import { useCallback, useMemo } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import {
  ConnectionPoint,
  PortType,
  createConnectionPoint,
  isInputPort,
  isOutputPort,
  getModuleConnectionConfig,
} from '../types/connection';
import { PlacedModule } from '../types';

/**
 * Get connection points for a specific module instance
 */
export function getConnectionPointsForModule(
  module: PlacedModule
): ConnectionPoint[] {
  const config = getModuleConnectionConfig(module.type);
  
  if (!config) {
    // Fallback: return empty array for unknown module types
    return [];
  }
  
  const points: ConnectionPoint[] = [];
  
  // Create input connection points
  config.inputs.forEach((input) => {
    points.push(
      createConnectionPoint(
        module.instanceId,
        module.type,
        'input',
        { x: input.x, y: input.y },
        input.label
      )
    );
  });
  
  // Create output connection points
  config.outputs.forEach((output) => {
    points.push(
      createConnectionPoint(
        module.instanceId,
        module.type,
        'output',
        { x: output.x, y: output.y },
        output.label
      )
    );
  });
  
  return points;
}

/**
 * Get all connection points for a module instance (from store)
 */
export function getConnectionPointsForModuleInstance(
  moduleInstanceId: string,
  modules: PlacedModule[]
): ConnectionPoint[] {
  const module = modules.find(m => m.instanceId === moduleInstanceId);
  if (!module) return [];
  return getConnectionPointsForModule(module);
}

/**
 * Get all input points for a module
 */
export function getInputPointsForModule(
  module: PlacedModule
): ConnectionPoint[] {
  const points = getConnectionPointsForModule(module);
  return points.filter(isInputPort);
}

/**
 * Get all output points for a module
 */
export function getOutputPointsForModule(
  module: PlacedModule
): ConnectionPoint[] {
  const points = getConnectionPointsForModule(module);
  return points.filter(isOutputPort);
}

/**
 * Find a specific connection point by ID within a module
 */
export function findConnectionPoint(
  moduleInstanceId: string,
  pointId: string,
  modules: PlacedModule[]
): ConnectionPoint | undefined {
  const points = getConnectionPointsForModuleInstance(moduleInstanceId, modules);
  return points.find(p => p.id === pointId);
}

/**
 * Check if a port/point can accept a connection
 * (i.e., it's not already connected)
 */
export function canPortAcceptConnection(
  moduleInstanceId: string,
  pointId: string,
  connections: Array<{ sourceModuleId: string; sourcePortId: string; targetModuleId: string; targetPortId: string }>
): boolean {
  // Check if any connection uses this point as target
  const hasIncoming = connections.some(
    c => c.targetModuleId === moduleInstanceId && c.targetPortId === pointId
  );
  
  // Check if any connection uses this point as source
  const hasOutgoing = connections.some(
    c => c.sourceModuleId === moduleInstanceId && c.sourcePortId === pointId
  );
  
  return !hasIncoming && !hasOutgoing;
}

/**
 * Get available (unconnected) ports for a module
 */
export function getAvailablePorts(
  module: PlacedModule,
  connections: Array<{ sourceModuleId: string; sourcePortId: string; targetModuleId: string; targetPortId: string }>
): ConnectionPoint[] {
  const points = getConnectionPointsForModule(module);
  return points.filter(p => canPortAcceptConnection(module.instanceId, p.id, connections));
}

/**
 * Get port type (input or output) for a connection point
 */
export function getPortType(
  point: ConnectionPoint
): PortType {
  return point.type;
}

/**
 * Count connection points by type for a module
 */
export function countPortsByType(
  module: PlacedModule
): { inputs: number; outputs: number } {
  const points = getConnectionPointsForModule(module);
  return {
    inputs: points.filter(isInputPort).length,
    outputs: points.filter(isOutputPort).length,
  };
}

/**
 * Calculate world position for a connection point
 * Takes module position, size, and rotation into account
 */
export function calculatePortWorldPosition(
  module: PlacedModule,
  point: ConnectionPoint,
  moduleWidth: number,
  moduleHeight: number
): { x: number; y: number } {
  // Get module size (default to 80x80 if not found)
  const size = { width: moduleWidth, height: moduleHeight };
  
  // Convert relative position (0-100) to absolute position within module
  const absoluteX = (point.relativePosition.x / 100) * size.width;
  const absoluteY = (point.relativePosition.y / 100) * size.height;
  
  // Calculate center of module
  const cx = module.x + size.width / 2;
  const cy = module.y + size.height / 2;
  
  // Apply rotation
  if (module.rotation !== 0) {
    const angle = (module.rotation * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    // Position relative to center
    const px = absoluteX - size.width / 2;
    const py = absoluteY - size.height / 2;
    
    // Rotate around center
    const rx = px * cos - py * sin;
    const ry = px * sin + py * cos;
    
    return {
      x: cx + rx,
      y: cy + ry,
    };
  }
  
  return {
    x: module.x + absoluteX,
    y: module.y + absoluteY,
  };
}

/**
 * useConnectionPoints Hook
 * 
 * React hook for managing connection points in a component
 */
export function useConnectionPoints() {
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  
  // Get all connection points for a specific module
  const getPointsForModule = useCallback(
    (moduleInstanceId: string): ConnectionPoint[] => {
      const module = modules.find(m => m.instanceId === moduleInstanceId);
      if (!module) return [];
      return getConnectionPointsForModule(module);
    },
    [modules]
  );
  
  // Get input points for a module
  const getInputsForModule = useCallback(
    (moduleInstanceId: string): ConnectionPoint[] => {
      const module = modules.find(m => m.instanceId === moduleInstanceId);
      if (!module) return [];
      return getInputPointsForModule(module);
    },
    [modules]
  );
  
  // Get output points for a module
  const getOutputsForModule = useCallback(
    (moduleInstanceId: string): ConnectionPoint[] => {
      const module = modules.find(m => m.instanceId === moduleInstanceId);
      if (!module) return [];
      return getOutputPointsForModule(module);
    },
    [modules]
  );
  
  // Check if a point is available for connection
  const isPointAvailable = useCallback(
    (moduleInstanceId: string, pointId: string): boolean => {
      return canPortAcceptConnection(moduleInstanceId, pointId, connections);
    },
    [connections]
  );
  
  // Get available ports for a module
  const getAvailablePortsForModule = useCallback(
    (moduleInstanceId: string): ConnectionPoint[] => {
      const module = modules.find(m => m.instanceId === moduleInstanceId);
      if (!module) return [];
      return getAvailablePorts(module, connections);
    },
    [modules, connections]
  );
  
  // Get world position for a connection point
  const getPortWorldPosition = useCallback(
    (moduleInstanceId: string, pointId: string, moduleWidth: number, moduleHeight: number): { x: number; y: number } | null => {
      const module = modules.find(m => m.instanceId === moduleInstanceId);
      if (!module) return null;
      
      const points = getConnectionPointsForModule(module);
      const point = points.find(p => p.id === pointId);
      if (!point) return null;
      
      return calculatePortWorldPosition(module, point, moduleWidth, moduleHeight);
    },
    [modules]
  );
  
  // Count total ports for all modules
  const totalPortCounts = useMemo(() => {
    let inputs = 0;
    let outputs = 0;
    
    modules.forEach(module => {
      const counts = countPortsByType(module);
      inputs += counts.inputs;
      outputs += counts.outputs;
    });
    
    return { inputs, outputs };
  }, [modules]);
  
  // Get modules that can be connected (have any ports)
  const connectableModules = useMemo(() => {
    return modules.filter(m => {
      const counts = countPortsByType(m);
      return counts.inputs > 0 || counts.outputs > 0;
    });
  }, [modules]);
  
  return {
    // Queries
    getPointsForModule,
    getInputsForModule,
    getOutputsForModule,
    isPointAvailable,
    getAvailablePortsForModule,
    getPortWorldPosition,
    
    // Computed
    totalPortCounts,
    connectableModules,
    totalModules: modules.length,
    totalConnections: connections.length,
  };
}

export default useConnectionPoints;
