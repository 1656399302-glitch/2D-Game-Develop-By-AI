# Sprint Contract — Round 107

## APPROVED

## Scope

**Primary Mission:** Polish and stabilize the AI Assistant Panel and Accessibility systems. The AI naming/description feature has working UI but needs robust error handling, loading states, and comprehensive test coverage. The accessibility layer exists but needs verification of keyboard navigation completeness and ARIA compliance.

**Secondary Mission:** Add mock data to Community Gallery to demonstrate the feature, and ensure all stores have test coverage.

## Spec Traceability

### P0 Items Covered This Round

1. **AI Assistant Panel Error Handling** — Ensure graceful degradation when AI service is unavailable, network errors, or API keys are missing

2. **Accessibility Keyboard Navigation Verification** — Verify all interactive elements are keyboard accessible and focus management is correct

### P1 Items Covered This Round

3. **AI Assistant Panel Test Coverage** — Add unit tests for useAINaming hook, error states, loading states, and retry logic

4. **Store Test Coverage Gaps** — Add tests for untested stores (useFactionReputationStore, useCommunityStore)

5. **Community Gallery Mock Data** — Add mock data to demonstrate community sharing feature without backend dependency

### Remaining P0/P1 After This Round

- All P0/P1 items are covered. This is a polish/foundation round.

### P2 Intentionally Deferred

- Real AI service integration (requires backend/API)
- Multiplayer collaboration
- Custom module creator
- Sound effects
- Tutorial video content

## Deliverables

1. **Robust AI Assistant Panel** — Proper error handling, loading indicators, retry mechanism, API key validation
2. **Comprehensive AI Tests** — useAINaming.test.ts with full coverage of error paths
3. **Accessibility Verification** — AccessibilityLayer properly connected, keyboard shortcuts documented
4. **Store Test Coverage** — Tests for useFactionReputationStore, useCommunityStore
5. **Community Gallery Demo** — Mock entries showing gallery functionality
6. **No regressions** — All existing 4,159 tests continue to pass

## Acceptance Criteria

### AI Assistant Panel (P0)

1. **AC-107-001: AI Panel shows error state when no API key configured**
   - Given: AI Assistant Panel is open
   - When: No API key is configured in AISettings
   - Then: Clear error message displayed, panel remains usable
   - **FAIL CONDITION:** Crash, unhandled promise rejection, or blank panel

2. **AC-107-002: AI Panel handles network errors gracefully**
   - Given: AI naming request is initiated
   - When: Network error occurs (simulated)
   - Then: Error message shown, retry button available, panel remains functional
   - **FAIL CONDITION:** Panel becomes unresponsive or shows unhandled error

3. **AC-107-003: AI Panel shows loading state during request**
   - Given: User clicks generate button in AI panel
   - When: Request is pending
   - Then: Loading indicator displayed, generate button disabled
   - **FAIL CONDITION:** Button remains enabled, no loading feedback

4. **AC-107-004: AI naming result applies to machine**
   - Given: AI generates a name
   - When: User clicks apply
   - Then: Machine name updated in editor and codex
   - **FAIL CONDITION:** Name not applied or lost on page reload

### Accessibility (P0)

5. **AC-107-005: All toolbar buttons keyboard accessible**
   - Given: Editor is focused
   - When: User tabs through interface
   - Then: All buttons reachable via Tab, activatable via Enter/Space
   - **FAIL CONDITION:** Any button unreachable or non-functional via keyboard

6. **AC-107-006: Module panel keyboard navigation works**
   - Given: Module panel is visible
   - When: User navigates with keyboard
   - Then: Modules selectable, draggable via keyboard
   - **FAIL CONDITION:** Cannot select or place modules via keyboard

7. **AC-107-007: Canvas keyboard shortcuts documented and working**
   - Given: Canvas is focused
   - When: User presses documented shortcuts
   - Then: Actions execute as specified (Delete, Ctrl+Z, Ctrl+C, etc.)
   - **FAIL CONDITION:** Shortcuts don't work or undocumented

