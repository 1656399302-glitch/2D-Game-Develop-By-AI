import { useState, useCallback, useEffect, lazy, Suspense, useRef } from 'react';
import { Canvas } from './components/Editor/Canvas';
import { ModulePanel } from './components/Editor/ModulePanel';
import { PropertiesPanel } from './components/Editor/PropertiesPanel';
import { Toolbar } from './components/Editor/Toolbar';
import { ExportModal } from './components/Export/ExportModal';
import { ActivationOverlay } from './components/Preview/ActivationOverlay';
import { ConnectionErrorFeedback } from './components/UI/ConnectionErrorFeedback';
import { RandomForgeToast } from './components/UI/RandomForgeToast';
import { LoadPromptModal } from './components/UI/LoadPromptModal';
import { ChallengeButton } from './components/Challenges/ChallengeButton';
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
import { useCommunityStore } from './store/useCommunityStore';
import { useMachineStatsStore } from './store/useMachineStatsStore';
import { hydrateExchangeStore } from './store/useExchangeStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useStoreHydration } from './hooks/useStoreHydration';
import { generateAttributes } from './utils/attributeGenerator';
import { hasSavedState } from './utils/localStorage';
import { calculateFaction } from './utils/factionCalculator';
import { EnhancedStatsDashboard } from './components/Stats/EnhancedStatsDashboard';
import { AchievementList } from './components/Achievements/AchievementList';
import { AchievementToastContainer, useAchievementToastQueue } from './components/Achievements/AchievementToast';
import { getAchievementById } from './data/achievements';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AccessibilityLayer, MobileCanvasLayout, useViewportSize } from './components/Accessibility';
import { MobileTouchEnhancer } from './components/Accessibility/MobileTouchEnhancer';
import { CommunityGallery } from './components/Community/CommunityGallery';
import { PublishModal } from './components/Community/PublishModal';
import { ExchangeButton } from './components/Exchange/ExchangeButton';
import { TradeNotification } from './components/Exchange/TradeNotification';
import { PlacedModule, Connection } from './types';
import { RandomGeneratorModal } from './components/Editor/RandomGeneratorModal';

// Lazy-loaded modal components for code splitting
const LazyCodexView = lazy(() => import('./components/Codex/CodexView'));
const LazyChallengePanel = lazy(() => import('./components/Challenge/ChallengePanel'));
const LazyFactionPanel = lazy(() => import('./components/Factions/FactionPanel'));
const LazyTechTree = lazy(() => import('./components/Factions/TechTree'));
const LazyExchangePanel = lazy(() => import('./components/Exchange/ExchangePanel'));

// Template components - Round 67 remediation: lazy-loaded to reduce bundle size
const LazyTemplateLibrary = lazy(() => import('./components/Templates/TemplateLibrary'));
const LazySaveTemplateModal = lazy(() => import('./components/Templates/SaveTemplateModal'));

// AI Assistant slide-in panel with close functionality - lazy loaded wrapper
const LazyAIAssistantSlideIn = lazy(() => 
  import('./components/AI/AIAssistantPanel').then((module) => ({
    default: module.AIAssistantSlideIn as unknown as React.ComponentType<{isOpen: boolean; onClose: () => void}>
  }))
);

type ViewMode = 'editor' | 'codex';

/**
 * Loading fallback for lazy components
 */
