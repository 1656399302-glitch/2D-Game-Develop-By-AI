APPROVED

# Sprint Contract — Round 52

## Scope

This sprint focuses on **Performance Optimization and Editor Efficiency** — improving rendering performance, reducing unnecessary re-renders, optimizing canvas interactions, and adding keyboard shortcuts for faster workflow. The goal is to make the machine editor feel snappy and responsive even with complex machines.

> ⚠️ **Operator Inbox — Mandatory Testing Standards**: This round must test ALL functional models with strict standards. **Specifically required**: re-render reduction verification, canvas performance with 20+ modules, keyboard shortcut functionality, and undo/redo performance. **Any bugs found must be fixed before claiming round complete.** This is not optional.

## Spec Traceability

### P0 Items (Core Performance — This Round)
- **Canvas Rendering Optimization**: Reduce re-renders in the machine editor canvas
- **State Management Optimization**: Memoization improvements in Zustand store selectors
- **Component Memoization**: React.memo and useMemo strategic placement

### P1 Items (Editor Efficiency — This Round)
- **Keyboard Shortcuts Expansion**: Add more keyboard shortcuts for common operations
- **Canvas Interaction Performance**: Optimize drag, zoom, and pan operations
- **Connection Rendering Optimization**: Reduce connection path recalculations

### P0 Complete (from previous rounds)
- All major systems (Editor, Connections, Activation, Codex, AI, Exchange, Challenges, Recipe, Tech Tree)

### P1 Remaining (after this round)
- Mobile touch optimizations
- Advanced accessibility features
- Community/social enhancements

### P2 Intentionally Deferred
- Real AI API integration
- Multiplayer collaboration
- Extended faction storylines

---

## Deliverables

### D1: Canvas Rendering Optimization (`src/components/Editor/Canvas.tsx`)
- Implement `React.memo` for module rendering components
- Add virtualization for modules outside viewport (only render visible modules)
- Use `useMemo` for computed connection paths
- Optimize transform calculations with `useCallback` for handlers

### D2: Store Selector Optimization (`src/store/*.ts`)
- Add granular selectors to prevent unnecessary re-renders
- Optimize `useMachineStore` selectors with shallow comparison
- Add memoized selectors for computed values (connections, bounds, etc.)
- Implement selector composition pattern for complex queries

### D3: Keyboard Shortcuts Expansion (`src/hooks/useKeyboardShortcuts.ts`)
- Add shortcuts for: Delete (Backspace/Delete), Duplicate (Ctrl+D), Copy (Ctrl+C), Paste (Ctrl+V)
- Add shortcuts for: Select All (Ctrl+A), Deselect (Escape), Undo (Ctrl+Z), Redo (Ctrl+Shift+Z)
- Add shortcuts for: Save (Ctrl+S), Export (Ctrl+E), Random Forge (Ctrl+R)
- Add shortcuts for: Zoom In (+/=), Zoom Out (-), Reset Zoom (0)
- Visual keyboard shortcut hints in toolbar tooltips

### D4: Connection Path Optimization (`src/components/Connections/*.tsx`)
- Cache bezier curve calculations
- Use `requestAnimationFrame` for connection drag updates
- Implement connection path memoization
- Add debouncing for rapid connection changes

### D5: Performance Tests (`src/__tests__/performance.test.ts`)
- Tests verifying re-render counts in key components
- Tests for canvas performance with 20+ modules
- Tests for undo/redo performance
- Tests for connection rendering with 30+ connections

---

## Acceptance Criteria

### AC1: Re-render Reduction ✅
**Criterion**: Key components (Canvas, Toolbar, PropertiesPanel) must NOT re-render when unrelated state changes.

**Verification steps (MANDATORY — ALL must pass)**:
1. Create a machine with 5+ modules
2. Change viewport (pan/zoom) — verify Toolbar does NOT re-render
3. Add a module — verify only Canvas re-renders, not PropertiesPanel (when no module selected)
4. Select a module — verify PropertiesPanel re-renders, Canvas should NOT fully re-render
5. **Negative test**: Verify state changes that SHOULD trigger re-renders still work correctly

**Pass condition**: Component render count metrics show no unnecessary re-renders for unrelated state changes.

**Bug requirement**: Any re-render bugs found MUST be fixed before claiming complete.

### AC2: Canvas Performance with 20+ Modules ✅
**Criterion**: Canvas must remain responsive with 20+ modules, maintaining >30fps during interactions.

**Verification steps (MANDATORY — ALL must pass)**:
1. Generate a machine with 20 modules and 15 connections
2. Drag modules — verify smooth movement (no visible lag)
3. Zoom in/out — verify smooth operation
4. Pan — verify smooth operation
5. Drag connection endpoints — verify smooth updates
6. **Benchmark**: Measure render time <16ms per frame (60fps target)

