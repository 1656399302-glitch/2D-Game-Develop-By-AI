APPROVED — Round 8 Contract

---

# Sprint Contract — Round 8

## Scope

**Primary Objective:** Integrate `EnhancedShareCard` into the ExportModal as a selectable "Faction Card" format option.

**Theme:** Bug Remediation

This round addresses the single minor bug identified in Round 7's QA evaluation: the `EnhancedShareCard` component exists and is properly implemented but is not accessible from the main UI.

---

## Spec Traceability

### P0 items covered this round
- **Bug Fix:** EnhancedShareCard not integrated into ExportModal → Integrate as 5th format option

### P1 items covered this round
- **None** — All P1 items from prior rounds are complete

### Remaining P0/P1 after this round
- None

### P2 intentionally deferred
- AI naming/description assistant integration
- Community share square
- Machine trading/exchange system
- Challenge task mode
- Rune recipe unlock system
- Faction technology tree unlocks (visual only, no functional unlocks)

---

## Deliverables

1. **`src/components/Export/ExportModal.tsx`** (modified)
   - Add `'faction-card'` to `ExportFormat` type
   - Add "Faction Card" as 5th format button in the format selection grid
   - When selected, render `EnhancedShareCard` component with:
     - `faction` prop from `calculateFaction(modules)`
     - `attributes` from `generateAttributes(modules, connections)`
     - `modules` and `connections` from store
     - `onExportSVG` and `onExportPNG` callbacks
     - `onClose` callback returning to format selection

2. **`src/utils/exportUtils.ts`** (modified)
   - Add `exportFactionCard()` function that generates SVG data for EnhancedShareCard
   - Return modular SVG string suitable for the faction-branded card format

3. **`src/__tests__/enhancedShareCard.integration.test.ts`** (new file)
   - Test: ExportModal includes 'faction-card' in format options
   - Test: Selecting 'faction-card' renders EnhancedShareCard
   - Test: Faction is correctly calculated from module composition
   - Test: Export callbacks are invoked on button click

---

## Acceptance Criteria

1. **[AC1]** ExportModal displays 5 format options: SVG, PNG, Poster, Enhanced, **Faction Card**
2. **[AC2]** Selecting "Faction Card" shows EnhancedShareCard with faction-colored border
3. **[AC3]** Faction is auto-calculated from current machine's module composition via `calculateFaction()`
4. **[AC4]** Export SVG button in EnhancedShareCard downloads a `.svg` file
5. **[AC5]** Export PNG button in EnhancedShareCard downloads a `.png` file
6. **[AC6]** Close button in EnhancedShareCard returns to ExportModal format selection
7. **[AC7]** `npm run build` exits with code 0 (no TypeScript errors)
8. **[AC8]** `npm test` shows no NEW test failures (existing tests continue to pass)

---

## Test Methods

### AC1-AC2: Faction Card UI Integration
1. Open ExportModal
2. Verify 5 format buttons visible: SVG, PNG, Poster, Enhanced, Faction Card
3. Click "Faction Card" button
4. Verify EnhancedShareCard modal appears with faction-colored border

### AC3: Faction Calculation
1. Place 3+ void-siphon or phase-modulator modules → verify purple border
2. Place 3+ fire-crystal or core-furnace modules → verify orange border
3. Place 3+ lightning-conductor or energy-pipe modules → verify cyan border

### AC4-AC5: Export Functions
1. Click "Export SVG" in EnhancedShareCard
2. Verify file downloads with pattern `{machine-name}-share-card.svg`
3. Click "Export PNG" in EnhancedShareCard
4. Verify file downloads with pattern `{machine-name}-share-card.png`

### AC6: Close Navigation
1. Click "Close" in EnhancedShareCard
2. Verify modal returns to ExportModal format selection
3. Original 5 format buttons visible

### AC7: Build Verification
```bash
npm run build
# Exit code must be 0
```

### AC8: Test Suite
```bash
npm test
# All existing tests pass
# No new failures introduced
```

---

## Risks

| Risk | Description | Mitigation | Severity |
|------|-------------|------------|----------|
| R1 | Machine with no faction modules shows neutral styling | EnhancedShareCard handles null faction with gray default | Low |
| R2 | SVG-to-Canvas PNG export may have CORS issues | Uses blob URLs (already implemented in existing code) | Low |
| R3 | Modal state conflict between ExportModal and EnhancedShareCard | Use local state `showFactionCard: boolean` | Low |

---

## Failure Conditions

This round **MUST FAIL** if:

1. `npm run build` exits non-zero — TypeScript compilation errors
2. EnhancedShareCard remains inaccessible from ExportModal
3. Faction theming not applied — all cards show same color regardless of machine
4. Export buttons do not trigger file downloads
5. Any existing tests now fail (regression)

---

## Done Definition

All of the following must be TRUE before claiming Round 8 complete:

1. ✅ ExportModal has exactly 5 format options including "Faction Card"
2. ✅ Selecting "Faction Card" shows EnhancedShareCard modal
3. ✅ Faction border color reflects machine's dominant faction
4. ✅ SVG and PNG export buttons work in EnhancedShareCard
5. ✅ Close button returns to ExportModal
6. ✅ `npm run build` passes (0 TypeScript errors)
7. ✅ `npm test` passes (no regressions)
8. ✅ Integration test file created with ≥4 passing tests

---

## Out of Scope

The following are explicitly NOT being done in Round 8:

- ❌ Adding new faction-specific animations beyond what EnhancedShareCard already has
- ❌ Implementing functional tech tree unlocks
- ❌ AI text generation integration
- ❌ Social sharing or community features
- ❌ Additional achievement types
- ❌ New module types or mechanics
- ❌ Browser verification of other R7 components (already verified in R7 QA)
- ❌ Performance optimization
- ❌ Mobile-responsive layout changes
- ❌ Tutorial content

---

## Technical Notes

### Integration Flow

```
ExportModal
  │
  ├── format: 'svg' | 'png' | 'poster' | 'enhanced-poster'
  │     └── Existing export flow unchanged
  │
  └── format: 'faction-card'
        └── EnhancedShareCard (full-screen modal)
              ├── Props: faction, attributes, modules, connections
              ├── Export buttons: handleExportSVG, handleExportPNG
              └── Close: returns to format selection
```

### Faction Calculation

```typescript
import { calculateFaction } from '../../utils/factionCalculator';

// In ExportModal:
const dominantFaction = calculateFaction(modules);
const attributes = generateAttributes(modules, connections);
```

### State Management

```typescript
const [format, setFormat] = useState<ExportFormat>('svg');
const [showFactionCard, setShowFactionCard] = useState(false);

// In format selection:
{format === 'faction-card' ? (
  <EnhancedShareCard
    faction={dominantFaction}
    attributes={attributes}
    modules={modules}
    connections={connections}
    onExportSVG={handleExport}
    onExportPNG={handleExport}
    onClose={() => setShowFactionCard(false)}
  />
) : (
  // Standard export modal UI
)}
```
