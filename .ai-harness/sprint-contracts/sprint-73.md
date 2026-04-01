# Sprint Contract — Round 73

## Scope

**Goal:** Enhance the poster/export system with social media optimized presets, custom watermark support, and improved visual decorations. This sprint adds share-ready poster formats optimized for common social platforms (Twitter/X, Discord, Instagram) while maintaining backward compatibility with existing export formats.

---

## Spec Traceability

### P0 items covered this round
| Spec Requirement | Contract AC | Verification |
|-------------------|-------------|--------------|
| Social media poster presets | AC1, AC2, AC3, AC3b | E2E tests + unit tests |
| Watermark/username support | AC4, AC5 | E2E tests + unit tests |
| Platform-specific aspect ratios | AC2, AC3, AC3b | E2E dimension verification |

### P1 items covered this round
| Spec Requirement | Contract AC | Verification |
|-------------------|-------------|--------------|
| Enhanced decorative borders | AC6 | Unit tests |
| Platform preview thumbnails | AC1 | Visual inspection + E2E |

### P0/P1 — Prior Rounds (all complete per Round 72)
- Activation state machine: 17/17 tests passing
- E2E regression gate: 106/106 tests passing
- Build: 499.93 KB < 550KB threshold

### P2 intentionally deferred
- AI naming/description generation (requires API integration)
- Community sharing infrastructure (localStorage persistence)
- Animated GIF export (requires additional library)

---

## Operator Inbox Instructions (must_fix)

Per operator inbox item `operator-item-1774941228843` (processed in Round 51, injected into build phase):

> **"对所有功能模型进行测试,尤其是模块与模块间的交互,UI的交互,必须用最严格的测试标准,并将测出来的Bug修复"**
>
> Translation: Test all functional models, especially interactions between modules and UI interactions. Must use the strictest testing standards and fix any bugs found.

This instruction applies to Round 73. The export modal workflow and preset selection system must be tested with:
- Module-to-module interaction verification (preset selection does not corrupt other export formats)
- UI interaction verification (modal open/close, input fields, toggles, buttons)
- Edge case coverage with strict negative assertions
- All bugs discovered must be fixed before declaring the sprint complete

---

## Deliverables

1. **Social Media Presets** (`src/types/index.ts`, `src/components/Export/ExportModal.tsx`)
   - Twitter/X preset: 16:9 aspect ratio, 1200×675px output
   - Discord preset: 3:2 aspect ratio, 600×400px output with embed-friendly styling
   - Instagram preset: 1:1 square 1080×1080px
   - Each preset applies correct dimensions, padding, and decorative elements

2. **Watermark System** (`src/components/Export/ExportModal.tsx`, `src/utils/exportUtils.ts`)
   - Optional username/author text field
   - Positioned in bottom-right corner with subtle styling
   - Toggle on/off per export

3. **Enhanced Poster Decoration** (`src/utils/exportUtils.ts`)
   - Animated corner flourishes using SVG stroke-dasharray animation
   - Faction-colored accent lines
   - Ornate dividers between sections

4. **Platform Preview UI** (`src/components/Export/ExportModal.tsx`)
   - Visual preview cards showing each social platform format
   - Dimensions displayed per platform
   - Current platform highlighted

5. **Test Suite** (`src/__tests__/exportPosterPresets.test.ts`, `tests/e2e/export-poster-presets.spec.ts`)
   - Unit tests for platform preset configurations
   - E2E tests for preset selection and export workflow

---

## Acceptance Criteria

**AC1:** Export modal displays 8 format options: SVG, PNG, Poster, Enhanced Poster, Faction Card, Twitter/X, Discord, and Instagram (5 existing + 3 new social presets).

**AC2:** Clicking "Twitter/X" preset sets aspect ratio to 16:9 and displays "1200×675px" in dimension indicator.

**AC3:** Clicking "Instagram" preset sets aspect ratio to square and displays "1080×1080px" in dimension indicator.

**AC3b:** Clicking "Discord" preset sets aspect ratio to 3:2 and displays "600×400px" in dimension indicator.

**AC4:** Export modal includes a "Username" text input field with toggle to enable/disable watermark.

**AC5:** When username is entered and enabled, exported poster includes the username in bottom-right corner with subtle styling.

