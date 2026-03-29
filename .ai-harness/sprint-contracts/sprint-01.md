# APPROVED — Sprint Contract — Round 1

## Scope

This sprint establishes the **MVP foundation** for the Arcane Machine Codex Workshop. The primary goal is creating a runnable, visually cohesive editor with working drag-and-drop module placement, a core subset of SVG modules, and basic state management architecture. No activation animations, no complex energy routing, no persistence yet — just a solid technical and visual foundation.

## Spec Traceability

### P0 items (Must Complete — MVP Core)
1. **Project scaffolding** — React + TypeScript + Vite + Zustand + Tailwind CSS
2. **Dark magical theme** — CSS variables, base typography, background treatment
3. **SVG Module System foundation** — Configuration-driven module definitions
4. **Core Module Library** — 6 module types with custom SVG artwork:
   - Core Furnace (炉心)
   - Energy Pipe (能量管道)
   - Gear Mechanism (齿轮机构)
   - Rune Node (符文节点)
   - Protective Shell (防护外壳)
   - Trigger Switch (触发开关)
5. **Machine Editor Canvas** — SVG-based workspace with pan/zoom
6. **Module Panel** — Draggable module palette
7. **Drag-and-drop placement** — Modules can be dragged onto canvas and positioned
8. **Selection system** — Click to select, visual highlight, transform handles

### P1 items (Should Complete — MVP Polish)
1. **Delete selected module** — Keyboard (Delete/Backspace) and UI button
2. **Rotate selected module** — Rotation controls (90° increments) via UI buttons and keyboard (R key)
3. **Layer ordering** — Bring to front / send to back
4. **Grid snapping** — Visual grid on canvas for alignment
5. **Canvas zoom controls** — Zoom in/out/reset buttons

### P2 items (Intentionally Deferred)
- Energy connection system with path rendering
- Activation preview and animation system
- Machine attribute/name generation
- Codex/collection system
- Random forge mode
- Export functionality (SVG/PNG)
- Tutorial system
- Challenge mode
- Persistence (localStorage)
- Undo/redo system

## Deliverables

### Project Structure
```
src/
├── components/
│   ├── Editor/
│   │   ├── MachineCanvas.tsx    # Main SVG workspace
│   │   ├── ModulePanel.tsx      # Draggable module palette
│   │   └── ModuleRenderer.tsx   # Renders individual modules
│   ├── UI/
│   │   ├── Toolbar.tsx          # Editor controls
│   │   └── Button.tsx           # Shared button component
│   └── App.tsx
├── modules/
│   ├── index.ts                 # Module registry
│   ├── core-furnace.ts          # SVG template + metadata
│   ├── energy-pipe.ts
│   ├── gear-mechanism.ts
│   ├── rune-node.ts
│   ├── protective-shell.ts
│   └── trigger-switch.ts
├── store/
│   ├── useEditorStore.ts        # Zustand store for canvas state
│   └── types.ts                 # Store interfaces
├── types/
│   └── module.ts                # Module definition types
├── styles/
│   └── globals.css              # Theme variables, base styles
├── main.tsx
└── index.html
```

### Key Files to CREATE
1. **`src/modules/types.ts`** — Module definition interfaces (id, name, category, svgContent, ports, properties)
2. **`src/modules/core-furnace.ts`** — Core Furnace module with animated SVG
3. **`src/modules/energy-pipe.ts`** — Energy Pipe module SVG
4. **`src/modules/gear-mechanism.ts`** — Gear Mechanism with rotation animation ready
5. **`src/modules/rune-node.ts`** — Rune Node with glow effect
6. **`src/modules/protective-shell.ts`** — Protective Shell frame module
7. **`src/modules/trigger-switch.ts`** — Trigger Switch with toggle visual
8. **`src/modules/index.ts`** — Module registry exports
9. **`src/store/useEditorStore.ts`** — Zustand store with:
   - `modules: PlacedModule[]` — modules on canvas
   - `selectedId: string | null` — current selection
   - `canvasTransform: { x, y, scale }` — pan/zoom state
   - `addModule(moduleId, position)`
   - `removeModule(id)`
   - `selectModule(id)`
   - `moveModule(id, position)`
   - `rotateModule(id, degrees)`
   - `bringToFront(id)` / `sendToBack(id)`
10. **`src/components/Editor/MachineCanvas.tsx`** — SVG workspace with:
    - ViewBox-based coordinate system
    - Grid background pattern
    - Mouse wheel zoom
    - Drag-to-pan
    - Drop zone for modules
11. **`src/components/Editor/ModulePanel.tsx`** — Module palette:
    - Grid of draggable module thumbnails
    - Category headers
    - Visual preview of each module
12. **`src/components/Editor/ModuleRenderer.tsx`** — Renders a placed module:
    - SVG content from module definition
    - Selection highlight (glowing border)
    - Rotation transform
    - Transform handles (future)
13. **`src/components/UI/Toolbar.tsx`** — Top toolbar with:
    - Delete button
    - Rotate buttons (90° CW/CCW)
    - Layer controls (front/back)
    - Zoom controls