**Pass condition**: Average frame time <16ms during interactions with 20+ modules.

**Bug requirement**: Any performance bugs found MUST be fixed before claiming complete.

### AC3: Keyboard Shortcuts Work Correctly ✅
**Criterion**: ALL new keyboard shortcuts function as specified and do NOT conflict with browser defaults.

**Verification steps (MANDATORY — Test EACH shortcut)**:
1. Delete/Backspace with module selected → module deleted
2. Ctrl+D with module selected → module duplicated
3. Ctrl+C with module selected → module copied to clipboard
4. Ctrl+V → last copied module pasted
5. Ctrl+A → all modules selected
6. Escape → all modules deselected
7. Ctrl+Z → undo last action
8. Ctrl+Shift+Z → redo last undone action
9. Ctrl+S → save triggered (no prompt required)
10. +/= → zoom in
11. - → zoom out
12. 0 → reset zoom to default
13. **Negative test**: Press shortcuts without any modules → no crash
14. **Negative test**: Press shortcuts with no prior copy/paste → no crash
15. **Conflict test**: Verify shortcuts do NOT override F5, Ctrl+W, Ctrl+T, etc.

**Pass condition**: All shortcuts function correctly; no browser conflicts; no crashes on edge cases.

**Bug requirement**: Any shortcut bugs (broken shortcuts, crashes, conflicts) MUST be fixed before claiming complete.

### AC4: Undo/Redo Performance ✅
**Criterion**: Undo and redo operations must complete in <100ms even with complex machines.

**Verification steps (MANDATORY — ALL must pass)**:
1. Create a machine with 10+ modules
2. Perform 20 undo operations — verify each completes in <100ms
3. Perform 20 redo operations — verify each completes in <100ms
4. **Negative test**: Undo when history is empty — verify no crash
5. **Negative test**: Redo when at latest state — verify no crash

**Pass condition**: All undo/redo operations complete in <100ms; no crashes on edge cases.

**Bug requirement**: Any undo/redo bugs MUST be fixed before claiming complete.

### AC5: Build & Tests Pass ✅
**Criterion**: `npm run build` produces 0 TypeScript errors; `npm test -- --run` passes all tests.

**Verification steps (MANDATORY)**:
1. Run `npm run build` — verify bundle builds successfully with 0 TypeScript errors
2. Run `npm test -- --run` — verify all tests pass (baseline 1839 + new tests must all pass)

**Pass condition**: Build succeeds; test count ≥1839 (no regression).

### AC6: Connection Rendering Performance ✅
**Criterion**: Connection paths must recalculate efficiently and not cause frame drops.

**Verification steps (MANDATORY — ALL must pass)**:
1. Create a machine with 15 connections
2. Drag a module — verify connections update smoothly
3. Verify no visible lag during rapid module movement
4. **Stress test**: With 30 connections, verify no console errors
5. **Negative test**: Rapid connection add/remove — verify no memory leaks

**Pass condition**: Smooth updates with 15+ connections; no errors with 30 connections; no memory leaks.

**Bug requirement**: Any connection bugs (memory leaks, errors) MUST be fixed before claiming complete.

---

## Test Methods

### TM1: Re-render Reduction (Unit + Integration Tests)
**Tools**: `react-render-counter`, custom render hook tracking, Jest spyOn

**Test cases**:
- `src/__tests__/performance/canvasMemoization.test.ts`
- `src/__tests__/performance/selectorGranularity.test.ts`

**Implementation**:
1. Mock Zustand store with controlled state changes
2. Use `jest.spyOn` on component render methods
3. Track render counts before/after unrelated state changes
4. Assert render counts remain unchanged for unrelated state

### TM2: Canvas Performance (Integration + Browser Tests)
**Tools**: `performance.now()`, React DevTools Profiler, browser frame timing

**Test cases**:
- `src/__tests__/performance/canvasWith20Modules.test.ts`
- `src/__tests__/performance/interactionSmoothness.test.ts`

**Implementation**:
1. Programmatically create 20 modules with 15 connections
2. Measure `performance.now()` for drag operations
3. Calculate average frame time over 100 interactions
4. Assert average <16ms per frame

### TM3: Keyboard Shortcuts (Unit + Browser Tests)
**Tools**: `@testing-library/user-event`, custom keyboard event dispatch

**Test cases**:
- `src/__tests__/performance/keyboardShortcuts.test.ts`
- `src/__tests__/performance/keyboardConflicts.test.ts`

**Implementation**:
1. Mock keyboard events with `@testing-library/user-event`
2. Verify correct store actions dispatched
3. Test with and without module selection context
4. Test browser conflict shortcuts (F5, Ctrl+W, etc.)

