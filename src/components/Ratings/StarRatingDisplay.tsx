/**
 * Star Rating Display Component
 * 
 * A read-only display component that shows the average rating
 * with filled/empty stars and the rating count.
 */

interface StarRatingDisplayProps {
  averageRating: number; // 0-5, can be decimal
  ratingCount: number; // Total number of ratings
  size?: 'sm' | 'md' | 'lg'; // Star size
  showCount?: boolean; // Show rating count text
  interactive?: boolean; // If true, shows clickable stars that trigger onRate callback
  onRate?: (value: number) => void; // Callback for rate button
  onClick?: () => void; // Callback when clicking the display
}

const SIZE_CONFIG = {
  sm: { star: 'text-xs', gap: 'gap-0.5', text: 'text-[10px]' },
  md: { star: 'text-sm', gap: 'gap-0.5', text: 'text-xs' },
  lg: { star: 'text-lg', gap: 'gap-1', text: 'text-sm' },
};

export function StarRatingDisplay({
  averageRating,
  ratingCount,
  size = 'md',
  showCount = true,
  interactive = false,
  onRate,
  onClick,
}: StarRatingDisplayProps) {
  const sizeConfig = SIZE_CONFIG[size];
  
  // Round average to nearest 0.5 for display
  const roundedRating = Math.round(averageRating * 2) / 2;
  
  // Generate star display
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(roundedRating)) {
      // Full star
      stars.push('★');
    } else if (i - 0.5 <= roundedRating) {
      // Half star (displayed as full for simplicity, using a half-star character)
      stars.push('★');
    } else {
      // Empty star
      stars.push('☆');
    }
  }

  const handleClick = () => {
    if (interactive && onRate) {
      onRate(Math.ceil(averageRating) || 1);
    } else if (onClick) {
      onClick();
    }
  };

  if (ratingCount === 0) {
    return (
      <div 
        className={`flex items-center ${sizeConfig.gap} ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''} text-gray-500`}
        onClick={handleClick}
        role={interactive ? 'button' : undefined}
        aria-label={interactive ? 'Rate this machine' : 'No ratings yet'}
      >
        <div className={`flex items-center ${sizeConfig.gap} ${sizeConfig.star}`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="text-gray-600">☆</span>
          ))}
        </div>
        {showCount && (
          <span className={`${sizeConfig.text} text-gray-500 ml-1`}>
            No ratings
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center ${sizeConfig.gap} ${interactive ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      aria-label={`Rating: ${averageRating.toFixed(1)} out of 5 stars (${ratingCount} rating${ratingCount !== 1 ? 's' : ''})`}
    >
      <div className={`flex items-center ${sizeConfig.gap} ${sizeConfig.star}`}>
        {stars.map((star, index) => (
          <span 
            key={index} 
            className={index < Math.floor(roundedRating) || (index === Math.floor(roundedRating) && roundedRating % 1 >= 0.5) 
              ? 'text-yellow-400' 
              : 'text-gray-600'
            }
          >
            {star}
          </span>
        ))}
      </div>
      {showCount && (
        <span className={`${sizeConfig.text} text-gray-400 ml-1`}>
          ★ {averageRating.toFixed(1)} ({ratingCount} rating{ratingCount !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
}

export default StarRatingDisplay;
