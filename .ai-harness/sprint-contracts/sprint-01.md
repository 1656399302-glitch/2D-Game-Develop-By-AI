# Sprint Contract — Round 2

**APPROVED**

## Scope

This sprint focuses on **remediation and P1 feature completion**. Round 1 passed QA with 8.83/10, establishing a functional MVP. This round addresses the 2 untested acceptance criteria (keyboard undo/redo) and adds the deferred "Output Array" module type, completing the spec-required 7 module types.

**Primary Objectives:**
1. Verify and fix keyboard undo/redo functionality (2 untested criteria from Round 1)
2. Implement Output Array module (deferred P1 from Round 1)
3. Ensure smooth integration without breaking existing functionality

---

## Spec Traceability

### P0 items (Round 1 — COMPLETE ✓)
| Spec Requirement | Round 1 Status |
|-----------------|----------------|
| 机械装置编辑器 (Machine Editor) | ✅ Complete - drag, select, rotate, delete, undo/redo, grid |
| 6 Core Modules | ✅ Complete - Core Furnace, Energy Pipe, Gear, Rune Node, Shield Shell, Trigger Switch |
| 能量连接系统 (Energy Connection) | ✅ Complete - port-based connections with animated paths |
| 激活预览系统 (Activation Preview) | ✅ Complete - idle→charging→active→complete phases |
| 机器属性生成 (Attribute Generation) | ✅ Complete - rule-based name, rarity, stats, tags |
| 图鉴系统 (Codex System) | ✅ Complete - save/load/delete with localStorage |
| 导出能力 (Export) | ✅ Complete - SVG, PNG, Poster |

### P1 items (This Round — Target)
| Spec Requirement | Round 2 Status |
|-----------------|----------------|
| 法阵输出 (Output Array) module type | 🔲 Implement |
| Keyboard undo/redo fix | 🔲 Verify and fix |

### P1 items (Future Rounds)
- Module color customization
- Module grouping
- Advanced snap/alignment tools
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

### 1. Output Array Module Component
**File:** `src/components/Modules/OutputArray.tsx`

A new module type that serves as the output terminus for energy circuits:

| Property | Value |
|----------|-------|
| **Type ID** | `output-array` |
| **Category** | `output` |
| **Size** | 80×80 |
| **Ports** | 1× input (left side) |
| **Visual Theme** | Radial arcane array with concentric rings and beam projector |
| **Animation** | Rotating outer ring, pulsing inner core, energy reception glow |
| **Tags** | `arcane`, `output`, `resonance` |
| **Stats** | `stability: 20`, `power: 30`, `energy: 15` |

**SVG Design Elements:**
- Outer ring with tick marks (rotates on activation)
- Middle ring with rune symbols
- Inner core with radial gradient
- Energy intake receptor on left side
- Glow effect when receiving power

### 2. Keyboard Undo/Redo Fix
**File:** `src/App.tsx` (keyboard handling)

**Issue:** Browser test limitation - dispatched keyboard events don't trigger React handlers properly.

**Verification Method:** Manual browser test
1. Add a module to canvas
2. Press `Ctrl+Z`
3. Verify module is removed
4. Press `Ctrl+Y`
5. Verify module is restored

**If broken:** Review event listener attachment and React synthetic event handling.

### 3. Updated Module Registry
**File:** `src/types/index.ts`

Add to `MODULE_DEFINITIONS`:
```typescript
{
  id: 'output-array',
  name: 'Output Array',
  category: 'output',
  width: 80,
  height: 80,
  ports: [
    { id: 'in-1', type: 'input', position: { x: 0, y: 40 } }
  ],
  tags: ['arcane', 'output', 'resonance'],
  stats: { stability: 20, power: 30, energy: 15 }
}
```

### 4. Unit Tests for Output Array
**File:** `src/utils/__tests__/attributeGenerator.test.ts`

Add test case:
```typescript
it('should include output-array module in attribute calculation', () => {
  const modules = [
    { id: '1', type: 'core-furnace', ... },
    { id: '2', type: 'output-array', ... }
  ];
  const result = generateAttributes(modules, []);
  expect(result).toBeDefined();
  expect(result.tags).toContain('arcane');
});
```

---

## Acceptance Criteria

### Critical (Must Pass)
- [ ] Output Array module appears in module panel
- [ ] Output Array module can be dragged onto canvas
- [ ] Output Array module renders with distinct SVG graphics
- [ ] Output Array module has visible input port (left side)
- [ ] Output Array module participates in activation animation
- [ ] Output Array module contributes to attribute generation
- [ ] Ctrl+Z undoes last action in browser
- [ ] Ctrl+Y redoes last undone action in browser
- [ ] `npm run build` produces 0 errors
- [ ] `npm test` passes all tests

### Verification Checklist
- [ ] Output Array renders in module panel
- [ ] Output Array drag-drop works
- [ ] Output Array SVG matches design spec (rotating ring, inner core, receptor)
- [ ] Output Array can receive connections from other modules
- [ ] Output Array animates during activation (rotating ring, glow pulse)
- [ ] Machine with Output Array generates correct attributes
- [ ] Keyboard undo works: add module → Ctrl+Z → module removed
- [ ] Keyboard redo works: Ctrl+Y → module restored
- [ ] No regression: all Round 1 features still work

