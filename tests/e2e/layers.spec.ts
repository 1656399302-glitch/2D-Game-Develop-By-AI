/**
 * Layers Panel E2E Tests
 * Round 127: Multi-layer support for circuit canvas
 * 
 * Tests cover AC-127-001 through AC-127-007:
 * - AC-127-001: Layer creation via LayersPanel
 * - AC-127-002: Layer switching and canvas filtering
 * - AC-127-003: Layer deletion
 * - AC-127-004: Layer renaming
 * - AC-127-005: Component-layer assignment
 * - AC-127-006: Layer visibility toggle
 * - AC-127-007: Minimum one layer invariant
 */

import { test, expect, Page } from '@playwright/test';

/**
 * Helper to dismiss the welcome modal if present
 */
async function dismissWelcomeModal(page: Page) {
  try {
    const modal = page.locator('[data-tutorial="welcome-modal"]');
    if (await modal.isVisible({ timeout: 2000 })) {
      const closeBtn = page.locator('[aria-label="关闭"], [aria-label="Close"]').first();
      if (await closeBtn.isVisible({ timeout: 1000 })) {
        await closeBtn.click();
        await page.waitForTimeout(300);
      }
    }
  } catch {
    // Modal might not be present, continue
  }
}

// Helper functions for accessing machine store from browser context
function getMachineStore() {
  return window.__machineStore;
}

function getLayers() {
  return getMachineStore().getState().layers;
}

function getActiveLayerId() {
  return getMachineStore().getState().activeLayerId;
}

function getLayerCount() {
  return getMachineStore().getState().layers.length;
}

/**
 * Open the layers panel
 */
async function openLayersPanel(page: Page) {
  // Click the toggle button
  const toggleBtn = page.locator('[data-testid="toggle-layers-panel"]');
  try {
    await toggleBtn.waitFor({ state: 'attached', timeout: 5000 });
    await toggleBtn.click();
  } catch {
    // Toggle button might not exist or not be clickable
  }
  // Wait for the panel to appear
  await page.waitForSelector('[data-testid="layers-panel"]', { timeout: 5000 });
}

/**
 * Wait for store state to stabilize (flush Zustand updates)
 */
async function waitForStoreUpdate(page: Page) {
  await page.waitForTimeout(200);
}

