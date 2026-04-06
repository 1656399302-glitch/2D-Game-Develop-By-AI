APPROVED

# Sprint Contract — Round 169

## Scope

Implement a comprehensive **Circuit Persistence Backup System** that provides automatic saving, version history, and crash recovery for user circuits. This addresses a key quality-of-life gap in the current application by ensuring users never lose their work.

## Spec Traceability

### P0 items (Must have)
- **Auto-save functionality** with configurable interval (default: 30 seconds)
- **Version history storage** (last 10 circuit states)
- **Crash recovery prompt** on page reload when unsaved changes detected
- **Manual backup creation** with naming capability

### P1 items (Should have)
- **Backup management UI** (view, restore, delete backups)
- **Storage usage indicator** (show localStorage consumption)
- **Import/export backups** as JSON files

### P2 intentionally deferred
- Cloud sync / server-side persistence
- Collaborative editing
- Circuit diffing / merge tools

## Deliverables

1. **`src/store/backupStore.ts`** — Zustand store for managing circuit backups
   - `createBackup(name?: string): BackupData`
   - `restoreBackup(backupId: string): void`
   - `deleteBackup(backupId: string): void`
   - `listBackups(): BackupData[]`
   - `getAutoSave(): BackupData | null`
   - `clearAutoSave(): void`
   - `getStorageUsage(): { used: number; available: number }`
   - `exportBackup(backupId: string): string` (JSON)
   - `importBackup(json: string): BackupData | null`

2. **`src/hooks/useCircuitBackup.ts`** — React hook for backup integration
   - Auto-save on interval
   - Pre-unload warning
   - Backup trigger on significant actions

3. **`src/components/Backup/BackupManager.tsx`** — Backup management UI component
   - List all backups with timestamps and names
   - Restore/delete actions
   - Storage usage display
   - Import/export buttons

4. **`src/components/Backup/RecoveryPrompt.tsx`** — Crash recovery modal
   - Shows on page load when unsaved changes detected
   - Options: Restore latest, Start fresh, Import backup

5. **`src/components/Backup/BackupButton.tsx`** — Toolbar button for manual backup

6. **`src/__tests__/backupStore.test.ts`** — Unit tests for backup store (minimum 15 tests)

7. **`src/__tests__/useCircuitBackup.test.ts`** — Hook tests (minimum 10 tests)

8. **`src/__tests__/BackupManager.test.tsx`** — Component tests (minimum 10 tests)

9. **`src/__tests__/RecoveryPrompt.test.tsx`** — Recovery modal tests (minimum 8 tests)

## Acceptance Criteria

1. **AC-169-001: Auto-save works correctly**
   - Backup is created automatically every 30 seconds when circuit has changes
   - `localStorage` key `circuit-backup-auto` contains the latest auto-saved state
   - Auto-save does not overwrite named backups

2. **AC-169-002: Version history is maintained**
   - Maximum 10 backups stored (FIFO when limit exceeded)
   - Each backup contains: id, timestamp, name, modules, connections
   - Backup count can be queried

3. **AC-169-003: Crash recovery works**
   - On page reload with unsaved changes, RecoveryPrompt appears
   - User can restore the auto-saved state
   - User can dismiss and start fresh
   - Recovery prompt does not appear if no changes detected

4. **AC-169-004: Manual backup creation**
   - User can create named backup via toolbar button
   - Named backups appear in backup list
   - Backups can be deleted individually

5. **AC-169-005: Storage management**
   - Storage usage is displayed accurately
   - Oldest auto-saves are pruned when approaching localStorage limits
   - Graceful handling when storage is full

6. **AC-169-006: Import/export functionality**
   - Backup can be exported as JSON file download
   - JSON backup can be imported and restored
   - Import validates backup structure before restoring

7. **AC-169-007: No regression in existing functionality**
   - All 238 existing test files continue to pass (242 total after adding 4 new files)
   - Total test count increases by minimum 43 tests (6865 → 6908 minimum)
   - Bundle size remains under 512KB
   - TypeScript compiles with 0 errors

## Test Methods

### AC-169-001: Auto-save works correctly
```bash
# Run backup store tests including auto-save behavior
npm test -- --run src/__tests__/backupStore.test.ts -t "auto"

# Verify auto-save key exists after interval (hook test)
npm test -- --run src/__tests__/useCircuitBackup.test.ts -t "auto-save"

# Verify auto-save creates without overwriting named backups
npm test -- --run src/__tests__/backupStore.test.ts -t "overwrite"
```

