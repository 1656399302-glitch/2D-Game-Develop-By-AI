APPROVED — Round 128 Sprint Contract

# Sprint Contract — Round 128

## Scope

This sprint implements the remaining P0 components from spec.md that are not yet built: **Timer components**, **Counter components**, and **Memory elements** (flip-flops/latches). Wire junction points are deferred to a future round.

## Spec Traceability

### P0 items covered this round
- **Timer and counter components** (spec: "Timer and counter components" under Components)
- **Memory elements** (spec: "Memory elements" under Components)

### P1 items covered this round
- None — remaining P1 items (Tech Tree, Achievements, Factions, Challenges, Community, Exchange) are already implemented per prior rounds.

### Remaining P0/P1 after this round
- P0: All core components complete (logic gates ✅, timer/counter ✅, memory elements ✅, wire segments ✅, I/O nodes ✅, custom sub-circuits ⚠️ partial via Codex)
- P1: All systems implemented (Tech Tree ✅, Recipe Discovery ✅, Achievements ✅, Factions ✅, Challenges ✅, Community ✅, Exchange ✅, AI Assistant ✅)

### P2 intentionally deferred
- Wire junction points (complex routing, lower priority vs functional components)
- Advanced circuit analysis tools

---

## Deliverables

### 1. Timer Component — `src/components/Circuit/Timer.tsx`
- Configurable delay (1-16 ticks)
- Inputs: trigger (start), reset
- Outputs: output (HIGH after delay), done flag
- Visual: countdown display, pulse animation when active
- SVG-based matching circuit-board aesthetic

### 2. Counter Component — `src/components/Circuit/Counter.tsx`
- Configurable max value (2-16)
- Inputs: increment, decrement, reset
- Outputs: current value (0-max), overflow flag
- Visual: numeric display showing count
- SVG-based matching circuit-board aesthetic

### 3. SR Latch — `src/components/Circuit/SRLatch.tsx`
- Inputs: Set (S), Reset (R)
- Outputs: Q, Q̅ (complement)
- Behavior: Set=HIGH → Q=HIGH, Reset=HIGH → Q=LOW, both LOW → hold state, both HIGH → invalid (highlight error)
- Visual: standard SR latch symbol

### 4. D Latch — `src/components/Circuit/DLatch.tsx`
- Inputs: Data (D), Enable (E)
- Outputs: Q, Q̅
- Behavior: E=HIGH → Q=D, E=LOW → hold state
- Visual: standard D latch symbol

### 5. D Flip-Flop — `src/components/Circuit/DFlipFlop.tsx`
- Inputs: Data (D), Clock (CLK)
- Outputs: Q, Q̅
- Behavior: Rising edge on CLK → Q=D, otherwise hold
- Visual: standard D flip-flop symbol

### 6. Type definitions — `src/types/circuit.ts`
- Add `GateType.TIMER`, `GateType.COUNTER`, `GateType.SR_LATCH`, `GateType.D_LATCH`, `GateType.D_FLIP_FLOP`
- Add simulation state types for memory elements

### 7. Simulation engine updates — `src/engine/circuitSimulator.ts`
- Add evaluation logic for Timer (delay tick counting)
- Add evaluation logic for Counter (increment/decrement with overflow)
- Add evaluation logic for SR Latch, D Latch, D Flip-Flop (edge-triggered/level-sensitive)
- Maintain state across simulation ticks

### 8. Unit tests
- `src/__tests__/components/circuit/timer.test.tsx` — timer delay, reset, done flag
- `src/__tests__/components/circuit/counter.test.tsx` — increment, decrement, overflow, reset
- `src/__tests__/components/circuit/srlatch.test.tsx` — set, reset, hold, invalid state
- `src/__tests__/components/circuit/dlatch.test.tsx` — enable, data, hold
- `src/__tests__/components/circuit/dflipflop.test.tsx` — rising edge, hold
- `src/__tests__/engine/circuitSimulator.test.ts` — update simulation tests for new gates

---

## Acceptance Criteria

### AC-128-001: Timer component
1. Timer renders with configurable delay input (1-16 ticks)
2. Trigger input HIGH starts countdown; after N ticks, output goes HIGH
3. Reset input clears timer and output goes LOW
4. Done flag HIGH when timer completes, resets on next trigger
5. Visual countdown display updates each tick

### AC-128-002: Counter component
1. Counter renders with configurable max value (2-16)
2. Increment input increments count (wraps to 0 at max+1)
3. Decrement input decrements count (wraps to max at -1)
4. Reset input sets count to 0
5. Overflow flag HIGH when count wraps

### AC-128-003: SR Latch
1. Set=HIGH, Reset=LOW → Q=HIGH, Q̅=LOW
2. Set=LOW, Reset=HIGH → Q=LOW, Q̅=HIGH
3. Set=LOW, Reset=LOW → holds previous state (no change)
4. Set=HIGH, Reset=HIGH → circuit shows error state (both outputs pulse red)
5. Visual: standard SR latch symbol with S, R, Q, Q̅ labels

### AC-128-004: D Latch
1. Enable=HIGH, Data=D → Q=D, Q̅=¬D
2. Enable=LOW → Q and Q̅ hold previous values
3. Visual: standard D latch symbol with D, E, Q, Q̅ labels

### AC-128-005: D Flip-Flop
1. Rising clock edge (LOW→HIGH) → Q samples D, Q̅=¬Q
2. Between clock edges → Q and Q̅ hold state
3. Falling edge → no change
4. Visual: standard D flip-flop symbol with D, CLK, Q, Q̅ labels

