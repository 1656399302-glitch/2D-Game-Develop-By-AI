import { useState, useCallback, useEffect } from 'react';
import { Canvas } from './components/Editor/Canvas';
import { ModulePanel } from './components/Editor/ModulePanel';
import { PropertiesPanel } from './components/Editor/PropertiesPanel';
import { Toolbar } from './components/Editor/Toolbar';
import { CodexView } from './components/Codex/CodexView';
import { ExportModal } from './components/Export/ExportModal';
import { ActivationOverlay } from './components/Preview/ActivationOverlay';
import { ConnectionErrorToast } from './components/Connections/ConnectionErrorToast';
import { RandomForgeToast } from './components/UI/RandomForgeToast';
import { LoadPromptModal } from './components/UI/LoadPromptModal';
import { ChallengeButton } from './components/Challenges/ChallengeButton';
import { ChallengeBrowser } from './components/Challenges/ChallengeBrowser';
import { WelcomeModal, useWelcomeModal } from './components/Tutorial/WelcomeModal';
import { TutorialOverlay } from './components/Tutorial/TutorialOverlay';
import { RecipeBrowser } from './components/Recipes/RecipeBrowser';
import { RecipeToastManager } from './components/Recipes/RecipeDiscoveryToast';
import { useMachineStore } from './store/useMachineStore';
import { useCodexStore } from './store/useCodexStore';
import { useTutorialStore } from './store/useTutorialStore';
import { useRecipeStore } from './store/useRecipeStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { generateAttributes } from './utils/attributeGenerator';
import { hasSavedState } from './utils/localStorage';

