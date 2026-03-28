# APPROVED — Sprint Contract Round 8

## Scope

**Feature Enhancement Sprint:** Integrate the existing random generator into the UI and add a "Random Forge" button for one-click machine generation, as specified in the MVP requirements.

## Spec Traceability

### P0 items (Spec Requirement - Random Generation)
- **Random Forge Button** — Integrate `generateRandomMachine()` into UI with a "🎲 Random Forge" button in the Toolbar or Module Panel
- **Attribute Generation on Random** — When generating random machine, also generate attributes using `generateAttributes()`
- **Load Random Machine to Canvas** — Generated machine should load into the canvas via `loadMachine()`

### P1 items (Verification)
- **Random Generation Works** — Clicking Random Forge creates 2-6 modules with valid connections
- **Attributes Auto-Generated** — Generated machine has name, rarity, stats, tags, description
- **Existing Features Unaffected** — Manual module editing, connections, activation, export, and codex all continue to work

### Remaining P0/P1 after this round
- All P0/P1 items from spec are covered after this round completes

### P2 items (Deferred)
- AI naming assistant integration
- Community sharing features
- Challenge/task mode
- Faction tech tree system
- Local storage for codex entries (currently uses zustand persist which is fine for MVP)

## Deliverables

1. **Random Forge Button** — Visible button in Toolbar or ModulePanel that triggers `generateRandomMachine()`
2. **Integrated Random Generation** — `handleRandomForge()` function that:
   - Calls `generateRandomMachine()` from `utils/randomGenerator.ts`
   - Calls `generateAttributes()` from `utils/attributeGenerator.ts`
   - Loads result via `loadMachine()` into canvas
   - Shows brief feedback (e.g., "Machine Forged!" toast)
3. **Test coverage for random generation** — Unit tests verifying random generation produces valid modules/connections

## Acceptance Criteria

1. **Random Forge Button Visible** — A "🎲 Random Forge" button appears in the editor UI (Toolbar or ModulePanel)
2. **Clicking Generates Modules** — Clicking the button creates 2-6 modules on the canvas
3. **Connections Created** — Generated machine has at least 1 valid connection between modules
4. **Attributes Available** — After generation, attributes can be accessed (name, rarity, stats)
5. **Can Save to Codex** — Generated machine can be saved to codex via "Save to Codex" button
6. **Can Export** — Generated machine can be exported (SVG/PNG/Poster)
7. **Can Activate** — Generated machine can be activated with working animations
8. **Undo Works** — Ctrl+Z undoes the random generation, restoring empty canvas

## Test Methods

1. **Click test** — Click Random Forge button and verify modules appear on canvas
2. **Module count verification** — Verify generated module count is between 2-6
3. **Connection verification** — Verify at least 1 connection exists when 2+ modules generated
4. **Attribute check** — Call `generateAttributes()` on generated modules and verify non-empty result
5. **Regression test** — Run `npm test` to ensure existing tests still pass
6. **Build test** — Run `npm run build` to ensure 0 TypeScript errors

## Risks

1. **UI placement** — Button should be prominent but not interfere with existing workflow
2. **Validation failures** — Some random generations might produce validation errors (should be rare with current algorithm)
3. **State conflict** — If user has unsaved work, random forge should either warn or replace (replace is acceptable for MVP)

## Failure Conditions

1. **Random Forge button not visible** — No button to trigger random generation
2. **Clicking button causes error** — Console error or crash when clicking Random Forge
3. **Generated machine has no modules** — Empty canvas after clicking Random Forge
4. **npm test fails** — Existing tests broken by new code
5. **npm run build fails** — TypeScript errors introduced

## Done Definition

All of the following must be true before claiming round complete:

1. ✅ Random Forge button visible in editor UI
2. ✅ Clicking button creates 2-6 modules on canvas
3. ✅ Generated machine has at least 1 valid connection (if modules ≥ 2)
4. ✅ `npm test` passes (all 158+ tests)
5. ✅ `npm run build` succeeds with 0 TypeScript errors
6. ✅ No console errors on Random Forge click
7. ✅ Generated machine is fully functional (can activate, export, save to codex)

## Out of Scope

- Adding new module types (7 types already exist)
- Modifying existing module SVG designs
- Changing activation animation behavior
- Modifying connection engine logic
- Changing attribute generation rules
- Adding AI naming integration
- Adding community/social features
- Code refactoring unrelated to random generation integration
- Adding challenge/task mode
- Adding faction tech tree
