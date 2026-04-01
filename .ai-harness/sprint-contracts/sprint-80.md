# Sprint Contract — Round 80

## Scope

This sprint focuses on **P2 feature enhancements** and **UX polish improvements** while maintaining full regression coverage. The project passed Round 79 with 2761/2761 tests, 0 TypeScript errors, and 522KB bundle size. This round will add meaningful extended features from the spec's future-expansion roadmap while ensuring all existing functionality remains stable.

**Duration:** Standard sprint (target completion within current sprint window)

## ⚠️ CRITICAL PREREQUISITE — Faction & Achievement Data Migration

Before any Deliverable 1–10 code is written, the builder MUST address the architectural mismatch between this contract's faction/achievement data model and the live codebase.

### Current Codebase State (Source of Truth)
- **Factions (4 total):** `void`, `inferno`, `storm`, `stellar` — defined in `src/types/factions.ts` as `FactionId` union type
- **Faction Achievement IDs:** `void-conqueror`, `inferno-master`, `storm-ruler`, `stellar-harmonizer`
- **Tutorial Steps:** 8 steps in `src/data/tutorialSteps.ts` (TUTORIAL_STEPS array)
- **Achievements total:** 15 defined in `src/data/achievements.ts`

### This Contract's Requirements Conflict
- **Contract demands 6 factions** with different names (Void Abyss, Molten Star Forge, Thunder Phase, Forest Spirit Barrier, Arcane Order, Chaos Disorder)
- **Contract demands achievement IDs** (`faction-void`, `faction-forge`, `faction-phase`, `faction-barrier`, `faction-order`, `faction-chaos`, `first-export`, `complex-machine-created`) that **do not exist** in the current codebase
- **Contract demands 5 tutorial steps** but 8 exist

### Required Resolution (must be completed BEFORE Deliverables)
The builder must choose one of these paths and document the choice:

**Path A — In-Place Migration (Recommended):**
- Extend `FactionId` in `src/types/factions.ts` from 4 factions to 6
- Add 6 new faction configs to `FACTIONS` with the contract-specified colors
- Add `first-export` and `complex-machine-created` achievements to `ACHIEVEMENTS` in `src/data/achievements.ts`
- Change faction achievement IDs from `void-conqueror`/`inferno-master`/etc. to `faction-void`/`faction-forge`/etc.
- Reduce TUTORIAL_STEPS from 8 to 5
- All changes must maintain existing non-faction achievements unchanged
- Migration must not break Round 79 regression (2761 tests must still pass after migration)

**Path B — New Namespace:**
- Add new faction/achievement data under new keys (e.g., `FACTION_BADGES`, `BADGE_ACHIEVEMENTS`)
- Keep existing faction system intact for backward compatibility
- New deliverables consume the new namespace
- Must verify no conflicts between old and new namespace

**Path B is only acceptable if Path A breaks regression. The builder must justify their choice in the revision notes.**

### Migration Verification
After completing the migration (either path):
1. `npx vitest run` must still show 2761+ tests passing (no regression)
2. `src/types/factions.ts` must define all 6 factions required by Deliverables 1 and 7
3. `src/data/achievements.ts` must contain all 13 acceptance criteria achievement IDs
4. `src/data/tutorialSteps.ts` must have TUTORIAL_STEPS.length === 5

**The Sprint Contract (Deliverables 1–10) may not begin until migration is complete and verified.**

---

## Spec Traceability

### P0 items covered this round
- None (P0 fully complete per Round 77 contract)

### P1 items covered this round
- None (P1 fully complete per Round 77 contract)

### Remaining P0/P1 after this round
- All P0/P1 items complete (verified Round 77 and Round 79)

### P2 items intentionally deferred
- AI naming/description assistant integration
- Community sharing square
- Codex trading/exchanging system
- Challenge task mode
- Rune recipe unlock system
- Faction technology tree

## Deliverables

