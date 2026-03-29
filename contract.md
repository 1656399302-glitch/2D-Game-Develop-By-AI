# Sprint Contract — Round 6

## Scope

**Primary Focus:** Remediation and Feature Completion

This round addresses gaps identified in the codebase survey:

1. **Missing Recipe Definitions** — Three newer modules (Resonance Chamber, Fire Crystal, Lightning Conductor) lack recipe definitions in `RECIPE_DEFINITIONS`
2. **Auto-Layout UI Integration** — The `autoLayout.ts` utility exists but has no UI button to trigger it
3. **Minor Polish** — Ensure recipe unlock tracking properly handles all module types

## Spec Traceability

### P0 Items (Must Complete)
- **Missing Recipes** — Add recipe definitions for Resonance Chamber, Fire Crystal, and Lightning Conductor with appropriate unlock conditions and rarity tiers
- **Auto-Layout Button** — Add layout control button to Toolbar with grid/line/circle/cascade options

### P1 Items (Should Complete)
- **Recipe Unlock Consistency** — Verify all 14 module types have recipe entries
- **Toolbar UX** — Ensure auto-layout options are discoverable

### P2 Items (Intentionally Deferred)
- AI naming/description generation (spec mentions as future)
- Community sharing features (spec mentions as future)
- Codex trading/exchange (spec mentions as future)

## Deliverables

### 1. New File: `src/data/recipes.ts`
Contains `RECIPE_DEFINITIONS` array with 14 recipes (11 existing + 3 new):

| Recipe ID | Module Type | Rarity | Unlock Condition |
|-----------|-------------|--------|-------------------|
| recipe-resonance-chamber | resonance-chamber | uncommon | Create 3 machines |
| recipe-fire-crystal | fire-crystal | uncommon | Activate machines 10 times |
| recipe-lightning-conductor | lightning-conductor | uncommon | Complete 3 challenges |

### 2. Modified File: `src/components/Editor/Toolbar.tsx`
Add auto-layout controls:
- Button labeled "自动布局" (Auto Layout) with accessible aria-label
- Dropdown or segmented control with 4 layout options: grid (网格), line (线性), circle (环形), cascade (层叠)
- Each option calls `autoArrange()` from `autoLayout.ts` with selected layout type
- Keyboard navigable (Tab, Enter, Arrow keys)

### 3. Modified File: `src/types/recipes.ts`
Update `RECIPE_DEFINITIONS` import path from inline definition to point to new `src/data/recipes.ts`

### 4. New File: `src/__tests__/recipes.test.ts`
Unit tests for recipe definitions (see Test Methods below)

### 5. New File: `src/__tests__/autoLayout.test.ts`
Integration tests for auto-layout UI (see Test Methods below)

## Acceptance Criteria

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| AC1 | `RECIPE_DEFINITIONS` contains exactly 14 entries | `expect(RECIPE_DEFINITIONS.length).toBe(14)` |
| AC2 | Recipes include resonance-chamber, fire-crystal, lightning-conductor | `expect(RECIPE_DEFINITIONS.some(r => r.moduleType === 'resonance-chamber'))` for each |
| AC3 | Each new recipe has valid unlockCondition with type, value, and description fields | TypeScript compile + `forEach` test loop |
| AC4 | Toolbar renders button with accessible label containing "布局" | `screen.getByRole('button', { name: /布局/i })` |
| AC5 | Clicking auto-layout button triggers rearrangement | Functional test with seeded modules |
| AC6 | All existing tests continue to pass | `npm test` exit code 0 |
| AC7 | Build succeeds with 0 TypeScript errors | `npm run build` exit code 0 |

## Test Methods

### 1. Recipe Definition Tests (`src/__tests__/recipes.test.ts`)

