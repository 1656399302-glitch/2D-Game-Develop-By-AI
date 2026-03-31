import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useTutorialStore } from '../../store/useTutorialStore';
import { useMachineStore } from '../../store/useMachineStore';
import { WELCOME_CONTENT } from '../../data/tutorialSteps';

interface WelcomeModalProps {
  onStartTutorial: () => void;
  onSkip: () => void;
}

const TUTORIAL_STORAGE_KEY = 'arcane-codex-tutorial';

/**
 * FIX (Round 60): Dedicated key for dismissed state to ensure synchronous localStorage
 * writes work correctly. This avoids the Zustand persist async write race condition.
 */
const WELCOME_DISMISSED_KEY = 'arcane-codex-welcome-dismissed';

/**
 * Synchronously read localStorage to get the initial state.
 * This avoids the Zustand hydration race condition where the store defaults
 * to false/true before localStorage is read.
 * 
 * CRITICAL: Zustand persist wraps persisted state in a 'state' object.
 * Actual localStorage format: {"state":{"hasSeenWelcome":true,"isTutorialEnabled":false},"version":0}
 * We must read parsed.state?.hasSeenWelcome, not parsed.hasSeenWelcome.
 * 
 * FIX (Round 60): Also check dedicated WELCOME_DISMISSED_KEY for immediate dismissal state.
 */
export const getInitialTutorialState = (): { hasSeenWelcome: boolean; isTutorialEnabled: boolean } => {
  try {
    // FIX (Round 60): Check dedicated dismissed key FIRST - this is set synchronously
    // when user dismisses the modal, bypassing Zustand's async persist
    const dismissedState = localStorage.getItem(WELCOME_DISMISSED_KEY);
    if (dismissedState === 'true') {
      return { hasSeenWelcome: true, isTutorialEnabled: false };
    }

    const stored = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Zustand persist wraps state in a 'state' key
      const hasSeenWelcome = parsed.state?.hasSeenWelcome === true;
      // isTutorialEnabled defaults to true, but is stored as false when user skips
      const isTutorialEnabled = parsed.state?.isTutorialEnabled !== false; // defaults to true
      return { hasSeenWelcome, isTutorialEnabled };
    }
  } catch {
    // If localStorage is unavailable or parse fails, use defaults
  }
  return { hasSeenWelcome: false, isTutorialEnabled: true };
};

/**
 * Check if there is saved canvas state in localStorage.
 */
const hasSavedCanvasState = (): boolean => {
  try {
    return localStorage.getItem('arcane-canvas-state') !== null;
  } catch {
    return false;
  }
};

/**
 * Mark welcome modal as dismissed in localStorage.
 * FIX (Round 60): This sets a dedicated key synchronously to ensure
 * the modal doesn't re-appear even if Zustand persist hasn't written yet.
 */
const markWelcomeDismissed = () => {
  try {
    localStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
  } catch {
    // If localStorage fails, continue with Zustand store update
  }
};

/**
 * Clear the dismissed state (for testing purposes).
 */
export const clearWelcomeDismissedState = () => {
  try {
    localStorage.removeItem(WELCOME_DISMISSED_KEY);
  } catch {
    // Ignore errors
  }
};

