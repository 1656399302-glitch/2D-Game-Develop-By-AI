APPROVED

# Sprint Contract — Round 171

## Scope

Enhance circuit timing visualization with signal analysis features:
1. Add cursor-based timing measurements to TimingDiagram component
2. Add signal transition detection and frequency calculation
3. Create TimingAnalysisPanel for measuring timing relationships
4. Integrate enhanced timing features into existing circuit simulation workflow

## Spec Traceability

### P0 items covered this round
- **Canvas System** (spec: "Circuit validation and simulation"): Enhance simulation analysis with timing measurements
- **Components** (spec: "Logic gates, wires, timers"): Add timing analysis for timer/counter circuits

### P1 items covered this round
- **Progression System** (spec: "Challenge mode with puzzles"): Provide timing data for challenge verification

### Remaining P0/P1 after this round
- Multi-layer support for complex circuits (not started)
- Custom sub-circuit module persistence (partial)
- Community exchange/trade full implementation (partial)

### P2 intentionally deferred
- AI assistant natural language circuit description
- Cloud backup synchronization
- Multiplayer circuit collaboration

## Deliverables

1. **`src/components/Circuit/TimingAnalysisPanel.tsx`** — New panel for timing measurements
   - Cursor-based time difference calculation
   - Signal frequency display
   - Duty cycle analysis
   - Copy measurements to clipboard

2. **`src/components/Circuit/EnhancedTimingDiagram.tsx`** — Enhanced timing diagram
   - Dual cursor support with time delta display
   - Zoom controls for detailed analysis
   - Signal annotation capabilities
   - Export timing data as CSV

3. **`src/store/signalTraceStore.ts`** — Extended signal trace store
   - Add transition event tracking
   - Frequency calculation utilities
   - Signal statistics (min/max/avg pulse width)

4. **`src/__tests__/timingAnalysis.test.tsx`** — Test suite
   - TimingAnalysisPanel component tests
   - Cursor measurement logic tests
   - Signal transition detection tests
   - Frequency calculation tests

## Acceptance Criteria

1. **AC-171-001**: TimingAnalysisPanel renders with cursor controls
   - Two cursor indicators (A/B) displayed on timing diagram
   - Time delta shown between cursors in nanoseconds/steps

2. **AC-171-002**: Signal frequency calculated correctly
   - Frequency = 1/period displayed for periodic signals
   - "N/A" displayed for non-periodic signals

3. **AC-171-003**: Duty cycle percentage displayed
   - Calculated as (HIGH time / total period) × 100%
   - Updates when cursors move

4. **AC-171-004**: Timing data exportable to CSV
   - "Export CSV" button generates downloadable file
   - CSV contains: signal name, timestamp, state, notes

5. **AC-171-005**: EnhancedTimingDiagram integrates with existing TimingDiagram
   - Uses same signal trace data format
   - Backwards compatible with existing integration tests

6. **AC-171-006**: Tests pass (≥7011 existing + new timing tests)
   - `npm test -- --run` passes all test files
   - No regression in existing timing/simulation tests

7. **AC-171-007**: Bundle size remains ≤512KB
   - `npm run build` produces bundle < 512KB
   - New code lazy-loaded where appropriate

8. **AC-171-008**: TypeScript compiles without errors
   - `npx tsc --noEmit` exits with code 0

## Test Methods

### AC-171-001: Cursor Controls
1. Render `TimingAnalysisPanel` with sample traces
2. Verify two cursor markers appear on diagram
3. Click to move cursor A, verify position updates
4. Click to move cursor B, verify position updates
5. Verify time delta displays between cursors
6. Negative: Cursor movement outside trace bounds should clamp

### AC-171-002: Frequency Calculation
1. Create signal with known frequency (e.g., 4 steps HIGH, 4 steps LOW = 0.125 freq)
2. Calculate frequency using utility function
3. Verify result matches expected frequency
4. Test non-periodic signal returns "N/A"

### AC-171-003: Duty Cycle
1. Calculate duty cycle from traces with known HIGH/LOW ratio
2. Verify percentage = (HIGH steps / total steps) × 100
3. Edge case: All HIGH returns 100%
4. Edge case: All LOW returns 0%

### AC-171-004: CSV Export
1. Click "Export CSV" button
2. Verify download triggered
3. Parse generated CSV content
4. Verify columns: signal, timestamp, value, annotation
5. Verify data matches visible traces

### AC-171-005: Integration
1. Render `EnhancedTimingDiagram` alongside `TimingDiagram`
2. Pass same `traces` and `signalNames` props
3. Verify both render identical waveforms
4. Verify cursor overlay works on enhanced version

### AC-171-006: Test Suite
```bash
npm test -- --run
# Verify ≥243 test files pass
# Verify total test count ≥7011
```

### AC-171-007: Bundle Size
```bash
npm run build
# Verify dist/assets/index-*.js < 512KB
```

### AC-171-008: TypeScript
```bash
npx tsc --noEmit
# Verify exit code 0, no errors
```

## Risks

1. **Measurement Accuracy**: Floating-point timing calculations may have precision issues
   - Mitigation: Use integer steps internally, convert to float only for display

2. **Large Trace Memory**: Long simulations may accumulate many trace entries
   - Mitigation: Implement trace depth limit (default 1000 entries), oldest entries pruned

3. **CSV Export Compatibility**: Different locales use different decimal separators
   - Mitigation: Use fixed decimal format with 3 significant figures

## Failure Conditions

1. Test suite fails: `npm test -- --run` exits non-zero
2. TypeScript errors: `npx tsc --noEmit` reports any errors
3. Bundle bloat: `npm run build` produces bundle ≥512KB
4. Functional broken: Existing timing/simulation tests regress
5. Cursor UI broken: Cannot interactively position cursors

## Done Definition

All 8 acceptance criteria must be verified:

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| 1 | Cursor controls functional | Browser interaction test |
| 2 | Frequency calculation correct | Unit test with known values |
| 3 | Duty cycle displays correctly | Unit test with known ratios |
| 4 | CSV export works | Download + parse verification |
| 5 | EnhancedTimingDiagram integrates | Side-by-side render test |
| 6 | All tests pass | `npm test -- --run` ≥7011 |
| 7 | Bundle ≤512KB | Build size check |
| 8 | TypeScript clean | `tsc --noEmit` exits 0 |

## Out of Scope

- Waveform image export (PNG/SVG) — future enhancement
- Real-time circuit simulation stepping — already implemented
- Cloud-based signal storage — future enhancement
- Multi-user timing comparison — future enhancement
- Timing diagram printing — future enhancement
- Automatic circuit timing optimization suggestions — future enhancement
