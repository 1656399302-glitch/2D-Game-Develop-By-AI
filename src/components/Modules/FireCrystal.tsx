interface FireCrystalProps {
  isActive?: boolean;
  isCharging?: boolean;
}

export function FireCrystalSVG({ isActive, isCharging }: FireCrystalProps) {
  const glowColor = '#f97316'; // Orange for fire
  const coreColor = '#ea580c';
  const accentColor = '#fb923c';
  
  return (
    <svg 
      width="80" 
      height="80" 
      viewBox="0 0 80 80" 
      className={`fire-crystal ${isActive ? 'active' : ''} ${isCharging ? 'charging' : ''}`}
    >
      <defs>
        {/* Fire glow gradient */}
        <radialGradient id="fire-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.9" />
          <stop offset="50%" stopColor={coreColor} stopOpacity="0.5" />
          <stop offset="100%" stopColor={coreColor} stopOpacity="0" />
        </radialGradient>
        
        {/* Core gradient */}
        <linearGradient id="fire-core" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#991b1b" />
          <stop offset="50%" stopColor={coreColor} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id="fire-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isActive ? "4" : "2"} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Fire flicker filter */}
        <filter id="fire-flicker" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise">
            <animate attributeName="baseFrequency" values="0.05;0.07;0.05" dur="0.5s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
      </defs>
      
      {/* Outer glow */}
      <circle 
        cx="40" 
        cy="40" 
        r="38" 
        fill="url(#fire-glow)" 
        opacity={isActive ? 1 : 0.5}
        className={isCharging ? 'fire-pulse' : ''}
      />
      
      {/* Flame shape - outer */}
      <path
        d="M40,8 
           Q55,20 52,35 
           Q58,25 60,40 
           Q65,35 60,50 
           Q70,45 55,60 
           Q60,70 40,75 
           Q20,70 25,60 
           Q10,45 20,50 
           Q15,35 22,40 
           Q18,25 28,35 
           Q25,20 40,8 Z"
        fill="url(#fire-core)"
        stroke={accentColor}
        strokeWidth="1.5"
        opacity={isActive ? 1 : 0.7}
        filter={isActive ? "url(#fire-flicker)" : "url(#fire-glow-filter)"}
        className={isActive ? 'flame-flicker' : ''}
      />
      
      {/* Inner flame */}
      <path
        d="M40,18 
           Q50,28 48,38 
           Q52,32 52,42 
           Q55,38 50,50 
           Q55,55 40,62 
           Q25,55 30,50 
           Q25,38 28,42 
           Q28,32 32,38 
           Q30,28 40,18 Z"
        fill={coreColor}
        stroke={glowColor}
        strokeWidth="1"
        opacity={isActive ? 0.9 : 0.6}
        className={isActive ? 'inner-flame-flicker' : ''}
      />
      
      {/* Core ember */}
      <ellipse 
        cx="40" 
        cy="42" 
        rx="10" 
        ry="12" 
        fill={glowColor}
        opacity={isActive ? 1 : 0.8}
        className={isActive || isCharging ? 'ember-glow' : ''}
      />
      
      {/* Brightest core */}
      <ellipse 
        cx="40" 
        cy="40" 
        rx="5" 
        ry="6" 
        fill={accentColor}
        opacity={isActive ? 1 : 0.9}
      />
      
      {/* Spark points */}
      <circle cx="30" cy="20" r="2" fill={accentColor} opacity={isActive ? 0.8 : 0.4} />
      <circle cx="52" cy="18" r="1.5" fill={glowColor} opacity={isActive ? 0.7 : 0.3} />
      <circle cx="55" cy="35" r="2" fill={accentColor} opacity={isActive ? 0.8 : 0.4} />
      <circle cx="25" cy="38" r="1.5" fill={glowColor} opacity={isActive ? 0.6 : 0.3} />
      <circle cx="35" cy="65" r="2" fill={accentColor} opacity={isActive ? 0.7 : 0.3} />
      <circle cx="48" cy="60" r="1.5" fill={glowColor} opacity={isActive ? 0.6 : 0.3} />
      
      {/* Floating sparks */}
      <g className={isActive ? 'floating-sparks' : ''} opacity={isActive ? 1 : 0}>
        <circle cx="25" cy="15" r="1.5" fill={accentColor} />
        <circle cx="60" cy="25" r="1" fill={glowColor} />
        <circle cx="15" cy="45" r="1.5" fill={accentColor} />
        <circle cx="65" cy="55" r="1" fill={glowColor} />
        <circle cx="35" cy="70" r="1.5" fill={accentColor} />
        <circle cx="50" cy="68" r="1" fill={glowColor} />
      </g>
      
      <style>{`
        .fire-crystal .fire-pulse {
          animation: fire-pulse 0.8s ease-in-out infinite;
        }
        .fire-crystal .flame-flicker {
          animation: flame-flicker 0.3s ease-in-out infinite;
        }
        .fire-crystal .inner-flame-flicker {
          animation: inner-flicker 0.25s ease-in-out infinite;
        }
        .fire-crystal .ember-glow {
          animation: ember-glow 0.6s ease-in-out infinite;
        }
        .fire-crystal .floating-sparks {
          animation: sparks-rise 1.5s ease-out infinite;
        }
        .fire-crystal .floating-sparks circle:nth-child(1) { animation-delay: 0s; }
        .fire-crystal .floating-sparks circle:nth-child(2) { animation-delay: 0.2s; }
        .fire-crystal .floating-sparks circle:nth-child(3) { animation-delay: 0.4s; }
        .fire-crystal .floating-sparks circle:nth-child(4) { animation-delay: 0.6s; }
        .fire-crystal .floating-sparks circle:nth-child(5) { animation-delay: 0.8s; }
        .fire-crystal .floating-sparks circle:nth-child(6) { animation-delay: 1s; }
        @keyframes fire-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        @keyframes flame-flicker {
          0%, 100% { opacity: 1; transform: scaleY(1) skewX(0deg); }
          25% { opacity: 0.9; transform: scaleY(0.98) skewX(1deg); }
          50% { opacity: 1; transform: scaleY(1.02) skewX(-0.5deg); }
          75% { opacity: 0.95; transform: scaleY(0.99) skewX(0.5deg); }
        }
        @keyframes inner-flicker {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 1; transform: scale(0.95); }
        }
        @keyframes ember-glow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes sparks-rise {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-15px); }
        }
      `}</style>
    </svg>
  );
}

export default FireCrystalSVG;
