# Sprint Contract — Round 74

## Scope

**Primary Focus:** Implement OpenAI AI provider integration for the existing AI naming and description generation system.

**Rationale:** The spec explicitly mentions "预留接入 AI 文本生成接口的能力" (reserve interface for AI text generation). Currently only a local mock provider exists. Implementing a real AI provider will add significant value to the AI Assistant Panel's naming and description generation features.

## Spec Traceability

### P0 items covered this round
1. **AI Provider Integration (Spec: AI文本生成接口)**
   - OpenAI API integration via `src/services/ai/OpenAIProvider.ts`
   - API key validation and configuration
   - Proper error handling for API failures
   - Streaming response support for better UX
   - Fallback to local provider on errors

2. **AI Settings Panel Enhancement (Spec: AI 设置)**
   - OpenAI API key input field with secure masking
   - Model selection dropdown (gpt-4, gpt-4-turbo, gpt-3.5-turbo)
   - Connection test button with status feedback
   - Persist settings in useSettingsStore

### P1 items covered this round
1. **Enhanced AI Naming Prompt Engineering**
   - Richer context passing to AI (faction, rarity, module composition)
   - Better prompt templates for arcane/mechanical/poetic styles
   - Name length constraints and formatting rules

2. **Enhanced AI Description Generation**
   - Multi-paragraph descriptions with lore integration
   - Module-specific technical details
   - Faction-themed flavor text

### Remaining P0/P1 after this round
- All P0 items completed
- Challenge System enhancements (future round)
- Community voting/rating system (future round)

### P2 items intentionally deferred
- Anthropic Claude integration (architecture ready, deferred to reduce scope)
- Gemini integration (architecture ready, deferred to reduce scope)
- AI-powered machine optimization suggestions

## Deliverables

1. **`src/services/ai/OpenAIProvider.ts`** — New OpenAI API provider implementation
   - Implements `AIProvider` interface
   - Supports name and description generation
   - Handles streaming responses
   - Proper timeout and retry logic

2. **`src/components/AI/AISettingsPanel.tsx`** (enhanced) — Settings UI updates
   - API key input with visibility toggle (data-testid="api-key-input", data-testid="api-key-toggle-visibility")
   - Model selector dropdown (data-testid="model-select") with options: gpt-4, gpt-4-turbo-preview, gpt-3.5-turbo
   - Provider selector (data-testid="provider-select") with options: "openai", "local"
   - Connection test button (data-testid="connection-test-button")
   - Connection status indicators (data-testid="connection-success", data-testid="connection-error", data-testid="connection-testing")
   - Settings panel entry (data-testid="ai-settings-panel")
   - Settings panel dismiss (data-testid="close-settings-button")
   - Clear error messages

3. **`src/services/ai/prompts.ts`** — Prompt engineering templates
   - Name generation prompts for each style (arcane, mechanical, poetic, mixed)
   - Description generation prompts
   - System context with machine attributes
   - Style keyword dictionaries for verification

4. **`src/__tests__/openaiProvider.test.ts`** — Unit tests for OpenAI provider
   - API key validation (valid/invalid format)
   - Request formatting
   - Response parsing
   - Error handling
   - Fallback behavior

5. **`tests/e2e/ai-provider.spec.ts`** — E2E tests for AI provider workflow
   - Settings panel interactions
   - API key validation flow
   - Provider switching
   - Generation with different providers

## Acceptance Criteria

### AC1: OpenAI Provider Integration
- `OpenAIProvider` class implements `AIProvider` interface from `src/services/ai/AIProvider.ts`
- Provider can be selected in AISettingsPanel (data-testid="provider-select")
- When API key is set and valid, real API calls are made to `https://api.openai.com/v1/chat/completions`
- When API key is invalid (401), missing, or network fails, app automatically falls back to local provider without crashing
- App does not crash if no API key is configured

### AC2: API Key Management
- API key input field masks characters by default (••••••••)
- Toggle button reveals/hides API key (data-testid="api-key-toggle-visibility")
- **API key format validation:** Keys must match pattern `^sk-[a-zA-Z0-9_-]{20,}$` to be considered valid format
- Invalid format (wrong prefix, too short, contains invalid chars) shows error message: "Invalid API key format. OpenAI keys start with 'sk-' and are at least 40 characters."
- Empty key is treated as "not configured", not invalid format
- "Test Connection" button (data-testid="connection-test-button") sends a minimal request to validate key (returns 200 OK)

