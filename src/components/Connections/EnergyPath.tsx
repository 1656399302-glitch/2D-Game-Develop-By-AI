import { useRef, useEffect, useState, useMemo, memo } from 'react';
import { gsap } from 'gsap';
import { Connection, MachineState } from '../../types';
import { getPulseWaveCount, getPulseWaveDuration } from '../../utils/activationChoreographer';
import { usePrefersReducedMotion, shouldUseRAFAnimation, calculateStrokeDashoffset } from '../../utils/usePrefersReducedMotion';

interface EnergyPathProps {
  connection: Connection;
  isSelected: boolean;
  isActive: boolean;
  machineState: MachineState;
  onClick?: () => void;
}

interface PulseWave {
  id: string;
  delay: number;
}

// Intermittent animation for failure mode
const INTERMITTENT_DASHARRAY = '4 20'; // Short dash, long gap
const INTERMITTENT_DASHARRAY_ALT = '2 30'; // Even more sparse
const INTERMITTENT_ANIMATION_DURATION = 100; // ms per frame

/**
 * AC5: EnergyPath component memoized to prevent unnecessary re-renders
 * Only re-renders when connection data or selection/active state changes
 * 
 * Round 109 Enhancement:
 * - Intermittent current animation during failure/overload states
 * - Enhanced glitch effects
 */
