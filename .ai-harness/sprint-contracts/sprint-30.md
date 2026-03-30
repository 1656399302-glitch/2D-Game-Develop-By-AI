# Sprint Contract — Round 30

## Scope

Remediation sprint to fix remaining React "Maximum update depth exceeded" warnings identified in QA Round 29. Root cause: useEffect dependency patterns in three specific components not addressed in Round 29:
- App.tsx (useEffect depends on store action `markStateAsLoaded`)
- ActivationOverlay.tsx (useEffect depends on 15+ store actions/callbacks)
- MobileCanvasLayout.tsx (useEffect depends on `viewport.isMobile` object, not primitive)

## Spec Traceability

- **P0 items covered this round:** AC6 (No "Maximum update depth exceeded" warnings during standard interactions)
- **P1 items covered this round:** AC3 completion (Fix components with same root cause as Round 29)
- **Remaining P0/P1 after this round:** None — all known warning sources fixed
- **P2 intentionally deferred:** Any additional components with similar patterns discovered during this sprint (will be addressed in future rounds)

## Deliverables

1. **App.tsx** — Fix `markStateAsLoaded` useEffect dependency using ref-based pattern:
   - Store `markStateAsLoaded` in a ref
   - Sync ref in useEffect with `[markStateAsLoaded]` dependency
   - Use `markStateAsLoadedRef.current()` in effects that need it (no store action in dependency array)

2. **ActivationOverlay.tsx** — Fix complex useEffect with store action dependencies using ref-based pattern:
   - Store all 15+ store actions/callbacks in refs (`setMachineStateRef`, `setShowActivationRef`, `setActivationModuleIndexRef`, `triggerFlashRef`, `generateParticlesRef`, `startShakeRef`, `stopAmbientParticlesRef`, `startActivationZoomRef`, `endActivationZoomRef`, `triggerModuleBurstRef`, etc.)
   - Sync all refs in single useEffect with `[dependencies]` array
   - Use refs in animation effect (no store actions in dependency array)

3. **MobileCanvasLayout.tsx** — Fix `viewport.isMobile` useEffect dependency using ref-based comparison:
   - Store previous `isMobile` value in `prevIsMobileRef`
   - Update ref on each render where `viewport.isMobile` changes
   - Compare `prevIsMobileRef.current` with `viewport.isMobile` to detect changes
   - Effect triggers only on actual boolean changes, not object reference changes

4. **reactWarnings.test.tsx** — Replace synthetic pattern tests with actual component integration tests:
   - Test `<App />` renders and produces 0 warnings
   - Test `<ActivationOverlay />` renders and produces 0 warnings  
   - Test `<MobileCanvasLayout />` renders and produces 0 warnings
   - Tests use `@testing-library/react` `act()` wrapper and `console.error` override pattern

## Acceptance Criteria

1. **AC1:** App.tsx has `markStateAsLoadedRef` and uses `markStateAsLoadedRef.current()` instead of `markStateAsLoaded` in any useEffect dependency array
2. **AC2:** ActivationOverlay.tsx stores ALL store actions/callbacks in refs and uses refs in the complex useEffect (no store actions or callbacks in dependency array)
3. **AC3:** MobileCanvasLayout.tsx useEffect uses `prevIsMobileRef.current` comparison pattern to detect `viewport.isMobile` changes (not full `viewport` object in dependency array)
4. **AC4:** reactWarnings.test.tsx contains tests that:
   - Import and render actual `App`, `ActivationOverlay`, `MobileCanvasLayout` components
   - Wrap renders in `act()`
   - Override `console.error` to capture warnings
   - Assert `warnings.length === 0` for each component
5. **AC5:** npm run build completes with 0 TypeScript errors
6. **AC6:** npm test passes (including new integration tests in reactWarnings.test.tsx)
7. **AC7:** Browser verification shows 0 "Maximum update depth exceeded" warnings during app load
8. **AC8:** Touch gestures continue to work correctly (pinch-to-zoom, pan on mobile)
9. **AC9:** Performance remains acceptable — existing performance integration tests pass (50 modules <100ms)

## Test Methods

1. **AC1 (Code Inspection):** Verify App.tsx:
   - Contains `const markStateAsLoadedRef = useRef(markStateAsLoaded)`
   - Contains `useEffect(() => { markStateAsLoadedRef.current = markStateAsLoaded; }, [markStateAsLoaded])`
   - No useEffect has `markStateAsLoaded` in dependency array

