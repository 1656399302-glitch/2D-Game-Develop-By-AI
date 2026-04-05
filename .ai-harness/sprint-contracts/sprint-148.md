# Sprint Contract — Round 148

## Scope

Remediation sprint to fix two blocking issues from Round 147 QA evaluation:

1. **Bundle size regression (AC-146-008)**: `dist/assets/index-C2nbV4GZ.js` is 525,576 bytes (513.25 KB), exceeding 512KB (524,288 bytes) limit by 1,288 bytes. Round 147 CSS optimization reduced from 517.4KB to 516KB but fell short by 1,288 bytes.

2. **LayersPanel border-radius inconsistency (AC-146-004)**: `ModulePanel.tsx` (line 198) and `PropertiesPanel.tsx` (line 7) both define `const PANEL_BORDER_RADIUS = '12px'`. `LayersPanel.tsx` (line 416) has no such constant and its root element uses no explicit border-radius (`className="w-64 h-full bg-[#121826] border-l border-[#1e2a42] flex flex-col"`).

## Spec Traceability

- **P0 items covered this round:**
  - AC-146-004: LayersPanel border-radius consistency with ModulePanel.tsx and PropertiesPanel.tsx
  - AC-146-008: Bundle size ≤512KB (524,288 bytes) constraint

- **P1 items covered this round:**
  - None — this is a remediation-only sprint

- **Remaining P0/P1 after this round:**
  - None — all Round 147 P0/P1 items addressed

- **P2 intentionally deferred:**
  - All P2 items remain deferred

## Deliverables

1. **Fixed LayersPanel.tsx** — Add `const PANEL_BORDER_RADIUS = '12px'` constant matching `ModulePanel.tsx` line 198 and `PropertiesPanel.tsx` line 7, applied to root element via `style={{ borderRadius: PANEL_BORDER_RADIUS }}` or equivalent inline style
2. **Reduced bundle size** — `dist/assets/index-*.js` ≤ 524,288 bytes (512KB)
3. **Passing build** — `npm run build` completes successfully with size verification

## Acceptance Criteria

1. **AC-148-001**: `grep -n "PANEL_BORDER_RADIUS.*=.*'12px'" src/components/Canvas/LayersPanel.tsx` outputs a line number ≥ 1
2. **AC-148-002**: `grep -n "PANEL_BORDER_RADIUS" src/components/Canvas/LayersPanel.tsx` shows at least 2 occurrences (constant definition + usage on root element)
3. **AC-148-003**: `npm run build 2>&1 | grep -E "dist/assets/index-[a-zA-Z0-9]+\.js"` outputs a file size ≤ 524,288 bytes
4. **AC-148-004**: `npx tsc --noEmit` exits with code 0 (no TypeScript errors)
5. **AC-148-005**: `npm test -- --run 2>&1 | grep -E "Tests:[ ]*[0-9]+"` outputs a test count ≥ 6078
6. **AC-148-006**: Browser smoke test verifies LayersPanel renders without console errors, and the root element has computed `border-radius` of approximately `12px`

## Test Methods

1. **AC-148-001 (Border-Radius Constant Definition):**
   ```
   grep -n "PANEL_BORDER_RADIUS.*=.*'12px'" src/components/Canvas/LayersPanel.tsx
   ```
   - **Expected**: Output shows constant definition (e.g., `const PANEL_BORDER_RADIUS = '12px';`) at line number ≥ 1
   - **Negative**: If no output, the constant is missing

