import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface VoidSiphonProps {
  isActive?: boolean;
  isCharging?: boolean;
}

export function VoidSiphonSVG({ isActive, isCharging }: VoidSiphonProps) {
  const vortexRef = useRef<SVGGElement>(null);
  const spiralRef = useRef<SVGPathElement>(null);
  
  // Void theme colors
  const primaryColor = '#7c3aed'; // Deep purple
  const secondaryColor = '#4c1d95'; // Darker purple
  const accentColor = '#a78bfa'; // Light purple
  const coreColor = '#1e1b4b'; // Very dark purple (almost void black)
  const energyColor = '#c4b5fd'; // Violet glow
  
  // Animate vortex spiral when active
  useEffect(() => {
    if (!spiralRef.current) return;
    
    if (isActive || isCharging) {
      gsap.to(spiralRef.current, {
        strokeDashoffset: -100,
        duration: 2,
        ease: 'none',
        repeat: -1,
      });
    } else {
      gsap.killTweensOf(spiralRef.current);
    }
  }, [isActive, isCharging]);
  
  // Animate vortex rotation
  useEffect(() => {
    if (!vortexRef.current) return;
    
    if (isActive || isCharging) {
      gsap.to(vortexRef.current, {
        rotation: 360,
        transformOrigin: '40px 40px',
        duration: 3,
        ease: 'none',
        repeat: -1,
      });
    } else {
      gsap.to(vortexRef.current, {
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
      className={`void-siphon ${isActive ? 'active' : ''} ${isCharging ? 'charging' : ''}`}
    >
      <defs>
        {/* Void radial gradient */}
        <radialGradient id="void-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={coreColor} />
          <stop offset="60%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor={primaryColor} />
        </radialGradient>
        
        {/* Void outer glow */}
        <radialGradient id="void-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.4" />
          <stop offset="70%" stopColor={primaryColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0" />
        </radialGradient>
        
        {/* Swirl gradient */}
        <linearGradient id="swirl-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={energyColor} />
          <stop offset="50%" stopColor={accentColor} />
          <stop offset="100%" stopColor={primaryColor} />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id="void-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isActive ? "4" : "2"} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Absorption effect filter */}
        <filter id="absorption" x="-100%" y="-100%" width="300%" height="300%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise">
            <animate attributeName="baseFrequency" values="0.02;0.03;0.02" dur="4s" repeatCount="indefinite"/>
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      
      {/* Outer glow ring */}
      <circle 
        cx="40" 
        cy="40" 
        r="38" 
        fill="url(#void-glow)" 
        opacity={isActive ? 0.8 : 0.4}
        className={isCharging ? 'pulse-glow' : ''}
      />
      
      {/* Main circular body */}
      <circle
        cx="40"
        cy="40"
        r="32"
        fill="url(#void-core)"
        stroke={accentColor}
        strokeWidth="2"
        filter={isActive ? "url(#void-glow-filter)" : "none"}
      />
      
      {/* Inner void circle */}
      <circle
        cx="40"
        cy="40"
        r="22"
        fill="none"
        stroke={primaryColor}
        strokeWidth="1"
        opacity="0.6"
      />
      
      {/* Swirling void pattern - vortex arms */}
      <g ref={vortexRef} filter={isActive ? "url(#absorption)" : "none"} opacity={isActive ? 1 : 0.5}>
        {/* Spiral arms */}
        <path
          ref={spiralRef}
          d="M40,40 Q50,30 55,20 Q60,15 65,15 Q70,20 70,30"
          fill="none"
          stroke="url(#swirl-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="20,10"
          className="swirl-arm"
        />
        <path
          d="M40,40 Q30,50 25,55 Q20,65 20,70 Q25,75 35,75"
          fill="none"
          stroke="url(#swirl-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="15,8"
          opacity="0.7"
          className="swirl-arm-2"
        />
        <path
          d="M40,40 Q35,35 30,25 Q25,15 30,10 Q38,5 45,10"
          fill="none"
          stroke="url(#swirl-gradient)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="10,5"
          opacity="0.5"
          className="swirl-arm-3"
        />
      </g>
      
      {/* Void absorption rings - animate inward when active */}
      <circle
        cx="40"
        cy="40"
        r="28"
        fill="none"
        stroke={energyColor}
        strokeWidth="1"
        strokeDasharray="4,4"
        opacity={isActive ? 0.6 : 0.3}
        className={isActive ? 'absorption-ring' : ''}
      />
      <circle
        cx="40"
        cy="40"
        r="18"
        fill="none"
        stroke={accentColor}
        strokeWidth="1"
        strokeDasharray="2,4"
        opacity={isActive ? 0.4 : 0.2}
        className={isActive ? 'absorption-ring-2' : ''}
      />
      
      {/* Central void core */}
      <circle
        cx="40"
        cy="40"
        r="8"
        fill={coreColor}
        stroke={accentColor}
        strokeWidth="2"
      />
      <circle
        cx="40"
        cy="40"
        r="4"
        fill={primaryColor}
        opacity={isActive ? 1 : 0.7}
        className={isActive || isCharging ? 'core-pulse' : ''}
      />
      
      {/* Void particles floating around */}
      <g opacity={isActive ? 0.8 : 0.3} className="void-particles">
        <circle cx="55" cy="20" r="2" fill={energyColor} className="particle-orbit" />
        <circle cx="20" cy="55" r="1.5" fill={accentColor} className="particle-orbit-2" />
        <circle cx="60" cy="50" r="1" fill={energyColor} className="particle-orbit-3" />
        <circle cx="25" cy="30" r="1.5" fill={accentColor} className="particle-orbit-4" />
      </g>
      
      {/* Energy absorption effect at input (top) */}
      <g transform="translate(40, 2)">
        <path
          d="M0,0 L8,10 L-8,10 Z"
          fill={secondaryColor}
          stroke={accentColor}
          strokeWidth="1"
        />
        <circle
          cx="0"
          cy="5"
          r="2"
          fill={energyColor}
          opacity={isActive || isCharging ? 0.8 : 0.3}
          className="input-pulse"
        />
      </g>
      
      {/* Energy output indicators (bottom) - 2 outputs 35px apart */}
      <g transform="translate(22.5, 70)">
        <path
          d="M0,0 L6,-8 L-6,-8 Z"
          fill={primaryColor}
          stroke={energyColor}
          strokeWidth="1"
        />
        <circle
          cx="0"
          cy="-4"
          r="2"
          fill={energyColor}
          opacity={isActive ? 0.8 : 0.3}
          className={isActive ? 'output-pulse-1' : ''}
        />
      </g>
      <g transform="translate(57.5, 70)">
        <path
          d="M0,0 L6,-8 L-6,-8 Z"
          fill={primaryColor}
          stroke={energyColor}
          strokeWidth="1"
        />
        <circle
          cx="0"
          cy="-4"
          r="2"
          fill={energyColor}
          opacity={isActive ? 0.8 : 0.3}
          className={isActive ? 'output-pulse-2' : ''}
        />
      </g>
      
      <style>{`
        .void-siphon .pulse-glow {
          animation: void-pulse 2s ease-in-out infinite;
        }
        .void-siphon .core-pulse {
          animation: void-core-pulse 1s ease-in-out infinite;
        }
        .void-siphon .swirl-arm {
          animation: swirl-drift 2s linear infinite;
        }
        .void-siphon .swirl-arm-2 {
          animation: swirl-drift 2.5s linear infinite reverse;
        }
        .void-siphon .swirl-arm-3 {
          animation: swirl-drift 3s linear infinite;
        }
        .void-siphon .absorption-ring {
          animation: absorb-in 1.5s ease-out infinite;
        }
        .void-siphon .absorption-ring-2 {
          animation: absorb-in 1.5s ease-out infinite 0.5s;
        }
        .void-siphon .input-pulse {
          animation: void-input 1s ease-in-out infinite;
        }
        .void-siphon .output-pulse-1 {
          animation: void-output 0.8s ease-out infinite;
        }
        .void-siphon .output-pulse-2 {
          animation: void-output 0.8s ease-out infinite 0.3s;
        }
        .void-siphon .particle-orbit {
          animation: orbit-void 3s linear infinite;
          transform-origin: 40px 40px;
        }
        .void-siphon .particle-orbit-2 {
          animation: orbit-void-2 4s linear infinite;
          transform-origin: 40px 40px;
        }
        .void-siphon .particle-orbit-3 {
          animation: orbit-void 2.5s linear infinite reverse;
          transform-origin: 40px 40px;
        }
        .void-siphon .particle-orbit-4 {
          animation: orbit-void-2 3.5s linear infinite reverse;
          transform-origin: 40px 40px;
        }
        
        @keyframes void-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes void-core-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.6; }
        }
        @keyframes swirl-drift {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -60; }
        }
        @keyframes absorb-in {
          0% { r: 32; opacity: 0.6; }
          100% { r: 15; opacity: 0; }
        }
        @keyframes void-input {
          0%, 100% { opacity: 0.3; cy: 5; }
          50% { opacity: 1; cy: 3; }
        }
        @keyframes void-output {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        @keyframes orbit-void {
          0% { transform: rotate(0deg) translateX(15px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(15px) rotate(-360deg); }
        }
        @keyframes orbit-void-2 {
          0% { transform: rotate(45deg) translateX(20px) rotate(-45deg); }
          100% { transform: rotate(405deg) translateX(20px) rotate(-405deg); }
        }
      `}</style>
    </svg>
  );
}

export default VoidSiphonSVG;
