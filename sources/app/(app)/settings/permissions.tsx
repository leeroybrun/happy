import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Item } from '@/components/Item';
import { ItemGroup } from '@/components/ItemGroup';
import { ItemList } from '@/components/ItemList';
import { useSettingMutable } from '@/sync/storage';
import { t } from '@/text';

type ClaudePermissionMode = 'default' | 'acceptEdits' | 'plan' | 'bypassPermissions' | null;
type CodexPermissionMode = 'default' | 'read-only' | 'safe-yolo' | 'yolo' | null;

export default function PermissionsSettingsScreen() {
    const [defaultPermissionModeClaude, setDefaultPermissionModeClaude] = useSettingMutable('defaultPermissionModeClaude');
    const [defaultPermissionModeCodex, setDefaultPermissionModeCodex] = useSettingMutable('defaultPermissionModeCodex');

    const claudeOptions: Array<{ key: ClaudePermissionMode; title: string }> = [
        { key: null, title: 'Use last used / CLI defaults' },
        { key: 'default', title: t('agentInput.permissionMode.default') },
        { key: 'acceptEdits', title: t('agentInput.permissionMode.acceptEdits') },
        { key: 'plan', title: t('agentInput.permissionMode.plan') },
        { key: 'bypassPermissions', title: t('agentInput.permissionMode.bypassPermissions') },
    ];

    const codexOptions: Array<{ key: CodexPermissionMode; title: string }> = [
        { key: null, title: 'Use last used / CLI defaults' },
        { key: 'default', title: t('agentInput.codexPermissionMode.default') },
        { key: 'read-only', title: t('agentInput.codexPermissionMode.readOnly') },
        { key: 'safe-yolo', title: t('agentInput.codexPermissionMode.safeYolo') },
        { key: 'yolo', title: t('agentInput.codexPermissionMode.yolo') },
    ];

    return (
        <ItemList style={{ paddingTop: 0 }}>
            <ItemGroup
                title="Default permission mode (Claude)"
                footer="Used for new Claude sessions. Existing sessions keep their per-session setting."
            >
                {claudeOptions.map((option) => (
                    <Item
                        key={option.key}
                        title={option.title}
                        icon={<Ionicons name="shield-checkmark-outline" size={29} color="#007AFF" />}
                        rightElement={
                            defaultPermissionModeClaude === option.key ? (
                                <Ionicons name="checkmark" size={20} color="#007AFF" />
                            ) : null
                        }
                        onPress={() => setDefaultPermissionModeClaude(option.key)}
                        showChevron={false}
                    />
                ))}
            </ItemGroup>

            <ItemGroup
                title="Default permission mode (Codex & Gemini)"
                footer="Used for new Codex/Gemini sessions. Existing sessions keep their per-session setting."
            >
                {codexOptions.map((option) => (
                    <Item
                        key={option.key}
                        title={option.title}
                        icon={<Ionicons name="shield-outline" size={29} color="#5856D6" />}
                        rightElement={
                            defaultPermissionModeCodex === option.key ? (
                                <Ionicons name="checkmark" size={20} color="#007AFF" />
                            ) : null
                        }
                        onPress={() => setDefaultPermissionModeCodex(option.key)}
                        showChevron={false}
                    />
                ))}
            </ItemGroup>
        </ItemList>
    );
}
