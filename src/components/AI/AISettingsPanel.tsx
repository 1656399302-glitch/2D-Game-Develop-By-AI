/**
 * AI Settings Panel Component
 * 
 * Provides UI for configuring AI provider settings.
 * Allows users to select between local generation and external AI providers.
 */

import { useState, useCallback } from 'react';
import { ProviderType } from '../../services/ai/AIServiceFactory';
import {
  useSettingsStore,
  PROVIDER_DISPLAY_NAMES,
  PROVIDER_DESCRIPTIONS,
  PROVIDER_ICONS,
  AIProviderSettings,
} from '../../store/useSettingsStore';

/**
 * Props for AISettingsPanel
 */
export interface AISettingsPanelProps {
  /** Current provider type from hook (used for display) */
  currentProvider: string;
  /** Callback when settings panel is closed */
  onClose: () => void;
  /** Callback when provider is changed */
  onProviderChange: (provider: ProviderType) => void;
}

/**
 * List of all available provider types
 */
const AVAILABLE_PROVIDERS: ProviderType[] = ['local', 'openai', 'anthropic', 'gemini'];

/**
 * API key field configuration for each provider
 */
const API_KEY_CONFIG: Record<ProviderType, { label: string; placeholder: string } | null> = {
  local: null, // No API key needed for local
  openai: { label: 'OpenAI API Key', placeholder: 'sk-...' },
  anthropic: { label: 'Anthropic API Key', placeholder: 'sk-ant-...' },
  gemini: { label: 'Google API Key', placeholder: 'AI...' },
};

/**
 * Check if a provider requires API key configuration
 */
function requiresApiKey(provider: ProviderType): boolean {
  return provider !== 'local';
}

/**
 * AI Settings Panel Component
 */
