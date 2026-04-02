import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { FactionId } from '../../types/factions';
import { getFactionGlowRGB } from '../../utils/activation/effects';

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
  /** Dominant faction for color variation */
  dominantFaction?: FactionId;
  /** Power output for particle intensity (0-100) */
  powerOutput?: number;
  /** CSS class */
  className?: string;
}

/**
 * Burst effect emitter for activation sequences
 * Different colors and behaviors for each phase
 * Enhanced with faction colors and overload-specific patterns
 */
export function ActivationBurstEmitter({
  x,
  y,
  size = 80,
  phase,
  isActive = false,
  dominantFaction,
  powerOutput = 50,
  className = '',
}: ActivationBurstEmitterProps) {
  const containerRef = useRef<SVGGElement>(null);
  const burstRef = useRef<SVGCircleElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const particlesRef = useRef<SVGCircleElement[]>([]);
  const secondaryRingRef = useRef<SVGCircleElement>(null);
  
  // Calculate faction-based colors
  const factionRGB = useMemo(() => getFactionGlowRGB(dominantFaction), [dominantFaction]);
  
  // Calculate particle count based on power output and phase
  const particleCount = useMemo(() => {
    let baseCount = 8;
    
    // High power increases particle count
    if (powerOutput > 80) {
      baseCount = 12;
    } else if (powerOutput > 60) {
      baseCount = 10;
    }
    
    // Overload/failure increases particle count significantly
    if (phase === 'overload') {
      baseCount = Math.round(baseCount * 1.5);
    } else if (phase === 'failure') {
      baseCount = baseCount * 2;
    }
    
    return baseCount;
  }, [phase, powerOutput]);
  
  // Get color based on phase and faction
  const getPhaseColor = (): string => {
    switch (phase) {
      case 'charging':
        return dominantFaction 
          ? `rgb(${factionRGB.r}, ${factionRGB.g}, ${factionRGB.b})` 
          : '#00d4ff';
      case 'active':
        return dominantFaction 
          ? `rgba(${factionRGB.r}, ${factionRGB.g}, ${factionRGB.b}, 0.9)` 
          : '#00ffcc';
      case 'overload':
        return '#ff6b35'; // Orange-red for overload
      case 'failure':
        return '#ff3355'; // Red for failure
      case 'shutdown':
        return '#9ca3af'; // Gray for shutdown
      default:
        return dominantFaction 
          ? `rgb(${factionRGB.r}, ${factionRGB.g}, ${factionRGB.b})` 
          : '#a855f7';
    }
  };
  
  // Get secondary color for glow layers
  const getSecondaryColor = (): string => {
    switch (phase) {
      case 'overload':
        return '#ffd700'; // Gold sparks
      case 'failure':
        return '#ff6b35'; // Orange sparks
      default:
        return dominantFaction 
          ? `rgba(${factionRGB.r}, ${factionRGB.g}, ${factionRGB.b}, 0.6)` 
          : '#a855f7';
    }
  };
  
  const color = getPhaseColor();
  const secondaryColor = getSecondaryColor();
  
  // Trigger burst animation on phase change or activation
  useEffect(() => {
    if (!isActive || !burstRef.current) return;
    
    const ctx = gsap.context(() => {
      // Reset
      gsap.set([burstRef.current, ringRef.current, secondaryRingRef.current], {
        scale: 0,
        opacity: 1,
      });
      gsap.set(particlesRef.current, {
        scale: 0,
        opacity: 1,
        x: 0,
        y: 0,
      });
      
      // Duration based on phase intensity
      const burstDuration = phase === 'overload' || phase === 'failure' ? 0.3 : 0.4;
      const ringDuration = phase === 'overload' || phase === 'failure' ? 0.4 : 0.6;
      
      // Main burst with faction-colored glow
      gsap.to(burstRef.current, {
        scale: 2.5 * (powerOutput / 50), // Scale with power
        opacity: 0,
        duration: burstDuration,
        ease: 'power2.out',
      });
      
      // Expanding ring with faction color
      gsap.to(ringRef.current, {
        scale: 3,
        opacity: 0,
        duration: ringDuration,
        ease: 'power2.out',
        delay: 0.05,
      });
      
      // Secondary ring for overload/failure
      if (phase === 'overload' || phase === 'failure') {
        gsap.to(secondaryRingRef.current, {
          scale: 4,
          opacity: 0,
          duration: ringDuration * 1.2,
          ease: 'power2.out',
          delay: 0.1,
        });
      }
      
      // Enhanced particles with faction colors
      particlesRef.current.forEach((particle, i) => {
        const angle = (i / particlesRef.current.length) * Math.PI * 2;
        // More dramatic spread for overload/failure
        const maxDistance = phase === 'overload' || phase === 'failure' 
          ? 50 + Math.random() * 30 
          : 30 + Math.random() * 20;
        
        // Alternate between primary and secondary color
        const particleColor = i % 2 === 0 ? color : secondaryColor;
        
        gsap.to(particle, {
          scale: 0,
          opacity: 0,
          x: Math.cos(angle) * maxDistance,
          y: Math.sin(angle) * maxDistance,
          duration: 0.4 + Math.random() * 0.3,
          ease: 'power2.out',
          delay: i * 0.015, // Faster for more particles
        });
        
        // Update particle fill color inline to avoid unused variable warning
        if (particle) {
          particle.setAttribute('fill', particleColor);
        }
      });
    });
    
    return () => ctx.revert();
  }, [phase, isActive, color, secondaryColor, powerOutput]);
  
  return (
    <g 
      ref={containerRef} 
      className={`activation-burst-emitter ${className}`}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transformOrigin: 'center center',
      }}
    >
      {/* Core burst with faction-colored glow */}
      <circle
        ref={burstRef}
        cx={0}
        cy={0}
        r={size / 4}
        fill={color}
        opacity={0}
        style={{
          filter: `drop-shadow(0 0 ${10 * (powerOutput / 50)}px ${color})`,
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
        strokeWidth={phase === 'overload' || phase === 'failure' ? 3 : 2}
        opacity={0}
        style={{
          filter: `drop-shadow(0 0 5px ${color})`,
        }}
      />
      
      {/* Secondary ring for overload/failure */}
      <circle
        ref={secondaryRingRef}
        cx={0}
        cy={0}
        r={size / 3}
        fill="none"
        stroke={secondaryColor}
        strokeWidth={2}
        opacity={0}
        style={{
          filter: `drop-shadow(0 0 8px ${secondaryColor})`,
        }}
      />
      
      {/* Burst particles - count based on power and phase */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const startX = Math.cos(angle) * (size / 6);
        const startY = Math.sin(angle) * (size / 6);
        const particleColor = i % 2 === 0 ? color : secondaryColor;
        
        return (
          <circle
            key={`burst-particle-${i}`}
            ref={(el) => { if (el) particlesRef.current[i] = el; }}
            cx={startX}
            cy={startY}
            r={phase === 'overload' || phase === 'failure' ? 4 : 3}
            fill={particleColor}
            opacity={0}
            style={{
              filter: `drop-shadow(0 0 3px ${particleColor})`,
            }}
          />
        );
      })}
    </g>
  );
}

