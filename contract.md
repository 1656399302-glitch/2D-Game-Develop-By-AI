APPROVED

---

# Sprint Contract — Round 6

## Scope

**Primary Focus:** Challenge Mode System

This round implements a complete Challenge Mode system that allows users to complete themed tasks to earn rewards, track progress, and unlock additional content. This integrates with the existing recipe unlock system and provides clear progression goals.

## Spec Traceability

### P0 Items (Must Complete)
- **Challenge Definitions** — Create a centralized challenge data structure with 8+ challenges across 3 difficulty tiers (beginner, intermediate, advanced)
- **Challenge Store** — Zustand store to track challenge completion state, progress, and rewards
- **Challenge UI Panel** — Accessible panel showing available challenges, status, and rewards
- **Progress Tracking** — Track challenge completion counts for recipe unlock system integration

### P1 Items (Should Complete)
- **Challenge Rewards** — Implement reward distribution (new recipes, badges, achievements)
- **Challenge Categories** — Organize challenges by type (creation, collection, activation, mastery)

### P2 Items (Intentionally Deferred)
- AI naming/description generation
- Community sharing features
- Codex trading/exchange system
- Faction tech tree beyond basic implementation

## Deliverables

### 1. New File: `src/data/challenges.ts`
Contains `CHALLENGE_DEFINITIONS` array with 8 challenges:

| Challenge ID | Title | Description | Category | Difficulty | Reward |
|--------------|-------|-------------|----------|------------|--------|
| first-machine | 初代锻造 | Create your first machine | creation | beginner | +100 XP |
| energy-master | 能量大师 | Connect 5 energy paths | mastery | beginner | Fire Crystal recipe |
| codex-entry | 图鉴收藏家 | Save 3 machines to the codex | collection | beginner | +50 XP |
| golden-gear | 黄金齿轮 | Create a machine with 5+ gears | creation | intermediate | Golden Gear badge |
| overload-specialist | 过载专家 | Trigger an overload effect | activation | intermediate | Lightning Conductor recipe |
| stability-master | 稳定大师 | Create a machine with 95%+ stability | mastery | intermediate | Resonance Chamber recipe |
| legendary-forge | 传说锻造师 | Create 10 machines | creation | advanced | Legendary Forge badge |
| activation-king | 激活之王 | Activate machines 50 times | activation | advanced | +500 XP |

### 2. New File: `src/store/useChallengeStore.ts`
Zustand store for challenge state management:
- `challengeProgress`: Record of challenge completion states
- `completedChallenges`: Set of completed challenge IDs
- `totalXP`: Player experience points
- `badges`: Array of earned badges
- `checkChallengeCompletion(type, value)`: Check if a challenge condition is met
- `claimReward(challengeId)`: Claim challenge reward
- `getChallengesByCategory(category)`: Filter challenges by category
- `getChallengesByDifficulty(difficulty)`: Filter challenges by difficulty
- `resetChallenges()`: Reset all progress (for testing)

### 3. Modified File: `src/components/Challenge/ChallengePanel.tsx`
New component for challenge UI:
- Tab in main navigation or accessible modal
- Challenge list with progress indicators
- Difficulty badges (beginner/intermediate/advanced)
- Reward previews
- Progress bars for numeric goals
- Claim reward button (disabled until complete)
- XP and badge display

### 4. Modified File: `src/components/Challenge/ChallengeProgress.tsx`
Visual component showing overall challenge progress:
- Total challenges completed / total
- XP progress bar
- Badge showcase
- Category breakdown

### 5. New File: `src/hooks/useChallengeTracker.ts`
React hook for tracking challenge-relevant events:
- `trackMachineCreated()` — Call after machine save
- `trackActivation()` — Call after machine activation
- `trackConnectionCreated()` — Call after energy path creation
- `trackOverloadTriggered()` — Call on overload
- `trackStabilityAchieved(value)` — Call with stability percentage

Implementation note: This hook should subscribe to relevant store actions or dispatch events that the useChallengeStore listens to, not maintain separate state.

### 6. New File: `src/__tests__/challengeSystem.test.ts`
Unit tests for challenge definitions and store

### 7. Modified File: `src/store/useRecipeStore.ts`
Integration point for challenge rewards:
- `checkChallengeCountUnlock()` already exists, verify it works with new challenges

