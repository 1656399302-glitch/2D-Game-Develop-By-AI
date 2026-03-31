APPROVED

# Sprint Contract — Round 65

## Scope

**Theme: Machine Collection Management & Organization Enhancements**

This sprint adds comprehensive machine organization features: favorites/bookmarks for community machines, custom tagging for user's machines, collection statistics dashboard, and machine duplicate detection. These features enhance the collection management capabilities without disrupting the core creative workflow.

## Spec Traceability

### P0 Items (Must Complete — All Prior Rounds)
- [x] Core Furnace module (Round 1)
- [x] Energy Pipe module (Round 1)
- [x] Gear module (Round 1)
- [x] Rune Node module (Round 1)
- [x] Shield Shell module (Round 1)
- [x] Trigger Switch module (Round 1)
- [x] Output Array module (Round 1)
- [x] Connection system (Round 5)
- [x] Activation system (Round 8)
- [x] Attribute generation (Round 6)
- [x] Codex system (Round 4)
- [x] Random generator (Round 12)
- [x] Community gallery (Round 20+)
- [x] Challenge system (Round 30+)
- [x] Faction system (Round 25+)
- [x] Recipe system (Round 40+)
- [x] Advanced module types (Round 64)

### P1 Items (Covered This Round)
- **Favorites System** — Add/remove community machines to personal favorites with dedicated favorites view
- **Custom Tags** — User-defined tags for organizing saved codex machines
- **Collection Stats Dashboard** — Visual statistics about user's machine collection (rarity distribution, faction breakdown, completion stats)
- **Duplicate Detection** — Warning when creating a machine nearly identical to an existing one

### P2 Items (Deferred — Not This Round)
- AI naming assistant enhancements
- Machine version history with diff
- Community comments system
- Social features (follow users)
- Advanced faction tech tree branches
- 3D preview mode
- Sound effects integration

## Deliverables

### 1. Favorites System
| File | Purpose |
|------|---------|
| `src/store/useFavoritesStore.ts` | New Zustand store with localStorage persistence |
| `src/components/Favorites/FavoritesPanel.tsx` | New component for favorites view |
| `src/components/Community/CommunityGallery.tsx` | Add favorite toggle button to gallery cards |
| `src/__tests__/favorites.test.ts` | Unit and integration tests for favorites |

**Behavior Requirements:**
- Toggle favorite on/off from community gallery cards (heart icon)
- Dedicated "My Favorites" tab/view in gallery showing only favorited machines
- Favorites persist across browser restarts via localStorage
- Favorites count badge visible on tab

### 2. Custom Tags System
| File | Purpose |
|------|---------|
| `src/types/index.ts` | Add Tag interface definition |
| `src/store/useMachineTagsStore.ts` | New Zustand store with localStorage persistence |
| `src/components/Codex/CodexView.tsx` | Add tag editor integration |
| `src/components/Codex/MachineTagEditor.tsx` | New component for tag editing |
| `src/__tests__/machineTags.test.ts` | Unit and integration tests for tags |

**Behavior Requirements:**
- Add/remove/edit tags on codex entries
- Maximum 5 tags per machine
- Tag autocomplete from existing tags
- Filter codex by tags
- Tags persist across browser restarts via localStorage

### 3. Collection Statistics Dashboard
| File | Purpose |
|------|---------|
| `src/components/Stats/CollectionStatsPanel.tsx` | New component for stats display |
| `src/components/Stats/StatsDashboard.tsx` | Integrate new panel into stats view |
| `src/__tests__/collectionStats.test.ts` | Unit and integration tests for stats |

**Behavior Requirements:**
- Rarity distribution pie/bar chart (Common, Uncommon, Rare, Epic, Legendary)
- Faction composition breakdown
- Module usage statistics (count per module type)
- Collection completion percentage
- Average machine complexity (modules per machine)
- Statistics update when codex machines are added/removed

