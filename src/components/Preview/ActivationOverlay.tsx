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
const CHARGING_SHAKE_INTENSITY = 2;

// Overload vignette
const VIGNETTE_TARGET_OPACITY = 0.4;
const VIGNETTE_ANIMATION_DURATION = 200;

// Flicker interval
const FLICKER_INTERVAL = 50;

// Flash effect
const FLASH_DURATION = 100;
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
  
  const rarity: Rarity = generatedAttributes?.rarity || 'common';
  const rarityColor = getRarityColor(rarity);
  
  const triggerFlash = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => {
      setShowFlash(false);
    }, FLASH_DURATION);
  }, []);
  
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
      
      const progress = elapsed / PARTICLE_DURATION;
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          distance: easedProgress * 150,
        }))
      );
      
      particleAnimationRef.current = requestAnimationFrame(animateParticles);
    };
    
    particleAnimationRef.current = requestAnimationFrame(animateParticles);
  }, []);
  
  const generateSparks = useCallback(() => {
    const newSparks = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: 50 + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * -2 - 1,
      size: 3 + Math.random() * 3,
    }));
    setSparks(newSparks);
    
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
          y: spark.y + spark.vy + (elapsed / 500) * 2,
          vy: spark.vy + 0.1,
        }))
      );
      
      sparkAnimationRef.current = requestAnimationFrame(animateSparks);
    };
    
    sparkAnimationRef.current = requestAnimationFrame(animateSparks);
  }, []);
  
  const handleSkip = useCallback(() => {
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
  
  useEffect(() => {
    if (machineState === 'failure') {
      setPhase('failure');
      setProgress(100);
      setVignetteOpacity(VIGNETTE_TARGET_OPACITY);
      
      flickerIntervalRef.current = setInterval(() => {
        setFlicker((prev) => !prev);
      }, FLICKER_INTERVAL);
      
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
      
      flickerIntervalRef.current = setInterval(() => {
        setFlicker((prev) => !prev);
      }, FLICKER_INTERVAL);
      
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
  
  useEffect(() => {
    if (machineState !== 'charging' && machineState !== 'active' && machineState !== 'shutdown') {
      return;
    }
    
    setMachineState('charging');
    
    const chargingDuration = 600;
    const activatingDuration = 1000;
    const onlineDuration = 400;
    
    let startTime = Date.now();
    let animationFrame: number;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (phase === 'charging') {
        const progressPercent = Math.min(elapsed / chargingDuration, 1);
        setProgress(progressPercent * 30);
        
        if (progressPercent >= 1) {
          triggerFlash();
          setPhase('activating');
          setMachineState('active');
          startTime = Date.now();
          
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
        setProgress(30 + progressPercent * 50);
        
        if (modules.length > 0) {
          const moduleProgress = (elapsed / activatingDuration) * modules.length;
          setCurrentModuleIndex(Math.min(Math.floor(moduleProgress), modules.length - 1));
        }
        
        if (progressPercent >= 1) {
          triggerFlash();
          setPhase('online');
          setMachineState('shutdown');
          startTime = Date.now();
          setProgress(80);
          
          generateParticles();
        }
      } else if (phase === 'online') {
        const progressPercent = Math.min(elapsed / onlineDuration, 1);
        setProgress(80 + progressPercent * 20);
        
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
  
  const getShakeAnimation = () => {
    if (phase === 'failure') {
      return `failureShakeAnimation ${1000 / FAILURE_SHAKE_INTENSITY}s linear infinite`;
    }
    if (phase === 'overload') {
      return `overloadShakeAnimation ${1000 / OVERLOAD_SHAKE_INTENSITY}s ease-in-out infinite`;
    }
    if (phase === 'charging') {
      return `chargingShakeAnimation ${1000 / CHARGING_SHAKE_INTENSITY}s ease-in-out infinite`;
    }
    if (phase === 'activating') {
      return `normalShakeAnimation ${1000 / NORMAL_SHAKE_INTENSITY}s ease-in-out infinite`;
    }
    return 'none';
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
    switch (phase) {
      case 'failure':
        return 'linear-gradient(to right, #ff3355, #ff6b35)';
      case 'overload':
        return 'linear-gradient(to right, #ff6b35, #ffd700)';
      case 'online':
        return `linear-gradient(to right, ${rarityColor}, #00ffcc)`;
      default:
        return `linear-gradient(to right, ${rarityColor}, #00d4ff)`;
    }
  };
  
  const getCardShadow = () => {
    if (phase === 'failure') {
      return '0 0 20px rgba(255, 51, 85, 0.2)';
    }
    if (phase === 'overload') {
      return '0 0 20px rgba(255, 107, 53, 0.2)';
    }
    return `0 0 20px ${rarityColor}20`;
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
      {showFlash && (
        <div
          className="fixed inset-0 bg-white pointer-events-none"
          style={{
            opacity: FLASH_OPACITY,
          }}
        />
      )}
      
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
      
      {phase === 'failure' || phase === 'overload' ? (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 30%, rgba(255, 51, 85, ${vignetteOpacity}) 100%)`,
            transition: `opacity ${VIGNETTE_ANIMATION_DURATION}ms ease-out`,
          }}
        />
      ) : null}
      
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
        
        {phase !== 'failure' && phase !== 'overload' && (
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1" style={{ color: progress >= 0 ? rarityColor : '#4a5568' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: progress >= 0 ? rarityColor : '#4a5568' }} />
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
        @keyframes chargingShakeAnimation {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-2px, 2px); }
          50% { transform: translate(2px, -2px); }
          75% { transform: translate(-2px, -2px); }
        }
        @keyframes normalShakeAnimation {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-4px, 4px); }
          50% { transform: translate(4px, -4px); }
          75% { transform: translate(-4px, -4px); }
        }
        @keyframes failureShakeAnimation {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-8px, 8px); }
          20% { transform: translate(8px, -8px); }
          30% { transform: translate(-8px, 0); }
          40% { transform: translate(8px, 8px); }
          50% { transform: translate(0, -8px); }
          60% { transform: translate(-8px, 8px); }
          70% { transform: translate(8px, 0); }
          80% { transform: translate(-8px, -8px); }
          90% { transform: translate(8px, 8px); }
        }
        @keyframes overloadShakeAnimation {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-8px, 8px); }
          50% { transform: translate(8px, -8px); }
          75% { transform: translate(-8px, -8px); }
        }
        .failure-close:hover {
          background: #7f1d1d !important;
          color: #ff3355 !important;
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
