/**
 * useEnergyConnections Hook
 * 
 * Round 111: Energy Connection System + Module Animation Hooks
 * 
 * This hook manages energy connections between modules:
 * - Create connections between modules
 * - Update connection state based on activation
 * - Remove connections
 * - Validate connection compatibility (input↔output)
 */

import { useCallback, useMemo } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import {
  ConnectionState,
  ConnectionValidationResult,
  getModuleConnectionConfig,
} from '../types/connection';
import { PlacedModule, Connection as StoreConnection } from '../types';
import { calculateConnectionPath } from '../utils/connectionEngine';
import { v4 as uuidv4 } from 'uuid';

/**
 * Validate if a connection can be created between two ports
 */
export function validateConnectionAttempt(
  sourceModuleId: string,
  sourcePortId: string,
  targetModuleId: string,
  targetPortId: string,
  modules: PlacedModule[],
  existingConnections: StoreConnection[]
): ConnectionValidationResult {
  // 1. Check for self-connection
  if (sourceModuleId === targetModuleId) {
    return {
      valid: false,
      errorCode: 'SELF_CONNECTION',
      errorMessage: '模块无法连接到自身',
    };
  }

  // 2. Find source and target modules
  const sourceModule = modules.find(m => m.instanceId === sourceModuleId);
  const targetModule = modules.find(m => m.instanceId === targetModuleId);

  if (!sourceModule) {
    return {
      valid: false,
      errorCode: 'SOURCE_NOT_FOUND',
      errorMessage: '源模块不存在',
    };
  }

  if (!targetModule) {
    return {
      valid: false,
      errorCode: 'TARGET_NOT_FOUND',
      errorMessage: '目标模块不存在',
    };
  }

  // 3. Get port configurations for module types
  const sourceConfig = getModuleConnectionConfig(sourceModule.type);
  const targetConfig = getModuleConnectionConfig(targetModule.type);

  if (!sourceConfig || !targetConfig) {
    return {
      valid: false,
      errorCode: 'SOURCE_NOT_FOUND',
      errorMessage: '模块端口配置不存在',
    };
  }

  // 4. Check port types by examining the ports array
  const sourcePort = sourceModule.ports.find(p => p.id === sourcePortId);
  const targetPort = targetModule.ports.find(p => p.id === targetPortId);
  
  // 5. If ports found, validate types match expected pattern (output → input)
  if (sourcePort && targetPort) {
    // Both ports exist - check types match expected pattern
    if (sourcePort.type === targetPort.type) {
      return {
        valid: false,
        errorCode: 'SAME_PORT_TYPE',
        errorMessage: sourcePort.type === 'input'
          ? '输入端口无法连接到输入端口'
          : '输出端口无法连接到输出端口',
      };
    }
    
    // Correct types (output → input)
    if (sourcePort.type !== 'output' || targetPort.type !== 'input') {
      return {
        valid: false,
        errorCode: 'INVALID_PORT_TYPE',
        errorMessage: '只能从输出端口连接到输入端口',
      };
    }
  } else {
    // Port IDs don't match expected pattern - try checking by naming convention
    const isSourceOutput = sourcePortId.includes('output');
    const isTargetInput = targetPortId.includes('input');
    
    if (isSourceOutput === isTargetInput) {
      // Both are same type (both output or both input) or naming convention unclear
      return {
        valid: false,
        errorCode: 'SAME_PORT_TYPE',
        errorMessage: '端口类型不匹配',
      };
    }
  }

  // 6. Check for duplicate connections
  const isDuplicate = existingConnections.some(
    c =>
      (c.sourceModuleId === sourceModuleId && c.sourcePortId === sourcePortId &&
       c.targetModuleId === targetModuleId && c.targetPortId === targetPortId) ||
      (c.sourceModuleId === targetModuleId && c.sourcePortId === targetPortId &&
       c.targetModuleId === sourceModuleId && c.targetPortId === sourcePortId)
  );

  if (isDuplicate) {
    return {
      valid: false,
      errorCode: 'DUPLICATE_CONNECTION',
      errorMessage: '连接已存在',
    };
  }

  return { valid: true };
}

/**
 * Create path data for a connection between two points
 */
export function createConnectionPathData(
  modules: PlacedModule[],
  sourceModuleId: string,
  sourcePortId: string,
  targetModuleId: string,
  targetPortId: string
): string {
  return calculateConnectionPath(modules, sourceModuleId, sourcePortId, targetModuleId, targetPortId);
}

/**
 * useEnergyConnections Hook
 * 
 * React hook for managing energy connections in the machine editor
 */
