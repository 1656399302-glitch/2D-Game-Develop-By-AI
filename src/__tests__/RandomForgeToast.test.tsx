/**
 * Tests for RandomForgeToast component
 * Verifies the fix for the DOM manipulation error (insertBefore)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RandomForgeToast } from '../components/UI/RandomForgeToast';
import { useMachineStore } from '../store/useMachineStore';

// Mock the store with proper Zustand pattern
vi.mock('../store/useMachineStore', () => ({
  useMachineStore: vi.fn((selector) => {
    const state = {
      randomForgeToastVisible: false,
      randomForgeToastMessage: '',
    };
    return selector(state);
  }),
}));

describe('RandomForgeToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock with default values
    (useMachineStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        randomForgeToastVisible: false,
        randomForgeToastMessage: '',
      };
      return selector(state);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AC1: RandomForgeToast DOM Error Fixed', () => {
    it('should not throw DOM error when toast becomes visible', () => {
      // Set up store to return visible state
      (useMachineStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          randomForgeToastVisible: true,
          randomForgeToastMessage: 'Test message',
        };
        return selector(state);
      });

      // This should NOT throw DOM manipulation error
      expect(() => {
        render(<RandomForgeToast />);
      }).not.toThrow();
    });

    it('should not throw DOM error when toast visibility toggles rapidly', async () => {
      let visibilityCounter = 0;
      
      (useMachineStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          randomForgeToastVisible: visibilityCounter % 2 === 0,
          randomForgeToastMessage: visibilityCounter % 2 === 0 ? 'Message' : '',
        };
        return selector(state);
      });

      const { rerender } = render(<RandomForgeToast />);

      // Rapidly toggle visibility - should not throw
      for (let i = 0; i < 5; i++) {
        visibilityCounter++;
        await rerender(<RandomForgeToast />);
      }

      // If we got here without throwing, the test passes
      expect(true).toBe(true);
    });

    it('should not throw when message changes while visible', async () => {
      let messageCounter = 0;
      
      (useMachineStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          randomForgeToastVisible: true,
          randomForgeToastMessage: `Message ${messageCounter}`,
        };
        return selector(state);
      });

      const { rerender } = render(<RandomForgeToast />);

      // Change message while visible - should not throw
      for (let i = 0; i < 5; i++) {
        messageCounter++;
        await rerender(<RandomForgeToast />);
      }

      expect(true).toBe(true);
    });

    it('should render toast content correctly when visible', () => {
      (useMachineStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          randomForgeToastVisible: true,
          randomForgeToastMessage: '✨ Test Machine Generated!',
        };
        return selector(state);
      });

      render(<RandomForgeToast />);

      const content = document.body.textContent;
      expect(content).toContain('✨ Test Machine Generated!');
      expect(content).toContain('Machine has been randomly generated!');
    });

    it('should not render when toast is hidden', () => {
      (useMachineStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          randomForgeToastVisible: false,
          randomForgeToastMessage: '',
        };
        return selector(state);
      });

      const { container } = render(<RandomForgeToast />);

      // Toast should not be in the document
      expect(container.firstChild).toBeNull();
    });

    it('should not render when message is empty even if visible is true', () => {
      (useMachineStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          randomForgeToastVisible: true,
          randomForgeToastMessage: '',
        };
        return selector(state);
      });

      const { container } = render(<RandomForgeToast />);

      // Toast should not be in the document
      expect(container.firstChild).toBeNull();
    });

    it('should have proper ARIA attributes for accessibility', () => {
      (useMachineStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          randomForgeToastVisible: true,
          randomForgeToastMessage: 'Test message',
        };
        return selector(state);
      });

      render(<RandomForgeToast />);

      const toast = screen.getByRole('status');
      expect(toast.getAttribute('aria-live')).toBe('polite');
      expect(toast.getAttribute('aria-atomic')).toBe('true');
    });

    it('should have proper animation styles when visible', () => {
      (useMachineStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          randomForgeToastVisible: true,
          randomForgeToastMessage: 'Test',
        };
        return selector(state);
      });

      const { container } = render(<RandomForgeToast />);

      // Toast should have been rendered with animation
      expect(container.querySelector('.fixed')).not.toBeNull();
    });
  });
});
