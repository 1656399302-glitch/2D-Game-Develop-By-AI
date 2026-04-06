/**
 * AI Settings Panel Component
 * 
 * Provides UI for configuring AI provider settings.
 * Allows users to select between local generation and external AI providers.
 * Includes API key input with visibility toggle, model selection, and connection testing.
 */

import { useState, useCallback, useEffect } from 'react';
import { ProviderType, isProviderImplemented } from '../../services/ai/AIServiceFactory';
import { OpenAIProvider } from '../../services/ai/OpenAIProvider';
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
 * OpenAI model options
 */
const OPENAI_MODELS = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];

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
  const model: string | undefined = useSettingsStore(
    (state: { aiProvider: AIProviderSettings }) => state.aiProvider.model
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
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Connection test state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  
  // API key validation error
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  // Sync temp API key when switching to editing mode
  useEffect(() => {
    if (isEditingApiKey && apiKey) {
      setTempApiKey(apiKey);
    }
  }, [isEditingApiKey, apiKey]);

  // Clear test result when provider changes
  useEffect(() => {
    setTestResult(null);
  }, [providerType, apiKey]);

  // Handle API key validation
  const validateApiKey = useCallback((key: string): boolean => {
    if (!key || key.trim() === '') {
      setApiKeyError(null);
      return true;
    }
    
    const validation = OpenAIProvider.validateAPIKey(key);
    if (!validation.isValid && validation.error) {
      setApiKeyError(validation.error);
      return false;
    }
    
    setApiKeyError(null);
    return true;
  }, []);

  // Handle provider selection
  const handleProviderSelect = useCallback(
    (provider: ProviderType) => {
      setProviderType(provider);
      onProviderChange(provider);
      setTestResult(null);
      setApiKeyError(null);

      // Clear API key when switching to local
      if (provider === 'local') {
        updateAIProviderConfig({ apiKey: undefined, model: undefined });
        setTempApiKey('');
        setIsEditingApiKey(false);
      }
    },
    [setProviderType, onProviderChange, updateAIProviderConfig]
  );

  // Handle model selection
  const handleModelChange = useCallback(
    (newModel: string) => {
      updateAIProviderConfig({ model: newModel });
    },
    [updateAIProviderConfig]
  );

  // Handle API key save
  const handleSaveApiKey = useCallback(() => {
    if (!validateApiKey(tempApiKey)) {
      return;
    }

    if (tempApiKey.trim()) {
      updateAIProviderConfig({ apiKey: tempApiKey.trim() });
    } else {
      updateAIProviderConfig({ apiKey: undefined });
    }
    setIsEditingApiKey(false);
    setTestResult(null);
  }, [tempApiKey, validateApiKey, updateAIProviderConfig]);

  // Handle API key clear
  const handleClearApiKey = useCallback(() => {
    updateAIProviderConfig({ apiKey: undefined });
    setTempApiKey('');
    setIsEditingApiKey(false);
    setApiKeyError(null);
    setTestResult(null);
  }, [updateAIProviderConfig]);

  // Handle connection test
  const handleTestConnection = useCallback(async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Create temporary provider with current config
      const testProvider = new OpenAIProvider({
        apiKey: apiKey || tempApiKey,
        model: model || 'gpt-3.5-turbo',
      });

      const result = await testProvider.testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed',
      });
    } finally {
      setIsTesting(false);
    }
  }, [apiKey, tempApiKey, model]);

  // Handle reset to defaults
  const handleReset = useCallback(() => {
    resetAIProvider();
    setTempApiKey('');
    setIsEditingApiKey(false);
    setShowApiKey(false);
    setApiKeyError(null);
    setTestResult(null);
    onProviderChange('local');
  }, [resetAIProvider, onProviderChange]);

  // Get API key config for current provider
  const currentApiKeyConfig = API_KEY_CONFIG[providerType];
  const showApiKeyField = requiresApiKey(providerType);
  const providerImplemented = isProviderImplemented(providerType);

  return (
    <div 
      className="absolute inset-0 z-10 bg-[#0a0e17]/95 backdrop-blur-sm flex flex-col"
      data-testid="ai-settings-panel"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1e2a42] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span>⚙️</span>
          <span>AI 设置</span>
        </h3>
        <button
          onClick={onClose}
          data-testid="close-settings-button"
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
              const providerIsImplemented = isProviderImplemented(provider);
              
              return (
                <button
                  key={provider}
                  onClick={() => handleProviderSelect(provider)}
                  disabled={!providerIsImplemented}
                  data-testid={`provider-${provider}`}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'bg-[#7c3aed]/20 border-[#7c3aed]'
                      : 'bg-[#121826] border-[#1e2a42] hover:border-[#7c3aed]/50'
                  } ${!providerIsImplemented ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        {!providerIsImplemented && (
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

        {/* OpenAI-specific Settings */}
        {showApiKeyField && providerType === 'openai' && (
          <div className="space-y-3 pt-2 border-t border-[#1e2a42]">
            {/* Model Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#9ca3af]">
                模型选择
              </label>
              <select
                data-testid="model-select"
                value={model || 'gpt-3.5-turbo'}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#121826] border border-[#1e2a42] text-white text-sm focus:outline-none focus:border-[#7c3aed] cursor-pointer"
              >
                {OPENAI_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#6b7280]">
                GPT-4 更强大但成本更高；GPT-3.5 更快更经济
              </p>
            </div>

            {/* API Key Configuration */}
            {currentApiKeyConfig && (
              <div className="space-y-2">
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
                    <div className="relative">
                      <input
                        data-testid="api-key-input"
                        type={showApiKey ? 'text' : 'password'}
                        value={tempApiKey}
                        onChange={(e) => {
                          setTempApiKey(e.target.value);
                          validateApiKey(e.target.value);
                        }}
                        placeholder={currentApiKeyConfig.placeholder}
                        className="w-full px-3 py-2 pr-10 rounded-lg bg-[#121826] border border-[#1e2a42] text-white text-sm placeholder-[#6b7280] focus:outline-none focus:border-[#7c3aed]"
                      />
                      <button
                        data-testid="api-key-toggle-visibility"
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#9ca3af] hover:text-white transition-colors"
                        aria-label={showApiKey ? '隐藏密钥' : '显示密钥'}
                      >
                        {showApiKey ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    
                    {/* API Key Error Message */}
                    {apiKeyError && (
                      <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                        {apiKeyError}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveApiKey}
                        disabled={!!apiKeyError}
                        className="flex-1 px-3 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingApiKey(false);
                          setTempApiKey('');
                          setApiKeyError(null);
                        }}
                        className="px-3 py-2 rounded-lg bg-[#1e2a42] text-[#9ca3af] text-sm hover:text-white transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Connection Test */}
                {apiKey && !apiKeyError && (
                  <div className="space-y-2 pt-2">
                    <button
                      data-testid="connection-test-button"
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        isTesting
                          ? 'bg-[#7c3aed]/50 text-white/50 cursor-not-allowed'
                          : 'bg-[#7c3aed]/20 border border-[#7c3aed]/40 text-[#a855f7] hover:bg-[#7c3aed]/30'
                      }`}
                    >
                      {isTesting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span data-testid="connection-testing">测试中...</span>
                        </>
                      ) : (
                        <>
                          <span>🔗</span>
                          <span>测试连接</span>
                        </>
                      )}
                    </button>

                    {/* Test Result */}
                    {testResult && (
                      <div
                        data-testid={testResult.success ? 'connection-success' : 'connection-error'}
                        className={`px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${
                          testResult.success
                            ? 'bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e]'
                            : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}
                      >
                        {testResult.success ? (
                          <>
                            <span>✓</span>
                            <span>连接成功</span>
                          </>
                        ) : (
                          <>
                            <span>✗</span>
                            <span>{testResult.error || '连接失败'}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Warning message */}
                <p className="text-[10px] text-[#f59e0b] mt-2">
                  ⚠️ API Key 仅存储在本地浏览器中，不会上传至任何服务器
                </p>
              </div>
            )}
          </div>
        )}

        {/* Provider status for unimplemented providers */}
        {showApiKeyField && !providerImplemented && (
          <div className="p-3 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30">
            <p className="text-xs text-[#f59e0b]">
              该提供商尚未实现。请选择已实现的选项。
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
            {providerType === 'openai' && model && (
              <span className="text-xs text-[#9ca3af]">
                ({model})
              </span>
            )}
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
