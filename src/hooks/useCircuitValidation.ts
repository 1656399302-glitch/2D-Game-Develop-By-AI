/**
 * Circuit Validation Hook
 * 
 * Round 112: Advanced Circuit Validation System
 * Round 113: Fixed activation gate to check for empty modules
 * Round 156: Enhanced Circuit Validation with Auto-Fix Quick Actions
 * 
 * This hook provides real-time circuit validation state management,
 * integrating with the machine store to validate on changes.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { validateCircuit } from '../utils/circuitValidator';
import {
  CircuitValidationResult,
  ValidationError,
  ValidationWarning,
  QuickFixAction,
  QuickFixType,
  isFixableError,
  QUICK_FIX_LABELS,
} from '../types/circuitValidation';

// ============================================================================
// Validation Debounce Configuration
// ============================================================================

const VALIDATION_DEBOUNCE_MS = 100; // Debounce validation for 100ms

// ============================================================================
// Hook Interface
// ============================================================================

export interface UseCircuitValidationResult {
  /** Current validation result */
  validationResult: CircuitValidationResult | null;
  /** Whether the circuit is valid for activation */
  isValid: boolean;
  /** List of validation errors */
  errors: ValidationError[];
  /** List of validation warnings */
  warnings: ValidationWarning[];
  /** Trigger manual re-validation */
  validate: () => void;
  /** Dismiss validation overlay */
  dismissOverlay: () => void;
  /** Whether the overlay is currently visible */
  isOverlayVisible: boolean;
  /** Get affected module IDs for an error */
  getAffectedModules: (error: ValidationError) => string[];
  /** Check if a module is affected by validation errors */
  isModuleAffected: (moduleId: string) => boolean;
  /** Auto-fix ISLAND_MODULES error by removing isolated modules (Round 156) */
  autoFixIslandModules: (error: ValidationError) => void;
  /** Auto-fix UNREACHABLE_OUTPUT error by disconnecting unreachable outputs (Round 156) */
  autoFixUnreachableOutput: (error: ValidationError) => void;
  /** Auto-fix CIRCUIT_INCOMPLETE error by adding default wire (Round 156) */
  autoFixCircuitIncomplete: () => void;
  /** Currently executing fix ID (for button disabling) (Round 156) */
  executingFixId: string | null;
  /** Check if an error is fixable (Round 156) */
  isErrorFixable: (error: ValidationError) => boolean;
  /** Get quick-fix action for an error (Round 156) */
  getQuickFixAction: (error: ValidationError) => QuickFixAction | undefined;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for circuit validation state management
 * 
 * Provides real-time validation of the machine circuit,
 * automatically re-validating when modules or connections change.
 * 
 * Round 156: Extended with auto-fix methods for ISLAND_MODULES, UNREACHABLE_OUTPUT, and CIRCUIT_INCOMPLETE.
 */
