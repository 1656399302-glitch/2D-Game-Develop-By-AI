APPROVED

# Sprint Contract — Round 142

## Scope

This sprint focuses on **enhancing AI naming service robustness** by adding comprehensive unit tests for `LocalAIProvider`, improving error handling for edge cases (empty machines, malformed data), and ensuring consistent generation behavior. This builds on the AI Assistant functionality introduced in previous rounds and addresses potential gaps in test coverage for the local generation path.

## Spec Traceability

### P0 items covered this round
- **LocalAIProvider unit tests** — Comprehensive test coverage for all generation methods (`generateMachineName`, `generateMachineDescription`, `generateFullAttributes`, `validateConfig`, `isAvailable`, `getConfig`)
- **Edge case error handling** — Empty modules array, missing connections, invalid parameters
- **Generation consistency** — Deterministic name/description generation with proper fallback behavior

### P1 items covered this round
- **Provider configuration validation** — Test config validation paths
- **Tag-based name filtering** — Test faction/tag/rarity prefix filtering

### Remaining P0/P1 after this round
- All P0 items completed (AI naming service is core functionality)
- Community features, faction system, tech tree, challenge mode remain functional and stable

### P2 intentionally deferred
- External AI provider integration (OpenAI, Anthropic, Gemini) — requires API keys
- AI model fine-tuning or prompt engineering
- Multilingual description generation beyond zh/en

## Deliverables

1. **`src/__tests__/localAIProvider.test.ts`** — New test file with comprehensive unit tests for `LocalAIProvider`
   - Tests for `generateMachineName` with various module configurations
   - Tests for `generateMachineDescription` with style variants (technical, flavor, lore, mixed)
   - Tests for `generateFullAttributes` integrating with existing `generateAttributes`
   - Tests for config validation and provider availability
   - Edge case tests: empty modules, null connections, missing attributes

2. **`src/services/ai/LocalAIProvider.ts`** — Updated with improved error handling
   - Graceful handling of empty/invalid inputs
   - Proper type guards for module data
   - Fallback generation for edge cases

3. **`src/hooks/useAINaming.ts`** — Enhanced error boundary
   - Improved error messages for edge cases
   - Better loading state handling

4. **Test coverage increase** — Minimum 10 new tests for LocalAIProvider

## Acceptance Criteria

1. **AC-142-001: LocalAIProvider Name Generation Tests**
   - `generateMachineName` returns valid string for valid inputs
   - `generateMachineName` handles empty modules array gracefully (returns default name)
   - `generateMachineName` filters prefixes by faction when provided
   - `generateMachineName` filters prefixes by tags when provided
   - `generateMachineName` filters prefixes by rarity when provided
   - All 3 parts (prefix, type, suffix) are present in generated name

2. **AC-142-002: LocalAIProvider Description Generation Tests**
   - `generateMachineDescription` returns valid string for valid inputs
   - `generateMachineDescription` respects `style` parameter (technical/flavor/lore/mixed)
   - `generateMachineDescription` respects `maxLength` parameter
   - `generateMachineDescription` includes stability/power flavor text
   - `generateMachineDescription` handles empty modules gracefully

3. **AC-142-003: LocalAIProvider Full Attributes Tests**
   - `generateFullAttributes` returns complete `GeneratedAttributes` object
   - `generateFullAttributes` includes name, rarity, stats, tags, description, codexId
   - Generated attributes are valid types (rarity is Rarity enum, stats are numbers)

4. **AC-142-004: LocalAIProvider Configuration Tests**
   - `validateConfig` returns `{ isValid: true }` for local provider
   - `getConfig` returns configuration object with `type: 'local'`
   - `isAvailable` returns `true` for local provider

5. **AC-142-005: Test Suite Passes**
   - All 5781+ baseline tests pass (new tests added, not replacing)
   - New LocalAIProvider tests: minimum 10 tests
   - Total tests ≥ 5791

6. **AC-142-006: Bundle Size ≤512KB**
   - `dist/assets/index-*.js` ≤ 524,288 bytes

7. **AC-142-007: TypeScript 0 Errors**
   - `npx tsc --noEmit` exits with code 0

## Test Methods

### AC-142-001: LocalAIProvider Name Generation Tests
1. Create `LocalAIProvider` instance with default config
2. Call `generateMachineName` with valid modules array (3+ modules)
3. Verify returned `data` is a non-empty string
4. Verify string contains 3 words (prefix + type + suffix)
5. Test with empty modules array → verify returns default name
6. Test with faction parameter → verify prefix filtering works
7. Test with tags parameter → verify tag-based filtering works
8. Test with rarity parameter → verify rarity-based filtering works

### AC-142-002: LocalAIProvider Description Generation Tests
1. Create `LocalAIProvider` instance
2. Call `generateMachineDescription` with each style option
3. Verify each style returns distinct output
4. Call with `maxLength: 50` → verify output is truncated
5. Test with empty modules → verify graceful handling
6. Verify stability/power flavor text is appended based on attribute values

### AC-142-003: LocalAIProvider Full Attributes Tests
1. Create `LocalAIProvider` instance
2. Call `generateFullAttributes` with sample modules/connections
3. Verify returned object has all required fields
4. Verify `rarity` is one of valid Rarity values
5. Verify `stats` object has numeric values for all properties

### AC-142-004: LocalAIProvider Configuration Tests
1. Create `LocalAIProvider` with custom config
2. Call `validateConfig()` → verify `isValid: true`
3. Call `getConfig()` → verify returns config object
4. Call `isAvailable()` → verify returns `true`

### AC-142-005: Test Suite Passes
```bash
npm test -- --run
# Verify all tests pass
# Count total tests ≥ 5791
```

### AC-142-006: Bundle Size
```bash
npm run build
# Check dist/assets/index-*.js size ≤ 524288 bytes
```

### AC-142-007: TypeScript
```bash
npx tsc --noEmit
# Exit code 0 with no errors
```

## Risks

1. **Test flakiness** — Local generation uses `Math.random()` internally
   - **Mitigation**: Seed random or use deterministic test data
2. **Existing test interference** — Mock conflicts with other AI provider tests
   - **Mitigation**: Use isolated mock setup per test file
3. **Bundle size regression** — Adding tests should not affect bundle
   - **Mitigation**: Tests are excluded from production bundle

## Failure Conditions

1. Test suite has any failing tests
2. Total test count < 5791 (5781 baseline + 10 new minimum)
3. Bundle size exceeds 512KB
4. TypeScript has any errors
5. LocalAIProvider tests have < 10 test cases

## Done Definition

All acceptance criteria must be true:

1. ✅ `src/__tests__/localAIProvider.test.ts` exists with ≥10 tests
2. ✅ All LocalAIProvider methods have test coverage
3. ✅ Edge cases (empty modules, null connections) are tested
4. ✅ All 5781+ baseline tests continue to pass
5. ✅ Bundle ≤512KB
6. ✅ TypeScript 0 errors
7. ✅ New tests verify both success and failure paths

## Out of Scope

- External AI provider implementations (OpenAI, Anthropic, Gemini)
- Modifying `generateAttributes` utility (existing implementation)
- UI changes to AI Assistant Panel
- Changes to Zustand stores or hydration system
- Changes to other components beyond LocalAIProvider and useAINaming
- Integration tests with full React component rendering
- Performance benchmarking of generation functions
