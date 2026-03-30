# Sprint Contract — Round 24

## Scope

**Feature Focus:** AI Description Generation System — extending the AI Assistant Panel to include machine description, lore text, and attribute tag generation using mock AI service.

## Spec Traceability

### P0 Items (Must Complete This Round)
- **AI Description Panel UI** — Full description generation interface in AI Assistant Panel
- **Lore Text Generation** — Generate flavor text based on machine composition (modules, faction)
- **Tag Suggestion System** — Attribute tag suggestions based on module types
- **Description Regeneration** — Allow users to regenerate descriptions with different styles

### P1 Items (Covered This Round)
- **Style Variants** — Support technical, flavor, lore, and mixed description styles
- **Chinese/English Output** — Bilingual description support
- **Apply to Machine** — Update machine attributes with AI-generated content

### Remaining P0/P1 After This Round
- **Module Editor Polish** — Advanced snap, align, auto-layout features
- **Energy Connection Rules** — Validation, conflict detection, circuit completeness
- **Activation Preview Refinements** — State machine tuning, effect polish
- **Codex/Collection UI** — Persistence, filtering, sorting improvements
- **Random Generation Algorithm** — Aesthetic control, layout rules
- **Export Poster Format** — Social media share card generation
- **Real AI API Integration** — OpenAI/Anthropic backend (requires API keys)

### P2 Intentionally Deferred
- Real AI API integration (OpenAI/Anthropic) — requires API keys and backend
- Codex trading/exchange system
- Time-trial challenge mode with timer
- Voice interface for AI commands
- AI-powered module placement suggestions

## Deliverables

1. **Enhanced AI Assistant Panel** (`src/components/AI/AIAssistantPanel.tsx`)
   - Description generation section with style selector (4 options)
   - Generated description display with copy functionality
   - Lore text panel with flavor text
   - Tag suggestion pills with apply-to-machine button

2. **AI Integration Utilities** (`src/utils/aiIntegrationUtils.ts`)
   - Mock service with description generation logic
   - Description templates by faction and module composition
   - Bilingual text generation functions

3. **Store Integration** (`src/store/useMachineStore.ts`)
   - Methods to update machine attributes with AI-generated content

4. **Tests** (`src/__tests__/aiDescription.test.ts`)
   - Unit tests for description generation
   - UI tests for AI Assistant Panel interactions
   - Integration tests for apply-to-machine flow

## Acceptance Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| AC1 | AI Assistant Panel displays "生成描述" section with style selector offering 4 options (technical, flavor, lore, mixed) | Browser inspection |
| AC2 | Clicking generate button creates description and displays it in styled container | Browser test with mock verification |
| AC3 | Lore text section displays 2-3 sentences of faction-appropriate flavor text | Browser inspection after generation |
| AC4 | System generates 3-5 attribute tags displayed as clickable pills | Browser inspection after generation |
| AC5 | "重新生成" button triggers new description generation with loading state | Browser test |
| AC6 | "应用到机器" button updates machine attributes in store | Unit test or browser verification |
| AC7 | All text supports Chinese output; English output also available | Browser inspection of language toggle |
| AC8 | `npm run build` completes with 0 TypeScript errors | Build command |
| AC9 | `npm test -- --run src/__tests__/aiDescription.test.ts` passes | Test command |

## Test Methods

### Browser Verification
1. Open AI Assistant Panel from toolbar
2. Add 3+ modules to canvas
3. Select a style option
4. Click "生成描述" button
5. Verify description appears
6. Verify lore text displays
7. Verify tag pills appear
8. Click tag pills and "应用到机器"
9. Toggle language and verify output changes

### Unit Tests
```bash
npm test -- --run src/__tests__/aiDescription.test.ts
```

### Integration Tests
```bash
npm test -- --run
```

## Risks

1. **Mock Service Limitations** — AI generation uses mock data; real API integration deferred
2. **Text Length Variance** — Descriptions may vary; CSS must handle gracefully
3. **State Sync** — Ensure AI descriptions sync with machine store without conflicts

## Failure Conditions

The round fails if any of these are true:
1. `npm run build` fails with TypeScript errors
2. AI Description panel not accessible from AI Assistant Panel UI
3. Generate button does not produce description output
4. Tag suggestions do not appear after generation
5. Apply button does not update machine attributes
6. Tests in `src/__tests__/aiDescription.test.ts` fail

## Done Definition

All conditions must be true before claiming completion:
- [ ] AI Assistant Panel displays description generation interface
- [ ] Style selector offers exactly 4 options
- [ ] Generate button creates description based on machine state
- [ ] Lore text appears with faction-appropriate flavor
- [ ] Tag suggestions (3-5) display as clickable pills
- [ ] Regeneration creates new description
- [ ] Chinese and English output both functional
- [ ] Apply button updates machine attributes in store
- [ ] `npm run build` succeeds with 0 errors
- [ ] `npm test -- --run src/__tests__/aiDescription.test.ts` passes

## Out of Scope

- Real AI API integration (OpenAI, Anthropic, Gemini)
- Server-side rendering or API endpoints
- Machine learning model training
- AI-powered module placement suggestions
- Voice interface for AI commands
- Social sharing of AI-generated content
- Module Editor polish (snap, align, auto-layout)
- Energy Connection validation system

---

**CONTRACT STATUS: APPROVED**
