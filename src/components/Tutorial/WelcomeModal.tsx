import { useEffect, useState, useMemo } from 'react';
import { useTutorialStore } from '../../store/useTutorialStore';
import { WELCOME_CONTENT } from '../../data/tutorialSteps';

interface WelcomeModalProps {
  onStartTutorial: () => void;
  onSkip: () => void;
}

const TUTORIAL_STORAGE_KEY = 'arcane-codex-tutorial';

/**
 * Synchronously read localStorage to get the initial hasSeenWelcome state.
 * This avoids the Zustand hydration race condition where the store defaults
 * to false before localStorage is read.
 */
const getInitialHasSeenWelcome = (): boolean => {
  try {
    const stored = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.hasSeenWelcome === true;
    }
  } catch {
    // If localStorage is unavailable or parse fails, default to showing welcome
  }
  return false;
};

export function WelcomeModal({ onStartTutorial, onSkip }: WelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number; duration: number }>>([]);

  // Get initial state synchronously from localStorage to avoid hydration race
  const hasSeenWelcome = useMemo(() => getInitialHasSeenWelcome(), []);
  const [showModal, setShowModal] = useState(!hasSeenWelcome);

  // Also sync with store's isTutorialEnabled
  const isTutorialEnabled = useTutorialStore((state) => state.isTutorialEnabled);

  useEffect(() => {
    // Trigger entrance animation if we should show the modal
    if (showModal) {
      setTimeout(() => setIsVisible(true), 50);
    }

    // Generate floating particles
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
    }));
    setParticles(newParticles);
  }, [showModal]);

  const handleStartTutorial = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowModal(false);
      onStartTutorial();
    }, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowModal(false);
      onSkip();
    }, 300);
  };

  // Don't render if we shouldn't show the modal
  if (!showModal || !isTutorialEnabled) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
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

      {/* Modal container */}
      <div
        className={`relative w-full max-w-2xl mx-4 transition-all duration-500 transform ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#7c3aed]/20 via-[#a855f7]/20 to-[#7c3aed]/20 rounded-2xl blur-xl" />

        {/* Main modal */}
        <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-2xl border border-[#7c3aed]/40 shadow-2xl shadow-purple-900/30 overflow-hidden">
          {/* Decorative top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7c3aed] via-[#a855f7] via-[#c084fc] to-[#7c3aed]" />

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

              <h1 className="text-3xl font-bold text-white mb-2">
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

// Hook to manage welcome modal visibility
// IMPORTANT: This hook reads localStorage synchronously to avoid the Zustand
// hydration race condition where hasSeenWelcome defaults to false before
// the persisted state is loaded.
export function useWelcomeModal() {
  const setHasSeenWelcome = useTutorialStore((state) => state.setHasSeenWelcome);
  const setTutorialEnabled = useTutorialStore((state) => state.setTutorialEnabled);
  
  // Read localStorage synchronously to get the true initial state
  const hasSeenWelcome = useMemo(() => getInitialHasSeenWelcome(), []);
  
  // State for the modal visibility - starts as false if already seen
  const [showWelcome, setShowWelcome] = useState(!hasSeenWelcome);

  const handleStartTutorial = () => {
    setShowWelcome(false);
    setHasSeenWelcome(true);
  };

  const handleSkip = () => {
    setShowWelcome(false);
    setHasSeenWelcome(true);
    // CRITICAL FIX: Also disable tutorial so modal doesn't reappear on refresh
    setTutorialEnabled(false);
  };

  return {
    showWelcome,
    setShowWelcome,
    handleStartTutorial,
    handleSkip,
  };
}
