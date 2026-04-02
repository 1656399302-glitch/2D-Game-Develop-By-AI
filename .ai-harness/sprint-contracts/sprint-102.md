APPROVED

# Sprint Contract — Round 102

## Scope

Complete the Recipe System integration by ensuring all unlock conditions are properly checked across stores and recipes are discovered when conditions are met. This connects the existing recipe store, unlock logic, and UI into a functional system.

## Spec Traceability

### P0 items covered this round
- **Recipe unlock condition checking** — verify existing methods (`checkChallengeUnlock`, `checkChallengeCountUnlock`, `checkMachinesCreatedUnlock`, `checkActivationCountUnlock`, `checkTechLevelUnlocks`) work correctly
- **Machine creation integration** — MachineStore must call recipe store when machines are saved to codex
- **Activation counter integration** — ActivationStore must call recipe store on machine activations
- **Tech research completion integration** — FactionReputationStore must call recipe store when research completes
- **Recipe discovery toast notifications** — verify toast triggers when conditions are met
- **ModulePreview verification** — all module types render correctly in recipe cards

### P1 items covered this round
- Recipe browser filtering by unlock status (already exists in RecipeBrowser)
- Faction variant recipe unlock conditions (faction variants use `challenge_complete` with value `'faction-grandmaster'`)

### Remaining P0/P1 after this round
- Tutorial store integration for tutorial_complete recipes (optional, Core Furnace recipe may not require explicit tutorial)
- Challenge store already calls recipe unlock for `reward.type === 'recipe'` — confirmed working

### P2 intentionally deferred
- Recipe sharing/community features
- Recipe achievements integration
- Recipe achievement badges
- Recipe-based challenges

---

## Scope Alignment Confirmation

### Recipe Definitions — Confirmed
**Total recipes in scope: 19**
- 15 base recipes in `src/data/recipes.ts` (RECIPE_DEFINITIONS)
- 4 faction variant recipes defined in `src/components/Recipes/RecipeBrowser.tsx` (FACTION_VARIANT_RECIPES)

**Recipe list:**
1. Core Furnace (tutorial_complete)
2. Energy Pipe (challenge_complete: challenge-001)
3. Arcane Gear (challenge_complete: challenge-002)
4. Rune Node (challenge_complete: challenge-003)
5. Shield Shell (challenge_complete: challenge-004)
6. Trigger Switch (challenge_complete: challenge-005)
7. Output Array (challenge_complete: challenge-006)
8. Amplifier Crystal (machines_created: 5)
9. Stabilizer Core (challenge_complete: challenge-007)
10. Void Siphon (activation_count: 50)
11. Phase Modulator (tech_level: void-t3)
12. Resonance Chamber (machines_created: 3)
13. Fire Crystal (activation_count: 10)
14. Lightning Conductor (challenge_count: 3)
15. Dimension Rift Generator (tech_level: void-t2 OR storm-t1)
16. Void Arcane Gear (faction variant — Grandmaster)
17. Inferno Blazing Core (faction variant — Grandmaster)
18. Storm Thundering Pipe (faction variant — Grandmaster)
19. Stellar Harmonic Crystal (faction variant — Grandmaster)

### Unlock Types Implemented
- `challenge_complete` — ChallengeStore already calls recipe unlock
- `challenge_count` — checkChallengeCountUnlock exists
- `machines_created` — needs MachineStore integration
- `tutorial_complete` — checkTutorialUnlock exists
- `activation_count` — needs ActivationStore integration
- `connection_count` — defined but no current recipes use it
- `tech_level` — needs FactionReputationStore integration

### Module Types in Recipe System
**15 base module types + 4 faction variants = 19 total**
- core-furnace, energy-pipe, gear, rune-node, shield-shell, trigger-switch, output-array
- amplifier-crystal, stabilizer-core, void-siphon, phase-modulator
- resonance-chamber, fire-crystal, lightning-conductor
- void-arcane-gear, inferno-blazing-core, storm-thundering-pipe, stellar-harmonic-crystal

---

## Deliverables

### 1. New/Modified Files

| File | Action | Description |
|------|--------|-------------|
| `src/store/useMachineStore.ts` | Enhance | Add integration call to recipe store when machines are saved |
| `src/store/useActivationStore.ts` | Enhance | Add integration call to recipe store on machine activation |
| `src/store/useFactionReputationStore.ts` | Enhance | Add integration call to recipe store on research completion |
| `src/store/useRecipeStore.ts` | Verify | Ensure all check methods work; no changes likely needed |
| `src/__tests__/recipeIntegration.test.ts` | New | Tests for cross-store integration |

