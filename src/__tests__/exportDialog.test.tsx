/**
 * ExportDialog Tests - Round 95
 * Tests for export dialog UI and interactions
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExportDialog } from '../components/Export/ExportDialog';
import { useMachineStore } from '../store/useMachineStore';

// Mock dependencies
vi.mock('../store/useMachineStore', () => ({
  useMachineStore: vi.fn(),
}));

vi.mock('../utils/attributeGenerator', () => ({
  generateAttributes: vi.fn(() => ({
    name: 'Test Machine',
    rarity: 'rare',
    stats: { stability: 75, powerOutput: 65, energyCost: 45, failureRate: 25 },
    tags: ['arcane'],
    description: 'Test description',
    codexId: 'TEST1234',
  })),
}));

vi.mock('../utils/factionCalculator', () => ({
  calculateFaction: vi.fn(() => 'stellar'),
}));

vi.mock('../services/exportService', () => ({
  exportAsCodexCard: vi.fn(() => Promise.resolve('blob:test')),
  downloadCodexCard: vi.fn(),
  generateCodexCardSVG: vi.fn(() => '<svg>test</svg>'),
}));

const mockModules = [
  {
    id: 'mod-1',
    instanceId: 'inst-1',
    type: 'core-furnace' as const,
    x: 100,
    y: 100,
    rotation: 0,
    scale: 1,
    flipped: false,
    ports: [],
  },
];

const mockConnections = [];

describe('ExportDialog', () => {
  // TM-EXPORT-001: Dialog Open and Format Selection
  describe('Dialog Open and Format Selection', () => {
    beforeEach(() => {
      (useMachineStore as any).mockImplementation((selector: any) => {
        const state = {
          modules: mockModules,
          connections: mockConnections,
        };
        return selector(state);
      });
    });

    it('should render dialog when mounted', () => {
      render(<ExportDialog onClose={vi.fn()} />);
      expect(screen.getByTestId('export-dialog')).toBeInTheDocument();
    });

    it('should display format selector with PNG and SVG options', () => {
      render(<ExportDialog onClose={vi.fn()} />);
      expect(screen.getByTestId('format-svg')).toBeInTheDocument();
      expect(screen.getByTestId('format-png')).toBeInTheDocument();
    });

    it('should have SVG selected by default', () => {
      render(<ExportDialog onClose={vi.fn()} />);
      expect(screen.getByTestId('format-svg')).toHaveAttribute('aria-checked', 'true');
    });

    it('should change selection when PNG is clicked', () => {
      render(<ExportDialog onClose={vi.fn()} />);
      fireEvent.click(screen.getByTestId('format-png'));
      expect(screen.getByTestId('format-png')).toHaveAttribute('aria-checked', 'true');
    });

    it('should display quality presets when PNG is selected', async () => {
      render(<ExportDialog onClose={vi.fn()} />);
      fireEvent.click(screen.getByTestId('format-png'));
      
      await waitFor(() => {
        expect(screen.getByTestId('quality-standard')).toBeInTheDocument();
        expect(screen.getByTestId('quality-high')).toBeInTheDocument();
      });
    });

    it('should close dialog when cancel is clicked', () => {
      const onClose = vi.fn();
      render(<ExportDialog onClose={onClose} />);
      fireEvent.click(screen.getByTestId('cancel-button'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should close dialog when close button is clicked', () => {
      const onClose = vi.fn();
      render(<ExportDialog onClose={onClose} />);
      fireEvent.click(screen.getByTestId('close-dialog-button'));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Quality Preset Selection', () => {
    beforeEach(() => {
      (useMachineStore as any).mockImplementation((selector: any) => {
        const state = {
          modules: mockModules,
          connections: mockConnections,
        };
        return selector(state);
      });
    });

    it('should have standard quality selected by default when PNG is selected', () => {
      render(<ExportDialog onClose={vi.fn()} />);
      fireEvent.click(screen.getByTestId('format-png'));
      expect(screen.getByTestId('quality-standard')).toHaveAttribute('aria-checked', 'true');
    });

    it('should change quality to high when clicked', () => {
      render(<ExportDialog onClose={vi.fn()} />);
      fireEvent.click(screen.getByTestId('format-png'));
      fireEvent.click(screen.getByTestId('quality-high'));
      expect(screen.getByTestId('quality-high')).toHaveAttribute('aria-checked', 'true');
    });

    it('should not show quality presets when SVG is selected', () => {
      render(<ExportDialog onClose={vi.fn()} />);
      expect(screen.queryByTestId('quality-standard')).not.toBeInTheDocument();
      expect(screen.queryByTestId('quality-high')).not.toBeInTheDocument();
    });
  });

  describe('Export Button Behavior', () => {
    beforeEach(() => {
      (useMachineStore as any).mockImplementation((selector: any) => {
        const state = {
          modules: mockModules,
          connections: mockConnections,
        };
        return selector(state);
      });
    });

    it('should show Export CodexCard button', () => {
      render(<ExportDialog onClose={vi.fn()} />);
      expect(screen.getByTestId('export-button')).toBeInTheDocument();
    });

    it('should show message when no modules', () => {
      (useMachineStore as any).mockImplementation((selector: any) => {
        const state = { modules: [], connections: [] };
        return selector(state);
      });
      
      render(<ExportDialog onClose={vi.fn()} />);
      expect(screen.getByText('Add modules to see preview')).toBeInTheDocument();
    });

    it('should have disabled attribute when no modules', () => {
      (useMachineStore as any).mockImplementation((selector: any) => {
        const state = { modules: [], connections: [] };
        return selector(state);
      });
      
      render(<ExportDialog onClose={vi.fn()} />);
      const button = screen.getByTestId('export-button');
      expect(button).toHaveAttribute('disabled');
    });

    it('should not have disabled attribute when modules exist', () => {
      (useMachineStore as any).mockImplementation((selector: any) => {
        const state = {
          modules: mockModules,
          connections: mockConnections,
        };
        return selector(state);
      });
      
      render(<ExportDialog onClose={vi.fn()} />);
      const button = screen.getByTestId('export-button');
      expect(button).not.toHaveAttribute('disabled');
    });
  });
});
