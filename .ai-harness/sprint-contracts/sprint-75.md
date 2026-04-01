# APPROVED — Sprint Contract — Round 75

## Scope

**Focus Area:** Tutorial System Enhancement & Achievement System Expansion

This sprint enhances the existing Tutorial and Achievement systems to provide better onboarding, progression tracking, and reward feedback. The goal is to create a more engaging user journey from first-time user to seasoned machine forger.

## Spec Traceability

### P0 Items (Must Complete This Round)
- **Tutorial Callbacks Integration** — Wire up tutorial step callbacks to user actions in the editor
- **Faction-Specific Tutorial Tips** — Show contextual tips when user builds machines for new factions (虚空派系/熔岩派系/风暴派系/星辰派系)
- **Progression Achievement Expansion** — Add milestone achievements (5, 10, 25, 50, 100 machines)
- **Achievement Toast Queue System** — Handle multiple simultaneous achievement unlocks

### P1 Items (Covered This Round)
- Tutorial step completion tracking with store persistence
- Achievement unlock condition improvements
- Enhanced tutorial progress persistence across sessions

### P2 Items Intentionally Deferred
- Full localization support beyond Chinese/English
- Advanced AI-driven tutorial suggestions
- Community achievements (requires backend)

### Remaining P0/P1 After This Round
- All P0 items from spec for Tutorial and Achievement systems will be addressed
- Integration with other systems (Community, Exchange) can follow in subsequent rounds

## Deliverables

1. **Updated `src/stores/tutorialStore.ts`**
   - Add `currentStepCallbacks` map for action-to-step mapping
   - Add `sessionCompletedSteps` tracking within Zustand (replaces module-level variable)
   - Add `triggerStepCompletion(stepId)` action

2. **New `src/components/Tutorial/TutorialTip.tsx`**
   - Floating tip component for faction-specific contextual guidance
   - Shows when user places first module of a new faction type
   - Auto-dismisses after 5 seconds or on user action
   - Component MUST have `data-testid="faction-tip"` attribute

3. **Updated `src/components/Tutorial/TutorialOverlay.tsx`**
   - Wire up `onActionComplete` callbacks
   - Add `data-tutorial-action` attributes to targetable elements
   - Connect to achievement checker on relevant steps

4. **New `src/data/achievements.ts`**
   - Expanded achievement definitions with 15 total achievements
   - New milestones: 5, 10, 25, 50, 100 machines
   - Improved unlock conditions

5. **Updated `src/components/Achievements/AchievementToast.tsx`**
   - Queue system for multiple simultaneous unlocks
   - Stacked toast display with animation
   - Max 3 visible toasts at once
   - Toast MUST have `data-testid="achievement-toast"` attribute

6. **New `src/__tests__/tutorialEnhancement.test.ts`**
   - Tests for callback wiring
   - Tests for faction tip triggers
   - Tests for achievement queue system

7. **New `src/__tests__/achievementExpansion.test.ts`**
   - Tests for new milestone achievements
   - Tests for improved unlock conditions

## Acceptance Criteria

1. **AC1: Tutorial Step Callbacks Wire Up Correctly**
   - TutorialOverlay MUST render with `data-tutorial-action` attributes on Toolbar (data-tutorial-action="toolbar-*"), ModulePanel (data-tutorial-action="module-*"), and Canvas (data-tutorial-action="canvas-*")
   - Completing tutorial steps MUST update `completedSteps` in store to include step ID
   - `completedSteps` MUST persist across page refresh (verify via localStorage or sessionStorage)

2. **AC2: Faction Tips Display Contextually**
   - When user places first module of any faction (虚空派系/熔岩派系/风暴派系/星辰派系), `data-testid="faction-tip"` component MUST appear within 500ms
   - Tip MUST show faction name and one-line guidance text
   - Tip MUST auto-dismiss after exactly 5 seconds (5000ms ± 200ms tolerance)
   - Faction tip for same faction MUST NOT reappear once dismissed

