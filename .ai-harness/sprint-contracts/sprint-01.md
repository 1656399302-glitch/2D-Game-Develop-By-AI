# Sprint Contract — Round 1 (REVISED)

## Scope

This sprint establishes the **MVP foundation** for the Arcane Machine Codex Workshop. The goal is to build a fully functional, interactive SVG-based magic machine editor with core features that can demonstrate the core value proposition. This is not a feature-complete product—it is a working prototype that proves the concept and provides a solid base for future iterations.

The sprint prioritizes:
1. **A working editor** with drag-and-drop, rotation, scaling, selection, and deletion
2. **6 core SVG module types** with distinct visual identities and animations
3. **Energy connection system** with visual path rendering
4. **Activation preview** with layered animations
5. **Attribute generation** based on module composition
6. **Codex save/load** using localStorage
7. **SVG and PNG export**

**Tech Stack (locked):** React 18 + TypeScript + Vite + Zustand + Tailwind CSS + GSAP (for complex animations)

---

## Spec Traceability

### P0 items (Must Have — MVP core)
| Spec Requirement | Round 1 Implementation |
|-----------------|------------------------|
| 机械装置编辑器 (Machine Editor) | Canvas with drag-drop, rotate, scale, delete, undo/redo, grid snapping |
| 模块类型 (Core Furnace, Energy Pipe, Gear, Rune Node, Shield Shell, Trigger Switch) | 6 SVG modules with distinct visuals and animations |
| 能量连接系统 (Energy Connection) | Click-to-connect ports, animated path rendering, basic flow visualization |
| 激活预览系统 (Activation Preview) | Multi-state animation (idle → charging → active), machine-level orchestration |
| 机器属性生成 (Attribute Generation) | Rule-based generator producing name, rarity, tags, stats |
| 图鉴系统 (Codex System) | Save to localStorage, list view, detail view, delete |
| 导出能力 (Export) | SVG export, PNG export |

### P1 items (Deferred — Future rounds)
- 法阵输出 (Output Array) module type
- Module color customization
- Module grouping
- Advanced snap/alignment tools
- Undo/redo history panel
- Multiple machine slots
- AI naming integration interface
- Community sharing
- Challenge/task modes
- Faction technology trees

### P2 intentionally deferred
- Animated background patterns
- Sound effects
- 3D perspective view
- Collaborative editing
- Cloud sync

---

## Deliverables

### 1. Core Application Structure
```
src/
├── components/
│   ├── Editor/
│   │   ├── Canvas.tsx          # Main SVG canvas with pan/zoom
│   │   ├── ModulePanel.tsx     # Left sidebar module palette
│   │   ├── PropertiesPanel.tsx # Right sidebar for selected module
│   │   └── Toolbar.tsx        # Top toolbar with actions
│   ├── Modules/
│   │   ├── CoreFurnace.tsx     # SVG module component
│   │   ├── EnergyPipe.tsx
│   │   ├── Gear.tsx
│   │   ├── RuneNode.tsx
│   │   ├── ShieldShell.tsx
│   │   └── TriggerSwitch.tsx
│   ├── Connections/
│   │   ├── EnergyPath.tsx      # Animated connection line
│   │   └── ConnectionManager.tsx
│   ├── Preview/
│   │   ├── ActivationOverlay.tsx
│   │   └── MachineAnimator.tsx
│   ├── Codex/
│   │   ├── CodexList.tsx
│   │   └── CodexDetail.tsx
│   └── Export/
│       ├── ExportModal.tsx
│       └── PosterGenerator.tsx
├── store/
│   ├── useMachineStore.ts      # Zustand store for machine state
│   └── useCodexStore.ts        # Zustand store for saved machines
├── utils/
│   ├── attributeGenerator.ts   # Rule-based attribute generation
│   ├── connectionEngine.ts     # Path calculation logic
│   └── exportUtils.ts          # SVG/PNG export helpers
├── types/
│   └── index.ts                # TypeScript interfaces
└── App.tsx
```

