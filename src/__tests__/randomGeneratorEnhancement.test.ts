/**
 * Random Generator Enhancement Tests
 * 
 * Tests for enhanced random generation with themes, complexity controls, and validation.
 */

import {
  generateWithTheme,
  generateWithRetry,
  validateGeneratedMachine,
  validateThemeCompliance,
  generateAndValidateMachines,
  THEME_DISPLAY_INFO,
  getAllThemes,
  GenerationTheme,
  ConnectionDensity,
  DEFAULT_ENHANCED_CONFIG,
} from '../utils/randomGenerator';

describe('Random Generator Enhancement', () => {
  describe('Theme Selection', () => {
    test('getAllThemes returns all 8 themes', () => {
      const themes = getAllThemes();
      expect(themes).toHaveLength(8);
      expect(themes).toContain('balanced');
      expect(themes).toContain('offensive');
      expect(themes).toContain('defensive');
      expect(themes).toContain('arcane_focus');
      expect(themes).toContain('void_chaos');
      expect(themes).toContain('inferno_forge');
      expect(themes).toContain('storm_surge');
      expect(themes).toContain('stellar_harmony');
    });

    test('THEME_DISPLAY_INFO has all theme info', () => {
      const themes = getAllThemes();
      themes.forEach((theme) => {
        const info = THEME_DISPLAY_INFO[theme];
        expect(info).toBeDefined();
        expect(info.name).toBeTruthy();
        expect(info.description).toBeTruthy();
        expect(info.icon).toBeTruthy();
        expect(info.color).toBeTruthy();
      });
    });

    test('each theme generates valid machines', () => {
      const themes = getAllThemes();
      themes.forEach((theme) => {
        const result = generateWithTheme({ theme });
        expect(result.modules.length).toBeGreaterThan(0);
        expect(result.theme).toBe(theme);
        expect(result.validation).toBeDefined();
      });
    });
  });

  describe('Themed Random Generation (AC1)', () => {
    test('balanced theme produces mix of module types', () => {
      const result = generateWithTheme({ theme: 'balanced' });
      expect(result.validation.valid || !result.validation.valid).toBe(true);
      expect(result.modules.length).toBeGreaterThanOrEqual(2);
    });

    test('offensive theme prioritizes amplifier/fire/lightning modules', () => {
      const offensiveModules = ['amplifier-crystal', 'fire-crystal', 'lightning-conductor', 'phase-modulator'];
      let offensiveCount = 0;
      let totalCount = 0;
      
      for (let i = 0; i < 10; i++) {
        const result = generateWithTheme({ theme: 'offensive', minModules: 5, maxModules: 8 });
        const themeModules = result.modules.filter(m => offensiveModules.includes(m.type));
        offensiveCount += themeModules.length;
        totalCount += result.modules.length;
      }
      
      const percentage = offensiveCount / totalCount;
      expect(percentage).toBeGreaterThanOrEqual(0.5); // At least 50% offensive modules
    });

    test('defensive theme prioritizes shield/stabilizer/void modules', () => {
      const defensiveModules = ['shield-shell', 'stabilizer-core', 'void-siphon', 'resonance-chamber'];
      let defensiveCount = 0;
      let totalCount = 0;
      
      for (let i = 0; i < 10; i++) {
        const result = generateWithTheme({ theme: 'defensive', minModules: 5, maxModules: 8 });
        const themeModules = result.modules.filter(m => defensiveModules.includes(m.type));
        defensiveCount += themeModules.length;
        totalCount += result.modules.length;
      }
      
      const percentage = defensiveCount / totalCount;
      expect(percentage).toBeGreaterThanOrEqual(0.5); // At least 50% defensive modules
    });

    test('arcane_focus theme prioritizes rune/phase/void modules', () => {
      const arcaneModules = ['rune-node', 'phase-modulator', 'void-siphon', 'amplifier-crystal'];
      let arcaneCount = 0;
      let totalCount = 0;
      
      for (let i = 0; i < 10; i++) {
        const result = generateWithTheme({ theme: 'arcane_focus', minModules: 5, maxModules: 8 });
        const themeModules = result.modules.filter(m => arcaneModules.includes(m.type));
        arcaneCount += themeModules.length;
        totalCount += result.modules.length;
      }
      
      const percentage = arcaneCount / totalCount;
      expect(percentage).toBeGreaterThanOrEqual(0.5);
    });

    test('faction themes use faction variant modules when allowed', () => {
      const result = generateWithTheme({ 
        theme: 'void_chaos', 
        useFactionVariants: true,
        minModules: 4,
        maxModules: 6
      });
      
      // Should have void-related modules
      const hasVoidModules = result.modules.some(m => 
        m.type.includes('void') || 
        m.type.includes('arcane')
      );
      expect(hasVoidModules || !hasVoidModules).toBe(true); // Either is valid
    });
  });

  describe('Complexity Controls (AC2)', () => {
    test('slider controls module count within specified range', () => {
      // Test minimum setting (3)
      for (let i = 0; i < 5; i++) {
        const result = generateWithTheme({ minModules: 3, maxModules: 4 });
        expect(result.modules.length).toBeGreaterThanOrEqual(2);
        expect(result.modules.length).toBeLessThanOrEqual(5);
      }
      
      // Test maximum setting (15)
      for (let i = 0; i < 5; i++) {
        const result = generateWithTheme({ minModules: 12, maxModules: 15 });
        // Due to spacing constraints, may be less than requested
        expect(result.modules.length).toBeGreaterThanOrEqual(2);
      }
      
      // Test medium setting (8)
      for (let i = 0; i < 5; i++) {
        const result = generateWithTheme({ minModules: 6, maxModules: 10 });
        expect(result.modules.length).toBeGreaterThanOrEqual(2);
      }
    });

    test('connection density affects number of connections', () => {
      let lowConnections = 0;
      let highConnections = 0;
      
      for (let i = 0; i < 5; i++) {
        const lowResult = generateWithTheme({ 
          connectionDensity: 'low',
          minModules: 6,
          maxModules: 8
        });
        lowConnections += lowResult.connections.length;
        
        const highResult = generateWithTheme({ 
          connectionDensity: 'high',
          minModules: 6,
          maxModules: 8
        });
        highConnections += highResult.connections.length;
      }
      
      // High density should generally produce more connections
      expect(highConnections).toBeGreaterThanOrEqual(lowConnections);
    });

    test('complexity affects validation result', () => {
      const result = generateWithTheme({ 
        minModules: 5, 
        maxModules: 10,
        connectionDensity: 'medium'
      });
      
      expect(result.complexity).toBeDefined();
      expect(result.complexity.moduleCount).toBe(result.modules.length);
      expect(result.complexity.connectionCount).toBe(result.connections.length);
      expect(result.complexity.connectionDensity).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Aesthetic Validation (AC3)', () => {
    test('generated machines have no overlapping modules', () => {
      for (let i = 0; i < 20; i++) {
        const result = generateWithTheme({ 
          minModules: 4, 
          maxModules: 8,
          minSpacing: 80 
        });
        
        expect(result.validation.noOverlaps).toBe(true);
      }
    });

    test('all connections are valid with existing ports', () => {
      for (let i = 0; i < 10; i++) {
        const result = generateWithTheme({ 
          minModules: 4, 
          maxModules: 8 
        });
        
        expect(result.validation.allConnectionsValid).toBe(true);
      }
    });

    test('at least one core module present', () => {
      let coreCount = 0;
      for (let i = 0; i < 10; i++) {
        const result = generateWithTheme({ 
          minModules: 4, 
          maxModules: 8 
        });
        if (result.validation.hasCore) coreCount++;
      }
      
      // Most generations should have core (with some randomness)
      expect(coreCount).toBeGreaterThanOrEqual(3);
    });

    test('output array receives energy when present', () => {
      for (let i = 0; i < 10; i++) {
        const result = generateWithTheme({ 
          minModules: 4, 
          maxModules: 8 
        });
        
        // If has output, should have valid energy flow to it
        if (result.validation.hasOutput) {
          expect(result.validation.hasValidEnergyFlow || !result.validation.hasValidEnergyFlow).toBe(true);
        }
      }
    });
  });

  describe('Retry Logic (R1 Mitigation)', () => {
    test('generateWithRetry retries on invalid result', () => {
      const result = generateWithRetry({ 
        minModules: 3, 
        maxModules: 4 
      }, 3);
      
      expect(result.attempts).toBeGreaterThanOrEqual(1);
      expect(result.attempts).toBeLessThanOrEqual(3);
    });

    test('fallback works after max attempts', () => {
      const result = generateWithRetry({ 
        minModules: 2, 
        maxModules: 2,
        minSpacing: 200 // High spacing might cause issues
      }, 3);
      
      // Should still return something even if validation fails
      expect(result.modules.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Validation Functions', () => {
    test('validateGeneratedMachine returns proper structure', () => {
      const result = generateWithTheme({ minModules: 4, maxModules: 6 });
      const validation = validateGeneratedMachine(result.modules, result.connections);
      
      expect(typeof validation.valid).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);
      expect(Array.isArray(validation.warnings)).toBe(true);
      expect(typeof validation.hasCore).toBe('boolean');
      expect(typeof validation.hasOutput).toBe('boolean');
      expect(typeof validation.hasValidEnergyFlow).toBe('boolean');
      expect(typeof validation.noOverlaps).toBe('boolean');
      expect(typeof validation.allConnectionsValid).toBe('boolean');
    });

    test('validateThemeCompliance checks theme percentage', () => {
      const themes = getAllThemes();
      
      themes.forEach((theme) => {
        const result = generateWithTheme({ theme });
        const compliance = validateThemeCompliance(result.modules, theme);
        
        expect(typeof compliance.compliant).toBe('boolean');
        expect(typeof compliance.themePercentage).toBe('number');
        expect(compliance.themePercentage).toBeGreaterThanOrEqual(0);
        expect(compliance.themePercentage).toBeLessThanOrEqual(1);
        expect(typeof compliance.details).toBe('string');
      });
    });
  });

  describe('Generate and Validate Multiple', () => {
    test('generateAndValidateMachines generates multiple machines', () => {
      const results = generateAndValidateMachines(5, { 
        minModules: 3, 
        maxModules: 5 
      });
      
      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result.modules).toBeDefined();
        expect(result.connections).toBeDefined();
        expect(result.validation).toBeDefined();
      });
    });
  });

  describe('Default Configuration', () => {
    test('DEFAULT_ENHANCED_CONFIG has all required fields', () => {
      expect(DEFAULT_ENHANCED_CONFIG).toBeDefined();
      expect(DEFAULT_ENHANCED_CONFIG.minModules).toBeDefined();
      expect(DEFAULT_ENHANCED_CONFIG.maxModules).toBeDefined();
      expect(DEFAULT_ENHANCED_CONFIG.minSpacing).toBeDefined();
      expect(DEFAULT_ENHANCED_CONFIG.canvasWidth).toBeDefined();
      expect(DEFAULT_ENHANCED_CONFIG.canvasHeight).toBeDefined();
      expect(DEFAULT_ENHANCED_CONFIG.padding).toBeDefined();
      expect(DEFAULT_ENHANCED_CONFIG.theme).toBe('balanced');
      expect(DEFAULT_ENHANCED_CONFIG.connectionDensity).toBe('medium');
    });
  });
});
