# APPROVED — Sprint Contract — Round 139

## Scope

Implement a **Community Rating & Review System** to add social engagement features to the circuit sharing platform. This includes:

1. **Star Rating System (1-5 stars)**
   - Rating data model with average rating and rating count
   - Rating submission UI (star click interaction)
   - Rating display on MachineCards
   - Rating persistence in Zustand store

2. **Review/Comment System**
   - Review data model (author, text, timestamp, rating)
   - Review submission modal
   - Review list display on machine detail
   - Review moderation (delete own reviews)

## Spec Traceability

### P0 items (Must complete this round)
- Star rating submission and display on community machines
- Review submission and display on community machines
- Rating/review persistence across sessions

### P1 items (Covered this round)
- Rating summary statistics (average, count) displayed on MachineCards
- Review author and timestamp display
- Integration with existing CommunityGallery and MachineCard components

### Remaining P0/P1 after this round
- None - Rating and Review system completes the community engagement P1 requirements

### P2 intentionally deferred
- Social following (follow other users)
- Share to social media integration
- Community leaderboards
- Review upvotes/helpfulness voting

## Deliverables

### New Files
1. `src/types/ratings.ts` — Rating and Review type definitions
2. `src/store/useRatingsStore.ts` — Zustand store for ratings/reviews with localStorage persistence
3. `src/components/Ratings/StarRating.tsx` — Interactive star rating component (1-5 stars)
4. `src/components/Ratings/StarRatingDisplay.tsx` — Read-only star display with average
5. `src/components/Ratings/ReviewList.tsx` — List of reviews for a machine
6. `src/components/Ratings/ReviewItem.tsx` — Individual review display
7. `src/components/Ratings/SubmitReviewModal.tsx` — Modal for submitting reviews with rating + text
8. `src/__tests__/StarRating.test.tsx` — Unit tests for star rating component (≥10 tests)
9. `src/__tests__/useRatingsStore.test.ts` — Unit tests for ratings store (≥10 tests)
10. `src/__tests__/SubmitReviewModal.test.tsx` — Unit tests for review modal (≥8 tests)

### Modified Files
1. `src/data/communityGalleryData.ts` — Add rating/review fields to CommunityMachine
2. `src/components/Community/MachineCard.tsx` — Add StarRatingDisplay and submit rating button
3. `src/components/Community/CommunityGallery.tsx` — Add "Reviews" tab or modal access
4. `src/components/Community/PublishModal.tsx` — Optional: show rating/review stats on published machines

## Acceptance Criteria

### AC-139-001: Star Rating Display
- Each MachineCard displays 5 stars showing the average rating
- Filled stars (gold/yellow) represent the average rating (1-5 scale)
- Empty stars represent the remaining rating
- Rating count is shown (e.g., "★ 4.2 (15 ratings)")

### AC-139-002: Star Rating Submission
- Clicking a star submits a rating for the current user
- User can change their rating by clicking a different star
- Rating persists after page refresh (localStorage)
- Clicking the same star again removes the rating

### AC-139-003: Review Submission
- User can submit a review with:
  - Rating (required, 1-5 stars)
  - Text review (required, 10-500 characters)
- Review is associated with the machine ID
- Author name is captured (from existing author state)
- Timestamp is recorded

### AC-139-004: Review Display
- Reviews are displayed in a list sorted by newest first
- Each review shows: author, rating, text, timestamp
- "Delete" button appears on user's own reviews only
- Reviews persist after page refresh

### AC-139-005: Rating Statistics Update
- When a new rating or review is submitted, the machine's average rating updates
- Rating count increments/decrements correctly
- Average is calculated correctly: sum of all ratings / number of ratings

### AC-139-006: Test Suite Passes
- All new test files pass with ≥28 total new tests
- Full test suite passes with count ≥5703 (5675 baseline + 28 new)

### AC-139-007: Bundle Size ≤512KB
- Main bundle remains under 512KB after additions

### AC-139-008: TypeScript 0 Errors
- No TypeScript compilation errors

## Test Methods

### TM-139-001: Star Rating Component Tests
Run: `npm test -- src/__tests__/StarRating.test.tsx --run`

**Verify:**
- Renders 5 stars by default
- Hover state highlights stars up to cursor position
- Click submits rating with correct value (1-5)
- Displays correct fill state for given average
- Shows rating count text
- Minimum 10 tests pass

### TM-139-002: Ratings Store Tests
Run: `npm test -- src/__tests__/useRatingsStore.test.ts --run`

**Verify:**
- `submitRating(machineId, userId, rating)` stores rating
- `getAverageRating(machineId)` calculates correctly
- `getUserRating(machineId, userId)` returns user's rating
- `submitReview(machineId, review)` stores review
- `deleteReview(machineId, reviewId)` removes review
- localStorage persistence works across store re-initializations
- Minimum 10 tests pass

