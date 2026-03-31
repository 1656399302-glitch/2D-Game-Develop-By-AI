**APPROVED** — Contract reviewer approved for Round 59 execution.

# Sprint Contract — Round 59

## Scope

**Primary Focus:** Integrate the AI service layer (from Round 58) into the AI Assistant UI and add AI provider settings capability.

**Dependencies:** This contract depends on `useAINaming` hook from Round 58, which returns `{ generateName, generateDescription, generateFullAttributes, isLoading, error, isUsingAI, currentProvider, setProvider }`.

**Problem Statement:** Round 58 implemented the AI service architecture with `AIProvider` interface, `LocalAIProvider`, `AIServiceFactory`, and `useAINaming` hook. However, the `AIAssistantPanel` component still uses the old `aiIntegration` utilities and hasn't been updated to leverage the new service layer. This creates maintenance overhead and prevents users from configuring AI provider settings.

## Spec Traceability

### P0 items covered this round

1. **AI Assistant UI Integration** (spec: "创作工具 + 动画展示 + 图鉴收集 + 随机生成 + 导出分享")
   - Refactor `AIAssistantPanel` to use `useAINaming` hook from `src/hooks/useAINaming.ts`
   - Remove dependency on old `aiIntegration` utilities for name/description generation
   - Support provider switching via `setProvider` from hook

2. **AI Provider Settings** (spec: "AI 命名描述助手" → AI provider configuration)
   - Create `useSettingsStore` for persistent AI provider configuration
   - Add settings panel for selecting AI provider type
   - Persist settings to localStorage

3. **Backward Compatibility** (from Round 58 AC6)
   - Ensure existing machine naming and description generation continues to work
   - No breaking changes to codex save functionality

### P1 items covered this round

1. **Settings Persistence**
   - Persist selected provider type across sessions
   - Store API configuration when user provides it

2. **Loading States**
   - Use `isLoading` state from `useAINaming` hook for UI feedback
   - Display appropriate loading indicators during generation

### P0/P1 items remaining after this round

- Full AI provider integration (OpenAI, Anthropic, Gemini) - architecture ready, implementation pending API keys
- AI naming UI polish and edge case handling (future round)

### P2 intentionally deferred

- Advanced AI configuration options (custom endpoints, model selection)
- Usage statistics and cost tracking
- AI service monitoring dashboard

## Deliverables

| File | Type | Purpose |
|------|------|---------|
| `src/store/useSettingsStore.ts` | New | Zustand store for AI provider settings with persist middleware |
| `src/components/AI/AIAssistantPanel.tsx` | Refactored | Use `useAINaming` hook instead of old `aiIntegration` utilities |
| `src/components/AI/AISettingsPanel.tsx` | New | Provider type selector with API key input fields |
| `src/__tests__/useSettingsStore.test.ts` | New | 15+ tests for settings store |
| `src/__tests__/AIAssistantPanel.test.tsx` | New | 10+ tests for refactored panel |
| `src/__tests__/AISettingsPanel.test.tsx` | New | 10+ tests for settings panel |

### Test Count Breakdown

| Test File | Min Tests | Coverage |
|-----------|-----------|----------|
| `useSettingsStore.test.ts` | 15 | Store creation, persistence, provider updates, hydration |
| `AIAssistantPanel.test.tsx` | 10 | Hook integration, loading states, name generation, backward compat |
| `AISettingsPanel.test.tsx` | 10 | Provider selection, API key input, display current provider |
| **Total** | **35** | |

## Acceptance Criteria

### AC1: AI Assistant Uses New Service
- `AIAssistantPanel` imports from `hooks/useAINaming` instead of `utils/aiIntegrationUtils`
- Name generation calls `generateName()` from hook
- Description generation calls `generateDescription()` from hook
- No imports from `src/utils/aiIntegrationUtils` in `AIAssistantPanel`

### AC2: Settings Store Persistence
- `useSettingsStore` persists `providerType` to localStorage
- Provider type survives page refresh (recreation of store)
- Default provider is 'local'
- Store returns correct initial state on hydration

### AC3: Provider Selection UI
- Settings panel shows radio buttons for provider types (local, OpenAI, Anthropic, Gemini)
- Selecting a provider updates `useSettingsStore.providerType`
- Current provider is displayed in AI Assistant panel
- Settings panel has close/dismiss functionality

