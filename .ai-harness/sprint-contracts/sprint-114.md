# Sprint Contract — Round 114

## Scope

This sprint focuses on **remediation and integration** of Round 113 deliverables that exist as files but are not functional in the application. The primary goal is to fix the critical AC-113-009 failure: activation must be blocked when the circuit is invalid.

**Primary Task**: Integrate existing validation components into App.tsx and fix activation blocking logic.

## Spec Traceability

### P0 items covered this round
- **AC-113-009** (BLOCKING): Activation button disabled when circuit invalid — integrate validation check into `handleActivate()` and button `disabled` prop
- **Integration**: Add ValidationStatusBar, QuickFixActions, CanvasValidationOverlay to App.tsx render tree
- **Activation Gate**: Connect `getActivationGate()` / `useCircuitValidation()` to button state and activation handler

### P1 items covered this round
- **AC-113-001**: Modules with validation errors display red error badge (verify rendering)
- **AC-113-002**: Isolated modules highlighted with dashed red border (verify overlay renders)
- **AC-113-003**: Modules in cycles highlighted with pulsing orange border (verify overlay renders)
- **AC-113-005**: ValidationStatusBar shows correct status text (verify integration)
- **AC-113-006**: Clicking error module shows QuickFixActions menu (wire up event handlers)
- **AC-113-010**: Hovering validation badge shows tooltip (verify badge renders)

### Remaining P0/P1 after this round
- All P0/P1 from rounds 112-113 should be complete after this remediation sprint

### P2 intentionally deferred
- Advanced quick fix actions (add connection, remove cycle)
- Animation polish for validation overlays
- Comprehensive error messaging

## Deliverables

1. **Updated `src/App.tsx`** with:
   - Import: `ValidationStatusBar` from `'./components/Editor/ValidationStatusBar'`
   - Import: `QuickFixActions` from `'./components/Editor/QuickFixActions'`
   - Import: `CanvasValidationOverlay` from `'./components/Editor/CanvasValidationOverlay'`
   - Import: `getActivationGate` from `'./utils/validationIntegration'`
   - Import: `useCircuitValidation` from `'./hooks/useCircuitValidation'`
   - Import: `useActivationGate` from `'./hooks/useCircuitValidation'`
   - State: `const [quickFixModuleId, setQuickFixModuleId] = useState<string | null>(null)`
   - State: `const [quickFixPosition, setQuickFixPosition] = useState<{x: number; y: number} | null>(null)`
   - Hook call: `const { isValid } = useCircuitValidation()` (must be called inside component, not at module level)
   - Hook call: `const { canActivate } = useActivationGate()` (this hook exposes canActivate; must be called inside component, not at module level)
   - Fixed `handleActivate()` that calls `getActivationGate()` and returns early if `!gate.canActivate`
   - Updated activation button: `disabled={modules.length === 0 || !canActivate}`
   - Render: `<ValidationStatusBar />` in header area
   - Render: `<CanvasValidationOverlay />` in canvas wrapper
   - Render: `<QuickFixActions moduleId={quickFixModuleId} position={quickFixPosition} visible={!!quickFixModuleId} onClose={() => setQuickFixModuleId(null)} />`

2. **Updated `src/components/Editor/Canvas.tsx`** with:
   - Validation state connected to ModuleValidationBadge component rendering
   - Click handlers on modules that call `setQuickFixModuleId(module.instanceId)` and `setQuickFixPosition({x, y})`
   - Badges must render on modules that have validation errors

3. **All existing tests continue to pass** (181 test files, 4892 tests)

## Acceptance Criteria

