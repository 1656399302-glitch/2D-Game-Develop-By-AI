/**
 * Interactive Star Rating Component
 * 
 * A clickable 1-5 star rating component that allows users to submit ratings.
 * Supports hover states and click interactions.
 */

import { useState, useCallback } from 'react';

interface StarRatingProps {
  value: number; // Current selected rating (1-5)
  onChange: (value: number) => void; // Callback when rating changes
  disabled?: boolean; // Disable interactions
  size?: 'sm' | 'md' | 'lg'; // Star size
  showLabels?: boolean; // Show numeric labels
}

const SIZE_CONFIG = {
  sm: { star: 'text-sm', gap: 'gap-0.5' },
  md: { star: 'text-lg', gap: 'gap-1' },
  lg: { star: 'text-2xl', gap: 'gap-1.5' },
};

export function StarRating({
  value,
  onChange,
  disabled = false,
  size = 'md',
  showLabels = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const sizeConfig = SIZE_CONFIG[size];

  const handleMouseEnter = useCallback((starIndex: number) => {
    if (!disabled) {
      setHoverValue(starIndex);
    }
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setHoverValue(null);
  }, []);

  const handleClick = useCallback((starIndex: number) => {
    if (!disabled) {
      onChange(starIndex);
    }
  }, [disabled, onChange]);

  // Determine which stars should be filled
  const activeValue = hoverValue !== null ? hoverValue : value;

  return (
    <div 
      className={`flex items-center ${sizeConfig.gap} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="radiogroup"
      aria-label="Rate this machine"
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = starIndex <= activeValue;
        const isHovered = hoverValue !== null && starIndex <= hoverValue;
        
        return (
          <button
            key={starIndex}
            type="button"
            className={`${sizeConfig.star} transition-all duration-150 ${isFilled ? 'text-yellow-400' : 'text-gray-600'} ${!disabled && 'hover:scale-110'} ${isHovered && !disabled ? 'text-yellow-300' : ''}`}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onClick={() => handleClick(starIndex)}
            disabled={disabled}
            role="radio"
            aria-checked={starIndex === value}
            aria-label={`${starIndex} star${starIndex !== 1 ? 's' : ''}`}
          >
            {isFilled ? '★' : '☆'}
          </button>
        );
      })}
      {showLabels && value > 0 && (
        <span className="ml-1 text-sm text-gray-400">
          ({value})
        </span>
      )}
    </div>
  );
}

export default StarRating;