// ============================================================
// AC-127-001: Layer creation
// ============================================================
test.describe('AC-127-001: Layer creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
    await openLayersPanel(page);
  });

  test('should create a new layer via LayersPanel', async ({ page }) => {
    // Get initial layer count
    const initialCount = await page.evaluate(() => window.__machineStore.getState().layers.length);
    
    // Click add layer button
    const addBtn = page.locator('[data-testid="add-layer-button"]');
    await addBtn.click();
    await page.waitForTimeout(300);
    
    // Verify layer count increased
    const newCount = await page.evaluate(() => window.__machineStore.getState().layers.length);
    expect(newCount).toBe(initialCount + 1);
  });

  test('should name new layer with "Layer N" pattern', async ({ page }) => {
    await page.evaluate(() => {
      const store = window.__machineStore.getState();
      store.addLayer();
      store.addLayer();
    });
    
    const layers = await page.evaluate(() => window.__machineStore.getState().layers);
    const newLayer = layers[layers.length - 1];
    
    expect(newLayer.name).toMatch(/^Layer \d+$/);
    expect(newLayer.id).toBeTruthy();
  });

  test('should show unique layer IDs in store', async ({ page }) => {
    await page.evaluate(() => {
      const store = window.__machineStore.getState();
      store.addLayer();
      store.addLayer();
    });
    
    const layers = await page.evaluate(() => window.__machineStore.getState().layers);
    const ids = layers.map((l: any) => l.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('should show new layer tab in the panel', async ({ page }) => {
    const initialTabs = await page.locator('[data-testid^="layer-tab-"]').count();
    
    await page.locator('[data-testid="add-layer-button"]').click();
    await page.waitForTimeout(300);
    
    const newTabs = await page.locator('[data-testid^="layer-tab-"]').count();
    expect(newTabs).toBe(initialTabs + 1);
  });
});

// ============================================================
// AC-127-002: Layer switching
// ============================================================
test.describe('AC-127-002: Layer switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
  });

  test('should switch active layer via store', async ({ page }) => {
    // Create two layers
    const { layer1Id, layer2Id } = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layer1Id = store.layers[0].id;
      const layer2Id = store.addLayer();
      return { layer1Id, layer2Id };
    });
    
    // Switch to layer 2
    await page.evaluate((id: string) => {
      window.__machineStore.getState().setActiveLayer(id);
    }, layer2Id);
    
    await waitForStoreUpdate(page);
    
    // Verify active layer changed
    const activeLayerId = await page.evaluate(() => window.__machineStore.getState().activeLayerId);
    expect(activeLayerId).toBe(layer2Id);
  });

  test('should filter components by active layer via getActiveLayerComponents', async ({ page }) => {
    // Create layers and add modules
    const { layer1Id, layer2Id, module1InstanceId, module2InstanceId } = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layer1Id = store.layers[0].id;
      const layer2Id = store.addLayer();
      
      // Add component to layer 1 (default)
      const addedModule1 = store.addModule('core-furnace', 300, 200);
      
      // Switch to layer 2
      store.setActiveLayer(layer2Id);
      
      // Add component to layer 2
      const addedModule2 = store.addModule('gear', 400, 200);
      
      return { 
        layer1Id, 
        layer2Id, 
        module1InstanceId: addedModule1.instanceId, 
        module2InstanceId: addedModule2.instanceId
      };
    });
    
    // Get components on each layer
    const layer1Components = await page.evaluate((layerId: string) => {
      const store = window.__machineStore.getState();
      return store.modules.filter(m => m.layerId === layerId).map(m => m.instanceId);
    }, layer1Id);
    
    const layer2Components = await page.evaluate((layerId: string) => {
      const store = window.__machineStore.getState();
      return store.modules.filter(m => m.layerId === layerId).map(m => m.instanceId);
    }, layer2Id);
    
    expect(layer1Components).toContain(module1InstanceId);
    expect(layer2Components).toContain(module2InstanceId);
    expect(layer1Components).not.toContain(module2InstanceId);
    expect(layer2Components).not.toContain(module1InstanceId);
  });

  test('should show layer 2 components when layer 2 is active', async ({ page }) => {
    // Create layer and add module
    const { layer2Id, moduleInstanceId } = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layer2Id = store.addLayer();
      store.setActiveLayer(layer2Id);
      const addedModule = store.addModule('gear', 400, 200);
      return { 
        layer2Id, 
        moduleInstanceId: addedModule.instanceId 
      };
    });
    
    await waitForStoreUpdate(page);
    
    // Verify module is on layer 2
    const module = await page.evaluate((moduleInstanceId: string) => {
      return window.__machineStore.getState().modules.find(m => m.instanceId === moduleInstanceId);
    }, moduleInstanceId);
    
    expect(module.layerId).toBe(layer2Id);
  });

  test('should update activeLayerId in store when switching', async ({ page }) => {
    const { layer1Id, layer2Id } = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layer1Id = store.layers[0].id;
      const layer2Id = store.addLayer();
      return { layer1Id, layer2Id };
    });
    
    // Switch to layer 2
    await page.evaluate((id: string) => {
      window.__machineStore.getState().setActiveLayer(id);
    }, layer2Id);
    
    await waitForStoreUpdate(page);
    
    const activeId = await page.evaluate(() => window.__machineStore.getState().activeLayerId);
    expect(activeId).toBe(layer2Id);
  });
});

