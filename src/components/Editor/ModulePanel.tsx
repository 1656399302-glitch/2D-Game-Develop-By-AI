import { useCallback } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { generateRandomMachine } from '../../utils/randomGenerator';
import { generateAttributes } from '../../utils/attributeGenerator';
import { ModuleType, ModuleCategory } from '../../types';

interface ModuleInfo {
  type: ModuleType;
  name: string;
  category: ModuleCategory;
  description: string;
}

const MODULE_CATALOG: ModuleInfo[] = [
  {
    type: 'core-furnace',
    name: 'Core Furnace',
    category: 'core',
    description: 'The heart of the machine. Generates and amplifies arcane energy.',
  },
  {
    type: 'energy-pipe',
    name: 'Energy Pipe',
    category: 'pipe',
    description: 'Transports energy between modules. Essential for connections.',
  },
  {
    type: 'gear',
    name: 'Gear Assembly',
    category: 'gear',
    description: 'Mechanical component that provides stability and balanced power.',
  },
  {
    type: 'rune-node',
    name: 'Rune Node',
    category: 'rune',
    description: 'Channels arcane power. Amplifies energy throughput.',
  },
  {
    type: 'shield-shell',
    name: 'Shield Shell',
    category: 'shield',
    description: 'Protective barrier module. Increases system stability.',
  },
  {
    type: 'trigger-switch',
    name: 'Trigger Switch',
    category: 'trigger',
    description: 'Activation mechanism. Controls energy release timing.',
  },
  {
    type: 'output-array',
    name: 'Output Array',
    category: 'output',
    description: 'Final terminus for energy circuits. Projects arcane beams and resonance.',
  },
  // Multi-port modules
  {
    type: 'amplifier-crystal',
    name: 'Amplifier Crystal',
    category: 'rune',
    description: 'Prismatic energy amplifier with 1 input and 2 outputs. Splits and amplifies arcane power.',
  },
  {
    type: 'stabilizer-core',
    name: 'Stabilizer Core',
    category: 'core',
    description: 'Harmonic stabilization matrix with 2 inputs and 1 output. Balances energy fluctuations.',
  },
  // New modules for Round 13
  {
    type: 'void-siphon',
    name: 'Void Siphon',
    category: 'core',
    description: 'Absorbs void energy with 1 input and 2 outputs. Pulls energy inward with swirling vortex patterns.',
  },
  {
    type: 'phase-modulator',
    name: 'Phase Modulator',
    category: 'rune',
    description: 'Phase-shift matrix with 2 inputs and 2 outputs. Channels lightning energy with electric arcs.',
  },
];

const CATEGORY_COLORS: Record<ModuleCategory, string> = {
  core: '#00d4ff',
  pipe: '#7c3aed',
  gear: '#f59e0b',
  rune: '#a855f7',
  shield: '#22c55e',
  trigger: '#ef4444',
  output: '#fbbf24',
};

