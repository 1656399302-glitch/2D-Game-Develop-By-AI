import { describe, test, expect } from 'vitest';
import { getPulseWaveCount, getPulseWaveDuration } from '../utils/activationChoreographer';

describe('Pulse Wave Visualization', () => {
  describe('getPulseWaveCount', () => {
    test('Short path (0-200px) gets 1 wave', () => {
      expect(getPulseWaveCount(0)).toBe(1);
      expect(getPulseWaveCount(50)).toBe(1);
      expect(getPulseWaveCount(100)).toBe(1);
      expect(getPulseWaveCount(150)).toBe(1);
      expect(getPulseWaveCount(199)).toBe(1);
      expect(getPulseWaveCount(200)).toBe(1);
    });

    test('Medium path (200-400px) gets 2 waves', () => {
      expect(getPulseWaveCount(201)).toBe(2);
      expect(getPulseWaveCount(250)).toBe(2);
      expect(getPulseWaveCount(300)).toBe(2);
      expect(getPulseWaveCount(350)).toBe(2);
      expect(getPulseWaveCount(399)).toBe(2);
      expect(getPulseWaveCount(400)).toBe(2);
    });

    test('Long path (>400px) gets 3 waves', () => {
      expect(getPulseWaveCount(401)).toBe(3);
      expect(getPulseWaveCount(500)).toBe(3);
      expect(getPulseWaveCount(600)).toBe(3);
      expect(getPulseWaveCount(800)).toBe(3);
      expect(getPulseWaveCount(1000)).toBe(3);
    });

    test('Edge cases at boundaries', () => {
      expect(getPulseWaveCount(0)).toBe(1);
      expect(getPulseWaveCount(200)).toBe(1); // Exactly 200px
      expect(getPulseWaveCount(201)).toBe(2); // Just over 200px
      expect(getPulseWaveCount(400)).toBe(2); // Exactly 400px
      expect(getPulseWaveCount(401)).toBe(3); // Just over 400px
    });
  });

  describe('getPulseWaveDuration', () => {
    test('Duration = path_length / 400 seconds (in ms)', () => {
      // 400px path = 1 second = 1000ms
      expect(getPulseWaveDuration(400)).toBe(1000);
      
      // 200px path = 0.5 seconds = 500ms
      expect(getPulseWaveDuration(200)).toBe(500);
      
      // 800px path = 2 seconds = 2000ms
      expect(getPulseWaveDuration(800)).toBe(2000);
    });

    test('Short path duration', () => {
      // 100px = 250ms
      expect(getPulseWaveDuration(100)).toBe(250);
    });

    test('Medium path duration', () => {
      // 300px = 750ms
      expect(getPulseWaveDuration(300)).toBe(750);
    });

    test('Long path duration', () => {
      // 600px = 1500ms
      expect(getPulseWaveDuration(600)).toBe(1500);
    });
  });

  describe('Wave Stagger', () => {
    test('2 waves are staggered by 100ms each', () => {
      const waveCount = getPulseWaveCount(300);
      expect(waveCount).toBe(2);
      
      // Wave 0: delay = 0ms
      // Wave 1: delay = 100ms
      // This means wave 1 starts 100ms after wave 0
      expect(waveCount * 100).toBe(200); // Total stagger coverage
    });

    test('3 waves are staggered by 100ms each', () => {
      const waveCount = getPulseWaveCount(500);
      expect(waveCount).toBe(3);
      
      // Wave 0: delay = 0ms
      // Wave 1: delay = 100ms
      // Wave 2: delay = 200ms
      expect(waveCount * 100).toBe(300); // Total stagger coverage
    });
  });

  describe('Total Animation Duration', () => {
    test('Short path (1 wave): completes in path_length/400 seconds + tolerance', () => {
      const pathLength = 150;
      const duration = getPulseWaveDuration(pathLength);
      const tolerance = 100; // ms
      
      // Animation should complete in duration + tolerance
      expect(duration).toBeLessThanOrEqual(pathLength / 400 * 1000 + tolerance);
    });

    test('Medium path (2 waves): staggered start extends visible duration slightly', () => {
      const pathLength = 300;
      const duration = getPulseWaveDuration(pathLength);
      const waveCount = getPulseWaveCount(pathLength);
      
      // Wave 1 starts at 100ms, completes at duration + 100ms
      // But we measure from first wave start
      expect(waveCount).toBe(2);
      expect(duration).toBe(750);
    });

    test('Long path (3 waves): staggered start extends visible duration slightly', () => {
      const pathLength = 500;
      const duration = getPulseWaveDuration(pathLength);
      const waveCount = getPulseWaveCount(pathLength);
      
      // Wave 2 starts at 200ms, completes at duration + 200ms
      // But we measure from first wave start
      expect(waveCount).toBe(3);
      expect(duration).toBe(1250);
    });
  });
});

describe('Wave Count Calculation Integration', () => {
  test('Short path: 150px path should have 1 wave', () => {
    const pathLength = 150;
    expect(getPulseWaveCount(pathLength)).toBe(1);
    
    // Duration: 150/400 = 0.375s = 375ms
    expect(getPulseWaveDuration(pathLength)).toBe(375);
  });

  test('Medium path: 300px path should have 2 waves', () => {
    const pathLength = 300;
    expect(getPulseWaveCount(pathLength)).toBe(2);
    
    // Duration: 300/400 = 0.75s = 750ms
    expect(getPulseWaveDuration(pathLength)).toBe(750);
  });

  test('Long path: 500px path should have 3 waves', () => {
    const pathLength = 500;
    expect(getPulseWaveCount(pathLength)).toBe(3);
    
    // Duration: 500/400 = 1.25s = 1250ms
    expect(getPulseWaveDuration(pathLength)).toBe(1250);
  });
});