1. **AC-114-001**: App.tsx imports ValidationStatusBar, QuickFixActions, CanvasValidationOverlay — verified by grep (3 matches)
2. **AC-114-002**: Activation button has `disabled` attribute set when circuit is invalid (canActivate = false) — verified by browser DevTools element inspection
3. **AC-114-003**: Clicking activation button with invalid circuit does NOT start activation state — verified by machineState remaining unchanged, no "CHARGING" state visible
4. **AC-114-003b**: With a VALID circuit, activation button is NOT disabled and clicking it transitions machineState to 'charging' — verified by state inspector
5. **AC-114-004**: ValidationStatusBar renders in header area — verified by `.validation-status-bar` selector returning element
6. **AC-114-005**: CanvasValidationOverlay renders on canvas — verified by `.canvas-validation-overlay` selector returning element
7. **AC-114-006**: Modules with validation errors display red error badge — verified by `.module-validation-badge` selector on invalid modules
8. **AC-114-007**: All 4892 existing tests pass — verified by `npm test -- --run`
9. **AC-114-008**: TypeScript compilation succeeds — verified by `npx tsc --noEmit`
10. **AC-114-009**: Build succeeds in <5 seconds — verified by `npm run build`
11. **AC-114-010**: Browser loads without console errors — verified by console having no Error-level logs

## Test Methods

### Test Method 1 (AC-114-001): Import Verification
Run in terminal:
```bash
grep -n "ValidationStatusBar" src/App.tsx | grep "import"
grep -n "QuickFixActions" src/App.tsx | grep "import"
grep -n "CanvasValidationOverlay" src/App.tsx | grep "import"
```
**Expected**: Exactly 3 import lines, one for each component name.

### Test Method 2 (AC-114-002): Button Disabled State Verification (invalid circuit)
1. Open application in browser (e.g., `npm run dev`)
2. Generate invalid circuit using random forge button until validation errors appear (ISLAND_MODULES or NO_OUTPUTS)
3. Open browser DevTools (F12) → Elements tab
4. Find activation button element (look for button containing "激活" or class containing "activate")
5. Inspect element attributes — verify `disabled` attribute is present
6. **Expected**: Button has `disabled` attribute; NOT just CSS classes

### Test Method 3 (AC-114-003): Activation Blocking Verification (invalid circuit)
1. Generate invalid circuit with validation errors
2. Observe activation button state (should be disabled from Test Method 2)
3. If button is somehow clickable, click it
4. Observe React DevTools or state inspector
5. **Expected**: `machineState` remains "idle" or unchanged; no "CHARGING" state observed
6. **Expected**: `setMachineState('charging')` NOT called in handleActivate when circuit invalid

### Test Method 4 (AC-114-003b): Activation Permitted on Valid Circuit
1. Generate a valid circuit (no validation errors) using random forge
2. Verify activation button is NOT disabled
3. Click activation button
4. **Expected**: `machineState` transitions to "charging"; activation proceeds normally

### Test Method 5 (AC-114-004): ValidationStatusBar Rendering
1. Open application in browser
2. Open DevTools → Elements tab
3. Run: `document.querySelector('.validation-status-bar')`
4. **Expected**: Element found (not null)

### Test Method 6 (AC-114-005): CanvasValidationOverlay Rendering
1. Open application in browser
2. Open DevTools → Elements tab
3. Run: `document.querySelector('.canvas-validation-overlay')`
4. **Expected**: Element found (not null)

### Test Method 7 (AC-114-006): ModuleValidationBadge Rendering
1. Generate circuit with ISLAND_MODULES error via random forge
2. Open DevTools → Elements tab
3. Run: `document.querySelectorAll('.module-validation-badge')`
4. **Expected**: NodeList with at least 1 element (badges on orphaned modules)

### Test Method 8 (AC-114-007): Test Suite Verification
Run in terminal:
```bash
npm test -- --run 2>&1 | tail -10
```
**Expected output includes**:
- "Test Files: 181 passed"
- "Tests: 4892 passed"

### Test Method 9 (AC-114-008): TypeScript Compilation
Run in terminal:
```bash
npx tsc --noEmit; echo "Exit code: $?"
```
**Expected**: Exit code 0, no error output.

