/**
 * Circuit Validation Overlay Component
 * 
 * Round 112: Advanced Circuit Validation System
 * 
 * This component displays validation results before activation,
 * showing errors with actionable messages and hints.
 */

import React, { useCallback, useEffect } from 'react';
import { useCircuitValidation, useValidationOverlay } from '../../hooks/useCircuitValidation';
import { ValidationError, ValidationWarning } from '../../types/circuitValidation';
import { useMachineStore } from '../../store/useMachineStore';
import { ModuleType } from '../../types';

// ============================================================================
// Styles
// ============================================================================

const overlayStyles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    animation: 'fadeIn 0.2s ease-out',
  },
  container: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '12px',
    border: '2px solid #e94560',
    boxShadow: '0 0 40px rgba(233, 69, 96, 0.3), inset 0 0 60px rgba(0, 0, 0, 0.5)',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'hidden',
    animation: 'slideIn 0.3s ease-out',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(233, 69, 96, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerIcon: {
    fontSize: '28px',
    color: '#e94560',
    filter: 'drop-shadow(0 0 8px rgba(233, 69, 96, 0.6))',
  },
  headerTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#e94560',
    textShadow: '0 0 10px rgba(233, 69, 96, 0.5)',
    fontFamily: '"Noto Serif SC", serif',
  },
  content: {
    padding: '20px',
    overflowY: 'auto',
    maxHeight: 'calc(80vh - 140px)',
  },
  errorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  errorItem: {
    background: 'rgba(233, 69, 96, 0.1)',
    border: '1px solid rgba(233, 69, 96, 0.3)',
    borderRadius: '8px',
    padding: '14px',
  },
  errorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  errorCode: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#e94560',
    background: 'rgba(233, 69, 96, 0.2)',
    padding: '2px 8px',
    borderRadius: '4px',
    fontFamily: 'monospace',
  },
  errorMessage: {
    fontSize: '14px',
    color: '#f8f8f2',
    marginBottom: '8px',
    lineHeight: 1.5,
  },
  fixSuggestion: {
    fontSize: '12px',
    color: '#50fa7b',
    background: 'rgba(80, 250, 123, 0.1)',
    padding: '8px 10px',
    borderRadius: '4px',
    borderLeft: '3px solid #50fa7b',
  },
  fixLabel: {
    fontWeight: 'bold',
    marginRight: '6px',
    color: '#50fa7b',
  },
  warningList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '16px',
  },
  warningItem: {
    background: 'rgba(255, 193, 7, 0.1)',
    border: '1px solid rgba(255, 193, 7, 0.3)',
    borderRadius: '8px',
    padding: '12px',
  },
  warningHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  warningIcon: {
    fontSize: '16px',
  },
  warningCode: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#ffc107',
    background: 'rgba(255, 193, 7, 0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
  },
  warningMessage: {
    fontSize: '13px',
    color: '#f8f8f2',
    lineHeight: 1.4,
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(233, 69, 96, 0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },
  dismissButton: {
    flex: 1,
    padding: '12px 20px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'transparent',
    color: '#f8f8f2',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Noto Sans SC", sans-serif',
  },
  proceedButton: {
    flex: 1,
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #e94560 0%, #ff6b6b 100%)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Noto Sans SC", sans-serif',
    boxShadow: '0 4px 15px rgba(233, 69, 96, 0.4)',
  },
};

// ============================================================================
// Error Icon Component
// ============================================================================

const ErrorIcon: React.FC<{ code: string }> = ({ code }) => {
  const iconMap: Record<string, string> = {
    'CIRCUIT_INCOMPLETE': '⚡',
    'LOOP_DETECTED': '🔄',
    'ISLAND_MODULES': '🏝️',
    'UNREACHABLE_OUTPUT': '❌',
  };
  
  return <span>{iconMap[code] || '⚠️'}</span>;
};

// ============================================================================
// Validation Error Item Component
// ============================================================================

interface ValidationErrorItemProps {
  error: ValidationError;
  modules: Array<{ instanceId: string; type: ModuleType }>;
}

