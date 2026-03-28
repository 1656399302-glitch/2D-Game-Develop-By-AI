interface Props {
  isActive: boolean;
}

export function EnergyPipeSVG({ isActive }: Props) {
  return (
    <g>
      {/* Outer pipe shape */}
      <rect
        x="0"
        y="10"
        width="120"
        height="30"
        rx="5"
        fill="#1a1a2e"
        stroke="#7c3aed"
        strokeWidth="2"
      />
      
      {/* Inner pipe */}
      <rect
        x="5"
        y="15"
        width="110"
        height="20"
        rx="3"
        fill="#2d1b4e"
        stroke="#9333ea"
        strokeWidth="1"
      />
      
      {/* Energy flow particles */}
      <line
        x1="10"
        y1="25"
        x2="110"
        y2="25"
        stroke="#a855f7"
        strokeWidth="3"
        strokeLinecap="round"
        opacity={isActive ? 1 : 0.3}
      >
        {isActive && (
          <animate
            attributeName="stroke-dasharray"
            values="0,120;60,60;0,120"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
        {isActive && (
          <animate
            attributeName="opacity"
            values="1;0.5;1"
            dur="0.5s"
            repeatCount="indefinite"
          />
        )}
      </line>
      
      {/* Energy particles */}
      {isActive && (
        <>
          <circle r="4" fill="#c084fc">
            <animateMotion
              path="M10,25 L110,25"
              dur="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r="3" fill="#e879f9">
            <animateMotion
              path="M110,25 L10,25"
              dur="1.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0;1"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}
      
      {/* End caps */}
      <rect
        x="0"
        y="12"
        width="8"
        height="26"
        rx="2"
        fill="#3b1f5e"
        stroke="#7c3aed"
        strokeWidth="1"
      />
      <rect
        x="112"
        y="12"
        width="8"
        height="26"
        rx="2"
        fill="#3b1f5e"
        stroke="#7c3aed"
        strokeWidth="1"
      />
      
      {/* Decorative notches */}
      <g stroke="#9333ea" strokeWidth="0.5" opacity="0.5">
        <line x1="30" y1="12" x2="30" y2="18" />
        <line x1="60" y1="12" x2="60" y2="18" />
        <line x1="90" y1="12" x2="90" y2="18" />
        <line x1="30" y1="32" x2="30" y2="38" />
        <line x1="60" y1="32" x2="60" y2="38" />
        <line x1="90" y1="32" x2="90" y2="38" />
      </g>
    </g>
  );
}
