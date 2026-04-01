/**
 * Connection Error Toast Component
 * 
 * Displays error messages for invalid connection attempts with
 * localized Chinese messages per contract specification:
 * - "输入端口无法连接到输入端口" (AC-CONN-VALID-001)
 * - "输出端口无法连接到输出端口" (AC-CONN-VALID-002)
 * - "模块无法连接到自身" (AC-CONN-VALID-003)
 * - "连接已存在" (duplicate connection)
 */

import { useEffect, useState } from 'react';
import { useMachineStore } from '../../store/useMachineStore';

/**
 * Error message configuration for connection errors
 */
export interface ConnectionErrorConfig {
  code: string;
  title: string;
  message: string;
  iconType: 'warning' | 'error' | 'info';
}

/**
 * Predefined error configurations matching contract acceptance criteria
 */
const ERROR_CONFIGS: Record<string, ConnectionErrorConfig> = {
  'SELF_CONNECTION': {
    code: 'SELF_CONNECTION',
    title: '连接错误',
    message: '模块无法连接到自身',
    iconType: 'error',
  },
  'INPUT_INPUT_CONNECTION': {
    code: 'INPUT_INPUT_CONNECTION',
    title: '连接错误',
    message: '输入端口无法连接到输入端口',
    iconType: 'error',
  },
  'OUTPUT_OUTPUT_CONNECTION': {
    code: 'OUTPUT_OUTPUT_CONNECTION',
    title: '连接错误',
    message: '输出端口无法连接到输出端口',
    iconType: 'error',
  },
  'SAME_PORT_TYPE': {
    code: 'SAME_PORT_TYPE',
    title: '连接错误',
    message: '端口类型冲突 - 不能连接相同类型的端口',
    iconType: 'error',
  },
  'DUPLICATE_CONNECTION': {
    code: 'DUPLICATE_CONNECTION',
    title: '连接错误',
    message: '连接已存在',
    iconType: 'warning',
  },
  'SOURCE_NOT_FOUND': {
    code: 'SOURCE_NOT_FOUND',
    title: '连接错误',
    message: '源模块或端口不存在',
    iconType: 'error',
  },
  'TARGET_NOT_FOUND': {
    code: 'TARGET_NOT_FOUND',
    title: '连接错误',
    message: '目标模块或端口不存在',
    iconType: 'error',
  },
  'INVALID_PORT_TYPE': {
    code: 'INVALID_PORT_TYPE',
    title: '连接错误',
    message: '端口类型无效',
    iconType: 'error',
  },
  // Legacy error messages for backward compatibility
  '连接类型冲突 - 不能连接相同类型的端口': {
    code: 'SAME_PORT_TYPE',
    title: '连接错误',
    message: '端口类型冲突 - 不能连接相同类型的端口',
    iconType: 'error',
  },
  '连接已存在': {
    code: 'DUPLICATE_CONNECTION',
    title: '连接错误',
    message: '连接已存在',
    iconType: 'warning',
  },
};

/**
 * Get error configuration from error message or code
 */
function getErrorConfig(error: string | null): ConnectionErrorConfig | null {
  if (!error) return null;
  
  // Check if it's a known error message
  if (ERROR_CONFIGS[error]) {
    return ERROR_CONFIGS[error];
  }
  
  // Check specific message patterns
  if (error.includes('输入端口无法连接到输入端口')) {
    return ERROR_CONFIGS['INPUT_INPUT_CONNECTION'];
  }
  if (error.includes('输出端口无法连接到输出端口')) {
    return ERROR_CONFIGS['OUTPUT_OUTPUT_CONNECTION'];
  }
  if (error.includes('模块无法连接到自身')) {
    return ERROR_CONFIGS['SELF_CONNECTION'];
  }
  if (error.includes('连接已存在')) {
    return ERROR_CONFIGS['DUPLICATE_CONNECTION'];
  }
  if (error.includes('连接类型冲突')) {
    return ERROR_CONFIGS['SAME_PORT_TYPE'];
  }
  if (error.includes('源模块') || error.includes('源端口')) {
    return ERROR_CONFIGS['SOURCE_NOT_FOUND'];
  }
  if (error.includes('目标模块') || error.includes('目标端口')) {
    return ERROR_CONFIGS['TARGET_NOT_FOUND'];
  }
  
  // Default fallback for unknown errors
  return {
    code: 'UNKNOWN',
    title: '连接错误',
    message: error,
    iconType: 'error',
  };
}

