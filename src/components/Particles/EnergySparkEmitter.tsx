import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';

interface EnergySparkEmitterProps {
  /** SVG path data */
  pathData: string;
  /** Number of particles (1-20) */
  particleCount?: number;
  /** Particle speed (0.5-5) */
  speed?: number;
  /** Glow intensity (0-1) */
  glowIntensity?: number;
  /** Whether active */
  active?: boolean;
  /** Particle color */
  color?: string;
  /** CSS class */
  className?: string;
}

/**
 * Energy spark emitter - particles that travel along energy paths
 * Particles respect path direction (input→output)
 */
export function EnergySparkEmitter({
  pathData,
  particleCount = 3,
  speed = 1,
  glowIntensity = 0.8,
  active = false,
  color = '#00d4ff',
  className = '',
}: EnergySparkEmitterProps) {
  const containerRef = useRef<SVGGElement>(null);
  const particleRefs = useRef<(SVGCircleElement | null)[]>([]);
  
  // Get start point for wave positioning
  const startPoint = useMemo(() => {
    try {
      const match = pathData.match(/M\s*([\d.-]+)\s*([\d.-]+)/);
      if (match) {
        return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
      }
    } catch {
      // Fallback
    }
    return { x: 0, y: 0 };
  }, [pathData]);
  
  // Create particle animations
  useEffect(() => {
    if (!active) {
      // Stop all animations
      particleRefs.current.forEach((ref) => {
        if (ref) {
          gsap.killTweensOf(ref);
          gsap.set(ref, { opacity: 0 });
        }
      });
      return;
    }
    
    const ctx = gsap.context(() => {
      particleRefs.current.forEach((ref, index) => {
        if (!ref) return;
        
        // Set initial position at path start
        gsap.set(ref, {
          opacity: 1,
        });
        
        // Calculate duration based on speed and path length
        // Speed 1 = 2 seconds for full path
        const duration = 2 / speed;
        const stagger = duration / particleCount;
        
        // Animate along path using offset-path if available, otherwise use manual approach
        if ('offsetPath' in ref.style) {
          gsap.to(ref, {
            offsetDistance: '100%',
            duration,
            ease: 'none',
            repeat: -1,
            delay: index * stagger,
          });
          
          // Glow pulse
          gsap.to(ref, {
            attr: { r: 6 },
            duration: 0.3,
            yoyo: true,
            repeat: -1,
            ease: 'power1.inOut',
          });
        } else {
          // Fallback: Use scale/opacity animation
          gsap.to(ref, {
            opacity: 0.3,
            duration: duration / 2,
            ease: 'power1.in',
            repeat: -1,
            delay: index * stagger,
          });
          
          gsap.to(ref, {
            scale: 1.5,
            duration: duration / 2,
            ease: 'power1.out',
            repeat: -1,
            yoyo: true,
            delay: index * stagger,
          });
        }
      });
    });
    
    return () => ctx.revert();
  }, [active, particleCount, speed]);
  
  const clampedParticleCount = Math.max(1, Math.min(20, particleCount));
  const clampedGlow = Math.max(0, Math.min(1, glowIntensity));
  
  return (
    <g ref={containerRef} className={`energy-spark-emitter ${className}`}>
      {/* Path reference (invisible) */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth="0"
      />
      
      {/* Energy particles */}
      {Array.from({ length: clampedParticleCount }).map((_, index) => {
        return (
          <circle
            key={`spark-${index}`}
            ref={(el) => { particleRefs.current[index] = el; }}
            cx={startPoint.x}
            cy={startPoint.y}
            r={4}
            fill={color}
            opacity={active ? 1 : 0}
            style={{
              filter: clampedGlow > 0 
                ? `drop-shadow(0 0 ${4 * clampedGlow}px ${color})`
                : undefined,
            }}
          />
        );
      })}
    </g>
  );
}

/**
 * Energy level to particle count mapping
 */
export function getParticleCountForEnergyLevel(energyLevel: number): number {
  // Scale 1-10 energy level to 1-20 particles
  return Math.max(1, Math.min(20, Math.floor((energyLevel / 10) * 20)));
}

/**
 * Get particle speed based on energy level
 */
export function getSpeedForEnergyLevel(energyLevel: number): number {
  // Higher energy = faster particles
  return 0.5 + (energyLevel / 10) * 4.5;
}

export default EnergySparkEmitter;
