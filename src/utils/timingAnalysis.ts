/**
 * Timing Analysis Utilities
 * 
 * Round 171: Circuit Timing Visualization Enhancement
 * 
 * Utility functions for cursor-based timing measurements,
 * signal frequency calculation, and duty cycle analysis.
 */

import { SignalState } from '../types/circuit';
import { SignalTraceEntry } from '../store/signalTraceStore';

// ============================================================================
// Types
// ============================================================================

/**
 * Cursor position in the timing diagram
 */
export interface CursorPosition {
  /** Cursor identifier (A or B) */
  id: 'A' | 'B';
  /** Step index where cursor is positioned */
  step: number;
  /** X position in pixels (calculated) */
  xPosition: number;
}

/**
 * Timing measurement between two cursors
 */
export interface TimingMeasurement {
  /** Time delta between cursors in steps */
  timeDelta: number;
  /** Time delta in nanoseconds (assuming 1 step = 1ns) */
  timeDeltaNs: number;
  /** Cursor A position */
  cursorA: CursorPosition;
  /** Cursor B position */
  cursorB: CursorPosition;
}

/**
 * Signal statistics for a signal trace
 */
export interface SignalStatistics {
  /** Signal name */
  name: string;
  /** Minimum pulse width (in steps) */
  minPulseWidth: number;
  /** Maximum pulse width (in steps) */
  maxPulseWidth: number;
  /** Average pulse width (in steps) */
  avgPulseWidth: number;
  /** Number of transitions */
  transitionCount: number;
  /** Total HIGH time */
  highTime: number;
  /** Total LOW time */
  lowTime: number;
  /** Total trace time */
  totalTime: number;
}

/**
 * Signal frequency analysis result
 */
export interface FrequencyAnalysis {
  /** Whether the signal is periodic */
  isPeriodic: boolean;
  /** Frequency in Hz (1/period), or null if not periodic */
  frequency: number | null;
  /** Period in steps */
  period: number | null;
  /** Duty cycle (0-1) */
  dutyCycle: number;
  /** Duty cycle as percentage string */
  dutyCyclePercent: string;
  /** Reason for N/A if not periodic */
  reason?: string;
}

/**
 * CSV export row for timing data
 */
export interface TimingCSVRow {
  /** Signal name */
  signal: string;
  /** Timestamp (step index) */
  timestamp: number;
  /** Signal value (HIGH/LOW) */
  value: string;
  /** Optional annotation */
  annotation: string;
}

// ============================================================================
// Constants
// ============================================================================

/** Time scale: pixels per step */
export const DEFAULT_TIME_SCALE = 30;

/** Left margin for timing diagram */
export const DEFAULT_LEFT_MARGIN = 80;

/** Nanoseconds per step (assuming 1 step = 1ns) */
export const TIME_STEP_NS = 1;

/** Minimum transitions for frequency calculation */
export const MIN_TRANSITIONS_FOR_FREQUENCY = 4;

// ============================================================================
// Cursor Position Functions
// ============================================================================

/**
 * Calculate X position for a given step
 * @param step - Step index
 * @param timeScale - Pixels per step (default: 30)
 * @param leftMargin - Left margin offset (default: 80)
 * @returns X position in pixels
 */
export function calculateXPosition(
  step: number,
  timeScale: number = DEFAULT_TIME_SCALE,
  leftMargin: number = DEFAULT_LEFT_MARGIN
): number {
  return leftMargin + step * timeScale;
}

/**
 * Calculate step index from X position
 * @param xPosition - X position in pixels
 * @param timeScale - Pixels per step (default: 30)
 * @param leftMargin - Left margin offset (default: 80)
 * @returns Step index (clamped to valid range)
 */
export function calculateStepFromXPosition(
  xPosition: number,
  timeScale: number = DEFAULT_TIME_SCALE,
  leftMargin: number = DEFAULT_LEFT_MARGIN,
  maxStep: number = 100
): number {
  const rawStep = Math.round((xPosition - leftMargin) / timeScale);
  return Math.max(0, Math.min(rawStep, maxStep));
}

/**
 * Create a cursor position
 * @param id - Cursor identifier (A or B)
 * @param step - Step index
 * @param timeScale - Pixels per step
 * @param leftMargin - Left margin offset
 * @returns CursorPosition object
 */
export function createCursor(
  id: 'A' | 'B',
  step: number,
  timeScale: number = DEFAULT_TIME_SCALE,
  leftMargin: number = DEFAULT_LEFT_MARGIN
): CursorPosition {
  return {
    id,
    step,
    xPosition: calculateXPosition(step, timeScale, leftMargin),
  };
}

// ============================================================================
// Timing Measurement Functions
// ============================================================================

/**
 * Calculate timing measurement between two cursor positions
 * @param cursorA - First cursor position
 * @param cursorB - Second cursor position
 * @returns TimingMeasurement object
 */
