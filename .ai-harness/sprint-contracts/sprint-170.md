# Sprint Contract — Round 170

## Scope

This sprint is a **remediation sprint** focused exclusively on integrating the existing backup system components into the main application UI. The components (BackupButton, RecoveryPrompt, BackupManager, useCircuitBackup hook) all exist and pass unit tests. The failure is that users cannot access any of this functionality because components are not wired into the application.

## Spec Traceability

### P0 Items Covered This Round
- **Circuit Persistence: Backup System Integration** — Wire existing backup components into the main application so users can access all backup functionality

### P1 Items Covered This Round
- None — this is a remediation-only sprint

### Remaining P0/P1 After This Round
- All P0/P1 items from the main spec remain as-is; this sprint only addresses integration of the round 169 backup system

### P2 Intentionally Deferred
- All P2 items remain deferred

## Deliverables

1. **Modified `src/components/Editor/Toolbar.tsx`**
   - Import `BackupButton` component from `../Backup/BackupButton`
   - Render `BackupButton` in the toolbar UI (position to be determined by existing toolbar layout)
   - Ensure backup button is visible and accessible alongside existing toolbar buttons

2. **Modified `src/App.tsx`**
   - Import `RecoveryPrompt` component from `./components/Backup/RecoveryPrompt`
   - Import `useCircuitBackup` hook from `./hooks/useCircuitBackup`
   - Render `RecoveryPrompt` conditionally when crash recovery is detected
   - Call `useCircuitBackup` hook from a mounted component to enable auto-save interval

3. **Modified `src/components/Backup/BackupButton.tsx`**
   - Ensure `BackupManager` is accessible via the button's dropdown menu
   - Add menu item or modal trigger for "Manage Backups" that opens BackupManager

4. **New Integration Tests: `src/__tests__/integration/backup.integration.test.tsx`**
   - Verify BackupButton renders in Toolbar
   - Verify RecoveryPrompt renders when crash recovery is detected
   - Verify BackupManager opens from BackupButton dropdown
   - All integration tests must pass alongside existing 242 test files

## Acceptance Criteria

1. **AC-170-001:** `document.body.innerHTML.includes('Backup')` returns `true` in browser verification after loading the app at http://localhost:5173
2. **AC-170-002:** Toolbar renders a clickable "Backup" button that opens a dropdown menu
3. **AC-170-003:** RecoveryPrompt renders when the app loads after a crash (simulated by setting `circuit_backup_pending_recovery` in localStorage before page load)
4. **AC-170-004:** Clicking "Manage Backups" in the BackupButton dropdown opens the BackupManager modal
5. **AC-170-005:** App loads without console errors or warnings after wiring backup components
6. **AC-170-006:** `npm test -- --run` passes all existing 242 test files plus new integration tests
7. **AC-170-007:** `npm run build` succeeds with bundle ≤512KB
8. **AC-170-008:** `npx tsc --noEmit` exits with 0 errors

## Test Methods

### Browser Verification (AC-170-001)
1. Start dev server: `npm run dev`
2. Open http://localhost:5173
3. Run in browser console: `document.body.innerHTML.includes('Backup')`
4. **Expected:** `true`
5. **Negative assertion:** `document.body.innerHTML.includes('undefined')` must be `false` (no broken rendering)

### Toolbar Integration (AC-170-002)
1. Start dev server and open app
2. Inspect toolbar DOM to find Backup button (querySelector for button with 'Backup' text)
3. Click the button
4. **Expected:** Dropdown menu appears with at least one option
5. **Negative assertion:** Dropdown should not remain visible after clicking elsewhere on page

### RecoveryPrompt Entry (AC-170-003)
1. Clear localStorage: `localStorage.clear()`
2. Set recovery flag: `localStorage.setItem('circuit_backup_pending_recovery', JSON.stringify({ timestamp: Date.now(), circuitData: {} }))`
3. Reload the page (restart dev server and open app)
4. **Expected:** RecoveryPrompt modal appears
5. **Negative assertion:** RecoveryPrompt should NOT appear on normal load without the localStorage flag

### RecoveryPrompt Dismiss/Recovery Flow (AC-170-003 continued)
1. With RecoveryPrompt visible, test dismiss action
2. **Negative assertion:** RecoveryPrompt must not remain visible after clicking dismiss
3. Click "Recover" action (if recovery data exists)
4. **Negative assertion:** App should not crash; circuit state should update without console errors

### BackupManager Access (AC-170-004)
1. Click Backup button in toolbar
2. Find and click "Manage Backups" option in dropdown
3. **Expected:** BackupManager modal/panel opens
4. **Negative assertion:** BackupManager should not render until explicitly opened via dropdown