function LazyLoadingFallback({ height = '200px' }: { height?: string }) {
  return (
    <div 
      className="flex items-center justify-center bg-[#121826]"
      style={{ height }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[#9ca3af]">加载中...</span>
      </div>
    </div>
  );
}

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
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showExchange, setShowExchange] = useState(false);
  const [showRandomGenerator, setShowRandomGenerator] = useState(false);
  
  // Template system state - Round 67
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  
  // Achievement toast queue
  const { addToQueue } = useAchievementToastQueue({
    maxVisible: 3,
    staggerDelay: 3000,
  });
  
  // FIX: Use store hydration hook to prevent cascading updates
  const { isHydrated } = useStoreHydration();
  
  // FIX: Use selectors for all store subscriptions to prevent full store subscription
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
  
  // FIX: Store markStateAsLoaded in ref to avoid dependency array issues
  const markStateAsLoadedRef = useRef(markStateAsLoaded);
  useEffect(() => {
    markStateAsLoadedRef.current = markStateAsLoaded;
  }, [markStateAsLoaded]);
  
  // Community store - FIX: Use selectors
  const isGalleryOpen = useCommunityStore((state) => state.isGalleryOpen);
  const isPublishModalOpen = useCommunityStore((state) => state.isPublishModalOpen);
  const openPublishModal = useCommunityStore((state) => state.openPublishModal);
  
  // Machine stats store for statistics dashboard - FIX: Use selectors
  const isStatsPanelOpen = useMachineStatsStore((state) => state.isPanelOpen);
  const closeStatsPanel = useMachineStatsStore((state) => state.closePanel);

  // Exchange store - FIX: Use selectors
  
  // Codex store - FIX: Use selector
  const addEntry = useCodexStore((state) => state.addEntry);
  
  // Stats store - FIX: Use selectors
  const incrementMachinesCreated = useStatsStore((state) => state.incrementMachinesCreated);
  const incrementActivations = useStatsStore((state) => state.incrementActivations);
  const incrementCodexEntries = useStatsStore((state) => state.incrementCodexEntries);
  const earnedAchievements = useStatsStore((state) => state.earnedAchievements);
  const addEarnedAchievement = useStatsStore((state) => state.addEarnedAchievement);
  const machinesCreated = useStatsStore((state) => state.machinesCreated);
  const activations = useStatsStore((state) => state.activations);
  const errors = useStatsStore((state) => state.errors);
  const codexEntries = useStatsStore((state) => state.codexEntries);
  const factionCounts = useStatsStore((state) => state.factionCounts);
  
  // Faction store - FIX: Use selector
  const incrementFactionCount = useFactionStore((state) => state.incrementFactionCount);
  
  // Recipe system - FIX: Use getState directly via ref
  const checkTutorialUnlockRef = useRef(useRecipeStore.getState().checkTutorialUnlock);
  useEffect(() => {
    checkTutorialUnlockRef.current = useRecipeStore.getState().checkTutorialUnlock;
  }, []);
  
  // Viewport size for responsive layout
  const viewport = useViewportSize();
  
  // FIX: Read localStorage synchronously to determine welcome modal visibility
  // This prevents Zustand hydration race conditions
  const hasSeenWelcome = useTutorialStore(state => state.hasSeenWelcome);
  
  // Welcome modal hook - provides handlers but modal visibility is controlled locally
  const {
    handleStartTutorial,
    handleSkip,
  } = useWelcomeModal();

  // FIX: Hydrate exchange store on mount
  useEffect(() => {
    hydrateExchangeStore();
  }, []);

  // Check for saved state on mount - FIX: Use ref instead of store action in dependency
  useEffect(() => {
    if (hasSavedState()) {
      setShowLoadPrompt(true);
    } else {
      markStateAsLoadedRef.current();
    }
  }, []); // Empty deps - runs once on mount
  
  // Use keyboard shortcuts hook
  const { shortcutFeedback } = useKeyboardShortcuts({ enabled: viewMode === 'editor' });
  
  // Sync store modal states with local state - FIX: Only sync after hydration
  useEffect(() => {
    if (!isHydrated) return;
    setShowExport(showExportModal);
  }, [showExportModal, isHydrated]);
  
  useEffect(() => {
    if (!isHydrated) return;
    setShowCodex(showCodexModal);
  }, [showCodexModal, isHydrated]);
  
  // Tutorial completion handler - trigger recipe unlocks
  // FIX: Use ref to avoid store action in dependency array
  useEffect(() => {
    if (!isHydrated) return;
    const tutorialStore = useTutorialStore.getState();
    const tutorialCompleted = tutorialStore.currentStep >= 6;
    if (tutorialCompleted) {
      checkTutorialUnlockRef.current();
    }
  }, [isHydrated]); // Only run once after hydration
  
  // Connect AchievementToastContainer to achievement store callbacks
  useEffect(() => {
    const handleAchievementUnlock = (achievement: any) => {
      // Add achievement to toast queue
      addToQueue([achievement]);
    };
    
    useAchievementStore.getState().setOnUnlockCallback(handleAchievementUnlock);
    
    return () => {
      useAchievementStore.getState().setOnUnlockCallback(null);
    };
  }, [addToQueue]);
  
  // FIX: Listen for tutorial:completed event and trigger "入门者" achievement
  useEffect(() => {
    const handleTutorialCompleted = () => {
      // Get the "入门者" (getting-started) achievement
      const gettingStartedAchievement = getAchievementById('getting-started');
      
      if (gettingStartedAchievement) {
        // Build stats with tutorialCompleted = true
        const stats = {
          machinesCreated,
          activations,
          errors,
          playtimeMinutes: 0,
          factionCounts,
          codexEntries,
          tutorialCompleted: true,
        };
        
        // Check if the achievement condition is met
        if (gettingStartedAchievement.condition(stats)) {
          // Trigger the achievement
          useAchievementStore.getState().triggerUnlock(gettingStartedAchievement);
          
          // Also add it to earned achievements
          if (!earnedAchievements.includes('getting-started')) {
            addEarnedAchievement('getting-started');
          }
        }
      }
    };
    
    window.addEventListener('tutorial:completed', handleTutorialCompleted);
    
    return () => {
      window.removeEventListener('tutorial:completed', handleTutorialCompleted);
    };
  }, [machinesCreated, activations, errors, factionCounts, codexEntries, earnedAchievements, addEarnedAchievement]);
  
  const handleSaveToCodex = useCallback(() => {
    if (modules.length === 0) {
      alert('请至少添加一个模块再保存到图鉴。');
      return;
    }
    
    const attributes = generateAttributes(modules, connections);
    const entry = addEntry(attributes.name, modules, connections, attributes);
    
    incrementMachinesCreated();
    incrementCodexEntries();
    
    // Check for machine creation achievements
    const newMachinesCreated = machinesCreated + 1;
    checkAchievementsForMachines(newMachinesCreated);
    
    const faction = calculateFaction(modules);
    if (faction) {
      incrementFactionCount(faction);
    }
    
    alert(`机器 "${entry.name}" 已保存到图鉴! (${entry.codexId})`);
  }, [modules, connections, addEntry, incrementMachinesCreated, incrementCodexEntries, incrementFactionCount, machinesCreated]);
  
  // Helper function to check machine-related achievements
  const checkAchievementsForMachines = (count: number) => {
    const machineThresholdAchievements = [
      'first-forge',      // 1 machine
      'apprentice-forge', // 5 machines
      'skilled-artisan',  // 10 machines
      'master-creator',   // 25 machines
      'legendary-machinist', // 50 machines
      'eternal-forger',   // 100 machines
    ];
    
    machineThresholdAchievements.forEach(achievementId => {
      const achievement = getAchievementById(achievementId);
      if (achievement && !earnedAchievements.includes(achievementId)) {
        const stats = {
          machinesCreated: count,
          activations,
          errors,
          playtimeMinutes: 0,
          factionCounts,
          codexEntries,
          tutorialCompleted: earnedAchievements.includes('getting-started'),
        };
        
        if (achievement.condition(stats)) {
          useAchievementStore.getState().triggerUnlock(achievement);
          addEarnedAchievement(achievementId);
        }
      }
    });
  };
  
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
  
  const handleLoadToEditor = useCallback((loadedModules: PlacedModule[], loadedConnections: Connection[]) => {
    loadMachine(loadedModules, loadedConnections);
    setViewMode('editor');
  }, [loadMachine]);
  
  const handlePublishToGallery = useCallback(() => {
    if (modules.length === 0) {
      alert('请至少添加一个模块再分享到社区。');
      return;
    }
    
    const attributes = generateAttributes(modules, connections);
    const faction = calculateFaction(modules);
    openPublishModal(modules, connections, attributes, faction || 'stellar');
  }, [modules, connections, openPublishModal]);

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
              
              {/* Exchange Button */}
              <ExchangeButton onClick={() => setShowExchange(true)} />
              
              <button
                onClick={() => setShowRecipeBrowser(true)}
                className="px-3 py-2 rounded-lg text-sm bg-[#121826] text-[#a855f7] hover:text-white border border-[#1e2a42] hover:border-[#a855f7]/30 transition-colors flex items-center gap-2"
                aria-label="打开配方图鉴"
              >
                <span>📜</span>
                <span>配方</span>
              </button>
              
              <button
                onClick={() => setShowAIAssistant(true)}
                className="px-3 py-2 rounded-lg text-sm bg-[#121826] text-[#ec4899] hover:text-white border border-[#1e2a42] hover:border-[#ec4899]/30 transition-colors flex items-center gap-2"
                aria-label="打开AI助手"
              >
                <span>🤖</span>
                <span>AI命名</span>
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
        
        {viewMode === 'editor' && (
          <Toolbar
            onOpenRecipeBrowser={() => setShowRecipeBrowser(true)}
            onOpenRandomGenerator={() => setShowRandomGenerator(true)}
            onOpenTemplateLibrary={() => setShowTemplateLibrary(true)}
            onOpenSaveTemplate={() => setShowSaveTemplate(true)}
          />
        )}
        
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
            <Suspense fallback={<LazyLoadingFallback height="100%" />}>
              <LazyCodexView onLoadToEditor={handleLoadToEditor} />
            </Suspense>
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
        {showExport && <ExportModal onClose={() => { setShowExport(false); setShowExportModal(false); }} onPublishToGallery={handlePublishToGallery} />}
        
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
              <Suspense fallback={<LazyLoadingFallback height="400px" />}>
                <LazyChallengePanel />
              </Suspense>
            </div>
          </div>
        )}
        
        <RecipeBrowser isOpen={showRecipeBrowser} onClose={() => setShowRecipeBrowser(false)} />
        {showLoadPrompt && <LoadPromptModal />}
        
        {/* RandomGeneratorModal — Round 57: integrated to fix Round 56 critical integration failure */}
        {showRandomGenerator && (
          <RandomGeneratorModal
            isOpen={showRandomGenerator}
            onClose={() => setShowRandomGenerator(false)}
            onGenerate={(result) => {
              loadMachine(result.modules, result.connections);
            }}
          />
        )}
        
        {/* Template Library Modal - Round 67 (lazy-loaded for code splitting) */}
        {showTemplateLibrary && (
          <Suspense fallback={<LazyLoadingFallback height="500px" />}>
            <LazyTemplateLibrary
              isOpen={showTemplateLibrary}
              onClose={() => setShowTemplateLibrary(false)}
              onOpenSaveModal={() => {
                setShowTemplateLibrary(false);
                setShowSaveTemplate(true);
              }}
            />
          </Suspense>
        )}
        
        {/* Save Template Modal - Round 67 (lazy-loaded for code splitting) */}
        {showSaveTemplate && (
          <Suspense fallback={<LazyLoadingFallback height="300px" />}>
            <LazySaveTemplateModal
              isOpen={showSaveTemplate}
              onClose={() => setShowSaveTemplate(false)}
              onSuccess={(templateId) => {
                // Template saved successfully - could show a toast or notification
                console.log('Template saved:', templateId);
              }}
            />
          </Suspense>
        )}
        
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
        
        {/* Lazy-loaded panels */}
        {showFactionPanel && (
          <Suspense fallback={<LazyLoadingFallback height="100%" />}>
            <LazyFactionPanel onClose={() => setShowFactionPanel(false)} />
          </Suspense>
        )}
        
        {showTechTree && (
          <Suspense fallback={<LazyLoadingFallback height="100%" />}>
            <LazyTechTree onClose={() => setShowTechTree(false)} />
          </Suspense>
        )}
        
        {/* Exchange Panel */}
        {showExchange && (
          <Suspense fallback={<LazyLoadingFallback height="85vh" />}>
            <LazyExchangePanel onClose={() => setShowExchange(false)} />
          </Suspense>
        )}
        
        {/* Machine Statistics Dashboard - Enhanced version with 5 tabs (Round 44 integration) */}
        {isStatsPanelOpen && <EnhancedStatsDashboard onClose={closeStatsPanel} />}
        
        {showAchievements && <AchievementList onClose={() => setShowAchievements(false)} />}
        
        {/* AI Assistant Slide-in Panel - FIX: Use AIAssistantSlideIn wrapper for close functionality */}
        <Suspense fallback={<LazyLoadingFallback height="100%" />}>
          <LazyAIAssistantSlideIn isOpen={showAIAssistant} onClose={() => setShowAIAssistant(false)} />
        </Suspense>
        
        {/* Toast Notifications */}
        <ConnectionErrorFeedback />
        <RandomForgeToast />
        {/* FIX: Use AchievementToastContainer with queue system instead of single AchievementToast */}
        <AchievementToastContainer options={{ maxVisible: 3, staggerDelay: 3000 }} />
        <RecipeToastManager />
        
        {/* Trade Notification */}
        <TradeNotification onOpenExchange={() => setShowExchange(true)} />
        
        {/* Community Gallery Modal */}
        {isGalleryOpen && <CommunityGallery />}
        
        {/* Publish to Gallery Modal */}
        {isPublishModalOpen && <PublishModal />}
        
        {/* FIX: Always render WelcomeModal when user hasn't seen it before
            WelcomeModal itself decides whether to show based on localStorage */}
        {isHydrated && !hasSeenWelcome && <WelcomeModal onStartTutorial={handleStartTutorial} onSkip={handleSkip} />}
        
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
  
  // Mobile layout with touch enhancements
  return (
    <MobileTouchEnhancer
      config={{
        enablePinchZoom: true,
        enableTwoFingerPan: true,
        enableLongPress: true,
      }}
      feedbackStyle="ripple"
    >
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
            <Suspense fallback={<LazyLoadingFallback height="100%" />}>
              <LazyCodexView onLoadToEditor={handleLoadToEditor} />
            </Suspense>
          )
        }
      />
    </MobileTouchEnhancer>
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
