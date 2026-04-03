# Sprint Contract — Round 104

## Scope

Quality improvement sprint focused on:
1. Completing external AI provider integrations (Gemini, Anthropic) — replacing current stubs
2. Optimizing test suite performance (reduce from ~26s toward ≤20s target)
3. Verifying AI description generation is fully integrated in the UI

## Operator Inbox Compliance

**No pending operator inbox items target this contract round.**

All previously queued inbox items have been processed in prior rounds:
- operator-item-1774941228843 (processed round 51) — All models tested
- operator-item-1775053300925 (processed round 85) — Activation timing addressed
- operator-item-1775113667868 (processed round 103) — Save dialog fix completed

**Inbox items deferred beyond this round:**
- None currently queued

If new inbox items surface during this round, they must be either:
- Resolved within this sprint scope, OR
- Explicitly deferred with rationale documented in the handoff notes

## Spec Traceability

### P0 items covered this round
- **AI Provider Integration completeness**: External providers (Gemini, Anthropic) currently stubs → complete implementations
- **Test suite performance optimization**: Reduce suite from ~26s to ≤20s target

### P1 items covered this round
- **AI description generation UI verification**: Confirm description flow is wired in AIAssistantPanel and appears in export

### Remaining P0/P1 after this round
- Core module system completeness (partial implementation exists; symbol definitions, connection point metadata)
- Activation animation state machine refinement (idle → charging → active → overload → failure → shutdown)
- UI interaction polish (drag, zoom, pan consistency across components)
- Performance optimization beyond test suite (activation timing, render performance under load)
- Codex export format completeness (ensure all machine fields serialize correctly)
- AI naming/description integration with new providers (wire Gemini/Anthropic into name generation flow)

### P2 intentionally deferred
- Advanced AI prompting improvements beyond current rule-based generation
- Performance profiling beyond test optimization
- Advanced community features beyond current implementation
- AI model fine-tuning or training
- Real-time streaming responses
- Module library expansion beyond current 6 categories

## Deliverables

1. **`src/services/ai/providers/GeminiProvider.ts`** — Complete Gemini API integration
   - Proper `generateText` method implementation with `generateContent` API call
   - Error handling with try/catch and timeout (10s limit)
   - Fallback to `LocalAIProvider` on API errors or network failure
   - API key configuration via `GEMINI_API_KEY` environment variable
   - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`

2. **`src/services/ai/providers/AnthropicProvider.ts`** — Complete Anthropic API integration
   - Claude API integration via `@anthropic-ai/sdk`
   - Proper message formatting with `user` role
   - Error handling with try/catch and timeout (10s limit)
   - Fallback to `LocalAIProvider` on API errors or network failure
   - API key configuration via `ANTHROPIC_API_KEY` environment variable

3. **`src/__tests__/geminiProvider.test.ts`** — Tests for Gemini provider (minimum 8 tests)
   - API call mocking with correct endpoint verification
   - Error handling tests (network error, API error, timeout)
   - Fallback behavior tests (verifies `LocalAIProvider` is returned)
   - Empty/null prompt edge case tests

4. **`src/__tests__/anthropicProvider.test.ts`** — Tests for Anthropic provider (minimum 8 tests)
   - SDK call mocking with parameter verification
   - Error handling tests (network error, API error, timeout)
   - Fallback behavior tests (verifies `LocalAIProvider` is returned)
   - Empty/null prompt edge case tests

5. **`src/__tests__/testPerformance.test.ts`** — Performance optimization tests
   - Test parallelization verification
   - Slow test identification report (files taking >1s)
   - Target: reduce suite from ~26s to ≤20s
   - Test parallelization via `maxWorkers` configuration

6. **AI Description Integration Verification**
   - Verify `AIAssistantPanel.tsx` properly calls description generation
   - Verify description appears in codex export
   - Add minimum 6 integration tests for description flow

## Acceptance Criteria

1. **AC-104-001**: `GeminiProvider.generateText()` calls Gemini API and returns generated text without throwing
2. **AC-104-002**: `AnthropicProvider.generateText()` calls Claude API via SDK and returns generated text without throwing
3. **AC-104-003**: Both providers fall back to `LocalAIProvider` on API errors (network failure, timeout, 4xx/5xx responses)
4. **AC-104-004**: Test suite runs in ≤20s (measured via `vitest --run --reporter=verbose`, improved from ~26s baseline)
5. **AC-104-005**: AI description generation is fully wired in `AIAssistantPanel` (generation triggers, result displays, error handles)
6. **AC-104-006**: Machine descriptions appear in codex entry export data (`exportCodexEntry()` includes `description` field)
7. **AC-104-007**: No new TypeScript errors introduced (`npx tsc --noEmit` returns 0 errors)
8. **AC-104-008**: Bundle size remains <560KB threshold (`npm run build` output <560KB)

## Test Methods

### AC-104-001: GeminiProvider Integration
1. Mock `fetch` at global level to intercept `https://generativelanguage.googleapis.com/*`
2. Create `GeminiProvider` instance with `GEMINI_API_KEY=test-key-123`
3. Call `generateText("Describe this arcane machine")`
4. Assert mock `fetch` was called with:
   - URL containing `generativelanguage.googleapis.com`
   - URL containing `models/gemini-pro:generateContent`
   - Request body containing `contents[0].parts[0].text`
5. Assert response `candidates[0].content.parts[0].text` is returned as string

