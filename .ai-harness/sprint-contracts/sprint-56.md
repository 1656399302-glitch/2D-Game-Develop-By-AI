APPROVED

# Sprint Contract — Round 56

## Scope

This sprint focuses on **Enhanced Random Generation Mode** and **Challenge System Expansion**. The random generator will receive themed presets, complexity controls, and aesthetic validation to produce higher-quality machines. The challenge system will gain time trial mode, difficulty multipliers, and leaderboard preparation.

## Spec Traceability

### P0 Items Covered This Round
1. **Enhanced Random Generation** (spec: "随机生成模式") — Themed presets, complexity controls, aesthetic validation
2. **Time Trial Challenge Mode** (spec: "挑战任务模式") — Timed challenge variants with scoring

### P1 Items Covered This Round
1. **Leaderboard Infrastructure** (spec: "挑战任务模式") — Local leaderboard data structure and display
2. **Challenge Difficulty Multipliers** — Reward multipliers for harder challenges

### P0/P1 Remaining After This Round
- P0: Full AI naming integration (API backend required)
- P0: Multiplayer/exchange backend integration
- P1: Faction tech tree UI enhancements
- P1: Tutorial expansion for advanced features

### P2 Intentionally Deferred
- Social media OAuth integration
- Cloud save/sync
- Mobile native app
- Sound effects and music

## Operator Inbox Status

| Item ID | Content | Round Processed | Status |
|---------|---------|-----------------|--------|
| operator-item-1774941228843 | All functional models must be tested, especially module-to-module interaction and UI interaction, with the strictest testing standards | 51 | ✅ Processed - Injected into build phase of round 51 |

**This Round:** No new operator inbox items target Round 56. All inbox items from prior rounds have been processed.

## Deliverables

### 1. Random Generation System Enhancement
**Files:**
- `src/utils/randomGenerator.ts` — Enhanced generator with themes, constraints, validation
- `src/components/Editor/RandomGeneratorModal.tsx` — UI for generation controls
- `src/hooks/useRandomGenerator.ts` — Hook for generator state
- `src/__tests__/randomGeneratorEnhancement.test.ts` — 30+ tests

### 2. Challenge System Expansion
**Files:**
- `src/components/Challenges/TimeTrialChallenge.tsx` — Timed challenge variant
- `src/components/Challenges/ChallengeLeaderboard.tsx` — Leaderboard display component
- `src/store/challengeStore.ts` — Enhanced with time trial state
- `src/data/challengeTimeTrials.ts` — Time trial challenge definitions
- `src/__tests__/challengeExpansion.test.tsx` — 25+ tests

### 3. Integration Updates
**Files:**
- `src/components/Editor/EditorToolbar.tsx` — Add random generator button
- `src/components/Challenges/ChallengePanel.tsx` — Add time trial tab
- `src/types/challenge.ts` — New time trial types

## Acceptance Criteria

### AC1: Themed Random Generation
1. User can select theme preset: "Balanced", "Offensive", "Defensive", "Arcane Focus", "Void Chaos", "Inferno Forge", "Storm Surge", "Stellar Harmony"
2. Generated machine uses modules matching selected theme (≥60% of modules from theme-relevant categories)
3. Faction variants used when theme matches faction (e.g., "Void Chaos" → void variants when unlocked)
4. Generator respects theme weights and rarity distribution

### AC2: Complexity Controls
1. Slider to control module count (3-15 modules)
2. Slider to control connection density (low/medium/high)
3. Generator produces machines within specified complexity bounds
4. Complexity affects rarity calculation of result

### AC3: Aesthetic Validation
1. Generated machines have no overlapping modules (collision check)
2. All connections are valid (no dangling ports)
3. At least one core module present
4. Output array receives energy (valid energy flow)

### AC4: Time Trial Challenges
1. Challenge timer starts when user clicks "Begin Trial"
2. Timer displays MM:SS format, updates every second
3. Timer pauses when challenge panel closes (paused state stored)
4. Timer resumes when panel reopens with same elapsed time
5. Time is recorded on challenge completion
6. Best time saved to local leaderboard

### AC5: Difficulty Multipliers
1. Each challenge has base XP/reputation reward
2. Easy: 0.5x multiplier
3. Normal: 1.0x multiplier
4. Hard: 1.5x multiplier
5. Extreme: 2.0x multiplier
6. Multiplier displayed on challenge card

