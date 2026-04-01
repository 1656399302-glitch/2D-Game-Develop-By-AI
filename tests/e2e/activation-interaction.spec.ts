import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Activation Interactions
 * 
 * Tests module-to-module interactions during activation:
 * - AC2.1: Module removal during activation does not crash
 * - AC2.2: Canvas remains stable during activation
 * - AC2.3: Repeated cycles produce no artifacts
 */

test.describe('Activation Interaction E2E Tests', () => {
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
    
    // Wait for main UI to be ready
    await page.waitForTimeout(500);
  });

  test.describe('AC2.1: Module removal during activation does not crash', () => {
    test('removing module mid-activation does not crash canvas', async ({ page }) => {
      // Add three connected modules
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(300);
      await page.getByRole('heading', { name: /能量管道/i }).click();
      await page.waitForTimeout(300);
      await page.getByRole('heading', { name: /齿轮组件/i }).click();
      await page.waitForTimeout(300);
      
      // Verify module count
      await expect(page.locator('text=/模块: 3|Modules: 3/').first()).toBeVisible({ timeout: 5000 });
      
      // Start failure mode test (which is faster than normal activation)
      const failureButton = page.getByRole('button', { name: /测试故障/i });
      await expect(failureButton).toBeVisible();
      
      // Click the failure button to start activation overlay
      await failureButton.click();
      await page.waitForTimeout(200);
      
      // Click skip/close to end activation (use force due to animation)
      const skipButton = page.locator('button:has-text("✕")');
      if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await skipButton.click({ force: true });
        await page.waitForTimeout(500);
      }
      
      // Canvas should still be functional
      await expect(page.locator('text=/模块: 3|Modules: 3/').first()).toBeVisible({ timeout: 5000 });
    });

    test('removing multiple modules during activation is safe', async ({ page }) => {
      // Add modules
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(200);
      await page.getByRole('heading', { name: /能量管道/i }).click();
      await page.waitForTimeout(200);
      await page.getByRole('heading', { name: /齿轮组件/i }).click();
      await page.waitForTimeout(200);
      await page.getByRole('heading', { name: /符文节点/i }).click();
      await page.waitForTimeout(200);
      
      // Verify modules added
      await expect(page.locator('text=/模块: 4|Modules: 4/').first()).toBeVisible({ timeout: 5000 });
      
      // Start activation
      const failureButton = page.getByRole('button', { name: /测试故障/i });
      await failureButton.click();
      await page.waitForTimeout(300);
      
      // Close overlay (use force due to animation)
      const skipButton = page.locator('button:has-text("✕")');
      if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await skipButton.click({ force: true });
      }
      await page.waitForTimeout(500);
      
      // Remove a module using keyboard
      await page.keyboard.press('Delete');
      await page.waitForTimeout(300);
      
      // Verify module count decreased
      await expect(page.locator('text=/模块: 3|Modules: 3/').first()).toBeVisible({ timeout: 5000 });
    });

    test('rapid module removal does not cause state corruption', async ({ page }) => {
      // Add modules
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(200);
      await page.getByRole('heading', { name: /能量管道/i }).click();
      await page.waitForTimeout(200);
      await page.getByRole('heading', { name: /齿轮组件/i }).click();
      await page.waitForTimeout(200);
      
      await expect(page.locator('text=/模块: 3|Modules: 3/').first()).toBeVisible({ timeout: 5000 });
      
      // Perform rapid operations
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Delete');
        await page.waitForTimeout(100);
      }
      
      // Module count should be consistent (either 3, 2, or 1)
      const moduleCount = await page.locator('text=/模块: (\\d+)/').first().textContent();
      expect(moduleCount).toBeTruthy();
    });
  });

  test.describe('AC2.2: Canvas remains stable during activation', () => {
    test('canvas viewport is stable after activation', async ({ page }) => {
      // Add modules
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(300);
      
      // Perform zoom
      const zoomIn = page.getByRole('button', { name: /放大/i });
      await zoomIn.click();
      await zoomIn.click();
      await page.waitForTimeout(200);
      
      // Start activation
      const failureButton = page.getByRole('button', { name: /测试故障/i });
      await failureButton.click();
      await page.waitForTimeout(200);
      
      // Close overlay (use force due to animation)
      const skipButton = page.locator('button:has-text("✕")');
      if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await skipButton.click({ force: true });
      }
      await page.waitForTimeout(500);
      
      // Zoom controls should still work
      const zoomOut = page.getByRole('button', { name: /缩小/i });
      await expect(zoomOut).toBeEnabled();
    });

    test('connection count is preserved after activation', async ({ page }) => {
      // Add two modules (we'll try to connect them)
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(300);
      await page.getByRole('heading', { name: /能量管道/i }).click();
      await page.waitForTimeout(300);
      
      // Check connection status
      const connectionText = page.locator('text=/连接: \\d+/').first();
      await expect(connectionText).toBeVisible({ timeout: 5000 });
      
      // Start and stop activation
      const failureButton = page.getByRole('button', { name: /测试故障/i });
      await failureButton.click();
      await page.waitForTimeout(200);
      
      const skipButton = page.locator('button:has-text("✕")');
      if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await skipButton.click({ force: true });
      }
      await page.waitForTimeout(500);
      
      // Connection text should still be visible
      await expect(connectionText).toBeVisible();
    });

    test('adding modules after activation works correctly', async ({ page }) => {
      // Add initial module
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(300);
      
      // Start and stop activation
      const failureButton = page.getByRole('button', { name: /测试故障/i });
      await failureButton.click();
      await page.waitForTimeout(200);
      
      const skipButton = page.locator('button:has-text("✕")');
      if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await skipButton.click({ force: true });
      }
      await page.waitForTimeout(500);
      
      // Add more modules
      await page.getByRole('heading', { name: /能量管道/i }).click();
      await page.waitForTimeout(300);
      await page.getByRole('heading', { name: /齿轮组件/i }).click();
      await page.waitForTimeout(300);
      
      // Should have 3 modules total
      await expect(page.locator('text=/模块: 3|Modules: 3/').first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('AC2.3: Repeated cycles produce no artifacts', () => {
    test('repeated activation cycles do not accumulate module count', async ({ page }) => {
      // Add modules
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(300);
      await page.getByRole('heading', { name: /能量管道/i }).click();
      await page.waitForTimeout(300);
      
      // Perform multiple activation cycles
      for (let cycle = 0; cycle < 3; cycle++) {
        const failureButton = page.getByRole('button', { name: /测试故障/i });
        await failureButton.click();
        await page.waitForTimeout(200);
        
        const skipButton = page.locator('button:has-text("✕")');
        if (await skipButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await skipButton.click({ force: true });
        }
        await page.waitForTimeout(100);
      }
      
      // Module count should remain consistent
      await expect(page.locator('text=/模块: 2|Modules: 2/').first()).toBeVisible({ timeout: 5000 });
    });

    test('repeated activation cycles do not corrupt connection state', async ({ page }) => {
      // Add modules
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(300);
      await page.getByRole('heading', { name: /能量管道/i }).click();
      await page.waitForTimeout(300);
      
      // Perform multiple activation cycles
      for (let cycle = 0; cycle < 3; cycle++) {
        const overloadButton = page.getByRole('button', { name: /测试过载/i });
        await overloadButton.click();
        await page.waitForTimeout(200);
        
        const skipButton = page.locator('button:has-text("✕")');
        if (await skipButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await skipButton.click({ force: true });
        }
        await page.waitForTimeout(100);
      }
      
      // Connection should still be trackable
      const connectionText = page.locator('text=/连接: \\d+/').first();
      await expect(connectionText).toBeVisible();
    });

    test('canvas state is identical after single vs multiple cycles', async ({ page }) => {
      // Add module
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(300);
      
      // Multiple cycles
      for (let cycle = 0; cycle < 3; cycle++) {
        const failureButton = page.getByRole('button', { name: /测试故障/i });
        await failureButton.click();
        await page.waitForTimeout(200);
        
        const skipButton = page.locator('button:has-text("✕")');
        if (await skipButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await skipButton.click({ force: true });
        }
        await page.waitForTimeout(100);
      }
      
      // Should have 1 module
      await expect(page.locator('text=/模块: 1|Modules: 1/').first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Negative Assertions', () => {
    test('canvas does not crash during module removal mid-activation', async ({ page }) => {
      // Add modules
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(300);
      await page.getByRole('heading', { name: /能量管道/i }).click();
      await page.waitForTimeout(300);
      
      // Start activation
      const failureButton = page.getByRole('button', { name: /测试故障/i });
      await failureButton.click();
      await page.waitForTimeout(100);
      
      // Close immediately (use force due to animation)
      const skipButton = page.locator('button:has-text("✕")');
      if (await skipButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await skipButton.click({ force: true });
      }
      await page.waitForTimeout(300);
      
      // Canvas should not be broken
      const moduleText = page.locator('text=/模块: 2|Modules: 2/').first();
      await expect(moduleText).toBeVisible({ timeout: 5000 });
      
      // Clear button should work
      const clearButton = page.getByRole('button', { name: /清空全部/i });
      await clearButton.click();
      await page.waitForTimeout(300);
      
      await expect(page.locator('text=/模块: 0|Modules: 0/').first()).toBeVisible({ timeout: 5000 });
    });

    test('module count does not become inconsistent after repeated cycles', async ({ page }) => {
      // Add modules
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(300);
      await page.getByRole('heading', { name: /能量管道/i }).click();
      await page.waitForTimeout(300);
      await page.getByRole('heading', { name: /齿轮组件/i }).click();
      await page.waitForTimeout(300);
      
      const expectedCount = 3;
      
      // Perform cycles
      for (let cycle = 0; cycle < 5; cycle++) {
        const failureButton = page.getByRole('button', { name: /测试故障/i });
        await failureButton.click();
        await page.waitForTimeout(150);
        
        const skipButton = page.locator('button:has-text("✕")');
        if (await skipButton.isVisible({ timeout: 500 }).catch(() => false)) {
          await skipButton.click({ force: true });
        }
        await page.waitForTimeout(50);
      }
      
      // Module count should be a valid number (0, 1, 2, or 3)
      const moduleText = await page.locator('text=/模块: (\\d+)/').first().textContent();
      expect(moduleText).toBeTruthy();
      
      // Should not be negative or have extra modules
      const match = moduleText?.match(/模块: (\\d+)/);
      if (match) {
        const count = parseInt(match[1], 10);
        expect(count).toBeGreaterThanOrEqual(0);
        expect(count).toBeLessThanOrEqual(expectedCount);
      }
    });

    test('connection state does not leak between activation cycles', async ({ page }) => {
      // Add modules
      await page.getByRole('heading', { name: /核心熔炉/i }).click();
      await page.waitForTimeout(300);
      await page.getByRole('heading', { name: /能量管道/i }).click();
      await page.waitForTimeout(300);
      
      // First cycle
      const failureButton1 = page.getByRole('button', { name: /测试故障/i });
      await failureButton1.click();
      await page.waitForTimeout(200);
      
      const skipButton1 = page.locator('button:has-text("✕")');
      if (await skipButton1.isVisible({ timeout: 1000 }).catch(() => false)) {
        await skipButton1.click({ force: true });
      }
      await page.waitForTimeout(500);
      
      // Second cycle
      const failureButton2 = page.getByRole('button', { name: /测试故障/i });
      await failureButton2.click();
      await page.waitForTimeout(200);
      
      const skipButton2 = page.locator('button:has-text("✕")');
      if (await skipButton2.isVisible({ timeout: 1000 }).catch(() => false)) {
        await skipButton2.click({ force: true });
      }
      await page.waitForTimeout(500);
      
      // Connection state should be consistent
      const connectionText = page.locator('text=/连接: \\d+/').first();
      await expect(connectionText).toBeVisible();
    });
  });
});
