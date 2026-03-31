# Sprint Contract — Round 68

## APPROVED

---

## Scope

**Remediation Sprint**: Fix bundle size issue from Round 67 by implementing code-splitting for Template components.

## Spec Traceability

- **P0 items covered this round**:
  - AC15 (Bundle size < 500KB) — remediation of Round 67 work
  
- **P1 items covered this round**:
  - N/A (continuation of Round 67 template system)
  
- **Remaining P0/P1 after this round**:
  - None — Round 67 template system is complete; only bundle optimization needed
  
- **P2 intentionally deferred**:
  - N/A

## Deliverables

1. **Modified `src/App.tsx`** — Convert TemplateLibrary and SaveTemplateModal imports to lazy-loaded components wrapped in Suspense
2. **Updated bundle** — Reduced main chunk size below 500KB threshold
3. **Verified build** — `npm run build` succeeds with bundle < 500KB
4. **Existing tests** — All 2429 tests continue to pass

## Acceptance Criteria

1. **AC1**: `TemplateLibrary` component lazy-loaded (not in initial bundle)
2. **AC2**: `SaveTemplateModal` component lazy-loaded (not in initial bundle)
3. **AC3**: Modals open correctly when triggered (user experience unchanged)
4. **AC4**: TypeScript compilation passes with 0 errors
5. **AC5**: All 2429 existing tests pass
6. **AC6**: Vite build completes successfully
7. **AC7**: Main bundle chunk < 500KB (hard failure condition)
8. **AC8**: Template functionality works end-to-end (save, load, delete, favorite)

## Test Methods

1. **Lazy Loading Verification**:
   - Check Vite build output: Template components should NOT appear in `index-[hash].js`
   - Run: `npm run build && ls -la dist/assets/`
   - Verify TemplateLibrary and SaveTemplateModal are NOT in main chunk

2. **Bundle Size Measurement**:
   - Run: `npm run build`
   - Check output: Main chunk must be < 500KB
   - Compare with Round 67 baseline: 520.73 KB

3. **Functional Regression Testing**:
   - Run: `npm test`
   - Verify: 2429/2429 tests pass
   - Run: `npx tsc --noEmit`
   - Verify: 0 TypeScript errors

4. **Browser Smoke Test**:
   - Open dev server: `npm run dev`
   - Click "模板" (Templates) button → Library modal opens
   - Click "保存当前模板" → Save modal opens
   - Verify: No console errors, modals render correctly

## Risks

1. **Risk: Suspense boundaries may cause flash of loading state**
   - Mitigation: Add `LazyLoadingFallback` component already defined in App.tsx
   - Templates are only opened via user action (button click), so loading delay is acceptable

2. **Risk: Lazy imports may break test imports**
   - Mitigation: Jest/Vitest handles dynamic imports correctly for component rendering tests
   - Store tests (templateStore.test.ts) are unaffected as they test Zustand store only

3. **Risk: Component still appears in bundle via tree-shaking fail**
   - Mitigation: Explicitly exclude from manualChunks and verify build output

## Failure Conditions

1. **Bundle size ≥ 500KB** after build — FAIL (hard failure)
2. **Any existing test fails** — FAIL
3. **TypeScript compilation errors** — FAIL
4. **Modal does not open or render incorrectly** — FAIL
5. **Template save/load functionality broken** — FAIL

## Done Definition

The round is complete when ALL of the following are true:

1. ✅ `npm run build` completes successfully
2. ✅ Main bundle chunk < 500KB (verified in build output)
3. ✅ `npm test` passes all 2429 tests
4. ✅ `npx tsc --noEmit` reports 0 errors
5. ✅ TemplateLibrary modal opens when "模板" button clicked
6. ✅ SaveTemplateModal opens when "保存当前模板" clicked
7. ✅ Can save, load, delete, and favorite templates (existing functionality preserved)

## Out of Scope

- No new features — this is a remediation sprint
- No changes to template store logic
- No changes to template component UI/CSS
- No additional test files needed (existing coverage sufficient)
- No changes to other lazy-loaded components
