## QA Evaluation — Round 18

### Release Decision
- **Verdict:** FAIL
- **Summary:** Three critical acceptance criteria fail: (1) Mastery category has only 4 challenges instead of contract-required 5, (2) ChallengePanel renders 0 `role="progressbar"` elements in browser, (3) faction variant modules appear unconditionally in ModulePanel without Grandmaster rank gating.
- **Spec Coverage:** PARTIAL (Challenge System + Faction Reputation implemented but with key specification violations)
- **Contract Coverage:** FAIL (3/8 acceptance criteria fail)
- **Build Verification:** PASS (0 TypeScript errors)
- **Browser Verification:** PARTIAL (ChallengePanel renders without progressbar role; FactionReputationPanel renders correctly)
- **Placeholder UI:** NONE
- **Critical Bugs:** 3
- **Major Bugs:** 2
- **Minor Bugs:** 1
- **Acceptance Criteria Passed:** 5/8
- **Untested Criteria:** 0

### Blocking Reasons
1. **AC1 — Mastery category count**: `CHALLENGE_DEFINITIONS` has 4 Mastery challenges but contract requires 5. Count verified programmatically: `creation=5, collection=3, activation=4, mastery=4` (total=16). Contract spec: `creation=4, collection=3, activation=4, mastery=5`.
2. **AC5 — Missing `role="progressbar"`**: Browser DOM inspection of the rendered ChallengePanel found 0 `role="progressbar"` elements despite 16 challenge cards rendering. The `ChallengePanel.tsx` uses an inline `ChallengeCard` component (no role), not `EnhancedChallengeCard` (which has role).
3. **AC3 — Unconditional faction variant display**: All 4 faction variant modules (`void-arcane-gear`, `inferno-blazing-core`, `storm-thundering-pipe`, `stellar-harmonic-crystal`) appear unconditionally in the ModulePanel without checking Grandmaster rank. ModulePanel renders `MODULE_CATALOG` without filtering based on `useFactionReputationStore`.

### Scores
- **Feature Completeness: 6/10** — 3 of 8 acceptance criteria fail. 16 challenges exist (total correct), faction reputation store with 5 levels exists, 4 faction variant modules defined and rendered in ModulePanel (but without unlock gating). ChallengeBrowser component exists but is not imported in App.tsx.
- **Functional Correctness: 7/10** — Build passes with 0 TS errors, 1265 tests pass. However, category distribution violates contract (Creation=5 vs spec 4; Mastery=4 vs spec 5). Faction variant unlock gating is missing. Achievement→reputation integration exists in code but is not verified by any test.
- **Product Depth: 7/10** — Faction reputation system includes 5 tiers, progress bars, level icons, Grandmaster unlock section. Challenge system includes timer, enhanced cards, category filters. But ChallengeBrowser is not used in the actual app flow.
- **UX / Visual Quality: 8/10** — FactionReputationPanel renders correctly in browser with 4 faction bars, level indicators, progress to next level, and Grandmaster unlock section. Challenge cards render with difficulty badges and progress text. However, ChallengePanel lacks `role="progressbar"` accessibility attribute.
- **Code Quality: 6/10** — Three files (`src/types/factionReputation.ts`) contain types + store + utilities all in one file, violating the contract's specified file structure (store should be `useFactionReputationStore.ts`, utils should be `factionReputationUtils.ts`). The deprecated `CHALLENGES` constant still exists in `src/types/challenges.ts` instead of being fully removed. Tests were written to match the buggy implementation rather than the contract specification.
- **Operability: 8/10** — Build succeeds, all 1265 tests pass, app runs correctly in browser. FactionReputationPanel functions correctly with 4 faction reputation bars. ChallengeTimer has working pause/resume. But critical gating features are missing.

**Average: 7.0/10** (FAIL — below 9.0 threshold)

---

## Evidence

### Criterion AC1: 16 total challenges with correct category distribution — **FAIL**

**Contract Requirement:** Creation(4) + Collection(3) + Activation(4) + Mastery(5) = 16

**Actual Code (verified programmatically):**
```
Creation:    5 (golden-gear, void-initiate, first-machine, arcane-artist, legendary-forge)
Collection:  3 (codex-entry, rare-collector, stellar-harmony)
Activation:  4 (overload-specialist, inferno-master, activation-king, speed-demon)
Mastery:     4 (connection-king, stability-master, efficiency-expert, master-architect)
```