### TM4: Undo/Redo Performance (Unit Tests)
**Tools**: `performance.now()`, Jest timer mocks

**Test cases**:
- `src/__tests__/performance/undoRedoPerformance.test.ts`
- `src/__tests__/performance/undoRedoEdgeCases.test.ts`

**Implementation**:
1. Create machine with 10+ modules
2. Measure time for each undo/redo operation
3. Assert each operation <100ms
4. Test edge cases (empty history, at-latest-state)

### TM5: Build Verification (CI)
**Command**: `npm run build && npm test -- --run`

**Implementation**:
1. CI runs build step first
2. CI runs test suite second
3. Build must succeed before tests run
4. Test count must be ≥1839

### TM6: Connection Rendering (Unit + Stress Tests)
**Tools**: `performance.now()`, memory profiling, console error tracking

**Test cases**:
- `src/__tests__/performance/connectionPathMemoization.test.ts`
- `src/__tests__/performance/connectionStress.test.ts`

**Implementation**:
1. Create machines with varying connection counts (5, 15, 30)
2. Measure path recalculation time
3. Monitor for memory leaks over multiple operations
4. Assert smooth performance at all counts

---

## Failure Conditions

### FC1: Build Fails ❌
Any TypeScript compilation errors → immediate failure.

### FC2: Test Suite Degradation ❌
If total passing tests drops below 1839 (Round 51 baseline), round fails.
- New tests added must not reduce the passing count
- Existing tests must continue to pass

### FC3: Performance Regression ❌
If average render time increases >20% compared to baseline, round fails.

### FC4: Re-render Regression ❌
If components that previously didn't re-render now re-render unnecessarily, round fails.

### FC5: Keyboard Shortcut Conflicts ❌
If any new keyboard shortcut conflicts with essential browser functionality (F5 refresh, Ctrl+W close, Ctrl+T new tab, etc.), those shortcuts must be removed or remapped.

### FC6: Breaking Existing Functionality ❌
If any existing feature (undo/redo, copy/paste, module manipulation, connections, activation, tech tree, challenges, etc.) is broken by optimization changes, round fails.

### FC7: Memory Leaks ❌
If connection rendering optimization introduces memory leaks (verified via test suite), round fails.

### FC8: New Bugs Introduced ❌
**Any bugs found during mandatory testing must be fixed before claiming round complete.** This is not optional per Operator Inbox. Bugs include but are not limited to:
- Broken re-render behavior
- Broken keyboard shortcuts
- Broken performance
- Crashes on edge cases
- Memory leaks
- Console errors

---

## Done Definition

**ALL of the following must be true before claiming round complete:**

| # | Requirement | Verification Method |
|---|-------------|---------------------|
| 1 | Build passes with 0 TypeScript errors | `npm run build` succeeds |
| 2 | All 1839+ tests pass | `npm test -- --run` shows ≥1839 passing |
| 3 | Re-render reduction verified | Unit tests confirm no unnecessary re-renders |
| 4 | Canvas performance verified | 20+ modules render at >30fps |
| 5 | Keyboard shortcuts work | All 12+ shortcuts function without conflicts |
| 6 | Undo/redo performance verified | Operations complete in <100ms |
| 7 | Connection performance verified | 30 connections render without frame drops |
| 8 | No breaking changes | All existing features still work |
| 9 | New performance tests pass | All new tests in `src/__tests__/performance/` pass |
| 10 | No regressions | Existing editor, connections, activation, codex, tech tree, challenges all work |

**Builder must verify ALL 10 items before claiming complete. Any bugs found must be fixed.**

---

## Out of Scope

The following are explicitly **NOT** being done in this round:

| Item | Reason |
|------|--------|
| Real AI API Integration | Mock service continues to be used |
| New Module Types | No new SVG modules being created |
| New Visual Features | No UI/visual changes beyond optimization |
| Mobile Optimization | Desktop performance only this round |
| Localization | Chinese text remains; no new language support |
| Audio | No sound effects or music |
| Multiplayer | No collaborative features |
| New Editor Panels | No new sidebars or panels |
| Undo/Redo System Changes | Existing undo/redo infrastructure is preserved |

---

## Technical Notes

### Optimization Strategy

#### 1. React.memo for ModuleRenderer
```typescript
// Modules are static after placement; only transform changes
// Memoize SVG content, only re-render on prop change
const ModuleRenderer = React.memo(({ module, isSelected }) => (
  <g transform={`translate(${module.x}, ${module.y}) rotate(${module.rotation})`}>
    {/* SVG content */}
  </g>
), (prevProps, nextProps) => {
  return prevProps.module.id === nextProps.module.id &&
         prevProps.module.x === nextProps.module.x &&
         prevProps.module.y === nextProps.module.y &&
         prevProps.module.rotation === nextProps.module.rotation &&
         prevProps.isSelected === nextProps.isSelected;
});
```

