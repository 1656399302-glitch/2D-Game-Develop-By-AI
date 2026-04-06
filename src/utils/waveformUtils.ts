/**
 * Waveform Utilities
 * 
 * Round 159: Timing Diagram Enhancement
 * 
 * Utility functions for waveform data transformation,
 * including SVG path generation, signal state analysis,
 * and clock signal period detection.
 */

import { SignalState } from '../types/circuit';
import { SignalTraceEntry as StoreSignalTraceEntry } from '../store/signalTraceStore';

// ============================================================================
// Types
// ============================================================================

/**
 * Waveform segment representing a portion of a signal trace
 */
export interface WaveformSegment {
  /** Step index where this segment starts */
  startStep: number;
  /** Step index where this segment ends (exclusive) */
  endStep: number;
  /** Signal state for this segment */
  state: SignalState;
}

/**
 * Complete waveform for a single signal
 */
export interface SignalWaveform {
  /** Signal name */
  name: string;
  /** Waveform segments */
  segments: WaveformSegment[];
  /** Whether this is a clock signal */
  isClock: boolean;
  /** Total number of steps in the waveform */
  stepCount: number;
}

/**
 * Signal transition event
 */
export interface SignalTransition {
  /** Step index where transition occurs */
  step: number;
  /** Previous state before transition */
  fromState: SignalState;
  /** New state after transition */
  toState: SignalState;
  /** X position in the SVG diagram */
  xPosition: number;
}

/**
 * Clock signal metadata
 */
export interface ClockMetadata {
  /** Signal name */
  name: string;
  /** Period in time steps */
  period: number;
  /** Duty cycle (0-1) */
  dutyCycle: number;
  /** Whether clock is valid (proper 50% duty cycle) */
  isValid: boolean;
}

/**
 * Waveform rendering configuration
 */
export interface WaveformConfig {
  /** X position where waveform starts */
  startX: number;
  /** Width per time step in pixels */
  stepWidth: number;
  /** Y position for HIGH state */
  highY: number;
  /** Y position for LOW state */
  lowY: number;
  /** Color for HIGH state */
  highColor: string;
  /** Color for LOW state */
  lowColor: string;
}

// ============================================================================
// Constants
// ============================================================================

/** Clock period marker interval (time units) */
export const CLOCK_PERIOD_INTERVAL = 8;

/** Signal colors for multi-signal display */
export const SIGNAL_COLORS = {
  cyan: '#00FFFF',
  purple: '#9966FF',
  green: '#00FF66',
  cyanAlt: '#22D3EE',
  purpleAlt: '#A78BFA',
  greenAlt: '#34D399',
};

/** Default waveform configuration */
export const DEFAULT_WAVEFORM_CONFIG: WaveformConfig = {
  startX: 80,
  stepWidth: 30,
  highY: 10,
  lowY: 30,
  highColor: '#22c55e',
  lowColor: '#64748b',
};

// ============================================================================
// Waveform Generation
// ============================================================================

/**
 * Convert signal history to waveform segments
 * @param signalHistory - Array of signal states over time
 * @returns Array of waveform segments
 */
export function signalHistoryToSegments(signalHistory: SignalState[]): WaveformSegment[] {
  const segments: WaveformSegment[] = [];
  
  if (signalHistory.length === 0) {
    return segments;
  }
  
  let currentState = signalHistory[0];
  let startStep = 0;
  
  for (let i = 1; i < signalHistory.length; i++) {
    if (signalHistory[i] !== currentState) {
      segments.push({
        startStep,
        endStep: i,
        state: currentState,
      });
      currentState = signalHistory[i];
      startStep = i;
    }
  }
  
  segments.push({
    startStep,
    endStep: signalHistory.length,
    state: currentState,
  });
  
  return segments;
}

/**
 * Get waveform for a specific signal from traces
 * @param traces - Array of trace entries
 * @param signalName - Name of the signal
 * @returns Signal waveform with segments
 */
export function getSignalWaveform(
  traces: StoreSignalTraceEntry[],
  signalName: string
): SignalWaveform {
  const signalHistory = traces.map((trace) => trace.signals[signalName] ?? false);
  const segments = signalHistoryToSegments(signalHistory);
  const isClock = detectClockSignal(signalHistory);
  
  return {
    name: signalName,
    segments,
    isClock,
    stepCount: traces.length,
  };
}

