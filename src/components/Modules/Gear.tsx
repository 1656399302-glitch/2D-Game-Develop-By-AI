import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface Props {
  isActive: boolean;
  isCharging: boolean;
}

export function GearSVG({ isActive, isCharging }: Props) {
  const groupRef = useRef<SVGGElement>(null);
  
  useEffect(() => {
    if (!groupRef.current) return;
    
    const ctx = gsap.context(() => {
      if (isActive || isCharging) {
        gsap.to(groupRef.current, {
          rotation: 360,
          transformOrigin: '40px 40px',
          duration: 4,
          ease: 'none',
          repeat: -1,
        });
      } else {
        gsap.killTweensOf(groupRef.current);
      }
    });
    
    return () => ctx.revert();
  }, [isActive, isCharging]);
  
  return (
    <g ref={groupRef}>
      {/* Outer gear ring */}
      <circle
        cx="40"
        cy="40"
        r="35"
        fill="#1a1a2e"
        stroke="#f59e0b"
        strokeWidth="2"
      />
      
      {/* Gear teeth */}
      <g fill="#1a1a2e" stroke="#f59e0b" strokeWidth="1.5">
        <rect x="36" y="0" width="8" height="12" rx="1" />
        <rect x="36" y="68" width="8" height="12" rx="1" />
        <rect x="0" y="36" width="12" height="8" rx="1" />
        <rect x="68" y="36" width="12" height="8" rx="1" />
        <rect x="9" y="9" width="8" height="10" rx="1" transform="rotate(45, 13, 14)" />
        <rect x="63" y="9" width="8" height="10" rx="1" transform="rotate(-45, 67, 14)" />
        <rect x="9" y="61" width="8" height="10" rx="1" transform="rotate(-45, 13, 66)" />
        <rect x="63" y="61" width="8" height="10" rx="1" transform="rotate(45, 67, 66)" />
      </g>
      
      {/* Inner ring */}
      <circle
        cx="40"
        cy="40"
        r="25"
        fill="#2d2d2d"
        stroke="#fbbf24"
        strokeWidth="1.5"
      />
      
      {/* Decorative inner details */}
      <circle
        cx="40"
        cy="40"
        r="18"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="0.5"
        strokeDasharray="4,2"
        opacity={isActive ? 1 : 0.3}
      >
        {isActive && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 40 40"
            to="-360 40 40"
            dur="3s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Center hub */}
      <circle
        cx="40"
        cy="40"
        r="10"
        fill="#1a1a2e"
        stroke="#fbbf24"
        strokeWidth="1.5"
      />
      
      {/* Center bolt */}
      <circle
        cx="40"
        cy="40"
        r="5"
        fill="#f59e0b"
      >
        {isActive && (
          <animate
            attributeName="opacity"
            values="1;0.6;1"
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Glow effect when active */}
      {isActive && (
        <circle
          cx="40"
          cy="40"
          r="30"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2"
          opacity="0.3"
        >
          <animate
            attributeName="r"
            values="25;35;25"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0;0.3"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
}
