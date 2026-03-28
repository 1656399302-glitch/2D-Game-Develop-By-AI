APPROVED

# Sprint Contract — Round 5

## Scope

**Remediation Sprint** — Fixing 3 critical bugs identified in Round 4 QA evaluation:
1. Test buttons don't trigger activation overlay (integration gap)
2. Wrong Chinese text for failure mode
3. Wrong Chinese text for overload mode

## Spec Traceability

### P0 items (must pass this round)
- **ActivationOverlay integration with test buttons** — Toolbar test buttons must trigger the activation overlay
- **Correct Chinese text for failure mode** — Must display "⚠ 机器故障"
- **Correct Chinese text for overload mode** — Must display "⚡ 系统过载"
- **Auto-recovery verification** — Machine returns to idle state after ~3500ms

### P1 items
- None this round (P1 work deferred from prior rounds)

### P2 items (intentionally deferred)
- AI naming assistant integration
- Community sharing features
- Challenge mode
- Faction tech tree

## Deliverables

1. **Fixed Toolbar.tsx** — Test buttons wired to trigger `showActivation` state
2. **Fixed ActivationOverlay.tsx** — Correct Chinese text for failure/overload modes
3. **App.tsx integration** — No changes needed if using store-based state

## Acceptance Criteria

1. **Toolbar Button 1 Visible** — "⚠ 测试故障" button exists in DOM
2. **Toolbar Button 2 Visible** — "⚡ 测试过载" button exists in DOM
3. **Failure Mode Triggerable** — Clicking "测试故障" shows ActivationOverlay with failure animation
4. **Overload Mode Triggerable** — Clicking "测试过载" shows ActivationOverlay with overload animation
5. **Failure Mode Chinese Text** — Overlay displays "⚠ 机器故障"
6. **Overload Mode Chinese Text** — Overlay displays "⚡ 系统过载"
7. **Auto-Recovery Works** — Machine returns to idle state after ~3500ms
8. **No Test Regression** — All 99 existing unit tests pass
9. **Build Clean** — Production build completes with 0 errors

## Test Methods

1. **Browser DOM query** — `document.body.innerText.includes('测试故障')` → `true`
2. **Browser DOM query** — `document.body.innerText.includes('测试过载')` → `true`
3. **Click test** — Click "测试故障", wait 500ms, verify overlay element exists: `document.querySelectorAll('[class*="fixed"]').length > 0`
4. **Click test** — Click "测试过载", wait 500ms, verify overlay element exists
5. **Text verification** — Overlay title text includes "⚠ 机器故障"
6. **Text verification** — Overlay title text includes "⚡ 系统过载"
7. **Auto-recovery** — Machine state returns to 'idle' within 4000ms of triggering test mode
8. **Unit tests** — `npm test` passes all 99 tests
9. **Build test** — `npm run build` produces 0 errors

## Risks

1. **Low Risk** — Fix is integration-level only, not architectural
2. **Minimal scope** — Only 3 specific files need changes: Toolbar.tsx, ActivationOverlay.tsx, possibly useMachineStore.ts

## Failure Conditions

1. Clicking "测试故障" does not show activation overlay
2. Clicking "测试过载" does not show activation overlay
3. Failure overlay text is not "⚠ 机器故障"
4. Overload overlay text is not "⚡ 系统过载"
5. Auto-recovery to idle state fails
6. Any existing test regression

## Done Definition

All 9 acceptance criteria must pass:
- [ ] Toolbar button "测试故障" visible in DOM
- [ ] Toolbar button "测试过载" visible in DOM
- [ ] Clicking "测试故障" shows failure overlay
- [ ] Clicking "测试过载" shows overload overlay
- [ ] Failure overlay displays "⚠ 机器故障"
- [ ] Overload overlay displays "⚡ 系统过载"
- [ ] Machine auto-returns to idle within 4 seconds
- [ ] `npm test` passes 99 tests
- [ ] `npm run build` produces 0 errors

## Out of Scope

- Any new features beyond the 3 bug fixes
- Visual polish of existing UI
- Additional test coverage
- Performance optimization
- Mobile responsiveness
- Accessibility improvements
- Documentation updates
- Any P1/P2 features from spec.md
