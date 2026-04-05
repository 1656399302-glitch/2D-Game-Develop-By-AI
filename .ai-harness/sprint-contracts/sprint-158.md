APPROVED

# Sprint Contract — Round 158

## Scope

This sprint focuses on **test coverage gaps and error handling improvements** for three major untested Zustand stores. The goal is to improve code quality, reduce runtime errors, and ensure critical stores have unit test coverage.

## Spec Traceability

### P0 items covered this round
- **Core stores testing**: Add unit tests for `useFactionReputationStore.ts`, `useMachineTagsStore.ts`, and `useCommunityStore.ts` to bring test coverage in line with other stores

### P1 items covered this round
- **Console warning cleanup**: Verify SSR-safe hydration patterns in `useSubCircuitStore.ts` and `useSettingsStore.ts` (both already have `skipHydration: true` — verify these patterns are correctly integrated)

### Remaining P0/P1 after this round
- **Faction system** — Full faction UI, reputation display, research panel, faction-specific modules, faction quests/events
- **Community gallery** — Community browse/import, favorite/rating UI, template library, exchange/trade system
- **Achievement system** — Achievement panel, milestone tracking, progress display
- **Recipe discovery** — Recipe book UI, experimentation-based discovery
- **Multi-layer canvas** — Complex circuit layering, layer management
- **Timer/counter components** — Time-based and counter logic gates
- **Memory elements** — Stateful circuit components
- **Exchange/trade system** — Player-to-player trading

### P2 intentionally deferred
- Bundle splitting optimization (AI, Community, Challenge lazy loading)
- Virtualization for large machine lists (50+ modules)
- Advanced memoization for canvas rendering

## Deliverables

1. **Test file: `src/__tests__/stores/useFactionReputationStore.test.ts`**
   - Unit tests for research system (start/cancel/complete research), tech bonus calculations, reputation updates, faction bonus application, state persistence, edge cases
   - Covers all public methods: `researchTech`, `completeResearch`, `getResearchableTechs`, `getRequiredReputation`, `getCurrentResearch`, `cancelResearch`, `getUnlockedTechTiers`, `getTechBonus`, `getTotalTechBonus`, `getActiveBonusesForFaction`, `resetFactionTech`, `addReputation`, `getReputation`, `getReputationLevel`, `isVariantUnlocked`, `getReputationData`, `resetReputation`, `resetAllReputations`, `awardBonusReputation`

2. **Test file: `src/__tests__/stores/useMachineTagsStore.test.ts`**
   - Unit tests for tag CRUD operations, sanitization, search/filtering, autocomplete, state persistence, limits (max tags per machine, max total unique tags)
   - Covers all public methods: `addTag`, `removeTag`, `setTags`, `getTags`, `getAllTags`, `getAutocomplete`, `removeAllTagsForMachine`, `clearAllTags`, `hasTag`, `getMachinesByTag`, `getMachineCount`

3. **Test file: `src/__tests__/stores/useCommunityStore.test.ts`**
   - Unit tests for circuit publishing flow, browsing/filtering, favorites, ratings, pagination, search, UI state management
   - Covers all public methods: `setSearchQuery`, `setFactionFilter`, `setRarityFilter`, `setSortOption`, `openGallery`, `closeGallery`, `openPublishModal`, `closePublishModal`, `publishMachine`, `likeMachine`, `viewMachine`, `getFilteredMachinesList`

4. **Hydration verification: `src/store/useSubCircuitStore.ts` and `src/store/useSettingsStore.ts`**
   - Verify `skipHydration: true` is present and `hydrate*Store()` helper functions exist and are exported
   - No new code changes required if patterns are correctly in place

5. **Updated test count: ≥ 6388 tests**
   - 6338 (baseline from round 157) + ~50 new tests from 3 new test files

## Acceptance Criteria

1. **AC-158-001**: `npm test -- --run` exits code 0 and shows ≥ 6388 passing tests (baseline 6338 + ~50 new)

2. **AC-158-002**: All 235 test files pass with 0 failures:
   - `useFactionReputationStore.test.ts` exists and passes all tests
   - `useMachineTagsStore.test.ts` exists and passes all tests
   - `useCommunityStore.test.ts` exists and passes all tests
   - No regressions in existing 232 test files

3. **AC-158-003**: Hydration patterns verified via code review in `useSubCircuitStore.ts` and `useSettingsStore.ts`:
   - `skipHydration: true` present in persist config
   - `hydrate*Store()` helper exported from each file
   - No runtime errors introduced by persistence layer

