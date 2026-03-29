# Sprint Contract — Round 9 (REVISED)

## Scope

This sprint integrates the new Challenge Mode system into the application by replacing the broken ChallengeBrowser with ChallengePanel, connects the AchievementToast to achievement store callbacks, and adds automated integration test coverage for these changes.

---

## Spec Traceability

### P0 Items (Must Complete)
1. **ChallengePanel Integration** — Replace ChallengeBrowser with ChallengePanel in App.tsx (fixes QA bug: ChallengePanel NOT integrated)
2. **AchievementToast Integration** — Connect AchievementToast to achievement store callbacks (fixes toast never showing)
3. **Automated Integration Tests** — Add test coverage for modal integration points

### P1 Items (Must Pass)
4. **Existing Tests Pass** — All 739+ tests continue to pass
5. **Build Succeeds** — TypeScript compilation with zero errors

### P2 Intentionally Deferred
- Challenge celebration animations
- Badge showcase in header
- ChallengeProgress component integration
- useChallengeTracker hook integration

---

## Deliverables

### 1. `src/App.tsx` — ChallengePanel Integration
- Import `ChallengePanel` from `src/components/Challenge/ChallengePanel`
- Remove `ChallengeBrowser` import and usage entirely
- Replace `showChallenges && <ChallengeBrowser ... />` with `<ChallengePanel />`
- Update `ChallengeButton` onClick to toggle ChallengePanel visibility

**Rationale:** ChallengeBrowser has a critical React rendering error ("Failed to execute 'insertBefore'"). ChallengePanel is the new reward-based system and already has proper accessible list structure (`role="list"`).

### 2. `src/store/useAchievementStore.ts` — Toast Callback Integration
- Add `onUnlockCallback: ((achievement: Achievement) => void) | null` to store state
- Add `setOnUnlockCallback: (callback: (achievement: Achievement) => void) | null) => void` action
- Call `onUnlockCallback(achievement)` when `unlockAchievement` completes

### 3. `src/App.tsx` — AchievementToast Connection
- Add `useEffect` that calls `useAchievementStore.getState().setOnUnlockCallback(handleAchievementUnlock)`
- `handleAchievementUnlock` sets `currentAchievement` state
- Add auto-dismiss via `setTimeout` (5 seconds) calling `setCurrentAchievement(null)`

### 4. `src/__tests__/challenge-integration.test.ts` — Automated Tests
- Unit test: ChallengePanel renders with `role="list"`
- Integration test: Clicking ChallengeButton renders ChallengePanel
- Integration test: Opening/closing modal 10 times without React errors
- Unit test: AchievementToast callback integration

---

## Acceptance Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC1 | ChallengePanel renders when ChallengeButton clicked | Automated: Click button, assert ChallengePanel in DOM with `role="list"` |
| AC2 | ChallengeBrowser is NOT rendered anywhere in App.tsx | Automated: Grep App.tsx for "ChallengeBrowser" returns 0 matches |
| AC3 | No React errors on modal open/close (10 iterations) | Automated: Open/close modal 10x, assert no errors thrown |
| AC4 | AchievementToast displays when achievement unlocks | Automated: Call `unlockAchievement`, assert `currentAchievement` state updates |
| AC5 | All 739+ existing tests pass | Automated: `npm test` exits 0 with all tests passing |
| AC6 | Build succeeds with 0 TypeScript errors | Automated: `npm run build` exits 0 |

---

## Test Methods

### Automated Integration Tests (Required)

**1. ChallengePanel Rendering Test**
```typescript
test('ChallengePanel renders with accessible list structure', () => {
  render(<ChallengePanel />);
  expect(screen.getByRole('list')).toBeInTheDocument();
});
```

**2. ChallengeButton Integration Test**
```typescript
test('ChallengeButton opens ChallengePanel', async () => {
  render(<App />);
  fireEvent.click(screen.getByText(/challenges/i));
  expect(await screen.findByRole('list')).toBeInTheDocument();
});
```

**3. Modal Stability Test**
```typescript
test('Modal can open/close 10 times without errors', () => {
  const { getByText } = render(<App />);
  for (let i = 0; i < 10; i++) {
    fireEvent.click(getByText(/challenges/i));
    fireEvent.click(getByText(/close/i));
  }
  // Assert no errors thrown
});
```

**4. AchievementToast Callback Test**
```typescript
test('AchievementToast fires on unlock', () => {
  const mockCallback = jest.fn();
  useAchievementStore.getState().setOnUnlockCallback(mockCallback);
  act(() => {
    useAchievementStore.getState().unlockAchievement('first-machine');
  });
  expect(mockCallback).toHaveBeenCalled();
});
```

**5. ChallengeBrowser Removal Test**
```typescript
test('ChallengeBrowser is not imported in App.tsx', () => {
  const appContent = fs.readFileSync('src/App.tsx', 'utf8');
  expect(appContent).not.toMatch(/ChallengeBrowser/);
});
```

---

## Risks

### 1. ChallengeBrowser Removal Side Effects
- **Risk:** ChallengeBrowser may have dependent components or tests
- **Mitigation:** Verify all tests pass after removal; ChallengeBrowser component file remains but is not imported

### 2. Achievement Store Backward Compatibility
- **Risk:** Adding `onUnlockCallback` may break existing store usage
- **Mitigation:** Initialize as `null`; existing `unlockAchievement` calls work without callback

### 3. Test File Location
- **Risk:** New integration test file may not be picked up by test runner
- **Mitigation:** Place in `src/__tests__/` alongside existing test files; verify with `npm test`

---

## Failure Conditions

The round fails if ANY of the following occur:

1. **ChallengePanel NOT accessible** — ChallengeButton click does not render ChallengePanel
2. **ChallengeBrowser still in App.tsx** — Grep returns > 0 matches
3. **React rendering errors** — Any error when opening challenge modal
4. **AchievementToast not connected** — `currentAchievement` remains `null` after unlock
5. **Existing tests fail** — `npm test` exits non-zero
6. **Build fails** — `npm run build` exits non-zero or TypeScript errors present

---

## Done Definition

Exact conditions that must be true before claiming the round complete:

- [ ] `ChallengePanel` is imported in `src/App.tsx`
- [ ] `ChallengeBrowser` is NOT imported in `src/App.tsx`
- [ ] `showChallenges && <ChallengePanel />` pattern replaces ChallengeBrowser usage
- [ ] `useAchievementStore` has `onUnlockCallback` state and `setOnUnlockCallback` action
- [ ] `App.tsx` calls `setOnUnlockCallback` with handler that sets `currentAchievement`
- [ ] `src/__tests__/challenge-integration.test.ts` exists with all 5 tests
- [ ] `npm test` passes all tests (expected 743+)
- [ ] `npm run build` succeeds with 0 TypeScript errors
- [ ] Manual verification: Click Challenges button → ChallengePanel renders with list

---

## Out of Scope

Explicitly NOT being done this round:

- **ChallengeBrowser debugging** — The React rendering error is bypassed by replacement, not fixed
- **ChallengeProgress integration** — Component exists but not added to UI
- **useChallengeTracker integration** — Hook exists but not wired to app events
- **New challenge definitions** — 8 challenges already exist
- **AchievementToastContainer component** — No new component; fixing existing integration
- **FactionPanel accessibility** — Already accessible per ExportModal integration
- **Celebration animations** — Toast dismissal uses simple timeout, not animations
- **Badge showcase** — Displayed in existing AchievementToast, not expanded
