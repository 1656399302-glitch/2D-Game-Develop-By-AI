/**
 * Simulation Panel Component
 * 
 * Round 121: Circuit Simulation Engine
 * 
 * Control panel for circuit simulation with Run, Reset, and Step buttons.
 */

import React, { useCallback } from 'react';
import { SimulationStatus, SimulationPanelProps } from '../../types/circuit';

// ============================================================================
// Styles
// ============================================================================

const panelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px',
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  borderRadius: '12px',
  border: '1px solid #334155',
  minWidth: '200px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  paddingBottom: '8px',
  borderBottom: '1px solid #334155',
};

const titleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  fontFamily: 'monospace',
  color: '#e2e8f0',
};

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const statusBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  backgroundColor: 'rgba(51, 65, 85, 0.5)',
  borderRadius: '6px',
  fontSize: '12px',
  fontFamily: 'monospace',
};

// ============================================================================
// Button Component
// ============================================================================

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant: 'run' | 'reset' | 'step';
  children: React.ReactNode;
}

const SimulationButton: React.FC<ButtonProps> = ({
  onClick,
  disabled = false,
  variant,
  children,
}) => {
  const variants = {
    run: {
      bg: '#0ea5e9',
      hover: '#0284c7',
      text: '#ffffff',
    },
    reset: {
      bg: '#ef4444',
      hover: '#dc2626',
      text: '#ffffff',
    },
    step: {
      bg: '#8b5cf6',
      hover: '#7c3aed',
      text: '#ffffff',
    },
  };
  
  const style = variants[variant];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
      style={{
        backgroundColor: style.bg,
        color: style.text,
      }}
      data-button={variant}
      data-run-button={variant === 'run' ? true : undefined}
      data-reset-button={variant === 'reset' ? true : undefined}
      data-step-button={variant === 'step' ? true : undefined}
    >
      {children}
    </button>
  );
};

// ============================================================================
// Status Indicator Component
// ============================================================================

interface StatusIndicatorProps {
  status: SimulationStatus;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const statusConfig = {
    idle: { color: '#64748b', label: '待机', icon: '⏸' },
    running: { color: '#22c55e', label: '运行中', icon: '▶' },
    paused: { color: '#eab308', label: '已暂停', icon: '⏸' },
    completed: { color: '#0ea5e9', label: '完成', icon: '✓' },
  };
  
  const config = statusConfig[status];
  
  return (
    <div
      className="flex items-center gap-2"
      data-status={status}
    >
      <span
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: config.color }}
        data-status-dot
      />
      <span style={{ color: config.color }}>
        {config.icon} {config.label}
      </span>
    </div>
  );
};

// ============================================================================
// Main Panel Component
// ============================================================================

/**
 * Simulation Panel Component
 * Control panel with Run, Reset, and Step buttons
 */
export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  isRunning,
  onRun,
  onReset,
  onStep,
  stepCount = 0,
}) => {
  // Handle Run button click
  const handleRun = useCallback(() => {
    onRun();
  }, [onRun]);
  
  // Handle Reset button click
  const handleReset = useCallback(() => {
    onReset();
  }, [onReset]);
  
  // Handle Step button click
  const handleStep = useCallback(() => {
    onStep?.();
  }, [onStep]);
  
  return (
    <div
      style={panelStyle}
      className="shadow-xl"
      data-testid="simulation-panel"
    >
      {/* Header */}
      <div style={headerStyle}>
        <span style={{ fontSize: '16px' }}>⚡</span>
        <span style={titleStyle}>电路模拟</span>
      </div>
      
      {/* Status Bar */}
      <div style={statusBarStyle} data-status-bar>
        <StatusIndicator status={isRunning ? 'running' : 'idle'} />
        <span className="text-gray-400">
          步数: <span className="text-cyan-400" data-step-count>{stepCount}</span>
        </span>
      </div>
      
      {/* Control Buttons */}
      <div style={buttonGroupStyle}>
        <SimulationButton
          onClick={handleRun}
          variant="run"
          disabled={isRunning}
        >
          ▶ 运行
        </SimulationButton>
        
        <SimulationButton
          onClick={handleReset}
          variant="reset"
        >
          ↺ 重置
        </SimulationButton>
        
        {onStep && (
          <SimulationButton
            onClick={handleStep}
            variant="step"
          >
            ⏭ 单步
          </SimulationButton>
        )}
      </div>
      
      {/* Keyboard shortcuts hint */}
      <div className="text-[10px] text-gray-500 text-center">
        快捷键: R = 运行, X = 重置
      </div>
    </div>
  );
};

