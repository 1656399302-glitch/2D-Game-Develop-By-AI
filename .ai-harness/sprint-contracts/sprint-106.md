# Sprint Contract — Round 106

## Scope

**Primary Mission (MUST_FIX):** Fix the critical P0 bug where the "Welcome Back" popup (LoadPromptModal) gets stuck/frozen when the user clicks either "恢复之前的工作" (stash/restore) or "开启新存档" (new/start fresh). The modal must dismiss properly and transition to a usable editor state.

**Secondary Mission (MUST_FIX per Operator Request):** Perform a comprehensive sweep of ALL functional modules to ensure no bugs exist, with special focus on module-to-module interactions. Any discovered bugs must be fixed or explicitly documented as deferred.

## Spec Traceability

### P0 Items Covered This Round

1. **Bug: LoadPromptModal Freeze on Button Click** — The "Welcome Back" modal freezes/crashes when user clicks either "恢复之前的工作" or "开启新存档". Root cause suspected in modal coordination logic.

2. **Bug: Comprehensive Module Interaction Verification** — Per operator inbox instruction, verify all functional modules interact correctly without bugs. Test all module-to-module interaction paths.

### P1 Items Covered This Round
- N/A (focused bug fix and verification round)

### Remaining P0/P1 After This Round
- All other P0/P1 items remain as documented in spec.md

### P2 Intentionally Deferred
- All P2 items deferred to future rounds

## Deliverables

1. **Fixed LoadPromptModal button handlers** — Both "恢复之前的工作" and "开启新存档" buttons must properly close modal and transition to usable state
2. **Fixed modal coordination with WelcomeModal** — WelcomeModal dismissal must not improperly trigger LoadPromptModal
3. **Comprehensive Module Interaction Test Report** — Documented results of testing all cross-module interactions with pass/fail status for each
4. **Bug Fixes for Any Discovered Issues** — Fix any additional bugs found during comprehensive sweep
5. **Updated or new tests** — Add integration tests covering the freeze scenario and module interactions

## Acceptance Criteria

### Critical Modal Fix (P0 - MUST PASS)

1. **AC-106-001: LoadPromptModal does NOT freeze on "恢复之前的工作" click**
   - Given: App loads with saved canvas state, LoadPromptModal is visible
   - When: User clicks "恢复之前的工作" button
   - Then: Modal closes within 500ms, saved state is restored, editor becomes interactive
   - **FAIL CONDITION:** Modal remains visible, UI freezes, or editor remains non-interactive

2. **AC-106-002: LoadPromptModal does NOT freeze on "开启新存档" click**
   - Given: App loads with saved canvas state, LoadPromptModal is visible
   - When: User clicks "开启新存档" button
   - Then: Modal closes within 500ms, canvas is cleared, editor becomes interactive
   - **FAIL CONDITION:** Modal remains visible, UI freezes, or editor remains non-interactive

3. **AC-106-003: WelcomeModal dismissal does NOT trigger LoadPromptModal**
   - Given: App loads with saved canvas state AND WelcomeModal is shown
   - When: User dismisses WelcomeModal (via skip, close button, or backdrop click)
   - Then: LoadPromptModal does NOT appear, saved state is optionally restored based on user preference
   - **FAIL CONDITION:** LoadPromptModal unexpectedly appears after WelcomeModal dismissal

4. **AC-106-004: UI remains responsive after any modal dismissal**
   - Given: Any modal is visible (LoadPromptModal, WelcomeModal, etc.)
   - When: User clicks a button to dismiss it
   - Then: No "frozen" state, editor toolbar and canvas remain interactive within 1 second
   - **FAIL CONDITION:** UI becomes unresponsive, buttons don't work, canvas doesn't respond

5. **AC-106-005: TypeScript compilation remains clean**
   - Given: Code changes are made
   - When: `npx tsc --noEmit` is run
   - Then: Zero TypeScript errors

### Comprehensive Module Interaction Checks (P0 - REQUIRED BY OPERATOR)

