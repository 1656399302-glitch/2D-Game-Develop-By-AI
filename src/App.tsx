import { useState, useCallback } from 'react';
import { Canvas } from './components/Editor/Canvas';
import { ModulePanel } from './components/Editor/ModulePanel';
import { PropertiesPanel } from './components/Editor/PropertiesPanel';
import { Toolbar } from './components/Editor/Toolbar';
import { CodexView } from './components/Codex/CodexView';
import { ExportModal } from './components/Export/ExportModal';
import { ActivationOverlay } from './components/Preview/ActivationOverlay';
import { ConnectionErrorToast } from './components/Connections/ConnectionErrorToast';
import { useMachineStore } from './store/useMachineStore';
import { useCodexStore } from './store/useCodexStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { generateAttributes } from './utils/attributeGenerator';

type ViewMode = 'editor' | 'codex';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [showExport, setShowExport] = useState(false);
  
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const showActivation = useMachineStore((state) => state.showActivation);
  const loadMachine = useMachineStore((state) => state.loadMachine);
  const setMachineState = useMachineStore((state) => state.setMachineState);
  const setShowActivation = useMachineStore((state) => state.setShowActivation);
  
  const addEntry = useCodexStore((state) => state.addEntry);
  
  // Use keyboard shortcuts hook
  useKeyboardShortcuts({ enabled: viewMode === 'editor' });
  
  const handleSaveToCodex = useCallback(() => {
    if (modules.length === 0) {
      alert('Please add at least one module before saving to Codex.');
      return;
    }
    
    const attributes = generateAttributes(modules, connections);
    const entry = addEntry(attributes.name, modules, connections, attributes);
    alert(`Machine "${entry.name}" has been saved to the Codex! (${entry.codexId})`);
  }, [modules, connections, addEntry]);
  
  const handleActivate = useCallback(() => {
    if (modules.length === 0) {
      alert('Please add at least one module before activating.');
      return;
    }
    setShowActivation(true);
    setMachineState('charging');
  }, [modules, setMachineState, setShowActivation]);
  
  const handleActivationComplete = useCallback(() => {
    setShowActivation(false);
    setMachineState('idle');
  }, [setMachineState, setShowActivation]);
  
  return (
    <div className="w-screen h-screen flex flex-col bg-[#0a0e17] overflow-hidden">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-[#1e2a42] bg-[#0a0e17]">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-[#00d4ff] tracking-wide">
            ⚙ ARCANE MACHINE CODEX ⚙
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'editor'
                  ? 'bg-[#7c3aed] text-white'
                  : 'bg-[#121826] text-[#9ca3af] hover:text-white'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setViewMode('codex')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'codex'
                  ? 'bg-[#7c3aed] text-white'
                  : 'bg-[#121826] text-[#9ca3af] hover:text-white'
              }`}
            >
              Codex
            </button>
          </div>
        </div>
        
        {viewMode === 'editor' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleActivate}
              disabled={modules.length === 0}
              className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-[#00d4ff] to-[#00ffcc] text-[#0a0e17] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ▶ Activate Machine
            </button>
            <button
              onClick={handleSaveToCodex}
              disabled={modules.length === 0}
              className="arcane-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📖 Save to Codex
            </button>
            <button
              onClick={() => setShowExport(true)}
              disabled={modules.length === 0}
              className="arcane-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📤 Export
            </button>
          </div>
        )}
      </header>
      
      {/* Editor Toolbar - Contains test mode buttons, zoom controls, and undo/redo */}
      {viewMode === 'editor' && <Toolbar />}
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'editor' ? (
          <>
            <ModulePanel />
            <div className="flex-1 flex">
              <Canvas />
              <PropertiesPanel />
            </div>
          </>
        ) : (
          <CodexView
            onLoadToEditor={(modules, connections) => {
              loadMachine(modules, connections);
              setViewMode('editor');
            }}
          />
        )}
      </div>
      
      {/* Footer */}
      <footer className="h-8 flex items-center justify-between px-4 border-t border-[#1e2a42] bg-[#0a0e17] text-xs text-[#4a5568]">
        <span>Modules: {modules.length} | Connections: {connections.length}</span>
        <span>Press R to rotate | F to flip | Del to remove | Ctrl+Z/Y for undo/redo</span>
        <span>Grid: {useMachineStore.getState().gridEnabled ? 'ON' : 'OFF'}</span>
      </footer>
      
      {/* Modals */}
      {showExport && (
        <ExportModal onClose={() => setShowExport(false)} />
      )}
      
      {showActivation && (
        <ActivationOverlay onComplete={handleActivationComplete} />
      )}
      
      {/* Connection Error Toast */}
      <ConnectionErrorToast />
    </div>
  );
}

export default App;