export function AISettingsPanel({
  currentProvider,
  onClose,
  onProviderChange,
}: AISettingsPanelProps) {
  // Get settings from store with explicit type annotations
  const providerType: ProviderType = useSettingsStore(
    (state: { aiProvider: AIProviderSettings }) => state.aiProvider.providerType
  );
  const apiKey: string | undefined = useSettingsStore(
    (state: { aiProvider: AIProviderSettings }) => state.aiProvider.apiKey
  );
  const setProviderType = useSettingsStore(
    (state: { setProviderType: (type: ProviderType) => void }) => state.setProviderType
  );
  const updateAIProviderConfig = useSettingsStore(
    (state: { updateAIProviderConfig: (config: Partial<AIProviderSettings>) => void }) => state.updateAIProviderConfig
  );
  const resetAIProvider = useSettingsStore(
    (state: { resetAIProvider: () => void }) => state.resetAIProvider
  );

  // Local state for API key input (not saved until explicitly submitted)
  const [tempApiKey, setTempApiKey] = useState<string>('');
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);

  // Handle provider selection
  const handleProviderSelect = useCallback(
    (provider: ProviderType) => {
      setProviderType(provider);
      onProviderChange(provider);

      // Clear API key when switching to local
      if (provider === 'local') {
        updateAIProviderConfig({ apiKey: undefined });
      }
    },
    [setProviderType, onProviderChange, updateAIProviderConfig]
  );

  // Handle API key save
  const handleSaveApiKey = useCallback(() => {
    if (tempApiKey.trim()) {
      updateAIProviderConfig({ apiKey: tempApiKey.trim() });
    }
    setIsEditingApiKey(false);
  }, [tempApiKey, updateAIProviderConfig]);

  // Handle API key clear
  const handleClearApiKey = useCallback(() => {
    updateAIProviderConfig({ apiKey: undefined });
    setTempApiKey('');
    setIsEditingApiKey(false);
  }, [updateAIProviderConfig]);

  // Handle reset to defaults
  const handleReset = useCallback(() => {
    resetAIProvider();
    setTempApiKey('');
    setIsEditingApiKey(false);
    onProviderChange('local');
  }, [resetAIProvider, onProviderChange]);

  // Get API key config for current provider
  const currentApiKeyConfig = API_KEY_CONFIG[providerType];
  const showApiKeyField = requiresApiKey(providerType);

  return (
    <div className="absolute inset-0 z-10 bg-[#0a0e17]/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1e2a42] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span>⚙️</span>
          <span>AI 设置</span>
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[#1e2a42] transition-colors text-[#9ca3af] hover:text-white"
          aria-label="关闭设置"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6l8 8M14 6l-8 8" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[#9ca3af]">
            AI 提供商
          </label>
          <div className="space-y-2">
            {AVAILABLE_PROVIDERS.map((provider) => {
              const isSelected = providerType === provider;
              const isImplemented = provider === 'local';
              
              return (
                <button
                  key={provider}
                  onClick={() => handleProviderSelect(provider)}
                  disabled={!isImplemented}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'bg-[#7c3aed]/20 border-[#7c3aed]'
                      : 'bg-[#121826] border-[#1e2a42] hover:border-[#7c3aed]/50'
                  } ${!isImplemented ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Radio indicator */}
                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-[#7c3aed] bg-[#7c3aed]'
                        : 'border-[#4b5563]'
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    
                    {/* Provider info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{PROVIDER_ICONS[provider]}</span>
                        <span className={`font-medium ${isSelected ? 'text-white' : 'text-[#e5e7eb]'}`}>
                          {PROVIDER_DISPLAY_NAMES[provider]}
                        </span>
                        {!isImplemented && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30">
                            即将推出
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#9ca3af] mt-0.5">
                        {PROVIDER_DESCRIPTIONS[provider]}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* API Key Configuration */}
        {showApiKeyField && currentApiKeyConfig && (
          <div className="space-y-2 pt-2 border-t border-[#1e2a42]">
            <label className="block text-xs font-medium text-[#9ca3af]">
              {currentApiKeyConfig.label}
            </label>
            
            {!isEditingApiKey ? (
              <div className="space-y-2">
                {apiKey ? (
                  <div className="p-3 rounded-lg bg-[#121826] border border-[#1e2a42]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#22c55e] flex items-center gap-2">
                        <span>✓</span>
                        <span>已配置 API Key</span>
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setTempApiKey(apiKey || '');
                            setIsEditingApiKey(true);
                          }}
                          className="text-xs px-2 py-1 rounded bg-[#1e2a42] text-[#9ca3af] hover:text-white hover:bg-[#2d3748] transition-colors"
                        >
                          修改
                        </button>
                        <button
                          onClick={handleClearApiKey}
                          className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          清除
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingApiKey(true)}
                    className="w-full p-3 rounded-lg border border-dashed border-[#4b5563] text-[#9ca3af] hover:border-[#7c3aed] hover:text-white transition-colors text-sm"
                  >
                    + 添加 API Key
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder={currentApiKeyConfig.placeholder}
                  className="w-full px-3 py-2 rounded-lg bg-[#121826] border border-[#1e2a42] text-white text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#7c3aed]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveApiKey}
                    disabled={!tempApiKey.trim()}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingApiKey(false);
                      setTempApiKey('');
                    }}
                    className="px-3 py-2 rounded-lg bg-[#1e2a42] text-[#9ca3af] text-sm hover:text-white transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
            
            {/* Warning message */}
            <p className="text-[10px] text-[#f59e0b] mt-2">
              ⚠️ API Key 仅存储在本地浏览器中，不会上传至任何服务器
            </p>
          </div>
        )}

        {/* Current Provider Status */}
        <div className="p-3 rounded-lg bg-[#1a1a2e] border border-[#1e2a42]">
          <div className="flex items-center gap-2">
            <span className="text-sm">📊</span>
            <span className="text-xs text-[#9ca3af]">当前使用:</span>
            <span className="text-xs font-medium text-white">
              {PROVIDER_ICONS[providerType]} {PROVIDER_DISPLAY_NAMES[providerType]}
            </span>
            {currentProvider !== providerType && (
              <span className="text-xs text-[#9ca3af]">
                (来自hook: {currentProvider})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[#1e2a42] flex justify-between">
        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg text-xs text-[#9ca3af] hover:text-white hover:bg-[#1e2a42] transition-colors"
        >
          重置默认
        </button>
        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-lg bg-[#7c3aed] text-white text-xs font-medium hover:bg-[#6d28d9] transition-colors"
        >
          完成
        </button>
      </div>
    </div>
  );
}

export default AISettingsPanel;
