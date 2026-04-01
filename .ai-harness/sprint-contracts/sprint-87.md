# Sprint Contract — Round 87

## APPROVED

## Scope

This sprint focuses on **quality assurance and polish improvements** following the successful Challenge-Codex integration in Round 86. The primary goal is to identify and address any edge cases, improve robustness, and enhance user-facing quality without introducing new major features.

## Spec Traceability

### P0 items (Core System — assume fully implemented)
- Module drag-and-drop editor with 6+ SVG module types
- Energy connection system with path rendering
- Activation preview system with state machine (idle, charging, active, overload, failure, shutdown)
- Machine attribute generation system
- Codex save/load/view system
- SVG/PNG export capabilities

### P1 items (Feature Complete — assume fully implemented)
- Random generation mode
- Undo/redo system
- Challenge system with faction progression
- Challenge-Codex integration (Round 86)
- Machine rarity and attribute display

### P2 items this round may address (partial scope)
- Visual polish improvements
- Edge case handling
- Performance optimization
- Code quality and maintainability

### Remaining P0/P1 after this round
- All P0/P1 items from spec are assumed complete from prior rounds
- This sprint does NOT unblock any critical P0/P1 work

### P2 intentionally deferred
- AI naming/description assistant integration
- Community sharing features
- Challenge recipe unlock system
- Faction tech tree progression
- Advanced layout suggestions

## Deliverables

1. **Code quality audit report** — Summary of current code health metrics (file count, complexity indicators, type coverage if applicable)

2. **Edge case test coverage** — Additional integration tests for critical user workflows not yet covered

3. **Performance baseline** — Documented build metrics (size, test duration) for comparison

4. **Polished component improvements** — Any targeted visual/interaction polish identified during the sprint

5. **Updated documentation** — Any needed README or internal documentation updates

## Acceptance Criteria

1. **AC-MAINTENANCE-001**: All existing 2933 tests continue to pass after any changes

2. **AC-MAINTENANCE-002**: Build succeeds with 0 TypeScript errors, bundle size remains ≤ 560KB

3. **AC-TEST-GAP**: At least 5 new integration tests added covering previously untested code paths

4. **AC-CODE-QUALITY**: No critical (blocking) code review findings introduced by sprint changes

5. **AC-DOCUMENTATION**: Any new public APIs or store methods are documented in JSDoc or TypeScript types

## Test Methods

1. **AC-MAINTENANCE-001**:
   - Run `npx vitest run` and confirm all tests pass
   - Verify test count ≥ 2933 (allowing for new additions)

2. **AC-MAINTENANCE-002**:
   - Run `npm run build` and confirm exit code 0
   - Verify bundle size from build output ≤ 560KB
   - Verify `tsc --noEmit` returns 0 errors

3. **AC-TEST-GAP**:
   - Review existing test coverage for store methods and components
   - Add tests for any store selectors/helpers not covered
   - Add tests for edge cases in challenge-machine relationships
   - Confirm new test file(s) exist and pass

4. **AC-CODE-QUALITY**:
   - Self-review code changes for: no `any` types without justification, proper error handling, clean component structure
   - No console.error calls in production code paths
   - All store updates follow existing patterns

5. **AC-DOCUMENTATION**:
   - New exported functions have JSDoc comments
   - New types/interfaces are properly defined in `/types`
   - Store methods have clear parameter/return type annotations

## Risks

1. **Risk: Scope creep** — Without specific feedback pointing to problems, there's temptation to add features. Mitigation: Focus on maintenance and documented gaps only.

2. **Risk: False improvements** — Adding tests or refactoring that doesn't improve actual product quality. Mitigation: Prioritize changes that directly address known complexity or edge cases.

3. **Risk: Test pollution** — New tests may mask or conflict with existing behavior. Mitigation: Run full test suite before and after any changes.

## Failure Conditions

1. **FC-001**: Any existing test fails after sprint changes
2. **FC-002**: Build size exceeds 560KB or TypeScript errors are introduced
3. **FC-003**: New features or non-trivial functionality added (sprint is maintenance-only)
4. **FC-004**: Critical user-facing bug introduced by refactoring

## Done Definition

All of the following must be true before claiming the round complete:

1. ✅ `npx vitest run` passes with ≥ 2933 tests (original count + new additions)
2. ✅ `npm run build` succeeds with 0 errors, bundle ≤ 560KB
3. ✅ At least 5 new integration tests added and passing
4. ✅ No new `any` types or critical code quality issues in changed files
5. ✅ Code changes reviewed and approved (self-review acceptable)
6. ✅ New tests cover edge cases not previously tested
7. ✅ Documentation updated for any new public APIs

## Out of Scope

- **No new features** from the spec (AI assistant, community features, tech tree, recipe system)
- **No major refactoring** of existing working systems
- **No UI/UX redesigns** of core workflows
- **No new module types** added to the editor
- **No new export formats** beyond what exists
- **No changes to the core state management architecture**
- **No modifications to passing acceptance criteria from prior rounds**

## Notes

- This is a **maintenance sprint** following a successful Round 86
- The project passed QA with no blocking issues
- Focus is on sustainable code quality and test coverage
- Any discovered bugs should be reported but may be deferred to feature sprints if non-critical
