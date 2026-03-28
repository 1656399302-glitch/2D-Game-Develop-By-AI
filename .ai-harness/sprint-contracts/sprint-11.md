# Sprint Contract — Round 11

## Scope

**Feature Enhancement Sprint**: Implement the Multi-Port System infrastructure required for multi-port modules, add two new multi-port module types (Amplifier Crystal with 1 input + 2 outputs, Stabilizer Core with 2 inputs + 1 output), enhance energy path animation parameters, and add connection port visibility improvements to the editor.

**NOT in scope**: Module count display in footer, AI text generation, challenge mode, faction tech tree, recipe unlock system, new module categories beyond the two specified types.

## Spec Traceability

- **P0 items covered this round** (required infrastructure for feature completeness):
  1. Multi-Port System Refactor: Update MODULE_PORT_CONFIGS to support array-based port definitions, refactor getDefaultPorts() to handle multi-port configurations, update ModuleRenderer to render dynamic port counts
  2. Amplifier Crystal module (rune category): 1 input port, 2 output ports, crystal/prism SVG aesthetic
  3. Stabilizer Core module (core category): 2 input ports, 1 output port, harmonic ring SVG aesthetic
  4. Energy path animation parameter tuning: glow intensity multiplier, pulse timing constants
  5. Connection port visibility: port indicator size increase, hover state contrast improvement

- **P1 items deferred to future round**:
  - Module count display in footer (real-time update on drag)

- **Remaining P0/P1 after this round**: 
  - All previously completed features remain intact
  - Future P0: None identified at this time
  - Future P1: Module count footer display

- **P2 items intentionally deferred**:
  - AI text generation interface
  - Challenge mode
  - Faction tech tree
  - Recipe unlock system
  - Additional module categories beyond the two new types

## Deliverables

### 1. Multi-Port System Refactor (Required Infrastructure)

#### 1a. Type System Update (`src/types/index.ts`)
```typescript
// Update MODULE_PORT_CONFIGS to support arrays for multi-port modules
export const MODULE_PORT_CONFIGS: Record<ModuleType, { 
  input: { x: number; y: number } | { x: number; y: number }[];
  output: { x: number; y: number } | { x: number; y: number }[];
}>;

// Update ModuleDefinition portConfig structure
export interface ModuleDefinition {
  // ... existing fields
  portConfig: {
    inputs: { x: number; y: number }[];
    outputs: { x: number; y: number }[];
  };
}
```

#### 1b. getDefaultPorts Refactor (`src/utils/randomGenerator.ts`)
```typescript
const getDefaultPorts = (type: ModuleType): Port[] => {
  const config = MODULE_PORT_CONFIGS[type];
  const ports: Port[] = [];
  
  // Handle array or single port for inputs
  const inputConfig = Array.isArray(config.input) ? config.input : [config.input];
  inputConfig.forEach((pos, idx) => {
    ports.push({ id: `${type}-input-${idx}`, type: 'input', position: pos });
  });
  
  // Handle array or single port for outputs
  const outputConfig = Array.isArray(config.output) ? config.output : [config.output];
  outputConfig.forEach((pos, idx) => {
    ports.push({ id: `${type}-output-${idx}`, type: 'output', position: pos });
  });
  
  return ports;
};
```

#### 1c. ModuleRenderer Update (`src/components/Modules/ModuleRenderer.tsx`)
- Update port rendering to handle dynamic port counts based on module type
- Ensure multiple output ports are vertically spaced with 40px separation
- Ensure multiple input ports are vertically spaced with 30px separation

#### 1d. Connection Creation Update (`src/store/useMachineStore.ts`)
- Update `startConnection` to track selected port ID (not just module ID)
- Update `completeConnection` to connect to specific port IDs
- Maintain backward compatibility with existing single-port modules

