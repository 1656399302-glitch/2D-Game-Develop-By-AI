# Sprint Contract — Round 179

## Scope

Verification sprint to confirm project stability after Round 178's AI provider settings fix. This sprint ensures the codebase remains production-ready with all tests passing, no regressions, and proper TypeScript compilation.

## Spec Traceability

- **P0 (AI Provider Settings):** Verify Round 178 fix is stable — all four providers (local, openai, anthropic, gemini) render without "即将推出" badges.
- **P1 (Test Stability):** Verify test suite stability, including status of the documented `activationModes.test.ts` intermittent failure.
- **Remaining P0/P1:** None — all spec items from previous rounds are resolved.
- **P2 intentionally deferred:** Advanced community features (exchange backend, social sharing integration), additional AI provider models.

## Deliverables

1. **Verification Report** — Document test suite stability, TypeScript compilation, and build verification. Report must include:
   - Exact command outputs for each verification step
   - Any failures observed with classification (pre-existing vs. new)
   - Final pass/fail status for each acceptance criterion
2. **No Code Changes** — This is a verification sprint; no new features or bug fixes are planned.

## Acceptance Criteria

1. **AC-179-001:** `npm test -- --run` exits with code 0 (all tests pass; per Round 178 QA feedback, the pre-existing `activationModes.test.ts` failure at line 245 is excluded as unrelated).
2. **AC-179-002:** `npx tsc --noEmit` exits with 0 errors.
3. **AC-179-003:** `npm run build` succeeds with bundle size ≤ 512 KB.
4. **AC-179-004:** No "即将推出" badges appear in AI Settings Panel (verified via grep or browser test).
5. **AC-179-005:** All four provider buttons (`local`, `openai`, `anthropic`, `gemini`) render as enabled without disabled attribute.

## Test Methods

1. **AC-179-001 (Full test suite):**
   - Command: `npm test -- --run`
   - Expected: Exit code 0
   - If `activationModes.test.ts` fails: Confirm failure is at line 245, classify as pre-existing per Round 178 QA feedback, document in verification report, and consider AC met
   - If ANY OTHER test fails: AC fails — failure is new, not pre-existing
   - Document: Exact test file results, total pass/fail counts, any failures observed

2. **AC-179-002 (TypeScript compilation):**
   - Command: `npx tsc --noEmit`
   - Expected: Exit code 0, stdout shows 0 errors
   - Document: Compilation output and exit code

3. **AC-179-003 (Bundle size):**
   - Command: `npm run build`
   - Expected: Exit code 0, bundle file ≤ 524,288 bytes (512 KB)
   - Verify: `wc -c dist/assets/index-Bw_wMn-x.js` or equivalent
   - Document: Bundle file path and byte count

4. **AC-179-004 (No "即将推出" badges):**
   - Method A (Source): `grep -r "即将推出" src/components/AI/AISettingsPanel.tsx`
   - Method B (Runtime): `Array.from(document.querySelectorAll('*')).filter(el => el.textContent?.includes('即将推出')).length === 0` in browser
   - Method C (Test): `expect(screen.queryAllByText('即将推出')).toHaveLength(0)` in test
   - Expected: 0 matches/findings
   - Document: Command used and result

5. **AC-179-005 (Provider buttons enabled):**
   - Verify elements with `data-testid="provider-local"`, `data-testid="provider-openai"`, `data-testid="provider-anthropic"`, `data-testid="provider-gemini"` exist
   - For each: Assert element does NOT have `disabled` attribute OR has `disabled={false}`
   - Method: Browser test, component test, or DOM query
   - Document: Query used and each button's disabled state

## Risks

1. **Flaky test risk:** The `activationModes.test.ts` test suite has historically shown intermittent failures due to random generator validation. Per Round 178 QA feedback, this is a pre-existing issue excluded from acceptance criteria. This sprint will document whether it persists or is resolved.
2. **No remediation needed:** This is a verification sprint; if all criteria pass, no code changes are required.

## Failure Conditions

The round MUST fail if ANY of the following conditions are true:

1. `npm test -- --run` exits non-zero for a reason OTHER than the documented pre-existing `activationModes.test.ts` failure (line 245).
2. TypeScript compilation produces errors (`npx tsc --noEmit` exits non-zero with error count > 0).
3. Bundle exceeds 512 KB (524,288 bytes).
4. "即将推出" badges appear for any provider in `AISettingsPanel` (count > 0).
5. Any provider button (`local`, `openai`, `anthropic`, `gemini`) is disabled when it should be enabled.
6. Any verification step cannot be completed due to missing files, broken scripts, or runtime errors unrelated to the sprint's scope.

## Done Definition

ALL of the following must be true before the builder may claim the round complete:

1. `npm test -- --run` exits with code 0 OR exits non-zero ONLY due to the documented `activationModes.test.ts` pre-existing failure (line 245), with the failure documented in the verification report.
2. `npx tsc --noEmit` exits with code 0 (0 TypeScript errors).
3. `npm run build` succeeds with bundle size ≤ 512 KB.
4. No "即将推出" badges in `AISettingsPanel` (verified via grep or test, count must equal 0).
5. All four provider buttons are enabled (not disabled).
6. **Verification report** exists and documents:
   - Exact command outputs for AC-179-001 through AC-179-005
   - Pass/fail status for each acceptance criterion
   - Any pre-existing failures observed (with file, line number, and classification)
   - Any new failures observed (if any — round fails immediately)

## Out of Scope

- No new features or bug fixes
- No changes to AI provider implementations
- No changes to test files (verification only)
- No bundle-splitting or lazy-loading work
- No changes to Exchange, Community, or other non-AI features
- Remediation of the pre-existing `activationModes.test.ts` failure (document only, do not fix)

---

**Operator Inbox Instructions (Round 179):**

- This is a verification-only sprint. Do NOT introduce code changes unless a critical bug is discovered during verification that blocks the verification itself.
- If `activationModes.test.ts` fails during `npm test -- --run`:
  - Do NOT attempt to fix it
  - Document it as pre-existing per Round 178 QA feedback
  - Continue verification of remaining acceptance criteria
  - If the failure is at a different location or has different characteristics than the documented pre-existing failure, treat it as a NEW failure and fail the round
- All five acceptance criteria must be verified and documented in the verification report before claiming round completion
- If any NEW failure is discovered (not the documented `activationModes.test.ts` failure), the round MUST fail — do not remediate, document and fail
