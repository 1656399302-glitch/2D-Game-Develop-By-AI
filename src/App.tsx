import { useState, useCallback, useEffect } from 'react';
import { Canvas } from './components/Editor/Canvas';
import { ModulePanel } from './components/Editor/ModulePanel';
import { PropertiesPanel } from './components/Editor/PropertiesPanel';
import { CodexView } from './components/Codex/CodexView';
import { ExportModal } from './components/Export/ExportModal';
import { ActivationOverlay } from './components/Preview/ActivationOverlay';
import { useMachineStore } from './store/useMachineStore';
import { useCodexStore } from './store/useCodexStore';
import { generateAttributes } from './utils/attributeGenerator';

type ViewMode = 'editor' | 'codex';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [showExport, setShowExport] = useState(false);
  const [showActivation, setShowActivation] = useState(false);
  
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const loadMachine = useMachineStore((state) => state.loadMachine);
  const setMachineState = useMachineStore((state) => state.setMachineState);
  
  const addEntry = useCodexStore((state) => state.addEntry);
  
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
  }, [modules, setMachineState]);
  
  const handleActivationComplete = useCallback(() => {
    setShowActivation(false);
    setMachineState('idle');
  }, [setMachineState]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'editor') return;
      
      // Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedModuleId, selectedConnectionId, deleteSelected } = useMachineStore.getState();
        if (selectedModuleId || selectedConnectionId) {
          e.preventDefault();
          deleteSelected();
        }
      }
      
      // Rotate with R
      if (e.key === 'r' || e.key === 'R') {
        const { selectedModuleId, updateModuleRotation } = useMachineStore.getState();
        if (selectedModuleId) {
          e.preventDefault();
          updateModuleRotation(selectedModuleId, 90);
        }
      }
      
      // Undo with Ctrl+Z
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        useMachineStore.getState().undo();
      }
      
      // Redo with Ctrl+Y or Ctrl+Shift+Z
      if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || 
          (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        e.preventDefault();
        useMachineStore.getState().redo();
      }
      
      // Escape to cancel connection or deselect
      if (e.key === 'Escape') {
        const { cancelConnection, selectModule, selectConnection } = useMachineStore.getState();
        if (useMachineStore.getState().isConnecting) {
          cancelConnection();
        } else {
          selectModule(null);
          selectConnection(null);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode]);
  
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
        <span>Press R to rotate | Delete to remove | Ctrl+Z/Y for undo/redo</span>
        <span>Grid: {useMachineStore.getState().gridEnabled ? 'ON' : 'OFF'}</span>
      </footer>
      
      {/* Modals */}
      {showExport && (
        <ExportModal onClose={() => setShowExport(false)} />
      )}
      
      {showActivation && (
        <ActivationOverlay onComplete={handleActivationComplete} />
      )}
    </div>
  );
}

export default App;
