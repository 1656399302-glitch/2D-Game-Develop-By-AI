# Sprint Contract — Round 19

## Scope

This round is **remediation-focused**. The primary objective is to fix the 3 critical acceptance criteria failures from Round 18 and 2 code quality issues. No new features will be introduced.

## Spec Traceability

### P0 items (must pass, previously failed)
- **AC1**: Challenge Mastery category must have exactly 5 challenges (move `void-initiate` from creation→mastery, reducing creation to 4)
- **AC3**: ModulePanel must gate 4 faction variant modules behind Grandmaster rank check
- **AC5**: ChallengePanel must render `role="progressbar"` elements via EnhancedChallengeCard (not inline ChallengeCard)

### P1 items (fixes for code quality)
- Remove deprecated `CHALLENGES` constant and `ChallengeDifficulty` type from `src/types/challenges.ts`
- Add integration test for achievement→faction reputation (+10) flow

### P0 remaining after this round
- None: all P0 failures from Round 18 should be resolved

### P2 intentionally deferred
- ChallengeBrowser component integration into App.tsx (exists but not wired)
- File organization fix for `src/types/factionReputation.ts` (store/utils split)
- Additional faction reputation tests (basic coverage exists)

## Deliverables

### 1. `src/data/challenges.ts`
- Move `void-initiate` challenge from `category: 'creation'` to `category: 'mastery'`
- **Final distribution**: Creation(4) + Collection(3) + Activation(4) + Mastery(5) = 16

### 2. `src/components/Challenge/ChallengePanel.tsx`
- Replace inline `ChallengeCard` component with `EnhancedChallengeCard` import from `src/components/Challenge/EnhancedChallengeCard.tsx`
- Ensure progress bars render with `role="progressbar"` and proper ARIA attributes:
  - `role="progressbar"`
  - `aria-valuenow={Math.round(progressPercentage)}`
  - `aria-valuemin={0}`
  - `aria-valuemax={100}`
  - `aria-label="..."` with challenge title and progress

### 3. `src/components/Editor/ModulePanel.tsx`
- Import `useFactionReputationStore` hook
- Call `useFactionReputationStore()` to access store state
- Check Grandmaster rank via `isVariantUnlocked(factionId)` before rendering each faction variant
- **Conditionally render 4 faction variants**:
  - `void-arcane-gear` → gated by `isVariantUnlocked('void')`
  - `inferno-blazing-core` → gated by `isVariantUnlocked('inferno')`
  - `storm-thundering-pipe` → gated by `isVariantUnlocked('storm')`
  - `stellar-harmonic-crystal` → gated by `isVariantUnlocked('stellar')`
- When locked: show lock icon + "宗师解锁" (Grandmaster required) badge
- When unlocked: show variant normally

### 4. `src/types/challenges.ts`
- **Completely remove** the `CHALLENGES` constant (not just deprecate)
- **Completely remove** `ChallengeDifficulty` type
- Keep only `CHALLENGE_DEFINITIONS` and related helper types

### 5. `src/__tests__/achievementFactionIntegration.test.ts`
- Add test case verifying achievement with `faction` property adds +10 reputation
- Mock achievement trigger: `useAchievementStore.getState().triggerUnlock(achievement)`
- Verify store update: `expect(useFactionReputationStore.getState().reputations[faction]).toBe(initialRep + 10)`

## Acceptance Criteria

### AC1: Challenge Mastery category has exactly 5 challenges
- [ ] `getChallengesByCategory('mastery').length === 5`
- [ ] `getChallengesByCategory('creation').length === 4`
- [ ] `void-initiate` challenge has `category: 'mastery'`
- [ ] Total count remains 16
- [ ] `void-initiate` no longer appears in creation category

### AC3: Faction variants gated behind Grandmaster rank
- [ ] `ModulePanel.tsx` imports `useFactionReputationStore`
- [ ] `useFactionReputationStore()` hook is called within component
- [ ] All 4 faction variants exist in MODULE_CATALOG
- [ ] Each variant wrapped in conditional: `isVariantUnlocked(factionId)` check
- [ ] Locked variants display lock icon UI
- [ ] Unlocked variants display normally

### AC5: Progress bars have `role="progressbar"`
- [ ] `ChallengePanel.tsx` imports `EnhancedChallengeCard` (not inline ChallengeCard)
- [ ] `grep "role=\"progressbar\"" src/components/Challenge/EnhancedChallengeCard.tsx` finds matches
- [ ] Browser: `document.querySelectorAll('[role="progressbar"]').length > 0` when ChallengePanel open
- [ ] Progress bars have `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label` attributes

### AC9: Deprecated CHALLENGES removed
- [ ] `grep "export const CHALLENGES" src/types/challenges.ts` returns no matches
- [ ] `grep "ChallengeDifficulty" src/types/challenges.ts` returns no matches
- [ ] `src/types/challenges.ts` contains only `CHALLENGE_DEFINITIONS` and helper types

### AC10: Achievement→reputation integration test exists
- [ ] Test file has test case for achievement with faction property
- [ ] Test mocks achievement trigger and verifies store reputation increases by 10
- [ ] `npm test -- achievementFactionIntegration` runs successfully

### AC11: Build succeeds
- [ ] `npm run build` completes with 0 TypeScript errors

## Test Methods

