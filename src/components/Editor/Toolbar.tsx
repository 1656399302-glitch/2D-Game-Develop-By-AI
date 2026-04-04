import { useState, useRef, useCallback, useEffect } from 'react';
import { useMachineStore } from '../../store/useMachineStore';
import { useCommunityStore } from '../../store/useCommunityStore';
import { useMachineStatsStore } from '../../store/useMachineStatsStore';
import { useCodexStore } from '../../store/useCodexStore';
import { useTemplateStore } from '../../store/useTemplateStore';
import { useCircuitCanvasStore } from '../../store/useCircuitCanvasStore';
import { CollectionStatsPanel } from '../Stats/CollectionStatsPanel';
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

export interface ToolbarProps {
  onOpenRecipeBrowser?: () => void;
  onOpenRandomGenerator?: () => void;
  onOpenTemplateLibrary?: () => void;
  onOpenSaveTemplate?: () => void;
}

// Granular selectors for performance optimization (AC1: Re-render Reduction)
const useModulesCount = () => useMachineStore((state) => state.modules.length);
const useConnectionsCount = () => useMachineStore((state) => state.connections.length);
const useViewportZoom = () => useMachineStore((state) => state.viewport.zoom);
const useHistoryIndex = () => useMachineStore((state) => state.historyIndex);
const useHistoryLength = () => useMachineStore((state) => state.history.length);
const useSelectedModuleId = () => useMachineStore((state) => state.selectedModuleId);
const useCanUndo = () => useMachineStore((state) => state.historyIndex > 0);
const useCanRedo = () => {
  const historyIndex = useMachineStore((state) => state.historyIndex);
  const historyLength = useMachineStore((state) => state.history.length);
  return historyIndex < historyLength - 1;
};

// Circuit store selectors
const useCircuitNodeCount = () => useCircuitCanvasStore((state) => state.nodes.length);
const useIsCircuitMode = () => useCircuitCanvasStore((state) => state.isCircuitMode);

