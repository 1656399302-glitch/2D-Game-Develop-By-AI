import { useState, useCallback, useEffect, lazy, Suspense, useRef } from 'react';
import { Canvas } from './components/Editor/Canvas';
import { ModulePanel } from './components/Editor/ModulePanel';
import { PropertiesPanel } from './components/Editor/PropertiesPanel';
import { Toolbar } from './components/Editor/Toolbar';
import { LoadPromptModal } from './components/UI/LoadPromptModal';
import { WelcomeModal, useWelcomeModal } from './components/Tutorial/WelcomeModal';
import { useMachineStore } from './store/useMachineStore';
import { useCodexStore } from './store/useCodexStore';
import { useTutorialStore } from './store/useTutorialStore';
import { useRecipeStore } from './store/useRecipeStore';
import { useStatsStore } from './store/useStatsStore';
import { useFactionStore } from './store/useFactionStore';
import { useAchievementStore } from './store/useAchievementStore';
import { useCommunityStore } from './store/useCommunityStore';
import { useMachineStatsStore } from './store/useMachineStatsStore';
import { useCircuitCanvasStore } from './store/useCircuitCanvasStore';
import { useCircuitChallengeStore } from './store/useCircuitChallengeStore';
import { hydrateExchangeStore } from './store/useExchangeStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useStoreHydration } from './hooks/useStoreHydration';
import { generateAttributes } from './utils/attributeGenerator';
import { hasSavedState } from './utils/localStorage';
import { calculateFaction } from './utils/factionCalculator';
import { AchievementToastContainer, AchievementToastProvider, useAchievementToastQueueContext } from './components/Achievements/AchievementToast';
import { getAchievementById } from './data/achievements';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AccessibilityLayer, MobileCanvasLayout, useViewportSize } from './components/Accessibility';
import { MobileTouchEnhancer } from './components/Accessibility/MobileTouchEnhancer';
import { ExchangeButton } from './components/Exchange/ExchangeButton';
import { PlacedModule, Connection } from './types';
import { RandomGeneratorModal } from './components/Editor/RandomGeneratorModal';

// D5 Integration: Import QuickActionsToolbar (Round 82)
import { QuickActionsToolbar } from './components/QuickActionsToolbar';

// D6 Integration: Import KeyboardShortcutsPanel and useKeyboardShortcutsPanel hook (Round 82)
import { KeyboardShortcutsPanel, useKeyboardShortcutsPanel } from './components/KeyboardShortcutsPanel';

// Round 113 Integration: Import validation components - kept eager for header use
import { ValidationStatusBar } from './components/Editor/ValidationStatusBar';
import { getActivationGate } from './utils/validationIntegration';
import { useActivationGate } from './hooks/useCircuitValidation';

// Round 137: Import setupAchievementIntegration for tech tree integration
import { setAchievementStoreGetter, setupAchievementIntegration } from './store/useTechTreeStore';

// Round 170: Import Backup System components
import { RecoveryPrompt } from './components/Backup/RecoveryPrompt';
import { BackupManager } from './components/Backup/BackupManager';
import { useCircuitBackup } from './hooks/useCircuitBackup';
import { useBackupStore } from './store/backupStore';

// Round 175/177: Import Circuit Challenge Panel for circuit challenge system
import { CircuitChallengePanel } from './components/Circuit/CircuitChallengePanel';

// Lazy-loaded modal components for code splitting
const LazyCodexView = lazy(() => import('./components/Codex/CodexView'));
const LazyChallengePanel = lazy(() => import('./components/Challenge/ChallengePanel'));
const LazyFactionPanel = lazy(() => import('./components/Factions/FactionPanel'));
// Round 137: LazyCircuitTechTree replaces LazyTechTree for circuit component tech tree
const LazyCircuitTechTree = lazy(() => import('./components/TechTree/LazyCircuitTechTree'));
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

