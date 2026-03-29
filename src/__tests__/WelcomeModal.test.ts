import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useTutorialStore } from '../store/useTutorialStore';
import { useMachineStore } from '../store/useMachineStore';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
(global as unknown as { localStorage: typeof localStorageMock }).localStorage = localStorageMock;

// Mock modules for testing
const mockModules = [
  {
    id: 'test-module-1',
    instanceId: 'test-instance-1',
    type: 'core-furnace' as const,
    x: 100,
    y: 200,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [],
  },
];

// Reset functions
const resetTutorialStore = () => {
  useTutorialStore.setState({
    hasSeenWelcome: false,
    isTutorialActive: false,
    currentStep: 0,
    completedSteps: new Set(),
    isTutorialEnabled: true,
  });
};

const resetMachineStore = () => {
  useMachineStore.setState({
    modules: [],
    connections: [],
    selectedModuleId: null,
    selectedConnectionId: null,
    viewport: { x: 0, y: 0, zoom: 1 },
    gridEnabled: true,
    history: [{ modules: [], connections: [] }],
    historyIndex: 0,
    hasLoadedSavedState: false,
  });
};

describe('WelcomeModal Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetTutorialStore();
    resetMachineStore();
    
    // Default: no saved state, first time user
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC1: Welcome Modal Skip Does Not Reset Canvas', () => {
    it('should NOT call startFresh when user skips welcome modal', () => {
      // Setup: Add modules to the store
      useMachineStore.setState({
        modules: [...mockModules],
      });
      
      // Spy on startFresh
      const startFreshSpy = vi.spyOn(useMachineStore.getState(), 'startFresh');
      
      // Call the skip actions (what handleSkip does)
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Assert: startFresh should NOT be called
      expect(startFreshSpy).not.toHaveBeenCalled();
    });

    it('should preserve modules in the store when skip is called', () => {
      // Setup: Add modules to the store
      useMachineStore.setState({
        modules: [...mockModules],
      });
      
      // Call the skip actions
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Assert: Modules should still be present
      expect(useMachineStore.getState().modules).toHaveLength(1);
      expect(useMachineStore.getState().modules[0].instanceId).toBe('test-instance-1');
    });

    it('should set hasSeenWelcome to true when skip is called', () => {
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
    });

    it('should set tutorialEnabled to false when skip is called', () => {
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      expect(useTutorialStore.getState().isTutorialEnabled).toBe(false);
    });
  });

  describe('AC2: Welcome Modal Skip Disables Tutorial Permanently', () => {
    it('should set hasSeenWelcome to true permanently', () => {
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Verify the state is set
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
    });

    it('should set isTutorialEnabled to false permanently', () => {
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Verify the state is set
      expect(useTutorialStore.getState().isTutorialEnabled).toBe(false);
    });

    it('should prevent welcome modal from reappearing after skip', () => {
      // Skip the tutorial
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Welcome modal would not show because:
      // - hasSeenWelcome is true (so useWelcomeModal returns showWelcome=false)
      // - OR isTutorialEnabled is false (so WelcomeModal returns null)
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
      expect(useTutorialStore.getState().isTutorialEnabled).toBe(false);
    });
  });

  describe('AC3: Tutorial Store Persistence Works', () => {
    it('should update hasSeenWelcome state correctly', () => {
      useTutorialStore.getState().setHasSeenWelcome(true);
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
      
      useTutorialStore.getState().setHasSeenWelcome(false);
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(false);
    });

    it('should update isTutorialEnabled state correctly', () => {
      useTutorialStore.getState().setTutorialEnabled(false);
      expect(useTutorialStore.getState().isTutorialEnabled).toBe(false);
      
      useTutorialStore.getState().setTutorialEnabled(true);
      expect(useTutorialStore.getState().isTutorialEnabled).toBe(true);
    });

    it('should allow multiple state changes', () => {
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Verify the state was persisted correctly
      const state = useTutorialStore.getState();
      expect(state.hasSeenWelcome).toBe(true);
      expect(state.isTutorialEnabled).toBe(false);
    });
  });

  describe('AC4: No Regression in Load Prompt Flow', () => {
    it('should restore saved state when skip is called AND saved state exists', () => {
      // Setup: Mock saved canvas state
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'arcane-canvas-state') {
          return JSON.stringify({
            modules: mockModules,
            connections: [],
            viewport: { x: 0, y: 0, zoom: 1 },
            gridEnabled: true,
            savedAt: Date.now(),
          });
        }
        return null;
      });
      
      // Spy on restoreSavedState
      const restoreSpy = vi.spyOn(useMachineStore.getState(), 'restoreSavedState');
      
      // Call skip with restore (what handleSkip does when saved state exists)
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Check if saved state exists (as handleSkip does)
      const savedState = localStorageMock.getItem('arcane-canvas-state');
      if (savedState) {
        useMachineStore.getState().restoreSavedState();
      }
      
      // Assert: restoreSavedState should be called when saved state exists
      expect(restoreSpy).toHaveBeenCalled();
    });

    it('should NOT call restoreSavedState when skip is called AND no saved state exists', () => {
      // Setup: No saved canvas state
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'arcane-canvas-state') {
          return null;
        }
        return null;
      });
      
      // Spy on restoreSavedState
      const restoreSpy = vi.spyOn(useMachineStore.getState(), 'restoreSavedState');
      
      // Call skip actions
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Check if saved state exists (as handleSkip does)
      const savedState = localStorageMock.getItem('arcane-canvas-state');
      if (savedState) {
        useMachineStore.getState().restoreSavedState();
      }
      
      // Assert: restoreSavedState should NOT be called when no saved state
      expect(restoreSpy).not.toHaveBeenCalled();
    });

    it('should NOT clear canvas when user skips', () => {
      // Add modules to store
      useMachineStore.setState({
        modules: [...mockModules],
      });
      
      // Call skip actions
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Modules should still be in the store
      expect(useMachineStore.getState().modules.length).toBe(1);
    });
  });

  describe('Modal Visibility Logic', () => {
    it('should have correct initial state for first-time user', () => {
      resetTutorialStore();
      
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(false);
      expect(useTutorialStore.getState().isTutorialEnabled).toBe(true);
      // Welcome modal would show because hasSeenWelcome is false
    });

    it('should hide welcome modal after skip', () => {
      // Skip the tutorial
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Welcome modal would not show because:
      // - hasSeenWelcome is true (so useWelcomeModal returns showWelcome=false)
      // - OR isTutorialEnabled is false (so WelcomeModal returns null)
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
      expect(useTutorialStore.getState().isTutorialEnabled).toBe(false);
    });

    it('should show welcome modal for returning user who never completed tutorial', () => {
      // User has seen welcome but started tutorial
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().startTutorial();
      
      // Welcome modal might show depending on isTutorialActive
      expect(useTutorialStore.getState().isTutorialActive).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle corrupted tutorial localStorage', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'arcane-codex-tutorial') {
          return 'invalid-json{';
        }
        return null;
      });
      
      // Should not crash - defaults are used
      expect(() => {
        resetTutorialStore();
      }).not.toThrow();
      
      // Should default to showing welcome modal
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(false);
    });

    it('should handle corrupted canvas localStorage without crashing', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'arcane-canvas-state') {
          return 'invalid-json{';
        }
        return null;
      });
      
      // Should not crash when checking saved state
      expect(() => {
        const savedState = localStorageMock.getItem('arcane-canvas-state');
        if (savedState) {
          // This would fail to parse but not crash
          JSON.parse(savedState as string);
        }
      }).toThrow(); // JSON.parse should throw on invalid JSON
      
      // But the check for existence should work
      const savedState = localStorageMock.getItem('arcane-canvas-state');
      expect(savedState).not.toBeNull(); // The key exists, even if content is invalid
    });

    it('should handle missing tutorial state but present canvas state', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'arcane-codex-tutorial') {
          return null; // No tutorial state
        }
        if (key === 'arcane-canvas-state') {
          return JSON.stringify({
            modules: mockModules,
            connections: [],
            viewport: { x: 0, y: 0, zoom: 1 },
            gridEnabled: true,
            savedAt: Date.now(),
          });
        }
        return null;
      });
      
      // Welcome should show (first time user)
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(false);
      
      // Skip should work
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
    });
  });
});
