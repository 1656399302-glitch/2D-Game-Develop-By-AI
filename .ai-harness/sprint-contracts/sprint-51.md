# Sprint Contract — Round 51

## Scope

This sprint focuses on **Faction Tech Tree Enhancement** — deepening the integration between the Tech Tree system and the rest of the game mechanics to create meaningful progression. The goal is to make faction research feel impactful by connecting completed tech to actual gameplay benefits.

> ⚠️ **Operator Inbox — Mandatory Testing Standards**: This round must test ALL functional models with strictest standards. **Specifically required**: module↔module interactions (cross-faction bonus aggregation, independent faction bonus persistence) and UI interactions (tooltip open/close/reopen, badge updates, panel state). **Any bugs found must be fixed before claiming round complete.** This is not optional.

> ⚠️ **Browser Testing Environment Note**: The welcome modal (z-index 1100) has been documented to intercept test environment interactions. Ensure any browser testing accounts for this — either by dismissing the modal first or by using alternative verification paths (store inspection, component state checks, or localStorage verification).

## Spec Traceability

### P0 Items (Core Features)
- **Tech Tree Bonus System**: Researched tech tiers provide tangible bonuses to machines
- **Tech-Recipe Integration**: Certain recipes require minimum tech levels to unlock
- **Tech-Challenge Integration**: Challenge difficulty scales with faction tech levels

### P1 Items (Polish & Verification)
- **Bonus Visualization**: Visual feedback in machine editor showing active tech bonuses
- **Tech Tooltip Enhancement**: Detailed descriptions of what each tech tier unlocks
- **Progress Persistence**: Tech completion state survives browser refresh

### Remaining P0/P1 After This Round
- **P0 Complete**: All major systems (Editor, Connections, Activation, Codex, AI, Exchange, Challenges, Recipe, Tech Tree)
- **P1 Remaining**: Some polish items may continue in future rounds (sharing enhancements, community features)

### P2 Intentionally Deferred
- Advanced AI integration with real API
- Multiplayer collaboration features
- Extended faction storylines

---

## Deliverables

### 1. Faction Tech Tree Bonus System (`src/store/useFactionReputationStore.ts`)
- `getTechBonus(moduleType: string, statType: string): number` — Calculate bonus from completed tech for a given module's faction
- `getUnlockedTechTiers(factionId: FactionId): number` — Get highest completed tier for a faction (1, 2, or 3; 0 if none)
- Bonus types: power_output, stability, energy_efficiency, glow_intensity, animation_speed
- **Bonus magnitude: Per-faction highest-tier bonus only (NOT cumulative across tiers)**
  - No completed tech → 0
  - T1 complete only → +5%
  - T1+T2 complete → +10% (T2 replaces T1, does not stack)
  - T1+T2+T3 complete → +15% (T3 replaces T2, does not stack)
- Bonus applies per faction: a machine with modules from multiple factions receives each faction's bonus independently, summed together

### 2. Tech-Recipe Integration (`src/data/recipes.ts`, `src/store/useRecipeStore.ts`)
- New unlock condition type: `tech_level`
- Single condition: `value: 'void-t3'` — requires exactly that tier completed
- OR condition: `value: ['void-t2', 'storm-t1']` — requires at least one of those tiers completed
- Recipe hint shows required tech tier when locked ("Requires: Void T3")
- **Recipes must RELOCK when the required tech is reset** (negative test required)

### 3. Tech-Challenge Integration (`src/data/challenges.ts`, `src/store/useChallengeStore.ts`)
- Challenge difficulty multiplier based on highest completed tech tier across all factions used in the machine (not average)
- Bonus reputation = `baseReputation * (1 + 0.1 * highestTechTierUsed)`
- **New "Tech Mastery" challenges**: Defined in `src/data/challenges.ts` as a new challenge category with `challengeType: 'tech_mastery'`. These require a minimum faction tech tier to attempt. If tech is reset below the requirement, the challenge becomes re-lockable.
- Bonus reputation for completing challenges with high-tech machines