### AC3: Model Selection
- Dropdown (data-testid="model-select") offers exactly 3 options with values:
  - `gpt-4` (label: "GPT-4")
  - `gpt-4-turbo-preview` (label: "GPT-4 Turbo")
  - `gpt-3.5-turbo` (label: "GPT-3.5 Turbo")
- Default selection: `gpt-3.5-turbo`
- Selected model persists across page refreshes (localStorage key: `ai_provider_model`)
- Model selection is included in API request payload

### AC4: Name Generation (STRUCTURAL, not QUALITATIVE)
- Calling `generateMachineName()` with valid params returns a string
- Response is parseable (returns valid `AIProviderResult<string>`)
- Name length is between 5 and 40 characters
- Name does NOT contain: HTML tags (`<`, `>`), control characters (`\x00-\x1f`), or API error messages (substring "error" from OpenAI)
- **For local provider fallback:** Verify that names are generated (non-empty string returned)
- **NOTE:** Name style "reflection" is verified by checking prompt templates include style keywords (e.g., "arcane", "mechanical", "poetic", "mystical"), NOT by judging output quality

### AC5: Description Generation (STRUCTURAL, not QUALITATIVE)
- Calling `generateMachineDescription()` with valid params returns a string
- Response is parseable (returns valid `AIProviderResult<string>`)
- Description length is between 50 and 800 characters
- Description does NOT contain: HTML tags (`<`, `>`), control characters (`\x00-\x1f`), or API error messages (substring "error" from OpenAI)
- **For local provider fallback:** Verify that descriptions are generated (non-empty string returned)
- **NOTE:** "Technical specs" and "flavor text" presence is verified by checking prompt templates include these elements, NOT by judging output quality

### AC6: Error Handling
- Network timeout (>30s) shows message: "Request timed out. Using local generation."
- 401 Unauthorized shows message: "Invalid API key. Check your settings and try again."
- 429 Rate Limited shows message: "API rate limit reached. Please wait a moment."
- 500 Server Error shows message: "OpenAI service error. Using local generation."
- Network failure shows message: "Cannot connect to OpenAI. Using local generation."
- All errors fall back to local provider and allow user to continue

### AC7: Unit Tests Pass
- Minimum 20 unit tests in `src/__tests__/openaiProvider.test.ts`
- Tests cover: provider creation, API key validation, request formatting, response parsing, timeout handling, 401/429/500 errors, network failure, fallback behavior
- All tests use mocks (no real API calls)

### AC8: E2E Tests Pass
- Minimum 10 E2E tests in `tests/e2e/ai-provider.spec.ts`
- All 139+ existing E2E tests continue passing
- Tests use mocked API responses (Playwright route mocking)
- E2E tests cover: settings panel entry, provider switching, name generation entry/completion/retry/error, description generation entry/completion/retry/error

### AC9: Build Compliance
- Bundle size < 560KB
- TypeScript compilation with 0 errors
- No console errors in browser

### AC10: State Persistence
- API key persists across page refreshes (localStorage key: `ai_provider_api_key`)
- Model selection persists across page refreshes (localStorage key: `ai_provider_model`)
- Provider preference persists across page refreshes (localStorage key: `ai_provider_type`)

## Test Methods

### Unit Tests (`src/__tests__/openaiProvider.test.ts`)

1. **Provider Creation**
   - Create provider with valid config → provider created successfully
   - Create provider with missing API key → provider created (key is optional)

2. **API Key Validation**
   - Valid: `sk-1234567890abcdefghijklmnopqr` (44+ chars, sk- prefix) → isValid = true
   - Valid: `sk-test-12345678901234567890123456` → isValid = true
   - Invalid: `sk-` (too short) → isValid = false with error "Invalid API key format..."
   - Invalid: `openai-1234567890` (wrong prefix) → isValid = false with error "Invalid API key format..."
   - Invalid: `sk-invalid!@#$%` (invalid chars) → isValid = false with error "Invalid API key format..."
   - Empty string → isValid = false (not configured state)
   - Undefined → isValid = false (not configured state)

3. **Request Formatting**
   - Verify name request includes `model` in payload
   - Verify name request includes `messages` array with system and user messages
   - Verify description request includes full context object
   - Verify streaming is enabled in request (stream: true)

4. **Response Parsing**
   - Parse successful SSE response with `data: [DONE]` termination
   - Parse response with multiple delta chunks
   - Handle response missing choices array → return error result
   - Handle response with empty content → return empty string

