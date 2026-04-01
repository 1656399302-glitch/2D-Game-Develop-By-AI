# Sprint Contract — Round 88

> **Contract Status:** ACTIVE — Ready for execution

## Contract Overview

**Project:** Arcane Machine Codex Workshop (交互式魔法机械图鉴工坊)
**Sprint Type:** Remediation Sprint — Fix contract verification gaps
**Start:** Round 88
**End:** Round 88 completion

---

## Purpose

This sprint addresses the Round 87 contract rejection issues. The previous contract had zero functional acceptance criteria verifying that the interactive editor actually works. This revision adds verifiable functional ACs for core editor capabilities, fixes performance targets, strengthens test methods, and clarifies scope.

---

## Spec Coverage

This sprint addresses **SPEC MAINTENANCE** — verifying that existing functionality continues to work:

| Spec Section | Status | Notes |
|--------------|--------|-------|
| Module Editor (Canvas, ModulePanel, drag-drop) | Regression Testing | Verify modules can be added to canvas |
| Energy Connection System | Regression Testing | Verify connections can be created |
| Activation Preview System | Regression Testing | Verify state machine transitions work |
| Codex System (save/load) | Regression Testing | Verify entries persist |
| Build & Test Infrastructure | Regression Testing | Verify bundle size and test suite |

**Spec Portion Deferred:** No new features this round.

---

## Acceptance Criteria

### Functional ACs (Editor Core)

#### AC-EDITOR-001: Module Drag onto Canvas
**Criterion:** User can add modules from the panel to the canvas via the store API

**Verification Method:**
```typescript
// Test: useMachineStore.addModule() creates a module on the canvas
const { addModule, modules } = useMachineStore.getState();
await act(async () => {
  addModule('core-furnace', 100, 100);
});
const state = useMachineStore.getState();
expect(state.modules.length).toBe(1);
expect(state.modules[0].type).toBe('core-furnace');
```

**Test File:** `src/__tests__/functional/editorCore.test.ts`
**Status:** TO BE VERIFIED

---

#### AC-EDITOR-002: Connection Creation Between Modules
**Criterion:** User can create energy connections between two placed modules

**Verification Method:**
```typescript
// Test: useMachineStore connection methods create valid connections
const { addModule, startConnection, completeConnection, connections } = useMachineStore.getState();
// Add two modules
await act(async () => {
  addModule('core-furnace', 100, 100);
  addModule('rune-node', 200, 100);
});
const modules = useMachineStore.getState().modules;
// Create connection
await act(async () => {
  startConnection(modules[0].instanceId, 'output', 'output-1');
  completeConnection(modules[1].instanceId, 'input', 'input-1');
});
expect(useMachineStore.getState().connections.length).toBe(1);
```

**Test File:** `src/__tests__/functional/editorCore.test.ts`
**Status:** TO BE VERIFIED

---

#### AC-EDITOR-003: Activation State Machine
**Criterion:** Machine activation triggers animation state changes through the state machine

**Verification Method:**
```typescript
// Test: setMachineState() transitions between valid states
const { setMachineState, machineState } = useMachineStore.getState();
const validStates = ['idle', 'charging', 'active', 'overload', 'failure', 'shutdown'];
await act(async () => {
  setMachineState('charging');
});
expect(useMachineStore.getState().machineState).toBe('charging');
await act(async () => {
  setMachineState('active');
});
expect(useMachineStore.getState().machineState).toBe('active');
```

**Test File:** `src/__tests__/functional/activationCore.test.ts`
**Status:** TO BE VERIFIED

---

#### AC-CODEX-001: Codex Save and Retrieve
**Criterion:** Machine can be saved to codex and retrieved with correct data

**Verification Method:**
```typescript
// Test: useCodexStore.addEntry() and getEntry() work correctly
const codex = useCodexStore.getState();
await act(async () => {
  codex.addEntry('Test Machine', [], [], {
    rarity: 'rare',
    stability: 0.8,
    energy: 100,
    failureRate: 0.1,
    output: 'fire',
    能耗: 'medium',
    coreFaction: 'arcane',
    description: 'Test',
    tags: ['test'],
    codexNumber: 'MC-0001',
  });
});
const entries = useCodexStore.getState().entries;
expect(entries.length).toBeGreaterThan(0);
const savedEntry = entries[entries.length - 1];
expect(savedEntry.name).toBe('Test Machine');
expect(savedEntry.rarity).toBe('rare');
```

**Test File:** `src/__tests__/functional/codexCore.test.ts`
**Status:** TO BE VERIFIED

---

### Build & Infrastructure ACs

#### AC-BUILD-001: Bundle Size Compliance
**Criterion:** Build succeeds with bundle size ≤560KB

**Verification Method:**
```bash
Command: npm run build 2>&1
Expected: Exit code 0, output contains "index-*.js" with size ≤560KB
```

**Test File:** `src/__tests__/functional/buildCompliance.test.ts`
**Status:** TO BE VERIFIED

---

#### AC-TEST-001: Test Suite Passes
**Criterion:** All 3102+ tests pass

