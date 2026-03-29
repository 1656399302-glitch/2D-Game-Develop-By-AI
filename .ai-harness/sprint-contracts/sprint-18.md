# Sprint Contract — Round 18

## Scope
**Theme: Challenge System Expansion + Faction Reputation System**

Expanding the challenge system to 16 challenges with proper category coverage and difficulty tiers, and introducing a new faction reputation system with levels, achievement integration, and faction-exclusive module variants.

---

## Spec Traceability

### P0 items covered this round
1. **Challenge System Expansion** — Expand to 16 challenges (8 original replaced + 8 new), with time-trial mode and scoring
2. **Faction Reputation System** — New reputation store with points, 5 levels, and achievement-to-reputation integration
3. **Faction-exclusive Module Variants** — 4 new module types unlocked through faction reputation Grandmaster rank
4. **Achievement-Faction Reputation Integration** — Completing faction-linked achievements grants +10 reputation

### P1 items covered this round
1. **Challenge Card UI Redesign** — Modern card UI with difficulty badges, progress bars, and reward previews
2. **Faction Reputation Display** — Add reputation bar to faction panel, show levels with icons
3. **Challenge Timer** — Add countdown timer for time-trial challenge mode

### Remaining P0/P1 after this round
- Recipe system: complete with 14 recipes (from Round 16)
- AI naming: complete (from Round 17)
- Performance optimization: complete (from Round 17)
- Faction system: core complete (tech tree + reputation + variants)
- Challenge system: complete with 16 challenges

### P2 intentionally deferred
- Community sharing square
- Codex trading/exchange
- AI narrative generator for machine backstories
- Multiplayer challenges
- Seasonal challenge events

---

## Pre-Round Cleanup (MUST complete before new work begins)

Before any new code is written, the following MUST be resolved:

| Task | Action | File(s) Affected |
|------|--------|-----------------|
| C1 | Reconcile duplicate challenge systems. Deprecate `CHALLENGES` from `src/types/challenges.ts`. The canonical system is `CHALLENGE_DEFINITIONS` from `src/data/challenges.ts`. Update any imports referencing `CHALLENGES`. | `src/types/challenges.ts`, any files importing `CHALLENGES` |
| C2 | Verify actual test count. Run `npm test` and record the exact passing count as the Round 18 baseline. Replace all references to "1135" in this contract with the real number. | This contract |
| C3 | Remove `ChallengeDifficulty` type from `src/types/challenges.ts` if `CHALLENGES` is deprecated, or mark it as deprecated | `src/types/challenges.ts` |

---

## Deliverables

### New files to create:
| File | Description | Acceptance |
|------|-------------|------------|
| `src/data/challengeExtensions.ts` | 8 NEW `ChallengeDefinition` objects (fully defined: id, title, description, category, difficulty, target, reward) | Exported, no TypeScript errors |
| `src/types/factionReputation.ts` | `FactionReputationLevel` enum (5 levels), `FactionReputation` interface, `REPUTATION_THRESHOLDS` constant | Imports cleanly into store |
| `src/store/useFactionReputationStore.ts` | Zustand store with: `reputations: Record<FactionId, number>`, `addReputation()`, `getReputationLevel()`, `isVariantUnlocked()`, persist to `arcane-machine-reputation-store` | 30 passing tests |
| `src/utils/factionReputationUtils.ts` | `getReputationLevel(rep)`, `getNextLevelThreshold(rep)`, `getProgressToNextLevel(rep)`, `getUnlockedVariants(faction, level)` | Pure functions, 15 passing tests |
| `src/components/Factions/FactionReputationPanel.tsx` | Displays per-faction reputation bar, level icon, progress to next level | Renders 4 faction panels |
| `src/components/Challenges/EnhancedChallengeCard.tsx` | Card with: title, description, difficulty badge (colored), `role="progressbar"` element, reward preview, category icon | `role="progressbar"` rendered |
| `src/components/Challenges/ChallengeTimer.tsx` | Countdown timer with play/pause/resume controls, displays MM:SS | Pause freezes count |
| `src/components/Modules/FactionVariants.tsx` | Renders 4 faction variant modules when Grandmaster achieved | Variants shown at Grandmaster |
| `src/__tests__/factionReputation.test.ts` | 30 tests: reputation accumulation, level transitions, variant unlock, achievement integration, persistence | 30 passing |
| `src/__tests__/challengeExtensions.test.ts` | 25 tests: all 8 new challenges defined, IDs unique, categories correct, 16-challenge total verified | 25 passing |
| `src/__tests__/factionVariants.test.ts` | 10 tests: variant modules render, unlock at correct level, no conflicts with base modules | 10 passing |

