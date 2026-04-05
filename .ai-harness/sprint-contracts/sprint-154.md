# Sprint Contract — Round 154

## Scope

This sprint fixes a critical bug in the Tech Tree system and extends the Faction system with module unlock rewards. Specifically:

1. **Fix missing achievement definitions** — 7 of 13 tech tree nodes reference achievement IDs that don't exist in `ACHIEVEMENT_DEFINITIONS`, preventing those nodes from ever unlocking.
2. **Connect Faction tier completion to module unlocks** — Faction tiers currently unlock visually but grant no gameplay reward. This sprint adds actual module unlock rewards when faction tiers are completed.

This is a remediation + depth sprint: it fixes broken tech tree unlocking and adds a missing reward loop to the faction system.

## Spec Traceability

### P0 — Must Complete
- Tech tree node achievement IDs that don't exist in `ACHIEVEMENT_DEFINITIONS` must be added or redirected to real achievement IDs so all 13 nodes can unlock
- Faction tier completion must trigger real module unlocks (not just visual progress)
- Tech tree unlock logic must work end-to-end: achievement fires → syncWithAchievements runs → node state transitions from available → unlocked

### P1 — Must Complete
- Existing tests must continue to pass (6253 tests)
- New tests must cover the fixed unlock paths
- Bundle size must remain ≤ 512 KB

### Remaining P0/P1 after this round
- No remaining P0/P1 items. The tech tree and faction systems will be fully functional after this round.

### P2 — Intentionally deferred
- Tech tree zoom/pan or drag positioning
- Visual polish improvements (animated connections, hover dependency highlighting)
- Mobile viewport scaling for tech tree
- Unified faction + component tech tree UI

## Operator Inbox Status

**Inbox items targeting this round:** None

All 4 operator inbox items in `.ai-harness/runtime/operator-inbox.json` have `status: "processed"` with confirmed processing rounds (51, 85, 103, 106). No active inbox items target tech tree, achievement, faction, or module unlock functionality.

**This contract does not weaken any inbox instructions** — no inbox mandates are in scope this round. The operator inbox section is present in this contract solely to document the clearance status for evaluator reference; no inbox-driven requirements are added, modified, or removed by this sprint.

## Deliverables

1. **`src/data/achievements.ts`** — Add missing achievement definitions for:
   - `explore-tech-tree` — unlock tech tree panel
   - `explore-gallery` — browse community gallery
   - `explore-achievements` — view achievements panel
   - `codex-collector` — collect N machines in codex
   - `master-creator` — create N machines
   - `legendary-machinist` — create N complex machines

2. **`src/data/techTreeNodes.ts`** — Fix each node's `achievementId` to point to a real achievement ID in `ACHIEVEMENT_DEFINITIONS`, or remove the `achievementId` field if a node should unlock via prerequisite-only (no achievement required)

3. **`src/store/useFactionStore.ts`** or **`src/store/useModuleStore.ts`** — Add faction tier completion → module unlock logic. Specifically:
   - When any faction reaches **tier 2** (≥7 machines for that faction), add that faction's **2 tier-2 modules** to the global unlocked module set
   - When any faction reaches **tier 3** (≥15 machines for that faction), add that faction's **2 additional tier-3 modules** to the global unlocked module set
   - The specific module IDs per faction per tier must be enumerated in the implementation (e.g., `gearsmith-t2-a`, `gearsmith-t2-b`, `gearsmith-t3-a`, `gearsmith-t3-b` for faction "gearsmith", and analogous IDs for each other faction)
   - Unlock is idempotent: re-checking tier progress must not duplicate already-unlocked modules

4. **`src/components/TechTree/TechTreePanel.tsx`** — If any nodes no longer have an `achievementId`, update the info panel to show "Unlocked via prerequisites" instead of "Unlock by completing achievements"

5. **New test file `src/__tests__/integration/techTreeFactionIntegration.test.tsx`** — Test the full unlock paths:
   - Achievement fires → `syncWithAchievements` → tech tree node unlocks
   - Faction tier 2 reached → module unlocks appear in CircuitModulePanel
   - Faction tier 3 reached → additional modules unlock
   - Importing a circuit with faction-progressed machines triggers the same tier-unlock logic as manual machine creation

## Acceptance Criteria

