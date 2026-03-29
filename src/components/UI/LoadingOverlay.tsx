import { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  isLoading: boolean;
  /** Message to display */
  message?: string;
  /** Optional sub-message or progress description */
  subMessage?: string;
  /** Progress value (0-100) for determinate loading */
  progress?: number;
  /** Whether to show a backdrop */
  showBackdrop?: boolean;
  /** Custom spinner variant */
  variant?: 'arcane' | 'simple' | 'dots';
  /** Z-index for positioning */
  zIndex?: number;
  /** Callback when loading completes (for animations) */
  onComplete?: () => void;
  /** Minimum display time in ms (for flash prevention) */
  minDisplayTime?: number;
}

/**
 * Consistent Loading State Component
 * 
 * Provides a unified loading UI for async operations like:
 * - Export file generation
 * - Random forge generation
 * - Data loading states
 * 
 * WCAG 2.1 AA Compliance:
 * - Uses aria-live="polite" for screen reader announcements
 * - Includes role="status" for progress updates
 * - Visible focus indicators
 */
export function LoadingOverlay({
  isLoading,
  message = '加载中...',
  subMessage,
  progress,
  showBackdrop = true,
  variant = 'arcane',
  zIndex = 9999,
  onComplete,
  minDisplayTime = 300,
}: LoadingOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [startTime] = useState(Date.now());
  const [isExiting, setIsExiting] = useState(false);

  // Handle show/hide with animation
  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setIsExiting(false);
    } else if (visible) {
      // Ensure minimum display time for flash prevention
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);
      
      const timeout = setTimeout(() => {
        setIsExiting(true);
        // Wait for exit animation before fully hiding
        setTimeout(() => {
          setVisible(false);
          onComplete?.();
        }, 300);
      }, remaining);

      return () => clearTimeout(timeout);
    }
  }, [isLoading, visible, startTime, minDisplayTime, onComplete]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
      className={`
        fixed inset-0 flex flex-col items-center justify-center
        transition-opacity duration-300
        ${isExiting ? 'opacity-0' : 'opacity-100'}
        ${showBackdrop ? 'bg-black/70 backdrop-blur-sm' : 'bg-transparent'}
      `}
      style={{ zIndex }}
    >
      {/* Loading Indicator */}
      <div className="flex flex-col items-center">
        {/* Spinner */}
        <div className="mb-4" aria-hidden="true">
          {variant === 'arcane' && <ArcaneSpinner />}
          {variant === 'simple' && <SimpleSpinner />}
          {variant === 'dots' && <DotsSpinner />}
        </div>

        {/* Message */}
        <p className="text-lg font-medium text-white mb-1">
          {message}
        </p>

        {/* Sub-message or progress */}
        {subMessage && (
          <p className="text-sm text-[#9ca3af]">{subMessage}</p>
        )}

        {/* Progress bar */}
        {progress !== undefined && (
          <div 
            className="w-48 mt-4"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`进度: ${progress}%`}
          >
            <div className="h-1.5 bg-[#1e2a42] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00d4ff] to-[#00ffcc] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-[#4a5568] mt-1 text-center">
              {progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Arcane-themed spinner with rotating rings
 */
function ArcaneSpinner() {
  return (
    <div className="relative w-16 h-16">
      {/* Outer ring */}
      <svg
        className="absolute inset-0 w-full h-full animate-spin"
        style={{ animationDuration: '2s' }}
        viewBox="0 0 64 64"
      >
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="#1e2a42"
          strokeWidth="2"
        />
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="url(#arcaneGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="40 100"
        />
        <defs>
          <linearGradient id="arcaneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#00ffcc" />
          </linearGradient>
        </defs>
      </svg>

      {/* Inner diamond */}
      <svg
        className="absolute inset-0 w-full h-full animate-pulse"
        viewBox="0 0 64 64"
      >
        <polygon
          points="32,8 56,32 32,56 8,32"
          fill="none"
          stroke="#a855f7"
          strokeWidth="1.5"
          className="opacity-60"
        />
        <circle cx="32" cy="32" r="6" fill="#00d4ff" opacity="0.8" />
      </svg>
    </div>
  );
}

/**
 * Simple circular spinner
 */
function SimpleSpinner() {
  return (
    <div className="w-10 h-10 border-4 border-[#1e2a42] border-t-[#00d4ff] rounded-full animate-spin" />
  );
}

/**
 * Animated dots spinner
 */
function DotsSpinner() {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-full bg-[#00d4ff] animate-bounce"
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton loading placeholder for content areas
 */
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rect' | 'circle';
}

export function Skeleton({
  className = '',
  width,
  height,
  variant = 'rect',
}: SkeletonProps) {
  const baseClasses = 'bg-[#1e2a42] animate-pulse';
  
  const variantClasses = {
    text: 'h-4 rounded',
    rect: 'rounded-lg',
    circle: 'rounded-full',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton loading for module cards
 */
export function ModuleCardSkeleton() {
  return (
    <div className="p-3 bg-[#121826] rounded-lg border border-[#1e2a42]">
      <div className="flex items-start gap-3">
        <Skeleton variant="rect" width={48} height={48} />
        <div className="flex-1">
          <Skeleton variant="text" width="70%" height={16} className="mb-2" />
          <Skeleton variant="text" width="100%" height={12} className="mb-2" />
          <Skeleton variant="text" width="50%" height={12} />
        </div>
      </div>
    </div>
  );
}

/**
 * Inline loading indicator for buttons and small areas
 */
interface InlineLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function InlineLoader({ size = 'md', color = '#00d4ff' }: InlineLoaderProps) {
  const sizes = {
    sm: 'w-3 h-3 border-2',
    md: 'w-4 h-4 border-2',
    lg: 'w-6 h-6 border-[3px]',
  };

  return (
    <div
      className={`${sizes[size]} border-[#1e2a42] border-t-current rounded-full animate-spin`}
      style={{ borderTopColor: color }}
      role="status"
      aria-label="加载中"
    />
  );
}

export default LoadingOverlay;
