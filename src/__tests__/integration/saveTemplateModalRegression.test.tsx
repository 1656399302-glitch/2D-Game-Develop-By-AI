/**
 * SaveTemplateModal Regression Tests
 * 
 * Round 152: Remediation Sprint
 * 
 * These tests verify that the Archive popup (SaveTemplateModal) does NOT hang
 * when clicking Save or Cancel. This addresses the operator inbox items
 * (1775113667868) that identified archive popup hangs as critical issues.
 * 
 * Acceptance Criteria:
 * - AC-152-001: Modal opens and renders with correct Chinese UI content
 * - AC-152-002: Modal does NOT hang when clicking "保存模板" (500ms timeout)
 * - AC-152-003: Modal does NOT hang when clicking "取消" (immediate dismiss)
 * - AC-152-004: Modal dismisses within 500ms after successful save
 * - AC-152-005: Rapid consecutive clicks handled gracefully
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Create mock functions
const mockAddTemplate = vi.fn();
const mockSetViewport = vi.fn();
const mockLoadMachine = vi.fn();
const mockToggleGrid = vi.fn();

// Mock the stores - must be before imports
vi.mock('../../store/useTemplateStore', () => ({
  useTemplateStore: vi.fn((selector) => {
    if (typeof selector === 'function') {
      return selector({
        addTemplate: mockAddTemplate,
        templates: [],
        isLoading: false,
        removeTemplate: vi.fn(),
        updateTemplate: vi.fn(),
        duplicateTemplate: vi.fn(),
        toggleFavorite: vi.fn(),
        loadTemplate: vi.fn(),
        getTemplate: vi.fn(),
        getTemplatesByCategory: vi.fn(),
        getFavoriteTemplates: vi.fn(),
        getFilteredTemplates: vi.fn(),
      });
    }
    return {
      addTemplate: mockAddTemplate,
      templates: [],
      isLoading: false,
      removeTemplate: vi.fn(),
      updateTemplate: vi.fn(),
      duplicateTemplate: vi.fn(),
      toggleFavorite: vi.fn(),
      loadTemplate: vi.fn(),
      getTemplate: vi.fn(),
      getTemplatesByCategory: vi.fn(),
      getFavoriteTemplates: vi.fn(),
      getFilteredTemplates: vi.fn(),
    };
  }),
}));

vi.mock('../../store/useMachineStore', () => ({
  useMachineStore: vi.fn((selector) => {
    if (typeof selector === 'function') {
      return selector({
        modules: [],
        connections: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        gridEnabled: true,
        setViewport: mockSetViewport,
        loadMachine: mockLoadMachine,
        toggleGrid: mockToggleGrid,
      });
    }
    return {
      modules: [],
      connections: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      gridEnabled: true,
      setViewport: mockSetViewport,
      loadMachine: mockLoadMachine,
      toggleGrid: mockToggleGrid,
    };
  }),
}));

// Import the component under test AFTER mocks are set up
import { SaveTemplateModal } from '../../components/Templates/SaveTemplateModal';

describe('SaveTemplateModal Regression Tests', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockOnSuccess: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockOnSuccess = vi.fn();
    
    // Reset all mocks
    mockAddTemplate.mockReset();
    mockSetViewport.mockReset();
    mockLoadMachine.mockReset();
    mockToggleGrid.mockReset();
    
    // Default mock implementations
    mockAddTemplate.mockReturnValue({
      success: true,
      template: { id: 'test-template-id', name: 'Test Template' },
    });
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ========================================================================
  // AC-152-001: Modal Opens and Renders with Correct Chinese UI Content
  // ========================================================================
  
  describe('AC-152-001: Modal opens and renders with correct Chinese UI content', () => {
    it('should render modal with correct Chinese UI content when isOpen is true', () => {
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} />);
      
      // Verify header text (h2 element specifically)
      expect(screen.getByRole('heading', { name: /保存模板/i })).toBeInTheDocument();
      expect(screen.getByText('将当前机器保存为可复用的模板')).toBeInTheDocument();
      
      // Verify template name label
      expect(screen.getByText(/模板名称/)).toBeInTheDocument();
      
      // Verify category label
      expect(screen.getByText(/模板类别/)).toBeInTheDocument();
      
      // Verify description label (optional)
      expect(screen.getByText(/描述.*可选|描述/)).toBeInTheDocument();
      
      // Verify buttons
      expect(screen.getByRole('button', { name: /取消/i })).toBeInTheDocument();
      // Use button text matcher (saves template button contains text)
      const saveButtons = screen.getAllByRole('button', { name: /保存模板/i });
      expect(saveButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('should not render modal when isOpen is false', () => {
      render(<SaveTemplateModal isOpen={false} onClose={mockOnClose} />);
      
      // Modal should not be visible (check for heading)
      expect(screen.queryByRole('heading', { name: /保存模板/i })).not.toBeInTheDocument();
    });

    it('should display correct category options', () => {
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} />);
      
      // Verify category options are rendered
      expect(screen.getByText('入门')).toBeInTheDocument();
      expect(screen.getByText('战斗')).toBeInTheDocument();
      expect(screen.getByText('能量')).toBeInTheDocument();
      expect(screen.getByText('防御')).toBeInTheDocument();
      expect(screen.getByText('自定义')).toBeInTheDocument();
    });

    it('should show template name input field', () => {
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} />);
      
      const nameInput = screen.getByRole('textbox', { name: /模板名称/i });
      expect(nameInput).toBeInTheDocument();
    });
  });

  // ========================================================================
  // AC-152-002: Modal Does NOT Hang When Clicking "保存模板"
  // ========================================================================
  
  describe('AC-152-002: SaveTemplateModal does NOT hang when clicking "保存模板"', () => {
    it('should dismiss modal within 500ms when clicking save with valid input', async () => {
      vi.useFakeTimers();
      
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      // Fill in template name
      const nameInput = screen.getByRole('textbox', { name: /模板名称/i });
      fireEvent.change(nameInput, { target: { value: 'My Test Template' } });
      
      // Click save button
      const saveButtons = screen.getAllByRole('button', { name: /保存模板/i });
      fireEvent.click(saveButtons[saveButtons.length - 1]); // Click the actual save button (not the header)
      
      // Wait for any potential async operations (up to 500ms)
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      
      // Modal should close
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      
      // onSuccess should be called with template ID
      expect(mockOnSuccess).toHaveBeenCalledWith('test-template-id');
      
      vi.useRealTimers();
    });

    it('should not hang - onClose called synchronously on successful save', async () => {
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      // Fill in template name
      const nameInput = screen.getByRole('textbox', { name: /模板名称/i });
      fireEvent.change(nameInput, { target: { value: 'Quick Save Test' } });
      
      // Measure time from click to callback
      const startTime = Date.now();
      const saveButtons = screen.getAllByRole('button', { name: /保存模板/i });
      fireEvent.click(saveButtons[saveButtons.length - 1]);
      const endTime = Date.now();
      
      // Should complete immediately (within 100ms, not 500ms+)
      expect(endTime - startTime).toBeLessThan(100);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // ========================================================================
  // AC-152-003: Modal Does NOT Hang When Clicking "取消"
  // ========================================================================
  
  describe('AC-152-003: SaveTemplateModal does NOT hang when clicking "取消"', () => {
    it('should dismiss modal immediately when clicking cancel button', () => {
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} />);
      
      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /取消/i });
      fireEvent.click(cancelButton);
      
      // onClose should be called immediately (no async delay)
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should dismiss immediately without calling addTemplate', () => {
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} />);
      
      // Fill in template name (to ensure save would work)
      const nameInput = screen.getByRole('textbox', { name: /模板名称/i });
      fireEvent.change(nameInput, { target: { value: 'Test' } });
      
      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /取消/i });
      fireEvent.click(cancelButton);
      
      // addTemplate should NOT be called
      expect(mockAddTemplate).not.toHaveBeenCalled();
      
      // onClose should be called
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should dismiss within 100ms when clicking cancel', () => {
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} />);
      
      const startTime = Date.now();
      const cancelButton = screen.getByRole('button', { name: /取消/i });
      fireEvent.click(cancelButton);
      const endTime = Date.now();
      
      // Should be instant (within 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // ========================================================================
  // AC-152-004: Modal Dismisses Within 500ms After Successful Save
  // ========================================================================
  
  describe('AC-152-004: Modal dismisses within 500ms after successful save', () => {
    it('should complete save and close within 500ms using fake timers', async () => {
      vi.useFakeTimers();
      
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      // Fill in template name
      const nameInput = screen.getByRole('textbox', { name: /模板名称/i });
      fireEvent.change(nameInput, { target: { value: 'Timed Save Test' } });
      
      // Click save
      const saveButtons = screen.getAllByRole('button', { name: /保存模板/i });
      fireEvent.click(saveButtons[saveButtons.length - 1]);
      
      // Advance timers to simulate any async operations
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      
      // Verify operations completed
      expect(mockAddTemplate).toHaveBeenCalledWith(
        'Timed Save Test',
        'custom', // default category
        [],
        [],
        { x: 0, y: 0, zoom: 1 },
        { gridEnabled: true }
      );
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnSuccess).toHaveBeenCalledWith('test-template-id');
      
      vi.useRealTimers();
    });

    it('should handle save operation completion with real timers', async () => {
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      
      // Fill in template name
      const nameInput = screen.getByRole('textbox', { name: /模板名称/i });
      fireEvent.change(nameInput, { target: { value: 'Async Save Test' } });
      
      // Click save
      const saveButtons = screen.getAllByRole('button', { name: /保存模板/i });
      fireEvent.click(saveButtons[saveButtons.length - 1]);
      
      // Wait briefly for React to process
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
      
      // Verify all operations completed
      expect(mockOnSuccess).toHaveBeenCalledWith('test-template-id');
    });
  });

  // ========================================================================
  // AC-152-005: Rapid Consecutive Clicks Handled Gracefully
  // ========================================================================
  
  describe('AC-152-005: Rapid consecutive clicks on save button handled gracefully', () => {
    it('should handle 3 rapid clicks gracefully without multiple saves', async () => {
      vi.useFakeTimers();
      
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} />);
      
      // Fill in valid template name
      const nameInput = screen.getByRole('textbox', { name: /模板名称/i });
      fireEvent.change(nameInput, { target: { value: 'Rapid Click Test' } });
      
      // Get save button (last button with "保存模板" text)
      const saveButtons = screen.getAllByRole('button', { name: /保存模板/i });
      const saveButton = saveButtons[saveButtons.length - 1];
      
      // Click save button 3 times rapidly
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);
      
      // Advance timers
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      
      // addTemplate should only be called once (first click succeeds and closes modal)
      expect(mockAddTemplate).toHaveBeenCalledTimes(1);
      
      // onClose should only be called once
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      
      vi.useRealTimers();
    });

    it('should not cause modal to hang after rapid clicks', async () => {
      vi.useFakeTimers();
      
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} />);
      
      // Fill in valid template name
      const nameInput = screen.getByRole('textbox', { name: /模板名称/i });
      fireEvent.change(nameInput, { target: { value: 'No Hang Test' } });
      
      const saveButtons = screen.getAllByRole('button', { name: /保存模板/i });
      const saveButton = saveButtons[saveButtons.length - 1];
      
      // Rapid clicks
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);
      
      // Wait 500ms
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      
      // Modal should have closed (no hang)
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      
      vi.useRealTimers();
    });

    it('should only save once even with rapid clicks during save process', async () => {
      vi.useFakeTimers();
      
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} />);
      
      // Fill in valid template name
      const nameInput = screen.getByRole('textbox', { name: /模板名称/i });
      fireEvent.change(nameInput, { target: { value: 'Single Save Test' } });
      
      const saveButtons = screen.getAllByRole('button', { name: /保存模板/i });
      const saveButton = saveButtons[saveButtons.length - 1];
      
      // Click rapidly multiple times
      for (let i = 0; i < 5; i++) {
        fireEvent.click(saveButton);
      }
      
      // Advance timers
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      
      // Only one save should occur
      expect(mockAddTemplate).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      
      vi.useRealTimers();
    });
  });

  // ========================================================================
  // Additional Regression Tests
  // ========================================================================
  
  describe('Additional modal close behavior tests', () => {
    it('should close modal on Escape key press', async () => {
      vi.useFakeTimers();
      
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} />);
      
      // Press Escape
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });
      
      // Advance timers for any potential async handlers
      await act(async () => {
        vi.advanceTimersByTime(100);
      });
      
      // Modal should close
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      
      vi.useRealTimers();
    });

    it('should close modal when clicking close button in header', () => {
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} />);
      
      // Click close button (×) - it's the button in header
      const closeButton = screen.getByRole('button', { name: /Close.*dialog/i });
      fireEvent.click(closeButton);
      
      // Modal should close
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should have save button disabled when template name is empty', () => {
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} />);
      
      // Get save button
      const saveButtons = screen.getAllByRole('button', { name: /保存模板/i });
      const saveButton = saveButtons[saveButtons.length - 1];
      
      // Button should be disabled when name is empty
      expect(saveButton).toBeDisabled();
    });

    it('should have save button enabled when template name is filled', () => {
      render(<SaveTemplateModal isOpen={true} onClose={mockOnClose} />);
      
      // Fill in template name
      const nameInput = screen.getByRole('textbox', { name: /模板名称/i });
      fireEvent.change(nameInput, { target: { value: 'Test Name' } });
      
      // Get save button
      const saveButtons = screen.getAllByRole('button', { name: /保存模板/i });
      const saveButton = saveButtons[saveButtons.length - 1];
      
      // Button should be enabled when name is filled
      expect(saveButton).not.toBeDisabled();
    });
  });
});

/**
 * Summary of Test Coverage for AC-152-001 through AC-152-005:
 * 
 * AC-152-001: Modal Opens with Correct Content
 *   ✅ Renders modal with Chinese UI content
 *   ✅ Shows all required labels (模板名称, 分类, 描述)
 *   ✅ Displays both buttons (保存模板, 取消)
 *   ✅ Shows category options (入门, 战斗, 能量, 防御, 自定义)
 * 
 * AC-152-002: Save Button Does NOT Hang
 *   ✅ Modal closes within 500ms when clicking save
 *   ✅ onClose called synchronously on successful save
 *   ✅ onSuccess called with template ID
 * 
 * AC-152-003: Cancel Button Does NOT Hang
 *   ✅ Modal dismisses immediately on cancel click
 *   ✅ addTemplate not called on cancel
 *   ✅ Dismisses within 100ms
 * 
 * AC-152-004: Successful Save Completes Within 500ms
 *   ✅ Save and dismiss completes within 500ms with fake timers
 *   ✅ Works with real async timers as well
 * 
 * AC-152-005: Rapid Clicks Handled Gracefully
 *   ✅ 3 rapid clicks only result in 1 save
 *   ✅ Modal does not hang after rapid clicks
 *   ✅ 5 rapid clicks only result in 1 save
 * 
 * Additional Coverage:
 *   ✅ Escape key closes modal
 *   ✅ Close button (×) closes modal
 *   ✅ Save button disabled when name empty
 *   ✅ Save button enabled when name filled
 */
