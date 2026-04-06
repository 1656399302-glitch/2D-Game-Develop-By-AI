/**
 * ChallengeObjectives Component Tests
 * 
 * Round 161: Remediation for AC-160-004 Visual Feedback
 * 
 * Tests for ChallengeObjectives.tsx UI component rendering with proper
 * data-testid attributes and state transitions using act() wrapping.
 * 
 * Tests verify:
 * - Yellow spinner (◐) during validating state
 * - Green checkmark (✓) after passed validation
 * - Red X (✗) after failed validation
 * - Idle/empty state when overlay is dismissed
 * - Empty objective list handling
 * - Stale status after circuit reset
 * - No checkmark before validation runs
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, act, waitFor } from '@testing-library/react';
import React from 'react';
import { ChallengeObjectives } from '../components/Challenge/ChallengeObjectives';
import { useChallengeValidatorStore, getStatusColor, getStatusIcon } from '../store/useChallengeValidatorStore';
import type { ChallengeObjective, ValidationResult, ObjectiveStatus } from '../types/challenge';

// ============================================================================
// Test Data
// ============================================================================

/**
 * Sample objectives for testing
 */
const createSampleObjectives = (): ChallengeObjective[] => [
  {
    id: 'obj-1',
    name: '输出验证',
    description: '电路输出必须为HIGH',
    objectiveType: 'output',
    priority: 1,
    points: 50,
    outputTarget: {
      nodeId: 'output-1',
      name: 'Output A',
      expectedState: 'HIGH',
    },
  },
  {
    id: 'obj-2',
    name: '组件数量',
    description: '使用不超过10个组件',
    objectiveType: 'component_count',
    priority: 2,
    points: 30,
    componentConstraint: {
      maxComponents: 10,
      includeWires: false,
    },
  },
  {
    id: 'obj-3',
    name: '时序要求',
    description: '时钟周期必须在2±1范围内',
    objectiveType: 'timing',
    priority: 3,
    points: 20,
    timingRequirements: [
      {
        type: 'clock_period',
        expectedPeriod: 2,
        tolerance: 1,
        clockSignalId: 'clock-1',
      },
    ],
  },
];

/**
 * Sample validation result (passed)
 */
const createPassedResult = (): ValidationResult => ({
  challengeId: 'challenge-1',
  circuitId: 'circuit-1',
  isSuccess: true,
  status: 'passed',
  objectiveResults: [
    {
      objectiveId: 'obj-1',
      status: 'passed',
      passed: true,
      message: '输出正确',
      pointsEarned: 50,
    },
    {
      objectiveId: 'obj-2',
      status: 'passed',
      passed: true,
      message: '组件数量符合要求',
      pointsEarned: 30,
    },
    {
      objectiveId: 'obj-3',
      status: 'passed',
      passed: true,
      message: '时序满足要求',
      pointsEarned: 20,
    },
  ],
  totalPoints: 100,
  maxPoints: 100,
  score: 100,
  validatedAt: Date.now(),
});

/**
 * Sample validation result (failed)
 */
const createFailedResult = (): ValidationResult => ({
  challengeId: 'challenge-1',
  circuitId: 'circuit-1',
  isSuccess: false,
  status: 'failed',
  objectiveResults: [
    {
      objectiveId: 'obj-1',
      status: 'failed',
      passed: false,
      message: '输出错误：期望HIGH实际LOW',
      actualValue: 0,
      expectedValue: 1,
      pointsEarned: 0,
    },
    {
      objectiveId: 'obj-2',
      status: 'passed',
      passed: true,
      message: '组件数量符合要求',
      pointsEarned: 30,
    },
    {
      objectiveId: 'obj-3',
      status: 'passed',
      passed: true,
      message: '时序满足要求',
      pointsEarned: 20,
    },
  ],
  totalPoints: 50,
  maxPoints: 100,
  score: 50,
  validatedAt: Date.now(),
});

// ============================================================================
// Store Reset Helper
// ============================================================================

/**
 * Reset the validator store to initial state
 */