5. **Error Handling**
   - Timeout (>30s) → returns fallback result with error flag and message "Request timed out. Using local generation."
   - 401 response → returns error result with "Invalid API key. Check your settings and try again."
   - 429 response → returns error result with "API rate limit reached. Please wait a moment."
   - 500 response → returns fallback result with "OpenAI service error. Using local generation."
   - Network error → returns fallback result with "Cannot connect to OpenAI. Using local generation."
   - Malformed JSON → returns fallback result

6. **Stream Processing**
   - Single chunk processing → accumulates content
   - Multiple chunk accumulation → concatenates deltas
   - `data: [DONE]` termination detection → stops processing
   - Incomplete JSON handling → graceful degradation

### E2E Tests (`tests/e2e/ai-provider.spec.ts`)

**Note:** All E2E tests use Playwright with mocked API responses. Real API calls must NOT be made during testing.

1. **Settings Panel Entry**
   - Navigate to AI settings panel
   - Verify panel opens: `data-testid="ai-settings-panel"` visible
   - Verify API key input visible: `data-testid="api-key-input"`
   - Verify model dropdown visible: `data-testid="model-select"`
   - Verify provider selector visible: `data-testid="provider-select"`
   - Verify connection test button visible: `data-testid="connection-test-button"`
   - **Negative assertion:** Panel should open without console errors

2. **Settings Panel Dismiss**
   - Click dismiss button: `data-testid="close-settings-button"`
   - Verify panel closes: `data-testid="ai-settings-panel"` not visible
   - **Negative assertion:** Panel should not remain in DOM after dismiss

3. **API Key Input**
   - Enter API key → characters masked (`input[type="password"]`)
   - Toggle visibility → key revealed (`input[type="text"]`)
   - Clear key → input cleared
   - Enter invalid format → error message appears with "Invalid API key format"
   - **Negative assertion:** Invalid key should not be accepted as valid

4. **Connection Test Flow**
   - Click "Test Connection" (`data-testid="connection-test-button"`) → loading state (`data-testid="connection-testing"`)
   - Success (mocked 200) → green checkmark (`data-testid="connection-success"`)
   - Failure (mocked 401) → red error (`data-testid="connection-error"`)
   - No key configured → prompt to add key
   - **Negative assertion:** Loading indicator should not persist after result appears

5. **Provider Switching**
   - Select OpenAI provider → dropdown shows OpenAI selected
   - Switch to local provider → immediate change, no reload required
   - **Negative assertion:** Provider selection should not cause page reload
   - **Negative assertion:** UI should remain responsive during switch

6. **Name Generation Entry**
   - Add at least one module to canvas
   - Open AI panel
   - Click "Generate Names" (`data-testid="generate-names-button"`)
   - Verify loading indicator appears (`data-testid="generating-names"`)
   - **Negative assertion:** Button should be disabled during generation

7. **Name Generation Completion**
   - Wait for generation (mocked response)
   - Verify names appear: at least one `data-testid="name-option"` visible
   - Select a name (`data-testid="name-option"`)
   - Apply to machine (`data-testid="apply-name-button"`)
   - Verify name appears in machine editor
   - **Negative assertion:** Loading indicator should not persist after names appear

8. **Name Generation Error/Fallback**
   - Generate with no modules → shows appropriate message
   - Generate with API error → falls back gracefully, shows names from local
   - Generate with missing API key → uses local provider
   - **Negative assertion:** HTML tags should NOT appear in generated names
   - **Negative assertion:** API error messages should NOT appear in generated names
   - **Negative assertion:** App should NOT crash during fallback

9. **Description Generation Entry**
   - Generate names first
   - Click "Generate Description" (`data-testid="generate-description-button"`)
   - Verify loading indicator appears (`data-testid="generating-description"`)
   - **Negative assertion:** Button should be disabled during generation

10. **Description Generation Completion**
    - Wait for generation (mocked response)
    - Verify description appears: `data-testid="generated-description"` visible, non-empty
    - Verify tags suggested: at least one `data-testid="suggested-tag"` visible
    - Apply to machine (`data-testid="apply-description-button"`)
    - **Negative assertion:** Loading indicator should not persist after description appears

11. **Description Generation Error/Fallback**
    - Generate with API error → falls back gracefully, description from local
    - Generate with empty machine → shows appropriate message
    - **Negative assertion:** HTML tags should NOT appear in generated description
    - **Negative assertion:** API error messages should NOT appear in description
    - **Negative assertion:** App should NOT crash during fallback