### 4. Bonus Visualization Component (`src/components/Factions/TechBonusIndicator.tsx`)
- Small SVG badge showing active bonuses in the machine editor toolbar
- Tooltip with detailed breakdown by faction and stat
- Animated pulse when bonuses are newly applied
- Dismisses correctly on tooltip close, re-opens cleanly on re-hover

### 5. Enhanced Tech Tooltips (`src/components/Factions/TechTree.tsx`)
- Detailed description of each tier's bonuses
- Visual preview of what modules/abilities are unlocked
- Progress indicator showing current vs required reputation

### 6. Tech System Tests
- `src/__tests__/techBonus.test.ts` — 15+ tests for bonus calculation (see Test Methods below)
- `src/__tests__/techRecipeIntegration.test.ts` — 8+ tests for tech-based recipe unlocks and relocks
- `src/__tests__/techChallengeIntegration.test.ts` — 6+ tests for challenge bonus and Tech Mastery
- Update existing TechTree tests for new bonus display

---

## Acceptance Criteria

### AC1: Tech Bonus Calculation
**Criterion**: Machines with modules from factions where player has completed tech research receive stat bonuses in generated attributes.

**Verification**:
1. Create machine with 3+ Void modules
2. Complete Void T1 research
3. Check that machine's `powerOutput` is increased by 5%
4. Complete Void T2 research
5. Verify total bonus is now +10% (the T2 bonus, which replaces rather than stacks on T1)
6. Complete Void T3
7. Verify bonus is now +15%
8. Create machine with mixed factions (2 Void + 2 Inferno), verify Void T2 + Inferno T1 = +15% total bonus
9. **Module-interaction test**: With Void T1 complete, add Inferno module to existing machine; verify Inferno bonus applies without Void bonus disappearing
10. **Negative test**: Create machine with Void modules; verify no bonus if no Void tech completed

### AC2: Recipe Tech Requirements
**Criterion**: Recipes with `tech_level` unlock condition become available only when the required tech is completed, and relock when tech is reset.

**Verification**:
1. Check Phase Modulator recipe is locked initially
2. Complete Void T3 tech research
3. Verify Phase Modulator recipe is now unlocked
4. **Negative test (MUST PASS)**: Reset Void faction reputation (cancels all Void tech research)
5. Verify Phase Modulator recipe is RELOCKED
6. Complete only Void T1 (lower tier than required T3)
7. Verify recipe remains locked
8. Test OR condition: Complete `storm-t1`; verify recipe requiring `['void-t2', 'storm-t1']` unlocks
9. Test OR condition failure: Complete `void-t1` only; verify recipe requiring `['void-t2', 'storm-t1']` stays locked

### AC3: Challenge Difficulty Scaling
**Criterion**: Challenge completion with faction modules provides bonus reputation based on tech levels. Tech Mastery challenges lock/unlock based on tech tier.

**Verification**:
1. Complete "Energy Conduit" challenge with Void modules and T2 Void tech
2. Verify bonus reputation formula matches expected: `base * 1.2`
3. Verify machine stats show tech bonus applied during challenge
4. **Negative test**: Reset Void tech from T2 to T0; complete same challenge; verify bonus is `base * 1.0` (no tech bonus)
5. **Tech Mastery**: Attempt Tech Mastery challenge requiring T2; verify it is locked before T2 complete, unlocked after T2 complete
6. **UI interaction test**: Open challenge panel, select Tech Mastery challenge, verify lock state updates reactively when tech is completed

### AC4: Bonus Visualization
**Criterion**: Tech bonus indicator displays active bonuses and updates when tech is completed. Tooltip dismisses and reopens cleanly.

