/**
 * useRandomGenerator Hook
 * 
 * Provides state management for the enhanced random generator with:
 * - Theme selection
 * - Complexity controls
 * - Generation history
 * - Validation state
 */

import { useState, useCallback, useRef } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import {
  GenerationTheme,
  ConnectionDensity,
  GenerationResult,
  EnhancedGeneratorConfig,
  DEFAULT_ENHANCED_CONFIG,
  generateWithTheme,
  generateWithRetry,
  THEME_DISPLAY_INFO,
} from '../utils/randomGenerator';

export interface RandomGeneratorState {
  // UI State
  isModalOpen: boolean;
  isGenerating: boolean;
  
  // Configuration
  selectedTheme: GenerationTheme;
  connectionDensity: ConnectionDensity;
  moduleCountMin: number;
  moduleCountMax: number;
  useFactionVariants: boolean;
  
  // Last generation result
  lastResult: GenerationResult | null;
  
  // History
  generationHistory: GenerationResult[];
  maxHistorySize: number;
}

export interface RandomGeneratorActions {
  // Modal control
  openModal: () => void;
  closeModal: () => void;
  
  // Configuration setters
  setTheme: (theme: GenerationTheme) => void;
  setConnectionDensity: (density: ConnectionDensity) => void;
  setModuleCountRange: (min: number, max: number) => void;
  setUseFactionVariants: (use: boolean) => void;
  
  // Generation actions
  generate: () => GenerationResult;
  generateAndApply: () => void;
  generateWithRetry: () => GenerationResult;
  clearHistory: () => void;
  
  // Apply generated machine to canvas
  applyToCanvas: (result: GenerationResult) => void;
}

export type UseRandomGeneratorReturn = RandomGeneratorState & RandomGeneratorActions;

/**
 * Hook for random generator state management
 */
export function useRandomGenerator(): UseRandomGeneratorReturn {
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Configuration
  const [selectedTheme, setSelectedTheme] = useState<GenerationTheme>(DEFAULT_ENHANCED_CONFIG.theme);
  const [connectionDensity, setConnectionDensity] = useState<ConnectionDensity>(DEFAULT_ENHANCED_CONFIG.connectionDensity);
  const [moduleCountMin, setModuleCountMin] = useState(3);
  const [moduleCountMax, setModuleCountMax] = useState(8);
  const [useFactionVariants, setUseFactionVariants] = useState(DEFAULT_ENHANCED_CONFIG.useFactionVariants);
  
  // Last result
  const [lastResult, setLastResult] = useState<GenerationResult | null>(null);
  
  // History
  const [generationHistory, setGenerationHistory] = useState<GenerationResult[]>([]);
  const maxHistorySizeRef = useRef(10);
  
  // Get store actions
  const loadMachine = useMachineStore((state) => state.loadMachine);
  const showRandomForgeToast = useMachineStore((state) => state.showRandomForgeToast);
  
  // Modal control
  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);
  
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);
  
  // Configuration setters
  const setTheme = useCallback((theme: GenerationTheme) => {
    setSelectedTheme(theme);
  }, []);
  
  const setDensity = useCallback((density: ConnectionDensity) => {
    setConnectionDensity(density);
  }, []);
  
  const setModuleCountRange = useCallback((min: number, max: number) => {
    setModuleCountMin(Math.max(2, Math.min(15, min)));
    setModuleCountMax(Math.max(2, Math.min(15, max)));
  }, []);
  
  const setFactionVariants = useCallback((use: boolean) => {
    setUseFactionVariants(use);
  }, []);
  
  // Build configuration
  const buildConfig = useCallback((): EnhancedGeneratorConfig => {
    return {
      minModules: moduleCountMin,
      maxModules: moduleCountMax,
      minSpacing: 80,
      canvasWidth: 800,
      canvasHeight: 600,
      padding: 100,
      theme: selectedTheme,
      connectionDensity,
      useFactionVariants,
    };
  }, [moduleCountMin, moduleCountMax, selectedTheme, connectionDensity, useFactionVariants]);
  
  // Generate without applying
  const generate = useCallback((): GenerationResult => {
    setIsGenerating(true);
    
    try {
      const config = buildConfig();
      const result = generateWithTheme(config);
      
      setLastResult(result);
      
      // Add to history
      setGenerationHistory((prev) => {
        const newHistory = [result, ...prev];
        if (newHistory.length > maxHistorySizeRef.current) {
          newHistory.pop();
        }
        return newHistory;
      });
      
      return result;
    } finally {
      setIsGenerating(false);
    }
  }, [buildConfig]);
  
  // Apply generated machine to canvas
  const applyToCanvas = useCallback((result: GenerationResult) => {
    if (!result.validation.valid) {
      console.warn('Applying invalid machine result');
    }
    
    loadMachine(result.modules, result.connections);
    
    const themeInfo = THEME_DISPLAY_INFO[result.theme];
    showRandomForgeToast(
      `已生成 ${themeInfo.name} 风格机器 (${result.modules.length} 模块)`
    );
  }, [loadMachine, showRandomForgeToast]);
  
  // Generate and apply to canvas
  const generateAndApply = useCallback(() => {
    const result = generate();
    applyToCanvas(result);
    closeModal();
  }, [generate, applyToCanvas, closeModal]);
  
  // Generate with retry (for validation failures)
  const generateWithRetryFn = useCallback((): GenerationResult => {
    setIsGenerating(true);
    
    try {
      const config = buildConfig();
      const result = generateWithRetry(config, 3);
      
      setLastResult(result);
      
      // Add to history
      setGenerationHistory((prev) => {
        const newHistory = [result, ...prev];
        if (newHistory.length > maxHistorySizeRef.current) {
          newHistory.pop();
        }
        return newHistory;
      });
      
      return result;
    } finally {
      setIsGenerating(false);
    }
  }, [buildConfig]);
  
  // Clear history
  const clearHistory = useCallback(() => {
    setGenerationHistory([]);
    setLastResult(null);
  }, []);
  
  return {
    // State
    isModalOpen,
    isGenerating,
    selectedTheme,
    connectionDensity,
    moduleCountMin,
    moduleCountMax,
    useFactionVariants,
    lastResult,
    generationHistory,
    maxHistorySize: maxHistorySizeRef.current,
    
    // Actions
    openModal,
    closeModal,
    setTheme,
    setConnectionDensity: setDensity,
    setModuleCountRange,
    setUseFactionVariants: setFactionVariants,
    generate,
    generateAndApply,
    generateWithRetry: generateWithRetryFn,
    clearHistory,
    applyToCanvas,
  };
}

export default useRandomGenerator;
