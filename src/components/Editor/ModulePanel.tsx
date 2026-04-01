import { useCallback, useState, useMemo } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { useRecipeStore } from '../../store/useRecipeStore';
import { useFactionReputationStore } from '../../store/useFactionReputationStore';
import { generateRandomMachine } from '../../utils/randomGenerator';
import { generateAttributes } from '../../utils/attributeGenerator';
import { ModuleType, ModuleCategory } from '../../types';
import { RECIPE_DEFINITIONS, RARITY_COLORS } from '../../types/recipes';

export interface ModuleInfo {
  type: ModuleType;
  name: string;
  category: ModuleCategory;
  description: string;
  factionId?: string; // For faction variant modules
}

const BASE_MODULES: ModuleInfo[] = [
  {
    type: 'core-furnace',
    name: '核心熔炉',
    category: 'core',
    description: '机器的心脏。生成并放大奥术能量。',
  },
  {
    type: 'energy-pipe',
    name: '能量管道',
    category: 'pipe',
    description: '在模块之间传输能量。连接的关键组件。',
  },
  {
    type: 'gear',
    name: '齿轮组件',
    category: 'gear',
    description: '机械组件，提供稳定性和均衡能量。',
  },
  {
    type: 'rune-node',
    name: '符文节点',
    category: 'rune',
    description: '引导奥术力量。增强能量吞吐量。',
  },
  {
    type: 'shield-shell',
    name: '护盾外壳',
    category: 'shield',
    description: '防护屏障模块。提高系统稳定性。',
  },
  {
    type: 'trigger-switch',
    name: '触发开关',
    category: 'trigger',
    description: '激活机制。控制能量释放时机。',
  },
  {
    type: 'output-array',
    name: '输出阵列',
    category: 'output',
    description: '能量回路的最终终端。投射奥术光束和共振。',
  },
  {
    type: 'amplifier-crystal',
    name: '增幅水晶',
    category: 'rune',
    description: '棱镜能量增幅器，1个输入2个输出。分裂并放大奥术力量。',
  },
  {
    type: 'stabilizer-core',
    name: '稳定核心',
    category: 'core',
    description: '谐波稳定矩阵，2个输入1个输出。平衡能量波动。',
  },
  {
    type: 'void-siphon',
    name: '虚空虹吸',
    category: 'core',
    description: '吸收虚空能量，1个输入2个输出。以漩涡模式向内吸收能量。',
  },
  {
    type: 'phase-modulator',
    name: '相位调制器',
    category: 'rune',
    description: '相位偏移矩阵，2输入2输出。以闪电弧引导雷电能量。',
  },
  {
    type: 'resonance-chamber',
    name: '共振腔',
    category: 'resonance',
    description: '谐波振荡室，具有同心能量环。放大共振效果。',
  },
  {
    type: 'fire-crystal',
    name: '火焰水晶',
    category: 'elemental',
    description: '不稳定火元素水晶，具有闪烁火焰图案。引导强烈热能。',
  },
  {
    type: 'lightning-conductor',
    name: '引雷导体',
    category: 'elemental',
    description: '高电压能量导体，带有闪电弧。以六边形矩阵引导雷电。',
  },
];

// Faction variant modules - gated behind Grandmaster rank
const FACTION_VARIANT_MODULES: ModuleInfo[] = [
  {
    type: 'void-arcane-gear',
    name: '虚空奥术齿轮',
    category: 'gear',
    description: '融合虚空能量的高级齿轮组件。以暗影漩涡引导能量流动。',
    factionId: 'void',
  },
  {
    type: 'inferno-blazing-core',
    name: '烈焰燃烧核心',
    category: 'core',
    description: '炽热燃烧的核心炉。释放熔岩般的毁灭之力。',
    factionId: 'inferno',
  },
  {
    type: 'storm-thundering-pipe',
    name: '雷霆闪电管道',
    category: 'pipe',
    description: '高电压能量传输管道。引导雷霆之力穿越机器。',
    factionId: 'storm',
  },
  {
    type: 'stellar-harmonic-crystal',
    name: '星辉谐波水晶',
    category: 'rune',
    description: '凝聚星辉能量的水晶。和谐共振放大所有能量波动。',
    factionId: 'stellar',
  },
];