---

## Test Methods

### 1. Manual Browser Verification (Keyboard Undo/Redo)

**Test Script:**
```
1. Open browser dev tools on running app
2. Focus on canvas area
3. Click "Core Furnace" in module panel
4. Verify module appears on canvas
5. Open browser console
6. Execute: document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }))
7. Verify module disappears from canvas
8. Execute: document.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true, bubbles: true }))
9. Verify module reappears on canvas
```

**Pass Criteria:** Module disappears on Ctrl+Z and reappears on Ctrl+Y.

### 2. Output Array Integration Test

**Test Script (Playwright):**
```
1. Navigate to editor
2. Find Output Array in module panel
3. Click to add to canvas at (400, 300)
4. Verify module element exists with data-type="output-array"
5. Click module to select
6. Verify properties panel shows "Type: Output Array"
7. Add Core Furnace module
8. Click Core Furnace output port
9. Drag to Output Array input port
10. Verify connection path exists
11. Click "Activate Machine"
12. Wait 2 seconds
13. Verify Output Array shows active animation
```

**Pass Criteria:** All steps complete without errors.

### 3. Attribute Generation Test

**Test Script (Unit Test):**
```typescript
it('generates attributes with output-array module', () => {
  const modules = createModules([
    { type: 'core-furnace', x: 100, y: 100 },
    { type: 'output-array', x: 300, y: 100 }
  ]);
  
  const result = generateAttributes(modules, [
    { sourceModuleId: modules[0].id, targetModuleId: modules[1].id }
  ]);
  
  expect(result.tags).toContain('arcane');
  expect(result.name).toBeTruthy();
  expect(result.rarity).toBeDefined();
});
```

**Pass Criteria:** Test passes, attributes include 'arcane' tag.

### 4. Build and Test Verification

**Commands:**
```bash
npm run build  # Must produce 0 errors
npm test       # All tests pass
```

---

## Risks

### Technical Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Output Array animation conflicts with existing GSAP contexts | Low | Medium | Use isolated animation context per module |
| Keyboard event handling has browser compatibility issues | Low | High | Test in Chrome, Firefox, Safari |
| Adding new module type breaks existing connections | Low | High | Verify port positions don't overlap |

### Scope Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Output Array SVG takes longer than expected | Low | Medium | Use simplified design with CSS animations |
| Keyboard fix requires architecture change | Low | High | Prioritize investigation early in sprint |

---

## Failure Conditions

This sprint **MUST FAIL** if any of the following occur:

1. **Output Array not implemented**: Module type missing from panel or canvas
2. **Build errors**: `npm run build` produces TypeScript or bundler errors
3. **Regression**: Round 1 features (editor, connections, activation, codex, export) stop working
4. **Keyboard undo/redo completely non-functional**: Not just test limitation but actual user-facing bug
5. **Test failures**: `npm test` fails any existing test

### Warning Flags (Discussion Points)
- Output Array animation not visible during activation
- Connection to Output Array port fails
- Module panel scroll behavior breaks with new module
- Attribute generator throws error with new module type

---

## Done Definition

The sprint is **COMPLETE** when ALL of the following are true:

### Functional Completeness
- [ ] Output Array module appears in module panel
- [ ] Output Array can be placed on canvas via drag-drop
- [ ] Output Array has correct SVG visuals (rotating ring, core, receptor)
- [ ] Output Array input port accepts connections
- [ ] Output Array animates during machine activation
- [ ] Ctrl+Z keyboard shortcut reverses last action
- [ ] Ctrl+Y keyboard shortcut restores undone action

### Technical Completeness
- [ ] `npm run build` succeeds with 0 errors
- [ ] `npm test` passes all 24+ tests
- [ ] No TypeScript errors introduced
- [ ] New module registered in MODULE_DEFINITIONS

### Regression Prevention
- [ ] All 6 Round 1 modules still work
- [ ] Editor drag-drop still works
- [ ] Connection system still works
- [ ] Activation animation still works
- [ ] Codex save/load still works
- [ ] Export still works

---

## Out of Scope

The following are explicitly **NOT** being done this round:

1. **Module color customization** — All modules use predefined colors
2. **Module grouping** — Cannot group modules into assemblies
3. **Copy/paste functionality** — Ctrl+C/Ctrl+V not implemented
4. **Multiple selection** — Only single module selection
5. **Additional module types beyond Output Array** — Only one new module
6. **AI naming integration** — Attributes remain rule-based only
7. **Sound effects** — Visual-only
8. **Mobile responsiveness** — Desktop only
9. **Faction system** — Future feature
10. **Social sharing** — Future feature

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Output Array completeness | 100% | Module in panel + canvas + animation + connection |
| Keyboard undo/redo | 100% | Manual browser test passes |
| Build status | 0 errors | `npm run build` exit code 0 |
| Test pass rate | 100% | `npm test` all pass |
| Regression count | 0 | All Round 1 features verified |
| Module count | 7 total | 6 original + Output Array |