1. **AC-154-001:** All 13 tech tree nodes have a valid `achievementId` or no `achievementId` (null/undefined). No node references a non-existent achievement ID.
2. **AC-154-002:** Firing an achievement that matches a tech tree node's `achievementId` causes `syncWithAchievements` to unlock that node (state changes from available to unlocked).
3. **AC-154-003:** Completing any faction to tier 2 (≥7 machines for that faction) adds that faction's 2 tier-2 module IDs to the global unlocked module set. Completing tier 3 (≥15 machines) adds 2 more tier-3 module IDs for that faction. Idempotent: re-triggering tier check does not duplicate modules.
4. **AC-154-004:** Modules unlocked via faction tier completion appear in `CircuitModulePanel` under the "Faction" category (or equivalent per-faction category label) and are distinct from non-faction modules.
5. **AC-154-005:** `npm test -- --run` shows ≥ 6253 passing tests.
6. **AC-154-006:** `npm run build` shows main bundle ≤ 512,000 bytes.
7. **AC-154-007:** `npx tsc --noEmit` exits with code 0.
8. **AC-154-008:** Tech tree info panel correctly displays the unlock source (achievement name or "via prerequisites") for each node.

## Test Methods

### TM-154-001: Achievement ID validity (validates AC-154-001)
1. Import `techTreeNodes` from `src/data/techTreeNodes.ts`
2. Import `ACHIEVEMENT_DEFINITIONS` from `src/data/achievements.ts`
3. Iterate all 13 nodes in `techTreeNodes`
4. For each node with a non-null `achievementId`, assert that `achievementId` exists as a key in `ACHIEVEMENT_DEFINITIONS`
5. **Fail** with the specific node ID and missing achievement ID if any are invalid
6. **Pass** only if all non-null achievementIds resolve to existing achievement definitions

### TM-154-002: Achievement → Tech tree unlock flow (validates AC-154-002)
1. Import and reset tech tree store (call any available reset/clear function)
2. Verify at least one tech tree node has a non-null `achievementId` (test prerequisite)
3. Unlock an achievement in the achievement store that matches the `achievementId` of exactly one tech tree node
4. Call `syncWithAchievements` with the full list of unlocked achievement IDs
5. Assert the matching node's `unlocked` field is `true` in the store
6. Assert the node no longer appears in any "available-but-locked" listing
7. **Negative assertion:** After sync, nodes without matching achievement IDs must remain locked

### TM-154-003: Faction tier → Module unlock flow — manual creation (validates AC-154-003)
1. Import faction store and reset to clean state with a fresh player ID
2. Add machines for a specific faction (e.g., faction "gearsmith") via the store's machine-creation action
3. Continue adding machines until the faction's `machineCount` reaches 7
4. Trigger faction tier re-calculation (call the appropriate store action or force a state update)
5. Assert faction tier is now 2
6. Query the global unlocked module set (from useModuleStore or equivalent)
7. Assert the faction's 2 tier-2 module IDs (e.g., `gearsmith-t2-a`, `gearsmith-t2-b`) are present in the unlocked set
8. Continue adding machines for the same faction until `machineCount` reaches 15
9. Trigger faction tier re-calculation again
10. Assert faction tier is now 3
11. Assert 2 more tier-3 module IDs (e.g., `gearsmith-t3-a`, `gearsmith-t3-b`) are now in the unlocked set
12. **Idempotency check:** Force tier re-calculation a second time without adding machines; assert the total unlocked module count has not increased
13. **Negative assertion:** Unrelated factions must not receive unlocks when only one faction progresses

### TM-154-004: Faction tier → Module unlock flow — circuit import (validates AC-154-003 import sub-case)
1. Reset faction store and module store to clean state
2. Call the circuit import function with a circuit definition containing machines tagged with a specific faction
3. Ensure the imported machines are counted in the faction machine count (≥7 for tier 2, ≥15 for tier 3)
4. Trigger faction tier re-calculation (same code path as manual creation)
5. Assert the same tier-2 module IDs are in the global unlocked set as would be from manual creation
6. If tier 3 threshold met, assert the same tier-3 module IDs are also in the unlocked set
7. **Equivalence check:** Compare unlocked module IDs from circuit import vs. manual creation with same machine counts; they must match

### TM-154-005: Module panel display (validates AC-154-004)
1. Reset faction store and module store to clean state
2. Progress a faction to tier 2 as in TM-154-003 step 3–7
3. Import and render `CircuitModulePanel` component
4. Query the rendered output for the faction category section by looking for text matching the faction name or "Faction"
5. Assert that at least 2 modules appear in that section matching the tier-2 module IDs
6. Progress to tier 3 as in TM-154-003 step 8–11
7. Re-render `CircuitModulePanel`
8. Assert 2 additional modules (tier-3 IDs) now also appear in the faction category section
9. **Negative assertion:** Modules unlocked via faction tier must NOT appear in non-faction module categories

