import { useMemo } from 'react';

interface TutorialSpotlightProps {
  targetRect: DOMRect | null;
  isTransitioning: boolean;
}

interface GlowBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function TutorialSpotlight({
  targetRect,
  isTransitioning,
}: TutorialSpotlightProps) {
  // Glow effect bounds
  const glowPaths = useMemo((): GlowBounds | null => {
    if (!targetRect) return null;

    const expansion = 8;

    const x = targetRect.left - expansion;
    const y = targetRect.top - expansion;
    const w = targetRect.width + expansion * 2;
    const h = targetRect.height + expansion * 2;

    return { x, y, w, h };
  }, [targetRect]);

  if (!targetRect) {
    // No spotlight - just show a subtle full overlay
    return (
      <div
        className={`fixed inset-0 z-[999] bg-black/60 transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Decorative corner runes */}
        <svg className="absolute top-4 left-4 w-12 h-12 opacity-20" viewBox="0 0 24 24">
          <path
            d="M0,12 L12,0 M4,12 L12,4 M8,12 L12,8 M12,0 L12,12 L0,12"
            stroke="#7c3aed"
            strokeWidth="1"
            fill="none"
          />
        </svg>
        <svg className="absolute top-4 right-4 w-12 h-12 opacity-20" viewBox="0 0 24 24">
          <path
            d="M12,12 L0,0 M8,0 L0,8 M4,0 L0,4 M0,12 L12,0"
            stroke="#7c3aed"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  const svgWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const svgHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const rectX = targetRect.left - 8;
  const rectY = targetRect.top - 8;
  const rectWidth = targetRect.width + 16;
  const rectHeight = targetRect.height + 16;

  return (
    <div
      className={`fixed inset-0 z-[999] transition-opacity duration-300 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ pointerEvents: 'none' }}
    >
      {/* SVG mask overlay */}
      <svg
        width={svgWidth}
        height={svgHeight}
        className="absolute inset-0"
      >
        <defs>
          {/* Main mask to cut out the spotlight area */}
          <mask id="tutorial-spotlight-mask">
            {/* White = visible (unmasked), Black = hidden (masked) */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black rectangle cuts out the spotlight area */}
            <rect
              x={rectX}
              y={rectY}
              width={rectWidth}
              height={rectHeight}
              rx="12"
              ry="12"
              fill="black"
            />
          </mask>
        </defs>

        {/* The dimmed overlay with mask applied */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#tutorial-spotlight-mask)"
        />
      </svg>

      {/* Glow border around spotlight */}
      {glowPaths && (
        <div
          className="absolute border-2 border-[#7c3aed]/60 rounded-xl transition-all duration-300"
          style={{
            left: glowPaths.x - 4,
            top: glowPaths.y - 4,
            width: glowPaths.w + 8,
            height: glowPaths.h + 8,
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.4), inset 0 0 20px rgba(124, 58, 237, 0.1)',
            animation: 'tutorial-glow-pulse 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Animated particles around spotlight */}
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Top-left corner */}
        <circle
          cx={targetRect.left - 20}
          cy={targetRect.top - 20}
          r="3"
          fill="#7c3aed"
          opacity={0.6}
          className="animate-float"
        />
        {/* Top-right corner */}
        <circle
          cx={targetRect.right + 20}
          cy={targetRect.top - 20}
          r="2"
          fill="#a855f7"
          opacity={0.5}
          className="animate-float-delayed"
        />
        {/* Bottom-left corner */}
        <circle
          cx={targetRect.left - 20}
          cy={targetRect.bottom + 20}
          r="2"
          fill="#c084fc"
          opacity={0.5}
          className="animate-float-delayed-2"
        />
        {/* Bottom-right corner */}
        <circle
          cx={targetRect.right + 20}
          cy={targetRect.bottom + 20}
          r="3"
          fill="#7c3aed"
          opacity={0.6}
          className="animate-float"
        />
      </svg>

      <style>{`
        @keyframes tutorial-glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(124, 58, 237, 0.4), inset 0 0 20px rgba(124, 58, 237, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(124, 58, 237, 0.6), inset 0 0 30px rgba(124, 58, 237, 0.2);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-5px) scale(1.1);
            opacity: 0.9;
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(5px) scale(0.9);
            opacity: 0.8;
          }
        }
        
        @keyframes float-delayed-2 {
          0%, 100% {
            transform: translateX(0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translateX(3px) scale(1.05);
            opacity: 0.7;
          }
        }
        
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 2.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        
        .animate-float-delayed-2 {
          animation: float-delayed-2 2.2s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
