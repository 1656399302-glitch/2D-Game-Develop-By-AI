/**
 * TimingDiagram Component
 * 
 * Round 149: Circuit Signal Visualization
 * 
 * SVG-based timing diagram component that displays signal traces
 * over time during circuit simulation. Shows waveform visualization
 * for inputs, gates, and outputs.
 */

import React, { useMemo } from 'react';
import { SignalState } from '../../types/circuit';
import { SignalTraceEntry } from '../../store/signalTraceStore';

// ============================================================================
// Types
// ============================================================================

/**
 * Timing diagram component props
 */
export interface TimingDiagramProps {
  /** Signal trace data to display */
  traces: SignalTraceEntry[];
  /** Signal names to display (order matters) */
  signalNames: string[];
  /** Width of the diagram in pixels */
  width?: number;
  /** Height per signal row in pixels */
  rowHeight?: number;
  /** Left margin for signal labels */
  leftMargin?: number;
  /** Right margin */
  rightMargin?: number;
  /** Time scale (pixels per time step) */
  timeScale?: number;
  /** HIGH signal color */
  highColor?: string;
  /** LOW signal color */
  lowColor?: string;
  /** Grid line color */
  gridColor?: string;
  /** Label text color */
  labelColor?: string;
  /** CSS class for the container */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_HIGH_COLOR = '#22c55e'; // Green
const DEFAULT_LOW_COLOR = '#64748b';  // Gray
const DEFAULT_GRID_COLOR = '#334155';
const DEFAULT_LABEL_COLOR = '#94a3b8';
const DEFAULT_ROW_HEIGHT = 40;
const DEFAULT_LEFT_MARGIN = 80;
const DEFAULT_RIGHT_MARGIN = 20;
const DEFAULT_TIME_SCALE = 30;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate SVG rects for HIGH signal segments
 * More reliable than path for filled rectangles with exact colors
 */
function generateSignalRects(
  signalHistory: SignalState[],
  startX: number,
  stepWidth: number,
  baselineY: number,
  amplitude: number,
  highColor: string,
  lowColor: string
): JSX.Element[] {
  const rects: JSX.Element[] = [];
  
  for (let i = 0; i < signalHistory.length; i++) {
    const x = startX + i * stepWidth;
    const isHigh = signalHistory[i];
    
    // Draw the waveform as a filled shape
    const y = isHigh ? baselineY - amplitude : baselineY;
    const height = amplitude;
    
    rects.push(
      <rect
        key={`rect-${i}`}
        x={x}
        y={y}
        width={stepWidth}
        height={height}
        fill={isHigh ? highColor : lowColor}
        opacity={isHigh ? 1 : 0.3}
      />
    );
  }
  
  return rects;
}

/**
 * Generate step indicator line segments
 */
function generateStepLines(
  stepCount: number,
  startX: number,
  stepWidth: number,
  totalHeight: number,
  baselineY: number,
  gridColor: string
): JSX.Element[] {
  const lines: JSX.Element[] = [];
  
  for (let i = 0; i <= stepCount; i++) {
    const x = startX + i * stepWidth;
    
    // Vertical grid line
    lines.push(
      <line
        key={`vline-${i}`}
        x1={x}
        y1={baselineY - 20}
        x2={x}
        y2={baselineY + totalHeight}
        stroke={gridColor}
        strokeWidth={1}
        opacity={0.5}
      />
    );
    
    // Step label at top
    if (stepCount <= 20 || i % Math.ceil(stepCount / 10) === 0) {
      lines.push(
        <text
          key={`label-${i}`}
          x={x + stepWidth / 2}
          y={baselineY - 30}
          fill={gridColor}
          fontSize={10}
          textAnchor="middle"
          fontFamily="monospace"
        >
          {i}
        </text>
      );
    }
  }
  
  return lines;
}

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * TimingDiagram Component
 * Renders an SVG-based timing diagram showing signal waveforms over time
 */
export const TimingDiagram: React.FC<TimingDiagramProps> = ({
  traces,
  signalNames,
  width = 600,
  rowHeight = DEFAULT_ROW_HEIGHT,
  leftMargin = DEFAULT_LEFT_MARGIN,
  rightMargin = DEFAULT_RIGHT_MARGIN,
  timeScale = DEFAULT_TIME_SCALE,
  highColor = DEFAULT_HIGH_COLOR,
  lowColor = DEFAULT_LOW_COLOR,
  gridColor = DEFAULT_GRID_COLOR,
  labelColor = DEFAULT_LABEL_COLOR,
  className,
  'data-testid': testId,
}) => {
  // Calculate dimensions
  const stepCount = traces.length;
  const diagramWidth = stepCount * timeScale + leftMargin + rightMargin;
  const diagramHeight = signalNames.length * rowHeight + 60; // Extra space for header
  const headerHeight = 50;
  
  // Get signal history for each signal name
  const signalHistories = useMemo(() => {
    const histories: Record<string, SignalState[]> = {};
    
    for (const name of signalNames) {
      histories[name] = traces.map((trace) => trace.signals[name] ?? false);
    }
    
    return histories;
  }, [traces, signalNames]);
  
  // Render nothing if no traces
  if (traces.length === 0) {
    return (
      <div
        className={`timing-diagram timing-diagram--empty ${className || ''}`}
        data-testid={testId}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100px',
          color: '#64748b',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}
      >
        No signal trace data available
      </div>
    );
  }
  
