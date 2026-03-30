# Sprint Contract — Round 42

## Scope

This sprint focuses on **Export Quality Improvements** — enhancing the export system to produce higher quality, more visually polished exports across all formats (SVG, PNG, poster variants, faction cards). The goal is to ensure exports look professional when shared on social media or used in portfolios.

## Spec Traceability

### P0 items covered this round

1. **PNG export resolution tiers** — Three resolution options (1x/2x/4x) produce correctly scaled outputs:
   - 1x: minimum 400px base dimension
   - 2x: minimum 800px base dimension (2× base)
   - 4x: minimum 1600px base dimension (4× base)

2. **Transparent background toggle** — PNG export accepts `transparentBackground: boolean` option; defaults to `false`

3. **All aspect ratio presets produce correct viewBox** — Each preset outputs SVG with correct dimensions:
   - `default`: 600×800 viewBox
   - `square`: 600×600 viewBox
   - `portrait`: 600×800 viewBox
   - `landscape`: 800×600 viewBox

4. **Filename state persists across format changes** — User-entered filename is preserved when switching between SVG, PNG, and Poster formats

5. **Export modal dimension indicator updates** — Resolution selector changes update the displayed dimension text in real-time

6. **Quick presets apply all associated options** — Each preset (Social Media, Print, Icon, Presentation) sets format + resolution + aspect ratio + transparentBackground together

### P1 items covered this round

7. **Filename sanitization** — Special characters are replaced with hyphens for safe filenames; leading/trailing hyphens are trimmed

8. **Format indicator text updates** — Export modal shows format-specific description text when format changes

9. **Aspect ratio selector updates dimension display** — Changing aspect ratio updates the displayed output dimensions

### Remaining P0/P1 after this round

- All P0/P1 items from previous rounds remain complete
- No new P0/P1 items introduced
- Canvas editing, activation system, grouping, keyboard shortcuts all remain functional

### P2 intentionally deferred

- Animated GIF export (requires additional library)
- Video capture of activation sequence
- Batch export multiple machines
- Custom poster templates
- Anti-aliasing quality verification (visual output comparison)
- Visual polish for faction cards and poster stats (requires design iteration)

## Deliverables

1. **`src/__tests__/exportQuality.test.ts`** — Unit tests for export utility functions
2. **`src/__tests__/exportModal.test.ts`** — Component tests for ExportModal interactions
3. **`src/utils/exportUtils.ts`** — Enhanced export functions with resolution tiers and transparent background support
4. **`src/components/Export/ExportModal.tsx`** — Export modal with working dimension indicators and preset buttons

## Acceptance Criteria

### AC1: PNG Export at Correct Resolution
**Test Method:** Unit test `src/__tests__/exportQuality.test.ts`

The PNG export system uses resolution multipliers with verified scale factors:

```typescript
describe('getResolutionDimensions', () => {
  it('1x resolution outputs minimum 400px base dimension', () => {
    const dims = getResolutionDimensions(mockModules, '1x');
    expect(dims.width).toBeGreaterThanOrEqual(400);
    expect(dims.height).toBeGreaterThanOrEqual(400);
  });

  it('2x resolution outputs minimum 800px base dimension', () => {
    const dims = getResolutionDimensions(mockModules, '2x');
    expect(dims.width).toBeGreaterThanOrEqual(800);
    expect(dims.height).toBeGreaterThanOrEqual(800);
  });

  it('4x resolution outputs minimum 1600px base dimension', () => {
    const dims = getResolutionDimensions(mockModules, '4x');
    expect(dims.width).toBeGreaterThanOrEqual(1600);
    expect(dims.height).toBeGreaterThanOrEqual(1600);
  });

  it('2x scale factor is within 10% of exactly 2x the 1x output', () => {
    const dims1x = getResolutionDimensions(mockModules, '1x');
    const dims2x = getResolutionDimensions(mockModules, '2x');
    const scaleFactor = dims2x.width / dims1x.width;
    expect(scaleFactor).toBeGreaterThanOrEqual(1.9);
    expect(scaleFactor).toBeLessThanOrEqual(2.1);
  });

  it('4x scale factor is within 10% of exactly 4x the 1x output', () => {
    const dims1x = getResolutionDimensions(mockModules, '1x');
    const dims4x = getResolutionDimensions(mockModules, '4x');
    const scaleFactor = dims4x.width / dims1x.width;
    expect(scaleFactor).toBeGreaterThanOrEqual(3.8);
    expect(scaleFactor).toBeLessThanOrEqual(4.2);
  });

  it('only accepts valid resolution tiers: 1x, 2x, 4x', () => {
    expect(() => getResolutionDimensions(mockModules, '3x')).toThrow();
    expect(() => getResolutionDimensions(mockModules, '8x')).toThrow();
  });
});
```

