interface Props {
  isActive: boolean;
  isCharging: boolean;
}

export function CoreFurnaceSVG({ isActive, isCharging }: Props) {
  return (
    <g>
      {/* Outer hexagon */}
      <polygon
        points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
        fill="#1a1a2e"
        stroke="#00d4ff"
        strokeWidth="2"
      />
      
      {/* Inner hexagon */}
      <polygon
        points="50,15 85,32.5 85,67.5 50,85 15,67.5 15,32.5"
        fill="#0a0e17"
        stroke="#00ffcc"
        strokeWidth="1"
        opacity="0.5"
      />
      
      {/* Core circle */}
      <circle
        cx="50"
        cy="50"
        r="25"
        fill="#0a0e17"
        stroke="#00ffcc"
        strokeWidth="2"
      />
      
      {/* Energy pulse ring */}
      <circle
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke="#00d4ff"
        strokeWidth="1"
        opacity={isActive ? 0.8 : 0.3}
      >
        {isActive && (
          <animate
            attributeName="r"
            values="15;25;15"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
        {isActive && (
          <animate
            attributeName="opacity"
            values="0.8;0.2;0.8"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Inner glow */}
      <circle
        cx="50"
        cy="50"
        r="15"
        fill="#00d4ff"
        opacity={isActive ? 0.8 : 0.4}
      >
        {isActive && (
          <animate
            attributeName="r"
            values="12;18;12"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
        {isActive && (
          <animate
            attributeName="opacity"
            values="0.8;0.4;0.8"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Center bright core */}
      <circle
        cx="50"
        cy="50"
        r="6"
        fill="#00ffcc"
      >
        {isActive && (
          <animate
            attributeName="opacity"
            values="1;0.5;1"
            dur="0.8s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Decorative lines */}
      <g stroke="#00d4ff" strokeWidth="0.5" opacity="0.5">
        <line x1="50" y1="15" x2="50" y2="30" />
        <line x1="50" y1="70" x2="50" y2="85" />
        <line x1="15" y1="50" x2="30" y2="50" />
        <line x1="70" y1="50" x2="85" y2="50" />
      </g>
      
      {/* Charging effect */}
      {isCharging && (
        <g>
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="#00ffcc"
            strokeWidth="2"
            opacity="0.5"
          >
            <animate
              attributeName="r"
              values="30;45;30"
              dur="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0;0.5"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}
    </g>
  );
}