### BackupManager Dismiss Flow (AC-170-004 continued)
1. With BackupManager visible, click close button or backdrop
2. **Expected:** BackupManager closes
3. **Negative assertion:** BackupManager modal must not remain visible after close action

### Hook Integration (AC-170-005)
1. App loads without console errors (run `npm run dev` and check browser console)
2. **Negative assertion:** No `console.error` calls during normal app operation

### Test Suite (AC-170-006)
1. Command: `npm test -- --run`
2. **Expected:** 242+ test files pass, all tests pass including new backup integration tests

### Build Size (AC-170-007)
1. Command: `npm run build`
2. **Expected:** Bundle size ≤512KB

### TypeScript (AC-170-008)
1. Command: `npx tsc --noEmit`
2. **Expected:** Exit code 0, 0 errors

## Risks

1. **Integration complexity:** The existing BackupButton, RecoveryPrompt, and BackupManager components may have dependencies or props that need specific values from the store. Risk: low — components exist and pass tests, just need wiring.
2. **CSS/styling conflicts:** Toolbar already has styling; adding BackupButton may affect layout. Risk: low — BackupButton is a self-contained component.
3. **State management:** RecoveryPrompt needs to know when crash recovery is pending. The hook detection logic must work when integrated. Risk: low — hook logic exists and is testable.
4. **Hook initialization timing:** `useCircuitBackup` must be called after the app is hydrated. Risk: low-medium — existing hooks follow same pattern in App.tsx.
5. **Test file location:** The existing `src/__tests__/integration/circuitPersistenceIntegration.test.tsx` tests circuit persistence (Round 151), not backup system. The new integration test must be created at `src/__tests__/integration/backup.integration.test.tsx`.

## Failure Conditions

This sprint MUST fail if ANY of the following are true:

1. Browser verification shows no "Backup" text in the DOM (AC-170-001 fails)
2. Toolbar does not render a Backup button (AC-170-002 fails)
3. RecoveryPrompt does not render after setting `circuit_backup_pending_recovery` in localStorage (AC-170-003 fails)
4. BackupManager is not accessible from BackupButton dropdown (AC-170-004 fails)
5. RecoveryPrompt does not dismiss properly (remains visible after dismiss action)
6. BackupManager does not close properly (remains visible after close action)
7. `npm test -- --run` has any test failures
8. `npm run build` bundle exceeds 512KB
9. `npx tsc --noEmit` reports any TypeScript errors
10. App crashes or shows console errors when backup components are wired in

## Done Definition

ALL of the following conditions must be true to claim this sprint complete:

1. ✅ `npm test -- --run` passes with all test files (242+) and all tests passing
2. ✅ `npx tsc --noEmit` exits with code 0 and 0 errors
3. ✅ `npm run build` succeeds with bundle ≤512KB
4. ✅ Browser verification confirms "Backup" text appears in the running application
5. ✅ Toolbar renders a Backup button that opens a dropdown menu
6. ✅ RecoveryPrompt renders when `circuit_backup_pending_recovery` is set in localStorage before page load
7. ✅ RecoveryPrompt can be dismissed and does not remain visible
8. ✅ BackupManager is accessible via the BackupButton dropdown
9. ✅ BackupManager can be closed and does not remain visible
10. ✅ App loads without console errors
11. ✅ All new integration tests pass

## Out of Scope

- Implementing any new backup functionality — all components already exist
- Modifying the backup store (`backupStore.ts`) — it already implements all P0 interfaces correctly
- Modifying the `useCircuitBackup` hook logic — it already works correctly
- Adding new backup-related components — all needed components exist
- Any work on other spec features (Canvas, TechTree, Community, etc.)
- Any work on the Achievement, Faction, Exchange, or AI systems
- Performance optimizations unrelated to the backup integration
- Visual polish beyond what is needed to make the components functional

## Previous Round Remediation Notes

Round 169 delivered all backup components as standalone, testable units. The unit tests (6989/6989) pass. The failure was purely integration — components were not connected to the main application UI. This round fixes ONLY the integration layer.

---

*APPROVED — Round 170 Contract Review*

# QA Evaluation — Round 169

