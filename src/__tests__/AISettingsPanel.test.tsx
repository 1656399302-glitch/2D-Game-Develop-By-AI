/**
 * AISettingsPanel Tests
 * 
 * Unit tests for the AI Settings Panel component.
 * Tests component existence and basic functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Mock the settings store - defined outside to ensure it's properly hoisted
vi.mock('../store/useSettingsStore', () => ({
  useSettingsStore: vi.fn(() => ({
    aiProvider: { providerType: 'local' },
    setProviderType: vi.fn(),
    updateAIProviderConfig: vi.fn(),
    resetAIProvider: vi.fn(),
    getProviderType: vi.fn(() => 'local'),
  })),
  PROVIDER_DISPLAY_NAMES: {
    local: '本地生成器',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    gemini: 'Google Gemini',
  },
  PROVIDER_DESCRIPTIONS: {
    local: '使用本地规则生成器，无需网络连接',
    openai: '使用 OpenAI GPT 模型生成（需要 API Key）',
    anthropic: '使用 Anthropic Claude 模型生成（需要 API Key）',
    gemini: '使用 Google Gemini 模型生成（需要 API Key）',
  },
  PROVIDER_ICONS: {
    local: '🏠',
    openai: '🤖',
    anthropic: '🧠',
    gemini: '✨',
  },
}));

// Import component after mocks
import { AISettingsPanel } from '../components/AI/AISettingsPanel';

describe('AISettingsPanel', () => {
  const createMockProps = () => ({
    currentProvider: 'local',
    onClose: vi.fn(),
    onProviderChange: vi.fn(),
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render settings panel header', () => {
      const props = createMockProps();
      render(<AISettingsPanel {...props} />);
      expect(screen.getByText('AI 设置')).toBeInTheDocument();
    });

    it('should render close button', () => {
      const props = createMockProps();
      render(<AISettingsPanel {...props} />);
      expect(screen.getByRole('button', { name: '关闭设置' })).toBeInTheDocument();
    });
  });

  describe('Provider Selection (AC3)', () => {
    it('should render radio buttons for all provider types', () => {
      const props = createMockProps();
      render(<AISettingsPanel {...props} />);
      
      // Check for all provider display names
      expect(screen.getByText('本地生成器')).toBeInTheDocument();
      expect(screen.getByText('OpenAI')).toBeInTheDocument();
      expect(screen.getByText('Anthropic')).toBeInTheDocument();
      // Use getAllByText since "Google Gemini" appears in both label and description
      const geminiElements = screen.getAllByText('Google Gemini');
      expect(geminiElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should have all provider descriptions visible', () => {
      const props = createMockProps();
      render(<AISettingsPanel {...props} />);
      
      expect(screen.getByText(/本地规则生成器/)).toBeInTheDocument();
      expect(screen.getByText(/OpenAI GPT/)).toBeInTheDocument();
      expect(screen.getByText(/Anthropic Claude/)).toBeInTheDocument();
      // Use getAllByText since "Google Gemini" appears in both label and description
      const geminiElements = screen.getAllByText(/Google Gemini/);
      expect(geminiElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should select local provider by default', () => {
      const props = createMockProps();
      render(<AISettingsPanel {...props} />);
      
      // Local should be selected by default
      const localButton = screen.getByText('本地生成器').closest('button');
      expect(localButton).toBeInTheDocument();
    });

    it('should display current provider selection', () => {
      const props = createMockProps();
      render(<AISettingsPanel {...props} currentProvider="openai" />);
      
      expect(screen.getByText(/当前使用:/)).toBeInTheDocument();
      expect(screen.getByText('OpenAI')).toBeInTheDocument();
    });
  });

  describe('API Key Input (AC3)', () => {
    it('should not show API key fields for local provider', () => {
      const props = createMockProps();
      render(<AISettingsPanel {...props} currentProvider="local" />);
      
      // Should NOT have "添加 API Key" button
      expect(screen.queryByText('添加 API Key')).not.toBeInTheDocument();
    });

    it('should not crash when rendering (AC8)', () => {
      const props = createMockProps();
      expect(() => render(<AISettingsPanel {...props} currentProvider="openai" />)).not.toThrow();
    });
  });

  describe('Settings Actions', () => {
    it('should have Reset button', () => {
      const props = createMockProps();
      render(<AISettingsPanel {...props} />);
      
      expect(screen.getByText('重置默认')).toBeInTheDocument();
    });

    it('should have Done button', () => {
      const props = createMockProps();
      render(<AISettingsPanel {...props} />);
      
      expect(screen.getByText('完成')).toBeInTheDocument();
    });
  });

  describe('Visual Indicators', () => {
    it('should show icons for each provider', () => {
      const props = createMockProps();
      render(<AISettingsPanel {...props} />);
      
      expect(screen.getByText('🏠')).toBeInTheDocument(); // Local
      expect(screen.getByText('🤖')).toBeInTheDocument(); // OpenAI
      expect(screen.getByText('🧠')).toBeInTheDocument(); // Anthropic
      expect(screen.getByText('✨')).toBeInTheDocument(); // Gemini
    });

    it('should show "Coming Soon" badge for unimplemented providers', () => {
      const props = createMockProps();
      render(<AISettingsPanel {...props} />);
      
      // All providers except local should show "即将推出" badge
      expect(screen.getAllByText('即将推出').length).toBe(3);
    });

    it('should display status section', () => {
      const props = createMockProps();
      render(<AISettingsPanel {...props} />);
      
      expect(screen.getByText('📊')).toBeInTheDocument();
    });
  });
});
