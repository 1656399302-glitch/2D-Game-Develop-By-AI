/**
 * Tests for Welcome Modal State Persistence
 * Verifies the fix for the modal reappearing after dismissal
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WelcomeModal } from '../components/Tutorial/WelcomeModal';
import { useTutorialStore } from '../store/useTutorialStore';
import { useMachineStore } from '../store/useMachineStore';

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

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

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
    
    // Default localStorage behavior - no saved state
    mockLocalStorage.getItem.mockReturnValue(null);
    
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
    it('should not appear when user has seen welcome before', () => {
      // Mock that user has seen welcome in localStorage
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        state: { hasSeenWelcome: true }
      }));

      (useTutorialStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          isTutorialEnabled: true,
          hasSeenWelcome: true,
          setHasSeenWelcome: vi.fn(),
          setTutorialEnabled: vi.fn(),
        };
        return selector(state);
      });

      const onStart = vi.fn();
      const onSkip = vi.fn();

      const { container } = render(
        <WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />
      );

      // Modal should not be rendered
      expect(container.firstChild).toBeNull();
    });

    it('should appear when user has NOT seen welcome before', () => {
      // No localStorage data - user hasn't seen welcome
      mockLocalStorage.getItem.mockReturnValue(null);

      (useTutorialStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          isTutorialEnabled: true,
          hasSeenWelcome: false,
          setHasSeenWelcome: vi.fn(),
          setTutorialEnabled: vi.fn(),
        };
        return selector(state);
      });

      const onStart = vi.fn();
      const onSkip = vi.fn();

      render(<WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />);

      const content = document.body.textContent;
      expect(content).toContain('Welcome to Arcane Machine Codex');
    });

    it('should handle localStorage parse errors gracefully', () => {
      // Mock localStorage that throws on parse
      mockLocalStorage.getItem.mockReturnValue('invalid json{');

      (useTutorialStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          isTutorialEnabled: true,
          hasSeenWelcome: false,
          setHasSeenWelcome: vi.fn(),
          setTutorialEnabled: vi.fn(),
        };
        return selector(state);
      });

      const onStart = vi.fn();
      const onSkip = vi.fn();

      // Should not throw, should show modal
      expect(() => {
        render(<WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />);
      }).not.toThrow();
    });

    it('should not render when tutorial is disabled', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      (useTutorialStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          isTutorialEnabled: false,
          hasSeenWelcome: false,
          setHasSeenWelcome: vi.fn(),
          setTutorialEnabled: vi.fn(),
        };
        return selector(state);
      });

      const onStart = vi.fn();
      const onSkip = vi.fn();

      const { container } = render(
        <WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />
      );

      // Modal should not be rendered
      expect(container.firstChild).toBeNull();
    });

    it('should handle missing localStorage gracefully', () => {
      // Simulate localStorage not available
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => { throw new Error('localStorage not available'); },
          setItem: vi.fn(),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      (useTutorialStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          isTutorialEnabled: true,
          hasSeenWelcome: false,
          setHasSeenWelcome: vi.fn(),
          setTutorialEnabled: vi.fn(),
        };
        return selector(state);
      });

      const onStart = vi.fn();
      const onSkip = vi.fn();

      // Should not throw even if localStorage fails
      expect(() => {
        render(<WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />);
      }).not.toThrow();
    });
  });

  describe('Modal State Management', () => {
    it('should render skip button when modal is visible', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      (useTutorialStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          isTutorialEnabled: true,
          hasSeenWelcome: false,
          setHasSeenWelcome: vi.fn(),
          setTutorialEnabled: vi.fn(),
        };
        return selector(state);
      });

      const onStart = vi.fn();
      const onSkip = vi.fn();

      render(<WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />);

      // Modal content should be visible
      const content = document.body.textContent;
      expect(content).toContain('Skip Tutorial');
      expect(content).toContain('Start Tutorial');
    });

    it('should render welcome title and description', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      (useTutorialStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          isTutorialEnabled: true,
          hasSeenWelcome: false,
          setHasSeenWelcome: vi.fn(),
          setTutorialEnabled: vi.fn(),
        };
        return selector(state);
      });

      const onStart = vi.fn();
      const onSkip = vi.fn();

      render(<WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />);

      const content = document.body.textContent;
      expect(content).toContain('Welcome to Arcane Machine Codex');
      expect(content).toContain('Your magical engineering journey begins');
    });

    it('should render feature cards', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      (useTutorialStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          isTutorialEnabled: true,
          hasSeenWelcome: false,
          setHasSeenWelcome: vi.fn(),
          setTutorialEnabled: vi.fn(),
        };
        return selector(state);
      });

      const onStart = vi.fn();
      const onSkip = vi.fn();

      render(<WelcomeModal onStartTutorial={onStart} onSkip={onSkip} />);

      const content = document.body.textContent;
      expect(content).toContain('Module Editor');
      expect(content).toContain('Magic Effects');
    });
  });
});
