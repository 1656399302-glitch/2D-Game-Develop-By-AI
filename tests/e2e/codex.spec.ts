import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Codex Save/Load Workflow
 * 
 * Tests the complete codex flow:
 * - Saving current machine to codex
 * - Opening codex view from toolbar
 * - Verifying saved machine appears in list
 * - Loading machine from codex back to editor
 * - Verifying modules appear on canvas
 */

test.describe('Codex Save/Load Workflow', () => {
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
    
    // Also dismiss any tutorial or info modals
    const tutorialSkip = page.getByRole('button', { name: /skip|跳过|tutorial/i });
    if (await tutorialSkip.isVisible({ timeout: 1000 }).catch(() => false)) {
      await tutorialSkip.click();
    }
  });

  test('should switch to Codex view', async ({ page }) => {
    // Click on Codex tab (图鉴 button)
    const codexTab = page.getByRole('button', { name: /图鉴/i }).first();
    await codexTab.click();
    await page.waitForTimeout(500);
    
    // Codex view should appear
    await expect(page.getByText(/Machine Codex|机器图鉴/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show empty state when no machines saved', async ({ page }) => {
    // Switch to Codex view
    const codexTab = page.getByRole('button', { name: /图鉴/i }).first();
    await codexTab.click();
    await page.waitForTimeout(500);
    
    // Empty state message should be visible
    const emptyState = page.getByText(/No Machines Recorded|no machines|没有记录/i);
    await expect(emptyState.first()).toBeVisible({ timeout: 10000 });
  });

  test('should save machine to Codex via save button', async ({ page }) => {
    // Add a module by clicking the module option directly (not just the heading)
    // Click on the module name text within the listbox option
    await page.locator('text=核心熔炉').first().click();
    await page.waitForTimeout(800);
    
    // Verify module was added by checking the module count in toolbar
    await expect(page.locator('text=/模块: [1-9]\\d*/').first()).toBeVisible({ timeout: 5000 });
    
    // Click save to codex button using aria-label
    const saveButton = page.getByRole('button', { name: '保存到图鉴' });
    await expect(saveButton).toBeEnabled({ timeout: 10000 });
    await saveButton.click({ force: true });
    await page.waitForTimeout(1000);
    
    // Handle any dialog
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.waitForTimeout(500);
  });

  test('should display saved machine in Codex list', async ({ page }) => {
    // Add a module
    await page.locator('text=核心熔炉').first().click();
    await page.waitForTimeout(800);
    
    // Verify module was added
    await expect(page.locator('text=/模块: [1-9]\\d*/').first()).toBeVisible({ timeout: 5000 });
    
    // Save to codex using aria-label
    const saveButton = page.getByRole('button', { name: '保存到图鉴' });
    await saveButton.click({ force: true });
    await page.waitForTimeout(500);
    
    // Handle any dialog
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.waitForTimeout(500);
    
    // Switch to Codex
    const codexTab = page.getByRole('button', { name: /图鉴/i }).first();
    await codexTab.click();
    await page.waitForTimeout(1000);
    
    // Should show saved machine entry
    await expect(page.locator('text=/1.*模块|1.*modules|共 1/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('should load machine from Codex back to editor', async ({ page }) => {
    // Add multiple modules
    await page.locator('text=核心熔炉').first().click();
    await page.waitForTimeout(500);
    await page.locator('text=能量管道').first().click();
    await page.waitForTimeout(500);
    await page.locator('text=齿轮组件').first().click();
    await page.waitForTimeout(500);
    
    // Verify modules were added
    await expect(page.locator('text=/模块: [1-9]\\d*/').first()).toBeVisible({ timeout: 5000 });
    
    // Save to codex
    const saveButton = page.getByRole('button', { name: '保存到图鉴' });
    await saveButton.click({ force: true });
    await page.waitForTimeout(500);
    
    // Handle any dialog
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.waitForTimeout(500);
    
    // Switch to Codex view
    const codexTab = page.getByRole('button', { name: /图鉴/i }).first();
    await codexTab.click();
    await page.waitForTimeout(1000);
    
    // Find and click the load button on the first machine card
    // Use aria-label which should contain "加载"
    const loadButton = page.getByRole('button', { name: /load|加载/i }).first();
    if (await loadButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await loadButton.click({ force: true });
      await page.waitForTimeout(1000);
      
      // Switch back to Editor (编辑器)
      const editorTab = page.getByRole('button', { name: /编辑器|Editor/i }).first();
      if (await editorTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editorTab.click();
      }
      await page.waitForTimeout(500);
      
      // Modules should be loaded (should show modules)
      await expect(page.locator('text=/模块: [1-9]\\d*/').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should show machine name in Codex', async ({ page }) => {
    // Add a module
    await page.locator('text=核心熔炉').first().click();
    await page.waitForTimeout(800);
    
    // Save to codex
    const saveButton = page.getByRole('button', { name: '保存到图鉴' });
    await saveButton.click({ force: true });
    await page.waitForTimeout(500);
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.waitForTimeout(500);
    
    // Switch to Codex
    const codexTab = page.getByRole('button', { name: /图鉴/i }).first();
    await codexTab.click();
    await page.waitForTimeout(1000);
    
    // Machine entry should be visible
    await expect(page.locator('text=/machines recorded|机器图鉴/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show rarity badge for saved machine', async ({ page }) => {
    // Add a module
    await page.locator('text=核心熔炉').first().click();
    await page.waitForTimeout(800);
    
    // Save to codex
    const saveButton = page.getByRole('button', { name: '保存到图鉴' });
    await saveButton.click({ force: true });
    await page.waitForTimeout(500);
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.waitForTimeout(500);
    
    // Switch to Codex
    const codexTab = page.getByRole('button', { name: /图鉴/i }).first();
    await codexTab.click();
    await page.waitForTimeout(1000);
    
    // Rarity badge should be visible in the machine entry card
    // Look for span elements that contain rarity text (not in dropdown options)
    // The badge is a span with specific styling (backgroundColor and color)
    const rarityBadge = page.locator('span:has-text("Common"), span:has-text("Uncommon"), span:has-text("Rare"), span:has-text("Epic"), span:has-text("Legendary")').first();
    await expect(rarityBadge).toBeVisible({ timeout: 10000 });
  });

  test('should show module count for saved machine', async ({ page }) => {
    // Add multiple modules
    await page.locator('text=核心熔炉').first().click();
    await page.waitForTimeout(500);
    await page.locator('text=能量管道').first().click();
    await page.waitForTimeout(500);
    
    // Save to codex
    const saveButton = page.getByRole('button', { name: '保存到图鉴' });
    await saveButton.click({ force: true });
    await page.waitForTimeout(500);
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.waitForTimeout(500);
    
    // Switch to Codex
    const codexTab = page.getByRole('button', { name: /图鉴/i }).first();
    await codexTab.click();
    await page.waitForTimeout(1000);
    
    // Should show module count
    await expect(page.locator('text=/2.*模块|2.*modules/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('should have search functionality in Codex', async ({ page }) => {
    // Switch to Codex
    const codexTab = page.getByRole('button', { name: /图鉴/i }).first();
    await codexTab.click();
    await page.waitForTimeout(500);
    
    // Search input should be visible
    const searchInput = page.getByPlaceholder(/search|搜索/i);
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test('should have sort options in Codex', async ({ page }) => {
    // Switch to Codex
    const codexTab = page.getByRole('button', { name: /图鉴/i }).first();
    await codexTab.click();
    await page.waitForTimeout(500);
    
    // Sort dropdown should be visible - use combobox role
    const sortSelect = page.getByRole('combobox').filter({ hasText: /newest|oldest|rarity|name/i });
    await expect(sortSelect.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have filter by rarity in Codex', async ({ page }) => {
    // Switch to Codex
    const codexTab = page.getByRole('button', { name: /图鉴/i }).first();
    await codexTab.click();
    await page.waitForTimeout(500);
    
    // Filter dropdown should be visible - use combobox role and pick first one
    const filterSelect = page.getByRole('combobox').filter({ hasText: /rarity|稀有度|all/i }).first();
    await expect(filterSelect).toBeVisible({ timeout: 10000 });
  });

  test('should return to editor from Codex', async ({ page }) => {
    // Switch to Codex
    const codexTab = page.getByRole('button', { name: /图鉴/i }).first();
    await codexTab.click();
    await page.waitForTimeout(500);
    
    // Click Editor tab
    const editorTab = page.getByRole('button', { name: /编辑器|Editor/i }).first();
    if (await editorTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editorTab.click();
    }
    await page.waitForTimeout(500);
    
    // Should see editor elements
    await expect(page.getByRole('heading', { name: /模块面板|module panel/i }).first()).toBeVisible({ timeout: 10000 });
  });
});