8. **AC-107-008: Focus returns correctly after modal close**
   - Given: Modal is open and focused
   - When: Modal is closed (Escape or button)
   - Then: Focus returns to triggering element or main content
   - **FAIL CONDITION:** Focus lost or stuck in closed modal

### Test Coverage (P1)

9. **AC-107-009: useAINaming hook fully tested**
   - Given: Tests are run
   - When: All AI naming scenarios executed
   - Then: All tests pass (naming, description, error, loading, retry)
   - **FAIL CONDITION:** Any test missing or failing

10. **AC-107-010: useFactionReputationStore has test coverage**
    - Given: Tests are run
    - When: Faction reputation operations executed
    - Then: All operations tested and passing
    - **FAIL CONDITION:** Store untested or tests failing

11. **AC-107-011: useCommunityStore has test coverage**
    - Given: Tests are run
    - When: Community operations executed
    - Then: All operations tested and passing
    - **FAIL CONDITION:** Store untested or tests failing

### Community Gallery (P1)

12. **AC-107-012: Community Gallery displays mock entries**
    - Given: User opens Community Gallery
    - When: Gallery loads
    - Then: At least 3 mock machine entries visible with thumbnails
    - **FAIL CONDITION:** Empty gallery or crash

13. **AC-107-013: Community entry details viewable**
    - Given: Mock entries exist
    - When: User clicks on an entry
    - Then: Detail view opens with machine info
    - **FAIL CONDITION:** Detail view crash or blank

### Regression Prevention (P0)

14. **AC-107-014: All existing tests pass**
    - Given: `npm test` is run
    - When: All 164 test suites execute
    - Then: All 4,159 tests pass
    - **FAIL CONDITION:** Any existing test fails

15. **AC-107-015: TypeScript compiles clean**
    - Given: `npx tsc --noEmit` is run
    - When: Type checking completes
    - Then: Zero errors
    - **FAIL CONDITION:** Any TypeScript error

16. **AC-107-016: Dev server starts without errors**
    - Given: `npm run dev` is executed
    - When: Server starts
    - Then: No crash, app accessible on localhost
    - **FAIL CONDITION:** Crash or error preventing startup

## Test Methods

### AC-107-001: AI Panel Error State (No API Key)
1. Open app, clear any stored API keys
2. Open AI Assistant Panel
3. Verify error message appears
4. Verify panel UI remains visible and styled
5. If blank or crash: FAIL

### AC-107-002: Network Error Handling
1. Mock fetch to reject with network error
2. Trigger AI naming request
3. Verify error toast/message appears
4. Verify retry button visible and functional
5. Verify panel remains interactive after retry close
6. If unhandled rejection or freeze: FAIL

### AC-107-003: Loading State
1. Mock fetch to delay 3 seconds
2. Click generate button
3. Verify loading indicator visible
4. Verify button disabled (not clickable again)
5. Verify UI doesn't freeze during wait
6. If no loading or button still enabled: FAIL

### AC-107-004: AI Name Application
1. Place module on canvas
2. Open AI panel, generate name
3. Click apply
4. Verify name appears in toolbar/title area
5. Reload page
6. Verify name persisted (in codex if saved)
7. If name lost: FAIL

### AC-107-005: Toolbar Keyboard Access
1. Start at app root
2. Press Tab repeatedly
3. Count reachable buttons
4. Verify all toolbar buttons reachable before hitting canvas
5. Press Enter on each to verify activation
6. If any button unreachable or non-functional: FAIL

### AC-107-006: Module Panel Keyboard Nav
1. Focus module panel
2. Use arrow keys to navigate modules
3. Press Enter to select
4. Verify selection highlight appears
5. Press keyboard shortcut to place (e.g., 1-9 number keys)
6. Verify module appears on canvas
7. If cannot navigate or place: FAIL

### AC-107-007: Canvas Shortcuts
1. Place module on canvas, select it
2. Press Delete key
3. Verify module removed
4. Press Ctrl+Z
5. Verify module restored
6. Test other shortcuts (Ctrl+C, Ctrl+V, etc.)
7. If any shortcut fails: FAIL

