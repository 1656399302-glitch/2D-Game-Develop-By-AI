# QA Evaluation — Round 115

## Release Decision
- **Verdict:** FAIL
- **Summary:** Custom dimension inputs are implemented in ExportModal.tsx but ExportDialog is what the app actually renders - ExportModal is never used in the application flow, making AC-115-002 unverifiable.
- **Spec Coverage:** PARTIAL
- **Contract Coverage:** FAIL
- **Build Verification:** PASS (TypeScript 0 errors, 4947 tests pass, build succeeds)
- **Browser Verification:** FAIL (ExportModal not rendered in app)
- **Placeholder UI:** NONE
- **Critical Bugs:** 1
- **Major Bugs:** 1
- **Minor Bugs:** 0
- **Acceptance Criteria Passed:** 2/5
- **Untested Criteria:** 3

## Blocking Reasons

1. **CRITICAL: Wrong Component Modified** — The contract specified modifying `src/components/Export/ExportModal.tsx` but `App.tsx` renders `src/components/Export/ExportDialog` (line 671). `ExportModal` is never rendered in the application. The custom dimension inputs exist in ExportModal but are never visible to users.

2. **AC-115-002 Unverifiable** — Browser testing confirms that the Export dialog shows only SVG/PNG format options with no width/height inputs. The custom dimension inputs specified in AC-115-002 do not exist in the running system's export flow.

3. **Architecture Mismatch** — ExportDialog only supports SVG/PNG formats while ExportModal supports 8 format types including poster/social formats. This discrepancy indicates the two components serve different purposes but only ExportDialog is actually used.

## Scores

- **Feature Completeness: 4/10** — Code is written but not integrated into the application flow. ExportModal has all features but is never rendered.
- **Functional Correctness: 5/10** — TypeScript compiles, tests pass, but the actual UI flow doesn't use the implemented features.
- **Product Depth: 6/10** — Good implementation in ExportModal but it doesn't matter if no user can access it.
- **UX / Visual Quality: 3/10** — Users cannot see or use custom dimension inputs in the actual export flow.
- **Code Quality: 8/10** — Clean code structure in the modified files, proper TypeScript typing.
- **Operability: 7/10** — Build succeeds, tests pass, but integration is broken.

- **Average: 5.5/10**

## Evidence

### AC-115-001: Unified Export Module — No Duplicate Code
```bash
$ grep -n "function generateCodexCardSVG" src/utils/unifiedExportUtils.ts src/utils/exportUtils.ts src/services/exportService.ts
src/utils/unifiedExportUtils.ts:131:export function generateCodexCardSVG(
```
**Status:** PASS ✓ — Only 1 definition exists in unifiedExportUtils.ts

### AC-115-002: Custom Poster Dimensions — UI Entry
```bash
$ grep -n "ExportDialog\|ExportModal" src/App.tsx
6:import { ExportDialog } from './components/Export/ExportDialog';
671:        {showExport && <ExportDialog onClose={() => setShowExport(false)} />}
```
**Status:** FAIL ✗ — App.tsx renders ExportDialog, NOT ExportModal

Browser test screenshot confirms: Export dialog shows only SVG/PNG format options. No width/height inputs visible.

### TM-115-002: Custom Dimensions UI — Validation
```bash
$ grep -n "customDimensions\|custom-width\|custom-height" src/components/Export/ExportDialog.tsx
(no output)
```
**Status:** FAIL ✗ — ExportDialog has no custom dimension inputs

### AC-115-003: Export Error Feedback — Lifecycle
ExportDialog has error toast implementation:
```bash
$ grep -n "error\|Error" src/components/Export/ExportDialog.tsx | head -10
27:interface ErrorToast {
32:  error: ErrorToast;
35:  error: { visible: false, message: '' },
47:  // Show error toast
48:  const showError = useCallback((message: string) => {
```
**Status:** PARTIAL — Error handling exists in ExportDialog, but cannot verify lifecycle without dimension inputs.

### AC-115-004: Export Preview Accuracy
```bash
$ grep -n "ExportPreview\|preview" src/components/Export/ExportDialog.tsx
(no output)
```
**Status:** FAIL ✗ — ExportDialog doesn't have an ExportPreview component