**AC6:** Exported posters include ornate corner decorations with animated SVG flourishes (visible in SVG exports).

**AC7:** `npx vitest run src/__tests__/exportPosterPresets.test.ts --reporter=verbose` passes with all platform preset tests.

**AC8:** `npx playwright test tests/e2e/export-poster-presets.spec.ts --reporter=list` passes: user can select social presets, enter username, and export successfully.

**AC9:** `npm run build` completes with exit code 0 and bundle ≤ 560KB (increased from 550KB to accommodate new UI components).

**AC10:** All 106 existing E2E tests continue to pass (regression gate).

---

## Test Methods

### TM1: Social Presets UI (AC1)
```
Command: Manual inspection of ExportModal.tsx
Verification:
1. Verify 8 format button components exist (SVG, PNG, Poster, Enhanced, Faction, Twitter, Discord, Instagram)
2. Verify each button has distinct aria-label
3. Verify preview component handles all 8 formats

Negative assertions:
- No duplicate format options
- No format options missing from existing 5 + new 3
- Modal should not crash when rapidly clicking through all 8 presets
```

### TM2: Twitter Preset Behavior (AC2)
```
Command: npx playwright test tests/e2e/export-poster-presets.spec.ts --grep="Twitter" --reporter=list
Expected: 2 tests pass (select Twitter preset, verify dimensions)

Test pattern:
- Open export modal (ENTRY)
- Click Twitter/X format button
- Assert dimension indicator shows "1200 × 675 px"
- Export SVG and verify dimensions in output
- Click away and reopen modal (REOPEN/RETRY)
- Assert Twitter/X preset is still selected

Negative assertions:
- Switching to other presets should NOT affect Twitter dimension
- Export should NOT produce dimensions other than 1200×675px for Twitter
- No console errors during preset selection
```

### TM3: Instagram Preset Behavior (AC3)
```
Command: npx playwright test tests/e2e/export-poster-presets.spec.ts --grep="Instagram" --reporter=list
Expected: 2 tests pass (select Instagram preset, verify dimensions)

Test pattern:
- Open export modal (ENTRY)
- Click Instagram format button
- Assert dimension indicator shows "1080 × 1080 px"
- Export SVG and verify dimensions in output
- Switch to another preset then back to Instagram (RETRY)
- Assert dimension indicator shows "1080 × 1080 px"

Negative assertions:
- Switching to other presets should NOT corrupt Instagram settings
- Export should NOT produce non-square dimensions for Instagram
- No dimension artifacts should remain after switching away
```

### TM3b: Discord Preset Behavior (AC3b)
```
Command: npx playwright test tests/e2e/export-poster-presets.spec.ts --grep="Discord" --reporter=list
Expected: 2 tests pass (select Discord preset, verify dimensions)

Test pattern:
- Open export modal (ENTRY)
- Click Discord format button
- Assert dimension indicator shows "600 × 400 px"
- Export SVG and verify dimensions in output
- Complete export and dismiss modal (COMPLETION/DISMISSAL)
- Reopen modal and verify Discord preset is NOT auto-selected (default to previous/Poster)

Negative assertions:
- Discord preset should NOT produce 1200×675px or 1080×1080px
- Modal should NOT crash during Discord preset export
- State should NOT leak between modal sessions
```

### TM4: Watermark Input UI (AC4)
```
Command: npx playwright test tests/e2e/export-poster-presets.spec.ts --grep="watermark" --reporter=list
Expected: 3 tests pass (input field exists, toggle exists, persistence)

Test pattern:
- Open export modal with poster format selected (ENTRY)
- Assert username input field exists with placeholder "Author (optional)"
- Assert toggle/switch to enable/disable watermark
- Enter "TestUser" in username field
- Switch format and back to poster (RETRY)
- Assert username field still shows "TestUser" (state persistence)
- Toggle watermark OFF (STATE TOGGLE)
- Assert toggle state is reflected visually

Negative assertions:
- Username field should NOT persist to non-poster formats without watermark support
- Empty username should NOT render as empty text element in export
- Toggle state should NOT reset when switching between supported formats
```

