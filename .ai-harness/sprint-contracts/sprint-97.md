APPROVED

---

# Sprint Contract — Round 97

## Scope

This sprint implements the **Anthropic AI Provider** to complete the AI integration story. The Anthropic Claude API will provide high-quality machine name and description generation as an alternative to OpenAI. This follows the same architectural pattern established by the OpenAI provider.

## Spec Traceability

### P0 Items (Must Complete)
- Implement `AnthropicProvider` class following the `AIProvider` interface
- API key validation matching Anthropic key format
- Connection testing to Anthropic API
- Machine name generation via Claude
- Machine description generation via Claude
- Configuration validation and error handling
- Update `AIServiceFactory` to create Anthropic provider
- Unit tests for all new Anthropic provider functionality

### P1 Items (Covered This Round)
- Update settings store documentation for Anthropic support
- Update AI settings panel to show Anthropic as implemented
- Add integration tests between provider factory and Anthropic

### P0 Items Remaining After This Round
- None — AI provider implementation is P0 and completing this round

### P1 Items Remaining After This Round
- None

### P2 Items Intentionally Deferred
- Gemini provider implementation
- Streaming response support
- AI-powered attribute generation

## Deliverables

1. **`src/services/ai/AnthropicProvider.ts`** — New file implementing Claude API integration
2. **`src/__tests__/anthropicProvider.test.ts`** — Comprehensive unit tests (60+ tests)
3. **`src/services/ai/AIServiceFactory.ts`** — Updated to create Anthropic provider instances
4. **`src/store/useSettingsStore.ts`** — Updated provider implementation status

## Acceptance Criteria

1. **AC-ANTHROPIC-001**: `AnthropicProvider` class implements `AIProvider` interface with `providerType === 'anthropic'`
2. **AC-ANTHROPIC-002**: `AnthropicProvider.validateAPIKey()` correctly validates Anthropic keys (format: `sk-ant-...`, minimum 40 chars)
3. **AC-ANTHROPIC-003**: `AnthropicProvider.testConnection()` returns success/error with appropriate error messages for 401, 429, 500+ statuses
4. **AC-ANTHROPIC-004**: `AnthropicProvider.generateMachineName()` returns a valid name via Claude API call
5. **AC-ANTHROPIC-005**: `AnthropicProvider.generateMachineDescription()` returns a valid description via Claude API call
6. **AC-ANTHROPIC-006**: `AnthropicProvider.generateFullAttributes()` falls back to local provider (same as OpenAI)
7. **AC-ANTHROPIC-007**: `AIServiceFactory.createProvider('anthropic', config)` creates valid `AnthropicProvider` instance
8. **AC-ANTHROPIC-008**: `AIServiceFactory.isProviderImplemented('anthropic')` returns `true`
9. **AC-ANTHROPIC-009**: `AIServiceFactory.getImplementedProviders()` includes `'anthropic'`
10. **AC-ANTHROPIC-010**: `AnthropicProvider` handles network errors gracefully with timeout support

## Test Methods

### 1. AnthropicProvider Unit Tests (`src/__tests__/anthropicProvider.test.ts`)

