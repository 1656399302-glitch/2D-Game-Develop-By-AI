import { useMachineStore } from '../../store/useMachineStore';

export function Toolbar() {
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const undo = useMachineStore((state) => state.undo);
  const redo = useMachineStore((state) => state.redo);
  const history = useMachineStore((state) => state.history);
  const historyIndex = useMachineStore((state) => state.historyIndex);
  const clearCanvas = useMachineStore((state) => state.clearCanvas);
  const activateFailureMode = useMachineStore((state) => state.activateFailureMode);
  const activateOverloadMode = useMachineStore((state) => state.activateOverloadMode);
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-[#121826] border-b border-[#1e2a42]">
      {/* Left side - branding could go here */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#4a5568]">
          Modules: <span className="text-[#00d4ff]">{modules.length}</span>
        </span>
        <span className="text-[#1e2a42]">|</span>
        <span className="text-xs text-[#4a5568]">
          Connections: <span className="text-[#00ffcc]">{connections.length}</span>
        </span>
      </div>
      
      {/* Center - Test Mode buttons */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-2">
          <button
            onClick={activateFailureMode}
            className="px-3 py-1 text-xs rounded bg-[#7f1d1d] text-[#fca5a5] hover:bg-[#991b1b] hover:text-[#fecaca] border border-[#ef4444]/50 transition-colors"
            title="Test Failure Mode - 机器故障测试"
          >
            ⚠ 测试故障
          </button>
          
          <button
            onClick={activateOverloadMode}
            className="px-3 py-1 text-xs rounded bg-[#78350f] text-[#fdba74] hover:bg-[#92400e] hover:text-[#fed7aa] border border-[#f97316]/50 transition-colors"
            title="Test Overload Mode - 过载测试"
          >
            ⚡ 测试过载
          </button>
        </div>
      </div>
      
      {/* Right side - actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2 rounded hover:bg-[#1e2a42] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 8h7a3 3 0 0 1 0 6H8" />
            <path d="M6 5L3 8l3 3" />
          </svg>
        </button>
        
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2 rounded hover:bg-[#1e2a42] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 8H6a3 3 0 0 0 0 6h2" />
            <path d="M10 5l3 3-3 3" />
          </svg>
        </button>
        
        <span className="text-xs text-[#4a5568] mx-2">
          {historyIndex + 1}/{history.length || 1}
        </span>
        
        <div className="w-px h-4 bg-[#1e2a42] mx-2" />
        
        <button
          onClick={clearCanvas}
          disabled={modules.length === 0}
          className="px-3 py-1 text-xs rounded bg-[#1e2a42] text-[#9ca3af] hover:text-[#ef4444] hover:bg-[#7f1d1d]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
