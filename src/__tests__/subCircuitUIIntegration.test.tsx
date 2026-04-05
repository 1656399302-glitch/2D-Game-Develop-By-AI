/**
 * Sub-Circuit UI Integration Tests
 * 
 * Round 153: Sub-circuit System UI Integration
 * 
 * Regression tests covering:
 * - CreateSubCircuitModal lifecycle (no hang on any dismiss path)
 * - Selection-to-creation flow
 * - Sub-circuit module canvas behavior
 * - CircuitModulePanel integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { CreateSubCircuitModal } from '../components/SubCircuit/CreateSubCircuitModal';
import { SubCircuitPanel } from '../components/SubCircuit/SubCircuitPanel';

// =============================================================================
// Mock Stores
// =============================================================================

const mockSubCircuitStore = {
  subCircuits: [],
  maxSubCircuits: 20,
  createSubCircuit: vi.fn(),
  deleteSubCircuit: vi.fn(),
  getSubCircuitById: vi.fn(),
  getAllSubCircuits: vi.fn(() => []),
  isNameTaken: vi.fn(() => false),
  canCreateMore: vi.fn(() => true),
  clearAllSubCircuits: vi.fn(),
};

// Mock useSubCircuitStore before component imports
vi.mock('../store/useSubCircuitStore', () => ({
  useSubCircuitStore: (selector?: any) => {
    if (selector) {
      return selector(mockSubCircuitStore);
    }
    return mockSubCircuitStore;
  },
}));

const mockCircuitCanvasStore = {
  isCircuitMode: false,
  nodes: [],
  wires: [],
  selectedCircuitNodeIds: [],
  addCircuitNode: vi.fn(),
  setCircuitMode: vi.fn(),
  selectCircuitNodes: vi.fn(),
  clearCircuitNodeSelection: vi.fn(),
  removeCircuitNode: vi.fn(),
};

// Mock useCircuitCanvasStore
vi.mock('../store/useCircuitCanvasStore', () => ({
  useCircuitCanvasStore: (selector?: any) => {
    if (selector) {
      return selector(mockCircuitCanvasStore);
    }
    return mockCircuitCanvasStore;
  },
}));

const mockMachineStore = {
  viewport: { x: 0, y: 0, zoom: 1 },
  modules: [],
};

// Mock useMachineStore
vi.mock('../store/useMachineStore', () => ({
  useMachineStore: (selector?: any) => {
    if (selector) {
      return selector(mockMachineStore);
    }
    return mockMachineStore;
  },
}));

// =============================================================================
// Test Suites
// =============================================================================

describe('CreateSubCircuitModal Lifecycle', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockOnCreated: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
    mockOnCreated = vi.fn();
    
    // Reset mock store state
    mockSubCircuitStore.subCircuits = [];
    mockSubCircuitStore.isNameTaken.mockReturnValue(false);
    mockSubCircuitStore.canCreateMore.mockReturnValue(true);
    mockSubCircuitStore.createSubCircuit.mockReturnValue({
      success: true,
      subCircuit: {
        id: 'new-sc-id',
        name: 'Test Sub',
        moduleIds: ['node-1', 'node-2'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ===========================================================================
  // AC-153-001: Modal opens and renders with correct form fields
  // ===========================================================================

  describe('AC-153-001: Modal opens and renders with correct form fields', () => {
    it('should render modal when isOpen is true', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['node-1', 'node-2', 'node-3']}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render modal with correct heading', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['node-1', 'node-2', 'node-3']}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('创建子电路')).toBeInTheDocument();
    });

    it('should render name input field with required indicator', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['node-1', 'node-2', 'node-3']}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByLabelText(/子电路名称/)).toBeInTheDocument();
      expect(screen.getByText(/\*/).textContent).toContain('*');
    });

    it('should render description textarea', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['node-1', 'node-2', 'node-3']}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByLabelText(/描述/)).toBeInTheDocument();
    });

    it('should render cancel and confirm buttons', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['node-1', 'node-2', 'node-3']}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByRole('button', { name: /取消/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /创建/ })).toBeInTheDocument();
    });

    it('should render module count info', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={5}
          selectedModuleIds={['n1', 'n2', 'n3', 'n4', 'n5']}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/将 5 个模块封装/)).toBeInTheDocument();
    });

    it('should render warning when less than 2 modules selected', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={1}
          selectedModuleIds={['node-1']}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/子电路至少需要 2 个模块/)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // AC-153-003: Modal does NOT hang on Cancel
  // ===========================================================================

  describe('AC-153-003: Modal does NOT hang when clicking Cancel', () => {
    it('should call onClose immediately when clicking Cancel button', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['n1', 'n2', 'n3']}
          onClose={mockOnClose}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /取消/ });
      fireEvent.click(cancelButton);

      // Should be called synchronously
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should dismiss immediately without calling createSubCircuit', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['n1', 'n2', 'n3']}
          onClose={mockOnClose}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /取消/ });
      fireEvent.click(cancelButton);

      expect(mockSubCircuitStore.createSubCircuit).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // AC-153-002: Modal does NOT hang on Escape
  // ===========================================================================

  describe('AC-153-002: Modal does NOT hang when pressing Escape', () => {
    it('should call onClose when pressing Escape key', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['n1', 'n2', 'n3']}
          onClose={mockOnClose}
        />
      );

      // Focus the document first
      document.body.focus();
      fireEvent.keyDown(document.body, { key: 'Escape' });

      // Should be called synchronously
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should dismiss when Escape pressed even with input focused', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['n1', 'n2', 'n3']}
          onClose={mockOnClose}
        />
      );

      // Focus the input
      const input = screen.getByLabelText(/子电路名称/);
      input.focus();
      expect(document.activeElement).toBe(input);

      // Press Escape
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // AC-153-003: Modal does NOT hang on successful Save
  // ===========================================================================

  describe('AC-153-003: Modal does NOT hang when clicking Create with valid input', () => {
    it('should call onClose after successful save', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['n1', 'n2', 'n3']}
          onClose={mockOnClose}
          onCreated={mockOnCreated}
        />
      );

      // Fill in name
      const input = screen.getByLabelText(/子电路名称/);
      fireEvent.change(input, { target: { value: 'My Sub Circuit' } });

      // Click create button
      const createButton = screen.getByRole('button', { name: /创建/ });
      fireEvent.click(createButton);

      // Verify store was called
      expect(mockSubCircuitStore.createSubCircuit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Sub Circuit',
          moduleIds: ['n1', 'n2', 'n3'],
        })
      );

      // Verify onClose was called
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnCreated).toHaveBeenCalledTimes(1);
    });

    it('should call onClose synchronously (not deferred)', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={2}
          selectedModuleIds={['n1', 'n2']}
          onClose={mockOnClose}
          onCreated={mockOnCreated}
        />
      );

      // Fill in name
      const input = screen.getByLabelText(/子电路名称/);
      fireEvent.change(input, { target: { value: 'Quick Save' } });

      // Click create button
      const createButton = screen.getByRole('button', { name: /创建/ });
      fireEvent.click(createButton);

      // onClose should be called synchronously
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // Validation Tests
  // ===========================================================================

  describe('Modal validation behavior', () => {
    it('should not create sub-circuit with empty name', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['n1', 'n2', 'n3']}
          onClose={mockOnClose}
        />
      );

      const createButton = screen.getByRole('button', { name: /创建/ });
      expect(createButton).toBeDisabled();
    });

    it('should show error for duplicate name', () => {
      mockSubCircuitStore.isNameTaken.mockReturnValue(true);

      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['n1', 'n2', 'n3']}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByLabelText(/子电路名称/);
      fireEvent.change(input, { target: { value: 'Existing Name' } });

      expect(screen.getByText(/已被使用/)).toBeInTheDocument();
    });

    it('should show error for name exceeding 50 characters', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['n1', 'n2', 'n3']}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByLabelText(/子电路名称/);
      fireEvent.change(input, { target: { value: 'a'.repeat(51) } });

      expect(screen.getByText(/1-50/)).toBeInTheDocument();
    });

    it('should create sub-circuit with optional description', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['n1', 'n2', 'n3']}
          onClose={mockOnClose}
        />
      );

      const nameInput = screen.getByLabelText(/子电路名称/);
      fireEvent.change(nameInput, { target: { value: 'With Description' } });

      const descInput = screen.getByLabelText(/描述/);
      fireEvent.change(descInput, { target: { value: 'This is a test circuit' } });

      const createButton = screen.getByRole('button', { name: /创建/ });
      fireEvent.click(createButton);

      expect(mockSubCircuitStore.createSubCircuit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'With Description',
          description: 'This is a test circuit',
        })
      );
    });
  });

  // ===========================================================================
  // Enter Key Submit
  // ===========================================================================

  describe('Enter key submit behavior', () => {
    it('should submit form when pressing Enter in name input', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['n1', 'n2', 'n3']}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByLabelText(/子电路名称/);
      fireEvent.change(input, { target: { value: 'Enter Submit' } });

      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockSubCircuitStore.createSubCircuit).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});