### 2. Module Data Model
```typescript
interface ModuleDefinition {
  id: string;
  type: ModuleType;
  name: string;
  category: 'core' | 'pipe' | 'gear' | 'rune' | 'shield' | 'trigger';
  ports: { id: string; type: 'input' | 'output'; position: { x: number; y: number } }[];
  attributes: { energy: number; stability: number; power: number };
  svgTemplate: string; // or inline SVG component
  animations: AnimationConfig;
}

interface MachineInstance {
  id: string;
  name: string;
  modules: PlacedModule[];
  connections: Connection[];
  attributes: GeneratedAttributes;
  createdAt: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}
```

### 3. Working Interactive Editor
- Drag modules from palette onto canvas
- Select, move, rotate (90° increments), delete modules
- Grid snapping (optional toggle)
- Pan and zoom canvas
- Undo/Redo (Ctrl+Z / Ctrl+Y)
- Clear canvas

### 4. 6 SVG Module Types
Each module includes:
- Unique SVG design (procedurally styled, no external assets)
- Idle state animation
- Active state animation
- Input/output port markers
- Hover and selection states

| Module | Visual Theme | Animation |
|--------|-------------|-----------|
| Core Furnace | Hexagonal core with pulsing glow | Breathing pulse, energy core |
| Energy Pipe | Curved metallic tube | Energy flow particles |
| Gear | Interlocking cog wheels | Rotation |
| Rune Node | Circular rune with symbols | Rune rotation, glow pulse |
| Shield Shell | Arcane protective barrier | Shimmer effect |
| Trigger Switch | Lever/button mechanism | Click animation, spark |

### 5. Energy Connection System
- Click output port → drag to input port to connect
- Animated dashed line with flowing particles
- Visual feedback on valid/invalid connections
- Connection affects attribute calculations

### 6. Activation Preview System
- "Activate Machine" button triggers orchestration
- State machine: `idle` → `charging` (1s) → `active` (3s) → `complete`
- Modules animate in sequence based on connection graph
- Energy flows visually from core outward
- "Overload" and "Failure" modes as special triggers

### 7. Attribute Generator
Based on:
- Module types present
- Connection count and topology
- Energy balance (input/output ratio)

Outputs:
- Machine name (rule-based: [Prefix] + [Type] + [Suffix])
- Rarity (calculated from complexity)
- Stats: Stability, Power Output, Energy Cost, Failure Rate
- Attribute tags: Fire, Lightning, Arcane, Void, Mechanical, etc.
- Description text

### 8. Codex System
- "Save to Codex" captures current machine state
- Codex list shows thumbnails with name, rarity, date
- Codex detail view with full machine preview
- Delete functionality
- Load from codex to editor

### 9. Export Capabilities
- **SVG Export**: Clean SVG with all modules and connections
- **PNG Export**: Rasterized image at 2x resolution
- **Poster Export**: Styled card with title, machine, stats, decorative border

---

## Acceptance Criteria

### Editor Functionality
- [ ] User can drag any of the 6 module types from the panel onto the canvas
- [ ] Modules can be selected (single click), showing selection highlight
- [ ] Selected modules can be deleted with Delete key or button
- [ ] Selected modules can be rotated 90° clockwise with R key
- [ ] Canvas supports pan (middle mouse or space+drag) and zoom (scroll wheel)
- [ ] Grid background is visible for alignment reference
- [ ] Undo reverses last add/delete/move action
- [ ] Redo restores undone action

### Module Rendering
- [ ] Each of the 6 modules renders with SVG graphics and has a unique `type` value in the data model
- [ ] Modules display input/output ports as small circles
- [ ] Hovering a module shows hover highlight (CSS class change)
- [ ] Selected module shows border highlight (CSS class change)

### Connection System
- [ ] Clicking an output port enters connection mode
- [ ] Dragging to an input port creates a connection line
- [ ] Connection line is visible as animated dashed path (stroke-dashoffset animates)
- [ ] Clicking a connection line and pressing Delete removes it
- [ ] Cannot connect output to output or input to input (validation prevents it)

