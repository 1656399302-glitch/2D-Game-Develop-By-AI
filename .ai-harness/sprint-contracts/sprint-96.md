# Sprint Contract — Round 96 (REVISION REQUIRED)

## Scope

This sprint adds comprehensive test coverage for three untested stores identified in the Code Quality Audit (Round 87): `useCommunityStore`, `useFactionReputationStore`, and `useMachineTagsStore`. These stores are critical for community features, faction progression, and machine organization but lack unit tests. Adding test coverage prevents regressions and ensures core workflows function correctly.

## Spec Traceability

### P0 items covered this round
- **AC-COMMUNITY-001**: Community store publish flow works correctly
- **AC-COMMUNITY-002**: Community store gallery open/close works correctly
- **AC-COMMUNITY-003**: Community store like/view tracking works correctly
- **AC-COMMUNITY-004**: Community store filtering and sorting works correctly
- **AC-REPUTATION-001**: Faction reputation add/get/reset operations work correctly
- **AC-REPUTATION-002**: Faction research queue management works correctly
- **AC-REPUTATION-003**: Faction tech bonus calculations work correctly
- **AC-TAGS-001**: Machine tag CRUD operations work correctly
- **AC-TAGS-002**: Machine tag persistence and hydration works correctly

### P1 items covered this round
- Integration between stores (factions → reputation → tech bonuses)
- Edge cases (empty states, null values, boundary conditions)

### Remaining P0/P1 after this round
- All critical stores will have test coverage
- No P0/P1 items identified as unresolved

### P2 intentionally deferred
- Visual regression testing
- E2E tests with Playwright
- Storybook component documentation

## Deliverables

1. **`src/__tests__/useCommunityStore.test.ts`** — 30+ tests for community gallery functionality
2. **`src/__tests__/useFactionReputationStore.test.ts`** — 40+ tests for faction reputation and research system
3. **`src/__tests__/useMachineTagsStore.test.ts`** — 20+ tests for machine tagging functionality (expand existing 16 tests to 20+)
4. Updated test count in documentation

## Acceptance Criteria

1. **AC-COMMUNITY-001**: Publishing a machine creates entry in `publishedMachines` array with correct structure
2. **AC-COMMUNITY-002**: Opening gallery sets `isGalleryOpen` to true; closing sets to false
3. **AC-COMMUNITY-003**: `likeMachine(id)` increments likes for matching machine; `viewMachine(id)` increments views for mock machines only
4. **AC-COMMUNITY-004**: `setSearchQuery`, `setFactionFilter`, `setRarityFilter`, `setSortOption` all filter results correctly
5. **AC-REPUTATION-001**: `addReputation(factionId, points)` increments points; `getReputation(factionId)` returns correct value; `resetReputation(factionId)` resets to 0
6. **AC-REPUTATION-002**: `researchTech(techId, factionId)` returns 'ok' when conditions met, 'locked' when insufficient rep, 'queue_full' when >3 active, 'already_researching' when already in progress
7. **AC-REPUTATION-003**: `getTechBonus(moduleType, statType)` returns correct tier bonus; `getTotalTechBonus` sums multiple faction bonuses
8. **AC-TAGS-001**: `addTag`, `removeTag`, `updateTag`, `getTags` all operate correctly on machine entries
9. **AC-TAGS-002**: Tags persist across hydration; `hydrateMachineTagsStore` restores state correctly
10. **Regression**: All existing tests continue to pass
11. **Regression**: Build size remains ≤ 545KB
12. **Regression**: TypeScript compilation succeeds with 0 errors

## Test Methods

### Community Store Tests (`useCommunityStore.test.ts`)

**Entry point:**
```bash
npx vitest run src/__tests__/useCommunityStore.test.ts
```

**Assertions:**
1. Create store instance, call `publishMachine('TestAuthor')`, assert `publishedMachines.length === 1`
2. Call `openGallery()`, assert `isGalleryOpen === true` via selector
3. Call `closeGallery()`, assert `isGalleryOpen === false` via selector
4. Call `likeMachine('mock-1')`, assert machine likes incremented
5. Call `setFactionFilter('void')`, assert `factionFilter === 'void'`
6. Call `setSortOption('popular')`, assert `sortOption === 'popular'`
7. Call `getFilteredMachinesList()`, assert returns array of matching machines

**Negative assertions:**
- `likeMachine` on non-mock machine should not persist (idempotent)
- Publishing without `pendingMachine` should be no-op
- Empty search query should return all non-filtered machines

### Faction Reputation Store Tests (`useFactionReputationStore.test.ts`)

**Entry point:**
```bash
npx vitest run src/__tests__/useFactionReputationStore.test.ts
```