### 1. Faction Badge System
- **File:** `src/components/FactionBadge.tsx`
- **Prerequisite:** Faction migration (Path A or B) must be complete first, defining all 6 factions
- **Description:** Visual faction badges for machine attributes
- **Requirements:**
  - 6 faction types: 虚空深渊 (Void Abyss), 熔星锻造 (Molten Star Forge), 雷霆相位 (Thunder Phase), 森灵结界 (Forest Spirit Barrier), 奥术秩序 (Arcane Order), 混沌无序 (Chaos Disorder)
  - Badge component with icon, color scheme, and tooltip
  - Each badge displays with designated color: Void=#7B2FBE, Forge=#E85D04, Phase=#48CAE4, Barrier=#2D6A4F, Order=#3A0CA3, Chaos=#9D0208

### 2. Machine Complexity Analyzer
- **File:** `src/utils/complexityAnalyzer.ts`
- **Description:** Analyze machine structure complexity and assign tier
- **Thresholds (deterministic):**
  - ≤3 modules = 简陋 (Crude)
  - 4–8 modules = 普通 (Ordinary)
  - 9–15 modules = 精致 (Exquisite)
  - 16–30 modules = 复杂 (Complex)
  - 31+ modules = 史诗 (Epic)
- **Escalation bonuses (each +1 tier, no cap):**
  - Connection density > 2.5 (connections/module ratio) = +1 tier
  - ≥3 rare modules used = +1 tier
  - Balanced symmetric layout = +1 tier
- **Note:** "Balanced symmetric layout" is determined by checking if the bounding box aspect ratio is between 0.4 and 2.5 AND module count is ≥4

### 3. Achievement/Collection Tracker
- **File:** `src/store/achievementStore.ts` (extend existing)
- **Prerequisite:** Achievement migration (Path A or B) must add missing achievement IDs first
- **Description:** Track unlocked achievements across user sessions
- **Achievements to track (13 total after migration):**
  1. First machine created (`first-forge`) ✅ existing
  2. First machine activated (`first-activation`) ✅ existing
  3. First machine exported (`first-export`) ⚠️ MUST BE ADDED — missing from current codebase
  4. First 10 machines created (`skilled-artisan`) ✅ existing
  5. Faction diversity — use Void Abyss faction (`faction-void`) ⚠️ ID differs from current `void-conqueror`
  6. Faction diversity — use Molten Star Forge faction (`faction-forge`) ⚠️ MUST BE ADDED — Forge faction doesn't exist
  7. Faction diversity — use Thunder Phase faction (`faction-phase`) ⚠️ ID differs from current `storm-ruler` (different faction)
  8. Faction diversity — use Forest Spirit Barrier faction (`faction-barrier`) ⚠️ MUST BE ADDED — Barrier faction doesn't exist
  9. Faction diversity — use Arcane Order faction (`faction-order`) ⚠️ MUST BE ADDED — Order faction doesn't exist
  10. Faction diversity — use Chaos Disorder faction (`faction-chaos`) ⚠️ MUST BE ADDED — Chaos faction doesn't exist
  11. Complex machine created (tier 精致 or above) (`complex-machine-created`) ⚠️ MUST BE ADDED — missing from current codebase
  12. Apprentice Forger — 5 machines (`apprentice-forge`) ✅ existing
  13. Perfect Activation — activate without errors (`perfect-activation`) ✅ existing
- **Persistence:** localStorage key `arcane-codex-achievements`
- **Migration note:** The current codebase has 15 achievements including `void-conqueror`, `inferno-master`, `storm-ruler`, `stellar-harmonizer` with different IDs. Migration must add the missing IDs, rename faction achievement IDs per the contract specification, and keep all existing non-faction achievements intact.

