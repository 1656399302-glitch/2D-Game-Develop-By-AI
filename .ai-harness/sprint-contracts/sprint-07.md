APPROVED

# Sprint Contract — Round 7

## Scope

**Remediation Sprint**: Implement all features specified in Round 6 contract that were missing. Round 6 failed because zero of 10 deliverable files existed. This round delivers the Faction System, Tech Tree, Stats Dashboard, Achievement System, and Enhanced Share Card.

## Spec Traceability

### P0 items covered this round (Round 6 remediation)
- **Faction System**: 4 factions (深渊派系/Void, 熔岩派系/Inferno, 雷霆派系/Storm, 星辉派系/Stellar)
- **Tech Tree**: 12 nodes (4 factions × 3 tiers), unlockable based on machine creation count
- **Stats Dashboard**: User statistics tracking (machines created, activations, time spent, etc.)
- **Achievement System**: 5+ achievements with toast notifications
- **Enhanced Share Card**: Faction-branded export cards

### P1 items covered this round
- Faction alignment UI panel accessible from main navigation
- Module-to-faction mapping calculator
- Achievement detection and firing logic

### Remaining P0/P1 after this round
- **None for faction/achievement systems** — this round completes those feature areas
- Note: Project-wide P0/P1 items remain (see Out of Scope), but the faction/achievement subsystem is complete

### P2 intentionally deferred
- AI naming/description assistant
- Community sharing features
- Challenge mode expansion beyond existing tutorial/challenges/recipes
- Recipe unlock system enhancement
- Module expansion beyond current 14 types

## Deliverables

1. **`src/types/factions.ts`** — Faction type definitions, 4 faction configs, tech tree node types, module-to-faction mapping
2. **`src/store/useFactionStore.ts`** — Zustand store with localStorage persistence for faction progress and unlocks
3. **`src/store/useStatsStore.ts`** — Zustand store for user statistics (machines created, activations, playtime, faction counts)
4. **`src/components/Factions/FactionPanel.tsx`** — UI panel for faction alignment selection and progress display
5. **`src/components/Factions/TechTree.tsx`** — 12-node tech tree visualization (4 factions × 3 tiers)
6. **`src/components/Stats/StatsDashboard.tsx`** — Statistics display panel with charts/metrics
7. **`src/components/Achievements/AchievementToast.tsx`** — Toast notification component for achievement unlocks
8. **`src/components/Achievements/AchievementList.tsx`** — List view of all achievements (earned and locked)
9. **`src/components/Export/EnhancedShareCard.tsx`** — Faction-branded share card export with themed borders
10. **`src/utils/achievementChecker.ts`** — Achievement detection logic, triggers callbacks when earned
11. **`src/utils/factionCalculator.ts`** — Calculate machine's dominant faction based on modules used

## Acceptance Criteria

1. **AC1**: `src/utils/factionCalculator.ts` exports `calculateFaction(modules)` returning dominant faction from 4 options (Void, Inferno, Storm, Stellar) based on module-to-faction mapping defined in `src/types/factions.ts`
2. **AC2**: `src/components/Factions/TechTree.tsx` renders 12 nodes in a 4×3 grid layout, with locked nodes showing `.tech-tree-node--locked` CSS class and unlocked nodes showing `.tech-tree-node--unlocked` class
3. **AC3**: `src/store/useStatsStore.ts` increments and persists user statistics via localStorage; stats visible in `StatsDashboard.tsx` within 1 second of action
4. **AC4**: `src/utils/achievementChecker.ts` exports `checkAchievements(stats)` that returns array of newly earned achievement IDs based on the 5 defined achievements; `AchievementToast.tsx` renders with correct faction badge
5. **AC5**: `src/components/Export/EnhancedShareCard.tsx` generates share card with faction-specific border colors (Void: purple, Inferno: orange, Storm: cyan, Stellar: gold)
6. **AC6**: `npm run build` exits 0 with 0 TypeScript errors
7. **AC7**: `npm test` shows no NEW test failures (pre-existing failure in `activationModes.test.ts` is acknowledged but not counted against this sprint)

## Test Methods

