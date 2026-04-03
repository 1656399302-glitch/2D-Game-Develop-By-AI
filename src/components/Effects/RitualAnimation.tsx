/**
 * Ritual Animation Component
 * 
 * Ceremonial animation for saving machines to the Codex.
 * Features:
 * - Golden spiral particles emanating from saved machine
 * - Machine fades while glowing
 * - "Saved to Codex" typewriter effect
 * - Achievement toast slide-in
 * 
 * Round 109: Codex Save Ritual Animation
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';

interface RitualParticle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  opacity: number;
  color: string;
  rotation: number;
}

interface RitualAnimationProps {
  /** Whether the animation is playing */
  active: boolean;
  /** Machine name for the typewriter effect */
  machineName?: string;
  /** Codex ID for display */
  codexId?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Position of the saved machine (center point) */
  machinePosition?: { x: number; y: number };
  /** CSS class */
  className?: string;
}

/**
 * Golden particle for the ritual effect
 */
interface GoldenParticleProps {
  particle: RitualParticle;
  onComplete: (id: number) => void;
}

function GoldenParticle({ particle, onComplete }: GoldenParticleProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    // Animate along spiral path
    const ctx = gsap.context(() => {
      gsap.to(elementRef.current, {
        x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
        y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
        opacity: 0,
        scale: 0.2,
        rotation: particle.rotation + 360,
        duration: 1.5,
        ease: 'power2.out',
        onComplete: () => onComplete(particle.id),
      });
    });
    
    return () => ctx.revert();
  }, [particle, onComplete]);
  
  return (
    <div
      ref={elementRef}
      className="golden-ritual-particle"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: particle.size,
        height: particle.size,
        borderRadius: '50%',
        backgroundColor: particle.color,
        boxShadow: `0 0 ${particle.size * 3}px ${particle.color}, 0 0 ${particle.size * 6}px rgba(255, 215, 0, 0.5)`,
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}

/**
 * Spiral particles emanating from center
 */
interface SpiralParticlesProps {
  active: boolean;
  particleCount?: number;
  onComplete?: () => void;
}

function SpiralParticles({
  active,
  particleCount = 24,
  onComplete,
}: SpiralParticlesProps) {
  const [particles, setParticles] = useState<RitualParticle[]>([]);
  const completedCountRef = useRef(0);
  
  // Generate initial particles
  useEffect(() => {
    if (!active) {
      setParticles([]);
      completedCountRef.current = 0;
      return;
    }
    
    const newParticles: RitualParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * 360;
      const colors = [
        '#ffd700', // Gold
        '#ffb347', // Orange gold
        '#fff8dc', // Cornsilk
        '#ffec8b', // Light goldenrod
        '#ffe135', // Banana yellow
      ];
      
      newParticles.push({
        id: i,
        angle,
        distance: 0,
        size: 4 + Math.random() * 4,
        opacity: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
      });
    }
    
    setParticles(newParticles);
    
    // Stagger particle spawning
    const spawnInterval = setInterval(() => {
      setParticles((prev) => {
        if (prev.length >= particleCount) {
          clearInterval(spawnInterval);
          return prev;
        }
        // Spawn more particles
        return prev;
      });
    }, 50);
    
    return () => clearInterval(spawnInterval);
  }, [active, particleCount]);
  
  // Handle particle completion
  const handleParticleComplete = useCallback((id: number) => {
    completedCountRef.current++;
    setParticles((prev) => prev.filter((p) => p.id !== id));
    
    if (completedCountRef.current >= particleCount && onComplete) {
      onComplete();
    }
  }, [particleCount, onComplete]);
  
  if (!active || particles.length === 0) return null;
  
  return (
    <div
      className="spiral-particles"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {particles.map((particle) => (
        <GoldenParticle
          key={particle.id}
          particle={particle}
          onComplete={handleParticleComplete}
        />
      ))}
    </div>
  );
}

/**
 * Golden glow expansion effect
 */
interface GoldenGlowProps {
  active: boolean;
  maxRadius?: number;
  duration?: number;
}

