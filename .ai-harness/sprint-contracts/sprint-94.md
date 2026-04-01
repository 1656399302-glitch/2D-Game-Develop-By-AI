APPROVED

# Sprint Contract — Round 95

## Scope

This sprint implements the **CodexCard poster export system** — enabling users to export their constructed magical machines as high-quality image cards suitable for sharing. The export produces a decorative poster containing machine visualization, attribute data, and faction branding.

## Spec Traceability

### P0 items covered this round
- **Export dialog with format selection** — Users can select poster format before downloading
- **CodexCard canvas rendering** — Canvas-based rendering of the poster with all required elements
- **PNG export with quality control** — Downloadable PNG at configurable resolution

### P1 items covered this round
- **SVG export fallback** — Vector format option for poster export
- **Export quality presets** — Standard/high-resolution quality settings
- **Machine name and attribute rendering on poster** — Title, stats, and metadata embedded in export

### Remaining P0/P1 after this round
- None — poster export system will be feature-complete after this sprint

### P2 intentionally deferred
- Animated poster exports (GIF/video)
- Custom poster templates/themes
- Social media direct integration
- Poster gallery/listing on server
- Multi-machine comparison poster

## Deliverables

1. **`src/components/Export/CodexCardExport.tsx`** — New component handling canvas-based poster rendering with decorative border, machine visualization, attribute panel, faction seal, and machine ID
2. **`src/components/Export/ExportDialog.tsx`** — Enhanced dialog with format selection (PNG/SVG), quality presets (standard/high), and download button
3. **`src/services/exportService.ts`** — New/extended service with `exportAsCodexCard()`, `generateCodexCardSVG()`, `generateCodexCardPNG()` functions
4. **`src/__tests__/exportService.test.ts`** — ≥8 test cases for export service functions
5. **`src/__tests__/exportDialog.test.tsx`** — ≥6 test cases for export dialog UI and interactions
6. **`src/__tests__/codexCardExport.test.tsx`** — New test file with ≥6 test cases for poster element presence and data accuracy

## Acceptance Criteria

### AC-EXPORT-001
Export dialog opens from machine editor and allows format selection (PNG/SVG) and quality preset (Standard/High).

### AC-EXPORT-002
Generated CodexCard poster contains all required visual elements:
- Machine title text
- Machine visualization (SVG representation of the machine)
- Attribute panel (stability, power, energy, failure rate)
- Decorative border with faction theming
- Faction seal/badge
- Machine ID/serial number

### AC-EXPORT-003
Exported PNG file is downloadable, non-empty, and contains the expected machine data when verified via SVG text extraction.

### AC-EXPORT-004
SVG export produces valid, parseable SVG with all required text elements present.

### AC-EXPORT-005
Export completes within 5 seconds for machines with up to 30 modules.

### AC-EXPORT-006
Build size remains under 545KB threshold after all additions.

### AC-EXPORT-007
All 3287+ existing tests continue to pass (no regressions).

## Test Methods

### TM-EXPORT-001: Dialog Open and Format Selection
1. Mount ExportDialog with mock machine data
2. Verify dialog renders with format selector (PNG/SVG radio buttons)
3. Verify quality preset selector renders (Standard/High options)
4. Click each format option, verify selection state changes
5. Click each quality preset, verify selection state changes
6. Click cancel, verify dialog closes without side effects

### TM-EXPORT-002: Poster Element Presence (SVG Parsing)
**Primary verification method:**
1. Call `generateCodexCardSVG(machineData)` from exportService
2. Parse returned SVG string as XML/DOM
3. Verify presence of each required element via text content extraction:
   - Machine title: `<text>` element containing machine name
   - Machine visualization: `<g>` or `<svg>` group containing module shapes
   - Attribute panel: `<text>` elements for stability, power, energy, failure
   - Decorative border: `<rect>` or `<path>` with stroke styling
   - Faction seal: `<g>` group with faction identifier/class
   - Machine ID: `<text>` element matching format "XXXXXXXX" (8 hex chars)
4. Assert all 6 element categories are present and non-empty

### TM-EXPORT-003: PNG Export Verification (SVG Intermediate)
1. Call `generateCodexCardPNG(machineData, quality)`
2. Verify returned Blob is non-empty (>1KB)
3. Export to SVG first, then convert to PNG programmatically
4. Verify downloaded file has correct MIME type and dimensions