export function useEnergyConnections() {
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const machineState = useMachineStore((state) => state.machineState);
  const setConnectionError = useMachineStore((state) => state.setConnectionError);
  
  // Create a new connection between two modules
  const createNewConnection = useCallback(
    (sourceModuleId: string, sourcePortId: string, targetModuleId: string, targetPortId: string): StoreConnection | null => {
      // Validate the connection attempt
      const validation = validateConnectionAttempt(
        sourceModuleId,
        sourcePortId,
        targetModuleId,
        targetPortId,
        modules,
        connections
      );

      if (!validation.valid) {
        setConnectionError(validation.errorMessage || '连接创建失败');
        return null;
      }

      // Calculate path data
      const pathData = createConnectionPathData(
        modules,
        sourceModuleId,
        sourcePortId,
        targetModuleId,
        targetPortId
      );

      // Create the connection (using store's Connection type)
      const newConnection: StoreConnection = {
        id: uuidv4(),
        sourceModuleId,
        sourcePortId,
        targetModuleId,
        targetPortId,
        pathData,
      };

      return newConnection;
    },
    [modules, connections, setConnectionError]
  );

  // Remove a connection by ID
  const removeConnectionById = useCallback(
    (connectionId: string): boolean => {
      const exists = connections.some(c => c.id === connectionId);
      if (!exists) return false;
      
      // Use store's removeConnection action
      useMachineStore.getState().removeConnection(connectionId);
      return true;
    },
    [connections]
  );

  // Update connection state based on activation
  const updateConnectionStates = useCallback(
    (_newMachineState: ConnectionState) => {
      // This is a placeholder - actual state management would be in the store
      // The store's machineState already controls connection visualization
    },
    []
  );

  // Get connections for a specific module
  const getModuleConnections = useCallback(
    (moduleInstanceId: string): StoreConnection[] => {
      return connections.filter(
        c => c.sourceModuleId === moduleInstanceId || c.targetModuleId === moduleInstanceId
      );
    },
    [connections]
  );

  // Get connections by state (using path data presence as indicator)
  const getConnectionsByState = useCallback(
    (_state: ConnectionState): StoreConnection[] => {
      // Since the store's Connection type doesn't have state,
      // this returns all connections (placeholder implementation)
      return connections;
    },
    [connections]
  );

  // Check if a module can accept outgoing connections
  const canModuleAcceptOutput = useCallback(
    (moduleInstanceId: string): boolean => {
      const moduleConnections = getModuleConnections(moduleInstanceId);
      const module = modules.find(m => m.instanceId === moduleInstanceId);
      if (!module) return false;

      const config = getModuleConnectionConfig(module.type);
      if (!config) return false;

      const outputCount = config.outputs.length;
      const usedOutputs = moduleConnections.filter(
        c => c.sourceModuleId === moduleInstanceId
      ).length;

      return usedOutputs < outputCount;
    },
    [modules, getModuleConnections]
  );

  // Check if a module can accept incoming connections
  const canModuleAcceptInput = useCallback(
    (moduleInstanceId: string): boolean => {
      const moduleConnections = getModuleConnections(moduleInstanceId);
      const module = modules.find(m => m.instanceId === moduleInstanceId);
      if (!module) return false;

      const config = getModuleConnectionConfig(module.type);
      if (!config) return false;

      const inputCount = config.inputs.length;
      const usedInputs = moduleConnections.filter(
        c => c.targetModuleId === moduleInstanceId
      ).length;

      return usedInputs < inputCount;
    },
    [modules, getModuleConnections]
  );

  // Get available ports for connection creation
  const getAvailableConnectionPorts = useCallback(
    (moduleInstanceId: string, isSource: boolean): Array<{ id: string; type: 'input' | 'output' }> => {
      const module = modules.find(m => m.instanceId === moduleInstanceId);
      if (!module) return [];

      const config = getModuleConnectionConfig(module.type);
      if (!config) return [];

      const ports = isSource ? config.outputs : config.inputs;
      const portType = isSource ? 'output' : 'input';
      
      const moduleConnections = getModuleConnections(moduleInstanceId);
      
      return ports.map((_, index) => {
        const portId = `${moduleInstanceId}-${portType}-${index}`;
        const isUsed = moduleConnections.some(
          c => isSource
            ? c.sourcePortId === portId
            : c.targetPortId === portId
        );
        
        if (isUsed) return null;
        return { id: portId, type: portType };
      }).filter((p): p is { id: string; type: 'input' | 'output' } => p !== null);
    },
    [modules, getModuleConnections]
  );

  // Get connection statistics
  const connectionStats = useMemo(() => {
    const stats = {
      total: connections.length,
      idle: connections.length,
      charging: 0,
      active: 0,
      overload: 0,
      broken: 0,
      byModule: new Map<string, { incoming: number; outgoing: number }>(),
    };

    // Count per module
    connections.forEach(conn => {
      // Outgoing
      const sourceStats = stats.byModule.get(conn.sourceModuleId) || { incoming: 0, outgoing: 0 };
      sourceStats.outgoing++;
      stats.byModule.set(conn.sourceModuleId, sourceStats);

      // Incoming
      const targetStats = stats.byModule.get(conn.targetModuleId) || { incoming: 0, outgoing: 0 };
      targetStats.incoming++;
      stats.byModule.set(conn.targetModuleId, targetStats);
    });

    return stats;
  }, [connections]);

  // Validate that an output port is being connected to an input port
  const isValidConnection = useCallback(
    (sourceModuleId: string, sourcePortId: string, targetModuleId: string, targetPortId: string): boolean => {
      const result = validateConnectionAttempt(
        sourceModuleId,
        sourcePortId,
        targetModuleId,
        targetPortId,
        modules,
        connections
      );
      return result.valid;
    },
    [modules, connections]
  );

  return {
    // Actions
    createNewConnection,
    removeConnectionById,
    updateConnectionStates,
    
    // Queries
    getModuleConnections,
    getConnectionsByState,
    canModuleAcceptOutput,
    canModuleAcceptInput,
    getAvailableConnectionPorts,
    isValidConnection,
    
    // Computed
    connectionStats,
    totalConnections: connections.length,
    activeConnections: connections.length,
    machineState,
  };
}

export default useEnergyConnections;