### AC-169-002: Version history is maintained
```bash
# Test backup limit enforcement (FIFO)
npm test -- --run src/__tests__/backupStore.test.ts -t "limits"

# Test backup data structure
npm test -- --run src/__tests__/backupStore.test.ts -t "structure"

# Verify correct number of backups stored
npm test -- --run src/__tests__/backupStore.test.ts -t "count"
```

### AC-169-003: Crash recovery works
```bash
# Test recovery prompt renders with changes
npm test -- --run src/__tests__/RecoveryPrompt.test.tsx -t "unsaved"

# Test restore action restores state
npm test -- --run src/__tests__/RecoveryPrompt.test.tsx -t "restore"

# Test dismiss action clears and starts fresh
npm test -- --run src/__tests__/RecoveryPrompt.test.tsx -t "dismiss"

# Test prompt does not show without changes
npm test -- --run src/__tests__/RecoveryPrompt.test.tsx -t "no-changes"
```

### AC-169-004: Manual backup creation
```bash
# Test backup creation with name
npm test -- --run src/__tests__/BackupManager.test.tsx -t "create"

# Test backup appears in list after creation
npm test -- --run src/__tests__/BackupManager.test.tsx -t "list"

# Test backup deletion
npm test -- --run src/__tests__/BackupManager.test.tsx -t "delete"
```

### AC-169-005: Storage management
```bash
# Test storage calculations
npm test -- --run src/__tests__/backupStore.test.ts -t "storage"

# Test graceful handling when quota exceeded
npm test -- --run src/__tests__/backupStore.test.ts -t "quota"

# Test pruning of oldest auto-saves
npm test -- --run src/__tests__/backupStore.test.ts -t "prune"
```

### AC-169-006: Import/export functionality
```bash
# Test export produces valid JSON
npm test -- --run src/__tests__/backupStore.test.ts -t "export"

# Test import validates and restores backup
npm test -- --run src/__tests__/backupStore.test.ts -t "import"

# Test import rejects invalid JSON
npm test -- --run src/__tests__/backupStore.test.ts -t "invalid"

# Test export/import roundtrip maintains data integrity
npm test -- --run src/__tests__/backupStore.test.ts -t "roundtrip"
```

### AC-169-007: No regression
```bash
# Full test suite
npm test -- --run

# Verify test file count: expect 242 test files
# Verify test count: expect minimum 6908 tests

# TypeScript check
npx tsc --noEmit

# Build size check
npm run build
# Verify bundle < 512KB
```

## Risks

1. **localStorage quota limitations** — Handle gracefully when storage is full
   - Mitigation: Implement quota detection and user notification
   - Fallback: Clear oldest backups before creating new ones

2. **Large circuit serialization** — Very complex circuits may exceed storage limits
   - Mitigation: Compress circuit data before storage
   - Fallback: Warn user and prevent auto-save for circuits exceeding threshold

3. **act() warnings in React tests** — Due to async storage operations
   - Mitigation: Use `waitFor` with proper async handling
   - Fallback: Mock localStorage in tests

4. **Test file proliferation** — Adding 4 new test files increases maintenance burden
   - Mitigation: Keep tests focused, avoid redundancy
   - Acceptable: 242 files is <2% increase from 238

## Failure Conditions

The sprint fails if:

1. **Test suite regression** — Any existing 238 test files fail (new files may fail only during development, must be fixed before completion)
2. **TypeScript errors** — `npx tsc --noEmit` produces errors
3. **Bundle size exceeded** — `dist/assets/index-*.js` exceeds 512KB
4. **act() warnings** — New warnings appear in test output
5. **Critical bugs** — Crash on backup creation, data corruption, or permanent data loss

## Done Definition

All conditions below must be true:

1. ✅ `npm test -- --run` exits with code 0 showing 242 test files passing (6908+ tests)
2. ✅ `npx tsc --noEmit` exits with code 0 with no output
3. ✅ `npm run build` succeeds with bundle ≤512KB
4. ✅ Backup store implements all P0 interfaces
5. ✅ Recovery prompt appears correctly on reload with changes
6. ✅ Auto-save creates backups at configured interval
7. ✅ All 43 new tests pass (backupStore: 15, useCircuitBackup: 10, BackupManager: 10, RecoveryPrompt: 8)
8. ✅ Import/export functionality works with valid JSON roundtrip
9. ✅ No new act() warnings in test output
10. ✅ All 238 existing test files continue to pass

## Out of Scope

- Server-side/cloud backup storage
- Automatic backup to cloud services
- Circuit versioning with diffing
- Collaborative editing features
- Backup encryption (may be added in future rounds)
- Integration with community gallery for backing up published circuits
