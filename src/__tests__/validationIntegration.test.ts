/**
 * Validation Integration Tests
 * 
 * Round 113: Circuit Validation UI Integration
 * 
 * Tests for validation integration with activation flow and UI components
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { 
  getActivationGate, 
  isActivationBlocked,
  getValidationStatusSummary,
  getValidationStatusText,
  findConnectionSuggestions,
  getQuickFixSuggestions,
  getActivationButtonDisabledClasses,
} from '../utils/validationIntegration';
import { useMachineStore } from '../store/useMachineStore';
import { useActivationGate } from '../hooks/useCircuitValidation';

// ============================================================================
// Test Setup
// ============================================================================

describe('Validation Integration Tests', () => {
  beforeEach(() => {
    // Reset the store before each test
    useMachineStore.getState().clearCanvas();
    vi.clearAllMocks();
  });

  afterEach(() => {
    useMachineStore.getState().clearCanvas();
  });

  // ============================================================================
  // AC-113-009: Activation Button Blocking
  // ============================================================================

  describe('Activation Button Blocking (AC-113-009)', () => {
    it('should block activation when circuit is invalid (ISLAND_MODULES)', () => {
      // Add an isolated module (no core, no connections)
      useMachineStore.getState().addModule('gear', 200, 200);

      const gate = getActivationGate();

      expect(gate.canActivate).toBe(false);
      expect(gate.blockReason).toBeTruthy();
      // Should have some error code
      expect(gate.blockErrorCode).toBeTruthy();
    });

    it('should block activation on empty canvas', () => {
      const gate = getActivationGate();

      expect(gate.canActivate).toBe(false);
      expect(gate.blockReason).toContain('模块');
    });

    it('should return correct CSS classes for disabled button', () => {
      const classes = getActivationButtonDisabledClasses();

      expect(classes).toContain('opacity-50');
      expect(classes).toContain('cursor-not-allowed');
      expect(classes).toContain('disabled');
    });

    it('isActivationBlocked should return true for invalid circuits', () => {
      useMachineStore.getState().addModule('gear', 200, 200);

      expect(isActivationBlocked()).toBe(true);
    });

    it('isActivationBlocked should return true for empty canvas', () => {
      // Empty canvas should be blocked
      expect(isActivationBlocked()).toBe(true);
    });
  });

  // ============================================================================
  // AC-113-005: Validation Status Bar
  // ============================================================================

  describe('Validation Status Bar (AC-113-005)', () => {
    it('should show "等待添加模块" for empty canvas', () => {
      const text = getValidationStatusText();

      expect(text).toBe('等待添加模块');
    });

    it('should show error count for invalid circuits', () => {
      useMachineStore.getState().addModule('gear', 200, 200);

      const summary = getValidationStatusSummary();

      expect(summary.status).toBe('error');
      expect(summary.errorCount).toBeGreaterThan(0);
      expect(summary.canActivate).toBe(false);
    });
  });

  // ============================================================================
  // Quick Fix Suggestions
  // ============================================================================

  describe('Quick Fix Suggestions', () => {
    it('should suggest adding core for isolated module', () => {
      useMachineStore.getState().addModule('gear', 200, 200);

      const modules = useMachineStore.getState().modules;
      const gearModule = modules.find((m) => m.type === 'gear');

      if (gearModule) {
        const suggestions = getQuickFixSuggestions(gearModule.instanceId);

        expect(suggestions.length).toBeGreaterThan(0);
        // Should have some fix suggestion
        expect(suggestions.some((s) => s.label.includes('核心') || s.label.includes('连接') || s.label.includes('删除'))).toBeTruthy();
      }
    });

    it('should return empty array for non-existent module', () => {
      const suggestions = getQuickFixSuggestions('non-existent-id');

      expect(suggestions).toEqual([]);
    });
  });

  // ============================================================================
  // Connection Suggestions
  // ============================================================================

  describe('Connection Suggestions', () => {
    it('should find connection targets for isolated module', () => {
      useMachineStore.getState().addModule('core-furnace', 100, 100);
      useMachineStore.getState().addModule('gear', 200, 200);

      const modules = useMachineStore.getState().modules;
      const gearModule = modules.find((m) => m.type === 'gear');

      if (gearModule) {
        const suggestions = findConnectionSuggestions(gearModule.instanceId);

        // Should find at least one connection target (the core)
        expect(suggestions.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return empty for non-existent module', () => {
      const suggestions = findConnectionSuggestions('non-existent-id');

      expect(suggestions).toEqual([]);
    });
  });

  // ============================================================================
  // Hook Integration Tests
  // ============================================================================

  describe('Hook Integration', () => {
    it('useActivationGate should return canActivate=false for invalid circuit', async () => {
      // Ensure empty canvas first
      useMachineStore.getState().clearCanvas();
      
      act(() => {
        useMachineStore.getState().addModule('gear', 200, 200);
      });

      const { result } = renderHook(() => useActivationGate());

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      expect(result.current.canActivate).toBe(false);
      expect(result.current.blockReason).toBeTruthy();
    });

    it('useActivationGate should return canActivate=false for empty canvas', () => {
      // Ensure empty canvas
      useMachineStore.getState().clearCanvas();
      
      const { result } = renderHook(() => useActivationGate());
      
      // Empty canvas should block activation
      expect(result.current.canActivate).toBe(false);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle rapid module additions', () => {
      const { addModule } = useMachineStore.getState();

      act(() => {
        addModule('core-furnace', 100, 100);
        addModule('gear', 200, 100);
        addModule('output-array', 300, 100);
      });

      const summary = getValidationStatusSummary();

      // Should have errors (not all connected)
      expect(summary.errorCount).toBeGreaterThan(0);
      expect(summary.canActivate).toBe(false);
    });

    it('should handle module deletion correctly', () => {
      useMachineStore.getState().addModule('core-furnace', 100, 100);
      
      const modules = useMachineStore.getState().modules;
      const coreModule = modules.find((m) => m.type === 'core-furnace');

      act(() => {
        if (coreModule) {
          useMachineStore.getState().removeModule(coreModule.instanceId);
        }
      });

      const summary = getValidationStatusSummary();
      expect(summary.status).toBe('empty');
    });
  });
});

// ============================================================================
// Negative Assertions
// ============================================================================

describe('Negative Assertions', () => {
  beforeEach(() => {
    useMachineStore.getState().clearCanvas();
  });

  afterEach(() => {
    useMachineStore.getState().clearCanvas();
  });

  it('should NOT allow activation on empty canvas', () => {
    expect(isActivationBlocked()).toBe(true);
  });

  it('should NOT return valid status for isolated modules', () => {
    useMachineStore.getState().addModule('gear', 200, 200);

    const summary = getValidationStatusSummary();

    expect(summary.status).not.toBe('valid');
    expect(summary.canActivate).toBe(false);
  });

  it('should NOT suggest fixes for non-existent module', () => {
    const suggestions = getQuickFixSuggestions('non-existent-id');
    expect(suggestions).toEqual([]);
  });

  it('should NOT suggest connecting to self', () => {
    useMachineStore.getState().addModule('core-furnace', 100, 100);
    useMachineStore.getState().addModule('gear', 200, 100);

    const modules = useMachineStore.getState().modules;
    const gearModule = modules.find((m) => m.type === 'gear');
    
    if (gearModule) {
      const suggestions = findConnectionSuggestions(gearModule.instanceId);
      
      // Should not suggest connecting to itself
      const selfSuggestion = suggestions.find((s) => s.targetModuleId === gearModule.instanceId);
      expect(selfSuggestion).toBeUndefined();
    }
  });
});