2. **AC-148-002 (Border-Radius Constant Usage):**
   ```
   grep -n "PANEL_BORDER_RADIUS" src/components/Canvas/LayersPanel.tsx
   ```
   - **Expected**: At least 2 occurrences (constant definition + applied to root element's style attribute)
   - **Negative**: Only 1 occurrence means constant defined but not used on root element

3. **AC-148-003 (Bundle Size Verification):**
   ```
   npm run build 2>&1 | grep -E "dist/assets/index-[a-zA-Z0-9]+\.js"
   ```
   - **Expected**: Output shows file size ≤ 524,288 bytes (e.g., "525 KiB" or smaller)
   - **Negative**: Size > 524,288 bytes means still over 512KB limit (currently 525,576 bytes, need ≥1,288 bytes reduction)
   - **Note**: Build must exit with code 0. If build fails, round fails regardless of size.

4. **AC-148-004 (TypeScript Compilation):**
   ```
   npx tsc --noEmit
   echo $?
   ```
   - **Expected**: Exit code 0, no stderr output
   - **Negative**: Exit code > 0 or any error output indicates type errors

5. **AC-148-005 (Test Suite Integrity):**
   ```
   npm test -- --run 2>&1 | grep -E "Tests:[ ]*[0-9]+"
   ```
   - **Expected**: Output shows ≥ 6078 tests passing (maintaining Round 147 baseline)
   - **Negative**: Test count < 6078 indicates regression or test files removed

6. **AC-148-006 (Browser Verification — LayersPanel):**
   - **Entry**: Start dev server (`npm run dev`), open browser DevTools
   - **Action**: Navigate to app, ensure LayersPanel is visible (may require toggling circuit mode or editor view)
   - **Verification**: 
     1. Inspect LayersPanel root element in Elements panel
     2. Check computed styles for `border-radius` property
     3. Verify `border-radius` equals `12px`
   - **Final usable state**: Panel renders, all child elements visible, no layout breaks
   - **Console check**: No Error-level console messages
   - **Negative**: Missing border-radius, console errors, or layout issues indicate failure

## Risks

1. **Bundle size reduction may require code changes beyond CSS extraction** — Round 147 CSS optimization reduced from 517.4KB to 516KB but still 1,288 bytes over limit. Further reduction may require:
   - Additional code-splitting for non-critical features
   - Lazy-loading more panels
   - Optimizing SVG paths or removing unused code
   - Tree-shaking verification for dependencies

2. **Border-radius fix must not break layout** — Adding `border-radius: 12px` to LayersPanel root must not cause:
   - Overflow or clipping of child elements
   - Alignment issues with adjacent panels
   - Visual gaps in panel borders

3. **Test count floor maintained** — Test suite must maintain ≥ 6078 tests. Any test failures must be fixed, not skipped or deleted.

4. **Build integrity** — Any changes must not break the production build (`npm run build`). If build produces warnings or errors, they must be resolved.

## Failure Conditions

The following conditions mean the round **MUST FAIL**:

1. **AC-148-001 fails**: `grep` does not find `PANEL_BORDER_RADIUS = '12px'` in `src/components/Canvas/LayersPanel.tsx`
2. **AC-148-002 fails**: `grep` finds fewer than 2 occurrences of `PANEL_BORDER_RADIUS` in `src/components/Canvas/LayersPanel.tsx`
3. **AC-148-003 fails**: Build output shows `dist/assets/index-*.js` > 524,288 bytes, OR `npm run build` exits with non-zero code
4. **AC-148-004 fails**: `npx tsc --noEmit` exits with non-zero code or produces any TypeScript errors
5. **AC-148-005 fails**: Test suite outputs < 6078 tests, OR any test file failures exist
6. **AC-148-006 fails**: Browser verification shows any of:
   - Console errors (Error-level)
   - LayersPanel root element missing `border-radius: 12px`
   - Layout breaks or missing content in LayersPanel
7. **Build produces errors**: `npm run build` exits with non-zero code for any reason

## Done Definition

**Exact conditions that must be true before the builder may claim the round complete:**

All six acceptance criteria (AC-148-001 through AC-148-006) must pass:
- [ ] **AC-148-001**: `grep -n "PANEL_BORDER_RADIUS.*=.*'12px'" src/components/Canvas/LayersPanel.tsx` outputs ≥ 1 line
- [ ] **AC-148-002**: `grep -n "PANEL_BORDER_RADIUS" src/components/Canvas/LayersPanel.tsx` outputs ≥ 2 occurrences (constant definition + usage)
- [ ] **AC-148-003**: `npm run build` output shows `dist/assets/index-*.js` ≤ 524,288 bytes AND build exits with code 0
- [ ] **AC-148-004**: `npx tsc --noEmit` exits with code 0
- [ ] **AC-148-005**: `npm test -- --run` outputs ≥ 6078 tests passing with no failures
- [ ] **AC-148-006**: Browser verification confirms:
  - LayersPanel root element has `border-radius: 12px`
  - No console errors
  - Panel renders correctly with all content visible

## Out of Scope

- New feature development
- P2 item implementation
- Visual enhancements beyond the border-radius fix and bundle size reduction
- Test coverage expansion (maintain 6078 tests, do not add new tests this round)
- CSS animation changes
- Changes to circuit functionality (store operations, node rendering, wire connections)
- Changes to other panels (ModulePanel, PropertiesPanel already have correct border-radius per QA evidence)
- Any changes not required to fix AC-146-004 or AC-146-008 from Round 147
