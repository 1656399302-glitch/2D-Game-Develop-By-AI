import { useEffect, useState, useCallback } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { getConnectionFlowOrder } from '../../utils/connectionEngine';

interface ActivationOverlayProps {
  onComplete: () => void;
}

export function ActivationOverlay({ onComplete }: ActivationOverlayProps) {
  const [phase, setPhase] = useState<'charging' | 'active' | 'complete'>('charging');
  const [progress, setProgress] = useState(0);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(-1);
  
  const modules = useMachineStore((state) => state.modules);
  const setMachineState = useMachineStore((state) => state.setMachineState);
  
  // Get activation order based on connections
  const activationOrder = getConnectionFlowOrder(modules, []);
  
  const handleSkip = useCallback(() => {
    setMachineState('idle');
    onComplete();
  }, [setMachineState, onComplete]);
  
  useEffect(() => {
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
            onComplete();
          }, 300);
        }
      }
      
      if (progress < 100) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [phase, activationOrder, setMachineState, onComplete, progress]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-96 bg-[#121826] border border-[#00d4ff] rounded-xl p-6 shadow-2xl shadow-[#00d4ff]/20">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors"
        >
          ✕
        </button>
        
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#00d4ff] mb-1">
            {phase === 'charging' && '⚡ CHARGING SYSTEM'}
            {phase === 'active' && '⚙ ACTIVATING MACHINE'}
            {phase === 'complete' && '✓ ACTIVATION COMPLETE'}
          </h2>
          <p className="text-sm text-[#9ca3af]">
            {phase === 'charging' && 'Initializing energy flow...'}
            {phase === 'active' && `${currentModuleIndex + 1} / ${activationOrder.length} modules engaged`}
            {phase === 'complete' && 'Machine ready for operation'}
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-3 bg-[#1e2a42] rounded-full overflow-hidden mb-4">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00d4ff] to-[#00ffcc] transition-all duration-300 ease-out"
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
      
      <style>{`
        @keyframes flash {
          0% { opacity: 0.3; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
