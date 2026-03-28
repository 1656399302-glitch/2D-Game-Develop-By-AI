import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface Props {
  isActive: boolean;
  isCharging: boolean;
}

export function OutputArraySVG({ isActive, isCharging }: Props) {
  const outerRingRef = useRef<SVGGElement>(null);
  const middleRingRef = useRef<SVGGElement>(null);
  
  useEffect(() => {
    if (!outerRingRef.current || !middleRingRef.current) return;
    
    const ctx = gsap.context(() => {
      if (isActive || isCharging) {
        // Outer ring rotates clockwise
        gsap.to(outerRingRef.current, {
          rotation: 360,
          transformOrigin: '40px 40px',
          duration: 8,
          ease: 'none',
          repeat: -1,
        });
        
        // Middle ring rotates counter-clockwise
        gsap.to(middleRingRef.current, {
          rotation: -360,
          transformOrigin: '40px 40px',
          duration: 6,
          ease: 'none',
          repeat: -1,
        });
      } else {
        gsap.killTweensOf([outerRingRef.current, middleRingRef.current]);
      }
    });
    
    return () => ctx.revert();
  }, [isActive, isCharging]);
  
  return (
    <g>
      {/* Outer decorative border */}
      <circle
        cx="40"
        cy="40"
        r="42"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1"
        strokeDasharray="2,4"
        opacity="0.5"
      />
      
      {/* Outer ring with tick marks */}
      <g ref={outerRingRef}>
        <circle
          cx="40"
          cy="40"
          r="38"
          fill="#1a1a2e"
          stroke="#fbbf24"
          strokeWidth="2"
        />
        
        {/* Tick marks on outer ring */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="40"
            y1="2"
            x2="40"
            y2="8"
            stroke="#fbbf24"
            strokeWidth="2"
            transform={`rotate(${angle}, 40, 40)`}
          />
        ))}
      </g>
      
      {/* Middle ring with rune symbols */}
      <g ref={middleRingRef}>
        <circle
          cx="40"
          cy="40"
          r="28"
          fill="#2d2d2d"
          stroke="#f59e0b"
          strokeWidth="1.5"
        />
        
        {/* Rune symbols on middle ring */}
        <g fill="none" stroke="#fbbf24" strokeWidth="1">
          {/* Diamond shapes at cardinal points */}
          <path d="M40,15 L45,22 L40,29 L35,22 Z" />
          <path d="M65,40 L58,45 L51,40 L58,35 Z" />
          <path d="M40,65 L35,58 L40,51 L45,58 Z" />
          <path d="M15,40 L22,35 L29,40 L22,45 Z" />
          
          {/* Diagonal runes */}
          <line x1="52" y1="18" x2="58" y2="24" />
          <line x1="62" y1="52" x2="56" y2="58" />
          <line x1="28" y1="62" x2="22" y2="56" />
          <line x1="18" y1="28" x2="24" y2="22" />
        </g>
      </g>
      
      {/* Inner core with radial gradient */}
      <defs>
        <radialGradient id="output-core-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>
        <filter id="output-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Inner core circle */}
      <circle
        cx="40"
        cy="40"
        r="18"
        fill="url(#output-core-gradient)"
        stroke="#fcd34d"
        strokeWidth="1.5"
        filter={isActive ? 'url(#output-glow)' : undefined}
      />
      
      {/* Energy intake receptor (left side) */}
      <g>
        {/* Receptor base */}
        <ellipse
          cx="8"
          cy="40"
          rx="6"
          ry="12"
          fill="#2d2d2d"
          stroke="#f59e0b"
          strokeWidth="1.5"
        />
        
        {/* Receptor inner glow */}
        <ellipse
          cx="8"
          cy="40"
          rx="3"
          ry="8"
          fill={isActive ? '#fbbf24' : '#92400e'}
          opacity={isActive ? 0.9 : 0.4}
        >
          {isActive && (
            <animate
              attributeName="opacity"
              values="0.9;0.4;0.9"
              dur="0.8s"
              repeatCount="indefinite"
            />
          )}
        </ellipse>
        
        {/* Energy beam connecting receptor to core */}
        {isActive && (
          <line
            x1="14"
            y1="40"
            x2="22"
            y2="40"
            stroke="#f59e0b"
            strokeWidth="2"
            opacity="0.8"
          >
            <animate
              attributeName="opacity"
              values="0.8;0.2;0.8"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </line>
        )}
      </g>
      
      {/* Center beam emitter */}
      <g>
        {/* Emitter triangle pointing right */}
        <path
          d="M58,40 L72,36 L72,44 Z"
          fill={isActive ? '#fef3c7' : '#f59e0b'}
          opacity={isActive ? 1 : 0.6}
        >
          {isActive && (
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="0.6s"
              repeatCount="indefinite"
            />
          )}
        </path>
        
        {/* Energy beam output */}
        {isActive && (
          <line
            x1="72"
            y1="40"
            x2="80"
            y2="40"
            stroke="#fef3c7"
            strokeWidth="2"
            opacity="0.8"
          >
            <animate
              attributeName="opacity"
              values="0.8;0.3;0.8"
              dur="0.4s"
              repeatCount="indefinite"
            />
          </line>
        )}
      </g>
      
      {/* Center bright core */}
      <circle
        cx="40"
        cy="40"
        r="6"
        fill="#fff"
        opacity={isActive ? 1 : 0.6}
      >
        {isActive && (
          <animate
            attributeName="opacity"
            values="1;0.4;1"
            dur="0.5s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Charging pulse effect */}
      {isCharging && (
        <>
          <circle
            cx="40"
            cy="40"
            r="30"
            fill="none"
            stroke="#fcd34d"
            strokeWidth="2"
            opacity="0.6"
          >
            <animate
              attributeName="r"
              values="25;40;25"
              dur="1.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>
          
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1"
            opacity="0.4"
          >
            <animate
              attributeName="r"
              values="30;45;30"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;0;0.4"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}
      
      {/* Decorative energy sparks when active */}
      {isActive && (
        <>
          <circle r="1.5" fill="#fef3c7">
            <animateMotion
              path="M75,40 Q80,30 78,20"
              dur="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="1.5" fill="#fcd34d">
            <animateMotion
              path="M75,40 Q80,50 78,60"
              dur="1.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}
    </g>
  );
}