**Verification Method:**
```bash
Command: npx vitest run 2>&1
Expected: All test files pass, total tests ≥3102
```

**Test File:** Existing test suite
**Status:** TO BE VERIFIED

---

#### AC-TEST-PERF-001: Test Suite Duration
**Criterion:** Test suite completes in reasonable time with parallelization enabled

**Verification Method:**
```bash
Command: npx vitest run 2>&1
Expected: Duration ≤15s (with pool: 'forks' enabled)
Fallback: If parallelization causes instability, accept ≤16s with sequential pool
```

**Test File:** Existing vitest run
**Status:** TO BE VERIFIED

---

### Documentation ACs

#### AC-DOC-001: README Content Verification
**Criterion:** README contains required sections for developer onboarding

**Verification Method:**
```bash
Command: grep -E "(Setup|Architecture|Modules|Connections|Activation|Codex|Export)" README.md
Expected: At least 6 of 8 expected sections present
```

**Status:** TO BE VERIFIED

---

#### AC-DOC-002: Store API Documentation
**Criterion:** Key stores documented in API.md

**Verification Method:**
```bash
Command: grep -E "(useMachineStore|useCodexStore|useFactionStore|useActivationStore)" API.md
Expected: At least 4 store names appear in documentation
```

**Status:** TO BE VERIFIED

---

## Deliverables

### D1: Functional Test Suite for Editor Core
**File:** `src/__tests__/functional/editorCore.test.ts`
**Content:**
- AC-EDITOR-001: Module drag/add to canvas
- AC-EDITOR-002: Connection creation between modules
- Additional edge cases for module placement

**Size:** ≥50 lines, ≥5 test cases
**Status:** TO BE IMPLEMENTED

---

### D2: Functional Test Suite for Activation System
**File:** `src/__tests__/functional/activationCore.test.ts`
**Content:**
- AC-EDITOR-003: State machine transitions
- State transition edge cases
- Invalid state handling

**Size:** ≥40 lines, ≥4 test cases
**Status:** TO BE IMPLEMENTED

---

### D3: Functional Test Suite for Codex System
**File:** `src/__tests__/functional/codexCore.test.ts`
**Content:**
- AC-CODEX-001: Save and retrieve entries
- Entry data integrity
- Duplicate handling

**Size:** ≥40 lines, ≥4 test cases
**Status:** TO BE IMPLEMENTED

---

### D4: Build Compliance Test
**File:** `src/__tests__/functional/buildCompliance.test.ts`
**Content:**
- AC-BUILD-001: Bundle size verification
- Parse build output for actual bundle size
- Assert ≤560KB threshold

**Size:** ≥30 lines, ≥2 test cases
**Status:** TO BE IMPLEMENTED

---

## Test Methods

### Functional Tests

| Test | Method | Expected Result |
|------|--------|-----------------|
| AC-EDITOR-001 | Call `addModule()`, verify module in store | Module appears in `modules` array |
| AC-EDITOR-002 | Call `startConnection()` + `completeConnection()` | Connection appears in `connections` array |
| AC-EDITOR-003 | Call `setMachineState()` with each state | `machineState` matches input |
| AC-CODEX-001 | Call `addEntry()`, verify data integrity | Entry saved with correct data |

### Build Verification

```bash
# Bundle size test
npm run build 2>&1 | grep "index-*.js"
# Parse size from output, assert ≤560KB
```

### Documentation Verification

```bash
# README sections
grep -E "(Setup|Architecture|Modules|Connections|Activation|Codex|Export)" README.md
# Expected: At least 6 sections

# Store documentation
grep -E "(useMachineStore|useCodexStore|useFactionStore|useActivationStore)" API.md
# Expected: At least 4 stores documented
```

---

## Done Definition

1. **Functional Correctness:** All 4 functional ACs (EDITOR-001, EDITOR-002, EDITOR-003, CODEX-001) pass
2. **Build Compliance:** Bundle size ≤560KB, TypeScript 0 errors
3. **Test Suite:** All 3102+ tests pass, duration ≤15s
4. **Documentation:** README has ≥6 required sections, API.md documents ≥4 stores
5. **Test Coverage:** New functional tests cover core editor capabilities

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Parallel tests cause flakiness | Medium | High | Enable `pool: 'forks'` with fallback to sequential |
| Store API changes break tests | Low | High | Tests use current API, documented in ACs |
| Build environment differs | Low | Medium | Test runs actual build command |

---

## Out of Scope

- New features
- UI/UX improvements
- Module type additions
- Export format expansion

---

## Success Criteria

**All 9 acceptance criteria must pass:**
- [ ] AC-EDITOR-001: Module drag to canvas works
- [ ] AC-EDITOR-002: Connection creation works
- [ ] AC-EDITOR-003: Activation state machine works
- [ ] AC-CODEX-001: Codex save/retrieve works
- [ ] AC-BUILD-001: Bundle ≤560KB
- [ ] AC-TEST-001: All tests pass
- [ ] AC-TEST-PERF-001: Duration ≤15s
- [ ] AC-DOC-001: README content verified
- [ ] AC-DOC-002: Store docs verified
