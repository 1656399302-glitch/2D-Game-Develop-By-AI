interface Props {
  isActive: boolean;
  isCharging: boolean;
}

export function ShieldShellSVG({ isActive, isCharging }: Props) {
  return (
    <g>
      {/* Outer shield shape */}
      <path
        d="M10,15 Q50,0 90,15 L95,45 Q50,55 5,45 Z"
        fill="#1a1a2e"
        stroke="#22c55e"
        strokeWidth="2"
      />
      
      {/* Inner shield */}
      <path
        d="M15,20 Q50,8 85,20 L88,42 Q50,50 12,42 Z"
        fill="#064e3b"
        stroke="#4ade80"
        strokeWidth="1"
      />
      
      {/* Shield shimmer layers */}
      <path
        d="M20,25 Q50,15 80,25 L82,40 Q50,46 18,40 Z"
        fill="none"
        stroke="#22c55e"
        strokeWidth="0.5"
        opacity={isActive ? 0.8 : 0.3}
      >
        {isActive && (
          <animate
            attributeName="opacity"
            values="0.8;0.2;0.8"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </path>
      
      {/* Central protection symbol */}
      <g opacity={isActive ? 1 : 0.6}>
        {/* Shield cross */}
        <line
          x1="50"
          y1="18"
          x2="50"
          y2="45"
          stroke="#4ade80"
          strokeWidth="2"
        />
        <line
          x1="30"
          y1="32"
          x2="70"
          y2="32"
          stroke="#4ade80"
          strokeWidth="2"
        />
        
        {/* Inner diamond */}
        <path
          d="M50,22 L62,32 L50,42 L38,32 Z"
          fill="none"
          stroke="#22c55e"
          strokeWidth="1"
        />
      </g>
      
      {/* Energy barrier effect */}
      <ellipse
        cx="50"
        cy="32"
        rx="35"
        ry="15"
        fill="none"
        stroke="#4ade80"
        strokeWidth="1"
        opacity={isActive ? 0.6 : 0.2}
      >
        {isActive && (
          <animate
            attributeName="opacity"
            values="0.6;0.1;0.6"
            dur="3s"
            repeatCount="indefinite"
          />
        )}
        {isActive && (
          <animate
            attributeName="rx"
            values="30;38;30"
            dur="3s"
            repeatCount="indefinite"
          />
        )}
      </ellipse>
      
      {/* Corner accents */}
      <g fill="#22c55e" opacity="0.5">
        <circle cx="15" cy="20" r="2" />
        <circle cx="85" cy="20" r="2" />
        <circle cx="50" cy="12" r="2" />
      </g>
      
      {/* Active shimmer effect */}
      {isActive && (
        <>
          {/* Top shimmer line */}
          <path
            d="M25,18 Q50,10 75,18"
            fill="none"
            stroke="#86efac"
            strokeWidth="1"
            opacity="0.8"
          >
            <animate
              attributeName="d"
              values="M25,18 Q50,10 75,18;M28,16 Q50,8 72,16;M25,18 Q50,10 75,18"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Shield pulse */}
          <path
            d="M10,15 Q50,0 90,15 L95,45 Q50,55 5,45 Z"
            fill="none"
            stroke="#4ade80"
            strokeWidth="3"
            opacity="0.3"
          >
            <animate
              attributeName="opacity"
              values="0.3;0;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
        </>
      )}
      
      {/* Charging effect */}
      {isCharging && (
        <g>
          <path
            d="M10,15 Q50,0 90,15 L95,45 Q50,55 5,45 Z"
            fill="none"
            stroke="#86efac"
            strokeWidth="2"
            opacity="0.5"
          >
            <animate
              attributeName="opacity"
              values="0.5;0;0.5"
              dur="0.8s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      )}
    </g>
  );
}