### AC4: Loading State Integration
- Button shows loading spinner when `isLoading` is true
- Buttons are disabled during loading
- Error messages display when generation fails with non-empty `error` string
- Loading state clears after generation completes

### AC5: Backward Compatibility
- Codex save functionality works unchanged
- Machine activation works unchanged
- Existing tests pass (2202+ tests)

### AC6: Build Integrity
- 0 TypeScript errors
- All existing tests pass
- New tests pass (minimum 35 new tests)
- Bundle size stays under 500KB

### AC7: Stateful Workflow Coverage (UI Components)
- **AIAssistantPanel Entry**: Panel opens and initializes hook correctly
- **AIAssistantPanel Completion**: Name/description generation completes with results
- **AIAssistantPanel Error**: Failed generation shows error, panel remains functional
- **AIAssistantPanel Repeat**: Can generate again after completion or error
- **AISettingsPanel Entry**: Settings open and show current provider
- **AISettingsPanel Dismiss**: Settings close without side effects
- **AISettingsPanel Persistence**: Settings survive panel close/reopen cycle

### AC8: Negative Assertions
- `AIAssistantPanel` should not import from `utils/aiIntegrationUtils`
- Settings panel should not crash on missing API keys
- Loading state should not remain after component unmount
- Error state should not persist after successful generation

## Test Methods

### TM1: AC1 Verification (AI Assistant Uses New Service)

**Source Code Check:**
```bash
# Must find useAINaming import/usage
grep -n "useAINaming" src/components/AI/AIAssistantPanel.tsx
# Expected: Import line and function calls

# Must NOT find old utilities
grep -n "aiIntegrationUtils" src/components/AI/AIAssistantPanel.tsx
# Expected: No output (empty result)
```

**Runtime Check:**
```bash
npm run build
# Expected: 0 TypeScript errors
```

### TM2: AC2 Verification (Settings Store Persistence)

**Unit Test Verification:**
```typescript
// useSettingsStore.test.ts
test('should persist providerType to localStorage')
test('should restore providerType after store recreation')
test('should default to local provider')
test('should handle hydration correctly')
```

**Runtime Check:**
1. Mount settings store
2. Set `providerType` to 'openai'
3. Simulate page refresh (unmount/remount)
4. Verify `getState().providerType` === 'openai'
5. Verify NOT === 'local' (would indicate persistence failure)

### TM3: AC3 Verification (Provider Selection UI)

**Unit Test Verification:**
```typescript
// AISettingsPanel.test.tsx
test('should render radio buttons for all provider types')
test('should select OpenAI when OpenAI radio clicked')
test('should update settings store when provider selected')
test('should display current provider selection')
```

**Integration Check:**
1. Mount AIAssistantPanel
2. Open settings panel
3. Click "OpenAI" radio button
4. Verify `useSettingsStore.getState().providerType` returns 'openai'
5. Close settings panel
6. Reopen settings panel
7. Verify "OpenAI" is still displayed as selected

### TM4: AC4 Verification (Loading State Integration)

**Unit Test Verification:**
```typescript
// AIAssistantPanel.test.tsx
test('should show loading spinner when isLoading is true')
test('should disable buttons when isLoading is true')
test('should display error message when error is not null')
test('should clear loading state after generation completes')
```

**Workflow Check:**
1. Add modules to canvas
2. Open AIAssistantPanel
3. Mock `isLoading` to true
4. Verify button shows spinner icon
5. Verify button has `disabled` attribute
6. Mock `isLoading` to false, `error` to null
7. Verify button re-enables
8. Verify no spinner displayed

### TM5: AC5 Verification (Backward Compatibility)

**Test Suite Check:**
```bash
npm test -- --run
# Expected: All 2202+ tests pass, 0 failures
```

**Manual Check:**
1. Create new machine with modules
2. Save to codex - verify save completes without errors
3. Activate machine - verify animation plays
4. Edit module - verify edit works

### TM6: AC6 Verification (Build Integrity)

**Build Check:**
```bash
npm run build
# Expected: 0 TypeScript errors, bundle < 500KB
```

**Test Count Check:**
```bash
npm test -- --run --reporter=verbose 2>&1 | grep "Tests"
# Expected: Total tests >= 2237 (2202 existing + 35 new)
```