### 4. Duplicate Detection System
| File | Purpose |
|------|---------|
| `src/utils/duplicateDetector.ts` | New utility for similarity comparison |
| `src/store/useMachineStore.ts` | Add duplicate check on machine save |
| `src/__tests__/duplicateDetector.test.ts` | Unit tests for detection logic |

**Behavior Requirements:**
- Compare machine structure (modules + connections)
- 80% similarity threshold triggers warning
- Warning toast with "Keep Anyway" / "Discard" options
- Detection works for manual creation and random forge
- Store detection history in localStorage

### 5. Integration Updates
| File | Purpose |
|------|---------|
| `src/App.tsx` | Add FavoritesPanel to navigation |
| `src/components/Editor/Toolbar.tsx` | Add collection stats button |

## Acceptance Criteria

| # | Criterion | Binary? | Verification Method |
|---|-----------|---------|---------------------|
| AC1 | Can add community machine to favorites from gallery card | YES | Click heart → icon changes to filled → machine appears in Favorites tab |
| AC2 | Can remove community machine from favorites | YES | Click filled heart → icon changes to outline → machine removed from Favorites |
| AC3 | Favorites persist across browser restarts | YES | Add favorite → close browser → reopen → favorite still present |
| AC4 | "My Favorites" tab shows only favorited machines | YES | 0 favorites → tab empty; 3 favorites → tab shows 3 machines |
| AC5 | Can add tags to codex machine (max 5) | YES | Edit tags → add 5 tags → all 5 visible on entry |
| AC6 | Cannot add more than 5 tags per machine | YES | Attempt to add 6th tag → error shown, 6th tag not added |
| AC7 | Tag autocomplete suggests existing tags | YES | Type partial tag → autocomplete dropdown shows matching tags |
| AC8 | Tags persist across browser restarts | YES | Add tags → close browser → reopen → tags still present |
| AC9 | Codex filter shows machines with selected tag | YES | Filter by "fire-type" → only machines with "fire-type" tag shown |
| AC10 | Duplicate detection triggers at 80%+ similarity | YES | Create machine A → create identical machine B → warning appears |
| AC11 | "Keep Anyway" saves duplicate machine | YES | Warning shown → click "Keep Anyway" → machine saved to codex |
| AC12 | "Discard" returns to editor without saving | YES | Warning shown → click "Discard" → machine NOT in codex, editor unchanged |
| AC13 | Stats dashboard shows rarity distribution | YES | 3 common, 2 rare machines → chart shows 5 bars with correct counts |
| AC14 | Stats dashboard shows faction breakdown | YES | 2 arcane, 3 temporal machines → pie chart shows 2 factions with correct counts |
| AC15 | Statistics update when codex changes | YES | Add machine → open stats → count increased by 1 |
| AC16 | TypeScript compilation: 0 errors | YES | `npx tsc --noEmit` returns 0 errors |
| AC17 | Vite build: successful | YES | `npm run build` completes without error |
| AC18 | All existing tests (104 files, ~2352 tests) pass | YES | `npm test -- --run` shows 2352/2352 passed |
| AC19 | New test files pass | YES | `npm test -- favorites.test.ts machineTags.test.ts duplicateDetector.test.ts collectionStats.test.ts` all pass |
| AC20 | UI elements visible and accessible | YES | Gallery cards show heart button; codex entries show tag editor; toolbar shows stats button |

## Test Methods

### Unit Tests

**T1: Favorites Store (`favorites.test.ts`)**
```
1. Create useFavoritesStore instance
2. addFavorite(machineId) → expect store favorites includes machineId
3. removeFavorite(machineId) → expect store favorites excludes machineId
4. Toggle: add → remove → expect back to empty
5. Persistence: serialize → deserialize → expect same data
```