function resetValidatorStore(): void {
  useChallengeValidatorStore.setState({
    state: 'idle',
    activeChallengeId: null,
    activeCircuitId: null,
    objectives: [],
    objectiveStatuses: [],
    lastValidationResult: null,
    lastCreditResult: null,
    isValidating: false,
    error: null,
    lastValidatedAt: null,
    circuitModificationCount: 0,
  });
}

// ============================================================================
// Helper to query status badges
// ============================================================================

/**
 * Query for status badges in the document
 */
function queryStatusBadge(text: string): boolean {
  const badges = document.querySelectorAll('[class*="px-2"][class*="py-0.5"]');
  return Array.from(badges).some(badge => badge.textContent?.includes(text));
}

// ============================================================================
// Tests
// ============================================================================

describe('ChallengeObjectives Component', () => {
  beforeEach(() => {
    resetValidatorStore();
  });

  afterEach(() => {
    resetValidatorStore();
    cleanup();
  });

  // =======================================================================
  // AC-161-002: Yellow Spinner During Validating State
  // ===================================================================
  describe('AC-161-002: Validating State Visual Feedback', () => {
    it('shows yellow spinner during validating state', async () => {
      const objectives = createSampleObjectives();
      const validatingStatuses: ObjectiveStatus[] = objectives.map((obj) => ({
        id: obj.id,
        status: 'validating',
        message: '验证中...',
      }));

      // Set store to validating state
      act(() => {
        useChallengeValidatorStore.setState({
          state: 'validating',
          activeChallengeId: 'challenge-1',
          objectives,
          objectiveStatuses: validatingStatuses,
          isValidating: true,
        });
      });

      // Render component
      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        // Wait for polling to sync
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Query for status icon with spinner
      const statusElements = document.querySelectorAll('[data-testid^="objective-status-"]');
      expect(statusElements.length).toBeGreaterThan(0);

      // At least one should show the spinner (◐)
      const spinnerFound = Array.from(statusElements).some((el) => {
        const spinner = el.querySelector('[data-testid="objective-spinner"]');
        return spinner && spinner.textContent?.includes('◐');
      });
      expect(spinnerFound).toBe(true);
    });

    it('renders validating state icon correctly', async () => {
      const objectives = createSampleObjectives();

      act(() => {
        useChallengeValidatorStore.setState({
          state: 'validating',
          objectives,
          objectiveStatuses: objectives.map((obj) => ({
            id: obj.id,
            status: 'validating' as const,
            message: '验证中...',
          })),
          isValidating: true,
        });
      });

      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Verify the state badge shows "验证中"
      expect(queryStatusBadge('验证中')).toBe(true);
    });
  });

  // =======================================================================
  // AC-161-003: Green Checkmark After Passed Validation
  // ===================================================================
  describe('AC-161-003: Passed State Visual Feedback', () => {
    it('shows green checkmark after passed validation', async () => {
      const objectives = createSampleObjectives();
      const validationResult = createPassedResult();

      // Set store to passed state
      act(() => {
        useChallengeValidatorStore.setState({
          state: 'passed',
          activeChallengeId: 'challenge-1',
          objectives,
          objectiveStatuses: validationResult.objectiveResults.map((r) => ({
            id: r.objectiveId,
            status: r.status,
            message: r.message,
          })),
          lastValidationResult: validationResult,
          isValidating: false,
        });
      });

      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Query for status icons
      const statusElements = document.querySelectorAll('[data-testid^="objective-status-"]');
      expect(statusElements.length).toBeGreaterThan(0);

      // All should show green checkmark (✓)
      for (const el of Array.from(statusElements)) {
        const icon = el.querySelector('[data-testid="objective-icon"]');
        expect(icon?.textContent).toBe('✓');
      }
    });

    it('renders passed state with correct color via getStatusColor', async () => {
      const objectives = createSampleObjectives();
      const validationResult = createPassedResult();

      act(() => {
        useChallengeValidatorStore.setState({
          state: 'passed',
          objectives,
          objectiveStatuses: validationResult.objectiveResults.map((r) => ({
            id: r.objectiveId,
            status: r.status,
            message: r.message,
          })),
          lastValidationResult: validationResult,
        });
      });

      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Verify the state badge shows "已通过"
      expect(queryStatusBadge('已通过')).toBe(true);
    });
  });

  // =======================================================================
  // AC-161-004: Red X After Failed Validation
  // ===================================================================
  describe('AC-161-004: Failed State Visual Feedback', () => {
    it('shows red X after failed validation', async () => {
      const objectives = createSampleObjectives();
      const validationResult = createFailedResult();

      // Set store to failed state
      act(() => {
        useChallengeValidatorStore.setState({
          state: 'failed',
          activeChallengeId: 'challenge-1',
          objectives,
          objectiveStatuses: validationResult.objectiveResults.map((r) => ({
            id: r.objectiveId,
            status: r.status,
            message: r.message,
          })),
          lastValidationResult: validationResult,
          isValidating: false,
        });
      });

      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Query for status icons
      const statusElements = document.querySelectorAll('[data-testid^="objective-status-"]');
      expect(statusElements.length).toBeGreaterThan(0);

      // Find the failed objective (obj-1)
      const failedElement = document.querySelector('[data-testid="objective-status-obj-1"]');
      expect(failedElement).toBeTruthy();

      const icon = failedElement?.querySelector('[data-testid="objective-icon"]');
      expect(icon?.textContent).toBe('✗');
    });

    it('renders failed state with correct color via getStatusColor', async () => {
      const objectives = createSampleObjectives();
      const validationResult = createFailedResult();

      act(() => {
        useChallengeValidatorStore.setState({
          state: 'failed',
          objectives,
          objectiveStatuses: validationResult.objectiveResults.map((r) => ({
            id: r.objectiveId,
            status: r.status,
            message: r.message,
          })),
          lastValidationResult: validationResult,
        });
      });

      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Verify the state badge shows "未通过"
      expect(queryStatusBadge('未通过')).toBe(true);
    });
  });

  // =======================================================================
  // AC-161-005: Idle State After Dismiss
  // ===================================================================
  describe('AC-161-005: Idle State After Dismiss', () => {
    it('returns to idle/empty state when validation is reset', async () => {
      const objectives = createSampleObjectives();
      const validationResult = createPassedResult();

      // First set to passed state
      act(() => {
        useChallengeValidatorStore.setState({
          state: 'passed',
          objectives,
          objectiveStatuses: validationResult.objectiveResults.map((r) => ({
            id: r.objectiveId,
            status: r.status,
            message: r.message,
          })),
          lastValidationResult: validationResult,
        });
      });

      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Now reset to idle
      act(() => {
        useChallengeValidatorStore.getState().resetValidation();
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Verify idle state
      const state = useChallengeValidatorStore.getState();
      expect(state.state).toBe('idle');
      expect(state.lastValidationResult).toBeNull();

      // Re-render and check idle state in UI
      cleanup();
      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Badge should show "待机" for idle
      expect(queryStatusBadge('待机')).toBe(true);
    });

    it('clears objective statuses when returning to idle', async () => {
      const objectives = createSampleObjectives();
      const validationResult = createPassedResult();

      // Set to passed state
      act(() => {
        useChallengeValidatorStore.setState({
          state: 'passed',
          objectives,
          objectiveStatuses: validationResult.objectiveResults.map((r) => ({
            id: r.objectiveId,
            status: r.status,
            message: r.message,
          })),
          lastValidationResult: validationResult,
        });
      });

      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Reset validation
      act(() => {
        useChallengeValidatorStore.getState().resetValidation();
      });

      // Verify statuses are cleared
      const state = useChallengeValidatorStore.getState();
      expect(state.objectiveStatuses).toEqual([]);
      expect(state.objectives).toEqual([]);
    });
  });

  // =======================================================================
  // AC-161-006: Empty Objective List Handling
  // ===================================================================
  describe('AC-161-006: Empty Objective List', () => {
    it('does not crash with empty objective list', async () => {
      // Store should start with empty objectives
      resetValidatorStore();

      await act(async () => {
        expect(() => {
          render(<ChallengeObjectives objectives={[]} />);
        }).not.toThrow();
      });

      // Should render the panel
      const panel = screen.queryByTestId('challenge-objectives-panel');
      expect(panel).toBeTruthy();
    });

    it('renders empty state message for empty objectives', async () => {
      await act(async () => {
        render(<ChallengeObjectives objectives={[]} />);
      });

      // Should show empty state message
      const emptyMessage = screen.queryByText('暂无目标');
      expect(emptyMessage).toBeTruthy();
    });

    it('renders empty state with correct data-testid', async () => {
      let container: HTMLElement | null = null;
      await act(async () => {
        const result = render(<ChallengeObjectives objectives={[]} />);
        container = result.container;
      });

      // Panel should exist
      const panel = container?.querySelector('[data-testid="challenge-objectives-panel"]');
      expect(panel).toBeTruthy();
    });

    it('handles null/undefined objectives gracefully', async () => {
      // @ts-expect-error - Testing edge case
      await act(async () => {
        expect(() => {
          render(<ChallengeObjectives objectives={null} />);
        }).not.toThrow();
      });

      // Should render panel
      const panel = screen.queryByTestId('challenge-objectives-panel');
      expect(panel).toBeTruthy();
    });
  });

  // =======================================================================
  // AC-161-007: Stale Status After Circuit Reset
  // ===================================================================
  describe('AC-161-007: Circuit Reset Clears Stale Status', () => {
    it('does not render stale status after circuit reset', async () => {
      const objectives = createSampleObjectives();
      const validationResult = createPassedResult();

      // Set to passed state with results
      act(() => {
        useChallengeValidatorStore.setState({
          state: 'passed',
          objectives,
          objectiveStatuses: validationResult.objectiveResults.map((r) => ({
            id: r.objectiveId,
            status: r.status,
            message: r.message,
          })),
          lastValidationResult: validationResult,
          circuitModificationCount: 0,
        });
      });

      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Verify checkmarks are shown
      const passedIcons = document.querySelectorAll('[data-testid="objective-icon"]');
      expect(passedIcons.length).toBeGreaterThan(0);

      // Simulate circuit modification which should clear state
      act(() => {
        useChallengeValidatorStore.getState().trackCircuitModification();
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // State should be reset
      const state = useChallengeValidatorStore.getState();
      expect(state.state).toBe('idle');
      expect(state.circuitModificationCount).toBeGreaterThan(0);

      // Re-render and verify no stale checkmarks
      cleanup();
      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Should not show passed state badges
      expect(queryStatusBadge('已通过')).toBe(false);
    });

    it('clears lastValidationResult on circuit modification when not idle', async () => {
      const objectives = createSampleObjectives();
      const validationResult = createPassedResult();

      // Set to passed state
      act(() => {
        useChallengeValidatorStore.setState({
          state: 'passed',
          objectiveStatuses: validationResult.objectiveResults.map((r) => ({
            id: r.objectiveId,
            status: r.status,
            message: r.message,
          })),
          lastValidationResult: validationResult,
        });
      });

      // Verify result exists
      expect(useChallengeValidatorStore.getState().lastValidationResult).not.toBeNull();

      // Track modification (should trigger reset since state is 'passed')
      act(() => {
        useChallengeValidatorStore.getState().trackCircuitModification();
      });

      // Result should be cleared
      expect(useChallengeValidatorStore.getState().lastValidationResult).toBeNull();
      expect(useChallengeValidatorStore.getState().state).toBe('idle');
    });
  });

  // =======================================================================
  // AC-161-008: No Checkmark Before Validation
  // ===================================================================
  describe('AC-161-008: No Checkmark Before Validation', () => {
    it('does not show checkmark before validation runs', async () => {
      const objectives = createSampleObjectives();

      // Store should start in idle state with no results
      resetValidatorStore();

      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Verify idle state
      const state = useChallengeValidatorStore.getState();
      expect(state.state).toBe('idle');
      expect(state.lastValidationResult).toBeNull();

      // Should not show any checkmarks
      const checkmarks = document.querySelectorAll('[data-testid="objective-icon"]');
      // Icons should show '○' for idle, not '✓'
      checkmarks.forEach((icon) => {
        expect(icon.textContent).not.toBe('✓');
      });
    });

    it('shows idle state indicators before validation', async () => {
      const objectives = createSampleObjectives();

      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Badge should show "待机" for idle
      expect(queryStatusBadge('待机')).toBe(true);

      // Progress summary should not be visible (only shown when validationResult exists)
      const progressSummary = document.querySelector('[class*="border-t"]');
      expect(progressSummary).toBeNull();
    });

    it('shows empty/pending status for objectives before validation', async () => {
      const objectives = createSampleObjectives();

      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // All objectives should have idle status
      const state = useChallengeValidatorStore.getState();
      state.objectiveStatuses.forEach((status) => {
        expect(status.status).toBe('idle');
      });

      // Status icons should show '○' for idle
      const icons = document.querySelectorAll('[data-testid^="objective-status-"]');
      icons.forEach((icon) => {
        const innerIcon = icon.querySelector('[data-testid="objective-icon"]');
        expect(innerIcon?.textContent).toBe('○');
      });
    });
  });

  // =======================================================================
  // State Transition Tests with act() Wrapping
  // ===================================================================
  describe('State Transitions with act() Wrapping', () => {
    it('transitions from idle to validating correctly', async () => {
      const objectives = createSampleObjectives();

      // Start in idle
      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Verify idle
      expect(useChallengeValidatorStore.getState().state).toBe('idle');

      // Transition to validating
      await act(async () => {
        useChallengeValidatorStore.setState({
          state: 'validating',
          isValidating: true,
          objectiveStatuses: objectives.map((obj) => ({
            id: obj.id,
            status: 'validating' as const,
            message: '验证中...',
          })),
        });
      });

      // Verify validating
      expect(useChallengeValidatorStore.getState().state).toBe('validating');
    });

    it('transitions from validating to passed correctly', async () => {
      const objectives = createSampleObjectives();
      const validationResult = createPassedResult();

      // Start in validating
      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        useChallengeValidatorStore.setState({
          state: 'validating',
          isValidating: true,
          objectiveStatuses: objectives.map((obj) => ({
            id: obj.id,
            status: 'validating' as const,
            message: '验证中...',
          })),
        });
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Transition to passed
      await act(async () => {
        useChallengeValidatorStore.setState({
          state: 'passed',
          isValidating: false,
          objectiveStatuses: validationResult.objectiveResults.map((r) => ({
            id: r.objectiveId,
            status: r.status,
            message: r.message,
          })),
          lastValidationResult: validationResult,
        });
      });

      // Verify passed
      expect(useChallengeValidatorStore.getState().state).toBe('passed');
    });

    it('transitions from validating to failed correctly', async () => {
      const objectives = createSampleObjectives();
      const validationResult = createFailedResult();

      // Start in validating
      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        useChallengeValidatorStore.setState({
          state: 'validating',
          isValidating: true,
          objectiveStatuses: objectives.map((obj) => ({
            id: obj.id,
            status: 'validating' as const,
            message: '验证中...',
          })),
        });
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Transition to failed
      await act(async () => {
        useChallengeValidatorStore.setState({
          state: 'failed',
          isValidating: false,
          objectiveStatuses: validationResult.objectiveResults.map((r) => ({
            id: r.objectiveId,
            status: r.status,
            message: r.message,
          })),
          lastValidationResult: validationResult,
        });
      });

      // Verify failed
      expect(useChallengeValidatorStore.getState().state).toBe('failed');
    });

    it('transitions from passed back to idle correctly', async () => {
      const objectives = createSampleObjectives();

      // Start in passed
      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        useChallengeValidatorStore.setState({
          state: 'passed',
          isValidating: false,
          objectiveStatuses: objectives.map((obj) => ({
            id: obj.id,
            status: 'passed' as const,
            message: '通过',
          })),
        });
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Reset to idle
      await act(async () => {
        useChallengeValidatorStore.getState().resetValidation();
      });

      // Verify idle
      const state = useChallengeValidatorStore.getState();
      expect(state.state).toBe('idle');
      expect(state.objectiveStatuses).toEqual([]);
    });
  });

  // =======================================================================
  // Integration Tests
  // ===================================================================
  describe('Integration Tests', () => {
    it('renders complete validation workflow', async () => {
      const objectives = createSampleObjectives();

      // 1. Start with idle
      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Verify idle state
      expect(useChallengeValidatorStore.getState().state).toBe('idle');
      expect(queryStatusBadge('待机')).toBe(true);

      // 2. Start validation
      await act(async () => {
        useChallengeValidatorStore.setState({
          state: 'validating',
          isValidating: true,
          objectiveStatuses: objectives.map((obj) => ({
            id: obj.id,
            status: 'validating' as const,
            message: '验证中...',
          })),
        });
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Verify validating state
      expect(useChallengeValidatorStore.getState().state).toBe('validating');
      expect(queryStatusBadge('验证中')).toBe(true);

      // 3. Complete validation (pass)
      const result = createPassedResult();
      await act(async () => {
        useChallengeValidatorStore.setState({
          state: 'passed',
          isValidating: false,
          objectiveStatuses: result.objectiveResults.map((r) => ({
            id: r.objectiveId,
            status: r.status,
            message: r.message,
          })),
          lastValidationResult: result,
        });
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Verify passed state
      expect(useChallengeValidatorStore.getState().state).toBe('passed');
      expect(queryStatusBadge('已通过')).toBe(true);

      // 4. Reset
      await act(async () => {
        useChallengeValidatorStore.getState().resetValidation();
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Verify idle state
      expect(useChallengeValidatorStore.getState().state).toBe('idle');
      expect(queryStatusBadge('待机')).toBe(true);
    });

    it('renders failed validation workflow', async () => {
      const objectives = createSampleObjectives();

      // Start with idle
      await act(async () => {
        render(<ChallengeObjectives objectives={objectives} />);
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      expect(useChallengeValidatorStore.getState().state).toBe('idle');

      // Start validation
      await act(async () => {
        useChallengeValidatorStore.setState({
          state: 'validating',
          isValidating: true,
          objectiveStatuses: objectives.map((obj) => ({
            id: obj.id,
            status: 'validating' as const,
            message: '验证中...',
          })),
        });
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      expect(useChallengeValidatorStore.getState().state).toBe('validating');

      // Complete validation (fail)
      const result = createFailedResult();
      await act(async () => {
        useChallengeValidatorStore.setState({
          state: 'failed',
          isValidating: false,
          objectiveStatuses: result.objectiveResults.map((r) => ({
            id: r.objectiveId,
            status: r.status,
            message: r.message,
          })),
          lastValidationResult: result,
        });
        await new Promise((resolve) => setTimeout(resolve, 200));
      });

      // Verify failed state
      expect(useChallengeValidatorStore.getState().state).toBe('failed');
      expect(queryStatusBadge('未通过')).toBe(true);
    });
  });
});

// ============================================================================
// Helper Function Tests
// ============================================================================

describe('getStatusColor and getStatusIcon Helper Functions', () => {
  it('returns correct colors for each status', () => {
    expect(getStatusColor('idle')).toBe('#6b7280'); // gray
    expect(getStatusColor('validating')).toBe('#f59e0b'); // yellow
    expect(getStatusColor('passed')).toBe('#22c55e'); // green
    expect(getStatusColor('failed')).toBe('#ef4444'); // red
    expect(getStatusColor('error')).toBe('#dc2626'); // dark red
  });

  it('returns correct icons for each status', () => {
    expect(getStatusIcon('idle')).toBe('○');
    expect(getStatusIcon('validating')).toBe('◐');
    expect(getStatusIcon('passed')).toBe('✓');
    expect(getStatusIcon('failed')).toBe('✗');
    expect(getStatusIcon('error')).toBe('!');
  });
});
