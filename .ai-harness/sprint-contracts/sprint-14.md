# Sprint Contract — Round 14

## APPROVED

## Scope

This round implements **Challenge Mode** — a goal-driven gameplay system that gives users specific objectives to complete with their machines. Challenge Mode adds preset challenges with requirements, progress tracking, completion rewards, and a challenge browser UI.

## Spec Traceability

- **P0 items covered this round:**
  - Challenge Mode: Add preset challenges with specific objectives (module count, connections, tags, etc.)
  - Challenge Progress: Track user completion of challenges with local storage persistence
  - Challenge Browser UI: Modal showing available challenges, requirements, and completion status
  - Challenge Rewards: Unlock indicators when challenges are completed (cosmetic badges)

- **P1 items covered this round:**
  - Challenge validation system: Check if current machine meets challenge requirements
  - Challenge completion feedback: Visual feedback when requirements are met
  - Challenge filtering: Filter by difficulty, type, completion status

- **Remaining P0/P1 after this round:**
  - Community sharing system (deferred)
  - AI naming/description integration (API integration deferred, rule-based implemented)
  - Faction technology tree (deferred)
  - Sound effects system (deferred)

- **P2 intentionally deferred:**
  - Mobile/touch optimizations
  - Collaborative editing features
  - 3D preview mode
  - Animated backgrounds in poster export

## Deliverables

1. **Challenge Definitions** (`src/types/challenges.ts`)
   - `Challenge` interface: id (string), title (string), description (string), requirements (object), difficulty ('beginner'|'intermediate'|'advanced'|'master'), reward (object)
   - `ChallengeRequirement` interface: minModules (number), minConnections (number), requiredTags (string[]), requiredRarity ('common'|'uncommon'|'rare'|'epic'|'legendary'), specificModuleTypes (string[])
   - 8 preset challenges with at least one per difficulty level

2. **Challenge Validation System** (`src/utils/challengeValidator.ts`)
   - `validateChallenge(machine: Machine, challenge: Challenge): ValidationResult`
   - `ValidationResult` interface: passed (boolean), details ({ requirement: string, met: boolean }[])
   - Validates: module count, connection count, tag presence, rarity level, module type presence

3. **Challenge Progress Store** (`src/store/useChallengeStore.ts`)
   - State: completedChallengeIds (Set<string>), loading (boolean)
   - Actions: completeChallenge(id), resetProgress, isCompleted(id)
   - Persists completedChallengeIds to localStorage key 'arcane-codex-challenges'

4. **Challenge Browser Modal** (`src/components/Challenges/ChallengeBrowser.tsx`)
   - Props: isOpen (boolean), onClose (function)
   - Shows all 8 challenges in scrollable list
   - Each card displays: title, description, difficulty badge, requirements checklist
   - Visual states: locked (gray, for future challenges), available (blue glow), completed (gold border + checkmark)
   - Filter tabs: All, Available, Completed
   - Close button in header

5. **Challenge Button** (`src/components/Challenges/ChallengeButton.tsx`)
   - Renders in header area
   - Badge displays "Challenges (X/8)" where X is completed count
   - Click opens ChallengeBrowser modal
   - Props: onClick (opens modal)

6. **Challenge Validation Panel** (`src/components/Challenges/ChallengeValidationPanel.tsx`)
   - Renders inside ChallengeBrowser for selected challenge
   - Shows "Validate Machine" button
   - Displays pass/fail result with specific details
   - Requirements checklist shows checkmark (met) or X (not met)
   - "Claim Reward" button appears when passed=true

7. **Challenge Celebration Component** (`src/components/Challenges/ChallengeCelebration.tsx`)
   - Props: challenge (Challenge), onClose (function)
   - Animated overlay on successful completion
   - CSS-based particle/confetti effect
   - Badge icon display for completed challenge
   - "Continue" button dismisses overlay

8. **App Header Integration** (`src/App.tsx` modifications)
   - ChallengeButton added to header layout
   - Positioned alongside existing controls (Export, Load, Save, Random Forge)
   - No z-index conflicts with other modals

## Acceptance Criteria

1. **Build succeeds with 0 TypeScript errors** — `npm run build` exits 0 with no errors

2. **8 challenges defined** — Challenge array exports exactly 8 challenges; each has unique id, title, description; at least 2 beginner, 2 intermediate, 2 advanced, 2 master difficulty challenges

3. **Challenge Browser modal opens** — ChallengeButton click triggers modal open; modal renders 8 challenge cards; close button dismisses modal

4. **Challenge validation returns correct results** — Given machine with 5+ modules, validateChallenge returns passed=true for challenge requiring minModules≤5; Given machine with 2 modules, validation returns passed=false for challenge requiring minModules≥5

5. **Challenge completion persists** — Complete challenge A → verify localStorage contains A's id → refresh page → verify A still marked complete

