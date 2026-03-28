APPROVED

# Sprint Contract — Round 6

## Scope

This sprint focuses on **UX polish, visual enhancement, and missing quality-of-life features**. The core machine building and activation systems are fully functional from previous rounds. This sprint adds missing interactions, visual refinements, and keyboard shortcuts to make the editor feel more complete and professional.

## Spec Traceability

### P0 items (Critical UX gaps — must complete this round)
- **Canvas zoom controls** — Add zoom in/out/reset buttons to toolbar (from spec: "画布支持缩放")
- **Keyboard shortcuts** — Delete key for deletion, Escape to deselect, Ctrl+Z/Y for undo/redo (from spec: "撤销重做")
- **Module flip/mirror** — Add horizontal flip capability alongside existing rotation (from spec: "镜像")
- **Connection feedback** — Visual error feedback when connections fail (from spec: "冲突提示")

### P1 items (Important polish — must complete this round)
- **Enhanced activation effects** — Screen shake intensity variation, camera pulse animation
- **Properties panel scale slider** — Allow direct scale adjustment (0.5x to 2x)
- **Zoom to fit** — Button to auto-fit all modules in view
- **Duplicate module** — Keyboard shortcut or toolbar button to duplicate selected module

### P2 items (Intentionally deferred)
- Auto-layout suggestion (grid arrangement for scattered modules)
- Connection state indicator (invalid/pending connections styling)
- Module count badges

### P0/P1 items covered this round
- P0: Canvas zoom UI controls, keyboard shortcuts, module flip, connection feedback
- P1: Enhanced activation effects, properties panel scale, zoom-to-fit, duplicate module

### Remaining P0/P1 after this round
- All P0/P1 items from spec are addressed. Remaining work is P2 extensions.

## Deliverables

1. **ZoomControls component** — Zoom in/out/reset/fit-all buttons added to toolbar area
   - File: `src/components/Toolbar/ZoomControls.tsx` (or added to existing Toolbar.tsx)
   
2. **useKeyboardShortcuts hook** — Keyboard event handling for Delete, Escape, Ctrl+Z/Y, Ctrl+D, F
   - File: `src/hooks/useKeyboardShortcuts.ts`
   
3. **Module flip action** — Horizontal flip toggle in properties panel and via F key
   - Modified files: `src/components/PropertiesPanel/PropertiesPanel.tsx`, store actions
   
4. **ConnectionErrorFeedback** — Toast notification or visual indicator for failed connection attempts
   - File: `src/components/Connection/ConnectionErrorToast.tsx`
   
5. **Enhanced activation effects** — Variable intensity screen shake, viewport pulse
   - Modified file: `src/components/Preview/ActivationOverlay.tsx`
   
6. **Scale slider in PropertiesPanel** — Direct scale input via slider (0.5x to 2.0x)
   - Modified file: `src/components/PropertiesPanel/PropertiesPanel.tsx`
   
7. **Zoom to fit function** — Auto-calculate viewport to show all modules with padding
   - Modified file: `src/store/useViewportStore.ts` (or useMachineStore)
   
8. **Duplicate module action** — Copy selected module, placed offset by 20px right and down
   - Modified file: `src/store/useMachineStore.ts`

## Acceptance Criteria

All criteria must be verifiable through automated browser testing.

1. **Zoom Controls Visible** — Zoom in/out/reset/fit buttons appear in toolbar; buttons have accessible labels
   
2. **Zoom In Works** — Clicking zoom-in button increases `viewport.zoom` by 0.1, caps at 2.0
   
3. **Zoom Out Works** — Clicking zoom-out button decreases `viewport.zoom` by 0.1, floors at 0.1
   
4. **Zoom Reset Works** — Clicking zoom-reset sets `viewport.zoom` to 1.0
   
5. **Zoom to Fit Works** — Clicking fit-all button adjusts viewport so all modules are visible with 50px padding
   
6. **Delete Key Works** — Pressing Delete removes selected module from canvas and store
   
7. **Escape Key Works** — Pressing Escape clears selection (selectedModuleId becomes null)
   
8. **Ctrl+Z Undo Works** — Pressing Ctrl+Z reverts last add/delete/move/connect action
   
9. **Ctrl+Y Redo Works** — Pressing Ctrl+Y restores previously undone action
   
10. **Ctrl+D Duplicate Works** — Pressing Ctrl+D creates copy of selected module, offset by (20, 20) pixels
   
11. **F Key Flip Works** — Pressing F toggles `flipped` state on selected module (scaleX: 1 ↔ -1)
    
