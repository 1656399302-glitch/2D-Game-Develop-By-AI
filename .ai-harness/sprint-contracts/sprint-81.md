APPROVED — Round 81 Sprint Contract

---

# Sprint Contract — Round 81

## Scope

This sprint is a **remediation round** focused on completing the Phase 2 deliverables that were not implemented in Round 80. Phase 1 (factions, achievements, tutorial migration) was successfully completed in Round 80 and verified by QA. This round must implement all Phase 2 deliverables (D1-D10) to satisfy the acceptance criteria from Round 80's contract.

**Note:** Round 80 explicitly stated "Phase 2 deliverables (D1-D10) were NOT implemented due to time constraints." All 10 deliverables must be implemented this round.

## Spec Traceability

### P0 items covered this round
- None (P0 fully complete per Round 77)

### P1 items covered this round
- None (P1 fully complete per Round 77)

### Remaining P0/P1 after this round
- All P0/P1 items complete

### P2 items this round (Phase 2 completion from Round 80)
- D1: FactionBadge component
- D2: complexityAnalyzer utility
- D3: achievementStore persistence
- D4: Auto-generation rules for machine tags
- D5: QuickActionsToolbar component
- D6: KeyboardShortcutsPanel component
- D7: CodexView enhancements (FactionBadge, complexity tier, Duplicate)
- D8: useCanvasPerformance hook
- D9: machinePresets data
- D10: TutorialOverlay (verify exists)

## Deliverables