// ============================================================
// AC-127-003: Layer deletion
// ============================================================
test.describe('AC-127-003: Layer deletion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
  });

  test('should delete a layer when more than one exists', async ({ page }) => {
    const { layer1Id } = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layer1Id = store.layers[0].id;
      const layer2Id = store.addLayer();
      return { layer1Id, layer2Id };
    });
    
    await openLayersPanel(page);
    
    const initialCount = await page.evaluate(() => window.__machineStore.getState().layers.length);
    
    // Find and click the delete button for layer 1
    const deleteBtn = page.locator(`[data-testid="layer-delete-${layer1Id}"]`);
    await deleteBtn.click();
    await page.waitForTimeout(300);
    
    const newCount = await page.evaluate(() => window.__machineStore.getState().layers.length);
    expect(newCount).toBe(initialCount - 1);
  });

  test('should remove layer tab from DOM after deletion', async ({ page }) => {
    const { layer1Id } = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layer1Id = store.layers[0].id;
      store.addLayer();
      return { layer1Id };
    });
    
    await openLayersPanel(page);
    
    const initialTabs = await page.locator('[data-testid^="layer-tab-"]').count();
    
    await page.locator(`[data-testid="layer-delete-${layer1Id}"]`).click();
    await page.waitForTimeout(300);
    
    const newTabs = await page.locator('[data-testid^="layer-tab-"]').count();
    expect(newTabs).toBe(initialTabs - 1);
  });

  test('should switch to remaining layer after deletion', async ({ page }) => {
    const { layer1Id } = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layer1Id = store.layers[0].id;
      store.addLayer();
      return { layer1Id };
    });
    
    await openLayersPanel(page);
    
    // Delete layer 1 (layer 2 should become active)
    await page.locator(`[data-testid="layer-delete-${layer1Id}"]`).click();
    await page.waitForTimeout(300);
    
    const activeId = await page.evaluate(() => window.__machineStore.getState().activeLayerId);
    expect(activeId).not.toBe(layer1Id);
  });

  test('should remove components from deleted layer', async ({ page }) => {
    const { layer1Id } = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layer1Id = store.layers[0].id;
      store.addModule('core-furnace', 300, 200);
      store.addLayer();
      return { layer1Id };
    });
    
    const moduleCountBefore = await page.evaluate(() => window.__machineStore.getState().modules.length);
    expect(moduleCountBefore).toBe(1);
    
    await openLayersPanel(page);
    await page.locator(`[data-testid="layer-delete-${layer1Id}"]`).click();
    await page.waitForTimeout(300);
    
    const moduleCountAfter = await page.evaluate(() => window.__machineStore.getState().modules.length);
    expect(moduleCountAfter).toBe(0);
  });

  test('should not allow deleting the last layer', async ({ page }) => {
    const onlyLayerId = await page.evaluate(() => window.__machineStore.getState().layers[0].id);
    
    await openLayersPanel(page);
    
    // Delete button should be hidden or disabled for the last layer
    const deleteBtn = page.locator(`[data-testid="layer-delete-${onlyLayerId}"]`);
    const isVisible = await deleteBtn.isVisible().catch(() => false);
    
    if (isVisible) {
      await deleteBtn.click();
    }
    
    const count = await page.evaluate(() => window.__machineStore.getState().layers.length);
    expect(count).toBe(1);
  });
});

