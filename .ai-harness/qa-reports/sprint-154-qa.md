## QA Evaluation — Round 154

### Release Decision
- **Verdict:** FAIL
- **Summary:** The faction tier → module unlock system is correctly implemented in the store layer (useModuleStore), but the modules are never displayed in any UI panel. CircuitModulePanel and ModulePanel have zero integration with useModuleStore — no component renders the faction tier modules, violating AC-154-004.
- **Spec Coverage:** PARTIAL — Tech tree achievement references fixed; faction tier reward loop NOT connected to UI
- **Contract Coverage:** FAIL — AC-154-004 unverified
- **Build Verification:** PASS — Bundle 426.03 KB < 512 KB limit
- **Browser Verification:** PASS — Tech tree panel opens and shows unlock source for achievement-based nodes
- **Placeholder UI:** NONE
- **Critical Bugs:** 1
- **Major Bugs:** 0
- **Minor Bugs:** 0
- **Acceptance Criteria Passed:** 7/8
- **Untested Criteria:** 1 (AC-154-004)

### Blocking Reasons
1. **AC-154-004 unverified** — CircuitModulePanel does not render faction tier modules from useModuleStore. No component in the codebase imports useModuleStore, FACTION_MODULES, or any faction tier module ID (grep confirms zero matches in `src/components/`). The contract requires modules unlocked via faction tier completion to appear in "CircuitModulePanel under the 'Faction' category (or equivalent per-faction category label) and are distinct from non-faction modules." This requirement is completely unimplemented.

### Scores
- **Feature Completeness: 7/10** — 7 of 8 acceptance criteria fully verified. The tech tree achievement references are all fixed (15 nodes, all IDs valid). The faction tier → module unlock logic is correctly implemented in useModuleStore (idempotent, correct tier thresholds). However, the faction tier modules are not displayed anywhere in the UI, leaving the reward loop incomplete.

- **Functional Correctness: 9/10** — TypeScript compiles clean (npx tsc --noEmit exits 0). Build passes (426.03 KB). syncWithAchievements function correctly checks both prerequisites and achievement status before unlocking nodes. useModuleStore correctly handles idempotent module unlocks. The one deduction is that the syncWithAchievements flow cannot be end-to-end tested in the browser since there's no UI to fire achievements and verify node unlocks.

- **Product Depth: 7/10** — Faction tier module system has correct data model (6 factions × 2 tiers × 2 modules = 24 total). Module IDs follow proper format `{factionId}-t{tier}-{letter}`. Tier thresholds correctly defined (TIER_2=7, TIER_3=15). Info panel shows unlock source (achievement name for nodes with achievementId). However, the modules are never shown to the player, making the reward system invisible and non-functional from a UX perspective.

- **UX / Visual Quality: 8/10** — Browser tests confirm tech tree panel opens correctly with 15 nodes visible. Info panel displays achievement name for selected nodes ("First Circuit" for and-gate, "Modular Thinker" for buffer-gate). Faction panel shows 6 factions with tier progress indicators (T1/T2/T3). CircuitModulePanel correctly shows circuit components and sub-circuits. Deduction for missing faction module display.

- **Code Quality: 8/10** — useModuleStore is well-structured with proper Zustand persist middleware, Set→Array serialization, and idempotent unlock logic. useFactionStore correctly integrates with useModuleStore via checkAndUnlockFactionModules calls. TechTreePanel correctly determines unlock source (achievement name vs "via prerequisites"). Integration test file has 23 tests covering data validation and store logic. Deduction: integration tests for TM-154-005 (module panel display) are simulation-only and don't actually render CircuitModulePanel.

- **Operability: 9/10** — Build passes (426.03 KB < 512 KB). All 6276 tests pass (230 test files, ≥ 6253). TypeScript clean. Dev server starts and responds. Browser tests confirm UI components render and interact correctly. The useModuleStore state persists correctly. Deduction: cannot verify full faction unlock flow end-to-end in browser since modules don't appear in UI.

- **Average: 8.0/10**

### Evidence

### AC-154-001: Achievement ID validity — **PASS**
- **Criterion:** All tech tree nodes have a valid achievementId or no achievementId (null/undefined)
- **Evidence:** All 15 tech tree nodes in `techTreeNodes.ts` have non-null `achievementId` fields. Each ID was verified against `ACHIEVEMENT_DEFINITIONS`:
  - `and-gate` → `first-circuit` ✓
  - `or-gate` → `five-circuits` ✓
  - `not-gate` → `complex-circuit` ✓
  - `buffer-gate` → `first-subcircuit` ✓
  - `nand-gate` → `five-subcircuits` ✓
  - `nor-gate` → `reuse-subcircuit` ✓
  - `xor-gate` → `first-recipe` ✓
  - `xnor-gate` → `five-recipes` ✓
  - `and-3` → `rare-recipe` ✓
  - `or-3` → `explore-tech-tree` ✓
  - `mux-2` → `explore-gallery` ✓
  - `timer-component` → `explore-achievements` ✓
  - `counter-component` → `codex-collector` ✓
  - `flipflop-d` → `master-creator` ✓
  - `latch-sr` → `legendary-machinist` ✓
