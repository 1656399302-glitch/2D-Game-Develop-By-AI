# Sprint Contract — Round 91

## APPROVED

## Scope

This sprint focuses on enhancing the **connection system robustness** and **activation visual feedback** to improve the machine building experience. Key deliverables:

1. **Connection conflict detection** — Prevent invalid connections (same port types, self-connections) with clear visual feedback
2. **Activation pulse improvements** — Refine energy pulse visualization during machine activation with better choreography
3. **Connection stability indicators** — Add visual indicators showing connection health/stability

**This is a feature enhancement sprint. No breaking changes. All existing tests must pass.**

## Spec Traceability

### P0 Items Covered This Round
- Port type mismatch error messaging (from spec: "输入端口无法连接到输入端口", "输出端口无法连接到输出端口")
- Self-connection error messaging (from spec: "模块无法连接到自身")
- Activation phase timing tuning (from spec: AC-TIMING-003)

### P1 Items Covered This Round
- Error feedback for failed connections (from spec: AC-ERROR-002, AC-ERROR-003)
- Activation pulse phase indicator improvements (from spec: AC-PULSE-001)

### Remaining P0/P1 After This Round

**P0 Items Remaining:**
- None — all P0 items from spec are addressed in this round

**P1 Items Remaining:**
- AC-ERROR-001: Connection error summary notifications (per spec: "错误: 连接失败 — [错误原因]")
- AC-DISCONN-001: Disconnection confirmation UI with undo support
- AC-MODULE-STATE-003: Module state persistence across sessions
- AC-PORT-001: Port type indicators during connection drag

### P2 Intentionally Deferred
- AI-powered connection suggestions
- Advanced circuit analysis
- Machine recipe auto-detection
- Community challenge circuit templates

## Deliverables

| # | File | Description |
|---|------|-------------|
| 1 | `src/utils/connectionValidator.ts` (new) | Connection validation logic: same-type ports, self-connections |
| 2 | `src/components/Connections/ConnectionErrorToast.tsx` (enhanced) | Show clear error messages for invalid connection attempts |
| 3 | `src/utils/activationPulseEnhancer.ts` (new) | Improved pulse timing and visual choreography |
| 4 | `src/store/useMachineStore.ts` (modified) | Integrate connection validation into connection creation flow |
| 5 | `src/__tests__/connectionValidation.test.ts` (new) | Test coverage for validation logic |
| 6 | `src/__tests__/connectionConflictDetection.test.ts` (new) | Test coverage for conflict scenarios (same-type ports, self-connections only) |

## Acceptance Criteria

1. **AC-CONN-VALID-001:** Attempting to connect an input port to another input port shows error toast with message "输入端口无法连接到输入端口"
2. **AC-CONN-VALID-002:** Attempting to connect an output port to another output port shows error toast with message "输出端口无法连接到输出端口"
3. **AC-CONN-VALID-003:** Attempting to connect a module to itself shows error toast with message "模块无法连接到自身"
4. **AC-PULSE-ENH-001:** Activation pulse animations play correctly with sequential timing per spec AC-TIMING-003
5. **AC-TEST-STABILITY-001:** All 3178 existing tests continue to pass (no regressions)

## Test Methods

### TM1: Connection Validation Tests
```bash
# Run new connection validation tests
npx vitest run src/__tests__/connectionValidation.test.ts

# Verify:
# - 6+ test cases for validation logic (same-type ports, self-connections)
# - All tests pass
# - No console errors
```

### TM2: Conflict Detection Tests
```bash
# Run same-type/self-connection detection tests
npx vitest run src/__tests__/connectionConflictDetection.test.ts

# Verify:
# - 4+ test cases for conflict scenarios (input-input, output-output, self-connection)
# - All tests pass
```

### TM3: Full Test Suite Regression
```bash
# Verify no regressions from new changes
npx vitest run

# Verify:
# - Exit code 0
# - 142+ test files pass (may increase)
# - 3178+ tests pass (may increase)
# - Duration < 22s
```

### TM4: Browser Visual Verification
```
1. Open application in browser
2. Try to connect two INPUT ports:
   - Verify error toast appears with "输入端口无法连接到输入端口"
   - Verify connection is NOT created
3. Try to connect two OUTPUT ports:
   - Verify error toast appears with "输出端口无法连接到输出端口"
   - Verify connection is NOT created
4. Try to connect a module to itself:
   - Verify error toast appears with "模块无法连接到自身"
   - Verify connection is NOT created
5. Create valid connections and verify they work correctly
```

### TM5: Activation Pulse Verification
```
1. Build a simple machine (Core Furnace → Gear → Rune Node)
2. Click "激活机器" (Activate Machine)
3. Verify:
   - Pulses flow from Core Furnace → Gear → Rune Node
   - Pulse timing is sequential (not simultaneous) per AC-TIMING-003
   - Phase text transitions correctly (CHARGING → ACTIVATING → ONLINE)
```

## Risks

1. **Risk: Adding validation logic may break existing connection creation flow**
   - **Mitigation:** Add validation as a pre-check before connection creation; keep existing success path unchanged
   - **Severity:** Medium
   - **Fallback:** Revert validation if any existing connection flows break

2. **Risk: Pulse timing changes may cause visual regressions**
   - **Mitigation:** Test timing changes in isolation; verify no changes to total activation duration
   - **Severity:** Low
   - **Fallback:** Revert to previous timing if visual issues detected

3. **Risk: New test files may cause test suite to exceed 22s threshold**
   - **Mitigation:** Keep new test files focused; avoid unnecessary assertions
   - **Severity:** Low
   - **Fallback:** Optimize test setup/teardown if needed

