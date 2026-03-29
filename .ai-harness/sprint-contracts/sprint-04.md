# Sprint Contract — Round 4

## Scope

**Remediation Sprint**: Fix the single blocking bug from Round 3 QA that caused acceptance criteria 5 and 6 to fail. This is a targeted text-literal fix only.

## Spec Traceability

### Round 3 QA Results Summary
| Criterion | Status | This Sprint |
|-----------|--------|-------------|
| AC1: Toolbar Button 1 Visible | PASS | No action needed |
| AC2: Toolbar Button 2 Visible | PASS | No action needed |
| AC3: Failure Mode Triggerable | PASS | No action needed |
| AC4: Overload Mode Triggerable | PASS | No action needed |
| **AC5: Failure Mode Chinese Text** | **FAIL** | **Must fix** |
| **AC6: Overload Mode Chinese Text** | **FAIL** | **Must fix** |
| AC7: Auto-Recovery Works | PASS | No action needed |
| AC8: No Test Regression | PASS | No action needed |
| AC9: Build Clean | PASS | No action needed |

### Status After This Sprint
- **P0 items**: All P0 items implemented (Round 3)
- **P1 items**: All P1 items implemented (Round 3)
- **Remaining P0/P1 after this round**: None
- **P2 items**: Deferred (out of scope)

## Root Cause

`src/components/Preview/ActivationOverlay.tsx` lines ~224-232:
```typescript
const getTitle = () => {
  switch (phase) {
    case 'failure':
      return '⚠ SYSTEM FAILURE';  // ← WRONG (English)
    case 'overload':
      return '⚡ CRITICAL OVERLOAD';  // ← WRONG (English)
    // ...
  }
};
```

## Deliverables

1. **Fixed `src/components/Preview/ActivationOverlay.tsx`**
   - Line ~226: Change `return '⚠ SYSTEM FAILURE'` → `return '⚠ 机器故障'`
   - Line ~229: Change `return '⚡ CRITICAL OVERLOAD'` → `return '⚡ 系统过载'`

## Acceptance Criteria

1. **AC1 (from Round 3 AC5)**: Clicking "⚠ 测试故障" triggers overlay displaying "⚠ 机器故障" — NOT English text
2. **AC2 (from Round 3 AC6)**: Clicking "⚡ 测试过载" triggers overlay displaying "⚡ 系统过载" — NOT English text
3. **AC3**: `npm run build` exits with code 0 and 0 TypeScript errors
4. **AC4**: `npm test` shows 438/438 passing tests (no regressions)

## Test Methods

1. **Browser verification** (per QA Round 3 method):
   - Click "⚠ 测试故障" → `document.body.innerText.includes('⚠ 机器故障')` must return `true`
   - Click "⚡ 测试过载" → `document.body.innerText.includes('⚡ 系统过载')` must return `true`

2. **Build verification**:
   - Execute `npm run build`
   - Verify exit code is 0
   - Verify 0 TypeScript errors

3. **Test suite verification**:
   - Execute `npm test`
   - Verify exactly 438/438 tests pass

## Risks

1. **Risk level**: LOW — single file, two line changes
2. **Risk mitigation**: No architectural changes; text literal replacement only
3. **Risk mitigation**: 438/438 existing tests provide regression protection

## Failure Conditions

The round MUST fail if ANY of these conditions occur:

1. Overlay text is still in English after fix ("⚠ SYSTEM FAILURE" or "⚡ CRITICAL OVERLOAD" present)
2. `npm run build` fails or exits with non-zero code
3. TypeScript errors present in build output
4. `npm test` shows fewer than 438/438 passing tests
5. New bugs introduced in other overlay functionality (animation, auto-recovery, etc.)

## Done Definition

The round is **complete** when ALL of the following are true:

- [ ] `ActivationOverlay.tsx` `getTitle()` returns `'⚠ 机器故障'` when `phase === 'failure'`
- [ ] `ActivationOverlay.tsx` `getTitle()` returns `'⚡ 系统过载'` when `phase === 'overload'`
- [ ] `npm run build` exits with code 0 and 0 TypeScript errors
- [ ] `npm test` shows 438/438 passing tests
- [ ] Browser test confirms "⚠ 机器故障" appears in failure overlay
- [ ] Browser test confirms "⚡ 系统过载" appears in overload overlay
- [ ] All other overlay functionality (animations, auto-recovery) unchanged

## Out of Scope

- No new features or modules
- No UI/UX changes beyond the two text literals
- No state management modifications
- No architecture changes
- No additional test coverage (existing tests sufficient)
- No other bug fixes (only AC5 and AC6 from Round 3)