**Verification**:
1. Open machine editor with modules present
2. Observe bonus indicator shows "No bonuses" when no relevant tech completed
3. Complete any T1 research
4. Observe indicator updates to show new bonus with animation
5. Hover tooltip shows detailed breakdown
6. **Dismissal test**: Close tooltip by moving mouse away; reopen by hovering; verify content is correct on re-open
7. **Repeat/retry test**: Complete second T1 research; verify indicator updates again without artifacts
8. **Negative test**: Remove all modules from machine; verify indicator shows "No bonuses" cleanly

### AC5: Build & Tests Pass
**Criterion**: `npm run build` produces 0 TypeScript errors, `npm test -- --run` passes all tests.

**Verification**:
1. Run `npm run build`; confirm bundle builds successfully
2. Run `npm test -- --run`; confirm all tests pass

### AC6: State Persistence
**Criterion**: Completed tech research survives page refresh.

**Verification**:
1. Complete 2 tech researches
2. Refresh page (window.location.reload)
3. Verify researches are still marked complete in store
4. Verify bonuses still apply to machines after reload
5. **Negative test**: Complete Void T3, refresh, verify recipe that requires Void T3 is still unlocked

---

## Test Methods

### AC1: Tech Bonus Calculation (Unit Test + Browser Test)
1. **Unit Test**: `getTechBonus('void-siphon', 'powerOutput')` with no tech completed → expect 0
2. **Unit Test**: With Void T1 complete → expect 0.05
3. **Unit Test**: With Void T1+T2 complete → expect 0.10 (T2 replaces T1, does NOT stack)
4. **Unit Test**: With Void T1+T2+T3 complete → expect 0.15 (T3 replaces T2)
5. **Unit Test**: Mixed faction T1 Void + T1 Inferno → expect 0.10 total (0.05+0.05)
6. **Unit Test**: Mixed faction T2 Void + T1 Inferno → expect 0.15 total (0.10+0.05)
7. **Unit Test**: `getUnlockedTechTiers('void')` with T1+T2 complete → expect 2 (highest completed)
8. **Unit Test**: `getUnlockedTechTiers('void')` with only T2 complete → expect 2
9. **Unit Test**: `getUnlockedTechTiers('void')` with no tech → expect 0
10. **Module-interaction Test**: Add Void module to machine with existing Inferno modules; verify both faction bonuses apply
11. **Module-interaction Test**: Remove all modules of one faction; verify remaining faction bonus persists
12. **Browser Test**: Create machine visually with mixed factions, observe stats panel shows combined bonuses
13. **Negative Test**: Machine with no faction modules → expect 0 bonus regardless of tech
14. **Negative Test**: Machine with modules from faction with NO tech → expect 0 bonus for that faction
15. **Regression Test**: Verify existing machine stat calculations (without tech) are unchanged

### AC2: Recipe Tech Requirements (Unit Test + UI)
1. **Unit Test**: `isRecipeUnlocked('recipe-phase-modulator', {})` with no Void tech → false
2. **Unit Test**: With void-t3 completed → true
3. **Unit Test**: With only void-t1 completed → false (lower than required T3)
4. **Unit Test**: With storm-t1 completed for recipe requiring `['void-t2', 'storm-t1']` → true
5. **Unit Test**: With only void-t1 for OR recipe `['void-t2', 'storm-t1']` → false
6. **Regression Test (MUST)**: After completing void-t3 and verifying unlock, reset Void tech; verify unlock returns to false
7. **Regression Test**: Verify existing non-tech-condition recipes are unaffected by tech system
8. **UI Test**: Open Recipe Browser, verify locked recipe shows "Requires: Void T3" text
9. **UI Test**: Complete T3, verify recipe card animates to unlocked state
10. **UI Test**: Reset tech, verify recipe card animates back to locked state

