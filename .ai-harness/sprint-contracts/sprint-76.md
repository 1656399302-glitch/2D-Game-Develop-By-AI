APPROVED

# Sprint Contract — Round 76

## Scope
This sprint is a **remediation sprint** focused exclusively on fixing critical integration failures from Round 75. The new achievement system exists in code (`data/achievements.ts`, 15 achievements with milestone system) but is NOT connected to the application UI. No new features will be added.

## Spec Traceability

### P0 items covered this round (fixing Round 75 failures)
1. **Achievement Data Integration** — Update `AchievementList.tsx` and `AchievementToast.tsx` to import from `data/achievements.ts` instead of `types/factions.ts`
2. **Tutorial → Achievement Trigger** — Connect tutorial completion event to achievement unlock system (unlocks "入门者" achievement)
3. **Toast Queue Integration** — Wire `AchievementToastContainer` into App.tsx with `useAchievementToastQueue` hook

### Remaining P0/P1 after this round
- None — all Round 75 acceptance criteria should be satisfied after this fix

### P2 items intentionally deferred
- AI naming/description assistant
- Community sharing
- Faction tech tree
- Challenge mode

---

## Deliverables

### 1. Fixed AchievementList.tsx
- File: `src/components/Achievement/AchievementList.tsx`
- Update import from `'../../types/factions'` to `'../../data/achievements'`
- Update type references to use extended Achievement types with milestone support
- AchievementList must display all 15 achievements with progress indicators for milestone achievements

### 2. Fixed AchievementToast.tsx  
- File: `src/components/Achievement/AchievementToast.tsx`
- Update import from `'../../types/factions'` to `'../../data/achievements'`
- Use proper extended achievement type with description, icon, and faction properties

### 3. Tutorial → Achievement Integration
- File: `src/App.tsx` (or appropriate location)
- Listen for `tutorial:completed` event dispatched by `useTutorialStore.markTutorialCompleted()`
- Call `useAchievementStore.checkAndTriggerAchievements({ tutorialCompleted: true })` when event fires
- This unlocks the "入门者" (Getting Started) achievement

### 4. Toast Queue Integration
- File: `src/App.tsx`
- Replace single `AchievementToast` with `AchievementToastContainer` component
- Wire `useAchievementToastQueue` hook to the container
- Ensure multiple simultaneous achievements queue properly (maxVisible=3, staggerDelay=3000)

### 5. AchievementToastContainer (if not already integrated)
- File: `src/components/Achievement/AchievementToastContainer.tsx`
- Ensure container is imported and rendered in App.tsx
- Verify queue system handles achievement unlocks from any source

---

## Acceptance Criteria

### AC1: AchievementList shows 15 achievements
- [ ] AchievementList displays "0 / 15 已解锁" (or appropriate count if some pre-unlocked)
- [ ] All 15 achievements visible including milestone achievements (学徒锻造师, 熟练工匠, 大师级创作者, 传奇机械师, 永恒锻造者)
- [ ] Tutorial achievement "入门者" visible in list
- [ ] "初次激活" achievement visible in list

### AC2: Milestone achievements show progress
- [ ] Milestone achievements display current progress (e.g., "0/5 machines" for 学徒锻造师)
- [ ] Progress bars or numeric indicators reflect actual stat values

### AC3: Tutorial completion triggers achievement
- [ ] Complete tutorial flow
- [ ] "入门者" achievement unlocks and appears in toast notification
- [ ] Achievement shows as unlocked in AchievementList

### AC4: Toast queue system active
- [ ] Multiple simultaneous achievements display in sequence
- [ ] Queue shows up to 3 visible toasts at once
- [ ] New achievements wait 3 seconds before next appears
- [ ] AchievementToastContainer renders in UI

### AC5: Build passes
- [ ] `npm run build` succeeds with 0 TypeScript errors
- [ ] Bundle size < 560KB

