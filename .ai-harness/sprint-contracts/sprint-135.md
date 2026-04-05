APPROVED

# Sprint Contract — Round 136

## Scope

Implementation of the **Achievement System** for the circuit-building puzzle game. This system tracks player milestones and provides visual feedback when achievements are unlocked. All existing achievement infrastructure is **extended and refactored** in place — no parallel duplicate files will be created.

## Spec Traceability

### P0 items covered this round
- **Canvas validation and simulation engine** — Covered by existing canvas system (verified in Round 133). The circuit validation layer validates component connections and circuit completeness.
- **Memory elements** — Deferred to future round
- **Custom sub-circuit modules** — Covered by existing sub-circuit system (verified in Round 134)

### P1 items covered this round
- **Achievement system for milestones** (from Core Features → Progression System)
  - Achievement tracking and storage (refactored from existing `src/store/useAchievementStore.ts`)
  - Achievement notification system (refactored from existing `src/components/Achievements/AchievementToast.tsx`)
  - Achievement panel UI for viewing all achievements (refactored from existing `src/components/Achievements/AchievementList.tsx`)
  - Spec connection: implements the "Achievement system for milestones" sub-feature within the "Progression System" section of spec.md. Provides the milestone tracking infrastructure driven by game events in future rounds.

### Remaining P0/P1 after this round
- **P0**: Memory elements
- **P1**: Tech tree with unlockable components, Recipe discovery through experimentation, Faction reputation and rewards, Challenge mode with puzzles, Community gallery, Browse and import community circuits, Template library for common patterns, Exchange/trade system, AI assistant

### P2 intentionally deferred
- Faction reputation and rewards, Exchange/trade system, AI assistant

## Existing Infrastructure — EXTEND AND REFACTOR

The following files already exist. The contract specifies the exact refactoring required. **No new parallel files will be created.** All deliverable paths reference the existing files being extended or renamed.

| Existing File | Action | Required Changes |
|---|---|---|
| `src/store/useAchievementStore.ts` | **Extend + Refactor** | Add `unlockAchievement(id)` method, `unlockedAt` timestamp field, and localStorage persistence under key `'tech-tree-achievements'`. The existing `triggerUnlock` callback and `recentlyUnlocked` Set may remain for backward compatibility but are not the primary API. |
| `src/data/achievements.ts` | **Extend + Refactor** | Add achievements in categories `circuit-building`, `recipe-discovery`, `subcircuit`, `exploration`. Existing Faction/Milestone achievements may be migrated into new categories or supplemented with new entries. Minimum total ≥ 10 achievements. |
| `src/components/Achievements/AchievementList.tsx` | **Extend + Rename** | Refactor to use new category taxonomy. Rename internal exports/display names to reflect new categories. No parallel `AchievementPanel.tsx` file will be created — the existing component is refactored in place. |
| `src/components/Achievements/AchievementToast.tsx` | **Extend + Refactor** | Change `duration` prop default from `4000` to `3000` (3-second auto-dismiss). No parallel `AchievementNotification.tsx` file will be created — the existing component is refactored in place. |
| `src/components/Achievements/__tests__/AchievementToast.integration.test.tsx` | **Extend** | Add new test cases for the updated notification timing (3-second dismiss) and `unlockAchievement` API. Existing tests must continue to pass. |

**Reconciliation decisions:**
- No parallel `src/components/Achievement/` directory will be created
- No parallel `AchievementPanel.tsx` or `AchievementNotification.tsx` will be created
- No parallel `src/stores/achievementStore.ts` will be created
- All new functionality is added to existing files via extension/refactor

## Deliverables

All paths reference existing files being extended or refactored (no new parallel files):

1. **`src/store/useAchievementStore.ts`** — Extended Zustand store. **Must include**: `unlockAchievement(id)` method that sets `isUnlocked === true`, `unlockedAt` timestamp, and persists to localStorage key `'tech-tree-achievements'`. Initialize achievement definitions from refactored `src/data/achievements.ts`.
2. **`src/data/achievements.ts`** — Extended with new categories. **Must include** achievements with categories: `circuit-building`, `recipe-discovery`, `subcircuit`, `exploration`. Minimum 10 achievements total across all categories.
3. **`src/components/Achievements/AchievementList.tsx`** — Refactored to use new achievement definitions with new category taxonomy. Displays all achievements with name, description, icon, locked/unlocked state, and unlock timestamp for completed.
4. **`src/components/Achievements/AchievementToast.tsx`** — Refactored. **`duration` prop default changed from `4000` to `3000`** (3-second auto-dismiss). Manual dismiss on click preserved.
5. **`src/components/Achievements/AchievementBadge.tsx`** (new file if not present) — Individual achievement badge component used by the panel.
6. **`src/types/achievement.ts`** (new file) — TypeScript types for `Achievement`, `AchievementCategory`, `AchievementDefinition`. These types are imported by the store and components.
7. **`src/__tests__/stores/achievementStore.test.ts`** — Unit tests for achievement store (≥ 50 tests covering initialization, `unlockAchievement`, localStorage persistence, timestamp tracking).
8. **`src/__tests__/components/Achievement/AchievementList.test.tsx`** — Unit tests for refactored achievement list/panel component.
9. **`src/__tests__/components/Achievement/AchievementToast.test.tsx`** — Unit tests for refactored toast notification (including 3-second auto-dismiss verification).

