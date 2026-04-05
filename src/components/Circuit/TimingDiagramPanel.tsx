/**
 * TimingDiagramPanel Component
 * 
 * Round 149: Circuit Signal Visualization
 * 
 * Panel component that integrates the timing diagram into the
 * simulation UI. Provides controls for recording, clearing, and
 * viewing signal traces.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { TimingDiagram } from './TimingDiagram';
import { useSignalTrace } from '../../hooks/useSignalTrace';

// ============================================================================
// Types
// ============================================================================

/**
 * Timing diagram panel props
 */
export interface TimingDiagramPanelProps {
  /** Whether the panel is visible */
  isVisible?: boolean;
  /** Whether to auto-start recording when simulation runs */
  autoRecord?: boolean;
  /** Maximum traces to display */
  maxDisplaySteps?: number;
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

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const contentStyle: React.CSSProperties = {
  padding: '12px',
  minHeight: '200px',
  maxHeight: '400px',
  overflow: 'auto',
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 16px',
  backgroundColor: 'rgba(30, 41, 59, 0.5)',
  borderTop: '1px solid #334155',
  fontSize: '11px',
  fontFamily: 'monospace',
  color: '#94a3b8',
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

// ============================================================================
// Button Component
// ============================================================================

interface PanelButtonProps {
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  children: React.ReactNode;
}

const PanelButton: React.FC<PanelButtonProps> = ({
  onClick,
  variant,
  disabled = false,
  children,
}) => {
  const colors = {
    primary: { bg: '#0ea5e9', hover: '#0284c7' },
    secondary: { bg: '#475569', hover: '#64748b' },
    danger: { bg: '#ef4444', hover: '#dc2626' },
  };
  
  const style = colors[variant];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: style.bg,
        color: '#ffffff',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = style.hover)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = style.bg)}
    >
      {children}
    </button>
  );
};

// ============================================================================
// Main Component
// ============================================================================

/**
 * TimingDiagramPanel Component
 * Panel with timing diagram and recording controls
 */
export const TimingDiagramPanel: React.FC<TimingDiagramPanelProps> = ({
  isVisible = true,
  maxDisplaySteps = 50,
  className,
  'data-testid': testId,
}) => {
  // Track recording state locally for button display
  const [localIsRecording, setLocalIsRecording] = useState(false);
  
  // Get signal trace hook
  const {
    traces,
    stepCount,
    isRecording,
    recordCurrentState,
    clearTraces,
    startRecording,
    stopRecording,
  } = useSignalTrace({ autoRecord: false }); // We control recording manually
  
  // Get visible traces (limited)
  const visibleTraces = useMemo(() => {
    return traces.slice(-maxDisplaySteps);
  }, [traces, maxDisplaySteps]);
  
  // Extract unique signal names from traces
  const signalNames = useMemo(() => {
    const names = new Set<string>();
    
    for (const trace of visibleTraces) {
      for (const key of Object.keys(trace.signals)) {
        // Skip ID-based keys
        if (!key.startsWith('input-') && !key.startsWith('gate-') && !key.startsWith('output-')) {
          names.add(key);
        }
      }
    }
    
    return Array.from(names);
  }, [visibleTraces]);
  
  // Handle start recording
  const handleStartRecording = useCallback(() => {
    startRecording();
    setLocalIsRecording(true);
  }, [startRecording]);
  
  // Handle stop recording
  const handleStopRecording = useCallback(() => {
    stopRecording();
    setLocalIsRecording(false);
  }, [stopRecording]);
  
  // Handle record current state
  const handleRecord = useCallback(() => {
    if (!isRecording) {
      startRecording();
      setLocalIsRecording(true);
    }
    recordCurrentState();
  }, [isRecording, startRecording, recordCurrentState]);
  
  // Handle clear traces
  const handleClear = useCallback(() => {
    clearTraces();
    setLocalIsRecording(false);
  }, [clearTraces]);
  
  // Don't render if not visible
  if (!isVisible) {
    return null;
  }
  
  return (
    <div
      style={panelStyle}
      className={`timing-diagram-panel ${className || ''}`}
      data-testid={testId || 'timing-diagram-panel'}
    >
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>
          <span style={{ fontSize: '16px' }}>📊</span>
          <span>波形图</span>
          {localIsRecording && (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                animation: 'pulse 1s infinite',
              }}
            />
          )}
        </div>
        
        <div style={buttonGroupStyle}>
          {!localIsRecording ? (
            <PanelButton onClick={handleStartRecording} variant="primary">
              ⏺ 录制
            </PanelButton>
          ) : (
            <PanelButton onClick={handleStopRecording} variant="secondary">
              ⏹ 停止
            </PanelButton>
          )}
          
          <PanelButton onClick={handleRecord} variant="secondary">
            📝 记录当前
          </PanelButton>
          
          <PanelButton onClick={handleClear} variant="danger">
            🗑 清空
          </PanelButton>
        </div>
      </div>
      
      {/* Content */}
      <div style={contentStyle}>
        {visibleTraces.length === 0 ? (
          <div style={emptyStateStyle}>
            <span style={{ fontSize: '24px' }}>📈</span>
            <span>暂无波形数据</span>
            <span style={{ fontSize: '10px', color: '#475569' }}>
              运行模拟并点击"记录当前"来捕获信号
            </span>
          </div>
        ) : (
          <TimingDiagram
            traces={visibleTraces}
            signalNames={signalNames}
            width={550}
            rowHeight={36}
            data-testid="timing-diagram"
          />
        )}
      </div>
      
      {/* Footer */}
      <div style={footerStyle}>
        <span>
          步数: <span style={{ color: '#22c55e' }}>{stepCount}</span>
        </span>
        <span>
          信号: <span style={{ color: '#22c55e' }}>{signalNames.length}</span>
        </span>
        <span>
          {localIsRecording ? (
            <span style={{ color: '#22c55e' }}>● 录制中</span>
          ) : (
            <span style={{ color: '#64748b' }}>○ 待机</span>
          )}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// Export
// ============================================================================

export default TimingDiagramPanel;
