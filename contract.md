# Sprint Contract — Round 16

## APPROVED

## Scope

This sprint focuses on **Polish & Shareability** — completing the tutorial system, enhancing share/export capabilities for social media, and refining the faction tech tree UI. These improvements increase user onboarding quality and export sharing potential without introducing architectural changes.

## Spec Traceability

### P0 items covered this round
- Tutorial system completion (8 steps with proper UI overlays and spotlight)
- Share card/poster enhancements (social media ready with meta tags)
- Faction tech tree visual polish (animated nodes, faction banner, progress indicators)

### P1 items covered this round
- Challenge completion animations and toast notifications
- Recipe unlock celebration animations
- Achievement unlock toast system refinement

### Remaining P0/P1 after this round
- P0: AI naming/description generation (requires external API integration)
- P0: Real-time multiplayer/collaboration (requires backend)
- P1: Community share plaza (requires backend)
- P1: Machine marketplace/trading (requires backend)

### P2 intentionally deferred
- Faction quest chains
- Seasonal events
- Cloud sync
- Mobile app

## Deliverables

1. **Tutorial System** — `src/components/tutorial/TutorialOverlay.tsx`
   - Complete 8-step tutorial with spotlight highlighting relevant UI
   - Steps: Welcome, Add Module, Connect, Activate, Save to Codex, Export, Random Forge, Explore Factions
   - Progress persistence in localStorage
   - Skip option with "Show tutorial again" in settings

2. **Share Card Enhancements** — `src/utils/shareUtils.ts`, poster templates
   - Open Graph meta tags for social media preview
   - Sharable poster template with QR code option (using inline SVG)
   - Copy-to-clipboard share link functionality
   - Platform-specific sharing buttons (Twitter/X, Reddit)

3. **Faction Tech Tree Polish** — `src/components/faction/FactionTechTree.tsx`
   - Animated faction banner with SVG gradients
   - Progress indicators showing unlock status per tier
   - Hover tooltips with faction lore
   - Visual connection lines between unlocked nodes

4. **Celebration Animations** — `src/components/common/CelebrationOverlay.tsx`
   - Challenge completion confetti burst
   - Recipe unlock glow animation
   - Achievement toast with badge display

## Acceptance Criteria

1. **AC1: Tutorial completes** — User can complete all 8 tutorial steps without errors; `npm test -- src/__tests__/tutorial.test.ts` passes all tests

2. **AC2: Share card renders** — Export generates valid poster with meta tags; `npm test -- src/__tests__/shareUtils.test.ts` passes

3. **AC3: Tech tree renders** — Faction panel displays all 4 factions with correct node states; `npm test -- src/__tests__/faction.test.ts` passes

4. **AC4: Celebration triggers** — Completing a challenge shows toast and animation; `npm test -- src/__tests__/celebration.test.ts` passes

5. **AC5: Full test suite** — `npm test` passes all 920+ tests with 0 failures

6. **AC6: Build succeeds** — `npm run build` succeeds with 0 TypeScript errors

## Test Methods

| Criterion | Verification Method |
|-----------|---------------------|
| AC1 | Run `npm test -- src/__tests__/tutorial.test.ts`, manually walk through 8 steps in browser |
| AC2 | Run `npm test -- src/__tests__/shareUtils.test.ts`, verify exported poster HTML has OG tags |
| AC3 | Run `npm test -- src/__tests__/faction.test.ts`, visually verify tech tree in Faction Panel |
| AC4 | Trigger challenge completion, observe toast and animation |
| AC5 | Run `npm test`, count passing tests |
| AC6 | Run `npm run build`, verify 0 TypeScript errors in output |

## Risks

1. **Tutorial state conflicts** — Tutorial overlay may conflict with modal/dialog state; mitigate with z-index layering and modal stack awareness
2. **Share metadata injection** — Dynamic OG tag updates may not work in all social media scrapers; document limitations in UI
3. **Animation performance** — Confetti animations may impact low-end devices; implement requestAnimationFrame throttling
4. **Test coverage gaps** — Some celebration paths may not have existing tests; add new tests before implementation

## Failure Conditions

1. Any acceptance criterion not passing
2. New test failures introduced
3. Breaking changes to existing functionality
4. TypeScript errors in build

## Done Definition

All 6 acceptance criteria must be true:

- [ ] TutorialOverlay component complete with 8 steps
- [ ] Tutorial tests pass (≥5 new tests added)
- [ ] Share card export includes OG meta tags
- [ ] ShareUtils tests pass (≥3 new tests added)
- [ ] Faction tech tree renders with visual polish
- [ ] Faction tests pass (≥2 new tests added)
- [ ] CelebrationOverlay component with animations
- [ ] Celebration tests pass (≥3 new tests added)
- [ ] `npm test` passes all tests (≥920)
- [ ] `npm run build` succeeds with 0 errors

## Out of Scope

- Backend/multiplayer infrastructure
- AI text generation API integration
- Native mobile app
- Cloud save/sync
- Payment processing
- Email/notification system
- Analytics dashboard
