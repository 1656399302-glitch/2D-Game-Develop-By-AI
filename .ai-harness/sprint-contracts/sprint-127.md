APPROVED

# Sprint Contract — Round 127

## Scope

This sprint implements **multi-layer support** for the circuit canvas, completing a P0 item from the spec. The LayersPanel exists in the codebase but is not connected to state management. This round bridges that gap, enabling users to create, switch between, rename, delete, and visualize circuit layers.

## Spec Traceability

### P0 items covered this round
- **Multi-layer support for complex circuits** — Spec: "Multi-layer support for complex circuits" under Canvas System

### P1 items covered this round
- None this round

### Remaining P0/P1 after this round
- Timer components (P1)
- Counter components (P1)
- Memory elements (P1)

### P2 intentionally deferred
- Particle system polish
- Advanced animation effects
- Community leaderboard enhancements

## Deliverables

1. **`src/stores/useMachineStore.ts`** — Add layer state management:
   - `layers: Layer[]` array
   - `activeLayerId: string`
   - `addLayer(name?: string): string`
   - `removeLayer(id: string): boolean`
   - `renameLayer(id: string, name: string): void`
   - `setActiveLayer(id: string): void`
   - `moveComponentsToLayer(componentIds: string[], targetLayerId: string): void`
   - `getActiveLayerComponents(): ComponentInstance[]`
   - `getActiveLayerWires(): Wire[]`

2. **`src/components/Editor/LayersPanel.tsx`** — Connect LayersPanel to store:
   - Layer list with active indicator
   - Add/delete/rename layer controls
   - Move selected components to layer action
   - Layer visibility toggle per layer

3. **`src/components/Canvas/Canvas.tsx`** — Filter rendering by active layer:
   - Only render components/wires for `activeLayerId`
   - Show layer indicator in canvas header
   - Layer-aware circuit validation

4. **New type definitions in `src/types/`**:
   ```typescript
   interface Layer {
     id: string;
     name: string;
     visible: boolean;
     color: string; // for layer tab differentiation
     order: number;
   }
   ```

5. **Unit tests in `src/__tests__/layers.test.ts`**:
   - Layer CRUD operations
   - Active layer switching
   - Component-layer assignment
   - Layer filtering in store selectors

## Acceptance Criteria

1. **AC-127-001: Layer creation** — User can create a new layer via LayersPanel, receiving a unique layer ID and default name "Layer N"; store state shows `layers.length` increases by exactly 1 and `layers[].id` is unique.

2. **AC-127-002: Layer switching** — Clicking a layer in LayersPanel sets it as active; canvas only shows components/wires on the active layer; `activeLayerId` in store matches the clicked layer's id.

3. **AC-127-003: Layer deletion** — User can delete a layer (except the last one); deletion removes all associated components and wires from state; store `layers.length` decreases by 1.

4. **AC-127-004: Layer renaming** — User can rename any layer; name updates immediately in LayersPanel and canvas header; store layer name reflects the new value.

5. **AC-127-005: Component-layer assignment** — Selected components can be moved to the active layer via LayersPanel action; moved components no longer appear on the source layer; target layer's component list includes the moved components.

6. **AC-127-006: Layer visibility toggle** — Each layer has a visibility toggle; hidden layers are excluded from rendering on the canvas; no crash or orphaned rendering occurs when all layers are toggled hidden.

7. **AC-127-007: Minimum one layer invariant** — System maintains at least one layer at all times; `layers.length` never reaches 0; delete control is disabled when only one layer exists; attempting `removeLayer` on the only layer returns `false` and leaves `layers.length` unchanged.

## Test Methods

### Unit Tests (`npm test -- --run src/__tests__/layers.test.ts`)

1. **AC-127-001**: Call `addLayer()`, assert returned ID is non-empty string, assert `layers.length` increases by 1, assert name matches `/^Layer \d+$/` pattern, assert all existing IDs differ from new ID.
2. **AC-127-002**: Call `setActiveLayer(id)`, assert `activeLayerId === id` in store, assert `getActiveLayerComponents()` returns only components with matching `layerId`, assert components on other layers are excluded.
3. **AC-127-003**: Create 2 layers, call `removeLayer(firstId)`, assert `layers.length` decreases by 1, assert removed layer ID absent from `layers[]`, assert remaining layer still in array.
4. **AC-127-004**: Call `renameLayer(id, "NewName")`, assert the named layer's `name === "NewName"`, assert other layers' names unchanged.
5. **AC-127-005**: Create components A and B on layer L1, call `moveComponentsToLayer([A.id], L2)`, assert A's `layerId === L2`, assert B's `layerId === L1`, assert L1's component list no longer contains A, assert L2's component list contains A.
6. **AC-127-006**: Create 2 layers, toggle one `visible = false`, assert `getActiveLayerComponents()` excludes components from the hidden layer, assert no error thrown when both layers have mixed visibility.
7. **AC-127-007**: With 1 layer, call `removeLayer(soloId)`, assert return value is `false`, assert `layers.length === 1` unchanged. Add second layer, assert `layers.length === 2`; delete first, assert `layers.length === 1` and the remaining layer's id is valid and `activeLayerId` points to it.

