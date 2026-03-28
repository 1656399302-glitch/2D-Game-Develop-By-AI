interface AmplifierCrystalProps {
  isActive?: boolean;
  isCharging?: boolean;
}

export function AmplifierCrystalSVG({ isActive, isCharging }: AmplifierCrystalProps) {
  const glowColor = '#a855f7';
  const coreColor = '#9333ea';
  const accentColor = '#c084fc';
  
  return (
    <svg 
      width="80" 
      height="80" 
      viewBox="0 0 80 80" 
      className={`amplifier-crystal ${isActive ? 'active' : ''} ${isCharging ? 'charging' : ''}`}
    >
      <defs>
        {/* Primary glow gradient */}
        <radialGradient id="crystal-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.8" />
          <stop offset="50%" stopColor={coreColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={coreColor} stopOpacity="0" />
        </radialGradient>
        
        {/* Core gradient */}
        <linearGradient id="crystal-core" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="50%" stopColor={coreColor} />
          <stop offset="100%" stopColor="#581c87" />
        </linearGradient>
        
        {/* Filter for glow effect */}
        <filter id="crystal-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isActive ? "4" : "2"} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Animated pulse filter */}
        <filter id="crystal-pulse" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
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
        fill="url(#crystal-glow)" 
        opacity={isActive ? 0.8 : 0.4}
        className={isCharging ? 'pulse-glow' : ''}
      />
      
      {/* Diamond/prism shape - main body */}
      <polygon
        points="40,5 70,40 40,75 10,40"
        fill="url(#crystal-core)"
        stroke={accentColor}
        strokeWidth="2"
        filter={isActive ? "url(#crystal-pulse)" : "url(#crystal-glow-filter)"}
      />
      
      {/* Inner facet lines */}
      <line x1="40" y1="5" x2="40" y2="75" stroke={accentColor} strokeWidth="0.5" opacity="0.6" />
      <line x1="10" y1="40" x2="70" y2="40" stroke={accentColor} strokeWidth="0.5" opacity="0.6" />
      <line x1="15" y1="17.5" x2="65" y2="62.5" stroke={accentColor} strokeWidth="0.5" opacity="0.4" />
      <line x1="15" y1="62.5" x2="65" y2="17.5" stroke={accentColor} strokeWidth="0.5" opacity="0.4" />
      
      {/* Inner diamond highlight */}
      <polygon
        points="40,15 60,40 40,65 20,40"
        fill="none"
        stroke={accentColor}
        strokeWidth="1"
        opacity="0.5"
      />
      
      {/* Core energy center */}
      <circle 
        cx="40" 
        cy="40" 
        r="10" 
        fill={coreColor}
        opacity={isActive ? 1 : 0.8}
      />
      <circle 
        cx="40" 
        cy="40" 
        r="6" 
        fill={accentColor}
        className={isActive || isCharging ? 'core-pulse' : ''}
      />
      <circle 
        cx="40" 
        cy="40" 
        r="3" 
        fill="#fff"
        opacity={isActive ? 1 : 0.6}
      />
      
      {/* Energy flow lines */}
      <g className={isActive ? 'energy-flow' : ''} opacity={isActive ? 1 : 0.5}>
        <path
          d="M25,40 L15,40"
          stroke={glowColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M55,40 L65,40"
          stroke={glowColor}
          strokeWidth="2"
          strokeLinecap="round"
          className="flow-right-1"
        />
        <path
          d="M50,20 L60,15"
          stroke={glowColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          className="flow-right-2"
        />
        <path
          d="M50,60 L60,65"
          stroke={glowColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          className="flow-right-2"
        />
      </g>
      
      {/* Corner accents */}
      <circle cx="40" cy="5" r="2" fill={accentColor} />
      <circle cx="70" cy="40" r="2" fill={accentColor} />
      <circle cx="40" cy="75" r="2" fill={accentColor} />
      <circle cx="10" cy="40" r="2" fill={accentColor} />
      
      <style>{`
        .amplifier-crystal .pulse-glow {
          animation: crystal-pulse 1.5s ease-in-out infinite;
        }
        .amplifier-crystal .core-pulse {
          animation: core-pulse 0.8s ease-in-out infinite;
        }
        .amplifier-crystal .energy-flow .flow-right-1 {
          animation: flow-out 0.8s ease-in-out infinite;
        }
        .amplifier-crystal .energy-flow .flow-right-2 {
          animation: flow-out 0.8s ease-in-out infinite 0.2s;
        }
        @keyframes crystal-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes core-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.8; }
        }
        @keyframes flow-out {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </svg>
  );
}

export default AmplifierCrystalSVG;