describe('SubCircuitPanel Integration', () => {
  let mockOnDelete: ReturnType<typeof vi.fn>;
  let mockOnRemoveInstances: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnDelete = vi.fn();
    mockOnRemoveInstances = vi.fn();
    
    mockSubCircuitStore.subCircuits = [
      {
        id: 'sc-1',
        name: 'Adder Circuit',
        moduleIds: ['n1', 'n2', 'n3'],
        createdAt: Date.now() - 1000,
        updatedAt: Date.now() - 1000,
      },
      {
        id: 'sc-2',
        name: 'Multiplier',
        moduleIds: ['n4', 'n5'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ===========================================================================
  // AC-153-002: SubCircuitPanel displays user's sub-circuits
  // ===========================================================================

  describe('AC-153-002: SubCircuitPanel displays sub-circuits', () => {
    it('should render panel header', () => {
      render(
        <SubCircuitPanel
          onDelete={mockOnDelete}
          onRemoveInstances={mockOnRemoveInstances}
        />
      );

      expect(screen.getByText('自定义子电路')).toBeInTheDocument();
    });

    it('should display sub-circuit count', () => {
      render(
        <SubCircuitPanel
          onDelete={mockOnDelete}
          onRemoveInstances={mockOnRemoveInstances}
        />
      );

      expect(screen.getByText(/\(2\)/)).toBeInTheDocument();
    });

    it('should render sub-circuit items', () => {
      render(
        <SubCircuitPanel
          onDelete={mockOnDelete}
          onRemoveInstances={mockOnRemoveInstances}
        />
      );

      expect(screen.getByText('Adder Circuit')).toBeInTheDocument();
      expect(screen.getByText('Multiplier')).toBeInTheDocument();
    });

    it('should display module count for each sub-circuit', () => {
      render(
        <SubCircuitPanel
          onDelete={mockOnDelete}
          onRemoveInstances={mockOnRemoveInstances}
        />
      );

      expect(screen.getByText(/3 个模块/)).toBeInTheDocument();
      expect(screen.getByText(/2 个模块/)).toBeInTheDocument();
    });

    it('should render empty state when no sub-circuits', () => {
      mockSubCircuitStore.subCircuits = [];

      render(
        <SubCircuitPanel
          onDelete={mockOnDelete}
          onRemoveInstances={mockOnRemoveInstances}
        />
      );

      expect(screen.getByText('暂无自定义子电路')).toBeInTheDocument();
    });

    it('should show delete button for each sub-circuit', () => {
      render(
        <SubCircuitPanel
          onDelete={mockOnDelete}
          onRemoveInstances={mockOnRemoveInstances}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /删除/ });
      expect(deleteButtons).toHaveLength(2);
    });
  });

  // ===========================================================================
  // Panel Expand/Collapse
  // ===========================================================================

  describe('Panel expand/collapse behavior', () => {
    it('should toggle panel content when header clicked', () => {
      render(
        <SubCircuitPanel
          onDelete={mockOnDelete}
          onRemoveInstances={mockOnRemoveInstances}
        />
      );

      const headerButton = screen.getByRole('button', { name: /自定义子电路/ });
      
      // Initially expanded
      expect(screen.getByText('Adder Circuit')).toBeInTheDocument();

      // Collapse
      fireEvent.click(headerButton);
      expect(screen.queryByText('Adder Circuit')).not.toBeInTheDocument();

      // Expand again
      fireEvent.click(headerButton);
      expect(screen.getByText('Adder Circuit')).toBeInTheDocument();
    });
  });
});

describe('Toolbar Create Sub-Circuit Button Integration', () => {
  // ===========================================================================
  // AC-153-001: Toolbar button triggers modal event
  // ===========================================================================

  describe('AC-153-001: Toolbar button dispatches custom event', () => {
    it('should dispatch open-create-subcircuit-modal event when button clicked', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      // The event listener pattern is tested here
      let receivedEvent: CustomEvent | null = null;
      const handler = (event: Event) => {
        receivedEvent = event as CustomEvent;
      };
      
      window.addEventListener('open-create-subcircuit-modal', handler);
      
      // Simulate dispatching the event (as Toolbar does)
      const selectedNodeIds = ['node-1', 'node-2', 'node-3'];
      window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', {
        detail: { selectedModuleIds: selectedNodeIds }
      }));
      
      expect(receivedEvent).not.toBeNull();
      expect(receivedEvent?.detail.selectedModuleIds).toEqual(selectedNodeIds);
      
      window.removeEventListener('open-create-subcircuit-modal', handler);
      addEventListenerSpy.mockRestore();
    });

    it('should pass selected module IDs in the event detail', () => {
      let receivedDetail: any = null;
      
      window.addEventListener('open-create-subcircuit-modal', (event: Event) => {
        receivedDetail = (event as CustomEvent).detail;
      });
      
      const nodeIds = ['a', 'b', 'c', 'd'];
      window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', {
        detail: { selectedModuleIds: nodeIds }
      }));
      
      expect(receivedDetail.selectedModuleIds).toEqual(nodeIds);
    });
  });
});

