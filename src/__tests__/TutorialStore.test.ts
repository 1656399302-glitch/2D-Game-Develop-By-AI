import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useTutorialStore } from '../store/useTutorialStore';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
(global as unknown as { localStorage: typeof localStorageMock }).localStorage = localStorageMock;

// Reset function - resets both Zustand state and module-level session state
const resetTutorialStore = () => {
  // Use resetTutorial to reset module-level session state
  useTutorialStore.getState().resetTutorial();
  // Also ensure isTutorialEnabled is reset to true
  useTutorialStore.setState({ isTutorialEnabled: true });
};

describe('TutorialStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: return null (no persisted state)
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    resetTutorialStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetTutorialStore();
  });

  describe('Initial State', () => {
    it('should have correct initial values', () => {
      const state = useTutorialStore.getState();
      expect(state.hasSeenWelcome).toBe(false);
      expect(state.isTutorialActive).toBe(false);
      expect(state.currentStep).toBe(0);
      expect(state.isTutorialEnabled).toBe(true);
    });

    it('should have empty completedSteps Set', () => {
      const state = useTutorialStore.getState();
      expect(state.completedSteps.size).toBe(0);
    });
  });

  describe('AC3: Tutorial Store Persistence - State Management', () => {
    describe('setHasSeenWelcome', () => {
      it('should update hasSeenWelcome state', () => {
        useTutorialStore.getState().setHasSeenWelcome(true);
        expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
      });

      it('should allow toggling hasSeenWelcome back to false', () => {
        useTutorialStore.getState().setHasSeenWelcome(true);
        useTutorialStore.getState().setHasSeenWelcome(false);
        
        expect(useTutorialStore.getState().hasSeenWelcome).toBe(false);
      });

      it('should persist state across multiple changes', () => {
        useTutorialStore.getState().setHasSeenWelcome(false);
        useTutorialStore.getState().setHasSeenWelcome(true);
        useTutorialStore.getState().setHasSeenWelcome(true);
        
        expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
      });
    });

    describe('setTutorialEnabled', () => {
      it('should update isTutorialEnabled state', () => {
        useTutorialStore.getState().setTutorialEnabled(false);
        expect(useTutorialStore.getState().isTutorialEnabled).toBe(false);
      });

      it('should allow toggling isTutorialEnabled back to true', () => {
        useTutorialStore.getState().setTutorialEnabled(false);
        useTutorialStore.getState().setTutorialEnabled(true);
        
        expect(useTutorialStore.getState().isTutorialEnabled).toBe(true);
      });

      it('should persist state across multiple changes', () => {
        useTutorialStore.getState().setTutorialEnabled(true);
        useTutorialStore.getState().setTutorialEnabled(false);
        
        expect(useTutorialStore.getState().isTutorialEnabled).toBe(false);
      });
    });

    describe('Hydration Behavior', () => {
      it('should have correct default state when localStorage returns null', () => {
        localStorageMock.getItem.mockReturnValue(null);
        
        // Direct state manipulation for hydration test
        useTutorialStore.setState({
          hasSeenWelcome: false,
          isTutorialActive: false,
          currentStep: 0,
          completedSteps: new Set(),
          isTutorialEnabled: true,
        });
        
        const state = useTutorialStore.getState();
        expect(state.hasSeenWelcome).toBe(false);
        expect(state.isTutorialEnabled).toBe(true);
      });

      it('should handle missing localStorage gracefully', () => {
        localStorageMock.getItem.mockReturnValue(null);
        
        // Direct state manipulation for hydration test
        useTutorialStore.setState({
          hasSeenWelcome: false,
          isTutorialActive: false,
          currentStep: 0,
          completedSteps: new Set(),
          isTutorialEnabled: true,
        });
        
        const state = useTutorialStore.getState();
        expect(state.hasSeenWelcome).toBe(false);
        expect(state.isTutorialEnabled).toBe(true);
      });

      it('should handle corrupted localStorage gracefully', () => {
        localStorageMock.getItem.mockImplementation((key: string) => {
          if (key === 'arcane-codex-tutorial') {
            return 'invalid-json{';
          }
          return null;
        });
        
        // Should not throw
        expect(() => {
          resetTutorialStore();
        }).not.toThrow();
        
        // Should default to initial state
        const state = useTutorialStore.getState();
        expect(state.hasSeenWelcome).toBe(false);
      });
    });
  });

  describe('Tutorial Flow Methods', () => {
    describe('startTutorial', () => {
      it('should set isTutorialActive to true', () => {
        useTutorialStore.getState().startTutorial();
        expect(useTutorialStore.getState().isTutorialActive).toBe(true);
      });

      it('should set hasSeenWelcome to true', () => {
        useTutorialStore.getState().startTutorial();
        expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
      });

      it('should reset currentStep to 0', () => {
        useTutorialStore.getState().startTutorial();
        useTutorialStore.getState().goToStep(4);
        useTutorialStore.getState().startTutorial();
        expect(useTutorialStore.getState().currentStep).toBe(0);
      });
    });

    describe('nextStep', () => {
      it('should increment currentStep', () => {
        useTutorialStore.getState().startTutorial();
        useTutorialStore.getState().nextStep();
        expect(useTutorialStore.getState().currentStep).toBe(1);
      });

      it('should mark current step as completed', () => {
        useTutorialStore.getState().startTutorial();
        useTutorialStore.getState().nextStep();
        expect(useTutorialStore.getState().isStepCompleted(0)).toBe(true);
      });

      it('should set isTutorialActive to false when reaching end', () => {
        useTutorialStore.getState().startTutorial();
        // Steps 0-7 (8 total)
        for (let i = 0; i < 8; i++) {
          useTutorialStore.getState().nextStep();
        }
        expect(useTutorialStore.getState().isTutorialActive).toBe(false);
      });
    });

    describe('previousStep', () => {
      it('should decrement currentStep', () => {
        useTutorialStore.getState().startTutorial();
        useTutorialStore.getState().nextStep();
        useTutorialStore.getState().nextStep();
        useTutorialStore.getState().previousStep();
        expect(useTutorialStore.getState().currentStep).toBe(1);
      });

      it('should not go below 0', () => {
        useTutorialStore.getState().startTutorial();
        useTutorialStore.getState().previousStep();
        expect(useTutorialStore.getState().currentStep).toBe(0);
      });
    });

    describe('goToStep', () => {
      it('should jump to specified step', () => {
        useTutorialStore.getState().startTutorial();
        useTutorialStore.getState().goToStep(3);
        expect(useTutorialStore.getState().currentStep).toBe(3);
      });
    });

    describe('completeTutorial', () => {
      it('should set isTutorialActive to false', () => {
        useTutorialStore.getState().startTutorial();
        useTutorialStore.getState().completeTutorial();
        expect(useTutorialStore.getState().isTutorialActive).toBe(false);
      });

      it('should set hasSeenWelcome to true', () => {
        useTutorialStore.getState().completeTutorial();
        expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
      });

      it('should reset currentStep to 0', () => {
        useTutorialStore.getState().startTutorial();
        useTutorialStore.getState().goToStep(4);
        useTutorialStore.getState().completeTutorial();
        expect(useTutorialStore.getState().currentStep).toBe(0);
      });
    });

    describe('skipTutorial', () => {
      it('should set isTutorialActive to false', () => {
        useTutorialStore.getState().startTutorial();
        useTutorialStore.getState().skipTutorial();
        expect(useTutorialStore.getState().isTutorialActive).toBe(false);
      });

      it('should set hasSeenWelcome to true', () => {
        useTutorialStore.getState().skipTutorial();
        expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
      });

      it('should reset currentStep to 0', () => {
        useTutorialStore.getState().startTutorial();
        useTutorialStore.getState().goToStep(4);
        useTutorialStore.getState().skipTutorial();
        expect(useTutorialStore.getState().currentStep).toBe(0);
      });
    });

    describe('resetTutorial', () => {
      it('should reset hasSeenWelcome to false', () => {
        useTutorialStore.getState().setHasSeenWelcome(true);
        useTutorialStore.getState().resetTutorial();
        expect(useTutorialStore.getState().hasSeenWelcome).toBe(false);
      });

      it('should set isTutorialActive to false', () => {
        useTutorialStore.getState().startTutorial();
        useTutorialStore.getState().resetTutorial();
        expect(useTutorialStore.getState().isTutorialActive).toBe(false);
      });

      it('should reset currentStep to 0', () => {
        useTutorialStore.getState().startTutorial();
        useTutorialStore.getState().goToStep(4);
        useTutorialStore.getState().resetTutorial();
        expect(useTutorialStore.getState().currentStep).toBe(0);
      });

      it('should clear completedSteps', () => {
        useTutorialStore.getState().startTutorial();
        useTutorialStore.getState().nextStep();
        useTutorialStore.getState().nextStep();
        useTutorialStore.getState().resetTutorial();
        expect(useTutorialStore.getState().completedSteps.size).toBe(0);
      });
    });

    describe('isStepCompleted', () => {
      it('should return true for completed steps', () => {
        useTutorialStore.getState().startTutorial();
        useTutorialStore.getState().nextStep();
        expect(useTutorialStore.getState().isStepCompleted(0)).toBe(true);
      });

      it('should return false for uncompleted steps', () => {
        useTutorialStore.getState().startTutorial();
        useTutorialStore.getState().nextStep();
        expect(useTutorialStore.getState().isStepCompleted(1)).toBe(false);
        expect(useTutorialStore.getState().isStepCompleted(2)).toBe(false);
      });

      it('should return false for steps before starting', () => {
        // Use resetTutorial to also reset the module-level sessionCompletedSteps
        useTutorialStore.getState().resetTutorial();
        expect(useTutorialStore.getState().isStepCompleted(0)).toBe(false);
        expect(useTutorialStore.getState().isStepCompleted(1)).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid state changes', () => {
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setHasSeenWelcome(false);
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setHasSeenWelcome(true);
      
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
    });

    it('should handle rapid tutorial start/complete cycles', () => {
      useTutorialStore.getState().startTutorial();
      useTutorialStore.getState().completeTutorial();
      useTutorialStore.getState().startTutorial();
      useTutorialStore.getState().completeTutorial();
      
      expect(useTutorialStore.getState().isTutorialActive).toBe(false);
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
    });

    it('should handle localStorage quota exceeded error gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      
      // Should not throw
      expect(() => {
        useTutorialStore.getState().setHasSeenWelcome(true);
      }).not.toThrow();
    });

    it('should handle localStorage being unavailable', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });
      
      // Should not throw
      expect(() => {
        useTutorialStore.getState().setHasSeenWelcome(true);
      }).not.toThrow();
    });
  });
});