export function WelcomeModal({ onStartTutorial, onSkip }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; duration: number }>>([]);

  // FIX (Round 60): Track modal dismissal in a ref that survives re-renders
  const modalDismissedRef = useRef(false);

  // FIX (Round 60): Always compute visibility directly from localStorage
  // This ensures we use the same source of truth and avoids Zustand hydration issues
  const shouldShowModal = useMemo(() => {
    // Don't show if already dismissed this session
    if (modalDismissedRef.current) {
      return false;
    }
    
    // FIX (Round 60): Read from localStorage synchronously - check dismissed key first
    const { hasSeenWelcome, isTutorialEnabled } = getInitialTutorialState();
    
    // Don't show if already seen before
    if (hasSeenWelcome) {
      return false;
    }
    
    // Don't show if tutorial is disabled
    if (!isTutorialEnabled) {
      return false;
    }
    
    return true;
  }, []); // Empty deps - computed once on mount

  // FIX (Round 60): Trigger entrance animation on mount - empty deps to prevent loops
  // Use a ref to track if we've already shown the animation
  const animationTriggeredRef = useRef(false);
  useEffect(() => {
    if (!shouldShowModal || animationTriggeredRef.current) {
      return;
    }
    
    animationTriggeredRef.current = true;
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []); // Empty deps - runs once on mount

  // FIX (Round 60): Generate particles on mount when modal should show - empty deps
  const particlesGeneratedRef = useRef(false);
  useEffect(() => {
    if (!shouldShowModal || particlesGeneratedRef.current) {
      return;
    }
    
    particlesGeneratedRef.current = true;
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []); // Empty deps - runs once on mount

  const handleStartTutorial = () => {
    modalDismissedRef.current = true;
    setIsVisible(false);
    // FIX (Round 60): Mark as dismissed synchronously before calling onStartTutorial
    markWelcomeDismissed();
    setTimeout(() => {
      onStartTutorial();
    }, 300);
  };

  const handleSkip = useCallback(() => {
    // FIX (Round 60): Mark as dismissed IMMEDIATELY via localStorage
    // This ensures the modal won't re-appear even if Zustand persist hasn't completed
    markWelcomeDismissed();
    
    // Also mark in session ref to prevent re-render showing modal
    modalDismissedRef.current = true;
    
    // Close the modal with animation
    setIsVisible(false);
    setTimeout(() => {
      onSkip();
    }, 300);
  }, [onSkip]);

  // FIX (Round 60): Handle backdrop click - dismiss modal
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only dismiss if clicking directly on backdrop, not on modal content
    if (e.target === e.currentTarget) {
      handleSkip();
    }
  }, [handleSkip]);

  // FIX (Round 60): Don't render if we shouldn't show the modal
  // This check uses only localStorage values to avoid store-triggered re-renders
  if (!shouldShowModal) {
    return null;
  }

  return (
    // FIX (Round 60): Backdrop with z-40, pointer-events handled properly
    <div 
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full bg-[#7c3aed]"
            style={{
              left: `${particle.x}%`,
              bottom: '-10px',
              animation: `particle-rise ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* Modal container - z-41 above backdrop */}
      <div
        className={`relative w-full max-w-2xl mx-4 transition-all duration-500 transform z-41 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking modal
        role="document"
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#7c3aed]/20 via-[#a855f7]/20 to-[#7c3aed]/20 rounded-2xl blur-xl" />

        {/* Main modal */}
        <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-2xl border border-[#7c3aed]/40 shadow-2xl shadow-purple-900/30 overflow-hidden">
          {/* Decorative top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7c3aed] via-[#a855f7] via-[#c084fc] to-[#7c3aed]" />

          {/* Close button - FIX (Round 60): Added explicit close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1e2a42]/50 hover:bg-[#1e2a42] flex items-center justify-center text-[#9ca3af] hover:text-white transition-colors z-10"
            aria-label="关闭欢迎弹窗"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Content */}
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              {/* Magic circle decoration */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <svg
                  className="absolute inset-0 w-full h-full animate-spin-slow"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="0.5"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="25"
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">🔮</span>
                </div>
              </div>

              <h1 id="welcome-modal-title" className="text-3xl font-bold text-white mb-2">
                {WELCOME_CONTENT.title}
              </h1>
              <p className="text-[#a855f7] text-lg">{WELCOME_CONTENT.subtitle}</p>
            </div>

            {/* Description */}
            <p className="text-[#9ca3af] text-center mb-8 leading-relaxed">
              {WELCOME_CONTENT.description}
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {WELCOME_CONTENT.features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-[#0a0e17]/50 rounded-xl p-4 border border-[#1e2a42] hover:border-[#7c3aed]/30 transition-colors"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <h3 className="text-white font-medium text-sm">{feature.title}</h3>
                      <p className="text-[#6b7280] text-xs mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartTutorial}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-white
                           bg-gradient-to-r from-[#7c3aed] to-[#6d28d9]
                           hover:from-[#8b5cf6] hover:to-[#7c3aed]
                           border border-[#a78bfa]/50
                           shadow-lg shadow-purple-900/40
                           transition-all duration-200
                           flex items-center justify-center gap-2
                           hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                {WELCOME_CONTENT.startTutorial}
              </button>

              <button
                onClick={handleSkip}
                className="flex-1 px-6 py-3 rounded-xl font-medium
                           bg-[#121826] text-[#9ca3af]
                           hover:bg-[#1a1a2e] hover:text-white
                           border border-[#1e2a42] hover:border-[#7c3aed]/30
                           transition-all duration-200
                           flex items-center justify-center gap-2"
              >
                {WELCOME_CONTENT.skipTutorial}
              </button>
            </div>
          </div>

          {/* Footer decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7c3aed]/40 to-transparent" />

          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-[#7c3aed]/30 rounded-tl" />
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-[#7c3aed]/30 rounded-tr" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-[#7c3aed]/30 rounded-bl" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-[#7c3aed]/30 rounded-br" />
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes particle-rise {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-50vh) scale(1.5);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Hook to manage welcome modal handlers
 * 
 * FIX (Round 33): This hook now provides only handlers, not visibility state.
 * Visibility is determined by localStorage directly in App.tsx and WelcomeModal.
 * This prevents cascading updates from Zustand hydration timing.
 */
export function useWelcomeModal() {
  // FIX: Get store actions via refs instead of direct subscription
  // This prevents the store from triggering re-renders during hydration
  const setHasSeenWelcomeRef = useRef(useTutorialStore.getState().setHasSeenWelcome);
  const setTutorialEnabledRef = useRef(useTutorialStore.getState().setTutorialEnabled);
  const restoreSavedStateRef = useRef(useMachineStore.getState().restoreSavedState);
  
  // FIX: Sync refs with store state to ensure we have the latest actions
  // but don't trigger re-renders when they change
  useEffect(() => {
    setHasSeenWelcomeRef.current = useTutorialStore.getState().setHasSeenWelcome;
    setTutorialEnabledRef.current = useTutorialStore.getState().setTutorialEnabled;
    restoreSavedStateRef.current = useMachineStore.getState().restoreSavedState;
  }, []);

  const handleStartTutorial = useCallback(() => {
    // Use ref to call the action - no state subscription
    setHasSeenWelcomeRef.current(true);
    // Don't restore saved state when starting tutorial - user wants to learn first
  }, []);

  const handleSkip = useCallback(() => {
    // Use refs to call the actions - no state subscription
    setHasSeenWelcomeRef.current(true);
    setTutorialEnabledRef.current(false);
    
    // Restore saved state if it exists
    if (hasSavedCanvasState()) {
      restoreSavedStateRef.current();
    }
  }, []);

  return {
    handleStartTutorial,
    handleSkip,
  };
}
