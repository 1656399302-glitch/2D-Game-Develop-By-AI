/**
 * Tutorial Store
 * 
 * Zustand store for managing tutorial state and progress.
 * Tracks completed steps, provides callbacks for action-to-step mapping,
 * and integrates with the achievement system.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TOTAL_TUTORIAL_STEPS } from '../data/tutorialSteps';

// Tutorial step callback mapping
export interface TutorialStepCallback {
  stepId: string;
  action: 'addModule' | 'selectModule' | 'connectModules' | 'activateMachine' | 'saveMachine' | 'completeTutorial';
  onComplete?: () => void;
}

interface TutorialStore {
  // State
  hasSeenWelcome: boolean;
  isTutorialActive: boolean;
  currentStep: number;
  completedSteps: Set<string>;
  isTutorialEnabled: boolean;
  
  // Session tracking (moved from module-level variables)
  sessionCompletedSteps: Set<string>;
  sessionCurrentStepId: string | null;
  
  // Callback mappings for action-to-step
  currentStepCallbacks: Map<string, TutorialStepCallback>;
  
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
  isStepCompletedById: (stepId: string) => boolean;
  
  // Step completion triggers
  triggerStepCompletion: (stepId: string) => void;
  completeCurrentStep: () => void;
  
  // Callback management
  setStepCallback: (stepId: string, callback: TutorialStepCallback) => void;
  clearStepCallbacks: () => void;
  
  // Achievement integration
  markTutorialCompleted: () => void;
}

const TUTORIAL_STORAGE_KEY = 'arcane-codex-tutorial';

// Default step ID mapping
const STEP_IDS: string[] = [
  'welcome-module-panel',
  'drag-module',
  'select-rotate',
  'connect-modules',
  'activate-machine',
  'save-to-codex',
  'export-share',
  'random-forge',
];

// Helper to get step ID by index
const getStepIdByIndex = (index: number): string => {
  return STEP_IDS[index] || `step-${index}`;
};

// Helper to get step index by ID
const getStepIndexById = (stepId: string): number => {
  return STEP_IDS.indexOf(stepId);
};

export const useTutorialStore = create<TutorialStore>()(
  persist(
    (set, get) => ({
      hasSeenWelcome: false,
      isTutorialActive: false,
      currentStep: 0,
      completedSteps: new Set<string>(),
      isTutorialEnabled: true,

      // Session tracking
      sessionCompletedSteps: new Set<string>(),
      sessionCurrentStepId: null,

      // Step callbacks
      currentStepCallbacks: new Map<string, TutorialStepCallback>(),

      setHasSeenWelcome: (seen) => {
        set({ hasSeenWelcome: seen });
      },

      startTutorial: () => {
        const stepId = getStepIdByIndex(0);
        set({ 
          isTutorialActive: true, 
          currentStep: 0, 
          hasSeenWelcome: true,
          sessionCurrentStepId: stepId,
          completedSteps: new Set<string>(),
          sessionCompletedSteps: new Set<string>(),
        });
        
        // Initialize callbacks for each step
        const callbacks = new Map<string, TutorialStepCallback>();
        STEP_IDS.forEach((id, index) => {
          let action: TutorialStepCallback['action'] = 'completeTutorial';
          switch (index) {
            case 1:
              action = 'addModule';
              break;
            case 2:
              action = 'selectModule';
              break;
            case 3:
              action = 'connectModules';
              break;
            case 4:
              action = 'activateMachine';
              break;
            case 5:
              action = 'saveMachine';
              break;
          }
          callbacks.set(id, { stepId: id, action });
        });
        set({ currentStepCallbacks: callbacks });
      },

      nextStep: () => {
        const state = get();
        const currentStepId = getStepIdByIndex(state.currentStep);
        
        // Mark current step as completed
        const newCompletedSteps = new Set(state.completedSteps);
        newCompletedSteps.add(currentStepId);
        
        const newSessionCompletedSteps = new Set(state.sessionCompletedSteps);
        newSessionCompletedSteps.add(currentStepId);
        
        const nextStepIndex = state.currentStep + 1;
        const nextStepId = getStepIdByIndex(nextStepIndex);
        
        if (nextStepIndex >= TOTAL_TUTORIAL_STEPS) {
          // Tutorial complete
          set({
            isTutorialActive: false,
            currentStep: 0,
            completedSteps: newCompletedSteps,
            sessionCompletedSteps: newSessionCompletedSteps,
            sessionCurrentStepId: null,
          });
        } else {
          set({
            currentStep: nextStepIndex,
            completedSteps: newCompletedSteps,
            sessionCompletedSteps: newSessionCompletedSteps,
            sessionCurrentStepId: nextStepId,
          });
        }
      },

      previousStep: () => {
        const state = get();
        if (state.currentStep > 0) {
          const prevStepIndex = state.currentStep - 1;
          const prevStepId = getStepIdByIndex(prevStepIndex);
          set({ 
            currentStep: prevStepIndex,
            sessionCurrentStepId: prevStepId,
          });
        }
      },

      goToStep: (step) => {
        const stepId = getStepIdByIndex(step);
        set({ 
          currentStep: step,
          sessionCurrentStepId: stepId,
        });
      },

      completeTutorial: () => {
        const state = get();
        const currentStepId = getStepIdByIndex(state.currentStep);
        
        const newCompletedSteps = new Set(state.completedSteps);
        newCompletedSteps.add(currentStepId);
        
        const newSessionCompletedSteps = new Set(state.sessionCompletedSteps);
        newSessionCompletedSteps.add(currentStepId);
        
        set({ 
          isTutorialActive: false, 
          currentStep: 0,
          completedSteps: newCompletedSteps,
          sessionCompletedSteps: newSessionCompletedSteps,
          sessionCurrentStepId: null,
          hasSeenWelcome: true,
        });
        
        // Mark tutorial as completed for achievement
        get().markTutorialCompleted();
      },

      skipTutorial: () => {
        set({ 
          isTutorialActive: false, 
          currentStep: 0,
          hasSeenWelcome: true,
          sessionCompletedSteps: new Set<string>(),
          sessionCurrentStepId: null,
        });
      },

      resetTutorial: () => {
        set({ 
          isTutorialActive: false, 
          currentStep: 0, 
          completedSteps: new Set<string>(),
          sessionCompletedSteps: new Set<string>(),
          sessionCurrentStepId: null,
          hasSeenWelcome: false,
        });
      },

      setTutorialEnabled: (enabled) => {
        set({ isTutorialEnabled: enabled });
      },

      isStepCompleted: (step) => {
        const state = get();
        const stepId = getStepIdByIndex(step);
        return state.completedSteps.has(stepId) || state.sessionCompletedSteps.has(stepId);
      },

      isStepCompletedById: (stepId) => {
        const state = get();
        return state.completedSteps.has(stepId) || state.sessionCompletedSteps.has(stepId);
      },

      // Trigger step completion from external actions
      triggerStepCompletion: (stepId) => {
        const state = get();
        
        // Only complete if this is the current step or earlier
        const stepIndex = getStepIndexById(stepId);
        if (stepIndex > state.currentStep && stepIndex !== -1) {
          return; // Don't complete future steps
        }
        
        if (!state.sessionCompletedSteps.has(stepId)) {
          const newCompletedSteps = new Set(state.completedSteps);
          newCompletedSteps.add(stepId);
          
          const newSessionCompletedSteps = new Set(state.sessionCompletedSteps);
          newSessionCompletedSteps.add(stepId);
          
          set({
            completedSteps: newCompletedSteps,
            sessionCompletedSteps: newSessionCompletedSteps,
          });
          
          // If this was the current step, advance to next
          if (state.sessionCurrentStepId === stepId) {
            get().nextStep();
          }
        }
      },

      // Complete the current step
      completeCurrentStep: () => {
        const state = get();
        if (state.sessionCurrentStepId) {
          get().triggerStepCompletion(state.sessionCurrentStepId);
        }
      },

      // Set callback for a specific step
      setStepCallback: (stepId, callback) => {
        const state = get();
        const newCallbacks = new Map(state.currentStepCallbacks);
        newCallbacks.set(stepId, callback);
        set({ currentStepCallbacks: newCallbacks });
      },

      // Clear all step callbacks
      clearStepCallbacks: () => {
        set({ currentStepCallbacks: new Map() });
      },

      // Mark tutorial as completed for achievement system
      markTutorialCompleted: () => {
        // Dispatch custom event for achievement system to listen
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tutorial:completed'));
        }
      },
    }),
    {
      name: TUTORIAL_STORAGE_KEY,
      partialize: (state) => ({ 
        hasSeenWelcome: state.hasSeenWelcome,
        isTutorialEnabled: state.isTutorialEnabled,
        completedSteps: Array.from(state.completedSteps),
      }),
      // FIX: Skip automatic hydration to prevent cascading state updates
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert array back to Set after rehydration
          const completedStepsArray = (state as any).completedSteps;
          if (Array.isArray(completedStepsArray)) {
            (state as any).completedSteps = new Set(completedStepsArray);
          }
        }
      },
    }
  )
);

// FIX: Helper to manually trigger hydration
export const hydrateTutorialStore = () => {
  useTutorialStore.persist.rehydrate();
};

// FIX: Helper to check if hydration is complete
export const isTutorialHydrated = () => {
  return useTutorialStore.persist.hasHydrated();
};

// Helper to check if user should see welcome modal
export const shouldShowWelcome = (): boolean => {
  const state = useTutorialStore.getState();
  return !state.hasSeenWelcome && state.isTutorialEnabled;
};

// Helper to get tutorial progress
export const getTutorialProgress = (): { current: number; total: number; percentage: number } => {
  const totalSteps = TOTAL_TUTORIAL_STEPS;
  const current = useTutorialStore.getState().currentStep;
  return {
    current: current + 1,
    total: totalSteps,
    percentage: ((current + 1) / totalSteps) * 100
  };
};

// Helper to check if a step is the current step
export const isCurrentStep = (stepId: string): boolean => {
  const state = useTutorialStore.getState();
  return state.sessionCurrentStepId === stepId;
};

// Helper to get the action type for current step
export const getCurrentStepAction = (): TutorialStepCallback['action'] | null => {
  const state = useTutorialStore.getState();
  if (!state.sessionCurrentStepId) return null;
  
  const callback = state.currentStepCallbacks.get(state.sessionCurrentStepId);
  return callback?.action || null;
};

export default useTutorialStore;