### AC6: Local Leaderboard
1. Top 10 best times per challenge stored locally
2. Leaderboard shows rank, time, date achieved
3. New personal best highlights in UI
4. Leaderboard persists across sessions

### AC7: Build Integrity
1. `npm run build` succeeds with 0 TypeScript errors
2. All 2076+ existing tests pass
3. New tests for AC1-AC6 all pass

## Test Methods

### AC1: Themed Random Generation
```
1. Mount RandomGeneratorModal
2. Select each theme preset button
3. Call generateWithTheme() with each theme
4. Verify returned modules match theme criteria (≥60% from theme categories):
   - Balanced: mix of all module types (no single category >40%)
   - Offensive: amplifier, fire, lightning variants (≥60%)
   - Defensive: shield, stabilizer, void variants (≥60%)
   - Arcane: rune nodes, phase modulators (≥60%)
   - Faction themes: corresponding faction variants present when unlocked
5. Generate 10 machines per theme, verify ≥80% meet theme criteria
```

### AC2: Complexity Controls
```
1. Set slider to min (3), generate 5 machines
2. Verify each has between 2-4 modules
3. Set slider to max (15), generate 5 machines
4. Verify each has between 12-18 modules
5. Test medium setting (8), verify 7-10 modules
6. Test connection density: high should have more connections than low
```

### AC3: Aesthetic Validation
```
1. Generate 20 random machines
2. For each, run collision detection
3. Verify no modules overlap (bounding box intersection = 0)
4. Verify all connection ports have valid connections
5. Verify at least 1 core module
6. Verify output array has at least 1 incoming connection
```

### AC4: Time Trial Challenges
```
1. Mount TimeTrialChallenge with challenge ID
2. Click "Begin Trial" button
3. Wait 2 seconds, verify timer shows ~00:02
4. Verify timer continues after 10 seconds
5. Close panel, verify timer pauses (state preserved)
6. Reopen panel, verify timer resumes from same elapsed time
7. Complete challenge by satisfying conditions
8. Verify timer stops and time is recorded
9. Verify completion callback receives correct time
10. Verify new best time saved to leaderboard
```

### AC5: Difficulty Multipliers
```
1. Create 4 challenges with different difficulties
2. Complete each challenge
3. Verify reward calculation uses correct multiplier:
   - Easy base 100 → actual 50
   - Normal base 100 → actual 100
   - Hard base 100 → actual 150
   - Extreme base 100 → actual 200
```

### AC6: Local Leaderboard
```
1. Clear leaderboard for test challenge
2. Add 15 entries with different times
3. Verify only top 10 stored
4. Verify entries sorted by time ascending
5. Add new best time
6. Verify it appears at rank 1
7. Verify previous rank 1 now rank 2
8. Verify data persists after page reload
```

### AC7: Build Integrity
```bash
# Step 1: Verify build succeeds
npm run build  # Verify 0 TypeScript errors

# Step 2: Verify all existing tests pass
npm test -- --run src/__tests__/connectionEngineFix.test.ts
npm test -- --run src/__tests__/accessibilityEnhancements.test.tsx
npm test -- --run src/__tests__/focusManagement.test.tsx
# (All tests from Round 55 should still pass)

# Step 3: Verify new tests pass
npm test -- --run src/__tests__/randomGeneratorEnhancement.test.ts
npm test -- --run src/__tests__/challengeExpansion.test.tsx

# Step 4: Full test suite
npm test -- --run  # All 2100+ tests should pass
```

## Risks

### R1: Complexity Generation Edge Cases
- **Risk:** Generator may produce invalid machines for extreme complexity settings
- **Mitigation:** Add fallback to "medium" settings if generation fails after 3 attempts
- **Fallback:** Show error toast with "Try different settings"

### R2: Time Trial Timer Accuracy
- **Risk:** JavaScript timer drift over long trials (>10 minutes)
- **Mitigation:** Use requestAnimationFrame for display, setInterval(1000) for persistence
- **Fallback:** Auto-save time every 30 seconds

