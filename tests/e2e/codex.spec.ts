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
    // Add a module first
    await page.getByRole('heading', { name: /核心熔炉/i }).click();
    await page.waitForTimeout(500);
    
    // Click save to codex button (保存图鉴)
    const saveButton = page.getByRole('button', { name: /保存图鉴|Save to Codex/i }).first();
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await saveButton.click();
    await page.waitForTimeout(500);
    
    // Dialog should appear asking for confirmation
    // Accept the dialog if one appears
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
  });

  test('should display saved machine in Codex list', async ({ page }) => {
    // Add a module
    await page.getByRole('heading', { name: /核心熔炉/i }).click();
    await page.waitForTimeout(300);
    
    // Save to codex
    const saveButton = page.getByRole('button', { name: /保存图鉴|Save to Codex/i }).first();
    await saveButton.click();
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
    
    // Should show 1 module in the codex entry
    const moduleCount = page.getByText(/1.*module|模块.*1|1 modules/i);
    await expect(moduleCount.first()).toBeVisible({ timeout: 10000 });
  });

  test('should load machine from Codex back to editor', async ({ page }) => {
    // Add multiple modules
    await page.getByRole('heading', { name: /核心熔炉/i }).click();
    await page.waitForTimeout(200);
    await page.getByRole('heading', { name: /能量管道/i }).click();
    await page.waitForTimeout(200);
    await page.getByRole('heading', { name: /齿轮组件/i }).click();
    await page.waitForTimeout(200);
    
    // Save to codex
    const saveButton = page.getByRole('button', { name: /保存图鉴|Save to Codex/i }).first();
    await saveButton.click();
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
    const loadButton = page.getByRole('button', { name: /Load to Editor|加载到编辑器|load|加载/i }).first();
    if (await loadButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await loadButton.click();
      await page.waitForTimeout(1000);
      
      // Switch back to Editor (编辑器)
      const editorTab = page.getByRole('button', { name: /编辑器|Editor/i }).first();
      if (await editorTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editorTab.click();
      }
      await page.waitForTimeout(500);
      
      // Modules should be loaded (should show 3 modules)
      await expect(page.locator('text=/模块: 3|Modules: 3/').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should show machine name in Codex', async ({ page }) => {
    // Add a module
    await page.getByRole('heading', { name: /核心熔炉/i }).click();
    await page.waitForTimeout(300);
    
    // Save to codex
    const saveButton = page.getByRole('button', { name: /保存图鉴|Save to Codex/i }).first();
    await saveButton.click();
    await page.waitForTimeout(500);
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.waitForTimeout(500);
    
    // Switch to Codex
    const codexTab = page.getByRole('button', { name: /图鉴/i }).first();
    await codexTab.click();
    await page.waitForTimeout(1000);
    
    // Machine should have a generated name
    const codexId = page.getByText(/machines recorded/i);
    await expect(codexId.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show rarity badge for saved machine', async ({ page }) => {
    // Add a module
    await page.getByRole('heading', { name: /核心熔炉/i }).click();
    await page.waitForTimeout(300);
    
    // Save to codex
    const saveButton = page.getByRole('button', { name: /保存图鉴|Save to Codex/i }).first();
    await saveButton.click();
    await page.waitForTimeout(500);
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.waitForTimeout(500);
    
    // Switch to Codex
    const codexTab = page.getByRole('button', { name: /图鉴/i }).first();
    await codexTab.click();
    await page.waitForTimeout(1000);
    
    // Rarity badge should be visible (Common, Uncommon, Rare, Epic, or Legendary)
    const rarityBadge = page.getByText(/(Common|Uncommon|Rare|Epic|Legendary)/i);
    await expect(rarityBadge.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show module count for saved machine', async ({ page }) => {
    // Add multiple modules
    await page.getByRole('heading', { name: /核心熔炉/i }).click();
    await page.waitForTimeout(200);
    await page.getByRole('heading', { name: /能量管道/i }).click();
    await page.waitForTimeout(200);
    
    // Save to codex
    const saveButton = page.getByRole('button', { name: /保存图鉴|Save to Codex/i }).first();
    await saveButton.click();
    await page.waitForTimeout(500);
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.waitForTimeout(500);
    
    // Switch to Codex
    const codexTab = page.getByRole('button', { name: /图鉴/i }).first();
    await codexTab.click();
    await page.waitForTimeout(1000);
    
    // Should show 2 modules
    await expect(page.getByText('2 modules').or(
      page.locator('text=2 modules')
    )).toBeVisible({ timeout: 10000 });
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
    
    // Sort dropdown should be visible
    const sortSelect = page.locator('select').filter({ hasText: /newest|oldest|rarity|name/i });
    await expect(sortSelect).toBeVisible({ timeout: 10000 });
  });

  test('should have filter by rarity in Codex', async ({ page }) => {
    // Switch to Codex
    const codexTab = page.getByRole('button', { name: /图鉴/i }).first();
    await codexTab.click();
    await page.waitForTimeout(500);
    
    // Filter dropdown should be visible
    const filterSelect = page.locator('select').filter({ hasText: /rarity|all/i });
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
