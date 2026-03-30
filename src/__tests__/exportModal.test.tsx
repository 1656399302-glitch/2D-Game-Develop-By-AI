import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock the stores
vi.mock('../store/useMachineStore', () => ({
  useMachineStore: vi.fn(() => ({
    modules: [
      {
        id: 'test-module-1',
        instanceId: 'test-instance-1',
        type: 'core-furnace' as const,
        x: 100,
        y: 200,
        rotation: 0,
        scale: 1,
        flipped: false,
        ports: [],
      },
      {
        id: 'test-module-2',
        instanceId: 'test-instance-2',
        type: 'gear' as const,
        x: 300,
        y: 200,
        rotation: 0,
        scale: 1,
        flipped: false,
        ports: [],
      },
    ],
    connections: [
      {
        id: 'conn-1',
        sourceModuleId: 'test-module-1',
        sourcePortId: 'port-1',
        targetModuleId: 'test-module-2',
        targetPortId: 'port-2',
        pathData: 'M150,250 Q225,200 300,250',
      },
    ],
  })),
}));

// Mock the utils
vi.mock('../utils/attributeGenerator', () => ({
  generateAttributes: vi.fn(() => ({
    name: 'Test Machine',
    rarity: 'rare' as const,
    stats: {
      stability: 75,
      powerOutput: 60,
      energyCost: 40,
      failureRate: 20,
    },
    tags: ['arcane', 'amplifying'] as const[],
    description: 'A test machine for export quality verification.',
    codexId: 'TEST-001',
  })),
}));

vi.mock('../utils/factionCalculator', () => ({
  calculateFaction: vi.fn(() => 'stellar'),
}));

vi.mock('../utils/exportUtils', () => ({
  exportToSVG: vi.fn(() => '<?xml version="1.0" encoding="UTF-8"?><svg></svg>'),
  exportToPNG: vi.fn(() => Promise.resolve(new Blob(['fake-png'], { type: 'image/png' }))),
  exportPoster: vi.fn(() => '<?xml version="1.0" encoding="UTF-8"?><svg></svg>'),
  exportEnhancedPoster: vi.fn(() => '<?xml version="1.0" encoding="UTF-8"?><svg></svg>'),
  exportFactionCard: vi.fn(() => '<?xml version="1.0" encoding="UTF-8"?><svg></svg>'),
  downloadFile: vi.fn(),
  getResolutionDimensions: vi.fn((_modules, resolution) => {
    const scaleMap: Record<string, number> = { '1x': 1, '2x': 2, '4x': 4 };
    const scale = scaleMap[resolution] || 1;
    return { width: Math.round(400 * scale), height: Math.round(300 * scale) };
  }),
}));

// Mock the FACTIONS
vi.mock('../types/factions', () => ({
  FACTIONS: {
    stellar: {
      id: 'stellar',
      name: 'Stellar',
      nameCn: '星辉派系',
      color: '#fbbf24',
      secondaryColor: '#f59e0b',
      icon: '✨',
      modules: ['stellar-harmonic-crystal'],
    },
  },
}));

// Import after mocking
import { ExportModal } from '../components/Export/ExportModal';

