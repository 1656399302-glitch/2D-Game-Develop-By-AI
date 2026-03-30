import { useCallback, useState, useMemo } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { useSelectionStore } from '../../store/useSelectionStore';
import { PlacedModule, MODULE_SIZES } from '../../types';
import { bringToFront, sendToBack, bringForward, sendBackward } from '../../utils/zOrderUtils';

/**
 * Layer item component for a single module in the layers panel
 */
interface LayerItemProps {
  module: PlacedModule;
  isSelected: boolean;
  onSelect: (instanceId: string, multiSelect: boolean) => void;
  onToggleVisibility: (instanceId: string) => void;
  onMoveUp: (instanceId: string) => void;
  onMoveDown: (instanceId: string) => void;
  onMoveToTop: (instanceId: string) => void;
  onMoveToBottom: (instanceId: string) => void;
}

function LayerItem({
  module,
  isSelected,
  onSelect,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onMoveToTop,
  onMoveToBottom,
}: LayerItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const moduleSize = MODULE_SIZES[module.type] || { width: 80, height: 80 };
  const moduleName = getModuleDisplayName(module.type);

  return (
    <div
      data-testid={`layer-item-${module.instanceId}`}
      className={`
        relative border rounded-lg mb-2 transition-all duration-150
        ${isSelected 
          ? 'bg-[#3b82f6]/20 border-[#3b82f6]' 
          : 'bg-[#1a1a2e] border-[#2d3748] hover:border-[#4a5568]'
        }
      `}
    >
      {/* Header row */}
      <div 
        className="flex items-center gap-2 p-2 cursor-pointer"
        onClick={(e) => {
          onSelect(module.instanceId, e.shiftKey || e.ctrlKey || e.metaKey);
        }}
      >
        {/* Visibility toggle */}
        <button
          data-testid={`layer-visibility-${module.instanceId}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(module.instanceId);
          }}
          className={`
            w-6 h-6 rounded flex items-center justify-center text-xs
            transition-colors
            ${(module as any).isVisible !== false 
              ? 'bg-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/30' 
              : 'bg-[#6b7280]/20 text-[#6b7280] hover:bg-[#6b7280]/30'
            }
          `}
          title={(module as any).isVisible !== false ? '隐藏模块' : '显示模块'}
        >
          {(module as any).isVisible !== false ? '👁' : '👁‍🗨'}
        </button>

        {/* Module icon */}
        <div className={`
          w-8 h-8 rounded flex items-center justify-center text-sm
          ${isSelected ? 'bg-[#3b82f6]/30' : 'bg-[#121826]'}
        `}>
          {getModuleIcon(module.type)}
        </div>

        {/* Module info */}
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-[#e2e8f0]'}`}>
            {moduleName}
          </div>
          <div className="text-xs text-[#6b7280]">
            {Math.round(module.x)}, {Math.round(module.y)} • {moduleSize.width}×{moduleSize.height}
          </div>
        </div>

        {/* Expand/collapse button */}
        <button
          data-testid={`layer-expand-${module.instanceId}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="w-6 h-6 rounded flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#2d3748] transition-colors"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-2 pb-2 space-y-2">
          {/* Z-order controls */}
          <div className="flex items-center gap-1 text-xs text-[#6b7280]">
            <span>层级:</span>
            <button
              data-testid={`layer-move-top-${module.instanceId}`}
              onClick={() => onMoveToTop(module.instanceId)}
              className="px-2 py-1 rounded bg-[#121826] hover:bg-[#2d3748] text-[#e2e8f0] transition-colors"
              title="移到顶层"
            >
              ⬆⬆
            </button>
            <button
              data-testid={`layer-move-up-${module.instanceId}`}
              onClick={() => onMoveUp(module.instanceId)}
              className="px-2 py-1 rounded bg-[#121826] hover:bg-[#2d3748] text-[#e2e8f0] transition-colors"
              title="上移一层"
            >
              ⬆
            </button>
            <button
              data-testid={`layer-move-down-${module.instanceId}`}
              onClick={() => onMoveDown(module.instanceId)}
              className="px-2 py-1 rounded bg-[#121826] hover:bg-[#2d3748] text-[#e2e8f0] transition-colors"
              title="下移一层"
            >
              ⬇
            </button>
            <button
              data-testid={`layer-move-bottom-${module.instanceId}`}
              onClick={() => onMoveToBottom(module.instanceId)}
              className="px-2 py-1 rounded bg-[#121826] hover:bg-[#2d3748] text-[#e2e8f0] transition-colors"
              title="移到底层"
            >
              ⬇⬇
            </button>
          </div>

          {/* Transform info */}
          <div className="text-xs text-[#6b7280] space-y-1">
            <div>旋转: {module.rotation}°</div>
            <div>缩放: {Math.round(module.scale * 100)}%</div>
            <div>翻转: {module.flipped ? '是' : '否'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Get display name for module type
 */
function getModuleDisplayName(type: string): string {
  const names: Record<string, string> = {
    'core-furnace': '核心炉心',
    'energy-pipe': '能量管道',
    'gear': '齿轮机构',
    'rune-node': '符文节点',
    'shield-shell': '防护外壳',
    'trigger-switch': '触发开关',
    'output-array': '输出法阵',
    'amplifier-crystal': '增幅水晶',
    'stabilizer-core': '稳定核心',
    'void-siphon': '虚空虹吸',
    'phase-modulator': '相位调制器',
    'resonance-chamber': '共振室',
    'fire-crystal': '烈焰水晶',
    'lightning-conductor': '引雷导体',
    'void-arcane-gear': '虚空齿轮',
    'inferno-blazing-core': '烈焰核心',
    'storm-thundering-pipe': '雷霆管道',
    'stellar-harmonic-crystal': '星辉水晶',
  };
  return names[type] || type;
}

/**
 * Get icon for module type
 */
function getModuleIcon(type: string): string {
  const icons: Record<string, string> = {
    'core-furnace': '🔥',
    'energy-pipe': '⚡',
    'gear': '⚙',
    'rune-node': '🔮',
    'shield-shell': '🛡',
    'trigger-switch': '🎚',
    'output-array': '📤',
    'amplifier-crystal': '💎',
    'stabilizer-core': '⚖',
    'void-siphon': '🌀',
    'phase-modulator': '〰',
    'resonance-chamber': '🔊',
    'fire-crystal': '🔥',
    'lightning-conductor': '⚡',
    'void-arcane-gear': '⚙',
    'inferno-blazing-core': '🔥',
    'storm-thundering-pipe': '⚡',
    'stellar-harmonic-crystal': '💫',
  };
  return icons[type] || '⚙';
}

/**
 * Layers Panel Component
 * Displays all modules with visibility toggles and z-order controls
 */
export function LayersPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [sortOrder, setSortOrder] = useState<'index' | 'name' | 'type'>('index');

  const modules = useMachineStore((state) => state.modules);
  const setModulesOrder = useMachineStore((state) => state.setModulesOrder);

  const selectedModuleIds = useSelectionStore((state) => state.selectedModuleIds);
  const addToSelection = useSelectionStore((state) => state.addToSelection);
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  // Filter and sort modules
  const filteredModules = useMemo(() => {
    let result = [...modules];

    // Apply filter
    if (filterText) {
      const searchLower = filterText.toLowerCase();
      result = result.filter(m => 
        m.type.toLowerCase().includes(searchLower) ||
        getModuleDisplayName(m.type).toLowerCase().includes(searchLower)
      );
    }

    // Apply sort
    switch (sortOrder) {
      case 'name':
        result.sort((a, b) => getModuleDisplayName(a.type).localeCompare(getModuleDisplayName(b.type)));
        break;
      case 'type':
        result.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'index':
      default:
        // Keep original order (index = z-order, top = front)
        break;
    }

    return result;
  }, [modules, filterText, sortOrder]);

  // Handle selection
  const handleSelect = useCallback((instanceId: string, multiSelect: boolean) => {
    if (multiSelect) {
      addToSelection(instanceId);
    } else {
      clearSelection();
      useMachineStore.getState().selectModule(instanceId);
    }
  }, [addToSelection, clearSelection]);

  // Handle visibility toggle
  const handleToggleVisibility = useCallback((instanceId: string) => {
    const module = modules.find(m => m.instanceId === instanceId);
    if (!module) return;

    const newVisibility = (module as any).isVisible === false ? true : false;
    
    // Store visibility state
    useMachineStore.setState((state) => ({
      modules: state.modules.map(m => 
        m.instanceId === instanceId 
          ? { ...m, isVisible: newVisibility } as any
          : m
      ),
    }));
  }, [modules]);

  // Handle z-order changes
  const handleMoveUp = useCallback((instanceId: string) => {
    const newModules = bringForward(instanceId, modules);
    if (newModules !== modules) {
      setModulesOrder(newModules.map(m => m.instanceId));
    }
  }, [modules, setModulesOrder]);

  const handleMoveDown = useCallback((instanceId: string) => {
    const newModules = sendBackward(instanceId, modules);
    if (newModules !== modules) {
      setModulesOrder(newModules.map(m => m.instanceId));
    }
  }, [modules, setModulesOrder]);

  const handleMoveToTop = useCallback((instanceId: string) => {
    const newModules = bringToFront(instanceId, modules);
    if (newModules !== modules) {
      setModulesOrder(newModules.map(m => m.instanceId));
    }
  }, [modules, setModulesOrder]);

  const handleMoveToBottom = useCallback((instanceId: string) => {
    const newModules = sendToBack(instanceId, modules);
    if (newModules !== modules) {
      setModulesOrder(newModules.map(m => m.instanceId));
    }
  }, [modules, setModulesOrder]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsCollapsed(true);
    }
  }, []);

  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-[#121826] border-l border-[#1e2a42] flex flex-col items-center py-2">
        <button
          data-testid="layers-panel-expand"
          onClick={() => setIsCollapsed(false)}
          className="w-8 h-8 rounded flex items-center justify-center text-[#9ca3af] hover:text-white hover:bg-[#2d3748] transition-colors"
          title="展开图层"
        >
          📑
        </button>
        <div className="text-xs text-[#6b7280] mt-2 writing-vertical">
          图层
        </div>
      </div>
    );
  }

  return (
    <div 
      data-testid="layers-panel"
      className="w-64 h-full bg-[#121826] border-l border-[#1e2a42] flex flex-col"
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#1e2a42]">
        <div className="flex items-center gap-2">
          <span className="text-lg">📑</span>
          <h2 className="text-sm font-semibold text-white">图层</h2>
          <span className="text-xs text-[#6b7280]">({filteredModules.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            data-testid="layers-panel-collapse"
            onClick={() => setIsCollapsed(true)}
            className="w-6 h-6 rounded flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#2d3748] transition-colors"
            title="收起图层"
          >
            ◀
          </button>
        </div>
      </div>

      {/* Filter and Sort */}
      <div className="p-2 border-b border-[#1e2a42] space-y-2">
        <input
          type="text"
          data-testid="layers-filter-input"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="搜索模块..."
          className="w-full px-2 py-1 rounded bg-[#0a0e17] border border-[#2d3748] text-sm text-[#e2e8f0] placeholder-[#6b7280] focus:outline-none focus:border-[#3b82f6]"
        />
        <div className="flex gap-1">
          <button
            data-testid="layers-sort-index"
            onClick={() => setSortOrder('index')}
            className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
              sortOrder === 'index' 
                ? 'bg-[#3b82f6] text-white' 
                : 'bg-[#1a1a2e] text-[#9ca3af] hover:text-white'
            }`}
          >
            顺序
          </button>
          <button
            data-testid="layers-sort-name"
            onClick={() => setSortOrder('name')}
            className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
              sortOrder === 'name' 
                ? 'bg-[#3b82f6] text-white' 
                : 'bg-[#1a1a2e] text-[#9ca3af] hover:text-white'
            }`}
          >
            名称
          </button>
          <button
            data-testid="layers-sort-type"
            onClick={() => setSortOrder('type')}
            className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
              sortOrder === 'type' 
                ? 'bg-[#3b82f6] text-white' 
                : 'bg-[#1a1a2e] text-[#9ca3af] hover:text-white'
            }`}
          >
            类型
          </button>
        </div>
      </div>

      {/* Layer list */}
      <div 
        data-testid="layers-list"
        className="flex-1 overflow-y-auto p-2"
      >
        {filteredModules.length === 0 ? (
          <div className="text-center py-8 text-[#6b7280]">
            {modules.length === 0 ? (
              <>
                <div className="text-2xl mb-2">📭</div>
                <p className="text-sm">没有模块</p>
                <p className="text-xs">从模块面板拖入模块</p>
              </>
            ) : (
              <>
                <div className="text-2xl mb-2">🔍</div>
                <p className="text-sm">没有匹配的模块</p>
              </>
            )}
          </div>
        ) : (
          filteredModules.map((module) => (
            <LayerItem
              key={module.instanceId}
              module={module}
              isSelected={selectedModuleIds.includes(module.instanceId)}
              onSelect={handleSelect}
              onToggleVisibility={handleToggleVisibility}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onMoveToTop={handleMoveToTop}
              onMoveToBottom={handleMoveToBottom}
            />
          ))
        )}
      </div>

      {/* Footer with stats */}
      <div className="p-2 border-t border-[#1e2a42] text-xs text-[#6b7280]">
        <div className="flex justify-between">
          <span>模块: {modules.length}</span>
          <span>可见: {modules.filter(m => (m as any).isVisible !== false).length}</span>
        </div>
      </div>
    </div>
  );
}

export default LayersPanel;