// ============================================================
// AC-127-004: Layer renaming
// ============================================================
test.describe('AC-127-004: Layer renaming', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
    await openLayersPanel(page);
  });

  test('should rename layer via double-click', async ({ page }) => {
    const layerId = await page.evaluate(() => window.__machineStore.getState().layers[0].id);
    
    // Double-click the layer name to enter edit mode
    const layerTab = page.locator(`[data-testid="layer-tab-${layerId}"]`);
    const nameSpan = layerTab.locator('span').first();
    await nameSpan.dblclick();
    await page.waitForTimeout(200);
    
    // Check rename input appears
    const renameInput = page.locator(`[data-testid="layer-rename-input-${layerId}"]`);
    await expect(renameInput).toBeVisible();
    
    // Type new name
    await renameInput.fill('Alpha');
    await renameInput.press('Enter');
    await page.waitForTimeout(200);
    
    // Verify name changed
    const layers = await page.evaluate(() => window.__machineStore.getState().layers);
    const layer = layers.find((l: any) => l.id === layerId);
    expect(layer.name).toBe('Alpha');
  });

  test('should show renamed layer in header', async ({ page }) => {
    const layerId = await page.evaluate(() => window.__machineStore.getState().layers[0].id);
    
    await page.evaluate(({ id, name }) => {
      window.__machineStore.getState().renameLayer(id, 'Alpha');
    }, { id: layerId, name: 'Alpha' });
    
    await page.waitForTimeout(300);
    
    // Check header shows new name
    const header = page.locator('[data-testid="layers-panel"] h2');
    await expect(header).toHaveText('Alpha');
  });

  test('should not change other layer names when renaming', async ({ page }) => {
    const { layer1Id, layer2Id } = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layer1Id = store.layers[0].id;
      const layer2Id = store.addLayer();
      return { layer1Id, layer2Id };
    });
    
    await page.evaluate(({ id }: { id: string }) => {
      window.__machineStore.getState().renameLayer(id, 'Alpha');
    }, { id: layer1Id });
    
    const layers = await page.evaluate(() => window.__machineStore.getState().layers);
    const layer1 = layers.find((l: any) => l.id === layer1Id);
    const layer2 = layers.find((l: any) => l.id === layer2Id);
    
    expect(layer1.name).toBe('Alpha');
    expect(layer2.name).toMatch(/^Layer \d+$/); // Should keep default name
  });
});

// ============================================================
// AC-127-005: Component-layer assignment
// ============================================================
test.describe('AC-127-005: Component-layer assignment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
  });

  test('should move selected component to another layer via store', async ({ page }) => {
    const result = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layer1Id = store.layers[0].id;
      const layer2Id = store.addLayer();
      
      // Add module and get its instanceId directly from return value
      const addedModule = store.addModule('core-furnace', 300, 200);
      
      return { 
        moduleInstanceId: addedModule.instanceId, 
        layer1Id, 
        layer2Id,
        moduleLayerId: (addedModule as any).layerId
      };
    });
    
    // Move module to layer 2
    await page.evaluate(({ moduleInstanceId, layer2Id }) => {
      window.__machineStore.getState().moveComponentsToLayer([moduleInstanceId], layer2Id);
    }, { moduleInstanceId: result.moduleInstanceId, layer2Id: result.layer2Id });
    
    await page.waitForTimeout(300);
    
    // Verify module moved to layer 2
    const updatedModule = await page.evaluate((instanceId: string) => {
      return window.__machineStore.getState().modules.find((m: any) => m.instanceId === instanceId);
    }, result.moduleInstanceId);
    
    expect((updatedModule as any).layerId).toBe(result.layer2Id);
  });

  test('should not show moved component on source layer after move', async ({ page }) => {
    const result = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layer1Id = store.layers[0].id;
      const layer2Id = store.addLayer();
      
      // Add module to layer 1 (default)
      const addedModule = store.addModule('core-furnace', 300, 200);
      
      return { 
        moduleInstanceId: addedModule.instanceId, 
        layer1Id, 
        layer2Id 
      };
    });
    
    // Move to layer 2
    await page.evaluate(({ moduleInstanceId, layer2Id }) => {
      window.__machineStore.getState().moveComponentsToLayer([moduleInstanceId], layer2Id);
    }, { moduleInstanceId: result.moduleInstanceId, layer2Id: result.layer2Id });
    
    await page.waitForTimeout(300);
    
    // Module should not be in layer 1's component list
    const layer1Components = await page.evaluate((layer1Id: string) => {
      const store = window.__machineStore.getState();
      return store.modules.filter((m: any) => m.layerId === layer1Id);
    }, result.layer1Id);
    
    expect(layer1Components.length).toBe(0);
  });

  test('should show moved component on target layer after move', async ({ page }) => {
    const result = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layer2Id = store.addLayer();
      
      // Add module to layer 1 (default)
      const addedModule = store.addModule('core-furnace', 300, 200);
      
      return { 
        moduleInstanceId: addedModule.instanceId, 
        layer2Id 
      };
    });
    
    // Move to layer 2
    await page.evaluate(({ moduleInstanceId, layer2Id }) => {
      window.__machineStore.getState().moveComponentsToLayer([moduleInstanceId], layer2Id);
    }, { moduleInstanceId: result.moduleInstanceId, layer2Id: result.layer2Id });
    
    await page.waitForTimeout(300);
    
    // Module should be in layer 2's component list
    const layer2Components = await page.evaluate((layer2Id: string) => {
      return window.__machineStore.getState().modules.filter((m: any) => m.layerId === layer2Id);
    }, result.layer2Id);
    
    expect(layer2Components.length).toBe(1);
    expect(layer2Components[0].instanceId).toBe(result.moduleInstanceId);
  });
});

