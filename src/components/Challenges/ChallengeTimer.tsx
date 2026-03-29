/**
 * Challenge Timer Component
 * 
 * Countdown timer with play/pause/resume controls for time-trial challenge mode.
 * Uses requestAnimationFrame for smooth updates with throttled React re-renders.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface ChallengeTimerProps {
  /** Time limit in seconds */
  limit: number;
  /** Callback when timer reaches zero */
  onComplete?: () => void;
  /** Callback when timer expires */
  onExpire?: () => void;
  /** Whether the timer should auto-start */
  autoStart?: boolean;
  /** Additional CSS classes */
  className?: string;
}

type TimerState = 'idle' | 'running' | 'paused' | 'completed';

interface TimerDisplay {
  minutes: string;
  seconds: string;
  totalSeconds: number;
  isWarning: boolean;
  isCritical: boolean;
}

/**
 * Format seconds into MM:SS display
 */
function formatTimeDisplay(remainingSeconds: number): TimerDisplay {
  const absSeconds = Math.abs(remainingSeconds);
  const minutes = Math.floor(absSeconds / 60);
  const seconds = absSeconds % 60;
  
  return {
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    totalSeconds: remainingSeconds,
    isWarning: absSeconds <= 60 && absSeconds > 10,
    isCritical: absSeconds <= 10,
  };
}

/**
 * Challenge Timer Component with countdown functionality
 */
export function ChallengeTimer({
  limit,
  onComplete,
  onExpire,
  autoStart = false,
  className = '',
}: ChallengeTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(limit);
  const [timerState, setTimerState] = useState<TimerState>(autoStart ? 'running' : 'idle');
  
  const lastUpdateRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Display state (throttled updates)
  const [display, setDisplay] = useState<TimerDisplay>(() => formatTimeDisplay(limit));

  // Start the timer
  const start = useCallback(() => {
    if (timerState === 'running') return;
    
    if (timerState === 'idle' || timerState === 'completed') {
      setTimeRemaining(limit);
      startTimeRef.current = Date.now();
    } else if (timerState === 'paused' && startTimeRef.current !== null) {
      // Adjust start time to account for pause
      const pausedDuration = Date.now() - lastUpdateRef.current;
      startTimeRef.current += pausedDuration;
    }
    
    setTimerState('running');
    lastUpdateRef.current = Date.now();
  }, [timerState, limit]);

  // Pause the timer
  const pause = useCallback(() => {
    if (timerState !== 'running') return;
    
    setTimerState('paused');
    lastUpdateRef.current = Date.now();
  }, [timerState]);

  // Resume the timer
  const resume = useCallback(() => {
    if (timerState !== 'paused') return;
    start();
  }, [timerState, start]);

  // Toggle pause/resume
  const toggle = useCallback(() => {
    if (timerState === 'running') {
      pause();
    } else if (timerState === 'paused') {
      resume();
    } else if (timerState === 'idle') {
      start();
    }
  }, [timerState, pause, resume, start]);

  // Reset the timer
  const reset = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setTimeRemaining(limit);
    setTimerState('idle');
    setDisplay(formatTimeDisplay(limit));
    startTimeRef.current = null;
  }, [limit]);

  // Animation loop
  useEffect(() => {
    if (timerState !== 'running') return;

    const tick = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - (startTimeRef.current || now)) / 1000);
      const remaining = limit - elapsed;

      setTimeRemaining(remaining);

      // Throttle display updates to ~60fps
      if (now - lastUpdateRef.current >= 16) {
        setDisplay(formatTimeDisplay(remaining));
        lastUpdateRef.current = now;
      }

      if (remaining <= 0) {
        setTimerState('completed');
        onExpire?.();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [timerState, limit, onExpire]);

  // Handle completion callback
  useEffect(() => {
    if (timerState === 'completed' && timeRemaining === 0) {
      onComplete?.();
    }
  }, [timerState, timeRemaining, onComplete]);

  // Get button text based on state
  const getButtonText = () => {
    switch (timerState) {
      case 'idle':
        return '▶ Start';
      case 'running':
        return '⏸ Pause';
      case 'paused':
        return '▶ Resume';
      case 'completed':
        return '↻ Reset';
    }
  };

  // Get timer color based on state
  const getTimerColor = () => {
    if (display.isCritical) return '#ef4444';
    if (display.isWarning) return '#f59e0b';
    if (timerState === 'completed') return '#ef4444';
    return '#00d4ff';
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Timer Display */}
      <div 
        className="relative flex items-center justify-center min-w-[80px] px-3 py-2 rounded-lg font-mono text-lg font-bold transition-colors"
        style={{ 
          backgroundColor: `${getTimerColor()}15`,
          color: getTimerColor(),
        }}
      >
        {/* Glow Effect */}
        <div
          className="absolute inset-0 rounded-lg blur-sm opacity-30"
          style={{ backgroundColor: getTimerColor() }}
        />
        
        {/* Time Display */}
        <span className="relative z-10">
          {display.totalSeconds < 0 && '-'}
          {display.minutes}:{display.seconds}
        </span>
        
        {/* Critical Animation */}
        {display.isCritical && timerState === 'running' && (
          <span className="absolute inset-0 rounded-lg animate-pulse opacity-50" 
                style={{ backgroundColor: '#ef4444' }} />
        )}
      </div>

      {/* Control Button */}
      <button
        onClick={toggle}
        className="px-3 py-2 rounded-lg font-medium text-sm transition-all"
        style={{
          backgroundColor: `${getTimerColor()}20`,
          color: getTimerColor(),
          borderColor: getTimerColor(),
        }}
      >
        {getButtonText()}
      </button>

      {/* Reset Button (only show when not idle) */}
      {(timerState === 'paused' || timerState === 'completed') && (
        <button
          onClick={reset}
          className="px-3 py-2 rounded-lg font-medium text-sm bg-[#1e2a42] text-[#9ca3af] hover:bg-[#2d3a56] hover:text-white transition-all"
        >
          ↻ Reset
        </button>
      )}

      {/* Status Indicator */}
      {timerState === 'running' && !display.isCritical && (
        <div className="flex items-center gap-1.5">
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: getTimerColor() }}
          />
          <span className="text-xs text-[#4a5568]">Running</span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Timer for inline display
 */
export function CompactTimer({
  limit,
  autoStart = false,
  onExpire,
}: Omit<ChallengeTimerProps, 'onComplete' | 'className'>) {
  const [timeRemaining, setTimeRemaining] = useState(limit);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning || timeRemaining <= 0) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, onExpire]);

  const display = formatTimeDisplay(timeRemaining);
  const color = display.isCritical ? '#ef4444' : display.isWarning ? '#f59e0b' : '#00d4ff';

  return (
    <div className="inline-flex items-center gap-2">
      <span 
        className="font-mono font-bold"
        style={{ color }}
      >
        {display.minutes}:{display.seconds}
      </span>
      {isRunning && (
        <button
          onClick={() => setIsRunning(false)}
          className="text-xs text-[#9ca3af] hover:text-white"
        >
          ⏸
        </button>
      )}
      {!isRunning && timeRemaining > 0 && (
        <button
          onClick={() => setIsRunning(true)}
          className="text-xs text-[#9ca3af] hover:text-white"
        >
          ▶
        </button>
      )}
    </div>
  );
}

export default ChallengeTimer;
