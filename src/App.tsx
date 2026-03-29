import { useState, useCallback, useEffect } from 'react';
import { Canvas } from './components/Editor/Canvas';
import { ModulePanel } from './components/Editor/ModulePanel';
import { PropertiesPanel } from './components/Editor/PropertiesPanel';
import { Toolbar } from './components/Editor/Toolbar';
import { CodexView } from './components/Codex/CodexView';
import { ExportModal } from './components/Export/ExportModal';
import { ActivationOverlay } from './components/Preview/ActivationOverlay';
import { ConnectionErrorFeedback } from './components/UI/ConnectionErrorFeedback';
import { RandomForgeToast } from './components/UI/RandomForgeToast';
import { LoadPromptModal } from './components/UI/LoadPromptModal';
import { ChallengeButton } from './components/Challenges/ChallengeButton';
import { ChallengePanel } from './components/Challenge/ChallengePanel';
import { WelcomeModal, useWelcomeModal } from './components/Tutorial/WelcomeModal';
import { TutorialOverlay } from './components/Tutorial/TutorialOverlay';
import { RecipeBrowser } from './components/Recipes/RecipeBrowser';
import { RecipeToastManager } from './components/Recipes/RecipeDiscoveryToast';
import { useMachineStore } from './store/useMachineStore';
import { useCodexStore } from './store/useCodexStore';
import { useTutorialStore } from './store/useTutorialStore';
import { useRecipeStore } from './store/useRecipeStore';
import { useStatsStore } from './store/useStatsStore';
import { useFactionStore } from './store/useFactionStore';
import { useAchievementStore } from './store/useAchievementStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { generateAttributes } from './utils/attributeGenerator';
import { hasSavedState } from './utils/localStorage';
import { calculateFaction } from './utils/factionCalculator';
import { FactionPanel } from './components/Factions/FactionPanel';
import { TechTree } from './components/Factions/TechTree';
import { StatsDashboard } from './components/Stats/StatsDashboard';
import { AchievementList } from './components/Achievements/AchievementList';
import { AchievementToast } from './components/Achievements/AchievementToast';
import { Achievement } from './types/factions';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AccessibilityLayer, MobileCanvasLayout, useViewportSize } from './components/Accessibility';

type ViewMode = 'editor' | 'codex';

