/**
 * Challenge Validator Utility
 * 
 * Round 160: Circuit Validation Framework
 * 
 * This module provides functions for validating circuits against
 * challenge objectives, including output states, component counts,
 * and timing requirements with defined tolerances.
 */

import {
  ChallengeObjective,
  ValidationResult,
  PartialCreditResult,
  CircuitValidationData,
  ValidationOptions,
  ObjectiveValidationResult,
  OutputState,
  TimingRequirement,
  ClockPeriodRequirement,
  EdgeAlignmentRequirement,
  DelayConstraintRequirement,
  DEFAULT_TOLERANCES,
} from '../types/challenge';
import { SignalState } from '../types/circuit';

// ============================================================================
// Constants
// ============================================================================

/** Default pass threshold for partial credit (70%) */
const DEFAULT_PASS_THRESHOLD = 70;

/** Maximum retries for timing validation */
const MAX_TIMING_RETRIES = 3;

// ============================================================================
// Main Validation Functions
// ============================================================================

/**
 * Validate a circuit against a set of challenge objectives
 * 
 * @param objectives - Array of challenge objectives to validate
 * @param circuit - Circuit data for validation
 * @param options - Validation options
 * @returns Validation result with objective-level details
 * 
 * @example
 * ```typescript
 * const objectives = [
 *   {
 *     id: 'output-1',
 *     name: 'Output HIGH',
 *     description: 'Output must be HIGH',
 *     objectiveType: 'output',
 *     priority: 1,
 *     points: 100,
 *     outputTarget: { nodeId: 'out-1', name: 'LED1', expectedState: 'HIGH' }
 *   }
 * ];
 * 
 * const circuit = {
 *   id: 'circuit-1',
 *   components: [{ id: 'gate-1', type: 'AND', position: { x: 0, y: 0 } }],
 *   outputs: { 'out-1': true }
 * };
 * 
 * const result = validateCircuit(objectives, circuit);
 * // result.isSuccess === true if output matches
 * ```
 */
export function validateCircuit(
  objectives: ChallengeObjective[],
  circuit: CircuitValidationData | null | undefined,
  _options: ValidationOptions = {}
): ValidationResult {
  // Handle null/undefined circuit
  if (!circuit) {
    return createEmptyValidationResult('unknown', 'unknown');
  }

  // Handle empty objectives
  if (!objectives || objectives.length === 0) {
    return createValidValidationResult(circuit.id, []);
  }

  // Sort objectives by priority
  const sortedObjectives = [...objectives].sort((a, b) => a.priority - b.priority);

  // Validate each objective
  const objectiveResults: ObjectiveValidationResult[] = [];
  
  for (const objective of sortedObjectives) {
    const result = validateObjective(objective, circuit);
    objectiveResults.push(result);
  }

  // Calculate overall result
  const passedCount = objectiveResults.filter(r => r.passed).length;
  const totalPoints = objectiveResults.reduce((sum, r) => sum + r.pointsEarned, 0);
  const maxPoints = objectives.reduce((sum, o) => sum + o.points, 0);
  const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
  const isSuccess = passedCount === objectives.length;

  return {
    challengeId: circuit.id,
    circuitId: circuit.id,
    isSuccess,
    status: isSuccess ? 'passed' : 'failed',
    objectiveResults,
    totalPoints,
    maxPoints,
    score,
    validatedAt: Date.now(),
  };
}

/**
 * Score a circuit against challenge objectives
 * Returns partial credit information
 * 
 * @param circuit - Circuit data for validation
 * @param objectives - Array of challenge objectives
 * @param options - Scoring options
 * @returns Partial credit result
 */
export function scoreCircuit(
  circuit: CircuitValidationData | null | undefined,
  objectives: ChallengeObjective[],
  options: ValidationOptions = {}
): PartialCreditResult {
  const { passThreshold = DEFAULT_PASS_THRESHOLD, includePartialCredit = true } = options;

  // Handle null/undefined circuit
  if (!circuit) {
    return {
      challengeId: 'unknown',
      score: 0,
      pointsEarned: 0,
      maxPoints: 0,
      objectivesPassed: 0,
      totalObjectives: objectives.length,
      isComplete: false,
      breakdown: [],
    };
  }

  // Validate circuit
  const validationResult = validateCircuit(objectives, circuit, options);

  // Build breakdown
  const breakdown = objectives.map((obj, index) => {
    const result = validationResult.objectiveResults[index];
    return {
      objectiveId: obj.id,
      passed: result?.passed ?? false,
      pointsEarned: result?.pointsEarned ?? 0,
      pointsPossible: obj.points,
    };
  });

  return {
    challengeId: circuit.id,
    score: validationResult.score,
    pointsEarned: validationResult.totalPoints,
    maxPoints: validationResult.maxPoints,
    objectivesPassed: validationResult.objectiveResults.filter(r => r.passed).length,
    totalObjectives: objectives.length,
    isComplete: includePartialCredit ? validationResult.score >= passThreshold : validationResult.isSuccess,
    breakdown,
  };
}