### 4. Machine Tags System
- **File:** `src/types/machine.ts` (extension), `src/store/useMachineTagsStore.ts` (existing)
- **Description:** Searchable/filterable tags for machines
- **Requirements:**
  - Auto-generated tags based on module composition using these rules (deterministic):
    - Has `core-furnace` → tag: `core-source`
    - Has any elemental module (fire-crystal, lightning-conductor, amplifier-crystal) → tag: `elemental`
    - Has any rare module (temporal-distorter, ether-infusion-chamber, arcane-matrix-grid) → tag: `advanced-tech`
    - Has ≥5 connections → tag: `highly-connected`
    - Connection density > 2.5 → tag: `dense-circuit`
    - Has shield-shell → tag: `protective`
    - Has rune-node OR phase-modulator → tag: `arcane-enhanced`
  - Manual user-editable tags (already implemented in existing store)
  - Tags displayed in Codex view (already implemented)
  - Filter support in Codex list view (already implemented)

### 5. Quick Actions Toolbar
- **File:** `src/components/QuickActionsToolbar.tsx`
- **Description:** Floating toolbar for common operations
- **Actions:** Undo, Redo, Zoom Fit, Clear Canvas, Duplicate Selection
- **Position:** Fixed position in bottom-right corner of canvas viewport, 8px from edges

### 6. Keyboard Shortcuts Panel
- **File:** `src/components/KeyboardShortcutsPanel.tsx`
- **Description:** Overlay panel showing all keyboard shortcuts
- **Requirements:**
  - Toggle with `?` key press
  - Close with `?` again or Escape key
  - Grouped by category: Canvas, Modules, Connections, Export
  - Shortcuts to display:
    - Canvas: `Space+Drag` = Pan, `Scroll` = Zoom, `Ctrl+0` = Zoom Fit, `Ctrl++` = Zoom In, `Ctrl+-` = Zoom Out, `Ctrl+Shift+Z` = Redo
    - Modules: `R` = Rotate, `F` = Flip, `[` = Scale Down, `]` = Scale Up, `Ctrl+D` = Duplicate, `Ctrl+G` = Group, `Ctrl+Shift+G` = Ungroup, `Delete` = Delete
    - Connections: `C` = Start Connection, `Escape` = Cancel
    - Export: `Ctrl+S` = Save to Codex, `Ctrl+E` = Export

### 7. Enhanced Machine Cards in Codex
- **File:** `src/components/Codex/CodexView.tsx` (update)
- **Prerequisite:** Deliverables 1 and 2 must be complete first
- **Description:** Improved machine card display in Codex view
- **Enhancements:**
  - Thumbnail preview of machine layout (MachinePreview component already exists)
  - Quick-action buttons (activate, edit, delete, duplicate) — **Add "Duplicate" button if missing**
  - Faction badge display — **Use Deliverable 1's FactionBadge component**
  - Complexity tier indicator — **Use Deliverable 2's complexityAnalyzer**

### 8. Performance Optimizations
- **File:** `src/hooks/useCanvasPerformance.ts`
- **Description:** Optimizations for large machine editing
- **Requirements:**
  - Debounced connection updates during drag (16ms debounce, rAF-aligned)
  - Virtualized rendering for 50+ modules
  - RequestAnimationFrame batching for transform updates
  - Maintain ≥30 FPS during drag operations with 50 modules

### 9. Machine Presets System
- **File:** `src/data/machinePresets.ts`
- **Description:** Pre-built machine templates
- **Requirements:**
  - 5 starter presets demonstrating different faction themes:
    1. `void-reverence` — Void Abyss faction (void-siphon, void-arcane-gear)
    2. `molten-forge` — Molten Star Forge faction (inferno-blazing-core, fire-crystal)
    3. `thunder-resonance` — Thunder Phase faction (lightning-conductor, phase-modulator)
    4. `arcane-matrix` — Arcane Order faction (core-furnace, rune-node, phase-modulator)
    5. `stellar-harmony` — Stellar faction (stellar-harmonic-crystal, stabilizer-core)
  - Each preset produces ≥4 modules and ≥3 connections when loaded
  - Accessible from "New Machine" dropdown
  - Valid, loadable, activatable preset machines

