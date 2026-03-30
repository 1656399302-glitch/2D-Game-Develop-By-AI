# QA Evaluation — Round 21

## Release Decision
- **Verdict:** FAIL
- **Summary:** AC9a still fails because `grep "ChallengeDifficulty" src/types/challenges.ts` returns 2 matches for function names `getChallengeDifficultyColor` and `getChallengeDifficultyLabel`. This is the fourth consecutive round where AC9a fails.
- **Spec Coverage:** FULL
- **Contract Coverage:** FAIL (1 acceptance criterion fails)
- **Build Verification:** PASS (0 TypeScript errors)
- **Browser Verification:** N/A (code-only remediation task)
- **Placeholder UI:** NONE
- **Critical Bugs:** 1
- **Major Bugs:** 0
- **Minor Bugs:** 0
- **Acceptance Criteria Passed:** 5/6
- **Untested Criteria:** 0

## Blocking Reasons
1. **AC9a — `grep "ChallengeDifficulty" src/types/challenges.ts` returns matches:** The function names `getChallengeDifficultyColor` and `getChallengeDifficultyLabel` contain the substring `ChallengeDifficulty`, causing grep to match. The acceptance criterion explicitly states "returns no matches" without any qualifier for function names. The Round 20 QA explicitly stated: "any appearance of `ChallengeDifficulty` in `src/types/challenges.ts` is a failure, whether as a local definition OR a re-export."

## Scores
- **Feature Completeness: 9/10** — All challenge system features complete. ChallengeDifficulty type removal is in scope.
- **Functional Correctness: 9/10** — Build succeeds with 0 TypeScript errors. All 1292 tests pass. AC9a still fails.
- **Product Depth: 9/10** — Challenge system fully implemented.
- **UX / Visual Quality: 9/10** — N/A for code-only remediation.
- **Code Quality: 8/10** — The string "ChallengeDifficulty" still appears twice in `src/types/challenges.ts` via function names.
- **Operability: 9/10** — Build succeeds, all tests pass.

**Average: 8.8/10 — FAIL (below 9.0 threshold due to AC9a failure)**

---

## Evidence

### AC9a Verification: `grep "ChallengeDifficulty" src/types/challenges.ts` — **FAIL**

**Verification Command:**
```bash
$ grep -n "ChallengeDifficulty" src/types/challenges.ts
27:  getChallengeDifficultyColor,
28:  getChallengeDifficultyLabel,
```

**Exit Code:** 0 (match found)

**Contract Requirement:**
> AC9a: `grep "ChallengeDifficulty" src/types/challenges.ts` returns **no matches**

**Actual State:**
The grep returns 2 matches because the function names `getChallengeDifficultyColor` and `getChallengeDifficultyLabel` contain the substring `ChallengeDifficulty`:

```typescript
// src/types/challenges.ts (lines 26-29)
export {
  getChallengeDifficultyColor,
  getChallengeDifficultyLabel,
  getChallengeCategoryLabel,
  getChallengeCategoryIcon,
} from '../data/challenges';
```

**Root Cause:**
The builder removed `ChallengeDifficulty` from the type re-exports (the standalone type), but kept the value exports for `getChallengeDifficultyColor` and `getChallengeDifficultyLabel`. Since `grep` is a substring search, these function names are found.

**Round 20 QA Explicit Statement:**
> "The acceptance criterion is explicit: 'returns no matches' — any appearance of `ChallengeDifficulty` in `src/types/challenges.ts` is a failure, whether as a local definition OR a re-export."

This statement covers all appearances, including function names containing the substring.

**Fix Required:**
Remove `getChallengeDifficultyColor` and `getChallengeDifficultyLabel` from the value exports. If these functions are needed elsewhere, components should import them directly from `src/data/challenges.ts`.

---

### AC9b Verification: `grep "export type Challenge" src/types/challenges.ts` — **PASS**

**Verification Command:**
```bash
$ grep "export type Challenge" src/types/challenges.ts
# No output
```

**Exit Code:** 1 (no matches)

**Result:** PASS

---

### AC9c Verification: `grep "getDifficultyColor\|getDifficultyLabel" src/types/challenges.ts` — **PASS**

**Verification Command:**
```bash
$ grep "getDifficultyColor\|getDifficultyLabel" src/types/challenges.ts
# No output
```

**Exit Code:** 1 (no matches)

**Result:** PASS

---

### Build Verification — **PASS**