### Files to modify:
| File | Modification | Acceptance |
|------|-------------|------------|
| `src/data/challenges.ts` | Replace 8 existing `CHALLENGE_DEFINITIONS` with the full 16-challenge list per the category distribution below | `CHALLENGE_DEFINITIONS.length === 16` |
| `src/__tests__/challengeSystem.test.ts` | Update "exactly 8 challenges" test → "exactly 16 challenges"; update category distribution expectations | All existing tests pass + new assertions |
| `src/types/index.ts` | Add `ModuleType` variants: `'void-arcane-gear'`, `'inferno-blazing-core'`, `'storm-thundering-pipe'`, `'stellar-harmonic-crystal'`; extend `MODULE_SIZES`, `MODULE_PORT_CONFIGS`, `MODULE_ACCENT_COLORS` | No TS errors |
| `src/types/factions.ts` | Import and re-export `FactionReputationLevel`, `FactionReputation` from `src/types/factionReputation.ts` | Clean import |
| `src/store/useFactionStore.ts` | NO CHANGES. Reputation is a separate store. Faction counts remain for tech tree. | — |
| `src/store/useAchievementStore.ts` | On achievement completion that has `faction !== undefined`, call `useFactionReputationStore.getState().addReputation(faction, 10)` | Achievement completion → rep +10 |
| `src/components/Challenges/ChallengeBrowser.tsx` | Integrate `EnhancedChallengeCard` components; pass `current/target` progress data | Cards render with progress bars |
| `src/components/Factions/FactionPanel.tsx` | Add `FactionReputationPanel` as a tab or section | Reputation visible in panel |
| `src/components/Editor/ModulePanel.tsx` | Conditionally show 4 faction variants when Grandmaster rank achieved | Variants appear at Grandmaster |
| `src/App.tsx` | No changes required — reputation persistence is self-contained in Zustand persist middleware | — |

---

## Challenge Definitions — Full List (16 challenges)

All 16 challenges replace the current 8 in `src/data/challenges.ts`. Fully defined below:

| ID | Title | Category | Difficulty | Target | Reward |
|----|-------|----------|------------|--------|--------|
| `first-machine` | 初代锻造 | creation | beginner | 1 | XP +100 |
| `codex-entry` | 图鉴收藏家 | collection | beginner | 3 | XP +50 |
| `arcane-artist` | 奥术艺术家 | creation | beginner | 3 | XP +75 |
| `connection-king` | 连接之王 | mastery | beginner | 5 | XP +75 |
| `golden-gear` | 黄金齿轮 | creation | intermediate | 5 | Badge: golden-gear |
| `stability-master` | 稳定大师 | mastery | intermediate | 95 | Recipe: resonance-chamber |
| `rare-collector` | 稀有收藏家 | collection | intermediate | 3 | XP +150 |
| `void-initiate` | 虚空入门 | creation | intermediate | 1 | XP +200 |
| `overload-specialist` | 过载专家 | activation | intermediate | 1 | Recipe: lightning-conductor |
| `efficiency-expert` | 效率专家 | mastery | intermediate | 90 | XP +200 |
| `inferno-master` | 熔岩大师 | activation | advanced | 1 | Recipe: fire-crystal |
| `stellar-harmony` | 星辉和谐 | collection | advanced | 3 | XP +300 |
| `legendary-forge` | 传说锻造师 | creation | advanced | 10 | Badge: legendary-forge |
| `activation-king` | 激活之王 | activation | advanced | 50 | XP +500 |
| `speed-demon` | 速度恶魔 | activation | advanced | 1 | XP +400 |
| `master-architect` | 大师建筑师 | mastery | advanced | 8 | Badge: master-architect |

**Category distribution:** Creation(4) + Collection(3) + Activation(4) + Mastery(5) = 16 ✓

**Difficulty distribution:** Beginner(4) + Intermediate(5) + Advanced(6) + Master(1) — note: `master-architect` uses 'advanced' difficulty tier (do not add 'master' difficulty; use 'advanced').

---

## Faction Reputation System Design

### Reputation Levels (5 tiers)
```
Apprentice:       0 - 199    (Level 1)
Journeyman:     200 - 499    (Level 2)
Expert:         500 - 999    (Level 3)
Master:       1000 - 1999    (Level 4)
Grandmaster:   2000+         (Level 5)
```

### Achievement-Reputation Integration
- When `useAchievementStore` emits an achievement with `faction !== undefined`, add +10 reputation to that faction.
- This is a one-way link: achievements contribute to reputation, but reputation does not affect achievement conditions.
- The integration point is in `src/store/useAchievementStore.ts` where achievement completions are handled.

### Faction Variants Unlock Condition
- At `Grandmaster` (Level 5, 2000+ reputation): the corresponding faction variant module becomes available in `ModulePanel`.
- Each faction gets exactly one variant:
  - Void → `void-arcane-gear`
  - Inferno → `inferno-blazing-core`
  - Storm → `storm-thundering-pipe`
  - Stellar → `stellar-harmonic-crystal`

---

## Acceptance Criteria