### AC-115-005: Build Verification — Regression Check
```bash
$ npm test -- --run 2>&1 | tail -5
Test Files  182 passed (182)
     Tests  4947 passed (4947)

$ npx tsc --noEmit
Exit code: 0 ✓

$ npm run build 2>&1 | tail -3
✓ built in 2.18s ✓
```
**Status:** PASS ✓

## Architecture Analysis

### ExportModal.tsx (what was modified)
- Has custom dimension inputs (`#custom-width`, `#custom-height`)
- Has width/height validation (400-2000px range)
- Has error toast for export failures
- Has ExportPreview component
- Supports 8 export formats including poster/social
- **Status:** NOT USED in App.tsx

### ExportDialog.tsx (what's actually rendered)
- Only supports SVG and PNG formats
- No custom dimension inputs
- Has basic error toast
- Uses CodexCardExport component
- **Status:** ACTUALLY RENDERED in App.tsx

### Component Relationship
```
App.tsx → ExportDialog → exportService → unifiedExportUtils ✓ (this chain works)
App.tsx → ExportModal → ❌ (never rendered)
```

## Bugs Found

### 1. [CRITICAL] Wrong Component Modified
**Description:** Contract specified modifying ExportModal.tsx but App.tsx renders ExportDialog. ExportModal has all the custom dimension features but is never visible to users.
**Reproduction:** 
1. Open browser to http://localhost:5173
2. Generate a machine with random forge
3. Click Export button
4. Observe only SVG/PNG options appear - no poster dimensions
**Impact:** AC-115-002 is unverifiable. Users cannot access the custom dimension feature.

### 2. [MAJOR] ExportDialog Missing Contract Features
**Description:** ExportDialog only supports 2 formats (SVG/PNG) while the contract expects poster dimensions and 8 format options. No `validateDimensions`, no `getDefaultDimensionsForFormat`, no `customDimensions` state.
**Reproduction:** Same as above
**Impact:** The acceptance criteria cannot be satisfied with the current implementation.

## Required Fix Order

1. **Replace ExportDialog with ExportModal in App.tsx** OR implement the custom dimension features in ExportDialog
   - Option A: Change `import { ExportDialog }` to `import { ExportModal }` in App.tsx line 6, update usage on line 671
   - Option B: Add custom dimension inputs, validation, and preview to ExportDialog

2. **Verify browser test passes** after fix:
   - Export dialog opens
   - Width/height inputs visible for poster format
   - Dimension validation works (below 400, above 2000)
   - Format switching resets dimensions

## What's Working Well

1. **Code Structure** — The unified export module (`unifiedExportUtils.ts`) is correctly implemented with no duplicate code
2. **TypeScript Clean** — Zero TypeScript errors, proper type definitions
3. **Test Coverage** — 4947 tests pass including 47 unified export tests and 26 export modal tests
4. **Build Success** — Production build completes in 2.18s
5. **Error Handling** — Error toast infrastructure exists in ExportDialog

## Contract Deliverable Audit

| Deliverable | File | Status |
|-------------|------|--------|
| 1. New unifiedExportUtils.ts | `src/utils/unifiedExportUtils.ts` | EXISTS ✓ |
| 2. Modified ExportModal.tsx | `src/components/Export/ExportModal.tsx` | EXISTS ✓ (but NOT USED) |
| 3. Modified ExportDialog.tsx | `src/components/Export/ExportDialog.tsx` | EXISTS ✓ (but MISSING features) |
| 4. New unifiedExport.test.ts | `src/__tests__/unifiedExport.test.ts` | EXISTS ✓ |
| 5. Modified exportService.ts | `src/services/exportService.ts` | EXISTS ✓ |
| 6. Modified exportUtils.ts | `src/utils/exportUtils.ts` | EXISTS ✓ |

All 6 deliverable files exist, but the **integration is broken** - ExportModal is never rendered.

## Conclusion

The round fails because the contract requirements are not accessible to users. While code was written in ExportModal.tsx, the actual export flow uses ExportDialog which lacks the required custom dimension inputs and poster format support. This is an integration failure that requires either:
1. Switching App.tsx to use ExportModal instead of ExportDialog, OR
2. Implementing the same features in ExportDialog

The test suite passes (4947 tests) because the tests import ExportModal directly and test it in isolation, but the application flow never renders ExportModal.