### Test Method 10 (AC-114-009): Build Verification
Run in terminal:
```bash
time npm run build 2>&1
```
**Expected**: Build completes successfully, total time < 5 seconds.

### Test Method 11 (AC-114-010): Console Error Check
1. Open application in browser
2. Open DevTools → Console tab
3. Clear console
4. Refresh page
5. **Expected**: No Error-level messages (Warning and Info acceptable)

## Risks

1. **Integration Risk**: The existing component files may have prop/state mismatches with App.tsx — resolve by adjusting prop types or state wiring
2. **State Management Risk**: useCircuitValidation hook may not be connected to the store — verify and wire up
3. **Regression Risk**: Changes to App.tsx may break existing functionality — run full test suite before claiming done
4. **Hook Placement Risk**: Both hooks must be called inside the component function, not at module level — verify placement
5. **CSS Class Name Risk**: Components may use different class names than what tests expect — verify actual class names in component source files
6. **Wrong Field Risk**: Use `module.instanceId` (not `module.id`) when identifying modules for QuickFixActions — `module.id` is the module type string, `module.instanceId` is the unique instance ID

## Failure Conditions

The round MUST fail if ANY of the following conditions are true:

1. **Activation NOT blocked on invalid circuit**: Button is clickable or machineState changes to "charging" when circuit has validation errors
2. **Activation blocked on valid circuit**: Button is disabled when circuit has no validation errors (regression)
3. **Missing component imports**: grep for ValidationStatusBar/QuickFixActions/CanvasValidationOverlay in App.tsx returns fewer than 3 matches
4. **Component not rendered**: `.validation-status-bar`, `.canvas-validation-overlay`, or `.module-validation-badge` elements NOT found in browser DOM
5. **Test regression**: Test count drops below 4892 passing
6. **TypeScript errors**: `npx tsc --noEmit` produces any errors
7. **Build failure or timeout**: Build does not complete in under 5 seconds
8. **Console errors on load**: Browser console shows Error-level messages on page load

## Done Definition

The round is complete when ALL of the following are true:

- [ ] `grep "ValidationStatusBar" src/App.tsx` returns at least 1 import line
- [ ] `grep "QuickFixActions" src/App.tsx` returns at least 1 import line
- [ ] `grep "CanvasValidationOverlay" src/App.tsx` returns at least 1 import line
- [ ] `grep "useCircuitValidation" src/App.tsx` returns at least 1 hook call
- [ ] `grep "useActivationGate" src/App.tsx` returns at least 1 hook call (exposes canActivate)
- [ ] `grep "getActivationGate" src/App.tsx` returns at least 1 usage
- [ ] Activation button has `disabled={... || !canActivate}` or equivalent condition using `canActivate` from `useActivationGate()`
- [ ] handleActivate contains `getActivationGate()` call and returns early if not canActivate
- [ ] `document.querySelector('.validation-status-bar')` returns a DOM element
- [ ] `document.querySelector('.canvas-validation-overlay')` returns a DOM element
- [ ] `document.querySelectorAll('.module-validation-badge')` returns at least 1 element on invalid circuit
- [ ] `npm test -- --run` shows "181 passed" and "4892 passed"
- [ ] `npx tsc --noEmit` exits with code 0
- [ ] `npm run build` completes in under 5 seconds
- [ ] Browser console has no Error-level messages on load
- [ ] With invalid circuit: activation button has disabled attribute AND clicking does NOT trigger "charging" state
- [ ] With valid circuit: activation button is NOT disabled AND clicking triggers "charging" state

## Out of Scope

- New feature development beyond validation integration
- Module library expansion
- Animation improvements beyond functional rendering
- Additional quick fix actions beyond basic wiring
- Performance optimization of existing systems
- AI text generation for naming/description
- Changes to validation logic/algorithms (only integration is in scope)
- Changes to component internal styling (only rendering placement is in scope)