**T2: Machine Tags Store (`machineTags.test.ts`)**
```
1. Create useMachineTagsStore instance
2. addTag(machineId, "fire-type") → expect tags includes "fire-type"
3. removeTag(machineId, "fire-type") → expect tags excludes "fire-type"
4. addTag beyond limit → expect error thrown or tag rejected
5. getAutocomplete("fir") → expect suggestions includes "fire-type"
6. Persistence: serialize → deserialize → expect same data
```

**T3: Duplicate Detector (`duplicateDetector.test.ts`)**
```
1. identicalMachines(A, A) → expect 100% similarity
2. completelyDifferent(A, B) → expect 0% similarity
3. partialMatch(50% same) → expect ~50% similarity (tolerance ±5%)
4. threshold79() → expect NO warning triggered
5. threshold80() → expect warning triggered
6. threshold81() → expect warning triggered
7. emptyMachine(A, empty) → expect handled gracefully
```

**T4: Collection Stats (`collectionStats.test.ts`)**
```
1. emptyCollection → expect all counts at 0
2. 3 machines with rarities → expect correct distribution
3. 2 machines with factions → expect correct breakdown
4. 5 modules total → expect module count = 5
5. 3 machines, 15 total modules → expect avg complexity = 5
```

### Integration Tests

**T5: Favorites Flow**
```
1. Open community gallery
2. Verify empty favorites tab (0 items)
3. Click heart on machine card → verify heart filled
4. Navigate to Favorites tab → verify machine listed
5. Close browser tab
6. Reopen and navigate to gallery → verify machine still favorited
7. Click filled heart → verify heart unfilled
8. Verify machine removed from Favorites tab
```

**T6: Tags Flow**
```
1. Open codex
2. Select machine entry
3. Click "Edit Tags"
4. Enter "test-tag" → select from autocomplete
5. Enter "fire-type" → select from autocomplete
6. Save → verify both tags displayed
7. Filter by "test-tag" → verify correct machine shown
8. Refresh page → verify tags persisted
9. Attempt to add 6th tag → verify error, tag rejected
```

**T7: Duplicate Detection Flow**
```
1. Create machine with Core Furnace + Gear + Output Array
2. Save machine → verify no warning (first of its kind)
3. Create identical machine → verify warning appears with percentage
4. Click "Discard" → verify machine NOT saved
5. Create nearly identical machine (adds Rune Node) → verify NO warning
6. Create same machine again → verify warning
7. Click "Keep Anyway" → verify machine saved
```

**T8: Stats Dashboard Flow**
```
1. Open stats dashboard with empty collection → verify all zeros
2. Create 5 machines with different rarities
3. Open stats dashboard → verify rarity chart shows 5 entries
4. Save machines to codex
5. Verify stats updated
6. Close and reopen dashboard → verify stats persisted
```

### Negative Test Cases

**T9: Edge Cases**
```
1. Add 101st favorite → verify warning displayed, limit enforced
2. Add tag with special chars (!@#$) → verify sanitization or error
3. Duplicate detect empty canvas → verify no crash, no warning
4. Duplicate detect single module → verify no warning
5. Stats with malformed machine data → verify graceful handling
```

## Risks

| Risk | Likelihood | Impact | Mitigation | Fallback |
|------|------------|--------|------------|----------|
| localStorage limit exceeded (5MB) | Medium | High | Compress data before storage; warn at 80% capacity | Implement sliding window for oldest items; prune old entries |
| Duplicate detection performance | Medium | Medium | Use quick hash comparison first, then detailed diff | Limit comparison to last 50 codex machines |
| Store hydration conflicts | Low | Medium | Proper async hydration pattern | Sequential store initialization |
| Chart rendering with large datasets | Low | Low | Canvas-based charts or data virtualization | Simplify to text-based stats |
| localStorage data corruption | Low | High | JSON validation on load; fallback to defaults | Clear corrupted data; restore from defaults |

## Failure Conditions

The round FAILS if ANY of the following conditions occur:

| # | Condition | Detection Method |
|---|-----------|------------------|
| F1 | Build fails | `npm run build` returns non-zero exit code |
| F2 | TypeScript errors | `npx tsc --noEmit` returns errors |
| F3 | Existing tests break | Any of 104 test files fail |
| F4 | Favorites not persisting | Manual: add favorite → refresh → favorite gone |
| F5 | Tags not persisting | Manual: add tag → refresh → tag gone |
| F6 | Duplicate detection always triggers | Creating different machines triggers warning |
| F7 | Duplicate detection never triggers | Creating identical machines does not trigger warning |
| F8 | Stats dashboard crashes | Empty collection causes render error |
| F9 | localStorage grows unbounded | localStorage exceeds 4MB after 100 favorites/tags |
| F10 | UI elements missing | Favorite button not visible on gallery cards |
| F11 | Tag editor not accessible | Cannot open tag editor on codex entries |
| F12 | Duplicate warning does not appear | No toast shown on duplicate creation |

## Done Definition

The round is complete when ALL 18 criteria below are verified:

| # | Criterion | Verification |
|---|-----------|--------------|
| D1 | `useFavoritesStore.ts` exists | File present with localStorage persistence in code |
| D2 | `FavoritesPanel.tsx` renders | Component visible with empty/populated states |
| D3 | Heart button on gallery cards | Click toggles favorite state |
| D4 | Favorites persist | Add → refresh → present |
| D5 | `useMachineTagsStore.ts` exists | File present with localStorage persistence in code |
| D6 | `MachineTagEditor.tsx` functional | Add/remove tags works, max 5 enforced |
| D7 | Tag editor on codex detail | Edit Tags button opens editor |
| D8 | Tag autocomplete works | Type → dropdown shows matches |
| D9 | Tags persist | Add → refresh → present |
| D10 | `duplicateDetector.ts` correct | 80%+ triggers, <80% does not |
| D11 | Duplicate warning appears | Toast shows with Keep/Discard |
| D12 | `CollectionStatsPanel.tsx` displays | Rarity, faction, module stats visible |
| D13 | Stats update dynamically | Add machine → stats count increases |
| D14 | TypeScript: 0 errors | `npx tsc --noEmit` passes |
| D15 | Vite build: success | `npm run build` passes |
| D16 | All existing tests pass | 2352/2352 tests pass |
| D17 | New tests pass | All 4 new test files pass |
| D18 | UI accessible | All buttons and panels functional |

## Out of Scope

The following are explicitly NOT being done in this round:

| Category | Excluded Feature | Reason |
|----------|------------------|--------|
| Social | Community comments | Future enhancement |
| Social | User profiles with avatars | Future enhancement |
| Social | Following other users | Future enhancement |
| Social | Machine ratings beyond likes | Future enhancement |
| Social | Social sharing with comments | Future enhancement |
| Versioning | Machine version history with diff | Future enhancement |
| Persistence | Server-side persistence | localStorage only for this round |
| Operations | Bulk operations on favorites/tags | Future enhancement |
| Import/Export | Import/export collection as file | Future enhancement |
| Templates | Machine template system | Future enhancement |
| AI | AI naming/description assistant | Future enhancement |
| Modules | New module types | Completed in Round 64 |
| Audio | Sound effects | Future enhancement |
| 3D | 3D preview mode | Future enhancement |
| Factions | Advanced faction tech tree branches | Future enhancement |

## Operator Inbox Instructions

**No pending operator inbox items for Round 65.**

Previous operator item (Round 51): "对所有功能模型进行测试,尤其是模块与模块间的交互,UI的交互,必须用最严格的测试标准,并将测出来的Bug修复" — This item was processed and injected into Round 51's build phase. No new items target this contract round.

---

## Notes for Reviewer

- All P0 items from prior rounds are complete and marked as verified in spec traceability
- This round focuses on 4 new P1 features that enhance collection management
- All deliverables have specific file paths and test coverage requirements
- Failure conditions are explicit and testable
- Out of scope items are clearly enumerated with categories