function GoldenGlow({
  active,
  maxRadius = 300,
  duration = 1000,
}: GoldenGlowProps) {
  const glowRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!glowRef.current || !active) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo(
        glowRef.current,
        {
          width: 0,
          height: 0,
          opacity: 1,
        },
        {
          width: maxRadius * 2,
          height: maxRadius * 2,
          opacity: 0,
          duration: duration / 1000,
          ease: 'power2.out',
        }
      );
    }, glowRef);
    
    return () => ctx.revert();
  }, [active, maxRadius, duration]);
  
  if (!active) return null;
  
  return (
    <div
      ref={glowRef}
      className="golden-glow"
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 0,
        height: 0,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 215, 0, 0) 70%)',
        pointerEvents: 'none',
      }}
    />
  );
}

/**
 * Machine fade effect during ritual
 */
interface MachineFadeProps {
  active: boolean;
  machineRef: React.RefObject<HTMLDivElement>;
  duration?: number;
}

function MachineFade({
  active,
  machineRef,
  duration = 800,
}: MachineFadeProps) {
  useEffect(() => {
    if (!machineRef.current || !active) return;
    
    const ctx = gsap.context(() => {
      gsap.to(machineRef.current, {
        opacity: 0.5,
        scale: 0.95,
        duration: duration / 1000,
        ease: 'power2.out',
      });
    }, machineRef);
    
    return () => ctx.revert();
  }, [active, duration, machineRef]);
  
  return null;
}

/**
 * Typewriter text effect
 */
interface TypewriterTextProps {
  active: boolean;
  text: string;
  speed?: number; // ms per character
  onComplete?: () => void;
}

function TypewriterText({
  active,
  text,
  speed = 50,
  onComplete,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!active) {
      setDisplayText('');
      return;
    }
    
    let currentIndex = 0;
    setDisplayText('');
    
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        if (onComplete) {
          setTimeout(onComplete, 300);
        }
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [active, text, speed, onComplete]);
  
  if (!active) return null;
  
  return (
    <div
      ref={containerRef}
      className="typewriter-text"
      style={{
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '1.25rem',
        color: '#ffd700',
        textShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
        letterSpacing: '0.05em',
      }}
    >
      {displayText}
      <span
        style={{
          animation: 'blink 0.7s step-end infinite',
        }}
      >
        |
      </span>
    </div>
  );
}

/**
 * Achievement toast that slides in from the right
 */
interface AchievementToastProps {
  active: boolean;
  title?: string;
  message?: string;
  icon?: string;
}