## Failure Conditions

The round MUST FAIL if any of the following occur:

1. **FC-001:** Any of the 3178 existing tests fail
2. **FC-002:** Test suite duration exceeds 22 seconds
3. **FC-003:** Browser verification reveals that error toasts do NOT appear for invalid connection attempts
4. **FC-004:** Browser verification reveals that invalid connections ARE created (validation not working)
5. **FC-005:** Bundle size increases by more than 10KB from 534KB baseline

## Done Definition

All of the following conditions MUST be true before claiming the round complete:

### Code Quality
- [ ] `src/utils/connectionValidator.ts` exists with `validateConnection()` function
- [ ] `src/utils/activationPulseEnhancer.ts` exists with enhanced pulse timing
- [ ] All connection creation passes through validation before execution
- [ ] Error toasts show correct localized messages for each error type

### Testing
- [ ] New `connectionValidation.test.ts` created with 6+ test cases
- [ ] New `connectionConflictDetection.test.ts` created with 4+ test cases
- [ ] All new tests pass
- [ ] All 3178 existing tests continue to pass

### Build Quality
- [ ] `npm run build` succeeds with 0 TypeScript errors
- [ ] Main bundle size ≤ 545KB (534KB + 11KB buffer)
- [ ] `npx vitest run` completes in ≤ 22 seconds

### Browser Verification
- [ ] Input-to-input connection shows error toast "输入端口无法连接到输入端口" (not created)
- [ ] Output-to-output connection shows error toast "输出端口无法连接到输出端口" (not created)
- [ ] Self-connection shows error toast "模块无法连接到自身" (not created)
- [ ] Valid connections work correctly
- [ ] Activation pulses flow sequentially without issues

## Out of Scope

The following are explicitly NOT being done in this round:

1. **Circular path detection** — Not in spec, do not add
2. **Connection stability visual indicators (green/yellow/red)** — Not in spec, do not add
3. **AI-powered connection suggestions** — Future feature requiring AI integration
4. **Machine recipe auto-detection** — Complex pattern matching not in scope
5. **Community challenge circuit templates** — Separate feature from connection system
6. **Breaking changes to existing connection flow** — Only adding validation, not changing valid path
7. **Changes to module placement or canvas interaction** — Only connection system touched
8. **Disconnection confirmation UI** — P1 item deferred to future round (AC-DISCONN-001)
9. **Connection error summary notifications** — P1 item deferred to future round (AC-ERROR-001)
10. **Module state persistence** — P1 item deferred to future round (AC-MODULE-STATE-003)
11. **Port type drag indicators** — P1 item deferred to future round (AC-PORT-001)
12. **Any injected content unrelated to this contract** — Removed

## Technical Notes

### Connection Validation Logic (Aligned with Spec)

```typescript
// src/utils/connectionValidator.ts
export interface ValidationResult {
  valid: boolean;
  error?: {
    code: 'SAME_PORT_TYPE' | 'SELF_CONNECTION' | 'DUPLICATE_CONNECTION';
    message: string;
  };
}

export function validateConnection(
  sourceModuleId: string,
  sourcePort: Port,
  targetModuleId: string,
  targetPort: Port,
  existingConnections: Connection[],
  allModules: PlacedModule[]
): ValidationResult {
  // Check self-connection (per AC-CONN-VALID-003)
  if (sourceModuleId === targetModuleId) {
    return {
      valid: false,
      error: { code: 'SELF_CONNECTION', message: '模块无法连接到自身' }
    };
  }

  // Check port types (output → input required) per AC-CONN-VALID-001/002
  if (sourcePort.type === targetPort.type) {
    return {
      valid: false,
      error: {
        code: 'SAME_PORT_TYPE',
        message: sourcePort.type === 'input' 
          ? '输入端口无法连接到输入端口'
          : '输出端口无法连接到输出端口'
      }
    };
  }

  // Check for duplicate connections
  const duplicate = existingConnections.find(
    c => c.sourceModuleId === sourceModuleId &&
         c.targetModuleId === targetModuleId
  );
  if (duplicate) {
    return {
      valid: false,
      error: { code: 'DUPLICATE_CONNECTION', message: '连接已存在' }
    };
  }

  return { valid: true };
}
```

---

## Contract Revision History

### Round 91 Revisions (v2)

**RR-001: REMOVE INJECTED CONTENT** ✓ COMPLETED
- Issue: The contract contained thousands of characters of injected Chinese text describing unrelated project
- Resolution: Technical Notes section rewritten to contain only relevant connection validation code

**RR-002: REMOVE NON-SPEC FEATURES** ✓ COMPLETED
- Issue: "Circular path detection" (P0) and "Connection stability visual indicators" (P1) were added but NOT in spec
- Resolution: These items removed from contract deliverables and marked in Out of Scope section

**RR-003: FIX FALSE COMPLETION CLAIM** ✓ COMPLETED
- Issue: Contract previously claimed "Remaining P0/P1: None — all core features implemented"
- Resolution: Section now explicitly lists remaining P1 items (AC-ERROR-001, AC-DISCONN-001, AC-MODULE-STATE-003, AC-PORT-001)

**RR-004: SPEC TRACEABILITY VERIFIED** ✓ COMPLETED
- Issue: Items traced to spec without verification they actually exist there
- Resolution: Spec Traceability section now explicitly references spec acceptance criteria (AC-TIMING-003, AC-CONN-VALID-001/002/003, AC-ERROR-002, AC-ERROR-003, AC-PULSE-001)
