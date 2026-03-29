import { useEffect, useState } from 'react';
import { Challenge, getDifficultyColor } from '../../types/challenges';

interface ChallengeCelebrationProps {
  challenge: Challenge;
  onClose: () => void;
}

/**
 * Animated celebration overlay shown when a challenge is completed
 */
export function ChallengeCelebration({ challenge, onClose }: ChallengeCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Generate particles after mount
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      color: ['#f59e0b', '#fbbf24', '#fcd34d', '#00d4ff', '#a855f7'][
        Math.floor(Math.random() * 5)
      ],
      duration: Math.random() * 2 + 1,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);

    // Show content after animation starts
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShowContent(false);
    setTimeout(onClose, 200);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
          />
        ))}
      </div>

      {/* Central Content */}
      <div
        className={`relative w-full max-w-md mx-4 transition-all duration-300 ${
          showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        {/* Glow Effect */}
        <div
          className="absolute inset-0 blur-2xl opacity-50"
          style={{
            background: `radial-gradient(circle, ${getDifficultyColor(challenge.difficulty)}40 0%, transparent 70%)`,
          }}
        />

        {/* Card */}
        <div className="relative bg-[#121826] border border-[#f59e0b]/50 rounded-2xl p-8 shadow-2xl">
          {/* Decorative Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#f59e0b] rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#f59e0b] rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#f59e0b] rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#f59e0b] rounded-br-2xl" />

          {/* Badge Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              {/* Rotating Ring */}
              <div
                className="w-24 h-24 rounded-full border-4 border-dashed border-[#f59e0b]/50 animate-spin-slow"
                style={{ animationDuration: '8s' }}
              />
              {/* Inner Badge */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] flex items-center justify-center shadow-lg">
                  <span className="text-4xl">🏆</span>
                </div>
              </div>
              {/* Glow */}
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-50"
                style={{
                  background: `radial-gradient(circle, #f59e0b 0%, transparent 70%)`,
                  transform: 'scale(1.5)',
                }}
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-[#f59e0b] animate-pulse">
              CHALLENGE COMPLETE!
            </h2>
          </div>

          {/* Challenge Name */}
          <div className="text-center mb-6">
            <p className="text-lg text-white font-semibold">{challenge.title}</p>
          </div>

          {/* Reward Section */}
          <div className="bg-[#0a0e17] rounded-xl p-4 mb-6 border border-[#1e2a42]">
            <p className="text-xs text-[#4a5568] uppercase tracking-wider mb-2 text-center">
              Reward Unlocked
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">
                {challenge.reward.type === 'badge' ? '🎖️' : '⭐'}
              </span>
              <div className="text-left">
                <p className="text-[#fbbf24] font-semibold">
                  {challenge.reward.displayName}
                </p>
                <p className="text-xs text-[#9ca3af]">
                  {challenge.reward.description}
                </p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#0a0e17] font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-all transform hover:scale-105"
          >
            Continue
          </button>
        </div>
      </div>

      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float 3s ease-out forwards;
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
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

export default ChallengeCelebration;