### 1. FactionBadge Component
- **File:** `src/components/FactionBadge.tsx`
- **Requirements:**
  - 6 faction types with proper icons and colors:
    - `void`: 虚空深渊 (#7B2FBE) 🌑
    - `inferno`: 熔星锻造 (#E85D04) 🔥
    - `storm`: 雷霆相位 (#48CAE4) ⚡
    - `arcane`: 奥术秩序 (#3A0CA3) 🔮
    - `chaos`: 混沌无序 (#9D0208) 💀
    - `stellar`: 星辉派系 (#fbbf24) ✨
  - Component accepts `factionId: FactionId` prop
  - Displays colored badge with faction icon
  - Includes tooltip with faction name

### 2. complexityAnalyzer Utility
- **File:** `src/utils/complexityAnalyzer.ts`
- **Requirements:**
  - Function signature: `analyzeComplexity(modules: PlacedModule[], connections: Connection[]): ComplexityTier`
  - Tier thresholds (deterministic):
    - ≤3 modules = 简陋 (Crude)
    - 4–8 modules = 普通 (Ordinary)
    - 9–15 modules = 精致 (Exquisite)
    - 16–30 modules = 复杂 (Complex)
    - 31+ modules = 史诗 (Epic)
  - Escalation bonuses (each +1 tier, no cap):
    - Connection density > 2.5 → +1 tier
    - ≥3 rare modules → +1 tier (rare = temporal-distorter, ether-infusion-chamber, arcane-matrix-grid)
    - Balanced symmetric layout → +1 tier (aspect ratio 0.4–2.5 AND ≥4 modules)

### 3. achievementStore Persistence
- **File:** `src/store/achievementStore.ts`
- **Requirements:**
  - Zustand store with localStorage persistence (key: `arcane-codex-achievements`)
  - Track unlocked achievement IDs
  - Methods: `unlock(achievementId)`, `isUnlocked(achievementId)`, `getUnlocked()`, `reset()`
  - Achievements tracked:
    - `first-forge`, `first-activation`, `first-export`
    - `faction-void`, `faction-forge`, `faction-phase`, `faction-barrier`, `faction-order`, `faction-chaos`
    - `complex-machine-created`, `apprentice-forge`, `perfect-activation`, `skilled-artisan`

### 4. Auto-Generation Rules
- **File:** `src/utils/attributeGenerator.ts` (extend `generateTags` function)
- **Requirements:** Add these auto-generation rules:
  - Has `core-furnace` → tag: `core-source`
  - Has elemental module (fire-crystal, lightning-conductor, amplifier-crystal) → tag: `elemental`
  - Has rare module (temporal-distorter, ether-infusion-chamber, arcane-matrix-grid) → tag: `advanced-tech`
  - Has ≥5 connections → tag: `highly-connected`
  - Connection density > 2.5 → tag: `dense-circuit`
  - Has `shield-shell` → tag: `protective`
  - Has `rune-node` OR `phase-modulator` → tag: `arcane-enhanced`

### 5. QuickActionsToolbar Component
- **File:** `src/components/QuickActionsToolbar.tsx`
- **Requirements:**
  - Fixed position: bottom-right corner, 8px from edges
  - Actions: Undo, Redo, Zoom Fit, Clear Canvas, Duplicate Selection
  - Visual styling: floating panel with icon buttons
  - Integrates with existing canvas store for undo/redo/zoom

### 6. KeyboardShortcutsPanel Component
- **File:** `src/components/KeyboardShortcutsPanel.tsx`
- **Requirements:**
  - Toggle with `?` key press
  - Close with `?` again OR Escape key
  - Grouped categories: Canvas, Modules, Connections, Export
  - Shortcuts list:
    - Canvas: Space+Drag=Pan, Scroll=Zoom, Ctrl+0=Zoom Fit, Ctrl++=Zoom In, Ctrl+-=Zoom Out
    - Modules: R=Rotate, F=Flip, [=Scale Down, ]=Scale Up, Ctrl+D=Duplicate, Delete=Delete
    - Connections: C=Start Connection, Escape=Cancel
    - Export: Ctrl+S=Save, Ctrl+E=Export

### 7. CodexView Enhancements
- **File:** `src/components/Codex/CodexView.tsx`
- **Requirements:**
  - Integrate FactionBadge component for machine faction display
  - Display complexity tier from complexityAnalyzer
  - Add "Duplicate" button to machine cards
  - Ensure thumbnail preview works

### 8. useCanvasPerformance Hook
- **File:** `src/hooks/useCanvasPerformance.ts`
- **Requirements:**
  - Debounced connection updates (16ms, rAF-aligned)
  - rAF batching for transform updates
  - Hook returns: `{ debouncedUpdate, batchedTransform, isHighPerformance }`

### 9. machinePresets Data
- **File:** `src/data/machinePresets.ts`
- **Requirements:** 5 presets:
  1. `void-reverence` — Void Abyss (void-siphon, void-arcane-gear)
  2. `molten-forge` — Molten Star Forge (inferno-blazing-core, fire-crystal)
  3. `thunder-resonance` — Thunder Phase (lightning-conductor, phase-modulator)
  4. `arcane-matrix` — Arcane Order (core-furnace, rune-node, phase-modulator)
  5. `stellar-harmony` — Stellar (stellar-harmonic-crystal, stabilizer-core)
- Each preset: ≥4 modules, ≥3 connections when loaded

### 10. TutorialOverlay Verification
- **File:** `src/components/Tutorial/TutorialOverlay.tsx`
- **Requirements:** Verify:
  - Exactly 5 steps defined in `TUTORIAL_STEPS` array
  - Steps: place-module, connect-modules, activate-machine, save-to-codex, export-share
  - localStorage flag: `arcane-codex-tutorial-seen`

## Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC0a | Phase 1 migration intact (6 factions, 13 achievements, 5 tutorial steps) | `npx vitest run` passes |
| AC1 | All Phase 2 components exist (D1-D10 files) | File existence check |
| AC2 | FactionBadge renders with correct 6 faction colors | Unit test |
| AC3 | complexityAnalyzer produces deterministic tiers | Unit tests with known inputs |
| AC4 | achievementStore persists across reloads | localStorage verification |
| AC5 | Auto-generation rules produce correct tags | Unit tests per rule |
| AC6 | Keyboard shortcuts panel toggles with `?` key | Browser test |
| AC7 | QuickActionsToolbar buttons work | Unit test |
| AC8 | All 5 presets load with ≥4 modules + ≥3 connections | Unit test per preset |
| AC9 | CodexView shows FactionBadge, complexity, Duplicate button | Code inspection |
| AC10 | Build bundle size < 560KB | `npm run build` |
| AC11 | TypeScript 0 errors | `npx tsc --noEmit` |
| AC12 | Regression: existing tests pass | `npx vitest run` |

## Test Methods

### TM1: File Existence
```bash
ls src/components/FactionBadge.tsx
ls src/utils/complexityAnalyzer.ts
ls src/store/achievementStore.ts
ls src/components/QuickActionsToolbar.tsx
ls src/components/KeyboardShortcutsPanel.tsx
ls src/hooks/useCanvasPerformance.ts
ls src/data/machinePresets.ts
```
Pass: All files exist

### TM2: FactionBadge Colors
Import FactionBadge, render each faction, verify hex colors match contract spec

### TM3: Complexity Analyzer Tests
Test cases:
| Input | Expected |
|-------|----------|
| 2 modules, 1 connection | 简陋 |
| 6 modules, 5 connections | 普通 |
| 12 modules, 8 connections | 精致 |
| 22 modules, 25 connections | 复杂 |
| 40 modules, 20 connections | 史诗 |
| 8 modules, 25 connections (density>2.5) | 复杂 |
| 6 modules, 15 connections, balanced | 精致 |

### TM4: Achievement Persistence
1. Create store instance
2. Call unlock('first-export')
3. Serialize to localStorage
4. Create new store instance (should read from localStorage)
5. Assert 'first-export' is unlocked

### TM5: Auto-Generation Rules
Test each rule:
- { modules: [core-furnace], connections: [] } → includes `core-source`
- { modules: [fire-crystal], connections: [] } → includes `elemental`
- { modules: [temporal-distorter], connections: [] } → includes `advanced-tech`
- { modules: [a,b], connections: [c,d,e,f,g] } (5) → includes `highly-connected`
- { modules: [a], connections: [b,c,d] } (density=3) → includes `dense-circuit`
- { modules: [shield-shell], connections: [] } → includes `protective`
- { modules: [rune-node], connections: [] } → includes `arcane-enhanced`

### TM6: Keyboard Panel
Browser test: Press `?` → panel visible; press `?` or Escape → panel hidden

### TM7: Toolbar Actions
Unit test:
- Click Undo → verify history decrements
- Click Clear Canvas → verify canvas empty
- Click Duplicate → verify selection duplicated

### TM8: Preset Validation
For each of 5 presets:
- Load preset
- Assert modules.length >= 4
- Assert connections.length >= 3

### TM9: Build + TypeScript
```bash
npm run build  # Must output < 560KB
npx tsc --noEmit  # Must show 0 errors
npx vitest run  # Must pass all tests
```

## Test Files Required

| File | Purpose |
|------|---------|
| `src/__tests__/factionBadge.test.tsx` | Faction badge rendering |
| `src/__tests__/complexityAnalyzer.test.ts` | Complexity tier calculation |
| `src/__tests__/achievementStore.test.ts` | Achievement persistence |
| `src/__tests__/autoGeneratedTags.test.ts` | Auto-generation rules |
| `src/__tests__/keyboardShortcutsPanel.test.tsx` | Keyboard panel toggle |
| `src/__tests__/quickActionsToolbar.test.tsx` | Toolbar actions |
| `src/__tests__/machinePresets.test.ts` | Preset loading |

## Risks

1. **Bundle size creep** — Adding 7 new components + utility may exceed 560KB threshold
2. **Integration complexity** — CodexView enhancements require D1+D2 to be complete first
3. **Performance hook timing** — 16ms debounce must not interfere with existing canvas interactions

## Failure Conditions

Round fails if ANY of:
1. Any Phase 2 deliverable file does not exist
2. Build bundle size exceeds 560KB
3. TypeScript errors introduced
4. Any existing test fails (regression)
5. FactionBadge renders with wrong color for any faction
6. Complexity analyzer produces wrong tier for any TM3 test case
7. Auto-generation rule produces wrong tag for any TM5 test case
8. Keyboard panel does not toggle with `?` key
9. Any preset loads with <4 modules or <3 connections

## Done Definition

All must be true:
- [ ] All 8 Phase 2 deliverable files exist (D1: FactionBadge, D2: complexityAnalyzer, D3: achievementStore, D4: attributeGenerator extension, D5: QuickActionsToolbar, D6: KeyboardShortcutsPanel, D8: useCanvasPerformance, D9: machinePresets)
- [ ] `src/__tests__/factionBadge.test.tsx` passes
- [ ] `src/__tests__/complexityAnalyzer.test.ts` passes (all 7 test cases)
- [ ] `src/__tests__/achievementStore.test.ts` passes
- [ ] `src/__tests__/autoGeneratedTags.test.ts` passes (all 7 rules)
- [ ] `src/__tests__/keyboardShortcutsPanel.test.tsx` passes
- [ ] `src/__tests__/quickActionsToolbar.test.tsx` passes
- [ ] `src/__tests__/machinePresets.test.ts` passes (all 5 presets)
- [ ] CodexView has FactionBadge, complexity tier, Duplicate button
- [ ] `npm run build` outputs < 560KB
- [ ] `npx tsc --noEmit` shows 0 errors
- [ ] `npx vitest run` passes (regression + new tests)

## Out of Scope

- AI naming/description integration
- Backend/server features
- Mobile-specific layouts
- Language localization beyond defaults
- Rune recipe unlock system
- Faction technology tree expansion
- Challenge task mode
- Codex trading system
