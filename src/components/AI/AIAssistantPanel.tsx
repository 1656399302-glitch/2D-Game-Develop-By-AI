import { useState, useCallback, useEffect } from 'react';
import { useAINaming } from '../../hooks/useAINaming';
import { useMachineStore } from '../../store/useMachineStore';
import { useSettingsStore, PROVIDER_DISPLAY_NAMES, AIProviderSettings } from '../../store/useSettingsStore';
import { AttributeTag } from '../../types';
import { AISettingsPanel } from './AISettingsPanel';
import { ProviderType } from '../../services/ai/AIServiceFactory';

/**
 * Name style options for AI generation
 */
export type NameStyle = 'arcane' | 'mechanical' | 'mixed' | 'poetic';

/**
 * Description style options
 */
export type DescriptionStyle = 'technical' | 'flavor' | 'lore' | 'mixed';

/**
 * Language options
 */
export type Language = 'zh' | 'en' | 'mixed';

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
 * Language display labels
 */
export const LANGUAGE_LABELS: Record<Language, string> = {
  zh: '中文',
  en: 'English',
  mixed: '双语',
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
 * Convert string tags to AttributeTag type
 */
function convertTagsToAttributeTag(tags: string[]): AttributeTag[] {
  const validTags: AttributeTag[] = ['fire', 'lightning', 'arcane', 'void', 'mechanical', 'protective', 'amplifying', 'balancing', 'explosive', 'stable', 'resonance'];
  return tags
    .filter(tag => validTags.includes(tag as AttributeTag))
    .map(tag => tag as AttributeTag);
}

/**
 * AI Assistant Panel Component
 * 
 * Provides AI-powered naming and description generation for machines.
 * Uses the useAINaming hook which supports both local generation and
 * external AI providers.
 */
export function AIAssistantPanel() {
  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  
  // Get provider type from settings store - with explicit type annotation
  const providerType: ProviderType = useSettingsStore(
    (state: { aiProvider: AIProviderSettings }) => state.aiProvider.providerType
  );
  
  // Use the AI naming hook
  const {
    generateName,
    generateDescription,
    generateFullAttributes,
    isLoading,
    error,
    isUsingAI,
    currentProvider,
    setProvider,
  } = useAINaming({ providerType });

  // Name generation state
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [generatedNames, setGeneratedNames] = useState<Array<{ name: string; nameEn?: string; confidence: number }>>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [nameStyle, setNameStyle] = useState<NameStyle>('mixed');
  const [nameError, setNameError] = useState<string | null>(null);
  
  // Description generation state
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState<{
    description: string;
    descriptionEn?: string;
    lore?: string;
    tags?: string[];
  } | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<DescriptionStyle>('mixed');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('zh');
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [copiedDescription, setCopiedDescription] = useState(false);
  
  // Store state
  const modules = useMachineStore((state) => state.modules);
  const connections = useMachineStore((state) => state.connections);
  const generatedAttributes = useMachineStore((state) => state.generatedAttributes);
  const setGeneratedAttributes = useMachineStore((state) => state.setGeneratedAttributes);

  // Sync error from hook
  useEffect(() => {
    if (error) {
      setNameError(error);
      setDescriptionError(error);
    }
  }, [error]);

  // Get machine attributes for description generation
  const getMachineAttributes = useCallback(() => {
    if (generatedAttributes) {
      return {
        rarity: generatedAttributes.rarity || 'common',
        stability: generatedAttributes.stats?.stability || 50,
        power: generatedAttributes.stats?.powerOutput || 50,
        tags: generatedAttributes.tags || [],
      };
    }
    return {
      rarity: 'common',
      stability: 50,
      power: 50,
      tags: [],
    };
  }, [generatedAttributes]);
  
  // Generate names using AI service hook
  const handleGenerateNames = useCallback(async () => {
    if (modules.length === 0) {
      setNameError('请先添加模块后再生成名称');
      return;
    }
    
    setIsGeneratingNames(true);
    setNameError(null);
    setGeneratedNames([]);
    setSelectedName(null);
    
    try {
      // Convert modules to format expected by hook
      const hookModules = modules.map((m) => ({
        type: m.type,
        category: getCategoryFromType(m.type),
        instanceId: m.instanceId,
      }));
      
      const result = await generateName({
        modules: hookModules,
        connections: connections.map((c) => ({
          sourceModuleId: c.sourceModuleId,
          targetModuleId: c.targetModuleId,
        })),
      });
      
      // Handle the result from the hook
      const names: Array<{ name: string; nameEn?: string; confidence: number }> = [];
      
      if (result.data) {
        // Primary name
        names.push({
          name: result.data,
          confidence: result.confidence,
        });
      }
      
      setGeneratedNames(names);
      
      // Auto-select first if only one
      if (names.length === 1) {
        setSelectedName(names[0].name);
      }
    } catch (err) {
      setNameError('名称生成失败，请稍后重试');
      console.error('AI naming error:', err);
    } finally {
      setIsGeneratingNames(false);
    }
  }, [modules, connections, generateName]);
  
  // Generate description using AI service hook
  const handleGenerateDescription = useCallback(async () => {
    if (modules.length === 0) {
      setDescriptionError('请先添加模块后再生成描述');
      return;
    }
    
    setIsGeneratingDescription(true);
    setDescriptionError(null);
    setGeneratedDescription(null);
    setSuggestedTags([]);
    
    try {
      // Convert modules to format expected by hook
      const hookModules = modules.map((m) => ({
        type: m.type,
        category: getCategoryFromType(m.type),
        instanceId: m.instanceId,
      }));
      
      const machineAttributes = getMachineAttributes();
      
      // Generate full attributes first to get name
      const fullResult = await generateFullAttributes(
        hookModules,
        connections.map((c) => ({
          sourceModuleId: c.sourceModuleId,
          targetModuleId: c.targetModuleId,
        }))
      );
      
      // Generate description
      const descResult = await generateDescription({
        modules: hookModules,
        connections: connections.map((c) => ({
          sourceModuleId: c.sourceModuleId,
          targetModuleId: c.targetModuleId,
        })),
        machineName: fullResult.data.name,
        attributes: {
          rarity: machineAttributes.rarity,
          stability: machineAttributes.stability,
          power: machineAttributes.power,
          tags: machineAttributes.tags,
        },
        style: selectedStyle === 'mixed' ? 'mixed' : selectedStyle === 'technical' ? 'technical' : selectedStyle === 'lore' ? 'lore' : 'flavor',
        maxLength: 300,
      });
      
      setGeneratedDescription({
        description: descResult.data,
        tags: machineAttributes.tags,
      });
      
      // Suggest tags from modules
      const tags = modules
        .map((m) => getCategoryFromType(m.type))
        .filter((tag, index, self) => self.indexOf(tag) === index)
        .slice(0, 5);
      setSuggestedTags(tags);
      
      // Update machine attributes with generated data
      if (fullResult.data) {
        setGeneratedAttributes(fullResult.data);
      }
    } catch (err) {
      setDescriptionError('描述生成失败，请稍后重试');
      console.error('AI description error:', err);
    } finally {
      setIsGeneratingDescription(false);
    }
  }, [modules, connections, selectedStyle, generateDescription, generateFullAttributes, getMachineAttributes, setGeneratedAttributes]);
  
  // Apply selected name to machine attributes
  const handleApplyName = useCallback(() => {
    if (selectedName) {
      const currentAttributes = useMachineStore.getState().generatedAttributes;
      if (currentAttributes) {
        setGeneratedAttributes({
          ...currentAttributes,
          name: selectedName,
        });
      } else {
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
  
  // Apply description to machine attributes
  const handleApplyDescription = useCallback(() => {
    if (generatedDescription) {
      const currentAttributes = useMachineStore.getState().generatedAttributes;
      const newTags = convertTagsToAttributeTag(generatedDescription.tags || suggestedTags);
      
      if (currentAttributes) {
        setGeneratedAttributes({
          ...currentAttributes,
          description: generatedDescription.description,
          tags: newTags.length > 0 ? newTags : currentAttributes.tags,
        });
      } else {
        setGeneratedAttributes({
          name: '魔法机械装置',
          rarity: 'common',
          stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 50 },
          tags: newTags,
          description: generatedDescription.description,
          codexId: '',
        });
      }
    }
  }, [generatedDescription, suggestedTags, setGeneratedAttributes]);
  
  // Select a name from generated options
  const handleSelectName = useCallback((name: string) => {
    setSelectedName(name);
  }, []);
  
  // Copy description to clipboard
  const handleCopyDescription = useCallback(() => {
    if (!generatedDescription) return;
    
    const text = selectedLanguage === 'zh'
      ? generatedDescription.description
      : selectedLanguage === 'en'
        ? (generatedDescription.descriptionEn || generatedDescription.description)
        : `${generatedDescription.description}\n\n${generatedDescription.descriptionEn || ''}`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopiedDescription(true);
      setTimeout(() => setCopiedDescription(false), 2000);
    });
  }, [generatedDescription, selectedLanguage]);
  
  // Get the display text based on selected language
  const getDisplayText = useCallback(() => {
    if (!generatedDescription) return '';
    
    switch (selectedLanguage) {
      case 'zh':
        return generatedDescription.description;
      case 'en':
        return generatedDescription.descriptionEn || generatedDescription.description;
      case 'mixed':
      default:
        return `${generatedDescription.description}\n\n${generatedDescription.descriptionEn || ''}`;
    }
  }, [generatedDescription, selectedLanguage]);

  // Handle opening settings
  const handleOpenSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  // Handle closing settings
  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  // Handle provider change from settings
  const handleProviderChange = useCallback((newProvider: ProviderType) => {
    setProvider(newProvider);
  }, [setProvider]);

  // Check if any generation is in progress
  const isAnyGenerating = isGeneratingNames || isGeneratingDescription || isLoading;

  // Description style labels
  const DESCRIPTION_STYLE_LABELS: Record<DescriptionStyle, string> = {
    technical: '技术描述',
    flavor: '风味描述',
    lore: '背景故事',
    mixed: '综合描述',
  };
  
  return (
    <div className="bg-gradient-to-br from-[#1a1a2e] via-[#121826] to-[#0a0e17] rounded-xl border border-[#7c3aed]/40 shadow-2xl overflow-hidden">
      {/* Settings Panel Overlay */}
      {showSettings && (
        <AISettingsPanel
          currentProvider={currentProvider}
          onClose={handleCloseSettings}
          onProviderChange={handleProviderChange}
        />
      )}
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1e2a42] bg-[#121826]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h2 className="text-lg font-bold text-white">AI 助手</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Provider Indicator */}
            <button
              onClick={handleOpenSettings}
              className="px-2 py-1 text-xs rounded bg-[#7c3aed]/20 text-[#a855f7] border border-[#7c3aed]/30 hover:bg-[#7c3aed]/30 transition-colors flex items-center gap-1"
              title="AI 设置"
            >
              <span>{isUsingAI ? '🤖' : '🏠'}</span>
              <span>{PROVIDER_DISPLAY_NAMES[currentProvider as ProviderType] || '本地生成器'}</span>
              <span className="text-[#9ca3af]">⚙️</span>
            </button>
            <span className="px-2 py-0.5 text-xs rounded bg-[#7c3aed]/20 text-[#a855f7] border border-[#7c3aed]/30">
              Beta
            </span>
          </div>
        </div>
        <p className="mt-1 text-xs text-[#9ca3af]">
          智能生成创意名称与机器描述
        </p>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
        
        {/* ===== NAME GENERATION SECTION ===== */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>✨</span>
            <span>名称生成</span>
          </h3>
          
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
                  disabled={isAnyGenerating}
                  className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                    nameStyle === style
                      ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-white'
                      : 'bg-[#121826] border-[#1e2a42] text-[#9ca3af] hover:border-[#7c3aed]/50 hover:text-white disabled:opacity-50'
                  }`}
                >
                  {NAME_STYLE_LABELS[style]}
                </button>
              ))}
            </div>
          </div>
          
          {/* Generate Names Button */}
          <button
            onClick={handleGenerateNames}
            disabled={isAnyGenerating || modules.length === 0}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isAnyGenerating || isGeneratingNames
                ? 'bg-[#7c3aed]/50 text-white/50 cursor-not-allowed'
                : modules.length === 0
                ? 'bg-[#1e2a42] text-[#6b7280] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white hover:opacity-90'
            }`}
          >
            {isAnyGenerating || isGeneratingNames ? (
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
          
          {/* Name Error Message */}
          {nameError && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {nameError}
            </div>
          )}
          
          {/* Generated Names */}
          {generatedNames.length > 0 && (
            <div className="space-y-2">
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
          
          {/* Apply Name Button */}
          {selectedName && !isAnyGenerating && (
            <button
              onClick={handleApplyName}
              className="w-full px-4 py-3 rounded-lg font-medium bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <span>✓</span>
              <span>应用名称: {selectedName}</span>
            </button>
          )}
        </section>
        
        {/* Divider */}
        <div className="border-t border-[#1e2a42] my-4" />
        
        {/* ===== DESCRIPTION GENERATION SECTION ===== */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>📜</span>
            <span>生成描述</span>
          </h3>
          
          {/* Description Style Selector */}
          <div>
            <label className="block text-xs font-medium text-[#9ca3af] mb-2">
              描述风格
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(DESCRIPTION_STYLE_LABELS) as DescriptionStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  disabled={isAnyGenerating}
                  className={`px-3 py-2 text-xs rounded-lg border transition-all ${
                    selectedStyle === style
                      ? 'bg-[#3b82f6]/20 border-[#3b82f6] text-white'
                      : 'bg-[#121826] border-[#1e2a42] text-[#9ca3af] hover:border-[#3b82f6]/50 hover:text-white disabled:opacity-50'
                  }`}
                >
                  {DESCRIPTION_STYLE_LABELS[style]}
                </button>
              ))}
            </div>
          </div>
          
          {/* Language Selector */}
          <div>
            <label className="block text-xs font-medium text-[#9ca3af] mb-2">
              输出语言
            </label>
            <div className="flex gap-2">
              {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  disabled={isAnyGenerating}
                  className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-all ${
                    selectedLanguage === lang
                      ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-white'
                      : 'bg-[#121826] border-[#1e2a42] text-[#9ca3af] hover:border-[#8b5cf6]/50 hover:text-white disabled:opacity-50'
                  }`}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>
          </div>
          
          {/* Generate Description Button */}
          <button
            onClick={handleGenerateDescription}
            disabled={isAnyGenerating || modules.length === 0}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isAnyGenerating || isGeneratingDescription
                ? 'bg-[#3b82f6]/50 text-white/50 cursor-not-allowed'
                : modules.length === 0
                ? 'bg-[#1e2a42] text-[#6b7280] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white hover:opacity-90'
            }`}
          >
            {isAnyGenerating || isGeneratingDescription ? (
              <>
                <LoadingSpinner />
                <span>生成中...</span>
              </>
            ) : (
              <>
                <span>📜</span>
                <span>生成描述</span>
              </>
            )}
          </button>
          
          {/* Description Error Message */}
          {descriptionError && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {descriptionError}
            </div>
          )}
          
          {/* Empty State */}
          {!isGeneratingDescription && !generatedDescription && modules.length === 0 && (
            <div className="py-6 text-center">
              <span className="text-3xl mb-2 block">📦</span>
              <p className="text-sm text-[#6b7280]">
                添加模块后即可生成描述
              </p>
            </div>
          )}
          
          {/* Generated Description Display */}
          {generatedDescription && (
            <div className="space-y-4">
              {/* Description Container */}
              <div className="p-4 rounded-lg bg-[#121826] border border-[#1e2a42]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#9ca3af]">
                    {DESCRIPTION_STYLE_LABELS[selectedStyle]}
                  </span>
                  <button
                    onClick={handleCopyDescription}
                    className="text-xs px-2 py-1 rounded bg-[#1e2a42] text-[#9ca3af] hover:text-white hover:bg-[#2d3748] transition-colors"
                  >
                    {copiedDescription ? '✓ 已复制' : '📋 复制'}
                  </button>
                </div>
                <p className="text-sm text-[#e5e7eb] leading-relaxed whitespace-pre-wrap">
                  {getDisplayText()}
                </p>
              </div>
              
              {/* Lore Text Section */}
              {generatedDescription.lore && (
                <div className="p-4 rounded-lg bg-[#1a1a2e] border border-[#7c3aed]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">📖</span>
                    <span className="text-xs text-[#a855f7] font-medium">背景故事</span>
                  </div>
                  <p className="text-xs text-[#9ca3af] leading-relaxed italic">
                    "{generatedDescription.lore}"
                  </p>
                </div>
              )}
              
              {/* Suggested Tags */}
              {suggestedTags.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[#9ca3af]">
                    属性标签建议
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-[#c4b5fd]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Apply Description Button */}
              {!isAnyGenerating && (
                <button
                  onClick={handleApplyDescription}
                  className="w-full px-4 py-3 rounded-lg font-medium bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <span>✓</span>
                  <span>应用到机器</span>
                </button>
              )}
              
              {/* Regenerate Button */}
              <button
                onClick={handleGenerateDescription}
                disabled={isAnyGenerating}
                className="w-full px-2 py-2 rounded-lg font-medium bg-[#1e2a42] text-[#9ca3af] hover:bg-[#2d3748] hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>🔄</span>
                <span>重新生成</span>
              </button>
            </div>
          )}
        </section>
        
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
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-[#0a0e17] border-l border-[#1e2a42] z-50 transform transition-transform duration-300 overflow-hidden">
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