// NEW: Lazy-loaded non-critical components for bundle optimization
const LazyAchievementList = lazy(() => import('./components/Achievements/AchievementList'));
const LazyEnhancedStatsDashboard = lazy(() => import('./components/Stats/EnhancedStatsDashboard'));
const LazyCommunityGallery = lazy(() => import('./components/Community/CommunityGallery'));
const LazyPublishModal = lazy(() => import('./components/Community/PublishModal'));
const LazyCircuitValidationOverlay = lazy(() => import('./components/Editor/CircuitValidationOverlay'));
const LazyQuickFixActions = lazy(() => import('./components/Editor/QuickFixActions'));
const LazyCanvasValidationOverlay = lazy(() => import('./components/Editor/CanvasValidationOverlay'));
const LazyTutorialOverlay = lazy(() => import('./components/Tutorial/TutorialOverlay'));
const LazyConnectionErrorFeedback = lazy(() => import('./components/UI/ConnectionErrorFeedback'));
const LazyRandomForgeToast = lazy(() => 
  import('./components/UI/RandomForgeToast').then((module) => ({
    default: module.RandomForgeToast as unknown as React.ComponentType<object>
  }))
);
const LazyRecipeToastManager = lazy(() => 
  import('./components/Recipes/RecipeDiscoveryToast').then((module) => ({
    default: module.RecipeToastManager as unknown as React.ComponentType<{onRecipeDiscovered?: (recipe: any) => void}>
  }))
);
const LazyTradeNotification = lazy(() => import('./components/Exchange/TradeNotification'));
const LazyRecipeBook = lazy(() => import('./components/RecipeBook/RecipeBook'));
// Round 148: Lazy-loaded components moved from eager imports for bundle optimization
const LazyExportModal = lazy(() => import('./components/Export/ExportModal').then(m => ({ default: m.ExportModal })));
const LazyActivationOverlay = lazy(() => import('./components/Preview/ActivationOverlay').then(m => ({ default: m.ActivationOverlay })));
const LazyRecipeBrowser = lazy(() => import('./components/Recipes/RecipeBrowser').then(m => ({ default: m.RecipeBrowser })));
const LazyChallengeButton = lazy(() => import('./components/Challenges/ChallengeButton').then(m => ({ default: m.ChallengeButton })));

// Round 130: Lazy-loaded SubCircuitPanel for bundle optimization
const LazySubCircuitPanel = lazy(() => import('./components/SubCircuit/SubCircuitPanel').then((module) => ({
  default: module.SubCircuitPanel as unknown as React.ComponentType<{
    onDelete?: (subCircuitId: string) => void;
    onRemoveInstances?: (subCircuitId: string) => void;
  }>
})));

// Round 132: Lazy-loaded CreateSubCircuitModal for bundle optimization
const LazyCreateSubCircuitModal = lazy(() => import('./components/SubCircuit/CreateSubCircuitModal').then((module) => ({
  default: module.CreateSubCircuitModal as unknown as React.ComponentType<{
    isOpen: boolean;
    selectedModuleCount: number;
    selectedModuleIds?: string[];
    onCreated?: (result: any) => void;
    onClose: () => void;
  }>
})));

type ViewMode = 'editor' | 'codex';

// Round 147: CSS animations moved to external file src/styles/circuit-animations.css
/**
 * Enhanced Loading fallback for lazy components (Round 146)
 * 
 * Features:
 * - Animated skeleton with pulsing effect
 * - Multiple skeleton variants for different component types
 * - CSS animation for smooth loading indication
 * - Respect prefers-reduced-motion for accessibility
 */
