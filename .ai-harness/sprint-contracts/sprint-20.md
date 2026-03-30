APPROVED

# Sprint Contract — Round 20

## Scope

Remediation task: Complete removal of deprecated `ChallengeDifficulty` type and related legacy code from `src/types/challenges.ts` as required by AC9 from round 19.

## Spec Traceability

- **P0 (Critical Fix):** AC9 — Remove deprecated code from `src/types/challenges.ts`
- **P1:** Verify no import breaking changes
- **Remaining P0/P1 after this round:** None (all prior P0/P1 items resolved)
- **P2 intentionally deferred:** None

## Deliverables

1. **`src/types/challenges.ts`** — Refactored to contain only:
   - Imports for `Rarity` and `ModuleType` from `./index` (if still needed by kept exports)
   - Re-exports of `CHALLENGE_DEFINITIONS` from `src/data/challenges.ts`
   - Any helper types/functions that are actually used by `CHALLENGE_DEFINITIONS` in `src/data/challenges.ts`

2. **Verification:** `grep "ChallengeDifficulty" src/types/challenges.ts` returns no matches

## Acceptance Criteria

- [ ] `grep "ChallengeDifficulty" src/types/challenges.ts` returns no matches
- [ ] `grep "export type Challenge" src/types/challenges.ts` returns no matches (remove `Challenge`, `ChallengeRequirement`, `ChallengeReward`, `ValidationResult`, `RequirementDetail` types)
- [ ] `grep "getDifficultyColor\|getDifficultyLabel" src/types/challenges.ts` returns no matches (remove deprecated functions)
- [ ] Build succeeds with 0 TypeScript errors (`npm run build`)
- [ ] All existing tests pass (`npm test`)
- [ ] No imports to removed exports exist in codebase (unless those imports are also removed as part of cleanup)

## Test Methods

1. **Grep verification:** Run grep commands to confirm deprecated code is removed
2. **Build verification:** Run `npm run build` to ensure TypeScript compilation succeeds
3. **Test suite:** Run `npm test` to ensure all 1292+ tests pass
4. **Import audit:** Verify no broken imports by checking build output

## Risks

1. **Breaking imports:** Legacy types/functions may still be imported elsewhere in codebase — requires audit
2. **False removal:** Some functions like `rarityMeetsRequirement` may be in active use — needs verification

## Failure Conditions

1. `grep "ChallengeDifficulty" src/types/challenges.ts` still returns matches
2. Build fails with TypeScript errors
3. Any test fails

## Done Definition

1. `grep "ChallengeDifficulty" src/types/challenges.ts` returns no output
2. `grep "export type Challenge" src/types/challenges.ts` returns no output
3. `grep "getDifficultyColor\|getDifficultyLabel" src/types/challenges.ts` returns no output
4. `npm run build` succeeds with 0 TypeScript errors
5. `npm test` passes all tests

## Out of Scope

- Adding new features
- Refactoring unrelated files
- Adding new test coverage
- Visual/UX improvements
- Any changes to `src/data/challenges.ts` (this file is correct)
- Changes to component files beyond import cleanup
