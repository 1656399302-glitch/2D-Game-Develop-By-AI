# Sprint Contract — Round 85

## APPROVED

---

## Scope

**MUST_FIX: operator-item-1775053300925** — 激活机器耗时过长问题

Issue: When clicking to activate the machine, the activation process takes excessively long.
- Root cause identified: Activation timing values are too conservative for a responsive UX
- Solution: Reduce all activation durations to approximately 1/3 of original values

## Spec Traceability

### P0 items covered this round
- Activation overlay timing optimization (1/3 original duration)
- Energy path choreography timing optimization (1/3 original duration)
- No spec changes required — this is a UX performance fix

### P1 items covered this round
- None

### Remaining P0/P1 after this round
- None

### P2 intentionally deferred
- None

## Deliverables

1. **`src/components/Preview/ActivationOverlay.tsx`** — Reduced activation phase durations:
   - `chargingDuration`: 800ms → 267ms (÷3)
   - `activatingDuration`: 1200ms → 400ms (÷3)
   - `onlineDuration`: 500ms → 167ms (÷3)
   - Sequential module delay factor: 0.4 → 0.3

2. **`src/utils/activationChoreographer.ts`** — Reduced energy flow choreography timings:
   - `depthDelay`: 200ms → 67ms (÷3)
   - `connectionLeadTime`: 100ms → 33ms (÷3)
   - `totalDuration` calculation: Updated to reflect reduced delays

## Acceptance Criteria

1. **AC-ACTIVATION-DURATION** — Activation overlay completes in ≤900ms for typical 6-module machine (vs ~2500ms previously)
2. **AC-CHOREOGRAPHY-DURATION** — Energy path choreography completes in ≤600ms for 3-depth machine (vs ~1700ms previously)
3. **AC-PHASE-RATIOS** — Phase durations maintain approximately equal ratios (charging:activating:online ≈ 1:1.5:0.6)
4. **AC-VISUAL-INTEGRITY** — All activation phases (charging, activating, online) remain visually distinguishable
5. **AC-TEST-STABILITY** — All existing activation-related tests pass (may need threshold adjustments)

## Test Methods

1. **AC-ACTIVATION-DURATION**: Manual verification with stopwatch on 6-module machine:
   - Click activate button
   - Measure time from click to overlay dismissal
   - Pass: ≤900ms

2. **AC-CHOREOGRAPHY-DURATION**: Unit test verification:
   - `npx vitest run src/__tests__/activationChoreography.test.ts`
   - Verify `totalDuration` for test machines
   - Pass: totalDuration ≤ 600ms for 3-depth machine

3. **AC-PHASE-RATIOS**: Code inspection of updated constants:
   - chargingDuration ≈ 267ms
   - activatingDuration ≈ 400ms
   - onlineDuration ≈ 167ms

4. **AC-VISUAL-INTEGRITY**: Manual browser verification:
   - Activate machine with 6 modules
   - Visually confirm: charging → activating → online phases transition smoothly
   - Pass: All three phase indicators visible during animation

5. **AC-TEST-STABILITY**: Full test suite:
   - `npx vitest run`
   - Pass: All tests pass (may need threshold adjustments for timing-sensitive tests)

## Risks

1. **Timing-sensitive tests may fail** — Tests relying on exact timing values (e.g., `expect(duration).toBe(2500)`) will fail
   - Mitigation: Update test thresholds to new values
   - Files to check: `activation*.test.ts`, `activationChoreography.test.ts`

2. **Animations may feel rushed** — Very fast animations might reduce perceived quality
   - Mitigation: Verify visual integrity manually; reduce only if transitions remain distinguishable

3. **Energy path animation readability** — Faster connection lighting may reduce user comprehension
   - Mitigation: Ensure connectionLeadTime (33ms) is sufficient for visual detection

## Failure Conditions

1. Activation overlay total duration exceeds 1000ms for 6-module machine
2. Any activation phase becomes visually indistinguishable from adjacent phases
3. Test suite failures after updating timing constants
4. Energy path choreography produces negative or zero duration values

## Done Definition

1. All timing constants reduced to 1/3 original values:
   - [ ] `chargingDuration = 267` in ActivationOverlay.tsx
   - [ ] `activatingDuration = 400` in ActivationOverlay.tsx
   - [ ] `onlineDuration = 167` in ActivationOverlay.tsx
   - [ ] `sequentialDelayFactor = 0.3` (was 0.4)
   - [ ] `depthDelay = 67` in activationChoreographer.ts
   - [ ] `connectionLeadTime = 33` in activationChoreographer.ts
2. Test suite passes: `npx vitest run` with 0 failures
3. Build succeeds: `npm run build` with 0 TypeScript errors
4. Manual verification confirms:
   - Activation completes noticeably faster (≤1 second feel)
   - All phases remain visually distinct
5. All changes documented with `FIX (Round 85)` comments

## Out of Scope

- Adding new activation features or modes
- Modifying failure/overload mode timings (handled separately by AUTO_RETURN_DELAY)
- Changes to machine attribute generation system
- Changes to module SVG visuals or animations
- Any changes beyond activation timing optimization