/**
 * Generate SVG path for a waveform using step-style rendering
 * @param segments - Waveform segments
 * @param config - Rendering configuration
 * @returns SVG path string
 */
export function generateWaveformPath(
  segments: WaveformSegment[],
  config: WaveformConfig
): string {
  if (segments.length === 0) {
    return '';
  }
  
  const { startX, stepWidth, highY, lowY } = config;
  let path = '';
  
  for (const segment of segments) {
    const startXPos = startX + segment.startStep * stepWidth;
    const endXPos = startX + segment.endStep * stepWidth;
    const yPos = segment.state ? highY : lowY;
    
    if (path === '') {
      path = `M ${startXPos} ${yPos}`;
    }
    
    path += ` H ${endXPos}`;
  }
  
  return path;
}

/**
 * Generate filled waveform path for use with stroke
 * @param segments - Waveform segments
 * @param config - Rendering configuration
 * @returns SVG path string
 */
export function generateFilledWaveformPath(
  segments: WaveformSegment[],
  config: WaveformConfig
): string {
  if (segments.length === 0) {
    return '';
  }
  
  const { startX, stepWidth, highY, lowY } = config;
  let path = '';
  let prevY = lowY;
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const xPos = startX + segment.startStep * stepWidth;
    const endXPos = startX + segment.endStep * stepWidth;
    const yPos = segment.state ? highY : lowY;
    
    if (path === '') {
      path = `M ${xPos} ${prevY}`;
      path += ` L ${xPos} ${yPos}`;
    } else {
      path += ` L ${xPos} ${yPos}`;
    }
    
    path += ` H ${endXPos}`;
    prevY = yPos;
  }
  
  return path;
}

// ============================================================================
// Signal Transition Detection
// ============================================================================

/**
 * Find all signal transitions in a signal history
 * @param signalHistory - Array of signal states over time
 * @param timeScale - Pixels per time step
 * @param startX - Starting X position
 * @returns Array of signal transitions
 */
export function findTransitions(
  signalHistory: SignalState[],
  timeScale: number = 30,
  startX: number = 80
): SignalTransition[] {
  const transitions: SignalTransition[] = [];
  
  for (let i = 1; i < signalHistory.length; i++) {
    if (signalHistory[i] !== signalHistory[i - 1]) {
      transitions.push({
        step: i,
        fromState: signalHistory[i - 1],
        toState: signalHistory[i],
        xPosition: startX + i * timeScale,
      });
    }
  }
  
  return transitions;
}

/**
 * Verify that signal transitions align with clock edges
 * @param signalHistory - Signal to verify
 * @param clockEdges - Clock edge positions
 * @param tolerance - Tolerance in pixels
 * @returns Whether transitions align correctly
 */
export function verifyTransitionsAlignWithClock(
  signalHistory: SignalState[],
  clockEdges: number[],
  tolerance: number = 2
): boolean {
  const transitions = findTransitions(signalHistory);
  
  for (const transition of transitions) {
    const nearestEdge = clockEdges.find(
      (edge) => Math.abs(transition.xPosition - edge) <= tolerance
    );
    
    if (!nearestEdge) {
      return false;
    }
    
    const edgeIndex = clockEdges.indexOf(nearestEdge);
    const isEvenEdge = edgeIndex % 2 === 0;
    
    if (transition.toState && !isEvenEdge) {
      return false;
    }
    
    if (!transition.toState && isEvenEdge) {
      return false;
    }
  }
  
  return true;
}

// ============================================================================
// Clock Signal Detection
// ============================================================================

/**
 * Detect if a signal appears to be a clock signal
 * @param signalHistory - Signal states over time
 * @returns Whether signal appears to be a clock
 */
