APPROVED

# Sprint Contract — Round 116

## Scope

**CRITICAL REMEDIATION**: Fix the broken integration from Round 115. The custom dimension export features exist in `ExportModal.tsx` but `App.tsx` renders `ExportDialog`. This round must restore verifiability to AC-115-002 and complete the export flow integration.

## Spec Traceability

- **P0 items covered this round:**
  - AC-115-002: Custom poster dimensions UI (integration fix)
  - AC-115-004: Export preview accuracy (integration fix)
  
- **P1 items covered this round:**
  - TM-115-002: Custom dimensions UI validation (integration fix)
  - AC-115-003: Export error feedback lifecycle (verification)

- **Remaining P0/P1 after this round:**
  - None - completing the AC-115 contract requirements

- **P2 intentionally deferred:**
  - Enhanced poster format templates
  - Social media platform presets

## Deliverables

1. **`src/App.tsx`** — Updated to render `ExportModal` instead of `ExportDialog` (or merged ExportDialog with ExportModal features)
2. **`src/components/Export/ExportDialog.tsx`** — Either removed (if replaced by ExportModal) OR updated with custom dimension inputs and poster format support to match ExportModal's feature set
3. **`src/components/Export/ExportModal.tsx`** — Verified as the actual rendered export component
4. **`src/__tests__/integration/exportIntegration.test.ts`** — New integration tests that verify the export dialog opens and custom dimensions are visible
5. **`src/__tests__/integration/exportFlow.test.ts`** — Tests that verify the entire export flow from button click to dimension inputs to export completion

## Acceptance Criteria

1. **AC-116-001: Export Dialog Integration** — When user clicks the Export button in the toolbar, the export dialog opens AND displays custom dimension inputs (width/height fields) for poster formats. Users can input values between 400-2000px.

2. **AC-116-002: Format Switching Resets Dimensions** — When switching between export formats (SVG → PNG → Poster → Social), the custom dimension inputs reset to format-appropriate defaults.

3. **AC-116-003: Dimension Validation UI** — Attempting to enter a value below 400px or above 2000px shows a validation error message in the UI.

4. **AC-116-004: Export Preview Renders** — The export preview component displays an accurate preview of the machine at the selected dimensions.

5. **AC-116-005: Build Regression** — `npm test -- --run` passes with 4900+ tests, `npx tsc --noEmit` exits 0, `npm run build` succeeds.

## Test Methods

1. **Browser verification for AC-116-001:**
   - Start dev server: `npm run dev`
   - Open browser to http://localhost:5173
   - Generate a machine (Random Forge button)
   - Click Export button in toolbar
   - Verify export dialog opens
   - Verify width/height input fields are visible
   - Enter "800" in width field, verify it accepts the value

2. **Browser verification for AC-116-002:**
   - In export dialog, select "Poster" format
   - Enter custom dimensions (1200x800)
   - Switch to "SVG" format
   - Verify width/height fields reset to SVG defaults
   - Switch back to "Poster" format
   - Verify dimensions reset to poster defaults

3. **Browser verification for AC-116-003:**
   - In export dialog with poster format selected
   - Try to enter "300" in width field
   - Verify validation error appears: "Width must be between 400 and 2000"
   - Try to enter "2500" in height field
   - Verify validation error appears: "Height must be between 400 and 2000"
   - Enter "1500" - verify no error

4. **Browser verification for AC-116-004:**
   - In export dialog, select PNG format
   - Verify preview area shows machine preview
   - Change dimensions to 800x600
   - Verify preview updates to reflect new dimensions

5. **Build verification for AC-116-005:**
   ```bash
   npm test -- --run 2>&1 | tail -10
   npx tsc --noEmit
   npm run build 2>&1 | tail -5
   ```

## Risks

1. **Integration Risk**: If ExportModal has different props/interface than ExportDialog, swapping them could break other functionality. Need to verify prop compatibility.

2. **State Management Risk**: ExportDialog may have internal state that ExportModal doesn't handle the same way.

3. **Test Coverage Gap**: Previous tests passed because they tested ExportModal in isolation, not the actual application flow.

## Failure Conditions

1. **FC-116-001**: Export button click does not show custom dimension inputs (width/height fields not visible)
2. **FC-116-002**: `npm test -- --run` fails with any test failures
3. **FC-116-003**: `npx tsc --noEmit` reports TypeScript errors
4. **FC-116-004**: `npm run build` fails
5. **FC-116-005**: AC-115-002 remains unverifiable after this round

## Done Definition

**All five acceptance criteria must pass:**

1. ✅ Export dialog opens with visible width/height inputs
2. ✅ Format switching correctly resets dimension defaults  
3. ✅ Dimension validation errors display for out-of-range values
4. ✅ Export preview renders and updates with dimension changes
5. ✅ All 4900+ tests pass, TypeScript compiles clean, build succeeds

**Additionally:** `grep -n "ExportDialog\|ExportModal" src/App.tsx` must show consistent usage (only one export component imported and rendered).

## Out of Scope

- Adding new export formats beyond what exists in ExportModal
- Enhancing poster/social format templates
- AI text generation for machine names
- Community/sharing features
- New module types
- Animation system changes

## Technical Note

The root cause from Round 115:
- `src/App.tsx` line 6: `import { ExportDialog } from './components/Export/ExportDialog';`
- `src/App.tsx` line 671: `{showExport && <ExportDialog onClose={() => setShowExport(false)} />}`
- ExportModal has all features but is never rendered

**Two valid remediation paths:**
1. **Path A (Preferred)**: Replace ExportDialog usage with ExportModal in App.tsx
2. **Path B**: Implement ExportModal's features (custom dimensions, 8 formats, ExportPreview) directly in ExportDialog

Path A is preferred if ExportModal is fully functional. Path B is acceptable if ExportModal has compatibility issues with the app's export flow.
