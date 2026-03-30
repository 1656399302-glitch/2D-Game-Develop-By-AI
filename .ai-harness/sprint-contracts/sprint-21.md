# Sprint Contract — Round 21

## Scope

Single-file remediation: remove `ChallengeDifficulty` from the **type re-exports** in `src/types/challenges.ts`.

This is the **third consecutive round** where AC9 fails for the same reason. The fix is isolated and mechanically deterministic — one item removed from one export list.

---

## Spec Traceability

- **P0:** Not applicable — this is a remediation-only round.
- **P1:** Not applicable.
- **Remaining P0/P1:** None. All prior P0/P1 work is complete.
- **P2 intentionally deferred:** None.

---

## Deliverables

1. **`src/types/challenges.ts`** — edited so that `ChallengeDifficulty` does not appear anywhere in the file (no definition, no re-export).

**Current failing state (from Round 20 QA):**
```typescript
// src/types/challenges.ts (lines 15-22) — MUST CHANGE
export type {
  ChallengeCategory,
  ChallengeDifficulty,  // <-- THIS LINE MUST BE REMOVED
  ChallengeRewardType,
  ChallengeReward,
  ChallengeUnlockCondition,
  ChallengeDefinition,
} from '../data/challenges';
```

**Target state:**
```typescript
// src/types/challenges.ts — TARGET
export type {
  ChallengeCategory,
  ChallengeRewardType,
  ChallengeReward,
  ChallengeUnlockCondition,
  ChallengeDefinition,
} from '../data/challenges';
```

---

## Acceptance Criteria

All must pass for the round to succeed:

| # | Criterion | Evidence |
|---|-----------|----------|
| AC9a | `grep "ChallengeDifficulty" src/types/challenges.ts` returns **no matches** | Round 20: 3 matches in type re-exports |
| AC9b | `grep "export type Challenge" src/types/challenges.ts` returns **no matches** | Round 20: PASS (no matches) |
| AC9c | `grep "getDifficultyColor\|getDifficultyLabel" src/types/challenges.ts` returns **no matches** | Round 20: PASS (no matches) |
| AC9d | `npm run build` succeeds with **0 TypeScript errors** | Round 20: PASS (0 errors) |
| AC9e | `npm test` passes — **all tests pass** | Round 20: 1292/1292 PASS |
| AC9f | No imports from `src/types/challenges` | Round 20: PASS (no imports) |

**Root Cause (per Round 20 QA):** The builder removed the local type definition but kept the re-export of `ChallengeDifficulty` from `src/data/challenges.ts`. The acceptance criterion is explicit: "returns no matches" — any appearance of `ChallengeDifficulty` in `src/types/challenges.ts` is a failure, whether as a local definition OR a re-export.

---

## Test Methods

1. **AC9a grep:** `grep "ChallengeDifficulty" src/types/challenges.ts` — must exit with code 1 (no output).
2. **AC9b grep:** `grep "export type Challenge" src/types/challenges.ts` — must exit with code 1.
3. **AC9c grep:** `grep "getDifficultyColor\|getDifficultyLabel" src/types/challenges.ts` — must exit with code 1.
4. **Build:** `npm run build` — must complete with 0 TypeScript errors.
5. **Tests:** `npm test` — must show all tests passing.
6. **Import audit:** `grep -r "from.*types/challenges" src/ --include="*.ts" --include="*.tsx" | grep -v "data/challenges"` — must exit with code 1.

---

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Accidental build/test regression | Low | Single-line change; build/test run validates |
| Import breakage | None | Import audit confirms no consumers of this file |

---

## Failure Conditions

The round fails if:
- `grep "ChallengeDifficulty" src/types/challenges.ts` returns any matches after the fix.
- Any TypeScript build error is introduced.
- Any test regression is introduced.

---

## Done Definition

The round is complete when:
1. `grep "ChallengeDifficulty" src/types/challenges.ts` returns no matches (exit code 1).
2. `npm run build` succeeds with 0 TypeScript errors.
3. `npm test` passes all tests.
4. All 6 acceptance criteria pass.

---

## Out of Scope

- No new features, components, or logic.
- No changes to `src/data/challenges.ts`.
- No changes to any other file in `src/types/`.
- No UI or visual changes.
- No modifications to test files.

---

**APPROVED**
