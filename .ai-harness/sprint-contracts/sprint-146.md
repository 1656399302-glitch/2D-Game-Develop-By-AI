# Sprint Contract — Round 146

## APPROVED

---

## Scope

**Theme: UX/Visual Quality Enhancement Sprint**

Focus on improving visual polish, micro-interactions, and UI feedback patterns that affect user experience without changing core functionality.

## Spec Traceability

### P0 Items (Must Complete)
- None - no P0 items in spec are blocked by this sprint

### P1 Items (Should Complete)
- **Circuit UI Polish**: Enhance circuit node visual states, wire rendering, and selection indicators
- **Panel Visual Consistency**: Improve visual consistency across editor panels (ModulePanel, PropertiesPanel, LayersPanel)
- **Loading States**: Add/improve loading skeletons for lazy-loaded components

### P2 Items (Intentional Deferral)
- New feature development
- Major refactoring of existing components
- Accessibility improvements beyond current WCAG 2.1 AA compliance

### Spec Coverage This Round
- Spec §Core Features/Canvas System: UX polish only, no functional changes
- Spec §Core Features/Components: Visual enhancements to existing components
- Spec §Design Language: Dark theme with circuit-board aesthetic - enhance glow effects and visual polish

## Deliverables

1. **Enhanced circuit node visual states** (`src/components/Circuit/CanvasCircuitNode.tsx`)
   - Animated selection border using CSS transition
   - Clear signal state indicators (powered vs unpowered) with distinct color/glow
   - Consistent sizing and spacing

2. **Improved wire rendering** (`src/components/Circuit/CircuitWire.tsx`)
   - Enhanced wire path rendering with proper visual quality
   - Signal flow indication on powered wires
   - Extended hit area for wire selection (minimum 8px tolerance)

3. **Panel visual consistency updates** (`src/components/Editor/*.tsx`)
   - Consistent border-radius (12px) across panels
   - Standardized hover/focus states
   - Improved scrollbar styling for panel content areas

4. **Loading skeleton for lazy-loaded components** (`src/App.tsx`)
   - Enhance LazyLoadingFallback with animated skeleton
   - Skeleton states for at least 3 lazy-loaded components

5. **New test file** (`src/__tests__/UXVisualEnhancements.test.tsx`)
   - Test coverage for new visual states
   - Tests verifying CSS classes and inline styles applied correctly

## Acceptance Criteria

### AC-146-001: Circuit Node Selection Visual
- **Criterion**: Circuit nodes display animated selection border when selected
- **Verification**: Select a circuit node → `getComputedStyle()` returns transition on border-color property OR element has CSS class that triggers transition
- **Evidence**: CSS transition or animation defined on selection indicator element

### AC-146-002: Signal State Visual Feedback
- **Criterion**: Circuit nodes show clear visual difference between powered (signal=true) and unpowered (signal=false) states
- **Verification**: Toggle INPUT node → connected wires/nodes have different CSS classes or inline styles for powered vs unpowered
- **Evidence**: At minimum, `fill`, `stroke`, or `filter` CSS properties differ between states

### AC-146-003: Wire Selection Hit Area
- **Criterion**: Wires have sufficient click target area for selection (minimum 8px)
- **Verification**: Click near (but not directly on) wire path → wire still gets selected
- **Evidence**: SVG path hit area extends at least 8px from visible path, OR overlay invisible hit-area element exists

### AC-146-004: Panel Border Consistency
- **Criterion**: All editor panels use consistent `border-radius: 12px`
- **Verification**: Check ModulePanel, PropertiesPanel, LayersPanel → all have matching border-radius
- **Evidence**: CSS variable, constant, or identical value used across panels

### AC-146-005: Lazy Loading Skeleton Animation
- **Criterion**: Loading fallback shows animated skeleton with pulsing effect
- **Verification**: Navigate to component with lazy load → skeleton visible with animation
- **Evidence**: Skeleton element has CSS animation (keyframes) or transition applied

### AC-146-006: Hover State Consistency
- **Criterion**: Interactive elements have consistent hover state across panels
- **Verification**: Hover over buttons/inputs in different panels → CSS classes or variables match
- **Evidence**: Shared CSS classes used, or identical CSS variable values for hover states

### AC-146-007: Test Suite ≥6040 Tests
- **Criterion**: Test suite passes with ≥6040 tests (maintain baseline)
- **Verification**: `npm test -- --run` → tests pass, count ≥6040
- **Evidence**: Test count ≥6040, no regressions

### AC-146-008: Bundle Size ≤512KB
- **Criterion**: dist/assets/index-*.js ≤524,288 bytes (512KB)
- **Verification**: `npm run build` → bundle size check
- **Evidence**: Bundle ≤512KB after changes

### AC-146-009: TypeScript 0 Errors
- **Criterion**: npx tsc --noEmit exit code 0
- **Verification**: Run TypeScript compiler with --noEmit
- **Evidence**: No type errors introduced

### AC-146-010: No Regression in Circuit Functionality
- **Criterion**: Adding nodes, connecting wires, circuit mode toggle all still work
- **Verification**: Test that circuit store operations complete without error
- **Evidence**: Circuit operations (addNode, addWire, toggleCircuitMode) return success

## Test Methods

### TM-146-001: Visual State Tests
1. **Setup**: Render CircuitModulePanel with circuit mode enabled, add nodes to canvas
2. **Action**: Select a circuit node, toggle input signal
3. **Verify**: 
   - Selected node element has CSS class with transition defined, OR computed style includes transition
   - Powered node has different fill/stroke/filter than unpowered node
   - Component labels visible and correctly positioned