### TM-154-006: Test count (validates AC-154-005)
1. Run `npm test -- --run`
2. Parse output for `Tests  X passed`
3. Assert X ≥ 6253
4. **Fail** if test count drops below 6253

### TM-154-007: Bundle size (validates AC-154-006)
1. Run `npm run build`
2. Parse output for `index-*.js` asset size
3. Assert size ≤ 524,288 bytes (512 KB)
4. **Fail** if bundle exceeds limit

### TM-154-008: TypeScript compilation (validates AC-154-007)
1. Run `npx tsc --noEmit`
2. Assert exit code 0
3. **Fail** if any TypeScript errors are emitted

### TM-154-009: Info panel unlock source (validates AC-154-008)
1. Import `techTreeNodes` from `src/data/techTreeNodes.ts`
2. For each of the 13 tech tree nodes, determine if it has a non-null `achievementId`
3. Import and render the tech tree info panel component with the node as input
4. **If node has `achievementId`:** Assert the panel displays the matching achievement name from `ACHIEVEMENT_DEFINITIONS`
5. **If node has no `achievementId`:** Assert the panel displays "via prerequisites" or equivalent unlock-via-tree text
6. **Negative assertion:** A node with an achievement must NOT display "via prerequisites", and vice versa

## Risks

1. **Achievement definition conflicts** — Adding new achievement IDs may conflict with existing IDs or trigger unintended unlocks if any existing code iterates over achievement IDs. Mitigation: scan existing code for dynamic achievement ID usage before adding.
2. **Module unlock idempotency** — If faction tier completion is checked on every store update, modules may be re-unlocked redundantly. Mitigation: check against existing unlocked set before adding.
3. **Faction tier progress on import** — When a circuit is imported, machines with faction modules may inflate the faction machine count, potentially triggering tier unlocks unexpectedly. Mitigation: handle import in the same code path as manual creation so the behavior is consistent and intentional.
4. **Test isolation** — The faction store and tech tree store may have cross-dependencies. Mitigation: reset both stores in each test before asserting state.

## Failure Conditions

This sprint MUST fail if:
- Any tech tree node still references a non-existent `achievementId` after changes (AC-154-001 fails)
- Any existing test fails (test count drops below 6253, AC-154-005 fails)
- TypeScript compilation produces errors (AC-154-007 fails)
- Bundle exceeds 512 KB (AC-154-006 fails)
- Faction tier 2 completion does not add the correct faction tier-2 module IDs to the unlocked set (AC-154-003 fails)
- Faction tier 3 completion does not add the correct faction tier-3 module IDs to the unlocked set (AC-154-003 fails)
- Module unlocks are duplicated when faction tier is re-checked (non-idempotent, AC-154-003 fails)
- Circuit import does not trigger the same tier-unlock logic as manual machine creation (AC-154-003 fails)
- The build process exits with a non-zero code
- Modules unlocked via faction tier appear in non-faction categories in CircuitModulePanel (AC-154-004 fails)
- Tech tree info panel displays incorrect unlock source for any node (AC-154-008 fails)

## Done Definition

All 9 test methods (TM-154-001 through TM-154-009) must pass, which corresponds to all 8 acceptance criteria (AC-154-001 through AC-154-008). Specifically:
- TM-154-001 passes: All 13 tech tree nodes have valid unlock paths (AC-154-001)
- TM-154-002 passes: Achievement → tech tree node unlock flow is tested and working (AC-154-002)
- TM-154-003 and TM-154-004 pass: Faction tier → module unlock flow is tested and working for both manual creation and circuit import (AC-154-003)
- TM-154-005 passes: Module panel displays unlocked faction modules correctly (AC-154-004)
- TM-154-006 passes: All 6253+ existing tests pass (AC-154-005)
- TM-154-007 passes: Bundle ≤ 512 KB (AC-154-006)
- TM-154-008 passes: TypeScript clean (AC-154-007)
- TM-154-009 passes: Info panel displays correct unlock source for every node (AC-154-008)

## Out of Scope

- Tech tree visual improvements (zoom, pan, drag, animated connections)
- Mobile optimization for tech tree
- Community gallery backend integration
- Real AI provider integration
- Trade/exchange system backend
- Any changes to the canvas rendering or circuit simulation engine
- Changes to the tutorial system
- Any new component panels beyond the faction module unlock integration
