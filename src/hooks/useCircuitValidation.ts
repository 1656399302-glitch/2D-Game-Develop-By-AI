/**
 * Circuit Validation Hook
 * 
 * Round 112: Advanced Circuit Validation System
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
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for circuit validation state management
 * 
 * Provides real-time validation of the machine circuit,
 * automatically re-validating when modules or connections change.
 */
export function useCircuitValidation(): UseCircuitValidationResult {
  // Get state from machine store
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const machineState = useMachineStore((state) => state.machineState);
  
  // Local state for validation result and overlay visibility
  const [validationResult, setValidationResult] = useState<CircuitValidationResult | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  
  // Ref for debounce timeout
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastValidationRef = useRef<string>('');

  // Memoized validation function
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
    setValidationResult(result);
    
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
  ]);
}

// ============================================================================
// Pre-built Hook for Common Use Cases
// ============================================================================

/**
 * Simplified hook for checking if activation should be blocked
 */
export function useActivationGate(): {
  canActivate: boolean;
  blockReason: string | null;
  validationResult: CircuitValidationResult | null;
} {
  const { validationResult, isValid, errors } = useCircuitValidation();
  
  return useMemo(() => {
    if (isValid || !validationResult) {
      return {
        canActivate: true,
        blockReason: null,
        validationResult,
      };
    }
    
    // Return the first blocking error message
    const blockReason = errors.length > 0
      ? errors[0].message
      : 'Circuit validation failed';
    
    return {
      canActivate: false,
      blockReason,
      validationResult,
    };
  }, [isValid, errors, validationResult]);
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
