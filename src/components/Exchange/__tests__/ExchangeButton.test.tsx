/**
 * Exchange Button Component Tests
 * 
 * Tests for ExchangeButton component including badge display
 * for pending proposals (both incoming and outgoing).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExchangeButton } from '../ExchangeButton';

// Mock the exchange store
vi.mock('../../../store/useExchangeStore', () => ({
  useExchangeStore: vi.fn(),
}));

import { useExchangeStore } from '../../../store/useExchangeStore';

describe('ExchangeButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the exchange button', () => {
    // Mock empty state
    (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        incomingProposals: [],
        outgoingProposals: [],
      };

      if (selector) {
        return selector(state);
      }
      return state;
    });

    render(<ExchangeButton onClick={mockOnClick} />);

    // Button should render
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
  });

  it('handles click events', () => {
    // Mock empty state
    (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
      const state = {
        incomingProposals: [],
        outgoingProposals: [],
      };

      if (selector) {
        return selector(state);
      }
      return state;
    });

    render(<ExchangeButton onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockOnClick).toHaveBeenCalled();
  });

  // =========================================================================
  // AC-120-002: ExchangeButton Badge
  // =========================================================================
  describe('Incoming Proposals Badge (AC-120-002)', () => {
    it('does not render badge when no incoming proposals', () => {
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          incomingProposals: [],
          outgoingProposals: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangeButton onClick={mockOnClick} />);

      // Badge should not be visible
      const badges = screen.queryAllByText('');
      const badgeElement = badges.find(b => b.className.includes('rounded-full'));
      expect(badgeElement).toBeUndefined();
    });

    it('renders badge with count when incoming proposals exist', () => {
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          incomingProposals: [
            { id: '1', status: 'pending' },
            { id: '2', status: 'pending' },
          ],
          outgoingProposals: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangeButton onClick={mockOnClick} />);

      // Should show badge with "2"
      expect(screen.getByText('2')).toBeTruthy();
    });

    it('badge count includes both incoming and outgoing proposals', () => {
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          incomingProposals: [
            { id: '1', status: 'pending' },
          ],
          outgoingProposals: [
            { id: '2', status: 'pending' },
            { id: '3', status: 'pending' },
          ],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangeButton onClick={mockOnClick} />);

      // Should show total count of 3
      expect(screen.getByText('3')).toBeTruthy();
    });

    it('only counts pending proposals in badge', () => {
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          incomingProposals: [
            { id: '1', status: 'pending' },
            { id: '2', status: 'accepted' }, // Should not count
            { id: '3', status: 'rejected' }, // Should not count
          ],
          outgoingProposals: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangeButton onClick={mockOnClick} />);

      // Should only show "1" (only pending count)
      expect(screen.getByText('1')).toBeTruthy();
    });

    it('badge has correct styling', () => {
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          incomingProposals: [
            { id: '1', status: 'pending' },
          ],
          outgoingProposals: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangeButton onClick={mockOnClick} />);

      // Find badge element
      const badge = screen.getByText('1').closest('span');
      expect(badge?.className).toContain('bg-[#7c3aed]');
      expect(badge?.className).toContain('rounded-full');
    });

    it('clicking badge opens exchange panel', () => {
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          incomingProposals: [
            { id: '1', status: 'pending' },
          ],
          outgoingProposals: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangeButton onClick={mockOnClick} />);

      // Click on the badge area (which is part of the button)
      const badge = screen.getByText('1');
      fireEvent.click(badge);

      expect(mockOnClick).toHaveBeenCalled();
    });

    it('displays button text correctly', () => {
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          incomingProposals: [],
          outgoingProposals: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangeButton onClick={mockOnClick} />);

      expect(screen.getByText('交易所')).toBeTruthy();
    });

    it('has correct accessibility attributes', () => {
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          incomingProposals: [],
          outgoingProposals: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangeButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-label')).toBe('交易所');
      expect(button.getAttribute('title')).toBe('交易所 - 交易机器');
    });

    it('animates badge with pulse when proposals exist', () => {
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          incomingProposals: [
            { id: '1', status: 'pending' },
          ],
          outgoingProposals: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangeButton onClick={mockOnClick} />);

      const badge = screen.getByText('1').closest('span');
      expect(badge?.className).toContain('animate-pulse');
    });

    it('handles zero proposals gracefully', () => {
      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          incomingProposals: [],
          outgoingProposals: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangeButton onClick={mockOnClick} />);

      // Button should still render correctly with no proposals
      const button = screen.getByRole('button');
      expect(button).toBeTruthy();
      expect(button.textContent).toContain('交易所');
    });

    it('handles large number of proposals', () => {
      const proposals = Array.from({ length: 99 }, (_, i) => ({
        id: String(i),
        status: 'pending' as const,
      }));

      (useExchangeStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) => {
        const state = {
          incomingProposals: proposals,
          outgoingProposals: [],
        };

        if (selector) {
          return selector(state);
        }
        return state;
      });

      render(<ExchangeButton onClick={mockOnClick} />);

      // Should show "99"
      expect(screen.getByText('99')).toBeTruthy();
    });
  });
});
