# Sprint Contract — Round 6

## Scope

This sprint adds **Faction System with Tech Tree**, **User Stats Dashboard**, and **Enhanced Sharing** to the Arcane Machine Codex Workshop. These features deepen the meta-game progression and provide users with long-term engagement goals beyond individual machine creation.

## Spec Traceability

### P0 Items Covered This Round
1. **Faction System** — 4 magical factions (Arcane Order, Mechanical Guild, Elemental Circle, Void Covenant) with alignment based on module usage
2. **Tech Tree** — Unlocks and bonuses tied to faction progression
3. **Stats Dashboard** — User statistics (machines created, challenges completed, playtime, favorite modules)
4. **Faction-vs-faction battles** (from spec "派系科技树") — Purely cosmetic progression system

### P1 Items Covered This Round
5. **Faction-branded Export** — Share cards include faction emblems and progression badges
6. **Achievement System** — Milestone unlocks based on stats (first machine, 10 machines, all challenges, etc.)

### Remaining P0/P1 After This Round
- All P0 features from previous rounds remain implemented and functional:
  - Module panel (14+ modules with Chinese names)
  - Machine editor with canvas, toolbar, properties panel
  - Activation system (idle/charging/active/overload/failure/shutdown states)
  - Build/circuit system with 6 challenges
  - Machine attributes generation (name, rarity, tags, stability, output type, faction, description)
  - Codex system with list/detail views, filtering, sorting
  - Random generation mode
  - Export (SVG, PNG, share card)
  - Keyboard shortcuts, ARIA labels, viewport culling, module tooltips
- No P0/P1 items are being deferred this round

### P2 Intentionally Deferred
- AI naming/description API integration
- Community sharing marketplace
- Codex trading/exchange system
- Multiplayer/cooperative mode
- Audio system (sound effects or music)
- Mobile touch optimization

## Deliverables

| File | Purpose |
|------|---------|
| `src/types/factions.ts` | Faction definitions, tech tree nodes, and types |
| `src/store/useFactionStore.ts` | Zustand store for faction progress and unlocks |
| `src/store/useStatsStore.ts` | Zustand store for user statistics tracking |
| `src/components/Factions/FactionPanel.tsx` | UI for viewing faction alignment and progress |
| `src/components/Factions/TechTree.tsx` | Visual tech tree with unlock nodes |
| `src/components/Stats/StatsDashboard.tsx` | Dashboard showing user statistics |
| `src/components/Achievements/AchievementToast.tsx` | Notification for unlocked achievements |
| `src/components/Export/EnhancedShareCard.tsx` | Export with faction branding |
| `src/utils/factionCalculator.ts` | Logic to determine faction alignment from machine composition |
| `src/utils/achievementChecker.ts` | Logic to detect and award achievements |

## Acceptance Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| AC1 | **Faction Assignment** — Machine is tagged with a faction based on dominant module category usage | Unit test: `calculateFaction([fireCrystal, fireCrystal, fireCrystal])` returns `"elemental-circle"` |
| AC2 | **Tech Tree Renders** — Displays 4 factions × 3 tiers = 12 nodes with locked/unlocked visual states | Unit test: Render `TechTree`, verify 12 SVG nodes exist with correct `.locked` or `.unlocked` classes |
| AC3 | **Stats Track** — Counters increment on machine save, challenge complete, session time | Unit test: Call `statsStore.incrementMachines()`, `statsStore.incrementChallenges()`, verify values |
| AC4 | **Achievements Fire** — At least 5 achievements trigger at defined thresholds | Unit test: Set `machineCount = 10`, verify `"10_machines"` achievement `onUnlock` callback called |
| AC5 | **Faction Export** — Share card includes faction emblem SVG and tier badge | Unit test: Call `generateShareCard(machine)`, verify `factionEmblem` (SVG string) and `factionTier` (1-3) |
| AC6 | **Build Passes** — `npm run build` exits 0 with 0 TypeScript errors | Run build, assert exit code 0 |
| AC7 | **Tests Pass** — `npm test` shows all existing + new tests passing | Run tests, assert 100% pass rate (baseline: 449 existing) |