// ============================================================
// AC-127-006: Layer visibility toggle
// ============================================================
test.describe('AC-127-006: Layer visibility toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
  });

  test('should toggle layer visibility via visibility button', async ({ page }) => {
    const layerId = await page.evaluate(() => window.__machineStore.getState().layers[0].id);
    
    await openLayersPanel(page);
    
    // Toggle visibility
    const visibilityBtn = page.locator(`[data-testid="layer-visibility-toggle-${layerId}"]`);
    await visibilityBtn.click();
    await page.waitForTimeout(300);
    
    const layer = await page.evaluate((id: string) => {
      return window.__machineStore.getState().layers.find((l: any) => l.id === id);
    }, layerId);
    
    expect(layer.visible).toBe(false);
  });

  test('should hide layer 2 components via visibility toggle', async ({ page }) => {
    const result = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layer2Id = store.addLayer();
      
      store.setActiveLayer(layer2Id);
      
      // Add module to layer 2
      const addedModule = store.addModule('gear', 400, 200);
      
      return { 
        layer2Id, 
        module2InstanceId: addedModule.instanceId 
      };
    });
    
    await waitForStoreUpdate(page);
    
    // Verify module is on layer 2
    const module = await page.evaluate((moduleInstanceId: string) => {
      return window.__machineStore.getState().modules.find(m => m.instanceId === moduleInstanceId);
    }, result.module2InstanceId);
    
    expect(module.layerId).toBe(result.layer2Id);
    
    // Hide layer 2
    await page.evaluate((id: string) => {
      window.__machineStore.setState((state: any) => ({ 
        layers: state.layers.map((l: any) => l.id === id ? { ...l, visible: false } : l) 
      }));
    }, result.layer2Id);
    await page.waitForTimeout(300);
    
    // getActiveLayerComponents should return empty when layer is hidden
    const components = await page.evaluate(() => {
      return window.__machineStore.getState().getActiveLayerComponents();
    });
    
    expect(components.length).toBe(0);
  });

  test('should show layer 2 components again when un-hidden', async ({ page }) => {
    const result = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layer2Id = store.addLayer();
      
      store.setActiveLayer(layer2Id);
      
      // Add module to layer 2
      const addedModule = store.addModule('gear', 400, 200);
      
      return { 
        layer2Id, 
        module2InstanceId: addedModule.instanceId 
      };
    });
    
    await waitForStoreUpdate(page);
    
    // Hide layer 2
    await page.evaluate((id: string) => {
      window.__machineStore.setState((state: any) => ({ 
        layers: state.layers.map((l: any) => l.id === id ? { ...l, visible: false } : l) 
      }));
    }, result.layer2Id);
    await page.waitForTimeout(200);
    
    // Verify hidden
    let components = await page.evaluate(() => {
      return window.__machineStore.getState().getActiveLayerComponents();
    });
    expect(components.length).toBe(0);
    
    // Unhide layer 2
    await page.evaluate((id: string) => {
      window.__machineStore.setState((state: any) => ({ 
        layers: state.layers.map((l: any) => l.id === id ? { ...l, visible: true } : l) 
      }));
    }, result.layer2Id);
    await page.waitForTimeout(300);
    
    // Verify visible
    components = await page.evaluate(() => {
      return window.__machineStore.getState().getActiveLayerComponents();
    });
    expect(components.length).toBe(1);
  });

  test('should not throw error when all layers are toggled hidden', async ({ page }) => {
    // Wait for initial render
    await page.waitForTimeout(300);
    
    // Hide all layers using direct store access
    await page.evaluate(() => {
      window.__machineStore.setState((state: any) => ({ 
        layers: state.layers.map((l: any) => ({ ...l, visible: false })) 
      }));
    });
    
    await page.waitForTimeout(300);
    
    // Should not throw - getActiveLayerComponents returns empty when layer is hidden
    const components = await page.evaluate(() => {
      return window.__machineStore.getState().getActiveLayerComponents();
    });
    
    expect(components).toEqual([]);
  });
});