6. **Visual indicators display correctly** — Completed challenges show gold border and checkmark icon; challenge cards render difficulty badge text

7. **Filter tabs update list** — Click "Completed" tab → only completed challenges shown; Click "Available" tab → only non-completed challenges shown

8. **All existing tests pass** — `npm test` exits 0 with no failures

9. **Challenge button visible in header** — Header renders ChallengeButton component; badge shows current completion count

10. **Difficulty badges render** — Each challenge card displays difficulty level text (Beginner/Intermediate/Advanced/Master)

## Test Methods

1. **Build Test**: Run `npm run build` and verify exit code 0

2. **Challenge Definition Test**: Import challenge definitions; verify array length === 8; verify each challenge has required fields (id, title, description, requirements, difficulty)

3. **Modal Open Test**: Click ChallengeButton; verify ChallengeBrowser renders; verify 8 challenge cards visible

4. **Validation Logic Test**:
   - Create machine with { modules: [1,2,3,4,5], connections: [1,2,3], tags: ['fire'], rarity: 'rare' }
   - Call validateChallenge with { requirements: { minModules: 3, minConnections: 2 } } → expect passed=true
   - Call validateChallenge with { requirements: { minModules: 10 } } → expect passed=false

5. **Persistence Test**: completeChallenge('ch-1'); verify localStorage.getItem('arcane-codex-challenges') includes 'ch-1'; page reload; verify isCompleted('ch-1') returns true

6. **Filter Test**: Complete 2 challenges; click "Completed" filter; verify exactly 2 cards visible; click "Available" filter; verify 6 cards visible

7. **Test Suite**: Run `npm test` and verify all existing tests pass

8. **UI Test**: Verify header contains button with text "Challenges"; verify clicking increments completion count in badge

## Risks

1. **Challenge Validation Edge Cases** — Complex requirement combinations may not validate correctly
   - **Mitigation**: Test each requirement type individually; start with simple count-based challenges

2. **LocalStorage Unavailable** — localStorage may be blocked or full
   - **Mitigation**: Graceful degradation with in-memory fallback; show warning if persistence fails

3. **Modal Z-Index Conflicts** — Challenge modal may appear behind other modals
   - **Mitigation**: Use consistent modal layering (Challenge modal z-index: 1000+)

4. **Test Fragility** — UI tests may break with visual changes
   - **Mitigation**: Test behavior and data, not implementation details; use data-testid attributes

## Failure Conditions

1. **Build fails** with TypeScript errors or missing imports
2. **Any existing test fails** — regressions not acceptable
3. **Challenge modal cannot open** — button click has no effect
4. **Validation always returns same result** — challenges cannot be completed or always pass
5. **Completion status resets on refresh** — localStorage not persisting
6. **Fewer than 8 challenges defined** — must have exactly 8
7. **Filter tabs have no effect** — switching tabs doesn't update visible challenges
8. **Challenge button missing from header** — component not rendered

## Done Definition

All of the following must be true before claiming round complete:

1. `npm run build` exits 0 with no TypeScript errors
2. `npm test` exits 0 with all existing tests passing
3. Challenge definitions:
   - Exactly 8 challenges exported from `src/types/challenges.ts`
   - Each challenge has: id (unique string), title, description, requirements object, difficulty ('beginner'|'intermediate'|'advanced'|'master')
   - Each difficulty level represented at least twice
4. Challenge Browser Modal:
   - Renders when isOpen=true
   - Displays all 8 challenges as cards
   - Each card shows: title, description, difficulty badge, requirements checklist
   - Filter tabs (All/Available/Completed) update visible cards
   - Close button calls onClose
5. Challenge validation:
   - validateChallenge(machine, challenge) returns { passed: boolean, details: array }
   - "Validate Machine" button visible in selected challenge
   - Pass result shows requirements checklist with checkmarks
   - Fail result shows requirements checklist with X marks
6. Challenge completion:
   - Calling completeChallenge(id) adds id to completed set
   - Completed challenges show gold border and checkmark
   - Completion persists in localStorage after page refresh
   - "Reset Progress" clears all completions
7. Challenge Button:
   - Visible in header area
   - Badge shows "Challenges (X/8)" where X = completed count
   - Click opens ChallengeBrowser modal
8. Integration:
   - ChallengeButton rendered in App header
   - No conflicts with Export, Load Prompt, or other modals
   - Existing editor functionality unaffected

## Out of Scope

- Audio feedback for challenge completion
- Challenge-specific animations beyond celebration overlay
- Leaderboards or community challenge sharing
- Time-limited/seasonal challenges
- Faction-specific challenge variants
- Difficulty ratings based on community votes
- Challenge recommendations based on user history
- Mobile-optimized challenge UI
- 3D challenge preview