export function useCircuitValidation(): UseCircuitValidationResult {
  // Get state from machine store
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const machineState = useMachineStore((state) => state.machineState);
  const removeModule = useMachineStore((state) => state.removeModule);
  const removeConnection = useMachineStore((state) => state.removeConnection);
  const addModule = useMachineStore((state) => state.addModule);
  const startConnection = useMachineStore((state) => state.startConnection);
  const completeConnection = useMachineStore((state) => state.completeConnection);
  
  // Local state for validation result and overlay visibility
  const [validationResult, setValidationResult] = useState<CircuitValidationResult | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [executingFixId, setExecutingFixId] = useState<string | null>(null);
  
  // Ref for debounce timeout
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastValidationRef = useRef<string>('');

  // Memoized validation function - Round 156: Now includes quickFix actions in errors
  const runValidation = useCallback(() => {
    // Create a quick hash of current state for change detection
    const stateHash = `${modules.length}-${connections.length}-${machineState}`;
    
    // Skip if state hasn't changed
    if (stateHash === lastValidationRef.current) {
      return;
    }
    lastValidationRef.current = stateHash;

    // Run validation
    const result = validateCircuit(modules, connections);
    
    // Round 156: Add quickFix actions to errors
    const resultWithFixes: CircuitValidationResult = {
      ...result,
      errors: result.errors.map((validationError) => {
        if (isFixableError(validationError.code)) {
          return {
            ...validationError,
            quickFix: createQuickFixAction(validationError),
          };
        }
        return validationError;
      }),
    };
    
    setValidationResult(resultWithFixes);
    
    // Show overlay if there are errors (only when not in active/charging state)
    if (!result.isValid && machineState === 'idle') {
      setIsOverlayVisible(true);
    } else if (result.isValid) {
      setIsOverlayVisible(false);
    }
  }, [modules, connections, machineState]);

  // Debounced validation on state changes
  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new debounced validation
    debounceTimeoutRef.current = setTimeout(() => {
      runValidation();
    }, VALIDATION_DEBOUNCE_MS);

    // Cleanup on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [runValidation]);

  // Manual validation trigger
  const validate = useCallback(() => {
    // Clear debounce and validate immediately
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    runValidation();
  }, [runValidation]);

  // Dismiss overlay
  const dismissOverlay = useCallback(() => {
    setIsOverlayVisible(false);
  }, []);

  // Get affected module IDs for an error
  const getAffectedModules = useCallback((error: ValidationError): string[] => {
    return error.affectedModuleIds;
  }, []);

  // Check if a module is affected by any validation errors
  const isModuleAffected = useCallback((moduleId: string): boolean => {
    if (!validationResult) return false;
    return validationResult.errors.some(
      (error) => error.affectedModuleIds.includes(moduleId)
    );
  }, [validationResult]);

  // Round 156: Check if an error is fixable
  const isErrorFixable = useCallback((error: ValidationError): boolean => {
    return isFixableError(error.code);
  }, []);

  // Round 156: Get quick-fix action for an error
  const getQuickFixAction = useCallback((error: ValidationError): QuickFixAction | undefined => {
    return error.quickFix;
  }, []);

  // ============================================================================
  // Auto-Fix Methods (Round 156)
  // ============================================================================

  /**
   * Auto-fix ISLAND_MODULES error by removing isolated modules
   * Round 156: Auto-Fix Quick Actions
   */
  const autoFixIslandModules = useCallback((error: ValidationError): void => {
    const fixId = `fix-island-${error.affectedModuleIds[0] || 'unknown'}`;
    setExecutingFixId(fixId);
    
    console.log(`[AutoFix] ISLAND_MODULES: Removing ${error.affectedModuleIds.length} isolated module(s)`);
    
    // Remove all affected (isolated) modules
    const modulesToRemove = error.affectedModuleIds;
    
    // Remove modules one by one
    modulesToRemove.forEach((moduleId) => {
      removeModule(moduleId);
    });
    
    console.log(`[AutoFix] ISLAND_MODULES: Removed ${modulesToRemove.length} modules`);
    
    // Re-validate after fix
    setTimeout(() => {
      runValidation();
      setExecutingFixId(null);
    }, 50);
  }, [removeModule, runValidation]);

  /**
   * Auto-fix UNREACHABLE_OUTPUT error by disconnecting unreachable outputs
   * Round 156: Auto-Fix Quick Actions
   */
  const autoFixUnreachableOutput = useCallback((error: ValidationError): void => {
    const fixId = `fix-unreachable-${error.affectedModuleIds[0] || 'unknown'}`;
    setExecutingFixId(fixId);
    
    console.log(`[AutoFix] UNREACHABLE_OUTPUT: Disconnecting ${error.affectedModuleIds.length} unreachable output(s)`);
    
    // Find connections to affected modules and remove them
    // Since outputs are unreachable, we disconnect them from any inputs
    const currentConnections = useMachineStore.getState().connections;
    const connectionsToRemove: string[] = [];
    
    error.affectedModuleIds.forEach((moduleId) => {
      // Find connections where this module is the target (input connection)
      const incomingConnections = currentConnections.filter(
        (conn) => conn.targetModuleId === moduleId
      );
      connectionsToRemove.push(...incomingConnections.map((conn) => conn.id));
    });
    
    // Remove the connections
    connectionsToRemove.forEach((connId) => {
      removeConnection(connId);
    });
    
    console.log(`[AutoFix] UNREACHABLE_OUTPUT: Removed ${connectionsToRemove.length} connections`);
    
    // Re-validate after fix
    setTimeout(() => {
      runValidation();
      setExecutingFixId(null);
    }, 50);
  }, [removeConnection, runValidation]);

  /**
   * Auto-fix CIRCUIT_INCOMPLETE error by adding default wire from nearest input node
   * Round 156: Auto-Fix Quick Actions
   */
  const autoFixCircuitIncomplete = useCallback((): void => {
    const fixId = `fix-incomplete-${Date.now()}`;
    setExecutingFixId(fixId);
    
    console.log(`[AutoFix] CIRCUIT_INCOMPLETE: Adding default wire connection`);
    
    const currentModules = useMachineStore.getState().modules;
    const currentConnections = useMachineStore.getState().connections;
    
    // Find an input module (has output ports but no incoming connections)
    // AND it must be different from any module that needs input
    const inputModules = currentModules.filter((m) => {
      const hasOutput = m.ports.some((p) => p.type === 'output');
      const hasIncomingConnection = currentConnections.some(
        (conn) => conn.targetModuleId === m.instanceId
      );
      return hasOutput && !hasIncomingConnection;
    });
    
    // Find an output module (has input ports but no incoming connections)
    const outputModules = currentModules.filter((m) => {
      const hasInput = m.ports.some((p) => p.type === 'input');
      const hasIncomingConnection = currentConnections.some(
        (conn) => conn.targetModuleId === m.instanceId
      );
      return hasInput && !hasIncomingConnection;
    });
    
    // Find a valid source-target pair (source must be different from target)
    let sourceModule: typeof currentModules[0] | null = null;
    let targetModule: typeof currentModules[0] | null = null;
    
    for (const source of inputModules) {
      for (const target of outputModules) {
        // Skip if source and target are the same module
        if (source.instanceId === target.instanceId) {
          continue;
        }
        sourceModule = source;
        targetModule = target;
        break;
      }
      if (sourceModule) break;
    }
    
    if (sourceModule && targetModule) {
      const sourceOutputPort = sourceModule.ports.find((p) => p.type === 'output');
      const targetInputPort = targetModule.ports.find((p) => p.type === 'input');
      
      if (sourceOutputPort && targetInputPort) {
        // Need to start connection first, then complete it
        startConnection(sourceModule.instanceId, sourceOutputPort.id);
        completeConnection(targetModule.instanceId, targetInputPort.id);
        console.log(`[AutoFix] CIRCUIT_INCOMPLETE: Created wire from ${sourceModule.type} to ${targetModule.type}`);
      }
    } else if (currentModules.length > 0) {
      // No suitable modules to connect, add a core furnace
      const lastModule = currentModules[currentModules.length - 1];
      addModule('core-furnace', lastModule.x + 150, lastModule.y);
      console.log(`[AutoFix] CIRCUIT_INCOMPLETE: Added core-furnace module`);
    }
    
    // Re-validate after fix
    setTimeout(() => {
      runValidation();
      setExecutingFixId(null);
    }, 50);
  }, [addModule, startConnection, completeConnection, runValidation]);

  // Derived state
  const isValid = validationResult?.isValid ?? true;
  const errors = validationResult?.errors ?? [];
  const warnings = validationResult?.warnings ?? [];

  return useMemo(() => ({
    validationResult,
    isValid,
    errors,
    warnings,
    validate,
    dismissOverlay,
    isOverlayVisible,
    getAffectedModules,
    isModuleAffected,
    autoFixIslandModules,
    autoFixUnreachableOutput,
    autoFixCircuitIncomplete,
    executingFixId,
    isErrorFixable,
    getQuickFixAction,
  }), [
    validationResult,
    isValid,
    errors,
    warnings,
    validate,
    dismissOverlay,
    isOverlayVisible,
    getAffectedModules,
    isModuleAffected,
    autoFixIslandModules,
    autoFixUnreachableOutput,
    autoFixCircuitIncomplete,
    executingFixId,
    isErrorFixable,
    getQuickFixAction,
  ]);
}

