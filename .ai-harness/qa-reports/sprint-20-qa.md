# QA Evaluation — Round 20

## Release Decision
- **Verdict:** FAIL
- **Summary:** AC9 acceptance criterion explicitly requires `grep "ChallengeDifficulty" src/types/challenges.ts` to return no matches, but the type still appears as a re-export in the type export list. This is the third consecutive round where AC9 fails for the same reason.
- **Spec Coverage:** FULL
- **Contract Coverage:** FAIL (1 acceptance criterion fails)
- **Build Verification:** PASS (0 TypeScript errors)
- **Browser Verification:** N/A (code-only remediation task)
- **Placeholder UI:** NONE
- **Critical Bugs:** 1
- **Major Bugs:** 0
- **Minor Bugs:** 0
- **Acceptance Criteria Passed:** 4/5
- **Untested Criteria:** 0

## Blocking Reasons
1. **AC9 — `grep "ChallengeDifficulty" src/types/challenges.ts` returns matches:** The type appears in the type re-exports: `export type { ChallengeCategory, ChallengeDifficulty, ... }`. The acceptance criterion is explicit: "returns no matches". Even though `ChallengeDifficulty` is legitimately defined in `src/data/challenges.ts`, it must not appear in `src/types/challenges.ts` at all.

## Scores
- **Feature Completeness: 9/10** — All 16 challenges implemented with correct category distribution (Creation=4, Collection=3, Activation=4, Mastery=5), faction reputation system with 5 tiers, faction variant gating.
- **Functional Correctness: 9/10** — Build succeeds with 0 TypeScript errors. All 1292 tests pass. Code remediation partially complete but AC9 still fails.
- **Product Depth: 9/10** — Challenge system with EnhancedChallengeCard accessibility, faction reputation with Grandmaster gating, integration tests for achievement→faction flow.
- **UX / Visual Quality: 9/10** — N/A for code-only remediation.
- **Code Quality: 8/10** — ChallengeDifficulty type still exported from `src/types/challenges.ts` violating explicit acceptance criterion. Dead code files deleted (challengeValidator.ts, ChallengeValidationPanel.tsx, ChallengeCelebration.tsx).
- **Operability: 9/10** — Build succeeds, all tests pass.

**Average: 8.8/10 — FAIL (below 9.0 threshold due to AC9 failure)**

---

## Evidence

### AC9 Verification 1: `grep "ChallengeDifficulty" src/types/challenges.ts` — **FAIL**

**Verification Command:**
```bash
$ grep "ChallengeDifficulty" src/types/challenges.ts
  ChallengeDifficulty,
  getChallengeDifficultyColor,
  getChallengeDifficultyLabel,
```

**Contract Requirement:**
> - [ ] `grep "ChallengeDifficulty" src/types/challenges.ts` returns no matches

**Actual State:**
The grep returns 3 matches because `ChallengeDifficulty` appears in the type re-exports:

```typescript
// src/types/challenges.ts (lines 15-22)
export type {
  ChallengeCategory,
  ChallengeDifficulty,  // <-- THIS VIOLATES THE CONTRACT
  ChallengeRewardType,
  ChallengeReward,
  ChallengeUnlockCondition,
  ChallengeDefinition,
} from '../data/challenges';
```

**Root Cause:**
The builder removed the local type definition of `ChallengeDifficulty` but kept the re-export from `src/data/challenges.ts`. The acceptance criterion is explicit: "returns no matches" — any appearance of `ChallengeDifficulty` in `src/types/challenges.ts` is a failure, whether as a local definition OR a re-export.

**Fix Required:**
Remove `ChallengeDifficulty` from the type re-exports. Components already import directly from `src/data/challenges.ts`:
- `src/components/Challenge/ChallengePanel.tsx` imports from `'../../data/challenges'`
- `src/components/Challenges/EnhancedChallengeCard.tsx` imports from `'../../data/challenges'`
- `src/components/Challenges/ChallengeBrowser.tsx` imports from `'../../data/challenges'`

---

### AC9 Verification 2: `grep "export type Challenge" src/types/challenges.ts` — **PASS**

**Verification Command:**
```bash
$ grep "export type Challenge" src/types/challenges.ts
# No output - PASS
```

**Result:** EXIT CODE 1 (no matches)

---

### AC9 Verification 3: `grep "getDifficultyColor\|getDifficultyLabel" src/types/challenges.ts` — **PASS**

**Verification Command:**
```bash
$ grep "getDifficultyColor\|getDifficultyLabel" src/types/challenges.ts
# No output - PASS
```

**Result:** EXIT CODE 1 (no matches)

Note: The functions `getChallengeDifficultyColor` and `getChallengeDifficultyLabel` are correctly re-exported (these are the current API), but the old functions `getDifficultyColor` and `getDifficultyLabel` (without "Challenge" prefix) are not present.

