/**
 * Failure Particle Emitter
 * 
 * Particle system for glitch artifacts and failure mode effects.
 * Implements:
 * - Random glitch noise particles
 * - Screen tear effects
 * - Intermittent current path visualization
 * 
 * Round 109: Enhanced Failure State Effects
 */

import { useEffect, useRef, useMemo, useState } from 'react';
import { gsap } from 'gsap';

interface GlitchParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  color: string;
  lifetime: number;
  type: 'noise' | 'spark' | 'debris';
}

interface FailureParticleEmitterProps {
  /** Whether to show the particle emitter */
  active?: boolean;
  /** Container width */
  width?: number;
  /** Container height */
  height?: number;
  /** Glitch intensity (0-1) */
  intensity?: number;
  /** Failure type: 'failure' or 'overload' */
  type?: 'failure' | 'overload';
  /** CSS class */
  className?: string;
}

/**
 * Generate random glitch particles
 */
function generateGlitchParticle(
  id: number,
  width: number,
  height: number,
  intensity: number,
  type: 'failure' | 'overload'
): GlitchParticle {
  const particleTypes: Array<'noise' | 'spark' | 'debris'> = ['noise', 'spark', 'debris'];
  const weights = type === 'failure' 
    ? [0.6, 0.25, 0.15]  // More noise in failure mode
    : [0.4, 0.4, 0.2];   // More sparks in overload
  
  const rand = Math.random();
  let particleType: 'noise' | 'spark' | 'debris' = 'noise';
  let cumulative = 0;
  for (let i = 0; i < particleTypes.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) {
      particleType = particleTypes[i];
      break;
    }
  }
  
  const colors = type === 'failure'
    ? ['#ff3355', '#ff6b35', '#ff0044', '#ff4444', '#ff3366']
    : ['#ff6b35', '#ffd700', '#ff8c00', '#ffaa00', '#ffcc00'];
  
  const baseSize = particleType === 'noise' ? 2 + Math.random() * 4
    : particleType === 'spark' ? 3 + Math.random() * 3
    : 1 + Math.random() * 2;
  
  const lifetime = particleType === 'noise' ? 100 + Math.random() * 200
    : particleType === 'spark' ? 50 + Math.random() * 100
    : 200 + Math.random() * 300;
  
  return {
    id,
    x: Math.random() * width,
    y: Math.random() * height,
    size: baseSize * (0.5 + intensity * 0.5),
    opacity: 0.6 + Math.random() * 0.4,
    velocityX: (Math.random() - 0.5) * 10 * intensity,
    velocityY: (Math.random() - 0.5) * 10 * intensity,
    rotation: Math.random() * 360,
    color: colors[Math.floor(Math.random() * colors.length)],
    lifetime,
    type: particleType,
  };
}

/**
 * Glitch noise particle - random static noise artifact
 */
interface GlitchNoiseProps {
  particle: GlitchParticle;
  onUpdate: (id: number, update: Partial<GlitchParticle>) => void;
  onComplete: (id: number) => void;
}

