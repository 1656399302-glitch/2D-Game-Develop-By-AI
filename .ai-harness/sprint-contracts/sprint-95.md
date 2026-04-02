# Sprint Contract — Round 95

## Scope

**CRITICAL REMEDIATION:** The new ExportDialog.tsx (with Standard/High quality presets) exists and passes 14 unit tests, but is NOT integrated into the main UI. The export button still triggers the old ExportModal.tsx. This round must wire ExportDialog.tsx into the main app toolbar, replacing/disconnecting ExportModal.tsx trigger.

This is a remediation-only sprint focused exclusively on integrating the existing ExportDialog.tsx into the main UI flow. No new functionality is being added; the component and service layer already exist and pass tests.

## Spec Traceability

- **P0 items covered this round:**
  - AC-EXPORT-001 (FIX REQUIRED): Integrate ExportDialog.tsx into main UI so export button triggers ExportDialog (NOT ExportModal)

- **P0 items remaining after this round:**
  - None for export dialog integration (AC-EXPORT-001 will be resolved)

- **P1 items covered this round:**
  - None (focused remediation only)

- **P1 items remaining after this round:**
  - None related to export dialog integration

- **P2 items intentionally deferred:**
  - All P2 items remain deferred (no new features in this remediation round)

- **Previously passing ACs (NOT re-verified this round):**
  - AC-EXPORT-002: Poster contains all 6 required elements (VERIFIED Round 94, 16 tests pass)
  - AC-EXPORT-003: PNG export is downloadable and non-empty (VERIFIED Round 94)
  - AC-EXPORT-004: SVG export produces valid SVG (VERIFIED Round 94)
  - AC-EXPORT-005: Export completes within 5 seconds (VERIFIED Round 94)
  - AC-EXPORT-006: Build size under 545KB (VERIFIED Round 94: 536.29 KB)
  - AC-EXPORT-007: All existing tests pass (VERIFIED Round 94: 3329 tests)

## Deliverables

1. **ExportDialog integration** — Export button ("📤 导出") in machine editor toolbar must trigger ExportDialog.tsx, NOT ExportModal.tsx
2. **ExportModal disconnection** — Old ExportModal.tsx must NOT be reachable via the export button in the main UI
3. **Machine state passing** — ExportDialog must receive correct machine state (modules, connections, attributes, faction) for poster generation
4. **Integration verification** — Browser test confirming ExportDialog renders with Standard/High presets when export button clicked

## Acceptance Criteria

1. **AC-EXPORT-001 (FIXED):** Clicking "📤 导出" button in machine editor opens ExportDialog.tsx. ExportModal.tsx does NOT open.
2. **AC-EXPORT-001 (FIXED):** Export dialog shows PNG/SVG format selection with Standard/High quality presets visible
3. **AC-EXPORT-001 (FIXED):** When PNG is selected, Standard (800×1000px) and High (1600×2000px) quality preset options are visible and selectable
4. **AC-EXPORT-001 (FIXED):** When SVG is selected, format switch works without showing resolution presets
5. **AC-EXPORT-001 (FIXED):** ExportModal with 1x/2x/4x resolution selectors does NOT appear when export button is clicked
6. **Regression:** All 3329 tests continue to pass (verified by `npx vitest run`)
7. **Regression:** Build size remains ≤ 545KB (verified by `npm run build`)

## Test Methods

### 1. Browser Integration Test — PRIMARY VERIFICATION (AC-EXPORT-001)

**Setup:**
```bash
npm run dev
# Navigate to http://localhost:5173
```

**Test Steps:**
1. Click "随机锻造" to generate a random machine (ensures machine state exists)
2. Click "📤 导出" button in toolbar

**Assertions (ALL must pass):**
- **Assert A:** Dialog header/title contains "Export" or "导出" text
- **Assert B:** Dialog has exactly 2 format options: "PNG" and "SVG" (NOT 8 options)
- **Assert C:** Quality preset section shows "Standard" and "High" labels
- **Assert D:** PNG selection shows pixel dimensions (800×1000, 1600×2000) NOT multipliers (1x, 2x, 4x)
- **Assert E:** No element with text "1x", "2x", or "4x" appears in the dialog
- **Assert F:** No element with text "Poster", "Enhanced", "Faction Card", "Twitter", "Instagram", or "Discord" appears in the dialog (these are ExportModal options)

### 2. ExportModal Negative Assertion Test — REQUIRED

**Test Steps:**
1. Open browser devtools console
2. Click "📤 导出" button
3. Inspect DOM for ExportModal elements

**Assertions:**
- **Assert G:** `document.querySelector('[class*="ExportModal"]')` returns null
- **Assert H:** `document.querySelector('[class*="format-option"]')` with 8 children returns null
- **Assert I:** `document.querySelector('[class*="resolution"]')` with "1x"/"2x"/"4x" text returns null

### 3. Quality Preset Functional Test

