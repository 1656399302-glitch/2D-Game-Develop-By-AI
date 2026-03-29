import { useEffect, useRef, useState } from 'react';
import { TutorialStep } from '../../data/tutorialSteps';

interface TutorialTooltipProps {
  step: TutorialStep;
  currentStep: number;
  totalSteps: number;
  targetRect: DOMRect | null;
  isTransitioning: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onLastStep: boolean;
}

export function TutorialTooltip({
  step,
  currentStep,
  totalSteps,
  targetRect,
  isTransitioning,
  onNext,
  onPrevious,
  onSkip,
  onLastStep,
}: TutorialTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, arrowSide: 'left' });
  const [isVisible, setIsVisible] = useState(false);

  // Calculate tooltip position based on target
  useEffect(() => {
    if (!targetRect) {
      setPosition({ top: window.innerHeight / 3, left: window.innerWidth / 2 - 200, arrowSide: 'left' });
      return;
    }

    const tooltipWidth = 380;
    const tooltipHeight = 280;
    const padding = 20;
    const arrowSize = 12;

    let top = 0;
    let left = 0;
    let arrowSide: 'left' | 'right' | 'top' | 'bottom' = 'left';

    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    // Position based on step's preferred position
    switch (step.position) {
      case 'right':
        left = targetRect.right + padding + arrowSize;
        top = targetCenterY - tooltipHeight / 2;
        arrowSide = 'left';
        // Flip to left if would overflow right
        if (left + tooltipWidth > window.innerWidth - padding) {
          left = targetRect.left - tooltipWidth - padding - arrowSize;
          arrowSide = 'right';
        }
        break;
      case 'left':
        left = targetRect.left - tooltipWidth - padding - arrowSize;
        top = targetCenterY - tooltipHeight / 2;
        arrowSide = 'right';
        // Flip to right if would overflow left
        if (left < padding) {
          left = targetRect.right + padding + arrowSize;
          arrowSide = 'left';
        }
        break;
      case 'bottom':
        top = targetRect.bottom + padding + arrowSize;
        left = targetCenterX - tooltipWidth / 2;
        arrowSide = 'top';
        // Flip to top if would overflow bottom
        if (top + tooltipHeight > window.innerHeight - padding) {
          top = targetRect.top - tooltipHeight - padding - arrowSize;
          arrowSide = 'bottom';
        }
        break;
      case 'top':
      default:
        top = targetRect.top - tooltipHeight - padding - arrowSize;
        left = targetCenterX - tooltipWidth / 2;
        arrowSide = 'bottom';
        // Flip to bottom if would overflow top
        if (top < padding) {
          top = targetRect.bottom + padding + arrowSize;
          arrowSide = 'top';
        }
        break;
    }

    // Clamp to viewport
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

    setPosition({ top, left, arrowSide });
    setIsVisible(true);
  }, [targetRect, step.position]);

  // Get action indicator icon
  const getActionIcon = () => {
    switch (step.action) {
      case 'drag':
        return '👆';
      case 'click':
        return '🖱️';
      case 'connect':
        return '🔗';
      case 'wait':
        return '👀';
      default:
        return '✨';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={tooltipRef}
      className={`fixed z-[1000] pointer-events-none transition-all duration-300 ${
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      style={{
        top: position.top,
        left: position.left,
        width: 380,
      }}
    >
      <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-xl border border-[#7c3aed]/50 shadow-2xl shadow-purple-900/30 overflow-hidden">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#c084fc]" />

        {/* Content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <span className="text-xs text-[#a855f7] font-medium uppercase tracking-wider">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <h3 className="text-lg font-bold text-white mt-1">{step.title}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/20 flex items-center justify-center text-xl">
              {getActionIcon()}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-[#9ca3af] leading-relaxed mb-4">
            {step.description}
          </p>

          {/* Action hint */}
          {step.action !== 'none' && (
            <div className="bg-[#7c3aed]/10 rounded-lg p-3 mb-4 border border-[#7c3aed]/20">
              <p className="text-xs text-[#c084fc] font-medium mb-1">Your task:</p>
              <p className="text-sm text-white">{step.actionDescription}</p>
              {step.expectedResult && (
                <p className="text-xs text-[#6b7280] mt-1">
                  ✓ {step.expectedResult}
                </p>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1e2a42]">
            <button
              onClick={onSkip}
              className="px-3 py-1.5 text-xs text-[#6b7280] hover:text-white transition-colors pointer-events-auto"
            >
              Skip Tutorial
            </button>
            
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={onPrevious}
                  className="px-3 py-1.5 text-sm text-[#9ca3af] hover:text-white border border-[#1e2a42] rounded-lg hover:border-[#7c3aed]/50 transition-colors pointer-events-auto"
                >
                  ← Back
                </button>
              )}
              
              <button
                onClick={onNext}
                className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white rounded-lg hover:from-[#8b5cf6] hover:to-[#7c3aed] transition-all shadow-lg shadow-purple-900/30 pointer-events-auto"
              >
                {onLastStep ? 'Complete' : 'Next →'}
              </button>
            </div>
          </div>
        </div>

        {/* Arrow pointer */}
        <div
          className={`absolute w-0 h-0 border-8 border-transparent ${
            position.arrowSide === 'left'
              ? 'border-r-[#7c3aed]/50 -left-[9px] top-1/2 -translate-y-1/2 border-l-0 border-r-[#1a1a2e]'
              : position.arrowSide === 'right'
              ? 'border-l-[#7c3aed]/50 -right-[9px] top-1/2 -translate-y-1/2 border-r-0 border-l-[#1a1a2e]'
              : position.arrowSide === 'top'
              ? 'border-b-[#7c3aed]/50 top-[23px] -left-[9px] border-t-0 border-b-[#1a1a2e]'
              : 'border-t-[#7c3aed]/50 bottom-[23px] -left-[9px] border-b-0 border-t-[#1a1a2e]'
          }`}
        />
      </div>

      {/* Pulsing indicator for target */}
      {targetRect && step.action !== 'none' && (
        <div
          className="absolute w-3 h-3 bg-[#7c3aed] rounded-full animate-ping"
          style={{
            top: position.arrowSide === 'left' ? '50%' : position.arrowSide === 'top' ? -20 : position.arrowSide === 'bottom' ? targetRect.height + 30 : '50%',
            left: position.arrowSide === 'top' || position.arrowSide === 'bottom' ? '50%' : position.arrowSide === 'left' ? -20 : targetRect.width + 30,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  );
}