### AC-128-006: Simulation engine integration
1. Timer/Counter/Memory elements evaluate correctly in circuit simulation
2. State persists across simulation ticks (not re-evaluated from scratch)
3. Propagation correctly flows through these elements to connected outputs

### AC-128-007: Build and type safety
1. `npx tsc --noEmit` → 0 errors
2. `npm run build` → bundle ≤ 512KB
3. All new gates added to gate palette/toolbar

### AC-128-008: Non-regression
1. All 5349 existing unit tests pass
2. All 31 circuit-canvas E2E tests pass

---

## Test Methods

### Timer component (unit tests)
1. Mount Timer with `defaultDelay={5}` and `initialState='idle'`
2. Set trigger=HIGH, verify output stays LOW for ticks 1-4, goes HIGH at tick 5
3. Set reset=HIGH, verify output=LOW immediately
4. Verify done flag goes HIGH on completion, resets on trigger
5. Test edge case: reset during countdown cancels timer

### Counter component (unit tests)
1. Mount Counter with `maxValue={8}`
2. Increment 3 times → verify count=3
3. Increment past max → verify overflow flag, count wraps to 0
4. Decrement 1 time from 0 → verify count=7
5. Reset → verify count=0, overflow=LOW

### SR Latch (unit tests)
1. S=HIGH, R=LOW → Q=HIGH, Q̅=LOW
2. S=LOW, R=LOW → Q still HIGH (hold)
3. S=LOW, R=HIGH → Q=LOW, Q̅=HIGH
4. S=HIGH, R=HIGH → both Q outputs pulse red (error state)
5. Return to S=LOW, R=LOW → holds last valid state

### D Latch (unit tests)
1. E=LOW, D=any → Q holds previous value
2. E=HIGH, D=HIGH → Q=HIGH, Q̅=LOW
3. E=HIGH, D=LOW → Q=LOW, Q̅=LOW
4. E goes LOW → Q holds last D value
5. Multiple D changes while E=HIGH → Q follows D

### D Flip-Flop (unit tests)
1. CLK=LOW, D=any → Q holds
2. CLK goes HIGH (rising edge) → Q samples D
3. D changes while CLK=HIGH → Q unchanged (only samples on edge)
4. CLK goes LOW → Q unchanged
5. Next rising edge → Q samples current D

### Simulation integration (unit tests)
1. Create circuit: InputNode → Timer → OutputNode
2. Run simulation for 10 ticks
3. Verify Timer output LOW for first N ticks, HIGH after
4. Create circuit: InputNode → SR Latch → OutputNode
5. Simulate Set=1, Reset=0 → verify Q=1 after propagation
6. Simulate Set=0, Reset=1 → verify Q=0 after propagation

### E2E verification (Playwright)
1. Open circuit canvas
2. Drag Timer from gate palette to canvas
3. Verify Timer renders with delay control
4. Drag Counter to canvas, configure max value
5. Add SR Latch, verify error highlighting on S=R=HIGH
6. Save circuit, reload, verify component state preserved

---

## Risks

### 1. Simulation state persistence (Medium)
- Memory elements require state across ticks, not stateless like basic gates
- Need to ensure simulation engine maintains internal state map keyed by component ID
- **Mitigation**: Add `componentStates: Map<string, ComponentState>` to simulation store; update on each tick

### 2. Edge detection for flip-flops (Medium)
- D flip-flop must detect rising clock edge (not just clock=HIGH)
- Requires comparing previous clock state to current
- **Mitigation**: Track previous clock states in component state; on each evaluation, check if `prevClock === LOW && currClock === HIGH`

### 3. Timer synchronous reset (Low)
- Reset must immediately clear timer output, not wait for next tick
- **Mitigation**: Check reset input before tick count logic; if reset=HIGH, skip to idle state

### 4. Component render performance (Low)
- Adding 5 new component types increases bundle; currently at 490.83KB
- **Mitigation**: Keep SVG assets minimal; use `memo()` for components

---

## Failure Conditions

1. **TypeScript errors** introduced by new gate types or simulation updates
2. **Bundle size** exceeds 512KB after adding 5 new components
3. **Existing tests fail** — any of the 5349 unit tests or 31 E2E tests regression
4. **Memory element state bugs** — flip-flop outputs wrong value after clock edge
5. **Timer edge case** — timer completes but output doesn't propagate to connected components
6. **Invalid SR state** — S=R=HIGH doesn't show error feedback or causes crash

---

## Done Definition

Exact conditions that must be true before claiming round complete:

1. ✅ `npx tsc --noEmit` exits with 0 errors
2. ✅ `npm run build` produces bundle ≤ 512KB
3. ✅ `npm test -- --run` passes with 5349+ tests (existing + new)
4. ✅ `npx playwright test tests/e2e/circuit-canvas.spec.ts` passes 31+ tests
5. ✅ Timer component: renders, countdown works, reset cancels, done flag correct
6. ✅ Counter component: increments/decrements/wraps/overflows/resets correctly
7. ✅ SR Latch: set/reset/hold/error states all work correctly
8. ✅ D Latch: enable/data/hold works correctly
9. ✅ D Flip-Flop: rising edge samples D, holds otherwise
10. ✅ New gates appear in circuit-canvas gate palette
11. ✅ Simulation engine correctly propagates through all new component types
12. ✅ Browser smoke test: open canvas, add each new component type, verify render

---

## Out of Scope

- Wire junction points (deferred to future round)
- Sub-circuit encapsulation (existing Codex save/load is sufficient)
- Additional gate types beyond specified P0 items
- Performance optimization of existing systems
- Documentation updates (can be separate task)
- Wire junction UI (split/merge nodes)
- Advanced memory (JK flip-flop, T flip-flop)
- Asynchronous circuit timing analysis