## Acceptance Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC1 | `CHALLENGE_DEFINITIONS` contains exactly 8 entries | `expect(CHALLENGE_DEFINITIONS.length).toBe(8)` |
| AC2 | Challenges cover all 3 difficulty tiers | Each difficulty has at least 2 challenges |
| AC3 | Challenges cover all 4 categories | creation, collection, activation, mastery |
| AC4 | `useChallengeStore` has `checkChallengeCompletion` and `claimReward` methods | TypeScript interface check |
| AC5 | ChallengePanel renders with accessible list structure | `getByRole('list')` in test |
| AC6 | All existing tests continue to pass (704+) | `npm test` exit code 0 |
| AC7 | Build succeeds with 0 TypeScript errors | `npm run build` exit code 0 |

## Test Methods

### 1. Challenge Definitions Tests (`src/__tests__/challengeSystem.test.ts`)

```typescript
import { CHALLENGE_DEFINITIONS } from '../../data/challenges';

describe('Challenge Definitions', () => {
  test('should have exactly 8 challenges', () => {
    expect(CHALLENGE_DEFINITIONS.length).toBe(8);
  });

  test('should have challenges in all difficulty tiers', () => {
    const difficulties = CHALLENGE_DEFINITIONS.map(c => c.difficulty);
    expect(difficulties).toContain('beginner');
    expect(difficulties).toContain('intermediate');
    expect(difficulties).toContain('advanced');
    expect(new Set(difficulties).size).toBe(3);
  });

  test('should have challenges in all categories', () => {
    const categories = CHALLENGE_DEFINITIONS.map(c => c.category);
    expect(categories).toContain('creation');
    expect(categories).toContain('collection');
    expect(categories).toContain('activation');
    expect(categories).toContain('mastery');
    expect(new Set(categories).size).toBe(4);
  });

  test('each challenge should have valid reward', () => {
    CHALLENGE_DEFINITIONS.forEach(challenge => {
      expect(challenge.reward).toBeDefined();
      expect(challenge.reward.type).toMatch(/^(xp|recipe|badge)$/);
      if (challenge.reward.type === 'recipe') {
        expect(challenge.reward.value).toBeDefined();
      }
      if (challenge.reward.type === 'badge') {
        expect(challenge.reward.value).toBeDefined();
      }
    });
  });

  test('each challenge should have required fields', () => {
    CHALLENGE_DEFINITIONS.forEach(challenge => {
      expect(challenge.id).toBeDefined();
      expect(challenge.title).toBeTruthy();
      expect(challenge.description).toBeTruthy();
      expect(challenge.category).toBeDefined();
      expect(challenge.difficulty).toBeDefined();
      expect(challenge.target).toBeDefined();
      expect(challenge.reward).toBeDefined();
    });
  });
});
```

### 2. Challenge Store Tests

```typescript
import { useChallengeStore } from '../../store/useChallengeStore';

describe('useChallengeStore', () => {
  beforeEach(() => {
    useChallengeStore.getState().resetChallenges();
  });

  test('should initialize with empty completedChallenges', () => {
    expect(useChallengeStore.getState().completedChallenges.size).toBe(0);
  });

  test('checkChallengeCompletion should return false for incomplete challenges', () => {
    const result = useChallengeStore.getState().checkChallengeCompletion('first-machine', 0);
    expect(result).toBe(false);
  });

  test('checkChallengeCompletion should return true when target met', () => {
    const result = useChallengeStore.getState().checkChallengeCompletion('first-machine', 1);
    expect(result).toBe(true);
  });

  test('claimReward should add challenge to completedChallenges', () => {
    const store = useChallengeStore.getState();
    store.claimReward('first-machine');
    expect(store.completedChallenges.has('first-machine')).toBe(true);
  });

  test('claiming XP reward should increment totalXP by correct amount', () => {
    const store = useChallengeStore.getState();
    const initialXP = store.totalXP;
    store.claimReward('first-machine'); // 100 XP reward
    expect(store.totalXP).toBe(initialXP + 100);
  });

  test('claiming recipe reward should trigger recipe unlock check', () => {
    const store = useChallengeStore.getState();
    const recipeStore = require('../../store/useRecipeStore').useRecipeStore;
    const initialUnlocked = recipeStore.getState().unlockedRecipes.length;
    store.claimReward('energy-master'); // Fire Crystal recipe reward
    // Verify recipe unlock mechanism was triggered
    expect(recipeStore.getState().unlockedRecipes.length).toBeGreaterThanOrEqual(initialUnlocked);
  });

  test('claiming badge reward should add badge to badges array', () => {
    const store = useChallengeStore.getState();
    store.claimReward('golden-gear'); // Golden Gear badge
    const badges = store.badges;
    expect(badges.some(b => b.id === 'golden-gear' || b.name === 'Golden Gear')).toBe(true);
  });
});
```