### AC3: Challenge Difficulty Scaling (Unit Test + Integration Test)
1. **Unit Test**: Challenge bonus with 0 tech tiers → `base * 1.0`
2. **Unit Test**: Challenge bonus with T1 tech → `base * 1.1`
3. **Unit Test**: Challenge bonus with T3 tech → `base * 1.3`
4. **Unit Test**: Mixed-faction machine uses HIGHEST tier, not average: T2 Void + T1 Inferno → `base * 1.2`
5. **Integration Test**: Complete challenge with T2 machine, verify reputation matches formula
6. **Negative Test**: After tech reset (T2 → T0), complete same challenge; verify bonus resets to base
7. **Tech Mastery Test**: Verify Tech Mastery challenge `requiresTechTier: 2` is locked when faction tier < 2
8. **Tech Mastery Test**: Verify Tech Mastery challenge unlocks when faction tier reaches 2
9. **UI interaction Test**: Select Tech Mastery challenge in panel; verify lock badge updates on tech completion

### AC4: Bonus Visualization (Browser Test)
1. Open machine editor with 2+ modules from one faction
2. Open bonus indicator tooltip → should show "0 bonuses active"
3. Complete T1 tech in that faction
4. Indicator should pulse and update → "+5% Power" etc.
5. **Dismissal Test**: Move mouse away (tooltip closes); move back (tooltip reopens); verify content correct
6. **Repeat/Retry Test**: Complete second T1 in another faction; indicator should update without visual artifacts
7. **Negative Test**: Remove all modules; indicator shows "No bonuses" with clean empty state
8. **Negative Test**: Complete tech for faction with no modules on machine; indicator should NOT show bonus

### AC5: Build & Tests (CI/Local)
1. Run `npm run build` → expect success
2. Run `npm test -- --run` → expect all pass

### AC6: Persistence (Browser Test)
1. Complete 2 researches
2. Close browser tab, reopen, load app
3. Verify tech states restored from localStorage
4. Verify bonuses still apply to machines
5. **Regression Test**: Complete T3, refresh, verify recipe requiring T3 is still unlocked
6. **Regression Test**: Reset faction reputation; refresh; verify recipes relocked after reload

---

## Failure Conditions

### FC1: Build Fails
Any TypeScript compilation errors cause immediate failure.

### FC2: Test Suite Degradation
If total passing tests drop below 1752 (Round 50 baseline), round fails. New tests added must not reduce the passing count.

### FC3: Bonus Not Applied
If machine stats do not reflect tech bonuses after completing research, round fails.

### FC4: Recipe Unlock Broken
If existing recipes (non-tech-condition) become locked due to new logic, round fails.

### FC5: Recipe Relock Failure
If a recipe unlocked via `tech_level` condition does NOT relock when the required tech is reset, round fails.

### FC6: Bonus Relock Failure
If challenge bonus does NOT reset when tech is reset, round fails.

### FC7: Performance Regression
If machine editor framerate drops >20% due to bonus calculations, round fails.

### FC8: Regression — Module Interactions
If adding or removing a module from one faction causes bonus to disappear for an unrelated faction, round fails.

### FC9: Operator Inbox Bugs Not Fixed
If bugs found during testing of module↔module interactions or UI interactions are not fixed before claiming round complete, round fails. This is a hard requirement per operator inbox.

---

## Done Definition

All of the following must be true before claiming round complete:

1. **✓ Build Passes**: `npm run build` produces 0 TypeScript errors
2. **✓ Tests Pass**: `npm test -- --run` shows all tests passing (baseline 1752 + new tests must all pass)
3. **✓ Bonus System Functional**: Creating a machine with faction modules shows stat bonuses after completing corresponding tech; bonus replaces (not stacks) on tier upgrade
4. **✓ Recipe Integration Works**: Tech-level recipes unlock correctly when tech is completed AND relock when tech is reset
5. **✓ Challenge Integration Works**: Reputation bonuses apply correctly to challenge completion; Tech Mastery challenges lock/unlock with tech tier
6. **✓ Visualization Present**: Tech bonus indicator visible and interactive in UI; tooltip dismisses and reopens cleanly
7. **✓ Persistence Verified**: Tech state survives browser refresh; relock state also survives refresh
8. **✓ No Regressions**: Existing functionality (codex, exchange, challenges, recipes, etc.) all still work
9. **✓ Module-Interaction Tests Pass**: Tests verify that multi-faction machines correctly aggregate per-faction bonuses independently; removing modules of one faction does not affect bonuses for another
10. **✓ All Operator Inbox Bugs Fixed**: Any bugs found during testing of module interactions or UI interactions are resolved before claiming round complete

