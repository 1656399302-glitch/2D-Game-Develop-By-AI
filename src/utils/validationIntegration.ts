/**
 * Validation Integration Utilities
 * 
 * Round 113: Circuit Validation UI Integration
 * 
 * Utility functions for integrating validation with activation flow
 * and other editor systems.
 */

import { useMachineStore } from '../store/useMachineStore';
import { validateCircuit } from './circuitValidator';
import { ValidationErrorType } from '../types/circuitValidation';

// ============================================================================
// Types
// ============================================================================

/**
 * Activation gate result with detailed blocking information
 */
export interface ActivationGateResult {
  /** Whether activation is allowed */
  canActivate: boolean;
  /** Reason for blocking (if blocked) */
  blockReason: string | null;
  /** Error code causing the block (if any) */
  blockErrorCode: ValidationErrorType | null;
  /** Module IDs affected by validation errors */
  affectedModuleIds: string[];
}

/**
 * Quick fix suggestion for a validation error
 */
export interface QuickFixSuggestion {
  /** Action ID */
  actionId: string;
  /** Human-readable label */
  label: string;
  /** Icon for the action */
  icon: string;
  /** Whether this action can be auto-applied */
  autoApplicable: boolean;
  /** Function to apply the fix */
  apply: () => void | Promise<void>;
}

/**
 * Validation status summary
 */
export interface ValidationStatusSummary {
  /** Overall status */
  status: 'valid' | 'warning' | 'error' | 'empty';
  /** Number of errors */
  errorCount: number;
  /** Number of warnings */
  warningCount: number;
  /** Primary error message (if any) */
  primaryErrorMessage: string | null;
  /** Primary error code (if any) */
  primaryErrorCode: ValidationErrorType | null;
  /** Whether the circuit can be activated */
  canActivate: boolean;
}

// ============================================================================
// Activation Gate Functions
// ============================================================================

/**
 * Get the activation gate status synchronously
 * Used for UI components that need immediate feedback
 */
export function getActivationGate(): ActivationGateResult {
  const modules = useMachineStore.getState().modules;
  const connections = useMachineStore.getState().connections;
  
  // No modules = cannot activate
  if (modules.length === 0) {
    return {
      canActivate: false,
      blockReason: '请至少添加一个模块',
      blockErrorCode: null,
      affectedModuleIds: [],
    };
  }

  const result = validateCircuit(modules, connections);

  if (result.isValid) {
    return {
      canActivate: true,
      blockReason: null,
      blockErrorCode: null,
      affectedModuleIds: [],
    };
  }

  // Find the first blocking error
  const blockingError = result.errors[0];
  return {
    canActivate: false,
    blockReason: blockingError?.message || '电路验证失败',
    blockErrorCode: blockingError?.code || null,
    affectedModuleIds: blockingError?.affectedModuleIds || [],
  };
}

/**
 * Check if the activation button should be disabled
 * This is the function used in the UI
 */
export function isActivationBlocked(): boolean {
  const gate = getActivationGate();
  return !gate.canActivate;
}

/**
 * Get the CSS classes for a disabled activation button
 */
export function getActivationButtonDisabledClasses(): string {
  return 'opacity-50 cursor-not-allowed disabled';
}

/**
 * Check if the button should show a warning state
 */
export function shouldShowActivationWarning(): boolean {
  const gate = getActivationGate();
  // Show warning if blocked but has warnings instead of errors
  return !gate.canActivate && gate.blockReason?.includes('警告') === false;
}

// ============================================================================
// Quick Fix Functions
// ============================================================================

/**
 * Get quick fix suggestions for a specific module
 */
