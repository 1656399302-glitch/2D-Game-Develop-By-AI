/**
 * Exchange Panel Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExchangePanel } from '../ExchangePanel';

describe('ExchangePanel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the exchange panel', () => {
    render(<ExchangePanel onClose={mockOnClose} />);

    // Panel header should be visible
    expect(screen.getByText('交易所')).toBeTruthy();
  });

  it('has close button that calls onClose', () => {
    render(<ExchangePanel onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: '关闭' });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays trade history tab', () => {
    render(<ExchangePanel onClose={mockOnClose} />);

    expect(screen.getByText('交易历史')).toBeTruthy();
  });

  it('switches tabs when clicked', () => {
    render(<ExchangePanel onClose={mockOnClose} />);

    // Click on Trade History tab
    fireEvent.click(screen.getByText('交易历史'));

    // Should show no trade history message
    expect(screen.getByText('暂无交易记录')).toBeTruthy();
  });
});