## Release Decision
- **Verdict:** FAIL
- **Summary:** The Circuit Persistence Backup System components exist and pass all unit tests (242 files, 6989 tests), but the critical UI integration is missing — the BackupButton is absent from the Toolbar, RecoveryPrompt is not rendered in App.tsx, and BackupManager is inaccessible. Users cannot access any backup functionality in the running application.
- **Spec Coverage:** PARTIAL (components exist but not wired)
- **Contract Coverage:** FAIL
- **Build Verification:** PASS — Bundle 435.79 KB < 512 KB limit
- **Browser Verification:** FAIL — No backup UI elements found in running application
- **Placeholder UI:** FOUND — Backup components not integrated into main app
- **Critical Bugs:** 1
- **Major Bugs:** 0
- **Minor Bugs:** 0
- **Acceptance Criteria Passed:** 0/7
- **Untested Criteria:** 7 (all AC-169-001 through AC-169-007 UI integration criteria unmet)

## Blocking Reasons
1. **CRITICAL: Backup UI Not Integrated** — The BackupButton component exists at `src/components/Backup/BackupButton.tsx` but is NOT rendered in the Toolbar. Users cannot create manual backups.
2. **CRITICAL: RecoveryPrompt Not Integrated** — The RecoveryPrompt component exists at `src/components/Backup/RecoveryPrompt.tsx` but is NOT rendered in App.tsx. Crash recovery cannot work.
3. **CRITICAL: BackupManager Not Accessible** — The BackupManager component exists at `src/components/Backup/BackupManager.tsx` but is NOT accessible from any UI path.

## Scores
- **Feature Completeness: 3/10** — All 9 deliverable files exist and implement the correct interfaces, but none are wired into the main application. The backup functionality is a disconnected island of code.
- **Functional Correctness: 3/10** — Unit tests pass (6989/6989) proving isolated components work correctly, but the integration with the main application is missing. Browser test confirms no "Backup" text exists in the DOM.
- **Product Depth: 7/10** — The backup store implements all P0 interfaces correctly (createBackup, restoreBackup, deleteBackup, listBackups, getAutoSave, clearAutoSave, getStorageUsage, exportBackup, importBackup). The hook provides auto-save interval logic.
- **UX / Visual Quality: 5/10** — Individual components (BackupButton, BackupManager, RecoveryPrompt) are well-designed with proper styling, icons, and accessibility attributes. However, they cannot be accessed by users.
- **Code Quality: 9/10** — TypeScript compiles with 0 errors, tests pass, build succeeds. Code structure follows existing patterns.
- **Operability: 2/10** — The system cannot be operated by end users. No backup button, no recovery prompt, no backup management UI.

- **Average: 4.8/10**

## Evidence

### File Existence Verification
All 9 contract deliverable files exist:
1. ✅ `src/store/backupStore.ts` — 386 lines
2. ✅ `src/hooks/useCircuitBackup.ts` — 231 lines
3. ✅ `src/components/Backup/BackupManager.tsx` — 378 lines
4. ✅ `src/components/Backup/RecoveryPrompt.tsx` — 378 lines
5. ✅ `src/components/Backup/BackupButton.tsx` — 377 lines
6. ✅ `src/__tests__/backupStore.test.ts` — 56 tests
7. ✅ `src/__tests__/useCircuitBackup.test.ts` — 28 tests
8. ✅ `src/__tests__/BackupManager.test.tsx` — 26 tests
9. ✅ `src/__tests__/RecoveryPrompt.test.tsx` — 14 tests

### Test Suite Verification
```
npm test -- --run
Test Files  242 passed (242)
Tests  6989 passed (6989)
Exit code: 0
```

### TypeScript Verification
```
npx tsc --noEmit
Exit code: 0 (0 errors)
```

### Build Verification
```
npm run build
dist/assets/index-BTq2IoQH.js: 435.79 kB
✓ built in 2.84s
Result: PASS — 435,793 bytes < 512 KB limit (88,495 bytes headroom)
```

### act() Warnings Verification
```
npm test -- --run 2>&1 | grep -ciE "not wrapped in act|inside an act"
Result: 0 (zero act() warnings)
```

### Browser Verification — FAILED
```javascript
document.body.innerHTML.includes('Backup')
Result: false
```

**Verified UI elements missing:**
- No "Backup" button in Toolbar
- No "RecoveryPrompt" modal on page load
- No "BackupManager" accessible from any menu
- No evidence of backup-related text anywhere in the application

### Integration Verification

**Toolbar.tsx inspection:**
- Does NOT import `BackupButton`
- Does NOT render `BackupButton`
- No "Backup" related buttons in toolbar

**App.tsx inspection:**
- Does NOT import `BackupButton`, `BackupManager`, or `RecoveryPrompt`
- Does NOT render `RecoveryPrompt`
- No state management for backup visibility

## Acceptance Criteria Evidence

