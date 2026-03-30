# Sprint Contract — Round 40

## Scope

**FACTION RESEARCH SYSTEM + TECH TREE UI**

The faction tech tree data (`src/types/factions.ts`) and reputation store (`src/types/factionReputation.ts`) exist. The current `TechTree.tsx` renders a static 4×3 grid. This round adds:

1. **Research system** — click-to-research with time-based progression, unlocking modules on completion
2. **SVG-interactive TechTree** — replaces current grid with SVG-based node graph, 4 visual states
3. **Research queue** — up to 3 concurrent researches
4. **Research logic** in the reputation store

---

## Existing Files (reference only — do not break)

- `src/components/Factions/TechTree.tsx` — current grid must still render; SVG overlay is additive
- `src/store/useFactionStore.ts` — faction counts and unlocks; must continue to work
- `src/store/useFactionReputationStore.ts` — existing reputation methods; new research methods appended
- `src/types/factions.ts` — `FactionId`, `TechTreeNode`, `FACTION_IDS = ['void','inferno','storm','stellar']`
- `src/types/factionReputation.ts` — `FactionReputationLevel`, existing store types

---

## P0 Items (Must Ship)

- [ ] Research logic: `researchTech(techId)`, `completeResearch(techId)`, `getResearchableTechs()`, `getRequiredReputation(techId)`
- [ ] Research timer: `RESEARCH_DURATION_MS = 3000` (3 seconds) — must be a named export
- [ ] Research queue: max 3 concurrent, with defined behavior at capacity
- [ ] SVG-interactive TechTree with 4 states: locked (greyed), available (pulsing), researching (animated), completed (glowing)
- [ ] Click-to-research interaction: locked → available → researching → completed
- [ ] Module unlocks on research completion via `unlockTechTreeNode(techId)` in faction store
- [ ] Build: 0 TypeScript errors

## P1 Items (Must Ship)

- [ ] Reputation requirement display on each tech node
- [ ] Prerequisite chain visualization (visual lines between nodes)
- [ ] Research queue UI showing up to 3 concurrent slots

---

## Deliverables

### D1: Research Logic in `src/store/useFactionReputationStore.ts`

Append these methods to the existing store:

```typescript
// Research state tracking (add to state interface)
currentResearch: Record<string, { startedAt: number; durationMs: number }>;
completedResearch: Record<string, string[]>; // factionId -> techId[]

// NEW METHODS:
researchTech: (techId: string, factionId: string) => 'ok' | 'queue_full' | 'already_researching' | 'locked'
completeResearch: (techId: string, factionId: string) => void
getResearchableTechs: (factionId: string) => TechTreeNode[]   // nodes user can start researching
getRequiredReputation: (techId: string) => number
getCurrentResearch: (factionId: string) => ResearchItem[]
cancelResearch: (techId: string, factionId: string) => void
```

**Queue behavior at capacity**: `researchTech()` returns `'queue_full'` when 3 items are already researching. The UI must display a visible error message (toast, inline message, or tooltip) — silently ignoring the click is not acceptable.

**On research completion**: `completeResearch()` must call `useFactionStore.getState().unlockTechTreeNode(techId)` to trigger module unlocks.

### D2: New Types in `src/types/factionReputation.ts`

```typescript
export const RESEARCH_DURATION_MS = 3000;  // Named export — AC references this

export enum ResearchState {
  Locked = 'locked',
  Available = 'available',
  Researching = 'researching',
  Completed = 'completed',
}

export interface ResearchItem {
  techId: string;
  startedAt: number;
  durationMs: number;
}
```

### D3: Enhanced `src/components/Factions/TechTree.tsx`

Full SVG-based tech tree replacing/augmenting the current grid:
- SVG node graph with 4 visual states (locked/available/researching/completed)
- Connection lines for prerequisite chains
- Click-to-research interaction
- Research progress ring on active nodes
- Module unlock notifications
- Queue indicator (0/3, 1/3, 2/3, 3/3 slots)

**Visual State Definitions:**
| State | CSS/Visual Treatment |
|-------|---------------------|
| `locked` | Greyed out (opacity: 0.4), cursor: not-allowed, no hover effect |
| `available` | Full color, pulsing glow animation (box-shadow or filter animation), cursor: pointer |
| `researching` | Animated progress ring/arc, accent color highlight, timer countdown visible |
| `completed` | Glowing effect (persistent), checkmark or filled indicator, full color |

### D4: Tests in `src/components/Factions/TechTree.test.tsx`

Actual test implementations (not stubs). Minimum:
- Renders at least 12 nodes (one per faction × tier)
- Locked tech: clicking does NOT start research
- Available tech: clicking starts research → state becomes 'researching'
- Research completes after `RESEARCH_DURATION_MS` → state becomes 'completed'
- Queue at capacity (3): clicking 4th tech returns `'queue_full'` (no crash)
- Module unlocks after research completion

**Test Helper Implementation Required:**
The test file must include a helper function to set up 3 active researches for queue capacity tests:
```typescript
// Helper to be implemented in test file
function setupThreeActiveResearches(store: ReturnType<typeof useFactionReputationStore.getState>) {
  // Set up 3 items in currentResearch state
  // Implementation: directly manipulate store state or use store's researchTech
}
```

---

## Acceptance Criteria

