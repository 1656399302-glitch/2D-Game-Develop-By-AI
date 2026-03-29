import { useEffect, useRef } from 'react';
import { useMachineStore } from '../../store/useMachineStore';

/**
 * RandomForgeToast - Displays a notification when a random machine is forged.
 * 
 * FIXED: Removed the empty useEffect and ensured proper cleanup patterns.
 * The component now uses a controlled render pattern to avoid DOM manipulation errors.
 */
export function RandomForgeToast() {
  const visible = useMachineStore((state) => state.randomForgeToastVisible);
  const message = useMachineStore((state) => state.randomForgeToastMessage);
  
  // Use ref to track the toast element for animation purposes
  const toastRef = useRef<HTMLDivElement>(null);
  
  // Clean up any ongoing animations when component unmounts or visibility changes
  useEffect(() => {
    // If toast becomes invisible, ensure any pending animations are cancelled
    if (!visible && toastRef.current) {
      // Reset animation state to prevent DOM conflicts on re-render
      toastRef.current.style.animation = 'none';
    }
  }, [visible]);
  
  // Early return pattern - return null BEFORE any hooks that depend on visibility
  // This prevents React from trying to reconcile a partially-mounted component
  if (!visible || !message) {
    return null;
  }
  
  return (
    <div 
      ref={toastRef}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
      style={{
        animation: 'slideDown 0.3s ease-out forwards',
      }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] border border-[#a78bfa] rounded-xl shadow-2xl shadow-purple-900/50">
        <div className="flex-shrink-0 text-2xl" style={{ animation: 'pulse 1s ease-in-out infinite' }}>
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
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
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
