import { describe, it, expect } from 'vitest';

// Test accessibility enhancements for Canvas.tsx
describe('Accessibility Enhancements (Round 117)', () => {
  describe('AC-117-004: Accessibility Labels', () => {
    it('should have at least 3 aria-label attributes in Canvas.tsx', async () => {
      const fs = await import('fs');
      const canvasPath = './src/components/Editor/Canvas.tsx';
      const canvasCode = fs.readFileSync(canvasPath, 'utf-8');
      
      // Count aria-label occurrences
      const ariaLabelMatches = canvasCode.match(/aria-label\s*=\s*["'][^"']+["']/g) || [];
      
      // Should have at least 3 aria-label attributes
      expect(ariaLabelMatches.length).toBeGreaterThanOrEqual(3);
    });

    it('should have aria-label on connection port area', async () => {
      const fs = await import('fs');
      const canvasPath = './src/components/Editor/Canvas.tsx';
      const canvasCode = fs.readFileSync(canvasPath, 'utf-8');
      
      // Check for aria-label on connections layer
      const hasConnectionsAriaLabel = /id\s*=\s*["']connections-layer["'][^>]*aria-label|saria-label[^>]*id\s*=\s*["']connections-layer["']/.test(canvasCode) ||
        canvasCode.includes('aria-label="Energy connection ports and paths"');
      
      expect(hasConnectionsAriaLabel).toBe(true);
    });

    it('should have aria-label on toolbar', async () => {
      const fs = await import('fs');
      const canvasPath = './src/components/Editor/Canvas.tsx';
      const canvasCode = fs.readFileSync(canvasPath, 'utf-8');
      
      // Check for aria-label on toolbar
      const hasToolbarAriaLabel = canvasCode.includes('aria-label="Module alignment and arrangement toolbar"') ||
        /toolbar[^>]*aria-label|aria-label[^>]*toolbar/i.test(canvasCode);
      
      expect(hasToolbarAriaLabel).toBe(true);
    });

    it('should have aria-label on module container', async () => {
      const fs = await import('fs');
      const canvasPath = './src/components/Editor/Canvas.tsx';
      const canvasCode = fs.readFileSync(canvasPath, 'utf-8');
      
      // Check for aria-label on modules layer
      const hasModulesAriaLabel = /id\s*=\s*["']modules-layer["'][^>]*aria-label|saria-label[^>]*id\s*=\s*["']modules-layer["']/.test(canvasCode) ||
        canvasCode.includes('aria-label="Machine modules container"');
      
      expect(hasModulesAriaLabel).toBe(true);
    });

    it('should not have empty aria-label attributes', async () => {
      const fs = await import('fs');
      const canvasPath = './src/components/Editor/Canvas.tsx';
      const canvasCode = fs.readFileSync(canvasPath, 'utf-8');
      
      // Check for empty aria-label
      const hasEmptyAriaLabel = /aria-label\s*=\s*["']["']/.test(canvasCode);
      
      expect(hasEmptyAriaLabel).toBe(false);
    });

    it('should have descriptive aria-label values (not generic)', async () => {
      const fs = await import('fs');
      const canvasPath = './src/components/Editor/Canvas.tsx';
      const canvasCode = fs.readFileSync(canvasPath, 'utf-8');
      
      // Extract all aria-label values
      const ariaLabelMatches = canvasCode.match(/aria-label\s*=\s*["']([^"']+)["']/g) || [];
      
      // All aria-labels should have meaningful content (at least 5 chars)
      ariaLabelMatches.forEach(label => {
        const match = label.match(/aria-label\s*=\s*["']([^"']+)["']/);
        if (match) {
          const value = match[1];
          expect(value.length).toBeGreaterThanOrEqual(5);
        }
      });
    });
  });
});

// Test ExportModal error handling
describe('ExportModal Error Handling (Round 117)', () => {
  describe('AC-117-003: ExportModal Error Handling', () => {
    it('should have !ctx condition check in handleFactionCardExportPNG', async () => {
      const fs = await import('fs');
      const exportPath = './src/components/Export/ExportModal.tsx';
      const exportCode = fs.readFileSync(exportPath, 'utf-8');
      
      // Check for !ctx condition
      const hasCtxCheck = /if\s*\(\s*!\s*ctx\s*\)/.test(exportCode);
      expect(hasCtxCheck).toBe(true);
    });

    it('should show error when canvas context is not available', async () => {
      const fs = await import('fs');
      const exportPath = './src/components/Export/ExportModal.tsx';
      const exportCode = fs.readFileSync(exportPath, 'utf-8');
      
      // Check that after !ctx, showError is called (not just silent return)
      const hasErrorAfterCtxCheck = /if\s*\(\s*!\s*ctx\s*\)\s*\{[^}]*showError/.test(exportCode) ||
        /if\s*\(\s*!\s*ctx\s*\)\s*\{[^}]*return[^}]*showError/s.test(exportCode);
      
      expect(hasErrorAfterCtxCheck).toBe(true);
    });

    it('should not silently return without notification on !ctx', async () => {
      const fs = await import('fs');
      const exportPath = './src/components/Export/ExportModal.tsx';
      const exportCode = fs.readFileSync(exportPath, 'utf-8');
      
      // Check that !ctx doesn't just return silently
      // Should NOT have pattern like: if (!ctx) return;
      // without any error handling before/after
      const hasSilentReturn = /if\s*\(\s*!\s*ctx\s*\)\s*\{\s*return\s*;?\s*\}/.test(exportCode);
      
      // The fix should have removed silent returns - check for showError after ctx check
      const hasProperError = /if\s*\(\s*!\s*ctx\s*\)\s*\{[^}]*showError[^}]*\}/s.test(exportCode);
      
      expect(hasProperError || !hasSilentReturn).toBe(true);
    });

    it('should use user-visible error (alert or showError toast)', async () => {
      const fs = await import('fs');
      const exportPath = './src/components/Export/ExportModal.tsx';
      const exportCode = fs.readFileSync(exportPath, 'utf-8');
      
      // After !ctx check, should call showError (toast) or alert
      const ctxCheckSection = exportCode.match(/if\s*\(\s*!\s*ctx\s*\)\s*\{[\s\S]*?\}/);
      
      if (ctxCheckSection) {
        const hasUserVisibleError = /showError|alert/.test(ctxCheckSection[0]);
        expect(hasUserVisibleError).toBe(true);
      } else {
        // If no ctx check found, the test should fail
        expect(true).toBe(false);
      }
    });
  });
});