### 2. Component Outputs
- RecipeBrowser with functional unlock filtering (already exists)
- RecipeDiscoveryToast triggers when new recipes are unlocked
- ModulePreview renders all 19 module types correctly (already handles 15 base + 4 variants)

### 3. Script Outputs
- Recipe store hydration on app initialization
- Automatic recipe unlock checking on relevant actions

---

## Acceptance Criteria

### AC-RECIPE-001: Challenge completion triggers recipe check
**Given** a user completes a challenge
**When** the challenge completion is registered
**Then** the recipe store's `checkChallengeUnlock()` is called with the challenge ID
**And** if the condition is met, the recipe is marked as discovered
**And** a discovery toast is shown

### AC-RECIPE-002: Machine creation triggers recipe check
**Given** a user creates a machine (saves to codex)
**When** the save is completed
**Then** the recipe store's `checkMachinesCreatedUnlock()` is called with the current count
**And** if the threshold is met (3 for Resonance Chamber, 5 for Amplifier Crystal), the recipe is marked as discovered

### AC-RECIPE-003: Machine activation triggers recipe check
**Given** a user activates a machine
**When** the activation completes (any state: active, overload, failure, shutdown)
**Then** the recipe store's `checkActivationCountUnlock()` is called
**And** if the threshold (10 for Fire Crystal, 50 for Void Siphon) is met, the recipe is unlocked

### AC-RECIPE-004: Tech research completion triggers recipe check
**Given** a user completes a faction tech research tier
**When** the research is registered
**Then** the recipe store's `checkTechLevelUnlocks()` is called
**And** if any recipes require that tech level, they are unlocked
**And** if the recipe requires a higher tier, it remains locked

### AC-RECIPE-005: Faction rank triggers faction variant unlock
**Given** a user reaches Grand Master rank (2000+ reputation) in any faction
**When** the rank is achieved
**Then** the faction variant recipe is unlocked
**And** the user can filter by faction in the recipe browser

### AC-RECIPE-006: Recipe browser shows correct unlock status
**Given** a user opens the recipe browser
**When** they filter by "unlocked" or "locked"
**Then** only recipes matching that filter are shown
**And** locked recipes show their unlock hint

### AC-RECIPE-007: ModulePreview renders all module types
**Given** a recipe card is displayed
**When** it references any of the 19 module types
**Then** ModulePreview correctly renders the SVG for that module
**And** no missing module type errors occur

### AC-RECIPE-008: Recipe state persists across sessions
**Given** a user unlocks recipes in a session
**When** they refresh the page
**Then** the unlocked recipes remain unlocked
**And** no duplicate toast notifications appear

---

## Test Methods

### TM-RECIPE-001: Challenge integration test
1. Create a mock ChallengeStore with a completed challenge (challenge-001)
2. Call `checkChallengeUnlock('challenge-001')`
3. Verify the Energy Pipe recipe is marked as unlocked
4. Assert the pendingDiscoveries array contains the recipe ID

### TM-RECIPE-002: Machine creation test
1. Mock MachineStore with 5 saved machines
2. Call `checkMachinesCreatedUnlock(5)`
3. Verify the Amplifier Crystal recipe is unlocked
4. Verify the Resonance Chamber recipe is unlocked (threshold is 3)
5. Verify the Core Furnace recipe is NOT affected by this check

### TM-RECIPE-003: Activation counter test
1. Mock activation count at 10
2. Call `checkActivationCountUnlock(10)`
3. Verify the Fire Crystal recipe is unlocked (threshold is 10)
4. Mock activation count at 50
5. Call `checkActivationCountUnlock(50)`
6. Verify the Void Siphon recipe is unlocked (threshold is 50)

### TM-RECIPE-004: Tech research test
1. Mock FactionReputationStore with `void-tier-3` completed
2. Call `checkTechLevelUnlocks()`
3. Verify Phase Modulator recipe is unlocked
4. Mock FactionReputationStore with `void-tier-2` completed (not tier-3)
5. Verify Phase Modulator is NOT unlocked
6. Verify Dimension Rift Generator is NOT unlocked (requires void-t2 OR storm-t1, not t3)

