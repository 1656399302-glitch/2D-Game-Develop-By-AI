import { useRef, useEffect, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { Connection, MachineState } from '../../types';
import { getPulseWaveCount, getPulseWaveDuration } from '../../utils/activationChoreographer';

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

export function EnergyPath({ connection, isSelected, isActive, machineState, onClick }: EnergyPathProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const particleRef = useRef<SVGCircleElement>(null);
  const secondaryGlowRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<SVGGElement>(null);
  
  // Pulse wave elements
  const [pulseWaves, setPulseWaves] = useState<PulseWave[]>([]);
  const waveRefs = useRef<Map<string, SVGCircleElement>>(new Map());
  
  // Calculate path length for wave count
  const pathLength = useMemo(() => {
    if (!pathRef.current) return 200;
    try {
      return pathRef.current.getTotalLength?.() || 200;
    } catch {
      return 200;
    }
  }, []);
  
  // Get wave count based on path length
  const waveCount = getPulseWaveCount(pathLength);
  const waveDuration = getPulseWaveDuration(pathLength);
  
  // Determine path color based on state
  const getPathColor = () => {
    if (machineState === 'failure') return '#ff3355';
    if (machineState === 'overload') return '#ff6b35';
    return isSelected ? '#ffd700' : '#00d4ff';
  };
  
  const getGlowColor = () => {
    if (machineState === 'failure') return '#ff3355';
    if (machineState === 'overload') return '#ff6b35';
    return '#00ffcc';
  };
  
  useEffect(() => {
    // Initialize pulse waves based on path length
    const waves: PulseWave[] = [];
    for (let i = 0; i < waveCount; i++) {
      waves.push({
        id: `wave-${connection.id}-${i}`,
        delay: i * 100, // 100ms stagger
      });
    }
    setPulseWaves(waves);
  }, [waveCount, connection.id]);
  
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
            duration: waveDuration / 2000, // Half duration
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
  
  return (
    <g ref={containerRef} onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Secondary glow layer at 50% opacity for depth */}
      <path
        ref={secondaryGlowRef}
        d={connection.pathData}
        fill="none"
        stroke={getGlowColor()}
        strokeWidth="12"
        opacity="0.1"
        strokeLinecap="round"
      />
      
      {/* Primary glow effect layer - enhanced stdDeviation=4 during active state */}
      <path
        ref={glowRef}
        d={connection.pathData}
        fill="none"
        stroke={getGlowColor()}
        strokeWidth="8"
        opacity="0.2"
        strokeLinecap="round"
      />
      
      {/* Main path */}
      <path
        ref={pathRef}
        d={connection.pathData}
        fill="none"
        stroke={getPathColor()}
        strokeWidth={isSelected ? 4 : 3}
        strokeLinecap="round"
        className="transition-all duration-200"
      />
      
      {/* Animated dash layer */}
      <path
        d={connection.pathData}
        fill="none"
        stroke={getGlowColor()}
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
            fill={getGlowColor()}
            opacity="0"
            filter="url(#glow)"
          />
        );
      })}
      
      {/* Energy particle */}
      <circle
        ref={particleRef}
        r="4"
        fill={getGlowColor()}
        opacity="0"
      >
        {isActive && (
          <animate
            attributeName="fill"
            values={`${getGlowColor()};${getPathColor()};${getGlowColor()}`}
            dur="0.8s"
            repeatCount="indefinite"
          />
        )}
      </circle>
    </g>
  );
}

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
