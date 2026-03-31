# Sprint Contract — Round 47

> **Contract Review Status:** APPROVED

## Scope

This sprint addresses **three critical gaps** identified in the codebase:
1. **Faction variant modules render as gray boxes** — only 14/18 module types have proper SVG rendering
2. **Performance debt** — cascading saves and O(n) hit testing on the canvas
3. **Missing Recipe Discovery UI** — recipe system exists but no dedicated browser

This is a **defect remediation + polish sprint** focused on closing visual and performance gaps before advancing to P2 features.

---

## Spec Traceability

### P0 items covered this round

| Spec Requirement | Current State | This Round Delivers |
|-------------------|---------------|---------------------|
| 18 module types with SVG rendering | 14/18 rendered; 4 faction variants show as gray boxes | Complete SVG rendering for all 4 faction variants |
| Faction variants accessible as rewards | Variants defined in data but not displayed | Variants wired to module panel and recipe system |

### P1 items covered this round

| Spec Requirement | Current State | This Round Delivers |
|-------------------|---------------|---------------------|
| Performance under load | O(n) hit testing; no debouncing on saves | Spatial indexing (quadtree) + debounced batch saves |
| Recipe unlock system UI | Recipe data exists in store; no browser panel | RecipeBrowser panel accessible from toolbar |

### Remaining P0/P1 after this round (post-Round 47)

| Item | Target State |
|------|--------------|
| All 18 module types fully rendered | All faction variants render correctly |
| Recipe system with UI | Recipe browser functional with 18 recipes |
| Performance baseline | Hit testing improved; saves debounced |

### P2 items intentionally deferred

| Item | Reason for Deferral |
|------|---------------------|
| Web Worker for statistics | Performance acceptable at current scale |
| Faction reputation auto-award integration | Requires deeper faction system integration |
| Additional faction achievements | Not blocking current workflow |
| Community gallery enhancements | Existing functionality sufficient |

---

## Deliverables

### 1. Faction Variant Module Rendering

**Files to create/modify:**
- `src/components/Modules/FactionVariants.tsx` — **CREATE or EXTEND**
  - Render method for `void-arcane-gear` with void faction colors (purple/indigo/arcane patterns)
  - Render method for `inferno-blazing-core` with inferno faction colors (red/orange/flame motifs)
  - Render method for `storm-thundering-pipe` with storm faction colors (cyan/blue/lightning patterns)
  - Render method for `stellar-harmonic-crystal` with stellar faction colors (gold/white/star patterns)
  - Each method returns complete SVG with faction-specific glow effects matching base module types

- `src/components/Editor/ModuleRenderer.tsx` — **MODIFY**
  - Add case statements for 4 faction variant module type IDs
  - Route to corresponding render methods in FactionVariants.tsx

- `src/components/Modules/ModulePreview.tsx` — **MODIFY**
  - Add preview rendering for 4 faction variants
  - Display in module selection panel with faction-colored previews

### 2. Performance: Batch Store Saves

**File to modify:**
- `src/store/useMachineStore.ts` — **MODIFY**
  - Add debounced save mechanism (500ms debounce)
  - Batch rapid updates into single save operations
  - Maintain compatibility with existing 1708 tests
  - Expose `forceSave()` method for explicit saves

### 3. Performance: Spatial Indexing

**File to create:**
- `src/utils/spatialIndex.ts` — **CREATE**
  - Quadtree implementation for O(log n) hit testing
  - Methods: `insert(module)`, `remove(moduleId)`, `queryPoint(x, y)`, `queryRect(x1, y1, x2, y2)`
  - Fallback to O(n) for edge cases (nested modules, overlapping areas)

**File to modify:**
- `src/components/Editor/Canvas.tsx` — **MODIFY**
  - Integrate spatial index for `getModuleAtPoint(x, y)`
  - Update index on module add/move/delete operations

### 4. Recipe Discovery UI Integration

**File to modify:**
- `src/components/Editor/Toolbar.tsx` — **MODIFY**
  - Add "配方" (Recipes) button with `aria-label="配方"` to open recipe browser