#### 2. Granular Zustand Selectors
```typescript
// BAD — causes re-render on ANY machine change
const { modules, connections } = useMachineStore();

// GOOD — only re-renders when modules change
const modules = useMachineStore((state) => state.modules);

// BETTER — granular selector with shallow comparison
const moduleIds = useMachineStore(
  (state) => Object.keys(state.modules),
  shallow
);
```

#### 3. useMemo for Computed Values
```typescript
const connectionPaths = useMemo(
  () => connections.map(c => calculatePath(c)),
  [connections] // Only recalculate when connections change
);
```

#### 4. Canvas Virtualization (if time permits)
- Only render modules within viewport bounds + buffer
- Use spatial indexing for fast viewport queries

### Keyboard Shortcut Implementation

| Shortcut | Action | Store Method |
|----------|--------|--------------|
| Delete/Backspace | Delete selected | `useMachineStore.deleteModule()` |
| Ctrl+D | Duplicate | `useMachineStore.duplicateModule()` |
| Ctrl+C | Copy | `useClipboardStore.setCopy()` |
| Ctrl+V | Paste | `useClipboardStore.paste()` |
| Ctrl+A | Select All | `useSelectionStore.selectAll()` |
| Escape | Deselect | `useSelectionStore.clearSelection()` |
| Ctrl+Z | Undo | `useMachineStore.undo()` |
| Ctrl+Shift+Z | Redo | `useMachineStore.redo()` |
| Ctrl+S | Save | `useMachineStore.saveToHistory()` |
| +/= | Zoom In | `useMachineStore.setZoom()` |
| - | Zoom Out | `useMachineStore.setZoom()` |
| 0 | Reset Zoom | `useMachineStore.resetZoom()` |

### Performance Benchmarks

| Metric | Target | Measurement |
|--------|--------|-------------|
| Module render (memoized) | <1ms | Per module |
| Canvas render (20 modules) | <16ms | Total frame |
| Undo/Redo | <100ms | Per operation |
| Connection update | <5ms | Per connection |
| Store selector | <0.1ms | Per access |

---

## Testing Standards (per Operator Inbox — MUST NOT BE WEAKENED)

### Mandatory Verification Checklist

**All items MUST be verified before claiming round complete:**

- [ ] **Re-render verification**: 
  - Track render counts in key components (Canvas, Toolbar, PropertiesPanel)
  - Verify selectors are granular enough
  - Test that unrelated state changes do NOT trigger re-renders
  
- [ ] **Performance measurement**: 
  - Use `performance.now()` for timing
  - Set reasonable thresholds (<16ms for 60fps)
  - Test with realistic data (20+ modules, 15+ connections)
  
- [ ] **Keyboard shortcut testing**:
  - Test ALL shortcuts individually
  - Test shortcuts in context (with/without selection)
  - Verify NO conflicts with browser defaults
  - Verify NO crashes on edge cases
  
- [ ] **Bug fix requirement**: 
  - **ALL bugs found during testing must be fixed before claiming round complete**
  - This is NOT optional
  - Document any bugs found and their fixes

### Bug Handling Requirements

**Per Operator Inbox instructions, the following MUST occur:**

1. **Discovery**: Any bugs found during testing (re-render issues, performance problems, broken shortcuts, crashes, memory leaks, console errors) must be documented.

2. **Fixing**: All discovered bugs MUST be fixed before claiming round complete. Bugs cannot be "documented and deferred" or "known issues".

3. **Verification**: After fixing, re-verify that the bug is resolved and no regressions were introduced.

4. **Evidence**: Document the bug, the fix, and the verification in the completion report.

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/components/Editor/Canvas.tsx` | Add React.memo, virtualization, useMemo, useCallback |
| `src/store/useMachineStore.ts` | Granular selectors, shallow comparison |
| `src/hooks/useKeyboardShortcuts.ts` | New shortcuts implementation |
| `src/components/Connections/*.tsx` | Path caching, useMemo, requestAnimationFrame |
| `src/__tests__/performance/*.test.ts` | New performance tests (≥20 new tests expected) |

---

**Round 52 Contract — Performance Optimization and Editor Efficiency**

*This contract has been reviewed and approved for implementation.*

---

## Revision Notes (Round 52 Rev 2)

Changes made in this revision:
1. Added explicit "Bug requirement" subsections to each acceptance criteria requiring all bugs to be fixed
2. Strengthened Failure Condition FC8 to explicitly enumerate bug types that must be fixed
3. Added Bug Handling Requirements section to make the mandatory bug-fixing requirement explicit
4. Made Testing Standards checklist more prominent with clear action items
5. Added explicit requirement to document bugs, fixes, and verification in completion report