### TM-EXPORT-004: SVG Export Validation
1. Call `exportAsCodexCard(machineData, 'svg')`
2. Parse returned SVG string
3. Use DOMParser to verify valid XML structure
4. Verify `<svg>` root element has width/height/viewBox attributes
5. Verify no parsing errors in console

### TM-EXPORT-005: Export Performance
1. Create mock machine with 30 modules
2. Time `exportAsCodexCard()` calls for both PNG and SVG
3. Assert PNG export < 5000ms
4. Assert SVG export < 2000ms

### TM-EXPORT-006: Build Size Verification
1. Run `npm run build`
2. Check `dist/assets/index-*.js` size
3. Assert size < 545KB
4. If size approaches threshold (540KB+), trim decorative SVG complexity

### TM-EXPORT-007: Regression Prevention
1. Run `npx vitest run`
2. Assert all tests pass
3. Assert total test count ≥ 3307 (3287 existing + ≥20 new)

## Risks

### R1: Build Size Threshold
**Risk:** Current build is 536.29KB with only 8.71KB headroom. New code may exceed 545KB.
**Mitigation:** Enforce strict per-file budgets:
| Asset | Max Budget |
|-------|------------|
| `CodexCardExport.tsx` | ≤ 12 KB |
| `exportService.ts` additions | ≤ 8 KB |
| New test files | ≤ 15 KB |
| `ExportDialog.tsx` additions | ≤ 5 KB |
| **Total new code budget** | **≤ 40 KB** |
If any asset exceeds budget, trim decorative SVG complexity first. Check build at **start** of implementation.

### R2: Canvas-to-Image Export Complexity
**Risk:** Canvas rendering for export may have cross-browser inconsistencies.
**Mitigation:** Use SVG as primary export format; PNG generation via SVG-to-canvas-to-blob pipeline with fallback. Test in Chromium and WebKit environments.

### R3: Test Environment for Canvas/SVG
**Risk:** Testing canvas exports requires mock environments.
**Mitigation:** Focus on SVG export testing (parseable text). Mock canvas methods for PNG tests. Use jsdom for SVG DOM parsing.

## Failure Conditions

The sprint fails if any of the following occur:

1. **Build exceeds 545KB** — Code must be trimmed or feature deferred
2. **Any existing test fails** — Regressions are not acceptable
3. **Export dialog does not open** — AC-EXPORT-001 not met
4. **Poster missing required elements** — AC-EXPORT-002 not met (must have title, visualization, attributes, border, faction seal, machine ID)
5. **Export timeout** — AC-EXPORT-005 not met (>5s for 30 modules)
6. **SVG parse errors** — AC-EXPORT-004 not met (invalid SVG output)
7. **Fewer than 20 new tests added** — Test count commitment not met

## Done Definition

All conditions below must be true before claiming round complete:

1. ✅ `CodexCardExport.tsx` exists and renders poster with all 6 required elements
2. ✅ `ExportDialog.tsx` updated with format and quality selectors
3. ✅ `exportService.ts` exports `generateCodexCardSVG()` and `generateCodexCardPNG()`
4. ✅ `exportService.test.ts` contains ≥8 passing tests
5. ✅ `exportDialog.test.tsx` contains ≥6 passing tests
6. ✅ `codexCardExport.test.tsx` (new) contains ≥6 passing tests
7. ✅ Total new test cases ≥ 20
8. ✅ Total tests ≥ 3307 (3287 + 20)
9. ✅ Build size < 545KB
10. ✅ All 3307+ tests pass
11. ✅ No TypeScript errors

## Out of Scope

The following are explicitly NOT being done in this sprint:

1. **Animated poster exports** — Static image only; no GIF or video export
2. **Custom poster templates** — User cannot customize poster layout
3. **Social media direct sharing** — No OAuth or API integration for posting
4. **Poster gallery/listing** — Posters don't persist on server; just download
5. **Multi-machine comparison poster** — Single machine per poster
6. **Watermark customization** — No user watermark support
7. **Background customization** — Fixed background pattern
8. **Font customization** — Uses preset decorative fonts only
