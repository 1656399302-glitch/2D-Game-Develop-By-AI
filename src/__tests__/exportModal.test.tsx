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

// Mock the utils - Round 115: Updated to return specific error messages
vi.mock('../utils/exportUtils', () => ({
  exportToSVG: vi.fn(() => '<?xml version="1.0" encoding="UTF-8"?><svg></svg>'),
  exportToPNG: vi.fn(() => Promise.resolve(new Blob(['fake-png'], { type: 'image/png' }))),
  exportPoster: vi.fn(() => '<?xml version="1.0" encoding="UTF-8"?><svg></svg>'),
  exportEnhancedPoster: vi.fn(() => '<?xml version="1.0" encoding="UTF-8"?><svg></svg>'),
  exportSocialPoster: vi.fn(() => '<?xml version="1.0" encoding="UTF-8"?><svg></svg>'),
  exportFactionCard: vi.fn(() => '<?xml version="1.0" encoding="UTF-8"?><svg></svg>'),
  downloadFile: vi.fn(),
  getResolutionDimensions: vi.fn((_modules, resolution) => {
    const scaleMap: Record<string, number> = { '1x': 1, '2x': 2, '4x': 4 };
    const scale = scaleMap[resolution] || 1;
    return { width: Math.round(400 * scale), height: Math.round(300 * scale) };
  }),
  // Round 115: Mock function that returns specific error messages
  validateDimensions: vi.fn((width: number, height: number) => {
    if (!width || isNaN(width)) {
      return { isValid: false, errorMessage: 'Width is required' };
    }
    if (!height || isNaN(height)) {
      return { isValid: false, errorMessage: 'Height is required' };
    }
    if (width < 400) {
      return { isValid: false, errorMessage: 'Width must be at least 400px' };
    }
    if (width > 2000) {
      return { isValid: false, errorMessage: 'Width must be at most 2000px' };
    }
    if (height < 400) {
      return { isValid: false, errorMessage: 'Height must be at least 400px' };
    }
    if (height > 2000) {
      return { isValid: false, errorMessage: 'Height must be at most 2000px' };
    }
    return { isValid: true };
  }),
  getDefaultDimensionsForFormat: vi.fn((format: string) => {
    const presets: Record<string, { width: number; height: number }> = {
      poster: { width: 800, height: 1000 },
      twitter: { width: 1200, height: 675 },
      instagram: { width: 1080, height: 1080 },
      discord: { width: 600, height: 400 },
    };
    return presets[format] || { width: 800, height: 1000 };
  }),
}));

// Mock the attribute generator
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