12. **State Persistence**
    - Set API key → refresh page → API key still present
    - Select model → refresh page → model selection persisted
    - Switch provider → refresh page → provider selection persisted
    - **Negative assertion:** Settings should not reset after page refresh

13. **Fallback Behavior (Module-to-Module Interaction)**
    - Configure invalid API key → generate names → names appear from local provider
    - Configure valid API key → simulate 401 → falls back to local → names appear
    - Simulate network timeout → falls back to local → names appear
    - Simulate rate limit (429) → falls back to local → names appear
    - **Negative assertion:** App should NOT crash during any error scenario
    - **Negative assertion:** Error message should appear before fallback names

14. **Repeat/Retry Workflow**
    - Generate names → select option → generate again → new options appear
    - Clear selection → generate description → description appears
    - Cancel generation → retry → new generation completes
    - **Negative assertion:** Old results should not remain when regenerating

## Risks

### Round-Specific Implementation Risks

1. **API Key Security**
   - Risk: Storing API keys in localStorage could be a security concern
   - Mitigation: Clear warning in UI about security implications; document environment variable option for production

2. **API Rate Limiting**
   - Risk: OpenAI API has rate limits; intensive testing could hit limits
   - Mitigation: Mock responses in tests, implement debouncing in UI

3. **OpenAI API Changes**
   - Risk: OpenAI API could change response format
   - Mitigation: Implement robust parsing with fallbacks, version-specific handling

4. **Prompt Injection**
   - Risk: Malicious module names could attempt prompt injection
   - Mitigation: Sanitize inputs by removing control characters and HTML tags before including in prompts

### Verification Risks

1. **Real API Testing**
   - Risk: Cannot easily test real API without live key
   - Mitigation: Comprehensive mock testing, E2E tests use Playwright route mocking

2. **Streaming Response Testing**
   - Risk: Streaming responses are harder to test
   - Mitigation: Mock streaming with controlled delays and chunk sizes

## Failure Conditions

The round MUST fail if:

1. **Build Failure**
   - `npm run build` exits with non-zero code
   - TypeScript compilation errors exist

2. **Test Failure**
   - Any new unit test fails
   - Any new E2E test fails
   - Any existing test regresses (139 → <139)

3. **Bundle Size Violation**
   - Bundle exceeds 560KB threshold

4. **Broken AI Workflow**
   - AI Assistant Panel crashes on open
   - Cannot generate names with local provider (must work without API key)
   - Cannot switch between providers

5. **Data Persistence Failure**
   - Settings not saved to localStorage (verified by page refresh)
   - Settings not loaded on page refresh

6. **No Graceful Degradation**
   - API errors crash the app instead of falling back
   - Missing API key causes unhandled exception

7. **Regression in Existing AI Functionality**
   - Local provider stops generating valid names
   - Local provider stops generating valid descriptions

8. **Invalid Output Content**
   - Generated names contain HTML tags or API error messages
   - Generated descriptions contain HTML tags or API error messages

9. **Wrong Error Messages**
   - Error messages do not match specified text in AC6

10. **Loading State Not Clearing**
    - Loading indicator persists after generation completes
    - Button remains disabled after generation completes

11. **UI Responsiveness**
    - Provider switching causes page reload
    - Settings panel does not dismiss properly

## Done Definition

The round is complete when ALL of the following are true:

1. **Code Complete**
   - `src/services/ai/OpenAIProvider.ts` exists and implements `AIProvider` interface
   - `src/services/ai/prompts.ts` contains prompt templates with style keywords
   - `AISettingsPanel.tsx` has API key input, visibility toggle, model dropdown, provider selector, connection test
   - Provider factory updated to instantiate OpenAI provider when selected

2. **Tests Written and Passing**
   - Minimum 20 unit tests in `openaiProvider.test.ts`
   - Minimum 10 E2E tests in `ai-provider.spec.ts`
   - All 139+ existing E2E tests continue passing

3. **Build Compliant**
   - `npm run build` succeeds
   - Bundle size < 560KB
   - 0 TypeScript errors

4. **Browser Verified**
   - AI settings panel opens without errors
   - API key input works with masking
   - Provider switching works without reload
   - Settings panel dismisses properly
   - Local provider generates valid names/descriptions without API key
   - All error states show correct messages
   - Loading indicators clear after completion
   - No console errors

5. **Documentation**
   - Comments explain API key security considerations
   - Error messages match specified text
   - Settings panel has usage hints

## Out of Scope