### 3. ChallengeTracker Hook Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useChallengeTracker } from '../../hooks/useChallengeTracker';
import { useChallengeStore } from '../../store/useChallengeStore';

describe('useChallengeTracker', () => {
  beforeEach(() => {
    useChallengeStore.getState().resetChallenges();
  });

  test('trackMachineCreated should increment machine creation count', () => {
    const { result } = renderHook(() => useChallengeTracker());
    act(() => {
      result.current.trackMachineCreated();
    });
    // Verify challenge progress was updated
    const progress = useChallengeStore.getState().challengeProgress;
    expect(progress.machinesCreated).toBe(1);
  });

  test('trackActivation should increment activation count', () => {
    const { result } = renderHook(() => useChallengeTracker());
    act(() => {
      result.current.trackActivation();
    });
    const progress = useChallengeStore.getState().challengeProgress;
    expect(progress.activationCount).toBe(1);
  });

  test('trackConnectionCreated should increment connection count', () => {
    const { result } = renderHook(() => useChallengeTracker());
    act(() => {
      result.current.trackConnectionCreated();
    });
    const progress = useChallengeStore.getState().challengeProgress;
    expect(progress.connectionsCreated).toBe(1);
  });
});
```

### 4. Existing Test Regression

```bash
npm test  # Must show all tests passing (baseline: 704 from Round 5 QA)
npm run build  # Must succeed with 0 errors
```

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Challenge tracking not integrated with existing systems | Medium | High | Create `useChallengeTracker` hook that wraps existing store actions |
| XP/badges storage conflicts with existing localStorage | Low | Medium | Use separate keys or namespace prefix |
| Performance impact from challenge checks on every action | Low | Low | Debounce checks, only run on relevant events |
| TypeScript errors from new store integration | Medium | Medium | Follow existing store patterns in `useRecipeStore` |

## Failure Conditions

This sprint **must fail** if:

1. **Test failure** — Any new or existing test fails (`npm test` exit code ≠ 0)
2. **Build failure** — `npm run build` exits with non-zero status or TypeScript errors
3. **Fewer than 8 challenges** — CHALLENGE_DEFINITIONS.length !== 8
4. **Missing categories** — Not all 4 categories (creation, collection, activation, mastery) represented
5. **Missing difficulties** — Not all 3 difficulty tiers represented
6. **Store methods missing** — `checkChallengeCompletion` or `claimReward` not implemented

## Done Definition

The round is complete when **all** of the following are true:

1. ✅ `src/data/challenges.ts` created with exactly 8 challenge definitions
2. ✅ All 4 categories (creation, collection, activation, mastery) represented
3. ✅ All 3 difficulty tiers (beginner, intermediate, advanced) represented
4. ✅ `useChallengeStore` implements `checkChallengeCompletion` and `claimReward`
5. ✅ `ChallengePanel` component renders accessible challenge list
6. ✅ `useChallengeTracker` hook provides tracking methods
7. ✅ `npm test` passes with all tests (baseline: 704, plus new tests)
8. ✅ `npm run build` succeeds with 0 TypeScript errors
9. ✅ No runtime errors when accessing Challenge components

## Out of Scope

The following features from `spec.md` are **not** in scope for this round:

- AI naming/description generation
- Community sharing / social features
- Codex trading or exchange system
- Faction technology trees
- New module types beyond existing 14
- Animation polish beyond bug fixes
- Performance optimizations not directly related to new features
- Challenge leaderboard or rankings
- Timed/limited challenges

---

**Contract prepared for Round 6 — Arcane Machine Codex Workshop**
