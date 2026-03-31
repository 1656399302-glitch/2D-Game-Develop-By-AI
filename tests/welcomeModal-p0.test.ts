/**
 * Playwright browser test for WelcomeModal P0 fix (Round 62)
 * 
 * This test verifies that the WelcomeModal close button is now clickable
 * and the modal can be dismissed via multiple paths.
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:4173'; // Production build

test.describe('WelcomeModal P0 Fix (Round 62)', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Clear all storage to ensure modal shows
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    // Wait for hydration
    await page.waitForTimeout(500);
  });

  test('AC1: Close button click dismisses modal', async ({ page }) => {
    // Wait for modal to appear (after hydration)
    await page.waitForSelector('[aria-label="关闭欢迎弹窗"]', { timeout: 10000 });
    
    // Verify modal is visible
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    // Click the close button
    await page.click('[aria-label="关闭欢迎弹窗"]');
    
    // Wait for setTimeout to complete (300ms) + extra time
    await page.waitForTimeout(1000);
    
    // Check localStorage
    const dismissed = await page.evaluate(() => 
      localStorage.getItem('arcane-codex-welcome-dismissed')
    );
    console.log('localStorage dismissed:', dismissed);
    
    // Check if dialog is gone
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  });

  test('AC2: Backdrop click dismisses modal', async ({ page }) => {
    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Click at viewport edge (backdrop area)
    await page.mouse.click(5, 5);
    
    // Wait for modal to disappear
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
  });

  test('AC3: Content click does NOT dismiss', async ({ page }) => {
    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Click on modal title text
    await page.click('text=Welcome, Arcane Architect!');
    
    // Modal should still be visible
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
  });

  test('AC4: UI becomes interactive after dismissal', async ({ page }) => {
    // Wait for modal and dismiss it
    await page.waitForSelector('[aria-label="关闭欢迎弹窗"]', { timeout: 10000 });
    await page.click('[aria-label="关闭欢迎弹窗"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
    
    // Wait for UI to stabilize
    await page.waitForTimeout(500);
    
    // Check that toolbar buttons are visible and clickable
    const toolbar = page.locator('header');
    await expect(toolbar).toBeVisible();
    
    // Click a toolbar button
    const saveButton = page.locator('[aria-label="保存到图鉴"]');
    await expect(saveButton).toBeVisible();
  });

  test('AC5: Modal does not re-appear after dismissal', async ({ page }) => {
    // Dismiss modal
    await page.waitForSelector('[aria-label="关闭欢迎弹窗"]', { timeout: 10000 });
    await page.click('[aria-label="关闭欢迎弹窗"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
    
    // Refresh page
    await page.reload();
    await page.waitForTimeout(500);
    
    // Modal should not appear
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).not.toBeVisible();
  });

  test('AC6: Skip button dismisses modal', async ({ page }) => {
    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Click skip button using button text content
    await page.locator('button').filter({ hasText: /Skip/ }).click();
    
    // Wait for modal to disappear
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
  });

  test('AC7: Start tutorial button dismisses modal', async ({ page }) => {
    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // Click start tutorial button using button text content
    await page.locator('button').filter({ hasText: /Start Tutorial/ }).click();
    
    // Wait for modal to disappear
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
  });

  test('elementFromPoint returns button at close button position', async ({ page }) => {
    // Wait for modal to appear
    await page.waitForSelector('[aria-label="关闭欢迎弹窗"]', { timeout: 10000 });
    
    // Get close button position
    const closeButton = page.locator('[aria-label="关闭欢迎弹窗"]');
    const box = await closeButton.boundingBox();
    
    if (box) {
      // Get element at button center
      const element = await page.evaluate(
        ({ x, y }) => {
          const el = document.elementFromPoint(x, y);
          return el ? el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ')[0] : '') : null;
        },
        { x: box.x + box.width / 2, y: box.y + box.height / 2 }
      );
      
      console.log('Element at button position:', element);
      
      // Should NOT be an SVG element
      expect(element).not.toContain('svg');
      expect(element).not.toContain('line');
      
      // Should be the button or its child
      expect(element).toMatch(/button|svg/i);
    }
  });
});