**Build Output:**
```
> arcane-machine-codex-workshop@1.0.0 build
> tsc && vite build

vite v5.4.21 building for production...
✓ 159 modules transformed.
✓ built in 1.34s
0 TypeScript errors
```

---

### Test Suite — **PASS**

**Test Results:**
```
Test Files  58 passed (58)
     Tests  1292 passed (1292)
  Duration  7.35s
```

---

### Import Audit — **PASS**

**Verification Command:**
```bash
$ grep -r "from.*types/challenges" src/ --include="*.ts" --include="*.tsx" | grep -v "data/challenges"
# No output
```

**Exit Code:** 1 (no matches)

**Result:** No files import from `src/types/challenges.ts`. Components that need challenge utilities import directly from `src/data/challenges.ts`.

---

## Bugs Found

### 1. [Critical] ChallengeDifficulty substring still appears in function names

**Description:** The acceptance criterion AC9a requires `grep "ChallengeDifficulty" src/types/challenges.ts` to return no matches. However, the function names `getChallengeDifficultyColor` and `getChallengeDifficultyLabel` contain the substring `ChallengeDifficulty`, causing the grep to match.

**Impact:** AC9a fails, causing the round to fail with average 8.8/10 (below 9.0 threshold).

**Reproduction:**
```bash
$ grep -n "ChallengeDifficulty" src/types/challenges.ts
27:  getChallengeDifficultyColor,
28:  getChallengeDifficultyLabel,
```

**Contract Violation:**
> AC9a: `grep "ChallengeDifficulty" src/types/challenges.ts` returns **no matches**

**Round 20 QA Explicit Statement:**
> "any appearance of `ChallengeDifficulty` in `src/types/challenges.ts` is a failure"

**Fix Required:**
Change lines 26-29 in `src/types/challenges.ts` from:
```typescript
export {
  getChallengeDifficultyColor,
  getChallengeDifficultyLabel,
  getChallengeCategoryLabel,
  getChallengeCategoryIcon,
} from '../data/challenges';
```

To:
```typescript
export {
  getChallengeCategoryLabel,
  getChallengeCategoryIcon,
} from '../data/challenges';
```

This removes both function names that contain the substring `ChallengeDifficulty`.

---

## Required Fix Order

1. **Remove `getChallengeDifficultyColor` and `getChallengeDifficultyLabel` from value exports in `src/types/challenges.ts`**
   - Edit lines 26-29 to remove both function names
   - Run `grep "ChallengeDifficulty" src/types/challenges.ts` to verify exit code 1 (no matches)
   - Run `npm run build` to verify 0 TypeScript errors
   - Run `npm test` to verify all 1292 tests pass

---

## What's Working Well

1. **Build Quality:** Production build succeeds in 1.34s with 0 TypeScript errors.

2. **Test Coverage:** All 1292 tests pass across 58 test files. No regressions introduced.

3. **Import Audit:** No files import from `src/types/challenges.ts`. Components correctly import challenge utilities directly from `src/data/challenges.ts`.

4. **Type Re-exports Cleaned:** `ChallengeDifficulty` successfully removed from type re-exports.

5. **Legacy Function Names Removed:** `getDifficultyColor` and `getDifficultyLabel` (without "Challenge" prefix) correctly removed.

---

## Summary

| # | Acceptance Criterion | Status | Evidence |
|---|---------------------|--------|----------|
| AC9a | `grep "ChallengeDifficulty"` returns no matches | **FAIL** | Returns 2 matches (function names) |
| AC9b | `grep "export type Challenge"` returns no matches | **PASS** | No matches |
| AC9c | `grep "getDifficultyColor\|getDifficultyLabel"` returns no matches | **PASS** | No matches |
| AC9d | Build succeeds (0 TS errors) | **PASS** | 0 TypeScript errors |
| AC9e | All tests pass | **PASS** | 1292/1292 tests pass |
| AC9f | No broken imports | **PASS** | No imports from src/types/challenges.ts |

**Average: 8.8/10 — FAIL**

**Root Cause:** The builder removed `ChallengeDifficulty` from the type re-exports but kept the value exports for `getChallengeDifficultyColor` and `getChallengeDifficultyLabel`. Since `grep` is a substring search, these function names match the search pattern.

**Note:** This is the fourth consecutive round where AC9a fails. The fix is straightforward: remove the two function names from the value exports. Components that need these functions can import directly from `src/data/challenges.ts`.