### AC-107-008: Focus Return After Modal
1. Open any modal (e.g., Export)
2. Tab to first button in modal
3. Press Escape or click close
4. Verify focus returns to trigger element or main content area
5. If focus lost to body or nowhere: FAIL

### AC-107-009: useAINaming Tests
1. Run `npm test -- useAINaming`
2. Verify all test cases pass
3. Check coverage report for >90% coverage
4. If tests missing or failing: FAIL

### AC-107-010: FactionReputation Tests
1. Run `npm test -- useFactionReputationStore`
2. Verify all operations tested
3. If store untested: FAIL

### AC-107-011: CommunityStore Tests
1. Run `npm test -- useCommunityStore`
2. Verify all operations tested
3. If store untested: FAIL

### AC-107-012: Mock Gallery Entries
1. Open Community Gallery
2. Verify at least 3 entries visible
3. Verify each entry has thumbnail, title, author
4. If empty or crash: FAIL

### AC-107-013: Gallery Detail View
1. Click on mock gallery entry
2. Verify detail modal/view opens
3. Verify machine name, stats, thumbnail visible
4. If crash or blank: FAIL

### AC-107-014: All Tests Pass
1. Run `npm test`
2. Wait for completion
3. Verify 4,159 tests pass, 0 failed
4. If any failures: FAIL

### AC-107-015: TypeScript Clean
1. Run `npx tsc --noEmit`
2. Verify no output (0 errors)
3. If any errors: FAIL

### AC-107-016: Dev Server
1. Run `npm run dev` in background
2. Wait for server to start
3. Verify no crash messages
4. If crash or hang: FAIL

## Risks

1. **Risk: AI Mock Testing Complexity** — Simulating network delays and errors may not accurately reflect real API behavior
2. **Risk: Accessibility Testing Automation** — Headless browser keyboard navigation testing has limitations
3. **Risk: Mock Data Proliferation** — Adding mock data might make it harder to remove later if backend is implemented
4. **Risk: Test Coverage Scope Creep** — Writing comprehensive tests may reveal more untested edge cases

## Failure Conditions

**This round MUST FAIL if ANY of these occur:**
1. AC-107-001 through AC-107-008 fail (AI or accessibility issues)
2. AC-107-014 fails (existing tests broken)
3. AC-107-015 fails (TypeScript errors introduced)
4. AC-107-016 fails (dev server won't start)
5. Any critical UI regression observed

## Done Definition

All 16 acceptance criteria must pass. The round is complete only when:

1. [ ] AC-107-001: AI panel shows error when no API key
2. [ ] AC-107-002: AI panel handles network errors gracefully
3. [ ] AC-107-003: AI panel shows loading state during request
4. [ ] AC-107-004: AI naming result applies to machine correctly
5. [ ] AC-107-005: All toolbar buttons keyboard accessible
6. [ ] AC-107-006: Module panel keyboard navigation works
7. [ ] AC-107-007: Canvas keyboard shortcuts documented and working
8. [ ] AC-107-008: Focus returns correctly after modal close
9. [ ] AC-107-009: useAINaming hook fully tested
10. [ ] AC-107-010: useFactionReputationStore has test coverage
11. [ ] AC-107-011: useCommunityStore has test coverage
12. [ ] AC-107-012: Community Gallery displays mock entries
13. [ ] AC-107-013: Community entry details viewable
14. [ ] AC-107-014: All existing 4,159 tests pass
15. [ ] AC-107-015: TypeScript compiles clean (0 errors)
16. [ ] AC-107-016: Dev server starts without errors

## Out of Scope

- Changes to core module SVG designs
- Changes to activation animation choreography
- Addition of new module types
- Real backend/API integration for AI services
- Real backend for community gallery
- Performance optimization work (unless directly causing bugs)
- Changes to save format or storage mechanism
- Visual design changes (colors, fonts, layouts)
- Tutorial content additions
- Sound effects
- Mobile-specific UI changes beyond accessibility
