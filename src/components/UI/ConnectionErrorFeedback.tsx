import { useEffect, useState, useCallback } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { 
  ConnectionErrorType, 
  CONNECTION_ERROR_MESSAGES 
} from '../../types/aiIntegration';

type SeverityLevel = 'error' | 'warning' | 'info';

/**
 * Improved Connection Error Toast with specific guidance
 * 
 * Provides detailed error messages and suggestions for fixing
 * connection issues between modules.
 * 
 * WCAG 2.1 AA Compliance:
 * - Uses role="alert" for immediate announcement to screen readers
 * - Includes specific, actionable guidance
 * - Visual differentiation for error severity
 */
export function ConnectionErrorFeedback() {
  const connectionError = useMachineStore((state) => state.connectionError);
  const [visible, setVisible] = useState(false);
  const [errorData, setErrorData] = useState<{
    title: string;
    suggestion: string;
    severity: SeverityLevel;
  } | null>(null);

  // Parse error message to determine type
  const parseError = useCallback((error: string | null) => {
    if (!error) return null;

    // Map error strings to error types
    const errorTypeMap: Record<string, ConnectionErrorType> = {
      '连接类型冲突': 'same-port-type',
      '不能连接相同类型的端口': 'same-port-type',
      '连接已存在': 'connection-exists',
      'cannot connect same port types': 'same-port-type',
    };

    let errorType: ConnectionErrorType = 'invalid-port';
    for (const [key, type] of Object.entries(errorTypeMap)) {
      if (error.includes(key)) {
        errorType = type;
        break;
      }
    }

    const errorInfo = CONNECTION_ERROR_MESSAGES[errorType];
    const severity: SeverityLevel = errorType === 'same-port-type' ? 'warning' : 'error';
    
    return {
      title: errorInfo?.title || '连接错误',
      suggestion: errorInfo?.suggestion || '请检查端口类型并重试',
      severity,
    };
  }, []);

  useEffect(() => {
    if (connectionError) {
      const parsed = parseError(connectionError);
      setErrorData(parsed);
      setVisible(true);

      // Auto-hide after 4 seconds (longer for better readability)
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [connectionError, parseError]);

  // Dismiss handler
  const handleDismiss = useCallback(() => {
    setVisible(false);
  }, []);

  if (!visible || !errorData) return null;

  const severityStyles = {
    error: {
      bg: 'bg-[#7f1d1d]',
      border: 'border-[#ef4444]',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="8" stroke="#ef4444" strokeWidth="1.5" />
          <path d="M10 6v5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10" cy="13.5" r="1" fill="#ef4444" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-[#78350f]',
      border: 'border-[#f97316]',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 3L18 17H2L10 3Z" stroke="#f97316" strokeWidth="1.5" fill="none" />
          <path d="M10 8v4" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10" cy="14" r="1" fill="#f97316" />
        </svg>
      ),
    },
    info: {
      bg: 'bg-[#1e3a5f]',
      border: 'border-[#3b82f6]',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="8" stroke="#3b82f6" strokeWidth="1.5" />
          <path d="M10 9v6" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10" cy="6.5" r="1" fill="#3b82f6" />
        </svg>
      ),
    },
  };

  const styles = severityStyles[errorData.severity];

  return (
    <div 
      role="alert"
      aria-live="assertive"
      className={`
        fixed top-20 left-1/2 transform -translate-x-1/2 z-50
        animate-slideDown
        max-w-md w-full mx-4
      `}
      style={{ animation: 'slideDown 0.3s ease-out' }}
    >
      <div className={`
        flex items-start gap-3 px-4 py-3 rounded-lg shadow-xl
        ${styles.bg} border ${styles.border}
      `}>
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5 animate-pulse-subtle">
          {styles.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">
            {errorData.title}
          </p>
          <p className="text-xs text-[#d1d5db] mt-1 leading-relaxed">
            {errorData.suggestion}
          </p>
          
          {/* Help hints */}
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
              <span aria-hidden="true">💡</span>
              <span>
                {errorData.severity === 'warning' 
                  ? '圆形端口为输出，方形端口为输入'
                  : '尝试拖动到不同的端口'}
              </span>
            </div>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors text-[#9ca3af] hover:text-white"
          aria-label="关闭提示"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Inline connection error indicator for port hover
 */
interface PortErrorIndicatorProps {
  error: string;
  portType: 'input' | 'output';
}

export function PortErrorIndicator({ error, portType }: PortErrorIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [error]);

  if (!visible) return null;

  return (
    <div
      role="tooltip"
      className="absolute z-50 px-2 py-1 text-xs bg-[#7f1d1d] text-[#fecaca] rounded border border-[#ef4444] whitespace-nowrap"
    >
      {portType === 'output' ? '输出端口' : '输入端口'} - {error}
    </div>
  );
}

/**
 * Connection success feedback
 */
interface ConnectionSuccessProps {
  show: boolean;
  onComplete: () => void;
}

export function ConnectionSuccessFeedback({ show, onComplete }: ConnectionSuccessProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown"
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-[#064e3b] border border-[#22c55e] rounded-lg shadow-lg">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="7" stroke="#22c55e" strokeWidth="1.5" />
          <path d="M5 8l2 2 4-4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm font-medium text-[#86efac]">连接成功</span>
      </div>
    </div>
  );
}

export default ConnectionErrorFeedback;