6. **AC-106-006: Module drag-and-drop works after modal interactions**
   - Given: User has dismissed any modal (WelcomeModal, LoadPromptModal, etc.)
   - When: User drags a module from the toolbar onto the canvas
   - Then: Module appears on canvas, connection points are visible, module is interactive

7. **AC-106-007: Module deletion works after modal interactions**
   - Given: Canvas has at least one module placed
   - When: User deletes a module (via delete key or context menu)
   - Then: Module is removed, connections are cleaned up, canvas remains usable

8. **AC-106-008: Module connections work after modal interactions**
   - Given: At least two modules are on canvas
   - When: User draws a connection between modules
   - Then: Connection path is created, energy flow visualization appears, modules are linked

9. **AC-106-009: Canvas zoom/pan works after modal interactions**
   - Given: User has dismissed any modal
   - When: User zooms or pans the canvas
   - Then: Canvas viewport responds correctly, no jitter or freezing

10. **AC-106-010: Undo/Redo works after modal interactions**
    - Given: User performs an action (e.g., place module), dismisses modal, then performs another action
    - When: User clicks undo
    - Then: Last action is undone, state is consistent

11. **AC-106-011: Save/Load state persists correctly after any workflow**
    - Given: User performs various actions, saves, reloads app
    - When: App loads
    - Then: All state is restored exactly as saved (modules, connections, viewport)

12. **AC-106-012: No console errors during any workflow path**
    - Given: Any sequence of user interactions
    - When: Actions are performed
    - Then: No Error-level console messages, no uncaught exceptions

13. **AC-106-013: Module-to-module state synchronization**
    - Given: Multiple modules on canvas with connections
    - When: One module's state changes (e.g., activation level)
    - Then: Connected modules receive updates, no desync or ghost state

14. **AC-106-014: Rapid modal dismiss sequence works**
    - Given: App loads with multiple modals potentially visible
    - When: User rapidly clicks to dismiss modals
    - Then: All modals dismiss cleanly, final state is editor-ready, no orphaned overlays

## Test Methods

### AC-106-001 & AC-106-002: LoadPromptModal Button Clicks (CRITICAL PATH)
1. Clear localStorage completely
2. Set up saved canvas state in localStorage (modules, connections)
3. Load the app - LoadPromptModal should appear
4. **Monitor closely:** Click "恢复之前的工作"
5. Verify modal element is removed from DOM or hidden within 500ms
6. Verify toolbar buttons are clickable (not disabled)
7. Verify canvas accepts module drag (try dragging a module)
8. If module placement works: PASS. If modal stuck or UI frozen: FAIL
9. Repeat steps 1-8 for "开启新存档" button
10. For "开启新存档": verify canvas is empty after dismiss

### AC-106-003: WelcomeModal → LoadPromptModal Coordination
1. Clear localStorage
2. Set up saved canvas state AND tutorial not seen state
3. Load app - WelcomeModal should appear
4. Dismiss WelcomeModal (use skip button)
5. **CRITICAL:** Verify LoadPromptModal does NOT appear
6. Verify editor is immediately interactive
7. If LoadPromptModal appears: FAIL - this is the coordination bug

### AC-106-004: UI Responsiveness After Modal
1. Trigger any modal scenario
2. Dismiss the modal
3. **Within 1 second:** Click toolbar buttons, try to drag module, zoom canvas
4. Verify all interactions work
5. If any freeze or lag > 1s: FAIL

### AC-106-005: TypeScript
- Run `npx tsc --noEmit`
- Verify 0 errors

### AC-106-006: Module Drag After Modal
1. Start from initial state (no saved state, WelcomeModal may appear)
2. Dismiss WelcomeModal if visible
3. Drag module from sidebar to canvas
4. Verify module appears with connection points visible
5. If module doesn't appear or connection points missing: FAIL

### AC-106-007: Module Delete After Modal
1. Place module on canvas
2. Dismiss any modal
3. Delete the module (Delete key or context menu)
4. Verify module removed, no orphaned connections
5. If module remains or connections orphaned: FAIL

### AC-106-008: Module Connections After Modal
1. Place two modules on canvas
2. Dismiss any modal
3. Draw connection from one module's output to another's input
4. Verify connection path renders, energy flow animation appears
5. If connection fails or no flow: FAIL

