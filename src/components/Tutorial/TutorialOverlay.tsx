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
  // Use individual selectors for primitive values (not methods)
  const isTutorialActive = useTutorialStore((state) => state.isTutorialActive);
  const currentStep = useTutorialStore((state) => state.currentStep);

  // Store method references in refs to prevent stale closures
  // These are initialized once and updated when the component mounts
  const nextStepRef = useRef(useTutorialStore.getState().nextStep);
  const previousStepRef = useRef(useTutorialStore.getState().previousStep);
  const skipTutorialRef = useRef(useTutorialStore.getState().skipTutorial);
  const completeTutorialRef = useRef(useTutorialStore.getState().completeTutorial);
  const goToStepRef = useRef(useTutorialStore.getState().goToStep);

  // FIX: Add empty dependency array - refs should only be initialized once on mount
  // The functions in Zustand stores are stable and don't need to be re-synced
  useEffect(() => {
    nextStepRef.current = useTutorialStore.getState().nextStep;
    previousStepRef.current = useTutorialStore.getState().previousStep;
    skipTutorialRef.current = useTutorialStore.getState().skipTutorial;
    completeTutorialRef.current = useTutorialStore.getState().completeTutorial;
    goToStepRef.current = useTutorialStore.getState().goToStep;
  }, []); // Empty deps - run exactly once on mount

  const [showCompletion, setShowCompletion] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Memoize currentStepData to prevent updateTargetPosition from recreating on every render
  const currentStepData = useMemo<TutorialStep | null>(() => {
    const step = getStepByNumber(currentStep);
    return step ?? null;
  }, [currentStep]);

  // Store callbacks in refs to prevent effect dependency issues
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
  const updateTargetPosition = useCallback(() => {
    if (!isTutorialActive) {
      setTargetRect(null);
      return;
    }

    if (!currentStepData) {
      setTargetRect(null);
      return;
    }

    const selector = currentStepData.targetSelector;
    const element = document.querySelector(selector);

    if (element) {
      const rect = element.getBoundingClientRect();
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

  // FIX: Debounce timer ref to ensure proper cleanup
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track previous step value for comparison
  const previousStepValueRef = useRef(currentStep);

  // Update target position on step change and scroll/resize
  useEffect(() => {
    if (!isTutorialActive) return;

    updateTargetPosition();

    const handleResize = () => updateTargetPosition();
    const handleScroll = () => updateTargetPosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    const observer = new MutationObserver(() => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        updateTargetPosition();
      }, 200);
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
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [isTutorialActive, currentStep, updateTargetPosition]);

  // Track step changes for callbacks
  useEffect(() => {
    if (previousStepValueRef.current !== currentStep) {
      previousStepValueRef.current = currentStep;
    }
  }, [currentStep]);

  // Trigger callbacks when advancing through steps
  useEffect(() => {
    if (!isTutorialActive) return;
    if (previousStepValueRef.current !== currentStep) {
      previousStepValueRef.current = currentStep;

      switch (currentStep) {
        case 2:
          onModuleAddedRef.current?.();
          break;
        case 3:
          onModuleSelectedRef.current?.();
          break;
        case 4:
          onModuleConnectedRef.current?.();
          break;
        case 5:
          onMachineActivatedRef.current?.();
          break;
        case 6:
          onMachineSavedRef.current?.();
          break;
      }
    }
  }, [currentStep, isTutorialActive]);

  // Handle manual step navigation using refs
  const handleNext = useCallback(() => {
    if (currentStep >= TOTAL_TUTORIAL_STEPS - 1) {
      completeTutorialRef.current();
      setShowCompletion(true);
    } else {
      setIsTransitioning(true);
      setTimeout(() => {
        nextStepRef.current();
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        previousStepRef.current();
        setIsTransitioning(false);
      }, 150);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    skipTutorialRef.current();
  }, []);

  const handleCompletionContinue = useCallback(() => {
    setShowCompletion(false);
    completeTutorialRef.current();
  }, []);

  const handleReplayTutorial = useCallback(() => {
    setShowCompletion(false);
    goToStepRef.current(0);
  }, []);

  if (!isTutorialActive && !showCompletion) {
    return null;
  }

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
      <TutorialSpotlight
        targetRect={targetRect}
        isTransitioning={isTransitioning}
      />

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

      <TutorialProgress
        currentStep={currentStep}
        totalSteps={TOTAL_TUTORIAL_STEPS}
      />
    </>
  );
}

export default TutorialOverlay;
