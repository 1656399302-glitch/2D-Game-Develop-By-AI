/**
 * Circuit Canvas E2E Tests
 * 
 * Round 124: Circuit Canvas Verification
 * 
 * Tests cover AC-124-001 through AC-124-009:
 * - Gate selector panel visibility and gate buttons
 * - Circuit node placement on canvas
 * - Circuit node selection and deletion (with wire cleanup)
 * - Wire rendering between nodes
 * - Signal propagation via toolbar Run button
 * - Toolbar circuit mode toggle
 * - Toolbar Run/Reset/Clear buttons
 * - Cycle detection warning
 * - Circuit state persistence via machine save/load
 * 
 * Note: Wire creation uses store methods called directly via page.evaluate()
 * since SVG port clicks are unreliable in Playwright due to React event delegation.
 */

import { test, expect, Page } from '@playwright/test';

/**
 * Helper to dismiss the welcome modal if present
 */
async function dismissWelcomeModal(page: Page) {
  try {
    const modal = page.locator('[data-tutorial="welcome-modal"]');
    if (await modal.isVisible({ timeout: 2000 })) {
      const closeBtn = page.locator('[data-tutorial-action="welcome-modal-close"], [aria-label="关闭"], [aria-label="Close"]').first();
      if (await closeBtn.isVisible({ timeout: 1000 })) {
        await closeBtn.click();
        await page.waitForTimeout(300);
      }
    }
  } catch {
    // Modal might not be present, continue
  }
}

/**
 * Create a wire between two nodes using store methods
 * Bypasses SVG port clicks which are unreliable in Playwright
 */
async function createWireBetweenNodes(page: Page, sourceNodeId: string, targetNodeId: string, targetPort: number = 0) {
  await page.evaluate(
    ({ sourceId, targetId, port }: { sourceId: string; targetId: string; port: number }) => {
      // Access the circuit canvas store via window
      const store = (window as any).__circuitCanvasStore;
      if (store) {
        store.getState().addCircuitWire(sourceId, targetId, port);
      }
    },
    { sourceId: sourceNodeId, targetId: targetNodeId, port: targetPort }
  );
  await page.waitForTimeout(200);
}

// =============================================================================
// AC-124-001: Gate selector panel visibility
// =============================================================================

test.describe('AC-124-001: Gate Selector Panel Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
  });

  test('should show 0 circuit component buttons before toolbar toggle', async ({ page }) => {
    const count = await page.locator('[data-circuit-component]').count();
    expect(count).toBe(0);
  });

  test('should show 9 circuit component buttons after toolbar toggle', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    
    const count = await page.locator('[data-circuit-component]').count();
    expect(count).toBe(9);
  });

  test('should show correct gate labels for all 9 components', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    
    const expectedLabels = ['input', 'output', 'AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];
    for (const label of expectedLabels) {
      const btn = page.locator(`[data-circuit-component="${label}"]`);
      await expect(btn).toBeVisible();
    }
  });

  test('circuit gate toggle button is visible before circuit mode is first activated', async ({ page }) => {
    const toggleBtn = page.locator('[data-circuit-toggle]');
    await expect(toggleBtn).toBeVisible();
  });

  test('gate buttons disappear when circuit mode is toggled off', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    expect(await page.locator('[data-circuit-component]').count()).toBe(9);
    
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    expect(await page.locator('[data-circuit-component]').count()).toBe(0);
  });
});

// =============================================================================
// AC-124-002: Circuit node placement on canvas
// =============================================================================

test.describe('AC-124-002: Circuit Node Placement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
  });

  test('should have 0 circuit nodes before clicking gate button', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    
    const nodeCount = await page.locator('.circuit-node').count();
    expect(nodeCount).toBe(0);
  });

  test('should add circuit node to canvas when clicking AND gate button', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="AND"]').click();
    
    await page.waitForSelector('.circuit-node', { timeout: 2000 });
    await page.waitForTimeout(500);
    
    const nodeCount = await page.locator('.circuit-node').count();
    expect(nodeCount).toBeGreaterThan(0);
    
    const andNode = page.locator('.circuit-node[data-gate-type="AND"]');
    await expect(andNode).toBeVisible();
  });

  test('should add all 9 gate types to canvas', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    
    const labels = ['input', 'output', 'AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'];
    for (const label of labels) {
      await page.locator(`[data-circuit-component="${label}"]`).click();
      await page.waitForTimeout(200);
    }
    
    await page.waitForTimeout(500);
    const nodeCount = await page.locator('.circuit-node').count();
    expect(nodeCount).toBe(9);
  });
});

