import { useEffect, useState, useMemo } from 'react';
import { COMPLETION_CONTENT } from '../../data/tutorialSteps';

interface TutorialCompletionProps {
  onContinue: () => void;
  onReplay: () => void;
}

export function TutorialCompletion({ onContinue, onReplay }: TutorialCompletionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  // Generate confetti particles
  const confetti = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: ['#7c3aed', '#a855f7', '#c084fc', '#00d4ff', '#f59e0b', '#22c55e'][Math.floor(Math.random() * 6)],
      size: 4 + Math.random() * 8,
      rotation: Math.random() * 360,
    }));
  }, []);

  // Generate stars
  const stars = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 3,
      duration: 1 + Math.random() * 2,
    }));
  }, []);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 50);

    // Stop confetti after 4 seconds
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    setIsVisible(false);
    setTimeout(onContinue, 300);
  };

  const handleReplay = () => {
    setIsVisible(false);
    setTimeout(onReplay, 300);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confetti.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-sm"
              style={{
                left: `${particle.x}%`,
                top: '-20px',
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                animation: `confetti-fall ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
                transform: `rotate(${particle.rotation}deg)`,
                opacity: 0.8,
              }}
            />
          ))}
        </div>
      )}

      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              animation: `star-twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
              opacity: 0.3,
            }}
          />
        ))}
      </div>

      {/* Glow effect */}
      <div className="absolute w-[600px] h-[600px] bg-[#7c3aed]/20 rounded-full blur-[100px]" />

      {/* Main modal */}
      <div
        className={`relative w-full max-w-lg mx-4 transition-all duration-500 transform ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Badge ring */}
        <div className="relative w-40 h-40 mx-auto mb-8">
          {/* Rotating outer ring */}
          <svg
            className="absolute inset-0 w-full h-full animate-spin-slow"
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="url(#completionGradient)"
              strokeWidth="3"
              strokeDasharray="20 10"
            />
            <defs>
              <linearGradient id="completionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner ring */}
          <svg
            className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] animate-spin-reverse"
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke="#c084fc"
              strokeWidth="1"
              strokeDasharray="5 5"
              opacity="0.5"
            />
          </svg>

          {/* Center badge */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] flex items-center justify-center shadow-lg shadow-purple-900/50">
            <span className="text-5xl">🏆</span>
          </div>

          {/* Pulsing glow */}
          <div className="absolute inset-0 rounded-full bg-[#7c3aed]/30 animate-pulse-glow" />
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {COMPLETION_CONTENT.title}
          </h1>
          <p className="text-xl text-[#a855f7]">{COMPLETION_CONTENT.subtitle}</p>
        </div>

        {/* Message */}
        <p className="text-[#9ca3af] text-center mb-8 leading-relaxed">
          {COMPLETION_CONTENT.message}
        </p>

        {/* Tips */}
        <div className="bg-[#0a0e17]/50 rounded-xl p-4 mb-8 border border-[#1e2a42]">
          <h3 className="text-sm font-medium text-[#c084fc] mb-3 text-center">Pro Tips</h3>
          <div className="space-y-2">
            {COMPLETION_CONTENT.tips.map((tip, index) => (
              <p
                key={index}
                className="text-xs text-[#9ca3af] flex items-start gap-2"
              >
                <span className="text-[#7c3aed]">✦</span>
                {tip}
              </p>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleContinue}
            className="flex-1 px-6 py-3 rounded-xl font-bold text-white
                       bg-gradient-to-r from-[#22c55e] to-[#16a34a]
                       hover:from-[#4ade80] hover:to-[#22c55e]
                       shadow-lg shadow-green-900/40
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
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            {COMPLETION_CONTENT.continue}
          </button>

          <button
            onClick={handleReplay}
            className="flex-1 px-6 py-3 rounded-xl font-medium
                       bg-[#121826] text-[#9ca3af]
                       hover:bg-[#1a1a2e] hover:text-white
                       border border-[#1e2a42] hover:border-[#7c3aed]/30
                       transition-all duration-200
                       flex items-center justify-center gap-2"
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
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            {COMPLETION_CONTENT.replayTutorial}
          </button>
        </div>

        {/* Decorative runes */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-4">
          {['⚙', '🔮', '⚡', '✨', '⚡', '🔮', '⚙'].map((rune, i) => (
            <span
              key={i}
              className="text-lg text-[#7c3aed]/40"
              style={{
                animation: `rune-float 3s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              {rune}
            </span>
          ))}
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes star-twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.5);
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
        
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(124, 58, 237, 0.6);
          }
        }
        
        @keyframes rune-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 6s linear infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