## Test Methods

| Criterion | Test Command | Expected Result |
|-----------|--------------|-----------------|
| AC1: Faction Assignment | `npm test -- --testPathPattern=factionCalculator` | Test passes, returns correct faction ID |
| AC2: Tech Tree Renders | `npm test -- --testPathPattern=TechTree` | Test passes, 12 nodes verified |
| AC3: Stats Track | `npm test -- --testPathPattern=useStatsStore` | Test passes, counters increment |
| AC4: Achievements Fire | `npm test -- --testPathPattern=achievementChecker` | Test passes, callbacks fire at thresholds |
| AC5: Faction Export | `npm test -- --testPathPattern=EnhancedShareCard` | Test passes, export contains faction data |
| AC6: Build Passes | `npm run build` | Exit code 0, no TypeScript errors |
| AC7: Tests Pass | `npm test` | 449 + N tests pass, 0 failures |

## Risks

| Risk | Mitigation |
|------|------------|
| **Faction Calculation Accuracy** — Module-to-faction mapping must reflect actual module types | Verify against `src/types/modules.ts` before implementation; unit test all module categories |
| **Tech Tree Layout** — 12-node grid requires careful positioning | Use CSS grid with fixed cell sizes; test responsive behavior |
| **Stats Persistence** — Stats must survive page reload | Use localStorage via Zustand persist; verify in test suite |
| **Achievement Timing** — Notifications must not interfere with user flow | Use toast with auto-dismiss; debounce rapid unlocks |

## Failure Conditions

The round **fails** if any of the following occur:

1. `npm run build` exits non-zero or produces TypeScript errors
2. Any existing test fails (regression) — 449 tests must continue to pass
3. New features break existing module placement, activation, or export
4. Faction assignment returns `undefined` or invalid faction ID for any module combination
5. Tech tree renders fewer than 12 nodes
6. Fewer than 5 achievements are defined or triggerable
7. Stats store does not persist data across page reloads
8. Faction panel is not accessible from main UI

## Done Definition

All conditions **must** be true before claiming round complete:

- [ ] `npm run build` exits 0 with 0 TypeScript errors
- [ ] `npm test` shows 100% pass rate (449 existing + all new tests pass, 0 failures)
- [ ] `calculateFaction()` correctly maps all module types to faction IDs
- [ ] Tech tree renders 12 nodes (4 factions × 3 tiers) with visible locked/unlocked states
- [ ] Stats store increments `machinesCreated`, `challengesCompleted`, `totalPlaytime` on appropriate actions
- [ ] At least 5 achievements defined in `achievementChecker.ts` with threshold conditions
- [ ] Enhanced share card includes faction emblem SVG string and tier badge number
- [ ] No breaking changes: editor, activation system, export modal all function correctly
- [ ] Faction panel accessible from main UI
- [ ] All new code has TypeScript types with no `any` types

## Out of Scope

This round explicitly does **NOT** include:

| Item | Reason |
|------|--------|
| AI naming API integration | Interface stub only, no actual AI |
| Community marketplace | Requires backend and authentication |
| Multiplayer/cooperative features | Single-user only |
| Audio system (sound effects, music) | Visual-only this round |
| Mobile touch optimization | Desktop-first implementation |
| Theme toggle | Single dark theme maintained |
| Faction-vs-faction combat | Purely cosmetic progression only |
| Persistent achievement gallery | Toast notifications only this round |

---

## Notes for Reviewer

- **Scope Focus:** Data layer + UI + persistence; no new editor interactions introduced
- **Faction Calculation:** Server-side calculation simulated client-side for MVP based on machine composition
- **Tech Tree:** Read-only this round; unlocks trigger visual changes only (no gameplay modifiers)
- **Achievement Notifications:** Toast UI with auto-dismiss; no persistent gallery this round
- **Test Baseline:** 449 tests from Round 5; new tests expected for all new components
- **Persistence:** All stores use Zustand persist middleware with localStorage
