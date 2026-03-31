interface ArcaneMatrixGridProps {
  isActive: boolean;
  isFailing?: boolean;
}

/**
 * Arcane Matrix Grid Module
 * A geometric grid-based module with pulsing node intersections
 * Size: 80x80
 * Ports: 1 input (left), 2 outputs (right, stacked)
 */
export function ArcaneMatrixGridSVG({ isActive, isFailing }: ArcaneMatrixGridProps) {
  const gridColor = isActive ? '#22d3ee' : '#6366f1';
  const nodeColor = isActive ? '#67e8f9' : '#818cf8';
  const glowColor = isActive ? '#22d3ee' : '#7c3aed';

  // Grid dimensions
  const gridSize = 80;
  const padding = 10;
  const innerSize = gridSize - padding * 2;
  const cellSize = innerSize / 4;

  // Generate grid lines
  const horizontalLines = [];
  const verticalLines = [];
  for (let i = 0; i <= 4; i++) {
    const y = padding + i * cellSize;
    const x = padding + i * cellSize;
    horizontalLines.push(
      <line
        key={`h-${i}`}
        x1={padding}
        y1={y}
        x2={padding + innerSize}
        y2={y}
        stroke={gridColor}
        strokeWidth="1"
        opacity="0.5"
      />
    );
    verticalLines.push(
      <line
        key={`v-${i}`}
        x1={x}
        y1={padding}
        x2={x}
        y2={padding + innerSize}
        stroke={gridColor}
        strokeWidth="1"
        opacity="0.5"
      />
    );
  }

  // Generate intersection nodes (9 nodes: 4 corners + 4 edges + center)
  const nodePositions = [
    // Corners
    { x: padding, y: padding },
    { x: padding + innerSize, y: padding },
    { x: padding, y: padding + innerSize },
    { x: padding + innerSize, y: padding + innerSize },
    // Edges (excluding corners)
    { x: padding + cellSize * 2, y: padding }, // Top center
    { x: padding + innerSize, y: padding + cellSize * 2 }, // Right center
    { x: padding + cellSize * 2, y: padding + innerSize }, // Bottom center
    { x: padding, y: padding + cellSize * 2 }, // Left center
    // Center
    { x: padding + cellSize * 2, y: padding + cellSize * 2 },
  ];

  return (
    <g className={`arcane-matrix-grid ${isFailing ? 'animate-flicker' : ''}`}>
      {/* Background glow */}
      <defs>
        <filter id="matrix-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isActive ? 3 : 1.5} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="matrix-core-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={glowColor} stopOpacity="0.6" />
          <stop offset="70%" stopColor={glowColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect
        x="2"
        y="2"
        width={gridSize - 4}
        height={gridSize - 4}
        fill="#0f172a"
        stroke={gridColor}
        strokeWidth="1.5"
        rx="4"
        opacity="0.9"
      />

      {/* Core glow */}
      <circle
        cx={gridSize / 2}
        cy={gridSize / 2}
        r="25"
        fill="url(#matrix-core-gradient)"
        opacity={isActive ? 0.8 : 0.4}
      />

      {/* Grid lines */}
      {horizontalLines}
      {verticalLines}

      {/* Geometric overlay patterns */}
      <g opacity="0.3">
        {/* X pattern */}
        <line
          x1={padding + 5}
          y1={padding + 5}
          x2={padding + innerSize - 5}
          y2={padding + innerSize - 5}
          stroke={gridColor}
          strokeWidth="0.5"
        />
        <line
          x1={padding + innerSize - 5}
          y1={padding + 5}
          x2={padding + 5}
          y2={padding + innerSize - 5}
          stroke={gridColor}
          strokeWidth="0.5"
        />
      </g>

      {/* Intersection nodes */}
      {nodePositions.map((pos, idx) => {
        const isCenter = idx === 8;
        const isCorner = idx < 4;
        const baseRadius = isCenter ? 5 : isCorner ? 4 : 3.5;
        const delay = idx * 0.1;

        return (
          <g key={`node-${idx}`}>
            {/* Node outer glow */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={baseRadius + 3}
              fill={nodeColor}
              opacity={isActive ? 0.3 : 0.15}
              className={isActive ? 'animate-pulse' : ''}
              style={{ animationDelay: `${delay}s` }}
            />
            {/* Node ring */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={baseRadius + 1.5}
              fill="none"
              stroke={nodeColor}
              strokeWidth="1"
              opacity={isActive ? 0.7 : 0.5}
            />
            {/* Node core */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={baseRadius}
              fill={nodeColor}
              opacity={isActive ? 0.9 : 0.7}
              filter="url(#matrix-glow)"
              className={
                isActive
                  ? isCenter
                    ? 'animate-pulse'
                    : ''
                  : isFailing
                  ? 'animate-flicker'
                  : 'animate-subtle-pulse'
              }
              style={{ animationDelay: `${delay}s` }}
            />
            {/* Node center dot */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={baseRadius * 0.4}
              fill="#fff"
              opacity={isActive ? 0.9 : 0.6}
            />
          </g>
        );
      })}

      {/* Energy flow paths when active */}
      {isActive && (
        <g opacity="0.6">
          {/* Center to edges */}
          <circle
            cx={gridSize / 2}
            cy={gridSize / 2}
            r="8"
            fill="none"
            stroke={glowColor}
            strokeWidth="1"
            className="animate-ping"
          />
          <circle
            cx={gridSize / 2}
            cy={gridSize / 2}
            r="12"
            fill="none"
            stroke={glowColor}
            strokeWidth="0.5"
            className="animate-ping"
            style={{ animationDelay: '0.3s' }}
          />
        </g>
      )}

      {/* Failure state flicker effect */}
      {isFailing && (
        <g>
          {/* Random red warning indicators */}
          {nodePositions.slice(0, 4).map((pos, idx) => (
            <circle
              key={`warning-${idx}`}
              cx={pos.x}
              cy={pos.y}
              r="2"
              fill="#ef4444"
              opacity={0.8}
              className="animate-flicker"
              style={{ animationDelay: `${idx * 0.15}s` }}
            />
          ))}
        </g>
      )}

      <style>{`
        @keyframes subtle-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.85; }
        }
        .animate-subtle-pulse {
          animation: subtle-pulse 3s ease-in-out infinite;
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          10% { opacity: 0.3; }
          20% { opacity: 0.8; }
          30% { opacity: 0.2; }
          40% { opacity: 0.9; }
          50% { opacity: 0.4; }
          60% { opacity: 1; }
          70% { opacity: 0.3; }
          80% { opacity: 0.7; }
          90% { opacity: 0.5; }
        }
        .animate-flicker {
          animation: flicker 0.3s ease-in-out infinite;
        }
      `}</style>
    </g>
  );
}

export default ArcaneMatrixGridSVG;