// Mock the faction calculator
vi.mock('../utils/factionCalculator', () => ({
  calculateFaction: vi.fn(() => 'stellar'),
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

    it('shows custom dimensions for poster format (800×1000)', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
      
      // Custom dimensions (800x1000) are shown for poster format
      const dimensionText = screen.getByTestId('dimension-indicator');
      expect(dimensionText.textContent).toMatch(/800.*1000/);
    });

    it('updates dimension when aspect ratio changes to square (600×600)', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
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

  describe('AC1: 8 Format Options', () => {
    it('Default format is SVG when modal opens', () => {
      render(<ExportModal onClose={mockOnClose} />);
      // SVG is selected by default when modal opens
      const svgTab = screen.getByRole('tab', { name: /svg/i });
      expect(svgTab.getAttribute('aria-selected')).toBe('true');
    });

    it('shows all 8 format options', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      // Check for all 8 format buttons
      expect(screen.getByRole('tab', { name: /svg/i })).toBeTruthy();
      expect(screen.getByRole('tab', { name: /png/i })).toBeTruthy();
      expect(screen.getByRole('tab', { name: /poster/i })).toBeTruthy();
      expect(screen.getByRole('tab', { name: /enhanced/i })).toBeTruthy();
      expect(screen.getByRole('tab', { name: /faction card/i })).toBeTruthy();
      expect(screen.getByRole('tab', { name: /twitter/i })).toBeTruthy();
      expect(screen.getByRole('tab', { name: /instagram/i })).toBeTruthy();
      expect(screen.getByRole('tab', { name: /discord/i })).toBeTruthy();
    });
  });

  describe('Social Media Preset Dimensions', () => {
    it('shows 1200×675 for Twitter/X preset', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /twitter/i }));
      
      const dimensionText = screen.getByTestId('dimension-indicator');
      expect(dimensionText.textContent).toMatch(/1200.*675/);
    });

    it('shows 1080×1080 for Instagram preset', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /instagram/i }));
      
      const dimensionText = screen.getByTestId('dimension-indicator');
      expect(dimensionText.textContent).toMatch(/1080.*1080/);
    });

    it('shows 600×400 for Discord preset', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /discord/i }));
      
      const dimensionText = screen.getByTestId('dimension-indicator');
      expect(dimensionText.textContent).toMatch(/600.*400/);
    });
  });

  describe('AC4: Username/Watermark Input', () => {
    it('shows username input for enhanced poster format', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /enhanced/i }));
      
      const usernameInput = screen.getByTestId('username-input');
      expect(usernameInput).toBeTruthy();
    });

    it('username input has correct placeholder', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /enhanced/i }));
      
      const usernameInput = screen.getByTestId('username-input');
      expect(usernameInput.getAttribute('placeholder')).toBe('Author (optional)');
    });

    it('shows watermark toggle for enhanced poster format', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /enhanced/i }));
      
      const toggle = screen.getByTestId('watermark-toggle');
      expect(toggle).toBeTruthy();
    });

    it('shows username input for Twitter preset', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /twitter/i }));
      
      const usernameInput = screen.getByTestId('username-input');
      expect(usernameInput).toBeTruthy();
    });
  });

  describe('Round 115: Custom Dimensions', () => {
    it('shows custom dimension inputs for poster format', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
      
      // Check for width and height inputs
      const widthInput = screen.getByRole('spinbutton', { name: /Custom width/i });
      const heightInput = screen.getByRole('spinbutton', { name: /Custom height/i });
      
      expect(widthInput).toBeTruthy();
      expect(heightInput).toBeTruthy();
    });

    it('shows error for width below 400px', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
      
      const widthInput = screen.getByRole('spinbutton', { name: /Custom width/i });
      fireEvent.change(widthInput, { target: { value: '350' } });
      
      expect(screen.getByText(/Width must be at least 400px/i)).toBeTruthy();
    });

    it('shows error for width above 2000px', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
      
      const widthInput = screen.getByRole('spinbutton', { name: /Custom width/i });
      fireEvent.change(widthInput, { target: { value: '2001' } });
      
      expect(screen.getByText(/Width must be at most 2000px/i)).toBeTruthy();
    });

    it('shows error for height below 400px', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
      
      const heightInput = screen.getByRole('spinbutton', { name: /Custom height/i });
      fireEvent.change(heightInput, { target: { value: '350' } });
      
      expect(screen.getByText(/Height must be at least 400px/i)).toBeTruthy();
    });

    it('shows error for height above 2000px', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
      
      const heightInput = screen.getByRole('spinbutton', { name: /Custom height/i });
      fireEvent.change(heightInput, { target: { value: '2001' } });
      
      expect(screen.getByText(/Height must be at most 2000px/i)).toBeTruthy();
    });

    it('accepts valid dimensions 1000x1200', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
      
      const widthInput = screen.getByRole('spinbutton', { name: /Custom width/i });
      const heightInput = screen.getByRole('spinbutton', { name: /Custom height/i });
      
      fireEvent.change(widthInput, { target: { value: '1000' } });
      fireEvent.change(heightInput, { target: { value: '1200' } });
      
      // No error should appear
      expect(screen.queryByText(/must be at least/i)).toBeNull();
      expect(screen.queryByText(/must be at most/i)).toBeNull();
    });

    it('updates preview when custom dimensions change', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
      
      const widthInput = screen.getByRole('spinbutton', { name: /Custom width/i });
      fireEvent.change(widthInput, { target: { value: '1000' } });
      
      // The dimension indicator should update
      const dimensionText = screen.getByTestId('dimension-indicator');
      expect(dimensionText.textContent).toMatch(/1000/);
    });

    it('resets dimensions when switching to Twitter format', () => {
      render(<ExportModal onClose={mockOnClose} />);
      
      // First select poster format
      fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
      
      // Change custom dimensions
      const widthInput = screen.getByRole('spinbutton', { name: /Custom width/i });
      fireEvent.change(widthInput, { target: { value: '1500' } });
      
      // Then switch to Twitter
      fireEvent.click(screen.getByRole('tab', { name: /twitter/i }));
      
      // Dimension indicator should show Twitter dimensions (1200×675)
      const dimensionText = screen.getByTestId('dimension-indicator');
      expect(dimensionText.textContent).toMatch(/1200.*675/);
    });
  });
});
