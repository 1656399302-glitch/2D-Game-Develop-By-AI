APPROVED

# Sprint Contract — Round 2

## Scope

This sprint completes the P1 module that was intentionally deferred in Round 1: the **Output Array module**. Additionally, this sprint fixes the undo/redo keyboard handling bug and adds one connection system enhancement to make the overall experience more robust.

**Root Cause for Undo/Redo Fix:** QA Round 1 identified that keyboard event dispatch in tests doesn't trigger React synthetic handlers. This is a known limitation with synthetic events, but the underlying issue is that the keyboard event listeners must be attached at the `document` level (not within React component lifecycle in a way that conflicts with synthetic event system). The fix must ensure Ctrl+Z/Ctrl+Y work reliably in actual browser usage.

## Spec Traceability

### P0 Items (Must Complete This Round)
- **Output Array Module** — New 7th module type that serves as the machine's output terminus
  - SVG visual: hexagonal or circular array with radiating glyphs
  - Input ports (can accept multiple energy inputs)
  - Output port (final energy output)
  - Unique activation animation (discharge burst, array spin, symbol reveal)
  - Integration into attribute generator (affects output type, power calculation)

### P1 Items Covered This Round
- **Undo/Redo Keyboard Fix** — 2 untested criteria from Round 1 (now identified as implementation bug, not test limitation)
- Output Array module (promoted from deferred P1)

### Remaining P0/P1 After This Round
- All P0 items complete
- All P1 items from original spec complete

### P2 Intentionally Deferred
- AI naming/description generation interface
- Community sharing plaza
- Challenge/task mode
- Faction technology tree
- Rune recipe unlock system

## Deliverables

1. **`src/types/index.ts`** — Add `output-array` to `ModuleType` enum and `OutputArrayMetadata` interface
2. **`src/modules/OutputArray.tsx`** — SVG component with:
   - Hexagonal array shape with inner glyph rings
   - Input ports (×2-3) and single output port
   - Idle, charging, active, discharge animations via GSAP
   - Hover and selection state styling
3. **`src/modules/index.ts`** — Export OutputArray alongside other modules
4. **`src/utils/attributeGenerator.ts`** — Extend logic to incorporate output array into:
   - Power calculation (output arrays boost output power)
   - Output type determination (fire, frost, void, arcane, lightning, mechanical)
   - Stability modifier (additional outputs reduce stability)
5. **`src/components/Editor/EditorCanvas.tsx`** — Fix keyboard event listeners so Ctrl+Z/Ctrl+Y properly trigger undo/redo:
   - Use `document.addEventListener` with `{ capture: true }` in `useEffect` (not just synthetic React onKeyDown)
   - Ensure listener is attached before React's synthetic event system processes the event
   - Clean up listener on unmount
6. **`src/components/Editor/ModuleRenderer.tsx`** — Ensure OutputArray appears in connection graph traversal for activation
7. **Unit tests** — Add tests for OutputArray metadata, attribute calculation with output arrays, connection validation (output-to-output allowed from OutputArray only)
8. **Manual verification steps** — Document browser-based testing procedure for keyboard undo/redo

## Acceptance Criteria

1. **Output Array Module Renders** — Canvas displays a visually distinct output array SVG when "Output Array" is dragged from the panel
2. **Module Count Updates** — After adding Output Array, status bar shows correct module count increment
3. **Connection Ports Work** — Output Array has 2 input ports and 1 output port visible; clicking output port enters connection mode; clicking input port completes connection
4. **Output-to-Output Connection Valid** — Users can connect Output Array's output port to another module's input port (special case)
5. **Activation Animation Plays** — When machine with Output Array is activated, the Output Array shows discharge animation (array spins, glyphs illuminate in sequence, burst pulse)
6. **Attributes Reflect Output Array** — When attributes are generated with an Output Array present:
   - Power stat increases
   - Output type tag appears (fire/frost/void/arcane/lightning/mechanical)
   - Rarity may increase with more modules
7. **Codex Save/Load Works** — Saved machine with Output Array loads back with module intact
8. **Export Includes Output Array** — SVG/PNG/Poster export shows Output Array correctly
9. **Undo/Redo Keyboard Works** — Pressing Ctrl+Z removes last action; pressing Ctrl+Y restores it
   - **Implementation must use `document.addEventListener` with capture phase**
   - **Unit tests verify store methods `undo()` and `redo()` execute correctly**
   - **Browser manual test: add module, press Ctrl+Z, verify module removed; press Ctrl+Y, verify module restored**
10. **No Regression** — All 24 existing unit tests still pass

## Test Methods

| Criterion | Verification Method |
|-----------|---------------------|
| Output Array renders | Drag module to canvas, verify DOM element with `data-type="output-array"` exists |
| Module count correct | Add Output Array, read status bar text "Modules: N" |
| Ports visible | Check for circles with `class="port-input"` and `class="port-output"` in DOM |
| Connection creation | Start connection from output port, complete at input port, verify connection line exists |
| Activation animation | Click "Activate", observe Output Array module animates (GSAP timeline visible) |
| Attribute generation | Add Output Array, generate attributes, verify "Power" > base and output type tag exists |
| Codex save/load | Save machine, navigate to Codex, click "Load to Editor", verify Output Array reappears |
| Export correctness | Export SVG, open file, verify output-array path exists in markup |
| Keyboard undo/redo | **Implementation: verify `document.addEventListener` is used with capture phase in useEffect**; **Browser test: add module, press Ctrl+Z, verify module removed; press Ctrl+Y, verify module restored** |
| No regression | Run `npm test`, verify 30+ tests pass (24 existing + new) |

## Risks

1. **Connection Graph Traversal Edge Case** — Output Array as terminus may cause activation BFS to hang if not properly handled; will test with multiple output arrays in sequence
2. **Attribute Generator Scope Creep** — Adding output type calculation may require refactoring existing generator functions; will keep changes minimal and additive
3. **GSAP Context Cleanup** — New animation on Output Array must properly clean up on unmount; will use `useEffect` cleanup pattern from existing modules
4. **Undo/Redo Event Propagation** — Document-level event listeners may conflict with React synthetic events if not properly scoped; will use capture phase and verify React store updates are triggered

## Failure Conditions

This sprint MUST fail if:
1. Build produces TypeScript errors or warnings
2. Any existing unit test fails
3. Output Array module cannot be added to canvas
4. Output Array cannot receive connections
5. Activation animation throws runtime error when Output Array present
6. Export produces invalid/corrupt SVG file
7. Ctrl+Z/Ctrl+Y keyboard shortcuts do not work in actual browser usage

This sprint SHOULD fail if:
1. New unit tests do not achieve >90% pass rate
2. Undo/redo works in unit tests but fails in browser manual testing

## Done Definition

The round is complete when:
1. `npm run build` completes with 0 errors
2. `npm test` shows all tests passing (including new ones)
3. Output Array module can be dragged, placed, connected, animated, and exported
4. Attribute generator correctly processes machines with Output Array
5. Keyboard Ctrl+Z/Y triggers undo/redo in browser (verified by manual test with `document.addEventListener` capture phase)
6. No console errors when using any combination of existing features + Output Array

## Out of Scope

- Adding more than 7 module types this round
- AI text generation integration
- Multiplayer or server-side features
- Advanced collision detection for modules
- Custom module creation interface
- Faction/tech tree systems
- Social sharing features
- Mobile responsive layout (beyond current state)
- Audio/sound effects
- Tutorial/onboarding flow
