# Sprint Contract — Round 115

## Scope

Export System Enhancement: Consolidate duplicate SVG generation code, add custom poster dimensions, and improve export error handling.

## Spec Traceability

### P0 items covered this round
- Export consolidation: Merge duplicate SVG generation functions from `src/utils/exportUtils.ts` and `src/services/exportService.ts` into a single unified module at `src/utils/unifiedExportUtils.ts`
- Custom poster dimensions: Add width/height input fields to `ExportModal` for user-defined poster sizes, with validation (min 400px, max 2000px per dimension)
- Export error handling: Add user-visible error feedback for failed exports; error toast must appear and modal must remain usable after error dismissal

### P1 items covered this round
- Test coverage: Add unit tests for edge cases in poster dimension handling and export error paths
- Export preview accuracy: Ensure preview accurately reflects actual export output dimensions and aspect ratio

### P0/P1 items remaining after this round
- None: All P0/P1 items from spec are addressed; this round focuses on technical debt and UX improvement

### P2 items intentionally deferred
- AI naming/description enhancement (move from Beta to production)
- Community backend integration for Exchange system
- Faction tech tree visual redesign
- Mobile-specific export optimization

## Deliverables

1. **New file: `src/utils/unifiedExportUtils.ts`**
   - Unified SVG generation functions (single source of truth)
   - Shared module rendering templates
   - Centralized bounds calculation
   - All functions fully typed with no `any` bypasses

2. **Modified file: `src/components/Export/ExportModal.tsx`**
   - Width input field and height input field visible in export panel
   - Default values: 800×1000 (poster), 1200×675 (twitter)
   - Real-time dimension validation: min 400px, max 2000px per dimension
   - Invalid input triggers visible inline error message below the field
   - Preview updates when custom dimensions change

3. **Modified file: `src/components/Export/ExportDialog.tsx`**
   - Imports SVG generation from `unifiedExportUtils.ts`
   - Improved error states: shows user-visible error message (not silent failure)
   - Modal remains usable after error dismissal (does not crash or lock)

4. **New file: `src/__tests__/unifiedExport.test.ts`**
   - Tests for unified SVG generation output correctness
   - Tests for dimension validation (boundary: 399, 400, 2000, 2001)
   - Tests for error handling paths (SVG failure, PNG failure)

5. **Modified file: `src/services/exportService.ts`**
   - Refactored to import from `unifiedExportUtils.ts`
   - No inline duplicate `generateCodexCardSVG` or module rendering functions
   - TypeScript compiles with 0 errors after refactor

6. **Modified file: `src/utils/exportUtils.ts`**
   - Refactored to import from `unifiedExportUtils.ts`
   - No inline duplicate `generateCodexCardSVG` or module rendering functions
   - TypeScript compiles with 0 errors after refactor

## Acceptance Criteria

### AC-115-001: Unified Export Module — No Duplicate Code
- `src/utils/exportUtils.ts` contains NO inline definition of `generateCodexCardSVG`
- `src/services/exportService.ts` contains NO inline definition of `generateCodexCardSVG`
- Both files import from `src/utils/unifiedExportUtils.ts`
- `src/utils/unifiedExportUtils.ts` contains exactly one definition of `generateCodexCardSVG`
- Negative: grep must not find a second copy of `generateCodexCardSVG` in either `exportUtils.ts` or `exportService.ts`

### AC-115-002: Custom Poster Dimensions — UI Entry
- ExportModal renders width and height `<input>` fields when opened
- Default display: "800" in width field, "1000" in height field on first open
- AC-115-002a (below-range): Entering "350" in width field triggers an error message beneath that field; the field value is NOT accepted
- AC-115-002b (above-range): Entering "2001" in height field triggers an error message beneath that field; the field value is NOT accepted
- AC-115-002c (valid): Entering "1000" in width and "1200" in height does NOT show an error message
- AC-115-002d (reset): Switching from "Poster" to "Twitter" format resets fields to "1200" and "675" respectively

### AC-115-003: Export Error Feedback — Lifecycle
- Entry: User clicks Export → ExportModal opens without errors
- Error trigger: When SVG generation fails (e.g., corrupt module data), an error toast/message appears within 2 seconds
- Error message contains actionable text (e.g., "Try reducing image size" or similar guidance)
- Completion/dismissal: User can dismiss the error (click X or click outside)
- Post-dismissal: ExportModal remains open and usable; user can attempt export again
- Retry: Attempting export again after dismissal works correctly (may succeed or show new error)
- Negative: ExportModal does not crash, freeze, or become permanently non-interactive after an error

