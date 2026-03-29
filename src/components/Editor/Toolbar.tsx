import { useMachineStore } from '../../store/useMachineStore';

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
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  
  const handleDuplicate = () => {
    if (selectedModuleId) {
      duplicateModule(selectedModuleId);
    }
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
      
      {/* Center - Test Mode buttons */}
      <div className="flex-1 flex justify-center">
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
      
      {/* Right side - actions */}
      <div className="flex items-center gap-2">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 mr-2" role="group" aria-label="缩放控制">
          <button
            onClick={zoomOut}
            className="p-1.5 rounded hover:bg-[#1e2a42] transition-colors text-[#9ca3af] hover:text-white"
            title="缩小 (-) (或按 - 键)"
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
            title="放大 (+) (或按 + 键)"
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
            title="重置缩放 (0) (或按 0 键)"
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
            title="适应全部 (Shift+0) (或按 Shift+0)"
            aria-label="适应全部"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M2 5V2h3M9 2h3v3M12 9v3H9M5 12H2V9" />
            </svg>
          </button>
        </div>
        
        <div className="w-px h-4 bg-[#1e2a42] mx-1" aria-hidden="true" />
        
        {/* Duplicate button */}
        <button
          onClick={handleDuplicate}
          disabled={!selectedModuleId}
          className="p-1.5 rounded hover:bg-[#1e2a42] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#9ca3af] hover:text-white"
          title="复制模块 (Ctrl+D)"
          aria-label="复制模块"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="4" y="4" width="8" height="8" rx="1" />
            <path d="M2 10V2h8" />
          </svg>
        </button>
        
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
        
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 rounded hover:bg-[#1e2a42] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[#9ca3af] hover:text-white"
          title="重做 (Ctrl+Y)"
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
