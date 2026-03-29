APPROVED

# Sprint Contract — Round 15

## Scope

**Primary Focus:** Tutorial/Onboarding System — A guided walkthrough that teaches new users how to use the Arcane Machine Codex Workshop.

## Spec Traceability

### P0 Items (Must Complete)
- **Tutorial System Core:**
  - Step-by-step guided tour with visual highlights and tooltips
  - Tutorial state persistence (skip on subsequent visits)
  - Module basics: drag, place, select, delete
  - Connection basics: connecting modules
  - Activation basics: starting the machine
  - Save to Codex basics
  - Completion celebration and tutorial disable option

### P1 Items (Covered This Round)
- Welcome modal with tutorial option
- 6-step interactive tutorial covering core features
- Spotlight/highlight system for target elements
- Tooltip system with descriptions and hints
- Progress indicator showing tutorial step
- "Skip Tutorial" and "Next Time" options
- First-time user detection and auto-trigger

### Remaining P0/P1 After This Round
- **P0:** All core features already implemented (module editor, connections, activation, codex, challenges, export)
- **P1:** AI naming integration (deferred to future round), Sound effects (P2)

### P2 Intentionally Deferred
- Sound effects and audio feedback
- AI-powered naming/description generation
- Community sharing features
- Faction competition system

## Deliverables

1. **`src/components/Tutorial/`** — Tutorial system components
   - `TutorialOverlay.tsx` — Main tutorial orchestrator with step management
   - `TutorialTooltip.tsx` — Floating tooltip with arrow pointing to target
   - `TutorialSpotlight.tsx` — Dimming overlay with cutout for target elements
   - `WelcomeModal.tsx` — First-time user welcome with tutorial option
   - `TutorialProgress.tsx` — Step indicator (e.g., "Step 3 of 6")

2. **`src/store/useTutorialStore.ts`** — Zustand store for tutorial state
   - Tutorial enabled/disabled status
   - Current step tracking
   - Completed steps
   - localStorage persistence

3. **`src/data/tutorialSteps.ts`** — Tutorial step definitions
   - 6 tutorial steps with targets, content, positions

4. **Integration in `src/App.tsx`** — Welcome modal trigger on first visit

5. **Tests:**
   - `src/__tests__/tutorialSystem.test.ts` — Tutorial flow tests

## Acceptance Criteria

1. **First-time detection works:** System detects new users and shows welcome modal on first visit (or after long absence)
2. **Welcome modal displays:** Shows greeting, brief intro, and "Start Tutorial" vs "Skip" options
3. **Tutorial overlay appears:** Dimmed background with spotlight cutout for target element
4. **Tooltip follows target:** Tooltip positioned near target element with pointer arrow
5. **6 tutorial steps complete flow:**
   - Step 1: Welcome + module panel introduction (highlight left panel)
   - Step 2: Drag a module to canvas (await user action)
   - Step 3: Select and rotate module (highlight selected module controls)
   - Step 4: Connect two modules (highlight connection ports)
   - Step 5: Activate machine (highlight Activate button)
   - Step 6: Save to Codex (highlight Save button) + completion celebration
6. **Skip functionality:** User can skip tutorial at any point
7. **Progress persists:** Tutorial completion status saved to localStorage
8. **Return users skip:** Previously completed tutorial users don't see it again
9. **Non-blocking:** Can be dismissed and re-triggered from help menu

## Test Methods

1. **New user detection:**
   - Clear localStorage `arcane-codex-tutorial`
   - Refresh page → Welcome modal should appear

2. **Tutorial flow:**
   - Click "Start Tutorial"
   - Step 1: Verify spotlight on module panel
   - Step 2: Drag module → should advance
   - Step 3: Click module → verify rotate hint appears
   - Step 4: Connect modules → verify connection flow
   - Step 5: Click Activate → verify machine starts
   - Step 6: Click Save → verify codex save + celebration

3. **Skip and persistence:**
   - Click "Skip Tutorial" → modal closes, status saved
   - Refresh → no welcome modal
   - Reset localStorage → modal reappears

4. **Non-interference:**
   - Complete tutorial
   - Use all features normally (add modules, save, export)
   - No regressions in existing functionality

## Risks

1. **Spotlight positioning edge cases:** Target elements near screen edges may cause tooltip overflow
   - *Mitigation:* Implement smart positioning (flip tooltip side if near edge)

2. **Dynamic content shifts:** Canvas zoom/pan may move target elements during tutorial
   - *Mitigation:* Use fixed viewport for tutorial steps, disable pan/zoom during active step

3. **Integration complexity:** Tutorial needs to coordinate with multiple store slices
   - *Mitigation:* Use dedicated tutorial store, emit events to trigger actions

4. **Test coverage:** Tutorial interaction tests may be fragile
   - *Mitigation:* Test at store level (state transitions) and component level (render), less on user flow

## Failure Conditions

1. Tutorial modal appears on every page load (persistence broken)
2. Tutorial blocks core functionality (can't close, can't skip)
3. Tutorial steps don't advance on user action
4. Existing features broken after tutorial integration
5. Build fails with TypeScript errors
6. Any existing test fails

## Done Definition

All conditions must be true:
- [ ] `npm run build` exits with 0 errors
- [ ] `npm test` exits with 0 failures (all 371+ existing tests pass)
- [ ] Welcome modal appears for new users (localStorage cleared)
- [ ] Welcome modal does NOT appear for returning users (completed tutorial)
- [ ] All 6 tutorial steps render correctly with spotlights
- [ ] Tutorial advances on correct user actions
- [ ] Tutorial can be skipped at any point
- [ ] Completion status persists across page refreshes
- [ ] No visual regressions in existing UI

## Out of Scope

- Sound effects and audio feedback
- Animated mascot/character for tutorial
- Multi-language support for tutorial text
- Partial tutorial replay (re-watch specific steps)
- Difficulty selection for tutorial
- Advanced tip system beyond tutorial
