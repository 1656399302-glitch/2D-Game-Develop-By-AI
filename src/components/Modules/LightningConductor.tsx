interface LightningConductorProps {
  isActive?: boolean;
  isCharging?: boolean;
}

export function LightningConductorSVG({ isActive, isCharging }: LightningConductorProps) {
  const glowColor = '#facc15'; // Yellow for lightning
  const coreColor = '#eab308';
  const accentColor = '#fde047';
  
  return (
    <svg 
      width="80" 
      height="80" 
      viewBox="0 0 80 80" 
      className={`lightning-conductor ${isActive ? 'active' : ''} ${isCharging ? 'charging' : ''}`}
    >
      <defs>
        {/* Lightning glow gradient */}
        <radialGradient id="lightning-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="1" />
          <stop offset="50%" stopColor={coreColor} stopOpacity="0.6" />
          <stop offset="100%" stopColor={coreColor} stopOpacity="0" />
        </radialGradient>
        
        {/* Core gradient */}
        <linearGradient id="lightning-core" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="50%" stopColor={coreColor} />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id="lightning-glow-filter" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={isActive ? "5" : "2"} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Electric crackle filter */}
        <filter id="electric-crackle">
          <feTurbulence type="turbulence" baseFrequency="0.1" numOctaves="2" result="noise">
            <animate attributeName="baseFrequency" values="0.1;0.15;0.1" dur="0.2s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
        </filter>
      </defs>
      
      {/* Outer electric field */}
      <circle 
        cx="40" 
        cy="40" 
        r="38" 
        fill="url(#lightning-glow)" 
        opacity={isActive ? 1 : 0.4}
        className={isCharging ? 'electric-field' : ''}
      />
      
      {/* Hexagonal outer frame */}
      <polygon
        points="40,5 68,22.5 68,57.5 40,75 12,57.5 12,22.5"
        fill="none"
        stroke={accentColor}
        strokeWidth="2"
        opacity={isActive ? 1 : 0.6}
      />
      
      {/* Inner hexagonal frame */}
      <polygon
        points="40,15 60,27.5 60,52.5 40,65 20,52.5 20,27.5"
        fill="none"
        stroke={glowColor}
        strokeWidth="1"
        opacity={isActive ? 0.8 : 0.4}
      />
      
      {/* Main lightning bolt */}
      <path
        d="M45,12 L35,35 L48,35 L30,68 L38,42 L25,42 Z"
        fill="url(#lightning-core)"
        stroke={accentColor}
        strokeWidth="1"
        filter={isActive ? "url(#electric-crackle)" : "url(#lightning-glow-filter)"}
        className={isActive ? 'lightning-flash' : ''}
      />
      
      {/* Electric arcs */}
      <g className={isActive ? 'electric-arcs' : ''} opacity={isActive ? 1 : 0.5}>
        {/* Arc 1 */}
        <path
          d="M20,20 L15,25 L20,25"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Arc 2 */}
        <path
          d="M60,20 L65,25 L60,25"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Arc 3 */}
        <path
          d="M60,55 L65,55 L60,60"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Arc 4 */}
        <path
          d="M20,55 L15,55 L20,60"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      
      {/* Spark nodes on frame */}
      <circle cx="40" cy="5" r="3" fill={accentColor} className={isActive ? 'spark-flicker' : ''} />
      <circle cx="68" cy="22.5" r="3" fill={glowColor} className={isActive ? 'spark-flicker' : ''} />
      <circle cx="68" cy="57.5" r="3" fill={accentColor} className={isActive ? 'spark-flicker' : ''} />
      <circle cx="40" cy="75" r="3" fill={glowColor} className={isActive ? 'spark-flicker' : ''} />
      <circle cx="12" cy="57.5" r="3" fill={accentColor} className={isActive ? 'spark-flicker' : ''} />
      <circle cx="12" cy="22.5" r="3" fill={glowColor} className={isActive ? 'spark-flicker' : ''} />
      
      {/* Inner glow core */}
      <circle 
        cx="40" 
        cy="40" 
        r="8" 
        fill={coreColor}
        opacity={isActive ? 1 : 0.7}
        className={isActive || isCharging ? 'core-crackle' : ''}
      />
      
      {/* Bright center */}
      <circle 
        cx="40" 
        cy="40" 
        r="4" 
        fill={accentColor}
        opacity={isActive ? 1 : 0.9}
      />
      
      {/* Electric particles */}
      <g className={isActive ? 'electric-particles' : ''}>
        <circle cx="25" cy="30" r="1.5" fill={accentColor} />
        <circle cx="55" cy="30" r="1.5" fill={glowColor} />
        <circle cx="25" cy="50" r="1.5" fill={glowColor} />
        <circle cx="55" cy="50" r="1.5" fill={accentColor} />
        <circle cx="40" cy="20" r="1.5" fill={accentColor} />
        <circle cx="40" cy="60" r="1.5" fill={glowColor} />
      </g>
      
      <style>{`
        .lightning-conductor .electric-field {
          animation: electric-field 0.5s ease-in-out infinite;
        }
        .lightning-conductor .lightning-flash {
          animation: lightning-flash 0.4s ease-in-out infinite;
        }
        .lightning-conductor .electric-arcs {
          animation: arc-crackle 0.3s ease-in-out infinite;
        }
        .lightning-conductor .spark-flicker {
          animation: spark-flicker 0.2s ease-in-out infinite;
        }
        .lightning-conductor .core-crackle {
          animation: core-crackle 0.15s ease-in-out infinite;
        }
        .lightning-conductor .electric-particles {
          animation: particle-zap 0.5s ease-out infinite;
        }
        .lightning-conductor .electric-particles circle:nth-child(1) { animation-delay: 0s; }
        .lightning-conductor .electric-particles circle:nth-child(2) { animation-delay: 0.1s; }
        .lightning-conductor .electric-particles circle:nth-child(3) { animation-delay: 0.2s; }
        .lightning-conductor .electric-particles circle:nth-child(4) { animation-delay: 0.3s; }
        .lightning-conductor .electric-particles circle:nth-child(5) { animation-delay: 0.15s; }
        .lightning-conductor .electric-particles circle:nth-child(6) { animation-delay: 0.25s; }
        @keyframes electric-field {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }
        @keyframes lightning-flash {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.7; filter: brightness(1.5); }
        }
        @keyframes arc-crackle {
          0%, 100% { opacity: 1; }
          33% { opacity: 0.6; }
          66% { opacity: 0.9; }
        }
        @keyframes spark-flicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes core-crackle {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1) rotate(5deg); }
          75% { transform: scale(0.9) rotate(-5deg); }
        }
        @keyframes particle-zap {
          0% { opacity: 1; transform: translate(0, 0); }
          50% { opacity: 0.8; }
          100% { opacity: 0; transform: translate(5px, -5px); }
        }
      `}</style>
    </svg>
  );
}

export default LightningConductorSVG;