- All 15 IDs exist in ACHIEVEMENT_DEFINITIONS. Browser test confirms tech tree panel opens with 15 nodes (0/15 unlocked).

### AC-154-002: Achievement → Tech tree unlock flow — **PASS**
- **Criterion:** Firing an achievement that matches a tech tree node's achievementId causes syncWithAchievements to unlock that node
- **Evidence:** `syncWithAchievements` function in `useTechTreeStore.ts` (line 282) correctly checks both `prerequisitesMet` AND `achievementMet` before unlocking a node. The function is called from within `useTechTreeStore.ts` (line 393) when new achievements are unlocked. The flow is: achievement fires → full list of unlocked achievement IDs passed to `syncWithAchievements` → matching nodes with met prerequisites are unlocked.

### AC-154-003: Faction tier → module unlocks — **PASS (logic only)**
- **Criterion:** Completing faction tier 2 (≥7 machines) adds 2 tier-2 module IDs; tier 3 (≥15) adds 2 tier-3 module IDs. Idempotent.
- **Evidence:** `useModuleStore.ts` implements `checkAndUnlockFactionModules(factionId, machineCount)` correctly:
  - TIER_2 threshold = 7 machines, unlocks 2 modules (e.g., `gearsmith-t2-a`, `gearsmith-t2-b`)
  - TIER_3 threshold = 15 machines, unlocks 2 more (e.g., `gearsmith-t3-a`, `gearsmith-t3-b`)
  - Idempotency: checks `!state.unlockedModules.has(moduleId)` before adding
  - `factionTierProgress` tracks highest tier per faction to prevent re-triggering
  - Total: 24 faction tier modules (6 factions × 2 tiers × 2 modules)
- **CRITICAL NOTE:** These modules are never displayed in the UI. See AC-154-004.

### AC-154-004: Modules appear in CircuitModulePanel — **FAIL**
- **Criterion:** Modules unlocked via faction tier completion appear in CircuitModulePanel under the "Faction" category
- **Evidence:** `grep -rn "useModuleStore\|FACTION_MODULES" src/components/` → **0 matches**. `grep -rn "void-t2\|void-t3\|inferno-t2" src/components/` → **0 matches**. Neither `CircuitModulePanel.tsx` nor `ModulePanel.tsx` import or reference `useModuleStore`, `FACTION_MODULES`, or any faction tier module ID. No component renders the faction tier modules from useModuleStore. The `CircuitModulePanel` only displays circuit components (AND, OR, NOT gates, etc.) and sub-circuits. The `ModulePanel` only displays base modules, faction variant modules (via useFactionReputationStore), and advanced modules. Faction tier modules from useModuleStore are completely absent from the UI.
- **Test gap:** TM-154-005 in the integration test file does NOT actually render `CircuitModulePanel`. It only runs simulation assertions ("should return faction modules in correct format", "should distinguish faction modules from non-faction modules") that don't test the actual component rendering.

### AC-154-005: Test count ≥ 6253 — **PASS**
- **Criterion:** npm test -- --run shows ≥ 6253 passing tests
- **Evidence:** Test output: `Test Files  230 passed (230)` and `Tests  6276 passed (6276)`. 6276 ≥ 6253. 23 new tests in `techTreeFactionIntegration.test.tsx`. 1 new test file added (increased from 229 to 230).

### AC-154-006: Bundle size ≤ 512KB — **PASS**
- **Criterion:** npm run build shows main bundle ≤ 524,288 bytes
- **Evidence:** Build output: `dist/assets/index-BtVGjyOp.js 426.03 kB │ gzip: 105.24 kB`. 426.03 KB = 426,030 bytes, 98,258 bytes under budget. `useModuleStore` is lazy enough not to inflate bundle.

### AC-154-007: TypeScript compilation clean — **PASS**
- **Criterion:** npx tsc --noEmit exits with code 0
- **Evidence:** Command completed with exit code 0 and zero output (no errors).

### AC-154-008: Info panel unlock source — **PASS**
- **Criterion:** Tech tree info panel correctly displays unlock source for each node
- **Evidence:** Browser test: Opened tech tree panel, clicked "AND Gate" node (has achievementId='first-circuit'). Info panel showed unlock source "First Circuit" (blue text via data-testid="unlock-source"). Browser test: Clicked "Buffer Gate" node (has achievementId='first-subcircuit'). Info panel showed unlock source "Modular Thinker". The `TechTreePanel.tsx` `useEffect` correctly determines unlock source: if `node.achievementId`, looks up achievement name from `ACHIEVEMENT_DEFINITIONS`; else if `node.prerequisites.length === 0`, shows nothing; else shows "via prerequisites" (purple).

### Browser Verification (Additional)

