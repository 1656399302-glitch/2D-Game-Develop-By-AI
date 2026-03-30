/**
 * Tests for Welcome Modal State Persistence
 * Verifies the fix for the modal reappearing after dismissal
 * 
 * CRITICAL FIX: These tests now use the correct localStorage mock format
 * that matches actual Zustand persist behavior.
 * 
 * Implementation Note: WelcomeModal now ONLY reads from localStorage (synchronously)
 * to avoid infinite loops caused by Zustand store subscriptions in useEffect deps.
 * The store's isTutorialEnabled is NOT used in WelcomeModal to prevent re-render loops.
 * 
 * Zustand stores: { state: { hasSeenWelcome: true, isTutorialEnabled: false }, version: 0 }
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { WelcomeModal, getInitialTutorialState } from '../components/Tutorial/WelcomeModal';
import { useTutorialStore } from '../store/useTutorialStore';
import { useMachineStore } from '../store/useMachineStore';

// Create a mock localStorage that can be configured per test
const createMockLocalStorage = () => {
  let storage: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => { storage[key] = value; }),
    removeItem: vi.fn((key: string) => { delete storage[key]; }),
    clear: vi.fn(() => { storage = {}; }),
    _setData: (data: string | null) => {
      storage = {};
      if (data) {
        // Store directly without parsing - the WelcomeModal will handle parsing
        storage['arcane-codex-tutorial'] = data;
      }
    },
  };
};

const mockLocalStorage = createMockLocalStorage();

// Mock global localStorage
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
});

// Also mock window.localStorage
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
});

// Mock dependencies
vi.mock('../store/useTutorialStore', () => ({
  useTutorialStore: vi.fn((selector) => {
    const state = {
      isTutorialEnabled: true,
      hasSeenWelcome: false,
      setHasSeenWelcome: vi.fn(),
      setTutorialEnabled: vi.fn(),
    };
    return selector(state);
  }),
}));

vi.mock('../store/useMachineStore', () => ({
  useMachineStore: vi.fn((selector) => {
    const state = {
      restoreSavedState: vi.fn(),
    };
    return selector(state);
  }),
}));

// Mock tutorial steps data
vi.mock('../data/tutorialSteps', () => ({
  WELCOME_CONTENT: {
    title: 'Welcome to Arcane Machine Codex',
    subtitle: 'Your magical engineering journey begins',
    description: 'Create and manage magical machines',
    startTutorial: 'Start Tutorial',
    skipTutorial: 'Skip Tutorial',
    features: [
      { icon: '⚙️', title: 'Module Editor', description: 'Drag and drop modules' },
      { icon: '🔮', title: 'Magic Effects', description: 'Watch your machine come alive' },
    ],
  },
}));

describe('WelcomeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage._setData(null);
    
    // Mock tutorial store
    (useTutorialStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        isTutorialEnabled: true,
        hasSeenWelcome: false,
        setHasSeenWelcome: vi.fn(),
        setTutorialEnabled: vi.fn(),
      };
      return selector(state);
    });
    
    // Mock machine store
    (useMachineStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        restoreSavedState: vi.fn(),
      };
      return selector(state);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC2: Welcome Modal State Persistence', () => {
    it('should not appear when user has seen welcome before (localStorage has state.hasSeenWelcome: true)', () => {
      // CRITICAL: Use correct Zustand persist format with 'state' wrapper
      mockLocalStorage._setData(JSON.stringify({
        state: { hasSeenWelcome: true, isTutorialEnabled: false },
        version: 0
      }));

      const onStart = vi.fn();
      const onSkip = vi.fn();

      const { container } = render(
        <WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />
      );

      // Modal should not be rendered because hasSeenWelcome is true in localStorage
      expect(container.firstChild).toBeNull();
    });

    it('should appear when user has NOT seen welcome before', () => {
      // No localStorage data - user hasn't seen welcome
      mockLocalStorage._setData(null);

      const onStart = vi.fn();
      const onSkip = vi.fn();

      render(<WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />);

      const content = document.body.textContent;
      expect(content).toContain('Welcome to Arcane Machine Codex');
    });

    it('should handle localStorage parse errors gracefully', () => {
      // Set invalid data directly in storage - this should be caught by try/catch
      mockLocalStorage._setData('invalid json{');

      const onStart = vi.fn();
      const onSkip = vi.fn();

      // Should not throw, should show modal (falls back to defaults)
      expect(() => {
        render(<WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />);
      }).not.toThrow();
    });

    it('should not render when tutorial is disabled in localStorage', () => {
      // FIX: Now only checks localStorage, not store
      mockLocalStorage._setData(JSON.stringify({
        state: { hasSeenWelcome: false, isTutorialEnabled: false },
        version: 0
      }));

      const onStart = vi.fn();
      const onSkip = vi.fn();

      const { container } = render(
        <WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />
      );

      // Modal should not be rendered because isTutorialEnabled is false in localStorage
      expect(container.firstChild).toBeNull();
    });

    it('should handle missing localStorage gracefully', () => {
      // Simulate localStorage not available by clearing the mock
      mockLocalStorage._setData(null);

      const onStart = vi.fn();
      const onSkip = vi.fn();

      // Should not throw even if localStorage returns null
      expect(() => {
        render(<WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />);
      }).not.toThrow();
    });
  });

  describe('Modal State Management', () => {
    it('should render skip button when modal is visible', () => {
      mockLocalStorage._setData(null);

      const onStart = vi.fn();
      const onSkip = vi.fn();

      render(<WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />);

      // Modal content should be visible
      const content = document.body.textContent;
      expect(content).toContain('Skip Tutorial');
      expect(content).toContain('Start Tutorial');
    });

    it('should render welcome title and description', () => {
      mockLocalStorage._setData(null);

      const onStart = vi.fn();
      const onSkip = vi.fn();

      render(<WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />);

      const content = document.body.textContent;
      expect(content).toContain('Welcome to Arcane Machine Codex');
      expect(content).toContain('Your magical engineering journey begins');
    });

    it('should render feature cards', () => {
      mockLocalStorage._setData(null);

      const onStart = vi.fn();
      const onSkip = vi.fn();

      render(<WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />);

      const content = document.body.textContent;
      expect(content).toContain('Module Editor');
      expect(content).toContain('Magic Effects');
    });
  });

  describe('localStorage Structure Verification', () => {
    it('should correctly read hasSeenWelcome from Zustand persist format with state wrapper', () => {
      // This is the CORRECT format that Zustand persist produces
      mockLocalStorage._setData(JSON.stringify({
        state: { hasSeenWelcome: true, isTutorialEnabled: false },
        version: 0
      }));

      const onStart = vi.fn();
      const onSkip = vi.fn();

      const { container } = render(
        <WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />
      );

      // Modal should NOT be visible because hasSeenWelcome is true in localStorage
      expect(container.firstChild).toBeNull();
    });

    it('should correctly read hasSeenWelcome: false from state wrapper', () => {
      // Zustand persist format with hasSeenWelcome: false
      mockLocalStorage._setData(JSON.stringify({
        state: { hasSeenWelcome: false, isTutorialEnabled: true },
        version: 0
      }));

      const onStart = vi.fn();
      const onSkip = vi.fn();

      render(<WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />);

      // Modal SHOULD be visible because hasSeenWelcome is false
      const content = document.body.textContent;
      expect(content).toContain('Welcome to Arcane Machine Codex');
    });

    it('should handle missing state wrapper gracefully', () => {
      // Old format without state wrapper
      mockLocalStorage._setData(JSON.stringify({
        hasSeenWelcome: true  // Old incorrect format without state wrapper
      }));

      const onStart = vi.fn();
      const onSkip = vi.fn();

      render(<WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />);

      // Modal SHOULD be visible because parsed.state?.hasSeenWelcome is undefined
      const content = document.body.textContent;
      expect(content).toContain('Welcome to Arcane Machine Codex');
    });
  });
  
  describe('getInitialTutorialState', () => {
    it('should parse Zustand persist format correctly', () => {
      mockLocalStorage._setData(JSON.stringify({
        state: { hasSeenWelcome: true, isTutorialEnabled: false },
        version: 0
      }));
      
      const result = getInitialTutorialState();
      
      expect(result.hasSeenWelcome).toBe(true);
      expect(result.isTutorialEnabled).toBe(false);
    });
    
    it('should handle null localStorage', () => {
      mockLocalStorage._setData(null);
      
      const result = getInitialTutorialState();
      
      expect(result.hasSeenWelcome).toBe(false);
      expect(result.isTutorialEnabled).toBe(true); // defaults to true
    });
    
    it('should handle invalid JSON', () => {
      mockLocalStorage._setData('not json');
      
      const result = getInitialTutorialState();
      
      expect(result.hasSeenWelcome).toBe(false);
      expect(result.isTutorialEnabled).toBe(true);
    });
  });
});
