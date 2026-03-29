import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';
import { Connection, MachineState } from '../../types';
import { getPulseWaveCount, getPulseWaveDuration } from '../../utils/activationChoreographer';
import { EnergySparkEmitter, getParticleCountForEnergyLevel, getSpeedForEnergyLevel } from '../Particles/EnergySparkEmitter';

interface EnhancedEnergyPathProps {
  connection: Connection;
  isSelected: boolean;
  isActive: boolean;
  machineState: MachineState;
  onClick?: () => void;
  /** Energy level for particle scaling (1-10) */
  energyLevel?: number;
  /** Number of particles (1-20, overrides energy level calculation) */
  particleCount?: number;
  /** Particle speed (0.5-5, overrides energy level calculation) */
  speed?: number;
  /** Glow intensity (0-1) */
  glowIntensity?: number;
}

interface PulseWave {
  id: string;
  delay: number;
}

export function EnhancedEnergyPath({
  connection,
  isSelected,
  isActive,
  machineState,
  onClick,
  energyLevel = 5,
  particleCount: particleCountOverride,
  speed: speedOverride,
  glowIntensity: glowIntensityOverride,
}: EnhancedEnergyPathProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const secondaryGlowRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<SVGGElement>(null);
  
  // Pulse wave elements
  const [pulseWaves, setPulseWaves] = useState<PulseWave[]>([]);
  const waveRefs = useRef<Map<string, SVGCircleElement>>(new Map());
  
  // Calculate derived values
  const particleCount = particleCountOverride ?? getParticleCountForEnergyLevel(energyLevel);
  const speed = speedOverride ?? getSpeedForEnergyLevel(energyLevel);
  const glowIntensity = glowIntensityOverride ?? (energyLevel / 10);
  
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
  const getPathColor = useCallback(() => {
    if (machineState === 'failure') return '#ff3355';
    if (machineState === 'overload') return '#ff6b35';
    return isSelected ? '#ffd700' : '#00d4ff';
  }, [machineState, isSelected]);
  
  const getGlowColor = useCallback(() => {
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
        delay: i * 100,
      });
    }
    setPulseWaves(waves);
  }, [waveCount, connection.id]);
  
  // GSAP animations
  useEffect(() => {
    if (!pathRef.current || !isActive) {
      // Clean up animations
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
      // Primary glow pulse
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.4 + glowIntensity * 0.2,
          duration: 0.5,
          yoyo: true,
          repeat: -1,
          ease: 'power1.inOut',
        });
      }
      
      // Secondary glow layer
      if (secondaryGlowRef.current) {
        gsap.to(secondaryGlowRef.current, {
          opacity: 0.15 + glowIntensity * 0.1,
          duration: 0.7,
          yoyo: true,
          repeat: -1,
          ease: 'power1.inOut',
        });
      }
      
      // Animate pulse waves
      pulseWaves.forEach((wave) => {
        const waveRef = waveRefs.current.get(wave.id);
        if (!waveRef) return;
        
        const startDelay = wave.delay / 1000;
        
        gsap.set(waveRef, { opacity: 0 });
        
        gsap.timeline({ delay: startDelay, repeat: -1 })
          .to(waveRef, {
            opacity: 0.7 * glowIntensity,
            duration: waveDuration / 2000,
            ease: 'power2.in',
          })
          .to(waveRef, {
            opacity: 0,
            duration: waveDuration / 2000,
            ease: 'power2.out',
          });
      });
    });
    
    return () => ctx.revert();
  }, [isActive, pulseWaves, waveDuration, glowIntensity]);
  
  // Register wave ref
  const setWaveRef = (id: string) => (ref: SVGCircleElement | null) => {
    if (ref) {
      waveRefs.current.set(id, ref);
    } else {
      waveRefs.current.delete(id);
    }
  };
  
  // Get start point for wave positioning
  const startPoint = useMemo(() => {
    try {
      const match = connection.pathData.match(/M\s*([\d.-]+)\s*([\d.-]+)/);
      if (match) {
        return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
      }
    } catch {
      // Fallback
    }
    return { x: 0, y: 0 };
  }, [connection.pathData]);
  
  const pathColor = getPathColor();
  const glowColor = getGlowColor();
  
  return (
    <g ref={containerRef} onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Secondary glow layer */}
      <path
        ref={secondaryGlowRef}
        d={connection.pathData}
        fill="none"
        stroke={glowColor}
        strokeWidth="12"
        opacity="0.1"
        strokeLinecap="round"
      />
      
      {/* Primary glow effect */}
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
      
      {/* Animated dash layer */}
      <path
        d={connection.pathData}
        fill="none"
        stroke={glowColor}
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
      
      {/* Pulse waves */}
      {pulseWaves.map((wave) => (
        <circle
          ref={setWaveRef(wave.id)}
          key={wave.id}
          cx={startPoint.x}
          cy={startPoint.y}
          r="5"
          fill={glowColor}
          opacity="0"
          filter={`url(#glow-${connection.id})`}
        />
      ))}
      
      {/* Energy spark particles */}
      <EnergySparkEmitter
        pathData={connection.pathData}
        particleCount={particleCount}
        speed={speed}
        glowIntensity={glowIntensity}
        active={isActive}
        color={glowColor}
      />
      
      {/* Local glow filter for pulse waves */}
      <defs>
        <filter id={`glow-${connection.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={3 * glowIntensity} result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </g>
  );
}

export default EnhancedEnergyPath;