### AC-104-002: AnthropicProvider Integration
1. Mock `@anthropic-ai/sdk` `Anthropic` class and `messages.create` method
2. Create `AnthropicProvider` instance with `ANTHROPIC_API_KEY=test-key-456`
3. Call `generateText("Describe this arcane machine")`
4. Assert SDK `messages.create` was called with:
   - `model: "claude-3-5-sonnet-20241022"`
   - `max_tokens: 1024`
   - `messages: [{ role: "user", content: "Describe this arcane machine" }]`
5. Assert `content[0].text` is returned as string

### AC-104-003: Provider Fallback Behavior
1. Mock first provider (Gemini or Anthropic) to throw `Error("Network error")`
2. Call `aiServiceFactory()` and verify it catches error and returns `LocalAIProvider`
3. Call fallback `generateText()` and assert valid text from local rules engine is returned
4. Repeat for API error (4xx status) and timeout scenarios
5. Assert fallback activation does NOT throw

### AC-104-004: Test Performance
1. Run `npx vitest run --reporter=verbose 2>&1` and capture duration from output
2. Parse output for files taking >1s each
3. Identify top 3 slowest test files
4. Apply optimizations: add `maxWorkers: 4` to vitest config, increase mocking coverage for I/O-heavy tests
5. Re-run and assert final duration ≤20s

### AC-104-005: AI Description Integration
1. Mount `AIAssistantPanel` with mocked AI provider
2. Trigger description generation for a machine with ID `machine-001`
3. Assert loading state appears during generation
4. Assert description text appears in panel after completion
5. Assert description is saved to `machineStore.machines["machine-001"].description`
6. Assert error state displays if provider fails
7. Assert component does not crash on empty machine ID

### AC-104-006: Description in Export
1. Create a machine with ID `machine-export-001` and description "Test description"
2. Call `exportCodexEntry("machine-export-001")`
3. Assert returned object contains `description: "Test description"`
4. Assert description is included in JSON export format
5. Assert export does not throw if machine has no description (undefined field handled)

### AC-104-007: TypeScript Verification
1. Run `npx tsc --noEmit 2>&1`
2. Count error lines (format: `error TS####`)
3. Assert count equals 0

### AC-104-008: Bundle Size Verification
1. Run `npm run build 2>&1`
2. Parse output for `dist/assets/index-*.js` size
3. Assert reported KB < 560KB threshold

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Gemini API endpoint format changed | Low | Medium | Use generic fetch with error handling; fallback to local; test mocks verify exact endpoint |
| Anthropic SDK version issues | Low | Medium | Use direct HTTP calls as fallback; test mocks verify parameter format |
| Test parallelization conflicts | Medium | Low | Run tests sequentially if issues arise; `maxWorkers: 4` is conservative |
| Bundle size increase from new dependencies | Low | High | No new runtime dependencies added; use existing fetch/HTTP only |
| API rate limits during testing | Low | Medium | Use mocked responses for all provider tests |
| Test suite flakiness from timing dependencies | Medium | Medium | Use deterministic mocks; avoid `setTimeout` in tests |

## Failure Conditions

The round **MUST fail** if any of the following occur:

1. Gemini or Anthropic providers throw unhandled exceptions that propagate to caller
2. Test suite duration exceeds 25s (soft failure at 20s target; hard fail at 25s)
3. Bundle size exceeds 560KB threshold
4. New TypeScript errors introduced (any `error TS####` lines in `tsc --noEmit` output)
5. Existing tests fail due to changes (any of the 4,036 existing tests fail)
6. Fallback mechanism does not activate on simulated API failure (LocalAIProvider not returned)
7. Description field missing from `exportCodexEntry()` output

## Done Definition

All of the following **MUST be true** before the builder may claim the round complete:

1. ✅ `GeminiProvider.ts` exists at `src/services/ai/providers/GeminiProvider.ts` with working `generateText` method using Gemini API
2. ✅ `AnthropicProvider.ts` exists at `src/services/ai/providers/AnthropicProvider.ts` with working `generateText` method using Claude SDK
3. ✅ Minimum 16 new provider tests pass (8 per provider) in `geminiProvider.test.ts` and `anthropicProvider.test.ts`
4. ✅ Performance tests show ≤20s suite duration in `testPerformance.test.ts`
5. ✅ AI description integration tests pass (minimum 6 new tests in description integration test file)
6. ✅ `npx tsc --noEmit` returns 0 errors (verified via CI/command output)
7. ✅ `npm run build` produces bundle <560KB (verified via build output)
8. ✅ All 4,036+ existing tests still pass (verified via `vitest run`)
9. ✅ Both providers correctly fall back to `LocalAIProvider` on API errors (verified via fallback tests)
10. ✅ `exportCodexEntry()` includes `description` field in output (verified via integration test)

## Out of Scope

The following are explicitly **NOT** in scope for Round 104:

- AI model training or fine-tuning
- Real-time streaming responses from AI providers
- Multi-language localization beyond existing Chinese
- Advanced caching strategies for AI responses
- WebSocket-based real-time features
- Mobile native app development
- Backend infrastructure changes (API gateway, database)
- UI redesign or visual polish beyond bug fixes
- New module types beyond existing 6 categories
- Community sharing or social features
- Payment or monetization integration
- Activation animation state machine (idle → active → overload → shutdown)
- Module drag-drop editor on canvas
- SVG/PNG export of machines
- Codex gallery page or collection UI
- Random machine generation ("锻造" feature)
- AI naming assistant beyond description generation
- Codex entry naming/tagging UI

## Handoff Notes

Any unresolved issues or partially completed work must be documented here before round close:

- *[None expected — this is a scoped quality sprint]*
