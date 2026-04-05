/**
 * Integration Tests for Export Modal Integration - Round 116
 * 
 * These tests verify that the ExportModal component (with custom dimensions)
 * is correctly integrated into the application and replaces the old ExportDialog.
 */

import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';

describe('ExportModal Integration Tests', () => {
  describe('App.tsx Integration Verification', () => {
    it('should verify App.tsx uses LazyExportModal not ExportDialog', () => {
      const appContent = fs.readFileSync('src/App.tsx', 'utf-8');
      
      // Verify ExportModal is imported
      expect(appContent).toContain("LazyExportModal");
      
      // Verify ExportDialog is NOT imported
      expect(appContent).not.toContain("import { ExportDialog } from './components/Export/ExportDialog'");
      
      // Verify ExportModal is rendered
      expect(appContent).toContain('<LazyExportModal onClose={() => setShowExport(false)}');
      
      // Verify ExportDialog is NOT rendered
      expect(appContent).not.toContain('<ExportDialog onClose={() => setShowExport(false)} />');
    });
  });

  describe('ExportModal Component Verification', () => {
    it('should verify ExportModal has custom dimension support', () => {
      const modalContent = fs.readFileSync('src/components/Export/ExportModal.tsx', 'utf-8');
      
      // Verify custom dimension inputs exist in ExportModal
      expect(modalContent).toContain('customDimensions');
      expect(modalContent).toContain('custom-width');
      expect(modalContent).toContain('custom-height');
      
      // Verify dimension validation exists
      expect(modalContent).toContain('validateDimensions');
      expect(modalContent).toContain('400');
      expect(modalContent).toContain('2000');
      
      // Verify format presets exist
      expect(modalContent).toContain('getDefaultDimensionsForFormat');
    });
  });

  describe('ExportDialog Component Verification', () => {
    it('should verify ExportDialog exists but is not used in App.tsx', () => {
      // Verify ExportDialog.tsx exists
      expect(fs.existsSync('src/components/Export/ExportDialog.tsx')).toBe(true);
      
      const appContent = fs.readFileSync('src/App.tsx', 'utf-8');
      
      // ExportDialog should NOT be used in App.tsx
      expect(appContent).not.toContain('<ExportDialog');
    });
  });
});
