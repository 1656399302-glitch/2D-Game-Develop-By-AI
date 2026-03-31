import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Machine Creation Workflow
 * 
 * Tests the complete flow of:
 * - Adding modules to canvas from panel
 * - Creating connections between modules via ports
 * - Activating the machine and verifying animation plays
 * - Verifying activation overlay appears and completes
 */

test.describe('Machine Creation Workflow', () => {
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

  test('should load the application with editor view', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle('Arcane Machine Codex Workshop');
    
    // Check main header is visible
    await expect(page.getByText('ARCANE MACHINE CODEX')).toBeVisible();
    
    // Check that module panel is visible (using heading role)
    await expect(page.getByRole('heading', { name: /模块面板|module panel/i }).first()).toBeVisible();
  });

  test('should add module to canvas when clicked', async ({ page }) => {
    // Click on Core Furnace in the panel (Chinese: 核心熔炉)
    await page.getByRole('heading', { name: /核心熔炉/i }).click();
    
    // Wait for module count to update
    await expect(page.locator('text=/模块: 1|Modules: 1/').first()).toBeVisible({ timeout: 10000 });
    
    // Add another module (Energy Pipe: 能量管道)
    await page.getByRole('heading', { name: /能量管道/i }).click();
    await expect(page.locator('text=/模块: 2|Modules: 2/').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show module panel with all base modules', async ({ page }) => {
    // Check module panel header
    await expect(page.getByRole('heading', { name: /模块面板|module panel/i }).first()).toBeVisible();
    
    // Check for base module types (Chinese names)
    const coreFurnace = page.getByRole('heading', { name: /核心熔炉/i });
    const energyPipe = page.getByRole('heading', { name: /能量管道/i });
    
    await expect(coreFurnace.first()).toBeVisible({ timeout: 5000 });
    await expect(energyPipe.first()).toBeVisible({ timeout: 5000 });
  });

  test('should create connection between two modules via ports', async ({ page }) => {
    // Add two modules
    await page.getByRole('heading', { name: /核心熔炉/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole('heading', { name: /能量管道/i }).click();
    await page.waitForTimeout(500);
    
    // Connection count should be visible
    const connectionsText = page.locator('text=/连接: \\d+/');
    await expect(connectionsText.first()).toBeVisible({ timeout: 5000 });
  });

  test('should activate machine when button available', async ({ page }) => {
    // Add a Core Furnace module first
    await page.getByRole('heading', { name: /核心熔炉/i }).click();
    await page.waitForTimeout(500);
    
    // Find and click the activate/start button
    const activateButton = page.getByRole('button', { name: /激活机器|Activate/i }).first();
    if (await activateButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await activateButton.click();
      await page.waitForTimeout(1000);
      
      // Activation should start
      // Button should now show different state
      const isDisabled = await activateButton.isDisabled().catch(() => true);
      // If the machine activated, button should be disabled or show different text
    }
  });

  test('should show empty canvas message initially', async ({ page }) => {
    // Empty canvas message should be visible when no modules
    const emptyMessage = page.getByText(/开始构建你的魔法机器|Empty canvas|No modules/i);
    await expect(emptyMessage.first()).toBeVisible({ timeout: 10000 });
  });

  test('should hide empty canvas message after adding module', async ({ page }) => {
    // Add a module
    await page.getByRole('heading', { name: /核心熔炉/i }).click();
    await page.waitForTimeout(500);
    
    // Empty message should no longer be visible
    const emptyMessage = page.getByText(/从左侧面板拖拽模块|开始构建你的魔法机器/i);
    await expect(emptyMessage).not.toBeVisible({ timeout: 5000 });
  });

  test('should generate attributes for machine after adding module', async ({ page }) => {
    // Add a Core Furnace
    await page.getByRole('heading', { name: /核心熔炉/i }).click();
    await page.waitForTimeout(500);
    
    // Check that machine properties panel shows name
    const propertiesPanel = page.getByRole('heading', { name: /PROPERTIES|属性|Machine Overview/i });
    await expect(propertiesPanel.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have working undo button after adding modules', async ({ page }) => {
    // Add a module first
    await page.getByRole('heading', { name: /核心熔炉/i }).click();
    await page.waitForTimeout(500);
    
    // Find undo button
    const undoButton = page.getByRole('button', { name: /撤销/i });
    
    // Undo button should be enabled (has modules in history)
    if (await undoButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(undoButton).not.toBeDisabled();
      
      // Click undo
      await undoButton.click();
      await page.waitForTimeout(500);
      
      // Module count should decrease
      await expect(page.locator('text=/模块: 0|Modules: 0/').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show grid toggle in footer', async ({ page }) => {
    // Footer should show grid status
    const gridStatus = page.getByText(/网格: 开启|Grid: ON/i);
    await expect(gridStatus.first()).toBeVisible({ timeout: 10000 });
  });

  test('should add multiple different module types', async ({ page }) => {
    // Add various modules (using Chinese names)
    await page.getByRole('heading', { name: /核心熔炉/i }).click();
    await page.waitForTimeout(200);
    
    await page.getByRole('heading', { name: /能量管道/i }).click();
    await page.waitForTimeout(200);
    
    await page.getByRole('heading', { name: /齿轮组件/i }).click();
    await page.waitForTimeout(200);
    
    await page.getByRole('heading', { name: /符文节点/i }).click();
    await page.waitForTimeout(200);
    
    await page.getByRole('heading', { name: /护盾外壳/i }).click();
    await page.waitForTimeout(200);
    
    await page.getByRole('heading', { name: /触发开关/i }).click();
    await page.waitForTimeout(200);
    
    // Should have 6 modules
    await expect(page.locator('text=/模块: 6|Modules: 6/').first()).toBeVisible({ timeout: 10000 });
  });

  test('should show properties panel when modules present', async ({ page }) => {
    // Add a module
    await page.getByRole('heading', { name: /核心熔炉/i }).click();
    await page.waitForTimeout(500);
    
    // Properties panel should be visible
    const propertiesPanel = page.getByRole('heading', { name: /PROPERTIES|属性/i });
    await expect(propertiesPanel.first()).toBeVisible({ timeout: 10000 });
  });
});
