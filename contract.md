APPROVED

# Sprint Contract — Round 13

## Scope

**Focus:** Enhanced Export System with High-Resolution PNG and Custom Background Options

This round adds professional-grade export capabilities:
- PNG export at 1x, 2x, and 4x resolution
- Optional transparent background for PNG exports
- Custom filename preservation across exports
- Improved poster card aspect ratios (square, portrait, landscape)
- Export format presets for common use cases

## Spec Traceability

### P0 items (Must complete this round)
- **Export Quality Enhancement**: Add resolution multiplier options (1x, 2x, 4x) for PNG export
- **Background Options**: Add transparent background toggle for PNG exports
- **Aspect Ratio Presets**: Add square/portrait/landscape options for poster exports
- **Filename Persistence**: Remember user's last used filename across export sessions

### P1 items (If time allows)
- **Export Presets**: Quick-select buttons for common export formats (social media, print, icon)

### Remaining P0/P1 after this round
- All P0/P1 items from spec are covered by existing implementation
- No unresolved high-priority items

### P2 intentionally deferred
- AI naming/description integration
- Community sharing features
- Mobile-specific optimizations
- Custom module creation tool

## Deliverables

1. **Enhanced Export Modal** (`src/components/Export/ExportModal.tsx`)
   - Resolution selector (1x/2x/4x) with preview of output size
   - Transparent background toggle checkbox
   - Aspect ratio selector for poster cards
   - Filename input that persists value during session

2. **Updated Export Utilities** (`src/utils/exportUtils.ts`)
   - `exportToPNG()` with `scale` parameter (1, 2, 4)
   - `exportToPNG()` with `transparentBackground` parameter
   - Poster exports with `aspectRatio` parameter ('square' | 'portrait' | 'landscape')
   - Proper canvas sizing calculations for each resolution

3. **Enhanced Poster Templates**
   - Square (600x600), Portrait (600x800), Landscape (800x600) variants
   - Layout adjusts dynamically based on aspect ratio
   - Maintains visual hierarchy across all ratios

4. **New Tests** (`src/__tests__/exportQuality.test.tsx`)
   - Resolution multiplier test
   - Transparent background test
   - Aspect ratio preset test
   - Filename persistence test

## Acceptance Criteria

1. **AC1: Resolution Multiplier**
   - PNG export at 1x produces minimum 400x300px image
   - PNG export at 2x produces minimum 800x600px image
   - PNG export at 4x produces minimum 1600x1200px image
   - Scale selector UI shows expected output dimensions

2. **AC2: Transparent Background**
   - PNG export with transparent background produces image with alpha channel
   - Toggle checkbox labeled "透明背景" (Transparent Background)
   - Default is opaque (current behavior)
   - Transparent mode removes dark background from export

3. **AC3: Aspect Ratio Presets**
   - Poster export dropdown offers: 默认 (Default), 方形 (Square), 纵向 (Portrait), 横向 (Landscape)
   - Square produces 600x600 poster
   - Portrait produces 600x800 poster
   - Landscape produces 800x600 poster
   - Layout adjusts appropriately for each ratio

4. **AC4: Filename Persistence**
   - Filename input field retains value during export modal session
   - Changing format does not reset filename
   - Default filename is 'arcane-machine'

5. **AC5: Backward Compatibility**
   - Default export behavior unchanged when not using new options
   - Existing SVG export continues to work
   - All 877 existing tests pass

## Test Methods

### Unit Tests
1. **Resolution Test**: Mock canvas operations, verify scale parameter creates correct dimensions
2. **Transparency Test**: Verify canvas context has `globalCompositeOperation` or alpha applied
3. **Aspect Ratio Test**: Verify poster dimensions match expected ratios
4. **Filename Test**: Simulate multiple format selections, verify filename persists

### Browser Verification
1. Open Export Modal, select PNG format
2. Verify resolution dropdown shows 1x/2x/4x options with size previews
3. Verify transparent background checkbox appears for PNG
4. Select each resolution, verify filename display shows expected output size
5. Export PNG at each resolution, verify file dimensions match
6. Export with transparent background, verify no dark background in result
7. Change poster format, verify aspect ratio changes
8. Verify filename persists across format changes

## Risks

1. **Canvas Scaling Quality**: 4x scale may produce blurry results on some browsers
   - Mitigation: Use proper canvas scaling with anti-aliasing
2. **Transparency in Poster**: Poster exports always have background (not a risk)
3. **Test Coverage**: Need to ensure existing export tests still pass
   - Mitigation: Run full test suite, add specific new tests

## Failure Conditions

1. Any existing test fails (877 tests must pass)
2. Export modal fails to render or becomes non-functional
3. PNG export produces no output or corrupt file
4. Resolution 4x causes browser crash or timeout
5. Transparent background toggle has no effect
6. TypeScript compilation errors introduced

## Done Definition

- [ ] AC1: Resolution dropdown (1x/2x/4x) implemented and functional
- [ ] AC2: Transparent background toggle implemented and functional  
- [ ] AC3: Aspect ratio presets implemented and functional
- [ ] AC4: Filename persistence during export session works
- [ ] AC5: `npm test` passes all 877+ tests
- [ ] `npm run build` succeeds with 0 TypeScript errors
- [ ] Browser verification confirms all 4 new features work
- [ ] No regression in existing export formats (SVG, PNG, Poster, Faction Card)

## Out of Scope

- AI-powered naming or description generation
- Social media direct sharing integration
- Module color customization (per-module theming)
- Additional module types beyond 15 existing
- Faction expansion beyond 5 existing
- Recipe system expansion
- Challenge system changes
- Tutorial/welcome flow modifications
- Performance optimization for large machines
- Mobile-specific export layouts
- WebP or other format support beyond SVG/PNG

## Notes

- Default PNG behavior (1x, opaque) matches current implementation
- Export modal UX follows existing patterns (format buttons, preview icons)
- Chinese localization for all new UI elements
- ExportUtils remains backward compatible via default parameters
