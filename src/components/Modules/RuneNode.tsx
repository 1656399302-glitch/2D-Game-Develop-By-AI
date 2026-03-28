import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface Props {
  isActive: boolean;
  isCharging: boolean;
}

export function RuneNodeSVG({ isActive, isCharging }: Props) {
  const innerRef = useRef<SVGGElement>(null);
  
  useEffect(() => {
    if (!innerRef.current) return;
    
    const ctx = gsap.context(() => {
      if (isActive || isCharging) {
        gsap.to(innerRef.current, {
          rotation: 360,
          transformOrigin: '40px 40px',
          duration: 10,
          ease: 'none',
          repeat: -1,
        });
      } else {
        gsap.killTweensOf(innerRef.current);
      }
    });
    
    return () => ctx.revert();
  }, [isActive, isCharging]);
  
  return (
    <g>
      {/* Outer circle */}
      <circle
        cx="40"
        cy="40"
        r="38"
        fill="#1a1a2e"
        stroke="#9333ea"
        strokeWidth="2"
      />
      
      {/* Middle ring */}
      <circle
        cx="40"
        cy="40"
        r="30"
        fill="#2d1b4e"
        stroke="#a855f7"
        strokeWidth="1"
        opacity="0.8"
      />
      
      {/* Rune pattern - outer */}
      <g 
        ref={innerRef}
        fill="none" 
        stroke="#c084fc" 
        strokeWidth="1.5"
      >
        <path d="M40,8 L50,35 L75,35 L55,50 L62,78 L40,60 L18,78 L25,50 L5,35 L30,35 Z" />
      </g>
      
      {/* Rune pattern - inner */}
      <g
        fill="none"
        stroke="#a855f7"
        strokeWidth="1"
        opacity={isActive ? 1 : 0.5}
      >
        <circle cx="40" cy="40" r="20" />
        <circle cx="40" cy="40" r="12" />
        <line x1="40" y1="20" x2="40" y2="28" />
        <line x1="40" y1="52" x2="40" y2="60" />
        <line x1="20" y1="40" x2="28" y2="40" />
        <line x1="52" y1="40" x2="60" y2="40" />
      </g>
      
      {/* Center glow */}
      <circle
        cx="40"
        cy="40"
        r="10"
        fill="#9333ea"
        opacity={isActive ? 0.8 : 0.4}
      >
        {isActive && (
          <animate
            attributeName="r"
            values="8;12;8"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
        {isActive && (
          <animate
            attributeName="opacity"
            values="0.8;0.4;0.8"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Center core */}
      <circle
        cx="40"
        cy="40"
        r="5"
        fill="#c084fc"
      >
        {isActive && (
          <animate
            attributeName="opacity"
            values="1;0.5;1"
            dur="0.8s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Floating rune particles when active */}
      {isActive && (
        <>
          <circle r="2" fill="#e879f9">
            <animateMotion
              path="M40,5 A35,35 0 1,1 39.9,5"
              dur="4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="2" fill="#a855f7">
            <animateMotion
              path="M40,75 A35,35 0 1,1 39.9,75"
              dur="5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}
      
      {/* Charging pulse */}
      {isCharging && (
        <circle
          cx="40"
          cy="40"
          r="35"
          fill="none"
          stroke="#c084fc"
          strokeWidth="2"
          opacity="0.5"
        >
          <animate
            attributeName="r"
            values="30;42;30"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.5;0;0.5"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
}
