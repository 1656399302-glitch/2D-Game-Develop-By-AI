import { useState, useCallback } from 'react';
import {
  getAIService,
  AINameRequest,
  AINameResponse,
  AIMachineContext,
} from '../../types/aiIntegration';
import { useMachineStore } from '../../store/useMachineStore';

/**
 * Name style options for AI generation
 */
export type NameStyle = 'arcane' | 'mechanical' | 'mixed' | 'poetic';

/**
 * Name style display labels
 */
export const NAME_STYLE_LABELS: Record<NameStyle, string> = {
  arcane: '神秘符文',
  mechanical: '机械工程',
  mixed: '混合风格',
  poetic: '诗意浪漫',
};

/**
 * Module type to category mapping
 */
const CATEGORY_MAP: Record<string, string> = {
  'core-furnace': 'energy',
  'energy-pipe': 'transfer',
  'gear': 'mechanical',
  'rune-node': 'arcane',
  'shield-shell': 'protection',
  'trigger-switch': 'control',
  'output-array': 'output',
  'amplifier-crystal': 'amplification',
  'stabilizer-core': 'stability',
  'void-siphon': 'void',
  'phase-modulator': 'phase',
  'resonance-chamber': 'resonance',
  'fire-crystal': 'fire',
  'lightning-conductor': 'lightning',
};

/**
 * Get category from module type
 */
function getCategoryFromType(type: string): string {
  return CATEGORY_MAP[type] || 'unknown';
}

/**
 * AI Assistant Panel Component
 * 
 * Provides AI-powered naming and description generation for machines.
 * Uses the MockAIService for development/testing with the ability
 * to integrate with real AI providers in production.
 */
