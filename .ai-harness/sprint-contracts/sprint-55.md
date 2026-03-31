# Sprint Contract — Round 55

**APPROVED**

## Scope

**Sprint Theme:** Accessibility Enhancement & Connection Path Refinement

This sprint focuses on improving the accessibility of the machine editor and refining the connection path rendering system. The goal is to make the application more usable for all users while maintaining the high quality standards established in Round 54.

## Spec Traceability

### P0 Items (Critical — Must Complete)
- **Enhanced ARIA Live Regions** — Add screen reader announcements for machine activation states, connection creation, module operations, and error messages
- **Connection Path Rendering Fix** — Resolve SVG path rendering issues where connections may not display correctly when modules are repositioned
- **Focus Management Improvements** — Ensure proper keyboard focus handling when modals open/close and during module selection

### P1 Items (Important — Should Complete)
- **Skip Navigation Link** — Add skip-to-content link for keyboard users
- **Connection Error State Improvements** — Enhanced visual and audio feedback for connection errors
- **Tab Order Documentation** — Ensure logical tab order through the editor interface

### P2 Items (Nice to Have — Intentionally Deferred)
- AI naming/description API integration
- Community trading system
- Faction technology tree expansion
- Additional faction variant modules

### Remaining P0/P1 After This Round
- All P0 items from spec are covered; remaining work is polish and edge cases
- P1 items around community features and AI integration remain optional extensions

## Deliverables

1. **Accessibility Layer Enhancements** (`src/components/Accessibility/AccessibilityLayer.tsx`)
   - Enhanced live region announcements for machine state changes
   - Screen reader instructions for connection creation workflow
   - ARIA labels for all interactive canvas elements

2. **Connection Path Rendering Fix** (`src/utils/connectionEngine.ts`)
   - Bug fix: Ensure connection paths update correctly when modules are moved
   - Add path recalculation on module position change
   - Add memoization for path calculations to improve performance

3. **Focus Management Module** (`src/components/Accessibility/FocusManager.tsx`)
   - Focus trap for modals
   - Return focus to trigger element when modals close
   - Skip navigation link component

4. **Test Files**
   - `src/__tests__/connectionEngineFix.test.ts` — Tests for connection path recalculation
   - `src/__tests__/accessibilityEnhancements.test.tsx` — Tests for ARIA live regions
   - `src/__tests__/focusManagement.test.tsx` — Tests for focus management

## Acceptance Criteria

1. **AC1: Screen Reader Announcements** — Machine activation states (charging, active, failure, overload) are announced via ARIA live regions with descriptive messages

2. **AC2: Connection Path Updates** — When a module is moved, all connected paths update correctly and display the new path without visual artifacts (ghost paths, overlapping paths, or stale renderings)

3. **AC3: Focus Management** — When Export Modal, Codex Modal, or Community Gallery opens, focus moves to the modal; when closed via Escape or button, focus returns to the triggering element

4. **AC4: Skip Navigation** — Keyboard users can skip directly to the editor canvas using a visible skip link that appears on first Tab press

5. **AC5: Connection Error Feedback** — Connection errors (duplicate connections, type mismatches) display both visual toast AND announce via live region

6. **AC6: Build Integrity** — `npm run build` completes with 0 TypeScript errors and `npm test` passes with all existing 2003 tests plus new tests passing

## Test Methods

### AC1 Verification (Screen Reader Announcements)
1. Open browser dev tools, inspect the DOM for elements with `role="status"` or `aria-live="polite"`
2. Trigger machine activation sequence (start machine)
3. Inspect that live region contains text content matching activation states (charging, activated, overload, failure)
4. Verify live region exists for connection creation events
5. Run `npm test -- --run src/__tests__/accessibilityEnhancements.test.tsx` — verify tests pass

### AC2 Verification (Connection Path Updates)
1. Create a machine with 3+ modules and connections using the random forge
2. In browser, drag a module to a new position
3. Immediately inspect the SVG paths — verify no duplicate paths remain from old position
4. Verify all connected paths render with correct Bezier curves to new position
5. Run `npm test -- --run src/__tests__/connectionEngineFix.test.ts` — verify all path recalculation tests pass
6. Inspect that `updatePathForModule(moduleId)` is called after position change in source

