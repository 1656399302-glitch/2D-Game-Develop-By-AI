# Sprint Contract — Round 117

## Scope

This round focuses on **remediation of memory leaks and cleanup issues**, **accessibility enhancements**, and **error handling improvements**.

### P0 items:
- Memory leak fixes in Canvas.tsx (connectionDebounceRef, viewportDebounceRef cleanup)
- Memory leak fixes in ParticleEmitter.tsx (animation frame cancellation)
- Accessibility improvements (ARIA labels for modules)

### P1 items:
- ExportModal error handling for canvas context failures

---

## Deliverables

1. **Canvas.tsx** (`src/components/Editor/Canvas.tsx`)
   - Add `clearTimeout` for `connectionDebounceRef` in useEffect cleanup
   - Add `clearTimeout` for `viewportDebounceRef` in useEffect cleanup

2. **ParticleEmitter.tsx** (`src/components/Particles/ParticleEmitter.tsx`)
   - Add `cancelAnimationFrame` for ParticleBurst refs in useEffect cleanup

3. **ExportModal.tsx** (`src/components/Export/ExportModal.tsx`)
   - Add user-visible error (alert or toast) when `!ctx` in `handleFactionCardExportPNG`

4. **Canvas.tsx** Accessibility
   - Add `aria-label` to connection port area
   - Add `aria-label` to toolbar
   - Add `aria-label` to at least one module type

5. **New tests** (`src/__tests__/memoryLeakFixes.test.tsx`)
   - Test that Canvas unmounts clean up all pending timeouts
   - Test that ParticleEmitter unmounts cancel animation frames

6. **Updated accessibility tests** (`src/__tests__/accessibilityEnhancements.test.tsx`)
   - Test ARIA labels exist on Canvas.tsx elements
   - Test aria-invalid propagation in ExportModal

---

## Acceptance Criteria (Binary/Verifiable)

### AC-117-001: Canvas Memory Cleanup
- **Test**: `grep -n "clearTimeout(connectionDebounceRef.current)" src/components/Editor/Canvas.tsx` returns ≥1 match
- **Test**: `grep -n "clearTimeout(viewportDebounceRef.current)" src/components/Editor/Canvas.tsx` returns ≥1 match
- **Test**: Both clearTimeout calls are inside useEffect cleanup functions (return () => {...})

### AC-117-002: ParticleEmitter Memory Cleanup  
- **Test**: `grep -n "cancelAnimationFrame" src/components/Particles/ParticleEmitter.tsx` returns ≥1 match
- **Test**: cancelAnimationFrame call is inside useEffect cleanup function

### AC-117-003: ExportModal Error Handling
- **Test**: `grep -n "!ctx" src/components/Export/ExportModal.tsx` finds condition
- **Test**: After `!ctx` condition, user-visible error is triggered (alert OR setError OR toast)
- **Test**: Error path does NOT silently return without notification

### AC-117-004: Accessibility Labels
- **Test**: `grep -n "aria-label" src/components/Editor/Canvas.tsx | wc -l` ≥ 3
- **Test**: Canvas.tsx has aria-label on: (1) connection port area, (2) toolbar, (3) at least one module
- **Test**: No aria-label values are empty strings (`aria-label=""`)

### AC-117-005: Build Regression
- **Test**: `npx tsc --noEmit` exits with code 0
- **Test**: `npm test -- --run` shows ≥4957 passing tests
- **Test**: `npm run build` exits with code 0

---

## Test Methods (Specific)

### AC-117-001 & AC-117-002: Memory Cleanup
```
Method: Code inspection via grep
1. Run: grep -n "clearTimeout.*connectionDebounceRef" Canvas.tsx
2. Run: grep -n "clearTimeout.*viewportDebounceRef" Canvas.tsx
3. Run: grep -n "cancelAnimationFrame" ParticleEmitter.tsx
4. Verify each cleanup is inside a useEffect return function
5. Verify no orphaned setTimeout without matching clearTimeout
```

### AC-117-003: Error Handling
```
Method: Code inspection
1. Find handleFactionCardExportPNG function in ExportModal.tsx
2. Locate !ctx conditional branch
3. Verify error branch calls alert() OR sets error state OR shows toast
4. Verify error path does NOT silently return
```

### AC-117-004: Accessibility
```
Method: Code inspection
1. grep -n "aria-label" Canvas.tsx
2. Verify total count ≥ 3
3. Manually inspect that labels are descriptive (not empty)
4. Verify labels on: connection ports, toolbar, module container
```

### AC-117-005: Build Regression
```
Method: Build commands
1. npx tsc --noEmit
2. npm test -- --run
3. npm run build
```

---

## Failure Conditions

The round FAILS if ANY of:
1. TypeScript compilation fails (`npx tsc --noEmit` non-zero exit)
2. Any existing test breaks (must remain at 4957 passing)
3. New memory leak tests fail
4. New accessibility tests fail
5. ExportModal error path silently returns without user notification
6. Canvas.tsx has fewer than 3 aria-label attributes
7. Any new memory leaks are introduced

---

## Done Definition

The round is complete when ALL of:
1. ✅ `grep -n "clearTimeout(connectionDebounceRef" src/components/Editor/Canvas.tsx` returns ≥1
2. ✅ `grep -n "clearTimeout(viewportDebounceRef" src/components/Editor/Canvas.tsx` returns ≥1  
3. ✅ `grep -n "cancelAnimationFrame" src/components/Particles/ParticleEmitter.tsx` returns ≥1
4. ✅ ExportModal.tsx has visible error handling for `!ctx` condition
5. ✅ `grep -n "aria-label" src/components/Editor/Canvas.tsx | wc -l` ≥ 3
6. ✅ `npx tsc --noEmit` succeeds (exit 0)
7. ✅ `npm test -- --run` passes (≥4957 tests)
8. ✅ `npm run build` succeeds (exit 0)

---

## Out of Scope

1. Bundle size optimization (pre-existing architectural issue)
2. New features beyond memory leaks, accessibility, error handling
3. State management refactoring
4. History size optimization

---

## Spec Traceability

- **P0 items covered this round:**
  - Memory leak fixes in Canvas.tsx (connectionDebounceRef, viewportDebounceRef)
  - Memory leak fixes in ParticleEmitter.tsx (animation frame cancellation)
  - Accessibility improvements (ARIA labels)

- **P1 items covered this round:**
  - ExportModal error handling for canvas context failures

- **Remaining P0/P1 after this round:**
  - None identified in current spec

- **P2 items intentionally deferred:**
  - Bundle size optimization
  - State management refactoring
