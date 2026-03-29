import { useState, useMemo } from 'react';
import { Challenge, getDifficultyColor, getDifficultyLabel, ValidationResult } from '../../types/challenges';
import { useMachineStore } from '../../store/useMachineStore';
import { generateAttributes } from '../../utils/attributeGenerator';
import { validateChallenge } from '../../utils/challengeValidator';
import { useChallengeStore } from '../../store/useChallengeStore';

interface ChallengeValidationPanelProps {
  challenge: Challenge;
  onClaimReward: (challenge: Challenge) => void;
}

/**
 * Panel showing validation results for a selected challenge
 */
export function ChallengeValidationPanel({ challenge, onClaimReward }: ChallengeValidationPanelProps) {
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const isCompleted = useChallengeStore((state) => state.isCompleted);

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [hasValidated, setHasValidated] = useState(false);

  const isAlreadyCompleted = isCompleted(challenge.id);

  const attributes = useMemo(() => {
    return generateAttributes(modules, connections);
  }, [modules, connections]);

  const handleValidate = () => {
    const result = validateChallenge(modules, connections, attributes, challenge);
    setValidationResult(result);
    setHasValidated(true);
  };

  const handleClaimReward = () => {
    onClaimReward(challenge);
    // Reset validation after claiming
    setValidationResult(null);
    setHasValidated(false);
  };

  return (
    <div className="border-t border-[#1e2a42]">
      {/* Challenge Header */}
      <div className="p-4 border-b border-[#1e2a42] bg-[#0a0e17]/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{challenge.title}</h3>
          <span
            className="px-2 py-0.5 text-xs font-medium rounded"
            style={{
              backgroundColor: `${getDifficultyColor(challenge.difficulty)}20`,
              color: getDifficultyColor(challenge.difficulty),
            }}
          >
            {getDifficultyLabel(challenge.difficulty)}
          </span>
        </div>
        <p className="text-xs text-[#9ca3af] mt-2">{challenge.description}</p>
      </div>

      {/* Current Machine Stats */}
      <div className="p-4 border-b border-[#1e2a42]">
        <h4 className="text-xs font-medium text-[#4a5568] uppercase tracking-wider mb-3">
          Current Machine
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#4a5568]">Modules:</span>
            <span className="text-white">{modules.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#4a5568]">Connections:</span>
            <span className="text-white">{connections.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#4a5568]">Rarity:</span>
            <span
              className="font-medium"
              style={{
                color: challenge.requirements.requiredRarity
                  ? getRarityDisplayColor(attributes.rarity)
                  : '#9ca3af',
              }}
            >
              {attributes.rarity}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#4a5568]">Stability:</span>
            <span className={attributes.stats.stability >= 60 ? 'text-[#22c55e]' : 'text-[#9ca3af]'}>
              {attributes.stats.stability}%
            </span>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xs text-[#4a5568]">Tags: </span>
          <span className="text-xs text-[#9ca3af]">
            {attributes.tags.length > 0 ? attributes.tags.join(', ') : 'none'}
          </span>
        </div>
      </div>

      {/* Validation Results */}
      {hasValidated && validationResult && (
        <div className="p-4 border-b border-[#1e2a42]">
          <h4 className="text-xs font-medium text-[#4a5568] uppercase tracking-wider mb-3">
            Requirements Check
          </h4>
          <div className="space-y-2">
            {validationResult.details.map((detail, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 text-xs p-2 rounded ${
                  detail.met ? 'bg-[#22c55e]/10' : 'bg-[#ef4444]/10'
                }`}
              >
                <span className={detail.met ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                  {detail.met ? '✓' : '✗'}
                </span>
                <span className={detail.met ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                  {detail.requirement}
                </span>
                <span className="ml-auto text-[#4a5568]">
                  {typeof detail.actualValue === 'number' && typeof detail.expectedValue === 'number'
                    ? `${detail.actualValue} / ${detail.expectedValue}`
                    : detail.met
                    ? detail.actualValue
                    : `${detail.actualValue} (need: ${detail.expectedValue})`}
                </span>
              </div>
            ))}
          </div>

          {/* Overall Result */}
          <div
            className={`mt-4 p-3 rounded-lg text-center ${
              validationResult.passed
                ? 'bg-[#22c55e]/20 border border-[#22c55e]/50'
                : 'bg-[#ef4444]/20 border border-[#ef4444]/50'
            }`}
          >
            <p className={`font-semibold ${validationResult.passed ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
              {validationResult.passed ? '✓ All Requirements Met!' : '✗ Requirements Not Met'}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        {isAlreadyCompleted ? (
          <div className="flex items-center justify-center gap-2 text-[#f59e0b] bg-[#f59e0b]/10 p-3 rounded-lg">
            <span>✓</span>
            <span className="font-medium">Challenge Completed!</span>
            <span className="text-lg">🏆</span>
          </div>
        ) : (
          <div className="space-y-2">
            {!hasValidated && (
              <button
                onClick={handleValidate}
                disabled={modules.length === 0}
                className="w-full arcane-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {modules.length === 0 ? 'Add Modules to Validate' : 'Validate Machine'}
              </button>
            )}

            {hasValidated && validationResult?.passed && (
              <button
                onClick={handleClaimReward}
                className="w-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#0a0e17] font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-all"
              >
                🎁 Claim Reward
              </button>
            )}

            {hasValidated && !validationResult?.passed && (
              <button
                onClick={() => {
                  setHasValidated(false);
                  setValidationResult(null);
                }}
                className="w-full arcane-button-secondary"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>

      {/* Reward Info */}
      <div className="px-4 pb-4">
        <div className="text-xs text-[#4a5568] bg-[#0a0e17] rounded-lg p-3">
          <p className="font-medium text-[#9ca3af] mb-1">Reward:</p>
          <p className="text-[#f59e0b]">{challenge.reward.displayName}</p>
          <p className="text-[#4a5568] mt-1">{challenge.reward.description}</p>
        </div>
      </div>
    </div>
  );
}

function getRarityDisplayColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
  };
  return colors[rarity] || '#9ca3af';
}

export default ChallengeValidationPanel;
