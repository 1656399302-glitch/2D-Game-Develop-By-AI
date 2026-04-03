/**
 * Module Validation Badge Component
 * 
 * Round 113: Circuit Validation UI Integration
 * 
 * Displays validation status badges on modules showing error/warning states
 */

import React, { useState, useCallback } from 'react';

// ============================================================================
// Styles
// ============================================================================

const badgeStyles: Record<string, React.CSSProperties> = {
  errorBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)',
    border: '2px solid #0a0e17',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(233, 69, 96, 0.5)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  warningBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
    border: '2px solid #0a0e17',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(255, 193, 7, 0.5)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  tooltip: {
    position: 'absolute',
    top: '-40px',
    right: '-8px',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    border: '1px solid rgba(233, 69, 96, 0.5)',
    borderRadius: '6px',
    padding: '6px 10px',
    minWidth: '150px',
    maxWidth: '250px',
    zIndex: 200,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
  },
  tooltipTitle: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: '4px',
    fontFamily: 'monospace',
  },
  tooltipMessage: {
    fontSize: '11px',
    color: '#f8f8f2',
    lineHeight: 1.4,
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: '-6px',
    right: '10px',
    width: '0',
    height: '0',
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid rgba(233, 69, 96, 0.5)',
  },
};

// ============================================================================
// Types
// ============================================================================

interface ModuleValidationBadgeProps {
  /** Error state */
  hasError: boolean;
  /** Warning state */
  hasWarning: boolean;
  /** Error code if any */
  errorCode?: string;
  /** Error message */
  errorMessage?: string;
  /** Click handler to show quick fix menu */
  onClick?: () => void;
  /** Whether the badge should pulse */
  pulse?: boolean;
  /** Additional class name */
  className?: string;
}

// ============================================================================
// Component Implementation
// ============================================================================

export const ModuleValidationBadge: React.FC<ModuleValidationBadgeProps> = ({
  hasError,
  hasWarning,
  errorCode,
  errorMessage,
  onClick,
  pulse = false,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Don't render if no issues
  if (!hasError && !hasWarning) {
    return null;
  }

  const handleMouseEnter = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  }, [onClick]);

  const badgeStyle = hasError ? badgeStyles.errorBadge : badgeStyles.warningBadge;
  const icon = hasError ? '!' : '⚠';

  return (
    <div 
      className={`module-validation-badge ${className}`}
      style={badgeStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="button"
      aria-label={hasError ? `错误: ${errorCode}` : '警告'}
      title={errorMessage}
      data-validation-badge={hasError ? 'error' : 'warning'}
      data-error-code={errorCode}
    >
      {/* Pulse animation for cycles */}
      {pulse && (
        <style>
          {`
            @keyframes validation-pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.8; }
            }
            .module-validation-badge[data-pulse="true"] {
              animation: validation-pulse 1.5s ease-in-out infinite;
            }
          `}
        </style>
      )}
      
      <span 
        style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
        data-pulse={pulse}
      >
        {icon}
      </span>
      
      {/* Tooltip */}
      {showTooltip && (
        <div style={badgeStyles.tooltip}>
          {errorCode && (
            <div style={badgeStyles.tooltipTitle}>
              {errorCode}
            </div>
          )}
          {errorMessage && (
            <div style={badgeStyles.tooltipMessage}>
              {errorMessage}
            </div>
          )}
          <div style={badgeStyles.tooltipArrow} />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Validation Border Component
// ============================================================================

interface ValidationBorderProps {
  /** Border type based on validation issue */
  borderType: 'none' | 'isolated' | 'cycle' | 'unreachable-output';
  /** Children to wrap */
  children: React.ReactNode;
  /** Additional style */
  style?: React.CSSProperties;
}

/**
 * Component that adds validation-related borders to modules
 */
export const ValidationBorder: React.FC<ValidationBorderProps> = ({
  borderType,
  children,
  style = {},
}) => {
  if (borderType === 'none') {
    return <>{children}</>;
  }

  const borderStyles: Record<string, React.CSSProperties> = {
    isolated: {
      border: '2px dashed #e94560',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(233, 69, 96, 0.3)',
    },
    cycle: {
      border: '2px solid #ff9800',
      borderRadius: '8px',
      boxShadow: '0 0 15px rgba(255, 152, 0, 0.5)',
      animation: 'cycle-border-pulse 2s ease-in-out infinite',
    },
    'unreachable-output': {
      border: '2px dashed #ffc107',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(255, 193, 7, 0.3)',
    },
  };

  return (
    <>
      <style>
        {`
          @keyframes cycle-border-pulse {
            0%, 100% { 
              border-color: #ff9800;
              box-shadow: 0 0 10px rgba(255, 152, 0, 0.4);
            }
            50% { 
              border-color: #ffb74d;
              box-shadow: 0 0 20px rgba(255, 152, 0, 0.6);
            }
          }
        `}
      </style>
      <div style={{ ...borderStyles[borderType], ...style, position: 'relative' }}>
        {children}
      </div>
    </>
  );
};

// ============================================================================
// Export Default
// ============================================================================

export default ModuleValidationBadge;
