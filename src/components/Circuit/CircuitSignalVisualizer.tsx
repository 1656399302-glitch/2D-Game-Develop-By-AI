/**
 * CircuitSignalVisualizer Component
 * 
 * Round 149: Circuit Signal Visualization
 * 
 * Integration component that connects the timing diagram visualization
 * with the existing SimulationPanel. Provides seamless integration
 * into the circuit simulation workflow.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { TimingDiagramPanel } from './TimingDiagramPanel';
import { useSignalTrace } from '../../hooks/useSignalTrace';
import { useSignalTraceStore } from '../../store/signalTraceStore';
import { useSimulationStore } from '../../store/useSimulationStore';

// ============================================================================
// Types
// ============================================================================

/**
 * Circuit signal visualizer props
 */
export interface CircuitSignalVisualizerProps {
  /** Whether the visualizer is enabled */
  isEnabled?: boolean;
  /** Whether to show the panel */
  showPanel?: boolean;
  /** Auto-start recording when simulation runs */
  autoRecord?: boolean;
  /** CSS class for the container */
  className?: string;
  /** Test ID for testing */
  'data-testid'?: string;
}

// ============================================================================
// Styles
// ============================================================================

const containerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '4px 8px',
  backgroundColor: 'rgba(30, 41, 59, 0.6)',
  borderRadius: '6px',
  fontSize: '11px',
  fontFamily: 'monospace',
};

const toggleButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  backgroundColor: 'rgba(51, 65, 85, 0.5)',
  border: '1px solid #334155',
  borderRadius: '4px',
  color: '#94a3b8',
  cursor: 'pointer',
  fontSize: '11px',
  fontFamily: 'monospace',
  transition: 'all 0.2s ease',
};

const activeToggleStyle: React.CSSProperties = {
  ...toggleButtonStyle,
  backgroundColor: 'rgba(14, 165, 233, 0.2)',
  borderColor: '#0ea5e9',
  color: '#0ea5e9',
};

const panelContainerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '100%',
  left: 0,
  right: 0,
  marginBottom: '8px',
  zIndex: 100,
};

// ============================================================================
// Toggle Button Component
// ============================================================================

interface ToggleButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  isActive,
  onClick,
  icon,
  label,
}) => {
  return (
    <button
      onClick={onClick}
      style={isActive ? activeToggleStyle : toggleButtonStyle}
      className={isActive ? 'active' : ''}
      data-testid={`toggle-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

// ============================================================================
// Main Component
// ============================================================================

/**
 * CircuitSignalVisualizer Component
 * Provides signal visualization controls integrated with simulation
 */
export const CircuitSignalVisualizer: React.FC<CircuitSignalVisualizerProps> = ({
  isEnabled = true,
  showPanel = false,
  autoRecord = true,
  className,
  'data-testid': testId,
}) => {
  // Local state
  const [panelVisible, setPanelVisible] = useState(showPanel);
  const [recordOnSimulate, setRecordOnSimulate] = useState(autoRecord);
  
  // Get simulation store state
  const status = useSimulationStore((state) => state.status);
  const stepCount = useSimulationStore((state) => state.stepCount);
  
  // Get signal trace hook
  const {
    traces,
    stepCount: traceStepCount,
    isRecording,
    recordCurrentState,
    clearTraces,
    startRecording,
  } = useSignalTrace({ autoRecord: false });
  
  // Sync panel visibility with prop
  useEffect(() => {
    setPanelVisible(showPanel);
  }, [showPanel]);
  
  // Auto-record when simulation runs (if enabled)
  useEffect(() => {
    if (recordOnSimulate && status === 'running' && stepCount > traceStepCount) {
      recordCurrentState();
    }
  }, [recordOnSimulate, status, stepCount, traceStepCount, recordCurrentState]);
  
  // Toggle panel visibility
  const handleTogglePanel = useCallback(() => {
    setPanelVisible((prev) => !prev);
  }, []);
  
  // Toggle auto-record
  const handleToggleAutoRecord = useCallback(() => {
    setRecordOnSimulate((prev) => !prev);
  }, []);
  
  // Handle manual record
  const handleRecord = useCallback(() => {
    if (!isRecording) {
      startRecording();
    }
    recordCurrentState();
  }, [isRecording, startRecording, recordCurrentState]);
  
  // Handle clear
  const handleClear = useCallback(() => {
    clearTraces();
  }, [clearTraces]);
  
  // Don't render if disabled
  if (!isEnabled) {
    return null;
  }
  
  return (
    <div
      style={containerStyle}
      className={`circuit-signal-visualizer ${className || ''}`}
      data-testid={testId || 'circuit-signal-visualizer'}
    >
      {/* Toolbar */}
      <div style={toolbarStyle}>
        <span style={{ color: '#64748b', marginRight: '4px' }}>📊</span>
        
        <ToggleButton
          isActive={panelVisible}
          onClick={handleTogglePanel}
          icon="📈"
          label="波形"
        />
        
        <ToggleButton
          isActive={recordOnSimulate}
          onClick={handleToggleAutoRecord}
          icon="⏺"
          label="自动录制"
        />
        
        <div style={{ flex: 1 }} />
        
        <button
          onClick={handleRecord}
          style={{
            padding: '4px 8px',
            backgroundColor: '#22c55e',
            border: 'none',
            borderRadius: '4px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'monospace',
          }}
          data-testid="record-button"
          title="记录当前状态"
        >
          记录
        </button>
        
        <button
          onClick={handleClear}
          style={{
            padding: '4px 8px',
            backgroundColor: '#ef4444',
            border: 'none',
            borderRadius: '4px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'monospace',
          }}
          data-testid="clear-button"
          title="清空波形"
        >
          清空
        </button>
        
        {/* Status indicator */}
        <span style={{ color: '#64748b' }}>
          {traces.length > 0 && (
            <>
              {traces.length} 步
              {isRecording && (
                <span style={{ color: '#22c55e', marginLeft: '4px' }}>●</span>
              )}
            </>
          )}
        </span>
      </div>
      
      {/* Panel (conditionally rendered) */}
      {panelVisible && (
        <div style={panelContainerStyle}>
          <TimingDiagramPanel
            isVisible={true}
            autoRecord={recordOnSimulate}
            maxDisplaySteps={50}
            data-testid="timing-diagram-panel-integrated"
          />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Compact Version for Integration
// ============================================================================

/**
 * Compact visualizer for toolbar integration
 */
export const CompactSignalVisualizer: React.FC<{
  onOpenFullView?: () => void;
}> = ({
  onOpenFullView,
}) => {
  const traces = useSignalTraceStore((state) => state.traces);
  const isRecording = useSignalTraceStore((state) => state.metadata.isRecording);
  
  return (
    <button
      onClick={onOpenFullView}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid #334155',
        borderRadius: '6px',
        color: '#94a3b8',
        cursor: 'pointer',
        fontSize: '11px',
        fontFamily: 'monospace',
      }}
      data-testid="compact-signal-visualizer"
    >
      <span>📊</span>
      <span>波形</span>
      {traces.length > 0 && (
        <span style={{ color: '#22c55e' }}>({traces.length})</span>
      )}
      {isRecording && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            animation: 'pulse 1s infinite',
          }}
        />
      )}
    </button>
  );
};

// ============================================================================
// Export
// ============================================================================

export default CircuitSignalVisualizer;