export function detectClockSignal(signalHistory: SignalState[]): boolean {
  if (signalHistory.length < 4) {
    return false;
  }
  
  if (signalHistory[0] !== false) {
    return false;
  }
  
  const transitions = findTransitions(signalHistory);
  
  if (transitions.length < 2) {
    return false;
  }
  
  if (transitions.length < 4) {
    return false;
  }
  
  if (signalHistory[signalHistory.length - 1] !== false) {
    return false;
  }
  
  for (let i = 0; i < transitions.length - 1; i++) {
    const currentRising = transitions[i].toState === true;
    const nextRising = transitions[i + 1].toState === true;
    
    if (currentRising === nextRising) {
      return false;
    }
  }
  
  const periods: number[] = [];
  for (let i = 0; i < transitions.length - 1; i++) {
    periods.push(transitions[i + 1].step - transitions[i].step);
  }
  
  if (periods.length > 1) {
    const avgPeriod = periods.reduce((a, b) => a + b, 0) / periods.length;
    const isConsistent = periods.every(
      (p) => Math.abs(p - avgPeriod) <= 1
    );
    
    if (!isConsistent) {
      return false;
    }
  }
  
  const highDurations: number[] = [];
  const lowDurations: number[] = [];
  
  for (let i = 0; i < transitions.length; i += 2) {
    if (i + 1 < transitions.length && 
        transitions[i].toState === true && 
        transitions[i + 1].toState === false) {
      highDurations.push(transitions[i + 1].step - transitions[i].step);
    }
  }
  
  for (let i = 1; i < transitions.length; i += 2) {
    if (i + 1 < transitions.length && 
        transitions[i].toState === false && 
        transitions[i + 1].toState === true) {
      lowDurations.push(transitions[i + 1].step - transitions[i].step);
    }
  }
  
  if (highDurations.length > 0 && lowDurations.length > 0) {
    const avgHigh = highDurations.reduce((a, b) => a + b, 0) / highDurations.length;
    const avgLow = lowDurations.reduce((a, b) => a + b, 0) / lowDurations.length;
    const total = avgHigh + avgLow;
    
    if (total > 0) {
      const dutyCycle = avgHigh / total;
      if (dutyCycle < 0.35 || dutyCycle > 0.65) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Get clock signal metadata
 * @param signalHistory - Signal states over time
 * @param signalName - Name of the signal
 * @returns Clock metadata or null if not a clock
 */
export function getClockMetadata(
  signalHistory: SignalState[],
  signalName: string
): ClockMetadata | null {
  if (!detectClockSignal(signalHistory)) {
    return null;
  }
  
  const transitions = findTransitions(signalHistory);
  
  if (transitions.length < 2) {
    return null;
  }
  
  const risingEdges = transitions.filter((t) => t.toState === true);
  let period = 0;
  
  if (risingEdges.length >= 2) {
    period = risingEdges[1].step - risingEdges[0].step;
  } else {
    period = signalHistory.length;
  }
  
  const highDurations: number[] = [];
  for (let i = 0; i < transitions.length; i += 2) {
    if (i + 1 < transitions.length && 
        transitions[i].toState === true && 
        transitions[i + 1].toState === false) {
      highDurations.push(transitions[i + 1].step - transitions[i].step);
    }
  }
  
  const avgHigh = highDurations.length > 0
    ? highDurations.reduce((a, b) => a + b, 0) / highDurations.length
    : 0;
  
  const dutyCycle = period > 0 ? avgHigh / period : 0;
  
  return {
    name: signalName,
    period,
    dutyCycle,
    isValid: dutyCycle >= 0.35 && dutyCycle <= 0.65,
  };
}

/**
 * Generate clock period marker positions
 * @param totalSteps - Total number of time steps
 * @param period - Period interval (default: CLOCK_PERIOD_INTERVAL)
 * @param startX - Starting X position
 * @param timeScale - Pixels per time step
 * @returns Array of X positions for period markers
 */
export function generateClockPeriodMarkers(
  totalSteps: number,
  period: number = CLOCK_PERIOD_INTERVAL,
  startX: number = 80,
  timeScale: number = 30
): number[] {
  const markers: number[] = [];
  
  for (let i = period; i < totalSteps; i += period) {
    markers.push(startX + i * timeScale);
  }
  
  return markers;
}

// ============================================================================
// Multi-Signal Color Assignment
// ============================================================================

/**
 * Get distinct color for a signal based on its index
 * @param index - Signal index (0-based)
 * @returns Color hex string
 */
export function getSignalColor(index: number): string {
  const colors = [
    SIGNAL_COLORS.cyan,
    SIGNAL_COLORS.purple,
    SIGNAL_COLORS.green,
    SIGNAL_COLORS.cyanAlt,
    SIGNAL_COLORS.purpleAlt,
    SIGNAL_COLORS.greenAlt,
  ];
  
  return colors[index % colors.length];
}

/**
 * Get HIGH and LOW colors for a signal based on theme
 * @param signalIndex - Signal index for multi-signal distinct colors
 * @param theme - 'dark' or 'light'
 * @returns Object with highColor and lowColor
 */
export function getSignalColors(
  signalIndex: number = 0,
  theme: 'dark' | 'light' = 'dark'
): { highColor: string; lowColor: string } {
  const baseColor = getSignalColor(signalIndex);
  
  if (theme === 'dark') {
    return {
      highColor: baseColor,
      lowColor: '#1a1a2e',
    };
  }
  
  return {
    highColor: baseColor,
    lowColor: '#e2e8f0',
  };
}

// ============================================================================
// SVG Element Generation
// ============================================================================

/**
 * Generate SVG rects for waveform display
 * @param signalHistory - Signal states over time
 * @param config - Rendering configuration
 * @param amplitude - Height of waveform bars
 * @returns Array of rect data
 */
export function generateWaveformRects(
  signalHistory: SignalState[],
  config: WaveformConfig,
  amplitude: number = 20
): Array<{ x: number; y: number; width: number; height: number; fill: string; opacity: number }> {
  const { startX, stepWidth, highY, lowY, highColor, lowColor } = config;
  const rects: Array<{ x: number; y: number; width: number; height: number; fill: string; opacity: number }> = [];
  
  for (let i = 0; i < signalHistory.length; i++) {
    const x = startX + i * stepWidth;
    const isHigh = signalHistory[i];
    const y = isHigh ? highY : lowY;
    
    rects.push({
      x,
      y,
      width: stepWidth,
      height: amplitude,
      fill: isHigh ? highColor : lowColor,
      opacity: isHigh ? 1 : 0.3,
    });
  }
  
  return rects;
}

/**
 * Verify that waveform rendering will show distinct HIGH/LOW states
 * @param highY - Y position for HIGH state
 * @param lowY - Y position for LOW state
 * @returns Whether states are visually distinct
 */
export function areStatesDistinct(highY: number, lowY: number): boolean {
  return Math.abs(highY - lowY) >= 1;
}

// ============================================================================
// Data Validation
// ============================================================================

/**
 * Validate waveform data for rendering
 * @param traces - Array of trace entries
 * @param signalNames - Array of signal names to display
 * @returns Validation result
 */
export function validateWaveformData(
  traces: StoreSignalTraceEntry[],
  signalNames: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!traces || traces.length === 0) {
    errors.push('No trace data provided');
    return { valid: false, errors };
  }
  
  if (!signalNames || signalNames.length === 0) {
    errors.push('No signal names provided');
    return { valid: false, errors };
  }
  
  for (const name of signalNames) {
    const exists = traces.some((trace) => name in trace.signals);
    if (!exists) {
      errors.push(`Signal "${name}" not found in traces`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Check if signal history contains at least N transitions
 * @param signalHistory - Signal states over time
 * @param minTransitions - Minimum number of transitions
 * @returns Whether signal has sufficient transitions
 */
export function hasSufficientTransitions(
  signalHistory: SignalState[],
  minTransitions: number = 2
): boolean {
  const transitions = findTransitions(signalHistory);
  return transitions.length >= minTransitions;
}

// ============================================================================
// Export
// ============================================================================

export default {
  signalHistoryToSegments,
  getSignalWaveform,
  generateWaveformPath,
  generateFilledWaveformPath,
  findTransitions,
  verifyTransitionsAlignWithClock,
  detectClockSignal,
  getClockMetadata,
  generateClockPeriodMarkers,
  getSignalColor,
  getSignalColors,
  generateWaveformRects,
  areStatesDistinct,
  validateWaveformData,
  hasSufficientTransitions,
  SIGNAL_COLORS,
  CLOCK_PERIOD_INTERVAL,
  DEFAULT_WAVEFORM_CONFIG,
};