### AC3 Verification (Focus Management)
1. Load the app, press Tab once — verify focus is on skip link (AC4 pass)
2. Press Tab again — verify focus moves into main content
3. Navigate to Export button, press Enter — verify focus is inside the modal dialog
4. Press Escape — verify modal closes AND focus returns to Export button
5. Repeat steps 3-4 for Codex Modal and Community Gallery
6. Run `npm test -- --run src/__tests__/focusManagement.test.tsx` — verify focus trap tests pass
7. Verify `document.activeElement` changes correctly throughout the flow

### AC4 Verification (Skip Navigation)
1. Load the page, press Tab before any interaction
2. Verify a "Skip to content" or "Skip to editor" link appears as first focusable element
3. Press Enter on the skip link
4. Verify `document.activeElement` is now the canvas area or first editor element
5. Run `npm test -- --run src/__tests__/focusManagement.test.tsx` — verify skip link test passes

### AC5 Verification (Connection Error Feedback)
1. Attempt to create a duplicate connection (connect two modules that are already connected)
2. Verify a toast notification appears with error message
3. Enable screen reader mode or inspect DOM for live region update
4. Verify `role="alert"` or `aria-live="assertive"` region contains "Connection already exists" or similar
5. Attempt type mismatch connection — verify similar dual feedback (toast + live region)
6. Run `npm test -- --run src/__tests__/connectionEngineFix.test.ts` — verify error state tests pass

### AC6 Verification (Build Integrity)
1. Run `npm run build` — verify exit code 0 and "0 TypeScript errors" in output
2. Run `npm test` — verify all 2003+ tests pass across all test files
3. Verify new test files (`connectionEngineFix.test.ts`, `accessibilityEnhancements.test.tsx`, `focusManagement.test.tsx`) are included and passing

## Risks

1. **Connection Path Calculation Race Condition** — Module position updates and connection path recalculation may race; mitigated by ensuring path recalculation happens after position update completes via useEffect with proper dependency array

2. **Focus Management Scope Creep** — Focus management improvements could expand beyond intended scope; fixed by limiting to modal focus traps and skip links only, no global focus rewiring

3. **Test Coverage Gaps** — Accessibility tests are difficult to automate; mitigated by focusing on ARIA attribute presence and DOM state verification rather than actual screen reader behavior

4. **New Test File Syntax Errors** — New test files may introduce TypeScript errors; mitigated by running `npm run build` before claiming complete

## Failure Conditions

This round fails if:
- `npm run build` produces ANY TypeScript errors
- `npm test` fails for ANY existing or new test
- AC2: Moving a connected module leaves ANY ghost/stale connection paths visible
- AC3: Any of the three modals (Export, Codex, Community Gallery) fails to trap focus on open OR fails to return focus on close
- AC4: Skip navigation link is absent or does not move focus to canvas
- AC5: Connection errors display only toast OR only live region — both are required
- New accessibility or focus files have import/build errors

## Done Definition

All conditions must be true before claiming round complete:

1. `npm run build` produces 0 TypeScript errors (verified via CI/build output)
2. `npm test` shows all 2003+ tests passing (verified via test output)
3. AC1: Live region element exists in DOM AND contains announcement text after activation
4. AC2: Moving a connected module updates ALL related paths with no visual artifacts
5. AC3: All three modals pass focus trap + return focus verification (manual or test)
6. AC4: Skip link is first Tab stop and moves focus to canvas
7. AC5: Error connections trigger both visual toast AND live region announcement
8. New test files (`connectionEngineFix.test.ts`, `accessibilityEnhancements.test.tsx`, `focusManagement.test.tsx`) exist and pass

## Out of Scope

- AI naming/description API integration (reserved for future sprint)
- Community trading system
- Faction technology tree expansion
- New module types beyond existing 18
- Full screen reader testing (requires manual testing with NVDA/VoiceOver)
- Mobile gesture improvements (handled in previous rounds)
- Global keyboard shortcut rewiring
- Automated accessibility audit (axe-core integration deferred)

---

**REVISION PENDING REVIEW** — Contract revised for Round 55 with tightened test methods and failure conditions. Awaiting approval.