### E2E Tests (`npm run test:e2e -- tests/e2e/layers.spec.ts`)

1. **AC-127-001**: Open LayersPanel, click "Add Layer" button, wait for layer list to update; assert a new layer item appears in the DOM list; assert the name matches the "Layer N" pattern. Assert `layers.length` in store is 1 more than before the click.

2. **AC-127-002**: Add 2 layers. Add one component to Layer 1 (e.g., an AND gate) and a different component to Layer 2 (e.g., an OR gate). Click Layer 2 tab. Assert the Layer 1 component does **not** render on canvas (`querySelector` returns null). Click Layer 1 tab. Assert the Layer 2 component does **not** render on canvas. Assert the Layer 1 component renders. Assert `activeLayerId` in store equals the clicked layer id.

3. **AC-127-003**: Add 2 layers with distinct components on each. Click delete on Layer 1. Assert Layer 1 item is removed from the DOM list. Assert Layer 2 remains in the list and is now active (or the remaining layer is active). Assert Layer 1 components do not render on canvas. Assert the store `layers` array has length 1 and contains only Layer 2.

4. **AC-127-004**: Double-click layer name in LayersPanel, type `"Alpha"`, confirm. Assert the layer item label text equals `"Alpha"`. Assert the canvas header layer indicator also shows `"Alpha"`. Assert `layers[].name === "Alpha"` in store.

5. **AC-127-005**: Place a component on Layer 1. Select it. Click "Move to Layer 2" in LayersPanel. Assert the component disappears from Layer 1 canvas view. Assert the component appears on Layer 2 canvas view. Assert the component's `layerId` in store equals Layer 2 id.

6. **AC-127-006**: With 2 layers each containing components, click visibility toggle on Layer 2 to hide it. Assert components from Layer 2 do not render on canvas. Assert Layer 1 components still render. Re-toggle to show Layer 2. Assert Layer 2 components reappear. Assert no console errors during any toggle step.

7. **AC-127-007**: With a single layer in the list, assert the delete button (or icon) for that layer is **disabled** or **not rendered**. Attempt to trigger delete (e.g., via keyboard shortcut or right-click). Assert the layer remains in the list and `layers.length === 1`. Assert `activeLayerId` remains valid and non-null.

## Risks

1. **Migration risk** — Existing circuits have no `layerId` on components; must default all components to the first layer on load. Components without a `layerId` must not render as invisible orphans and must not cause validation errors.

2. **Rendering performance** — Filtering by layer on every render could slow canvas; implement memoized selectors for `getActiveLayerComponents` and `getActiveLayerWires`.

3. **Validation coupling** — Circuit validation must respect active layer; changes must not break existing validation tests (existing 5318 unit tests and 31 E2E tests must continue to pass).

4. **Prop chain for layer filtering** — Canvas.tsx must pass the correct `activeLayerId` to child render functions; if the active layer id is not threaded through the render pipeline, all layers render regardless of selection.

## Failure Conditions

1. Any unit test fails in `src/__tests__/layers.test.ts`
2. Any E2E test fails in `tests/e2e/layers.spec.ts`
3. TypeScript errors introduced by new Layer type or store additions
4. Build exceeds 512KB due to new code
5. Existing 5318 unit tests or 31 E2E tests regress
6. Layer-less circuits fail to load — all pre-existing circuits (no `layerId` field) must open with all components on a default layer without visual or validation errors
7. `layers.length` ever reaches 0 during runtime
8. `activeLayerId` ever becomes `null` or an id not present in `layers[]`

## Done Definition

All of the following must be true before claiming round complete:

1. ✅ `layers: Layer[]` and `activeLayerId: string` state exists in `useMachineStore`
2. ✅ `addLayer`, `removeLayer`, `renameLayer`, `setActiveLayer`, `moveComponentsToLayer` implemented with correct signatures and return types
3. ✅ `LayersPanel.tsx` connected to store with working UI controls (add, delete, rename, move-to-layer, visibility toggle)
4. ✅ `Canvas.tsx` filters rendering by `activeLayerId`; prop chain verified: `activeLayerId` from store → used in render filter → only matching layer's components/wires rendered
5. ✅ Default layer created for existing/new circuits — migration-safe, `layers.length >= 1` invariant holds
6. ✅ 7/7 unit tests pass in `src/__tests__/layers.test.ts`
7. ✅ 7/7 E2E tests pass in `tests/e2e/layers.spec.ts`
8. ✅ 5318 existing unit tests continue to pass
9. ✅ 31 existing E2E tests continue to pass
10. ✅ Build ≤ 512KB
11. ✅ TypeScript 0 errors
12. ✅ `layers.length` never 0, `activeLayerId` never null/missing at any point in normal usage

## Out of Scope

- Timer components (deferred to future round)
- Counter components (deferred to future round)
- Memory elements (deferred to future round)
- Layer locking/password protection
- Layer export/import independently
- Multi-layer circuit validation across all layers simultaneously (only single active-layer validation this round)
- Layer color customization UI beyond default palette
