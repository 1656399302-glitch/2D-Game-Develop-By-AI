/**
 * Exchange Button Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExchangeButton } from '../ExchangeButton';

describe('ExchangeButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the exchange button', () => {
    render(<ExchangeButton onClick={mockOnClick} />);

    // Button should render
    const button = screen.getByRole('button');
    expect(button).toBeTruthy();
  });

  it('handles click events', () => {
    render(<ExchangeButton onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockOnClick).toHaveBeenCalled();
  });
});