### TM7: AC7 Verification (Stateful Workflow Coverage)

**AIAssistantPanel Workflow Tests:**
```typescript
// AIAssistantPanel.test.tsx
test('should initialize hook on mount')
test('should complete name generation and display result')
test('should show error and remain functional after failure')
test('should allow repeated generation after completion')
test('should allow retry after error')
```

**AISettingsPanel Workflow Tests:**
```typescript
// AISettingsPanel.test.tsx
test('should open and display current provider')
test('should close without side effects')
test('should persist selection after close and reopen')
```

### TM8: AC8 Verification (Negative Assertions)

**Negative Test Verification:**
```typescript
// AIAssistantPanel.test.tsx
test('should not import from aiIntegrationUtils')
test('should not have disabled button after successful generation')
test('should not show spinner when not loading')
```

```typescript
// AISettingsPanel.test.tsx
test('should not crash when API keys are empty')
test('should not persist invalid provider selection')
```

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Refactoring Regression** | Medium | High | Comprehensive test coverage (35+ tests), manual verification after refactor |
| **localStorage Hydration** | Low | Medium | Use Zustand persist middleware with proper `onRehydrateStorage` handling |
| **Import Cycles** | Low | Medium | Keep settings store isolated, import types from shared locations only |
| **UI State Desync** | Low | Low | Hook `setProvider` updates both hook state and settings store |

## Failure Conditions

**The round MUST fail if ANY of these conditions occur:**

1. **Breaking Changes**: Any existing functionality (codex save, machine activation, module editing) stops working
2. **Test Regression**: Any of the 2202+ existing tests fail
3. **Type Errors**: Build produces any TypeScript errors
4. **Incomplete Integration**: `AIAssistantPanel` still imports from `utils/aiIntegrationUtils`
5. **Missing Persistence**: Settings don't survive store recreation (page refresh)
6. **Insufficient Test Coverage**: Less than 35 new tests added
7. **Test Failures**: Any of the new tests fail
8. **Build Failure**: Production build fails for any reason

## Done Definition

**All conditions must be TRUE before claiming round complete:**

| # | Condition | Verification Method |
|---|-----------|---------------------|
| 1 | `src/store/useSettingsStore.ts` exists with persist middleware | File exists, `create` uses `persist` |
| 2 | `AIAssistantPanel` imports and uses `useAINaming` hook | `grep "useAINaming" AIAssistantPanel.tsx` finds imports |
| 3 | `AIAssistantPanel` has NO imports from `utils/aiIntegrationUtils` | `grep "aiIntegrationUtils" AIAssistantPanel.tsx` returns empty |
| 4 | `AISettingsPanel` component exists and is integrated | File exists, imported in AIAssistantPanel |
| 5 | `npm run build` completes with 0 TypeScript errors | Build output shows 0 errors |
| 6 | `npm test` passes with all 2202+ existing tests | Test output shows 2202+ pass |
| 7 | Minimum 35 new tests added with >90% pass rate | New test files exist with 35+ tests |
| 8 | Settings persist across store recreation | Test verifies localStorage round-trip |
| 9 | No runtime console errors during AI Assistant usage | Manual verification in browser |
| 10 | Loading states integrate correctly | Tests verify spinner and disabled states |

## Out of Scope

**The following are explicitly NOT part of this sprint:**

1. **Actual AI API Integration** - No real OpenAI/Anthropic/Gemini calls
   - Only local/mock provider works this round
   - API key fields are UI-only, not functional
   - Factory falls back to local provider for non-local types

2. **AI Usage Analytics** - No tracking of generation counts or costs

3. **Advanced AI Settings** - No custom endpoints, model selection, temperature controls

4. **AI History** - No history of generated names/descriptions

5. **AI Batch Generation** - No bulk name/description generation

6. **AI Export** - No special export for AI-generated content

7. **Localization Changes** - No new translation strings beyond existing

8. **Visual Redesign** - No major UI/UX changes to AI Assistant panel beyond functional requirements

9. **Provider Implementation** - OpenAIProvider, AnthropicProvider, GeminiProvider are not implemented this round

10. **Real API Key Storage** - API keys entered in settings are not validated or stored securely
