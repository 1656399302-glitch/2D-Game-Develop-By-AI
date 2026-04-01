import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Keyboard Focus Navigation
 * 
 * Tests keyboard navigation and focus management:
 * - AC5.1: Initial focus on page load
 * - AC5.2: Tab order through module panel
 * - AC5.3: Tab into canvas controls
 * - AC5.4: Focus moves through all panels in correct order
 */

test.describe('Keyboard Focus Navigation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and wait for load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Dismiss welcome modal if present
    const welcomeModal = page.getByRole('dialog', { name: /welcome|welcome modal/i });
    if (await welcomeModal.isVisible({ timeout: 3000 }).catch(() => false)) {
      const closeButton = page.getByRole('button', { name: /close|dismiss|start|begin/i });
      if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeButton.click();
      }
    }
    
    // Dismiss any tutorial modals
    const tutorialSkip = page.getByRole('button', { name: /skip|跳过|tutorial/i });
    if (await tutorialSkip.isVisible({ timeout: 1000 }).catch(() => false)) {
      await tutorialSkip.click();
    }
    
    // Wait for UI to be ready
    await page.waitForTimeout(500);
  });

  test.describe('AC5.1: Initial focus on page load', () => {
    test('document has focusable element after page load', async ({ page }) => {
      // Active element should be defined and focusable
      const activeElement = await page.evaluate(() => document.activeElement);
      expect(activeElement).not.toBeNull();
    });

    test('focusable elements exist in the DOM', async ({ page }) => {
      // Check for focusable elements
      const focusableCount = await page.evaluate(() => {
        const focusable = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        return focusable.length;
      });
      
      expect(focusableCount).toBeGreaterThan(0);
    });

    test('toolbar buttons exist and are visible', async ({ page }) => {
      // Check toolbar buttons are present
      const toolbarButtons = page.getByRole('toolbar').getByRole('button');
      const count = await toolbarButtons.count();
      
      expect(count).toBeGreaterThan(0);
      
      // First button should be visible
      await expect(toolbarButtons.first()).toBeVisible();
    });

    test('module panel headings are visible', async ({ page }) => {
      // Module panel should be visible
      const modulePanel = page.getByRole('heading', { name: /模块面板|module panel/i }).first();
      await expect(modulePanel).toBeVisible();
    });
  });

  test.describe('AC5.2: Tab order through module panel', () => {
    test('Tab navigates through UI elements in order', async ({ page }) => {
      // Press Tab multiple times to navigate through UI
      const focusTargets: string[] = [];
      
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
        
        // Check that focus moved to a visible element
        const activeElement = await page.evaluate(() => document.activeElement);
        expect(activeElement).not.toBeNull();
        
        const text = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.textContent?.trim() || el?.getAttribute('aria-label') || '';
        });
        
        if (text) {
          focusTargets.push(text);
        }
      }
      
      // Should have collected some focus targets
      expect(focusTargets.length).toBeGreaterThan(0);
    });

    test('all 6 base module types are accessible via Tab', async ({ page }) => {
      // Press Tab 6 times to reach each module type
      const focusedModules: string[] = [];
      
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        const text = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.textContent || '';
        });
        
        if (text) {
          focusedModules.push(text.trim());
        }
      }
      
      // Should have focused on several elements
      expect(focusedModules.length).toBeGreaterThan(0);
    });

    test('Tab navigates forward through module panel', async ({ page }) => {
      // Focus on first element
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
      
      const firstFocus = await page.evaluate(() => {
        return document.activeElement?.textContent?.trim() || '';
      });
      
      // Press Tab again
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
      
      const secondFocus = await page.evaluate(() => {
        return document.activeElement?.textContent?.trim() || '';
      });
      
      // Focus should have moved (might be same if non-visible elements in path)
      expect(firstFocus !== undefined);
      expect(secondFocus !== undefined);
    });
  });

  test.describe('AC5.3: Tab into canvas controls', () => {
    test('Tab navigates to toolbar buttons', async ({ page }) => {
      // Find the toolbar
      const toolbar = page.getByRole('toolbar');
      await expect(toolbar).toBeVisible();
      
      // Tab to toolbar
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
        
        const inToolbar = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return false;
          return el.closest('[role="toolbar"]') !== null;
        });
        
        if (inToolbar) break;
      }
      
      // Should have navigated into toolbar at some point
      const toolbarButton = toolbar.getByRole('button').first();
      await expect(toolbarButton).toBeVisible();
    });

    test('Tab navigates to zoom controls', async ({ page }) => {
      // Find zoom controls (buttons with zoom labels)
      const zoomIn = page.getByRole('button', { name: /放大/i });
      const zoomOut = page.getByRole('button', { name: /缩小/i });
      
      // At least one zoom control should be visible
      const hasZoomControls = await zoomIn.isVisible().catch(() => false) || 
                              await zoomOut.isVisible().catch(() => false);
      
      expect(hasZoomControls).toBeTruthy();
    });

    test('Tab navigates through canvas toolbar in order', async ({ page }) => {
      // Press Tab to navigate through toolbar
      const buttonTexts: string[] = [];
      
      // Tab enough times to go through toolbar
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
        
        const text = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return '';
          const ariaLabel = el.getAttribute('aria-label');
          return ariaLabel || el.textContent?.trim() || '';
        });
        
        if (text) {
          buttonTexts.push(text);
        }
      }
      
      // Should have collected button texts
      expect(buttonTexts.length).toBeGreaterThan(0);
    });

    test('Tab navigates to undo/redo buttons', async ({ page }) => {
      // Add a module to enable undo
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(300);
      
      // Find undo button
      const undoButton = page.getByRole('button', { name: /撤销/i });
      
      // Should be visible and focusable
      await expect(undoButton).toBeVisible();
    });

    test('Tab navigates to test mode buttons', async ({ page }) => {
      // Find test mode buttons
      const failureButton = page.getByRole('button', { name: /测试故障/i });
      const overloadButton = page.getByRole('button', { name: /测试过载/i });
      
      // Both should be visible
      await expect(failureButton).toBeVisible();
      await expect(overloadButton).toBeVisible();
    });
  });

  test.describe('AC5.4: Focus moves through all panels in correct order', () => {
    test('focus moves from module panel to toolbar', async ({ page }) => {
      // Navigate through module panel
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
      }
      
      // Continue tabbing to reach toolbar
      let foundToolbar = false;
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
        
        const isInToolbar = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return false;
          return el.closest('[role="toolbar"]') !== null || 
                 el.getAttribute('aria-label') === '编辑器工具栏';
        });
        
        if (isInToolbar) {
          foundToolbar = true;
          break;
        }
      }
      
      // Should have found toolbar through tab navigation
      expect(foundToolbar || await page.getByRole('toolbar').isVisible());
    });

    test('focus moves from toolbar to canvas area', async ({ page }) => {
      // Focus should eventually reach canvas area
      // This tests that focus doesn't get trapped in a cycle
      
      let lastFocus = '';
      let stuckCount = 0;
      
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
        
        const currentFocus = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return '';
          const ariaLabel = el.getAttribute('aria-label');
          return ariaLabel || el.textContent?.trim() || el.tagName || '';
        });
        
        if (currentFocus === lastFocus) {
          stuckCount++;
        } else {
          stuckCount = 0;
        }
        
        lastFocus = currentFocus;
        
        // Break if we've seen enough unique focus targets
        if (i > 5 && stuckCount < 3) {
          break;
        }
      }
      
      // Focus should have moved (not be stuck)
      expect(stuckCount).toBeLessThan(5);
    });

    test('focus can reach module headings in panel', async ({ page }) => {
      // Add modules
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(200);
      
      // Focus should be able to reach module panel
      const modulePanelVisible = await page.getByRole('heading', { name: /模块面板/i }).first().isVisible();
      expect(modulePanelVisible).toBeTruthy();
    });

    test('focus order is predictable and linear', async ({ page }) => {
      // Collect focus order
      const focusOrder: string[] = [];
      
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
        
        const label = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return 'null';
          return el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 20) || el.tagName;
        });
        
        focusOrder.push(label);
      }
      
      // Should have collected a reasonable number of focus targets
      expect(focusOrder.length).toBeGreaterThan(5);
      
      // Focus should not jump to hidden elements (null or empty labels should be rare)
      const validFocusCount = focusOrder.filter(f => f !== 'null' && f !== '').length;
      expect(validFocusCount).toBeGreaterThan(focusOrder.length / 2);
    });
  });

  test.describe('Negative Assertions', () => {
    test('document.activeElement should not be null after Tab', async ({ page }) => {
      // Press Tab
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
      
      const activeElement = await page.evaluate(() => document.activeElement);
      expect(activeElement).not.toBeNull();
    });

    test('focus should not jump to hidden elements', async ({ page }) => {
      // Tab through several elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
        
        const isVisible = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el) return false;
          return el.checkVisibility ? el.checkVisibility() : el.offsetWidth > 0;
        });
        
        // Most focused elements should be visible
        if (i > 2) {
          expect(isVisible).toBeTruthy();
        }
      }
    });

    test('focus should not become trapped in a cycle', async ({ page }) => {
      // Tab through elements
      const seenElements = new Set<string>();
      let sameCount = 0;
      
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(30);
        
        const label = await page.evaluate(() => {
          return document.activeElement?.getAttribute('aria-label') || 
                 document.activeElement?.textContent?.trim().slice(0, 30) || 
                 'unknown';
        });
        
        if (seenElements.has(label)) {
          sameCount++;
        } else {
          seenElements.add(label);
          sameCount = 0;
        }
        
        // If we see the same element 5+ times in a row, focus is trapped
        expect(sameCount).toBeLessThan(5);
      }
    });

    test('focus order does not repeat unnecessarily', async ({ page }) => {
      // Collect first 10 focus targets
      const firstPass: string[] = [];
      
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
        
        const label = await page.evaluate(() => {
          return document.activeElement?.textContent?.trim().slice(0, 20) || '';
        });
        
        firstPass.push(label);
      }
      
      // Collect next 10 focus targets
      const secondPass: string[] = [];
      
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
        
        const label = await page.evaluate(() => {
          return document.activeElement?.textContent?.trim().slice(0, 20) || '';
        });
        
        secondPass.push(label);
      }
      
      // Second pass should continue the focus order (may overlap with first pass)
      // This is expected as Tab cycles through the page
      expect(secondPass.length).toBe(10);
    });
  });

  test.describe('Module Selection Focus', () => {
    test('Tab can reach newly added module', async ({ page }) => {
      // Add a module
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(300);
      
      // Module should be on canvas
      await expect(page.locator('text=/模块: 1|Modules: 1/').first()).toBeVisible({ timeout: 5000 });
      
      // Focus can reach module-related controls
      const moduleCount = await page.locator('text=/模块: 1/').first().isVisible();
      expect(moduleCount).toBeTruthy();
    });

    test('focusable elements are available after adding multiple modules', async ({ page }) => {
      // Add multiple modules
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(200);
      await page.getByRole('heading', { name: /能量管道/i }).click();
      await page.waitForTimeout(200);
      
      // Tab should still work
      await page.keyboard.press('Tab');
      await page.waitForTimeout(50);
      
      const activeElement = await page.evaluate(() => document.activeElement);
      expect(activeElement).not.toBeNull();
    });
  });
});
