export type PermissionMode =
    | 'default'
    | 'acceptEdits'
    | 'bypassPermissions'
    | 'plan'
    | 'read-only'
    | 'safe-yolo'
    | 'yolo';

export type SessionFlavor = string | null | undefined;

export type ClaudePermissionMode = Extract<PermissionMode, 'default' | 'acceptEdits' | 'plan' | 'bypassPermissions'>;
export type CodexPermissionMode = Extract<PermissionMode, 'default' | 'read-only' | 'safe-yolo' | 'yolo'>;

export function isClaudePermissionMode(mode: unknown): mode is ClaudePermissionMode {
    return mode === 'default' || mode === 'acceptEdits' || mode === 'plan' || mode === 'bypassPermissions';
}

export function isCodexPermissionMode(mode: unknown): mode is CodexPermissionMode {
    return mode === 'default' || mode === 'read-only' || mode === 'safe-yolo' || mode === 'yolo';
}

export function isCodexLikeFlavor(flavor: SessionFlavor): flavor is 'codex' | 'gemini' {
    return flavor === 'codex' || flavor === 'gemini';
}

export function coercePermissionModeForFlavor(mode: unknown, flavor: SessionFlavor): PermissionMode {
    if (isCodexLikeFlavor(flavor)) {
        return isCodexPermissionMode(mode) ? mode : 'default';
    }
    return isClaudePermissionMode(mode) ? mode : 'default';
}

export function getDefaultPermissionModeForFlavor(args: {
    flavor: SessionFlavor;
    defaultPermissionModeClaude: ClaudePermissionMode | null;
    defaultPermissionModeCodex: CodexPermissionMode | null;
}): PermissionMode {
    return isCodexLikeFlavor(args.flavor)
        ? (args.defaultPermissionModeCodex ?? 'default')
        : (args.defaultPermissionModeClaude ?? 'default');
}
