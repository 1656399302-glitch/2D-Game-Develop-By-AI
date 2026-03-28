interface StabilizerCoreProps {
  isActive?: boolean;
  isCharging?: boolean;
}

export function StabilizerCoreSVG({ isActive, isCharging }: StabilizerCoreProps) {
  const glowColor = '#22c55e';
  const coreColor = '#4ade80';
  const accentColor = '#86efac';
  
  return (
    <svg 
      width="80" 
      height="80" 
      viewBox="0 0 80 80" 
      className={`stabilizer-core ${isActive ? 'active' : ''} ${isCharging ? 'charging' : ''}`}
    >
      <defs>
        {/* Primary glow gradient */}
        <radialGradient id="stabilizer-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.8" />
          <stop offset="50%" stopColor={coreColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={coreColor} stopOpacity="0" />
        </radialGradient>
        
        {/* Core gradient */}
        <radialGradient id="stabilizer-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="60%" stopColor={coreColor} />
          <stop offset="100%" stopColor="#166534" />
        </radialGradient>
        
        {/* Filter for glow effect */}
        <filter id="stabilizer-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isActive ? "4" : "2"} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Ring pulse filter */}
        <filter id="stabilizer-pulse" x="-100%" y="-100%" width="300%" height="300%">
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
        fill="url(#stabilizer-glow)" 
        opacity={isActive ? 0.8 : 0.4}
        className={isCharging ? 'pulse-glow' : ''}
      />
      
      {/* Octagonal outer shape */}
      <polygon
        points="40,5 60,10 72,30 70,52 55,72 25,72 10,52 8,28 22,10"
        fill="url(#stabilizer-core)"
        stroke={accentColor}
        strokeWidth="2"
        filter={isActive ? "url(#stabilizer-pulse)" : "url(#stabilizer-glow-filter)"}
      />
      
      {/* Concentric ring pattern */}
      <circle
        cx="40"
        cy="40"
        r="28"
        fill="none"
        stroke={glowColor}
        strokeWidth="1"
        opacity="0.5"
        strokeDasharray="4,4"
      />
      <circle
        cx="40"
        cy="40"
        r="22"
        fill="none"
        stroke={coreColor}
        strokeWidth="1.5"
        opacity="0.7"
        className={isActive ? 'ring-pulse-outer' : ''}
      />
      <circle
        cx="40"
        cy="40"
        r="16"
        fill="none"
        stroke={accentColor}
        strokeWidth="1"
        opacity="0.5"
        strokeDasharray="2,6"
      />
      <circle
        cx="40"
        cy="40"
        r="10"
        fill="none"
        stroke={coreColor}
        strokeWidth="2"
        opacity="0.8"
        className={isActive ? 'ring-pulse-inner' : ''}
      />
      
      {/* Stabilization cross symbol */}
      <g className={isActive ? 'stabilizer-symbol' : ''}>
        {/* Horizontal bar */}
        <rect
          x="30"
          y="36"
          width="20"
          height="8"
          rx="2"
          fill={coreColor}
          opacity={isActive ? 1 : 0.6}
        />
        {/* Vertical bar */}
        <rect
          x="36"
          y="28"
          width="8"
          height="24"
          rx="2"
          fill={coreColor}
          opacity={isActive ? 1 : 0.6}
        />
      </g>
      
      {/* Center hub */}
      <circle 
        cx="40" 
        cy="40" 
        r="6" 
        fill={accentColor}
      />
      <circle 
        cx="40" 
        cy="40" 
        r="3" 
        fill="#fff"
        opacity={isActive ? 1 : 0.7}
        className={isActive || isCharging ? 'center-pulse' : ''}
      />
      
      {/* Corner node points */}
      <g className={isActive ? 'nodes-active' : ''}>
        <circle cx="40" cy="5" r="3" fill={glowColor} />
        <circle cx="72" cy="40" r="3" fill={glowColor} />
        <circle cx="40" cy="75" r="3" fill={glowColor} />
        <circle cx="8" cy="40" r="3" fill={glowColor} />
      </g>
      
      {/* Energy flow indicators */}
      <g className={isActive ? 'energy-flow' : ''} opacity={isActive ? 1 : 0.4}>
        {/* Left input indicators */}
        <line x1="8" y1="25" x2="15" y2="30" stroke={glowColor} strokeWidth="1.5" />
        <line x1="8" y1="55" x2="15" y2="50" stroke={glowColor} strokeWidth="1.5" />
        {/* Right output indicator */}
        <line x1="72" y1="40" x2="78" y2="40" stroke={glowColor} strokeWidth="2" />
      </g>
      
      <style>{`
        .stabilizer-core .pulse-glow {
          animation: stabilizer-pulse 1.8s ease-in-out infinite;
        }
        .stabilizer-core .ring-pulse-outer {
          animation: ring-expand 2.4s ease-in-out infinite;
          transform-origin: center;
        }
        .stabilizer-core .ring-pulse-inner {
          animation: ring-expand 1.8s ease-in-out infinite 0.3s;
          transform-origin: center;
        }
        .stabilizer-core .center-pulse {
          animation: center-pulse 1.2s ease-in-out infinite;
        }
        .stabilizer-core .nodes-active circle {
          animation: node-glow 1.2s ease-in-out infinite;
        }
        @keyframes stabilizer-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes ring-expand {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 0.5; }
        }
        @keyframes center-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }
        @keyframes node-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; filter: drop-shadow(0 0 4px #22c55e); }
        }
      `}</style>
    </svg>
  );
}

export default StabilizerCoreSVG;
