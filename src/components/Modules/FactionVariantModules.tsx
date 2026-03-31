import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

/**
 * Faction Variant Module SVGs
 * 
 * These are enhanced versions of base module types with faction-specific
 * visual styling and effects. Each variant corresponds to a faction:
 * - void: Purple/indigo arcane patterns (void-arcane-gear)
 * - inferno: Red/orange flame motifs (inferno-blazing-core)
 * - storm: Cyan/blue lightning patterns (storm-thundering-pipe)
 * - stellar: Gold/white star patterns (stellar-harmonic-crystal)
 */

interface FactionVariantProps {
  isActive: boolean;
  isCharging: boolean;
}

/**
 * Void Arcane Gear - Enhanced gear with void faction styling
 * Purple/indigo colors with arcane swirling patterns
 */
export function VoidArcaneGearSVG({ isActive, isCharging }: FactionVariantProps) {
  const groupRef = useRef<SVGGElement>(null);
  const patternRef = useRef<SVGGElement>(null);
  
  useEffect(() => {
    if (!groupRef.current) return;
    
    const ctx = gsap.context(() => {
      if (isActive || isCharging) {
        gsap.to(groupRef.current, {
          rotation: 360,
          transformOrigin: '45px 45px',
          duration: 5,
          ease: 'none',
          repeat: -1,
        });
        
        // Void pattern counter-rotation
        if (patternRef.current) {
          gsap.to(patternRef.current, {
            rotation: -360,
            transformOrigin: '45px 45px',
            duration: 7,
            ease: 'none',
            repeat: -1,
          });
        }
      } else {
        gsap.killTweensOf(groupRef.current);
        if (patternRef.current) {
          gsap.killTweensOf(patternRef.current);
        }
      }
    });
    
    return () => ctx.revert();
  }, [isActive, isCharging]);
  
  return (
    <g ref={groupRef}>
      {/* Outer void ring with purple glow */}
      <circle
        cx="45"
        cy="45"
        r="42"
        fill="#1a1a2e"
        stroke="#c4b5fd"
        strokeWidth="2.5"
      />
      
      {/* Void energy outer glow */}
      {isActive && (
        <circle
          cx="45"
          cy="45"
          r="40"
          fill="none"
          stroke="#a78bfa"
          strokeWidth="3"
          opacity="0.4"
        >
          <animate
            attributeName="r"
            values="38;45;38"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.4;0;0.4"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      
      {/* Void arcane pattern - counter-rotating */}
      <g ref={patternRef}>
        <circle
          cx="45"
          cy="45"
          r="35"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="0.5"
          strokeDasharray="6,4"
          opacity="0.6"
        />
        <circle
          cx="45"
          cy="45"
          r="30"
          fill="none"
          stroke="#a78bfa"
          strokeWidth="0.5"
          strokeDasharray="4,6"
          opacity="0.5"
        />
        
        {/* Arcane runes */}
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <g key={i} transform={`rotate(${angle}, 45, 45)`}>
            <path
              d="M 45 12 L 48 18 L 42 18 Z"
              fill="#c4b5fd"
              opacity={isActive ? 0.8 : 0.4}
            />
          </g>
        ))}
      </g>
      
      {/* Gear teeth - enhanced with void energy */}
      <g fill="#1a1a2e" stroke="#c4b5fd" strokeWidth="1.5">
        <rect x="41" y="0" width="8" height="14" rx="1" />
        <rect x="41" y="76" width="8" height="14" rx="1" />
        <rect x="0" y="41" width="14" height="8" rx="1" />
        <rect x="76" y="41" width="14" height="8" rx="1" />
        {/* Diagonal teeth */}
        <rect x="12" y="12" width="8" height="12" rx="1" transform="rotate(45, 16, 18)" />
        <rect x="70" y="12" width="8" height="12" rx="1" transform="rotate(-45, 74, 18)" />
        <rect x="12" y="66" width="8" height="12" rx="1" transform="rotate(-45, 16, 72)" />
        <rect x="70" y="66" width="8" height="12" rx="1" transform="rotate(45, 74, 72)" />
      </g>
      
      {/* Inner gear ring */}
      <circle
        cx="45"
        cy="45"
        r="28"
        fill="#1a1a2e"
        stroke="#a78bfa"
        strokeWidth="2"
      />
      
      {/* Void core */}
      <circle
        cx="45"
        cy="45"
        r="15"
        fill="#0a0e17"
        stroke="#c4b5fd"
        strokeWidth="1.5"
      />
      
      {/* Center void singularity */}
      <circle
        cx="45"
        cy="45"
        r="8"
        fill="#8b5cf6"
        opacity={isActive ? 0.9 : 0.5}
      >
        {isActive && (
          <animate
            attributeName="r"
            values="6;10;6"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Inner void eye */}
      <circle
        cx="45"
        cy="45"
        r="3"
        fill="#c4b5fd"
      />
      
      {/* Charging effect */}
      {isCharging && (
        <circle
          cx="45"
          cy="45"
          r="50"
          fill="none"
          stroke="#a78bfa"
          strokeWidth="2"
          opacity="0.5"
        >
          <animate
            attributeName="r"
            values="35;55;35"
            dur="1.2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.5;0;0.5"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
}

/**
 * Inferno Blazing Core - Enhanced core furnace with inferno faction styling
 * Red/orange colors with flame motifs
 */
export function InfernoBlazingCoreSVG({ isActive, isCharging }: FactionVariantProps) {
  const flameRef = useRef<SVGGElement>(null);
  
  useEffect(() => {
    if (!flameRef.current || !isActive) return;
    
    const ctx = gsap.context(() => {
      gsap.to(flameRef.current, {
        scale: 1.05,
        transformOrigin: '55px 55px',
        duration: 0.3,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    });
    
    return () => ctx.revert();
  }, [isActive]);
  
  return (
    <g ref={flameRef}>
      {/* Outer inferno hexagon with flame glow */}
      <polygon
        points="55,5 100,30 100,80 55,105 10,80 10,30"
        fill="#1a0a0a"
        stroke="#fb923c"
        strokeWidth="3"
      />
      
      {/* Fire aura */}
      {isActive && (
        <polygon
          points="55,0 105,28 105,82 55,110 5,82 5,28"
          fill="none"
          stroke="#f97316"
          strokeWidth="2"
          opacity="0.5"
        >
          <animate
            attributeName="opacity"
            values="0.3;0.6;0.3"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </polygon>
      )}
      
      {/* Inner hexagon - heat distortion */}
      <polygon
        points="55,15 90,35 90,75 55,95 20,75 20,35"
        fill="#2d0a0a"
        stroke="#fdba74"
        strokeWidth="1.5"
      />
      
      {/* Flame pattern decoration */}
      <g opacity={isActive ? 0.8 : 0.4}>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <g key={i} transform={`rotate(${angle}, 55, 55)`}>
            <path
              d="M 55 18 Q 58 25 55 30 Q 52 25 55 18"
              fill="#f97316"
              opacity="0.7"
            />
          </g>
        ))}
      </g>
      
      {/* Core blaze circle */}
      <circle
        cx="55"
        cy="55"
        r="30"
        fill="#2d0a0a"
        stroke="#fb923c"
        strokeWidth="2.5"
      />
      
      {/* Inner fire ring */}
      <circle
        cx="55"
        cy="55"
        r="22"
        fill="none"
        stroke="#fdba74"
        strokeWidth="1"
        strokeDasharray="8,4"
      >
        {isActive && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 55 55"
            to="360 55 55"
            dur="4s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Blazing core - pulsing fire */}
      <circle
        cx="55"
        cy="55"
        r="16"
        fill="#f97316"
        opacity={isActive ? 0.9 : 0.5}
      >
        {isActive && (
          <animate
            attributeName="r"
            values="14;18;14"
            dur="0.6s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Fire center - brightest part */}
      <circle
        cx="55"
        cy="55"
        r="8"
        fill="#fbbf24"
        opacity={isActive ? 1 : 0.6}
      >
        {isActive && (
          <animate
            attributeName="opacity"
            values="1;0.6;1"
            dur="0.4s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Flame particles */}
      {isActive && (
        <g>
          {[0, 120, 240].map((angle, i) => (
            <circle
              key={i}
              r="3"
              fill="#fbbf24"
              transform={`rotate(${angle}, 55, 55) translate(55, 20)`}
            >
              <animate
                attributeName="cy"
                values="75;65;75"
                dur={`${0.8 + i * 0.2}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1;0;1"
                dur={`${0.8 + i * 0.2}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>
      )}
      
      {/* Charging flames */}
      {isCharging && (
        <g>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <path
              key={i}
              d={`M 55 ${5} Q ${60 + i % 3 * 3} ${15 + i % 2 * 5} 55 ${25}`}
              fill="none"
              stroke="#fb923c"
              strokeWidth="2"
              transform={`rotate(${angle}, 55, 55)`}
              opacity="0.6"
            >
              <animate
                attributeName="d"
                values={`M 55 5 Q ${60 + i % 3 * 3} ${15 + i % 2 * 5} 55 25;M 55 0 Q ${62 + i % 3 * 3} ${10 + i % 2 * 8} 55 20;M 55 5 Q ${60 + i % 3 * 3} ${15 + i % 2 * 5} 55 25`}
                dur="0.5s"
                repeatCount="indefinite"
              />
            </path>
          ))}
        </g>
      )}
    </g>
  );
}

/**
 * Storm Thundering Pipe - Enhanced energy pipe with storm faction styling
 * Cyan/blue colors with lightning patterns
 */
export function StormThunderingPipeSVG({ isActive, isCharging }: FactionVariantProps) {
  return (
    <g>
      {/* Pipe body with storm energy */}
      <rect
        x="5"
        y="15"
        width="110"
        height="30"
        rx="4"
        fill="#0a1a2e"
        stroke="#67e8f9"
        strokeWidth="2.5"
      />
      
      {/* Storm energy inner glow */}
      <rect
        x="10"
        y="20"
        width="100"
        height="20"
        rx="2"
        fill="#0ea5e9"
        opacity={isActive ? 0.6 : 0.3}
      />
      
      {/* Lightning pattern decoration */}
      <g stroke="#67e8f9" strokeWidth="1" opacity={isActive ? 0.9 : 0.5}>
        <path
          d="M 30 25 L 35 30 L 28 30 L 33 38"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 60 25 L 65 30 L 58 30 L 63 38"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 90 25 L 95 30 L 88 30 L 93 38"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      
      {/* Storm energy stream */}
      <rect
        x="15"
        y="25"
        width="90"
        height="10"
        rx="2"
        fill="#06b6d4"
        opacity="0.5"
      >
        {isActive && (
          <animate
            attributeName="opacity"
            values="0.3;0.7;0.3"
            dur="0.5s"
            repeatCount="indefinite"
          />
        )}
      </rect>
      
      {/* Lightning arcs */}
      {isActive && (
        <g>
          <path
            d="M 25 30 L 30 25 L 35 32 L 40 27"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          >
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="0.3s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M 75 32 L 80 27 L 85 33 L 90 28"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          >
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="0.3s"
              begin="0.15s"
              repeatCount="indefinite"
            />
          </path>
        </g>
      )}
      
      {/* Connection ports */}
      <circle
        cx="5"
        cy="30"
        r="8"
        fill="#0ea5e9"
        stroke="#67e8f9"
        strokeWidth="2"
      />
      <circle
        cx="115"
        cy="30"
        r="8"
        fill="#0ea5e9"
        stroke="#67e8f9"
        strokeWidth="2"
      />
      
      {/* Energy indicator lights */}
      {[30, 50, 70, 90].map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy="30"
          r="3"
          fill="#22d3ee"
          opacity={isActive ? 0.9 : 0.4}
        >
          {isActive && (
            <animate
              attributeName="opacity"
              values="0.4;1;0.4"
              dur={`0.6s`}
              begin={`${i * 0.1}s`}
              repeatCount="indefinite"
            />
          )}
        </circle>
      ))}
      
      {/* Thunder effect when charging */}
      {isCharging && (
        <g>
          <circle
            cx="60"
            cy="30"
            r="45"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            opacity="0.4"
          >
            <animate
              attributeName="r"
              values="35;50;35"
              dur="0.8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.4;0;0.4"
              dur="0.8s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}
      
      {/* Storm border decoration */}
      <g stroke="#67e8f9" strokeWidth="0.5" opacity="0.3">
        <line x1="5" y1="12" x2="115" y2="12" />
        <line x1="5" y1="48" x2="115" y2="48" />
      </g>
    </g>
  );
}

/**
 * Stellar Harmonic Crystal - Enhanced amplifier crystal with stellar faction styling
 * Gold/white colors with star patterns
 */
export function StellarHarmonicCrystalSVG({ isActive, isCharging }: FactionVariantProps) {
  const starRef = useRef<SVGGElement>(null);
  
  useEffect(() => {
    if (!starRef.current) return;
    
    const ctx = gsap.context(() => {
      if (isActive || isCharging) {
        gsap.to(starRef.current, {
          rotation: 360,
          transformOrigin: '42px 42px',
          duration: 10,
          ease: 'none',
          repeat: -1,
        });
      } else {
        gsap.killTweensOf(starRef.current);
      }
    });
    
    return () => ctx.revert();
  }, [isActive, isCharging]);
  
  return (
    <g>
      {/* Outer stellar ring with golden glow */}
      <circle
        cx="42"
        cy="42"
        r="40"
        fill="#1a1a0a"
        stroke="#fcd34d"
        strokeWidth="2.5"
      />
      
      {/* Stellar aura */}
      {isActive && (
        <circle
          cx="42"
          cy="42"
          r="38"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2"
          opacity="0.4"
        >
          <animate
            attributeName="r"
            values="36;42;36"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.4;0;0.4"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      
      {/* Crystal facets - outer hexagon */}
      <polygon
        points="42,5 74,22 74,62 42,79 10,62 10,22"
        fill="#1f1a0a"
        stroke="#fcd34d"
        strokeWidth="1.5"
      />
      
      {/* Crystal inner structure */}
      <polygon
        points="42,12 68,26 68,58 42,72 16,58 16,26"
        fill="#0a0a0a"
        stroke="#fbbf24"
        strokeWidth="1"
        opacity="0.7"
      />
      
      {/* Star pattern - rotating */}
      <g ref={starRef}>
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <g key={i} transform={`rotate(${angle}, 42, 42)`}>
            <polygon
              points="42,15 44,22 51,22 45,27 47,34 42,30 37,34 39,27 33,22 40,22"
              fill="#fcd34d"
              opacity={isActive ? 0.9 : 0.5}
            />
          </g>
        ))}
      </g>
      
      {/* Central crystal core */}
      <circle
        cx="42"
        cy="42"
        r="18"
        fill="#1a1505"
        stroke="#fcd34d"
        strokeWidth="2"
      />
      
      {/* Stellar energy inner glow */}
      <circle
        cx="42"
        cy="42"
        r="12"
        fill="#fbbf24"
        opacity={isActive ? 0.8 : 0.4}
      >
        {isActive && (
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Brightest core */}
      <circle
        cx="42"
        cy="42"
        r="6"
        fill="#fef3c7"
        opacity={isActive ? 1 : 0.6}
      >
        {isActive && (
          <animate
            attributeName="r"
            values="5;7;5"
            dur="0.8s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      
      {/* Twinkling stars */}
      {isActive && (
        <g>
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <circle
              key={i}
              r="2"
              fill="#fef3c7"
              transform={`rotate(${angle}, 42, 42) translate(42, 8)`}
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur={`${1 + (i % 3) * 0.3}s`}
                begin={`${i * 0.15}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>
      )}
      
      {/* Energy output ports */}
      <g>
        {/* Port 1 - upper right */}
        <circle
          cx="76"
          cy="20"
          r="6"
          fill="#fbbf24"
          stroke="#fcd34d"
          strokeWidth="1.5"
        />
        {/* Port 2 - lower right */}
        <circle
          cx="76"
          cy="64"
          r="6"
          fill="#fbbf24"
          stroke="#fcd34d"
          strokeWidth="1.5"
        />
      </g>
      
      {/* Charging effect - expanding rings */}
      {isCharging && (
        <g>
          <circle
            cx="42"
            cy="42"
            r="45"
            fill="none"
            stroke="#fcd34d"
            strokeWidth="2"
            opacity="0.5"
          >
            <animate
              attributeName="r"
              values="35;50;35"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0;0.5"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}
    </g>
  );
}

export default {
  VoidArcaneGearSVG,
  InfernoBlazingCoreSVG,
  StormThunderingPipeSVG,
  StellarHarmonicCrystalSVG,
};