### AC-115-004: Export Preview Accuracy
- Preview aspect ratio matches the selected format's configured ratio (Poster: 800:1000 = 0.8, Twitter: 1200:675 ≈ 1.78)
- AC-115-004a: Changing width to "1200" on Poster format updates the preview to show 1200×1000 proportions (not 800×1000)
- AC-115-004b: Preview element does NOT show stale dimensions after user changes the input fields
- Negative: Preview does not show dimensions outside the 400–2000px safe range even if user enters them (validation blocks or clamps)

### AC-115-005: Build Verification — Regression Check
- `npx tsc --noEmit` exits with code 0 (0 TypeScript errors)
- `npm test -- --run` reports ≥4892 tests passing (all existing tests + new tests)
- `npm run build` completes without errors
- No console Error-level messages appear in the browser when opening the ExportModal
- Negative: No new TypeScript errors introduced; no existing tests broken by refactoring

## Test Methods

### TM-115-001: Unified Export Module — Duplicate Code Check

**Step 1 — Count definitions of `generateCodexCardSVG`:**
```bash
grep -n "function generateCodexCardSVG\|const generateCodexCardSVG" src/utils/unifiedExportUtils.ts src/utils/exportUtils.ts src/services/exportService.ts
```
Expected in `unifiedExportUtils.ts`: exactly 1 match
Expected in `exportUtils.ts`: 0 matches
Expected in `exportService.ts`: 0 matches

**Step 2 — Verify imports exist:**
```bash
grep -n "unifiedExportUtils" src/utils/exportUtils.ts src/services/exportService.ts
```
Expected: both files contain at least one import from `unifiedExportUtils`

**Step 3 — Verify no stale inline module rendering functions remain:**
```bash
grep -n "moduleSVG\|renderModuleToSVG\|generateModuleSVG" src/utils/exportUtils.ts src/services/exportService.ts
```
Expected: returns lines only for import statements referencing `unifiedExportUtils`; no inline implementations

**Step 4 — Verify `unifiedExportUtils.ts` exports the key function:**
```bash
grep -n "^export " src/utils/unifiedExportUtils.ts | grep "generateCodexCardSVG"
```
Expected: at least 1 match

### TM-115-002: Custom Dimensions UI — Validation

**Setup:** `npm run dev`, open browser, navigate to editor, add at least one module to canvas, click Export button.

**AC-115-002 (Entry):**
- Verify `<input>` elements with `type="number"` exist for width and height in the export panel
- Verify default values on first open

**AC-115-002a (below-range):**
- Find width input, clear it, type "350", blur or submit
- Expected: an error message element (e.g., `<span>`, `<p>`, or `<div>` with class containing "error" or role="alert") appears below the field
- Negative: the export should NOT proceed with dimension 350

**AC-115-002b (above-range):**
- Find height input, clear it, type "2001", blur or submit
- Expected: an error message appears below the height field

**AC-115-002c (valid):**
- Find both inputs, set width to "1000", height to "1200"
- Expected: no error message appears
- Negative: no error toast should appear

**AC-115-002d (format reset):**
- With poster format selected (800×1000), select "Twitter" from format dropdown
- Expected: width resets to "1200", height resets to "675"
- Verify no crash occurs during format switch

### TM-115-003: Export Error Handling — Lifecycle

**Entry:**
1. Open ExportModal successfully
2. Verify no error messages are shown on initial open

**Error trigger:**
- Mock a failure scenario (inject corrupt module data or use a test helper to force SVG generation to throw)
- Click the export button
- Expected: error toast/message appears within 2 seconds of clicking export
- Verify error text contains actionable guidance

**Dismissal:**
- Click the X button on the error toast OR click outside the toast to dismiss
- Expected: error toast disappears from DOM

**Post-dismissal state:**
- ExportModal is still visible and open
- User can interact with dimension inputs and format selector
- User can click export again (retry path)
- Negative: ExportModal does not show a blank/white overlay, does not freeze, does not require page reload

**Repeat/retry:**
- Attempt export again after dismissal
- Expected: either succeeds normally or shows a new error (repeatable)
- Negative: second attempt does not crash

### TM-115-004: Export Preview Accuracy

1. Open ExportModal
2. Select "Poster" format
3. Verify preview element dimensions match 800×1000 ratio (use browser devtools or measure)
4. Change width input to "1200", leave height at "1000"
5. Wait for preview to update (max 500ms)
6. Measure preview element: expected width ≈ 1200 × (1000/800) = 1500 for proportional scaling, OR preview updates to show 1200×1000 container
7. Select "Twitter" format
8. Verify preview resets to approximately 1200×675 proportions
9. Negative: preview does not retain stale dimensions (e.g., 800×1000) after format switch