export const EnergyPath = memo(function EnergyPath({ 
  connection, 
  isSelected, 
  isActive, 
  machineState, 
  onClick 
}: EnergyPathProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const particleRef = useRef<SVGCircleElement>(null);
  const secondaryGlowRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<SVGGElement>(null);
  const rafAnimationRef = useRef<number | null>(null);
  const intermittentIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // AC2: Detect prefers-reduced-motion preference
  const prefersReducedMotion = usePrefersReducedMotion();
  const useRAF = shouldUseRAFAnimation(prefersReducedMotion);
  
  // Intermittent animation state for failure/overload
  const [isIntermittent, setIsIntermittent] = useState(false);
  const [intermittentDashIndex, setIntermittentDashIndex] = useState(0);
  
  // Pulse wave elements
  const [pulseWaves, setPulseWaves] = useState<PulseWave[]>([]);
  const waveRefs = useRef<Map<string, SVGCircleElement>>(new Map());
  
  // RAF animation state
  const rafStateRef = useRef({
    startTime: 0,
    isRunning: false,
  });
  
  // AC5: Memoize path length calculation to prevent unnecessary recalculation
  const pathLength = useMemo(() => {
    if (!pathRef.current) return 200;
    try {
      return pathRef.current.getTotalLength?.() || 200;
    } catch {
      return 200;
    }
  }, [connection.pathData]);
  
  // Get wave count based on path length
  const waveCount = useMemo(() => getPulseWaveCount(pathLength), [pathLength]);
  const waveDuration = useMemo(() => getPulseWaveDuration(pathLength), [pathLength]);
  
  // AC5: Memoize path colors to prevent re-renders when parent state changes
  const pathColor = useMemo(() => {
    if (machineState === 'failure') return '#ff3355';
    if (machineState === 'overload') return '#ff6b35';
    return isSelected ? '#ffd700' : '#00d4ff';
  }, [machineState, isSelected]);
  
  const glowColor = useMemo(() => {
    if (machineState === 'failure') return '#ff3355';
    if (machineState === 'overload') return '#ff6b35';
    return '#00ffcc';
  }, [machineState]);
  
  // Initialize pulse waves
  useEffect(() => {
    const waves: PulseWave[] = [];
    for (let i = 0; i < waveCount; i++) {
      waves.push({
        id: `wave-${connection.id}-${i}`,
        delay: i * 100, // 100ms stagger
      });
    }
    setPulseWaves(waves);
  }, [waveCount, connection.id]);
  
  // Handle intermittent animation for failure/overload states
  useEffect(() => {
    const isFailureOrOverload = machineState === 'failure' || machineState === 'overload';
    
    if (isFailureOrOverload && isActive) {
      // Start intermittent animation
      setIsIntermittent(true);
      
      // Cycle through different dash patterns
      const dashPatterns = [INTERMITTENT_DASHARRAY, INTERMITTENT_DASHARRAY_ALT, '1 40'];
      let currentIndex = 0;
      
      intermittentIntervalRef.current = setInterval(() => {
        currentIndex = (currentIndex + 1) % dashPatterns.length;
        setIntermittentDashIndex(currentIndex);
      }, INTERMITTENT_ANIMATION_DURATION);
      
      return () => {
        if (intermittentIntervalRef.current) {
          clearInterval(intermittentIntervalRef.current);
          intermittentIntervalRef.current = null;
        }
        setIsIntermittent(false);
      };
    } else {
      // Stop intermittent animation
      if (intermittentIntervalRef.current) {
        clearInterval(intermittentIntervalRef.current);
        intermittentIntervalRef.current = null;
      }
      setIsIntermittent(false);
    }
  }, [machineState, isActive]);
  
  // AC2: RAF-based animation fallback for prefers-reduced-motion
  useEffect(() => {
    // Get the animated dash element
    const animatedDashEl = containerRef.current?.querySelector('.energy-flow') as SVGPathElement | null;
    if (!animatedDashEl || !isActive) {
      if (rafAnimationRef.current !== null) {
        cancelAnimationFrame(rafAnimationRef.current);
        rafAnimationRef.current = null;
      }
      rafStateRef.current.isRunning = false;
      return;
    }
    
    // Only use RAF animation if CSS animations are disabled
    if (!useRAF) {
      if (rafAnimationRef.current !== null) {
        cancelAnimationFrame(rafAnimationRef.current);
        rafAnimationRef.current = null;
      }
      rafStateRef.current.isRunning = false;
      return;
    }
    
    // RAF fallback animation
    rafStateRef.current.startTime = performance.now();
    rafStateRef.current.isRunning = true;
    
    const animate = (timestamp: number) => {
      try {
        // AC1: RAF callback error handling
        const elapsed = timestamp - rafStateRef.current.startTime;
        
        // Calculate stroke-dashoffset for energy flow effect
        const dashoffset = calculateStrokeDashoffset(elapsed, 8, 12, 1);
        animatedDashEl.style.strokeDashoffset = `${dashoffset}`;
        
        // Update glow intensity
        if (glowRef.current) {
          const glowPulse = 0.2 + Math.sin(elapsed / 400) * 0.2;
          glowRef.current.setAttribute('opacity', String(glowPulse));
        }
        
        if (particleRef.current) {
          gsap.set(particleRef.current, { opacity: 0.5 + Math.sin(elapsed / 200) * 0.3 });
        }
        
        rafAnimationRef.current = requestAnimationFrame(animate);
      } catch (error) {
        // AC6: Log error gracefully and halt animation
        console.error('RAF error:', error);
        if (rafAnimationRef.current !== null) {
          cancelAnimationFrame(rafAnimationRef.current);
          rafAnimationRef.current = null;
        }
        rafStateRef.current.isRunning = false;
      }
    };
    
    rafAnimationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafAnimationRef.current !== null) {
        cancelAnimationFrame(rafAnimationRef.current);
        rafAnimationRef.current = null;
      }
      rafStateRef.current.isRunning = false;
    };
  }, [isActive, useRAF]);
  
  useEffect(() => {
    if (!particleRef.current || !pathRef.current || !isActive) {
      // Clean up animations
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
      
      // Stop pulse wave animations
      waveRefs.current.forEach((ref) => {
        gsap.killTweensOf(ref);
        gsap.set(ref, { opacity: 0 });
      });
      return;
    }
    
    const ctx = gsap.context(() => {
      // Animate particle along path
      gsap.set(particleRef.current, {
        attr: { r: 4 },
      });
      
      // Enhanced pulse animation with 0.8s duration
      gsap.to(particleRef.current, {
        attr: { r: 6 },
        duration: 0.4,
        yoyo: true,
        repeat: -1,
        ease: 'power1.inOut',
      });
      
      // Use motionPath plugin if available
      gsap.set(particleRef.current, { opacity: 1 });
      
      // Opacity pulse with 0.8s duration
      gsap.to(particleRef.current, {
        opacity: 0.5,
        duration: 0.4,
        yoyo: true,
        repeat: -1,
        ease: 'power1.inOut',
      });
      
      // Primary glow pulse with 0.8s duration
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.6,
          duration: 0.4,
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
      
      // Animate pulse waves along the path
      pulseWaves.forEach((wave) => {
        const waveRef = waveRefs.current.get(wave.id);
        if (!waveRef || !pathRef.current) return;
        
        const startDelay = wave.delay / 1000; // Convert ms to seconds
        
        // Set initial position
        gsap.set(waveRef, { opacity: 0 });
        
        // Animate along path using stroke-dashoffset technique
        gsap.timeline({ delay: startDelay, repeat: -1 })
          .to(waveRef, {
            opacity: 0.9,
            duration: waveDuration / 2000,
            ease: 'power2.in',
          })
          .to(waveRef, {
            opacity: 0,
            duration: waveDuration / 2000,
            ease: 'power2.out',
          });
        
        // Animate position along path using CSS offset-path if available
        if ('offsetPath' in waveRef.style) {
          gsap.to(waveRef, {
            offsetDistance: '0%',
            duration: 0.01,
          });
          gsap.to(waveRef, {
            offsetDistance: '100%',
            duration: waveDuration / 1000,
            ease: 'none',
            repeat: -1,
            delay: startDelay,
          });
        } else {
          // Fallback: animate using translate
          gsap.to(waveRef, {
            opacity: 0.8,
            duration: 0.2,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
            delay: startDelay,
          });
        }
      });
    });
    
    return () => ctx.revert();
  }, [isActive, pulseWaves, waveDuration]);
  
  // Register wave ref
  const setWaveRef = (id: string) => (ref: SVGCircleElement | null) => {
    if (ref) {
      waveRefs.current.set(id, ref);
    } else {
      waveRefs.current.delete(id);
    }
  };
  
  // Get intermittent dash array
  const getIntermittentDashArray = () => {
    const dashPatterns = [INTERMITTENT_DASHARRAY, INTERMITTENT_DASHARRAY_ALT, '1 40'];
    return dashPatterns[intermittentDashIndex];
  };
  
  return (
    <g ref={containerRef} onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Secondary glow layer at 50% opacity for depth */}
      <path
        ref={secondaryGlowRef}
        d={connection.pathData}
        fill="none"
        stroke={glowColor}
        strokeWidth="12"
        opacity="0.1"
        strokeLinecap="round"
      />
      
      {/* Primary glow effect layer */}
      <path
        ref={glowRef}
        d={connection.pathData}
        fill="none"
        stroke={glowColor}
        strokeWidth="8"
        opacity="0.2"
        strokeLinecap="round"
      />
      
      {/* Main path */}
      <path
        ref={pathRef}
        d={connection.pathData}
        fill="none"
        stroke={pathColor}
        strokeWidth={isSelected ? 4 : 3}
        strokeLinecap="round"
        className="transition-all duration-200"
      />
      
      {/* Animated dash layer - CSS animation with RAF fallback and intermittent mode for failure */}
      <path
        d={connection.pathData}
        fill="none"
        stroke={glowColor}
        strokeWidth="2"
        strokeDasharray={isIntermittent ? getIntermittentDashArray() : "8,12"}
        strokeLinecap="round"
        // AC2: energy-flow class handles CSS animation, RAF handles prefers-reduced-motion
        className={isActive && !useRAF ? 'energy-flow' : ''}
        style={{
          opacity: isActive ? 1 : 0.5,
          animation: isIntermittent 
            ? 'intermittentFlicker 0.1s steps(1) infinite' 
            : undefined,
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
      
      {/* Pulse waves - positioned at start of path, will animate along */}
      {pulseWaves.map((wave) => {
        // Get start point of path for initial positioning
        const startPoint = getPathStartPoint(connection.pathData);
        return (
          <circle
            ref={setWaveRef(wave.id)}
            key={wave.id}
            cx={startPoint.x}
            cy={startPoint.y}
            r="5"
            fill={glowColor}
            opacity="0"
            filter="url(#glow)"
          />
        );
      })}
      
      {/* Energy particle */}
      <circle
        ref={particleRef}
        r="4"
        fill={glowColor}
        opacity="0"
      >
        {isActive && !useRAF && (
          <animate
            attributeName="fill"
            values={`${glowColor};${pathColor};${glowColor}`}
            dur="0.8s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Glitch effect for failure/overload */}
      {isIntermittent && (
        <path
          d={connection.pathData}
          fill="none"
          stroke="#ff3355"
          strokeWidth="1"
          strokeDasharray="2,10"
          opacity="0.5"
          style={{
            animation: 'glitchPath 0.2s steps(2) infinite',
          }}
        />
      )}
      
      {/* CSS for intermittent animation */}
      <style>{`
        @keyframes intermittentFlicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes glitchPath {
          0% { transform: translate(2px, 0); opacity: 0.5; }
          25% { transform: translate(-1px, 1px); opacity: 0.3; }
          50% { transform: translate(1px, -1px); opacity: 0.5; }
          75% { transform: translate(-2px, 0); opacity: 0.3; }
          100% { transform: translate(0, 0); opacity: 0.5; }
        }
      `}</style>
    </g>
  );
});

// Helper function to get start point of path
function getPathStartPoint(pathData: string): { x: number; y: number } {
  // Parse "M x y" from path data
  const match = pathData.match(/M\s*([\d.-]+)\s*([\d.-]+)/);
  if (match) {
    return {
      x: parseFloat(match[1]),
      y: parseFloat(match[2]),
    };
  }
  return { x: 0, y: 0 };
}
