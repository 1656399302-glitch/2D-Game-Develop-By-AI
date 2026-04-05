# APPROVED — Sprint Contract — Round 153

## Scope

Complete the Sub-circuit system UI integration. The sub-circuit functionality exists in the codebase (CreateSubCircuitModal, SubCircuitPanel, SubCircuitModule) but is not wired into the main application UI. This sprint adds the missing "Create Sub-circuit" button to the toolbar and integrates SubCircuitPanel into the application layout.

## Spec Traceability

### P0 items covered this round:
- **Sub-circuit module system** — UI integration to make the existing code accessible to users
  - CreateSubCircuitModal wired to toolbar button
  - SubCircuitPanel accessible via toolbar or menu
  - SubCircuitModule usable in circuits

### P1 items covered this round:
- Regression tests for new UI paths

### Remaining P0/P1 after this round:
- Canvas System validation/simulation improvements
- Tech tree UI and unlock system
- Achievement system UI and tracking
- Faction reputation and rewards UI
- Challenge mode puzzles
- Community gallery, exchange/trade system

### P2 intentionally deferred:
- Sub-circuit template library browser (future enhancement)
- Sub-circuit version history (future enhancement)

## Deliverables

1. **`src/components/Editor/Toolbar.tsx`** — Updated toolbar with "Create Sub-circuit" button that opens CreateSubCircuitModal
2. **`src/App.tsx`** — SubCircuitPanel integrated into application layout (lazy-loaded, conditionally rendered)
3. **`src/__tests__/subCircuitUIIntegration.test.tsx`** — Regression tests covering all new UI integration paths, including sub-circuit modal lifecycle (no hang on any dismiss path), selection-to-creation flow, and sub-circuit module canvas behavior
4. **Production code changes** required to wire existing sub-circuit components into UI

## Acceptance Criteria

1. **AC-153-001:** Toolbar renders a "Create Sub-circuit" button that opens CreateSubCircuitModal when clicked
2. **AC-153-002:** SubCircuitPanel can be opened/closed and displays user's existing sub-circuits
3. **AC-153-003:** User can create a sub-circuit from selected modules via the new button
4. **AC-153-004:** Created sub-circuits appear in the CircuitModulePanel for use in the canvas
5. **AC-153-005:** Sub-circuit modules can be placed on the canvas and behave correctly
6. **AC-153-006:** Bundle size remains ≤512KB after integration
7. **AC-153-007:** Test count ≥6214 (Round 152 baseline; new integration tests must not reduce total)
8. **AC-153-008:** TypeScript compilation clean with no errors

## Test Methods

1. **AC-153-001:** Click toolbar button → CreateSubCircuitModal opens within 500ms → modal renders with correct form fields (name, description, icon selector)
2. **AC-153-002:** Click "Manage Sub-circuits" or toolbar icon → SubCircuitPanel opens → displays list of user's sub-circuits → close via X button or Escape → panel closes and does NOT remain open
3. **AC-153-003:** Integration test: Select modules on canvas → click "Create Sub-circuit" → fill modal form (name required) → submit → verify sub-circuit saved to store → modal dismisses within 500ms
4. **AC-153-004:** Integration test: Create sub-circuit → verify it appears in CircuitModulePanel category
5. **AC-153-005:** Integration test: Drag sub-circuit module to canvas → connect inputs/outputs → verify simulation behavior matches expected sub-circuit logic and does NOT crash circuit simulation
6. **AC-153-006:** Run `npm run build` → verify main bundle ≤ 524,288 bytes (512KB)
7. **AC-153-007:** Run `npm test -- --run` → verify ≥ 6214 passing tests (baseline from Round 152)
8. **AC-153-008:** Run `npx tsc --noEmit` → verify exit code 0

### Negative Assertions (required for stateful UI):
- Sub-circuit button should NOT appear enabled when no modules are selected on canvas (disabled state required)
- SubCircuitPanel should NOT remain open after close action (panel state resets to closed)
- Creating sub-circuit with empty name should NOT save and should show inline validation error
- Sub-circuit modal should NOT hang on Cancel — dismiss within 500ms without calling save logic
- Sub-circuit modal should NOT hang on Escape key — dismiss within 500ms
- Sub-circuit modal should NOT hang on Save/Submit — dismiss within 500ms of successful save
- Sub-circuit module on canvas should NOT crash circuit simulation (verified: no uncaught exception thrown, outputs match expected values for given inputs)

### Entry/Completion/Repeat paths:
- **Entry:** App loads → toolbar visible → sub-circuit button visible and accessible
- **Completion:** User selects modules on canvas → creates sub-circuit → appears in palette → placed on canvas → simulates correctly → SubCircuitPanel lists the new sub-circuit
- **Repeat:** User can create multiple sub-circuits, each appears in palette and panel
- **Retry:** If sub-circuit creation fails validation, modal stays open with error message; user corrects and resubmits

## Risks

1. **Sub-circuit modal hang risk** — CreateSubCircuitModal must not replicate the SaveTemplateModal hang pattern (modal does not dismiss on save). The onClose callback must be invoked synchronously or within 500ms of successful save, not deferred via requestAnimationFrame or Promises that never resolve. This is a contract-reviewer-identified risk carried from Round 151 operator inbox items (1775113667868, 1775233786990).
2. **Import order dependency** — SubCircuitPanel must be lazy-loaded to avoid bundle bloat; must verify lazy import works correctly with Suspense boundary
3. **Existing store compatibility** — Sub-circuit store must work with existing useCircuitCanvasStore; potential selector conflicts in combined circuit+sub-circuit state
4. **Test file isolation** — New tests must properly mock stores before component imports per Vitest module isolation; store mocks must return realistic sub-circuit data
5. **Button placement** — Must find appropriate toolbar location without crowding existing buttons

## Failure Conditions

1. Bundle size exceeds 512KB after integration
2. TypeScript compilation produces any errors
3. Test count drops below 6214 (existing tests broken by integration changes)
4. Any existing functionality regresses (verified by full test suite)
5. CreateSubCircuitModal hangs on save (similar to Round 151 LoadPromptModal issue — modal does not dismiss within 500ms of clicking save/submit)
6. CreateSubCircuitModal hangs on cancel or Escape key press
7. Sub-circuit modules fail to simulate correctly on canvas
8. Sub-circuit button is NOT disabled when no modules are selected

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ Toolbar contains "Create Sub-circuit" button that opens CreateSubCircuitModal
2. ✅ SubCircuitPanel accessible from UI and renders user's sub-circuits
3. ✅ Created sub-circuits appear in CircuitModulePanel
4. ✅ Sub-circuit modules can be placed and simulate on canvas
5. ✅ CreateSubCircuitModal does NOT hang on Cancel, Save, or Escape (all dismiss within 500ms)
6. ✅ `npm run build` produces bundle ≤ 512KB
7. ✅ `npm test -- --run` shows ≥ 6214 passing tests
8. ✅ `npx tsc --noEmit` exits with code 0
9. ✅ Browser smoke test confirms app loads without console errors
10. ✅ No existing tests are broken by the new integration

## Out of Scope

- Sub-circuit version history tracking
- Sub-circuit template gallery/browser (beyond basic panel)
- Drag-and-drop sub-circuit creation (selection + button click is sufficient)
- Sub-circuit documentation/help system
- Performance optimization of sub-circuit rendering (baseline acceptable)
- E2E tests for sub-circuit (integration tests sufficient)
- Tech tree, achievement, faction, challenge, or community system changes
