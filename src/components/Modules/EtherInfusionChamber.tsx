interface EtherInfusionChamberProps {
  isActive: boolean;
  isCharging: boolean;
}

/**
 * Ether Infusion Chamber Module
 * A cylindrical chamber module with swirling ether effects
 * Size: 100x100
 * Ports: 2 inputs (left), 1 output (right)
 */
export function EtherInfusionChamberSVG({ isActive, isCharging }: EtherInfusionChamberProps) {
  const chamberColor = isActive ? '#f0abfc' : '#c084fc';
  const glowColor = isActive ? '#f5d0fe' : '#a855f7';
  const innerColor = isActive ? '#e879f9' : '#9333ea';
  const swirlColor = isActive ? '#faf5ff' : '#d8b4fe';

  // Chamber dimensions
  const centerX = 50;
  const centerY = 50;
  const outerRadius = 40;
  const innerRadius = 30;

  // Generate swirl paths for ether effect
  const swirlPaths = [
    // Outer swirl
    `M ${centerX} ${centerY - 25}
       Q ${centerX + 20} ${centerY - 15} ${centerX + 15} ${centerY + 10}
       Q ${centerX} ${centerY + 25} ${centerX - 15} ${centerY + 10}
       Q ${centerX - 20} ${centerY - 15} ${centerX} ${centerY - 25}`,
    // Inner swirl
    `M ${centerX} ${centerY - 15}
       Q ${centerX + 12} ${centerY - 8} ${centerX + 8} ${centerY + 5}
       Q ${centerX} ${centerY + 15} ${centerX - 8} ${centerY + 5}
       Q ${centerX - 12} ${centerY - 8} ${centerX} ${centerY - 15}`,
    // Core swirl
    `M ${centerX} ${centerY - 8}
       Q ${centerX + 5} ${centerY} ${centerX} ${centerY + 8}
       Q ${centerX - 5} ${centerY} ${centerX} ${centerY - 8}`,
  ];

  return (
    <g className="ether-infusion-chamber">
      {/* Definitions */}
      <defs>
        <filter id="ether-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isActive ? 5 : 2} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="ether-core-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity={isActive ? 0.9 : 0.6} />
          <stop offset="50%" stopColor={innerColor} stopOpacity={isActive ? 0.7 : 0.4} />
          <stop offset="100%" stopColor={chamberColor} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="chamber-shell-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={chamberColor} stopOpacity="0.3" />
          <stop offset="50%" stopColor={chamberColor} stopOpacity="0.1" />
          <stop offset="100%" stopColor={chamberColor} stopOpacity="0.3" />
        </linearGradient>
        <clipPath id="chamber-clip">
          <ellipse cx={centerX} cy={centerY} rx={outerRadius - 2} ry={outerRadius - 2} />
        </clipPath>
      </defs>

      {/* Outer chamber shell - elliptical */}
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={outerRadius}
        ry={outerRadius}
        fill="#1e1b4b"
        stroke={chamberColor}
        strokeWidth="2"
        opacity="0.9"
        filter="url(#ether-glow)"
      />

      {/* Chamber depth effect - inner shadow */}
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={outerRadius - 5}
        ry={outerRadius - 5}
        fill="none"
        stroke="#0f0f23"
        strokeWidth="3"
        opacity="0.5"
      />

      {/* Inner chamber area */}
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={innerRadius}
        ry={innerRadius}
        fill="url(#ether-core-gradient)"
        opacity={isActive ? 0.8 : 0.5}
      />

      {/* Chamber ring structure */}
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={innerRadius + 5}
        ry={innerRadius + 5}
        fill="none"
        stroke={chamberColor}
        strokeWidth="1.5"
        strokeDasharray="4 3"
        opacity="0.6"
        className={isActive ? 'animate-pulse' : ''}
      />

      {/* Swirling ether effect */}
      <g clipPath="url(#chamber-clip)">
        {/* Outer swirl layer */}
        <path
          d={swirlPaths[0]}
          fill="none"
          stroke={swirlColor}
          strokeWidth="2"
          strokeLinecap="round"
          opacity={isActive ? 0.8 : 0.4}
          className={isActive ? 'animate-swirl' : 'animate-swirl-slow'}
        />
        {/* Middle swirl layer */}
        <path
          d={swirlPaths[1]}
          fill="none"
          stroke={glowColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={isActive ? 0.7 : 0.3}
          className={isActive ? 'animate-swirl-reverse' : 'animate-swirl-slow-reverse'}
        />
        {/* Inner swirl layer */}
        <path
          d={swirlPaths[2]}
          fill="none"
          stroke={swirlColor}
          strokeWidth="1"
          strokeLinecap="round"
          opacity={isActive ? 0.9 : 0.5}
          className={isActive ? 'animate-swirl' : 'animate-swirl-slow'}
        />
      </g>

      {/* Ether particles */}
      {isActive && (
        <g className="ether-particles">
          {[...Array(8)].map((_, idx) => {
            const angle = (idx / 8) * Math.PI * 2;
            const radius = 15 + (idx % 3) * 8;
            const px = centerX + Math.cos(angle) * radius;
            const py = centerY + Math.sin(angle) * radius;
            return (
              <circle
                key={`particle-${idx}`}
                cx={px}
                cy={py}
                r={1.5 + (idx % 2)}
                fill={swirlColor}
                opacity={0.6 + (idx % 3) * 0.1}
                className="animate-particle-float"
                style={{
                  animationDelay: `${idx * 0.15}s`,
                  animationDuration: `${1 + idx * 0.1}s`,
                }}
              />
            );
          })}
        </g>
      )}

      {/* Central core */}
      <circle
        cx={centerX}
        cy={centerY}
        r={8}
        fill={innerColor}
        opacity={isActive ? 1 : 0.7}
        filter="url(#ether-glow)"
        className={isCharging ? 'animate-pulse' : isActive ? 'animate-pulse' : ''}
      />

      {/* Core highlight */}
      <circle
        cx={centerX}
        cy={centerY}
        r={4}
        fill={glowColor}
        opacity={isActive ? 1 : 0.8}
      />

      {/* Core center */}
      <circle
        cx={centerX}
        cy={centerY}
        r={2}
        fill="#fff"
        opacity={isActive ? 1 : 0.9}
      />

      {/* Chamber accent lines */}
      <g opacity="0.4">
        <line
          x1={centerX - outerRadius + 5}
          y1={centerY}
          x2={centerX - innerRadius - 5}
          y2={centerY}
          stroke={chamberColor}
          strokeWidth="1"
        />
        <line
          x1={centerX + innerRadius + 5}
          y1={centerY}
          x2={centerX + outerRadius - 5}
          y2={centerY}
          stroke={chamberColor}
          strokeWidth="1"
        />
      </g>

      {/* Charging expanding ring effect */}
      {isCharging && (
        <g>
          <circle
            cx={centerX}
            cy={centerY}
            r="20"
            fill="none"
            stroke={glowColor}
            strokeWidth="2"
            opacity="0.8"
            className="animate-expand-ring"
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="30"
            fill="none"
            stroke={chamberColor}
            strokeWidth="1"
            opacity="0.5"
            className="animate-expand-ring"
            style={{ animationDelay: '0.3s' }}
          />
          <circle
            cx={centerX}
            cy={centerY}
            r="38"
            fill="none"
            stroke={glowColor}
            strokeWidth="0.5"
            opacity="0.3"
            className="animate-expand-ring"
            style={{ animationDelay: '0.6s' }}
          />
        </g>
      )}

      {/* Energy intake indicators on left side (where inputs are) */}
      <g opacity="0.6">
        <circle
          cx={centerX - 25}
          cy={centerY - 15}
          r="3"
          fill={glowColor}
          className={isActive ? 'animate-pulse' : ''}
        />
        <circle
          cx={centerX - 25}
          cy={centerY + 15}
          r="3"
          fill={glowColor}
          className={isActive ? 'animate-pulse' : ''}
          style={{ animationDelay: '0.2s' }}
        />
      </g>

      {/* Energy output indicator on right side */}
      <g opacity="0.6">
        <circle
          cx={centerX + 25}
          cy={centerY}
          r="4"
          fill={glowColor}
          className={isActive ? 'animate-pulse' : ''}
        />
      </g>

      <style>{`
        @keyframes swirl {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes swirl-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes swirl-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(180deg); }
        }
        @keyframes swirl-slow-reverse {
          from { transform: rotate(-180deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes particle-float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          25% {
            transform: translate(2px, -3px) scale(1.1);
            opacity: 0.8;
          }
          50% {
            transform: translate(-2px, 2px) scale(0.9);
            opacity: 0.5;
          }
          75% {
            transform: translate(3px, 1px) scale(1.05);
            opacity: 0.7;
          }
        }
        @keyframes expand-ring {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        .animate-swirl {
          animation: swirl 2s linear infinite;
        }
        .animate-swirl-reverse {
          animation: swirl-reverse 1.5s linear infinite;
        }
        .animate-swirl-slow {
          animation: swirl-slow 4s ease-in-out infinite;
        }
        .animate-swirl-slow-reverse {
          animation: swirl-slow-reverse 3s ease-in-out infinite;
        }
        .animate-particle-float {
          animation: particle-float 1.5s ease-in-out infinite;
        }
        .animate-expand-ring {
          animation: expand-ring 1s ease-out infinite;
        }
      `}</style>
    </g>
  );
}

export default EtherInfusionChamberSVG;
