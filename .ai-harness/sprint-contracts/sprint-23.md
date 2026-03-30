APPROVED

# Sprint Contract — Round 23

## Scope

**Feature addition:** Implement the Community Sharing Square — a gallery where users can browse, publish, and load community-created machines. This is a spec-required feature under "导出分享" (export/share) and "社区分享广场" (community sharing square).

**Core capabilities:**
1. A "Community Gallery" panel accessible from the toolbar
2. A "Publish to Gallery" option in the export modal
3. Mock community data source with 6–8 sample machines
4. Browse, filter, and search community machines
5. "Load into Editor" to import a community machine into the workspace
6. "Like" and "View Count" display for community machines

**Technical approach:**
- Create `src/data/communityGallery.ts` with mock machine data
- Create `src/store/useCommunityStore.ts` for community state
- Create `src/components/Community/CommunityGallery.tsx` for the gallery panel
- Add "Community Gallery" button to the Toolbar
- Add "Publish to Gallery" option in ExportModal (as a new format button alongside existing export formats)
- Integrate with existing machine store for save/load

## Spec Traceability

- **P0 covered this round:**
  - Community Sharing Square gallery interface
  - Publish machine to community
  - Browse community machines
  - Load community machine into editor
- **P1 covered this round:**
  - Search and filter community machines
  - Like/view counts display
- **P2 / extensibility deferred beyond this round:**
  - Real backend/persistence across browser sessions
  - User authentication
  - Comments, reactions, following
  - AI naming/description assistant
  - Faction tech tree expansion
  - Recipe unlocking system
  - Challenge/task mode completion
  - Community trading/exchange

## Deliverables

1. **`src/data/communityGallery.ts`** — Mock community data with 6–8 sample machines
   - Each entry: machine config, attributes, author, publish date, likes, views
   - Diversity: different factions, rarities, complexity levels

2. **`src/store/useCommunityStore.ts`** — Community state management
   - Published machines list (session-scoped, localStorage-backed)
   - Search query
   - Filter state (faction, rarity, sort)
   - Load/publish actions

3. **`src/components/Community/CommunityGallery.tsx`** — Gallery panel component
   - Grid view of community machines
   - Search bar
   - Filter dropdowns (faction, rarity)
   - Sort options (newest, most liked, most viewed)
   - Machine cards with preview thumbnail, name, stats, author
   - "Load" button to import into editor
   - Responsive layout

4. **`src/components/Community/PublishModal.tsx`** — Publish confirmation dialog
   - Preview of machine before publishing
   - Optional author name input
   - Confirm/cancel buttons

5. **Toolbar integration** — Add "Community Gallery" button
   - Icon button in main toolbar (right-side action group)
   - Opens CommunityGallery panel

6. **ExportModal integration** — Add "Publish to Gallery" option
   - New format button alongside existing SVG/PNG/Poster/Enhanced/Faction Card buttons
   - Triggers PublishModal on selection

7. **Tests** — `src/__tests__/communityGallery.test.ts`
   - Store actions
   - Component rendering
   - Load/publish flows

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| AC10a | Community Gallery opens from toolbar | Click "Community Gallery" button → modal/panel opens |
| AC10b | Gallery displays mock machines | At least 6 machines visible in grid |
| AC10c | Search filters machines | Type query → results update |
| AC10d | Load imports machine to editor | Click "Load" → machine appears in canvas |
| AC10e | Publish adds machine to gallery | Click "Publish" → machine appears in gallery |
| AC10f | Build succeeds | `npm run build` → 0 TypeScript errors |
| AC10g | Tests pass | `npm test` → all community tests passing |

## Test Methods

1. **AC10a:** Manual browser test — click toolbar button, verify modal/panel opens
2. **AC10b:** Visual or screenshot verification of gallery grid rendering at least 6 mock machines
3. **AC10c:** Type a query in the search bar, verify results are filtered accordingly
4. **AC10d:** Click "Load" on any community machine, verify canvas updates with that machine's modules and connections
5. **AC10e:** Publish a machine, verify it appears in the gallery list immediately afterward. **Note:** Published machines are session-scoped (localStorage-backed for the current browser session only). They are NOT persisted across page refresh or across browser sessions. Do NOT test persistence across refresh — that is out of scope.
6. **AC10f:** `npm run build` must complete with 0 TypeScript errors
7. **AC10g:** `npm test` must pass all tests including new community gallery tests

## Risks

1. **Name collision risk:** Publishing a machine with the same name as an existing entry. **Mitigation:** Add timestamp to published machine ID to ensure uniqueness.
2. **State integration risk:** Loading a community machine clears current workspace. **Mitigation:** Show confirmation dialog if workspace contains unsaved modules before loading.
3. **Mock data persistence:** Published machines are session-scoped only (localStorage). They do not persist across page refresh or browser restart. **Mitigation:** Document this as an expected limitation in the UI. Do not design tests that expect cross-session persistence.
4. **Test coverage:** New tests must not break existing test suite. **Mitigation:** Run full test suite after implementation.

## Failure Conditions

The round fails if any of the following occur:

1. `npm run build` fails with TypeScript errors
2. Any existing tests fail (regression)
3. Community Gallery does not render or is non-functional
4. Load functionality does not import machine into canvas
5. Publish functionality does not add machine to gallery list
6. Any new tests fail

## Done Definition

All of the following must be true before claiming the round complete:

1. ✅ `npm run build` completes with 0 TypeScript errors
2. ✅ `npm test` passes all tests (existing + new community tests)
3. ✅ Community Gallery opens from toolbar button
4. ✅ Gallery displays at least 6 mock machines
5. ✅ Search/filter functionality updates visible results
6. ✅ "Load" button imports community machine into canvas workspace
7. ✅ "Publish" button adds current machine to gallery list
8. ✅ No regressions in existing functionality (all prior tests still pass)

## Out of Scope

1. **Real backend/database** — Mock data only, no server or API
2. **Cross-session persistence** — Published machines are session-scoped (localStorage); lost on page refresh or browser restart
3. **User authentication** — Anonymous publishing with optional display name
4. **Comments/reactions** — Only likes and view counts
5. **Categories/tags system** — Simple text search only (no structured taxonomy)
6. **Social features** — No following, feed, sharing, or moderation
7. **Mobile optimization** — Gallery is functional but desktop-optimized
