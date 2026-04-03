# Sprint Contract — Round 119

## Incident Acknowledgment

**The submitted `spec.md` was replaced with operator inbox injection describing a completely different project ("交互式魔法机械图鉴工坊"). Round 118 QA confirms the existing project is healthy (4948 tests, 462.91KB bundle, all ACs passing). This sprint is remediation-first.**

---

## Scope

This sprint focuses on consolidating module data structures and integrating auto-layout UI features to the existing Tech Tree Canvas project. All work continues the established architectural direction established through Round 118.

---

## Spec Traceability

### P0 Items (Must Complete)
- Module data consolidation: unify component schemas across stores
- Auto-layout algorithm integration for circuit arrangement
- Regression protection: maintain 4948 passing tests

### P1 Items (Should Complete)
- Canvas performance optimization for large circuits
- Enhanced connection validation feedback
- UI polish for the auto-layout feature

### Remaining P0/P1 After This Round
- P0: Auto-layout edge cases, data migration validation
- P1: Full component type coverage for auto-layout

### P2 Intentionally Deferred
- Multi-layer circuit visualization
- AI-powered circuit suggestions
- Community circuit rating system

---

## Deliverables

1. **src/stores/moduleDataStore.ts** — Consolidated module data store with unified schema
2. **src/utils/autoLayout.ts** — Auto-layout algorithm for circuit arrangement
3. **src/components/Canvas/AutoLayoutButton.tsx** — UI trigger for auto-layout
4. **Updated type definitions in src/types/** — Reflecting consolidated data model
5. **Integration tests in tests/autoLayout/** — Coverage for new functionality

---

## Acceptance Criteria

1. **AC-119-001**: Module data store exports all component types with unified schema; no duplicate or conflicting definitions remain
2. **AC-119-002**: Auto-layout algorithm arranges circuit components without overlaps; minimum 20px spacing between components
3. **AC-119-003**: Auto-layout button visible in canvas toolbar; triggers layout recalculation
4. **AC-119-004**: 4948 existing tests pass (0 failures); no regression in functionality
5. **AC-119-005**: Bundle size ≤512KB (same as Round 118 baseline)
6. **AC-119-006**: TypeScript compiles with 0 errors

---

## Test Methods

### AC-119-001: Module Data Store Validation
**How**: Inspect `src/stores/moduleDataStore.ts` and verify all component types (AND, OR, NOT, NAND, NOR, XOR, XNOR, wire, input, output, timer, counter, memory) have consistent schema. Grep for duplicate definitions across store files.
**Pass condition**: All component types use single unified schema; no TypeScript errors; no duplicate `interface ComponentDefinition`

### AC-119-002: Auto-Layout Algorithm Verification
**How**: Run unit tests in `tests/autoLayout/` with sample circuits (5, 10, 20 components). Measure overlap detection and spacing.
**Pass condition**: `npm test -- tests/autoLayout/` — 0 failures; all spacing assertions pass

### AC-119-003: UI Integration Test
**How**: Build project and verify `AutoLayoutButton` component exists in `dist/assets/`. Inspect `src/components/Canvas/` for button presence.
**Pass condition**: Button component found; no console errors on canvas load

### AC-119-004: Regression Test
**How**: Run full test suite
```bash
npm test -- --run 2>&1 | tail -10
```
**Pass condition**: Test Files 185 passed, Tests 4948 passed, 0 failures

### AC-119-005: Bundle Size Check
**How**: Build and inspect
```bash
npm run build 2>&1 | grep "index-"
```
**Pass condition**: Main bundle (index-*.js) ≤512KB

### AC-119-006: TypeScript Validation
**How**:
```bash
npx tsc --noEmit; echo "EXIT_CODE: $?"
```
**Pass condition**: Exit code 0

---

## Risks

1. **Auto-layout complexity**: Large circuits (100+ components) may have performance issues; algorithm may need optimization
2. **Schema migration**: Consolidating module data may affect existing component instances; migration path needed
3. **Test coverage**: New functionality requires additional test cases; time investment for coverage
4. **Bundle impact**: New algorithm code may increase bundle size; must monitor against 512KB limit

---

## Failure Conditions

This sprint fails if:
- Any of AC-119-001 through AC-119-006 return FAIL
- New tests added < 10 (insufficient coverage for new features)
- Existing test count drops below 4948
- Bundle size exceeds 512KB
- TypeScript compilation produces errors
- spec.md is modified to describe a project other than "Tech Tree Canvas — Circuit Building Game"

---

## Done Definition

The sprint is complete when ALL of the following are true:
1. spec.md contains the Tech Tree Canvas project specification (not injected content)
2. All 6 acceptance criteria verified and passing
3. 4948+ tests passing with 0 failures
4. Bundle ≤512KB with TypeScript 0 errors
5. Auto-layout algorithm functional and integrated
6. Module data store uses unified schema across all components
7. No operator inbox instructions present in spec.md or contract.md

---

## Out of Scope

- Multi-layer circuit visualization (P2, deferred)
- AI-powered circuit suggestions (P2, deferred)
- Community rating system (P1, deferred to future round)
- New component types beyond existing set (maintenance mode)
- Major architectural refactoring of canvas rendering
- Changes to faction or recipe discovery systems