### AC-106-009: Canvas Zoom/Pan After Modal
1. Dismiss any visible modal
2. Zoom in/out (scroll wheel or buttons)
3. Pan canvas (middle click drag or space+drag)
4. Verify smooth response, no jitter
5. If zoom/pan causes freeze or jitter: FAIL

### AC-106-010: Undo/Redo After Modal
1. Place module A
2. Dismiss modal (if any)
3. Place module B
4. Click undo
5. Verify only module B is removed, module A remains
6. Click redo
7. Verify module B restored
8. If undo/redo doesn't work: FAIL

### AC-106-011: Save/Load Persistence
1. Place 2+ modules on canvas, create connections
2. Save (if manual save required)
3. Reload page
4. Verify all modules, connections, viewport restored exactly
5. If any state missing or incorrect: FAIL

### AC-106-012: No Console Errors
1. Perform each workflow path listed in test methods
2. Monitor browser console for Error-level messages
3. If any Error appears: FAIL
4. Warnings and info are acceptable

### AC-106-013: State Synchronization
1. Place module A with output port
2. Place module B with input port
3. Connect A to B
4. Trigger state change on A (e.g., activation)
5. Verify B receives update within 100ms
6. If B doesn't update: FAIL

### AC-106-014: Rapid Modal Dismiss
1. Load app (may show WelcomeModal and/or LoadPromptModal)
2. Rapidly click dismiss buttons (50ms between clicks)
3. Verify all modals eventually dismissed
4. Verify editor is interactive
5. If orphaned modal or dead UI: FAIL

## Risks

1. **Risk: State Synchronization** — Modifying modal coordination might introduce race conditions between WelcomeModal, LoadPromptModal, and store hydration
2. **Risk: Breaking WelcomeModal Animation** — Changes to handleSkip might interfere with the 300ms exit animation
3. **Risk: Uncovering Additional Bugs** — Broader testing may reveal other issues that could expand scope
4. **Risk: Test Environment Differences** — localStorage behavior may differ between test and production

## Failure Conditions

**This round MUST FAIL if ANY of these occur:**
1. LoadPromptModal remains visible or frozen after clicking either button
2. WelcomeModal dismissal triggers LoadPromptModal to appear unexpectedly
3. UI becomes unresponsive after modal interaction
4. TypeScript compilation fails
5. Any existing test breaks
6. AC-106-006 through AC-106-014 fails (module interaction regression)
7. Console errors appear during normal workflow

## Done Definition

All 14 acceptance criteria must pass. The round is complete only when:

1. [ ] AC-106-001: "恢复之前的工作" properly dismisses modal and restores state (NO FREEZE)
2. [ ] AC-106-002: "开启新存档" properly dismisses modal and clears state (NO FREEZE)
3. [ ] AC-106-003: WelcomeModal dismissal does NOT trigger LoadPromptModal
4. [ ] AC-106-004: UI remains responsive after any modal dismissal
5. [ ] AC-106-005: TypeScript compiles cleanly (0 errors)
6. [ ] AC-106-006: Module drag-and-drop works after modal interactions
7. [ ] AC-106-007: Module deletion works after modal interactions
8. [ ] AC-106-008: Module connections work after modal interactions
9. [ ] AC-106-009: Canvas zoom/pan works after modal interactions
10. [ ] AC-106-010: Undo/Redo works after modal interactions
11. [ ] AC-106-011: Save/Load state persists correctly
12. [ ] AC-106-012: No console errors during any workflow
13. [ ] AC-106-013: Module-to-module state synchronization works
14. [ ] AC-106-014: Rapid modal dismiss sequence works

## Out of Scope

- Changes to WelcomeModal internal styling or animations (unless directly causing the bug)
- Changes to LoadPromptModal internal styling (unless directly causing the bug)
- Addition of new features or functionality beyond bug fixes
- Changes to machine store logic beyond modal coordination
- Changes to tutorial system functionality
- Performance optimization work (unless directly related to freeze bug)
- Adding new module types or connection types
- Changing save format or storage mechanism
