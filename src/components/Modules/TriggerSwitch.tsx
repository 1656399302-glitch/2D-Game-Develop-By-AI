import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface Props {
  isActive: boolean;
  isCharging: boolean;
}

export function TriggerSwitchSVG({ isActive, isCharging }: Props) {
  const buttonRef = useRef<SVGCircleElement>(null);
  const leverRef = useRef<SVGRectElement>(null);
  
  useEffect(() => {
    if (!buttonRef.current) return;
    
    const ctx = gsap.context(() => {
      if (isActive || isCharging) {
        gsap.to(buttonRef.current, {
          fill: '#ef4444',
          duration: 0.2,
          yoyo: true,
          repeat: isCharging ? -1 : 3,
        });
      } else {
        gsap.killTweensOf(buttonRef.current);
        gsap.set(buttonRef.current, { fill: '#dc2626' });
      }
    });
    
    return () => ctx.revert();
  }, [isActive, isCharging]);
  
  useEffect(() => {
    if (!leverRef.current) return;
    
    const ctx = gsap.context(() => {
      if (isActive || isCharging) {
        gsap.to(leverRef.current, {
          y: 8,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        gsap.to(leverRef.current, {
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    });
    
    return () => ctx.revert();
  }, [isActive, isCharging]);
  
  return (
    <g>
      {/* Main housing */}
      <rect
        x="5"
        y="5"
        width="70"
        height="90"
        rx="8"
        fill="#1a1a2e"
        stroke="#ef4444"
        strokeWidth="2"
      />
      
      {/* Top section - decorative */}
      <rect
        x="12"
        y="10"
        width="56"
        height="25"
        rx="4"
        fill="#2d2d2d"
        stroke="#f87171"
        strokeWidth="1"
      />
      
      {/* Indicator lights */}
      <g>
        <circle cx="25" cy="22" r="4" fill={isActive ? '#22c55e' : '#374151'}>
          {isActive && (
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="0.5s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <circle cx="40" cy="22" r="4" fill={isCharging ? '#fbbf24' : '#374151'}>
          {isCharging && (
            <animate
              attributeName="opacity"
              values="1;0.3;1"
              dur="0.3s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <circle cx="55" cy="22" r="4" fill={isActive ? '#ef4444' : '#374151'}>
          {isActive && (
            <animate
              attributeName="opacity"
              values="1;0.3;1"
              dur="0.3s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      </g>
      
      {/* Middle section - lever housing */}
      <rect
        x="12"
        y="42"
        width="56"
        height="45"
        rx="4"
        fill="#2d2d2d"
        stroke="#f87171"
        strokeWidth="1"
      />
      
      {/* Lever track */}
      <rect
        x="32"
        y="50"
        width="16"
        height="30"
        rx="8"
        fill="#1a1a2e"
        stroke="#991b1b"
        strokeWidth="1"
      />
      
      {/* Lever */}
      <rect
        ref={leverRef}
        x="28"
        y="55"
        width="24"
        height="20"
        rx="4"
        fill="#dc2626"
        stroke="#ef4444"
        strokeWidth="1"
      />
      
      {/* Trigger button */}
      <circle
        ref={buttonRef}
        cx="40"
        cy="65"
        r="8"
        fill="#dc2626"
        stroke="#ef4444"
        strokeWidth="1.5"
      >
        {isActive && (
          <animate
            attributeName="r"
            values="8;10;8"
            dur="0.5s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Button highlight */}
      <circle
        cx="38"
        cy="63"
        r="2"
        fill="#fca5a5"
        opacity={isActive ? 0.8 : 0.4}
      />
      
      {/* Bottom section - connector */}
      <rect
        x="20"
        y="88"
        width="40"
        height="4"
        rx="2"
        fill="#374151"
        stroke="#4b5563"
        strokeWidth="0.5"
      />
      
      {/* Spark effect when active */}
      {isActive && (
        <g>
          <circle r="2" fill="#fbbf24">
            <animate
              attributeName="cx"
              values="30;35;40;45;50"
              dur="0.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="60;55;60;65;60"
              dur="0.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0;1"
              dur="0.25s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="1.5" fill="#fef3c7">
            <animate
              attributeName="cx"
              values="45;40;35;30;25"
              dur="0.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="65;70;65;60;65"
              dur="0.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="0.2s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}
      
      {/* Charging animation */}
      {isCharging && (
        <>
          <rect
            x="5"
            y="5"
            width="70"
            height="90"
            rx="8"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2"
            opacity="0.5"
          >
            <animate
              attributeName="opacity"
              values="0.5;0;0.5"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </rect>
        </>
      )}
    </g>
  );
}