### 10. Tutorial/Help Overlay
- **File:** `src/components/Tutorial/TutorialOverlay.tsx` (already exists, extend)
- **Prerequisite:** TUTORIAL_STEPS must be reduced from 8 to 5 (part of faction migration)
- **Description:** First-time user guided tour
- **Requirements:**
  - 5-step interactive tutorial: place module, connect, activate, save, export
  - Dismissible with click
  - localStorage flag `arcane-codex-tutorial-seen` = true after dismiss
  - Re-shows when localStorage key is cleared
  - **NOTE:** Existing TutorialOverlay.tsx has 8 steps. Reduce to exactly 5 steps. Preserve the 5 most essential steps: (1) place module, (2) connect modules, (3) activate machine, (4) save to codex, (5) export.

## Acceptance Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| AC0a | Faction migration complete: 6 factions defined in `src/types/factions.ts` | Code inspection + `npx tsc --noEmit` |
| AC0b | Achievement migration complete: all 13 required achievement IDs exist in `src/data/achievements.ts` | `achievementCoverage.test.ts` |
| AC0c | Tutorial migration complete: `TUTORIAL_STEPS.length === 5` | Unit test asserting `TUTORIAL_STEPS.length === 5` |
| AC0d | Regression: all 2761+ existing tests still pass after migration | `npx vitest run` |
| AC1 | All 2761 existing tests continue to pass | `npx vitest run` |
| AC2 | Build bundle size remains under 560KB | `npm run build` output size check |
| AC3 | TypeScript compilation produces 0 errors | `npx tsc --noEmit` |
| AC4 | All 6 faction badges render with correct color and icon | Unit test verifying hex color match and icon type for each faction |
| AC5 | Complexity analyzer produces deterministic tier output | Unit tests with known inputs: 2 modules→简陋, 6→普通, 12→精致, 22→复杂, 40→史诗; escalation tests: 8 modules with 25 connections → 复杂 (no cap), 6 modules with 15 connections + balanced layout → 精致 |
| AC6 | Achievement tracker persists across page reloads | Load→unlock→reload→verify achievement present in store |
| AC7 | Keyboard shortcuts panel toggles with `?` key | Browser test: `?` press shows panel, second `?` or Escape hides |
| AC8 | Tutorial overlay: (a) first visit visible, (b) dismiss hides it, (c) no re-show after dismiss without clear, (d) re-shown after localStorage clear, (e) exactly 5 steps | Browser test: 5 assertions covering all 4 behaviors AND `TUTORIAL_STEPS.length === 5` |
| AC9 | All 5 machine presets load with ≥4 modules and ≥3 connections | Unit test for each preset asserting minimum counts |
| AC10 | Canvas maintains ≥30 FPS with 50 modules during drag | Playwright test measuring frame deltas over 10 consecutive frames |
| AC11 | Auto-generated tags appear when machine has matching module composition | Unit test: create machine with core-furnace + fire-crystal → assert tags include `core-source` AND `elemental` |
| AC12 | Quick Actions Toolbar buttons trigger correct actions | Unit test: click Undo→verify history decrements, click Clear Canvas→verify canvas empty, click Duplicate→verify selection duplicated |
| AC13 | 13 achievements total exist covering all contract requirements | Unit test counting ACHIEVEMENTS array: first-forge, first-activation, first-export, skilled-artisan, 6 faction achievements (faction-void, faction-forge, faction-phase, faction-barrier, faction-order, faction-chaos), complex-machine-created, apprentice-forge, perfect-activation |

## Test Methods

### TM0a: Faction Migration Verification
1. Import `FACTIONS` from `src/types/factions.ts`
2. Assert `Object.keys(FACTIONS).length === 6`
3. Assert all 6 required factions are present with correct IDs, names, and colors