### TM-115-005: Build and Regression Verification

```bash
npx tsc --noEmit
echo "Exit code: $?"
```
Expected: 0

```bash
npm test -- --run 2>&1 | tail -5
```
Expected: "Tests  N passed" where N ≥ 4892

```bash
npm run build 2>&1 | tail -3
```
Expected: build completes without error lines

**Browser smoke test:**
1. Load the app in browser
2. Open DevTools → Console tab
3. Click Export button
4. Verify no Error-level console messages appear
5. Negative: no `Uncaught` errors in console

## Risks

1. **Refactoring Risk (Medium)**: Consolidating duplicate code may introduce regressions
   - Mitigation: Comprehensive test coverage (≥4892 tests), incremental refactoring, verify no duplicate functions after merge
   - Fallback: Revert to separate implementations if regressions appear

2. **Test Brittleness (Low)**: New tests may be too coupled to implementation details
   - Mitigation: Focus on behavior (input/output), not internal state

3. **Dimension Validation Edge Cases (Low)**: Custom dimensions may cause canvas rendering issues or memory exhaustion
   - Mitigation: Clamp dimensions to safe range (400–2000px per dimension); validation must reject out-of-range before any rendering

4. **Preview/Export Mismatch (Medium)**: Preview may not perfectly match actual export output
   - Mitigation: Both preview and export must call the same SVG generation function from `unifiedExportUtils.ts`

5. **Error Handling UI Regression (Medium)**: Error feedback changes may break existing error paths
   - Mitigation: Verify ExportDialog.tsx error states still function for all error types (SVG failure, PNG failure, network error)

## Failure Conditions

The round fails if ANY of the following are true:

1. TypeScript compilation produces ≥1 error (`npx tsc --noEmit` exits non-zero)
2. Any existing test fails (regression): `npm test -- --run` reports <4892 passing tests
3. Build fails: `npm run build` exits with error
4. Duplicate SVG generation code still exists after refactoring (grep finds `generateCodexCardSVG` inline in `exportUtils.ts` or `exportService.ts`)
5. Export functionality breaks for any existing format type (poster, twitter, or any other supported format)
6. Custom dimensions cause a crash, white screen, or unhandled exception in the ExportModal
7. Error feedback silently swallows errors without displaying any user-visible message
8. Error state leaves ExportModal permanently non-interactive (user cannot dismiss error or retry)
9. ExportModal shows TypeError or unhandled Promise rejection in browser console on open

## Done Definition

The round is complete when ALL of the following are true simultaneously:

1. **Code delivered**: All 6 deliverables (1 new file, 5 modified files) exist with content matching the Deliverables section
2. **No duplicate code**: `grep -n "function generateCodexCardSVG" src/utils/exportUtils.ts src/services/exportService.ts` returns zero lines
3. **Dimension inputs present**: Browser test confirms `<input>` fields for width and height are visible in the ExportModal
4. **Dimension validation works**: AC-115-002a, AC-115-002b, AC-115-002c all pass (below-range shows error, above-range shows error, valid does not)
5. **Format reset works**: Switching format types resets dimension fields to their defaults
6. **Error feedback works**: When SVG generation fails, an error message appears within 2 seconds and can be dismissed; ExportModal remains usable after dismissal
7. **Preview updates**: Preview element reflects dimension input changes without page reload
8. **Tests pass**: `npm test -- --run` shows ≥4892 tests passing
9. **Build succeeds**: `npm run build` completes with exit code 0
10. **TypeScript clean**: `npx tsc --noEmit` exits with code 0
11. **No console errors**: Browser console shows no Error-level messages when interacting with the ExportModal

## Out of Scope

1. AI naming/description enhancements (P2)
2. Backend integration for community features (P2)
3. Mobile-specific export optimization (P2)
4. Faction tech tree visual redesign (P2)
5. New export format types beyond the 8 existing formats (already supported in current codebase)
6. Animation export (GIF/mp4) (P2)
7. Batch export functionality (P2)
8. Export presets management (P2)
9. Changes to validation UI components from Round 113/114 (not modified by this contract)
10. Changes to activation state machine or circuit validation logic (not modified by this contract)

---

**APPROVED** — Round 115 contract approved for implementation. All acceptance criteria are specific, binary, and testable. Error handling lifecycle is thoroughly covered including dismissal, post-dismissal, and retry paths. Failure conditions are comprehensive. No scope mixing or operator inbox violations detected.