// Test aria-invalid propagation in ExportModal
describe('ExportModal aria-invalid Propagation', () => {
  it('should have aria-invalid on dimension inputs when error exists', async () => {
    const fs = await import('fs');
    const exportPath = './src/components/Export/ExportModal.tsx';
    const exportCode = fs.readFileSync(exportPath, 'utf-8');
    
    // Check for aria-invalid on width/height inputs
    const hasAriaInvalid = /aria-invalid\s*=\s*\{\s*!!\s*widthError\s*\}|aria-invalid\s*=\s*\{\s*!!\s*heightError\s*\}/.test(exportCode) ||
      /aria-invalid\s*=\s*\{\s*!!widthError\s*\}|aria-invalid\s*=\s*\{\s*!!heightError\s*\}/.test(exportCode);
    
    expect(hasAriaInvalid).toBe(true);
  });

  it('should link aria-invalid inputs to error messages via aria-describedby', async () => {
    const fs = await import('fs');
    const exportPath = './src/components/Export/ExportModal.tsx';
    const exportCode = fs.readFileSync(exportPath, 'utf-8');
    
    // Check for aria-describedby linking to error message
    const hasAriaDescribedBy = /aria-describedby\s*=\s*\{\s*widthError\s*\?\s*["']width-error["']/.test(exportCode) ||
      /aria-describedby\s*=\s*\{\s*heightError\s*\?\s*["']height-error["']/.test(exportCode);
    
    expect(hasAriaDescribedBy).toBe(true);
  });
});
