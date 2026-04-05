/**
 * Submit Review Modal Component
 * 
 * Modal for submitting a new review with rating (1-5 stars) and text.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { StarRating } from './StarRating';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, text: string) => void;
  machineName: string;
  minTextLength?: number;
  maxTextLength?: number;
}

export function SubmitReviewModal({
  isOpen,
  onClose,
  onSubmit,
  machineName,
  minTextLength = 10,
  maxTextLength = 500,
}: SubmitReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setText('');
      setError(null);
      // Focus the text area after modal opens
      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxTextLength) {
      setText(value);
      setError(null);
    }
  }, [maxTextLength]);

  const handleSubmit = useCallback(() => {
    // Validate rating
    if (rating < 1 || rating > 5) {
      setError('Please select a rating (1-5 stars)');
      return;
    }
    
    // Validate text length
    if (text.trim().length < minTextLength) {
      setError(`Review must be at least ${minTextLength} characters`);
      return;
    }
    
    if (text.trim().length > maxTextLength) {
      setError(`Review must be less than ${maxTextLength} characters`);
      return;
    }
    
    // Submit the review
    onSubmit(rating, text.trim());
    onClose();
  }, [rating, text, minTextLength, maxTextLength, onSubmit, onClose]);

  // Check if form is valid
  const isFormValid = rating >= 1 && rating <= 5 && text.trim().length >= minTextLength;
  const remainingChars = maxTextLength - text.length;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div className="w-full max-w-md bg-[#0a0e17] border border-[#1e2a42] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a42] bg-[#121826]">
          <div>
            <h2 id="review-modal-title" className="text-lg font-bold text-white">Write a Review</h2>
            <p className="text-xs text-[#6b7280] mt-0.5 truncate max-w-xs" title={machineName}>
              for {machineName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
            aria-label="Close review modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Your Rating <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-3">
              <StarRating
                value={rating}
                onChange={setRating}
                size="lg"
              />
              <span className="text-sm text-[#6b7280]">
                {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select rating'}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label htmlFor="review-text" className="block text-sm font-medium text-white mb-2">
              Your Review <span className="text-red-400">*</span>
            </label>
            <textarea
              ref={textAreaRef}
              id="review-text"
              value={text}
              onChange={handleTextChange}
              placeholder="Share your thoughts about this machine..."
              className="w-full h-32 px-3 py-2 bg-[#121826] border border-[#1e2a42] rounded-lg text-sm text-white placeholder-[#4a5568] focus:outline-none focus:border-[#7c3aed] transition-colors resize-none"
              aria-describedby={error ? 'review-error' : 'review-hint'}
            />
            <div className="flex items-center justify-between mt-1">
              {error ? (
                <p id="review-error" className="text-xs text-red-400">{error}</p>
              ) : (
                <p id="review-hint" className="text-xs text-[#6b7280]">
                  Minimum {minTextLength} characters
                </p>
              )}
              <p className={`text-xs ${remainingChars < 50 ? 'text-yellow-400' : 'text-[#6b7280]'}`}>
                {remainingChars} remaining
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1e2a42] bg-[#121826]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#9ca3af] hover:text-white hover:bg-[#1e2a42] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
              isFormValid
                ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]'
                : 'bg-[#1e2a42] text-[#6b7280] cursor-not-allowed'
            }`}
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubmitReviewModal;
