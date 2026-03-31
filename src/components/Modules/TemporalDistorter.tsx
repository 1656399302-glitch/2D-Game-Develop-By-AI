interface TemporalDistorterProps {
  isActive: boolean;
  isCharging: boolean;
}

/**
 * Temporal Distorter Module
 * A circular time-altering module with rotating inner rings and time distortion effects
 * Size: 90x90
 * Ports: 1 input (left), 1 output (right)
 */
export function TemporalDistorterSVG({ isActive, isCharging }: TemporalDistorterProps) {
  const ringColor = isActive ? '#00ffcc' : '#a78bfa';
  const glowColor = isActive ? '#00ffcc' : '#7c3aed';
  const innerColor = isActive ? '#22d3ee' : '#6366f1';

  return (
    <g className="temporal-distorter">
      {/* Outer glow filter effect */}
      <defs>
        <filter id="temporal-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isActive ? 4 : 2} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="temporal-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={ringColor} stopOpacity="0.9" />
          <stop offset="50%" stopColor={innerColor} stopOpacity="0.7" />
          <stop offset="100%" stopColor={ringColor} stopOpacity="0.5" />
        </linearGradient>
        <clipPath id="temporal-clip">
          <circle cx="45" cy="45" r="40" />
        </clipPath>
      </defs>

      {/* Outer ring - rotating clockwise */}
      <circle
        cx="45"
        cy="45"
        r="42"
        fill="none"
        stroke={ringColor}
        strokeWidth="2"
        opacity="0.3"
        filter="url(#temporal-glow)"
        className={isActive ? 'animate-pulse' : ''}
      />

      {/* Main body circle */}
      <circle
        cx="45"
        cy="45"
        r="38"
        fill="#1e1b4b"
        stroke={ringColor}
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Counter-rotating outer ring */}
      <circle
        cx="45"
        cy="45"
        r="36"
        fill="none"
        stroke={ringColor}
        strokeWidth="1"
        strokeDasharray="4 3"
        className={isActive ? 'animate-spin-slow-reverse' : 'animate-spin-slower-reverse'}
        style={{ transformOrigin: '45px 45px' }}
      />

      {/* Middle ring - counter-rotating */}
      <circle
        cx="45"
        cy="45"
        r="28"
        fill="none"
        stroke={innerColor}
        strokeWidth="1.5"
        strokeDasharray="6 4"
        className={isActive ? 'animate-spin-slower' : 'animate-spin-slow'}
        style={{ transformOrigin: '45px 45px' }}
      />

      {/* Inner ring - rotating clockwise */}
      <circle
        cx="45"
        cy="45"
        r="20"
        fill="none"
        stroke={glowColor}
        strokeWidth="2"
        opacity="0.8"
        className={isActive ? 'animate-spin-slow-reverse' : 'animate-spin-slower-reverse'}
        style={{ transformOrigin: '45px 45px' }}
      />

      {/* Core circle with time distortion effect */}
      <circle
        cx="45"
        cy="45"
        r="12"
        fill={glowColor}
        opacity={isActive ? 0.9 : 0.6}
        filter="url(#temporal-glow)"
        className={isCharging ? 'animate-pulse' : ''}
      />

      {/* Time distortion symbols */}
      <g opacity="0.7">
        {/* Symbol 1 */}
        <path
          d="M45,25 L48,32 L42,32 Z"
          fill={ringColor}
          className={isActive ? 'animate-pulse' : ''}
        />
        {/* Symbol 2 */}
        <path
          d="M45,65 L48,58 L42,58 Z"
          fill={ringColor}
          className={isActive ? 'animate-pulse' : ''}
          style={{ animationDelay: '0.2s' }}
        />
        {/* Symbol 3 */}
        <path
          d="M25,45 L32,48 L32,42 Z"
          fill={ringColor}
          className={isActive ? 'animate-pulse' : ''}
          style={{ animationDelay: '0.4s' }}
        />
        {/* Symbol 4 */}
        <path
          d="M65,45 L58,48 L58,42 Z"
          fill={ringColor}
          className={isActive ? 'animate-pulse' : ''}
          style={{ animationDelay: '0.6s' }}
        />
      </g>

      {/* Inner time spiral effect */}
      <g opacity={isActive ? 0.8 : 0.4}>
        <path
          d="M45,35 Q55,40 50,45 Q45,50 40,45 Q35,40 45,35"
          fill="none"
          stroke={innerColor}
          strokeWidth="1"
          className={isActive ? 'animate-pulse' : ''}
        />
        <path
          d="M45,55 Q35,50 40,45 Q45,40 50,45 Q55,50 45,55"
          fill="none"
          stroke={innerColor}
          strokeWidth="1"
          className={isActive ? 'animate-pulse' : ''}
          style={{ animationDelay: '0.3s' }}
        />
      </g>

      {/* Center dot */}
      <circle
        cx="45"
        cy="45"
        r="4"
        fill="#fff"
        opacity={isActive ? 1 : 0.7}
      />

      {/* Charging effect rings */}
      {isCharging && (
        <g className="animate-ping" style={{ transformOrigin: '45px 45px' }}>
          <circle
            cx="45"
            cy="45"
            r="30"
            fill="none"
            stroke={ringColor}
            strokeWidth="1"
            opacity="0.5"
          />
          <circle
            cx="45"
            cy="45"
            r="38"
            fill="none"
            stroke={ringColor}
            strokeWidth="0.5"
            opacity="0.3"
          />
        </g>
      )}

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slower {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes spin-slower-reverse {
          from { transform: rotate(-360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        .animate-spin-slower {
          animation: spin-slower 6s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 5s linear infinite;
        }
        .animate-spin-slower-reverse {
          animation: spin-slower-reverse 7s linear infinite;
        }
      `}</style>
    </g>
  );
}

export default TemporalDistorterSVG;