```typescript
import { RECIPE_DEFINITIONS } from '../../data/recipes';

describe('Recipe Definitions', () => {
  test('should have 14 recipe definitions', () => {
    expect(RECIPE_DEFINITIONS.length).toBe(14);
  });
  
  test('should include resonance-chamber recipe', () => {
    const recipe = RECIPE_DEFINITIONS.find(r => r.moduleType === 'resonance-chamber');
    expect(recipe).toBeDefined();
    expect(recipe?.rarity).toBe('uncommon');
    expect(recipe?.unlockCondition.type).toBeDefined();
    expect(recipe?.unlockCondition.value).toBeDefined();
    expect(recipe?.unlockCondition.description).toBeTruthy();
  });
  
  test('should include fire-crystal recipe', () => {
    const recipe = RECIPE_DEFINITIONS.find(r => r.moduleType === 'fire-crystal');
    expect(recipe).toBeDefined();
    expect(recipe?.rarity).toBe('uncommon');
  });
  
  test('should include lightning-conductor recipe', () => {
    const recipe = RECIPE_DEFINITIONS.find(r => r.moduleType === 'lightning-conductor');
    expect(recipe).toBeDefined();
    expect(recipe?.rarity).toBe('uncommon');
  });
  
  test('all 14 recipes should have valid unlock conditions', () => {
    RECIPE_DEFINITIONS.forEach(recipe => {
      expect(recipe.unlockCondition.type).toBeDefined();
      expect(recipe.unlockCondition.value).toBeDefined();
      expect(recipe.unlockCondition.description).toBeTruthy();
    });
  });

  test('all recipes should have required fields', () => {
    RECIPE_DEFINITIONS.forEach(recipe => {
      expect(recipe.id).toBeDefined();
      expect(recipe.moduleType).toBeDefined();
      expect(recipe.rarity).toBeDefined();
    });
  });
});
```

### 2. Auto-Layout Integration Tests (`src/__tests__/autoLayout.test.ts`)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from '../../components/Editor/Toolbar';

describe('Auto-Layout UI Integration', () => {
  test('Toolbar should render auto-layout button with accessible label', () => {
    render(<Toolbar />);
    expect(screen.getByRole('button', { name: /布局/i })).toBeInTheDocument();
  });
  
  test('Auto-layout dropdown should show 4 layout options', () => {
    render(<Toolbar />);
    const button = screen.getByRole('button', { name: /布局/i });
    fireEvent.click(button);
    expect(screen.getByText('网格')).toBeInTheDocument();
    expect(screen.getByText('线性')).toBeInTheDocument();
    expect(screen.getByText('环形')).toBeInTheDocument();
    expect(screen.getByText('层叠')).toBeInTheDocument();
  });
});
```

### 3. Existing Test Regression

```bash
npm test  # Must show all tests passing (baseline: 449 from Round 5 QA)
npm run build  # Must succeed with 0 errors
```

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing recipe unlock logic | Low | High | Test all unlock paths, verify localStorage persistence |
| Auto-layout causing connection path issues | Medium | Low | Connections use module IDs, not positions; autoArrange preserves connections |
| TypeScript compilation errors from recipe refactor | Low | Medium | Ensure RECIPE_DEFINITIONS export path updated consistently |
| Import path mismatch between old and new locations | Medium | High | Verify all consumers import from `src/data/recipes.ts` |

## Failure Conditions

This sprint **must fail** if:

1. **Test failure** — Any new or existing test fails (`npm test` exit code ≠ 0)
2. **Build failure** — `npm run build` exits with non-zero status or TypeScript errors
3. **Missing recipes** — Any of the 3 new module types lack recipe definitions
4. **Broken imports** — Runtime errors due to import path changes for RECIPE_DEFINITIONS
5. **Fewer than 14 recipes** — RECIPE_DEFINITIONS.length !== 14

## Done Definition

The round is complete when **all** of the following are true:

1. ✅ `src/data/recipes.ts` created with exactly 14 recipe definitions
2. ✅ All 3 new recipes (resonance-chamber, fire-crystal, lightning-conductor) have valid unlock conditions
3. ✅ `src/types/recipes.ts` (or any file importing RECIPE_DEFINITIONS) updated to use new import path
4. ✅ Toolbar includes "布局" button with dropdown showing 4 layout options
5. ✅ `npm test` passes with all tests (baseline: 449, plus new tests)
6. ✅ `npm run build` succeeds with 0 TypeScript errors
7. ✅ No runtime errors when accessing Recipe Browser or Toolbar components

## Out of Scope

The following features from `spec.md` are **not** in scope for this round:

- AI naming/description generation
- Community sharing / social features
- Codex trading or exchange system
- Challenge mode creation UI
- Faction tech tree beyond existing implementation
- New module types beyond the 3 with missing recipes
- Animation polish beyond bug fixes
- Performance optimizations not directly related to new features
- Auto-layout for connection lines (only module positions are rearranged)

---

**Contract prepared for Round 6 — Arcane Machine Codex Workshop**