// ============================================================================
// Helper Functions (Round 156)
// ============================================================================

/**
 * Create a quick-fix action for a validation error
 * Round 156: Auto-Fix Quick Actions
 */
function createQuickFixAction(
  error: ValidationError
): QuickFixAction | undefined {
  if (!isFixableError(error.code)) {
    return undefined;
  }

  const fixType = error.code as QuickFixType;
  const labels = QUICK_FIX_LABELS[fixType];

  let description = labels.description;
  
  // Customize description based on error
  switch (error.code) {
    case 'ISLAND_MODULES':
      description = `删除 ${error.affectedModuleIds.length} 个孤立模块`;
      break;
    case 'UNREACHABLE_OUTPUT':
      description = `断开 ${error.affectedModuleIds.length} 个无法到达的输出`;
      break;
    case 'CIRCUIT_INCOMPLETE':
      description = '添加默认连接或核心模块';
      break;
  }

  return {
    id: `quickfix-${error.code}-${error.affectedModuleIds[0] || 'unknown'}`,
    type: fixType,
    label: labels.label,
    description,
    icon: labels.icon,
    affectedIds: {
      moduleIds: error.affectedModuleIds,
      connectionIds: error.affectedConnectionIds,
    },
    isExecuting: false,
  };
}

// ============================================================================
// Pre-built Hook for Common Use Cases
// ============================================================================