**Verification:** Tests pass AND `npm run build` succeeds.

---

### AC2: Transparent Background Option
**Test Method:** Unit test in `src/__tests__/exportQuality.test.ts`

```typescript
describe('exportToPNG transparentBackground', () => {
  it('accepts transparentBackground: true in options', async () => {
    const result = await exportToPNG(mockModules, mockConnections, {
      scale: '2x',
      transparentBackground: true,
    });
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/png');
  });

  it('defaults transparentBackground to false when omitted', async () => {
    const result = await exportToPNG(mockModules, mockConnections, { scale: '2x' });
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/png');
  });

  it('returns valid PNG with correct signature when transparentBackground: true', async () => {
    const result = await exportToPNG(mockModules, mockConnections, {
      scale: '1x',
      transparentBackground: true,
    });
    const buffer = await result.arrayBuffer();
    const signature = new Uint8Array(buffer.slice(0, 8));
    expect(signature).toEqual(new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
  });

  it('returns valid PNG with correct signature when transparentBackground: false', async () => {
    const result = await exportToPNG(mockModules, mockConnections, {
      scale: '1x',
      transparentBackground: false,
    });
    const buffer = await result.arrayBuffer();
    const signature = new Uint8Array(buffer.slice(0, 8));
    expect(signature).toEqual(new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
  });
});
```

**Verification:** Tests pass AND `npm run build` succeeds.

---

### AC3: All Aspect Ratio Presets Work
**Test Method:** Unit test in `src/__tests__/exportQuality.test.ts`

```typescript
const ASPECT_RATIO_DIMS = {
  'default': { width: 600, height: 800 },
  'square': { width: 600, height: 600 },
  'portrait': { width: 600, height: 800 },
  'landscape': { width: 800, height: 600 },
};

describe('exportPoster aspect ratio viewBox', () => {
  it('produces correct viewBox for default (600×800)', () => {
    const svg = exportPoster(mockModules, mockConnections, mockAttributes, 'default');
    expect(svg).toContain('viewBox="0 0 600 800"');
  });

  it('produces correct viewBox for square (600×600)', () => {
    const svg = exportPoster(mockModules, mockConnections, mockAttributes, 'square');
    expect(svg).toContain('viewBox="0 0 600 600"');
  });

  it('produces correct viewBox for portrait (600×800)', () => {
    const svg = exportPoster(mockModules, mockConnections, mockAttributes, 'portrait');
    expect(svg).toContain('viewBox="0 0 600 800"');
  });

  it('produces correct viewBox for landscape (800×600)', () => {
    const svg = exportPoster(mockModules, mockConnections, mockAttributes, 'landscape');
    expect(svg).toContain('viewBox="0 0 800 600"');
  });

  it('rejects invalid aspect ratio values', () => {
    expect(() => exportPoster(mockModules, mockConnections, mockAttributes, 'invalid')).toThrow();
  });
});

describe('exportEnhancedPoster aspect ratio viewBox', () => {
  const ratios = ['default', 'square', 'portrait', 'landscape'] as const;
  
  ratios.forEach(ratio => {
    it(`produces correct viewBox for ${ratio}`, () => {
      const svg = exportEnhancedPoster(mockModules, mockConnections, mockAttributes, ratio);
      const dims = ASPECT_RATIO_DIMS[ratio];
      expect(svg).toContain(`viewBox="0 0 ${dims.width} ${dims.height}"`);
    });
  });
});
```

**Verification:** Tests pass AND `npm run build` succeeds.

---

### AC4: Filename Input Persists Across Format Changes
**Test Method:** Component test in `src/__tests__/exportModal.test.ts`

