/**
 * Tutorial System Tests
 * 
 * Tests for the tutorial overlay, spotlight, and step navigation.
 * Updated for Round 80: Reduced from 8 to 5 tutorial steps per contract specification.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { TUTORIAL_STEPS, getStepById, getStepByNumber, TOTAL_TUTORIAL_STEPS } from '../data/tutorialSteps';
import { useTutorialStore } from '../store/useTutorialStore';

// Test Tutorial Step Definitions
describe('Tutorial Step Definitions', () => {
  // Updated: 5 steps in Round 80
  it('should have exactly 5 tutorial steps', () => {
    expect(TUTORIAL_STEPS.length).toBe(5);
  });

  it('should have TOTAL_TUTORIAL_STEPS constant equal to array length', () => {
    expect(TOTAL_TUTORIAL_STEPS).toBe(5);
  });

  it('each step should have required properties', () => {
    TUTORIAL_STEPS.forEach((step) => {
      expect(step.id).toBeDefined();
      expect(step.stepNumber).toBeDefined();
      expect(typeof step.stepNumber).toBe('number');
      expect(step.title).toBeDefined();
      expect(step.description).toBeDefined();
      expect(step.targetSelector).toBeDefined();
      expect(step.position).toMatch(/^(top|bottom|left|right)$/);
      expect(step.action).toMatch(/^(wait|click|drag|connect|none)$/);
    });
  });

  it('step numbers should be sequential from 0 to 4', () => {
    TUTORIAL_STEPS.forEach((step, index) => {
      expect(step.stepNumber).toBe(index);
    });
  });

  it('step IDs should be unique', () => {
    const ids = TUTORIAL_STEPS.map(step => step.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should find step by ID', () => {
    const step = getStepById('place-module');
    expect(step).toBeDefined();
    expect(step?.stepNumber).toBe(0);
    expect(step?.title).toContain('Place');
  });

  it('should find step by number', () => {
    const step = getStepByNumber(2);
    expect(step).toBeDefined();
    expect(step?.id).toBe('activate-machine');
    expect(step?.title).toContain('Activate');
  });

  it('should return undefined for invalid step ID', () => {
    const step = getStepById('non-existent-step');
    expect(step).toBeUndefined();
  });

  it('should return undefined for invalid step number', () => {
    const step = getStepByNumber(99);
    expect(step).toBeUndefined();
  });

  it('all steps should have valid target selectors', () => {
    TUTORIAL_STEPS.forEach((step) => {
      expect(step.targetSelector).toMatch(/^\[.*\]|\.\w+|#\w+/);
    });
  });

  // Updated: 5 essential steps per contract
  it('5 essential steps should cover basic workflow', () => {
    // place-module, connect-modules, activate-machine, save-to-codex, export-share
    expect(TUTORIAL_STEPS[0].id).toBe('place-module');
    expect(TUTORIAL_STEPS[1].id).toBe('connect-modules');
    expect(TUTORIAL_STEPS[2].id).toBe('activate-machine');
    expect(TUTORIAL_STEPS[3].id).toBe('save-to-codex');
    expect(TUTORIAL_STEPS[4].id).toBe('export-share');
  });

  it('each step should have action description when action is not "none"', () => {
    TUTORIAL_STEPS.forEach((step) => {
      if (step.action !== 'none') {
        expect(step.actionDescription).toBeDefined();
        expect(step.actionDescription?.length).toBeGreaterThan(0);
      }
    });
  });

  it('export-share step should have click action', () => {
    const exportStep = getStepByNumber(4);
    expect(exportStep?.action).toBe('click');
  });
});

// Test Tutorial Store
describe('Tutorial Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useTutorialStore.getState();
    store.resetTutorial();
  });

  it('should start with tutorial inactive', () => {
    const { isTutorialActive, currentStep } = useTutorialStore.getState();
    expect(isTutorialActive).toBe(false);
    expect(currentStep).toBe(0);
  });

  it('should start tutorial when startTutorial is called', () => {
    const { startTutorial } = useTutorialStore.getState();
    
    act(() => {
      startTutorial();
    });
    
    const { isTutorialActive, currentStep } = useTutorialStore.getState();
    expect(isTutorialActive).toBe(true);
    expect(currentStep).toBe(0);
  });

  it('should advance to next step when nextStep is called', () => {
    const store = useTutorialStore.getState();
    
    act(() => {
      store.startTutorial();
      store.nextStep();
    });
    
    const { currentStep } = useTutorialStore.getState();
    expect(currentStep).toBe(1);
  });

  it('should go back to previous step when previousStep is called', () => {
    const store = useTutorialStore.getState();
    
    act(() => {
      store.startTutorial();
      store.nextStep();
      store.nextStep();
      store.previousStep();
    });
    
    const { currentStep } = useTutorialStore.getState();
    expect(currentStep).toBe(1);
  });

  it('should go to specific step when goToStep is called', () => {
    const store = useTutorialStore.getState();
    
    act(() => {
      store.startTutorial();
      store.goToStep(3);
    });
    
    const { currentStep } = useTutorialStore.getState();
    expect(currentStep).toBe(3);
  });

  it('should complete tutorial when completeTutorial is called', () => {
    const store = useTutorialStore.getState();
    
    act(() => {
      store.startTutorial();
      store.completeTutorial();
    });
    
    const { isTutorialActive } = useTutorialStore.getState();
    expect(isTutorialActive).toBe(false);
  });

  it('should skip tutorial when skipTutorial is called', () => {
    const store = useTutorialStore.getState();
    
    act(() => {
      store.startTutorial();
      store.nextStep();
      store.nextStep();
      store.skipTutorial();
    });
    
    const { isTutorialActive, currentStep } = useTutorialStore.getState();
    expect(isTutorialActive).toBe(false);
    expect(currentStep).toBe(0);
  });

  it('should reset tutorial state', () => {
    const store = useTutorialStore.getState();
    
    act(() => {
      store.startTutorial();
      store.nextStep();
      store.nextStep();
      store.resetTutorial();
    });
    
    const { isTutorialActive, currentStep, hasSeenWelcome } = useTutorialStore.getState();
    expect(isTutorialActive).toBe(false);
    expect(currentStep).toBe(0);
    expect(hasSeenWelcome).toBe(false);
  });

  it('should mark tutorial as seen when completed', () => {
    const store = useTutorialStore.getState();
    
    act(() => {
      store.startTutorial();
      store.completeTutorial();
    });
    
    const { hasSeenWelcome } = useTutorialStore.getState();
    expect(hasSeenWelcome).toBe(true);
  });
});
