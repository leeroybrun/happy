import { describe, it, expect } from 'vitest';
import { coercePermissionModeForFlavor, getDefaultPermissionModeForFlavor } from './permissionModeDefaults';

describe('permissionModeDefaults', () => {
    describe('coercePermissionModeForFlavor', () => {
        it('coerces Codex/Gemini to codex-like modes', () => {
            expect(coercePermissionModeForFlavor('safe-yolo', 'codex')).toBe('safe-yolo');
            expect(coercePermissionModeForFlavor('read-only', 'gemini')).toBe('read-only');
            expect(coercePermissionModeForFlavor('acceptEdits', 'codex')).toBe('default');
        });

        it('coerces Claude to claude-like modes', () => {
            expect(coercePermissionModeForFlavor('acceptEdits', 'claude')).toBe('acceptEdits');
            expect(coercePermissionModeForFlavor('yolo', 'claude')).toBe('default');
        });
    });

    describe('getDefaultPermissionModeForFlavor', () => {
        it('returns default when unset', () => {
            expect(getDefaultPermissionModeForFlavor({
                flavor: 'claude',
                defaultPermissionModeClaude: null,
                defaultPermissionModeCodex: null,
            })).toBe('default');
        });

        it('uses per-flavor defaults when set', () => {
            expect(getDefaultPermissionModeForFlavor({
                flavor: 'claude',
                defaultPermissionModeClaude: 'plan',
                defaultPermissionModeCodex: 'safe-yolo',
            })).toBe('plan');

            expect(getDefaultPermissionModeForFlavor({
                flavor: 'codex',
                defaultPermissionModeClaude: 'plan',
                defaultPermissionModeCodex: 'safe-yolo',
            })).toBe('safe-yolo');

            expect(getDefaultPermissionModeForFlavor({
                flavor: 'gemini',
                defaultPermissionModeClaude: 'plan',
                defaultPermissionModeCodex: 'read-only',
            })).toBe('read-only');
        });
    });
});

