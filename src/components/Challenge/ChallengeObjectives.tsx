/**
 * Challenge Objectives Component
 * 
 * Round 160: Circuit Validation Framework
 * 
 * Displays challenge objectives with real-time validation status.
 * Shows status icons: green checkmark for pass, red X for fail,
 * yellow spinner for in-progress.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  ChallengeObjective,
  ObjectiveType,
  ValidationStatus,
  ValidationResult,
} from '../../types/challenge';
import {
  useChallengeValidatorStore,
  getStatusColor,
  getStatusIcon,
} from '../../store/useChallengeValidatorStore';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for ChallengeObjectives component
 */
export interface ChallengeObjectivesProps {
  /** Objectives to display */
  objectives: ChallengeObjective[];
  /** Optional className for styling */
  className?: string;
  /** Callback when all objectives pass */
  onAllObjectivesPassed?: () => void;
  /** Callback when any objective fails */
  onObjectiveFailed?: (objectiveId: string) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Challenge Objectives Panel
 * Displays objectives with status indicators
 */
export function ChallengeObjectives({
  objectives,
  className = '',
  onAllObjectivesPassed,
  onObjectiveFailed,
}: ChallengeObjectivesProps) {
  // Get store state using getState pattern for non-reactive access
  const [objectiveStatuses, setObjectiveStatuses] = useState<Array<{
    id: string;
    status: ValidationStatus;
    message: string;
  }>>([]);

  const [validatorState, setValidatorState] = useState<'idle' | 'validating' | 'passed' | 'failed'>('idle');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Sync with store on mount and periodically
  useEffect(() => {
    const syncState = () => {
      const state = useChallengeValidatorStore.getState();
      setObjectiveStatuses(state.objectiveStatuses);
      setValidatorState(state.state);
      setValidationResult(state.lastValidationResult);
    };

    syncState();

    // Poll periodically for updates
    const intervalId = setInterval(syncState, 100);
    return () => clearInterval(intervalId);
  }, []);

  // Notify parent of state changes
  useEffect(() => {
    if (validatorState === 'passed' && onAllObjectivesPassed) {
      onAllObjectivesPassed();
    }
  }, [validatorState, onAllObjectivesPassed]);

  // Notify parent of failures
  useEffect(() => {
    const failedObjective = objectiveStatuses.find(s => s.status === 'failed');
    if (failedObjective && onObjectiveFailed) {
      onObjectiveFailed(failedObjective.id);
    }
  }, [objectiveStatuses, onObjectiveFailed]);

  // Get status for a specific objective
  const getObjectiveStatus = useCallback(
    (objectiveId: string): ValidationStatus => {
      const status = objectiveStatuses.find((s) => s.id === objectiveId);
      return status?.status ?? 'idle';
    },
    [objectiveStatuses]
  );

  // Get status message for a specific objective
  const getObjectiveMessage = useCallback(
    (objectiveId: string): string => {
      const status = objectiveStatuses.find((s) => s.id === objectiveId);
      return status?.message ?? '';
    },
    [objectiveStatuses]
  );

  // Handle empty objective list
  if (!objectives || objectives.length === 0) {
    return (
      <div
        className={`bg-[#0a0e17] rounded-lg p-4 ${className}`}
        data-testid="challenge-objectives-panel"
      >
        <div className="text-center text-[#4a5568]">
          <span className="text-2xl block mb-2">📋</span>
          <p className="text-sm">暂无目标</p>
        </div>
      </div>
    );
  }

  // Sort objectives by priority
  const sortedObjectives = [...objectives].sort((a, b) => a.priority - b.priority);

  return (
    <div
      className={`bg-[#0a0e17] rounded-lg overflow-hidden ${className}`}
      data-testid="challenge-objectives-panel"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1e2a42] bg-[#121826]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <span>🎯</span>
            <span>挑战目标</span>
          </h3>
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 text-xs rounded"
              style={{
                backgroundColor: `${getStatusColor(validatorState)}20`,
                color: getStatusColor(validatorState),
              }}
            >
              {validatorState === 'idle' && '待机'}
              {validatorState === 'validating' && '验证中'}
              {validatorState === 'passed' && '已通过'}
              {validatorState === 'failed' && '未通过'}
            </span>
          </div>
        </div>
      </div>

      {/* Objective List */}
      <ul className="divide-y divide-[#1e2a42]" role="list" aria-label="Challenge objectives">
        {sortedObjectives.map((objective) => (
          <ObjectiveItem
            key={objective.id}
            objective={objective}
            status={getObjectiveStatus(objective.id)}
            message={getObjectiveMessage(objective.id)}
          />
        ))}
      </ul>

      {/* Progress Summary */}
      {validationResult && (
        <div className="px-4 py-3 border-t border-[#1e2a42] bg-[#121826]">
          <div className="flex items-center justify-between text-xs text-[#9ca3af]">
            <span>
              已通过 {validationResult.objectiveResults.filter((r) => r.passed).length}/
              {validationResult.objectiveResults.length}
            </span>
            <span>
              得分: {validationResult.score}%
            </span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-[#1e2a42] rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${validationResult.score}%`,
                backgroundColor: validationResult.isSuccess ? '#22c55e' : '#f59e0b',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Objective Item Component
// ============================================================================

/**
 * Single objective item with status indicator
 */
function ObjectiveItem({
  objective,
  status,
  message,
}: {
  objective: ChallengeObjective;
  status: ValidationStatus;
  message: string;
}) {
  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);

  return (
    <li
      className="px-4 py-3 hover:bg-[#1e2a42]/30 transition-colors"
      data-testid={`objective-item-${objective.id}`}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            backgroundColor: `${statusColor}20`,
            color: statusColor,
          }}
          data-testid={`objective-status-${objective.id}`}
          role="status"
          aria-label={`Status: ${status}`}
        >
          {status === 'validating' ? (
            <span className="animate-spin" data-testid="objective-spinner">
              ◐
            </span>
          ) : (
            <span data-testid="objective-icon">{statusIcon}</span>
          )}
        </div>

        {/* Objective Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-white truncate">{objective.name}</h4>
            <ObjectiveTypeBadge type={objective.objectiveType} />
          </div>
          <p className="text-xs text-[#9ca3af] mt-0.5 line-clamp-2">
            {objective.description}
          </p>
          {message && status !== 'idle' && (
            <p
              className="text-xs mt-1"
              style={{ color: statusColor }}
              data-testid={`objective-message-${objective.id}`}
            >
              {message}
            </p>
          )}
        </div>

        {/* Points */}
        <div className="flex-shrink-0 text-right">
          <span className="text-sm font-medium text-[#f59e0b]">
            {status === 'passed' ? objective.points : 0}
          </span>
          <span className="text-xs text-[#4a5568]"> / {objective.points}</span>
        </div>
      </div>
    </li>
  );
}

// ============================================================================
// Objective Type Badge
// ============================================================================

/**
 * Badge showing the type of objective
 */
function ObjectiveTypeBadge({ type }: { type: ObjectiveType }) {
  const config: Record<ObjectiveType, { label: string; color: string }> = {
    output: { label: '输出', color: '#3b82f6' },
    component_count: { label: '组件', color: '#8b5cf6' },
    timing: { label: '时序', color: '#f59e0b' },
  };

  const { label, color } = config[type];

  return (
    <span
      className="px-1.5 py-0.5 text-xs rounded"
      style={{
        backgroundColor: `${color}20`,
        color,
      }}
    >
      {label}
    </span>
  );
}

// ============================================================================
// Export
// ============================================================================

export default ChallengeObjectives;