**IMPORTANT - Tech Requirements Verification:**
Per `src/types/factions.ts`:
```typescript
export const TECH_TREE_REQUIREMENTS = {
  1: 3,   // Tier 1 requires 3 points
  2: 7,   // Tier 2 requires 7 points  
  3: 15,  // Tier 3 requires 15 points
};
```

**Assertions:**
1. Call `addReputation('void', 100)`, assert `getReputation('void') === 100`
2. Call `resetReputation('void')`, assert `getReputation('void') === 0`
3. Add 2500 points to 'void', assert `getReputationLevel('void') === 'grandmaster'`
4. Call `researchTech('void-tier-1', 'void')` with 10+ rep (meets 3-point requirement), assert returns 'ok'
5. Call `researchTech('void-tier-1', 'void')` with 2 rep (below 3-point requirement), assert returns 'locked'
6. Verify 4 active researches, call `researchTech('extra', 'void')`, assert returns 'queue_full'
7. Call `completeResearch('void-tier-1', 'void')`, assert tech appears in completedResearch
8. Verify 'void-tier-1' completed, call `getTechBonus('CoreFurnace', 'power_output')`, assert returns 0.05
9. Complete 'void-tier-2' and 'void-tier-3', verify `getTechBonus('CoreFurnace', 'power_output')` returns 0.15 (tier 3 replaces tier 1/2, not stacks)
10. Call `getTotalTechBonus(['CoreFurnace', 'AmplifierCrystal'], 'power_output')`, assert returns sum from each faction's highest tier

**Negative assertions:**
- Researching already-completed tech returns 'already_researching'
- Researching without valid techId returns 'locked'
- Reset with zero current reputation should not go negative

### Machine Tags Store Tests (`useMachineTagsStore.test.ts`)

**Entry point:**
```bash
npx vitest run src/__tests__/useMachineTagsStore.test.ts
```

**Assertions:**
1. Call `addTag('machine-1', 'favorite', '#ff0000')`, assert tag exists in store (verify via getTags)
2. Call `removeTag('machine-1', 'favorite')`, assert tag removed
3. Call `updateTag('machine-1', 'favorite', newColor='#00ff00')`, assert tag updated (via remove + add)
4. Call `getTags('machine-1')`, assert returns array of machine's tags
5. Add tags until exceeding `MAX_TOTAL_TAGS` (100), assert rejection
6. Clear store, call `hydrateMachineTagsStore()`, assert state restored

**Negative assertions:**
- Removing non-existent tag should not throw
- Empty machine ID should return empty array
- Duplicate tag name should be rejected

## Risks

1. **Store complexity**: `useFactionReputationStore` has cross-store dependencies (`useFactionStore`) that may require mocking via `vi.mock()`
2. **Hydration timing**: Stores use `skipHydration: true`; tests must handle manual hydration correctly with `hydrateXStore()` helpers
3. **Research timer**: Research completion depends on elapsed time; tests should mock timestamps if testing time-based behavior
4. **Mutable state in tests**: Each test must reset store state via `useStore.setState({...})` to prevent cross-test pollution

## Failure Conditions

1. Any new test file fails (non-zero exit code from vitest)
2. Existing tests fail
3. TypeScript compilation produces errors
4. Build size exceeds 545KB
5. Test count increases by less than 90 tests total

## Done Definition

All of the following must be true before claiming completion:

1. `npx vitest run src/__tests__/useCommunityStore.test.ts` exits with code 0
2. `npx vitest run src/__tests__/useFactionReputationStore.test.ts` exits with code 0
3. `npx vitest run src/__tests__/useMachineTagsStore.test.ts` exits with code 0
4. `npx vitest run` (full suite) exits with code 0, total tests ≥ original + 90 minimum
5. `npm run build` completes successfully with bundle ≤ 545KB
6. `npm run build` produces 0 TypeScript errors
7. Each acceptance criterion has at least one corresponding test assertion
8. **CORRECTED**: All researchTech tests use actual requirements (tier-1=3, tier-2=7, tier-3=15 points)

## Out of Scope

- Adding new features or modifying existing functionality
- Visual regression testing or screenshot comparisons
- E2E testing with browser automation
- Component-level integration tests (store tests only)
- Changes to test infrastructure or vitest configuration
- Refactoring existing code outside of test files

## Revision Notes

Round 96 revision corrects the following:
1. **AC-REPUTATION-002 assertions corrected**: Changed "500+ rep" and "100 rep" to use actual tech requirements (3 points for tier-1)
2. **Assertion 4**: Now uses "10+ rep" which exceeds the 3-point tier-1 requirement
3. **Assertion 5**: Now uses "2 rep" which is below the 3-point tier-1 requirement
4. Added clarification about `TECH_TREE_REQUIREMENTS` values in Test Methods section