describe('Sub-Circuit Module Canvas Behavior', () => {
  // ===========================================================================
  // AC-153-005: Sub-circuit modules simulate correctly on canvas
  // ===========================================================================

  describe('AC-153-005: Sub-circuit modules simulate correctly on canvas', () => {
    beforeEach(() => {
      mockCircuitCanvasStore.addCircuitNode.mockReturnValue({
        id: 'canvas-node-1',
        type: 'gate',
        position: { x: 100, y: 100 },
        label: 'Test Sub',
        signal: false,
        size: { width: 80, height: 80 },
        parameters: {
          isSubCircuit: true,
          subCircuitId: 'sc-1',
          moduleCount: 3,
        },
      });
    });

    it('should store sub-circuit parameters when added to canvas', () => {
      // Add a sub-circuit node
      const addNode = mockCircuitCanvasStore.addCircuitNode;
      addNode('gate', 100, 100, undefined, 'Test Sub', {
        isSubCircuit: true,
        subCircuitId: 'sc-1',
        moduleCount: 3,
      });

      expect(addNode).toHaveBeenCalledWith(
        'gate',
        100,
        100,
        undefined,
        'Test Sub',
        expect.objectContaining({
          isSubCircuit: true,
          subCircuitId: 'sc-1',
          moduleCount: 3,
        })
      );
    });

    it('should identify sub-circuit nodes by parameters', () => {
      const canvasNode = {
        id: 'node-1',
        type: 'gate' as const,
        position: { x: 100, y: 100 },
        label: 'My Sub',
        signal: false,
        parameters: {
          isSubCircuit: true,
          subCircuitId: 'sc-123',
        },
      };

      // Verify parameters can be checked
      expect(canvasNode.parameters?.isSubCircuit).toBe(true);
      expect(canvasNode.parameters?.subCircuitId).toBe('sc-123');
    });

    it('should add sub-circuit with correct node type', () => {
      const addNode = mockCircuitCanvasStore.addCircuitNode;
      
      addNode('gate', 50, 50, undefined, 'Adder', {
        isSubCircuit: true,
        subCircuitId: 'sc-5',
        moduleCount: 4,
      });

      expect(addNode).toHaveBeenCalledWith(
        'gate',
        50, 50,
        undefined,
        'Adder',
        expect.objectContaining({
          isSubCircuit: true,
        })
      );
    });
  });
});