/**
 * Simplified hook for checking if activation should be blocked
 * Round 113: Fixed to properly check for empty modules
 */
export function useActivationGate(): {
  canActivate: boolean;
  blockReason: string | null;
  validationResult: CircuitValidationResult | null;
} {
  const modules = useMachineStore((state) => state.modules);
  const { validationResult, isValid, errors } = useCircuitValidation();
  
  return useMemo(() => {
    // Round 113: Check for empty modules first
    if (modules.length === 0) {
      return {
        canActivate: false,
        blockReason: '请至少添加一个模块',
        validationResult,
      };
    }
    
    // If validation hasn't run yet, assume not valid (wait for debounce)
    if (!validationResult) {
      return {
        canActivate: false,
        blockReason: '正在验证电路...',
        validationResult,
      };
    }
    
    if (isValid) {
      return {
        canActivate: true,
        blockReason: null,
        validationResult,
      };
    }
    
    // Return the first blocking error message
    const blockReason = errors.length > 0
      ? errors[0].message
      : '电路验证失败';
    
    return {
      canActivate: false,
      blockReason,
      validationResult,
    };
  }, [modules.length, isValid, errors, validationResult]);
}

/**
 * Hook for getting validation overlay visibility
 * Automatically manages overlay based on validation state
 */
export function useValidationOverlay(): {
  visible: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  onDismiss: () => void;
  onProceedAnyway: (() => void) | null;
} {
  const { isOverlayVisible, errors, warnings, dismissOverlay } = useCircuitValidation();
  
  // Proceed anyway is only available for non-critical warnings
  const onProceedAnyway = useMemo(() => {
    // Only allow proceed anyway if there are no blocking errors
    const hasBlockingErrors = errors.some(e => 
      e.code === 'CIRCUIT_INCOMPLETE' || 
      e.code === 'UNREACHABLE_OUTPUT'
    );
    return hasBlockingErrors ? null : dismissOverlay;
  }, [errors, dismissOverlay]);
  
  return useMemo(() => ({
    visible: isOverlayVisible,
    errors,
    warnings,
    onDismiss: dismissOverlay,
    onProceedAnyway,
  }), [isOverlayVisible, errors, warnings, dismissOverlay, onProceedAnyway]);
}