```typescript
describe('ExportModal filename persistence', () => {
  it('filename state persists when format changes from PNG to SVG', () => {
    render(<ExportModal onClose={jest.fn()} />);
    
    const input = screen.getByRole('textbox', { name: /filename/i });
    fireEvent.change(input, { target: { value: 'my-custom-machine' } });
    
    // Change to SVG format tab
    fireEvent.click(screen.getByRole('tab', { name: /svg/i }));
    
    expect(screen.getByDisplayValue('my-custom-machine')).toBeInTheDocument();
  });

  it('filename state persists when format changes from SVG to Poster', () => {
    render(<ExportModal onClose={jest.fn()} />);
    
    const input = screen.getByRole('textbox', { name: /filename/i });
    fireEvent.change(input, { target: { value: 'another-machine' } });
    
    fireEvent.click(screen.getByRole('tab', { name: /svg/i }));
    fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
    
    expect(screen.getByDisplayValue('another-machine')).toBeInTheDocument();
  });

  it('filename state persists after multiple format switches', () => {
    render(<ExportModal onClose={jest.fn()} />);
    
    const input = screen.getByRole('textbox', { name: /filename/i });
    fireEvent.change(input, { target: { value: 'persistent-name' } });
    
    const formats = ['png', 'svg', 'poster', 'png'];
    formats.forEach(format => {
      fireEvent.click(screen.getByRole('tab', { name: new RegExp(format, 'i') }));
    });
    
    expect(screen.getByDisplayValue('persistent-name')).toBeInTheDocument();
  });
});
```

**Verification:** Tests pass AND `npm run build` succeeds.

---

### AC4b: Filename Sanitization
**Test Method:** Unit test in `src/__tests__/exportQuality.test.ts`

```typescript
describe('Filename sanitization', () => {
  it('replaces special characters with hyphens', () => {
    // Spaces and special chars are replaced with single hyphens, then trimmed
    const unsanitized = 'My Machine!';
    const sanitized = sanitizeFilename(unsanitized);
    expect(sanitized).toBe('my-machine');
  });

  it('converts to lowercase', () => {
    const unsanitized = 'MY MACHINE';
    const sanitized = sanitizeFilename(unsanitized);
    expect(sanitized).toBe('my-machine');
  });

  it('trims leading hyphens after replacement', () => {
    const unsanitized = '!!!machine';
    const sanitized = sanitizeFilename(unsanitized);
    expect(sanitized).toBe('machine');
  });

  it('trims trailing hyphens after replacement', () => {
    const unsanitized = 'machine!!!';
    const sanitized = sanitizeFilename(unsanitized);
    expect(sanitized).toBe('machine');
  });

  it('handles mixed special characters, spaces, and trimming end-to-end', () => {
    const unsanitized = '  My Machine! @#$%  ';
    const sanitized = sanitizeFilename(unsanitized);
    // After lowercase: '  my machine! @#$%  '
    // After char replacement: '--my-machine------'
    // After trim: 'my-machine'
    expect(sanitized).toBe('my-machine');
  });

  it('collapses multiple consecutive hyphens into one', () => {
    const unsanitized = 'machine---broken';
    const sanitized = sanitizeFilename(unsanitized);
    expect(sanitized).toBe('machine-broken');
  });
});
```

**Note:** Sanitization rules applied in order: (1) convert to lowercase, (2) replace each non-alphanumeric character (except hyphens) with a single hyphen, (3) collapse consecutive hyphens into one, (4) trim leading and trailing hyphens.

**Verification:** Tests pass AND `npm run build` succeeds.

---

### AC5: Export Preview Dimension Indicator Updates on Resolution Change
**Test Method:** Component test in `src/__tests__/exportModal.test.ts`

```typescript
describe('ExportModal dimension indicator', () => {
  it('shows ~400px dimension for 1x resolution', () => {
    render(<ExportModal onClose={jest.fn()} />);
    
    fireEvent.click(screen.getByRole('tab', { name: /png/i }));
    fireEvent.click(screen.getByRole('button', { name: /1x/i }));
    
    // Indicator should display dimensions in range 350-450px
    const dimensionText = screen.getByTestId('dimension-indicator');
    expect(dimensionText.textContent).toMatch(/4\d{2}/);
  });

  it('shows ~800px dimension for 2x resolution', () => {
    render(<ExportModal onClose={jest.fn()} />);
    
    fireEvent.click(screen.getByRole('tab', { name: /png/i }));
    fireEvent.click(screen.getByRole('button', { name: /2x/i }));
    
    const dimensionText = screen.getByTestId('dimension-indicator');
    expect(dimensionText.textContent).toMatch(/[78]\d{2}/);
  });

  it('shows ~1600px dimension for 4x resolution', () => {
    render(<ExportModal onClose={jest.fn()} />);
    
    fireEvent.click(screen.getByRole('tab', { name: /png/i }));
    fireEvent.click(screen.getByRole('button', { name: /4x/i }));
    
    const dimensionText = screen.getByTestId('dimension-indicator');
    expect(dimensionText.textContent).toMatch(/1[56]\d{2}/);
  });

  it('updates dimension when aspect ratio changes (default: 600×800)', () => {
    render(<ExportModal onClose={jest.fn()} />);
    
    fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
    
    const dimensionText = screen.getByTestId('dimension-indicator');
    expect(dimensionText.textContent).toMatch(/600.*800|800.*600/);
  });

  it('updates dimension when aspect ratio changes to square (600×600)', () => {
    render(<ExportModal onClose={jest.fn()} />);
    
    fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
    fireEvent.click(screen.getByRole('button', { name: /square/i }));
    
    const dimensionText = screen.getByTestId('dimension-indicator');
    expect(dimensionText.textContent).toMatch(/600.*600/);
  });

  it('updates dimension when aspect ratio changes to landscape (800×600)', () => {
    render(<ExportModal onClose={jest.fn()} />);
    
    fireEvent.click(screen.getByRole('tab', { name: /poster/i }));
    fireEvent.click(screen.getByRole('button', { name: /landscape/i }));
    
    const dimensionText = screen.getByTestId('dimension-indicator');
    expect(dimensionText.textContent).toMatch(/800.*600/);
  });
});
```