#### Tech Tree Panel Opens — **PASS**
- **Test:** Clicked "科技" (Tech) button
- **Result:** Panel visible within 1500ms with "科技树" heading, "解锁进度: 0/15", and all 15 nodes visible (and-gate, or-gate, not-gate, buffer-gate, nand-gate, nor-gate, xor-gate, xnor-gate, and-3, or-3, mux-2, timer-component, counter-component, flipflop-d, latch-sr)
- **Assertion:** `[data-testid="tech-tree-panel"]` visible

#### Info Panel Shows Achievement Name for AND Gate — **PASS**
- **Test:** Clicked `[data-testid="tech-tree-node-and-gate"]`
- **Result:** Info panel text "AND Gate" present, unlock source `[data-testid="unlock-source"]` = "First Circuit"
- **Assertion:** Achievement name shown correctly for achievement-based node

#### Info Panel Shows Achievement Name for Buffer Gate — **PASS**
- **Test:** Clicked `[data-testid="tech-tree-node-buffer-gate"]`
- **Result:** Unlock source `[data-testid="unlock-source"]` = "Modular Thinker" (the `first-subcircuit` achievement)
- **Assertion:** All nodes with achievementId show the achievement name, not "via prerequisites"

#### Faction Panel Shows 6 Factions — **PASS**
- **Test:** Clicked "派系" (Faction) button
- **Result:** Faction panel visible with 6 factions (虚空深渊/Void, 熔星锻造/Molten Star Forge, 雷霆相位/Thunder Phase, and more), each with T1/T2/T3 tier indicators, all showing 0 machines
- **Assertion:** Faction panel renders correctly with tier progression indicators

## Bugs Found

1. **[CRITICAL] Faction tier modules not displayed in UI (AC-154-004)**
   - **Severity:** Critical
   - **Description:** The faction tier module unlock system is fully implemented in `useModuleStore.ts` with correct idempotent logic, but the modules are never rendered in any UI panel. `CircuitModulePanel.tsx` does not import `useModuleStore`, `FACTION_MODULES`, or any faction tier module ID. `ModulePanel.tsx` also has zero references to `useModuleStore`. The grep command `grep -rn "useModuleStore\|FACTION_MODULES" src/components/` returns zero matches.
   - **Impact:** Players who reach faction tier 2 or tier 3 receive no visible reward. The faction tier module unlock system is invisible and non-functional from a player perspective. AC-154-004 cannot be verified.
   - **Root Cause:** The display integration (adding a "Faction Modules" section to CircuitModulePanel or ModulePanel that reads from useModuleStore) was never implemented. The contract deliverables only describe the store logic, not the display integration.
   - **Reproduction:** Progress any faction to 7+ machines. Observe that no new modules appear in CircuitModulePanel or ModulePanel. Check `grep -rn "useModuleStore" src/components/` → 0 results.

## Required Fix Order

1. **Add faction tier module display to CircuitModulePanel or ModulePanel** — Connect `useModuleStore` to a UI component. Add a "Faction Modules" or per-faction category section to `CircuitModulePanel.tsx` (or `ModulePanel.tsx`) that reads from `useModuleStore.getState().getUnlockedFactionModules(factionId)` and renders each faction's unlocked modules with their icons and names. Ensure modules from different tiers are visually distinct and the section only appears when at least one faction tier module is unlocked. This is required to verify AC-154-004.

2. **Add TM-154-005 integration test that renders the actual component** — The current TM-154-005 tests are simulation-only. After fixing the display, write a test that: (a) imports CircuitModulePanel, (b) progresses a faction to tier 2, (c) renders the component, (d) queries for the faction module section, (e) asserts the tier-2 module IDs appear.

## What's Working Well

1. **Correct and complete tech tree achievement ID mapping** — All 15 tech tree nodes have valid achievement IDs that exist in ACHIEVEMENT_DEFINITIONS. The contract's core bug (7 of 13 nodes referencing non-existent achievements) is fully resolved.

2. **Well-structured useModuleStore** — The faction tier module store has clean architecture: proper Zustand with persist middleware, Set→Array serialization, idempotent unlock logic, tier progress tracking, and clear separation of concerns (module unlock check is isolated in `checkAndUnlockFactionModules`).

3. **Correct faction tier logic** — Tier 2 at 7 machines (2 modules), Tier 3 at 15 machines (2 more modules), idempotent (re-checking tier does not duplicate), cross-faction isolation (progressing one faction doesn't affect others).

4. **Proper end-to-end store integration** — `useCodexStore.syncFactionTierUnlocks()` → `useFactionStore.syncFactionCountsFromCodex()` → `useModuleStore.checkAndUnlockFactionModules()` chain is correctly wired. When machines are added to the codex, faction counts are calculated, and module unlocks are triggered automatically.

5. **Tech tree info panel unlock source display** — The info panel correctly shows achievement names for nodes with achievementIds ("First Circuit", "Modular Thinker") and would show "via prerequisites" for prerequisite-only nodes.

6. **Strong test coverage maintained** — 6276 tests pass (230 files), 23 new integration tests added, bundle size reduced to 426.03 KB, TypeScript clean.
