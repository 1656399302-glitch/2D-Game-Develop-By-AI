import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { getRarityColor, calculateShakeOffset } from '../../utils/activationChoreographer';
import { 
  calculateVignetteOpacity, 
  calculateShakeIntensity, 
  calculateShakeDuration,
  getVignetteColor,
  getFactionGlowRGB,
  calculateDominantFaction,
  calculateGlowRadius,
  calculateGlowIntensity,
} from '../../utils/activation/effects';
import { Rarity } from '../../types';
import { AmbientDustEmitter } from '../Particles/AmbientDustEmitter';
import { FailureParticleEmitter } from '../Particles/FailureParticleEmitter';
// useActivationChoreography - imported for future use
// import { useActivationChoreography } from '../../hooks/useActivationChoreography';

interface ActivationOverlayProps {
  onComplete: () => void;
  /** Power output for visual intensity scaling (0-100) */
  powerOutput?: number;
  /** Module types for faction detection */
  moduleTypes?: string[];
}

type Phase = 'idle' | 'charging' | 'activating' | 'online' | 'failure' | 'overload' | 'shutdown';

// Flicker interval
const FLICKER_INTERVAL = 50;

// Flash effect
const FLASH_DURATION = 100;
const FLASH_OPACITY = 0.3;

// Particle burst at completion
const PARTICLE_COUNT = 12;
const PARTICLE_DURATION = 1000;

// Enhanced glitch/noise effect for failure mode
const GLITCH_INTERVAL = 30;
const NOISE_OPACITY = 0.05;

// Red flash overlay for failure
const RED_FLASH_OPACITY = 0.3;
const RED_FLASH_INTERVAL = 150;