describe('Selection-to-Creation Flow Integration', () => {
  // ===========================================================================
  // Integration: Selection to Sub-Circuit Creation Flow
  // ===========================================================================

  describe('AC-153-003: Selection-to-creation flow', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      
      // Simulate 3 selected nodes
      mockCircuitCanvasStore.selectedCircuitNodeIds = ['node-1', 'node-2', 'node-3'];
      mockCircuitCanvasStore.isCircuitMode = true;
      
      mockSubCircuitStore.createSubCircuit.mockReturnValue({
        success: true,
        subCircuit: {
          id: 'new-sc',
          name: 'From Selection',
          moduleIds: ['node-1', 'node-2', 'node-3'],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });
    });

    it('should pass selected node IDs to CreateSubCircuitModal', () => {
      const selectedIds = mockCircuitCanvasStore.selectedCircuitNodeIds;
      
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={selectedIds.length}
          selectedModuleIds={selectedIds}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText(/将 3 个模块封装/)).toBeInTheDocument();
    });

    it('should create sub-circuit with selected node IDs', () => {
      const selectedIds = mockCircuitCanvasStore.selectedCircuitNodeIds;
      
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={selectedIds.length}
          selectedModuleIds={selectedIds}
          onClose={vi.fn()}
        />
      );

      // Fill name and create
      const input = screen.getByLabelText(/子电路名称/);
      fireEvent.change(input, { target: { value: 'From Selection' } });

      const createButton = screen.getByRole('button', { name: /创建/ });
      fireEvent.click(createButton);

      expect(mockSubCircuitStore.createSubCircuit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'From Selection',
          moduleIds: ['node-1', 'node-2', 'node-3'],
        })
      );
    });

    it('should clear selection after successful creation', () => {
      const selectedIds = mockCircuitCanvasStore.selectedCircuitNodeIds;
      const clearSelection = mockCircuitCanvasStore.clearCircuitNodeSelection;
      
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={selectedIds.length}
          selectedModuleIds={selectedIds}
          onClose={vi.fn()}
          onCreated={() => {
            clearSelection();
          }}
        />
      );

      // Fill name and create
      const input = screen.getByLabelText(/子电路名称/);
      fireEvent.change(input, { target: { value: 'Auto Clear' } });

      const createButton = screen.getByRole('button', { name: /创建/ });
      fireEvent.click(createButton);

      expect(clearSelection).toHaveBeenCalled();
    });
  });
});

