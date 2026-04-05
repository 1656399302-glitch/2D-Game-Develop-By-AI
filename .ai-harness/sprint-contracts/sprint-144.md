APPROVED

# Sprint Contract — Round 144

## Scope

This sprint completes the circuit canvas UI by implementing:
1. **CircuitPalette** — Component selection panel for adding circuit elements
2. **Sequential gate SVG shapes** — Full implementations for Timer, Counter, SR Latch, D Latch, D Flip-Flop
3. **Wire junction support** — Junction points for complex wire routing
4. **Multi-layer circuit support** — Basic layer switching for circuits
5. **Integration tests** — Comprehensive coverage for all new components

## Spec Traceability

### P0 (Must Complete)
- **CircuitPalette** — UI for adding gates, inputs, outputs to canvas
- **Sequential gate shapes** — SVG shapes for Timer, Counter, SR_LATCH, D_LATCH, D_FLIP_FLOP
- **Wire junction points** — Junction node type for wire splitting
- **Multi-layer support** — Layer switching for circuits
- **Integration tests** — Test coverage for all new components

### P1 (Covered this round)
- Circuit component rendering with proper SVG shapes
- Store actions for junction and layer management
- Component tests for palette and sequential gates

### Remaining P0/P1 after this round
- Custom sub-circuit module creation (deferred to future round)
- Tech tree UI for circuit unlocks (deferred)
- Community gallery for circuits (deferred)
- Circuit puzzle challenges (deferred)

### P2 Intentionally Deferred
- Wire auto-routing algorithms
- Circuit optimization/minimization
- Circuit export to image/HDL formats
- Cloud sync for circuits

## Deliverables

1. **`src/components/Circuit/CircuitPalette.tsx`** — Component selection panel
2. **`src/components/Circuit/SequentialGates.tsx`** — SVG shapes for Timer, Counter, SR_LATCH, D_LATCH, D_FLIP_FLOP
3. **`src/components/Circuit/WireJunction.tsx`** — Junction point component
4. **`src/store/useCircuitCanvasStore.ts`** (updates) — Junction and layer management actions
5. **`src/types/circuitCanvas.ts`** (updates) — Junction and Layer types
6. **`src/__tests__/CircuitPalette.test.tsx`** — CircuitPalette tests (≥20 tests)
7. **`src/__tests__/SequentialGates.test.tsx`** — Sequential gate tests (≥20 tests)
8. **`src/__tests__/WireJunction.test.tsx`** — Junction tests (≥10 tests)
9. **`src/__tests__/circuitLayerSupport.test.ts`** — Layer support tests (≥10 tests)
10. **`src/__tests__/circuitCanvas.integration.test.tsx`** (updates) — Additional integration tests

## Acceptance Criteria

### AC-144-001: CircuitPalette Renders All Component Types
- **Criterion:** Palette displays 14 component buttons: 7 logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR) + 5 sequential (TIMER, COUNTER, SR_LATCH, D_LATCH, D_FLIP_FLOP) + Input + Output
- **Test:** Renders with data-testid="circuit-palette", contains 14 component buttons

### AC-144-002: CircuitPalette Click Adds Component to Canvas
- **Criterion:** Clicking a component button in palette calls addCircuitNode with correct type and position
- **Test:** Mock onAdd callback, click button, verify callback called with correct parameters

### AC-144-003: Sequential Gates Render Correct SVG Shapes
- **Criterion:** Timer, Counter, SR_LATCH, D_LATCH, D_FLIP_FLOP render with distinct SVG shapes that differ from combinational gates
- **Test:** Each sequential gate has unique SVG path elements