export function Toolbar({ 
  onOpenRecipeBrowser, 
  onOpenRandomGenerator,
  onOpenTemplateLibrary,
  onOpenSaveTemplate,
}: ToolbarProps = {}) {
  // Use granular selectors to prevent unnecessary re-renders (AC1)
  const modulesCount = useModulesCount();
  const connectionsCount = useConnectionsCount();
  const viewportZoom = useViewportZoom();
  const historyIndex = useHistoryIndex();
  const historyLength = useHistoryLength();
  const selectedModuleId = useSelectedModuleId();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  
  // Circuit mode selectors
  const circuitNodeCount = useCircuitNodeCount();
  const isCircuitMode = useIsCircuitMode();
  
  // Get action functions (stable references)
  const undo = useMachineStore((state) => state.undo);
  const redo = useMachineStore((state) => state.redo);
  const clearCanvas = useMachineStore((state) => state.clearCanvas);
  const activateFailureMode = useMachineStore((state) => state.activateFailureMode);
  const activateOverloadMode = useMachineStore((state) => state.activateOverloadMode);
  const zoomIn = useMachineStore((state) => state.zoomIn);
  const zoomOut = useMachineStore((state) => state.zoomOut);
  const resetViewport = useMachineStore((state) => state.resetViewport);
  const zoomToFit = useMachineStore((state) => state.zoomToFit);
  const duplicateModule = useMachineStore((state) => state.duplicateModule);
  const updateModulesBatch = useMachineStore((state) => state.updateModulesBatch);
  const saveToHistory = useMachineStore((state) => state.saveToHistory);
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  
  // Circuit store actions
  const setCircuitMode = useCircuitCanvasStore((state) => state.setCircuitMode);
  const runCircuitSimulation = useCircuitCanvasStore((state) => state.runCircuitSimulation);
  const resetCircuitSimulation = useCircuitCanvasStore((state) => state.resetCircuitSimulation);
  const clearCircuitCanvas = useCircuitCanvasStore((state) => state.clearCircuitCanvas);
  
  // Community store selectors
  const communityMachines = useCommunityStore((state) => state.communityMachines);
  const publishedMachines = useCommunityStore((state) => state.publishedMachines);
  const totalCommunityCount = communityMachines.length + publishedMachines.length;
  
  // Template store selectors
  const templatesCount = useTemplateStore((state) => state.templates.length);
  
  // Stats store selectors
  const toggleStatsPanel = useMachineStatsStore((state) => state.togglePanel);
  const isStatsPanelOpen = useMachineStatsStore((state) => state.isPanelOpen);

  // Codex store selectors
  const codexEntryCount = useCodexStore((state) => state.entries.length);

  // Collection stats panel state
  const [showCollectionStats, setShowCollectionStats] = useState(false);

  // Store method reference in ref
  const openGalleryRef = useRef(useCommunityStore.getState().openGallery);

  // Periodically sync ref
  useEffect(() => {
    openGalleryRef.current = useCommunityStore.getState().openGallery;
  });

  // Create stable callback using ref
  const handleOpenGallery = useCallback(() => {
    openGalleryRef.current();
  }, []);

  const handleOpenRecipeBrowser = useCallback(() => {
    onOpenRecipeBrowser?.();
  }, [onOpenRecipeBrowser]);

  const handleOpenRandomGenerator = useCallback(() => {
    onOpenRandomGenerator?.();
  }, [onOpenRandomGenerator]);

  const handleOpenTemplateLibrary = useCallback(() => {
    onOpenTemplateLibrary?.();
  }, [onOpenTemplateLibrary]);

  const handleOpenSaveTemplate = useCallback(() => {
    onOpenSaveTemplate?.();
  }, [onOpenSaveTemplate]);

  const handleOpenCollectionStats = useCallback(() => {
    setShowCollectionStats(true);
  }, []);

  const handleCloseCollectionStats = useCallback(() => {
    setShowCollectionStats(false);
  }, []);

  // Circuit mode toggle handler
  const handleCircuitModeToggle = useCallback(() => {
    setCircuitMode(!isCircuitMode);
  }, [isCircuitMode, setCircuitMode]);

  // Circuit simulation handlers
  const handleCircuitRun = useCallback(() => {
    if (!isCircuitMode) {
      setCircuitMode(true);
    }
    runCircuitSimulation();
  }, [isCircuitMode, setCircuitMode, runCircuitSimulation]);

  const handleCircuitReset = useCallback(() => {
    resetCircuitSimulation();
  }, [resetCircuitSimulation]);

  const handleCircuitClear = useCallback(() => {
    clearCircuitCanvas();
    setCircuitMode(false);
  }, [clearCircuitCanvas, setCircuitMode]);

  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [activeLayout, setActiveLayout] = useState<LayoutType | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleDuplicate = useCallback(() => {
    if (selectedModuleId) {
      duplicateModule(selectedModuleId);
    }
  }, [selectedModuleId, duplicateModule]);

  const applyLayout = useCallback((layoutType: LayoutType) => {
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
  }, [modules, connections, updateModulesBatch, saveToHistory]);

  const handleLayoutSelect = useCallback((layoutType: LayoutType) => {
    applyLayout(layoutType);
    setShowLayoutMenu(false);
  }, [applyLayout]);

  return (
    <>
      <div 
        className="flex items-center gap-4 px-4 py-2 bg-[#121826] border-b border-[#1e2a42]"
        role="toolbar"
        aria-label="编辑器工具栏"
        data-tutorial-action="toolbar"
      >
        {/* Left side - stats */}
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          <span className="text-xs text-[#4a5568]">
            模块: <span className="text-[#00d4ff]">{modulesCount}</span>
          </span>
          <span className="text-[#1e2a42]" aria-hidden="true">|</span>
          <span className="text-xs text-[#4a5568]">
            连接: <span className="text-[#00ffcc]">{connectionsCount}</span>
          </span>
          {/* Circuit mode stats */}
          {isCircuitMode && circuitNodeCount > 0 && (
            <>
              <span className="text-[#1e2a42]" aria-hidden="true">|</span>
              <span className="text-xs text-[#4a5568]">
                电路: <span className="text-[#22c55e]">{circuitNodeCount}</span>
              </span>
            </>
          )}
        </div>

        {/* Center - Test Mode buttons, Auto-Layout, Recipe Button, and Random Generator */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-3">
            {/* Random Generator Button - Opens the Random Generator Modal */}
            <button
              onClick={handleOpenRandomGenerator}
              data-tutorial-action="toolbar-random-forge"
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded bg-[#00d4ff]/20 text-[#00d4ff] hover:bg-[#00d4ff]/30 border border-[#00d4ff]/40 transition-colors"
              title="随机锻造 - 生成随机机器"
              aria-label="随机锻造"
            >
              <span aria-hidden="true">🎲</span>
              <span>随机生成</span>
            </button>

            {/* Recipe Button - Opens the Recipe Browser */}
            <button
              onClick={handleOpenRecipeBrowser}
              data-tutorial-action="toolbar-recipe"
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded bg-[#a855f7]/20 text-[#a855f7] hover:bg-[#a855f7]/30 border border-[#a855f7]/40 transition-colors"
              title="配方图鉴 - 查看所有模块配方"
              aria-label="配方"
            >
              <span aria-hidden="true">📜</span>
              <span>配方</span>
            </button>

            {/* Templates Button - Opens the Template Library */}
            <button
              onClick={handleOpenTemplateLibrary}
              data-tutorial-action="toolbar-template"
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded bg-[#f59e0b]/20 text-[#f59e0b] hover:bg-[#f59e0b]/30 border border-[#f59e0b]/40 transition-colors"
              title="模板库 - 浏览和管理保存的模板"
              aria-label="模板库"
            >
              <span aria-hidden="true">📋</span>
              <span>模板</span>
              {templatesCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#f59e0b]/40 text-[10px] font-medium">
                  {templatesCount}
                </span>
              )}
            </button>

            {/* Save Template Button - Opens the Save Template Modal */}
            <button
              onClick={handleOpenSaveTemplate}
              data-tutorial-action="toolbar-save"
              disabled={modulesCount === 0}
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded bg-[#f59e0b]/10 text-[#f59e0b] hover:bg-[#f59e0b]/20 border border-[#f59e0b]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="保存模板 - 将当前机器保存为模板"
              aria-label="保存模板"
            >
              <span aria-hidden="true">💾</span>
              <span>保存</span>
            </button>

            <div className="w-px h-4 bg-[#1e2a42] mx-1" aria-hidden="true" />

            {/* Auto-Layout Button with Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                disabled={modulesCount === 0}
                data-tutorial-action="toolbar-layout"
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
                data-tutorial-action="toolbar-test-failure"
                className="px-3 py-1 text-xs rounded bg-[#7f1d1d] text-[#fca5a5] hover:bg-[#991b1b] hover:text-[#fecaca] border border-[#ef4444]/50 transition-colors"
                title="测试故障模式"
                aria-label="测试故障模式"
              >
                ⚠ 测试故障
              </button>

              <button
                onClick={activateOverloadMode}
                data-tutorial-action="toolbar-test-overload"
                className="px-3 py-1 text-xs rounded bg-[#78350f] text-[#fdba74] hover:bg-[#92400e] hover:text-[#fed7aa] border border-[#f97316]/50 transition-colors"
                title="测试过载模式"
                aria-label="测试过载"
              >
                ⚡ 测试过载
              </button>
            </div>

            {/* Circuit Mode Toggle - Round 122 */}
            <div className="w-px h-4 bg-[#1e2a42] mx-1" aria-hidden="true" />
            
            <button
              onClick={handleCircuitModeToggle}
              data-tutorial-action="toolbar-circuit-mode"
              className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded border transition-colors ${
                isCircuitMode
                  ? 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/50 hover:bg-[#22c55e]/30'
                  : 'bg-[#1e2a42] text-[#9ca3af] border-[#2d3a4f] hover:text-[#22c55e] hover:border-[#22c55e]/50'
              }`}
              title="电路模式 - 设计逻辑电路"
              aria-label={isCircuitMode ? '关闭电路模式' : '开启电路模式'}
              aria-pressed={isCircuitMode}
            >
              <span aria-hidden="true">⚡</span>
              <span>电路模式</span>
            </button>

            {/* Circuit Simulation Controls - shown when circuit mode is active */}
            {isCircuitMode && (
              <div className="flex items-center gap-1" role="group" aria-label="电路模拟控制">
                <button
                  onClick={handleCircuitRun}
                  data-tutorial-action="toolbar-circuit-run"
                  className="px-2 py-1 text-xs rounded bg-[#0ea5e9] text-white hover:bg-[#0284c7] border border-[#0ea5e9]/50 transition-colors"
                  title="运行电路模拟 (R)"
                  aria-label="运行电路模拟"
                >
                  ▶ 运行
                </button>
                
                <button
                  onClick={handleCircuitReset}
                  data-tutorial-action="toolbar-circuit-reset"
                  className="px-2 py-1 text-xs rounded bg-[#ef4444] text-white hover:bg-[#dc2626] border border-[#ef4444]/50 transition-colors"
                  title="重置电路模拟 (X)"
                  aria-label="重置电路模拟"
                >
                  ↺
                </button>
                
                {circuitNodeCount > 0 && (
                  <button
                    onClick={handleCircuitClear}
                    data-tutorial-action="toolbar-circuit-clear"
                    className="px-2 py-1 text-xs rounded bg-[#1e2a42] text-[#9ca3af] hover:text-[#ef4444] border border-[#2d3a4f] transition-colors"
                    title="清空电路"
                    aria-label="清空电路"
                  >
                    清空
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side - actions */}
        <div className="flex items-center gap-2">
          {/* Collection Stats Button - NEW (Round 65) */}
          <button
            data-testid="collection-stats-button"
            data-tutorial-action="toolbar-collection-stats"
            onClick={handleOpenCollectionStats}
            className="flex items-center gap-1.5 px-3 py-1 text-xs rounded bg-[#f59e0b]/10 text-[#f59e0b] hover:bg-[#f59e0b]/20 border border-[#f59e0b]/30 transition-colors"
            title="图鉴统计 - 查看收藏统计"
            aria-label="图鉴统计"
          >
            <span aria-hidden="true">📊</span>
            <span>收藏统计</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#f59e0b]/20 text-[10px] font-medium">
              {codexEntryCount}
            </span>
          </button>

          {/* Community Gallery Button */}
          <button
            onClick={handleOpenGallery}
            data-tutorial-action="toolbar-community"
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
            data-tutorial-action="toolbar-stats"
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
              data-tutorial-action="toolbar-zoom-out"
              className="p-1.5 rounded hover:bg-[#1e2a42] transition-colors text-[#9ca3af] hover:text-white"
              title="缩小 (-) (快捷键: -)"
              aria-label="缩小"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="6" cy="6" r="5" />
                <path d="M4 6h4" />
              </svg>
            </button>

            <span className="text-xs text-[#4a5568] w-10 text-center" aria-label={`当前缩放 ${Math.round(viewportZoom * 100)}%`}>
              {Math.round(viewportZoom * 100)}%
            </span>

            <button
              onClick={zoomIn}
              data-tutorial-action="toolbar-zoom-in"
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
              data-tutorial-action="toolbar-zoom-reset"
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
              data-tutorial-action="toolbar-zoom-fit"
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
            data-tutorial-action="toolbar-duplicate"
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
            data-tutorial-action="toolbar-undo"
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
            data-tutorial-action="toolbar-redo"
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

          <span className="text-xs text-[#4a5568] mx-1" aria-label={`历史记录 ${historyIndex + 1} / ${historyLength || 1}`}>
            {historyIndex + 1}/{historyLength || 1}
          </span>

          <div className="w-px h-4 bg-[#1e2a42] mx-1" aria-hidden="true" />

          {/* Clear button */}
          <button
            onClick={clearCanvas}
            data-tutorial-action="toolbar-clear"
            disabled={modulesCount === 0}
            className="px-2 py-1 text-xs rounded bg-[#1e2a42] text-[#9ca3af] hover:text-[#ef4444] hover:bg-[#7f1d1d]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="清空全部"
            aria-label="清空全部"
          >
            清空全部
          </button>
        </div>
      </div>

      {/* Collection Stats Panel - NEW (Round 65) */}
      {showCollectionStats && (
        <CollectionStatsPanel onClose={handleCloseCollectionStats} />
      )}
    </>
  );
}

export default Toolbar;