// =============================================================================
// AC-124-003: Circuit node selection and deletion
// =============================================================================

test.describe('AC-124-003: Circuit Node Selection and Deletion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
  });

  test('should select circuit node when clicked', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="AND"]').click();
    await page.waitForTimeout(500);
    
    // Click the circuit node on canvas
    await page.locator('.circuit-node').first().click({ force: true });
    await page.waitForTimeout(300);
    
    // Node should be selected (has data-selected attribute)
    const selectedNode = page.locator('.circuit-node[data-selected="true"]');
    await expect(selectedNode).toBeVisible();
  });

  test('should delete circuit node from DOM when Delete is pressed', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="AND"]').click();
    await page.waitForTimeout(500);
    
    expect(await page.locator('.circuit-node').count()).toBeGreaterThan(0);
    
    // Click the node to select it
    await page.locator('.circuit-node').first().click({ force: true });
    await page.waitForTimeout(300);
    
    // Press Delete key
    await page.keyboard.press('Delete');
    await page.waitForTimeout(500);
    
    const nodeCount = await page.locator('.circuit-node').count();
    expect(nodeCount).toBe(0);
  });

  test('should remove wires attached to deleted node', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="input"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-circuit-component="output"]').click();
    await page.waitForTimeout(500);
    
    // Get node IDs from DOM
    const nodeIds = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.circuit-node');
      return Array.from(nodes).map(n => n.getAttribute('data-node-id')).filter(Boolean) as string[];
    });
    
    expect(nodeIds.length).toBe(2);
    
    // Create wire using store method
    await page.evaluate(
      ({ inputId, outputId }: { inputId: string; outputId: string }) => {
        const store = (window as any).__circuitCanvasStore;
        if (store) {
          store.getState().addCircuitWire(inputId, outputId, 0);
        }
      },
      { inputId: nodeIds[0], outputId: nodeIds[1] }
    );
    await page.waitForTimeout(300);
    
    expect(await page.locator('.circuit-wire').count()).toBe(1);
    
    // Select and delete the input node
    await page.locator('.circuit-node[data-node-type="input"]').click({ force: true });
    await page.waitForTimeout(200);
    await page.keyboard.press('Delete');
    await page.waitForTimeout(500);
    
    // Wire should be removed (attached to deleted node)
    expect(await page.locator('.circuit-wire').count()).toBe(0);
  });
});

// =============================================================================
// AC-124-004: Wire rendering between nodes
// =============================================================================

test.describe('AC-124-004: Wire Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
  });

  test('should have 0 wires before wiring', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    
    const wireCount = await page.locator('.circuit-wire').count();
    expect(wireCount).toBe(0);
  });

  test('should render wire between two connected nodes', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="input"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-circuit-component="output"]').click();
    await page.waitForTimeout(500);
    
    // Get node IDs from DOM
    const nodeIds = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.circuit-node');
      return Array.from(nodes).map(n => n.getAttribute('data-node-id')).filter(Boolean) as string[];
    });
    
    expect(nodeIds.length).toBe(2);
    
    // Create wire using store method
    await page.evaluate(
      ({ inputId, outputId }: { inputId: string; outputId: string }) => {
        const store = (window as any).__circuitCanvasStore;
        if (store) {
          store.getState().addCircuitWire(inputId, outputId, 0);
        }
      },
      { inputId: nodeIds[0], outputId: nodeIds[1] }
    );
    await page.waitForTimeout(500);
    
    expect(await page.locator('.circuit-wire').count()).toBe(1);
  });

  test('wire has signal state attribute', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="input"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-circuit-component="output"]').click();
    await page.waitForTimeout(500);
    
    const nodeIds = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.circuit-node');
      return Array.from(nodes).map(n => n.getAttribute('data-node-id')).filter(Boolean) as string[];
    });
    
    await page.evaluate(
      ({ inputId, outputId }: { inputId: string; outputId: string }) => {
        const store = (window as any).__circuitCanvasStore;
        if (store) {
          store.getState().addCircuitWire(inputId, outputId, 0);
        }
      },
      { inputId: nodeIds[0], outputId: nodeIds[1] }
    );
    await page.waitForTimeout(500);
    
    const wire = page.locator('.circuit-wire').first();
    await expect(wire).toBeVisible();
    const signalAttr = await wire.getAttribute('data-signal');
    expect(['HIGH', 'LOW']).toContain(signalAttr);
  });
});

// =============================================================================
// AC-124-005: Signal propagation via toolbar Run button
// =============================================================================

