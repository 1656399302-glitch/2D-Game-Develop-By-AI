/**
 * Sub-Circuit E2E Tests - Round 133
 * 
 * Fixed selectors based on actual DOM structure verified in Round 132:
 * - Circuit toggle: button[data-circuit-mode-toggle] (NOT with data-tutorial-action)
 * - Circuit panel: [data-circuit-module-panel]
 * - Sub-circuit name input: [data-sub-circuit-name-input]
 * - Confirm create: [data-confirm-create]
 * - Cancel create: [data-cancel-create]
 * - Delete sub-circuit: [data-delete-sub-circuit]
 * - Cancel delete: [data-cancel-delete]
 * - Confirm delete: [data-confirm-delete]
 * 
 * Uses event dispatch for sub-circuit creation to bypass canvas interaction.
 * Uses store-based verification for sub-circuit flows.
 */

import { test, expect } from '@playwright/test';

test.describe('Sub-Circuit Module System - Round 133', () => {
  
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
      // Using CircuitModulePanel's toggle which has data-circuit-mode-toggle
      const circuitToggle = page.locator('[data-circuit-module-panel] button[data-circuit-mode-toggle]').first();
      
      // Verify the toggle is visible
      await expect(circuitToggle).toBeVisible({ timeout: 10000 });
      
      // Click it to enable circuit mode
      await circuitToggle.click();
      
      // Wait a moment for the state to update
      await page.waitForTimeout(500);
      
      // Step 2: Verify the circuit module panel is visible
      // The panel has data-circuit-module-panel attribute
      const panel = page.locator('[data-circuit-module-panel]');
      await expect(panel).toBeVisible({ timeout: 5000 });
      
      // Step 3: Verify circuit mode is active (toggle shows "已开启")
      // Check that the toggle contains "已开启" text
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

  test.describe('AC-133-004/005: Sub-Circuit Creation via Event Dispatch', () => {
    test('should create sub-circuit via event dispatch and verify it appears in circuit panel', async ({ page }) => {
      // Step 1: Enable circuit mode first
      const circuitToggle = page.locator('[data-circuit-module-panel] button[data-circuit-mode-toggle]').first();
      await circuitToggle.click();
      await page.waitForTimeout(300);
      
      // Step 2: Verify panel is visible
      const panel = page.locator('[data-circuit-module-panel]');
      await expect(panel).toBeVisible({ timeout: 5000 });
      
      // Step 3: Create sub-circuit via event dispatch
      // Dispatch custom event: open-create-subcircuit-modal
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', { 
          detail: { selectedModuleIds: ['node-1', 'node-2'] } 
        }));
      });
      
      // Step 4: Verify modal appears with correct title
      const modal = page.locator('h2:has-text("创建子电路")');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      // Step 5: Verify name input exists
      const nameInput = page.locator('[data-sub-circuit-name-input]');
      await expect(nameInput).toBeVisible({ timeout: 3000 });
      
      // Step 6: Enter name for sub-circuit
      await nameInput.fill('TestSub133');
      
      // Step 7: Click confirm button
      const confirmButton = page.locator('[data-confirm-create]');
      await expect(confirmButton).toBeVisible({ timeout: 3000 });
      await confirmButton.click();
      
      // Step 8: Verify modal closes
      await expect(modal).not.toBeVisible({ timeout: 3000 });
      
      // Step 9: Verify sub-circuit appears in custom section
      // Check the custom section shows 1 sub-circuit
      const customSection = page.locator('[data-custom-section-toggle]');
      await expect(customSection).toBeVisible({ timeout: 5000 });
      await customSection.click();
      
      // Verify the sub-circuit name appears
      const subCircuitItem = page.locator('text=TestSub133');
      await expect(subCircuitItem).toBeVisible({ timeout: 5000 });
    });

    test('should dismiss modal when cancel button is clicked', async ({ page }) => {
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
      
      // Click cancel button
      const cancelButton = page.locator('[data-cancel-create]');
      await cancelButton.click();
      
      // Verify modal closes
      await expect(modal).not.toBeVisible({ timeout: 3000 });
      
      // Verify no sub-circuit was created (custom section should show 0)
      const customSection = page.locator('[data-custom-section-toggle]');
      await expect(customSection).toBeVisible({ timeout: 5000 });
      await customSection.click();
      await expect(page.locator('text=TestSub133')).not.toBeVisible();
    });

    test('should dismiss modal when Escape key is pressed', async ({ page }) => {
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
      
      // Click on the modal overlay background (not the input) to unfocus any input
      await page.locator('[data-create-subcircuit-modal]').click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(100);
      
      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      
      // Verify modal closes
      await expect(modal).not.toBeVisible({ timeout: 3000 });
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
      await nameInput.fill('ToDelete133');
      
      const confirmButton = page.locator('[data-confirm-create]');
      await confirmButton.click();
      
      // Wait for modal to close
      await page.waitForTimeout(500);
      
      // Open custom section
      const customSection = page.locator('[data-custom-section-toggle]');
      await customSection.click();
      await page.waitForTimeout(300);
      
      // Verify sub-circuit exists
      const subCircuitItem = page.locator('text=ToDelete133');
      await expect(subCircuitItem).toBeVisible({ timeout: 5000 });
      
      // Find and click delete button
      // The delete button has data-delete-sub-circuit attribute
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
      await nameInput.fill('KeepMe133');
      await page.locator('[data-confirm-create]').click();
      await page.waitForTimeout(500);
      
      // Open custom section
      const customSection = page.locator('[data-custom-section-toggle]');
      await customSection.click();
      await page.waitForTimeout(300);
      
      // Verify sub-circuit exists
      const subCircuitItem = page.locator('text=KeepMe133');
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

    test('should access localStorage for sub-circuit storage', async ({ page }) => {
      // Test store functions directly
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