### R3: Leaderboard Storage Limits
- **Risk:** LocalStorage quota exceeded with many entries
- **Mitigation:** Limit to top 10 per challenge, compress old entries
- **Fallback:** Prune entries older than 30 days

### R4: Theme Module Availability
- **Risk:** Some themes require faction variants that user hasn't unlocked
- **Mitigation:** Check recipe unlock status before using faction variants
- **Fallback:** Use base module types if variant locked

### R5: Timer Pause/Resume Accuracy
- **Risk:** Timer state may drift if pause/resume not handled correctly
- **Mitigation:** Store exact elapsed milliseconds, recalculate on resume
- **Fallback:** Reset timer and warn user trial may be invalid

## Failure Conditions

The round fails if:

1. **FC1:** Build fails with TypeScript errors
2. **FC2:** Any existing test file has failing tests (including Round 55 accessibility/connection tests)
3. **FC3:** Random generator produces overlapping modules
4. **FC4:** Random generator produces invalid energy flow (output with no input)
5. **FC5:** Time trial timer displays incorrect time (>500ms drift per minute)
6. **FC6:** Leaderboard data not persisting across sessions
7. **FC7:** Difficulty multiplier rewards calculated incorrectly
8. **FC8:** Theme generation produces <60% theme-relevant modules for any theme
9. **FC9:** Timer pause/resume does not preserve exact elapsed time
10. **FC10:** New functionality breaks existing module-to-module interaction or UI interaction (operator inbox requirement from Round 51)

## Done Definition

All conditions must be true:

1. **Build Passes:** `npm run build` completes with 0 TypeScript errors
2. **All Existing Tests Pass:**
   - `npm test -- --run src/__tests__/connectionEngineFix.test.ts` (18 tests)
   - `npm test -- --run src/__tests__/accessibilityEnhancements.test.tsx` (29 tests)
   - `npm test -- --run src/__tests__/focusManagement.test.tsx` (26 tests)
   - All 2076 tests from prior rounds passing
3. **New Tests Pass:**
   - `npm test -- --run src/__tests__/randomGeneratorEnhancement.test.ts` (30+ tests)
   - `npm test -- --run src/__tests__/challengeExpansion.test.tsx` (25+ tests)
4. **Random Generator:**
   - [ ] RandomGeneratorModal renders with all 8 theme options
   - [ ] Each theme produces machines with ≥60% theme-relevant modules
   - [ ] Complexity sliders functional (3-15 range)
   - [ ] Validation catches and prevents invalid outputs
   - [ ] Fallback works after 3 failed generation attempts
5. **Challenge System:**
   - [ ] TimeTrialChallenge component renders and timer starts
   - [ ] Timer accuracy within 500ms drift per minute over 5-minute period
   - [ ] Timer pause preserves elapsed time, resume continues from exact point
   - [ ] Challenge completion saves time to leaderboard
   - [ ] All 4 difficulty multipliers calculate correctly
6. **Leaderboard:**
   - [ ] Displays top 10 times
   - [ ] Persists in localStorage across page reloads
   - [ ] Correctly highlights new personal best
7. **Integration:**
   - [ ] Random generator button in toolbar opens modal
   - [ ] Time trial tab visible in challenge panel
8. **No Placeholder UI:** All UI components fully implemented with real functionality
9. **Interaction Integrity:** Module-to-module interaction and UI interaction remain functional (no regressions from Round 51 inbox requirement)

## Out of Scope

This sprint explicitly does NOT include:

1. **Backend/Server** — All leaderboard data is local only; no server sync
2. **AI API Integration** — Naming uses template system; AI panel is UI only
3. **Multiplayer Features** — No real-time collaboration
4. **Social Media Sharing** — Export remains file-based only
5. **Sound/Audio** — No sound effects or music
6. **Mobile Native** — Web-only, no iOS/Android apps
7. **Cloud Sync** — Data stays in localStorage only
8. **User Accounts** — No authentication system
9. **Payment/Monetization** — No premium features or purchases
10. **Advanced Animations** — Focus is on functionality, not animation polish

---

**Contract Prepared For: Round 56**
**Based on: spec.md + feedback.md (Round 55 QA Results - PASS 10/10)**
**Operator Inbox: 1 item processed (Round 51) - no active items for Round 56**
**Focus: Enhanced Random Generation + Challenge System Expansion**