## Acceptance Criteria

1. **AC-136-001**: Achievement store initializes with predefined achievements (≥ 10 total) across categories: `circuit-building`, `recipe-discovery`, `subcircuit`, `exploration`. Each achievement has: `id`, `name`, `description`, `icon`, `category`, `isUnlocked`, `unlockedAt` (null for locked).
2. **AC-136-002**: Calling `unlockAchievement(id)` marks achievement as unlocked with `unlockedAt` timestamp (within last 5 seconds), persists to localStorage key `'tech-tree-achievements'`, and triggers notification. Calling on already-unlocked achievement leaves `unlockedAt` unchanged.
3. **AC-136-003**: Achievement panel displays all achievements showing: name, description, icon, locked/unlocked state, unlock timestamp for completed.
4. **AC-136-004**: Achievement notification appears for **exactly 3 seconds** when achievement is unlocked, then auto-dismisses. If extending existing `AchievementToast.tsx`, its default `duration` must be changed from `4000` to `3000`.
5. **AC-136-005**: Clicking on notification dismisses it immediately (before the 3-second timer).
6. **AC-136-006**: Achievement data persists across page reloads via localStorage key `'tech-tree-achievements'`. Unlocking achievements, clearing React state, and re-importing the store restores correct unlocked state.
7. **AC-136-007**: Bundle size ≤ 512KB after adding achievement system.
8. **AC-136-008**: TypeScript compilation passes with 0 errors.

## Test Methods

### AC-136-001: Achievement store initialization
1. Import `useAchievementStore` from `src/store/useAchievementStore.ts`
2. Verify `getState().achievements` array has length ≥ 10
3. Verify at least one achievement exists in each category: `circuit-building`, `recipe-discovery`, `subcircuit`, `exploration`
4. Verify each achievement has fields: `id` (string), `name` (string), `description` (string), `icon` (string/JSX), `category` (one of the four allowed values), `isUnlocked` (boolean), `unlockedAt` (number | null)
5. Verify `unlockedAt` is `null` for all achievements on initial load

### AC-136-002: Unlock achievement logic
1. Mock localStorage with a test storage object before importing store
2. Call `useAchievementStore.getState().unlockAchievement(achievementId)` where `achievementId` is the `id` of the first achievement
3. Assert the achievement with that `id` has `isUnlocked === true`
4. Assert `unlockedAt` is a valid timestamp within the last 5 seconds (use `Date.now() - unlockedAt <= 5000`)
5. Assert localStorage contains a JSON-serialized achievement state under key `'tech-tree-achievements'`
6. Call `unlockAchievement(achievementId)` a second time
7. Assert `unlockedAt` timestamp is unchanged (store the first value, compare after second call)
8. Call `unlockAchievement` with a non-existent ID — assert no error thrown and state unchanged

### AC-136-003: Achievement panel display
1. Render `<AchievementList />` with React Testing Library (or the refactored panel component)
2. Assert the panel heading contains "成就" (Achievements)
3. Assert all predefined achievements are rendered (≥ 10 items in the list)
4. Assert locked achievements show a locked/unavailable visual state
5. Assert unlocked achievements show an unlocked/completed visual state
6. Assert unlocked achievements display a formatted timestamp (using the `unlockedAt` field)
7. Verify the component reads from the achievement store (not hardcoded data)

### AC-136-004: Notification auto-dismiss at 3 seconds
1. Mock timers with `vi.useFakeTimers()` and `vi.useFakeTimers({ shouldAdvanceTime: false })`
2. Trigger achievement unlock via `useAchievementStore.getState().unlockAchievement(achievementId)`
3. Assert notification element exists in the DOM immediately after unlock
4. Advance timers by **2999ms** — assert notification is still in the DOM
5. Advance timers by 1 more ms (total 3000ms from step 4) — assert notification element is removed from DOM
6. Restore real timers with `vi.useRealTimers()` in `afterEach`
7. Verify this test fails if the existing `AchievementToast.tsx` duration is still `4000`

