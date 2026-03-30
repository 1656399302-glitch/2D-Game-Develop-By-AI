import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTutorialStore } from '../../store/useTutorialStore';
import { getStepByNumber, TOTAL_TUTORIAL_STEPS, TutorialStep } from '../../data/tutorialSteps';
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

  // FIX: Memoize currentStepData to prevent updateTargetPosition from recreating on every render
  // This breaks the potential loop where callback recreation -> effect re-run -> state change -> callback recreation
  const currentStepData = useMemo<TutorialStep | null>(() => {
    const step = getStepByNumber(currentStep);
    return step ?? null;
  }, [currentStep]);

  // FIX: Store callbacks in refs to prevent effect dependency issues
  const onModuleAddedRef = useRef(onModuleAdded);
  const onModuleSelectedRef = useRef(onModuleSelected);
  const onModuleConnectedRef = useRef(onModuleConnected);
  const onMachineActivatedRef = useRef(onMachineActivated);
  const onMachineSavedRef = useRef(onMachineSaved);

  useEffect(() => {
    onModuleAddedRef.current = onModuleAdded;
    onModuleSelectedRef.current = onModuleSelected;
    onModuleConnectedRef.current = onModuleConnected;
    onMachineActivatedRef.current = onMachineActivated;
    onMachineSavedRef.current = onMachineSaved;
  }, [onModuleAdded, onModuleSelected, onModuleConnected, onMachineActivated, onMachineSaved]);

  // FIX: updateTargetPosition only depends on primitive values from the store
  // Using currentStep directly (number) and isTutorialActive (boolean) as dependencies
  // The currentStepData is memoized, so the callback won't recreate unnecessarily
  const updateTargetPosition = useCallback(() => {
    if (!isTutorialActive) {
      setTargetRect(null);
      return;
    }

    // Use the memoized currentStepData
    if (!currentStepData) {
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
  }, [isTutorialActive, currentStepData]); // Only depends on stable values

  // Update target position on step change and scroll/resize
  // FIX: Use empty deps with manual tracking to prevent cascading effects
  useEffect(() => {
    if (!isTutorialActive) return;

    // Call updateTargetPosition immediately
    updateTargetPosition();

    // Listen for resize and scroll events
    const handleResize = () => updateTargetPosition();
    const handleScroll = () => updateTargetPosition();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

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
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      observer.disconnect();
    };
  }, [isTutorialActive, currentStep, updateTargetPosition]); // Stable dependencies only

  // Track step changes for callbacks - use ref to avoid setState in effect
  useEffect(() => {
    if (previousStepRef.current !== currentStep) {
      previousStepRef.current = currentStep;
    }
  }, [currentStep]);

  // Trigger callbacks when advancing through steps - FIX: use refs for callbacks
  // FIX: Use empty deps and track previous step via ref to prevent cascading
  useEffect(() => {
    if (!isTutorialActive) return;
    if (previousStepRef.current !== currentStep) {
      previousStepRef.current = currentStep;
      
      // Trigger callbacks based on current step completion using refs
      switch (currentStep) {
        case 2: // After drag module step (step 1 -> 2)
          onModuleAddedRef.current?.();
          break;
        case 3: // After select/rotate step (step 2 -> 3)
          onModuleSelectedRef.current?.();
          break;
        case 4: // After connect step (step 3 -> 4)
          onModuleConnectedRef.current?.();
          break;
        case 5: // After activate step (step 4 -> 5)
          onMachineActivatedRef.current?.();
          break;
        case 6: // After save step - show completion (step 5 -> 6)
          onMachineSavedRef.current?.();
          break;
      }
    }
  }, [currentStep, isTutorialActive]); // Only primitive dependencies

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
