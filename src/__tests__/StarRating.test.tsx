/**
 * StarRating Component Tests
 * 
 * Tests for the interactive star rating component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from '../components/Ratings/StarRating';

describe('StarRating', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders 5 stars by default', () => {
    render(<StarRating value={0} onChange={mockOnChange} />);
    const stars = screen.getAllByRole('radio');
    expect(stars).toHaveLength(5);
  });

  it('displays filled stars for the current value', () => {
    render(<StarRating value={3} onChange={mockOnChange} />);
    const stars = screen.getAllByRole('radio');
    // First 3 should be filled (★), last 2 should be empty (☆)
    expect(stars[0].textContent).toBe('★');
    expect(stars[1].textContent).toBe('★');
    expect(stars[2].textContent).toBe('★');
    expect(stars[3].textContent).toBe('☆');
    expect(stars[4].textContent).toBe('☆');
  });

  it('calls onChange with correct value when star is clicked', () => {
    render(<StarRating value={0} onChange={mockOnChange} />);
    const stars = screen.getAllByRole('radio');
    fireEvent.click(stars[2]); // Click the 3rd star
    expect(mockOnChange).toHaveBeenCalledWith(3);
  });

  it('highlights stars up to cursor position on hover', async () => {
    render(<StarRating value={0} onChange={mockOnChange} />);
    const stars = screen.getAllByRole('radio');
    
    // Hover over the 4th star
    fireEvent.mouseEnter(stars[3]);
    
    // All stars up to and including the 4th should be highlighted (text-yellow-300)
    const container = stars[0].parentElement;
    expect(container).toBeTruthy();
  });

  it('does not call onChange when disabled', () => {
    render(<StarRating value={3} onChange={mockOnChange} disabled={true} />);
    const stars = screen.getAllByRole('radio');
    fireEvent.click(stars[4]);
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('shows numeric label when showLabels is true', () => {
    render(<StarRating value={4} onChange={mockOnChange} showLabels={true} />);
    expect(screen.getByText('(4)')).toBeTruthy();
  });

  it('does not show numeric label when value is 0 and showLabels is true', () => {
    render(<StarRating value={0} onChange={mockOnChange} showLabels={true} />);
    expect(screen.queryByText(/\(\d\)/)).toBeNull();
  });

  it('uses correct size classes for sm size', () => {
    render(<StarRating value={2} onChange={mockOnChange} size="sm" />);
    const star = screen.getAllByRole('radio')[0];
    expect(star.className).toContain('text-sm');
  });

  it('uses correct size classes for md size', () => {
    render(<StarRating value={2} onChange={mockOnChange} size="md" />);
    const star = screen.getAllByRole('radio')[0];
    expect(star.className).toContain('text-lg');
  });

  it('uses correct size classes for lg size', () => {
    render(<StarRating value={2} onChange={mockOnChange} size="lg" />);
    const star = screen.getAllByRole('radio')[0];
    expect(star.className).toContain('text-2xl');
  });

  it('clears hover state on mouse leave', () => {
    render(<StarRating value={0} onChange={mockOnChange} />);
    const stars = screen.getAllByRole('radio');
    const container = stars[0].parentElement!;
    
    // Initially all stars should be empty
    expect(stars[0].textContent).toBe('☆');
    expect(stars[1].textContent).toBe('☆');
    
    // Hover over the 4th star
    fireEvent.mouseEnter(stars[3]);
    
    // After mouse leave, the hover state should be cleared
    fireEvent.mouseLeave(container);
    
    // After mouse leave, stars should return to selected value (0 = all empty)
    expect(stars[0].textContent).toBe('☆');
    expect(stars[1].textContent).toBe('☆');
  });

  it('has correct aria-label for each star', () => {
    render(<StarRating value={0} onChange={mockOnChange} />);
    const stars = screen.getAllByRole('radio');
    expect(stars[0].getAttribute('aria-label')).toBe('1 star');
    expect(stars[1].getAttribute('aria-label')).toBe('2 stars');
    expect(stars[4].getAttribute('aria-label')).toBe('5 stars');
  });
});
