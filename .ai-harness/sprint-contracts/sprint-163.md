APPROVED

# Sprint Contract — Round 163

## Scope

Fix `act()` warnings in `src/__tests__/recipeIntegration.test.tsx` — the 22 warnings identified in Round 162 QA feedback as out-of-scope for the previous contract.

## Spec Traceability

### P0 items covered this round
- Test quality hygiene: Fix act() warnings in recipeIntegration.test.tsx

### P1 items covered this round
- None (remediation-only sprint)

### Remaining P0/P1 after this round
- All P0/P1 items from prior rounds remain complete

### P2 intentionally deferred
- No P2 items in this sprint

## Deliverables

1. Fixed `src/__tests__/recipeIntegration.test.tsx` — all state mutations wrapped in `act()`
2. Updated test file comment documenting the Round 163 fix

## Acceptance Criteria

1. **AC-163-001:** `src/__tests__/recipeIntegration.test.tsx` runs with 0 `act()` warnings
2. **AC-163-002:** All state-mutating store calls (`unlockRecipe`, `discoverRecipe`, `checkChallengeUnlock`, `checkMachinesCreatedUnlock`, `checkActivationCountUnlock`, `checkTechLevelUnlocks`, `clearPendingDiscoveries`, `resetAllRecipes`, `markAsSeen`) are wrapped in `act()` where they trigger React state updates
3. **AC-163-003:** All 100+ tests in recipeIntegration.test.tsx continue to pass
4. **AC-163-004:** Full test suite continues to pass (`npm test -- --run` shows no failures)
5. **AC-163-005:** Build passes with bundle ≤ 512 KB

## Test Methods

1. **AC-163-001 Verification:**
   ```
   npm test -- --run src/__tests__/recipeIntegration.test.tsx 2>&1 | grep -i "act.*warning"
   ```
   Expected: No output (0 warnings)

2. **AC-163-002 Verification:**
   - Manual code review of all store method calls to ensure they're wrapped in `act()` when causing state updates
   - Pattern to verify: Any `useRecipeStore.getState().<method>()` call that modifies state should be inside `act(() => { ... })`

3. **AC-163-003 Verification:**
   ```
   npm test -- --run src/__tests__/recipeIntegration.test.tsx
   ```
   Expected: All tests pass, exit code 0

4. **AC-163-004 Verification:**
   ```
   npm test -- --run
   ```
   Expected: Test Files X passed, Tests Y passed, exit code 0

5. **AC-163-005 Verification:**
   ```
   npm run build
   ls -la dist/assets/*.js | head -5
   ```
   Expected: Build succeeds, main bundle ≤ 524,288 bytes

## Risks

1. **Over-wrapping:** Wrapping too many operations in `act()` can cause false negatives. Only wrap state mutations, not read-only operations.
2. **Async operations:** Some tests use `async/await` with `waitForAsync()`. These need proper `act()` boundaries for React 18.
3. **Nested act() calls:** Avoid nesting `act()` calls; use a single outer `act()` for complex test scenarios.

## Failure Conditions

1. Any `act()` warning remains after the fix
2. Any test in recipeIntegration.test.tsx fails
3. Any test in the full suite fails
4. Build fails or bundle exceeds 512 KB

## Done Definition

1. ✅ `npm test -- --run src/__tests__/recipeIntegration.test.tsx` exits with code 0
2. ✅ No `act()` warnings appear in recipeIntegration.test.tsx output
3. ✅ All tests in recipeIntegration.test.tsx pass
4. ✅ `npm test -- --run` shows all test files passing
5. ✅ `npm run build` succeeds with bundle ≤ 512 KB

## Out of Scope

- No changes to production code
- No changes to other test files unless directly related to act() warning fix
- No new features or functionality
- No changes to component implementations

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
