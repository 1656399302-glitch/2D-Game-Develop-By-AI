APPROVED

# Sprint Contract — Round 164

## Scope

Fix remaining `act()` warnings in `src/components/Editor/__tests__/Canvas.test.tsx`. The test file renders the Canvas component which triggers React state updates (viewport size detection, store subscriptions) that are not wrapped in `act()`. This is the same pattern fixed in Rounds 162 and 163 for other test files.

## Spec Traceability

- **P0 items covered this round:**
  - Test quality remediation: Eliminate `act()` warnings in `Canvas.test.tsx`

- **P1 items covered this round:**
  - Maintain test count ≥ 6865 tests
  - Maintain build ≤ 512 KB

- **Remaining P0/P1 after this round:**
  - Continue test quality remediation for other test files with act() warnings (project-wide)
  - All functional features remain tested and passing

- **P2 intentionally deferred:**
  - New feature development
  - Performance optimization beyond current tests
  - Additional UI polish

## Deliverables

1. **Modified file:** `src/components/Editor/__tests__/Canvas.test.tsx`
   - Add proper `act()` wrapping for all state-mutating operations
   - Add `flushUpdates()` helper function for React 18 async handling
   - Ensure all store mock updates are wrapped in `act()`
   - Add file header comment documenting Round 164 fix

2. **Verification:**
   - `npm test -- --run src/components/Editor/__tests__/Canvas.test.tsx` exits code 0
   - No `act()` warnings in Canvas.test.tsx output

## Acceptance Criteria

1. **AC-164-001:** `src/components/Editor/__tests__/Canvas.test.tsx` runs with 0 `act()` warnings
   - Criterion: `npm test -- --run src/components/Editor/__tests__/Canvas.test.tsx 2>&1 | grep -i "act.*warning"` returns empty

2. **AC-164-002:** All state-mutating store calls are wrapped in `act()`
   - Criterion: Mock store updates and `vi.useFakeTimers()` operations wrapped in `await act(async () => { ... })`

3. **AC-164-003:** All Canvas tests pass
   - Criterion: `npm test -- --run src/components/Editor/__tests__/Canvas.test.tsx` shows all tests passing

4. **AC-164-004:** Full test suite continues to pass
   - Criterion: `npm test -- --run` shows 238 test files, all passing (≥ 6865 tests)

5. **AC-164-005:** Build passes with bundle ≤ 512 KB
   - Criterion: `npm run build` succeeds with main bundle ≤ 524,288 bytes

## Test Methods

1. **AC-164-001 & AC-164-002:** 
   ```
   npm test -- --run src/components/Editor/__tests__/Canvas.test.tsx 2>&1 | grep -i "act.*warning"
   ```
   Expected: No matches (0 act() warnings)

2. **AC-164-003:**
   ```
   npm test -- --run src/components/Editor/__tests__/Canvas.test.tsx
   ```
   Expected: All tests pass, exit code 0

3. **AC-164-004:**
   ```
   npm test -- --run
   ```
   Expected: 238 test files, ≥ 6865 tests, all passing

4. **AC-164-005:**
   ```
   npm run build && ls -la dist/assets/index-*.js
   ```
   Expected: Main bundle ≤ 512 KB (524,288 bytes)

## Risks

1. **React 18 async rendering:** The `flushUpdates()` pattern from Round 163 may need adaptation for Canvas test timing
2. **Fake timers interaction:** `vi.useFakeTimers()` interacts with `act()` and may require special handling
3. **Lazy component rendering:** Canvas renders lazy-loaded components; state updates from these need `act()` wrapping

## Failure Conditions

1. Any `act()` warnings remain in Canvas.test.tsx output
2. Any Canvas tests fail
3. Full test suite drops below 6865 tests
4. Build exceeds 512 KB limit
5. TypeScript compilation fails

## Done Definition

All of the following must be true before claiming round complete:

1. ✅ `npm test -- --run src/components/Editor/__tests__/Canvas.test.tsx` exits with code 0
2. ✅ No `act()` warnings appear in Canvas.test.tsx output (verified via grep)
3. ✅ All Canvas tests pass (verified by test output)
4. ✅ `npm test -- --run` shows 238 test files, all passing (≥ 6865 tests)
5. ✅ `npm run build` succeeds with bundle ≤ 512 KB

## Out of Scope

- No changes to production code (only test files modified)
- No changes to other test files unless directly related to fixing Canvas.test.tsx
- No new features or functionality
- No changes to component implementations