### TM5: Watermark in Export (AC5)
```
Command: npx vitest run src/__tests__/exportPosterPresets.test.ts --grep="watermark" --reporter=verbose
Expected: All watermark tests pass

Test pattern:
- Call exportEnhancedPoster with username="ArcaneMaster"
- Assert output SVG contains text element with "ArcaneMaster"
- Assert text is positioned in bottom-right quadrant
- Assert text has subtle styling (smaller font, muted color)

Negative assertions:
- When username is empty, no username text element in output
- When watermark disabled, no username text element in output
- Username should NOT appear in top-left or other corners
- SVG should remain valid (no broken markup) with watermark enabled
```

### TM6: Decorative Corners (AC6)
```
Command: npx vitest run src/__tests__/exportPosterPresets.test.ts --grep="decoration" --reporter=verbose
Expected: All decoration tests pass

Test pattern:
- Call exportEnhancedPoster()
- Assert output SVG contains corner path elements (4 corners)
- Assert each corner has stroke-dasharray animation
- Verify path stroke color matches faction or default gold

Negative assertions:
- Poster format (non-enhanced) should NOT include ornate decorations
- Only enhanced and social presets include animated corners
- Corners should NOT appear in SVG, PNG exports when using basic Poster format
```

### TM7: Unit Tests (AC7)
```
Command: npx vitest run src/__tests__/exportPosterPresets.test.ts --reporter=verbose
Expected: All tests pass

Coverage must include:
- Platform preset configurations (Twitter, Instagram, Discord)
- Dimension calculations for each platform
- Watermark integration
- Decorative element generation
- Backward compatibility with existing poster format
- Negative cases: empty username, disabled watermark, non-enhanced formats

All tests must use strict assertion standards per operator inbox instruction.
```

### TM8: E2E Tests (AC8)
```
Command: npx playwright test tests/e2e/export-poster-presets.spec.ts --reporter=list
Expected: All tests pass

Test coverage must include:
1. Social preset selection flow (Twitter, Instagram, Discord)
2. Username input and toggle
3. Export with watermark
4. Export without watermark
5. Preset persistence when switching formats
6. Dimension indicator updates correctly
7. Modal open/close workflow (ENTRY, COMPLETION)
8. Modal reopen behavior (REOPEN)
9. Edge case: rapid preset switching (module interaction)
10. Edge case: empty username export

Negative assertions required for all test paths.
```

### TM9: Build Verification (AC9)
```
Command: npm run build
Expected: Exit code 0, bundle ≤ 560KB

Verification:
- grep bundle size from vite output
- assert: bundle_kb <= 560

Negative assertions:
- Build should NOT exceed 560KB
- Build should NOT produce TypeScript errors
```

### TM10: Regression Gate (AC10)
```
Command: npx playwright test tests/e2e/ --reporter=list
Expected: 106/106 tests pass

Existing test files:
- activation-interaction.spec.ts: 12 tests
- keyboard-activation.spec.ts: 22 tests
- challenge-panel.spec.ts: 9 tests
- codex.spec.ts: 12 tests
- export.spec.ts: 16 tests
- machine-creation.spec.ts: 12 tests
- random-forge.spec.ts: 10 tests
- recipe-browser.spec.ts: 13 tests

Negative assertions:
- No test file should have fewer passing tests than documented
- No new console errors should appear during test execution
```

---

## Failure Conditions

The sprint **MUST FAIL** if any of these occur:

1. **Social presets missing** — Export modal does not have Twitter/X, Discord, and Instagram format options → AC1 fails
2. **Dimension mismatch** — Twitter preset outputs dimensions other than 1200×675px → AC2 fails
3. **Square dimension wrong** — Instagram preset outputs dimensions other than 1080×1080px → AC3 fails
4. **Discord dimension wrong** — Discord preset outputs dimensions other than 600×400px → AC3b fails
5. **Watermark UI missing** — Username input or toggle not present → AC4 fails
6. **Watermark not in export** — Exported poster with username does not contain username text → AC5 fails
7. **Decorations missing** — Enhanced poster lacks corner flourishes → AC6 fails
8. **Unit tests fail** — `exportPosterPresets.test.ts` has any failing tests → AC7 fails
9. **E2E tests fail** — `export-poster-presets.spec.ts` has any failing tests → AC8 fails
10. **Build exceeds budget** — Bundle > 560KB → AC9 fails
11. **Regression introduced** — Existing E2E tests drop below 106/106 → AC10 fails
12. **Bugs found not fixed** — Testing reveals bugs per operator inbox instruction that are not resolved before completion → Sprint incomplete

