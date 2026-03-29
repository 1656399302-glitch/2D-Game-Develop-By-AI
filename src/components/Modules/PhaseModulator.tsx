import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface PhaseModulatorProps {
  isActive?: boolean;
  isCharging?: boolean;
}

export function PhaseModulatorSVG({ isActive, isCharging }: PhaseModulatorProps) {
  const lightningRef = useRef<SVGPathElement>(null);
  const phaseRingRef = useRef<SVGCircleElement>(null);
  
  // Phase/Lightning theme colors
  const primaryColor = '#0891b2'; // Cyan
  const secondaryColor = '#06b6d4'; // Lighter cyan
  const accentColor = '#22d3ee'; // Bright cyan
  const energyColor = '#a5f3fc'; // Very light cyan
  const coreColor = '#164e63'; // Dark cyan
  
  // Animate lightning arcs when active
  useEffect(() => {
    if (!lightningRef.current) return;
    
    if (isActive || isCharging) {
      gsap.to(lightningRef.current, {
        opacity: 1,
        duration: 0.1,
        repeat: -1,
        yoyo: true,
        repeatDelay: 0.3,
      });
    } else {
      gsap.to(lightningRef.current, {
        opacity: 0.2,
        duration: 0.3,
      });
    }
  }, [isActive, isCharging]);
  
  // Animate phase shift ring
  useEffect(() => {
    if (!phaseRingRef.current) return;
    
    if (isActive || isCharging) {
      gsap.to(phaseRingRef.current, {
        rotation: 360,
        transformOrigin: '40px 40px',
        duration: 2,
        ease: 'none',
        repeat: -1,
      });
    } else {
      gsap.to(phaseRingRef.current, {
        rotation: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }, [isActive, isCharging]);

  return (
    <svg 
      width="80" 
      height="80" 
      viewBox="0 0 80 80" 
      className={`phase-modulator ${isActive ? 'active' : ''} ${isCharging ? 'charging' : ''}`}
    >
      <defs>
        {/* Cyan energy gradient */}
        <radialGradient id="phase-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={coreColor} />
          <stop offset="60%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={secondaryColor} />
        </radialGradient>
        
        {/* Lightning glow gradient */}
        <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={energyColor} />
          <stop offset="50%" stopColor={accentColor} />
          <stop offset="100%" stopColor={primaryColor} />
        </linearGradient>
        
        {/* Phase shift gradient */}
        <linearGradient id="phase-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.8" />
          <stop offset="50%" stopColor={energyColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.8" />
        </linearGradient>
        
        {/* Glow filter for lightning */}
        <filter id="lightning-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isActive ? "3" : "1.5"} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Electric shimmer filter */}
        <filter id="electric-shimmer" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="noise">
            <animate attributeName="seed" values="1;2;3;4;5" dur="0.5s" repeatCount="indefinite"/>
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      
      {/* Outer electric field */}
      <circle 
        cx="40" 
        cy="40" 
        r="36" 
        fill="none"
        stroke={accentColor}
        strokeWidth="1"
        strokeDasharray="3,6"
        opacity={isActive ? 0.6 : 0.2}
        className="electric-field"
      />
      
      {/* Main hexagonal body */}
      <polygon
        points="40,4 68,18 68,52 40,66 12,52 12,18"
        fill="url(#phase-core)"
        stroke={accentColor}
        strokeWidth="2"
        filter={isActive ? "url(#lightning-glow)" : "none"}
      />
      
      {/* Inner hexagon */}
      <polygon
        points="40,12 60,23 60,47 40,58 20,47 20,23"
        fill="none"
        stroke={primaryColor}
        strokeWidth="1"
        opacity="0.5"
      />
      
      {/* Phase shift rings */}
      <g ref={phaseRingRef}>
        <circle
          cx="40"
          cy="40"
          r="26"
          fill="none"
          stroke="url(#phase-gradient)"
          strokeWidth="2"
          strokeDasharray="8,4"
          opacity={isActive ? 0.8 : 0.3}
          className="phase-ring"
        />
      </g>
      
      {/* Inner concentric pattern */}
      <circle
        cx="40"
        cy="40"
        r="18"
        fill="none"
        stroke={secondaryColor}
        strokeWidth="1"
        strokeDasharray="2,3"
        opacity={isActive ? 0.5 : 0.2}
        className={isActive ? 'inner-pulse' : ''}
      />
      
      {/* Lightning arc across center */}
      <path
        ref={lightningRef}
        d="M25,40 L32,35 L38,42 L45,32 L52,40 L58,35"
        fill="none"
        stroke="url(#lightning-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#lightning-glow)"
        opacity={isActive ? 1 : 0.2}
      />
      
      {/* Secondary lightning */}
      <path
        d="M30,30 L35,38 L30,45"
        fill="none"
        stroke={energyColor}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={isActive ? 0.6 : 0.2}
        className="lightning-secondary"
      />
      <path
        d="M50,25 L55,33 L50,40"
        fill="none"
        stroke={energyColor}
        strokeWidth="1"
        strokeLinecap="round"
        opacity={isActive ? 0.6 : 0.2}
        className="lightning-secondary-2"
      />
      
      {/* Phase shift indicators - small triangular markers */}
      <polygon points="40,8 44,14 36,14" fill={accentColor} opacity={isActive ? 0.8 : 0.3} />
      <polygon points="64,18 58,24 66,24" fill={accentColor} opacity={isActive ? 0.8 : 0.3} />
      <polygon points="64,52 58,46 66,46" fill={accentColor} opacity={isActive ? 0.8 : 0.3} />
      <polygon points="40,62 44,56 36,56" fill={accentColor} opacity={isActive ? 0.8 : 0.3} />
      <polygon points="16,52 22,46 14,46" fill={accentColor} opacity={isActive ? 0.8 : 0.3} />
      <polygon points="16,18 22,24 14,24" fill={accentColor} opacity={isActive ? 0.8 : 0.3} />
      
      {/* Central phase core */}
      <circle
        cx="40"
        cy="40"
        r="8"
        fill={coreColor}
        stroke={energyColor}
        strokeWidth="2"
      />
      <circle
        cx="40"
        cy="40"
        r="4"
        fill={accentColor}
        opacity={isActive ? 1 : 0.6}
        className={isActive || isCharging ? 'core-flicker' : ''}
      />
      
      {/* Input ports (left side) - 2 ports 25px apart */}
      <g transform="translate(2, 25)">
        <circle
          cx="0"
          cy="0"
          r="6"
          fill={coreColor}
          stroke={primaryColor}
          strokeWidth="1.5"
        />
        <circle
          cx="0"
          cy="0"
          r="2"
          fill={accentColor}
          opacity={isActive || isCharging ? 0.9 : 0.4}
          className={isActive || isCharging ? 'input-glow-1' : ''}
        />
        <line x1="-4" y1="0" x2="0" y2="0" stroke={accentColor} strokeWidth="1" opacity="0.5" />
      </g>
      <g transform="translate(2, 50)">
        <circle
          cx="0"
          cy="0"
          r="6"
          fill={coreColor}
          stroke={primaryColor}
          strokeWidth="1.5"
        />
        <circle
          cx="0"
          cy="0"
          r="2"
          fill={accentColor}
          opacity={isActive || isCharging ? 0.9 : 0.4}
          className={isActive || isCharging ? 'input-glow-2' : ''}
        />
        <line x1="-4" y1="0" x2="0" y2="0" stroke={accentColor} strokeWidth="1" opacity="0.5" />
      </g>
      
      {/* Output ports (right side) - 2 ports 25px apart */}
      <g transform="translate(78, 25)">
        <circle
          cx="0"
          cy="0"
          r="6"
          fill={coreColor}
          stroke={secondaryColor}
          strokeWidth="1.5"
        />
        <circle
          cx="0"
          cy="0"
          r="2"
          fill={energyColor}
          opacity={isActive ? 0.9 : 0.4}
          className={isActive ? 'output-glow-1' : ''}
        />
        <line x1="0" y1="0" x2="4" y2="0" stroke={energyColor} strokeWidth="1" opacity="0.5" />
      </g>
      <g transform="translate(78, 50)">
        <circle
          cx="0"
          cy="0"
          r="6"
          fill={coreColor}
          stroke={secondaryColor}
          strokeWidth="1.5"
        />
        <circle
          cx="0"
          cy="0"
          r="2"
          fill={energyColor}
          opacity={isActive ? 0.9 : 0.4}
          className={isActive ? 'output-glow-2' : ''}
        />
        <line x1="0" y1="0" x2="4" y2="0" stroke={energyColor} strokeWidth="1" opacity="0.5" />
      </g>
      
      {/* Phase flicker overlay when charging */}
      {isCharging && (
        <rect
          x="12"
          y="18"
          width="56"
          height="44"
          fill={accentColor}
          opacity="0.1"
          className="phase-flicker"
        />
      )}
      
      <style>{`
        .phase-modulator .electric-field {
          animation: electric-field-pulse 2s ease-in-out infinite;
        }
        .phase-modulator .phase-ring {
          animation: phase-rotate 4s linear infinite;
        }
        .phase-modulator .inner-pulse {
          animation: inner-glow 1.5s ease-in-out infinite;
        }
        .phase-modulator .core-flicker {
          animation: phase-core-flicker 0.2s linear infinite;
        }
        .phase-modulator .lightning-secondary {
          animation: lightning-flash 0.8s ease-out infinite;
        }
        .phase-modulator .lightning-secondary-2 {
          animation: lightning-flash 0.8s ease-out infinite 0.4s;
        }
        .phase-modulator .input-glow-1 {
          animation: input-glow 0.6s ease-out infinite;
        }
        .phase-modulator .input-glow-2 {
          animation: input-glow 0.6s ease-out infinite 0.2s;
        }
        .phase-modulator .output-glow-1 {
          animation: output-glow 0.5s ease-out infinite;
        }
        .phase-modulator .output-glow-2 {
          animation: output-glow 0.5s ease-out infinite 0.25s;
        }
        .phase-modulator .phase-flicker {
          animation: phase-shift-flicker 0.15s linear infinite;
        }
        
        @keyframes electric-field-pulse {
          0%, 100% { opacity: 0.2; stroke-dashoffset: 0; }
          50% { opacity: 0.6; stroke-dashoffset: 9; }
        }
        @keyframes phase-rotate {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 24; }
        }
        @keyframes inner-glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        @keyframes phase-core-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes lightning-flash {
          0%, 70%, 100% { opacity: 0.2; }
          75%, 85% { opacity: 1; }
        }
        @keyframes input-glow {
          0% { r: 2; opacity: 0.4; }
          50% { r: 3; opacity: 1; }
          100% { r: 2; opacity: 0.4; }
        }
        @keyframes output-glow {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        @keyframes phase-shift-flicker {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </svg>
  );
}

export default PhaseModulatorSVG;
