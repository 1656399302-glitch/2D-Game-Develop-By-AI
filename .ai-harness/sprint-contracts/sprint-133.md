APPROVED

# Sprint Contract — Round 133

## Scope

Remediation sprint to fix critical failures from Round 132:
1. **E2E Test Failures**: Tests timeout due to selector mismatches between test expectations and actual DOM
2. **Bundle Size Exceeded**: Main bundle is 2.19KB over the 512KB limit (514.19KB)

## Spec Traceability

### P0 Items Covered This Round
- **AC-132-007** (Bundle size ≤512KB): Reduce bundle from 514.19KB to ≤512KB
- **AC-132-008** (E2E tests pass within 60s): Fix test selectors and timing issues

### P1 Items Covered This Round
- **AC-132-004** (Sub-circuit placement verification): Add programmatic tests that verify store state changes without relying on broken canvas interaction
- **AC-132-006** (Sub-circuit module behavior): Verify via store/state inspection when sub-circuit exists in store

### Remaining P0/P1 After This Round
- **AC-132-004 (Placement)**: Canvas Shift+Click multi-selection blocked — deferred to future rounds when canvas interaction is fixed
- **AC-132-006 (Module Behavior)**: Cannot verify canvas rendering of placed sub-circuits — deferred to future rounds

### P2 Intentionally Deferred
- Visual polish enhancements
- Performance profiling beyond bundle size
- Additional E2E test coverage
- Canvas Shift+Click interaction (blocked)

## Deliverables

1. **Fixed E2E test file**: `tests/e2e/sub-circuit.spec.ts` with correct selectors matching actual DOM structure from Round 132 evidence
2. **Bundle optimization**: Reduced production bundle to ≤512KB
3. **Store-based sub-circuit tests**: E2E tests that verify sub-circuit flows via store/state inspection, bypassing canvas interaction
4. **Verified sub-circuit flows**: Documented evidence that sub-circuit creation/deletion work via event dispatch

## Acceptance Criteria

1. **AC-133-001**: Bundle size ≤512KB (524,288 bytes) after `npm run build`
2. **AC-133-002**: E2E tests complete and pass within 60 seconds using `npx playwright test tests/e2e/sub-circuit.spec.ts --timeout=60000`
3. **AC-133-003**: E2E tests can click circuit mode toggle and see circuit panel visible
4. **AC-133-004**: E2E tests can create sub-circuit via event dispatch and verify it appears in circuit panel (store-based verification, NOT canvas interaction)
5. **AC-133-005**: Sub-circuit creation via event dispatch works (modal opens, name input, confirm creates sub-circuit)
6. **AC-133-006**: Sub-circuit deletion with confirmation works (click delete → confirm dialog → confirm → removed)
7. **AC-133-007**: All unit tests still pass (≥5491 tests)
8. **AC-133-008**: TypeScript compiles with 0 errors

## Test Methods

### AC-133-001: Bundle Size
- Run `npm run build`
- Check `dist/assets/index-*.js` file size
- Assert ≤512KB (524,288 bytes)

### AC-133-002: E2E Test Execution
- Run `npx playwright test tests/e2e/sub-circuit.spec.ts --timeout=60000`
- Verify all tests complete and pass within 60 seconds
- No test should trigger a timeout error
- **This is the primary acceptance criterion for this round** — Round 132 tests failed with 120-second timeout due to selector mismatches

### AC-133-003: Circuit Mode Toggle
- Navigate to `/`
- Locate circuit toggle using `button[data-circuit-mode-toggle]` (do NOT require `data-tutorial-action` attribute — actual DOM uses simple toggle button)
- Click toggle
- Verify `[data-circuit-module-panel]` is visible
- Verify toggle text contains "已开启" or aria-pressed is true

**NEGATIVE CASE**: After clicking again, verify panel is hidden.

### AC-133-004: Sub-Circuit Existence in Panel (Store-Based)
- Create a sub-circuit via event dispatch (see AC-133-005)
- Verify sub-circuit count in panel is ≥1
- Verify sub-circuit appears in the custom section list
- **DO NOT TEST**: Component placement on canvas (canvas interaction is broken and deferred)