### AC1 Verification
```bash
node -e "
const { CHALLENGE_DEFINITIONS } = require('./src/data/challenges.ts');
const counts = {
  creation: CHALLENGE_DEFINITIONS.filter(c => c.category === 'creation').length,
  collection: CHALLENGE_DEFINITIONS.filter(c => c.category === 'collection').length,
  activation: CHALLENGE_DEFINITIONS.filter(c => c.category === 'activation').length,
  mastery: CHALLENGE_DEFINITIONS.filter(c => c.category === 'mastery').length,
};
console.log(counts);
console.log('Total:', counts.creation + counts.collection + counts.activation + counts.mastery);
// Verify void-initiate is mastery
const voidInitiate = CHALLENGE_DEFINITIONS.find(c => c.id === 'void-initiate');
console.log('void-initiate category:', voidInitiate?.category);
"
// Expected: { creation: 4, collection: 3, activation: 4, mastery: 5 } = 16
// Expected: void-initiate category: mastery
```

### AC3 Verification
1. Inspect ModulePanel.tsx source for `useFactionReputationStore` import
2. Verify each variant has `isVariantUnlocked(...)` conditional
3. Browser test:
   - Open ModulePanel in browser (default state)
   - Verify 4 faction variants show lock icons
   - Set faction reputation to 2000+ (via dev tools: `useFactionReputationStore.getState().reputations['void'] = 2500`)
   - Refresh page: void variant should unlock and show normally

### AC5 Verification
1. `grep "EnhancedChallengeCard" src/components/Challenge/ChallengePanel.tsx` — should find import
2. `grep -c "role=\"progressbar\"" src/components/Challenge/EnhancedChallengeCard.tsx` — should be > 0
3. Browser:
   - Open ChallengePanel
   - Run: `document.querySelectorAll('[role="progressbar"]').length` → expected > 0
   - Inspect element attributes: aria-valuenow, aria-valuemin, aria-valuemax, aria-label present

### AC9 Verification
```bash
grep "export const CHALLENGES" src/types/challenges.ts    # Expected: no output
grep "ChallengeDifficulty" src/types/challenges.ts       # Expected: no output
```

### AC10 Verification
```bash
npm test -- achievementFactionIntegration
# Expected: test passes
```

### AC11 Verification
```bash
npm run build  # Expected: success with 0 TypeScript errors
```

## Risks

### Low Risk
- **Challenge category change**: Simple string change from `'creation'` to `'mastery'` on `void-initiate`
- **EnhancedChallengeCard integration**: Component already exists with correct role/ARIA attributes
- **Faction gating**: Store API `isVariantUnlocked` already exists and tested

### Medium Risk  
- **Test addition**: Need to mock Zustand store correctly for integration test

### No High Risks
- No architectural changes
- No new dependencies
- No breaking API changes

## Failure Conditions

This sprint fails if any of the following occur:

1. **AC1 fails**: Mastery category does not have exactly 5 challenges, OR Creation does not have exactly 4, OR total is not 16, OR void-initiate is still in creation
2. **AC3 fails**: Faction variants render without Grandmaster rank check in ModulePanel (no `useFactionReputationStore` import or `isVariantUnlocked` calls)
3. **AC5 fails**: Browser inspection finds 0 `role="progressbar"` elements in ChallengePanel, OR ChallengePanel still uses inline ChallengeCard instead of EnhancedChallengeCard
4. **AC9 fails**: `CHALLENGES` constant or `ChallengeDifficulty` type still exists in `src/types/challenges.ts`
5. **AC10 fails**: No integration test verifies achievement→faction reputation flow
6. **Build fails**: TypeScript compilation errors introduced
7. **Regression**: Any previously passing AC from Round 18 now fails

## Done Definition

The round is complete when ALL of the following are true:

1. [ ] `CHALLENGE_DEFINITIONS.filter(c => c.category === 'mastery').length === 5`
2. [ ] `CHALLENGE_DEFINITIONS.filter(c => c.category === 'creation').length === 4`
3. [ ] `void-initiate` challenge has `category: 'mastery'`
4. [ ] `ChallengePanel.tsx` imports `EnhancedChallengeCard` (not inline ChallengeCard)
5. [ ] Browser inspection confirms `role="progressbar"` elements exist in ChallengePanel
6. [ ] `ModulePanel.tsx` imports and uses `useFactionReputationStore`
7. [ ] Each of 4 faction variants has conditional rendering based on `isVariantUnlocked(factionId)`
8. [ ] `export const CHALLENGES` does not exist in `src/types/challenges.ts`
9. [ ] `ChallengeDifficulty` type does not exist in `src/types/challenges.ts`
10. [ ] Integration test exists for achievement→reputation flow and passes
11. [ ] `npm run build` succeeds with 0 TypeScript errors
12. [ ] All existing tests pass

## Out of Scope

- ChallengeBrowser component integration into App.tsx (exists but not wired into main app flow)
- File organization fix for `src/types/factionReputation.ts` (store/utils/type split)
- Additional faction reputation system features beyond current implementation
- New challenge types or categories
- Visual polish or UX improvements to panels
- AI integration for naming/descriptions
- Community features or social sharing

---

**Note**: This is a remediation sprint. The contract prioritizes fixing known failures (AC1, AC3, AC5) and code quality issues (AC9, AC10) over adding new features. All P0 items from Round 18 feedback are addressed before considering new work.