**Verification:** Tests pass AND `npm run build` succeeds.

---

### AC6: Quick Presets Apply Correctly
**Test Method:** Component test in `src/__tests__/exportModal.test.ts`

```typescript
describe('ExportModal quick presets', () => {
  const SOCIAL_MEDIA_PRESET = { format: 'png', resolution: '2x', aspectRatio: 'square' };
  const PRINT_PRESET = { format: 'png', resolution: '4x' };
  const ICON_PRESET = { format: 'png', resolution: '1x', transparentBackground: true };
  const PRESENTATION_PRESET = { format: 'svg' };

  it('Social Media preset selects PNG format', () => {
    render(<ExportModal onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /social media/i }));
    expect(screen.getByRole('tab', { name: /png/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('Social Media preset selects 2x resolution', () => {
    render(<ExportModal onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /social media/i }));
    expect(screen.getByRole('button', { name: /2x/i })).toHaveClass(/selected/);
  });

  it('Social Media preset selects square aspect ratio', () => {
    render(<ExportModal onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /social media/i }));
    expect(screen.getByRole('button', { name: /square/i })).toHaveClass(/selected/);
  });

  it('Print preset selects 4x resolution', () => {
    render(<ExportModal onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /print/i }));
    expect(screen.getByRole('button', { name: /4x/i })).toHaveClass(/selected/);
  });

  it('Icon preset enables transparent background', () => {
    render(<ExportModal onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /icon/i }));
    expect(screen.getByRole('checkbox', { name: /transparent/i })).toBeChecked();
  });

  it('Icon preset selects 1x resolution', () => {
    render(<ExportModal onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /icon/i }));
    expect(screen.getByRole('button', { name: /1x/i })).toHaveClass(/selected/);
  });

  it('Presentation preset selects SVG format', () => {
    render(<ExportModal onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /presentation/i }));
    expect(screen.getByRole('tab', { name: /svg/i })).toHaveAttribute('aria-selected', 'true');
  });
});
```

**Verification:** Tests pass AND `npm run build` succeeds.

---

### AC7: Build: 0 TypeScript errors
**Test Method:** `npm run build`

```bash
✓ 174 modules transformed.
✓ built in 1.40s
0 TypeScript errors
```

**Verification:** Build command succeeds with 0 errors.

---

### AC8: Backward Compatibility
**Test Method:** Run full test suite

```bash
npm test -- --run
# All existing tests continue to pass
```

**Verification:** Test suite runs without failures. Baseline test count is maintained.

---

## Test Methods Summary

1. **Unit tests for export utilities** (`src/__tests__/exportQuality.test.ts`)
   - `getResolutionDimensions()` tested for 1x, 2x, 4x with minimum dimension assertions
   - Scale factor ratios verified within 10% tolerance (1.9-2.1x for 2x, 3.8-4.2x for 4x)
   - Invalid resolution values (3x, 8x) verified to throw errors
   - `exportPoster()` tested with all 4 aspect ratios, asserting exact viewBox values
   - `exportEnhancedPoster()` tested with all 4 aspect ratios
   - `exportToPNG()` tested with transparentBackground option and default behavior
   - Filename sanitization tested with explicit replacement, collapse, and trim rules

2. **Component tests for ExportModal** (`src/__tests__/exportModal.test.ts`)
   - Filename persistence tested across format changes (PNG→SVG→Poster→PNG)
   - Dimension indicator updates tested for each resolution option (1x/2x/4x)
   - Dimension indicator uses regex patterns for range verification (e.g., `/4\d{2}/` for ~400px)
   - Aspect ratio dimension display tested for each ratio
   - Each preset button tested for specific format, resolution, and option combinations
   - Uses semantic roles (textbox, tab, button, checkbox) for test stability

