interface ResonanceChamberProps {
  isActive?: boolean;
  isCharging?: boolean;
}

export function ResonanceChamberSVG({ isActive, isCharging }: ResonanceChamberProps) {
  const glowColor = '#22d3ee'; // Cyan for resonance
  const coreColor = '#0891b2';
  const accentColor = '#06b6d4';
  
  return (
    <svg 
      width="80" 
      height="80" 
      viewBox="0 0 80 80" 
      className={`resonance-chamber ${isActive ? 'active' : ''} ${isCharging ? 'charging' : ''}`}
    >
      <defs>
        {/* Resonance wave gradient */}
        <radialGradient id="resonance-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.8" />
          <stop offset="50%" stopColor={coreColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={coreColor} stopOpacity="0" />
        </radialGradient>
        
        {/* Concentric ring gradient */}
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="50%" stopColor={glowColor} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id="resonance-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isActive ? "3" : "1.5"} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Pulse filter for active state */}
        <filter id="resonance-pulse" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer glow */}
      <circle 
        cx="40" 
        cy="40" 
        r="38" 
        fill="url(#resonance-glow)" 
        opacity={isActive ? 0.9 : 0.4}
        className={isCharging ? 'pulse-glow' : ''}
      />
      
      {/* Outer resonance ring */}
      <circle
        cx="40"
        cy="40"
        r="35"
        fill="none"
        stroke={accentColor}
        strokeWidth="1.5"
        opacity={isActive ? 0.8 : 0.4}
        className={isActive ? 'resonance-ring-outer' : ''}
      />
      
      {/* Middle ring */}
      <circle
        cx="40"
        cy="40"
        r="28"
        fill="none"
        stroke={glowColor}
        strokeWidth="1"
        opacity={isActive ? 0.7 : 0.3}
        className={isActive ? 'resonance-ring-middle' : ''}
      />
      
      {/* Inner ring */}
      <circle
        cx="40"
        cy="40"
        r="20"
        fill="none"
        stroke={accentColor}
        strokeWidth="1"
        opacity={isActive ? 0.6 : 0.3}
        className={isActive ? 'resonance-ring-inner' : ''}
      />
      
      {/* Spiral arm 1 */}
      <path
        d="M40,40 Q55,30 60,15"
        fill="none"
        stroke={glowColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={isActive ? 1 : 0.5}
        className={isActive ? 'spiral-rotate' : ''}
      />
      
      {/* Spiral arm 2 */}
      <path
        d="M40,40 Q25,50 10,55"
        fill="none"
        stroke={accentColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={isActive ? 0.8 : 0.4}
        className={isActive ? 'spiral-rotate-reverse' : ''}
      />
      
      {/* Core energy center */}
      <circle 
        cx="40" 
        cy="40" 
        r="12" 
        fill={coreColor}
        opacity={isActive ? 1 : 0.8}
        className={isActive || isCharging ? 'core-pulse' : ''}
      />
      
      {/* Inner core */}
      <circle 
        cx="40" 
        cy="40" 
        r="7" 
        fill={glowColor}
        opacity={isActive ? 1 : 0.9}
      />
      
      {/* Brightest center */}
      <circle 
        cx="40" 
        cy="40" 
        r="3" 
        fill="#fff"
        opacity={isActive ? 1 : 0.7}
      />
      
      {/* Resonance nodes */}
      <circle cx="40" cy="5" r="3" fill={accentColor} opacity={isActive ? 0.9 : 0.5} />
      <circle cx="75" cy="40" r="3" fill={glowColor} opacity={isActive ? 0.9 : 0.5} />
      <circle cx="40" cy="75" r="3" fill={accentColor} opacity={isActive ? 0.9 : 0.5} />
      <circle cx="5" cy="40" r="3" fill={glowColor} opacity={isActive ? 0.9 : 0.5} />
      
      {/* Diagonal nodes */}
      <circle cx="15" cy="15" r="2" fill={accentColor} opacity={isActive ? 0.7 : 0.3} />
      <circle cx="65" cy="15" r="2" fill={glowColor} opacity={isActive ? 0.7 : 0.3} />
      <circle cx="65" cy="65" r="2" fill={accentColor} opacity={isActive ? 0.7 : 0.3} />
      <circle cx="15" cy="65" r="2" fill={glowColor} opacity={isActive ? 0.7 : 0.3} />
      
      <style>{`
        .resonance-chamber .pulse-glow {
          animation: resonance-pulse 1.5s ease-in-out infinite;
        }
        .resonance-chamber .core-pulse {
          animation: core-pulse 0.8s ease-in-out infinite;
        }
        .resonance-chamber .resonance-ring-outer {
          animation: ring-expand-outer 2s ease-in-out infinite;
          transform-origin: center;
        }
        .resonance-chamber .resonance-ring-middle {
          animation: ring-expand-middle 2s ease-in-out infinite 0.3s;
          transform-origin: center;
        }
        .resonance-chamber .resonance-ring-inner {
          animation: ring-expand-inner 2s ease-in-out infinite 0.6s;
          transform-origin: center;
        }
        .resonance-chamber .spiral-rotate {
          animation: spiral-rotate 3s linear infinite;
          transform-origin: 40px 40px;
        }
        .resonance-chamber .spiral-rotate-reverse {
          animation: spiral-rotate-reverse 3s linear infinite;
          transform-origin: 40px 40px;
        }
        @keyframes resonance-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes core-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        @keyframes ring-expand-outer {
          0%, 100% { opacity: 0.8; stroke-width: 1.5; }
          50% { opacity: 0.3; stroke-width: 3; }
        }
        @keyframes ring-expand-middle {
          0%, 100% { opacity: 0.7; stroke-width: 1; }
          50% { opacity: 0.2; stroke-width: 2; }
        }
        @keyframes ring-expand-inner {
          0%, 100% { opacity: 0.6; stroke-width: 1; }
          50% { opacity: 0.1; stroke-width: 1.5; }
        }
        @keyframes spiral-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spiral-rotate-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}</style>
    </svg>
  );
}

export default ResonanceChamberSVG;