function AchievementToast({
  active,
  title = 'Added to Codex',
  message = 'Machine saved successfully',
  icon = '📖',
}: AchievementToastProps) {
  const toastRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!toastRef.current) return;
    
    const ctx = gsap.context(() => {
      if (active) {
        // Slide in from right
        gsap.fromTo(
          toastRef.current,
          {
            x: 300,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'back.out(1.7)',
          }
        );
        
        // Auto dismiss
        gsap.to(toastRef.current, {
          x: 300,
          opacity: 0,
          duration: 0.3,
          delay: 2.5,
          ease: 'power2.in',
        });
      }
    }, toastRef);
    
    return () => ctx.revert();
  }, [active]);
  
  if (!active) return null;
  
  return (
    <div
      ref={toastRef}
      className="achievement-toast"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '2px solid #ffd700',
        borderRadius: '12px',
        boxShadow: '0 0 20px rgba(255, 215, 0, 0.3), 0 10px 40px rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        opacity: 0,
        transform: 'translateX(300px)',
      }}
    >
      <span style={{ fontSize: '2rem' }}>{icon}</span>
      <div>
        <div
          style={{
            fontWeight: 'bold',
            color: '#ffd700',
            fontSize: '0.9rem',
            marginBottom: '4px',
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: '#9ca3af',
            fontSize: '0.8rem',
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
}

/**
 * Decorative rune circle animation
 */
interface RuneCircleProps {
  active: boolean;
  radius?: number;
}

function RuneCircle({
  active,
  radius = 150,
}: RuneCircleProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  
  useEffect(() => {
    if (!circleRef.current || !active) return;
    
    const ctx = gsap.context(() => {
      // Rotate the circle
      gsap.to(circleRef.current, {
        rotation: 360,
        duration: 8,
        ease: 'none',
        repeat: -1,
        transformOrigin: 'center center',
      });
      
      // Pulse the stroke
      gsap.to(circleRef.current, {
        strokeWidth: 2,
        opacity: 0.8,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }, circleRef);
    
    return () => ctx.revert();
  }, [active]);
  
  if (!active) return null;
  
  // Generate rune symbols around the circle
  const runeCount = 12;
  const runes = Array.from({ length: runeCount }, (_, i) => {
    const angle = (i / runeCount) * 360;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    return { angle, x, y };
  });
  
  return (
    <svg
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: radius * 2 + 40,
        height: radius * 2 + 40,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {/* Outer circle */}
      <circle
        ref={circleRef}
        cx={radius + 20}
        cy={radius + 20}
        r={radius}
        fill="none"
        stroke="#ffd700"
        strokeWidth={1}
        opacity={0.6}
        strokeDasharray="10, 5"
      />
      
      {/* Inner circle */}
      <circle
        cx={radius + 20}
        cy={radius + 20}
        r={radius * 0.7}
        fill="none"
        stroke="#ffd700"
        strokeWidth={0.5}
        opacity={0.4}
      />
      
      {/* Rune symbols */}
      {runes.map((rune, i) => (
        <text
          key={i}
          x={radius + 20 + rune.x}
          y={radius + 20 + rune.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffd700"
          fontSize="12"
          opacity={0.8}
          style={{
            transform: `rotate(${rune.angle}deg)`,
            transformOrigin: `${radius + 20 + rune.x}px ${radius + 20 + rune.y}px`,
          }}
        >
          ⚙
        </text>
      ))}
    </svg>
  );
}

/**
 * Main Ritual Animation Component
 */
export function RitualAnimation({
  active = false,
  machineName = 'Unknown Machine',
  codexId = '',
  onComplete,
  className = '',
}: RitualAnimationProps) {
  const [showText, setShowText] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const machineRef = useRef<HTMLDivElement>(null);
  
  // Sequence the animations
  useEffect(() => {
    if (!active) {
      setShowText(false);
      setShowToast(false);
      return;
    }
    
    // Show text after particles start
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 500);
    
    // Show toast after text completes
    const toastTimer = setTimeout(() => {
      setShowToast(true);
    }, 1500);
    
    // Complete callback
    const completeTimer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 3500);
    
    return () => {
      clearTimeout(textTimer);
      clearTimeout(toastTimer);
      clearTimeout(completeTimer);
    };
  }, [active, onComplete]);
  
  const saveMessage = useMemo(() => {
    if (codexId) {
      return `${machineName} (${codexId})`;
    }
    return machineName;
  }, [machineName, codexId]);
  
  return (
    <div
      className={`ritual-animation ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: active ? 'none' : 'auto',
        overflow: 'hidden',
      }}
    >
      {/* Machine fade effect */}
      <div ref={machineRef}>
        {/* This would wrap the actual machine content */}
      </div>
      
      <MachineFade active={active} machineRef={machineRef} />
      
      {/* Golden glow */}
      <GoldenGlow active={active} />
      
      {/* Spiral particles */}
      <SpiralParticles
        active={active}
        particleCount={24}
        onComplete={() => {}}
      />
      
      {/* Rune circle */}
      <RuneCircle active={active} radius={150} />
      
      {/* Typewriter text */}
      <div
        style={{
          position: 'absolute',
          bottom: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
        <TypewriterText
          active={showText}
          text={`✓ Saved to Codex: ${saveMessage}`}
        />
      </div>
      
      {/* Achievement toast */}
      <AchievementToast
        active={showToast}
        title="Added to Codex"
        message={`${machineName} has been recorded`}
        icon="📖"
      />
      
      {/* CSS animations */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default RitualAnimation;