14. **`src/styles/globals.css`** — Theme system:
    - CSS custom properties for colors
    - Background gradients and textures
    - Typography scale
    - Glow effects

## Acceptance Criteria

1. **Project builds successfully** — `npm run build` exits 0 with 0 TypeScript errors
2. **6 modules available in panel** — All module types appear with correct visual previews
3. **Drag-drop works** — Dragging module from panel creates instance on canvas at drop position
4. **Selection works** — Clicking module shows selection highlight (glowing border)
5. **Delete works** — Delete key and UI button remove selected module
6. **Rotate works** — Rotate buttons and R key change module orientation visually
7. **Canvas pan/zoom works** — Mouse wheel zooms, drag on empty space pans
8. **Dark theme visible** — Background is dark (#0a0a0f or similar), CSS variables defined for magical theme
9. **State persists during session** — Modules remain after interactions (not across refresh)
10. **Custom SVG artwork** — Each module uses thematic SVG shapes (paths, circles, gradients, filters), not plain rectangles

## Test Methods

### Manual Verification
1. **Build**: `npm run build` → 0 TypeScript errors, 0 warnings
2. **Dev server**: `npm run dev` → page loads without console errors
3. **Module panel**: 6 module cards visible with distinct visuals
4. **Drag-drop**: Drag "Core Furnace" to canvas → module appears at drop location
5. **Multi-place**: Drag same module type 3x → all 3 appear independently
6. **Selection**: Click module → orange glow border appears
7. **Delete**: With module selected, press Delete → module disappears
8. **Rotate**: Select module → press R → module rotates 90°
9. **Pan**: Click and drag on empty canvas → viewport moves
10. **Zoom**: Scroll wheel → canvas zooms in/out
11. **Layer order**: Place 3 modules → use Bring to Front → verify z-order

### Automated Tests (to be written)
- `npm test -- moduleRegistry` — Verifies all 6 modules are registered
- `npm test -- editorStore` — Verifies store actions work correctly
- `npm test -- dragDrop` — Verifies drag-drop interaction logic

## Risks

1. **SVG Module Complexity** — Creating 6 distinct, attractive SVG modules in one sprint is time-consuming. Mitigate: Use simplified but cohesive geometric style.
2. **Drag-Drop Implementation** — HTML5 drag-drop with SVG canvas can be tricky. Mitigate: Use pointer events and manual coordinate translation.
3. **Pan/Zoom Conflicts** — Selection vs pan vs zoom can conflict. Mitigate: Clear interaction hierarchy (drag on empty = pan, click module = select, wheel = zoom).
4. **State Architecture** — Getting Zustand store shape wrong will cause refactoring later. Mitigate: Keep it simple, add comments for future expansion.

## Failure Conditions

1. **`npm run build` fails** — Any TypeScript errors or build errors
2. **Fewer than 6 modules** — Not all required module types implemented
3. **Drag-drop broken** — Cannot place modules on canvas
4. **No visual theme** — Pages look like default Vite template (no dark background, no CSS variables)
5. **Modules are placeholder boxes** — SVG artwork is just `<rect>` or `<circle>` with solid fill, no paths/gradients/filters
6. **Selection doesn't work** — Cannot interact with placed modules

## Done Definition

Exact conditions that must be true before claiming round complete:

- [ ] `npm run build` exits with code 0, 0 TypeScript errors
- [ ] All 6 module types defined in `src/modules/`
- [ ] Each module has custom SVG artwork with paths, shapes, or gradients (not plain `<rect>`/`<circle>`)
- [ ] ModulePanel displays all 6 modules with visual previews
- [ ] MachineCanvas renders placed modules at correct positions
- [ ] Drag from panel → drop on canvas → module created at drop point
- [ ] Click module → selection highlight visible
- [ ] Delete key → selected module removed from canvas
- [ ] Rotate (R key or buttons) → selected module rotates visually
- [ ] Mouse wheel → canvas zoom changes
- [ ] Drag on empty canvas → canvas pans
- [ ] Dark theme with magical aesthetic (dark background, CSS variables defined)
- [ ] Keyboard shortcuts documented and working

## Out of Scope

The following features from spec.md are explicitly NOT included in this sprint:

- **Energy connection system** — Path rendering, port connections, flow animations
- **Activation system** — Machine state machine, idle/active/overload states, startup animations
- **Machine attributes** — Auto-generated names, rarity, stability, faction tags
- **Codex/collection** — Saving machines, gallery view, persistence
- **Random forge** — One-click random machine generation
- **Export** — SVG export, PNG export, poster generation
- **Tutorial system** — Welcome modal, guided steps, tooltips
- **Challenge mode** — Timed challenges, scoring, unlocks
- **Undo/redo** — Command pattern implementation
- **Multi-select** — Box selection, group operations
- **Snap-to-grid** — Automatic alignment
- **Copy/paste** — Duplicate modules
- **Module parameter editing** — Property panels, sliders, color pickers
- **Module grouping** — Combine modules into assemblies
- **Cloud/AI features** — Any external API integrations
- **Mobile responsive** — Touch interactions (desktop only for MVP)