3. **Integration tests**
   - Full export flow: select options → click export → verify file download
   - Verify downloaded file exists and has correct format and size

---

## Risks

1. **Canvas-based PNG export dependency** — PNG export uses canvas which may have CORS issues in some environments. Mitigated by using data URL approach.

2. **SVG animation in exports** — Some modules have CSS animations in SVG. These won't animate in static exports but this is expected behavior.

3. **Font rendering differences** — SVG fonts may render differently across browsers. Test with system fallback fonts.

4. **Large canvas memory** — 4x resolution exports create large canvases (1600px+). Ensure memory handling is correct.

5. **Regex-based dimension verification** — Using regex patterns like `/4\d{2}/` could match unintended text. Mitigated by using `data-testid` on dimension indicator element.

6. **i18n text in tests** — Preset button names use English text. Tests use case-insensitive matching to accommodate potential i18n changes.

---

## Failure Conditions

The round MUST fail if any of these conditions occur:

1. **Build fails** with any TypeScript or lint errors
2. **Any unit test fails** in `exportQuality.test.ts` or `exportModal.test.ts`
3. **Dimension indicator does not update** when resolution/aspect ratio changes (tested via AC5)
4. **Filename is lost** when switching between formats (tested via AC4)
5. **Preset buttons do not apply** all associated options (tested via AC6)
6. **New tests break** existing functionality (existing test count drops below baseline)
7. **Export produces corrupted/invalid files** (PNG signature mismatch)
8. **Invalid resolution values** (3x, 8x, etc.) are accepted instead of throwing errors
9. **Invalid aspect ratio values** are accepted instead of throwing errors
10. **Scale factor deviates more than 10%** from intended multiplier

---

## Done Definition

The round is complete when ALL of these conditions are true:

1. All 8 acceptance criteria pass with unit/component/integration tests
2. Build succeeds with 0 TypeScript errors
3. All existing tests continue to pass
4. `exportQuality.test.ts` contains passing tests for AC1, AC2, AC3, AC4b
5. `exportModal.test.ts` contains passing tests for AC4, AC5, AC6
6. Export modal dimension indicator updates when resolution changes (verified via regex)
7. Export modal dimension indicator updates when aspect ratio changes
8. Filename input value is preserved across format switches
9. Each preset button sets all its associated options correctly
10. Resolution functions reject invalid values (3x, 8x, etc.)
11. Aspect ratio functions reject invalid values
12. Scale factors are within 10% tolerance of intended multiplier
13. Filename sanitization applies: lowercase → replace special chars with hyphens → collapse consecutive hyphens → trim leading/trailing hyphens
14. No regression in existing export functionality

---

## Out of Scope

- **Animated GIF export** — Requires additional library (gif.js or similar)
- **Video recording** of activation sequence
- **Batch export** of multiple machines
- **Custom poster templates** with user-defined layouts
- **Cloud storage integration** for exports
- **Print-optimized PDF export**
- **Module-level SVG export** (single module export)
- **Watermark customization** in exports
- **Anti-aliasing quality verification** — Cannot be tested programmatically; requires visual review
- **Faction card visual polish** — Subjective; requires design iteration
- **Poster stats visualization polish** — Subjective; requires design iteration
- **Browser E2E testing** — Requires Playwright/Cypress setup (blocked by welcome modal in current environment)
- Changes to the core editing experience
- Changes to activation choreography logic
- Changes to grouping/keyboard shortcuts (completed in round 41)

---

## Contract Revision Notes (Round 42 Review)

### Revision 1 → Revision 2 (This revision)

1. **Fixed AC4b sanitization test expectations** — The original test expected `'my-machine------'` for input `'My Machine! @#$%'`, but this contradicts the contract's own "trims leading and trailing hyphens" rule. After replacement → collapse → trim, the correct expected result is `'my-machine'`. Tests have been rewritten with explicit, internally-consistent expectations:
   - `'My Machine!'` → `'my-machine'`
   - `'!!!machine'` → `'machine'`
   - `'machine!!!'` → `'machine'`
   - `'  My Machine! @#$%  '` → `'my-machine'`
   - `'machine---broken'` → `'machine-broken'`

2. **Separated AC4 and AC4b** — Filename persistence (component-level state) is tested in AC4; filename sanitization (utility function) is tested in AC4b. Added explicit sanitization pipeline documentation.

3. **Updated Done Definition item 13** — Explicit sanitization pipeline steps listed to match test expectations.

4. **Updated Test Methods Summary** — AC4b added to exportQuality.test.ts summary.

---

## APPROVED — Round 42