### TM0b: Achievement Migration Verification
1. Import `ACHIEVEMENTS` from `src/data/achievements.ts`
2. Assert total count ≥ 13 (current 15 + new additions, no removals)
3. Assert existence of all required achievement IDs:
   - first-forge, first-activation, first-export, skilled-artisan
   - faction-void, faction-forge, faction-phase, faction-barrier, faction-order, faction-chaos
   - complex-machine-created, apprentice-forge, perfect-activation
4. **Negative test:** Assert existing non-faction achievements still exist (void-conqueror→faction-void rename, inferno-master→faction-forge, storm-ruler→faction-phase, stellar-harmonizer→still exists as-is)

### TM0c: Tutorial Migration Verification
1. Import `TUTORIAL_STEPS` from `src/data/tutorialSteps.ts`
2. Assert `TUTORIAL_STEPS.length === 5`
3. Assert step IDs cover: module placement, connection, activation, codex save, export

### TM0d: Post-Migration Regression
1. Run `npx vitest run`
2. Assert 2761+ tests pass (no regression from migration)

### TM1: Regression Suite
```
Command: npx vitest run
Pass: All 2761 tests pass (121 files)
```

### TM2: Bundle Size
```
Command: npm run build
Pass: dist/assets/index-*.js < 560KB
```

### TM3: TypeScript Check
```
Command: npx tsc --noEmit
Pass: 0 errors reported
```

