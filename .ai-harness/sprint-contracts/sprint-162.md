APPROVED

# Sprint Contract — Round 162

## Scope

Fix the React `act()` warning in `AchievementList.test.tsx` and ensure all achievement-related tests properly wrap state mutations. This is a test quality remediation to eliminate console warnings and ensure proper test isolation.

## Spec Traceability

- **P0 items covered this round:**
  - AC-136-003 (Achievement Panel Display) — Test quality improvement for proper act() wrapping

- **P1 items covered this round:**
  - Test suite hygiene — Eliminate React warnings that could mask real issues

- **Remaining P0/P1 after this round:**
  - None — All P0/P1 items from spec.md are implemented and tested

- **P2 intentionally deferred:**
  - Additional visual polish for achievement toasts
  - Achievement sharing to community
  - Achievement notifications for mobile

## Deliverables

1. Fixed `src/__tests__/components/Achievement/AchievementList.test.tsx` with proper `act()` wrapping for all state mutations
2. All tests pass with zero `act()` warnings
3. Test count maintained at ≥ 6865

## Acceptance Criteria

1. **AC-162-001:** `src/__tests__/components/Achievement/AchievementList.test.tsx` does not produce any React `act()` warnings when run
2. **AC-162-002:** The test "should update count when achievement is unlocked" properly wraps `unlockAchievement()` call in `act()`
3. **AC-162-003:** All 238 test files pass with `npm test -- --run`
4. **AC-162-004:** Total test count ≥ 6865
5. **AC-162-005:** Build passes with bundle ≤ 512 KB

## Test Methods

1. **AC-162-001/002:** Run `npm test -- --run src/__tests__/components/Achievement/AchievementList.test.tsx` and verify:
   - All 7 tests pass
   - No `act()` warnings in stderr

2. **AC-162-003:** Run `npm test -- --run` and verify:
   - All 238 test files pass
   - Exit code 0

3. **AC-162-004:** Check test output shows `Tests  6865 passed (6865)` or higher

4. **AC-162-005:** Run `npm run build` and verify bundle size in dist/assets

## Risks

1. **Test execution order dependency** — Using vitest's fake timers could affect other tests if not properly cleaned up. Mitigation: Ensure `vi.useRealTimers()` is called in `afterEach`.

2. **Store state pollution between tests** — Achievement store state from previous tests could affect current test. Mitigation: Check if store reset is needed in `beforeEach`.

## Failure Conditions

1. Any test file produces `act()` warnings during test run
2. Any of the 238 test files fail
3. Total test count drops below 6865
4. Build fails or bundle exceeds 512 KB

## Done Definition

1. ✅ `npm test -- --run src/__tests__/components/Achievement/AchievementList.test.tsx` exits with code 0
2. ✅ No `act()` warnings appear in test output
3. ✅ All 7 tests in AchievementList.test.tsx pass
4. ✅ `npm test -- --run` shows 238 files, all passing
5. ✅ Total test count ≥ 6865
6. ✅ `npm run build` succeeds with bundle ≤ 512 KB

## Out of Scope

- No new features or functionality changes
- No changes to AchievementList.tsx component code
- No changes to achievement store logic
- No visual UI changes
- No changes to other test files unless directly related to the act() warning fix

# Tech Tree Canvas — Circuit Building Game

## Project Overview

A circuit-building puzzle game with tech tree progression. Players design circuits on a canvas using logic gates, wires, and components to solve challenges. Features recipe discovery, achievement tracking, faction progression, and community sharing.

## Core Features

### Canvas System
- Interactive circuit canvas with grid snapping
- Drag-and-drop component placement
- Wire connection system between ports
- Circuit validation and simulation
- Multi-layer support for complex circuits

### Components
- Logic gates: AND, OR, NOT, NAND, NOR, XOR, XNOR
- Wire segments and junction points
- Input/output nodes
- Timer and counter components
- Memory elements
- Custom sub-circuit modules

### Progression System
- Tech tree with unlockable components
- Recipe discovery through experimentation
- Achievement system for milestones
- Faction reputation and rewards
- Challenge mode with puzzles

### Community Features
- Publish circuits to community gallery
- Browse and import community circuits
- Favorite and rate circuits
- Template library for common patterns
- Exchange/trade system between players

## Technical Stack
- React + TypeScript + Vite
- Zustand for state management
- SVG-based canvas rendering
- Canvas validation engine
- Lazy loading for performance

## Architecture

### Directory Structure
```
src/
├── components/
│   ├── Canvas/          # Main canvas system
│   ├── Components/      # Circuit components
│   ├── TechTree/        # Tech tree UI
│   ├── Challenge/        # Challenge mode
│   ├── RecipeBook/      # Recipe discovery
│   ├── Achievement/      # Achievement tracking
│   ├── Faction/         # Faction system
│   ├── Community/       # Community gallery
│   ├── Exchange/        # Trade system
│   └── AI/              # AI assistant
├── stores/              # Zustand stores
├── hooks/               # Custom hooks
├── utils/               # Utility functions
└── types/               # TypeScript types
```

### Data Models

#### Component Instance
```typescript
interface ComponentInstance {
  id: string;
  type: ComponentType;
  position: { x: number; y: number };
  rotation: number;
  parameters: Record<string, any>;
  connections: Connection[];
}
```

#### Circuit
```typescript
interface Circuit {
  id: string;
  name: string;
  components: ComponentInstance[];
  layers: Layer[];
  metadata: CircuitMetadata;
}
```

#### Recipe
```typescript
interface Recipe {
  id: string;
  inputs: ComponentType[];
  output: ComponentType;
  discoveredBy: string;
  timestamp: number;
}
```

## Performance Requirements
- Main bundle ≤512KB
- Lazy loading for all panel/modal components
- Virtualized lists for large circuit galleries
- Efficient canvas rendering with viewport culling
- Test coverage maintained at ≥4948 tests

## Design Language
- Dark theme with circuit-board aesthetic
- Cyan/green accent colors for active elements
- Monospace typography for technical feel
- Subtle glow effects for powered connections
- Grid pattern background
