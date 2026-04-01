# Sprint Contract — Round 86

## APPROVED

---

## Scope

**MUST_FIX: Post-timing-optimization stability verification and Challenge-Codex integration polish**

Following the successful Round 85 timing optimization (834ms activation, 10/10 score), this sprint verifies stability and improves the Challenge System's integration with the Codex by adding challenge completion badges to saved machines.

## Spec Traceability

### P0 items covered this round
- Challenge-Codex integration: Add challenge completion badges to machine codex entries
- Stability verification: Confirm all 2918 tests pass after Round 85 timing changes

### P1 items covered this round
- Challenge metadata storage: Track which challenges a machine was created/completed under

### Remaining P0/P1 after this round
- None — all P0/P1 from spec are complete

### P2 intentionally deferred
- AI naming/description assistant
- Community sharing plaza
- Codex trading/exchanging
- Faction technology tree
- Rune recipe unlock system

## Deliverables

1. **`src/types/challenge.ts`** — Enhanced `ChallengeCompletion` type:
   - Add `machinesUsed: string[]` field to track codex IDs
   - Add `completedAt: string` timestamp

2. **`src/store/challengeStore.ts`** — Modified completion handler:
   - When challenge completes, store associated codex machine IDs
   - Provide query method `getMachinesForChallenge(challengeId)`

3. **`src/components/Codex/CodexDetail.tsx`** — New badge display:
   - Show "Challenge Mastery" badge on machines used in completed challenges
   - Badge displays challenge name and completion date
   - Only visible if machine was used in ≥1 completed challenge

4. **`src/__tests__/challengeCodexIntegration.test.ts`** — Integration tests:
   - Test: Complete challenge → machine gets badge
   - Test: Machine used in multiple challenges → multiple badges
   - Test: Machine not used in challenge → no badge

## Acceptance Criteria

1. **AC-CHALLENGE-BADGE-VISIBLE** — Machines created during or used for completed challenges display a "Challenge Mastery" badge in codex detail view

2. **AC-CHALLENGE-BADGE-CONTENT** — Badge displays:
   - Challenge name
   - Completion date
   - Challenge faction color accent

3. **AC-TEST-STABILITY** — All 2918 existing tests pass (confirming Round 85 timing changes didn't break anything)

4. **AC-BUILD-COMPLIANCE** — Build size < 560KB, 0 TypeScript errors

5. **AC-MULTI-CHALLENGE** — Machine used in multiple completed challenges shows all badges

## Test Methods

1. **AC-CHALLENGE-BADGE-VISIBLE**: Unit test verification:
   ```
   npx vitest run src/__tests__/challengeCodexIntegration.test.ts
   ```
   - Create mock machine with challenge completion
   - Verify badge renders in CodexDetail

2. **AC-CHALLENGE-BADGE-CONTENT**: Unit test verification:
   - Mock challenge: { name: "虚空试炼", faction: "void", completedAt: "2024-01-01" }
   - Verify badge shows: "虚空试炼" and formatted date
   - Verify badge uses void faction color (purple accent)

3. **AC-TEST-STABILITY**: Full test suite:
   ```
   npx vitest run
   ```
   - Pass: All 131 test files, 2918 tests pass
   - Fail if any regressions from Round 85 timing constants

4. **AC-BUILD-COMPLIANCE**: Build verification:
   ```
   npm run build
   ```
   - Pass: dist size < 560KB, 0 TypeScript errors

5. **AC-MULTI-CHALLENGE**: Unit test verification:
   - Machine linked to 3 completed challenges
   - Verify 3 badge components render

## Risks

1. **Test count increase** — Adding new tests increases total test count
   - Mitigation: New tests should pass; existing tests must not break

2. **Badge styling conflict** — Challenge badge may conflict with existing rarity badges
   - Mitigation: Use distinct styling (hexagon shape vs. circle for rarity)

3. **Timing-dependent tests** — Round 85 timing changes might affect transition/animation tests
   - Mitigation: Verify all 2918 tests pass; adjust thresholds only if flaky

## Failure Conditions

1. Any existing test fails after changes
2. Build exceeds 560KB
3. TypeScript compilation errors
4. Challenge badge fails to render for qualifying machines
5. Badge content missing challenge name or date

## Done Definition

1. [ ] `ChallengeCompletion` type enhanced with `machinesUsed` and `completedAt`
2. [ ] `challengeStore.ts` updated to track machine-codex relationships
3. [ ] `CodexDetail.tsx` renders challenge badges when applicable
4. [ ] New integration tests in `challengeCodexIntegration.test.ts` pass
5. [ ] All 2918 existing tests pass
6. [ ] Build succeeds: `npm run build` with 0 errors, size < 560KB
7. [ ] Manual verification: Create machine → complete challenge → check codex shows badge

## Out of Scope

- AI naming/description generation
- Community sharing or social features
- Codex trading/exchange system
- Faction technology tree progression
- Rune recipe unlock mechanics
- Changes to activation timing (completed in Round 85)
- Changes to machine attribute generation rules
- Export format changes