// ============================================================================
// Compact Version
// ============================================================================

/**
 * Compact simulation controls for toolbar
 */
export const SimulationControls: React.FC<SimulationPanelProps> = ({
  isRunning,
  onRun,
  onReset,
  onStep,
  stepCount = 0,
}) => {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900/80 rounded-lg border border-gray-700"
      data-testid="simulation-controls"
    >
      {/* Status dot */}
      <div
        className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}
        data-status-dot
      />
      
      {/* Run button */}
      <button
        onClick={onRun}
        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded transition-colors"
        data-run-button
        title="运行 (R)"
      >
        ▶
      </button>
      
      {/* Reset button */}
      <button
        onClick={onReset}
        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded transition-colors"
        data-reset-button
        title="重置 (X)"
      >
        ↺
      </button>
      
      {/* Step button (optional) */}
      {onStep && (
        <button
          onClick={onStep}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded transition-colors"
          data-step-button
          title="单步"
        >
          ⏭
        </button>
      )}
      
      {/* Step count */}
      <span className="text-[10px] text-gray-400 font-mono ml-1">
        {stepCount}
      </span>
    </div>
  );
};

// ============================================================================
// Full Panel with Circuit Info
// ============================================================================

interface FullSimulationPanelProps extends SimulationPanelProps {
  nodeCount?: number;
  connectionCount?: number;
  activeSignals?: number;
}

/**
 * Full simulation panel with circuit statistics
 */
export const FullSimulationPanel: React.FC<FullSimulationPanelProps> = ({
  isRunning,
  onRun,
  onReset,
  onStep,
  stepCount = 0,
  nodeCount = 0,
  connectionCount = 0,
  activeSignals = 0,
}) => {
  return (
    <div
      style={panelStyle}
      className="shadow-xl"
      data-testid="full-simulation-panel"
    >
      {/* Header */}
      <div style={headerStyle}>
        <span style={{ fontSize: '16px' }}>⚡</span>
        <span style={titleStyle}>电路模拟</span>
        <StatusIndicator status={isRunning ? 'running' : 'idle'} />
      </div>
      
      {/* Circuit Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-gray-800/50 rounded" data-stat="nodes">
          <div className="text-lg font-bold text-cyan-400">{nodeCount}</div>
          <div className="text-[10px] text-gray-400">节点</div>
        </div>
        <div className="p-2 bg-gray-800/50 rounded" data-stat="connections">
          <div className="text-lg font-bold text-purple-400">{connectionCount}</div>
          <div className="text-[10px] text-gray-400">连接</div>
        </div>
        <div className="p-2 bg-gray-800/50 rounded" data-stat="signals">
          <div className="text-lg font-bold text-green-400">{activeSignals}</div>
          <div className="text-[10px] text-gray-400">HIGH</div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div style={statusBarStyle}>
        <span className="text-gray-400">执行步数</span>
        <span className="text-cyan-400 font-mono">{stepCount}</span>
      </div>
      
      {/* Control Buttons */}
      <div style={buttonGroupStyle}>
        <SimulationButton
          onClick={onRun}
          variant="run"
          disabled={isRunning}
        >
          ▶ 运行
        </SimulationButton>
        
        <SimulationButton
          onClick={onReset}
          variant="reset"
        >
          ↺ 重置
        </SimulationButton>
        
        {onStep && (
          <SimulationButton
            onClick={onStep}
            variant="step"
          >
            ⏭ 单步
          </SimulationButton>
        )}
      </div>
    </div>
  );
};

export default SimulationPanel;