### AC-133-005: Sub-Circuit Creation via Event Dispatch
- Dispatch custom event: `window.dispatchEvent(new CustomEvent('open-create-subcircuit-modal', { detail: { selectedIds: ['node-1', 'node-2'] } }))`
- Verify modal appears with title "创建子电路" (use selector `h2:has-text("创建子电路")`)
- Verify name input exists: `[data-sub-circuit-name-input]`
- Enter name "TestSub133"
- Click `[data-confirm-create]`
- Verify sub-circuit appears in custom section: element containing "TestSub133"

**NEGATIVE CASES**:
- Verify clicking `[data-cancel-create]` dismisses modal without creating sub-circuit
- Verify pressing Escape dismisses modal without creating sub-circuit

### AC-133-006: Sub-Circuit Deletion
- Create a sub-circuit first (via AC-133-005)
- Verify initial sub-circuit count ≥1
- Click delete button `[data-delete-sub-circuit]` on the sub-circuit
- Verify confirmation overlay appears with text "确认删除"
- Click `[data-confirm-delete]`
- Verify sub-circuit count decreases by 1 OR sub-circuit is removed

**NEGATIVE CASE**:
- Click `[data-cancel-delete]` and verify sub-circuit is NOT removed

### AC-133-007: Unit Tests
- Run `npm test -- --passWithNoTests`
- Verify ≥5491 tests pass
- Check for any test failures

### AC-133-008: TypeScript Compilation
- Run `npx tsc --noEmit`
- Verify 0 TypeScript errors

## Selector Reference (Verified in Round 132)

Based on Round 132 browser verification, use these exact selectors:
- Circuit toggle: `button[data-circuit-mode-toggle]` (NOT with data-tutorial-action)
- Circuit panel: `[data-circuit-module-panel]`
- Sub-circuit name input: `[data-sub-circuit-name-input]`
- Confirm create: `[data-confirm-create]`
- Cancel create: `[data-cancel-create]`
- Delete sub-circuit: `[data-delete-sub-circuit]`
- Cancel delete: `[data-cancel-delete]`
- Confirm delete: `[data-confirm-delete]`

## Risks

1. **Risk: Bundle size reduction may break functionality**
   - *Mitigation*: Make surgical cuts to known large dependencies or unused code paths
   - *Mitigation*: Use Vite's tree-shaking analysis to identify dead code

2. **Risk: E2E test selectors may still not match**
   - *Mitigation*: Inspect actual DOM using Playwright's `page.evaluate()` to print element attributes
   - *Mitigation*: Use attribute-based selectors without requiring optional attributes like `data-tutorial-action`

3. **Risk: Canvas interaction continues to be blocked**
   - *Mitigation*: Focus on store-level verification for sub-circuit flows
   - *Mitigation*: Use direct store manipulation via `page.evaluate()` for testing
   - *Acknowledged*: Component placement on canvas cannot be tested this round

## Failure Conditions

The sprint fails if ANY of:
1. Bundle size >512KB after build
2. E2E tests do not complete within 60 seconds (tests that timeout at 60s indicate selector or flow issues)
3. Any E2E test fails due to selector not found
4. Unit tests drop below 5491
5. TypeScript compilation produces errors

## Done Definition

The sprint is complete when ALL of the following are true:

1. ✅ `npm run build` produces bundle ≤512KB
2. ✅ `npx playwright test tests/e2e/sub-circuit.spec.ts --timeout=60000` passes all tests within 60 seconds
3. ✅ Circuit mode toggle click works and panel becomes visible
4. ✅ Sub-circuit creation flow works: dispatch event → modal opens → name input → confirm → sub-circuit created
5. ✅ Sub-circuit deletion flow works: click delete → confirm dialog → confirm → sub-circuit removed
6. ✅ `npm test` shows ≥5491 tests passing
7. ✅ `npx tsc --noEmit` shows 0 errors

## Out of Scope

- Adding new features beyond bug fixes
- UI/UX polish that doesn't affect functionality
- Performance optimizations beyond bundle size
- Adding new E2E test files
- Modifying unit test files (only E2E tests are modified)
- Changing component rendering logic (only fixing selectors)
- **Sub-circuit placement on canvas** (canvas Shift+Click interaction is broken — deferred to future rounds)
- **Visual verification of sub-circuit module behavior on canvas** (deferred to future rounds when canvas interaction is fixed)
- Component button clicks that would add to canvas (canvas interaction is broken)