function GlitchNoise({ particle, onUpdate, onComplete }: GlitchNoiseProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(Date.now());
  
  useEffect(() => {
    let animationFrame: number;
    
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      
      if (elapsed >= particle.lifetime) {
        onComplete(particle.id);
        return;
      }
      
      // Update position with jitter
      const jitterX = (Math.random() - 0.5) * 4;
      const jitterY = (Math.random() - 0.5) * 4;
      
      onUpdate(particle.id, {
        x: particle.x + particle.velocityX + jitterX,
        y: particle.y + particle.velocityY + jitterY,
        opacity: particle.opacity * (1 - elapsed / particle.lifetime),
        size: particle.size * (0.8 + Math.random() * 0.4),
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [particle, onUpdate, onComplete]);
  
  return (
    <div
      ref={elementRef}
      className="glitch-noise-particle"
      style={{
        position: 'absolute',
        left: particle.x,
        top: particle.y,
        width: particle.size,
        height: particle.size,
        backgroundColor: particle.color,
        opacity: particle.opacity,
        borderRadius: '2px',
        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
        pointerEvents: 'none',
        transform: `rotate(${particle.rotation}deg)`,
        filter: 'blur(0.5px)',
      }}
    />
  );
}

/**
 * Spark particle - bright spark artifact
 */
interface SparkParticleProps {
  particle: GlitchParticle;
  onUpdate: (id: number, update: Partial<GlitchParticle>) => void;
  onComplete: (id: number) => void;
}

function SparkParticle({ particle, onUpdate, onComplete }: SparkParticleProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef(Date.now());
  
  useEffect(() => {
    let animationFrame: number;
    
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      
      if (elapsed >= particle.lifetime) {
        onComplete(particle.id);
        return;
      }
      
      // Update position with linear decay
      const progress = elapsed / particle.lifetime;
      
      onUpdate(particle.id, {
        x: particle.x + particle.velocityX * (1 - progress),
        y: particle.y + particle.velocityY * (1 - progress),
        opacity: particle.opacity * (1 - progress),
        size: particle.size * (1 - progress * 0.5),
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [particle, onUpdate, onComplete]);
  
  return (
    <div
      ref={elementRef}
      className="spark-particle"
      style={{
        position: 'absolute',
        left: particle.x,
        top: particle.y,
        width: particle.size,
        height: particle.size * 2,
        backgroundColor: particle.color,
        opacity: particle.opacity,
        borderRadius: '50%',
        boxShadow: `0 0 ${particle.size * 4}px ${particle.color}, 0 0 ${particle.size * 2}px white`,
        pointerEvents: 'none',
        transform: `rotate(${45 + particle.rotation}deg)`,
      }}
    />
  );
}

/**
 * Screen tear effect layer
 */
interface ScreenTearProps {
  active: boolean;
  width: number;
  height: number;
  intensity: number;
  type: 'failure' | 'overload';
}

function ScreenTear({ active, width, height, intensity, type }: ScreenTearProps) {
  const [tears, setTears] = useState<Array<{
    id: number;
    y: number;
    height: number;
    offset: number;
    color: string;
  }>>([]);
  
  const tearIdRef = useRef(0);
  
  useEffect(() => {
    if (!active) {
      setTears([]);
      return;
    }
    
    // Generate periodic screen tears
    const tearInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance per interval
        const newTear = {
          id: tearIdRef.current++,
          y: Math.random() * height,
          height: 5 + Math.random() * 15,
          offset: (Math.random() - 0.5) * 30 * intensity,
          color: type === 'failure' ? 'rgba(255, 51, 85, 0.3)' : 'rgba(255, 107, 53, 0.3)',
        };
        
        setTears((prev) => [...prev, newTear]);
        
        // Remove tear after animation
        setTimeout(() => {
          setTears((prev) => prev.filter((t) => t.id !== newTear.id));
        }, 200 + Math.random() * 100);
      }
    }, 100);
    
    return () => clearInterval(tearInterval);
  }, [active, height, intensity, type]);
  
  if (!active || tears.length === 0) return null;
  
  return (
    <>
      {tears.map((tear) => (
        <div
          key={tear.id}
          className="screen-tear"
          style={{
            position: 'absolute',
            top: tear.y,
            left: tear.offset,
            width: width,
            height: tear.height,
            backgroundColor: tear.color,
            pointerEvents: 'none',
            opacity: 0.8,
          }}
        />
      ))}
    </>
  );
}

/**
 * Scan line effect layer
 */
interface ScanLinesProps {
  active: boolean;
  intensity: number;
}

function ScanLines({ active, intensity }: ScanLinesProps) {
  if (!active) return null;
  
  return (
    <div
      className="scan-lines"
      style={{
        position: 'absolute',
        inset: 0,
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 0, 0, ${0.1 * intensity}) 2px,
          rgba(0, 0, 0, ${0.1 * intensity}) 4px
        )`,
        pointerEvents: 'none',
        opacity: 0.5,
      }}
    />
  );
}

/**
 * RGB shift effect layer
 */
interface RGBShiftProps {
  active: boolean;
  intensity: number;
}

function RGBShift({ active, intensity }: RGBShiftProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!active || !containerRef.current) return;
    
    const ctx = gsap.context(() => {
      gsap.to(containerRef.current, {
        '--rgb-r': `${(Math.random() - 0.5) * 5 * intensity}`,
        '--rgb-g': '0',
        '--rgb-b': `${(Math.random() - 0.5) * 5 * intensity}`,
        duration: 0.05,
        repeat: -1,
        yoyo: true,
        ease: 'none',
      });
    });
    
    return () => ctx.revert();
  }, [active, intensity]);
  
  if (!active) return null;
  
  return (
    <div
      ref={containerRef}
      className="rgb-shift"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        opacity: 0.1 * intensity,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'red',
          transform: 'translateX(var(--rgb-r, 0))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'cyan',
          transform: 'translateX(var(--rgb-b, 0))',
        }}
      />
    </div>
  );
}

/**
 * Main FailureParticleEmitter component
 */
export function FailureParticleEmitter({
  active = false,
  width = 800,
  height = 600,
  intensity = 0.5,
  type = 'failure',
  className = '',
}: FailureParticleEmitterProps) {
  const [particles, setParticles] = useState<GlitchParticle[]>([]);
  const particleIdRef = useRef(0);
  const spawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Calculate spawn rate based on intensity
  const spawnRate = useMemo(() => {
    // Higher intensity = more particles
    return Math.max(50, 200 - intensity * 150);
  }, [intensity]);
  
  // Update particle position
  const updateParticle = (id: number, update: Partial<GlitchParticle>) => {
    setParticles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...update } : p))
    );
  };
  
  // Remove completed particle
  const removeParticle = (id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };
  
  // Spawn new particles
  const spawnParticle = () => {
    if (particles.length >= 30) return; // Cap particle count
    
    const newParticle = generateGlitchParticle(
      particleIdRef.current++,
      width,
      height,
      intensity,
      type
    );
    
    setParticles((prev) => [...prev, newParticle]);
  };
  
  // Handle particle spawning
  useEffect(() => {
    if (active) {
      // Spawn initial batch
      for (let i = 0; i < 5; i++) {
        spawnParticle();
      }
      
      // Continuous spawning
      spawnIntervalRef.current = setInterval(spawnParticle, spawnRate);
    } else {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
        spawnIntervalRef.current = null;
      }
      
      // Clear particles with fade out
      setParticles([]);
    }
    
    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [active, spawnRate]);
  
  // Cleanup particles periodically
  useEffect(() => {
    if (!active) return;
    
    const cleanupInterval = setInterval(() => {
      setParticles((prev) => prev.filter((p) => p.lifetime > 0));
    }, 500);
    
    return () => clearInterval(cleanupInterval);
  }, [active]);
  
  return (
    <div
      className={`failure-particle-emitter ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Screen tear effects */}
      <ScreenTear
        active={active}
        width={width}
        height={height}
        intensity={intensity}
        type={type}
      />
      
      {/* Scan lines */}
      <ScanLines active={active} intensity={intensity} />
      
      {/* RGB shift */}
      <RGBShift active={active && intensity > 0.5} intensity={intensity} />
      
      {/* Particles */}
      {particles.map((particle) => {
        if (particle.type === 'noise') {
          return (
            <GlitchNoise
              key={particle.id}
              particle={particle}
              onUpdate={updateParticle}
              onComplete={removeParticle}
            />
          );
        } else {
          return (
            <SparkParticle
              key={particle.id}
              particle={particle}
              onUpdate={updateParticle}
              onComplete={removeParticle}
            />
          );
        }
      })}
    </div>
  );
}

export default FailureParticleEmitter;