### TM-139-003: Submit Review Modal Tests
Run: `npm test -- src/__tests__/SubmitReviewModal.test.tsx --run`

**Verify:**
- Modal opens when triggered
- Star rating selection works
- Text input accepts 10-500 characters
- Submit button disabled when form invalid
- Submit calls store action with correct data
- Modal closes after successful submit
- Minimum 8 tests pass

### TM-139-004: Full Test Suite
Run: `npm test -- --run`

**Verify:**
- All test files pass
- Total test count ≥5703

### TM-139-005: Browser Verification
Manual verification steps:
1. Open Community Gallery
2. Verify MachineCards show star ratings
3. Click on a machine card or "Rate" button
4. Submit a rating (click a star)
5. Submit a review (write text + rating)
6. Verify review appears in list
7. Refresh page
8. Verify rating and review persisted

**Negative assertions:**
- Rating should not reset after refresh
- Review should not disappear after refresh
- Modal should not crash on invalid submit attempts

### TM-139-006: Bundle Size
Run: `npx vite build && ls -la dist/assets/*.js`

**Verify:** Main bundle ≤512KB (524,288 bytes)

### TM-139-007: TypeScript Compilation
Run: `npx tsc --noEmit`

**Verify:** Exit code 0 (no errors, zero TypeScript compilation failures)

## Risks

### R-139-001: LocalStorage Overflow
- **Risk:** Users who rate many machines could exceed localStorage limits
- **Mitigation:** Store only user's own ratings/reviews in localStorage; aggregate stats can be derived or stored minimally

### R-139-002: Rating Manipulation
- **Risk:** No server means ratings are local-only and can be tampered with
- **Mitigation:** Acceptable for single-player/local-first experience; add note in UI that ratings are local

### R-139-003: Test Coverage Overhead
- **Risk:** Adding UI components could introduce rendering test complexity
- **Mitigation:** Use shallow rendering for component tests; mock child components

### R-139-004: CommunityGallery Integration Complexity
- **Risk:** Modifying existing MachineCard and CommunityGallery may affect existing functionality
- **Mitigation:** Ensure backward compatibility; existing community machines should still display without ratings

## Failure Conditions

The round FAILS if any of these occur:

1. **FC-139-001:** Bundle size exceeds 512KB
2. **FC-139-002:** TypeScript compilation has ≥1 error
3. **FC-139-003:** StarRating.test.tsx has <10 passing tests
4. **FC-139-004:** useRatingsStore.test.ts has <10 passing tests
5. **FC-139-005:** SubmitReviewModal.test.tsx has <8 passing tests
6. **FC-139-006:** Full test suite <5703 tests passing
7. **FC-139-007:** Browser verification fails for rating submission OR review submission
8. **FC-139-008:** Ratings/reviews do not persist after page refresh
9. **FC-139-009:** Any existing functionality broken (existing tests fail)

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ `src/types/ratings.ts` exists with `Rating`, `Review`, `RatingsState` types
2. ✅ `src/store/useRatingsStore.ts` exists with submitRating, submitReview, deleteReview, getAverageRating, getUserRating actions
3. ✅ `src/components/Ratings/StarRating.tsx` exists and renders interactive 1-5 star rating
4. ✅ `src/components/Ratings/StarRatingDisplay.tsx` exists and shows average rating with count
5. ✅ `src/components/Ratings/SubmitReviewModal.tsx` exists for review submission
6. ✅ `src/components/Ratings/ReviewList.tsx` and `ReviewItem.tsx` exist for displaying reviews
7. ✅ MachineCards display star ratings (modified `MachineCard.tsx`)
8. ✅ ≥10 tests pass in StarRating.test.tsx
9. ✅ ≥10 tests pass in useRatingsStore.test.ts
10. ✅ ≥8 tests pass in SubmitReviewModal.test.tsx
11. ✅ Full test suite ≥5703 tests passing
12. ✅ Bundle ≤512KB
13. ✅ TypeScript 0 errors
14. ✅ Browser verification: rate a machine → refresh → rating persists
15. ✅ Browser verification: submit review → refresh → review persists

## Out of Scope

The following are explicitly NOT in this sprint:

1. **Social following** — Following other users' profiles
2. **Social sharing** — Direct share to Twitter/Facebook/Reddit
3. **Review voting** — Upvoting/downvoting reviews
4. **Report system** — Reporting inappropriate reviews
5. **User profiles** — Dedicated profile pages for authors
6. **Leaderboards** — Top-rated machines leaderboard
7. **Backend/server** — Any server-side storage (all local only)
8. **Multiplayer sync** — Syncing ratings across devices
9. **Rating moderation** — Admin moderation of ratings
10. **Rich text reviews** — Markdown or formatting in review text
