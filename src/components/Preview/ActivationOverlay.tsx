import { useEffect, useState, useCallback } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { getConnectionFlowOrder } from '../../utils/connectionEngine';

interface ActivationOverlayProps {
  onComplete: () => void;
}

type Phase = 'charging' | 'active' | 'complete' | 'failure' | 'overload';

export function ActivationOverlay({ onComplete }: ActivationOverlayProps) {
  const [phase, setPhase] = useState<Phase>('charging');
  const [progress, setProgress] = useState(0);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(-1);
  const [flicker, setFlicker] = useState(false);
  
  const modules = useMachineStore((state) => state.modules);
  const machineState = useMachineStore((state) => state.machineState);
  const setMachineState = useMachineStore((state) => state.setMachineState);
  const setShowActivation = useMachineStore((state) => state.setShowActivation);
  
  // Get activation order based on connections
  const activationOrder = getConnectionFlowOrder(modules, []);
  
  const handleSkip = useCallback(() => {
    setMachineState('idle');
    setShowActivation(false);
    onComplete();
  }, [setMachineState, setShowActivation, onComplete]);
  
  // Effect to handle failure/overload modes
  useEffect(() => {
    if (machineState === 'failure') {
      setPhase('failure');
      setProgress(100);
      // Start flicker effect
      const flickerInterval = setInterval(() => {
        setFlicker((prev) => !prev);
      }, 150);
      
      return () => clearInterval(flickerInterval);
    } else if (machineState === 'overload') {
      setPhase('overload');
      setProgress(100);
      
      // Pulsing effect for overload
      const pulseInterval = setInterval(() => {
        setFlicker((prev) => !prev);
      }, 300);
      
      return () => clearInterval(pulseInterval);
    }
  }, [machineState]);
  
  // Normal activation flow
  useEffect(() => {
    if (machineState !== 'charging' && machineState !== 'active' && machineState !== 'shutdown') {
      return;
    }
    
    setMachineState('charging');
    
    // Charging phase - 1 second
    const chargingDuration = 1000;
    const activeDuration = 3000;
    const completeDuration = 500;
    
    let startTime = Date.now();
    let animationFrame: number;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (phase === 'charging') {
        const progressPercent = Math.min(elapsed / chargingDuration, 1);
        setProgress(progressPercent * 33);
        
        if (progressPercent >= 1) {
          setPhase('active');
          setMachineState('active');
          startTime = Date.now();
          
          // Stagger module animations
          activationOrder.forEach((_, index) => {
            setTimeout(() => {
              setCurrentModuleIndex(index);
            }, index * (activeDuration / (activationOrder.length || 1)) * 0.5);
          });
        }
      } else if (phase === 'active') {
        const progressPercent = Math.min(elapsed / activeDuration, 1);
        setProgress(33 + progressPercent * 33);
        
        // Cycle through modules
        if (activationOrder.length > 0) {
          const moduleProgress = (elapsed / activeDuration) * activationOrder.length;
          setCurrentModuleIndex(Math.min(Math.floor(moduleProgress), activationOrder.length - 1));
        }
        
        if (progressPercent >= 1) {
          setPhase('complete');
          setMachineState('shutdown');
          startTime = Date.now();
          setProgress(66);
        }
      } else if (phase === 'complete') {
        const progressPercent = Math.min(elapsed / completeDuration, 1);
        setProgress(66 + progressPercent * 34);
        
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
  }, [phase, activationOrder, setMachineState, setShowActivation, onComplete, progress, machineState]);
  
  // Determine border color based on phase
  const getBorderColor = () => {
    switch (phase) {
      case 'failure':
        return 'border-[#ff3355]';
      case 'overload':
        return 'border-[#ff6b35]';
      default:
        return 'border-[#00d4ff]';
    }
  };
  
  // Determine title based on phase - FIXED: Correct Chinese text for failure/overload
  const getTitle = () => {
    switch (phase) {
      case 'failure':
        return '⚠ 机器故障'; // FIXED: Was '⚠ 系统过载'
      case 'overload':
        return '⚡ 系统过载'; // FIXED: Was '⚡ 临界警告'
      case 'charging':
        return '⚡ CHARGING SYSTEM';
      case 'active':
        return '⚙ ACTIVATING MACHINE';
      case 'complete':
        return '✓ ACTIVATION COMPLETE';
      default:
        return '⚡ CHARGING SYSTEM';
    }
  };
  
  // Determine subtitle based on phase
  const getSubtitle = () => {
    switch (phase) {
      case 'failure':
        return '机器故障 - 系统紧急关闭中...';
      case 'overload':
        return '能量过载 - 临界警告触发!';
      case 'charging':
        return 'Initializing energy flow...';
      case 'active':
        return `${currentModuleIndex + 1} / ${activationOrder.length} modules engaged`;
      case 'complete':
        return 'Machine ready for operation';
      default:
        return 'Initializing energy flow...';
    }
  };
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${phase === 'failure' ? 'failure-mode' : ''} ${phase === 'overload' ? 'overload-mode' : ''}`}
    >
      <div 
        className={`relative w-96 bg-[#121826] border-2 ${getBorderColor()} rounded-xl p-6 shadow-2xl ${phase === 'failure' ? 'shadow-[#ff3355]/20' : phase === 'overload' ? 'shadow-[#ff6b35]/20' : 'shadow-[#00d4ff]/20'}`}
        style={{
          opacity: flicker && (phase === 'failure' || phase === 'overload') ? 0.7 : 1,
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
            className={`text-xl font-bold mb-1 ${phase === 'failure' ? 'text-[#ff3355]' : phase === 'overload' ? 'text-[#ff6b35]' : 'text-[#00d4ff]'}`}
            style={{
              animation: phase === 'failure' ? 'shake 0.5s ease-in-out infinite' : phase === 'overload' ? 'pulseGlow 0.3s ease-in-out infinite' : 'none',
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
                : 'bg-gradient-to-r from-[#00d4ff] to-[#00ffcc]'
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
        
        {/* Phase indicators */}
        {phase !== 'failure' && phase !== 'overload' && (
          <div className="flex justify-between text-xs">
            <div className={`flex items-center gap-1 ${progress >= 0 ? 'text-[#00d4ff]' : 'text-[#4a5568]'}`}>
              <span className={`w-2 h-2 rounded-full ${progress >= 0 ? 'bg-[#00d4ff]' : 'bg-[#4a5568]'}`} />
              Charging
            </div>
            <div className={`flex items-center gap-1 ${progress >= 33 ? 'text-[#00ffcc]' : 'text-[#4a5568]'}`}>
              <span className={`w-2 h-2 rounded-full ${progress >= 33 ? 'bg-[#00ffcc]' : 'bg-[#4a5568]'}`} />
              Active
            </div>
            <div className={`flex items-center gap-1 ${progress >= 66 ? 'text-[#22c55e]' : 'text-[#4a5568]'}`}>
              <span className={`w-2 h-2 rounded-full ${progress >= 66 ? 'bg-[#22c55e]' : 'bg-[#4a5568]'}`} />
              Complete
            </div>
          </div>
        )}
        
        {/* Failure/Overload specific UI */}
        {phase === 'failure' && (
          <div className="mt-4 p-3 bg-[#7f1d1d]/30 rounded-lg border border-[#ff3355]/30">
            <div className="flex items-center gap-2 text-[#ff3355]">
              <span className="text-xl">⚠</span>
              <span className="text-sm font-medium">系统检测到致命故障</span>
            </div>
            <div className="mt-2 text-xs text-[#9ca3af]">
              <p>• 能量回路中断</p>
              <p>• 模块协调失败</p>
              <p>• 紧急停机协议已启动</p>
            </div>
          </div>
        )}
        
        {phase === 'overload' && (
          <div className="mt-4 p-3 bg-[#78350f]/30 rounded-lg border border-[#ff6b35]/30">
            <div className="flex items-center gap-2 text-[#ff6b35]">
              <span className="text-xl">⚡</span>
              <span className="text-sm font-medium">能量临界警告</span>
            </div>
            <div className="mt-2 text-xs text-[#9ca3af]">
              <p>• 能量输出超出安全阈值</p>
              <p>• 过载保护机制已激活</p>
              <p>• 系统将自动重启</p>
            </div>
          </div>
        )}
        
        {/* Module status */}
        {phase === 'active' && activationOrder.length > 0 && (
          <div className="mt-4 p-3 bg-[#0a0e17] rounded-lg">
            <p className="text-xs text-[#4a5568] mb-2">Module Status:</p>
            <div className="flex flex-wrap gap-1">
              {activationOrder.map((moduleId, index) => {
                const module = modules.find((m) => m.instanceId === moduleId);
                const isActive = index <= currentModuleIndex;
                return (
                  <span
                    key={moduleId}
                    className={`text-xs px-2 py-1 rounded ${
                      isActive
                        ? 'bg-[#00d4ff]/20 text-[#00d4ff]'
                        : 'bg-[#1e2a42] text-[#4a5568]'
                    }`}
                  >
                    {module?.type.split('-').map(w => w[0].toUpperCase()).join('') || '??'}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Skip hint */}
        <p className="text-xs text-[#4a5568] text-center mt-4">
          Click ✕ or wait to continue
        </p>
      </div>
      
      {/* Screen flash effect on complete */}
      {phase === 'complete' && (
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
        .failure-mode {
          animation: screenShake 0.1s ease-in-out infinite;
        }
        .overload-mode {
          animation: screenPulse 0.5s ease-in-out infinite;
        }
        @keyframes screenShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        @keyframes screenPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.01); }
        }
        .failure-close:hover {
          background: #7f1d1d !important;
          color: #ff3355 !important;
        }
      `}</style>
    </div>
  );
}