| Test | Method | Verification |
|------|--------|---------------|
| `should have correct providerType` | Direct assertion | `provider.providerType === 'anthropic'` |
| `should validate correct API key format` | `validateAPIKey('sk-ant-...')` | Returns `{ isValid: true }` |
| `should reject invalid key format` | `validateAPIKey('invalid')` | Returns `{ isValid: false, error: ... }` |
| `should reject short keys` | `validateAPIKey('sk-ant-xxx')` | Returns invalid |
| `should test connection successfully` | Mock fetch + `testConnection()` | Returns `{ success: true }` |
| `should handle 401 unauthorized` | Mock 401 + `testConnection()` | Returns `{ success: false, error: 'Invalid API key' }` |
| `should handle 429 rate limit` | Mock 429 + `testConnection()` | Returns `{ success: false, error: 'Rate limit' }` |
| `should handle 500 server error` | Mock 500 + `testConnection()` | Returns `{ success: false, error: ... }` |
| `should handle network timeout` | Mock timeout + `testConnection()` | Returns timeout error |
| `should generate machine name` | Mock API + `generateMachineName()` | Returns string from mocked response |
| `should generate machine description` | Mock API + `generateMachineDescription()` | Returns string from mocked response |
| `should fall back to local for full attributes` | `generateFullAttributes()` | Delegates to LocalAIProvider |
| `should validate config correctly` | `validateConfig()` | Returns validation result |
| `should report availability when API key set` | `isAvailable()` with key | Returns `true` |
| `should report unavailable when no API key` | `isAvailable()` without key | Returns `false` |
| `should update API key` | `setAPIKey()` | Key updated correctly |
| `should update model` | `setModel()` | Model updated correctly |
| `should sanitize HTML from response` | Mock HTML response | HTML stripped from result |

### 2. AIServiceFactory Integration Tests

| Test | Method | Verification |
|------|--------|---------------|
| `should create anthropic provider` | `createProvider('anthropic', config)` | Returns AnthropicProvider instance |
| `should validate anthropic config` | `validateProviderConfig('anthropic', config)` | Returns validation result |
| `should mark anthropic as implemented` | `isProviderImplemented('anthropic')` | Returns `true` |
| `should include anthropic in implemented list` | `getImplementedProviders()` | Array includes 'anthropic' |
| `should return anthropic default config` | `getDefaultProviderConfig('anthropic')` | Returns AnthropicConfig with model |

### 3. Settings Store Documentation Test

| Test | Method | Verification |
|------|--------|---------------|
| `should document anthropic as implemented` | Code inspection | AI provider docs reflect implementation |

## Risks

1. **API Rate Limiting**: Anthropic API has rate limits. Mitigation: Handle 429 responses gracefully with user feedback.
2. **Model Availability**: Claude model names change. Mitigation: Use `claude-3-5-haiku-20241107` as default, allow model override.
3. **Timeout Handling**: Network issues can cause long waits. Mitigation: Implement 30s timeout with AbortSignal.
4. **Response Parsing**: Claude's response format differs from OpenAI. Mitigation: Parse `content[0].text` field correctly.

## Failure Conditions

1. Build fails with TypeScript errors
2. Any new test file has failing tests
3. Bundle size exceeds 560 KB threshold
4. New AnthropicProvider does not implement AIProvider interface correctly
5. API key validation accepts invalid keys or rejects valid Anthropic keys

## Done Definition

All of the following must be true:

1. ✅ `src/services/ai/AnthropicProvider.ts` exists and exports `AnthropicProvider` class
2. ✅ `AnthropicProvider` implements `AIProvider` interface from `AIProvider.ts`
3. ✅ `AnthropicProvider.validateAPIKey()` works correctly for valid/invalid keys
4. ✅ `AnthropicProvider.testConnection()` works with mock API responses
5. ✅ `AnthropicProvider.generateMachineName()` returns valid names
6. ✅ `AnthropicProvider.generateMachineDescription()` returns valid descriptions
7. ✅ `AIServiceFactory.createProvider('anthropic', config)` creates provider
8. ✅ `AIServiceFactory.isProviderImplemented('anthropic')` returns `true`
9. ✅ Test file `src/__tests__/anthropicProvider.test.ts` created with 60+ passing tests
10. ✅ `npm run build` succeeds with bundle < 560 KB
11. ✅ `npm run test` passes with 3,550+ tests (adding ~60 new tests)

## Out of Scope

- Gemini provider implementation
- Streaming response support for any provider
- Real API integration testing (no live API calls in tests)
- Modifying LocalAIProvider or OpenAIProvider implementations
- UI changes to AI Settings Panel (already shows Anthropic, just marked "coming soon")
- Modifying attribute generation logic
- E2E tests (unit tests only this round)