### TM-RECIPE-005: Faction variant test
1. Mock FactionReputationStore with `void` at Grandmaster rank
2. Call `checkChallengeUnlock('faction-grandmaster')` with faction context
3. Verify the Void Arcane Gear recipe is unlocked
4. Repeat for each faction variant

### TM-RECIPE-006: Recipe browser filter test
1. Render RecipeBrowser with some unlocked, some locked recipes
2. Click "Unlocked" filter
3. Assert only unlocked recipes are visible
4. Click "Locked" filter
5. Assert only locked recipes are visible
6. Click "Faction Variants" filter
7. Assert only faction variant recipes are visible

### TM-RECIPE-007: ModulePreview test
1. Render each of the 19 module type recipe cards
2. For each, verify ModulePreview component renders without error
3. Assert the correct SVG is displayed for each module type
4. Verify unknown module types render the fallback "?" icon

### TM-RECIPE-008: Persistence test
1. Unlock several recipes in a test
2. Trigger state persistence
3. Reset the store to initial state
4. Re-hydrate the store
5. Assert previously unlocked recipes remain unlocked

---

## Risks

### R1: Circular dependency between stores
**Risk**: Recipe store imports from FactionReputationStore, other stores may import recipe store
**Mitigation**: Use event-based triggers from other stores, or pass data as parameters without importing the store directly

### R2: React hook rules violation
**Risk**: Integration functions called outside of React components may violate hook rules
**Mitigation**: Call integration functions inside components using the stores, or use store actions directly

### R3: ModulePreview component missing module types
**Risk**: ModulePreview might not handle all 19 module types
**Mitigation**: Check ModulePreview implementation and add missing types if needed

### R4: Store hydration timing
**Risk**: Recipe store may hydrate after other stores check unlock conditions
**Mitigation**: Ensure stores call integration methods after hydration is complete

---

## Failure Conditions

### FC-1: Recipe unlock not triggering
**Condition**: Completing a challenge does not unlock the expected recipe
**Meaning**: Round must fail

### FC-2: Duplicate unlock notifications
**Condition**: Same recipe triggers discovery toast multiple times
**Meaning**: Round must fail

### FC-3: Module preview errors
**Condition**: Any recipe card with a module type causes a rendering error
**Meaning**: Round must fail

### FC-4: Persistence breaking
**Condition**: Unlocked recipes don't persist across page refresh
**Meaning**: Round must fail

### FC-5: Missing integration
**Condition**: Machine creation/activation/tech completion does not trigger recipe checks
**Meaning**: Round must fail

### FC-6: Test failures
**Condition**: Any of the 8 integration tests fail
**Meaning**: Round must fail

---

## Done Definition

All of the following must be true before claiming round complete:

1. ✅ `src/store/useMachineStore.ts` calls recipe integration when machines are saved
2. ✅ `src/store/useActivationStore.ts` calls recipe integration on machine activation
3. ✅ `src/store/useFactionReputationStore.ts` calls recipe integration on research completion
4. ✅ `src/__tests__/recipeIntegration.test.ts` contains 8 passing tests
5. ✅ RecipeBrowser correctly filters by unlock status (unlocked/locked/faction)
6. ✅ ModulePreview renders all 19 module types without errors
7. ✅ Recipe state persists across page refresh
8. ✅ No circular dependencies introduced between stores

---

## Out of Scope

- Adding new recipe definitions (19 are sufficient for MVP)
- Recipe achievement badges (future feature)
- Recipe sharing/export (future feature)
- Recipe-based challenges (future feature)
- AI naming integration enhancement (separate feature track)
- Visual enhancements to recipe cards (keep current design)
- Faction tech tree UI implementation (future feature)
- Challenge mode rewards system (rewards only, unlock logic is scope)
- Tutorial store integration (Core Furnace available from start)
- **ANY unrelated project scope or feature expansion**

---

## Dependencies

- Recipe store (`src/store/useRecipeStore.ts`) - already exists
- Recipe definitions (`src/data/recipes.ts`) - already exists
- Recipe browser UI (`src/components/Recipes/RecipeBrowser.tsx`) - already exists
- ModulePreview component (`src/components/Modules/ModulePreview.tsx`) - already exists
- Challenge store (`src/store/useChallengeStore.ts`) - already integrated
- Machine store (`src/store/useMachineStore.ts`) - needs integration
- FactionReputation store (`src/store/useFactionReputationStore.ts`) - needs integration
- Activation store (`src/store/useActivationStore.ts`) - needs integration
