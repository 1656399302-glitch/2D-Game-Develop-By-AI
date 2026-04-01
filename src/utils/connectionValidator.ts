/**
 * Connection Validator - Validates connection attempts between modules
 * 
 * This module provides validation logic for connection creation, including:
 * - Self-connection prevention
 * - Port type mismatch detection (input→input, output→output)
 * - Duplicate connection detection
 */

import { Port, Connection, PlacedModule } from '../types';

/**
 * Error codes for connection validation failures
 */
export type ConnectionErrorCode = 
  | 'SELF_CONNECTION'      // Module connected to itself
  | 'SAME_PORT_TYPE'      // Input connected to input OR output connected to output
  | 'DUPLICATE_CONNECTION' // Connection already exists between same ports
  | 'SOURCE_NOT_FOUND'    // Source module or port not found
  | 'TARGET_NOT_FOUND'    // Target module or port not found
  | 'INVALID_PORT_TYPE'; // Port type is neither input nor output

/**
 * Result of connection validation
 */
export interface ValidationResult {
  valid: boolean;
  error?: {
    code: ConnectionErrorCode;
    message: string;
  };
}

/**
 * Localized error messages for validation failures
 */
const ERROR_MESSAGES: Record<ConnectionErrorCode, string> = {
  'SELF_CONNECTION': '模块无法连接到自身',
  'SAME_PORT_TYPE': '', // Dynamic based on port type
  'DUPLICATE_CONNECTION': '连接已存在',
  'SOURCE_NOT_FOUND': '源模块或端口不存在',
  'TARGET_NOT_FOUND': '目标模块或端口不存在',
  'INVALID_PORT_TYPE': '端口类型无效',
};

/**
 * Get error message for same port type connection attempt
 */
function getSamePortTypeMessage(portType: string): string {
  if (portType === 'input') {
    return '输入端口无法连接到输入端口';
  } else if (portType === 'output') {
    return '输出端口无法连接到输出端口';
  }
  return ERROR_MESSAGES['SAME_PORT_TYPE'];
}

/**
 * Validates a connection attempt between two modules
 * 
 * @param sourceModuleId - The instanceId of the source module
 * @param sourcePort - The source port object
 * @param targetModuleId - The instanceId of the target module
 * @param targetPort - The target port object
 * @param existingConnections - Array of existing connections to check for duplicates
 * @param allModules - Array of all placed modules (for validation)
 * @returns ValidationResult indicating if the connection is valid
 */
export function validateConnection(
  sourceModuleId: string,
  sourcePort: Port,
  targetModuleId: string,
  targetPort: Port,
  existingConnections: Connection[],
  allModules: PlacedModule[]
): ValidationResult {
  
  // 1. Check for self-connection (AC-CONN-VALID-003)
  if (sourceModuleId === targetModuleId) {
    return {
      valid: false,
      error: {
        code: 'SELF_CONNECTION',
        message: ERROR_MESSAGES['SELF_CONNECTION'],
      },
    };
  }

  // 2. Check if modules exist
  const sourceModule = allModules.find(m => m.instanceId === sourceModuleId);
  const targetModule = allModules.find(m => m.instanceId === targetModuleId);
  
  if (!sourceModule) {
    return {
      valid: false,
      error: {
        code: 'SOURCE_NOT_FOUND',
        message: ERROR_MESSAGES['SOURCE_NOT_FOUND'],
      },
    };
  }
  
  if (!targetModule) {
    return {
      valid: false,
      error: {
        code: 'TARGET_NOT_FOUND',
        message: ERROR_MESSAGES['TARGET_NOT_FOUND'],
      },
    };
  }

  // 3. Check if ports exist on modules
  const sourcePortExists = sourceModule.ports.some(p => p.id === sourcePort.id);
  const targetPortExists = targetModule.ports.some(p => p.id === targetPort.id);
  
  if (!sourcePortExists) {
    return {
      valid: false,
      error: {
        code: 'SOURCE_NOT_FOUND',
        message: ERROR_MESSAGES['SOURCE_NOT_FOUND'],
      },
    };
  }
  
  if (!targetPortExists) {
    return {
      valid: false,
      error: {
        code: 'TARGET_NOT_FOUND',
        message: ERROR_MESSAGES['TARGET_NOT_FOUND'],
      },
    };
  }

  // 4. Check port types - must be different (output→input or input→output) (AC-CONN-VALID-001, AC-CONN-VALID-002)
  if (sourcePort.type === targetPort.type) {
    return {
      valid: false,
      error: {
        code: 'SAME_PORT_TYPE',
        message: getSamePortTypeMessage(sourcePort.type),
      },
    };
  }

  // 5. Check for duplicate connections
  const isDuplicate = existingConnections.some(
    c =>
      (c.sourceModuleId === sourceModuleId && c.sourcePortId === sourcePort.id &&
       c.targetModuleId === targetModuleId && c.targetPortId === targetPort.id) ||
      (c.sourceModuleId === targetModuleId && c.sourcePortId === targetPort.id &&
       c.targetModuleId === sourceModuleId && c.targetPortId === sourcePort.id)
  );
  
  if (isDuplicate) {
    return {
      valid: false,
      error: {
        code: 'DUPLICATE_CONNECTION',
        message: ERROR_MESSAGES['DUPLICATE_CONNECTION'],
      },
    };
  }

  // Connection is valid
  return { valid: true };
}