12. **Connection Error Feedback** — Attempting to connect same-type ports shows error toast with text "连接类型冲突" or visual red flash on both ports
    
13. **Activation Shake Intensity** — Failure mode triggers CSS animation with 8px displacement, overload mode triggers 4px displacement
    
14. **Scale Slider in Properties** — Properties panel shows slider input; dragging slider updates module scale in real-time

## Test Methods

### Unit Tests
```bash
npm test -- --run
```
Tests located in:
- `src/__tests__/useKeyboardShortcuts.test.ts` (new)
- `src/__tests__/zoomControls.test.ts` (new)
- `src/__tests__/moduleFlip.test.ts` (new)
- `src/__tests__/connectionError.test.ts` (new)
- `src/__tests__/activationEffects.test.ts` (new)
- `src/__tests__/scaleSlider.test.ts` (new)
- `src/__tests__/duplicateModule.test.ts` (new)

### Browser Integration Tests
```bash
npx playwright test
```
Verified behaviors:
1. Query toolbar buttons by text: `'Zoom In'`, `'Zoom Out'`, `'Reset'`, `'Fit All'`
2. Verify viewport state changes via store inspection or visual indicator
3. Verify module deletion by checking module count in store
4. Verify selection cleared by checking `selectedModuleId === null`
5. Verify duplicate by counting modules before/after Ctrl+D
6. Verify flip by checking module's `flipped` property or `scaleX` CSS value
7. Verify connection error by attempting invalid connection and checking toast or port styling
8. Verify scale slider by dragging and checking module visual size or store value

### Build Verification
```bash
npm run build
```
- Must complete with 0 TypeScript errors
- Must produce output in `dist/` directory

## Risks

1. **Viewport calculation edge cases** — Zoom to fit may produce unexpected results with 0 modules or extremely large canvas
2. **Animation conflicts** — Enhanced shake effects may conflict with existing GSAP animations; test thoroughly
3. **Keyboard event handling** — Global keyboard listeners may fire when input fields are focused; must check `e.target` before processing
4. **Scale implementation** — Module scale changes may require connection path recalculation; verify connections remain valid
5. **Undo/redo state management** — Adding new actions (flip, duplicate) to undo stack requires careful implementation

## Failure Conditions

The round fails if ANY of the following conditions occur:

1. `npm run build` fails with TypeScript errors
2. `npm test` drops below 99 passing tests (regression detected)
3. Any acceptance criterion cannot be verified through automated test
4. New features introduce console errors in browser
5. Keyboard shortcuts fire when text input fields are focused (e.g., Delete shouldn't remove characters from text inputs)
6. Zoom controls do not respect min/max bounds (zoom > 2.0 or < 0.1)
7. Duplicate module does not appear at correct offset position
8. Flip does not correctly toggle horizontal mirror (scaleX: 1 → -1 or -1 → 1)
9. Connection error feedback is not visible to user (missing toast or visual indicator)

## Done Definition

**Exact conditions that must be true before the builder may claim the round complete:**

All 14 acceptance criteria must pass:
- [ ] Zoom in/out/reset/fit buttons visible in toolbar
- [ ] Zoom in increases zoom level by 0.1, max 2.0
- [ ] Zoom out decreases zoom level by 0.1, min 0.1
- [ ] Reset sets zoom to 1.0
- [ ] Fit All shows all modules with padding
- [ ] Delete key removes selected module
- [ ] Escape clears selection
- [ ] Ctrl+Z reverts last action
- [ ] Ctrl+Y restores undone action
- [ ] Ctrl+D duplicates selected module at offset (20, 20)
- [ ] F key toggles module flip (horizontal mirror)
- [ ] Connection errors show visual feedback
- [ ] Activation shake varies by mode (8px failure, 4px overload)
- [ ] Properties panel has working scale slider (0.5x to 2.0x)

Plus all of the following:
- [ ] `npm test` passes with ≥99 tests (no regression)
- [ ] `npm run build` succeeds with 0 errors
- [ ] No new console errors in browser
- [ ] All keyboard shortcuts disabled when focused on text inputs

## Out of Scope

The following are explicitly NOT being done this round:

- AI naming/description generation (future extension, requires API integration)
- Community sharing or multiplayer features
- Additional module types beyond existing 7 (core, pipe, gear, rune, shield, trigger, output)
- Sound effects or audio
- Mobile/touch optimizations
- Dark mode themes (single theme only)
- Tutorial mode or guided walkthrough
- Achievement/badge system
- Module coloring system (modules have fixed colors)
- Auto-layout algorithm
- Connection state indicators (invalid/pending styling)
- Module count badges
