import { useState, useRef, useEffect } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { useSelectionStore } from '../../store/useSelectionStore';
import { alignModules, AlignmentType } from '../../utils/alignmentUtils';
import { bringForward, sendBackward, bringToFront, sendToBack } from '../../utils/zOrderUtils';
import { autoArrange } from '../../utils/autoLayout';

interface AlignmentToolbarProps {
  visible: boolean;
}

export function AlignmentToolbar({ visible }: AlignmentToolbarProps) {
  const [showAlignmentMenu, setShowAlignmentMenu] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const alignmentMenuRef = useRef<HTMLDivElement>(null);
  const layerMenuRef = useRef<HTMLDivElement>(null);

  const modules = useMachineStore((state) => state.modules);
  const updateModulePosition = useMachineStore((state) => state.updateModulePosition);
  const saveToHistory = useMachineStore((state) => state.saveToHistory);
  const setModulesOrder = useMachineStore((state) => state.setModulesOrder);

  const selectedModuleIds = useSelectionStore((state) => state.selectedModuleIds);
  const clearSelection = useSelectionStore((state) => state.clearSelection);

  const selectedModules = modules.filter((m) => selectedModuleIds.includes(m.instanceId));
  const canAlign = selectedModules.length >= 2;
  const canAutoLayout = selectedModules.length >= 3;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (alignmentMenuRef.current && !alignmentMenuRef.current.contains(e.target as Node)) {
        setShowAlignmentMenu(false);
      }
      if (layerMenuRef.current && !layerMenuRef.current.contains(e.target as Node)) {
        setShowLayerMenu(false);
      }
    };

    if (showAlignmentMenu || showLayerMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAlignmentMenu, showLayerMenu]);

  const handleAlign = (alignment: AlignmentType) => {
    if (!canAlign) return;

    const alignedModules = alignModules(selectedModules, alignment);
    
    // Update positions
    alignedModules.forEach((alignedModule) => {
      const original = selectedModules.find((m) => m.instanceId === alignedModule.instanceId);
      if (original && (original.x !== alignedModule.x || original.y !== alignedModule.y)) {
        updateModulePosition(alignedModule.instanceId, alignedModule.x, alignedModule.y);
      }
    });

    saveToHistory();
    setShowAlignmentMenu(false);
  };

  const handleBringForward = () => {
    if (selectedModuleIds.length === 0) return;
    const newOrder = bringForward(selectedModuleIds[0], modules);
    const newOrderIds = newOrder.map(m => m.instanceId);
    setModulesOrder(newOrderIds);
    setShowLayerMenu(false);
  };

  const handleSendBackward = () => {
    if (selectedModuleIds.length === 0) return;
    const newOrder = sendBackward(selectedModuleIds[0], modules);
    const newOrderIds = newOrder.map(m => m.instanceId);
    setModulesOrder(newOrderIds);
    setShowLayerMenu(false);
  };

  const handleBringToFront = () => {
    if (selectedModuleIds.length === 0) return;
    const newOrder = bringToFront(selectedModuleIds[0], modules);
    const newOrderIds = newOrder.map(m => m.instanceId);
    setModulesOrder(newOrderIds);
    setShowLayerMenu(false);
  };

  const handleSendToBack = () => {
    if (selectedModuleIds.length === 0) return;
    const newOrder = sendToBack(selectedModuleIds[0], modules);
    const newOrderIds = newOrder.map(m => m.instanceId);
    setModulesOrder(newOrderIds);
    setShowLayerMenu(false);
  };

  const handleAutoLayout = () => {
    if (!canAutoLayout) return;

    const result = autoArrange(selectedModules, [], {
      containerWidth: 800,
      containerHeight: 600,
      padding: 60,
      moduleGapX: 40,
      moduleGapY: 40,
      maxColumns: 3,
    });

    // Update positions
    result.modules.forEach((alignedModule) => {
      const original = selectedModules.find((m) => m.instanceId === alignedModule.instanceId);
      if (original && (original.x !== alignedModule.x || original.y !== alignedModule.y)) {
        updateModulePosition(alignedModule.instanceId, alignedModule.x, alignedModule.y);
      }
    });

    saveToHistory();
  };

  if (!visible) return null;

  return (
    <div 
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-2 bg-[#121826]/95 border border-[#1e2a42] rounded-lg shadow-lg backdrop-blur-sm"
      role="toolbar"
      aria-label="对齐和图层工具"
    >
      {/* Selection count */}
      <div className="flex items-center gap-2 mr-2 text-xs text-[#9ca3af]">
        <span className="px-2 py-0.5 bg-[#1e2a42] rounded">
          {selectedModuleIds.length} 已选择
        </span>
      </div>

      {/* Alignment Dropdown */}
      <div className="relative" ref={alignmentMenuRef}>
        <button
          onClick={() => setShowAlignmentMenu(!showAlignmentMenu)}
          disabled={!canAlign}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-[#1e2a42] text-[#9ca3af] hover:text-white hover:bg-[#2a3548] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="对齐选项"
          aria-label="对齐选项"
          aria-haspopup="true"
          aria-expanded={showAlignmentMenu}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M2 3h10M2 7h10M2 11h10" />
          </svg>
          <span>对齐</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
            <path d="M2 4l3 3 3-3" />
          </svg>
        </button>

        {showAlignmentMenu && (
          <div 
            className="absolute top-full mt-1 left-0 w-44 bg-[#121826] border border-[#1e2a42] rounded-lg shadow-xl z-30 py-1"
            role="menu"
          >
            <button
              onClick={() => handleAlign('left')}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#9ca3af] hover:text-white hover:bg-[#1e2a42] transition-colors"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M3 2v12M8 4v10M13 6v8" />
              </svg>
              <span>左对齐</span>
            </button>
            <button
              onClick={() => handleAlign('center')}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#9ca3af] hover:text-white hover:bg-[#1e2a42] transition-colors"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M8 2v12M4 4v8M12 6v4" />
              </svg>
              <span>水平居中</span>
            </button>
            <button
              onClick={() => handleAlign('right')}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#9ca3af] hover:text-white hover:bg-[#1e2a42] transition-colors"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M13 2v12M8 4v10M3 6v8" />
              </svg>
              <span>右对齐</span>
            </button>
            <div className="h-px bg-[#1e2a42] my-1" />
            <button
              onClick={() => handleAlign('top')}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#9ca3af] hover:text-white hover:bg-[#1e2a42] transition-colors"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M2 3h12M4 8h8M6 13h4" />
              </svg>
              <span>顶对齐</span>
            </button>
            <button
              onClick={() => handleAlign('middle')}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#9ca3af] hover:text-white hover:bg-[#1e2a42] transition-colors"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M2 8h12M4 4v8M6 12v-8M12 6v4" />
              </svg>
              <span>垂直居中</span>
            </button>
            <button
              onClick={() => handleAlign('bottom')}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#9ca3af] hover:text-white hover:bg-[#1e2a42] transition-colors"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M2 13h12M4 8h8M6 3h4" />
              </svg>
              <span>底对齐</span>
            </button>
          </div>
        )}
      </div>

      {/* Layer Controls Dropdown */}
      <div className="relative" ref={layerMenuRef}>
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          disabled={selectedModuleIds.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-[#1e2a42] text-[#9ca3af] hover:text-white hover:bg-[#2a3548] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="图层选项"
          aria-label="图层选项"
          aria-haspopup="true"
          aria-expanded={showLayerMenu}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="2" y="2" width="10" height="10" rx="1" />
            <rect x="4" y="4" width="6" height="6" rx="0.5" />
          </svg>
          <span>图层</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
            <path d="M2 4l3 3 3-3" />
          </svg>
        </button>

        {showLayerMenu && (
          <div 
            className="absolute top-full mt-1 left-0 w-44 bg-[#121826] border border-[#1e2a42] rounded-lg shadow-xl z-30 py-1"
            role="menu"
          >
            <button
              onClick={handleBringToFront}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#9ca3af] hover:text-white hover:bg-[#1e2a42] transition-colors"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="4" y="4" width="8" height="8" rx="1" />
                <rect x="2" y="2" width="8" height="8" rx="1" strokeDasharray="2 2" />
              </svg>
              <span>置于顶层</span>
            </button>
            <button
              onClick={handleBringForward}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#9ca3af] hover:text-white hover:bg-[#1e2a42] transition-colors"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M8 4v8M4 8h8" />
              </svg>
              <span>上移一层</span>
            </button>
            <button
              onClick={handleSendBackward}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#9ca3af] hover:text-white hover:bg-[#1e2a42] transition-colors"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M8 8v-8M4 8h8" />
              </svg>
              <span>下移一层</span>
            </button>
            <button
              onClick={handleSendToBack}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[#9ca3af] hover:text-white hover:bg-[#1e2a42] transition-colors"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="2" y="2" width="8" height="8" rx="1" strokeDasharray="2 2" />
                <rect x="4" y="4" width="8" height="8" rx="1" />
              </svg>
              <span>置于底层</span>
            </button>
          </div>
        )}
      </div>

      {/* Auto Layout Button */}
      <button
        onClick={handleAutoLayout}
        disabled={!canAutoLayout}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-[#1e2a42] text-[#9ca3af] hover:text-white hover:bg-[#2a3548] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="自动排列 (需要3个以上模块)"
        aria-label="自动排列"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="2" y="2" width="4" height="4" rx="0.5" />
          <rect x="8" y="2" width="4" height="4" rx="0.5" />
          <rect x="2" y="8" width="4" height="4" rx="0.5" />
          <rect x="8" y="8" width="4" height="4" rx="0.5" />
        </svg>
        <span>自动排列</span>
      </button>

      {/* Clear Selection Button */}
      <button
        onClick={clearSelection}
        className="p-1.5 rounded text-[#9ca3af] hover:text-white hover:bg-[#1e2a42] transition-colors"
        title="清除选择"
        aria-label="清除选择"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M3 3l8 8M11 3l-8 8" />
        </svg>
      </button>
    </div>
  );
}

export default AlignmentToolbar;