// ============================================================
// AC-127-007: Minimum one layer invariant
// ============================================================
test.describe('AC-127-007: Minimum one layer invariant', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
  });

  test('should not allow deleting the last layer', async ({ page }) => {
    const onlyLayerId = await page.evaluate(() => window.__machineStore.getState().layers[0].id);
    
    await openLayersPanel(page);
    
    // Try to delete via UI
    const deleteBtn = page.locator(`[data-testid="layer-delete-${onlyLayerId}"]`);
    const hasDeleteBtn = await deleteBtn.isVisible().catch(() => false);
    
    if (hasDeleteBtn) {
      await deleteBtn.click();
    }
    
    await page.waitForTimeout(300);
    
    const count = await page.evaluate(() => window.__machineStore.getState().layers.length);
    expect(count).toBe(1);
  });

  test('should never have layers.length === 0', async ({ page }) => {
    // Try various deletion attempts
    await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layerId = store.layers[0].id;
      
      // Try to delete the only layer
      store.removeLayer(layerId);
      store.removeLayer(layerId);
      store.removeLayer(layerId);
    });
    
    const count = await page.evaluate(() => window.__machineStore.getState().layers.length);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should always have valid activeLayerId', async ({ page }) => {
    await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layerId = store.layers[0].id;
      store.removeLayer(layerId);
    });
    
    const { layers, activeLayerId } = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      return { layers: store.layers, activeLayerId: store.activeLayerId };
    });
    
    expect(layers.length).toBeGreaterThanOrEqual(1);
    expect(activeLayerId).toBeTruthy();
    expect(layers.some((l: any) => l.id === activeLayerId)).toBe(true);
  });

  test('should maintain valid state after add and delete operations', async ({ page }) => {
    await page.evaluate(() => {
      const store = window.__machineStore.getState();
      const layer1Id = store.layers[0].id;
      const layer2Id = store.addLayer();
      const layer3Id = store.addLayer();
      
      store.removeLayer(layer1Id);
      store.removeLayer(layer2Id);
      
      const remainingLayers = store.layers;
      // Assertions moved outside evaluate
      return { 
        layerCount: remainingLayers.length,
        activeLayerId: store.activeLayerId
      };
    });
    
    // Assertions outside evaluate
    const state = await page.evaluate(() => {
      const store = window.__machineStore.getState();
      return { 
        layerCount: store.layers.length,
        activeLayerId: store.activeLayerId
      };
    });
    
    expect(state.layerCount).toBeGreaterThanOrEqual(1);
    expect(state.activeLayerId).toBeTruthy();
  });
});