### AC-136-005: Notification manual dismiss
1. Trigger achievement unlock via store action
2. Assert notification is visible in the DOM
3. Find and click the notification's dismiss button (the close/X button)
4. Assert notification is removed from DOM immediately (before any timer advance)

### AC-136-006: localStorage persistence
1. Unlock 3 distinct achievements via `unlockAchievement`
2. Serialize the current achievement state from the store
3. Clear the store's React state by calling `useAchievementStore.setState({ ...initialState })`
4. Trigger a re-initialization by re-importing/resetting the store
5. Assert all 3 achievements are restored with `isUnlocked === true` and correct `unlockedAt` values from localStorage
6. Verify localStorage key is `'tech-tree-achievements'` (exact string match)

### AC-136-007: Bundle size
1. Run `npm run build`
2. Identify the main JS bundle: `dist/assets/index-*.js`
3. Assert file size ≤ 524,288 bytes (512KB)
4. If size exceeds limit, reduce achievement icon bundle or defer non-critical achievement metadata

### AC-136-008: TypeScript
1. Run `npx tsc --noEmit`
2. Assert exit code 0
3. Verify no `any` type suppressions introduced in new achievement code

## Risks

1. **Existing tests may break after refactor** — The refactored store API (`unlockAchievement(id)` vs `triggerUnlock(achievement)`) and changed notification duration (3s vs 4s) may cause existing tests to fail. All existing tests must be updated or extended, not deleted.
2. **Notification timing in tests** — Using fake timers requires proper cleanup. Each test file using fake timers must restore real timers in `afterEach`.
3. **localStorage mock in Node.js** — Tests must provide a localStorage mock before importing the store module, using a pattern like `Object.defineProperty(window, 'localStorage', { value: mockStorage, writable: true })`.
4. **Achievement category migration** — Existing achievements in `src/data/achievements.ts` use Faction/Milestone taxonomy. The refactored data must use the new four-category taxonomy. Verify all existing achievement references (in store and components) point to the updated definitions.
5. **Circular dependency between store and achievement data** — Achievement definitions must not import from the store. Keep data layer separate from state management layer.

## Failure Conditions

The round fails if any of the following occur:

1. Any of the 8 acceptance criteria fails to pass
2. Bundle size exceeds 512KB (524,288 bytes)
3. TypeScript compilation produces errors (`npx tsc --noEmit` exit code ≠ 0)
4. Achievement store unit test count is below 50
5. Notification fails to appear within 100ms of `unlockAchievement` call
6. Notification auto-dismisses at a duration other than exactly 3 seconds
7. localStorage persistence fails across store re-initialization
8. **Any existing test in `src/components/Achievements/__tests__/` breaks** due to refactoring — all existing tests must be updated and passing
9. **Duplicate achievement notification systems coexist** — both old toast (4s) and new notification (3s) firing simultaneously is a failure
10. New parallel files created alongside existing achievement files (e.g., both `AchievementList.tsx` and `AchievementPanel.tsx` exist in different paths)

## Done Definition

All of the following must be true before the builder may claim the round complete:

1. All 8 acceptance criteria pass with automated tests
2. Bundle size ≤ 512KB verified via `npm run build`
3. `npx tsc --noEmit` exits with code 0
4. `npm test -- --run` passes with ≥ 50 new tests for the achievement system
5. Achievement panel renders correctly with ≥ 10 achievements across 4 categories
6. Notification system works: appears on `unlockAchievement` call, **auto-dismisses after exactly 3 seconds**, manual dismiss works via click
7. localStorage persistence verified with integration test using key `'tech-tree-achievements'`
8. No regressions in existing 5491+ unit tests (existing tests updated as needed)
9. No regressions in existing 14 E2E tests
10. All existing achievement infrastructure refactored in place — no duplicate parallel files created
11. Store provides `unlockAchievement(id)` method with `unlockedAt` tracking and localStorage persistence

## Out of Scope

- Tech tree implementation and component unlocking
- Recipe discovery and recipe book UI
- Faction reputation system
- Challenge mode puzzles
- Community gallery and sharing features
- Exchange/trade system
- AI assistant integration
- Game event integration (achievement store API will exist for future integration; achievement triggers are not wired to game actions this round)
- Styling beyond basic functional layout (dark theme colors only)
- Notification queue for multiple simultaneous achievements (existing queue logic in `AchievementToast.tsx` may remain unchanged; building a new queue system is out of scope)
- Memory elements
