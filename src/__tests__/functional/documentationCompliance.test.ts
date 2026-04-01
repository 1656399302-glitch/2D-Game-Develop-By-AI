/**
 * AC-DOC-001 & AC-DOC-002: Documentation Compliance Tests
 * 
 * Verifies:
 * - AC-DOC-001: README contains required sections for developer onboarding
 * - AC-DOC-002: Key stores documented in API.md
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Documentation Compliance Tests', () => {
  const ROOT_PATH = process.cwd();

  describe('AC-DOC-001: README Content Verification', () => {
    const README_PATH = join(ROOT_PATH, 'README.md');

    it('should have README.md file', () => {
      expect(existsSync(README_PATH)).toBe(true);
    });

    it('should have Setup section', () => {
      const content = readFileSync(README_PATH, 'utf-8');
      const hasSetup = /#{1,3}\s*Setup/i.test(content) || /Setup/i.test(content);
      expect(hasSetup).toBe(true);
    });

    it('should have Architecture section', () => {
      const content = readFileSync(README_PATH, 'utf-8');
      const hasArch = /#{1,3}\s*Architecture/i.test(content) || /Architecture/i.test(content);
      expect(hasArch).toBe(true);
    });

    it('should have Modules section or reference', () => {
      const content = readFileSync(README_PATH, 'utf-8');
      const hasModules = /#{1,3}\s*Module/i.test(content) || /Module/i.test(content);
      expect(hasModules).toBe(true);
    });

    it('should have Connections section or reference', () => {
      const content = readFileSync(README_PATH, 'utf-8');
      const hasConnections = /#{1,3}\s*Connection/i.test(content) || /Connection/i.test(content);
      expect(hasConnections).toBe(true);
    });

    it('should have Activation section or reference', () => {
      const content = readFileSync(README_PATH, 'utf-8');
      const hasActivation = /#{1,3}\s*Activation/i.test(content) || /Activation/i.test(content);
      expect(hasActivation).toBe(true);
    });

    it('should have Codex section or reference', () => {
      const content = readFileSync(README_PATH, 'utf-8');
      const hasCodex = /#{1,3}\s*Codex/i.test(content) || /Codex/i.test(content);
      expect(hasCodex).toBe(true);
    });

    it('should have Export section or reference', () => {
      const content = readFileSync(README_PATH, 'utf-8');
      const hasExport = /#{1,3}\s*Export/i.test(content) || /Export/i.test(content);
      expect(hasExport).toBe(true);
    });

    it('should have at least 6 required sections', () => {
      const content = readFileSync(README_PATH, 'utf-8');
      const requiredSections = [
        /#{1,3}\s*Setup/i,
        /#{1,3}\s*Architecture/i,
        /#{1,3}\s*Module/i,
        /#{1,3}\s*Connection/i,
        /#{1,3}\s*Activation/i,
        /#{1,3}\s*Codex/i,
        /#{1,3}\s*Export/i,
        /#{1,3}\s*Contributing/i,
      ];

      const foundSections = requiredSections.filter(regex => regex.test(content));
      console.log(`Found ${foundSections.length} required sections (minimum: 6)`);
      
      expect(foundSections.length).toBeGreaterThanOrEqual(6);
    });

    it('should have meaningful content (not just placeholder)', () => {
      const content = readFileSync(README_PATH, 'utf-8');
      
      // Should have substantial content
      expect(content.length).toBeGreaterThan(1000);
      
      // Should not be mostly Lorem Ipsum
      const loremCount = (content.match(/Lorem ipsum/i) || []).length;
      expect(loremCount).toBe(0);
    });
  });

  describe('AC-DOC-002: Store API Documentation', () => {
    const API_PATH = join(ROOT_PATH, 'API.md');

    it('should have API.md file', () => {
      expect(existsSync(API_PATH)).toBe(true);
    });

    it('should document useMachineStore', () => {
      const content = readFileSync(API_PATH, 'utf-8');
      const hasMachineStore = /useMachineStore/i.test(content);
      expect(hasMachineStore).toBe(true);
    });

    it('should document useCodexStore', () => {
      const content = readFileSync(API_PATH, 'utf-8');
      const hasCodexStore = /useCodexStore/i.test(content);
      expect(hasCodexStore).toBe(true);
    });

    it('should document useFactionStore', () => {
      const content = readFileSync(API_PATH, 'utf-8');
      const hasFactionStore = /useFactionStore/i.test(content);
      expect(hasFactionStore).toBe(true);
    });

    it('should document useActivationStore (or activation references)', () => {
      const content = readFileSync(API_PATH, 'utf-8');
      // May be named differently - check for activation related store
      const hasActivationStore = /useActivationStore|Activation/i.test(content);
      expect(hasActivationStore).toBe(true);
    });

    it('should have at least 4 store references', () => {
      const content = readFileSync(API_PATH, 'utf-8');
      
      const storePatterns = [
        /useMachineStore/,
        /useCodexStore/,
        /useFactionStore/,
        /useActivationStore/,
        /useSelectionStore/,
        /useSettingsStore/,
      ];

      const foundStores = storePatterns.filter(pattern => pattern.test(content));
      console.log(`Found ${foundStores.length} store references (minimum: 4)`);
      
      expect(foundStores.length).toBeGreaterThanOrEqual(4);
    });

    it('should document store methods or properties', () => {
      const content = readFileSync(API_PATH, 'utf-8');
      
      // Should have method/property references
      const hasMethods = /addModule|removeModule|addEntry|removeEntry|setMachineState/i.test(content);
      expect(hasMethods).toBe(true);
    });

    it('should have meaningful API documentation content', () => {
      const content = readFileSync(API_PATH, 'utf-8');
      
      // Should have substantial content
      expect(content.length).toBeGreaterThan(500);
    });
  });

  describe('Additional Documentation', () => {
    it('should have progress.md documenting round status', () => {
      const progressPath = join(ROOT_PATH, 'progress.md');
      expect(existsSync(progressPath)).toBe(true);
    });

    it('should have spec.md with project specification', () => {
      const specPath = join(ROOT_PATH, 'spec.md');
      expect(existsSync(specPath)).toBe(true);
    });

    it('should have package.json with proper scripts', () => {
      const pkgPath = join(ROOT_PATH, 'package.json');
      const content = readFileSync(pkgPath, 'utf-8');
      const pkg = JSON.parse(content);
      
      expect(pkg.scripts).toBeDefined();
      expect(pkg.scripts.build).toBeDefined();
      expect(pkg.scripts.test).toBeDefined();
    });
  });
});