describe('ExportModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AC4: Filename persistence', () => {
    it('filename state persists when format changes from PNG to SVG', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox', { name: /filename/i });
      fireEvent.change(input, { target: { value: 'my-custom-machine' } });
      
      // Change to SVG format tab
      fireEvent.click(screen.getByRole('tab', { name: /svg/i }));
      
      expect(screen.getByDisplayValue('my-custom-machine')).toBeTruthy();
    });

    it('filename state persists when format changes from SVG to Poster', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox', { name: /filename/i });
      fireEvent.change(input, { target: { value: 'another-machine' } });
      
      fireEvent.click(screen.getByRole('tab', { name: /svg/i }));
      fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
      
      expect(screen.getByDisplayValue('another-machine')).toBeTruthy();
    });

    it('filename state persists after multiple format switches', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      const input = screen.getByRole('textbox', { name: /filename/i });
      fireEvent.change(input, { target: { value: 'persistent-name' } });
      
      const formats = ['png', 'svg', 'poster', 'png'];
      formats.forEach(format => {
        fireEvent.click(screen.getByRole('tab', { name: new RegExp(format, 'i') }));
      });
      
      expect(screen.getByDisplayValue('persistent-name')).toBeTruthy();
    });
  });

  describe('AC5: Dimension indicator', () => {
    it('shows ~400px dimension for 1x resolution', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /png/i }));
      // Click the first resolution button (1x)
      fireEvent.click(screen.getByRole('button', { name: /Resolution 1x/i }));
      
      // Indicator should display dimensions in range 350-450px
      const dimensionText = screen.getByTestId('dimension-indicator');
      expect(dimensionText.textContent).toMatch(/4\d{2}/);
    });

    it('shows ~800px dimension for 2x resolution', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /png/i }));
      fireEvent.click(screen.getByRole('button', { name: /Resolution 2x/i }));
      
      const dimensionText = screen.getByTestId('dimension-indicator');
      expect(dimensionText.textContent).toMatch(/[78]\d{2}/);
    });

    it('shows ~1600px dimension for 4x resolution', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /png/i }));
      fireEvent.click(screen.getByRole('button', { name: /Resolution 4x/i }));
      
      const dimensionText = screen.getByTestId('dimension-indicator');
      expect(dimensionText.textContent).toMatch(/1[56]\d{2}/);
    });

    it('updates dimension when aspect ratio changes (default: 600×800)', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
      
      const dimensionText = screen.getByTestId('dimension-indicator');
      expect(dimensionText.textContent).toMatch(/600.*800|800.*600/);
    });

    it('updates dimension when aspect ratio changes to square (600×600)', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
      fireEvent.click(screen.getByRole('button', { name: /默认.*Default/i }));
      fireEvent.click(screen.getByRole('button', { name: /方形.*Square/i }));
      
      const dimensionText = screen.getByTestId('dimension-indicator');
      expect(dimensionText.textContent).toMatch(/600.*600/);
    });

    it('updates dimension when aspect ratio changes to landscape (800×600)', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
      fireEvent.click(screen.getByRole('button', { name: /横向.*Landscape/i }));
      
      const dimensionText = screen.getByTestId('dimension-indicator');
      expect(dimensionText.textContent).toMatch(/800.*600/);
    });
  });

  describe('AC6: Quick presets', () => {
    it('Social Media preset selects PNG format', () => {
      render(<ExportModal onClose={mockOnClose} />);
      fireEvent.click(screen.getByRole('button', { name: /Social Media/i }));
      const pngTab = screen.getByRole('tab', { name: /png/i });
      expect(pngTab.getAttribute('aria-selected')).toBe('true');
    });

    it('Social Media preset selects 2x resolution', () => {
      render(<ExportModal onClose={mockOnClose} />);
      fireEvent.click(screen.getByRole('button', { name: /Social Media/i }));
      const btn = screen.getByRole('button', { name: /Resolution 2x/i });
      expect(btn.classList.contains('selected')).toBe(true);
    });

    it('Social Media preset selects square aspect ratio', () => {
      render(<ExportModal onClose={mockOnClose} />);
      fireEvent.click(screen.getByRole('button', { name: /Social Media/i }));
      // First need to switch to poster format to see aspect ratio buttons
      fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
      const btn = screen.getByRole('button', { name: /方形.*Square/i });
      expect(btn.classList.contains('selected')).toBe(true);
    });

    it('Print preset selects 4x resolution', () => {
      render(<ExportModal onClose={mockOnClose} />);
      fireEvent.click(screen.getByRole('button', { name: /Print/i }));
      const btn = screen.getByRole('button', { name: /Resolution 4x/i });
      expect(btn.classList.contains('selected')).toBe(true);
    });

    it('Icon preset enables transparent background', () => {
      render(<ExportModal onClose={mockOnClose} />);
      fireEvent.click(screen.getByRole('button', { name: /Icon/i }));
      const checkbox = screen.getByRole('checkbox', { name: /transparent/i });
      expect((checkbox as HTMLInputElement).checked).toBe(true);
    });

    it('Icon preset selects 1x resolution', () => {
      render(<ExportModal onClose={mockOnClose} />);
      fireEvent.click(screen.getByRole('button', { name: /Icon/i }));
      const btn = screen.getByRole('button', { name: /Resolution 1x/i });
      expect(btn.classList.contains('selected')).toBe(true);
    });

    it('Presentation preset selects SVG format', () => {
      render(<ExportModal onClose={mockOnClose} />);
      fireEvent.click(screen.getByRole('button', { name: /Presentation/i }));
      const svgTab = screen.getByRole('tab', { name: /svg/i });
      expect(svgTab.getAttribute('aria-selected')).toBe('true');
    });
  });
});
