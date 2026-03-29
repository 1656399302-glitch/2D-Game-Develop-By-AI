APPROVED

# Sprint Contract — Round 8

## Scope

This sprint focuses on **polish, accessibility, and future extensibility**. Building on Round 7's successful Challenge/Achievement integration, this round addresses quality-of-life improvements, accessibility enhancements, and preparing the architecture for AI integration and community features mentioned in the spec.

## Spec Traceability

### P0 items covered this round:
1. **Accessibility audit & improvements** — WCAG 2.1 AA compliance for editor interactions
2. **Mobile responsiveness** — Proper handling for viewport sizes < 768px
3. **Connection error feedback** — Improved visual feedback for invalid connections
4. **Keyboard navigation** — Full keyboard accessibility for module panel, canvas, and modals

### P1 items covered this round:
1. **Performance optimization** — Debounced renders, reduced re-renders
2. **AI integration stubs** — Type definitions and interfaces for future AI naming/description API
3. **Error boundary** — Global error handling with graceful degradation
4. **Loading states** — Better UX during async operations (export, random forge)

### Remaining P0/P1 after this round:
- P1: Community sharing square (requires backend — deferred)
- P1: Faction tech tree visual polish (minor, can be P2)
- P2: Module grouping/combining functionality
- P2: Advanced auto-layout algorithm

### P2 intentionally deferred:
- AI text generation integration (API not defined)
- Social media authentication
- Cloud save/sync
- Multiplayer collaboration

## Deliverables

1. **AccessibilityLayer.tsx** — Centralized accessibility utilities
2. **useKeyboardNavigation.ts** — Custom hook for full keyboard navigation
3. **AccessibleCanvas.tsx** — Enhanced canvas with screen reader support
4. **AccessibleModulePanel.tsx** — Screen reader-friendly module selection
5. **MobileCanvasLayout.tsx** — Responsive layout component for mobile
6. **ConnectionErrorFeedback.tsx** — Improved error toast with suggestions
7. **types/aiIntegration.ts** — Type definitions for future AI API
8. **ErrorBoundary.tsx** — Global React error boundary
9. **LoadingOverlay.tsx** — Consistent loading state component
10. **contract.md** — This sprint contract

## Acceptance Criteria

1. **AC1**: All interactive elements have proper ARIA labels and roles
2. **AC2**: Tab navigation flows correctly through all UI regions
3. **AC3**: Canvas supports arrow key movement for selected modules
4. **AC4**: Module panel announces module count and selection state to screen readers
5. **AC5**: Connection errors show specific guidance (e.g., "Cannot connect same port types")
6. **AC6**: Export modal shows loading state during file generation
7. **AC7**: Random forge shows brief loading indicator during generation
8. **AC8**: Error boundary catches and displays friendly error messages
9. **AC9**: Canvas layout adapts gracefully to viewport < 768px (scrollable, not broken)
10. **AC10**: All 755 existing tests continue to pass
11. **AC11**: Build succeeds with 0 TypeScript errors

## Test Methods

| # | Criterion | Test Method |
|---|-----------|-------------|
| AC1 | ARIA labels | Manual: `role` attributes in JSX + automated aria-* audit |
| AC2 | Tab navigation | Manual: Tab through UI, verify logical order |
| AC3 | Arrow keys | Manual: Select module, use arrow keys to move |
| AC4 | Screen reader | Manual: Navigate module panel with VoiceOver/NVDA |
| AC5 | Error messages | Unit test: Invalid connection triggers specific error |
| AC6 | Export loading | Integration test: Export triggers loading state |
| AC7 | Random forge loading | Integration test: Random forge shows indicator |
| AC8 | Error boundary | Manual: Throw error, verify graceful display |
| AC9 | Mobile layout | Manual: Resize viewport < 768px, verify usability |
| AC10 | Tests pass | `npm test` → 755+ tests pass |
| AC11 | Build success | `npm run build` → 0 TypeScript errors |

## Risks

1. **Accessibility over-engineering** — Risk of adding verbose code; mitigation: use shared utility hooks
2. **Mobile layout scope creep** — Risk: full mobile redesign; mitigation: focus on usability, not full redesign
3. **Breaking existing interactions** — Risk: keyboard shortcuts conflict; mitigation: test all existing shortcuts

## Failure Conditions

1. Any existing test fails (755 → < 755)
2. TypeScript compilation errors introduced
3. New accessibility features break existing keyboard shortcuts
4. Mobile layout makes desktop experience worse

## Done Definition

**All** of the following must be true:
- [ ] `npm test` shows 755+ passing tests
- [ ] `npm run build` succeeds with 0 TypeScript errors
- [ ] All 11 acceptance criteria verified
- [ ] No regressions in existing functionality
- [ ] Code follows existing patterns and conventions
- [ ] New accessibility features documented in component comments

## Out of Scope

- Backend/server implementation
- Database changes
- New module types
- New animation effects
- Full mobile app (PWA)
- Social media integration
- AI API implementation (stubs only)
- Performance profiling of large machines (100+ modules)
- Internationalization (i18n)