export function calculateTimeDelta(
  cursorA: CursorPosition,
  cursorB: CursorPosition
): TimingMeasurement {
  const timeDelta = Math.abs(cursorB.step - cursorA.step);
  const timeDeltaNs = timeDelta * TIME_STEP_NS;
  
  return {
    timeDelta,
    timeDeltaNs,
    cursorA,
    cursorB,
  };
}

/**
 * Format time delta as human-readable string
 * @param timeDelta - Time delta in steps
 * @param showNs - Whether to show nanoseconds
 * @returns Formatted string
 */
export function formatTimeDelta(timeDelta: number, showNs: boolean = true): string {
  if (showNs) {
    return `${timeDelta * TIME_STEP_NS} ns`;
  }
  return `${timeDelta} steps`;
}

// ============================================================================
// Signal Statistics Functions
// ============================================================================

/**
 * Find all transitions in a signal history
 * @param signalHistory - Array of signal states over time
 * @returns Array of transition step indices
 */
export function findTransitions(signalHistory: SignalState[]): number[] {
  const transitions: number[] = [];
  
  for (let i = 1; i < signalHistory.length; i++) {
    if (signalHistory[i] !== signalHistory[i - 1]) {
      transitions.push(i);
    }
  }
  
  return transitions;
}

/**
 * Calculate signal statistics
 * @param signalHistory - Array of signal states over time
 * @param signalName - Name of the signal
 * @returns SignalStatistics object
 */
export function calculateSignalStatistics(
  signalHistory: SignalState[],
  signalName: string
): SignalStatistics {
  if (signalHistory.length === 0) {
    return {
      name: signalName,
      minPulseWidth: 0,
      maxPulseWidth: 0,
      avgPulseWidth: 0,
      transitionCount: 0,
      highTime: 0,
      lowTime: 0,
      totalTime: 0,
    };
  }
  
  const transitions = findTransitions(signalHistory);
  const transitionCount = transitions.length;
  
  // Calculate HIGH and LOW times
  let highTime = 0;
  let lowTime = 0;
  
  for (let i = 0; i < signalHistory.length; i++) {
    if (signalHistory[i]) {
      highTime++;
    } else {
      lowTime++;
    }
  }
  
  // Calculate pulse widths
  const pulseWidths: number[] = [];
  
  if (transitions.length === 0) {
    // No transitions - entire signal is one pulse
    pulseWidths.push(signalHistory.length);
  } else {
    // First segment from start to first transition
    pulseWidths.push(transitions[0]);
    
    // Middle segments between transitions
    for (let i = 0; i < transitions.length - 1; i++) {
      pulseWidths.push(transitions[i + 1] - transitions[i]);
    }
    
    // Last segment from last transition to end
    pulseWidths.push(signalHistory.length - transitions[transitions.length - 1]);
  }
  
  const minPulseWidth = pulseWidths.length > 0 ? Math.min(...pulseWidths) : 0;
  const maxPulseWidth = pulseWidths.length > 0 ? Math.max(...pulseWidths) : 0;
  const avgPulseWidth = pulseWidths.length > 0
    ? pulseWidths.reduce((a, b) => a + b, 0) / pulseWidths.length
    : 0;
  
  return {
    name: signalName,
    minPulseWidth,
    maxPulseWidth,
    avgPulseWidth,
    transitionCount,
    highTime,
    lowTime,
    totalTime: signalHistory.length,
  };
}

// ============================================================================
// Frequency Calculation Functions
// ============================================================================

/**
 * Calculate frequency and duty cycle for a signal
 * @param signalHistory - Array of signal states over time
 * @param signalName - Name of the signal
 * @returns FrequencyAnalysis object
 */
export function calculateFrequency(
  signalHistory: SignalState[],
  signalName: string
): FrequencyAnalysis {
  // Check minimum transitions
  const transitions = findTransitions(signalHistory);
  
  if (transitions.length < MIN_TRANSITIONS_FOR_FREQUENCY) {
    return {
      isPeriodic: false,
      frequency: null,
      period: null,
      dutyCycle: 0,
      dutyCyclePercent: 'N/A',
      reason: `Insufficient transitions (${transitions.length} < ${MIN_TRANSITIONS_FOR_FREQUENCY})`,
    };
  }
  
  // Check if signal is periodic by measuring period consistency
  const periods: number[] = [];
  for (let i = 0; i < transitions.length - 1; i++) {
    periods.push(transitions[i + 1] - transitions[i]);
  }
  
  // Check if periods are consistent (within 1 step tolerance)
  const avgPeriod = periods.reduce((a, b) => a + b, 0) / periods.length;
  const isConsistent = periods.every((p) => Math.abs(p - avgPeriod) <= 1);
  
  if (!isConsistent) {
    return {
      isPeriodic: false,
      frequency: null,
      period: null,
      dutyCycle: 0,
      dutyCyclePercent: 'N/A',
      reason: 'Non-periodic signal (inconsistent periods)',
    };
  }
  
  // Calculate duty cycle
  const stats = calculateSignalStatistics(signalHistory, signalName);
  const dutyCycle = stats.totalTime > 0 ? stats.highTime / stats.totalTime : 0;
  
  // Calculate frequency (assuming 1 Hz = 1 step/sec)
  const frequency = avgPeriod > 0 ? 1 / avgPeriod : null;
  
  return {
    isPeriodic: true,
    frequency,
    period: Math.round(avgPeriod),
    dutyCycle,
    dutyCyclePercent: `${(dutyCycle * 100).toFixed(1)}%`,
  };
}