### Activation Animation
- [ ] "Activate" button triggers machine animation
- [ ] Animation sequence follows connection graph (core outward) - modules start animating at different timestamps
- [ ] All 6 module types show active animations (verified by animation-duration > 0)
- [ ] Energy particles flow along connection paths during activation (particle elements exist in DOM)
- [ ] Animation completes within 5 seconds total (1s charging + 3s active + 1s completion)

### Attribute Generation
- [ ] Machine attributes (name, rarity, stats, tags) are generated on demand
- [ ] Different module combinations produce different `rarity` values (test: 3 modules vs 6 modules must differ)
- [ ] Attributes display in the properties panel
- [ ] Generated name follows naming convention: `[Prefix] + [Type] + [Suffix]`

### Codex System
- [ ] "Save to Codex" button saves current machine state to localStorage
- [ ] Codex view displays list of saved machines
- [ ] Each codex entry shows thumbnail, name, rarity
- [ ] Clicking codex entry opens detail view
- [ ] Detail view shows full machine with stats
- [ ] Can delete entries from codex
- [ ] Can load codex entry back into editor
- [ ] Saved data persists after page refresh (localStorage check)

### Export System
- [ ] "Export SVG" downloads a file with `<svg>` root element and module content
- [ ] "Export PNG" downloads a rasterized image file (minimum 800x600 pixels)
- [ ] "Export Poster" downloads a styled share card
- [ ] Exported files contain all visible modules and connections

---

## Test Methods

### Unit Tests (Vitest)
1. **attributeGenerator.test.ts**
   - Given: Module array with 3 `CoreFurnace` modules, 0 connections
   - When: `generateAttributes()` called
   - Then: Returns object with `name` (string), `rarity` (enum value), `stats` (object with numeric values)

2. **attributeGenerator.test.ts**
   - Given: Module array with 6 modules of different types, 5 connections
   - When: `generateAttributes()` called
   - Then: Returns different `rarity` than the 3-module case

3. **connectionEngine.test.ts**
   - Given: Module positions `{x: 100, y: 100}` and `{x: 300, y: 200}`, ports at those positions
   - When: `calculatePath()` called
   - Then: Returns valid SVG path string starting with 'M' and containing 'L'

### Integration Tests (Playwright)
1. **Editor Flow**
   - Navigate to editor
   - Drag module from panel to canvas at coordinates (400, 300)
   - Verify module element exists in DOM with transform/position reflecting drop
   - Click module, press Delete key, verify module element is removed from DOM

2. **Connection Flow**
   - Place two modules
   - Click output port element
   - Drag to input port element
   - Verify `<path>` element exists in connections layer

3. **Activation Flow**
   - Build machine with 3+ connected modules
   - Click "Activate" button
   - Wait 5 seconds
   - Verify state returns to `idle` or equivalent completion state

4. **Codex Flow**
   - Create machine with at least 1 module
   - Click "Save to Codex"
   - Wait for save confirmation
   - Navigate to Codex view
   - Verify entry exists in list
   - Click delete button on entry
   - Verify entry is removed from list

5. **Export Flow**
   - Create machine with modules
   - Click "Export SVG"
   - Verify download initiates
   - Read downloaded file content
   - Assert content contains `<svg` and module-related elements

---

## Risks

### Technical Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SVG performance with many modules | Medium | High | Use `useMemo` for complex paths, limit canvas to 50 modules |
| GSAP animation conflicts | Low | Medium | Isolate animation contexts per module |
| localStorage size limits | Medium | Low | Compress data, warn at 4MB, allow export |
| Canvas pan/zoom jank | Medium | Medium | Use CSS transforms, debounce updates |

### Scope Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| 6 module types take longer than expected | Medium | High | Pre-build SVG templates, focus on animations last |
| Attribute generator rules too simplistic | High | Medium | Build extensible rule system from start |
| Undo/redo complexity underestimated | Medium | High | Implement command pattern early, use Zustand middleware |