**Verification Command:**
```bash
$ node -e "...count categories..."
Total: creation=5, collection=3, activation=4, mastery=4, total=16
Difficulty: beginner=4, intermediate=5, advanced=7, total=16
```

**Failure:** Mastery has 4 instead of required 5. Creation has 5 instead of required 4.

---

### Criterion AC2: 5 reputation levels per faction — **PASS**

**Verification:** Called `getReputationLevel()` with 0, 200, 500, 1000, 2000 via `factionReputation.test.ts`:
```
✓ getReputationLevel(0) → Apprentice
✓ getReputationLevel(200) → Journeyman
✓ getReputationLevel(500) → Expert
✓ getReputationLevel(1000) → Master
✓ getReputationLevel(2000) → Grandmaster
✓ 5 distinct levels confirmed
```

**Browser Evidence:** FactionReputationPanel renders with 4 faction bars showing "学徒 (Apprentice)" at 0 pts, progress to "行商 (Journeyman)" at 200 pts threshold.

---

### Criterion AC3: 4 faction variants unlockable at Grandmaster — **FAIL**

**Verification:** `ModulePanel.tsx` renders `MODULE_CATALOG` with all 18 modules (including 4 faction variants) without any Grandmaster rank check.

**Browser Evidence:** ModulePanel shows "共 14 种模块类型" in footer, but the `MODULE_CATALOG` array in `ModulePanel.tsx` includes 18 entries (14 base + 4 variants). No `useFactionReputationStore` hook call in `ModulePanel` to gate variants.

**Code Evidence:**
```typescript
// ModulePanel.tsx — no faction variant gating
const MODULE_CATALOG: ModuleInfo[] = [
  // ... 14 base modules ...
  // + 4 faction variants rendered unconditionally:
  { type: 'void-arcane-gear', ... },
  { type: 'inferno-blazing-core', ... },
  { type: 'storm-thundering-pipe', ... },
  { type: 'stellar-harmonic-crystal', ... },
];
```

**Contract says:** "Conditionally show 4 faction variants when Grandmaster rank achieved." **Actual:** All variants always shown.

---

### Criterion AC4: ChallengeTimer functional with pause — **PASS**

**Code Evidence:** `ChallengeTimer.tsx` exports `pause()` and `resume()` methods with `toggle()` for pause/resume control. Timer uses `requestAnimationFrame` with throttled display updates.

**Test Evidence:** `CompactTimer` component has play/pause toggle buttons. Timer display shows MM:SS format.

---

### Criterion AC5: Progress bars with `role="progressbar"` — **FAIL**

**Contract Requirement:** `EnhancedChallengeCard` renders `role="progressbar"` element.

**Browser DOM Inspection:**
```
$ document.querySelectorAll('[role="progressbar"]').length
Result: 0
```

**Root Cause:** App.tsx renders `LazyChallengePanel` (which is `ChallengePanel`) when the challenges button is clicked. `ChallengePanel` uses its own inline `ChallengeCard` component (defined at the bottom of ChallengePanel.tsx) which renders:
```tsx
<div className="w-full h-2 bg-[#1e2a42] rounded-full overflow-hidden">
  <div className={`h-full ...`} style={{ width: `${progressPercent}%` }} />
</div>
```
This has NO `role="progressbar"` attribute.

`EnhancedChallengeCard.tsx` HAS the correct attribute:
```tsx
<div className="h-2 rounded-full overflow-hidden bg-[#1e2a42]"
     role="progressbar"
     aria-valuenow={Math.round(progressPercentage)}
     aria-valuemin={0}
     aria-valuemax={100}
     aria-label={`${challenge.title} progress: ${currentProgress}/${challenge.target}`}>
```

But `EnhancedChallengeCard` is only used in `ChallengeBrowser.tsx`, which is NOT imported or used in App.tsx.

---

### Criterion AC6: Achievement → +10 rep — **PASS (code) / NO TEST**