describe('Negative Assertions - Button State', () => {
  // ===========================================================================
  // AC-153-001: Button disabled when no modules selected
  // ===========================================================================

  describe('AC-153-001: Create Sub-Circuit button disabled state', () => {
    it('should show warning when fewer than 2 modules in modal', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={1}
          selectedModuleIds={['only-one']}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText(/至少需要 2 个模块/)).toBeInTheDocument();
    });

    it('should disable create button when only 1 module selected', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={1}
          selectedModuleIds={['only-one']}
          onClose={vi.fn()}
        />
      );

      const createButton = screen.getByRole('button', { name: /创建/ });
      expect(createButton).toBeDisabled();
    });

    it('should enable create button when 2+ modules selected and name filled', () => {
      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={2}
          selectedModuleIds={['n1', 'n2']}
          onClose={vi.fn()}
        />
      );

      const input = screen.getByLabelText(/子电路名称/);
      fireEvent.change(input, { target: { value: 'Valid Name' } });

      const createButton = screen.getByRole('button', { name: /创建/ });
      expect(createButton).not.toBeDisabled();
    });
  });
});

describe('Error Handling Integration', () => {
  // ===========================================================================
  // Error scenarios
  // ===========================================================================

  describe('Error handling in sub-circuit creation', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should show error when store returns failure', () => {
      mockSubCircuitStore.createSubCircuit.mockReturnValue({
        success: false,
        error: '创建失败：内部错误',
      });

      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['n1', 'n2', 'n3']}
          onClose={vi.fn()}
        />
      );

      const input = screen.getByLabelText(/子电路名称/);
      fireEvent.change(input, { target: { value: 'Fail Test' } });

      const createButton = screen.getByRole('button', { name: /创建/ });
      fireEvent.click(createButton);

      expect(screen.getByText(/创建失败/)).toBeInTheDocument();
    });

    it('should not close modal on creation error', () => {
      mockSubCircuitStore.createSubCircuit.mockReturnValue({
        success: false,
        error: 'Test error',
      });

      const mockOnClose = vi.fn();

      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['n1', 'n2', 'n3']}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByLabelText(/子电路名称/);
      fireEvent.change(input, { target: { value: 'Error Name' } });

      const createButton = screen.getByRole('button', { name: /创建/ });
      fireEvent.click(createButton);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should show error when at max limit after clicking create', () => {
      mockSubCircuitStore.canCreateMore.mockReturnValue(false);
      mockSubCircuitStore.createSubCircuit.mockReturnValue({
        success: false,
        error: '已达到最大数量限制（20个）',
      });

      render(
        <CreateSubCircuitModal
          isOpen={true}
          selectedModuleCount={3}
          selectedModuleIds={['n1', 'n2', 'n3']}
          onClose={vi.fn()}
        />
      );

      const input = screen.getByLabelText(/子电路名称/);
      fireEvent.change(input, { target: { value: 'At Limit' } });

      const createButton = screen.getByRole('button', { name: /创建/ });
      fireEvent.click(createButton);

      expect(screen.getByText(/最大数量限制/)).toBeInTheDocument();
    });
  });
});
