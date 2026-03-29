import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AmbientDustEmitterProps {
  /** Container width */
  width?: number;
  /** Container height */
  height?: number;
  /** Particle density per 100x100 area */
  density?: number;
  /** Particle color */
  color?: string;
  /** Whether to show ambient particles */
  active?: boolean;
  /** CSS class */
  className?: string;
}

/**
 * Ambient dust particles for idle state
 * Subtle floating particles that add atmosphere
 */
export function AmbientDustEmitter({
  width = 800,
  height = 600,
  density = 5,
  color = '#9ca3af',
  active = false,
  className = '',
}: AmbientDustEmitterProps) {
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Calculate particle count based on area and density
  const particleCount = Math.max(5, Math.min(50, Math.floor((width * height / 10000) * density)));
  
  // Initialize particle positions and animations
  useEffect(() => {
    if (!active) {
      particleRefs.current.forEach((ref) => {
        if (ref) {
          gsap.killTweensOf(ref);
          gsap.set(ref, { opacity: 0 });
        }
      });
      return;
    }
    
    const ctx = gsap.context(() => {
      particleRefs.current.forEach((ref, i) => {
        if (!ref) return;
        
        // Random initial position
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        
        gsap.set(ref, {
          x: startX,
          y: startY,
          opacity: 0,
          scale: 0.5 + Math.random() * 0.5,
        });
        
        // Slow floating animation
        gsap.to(ref, {
          opacity: 0.3 + Math.random() * 0.3,
          y: `-=${20 + Math.random() * 30}`,
          x: `+=${(Math.random() - 0.5) * 40}`,
          duration: 3 + Math.random() * 4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.2,
        });
        
        // Subtle scale breathing
        gsap.to(ref, {
          scale: 0.8 + Math.random() * 0.4,
          duration: 2 + Math.random() * 2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.3,
        });
      });
    });
    
    return () => ctx.revert();
  }, [active, width, height, color]);
  
  return (
    <div
      className={`ambient-dust-emitter ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: particleCount }).map((_, i) => (
        <div
          key={`dust-${i}`}
          ref={(el) => { particleRefs.current[i] = el; }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 ${2 + Math.random() * 2}px ${color}`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Magic sparkle effect for idle core modules
 */
interface MagicSparkleProps {
  x: number;
  y: number;
  size?: number;
  color?: string;
  active?: boolean;
  className?: string;
}

export function MagicSparkle({
  x,
  y,
  size = 60,
  color = '#a855f7',
  active = false,
  className = '',
}: MagicSparkleProps) {
  const sparkleRefs = useRef<(SVGGElement | null)[]>([]);
  
  useEffect(() => {
    if (!active) {
      sparkleRefs.current.forEach((ref) => {
        if (ref) {
          gsap.killTweensOf(ref);
          gsap.set(ref, { opacity: 0, scale: 0 });
        }
      });
      return;
    }
    
    const ctx = gsap.context(() => {
      sparkleRefs.current.forEach((ref, i) => {
        if (!ref) return;
        
        gsap.set(ref, { opacity: 0, scale: 0 });
        
        gsap.to(ref, {
          opacity: 0.8,
          scale: 1,
          duration: 0.3,
          ease: 'back.out(2)',
          repeat: -1,
          repeatDelay: 1 + Math.random() * 2,
          delay: i * 0.5,
        });
      });
    });
    
    return () => ctx.revert();
  }, [active, color]);
  
  const sparkleCount = 3;
  
  return (
    <g className={`magic-sparkle ${className}`}>
      {Array.from({ length: sparkleCount }).map((_, i) => {
        const angle = (i / sparkleCount) * Math.PI * 2;
        const radius = size / 3;
        const sparkX = x + Math.cos(angle) * radius;
        const sparkY = y + Math.sin(angle) * radius;
        
        return (
          <g
            key={`sparkle-${i}`}
            ref={(el) => { sparkleRefs.current[i] = el; }}
            style={{
              transformOrigin: `${sparkX}px ${sparkY}px`,
            }}
          >
            {/* Star shape */}
            <path
              d={`M ${sparkX} ${sparkY - 4} 
                  L ${sparkX + 1} ${sparkY - 1} 
                  L ${sparkX + 4} ${sparkY} 
                  L ${sparkX + 1} ${sparkY + 1} 
                  L ${sparkX} ${sparkY + 4} 
                  L ${sparkX - 1} ${sparkY + 1} 
                  L ${sparkX - 4} ${sparkY} 
                  L ${sparkX - 1} ${sparkY - 1} Z`}
              fill={color}
              opacity={0}
              style={{
                filter: `drop-shadow(0 0 3px ${color})`,
              }}
            />
          </g>
        );
      })}
    </g>
  );
}

/**
 * Rune pulse effect for rune nodes
 */
interface RunePulseProps {
  x: number;
  y: number;
  radius?: number;
  color?: string;
  active?: boolean;
  className?: string;
}

export function RunePulse({
  x,
  y,
  radius = 40,
  color = '#a855f7',
  active = false,
  className = '',
}: RunePulseProps) {
  const pulseRef = useRef<SVGCircleElement>(null);
  
  useEffect(() => {
    if (!active || !pulseRef.current) return;
    
    const ctx = gsap.context(() => {
      gsap.set(pulseRef.current, { scale: 0.5, opacity: 0 });
      
      gsap.to(pulseRef.current, {
        scale: 1.5,
        opacity: 0,
        duration: 1.5,
        ease: 'power1.out',
        repeat: -1,
      });
    });
    
    return () => ctx.revert();
  }, [active, color]);
  
  return (
    <circle
      ref={pulseRef}
      cx={x}
      cy={y}
      r={radius}
      fill="none"
      stroke={color}
      strokeWidth={2}
      opacity={0}
      style={{
        filter: `drop-shadow(0 0 5px ${color})`,
      }}
      className={className}
    />
  );
}

/**
 * Gear highlight for gear modules during rotation
 */
interface GearHighlightProps {
  x: number;
  y: number;
  size?: number;
  color?: string;
  rotation?: number;
  active?: boolean;
  className?: string;
}

export function GearHighlight({
  x,
  y,
  size = 60,
  color = '#7c3aed',
  rotation = 0,
  active = false,
  className = '',
}: GearHighlightProps) {
  const gearRef = useRef<SVGGElement>(null);
  
  useEffect(() => {
    if (!active || !gearRef.current) return;
    
    const ctx = gsap.context(() => {
      // Continuous rotation
      gsap.to(gearRef.current, {
        rotation: 360,
        duration: 4,
        ease: 'none',
        repeat: -1,
        transformOrigin: 'center center',
      });
      
      // Glow pulse
      gsap.to(gearRef.current, {
        opacity: 0.8,
        duration: 0.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    });
    
    return () => ctx.revert();
  }, [active]);
  
  // Calculate teeth positions
  const teethCount = 8;
  const toothRadius = size / 2;
  const innerRadius = size / 2.5;
  
  // Generate gear path
  const toothPoints: string[] = [];
  for (let i = 0; i < teethCount; i++) {
    const angle = (i / teethCount) * Math.PI * 2;
    const nextAngle = ((i + 0.5) / teethCount) * Math.PI * 2;
    
    toothPoints.push(
      `L ${x + Math.cos(angle) * toothRadius} ${y + Math.sin(angle) * toothRadius}`,
      `L ${x + Math.cos(nextAngle) * toothRadius} ${y + Math.sin(nextAngle) * toothRadius}`,
      `L ${x + Math.cos(nextAngle) * innerRadius} ${y + Math.sin(nextAngle) * innerRadius}`
    );
  }
  
  const gearPath = `M ${x + toothRadius} ${y} ${toothPoints.join(' ')} Z`;
  
  return (
    <g
      ref={gearRef}
      className={`gear-highlight ${className}`}
      style={{
        transformOrigin: `${x}px ${y}px`,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Gear shape */}
      <path
        d={gearPath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={active ? 1 : 0.5}
        style={{
          filter: active ? `drop-shadow(0 0 5px ${color})` : undefined,
        }}
      />
      
      {/* Center circle */}
      <circle
        cx={x}
        cy={y}
        r={size / 6}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={active ? 1 : 0.5}
      />
    </g>
  );
}

export default AmbientDustEmitter;