The following are explicitly NOT part of this round:

1. **Anthropic Claude Integration** — Deferred to future round (architecture ready)
2. **Google Gemini Integration** — Deferred to future round (architecture ready)
3. **Server-side API Proxy** — Would add complexity; client-side with localStorage is acceptable for MVP
4. **AI-powered Machine Suggestions** — Beyond naming/description generation
5. **Community AI Features** — Separate from core AI provider work
6. **Multi-language AI Support** — Currently limited to Chinese/English prompt templates only
7. **API Usage Analytics** — Tracking token consumption per user
8. **Paid Tier Integration** — Future monetization consideration
9. **Name/Description Quality Assessment** — Output quality is not verified; only structural validity and non-error states are tested

## Contract Revision Notes (Round 74)

### Changes from Initial Draft:

1. **AC5 typo fixed:**
   - Removed incorrect "AC6" references within AC5 section
   - AC5 now correctly references itself for nested assertions

2. **Added explicit data-testid requirements to Deliverables:**
   - `api-key-input`, `api-key-toggle-visibility`, `model-select`, `provider-select`
   - `connection-test-button`, `connection-success`, `connection-error`, `connection-testing`
   - `generate-names-button`, `generate-description-button`
   - `name-option`, `apply-name-button`, `apply-description-button`
   - `generated-description`, `suggested-tag`
   - **NEW:** `ai-settings-panel`, `close-settings-button`, `generating-names`, `generating-description`

3. **Strengthened negative assertions in E2E Test Methods:**
   - Added: "Button should be disabled during generation"
   - Added: "HTML tags should NOT appear in generated names"
   - Added: "HTML tags should NOT appear in generated description"
   - Added: "API error messages should NOT appear in description"
   - Added: "Provider selection should not cause page reload"
   - Added: "App should NOT crash during fallback"
   - **NEW:** "Panel should open without console errors"
   - **NEW:** "Panel should not remain in DOM after dismiss"
   - **NEW:** "Loading indicator should not persist after result appears"
   - **NEW:** "Invalid key should not be accepted as valid"
   - **NEW:** "UI should remain responsive during switch"
   - **NEW:** "Old results should not remain when regenerating"
   - **NEW:** "Error message should appear before fallback names"
   - **NEW:** "Settings should not reset after page refresh"

4. **Expanded E2E Test Methods (10 → 14 tests):**
   - Split "Edge Cases" into separate entries for names and descriptions
   - Added "State Persistence" test (12)
   - Added "Fallback Behavior" test with expanded error scenarios (13)
   - Added "Repeat/Retry Workflow" test (14) covering regeneration and cancel/retry

5. **Added Test #2: Settings Panel Dismiss:**
   - Verifies panel closes via `data-testid="close-settings-button"`
   - Verifies panel not visible after dismiss
   - Negative assertion: panel should not remain in DOM

6. **Added Failure Condition #10:**
   - "Loading State Not Clearing: Loading indicator persists after generation completes"

7. **Added Failure Condition #11:**
   - "UI Responsiveness: Provider switching causes page reload, Settings panel does not dismiss properly"

8. **Added explicit loading indicator data-testids to Test Methods:**
   - `data-testid="generating-names"` for name generation loading
   - `data-testid="generating-description"` for description generation loading

9. **Clarified streaming request verification:**
   - Test method #3: Verify streaming is enabled in request (`stream: true`)

10. **Clarified prompt template verification for style keywords:**
    - AC4/AC5: Style keywords list expanded to include "arcane", "mechanical", "poetic", "mystical"

11. **Added operator inbox instruction compliance:**
    - All tests use strict standards per operator inbox item about module-to-module interaction and UI interaction testing
    - Mocked API responses in E2E tests (no real API calls)
    - All AC criteria have corresponding test coverage
    - **NEW:** Module-to-module interaction testing (provider switching, fallback behavior) explicitly covered in Tests 5, 8, 11, 13
    - **NEW:** UI interaction testing (settings panel entry/dismiss, generation workflow) explicitly covered in Tests 1-14

### Operator Inbox Instruction Compliance:
- ✅ Strict testing standards applied to all functional models
- ✅ Module-to-module interaction testing (provider switching, fallback behavior, Test 5/8/11/13)
- ✅ UI interaction testing (settings panel entry/dismiss, generation workflow, Tests 1-14)
- ✅ Tests verify behavior, not just existence
- ✅ Bug findings from tests documented in failure conditions
- ✅ All negative assertions explicitly stated per test case