/**
 * Warning icon SVG
 */
function WarningIcon({ className }: { className?: string }) {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 20 20" 
      fill="none" 
      stroke="#fbbf24" 
      strokeWidth="2"
      className={className}
    >
      <path d="M10 2L1 18h18L10 2z" />
      <path d="M10 8v4" />
      <circle cx="10" cy="15" r="1" fill="#fbbf24" />
    </svg>
  );
}

/**
 * Error icon SVG
 */
function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 20 20" 
      fill="none" 
      stroke="#ef4444" 
      strokeWidth="2"
      className={className}
    >
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v5" />
      <circle cx="10" cy="14" r="1" fill="#ef4444" />
    </svg>
  );
}

/**
 * Info icon SVG
 */
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 20 20" 
      fill="none" 
      stroke="#3b82f6" 
      strokeWidth="2"
      className={className}
    >
      <circle cx="10" cy="10" r="8" />
      <path d="M10 9v5" />
      <circle cx="10" cy="6" r="1" fill="#3b82f6" />
    </svg>
  );
}

/**
 * Connection Error Toast Component
 * 
 * Displays connection errors with appropriate icons and animations.
 * Auto-dismisses after 2.5 seconds.
 */
export function ConnectionErrorToast() {
  const connectionError = useMachineStore((state) => state.connectionError);
  const [visible, setVisible] = useState(false);
  const [errorConfig, setErrorConfig] = useState<ConnectionErrorConfig | null>(null);
  
  useEffect(() => {
    if (connectionError) {
      const config = getErrorConfig(connectionError);
      setErrorConfig(config);
      setVisible(true);
      
      // Auto-hide after 2.5 seconds (slightly longer than before for readability)
      const timer = setTimeout(() => {
        setVisible(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
      setErrorConfig(null);
    }
  }, [connectionError]);
  
  if (!visible || !errorConfig) return null;
  
  const iconClassName = errorConfig.iconType === 'warning' ? 'animate-pulse' : 'animate-pulse';
  const borderColorClass = errorConfig.iconType === 'warning' 
    ? 'border-[#fbbf24]' 
    : errorConfig.iconType === 'info'
      ? 'border-[#3b82f6]'
      : 'border-[#ef4444]';
  const bgColorClass = errorConfig.iconType === 'warning'
    ? 'bg-[#78350f]'
    : errorConfig.iconType === 'info'
      ? 'bg-[#1e3a8a]'
      : 'bg-[#7f1d1d]';
  const textColorClass = errorConfig.iconType === 'warning'
    ? 'text-[#fef3c7]'
    : errorConfig.iconType === 'info'
      ? 'text-[#dbeafe]'
      : 'text-[#fecaca]';
  const subTextColorClass = errorConfig.iconType === 'warning'
    ? 'text-[#fcd34d]'
    : errorConfig.iconType === 'info'
      ? 'text-[#93c5fd]'
      : 'text-[#fca5a5]';
  
  return (
    <div 
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
      style={{
        animation: 'slideDown 0.3s ease-out',
      }}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div 
        className={`flex items-center gap-3 px-4 py-3 ${bgColorClass} border ${borderColorClass} rounded-lg shadow-lg max-w-md`}
      >
        <div className="flex-shrink-0">
          {errorConfig.iconType === 'warning' && <WarningIcon className={iconClassName} />}
          {errorConfig.iconType === 'error' && <ErrorIcon className={iconClassName} />}
          {errorConfig.iconType === 'info' && <InfoIcon className={iconClassName} />}
        </div>
        <div>
          <p className={`text-sm font-medium ${textColorClass}`}>
            {errorConfig.title}
          </p>
          <p className={`text-xs ${subTextColorClass}`}>
            {errorConfig.message}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className={`ml-2 p-1 rounded hover:bg-black/20 ${subTextColorClass}`}
          aria-label="关闭"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l8 8M12 4l-8 8" />
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
        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}

export default ConnectionErrorToast;
