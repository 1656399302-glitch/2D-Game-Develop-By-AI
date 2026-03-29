import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

type ActivationPhase = 'idle' | 'charging' | 'active' | 'overload' | 'failure' | 'shutdown';

interface ActivationBurstEmitterProps {
  /** Module position x */
  x: number;
  /** Module position y */
  y: number;
  /** Module size for burst scaling */
  size?: number;
  /** Current activation phase */
  phase: ActivationPhase;
  /** Whether this is the active module being triggered */
  isActive?: boolean;
  /** CSS class */
  className?: string;
}

/**
 * Burst effect emitter for activation sequences
 * Different colors and behaviors for each phase
 */
export function ActivationBurstEmitter({
  x,
  y,
  size = 80,
  phase,
  isActive = false,
  className = '',
}: ActivationBurstEmitterProps) {
  const containerRef = useRef<SVGGElement>(null);
  const burstRef = useRef<SVGCircleElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const particlesRef = useRef<SVGCircleElement[]>([]);
  
  // Get color based on phase
  const getPhaseColor = (): string => {
    switch (phase) {
      case 'charging':
        return '#00d4ff';
      case 'active':
        return '#00ffcc';
      case 'overload':
        return '#ff6b35';
      case 'failure':
        return '#ff3355';
      case 'shutdown':
        return '#9ca3af';
      default:
        return '#a855f7';
    }
  };
  
  const color = getPhaseColor();
  
  // Trigger burst animation on phase change or activation
  useEffect(() => {
    if (!isActive || !burstRef.current) return;
    
    const ctx = gsap.context(() => {
      // Reset
      gsap.set([burstRef.current, ringRef.current], {
        scale: 0,
        opacity: 1,
      });
      gsap.set(particlesRef.current, {
        scale: 0,
        opacity: 1,
      });
      
      // Main burst
      gsap.to(burstRef.current, {
        scale: 2,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
      
      // Expanding ring
      gsap.to(ringRef.current, {
        scale: 3,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.1,
      });
      
      // Particles burst outward
      particlesRef.current.forEach((particle, i) => {
        const angle = (i / particlesRef.current.length) * Math.PI * 2;
        const distance = 30 + Math.random() * 30;
        
        gsap.to(particle, {
          scale: 0,
          opacity: 0,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          duration: 0.5 + Math.random() * 0.3,
          ease: 'power2.out',
          delay: i * 0.02,
        });
      });
    });
    
    return () => ctx.revert();
  }, [phase, isActive]);
  
  const particleCount = 8;
  
  return (
    <g 
      ref={containerRef} 
      className={`activation-burst-emitter ${className}`}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transformOrigin: 'center center',
      }}
    >
      {/* Core burst */}
      <circle
        ref={burstRef}
        cx={0}
        cy={0}
        r={size / 4}
        fill={color}
        opacity={0}
        style={{
          filter: `drop-shadow(0 0 10px ${color})`,
        }}
      />
      
      {/* Expanding ring */}
      <circle
        ref={ringRef}
        cx={0}
        cy={0}
        r={size / 4}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={0}
        style={{
          filter: `drop-shadow(0 0 5px ${color})`,
        }}
      />
      
      {/* Burst particles */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const startX = Math.cos(angle) * (size / 6);
        const startY = Math.sin(angle) * (size / 6);
        
        return (
          <circle
            key={`burst-particle-${i}`}
            ref={(el) => { if (el) particlesRef.current[i] = el; }}
            cx={startX}
            cy={startY}
            r={3}
            fill={color}
            opacity={0}
            style={{
              filter: `drop-shadow(0 0 3px ${color})`,
            }}
          />
        );
      })}
    </g>
  );
}

/**
 * Ambient glow component for idle state
 */
interface AmbientGlowProps {
  x: number;
  y: number;
  size?: number;
  intensity?: number;
  color?: string;
  animate?: boolean;
  className?: string;
}

export function AmbientGlow({
  x,
  y,
  size = 100,
  intensity = 0.3,
  color = '#00d4ff',
  animate = true,
  className = '',
}: AmbientGlowProps) {
  const glowRef = useRef<SVGCircleElement>(null);
  
  useEffect(() => {
    if (!animate || !glowRef.current) return;
    
    const ctx = gsap.context(() => {
      gsap.to(glowRef.current, {
        opacity: intensity * 0.5,
        scale: 1.1,
        duration: 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    });
    
    return () => ctx.revert();
  }, [animate, intensity]);
  
  return (
    <circle
      ref={glowRef}
      cx={x}
      cy={y}
      r={size / 2}
      fill={color}
      opacity={intensity}
      style={{
        filter: `blur(${size / 4}px)`,
        transformOrigin: 'center center',
      }}
      className={className}
    />
  );
}

/**
 * Smoke effect for failure mode
 */
interface SmokeEffectProps {
  x: number;
  y: number;
  active?: boolean;
  className?: string;
}

export function SmokeEffect({
  x,
  y,
  active = false,
  className = '',
}: SmokeEffectProps) {
  const smokeRefs = useRef<(SVGCircleElement | null)[]>([]);
  
  useEffect(() => {
    if (!active) {
      smokeRefs.current.forEach((ref) => {
        if (ref) {
          gsap.killTweensOf(ref);
          gsap.set(ref, { opacity: 0, y: 0 });
        }
      });
      return;
    }
    
    const ctx = gsap.context(() => {
      smokeRefs.current.forEach((ref, i) => {
        if (!ref) return;
        
        gsap.set(ref, { opacity: 0, y: 0, scale: 0.5 });
        
        gsap.to(ref, {
          opacity: 0.6,
          y: -40 - i * 10,
          scale: 1.5 + i * 0.2,
          duration: 1.5,
          ease: 'power1.out',
          repeat: -1,
          delay: i * 0.3,
        });
      });
    });
    
    return () => ctx.revert();
  }, [active]);
  
  const smokeCount = 4;
  
  return (
    <g 
      className={`smoke-effect ${className}`}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {Array.from({ length: smokeCount }).map((_, i) => (
        <circle
          key={`smoke-${i}`}
          ref={(el) => { smokeRefs.current[i] = el; }}
          cx={(i - smokeCount / 2) * 10}
          cy={0}
          r={8 + i * 2}
          fill="#4a5568"
          opacity={0}
          style={{
            filter: 'blur(4px)',
          }}
        />
      ))}
    </g>
  );
}

export default ActivationBurstEmitter;
