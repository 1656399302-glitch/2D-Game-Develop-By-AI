/**
 * TimingAnalysisPanel Component
 * 
 * Round 171: Circuit Timing Visualization Enhancement
 * 
 * Panel component for timing measurements and signal analysis.
 * Features:
 * - Cursor-based time difference calculation
 * - Signal frequency display
 * - Duty cycle analysis
 * - Copy measurements to clipboard
 * - Export timing data as CSV
 */

import React, { useState, useCallback, useMemo } from 'react';
import { SignalTraceEntry } from '../../store/signalTraceStore';
import { EnhancedTimingDiagram } from './EnhancedTimingDiagram';
import {
  calculateFrequency,
  calculateDutyCycle,
  formatFrequency,
  formatTimeDelta,
  generateTimingCSV,
  downloadCSV,
  getUniqueSignalNames,
  extractSignalHistory,
  calculateSignalStatistics,
} from '../../utils/timingAnalysis';
import { SIGNAL_COLORS } from '../../utils/waveformUtils';

// ============================================================================
// Types
// ============================================================================

/**
 * Measurement data for display
 */
export interface MeasurementData {
  /** Signal name */
  signal: string;
  /** Frequency display string */
  frequency: string;
  /** Duty cycle percentage */
  dutyCycle: string;
  /** Min pulse width */
  minPulse: number;
  /** Max pulse width */
  maxPulse: number;
  /** Average pulse width */
  avgPulse: number;
  /** Number of transitions */
  transitions: number;
}

/**
 * Timing analysis panel props
 */
export interface TimingAnalysisPanelProps {
  /** Signal trace data to display */
  traces: SignalTraceEntry[];
  /** Initial cursor A position */
  initialCursorA?: number;
  /** Initial cursor B position */
  initialCursorB?: number;
  /** Whether the panel is visible */
  isVisible?: boolean;
  /** Callback when panel visibility changes */
  onVisibilityChange?: (isVisible: boolean) => void;
  /** CSS class for the container */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

// ============================================================================
// Constants
// ============================================================================

const PANEL_BORDER_RADIUS = '12px';

// ============================================================================
// Styles
// ============================================================================

const panelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(15, 23, 42, 0.98)',
  borderRadius: PANEL_BORDER_RADIUS,
  border: '1px solid #334155',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  backgroundColor: 'rgba(30, 41, 59, 0.8)',
  borderBottom: '1px solid #334155',
};

const titleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'monospace',
  color: '#e2e8f0',
};

const headerActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const contentStyle: React.CSSProperties = {
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  fontFamily: 'monospace',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const measurementsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '8px',
};

const measurementCardStyle: React.CSSProperties = {
  padding: '12px',
  backgroundColor: 'rgba(30, 41, 59, 0.5)',
  borderRadius: '8px',
  border: '1px solid #334155',
};

const measurementHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const signalNameStyle = (index: number): React.CSSProperties => ({
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: 'monospace',
  color: [SIGNAL_COLORS.cyan, SIGNAL_COLORS.purple, SIGNAL_COLORS.green][index % 3],
});

const measurementRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '11px',
  fontFamily: 'monospace',
  color: '#94a3b8',
  padding: '2px 0',
};

const measurementValueStyle: React.CSSProperties = {
  color: '#e2e8f0',
  fontWeight: 500,
};

const timeDeltaSectionStyle: React.CSSProperties = {
  padding: '12px',
  backgroundColor: 'rgba(0, 255, 255, 0.1)',
  borderRadius: '8px',
  border: '1px solid rgba(0, 255, 255, 0.3)',
};

const timeDeltaTitleStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  fontFamily: 'monospace',
  color: SIGNAL_COLORS.cyan,
  marginBottom: '8px',
};

const timeDeltaValueStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 700,
  fontFamily: 'monospace',
  color: SIGNAL_COLORS.cyan,
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 12px',
  backgroundColor: '#475569',
  border: 'none',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '12px',
  fontFamily: 'monospace',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'background-color 0.2s',
};

const buttonPrimaryStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#0ea5e9',
};

const copySuccessStyle: React.CSSProperties = {
  ...measurementValueStyle,
  color: '#22c55e',
  fontSize: '10px',
};

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  color: '#64748b',
  fontFamily: 'monospace',
  fontSize: '12px',
  textAlign: 'center',
  gap: '12px',
};

const tooltipStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: '4px',
  padding: '8px 12px',
  backgroundColor: '#1e293b',
  borderRadius: '6px',
  fontSize: '11px',
  fontFamily: 'monospace',
  color: '#94a3b8',
  whiteSpace: 'nowrap',
  zIndex: 10,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
};

// ============================================================================
// Helper Components
// ============================================================================

interface ButtonProps {
  onClick: () => void;
  variant?: 'default' | 'primary';
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}

const ActionButton: React.FC<ButtonProps> = ({
  onClick,
  variant = 'default',
  disabled = false,
  children,
  title,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        disabled={disabled}
        style={variant === 'primary' ? buttonPrimaryStyle : buttonStyle}
        onMouseEnter={() => title && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        data-testid={`button-${children?.toString().toLowerCase().replace(/\s+/g, '-')}`}
      >
        {children}
      </button>
      {showTooltip && title && (
        <div style={tooltipStyle}>{title}</div>
      )}
    </div>
  );
};

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * TimingAnalysisPanel Component
 * 
 * Panel for cursor-based timing measurements and signal analysis
 */
export const TimingAnalysisPanel: React.FC<TimingAnalysisPanelProps> = ({
  traces,
  initialCursorA = 0,
  initialCursorB = 10,
  isVisible = true,
  onVisibilityChange,
  className,
  'data-testid': testId,
}) => {
  // State for copy confirmation
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Get unique signal names from traces
  const signalNames = useMemo(() => {
    return getUniqueSignalNames(traces);
  }, [traces]);
  
  // Calculate measurements for each signal
  const measurements = useMemo((): MeasurementData[] => {
    return signalNames.map((name) => {
      const history = extractSignalHistory(traces, name);
      const freqResult = calculateFrequency(history, name);
      const dutyCycle = calculateDutyCycle(history);
      const stats = calculateSignalStatistics(history, name);
      
      return {
        signal: name,
        frequency: formatFrequency(freqResult.frequency),
        dutyCycle: `${dutyCycle.toFixed(1)}%`,
        minPulse: stats.minPulseWidth,
        maxPulse: stats.maxPulseWidth,
        avgPulse: Math.round(stats.avgPulseWidth * 100) / 100,
        transitions: stats.transitionCount,
      };
    });
  }, [signalNames, traces]);
  
  // Calculate time delta between cursors
  const timeDelta = initialCursorB - initialCursorA;
  const absoluteTimeDelta = Math.abs(timeDelta);
  const timeDeltaNs = absoluteTimeDelta;
  
  // Handle copy to clipboard
  const handleCopyToClipboard = useCallback(() => {
    const measurementText = measurements
      .map((m) => {
        return `${m.signal}: f=${m.frequency}, DC=${m.dutyCycle}, Δt=${timeDeltaNs}ns`;
      })
      .join('\n');
    
    const fullText = `Timing Analysis\nTime Delta (A-B): ${timeDeltaNs}ns\n\n${measurementText}`;
    
    navigator.clipboard.writeText(fullText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }, [measurements, timeDeltaNs]);
  
  // Handle CSV export
  const handleExportCSV = useCallback(() => {
    const csvContent = generateTimingCSV(traces, signalNames);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadCSV(csvContent, `timing_analysis_${timestamp}.csv`);
  }, [traces, signalNames]);
  
  // Handle close panel
  const handleClose = useCallback(() => {
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  }, [onVisibilityChange]);
  
  // Don't render if not visible
  if (!isVisible) {
    return null;
  }
  
  // Render empty state if no traces
  if (traces.length === 0) {
    return (
      <div style={panelStyle} className={className} data-testid={testId}>
        <div style={emptyStateStyle}>
          <span style={{ fontSize: '24px' }}>📏</span>
          <span>No timing data available</span>
          <span style={{ fontSize: '10px', color: '#475569' }}>
            Run circuit simulation to capture signal traces
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div style={panelStyle} className={className} data-testid={testId}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>
          <span style={{ fontSize: '16px' }}>📏</span>
          <span>Timing Analysis</span>
        </div>
        
        <div style={headerActionsStyle}>
          <ActionButton
            onClick={handleCopyToClipboard}
            title="Copy measurements to clipboard"
          >
            📋 Copy
          </ActionButton>
          
          <ActionButton
            onClick={handleExportCSV}
            variant="primary"
            title="Export timing data as CSV file"
          >
            📥 Export CSV
          </ActionButton>
          
          <ActionButton onClick={handleClose} title="Close panel">
            ✕
          </ActionButton>
        </div>
      </div>
      
      {/* Content */}
      <div style={contentStyle}>
        {/* Time Delta Display */}
        <div style={timeDeltaSectionStyle} data-testid="time-delta-section">
          <div style={timeDeltaTitleStyle}>
            <span>Cursor A → B Time Delta</span>
            {copySuccess && (
              <span style={copySuccessStyle}> ✓ Copied!</span>
            )}
          </div>
          <div style={timeDeltaValueStyle}>
            {formatTimeDelta(absoluteTimeDelta, true)}
          </div>
        </div>
        
        {/* Enhanced Timing Diagram with Cursors */}
        <div>
          <EnhancedTimingDiagram
            traces={traces}
            signalNames={signalNames}
            initialCursorA={initialCursorA}
            initialCursorB={initialCursorB}
            rowHeight={36}
            showZoomControls={true}
            showFrequencyAnalysis={false}
            showAnnotations={true}
            data-testid="enhanced-timing-diagram"
          />
        </div>
        
        {/* Signal Measurements Grid */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Signal Measurements</div>
          <div style={measurementsGridStyle} data-testid="measurements-grid">
            {measurements.map((measurement, index) => (
              <div
                key={measurement.signal}
                style={measurementCardStyle}
                data-testid={`measurement-card-${measurement.signal}`}
              >
                <div style={measurementHeaderStyle}>
                  <span style={signalNameStyle(index)}>{measurement.signal}</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>
                    {measurement.transitions} transitions
                  </span>
                </div>
                
                <div style={measurementRowStyle}>
                  <span>Frequency:</span>
                  <span style={measurementValueStyle}>{measurement.frequency}</span>
                </div>
                
                <div style={measurementRowStyle}>
                  <span>Duty Cycle:</span>
                  <span style={measurementValueStyle}>{measurement.dutyCycle}</span>
                </div>
                
                <div style={measurementRowStyle}>
                  <span>Min Pulse:</span>
                  <span style={measurementValueStyle}>{measurement.minPulse} steps</span>
                </div>
                
                <div style={measurementRowStyle}>
                  <span>Max Pulse:</span>
                  <span style={measurementValueStyle}>{measurement.maxPulse} steps</span>
                </div>
                
                <div style={measurementRowStyle}>
                  <span>Avg Pulse:</span>
                  <span style={measurementValueStyle}>{measurement.avgPulse} steps</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Frequency Summary */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Frequency Summary</div>
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(30, 41, 59, 0.3)',
              borderRadius: '6px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#94a3b8',
            }}
            data-testid="frequency-summary"
          >
            {measurements.map((m) => (
              <div key={m.signal} style={{ padding: '2px 0' }}>
                <span style={{ color: SIGNAL_COLORS.cyan }}>{m.signal}</span>:{' '}
                <span style={{ color: '#e2e8f0' }}>{m.frequency}</span>
                {' | DC: '}
                <span style={{ color: '#e2e8f0' }}>{m.dutyCycle}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default TimingAnalysisPanel;