**Test Steps:**
1. Click "📤 导出" button → ExportDialog opens
2. Verify PNG is selected (default or manually selected)
3. Click "Standard" preset → trigger export/download
4. Click "📤 导出" button → ExportDialog opens
5. Click "High" preset → trigger export/download
6. Click "📤 导出" button → ExportDialog opens
7. Select "SVG" format → verify quality presets are hidden/not applicable

**Assertions:**
- **Assert J:** Standard export produces smaller file than High export (quality difference)
- **Assert K:** SVG export completes without quality preset selection

### 4. Regression Test Suite

**Test Command:**
```bash
npx vitest run
```

**Assertions:**
- **Assert L:** Test count = 3329 (exactly, no skips, no pending)
- **Assert M:** All 150 test files pass
- **Assert N:** Duration shown (verification test ran)

### 5. Build Size Verification

**Test Command:**
```bash
npm run build
```

**Assertions:**
- **Assert O:** `dist/assets/index-*.js` size ≤ 545KB
- **Assert P:** Build completes without errors

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Machine state not correctly passed to ExportDialog | Medium | High | Verify poster contains machine name/ID after export |
| ExportModal code path still reachable | Low | High | Verify ExportModal component NOT imported in toolbar trigger |
| Component test changes needed after integration | Low | Medium | Run full test suite; integration verification is separate from unit tests |
| Build size increase from integration | Low | Medium | Monitor build size; ExportDialog already exists in bundle |

## Failure Conditions

**The round MUST FAIL if ANY of these occur:**

1. Export button opens ExportModal.tsx (not ExportDialog.tsx)
2. ExportDialog dialog shows 1x/2x/4x resolution options instead of Standard/High presets
3. ExportModal with 8 format options appears when export button is clicked
4. ExportDialog does not receive correct machine state (exported poster missing machine data)
5. Test count is not 3329 (any regressions, skips, or new failures)
6. Build size exceeds 545KB
7. Build fails or TypeScript errors occur
8. ExportDialog quality presets do not function (Standard ≠ 800×1000, High ≠ 1600×2000)

## Done Definition

**ALL of the following must be TRUE before claiming round complete:**

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| 1 | ExportDialog.tsx is imported in toolbar/App component | Code inspection |
| 2 | Export button click handler triggers ExportDialog (NOT ExportModal) | Browser test |
| 3 | ExportDialog shows exactly PNG/SVG format options (NOT 8 options) | Browser inspection |
| 4 | ExportDialog shows Standard/High quality presets for PNG | Browser inspection |
| 5 | ExportModal elements ABSENT when export button clicked | Browser DOM check |
| 6 | ExportModal code NOT reachable from toolbar | Code inspection |
| 7 | Machine state (modules, connections) passed to ExportDialog | Browser test (verify poster has machine name) |
| 8 | Standard quality = 800×1000px, High quality = 1600×2000px | Export file dimensions |
| 9 | SVG format works without quality presets shown | Browser test |
| 10 | All 3329 tests pass (`npx vitest run` shows 0 failures) | Test runner |
| 11 | Build size ≤ 545KB (`npm run build` succeeds) | Build output |
| 12 | No TypeScript errors | Build output |

## Out of Scope

- Modifying ExportDialog.tsx internals (already meets requirements, 14 tests pass)
- Modifying ExportModal.tsx internals (only disconnection matters)
- Creating new export functionality (already exists in ExportDialog/exportService)
- Adding new unit tests for ExportDialog component (already covered by 14 tests)
- Adding integration tests to test suite (browser verification done manually or via e2e)
- UI polish beyond what ExportDialog already provides
- Feature work beyond export dialog integration
- Removing ExportModal.tsx from codebase (disconnection only, file may remain)
- Re-verifying AC-EXPORT-002 through AC-EXPORT-007 (verified in Round 94)

## Implementation Notes

### Files to Modify

1. **Toolbar component** (likely `src/components/Toolbar/` or similar)
   - Import ExportDialog
   - Replace/remove ExportModal import
   - Change export button click handler to render ExportDialog

2. **State passing** (likely via props or context)
   - Pass machine state: `modules`, `connections`, `attributes`, `faction`, `machineName`, `machineId`

### Files NOT to Modify

- `src/components/Export/ExportDialog.tsx` (already complete)
- `src/services/exportService.ts` (already complete)
- `src/__tests__/exportDialog.test.tsx` (component tests already pass)

### Verification Checklist

Before claiming complete, run through:
- [ ] Browser: Click "随机锻造" → Click "📤 导出" → See ExportDialog with PNG/SVG/Standard/High
- [ ] Browser: ExportModal NOT visible (no 1x/2x/4x, no 8 format options)
- [ ] Console: `npx vitest run` shows "Test Files: 150 passed, Tests: 3329 passed"
- [ ] Terminal: `npm run build` shows size ≤ 545KB
