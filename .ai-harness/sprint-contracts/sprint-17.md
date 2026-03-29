APPROVED
# Sprint Contract — Round 17

## Scope

This sprint focuses on **Performance Optimization & AI Integration** — implementing code splitting to reduce bundle size, creating an AI naming assistant UI that integrates with the existing MockAIService, and improving mobile touch responsiveness. These improvements enhance initial load performance and add a compelling feature that previews future AI capabilities.

## Spec Traceability

### P0 items covered this round
- AI naming/description UI (using existing MockAIService architecture)
- Code splitting for bundle optimization (reduce 574KB bundle)

### P1 items covered this round
- Mobile touch responsiveness improvements
- Lazy loading of modal components

### Remaining P0/P1 after this round
- P0: AI naming with external API integration (requires API key setup)
- P0: Real-time multiplayer/collaboration (requires backend)
- P1: Community share plaza (requires backend)
- P1: Machine marketplace/trading (requires backend)

### P2 intentionally deferred
- Faction quest chains
- Seasonal events
- Cloud sync
- Native mobile app

## Deliverables

1. **Code Splitting Configuration** — `vite.config.ts` updates
   - Dynamic imports for route-based splitting
   - Manual chunk configuration for vendor libraries
   - Target: reduce main bundle from 574KB to <400KB

2. **AI Naming Assistant Component** — `src/components/AI/AIAssistantPanel.tsx`
   - Panel with AI name generation using MockAIService
   - Name style selector (arcane/mechanical/mixed/poetic)
   - Regenerate and apply name buttons
   - Loading state with animation

3. **AI Description Enhancement** — `src/utils/aiIntegrationUtils.ts`
   - Integration helper for AI description generation
   - Description style options (technical/flavor/lore/mixed)
   - Integration with machine attributes display

4. **Lazy-loaded Modal Components** — Route/Component refactoring
   - ChallengePanel lazy import
   - CodexView lazy import
   - FactionPanel lazy import
   - TechTree lazy import

5. **Touch Improvement Layer** — `src/components/Accessibility/MobileTouchEnhancer.tsx`
   - Pinch-to-zoom touch handling
   - Two-finger pan on canvas
   - Long-press context menu
   - Touch feedback animations

6. **Performance Test Suite** — `src/__tests__/performance.test.ts`
   - Bundle size assertions
   - Lazy loading verification
   - AI service integration tests

## Acceptance Criteria

1. **AC1: Bundle size reduced** — Main bundle < 400KB after code splitting; `npm run build` shows reduced chunk sizes

2. **AC2: AI Assistant panel functional** — User can click "AI 命名" button and receive generated names; `npm test -- src/__tests__/aiNaming.test.ts` passes

3. **AC3: AI description integration works** — AI-generated descriptions appear in machine stats panel when enabled; `npm test -- src/__tests__/aiDescription.test.ts` passes

4. **AC4: Modal lazy loading works** — Challenge, Codex, Faction panels load on demand; network tab shows chunks loaded on demand

5. **AC5: Mobile touch improvements** — Touch gestures work on mobile viewport (pinch zoom, two-finger pan); `npm test -- src/__tests__/touchGestures.test.ts` passes

6. **AC6: Full test suite passes** — `npm test` passes all tests with 0 failures (including new tests)

7. **AC7: Build succeeds** — `npm run build` succeeds with 0 TypeScript errors and bundle size warning resolved

## Test Methods

| Criterion | Verification Method |
|-----------|---------------------|
| AC1 | Run `npm run build`, check chunk sizes in output, verify main bundle < 400KB |
| AC2 | Run `npm test -- src/__tests__/aiNaming.test.ts`, manually test AI panel in browser |
| AC3 | Run `npm test -- src/__tests__/aiDescription.test.ts`, verify description generation |
| AC4 | Open browser DevTools, load app, check Network tab for lazy-loaded chunks |
| AC5 | Run `npm test -- src/__tests__/touchGestures.test.ts`, test on mobile viewport |
| AC6 | Run `npm test`, verify all tests pass |
| AC7 | Run `npm run build`, verify 0 TypeScript errors and no bundle warning |

## Risks

1. **Chunk splitting complexity** — Incorrect dynamic import paths may break module resolution; mitigate with careful path configuration and testing
2. **AI service mocking** — MockAIService may need adjustment for integration tests; ensure timeout handling
3. **Touch gesture conflicts** — Touch improvements may conflict with existing scroll behavior; test on actual mobile devices
4. **Test coverage gaps** — New code paths may lack tests; add tests before implementation

## Failure Conditions

1. Any acceptance criterion not passing
2. Bundle size > 400KB (excluding vendor chunks)
3. New test failures introduced
4. TypeScript errors in build
5. Breaking changes to existing functionality

## Done Definition

All 7 acceptance criteria must be true:

- [ ] `vite.config.ts` updated with manual chunks configuration
- [ ] Main bundle size < 400KB after optimization
- [ ] `src/components/AI/AIAssistantPanel.tsx` created and functional
- [ ] `src/utils/aiIntegrationUtils.ts` created with description helpers
- [ ] Lazy imports added for ChallengePanel, CodexView, FactionPanel, TechTree
- [ ] `src/components/Accessibility/MobileTouchEnhancer.tsx` created
- [ ] AI naming tests pass (≥10 new tests)
- [ ] AI description tests pass (≥8 new tests)
- [ ] Touch gesture tests pass (≥6 new tests)
- [ ] Performance tests pass (≥4 new tests)
- [ ] `npm test` passes all tests (≥1044 baseline)
- [ ] `npm run build` succeeds with 0 errors
- [ ] No bundle size warning in build output

## Out of Scope

- Backend/multiplayer infrastructure
- External AI API integration (OpenAI/Anthropic API keys)
- Native mobile app
- Cloud save/sync
- Payment processing
- Email/notification system
- Analytics dashboard
- Full i18n localization (Chinese/English only)
