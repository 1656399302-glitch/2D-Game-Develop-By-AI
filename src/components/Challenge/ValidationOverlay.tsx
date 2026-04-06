/**
 * Validation Overlay Component
 * 
 * Round 160: Circuit Validation Framework
 * 
 * Visual feedback overlay for validation results.
 * Shows green checkmark for pass, red X for fail,
 * and yellow spinner for in-progress validation.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  useChallengeValidatorStore,
  getStatusColor,
  getStatusIcon,
} from '../../store/useChallengeValidatorStore';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for ValidationOverlay component
 */
export interface ValidationOverlayProps {
  /** Whether the overlay is visible */
  isVisible: boolean;
  /** Optional callback when overlay is dismissed */
  onDismiss?: () => void;
  /** Auto-dismiss delay in ms (0 = no auto-dismiss) */
  autoDismissDelay?: number;
  /** Custom position */
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'center';
  /** Z-index for the overlay */
  zIndex?: number;
}

/**
 * Overlay state for rendering
 */
interface OverlayState {
  state: 'idle' | 'validating' | 'passed' | 'failed';
  message: string;
  score: number;
  objectivesPassed: number;
  totalObjectives: number;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Validation Overlay
 * Displays real-time validation feedback
 */
export function ValidationOverlay({
  isVisible,
  onDismiss,
  autoDismissDelay = 3000,
  position = 'top-right',
  zIndex = 50,
}: ValidationOverlayProps) {
  // Track overlay state
  const [overlayState, setOverlayState] = useState<OverlayState>({
    state: 'idle',
    message: '',
    score: 0,
    objectivesPassed: 0,
    totalObjectives: 0,
  });

  // Track visibility
  const [visible, setVisible] = useState(false);
  const [entering, setEntering] = useState(false);

  // Sync with store
  useEffect(() => {
    if (!isVisible) {
      setVisible(false);
      setEntering(false);
      return;
    }

    const syncState = () => {
      const store = useChallengeValidatorStore.getState();
      const result = store.lastValidationResult;

      setOverlayState({
        state: store.state,
        message: store.error || (result?.isSuccess ? '所有目标已验证' : '部分目标未通过'),
        score: result?.score ?? 0,
        objectivesPassed: result?.objectiveResults.filter(r => r.passed).length ?? 0,
        totalObjectives: result?.objectiveResults.length ?? 0,
      });

      // Show overlay when validation starts
      if (store.state === 'validating' || store.state === 'passed' || store.state === 'failed') {
        setVisible(true);
        setEntering(true);
      }
    };

    syncState();

    const intervalId = setInterval(syncState, 100);
    return () => clearInterval(intervalId);
  }, [isVisible]);

  // Handle entering animation
  useEffect(() => {
    if (entering) {
      const timeoutId = setTimeout(() => setEntering(false), 300);
      return () => clearTimeout(timeoutId);
    }
  }, [entering]);

  // Auto-dismiss on success
  useEffect(() => {
    if (overlayState.state === 'passed' && autoDismissDelay > 0) {
      const timeoutId = setTimeout(() => {
        handleDismiss();
      }, autoDismissDelay);
      return () => clearTimeout(timeoutId);
    }
  }, [overlayState.state, autoDismissDelay]);

  // Dismiss handler
  const handleDismiss = useCallback(() => {
    setVisible(false);
    setEntering(false);
    onDismiss?.();
  }, [onDismiss]);

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  const statusColor = getStatusColor(overlayState.state);
  const statusIcon = getStatusIcon(overlayState.state);

  // Position styles
  const positionStyles: Record<string, string> = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div
      className={`
        fixed ${positionStyles[position]}
        transition-all duration-300 ease-out
        ${entering ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
      `}
      style={{ zIndex }}
      data-testid="validation-overlay"
      role="alert"
      aria-live="polite"
    >
      <div
        className="bg-[#121826] border rounded-lg shadow-2xl overflow-hidden"
        style={{
          borderColor: `${statusColor}50`,
          minWidth: '280px',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: `${statusColor}15` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `${statusColor}30`,
                color: statusColor,
              }}
              data-testid="overlay-status-icon"
            >
              {overlayState.state === 'validating' ? (
                <span className="animate-spin text-lg">◐</span>
              ) : (
                <span className="text-lg">{statusIcon}</span>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">
                {overlayState.state === 'idle' && '验证状态'}
                {overlayState.state === 'validating' && '正在验证...'}
                {overlayState.state === 'passed' && '验证通过'}
                {overlayState.state === 'failed' && '验证失败'}
              </h4>
              {overlayState.state === 'validating' && (
                <p className="text-xs text-[#9ca3af]">
                  正在检查目标...
                </p>
              )}
            </div>
          </div>
          {overlayState.state !== 'validating' && (
            <button
              onClick={handleDismiss}
              className="text-[#9ca3af] hover:text-white transition-colors p-1"
              aria-label="Dismiss"
              data-testid="overlay-dismiss-button"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        {(overlayState.state === 'passed' || overlayState.state === 'failed') && (
          <div className="px-4 py-3">
            <p className="text-sm text-[#e2e8f0] mb-3" data-testid="overlay-message">
              {overlayState.message}
            </p>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-1">
                <span>完成进度</span>
                <span>
                  {overlayState.objectivesPassed}/{overlayState.totalObjectives}
                </span>
              </div>
              <div className="w-full h-2 bg-[#1e2a42] rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${overlayState.score}%`,
                    backgroundColor: statusColor,
                  }}
                  data-testid="overlay-progress-bar"
                />
              </div>
            </div>

            {/* Score */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#9ca3af]">得分</span>
              <span
                className="text-lg font-bold"
                style={{ color: statusColor }}
                data-testid="overlay-score"
              >
                {overlayState.score}%
              </span>
            </div>
          </div>
        )}

        {/* In Progress Content */}
        {overlayState.state === 'validating' && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 border-2 rounded-full animate-pulse"
                style={{ borderColor: statusColor, borderTopColor: 'transparent' }}
              />
              <span className="text-sm text-[#9ca3af]">
                正在验证电路...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Compact Overlay Variant
// ============================================================================

/**
 * Compact validation status indicator
 * Shows a small badge with the current status
 */
export function ValidationStatusBadge({
  className = '',
}: {
  className?: string;
}) {
  const [state, setState] = useState<'idle' | 'validating' | 'passed' | 'failed'>('idle');

  useEffect(() => {
    const syncState = () => {
      const store = useChallengeValidatorStore.getState();
      setState(store.state);
    };

    syncState();

    const intervalId = setInterval(syncState, 100);
    return () => clearInterval(intervalId);
  }, []);

  if (state === 'idle') {
    return null;
  }

  const statusColor = getStatusColor(state);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${statusColor}20`,
        color: statusColor,
      }}
      data-testid="validation-status-badge"
      role="status"
    >
      {state === 'validating' && (
        <span className="animate-spin" data-testid="badge-spinner">◐</span>
      )}
      {state === 'passed' && <span data-testid="badge-icon">✓</span>}
      {state === 'failed' && <span data-testid="badge-icon">✗</span>}
      <span>
        {state === 'validating' && '验证中'}
        {state === 'passed' && '已通过'}
        {state === 'failed' && '未通过'}
      </span>
    </div>
  );
}

// ============================================================================
// Toast Variant
// ============================================================================

/**
 * Validation toast notification
 * Auto-dismissing toast for validation results
 */
export function ValidationToast({
  isVisible,
  onDismiss,
  duration = 3000,
}: {
  isVisible: boolean;
  onDismiss?: () => void;
  duration?: number;
}) {
  const [show, setShow] = useState(false);
  const [overlayState, setOverlayState] = useState<OverlayState>({
    state: 'idle',
    message: '',
    score: 0,
    objectivesPassed: 0,
    totalObjectives: 0,
  });

  useEffect(() => {
    if (isVisible) {
      const store = useChallengeValidatorStore.getState();
      const result = store.lastValidationResult;

      setOverlayState({
        state: store.state,
        message: store.error || (result?.isSuccess ? '验证通过！' : '部分目标未通过'),
        score: result?.score ?? 0,
        objectivesPassed: result?.objectiveResults.filter(r => r.passed).length ?? 0,
        totalObjectives: result?.objectiveResults.length ?? 0,
      });

      if (store.state === 'passed' || store.state === 'failed') {
        setShow(true);
      }
    }
  }, [isVisible]);

  useEffect(() => {
    if (show && duration > 0) {
      const timeoutId = setTimeout(() => {
        setShow(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timeoutId);
    }
  }, [show, duration, onDismiss]);

  if (!show) {
    return null;
  }

  const statusColor = getStatusColor(overlayState.state);

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up"
      data-testid="validation-toast"
    >
      <div
        className="bg-[#121826] border rounded-lg shadow-2xl px-4 py-3 flex items-center gap-3"
        style={{ borderColor: `${statusColor}50` }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: `${statusColor}30`,
            color: statusColor,
          }}
        >
          {getStatusIcon(overlayState.state)}
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            {overlayState.message}
          </p>
          <p className="text-xs text-[#9ca3af]">
            得分: {overlayState.score}% ({overlayState.objectivesPassed}/{overlayState.totalObjectives})
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Export
// ============================================================================

export default ValidationOverlay;