export function ModulePanel() {
  const addModule = useMachineStore((state) => state.addModule);
  const loadMachine = useMachineStore((state) => state.loadMachine);
  const setGeneratedAttributes = useMachineStore((state) => state.setGeneratedAttributes);
  const showRandomForgeToast = useMachineStore((state) => state.showRandomForgeToast);
  const saveToHistory = useMachineStore((state) => state.saveToHistory);
  const viewport = useMachineStore((state) => state.viewport);
  
  const handleDragStart = useCallback((e: React.DragEvent, moduleType: ModuleType) => {
    e.dataTransfer.setData('moduleType', moduleType);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);
  
  const handleClick = useCallback((moduleType: ModuleType) => {
    // Add module at center of viewport
    const x = (window.innerWidth / 2 - viewport.x) / viewport.zoom;
    const y = (window.innerHeight / 2 - viewport.y) / viewport.zoom;
    addModule(moduleType, x, y);
  }, [addModule, viewport]);
  
  const handleRandomForge = useCallback(() => {
    // Generate random machine
    const { modules, connections } = generateRandomMachine({
      canvasWidth: 800,
      canvasHeight: 600,
      minSpacing: 80,
    });
    
    // Generate attributes for the random machine
    const attributes = generateAttributes(modules, connections);
    
    // Load the generated machine into the canvas
    loadMachine(modules, connections);
    
    // Store the generated attributes
    setGeneratedAttributes(attributes);
    
    // Save to history so undo works
    saveToHistory();
    
    // Show success toast
    showRandomForgeToast(`✨ ${attributes.name} Forged!`);
  }, [loadMachine, setGeneratedAttributes, saveToHistory, showRandomForgeToast]);
  
  return (
    <div className="w-64 bg-[#121826] border-r border-[#1e2a42] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#1e2a42]">
        <h2 className="text-sm font-semibold text-[#00d4ff] tracking-wider">
          MODULE PALETTE
        </h2>
        <p className="text-xs text-[#4a5568] mt-1">Drag or click to add</p>
      </div>
      
      {/* Random Forge Button */}
      <div className="p-3 border-b border-[#1e2a42] bg-gradient-to-r from-[#1a1a2e] to-[#121826]">
        <button
          onClick={handleRandomForge}
          className="w-full px-4 py-3 rounded-lg font-bold text-sm 
                     bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] 
                     text-white 
                     hover:from-[#8b5cf6] hover:to-[#7c3aed]
                     border border-[#a78bfa]/50
                     shadow-lg shadow-purple-900/30
                     transition-all duration-200
                     flex items-center justify-center gap-2
                     hover:scale-[1.02] active:scale-[0.98]
                     animate-pulse-subtle"
          title="Generate a random machine with 2-6 modules"
        >
          <span className="text-lg">🎲</span>
          <span>Random Forge</span>
        </button>
        <p className="text-[10px] text-[#6b7280] mt-2 text-center">
          Creates 2-6 random modules with connections
        </p>
      </div>
      
      {/* Module List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {MODULE_CATALOG.map((module) => (
            <div
              key={module.type}
              draggable
              onDragStart={(e) => handleDragStart(e, module.type)}
              onClick={() => handleClick(module.type)}
              className="arcane-card cursor-grab active:cursor-grabbing group relative"
              style={{ borderLeftColor: CATEGORY_COLORS[module.category], borderLeftWidth: '3px' }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div 
                  className="w-12 h-12 rounded flex items-center justify-center text-2xl"
                  style={{ 
                    backgroundColor: `${CATEGORY_COLORS[module.category]}20`,
                    border: `1px solid ${CATEGORY_COLORS[module.category]}40`,
                  }}
                >
                  <ModuleIcon type={module.type} />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">
                    {module.name}
                  </h3>
                  <p className="text-xs text-[#9ca3af] mt-1 line-clamp-2">
                    {module.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span 
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${CATEGORY_COLORS[module.category]}20`,
                        color: CATEGORY_COLORS[module.category],
                      }}
                    >
                      {module.category}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Hover preview */}
              <div className="absolute inset-0 bg-[#00d4ff]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-[#1e2a42]">
        <p className="text-xs text-[#4a5568] text-center">
          Total: {MODULE_CATALOG.length} module types
        </p>
      </div>
      
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
          }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function ModuleIcon({ type }: { type: ModuleType }) {
  const iconStyles: Record<ModuleType, React.ReactNode> = {
    'core-furnace': (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <polygon 
          points="16,2 30,9 30,23 16,30 2,23 2,9" 
          fill="none" 
          stroke="#00d4ff" 
          strokeWidth="1.5"
        />
        <circle cx="16" cy="16" r="6" fill="#00d4ff" opacity="0.5"/>
        <circle cx="16" cy="16" r="3" fill="#00ffcc"/>
      </svg>
    ),
    'energy-pipe': (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <rect x="2" y="10" width="28" height="12" rx="3" fill="#2d1b4e" stroke="#7c3aed" strokeWidth="1.5"/>
        <line x1="8" y1="16" x2="24" y2="16" stroke="#a855f7" strokeWidth="2" strokeDasharray="4,2"/>
      </svg>
    ),
    'gear': (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="12" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="7" fill="#2d2d2d" stroke="#fbbf24" strokeWidth="1"/>
        <g stroke="#f59e0b" strokeWidth="2">
          <line x1="16" y1="2" x2="16" y2="7"/>
          <line x1="16" y1="25" x2="16" y2="30"/>
          <line x1="2" y1="16" x2="7" y2="16"/>
          <line x1="25" y1="16" x2="30" y2="16"/>
        </g>
        <circle cx="16" cy="16" r="3" fill="#f59e0b"/>
      </svg>
    ),
    'rune-node': (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="13" fill="#1a1a2e" stroke="#9333ea" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="9" fill="#2d1b4e" stroke="#a855f7" strokeWidth="1"/>
        <path 
          d="M16,6 L20,14 L28,14 L22,19 L24,27 L16,23 L8,27 L10,19 L4,14 L12,14 Z" 
          fill="none" 
          stroke="#c084fc" 
          strokeWidth="1"
        />
        <circle cx="16" cy="16" r="3" fill="#9333ea"/>
      </svg>
    ),
    'shield-shell': (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <path 
          d="M5,8 Q16,2 27,8 L28,20 Q16,26 4,20 Z" 
          fill="#1a1a2e" 
          stroke="#22c55e" 
          strokeWidth="1.5"
        />
        <path 
          d="M8,10 Q16,6 24,10 L25,19 Q16,23 7,19 Z" 
          fill="#064e3b" 
          stroke="#4ade80" 
          strokeWidth="1"
        />
      </svg>
    ),
    'trigger-switch': (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <rect x="8" y="4" width="16" height="24" rx="3" fill="#1a1a2e" stroke="#ef4444" strokeWidth="1.5"/>
        <rect x="11" y="18" width="10" height="8" rx="2" fill="#2d2d2d" stroke="#f87171" strokeWidth="1"/>
        <circle cx="16" cy="22" r="3" fill="#dc2626" stroke="#ef4444" strokeWidth="1"/>
        <rect x="11" y="6" width="10" height="8" rx="1" fill="#2d2d2d" stroke="#f87171" strokeWidth="1"/>
      </svg>
    ),
    'output-array': (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="#1a1a2e" stroke="#fbbf24" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="10" fill="#2d2d2d" stroke="#f59e0b" strokeWidth="1"/>
        <circle cx="16" cy="16" r="5" fill="#f59e0b" opacity="0.6"/>
        <circle cx="16" cy="16" r="2" fill="#fef3c7"/>
        {/* Energy beam */}
        <path d="M22,16 L28,14 L28,18 Z" fill="#fbbf24"/>
        {/* Receptor */}
        <ellipse cx="5" cy="16" rx="3" ry="5" fill="#2d2d2d" stroke="#f59e0b" strokeWidth="1"/>
      </svg>
    ),
    'amplifier-crystal': (
      <svg width="32" height="32" viewBox="0 0 32 32">
        {/* Diamond shape */}
        <polygon
          points="16,2 28,16 16,30 4,16"
          fill="#2d1b4e"
          stroke="#a855f7"
          strokeWidth="1.5"
        />
        {/* Inner facets */}
        <line x1="16" y1="2" x2="16" y2="30" stroke="#c084fc" strokeWidth="0.5" opacity="0.6"/>
        <line x1="4" y1="16" x2="28" y2="16" stroke="#c084fc" strokeWidth="0.5" opacity="0.6"/>
        {/* Core */}
        <circle cx="16" cy="16" r="4" fill="#9333ea"/>
        <circle cx="16" cy="16" r="2" fill="#c084fc"/>
        {/* Output indicators */}
        <circle cx="28" cy="10" r="2" fill="#a855f7"/>
        <circle cx="28" cy="22" r="2" fill="#a855f7"/>
        {/* Input indicator */}
        <circle cx="4" cy="16" r="2" fill="#22c55e"/>
      </svg>
    ),
    'stabilizer-core': (
      <svg width="32" height="32" viewBox="0 0 32 32">
        {/* Octagon shape */}
        <polygon
          points="16,2 24,4 28,12 28,20 24,28 8,28 4,20 4,12 8,4"
          fill="#064e3b"
          stroke="#22c55e"
          strokeWidth="1.5"
        />
        {/* Concentric rings */}
        <circle cx="16" cy="16" r="10" fill="none" stroke="#4ade80" strokeWidth="1" opacity="0.6"/>
        <circle cx="16" cy="16" r="6" fill="none" stroke="#86efac" strokeWidth="1" opacity="0.8"/>
        {/* Center hub */}
        <circle cx="16" cy="16" r="3" fill="#22c55e"/>
        <circle cx="16" cy="16" r="1.5" fill="#fff"/>
        {/* Cross symbol */}
        <rect x="14" y="8" width="4" height="16" rx="1" fill="#4ade80" opacity="0.5"/>
        <rect x="8" y="14" width="16" height="4" rx="1" fill="#4ade80" opacity="0.5"/>
        {/* Input indicators */}
        <circle cx="4" cy="10" r="1.5" fill="#22c55e"/>
        <circle cx="4" cy="22" r="1.5" fill="#22c55e"/>
        {/* Output indicator */}
        <circle cx="28" cy="16" r="1.5" fill="#4ade80"/>
      </svg>
    ),
    'void-siphon': (
      <svg width="32" height="32" viewBox="0 0 32 32">
        {/* Circular void body */}
        <circle cx="16" cy="16" r="14" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1.5"/>
        {/* Inner void circle */}
        <circle cx="16" cy="16" r="9" fill="none" stroke="#7c3aed" strokeWidth="0.5" opacity="0.6"/>
        {/* Spiral arms */}
        <path d="M16,16 Q20,12 23,8" fill="none" stroke="#c4b5fd" strokeWidth="1" opacity="0.7"/>
        <path d="M16,16 Q12,20 9,23" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.5"/>
        {/* Central void core */}
        <circle cx="16" cy="16" r="4" fill="#4c1d95"/>
        <circle cx="16" cy="16" r="2" fill="#7c3aed"/>
        {/* Input indicator (top) */}
        <circle cx="16" cy="2" r="1.5" fill="#c4b5fd"/>
        {/* Output indicators (bottom) */}
        <circle cx="10" cy="28" r="1.5" fill="#a78bfa"/>
        <circle cx="22" cy="28" r="1.5" fill="#a78bfa"/>
      </svg>
    ),
    'phase-modulator': (
      <svg width="32" height="32" viewBox="0 0 32 32">
        {/* Hexagonal body */}
        <polygon
          points="16,2 26,8 26,20 16,26 6,20 6,8"
          fill="#164e63"
          stroke="#22d3ee"
          strokeWidth="1.5"
        />
        {/* Inner hexagon */}
        <polygon
          points="16,6 23,10 23,18 16,22 9,18 9,10"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="0.5"
          opacity="0.6"
        />
        {/* Lightning arc */}
        <path d="M10,16 L14,13 L18,17 L22,12" fill="none" stroke="#a5f3fc" strokeWidth="1" strokeLinecap="round"/>
        {/* Central core */}
        <circle cx="16" cy="16" r="3" fill="#0891b2"/>
        <circle cx="16" cy="16" r="1.5" fill="#22d3ee"/>
        {/* Input indicators (left) */}
        <circle cx="2" cy="10" r="1.5" fill="#22d3ee"/>
        <circle cx="2" cy="20" r="1.5" fill="#22d3ee"/>
        {/* Output indicators (right) */}
        <circle cx="30" cy="10" r="1.5" fill="#a5f3fc"/>
        <circle cx="30" cy="20" r="1.5" fill="#a5f3fc"/>
      </svg>
    ),
  };
  
  return iconStyles[type] || <span>?</span>;
}

export { MODULE_CATALOG, CATEGORY_COLORS };