// Round 64: Advanced modules
const ADVANCED_MODULES: ModuleInfo[] = [
  {
    type: 'temporal-distorter',
    name: '时空扭曲器',
    category: 'advanced',
    description: '时间操控模块，具有旋转环和时间扭曲效果。1输入1输出。',
  },
  {
    type: 'arcane-matrix-grid',
    name: '奥术矩阵网格',
    category: 'advanced',
    description: '几何网格模块，节点交叉处发光。1输入2输出。',
  },
  {
    type: 'ether-infusion-chamber',
    name: '以太灌注室',
    category: 'advanced',
    description: '圆柱形腔室，带有旋转以太效果。2输入1输出。',
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
  resonance: '#06b6d4',
  elemental: '#f97316',
  advanced: '#22d3ee',
};

const CATEGORY_NAMES: Record<ModuleCategory, string> = {
  core: '核心',
  pipe: '管道',
  gear: '齿轮',
  rune: '符文',
  shield: '护盾',
  trigger: '触发',
  output: '输出',
  resonance: '共振',
  elemental: '元素',
  advanced: '高级',
};

const FACTION_COLORS: Record<string, string> = {
  void: '#a78bfa',
  inferno: '#f97316',
  storm: '#22d3ee',
  stellar: '#fbbf24',
};

// Helper to safely get faction color
const getFactionColor = (factionId: string | undefined): string | undefined => {
  if (!factionId) return undefined;
  return FACTION_COLORS[factionId] || undefined;
};

const getRecipeForModule = (type: ModuleType) => {
  return RECIPE_DEFINITIONS.find(r => r.moduleType === type);
};

// FIX: Create isUnlocked checker function outside component
const checkIsModuleUnlocked = (type: ModuleType): boolean => {
  const recipe = getRecipeForModule(type);
  if (!recipe) return false;
  return useRecipeStore.getState().isUnlocked(recipe.id);
};

export function ModulePanel() {
  const addModule = useMachineStore((state) => state.addModule);
  const loadMachine = useMachineStore((state) => state.loadMachine);
  const setGeneratedAttributes = useMachineStore((state) => state.setGeneratedAttributes);
  const showRandomForgeToast = useMachineStore((state) => state.showRandomForgeToast);
  const saveToHistory = useMachineStore((state) => state.saveToHistory);
  const viewport = useMachineStore((state) => state.viewport);

  // FIX: Create stable function to check variant unlock status using getState()
  const checkVariantUnlocked = useMemo(() => {
    return (factionId: string): boolean => {
      return useFactionReputationStore.getState().isVariantUnlocked(factionId);
    };
  }, []);

  const [hoveredModule, setHoveredModule] = useState<ModuleInfo | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [advancedExpanded, setAdvancedExpanded] = useState(true);

  const handleDragStart = useCallback((e: React.DragEvent, moduleType: ModuleType, locked: boolean) => {
    if (locked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('moduleType', moduleType);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleClick = useCallback((moduleType: ModuleType, locked: boolean) => {
    if (locked) return;
    const x = (window.innerWidth / 2 - viewport.x) / viewport.zoom;
    const y = (window.innerHeight / 2 - viewport.y) / viewport.zoom;
    addModule(moduleType, x, y);
  }, [addModule, viewport]);

  const handleRandomForge = useCallback(() => {
    const { modules, connections } = generateRandomMachine({
      canvasWidth: 800,
      canvasHeight: 600,
      minSpacing: 80,
    });
    const attributes = generateAttributes(modules, connections);
    loadMachine(modules, connections);
    setGeneratedAttributes(attributes);
    saveToHistory();
    showRandomForgeToast(`✨ ${attributes.name} 锻造成功!`);
  }, [loadMachine, setGeneratedAttributes, saveToHistory, showRandomForgeToast]);

  const handleMouseEnter = (module: ModuleInfo, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).closest('.module-item')?.getBoundingClientRect();
    if (rect) {
      setTooltipPosition({
        x: rect.right + 10,
        y: rect.top,
      });
    }
    setHoveredModule(module);
  };

  const handleMouseLeave = () => {
    setHoveredModule(null);
  };

  const renderModuleItem = (module: ModuleInfo, locked: boolean, factionLocked: boolean = false, index?: number) => {
    const recipe = getRecipeForModule(module.type);
    const rarityStyle = recipe ? RARITY_COLORS[recipe.rarity] : null;
    const factionColor = getFactionColor(module.factionId);

    // Determine if module is accessible (not locked by recipe or faction rank)
    const isAccessible = !locked && !factionLocked;

    return (
      <div
        key={module.type}
        draggable={isAccessible}
        onDragStart={(e) => handleDragStart(e, module.type, !isAccessible)}
        onClick={() => handleClick(module.type, !isAccessible)}
        onMouseEnter={(e) => handleMouseEnter(module, e)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={(e) => {
          if (hoveredModule?.type === module.type) {
            const rect = (e.target as HTMLElement).closest('.module-item')?.getBoundingClientRect();
            if (rect) {
              setTooltipPosition({
                x: Math.min(rect.right + 10, window.innerWidth - 280),
                y: Math.min(rect.top, window.innerHeight - 200),
              });
            }
          }
        }}
        role="option"
        aria-selected={false}
        aria-disabled={!isAccessible}
        aria-label={`${module.name}${!isAccessible ? ' (已锁定)' : ''}`}
        data-tutorial-action={index !== undefined ? `module-item-${index}` : undefined}
        className={`
          module-item arcane-card group relative transition-all duration-200
          ${!isAccessible
            ? 'cursor-not-allowed opacity-50 grayscale'
            : 'cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:shadow-lg'
          }
        `}
        style={{
          borderLeftColor: factionColor || CATEGORY_COLORS[module.category],
          borderLeftWidth: '3px',
          ...((!isAccessible) && rarityStyle ? {
            borderColor: `${rarityStyle.primary}40`,
          } : {})
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className={`
              w-12 h-12 rounded flex items-center justify-center text-2xl relative
              ${!isAccessible ? 'bg-gray-800' : ''}
            `}
            style={{
              backgroundColor: !isAccessible ? '#1f2937' : `${factionColor || CATEGORY_COLORS[module.category]}20`,
              border: !isAccessible ? '1px dashed #4b5563' : `1px solid ${factionColor || CATEGORY_COLORS[module.category]}40`,
            }}
            aria-hidden="true"
          >
            {!isAccessible ? (
              <div className="flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            ) : (
              <ModuleIcon type={module.type} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-medium truncate ${!isAccessible ? 'text-gray-500' : 'text-white'}`}>
                {module.name}
              </h3>
              {/* Faction variant lock badge */}
              {module.factionId && factionLocked && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30">
                  宗师解锁
                </span>
              )}
            </div>
            {(!isAccessible && recipe) ? (
              <>
                <p className="text-xs text-gray-600 mt-1 italic">
                  {recipe.hint}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${rarityStyle?.primary}20`,
                      color: rarityStyle?.primary,
                      border: `1px solid ${rarityStyle?.primary}40`,
                    }}
                  >
                    {recipe.rarity}
                  </span>
                </div>
              </>
            ) : module.factionId && factionLocked ? (
              <>
                <p className="text-xs text-gray-600 mt-1 italic">
                  需要宗师等级解锁
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${factionColor || '#a78bfa'}20`,
                      color: factionColor || '#a78bfa',
                      border: `1px solid ${factionColor || '#a78bfa'}40`,
                    }}
                  >
                    {module.factionId} 派系
                  </span>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-[#9ca3af] mt-1 line-clamp-2">
                  {module.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${factionColor || CATEGORY_COLORS[module.category]}20`,
                      color: factionColor || CATEGORY_COLORS[module.category],
                    }}
                  >
                    {factionColor ? `${module.factionId} 派系` : CATEGORY_NAMES[module.category]}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {!isAccessible && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
            }}
          />
        )}

        {!locked && !factionLocked && (
          <div className="absolute inset-0 bg-[#00d4ff]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
        )}
      </div>
    );
  };

  return (
    <div
      className="module-panel w-64 bg-[#121826] border-r border-[#1e2a42] flex flex-col overflow-hidden"
      role="region"
      aria-label="模块面板"
      data-tutorial="module-panel"
      data-tutorial-action="module-panel"
    >
      <div className="p-4 border-b border-[#1e2a42]">
        <h2 className="text-sm font-semibold text-[#00d4ff] tracking-wider">
          模块面板
        </h2>
        <p className="text-xs text-[#4a5568] mt-1">拖拽或点击添加</p>
      </div>

      <div className="p-3 border-b border-[#1e2a42] bg-gradient-to-r from-[#1a1a2e] to-[#121826]">
        <button
          onClick={handleRandomForge}
          data-tutorial-action="module-random-forge"
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
          title="随机生成2-6个模块的机器"
          aria-label="随机锻造 - 生成随机机器"
        >
          <span className="text-lg" aria-hidden="true">🎲</span>
          <span>随机锻造</span>
        </button>
        <p className="text-[10px] text-[#6b7280] mt-2 text-center">
          创建2-6个随机模块与连接
        </p>
      </div>

      <div 
        className="flex-1 overflow-y-auto p-2" 
        role="listbox" 
        aria-label="可用模块"
        data-tutorial-action="module-list"
      >
        <div className="space-y-2">
          {/* Base modules */}
          {BASE_MODULES.map((module, index) => {
            const locked = checkIsModuleUnlocked(module.type);
            return renderModuleItem(module, locked, false, index);
          })}

          {/* Faction variant modules - gated by Grandmaster rank */}
          {FACTION_VARIANT_MODULES.map((module, index) => {
            const locked = checkIsModuleUnlocked(module.type);
            const factionLocked = module.factionId ? !checkVariantUnlocked(module.factionId) : false;
            return renderModuleItem(module, locked, factionLocked, BASE_MODULES.length + index);
          })}

          {/* Round 64: Advanced modules - collapsible section */}
          <div className="mt-4 pt-4 border-t border-[#1e2a42]">
            <button
              onClick={() => setAdvancedExpanded(!advancedExpanded)}
              className="w-full flex items-center justify-between px-2 py-2 text-sm font-semibold text-[#22d3ee] hover:bg-[#1e2a42] rounded transition-colors"
              aria-expanded={advancedExpanded}
              aria-controls="advanced-modules-section"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#22d3ee]" />
                高级模块
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${advancedExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div
              id="advanced-modules-section"
              className={`space-y-2 mt-2 ${advancedExpanded ? '' : 'hidden'}`}
              role="group"
              aria-label="高级模块"
            >
              {ADVANCED_MODULES.map((module, index) => {
                return renderModuleItem(module, false, false, BASE_MODULES.length + FACTION_VARIANT_MODULES.length + index);
              })}
            </div>
          </div>
        </div>
      </div>

      {hoveredModule && (
        <div
          className="fixed z-50 p-3 rounded-lg bg-[#1a1f2e] border border-[#00d4ff]/30 shadow-xl max-w-[260px] pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
          role="tooltip"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getFactionColor(hoveredModule.factionId) || CATEGORY_COLORS[hoveredModule.category] }}
              aria-hidden="true"
            />
            <h4 className="text-sm font-semibold text-white">{hoveredModule.name}</h4>
          </div>
          <p className="text-xs text-[#9ca3af] leading-relaxed">
            {hoveredModule.description}
          </p>
          <div className="mt-2 pt-2 border-t border-[#1e2a42]">
            <p className="text-[10px] text-[#6b7280]">
              💡 提示: 点击或拖拽添加模块
            </p>
          </div>
        </div>
      )}

      <div className="p-3 border-t border-[#1e2a42]">
        <p className="text-xs text-[#4a5568] text-center">
          共 {BASE_MODULES.length + FACTION_VARIANT_MODULES.length + ADVANCED_MODULES.length} 种模块类型
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

        @media (max-width: 768px) {
          .module-panel {
            width: 100%;
            max-height: 200px;
            border-r: none;
            border-bottom: 1px solid #1e2a42;
          }
        }
      `}</style>
    </div>
  );
}

function ModuleIcon({ type }: { type: ModuleType }) {
  const iconStyles: Record<ModuleType, React.ReactNode> = {
    'core-furnace': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" fill="none" stroke="#00d4ff" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="6" fill="#00d4ff" opacity="0.5"/>
        <circle cx="16" cy="16" r="3" fill="#00ffcc"/>
      </svg>
    ),
    'energy-pipe': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="2" y="10" width="28" height="12" rx="3" fill="#2d1b4e" stroke="#7c3aed" strokeWidth="1.5"/>
        <line x1="8" y1="16" x2="24" y2="16" stroke="#a855f7" strokeWidth="2" strokeDasharray="4,2"/>
      </svg>
    ),
    'gear': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
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
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="13" fill="#1a1a2e" stroke="#9333ea" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="9" fill="#2d1b4e" stroke="#a855f7" strokeWidth="1"/>
        <path d="M16,6 L20,14 L28,14 L22,19 L24,27 L16,23 L8,27 L10,19 L4,14 L12,14 Z" fill="none" stroke="#c084fc" strokeWidth="1"/>
        <circle cx="16" cy="16" r="3" fill="#9333ea"/>
      </svg>
    ),
    'shield-shell': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M5,8 Q16,2 27,8 L28,20 Q16,26 4,20 Z" fill="#1a1a2e" stroke="#22c55e" strokeWidth="1.5"/>
        <path d="M8,10 Q16,6 24,10 L25,19 Q16,23 7,19 Z" fill="#064e3b" stroke="#4ade80" strokeWidth="1"/>
      </svg>
    ),
    'trigger-switch': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="8" y="4" width="16" height="24" rx="3" fill="#1a1a2e" stroke="#ef4444" strokeWidth="1.5"/>
        <rect x="11" y="18" width="10" height="8" rx="2" fill="#2d2d2d" stroke="#f87171" strokeWidth="1"/>
        <circle cx="16" cy="22" r="3" fill="#dc2626" stroke="#ef4444" strokeWidth="1"/>
        <rect x="11" y="6" width="10" height="8" rx="1" fill="#2d2d2d" stroke="#f87171" strokeWidth="1"/>
      </svg>
    ),
    'output-array': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14" fill="#1a1a2e" stroke="#fbbf24" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="10" fill="#2d2d2d" stroke="#f59e0b" strokeWidth="1"/>
        <circle cx="16" cy="16" r="5" fill="#f59e0b" opacity="0.6"/>
        <circle cx="16" cy="16" r="2" fill="#fef3c7"/>
        <path d="M22,16 L28,14 L28,18 Z" fill="#fbbf24"/>
        <ellipse cx="5" cy="16" rx="3" ry="5" fill="#2d2d2d" stroke="#f59e0b" strokeWidth="1"/>
      </svg>
    ),
    'amplifier-crystal': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <polygon points="16,2 28,16 16,30 4,16" fill="#2d1b4e" stroke="#a855f7" strokeWidth="1.5"/>
        <line x1="16" y1="2" x2="16" y2="30" stroke="#c084fc" strokeWidth="0.5" opacity="0.6"/>
        <line x1="4" y1="16" x2="28" y2="16" stroke="#c084fc" strokeWidth="0.5" opacity="0.6"/>
        <circle cx="16" cy="16" r="4" fill="#9333ea"/>
        <circle cx="16" cy="16" r="2" fill="#c084fc"/>
        <circle cx="28" cy="10" r="2" fill="#a855f7"/>
        <circle cx="28" cy="22" r="2" fill="#a855f7"/>
        <circle cx="4" cy="16" r="2" fill="#22c55e"/>
      </svg>
    ),
    'stabilizer-core': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <polygon points="16,2 24,4 28,12 28,20 24,28 8,28 4,20 4,12 8,4" fill="#064e3b" stroke="#22c55e" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="10" fill="none" stroke="#4ade80" strokeWidth="1" opacity="0.6"/>
        <circle cx="16" cy="16" r="6" fill="none" stroke="#86efac" strokeWidth="1" opacity="0.8"/>
        <circle cx="16" cy="16" r="3" fill="#22c55e"/>
        <circle cx="16" cy="16" r="1.5" fill="#fff"/>
        <rect x="14" y="8" width="4" height="16" rx="1" fill="#4ade80" opacity="0.5"/>
        <rect x="8" y="14" width="16" height="4" rx="1" fill="#4ade80" opacity="0.5"/>
        <circle cx="4" cy="10" r="1.5" fill="#22c55e"/>
        <circle cx="4" cy="22" r="1.5" fill="#22c55e"/>
        <circle cx="28" cy="16" r="1.5" fill="#4ade80"/>
      </svg>
    ),
    'void-siphon': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="9" fill="none" stroke="#7c3aed" strokeWidth="0.5" opacity="0.6"/>
        <path d="M16,16 Q20,12 23,8" fill="none" stroke="#c4b5fd" strokeWidth="1" opacity="0.7"/>
        <path d="M16,16 Q12,20 9,23" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.5"/>
        <circle cx="16" cy="16" r="4" fill="#4c1d95"/>
        <circle cx="16" cy="16" r="2" fill="#7c3aed"/>
        <circle cx="16" cy="2" r="1.5" fill="#c4b5fd"/>
        <circle cx="10" cy="28" r="1.5" fill="#a78bfa"/>
        <circle cx="22" cy="28" r="1.5" fill="#a78bfa"/>
      </svg>
    ),
    'phase-modulator': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <polygon points="16,2 26,8 26,20 16,26 6,20 6,8" fill="#164e63" stroke="#22d3ee" strokeWidth="1.5"/>
        <polygon points="16,6 23,10 23,18 16,22 9,18 9,10" fill="none" stroke="#06b6d4" strokeWidth="0.5" opacity="0.6"/>
        <path d="M10,16 L14,13 L18,17 L22,12" fill="none" stroke="#a5f3fc" strokeWidth="1" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="3" fill="#0891b2"/>
        <circle cx="16" cy="16" r="1.5" fill="#22d3ee"/>
        <circle cx="2" cy="10" r="1.5" fill="#22d3ee"/>
        <circle cx="2" cy="20" r="1.5" fill="#22d3ee"/>
        <circle cx="30" cy="10" r="1.5" fill="#a5f3fc"/>
        <circle cx="30" cy="20" r="1.5" fill="#a5f3fc"/>
      </svg>
    ),
    'resonance-chamber': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14" fill="#0c4a6e" stroke="#06b6d4" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="10" fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.7"/>
        <circle cx="16" cy="16" r="6" fill="none" stroke="#67e8f9" strokeWidth="1" opacity="0.5"/>
        <circle cx="16" cy="16" r="4" fill="#0891b2"/>
        <circle cx="16" cy="16" r="2" fill="#22d3ee"/>
        <circle cx="16" cy="2" r="1.5" fill="#06b6d4"/>
        <circle cx="30" cy="16" r="1.5" fill="#22d3ee"/>
        <circle cx="16" cy="30" r="1.5" fill="#06b6d4"/>
        <circle cx="2" cy="16" r="1.5" fill="#22d3ee"/>
      </svg>
    ),
    'fire-crystal': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16,2 Q24,10 22,18 Q26,12 26,20 Q30,18 22,28 Q18,24 16,28 Q14,24 10,28 Q2,18 6,20 Q6,12 10,18 Q8,10 16,2 Z" fill="#7c2d12" stroke="#f97316" strokeWidth="1.5"/>
        <path d="M16,8 Q20,14 19,18 Q22,14 21,20 Q24,18 18,26 Q16,22 14,26 Q8,18 11,20 Q10,14 13,18 Q12,14 16,8 Z" fill="#ea580c" stroke="#fb923c" strokeWidth="0.5"/>
        <ellipse cx="16" cy="18" rx="4" ry="5" fill="#f97316"/>
        <ellipse cx="16" cy="17" rx="2" ry="3" fill="#fbbf24"/>
      </svg>
    ),
    'lightning-conductor': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <polygon points="16,2 27,9 27,23 16,30 5,23 5,9" fill="#1c1917" stroke="#eab308" strokeWidth="1.5"/>
        <polygon points="16,6 24,11 24,21 16,26 8,21 8,11" fill="none" stroke="#facc15" strokeWidth="0.5" opacity="0.7"/>
        <path d="M18,5 L14,14 L19,14 L12,27 L15,17 L10,17 Z" fill="#eab308" stroke="#fde047" strokeWidth="0.5"/>
        <circle cx="16" cy="16" r="3" fill="#ca8a04"/>
        <circle cx="16" cy="16" r="1.5" fill="#facc15"/>
      </svg>
    ),
    'void-arcane-gear': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="12" fill="#1e1b4b" stroke="#c4b5fd" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="7" fill="#2d1b4e" stroke="#a78bfa" strokeWidth="1"/>
        <g stroke="#c4b5fd" strokeWidth="1.5">
          <line x1="16" y1="2" x2="16" y2="9"/>
          <line x1="16" y1="23" x2="16" y2="30"/>
          <line x1="2" y1="16" x2="9" y2="16"/>
          <line x1="23" y1="16" x2="30" y2="16"/>
        </g>
        <circle cx="16" cy="16" r="4" fill="#7c3aed"/>
        <circle cx="16" cy="16" r="2" fill="#c4b5fd"/>
      </svg>
    ),
    'inferno-blazing-core': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" fill="#1c1917" stroke="#fb923c" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="10" fill="#7c2d12" stroke="#f97316" strokeWidth="0.5" opacity="0.7"/>
        <circle cx="16" cy="16" r="6" fill="#ea580c" stroke="#fbbf24" strokeWidth="0.5"/>
        <circle cx="16" cy="16" r="3" fill="#f97316"/>
        <circle cx="16" cy="16" r="1.5" fill="#fbbf24"/>
      </svg>
    ),
    'storm-thundering-pipe': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="2" y="10" width="28" height="12" rx="3" fill="#164e63" stroke="#67e8f9" strokeWidth="1.5"/>
        <line x1="8" y1="16" x2="24" y2="16" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4,2"/>
        <polygon points="16,6 24,11 24,21 16,26 8,21 8,11" fill="none" stroke="#22d3ee" strokeWidth="0.5" opacity="0.7"/>
        <path d="M18,8 L14,15 L19,15 L13,24 L16,17 L11,17 Z" fill="#67e8f9" stroke="#a5f3fc" strokeWidth="0.5"/>
        <circle cx="16" cy="16" r="2" fill="#22d3ee"/>
      </svg>
    ),
    'stellar-harmonic-crystal': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14" fill="#0c4a6e" stroke="#fcd34d" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="10" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.7"/>
        <circle cx="16" cy="16" r="6" fill="none" stroke="#fde047" strokeWidth="1" opacity="0.5"/>
        <circle cx="16" cy="16" r="4" fill="#b45309"/>
        <circle cx="16" cy="16" r="2" fill="#fcd34d"/>
        <circle cx="16" cy="2" r="1.5" fill="#fbbf24"/>
        <circle cx="30" cy="16" r="1.5" fill="#fde047"/>
        <circle cx="16" cy="30" r="1.5" fill="#fbbf24"/>
        <circle cx="2" cy="16" r="1.5" fill="#fcd34d"/>
      </svg>
    ),
    // Round 64: Advanced Module Icons
    'temporal-distorter': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14" fill="#1e1b4b" stroke="#00ffcc" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="11" fill="none" stroke="#00ffcc" strokeWidth="0.5" strokeDasharray="2 2"/>
        <circle cx="16" cy="16" r="8" fill="none" stroke="#22d3ee" strokeWidth="1"/>
        <circle cx="16" cy="16" r="5" fill="none" stroke="#00ffcc" strokeWidth="1.5"/>
        <circle cx="16" cy="16" r="3" fill="#00ffcc"/>
        <circle cx="16" cy="16" r="1.5" fill="#fff"/>
      </svg>
    ),
    'arcane-matrix-grid': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="4" y="4" width="24" height="24" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" rx="2"/>
        <line x1="4" y1="12" x2="28" y2="12" stroke="#22d3ee" strokeWidth="0.5" opacity="0.5"/>
        <line x1="4" y1="20" x2="28" y2="20" stroke="#22d3ee" strokeWidth="0.5" opacity="0.5"/>
        <line x1="12" y1="4" x2="12" y2="28" stroke="#22d3ee" strokeWidth="0.5" opacity="0.5"/>
        <line x1="20" y1="4" x2="20" y2="28" stroke="#22d3ee" strokeWidth="0.5" opacity="0.5"/>
        <circle cx="4" cy="4" r="2" fill="#67e8f9"/>
        <circle cx="16" cy="16" r="2" fill="#22d3ee"/>
        <circle cx="28" cy="4" r="2" fill="#67e8f9"/>
        <circle cx="4" cy="28" r="2" fill="#67e8f9"/>
        <circle cx="28" cy="28" r="2" fill="#67e8f9"/>
      </svg>
    ),
    'ether-infusion-chamber': (
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        <ellipse cx="16" cy="16" rx="13" ry="13" fill="#1e1b4b" stroke="#f5d0fe" strokeWidth="1.5"/>
        <ellipse cx="16" cy="16" rx="9" ry="9" fill="none" stroke="#c084fc" strokeWidth="0.5" strokeDasharray="2 2"/>
        <ellipse cx="16" cy="16" rx="5" ry="5" fill="#f5d0fe" opacity="0.5"/>
        <path d="M16,10 Q20,14 18,18 Q14,20 12,16 Q10,12 16,10" fill="none" stroke="#e879f9" strokeWidth="1"/>
        <circle cx="16" cy="16" r="3" fill="#f5d0fe"/>
        <circle cx="16" cy="16" r="1.5" fill="#fff"/>
        <circle cx="4" cy="12" r="2" fill="#f5d0fe"/>
        <circle cx="4" cy="20" r="2" fill="#f5d0fe"/>
        <circle cx="28" cy="16" r="2" fill="#f5d0fe"/>
      </svg>
    ),
  };

  return iconStyles[type] || <span>?</span>;
}

export { BASE_MODULES, FACTION_VARIANT_MODULES, ADVANCED_MODULES, CATEGORY_COLORS };