---

## Out of Scope

The following are explicitly **NOT** being done in this round:

- **Real AI API Integration**: Mock service continues to be used
- **New Module Types**: No new SVG modules being created
- **Community Features**: No new sharing or social features
- **Mobile Optimization**: Tech tree remains desktop-focused this round
- **Localization**: Chinese text remains; no new language support
- **Audio**: No sound effects or music
- **Multiplayer**: No collaborative features

---

## Technical Notes

### Bonus Calculation Formula
```
getTechBonus(moduleType, statType) = FACTION_BONUS_MAP[factionOf(moduleType)]
getUnlockedTechTiers(factionId) = highest completed tier number for factionId (0 if none)

FACTION_BONUS_MAP:
  - tier 0: 0
  - tier 1: 0.05
  - tier 2: 0.10   ← T2 replaces T1 (NOT T1+0.10)
  - tier 3: 0.15   ← T3 replaces T2 (NOT T1+T2+0.15)

totalMachineBonus = Σ (factionBonus for each module's faction)
  e.g., 2 Void modules (T2) + 1 Inferno module (T1) = 0.10 + 0.05 = 0.15
```

### Tech-Recipe Condition Format
```typescript
// Single requirement
{ type: 'tech_level', value: 'void-t3', description: 'Requires: Void T3 Tech' }

// OR requirement
{ type: 'tech_level', value: ['void-t2', 'inferno-t1'], description: 'Requires: Void T2 or Inferno T1 Tech' }
```

### Challenge Bonus Formula
```
challengeBonusMultiplier = 1 + 0.1 * highestTechTierUsedInMachine
  - 0 tech: 1.0x
  - T1: 1.1x
  - T2: 1.2x
  - T3: 1.3x
```

### Tech Mastery Challenge Format
```typescript
{
  id: 'tech-mastery-void-t2',
  title: 'Void T2 Mastery',
  challengeType: 'tech_mastery',  // New category
  requiresTechTier: 2,           // Must have any faction at T2 to attempt
  baseReward: 500,
  description: 'Demonstrate mastery with T2 technology',
}
```

### State Update Order
1. User completes tech → `completeResearch(techId, faction)`
2. Store updates `completedResearch`
3. `useRecipeStore` subscriptions detect changes, re-check unlocks
4. `useChallengeStore` recalculates bonus multipliers
5. `useMachineStore` recalculates bonuses on next machine render
6. UI components receive new props, re-render with updated values

### Testing Standards (per Operator Inbox)

**MANDATORY — DO NOT WEAKEN:**

- **Module↔module interactions**: 
  - Cross-faction machines must correctly aggregate bonuses per faction
  - Removing modules of one faction must NOT affect bonuses of another faction
  - Tests must explicitly verify this bidirectional independence
  
- **UI interactions**:
  - Tooltip open/close/reopen must all be testable and work correctly
  - Panel tab switching must preserve state
  - Badge updates must be visible and reactive
  - Lock states must update reactively when tech is completed
  
- **Bug fix requirement**: ALL bugs found during testing must be fixed before claiming round complete — this is not optional

### Browser Testing Environment Considerations

Per Round 50 QA feedback: The welcome modal with z-index 1100 has been documented to intercept test environment interactions. For browser verification:

1. **Primary path**: Use unit/integration tests where possible (store actions, state transitions)
2. **Alternative path**: For UI verification, ensure modal is dismissed first, or use store/localStorage inspection
3. **Fallback**: Code inspection + test suite verification when browser path is blocked