/**
 * Calculate duty cycle directly from signal history
 * @param signalHistory - Array of signal states over time
 * @returns Duty cycle as percentage (0-100)
 */
export function calculateDutyCycle(signalHistory: SignalState[]): number {
  if (signalHistory.length === 0) {
    return 0;
  }
  
  const highCount = signalHistory.filter((s) => s).length;
  return (highCount / signalHistory.length) * 100;
}

/**
 * Format frequency for display
 * @param frequency - Frequency in Hz, or null
 * @returns Formatted frequency string
 */
export function formatFrequency(frequency: number | null): string {
  if (frequency === null) {
    return 'N/A';
  }
  
  // Use appropriate units
  if (frequency >= 1) {
    return `${frequency.toFixed(3)} Hz`;
  } else if (frequency >= 0.001) {
    return `${(frequency * 1000).toFixed(3)} mHz`;
  } else {
    return `${(frequency * 1e6).toFixed(3)} µHz`;
  }
}

// ============================================================================
// CSV Export Functions
// ============================================================================

/**
 * Generate CSV content from timing data
 * @param traces - Array of trace entries
 * @param signalNames - Array of signal names to include
 * @returns CSV content string
 */
export function generateTimingCSV(
  traces: SignalTraceEntry[],
  signalNames: string[]
): string {
  const headers = ['signal', 'timestamp', 'value', 'annotation'];
  const rows: string[] = [headers.join(',')];
  
  for (const trace of traces) {
    for (const name of signalNames) {
      const value = trace.signals[name] ?? false;
      const valueStr = value ? 'HIGH' : 'LOW';
      
      // Generate annotation based on signal state
      let annotation = '';
      if (value) {
        annotation = 'active';
      }
      
      rows.push(`${name},${trace.step},${valueStr},${annotation}`);
    }
  }
  
  return rows.join('\n');
}

/**
 * Download CSV content as a file
 * @param csvContent - CSV content string
 * @param filename - Filename for download
 */
export function downloadCSV(csvContent: string, filename: string = 'timing_data.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// ============================================================================
// Signal History Extraction
// ============================================================================

/**
 * Extract signal history from traces
 * @param traces - Array of trace entries
 * @param signalName - Name of the signal
 * @returns Array of signal states
 */
export function extractSignalHistory(
  traces: SignalTraceEntry[],
  signalName: string
): SignalState[] {
  return traces.map((trace) => trace.signals[signalName] ?? false);
}

/**
 * Get unique signal names from traces
 * @param traces - Array of trace entries
 * @returns Array of unique signal names
 */
export function getUniqueSignalNames(traces: SignalTraceEntry[]): string[] {
  const nameSet = new Set<string>();
  
  for (const trace of traces) {
    for (const key of Object.keys(trace.signals)) {
      // Skip ID-based keys
      if (!key.startsWith('input-') && !key.startsWith('gate-') && !key.startsWith('output-')) {
        nameSet.add(key);
      }
    }
  }
  
  return Array.from(nameSet);
}

// ============================================================================
// Annotation Utilities
// ============================================================================

/**
 * Get transition type description
 * @param fromState - Previous state
 * @param toState - New state
 * @returns Description string
 */
export function getTransitionType(fromState: SignalState, toState: SignalState): string {
  if (fromState === false && toState === true) {
    return 'Rising Edge';
  } else if (fromState === true && toState === false) {
    return 'Falling Edge';
  }
  return 'No Transition';
}

/**
 * Generate annotation for a specific step
 * @param trace - Trace entry at the step
 * @param step - Step index
 * @returns Annotation string
 */
export function generateStepAnnotation(
  trace: SignalTraceEntry,
  step: number
): string {
  const signals = Object.entries(trace.signals)
    .filter(([key]) => !key.startsWith('input-') && !key.startsWith('gate-') && !key.startsWith('output-'))
    .map(([name, value]) => `${name}:${value ? 'H' : 'L'}`);
  
  return `t${step} [${signals.join(', ')}]`;
}

// ============================================================================
// Export
// ============================================================================

export default {
  calculateXPosition,
  calculateStepFromXPosition,
  createCursor,
  calculateTimeDelta,
  formatTimeDelta,
  findTransitions,
  calculateSignalStatistics,
  calculateFrequency,
  calculateDutyCycle,
  formatFrequency,
  generateTimingCSV,
  downloadCSV,
  extractSignalHistory,
  getUniqueSignalNames,
  getTransitionType,
  generateStepAnnotation,
  DEFAULT_TIME_SCALE,
  DEFAULT_LEFT_MARGIN,
  TIME_STEP_NS,
  MIN_TRANSITIONS_FOR_FREQUENCY,
};