/**
 * Validates if a port can be connected from (source validation)
 */
export function validateSourcePort(
  moduleId: string,
  portId: string,
  allModules: PlacedModule[]
): ValidationResult {
  const module = allModules.find(m => m.instanceId === moduleId);
  
  if (!module) {
    return {
      valid: false,
      error: {
        code: 'SOURCE_NOT_FOUND',
        message: ERROR_MESSAGES['SOURCE_NOT_FOUND'],
      },
    };
  }
  
  const port = module.ports.find(p => p.id === portId);
  
  if (!port) {
    return {
      valid: false,
      error: {
        code: 'SOURCE_NOT_FOUND',
        message: ERROR_MESSAGES['SOURCE_NOT_FOUND'],
      },
    };
  }
  
  if (port.type !== 'output') {
    return {
      valid: false,
      error: {
        code: 'INVALID_PORT_TYPE',
        message: '只能从输出端口发起连接',
      },
    };
  }
  
  return { valid: true };
}

/**
 * Validates if a port can be connected to (target validation)
 */
export function validateTargetPort(
  moduleId: string,
  portId: string,
  allModules: PlacedModule[]
): ValidationResult {
  const module = allModules.find(m => m.instanceId === moduleId);
  
  if (!module) {
    return {
      valid: false,
      error: {
        code: 'TARGET_NOT_FOUND',
        message: ERROR_MESSAGES['TARGET_NOT_FOUND'],
      },
    };
  }
  
  const port = module.ports.find(p => p.id === portId);
  
  if (!port) {
    return {
      valid: false,
      error: {
        code: 'TARGET_NOT_FOUND',
        message: ERROR_MESSAGES['TARGET_NOT_FOUND'],
      },
    };
  }
  
  if (port.type !== 'input') {
    return {
      valid: false,
      error: {
        code: 'INVALID_PORT_TYPE',
        message: '只能连接到输入端口',
      },
    };
  }
  
  return { valid: true };
}

/**
 * Batch validation for multiple connections
 */
export function validateConnections(
  connections: Array<{
    sourceModuleId: string;
    sourcePort: Port;
    targetModuleId: string;
    targetPort: Port;
  }>,
  existingConnections: Connection[],
  allModules: PlacedModule[]
): Array<{ index: number; result: ValidationResult }> {
  return connections.map((conn, index) => ({
    index,
    result: validateConnection(
      conn.sourceModuleId,
      conn.sourcePort,
      conn.targetModuleId,
      conn.targetPort,
      existingConnections,
      allModules
    ),
  }));
}