### TM4: Faction Badge Rendering
- Unit test iterating all 6 factions
- Assert each faction badge has correct hex color
- Assert each faction badge renders correct icon type
- Factions: 虚空深渊 (#7B2FBE), 熔星锻造 (#E85D04), 雷霆相位 (#48CAE4), 森灵结界 (#2D6A4F), 奥术秩序 (#3A0CA3), 混沌无序 (#9D0208)

### TM5: Complexity Analysis
Unit tests with these exact inputs and expected outputs:
| Input | Expected Output |
|-------|-----------------|
| 2 modules, 1 connection | 简陋 |
| 6 modules, 5 connections | 普通 |
| 12 modules, 8 connections | 精致 |
| 22 modules, 25 connections (high density) | 复杂 |
| 40 modules, 20 connections | 史诗 |
| 8 modules, 25 connections (escalation: 25/8=3.125>2.5, +1) | 复杂 |
| 6 modules, 15 connections, balanced layout (+1) | 精致 |

### TM6: Achievement Persistence
1. Load application
2. Trigger achievement unlock (create first machine)
3. Reload page
4. Verify achievement is present in store (do NOT clear localStorage)

### TM7: Keyboard Panel
1. Press `?` key → panel visible
2. Press `?` again → panel hidden
3. Press `?` → panel visible
4. Press Escape → panel hidden

### TM8: Tutorial Flow + Step Count
1. Clear localStorage
2. Load page → tutorial visible
3. Assert `TUTORIAL_STEPS.length === 5` (migration verification)
4. Click dismiss → tutorial hidden, localStorage key set
5. Reload page → tutorial NOT shown
6. Clear localStorage → tutorial shown again

### TM9: Preset Loading
For each of 5 presets:
1. Load preset data
2. Assert canvas has ≥4 modules
3. Assert canvas has ≥3 connections

### TM10: Performance Benchmarks
1. Place 50 modules on canvas
2. Start drag operation
3. Begin rAF loop
4. Measure frame deltas over 10 consecutive frames
5. Assert average delta ≤ 33ms (≥30 FPS)

### TM11: Auto-Generated Tags
For each auto-generation rule:
1. Create machine with matching modules
2. Call auto-generate function
3. Assert generated tags include expected tag
Test cases:
- { modules: [core-furnace] } → `core-source`
- { modules: [fire-crystal] } → `elemental`
- { modules: [temporal-distorter] } → `advanced-tech`
- { connections: 6, modules: 1 } → `highly-connected`
- { connections: 3, modules: 1 } → `dense-circuit`
- { modules: [shield-shell] } → `protective`
- { modules: [rune-node] } → `arcane-enhanced`

### TM12: Quick Actions Toolbar
1. Add a module to canvas
2. Click Undo button → module count decreases
3. Click Redo button → module count increases
4. Click Clear Canvas → canvas empty
5. Select module → click Duplicate → module count increases

### TM13: Achievement Coverage
1. Import ACHIEVEMENTS from data/achievements.ts
2. Assert total count ≥ 13
3. Assert existence of all required achievements:
   - first-forge
   - first-activation
   - first-export
   - skilled-artisan
   - faction-void
   - faction-forge
   - faction-phase
   - faction-barrier
   - faction-order
   - faction-chaos
   - complex-machine-created
   - apprentice-forge
   - perfect-activation

## Test Files Required

The following new test files must be created in `src/__tests__/`:

| File | Purpose | Covers |
|------|---------|--------|
| `factionMigration.test.ts` | Verify 6 factions defined after migration | AC0a, TM0a |
| `achievementMigration.test.ts` | Verify all 13 required achievements exist | AC0b, TM0b |
| `tutorialMigration.test.ts` | Verify TUTORIAL_STEPS.length === 5 | AC0c, TM0c |
| `postMigrationRegression.test.ts` | Verify 2761+ tests still pass | AC0d, TM0d |
| `factionBadge.test.tsx` | Faction badge rendering tests | AC4, TM4 |
| `complexityAnalyzer.test.ts` | Unit tests for tier calculation | AC5, TM5 |
| `achievementStore.test.ts` | Achievement persistence tests | AC6, TM6 |
| `keyboardShortcutsPanel.test.tsx` | Keyboard panel toggle tests | AC7, TM7 |
| `tutorialOverlay.test.tsx` | Tutorial flow tests including step count | AC8, TM8 |
| `machinePresets.test.ts` | Preset loading validation | AC9, TM9 |
| `canvasPerformance.test.ts` | FPS measurement tests | AC10, TM10 |
| `autoGeneratedTags.test.ts` | Auto-tag generation rules | AC11, TM11 |
| `quickActionsToolbar.test.tsx` | Toolbar button actions | AC12, TM12 |
| `achievementCoverage.test.ts` | Achievement completeness check | AC13, TM13 |

## Risks

1. **Migration breaking existing features** — Changing faction IDs and adding new achievements may break existing faction reputation, tech tree, and challenge systems that reference faction IDs
2. **Performance regression** — New features may impact canvas performance with large machines
3. **Bundle size creep** — Additional components may push bundle over 560KB threshold (522KB baseline + 10 new deliverables)
4. **localStorage edge cases** — Achievement/tutorial persistence may fail in private browsing
5. **Preset validity** — Presets referencing new factions (Void Abyss, Molten Star Forge, etc.) must use valid module types
6. **Symmetric layout detection** — "Balanced symmetric layout" heuristic must be clearly defined to avoid flakiness
7. **Tutorial step reduction side effects** — Removing 3 tutorial steps may affect WelcomeModal or onboarding flow references

## Failure Conditions

The round fails if ANY of the following occur:

1. Any existing test fails (regression detected) — including pre-existing faction/achievement tests
2. Bundle size exceeds 560KB
3. TypeScript errors introduced
4. Runtime errors during browser workflow
5. Machine activation workflow breaks
6. Faction badge renders with wrong color or missing icon (any of 6 factions)
7. Complexity analyzer produces incorrect tier for any AC5 test case
8. Tutorial re-appears after dismiss without localStorage being cleared
9. Any preset loads with fewer than 4 modules or fewer than 3 connections
10. Canvas FPS drops below 30 FPS with 50 modules during drag
11. Any auto-generation rule produces wrong tag or no tag for a known input (TM11 test cases)
12. Quick Actions Toolbar Undo/Redo buttons do not work correctly
13. Total achievements count is less than 13 OR any required achievement type is missing from AC13/TM13
14. Migration breaks any existing faction system (tech tree, challenges, reputation) that depends on faction IDs
15. TUTORIAL_STEPS.length !== 5 after migration
16. **Migration reveals unresolvable conflicts** — If Path A migration cannot be completed without breaking Round 79 regression, the builder must switch to Path B and document why

## Done Definition

All of the following must be true before claiming completion:

### Phase 1 — Migration (MUST COMPLETE FIRST)
- [ ] `src/types/factions.ts` defines all 6 required factions with correct IDs, names, colors
- [ ] `src/data/achievements.ts` contains all 13 required achievement IDs
- [ ] `TUTORIAL_STEPS.length === 5` in `src/data/tutorialSteps.ts`
- [ ] `npx vitest run` shows 2761+ tests passing after migration
- [ ] `npx tsc --noEmit` shows 0 errors after migration
- [ ] `src/__tests__/factionMigration.test.ts` — all 6 factions verified
- [ ] `src/__tests__/achievementMigration.test.ts` — all 13 achievements verified, existing non-faction achievements intact
- [ ] `src/__tests__/tutorialMigration.test.ts` — TUTORIAL_STEPS.length === 5 verified

### Phase 2 — Feature Deliverables
- [ ] `npm run build` produces bundle under 560KB
- [ ] `npx tsc --noEmit` produces 0 errors
- [ ] `src/__tests__/factionBadge.test.tsx` — all 6 factions pass color + icon assertions
- [ ] `src/__tests__/complexityAnalyzer.test.ts` — all 7 complexity test cases pass (including escalation)
- [ ] `src/__tests__/achievementStore.test.ts` — persistence across reload verified
- [ ] `src/__tests__/keyboardShortcutsPanel.test.tsx` — `?` key toggle + Escape close verified
- [ ] `src/__tests__/tutorialOverlay.test.tsx` — first visit, dismiss, no re-show, re-show after clear, step count === 5 all verified
- [ ] `src/__tests__/machinePresets.test.ts` — all 5 presets pass ≥4 modules + ≥3 connections
- [ ] `src/__tests__/canvasPerformance.test.ts` — ≥30 FPS verified with 50 modules during drag
- [ ] `src/__tests__/autoGeneratedTags.test.ts` — all 7 auto-generation rules verified
- [ ] `src/__tests__/quickActionsToolbar.test.tsx` — Undo/Redo/Clear/Duplicate buttons work
- [ ] `src/__tests__/achievementCoverage.test.ts` — ≥13 achievements exist covering all contract requirements
- [ ] No console errors during full workflow (add modules, connect, activate, export)

## Out of Scope

- AI integration for naming/descriptions
- Backend/server functionality
- Multi-user/community features
- Payment/monetization
- Mobile-specific layouts
- IE11 support
- Dark mode toggle (already implemented)
- Language localization beyond English/Chinese defaults
- Rune recipe unlock system
- Faction technology tree (existing system preserved, not expanded this round)
- Challenge task mode
- Codex trading/exchanging system

## Operator Inbox Requirements (Preserved)

Per inbox item `operator-item-1774941228843` (processed Round 51):
- All functional modules must be tested, especially module-to-module interaction
- UI interaction must be tested with the strictest standards
- Bugs found during testing must be fixed
- These requirements apply to this sprint's new features (Deliverables 1-10)

**Module-to-module interaction tests required for this sprint:**
- Deliverable 7 (CodexView): Test that FactionBadge (D1) + complexityAnalyzer (D2) integrate correctly in Codex cards
- Deliverable 9 (Presets): Test that presets load correctly with FactionBadge display (D1) in Codex after save
- Deliverable 3 (Achievement): Test that `first-export` achievement (new) triggers correctly on machine export action; test that `complex-machine-created` achievement triggers when complexity >= 精致
- Deliverable 4 (Tags): Test that auto-generated tags correctly identify module compositions in Codex filter scenarios

## Contract Revision Notes

This contract REPLACES the previous Round 80 contract draft (v1 and v2) for the following reasons:

### Revisions in this version (v3):

1. **CRITICAL — Faction & Achievement Migration Required (AC0a–AC0d):** The previous versions assumed the faction system and achievement IDs specified in Deliverables 1 and 3 already exist in the codebase. They do not. The codebase has 4 factions (`void`, `inferno`, `storm`, `stellar`) with achievement IDs `void-conqueror`, `inferno-master`, `storm-ruler`, `stellar-harmonizer`. The contract specifies 6 different factions and different achievement IDs (`faction-void`, `faction-forge`, etc.) plus 2 missing achievements (`first-export`, `complex-machine-created`). Migration (Path A or B) is now a mandatory Phase 1 prerequisite before any Deliverable 1–10 code is written.

2. **Added Migration Acceptance Criteria (AC0a–AC0d):** Four new acceptance criteria (AC0a through AC0d) and corresponding test files (`factionMigration.test.ts`, `achievementMigration.test.ts`, `-tutorialMigration.test.ts`, `postMigrationRegression.test.ts`) ensure migration is verified before feature work begins.

3. **Tutorial Step Count Explicitly Testable (AC8, TM8):** Added explicit assertion `TUTORIAL_STEPS.length === 5` to both AC8 and TM8. The previous contract specified "reduce to 5 steps" but had no test verifying the step count.

4. **Added Cross-Component Interaction Tests (Operator Inbox):** Added explicit module-to-module interaction requirements under "Operator Inbox Requirements" section covering D1↔D2 integration, D1↔D9 integration, D3↔D11 achievement triggering, and D4↔D4 filter behavior.

5. **Updated Achievement Count (AC13, TM13):** Corrected total from 11 to 13. The contract now reflects: 4 milestone achievements (first-forge, first-activation, first-export, skilled-artisan) + 6 faction achievements (faction-void through faction-chaos) + 2 additional achievements (complex-machine-created, apprentice-forge, perfect-activation). Total = 12 excluding apprentice-forge and perfect-activation which are existing, making the required additions = 8 new (first-export, 6 faction, complex-machine-created) to the existing base.

6. **Added Failure Condition #14 (Migration Breakage):** Explicitly states that migration breaking any existing faction-dependent system (tech tree, challenges, reputation) constitutes round failure.

7. **Bundle Risk Explicit:** Noted that 522KB baseline + 10 new deliverables requires monitoring. The contract does not currently provide per-deliverable size estimates; the builder should add these in the next revision if any single deliverable is expected to exceed ~5KB.

### Original revision notes (from v1/v2):

1. **Missing Acceptance Criteria (Deliverables 4 & 5):** Machine Tags System (D4) and Quick Actions Toolbar (D5) had no AC entries in the AC table, making them untestable and unverifiable.
2. **Untestable Auto-generation Rules:** Deliverable 4 stated "Auto-generated tags based on module composition" without defining the generation rules. Testability requires deterministic rules.
3. **Missing Test File Coverage:** Deliverable 4 (machineTags) and Deliverable 5 (Quick Actions Toolbar) were not listed in the Test Files Required section, despite operator inbox requiring "all functional modules must be tested."
4. **Incomplete Achievement Scope:** Deliverable 3's achievement list referenced existing achievements that don't cover all 6 required categories. Missing: first-export achievement, 6 faction achievements (only 4 existed with different IDs), complex-machine-created achievement.
5. **Vague Specification Language:** "Balanced symmetric layout" bonus in Deliverable 2 had no definition. "Fixed position" in Deliverable 5 had no coordinates.
6. **Tutorial Steps Mismatch:** Existing TutorialOverlay.tsx has 8 steps; contract specified 5. Clarified to reduce to exactly 5.