---

## Done Definition

The sprint is **complete** only when ALL of the following are true:

| # | Condition | Verification | Operator Inbox Alignment |
|---|-----------|--------------|--------------------------|
| 1 | Export modal has 8 format options | Visual/code inspection | UI interaction tested |
| 2 | Twitter/X preset: 1200×675px | `tests/e2e/export-poster-presets.spec.ts` passes | Module interaction verified |
| 3 | Instagram preset: 1080×1080px | `tests/e2e/export-poster-presets.spec.ts` passes | Module interaction verified |
| 3b | Discord preset: 600×400px | `tests/e2e/export-poster-presets.spec.ts` passes | Module interaction verified |
| 4 | Username input field exists with toggle | E2E test verification | UI interaction tested |
| 5 | Watermark appears in exported poster | Unit test verification | Functional model tested |
| 6 | Corner decorations present in enhanced poster | Unit test verification | Functional model tested |
| 7 | `npx vitest run src/__tests__/exportPosterPresets.test.ts` → all pass | Test runner output | Strict test standards applied |
| 8 | `npx playwright test tests/e2e/export-poster-presets.spec.ts` → all pass | Test runner output | Negative assertions included |
| 9 | `npm run build` → exit code 0, bundle ≤ 560KB | Build output | Build within budget |
| 10 | `npx playwright test tests/e2e/ --reporter=list` → 106/106 | Test runner output | Regression gate maintained |
| 11 | All bugs found during testing are fixed | Bug-free test run | Operator inbox requirement |

---

## Out of Scope

The following are **NOT** in scope for this round:

| Category | Items Excluded |
|----------|----------------|
| **New export formats** | GIF export, PDF export, animated WebP |
| **Backend integration** | Actual social media API posting |
| **Cloud storage** | Save to cloud, import from cloud |
| **Template customization** | Custom background images, custom color themes |
| **Advanced watermarks** | Logo upload, positioning controls |
| **Mobile-specific UI** | Touch-optimized export modal |
| **Batch export** | Export multiple machines at once |
| **Preset saving** | Save custom export presets |

---

## Implementation Notes

### Platform Dimensions Reference
| Platform | Aspect Ratio | Dimensions | Use Case |
|----------|-------------|------------|----------|
| Twitter/X | 16:9 | 1200×675px | Feed posts |
| Instagram | 1:1 | 1080×1080px | Square posts |
| Discord | 3:2 | 600×400px | Embed thumbnails |

### Watermark Styling
- Font: Same as machine name but smaller (60% size)
- Color: White with 60% opacity
- Position: 20px from right edge, 20px from bottom
- Background: Subtle dark gradient for readability

### Decorative Corner SVG
```svg
<!-- Animated corner flourish -->
<path d="M0,30 L0,5 L30,5" fill="none" stroke="#ffd700" stroke-width="2" stroke-dasharray="60" stroke-dashoffset="60">
  <animate attributeName="stroke-dashoffset" from="60" to="0" dur="1s" fill="freeze"/>
</path>
```

### Bundle Size Budget
- Current: 499.93 KB
- New UI components: ~10 KB (preset buttons, preview cards, watermark toggle)
- New export utilities: ~8 KB (platform configurations, decorative generators)
- New test files: ~12 KB
- **Estimated total: ~530 KB**
- **Threshold: 560 KB** (leaving ~30 KB headroom)

---

## Testing Standards Compliance

This contract adheres to the operator inbox instruction requiring strictest testing standards:

1. **Module-to-module interaction**: Verified through preset selection flow tests, ensuring switching between 8 formats does not corrupt state
2. **UI interaction**: Verified through E2E tests covering entry, completion, dismissal, reopen, and retry patterns
3. **Negative assertions**: All test methods include explicit negative assertions ("should not remain", "should not crash", "should not produce")
4. **Edge cases**: Tests cover rapid interaction, empty states, disabled toggles, and state persistence
5. **Bug fix requirement**: Any bugs discovered during testing must be resolved before declaring sprint complete