function LazyLoadingFallback({ height = '200px', variant = 'default' }: { height?: string; variant?: 'default' | 'panel' | 'modal' | 'list' }) {

  const renderSkeleton = () => {
    switch (variant) {
      case 'panel':
        // Panel skeleton with header and list items
        return (
          <div className="w-full h-full p-4 space-y-4">
            {/* Header skeleton */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded skeleton-element" />
              <div className="w-24 h-4 rounded skeleton-element" />
            </div>
            {/* List item skeletons */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded skeleton-element" />
                <div className="flex-1 space-y-1">
                  <div className="w-3/4 h-3 rounded skeleton-element" />
                  <div className="w-1/2 h-2 rounded skeleton-element" />
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'modal':
        // Modal skeleton with content blocks
        return (
          <div className="w-full h-full p-6 space-y-4">
            {/* Title skeleton */}
            <div className="w-1/2 h-6 rounded skeleton-element mx-auto" />
            {/* Content skeletons */}
            <div className="space-y-3">
              <div className="w-full h-4 rounded skeleton-element" />
              <div className="w-5/6 h-4 rounded skeleton-element" />
              <div className="w-4/5 h-4 rounded skeleton-element" />
            </div>
            {/* Action button skeletons */}
            <div className="flex justify-center gap-3 pt-4">
              <div className="w-24 h-8 rounded skeleton-element" />
              <div className="w-24 h-8 rounded skeleton-element" />
            </div>
          </div>
        );
      
      case 'list':
        // List skeleton with multiple items
        return (
          <div className="w-full h-full p-2 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'rgba(30, 42, 66, 0.3)' }}>
                <div className="w-8 h-8 rounded skeleton-element" />
                <div className="flex-1 space-y-1">
                  <div className="w-2/3 h-3 rounded skeleton-element" />
                  <div className="w-1/3 h-2 rounded skeleton-element" />
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'default':
      default:
        // Default skeleton with spinner and content
        return (
          <div className="flex flex-col items-center gap-4">
            {/* Animated spinner */}
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-3 border-[#7c3aed]/30 rounded-full" />
              <div className="absolute inset-0 border-3 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
            </div>
            {/* Content skeleton */}
            <div className="space-y-2 w-full px-4">
              <div className="w-full h-4 rounded skeleton-shimmer" />
              <div className="w-3/4 h-4 rounded skeleton-element mx-auto" />
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="flex items-center justify-center bg-[#121826] lazy-loading-fallback"
      style={{ height }}
      data-testid="lazy-loading-fallback"
      data-variant={variant}
    >
      {renderSkeleton()}
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
  
  const [showRecipeBook, setShowRecipeBook] = useState(false);
  // Template system state - Round 67
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  
  // Round 113: State for QuickFixActions menu
  const [quickFixModuleId, setQuickFixModuleId] = useState<string | null>(null);
  const [quickFixPosition, setQuickFixPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Round 132: State for CreateSubCircuitModal
  const [showCreateSubCircuitModal, setShowCreateSubCircuitModal] = useState(false);
  const [pendingSubCircuitModuleIds, setPendingSubCircuitModuleIds] = useState<string[]>([]);
  
  // Round 170: State for Backup Manager
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  
  /**
   * FIX Round 106: Track welcome modal dismissal to coordinate with LoadPromptModal
   */
  const [welcomeModalWasShown, setWelcomeModalWasShown] = useState(false);
  
  // FIX Round 77: Use context hook instead of direct hook call
  const { addToQueue } = useAchievementToastQueueContext();
  
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
  
  // Round 175/177: Circuit Challenge Panel visibility from store
  const isCircuitChallengePanelOpen = useCircuitChallengeStore((state) => state.isPanelOpen);
  
  // Viewport size for responsive layout
  const viewport = useViewportSize();
  
  // FIX: Read localStorage synchronously to determine welcome modal visibility
  const hasSeenWelcome = useTutorialStore(state => state.hasSeenWelcome);
  
  // Welcome modal hook
  const {
    handleStartTutorial: handleWelcomeStartTutorial,
    handleSkip: handleWelcomeSkip,
  } = useWelcomeModal();

  // Round 170: Get auto-save data for recovery check
  const autoSave = useBackupStore((state) => state.autoSave);

  // Round 170: Check if recovery is needed on mount
  useEffect(() => {
    if (isHydrated && autoSave) {
      // Check if there's a crash recovery flag or auto-save data
      const recoveryFlag = localStorage.getItem('circuit_backup_pending_recovery');
      if (recoveryFlag || autoSave) {
        setShowRecoveryPrompt(true);
      }
    }
  }, [isHydrated, autoSave]);

  // Round 170: Setup circuit backup hook
  useCircuitBackup({
    enabled: isHydrated,
    onRecoveryNeeded: () => {
      setShowRecoveryPrompt(true);
    },
  });

  // Round 170: Recovery prompt handlers
  const handleRecoveryRestore = useCallback(() => {
    // Restore from auto-save
    const backup = useBackupStore.getState().autoSave;
    if (backup) {
      try {
        const nodes = JSON.parse(backup.nodes);
        const conns = JSON.parse(backup.connections);
        // Load the circuit data
        loadMachine(nodes, conns);
      } catch (e) {
        console.error('Failed to restore from auto-save:', e);
      }
    }
    setShowRecoveryPrompt(false);
  }, [loadMachine]);

  const handleRecoveryStartFresh = useCallback(() => {
    // Clear auto-save and start fresh
    useBackupStore.getState().clearAutoSave();
    useBackupStore.getState().clearUnsavedChanges();
    setShowRecoveryPrompt(false);
  }, []);

  const handleOpenBackupManager = useCallback(() => {
    setShowBackupManager(true);
  }, []);

  const handleCloseBackupManager = useCallback(() => {
    setShowBackupManager(false);
  }, []);

  /**
   * FIX Round 106: Coordinated handleSkip that suppresses LoadPromptModal
   */
  const handleSkip = useCallback(() => {
    setWelcomeModalWasShown(true);
    handleWelcomeSkip();
  }, [handleWelcomeSkip]);

  /**
   * FIX Round 106: Coordinated handleStartTutorial that suppresses LoadPromptModal
   */
  const handleStartTutorialCallback = useCallback(() => {
    setWelcomeModalWasShown(true);
    handleWelcomeStartTutorial();
  }, [handleWelcomeStartTutorial]);

  // FIX: Hydrate exchange store on mount
  useEffect(() => {
    hydrateExchangeStore();
  }, []);

  /**
   * Round 132: Listen for open-create-subcircuit-modal event from Toolbar
   */
  useEffect(() => {
    const handleOpenCreateSubCircuitModal = (event: Event) => {
      const customEvent = event as CustomEvent<{ selectedModuleIds: string[] }>;
      const selectedModuleIds = customEvent.detail?.selectedModuleIds || [];
      
      setPendingSubCircuitModuleIds(selectedModuleIds);
      setShowCreateSubCircuitModal(true);
    };
    
    window.addEventListener('open-create-subcircuit-modal', handleOpenCreateSubCircuitModal);
    
    return () => {
      window.removeEventListener('open-create-subcircuit-modal', handleOpenCreateSubCircuitModal);
    };
  }, []);
  
  /**
   * Round 132: Handler for sub-circuit creation modal close
   */
  const handleCloseCreateSubCircuitModal = useCallback(() => {
    setShowCreateSubCircuitModal(false);
    setPendingSubCircuitModuleIds([]);
  }, []);
  
  /**
   * Round 132: Handler for sub-circuit creation success
   */
  const handleSubCircuitCreated = useCallback(() => {
    useCircuitCanvasStore.getState().clearCircuitNodeSelection();
  }, []);

  /**
   * FIX Round 106: Check for saved state on mount
   */
  useEffect(() => {
    if (welcomeModalWasShown) {
      markStateAsLoadedRef.current();
      return;
    }
    
    if (hasSavedState()) {
      setShowLoadPrompt(true);
    } else {
      markStateAsLoadedRef.current();
    }
  }, [welcomeModalWasShown]);
  
  // Track when WelcomeModal is shown to coordinate with LoadPromptModal
  useEffect(() => {
    if (isHydrated && !hasSeenWelcome) {
      setWelcomeModalWasShown(true);
    }
  }, [isHydrated, hasSeenWelcome]);
  
  // Use keyboard shortcuts hook
  const { shortcutFeedback } = useKeyboardShortcuts({ enabled: viewMode === 'editor' });
  
  // D6 Integration: Keyboard shortcuts panel state and toggle (Round 82)
  const { isOpen: isShortcutsPanelOpen, toggle: toggleShortcutsPanel, close: closeShortcutsPanel } = useKeyboardShortcutsPanel();
  
  // D6 Integration: Global keyboard handler for ? key toggle (Round 82)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        if (document.activeElement?.tagName !== 'INPUT' && 
            document.activeElement?.tagName !== 'TEXTAREA' &&
            !document.activeElement?.hasAttribute('contenteditable')) {
          e.preventDefault();
          toggleShortcutsPanel();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleShortcutsPanel]);
  
  // Sync store modal states with local state
  useEffect(() => {
    if (!isHydrated) return;
    setShowExport(showExportModal);
  }, [showExportModal, isHydrated]);
  
  useEffect(() => {
    if (!isHydrated) return;
    setShowCodex(showCodexModal);
  }, [showCodexModal, isHydrated]);
  
  // Tutorial completion handler - trigger recipe unlocks
  useEffect(() => {
    if (!isHydrated) return;
    const tutorialStore = useTutorialStore.getState();
    const tutorialCompleted = tutorialStore.currentStep >= 6;
    if (tutorialCompleted) {
      checkTutorialUnlockRef.current();
    }
  }, [isHydrated]);
  
  // Connect AchievementToastContainer to achievement store callbacks
  useEffect(() => {
    const handleAchievementUnlock = (achievement: any) => {
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
      const gettingStartedAchievement = getAchievementById('getting-started');
      
      if (gettingStartedAchievement) {
        const stats = {
          machinesCreated,
          activations,
          errors,
          playtimeMinutes: 0,
          factionCounts,
          codexEntries,
          tutorialCompleted: true,
          machinesExported: 0,
          complexMachinesCreated: 0,
        };
        
        if (gettingStartedAchievement.condition && gettingStartedAchievement.condition(stats)) {
          useAchievementStore.getState().triggerUnlock(gettingStartedAchievement);
          
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
  
  // Round 113: Circuit validation hook
  const { canActivate } = useActivationGate();
  
  const handleSaveToCodex = useCallback(() => {
    if (modules.length === 0) {
      alert('请至少添加一个模块再保存到图鉴。');
      return;
    }
    
    const attributes = generateAttributes(modules, connections);
    const entry = addEntry(attributes.name, modules, connections, attributes);
    
    incrementMachinesCreated();
    incrementCodexEntries();
    
    const newMachinesCreated = machinesCreated + 1;
    checkAchievementsForMachines(newMachinesCreated);
    
    const faction = calculateFaction(modules);
    if (faction) {
      incrementFactionCount(faction);
    }
    
    alert(`机器 "${entry.name}" 已保存到图鉴! (${entry.codexId})`);
  }, [modules, connections, addEntry, incrementMachinesCreated, incrementCodexEntries, incrementFactionCount, machinesCreated]);
  
  const checkAchievementsForMachines = (count: number) => {
    const machineThresholdAchievements = [
      'first-forge',
      'apprentice-forge',
      'skilled-artisan',
      'master-creator',
      'legendary-machinist',
      'eternal-forger',
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
          machinesExported: 0,
          complexMachinesCreated: 0,
        };
        
        if (achievement.condition && achievement.condition(stats)) {
          useAchievementStore.getState().triggerUnlock(achievement);
          addEarnedAchievement(achievementId);
        }
      }
    });
  };
  
  const handleActivate = useCallback(() => {
    const gate = getActivationGate();
    if (!gate.canActivate) {
      return;
    }
    setShowActivation(true);
    setMachineState('charging');
    incrementActivations();
  }, [setMachineState, setShowActivation, incrementActivations]);
  
  const handleModuleValidationClick = useCallback((moduleId: string, position: { x: number; y: number }) => {
    setQuickFixModuleId(moduleId);
    setQuickFixPosition(position);
  }, []);
  
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
  
  const handleSubCircuitDelete = useCallback((_subCircuitId: string) => {
    // Sub-circuit is already deleted from store
  }, []);
  
  const handleSubCircuitRemoveInstances = useCallback((subCircuitId: string) => {
    const nodes = useCircuitCanvasStore.getState().nodes;
    const removeCircuitNode = useCircuitCanvasStore.getState().removeCircuitNode;
    
    nodes.forEach((node: any) => {
      if (node.parameters?.isSubCircuit === true && node.parameters?.subCircuitId === subCircuitId) {
        removeCircuitNode(node.id);
      }
    });
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
                onClick={() => setShowRecipeBook(true)}
                className="px-3 py-2 rounded-lg text-sm bg-[#121826] text-[#f59e0b] hover:text-white border border-[#1e2a42] hover:border-[#f59e0b]/30 transition-colors flex items-center gap-2"
                aria-label="打开配方书"
              >
                <span>📖</span>
                <span>图鉴</span>
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
              
              <ValidationStatusBar />
              
              <button
                onClick={handleActivate}
                disabled={!canActivate}
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
              <Suspense fallback={null}><LazyChallengeButton onClick={() => setShowChallenges(true)} /></Suspense>
            </div>
          )}
        </header>
        
        {viewMode === 'editor' && (
          <Toolbar
            onOpenRecipeBrowser={() => setShowRecipeBrowser(true)}
            onOpenRandomGenerator={() => setShowRandomGenerator(true)}
            onOpenTemplateLibrary={() => setShowTemplateLibrary(true)}
            onOpenSaveTemplate={() => setShowSaveTemplate(true)}
            onOpenBackupManager={handleOpenBackupManager}
          />
        )}
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {viewMode === 'editor' ? (
            <>
              <div className="flex flex-col">
                <ModulePanel />
                <Suspense fallback={<LazyLoadingFallback height="150px" variant="panel" />}>
                  <LazySubCircuitPanel 
                    onDelete={handleSubCircuitDelete}
                    onRemoveInstances={handleSubCircuitRemoveInstances}
                  />
                </Suspense>
              </div>
              <div className="flex-1 flex">
                <div className="relative flex-1">
                  <Canvas onModuleValidationClick={handleModuleValidationClick} />
                  <Suspense fallback={null}>
                    <LazyCanvasValidationOverlay />
                  </Suspense>
                </div>
                <PropertiesPanel />
              </div>
            </>
          ) : (
            <Suspense fallback={<LazyLoadingFallback height="100%" variant="panel" />}>
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
        
        {viewMode === 'editor' && <QuickActionsToolbar />}
        
        <KeyboardShortcutsPanel 
          isOpen={isShortcutsPanelOpen} 
          onClose={closeShortcutsPanel} 
        />
        
        {shortcutFeedback && (
          <div 
            className="fixed bottom-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg bg-[#7c3aed]/90 text-white text-sm font-medium shadow-lg z-50 animate-pulse"
            role="status"
            aria-live="polite"
          >
            {shortcutFeedback}
          </div>
        )}
        
        <Suspense fallback={null}>
          <LazyQuickFixActions
            moduleId={quickFixModuleId}
            position={quickFixPosition}
            visible={!!quickFixModuleId}
            onClose={() => setQuickFixModuleId(null)}
          />
        </Suspense>
        
        {showExport && <Suspense fallback={null}><LazyExportModal onClose={() => setShowExport(false)} /></Suspense>}
        
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
        
        {showActivation && <Suspense fallback={null}><LazyActivationOverlay onComplete={handleActivationComplete} /></Suspense>}
        
        <Suspense fallback={null}>
          <LazyCircuitValidationOverlay />
        </Suspense>
        
        {showChallenges && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[80vh] bg-[#121826] border border-[#1e2a42] rounded-xl flex flex-col overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a42]">
                <div />
                <button onClick={() => setShowChallenges(false)} className="w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af]" aria-label="关闭">✕</button>
              </div>
              <Suspense fallback={<LazyLoadingFallback height="400px" variant="modal" />}>
                <LazyChallengePanel />
              </Suspense>
            </div>
          </div>
        )}
        
        <Suspense fallback={null}><LazyRecipeBrowser isOpen={showRecipeBrowser} onClose={() => setShowRecipeBrowser(false)} /></Suspense>
        
        {showRecipeBook && (
          <Suspense fallback={<LazyLoadingFallback height="80vh" variant="modal" />}>
            <LazyRecipeBook onClose={() => setShowRecipeBook(false)} />
          </Suspense>
        )}
        
        {showLoadPrompt && !welcomeModalWasShown && (
          <LoadPromptModal onDismiss={() => setShowLoadPrompt(false)} />
        )}
        
        {showRandomGenerator && (
          <RandomGeneratorModal
            isOpen={showRandomGenerator}
            onClose={() => setShowRandomGenerator(false)}
            onGenerate={(result) => {
              loadMachine(result.modules, result.connections);
            }}
          />
        )}
        
        {showTemplateLibrary && (
          <Suspense fallback={<LazyLoadingFallback height="500px" variant="modal" />}>
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
        
        {showSaveTemplate && (
          <Suspense fallback={<LazyLoadingFallback height="300px" variant="modal" />}>
            <LazySaveTemplateModal
              isOpen={showSaveTemplate}
              onClose={() => setShowSaveTemplate(false)}
              onSuccess={(templateId) => {
                console.log('Template saved:', templateId);
              }}
            />
          </Suspense>
        )}
        
        {showCreateSubCircuitModal && (
          <Suspense fallback={null}>
            <LazyCreateSubCircuitModal
              isOpen={showCreateSubCircuitModal}
              selectedModuleCount={pendingSubCircuitModuleIds.length}
              selectedModuleIds={pendingSubCircuitModuleIds}
              onClose={handleCloseCreateSubCircuitModal}
              onCreated={handleSubCircuitCreated}
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
                      <li>• 按 <kbd className="px-1 bg-[#1e2a42] rounded text-[#c084fc]">?</kbd> 查看所有快捷键</li>
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
        
        {showFactionPanel && (
          <Suspense fallback={<LazyLoadingFallback height="100%" variant="panel" />}>
            <LazyFactionPanel onClose={() => setShowFactionPanel(false)} />
          </Suspense>
        )}
        
        {showTechTree && (
          <Suspense fallback={<LazyLoadingFallback height="100%" variant="panel" />}>
            <LazyCircuitTechTree onClose={() => setShowTechTree(false)} />
          </Suspense>
        )}
        
        {showExchange && (
          <Suspense fallback={<LazyLoadingFallback height="85vh" variant="modal" />}>
            <LazyExchangePanel onClose={() => setShowExchange(false)} />
          </Suspense>
        )}
        
        {isStatsPanelOpen && (
          <Suspense fallback={<LazyLoadingFallback height="80vh" variant="panel" />}>
            <LazyEnhancedStatsDashboard onClose={closeStatsPanel} />
          </Suspense>
        )}
        
        {showAchievements && (
          <Suspense fallback={<LazyLoadingFallback height="80vh" variant="panel" />}>
            <LazyAchievementList onClose={() => setShowAchievements(false)} />
          </Suspense>
        )}
        
        <Suspense fallback={null}>
          <LazyAIAssistantSlideIn isOpen={showAIAssistant} onClose={() => setShowAIAssistant(false)} />
        </Suspense>
        
        <Suspense fallback={null}>
          <LazyConnectionErrorFeedback />
        </Suspense>
        <LazyRandomForgeToast />
        <AchievementToastContainer options={{ maxVisible: 3, staggerDelay: 3000 }} />
        <LazyRecipeToastManager />
        
        <LazyTradeNotification onOpenExchange={() => setShowExchange(true)} />
        
        {isGalleryOpen && (
          <Suspense fallback={<LazyLoadingFallback height="80vh" variant="modal" />}>
            <LazyCommunityGallery />
          </Suspense>
        )}
        
        {isPublishModalOpen && (
          <Suspense fallback={<LazyLoadingFallback height="400px" variant="modal" />}>
            <LazyPublishModal />
          </Suspense>
        )}
        
        {isHydrated && !hasSeenWelcome && (
          <WelcomeModal 
            onStartTutorial={handleStartTutorialCallback} 
            onSkip={handleSkip} 
          />
        )}
        
        <Suspense fallback={null}>
          <LazyTutorialOverlay
            onModuleAdded={() => {}}
            onModuleSelected={() => {}}
            onModuleConnected={() => {}}
            onMachineActivated={() => {}}
            onMachineSaved={() => {}}
          />
        </Suspense>

        {/* Round 170: Recovery Prompt - shown when crash recovery is detected */}
        <RecoveryPrompt
          isVisible={showRecoveryPrompt}
          onRestore={handleRecoveryRestore}
          onStartFresh={handleRecoveryStartFresh}
        />

        {/* Round 170: Backup Manager Modal */}
        {showBackupManager && (
          <div 
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={handleCloseBackupManager}
          >
            <div 
              className="relative max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto bg-[#121826] rounded-xl border border-[#1e2a42] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <BackupManager />
              <button
                onClick={handleCloseBackupManager}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af]"
                aria-label="关闭备份管理"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Round 175/177: Circuit Challenge Panel - conditionally rendered when isCircuitChallengePanelOpen is true */}
        {isCircuitChallengePanelOpen && <CircuitChallengePanel />}
      </div>
    );
  }
  
  // Mobile layout
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
            <Suspense fallback={<LazyLoadingFallback height="100%" variant="panel" />}>
              <LazyCodexView onLoadToEditor={handleLoadToEditor} />
            </Suspense>
          )
        }
      />
      {viewMode === 'editor' && <QuickActionsToolbar />}
      <KeyboardShortcutsPanel 
        isOpen={isShortcutsPanelOpen} 
        onClose={closeShortcutsPanel} 
      />
      {showCreateSubCircuitModal && (
        <Suspense fallback={null}>
          <LazyCreateSubCircuitModal
            isOpen={showCreateSubCircuitModal}
            selectedModuleCount={pendingSubCircuitModuleIds.length}
            selectedModuleIds={pendingSubCircuitModuleIds}
            onClose={handleCloseCreateSubCircuitModal}
            onCreated={handleSubCircuitCreated}
          />
        </Suspense>
      )}
      
      {/* Round 170: Recovery Prompt for mobile */}
      <RecoveryPrompt
        isVisible={showRecoveryPrompt}
        onRestore={handleRecoveryRestore}
        onStartFresh={handleRecoveryStartFresh}
      />
      
      {/* Round 170: Backup Manager for mobile */}
      {showBackupManager && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={handleCloseBackupManager}
        >
          <div 
            className="relative max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto bg-[#121826] rounded-xl border border-[#1e2a42] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <BackupManager />
            <button
              onClick={handleCloseBackupManager}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1e2a42] hover:bg-[#2d3a56] flex items-center justify-center text-[#9ca3af]"
              aria-label="关闭备份管理"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Round 175/177: Circuit Challenge Panel - conditionally rendered when isCircuitChallengePanelOpen is true (mobile) */}
      {isCircuitChallengePanelOpen && <CircuitChallengePanel />}
    </MobileTouchEnhancer>
  );
}

function App() {
  useEffect(() => {
    setAchievementStoreGetter(() => useAchievementStore);
    setupAchievementIntegration();
  }, []);
  
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('App Error:', error, errorInfo);
      }}
    >
      <AchievementToastProvider options={{ maxVisible: 3, staggerDelay: 3000 }}>
        <AccessibilityLayer>
          <AppContent />
        </AccessibilityLayer>
      </AchievementToastProvider>
    </ErrorBoundary>
  );
}

export default App;
