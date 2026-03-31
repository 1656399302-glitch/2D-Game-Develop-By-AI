/**
 * useAINaming Hook
 * 
 * React hook for AI naming and description generation.
 * Provides seamless fallback to local generation when AI is unavailable.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AIProvider } from '../services/ai/AIProvider';
import { LocalAIProvider } from '../services/ai/LocalAIProvider';
import { createProvider, ProviderType } from '../services/ai/AIServiceFactory';
import { AIProviderConfig, AIProviderResult } from '../services/ai/types';
import { GeneratedAttributes } from '../types';

/**
 * State for name generation
 */
interface NamingState {
  isLoading: boolean;
  error: string | null;
  isUsingAI: boolean;
  lastProvider: string;
}

/**
 * Hook options
 */
export interface UseAINamingOptions {
  /** Initial provider type to use */
  providerType?: ProviderType;
  /** Provider configuration */
  config?: Partial<AIProviderConfig>;
  /** Enable automatic fallback to local on AI failure */
  autoFallback?: boolean;
}

/**
 * useAINaming return type
 */
export interface UseAINamingReturn {
  /** Generate a machine name */
  generateName: (params: {
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>;
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>;
    faction?: string;
    preferredTags?: string[];
    preferredRarity?: string;
  }) => Promise<AIProviderResult<string>>;
  
  /** Generate a machine description */
  generateDescription: (params: {
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>;
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>;
    machineName: string;
    attributes: {
      rarity: string;
      stability: number;
      power: number;
      tags: string[];
    };
    style?: 'technical' | 'flavor' | 'lore' | 'mixed';
    maxLength?: number;
  }) => Promise<AIProviderResult<string>>;
  
  /** Generate full machine attributes (name, description, stats) */
  generateFullAttributes: (
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>,
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>
  ) => Promise<AIProviderResult<GeneratedAttributes>>;
  
  /** Whether generation is in progress */
  isLoading: boolean;
  
  /** Error message if last generation failed */
  error: string | null;
  
  /** Whether the current/last generation used an AI provider (vs local) */
  isUsingAI: boolean;
  
  /** Current provider type */
  currentProvider: string;
  
  /** Set the provider type */
  setProvider: (type: ProviderType) => void;
  
  /** Update provider configuration */
  updateConfig: (config: Partial<AIProviderConfig>) => void;
  
  /** Reset to default local provider */
  resetToLocal: () => void;
}

/**
 * Default options
 */
const DEFAULT_OPTIONS: UseAINamingOptions = {
  providerType: 'local',
  autoFallback: true,
};

/**
 * useAINaming Hook
 * 
 * Provides AI naming and description generation with automatic fallback.
 * 
 * @param options - Hook configuration options
 * @returns Hook return object with generation functions and state
 * 
 * @example
 * ```tsx
 * const { generateName, generateDescription, isLoading } = useAINaming();
 * 
 * const handleGenerate = async () => {
 *   const result = await generateName({ modules, connections });
 *   console.log(result.data);
 * };
 * ```
 */
