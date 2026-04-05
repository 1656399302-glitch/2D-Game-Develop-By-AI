/**
 * Individual Review Item Component
 * 
 * Displays a single review with author, rating, text, and timestamp.
 * Shows delete button only for the review author's own reviews.
 */

import { Review } from '../../types/ratings';

interface ReviewItemProps {
  review: Review;
  currentUserId: string;
  onDelete: (reviewId: string) => void;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes < 1) return 'Just now';
      return `${diffMinutes}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  
  // Format as date for older reviews
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

function renderStars(rating: number): React.ReactNode {
  return (
    <div className="flex items-center gap-0.5 text-sm">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= rating ? 'text-yellow-400' : 'text-gray-600'}
        >
          {i <= rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}

export function ReviewItem({ review, currentUserId, onDelete }: ReviewItemProps) {
  const isOwnReview = review.authorId === currentUserId;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this review?')) {
      onDelete(review.id);
    }
  };

  return (
    <div className="bg-[#121826] border border-[#1e2a42] rounded-lg p-4 hover:border-[#1e2a42]/60 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          {/* Author avatar placeholder */}
          <div className="w-8 h-8 rounded-full bg-[#7c3aed]/30 flex items-center justify-center text-sm font-bold text-[#a78bfa]">
            {review.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-sm font-medium text-white">
              {review.authorName}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {renderStars(review.rating)}
              <span className="text-xs text-[#6b7280]">
                {formatTimestamp(review.timestamp)}
              </span>
            </div>
          </div>
        </div>
        
        {isOwnReview && (
          <button
            onClick={handleDelete}
            className="px-2 py-1 text-xs text-[#ef4444] hover:bg-[#ef4444]/10 rounded transition-colors"
            aria-label="Delete your review"
          >
            Delete
          </button>
        )}
      </div>
      
      <p className="text-sm text-[#9ca3af] leading-relaxed">
        {review.text}
      </p>
    </div>
  );
}

export default ReviewItem;