const ValidationErrorItem: React.FC<ValidationErrorItemProps> = ({ error, modules }) => {
  // Get affected module names
  const affectedModules = error.affectedModuleIds
    .map(id => modules.find(m => m.instanceId === id))
    .filter(Boolean)
    .map(m => m!.type);

  return (
    <div style={overlayStyles.errorItem}>
      <div style={overlayStyles.errorHeader}>
        <ErrorIcon code={error.code} />
        <span style={overlayStyles.errorCode}>{error.code}</span>
      </div>
      <div style={overlayStyles.errorMessage}>{error.message}</div>
      {error.fixSuggestion && (
        <div style={overlayStyles.fixSuggestion}>
          <span style={overlayStyles.fixLabel}>💡 修复建议:</span>
          {error.fixSuggestion}
        </div>
      )}
      {affectedModules.length > 0 && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(248, 248, 242, 0.6)' }}>
          涉及模块: {affectedModules.join(', ')}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Validation Warning Item Component
// ============================================================================

interface ValidationWarningItemProps {
  warning: ValidationWarning;
}

const ValidationWarningItem: React.FC<ValidationWarningItemProps> = ({ warning }) => {
  return (
    <div style={overlayStyles.warningItem}>
      <div style={overlayStyles.warningHeader}>
        <span style={overlayStyles.warningIcon}>⚠️</span>
        <span style={overlayStyles.warningCode}>{warning.code}</span>
      </div>
      <div style={overlayStyles.warningMessage}>{warning.message}</div>
      {warning.suggestion && (
        <div style={{ marginTop: '6px', fontSize: '12px', color: '#50fa7b' }}>
          建议: {warning.suggestion}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Main Circuit Validation Overlay Component
// ============================================================================

export const CircuitValidationOverlay: React.FC = () => {
  const { visible, errors, warnings, onDismiss, onProceedAnyway } = useValidationOverlay();
  const modules = useMachineStore((state) => state.modules);
  
  // Handle proceed anyway
  const handleProceedAnyway = useCallback(() => {
    if (onProceedAnyway) {
      onProceedAnyway();
    }
  }, [onProceedAnyway]);

  // Handle activation attempt when overlay is dismissed
  const handleDismissAndActivate = useCallback(() => {
    onDismiss();
    // Don't automatically start activation, just dismiss overlay
  }, [onDismiss]);

  // Add CSS animations
  useEffect(() => {
    const styleId = 'circuit-validation-overlay-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .circuit-overlay-dismiss:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }
        .circuit-overlay-proceed:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(233, 69, 96, 0.5) !important;
        }
        .circuit-overlay-proceed:active {
          transform: translateY(0);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div style={overlayStyles.backdrop} onClick={handleDismissAndActivate}>
      <div style={overlayStyles.container} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={overlayStyles.header}>
          <span style={overlayStyles.headerIcon}>⚠️</span>
          <h2 style={overlayStyles.headerTitle}>电路验证失败</h2>
        </div>

        {/* Content */}
        <div style={overlayStyles.content}>
          {/* Errors */}
          {errors.length > 0 && (
            <div style={overlayStyles.errorList}>
              {errors.map((error, index) => (
                <ValidationErrorItem
                  key={`${error.code}-${index}`}
                  error={error}
                  modules={modules}
                />
              ))}
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div style={overlayStyles.warningList}>
              <div style={{ fontSize: '13px', color: '#ffc107', fontWeight: 'bold', marginBottom: '8px' }}>
                警告 (非阻塞)
              </div>
              {warnings.map((warning, index) => (
                <ValidationWarningItem
                  key={`${warning.code}-${index}`}
                  warning={warning}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={overlayStyles.footer}>
          <button
            className="circuit-overlay-dismiss"
            style={overlayStyles.dismissButton}
            onClick={handleDismissAndActivate}
          >
            取消
          </button>
          {onProceedAnyway && (
            <button
              className="circuit-overlay-proceed"
              style={overlayStyles.proceedButton}
              onClick={handleProceedAnyway}
            >
              强制激活
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Compact Inline Validation Indicator (for use in toolbar)
// ============================================================================

interface ValidationIndicatorProps {
  className?: string;
}

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({ className }) => {
  const { isValid, errors, validate } = useCircuitValidation();

  // Get the most severe error code
  const primaryError = errors[0];
  
  const indicatorStyles: Record<string, React.CSSProperties> = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 10px',
      borderRadius: '6px',
      background: isValid 
        ? 'rgba(80, 250, 123, 0.1)' 
        : 'rgba(233, 69, 96, 0.1)',
      border: `1px solid ${isValid ? 'rgba(80, 250, 123, 0.3)' : 'rgba(233, 69, 96, 0.3)'}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    icon: {
      fontSize: '14px',
    },
    text: {
      fontSize: '12px',
      fontWeight: 'bold',
      color: isValid ? '#50fa7b' : '#e94560',
    },
  };

  return (
    <div
      style={indicatorStyles.container}
      className={className}
      onClick={validate}
      title={isValid ? '电路验证通过' : primaryError?.message}
    >
      <span style={indicatorStyles.icon}>
        {isValid ? '✅' : '❌'}
      </span>
      <span style={indicatorStyles.text}>
        {isValid ? '验证通过' : '验证失败'}
      </span>
    </div>
  );
};

export default CircuitValidationOverlay;
