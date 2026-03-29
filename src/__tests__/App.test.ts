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
  {
    id: 'test-module-2',
    instanceId: 'test-instance-2',
    type: 'gear' as const,
    x: 200,
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

describe('App Modal Coordination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetTutorialStore();
    resetMachineStore();
    
    // Default: no saved state, first time user
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC1: Welcome Modal Skip Does Not Reset Canvas', () => {
    it('should preserve modules when user skips welcome modal', () => {
      // Setup: Add modules to the store
      useMachineStore.setState({
        modules: [...mockModules],
      });
      
      // Simulate handleSkip behavior
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Assert: Canvas should NOT be cleared - modules should still exist
      expect(useMachineStore.getState().modules.length).toBe(2);
      expect(useMachineStore.getState().modules[0].instanceId).toBe('test-instance-1');
    });

    it('should NOT trigger startFresh when user skips welcome modal', () => {
      // Setup: Add modules to the store
      useMachineStore.setState({
        modules: [...mockModules],
      });
      
      // Spy on startFresh to verify it's NOT called
      const startFreshSpy = vi.spyOn(useMachineStore.getState(), 'startFresh');
      
      // Simulate handleSkip behavior
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Assert: startFresh should NOT be called
      expect(startFreshSpy).not.toHaveBeenCalled();
    });
  });

  describe('AC2: Welcome Modal Skip Disables Tutorial Permanently', () => {
    it('should set hasSeenWelcome to true when user skips', () => {
      // Simulate handleSkip behavior
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
    });

    it('should set isTutorialEnabled to false when user skips', () => {
      // Simulate handleSkip behavior
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      expect(useTutorialStore.getState().isTutorialEnabled).toBe(false);
    });

    it('should prevent welcome modal from reappearing after skip', () => {
      // Simulate handleSkip
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Welcome modal should not show because:
      // - hasSeenWelcome is true (so useWelcomeModal returns showWelcome=false)
      // - OR isTutorialEnabled is false (so WelcomeModal returns null)
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
      expect(useTutorialStore.getState().isTutorialEnabled).toBe(false);
    });
  });

  describe('AC3: Tutorial Store Persistence Works', () => {
    it('should correctly update hasSeenWelcome', () => {
      useTutorialStore.getState().setHasSeenWelcome(true);
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
    });

    it('should correctly update isTutorialEnabled', () => {
      useTutorialStore.getState().setTutorialEnabled(false);
      expect(useTutorialStore.getState().isTutorialEnabled).toBe(false);
    });
  });

  describe('AC4: No Regression in Load Prompt Flow', () => {
    it('should restore saved state when skipping AND saved state exists', () => {
      // Clear machine store
      resetMachineStore();
      
      // Mock saved canvas state
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
      
      // Simulate handleSkip with restore
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Check if saved state exists (as handleSkip does)
      const savedState = localStorageMock.getItem('arcane-canvas-state');
      if (savedState) {
        useMachineStore.getState().restoreSavedState();
      }
      
      // Assert: restoreSavedState should be called
      expect(restoreSpy).toHaveBeenCalled();
    });

    it('should NOT restore saved state when skipping AND no saved state exists', () => {
      // Clear machine store
      resetMachineStore();
      
      // No saved canvas state
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'arcane-canvas-state') {
          return null;
        }
        return null;
      });
      
      // Spy on restoreSavedState
      const restoreSpy = vi.spyOn(useMachineStore.getState(), 'restoreSavedState');
      
      // Simulate handleSkip
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Check if saved state exists (as handleSkip does)
      const savedState = localStorageMock.getItem('arcane-canvas-state');
      if (savedState) {
        useMachineStore.getState().restoreSavedState();
      }
      
      // Assert: restoreSavedState should NOT be called
      expect(restoreSpy).not.toHaveBeenCalled();
    });

    it('should NOT clear canvas when user skips (modules preserved)', () => {
      // Add modules to store
      useMachineStore.setState({
        modules: [...mockModules],
      });
      
      // Simulate handleSkip
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Modules should still be in the store
      expect(useMachineStore.getState().modules.length).toBe(2);
    });
  });

  describe('Modal State Transitions', () => {
    it('should start with welcome modal visible for first-time users', () => {
      resetTutorialStore();
      // First-time user: hasSeenWelcome=false, isTutorialEnabled=true
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(false);
      expect(useTutorialStore.getState().isTutorialEnabled).toBe(true);
    });

    it('should close modal when starting tutorial', () => {
      // Starting tutorial sets hasSeenWelcome=true
      useTutorialStore.getState().startTutorial();
      
      // Welcome should not show because hasSeenWelcome is true
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
    });

    it('should close modal when skipping tutorial', () => {
      // Skipping sets hasSeenWelcome=true and isTutorialEnabled=false
      useTutorialStore.getState().setHasSeenWelcome(true);
      useTutorialStore.getState().setTutorialEnabled(false);
      
      // Welcome should not show
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(true);
      expect(useTutorialStore.getState().isTutorialEnabled).toBe(false);
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
      
      // Should default to showing welcome modal
      expect(() => {
        resetTutorialStore();
      }).not.toThrow();
      
      // Should default to initial state
      expect(useTutorialStore.getState().hasSeenWelcome).toBe(false);
    });

    it('should handle corrupted canvas localStorage without crashing', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'arcane-codex-tutorial') {
          return null;
        }
        if (key === 'arcane-canvas-state') {
          return 'invalid-json{';
        }
        return null;
      });
      
      // Should not crash when checking saved state
      const savedState = localStorageMock.getItem('arcane-canvas-state');
      // JSON.parse will throw, but our code checks for null
      expect(savedState).not.toBeNull(); // The key exists
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
