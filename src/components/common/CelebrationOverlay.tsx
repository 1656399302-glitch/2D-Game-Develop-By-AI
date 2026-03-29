/**
 * Celebration Overlay Component
 * 
 * Provides animated celebration effects for:
 * - Challenge completion (confetti burst)
 * - Recipe unlock (glow animation)
 * - Achievement unlock (toast with badge)
 */

import React, { useEffect, useState, useCallback } from 'react';

export interface CelebrationConfig {
  type: 'challenge' | 'recipe' | 'achievement';
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
  badgeIcon?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
  shape: 'square' | 'circle' | 'star';
}

interface ConfettiProps {
  colors?: string[];
  particleCount?: number;
  duration?: number;
}

const DEFAULT_COLORS = ['#f59e0b', '#fbbf24', '#fcd34d', '#00d4ff', '#a855f7', '#22c55e', '#ef4444'];

export function Confetti({ colors = DEFAULT_COLORS, particleCount = 50, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 4,
      velocityY: Math.random() * 3 + 2,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: (['square', 'circle', 'star'] as const)[Math.floor(Math.random() * 3)],
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => setIsActive(false), duration);
    return () => clearTimeout(timer);
  }, [colors, particleCount, duration]);

  // Animate particles
  useEffect(() => {
    if (!isActive) return;

    const animationId = requestAnimationFrame(function animate() {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.velocityX * 0.1,
        y: p.y + p.velocityY * 0.3,
        rotation: p.rotation + p.rotationSpeed,
        velocityY: p.velocityY + 0.05, // gravity
      })));

      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationId);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[200]">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute transition-transform"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.shape !== 'star' ? particle.color : undefined,
            borderRadius: particle.shape === 'circle' ? '50%' : '2px',
            transform: `rotate(${particle.rotation}deg)`,
            boxShadow: `0 0 ${particle.size}px ${particle.color}`,
          }}
        >
          {particle.shape === 'star' && (
            <svg viewBox="0 0 24 24" fill={particle.color} style={{ width: '100%', height: '100%' }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

interface GlowAnimationProps {
  color?: string;
  children: React.ReactNode;
}

export function GlowAnimation({ color = '#f59e0b', children }: GlowAnimationProps) {
  return (
    <div
      className="relative"
      style={{
        animation: 'glow-pulse 2s ease-in-out infinite',
      }}
    >
      <div
        className="absolute inset-0 blur-xl opacity-50"
        style={{ background: `radial-gradient(circle, ${color}60 0%, transparent 70%)` }}
      />
      <div className="relative z-10">{children}</div>
      <style>{`
        @keyframes glow-pulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.05);
            filter: brightness(1.2);
          }
        }
      `}</style>
    </div>
  );
}

interface AchievementToastProps {
  title: string;
  subtitle?: string;
  icon: string;
  badgeIcon?: string;
  color?: string;
  duration?: number;
  onClose?: () => void;
}

export function AchievementToast({
  title,
  subtitle,
  icon,
  badgeIcon,
  color = '#f59e0b',
  duration = 4000,
  onClose,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 500);

    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-[201] max-w-sm w-full
        transform transition-all duration-500 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div
        className="relative overflow-hidden rounded-xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #121826 100%)',
          border: `1px solid ${color}50`,
          boxShadow: `0 0 30px ${color}30, 0 10px 40px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse at top left, ${color} 0%, transparent 50%)`,
          }}
        />

        <div className="relative p-4 flex items-start gap-4">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
            style={{
              background: `linear-gradient(135deg, ${color}30, ${color}10)`,
              border: `2px solid ${color}50`,
            }}
          >
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color }}
              >
                Achievement Unlocked
              </span>
            </div>
            <h4 className="text-white font-bold text-lg truncate">{title}</h4>
            {subtitle && (
              <p className="text-gray-400 text-sm truncate">{subtitle}</p>
            )}
          </div>

          {/* Badge */}
          {badgeIcon && (
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{
                background: `${color}30`,
                border: `1px solid ${color}50`,
              }}
            >
              {badgeIcon}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div
          className="h-1"
          style={{
            background: `${color}20`,
          }}
        >
          <div
            className="h-full"
            style={{
              background: `linear-gradient(90deg, ${color}, ${color}80)`,
              animation: `toast-progress ${duration}ms linear`,
            }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => {
              setIsVisible(false);
              onClose?.();
            }, 300);
          }}
          className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

interface ChallengeCompletionOverlayProps {
  config: CelebrationConfig;
  onClose?: () => void;
}

