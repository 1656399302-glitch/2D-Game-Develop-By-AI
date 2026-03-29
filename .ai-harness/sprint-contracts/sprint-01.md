APPROVED

# Sprint Contract — Round 1

## Scope

**Primary Objective:** Fix the build-breaking TypeScript error by implementing the missing `exportFactionCard()` function and integrating EnhancedShareCard into the ExportModal.

**Theme:** Bug Remediation — Fix build error and complete EnhancedShareCard integration

**Root Cause:** 
- `src/components/Export/ExportModal.tsx` imports `exportFactionCard` from `exportUtils.ts`
- The function is referenced but not defined, causing compilation failure
- This prevents the build from completing (`npm run build` exits non-zero)

**Resolution Required:**
1. Implement `exportFactionCard()` function in `src/utils/exportUtils.ts`
2. Integrate EnhancedShareCard into ExportModal export flow
3. Verify all export formats work (SVG, PNG, Poster, Enhanced, Faction Card)

---

## Spec Traceability

### P0 items (Must Complete)
| Item | Description | Status |
|------|-------------|--------|
| Build Fix | `exportFactionCard` undefined → Implement function in `exportUtils.ts` | BLOCKED |
| Integration | EnhancedShareCard not accessible from UI → Connect to ExportModal | BLOCKED |
| Verification | Build must pass → `npm run build` exits 0 | BLOCKED |

### P1 items (Should Complete)
| Item | Description |
|------|-------------|
| Regression Prevention | Test suite passes → `npm test` shows no new failures |
| Functional Verification | Faction Card export works → SVG/PNG downloads function correctly |

### Remaining P0/P1 after this round
None — Build error fixed, EnhancedShareCard integration complete.

### P2 intentionally deferred
| Item | Reason |
|------|--------|
| AI naming/description assistant integration | Future feature |
| Community share square | Future feature |
| Machine trading/exchange system | Future feature |
| Challenge task mode | Existing challenges preserved; new modes deferred |
| Recipe/Formula unlock system | Future feature |
| Faction technology tree functional unlocks | Visual only; functional effects deferred |

---

## Deliverables

### Files to CREATE
None — all required files exist; this is a remediation sprint.

### Files to MODIFY
| # | File | Change |
|---|------|--------|
| 1 | `src/utils/exportUtils.ts` | Add `exportFactionCard()` function implementation |
| 2 | `src/components/Export/ExportModal.tsx` | Ensure "Faction Card" button present and functional |
| 3 | `src/components/Export/EnhancedShareCard.tsx` | Verify modal opens with faction-colored border |

### Deliverable 1: `exportFactionCard()` Function

**Location:** `src/utils/exportUtils.ts`

**Function signature:**
```typescript
export function exportFactionCard(
  modules: PlacedModule[],
  connections: Connection[],
  attributes: GeneratedAttributes,
  faction: FactionConfig
): string {
  // Generate SVG string matching EnhancedShareCard visual output
  // Include faction-specific border color and theming
  // Return complete SVG markup suitable for download
}
```

**Requirements:**
- Accept `modules`, `connections`, `attributes`, and `faction` parameters
- Return SVG string with faction-colored border matching EnhancedShareCard
- Exportable as `.svg` file via download

---

## Acceptance Criteria

| # | Criterion | Pass Condition | Fail Condition |
|---|-----------|----------------|----------------|
| AC1 | Build passes | `npm run build` exits 0 | Non-zero exit code |
| AC2 | Function exists | `exportFactionCard` defined in exportUtils.ts | Function undefined or not exported |
| AC3 | Five format options | ExportModal displays exactly: SVG, PNG, Poster, Enhanced, Faction Card | Missing or extra options |
| AC4 | Faction Card opens modal | Clicking "Faction Card" shows EnhancedShareCard | Modal does not appear |
| AC5 | Faction border color | Border color matches dominant faction of machine | Neutral/default color regardless of faction |
| AC6 | SVG export works | "Export SVG" downloads `{name}-share-card.svg` | No download or wrong filename |
| AC7 | PNG export works | "Export PNG" downloads `{name}-share-card.png` | No download or wrong filename |
| AC8 | Close navigation | "Close" returns to ExportModal format selection | Navigation fails or broken state |
| AC9 | Tests pass | `npm test` shows no new failures | Any test regression |

---

## Test Methods

### AC1: Build Verification
```bash
npm run build
# Exit code must be 0
echo "Exit code: $?"  # Must be 0
```

### AC2: Function Export Verification
```bash
grep -n "^export function exportFactionCard" src/utils/exportUtils.ts
# Must output: "export function exportFactionCard("
```

### AC3: Format Options Count
```bash
grep -c "Faction Card" src/components/Export/ExportModal.tsx
# Must be >= 1 (button label and handler)
```

### AC4-AC5: Faction Card UI Integration
Manual verification required:
1. Open app in browser
2. Click Export button in toolbar
3. Count format buttons — must be exactly 5
4. Click "Faction Card" button
5. Verify EnhancedShareCard modal appears with faction-colored border