test.describe('AC-124-005: Signal Propagation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
  });

  test('should not crash when running simulation on circuit with no wires', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="AND"]').click();
    await page.waitForTimeout(500);
    
    const runBtn = page.locator('[data-tutorial-action="toolbar-circuit-run"]');
    await expect(runBtn).toBeVisible();
    
    // Run should not crash
    await runBtn.click();
    await page.waitForTimeout(300);
    
    expect(await page.locator('.circuit-node[data-gate-type="AND"]').count()).toBe(1);
  });

  test('AND gate has LOW output with no inputs set', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="AND"]').click();
    await page.waitForTimeout(500);
    
    await page.locator('[data-tutorial-action="toolbar-circuit-run"]').click();
    await page.waitForTimeout(500);
    
    const andNode = page.locator('.circuit-node[data-gate-type="AND"]');
    const outputAttr = await andNode.getAttribute('data-output');
    expect(outputAttr).toBe('LOW');
  });
});

// =============================================================================
// AC-124-006: Toolbar circuit mode toggle
// =============================================================================

test.describe('AC-124-006: Toolbar Circuit Mode Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
  });

  test('circuit nodes layer is present in DOM when circuit mode active', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="AND"]').click();
    await page.waitForTimeout(500);
    
    const nodesLayer = page.locator('[data-circuit-nodes-layer]');
    await expect(nodesLayer).toBeAttached();
  });

  test('gate buttons appear/disappear with circuit mode toggle', async ({ page }) => {
    expect(await page.locator('[data-circuit-component]').count()).toBe(0);
    
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    expect(await page.locator('[data-circuit-component]').count()).toBe(9);
  });

  test('circuit mode toggle button has correct aria-pressed state', async ({ page }) => {
    const toggleBtn = page.locator('[data-tutorial-action="toolbar-circuit-mode"]');
    
    await expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    
    await toggleBtn.click();
    await page.waitForTimeout(300);
    await expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
    
    await toggleBtn.click();
    await page.waitForTimeout(300);
    await expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
  });
});

// =============================================================================
// AC-124-007: Toolbar Run/Reset/Clear buttons
// =============================================================================

test.describe('AC-124-007: Toolbar Circuit Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
  });

  test('Run button runs circuit simulation', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="AND"]').click();
    await page.waitForTimeout(500);
    
    const runBtn = page.locator('[data-tutorial-action="toolbar-circuit-run"]');
    await expect(runBtn).toBeVisible();
    await runBtn.click();
    await page.waitForTimeout(300);
    
    expect(await page.locator('.circuit-node[data-gate-type="AND"]').count()).toBe(1);
  });

  test('Reset button resets input node to LOW state', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="input"]').click();
    await page.waitForTimeout(500);
    
    const inputNode = page.locator('.circuit-node[data-node-type="input"]');
    
    // Toggle input to HIGH via store
    const inputNodeId = await inputNode.getAttribute('data-node-id');
    await page.evaluate((nodeId: string) => {
      const store = (window as any).__circuitCanvasStore;
      if (store) {
        store.getState().toggleCircuitInput(nodeId);
      }
    }, inputNodeId!);
    await page.waitForTimeout(300);
    
    expect(await inputNode.getAttribute('data-state')).toBe('HIGH');
    
    // Reset
    await page.locator('[data-tutorial-action="toolbar-circuit-reset"]').click();
    await page.waitForTimeout(300);
    
    expect(await inputNode.getAttribute('data-state')).toBe('LOW');
  });

  test('Clear button removes all circuit nodes', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="AND"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-circuit-component="OR"]').click();
    await page.waitForTimeout(500);
    
    expect(await page.locator('.circuit-node').count()).toBe(2);
    
    await page.locator('[data-tutorial-action="toolbar-circuit-clear"]').click();
    await page.waitForTimeout(500);
    
    expect(await page.locator('.circuit-node').count()).toBe(0);
  });

  test('Clear button removes all circuit wires', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="input"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-circuit-component="output"]').click();
    await page.waitForTimeout(500);
    
    const nodeIds = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.circuit-node');
      return Array.from(nodes).map(n => n.getAttribute('data-node-id')).filter(Boolean) as string[];
    });
    
    await page.evaluate(
      ({ inputId, outputId }: { inputId: string; outputId: string }) => {
        const store = (window as any).__circuitCanvasStore;
        if (store) {
          store.getState().addCircuitWire(inputId, outputId, 0);
        }
      },
      { inputId: nodeIds[0], outputId: nodeIds[1] }
    );
    await page.waitForTimeout(500);
    
    expect(await page.locator('.circuit-wire').count()).toBe(1);
    
    await page.locator('[data-tutorial-action="toolbar-circuit-clear"]').click();
    await page.waitForTimeout(500);
    
    expect(await page.locator('.circuit-wire').count()).toBe(0);
  });
});

