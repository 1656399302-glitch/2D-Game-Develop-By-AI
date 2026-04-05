# Sprint Contract — Round 136

## APPROVED

---

## Scope

Implementation of the **Tech Tree System** for the circuit-building puzzle game. The tech tree provides visual progression through unlockable circuit components, driven by the achievement system completed in the previous round. This is the foundational tech tree UI — nodes, connections, and unlock state — without component purchase mechanics.

## Spec Traceability

### P0 items covered this round
- **Canvas validation and simulation engine** — Verified complete in Round 133
- **Custom sub-circuit modules** — Verified complete in Round 134

### P1 items covered this round
- **Tech tree with unlockable components** (from Core Features → Progression System)
  - Tech tree visualization and layout
  - Tech tree nodes organized by categories
  - Unlock state management driven by achievements
  - Visual connection lines between prerequisite nodes
  - Spec connection: implements the "Tech tree with unlockable components" sub-feature within the "Progression System" section of spec.md

### Remaining P0/P1 after this round
- **P0**: Memory elements
- **P1**: Recipe discovery through experimentation, Faction reputation and rewards, Challenge mode with puzzles, Community gallery, Browse and import community circuits, Template library, Exchange/trade system, AI assistant

### P2 intentionally deferred
- Faction reputation and rewards, Exchange/trade system, AI assistant

## Deliverables

1. **`src/store/useTechTreeStore.ts`** (new file) — Zustand store for tech tree state. Manages node unlock state, prerequisite tracking, and integration with achievement store.
2. **`src/data/techTreeNodes.ts`** (new file) — Tech tree node definitions including: node id, name, description, category, prerequisites (array of node IDs), position in tree, unlock cost/requirement.
3. **`src/components/TechTree/TechTreeCanvas.tsx`** (new file) — Main tech tree visualization component with SVG-based node rendering and connection lines.
4. **`src/components/TechTree/TechTreeNode.tsx`** (new file) — Individual tech tree node component displaying: name, icon, locked/unlocked state, prerequisite indicators.
5. **`src/components/TechTree/TechTreeConnections.tsx`** (new file) — SVG-based connection lines between tech tree nodes showing prerequisite relationships.
6. **`src/components/TechTree/TechTreePanel.tsx`** (new file) — Panel container for the tech tree, integrated into the app layout.
7. **`src/types/techTree.ts`** (new file) — TypeScript types for TechTreeNode, TechTreeState, NodeCategory, Prerequisite.
8. **`src/__tests__/stores/techTreeStore.test.ts`** — Unit tests for tech tree store (≥30 tests covering initialization, unlock logic, prerequisite validation).
9. **`src/__tests__/components/TechTree/TechTreeCanvas.test.tsx`** — Unit tests for tech tree canvas component.
10. **`src/__tests__/components/TechTree/TechTreeNode.test.tsx`** — Unit tests for individual node component (locked/unlocked states, prerequisite display).

## Acceptance Criteria

1. **AC-136-001**: Tech tree store initializes with at least 10 nodes organized in at least 3 categories (Basic Gates, Advanced Gates, Special Components). Each node has: `id`, `name`, `description`, `category`, `prerequisites` (array), `isUnlocked`, `position` ({x, y}).
2. **AC-136-002**: Tech tree panel displays all nodes with visual distinction between locked (grayed out, non-interactive) and unlocked (highlighted, interactive) states.
3. **AC-136-003**: Clicking an unlocked tech tree node displays detailed information (name, description, prerequisites status, unlock status) in an info panel or tooltip.
4. **AC-136-004**: Clicking a locked node with unmet prerequisites displays feedback indicating which prerequisites are not met (e.g., "Requires: AND Gate, OR Gate").
5. **AC-136-005**: Achievement unlock automatically updates tech tree node state — when an achievement unlocks that satisfies a prerequisite, the dependent node becomes visually unlocked.
6. **AC-136-006**: Tech tree connections (SVG lines) correctly visualize prerequisite relationships between nodes. Locked prerequisite connections appear dimmed; satisfied connections appear bright.
7. **AC-136-007**: Bundle size ≤ 512KB after adding tech tree system.
8. **AC-136-008**: TypeScript compilation passes with 0 errors.
9. **AC-136-009**: Tech tree data persists via localStorage key `'tech-tree-progress'` — unlocked nodes persist across page reloads.

## Test Methods

### AC-136-001: Tech tree store initialization
1. Import `useTechTreeStore` from `src/store/useTechTreeStore.ts`
2. Verify `getState().nodes` array has length ≥ 10
3. Verify at least 3 categories exist in the nodes: `Basic Gates`, `Advanced Gates`, `Special Components` (or similar)
4. Verify each node has fields: `id` (string), `name` (string), `description` (string), `category` (string), `prerequisites` (string[]), `isUnlocked` (boolean), `position` ({x: number, y: number})
5. Verify prerequisite references are valid (all prerequisite IDs exist as node IDs in the tree)

