/**
 * EnhancedTimingDiagram Component
 * 
 * Round 171: Circuit Timing Visualization Enhancement
 * 
 * Enhanced timing diagram with dual cursor support for measuring
 * timing relationships between signals. Features:
 * - Dual cursor (A/B) with time delta display
 * - Signal frequency calculation
 * - Zoom controls for detailed analysis
 * - Signal annotations
 * - CSV export capability
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { SignalTraceEntry } from '../../store/signalTraceStore';
import { TimingDiagram } from './TimingDiagram';
import {
  calculateStepFromXPosition,
  createCursor,
  calculateTimeDelta,
  formatTimeDelta,
  calculateFrequency,
  calculateDutyCycle,
  formatFrequency,
  extractSignalHistory,
  DEFAULT_TIME_SCALE,
  DEFAULT_LEFT_MARGIN,
} from '../../utils/timingAnalysis';
import { SIGNAL_COLORS } from '../../utils/waveformUtils';

// ============================================================================
// Types
// ============================================================================

/**
 * Cursor state for enhanced timing diagram
 */
export interface CursorState {
  /** Cursor A position */
  cursorA: number;
  /** Cursor B position */
  cursorB: number;
  /** Which cursor is being dragged */
  activeCursor: 'A' | 'B' | null;
}

/**
 * Zoom level state
 */
export interface ZoomState {
  /** Current zoom level (1 = default) */
  level: number;
  /** Time scale at current zoom */
  timeScale: number;
}

/**
 * Enhanced timing diagram props
 */
export interface EnhancedTimingDiagramProps {
  /** Signal trace data to display */
  traces: SignalTraceEntry[];
  /** Signal names to display (order matters) */
  signalNames: string[];
  /** Height per signal row in pixels */
  rowHeight?: number;
  /** Initial cursor A position */
  initialCursorA?: number;
  /** Initial cursor B position */
  initialCursorB?: number;
  /** Callback when cursor position changes */
  onCursorChange?: (cursorA: number, cursorB: number) => void;
  /** Callback when zoom level changes */
  onZoomChange?: (zoomLevel: number) => void;
  /** Whether to show zoom controls */
  showZoomControls?: boolean;
  /** Whether to show frequency analysis */
  showFrequencyAnalysis?: boolean;
  /** Whether to show annotations */
  showAnnotations?: boolean;
  /** CSS class for the container */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

// ============================================================================
// Constants
// ============================================================================

const CURSOR_COLORS = {
  A: '#00FFFF',  // Cyan
  B: '#FF6B6B',  // Red
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

// ============================================================================
// Styles
// ============================================================================

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(15, 23, 42, 0.98)',
  borderRadius: '8px',
  border: '1px solid #334155',
  overflow: 'hidden',
};

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  backgroundColor: 'rgba(30, 41, 59, 0.8)',
  borderBottom: '1px solid #334155',
  gap: '12px',
};

const cursorInfoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  fontSize: '12px',
  fontFamily: 'monospace',
  color: '#94a3b8',
};

const cursorBadgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: color,
  color: '#0f172a',
  fontWeight: 700,
  fontSize: '11px',
  marginRight: '4px',
});

const deltaStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '4px 8px',
  backgroundColor: 'rgba(0, 255, 255, 0.1)',
  borderRadius: '4px',
  color: '#00FFFF',
  fontWeight: 600,
};

const zoomControlsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
};

const zoomButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  backgroundColor: '#475569',
  border: 'none',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '14px',
  cursor: 'pointer',
  fontFamily: 'monospace',
};

const zoomLabelStyle: React.CSSProperties = {
  padding: '4px 8px',
  backgroundColor: 'rgba(71, 85, 105, 0.5)',
  borderRadius: '4px',
  color: '#94a3b8',
  fontSize: '11px',
  fontFamily: 'monospace',
  minWidth: '50px',
  textAlign: 'center',
};

const diagramContainerStyle: React.CSSProperties = {
  position: 'relative',
  overflow: 'auto',
};

const overlayContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
};

const overlaySvgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
};

const cursorLineStyle = (color: string): React.CSSProperties => ({
  stroke: color,
  strokeWidth: 2,
  strokeDasharray: '4,2',
  opacity: 0.8,
});

const cursorHandleStyle = (color: string): React.CSSProperties => ({
  fill: color,
  stroke: '#ffffff',
  strokeWidth: 2,
  cursor: 'ew-resize',
  pointerEvents: 'all',
});

const annotationStyle: React.CSSProperties = {
  fill: '#94a3b8',
  fontSize: '10px',
  fontFamily: 'monospace',
};

const frequencyPanelStyle: React.CSSProperties = {
  padding: '8px 12px',
  backgroundColor: 'rgba(30, 41, 59, 0.5)',
  borderTop: '1px solid #334155',
  fontSize: '11px',
  fontFamily: 'monospace',
  color: '#94a3b8',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
};

const frequencyItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
};

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * EnhancedTimingDiagram Component
 * 
 * Timing diagram with dual cursor support for measuring timing relationships
 */
export const EnhancedTimingDiagram: React.FC<EnhancedTimingDiagramProps> = ({
  traces,
  signalNames,
  rowHeight = 40,
  initialCursorA = 0,
  initialCursorB = 10,
  onCursorChange,
  onZoomChange,
  showZoomControls = true,
  showFrequencyAnalysis = true,
  showAnnotations = true,
  className,
  'data-testid': testId,
}) => {
  // Refs for drag handling
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for cursors
  const [cursorState, setCursorState] = useState<CursorState>({
    cursorA: initialCursorA,
    cursorB: initialCursorB,
    activeCursor: null,
  });
  
  // State for zoom
  const [zoomState, setZoomState] = useState<ZoomState>({
    level: 1,
    timeScale: DEFAULT_TIME_SCALE,
  });
  
  // Calculate step count and max valid step
  const stepCount = traces.length;
  const maxStep = Math.max(0, stepCount - 1);
  
  // Memoized signal histories
  const signalHistories = useMemo(() => {
    const histories: Record<string, boolean[]> = {};
    
    for (const name of signalNames) {
      histories[name] = extractSignalHistory(traces, name);
    }
    
    return histories;
  }, [traces, signalNames]);
  
  // Memoized frequency analysis for each signal
  const frequencyAnalysis = useMemo(() => {
    if (!showFrequencyAnalysis) return {};
    
    const analysis: Record<string, { frequency: string; dutyCycle: string }> = {};
    
    for (const name of signalNames) {
      const history = signalHistories[name] || [];
      const freqResult = calculateFrequency(history, name);
      const dutyCycle = calculateDutyCycle(history);
      
      analysis[name] = {
        frequency: formatFrequency(freqResult.frequency),
        dutyCycle: `${dutyCycle.toFixed(1)}%`,
      };
    }
    
    return analysis;
  }, [signalNames, signalHistories, showFrequencyAnalysis]);
  
  // Calculate time delta between cursors
  const timeDelta = useMemo(() => {
    const cursorA = createCursor('A', cursorState.cursorA, zoomState.timeScale, DEFAULT_LEFT_MARGIN);
    const cursorB = createCursor('B', cursorState.cursorB, zoomState.timeScale, DEFAULT_LEFT_MARGIN);
    return calculateTimeDelta(cursorA, cursorB);
  }, [cursorState.cursorA, cursorState.cursorB, zoomState.timeScale]);
  
  // Calculate diagram dimensions
  const diagramWidth = stepCount * zoomState.timeScale + DEFAULT_LEFT_MARGIN + 40;
  const headerHeight = 50;
  const diagramHeight = signalNames.length * rowHeight + headerHeight + 60;
  
  // Handle cursor drag start
  const handleMouseDown = useCallback((e: React.MouseEvent, cursorId: 'A' | 'B') => {
    e.preventDefault();
    e.stopPropagation();
    
    setCursorState((prev) => ({
      ...prev,
      activeCursor: cursorId,
    }));
    
    // Add global mouse listeners
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const scrollLeft = containerRef.current.scrollLeft;
      const x = moveEvent.clientX - rect.left + scrollLeft;
      const newStep = calculateStepFromXPosition(
        x,
        zoomState.timeScale,
        DEFAULT_LEFT_MARGIN,
        maxStep
      );
      
      setCursorState((prev) => ({
        ...prev,
        [cursorId === 'A' ? 'cursorA' : 'cursorB']: newStep,
      }));
    };
    
    const handleMouseUp = () => {
      setCursorState((prev) => ({
        ...prev,
        activeCursor: null,
      }));
      
      // Notify parent of cursor change
      if (onCursorChange) {
        setCursorState((current) => {
          onCursorChange(current.cursorA, current.cursorB);
          return current;
        });
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [zoomState.timeScale, maxStep, onCursorChange]);
  
  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    setZoomState((prev) => {
      const newLevel = Math.min(prev.level + ZOOM_STEP, MAX_ZOOM);
      const newTimeScale = Math.round(DEFAULT_TIME_SCALE * newLevel);
      
      if (onZoomChange) {
        onZoomChange(newLevel);
      }
      
      return {
        level: newLevel,
        timeScale: newTimeScale,
      };
    });
  }, [onZoomChange]);
  
  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    setZoomState((prev) => {
      const newLevel = Math.max(prev.level - ZOOM_STEP, MIN_ZOOM);
      const newTimeScale = Math.round(DEFAULT_TIME_SCALE * newLevel);
      
      if (onZoomChange) {
        onZoomChange(newLevel);
      }
      
      return {
        level: newLevel,
        timeScale: newTimeScale,
      };
    });
  }, [onZoomChange]);
  
  // Handle zoom reset
  const handleZoomReset = useCallback(() => {
    setZoomState({
      level: 1,
      timeScale: DEFAULT_TIME_SCALE,
    });
    
    if (onZoomChange) {
      onZoomChange(1);
    }
  }, [onZoomChange]);
  
  // Render nothing if no traces
  if (traces.length === 0) {
    return (
      <div style={containerStyle} className={className} data-testid={testId}>
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontFamily: 'monospace' }}>
          No signal trace data available
        </div>
      </div>
    );
  }
  
  return (
    <div style={containerStyle} className={className} data-testid={testId} ref={containerRef}>
      {/* Toolbar with cursor info and zoom controls */}
      <div style={toolbarStyle}>
        {/* Cursor positions and time delta */}
        <div style={cursorInfoStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={cursorBadgeStyle(CURSOR_COLORS.A)}>A</span>
            <span>Step: {cursorState.cursorA}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={cursorBadgeStyle(CURSOR_COLORS.B)}>B</span>
            <span>Step: {cursorState.cursorB}</span>
          </div>
          
          <div style={deltaStyle}>
            <span>Δt =</span>
            <span>{formatTimeDelta(timeDelta.timeDelta, true)}</span>
          </div>
        </div>
        
        {/* Zoom controls */}
        {showZoomControls && (
          <div style={zoomControlsStyle}>
            <button
              style={zoomButtonStyle}
              onClick={handleZoomOut}
              disabled={zoomState.level <= MIN_ZOOM}
              aria-label="Zoom out"
            >
              −
            </button>
            
            <span style={zoomLabelStyle}>
              {Math.round(zoomState.level * 100)}%
            </span>
            
            <button
              style={zoomButtonStyle}
              onClick={handleZoomIn}
              disabled={zoomState.level >= MAX_ZOOM}
              aria-label="Zoom in"
            >
              +
            </button>
            
            <button
              style={{ ...zoomButtonStyle, fontSize: '10px' }}
              onClick={handleZoomReset}
              aria-label="Reset zoom"
            >
              Reset
            </button>
          </div>
        )}
      </div>
      
      {/* Timing diagram with cursor overlay */}
      <div style={diagramContainerStyle}>
        {/* Base timing diagram */}
        <TimingDiagram
          traces={traces}
          signalNames={signalNames}
          width={diagramWidth}
          rowHeight={rowHeight}
          timeScale={zoomState.timeScale}
          data-testid="timing-diagram-base"
        />
        
        {/* Cursor overlay */}
        <div style={overlayContainerStyle}>
          <svg style={overlaySvgStyle} viewBox={`0 0 ${diagramWidth} ${diagramHeight}`}>
            {/* Cursor A line */}
            <line
              x1={timeDelta.cursorA.xPosition}
              y1={headerHeight}
              x2={timeDelta.cursorA.xPosition}
              y2={diagramHeight}
              style={cursorLineStyle(CURSOR_COLORS.A)}
              data-testid="cursor-line-a"
            />
            
            {/* Cursor B line */}
            <line
              x1={timeDelta.cursorB.xPosition}
              y1={headerHeight}
              x2={timeDelta.cursorB.xPosition}
              y2={diagramHeight}
              style={cursorLineStyle(CURSOR_COLORS.B)}
              data-testid="cursor-line-b"
            />
            
            {/* Cursor A handle (draggable) */}
            <g
              onMouseDown={(e) => handleMouseDown(e, 'A')}
              style={{ cursor: 'ew-resize' }}
              data-testid="cursor-handle-a"
            >
              <circle
                cx={timeDelta.cursorA.xPosition}
                cy={headerHeight - 5}
                r={8}
                style={cursorHandleStyle(CURSOR_COLORS.A)}
              />
              <text
                x={timeDelta.cursorA.xPosition}
                y={headerHeight - 2}
                textAnchor="middle"
                fill="#0f172a"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
              >
                A
              </text>
            </g>
            
            {/* Cursor B handle (draggable) */}
            <g
              onMouseDown={(e) => handleMouseDown(e, 'B')}
              style={{ cursor: 'ew-resize' }}
              data-testid="cursor-handle-b"
            >
              <circle
                cx={timeDelta.cursorB.xPosition}
                cy={headerHeight - 5}
                r={8}
                style={cursorHandleStyle(CURSOR_COLORS.B)}
              />
              <text
                x={timeDelta.cursorB.xPosition}
                y={headerHeight - 2}
                textAnchor="middle"
                fill="#0f172a"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
              >
                B
              </text>
            </g>
            
            {/* Time delta annotation */}
            <text
              x={(timeDelta.cursorA.xPosition + timeDelta.cursorB.xPosition) / 2}
              y={headerHeight + 15}
              textAnchor="middle"
              fill={SIGNAL_COLORS.cyan}
              fontSize="11"
              fontWeight="bold"
              fontFamily="monospace"
              data-testid="delta-annotation"
            >
              {`Δt = ${timeDelta.timeDeltaNs}ns`}
            </text>
            
            {/* Signal annotations */}
            {showAnnotations && signalNames.map((name) => {
              const y = headerHeight + signalNames.indexOf(name) * rowHeight + rowHeight / 2;
              
              return (
                <text
                  key={`annotation-${name}`}
                  x={diagramWidth - 20}
                  y={y + 4}
                  textAnchor="end"
                  style={annotationStyle}
                >
                  {frequencyAnalysis[name]?.frequency || ''}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
      
      {/* Frequency analysis panel */}
      {showFrequencyAnalysis && Object.keys(frequencyAnalysis).length > 0 && (
        <div style={frequencyPanelStyle} data-testid="frequency-panel">
          {signalNames.map((name) => {
            const analysis = frequencyAnalysis[name];
            return (
              <div key={name} style={frequencyItemStyle}>
                <span style={{ color: SIGNAL_COLORS.cyan }}>{name}:</span>
                <span>f = {analysis?.frequency || 'N/A'}</span>
                <span>|</span>
                <span>DC = {analysis?.dutyCycle || 'N/A'}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default EnhancedTimingDiagram;
