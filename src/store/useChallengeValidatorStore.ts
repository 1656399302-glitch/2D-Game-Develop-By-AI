/**
 * Challenge Validator Store
 * 
 * Round 160: Circuit Validation Framework
 * 
 * Zustand store for managing validation state with mutually exclusive
 * state transitions: idle → validating → passed | failed → idle
 * 
 * State Machine:
 * - idle: Initial state, ready for validation
 * - validating: Validation in progress
 * - passed: All objectives passed
 * - failed: One or more objectives failed
 * 
 * Transitions:
 * - idle → validating: startValidation()
 * - validating → passed: validation complete, all passed
 * - validating → failed: validation complete, some failed
 * - passed → idle: resetValidation() or circuit modified
 * - failed → idle: resetValidation() or circuit modified
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  ChallengeObjective,
  ValidationResult,
  PartialCreditResult,
  CircuitValidationData,
  ValidationOptions,
  ValidationStatus,
} from '../types/challenge';
import { validateCircuit, scoreCircuit } from '../utils/challengeValidator';

// ============================================================================
// Types
// ============================================================================

/**
 * Validation state type
 * States are mutually exclusive
 */
export type ValidatorState = 'idle' | 'validating' | 'passed' | 'failed';

/**
 * Objective status tracking
 */
export interface ObjectiveStatus {
  /** Objective ID */
  id: string;
  /** Current status */
  status: ValidationStatus;
  /** Progress message */
  message: string;
}

/**
 * Store state interface
 */
interface ChallengeValidatorState {
  /** Current validation state (mutually exclusive) */
  state: ValidatorState;
  
  /** Currently active challenge ID */
  activeChallengeId: string | null;
  
  /** Current circuit being validated */
  activeCircuitId: string | null;
  
  /** Current objectives being validated */
  objectives: ChallengeObjective[];
  
  /** Individual objective results */
  objectiveStatuses: ObjectiveStatus[];
  
  /** Last full validation result */
  lastValidationResult: ValidationResult | null;
  
  /** Last partial credit result */
  lastCreditResult: PartialCreditResult | null;
  
  /** Whether validation is in progress */
  isValidating: boolean;
  
  /** Error message if validation failed completely */
  error: string | null;
  
  /** Timestamp of last validation */
  lastValidatedAt: number | null;
  
  /** Circuit modification tracking (for clearing state on modification) */
  circuitModificationCount: number;
  
  // Actions
  startValidation: (
    challengeId: string,
    circuit: CircuitValidationData,
    objectives: ChallengeObjective[],
    options?: ValidationOptions
  ) => void;
  
  updateObjectiveStatus: (
    objectiveId: string,
    status: ValidationStatus,
    message: string
  ) => void;
  
  completeValidation: (result: ValidationResult) => void;
  
  failValidation: (error: string) => void;
  
  resetValidation: () => void;
  
  getObjectiveStatus: (objectiveId: string) => ObjectiveStatus | null;
  
  getOverallStatus: () => ValidatorState;
  
  setObjectives: (objectives: ChallengeObjective[]) => void;
  
  clearObjectives: () => void;
  
  trackCircuitModification: () => void;
  
  shouldClearOnModification: () => boolean;
  
  getValidationProgress: () => {
    total: number;
    completed: number;
    passed: number;
    failed: number;
  };
}

/**
 * Store actions interface
 */
interface ChallengeValidatorActions {
  startValidation: (
    challengeId: string,
    circuit: CircuitValidationData,
    objectives: ChallengeObjective[],
    options?: ValidationOptions
  ) => void;
  
  updateObjectiveStatus: (
    objectiveId: string,
    status: ValidationStatus,
    message: string
  ) => void;
  
  completeValidation: (result: ValidationResult) => void;
  
  failValidation: (error: string) => void;
  
  resetValidation: () => void;
  
  getObjectiveStatus: (objectiveId: string) => ObjectiveStatus | null;
  
  getOverallStatus: () => ValidatorState;
  
  setObjectives: (objectives: ChallengeObjective[]) => void;
  
  clearObjectives: () => void;
  
  trackCircuitModification: () => void;
  
  shouldClearOnModification: () => boolean;
  
  getValidationProgress: () => {
    total: number;
    completed: number;
    passed: number;
    failed: number;
  };
}

type ChallengeValidatorStore = ChallengeValidatorState & ChallengeValidatorActions;

// ============================================================================
// Initial State
// ============================================================================

/**
 * Initial objective status for empty state
 */
const createInitialObjectiveStatus = (): ObjectiveStatus[] => [];

/**
 * Default validation options
 */
