/**
 * Faction Migration Test
 * 
 * Tests for the Round 80 faction migration - extended from 4 to 6 factions.
 * Verifies AC0a: 6 factions defined in src/types/factions.ts
 */

import { describe, it, expect } from 'vitest';
import { FACTIONS, FactionId } from '../types/factions';

describe('Faction Migration (AC0a)', () => {
  it('should have exactly 6 factions defined', () => {
    const factionKeys = Object.keys(FACTIONS);
    expect(factionKeys.length).toBe(6);
  });

  it('should have all 6 required factions with correct IDs', () => {
    const expectedFactions: FactionId[] = ['void', 'inferno', 'storm', 'stellar', 'arcane', 'chaos'];
    
    expectedFactions.forEach(factionId => {
      expect(FACTIONS[factionId]).toBeDefined();
      expect(FACTIONS[factionId].id).toBe(factionId);
    });
  });

  it('should have correct colors per contract specification', () => {
    expect(FACTIONS.void.color).toBe('#7B2FBE');    // 虚空深渊 #7B2FBE
    expect(FACTIONS.inferno.color).toBe('#E85D04');  // 熔星锻造 #E85D04
    expect(FACTIONS.storm.color).toBe('#48CAE4');     // 雷霆相位 #48CAE4
    expect(FACTIONS.arcane.color).toBe('#3A0CA3');   // 奥术秩序 #3A0CA3
    expect(FACTIONS.chaos.color).toBe('#9D0208');    // 混沌无序 #9D0208
  });

  it('should have correct Chinese names per contract specification', () => {
    expect(FACTIONS.void.nameCn).toBe('虚空深渊');      // Void Abyss
    expect(FACTIONS.inferno.nameCn).toBe('熔星锻造');   // Molten Star Forge
    expect(FACTIONS.storm.nameCn).toBe('雷霆相位');     // Thunder Phase
    expect(FACTIONS.arcane.nameCn).toBe('奥术秩序');   // Arcane Order
    expect(FACTIONS.chaos.nameCn).toBe('混沌无序');     // Chaos Disorder
  });

  it('should have correct English names', () => {
    expect(FACTIONS.void.name).toBe('Void Abyss');
    expect(FACTIONS.inferno.name).toBe('Molten Star Forge');
    expect(FACTIONS.storm.name).toBe('Thunder Phase');
    expect(FACTIONS.stellar.name).toBe('Stellar');
    expect(FACTIONS.arcane.name).toBe('Arcane Order');
    expect(FACTIONS.chaos.name).toBe('Chaos Disorder');
  });

  it('should have module types defined for each faction', () => {
    Object.values(FACTIONS).forEach(faction => {
      expect(faction.moduleTypes).toBeDefined();
      expect(faction.moduleTypes.length).toBeGreaterThan(0);
    });
  });

  it('should have icons defined for each faction', () => {
    Object.values(FACTIONS).forEach(faction => {
      expect(faction.icon).toBeDefined();
      expect(faction.icon.length).toBeGreaterThan(0);
    });
  });

  it('should have glow colors defined for each faction', () => {
    Object.values(FACTIONS).forEach(faction => {
      expect(faction.glowColor).toBeDefined();
      expect(faction.glowColor).toContain('rgba');
    });
  });
});