function AppContent() {
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [showExport, setShowExport] = useState(false);
  const [showLoadPrompt, setShowLoadPrompt] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showRecipeBrowser, setShowRecipeBrowser] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showFactionPanel, setShowFactionPanel] = useState(false);
  const [showTechTree, setShowTechTree] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  
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
  
  // Stats store
  const incrementMachinesCreated = useStatsStore((state) => state.incrementMachinesCreated);
  const incrementActivations = useStatsStore((state) => state.incrementActivations);
  const incrementCodexEntries = useStatsStore((state) => state.incrementCodexEntries);
  const earnedAchievements = useStatsStore((state) => state.earnedAchievements);
  
  // Faction store
  const incrementFactionCount = useFactionStore((state) => state.incrementFactionCount);
  
  // Recipe system
  const { checkTutorialUnlock } = useRecipeStore();
  
  // Viewport size for responsive layout
  const viewport = useViewportSize();
  
  // Welcome modal hook - handles tutorial start/skip internally
  const {
    showWelcome,
    handleStartTutorial,
    handleSkip,
  } = useWelcomeModal(setShowLoadPrompt);

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
    const tutorialCompleted = tutorialStore.currentStep >= 6;
    if (tutorialCompleted) {
      checkTutorialUnlock();
    }
  }, [checkTutorialUnlock]);
  
  // Connect AchievementToast to achievement store callbacks
  useEffect(() => {
    const handleAchievementUnlock = (achievement: Achievement) => {
      setCurrentAchievement(achievement);
      setTimeout(() => {
        setCurrentAchievement(null);
      }, 5000);
    };
    
    useAchievementStore.getState().setOnUnlockCallback(handleAchievementUnlock);
    
    return () => {
      useAchievementStore.getState().setOnUnlockCallback(null);
    };
  }, []);
  
  const handleAchievementDismiss = useCallback(() => {
    setCurrentAchievement(null);
  }, []);
  
  const handleSaveToCodex = useCallback(() => {
    if (modules.length === 0) {
      alert('请至少添加一个模块再保存到图鉴。');
      return;
    }
    
    const attributes = generateAttributes(modules, connections);
    const entry = addEntry(attributes.name, modules, connections, attributes);
    
    incrementMachinesCreated();
    incrementCodexEntries();
    
    const faction = calculateFaction(modules);
    if (faction) {
      incrementFactionCount(faction);
    }
    
    alert(`机器 "${entry.name}" 已保存到图鉴! (${entry.codexId})`);
  }, [modules, connections, addEntry, incrementMachinesCreated, incrementCodexEntries, incrementFactionCount]);
  
  const handleActivate = useCallback(() => {
    if (modules.length === 0) {
      alert('请至少添加一个模块再激活。');
      return;
    }
    setShowActivation(true);
    setMachineState('charging');
    incrementActivations();
  }, [modules, setMachineState, setShowActivation, incrementActivations]);
  
  const handleActivationComplete = useCallback(() => {
    setShowActivation(false);
    setMachineState('idle');
  }, [setMachineState, setShowActivation]);
  
  const handleShowHelp = useCallback(() => {
    setShowHelp(true);
  }, []);
  
  const handleHideHelp = useCallback(() => {
    setShowHelp(false);
  }, []);

  // Desktop layout
  if (!viewport.isMobile) {
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
                aria-pressed={viewMode === 'editor'}
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
                aria-pressed={viewMode === 'codex'}
              >
                图鉴
              </button>
            </div>
          </div>
          
          {viewMode === 'editor' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFactionPanel(true)}
                className="px-3 py-2 rounded-lg text-sm bg-[#121826] text-[#a78bfa] hover:text-white border border-[#1e2a42] hover:border-[#a78bfa]/30 transition-colors flex items-center gap-2"
                aria-label="打开派系面板"
              >
                <span>⚔️</span>
                <span>派系</span>
              </button>
              
              <button
                onClick={() => setShowTechTree(true)}
                className="px-3 py-2 rounded-lg text-sm bg-[#121826] text-[#22c55e] hover:text-white border border-[#1e2a42] hover:border-[#22c55e]/30 transition-colors flex items-center gap-2"
                aria-label="打开科技树"
              >
                <span>🌳</span>
                <span>科技</span>
              </button>
              
              <button
                onClick={() => setShowStats(true)}
                className="px-3 py-2 rounded-lg text-sm bg-[#121826] text-[#22d3ee] hover:text-white border border-[#1e2a42] hover:border-[#22d3ee]/30 transition-colors flex items-center gap-2"
                aria-label="打开统计面板"
              >
                <span>📊</span>
                <span>统计</span>
              </button>
              
              <button
                onClick={() => setShowAchievements(true)}
                className="px-3 py-2 rounded-lg text-sm bg-[#121826] text-[#fbbf24] hover:text-white border border-[#1e2a42] hover:border-[#fbbf24]/30 transition-colors flex items-center gap-2"
                aria-label="打开成就面板"
              >
                <span>🏆</span>
                <span>成就</span>
                {earnedAchievements.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#fbbf24]/20 text-xs">
                    {earnedAchievements.length}
                  </span>
                )}
              </button>
              
              <div className="w-px h-6 bg-[#1e2a42] mx-1" aria-hidden="true" />
              
              <button
                onClick={() => setShowRecipeBrowser(true)}
                className="px-3 py-2 rounded-lg text-sm bg-[#121826] text-[#a855f7] hover:text-white border border-[#1e2a42] hover:border-[#a855f7]/30 transition-colors flex items-center gap-2"
                aria-label="打开配方图鉴"
              >
                <span>📜</span>
                <span>配方</span>
              </button>
              <button
                onClick={handleShowHelp}
                className="px-3 py-2 rounded-lg text-sm bg-[#121826] text-[#9ca3af] hover:text-white border border-[#1e2a42] hover:border-[#7c3aed]/30 transition-colors"
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
                onClick={() => modules.length > 0 && setShowExport(true)}
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
          <span>方向键移动 | R旋转 | F翻转 | Delete删除 | Ctrl+Z/Y撤销/重做</span>
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
        {showExport && <ExportModal onClose={() => { setShowExport(false); setShowExportModal(false); }} />}
        
        {showCodex && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4 bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-2xl border border-[#7c3aed]/40 shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">保存到图鉴</h2>
                  <button onClick={() => { setShowCodex(false); setShowCodexModal(false); }} className="text-[#6b7280] hover:text-white text-2xl" aria-label="关闭">×</button>
                </div>
                <p className="text-[#9ca3af] mb-6">确定要将当前机器保存到图鉴吗？</p>
                <div className="flex gap-3">
                  <button onClick={() => { handleSaveToCodex(); setShowCodex(false); setShowCodexModal(false); }} className="flex-1 px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white hover:opacity-90">确认保存</button>
                  <button onClick={() => { setShowCodex(false); setShowCodexModal(false); }} className="flex-1 px-4 py-2 rounded-lg font-medium bg-[#121826] text-[#9ca3af] border border-[#1e2a42]">取消</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showActivation && <ActivationOverlay onComplete={handleActivationComplete} />}
        
        {showChallenges && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[80vh] bg-[#121826] border border-[#1e2a42] rounded-xl flex flex-col overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a42]">
                <div />
                <button onClick={() => setShowChallenges(false)} className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af]" aria-label="关闭">✕</button>
              </div>
              <ChallengePanel />
            </div>
          </div>
        )}
        
        <RecipeBrowser isOpen={showRecipeBrowser} onClose={() => setShowRecipeBrowser(false)} />
        {showLoadPrompt && <LoadPromptModal />}
        
        {showHelp && (
          <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-lg mx-4 bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-2xl border border-[#7c3aed]/40 shadow-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">快速帮助</h2>
                  <button onClick={handleHideHelp} className="text-[#6b7280] hover:text-white text-2xl">×</button>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="bg-[#0a0e17]/50 rounded-lg p-4 border border-[#1e2a42]">
                    <h3 className="text-sm font-medium text-[#a855f7] mb-2">开始使用</h3>
                    <p className="text-xs text-[#9ca3af]">从左侧面板拖拽模块到画布上。使用方向键移动选中模块，R旋转，F翻转。</p>
                  </div>
                  <div className="bg-[#0a0e17]/50 rounded-lg p-4 border border-[#1e2a42]">
                    <h3 className="text-sm font-medium text-[#a855f7] mb-2">键盘快捷键</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2"><kbd className="px-2 py-1 bg-[#1e2a42] rounded text-[#c084fc]">方向键</kbd><span className="text-[#9ca3af]">移动模块</span></div>
                      <div className="flex items-center gap-2"><kbd className="px-2 py-1 bg-[#1e2a42] rounded text-[#c084fc]">R</kbd><span className="text-[#9ca3af]">旋转</span></div>
                      <div className="flex items-center gap-2"><kbd className="px-2 py-1 bg-[#1e2a42] rounded text-[#c084fc]">Delete</kbd><span className="text-[#9ca3af]">删除</span></div>
                      <div className="flex items-center gap-2"><kbd className="px-2 py-1 bg-[#1e2a42] rounded text-[#c084fc]">Ctrl+Z</kbd><span className="text-[#9ca3af]">撤销</span></div>
                    </div>
                  </div>
                  <div className="bg-[#0a0e17]/50 rounded-lg p-4 border border-[#1e2a42]">
                    <h3 className="text-sm font-medium text-[#a855f7] mb-2">提示</h3>
                    <ul className="text-xs text-[#9ca3af] space-y-1">
                      <li>• 从输出端口拖拽到输入端口来连接</li>
                      <li>• 使用随机锻造快速获得灵感</li>
                      <li>• Tab键在模块间导航</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { handleHideHelp(); useTutorialStore.getState().resetTutorial(); }} className="flex-1 px-4 py-2 rounded-lg font-medium bg-[#7c3aed]/20 text-[#a855f7] border border-[#7c3aed]/40">📖 重播教程</button>
                  <button onClick={handleHideHelp} className="flex-1 px-4 py-2 rounded-lg font-medium bg-[#121826] text-[#9ca3af] border border-[#1e2a42]">关闭</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showFactionPanel && <FactionPanel onClose={() => setShowFactionPanel(false)} />}
        {showTechTree && <TechTree onClose={() => setShowTechTree(false)} />}
        {showStats && <StatsDashboard onClose={() => setShowStats(false)} />}
        {showAchievements && <AchievementList onClose={() => setShowAchievements(false)} />}
        
        {/* Toast Notifications */}
        <ConnectionErrorFeedback />
        <RandomForgeToast />
        <AchievementToast achievement={currentAchievement} onDismiss={handleAchievementDismiss} />
        <RecipeToastManager />
        
        {showWelcome && <WelcomeModal onStartTutorial={handleStartTutorial} onSkip={handleSkip} />}
        
        <TutorialOverlay
          onModuleAdded={() => {}}
          onModuleSelected={() => {}}
          onModuleConnected={() => {}}
          onMachineActivated={() => {}}
          onMachineSaved={() => {}}
        />
      </div>
    );
  }
  
  // Mobile layout
  return (
    <MobileCanvasLayout
      header={
        <div className="flex items-center justify-between px-3 py-2">
          <h1 className="text-sm font-bold text-[#00d4ff]">⚙ 魔法机械</h1>
          <div className="flex gap-2">
            <button onClick={() => setViewMode(viewMode === 'editor' ? 'codex' : 'editor')} className="px-2 py-1 text-xs rounded bg-[#7c3aed] text-white" aria-label={viewMode === 'editor' ? '切换到图鉴' : '切换到编辑器'}>
              {viewMode === 'editor' ? '图鉴' : '编辑'}
            </button>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between text-xs text-[#4a5568]">
          <span>模块: {modules.length}</span>
          <span>连接: {connections.length}</span>
        </div>
      }
      leftPanel={<ModulePanel />}
      canvas={
        viewMode === 'editor' ? (
          <>
            <Canvas />
            <PropertiesPanel />
          </>
        ) : (
          <CodexView onLoadToEditor={(m, c) => { loadMachine(m, c); setViewMode('editor'); }} />
        )
      }
    />
  );
}

// Main App with Error Boundary and Accessibility Layer
function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('App Error:', error, errorInfo);
      }}
    >
      <AccessibilityLayer>
        <AppContent />
      </AccessibilityLayer>
    </ErrorBoundary>
  );
}

export default App;
