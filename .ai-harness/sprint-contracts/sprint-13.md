APPROVED

# Sprint Contract — Round 13

## Scope

This round focuses on three high-impact enhancements: (1) adding 2 new module types with distinct visual identities and multi-port configurations, (2) enhancing the activation visualization with dramatic screen effects and module-specific animations, and (3) improving the export system with better poster generation. All changes must maintain backward compatibility with existing functionality and pass all existing 202 tests.

## Spec Traceability

- **P0 items covered this round:**
  - Multi-port module system: Add 2 new module types with unique port configurations
  - Activation visualization: Add screen effects (shake, flash, particles) to activation sequence
  - Export system: Enhance poster export with decorative elements and better layout

- **P1 items covered this round:**
  - Module visual consistency: Ensure new modules have cohesive "arcane-mechanical" aesthetic
  - Activation choreography: Module-specific animation timing during activation (core→rune→connectors→output sequence)

- **Remaining P0/P1 after this round:**
  - Community sharing system (deferred to future round)
  - AI naming/description integration (API integration deferred, rule-based fully implemented)
  - Challenge/task mode (deferred)
  - Faction technology tree (deferred)

- **P2 intentionally deferred:**
  - Sound effects and audio system
  - Mobile/touch optimizations
  - Collaborative editing features
  - 3D preview mode

## Deliverables

1. **New Module: Void Siphon** (`src/components/Modules/VoidSiphon.tsx`)
   - Type: `'void-siphon'`
   - Category: `core`
   - Port config: 1 input (top), 2 outputs (bottom, 35px apart)
   - Visual: Dark circular design with purple/void gradients, swirling void patterns, energy absorption effect
   - Animation: Void pull animation on activation (inward spiral)
   - Tags: `['void', 'amplifying']`

2. **New Module: Phase Modulator** (`src/components/Modules/PhaseModulator.tsx`)
   - Type: `'phase-modulator'`
   - Category: `rune`
   - Port config: 2 inputs (left, 25px apart), 2 outputs (right, 25px apart)
   - Visual: Hexagonal design with cyan/electric blue gradients, phase-shift patterns, lightning arcs
   - Animation: Phase-shift flicker animation on activation
   - Tags: `['lightning', 'balancing']`

3. **Type Definitions Update** (`src/types/index.ts`)
   - Add `'void-siphon'` and `'phase-modulator'` to `ModuleType` union
   - Add port configs to `MODULE_PORT_CONFIGS`
   - Add sizes to `MODULE_SIZES`

4. **Activation Effects Enhancement** (`src/components/Preview/ActivationOverlay.tsx`)
   - Screen shake effect during charging phase (intensity: 2px oscillation)
   - Flash overlay during state transitions (100ms white flash at 0.3 opacity)
   - Module-specific activation triggers based on module type, firing in sequence: core modules → rune modules → connectors → output array
   - Particle burst at completion (8 particles radiating outward)

5. **Export Enhancement** (`src/components/Export/ExportModal.tsx` + `src/utils/exportUtils.ts`)
   - Enhanced poster format with decorative corner ornaments
   - Machine name with ornate typography styling
   - Attribute panel with icon indicators
   - Faction emblem placeholder
   - Background gradient based on dominant tag

## Acceptance Criteria

1. **Build succeeds with 0 TypeScript errors** — `npm run build` exits 0

2. **Void Siphon renders correctly** — Diamond/circular void design with purple gradients, 3 ports (1 in top, 2 out bottom), swirl animation on activation

3. **Phase Modulator renders correctly** — Hexagonal design with cyan gradients, 4 ports (2 in left, 2 out right), phase-shift flicker on activation

4. **Both new modules are fully functional** — Can be dragged onto canvas, selected, connected, deleted, and appear in Random Forge

5. **Activation screen effects work** — Charging phase shows subtle shake (2px), state transitions show flash (100ms), particle burst at completion, and each module type triggers its unique animation in sequence (core modules first → rune modules → connectors → output array last)

6. **Enhanced poster export renders** — Export modal shows "Enhanced" option, generates poster with corners, name styling, and attribute icons

7. **All 202+ existing tests pass** — No regressions to existing functionality

8. **Module count verification** — ModulePanel shows 11 total modules (9 previous + 2 new)

9. **Random Forge includes new modules** — Random generation produces machines containing Void Siphon and/or Phase Modulator with correct port configurations