### AC-169-001: Auto-save works correctly
- **Status:** UNTESTABLE
- **Evidence:** `useCircuitBackup.ts` hook exists with auto-save interval logic, but the hook is NOT called from any component in the running application. Browser verification confirms no auto-save UI.

### AC-169-002: Version history is maintained
- **Status:** UNTESTABLE
- **Evidence:** `backupStore.ts` implements MAX_BACKUP_COUNT = 10 and FIFO logic, but users cannot view version history without BackupManager integration.

### AC-169-003: Crash recovery works
- **Status:** FAIL
- **Evidence:** `RecoveryPrompt.tsx` exists with correct implementation, but it is NOT rendered in `App.tsx`. Browser test confirms no recovery modal appears.

### AC-169-004: Manual backup creation
- **Status:** FAIL
- **Evidence:** `BackupButton.tsx` exists with dropdown menu, but it is NOT integrated into the Toolbar. Browser test confirms no "Backup" button in UI.

### AC-169-005: Storage management
- **Status:** UNTESTABLE
- **Evidence:** `BackupManager.tsx` displays storage usage, but the component is not accessible from any UI path.

### AC-169-006: Import/export functionality
- **Status:** UNTESTABLE
- **Evidence:** `exportBackup()` and `importBackup()` methods exist in store, but no UI trigger for these actions.

### AC-169-007: No regression in existing functionality
- **Status:** PASS
- **Evidence:** 242 test files, 6989 tests, TypeScript 0 errors, build under 512KB, 0 act() warnings.

## Bugs Found

### [CRITICAL] Backup Components Not Integrated Into Main Application
**Description:** All backup components (BackupButton, RecoveryPrompt, BackupManager) exist and pass unit tests, but are NOT wired into the main application UI. Users cannot access any backup functionality.

**Reproduction Steps:**
1. Start dev server: `npm run dev`
2. Open http://localhost:5173
3. Inspect the toolbar — no "Backup" button
4. Inspect the entire page — no "Backup" text
5. Reload the page — no "RecoveryPrompt" modal
6. Check App.tsx — Backup components not imported

**Impact:** All P0 and P1 features of the backup system are inaccessible to end users. The sprint contract deliverables exist but provide zero user-facing functionality.

**Fix Required:**
1. Import and render `BackupButton` in `Toolbar.tsx`
2. Import and render `RecoveryPrompt` in `App.tsx` (conditionally based on `hasUnsavedChanges`)
3. Wire up BackupManager access (via BackupButton dropdown or separate state/modal)

## Required Fix Order
1. **Highest Priority:** Integrate `BackupButton` into `Toolbar.tsx` — without this, users cannot create manual backups
2. **High Priority:** Integrate `RecoveryPrompt` into `App.tsx` with proper visibility state management — without this, crash recovery cannot work
3. **Medium Priority:** Wire up `BackupManager` access path from `BackupButton` dropdown or App state
4. **Medium Priority:** Call `useCircuitBackup` hook from a mounted component to enable auto-save interval

## What's Working Well
1. **Test Coverage:** All 124 new tests pass with 0 failures
2. **TypeScript:** Zero compilation errors across entire codebase
3. **Build Size:** Bundle is 435.79 KB with 88,495 bytes under limit
4. **Component Code Quality:** BackupButton, BackupManager, RecoveryPrompt have polished UI with icons, styling, and accessibility attributes
5. **Store Implementation:** backupStore correctly implements all P0 interfaces with proper error handling
6. **Hook Implementation:** useCircuitBackup provides auto-save interval logic, beforeunload warning, and recovery detection

## Done Definition Verification

| # | Requirement | Status | Evidence |
|---|-------------|--------|----------|
| 1 | `npm test -- --run` passes 242 files | ✅ PASS | 242 passed, 6989 tests |
| 2 | `npx tsc --noEmit` exits 0 | ✅ PASS | Exit code 0, 0 errors |
| 3 | `npm run build` ≤512KB | ✅ PASS | 435.79 KB |
| 4 | Backup store P0 interfaces | ✅ PASS | All methods implemented |
| 5 | Recovery prompt on reload | ❌ FAIL | Not integrated into App.tsx |
| 6 | Auto-save at interval | ❌ FAIL | Hook not called in app |
| 7 | 124 new tests pass | ✅ PASS | All pass |
| 8 | Import/export works | ❌ FAIL | UI trigger missing |
| 9 | No act() warnings | ✅ PASS | 0 warnings |
| 10 | Existing tests pass | ✅ PASS | 242/242 pass |

**Done Definition: 5/10 conditions met**
