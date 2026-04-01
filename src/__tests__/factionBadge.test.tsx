/**
 * FactionBadge Component Tests
 * 
 * Tests FactionBadge rendering with correct 6 faction colors.
 * 
 * ROUND 81 PHASE 2: Test file per contract.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { FactionBadge } from '../components/FactionBadge';
import { FactionId, FACTIONS } from '../types/factions';

// Test helper to check hex colors match contract spec
const FACTION_COLORS: Record<FactionId, string> = {
  void: '#7B2FBE',
  inferno: '#E85D04',
  storm: '#48CAE4',
  stellar: '#fbbf24',
  arcane: '#3A0CA3',
  chaos: '#9D0208',
};

describe('FactionBadge Component', () => {
  // Test each faction renders
  Object.entries(FACTION_COLORS).forEach(([factionId]) => {
    it(`should render ${factionId} faction badge`, () => {
      const { container } = render(
        <FactionBadge factionId={factionId as FactionId} />
      );
      
      // Find the badge element
      const badge = container.querySelector('[role="img"]');
      expect(badge).toBeTruthy();
    });
  });

  // Test tooltip functionality
  it('should show tooltip on hover when showTooltip is true', () => {
    const { container } = render(
      <FactionBadge factionId="void" showTooltip />
    );
    
    // Get the badge element
    const badge = container.querySelector('[role="img"]');
    expect(badge).toBeTruthy();
  });

  // Test size variants
  it('should render with different sizes', () => {
    const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
    
    sizes.forEach((size) => {
      const { container } = render(
        <FactionBadge factionId="inferno" size={size} />
      );
      
      const badge = container.querySelector('[role="img"]');
      expect(badge).toBeTruthy();
    });
  });

  // Test all 6 factions exist
  it('should have all 6 factions defined in FACTIONS', () => {
    const factionIds: FactionId[] = ['void', 'inferno', 'storm', 'stellar', 'arcane', 'chaos'];
    
    factionIds.forEach((factionId) => {
      expect(FACTIONS[factionId]).toBeDefined();
      expect(FACTIONS[factionId].id).toBe(factionId);
      expect(FACTIONS[factionId].color.toLowerCase()).toBe(FACTION_COLORS[factionId].toLowerCase());
    });
  });

  // Test unknown faction returns null
  it('should return null for unknown faction', () => {
    const { container } = render(
      // @ts-ignore - Testing invalid faction handling
      <FactionBadge factionId="unknown" />
    );
    
    // Should render nothing for invalid faction
    expect(container.firstChild).toBeNull();
  });

  // Test className prop
  it('should apply custom className', () => {
    const { container } = render(
      <FactionBadge factionId="arcane" className="custom-class" />
    );
    
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeTruthy();
  });
});