| ID | Criterion | Definition | Pass Condition |
|----|-----------|------------|----------------|
| AC1 | 16 total challenges | `src/data/challenges.ts` exports `CHALLENGE_DEFINITIONS` with 16 entries | `CHALLENGE_DEFINITIONS.length === 16` |
| AC2 | 5 reputation levels per faction | `getReputationLevel(rep)` returns 5 distinct level names | Call with 0/200/500/1000/2000 → returns distinct levels |
| AC3 | 4 faction variants unlockable | At Grandmaster rank, variants appear in ModulePanel | Mock Grandmaster → variant modules added to panel |
| AC4 | Timer functional with pause | `ChallengeTimer` counts down from set value; pause freezes | Mount with limit=60 → counts to 0; pause → frozen |
| AC5 | Progress bars on cards | `EnhancedChallengeCard` renders `role="progressbar"` | `container.querySelector('[role="progressbar"]')` not null |
| AC6 | Achievement → +10 rep | Completing faction achievement calls `addReputation(faction, 10)` | Unit test verifies store call |
| AC7 | Build succeeds | `npm run build` exits 0 | 0 TypeScript errors |
| AC8 | Test count ≥ baseline+55 | Full test suite passes with new tests | `npm test` shows `baseline + 55` tests passing |

> **Note on AC8:** Before contract execution, run `npm test` and record the exact passing count. Replace the "baseline" value in AC8 with the actual number. The contract requires `baseline + 55` new tests (30 reputation + 25 challenges + 10 variants).

---

## Test Methods

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | `import { CHALLENGE_DEFINITIONS } from 'src/data/challenges'`; check `.length` | Returns `16` |
| 2 | Call `getReputationLevel()` with 0, 200, 500, 1000, 2000 | Returns Apprentice, Journeyman, Expert, Master, Grandmaster |
| 3 | Mock faction reaching Grandmaster (2000 rep) | `isVariantUnlocked(faction, 'grandmaster')` → true |
| 4 | Mount `ChallengeTimer` with `{limit: 60}` | Counts down to 0; pause button freezes |
| 5 | Render `EnhancedChallengeCard` | `container.querySelector('[role="progressbar"]')` exists |
| 6 | Mock achievement completion with `faction: 'void'` | `useFactionReputationStore.getState().reputations.void` increased by 10 |
| 7 | Run `npm run build` | Exit code 0, 0 TypeScript errors |
| 8 | Run `npm test` | Test count = (actual baseline) + 55 |

---

## Failure Conditions

**The round fails if ANY of:**
1. `CHALLENGE_DEFINITIONS.length !== 16`
2. Fewer than 5 reputation levels defined per faction
3. Faction variants not appearing in ModulePanel when Grandmaster achieved
4. ChallengeTimer does not pause/resume correctly
5. EnhancedChallengeCard missing `role="progressbar"` element
6. Achievement completion with faction does not trigger `addReputation()`
7. `npm run build` produces any TypeScript errors
8. `npm test` shows fewer than `(actual baseline) + 55` tests

---

## Done Definition

All conditions must be true before claiming complete:

| # | Condition | Verification |
|---|-----------|--------------|
| 1 | `CHALLENGE_DEFINITIONS.length === 16`; categories: Creation(4), Collection(3), Activation(4), Mastery(5) | Count categories programmatically |
| 2 | FactionReputationPanel renders 4 faction panels with level indicators and progress bars | Component test |
| 3 | 4 faction variant modules available in ModulePanel at Grandmaster rank | Mock Grandmaster in store → panel includes variants |
| 4 | ChallengeTimer counts down and pauses/resumes | Mount with limit=60; pause freezes decrement |
| 5 | Enhanced Challenge Cards show: title, description, difficulty badge, progress bar, reward preview, category icon | Component snapshot test or prop inspection |
| 6 | Achievement with faction → reputation +10 | Store unit test |
| 7 | `npm run build` exit code 0 | CI verification |
| 8 | Test count = (actual baseline) + 55 | `npm test` count |

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Test baseline mismatch | Wrong target test count causes AC8 to fail | Run `npm test` before starting and update contract |
| Duplicate challenge systems | Code references wrong challenge array | Deprecate `CHALLENGES` from `src/types/challenges.ts` first |
| Module type conflicts | New variant module IDs clash with existing | Use namespaced IDs with faction prefix |
| Timer performance | 60fps React re-renders cause jank | `requestAnimationFrame` with 100ms visual throttle, 1s storage sync |

---

## Out of Scope

Explicitly NOT done this round:
- Social sharing features
- Codex trading
- AI backstory generator
- Multiplayer challenges
- Seasonal challenge events
- Faction wars/contests
- Custom challenge builder
- Leaderboard system
- Real-time collaboration
- Adding 'master' difficulty tier (use 'advanced' instead)

---

## Contract Metadata
- **Contract Version:** 18.1 (revised)
- **Pre-round cleanup required:** Yes (3 tasks before new work)
- **Required Test Count:** `(actual baseline) + 55` new tests
- **Build Target:** 0 TypeScript errors