type ViewMode = 'editor' | 'codex';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [showExport, setShowExport] = useState(false);
  const [showLoadPrompt, setShowLoadPrompt] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showRecipeBrowser, setShowRecipeBrowser] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const showActivation = useMachineStore((state) => state.showActivation);
  const showExportModal = useMachineStore((state) => state.showExportModal);
  const showCodexModal = useMachineStore((state) => state.showCodexModal);
  const loadMachine = useMachineStore((state) => state.loadMachine);
  const setMachineState = useMachineStore((state) => state.setMachineState);
  const setShowActivation = useMachineStore((state) => state.setShowActivation);
  const setShowExportModal = useMachineStore((state) => state.setShowExportModal);
  const setShowCodexModal = useMachineStore((state) => state.setShowCodexModal);
  const markStateAsLoaded = useMachineStore((state) => state.markStateAsLoaded);
  
  const addEntry = useCodexStore((state) => state.addEntry);
  
  // Recipe system
  const { checkTutorialUnlock } = useRecipeStore();
  
  // Welcome modal hook - handles tutorial start/skip internally
  const {
    showWelcome,
    handleStartTutorial,
    handleSkip,
  } = useWelcomeModal();

  // Check for saved state on mount
  useEffect(() => {
    if (hasSavedState()) {
      setShowLoadPrompt(true);
    } else {
      markStateAsLoaded();
    }
  }, [markStateAsLoaded]);
  
  // Use keyboard shortcuts hook
  const { shortcutFeedback } = useKeyboardShortcuts({ enabled: viewMode === 'editor' });
  
  // Sync store modal states with local state
  useEffect(() => {
    setShowExport(showExportModal);
  }, [showExportModal]);
  
  useEffect(() => {
    setShowCodex(showCodexModal);
  }, [showCodexModal]);
  
  // Tutorial completion handler - trigger recipe unlocks
  useEffect(() => {
    const tutorialStore = useTutorialStore.getState();
    // Check if tutorial has been completed (currentStep >= steps.length)
    const tutorialCompleted = tutorialStore.currentStep >= 6; // 6 is the number of tutorial steps
    if (tutorialCompleted) {
      checkTutorialUnlock();
    }
  }, [checkTutorialUnlock]);
  
  const handleSaveToCodex = useCallback(() => {
    if (modules.length === 0) {
      alert('请至少添加一个模块再保存到图鉴。');
      return;
    }
    
    const attributes = generateAttributes(modules, connections);
    const entry = addEntry(attributes.name, modules, connections, attributes);
    alert(`机器 "${entry.name}" 已保存到图鉴! (${entry.codexId})`);
  }, [modules, connections, addEntry]);
  
  const handleActivate = useCallback(() => {
    if (modules.length === 0) {
      alert('请至少添加一个模块再激活。');
      return;
    }
    setShowActivation(true);
    setMachineState('charging');
  }, [modules, setMachineState, setShowActivation]);
  
  const handleActivationComplete = useCallback(() => {
    setShowActivation(false);
    setMachineState('idle');
  }, [setMachineState, setShowActivation]);
  
  // Tutorial callback handlers
  const handleModuleAdded = useCallback(() => {
    // This callback is called when user completes the drag module step
  }, []);
  
  const handleModuleSelected = useCallback(() => {
    // This callback is called when user completes the select/rotate step
  }, []);
  
  const handleModuleConnected = useCallback(() => {
    // This callback is called when user completes the connect step
  }, []);
  
  const handleMachineActivated = useCallback(() => {
    // This callback is called when user completes the activate step
  }, []);
  
  const handleMachineSaved = useCallback(() => {
    // This callback is called when user completes the save step
  }, []);
  
  const handleShowHelp = useCallback(() => {
    setShowHelp(true);
  }, []);
  
  const handleHideHelp = useCallback(() => {
    setShowHelp(false);
  }, []);

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
              编辑器
            </button>
            <button
              onClick={() => setViewMode('codex')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'codex'
                  ? 'bg-[#7c3aed] text-white'
                  : 'bg-[#121826] text-[#9ca3af] hover:text-white'
              }`}
            >
              图鉴
            </button>
          </div>
        </div>
        
        {viewMode === 'editor' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRecipeBrowser(true)}
              className="px-3 py-2 rounded-lg text-sm bg-[#121826] text-[#a855f7] hover:text-white border border-[#1e2a42] hover:border-[#a855f7]/30 transition-colors flex items-center gap-2"
              title="配方图鉴 - 发现新模块"
              aria-label="打开配方图鉴"
            >
              <span>📜</span>
              <span>配方</span>
            </button>
            <button
              onClick={handleShowHelp}
              className="px-3 py-2 rounded-lg text-sm bg-[#121826] text-[#9ca3af] hover:text-white border border-[#1e2a42] hover:border-[#7c3aed]/30 transition-colors"
              title="帮助与教程"
              aria-label="打开帮助"
            >
              ❓ 帮助
            </button>
            <button
              onClick={handleActivate}
              disabled={modules.length === 0}
              className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-[#00d4ff] to-[#00ffcc] text-[#0a0e17] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              data-tutorial="activate-button"
            >
              ▶ 激活机器
            </button>
            <button
              onClick={handleSaveToCodex}
              disabled={modules.length === 0}
              className="arcane-button disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="保存到图鉴"
            >
              📖 保存图鉴
            </button>
            <button
              onClick={() => setShowExport(true)}
              disabled={modules.length === 0}
              className="arcane-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="导出机器"
            >
              📤 导出
            </button>
            <ChallengeButton onClick={() => setShowChallenges(true)} />
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
        <span>模块: {modules.length} | 连接: {connections.length}</span>
        <span>R旋转 | F翻转 | Delete删除 | Ctrl+Z/Y撤销/重做 | Ctrl+C/V复制/粘贴</span>
        <span>网格: {useMachineStore.getState().gridEnabled ? '开启' : '关闭'}</span>
      </footer>
      
      {/* Shortcut Feedback Toast */}
      {shortcutFeedback && (
        <div 
          className="fixed bottom-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg bg-[#7c3aed]/90 text-white text-sm font-medium shadow-lg z-50 animate-pulse"
          role="status"
          aria-live="polite"
        >
          {shortcutFeedback}
        </div>
      )}
      
      {/* Modals */}
      {showExport && (
        <ExportModal onClose={() => {
          setShowExport(false);
          setShowExportModal(false);
        }} />
      )}
      
      {showCodex && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-2xl border border-[#7c3aed]/40 shadow-2xl shadow-purple-900/30 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#7c3aed]" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">保存到图鉴</h2>
                <button
                  onClick={() => {
                    setShowCodex(false);
                    setShowCodexModal(false);
                  }}
                  className="text-[#6b7280] hover:text-white text-2xl leading-none"
                  aria-label="关闭"
                >
                  ×
                </button>
              </div>
              <p className="text-[#9ca3af] mb-6">确定要将当前机器保存到图鉴吗？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleSaveToCodex();
                    setShowCodex(false);
                    setShowCodexModal(false);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white hover:opacity-90 transition-opacity"
                >
                  确认保存
                </button>
                <button
                  onClick={() => {
                    setShowCodex(false);
                    setShowCodexModal(false);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-[#121826] text-[#9ca3af] hover:text-white border border-[#1e2a42] transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showActivation && (
        <ActivationOverlay onComplete={handleActivationComplete} />
      )}
      
      {/* Challenge Browser Modal */}
      {showChallenges && (
        <ChallengeBrowser 
          isOpen={showChallenges} 
          onClose={() => setShowChallenges(false)} 
        />
      )}
      
      {/* Recipe Browser Modal */}
      <RecipeBrowser 
        isOpen={showRecipeBrowser} 
        onClose={() => setShowRecipeBrowser(false)} 
      />
      
      {/* Load Prompt Modal */}
      {showLoadPrompt && (
        <LoadPromptModal />
      )}
      
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-2xl border border-[#7c3aed]/40 shadow-2xl shadow-purple-900/30 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#7c3aed]" />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">快速帮助</h2>
                <button
                  onClick={handleHideHelp}
                  className="text-[#6b7280] hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-[#0a0e17]/50 rounded-lg p-4 border border-[#1e2a42]">
                  <h3 className="text-sm font-medium text-[#a855f7] mb-2">开始使用</h3>
                  <p className="text-xs text-[#9ca3af]">
                    从左侧面板拖拽模块到画布上。点击模块可以选择它们，然后使用工具栏或快捷键进行转换。
                  </p>
                </div>
                
                <div className="bg-[#0a0e17]/50 rounded-lg p-4 border border-[#1e2a42]">
                  <h3 className="text-sm font-medium text-[#a855f7] mb-2">键盘快捷键</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-[#1e2a42] rounded text-[#c084fc]">R</kbd>
                      <span className="text-[#9ca3af]">旋转90°</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-[#1e2a42] rounded text-[#c084fc]">F</kbd>
                      <span className="text-[#9ca3af]">翻转</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-[#1e2a42] rounded text-[#c084fc]">Delete</kbd>
                      <span className="text-[#9ca3af]">删除</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-[#1e2a42] rounded text-[#c084fc]">Ctrl+Z</kbd>
                      <span className="text-[#9ca3af]">撤销</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-[#1e2a42] rounded text-[#c084fc]">Ctrl+D</kbd>
                      <span className="text-[#9ca3af]">复制</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-[#1e2a42] rounded text-[#c084fc]">Ctrl+C/V</kbd>
                      <span className="text-[#9ca3af]">复制/粘贴</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-[#1e2a42] rounded text-[#c084fc]">Ctrl+S</kbd>
                      <span className="text-[#9ca3af]">保存图鉴</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-2 py-1 bg-[#1e2a42] rounded text-[#c084fc]">Ctrl+E</kbd>
                      <span className="text-[#9ca3af]">导出</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#0a0e17]/50 rounded-lg p-4 border border-[#1e2a42]">
                  <h3 className="text-sm font-medium text-[#a855f7] mb-2">提示</h3>
                  <ul className="text-xs text-[#9ca3af] space-y-1">
                    <li>• 从输出端口拖拽到输入端口来连接模块</li>
                    <li>• 使用随机锻造快速获得灵感</li>
                    <li>• 将最好的机器保存到图鉴</li>
                    <li>• 完成挑战获得奖励</li>
                    <li>• 打开配方图鉴发现新模块</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleHideHelp();
                    useTutorialStore.getState().resetTutorial();
                  }}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-[#7c3aed]/20 text-[#a855f7] hover:bg-[#7c3aed]/30 border border-[#7c3aed]/40 transition-colors"
                >
                  📖 重播教程
                </button>
                <button
                  onClick={handleHideHelp}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-[#121826] text-[#9ca3af] hover:text-white border border-[#1e2a42] transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notifications */}
      <ConnectionErrorToast />
      <RandomForgeToast />
      
      {/* Recipe Discovery Toast */}
      <RecipeToastManager />
      
      {/* Welcome Modal - for first-time users */}
      {showWelcome && (
        <WelcomeModal
          onStartTutorial={handleStartTutorial}
          onSkip={handleSkip}
        />
      )}
      
      {/* Tutorial Overlay */}
      <TutorialOverlay
        onModuleAdded={handleModuleAdded}
        onModuleSelected={handleModuleSelected}
        onModuleConnected={handleModuleConnected}
        onMachineActivated={handleMachineActivated}
        onMachineSaved={handleMachineSaved}
      />
    </div>
  );
}

export default App;
