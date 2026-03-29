import { useState, useEffect, useCallback, useRef } from 'react';
import { useTutorialStore } from '../../store/useTutorialStore';
import { getStepByNumber, TOTAL_TUTORIAL_STEPS } from '../../data/tutorialSteps';
import { TutorialTooltip } from './TutorialTooltip';
import { TutorialSpotlight } from './TutorialSpotlight';
import { TutorialProgress } from './TutorialProgress';
import { TutorialCompletion } from './TutorialCompletion';

interface TutorialOverlayProps {
  onModuleAdded?: () => void;
  onModuleSelected?: () => void;
  onModuleConnected?: () => void;
  onMachineActivated?: () => void;
  onMachineSaved?: () => void;
}

export function TutorialOverlay({
  onModuleAdded,
  onModuleSelected,
  onModuleConnected,
  onMachineActivated,
  onMachineSaved,
}: TutorialOverlayProps) {
  const {
    isTutorialActive,
    currentStep,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    goToStep,
  } = useTutorialStore();

  const [showCompletion, setShowCompletion] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousStepRef = useRef(currentStep);

  // Get current step data
  const currentStepData = getStepByNumber(currentStep);

  // Find and track the target element
  const updateTargetPosition = useCallback(() => {
    if (!isTutorialActive || !currentStepData) {
      setTargetRect(null);
      return;
    }

    const selector = currentStepData.targetSelector;
    const element = document.querySelector(selector);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      // Add padding if specified
      const padding = currentStepData.highlightPadding || 8;
      setTargetRect(new DOMRect(
        rect.left - padding,
        rect.top - padding,
        rect.width + padding * 2,
        rect.height + padding * 2
      ));
    } else {
      setTargetRect(null);
    }
  }, [isTutorialActive, currentStepData]);

  // Update target position on step change and scroll/resize
  useEffect(() => {
    if (!isTutorialActive) return;

    updateTargetPosition();

    // Listen for resize and scroll events
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition, true);

    // Use MutationObserver to detect DOM changes
    const observer = new MutationObserver(() => {
      setTimeout(updateTargetPosition, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition, true);
      observer.disconnect();
    };
  }, [isTutorialActive, currentStep, updateTargetPosition]);

  // Track step changes for callbacks
  useEffect(() => {
    if (previousStepRef.current !== currentStep) {
      previousStepRef.current = currentStep;
    }
  }, [currentStep]);

  // Trigger callbacks when advancing through steps
  useEffect(() => {
    if (!isTutorialActive) return;
    
    // Trigger callbacks based on current step completion
    switch (currentStep) {
      case 2: // After drag module step (step 1 -> 2)
        onModuleAdded?.();
        break;
      case 3: // After select/rotate step (step 2 -> 3)
        onModuleSelected?.();
        break;
      case 4: // After connect step (step 3 -> 4)
        onModuleConnected?.();
        break;
      case 5: // After activate step (step 4 -> 5)
        onMachineActivated?.();
        break;
      case 6: // After save step - show completion (step 5 -> 6)
        onMachineSaved?.();
        break;
    }
  }, [currentStep, isTutorialActive, onModuleAdded, onModuleSelected, onModuleConnected, onMachineActivated, onMachineSaved]);

  // Handle manual step navigation
  const handleNext = useCallback(() => {
    if (currentStep >= TOTAL_TUTORIAL_STEPS - 1) {
      completeTutorial();
      setShowCompletion(true);
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        nextStep();
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentStep, nextStep, completeTutorial]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        previousStep();
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentStep, previousStep]);

  const handleSkip = useCallback(() => {
    skipTutorial();
  }, [skipTutorial]);

  const handleCompletionContinue = useCallback(() => {
    setShowCompletion(false);
    completeTutorial();
  }, [completeTutorial]);

  const handleReplayTutorial = useCallback(() => {
    setShowCompletion(false);
    goToStep(0);
  }, [goToStep]);

  // Don't render if tutorial is not active
  if (!isTutorialActive && !showCompletion) {
    return null;
  }

  // Show completion overlay when finished
  if (showCompletion) {
    return (
      <TutorialCompletion
        onContinue={handleCompletionContinue}
        onReplay={handleReplayTutorial}
      />
    );
  }

  return (
    <>
      {/* Spotlight overlay with cutout */}
      <TutorialSpotlight
        targetRect={targetRect}
        isTransitioning={isTransitioning}
      />

      {/* Tooltip with content */}
      {currentStepData && (
        <TutorialTooltip
          step={currentStepData}
          currentStep={currentStep}
          totalSteps={TOTAL_TUTORIAL_STEPS}
          targetRect={targetRect}
          isTransitioning={isTransitioning}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSkip={handleSkip}
          onLastStep={currentStep >= TOTAL_TUTORIAL_STEPS - 1}
        />
      )}

      {/* Progress indicator */}
      <TutorialProgress
        currentStep={currentStep}
        totalSteps={TOTAL_TUTORIAL_STEPS}
      />
    </>
  );
}