  return (
    <div
      className={`timing-diagram ${className || ''}`}
      data-testid={testId}
      role="graphics-document"
      aria-label="Timing Diagram"
    >
      <svg
        width={Math.max(width, diagramWidth)}
        height={diagramHeight}
        viewBox={`0 0 ${diagramWidth} ${diagramHeight}`}
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderRadius: '8px',
          border: `1px solid ${gridColor}`,
        }}
      >
        {/* Header */}
        <text
          x={leftMargin}
          y={20}
          fill={labelColor}
          fontSize={14}
          fontWeight={600}
          fontFamily="monospace"
        >
          波形图 / Timing Diagram
        </text>
        
        {/* Time axis label */}
        <text
          x={diagramWidth - rightMargin}
          y={20}
          fill={labelColor}
          fontSize={10}
          fontFamily="monospace"
          textAnchor="end"
        >
          {stepCount} steps
        </text>
        
        {/* Grid lines and waveforms */}
        {signalNames.map((name, index) => {
          const y = headerHeight + index * rowHeight;
          const baselineY = y + rowHeight / 2;
          const amplitude = rowHeight / 3;
          const history = signalHistories[name] || [];
          const startX = leftMargin;
          
          return (
            <g key={`signal-${name}`} data-signal-name={name}>
              {/* Signal label */}
              <text
                x={leftMargin - 10}
                y={baselineY + 4}
                fill={labelColor}
                fontSize={11}
                fontFamily="monospace"
                textAnchor="end"
              >
                {name}
              </text>
              
              {/* Step lines for this row */}
              {generateStepLines(
                stepCount,
                startX,
                timeScale,
                signalNames.length * rowHeight,
                baselineY,
                gridColor
              )}
              
              {/* Signal waveform bars */}
              {generateSignalRects(
                history,
                startX,
                timeScale,
                baselineY,
                amplitude,
                highColor,
                lowColor
              )}
              
              {/* Horizontal separator line */}
              <line
                x1={leftMargin}
                y1={y + rowHeight}
                x2={diagramWidth - rightMargin}
                y2={y + rowHeight}
                stroke={gridColor}
                strokeWidth={1}
                opacity={0.3}
              />
            </g>
          );
        })}
        
        {/* Legend */}
        <g transform={`translate(${diagramWidth - 150}, ${diagramHeight - 25})`}>
          <rect x={0} y={0} width={12} height={12} fill={highColor} />
          <text x={16} y={10} fill={labelColor} fontSize={10} fontFamily="monospace">
            HIGH
          </text>
          <rect x={55} y={0} width={12} height={12} fill={lowColor} opacity={0.3} />
          <text x={71} y={10} fill={labelColor} fontSize={10} fontFamily="monospace">
            LOW
          </text>
        </g>
      </svg>
    </div>
  );
};

// ============================================================================
// Compact Version for Inline Use
// ============================================================================

/**
 * Compact timing diagram for inline use
 */
export const CompactTimingDiagram: React.FC<{
  traces: SignalTraceEntry[];
  signalName: string;
  width?: number;
  height?: number;
  highColor?: string;
  lowColor?: string;
}> = ({
  traces,
  signalName,
  width = 200,
  height = 40,
  highColor = DEFAULT_HIGH_COLOR,
  lowColor = DEFAULT_LOW_COLOR,
}) => {
  const signalHistory = traces.map((trace) => trace.signals[signalName] ?? false);
  const stepWidth = width / Math.max(signalHistory.length, 1);
  const amplitude = height / 3;
  const baselineY = height / 2;
  
  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      data-testid="compact-timing-diagram"
    >
      <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
        {signalName}:
      </span>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ backgroundColor: 'transparent' }}
      >
        {/* Signal waveform bars */}
        {signalHistory.map((isHigh, i) => (
          <rect
            key={i}
            x={i * stepWidth}
            y={isHigh ? baselineY - amplitude : baselineY}
            width={stepWidth}
            height={amplitude}
            fill={isHigh ? highColor : lowColor}
            opacity={isHigh ? 1 : 0.3}
          />
        ))}
      </svg>
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default TimingDiagram;