export function ActivationOverlay({ onComplete, powerOutput = 50, moduleTypes = [] }: ActivationOverlayProps) {
  const [phase, setPhase] = useState<Phase>('charging');
  const [progress, setProgress] = useState(0);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(-1);
  const [flicker, setFlicker] = useState(false);
  const [vignetteOpacity, setVignetteOpacity] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [particles, setParticles] = useState<{ id: number; angle: number; distance: number; size: number }[]>([]);
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
  const [showAmbientParticles, setShowAmbientParticles] = useState(false);
  
  // Enhanced glitch/noise state
  const [showGlitch, setShowGlitch] = useState(false);
  const [noiseOffset, setNoiseOffset] = useState({ x: 0, y: 0 });
  
  // Red flash overlay state for failure mode
  const [showRedFlash, setShowRedFlash] = useState(false);
  
  // Glow effects state
  const [glowRadius, setGlowRadius] = useState(1);
  const [glowIntensity, setGlowIntensity] = useState(0.5);
  
  // Module burst effects - track which modules should show bursts
  const [, setActiveBursts] = useState<Set<string>>(new Set());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const flickerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const glitchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const redFlashIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const particleAnimationRef = useRef<number | null>(null);
  const shakeAnimationRef = useRef<number | null>(null);
  
  const modules = useMachineStore((state) => state.modules);
  const machineState = useMachineStore((state) => state.machineState);
  const generatedAttributes = useMachineStore((state) => state.generatedAttributes);
  
  // FIX: Store all store actions/callbacks in refs to avoid dependency array issues
  const setMachineStateRef = useRef(useMachineStore.getState().setMachineState);
  const setShowActivationRef = useRef(useMachineStore.getState().setShowActivation);
  const startActivationZoomRef = useRef(useMachineStore.getState().startActivationZoom);
  const endActivationZoomRef = useRef(useMachineStore.getState().endActivationZoom);
  const setActivationModuleIndexRef = useRef(useMachineStore.getState().setActivationModuleIndex);
  
  const rarity: Rarity = generatedAttributes?.rarity || 'common';
  const rarityColor = getRarityColor(rarity);
  
  // Calculate dominant faction from module types
  const dominantFaction = useMemo(() => {
    const types = moduleTypes.length > 0 ? moduleTypes : modules.map(m => m.type);
    return calculateDominantFaction(types);
  }, [moduleTypes, modules]);
  
  // Get faction RGB for glow effects
  const factionRGB = useMemo(() => getFactionGlowRGB(dominantFaction), [dominantFaction]);
  
  // Calculate faction-colored glow color
  const factionGlowColor = useMemo(() => {
    return `rgba(${factionRGB.r}, ${factionRGB.g}, ${factionRGB.b}, ${glowIntensity})`;
  }, [factionRGB, glowIntensity]);
  
  // Update glow calculations based on power output
  useEffect(() => {
    const radius = calculateGlowRadius(powerOutput);
    const intensity = calculateGlowIntensity(powerOutput);
    setGlowRadius(radius);
    setGlowIntensity(intensity);
  }, [powerOutput]);
  
  // FIX: Sync all refs when store actions change
  useEffect(() => {
    setMachineStateRef.current = useMachineStore.getState().setMachineState;
    setShowActivationRef.current = useMachineStore.getState().setShowActivation;
    startActivationZoomRef.current = useMachineStore.getState().startActivationZoom;
    endActivationZoomRef.current = useMachineStore.getState().endActivationZoom;
    setActivationModuleIndexRef.current = useMachineStore.getState().setActivationModuleIndex;
  }, []);
  
  // Trigger flash effect
  const triggerFlash = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => {
      setShowFlash(false);
    }, FLASH_DURATION);
  }, []);
  
  // Store triggerFlash in ref
  const triggerFlashRef = useRef(triggerFlash);
  useEffect(() => {
    triggerFlashRef.current = triggerFlash;
  }, [triggerFlash]);
  
  // Generate completion particles
  const generateParticles = useCallback(() => {
    const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      angle: (i * 360) / PARTICLE_COUNT + (Math.random() * 20 - 10),
      distance: 0,
      size: 4 + Math.random() * 4,
    }));
    setParticles(newParticles);
    
    const startTime = performance.now();
    const animateParticles = (time: number) => {
      const elapsed = time - startTime;
      if (elapsed > PARTICLE_DURATION) {
        setParticles([]);
        return;
      }
      
      const progressPct = elapsed / PARTICLE_DURATION;
      const easedProgress = 1 - Math.pow(1 - progressPct, 3);
      
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          distance: easedProgress * 200,
        }))
      );
      
      particleAnimationRef.current = requestAnimationFrame(animateParticles);
    };
    
    particleAnimationRef.current = requestAnimationFrame(animateParticles);
  }, []);
  
  // Store generateParticles in ref
  const generateParticlesRef = useRef(generateParticles);
  useEffect(() => {
    generateParticlesRef.current = generateParticles;
  }, [generateParticles]);
  
  // Stop ambient particles
  const stopAmbientParticles = useCallback(() => {
    setShowAmbientParticles(false);
  }, []);
  
  // Store stopAmbientParticles in ref
  const stopAmbientParticlesRef = useRef(stopAmbientParticles);
  useEffect(() => {
    stopAmbientParticlesRef.current = stopAmbientParticles;
  }, [stopAmbientParticles]);
  
  // Trigger module burst effect
  const triggerModuleBurst = useCallback((moduleId: string) => {
    setActiveBursts((prev) => new Set([...prev, moduleId]));
    setTimeout(() => {
      setActiveBursts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(moduleId);
        return newSet;
      });
    }, 500);
  }, []);
  
  // Store triggerModuleBurst in ref
  const triggerModuleBurstRef = useRef(triggerModuleBurst);
  useEffect(() => {
    triggerModuleBurstRef.current = triggerModuleBurst;
  }, [triggerModuleBurst]);
  
  // Viewport shake effect - enhanced with effects utility
  const startShake = useCallback((intensity: number) => {
    if (shakeAnimationRef.current) {
      cancelAnimationFrame(shakeAnimationRef.current);
    }
    
    const startTime = performance.now();
    const duration = calculateShakeDuration(machineState);
    
    const shake = () => {
      const elapsed = Date.now() - startTime;
      const offset = calculateShakeOffset(elapsed / 1000, intensity, duration / 1000);
      
      setViewportOffset({ x: offset.x, y: offset.y });
      
      if (!offset.isComplete) {
        shakeAnimationRef.current = requestAnimationFrame(shake);
      } else {
        setViewportOffset({ x: 0, y: 0 });
      }
    };
    
    shake();
  }, [machineState]);
  
  // Store startShake in ref
  const startShakeRef = useRef(startShake);
  useEffect(() => {
    startShakeRef.current = startShake;
  }, [startShake]);
  
  // Handle skip
  const handleSkip = useCallback(() => {
    // Clean up all animations
    if (flickerIntervalRef.current) {
      clearInterval(flickerIntervalRef.current);
    }
    if (glitchIntervalRef.current) {
      clearInterval(glitchIntervalRef.current);
    }
    if (redFlashIntervalRef.current) {
      clearInterval(redFlashIntervalRef.current);
    }
    if (particleAnimationRef.current) {
      cancelAnimationFrame(particleAnimationRef.current);
    }
    if (shakeAnimationRef.current) {
      cancelAnimationFrame(shakeAnimationRef.current);
    }
    
    stopAmbientParticlesRef.current();
    setMachineStateRef.current('idle');
    setShowActivationRef.current(false);
    setViewportOffset({ x: 0, y: 0 });
    setActivationModuleIndexRef.current(-1);
    endActivationZoomRef.current();
    onComplete();
  }, [onComplete]);
  
  // Store onComplete in ref
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  // Store modules in ref
  const modulesRef = useRef(modules);
  useEffect(() => {
    modulesRef.current = modules;
  }, [modules]);
  
  // Failure mode effect with enhanced glitch and red flash
  useEffect(() => {
    if (machineState === 'failure') {
      setPhase('failure');
      setProgress(100);
      stopAmbientParticlesRef.current();
      endActivationZoomRef.current();
      
      // Calculate vignette using effects utility
      const newVignetteOpacity = calculateVignetteOpacity('failure', powerOutput);
      setVignetteOpacity(newVignetteOpacity);
      
      // Flicker effect
      flickerIntervalRef.current = setInterval(() => {
        setFlicker((prev) => !prev);
      }, FLICKER_INTERVAL);
      
      // Enhanced glitch/noise effect for failure
      glitchIntervalRef.current = setInterval(() => {
        setShowGlitch(true);
        setNoiseOffset({
          x: (Math.random() - 0.5) * 20,
          y: (Math.random() - 0.5) * 10,
        });
        setTimeout(() => setShowGlitch(false), GLITCH_INTERVAL);
      }, GLITCH_INTERVAL * 2);
      
      // Red flash overlay effect (NEW in Round 109)
      redFlashIntervalRef.current = setInterval(() => {
        setShowRedFlash(true);
        setTimeout(() => setShowRedFlash(false), RED_FLASH_INTERVAL);
      }, RED_FLASH_INTERVAL * 2);
      
      // Start shake using effects utility intensity
      const shakeIntensity = calculateShakeIntensity('failure', powerOutput);
      startShakeRef.current(shakeIntensity);
      
      return () => {
        if (flickerIntervalRef.current) {
          clearInterval(flickerIntervalRef.current);
        }
        if (glitchIntervalRef.current) {
          clearInterval(glitchIntervalRef.current);
        }
        if (redFlashIntervalRef.current) {
          clearInterval(redFlashIntervalRef.current);
        }
      };
    } else if (machineState === 'overload') {
      setPhase('overload');
      setProgress(100);
      stopAmbientParticlesRef.current();
      endActivationZoomRef.current();
      
      // Calculate vignette using effects utility
      const newVignetteOpacity = calculateVignetteOpacity('overload', powerOutput);
      setVignetteOpacity(newVignetteOpacity);
      
      // Faster flicker for overload
      flickerIntervalRef.current = setInterval(() => {
        setFlicker((prev) => !prev);
      }, FLICKER_INTERVAL / 2);
      
      // Enhanced glitch effect for overload (less intense than failure)
      glitchIntervalRef.current = setInterval(() => {
        if (Math.random() > 0.5) {
          setShowGlitch(true);
          setNoiseOffset({
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 5,
          });
          setTimeout(() => setShowGlitch(false), GLITCH_INTERVAL);
        }
      }, GLITCH_INTERVAL * 3);
      
      // Orange flash for overload (less intense than failure red flash)
      redFlashIntervalRef.current = setInterval(() => {
        if (Math.random() > 0.3) {
          setShowRedFlash(true);
          setTimeout(() => setShowRedFlash(false), RED_FLASH_INTERVAL);
        }
      }, RED_FLASH_INTERVAL * 3);
      
      // Start shake using effects utility intensity
      const shakeIntensity = calculateShakeIntensity('overload', powerOutput);
      startShakeRef.current(shakeIntensity);
      
      return () => {
        if (flickerIntervalRef.current) {
          clearInterval(flickerIntervalRef.current);
        }
        if (glitchIntervalRef.current) {
          clearInterval(glitchIntervalRef.current);
        }
        if (redFlashIntervalRef.current) {
          clearInterval(redFlashIntervalRef.current);
        }
      };
    }
  }, [machineState, powerOutput]); // Only depends on machineState and powerOutput, not on callbacks
  
  // Main activation sequence - enhanced with sequential choreography
  useEffect(() => {
    if (machineState !== 'charging' && machineState !== 'active' && machineState !== 'shutdown') {
      return;
    }
    
    setMachineStateRef.current('charging');
    setShowAmbientParticles(true);
    
    // Calculate shake intensity using effects utility
    const shakeIntensity = calculateShakeIntensity('charging', powerOutput);
    startShakeRef.current(shakeIntensity);
    
    // Start activation zoom to focus on machine
    startActivationZoomRef.current();
    
    const chargingDuration = 267;
    const activatingDuration = 400;
    const onlineDuration = 167;
    
    let startTime = Date.now();
    let animationFrame: number;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const currentModules = modulesRef.current;
      
      if (phase === 'charging') {
        const progressPercent = Math.min(elapsed / chargingDuration, 1);
        setProgress(progressPercent * 30);
        
        // Update vignette during charging using effects utility
        const vignetteValue = calculateVignetteOpacity('charging', powerOutput);
        setVignetteOpacity(vignetteValue);
        
        if (progressPercent >= 1) {
          triggerFlashRef.current();
          setPhase('activating');
          setMachineStateRef.current('active');
          startTime = Date.now();
          
          // Calculate shake intensity for active state
          const activeShakeIntensity = calculateShakeIntensity('active', powerOutput);
          startShakeRef.current(activeShakeIntensity);
          
          setActivationModuleIndexRef.current(0);
          
          // Trigger burst for first module (or trigger-switch if exists)
          const triggerModule = currentModules.find(m => m.type === 'trigger-switch');
          if (triggerModule) {
            triggerModuleBurstRef.current(triggerModule.instanceId);
          } else if (currentModules.length > 0) {
            triggerModuleBurstRef.current(currentModules[0].instanceId);
          }
          
          // Set up sequential module activation based on connection topology
          const categorizedModules = categorizeModulesForActivation(currentModules);
          
          categorizedModules.forEach((group, groupIndex) => {
            group.forEach((_, moduleIndex) => {
              const totalIndex = getTotalModuleIndex(categorizedModules, groupIndex, moduleIndex);
              setTimeout(() => {
                setCurrentModuleIndex(totalIndex);
                setActivationModuleIndexRef.current(totalIndex);
                
                // Trigger burst for this module
                const module = currentModules[totalIndex];
                if (module) {
                  triggerModuleBurstRef.current(module.instanceId);
                }
              }, moduleIndex * (activatingDuration / (currentModules.length || 1)) * 0.3);
            });
          });
        }
      } else if (phase === 'activating') {
        const progressPercent = Math.min(elapsed / activatingDuration, 1);
        setProgress(30 + progressPercent * 50);
        
        // Update vignette during active using effects utility
        const vignetteValue = calculateVignetteOpacity('active', powerOutput);
        setVignetteOpacity(vignetteValue);
        
        if (currentModules.length > 0) {
          const moduleProgress = (elapsed / activatingDuration) * currentModules.length;
          const newIndex = Math.min(Math.floor(moduleProgress), currentModules.length - 1);
          if (newIndex !== currentModuleIndex) {
            setCurrentModuleIndex(newIndex);
            setActivationModuleIndexRef.current(newIndex);
          }
        }
        
        if (progressPercent >= 1) {
          triggerFlashRef.current();
          setPhase('online');
          setMachineStateRef.current('shutdown');
          startTime = Date.now();
          setProgress(80);
          
          generateParticlesRef.current();
          
          // End activation zoom when complete
          setTimeout(() => {
            endActivationZoomRef.current();
          }, 200);
        }
      } else if (phase === 'online') {
        const progressPercent = Math.min(elapsed / onlineDuration, 1);
        setProgress(80 + progressPercent * 20);
        
        // Update vignette during online
        const vignetteValue = calculateVignetteOpacity('shutdown', powerOutput);
        setVignetteOpacity(vignetteValue);
        
        if (progressPercent >= 1) {
          setProgress(100);
          setTimeout(() => {
            stopAmbientParticlesRef.current();
            setViewportOffset({ x: 0, y: 0 });
            setActivationModuleIndexRef.current(-1);
            setMachineStateRef.current('idle');
            setShowActivationRef.current(false);
            onCompleteRef.current();
          }, 300);
        }
      }
      
      if (progress < 100 && phase !== 'failure' && phase !== 'overload') {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [phase, progress, machineState, powerOutput]); // Only depends on primitives, not on store actions
  
  const categorizeModulesForActivation = (mods: typeof modules) => {
    const cores: typeof modules = [];
    const runes: typeof modules = [];
    const connectors: typeof modules = [];
    const outputs: typeof modules = [];
    
    mods.forEach((m) => {
      if (m.type === 'core-furnace' || m.type === 'stabilizer-core' || m.type === 'void-siphon') {
        cores.push(m);
      } else if (m.type === 'rune-node' || m.type === 'amplifier-crystal' || m.type === 'phase-modulator') {
        runes.push(m);
      } else if (m.type === 'energy-pipe' || m.type === 'gear') {
        connectors.push(m);
      } else if (m.type === 'output-array' || m.type === 'trigger-switch' || m.type === 'shield-shell') {
        outputs.push(m);
      } else {
        connectors.push(m);
      }
    });
    
    return [cores, runes, connectors, outputs];
  };
  
  const getTotalModuleIndex = (categorized: typeof modules[], groupIndex: number, moduleIndex: number): number => {
    let total = 0;
    for (let i = 0; i < groupIndex; i++) {
      total += categorized[i].length;
    }
    return total + moduleIndex;
  };
  
  const getBorderColor = () => {
    switch (phase) {
      case 'failure':
        return '#ff3355';
      case 'overload':
        return '#ff6b35';
      default:
        return rarityColor;
    }
  };
  
  const getTitle = () => {
    switch (phase) {
      case 'failure':
        return '⚠ 机器故障';
      case 'overload':
        return '⚡ 系统过载';
      case 'charging':
        return 'CHARGING';
      case 'activating':
        return 'ACTIVATING';
      case 'online':
        return 'ONLINE';
      default:
        return 'CHARGING';
    }
  };
  
  const getSubtitle = () => {
    switch (phase) {
      case 'failure':
        return 'Machine failure detected - emergency shutdown';
      case 'overload':
        return 'Energy output exceeded - critical warning';
      case 'charging':
        return 'Initializing energy flow...';
      case 'activating':
        return `${currentModuleIndex + 1} / ${modules.length} modules engaged`;
      case 'online':
        return 'Machine ready for operation';
      default:
        return 'Initializing energy flow...';
    }
  };
  
  const getTitleColor = () => {
    switch (phase) {
      case 'failure':
        return '#ff3355';
      case 'overload':
        return '#ff6b35';
      default:
        return rarityColor;
    }
  };
  
  const getTitleAnimation = () => {
    if (phase === 'failure') {
      return 'titleShake 0.5s ease-in-out infinite';
    }
    if (phase === 'overload') {
      return 'titlePulse 0.3s ease-in-out infinite';
    }
    return 'none';
  };
  
  const getProgressGradient = () => {
    // Use faction color when available
    const primaryColor = dominantFaction ? `rgb(${factionRGB.r}, ${factionRGB.g}, ${factionRGB.b})` : rarityColor;
    
    switch (phase) {
      case 'failure':
        return 'linear-gradient(to right, #ff3355, #ff6b35)';
      case 'overload':
        return 'linear-gradient(to right, #ff6b35, #ffd700)';
      case 'online':
        return `linear-gradient(to right, ${primaryColor}, #00ffcc)`;
      default:
        return `linear-gradient(to right, ${primaryColor}, #00d4ff)`;
    }
  };
  
  const getCardShadow = () => {
    // Enhanced glow with faction color when available
    const glowColor = dominantFaction ? factionGlowColor : rarityColor;
    
    if (phase === 'failure') {
      return '0 0 30px rgba(255, 51, 85, 0.3)';
    }
    if (phase === 'overload') {
      return '0 0 30px rgba(255, 107, 53, 0.3)';
    }
    return `0 0 ${30 * glowRadius}px ${glowColor}`;
  };
  
  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${
        phase === 'failure' ? 'failure-mode' : ''
      } ${phase === 'overload' ? 'overload-mode' : ''}`}
      style={{
        transform: `translate(${viewportOffset.x + noiseOffset.x}px, ${viewportOffset.y + noiseOffset.y}px)`,
        transition: 'transform 50ms linear',
      }}
    >
      {/* Failure Particle Emitter - glitch particles for failure/overload (NEW in Round 109) */}
      {(phase === 'failure' || phase === 'overload') && (
        <FailureParticleEmitter
          active={true}
          width={typeof window !== 'undefined' ? window.innerWidth : 800}
          height={typeof window !== 'undefined' ? window.innerHeight : 600}
          intensity={phase === 'failure' ? 0.8 : 0.5}
          type={phase === 'failure' ? 'failure' : 'overload'}
        />
      )}
      
      {/* Enhanced Glitch/Noise overlay for failure/overload */}
      {showGlitch && (phase === 'failure' || phase === 'overload') && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255, 51, 85, ${NOISE_OPACITY}) 2px,
                rgba(255, 51, 85, ${NOISE_OPACITY}) 4px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                rgba(255, 51, 85, ${NOISE_OPACITY * 0.5}) 2px,
                rgba(255, 51, 85, ${NOISE_OPACITY * 0.5}) 4px
              )
            `,
            animation: 'glitchNoise 0.1s steps(2) infinite',
          }}
        />
      )}
      
      {/* Screen tear effect for failure mode */}
      {phase === 'failure' && (
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{
            background: `linear-gradient(
              to bottom,
              transparent 0%,
              rgba(255, 51, 85, ${NOISE_OPACITY * 2}) 48%,
              rgba(255, 51, 85, ${NOISE_OPACITY * 3}) 50%,
              rgba(255, 51, 85, ${NOISE_OPACITY * 2}) 52%,
              transparent 100%
            )`,
            transform: `translateY(${Math.random() * 20 - 10}px)`,
          }}
        />
      )}
      
      {/* Red flash overlay for failure mode (NEW in Round 109) */}
      {showRedFlash && (phase === 'failure' || phase === 'overload') && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundColor: phase === 'failure' ? 'rgba(255, 51, 85, 0.3)' : 'rgba(255, 107, 53, 0.2)',
            animation: 'redFlashPulse 0.15s ease-out',
          }}
        />
      )}
      
      {/* Ambient dust particles */}
      {showAmbientParticles && (
        <AmbientDustEmitter
          width={typeof window !== 'undefined' ? window.innerWidth : 800}
          height={typeof window !== 'undefined' ? window.innerHeight : 600}
          density={3}
          color={dominantFaction ? `rgb(${factionRGB.r}, ${factionRGB.g}, ${factionRGB.b})` : rarityColor}
          active={showAmbientParticles && phase !== 'failure' && phase !== 'overload'}
        />
      )}
      
      {/* Flash effect */}
      {showFlash && (
        <div
          className="fixed inset-0 bg-white pointer-events-none"
          style={{
            opacity: FLASH_OPACITY,
          }}
        />
      )}
      
      {/* Completion particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full bg-white pointer-events-none"
          style={{
            left: `calc(50% + ${Math.cos((particle.angle * Math.PI) / 180) * particle.distance}px)`,
            top: `calc(50% + ${Math.sin((particle.angle * Math.PI) / 180) * particle.distance}px)`,
            width: particle.size,
            height: particle.size,
            opacity: 1 - particle.distance / 200,
            boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, 0.8)`,
          }}
        />
      ))}
      
      {/* Vignette overlay - enhanced with effects utility */}
      {phase !== 'idle' && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent ${50 - vignetteOpacity * 30}%, ${getVignetteColor(machineState as any)} ${vignetteOpacity})`,
            transition: `opacity ${200}ms ease-out`,
          }}
        />
      )}
      
      {/* Main card with enhanced glow */}
      <div 
        className="relative w-96 bg-[#121826] border-2 rounded-xl p-6 shadow-2xl"
        style={{
          borderColor: getBorderColor(),
          boxShadow: getCardShadow(),
          opacity: flicker && (phase === 'failure' || phase === 'overload') ? 0.6 : 1,
          transition: `opacity ${FLICKER_INTERVAL}ms`,
        }}
      >
        <button
          onClick={handleSkip}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors ${phase === 'failure' ? 'failure-close' : ''}`}
        >
          ✕
        </button>
        
        <div className="text-center mb-6">
          <h2 
            className="text-xl font-bold mb-1"
            style={{
              color: getTitleColor(),
              animation: getTitleAnimation(),
            }}
          >
            {getTitle()}
          </h2>
          <p className="text-sm text-[#9ca3af]">
            {getSubtitle()}
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-3 bg-[#1e2a42] rounded-full overflow-hidden mb-4">
          <div
            className="absolute inset-y-0 left-0 transition-all duration-300 ease-out"
            style={{ 
              width: `${progress}%`,
              background: getProgressGradient(),
            }}
          />
          <div
            className="absolute top-0 bottom-0 w-4 bg-white/50 blur-sm"
            style={{ 
              left: `calc(${progress}% - 8px)`,
              opacity: progress > 0 && progress < 100 ? 1 : 0,
            }}
          />
        </div>
        
        {/* Phase indicators */}
        {phase !== 'failure' && phase !== 'overload' && (
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1" style={{ color: progress >= 0 ? (dominantFaction ? `rgb(${factionRGB.r}, ${factionRGB.g}, ${factionRGB.b})` : rarityColor) : '#4a5568' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: progress >= 0 ? (dominantFaction ? `rgb(${factionRGB.r}, ${factionRGB.g}, ${factionRGB.b})` : rarityColor) : '#4a5568' }} />
              Charging
            </div>
            <div className="flex items-center gap-1" style={{ color: progress >= 30 ? '#00ffcc' : '#4a5568' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: progress >= 30 ? '#00ffcc' : '#4a5568' }} />
              Activating
            </div>
            <div className="flex items-center gap-1" style={{ color: progress >= 80 ? '#22c55e' : '#4a5568' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: progress >= 80 ? '#22c55e' : '#4a5568' }} />
              Online
            </div>
          </div>
        )}
        
        {/* Failure details with enhanced glitch text */}
        {phase === 'failure' && (
          <div className="mt-4 p-3 bg-[#7f1d1d]/30 rounded-lg border border-[#ff3355]/30">
            <div className="flex items-center gap-2 text-[#ff3355]">
              <span className="text-xl">⚠</span>
              <span className="text-sm font-medium glitch-text">System failure detected</span>
            </div>
            <div className="mt-2 text-xs text-[#9ca3af]">
              <p>• Energy circuit interrupted</p>
              <p>• Module coordination failed</p>
              <p>• Emergency shutdown activated</p>
            </div>
          </div>
        )}
        
        {/* Overload details with enhanced visual */}
        {phase === 'overload' && (
          <div className="mt-4 p-3 bg-[#78350f]/30 rounded-lg border border-[#ff6b35]/30">
            <div className="flex items-center gap-2 text-[#ff6b35]">
              <span className="text-xl">⚡</span>
              <span className="text-sm font-medium">Critical energy warning</span>
            </div>
            <div className="mt-2 text-xs text-[#9ca3af]">
              <p>• Energy output exceeded safe threshold</p>
              <p>• Overload protection activated</p>
              <p>• System will auto-restart</p>
            </div>
          </div>
        )}
        
        {/* Module status during activation */}
        {phase === 'activating' && modules.length > 0 && (
          <div className="mt-4 p-3 bg-[#0a0e17] rounded-lg">
            <p className="text-xs text-[#4a5568] mb-2">Module Status:</p>
            <div className="flex flex-wrap gap-1">
              {modules.map((mod, index) => {
                const isActive = index <= currentModuleIndex;
                const moduleColor = getModuleActivationColor(mod.type);
                return (
                  <span
                    key={mod.instanceId}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: isActive ? `${moduleColor}20` : '#1e2a42',
                      color: isActive ? moduleColor : '#4a5568',
                      boxShadow: isActive ? `0 0 8px ${moduleColor}40` : 'none',
                    }}
                  >
                    {mod.type.split('-').map(w => w[0].toUpperCase()).join('') || '??'}
                  </span>
                );
              })}
            </div>
            <p className="text-[10px] text-[#6b7280] mt-2">
              {currentModuleIndex < modules.filter(m => ['core-furnace', 'stabilizer-core', 'void-siphon'].includes(m.type)).length 
                ? '→ Core modules activating...' 
                : currentModuleIndex < modules.filter(m => ['rune-node', 'amplifier-crystal', 'phase-modulator'].includes(m.type)).length + 3
                ? '→ Rune modules engaging...'
                : '→ Connectors syncing...'}
            </p>
          </div>
        )}
        
        <p className="text-xs text-[#4a5568] text-center mt-4">
          Click ✕ or wait to continue
        </p>
      </div>
      
      {/* Phase-specific overlays */}
      {phase === 'online' && (
        <div
          className="fixed inset-0 bg-white pointer-events-none"
          style={{
            animation: 'flash 0.3s ease-out forwards',
          }}
        />
      )}
      
      {phase === 'failure' && (
        <div
          className="fixed inset-0 bg-[#ff3355] pointer-events-none"
          style={{
            animation: 'failureFlash 0.15s ease-out infinite',
            opacity: flicker ? 0.3 : 0,
          }}
        />
      )}
      
      {phase === 'overload' && (
        <div
          className="fixed inset-0 bg-[#ff6b35] pointer-events-none"
          style={{
            animation: 'overloadPulse 0.3s ease-in-out infinite',
            opacity: flicker ? 0.1 : 0,
          }}
        />
      )}
      
      <style>{`
        @keyframes flash {
          0% { opacity: 0.3; }
          100% { opacity: 0; }
        }
        @keyframes failureFlash {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0; }
        }
        @keyframes overloadPulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        @keyframes titleShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes titlePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes glitchNoise {
          0% { transform: translate(2px, 1px); }
          25% { transform: translate(-2px, -1px); }
          50% { transform: translate(1px, 2px); }
          75% { transform: translate(-1px, -2px); }
          100% { transform: translate(2px, 1px); }
        }
        @keyframes redFlashPulse {
          0% { opacity: ${RED_FLASH_OPACITY}; }
          100% { opacity: 0; }
        }
        .glitch-text {
          animation: glitchText 0.3s steps(2) infinite;
        }
        @keyframes glitchText {
          0% { text-shadow: 2px 0 #ff3355, -2px 0 #00ffcc; }
          25% { text-shadow: -2px 0 #ff3355, 2px 0 #00ffcc; }
          50% { text-shadow: 1px 2px #ff3355, -1px -2px #00ffcc; }
          75% { text-shadow: -1px -2px #ff3355, 1px 2px #00ffcc; }
          100% { text-shadow: 2px 0 #ff3355, -2px 0 #00ffcc; }
        }
      `}</style>
    </div>
  );
}

function getModuleActivationColor(moduleType: string): string {
  if (['core-furnace', 'stabilizer-core', 'void-siphon'].includes(moduleType)) {
    return '#00d4ff';
  }
  if (['rune-node', 'amplifier-crystal', 'phase-modulator'].includes(moduleType)) {
    return '#a855f7';
  }
  if (['energy-pipe', 'gear'].includes(moduleType)) {
    return '#7c3aed';
  }
  return '#22c55e';
}