// ============================================================================
// Individual Objective Validation
// ============================================================================

/**
 * Validate a single objective against circuit data
 */
function validateObjective(
  objective: ChallengeObjective,
  circuit: CircuitValidationData
): ObjectiveValidationResult {
  try {
    switch (objective.objectiveType) {
      case 'output':
        return validateOutputObjective(objective, circuit);
      case 'component_count':
        return validateComponentCountObjective(objective, circuit);
      case 'timing':
        return validateTimingObjective(objective, circuit);
      default:
        return createErrorResult(objective.id, `Unknown objective type: ${objective.objectiveType}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during validation';
    return createErrorResult(objective.id, errorMessage);
  }
}

// ============================================================================
// Output Validation (AC-160-001)
// ============================================================================

/**
 * Validate output state objective
 * Challenge can specify required output state (HIGH/LOW on specific outputs).
 * Validation returns pass when circuit produces correct output after simulation.
 */
function validateOutputObjective(
  objective: ChallengeObjective,
  circuit: CircuitValidationData
): ObjectiveValidationResult {
  // Validate circuit is not empty
  if (!circuit) {
    return createErrorResult(objective.id, 'Circuit is null or undefined');
  }

  // Get output target
  const outputTarget = objective.outputTarget;
  if (!outputTarget) {
    return createErrorResult(objective.id, 'Output target not defined');
  }

  const { nodeId, name, expectedState } = outputTarget;
  
  // Check if output exists in circuit
  const actualState = circuit.outputs[nodeId];
  
  // Handle undefined output
  if (actualState === undefined) {
    return {
      objectiveId: objective.id,
      status: 'failed',
      passed: false,
      message: `Output "${name}" (${nodeId}) is undefined or not present in circuit`,
      expectedValue: expectedState === 'HIGH' ? 1 : 0,
      actualValue: undefined,
      pointsEarned: 0,
      error: 'Output not found in circuit',
    };
  }

  // Convert boolean to OutputState
  const actualOutputState: OutputState = actualState ? 'HIGH' : 'LOW';
  
  // Check if states match
  const passed = actualOutputState === expectedState;
  
  return {
    objectiveId: objective.id,
    status: passed ? 'passed' : 'failed',
    passed,
    message: passed
      ? `Output "${name}" is ${actualOutputState} as expected`
      : `Output "${name}" is ${actualOutputState}, expected ${expectedState}`,
    actualValue: actualState ? 1 : 0,
    expectedValue: expectedState === 'HIGH' ? 1 : 0,
    pointsEarned: passed ? objective.points : 0,
  };
}

// ============================================================================
// Component Count Validation (AC-160-002)
// ============================================================================

/**
 * Validate component count objective
 * Challenge can specify maximum component count.
 * Validation returns pass when circuit uses ≤ specified components.
 */
function validateComponentCountObjective(
  objective: ChallengeObjective,
  circuit: CircuitValidationData
): ObjectiveValidationResult {
  // Validate circuit is not null/undefined
  if (!circuit) {
    return createErrorResult(objective.id, 'Circuit is null or undefined');
  }

  // Get component constraint
  const constraint = objective.componentConstraint;
  if (!constraint) {
    return createErrorResult(objective.id, 'Component constraint not defined');
  }

  // Handle undefined component list
  if (!circuit.components) {
    return createErrorResult(objective.id, 'Circuit components are undefined');
  }

  const { maxComponents, includeWires = false } = constraint;
  
  // Calculate component count
  let actualCount = circuit.components.length;
  
  // Include wires if specified
  if (includeWires && circuit.wireCount !== undefined) {
    actualCount += circuit.wireCount;
  }
  
  // Check if count is within limit
  const passed = actualCount <= maxComponents;
  
  return {
    objectiveId: objective.id,
    status: passed ? 'passed' : 'failed',
    passed,
    message: passed
      ? `Component count (${actualCount}) is within limit of ${maxComponents}`
      : `Component count (${actualCount}) exceeds limit of ${maxComponents}`,
    actualValue: actualCount,
    expectedValue: maxComponents,
    pointsEarned: passed ? objective.points : 0,
  };
}

// ============================================================================
// Timing Validation (AC-160-003)
// ============================================================================

/**
 * Validate timing requirements objective
 * Challenge can specify signal timing requirements with defined tolerances:
 * - Clock period tolerance: ±2 units
 * - Edge alignment tolerance: ±1 unit
 * - Delay constraint tolerance: ±1 unit
 */
function validateTimingObjective(
  objective: ChallengeObjective,
  circuit: CircuitValidationData
): ObjectiveValidationResult {
  // Validate circuit is not null/undefined
  if (!circuit) {
    return createErrorResult(objective.id, 'Circuit is null or undefined');
  }

  // Get timing requirements
  const requirements = objective.timingRequirements;
  if (!requirements || requirements.length === 0) {
    return createErrorResult(objective.id, 'No timing requirements defined');
  }

  // Check if signal traces exist
  const traces = circuit.signalTraces;
  if (!traces || traces.length === 0) {
    return {
      objectiveId: objective.id,
      status: 'failed',
      passed: false,
      message: 'No signal trace data available for timing validation',
      pointsEarned: 0,
      error: 'Missing signal trace data',
    };
  }

  // Validate each timing requirement
  const results: Array<{ type: string; passed: boolean; message: string }> = [];
  
  for (const requirement of requirements) {
    const result = validateTimingRequirement(requirement, traces);
    results.push(result);
  }

  // Overall result: all requirements must pass
  const allPassed = results.every(r => r.passed);
  const passedCount = results.filter(r => r.passed).length;
  
  const message = allPassed
    ? `All ${results.length} timing requirements met`
    : `${passedCount}/${results.length} timing requirements met: ${results.filter(r => !r.passed).map(r => r.message).join('; ')}`;

  return {
    objectiveId: objective.id,
    status: allPassed ? 'passed' : 'failed',
    passed: allPassed,
    message,
    pointsEarned: allPassed ? objective.points : 0,
  };
}

/**
 * Validate a single timing requirement
 * Clock period tolerance: ±2 units
 * Edge alignment tolerance: ±1 unit
 * Delay constraint tolerance: ±1 unit
 */
function validateTimingRequirement(
  requirement: TimingRequirement,
  traces: Array<{ step: number; signals: Record<string, boolean> }>
): { type: string; passed: boolean; message: string } {
  switch (requirement.type) {
    case 'clock_period':
      return validateClockPeriod(requirement, traces);
    case 'edge_alignment':
      return validateEdgeAlignment(requirement, traces);
    case 'delay_constraint':
      return validateDelayConstraint(requirement, traces);
    default:
      return { type: 'unknown', passed: false, message: 'Unknown timing requirement type' };
  }
}

/**
 * Validate clock period requirement
 * Tolerance: ±2 units
 */
function validateClockPeriod(
  requirement: ClockPeriodRequirement,
  traces: Array<{ step: number; signals: Record<string, boolean> }>
): { type: string; passed: boolean; message: string } {
  const { expectedPeriod, tolerance, clockSignalId } = requirement;
  
  // Use default tolerance if not specified (2 units for clock period)
  const effectiveTolerance = tolerance ?? DEFAULT_TOLERANCES.clock_period;
  
  // Extract signal history for the clock
  const signalHistory = traces.map(t => t.signals[clockSignalId] ?? false);
  
  // Handle empty signal trace
  if (signalHistory.length === 0) {
    return {
      type: 'clock_period',
      passed: false,
      message: `Signal trace is empty for clock "${clockSignalId}"`,
    };
  }
  
  // Detect transitions
  const transitions = findTransitions(signalHistory);
  
  // Clock needs at least 2 transitions (one full period)
  if (transitions.length < 2) {
    return {
      type: 'clock_period',
      passed: false,
      message: `Clock signal "${clockSignalId}" has insufficient transitions for period measurement`,
    };
  }
  
  // Calculate actual period from first two rising edges
  const risingEdges = transitions.filter(t => t.toState === true);
  
  if (risingEdges.length < 2) {
    return {
      type: 'clock_period',
      passed: false,
      message: `Clock signal "${clockSignalId}" does not have a complete cycle`,
    };
  }
  
  const actualPeriod = risingEdges[1].step - risingEdges[0].step;
  const difference = Math.abs(actualPeriod - expectedPeriod);
  
  // Check if within tolerance
  const passed = difference <= effectiveTolerance;
  
  return {
    type: 'clock_period',
    passed,
    message: passed
      ? `Clock period ${actualPeriod} is within ±${effectiveTolerance} of expected ${expectedPeriod}`
      : `Clock period ${actualPeriod} exceeds ±${effectiveTolerance} tolerance (expected ${expectedPeriod})`,
  };
}

/**
 * Validate edge alignment requirement
 * Tolerance: ±1 unit
 */
function validateEdgeAlignment(
  requirement: EdgeAlignmentRequirement,
  traces: Array<{ step: number; signals: Record<string, boolean> }>
): { type: string; passed: boolean; message: string } {
  const { signalId, tolerance, referenceClockId } = requirement;
  
  // Use default tolerance if not specified (1 unit for edge alignment)
  const effectiveTolerance = tolerance ?? DEFAULT_TOLERANCES.edge_alignment;
  
  // Extract signal histories
  const signalHistory = traces.map(t => t.signals[signalId] ?? false);
  const clockHistory = traces.map(t => t.signals[referenceClockId] ?? false);
  
  // Handle empty signal trace
  if (signalHistory.length === 0) {
    return {
      type: 'edge_alignment',
      passed: false,
      message: `Signal trace is empty for "${signalId}"`,
    };
  }
  
  if (clockHistory.length === 0) {
    return {
      type: 'edge_alignment',
      passed: false,
      message: `Clock signal trace is empty for "${referenceClockId}"`,
    };
  }
  
  // Detect clock edges
  const clockTransitions = findTransitions(clockHistory);
  const clockEdges = clockTransitions.map(t => t.step);
  
  // Detect signal transitions
  const signalTransitions = findTransitions(signalHistory);
  
  // Check that all signal transitions align with clock edges
  const misalignedTransitions: number[] = [];
  
  for (const transition of signalTransitions) {
    const aligned = clockEdges.some(
      clockEdge => Math.abs(transition.step - clockEdge) <= effectiveTolerance
    );
    
    if (!aligned) {
      misalignedTransitions.push(transition.step);
    }
  }
  
  const passed = misalignedTransitions.length === 0;
  
  return {
    type: 'edge_alignment',
    passed,
    message: passed
      ? `All signal transitions align with clock edges within ±${effectiveTolerance} units`
      : `Signal has ${misalignedTransitions.length} misaligned transitions at steps: ${misalignedTransitions.join(', ')}`,
  };
}

/**
 * Validate delay constraint requirement
 * Tolerance: ±1 unit
 */
function validateDelayConstraint(
  requirement: DelayConstraintRequirement,
  traces: Array<{ step: number; signals: Record<string, boolean> }>
): { type: string; passed: boolean; message: string } {
  const { maxDelay, tolerance, signalId } = requirement;
  
  // Use default tolerance if not specified (1 unit for delay)
  const effectiveTolerance = tolerance ?? DEFAULT_TOLERANCES.delay_constraint;
  
  // Extract signal history
  const signalHistory = traces.map(t => t.signals[signalId] ?? false);
  
  // Handle empty signal trace
  if (signalHistory.length === 0) {
    return {
      type: 'delay_constraint',
      passed: false,
      message: `Signal trace is empty for "${signalId}"`,
    };
  }
  
  // Find first transition (rising edge)
  const transitions = findTransitions(signalHistory);
  
  if (transitions.length === 0) {
    return {
      type: 'delay_constraint',
      passed: false,
      message: `Signal "${signalId}" has no transitions`,
    };
  }
  
  // Get first rising edge step
  const firstRisingEdge = transitions.find(t => t.toState === true);
  
  if (!firstRisingEdge) {
    return {
      type: 'delay_constraint',
      passed: false,
      message: `Signal "${signalId}" has no rising edge`,
    };
  }
  
  const actualDelay = firstRisingEdge.step;
  const difference = Math.abs(actualDelay - maxDelay);
  
  // Check if within tolerance
  const passed = difference <= effectiveTolerance;
  
  return {
    type: 'delay_constraint',
    passed,
    message: passed
      ? `Signal delay ${actualDelay} is within ±${effectiveTolerance} of maximum ${maxDelay}`
      : `Signal delay ${actualDelay} exceeds ±${effectiveTolerance} tolerance (maximum ${maxDelay})`,
  };
}

// ============================================================================
// Signal Analysis Utilities
// ============================================================================

/**
 * Find all transitions in a signal history
 */
function findTransitions(signalHistory: SignalState[]): Array<{
  step: number;
  fromState: SignalState;
  toState: SignalState;
}> {
  const transitions: Array<{
    step: number;
    fromState: SignalState;
    toState: SignalState;
  }> = [];
  
  for (let i = 1; i < signalHistory.length; i++) {
    if (signalHistory[i] !== signalHistory[i - 1]) {
      transitions.push({
        step: i,
        fromState: signalHistory[i - 1],
        toState: signalHistory[i],
      });
    }
  }
  
  return transitions;
}

// ============================================================================
// Result Factory Functions
// ============================================================================

/**
 * Create an error result for a single objective
 */
function createErrorResult(objectiveId: string, error: string): ObjectiveValidationResult {
  return {
    objectiveId,
    status: 'error',
    passed: false,
    message: `Validation error: ${error}`,
    pointsEarned: 0,
    error,
  };
}

/**
 * Create an empty validation result for null circuit
 */
function createEmptyValidationResult(challengeId: string, circuitId: string): ValidationResult {
  return {
    challengeId,
    circuitId,
    isSuccess: false,
    status: 'failed',
    objectiveResults: [],
    totalPoints: 0,
    maxPoints: 0,
    score: 0,
    validatedAt: Date.now(),
    error: 'Circuit is null or undefined',
  };
}

/**
 * Create a valid result for empty objectives
 */
function createValidValidationResult(circuitId: string, objectives: ChallengeObjective[]): ValidationResult {
  return {
    challengeId: circuitId,
    circuitId: circuitId,
    isSuccess: true,
    status: 'passed',
    objectiveResults: [],
    totalPoints: objectives.reduce((sum, o) => sum + o.points, 0),
    maxPoints: objectives.reduce((sum, o) => sum + o.points, 0),
    score: 100,
    validatedAt: Date.now(),
  };
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if a value is within tolerance of expected
 * @param actual - Actual value
 * @param expected - Expected value
 * @param tolerance - Tolerance (positive number)
 * @returns Whether actual is within tolerance of expected
 */
export function isWithinTolerance(actual: number, expected: number, tolerance: number): boolean {
  return Math.abs(actual - expected) <= tolerance;
}

/**
 * Calculate clock period from signal history
 * @param signalHistory - Array of signal states
 * @returns Period in time units, or null if cannot be determined
 */
export function calculateClockPeriod(signalHistory: SignalState[]): number | null {
  const transitions = findTransitions(signalHistory);
  const risingEdges = transitions.filter(t => t.toState === true);
  
  if (risingEdges.length < 2) {
    return null;
  }
  
  return risingEdges[1].step - risingEdges[0].step;
}

/**
 * Check if signal transitions align with reference clock edges
 * @param signalHistory - Signal to check
 * @param clockEdges - Array of clock edge steps
 * @param tolerance - Tolerance in units
 * @returns Whether all transitions align
 */
export function checkTransitionAlignment(
  signalHistory: SignalState[],
  clockEdges: number[],
  tolerance: number = 1
): boolean {
  const transitions = findTransitions(signalHistory);
  
  return transitions.every(transition =>
    clockEdges.some(edge => Math.abs(transition.step - edge) <= tolerance)
  );
}

/**
 * Calculate signal delay from source to first transition
 * @param signalHistory - Signal states over time
 * @returns Delay in time units, or null if no transition
 */
export function calculateSignalDelay(signalHistory: SignalState[]): number | null {
  const transitions = findTransitions(signalHistory);
  
  if (transitions.length === 0) {
    return null;
  }
  
  return transitions[0].step;
}

// ============================================================================
// Export
// ============================================================================

export default {
  validateCircuit,
  scoreCircuit,
  isWithinTolerance,
  calculateClockPeriod,
  checkTransitionAlignment,
  calculateSignalDelay,
  DEFAULT_PASS_THRESHOLD,
  MAX_TIMING_RETRIES,
};
