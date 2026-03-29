import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTutorialStore } from '../store/useTutorialStore';
import { TUTORIAL_STEPS, getStepByNumber, TOTAL_TUTORIAL_STEPS, WELCOME_CONTENT, COMPLETION_CONTENT } from '../data/tutorialSteps';

// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
(global as unknown as { localStorage: typeof localStorageMock }).localStorage = localStorageMock;

// Helper to reset tutorial store
const resetTutorialStore = () => {
  useTutorialStore.setState({
    hasSeenWelcome: false,
    isTutorialActive: false,
    currentStep: 0,
    completedSteps: new Set(),
    isTutorialEnabled: true,
  });
};

describe('Tutorial System', () => {
  beforeEach(() => {
    resetTutorialStore();
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Tutorial Steps Data', () => {
    it('should have 6 tutorial steps', () => {
      expect(TUTORIAL_STEPS).toHaveLength(6);
    });

    it('each step should have required properties', () => {
      TUTORIAL_STEPS.forEach((step, index) => {
        expect(step.id).toBeDefined();
        expect(step.stepNumber).toBe(index);
        expect(step.title).toBeDefined();
        expect(step.description).toBeDefined();
        expect(step.targetSelector).toBeDefined();
        expect(step.position).toBeDefined();
        expect(['top', 'bottom', 'left', 'right']).toContain(step.position);
        expect(step.action).toBeDefined();
        expect(['wait', 'click', 'drag', 'connect', 'none']).toContain(step.action);
      });
    });

    it('getStepByNumber returns correct step', () => {
      const step0 = getStepByNumber(0);
      expect(step0).toBeDefined();
      expect(step0?.title).toBe('Welcome to the Arcane Machine Codex');

      const step5 = getStepByNumber(5);
      expect(step5).toBeDefined();
      expect(step5?.title).toBe('Save to Your Codex');
    });

    it('TOTAL_TUTORIAL_STEPS should be 6', () => {
      expect(TOTAL_TUTORIAL_STEPS).toBe(6);
    });

    it('first step has welcome content', () => {
      const step0 = getStepByNumber(0);
      expect(step0?.action).toBe('none');
      expect(step0?.position).toBe('right');
    });

    it('last step is save to codex', () => {
      const step5 = getStepByNumber(5);
      expect(step5?.action).toBe('click');
      expect(step5?.targetSelector).toBe('[data-tutorial="save-button"]');
    });
  });

  describe('Tutorial Store', () => {
    it('initial state should be correct', () => {
      const state = useTutorialStore.getState();
      expect(state.hasSeenWelcome).toBe(false);
      expect(state.isTutorialActive).toBe(false);
      expect(state.currentStep).toBe(0);
      expect(state.isTutorialEnabled).toBe(true);
    });

    it('startTutorial should activate tutorial and set hasSeenWelcome', () => {
      const { startTutorial } = useTutorialStore.getState();
      startTutorial();

      const state = useTutorialStore.getState();
      expect(state.isTutorialActive).toBe(true);
      expect(state.hasSeenWelcome).toBe(true);
      expect(state.currentStep).toBe(0);
    });

    it('nextStep should advance to next step', () => {
      const store = useTutorialStore.getState();
      store.startTutorial();
      store.nextStep();

      const state = useTutorialStore.getState();
      expect(state.currentStep).toBe(1);
    });

    it('previousStep should go back to previous step', () => {
      const store = useTutorialStore.getState();
      store.startTutorial();
      store.nextStep();
      store.nextStep();
      store.previousStep();

      const state = useTutorialStore.getState();
      expect(state.currentStep).toBe(1);
    });

    it('goToStep should jump to specific step', () => {
      const store = useTutorialStore.getState();
      store.startTutorial();
      store.goToStep(4);

      const state = useTutorialStore.getState();
      expect(state.currentStep).toBe(4);
    });

    it('skipTutorial should deactivate tutorial', () => {
      const store = useTutorialStore.getState();
      store.startTutorial();
      store.nextStep();
      store.nextStep();
      store.skipTutorial();

      const state = useTutorialStore.getState();
      expect(state.isTutorialActive).toBe(false);
      expect(state.currentStep).toBe(0);
      expect(state.hasSeenWelcome).toBe(true);
    });

    it('completeTutorial should mark tutorial as finished', () => {
      const store = useTutorialStore.getState();
      store.startTutorial();
      store.completeTutorial();

      const state = useTutorialStore.getState();
      expect(state.isTutorialActive).toBe(false);
      expect(state.hasSeenWelcome).toBe(true);
    });

    it('resetTutorial should reset all state', () => {
      const store = useTutorialStore.getState();
      store.startTutorial();
      store.nextStep();
      store.nextStep();
      store.resetTutorial();

      const state = useTutorialStore.getState();
      expect(state.hasSeenWelcome).toBe(false);
      expect(state.isTutorialActive).toBe(false);
      expect(state.currentStep).toBe(0);
    });

    it('setTutorialEnabled should toggle tutorial enabled state', () => {
      const store = useTutorialStore.getState();
      store.setTutorialEnabled(false);

      const state = useTutorialStore.getState();
      expect(state.isTutorialEnabled).toBe(false);
    });

    it('setHasSeenWelcome should mark user as having seen welcome', () => {
      const store = useTutorialStore.getState();
      store.setHasSeenWelcome(true);

      const state = useTutorialStore.getState();
      expect(state.hasSeenWelcome).toBe(true);
    });
  });

  describe('Welcome Content', () => {
    it('WELCOME_CONTENT has required properties', () => {
      expect(WELCOME_CONTENT.title).toBeDefined();
      expect(WELCOME_CONTENT.subtitle).toBeDefined();
      expect(WELCOME_CONTENT.description).toBeDefined();
      expect(WELCOME_CONTENT.features).toHaveLength(4);
      expect(WELCOME_CONTENT.startTutorial).toBe('Start Tutorial');
      expect(WELCOME_CONTENT.skipTutorial).toBe('Skip & Explore');
    });

    it('all features have icon, title, and description', () => {
      WELCOME_CONTENT.features.forEach(feature => {
        expect(feature.icon).toBeDefined();
        expect(feature.title).toBeDefined();
        expect(feature.description).toBeDefined();
      });
    });
  });

  describe('Completion Content', () => {
    it('COMPLETION_CONTENT has required properties', () => {
      expect(COMPLETION_CONTENT.title).toBe('Tutorial Complete!');
      expect(COMPLETION_CONTENT.subtitle).toBeDefined();
      expect(COMPLETION_CONTENT.message).toBeDefined();
      expect(COMPLETION_CONTENT.tips).toHaveLength(3);
      expect(COMPLETION_CONTENT.continue).toBe('Start Building');
      expect(COMPLETION_CONTENT.replayTutorial).toBe('Replay Tutorial');
    });
  });

  describe('Tutorial Flow Integration', () => {
    it('complete tutorial flow works correctly', () => {
      const store = useTutorialStore.getState();
      
      // Start tutorial
      store.startTutorial();
      expect(useTutorialStore.getState().isTutorialActive).toBe(true);
      expect(useTutorialStore.getState().currentStep).toBe(0);

      // Go through all steps
      for (let i = 1; i < 6; i++) {
        store.nextStep();
        expect(useTutorialStore.getState().currentStep).toBe(i);
      }

      // Complete tutorial
      store.completeTutorial();
      expect(useTutorialStore.getState().isTutorialActive).toBe(false);
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
    });

    it('skip then restart tutorial works', () => {
      const store = useTutorialStore.getState();
      
      // Start and skip
      store.startTutorial();
      store.nextStep();
      store.skipTutorial();
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);

      // Restart should go to step 0
      store.startTutorial();
      expect(useTutorialStore.getState().currentStep).toBe(0);
    });

    it('tutorial can be reset and started fresh', () => {
      const store = useTutorialStore.getState();
      
      // Complete part of tutorial
      store.startTutorial();
      store.nextStep();
      store.nextStep();
      
      // Reset
      store.resetTutorial();
      
      // Should be able to start fresh
      store.startTutorial();
      expect(useTutorialStore.getState().currentStep).toBe(0);
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
    });

    it('navigating back to step 0 then forward works', () => {
      const store = useTutorialStore.getState();
      
      store.startTutorial();
      store.nextStep();
      store.nextStep();
      store.nextStep();
      expect(useTutorialStore.getState().currentStep).toBe(3);
      
      store.previousStep();
      store.previousStep();
      expect(useTutorialStore.getState().currentStep).toBe(1);
      
      store.nextStep();
      expect(useTutorialStore.getState().currentStep).toBe(2);
    });
  });
});