### TM-146-002: Wire Selection Tests
1. **Setup**: Create circuit with connected nodes
2. **Action**: Inspect wire SVG element for hit area
3. **Verify**: Wire path has stroke-width > visible width, OR overlay hit-area element exists
4. **Negative**: Wire should NOT be hard to click (no micro-thin paths)

### TM-146-003: Panel Consistency Tests
1. **Setup**: Import ModulePanel, PropertiesPanel, LayersPanel components
2. **Action**: Read their root element styles or CSS classes
3. **Verify**: All panels have border-radius: 12px (via CSS variable, class, or inline style)
4. **Verify**: Hover classes/variables are shared or identical across panels

### TM-146-004: Loading Skeleton Tests
1. **Setup**: Access LazyLoadingFallback component
2. **Action**: Read component CSS or rendered classes
3. **Verify**: Skeleton element references animation (keyframes name) or has transition
4. **Verify**: At least 3 components use this fallback (import chain check)

### TM-146-005: Regression Tests
1. **Run**: `npm test -- --run`
2. **Verify**: All 221+ test files pass
3. **Verify**: Test count ≥6040

### TM-146-006: Build Verification
1. **Run**: `npm run build`
2. **Verify**: Bundle generated at dist/assets/index-*.js
3. **Verify**: File size ≤512KB

### TM-146-007: Circuit Functionality Smoke Test
1. **Run**: Test file exercising circuit store
2. **Verify**: addNode returns node object with id
3. **Verify**: Circuit mode toggle completes without throwing

## Risks

### R1: CSS Animation Performance
- **Risk**: Adding animations may cause jank on lower-end devices
- **Mitigation**: Use CSS transforms and opacity only (GPU-accelerated), avoid layout-triggering properties
- **Fallback**: Provide `prefers-reduced-motion` media query to disable animations

### R2: Visual Changes Affecting Tests
- **Risk**: DOM query tests may break if element classes/attributes change
- **Mitigation**: Only modify CSS classes/styles, not HTML structure; add `data-testid` where needed
- **Fallback**: Update affected tests if structure changes are necessary

### R3: Bundle Size Increase
- **Risk**: Adding new CSS or assets may push bundle over 512KB
- **Mitigation**: Only add inline CSS (minimal size increase); no new external assets
- **Fallback**: Remove less critical visual enhancements if bundle approaches limit

## Failure Conditions

The round must FAIL if any of the following occur:

1. **FC-1**: Test suite drops below 6040 tests passing
2. **FC-2**: Bundle size exceeds 512KB
3. **FC-3**: TypeScript compilation produces any errors (exit code ≠ 0)
4. **FC-4**: Circuit node addition breaks (addNode returns error or undefined)
5. **FC-5**: Wire connection breaks (addWire throws or returns invalid result)
6. **FC-6**: Circuit mode toggle stops working
7. **FC-7**: New visual states cause console errors
8. **FC-8**: Loading skeletons fail to render for lazy components

## Done Definition

The sprint is complete when ALL of the following are true:

1. ✅ All 10 acceptance criteria pass (AC-146-001 through AC-146-010)
2. ✅ `npm test -- --run` passes with ≥6040 tests
3. ✅ `npm run build` produces bundle ≤512KB
4. ✅ `npx tsc --noEmit` produces 0 errors
5. ✅ Component inspection confirms:
   - Circuit nodes have selection indicator with CSS transition/animation
   - Signal states use different CSS properties (fill/stroke/filter) for powered vs unpowered
   - Wire hit area extends ≥8px from visible path
   - All panels have border-radius: 12px
   - Loading skeletons have CSS animation or transition
6. ✅ Code review confirms:
   - CSS uses GPU-accelerated properties only
   - `prefers-reduced-motion` supported for accessibility
   - No breaking changes to existing component APIs

## Out of Scope

The following are explicitly NOT being done in this sprint:

1. **New features**: No new circuit components, panels, or store actions
2. **Accessibility improvements**: Existing WCAG 2.1 AA compliance maintained, no enhancements
3. **Performance optimization**: No refactoring for performance (visual changes only)
4. **Documentation**: No spec updates, README changes, or inline documentation
5. **Mobile layout changes**: Desktop UX only, mobile untouched
6. **Backend/integration work**: No API changes, mock data continues to work
7. **Browser support expansion**: Current browser support maintained
8. **State management changes**: No store refactoring or new state patterns
9. **Test framework changes**: Continue using Vitest as configured
10. **Dependency updates**: No npm package updates in this sprint

## Operator Inbox Instructions (Round 146)

The following items are **explicitly retained** for this contract round and must not be dropped or weakened:

1. **Signal state CSS verification (AC-146-002)**: Must verify different CSS properties between powered/unpowered states - requires reading actual computed styles or CSS class names, not just visual inspection

2. **Wire hit area tolerance (AC-146-003, TM-146-002)**: Must verify wire has ≥8px click tolerance - SVG stroke-width extension OR invisible hit-area overlay element must be present

3. **Panel border-radius consistency (AC-146-004)**: Must check ModulePanel, PropertiesPanel, AND LayersPanel all use 12px - shared CSS variable or identical value required

4. **Test count floor (AC-146-007)**: Must maintain ≥6040 tests - no net reduction in test count allowed

5. **Bundle size cap (AC-146-008)**: Must remain ≤512KB - visual changes must not push bundle over limit

6. **Circuit functionality regression (AC-146-010)**: addNode, addWire, toggleCircuitMode must all continue to work - no breaking changes to circuit store operations
