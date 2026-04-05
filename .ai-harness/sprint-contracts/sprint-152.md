APPROVED

# Sprint Contract — Round 152

## Scope

**Remediation Sprint:** This round addresses the Round 151 failure where AC-151-009 (Archive popup/SaveTemplateModal regression) lacks explicit verification in the test suite.

Primary objective: Add integration tests for SaveTemplateModal to verify the archive popup does NOT hang when clicking Save or New.

## Spec Traceability

### P0 items covered this round
- **AC-151-009 Regression Fix:** Add SaveTemplateModal integration tests verifying archive popup dismiss behavior
  - SaveTemplateModal opens and displays correctly
  - Clicking "保存模板" (Save Template) with valid input dismisses within 500ms
  - Clicking "取消" (Cancel) dismisses immediately
  - Modal does not hang after successful save
  - Rapid consecutive clicks handled gracefully

### P1 items covered this round
- None (remediation-only sprint)

### Remaining P0/P1 after this round
- All P0/P1 items from previous rounds remain satisfied
- No new items introduced

### P2 intentionally deferred
- All P2 items remain deferred from previous sprints

## Deliverables

1. **`src/__tests__/integration/saveTemplateModalRegression.test.tsx`** — New integration test file with tests verifying SaveTemplateModal dismiss behavior and non-hanging behavior

2. **Test coverage for AC-151-009** — Minimum 5 tests covering:
   - Modal opens with correct content
   - Save button click dismisses modal within 500ms
   - Cancel button click dismisses modal immediately  
   - Successful save triggers onClose
   - Rapid consecutive clicks do not cause hang

3. **No changes to production code** — This is a test-only remediation sprint

## Acceptance Criteria

1. **AC-152-001:** SaveTemplateModal opens and renders with correct Chinese UI content (template name input, category selector, description textarea, save/cancel buttons)

2. **AC-152-002:** SaveTemplateModal does NOT hang when clicking "保存模板" — verified via test with 500ms timeout assertion

3. **AC-152-003:** SaveTemplateModal does NOT hang when clicking "取消" — verified via test with immediate dismiss assertion

4. **AC-152-004:** Modal dismisses within 500ms after successful save operation — test uses fake timers

5. **AC-152-005:** Rapid consecutive clicks on save button are handled gracefully (no multiple saves or hang)

6. **AC-152-006:** Bundle size remains ≤512KB (no production code changes)

7. **AC-152-007:** Test count ≥6148 (existing tests + new SaveTemplateModal tests)

8. **AC-152-008:** TypeScript compilation clean (npx tsc --noEmit exits with code 0)

## Test Methods

### AC-152-001: Modal content verification
1. Render SaveTemplateModal with `isOpen={true}`
2. Assert text content includes: "保存模板", "模板名称", "分类", "描述"
3. Assert buttons present: "保存模板" (primary), "取消" (secondary)

### AC-152-002: Save button dismiss within 500ms
1. Render SaveTemplateModal with mocked stores
2. Provide valid template name in input
3. Click "保存模板" button
4. Start timer, call vi.useFakeTimers()
5. Advance timers by 500ms
6. Assert onClose was called within 500ms
7. Call vi.useRealTimers()

### AC-152-003: Cancel button dismiss immediately
1. Render SaveTemplateModal with mocked stores
2. Click "取消" button
3. Assert onClose was called (no fake timers needed, immediate)

### AC-152-004: Successful save triggers dismiss
1. Mock useTemplateStore.addTemplate to return success
2. Mock useMachineStore to return modules array
3. Render SaveTemplateModal
4. Fill name input with valid text
5. Click save button
6. Assert addTemplate was called with correct params
7. Assert onClose was called within 500ms

### AC-152-005: Rapid clicks handled gracefully
1. Render SaveTemplateModal with mocked stores
2. Fill valid name input
3. Click save button 3 times rapidly in succession
4. Assert onClose called exactly once
5. Assert addTemplate called exactly once

### AC-152-006: Bundle size verification
1. Run `npm run build`
2. Assert output shows main bundle ≤ 524,288 bytes

### AC-152-007: Test count verification
1. Run `npm test -- --run`
2. Assert test count ≥6148

### AC-152-008: TypeScript compilation
1. Run `npx tsc --noEmit`
2. Assert exit code 0

## Risks

1. **Store mocking complexity:** SaveTemplateModal uses useTemplateStore and useMachineStore. Mock implementations must return realistic data for the component to render properly.

2. **Timer handling:** Tests using fake timers must properly restore real timers to avoid affecting other tests.

3. **CSS/UI rendering:** SaveTemplateModal likely has styled-components or CSS dependencies. Tests should mock these if needed.

## Failure Conditions

This round fails if ANY of the following are true:

1. SaveTemplateModal regression tests do not exist or do not cover AC-152-002 through AC-152-005

2. Bundle size exceeds 512KB

3. Test count drops below 6148 (excluding pre-existing unrelated failures)

4. TypeScript compilation produces errors

5. New test failures introduced alongside existing test suite

## Done Definition

**Exact conditions that must be true before claiming Round 152 complete:**

1. ✅ `src/__tests__/integration/saveTemplateModalRegression.test.tsx` exists

2. ✅ All new tests in saveTemplateModalRegression.test.tsx pass (≥5 tests)

3. ✅ `npm test -- --run` shows ≥6148 tests passing

4. ✅ `npm run build` shows bundle ≤512KB

5. ✅ `npx tsc --noEmit` exits with code 0

6. ✅ Test file covers AC-152-001 through AC-152-005 with verifiable assertions

7. ✅ No pre-existing tests were broken by adding new test file

## Out of Scope

- Any changes to production code (SaveTemplateModal.tsx, stores, etc.)
- Changes to LoadPromptModal or other modals
- New features from spec.md
- UI/visual changes to the game
- Performance optimizations beyond bundle size
- Changes to existing passing tests