**File to create/modify:**
- `src/components/Recipes/RecipeBrowser.tsx` — **MODIFY or CREATE**
  - Display all 18 module recipes (14 base + 4 faction variants)
  - Show locked/unlocked state for each recipe
  - Faction variant recipes locked until Grandmaster reputation achieved

---

## Acceptance Criteria

All acceptance criteria must be **binary-verifiable** (pass/fail, no subjective assessment).

### AC1: Faction variant rendering (4 criteria)

| # | Criterion | Verification |
|---|-----------|--------------|
| AC1.1 | `void-arcane-gear` renders with purple/indigo void faction colors and arcane patterns | Browser: drag variant to canvas; verify not gray box |
| AC1.2 | `inferno-blazing-core` renders with red/orange inferno faction colors and flame motifs | Browser: drag variant to canvas; verify not gray box |
| AC1.3 | `storm-thundering-pipe` renders with cyan/blue storm faction colors and lightning patterns | Browser: drag variant to canvas; verify not gray box |
| AC1.4 | `stellar-harmonic-crystal` renders with gold/white stellar faction colors and star patterns | Browser: drag variant to canvas; verify not gray box |

### AC2: Performance improvements (3 criteria)

| # | Criterion | Verification |
|---|-----------|--------------|
| AC2.1 | Rapid module movements (10+ in 1 second) result in single debounced save | Browser: drag 10 modules rapidly; check Network tab for save count |
| AC2.2 | Canvas hit testing for 50+ module machine completes in < 16ms | Performance timing: `performance.now()` around `getModuleAtPoint` |
| AC2.3 | All 1708 existing tests pass with no regressions | Terminal: `npm test -- --run` shows 1708+ passing |

### AC3: Recipe browser integration (3 criteria)

| # | Criterion | Verification |
|---|-----------|--------------|
| AC3.1 | "配方" button visible in main toolbar | Browser: verify button with `aria-label="配方"` exists |
| AC3.2 | Clicking button opens RecipeBrowser panel | Browser: click button; verify panel renders |
| AC3.3 | Panel displays 18 recipes with correct lock states | Browser: count recipe items; verify 4 faction variants show locks |

### AC4: Build verification (2 criteria)

| # | Criterion | Verification |
|---|-----------|--------------|
| AC4.1 | `npm run build` completes with 0 TypeScript errors | Terminal: build output shows 0 errors |
| AC4.2 | No new console warnings in production bundle | Terminal: build output clean |

---

## Test Methods

### TM1: Faction variant rendering verification

```typescript
// Browser console or Playwright test
// 1. Open application
// 2. Open Module Panel
// 3. Scroll to faction variant section (if sectioned) or locate variants
// 4. For each variant (void-arcane-gear, inferno-blazing-core, storm-thundering-pipe, stellar-harmonic-crystal):
//    - Drag variant onto canvas
//    - Verify SVG renders (not default gray rectangle)
//    - Verify faction colors match expected palette
```

**Expected result:** 4 faction variants render with distinct faction colors and patterns.

### TM2: Debounced save verification

```bash
# Terminal test
npm test -- --run
# Expected: 74 test files, 1708+ tests pass
```

```typescript
// Browser: Network tab monitoring
// 1. Open application with network monitoring
// 2. Rapidly move 15 modules (drag-drop 15 times within 1 second)
// 3. Count save requests in Network tab
// Expected: 1-2 save requests (debounced) instead of 15
```

### TM3: Hit testing performance

```typescript
// Performance measurement
// 1. Generate machine with 50+ modules
// 2. Measure time for 100 getModuleAtPoint calls
// 3. Verify average < 16ms per call
const start = performance.now();
for (let i = 0; i < 100; i++) {
  canvas.getModuleAtPoint(Math.random() * 800, Math.random() * 600);
}
const avg = (performance.now() - start) / 100;
console.assert(avg < 16, `Hit test too slow: ${avg}ms`);
```