/**
 * Ambient glow component for idle state with faction color support
 */
interface AmbientGlowProps {
  x: number;
  y: number;
  size?: number;
  intensity?: number;
  color?: string;
  dominantFaction?: FactionId;
  animate?: boolean;
  className?: string;
}

export function AmbientGlow({
  x,
  y,
  size = 100,
  intensity = 0.3,
  color,
  dominantFaction,
  animate = true,
  className = '',
}: AmbientGlowProps) {
  const glowRef = useRef<SVGCircleElement>(null);
  
  // Use faction color if available
  const glowColor = color || (dominantFaction 
    ? `rgb(${getFactionGlowRGB(dominantFaction).r}, ${getFactionGlowRGB(dominantFaction).g}, ${getFactionGlowRGB(dominantFaction).b})`
    : '#00d4ff');
  
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
      fill={glowColor}
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
 * Smoke effect for failure mode with enhanced visual
 */
interface SmokeEffectProps {
  x: number;
  y: number;
  active?: boolean;
  intensity?: number;
  className?: string;
}

export function SmokeEffect({
  x,
  y,
  active = false,
  intensity = 1,
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
          opacity: 0.6 * intensity,
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
  }, [active, intensity]);
  
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

/**
 * Energy pulse effect for activation sequences with faction support
 */
interface EnergyPulseProps {
  x: number;
  y: number;
  size?: number;
  color?: string;
  dominantFaction?: FactionId;
  active?: boolean;
  speed?: number;
  className?: string;
}

export function EnergyPulse({
  x,
  y,
  size = 60,
  color,
  dominantFaction,
  active = false,
  speed = 1,
  className = '',
}: EnergyPulseProps) {
  const pulseRef = useRef<SVGCircleElement>(null);
  
  // Use faction color if available
  const pulseColor = color || (dominantFaction 
    ? `rgb(${getFactionGlowRGB(dominantFaction).r}, ${getFactionGlowRGB(dominantFaction).g}, ${getFactionGlowRGB(dominantFaction).b})`
    : '#00d4ff');
  
  useEffect(() => {
    if (!active || !pulseRef.current) {
      if (pulseRef.current) {
        gsap.killTweensOf(pulseRef.current);
        gsap.set(pulseRef.current, { scale: 0, opacity: 0 });
      }
      return;
    }
    
    const ctx = gsap.context(() => {
      gsap.set(pulseRef.current, { scale: 0.5, opacity: 1 });
      
      gsap.to(pulseRef.current, {
        scale: 2,
        opacity: 0,
        duration: 1 / speed,
        ease: 'power2.out',
        repeat: -1,
      });
    });
    
    return () => ctx.revert();
  }, [active, speed]);
  
  return (
    <circle
      ref={pulseRef}
      cx={x}
      cy={y}
      r={size / 2}
      fill="none"
      stroke={pulseColor}
      strokeWidth={2}
      opacity={0}
      style={{
        filter: `drop-shadow(0 0 8px ${pulseColor})`,
      }}
      className={className}
    />
  );
}

export default ActivationBurstEmitter;