---

### Build Verification — **PASS**

**Build Output:**
```
> arcane-machine-codex-workshop@1.0.0 build
> tsc && vite build
✓ built in 1.32s
0 TypeScript errors
```

---

### Test Suite — **PASS**

**Test Results:**
```
Test Files  58 passed (58)
     Tests  1292 passed (1292)
  Duration  7.33s
```

---

### Import Audit — **PASS**

**Verification Command:**
```bash
$ grep -r "from.*types/challenges" src/ --include="*.ts" --include="*.tsx" | grep -v "data/challenges"
# No output
```

**Result:** No files import from `src/types/challenges.ts`. Components that need `ChallengeDifficulty` import directly from `src/data/challenges.ts`.

---

## Bugs Found

### 1. [Critical] ChallengeDifficulty still exported from src/types/challenges.ts

**Description:** The acceptance criterion AC9 explicitly requires `grep "ChallengeDifficulty" src/types/challenges.ts` to return no matches. However, the type appears in the type re-exports:

```typescript
export type {
  ChallengeCategory,
  ChallengeDifficulty,  // <-- Must be removed
  ...
} from '../data/challenges';
```

**Impact:** AC9 fails, causing the round to fail with average 8.8/10 (below 9.0 threshold).

**Reproduction:**
```bash
grep "ChallengeDifficulty" src/types/challenges.ts
# Returns:
#   ChallengeDifficulty,
#   getChallengeDifficultyColor,
#   getChallengeDifficultyLabel,
```

**Contract Violation:**
> AC9: Remove deprecated code from `src/types/challenges.ts`
> - [ ] `grep "ChallengeDifficulty" src/types/challenges.ts` returns no matches

**Fix:**
Change the type re-exports in `src/types/challenges.ts` from:
```typescript
export type {
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeRewardType,
  ChallengeReward,
  ChallengeUnlockCondition,
  ChallengeDefinition,
} from '../data/challenges';
```

To:
```typescript
export type {
  ChallengeCategory,
  ChallengeRewardType,
  ChallengeReward,
  ChallengeUnlockCondition,
  ChallengeDefinition,
} from '../data/challenges';
```

This removes `ChallengeDifficulty` from the re-exports while keeping the type available from `src/data/challenges.ts` where it is canonically defined.

---

## Required Fix Order

1. **Remove `ChallengeDifficulty` from type re-exports in `src/types/challenges.ts`**
   - Edit lines 15-22 to remove `ChallengeDifficulty` from the type export list
   - Run `grep "ChallengeDifficulty" src/types/challenges.ts` to verify no matches
   - Run `npm run build` to verify 0 TypeScript errors
   - Run `npm test` to verify all tests pass

---

## What's Working Well

1. **Build Quality:** Production build succeeds in 1.32s with 0 TypeScript errors. No compilation issues.

2. **Test Coverage:** All 1292 tests pass across 58 test files. No regressions introduced.

3. **Import Audit:** No files import from `src/types/challenges.ts`. Components correctly import challenge types directly from `src/data/challenges.ts`.

4. **Dead Code Removed:** `challengeValidator.ts`, `ChallengeValidationPanel.tsx`, and `ChallengeCelebration.tsx` successfully deleted.

5. **Legacy Types Removed:** `Challenge`, `ChallengeRequirement`, `ChallengeReward`, `ValidationResult`, `RequirementDetail` types correctly removed. `getDifficultyColor` and `getDifficultyLabel` (without "Challenge" prefix) correctly removed.

---

## Summary

| # | Acceptance Criterion | Status | Evidence |
|---|---------------------|--------|----------|
| AC9a | `grep "ChallengeDifficulty"` returns no matches | **FAIL** | Returns 3 matches (type re-export) |
| AC9b | `grep "export type Challenge"` returns no matches | **PASS** | No matches |
| AC9c | `grep "getDifficultyColor\|getDifficultyLabel"` returns no matches | **PASS** | No matches (old function names removed) |
| AC9d | Build succeeds (0 TS errors) | **PASS** | 0 TypeScript errors |
| AC9e | All tests pass | **PASS** | 1292/1292 tests pass |
| AC9f | No broken imports | **PASS** | No imports from src/types/challenges.ts |

**Average: 8.8/10 — FAIL**

**Root Cause:** The builder removed the local type definition but kept the re-export of `ChallengeDifficulty`. The acceptance criterion is explicit: "returns no matches" — any appearance of `ChallengeDifficulty` in `src/types/challenges.ts` is a failure.

**Note:** This is the third consecutive round where AC9 fails. The fix is straightforward and has been identified in each round's feedback.