### AC-144-004: Sequential Gate Output Signal Colors
- **Criterion:** Sequential gates display correct signal colors (green=#22c55e for HIGH, gray=#64748b for LOW)
- **Test:** Verify gate labels use correct color classes based on output state

### AC-144-005: WireJunction Creates Junction Point
- **Criterion:** Junction nodes allow multiple wires to connect at single point
- **Test:** Store action createJunction creates node with type='junction'

### AC-144-006: WireJunction Visual Rendering
- **Criterion:** Junction renders as filled circle (8px diameter) on canvas
- **Test:** Junction component renders SVG circle with correct data-testid

### AC-144-007: Multi-Layer Support — Create Layer
- **Criterion:** Circuit canvas supports multiple layers, createLayer action adds new layer
- **Test:** Store action creates layer with id, name, visible properties

### AC-144-008: Multi-Layer Support — Switch Layers
- **Criterion:** setActiveLayer switches which layer's nodes are visible
- **Test:** After switching layer, only nodes on active layer render

### AC-144-009: Multi-Layer Support — Layer Isolation
- **Criterion:** Nodes on different layers are isolated (wires only within same layer)
- **Test:** Wire creation fails if source and target nodes are on different layers

### AC-144-010: Test Suite Passes
- **Criterion:** All tests pass (baseline ≥5920 + new tests ≥60)
- **Command:** `npm test -- --run`

### AC-144-011: Bundle Size Under Limit
- **Criterion:** Bundle ≤512KB after additions
- **Command:** Check dist/assets/*.js size

### AC-144-012: TypeScript Clean
- **Criterion:** No TypeScript errors
- **Command:** `npx tsc --noEmit`

## Test Methods

### AC-144-001 through AC-144-004: CircuitPalette
1. Render `<CircuitPalette />` with required props
2. Query `data-testid="circuit-palette"` to verify container exists
3. Query all `[data-palette-item]` elements to count items (expect 14)
4. Click each button and verify `onAdd` callback parameters
5. For sequential gates, verify unique SVG shapes by checking SVG path elements

### AC-144-005 through AC-144-006: WireJunction
1. Import `WireJunction` component and render
2. Verify SVG circle with `data-testid="wire-junction"` exists
3. Verify circle radius, fill color based on props
4. Test store action `createJunction(x, y)` creates proper node

### AC-144-007 through AC-144-009: Layer Support
1. Call `createLayer(name)` store action
2. Verify returned layer object has `id`, `name`, `visible`, `nodeIds`
3. Call `setActiveLayer(layerId)` and verify state updates
4. Create nodes on different layers, attempt wire between layers, verify failure

### AC-144-010: Test Suite
1. Run `npm test -- --run` in workspace
2. Verify exit code 0
3. Verify test count ≥ 5980 (5920 baseline + 60 new)

### AC-144-011: Bundle Size
1. Run `npm run build`
2. Check `ls -la dist/assets/*.js`
3. Verify each file < 524288 bytes

### AC-144-012: TypeScript
1. Run `npx tsc --noEmit`
2. Verify exit code 0 with no output

## Risks

1. **Sequential gate state persistence** — Timer/Counter need tick-based simulation; timing bugs possible
2. **Layer isolation logic** — Wire creation across layers must be blocked at store level
3. **Test mocking complexity** — Store dependencies may require extensive mocking

## Failure Conditions

1. Test suite has failures after `npm test -- --run`
2. Bundle size exceeds 512KB
3. TypeScript compilation errors
4. Any AC criterion fails verification

## Done Definition

All of the following must be true:

1. ✅ `CircuitPalette.test.tsx` exists with ≥20 passing tests
2. ✅ `SequentialGates.test.tsx` exists with ≥20 passing tests
3. ✅ `WireJunction.test.tsx` exists with ≥10 passing tests
4. ✅ `circuitLayerSupport.test.ts` exists with ≥10 passing tests
5. ✅ `circuitCanvas.integration.test.tsx` updated with additional tests
6. ✅ Total test count ≥ 5980
7. ✅ Bundle < 512KB
8. ✅ TypeScript 0 errors
9. ✅ All 12 AC criteria pass

## Out of Scope

1. Circuit auto-routing algorithms
2. Circuit optimization/minimization
3. Circuit export formats (image, HDL)
4. Cloud sync
5. Custom sub-circuit module creation
6. Tech tree UI for circuit unlocks
7. Community gallery
8. Circuit puzzle challenges
9. Machine module integration with circuit nodes
