import { useCallback } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
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
];

const CATEGORY_COLORS: Record<ModuleCategory, string> = {
  core: '#00d4ff',
  pipe: '#7c3aed',
  gear: '#f59e0b',
  rune: '#9333ea',
  shield: '#22c55e',
  trigger: '#ef4444',
};

export function ModulePanel() {
  const addModule = useMachineStore((state) => state.addModule);
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
  
  return (
    <div className="w-64 bg-[#121826] border-r border-[#1e2a42] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#1e2a42]">
        <h2 className="text-sm font-semibold text-[#00d4ff] tracking-wider">
          MODULE PALETTE
        </h2>
        <p className="text-xs text-[#4a5568] mt-1">Drag or click to add</p>
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
              className="arcane-card cursor-grab active:cursor-grabbing group"
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
  };
  
  return iconStyles[type] || <span>?</span>;
}

export { MODULE_CATALOG, CATEGORY_COLORS };
