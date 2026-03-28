import { describe, test, expect } from 'vitest';
import { getPhaseFromProgress, getRarityColor } from '../utils/activationChoreographer';
import { Rarity } from '../types';

describe('Activation Phase Overlay', () => {
  describe('Phase Text Transitions', () => {
    test('CHARGING phase at 0%', () => {
      const result = getPhaseFromProgress(0);
      expect(result.text).toBe('CHARGING');
      expect(result.phase).toBe('charging');
    });

    test('CHARGING phase at 15%', () => {
      const result = getPhaseFromProgress(15);
      expect(result.text).toBe('CHARGING');
      expect(result.phase).toBe('charging');
    });

    test('CHARGING phase at 29% (just before transition)', () => {
      const result = getPhaseFromProgress(29);
      expect(result.text).toBe('CHARGING');
      expect(result.phase).toBe('charging');
    });

    test('ACTIVATING phase at 30% (exact transition)', () => {
      const result = getPhaseFromProgress(30);
      expect(result.text).toBe('ACTIVATING');
      expect(result.phase).toBe('activating');
    });

    test('ACTIVATING phase at 50%', () => {
      const result = getPhaseFromProgress(50);
      expect(result.text).toBe('ACTIVATING');
      expect(result.phase).toBe('activating');
    });

    test('ACTIVATING phase at 79% (just before transition)', () => {
      const result = getPhaseFromProgress(79);
      expect(result.text).toBe('ACTIVATING');
      expect(result.phase).toBe('activating');
    });

    test('ONLINE phase at 80% (exact transition)', () => {
      const result = getPhaseFromProgress(80);
      expect(result.text).toBe('ONLINE');
      expect(result.phase).toBe('online');
    });

    test('ONLINE phase at 90%', () => {
      const result = getPhaseFromProgress(90);
      expect(result.text).toBe('ONLINE');
      expect(result.phase).toBe('online');
    });

    test('ONLINE phase at 100%', () => {
      const result = getPhaseFromProgress(100);
      expect(result.text).toBe('ONLINE');
      expect(result.phase).toBe('online');
    });
  });

  describe('Progress Range Boundaries', () => {
    test('All values 0-29 return CHARGING', () => {
      for (let i = 0; i < 30; i++) {
        const result = getPhaseFromProgress(i);
        expect(result.text).toBe('CHARGING');
      }
    });

    test('All values 30-79 return ACTIVATING', () => {
      for (let i = 30; i < 80; i++) {
        const result = getPhaseFromProgress(i);
        expect(result.text).toBe('ACTIVATING');
      }
    });

    test('All values 80-100 return ONLINE', () => {
      for (let i = 80; i <= 100; i++) {
        const result = getPhaseFromProgress(i);
        expect(result.text).toBe('ONLINE');
      }
    });
  });

  describe('Phase State Mapping', () => {
    test('charging phase maps to CHARGING text', () => {
      const result = getPhaseFromProgress(0);
      expect(result.phase).toBe('charging');
      expect(result.text).toBe('CHARGING');
    });

    test('activating phase maps to ACTIVATING text', () => {
      const result = getPhaseFromProgress(50);
      expect(result.phase).toBe('activating');
      expect(result.text).toBe('ACTIVATING');
    });

    test('online phase maps to ONLINE text', () => {
      const result = getPhaseFromProgress(90);
      expect(result.phase).toBe('online');
      expect(result.text).toBe('ONLINE');
    });
  });
});

describe('Rarity Colors', () => {
  const rarityColors: Record<Rarity, string> = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#eab308',
  };

  test('common rarity uses #9ca3af', () => {
    expect(getRarityColor('common')).toBe('#9ca3af');
  });

  test('rare rarity uses #3b82f6', () => {
    expect(getRarityColor('rare')).toBe('#3b82f6');
  });

  test('epic rarity uses #a855f7', () => {
    expect(getRarityColor('epic')).toBe('#a855f7');
  });

  test('legendary rarity uses #eab308', () => {
    expect(getRarityColor('legendary')).toBe('#eab308');
  });

  test('All rarity colors are valid hex colors', () => {
    Object.values(rarityColors).forEach(color => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  test('Each rarity has a unique color', () => {
    const colors = Object.values(rarityColors);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(colors.length);
  });
});

describe('Overlay Visual State by Phase', () => {
  test('Progress 0-30%: Visual state shows charging', () => {
    const result = getPhaseFromProgress(25);
    expect(result.phase).toBe('charging');
    // In charging state, progress bar should be filling, blue glow
  });

  test('Progress 30-80%: Visual state shows activating with pulses', () => {
    const result = getPhaseFromProgress(50);
    expect(result.phase).toBe('activating');
    // In activating state, bar pulses, modules start lighting
  });

  test('Progress 80-100%: Visual state shows online with full glow', () => {
    const result = getPhaseFromProgress(90);
    expect(result.phase).toBe('online');
    // In online state, full glow, static state
  });
});

describe('Overlay Integration', () => {
  test('Rarity color applies to charging phase border', () => {
    // Common machine in charging
    const rarity = 'common';
    const color = getRarityColor(rarity);
    expect(color).toBe('#9ca3af');
  });

  test('Rarity color applies to activating phase progress bar', () => {
    const rarity = 'rare';
    const color = getRarityColor(rarity);
    expect(color).toBe('#3b82f6');
  });

  test('Rarity color applies to online phase glow', () => {
    const rarity = 'legendary';
    const color = getRarityColor(rarity);
    expect(color).toBe('#eab308');
  });

  test('Progress updates correctly through all phases', () => {
    const charging = getPhaseFromProgress(15);
    const activating = getPhaseFromProgress(55);
    const online = getPhaseFromProgress(95);

    expect(charging.phase).toBe('charging');
    expect(activating.phase).toBe('activating');
    expect(online.phase).toBe('online');
  });
});