3. **AC3: Milestone Achievements Unlock at Correct Thresholds**
   - Creating exactly 5 machines MUST unlock "学徒锻造师" (Apprentice Forger)
   - Creating exactly 10 machines MUST unlock "熟练工匠" (Skilled Artisan)
   - Creating exactly 25 machines MUST unlock "大师级创作者" (Master Creator)
   - Creating exactly 50 machines MUST unlock "传奇机械师" (Legendary Machinist)
   - Creating exactly 100 machines MUST unlock "永恒锻造者" (Eternal Forger)
   - Achievement unlock MUST NOT trigger at threshold-1 or threshold+1

4. **AC4: Achievement Toast Queue Handles Simultaneous Unlocks**
   - Unlocking 2+ achievements simultaneously MUST show 2+ `data-testid="achievement-toast"` components
   - Max 3 toasts visible at any single moment
   - Toasts MUST display sequentially with 3-second overlap (3000ms ± 200ms)
   - Queue MUST process completely (all toasts shown and dismissed) within 30 seconds

5. **AC5: Tutorial Completion Triggers First Achievement**
   - Completing full tutorial sequence (all steps) MUST unlock "入门者" (Getting Started) achievement
   - AchievementToast MUST appear within 500ms of tutorial completion
   - Toast MUST display correct achievement name and icon

6. **AC6: Store Hydration Works Correctly**
   - Page load with existing tutorial progress (e.g., completedSteps = ["step-1", "step-2"]) MUST restore correct step (step-3)
   - No React hydration warnings in browser console
   - State MUST be consistent between store and UI after hydration completes

7. **AC7: Build Bundle Size Within Budget**
   - Total bundle MUST be < 560KB (current: ~511KB, adding < 50KB)
   - Build MUST succeed with exit code 0

8. **AC8: All Tests Pass**
   - All existing tests (2600+) MUST continue to pass
   - All new tests for enhancement features MUST pass
   - Zero test failures allowed

## Test Methods

### AC1: Tutorial Step Callbacks
```
1. Mount TutorialOverlay with step 3 (Connect modules)
2. Query DOM for element with data-tutorial-action="canvas-connect"
3. Simulate click on that element
4. Assert: store.completedSteps includes "step-3"
5. Verify store has persist middleware configured
6. Call store.getState() after simulated refresh
7. Assert: completedSteps includes "step-3" (persistence verified)
```

### AC2: Faction Tips
```
1. Clear any existing faction tips state
2. Query for data-testid="faction-tip" - assert NOT visible
3. Dispatch addModule action with faction="void"
4. Wait exactly 400ms
5. Query for data-testid="faction-tip" - assert VISIBLE
6. Assert: Tip text contains "虚空"
7. Wait exactly 5200ms
8. Query for data-testid="faction-tip" - assert NOT visible
```

### AC3: Milestone Achievements
```
1. Reset achievement store to initial state
2. Set machinesCreated = 4 in store
3. Assert: "学徒锻造师" NOT in unlockedAchievements
4. Set machinesCreated = 5 in store
5. Assert: "学徒锻造师" IS in unlockedAchievements
6. Set machinesCreated = 9
7. Assert: "熟练工匠" NOT in unlockedAchievements
8. Set machinesCreated = 10
9. Assert: "熟练工匠" IS in unlockedAchievements
10. Repeat pattern for 25, 50, 100 thresholds
11. Negative test: Set machinesCreated = 4, 9, 24, 49, 99 - assert no milestone unlocked
```

### AC4: Toast Queue
```
1. Mock unlockAchievement to trigger 3 achievements simultaneously
2. Query all data-testid="achievement-toast" elements
3. Assert: 3 toast elements exist (or max 3 if queue limit applied)
4. Assert: First toast has visible state true, position 0
5. Wait 3500ms
6. Assert: First toast dismissed (removed from DOM or visible=false)
7. Assert: Second toast now has visible state true, position 0
8. Wait 3500ms
9. Assert: Second toast dismissed
10. Wait 30000ms total from start
11. Assert: All toasts processed and dismissed
```

### AC5: Tutorial → Achievement Link
```
1. Set tutorial store to final step
2. Simulate completeTutorial() action
3. Assert: "入门者" IS in achievementStore.unlockedAchievements
4. Query for data-testid="achievement-toast"
5. Assert: Toast visible with text containing "入门者"
```

### AC6: Hydration
```
1. Pre-populate localStorage: tutorial_completedSteps = ["step-1", "step-2"]
2. Mount TutorialOverlay component
3. Wait for hydration to complete (use waitFor with loading check)
4. Assert: No console warnings containing "hydration" or "mismatch"
5. Assert: Current step is "step-3" (first incomplete)
```

