/**
 * Tutorial Migration Test
 * 
 * Tests for the Round 80 tutorial migration.
 * Verifies AC0c: TUTORIAL_STEPS.length === 5
 */

import { describe, it, expect } from 'vitest';
import { TUTORIAL_STEPS, TOTAL_TUTORIAL_STEPS, getStepById, getStepByNumber } from '../data/tutorialSteps';

describe('Tutorial Migration (AC0c)', () => {
  it('should have exactly 5 tutorial steps', () => {
    expect(TUTORIAL_STEPS.length).toBe(5);
  });

  it('should export TOTAL_TUTORIAL_STEPS equal to 5', () => {
    expect(TOTAL_TUTORIAL_STEPS).toBe(5);
  });

  it('step numbers should be sequential from 0 to 4', () => {
    TUTORIAL_STEPS.forEach((step, index) => {
      expect(step.stepNumber).toBe(index);
    });
  });

  it('should have 5 essential steps covering core workflow', () => {
    // Per contract: (1) place module, (2) connect modules, (3) activate machine, 
    // (4) save to codex, (5) export
    expect(TUTORIAL_STEPS[0].id).toBe('place-module');
    expect(TUTORIAL_STEPS[1].id).toBe('connect-modules');
    expect(TUTORIAL_STEPS[2].id).toBe('activate-machine');
    expect(TUTORIAL_STEPS[3].id).toBe('save-to-codex');
    expect(TUTORIAL_STEPS[4].id).toBe('export-share');
  });

  it('should have correct step titles', () => {
    expect(TUTORIAL_STEPS[0].title).toBe('Place Your First Module');
    expect(TUTORIAL_STEPS[1].title).toBe('Connect Your Modules');
    expect(TUTORIAL_STEPS[2].title).toBe('Activate Your Machine');
    expect(TUTORIAL_STEPS[3].title).toBe('Save to Your Codex');
    expect(TUTORIAL_STEPS[4].title).toBe('Export and Share');
  });

  it('should have correct actions', () => {
    expect(TUTORIAL_STEPS[0].action).toBe('drag');
    expect(TUTORIAL_STEPS[1].action).toBe('connect');
    expect(TUTORIAL_STEPS[2].action).toBe('click');
    expect(TUTORIAL_STEPS[3].action).toBe('click');
    expect(TUTORIAL_STEPS[4].action).toBe('click');
  });

  it('should have valid target selectors', () => {
    TUTORIAL_STEPS.forEach(step => {
      expect(step.targetSelector).toBeDefined();
      expect(step.targetSelector.length).toBeGreaterThan(0);
    });
  });

  it('should have valid positions', () => {
    const validPositions = ['top', 'bottom', 'left', 'right'];
    TUTORIAL_STEPS.forEach(step => {
      expect(validPositions).toContain(step.position);
    });
  });

  it('should be able to find steps by ID', () => {
    expect(getStepById('place-module')).toBeDefined();
    expect(getStepById('connect-modules')).toBeDefined();
    expect(getStepById('activate-machine')).toBeDefined();
    expect(getStepById('save-to-codex')).toBeDefined();
    expect(getStepById('export-share')).toBeDefined();
  });

  it('should be able to find steps by number', () => {
    expect(getStepByNumber(0)?.id).toBe('place-module');
    expect(getStepByNumber(1)?.id).toBe('connect-modules');
    expect(getStepByNumber(2)?.id).toBe('activate-machine');
    expect(getStepByNumber(3)?.id).toBe('save-to-codex');
    expect(getStepByNumber(4)?.id).toBe('export-share');
  });

  it('each step should have required properties', () => {
    TUTORIAL_STEPS.forEach(step => {
      expect(step.id).toBeDefined();
      expect(step.stepNumber).toBeDefined();
      expect(step.title).toBeDefined();
      expect(step.description).toBeDefined();
      expect(step.targetSelector).toBeDefined();
      expect(step.position).toBeDefined();
      expect(step.action).toBeDefined();
    });
  });

  it('action steps should have action descriptions', () => {
    TUTORIAL_STEPS.forEach(step => {
      if (step.action !== 'none') {
        expect(step.actionDescription).toBeDefined();
        expect(step.actionDescription?.length).toBeGreaterThan(0);
      }
    });
  });
});