export function useAINaming(options: UseAINamingOptions = {}): UseAINamingReturn {
  const { autoFallback = true } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Initial provider type - default to 'local' if not provided
  const initialProvider = options.providerType ?? 'local';

  // Provider instance (using ref to maintain identity across renders)
  const providerRef = useRef<AIProvider>(new LocalAIProvider());
  
  // State
  const [state, setState] = useState<NamingState>({
    isLoading: false,
    error: null,
    isUsingAI: false,
    lastProvider: 'local',
  });
  
  // Current config
  const [config, setConfig] = useState<Partial<AIProviderConfig>>(options.config || {});

  // Initialize provider
  useEffect(() => {
    try {
      const provider = createProvider(initialProvider, config);
      providerRef.current = provider;
      setState(prev => ({
        ...prev,
        isUsingAI: initialProvider !== 'local',
        lastProvider: provider.providerType,
        error: null,
      }));
    } catch (error) {
      console.error('[useAINaming] Failed to create provider:', error);
      providerRef.current = new LocalAIProvider();
      setState(prev => ({
        ...prev,
        isUsingAI: false,
        lastProvider: 'local',
        error: 'Failed to initialize AI provider. Using local generation.',
      }));
    }
  }, [initialProvider]); // Only re-run when provider type changes

  /**
   * Set loading state helper
   */
  const setLoading = useCallback((isLoading: boolean, error: string | null = null) => {
    setState(prev => ({
      ...prev,
      isLoading,
      error,
    }));
  }, []);

  /**
   * Generate a machine name
   */
  const generateName = useCallback(async (params: {
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>;
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>;
    faction?: string;
    preferredTags?: string[];
    preferredRarity?: string;
  }): Promise<AIProviderResult<string>> => {
    setLoading(true);

    try {
      const result = providerRef.current.generateMachineName(params);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        isUsingAI: result.isFromAI,
        lastProvider: result.provider,
      }));
      return result;
    } catch (error) {
      // Fallback to local provider if autoFallback is enabled
      if (autoFallback) {
        console.warn('[useAINaming] Primary provider failed, falling back to local:', error);
        try {
          const localProvider = new LocalAIProvider();
          const result = localProvider.generateMachineName(params);
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: null,
            isUsingAI: false,
            lastProvider: 'local',
          }));
          return result;
        } catch (localError) {
          console.error('[useAINaming] Local fallback also failed:', localError);
          setLoading(false, 'Name generation failed. Please try again.');
          throw localError;
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Name generation failed';
      setLoading(false, errorMessage);
      throw error;
    }
  }, [autoFallback, setLoading]);

  /**
   * Generate a machine description
   */
  const generateDescription = useCallback(async (params: {
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>;
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>;
    machineName: string;
    attributes: {
      rarity: string;
      stability: number;
      power: number;
      tags: string[];
    };
    style?: 'technical' | 'flavor' | 'lore' | 'mixed';
    maxLength?: number;
  }): Promise<AIProviderResult<string>> => {
    setLoading(true);

    try {
      const result = providerRef.current.generateMachineDescription(params);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        isUsingAI: result.isFromAI,
        lastProvider: result.provider,
      }));
      return result;
    } catch (error) {
      // Fallback to local provider if autoFallback is enabled
      if (autoFallback) {
        console.warn('[useAINaming] Primary provider failed, falling back to local:', error);
        try {
          const localProvider = new LocalAIProvider();
          const result = localProvider.generateMachineDescription(params);
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: null,
            isUsingAI: false,
            lastProvider: 'local',
          }));
          return result;
        } catch (localError) {
          console.error('[useAINaming] Local fallback also failed:', localError);
          setLoading(false, 'Description generation failed. Please try again.');
          throw localError;
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Description generation failed';
      setLoading(false, errorMessage);
      throw error;
    }
  }, [autoFallback, setLoading]);

  /**
   * Generate full machine attributes
   */
  const generateFullAttributes = useCallback(async (
    modules: Array<{ type: string; category?: string; id?: string; instanceId?: string }>,
    connections: Array<{ sourceModuleId: string; targetModuleId: string }>
  ): Promise<AIProviderResult<GeneratedAttributes>> => {
    setLoading(true);

    try {
      const result = providerRef.current.generateFullAttributes(modules, connections);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        isUsingAI: result.isFromAI,
        lastProvider: result.provider,
      }));
      return result;
    } catch (error) {
      // Fallback to local provider if autoFallback is enabled
      if (autoFallback) {
        console.warn('[useAINaming] Primary provider failed, falling back to local:', error);
        try {
          const localProvider = new LocalAIProvider();
          const result = localProvider.generateFullAttributes(modules, connections);
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: null,
            isUsingAI: false,
            lastProvider: 'local',
          }));
          return result;
        } catch (localError) {
          console.error('[useAINaming] Local fallback also failed:', localError);
          setLoading(false, 'Attribute generation failed. Please try again.');
          throw localError;
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Attribute generation failed';
      setLoading(false, errorMessage);
      throw error;
    }
  }, [autoFallback, setLoading]);

  /**
   * Set provider type
   */
  const setProvider = useCallback((type: ProviderType) => {
    try {
      const provider = createProvider(type, config);
      providerRef.current = provider;
      setState(prev => ({
        ...prev,
        isUsingAI: type !== 'local',
        lastProvider: provider.providerType,
        error: null,
      }));
    } catch (error) {
      console.error('[useAINaming] Failed to set provider:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to switch AI provider',
      }));
    }
  }, [config]);

  /**
   * Update provider configuration
   */
  const updateConfig = useCallback((newConfig: Partial<AIProviderConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  /**
   * Reset to local provider
   */
  const resetToLocal = useCallback(() => {
    providerRef.current = new LocalAIProvider();
    setState(prev => ({
      ...prev,
      isUsingAI: false,
      lastProvider: 'local',
      error: null,
    }));
  }, []);

  return {
    generateName,
    generateDescription,
    generateFullAttributes,
    isLoading: state.isLoading,
    error: state.error,
    isUsingAI: state.isUsingAI,
    currentProvider: state.lastProvider,
    setProvider,
    updateConfig,
    resetToLocal,
  };
}

export default useAINaming;