export function ChallengeCompletionOverlay({ config, onClose }: ChallengeCompletionOverlayProps) {
  const [showContent, setShowContent] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate celebration particles
    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      color: config.color,
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 2,
      velocityY: (Math.random() - 0.5) * 2,
      rotationSpeed: (Math.random() - 0.5) * 5,
      shape: (['square', 'circle', 'star'] as const)[Math.floor(Math.random() * 3)],
    }));
    setParticles(newParticles);

    // Show content after animation starts
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, [config.color]);

  const handleClose = useCallback(() => {
    setShowContent(false);
    if (onClose) {
      setTimeout(onClose, 300);
    }
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-float-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.shape !== 'star' ? particle.color : undefined,
              borderRadius: particle.shape === 'circle' ? '50%' : '2px',
              transform: `rotate(${particle.rotation}deg)`,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              animationDuration: `${2 + Math.random() * 2}s`,
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          >
            {particle.shape === 'star' && (
              <svg viewBox="0 0 24 24" fill={particle.color} style={{ width: '100%', height: '100%' }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Central Content */}
      <div
        className={`
          relative w-full max-w-md mx-4 transition-all duration-300
          ${showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
        `}
      >
        {/* Glow Effect */}
        <div
          className="absolute inset-0 blur-2xl opacity-50"
          style={{
            background: `radial-gradient(circle, ${config.color}40 0%, transparent 70%)`,
          }}
        />

        {/* Card */}
        <div
          className="relative bg-[#121826] border rounded-2xl p-8 shadow-2xl"
          style={{
            borderColor: `${config.color}50`,
          }}
        >
          {/* Decorative Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-2xl" style={{ borderColor: config.color }} />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-2xl" style={{ borderColor: config.color }} />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-2xl" style={{ borderColor: config.color }} />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-2xl" style={{ borderColor: config.color }} />

          {/* Badge Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              {/* Rotating Ring */}
              <div
                className="w-24 h-24 rounded-full border-4 border-dashed animate-spin-slow"
                style={{ 
                  borderColor: `${config.color}50`,
                  animationDuration: '8s'
                }}
              />
              {/* Inner Badge */}
              <div
                className="absolute inset-0 flex items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${config.color}, ${config.color}aa)`,
                }}
              >
                <span className="text-4xl">{config.icon}</span>
              </div>
              {/* Glow */}
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-50"
                style={{
                  background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)`,
                  transform: 'scale(1.5)',
                }}
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-2">
            <h2
              className="text-2xl font-bold animate-pulse"
              style={{ color: config.color }}
            >
              {config.title}
            </h2>
          </div>

          {/* Subtitle */}
          {config.subtitle && (
            <div className="text-center mb-6">
              <p className="text-lg text-white font-semibold">{config.subtitle}</p>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleClose}
            className="w-full py-3 px-6 rounded-lg font-bold text-white transition-all transform hover:scale-105 hover:opacity-90"
            style={{
              background: `linear-gradient(135deg, ${config.color}, ${config.color}aa)`,
            }}
          >
            Continue
          </button>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes float-particle {
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
        .animate-float-particle {
          animation: float-particle 3s ease-out forwards;
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

/**
 * Recipe unlock glow animation component
 */
interface RecipeUnlockGlowProps {
  recipeName: string;
  color?: string;
  onAnimationComplete?: () => void;
}

export function RecipeUnlockGlow({ recipeName, color = '#a855f7', onAnimationComplete }: RecipeUnlockGlowProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
      <div
        className="relative text-center animate-recipe-glow"
        style={{
          animation: 'recipe-glow 2.5s ease-out forwards',
        }}
      >
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-0"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            animation: 'ring-expand 2s ease-out forwards',
          }}
        />

        {/* Icon */}
        <div
          className="relative w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: `linear-gradient(135deg, ${color}30, ${color}10)`,
            border: `2px solid ${color}50`,
            boxShadow: `0 0 40px ${color}40`,
          }}
        >
          <span className="text-5xl">✨</span>
        </div>

        {/* Text */}
        <h3 className="text-2xl font-bold text-white mb-2">
          Recipe Unlocked!
        </h3>
        <p className="text-lg" style={{ color }}>
          {recipeName}
        </p>
      </div>

      <style>{`
        @keyframes recipe-glow {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          20% {
            opacity: 1;
            transform: scale(1.1);
          }
          40% {
            transform: scale(1);
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: scale(1.2) translateY(-20px);
          }
        }
        @keyframes ring-expand {
          0% {
            transform: scale(0);
            opacity: 0.8;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default {
  Confetti,
  GlowAnimation,
  AchievementToast,
  ChallengeCompletionOverlay,
  RecipeUnlockGlow,
};
