/**
 * Validation Status Bar Component
 * 
 * Round 113: Circuit Validation UI Integration
 * 
 * Real-time circuit health indicator in the editor header
 */

import React, { useCallback, useMemo } from 'react';
import { useCircuitValidation } from '../../hooks/useCircuitValidation';
import { useMachineStore } from '../../store/useMachineStore';

// ============================================================================
// Styles
// ============================================================================

const statusBarStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    userSelect: 'none',
  },
  valid: {
    background: 'rgba(80, 250, 123, 0.1)',
    border: '1px solid rgba(80, 250, 123, 0.3)',
    color: '#50fa7b',
  },
  invalid: {
    background: 'rgba(233, 69, 96, 0.1)',
    border: '1px solid rgba(233, 69, 96, 0.3)',
    color: '#e94560',
  },
  warning: {
    background: 'rgba(255, 193, 7, 0.1)',
    border: '1px solid rgba(255, 193, 7, 0.3)',
    color: '#ffc107',
  },
  empty: {
    background: 'rgba(156, 163, 175, 0.1)',
    border: '1px solid rgba(156, 163, 175, 0.2)',
    color: '#9ca3af',
  },
  icon: {
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
  },
  text: {
    fontFamily: '"Noto Sans SC", sans-serif',
  },
  count: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontFamily: 'monospace',
  },
  separator: {
    width: '1px',
    height: '16px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '0 4px',
  },
  tooltip: {
    position: 'absolute',
    top: '100%',
    left: '0',
    marginTop: '8px',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    border: '1px solid',
    borderRadius: '8px',
    padding: '12px',
    minWidth: '200px',
    maxWidth: '300px',
    zIndex: 200,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
  },
  tooltipHeader: {
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  tooltipItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '6px 0',
    fontSize: '11px',
    lineHeight: 1.4,
  },
  tooltipIcon: {
    fontSize: '14px',
    flexShrink: 0,
  },
  tooltipContent: {
    flex: 1,
  },
  tooltipCode: {
    fontFamily: 'monospace',
    fontSize: '10px',
    opacity: 0.7,
    marginTop: '2px',
  },
};

// ============================================================================
// Types
// ============================================================================

interface ValidationStatusBarProps {
  /** Whether to show detailed tooltip on hover */
  showTooltip?: boolean;
  /** Additional class name */
  className?: string;
  /** On click handler */
  onClick?: () => void;
}

// ============================================================================
// Component Implementation
// ============================================================================

export const ValidationStatusBar: React.FC<ValidationStatusBarProps> = ({
  showTooltip = true,
  className = '',
  onClick,
}) => {
  const modules = useMachineStore((state) => state.modules);
  const { isValid, errors, warnings, validate } = useCircuitValidation();
  const [showDetails, setShowDetails] = React.useState(false);

  const isEmpty = modules.length === 0;
  
  // Get the most severe status
  const status = useMemo(() => {
    if (isEmpty) {
      return 'empty' as const;
    }
    if (!isValid) {
      return 'invalid' as const;
    }
    if (warnings.length > 0) {
      return 'warning' as const;
    }
    return 'valid' as const;
  }, [isEmpty, isValid, warnings.length]);

  const statusStyle = statusBarStyles[status];
  const totalIssues = errors.length + warnings.length;

  // Get status text
  const statusText = useMemo(() => {
    if (isEmpty) {
      return '等待添加模块';
    }
    if (status === 'valid') {
      return '✓ 电路正常';
    }
    if (status === 'warning') {
      return `⚠ ${totalIssues} 个警告`;
    }
    return `⚠ ${totalIssues} 个问题`;
  }, [isEmpty, status, totalIssues]);

  // Get icon
  const statusIcon = useMemo(() => {
    if (isEmpty) return '⏳';
    if (status === 'valid') return '✓';
    if (status === 'warning') return '⚠';
    return '✗';
  }, [isEmpty, status]);

  // Handle click to trigger validation
  const handleClick = useCallback(() => {
    validate();
    onClick?.();
  }, [validate, onClick]);

  // Handle mouse enter for tooltip
  const handleMouseEnter = useCallback(() => {
    if (showTooltip) {
      setShowDetails(true);
    }
  }, [showTooltip]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setShowDetails(false);
  }, []);

  return (
    <div className={`validation-status-bar ${className}`}>
      <div
        style={{
          ...statusBarStyles.container,
          ...statusStyle,
          position: 'relative',
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="status"
        aria-live="polite"
        aria-label={statusText}
        data-validation-status={status}
        data-error-count={errors.length}
        data-warning-count={warnings.length}
      >
        {/* Icon */}
        <span style={statusBarStyles.icon}>{statusIcon}</span>
        
        {/* Text */}
        <span style={statusBarStyles.text}>{statusText}</span>
        
        {/* Count badge (if there are issues) */}
        {totalIssues > 0 && (
          <>
            <span style={statusBarStyles.separator} />
            <span style={statusBarStyles.count}>
              {errors.length > 0 && `错误: ${errors.length}`}
              {errors.length > 0 && warnings.length > 0 && ' | '}
              {warnings.length > 0 && `警告: ${warnings.length}`}
            </span>
          </>
        )}

        {/* Detailed tooltip */}
        {showDetails && !isEmpty && (
          <div style={statusBarStyles.tooltip}>
            <div 
              style={{
                ...statusBarStyles.tooltipHeader,
                color: status === 'valid' ? '#50fa7b' : status === 'warning' ? '#ffc107' : '#e94560',
              }}
            >
              {status === 'valid' ? '电路验证通过' : status === 'warning' ? '电路警告' : '电路问题'}
            </div>
            
            {/* Errors */}
            {errors.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', color: '#e94560', marginBottom: '4px', fontWeight: 'bold' }}>
                  错误
                </div>
                {errors.map((error, index) => (
                  <div key={`error-${index}`} style={statusBarStyles.tooltipItem}>
                    <span style={statusBarStyles.tooltipIcon}>❌</span>
                    <div style={statusBarStyles.tooltipContent}>
                      <div>{error.message}</div>
                      <div style={statusBarStyles.tooltipCode}>{error.code}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Warnings */}
            {warnings.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', color: '#ffc107', marginBottom: '4px', fontWeight: 'bold' }}>
                  警告
                </div>
                {warnings.map((warning, index) => (
                  <div key={`warning-${index}`} style={statusBarStyles.tooltipItem}>
                    <span style={statusBarStyles.tooltipIcon}>⚠️</span>
                    <div style={statusBarStyles.tooltipContent}>
                      <div>{warning.message}</div>
                      {warning.suggestion && (
                        <div style={{ color: '#50fa7b', marginTop: '2px' }}>
                          💡 {warning.suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Valid state */}
            {isValid && warnings.length === 0 && (
              <div style={{ ...statusBarStyles.tooltipItem, color: '#50fa7b' }}>
                <span style={statusBarStyles.tooltipIcon}>✅</span>
                <div style={statusBarStyles.tooltipContent}>
                  电路结构完整，能量可以正常流动
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Export Default
// ============================================================================

export default ValidationStatusBar;