**Test machines for faction detection:**
| Faction | Test Modules | Expected Border Color |
|---------|--------------|----------------------|
| Void | void-siphon, phase-modulator | Purple (#a78bfa) |
| Inferno | fire-crystal, core-furnace | Orange (#f97316) |
| Storm | lightning-conductor, energy-pipe | Cyan (#22d3ee) |
| Stellar | amplifier-crystal, resonance-chamber | Gold (#fbbf24) |

### AC6: SVG Export
```bash
# Manual test:
# 1. Open ExportModal
# 2. Select Faction Card
# 3. Click "Export SVG"
# 4. Verify file downloads with pattern "{machine-name}-share-card.svg"
```

### AC7: PNG Export
```bash
# Manual test:
# 1. Open ExportModal
# 2. Select Faction Card
# 3. Click "Export PNG"
# 4. Verify file downloads with pattern "{machine-name}-share-card.png"
```

### AC8: Close Navigation
```bash
# Manual test:
# 1. Open EnhancedShareCard modal
# 2. Click "Close"
# 3. Verify ExportModal format buttons visible
# 4. Verify no modal state stuck
```

### AC9: Test Suite
```bash
npm test 2>&1 | tail -20
# Must show passing tests with no failures
```

---

## Risks

| # | Risk | Mitigation | Severity |
|---|------|------------|----------|
| R1 | Machine with no faction modules shows neutral styling | EnhancedShareCard handles null faction with gray default border | Low |
| R2 | SVG-to-Canvas PNG export may have CORS issues | Uses blob URLs (already implemented in EnhancedShareCard) | Low |
| R3 | Export timing issues with modal state | Uses setTimeout for export completion (existing pattern) | Low |

---

## Failure Conditions

This round **MUST FAIL** if ANY of the following are true:

| # | Condition | Check Command |
|---|-----------|---------------|
| F1 | `npm run build` exits non-zero | `npm run build; echo $?` |
| F2 | `exportFactionCard` function not defined in exportUtils.ts | `grep "exportFactionCard" src/utils/exportUtils.ts` |
| F3 | ExportModal missing "Faction Card" option | Inspect component code |
| F4 | EnhancedShareCard modal does not open on click | Manual browser test |
| F5 | Any existing tests fail (regression) | `npm test` |

---

## Done Definition

All of the following must be **TRUE** before claiming Round 1 complete:

| # | Criterion | Verification |
|---|-----------|--------------|
| D1 | `npm run build` passes | Run `npm run build`; verify exit code 0 |
| D2 | `exportFactionCard()` function exists | `grep "exportFactionCard" src/utils/exportUtils.ts` finds definition |
| D3 | ExportModal has 5 format options | Inspect component or manual test |
| D4 | "Faction Card" opens EnhancedShareCard | Click button; verify modal renders |
| D5 | Faction border reflects machine faction | Create faction machine; verify border color |
| D6 | SVG export downloads file | Click Export SVG; verify file download |
| D7 | PNG export downloads file | Click Export PNG; verify file download |
| D8 | Close button returns to ExportModal | Click Close; verify format selection visible |
| D9 | `npm test` passes (no regressions) | Run `npm test`; verify all tests pass |

---

## Out of Scope

The following are explicitly **NOT** being done in Round 1:

| Item | Reason |
|------|--------|
| New faction-specific animations beyond existing | EnhancedShareCard animations are sufficient |
| Functional tech tree unlocks | Visual unlocks only; gameplay effects deferred |
| AI text generation integration | Future feature; needs API design |
| Social sharing or community features | Future feature |
| New achievement types | Existing 5 achievements sufficient for MVP |
| New module types or mechanics | Current modules sufficient for MVP |
| Recipe/Formula unlock system | Deferred to future round |
| Performance optimization | Not in scope for bug fix round |
| Mobile-responsive layout changes | Desktop-first; mobile deferred |

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

### Build Error to Fix

**Current error:**
```
src/components/Export/ExportModal.tsx(3,72): error TS2305: 
Module '"../../utils/exportUtils"' has no exported member 'exportFactionCard'.
```

**Fix:** Add `exportFactionCard` function to `src/utils/exportUtils.ts`.

### Faction Color Mapping

| Faction | Hex Color | CSS Variable |
|---------|-----------|--------------|
| Void | #a78bfa | --faction-void |
| Inferno | #f97316 | --faction-inferno |
| Storm | #22d3ee | --faction-storm |
| Stellar | #fbbf24 | --faction-stellar |
| Neutral | #6b7280 | --faction-neutral |

---

## Previous Round Context (Round 7 QA Finding)

**Round 7 QA Finding:** EnhancedShareCard component exists but not integrated into export flow. This is a minor integration gap identified during QA verification.

**Pre-existing state:**
- `src/components/Export/EnhancedShareCard.tsx` exists ✓
- `src/utils/factionCalculator.ts` exists (faction calculator) ✓
- `exportFactionCard` imported in ExportModal but undefined ✗
- EnhancedShareCard not accessible from UI ✗

**This Round's Task:**
1. Implement `exportFactionCard()` to fix build error
2. Ensure EnhancedShareCard is accessible from ExportModal
3. Verify all export formats work correctly

---

*Contract Version: 1.0*
*Status: APPROVED*
