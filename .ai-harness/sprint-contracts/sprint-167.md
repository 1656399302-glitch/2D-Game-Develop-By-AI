# APPROVED — Sprint Contract — Round 167

## Scope

Fix `act()` warnings in 3 test files that have Zustand store mutations not properly wrapped in `act()`. The warnings appear as "An update to TestComponent inside a test was not wrapped in act(...)" which occur when Zustand store state updates are triggered outside of React Testing Library's `act()` wrapper.

## Spec Traceability

- **P0 items covered this round:**
  - Test quality remediation: Fix act() warnings in exchangeStore.test.ts, useRatingsStore.test.ts, validationIntegration.test.ts

- **P1 items covered this round:**
  - Maintain test suite integrity (6865 tests, 238 files)

- **Remaining P0/P1 after this round:**
  - All known act() warning sources identified and fixed
  - Full suite remains at 6865 tests

- **P2 intentionally deferred:**
  - No P2 items in scope

## Deliverables

1. Fixed `src/components/Exchange/__tests__/exchangeStore.test.ts` — 3 act() warnings resolved
2. Fixed `src/__tests__/useRatingsStore.test.ts` — 4 act() warnings resolved
3. Fixed `src/__tests__/validationIntegration.test.ts` — 20 act() warnings resolved
4. Full test suite maintains 238 files / 6865 tests
5. Bundle remains ≤ 512 KB

## Acceptance Criteria

1. **AC-167-001:** `npm test -- --run src/components/Exchange/__tests__/exchangeStore.test.ts 2>&1 | grep -ciE "not wrapped in act|inside an act"` returns 0
2. **AC-167-002:** `npm test -- --run src/__tests__/useRatingsStore.test.ts 2>&1 | grep -ciE "not wrapped in act|inside an act"` returns 0
3. **AC-167-003:** `npm test -- --run src/__tests__/validationIntegration.test.ts 2>&1 | grep -ciE "not wrapped in act|inside an act"` returns 0
4. **AC-167-004:** All tests in `exchangeStore.test.ts` pass (exit 0)
5. **AC-167-005:** All tests in `useRatingsStore.test.ts` pass (exit 0)
6. **AC-167-006:** All tests in `validationIntegration.test.ts` pass (exit 0)
7. **AC-167-007:** Full test suite shows ≥ 6865 tests passing
8. **AC-167-008:** Build passes with bundle ≤ 512 KB

## Test Methods

1. **AC-167-001/002/003:** Run `grep -ciE "not wrapped in act|inside an act"` on each test file output to verify 0 act() warnings
2. **AC-167-004/005/006:** Run individual test files and verify all tests pass (exit 0)
3. **AC-167-007:** Run `npm test -- --run` and verify test count ≥ 6865
4. **AC-167-008:** Run `npm run build` and verify bundle ≤ 524,288 bytes

## Risks

1. **Round-specific implementation risks:**
   - Some store methods may trigger synchronous updates that need careful `act()` wrapping
   - Debounced validation logic in `validationIntegration.test.ts` may require async handling

2. **Verification risks:**
   - Warnings may be masked if multiple tests share output
   - Need to ensure `act()` wrapping doesn't break test logic

## Failure Conditions

1. Any of the 3 target test files have > 0 act() warnings
2. Any test in the 3 target files fails
3. Full test suite drops below 6865 tests
4. Build exceeds 512 KB

## Done Definition

All 8 acceptance criteria must pass:
1. ✅ `npm test -- --run src/components/Exchange/__tests__/exchangeStore.test.ts 2>&1 | grep -ciE "not wrapped in act|inside an act"` returns 0
2. ✅ `npm test -- --run src/__tests__/useRatingsStore.test.ts 2>&1 | grep -ciE "not wrapped in act|inside an act"` returns 0
3. ✅ `npm test -- --run src/__tests__/validationIntegration.test.ts 2>&1 | grep -ciE "not wrapped in act|inside an act"` returns 0
4. ✅ All tests in `exchangeStore.test.ts` pass
5. ✅ All tests in `useRatingsStore.test.ts` pass
6. ✅ All tests in `validationIntegration.test.ts` pass
7. ✅ `npm test -- --run` shows ≥ 6865 tests
8. ✅ `npm run build` produces bundle ≤ 512 KB

## Out of Scope

- No changes to production code
- No changes to other test files not listed in deliverables
- No new features or functionality
- No UI changes

## Prior Round Remediation Status

| Round | Contract | Status |
|-------|----------|--------|
| 161 | Create ChallengeObjectives.test.tsx | COMPLETE |
| 162 | Fix act() warning in AchievementList.test.tsx | COMPLETE |
| 163 | Fix 22 act() warnings in recipeIntegration.test.tsx | COMPLETE |
| 164 | Fix act() wrapping in Canvas.test.tsx | COMPLETE |
| 165 | Fix act() warnings in TimeTrialChallenge.test.tsx and CircuitModulePanel.browser.test.tsx | COMPLETE |
| 166 | Fix act() warnings in TechTreeCanvas.test.tsx and TechTree.test.tsx | COMPLETE |

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
