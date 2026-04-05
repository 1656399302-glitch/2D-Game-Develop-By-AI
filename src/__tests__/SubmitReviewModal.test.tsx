/**
 * SubmitReviewModal Component Tests
 * 
 * Tests for the review submission modal component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubmitReviewModal } from '../components/Ratings/SubmitReviewModal';

// Mock StarRating component
vi.mock('../components/Ratings/StarRating', () => ({
  StarRating: ({ value, onChange, size }: { value: number; onChange: (v: number) => void; size?: string }) => (
    <div data-testid="mock-star-rating" data-value={value} data-size={size}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => onChange(star)} data-testid={`star-${star}`}>
          {star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  ),
}));

describe('SubmitReviewModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSubmit.mockClear();
  });

  it('does not render when isOpen is false', () => {
    render(
      <SubmitReviewModal
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        machineName="Test Machine"
      />
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        machineName="Test Machine"
      />
    );
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('displays the machine name in the header', () => {
    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        machineName="Void Resonator"
      />
    );
    expect(screen.getByText(/for Void Resonator/)).toBeTruthy();
  });

  it('has a star rating component', () => {
    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        machineName="Test Machine"
      />
    );
    expect(screen.getByTestId('mock-star-rating')).toBeTruthy();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        machineName="Test Machine"
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        machineName="Test Machine"
      />
    );
    fireEvent.click(screen.getByLabelText('Close review modal'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables submit button when form is invalid', () => {
    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        machineName="Test Machine"
      />
    );
    const submitButton = screen.getByText('Submit Review');
    // Check that the button has the disabled class (cursor-not-allowed)
    const buttonEl = submitButton.closest('button');
    expect(buttonEl?.getAttribute('disabled')).toBe('');
  });

  it('enables submit button when rating and text are valid', () => {
    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        machineName="Test Machine"
        minTextLength={5}
      />
    );
    
    // Select a rating
    fireEvent.click(screen.getByTestId('star-4'));
    
    // Enter valid text
    const textarea = screen.getByLabelText('Your Review *');
    fireEvent.change(textarea, { target: { value: 'Great machine with amazing design!' } });
    
    // Submit button should be enabled (no disabled attribute)
    const submitButton = screen.getByText('Submit Review');
    const buttonEl = submitButton.closest('button');
    expect(buttonEl?.hasAttribute('disabled')).toBe(false);
  });

  it('calls onSubmit with correct data when form is submitted', () => {
    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        machineName="Test Machine"
        minTextLength={5}
      />
    );
    
    // Select a rating
    fireEvent.click(screen.getByTestId('star-4'));
    
    // Enter valid text
    const textarea = screen.getByLabelText('Your Review *');
    fireEvent.change(textarea, { target: { value: 'Great machine!' } });
    
    // Submit
    fireEvent.click(screen.getByText('Submit Review'));
    
    expect(mockOnSubmit).toHaveBeenCalledWith(4, 'Great machine!');
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('trims whitespace from review text', () => {
    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        machineName="Test Machine"
        minTextLength={5}
      />
    );
    
    fireEvent.click(screen.getByTestId('star-3'));
    const textarea = screen.getByLabelText('Your Review *');
    fireEvent.change(textarea, { target: { value: '   Good machine   ' } });
    fireEvent.click(screen.getByText('Submit Review'));
    
    expect(mockOnSubmit).toHaveBeenCalledWith(3, 'Good machine');
  });

  it('shows character count', () => {
    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        machineName="Test Machine"
        maxTextLength={100}
      />
    );
    
    // Initially should show full count (text is split across elements)
    const remainingElements = screen.getAllByText(/remaining/);
    expect(remainingElements.length).toBeGreaterThan(0);
    
    // After typing 7 characters ("Testing"), should show 93 remaining
    const textarea = screen.getByLabelText('Your Review *');
    fireEvent.change(textarea, { target: { value: 'Testing' } });
    
    // The remaining text should be updated
    const remainingText = screen.getByText(/93 remaining/);
    expect(remainingText).toBeTruthy();
  });

  it('calls onClose when Escape key is pressed', () => {
    render(
      <SubmitReviewModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        machineName="Test Machine"
      />
    );
    
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalled();
  });
});