| # | Criterion | Verification Method |
|---|---|---|
| AC1 | TechTree renders ≥12 nodes findable by `data-testid` | `expect(screen.getAllByTestId(/^tech-node-/)).toHaveLength(12)` |
| AC2 | At `requiredReputation=0`: node is `available`. At `requiredReputation=9999`: node is `locked` | Unit test: `getResearchableTechs()` returns only low-rep nodes |
| AC3 | Clicking available tech → `researching` state within 1 render cycle | `waitFor(() => expect(screen.getByTestId('tech-node-inferno-tier-1')).toHaveAttribute('data-state', 'researching'))` |
| AC4 | Research completes → `completed` state after `RESEARCH_DURATION_MS` (3000ms) | `jest.useFakeTimers()` advancing by 3000ms, assert `'completed'` |
| AC5 | Completed research: `useFactionStore.getState().isTechTreeNodeUnlocked(nodeId)` returns `true` | Assert `isTechTreeNodeUnlocked('inferno-tier-1')` is true after completion |
| AC6 | Queue full (3 items): clicking 4th tech → error returned, no crash | `expect(store.researchTech('t4', 'void')).toBe('queue_full')` |
| AC7 | Queue full: UI displays error message (not silently ignored) | Error element present in DOM or toast fired |
| AC8 | Build: 0 TypeScript errors | `npm run build` |
| AC9 | All existing tests pass | `npm test -- --run` — 1562+ passing |

---

## Test Methods

### TM1: Build Verification
```bash
npm run build
Expected: 0 TypeScript errors
```

### TM2: Test Suite
```bash
npm test -- --run
Expected: 1562+ tests passing (no regressions)
```

### TM3: Research States
```typescript
// src/components/Factions/TechTree.test.tsx
describe('Research States', () => {
  it('shows available state for low-rep techs', () => {
    render(<TechTree />);
    // Faction IDs: void | inferno | storm | stellar
    const node = screen.getByTestId('tech-node-inferno-tier-1');
    expect(node).toHaveAttribute('data-state', 'available');
  });

  it('shows locked state for high-rep techs', () => {
    render(<TechTree />);
    const node = screen.getByTestId('tech-node-void-tier-3');
    expect(node).toHaveAttribute('data-state', 'locked');
  });
});
```

### TM4: Research Flow
```typescript
it('research starts and completes after RESEARCH_DURATION_MS', async () => {
  jest.useFakeTimers();

  render(<TechTree />);
  const node = screen.getByTestId('tech-node-inferno-tier-1');

  // Start research
  await userEvent.click(node);
  expect(node).toHaveAttribute('data-state', 'researching');

  // Advance timer past RESEARCH_DURATION_MS
  act(() => { jest.advanceTimersByTime(3000); });

  expect(node).toHaveAttribute('data-state', 'completed');
  jest.useRealTimers();
});
```

### TM5: Queue Capacity
```typescript
it('returns queue_full when 3 researches already active', () => {
  // Set up store with 3 active researches via direct state manipulation
  const store = useFactionReputationStore.getState();
  store.currentResearch = {
    'tech-1': { startedAt: Date.now(), durationMs: 3000 },
    'tech-2': { startedAt: Date.now(), durationMs: 3000 },
    'tech-3': { startedAt: Date.now(), durationMs: 3000 },
  };
  
  const result = store.researchTech('tech-id-4', 'void');
  expect(result).toBe('queue_full');
});
```

---

## Failure Conditions

FC1: Build fails with TypeScript errors
FC2: Any existing tests fail
FC3: TechTree renders fewer than 12 nodes
FC4: Research cannot be started on available techs
FC5: Completed research does not update faction store (isTechTreeNodeUnlocked returns false)
FC6: Queue at capacity: 4th research click causes crash or is silently dropped (must return `'queue_full'`)
FC7: Queue full: no visible error message displayed to user
FC8: Module unlock function not called on research completion

---

## Done Definition

- [ ] 12+ tech nodes render with `data-testid` attributes (pattern: `tech-node-{factionId}-tier-{n}`)
- [ ] 4 visual states are implemented and distinguishable via `data-state` attribute
- [ ] `RESEARCH_DURATION_MS = 3000` is a named export in `factionReputation.ts`
- [ ] Click-to-research: available → researching → completed
- [ ] Research completion calls `unlockTechTreeNode(techId)` on faction store
- [ ] Queue: `'queue_full'` returned when 3 items already researching
- [ ] Queue full: visible error message displayed (DOM element or toast)
- [ ] Build succeeds with 0 TypeScript errors
- [ ] All 1562+ tests pass

---

## Out of Scope

- Real-time multiplayer mechanics
- Faction diplomacy
- Animated faction lore videos
- Cross-faction research synergies (P2)
- Changes to existing faction store unlock logic beyond `unlockTechTreeNode` calls

---

## Spec Traceability

This contract extends the existing faction system per the project spec (`spec.md`). The faction tech tree is part of the broader faction reputation and advancement system. Relevant spec components:

| Spec Section | This Contract's Mapping |
|--------------|-------------------------|
| Faction system (派系系统) | Research mechanics use faction reputation levels |
| Module unlocks | `unlockTechTreeNode()` ties research completion to module availability |
| Visual states | SVG node graph with 4 states per design system |

**Relevant existing files (do not break):**
- `src/types/factions.ts` — TechTreeNode type, FactionId enum
- `src/types/factionReputation.ts` — ResearchState enum, ResearchItem interface
- `src/store/useFactionReputationStore.ts` — Research methods, queue logic
- `src/store/useFactionStore.ts` — `unlockTechTreeNode()`, `isTechTreeNodeUnlocked()`
- `src/components/Factions/TechTree.tsx` — SVG interactive tech tree component

---

## APPROVED

Contract approved for Round 40. All acceptance criteria are binary and testable. No vague scope, no silent shrink, no mixing of bugfix and feature work before blockers are cleared.