### AC7: Bundle Size
```
Command: npm run build
Assert: Exit code === 0
Assert: dist/assets/*.js files exist
Parse each .js file, sum sizes
Assert: Total size < 560KB (587202 bytes)
```

### AC8: Test Suite
```
Command: npm run test -- --reporter=verbose
Assert: Exit code === 0
Assert: Output contains "passed" with count >= 2600
Assert: Output contains zero "failed"
```

## Risks

1. **Store Hydration Race Conditions** — Tutorial store uses Zustand with `skipHydration: true`. If components render before hydration completes, they may see stale data.
   - Mitigation: Use `useEffect` for initial state sync and provide loading skeleton.
   - Fallback: If hydration issues persist, sprint fails (AC6 failure).

2. **Tutorial Callback Element Targeting** — Adding `data-tutorial-action` attributes requires modifications to existing components (Toolbar, ModulePanel, Canvas).
   - Mitigation: Only add attributes, do not change existing behavior.
   - Verification: All existing tests pass (AC8).

3. **Achievement Toast Queue Z-Index** — Toast queue system must not interfere with tutorial overlay z-index stacking.
   - Mitigation: Set toast z-index lower than tutorial overlay (z-index < 1000).
   - Fallback: If toasts block tutorial, disable queue during active tutorial step.

4. **Test Flakiness** — Drag-and-drop simulation for faction tips may be timing-sensitive.
   - Mitigation: Use Zustand actions directly instead of simulated drag-drop in unit tests.
   - Fallback: If tests are flaky (>5% failure rate on retry), simplify test approach.

5. **Bundle Size Creep** — Adding new components increases bundle size.
   - Mitigation: Code-split achievement and tutorial components.
   - Hard limit: 560KB. If exceeded, must optimize or defer features.

## Failure Conditions

The sprint MUST fail if ANY of the following occur:

1. Bundle size ≥ 560KB after build
2. Any existing test suite failure (regression)
3. Any new test failure (not marked optional)
4. Console errors during tutorial flow (Error level only, warnings acceptable)
5. Faction tips do not appear within 500ms of placing first module
6. Achievement milestones unlock at wrong thresholds (threshold ± 1)
7. Toast queue fails to process all toasts within 30 seconds
8. Tutorial completion does not trigger "入门者" achievement unlock
9. Tutorial store does not persist completedSteps across refresh
10. TypeScript compilation errors (strict mode)

## Done Definition

The round is complete ONLY when ALL of the following are TRUE:

1. ☐ `npm run build` succeeds with exit code 0
2. ☐ Bundle size < 560KB (verified via output parsing)
3. ☐ `npm run test` passes all tests with zero failures
4. ☐ TypeScript compilation with 0 errors (verified via `npx tsc --noEmit`)
5. ☐ TutorialOverlay renders with `data-tutorial-action` attributes on:
   - Toolbar (at least "toolbar-*")
   - ModulePanel (at least "module-*")  
   - Canvas (at least "canvas-*")
6. ☐ TutorialTip component renders with `data-testid="faction-tip"` when first module of faction placed
7. ☐ All 5 new milestone achievements (5, 10, 25, 50, 100 machines) unlock correctly at exact thresholds
8. ☐ AchievementToast queue displays multiple toasts with `data-testid="achievement-toast"` when triggered
9. ☐ Tutorial completion triggers "入门者" achievement unlock
10. ☐ Tutorial store persists `completedSteps` across page refresh (verified via store.getState() after simulated refresh)
11. ☐ No console errors (Error level) during tutorial flow
12. ☐ Hydration works without warnings (AC6 verified)

## Out of Scope

The following are explicitly NOT included in this sprint:

- Backend integration for cloud-saved tutorials or achievements
- Full tutorial localization (currently Chinese/English mixed, additional languages deferred)
- Tutorial analytics/tracking system
- Community achievements (requires backend service)
- Advanced AI-driven tutorial personalization
- Tutorial replay/sharing features
- Achievement badges with actual graphics (use existing text badges)
- Tutorial sound effects or audio cues
- Module SVG assets or new faction designs
- Exchange system integration with achievements
- Challenge system integration with achievements
