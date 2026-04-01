/**
 * CodexCardExport Tests - Round 95
 * Tests for poster element presence and data accuracy
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CodexCardExport } from '../components/Export/CodexCardExport';
import { PlacedModule, GeneratedAttributes } from '../types';
import { FactionConfig } from '../types/factions';

// Mock the exportService
vi.mock('../services/exportService', () => ({
  generateCodexCardSVG: vi.fn(() => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
      <text x="400" y="100">Test Machine Name</text>
      <text x="400" y="950">CODEX ID: ABC12345</text>
      <g class="faction-seal"><text>✦</text><text>星辉派系</text></g>
      <g class="machine-visualization"><rect/></g>
      <g class="attribute-panel">
        <text>Stability: 75%</text>
        <text>Power: 65</text>
        <text>Energy: 45</text>
        <text>Failure: 25%</text>
      </g>
      <rect stroke-width="3" class="border"/>
    </svg>
  `),
}));

const mockModule: PlacedModule = {
  id: 'mod-1',
  instanceId: 'inst-1',
  type: 'core-furnace',
  x: 100,
  y: 100,
  rotation: 0,
  scale: 1,
  flipped: false,
  ports: [],
};

const mockAttributes: GeneratedAttributes = {
  name: 'Test Machine Name',
  rarity: 'epic',
  stats: {
    stability: 75,
    powerOutput: 65,
    energyCost: 45,
    failureRate: 25,
  },
  tags: ['arcane', 'amplifying'],
  description: 'A test machine for unit testing.',
  codexId: 'ABC12345',
};

const mockFaction: FactionConfig = {
  id: 'stellar',
  name: 'Stellar',
  nameCn: '星辉派系',
  color: '#22d3ee',
  secondaryColor: '#0891b2',
  icon: '✦',
  description: 'Celestial energy manipulation',
  bonusType: 'power',
  bonusValue: 15,
  glowColor: 'rgba(34, 211, 238, 0.3)',
  reputationRequired: 100,
};

describe('CodexCardExport', () => {
  // TM-EXPORT-002: Poster Element Presence (SVG Parsing)
  describe('Poster Element Presence', () => {
    it('should render codex card export container', () => {
      render(
        <CodexCardExport
          modules={[mockModule]}
          connections={[]}
          attributes={mockAttributes}
          faction={mockFaction}
        />
      );
      expect(screen.getByTestId('codex-card-export')).toBeInTheDocument();
    });

    it('should render codex card visualization', () => {
      render(
        <CodexCardExport
          modules={[mockModule]}
          connections={[]}
          attributes={mockAttributes}
          faction={mockFaction}
        />
      );
      expect(screen.getByTestId('codex-card-visualization')).toBeInTheDocument();
    });

    it('should contain machine title in visualization', () => {
      render(
        <CodexCardExport
          modules={[mockModule]}
          connections={[]}
          attributes={mockAttributes}
          faction={mockFaction}
        />
      );
      const viz = screen.getByTestId('codex-card-visualization');
      expect(viz.innerHTML).toContain(mockAttributes.name);
    });

    it('should contain machine ID in visualization', () => {
      render(
        <CodexCardExport
          modules={[mockModule]}
          connections={[]}
          attributes={mockAttributes}
          faction={mockFaction}
        />
      );
      const viz = screen.getByTestId('codex-card-visualization');
      expect(viz.innerHTML).toContain('CODEX ID:');
      expect(viz.innerHTML).toContain(mockAttributes.codexId);
    });

    it('should contain machine visualization elements', () => {
      render(
        <CodexCardExport
          modules={[mockModule]}
          connections={[]}
          attributes={mockAttributes}
          faction={mockFaction}
        />
      );
      const viz = screen.getByTestId('codex-card-visualization');
      expect(viz.innerHTML).toContain('machine-visualization');
    });

    it('should contain attribute panel with stats', () => {
      render(
        <CodexCardExport
          modules={[mockModule]}
          connections={[]}
          attributes={mockAttributes}
          faction={mockFaction}
        />
      );
      const viz = screen.getByTestId('codex-card-visualization');
      expect(viz.innerHTML).toContain('Stability:');
      expect(viz.innerHTML).toContain('Power:');
      expect(viz.innerHTML).toContain('Energy:');
      expect(viz.innerHTML).toContain('Failure:');
    });

    it('should contain decorative border', () => {
      render(
        <CodexCardExport
          modules={[mockModule]}
          connections={[]}
          attributes={mockAttributes}
          faction={mockFaction}
        />
      );
      const viz = screen.getByTestId('codex-card-visualization');
      expect(viz.innerHTML).toContain('border');
    });

    it('should contain faction seal elements', () => {
      render(
        <CodexCardExport
          modules={[mockModule]}
          connections={[]}
          attributes={mockAttributes}
          faction={mockFaction}
        />
      );
      const viz = screen.getByTestId('codex-card-visualization');
      expect(viz.innerHTML).toContain('faction-seal');
      expect(viz.innerHTML).toContain(mockFaction.icon);
    });
  });

  describe('Data Attributes', () => {
    it('should have machine name as data attribute', () => {
      render(
        <CodexCardExport
          modules={[mockModule]}
          connections={[]}
          attributes={mockAttributes}
          faction={mockFaction}
        />
      );
      const container = screen.getByTestId('codex-card-export');
      expect(container).toHaveAttribute('data-machine-name', mockAttributes.name);
    });

    it('should have codex ID as data attribute', () => {
      render(
        <CodexCardExport
          modules={[mockModule]}
          connections={[]}
          attributes={mockAttributes}
          faction={mockFaction}
        />
      );
      const container = screen.getByTestId('codex-card-export');
      expect(container).toHaveAttribute('data-codex-id', mockAttributes.codexId);
    });

    it('should have rarity as data attribute', () => {
      render(
        <CodexCardExport
          modules={[mockModule]}
          connections={[]}
          attributes={mockAttributes}
          faction={mockFaction}
        />
      );
      const container = screen.getByTestId('codex-card-export');
      expect(container).toHaveAttribute('data-rarity', mockAttributes.rarity);
    });
  });

  describe('ClassName Prop', () => {
    it('should apply custom className', () => {
      render(
        <CodexCardExport
          modules={[mockModule]}
          connections={[]}
          attributes={mockAttributes}
          faction={mockFaction}
          className="custom-class"
        />
      );
      const container = screen.getByTestId('codex-card-export');
      expect(container.className).toContain('custom-class');
      expect(container.className).toContain('codex-card-export');
    });
  });
});