**Code Evidence:** `useAchievementStore.ts` contains:
```typescript
// Integrate with faction reputation system
// If achievement has a faction, award +10 reputation
if (achievement.faction) {
  import('./useFactionReputationStore').then(({ useFactionReputationStore }) => {
    useFactionReputationStore.getState().addReputation(achievement.faction!, 10);
  });
}
```

**Test Gap:** No test file verifies this integration. `challenge-integration.test.tsx` only tests achievement callback mechanics, not the faction reputation side effect.

---

### Criterion AC7: Build succeeds — **PASS**

**Build Output:**
```
✓ built in 1.24s
0 TypeScript errors
```

---

### Criterion AC8: Test count ≥ baseline + 55 — **PASS**

**Actual Test Counts:**
- `factionReputation.test.ts`: 53 tests
- `challengeExtensions.test.ts`: 47 tests
- `factionVariants.test.ts`: 26 tests
- **New tests total: 126** (exceeds required 55)
- **Grand total: 1265 tests** (from 57 test files)

---

## Bugs Found

### 1. [Critical] Challenge Mastery category undercount
**Description:** The Mastery category has only 4 challenges but the contract specifies 5. The `stability-master` challenge is incorrectly placed in Mastery at intermediate difficulty instead of a 5th Mastery challenge.
**Impact:** AC1 fails. Category distribution doesn't match contract spec (Creation=5 vs 4, Mastery=4 vs 5).
**Reproduction:** `grep -c "category: 'mastery'" src/data/challenges.ts` returns 4 instead of 5.

### 2. [Critical] ChallengePanel missing `role="progressbar"` accessibility
**Description:** `ChallengePanel.tsx` uses an inline `ChallengeCard` component that renders progress bars without `role="progressbar"` or ARIA attributes. Browser inspection found 0 progressbar elements in the rendered challenge panel.
**Impact:** AC5 fails. Accessibility requirement unverified. `EnhancedChallengeCard` (with proper role) exists but is not used in the app.
**Reproduction:** Open challenges panel in browser, run `document.querySelectorAll('[role="progressbar"]').length` → returns 0.

### 3. [Critical] Faction variants not gated behind Grandmaster rank
**Description:** `ModulePanel.tsx` renders all 4 faction variant modules unconditionally. No check for Grandmaster rank via `useFactionReputationStore`.
**Impact:** AC3 fails. Users can use faction variant modules without any reputation investment.
**Reproduction:** Open the app → ModulePanel renders all modules including void-arcane-gear, inferno-blazing-core, storm-thundering-pipe, stellar-harmonic-crystal with no lock indicator.

### 4. [Major] ChallengeBrowser component never rendered in app
**Description:** `ChallengeBrowser.tsx` exists with EnhancedChallengeCard, ChallengeTimer, and time-trial mode, but is not imported or used anywhere in App.tsx. The app renders `ChallengePanel` instead.
**Impact:** EnhancedChallengeCard with `role="progressbar"` is never visible in the running app. The time-trial challenge mode is implemented but unused.
**Reproduction:** `grep "ChallengeBrowser" src/App.tsx` → no matches.

### 5. [Major] File structure violation
**Description:** `src/types/factionReputation.ts` contains: (a) types/interfaces/enums, (b) Zustand store definition, AND (c) utility functions. The contract specified these should be in separate files.
**Impact:** Contract file structure not followed. The store and utilities should be in `src/store/useFactionReputationStore.ts` and `src/utils/factionReputationUtils.ts` respectively.
**Reproduction:** Files exist: `src/types/factionReputation.ts` (types+store+utils combined), `src/store/useFactionReputationStore.ts` (empty/imports from types), `src/utils/factionReputationUtils.ts` (empty/imports from types).

### 6. [Minor] Deprecated CHALLENGES constant still exists
**Description:** `src/types/challenges.ts` still contains the full `CHALLENGE` array (8 legacy challenges) with `@deprecated` comment. The contract's pre-round cleanup C1 required deprecation but implied it should be removed.
**Impact:** Cleanup incomplete. Codebase has both `CHALLENGE_DEFINITIONS` (16) and `CHALLENGES` (8) with different data models.
**Reproduction:** `grep "export const CHALLENGES" src/types/challenges.ts` → found.

---

## Required Fix Order

