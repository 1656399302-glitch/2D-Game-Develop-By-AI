# Sprint Contract — Round 5

## APPROVED

## Scope

**Enhancement Sprint**: Improve accessibility, keyboard shortcuts, performance optimization, and UX polish. This sprint focuses on quality-of-life improvements without adding new core features. All changes must maintain backward compatibility and pass existing tests.

## Spec Traceability

### Status from Previous Rounds
| Category | Status |
|----------|--------|
| P0: Module editor (14 types) | ✓ Complete (Round 1-3) |
| P0: Activation system (6 states) | ✓ Complete (Round 3) |
| P0: Chinese text literals | ✓ Fixed (Round 4) |
| P1: Challenge system | ✓ Complete (Round 4) |
| P1: Recipe system | ✓ Complete (Round 4) |
| P1: Tutorial system | ✓ Complete (Round 4) |
| P1: Codex collection | ✓ Complete (Round 4) |
| P1: Random forge | ✓ Complete (Round 4) |
| P1: Export (SVG/PNG/Poster) | ✓ Complete (Round 4) |

### Status After This Sprint
- **P0 items**: All P0 items remain complete
- **P1 items**: All P1 items remain complete
- **Remaining P0/P1 after this round**: None
- **P2 items** (enhancements): Accessibility, keyboard shortcuts, performance, UX polish

## Deliverables

### 1. Enhanced Accessibility (`src/hooks/useAccessibility.ts`)
- Add ARIA labels to all interactive elements
- Implement keyboard focus management
- Add `role` attributes for screen reader support
- Support for keyboard-only navigation

### 2. Expanded Keyboard Shortcuts (`src/hooks/useKeyboardShortcuts.ts`)
- Add shortcuts for module deletion (Delete/Backspace)
- Add shortcuts for copy/paste (Ctrl+C, Ctrl+V)
- Add shortcuts for duplicate module (Ctrl+D)
- Add shortcut for select all (Ctrl+A)
- Add shortcut for save to codex (Ctrl+S)
- Add shortcut for export modal (Ctrl+E)

### 3. Performance Optimization (`src/components/Editor/Canvas.tsx`)
- Implement viewport culling (only render visible modules)
- Use `will-change` CSS property for animated elements
- Memoize module rendering to prevent unnecessary re-renders
- Debounce viewport position updates during pan

### 4. UX Polish Improvements
- Enhanced empty state with animated hint
- Improved connection error toast messages
- Add "no modules" celebration when canvas is empty for first time
- Tooltip hints for module panel items

### 5. Module Thumbnail Previews (`src/components/Editor/ModulePanel.tsx`)
- Add hover preview thumbnails for module types
- Show module description on hover
- Add category grouping visual separation

## Acceptance Criteria

1. **AC1**: `npm run build` exits with code 0 and 0 TypeScript errors
2. **AC2**: `npm test` shows 438/438 passing tests (no regressions)
3. **AC3**: All new keyboard shortcuts are functional:
   - `Delete`/`Backspace`: Delete selected module
   - `Ctrl+D`: Duplicate selected module
   - `Ctrl+C`/`Ctrl+V`: Copy/paste modules
   - `Ctrl+A`: Select all modules
   - `Ctrl+S`: Save to codex
   - `Ctrl+E`: Open export modal
4. **AC4**: ARIA labels present on all toolbar buttons (verified via `getAllByRole('button')`)
5. **AC5**: Canvas viewport culling reduces DOM nodes when zoomed out
6. **AC6**: Empty state displays helpful hints for new users
7. **AC7**: Module panel shows hover tooltips with module descriptions

## Test Methods

1. **Build verification**:
   ```bash
   npm run build
   # Verify: exit code 0, 0 TypeScript errors
   ```

2. **Test suite verification**:
   ```bash
   npm test
   # Verify: 438/438 tests pass
   ```

3. **Keyboard shortcut verification** (browser):
   ```javascript
   // Test delete shortcut
   focusEditor(); selectModule(); pressKey('Delete'); verifyModuleDeleted();
   
   // Test duplicate shortcut  
   focusEditor(); selectModule(); pressKey('Ctrl+D'); verifyModuleDuplicated();
   
   // Test copy/paste
   focusEditor(); selectModule(); pressKey('Ctrl+C'); pressKey('Ctrl+V');
   verifyModulePasted();
   ```

4. **Accessibility verification**:
   ```javascript
   // Check toolbar buttons have aria-labels
   const buttons = document.querySelectorAll('[role="button"], button');
   buttons.forEach(btn => assert(btn.getAttribute('aria-label') || btn.textContent));
   ```

5. **Performance verification**:
   ```javascript
   // Place 20 modules, zoom out to 25%, verify only visible modules render
   // Compare DOM node count at 100% zoom vs 25% zoom
   ```

## Risks

1. **Risk level**: MEDIUM — multiple files modified
2. **Risk mitigation**: All existing functionality unchanged; only new features added
3. **Risk mitigation**: 438/438 existing tests provide regression protection
4. **Risk mitigation**: Changes are additive (accessibility, shortcuts, performance)

## Failure Conditions

The round MUST fail if ANY of these conditions occur:

1. `npm run build` fails or exits with non-zero code
2. TypeScript errors present in build output
3. `npm test` shows fewer than 438/438 passing tests
4. New keyboard shortcuts conflict with browser defaults
5. Accessibility changes break existing interactions
6. Performance changes cause visual glitches in viewport

## Done Definition

The round is **complete** when ALL of the following are true:

- [ ] `npm run build` exits with code 0 and 0 TypeScript errors
- [ ] `npm test` shows 438/438 passing tests
- [ ] New keyboard shortcuts implemented in `src/hooks/useKeyboardShortcuts.ts`
- [ ] ARIA labels added to toolbar buttons in `Toolbar.tsx`
- [ ] Viewport culling logic added to `Canvas.tsx`
- [ ] Module memoization added to `ModuleRenderer.tsx`
- [ ] Empty state hints implemented in `Canvas.tsx`
- [ ] Module hover tooltips added to `ModulePanel.tsx`
- [ ] No regressions in existing functionality

## Out of Scope

- No new module types
- No new core features (activation states, challenge system, etc.)
- No changes to existing animation timings
- No API changes or state management restructuring
- No database or persistence changes
- No mobile responsiveness (P2 deferred)
- No theme customization (P2 deferred)
- No AI integration (P2 deferred)

## Technical Notes

### Accessibility Implementation Guidelines
- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Add `aria-label` to icon-only buttons
- Add `aria-describedby` for complex interactive elements
- Support `Tab` navigation through all interactive elements
- Add `role="region"` for major sections

### Performance Implementation Guidelines
- Use `React.memo()` for `ModuleRenderer` component
- Implement viewport bounds checking before rendering
- Use `useMemo` for connection path calculations
- Debounce zoom/pan handlers (16ms threshold)
- Use CSS `will-change: transform` for animated containers

### Keyboard Shortcut Guidelines
- Prevent default browser behavior for shortcuts
- Check for focused element (don't trigger when in input)
- Provide visual feedback when shortcut is executed
- Document shortcuts in UI tooltips