export function getQuickFixSuggestions(moduleId: string): QuickFixSuggestion[] {
  const modules = useMachineStore.getState().modules;
  const connections = useMachineStore.getState().connections;
  const addModule = useMachineStore.getState().addModule;
  const completeConnection = useMachineStore.getState().completeConnection;
  const removeConnection = useMachineStore.getState().removeConnection;
  const removeModule = useMachineStore.getState().removeModule;

  const result = validateCircuit(modules, connections);

  const suggestions: QuickFixSuggestion[] = [];
  const module = modules.find((m) => m.instanceId === moduleId);
  
  if (!module) return suggestions;

  // Find errors affecting this module
  const affectedErrors = result.errors.filter((e) =>
    e.affectedModuleIds.includes(moduleId)
  );

  for (const error of affectedErrors) {
    switch (error.code) {
      case 'ISLAND_MODULES': {
        // Suggest connecting to another module
        const compatibleTargets = modules.filter((m) => {
          if (m.instanceId === moduleId) return false;
          const hasInput = m.ports.some((p) => p.type === 'input');
          const notConnected = !connections.some(
            (c) => c.sourceModuleId === moduleId && c.targetModuleId === m.instanceId
          );
          return hasInput && notConnected;
        });

        if (compatibleTargets.length > 0) {
          const target = compatibleTargets[0];
          const targetInput = target.ports.find((p) => p.type === 'input');
          
          if (targetInput) {
            suggestions.push({
              actionId: 'connect-to-module',
              label: `连接到 ${target.type}`,
              icon: '🔗',
              autoApplicable: true,
              apply: () => {
                completeConnection(target.instanceId, targetInput.id);
              },
            });
          }
        }

        // Suggest deleting the module
        suggestions.push({
          actionId: 'delete-module',
          label: '删除孤立模块',
          icon: '🗑️',
          autoApplicable: true,
          apply: () => {
            removeModule(moduleId);
          },
        });
        break;
      }

      case 'LOOP_DETECTED': {
        // Suggest removing the cycle connection
        if (error.affectedConnectionIds && error.affectedConnectionIds.length > 0) {
          suggestions.push({
            actionId: 'remove-cycle',
            label: '移除循环连接',
            icon: '✂️',
            autoApplicable: true,
            apply: () => {
              removeConnection(error.affectedConnectionIds![0]);
            },
          });
        }
        break;
      }

      case 'UNREACHABLE_OUTPUT': {
        // Suggest adding a core module
        suggestions.push({
          actionId: 'add-core',
          label: '添加核心炉心',
          icon: '🔥',
          autoApplicable: true,
          apply: () => {
            addModule('core-furnace', module.x + 100, module.y);
          },
        });
        break;
      }

      case 'CIRCUIT_INCOMPLETE': {
        suggestions.push({
          actionId: 'add-core',
          label: '添加核心炉心',
          icon: '🔥',
          autoApplicable: true,
          apply: () => {
            addModule('core-furnace', 400, 300);
          },
        });
        break;
      }
    }
  }

  return suggestions;
}

// ============================================================================
// Validation Status Functions
// ============================================================================

/**
 * Get a summary of the current validation status
 */
export function getValidationStatusSummary(): ValidationStatusSummary {
  const modules = useMachineStore.getState().modules;
  const connections = useMachineStore.getState().connections;

  if (modules.length === 0) {
    return {
      status: 'empty',
      errorCount: 0,
      warningCount: 0,
      primaryErrorMessage: null,
      primaryErrorCode: null,
      canActivate: false,
    };
  }

  const result = validateCircuit(modules, connections);

  const primaryError = result.errors[0];

  let status: ValidationStatusSummary['status'];
  if (result.isValid && result.warnings.length > 0) {
    status = 'warning';
  } else if (result.isValid) {
    status = 'valid';
  } else {
    status = 'error';
  }

  return {
    status,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
    primaryErrorMessage: primaryError?.message || null,
    primaryErrorCode: primaryError?.code || null,
    canActivate: result.isValid,
  };
}

/**
 * Get status text for display in the UI
 */
export function getValidationStatusText(): string {
  const summary = getValidationStatusSummary();

  switch (summary.status) {
    case 'empty':
      return '等待添加模块';
    case 'valid':
      return '✓ 电路正常';
    case 'warning':
      return `⚠ ${summary.warningCount} 个警告`;
    case 'error':
      return `⚠ ${summary.errorCount} 个问题`;
  }
}

// ============================================================================
// Connection Suggestion Functions
// ============================================================================

/**
 * Find suggested connection targets for an isolated module
 */
export function findConnectionSuggestions(moduleId: string): Array<{
  targetModuleId: string;
  targetModuleType: string;
  sourcePortId: string;
  targetPortId: string;
  priority: number;
}> {
  const modules = useMachineStore.getState().modules;
  const connections = useMachineStore.getState().connections;

  const module = modules.find((m) => m.instanceId === moduleId);
  if (!module) return [];

  const suggestions: Array<{
    targetModuleId: string;
    targetModuleType: string;
    sourcePortId: string;
    targetPortId: string;
    priority: number;
  }> = [];

  // For modules with output ports, suggest connecting to modules with input ports
  const outputPorts = module.ports.filter((p) => p.type === 'output');

  // Find targets for output ports
  for (const outputPort of outputPorts) {
    for (const targetModule of modules) {
      if (targetModule.instanceId === moduleId) continue;

      // Check if already connected
      const alreadyConnected = connections.some(
        (c) =>
          c.sourceModuleId === moduleId &&
          c.targetModuleId === targetModule.instanceId
      );
      if (alreadyConnected) continue;

      // Find available input port
      const targetInput = targetModule.ports.find((p) => p.type === 'input');
      if (!targetInput) continue;

      // Calculate priority based on module type
      let priority = 1;
      if (targetModule.type === 'output-array') priority = 3;
      else if (targetModule.type === 'core-furnace') priority = 2;

      suggestions.push({
        targetModuleId: targetModule.instanceId,
        targetModuleType: targetModule.type,
        sourcePortId: outputPort.id,
        targetPortId: targetInput.id,
        priority,
      });
    }
  }

  // Sort by priority (highest first)
  suggestions.sort((a, b) => b.priority - a.priority);

  return suggestions;
}

// ============================================================================
// Export Default
// ============================================================================

export default {
  getActivationGate,
  isActivationBlocked,
  getActivationButtonDisabledClasses,
  shouldShowActivationWarning,
  getQuickFixSuggestions,
  getValidationStatusSummary,
  getValidationStatusText,
  findConnectionSuggestions,
};
