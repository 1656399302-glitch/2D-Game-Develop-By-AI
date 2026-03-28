import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Connection } from '../../types';

interface EnergyPathProps {
  connection: Connection;
  isSelected: boolean;
  isActive: boolean;
  onClick: () => void;
}

export function EnergyPath({ connection, isSelected, isActive, onClick }: EnergyPathProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const particleRef = useRef<SVGCircleElement>(null);
  const secondaryGlowRef = useRef<SVGPathElement>(null);
  
  useEffect(() => {
    if (!particleRef.current || !pathRef.current || !isActive) {
      if (particleRef.current) {
        gsap.killTweensOf(particleRef.current);
        gsap.set(particleRef.current, { opacity: 0 });
      }
      if (glowRef.current) {
        gsap.killTweensOf(glowRef.current);
        gsap.set(glowRef.current, { opacity: 0.2 });
      }
      if (secondaryGlowRef.current) {
        gsap.killTweensOf(secondaryGlowRef.current);
        gsap.set(secondaryGlowRef.current, { opacity: 0.1 });
      }
      return;
    }
    
    const ctx = gsap.context(() => {
      // Animate particle along path
      gsap.set(particleRef.current, {
        attr: { r: 4 },
      });
      
      // Enhanced pulse animation with 0.8s duration (updated from 1s)
      gsap.to(particleRef.current, {
        attr: { r: 6 },
        duration: 0.4, // Half of 0.8s for yoyo
        yoyo: true,
        repeat: -1,
        ease: 'power1.inOut',
      });
      
      // Use motionPath plugin if available
      gsap.set(particleRef.current, { opacity: 1 });
      
      // Opacity pulse with 0.8s duration
      gsap.to(particleRef.current, {
        opacity: 0.5,
        duration: 0.4, // Half of 0.8s for yoyo
        yoyo: true,
        repeat: -1,
        ease: 'power1.inOut',
      });
      
      // Primary glow pulse with 0.8s duration and stdDeviation=4
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.6,
          duration: 0.4, // Half of 0.8s for yoyo
          yoyo: true,
          repeat: -1,
          ease: 'power1.inOut',
        });
      }
      
      // Secondary glow layer at 50% opacity for depth
      if (secondaryGlowRef.current) {
        gsap.to(secondaryGlowRef.current, {
          opacity: 0.25,
          duration: 0.5,
          yoyo: true,
          repeat: -1,
          ease: 'power1.inOut',
        });
      }
    });
    
    return () => ctx.revert();
  }, [isActive]);
  
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Secondary glow layer at 50% opacity for depth */}
      <path
        ref={secondaryGlowRef}
        d={connection.pathData}
        fill="none"
        stroke="#00ffcc"
        strokeWidth="12"
        opacity="0.1"
        strokeLinecap="round"
      />
      
      {/* Primary glow effect layer - enhanced stdDeviation=4 during active state */}
      <path
        ref={glowRef}
        d={connection.pathData}
        fill="none"
        stroke="#00ffcc"
        strokeWidth="8"
        opacity="0.2"
        strokeLinecap="round"
      />
      
      {/* Main path */}
      <path
        ref={pathRef}
        d={connection.pathData}
        fill="none"
        stroke={isSelected ? '#ffd700' : '#00d4ff'}
        strokeWidth={isSelected ? 4 : 3}
        strokeLinecap="round"
        className="transition-all duration-200"
      />
      
      {/* Animated dash layer */}
      <path
        d={connection.pathData}
        fill="none"
        stroke={isSelected ? '#ffd700' : '#00ffcc'}
        strokeWidth="2"
        strokeDasharray="8,12"
        strokeLinecap="round"
        className={isActive ? 'energy-flow' : ''}
        style={{
          opacity: isActive ? 1 : 0.5,
        }}
      />
      
      {/* Selection indicator */}
      {isSelected && (
        <path
          d={connection.pathData}
          fill="none"
          stroke="#ffd700"
          strokeWidth="6"
          opacity="0.3"
          strokeLinecap="round"
          strokeDasharray="4,8"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="24"
            to="0"
            dur="0.5s"
            repeatCount="indefinite"
          />
        </path>
      )}
      
      {/* Energy particle */}
      <circle
        ref={particleRef}
        r="4"
        fill="#00ffcc"
        opacity="0"
      >
        {isActive && (
          <animate
            attributeName="fill"
            values="#00ffcc;#00d4ff;#00ffcc"
            dur="0.8s"
            repeatCount="indefinite"
          />
        )}
      </circle>
    </g>
  );
}
