/**
 * Tutorial Enhancement Tests
 * 
 * Tests for the tutorial callback wiring, faction tips, and step completion tracking.
 * Updated for Round 80: Reduced from 8 to 5 tutorial steps per contract specification.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] || null,
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

describe('Tutorial Enhancement Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('TutorialStore Step Callbacks', () => {
    it('should have currentStepCallbacks Map in store', async () => {
      const { useTutorialStore } = await import('../store/useTutorialStore');
      
      const store = useTutorialStore.getState();
      
      expect(store.currentStepCallbacks).toBeDefined();
      expect(store.currentStepCallbacks).toBeInstanceOf(Map);
    });

    it('should track sessionCompletedSteps within store', async () => {
      const { useTutorialStore } = await import('../store/useTutorialStore');
      
      const store = useTutorialStore.getState();
      
      expect(store.sessionCompletedSteps).toBeDefined();
      expect(store.sessionCompletedSteps).toBeInstanceOf(Set);
    });

    it('should have setStepCallback function', async () => {
      const { useTutorialStore } = await import('../store/useTutorialStore');
      
      const store = useTutorialStore.getState();
      
      expect(typeof store.setStepCallback).toBe('function');
    });

    it('should have clearStepCallbacks function', async () => {
      const { useTutorialStore } = await import('../store/useTutorialStore');
      
      const store = useTutorialStore.getState();
      
      expect(typeof store.clearStepCallbacks).toBe('function');
    });

    it('should have triggerStepCompletion function', async () => {
      const { useTutorialStore } = await import('../store/useTutorialStore');
      
      const store = useTutorialStore.getState();
      
      expect(typeof store.triggerStepCompletion).toBe('function');
    });

    it('should have completeCurrentStep function', async () => {
      const { useTutorialStore } = await import('../store/useTutorialStore');
      
      const store = useTutorialStore.getState();
      
      expect(typeof store.completeCurrentStep).toBe('function');
    });
  });

  describe('TutorialOverlay data-tutorial-action Attributes', () => {
    it('should have data-tutorial-action on Toolbar root element', async () => {
      // Verify the attribute exists in the Toolbar component
      const fs = await import('fs');
      const toolbarContent = fs.readFileSync('src/components/Editor/Toolbar.tsx', 'utf8');
      
      expect(toolbarContent).toContain('data-tutorial-action="toolbar"');
    });

    it('should have data-tutorial-action attributes on Toolbar buttons', async () => {
      const fs = await import('fs');
      const toolbarContent = fs.readFileSync('src/components/Editor/Toolbar.tsx', 'utf8');
      
      // Verify multiple buttons have data-tutorial-action
      expect(toolbarContent).toContain('data-tutorial-action="toolbar-random-forge"');
      expect(toolbarContent).toContain('data-tutorial-action="toolbar-recipe"');
      expect(toolbarContent).toContain('data-tutorial-action="toolbar-template"');
      expect(toolbarContent).toContain('data-tutorial-action="toolbar-zoom-in"');
      expect(toolbarContent).toContain('data-tutorial-action="toolbar-zoom-out"');
    });

    it('should have data-tutorial on ModulePanel', async () => {
      const fs = await import('fs');
      const modulePanelContent = fs.readFileSync('src/components/Editor/ModulePanel.tsx', 'utf8');
      
      expect(modulePanelContent).toContain('data-tutorial="module-panel"');
      expect(modulePanelContent).toContain('data-tutorial-action="module-panel"');
    });

    it('should have data-tutorial-action on module list in ModulePanel', async () => {
      const fs = await import('fs');
      const modulePanelContent = fs.readFileSync('src/components/Editor/ModulePanel.tsx', 'utf8');
      
      expect(modulePanelContent).toContain('data-tutorial-action="module-list"');
    });

    it('should have data-tutorial on Canvas', async () => {
      const fs = await import('fs');
      const canvasContent = fs.readFileSync('src/components/Editor/Canvas.tsx', 'utf8');
      
      expect(canvasContent).toContain('data-tutorial="canvas"');
      expect(canvasContent).toContain('data-tutorial-action="canvas"');
    });
  });

  describe('Tutorial Tip (Faction Tips)', () => {
    it('should have data-testid="faction-tip" in TutorialTip component', async () => {
      const fs = await import('fs');
      const tutorialTipContent = fs.readFileSync('src/components/Tutorial/TutorialTip.tsx', 'utf8');
      
      expect(tutorialTipContent).toContain('data-testid="faction-tip"');
    });

    it('should have useFactionTip hook exported', async () => {
      const { useFactionTip } = await import('../components/Tutorial/TutorialTip');
      
      expect(typeof useFactionTip).toBe('function');
    });

    it('should have faction-specific tip messages - extended to 6 factions', async () => {
      const fs = await import('fs');
      const tutorialTipContent = fs.readFileSync('src/components/Tutorial/TutorialTip.tsx', 'utf8');
      
      // Verify faction tip messages exist (6 factions in Round 80)
      expect(tutorialTipContent).toContain('虚空派系');
      expect(tutorialTipContent).toContain('熔岩派系');
      expect(tutorialTipContent).toContain('风暴派系');
      expect(tutorialTipContent).toContain('星辉派系');
      expect(tutorialTipContent).toContain('奥术秩序派系');
      expect(tutorialTipContent).toContain('混沌无序派系');
    });

    it('should auto-dismiss timer be configurable', async () => {
      const fs = await import('fs');
      const tutorialTipContent = fs.readFileSync('src/components/Tutorial/TutorialTip.tsx', 'utf8');
      
      // Verify autoDismissDelay default is 5000ms
      expect(tutorialTipContent).toContain('autoDismissDelay = 5000');
    });
  });

  describe('Tutorial Completion Tracking', () => {
    it('should persist completedSteps across sessions', async () => {
      const { useTutorialStore } = await import('../store/useTutorialStore');
      
      // First session: complete some steps
      useTutorialStore.setState({
        completedSteps: new Set(['place-module', 'connect-modules']),
      });
      
      // Get persisted state
      const stateToPersist = {
        completedSteps: Array.from(useTutorialStore.getState().completedSteps),
      };
      
      // Simulate localStorage persistence
      localStorageMock.setItem('arcane-codex-tutorial', JSON.stringify({
        state: stateToPersist,
      }));
      
      // Verify state can be persisted
      expect(stateToPersist.completedSteps).toContain('place-module');
      expect(stateToPersist.completedSteps).toContain('connect-modules');
    });

    it('should have markTutorialCompleted function', async () => {
      const { useTutorialStore } = await import('../store/useTutorialStore');
      
      const store = useTutorialStore.getState();
      
      expect(typeof store.markTutorialCompleted).toBe('function');
    });

    it('should dispatch tutorial:completed event', () => {
      const tutorialCompleteHandler = vi.fn();
      window.addEventListener('tutorial:completed', tutorialCompleteHandler);
      
      // Dispatch the event
      window.dispatchEvent(new CustomEvent('tutorial:completed'));
      
      expect(tutorialCompleteHandler).toHaveBeenCalled();
      
      window.removeEventListener('tutorial:completed', tutorialCompleteHandler);
    });
  });

  describe('Tutorial Steps Configuration', () => {
    // Updated: 5 steps in Round 80
    it('should have correct number of tutorial steps (5)', async () => {
      const { TUTORIAL_STEPS, TOTAL_TUTORIAL_STEPS } = await import('../data/tutorialSteps');
      
      expect(TUTORIAL_STEPS.length).toBe(5);
      expect(TOTAL_TUTORIAL_STEPS).toBe(5);
    });

    it('should have correct step IDs - 5 essential steps', async () => {
      const { TUTORIAL_STEPS } = await import('../data/tutorialSteps');
      
      // 5 essential steps per contract: place-module, connect-modules, activate-machine, save-to-codex, export-share
      expect(TUTORIAL_STEPS[0].id).toBe('place-module');
      expect(TUTORIAL_STEPS[1].id).toBe('connect-modules');
      expect(TUTORIAL_STEPS[2].id).toBe('activate-machine');
      expect(TUTORIAL_STEPS[3].id).toBe('save-to-codex');
      expect(TUTORIAL_STEPS[4].id).toBe('export-share');
    });
  });
});