### Verification Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Manual testing of canvas interactions is error-prone | High | Medium | Write Playwright tests for critical paths |
| Export output format validation needed | Medium | Low | Write tests that open exported files |

---

## Failure Conditions

This sprint **MUST FAIL** if any of the following occur:

1. **Editor non-functional**: Cannot drag and drop modules onto canvas
2. **Module rendering broken**: Modules do not display SVG graphics correctly
3. **No valid animation**: Activation button does not trigger any visible animation (no DOM changes)
4. **Codex save broken**: Cannot save a machine to localStorage and retrieve it
5. **Export produces empty file**: SVG/PNG export downloads a file with no content
6. **Build fails**: `npm run build` produces compilation errors
7. **Critical type errors**: TypeScript compiler reports critical errors that prevent app from running
8. **Canvas interaction crashes**: Dragging or selecting modules causes JavaScript errors

### Warning Flags (Sprint review discussion points)
- Less than 6 module types implemented (must be 6)
- Animations are not sequential (verified by timestamp logging showing < 100ms between module starts)
- Attribute generator returns identical `rarity` for inputs with different module counts
- Playwright tests for core flows fail

---

## Done Definition

The sprint is **COMPLETE** when ALL of the following are true:

### Functional Completeness
- [ ] All 6 module types are draggable from panel to canvas (verified by Playwright test)
- [ ] Modules can be selected, deleted, and rotated (verified by Playwright test)
- [ ] Energy connections can be created between modules (verified by Playwright test)
- [ ] "Activate" button triggers animation that completes within 5 seconds
- [ ] Attributes are generated and displayed for current machine (verified by unit test)
- [ ] Machines can be saved to and loaded from codex (localStorage) (verified by Playwright test)
- [ ] SVG and PNG export functions produce downloadable files (verified by Playwright test)

### Technical Completeness
- [ ] `npm run dev` starts development server without errors
- [ ] `npm run build` produces optimized production build
- [ ] All TypeScript types compile without errors
- [ ] No `any` types used for module/connection data structures
- [ ] Zustand store correctly manages machine state

### Testing Completeness
- [ ] Unit tests for attribute generator pass (at least 2 test cases)
- [ ] Unit tests for connection path calculation pass
- [ ] Playwright test for editor flow passes
- [ ] Playwright test for export flow passes

---

## Out of Scope

The following features are explicitly **NOT** being built in this sprint:

1. **Module color customization** — All modules use predefined colors
2. **Module grouping** — Cannot group modules into assemblies
3. **Advanced alignment tools** — No snap-to-grid-lock or smart guides beyond basic grid
4. **Multiple machine slots** — Only one machine in editor at a time
5. **Output Array module** — Only the 6 specified module types
6. **AI text generation** — Attributes use rule-based generation only
7. **Social sharing** — No server, no user accounts, no community features
8. **Sound effects** — Visual-only experience
9. **Mobile responsive** — Desktop-only editor interface
10. **Keyboard shortcuts panel** — Some shortcuts exist (R, Delete, Ctrl+Z) but are undocumented
11. **Faction system** — No faction affiliation or bonuses
12. **Challenge mode** — No predefined challenges or achievements
13. **Persistent cloud storage** — Codex stored in browser localStorage only
14. **3D view or perspective transform** — Flat 2D SVG canvas only
15. **Undo/redo history UI** — History exists but no visual indicator

---

## Success Metrics

At sprint end, the following should be true:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Editor可用性 | 100% of drag operations succeed | Playwright test: 10 drag operations |
| Module覆盖率 | 6/6 types implemented | Code review: count unique module.type values |
| Animation完成度 | All 6 modules animate on activation | Verify 6 module elements have animating children |
| 导出成功率 | 100% of exports produce valid files | Playwright test checks file size > 0 and contains `<svg` |
| 图鉴保存率 | 100% of saves persist across refresh | Playwright: save, reload page, verify data exists |
| Build状态 | Clean build, 0 errors | `npm run build` exit code 0 |
| 测试覆盖率 | Core logic functions covered | Vitest + Playwright pass rates |