| AC | Verification Method |
|----|---------------------|
| AC1 | Unit test: `factionCalculator.test.ts` — pass arrays of modules from each faction, verify correct faction returned. Void modules: void-siphon, phase-modulator; Inferno: fire-crystal, core-furnace; Storm: lightning-conductor, energy-pipe; Stellar: amplifier-crystal, resonance-chamber |
| AC2 | Render test: `TechTree.test.tsx` — verify 12 nodes render, use `screen.getAllByRole('button')` count === 12, verify locked/unlocked CSS classes via `container.querySelectorAll('.tech-tree-node--locked').length` |
| AC3 | Integration test: `useStatsStore.test.ts` — call `incrementStat('machinesCreated')`, verify `getStats().machinesCreated === 1`, reload page, verify persistence |
| AC4 | Unit test: `achievementChecker.test.ts` — pass stats `{ machinesCreated: 1 }`, verify returns `['first-forge']`; pass `{ machinesCreated: 10 }`, verify returns `['first-forge', 'energy-master']` |
| AC5 | Render test: `EnhancedShareCard.test.tsx` — render with `faction="void"`, verify border color includes purple (`#a78bfa`); render with `faction="inferno"`, verify border color includes orange (`#f97316`) |
| AC6 | `npm run build` command exits with code 0 |
| AC7 | `npm test` shows same or better pass count than pre-sprint baseline (448/449 passing) |

## Defined Achievement Conditions

1. **first-forge**: `machinesCreated >= 1`
2. **energy-master**: `machinesCreated >= 10`
3. **void-conqueror**: `factionCounts['void'] >= 5`
4. **perfect-activation**: `activations >= 1 && errors === 0` (first activation has no errors)
5. **codex-collector**: `codexEntries >= 10`

## Defined Module-to-Faction Mapping

| Faction | Modules |
|---------|---------|
| Void (深渊) | void-siphon, phase-modulator |
| Inferno (熔岩) | fire-crystal, core-furnace |
| Storm (雷霆) | lightning-conductor, energy-pipe |
| Stellar (星辉) | amplifier-crystal, resonance-chamber |

*Neutral modules (not counted for faction): gear, rune-node, shield-shell, trigger-switch, output-array, stabilizer-core*

## Risks

1. **Integration Risk**: Faction system must integrate cleanly with existing `useMachineStore` — ModuleType enum may need extension for future factions
2. **State Synchronization**: Stats must update correctly when machines are created/activated — must hook into useMachineStore actions
3. **CSS Isolation**: Tech tree grid layout must not break existing layouts — use scoped/component-level styles
4. **Pre-existing Test**: `activationModes.test.ts` has a failing spacing test that predates this sprint

## Failure Conditions

1. Any of the 11 deliverable files (AC1-AC5) do not exist or fail to build
2. TypeScript compilation errors in new files
3. New tests fail
4. Feature does not meet acceptance criteria as verified by test or manual check

## Done Definition

All 7 acceptance criteria must be true:
- [ ] `calculateFaction()` function exists and returns correct faction based on module array
- [ ] Tech tree renders 12 nodes with correct locked/unlocked CSS class states
- [ ] Stats persist across page reloads and update on user actions
- [ ] Achievements fire callbacks and display toast notifications with correct faction badge
- [ ] Share card renders with faction-specific theming (verified by border color)
- [ ] `npm run build` exits 0
- [ ] `npm test` shows no NEW test failures

## Out of Scope

- AI text generation for names/descriptions
- Community/sharing backend
- Additional game modes beyond existing tutorial/challenges/recipes
- Module expansion beyond current 14 types
- Visual redesign of existing components
- Performance optimization of existing systems
- Fixing pre-existing test failure in `activationModes.test.ts`

---

## Implementation Notes

### Faction System Design

**4 Factions:**
1. **深渊派系 (Void)**: Dark purple theme (#a78bfa), void/entropy modules
2. **熔岩派系 (Inferno)**: Orange/red theme (#f97316), fire/destruction modules
3. **雷霆派系 (Storm)**: Blue/cyan theme (#22d3ee), energy/lightning modules
4. **星辉派系 (Stellar)**: Gold/white theme (#fbbf24), harmony/amplification modules

**Tech Tree Tiers:**
- Tier 1: Basic unlocks (new module variants per faction)
- Tier 2: Advanced features (special animations)
- Tier 3: Ultimate abilities (exclusive effects)

**Unlock Logic:**
- Tier 1: 3 machines created with that faction's modules
- Tier 2: 7 machines created with that faction's modules
- Tier 3: 15 machines created with that faction's modules

### Stats to Track
- Total machines created
- Total activations
- Total errors during activation
- Total playtime (minutes, tracked via active session)
- Favorite faction (calculated)
- Machines per faction count
- Achievement count
- Codex entry count

### UI Integration Points
- FactionPanel accessible from main navigation (top bar or sidebar)
- StatsDashboard accessible from main navigation
- Achievement toast appears top-right, auto-dismisses after 4 seconds
- AchievementList accessible from main navigation
