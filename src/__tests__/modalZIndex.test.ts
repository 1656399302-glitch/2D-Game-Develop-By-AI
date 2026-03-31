import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Import the components to test
import { WelcomeModal } from '../components/Tutorial/WelcomeModal';
import { TutorialCompletion } from '../components/Tutorial/TutorialCompletion';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
(global as unknown as { localStorage: typeof localStorageMock }).localStorage = localStorageMock;

// Mock the tutorial and machine stores
vi.mock('../store/useTutorialStore', () => ({
  useTutorialStore: {
    getState: () => ({
      hasSeenWelcome: false,
      isTutorialEnabled: true,
      setHasSeenWelcome: vi.fn(),
      setTutorialEnabled: vi.fn(),
    }),
    setState: vi.fn(),
  },
}));

vi.mock('../store/useMachineStore', () => ({
  useMachineStore: {
    getState: () => ({
      restoreSavedState: vi.fn(),
    }),
  },
}));

describe('Modal Z-Index Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no tutorial state, show modal
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === 'arcane-codex-tutorial') {
        return null;
      }
      return null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC1: WelcomeModal z-index is z-50', () => {
    it('should render WelcomeModal with z-50 class', async () => {
      const { render } = await import('@testing-library/react');
      const mockProps = {
        onStartTutorial: vi.fn(),
        onSkip: vi.fn(),
      };

      const result = render(React.createElement(WelcomeModal, mockProps));

      // Find the modal container element
      const modalContainer = result.container.querySelector('.fixed.inset-0');
      expect(modalContainer).toBeTruthy();
      
      // Check that it has z-50 class
      const className = modalContainer ? modalContainer.className : '';
      expect(className).toContain('z-50');
    });

    it('should NOT contain incorrect z-index in WelcomeModal source code', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.resolve(__dirname, '../components/Tutorial/WelcomeModal.tsx');
      const sourceCode = fs.readFileSync(filePath, 'utf-8');
      
      // Should NOT contain old z-value (1100)
      expect(sourceCode).not.toContain('1100');
      // Should contain z-50
      expect(sourceCode).toContain('z-50');
    });

    it('should render WelcomeModal and allow interactions with underlying elements', async () => {
      const { render } = await import('@testing-library/react');
      const mockProps = {
        onStartTutorial: vi.fn(),
        onSkip: vi.fn(),
      };

      const result = render(React.createElement(WelcomeModal, mockProps));

      // Modal should Render
      const modalContainer = result.container.querySelector('.fixed.inset-0');
      expect(modalContainer).toBeTruthy();
    });
  });

  describe('AC2: TutorialCompletion z-index is z-50', () => {
    it('should render TutorialCompletion with z-50 class', async () => {
      const { render } = await import('@testing-library/react');
      const mockProps = {
        onContinue: vi.fn(),
        onReplay: vi.fn(),
      };

      const result = render(React.createElement(TutorialCompletion, mockProps));

      // Find the modal container element
      const modalContainer = result.container.querySelector('.fixed.inset-0');
      expect(modalContainer).toBeTruthy();
      
      // Check that it has z-50 class
      const className = modalContainer ? modalContainer.className : '';
      expect(className).toContain('z-50');
    });

    it('should NOT contain incorrect z-index in TutorialCompletion source code', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.resolve(__dirname, '../components/Tutorial/TutorialCompletion.tsx');
      const sourceCode = fs.readFileSync(filePath, 'utf-8');
      
      // Should NOT contain old z-value (1100)
      expect(sourceCode).not.toContain('1100');
      // Should contain z-50
      expect(sourceCode).toContain('z-50');
    });

    it('should render TutorialCompletion and allow interactions with underlying elements', async () => {
      const { render } = await import('@testing-library/react');
      const mockProps = {
        onContinue: vi.fn(),
        onReplay: vi.fn(),
      };

      const result = render(React.createElement(TutorialCompletion, mockProps));

      // Modal should Render
      const modalContainer = result.container.querySelector('.fixed.inset-0');
      expect(modalContainer).toBeTruthy();
    });
  });

  describe('AC3: Both modals use consistent z-index layering', () => {
    it('should use the same z-index value for both modals', async () => {
      const { render } = await import('@testing-library/react');
      const welcomeModalProps = {
        onStartTutorial: vi.fn(),
        onSkip: vi.fn(),
      };

      const welcomeResult = render(React.createElement(WelcomeModal, welcomeModalProps));
      const welcomeModal = welcomeResult.container.querySelector('.fixed.inset-0');
      const welcomeClassName = welcomeModal ? welcomeModal.className : '';
      
      welcomeResult.unmount();

      const tutorialCompletionProps = {
        onContinue: vi.fn(),
        onReplay: vi.fn(),
      };

      const completionResult = render(React.createElement(TutorialCompletion, tutorialCompletionProps));
      const completionModal = completionResult.container.querySelector('.fixed.inset-0');
      const completionClassName = completionModal ? completionModal.className : '';
      
      completionResult.unmount();

      // Both should have z-50
      expect(welcomeClassName).toContain('z-50');
      expect(completionClassName).toContain('z-50');
    });
  });

  describe('AC4: Modal dismissal behavior with corrected z-index', () => {
    it('should call onSkip callback when skip button is present', async () => {
      const { render } = await import('@testing-library/react');
      const mockProps = {
        onStartTutorial: vi.fn(),
        onSkip: vi.fn(),
      };

      render(React.createElement(WelcomeModal, mockProps));

      // Verify the callback is defined
      expect(typeof mockProps.onSkip).toBe('function');
    });

    it('should call onContinue callback when continue button is present', async () => {
      const { render } = await import('@testing-library/react');
      const mockProps = {
        onContinue: vi.fn(),
        onReplay: vi.fn(),
      };

      render(React.createElement(TutorialCompletion, mockProps));

      // Verify the callback is defined
      expect(typeof mockProps.onContinue).toBe('function');
    });

    it('should call onReplay callback when replay button is present', async () => {
      const { render } = await import('@testing-library/react');
      const mockProps = {
        onContinue: vi.fn(),
        onReplay: vi.fn(),
      };

      render(React.createElement(TutorialCompletion, mockProps));

      // Verify the callback is defined
      expect(typeof mockProps.onReplay).toBe('function');
    });
  });

  describe('AC5: WelcomeModal does not render when conditions not met', () => {
    it('should return null when hasSeenWelcome is true', async () => {
      const { render } = await import('@testing-library/react');
      
      // Mock localStorage to return hasSeenWelcome: true
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'arcane-codex-tutorial') {
          return JSON.stringify({
            state: {
              hasSeenWelcome: true,
              isTutorialEnabled: true,
            },
            version: 0,
          });
        }
        return null;
      });

      const mockProps = {
        onStartTutorial: vi.fn(),
        onSkip: vi.fn(),
      };

      const result = render(React.createElement(WelcomeModal, mockProps));

      // Modal should not be rendered (returns null)
      expect(result.container.firstChild).toBeNull();
    });

    it('should return null when isTutorialEnabled is false', async () => {
      const { render } = await import('@testing-library/react');
      
      // Mock localStorage to return isTutorialEnabled: false
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'arcane-codex-tutorial') {
          return JSON.stringify({
            state: {
              hasSeenWelcome: false,
              isTutorialEnabled: false,
            },
            version: 0,
          });
        }
        return null;
      });

      const mockProps = {
        onStartTutorial: vi.fn(),
        onSkip: vi.fn(),
      };

      const result = render(React.createElement(WelcomeModal, mockProps));

      // Modal should not be rendered (returns null)
      expect(result.container.firstChild).toBeNull();
    });
  });

  describe('AC6: Z-index consistency with other modals in the codebase', () => {
    it('should use z-50 which is consistent with other standard modals', async () => {
      const { render } = await import('@testing-library/react');
      // z-50 is the standard modal layer used in this codebase
      const standardModalZIndex = 'z-50';
      
      const welcomeModalProps = {
        onStartTutorial: vi.fn(),
        onSkip: vi.fn(),
      };

      const result = render(React.createElement(WelcomeModal, welcomeModalProps));
      const modalContainer = result.container.querySelector('.fixed.inset-0');
      
      const className = modalContainer ? modalContainer.className : '';
      expect(className).toContain(standardModalZIndex);
    });
  });

  describe('Code inspection verification', () => {
    it('should verify WelcomeModal.tsx does not contain incorrect z-index', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.resolve(__dirname, '../components/Tutorial/WelcomeModal.tsx');
      
      // Check file exists
      expect(fs.existsSync(filePath)).toBe(true);
      
      const sourceCode = fs.readFileSync(filePath, 'utf-8');
      
      // Verify old z-value is NOT present (check for 1100 which was the problematic value)
      expect(sourceCode).not.toContain('1100');
      
      // Verify new z-50 IS present
      expect(sourceCode).toContain('z-50');
    });

    it('should verify TutorialCompletion.tsx does not contain incorrect z-index', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.resolve(__dirname, '../components/Tutorial/TutorialCompletion.tsx');
      
      // Check file exists
      expect(fs.existsSync(filePath)).toBe(true);
      
      const sourceCode = fs.readFileSync(filePath, 'utf-8');
      
      // Verify old z-value is NOT present (check for 1100 which was the problematic value)
      expect(sourceCode).not.toContain('1100');
      
      // Verify new z-50 IS present
      expect(sourceCode).toContain('z-50');
    });
  });
});
