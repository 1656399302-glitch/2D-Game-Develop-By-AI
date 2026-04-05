/**
 * Review List Component
 * 
 * Displays a list of reviews for a machine with delete functionality.
 */

import { Review } from '../../types/ratings';
import { ReviewItem } from './ReviewItem';

interface ReviewListProps {
  reviews: Review[];
  currentUserId: string;
  onDeleteReview: (reviewId: string) => void;
  maxDisplay?: number; // Maximum number of reviews to display (0 = show all)
  showViewMore?: boolean; // Show "View More" button if there are more reviews
  onViewMore?: () => void; // Callback when "View More" is clicked
}

export function ReviewList({
  reviews,
  currentUserId,
  onDeleteReview,
  maxDisplay = 0,
  showViewMore = false,
  onViewMore,
}: ReviewListProps) {
  const displayReviews = maxDisplay > 0 ? reviews.slice(0, maxDisplay) : reviews;
  const hasMore = maxDisplay > 0 && reviews.length > maxDisplay;

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#6b7280] text-sm">No reviews yet</p>
        <p className="text-[#4a5568] text-xs mt-1">Be the first to review this machine!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayReviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          currentUserId={currentUserId}
          onDelete={onDeleteReview}
        />
      ))}
      
      {showViewMore && hasMore && (
        <button
          onClick={onViewMore}
          className="w-full py-2 text-sm text-[#7c3aed] hover:text-[#8b5cf6] hover:bg-[#7c3aed]/10 rounded-lg transition-colors"
        >
          View all {reviews.length} reviews
        </button>
      )}
    </div>
  );
}

export default ReviewList;