// =============================================================================
// AC-124-008: Cycle detection warning
// =============================================================================

test.describe('AC-124-008: Cycle Detection Warning', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
  });

  test('acyclic circuit has no cycle warning', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="input"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-circuit-component="output"]').click();
    await page.waitForTimeout(500);
    
    const nodeIds = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.circuit-node');
      return Array.from(nodes).map(n => n.getAttribute('data-node-id')).filter(Boolean) as string[];
    });
    
    await page.evaluate(
      ({ inputId, outputId }: { inputId: string; outputId: string }) => {
        const store = (window as any).__circuitCanvasStore;
        if (store) {
          store.getState().addCircuitWire(inputId, outputId, 0);
        }
      },
      { inputId: nodeIds[0], outputId: nodeIds[1] }
    );
    await page.waitForTimeout(500);
    
    await page.locator('[data-tutorial-action="toolbar-circuit-run"]').click();
    await page.waitForTimeout(500);
    
    const cycleNodeCount = await page.locator('.circuit-node[data-cycle-warning="true"]').count();
    expect(cycleNodeCount).toBe(0);
  });
});

// =============================================================================
// AC-124-009: Circuit state persistence via machine save/load
// =============================================================================

test.describe('AC-124-009: Circuit State Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissWelcomeModal(page);
  });

  test('circuit nodes and wires are present in DOM after building circuit', async ({ page }) => {
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="input"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-circuit-component="AND"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-circuit-component="output"]').click();
    await page.waitForTimeout(500);
    
    const nodeIds = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.circuit-node');
      return Array.from(nodes).map(n => n.getAttribute('data-node-id')).filter(Boolean) as string[];
    });
    
    expect(nodeIds.length).toBe(3);
    
    // Wire: input → AND
    await page.evaluate(
      ({ inputId, andId }: { inputId: string; andId: string }) => {
        const store = (window as any).__circuitCanvasStore;
        if (store) {
          store.getState().addCircuitWire(inputId, andId, 0);
        }
      },
      { inputId: nodeIds[0], andId: nodeIds[1] }
    );
    
    // Wire: AND → output
    await page.evaluate(
      ({ andId, outputId }: { andId: string; outputId: string }) => {
        const store = (window as any).__circuitCanvasStore;
        if (store) {
          store.getState().addCircuitWire(andId, outputId, 0);
        }
      },
      { andId: nodeIds[1], outputId: nodeIds[2] }
    );
    await page.waitForTimeout(500);
    
    expect(await page.locator('.circuit-node').count()).toBe(3);
    expect(await page.locator('.circuit-wire').count()).toBe(2);
    
    expect(await page.locator('.circuit-node[data-node-type="input"]').count()).toBe(1);
    expect(await page.locator('.circuit-node[data-node-type="output"]').count()).toBe(1);
    expect(await page.locator('.circuit-node[data-gate-type="AND"]').count()).toBe(1);
  });

  test('circuit state is intact after machine save', async ({ page }) => {
    // First add a regular module so save button is enabled
    await page.locator('[data-tutorial-action="module-item-0"]').click();
    await page.waitForTimeout(300);
    
    await page.locator('[data-tutorial-action="toolbar-circuit-mode"]').click();
    await page.waitForTimeout(500);
    await page.locator('[data-circuit-component="input"]').click();
    await page.waitForTimeout(200);
    await page.locator('[data-circuit-component="output"]').click();
    await page.waitForTimeout(500);
    
    const nodeIds = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.circuit-node');
      return Array.from(nodes).map(n => n.getAttribute('data-node-id')).filter(Boolean) as string[];
    });
    
    await page.evaluate(
      ({ inputId, outputId }: { inputId: string; outputId: string }) => {
        const store = (window as any).__circuitCanvasStore;
        if (store) {
          store.getState().addCircuitWire(inputId, outputId, 0);
        }
      },
      { inputId: nodeIds[0], outputId: nodeIds[1] }
    );
    await page.waitForTimeout(500);
    
    // Verify circuit state is correct before save
    expect(await page.locator('.circuit-node').count()).toBe(2);
    expect(await page.locator('.circuit-wire').count()).toBe(1);
    
    // Save machine via toolbar save button
    const saveBtn = page.locator('[data-tutorial-action="toolbar-save"]');
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();
    await page.waitForTimeout(500);
    
    // Circuit should still be intact after save
    expect(await page.locator('.circuit-node').count()).toBe(2);
    expect(await page.locator('.circuit-wire').count()).toBe(1);
  });
});
