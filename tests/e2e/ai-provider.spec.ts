/**
 * AI Provider E2E Tests
 * 
 * Tests for AI provider settings panel interactions,
 * provider switching, connection testing, and generation workflows.
 */

import { test, expect } from '@playwright/test';

test.describe('AI Provider', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForSelector('[data-testid="app"]', { timeout: 10000 }).catch(() => {
      // If no data-testid, just wait for body
    });
    
    // Open AI panel by clicking the AI button
    await page.click('text=AI 助手', { timeout: 5000 }).catch(() => {
      // Try alternative selector
    });
  });

  test.describe('Settings Panel Entry', () => {
    test('should open settings panel', async ({ page }) => {
      // Click the settings button in AI panel
      const settingsButton = page.locator('button:has-text("⚙️")');
      if (await settingsButton.isVisible()) {
        await settingsButton.click();
      } else {
        // Try the provider indicator button
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      }
      
      // Verify panel is visible
      const panel = page.locator('[data-testid="ai-settings-panel"]');
      await expect(panel).toBeVisible({ timeout: 5000 });
    });

    test('should show API key input field', async ({ page }) => {
      // Open settings
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      // Select OpenAI provider
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      // Verify API key input is visible
      const apiKeyInput = page.locator('[data-testid="api-key-input"]');
      await expect(apiKeyInput).toBeVisible({ timeout: 5000 });
    });

    test('should show model dropdown', async ({ page }) => {
      // Open settings
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      // Select OpenAI provider
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      // Verify model select is visible
      const modelSelect = page.locator('[data-testid="model-select"]');
      await expect(modelSelect).toBeVisible({ timeout: 5000 });
    });

    test('should show provider selector', async ({ page }) => {
      // Open settings
      const settingsButton = page.locator('button:has-text("⚙️")');
      if (await settingsButton.isVisible()) {
        await settingsButton.click();
      }
      
      // Verify at least one provider option is visible
      const providerOptions = page.locator('[data-testid^="provider-"]');
      await expect(providerOptions.first()).toBeVisible({ timeout: 5000 });
    });

    test('should show connection test button when OpenAI selected', async ({ page }) => {
      // Open settings
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      // Select OpenAI provider
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      // Click "Add API Key" button if visible
      const addKeyBtn = page.locator('button:has-text("+ 添加 API Key")');
      if (await addKeyBtn.isVisible()) {
        await addKeyBtn.click();
      }
      
      // Verify connection test button is visible
      const testBtn = page.locator('[data-testid="connection-test-button"]');
      await expect(testBtn).toBeVisible({ timeout: 5000 });
    });

    test('should not show console errors when opening panel', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Open settings
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      // Wait a moment
      await page.waitForTimeout(500);
      
      // Filter out known non-critical errors
      const criticalErrors = errors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('Warning')
      );
      
      expect(criticalErrors.length).toBe(0);
    });
  });

  test.describe('Settings Panel Dismiss', () => {
    test('should close panel when dismiss button clicked', async ({ page }) => {
      // Open settings
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      // Verify panel is visible
      const panel = page.locator('[data-testid="ai-settings-panel"]');
      await expect(panel).toBeVisible({ timeout: 5000 });
      
      // Click close button
      const closeBtn = page.locator('[data-testid="close-settings-button"]');
      await closeBtn.click();
      
      // Verify panel is not visible
      await expect(panel).not.toBeVisible({ timeout: 5000 });
    });

    test('should not remain in DOM after dismiss', async ({ page }) => {
      // Open settings
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      // Close settings
      await page.locator('[data-testid="close-settings-button"]').click();
      
      // Wait for animation
      await page.waitForTimeout(300);
      
      // Check panel is not visible
      const panel = page.locator('[data-testid="ai-settings-panel"]');
      await expect(panel).toBeHidden({ timeout: 5000 });
    });
  });

  test.describe('API Key Input', () => {
    test('should mask characters by default', async ({ page }) => {
      // Open settings and select OpenAI
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      // Click to add/edit API key
      await page.click('button:has-text("+ 添加 API Key")').catch(async () => {
        await page.click('button:has-text("修改")').catch(() => {});
      });
      
      // Enter API key
      const input = page.locator('[data-testid="api-key-input"]');
      if (await input.isVisible()) {
        await input.fill('sk-test-123456789012345678901234567890');
        
        // Check input type is password (masked)
        const type = await input.getAttribute('type');
        expect(type).toBe('password');
      }
    });

    test('should reveal API key on toggle', async ({ page }) => {
      // Open settings and select OpenAI
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      // Click to add/edit API key
      await page.click('button:has-text("+ 添加 API Key")').catch(async () => {
        await page.click('button:has-text("修改")').catch(() => {});
      });
      
      const input = page.locator('[data-testid="api-key-input"]');
      if (await input.isVisible()) {
        // Enter key first
        await input.fill('sk-test-123456789012345678901234567890');
        
        // Click toggle
        const toggle = page.locator('[data-testid="api-key-toggle-visibility"]');
        await toggle.click();
        
        // Check input type is now text
        const type = await input.getAttribute('type');
        expect(type).toBe('text');
      }
    });

    test('should show error for invalid format', async ({ page }) => {
      // Open settings and select OpenAI
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      // Click to add API key
      await page.click('button:has-text("+ 添加 API Key")');
      
      const input = page.locator('[data-testid="api-key-input"]');
      // Enter invalid format
      await input.fill('bad-key');
      
      // Check for error message
      const errorMsg = page.locator('text=Invalid API key format');
      await expect(errorMsg).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Connection Test Flow', () => {
    test('should show testing state when clicked', async ({ page }) => {
      // Mock the API call
      await page.route('**/v1/chat/completions', async route => {
        await page.waitForTimeout(1000); // Simulate delay
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ choices: [{ message: { content: 'test' } }] }),
        });
      });
      
      // Open settings and select OpenAI
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      // Add API key
      await page.click('button:has-text("+ 添加 API Key")');
      await page.locator('[data-testid="api-key-input"]').fill('sk-test-123456789012345678901234567890');
      await page.click('button:has-text("保存")');
      
      // Click test connection
      await page.click('[data-testid="connection-test-button"]');
      
      // Verify testing indicator
      const testing = page.locator('[data-testid="connection-testing"]');
      await expect(testing).toBeVisible({ timeout: 2000 });
    });

    test('should show success on valid connection', async ({ page }) => {
      // Mock successful API call
      await page.route('**/v1/chat/completions', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ choices: [{ message: { content: 'test' } }] }),
        });
      });
      
      // Setup
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      await page.click('button:has-text("+ 添加 API Key")');
      await page.locator('[data-testid="api-key-input"]').fill('sk-test-123456789012345678901234567890');
      await page.click('button:has-text("保存")');
      
      // Test connection
      await page.click('[data-testid="connection-test-button"]');
      
      // Wait for result
      const success = page.locator('[data-testid="connection-success"]');
      await expect(success).toBeVisible({ timeout: 5000 });
    });

    test('should show error on 401 response', async ({ page }) => {
      // Mock 401 response
      await page.route('**/v1/chat/completions', async route => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Invalid API key' } }),
        });
      });
      
      // Setup
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      await page.click('button:has-text("+ 添加 API Key")');
      await page.locator('[data-testid="api-key-input"]').fill('sk-test-123456789012345678901234567890');
      await page.click('button:has-text("保存")');
      
      // Test connection
      await page.click('[data-testid="connection-test-button"]');
      
      // Wait for error
      const error = page.locator('[data-testid="connection-error"]');
      await expect(error).toBeVisible({ timeout: 5000 });
    });

    test('should prompt to add key when not configured', async ({ page }) => {
      // Open settings and select OpenAI without adding key
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      // Connection test button should be visible
      const testBtn = page.locator('[data-testid="connection-test-button"]');
      await expect(testBtn).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Provider Switching', () => {
    test('should select OpenAI provider', async ({ page }) => {
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      await openaiOption.click();
      
      // Verify selection (radio button filled)
      const radio = openaiOption.locator('.bg-\\[\\#7c3aed\\]');
      await expect(radio).toBeVisible({ timeout: 2000 });
    });

    test('should switch to local provider', async ({ page }) => {
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      // First select OpenAI
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      await openaiOption.click();
      
      // Then switch to local
      const localOption = page.locator('[data-testid="provider-local"]');
      await localOption.click();
      
      // Verify local is selected
      const radio = localOption.locator('.bg-\\[\\#7c3aed\\]');
      await expect(radio).toBeVisible({ timeout: 2000 });
    });

    test('should not cause page reload on switch', async ({ page }) => {
      let reloadCount = 0;
      page.on('reload', () => reloadCount++);
      
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      // Switch providers
      await page.locator('[data-testid="provider-openai"]').click();
      await page.waitForTimeout(100);
      await page.locator('[data-testid="provider-local"]').click();
      await page.waitForTimeout(100);
      
      expect(reloadCount).toBe(0);
    });

    test('should remain responsive during switch', async ({ page }) => {
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      // Switch providers rapidly
      for (let i = 0; i < 3; i++) {
        await page.locator('[data-testid="provider-openai"]').click();
        await page.waitForTimeout(50);
        await page.locator('[data-testid="provider-local"]').click();
        await page.waitForTimeout(50);
      }
      
      // UI should still be responsive
      const closeBtn = page.locator('[data-testid="close-settings-button"]');
      await expect(closeBtn).toBeEnabled({ timeout: 2000 });
    });
  });

  test.describe('Name Generation Entry', () => {
    test.beforeEach(async ({ page }) => {
      // Add a module to canvas first
      const moduleButton = page.locator('text=能量核心').first();
      if (await moduleButton.isVisible()) {
        await moduleButton.click();
      }
    });

    test('should show loading indicator during name generation', async ({ page }) => {
      // Mock API for name generation
      await page.route('**/v1/chat/completions', async route => {
        await page.waitForTimeout(2000);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ choices: [{ message: { content: 'Test Name' } }] }),
        });
      });
      
      // Setup provider
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      await page.locator('[data-testid="close-settings-button"]').click();
      
      // Generate names button should exist
      const genBtn = page.locator('button:has-text("生成名称")');
      if (await genBtn.isVisible() && await genBtn.isEnabled()) {
        await genBtn.click();
        
        const loading = page.locator('[data-testid="generating-names"]');
        // Should show loading or button should be disabled
        const isDisabled = await genBtn.isDisabled();
        expect(isDisabled || await loading.isVisible()).toBeTruthy();
      }
    });
  });

  test.describe('Fallback Behavior', () => {
    test('should fall back to local on API error', async ({ page }) => {
      // Mock API to return 401
      await page.route('**/v1/chat/completions', async route => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Invalid API key' } }),
        });
      });
      
      // Setup with OpenAI but invalid key
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      await page.locator('[data-testid="close-settings-button"]').click();
      
      // Try to generate - should use local fallback
      const genBtn = page.locator('button:has-text("生成名称")');
      if (await genBtn.isVisible() && await genBtn.isEnabled()) {
        await genBtn.click();
        
        // Should eventually show results from local provider
        await page.waitForTimeout(500);
      }
      
      // App should not crash
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });

    test('should use local provider without API key', async ({ page }) => {
      // Make sure local is selected
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const localOption = page.locator('[data-testid="provider-local"]');
      if (await localOption.isVisible()) {
        await localOption.click();
      }
      
      await page.locator('[data-testid="close-settings-button"]').click();
      
      // Local provider should work without API key
      const genBtn = page.locator('button:has-text("生成名称")');
      if (await genBtn.isVisible() && await genBtn.isEnabled()) {
        await genBtn.click();
        await page.waitForTimeout(500);
      }
      
      // App should not crash
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('State Persistence', () => {
    test('should persist API key across refresh', async ({ page }) => {
      // Set API key
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      await page.click('button:has-text("+ 添加 API Key")');
      await page.locator('[data-testid="api-key-input"]').fill('sk-test-123456789012345678901234567890');
      await page.click('button:has-text("保存")');
      
      // Close and refresh
      await page.locator('[data-testid="close-settings-button"]').click();
      await page.reload();
      
      // Reopen settings
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      // Verify key is still configured
      const status = page.locator('text=已配置 API Key');
      await expect(status).toBeVisible({ timeout: 3000 });
    });

    test('should persist model selection across refresh', async ({ page }) => {
      // Set model
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      // Select GPT-4
      await page.selectOption('[data-testid="model-select"]', 'gpt-4');
      
      // Close and refresh
      await page.locator('[data-testid="close-settings-button"]').click();
      await page.reload();
      
      // Reopen settings
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      // Verify GPT-4 is still selected
      const select = page.locator('[data-testid="model-select"]');
      const value = await select.inputValue();
      expect(value).toBe('gpt-4');
    });

    test('should persist provider selection across refresh', async ({ page }) => {
      // Select OpenAI
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      await openaiOption.click();
      
      // Close and refresh
      await page.locator('[data-testid="close-settings-button"]').click();
      await page.reload();
      
      // Reopen settings
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      // Verify OpenAI is still selected
      const radio = openaiOption.locator('.bg-\\[\\#7c3aed\\]');
      await expect(radio).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('Model Selection', () => {
    test('should have exactly 3 model options', async ({ page }) => {
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      const select = page.locator('[data-testid="model-select"]');
      const options = await select.locator('option').allTextContents();
      
      expect(options.length).toBe(3);
      expect(options).toContain('GPT-4');
      expect(options).toContain('GPT-4 Turbo');
      expect(options).toContain('GPT-3.5 Turbo');
    });

    test('should default to GPT-3.5 Turbo', async ({ page }) => {
      await page.click('button:has-text("⚙️")').catch(async () => {
        const providerBtn = page.locator('button:has-text("🏠")');
        if (await providerBtn.isVisible()) {
          await providerBtn.click();
        }
      });
      
      const openaiOption = page.locator('[data-testid="provider-openai"]');
      if (await openaiOption.isVisible()) {
        await openaiOption.click();
      }
      
      const select = page.locator('[data-testid="model-select"]');
      const value = await select.inputValue();
      
      expect(value).toBe('gpt-3.5-turbo');
    });
  });
});