### TM4: Recipe browser verification

```typescript
// Browser test
// 1. Locate "配方" button in toolbar
// 2. Click button
// 3. Verify RecipeBrowser panel opens
// 4. Count recipe items in panel
// 5. Verify 18 recipes listed
// 6. Verify 4 faction variant recipes have lock icons
```

---

## Risks

| # | Risk | Likelihood | Mitigation | Fallback |
|---|------|------------|------------|----------|
| R1 | Quadtree implementation has edge cases | Medium | Start with bounding-box quadtree; test nested/overlapping modules | Fallback to O(n) with performance monitoring |
| R2 | Debounce timing affects auto-save UX | Low | 500ms debounce with `forceSave()` exposed; verify save indicator | Adjust debounce to 300ms if UX feedback poor |
| R3 | Faction variant SVGs inconsistent with visual style | Medium | Reference base modules (gear.tsx, CoreFurnace.tsx) for patterns | Review against `src/data/factionVariants.ts` styling |

---

## Failure Conditions

**The sprint MUST FAIL** if ANY of the following conditions occur:

| # | Failure Condition | Detection Method |
|---|-------------------|------------------|
| FC1 | Any faction variant renders as gray box or error state | Browser: visually inspect 4 variants |
| FC2 | Test suite fails (any test not passing) | Terminal: `npm test -- --run` |
| FC3 | TypeScript compilation produces errors | Terminal: `npm run build` |
| FC4 | Save mechanism corrupts data or fails to persist | Browser: create machine, refresh, verify data persists |
| FC5 | Recipe "配方" button missing from toolbar | Browser: inspect toolbar for button |
| FC6 | Recipe browser panel doesn't open on button click | Browser: click button, verify panel renders |

---

## Done Definition

**Exact conditions that must be TRUE before claiming Round 47 complete:**

1. [ ] **Faction variant rendering:** All 4 variants (`void-arcane-gear`, `inferno-blazing-core`, `storm-thundering-pipe`, `stellar-harmonic-crystal`) render with correct SVG, faction colors, and patterns (not gray boxes)
2. [ ] **Module selection panel:** Faction variant previews visible in panel
3. [ ] **Recipe button:** "配方" button exists in toolbar with `aria-label="配方"`
4. [ ] **Recipe browser:** Panel opens on button click and displays 18 recipes (14 base + 4 variants)
5. [ ] **Debounced saves:** Rapid edits batch into single save without data loss
6. [ ] **Spatial indexing:** Hit testing uses quadtree with O(log n) performance
7. [ ] **Tests:** All 1708+ existing tests pass
8. [ ] **Build:** `npm run build` succeeds with 0 TypeScript errors
9. [ ] **Runtime:** No new console errors in production

---

## Out of Scope

The following are explicitly **NOT** being done in Round 47:

| Item | Reason for Exclusion |
|------|----------------------|
| Web Worker for statistics | Performance acceptable; defer to P2 |
| Faction reputation auto-award on activation | Requires deeper integration; defer to P2 |
| Additional achievements | Not blocking current workflow |
| Community gallery enhancements | Existing functionality sufficient |
| New module types beyond 18 defined | Scope creep prevention |
| AI text generation integration | Existing mock implementation sufficient |
| Mobile-responsive recipe browser | Focus on desktop workflow first |
| Social sharing improvements | Existing share modal sufficient |
| Tutorial system additions | Already comprehensive |

---

## Contract Summary

| Dimension | Value |
|-----------|-------|
| **Type** | Defect Remediation + Performance + Polish |
| **P0 Items** | 2 (faction variant rendering, recipe UI integration) |
| **P1 Items** | 2 (batch saves, spatial indexing) |
| **P2 Items** | 0 (all deferred) |
| **Test Target** | 1708+ passing (no regressions) |
| **Build Target** | 0 TypeScript errors |
| **Risk Level** | MEDIUM |

**Release Bar:** ALL acceptance criteria (AC1-AC4, 12 sub-criteria) must pass. Any failure condition triggers rejection.
