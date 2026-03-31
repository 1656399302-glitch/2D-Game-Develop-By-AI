/**
 * Duplicate Warning Modal Component
 * 
 * Shows a warning when creating a machine that's similar to an existing one.
 */

import { useCallback } from 'react';
import { DuplicateCheckResult } from '../../types';

interface DuplicateWarningModalProps {
  result: DuplicateCheckResult;
  onKeepAnyway: () => void;
  onDiscard: () => void;
}

export function DuplicateWarningModal({
  result,
  onKeepAnyway,
  onDiscard,
}: DuplicateWarningModalProps) {
  const handleKeep = useCallback(() => {
    onKeepAnyway();
  }, [onKeepAnyway]);

  const handleDiscard = useCallback(() => {
    onDiscard();
  }, [onDiscard]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md mx-4 bg-[#121826] border border-[#fbbf24]/40 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="duplicate-warning-title"
        aria-describedby="duplicate-warning-description"
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-3 px-6 py-4 bg-[#fbbf24]/10 border-b border-[#fbbf24]/20">
          <span className="text-2xl" aria-hidden="true">⚠️</span>
          <h2 id="duplicate-warning-title" className="text-lg font-bold text-[#fbbf24]">
            Duplicate Machine Detected
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Similarity indicator */}
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#1e2a42"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={result.similarity >= 80 ? '#ef4444' : '#fbbf24'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${result.similarity * 2.83} 283`}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {result.similarity}%
                </span>
              </div>
            </div>
          </div>

          {/* Message */}
          <div id="duplicate-warning-description" className="text-center">
            <p className="text-sm text-[#9ca3af] mb-2">
              This machine is <strong className="text-white">{result.similarity}%</strong> similar to:
            </p>
            {result.existingMachineName && (
              <p className="text-base font-medium text-[#fbbf24]">
                "{result.existingMachineName}"
              </p>
            )}
            <p className="text-xs text-[#6b7280] mt-3">
              The similarity threshold is {result.threshold}%. You can still save this machine if you wish.
            </p>
          </div>

          {/* Details */}
          <div className="bg-[#0a0e17] rounded-lg p-3 border border-[#1e2a42]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6b7280]">Similarity Score</span>
              <span
                className={`font-medium ${
                  result.similarity >= 80
                    ? 'text-[#ef4444]'
                    : result.similarity >= 60
                    ? 'text-[#fbbf24]'
                    : 'text-[#22c55e]'
                }`}
              >
                {result.similarity}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-[#6b7280]">Status</span>
              <span
                className={`font-medium ${
                  result.similarity >= 80 ? 'text-[#ef4444]' : 'text-[#fbbf24]'
                }`}
              >
                {result.similarity >= 80 ? 'Warning' : 'Notice'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleDiscard}
            className="flex-1 px-4 py-3 rounded-lg font-medium bg-[#1e2a42] text-[#9ca3af] hover:bg-[#2d3a56] hover:text-white transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleKeep}
            className="flex-1 px-4 py-3 rounded-lg font-medium bg-[#fbbf24] text-[#0a0e17] hover:bg-[#f59e0b] transition-colors"
          >
            Keep Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

export default DuplicateWarningModal;
