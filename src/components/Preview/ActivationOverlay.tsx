import { useEffect, useState, useCallback, useRef } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { getRarityColor } from '../../utils/activationChoreographer';
import { Rarity } from '../../types';

interface ActivationOverlayProps {
  onComplete: () => void;
}

type Phase = 'charging' | 'activating' | 'online' | 'failure' | 'overload';

// Shake intensity constants (in pixels)
const FAILURE_SHAKE_INTENSITY = 8;
const OVERLOAD_SHAKE_INTENSITY = 8;
const NORMAL_SHAKE_INTENSITY = 4;
const CHARGING_SHAKE_INTENSITY = 2; // Subtle 2px shake during charging

// Overload vignette
const VIGNETTE_TARGET_OPACITY = 0.4;
const VIGNETTE_ANIMATION_DURATION = 200;

// Flicker interval
const FLICKER_INTERVAL = 50;

// Flash effect
const FLASH_DURATION = 100; // 100ms white flash at 0.3 opacity
const FLASH_OPACITY = 0.3;

// Particle burst at completion
const PARTICLE_COUNT = 8;
const PARTICLE_DURATION = 800;

export function ActivationOverlay({ onComplete }: ActivationOverlayProps) {
  const [phase, setPhase] = useState<Phase>('charging');
  const [progress, setProgress] = useState(0);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(-1);
  const [flicker, setFlicker] = useState(false);
  const [vignetteOpacity, setVignetteOpacity] = useState(0);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; vx: number; vy: number; size: number }[]>([]);
  const [showFlash, setShowFlash] = useState(false);
  const [particles, setParticles] = useState<{ id: number; angle: number; distance: number; size: number }[]>([]);
  
  const flickerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sparkAnimationRef = useRef<number | null>(null);
  const particleAnimationRef = useRef<number | null>(null);
  
  const modules = useMachineStore((state) => state.modules);
  const machineState = useMachineStore((state) => state.machineState);
  const setMachineState = useMachineStore((state) => state.setMachineState);
  const setShowActivation = useMachineStore((state) => state.setShowActivation);
  const generatedAttributes = useMachineStore((state) => state.generatedAttributes);
  
  // Get rarity from generated attributes or default to common
  const rarity: Rarity = generatedAttributes?.rarity || 'common';
  const rarityColor = getRarityColor(rarity);
  
  // Trigger flash effect
  const triggerFlash = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => {
      setShowFlash(false);
    }, FLASH_DURATION);
  }, []);
  
  // Generate particle burst at completion
  const generateParticles = useCallback(() => {
    const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      angle: (i * 360) / PARTICLE_COUNT + (Math.random() * 20 - 10), // Spread evenly with slight variance
      distance: 0,
      size: 4 + Math.random() * 4, // 4-8px
    }));
    setParticles(newParticles);
    
    // Animate particles radiating outward
    const startTime = performance.now();
    const animateParticles = (time: number) => {
      const elapsed = time - startTime;
      if (elapsed > PARTICLE_DURATION) {
        setParticles([]);
        return;
      }
      
      const progress = elapsed / PARTICLE_DURATION;
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          distance: easedProgress * 150, // Radiate 150px
        }))
      );
      
      particleAnimationRef.current = requestAnimationFrame(animateParticles);
    };
    
    particleAnimationRef.current = requestAnimationFrame(animateParticles);
  }, []);
  
  // Generate sparks for overload effect
  const generateSparks = useCallback(() => {
    const newSparks = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50 + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * -2 - 1, // upward with gravity
      size: 3 + Math.random() * 3,
    }));
    setSparks(newSparks);
    
    // Animate sparks
    const startTime = performance.now();
    const animateSparks = (time: number) => {
      const elapsed = time - startTime;
      if (elapsed > 500) {
        setSparks([]);
        return;
      }
      
      setSparks((prev) =>
        prev.map((spark) => ({
          ...spark,
          x: spark.x + spark.vx,
          y: spark.y + spark.vy + (elapsed / 500) * 2, // add gravity
          vy: spark.vy + 0.1, // gravity acceleration
        }))
      );
      
      sparkAnimationRef.current = requestAnimationFrame(animateSparks);
    };
    
    sparkAnimationRef.current = requestAnimationFrame(animateSparks);
  }, []);
  
  const handleSkip = useCallback(() => {
    // Clean up intervals
    if (flickerIntervalRef.current) {
      clearInterval(flickerIntervalRef.current);
    }
    if (sparkAnimationRef.current) {
      cancelAnimationFrame(sparkAnimationRef.current);
    }
    if (particleAnimationRef.current) {
      cancelAnimationFrame(particleAnimationRef.current);
    }
    
    setMachineState('idle');
    setShowActivation(false);
    onComplete();
  }, [setMachineState, setShowActivation, onComplete]);
  
  // Effect to handle failure/overload modes
  useEffect(() => {
    if (machineState === 'failure') {
      setPhase('failure');
      setProgress(100);
      setVignetteOpacity(VIGNETTE_TARGET_OPACITY);
      
      // Start flicker effect at ~50ms intervals
      flickerIntervalRef.current = setInterval(() => {
        setFlicker((prev) => !prev);
      }, FLICKER_INTERVAL);
      
      // Generate initial sparks
      generateSparks();
      
      return () => {
        if (flickerIntervalRef.current) {
          clearInterval(flickerIntervalRef.current);
        }
        if (sparkAnimationRef.current) {
          cancelAnimationFrame(sparkAnimationRef.current);
        }
      };
    } else if (machineState === 'overload') {
      setPhase('overload');
      setProgress(100);
      setVignetteOpacity(VIGNETTE_TARGET_OPACITY);
      
      // Pulsing effect for overload at ~50ms intervals
      flickerIntervalRef.current = setInterval(() => {
        setFlicker((prev) => !prev);
      }, FLICKER_INTERVAL);
      
      // Generate initial sparks
      generateSparks();
      
      return () => {
        if (flickerIntervalRef.current) {
          clearInterval(flickerIntervalRef.current);
        }
        if (sparkAnimationRef.current) {
          cancelAnimationFrame(sparkAnimationRef.current);
        }
      };
    }
  }, [machineState, generateSparks]);
  
  // Normal activation flow with enhanced effects
  useEffect(() => {
    if (machineState !== 'charging' && machineState !== 'active' && machineState !== 'shutdown') {
      return;
    }
    
    setMachineState('charging');
    
    // Timing based on spec: CHARGING (0-30%), ACTIVATING (30-80%), ONLINE (80-100%)
    // Total activation time for 4-module machine should be <2 seconds
    const chargingDuration = 600; // 0-30% in ~600ms
    const activatingDuration = 1000; // 30-80% in ~1000ms
    const onlineDuration = 400; // 80-100% in ~400ms
    
    let startTime = Date.now();
    let animationFrame: number;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (phase === 'charging') {
        const progressPercent = Math.min(elapsed / chargingDuration, 1);
        setProgress(progressPercent * 30);
        
        if (progressPercent >= 1) {
          // Flash on transition to activating
          triggerFlash();
          setPhase('activating');
          setMachineState('active');
          startTime = Date.now();
          
          // Stagger module animations based on module type and category
          // Sequence: core modules → rune modules → connectors → output array
          const categorizedModules = categorizeModulesForActivation(modules);
          
          categorizedModules.forEach((group, groupIndex) => {
            group.forEach((_, moduleIndex) => {
              const totalIndex = getTotalModuleIndex(categorizedModules, groupIndex, moduleIndex);
              setTimeout(() => {
                setCurrentModuleIndex(totalIndex);
              }, moduleIndex * (activatingDuration / (modules.length || 1)) * 0.5);
            });
          });
        }
      } else if (phase === 'activating') {
        const progressPercent = Math.min(elapsed / activatingDuration, 1);
        setProgress(30 + progressPercent * 50); // 30-80%
        
        // Cycle through modules
        if (modules.length > 0) {
          const moduleProgress = (elapsed / activatingDuration) * modules.length;
          setCurrentModuleIndex(Math.min(Math.floor(moduleProgress), modules.length - 1));
        }
        
        if (progressPercent >= 1) {
          // Flash on transition to online
          triggerFlash();
          setPhase('online');
          setMachineState('shutdown');
          startTime = Date.now();
          setProgress(80);
          
          // Generate particle burst at completion
          generateParticles();
        }
      } else if (phase === 'online') {
        const progressPercent = Math.min(elapsed / onlineDuration, 1);
        setProgress(80 + progressPercent * 20); // 80-100%
        
        if (progressPercent >= 1) {
          setProgress(100);
          setTimeout(() => {
            setMachineState('idle');
            setShowActivation(false);
            onComplete();
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
  }, [phase, modules.length, setMachineState, setShowActivation, onComplete, progress, machineState, triggerFlash, generateParticles]);
  
  // Categorize modules for activation sequence
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
        connectors.push(m); // Default to connectors
      }
    });
    
    return [cores, runes, connectors, outputs];
  };
  
  // Get total index across all categorized groups
  const getTotalModuleIndex = (categorized: typeof modules[], groupIndex: number, moduleIndex: number): number => {
    let total = 0;
    for (let i = 0; i < groupIndex; i++) {
      total += categorized[i].length;
    }
    return total + moduleIndex;
  };
  
  // Determine border color based on phase
  const getBorderColor = () => {
    switch (phase) {
      case 'failure':
        return 'border-[#ff3355]';
      case 'overload':
        return 'border-[#ff6b35]';
      default:
        return `border-[${rarityColor}]`;
    }
  };
  
  // Determine title based on phase
  const getTitle = () => {
    switch (phase) {
      case 'failure':
        return '⚠ SYSTEM FAILURE';
      case 'overload':
        return '⚡ CRITICAL OVERLOAD';
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
  
  // Determine subtitle based on phase
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
  
  // Get shake animation CSS based on phase
  const getShakeAnimation = () => {
    if (phase === 'failure') {
      return `failureShake ${1000 / FAILURE_SHAKE_INTENSITY}s linear infinite`;
    }
    if (phase === 'overload') {
      return `overloadShake ${1000 / OVERLOAD_SHAKE_INTENSITY}s ease-in-out infinite`;
    }
    if (phase === 'charging') {
      return `chargingShake ${1000 / CHARGING_SHAKE_INTENSITY}s ease-in-out infinite`;
    }
    if (phase === 'activating') {
      return `normalShake ${1000 / NORMAL_SHAKE_INTENSITY}s ease-in-out infinite`;
    }
    return 'none';
  };
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${
        phase === 'failure' ? 'failure-mode' : ''
      } ${phase === 'overload' ? 'overload-mode' : ''}`}
      style={{
        animation: getShakeAnimation(),
      }}
    >
      {/* White flash overlay for state transitions */}
      {showFlash && (
        <div
          className="fixed inset-0 bg-white pointer-events-none"
          style={{
            opacity: FLASH_OPACITY,
          }}
        />
      )}
      
      {/* Particle burst at completion */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full bg-white pointer-events-none"
          style={{
            left: `calc(50% + ${Math.cos((particle.angle * Math.PI) / 180) * particle.distance}px)`,
            top: `calc(50% + ${Math.sin((particle.angle * Math.PI) / 180) * particle.distance}px)`,
            width: particle.size,
            height: particle.size,
            opacity: 1 - particle.distance / 150,
            boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, 0.8)`,
          }}
        />
      ))}
      
      {/* Red vignette for overload/failure */}
      {phase === 'failure' || phase === 'overload' ? (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 30%, rgba(255, 51, 85, ${vignetteOpacity}) 100%)`,
            transition: `opacity ${VIGNETTE_ANIMATION_DURATION}ms ease-out`,
          }}
        />
      ) : null}
      
      {/* Sparks for overload */}
      {phase === 'overload' && sparks.map((spark) => (
        <div
          key={spark.id}
          className="absolute rounded-full bg-[#ffd700] pointer-events-none"
          style={{
            left: `calc(50% + ${spark.x}vw)`,
            top: `calc(50% + ${spark.y}vh)`,
            width: spark.size,
            height: spark.size,
            boxShadow: '0 0 10px #ffd700',
          }}
        />
      ))}
      
      <div 
        className={`relative w-96 bg-[#121826] border-2 ${getBorderColor()} rounded-xl p-6 shadow-2xl ${
          phase === 'failure' ? 'shadow-[#ff3355]/20' : phase === 'overload' ? 'shadow-[#ff6b35]/20' : `shadow-[${rarityColor}]/20`
        }`}
        style={{
          opacity: flicker && (phase === 'failure' || phase === 'overload') ? 0.6 : 1,
          transition: `opacity ${FLICKER_INTERVAL}ms`,
        }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors ${phase === 'failure' ? 'failure-close' : ''}`}
        >
          ✕
        </button>
        
        {/* Title */}
        <div className="text-center mb-6">
          <h2 
            className={`text-xl font-bold mb-1 ${
              phase === 'failure' ? 'text-[#ff3355]' : 
              phase === 'overload' ? 'text-[#ff6b35]' : 
              `text-[${rarityColor}]`
            }`}
            style={{
              animation: phase === 'failure' ? 'shake 0.5s ease-in-out infinite' : 
                         phase === 'overload' ? 'pulseGlow 0.3s ease-in-out infinite' : 
                         'none',
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
            className={`absolute inset-y-0 left-0 transition-all duration-300 ease-out ${
              phase === 'failure' 
                ? 'bg-gradient-to-r from-[#ff3355] to-[#ff6b35]' 
                : phase === 'overload'
                ? 'bg-gradient-to-r from-[#ff6b35] to-[#ffd700]'
                : phase === 'online'
                ? `bg-gradient-to-r from-[${rarityColor}] to-[#00ffcc]`
                : `bg-gradient-to-r from-[${rarityColor}] to-[#00d4ff]`
            }`}
            style={{ width: `${progress}%` }}
          />
          {/* Glow effect */}
          <div
            className="absolute top-0 bottom-0 w-4 bg-white/50 blur-sm"
            style={{ 
              left: `calc(${progress}% - 8px)`,
              opacity: progress > 0 && progress < 100 ? 1 : 0,
            }}
          />
        </div>
        
        {/* Phase indicators with rarity color */}
        {phase !== 'failure' && phase !== 'overload' && (
          <div className="flex justify-between text-xs">
            <div className={`flex items-center gap-1 ${progress >= 0 ? `text-[${rarityColor}]` : 'text-[#4a5568]'}`}>
              <span className={`w-2 h-2 rounded-full ${progress >= 0 ? `bg-[${rarityColor}]` : 'bg-[#4a5568]'}`} />
              Charging
            </div>
            <div className={`flex items-center gap-1 ${progress >= 30 ? 'text-[#00ffcc]' : 'text-[#4a5568]'}`}>
              <span className={`w-2 h-2 rounded-full ${progress >= 30 ? 'bg-[#00ffcc]' : 'bg-[#4a5568]'}`} />
              Activating
            </div>
            <div className={`flex items-center gap-1 ${progress >= 80 ? 'text-[#22c55e]' : 'text-[#4a5568]'}`}>
              <span className={`w-2 h-2 rounded-full ${progress >= 80 ? 'bg-[#22c55e]' : 'bg-[#4a5568]'}`} />
              Online
            </div>
          </div>
        )}
        
        {/* Failure/Overload specific UI */}
        {phase === 'failure' && (
          <div className="mt-4 p-3 bg-[#7f1d1d]/30 rounded-lg border border-[#ff3355]/30">
            <div className="flex items-center gap-2 text-[#ff3355]">
              <span className="text-xl">⚠</span>
              <span className="text-sm font-medium">System failure detected</span>
            </div>
            <div className="mt-2 text-xs text-[#9ca3af]">
              <p>• Energy circuit interrupted</p>
              <p>• Module coordination failed</p>
              <p>• Emergency shutdown activated</p>
            </div>
          </div>
        )}
        
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
        
        {/* Module status with categorized activation */}
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
                    className={`text-xs px-2 py-1 rounded ${
                      isActive
                        ? `bg-[${moduleColor}]/20 text-[${moduleColor}]`
                        : 'bg-[#1e2a42] text-[#4a5568]'
                    }`}
                  >
                    {mod.type.split('-').map(w => w[0].toUpperCase()).join('') || '??'}
                  </span>
                );
              })}
            </div>
            {/* Activation sequence indicator */}
            <p className="text-[10px] text-[#6b7280] mt-2">
              {currentModuleIndex < modules.filter(m => ['core-furnace', 'stabilizer-core', 'void-siphon'].includes(m.type)).length 
                ? '→ Core modules activating...' 
                : currentModuleIndex < modules.filter(m => ['rune-node', 'amplifier-crystal', 'phase-modulator'].includes(m.type)).length + 3
                ? '→ Rune modules engaging...'
                : '→ Connectors syncing...'}
            </p>
          </div>
        )}
        
        {/* Skip hint */}
        <p className="text-xs text-[#4a5568] text-center mt-4">
          Click ✕ or wait to continue
        </p>
      </div>
      
      {/* Screen flash effect on complete */}
      {phase === 'online' && (
        <div
          className="fixed inset-0 bg-white pointer-events-none"
          style={{
            animation: 'flash 0.3s ease-out forwards',
          }}
        />
      )}
      
      {/* Red flash for failure */}
      {phase === 'failure' && (
        <div
          className="fixed inset-0 bg-[#ff3355] pointer-events-none"
          style={{
            animation: 'failureFlash 0.15s ease-out infinite',
            opacity: flicker ? 0.3 : 0,
          }}
        />
      )}
      
      {/* Screen shake for overload */}
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
        
        /* Charging shake - subtle 2px oscillation */
        @keyframes chargingShake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-${CHARGING_SHAKE_INTENSITY}px, ${CHARGING_SHAKE_INTENSITY}px); }
          50% { transform: translate(${CHARGING_SHAKE_INTENSITY}px, -${CHARGING_SHAKE_INTENSITY}px); }
          75% { transform: translate(-${CHARGING_SHAKE_INTENSITY}px, -${CHARGING_SHAKE_INTENSITY}px); }
        }
        
        /* Normal shake animation */
        @keyframes normalShake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-${NORMAL_SHAKE_INTENSITY}px, ${NORMAL_SHAKE_INTENSITY}px); }
          50% { transform: translate(${NORMAL_SHAKE_INTENSITY}px, -${NORMAL_SHAKE_INTENSITY}px); }
          75% { transform: translate(-${NORMAL_SHAKE_INTENSITY}px, -${NORMAL_SHAKE_INTENSITY}px); }
        }
        
        /* Enhanced shake animations with configurable intensity */
        @keyframes failureShake {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-${FAILURE_SHAKE_INTENSITY}px, ${FAILURE_SHAKE_INTENSITY}px); }
          20% { transform: translate(${FAILURE_SHAKE_INTENSITY}px, -${FAILURE_SHAKE_INTENSITY}px); }
          30% { transform: translate(-${FAILURE_SHAKE_INTENSITY}px, 0); }
          40% { transform: translate(${FAILURE_SHAKE_INTENSITY}px, ${FAILURE_SHAKE_INTENSITY}px); }
          50% { transform: translate(0, -${FAILURE_SHAKE_INTENSITY}px); }
          60% { transform: translate(-${FAILURE_SHAKE_INTENSITY}px, ${FAILURE_SHAKE_INTENSITY}px); }
          70% { transform: translate(${FAILURE_SHAKE_INTENSITY}px, 0); }
          80% { transform: translate(-${FAILURE_SHAKE_INTENSITY}px, -${FAILURE_SHAKE_INTENSITY}px); }
          90% { transform: translate(${FAILURE_SHAKE_INTENSITY}px, ${FAILURE_SHAKE_INTENSITY}px); }
        }
        
        @keyframes overloadShake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-${OVERLOAD_SHAKE_INTENSITY}px, ${OVERLOAD_SHAKE_INTENSITY}px); }
          50% { transform: translate(${OVERLOAD_SHAKE_INTENSITY}px, -${OVERLOAD_SHAKE_INTENSITY}px); }
          75% { transform: translate(-${OVERLOAD_SHAKE_INTENSITY}px, -${OVERLOAD_SHAKE_INTENSITY}px); }
        }
        
        .failure-mode {
          animation: failureShake ${1000 / FAILURE_SHAKE_INTENSITY}s linear infinite;
        }
        .overload-mode {
          animation: overloadShake ${1000 / OVERLOAD_SHAKE_INTENSITY}s ease-in-out infinite;
        }
        
        .failure-close:hover {
          background: #7f1d1d !important;
          color: #ff3355 !important;
        }
      `}</style>
    </div>
  );
}

// Helper function to get color for module during activation
function getModuleActivationColor(moduleType: string): string {
  if (['core-furnace', 'stabilizer-core', 'void-siphon'].includes(moduleType)) {
    return '#00d4ff'; // Core modules - cyan
  }
  if (['rune-node', 'amplifier-crystal', 'phase-modulator'].includes(moduleType)) {
    return '#a855f7'; // Rune modules - purple
  }
  if (['energy-pipe', 'gear'].includes(moduleType)) {
    return '#7c3aed'; // Connectors - violet
  }
  return '#22c55e'; // Output modules - green
}
