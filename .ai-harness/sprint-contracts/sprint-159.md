APPROVED

# Sprint Contract — Round 159

## Scope

Enhance the **Timing Diagram** component with waveform visualization for sequential circuit analysis. This provides a visual representation of signal timing through circuits, essential for debugging and understanding sequential logic behavior.

## Spec Traceability

### P0 items (required for this sprint)
- Timing Diagram visualization component (extends existing `TimingDiagram.tsx`)
- Signal trace store integration for timing data
- Waveform rendering with proper signal states

### P1 items (covered this round)
- Edge-triggered behavior visualization
- Multi-signal timing comparison
- Clock signal display with period markers

### Remaining P0/P1 after this round
- Full circuit simulation engine with propagation delays
- Challenge mode puzzle integration with timing diagrams
- Export timing diagrams as images

### P2 intentionally deferred
- Real-time signal monitoring during simulation
- Timing constraint validation
- Performance optimization for large circuits

## Operator Inbox Compliance

Reviewed `.ai-harness/runtime/operator-inbox.json`:
- **Pending inbox items targeting this round:** None
- **Previously processed inbox items:** All 4 inbox items have been processed in prior rounds (51, 85, 103, 106)
- **This contract does not weaken any operator inbox instructions** — no inbox mandates are in scope this round. The operator inbox section is present to document clearance status for evaluator reference.

## Deliverables

1. **`src/components/Circuit/TimingDiagramPanel.tsx`** — Enhanced panel with signal waveform display
2. **`src/store/signalTraceStore.ts`** — Updated store with waveform data generation
3. **`src/__tests__/timingDiagramEnhancement.test.tsx`** — Comprehensive tests for new waveform features
4. **`src/utils/waveformUtils.ts`** — Utility functions for waveform data transformation

## Acceptance Criteria

1. **AC-159-001:** Timing diagram displays waveform signals with HIGH/LOW states rendered correctly
2. **AC-159-002:** Multiple signals can be displayed simultaneously with distinct colors
3. **AC-159-003:** Clock signals show period markers and duty cycle visualization
4. **AC-159-004:** Signal transitions are visible at correct time positions
5. **AC-159-005:** Test count ≥ 6672 after new tests are added (baseline 6505 + 167 new minimum)

## Test Methods

### AC-159-001: Waveform HIGH/LOW state rendering
**Entry:** Component renders with signal data loaded  
**Positive assertions:**
- Verify SVG path `d` attribute contains alternating horizontal segments at HIGH_Y and LOW_Y positions (within ±1px tolerance)
- Verify HIGH state segments have `stroke` color matching active theme (cyan #00FFFF or equivalent)
- Verify LOW state segments have `stroke` color matching inactive theme (dark #1a1a2e or equivalent)
- Assert at least 2 transitions (HIGH→LOW or LOW→HIGH) exist in the rendered waveform

**Negative assertions:**
- Component should not crash when signal data is empty (should render empty state, not throw)
- Component should not render undefined SVG elements when data is malformed
- HIGH/LOW Y positions should not be equal (visual states must be distinct)

**`npm test -- --run timingDiagramEnhancement` shows passing tests; manual verification of SVG colors in browser devtools**

### AC-159-002: Multi-signal distinct colors
**Entry:** Component renders with 3+ signals  
**Positive assertions:**
- Verify component renders at least 3 `<path>` or `<line>` elements for signals
- Assert each signal has a distinct `stroke` color from the set: cyan (#00FFFF), purple (#9966FF), green (#00FF66)
- Assert signal paths do not overlap at the same Y position

**Negative assertions:**
- Two signals should not share the same stroke color in the same signal group
- Signals should not have zero-length path elements (invisible signals)

**`npm test -- --run timingDiagramEnhancement` shows passing tests; manual verification of stroke colors in browser**

### AC-159-003: Clock period markers
**Entry:** Clock signal selected for display  
**Positive assertions:**
- For clock signals, verify vertical marker lines appear at intervals of N=8 time units
- Assert marker count = floor(totalTimeUnits / 8) ± 1
- Verify markers have distinct stroke style (dashed or thinner than signal paths)

**Negative assertions:**
- Markers should not appear on non-clock signals
- Markers should not appear at intervals other than 8 time units

**`npm test -- --run timingDiagramEnhancement` shows passing tests**

### AC-159-004: Signal transitions alignment
**Entry:** Waveform rendered with clock edges  
**Positive assertions:**
- Verify signal transition X positions are within ±2px of the expected clock edge X positions
- Assert rising edges (LOW→HIGH) occur at even clock indices (0, 2, 4, ...)
- Assert falling edges (HIGH→LOW) occur at odd clock indices (1, 3, 5, ...)

**Negative assertions:**
- Transitions should not occur between clock edges (off-cycle transitions indicate timing bug)
- Signals should not have partial transitions (rising or falling segments that don't complete)

**`npm test -- --run timingDiagramEnhancement` shows passing tests**

### AC-159-005: Test count ≥ 6672
**Command:** `npm test -- --run`  
**Assertion:** Shows ≥ 6672 passing tests (baseline 6505 + 167 new minimum)  
**Verification:** Count output line shows ≥ 6672 tests passing

## Failure Conditions

1. Test count falls below 6672
2. Any test file fails (`npm test -- --run` shows failures)
3. Build exceeds 512 KB limit
4. TypeScript compilation errors (`npx tsc --noEmit` fails)
5. Waveform SVG elements do not render (component returns null or missing SVG structure)
6. Component crashes on empty signal data (should render empty state gracefully)

## Done Definition

The round is complete when ALL conditions are true:

1. `npm test -- --run` shows ≥ 6672 passing tests with 0 failures
2. `npm run build` produces bundle < 512 KB
3. `npx tsc --noEmit` exits with code 0
4. **Waveform visualization renders correctly in browser:**
   - SVG path elements present with `stroke` and `d` attributes
   - HIGH/LOW states visually distinct (different Y positions and colors)
5. **Clock signals display with vertical period markers:**
   - Markers at 8-unit intervals
   - Distinct style from signal paths
6. **Multiple signals render with distinct stroke colors:**
   - At least 3 signals with cyan, purple, green (or equivalent)
7. **Signal transitions align with clock edges:**
   - Within ±2px tolerance
8. **Negative scenarios handled:**
   - Empty signal data renders empty state (no crash)
   - Malformed data does not produce undefined elements

## Out of Scope

- Real-time signal monitoring during active simulation
- Export timing diagrams to image formats
- Timing constraint validation (setup/hold times)
- Performance optimization for circuits with 50+ signals
- Integration with challenge mode puzzles
