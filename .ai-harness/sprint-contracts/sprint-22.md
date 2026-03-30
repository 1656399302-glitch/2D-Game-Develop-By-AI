APPROVED

# Sprint Contract — Round 23

## Scope

**Single remediation task:** Remove `getChallengeDifficultyColor` and `getChallengeDifficultyLabel` from the value exports in `src/types/challenges.ts`.

**Specific change:** Edit lines 26-29 in `src/types/challenges.ts` to remove both function names from the export block. The remaining exports (`getChallengeCategoryLabel`, `getChallengeCategoryIcon`) are unaffected.

**Why:** The acceptance criterion AC9a requires `grep "ChallengeDifficulty" src/types/challenges.ts` to return no matches. Since `grep` is a substring search, the function names `getChallengeDifficultyColor` and `getChallengeDifficultyLabel` cause the grep to match even though these are not type definitions. The Round 20 QA explicitly stated: "any appearance of `ChallengeDifficulty` in `src/types/challenges.ts` is a failure, whether as a local definition OR a re-export."

## Spec Traceability

- **P0 covered this round:** AC9a fix — ChallengeDifficulty substring removal from value exports
- **P1 covered this round:** None (remediation round)
- **Remaining P0/P1 after this round:** None
- **P2 intentionally deferred:** N/A

## Deliverables

1. **Modified `src/types/challenges.ts`**
   - Before:
     ```typescript
     export {
       getChallengeDifficultyColor,
       getChallengeDifficultyLabel,
       getChallengeCategoryLabel,
       getChallengeCategoryIcon,
     } from '../data/challenges';
     ```
   - After:
     ```typescript
     export {
       getChallengeCategoryLabel,
       getChallengeCategoryIcon,
     } from '../data/challenges';
     ```

## Acceptance Criteria

| # | Criterion | Verification Command | Expected Result |
|---|-----------|---------------------|-----------------|
| AC9a | No `ChallengeDifficulty` substring in file | `grep "ChallengeDifficulty" src/types/challenges.ts` | Exit code 1 (no matches) |
| AC9b | No `export type Challenge` in file | `grep "export type Challenge" src/types/challenges.ts` | Exit code 1 (no matches) |
| AC9c | No legacy function names | `grep "getDifficultyColor\|getDifficultyLabel" src/types/challenges.ts` | Exit code 1 (no matches) |
| AC9d | Build succeeds | `npm run build` | 0 TypeScript errors |
| AC9e | Tests pass | `npm test` | All tests passing |
| AC9f | No broken imports | Import audit | No files import removed functions from `src/types/challenges.ts` |

## Test Methods

1. **AC9a:** Run `grep "ChallengeDifficulty" src/types/challenges.ts` — must exit with code 1 (no matches)
2. **AC9b:** Run `grep "export type Challenge" src/types/challenges.ts` — must exit with code 1 (no matches)
3. **AC9c:** Run `grep "getDifficultyColor\|getDifficultyLabel" src/types/challenges.ts` — must exit with code 1 (no matches)
4. **AC9d:** Run `npm run build` — must complete with 0 TypeScript errors
5. **AC9e:** Run `npm test` — must show all tests passing
6. **AC9f:** Run `grep -r "from.*types/challenges" src/ --include="*.ts" --include="*.tsx" | grep -v "data/challenges"` — must exit with code 1 (no matches). Components needing `getChallengeDifficultyColor` or `getChallengeDifficultyLabel` can import directly from `src/data/challenges.ts` (verified in Round 21 import audit).

## Risks

1. **Import dependency risk:** Verified in Round 21 — no code imports from `src/types/challenges.ts`. Components needing the removed functions can import directly from `src/data/challenges.ts` where they are defined.
2. **Risk level:** LOW — This is a targeted, minimal change: only 2 lines removed from a single file.

## Failure Conditions

The round fails if any of the following occur:

1. `grep "ChallengeDifficulty" src/types/challenges.ts` returns any matches (exit code 0)
2. Build fails with TypeScript errors
3. Any tests fail

## Done Definition

All of the following must be true before claiming the round complete:

1. ✅ `grep "ChallengeDifficulty" src/types/challenges.ts` returns exit code 1
2. ✅ `grep "export type Challenge" src/types/challenges.ts` returns exit code 1
3. ✅ `grep "getDifficultyColor\|getDifficultyLabel" src/types/challenges.ts` returns exit code 1
4. ✅ `npm run build` completes with 0 TypeScript errors
5. ✅ `npm test` passes all tests
6. ✅ No files have broken imports due to the change

## Out of Scope

1. **ANY new features or functionality** beyond the AC9a fix
2. **`src/data/challenges.ts` — must NOT be modified** — The source file where `getChallengeDifficultyColor` and `getChallengeDifficultyLabel` are defined remains unchanged. Components that need these functions import directly from `src/data/challenges.ts`
3. **Any other files** — Only `src/types/challenges.ts` is in scope for this round
4. **Type definition changes** — `ChallengeDifficulty` type removal was completed in a prior round