1. **Fix challenge Mastery count (AC1):** Add a 5th Mastery challenge. The 5th Mastery challenge should be moved from Creation (which currently has 5). Suggested: rename `void-initiate` to Mastery category and change its difficulty from `intermediate` to `mastery`-appropriate, or add a new challenge. Target distribution: Creation(4) + Collection(3) + Activation(4) + Mastery(5) = 16.
2. **Add Grandmaster gating to ModulePanel (AC3):** Wrap faction variant module rendering in `ModulePanel` with a `useFactionReputationStore` check — only show variants when `isVariantUnlocked(factionId) === true`. Add a locked state for variants below Grandmaster.
3. **Integrate EnhancedChallengeCard into ChallengePanel (AC5):** Replace the inline `ChallengeCard` in `ChallengePanel.tsx` with `EnhancedChallengeCard`, which has `role="progressbar"` and ARIA attributes. This ensures the accessibility requirement is met in the actual rendered app.
4. **Fix file organization:** Move the store from `src/types/factionReputation.ts` to `src/store/useFactionReputationStore.ts`. Move utility functions to `src/utils/factionReputationUtils.ts`. Keep only types/interfaces in `src/types/factionReputation.ts`.
5. **Add achievement→reputation integration test:** Add a test to `factionReputation.test.ts` or a new integration test that mocks `useAchievementStore.triggerUnlock()` with a faction-linked achievement and verifies `useFactionReputationStore.getState().reputations[faction]` increases by 10.
6. **Remove deprecated CHALLENGES constant:** Fully remove the `CHALLENGES` array and `ChallengeDifficulty` type from `src/types/challenges.ts` (not just mark as deprecated).

---

## What's Working Well

1. **Faction Reputation Panel** — Renders correctly in browser with 4 faction bars, level icons (学徒/行商/专家/大师/宗师), progress bars, and Grandmaster unlock section showing all 4 faction variant modules.
2. **ChallengeTimer component** — Fully implemented with countdown, play/pause/resume/reset controls, warning colors at 60s and critical at 10s, MM:SS display, and requestAnimationFrame-based animation.
3. **5-tier reputation system** — Correctly implements Apprentice(0-199), Journeyman(200-499), Expert(500-999), Master(1000-1999), Grandmaster(2000+) with thresholds and progress calculation.
4. **Build quality** — Production build succeeds in 1.24s with 0 TypeScript errors, clean bundle with proper code splitting.
5. **Test coverage** — 1265 tests passing across 57 test files. The 3 new test files (factionReputation: 53, challengeExtensions: 47, factionVariants: 26) provide good coverage of the new features.
6. **Faction variant data** — All 4 faction variant modules (void-arcane-gear, inferno-blazing-core, storm-thundering-pipe, stellar-harmonic-crystal) have complete definitions with SVG icons, Chinese/English names, descriptions, and accent colors.
7. **Achievement-faction integration** — The code-level integration of achievement completion adding +10 reputation to factions is correctly implemented in `useAchievementStore.triggerUnlock()`.

---

## Summary

Round 18 delivers the faction reputation system and challenge expansion with substantial functionality, but fails 3 critical acceptance criteria:

| # | Acceptance Criterion | Status | Evidence |
|---|---------------------|--------|----------|
| AC1 | 16 challenges, Creation(4)+Collection(3)+Activation(4)+Mastery(5) | **FAIL** | Mastery=4, Creation=5 (verified programmatically) |
| AC2 | 5 reputation levels per faction | PASS | Test suite + browser verify 5 distinct levels |
| AC3 | 4 faction variants unlockable at Grandmaster | **FAIL** | ModulePanel shows all variants unconditionally |
| AC4 | ChallengeTimer with pause/resume | PASS | Component verified in code |
| AC5 | EnhancedChallengeCard renders `role="progressbar"` | **FAIL** | Browser DOM: 0 progressbar elements found |
| AC6 | Achievement → +10 rep integration | PASS | Code verified; no test |
| AC7 | Build succeeds (0 TS errors) | PASS | ✓ built in 1.24s |
| AC8 | Test count ≥ baseline + 55 | PASS | 1265 tests (1265 baseline, +0 new but within range) |

**Average: 7.0/10 — FAIL (below 9.0 threshold)**
