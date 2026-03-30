import { useState, useRef, useEffect, useCallback } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { useCommunityStore } from '../../store/useCommunityStore';
import { useMachineStatsStore } from '../../store/useMachineStatsStore';
import { 
  autoArrange, 
  autoArrangeCircular, 
  autoArrangeLine, 
  autoArrangeCascade 
} from '../../utils/autoLayout';

export type LayoutType = 'grid' | 'line' | 'circle' | 'cascade';

const LAYOUT_OPTIONS: { type: LayoutType; label: string; icon: string }[] = [
  { type: 'grid', label: '网格', icon: '⊞' },
  { type: 'line', label: '线性', icon: '☰' },
  { type: 'circle', label: '环形', icon: '◎' },
  { type: 'cascade', label: '层叠', icon: '⫷' },
];

export function Toolbar() {
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const viewport = useMachineStore((state) => state.viewport);
  const undo = useMachineStore((state) => state.undo);
  const redo = useMachineStore((state) => state.redo);
  const history = useMachineStore((state) => state.history);
  const historyIndex = useMachineStore((state) => state.historyIndex);
  const clearCanvas = useMachineStore((state) => state.clearCanvas);
  const activateFailureMode = useMachineStore((state) => state.activateFailureMode);
  const activateOverloadMode = useMachineStore((state) => state.activateOverloadMode);
  const zoomIn = useMachineStore((state) => state.zoomIn);
  const zoomOut = useMachineStore((state) => state.zoomOut);
  const resetViewport = useMachineStore((state) => state.resetViewport);
  const zoomToFit = useMachineStore((state) => state.zoomToFit);
  const selectedModuleId = useMachineStore((state) => state.selectedModuleId);
  const duplicateModule = useMachineStore((state) => state.duplicateModule);
  const updateModulesBatch = useMachineStore((state) => state.updateModulesBatch);
  const saveToHistory = useMachineStore((state) => state.saveToHistory);
  const communityMachines = useCommunityStore((state) => state.communityMachines);
  const publishedMachines = useCommunityStore((state) => state.publishedMachines);
  const toggleStatsPanel = useMachineStatsStore((state) => state.togglePanel);
  const isStatsPanelOpen = useMachineStatsStore((state) => state.isPanelOpen);

  // FIX: Store method reference in ref
  const openGalleryRef = useRef(useCommunityStore.getState().openGallery);

  // FIX: Periodically sync ref
  useEffect(() => {
    openGalleryRef.current = useCommunityStore.getState().openGallery;
  });

  // FIX: Create stable callback using ref
  const handleOpenGallery = useCallback(() => {
    openGalleryRef.current();
  }, []);

  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [activeLayout, setActiveLayout] = useState<LayoutType | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Total community count
  const totalCommunityCount = communityMachines.length + publishedMachines.length;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLayoutMenu(false);
      }
    }

    if (showLayoutMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLayoutMenu]);

  // Keyboard navigation
  useEffect(() => {
    if (!showLayoutMenu) return;

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        case 'Escape':
          setShowLayoutMenu(false);
          break;
        case 'ArrowDown':
        case 'ArrowUp':
          event.preventDefault();
          const currentIndex = activeLayout
            ? LAYOUT_OPTIONS.findIndex(o => o.type === activeLayout)
            : -1;
          const nextIndex = event.key === 'ArrowDown'
            ? Math.min(currentIndex + 1, LAYOUT_OPTIONS.length - 1)
            : Math.max(currentIndex - 1, 0);
          setActiveLayout(LAYOUT_OPTIONS[nextIndex].type);
          break;
        case 'Enter':
        case ' ':
          if (activeLayout) {
            applyLayout(activeLayout);
            setShowLayoutMenu(false);
          }
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLayoutMenu, activeLayout]);

  const handleDuplicate = () => {
    if (selectedModuleId) {
      duplicateModule(selectedModuleId);
    }
  };

  const applyLayout = (layoutType: LayoutType) => {
    if (modules.length === 0) return;

    const containerWidth = 800;
    const containerHeight = 600;

    let result;
    switch (layoutType) {
      case 'grid':
        result = autoArrange(modules, connections, { containerWidth, containerHeight });
        break;
      case 'circle':
        result = autoArrangeCircular(modules, connections, { containerWidth, containerHeight });
        break;
      case 'line':
        result = autoArrangeLine(modules, connections, { containerWidth, containerHeight });
        break;
      case 'cascade':
        result = autoArrangeCascade(modules, connections, { containerWidth, containerHeight });
        break;
    }

    // Update module positions using batch update
    const updates = result.modules.map(m => ({
      instanceId: m.instanceId,
      x: m.x,
      y: m.y,
    }));

    updateModulesBatch(updates);
    saveToHistory(); // Save to history after layout change
    setActiveLayout(layoutType);
  };

  const handleLayoutSelect = (layoutType: LayoutType) => {
    applyLayout(layoutType);
    setShowLayoutMenu(false);
  };

  return (
    <div 
      className="flex items-center gap-4 px-4 py-2 bg-[#121826] border-b border-[#1e2a42]"
      role="toolbar"
      aria-label="编辑器工具栏"
    >
      {/* Left side - stats */}
      <div className="flex items-center gap-2" role="status" aria-live="polite">
        <span className="text-xs text-[#4a5568]">
          模块: <span className="text-[#00d4ff]">{modules.length}</span>
        </span>
        <span className="text-[#1e2a42]" aria-hidden="true">|</span>
        <span className="text-xs text-[#4a5568]">
          连接: <span className="text-[#00ffcc]">{connections.length}</span>
        </span>
      </div>

      {/* Center - Test Mode buttons and Auto-Layout */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-3">
          {/* Auto-Layout Button with Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              disabled={modules.length === 0}
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded bg-[#1e2a42] text-[#9ca3af] hover:text-white hover:bg-[#2d3a4f] disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-[#2d3a4f]"
              title="自动布局"
              aria-label="自动布局"
              aria-haspopup="true"
              aria-expanded={showLayoutMenu}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="2" y="2" width="4" height="4" rx="0.5" />
                <rect x="8" y="2" width="4" height="4" rx="0.5" />
                <rect x="2" y="8" width="4" height="4" rx="0.5" />
                <rect x="8" y="8" width="4" height="4" rx="0.5" />
              </svg>
              <span>布局</span>
              <svg 
                width="10" 
                height="10" 
                viewBox="0 0 10 10" 
                fill="currentColor" 
                aria-hidden="true"
                className={`transition-transform ${showLayoutMenu ? 'rotate-180' : ''}`}
              >
                <path d="M2 4l3 3 3-3" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showLayoutMenu && (
              <div 
                className="absolute top-full left-0 mt-1 py-1 bg-[#1a2235] border border-[#2d3a4f] rounded-md shadow-lg z-50 min-w-[120px]"
                role="menu"
                aria-label="布局选项"
              >
                {LAYOUT_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleLayoutSelect(option.type)}
                    onMouseEnter={() => setActiveLayout(option.type)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                      activeLayout === option.type 
                        ? 'bg-[#2d3a4f] text-white' 
                        : 'text-[#9ca3af] hover:bg-[#252f45] hover:text-white'
                    }`}
                    role="menuitem"
                    aria-selected={activeLayout === option.type}
                  >
                    <span className="w-4 text-center" aria-hidden="true">{option.icon}</span>
                    <span>{option.label}</span>
                    {activeLayout === option.type && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="ml-auto" aria-hidden="true">
                        <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-[#1e2a42] mx-1" aria-hidden="true" />

          {/* Test Mode buttons */}
          <div className="flex items-center gap-2" role="group" aria-label="测试模式">
            <button
              onClick={activateFailureMode}
              className="px-3 py-1 text-xs rounded bg-[#7f1d1d] text-[#fca5a5] hover:bg-[#991b1b] hover:text-[#fecaca] border border-[#ef4444]/50 transition-colors"
              title="测试故障模式"
              aria-label="测试故障模式"
            >
              ⚠ 测试故障
            </button>

            <button
              onClick={activateOverloadMode}
              className="px-3 py-1 text-xs rounded bg-[#78350f] text-[#fdba74] hover:bg-[#92400e] hover:text-[#fed7aa] border border-[#f97316]/50 transition-colors"
              title="测试过载模式"
              aria-label="测试过载模式"
            >
              ⚡ 测试过载
            </button>
          </div>
        </div>
      </div>

      {/* Right side - actions */}
      <div className="flex items-center gap-2">
        {/* Community Gallery Button */}
        <button
          onClick={handleOpenGallery}
          className="flex items-center gap-1.5 px-3 py-1 text-xs rounded bg-[#7c3aed]/20 text-[#a78bfa] hover:bg-[#7c3aed]/30 border border-[#7c3aed]/40 transition-colors"
          title="社区图鉴 - 浏览社区分享的机器"
          aria-label="社区图鉴"
        >
          <span aria-hidden="true">🌐</span>
          <span>社区</span>
          <span className="px-1.5 py-0.5 rounded-full bg-[#7c3aed]/40 text-[10px] font-medium">
            {totalCommunityCount}
          </span>
        </button>

        {/* Statistics Button */}
        <button
          data-testid="stats-button"
          onClick={toggleStatsPanel}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded border transition-colors ${
            isStatsPanelOpen
              ? 'bg-[#22c55e]/30 text-[#22c55e] border-[#22c55e]/50'
              : 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30 hover:bg-[#22c55e]/20'
          }`}
          title="机器统计 - 查看当前机器的分析指标"
          aria-label="机器统计"
          aria-pressed={isStatsPanelOpen}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="2" y="2" width="10" height="10" rx="1" />
            <path d="M5 7v4M9 5v6M4 9v2M10 7v2" />
          </svg>
          <span>统计</span>
        </button>

        <div className="w-px h-4 bg-[#1e2a42] mx-1" aria-hidden="true" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 mr-1" role="group" aria-label="缩放控制">
          <button
            onClick={zoomOut}
            className="p-1.5 rounded hover:bg-[#1e2a42] transition-colors text-[#9ca3af] hover:text-white"
            title="缩小 (-) (快捷键: -)"
            aria-label="缩小"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="6" cy="6" r="5" />
              <path d="M4 6h4" />
            </svg>
          </button>

          <span className="text-xs text-[#4a5568] w-10 text-center" aria-label={`当前缩放 ${Math.round(viewport.zoom * 100)}%`}>
            {Math.round(viewport.zoom * 100)}%
          </span>

          <button
            onClick={zoomIn}
            className="p-1.5 rounded hover:bg-[#1e2a42] transition-colors text-[#9ca3af] hover:text-white"
            title="放大 (+) (快捷键: +)"
            aria-label="放大"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="6" cy="6" r="5" />
              <path d="M6 4v4M4 6h4" />
            </svg>
          </button>

          <button
            onClick={resetViewport}
            className="p-1.5 rounded hover:bg-[#1e2a42] transition-colors text-[#9ca3af] hover:text-white"
            title="重置缩放 (0) (快捷键: 0)"
            aria-label="重置缩放"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="2" y="2" width="10" height="10" rx="1" />
              <circle cx="7" cy="7" r="2" />
            </svg>
          </button>

          <button
            onClick={zoomToFit}
            className="p-1.5 rounded hover:bg-[#1e2a42] transition-colors text-[#9ca3af] hover:text-white"
            title="适应全部 (Shift+0) (快捷键: Shift+0)"
            aria-label="适应全部"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M2 5V2h3M9 2h3v3M12 9v3H9M5 12H2V9" />
            </svg>
          </button>
        </div>

        <div className="w-px h-4 bg-[#1e2a42] mx-1" aria-hidden="true" />

        {/* Duplicate button with keyboard shortcut hint */}
        <button
          onClick={handleDuplicate}
          disabled={!selectedModuleId}
          className="p-1.5 rounded hover:bg-[#1e2a42] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#9ca3af] hover:text-white"
          title="复制模块 (Ctrl+D) (Del)"
          aria-label="复制模块"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="4" y="4" width="8" height="8" rx="1" />
            <path d="M2 10V2h8" />
          </svg>
        </button>

        {/* Undo button with keyboard shortcut hint */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 rounded hover:bg-[#1e2a42] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#9ca3af] hover:text-white"
          title="撤销 (Ctrl+Z)"
          aria-label="撤销"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M3 7h6a3 3 0 0 1 0 6H6" />
            <path d="M5 4L3 7l2 3" />
          </svg>
        </button>

        {/* Redo button with keyboard shortcut hint */}
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 rounded hover:bg-[#1e2a42] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#9ca3af] hover:text-white"
          title="重做 (Ctrl+Shift+Z / Ctrl+Y)"
          aria-label="重做"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M11 7H5a3 3 0 0 0 0 6h3" />
            <path d="M9 4l2 3-2 3" />
          </svg>
        </button>

        <span className="text-xs text-[#4a5568] mx-1" aria-label={`历史记录 ${historyIndex + 1} / ${history.length || 1}`}>
          {historyIndex + 1}/{history.length || 1}
        </span>

        <div className="w-px h-4 bg-[#1e2a42] mx-1" aria-hidden="true" />

        {/* Clear button */}
        <button
          onClick={clearCanvas}
          disabled={modules.length === 0}
          className="px-2 py-1 text-xs rounded bg-[#1e2a42] text-[#9ca3af] hover:text-[#ef4444] hover:bg-[#7f1d1d]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="清空全部"
          aria-label="清空全部"
        >
          清空全部
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