10. **Attribute generation includes new module tags** — Generated attributes reflect `void` and `lightning` tags from new modules

## Test Methods

1. **Build Test**: Run `npm run build` and verify exit code 0, no TypeScript errors

2. **Module Creation Test**: 
   - Open browser, click Void Siphon in panel → verify module appears at viewport center
   - Click Phase Modulator → verify module appears
   - Check footer module count increments

3. **Port Verification Test**:
   - Add Void Siphon → Properties panel shows "Ports: IN, OUT, OUT"
   - Add Phase Modulator → Properties panel shows "Ports: IN, IN, OUT, OUT"
   - Canvas labels show IN/OUT1/OUT2 for multi-port

4. **Connection Test**:
   - Create Core Furnace + Void Siphon + Output Array
   - Connect Core Furnace → Void Siphon (input)
   - Connect Void Siphon outputs → Output Array
   - Verify energy paths render between all connections

5. **Activation Effects Test**:
   - Create machine with 3+ modules and connections
   - Click "Activate Machine"
   - Verify: shake during charging, flash at transitions, particles at completion
   - Verify activation sequence: core modules animate first, then rune modules, then connectors, then output array

6. **Export Test**:
   - Click Export button → Export modal opens
   - Select "Enhanced Poster" option
   - Export as PNG → verify poster contains decorative corners, styled name, attribute icons

7. **Test Suite**: Run `npm test` and verify all 202+ tests pass

8. **Random Forge Test**:
   - Click Random Forge 10+ times
   - Verify Void Siphon and Phase Modulator appear in generated machines
   - Verify generated attributes include `void` and `lightning` tags

## Risks

1. **SVG Animation Complexity** — Screen shake and particle effects may cause performance issues on lower-end devices
   - Mitigation: Use CSS transforms with `will-change` hints, limit particle count to 8

2. **Type System Changes** — Adding new module types requires updates across multiple files
   - Mitigation: Follow existing patterns from Amplifier Crystal and Stabilizer Core

3. **Export Rendering** — Enhanced poster may not render correctly in all browsers
   - Mitigation: Test in Chromium-based browser, provide fallback to simple export

4. **Test Coverage** — New functionality may have edge cases not covered by existing tests
   - Mitigation: Ensure manual verification steps cover critical paths

## Failure Conditions

1. **Build fails** with TypeScript errors or missing imports
2. **Any existing test fails** — regressions not acceptable
3. **New modules cannot be created** on canvas — drag/drop broken
4. **New modules cannot be connected** — port system broken
5. **Activation effects cause crash** — WebGL/Canvas errors
6. **Export produces blank/incomplete image** — missing critical elements
7. **Module count is wrong** — not 11 total modules in panel

## Done Definition

All of the following must be true before claiming round complete:

1. `npm run build` exits 0 with no TypeScript errors
2. `npm test` exits 0 with all tests passing
3. Void Siphon module:
   - Appears in ModulePanel catalog
   - Creates instance when clicked
   - Renders with correct SVG (dark void design, purple gradients)
   - Has 3 ports (1 input top, 2 outputs bottom)
   - Animates with void pull effect on activation
4. Phase Modulator module:
   - Appears in ModulePanel catalog
   - Creates instance when clicked
   - Renders with correct SVG (hexagon, cyan gradients)
   - Has 4 ports (2 inputs left, 2 outputs right)
   - Animates with phase-shift flicker on activation
5. Activation effects:
   - Screen shake visible during charging
   - Flash occurs at state transitions
   - Particles burst at completion
   - Module animations fire in proper sequence (core→rune→connectors→output)
6. Enhanced poster export:
   - Corner ornaments render
   - Machine name has decorative styling
   - Attribute icons display
7. Random Forge includes new modules with correct port labels
8. Attribute generator produces `void` and `lightning` tags for appropriate modules
9. Browser verification confirms all interactions work:
   - Module creation, selection, deletion
   - Connection creation with multi-port modules
   - Activation sequence plays with effects
   - Export generates valid poster image

## Out of Scope

- Audio/sound effects for activation
- Mobile/touch optimizations
- 3D preview mode
- Community sharing features
- AI text generation integration
- Faction technology tree
- Challenge/task mode
- Animated backgrounds in poster export
- Custom user themes
- Module color customization
- Batch export from Codex
- Module grouping/compound modules