### AC-136-002: Tech tree panel display
1. Render `<TechTreePanel />` with React Testing Library
2. Assert the panel heading contains "科技树" (Tech Tree) or similar
3. Assert all predefined nodes are rendered (≥ 10 items)
4. Assert locked nodes show a locked/grayed visual state (check for CSS class or aria-disabled)
5. Assert unlocked nodes show an unlocked/highlighted visual state
6. Verify the component reads from the tech tree store (not hardcoded data)

### AC-136-003: Unlocked node click shows details
1. Find an unlocked tech tree node in the rendered panel
2. Click on the node
3. Assert an info panel or tooltip appears with: node name, description, prerequisites list with status (met/unmet), category

### AC-136-004: Locked node with unmet prerequisites shows feedback
1. Find a locked tech tree node with unmet prerequisites
2. Click on the node
3. Assert feedback appears indicating which prerequisites are not met (e.g., text containing "Requires" and the prerequisite names)
4. Assert the node remains locked (visual state unchanged)

### AC-136-005: Achievement unlock updates tech tree
1. Mock achievement unlock via `useAchievementStore.getState().unlockAchievement(achievementId)`
2. Mock or set a tech tree node with that achievement as a prerequisite
3. Assert the dependent tech tree node's `isUnlocked` state becomes `true`
4. Assert the tech tree store triggers a re-render with the updated node state
5. Verify the visual representation in the component reflects the unlocked state

### AC-136-006: Tech tree connections
1. Render `<TechTreeCanvas />` or the component that includes `<TechTreeConnections />`
2. Assert SVG connection lines exist in the rendered output
3. Verify connection lines link nodes with prerequisite relationships
4. Assert connections to unlocked nodes appear bright/active (check for CSS class or stroke color)
5. Assert connections to locked nodes appear dimmed/inactive

### AC-136-007: Bundle size
1. Run `npm run build`
2. Identify the main JS bundle: `dist/assets/index-*.js`
3. Assert file size ≤ 524,288 bytes (512KB)
4. If size exceeds limit, defer non-critical tech tree decorations or optimize SVG paths

### AC-136-008: TypeScript
1. Run `npx tsc --noEmit`
2. Assert exit code 0
3. Verify no `any` type suppressions introduced in new tech tree code

### AC-136-009: localStorage persistence
1. Unlock 3 distinct tech tree nodes via store action
2. Serialize the current tech tree state
3. Clear the store's React state by calling `useTechTreeStore.setState({ ...initialState })`
4. Trigger a re-initialization by re-importing/resetting the store
5. Assert all 3 nodes are restored with `isUnlocked === true`
6. Verify localStorage key is `'tech-tree-progress'` (exact string match)

## Risks

1. **Achievement integration complexity** — Connecting tech tree unlock state to achievement unlocks requires careful event handling. Use the existing achievement store's `subscribe` pattern or event callbacks.
2. **SVG connection rendering** — Calculating SVG paths between nodes based on positions requires accurate coordinate math. Use simple straight lines or bezier curves with deterministic path calculation.
3. **Tech tree layout** — Positioning nodes without overlap requires a consistent layout algorithm. Start with manual positions in the data, refine to algorithmic placement if time permits.
4. **localStorage mock in Node.js** — Tests must provide a localStorage mock before importing the store module.
5. **Category taxonomy alignment** — Tech tree categories should align with component categories in the circuit panel. Coordinate with existing component type definitions.

## Failure Conditions

The round fails if any of the following occur:

1. Any of the 9 acceptance criteria fails to pass
2. Bundle size exceeds 512KB (524,288 bytes)
3. TypeScript compilation produces errors (`npx tsc --noEmit` exit code ≠ 0)
4. Tech tree store unit test count is below 30
5. Tech tree fails to integrate with achievement store — unlocking an achievement does not update tech tree state
6. Locked nodes can be interacted with in ways that should be prevented (clicking locked node behaves same as unlocked node)
7. localStorage persistence fails across store re-initialization
8. SVG connections do not render between prerequisite nodes
9. Tech tree panel is not accessible or navigable

## Done Definition

All of the following must be true before the builder may claim the round complete:

1. All 9 acceptance criteria pass with automated tests
2. Bundle size ≤ 512KB verified via `npm run build`
3. `npx tsc --noEmit` exits with code 0
4. `npm test -- --run` passes with ≥ 30 new tests for the tech tree system
5. Tech tree panel renders correctly with ≥ 10 nodes across 3 categories
6. Unlocked/locked node states are visually distinct and correct
7. Clicking nodes shows appropriate feedback (details for unlocked, prerequisite info for locked)
8. Achievement unlocks propagate to tech tree node state
9. SVG connection lines correctly visualize prerequisite relationships
10. localStorage persistence verified with key `'tech-tree-progress'`
11. No regressions in existing unit tests
12. Tech tree panel integrates into the app layout alongside existing panels

## Out of Scope

- Component purchase/unlock mechanics (tech tree shows what CAN be unlocked, not purchase UI)
- Tech tree zoom/pan controls (fixed viewport)
- Tech tree progress reset functionality
- Recipe discovery and recipe book UI
- Faction reputation system
- Challenge mode puzzles
- Community gallery and sharing features
- Exchange/trade system
- AI assistant integration
- Memory elements
- Styling beyond basic functional layout (dark theme colors only)
- Mobile-responsive tech tree layout
