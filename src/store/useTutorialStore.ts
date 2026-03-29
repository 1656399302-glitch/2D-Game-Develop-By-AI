import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TutorialStore {
  // State
  hasSeenWelcome: boolean;
  isTutorialActive: boolean;
  currentStep: number;
  completedSteps: Set<number>;
  isTutorialEnabled: boolean;
  
  // Actions
  setHasSeenWelcome: (seen: boolean) => void;
  startTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  completeTutorial: () => void;
  skipTutorial: () => void;
  resetTutorial: () => void;
  setTutorialEnabled: (enabled: boolean) => void;
  isStepCompleted: (step: number) => boolean;
}

const TUTORIAL_STORAGE_KEY = 'arcane-codex-tutorial';

// In-memory tracking for the current session
let sessionCurrentStep = 0;
let sessionCompletedSteps = new Set<number>();

export const useTutorialStore = create<TutorialStore>()(
  persist(
    (set, _get) => ({
      hasSeenWelcome: false,
      isTutorialActive: false,
      currentStep: 0,
      completedSteps: new Set<number>(),
      isTutorialEnabled: true,

      setHasSeenWelcome: (seen) => {
        set({ hasSeenWelcome: seen });
      },

      startTutorial: () => {
        sessionCurrentStep = 0;
        set({ isTutorialActive: true, currentStep: 0, hasSeenWelcome: true });
      },

      nextStep: () => {
        sessionCompletedSteps.add(sessionCurrentStep);
        sessionCurrentStep++;
        set({ 
          currentStep: sessionCurrentStep, 
          completedSteps: new Set(sessionCompletedSteps),
          isTutorialActive: sessionCurrentStep < 6 // Assuming 6 steps total
        });
      },

      previousStep: () => {
        if (sessionCurrentStep > 0) {
          sessionCurrentStep--;
          set({ currentStep: sessionCurrentStep });
        }
      },

      goToStep: (step) => {
        sessionCurrentStep = step;
        set({ currentStep: step });
      },

      completeTutorial: () => {
        sessionCompletedSteps.add(sessionCurrentStep);
        sessionCurrentStep = 0;
        set({ 
          isTutorialActive: false, 
          currentStep: 0,
          completedSteps: new Set(sessionCompletedSteps),
          hasSeenWelcome: true
        });
      },

      skipTutorial: () => {
        sessionCurrentStep = 0;
        sessionCompletedSteps = new Set();
        set({ isTutorialActive: false, currentStep: 0, hasSeenWelcome: true });
      },

      resetTutorial: () => {
        sessionCurrentStep = 0;
        sessionCompletedSteps = new Set();
        set({ 
          isTutorialActive: false, 
          currentStep: 0, 
          completedSteps: new Set(),
          hasSeenWelcome: false
        });
      },

      setTutorialEnabled: (enabled) => {
        set({ isTutorialEnabled: enabled });
      },

      isStepCompleted: (step) => {
        return sessionCompletedSteps.has(step);
      },
    }),
    {
      name: TUTORIAL_STORAGE_KEY,
      partialize: (state) => ({ 
        hasSeenWelcome: state.hasSeenWelcome,
        isTutorialEnabled: state.isTutorialEnabled,
        // Don't persist session state
      }),
    }
  )
);

// Helper to check if user should see welcome modal
export const shouldShowWelcome = (): boolean => {
  const state = useTutorialStore.getState();
  return !state.hasSeenWelcome && state.isTutorialEnabled;
};

// Helper to get tutorial progress
export const getTutorialProgress = (): { current: number; total: number; percentage: number } => {
  const TOTAL_STEPS = 6;
  const current = useTutorialStore.getState().currentStep;
  return {
    current: current + 1,
    total: TOTAL_STEPS,
    percentage: ((current + 1) / TOTAL_STEPS) * 100
  };
};
