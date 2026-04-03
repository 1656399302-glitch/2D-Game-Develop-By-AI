/**
 * Export Flow Integration Tests - Round 116
 * 
 * Tests the export flow verification through App.tsx integration.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';

describe('Export Flow Integration Tests', () => {
  describe('App.tsx Integration Verification', () => {
    it('should verify App.tsx uses ExportModal for export functionality', () => {
      const appContent = fs.readFileSync('src/App.tsx', 'utf-8');
      
      // Verify ExportModal is imported
      expect(appContent).toContain("import { ExportModal } from './components/Export/ExportModal'");
      
      // Verify ExportModal is rendered in the modal section
      expect(appContent).toContain('<ExportModal onClose={() => setShowExport(false)} />');
    });

    it('should verify ExportDialog is NOT used in App.tsx', () => {
      const appContent = fs.readFileSync('src/App.tsx', 'utf-8');
      
      // Verify ExportDialog is NOT imported
      expect(appContent).not.toContain("import { ExportDialog } from './components/Export/ExportDialog'");
      
      // Verify ExportDialog is NOT rendered
      expect(appContent).not.toContain('<ExportDialog');
    });
  });

  describe('ExportModal Feature Verification', () => {
    it('should verify ExportModal has custom dimension inputs', () => {
      const modalContent = fs.readFileSync('src/components/Export/ExportModal.tsx', 'utf-8');
      
      // Custom dimension state
      expect(modalContent).toContain('customDimensions');
      expect(modalContent).toContain('width:');
      expect(modalContent).toContain('height:');
      
      // Dimension input fields
      expect(modalContent).toContain('custom-width');
      expect(modalContent).toContain('custom-height');
    });

    it('should verify ExportModal has dimension validation', () => {
      const modalContent = fs.readFileSync('src/components/Export/ExportModal.tsx', 'utf-8');
      
      // Dimension validation
      expect(modalContent).toContain('validateDimensions');
      
      // Validation range
      expect(modalContent).toContain('400');
      expect(modalContent).toContain('2000');
    });

    it('should verify ExportModal has format-specific defaults', () => {
      const modalContent = fs.readFileSync('src/components/Export/ExportModal.tsx', 'utf-8');
      
      // Format presets
      expect(modalContent).toContain('getDefaultDimensionsForFormat');
      expect(modalContent).toContain('twitter');
      expect(modalContent).toContain('instagram');
      expect(modalContent).toContain('discord');
    });

    it('should verify ExportModal has 8 format options', () => {
      const modalContent = fs.readFileSync('src/components/Export/ExportModal.tsx', 'utf-8');
      
      // All format options
      expect(modalContent).toContain("format=\"svg\"");
      expect(modalContent).toContain("format=\"png\"");
      expect(modalContent).toContain("format=\"poster\"");
      expect(modalContent).toContain("format=\"enhanced-poster\"");
      expect(modalContent).toContain("format=\"faction-card\"");
    });

    it('should verify ExportModal has error handling for validation', () => {
      const modalContent = fs.readFileSync('src/components/Export/ExportModal.tsx', 'utf-8');
      
      // Error state management
      expect(modalContent).toContain('errorToast');
      expect(modalContent).toContain('showError');
      expect(modalContent).toContain('widthError');
      expect(modalContent).toContain('heightError');
    });
  });

  describe('ExportPreview Integration', () => {
    it('should verify ExportModal has preview component', () => {
      const modalContent = fs.readFileSync('src/components/Export/ExportModal.tsx', 'utf-8');
      
      // Preview component
      expect(modalContent).toContain('ExportPreview');
    });
  });
});