4. **AC-158-004**: TypeScript compiles without errors — `npx tsc --noEmit` exits code 0

5. **AC-158-005**: Build succeeds — `npm run build` produces bundle ≤ 512 KB

## Test Methods

### AC-158-001 & AC-158-002: Test Count & New Tests
- **Method**: Run `npm test -- --run`
- **Verification steps**:
  1. Confirm exit code is 0
  2. Confirm `Test Files  235 passed (235)` — 232 existing + 3 new
  3. Confirm `Tests  ≥ 6388 passed (6388)` — 6338 baseline + ~50 new
  4. Confirm `useFactionReputationStore.test.ts` appears in test output with passing tests
  5. Confirm `useMachineTagsStore.test.ts` appears in test output with passing tests
  6. Confirm `useCommunityStore.test.ts` appears in test output with passing tests
  7. Confirm 0 failed test files

### AC-158-003: Hydration Pattern Verification (Code Review)
- **Method**: Inspect source files directly
- **Verification steps**:
  1. Open `src/store/useSubCircuitStore.ts` and confirm `skipHydration: true` exists in persist config
  2. Confirm `hydrateSubCircuitStore` or equivalent helper is exported
  3. Open `src/store/useSettingsStore.ts` and confirm `skipHydration: true` exists in persist config
  4. Confirm `hydrateSettingsStore` or equivalent helper is exported
  5. No compilation or runtime errors should result from these patterns

### AC-158-004: TypeScript Verification
- **Method**: Run `npx tsc --noEmit`
- **Verification**: Exit code must be 0

### AC-158-005: Build Verification
- **Method**: Run `npm run build`
- **Verification steps**:
  1. Build completes without errors
  2. Check `dist/assets/index-*.js` size is ≤ 512 KB

## Risks

1. **Store API changes during testing**: If the untested stores have methods with complex dependencies (e.g., cross-store calls in `completeResearch`), mocking may be needed. Mitigation: Use existing test patterns from `achievementStore.test.ts` as reference; mock cross-store dependencies via `vi.mock()`.

2. **Test count threshold**: New tests must be written carefully to avoid flakiness. Mitigation: Use established patterns, proper async handling, and store reset utilities. Target ~17 tests per store.

3. **Hydration verification**: Both stores already have `skipHydration: true`. Risk of no-op work. Mitigation: Treat this as verification-only work; if patterns are correct, mark AC-158-003 as pass after code review.

4. **Cross-store dependencies in useFactionReputationStore**: `completeResearch` may trigger events in other stores. Mitigation: Mock event listeners or use `vi.mock()` for cross-store interactions.

## Failure Conditions

This round fails if ANY of the following are true:

1. Test count falls below 6388 after adding new tests
2. Any new or existing test file has failures (0 failures required)
3. TypeScript compilation produces errors (`npx tsc --noEmit` non-zero exit)
4. Bundle size exceeds 512 KB after changes
5. New test code introduces runtime errors in the stores being tested
6. Any of the 3 new test files do not exist or are empty

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ `npm test -- --run` runs 235 test files (232 existing + 3 new) with ≥ 6388 passing tests and 0 failures
2. ✅ `npx tsc --noEmit` exits with code 0
3. ✅ `npm run build` produces bundle ≤ 512 KB
4. ✅ `src/__tests__/stores/useFactionReputationStore.test.ts` exists, is non-empty, and passes
5. ✅ `src/__tests__/stores/useMachineTagsStore.test.ts` exists, is non-empty, and passes
6. ✅ `src/__tests__/stores/useCommunityStore.test.ts` exists, is non-empty, and passes
7. ✅ `useSubCircuitStore.ts` has `skipHydration: true` in persist config
8. ✅ `useSettingsStore.ts` has `skipHydration: true` in persist config
9. ✅ `hydrateSubCircuitStore` or equivalent helper is exported from `useSubCircuitStore.ts`
10. ✅ `hydrateSettingsStore` or equivalent helper is exported from `useSettingsStore.ts`
11. ✅ No new console errors introduced in production code paths

## Out of Scope

- Bundle splitting for lazy loading (deferred to future optimization sprint)
- Virtualization for large machine lists
- Canvas rendering memoization
- AI Assistant improvements
- Visual/design changes to UI components
- Changes to already-passing store tests
- Performance benchmarking or profiling work
- Faction UI, community gallery UI, achievement panel, recipe book, exchange/trade system
- Multi-layer canvas support, timer/counter components, memory elements
- Runtime behavioral changes to existing stores (testing-only scope)