2. **AC2 (Code Inspection):** Verify ActivationOverlay.tsx:
   - Contains refs for: `setMachineStateRef`, `setShowActivationRef`, `setActivationModuleIndexRef`, `triggerFlashRef`, `generateParticlesRef`, `startShakeRef`, `stopAmbientParticlesRef`, `startActivationZoomRef`, `endActivationZoomRef`, `triggerModuleBurstRef`
   - Complex useEffect uses only refs and primitives in dependency array (no store actions, no callbacks)
   - Sync useEffect properly updates all refs

3. **AC3 (Code Inspection):** Verify MobileCanvasLayout.tsx:
   - Contains `const prevIsMobileRef = useRef<boolean>(...)` 
   - Contains comparison: `prevIsMobileRef.current !== viewport.isMobile`
   - Updates `prevIsMobileRef.current` after detecting change
   - No `[viewport]` or `[viewport.isMobile]` in any useEffect dependency array

4. **AC4 (Test Inspection):** Verify reactWarnings.test.tsx:
   - Contains `render(<App />)` or similar actual component render
   - Contains `render(<ActivationOverlay ... />)` with required props
   - Contains `render(<MobileCanvasLayout ... />)` with required props
   - Uses `act(() => { render(...) })` pattern
   - Overrides `console.error` to capture warnings
   - Asserts `warnings.length === 0` for each component

5. **AC5:** Run `npm run build` — must complete with 0 TypeScript errors

6. **AC6:** Run `npm test` — all tests must pass

7. **AC7 (Browser Verification):**
   - Open browser dev tools console
   - Navigate to http://localhost:5173
   - Refresh page (cold load)
   - Verify 0 "Maximum update depth exceeded" warnings appear

8. **AC8:** Verify touch gestures work on mobile viewport

9. **AC9:** Run `npm test -- --testPathPattern="performance"` — existing performance tests must pass

## Risks

1. **Risk:** Integration tests for actual components may require complex prop mocking
   - **Mitigation:** Review props needed for each component before writing tests
   - **Mitigation:** Use Zustand store directly or provide minimal required props

2. **Risk:** Ref-based patterns may cause stale closures if sync effect runs out of order
   - **Mitigation:** Follow exact pattern: sync ref first, use ref second
   - **Mitigation:** Verify all refs are synced in a single useEffect with proper dependencies

3. **Risk:** MobileCanvasLayout prevIsMobileRef comparison may miss edge cases
   - **Mitigation:** Ensure effect handles both initial mount and subsequent changes
   - **Mitigation:** Test renders on both mobile and desktop viewports

4. **Risk:** Other components may have similar issues discovered after this sprint
   - **Mitigation:** Browser verification in AC7 will catch any remaining warnings
   - **Mitigation:** Any additional issues become P0 for next sprint

## Failure Conditions

The sprint fails if ANY of the following occur:

1. Any "Maximum update depth exceeded" warnings remain in browser after fixes
2. npm run build fails with TypeScript errors
3. npm test fails (any test, including new integration tests)
4. Touch gestures break
5. Performance degrades beyond acceptable threshold
6. Code inspection reveals store actions or callbacks still in useEffect dependency arrays for fixed components
7. AC3 code uses `[viewport.isMobile]` or `[viewport]` in useEffect dependency array (must use ref comparison)

## Done Definition

All 9 acceptance criteria must be satisfied and verified:

1. ✅ Code inspection confirms App.tsx uses ref-based pattern (no `markStateAsLoaded` in deps)
2. ✅ Code inspection confirms ActivationOverlay.tsx uses refs for all 15+ actions/callbacks
3. ✅ Code inspection confirms MobileCanvasLayout.tsx uses `prevIsMobileRef.current` comparison (no viewport object in deps)
4. ✅ reactWarnings.test.tsx tests actual App, ActivationOverlay, MobileCanvasLayout components
5. ✅ npm run build succeeds with 0 TypeScript errors
6. ✅ npm test passes all tests
7. ✅ Browser verification shows 0 warnings during app load
8. ✅ Touch gestures work correctly
9. ✅ Performance tests pass (50 modules <100ms)

## Out of Scope

- No new features or functionality changes
- No changes to MobileTouchEnhancer.tsx (fixed in Round 29)
- No changes to Canvas.tsx (fixed in Round 29)
- No changes to state management architecture
- No changes to SVG rendering or visual appearance
- No changes to animation logic
- No changes to other components beyond the three explicitly listed
- No synthetic pattern tests (only actual component integration tests in reactWarnings.test.tsx)
- No changes to existing performance integration tests (reuse existing test paths)