export function AIAssistantPanel() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNames, setGeneratedNames] = useState<AINameResponse[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [nameStyle, setNameStyle] = useState<NameStyle>('mixed');
  const [error, setError] = useState<string | null>(null);
  
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const setGeneratedAttributes = useMachineStore((state) => state.setGeneratedAttributes);
  
  // Build machine context from current state
  const buildMachineContext = useCallback((): AIMachineContext => {
    const moduleSummary = modules.map((m) => ({
      type: m.type,
      category: getCategoryFromType(m.type),
      connections: connections.filter(
        (c) => c.sourceModuleId === m.instanceId || c.targetModuleId === m.instanceId
      ).length,
    }));
    
    return {
      modules: moduleSummary,
      connections: connections.length,
      existingTags: [],
    };
  }, [modules, connections]);
  
  // Generate names using AI service
  const handleGenerateNames = useCallback(async () => {
    if (modules.length === 0) {
      setError('请先添加模块后再生成名称');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setGeneratedNames([]);
    setSelectedName(null);
    
    try {
      const aiService = getAIService();
      const request: AINameRequest = {
        context: buildMachineContext(),
        style: nameStyle,
        language: 'mixed',
        maxLength: 20,
      };
      
      const response = await aiService.generateName(request);
      setGeneratedNames([response]);
      
      // Generate alternatives if available
      if (response.alternatives && response.alternatives.length > 0) {
        // Add alternatives as additional options
        const altResponses: AINameResponse[] = response.alternatives.map((alt) => ({
          name: alt.name,
          nameEn: alt.nameEn,
          confidence: alt.confidence,
        }));
        setGeneratedNames((prev) => [...prev, ...altResponses]);
      }
    } catch (err) {
      setError('名称生成失败，请稍后重试');
      console.error('AI naming error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [modules.length, nameStyle, buildMachineContext]);
  
  // Apply selected name to machine attributes
  const handleApplyName = useCallback(() => {
    if (selectedName) {
      // Update the machine with the new name via generatedAttributes
      const currentAttributes = useMachineStore.getState().generatedAttributes;
      if (currentAttributes) {
        setGeneratedAttributes({
          ...currentAttributes,
          name: selectedName,
        });
      } else {
        // Create minimal attributes with just the name
        setGeneratedAttributes({
          name: selectedName,
          rarity: 'common',
          stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 50 },
          tags: [],
          description: '',
          codexId: '',
        });
      }
    }
  }, [selectedName, setGeneratedAttributes]);
  
  // Select a name from generated options
  const handleSelectName = useCallback((name: string) => {
    setSelectedName(name);
  }, []);
  
  return (
    <div className="bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-xl border border-[#7c3aed]/40 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1e2a42] bg-[#121826]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h2 className="text-lg font-bold text-white">AI 命名助手</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs rounded bg-[#7c3aed]/20 text-[#a855f7] border border-[#7c3aed]/30">
              Beta
            </span>
          </div>
        </div>
        <p className="mt-1 text-xs text-[#9ca3af]">
          基于机器组成智能生成创意名称
        </p>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Style Selector */}
        <div>
          <label className="block text-xs font-medium text-[#9ca3af] mb-2">
            命名风格
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(NAME_STYLE_LABELS) as NameStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setNameStyle(style)}
                className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                  nameStyle === style
                    ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-white'
                    : 'bg-[#121826] border-[#1e2a42] text-[#9ca3af] hover:border-[#7c3aed]/50 hover:text-white'
                }`}
              >
                {NAME_STYLE_LABELS[style]}
              </button>
            ))}
          </div>
        </div>
        
        {/* Generate Button */}
        <button
          onClick={handleGenerateNames}
          disabled={isGenerating || modules.length === 0}
          className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            isGenerating
              ? 'bg-[#7c3aed]/50 text-white/50 cursor-not-allowed'
              : modules.length === 0
              ? 'bg-[#1e2a42] text-[#6b7280] cursor-not-allowed'
              : 'bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white hover:opacity-90'
          }`}
        >
          {isGenerating ? (
            <>
              <LoadingSpinner />
              <span>生成中...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>生成名称</span>
            </>
          )}
        </button>
        
        {/* Error Message */}
        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}
        
        {/* Empty State */}
        {!isGenerating && generatedNames.length === 0 && modules.length === 0 && (
          <div className="py-8 text-center">
            <span className="text-4xl mb-2 block">📦</span>
            <p className="text-sm text-[#6b7280]">
              添加模块后即可生成名称
            </p>
          </div>
        )}
        
        {/* Generated Names */}
        {generatedNames.length > 0 && (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-[#9ca3af]">
              生成的名称 ({generatedNames.length})
            </label>
            
            <div className="space-y-2">
              {generatedNames.map((result, index) => (
                <NameOption
                  key={`${result.name}-${index}`}
                  name={result.name}
                  nameEn={result.nameEn}
                  confidence={result.confidence}
                  isSelected={selectedName === result.name}
                  onSelect={() => handleSelectName(result.name)}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Apply Button */}
        {selectedName && (
          <button
            onClick={handleApplyName}
            className="w-full px-4 py-3 rounded-lg font-medium bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <span>✓</span>
            <span>应用名称: {selectedName}</span>
          </button>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="px-4 py-3 border-t border-[#1e2a42] bg-[#121826]/30">
        <p className="text-[10px] text-[#6b7280] text-center">
          当前机器: {modules.length} 模块, {connections.length} 连接
        </p>
      </div>
    </div>
  );
}

/**
 * Loading spinner component
 */
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Individual name option component
 */
interface NameOptionProps {
  name: string;
  nameEn?: string;
  confidence: number;
  isSelected: boolean;
  onSelect: () => void;
}

function NameOption({ name, nameEn, confidence, isSelected, onSelect }: NameOptionProps) {
  const confidencePercent = Math.round(confidence * 100);
  const confidenceColor =
    confidencePercent >= 90
      ? '#22c55e'
      : confidencePercent >= 75
      ? '#3b82f6'
      : '#f59e0b';
  
  return (
    <button
      onClick={onSelect}
      className={`w-full p-3 rounded-lg border transition-all text-left ${
        isSelected
          ? 'bg-[#7c3aed]/20 border-[#7c3aed]'
          : 'bg-[#121826] border-[#1e2a42] hover:border-[#7c3aed]/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`font-medium truncate ${isSelected ? 'text-white' : 'text-[#e5e7eb]'}`}>
            {name}
          </p>
          {nameEn && (
            <p className="text-xs text-[#9ca3af] truncate mt-0.5">{nameEn}</p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${confidenceColor}20`,
              color: confidenceColor,
            }}
          >
            {confidencePercent}%
          </span>
          {isSelected && (
            <span className="text-[#22c55e]">✓</span>
          )}
        </div>
      </div>
    </button>
  );
}

/**
 * AI Assistant Panel with slide-in animation
 */
interface AIAssistantSlideInProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistantSlideIn({ isOpen, onClose }: AIAssistantSlideInProps) {
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-[#0a0e17] border-l border-[#1e2a42] z-50 transform transition-transform duration-300 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#1e2a42]">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🤖</span>
              <span>AI 助手</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#1e2a42] transition-colors text-[#9ca3af] hover:text-white"
              aria-label="关闭"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 6l8 8M14 6l-8 8" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <AIAssistantPanel />
          </div>
        </div>
      </div>
    </>
  );
}

export default AIAssistantPanel;
