/**
 * ModulePanel Component Tests
 * 
 * Comprehensive test coverage for ModulePanel component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Create mock stores with proper Zustand-like interface
const mockRecipeStoreState = {
  unlockedRecipes: [],
  pendingDiscoveries: [],
  isUnlocked: vi.fn(() => true),
  getState: vi.fn(() => mockRecipeStoreState),
  unlockRecipe: vi.fn(),
  discoverRecipe: vi.fn(),
  markAsSeen: vi.fn(),
  clearPendingDiscoveries: vi.fn(),
};

const mockFactionStoreState = {
  factionReputation: {},
  isVariantUnlocked: vi.fn(() => true),
  getState: vi.fn(() => mockFactionStoreState),
  addReputation: vi.fn(),
  spendReputation: vi.fn(),
};

const mockMachineStoreState = {
  modules: [],
  connections: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  addModule: vi.fn(),
  loadMachine: vi.fn(),
  setGeneratedAttributes: vi.fn(),
  showRandomForgeToast: vi.fn(),
  saveToHistory: vi.fn(),
  getState: vi.fn(() => mockMachineStoreState),
};

// Mock the store modules
vi.mock('@/store/useRecipeStore', () => ({
  useRecipeStore: Object.assign(
    vi.fn((selector?: (state: any) => unknown) => {
      if (typeof selector === 'function') {
        return selector(mockRecipeStoreState);
      }
      return mockRecipeStoreState;
    }),
    {
      getState: () => mockRecipeStoreState,
    }
  ),
}));

vi.mock('@/store/useFactionReputationStore', () => ({
  useFactionReputationStore: Object.assign(
    vi.fn((selector?: (state: any) => unknown) => {
      if (typeof selector === 'function') {
        return selector(mockFactionStoreState);
      }
      return mockFactionStoreState;
    }),
    {
      getState: () => mockFactionStoreState,
    }
  ),
}));

vi.mock('@/store/useMachineStore', () => ({
  useMachineStore: Object.assign(
    vi.fn((selector?: (state: any) => unknown) => {
      if (typeof selector === 'function') {
        return selector(mockMachineStoreState);
      }
      return mockMachineStoreState;
    }),
    {
      getState: () => mockMachineStoreState,
    }
  ),
}));

// Mock random generator
vi.mock('@/utils/randomGenerator', () => ({
  generateRandomMachine: vi.fn(() => ({
    modules: [
      {
        instanceId: 'random-1',
        type: 'core-furnace',
        x: 100,
        y: 100,
        rotation: 0,
        scale: 1,
        flipped: false,
        ports: [],
      },
    ],
    connections: [],
  })),
}));

vi.mock('@/utils/attributeGenerator', () => ({
  generateAttributes: vi.fn(() => ({
    name: 'Test Machine',
    rarity: 'common' as const,
    stats: { stability: 50, powerOutput: 50, energyCost: 50, failureRate: 10 },
    tags: [],
    description: 'Test description',
    codexId: 'TEST-001',
  })),
}));

import { ModulePanel } from '../ModulePanel';

describe('ModulePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset isUnlocked mocks
    mockRecipeStoreState.isUnlocked = vi.fn(() => true);
    mockRecipeStoreState.getState = vi.fn(() => mockRecipeStoreState);
    mockFactionStoreState.isVariantUnlocked = vi.fn(() => true);
    mockFactionStoreState.getState = vi.fn(() => mockFactionStoreState);
    mockMachineStoreState.loadMachine = vi.fn();
    mockMachineStoreState.setGeneratedAttributes = vi.fn();
    mockMachineStoreState.saveToHistory = vi.fn();
    mockMachineStoreState.showRandomForgeToast = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  // =========================================================================
  // Render Tests
  // =========================================================================
  describe('Render', () => {
    it('should render ModulePanel with header', () => {
      render(<ModulePanel />);
      
      expect(screen.getByText('模块面板')).toBeInTheDocument();
      expect(screen.getByText('拖拽或点击添加')).toBeInTheDocument();
    });

    it('should render Random Forge button', () => {
      render(<ModulePanel />);
      
      const forgeButton = screen.getByRole('button', { name: /随机锻造/i });
      expect(forgeButton).toBeInTheDocument();
    });

    it('should render module list with base modules', () => {
      render(<ModulePanel />);
      
      expect(screen.getByText('核心熔炉')).toBeInTheDocument();
      expect(screen.getByText('能量管道')).toBeInTheDocument();
      expect(screen.getByText('齿轮组件')).toBeInTheDocument();
    });

    it('should render module count in footer', () => {
      render(<ModulePanel />);
      
      expect(screen.getByText(/共 \d+ 种模块类型/)).toBeInTheDocument();
    });

    it('should render advanced modules section', () => {
      render(<ModulePanel />);
      
      expect(screen.getByText('高级模块')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Category Tabs Tests
  // =========================================================================
  describe('Category Tabs', () => {
    it('should render base modules by default', () => {
      render(<ModulePanel />);
      
      expect(screen.getByText('核心熔炉')).toBeInTheDocument();
      expect(screen.getByText('能量管道')).toBeInTheDocument();
      expect(screen.getByText('齿轮组件')).toBeInTheDocument();
    });

    it('should render all module categories', () => {
      render(<ModulePanel />);
      
      expect(screen.getByText('核心熔炉')).toBeInTheDocument();
      expect(screen.getByText('能量管道')).toBeInTheDocument();
      expect(screen.getByText('齿轮组件')).toBeInTheDocument();
      expect(screen.getByText('符文节点')).toBeInTheDocument();
      expect(screen.getByText('护盾外壳')).toBeInTheDocument();
      expect(screen.getByText('触发开关')).toBeInTheDocument();
      expect(screen.getByText('输出阵列')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Module Display Tests
  // =========================================================================
  describe('Module Display', () => {
    it('should render module name', () => {
      render(<ModulePanel />);
      
      expect(screen.getByText('核心熔炉')).toBeInTheDocument();
    });

    it('should render module item element', () => {
      render(<ModulePanel />);
      
      // Check that module items exist
      const coreFurnaceItem = screen.getByText('核心熔炉').closest('.module-item');
      expect(coreFurnaceItem).toBeInTheDocument();
    });

    it('should render locked modules with lock icon when not unlocked', () => {
      mockRecipeStoreState.isUnlocked = vi.fn(() => false);
      mockRecipeStoreState.getState = vi.fn(() => ({
        ...mockRecipeStoreState,
        isUnlocked: mockRecipeStoreState.isUnlocked,
      }));

      render(<ModulePanel />);
      
      // Locked modules should show lock icon
      const lockIcons = document.querySelectorAll('svg');
      expect(lockIcons.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // Random Forge Tests
  // =========================================================================
  describe('Random Forge', () => {
    it('should render Random Forge button', () => {
      render(<ModulePanel />);
      
      const forgeButton = screen.getByRole('button', { name: /随机锻造/i });
      expect(forgeButton).toBeInTheDocument();
    });

    it('should call loadMachine when Random Forge is clicked', () => {
      const loadMachine = vi.fn();
      mockMachineStoreState.loadMachine = loadMachine;

      render(<ModulePanel />);
      
      const forgeButton = screen.getByRole('button', { name: /随机锻造/i });
      fireEvent.click(forgeButton);
      
      expect(loadMachine).toHaveBeenCalled();
    });

    it('should call showRandomForgeToast when Random Forge is clicked', () => {
      const showRandomForgeToast = vi.fn();
      mockMachineStoreState.showRandomForgeToast = showRandomForgeToast;

      render(<ModulePanel />);
      
      const forgeButton = screen.getByRole('button', { name: /随机锻造/i });
      fireEvent.click(forgeButton);
      
      expect(showRandomForgeToast).toHaveBeenCalledWith(expect.stringContaining('锻造成功'));
    });
  });

  // =========================================================================
  // Empty State Tests
  // =========================================================================
  describe('Empty State', () => {
    it('should render category with zero modules gracefully', () => {
      mockRecipeStoreState.isUnlocked = vi.fn(() => false);

      render(<ModulePanel />);
      
      expect(screen.getByText('模块面板')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Faction Filtering Tests
  // =========================================================================
  describe('Faction Filtering', () => {
    it('should render faction variant modules', () => {
      render(<ModulePanel />);
      
      expect(screen.getByText('虚空奥术齿轮')).toBeInTheDocument();
      expect(screen.getByText('烈焰燃烧核心')).toBeInTheDocument();
      expect(screen.getByText('雷霆闪电管道')).toBeInTheDocument();
      expect(screen.getByText('星辉谐波水晶')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Accessibility Tests
  // =========================================================================
  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ModulePanel />);
      
      const panel = screen.getByRole('region', { name: /模块面板/i });
      expect(panel).toBeInTheDocument();
    });

    it('should have accessible module list', () => {
      render(<ModulePanel />);
      
      const listbox = screen.getByRole('listbox', { name: /可用模块/i });
      expect(listbox).toBeInTheDocument();
    });

    it('should have accessible module items with aria-label', () => {
      render(<ModulePanel />);
      
      const moduleItems = screen.getAllByRole('option');
      moduleItems.forEach((item) => {
        expect(item).toHaveAttribute('aria-label');
      });
    });

    it('should have accessible Random Forge button', () => {
      render(<ModulePanel />);
      
      const forgeButton = screen.getByRole('button', { name: /随机锻造/i });
      expect(forgeButton).toHaveAttribute('aria-label');
    });
  });
});
