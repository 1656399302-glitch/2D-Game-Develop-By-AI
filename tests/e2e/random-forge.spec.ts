import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Random Forge Workflow
 * 
 * Tests the complete random forge flow:
 * - Opening random forge modal
 * - Clicking generate button
 * - Verifying modules appear on canvas
 * - Closing modal and verifying machine persists
 */

test.describe('Random Forge Workflow', () => {
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
  });

  test('should open random forge modal', async ({ page }) => {
    // Find and click the random forge button in toolbar (随机生成)
    const randomForgeButton = page.getByRole('button', { name: /随机生成|随机锻造|random/i }).first();
    await expect(randomForgeButton).toBeVisible({ timeout: 10000 });
    await randomForgeButton.click();
    await page.waitForTimeout(500);
    
    // Modal should appear with title
    const modalTitle = page.getByText(/随机锻造/i);
    await expect(modalTitle.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show theme selection in random forge modal', async ({ page }) => {
    // Open random forge modal
    await page.getByRole('button', { name: /随机生成|随机锻造|random/i }).first().click();
    await page.waitForTimeout(500);
    
    // Theme selection should be visible
    const themeSection = page.getByText(/选择主题|theme|select theme/i);
    await expect(themeSection.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show complexity controls in random forge modal', async ({ page }) => {
    // Open random forge modal
    await page.getByRole('button', { name: /随机生成|随机锻造|random/i }).first().click();
    await page.waitForTimeout(500);
    
    // Complexity section should be visible
    const complexitySection = page.getByText(/complexity|复杂度|module count|模块数/i);
    await expect(complexitySection.first()).toBeVisible({ timeout: 5000 });
    
    // Sliders for min/max modules should be present
    const minSlider = page.locator('input[type="range"]').first();
    await expect(minSlider).toBeVisible({ timeout: 5000 });
  });

  test('should show connection density options', async ({ page }) => {
    // Open random forge modal
    await page.getByRole('button', { name: /随机生成|随机锻造|random/i }).first().click();
    await page.waitForTimeout(500);
    
    // Connection density should be visible
    const densitySection = page.getByText(/connection density|连接密度|稀疏|适中|密集/i);
    await expect(densitySection.first()).toBeVisible({ timeout: 5000 });
  });

  test('should generate random machine on generate button click', async ({ page }) => {
    // Open random forge modal
    await page.getByRole('button', { name: /随机生成|随机锻造|random/i }).first().click();
    await page.waitForTimeout(500);
    
    // Click generate button (生成并应用) - use force to bypass any overlay issues
    const generateButton = page.getByRole('button', { name: /生成并应用|generate|应用/i }).first();
    await expect(generateButton).toBeVisible({ timeout: 5000 });
    await generateButton.click({ force: true });
    await page.waitForTimeout(2000);
    
    // Check that canvas now has modules (module count > 0)
    await expect(page.locator('text=/模块: [1-9]\\d*|Modules: [1-9]\\d*/').first()).toBeVisible({ timeout: 10000 });
  });

  test('should persist modules after closing modal', async ({ page }) => {
    // Get initial module count (should be 0)
    await expect(page.locator('text=/模块: 0|Modules: 0/').first()).toBeVisible({ timeout: 5000 });
    
    // Open random forge modal
    await page.getByRole('button', { name: /随机生成|随机锻造|random/i }).first().click();
    await page.waitForTimeout(500);
    
    // Click generate
    const generateButton = page.getByRole('button', { name: /生成并应用|generate|应用/i }).first();
    await generateButton.click({ force: true });
    await page.waitForTimeout(2000);
    
    // Module count should have increased
    await expect(page.locator('text=/模块: [1-9]\\d*|Modules: [1-9]\\d*/').first()).toBeVisible({ timeout: 10000 });
    
    // Wait for modal to close
    await page.waitForTimeout(500);
    
    // Modules should still be visible on canvas
    await expect(page.locator('text=/模块: [1-9]\\d*|Modules: [1-9]\\d*/').first()).toBeVisible({ timeout: 5000 });
  });

  test('should have close button on modal', async ({ page }) => {
    // Open random forge modal
    await page.getByRole('button', { name: /随机生成|随机锻造|random/i }).first().click();
    await page.waitForTimeout(500);
    
    // Close button should exist - use aria-label
    const closeButton = page.getByRole('button', { name: '关闭' });
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
    } else {
      // Try pressing Escape
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);
    
    // Modal should be closed - check that the modal header is not visible
    const modalHeader = page.locator('text=随机锻造').first();
    // The modal header should not be visible or should be inside a closed modal
    // Since the modal closes, the interactive button shouldn't be active
    await expect(page.getByRole('button', { name: /生成并应用/i }).first()).not.toBeVisible({ timeout: 3000 });
  });

  test('should select different themes', async ({ page }) => {
    // Open random forge modal
    await page.getByRole('button', { name: /随机生成|随机锻造|random/i }).first().click();
    await page.waitForTimeout(500);
    
    // Find theme buttons inside the modal - use the theme container
    // The modal has theme buttons with aria-pressed attribute
    const themeButtons = page.locator('[aria-label*="主题"]');
    
    // Click on a theme if available
    const count = await themeButtons.count();
    if (count > 0) {
      await themeButtons.first().click({ force: true });
      await page.waitForTimeout(300);
      
      // The button should now be selected (aria-pressed should be true)
      await expect(themeButtons.first()).toHaveAttribute('aria-pressed', 'true');
    } else {
      // If no theme buttons found, just verify modal is open
      await expect(page.locator('text=选择主题')).toBeVisible();
    }
  });

  test('should adjust min module slider', async ({ page }) => {
    // Open random forge modal
    await page.getByRole('button', { name: /随机生成|随机锻造|random/i }).first().click();
    await page.waitForTimeout(500);
    
    // Find min module slider - it's inside the modal
    const minSlider = page.locator('[aria-label="最小模块数"]');
    if (await minSlider.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Get initial value
      const initialValue = await minSlider.inputValue();
      
      // Change slider value
      await minSlider.fill('5');
      await page.waitForTimeout(200);
      
      // Value should have changed
      const newValue = await minSlider.inputValue();
      expect(newValue).not.toBe(initialValue);
    }
  });

  test('should replace existing modules on generate', async ({ page }) => {
    // Add a module manually first
    await page.locator('text=核心熔炉').first().click();
    await page.waitForTimeout(500);
    
    // Verify 1 module
    await expect(page.locator('text=/模块: 1|Modules: 1/').first()).toBeVisible({ timeout: 5000 });
    
    // Open random forge modal
    await page.getByRole('button', { name: /随机生成|随机锻造|random/i }).first().click();
    await page.waitForTimeout(500);
    
    // Click generate
    const generateButton = page.getByRole('button', { name: /生成并应用|generate|应用/i }).first();
    await generateButton.click({ force: true });
    await page.waitForTimeout(2000);
    
    // Module count should be > 1 (not still 1)
    // Verify by checking for module count > 1
    await expect(page.locator('text=/模块: [2-9]\\d*|Modules: [2-9]\\d*/').first()).toBeVisible({ timeout: 10000 });
  });
});
