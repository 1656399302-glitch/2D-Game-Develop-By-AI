import { useEffect, useRef, useState } from 'react';
import { createEmitter, Particle, getParticleStyle } from '../../utils/ParticleSystem';

interface ParticleEmitterProps {
  /** Emitter configuration */
  config: {
    type: 'spark' | 'dust' | 'glow' | 'ember';
    x: number;
    y: number;
    rate: number;
    maxParticles?: number;
    spread?: number;
    lifetime?: [number, number];
    size?: [number, number];
    color?: string | [string, string];
    velocity?: [number, number];
    gravity?: number;
    friction?: number;
    glowIntensity?: number;
    autoStart?: boolean;
  };
  /** Whether to show the emitter (for debugging) */
  visible?: boolean;
  /** CSS class for container */
  className?: string;
  /** Additional style */
  style?: React.CSSProperties;
}

/**
 * Core particle emitter component
 * Renders particles using CSS transforms for GPU acceleration
 */
export function ParticleEmitter({
  config,
  visible = false,
  className = '',
  style = {},
}: ParticleEmitterProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const emitterRef = useRef<ReturnType<typeof createEmitter> | null>(null);
  
  // Create emitter instance
  useEffect(() => {
    const emitter = createEmitter({
      ...config,
      autoStart: true,
    });
    
    emitterRef.current = emitter;
    emitter.start();
    
    return () => {
      emitter.destroy();
      emitterRef.current = null;
    };
  }, [config.type, config.x, config.y, config.rate]);
  
  // Animation loop
  useEffect(() => {
    const animate = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;
      
      if (emitterRef.current) {
        const activeParticles = emitterRef.current.update(dt);
        setParticles([...activeParticles]);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      className={`particle-emitter ${className}`}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        overflow: 'visible',
        ...style,
      }}
    >
      {/* Debug indicator */}
      {visible && (
        <div
          style={{
            position: 'absolute',
            left: config.x - 5,
            top: config.y - 5,
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: '#ff0000',
          }}
        />
      )}
      
      {/* Render particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={getParticleStyle(particle)}
        />
      ))}
    </div>
  );
}

/**
 * Props for particle burst effect
 */
interface ParticleBurstProps {
  /** Position x */
  x: number;
  /** Position y */
  y: number;
  /** Number of particles */
  count: number;
  /** Particle color */
  color?: string;
  /** Particle size range [min, max] */
  sizeRange?: [number, number];
  /** Burst duration in ms */
  duration?: number;
  /** On complete callback */
  onComplete?: () => void;
  /** CSS class */
  className?: string;
}

/**
 * Particle burst effect - single burst of particles
 */
export function ParticleBurst({
  x,
  y,
  count,
  color = '#ffd700',
  sizeRange = [3, 8],
  duration = 1000,
  onComplete,
  className = '',
}: ParticleBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Initialize particles
  useEffect(() => {
    const newParticles: Particle[] = [];
    const particleIdCounter = Date.now();
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 80 + Math.random() * 120;
      const size = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
      
      newParticles.push({
        id: particleIdCounter + i,
        x,
        y,
        currentX: x,
        currentY: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        color,
        lifetime: duration / 1000,
        age: 0,
        opacity: 1,
        alive: true,
        gravity: 150,
        friction: 0.97,
        glowIntensity: 0.7,
      });
    }
    
    setParticles(newParticles);
    startTimeRef.current = performance.now();
    
    // Animation loop
    const animate = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const dt = 1 / 60; // Fixed timestep
      
      if (elapsed >= duration) {
        setParticles([]);
        onComplete?.();
        return;
      }
      
      setParticles((prev) =>
        prev
          .map((p) => {
            const newP = { ...p };
            newP.age += dt;
            
            // Physics
            const gravity = newP.gravity ?? 0;
            const friction = newP.friction ?? 1;
            
            newP.vy += gravity * dt;
            newP.vx *= Math.pow(friction, 60 * dt);
            newP.vy *= Math.pow(friction, 60 * dt);
            
            newP.x += newP.vx * dt;
            newP.y += newP.vy * dt;
            
            // Smooth interpolation
            newP.currentX += (newP.x - newP.currentX) * 0.3;
            newP.currentY += (newP.y - newP.currentY) * 0.3;
            
            // Fade
            const lifeProgress = newP.age / newP.lifetime;
            if (lifeProgress > 0.6) {
              newP.opacity = 1 - ((lifeProgress - 0.6) / 0.4);
            }
            
            return newP;
          })
          .filter((p) => p.age < p.lifetime)
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [x, y, count, color, sizeRange, duration, onComplete]);
  
  return (
    <div
      className={`particle-burst ${className}`}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={getParticleStyle(particle)}
        />
      ))}
    </div>
  );
}

export default ParticleEmitter;
