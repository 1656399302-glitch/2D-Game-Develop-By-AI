import { useEffect } from 'react';
import { useMachineStore } from '../../store/useMachineStore';

export function RandomForgeToast() {
  const visible = useMachineStore((state) => state.randomForgeToastVisible);
  const message = useMachineStore((state) => state.randomForgeToastMessage);
  
  useEffect(() => {
    // Animation is handled by CSS
  }, []);
  
  if (!visible || !message) return null;
  
  return (
    <div 
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
      style={{
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border border-[#a78bfa] rounded-xl shadow-2xl shadow-purple-900/50">
        <div className="flex-shrink-0 text-2xl animate-pulse">
          🎲
        </div>
        <div>
          <p className="text-sm font-bold text-white">
            {message}
          </p>
          <p className="text-xs text-purple-200 mt-0.5">
            Machine has been randomly generated!
          </p>
        </div>
        
        {/* Animated particles effect */}
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div 
            className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-60"
            style={{
              left: '20%',
              top: '50%',
              animation: 'sparkle 1s ease-out infinite',
              animationDelay: '0ms',
            }}
          />
          <div 
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
            style={{
              left: '80%',
              top: '30%',
              animation: 'sparkle 1s ease-out infinite',
              animationDelay: '200ms',
            }}
          />
          <div 
            className="absolute w-1 h-1 bg-pink-400 rounded-full opacity-60"
            style={{
              left: '60%',
              top: '70%',
              animation: 'sparkle 1s ease-out infinite',
              animationDelay: '400ms',
            }}
          />
        </div>
      </div>
      
      <style>{`
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
        
        @keyframes sparkle {
          0% {
            opacity: 0;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-10px) scale(1.5);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px) scale(0);
          }
        }
      `}</style>
    </div>
  );
}