### 2. New Module: Amplifier Crystal (`src/components/Modules/AmplifierCrystal.tsx`)
- Category: rune
- Color scheme: magenta/purple (#a855f7 primary, #9333ea secondary)
- Port configuration: 1 input (left, y=40), 2 outputs (right, y=20 and y=60)
- Dimensions: 80×80 pixels
- SVG visual: Diamond/prism shape with internal facet lines, glowing core center
- Visual effects: Subtle pulse animation on activation (0.8s cycle)
- Entry in MODULE_CATALOG with crystal icon

### 3. New Module: Stabilizer Core (`src/components/Modules/StabilizerCore.tsx`)
- Category: core
- Color scheme: green/teal (#22c55e primary, #4ade80 secondary)
- Port configuration: 2 inputs (left, y=25 and y=55), 1 output (right, y=40)
- Dimensions: 80×80 pixels
- SVG visual: Octagonal shape with concentric ring pattern, center stabilization symbol
- Visual effects: Synchronized ring pulse on activation (1.2s cycle)
- Entry in MODULE_CATALOG with stabilizer icon

### 4. Module Panel Updates (`src/components/Editor/ModulePanel.tsx`)
- Add Amplifier Crystal to MODULE_CATALOG under "rune" category
- Add Stabilizer Core to MODULE_CATALOG under "core" category
- Update CATEGORY_COLORS: rune=#a855f7, core=#22c55e
- Add module preview icons for both types

### 5. Energy Path Animation Enhancements (`src/components/Connections/EnergyPath.tsx`)
- Increase glow filter stdDeviation from 2 to 4 during active state
- Adjust pulse animation duration from 1s to 0.8s
- Add secondary glow layer at 50% opacity for depth

### 6. Connection Port Visibility Improvements (`src/components/Modules/ConnectionPort.tsx`)
- Increase port indicator radius from 4px to 6px
- Increase hover state radius from 6px to 8px
- Increase hover state opacity from 0.7 to 0.9 for better contrast

## Acceptance Criteria

### Multi-Port System (Critical Infrastructure)
1. **Build succeeds**: `npm run build` exits 0 with 0 TypeScript errors
2. **Amplifier Crystal renders 3 ports**: Exactly 1 input port (left side) and 2 output ports (right side, vertically spaced 40px apart)
3. **Stabilizer Core renders 3 ports**: Exactly 2 input ports (left side, vertically spaced 30px apart) and 1 output port (right side)
4. **Single-port modules unchanged**: Existing modules (core-furnace, energy-pipe, etc.) still render with exactly 1 input + 1 output port
5. **Connections work with multi-port modules**: Can connect from any output to any input port; connection endpoints attach to correct port positions

### New Modules
6. **Amplifier Crystal has correct SVG**: Diamond/prism shape with facet lines and glowing core, rendered in magenta/purple colors
7. **Stabilizer Core has correct SVG**: Octagonal shape with concentric rings, rendered in green/teal colors
8. **Both modules are draggable**: Drag from panel to canvas creates module instance
9. **Both modules are selectable**: Click selects module and shows selection highlight
10. **Both modules are deletable**: Delete key removes selected module

### Integration
11. **Random Forge includes new modules**: After 10+ random generations, at least one of each new module type appears
12. **Random Forge port generation correct**: Multi-port modules in random layouts have correct port configurations
13. **Tests pass**: `npm test` exits 0 with all tests passing (baseline: 202 tests)

### Animation Enhancements
14. **Glow intensity increased**: Energy path glow filter stdDeviation is 4 during active state (verified in code)
15. **Pulse timing adjusted**: Energy path pulse duration is 0.8s (verified in code)

### Port Visibility
16. **Port indicators larger**: ConnectionPort default radius is 6px (verified in code)
17. **Hover contrast improved**: ConnectionPort hover opacity is 0.9 (verified in code)

## Test Methods

### 1. Build Verification
```bash
npm run build
```
- **Pass**: Exit code 0, 0 TypeScript errors
- **Fail**: Exit code non-zero or any TypeScript errors

### 2. Multi-Port System Code Review
Verify in source code:
- `MODULE_PORT_CONFIGS['amplifier-crystal']` has `input: {x,y}` (single) and `output: [{x,y}, {x,y}]` (array of 2)
- `MODULE_PORT_CONFIGS['stabilizer-core']` has `input: [{x,y}, {x,y}]` (array of 2) and `output: {x,y}` (single)
- `getDefaultPorts('amplifier-crystal')` returns exactly 3 ports: 1 input, 2 outputs
- `getDefaultPorts('stabilizer-core')` returns exactly 3 ports: 2 inputs, 1 output

### 3. Amplifier Crystal Visual Test
- Create new machine, drag Amplifier Crystal to canvas
- Count ports: Should see exactly 1 input port (left side) and 2 output ports (right side, one higher, one lower)
- Verify SVG: Diamond/prism shape visible with magenta glow (#a855f7)
- Take screenshot for verification

### 4. Stabilizer Core Visual Test
- Create new machine, drag Stabilizer Core to canvas
- Count ports: Should see exactly 2 input ports (left side, vertically separated) and 1 output port (right side)
- Verify SVG: Octagonal shape with concentric rings visible in teal (#22c55e)
- Take screenshot for verification

### 5. Multi-Port Connection Test
- Place Amplifier Crystal on canvas
- Place Stabilizer Core on canvas
- Connect core-furnace output → Amplifier input
- Connect Amplifier output-1 → Stabilizer input-1
- Connect Amplifier output-2 → Stabilizer input-2
- Verify: All 3 connections render without errors
- Activate machine: Energy flows through multi-port chain correctly

### 6. Single-Port Regression Test
- Create new machine with existing modules only (core-furnace, energy-pipe, gear, rune-node, shield-shell, trigger-switch, output-array)
- Verify: Each module shows exactly 1 input port + 1 output port
- Verify: Connections work as before

### 7. Animation Parameter Verification
In `src/components/Connections/EnergyPath.tsx`:
- Verify `filter="url(#glow)"` stdDeviation is 4 for active state
- Verify CSS animation duration is 0.8s for `.energy-pulse`

### 8. Port Visibility Verification
In `src/components/Modules/ConnectionPort.tsx`:
- Verify default `r` (radius) prop or constant is 6
- Verify hover state opacity is 0.9

### 9. Random Forge Test
- Click "Random Forge" button 10+ times
- Track which module types appear
- **Pass criteria**: At least one Amplifier Crystal AND at least one Stabilizer Core appear across the 10 generations

### 10. Test Suite
```bash
npm test
```
- **Pass**: Exit code 0, all tests pass
- **Fail**: Any test failures

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Multi-port refactor breaks existing single-port modules | Medium | High | Update MODULE_PORT_CONFIGS for ALL modules to use consistent array format; add type guard in getDefaultPorts |
| Port ID collision with existing connection logic | Medium | High | Use `${type}-input-${idx}` pattern where idx=0 for single ports; existing `${type}-input` IDs preserved for idx=0 |
| TypeScript errors with union type in port configs | Medium | Medium | Explicitly type the config union; use type guard `Array.isArray()` before iteration |
| New modules don't appear in Random Forge | Low | Low | Add new types to AVAILABLE_MODULE_TYPES array; weight selection probability if needed |
| Animation changes too subtle to notice | Low | Low | Accept based on parameter verification (stdDeviation=4, duration=0.8s); these are measurable |
| Build fails due to missing module registry entries | Medium | High | Add entries to MODULE_CATALOG, MODULE_SIZES, MODULE_PORT_CONFIGS, ModuleType union, and ModuleRenderer switch |

## Failure Conditions

**The round FAILS if ANY of the following occur:**

1. `npm run build` exits non-zero OR has TypeScript errors
2. `npm test` exits non-zero OR has test failures
3. Amplifier Crystal does not render with exactly 1 input + 2 output ports
4. Stabilizer Core does not render with exactly 2 input + 1 output ports
5. Any existing module (core-furnace, energy-pipe, gear, rune-node, shield-shell, trigger-switch, output-array) renders with wrong port count
6. Cannot create connections through multi-port modules
7. Existing features regress: drag, select, connect, activate, export, or codex stop working
8. Amplifier Crystal or Stabilizer Core SVG does not match design spec (wrong shape or color)
9. Energy path animation parameters not updated (stdDeviation not 4, duration not 0.8s)
10. Port visibility parameters not updated (radius not 6, hover opacity not 0.9)

## Done Definition

**All conditions must be TRUE before claiming round complete:**

1. [ ] `src/types/index.ts` contains ModuleType entries for 'amplifier-crystal' and 'stabilizer-core'
2. [ ] `src/types/index.ts` contains MODULE_PORT_CONFIGS entries for new modules with correct port arrays
3. [ ] `src/types/index.ts` contains MODULE_SIZES entries for new modules (80×80)
4. [ ] `src/utils/randomGenerator.ts` getDefaultPorts() handles array-based port configs
5. [ ] `src/components/Modules/ModuleRenderer.tsx` renders dynamic port counts per module type
6. [ ] `src/components/Modules/AmplifierCrystal.tsx` exists with correct SVG (diamond/prism, magenta colors)
7. [ ] `src/components/Modules/StabilizerCore.tsx` exists with correct SVG (octagon/rings, teal colors)
8. [ ] `src/components/Modules/AmplifierCrystal.tsx` renders exactly 1 input port + 2 output ports
9. [ ] `src/components/Modules/StabilizerCore.tsx` renders exactly 2 input ports + 1 output port
10. [ ] `src/components/Editor/ModulePanel.tsx` includes both modules in MODULE_CATALOG with correct category and colors
11. [ ] `src/components/Connections/EnergyPath.tsx` has glow stdDeviation=4 for active state
12. [ ] `src/components/Connections/EnergyPath.tsx` has pulse animation duration=0.8s
13. [ ] `src/components/Modules/ConnectionPort.tsx` has default radius=6px
14. [ ] `src/components/Modules/ConnectionPort.tsx` has hover opacity=0.9
15. [ ] `npm run build` exits 0 with 0 TypeScript errors
16. [ ] `npm test` exits 0 with all tests passing
17. [ ] Manual verification: Amplifier Crystal visual matches spec (diamond shape, magenta glow, correct ports)
18. [ ] Manual verification: Stabilizer Core visual matches spec (octagon shape, teal glow, correct ports)
19. [ ] Manual verification: Can create 3+ connections through a multi-port module chain
20. [ ] Manual verification: Single-port modules unchanged (1 input + 1 output each)

## Out of Scope

The following are explicitly NOT being done in this round:

- **Module count display in footer**: Real-time module count updates were P1 in previous rounds but are deferred to a future round
- **AI text generation interface**: AI-powered naming and description generation is P2 deferred
- **Challenge mode or tasks**: Gamified challenges are P2 deferred
- **Faction tech tree**: Faction progression system is P2 deferred
- **Recipe unlock system**: Unlockable recipes/gateways are P2 deferred
- **Additional module types beyond Amplifier Crystal and Stabilizer Core**
- **Major UI/UX redesign**: Visual style changes beyond specified animation and visibility improvements
- **Backend or database integration**: All data remains client-side in localStorage
- **Multi-user features**: No collaboration or sharing features beyond export
- **Audio effects**: No sound implementation
- **Mobile responsive layout**: Layout optimizations for mobile are deferred
- **Dark/light theme switching**: Theme toggle is deferred
- **Custom module creation by users**: User-generated modules are P2 deferred
- **Tutorial or onboarding flow**: Guided tutorial is deferred