### AC6: Tests pass
- [ ] `npx vitest run` passes all existing tests
- [ ] No regressions in tutorial, achievement, or related tests

---

## Test Methods

### TM1: AchievementList Integration Test
1. Open application at http://localhost:5173
2. Open browser DevTools console
3. Navigate to Achievements panel (click "成就" button in header)
4. Count displayed achievements in DOM
5. **Pass:** Must show exactly 15 achievements
6. **Fail:** If shows only 8 achievements, integration is broken

### TM2: Milestone Progress Display Test
1. Open Achievements panel
2. Find milestone achievements (学徒锻造师, 熟练工匠, etc.)
3. Verify progress indicators visible
4. **Pass:** Progress "X/Y" format visible for each milestone achievement

### TM3: Tutorial → Achievement Unlock Test
1. Clear any existing tutorial state (localStorage)
2. Start tutorial flow
3. Complete all tutorial steps
4. Observe achievement toast appears for "入门者"
5. Check AchievementList for unlocked status
6. **Pass:** Toast shown, achievement marked as unlocked

### TM4: Toast Queue Test
1. Manually trigger 4 achievement unlocks via console or test helper
2. Observe toast behavior
3. **Pass:** Toasts appear in sequence, max 3 visible, 3-second stagger

### TM5: Build and Test Verification
```bash
npm run build
# Pass if exit code 0, bundle < 560KB

npx vitest run
# Pass if all 2645+ tests pass
```

---

## Risks

### Risk 1: Import Path Conflicts
- **Description:** Changing imports from `types/factions` to `data/achievements` may cause type conflicts
- **Mitigation:** Verify both files export compatible types; update imports incrementally and test build
- **Fallback:** Create type re-exports if needed

### Risk 2: Achievement Type Mismatch
- **Description:** Extended Achievement type may have different shape than original
- **Mitigation:** Check `data/achievements.ts` type definitions; update components to handle extended properties
- **Fallback:** Add type casting or create adapter functions

### Risk 3: Event Timing Issues
- **Description:** Tutorial completion event may fire before achievement store is ready
- **Mitigation:** Use proper event listener setup in useEffect with dependency array
- **Fallback:** Debounce achievement checks or use store actions directly

### Risk 4: Regression in Existing Functionality
- **Description:** Changes to imports may break other components using same imports
- **Mitigation:** Run full test suite after changes; check for compilation errors
- **Fallback:** Update all dependent files if type changes are necessary

---

## Failure Conditions

The round fails if ANY of the following are true:

1. **AchievementList still shows 8 achievements** — Integration fix not applied
2. **Build fails** — TypeScript errors or bundle size > 560KB
3. **Tests fail** — Any existing tests broken by import changes
4. **Tutorial achievement "入门者" not visible** — Still using old data source
5. **Toast queue not functioning** — Single toast only, no queue behavior

---

## Done Definition

All conditions must be TRUE before claiming round complete:

1. ✅ `AchievementList.tsx` imports from `data/achievements.ts`
2. ✅ `AchievementToast.tsx` imports from `data/achievements.ts`  
3. ✅ AchievementList displays exactly **15 achievements** in browser
4. ✅ Milestone achievements show progress indicators
5. ✅ Tutorial completion triggers "入门者" achievement unlock
6. ✅ AchievementToastContainer renders with queue system active
7. ✅ `npm run build` succeeds (0 TypeScript errors, bundle < 560KB)
8. ✅ `npx vitest run` passes (no regressions)

---

## Out of Scope

The following are explicitly NOT part of this sprint:

- Any new SVG modules or machine editor features
- New achievement definitions (15 are already defined)
- AI text generation integration
- Community or sharing features
- UI visual improvements beyond fixing integration
- Faction tech tree or challenge modes
- Tutorial step additions or modifications (beyond linking to achievement)
- Export functionality changes
- Performance optimizations unrelated to the integration fix