const DEFAULT_OPTIONS: ValidationOptions = {
  includePartialCredit: true,
  passThreshold: 70,
  strictMode: false,
};

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * Challenge Validator Store
 * Manages validation state with mutually exclusive transitions
 */
export const useChallengeValidatorStore = create<ChallengeValidatorStore>()(
  subscribeWithSelector((set, get) => ({
    // ===== Initial State =====
    
    state: 'idle',
    activeChallengeId: null,
    activeCircuitId: null,
    objectives: [],
    objectiveStatuses: createInitialObjectiveStatus(),
    lastValidationResult: null,
    lastCreditResult: null,
    isValidating: false,
    error: null,
    lastValidatedAt: null,
    circuitModificationCount: 0,

    // ===== Actions =====
    
    /**
     * Start validation process
     * Transitions: idle → validating
     * 
     * @param challengeId - Challenge being validated
     * @param circuit - Circuit data to validate
     * @param objectives - Objectives to validate against
     * @param options - Validation options
     */
    startValidation: (
      challengeId: string,
      circuit: CircuitValidationData,
      objectives: ChallengeObjective[],
      options: ValidationOptions = DEFAULT_OPTIONS
    ) => {
      const currentState = get().state;
      
      // Can only start from idle state
      if (currentState !== 'idle') {
        console.warn('Cannot start validation - current state is not idle');
        return;
      }
      
      // Initialize objective statuses
      const initialStatuses: ObjectiveStatus[] = objectives.map((obj) => ({
        id: obj.id,
        status: 'validating' as ValidationStatus,
        message: 'Validating...',
      }));
      
      set({
        state: 'validating',
        activeChallengeId: challengeId,
        activeCircuitId: circuit.id,
        objectives,
        objectiveStatuses: initialStatuses,
        isValidating: true,
        error: null,
      });
      
      // Perform actual validation (synchronous for now)
      // In a real app, this might be async with progress updates
      try {
        const result = validateCircuit(objectives, circuit, options);
        
        // Update individual statuses
        const updatedStatuses: ObjectiveStatus[] = result.objectiveResults.map((res) => ({
          id: res.objectiveId,
          status: res.status,
          message: res.message,
        }));
        
        // Calculate partial credit if enabled
        let creditResult: PartialCreditResult | null = null;
        if (options.includePartialCredit) {
          creditResult = scoreCircuit(circuit, objectives, options);
        }
        
        set({
          objectiveStatuses: updatedStatuses,
          lastValidationResult: result,
          lastCreditResult: creditResult,
          isValidating: false,
          lastValidatedAt: Date.now(),
        });
        
        // Transition to final state
        if (result.isSuccess) {
          set({ state: 'passed' });
        } else {
          set({ state: 'failed' });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Validation failed';
        get().failValidation(errorMessage);
      }
    },
    
    /**
     * Update status for a specific objective
     * Used for real-time progress updates during validation
     */
    updateObjectiveStatus: (objectiveId: string, status: ValidationStatus, message: string) => {
      set((state) => {
        const index = state.objectiveStatuses.findIndex((s) => s.id === objectiveId);
        
        if (index === -1) {
          return state;
        }
        
        const updatedStatuses = [...state.objectiveStatuses];
        updatedStatuses[index] = { id: objectiveId, status, message };
        
        return { objectiveStatuses: updatedStatuses };
      });
    },
    
    /**
     * Complete validation with result
     * Transitions: validating → passed | failed
     */
    completeValidation: (result: ValidationResult) => {
      const currentState = get().state;
      
      // Can only complete if validating
      if (currentState !== 'validating') {
        console.warn('Cannot complete validation - not in validating state');
        return;
      }
      
      set({
        lastValidationResult: result,
        state: result.isSuccess ? 'passed' : 'failed',
        isValidating: false,
        lastValidatedAt: Date.now(),
      });
    },
    
    /**
     * Fail validation with error
     * Transitions: validating → failed
     */
    failValidation: (error: string) => {
      const currentState = get().state;
      
      // Can only fail if validating
      if (currentState !== 'validating') {
        console.warn('Cannot fail validation - not in validating state');
        return;
      }
      
      set({
        state: 'failed',
        error,
        isValidating: false,
        lastValidatedAt: Date.now(),
      });
    },
    
    /**
     * Reset validation state
     * Transitions: passed | failed → idle
     */
    resetValidation: () => {
      set({
        state: 'idle',
        activeChallengeId: null,
        activeCircuitId: null,
        objectives: [],
        objectiveStatuses: createInitialObjectiveStatus(),
        lastValidationResult: null,
        lastCreditResult: null,
        isValidating: false,
        error: null,
      });
    },
    
    /**
     * Get status for a specific objective
     */
    getObjectiveStatus: (objectiveId: string) => {
      const statuses = get().objectiveStatuses;
      return statuses.find((s) => s.id === objectiveId) || null;
    },
    
    /**
     * Get overall validation state
     */
    getOverallStatus: () => {
      return get().state;
    },
    
    /**
     * Set objectives for the current challenge
     */
    setObjectives: (objectives: ChallengeObjective[]) => {
      set({ objectives });
    },
    
    /**
     * Clear all objectives
     */
    clearObjectives: () => {
      set({
        objectives: [],
        objectiveStatuses: createInitialObjectiveStatus(),
      });
    },
    
    /**
     * Track that circuit has been modified
     * Increments modification count to trigger state clear
     */
    trackCircuitModification: () => {
      const currentState = get().state;
      
      set((state) => ({
        circuitModificationCount: state.circuitModificationCount + 1,
      }));
      
      // Auto-clear validation state if not idle
      if (currentState !== 'idle' && currentState !== 'validating') {
        get().resetValidation();
      }
    },
    
    /**
     * Check if validation state should be cleared due to circuit modification
     */
    shouldClearOnModification: () => {
      const { state } = get();
      return state !== 'idle' && state !== 'validating';
    },
    
    /**
     * Get validation progress statistics
     */
    getValidationProgress: () => {
      const statuses = get().objectiveStatuses;
      
      return {
        total: statuses.length,
        completed: statuses.filter((s) => s.status !== 'idle' && s.status !== 'validating').length,
        passed: statuses.filter((s) => s.status === 'passed').length,
        failed: statuses.filter((s) => s.status === 'failed').length,
      };
    },
  }))
);

// ============================================================================
// Selectors
// ============================================================================

/**
 * Select current validation state
 */
export const selectValidatorState = (state: ChallengeValidatorStore) => state.state;

/**
 * Select whether validation is in progress
 */
export const selectIsValidating = (state: ChallengeValidatorStore) => state.isValidating;

/**
 * Select active challenge ID
 */
export const selectActiveChallengeId = (state: ChallengeValidatorStore) => state.activeChallengeId;

/**
 * Select objective statuses
 */
export const selectObjectiveStatuses = (state: ChallengeValidatorStore) => state.objectiveStatuses;

/**
 * Select last validation result
 */
export const selectLastValidationResult = (state: ChallengeValidatorStore) => state.lastValidationResult;

/**
 * Select last partial credit result
 */
export const selectLastCreditResult = (state: ChallengeValidatorStore) => state.lastCreditResult;

/**
 * Select validation error
 */
export const selectValidationError = (state: ChallengeValidatorStore) => state.error;

/**
 * Select whether all objectives passed
 */
export const selectAllObjectivesPassed = (state: ChallengeValidatorStore) => state.state === 'passed';

/**
 * Select whether validation failed
 */
export const selectValidationFailed = (state: ChallengeValidatorStore) => state.state === 'failed';

/**
 * Select validation progress
 */
export const selectValidationProgress = (state: ChallengeValidatorStore) => state.getValidationProgress();

/**
 * Select last validated timestamp
 */
export const selectLastValidatedAt = (state: ChallengeValidatorStore) => state.lastValidatedAt;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if state machine is in valid state for transitions
 */
export function canTransitionTo(targetState: ValidatorState): boolean {
  const store = useChallengeValidatorStore.getState();
  const currentState = store.state;
  
  const validTransitions: Record<ValidatorState, ValidatorState[]> = {
    idle: ['validating'],
    validating: ['passed', 'failed'],
    passed: ['idle'],
    failed: ['idle'],
  };
  
  return validTransitions[currentState]?.includes(targetState) ?? false;
}

/**
 * Get status color for display
 */
export function getStatusColor(status: ValidationStatus): string {
  switch (status) {
    case 'idle':
      return '#6b7280'; // gray
    case 'validating':
      return '#f59e0b'; // yellow/amber
    case 'passed':
      return '#22c55e'; // green
    case 'failed':
      return '#ef4444'; // red
    case 'error':
      return '#dc2626'; // dark red
    default:
      return '#6b7280'; // gray
  }
}

/**
 * Get status icon for display
 */
export function getStatusIcon(status: ValidationStatus): string {
  switch (status) {
    case 'idle':
      return '○';
    case 'validating':
      return '◐';
    case 'passed':
      return '✓';
    case 'failed':
      return '✗';
    case 'error':
      return '!';
    default:
      return '○';
  }
}

// ============================================================================
// Export
// ============================================================================

export default useChallengeValidatorStore;
