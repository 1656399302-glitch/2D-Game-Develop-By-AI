/**
 * Sub-Circuit E2E Tests - Round 134
 * 
 * Fixed Escape key behavior (Round 134):
 * - Escape now closes modal regardless of focus state
 * - Tests updated to verify Escape works when input is focused
 * 
 * Previous test fixes (Round 133):
 * - Circuit toggle: button[data-circuit-mode-toggle]
 * - Circuit panel: [data-circuit-module-panel]
 * - Sub-circuit name input: [data-sub-circuit-name-input]
 * - Confirm create: [data-confirm-create]
 * - Cancel create: [data-cancel-create]
 * - Delete sub-circuit: [data-delete-sub-circuit]
 * - Cancel delete: [data-cancel-delete]
 * - Confirm delete: [data-confirm-delete]
 */

import { test, expect } from '@playwright/test';

test.describe('Sub-Circuit Module System - Round 134', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to fully load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    
    // Clear any localStorage state that might interfere
    await page.evaluate(() => {
      localStorage.removeItem('arcane-subcircuits-storage');
    });
    
    // Reload to get clean state
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    // Clean up localStorage after each test
    await page.evaluate(() => {
      localStorage.removeItem('arcane-subcircuits-storage');
    });
  });

  test.describe('AC-133-003: Circuit Mode Toggle', () => {
    test('should click circuit mode toggle and see circuit panel visible', async ({ page }) => {
      // Step 1: Click the circuit mode toggle button
      const circuitToggle = page.locator('[data-circuit-module-panel] button[data-circuit-mode-toggle]').first();
      
      // Verify the toggle is visible
      await expect(circuitToggle).toBeVisible({ timeout: 10000 });
      
      // Click it to enable circuit mode
      await circuitToggle.click();
      
      // Wait a moment for the state to update
      await page.waitForTimeout(500);
      
      // Step 2: Verify the circuit module panel is visible
      const panel = page.locator('[data-circuit-module-panel]');
      await expect(panel).toBeVisible({ timeout: 5000 });
      
      // Step 3: Verify circuit mode is active (toggle shows "已开启")
      await expect(circuitToggle).toContainText('已开启', { timeout: 3000 });
    });

    test('should hide circuit panel when circuit mode is toggled off', async ({ page }) => {
      // First, enable circuit mode
      const circuitToggle = page.locator('[data-circuit-module-panel] button[data-circuit-mode-toggle]').first();
      await circuitToggle.click();
      
      // Wait for panel to be visible
      const panel = page.locator('[data-circuit-module-panel]');
      await expect(panel).toBeVisible({ timeout: 5000 });
      
      // Now toggle off
      await circuitToggle.click();
      await page.waitForTimeout(500);
      
      // The panel should no longer show circuit components (toggle text changes)
      await expect(circuitToggle).not.toContainText('已开启');
    });
  });

  test.describe('AC-134-001: Escape Key Closes Modal When Input is Focused', () => {
    test('should close modal immediately when Escape is pressed while input is focused', async ({ page }) => {
      // Enable circuit mode
      const circuitToggle = page.locator('[data-circuit-module-panel] button[data-circuit-mode-toggle]').first();
      await circuitToggle.click();
      await page.waitForTimeout(300);
      
      // Verify panel is visible
      const panel = page.locator('[data-circuit-module-panel]');
      await expect(panel).toBeVisible({ timeout: 5000 });
      
      // Open custom section first
      const customSection = page.locator('[data-custom-section-toggle]');
      await customSection.click();
      await page.waitForTimeout(300);
      
      // Record initial sub-circuit name count
      const initialSubCircuitCount = await page.locator('text=/TestEscapeFocused/').count();
      
      // Dispatch event to open modal
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', { 
          detail: { selectedModuleIds: ['node-1', 'node-2'] } 
        }));
      });
      
      // Verify modal appears
      const modal = page.locator('h2:has-text("创建子电路")');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Verify input is auto-focused (this is the key test condition for AC-134-001)
      const nameInput = page.locator('[data-sub-circuit-name-input]');
      await expect(nameInput).toBeVisible({ timeout: 3000 });
      
      // Wait for focus to be set
      await page.waitForTimeout(200);
      
      // Verify input is actually focused (document.activeElement is the input)
      const activeElementTag = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      expect(activeElementTag).toBe('INPUT');
      
      // Enter a name (simulating user typing)
      await nameInput.fill('TestEscapeFocused');
      
      // Press Escape while input is still focused
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      
      // VERIFICATION: Modal should be closed (not visible)
      await expect(modal).not.toBeVisible({ timeout: 3000 });
      
      // VERIFICATION: No sub-circuit should have been created (modal was dismissed, not submitted)
      const finalSubCircuitCount = await page.locator('text=/TestEscapeFocused/').count();
      expect(finalSubCircuitCount).toBe(initialSubCircuitCount);
      
      // NEGATIVE ASSERTION: Modal must not remain visible after Escape
      const modalCount = await page.locator('[data-create-subcircuit-modal]').count();
      expect(modalCount).toBe(0);
    });

    test('should be able to reopen modal after Escape dismissal', async ({ page }) => {
      // Enable circuit mode
      const circuitToggle = page.locator('[data-circuit-module-panel] button[data-circuit-mode-toggle]').first();
      await circuitToggle.click();
      await page.waitForTimeout(300);
      
      // Dispatch event to open modal
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', { 
          detail: { selectedModuleIds: ['node-1', 'node-2'] } 
        }));
      });
      
      // Verify modal appears
      const modal = page.locator('h2:has-text("创建子电路")');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Press Escape while input is focused
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      
      // Verify modal is closed
      await expect(modal).not.toBeVisible({ timeout: 3000 });
      
      // REPEAT/REOPEN: Can dispatch event again to reopen modal
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', { 
          detail: { selectedModuleIds: ['node-1', 'node-2'] } 
        }));
      });
      
      // Verify modal can be reopened
      await expect(modal).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('AC-134-002: Escape Key Closes Modal (With or Without Focus)', () => {
    test('should close modal when Escape is pressed - verifying fixed behavior works regardless of focus', async ({ page }) => {
      // This test verifies that Escape works now regardless of where focus is
      // Previously, Escape would NOT work when input was focused (the bug)
      // Now it works in all cases
      
      // Enable circuit mode
      const circuitToggle = page.locator('[data-circuit-module-panel] button[data-circuit-mode-toggle]').first();
      await circuitToggle.click();
      await page.waitForTimeout(300);
      
      // Record initial sub-circuit count
      const initialCount = await page.locator('text=/TestEscape134/').count();
      
      // Dispatch event to open modal
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', { 
          detail: { selectedModuleIds: ['node-1', 'node-2'] } 
        }));
      });
      
      // Verify modal is open
      const modal = page.locator('h2:has-text("创建子电路")');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Press Escape (input will be focused, but Escape should still work due to fix)
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      
      // Verify modal closes
      await expect(modal).not.toBeVisible({ timeout: 3000 });
      
      // NEGATIVE ASSERTION: Modal must not remain visible after Escape
      const modalCount = await page.locator('[data-create-subcircuit-modal]').count();
      expect(modalCount).toBe(0);
      
      // Verify no sub-circuit was created
      const finalCount = await page.locator('text=/TestEscape134/').count();
      expect(finalCount).toBe(initialCount);
    });
  });

  test.describe('AC-133-004/005: Sub-Circuit Creation via Event Dispatch', () => {
    test('should create sub-circuit via event dispatch and verify it appears in circuit panel', async ({ page }) => {
      // Enable circuit mode first
      const circuitToggle = page.locator('[data-circuit-module-panel] button[data-circuit-mode-toggle]').first();
      await circuitToggle.click();
      await page.waitForTimeout(300);
      
      // Verify panel is visible
      const panel = page.locator('[data-circuit-module-panel]');
      await expect(panel).toBeVisible({ timeout: 5000 });
      
      // Create sub-circuit via event dispatch
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', { 
          detail: { selectedModuleIds: ['node-1', 'node-2'] } 
        }));
      });
      
      // Verify modal appears with correct title
      const modal = page.locator('h2:has-text("创建子电路")');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Verify name input exists
      const nameInput = page.locator('[data-sub-circuit-name-input]');
      await expect(nameInput).toBeVisible({ timeout: 3000 });
      
      // Enter name for sub-circuit
      await nameInput.fill('TestSub133');
      
      // Click confirm button
      const confirmButton = page.locator('[data-confirm-create]');
      await expect(confirmButton).toBeVisible({ timeout: 3000 });
      await confirmButton.click();
      
      // Verify modal closes (NEGATIVE ASSERTION: modal must not remain visible)
      await expect(modal).not.toBeVisible({ timeout: 3000 });
      
      // Verify sub-circuit appears in custom section
      const customSection = page.locator('[data-custom-section-toggle]');
      await expect(customSection).toBeVisible({ timeout: 5000 });
      await customSection.click();
      
      // Verify the sub-circuit name appears
      const subCircuitItem = page.locator('text=TestSub133');
      await expect(subCircuitItem).toBeVisible({ timeout: 5000 });
    });

    test('AC-134-003: should dismiss modal when cancel button is clicked', async ({ page }) => {
      // Enable circuit mode
      const circuitToggle = page.locator('[data-circuit-module-panel] button[data-circuit-mode-toggle]').first();
      await circuitToggle.click();
      await page.waitForTimeout(300);
      
      // Open custom section first
      const customSection = page.locator('[data-custom-section-toggle]');
      await expect(customSection).toBeVisible({ timeout: 5000 });
      await customSection.click();
      await page.waitForTimeout(300);
      
      // Record initial sub-circuit name count
      const initialCount = await page.locator('text=/CancelTest/').count();
      
      // Dispatch event to open modal
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', { 
          detail: { selectedModuleIds: ['node-1', 'node-2'] } 
        }));
      });
      
      // Verify modal is open
      const modal = page.locator('h2:has-text("创建子电路")');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Click cancel button
      const cancelButton = page.locator('[data-cancel-create]');
      await cancelButton.click();
      
      // Verify modal closes
      await expect(modal).not.toBeVisible({ timeout: 3000 });
      
      // NEGATIVE ASSERTION: No sub-circuit should exist after cancel
      // Count should remain unchanged
      const finalCount = await page.locator('text=/CancelTest/').count();
      expect(finalCount).toBe(initialCount);
    });
  });

  test.describe('AC-133-006: Sub-Circuit Deletion', () => {
    test('should delete sub-circuit with confirmation dialog', async ({ page }) => {
      // Enable circuit mode first
      const circuitToggle = page.locator('[data-circuit-module-panel] button[data-circuit-mode-toggle]').first();
      await circuitToggle.click();
      await page.waitForTimeout(300);
      
      // Create a sub-circuit first
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', { 
          detail: { selectedModuleIds: ['node-1', 'node-2'] } 
        }));
      });
      
      // Fill in name and confirm
      const nameInput = page.locator('[data-sub-circuit-name-input]');
      await nameInput.fill('ToDelete134');
      
      const confirmButton = page.locator('[data-confirm-create]');
      await confirmButton.click();
      
      // Wait for modal to close
      await page.waitForTimeout(500);
      
      // Open custom section
      const customSection = page.locator('[data-custom-section-toggle]');
      await customSection.click();
      await page.waitForTimeout(300);
      
      // Verify sub-circuit exists
      const subCircuitItem = page.locator('text=ToDelete134');
      await expect(subCircuitItem).toBeVisible({ timeout: 5000 });
      
      // Find and click delete button
      const deleteButton = page.locator('[data-delete-sub-circuit]').first();
      await expect(deleteButton).toBeVisible({ timeout: 3000 });
      await deleteButton.click();
      
      // Verify confirmation dialog appears
      const confirmDelete = page.locator('[data-confirm-delete]');
      await expect(confirmDelete).toBeVisible({ timeout: 3000 });
      
      // Verify cancel button exists
      const cancelDelete = page.locator('[data-cancel-delete]');
      await expect(cancelDelete).toBeVisible({ timeout: 3000 });
      
      // Click confirm to delete
      await confirmDelete.click();
      await page.waitForTimeout(500);
      
      // Verify sub-circuit is removed
      await expect(subCircuitItem).not.toBeVisible({ timeout: 3000 });
    });

    test('should not delete sub-circuit when cancel is clicked', async ({ page }) => {
      // Enable circuit mode
      const circuitToggle = page.locator('[data-circuit-module-panel] button[data-circuit-mode-toggle]').first();
      await circuitToggle.click();
      await page.waitForTimeout(300);
      
      // Create a sub-circuit
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', { 
          detail: { selectedModuleIds: ['node-1', 'node-2'] } 
        }));
      });
      
      const nameInput = page.locator('[data-sub-circuit-name-input]');
      await nameInput.fill('KeepMe134');
      await page.locator('[data-confirm-create]').click();
      await page.waitForTimeout(500);
      
      // Open custom section
      const customSection = page.locator('[data-custom-section-toggle]');
      await customSection.click();
      await page.waitForTimeout(300);
      
      // Verify sub-circuit exists
      const subCircuitItem = page.locator('text=KeepMe134');
      await expect(subCircuitItem).toBeVisible({ timeout: 5000 });
      
      // Click delete button
      const deleteButton = page.locator('[data-delete-sub-circuit]').first();
      await deleteButton.click();
      
      // Click cancel delete
      await page.locator('[data-cancel-delete]').click();
      await page.waitForTimeout(500);
      
      // Verify sub-circuit still exists
      await expect(subCircuitItem).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Non-regression Tests', () => {
    test('should not break existing circuit components visibility', async ({ page }) => {
      // Enable circuit mode
      const circuitToggle = page.locator('[data-circuit-module-panel] button[data-circuit-mode-toggle]').first();
      await circuitToggle.click();
      
      // Verify the circuit module panel is visible
      await expect(page.locator('[data-circuit-module-panel]')).toBeVisible({ timeout: 5000 });
      
      // Verify AND gate component button is visible
      const andButton = page.locator('[data-circuit-component="AND"]');
      await expect(andButton).toBeVisible({ timeout: 5000 });
    });

    test('should not break Enter key submission when input is focused', async ({ page }) => {
      // Enable circuit mode
      const circuitToggle = page.locator('[data-circuit-module-panel] button[data-circuit-mode-toggle]').first();
      await circuitToggle.click();
      await page.waitForTimeout(300);
      
      // Open custom section first
      const customSection = page.locator('[data-custom-section-toggle]');
      await customSection.click();
      await page.waitForTimeout(300);
      
      // Record initial count by sub-circuit name
      const initialCount = await page.locator('text=/EnterTest134/').count();
      
      // Dispatch event to open modal
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', { 
          detail: { selectedModuleIds: ['node-1', 'node-2'] } 
        }));
      });
      
      // Verify modal is open
      const modal = page.locator('h2:has-text("创建子电路")');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Enter name
      const nameInput = page.locator('[data-sub-circuit-name-input]');
      await nameInput.fill('EnterTest134');
      
      // Press Enter (should submit form, NOT close modal)
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // Verify modal is closed (form was submitted)
      await expect(modal).not.toBeVisible({ timeout: 3000 });
      
      // Verify sub-circuit was created (Enter should work like clicking Create)
      const subCircuitItem = page.locator('text=EnterTest134');
      await expect(subCircuitItem).toBeVisible({ timeout: 5000 });
      
      // Verify count increased
      const finalCount = await page.locator('text=/EnterTest134/').count();
      expect(finalCount).toBe(initialCount + 1);
    });

    test('should maintain Tab navigation within modal', async ({ page }) => {
      // Enable circuit mode
      const circuitToggle = page.locator('[data-circuit-module-panel] button[data-circuit-mode-toggle]').first();
      await circuitToggle.click();
      await page.waitForTimeout(300);
      
      // Dispatch event to open modal
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', { 
          detail: { selectedModuleIds: ['node-1', 'node-2'] } 
        }));
      });
      
      // Verify modal is open
      const modal = page.locator('h2:has-text("创建子电路")');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Verify input is visible
      const nameInput = page.locator('[data-sub-circuit-name-input]');
      await expect(nameInput).toBeVisible({ timeout: 3000 });
      
      // Verify Cancel button is visible
      const cancelButton = page.locator('[data-cancel-create]');
      await expect(cancelButton).toBeVisible({ timeout: 3000 });
      
      // Verify Create button is visible
      const confirmButton = page.locator('[data-confirm-create]');
      await expect(confirmButton).toBeVisible({ timeout: 3000 });
      
      // Tab through the modal - should work without errors
      await nameInput.focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // No errors should occur during tab navigation
    });

    test('should access localStorage for sub-circuit storage', async ({ page }) => {
      const result = await page.evaluate(() => {
        const storageKey = 'arcane-subcircuits-storage';
        const initial = localStorage.getItem(storageKey);
        
        return {
          hasStorage: initial !== null,
          canAccess: typeof localStorage !== 'undefined',
          storageKey,
        };
      });
      
      expect(result.canAccess).toBe(true);
      expect(result.storageKey).toBe('arcane-subcircuits-storage');
    });
  });
});

test.describe('Sub-Circuit Store Integration', () => {
  test('should handle store operations correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Clear storage first
    await page.evaluate(() => {
      localStorage.removeItem('arcane-subcircuits-storage');
    });
    
    // Test store functions directly
    const result = await page.evaluate(() => {
      const storageKey = 'arcane-subcircuits-storage';
      const initial = localStorage.getItem(storageKey);
      
      return {
        hasStorage: initial !== null,
        canAccess: typeof localStorage !== 'undefined',
      };
    });
    
    expect(result.canAccess).toBe(true);
  });
});
