import * as React from 'react';
import { View, Text, Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ToolCall } from '@/sync/typesMessage';
import { ToolSectionView } from '../ToolSectionView';
import { ToolDiffView } from '@/components/tools/ToolDiffView';
import { Metadata } from '@/sync/storageTypes';
import { useSetting } from '@/sync/storage';
import { t } from '@/text';

interface CodexDiffViewProps {
    tool: ToolCall;
    metadata: Metadata | null;
}

/**
 * Parse a unified diff into per-file hunks.
 * Codex can send multi-file diffs; we must not concatenate them.
 */
type ParsedFileDiff = {
    fileName?: string;
    oldText: string;
    newText: string;
};

function parseUnifiedDiff(unifiedDiff: string): ParsedFileDiff[] {
    const lines = unifiedDiff.split('\n');
    const results: ParsedFileDiff[] = [];

    let current: {
        fileName?: string;
        oldLines: string[];
        newLines: string[];
        inHunk: boolean;
    } | null = null;

    const flush = () => {
        if (!current) return;
        // Only keep entries that have some diff content or a filename
        if (current.oldLines.length > 0 || current.newLines.length > 0 || current.fileName) {
            results.push({
                fileName: current.fileName,
                oldText: current.oldLines.join('\n'),
                newText: current.newLines.join('\n'),
            });
        }
        current = null;
    };

    for (const line of lines) {
        if (line.startsWith('diff --git')) {
            flush();
            current = { oldLines: [], newLines: [], inHunk: false };
            continue;
        }

        // Some diffs may omit the 'diff --git' line; lazily initialize.
        if (!current) {
            current = { oldLines: [], newLines: [], inHunk: false };
        }

        // Extract filename from diff header (prefer b/<path>)
        if (line.startsWith('+++ ')) {
            const raw = line.replace(/^\+\+\+\s+/, '');
            const normalized = raw.replace(/^(b\/)/, '');
            if (normalized !== '/dev/null') {
                current.fileName = normalized;
            }
            continue;
        }

        // Skip common header lines
        if (
            line.startsWith('index ') ||
            line.startsWith('--- ') ||
            line.startsWith('new file mode') ||
            line.startsWith('deleted file mode') ||
            line.startsWith('similarity index') ||
            line.startsWith('rename from') ||
            line.startsWith('rename to')
        ) {
            continue;
        }

        // Hunk header
        if (line.startsWith('@@')) {
            current.inHunk = true;
            continue;
        }

        if (!current.inHunk) {
            continue;
        }

        if (line === '\\ No newline at end of file') {
            continue;
        }

        if (line.startsWith('+')) {
            current.newLines.push(line.substring(1));
            continue;
        }

        if (line.startsWith('-')) {
            current.oldLines.push(line.substring(1));
            continue;
        }

        if (line.startsWith(' ')) {
            current.oldLines.push(line.substring(1));
            current.newLines.push(line.substring(1));
            continue;
        }

        if (line === '') {
            current.oldLines.push('');
            current.newLines.push('');
        }
    }

    flush();
    return results;
}

export const CodexDiffView = React.memo<CodexDiffViewProps>(({ tool, metadata }) => {
    const { theme } = useUnistyles();
    const showLineNumbersInToolViews = useSetting('showLineNumbersInToolViews');
    const showDiffsInToolViews = useSetting('showDiffsInToolViews');
    const { input } = tool;
    const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

    // Parse the unified diff into per-file entries
    let fileDiffs: ParsedFileDiff[] = [];

    if (input?.unified_diff && typeof input.unified_diff === 'string') {
        fileDiffs = parseUnifiedDiff(input.unified_diff);
    }

    if (fileDiffs.length === 0) {
        return null;
    }

    if (!showDiffsInToolViews) {
        return (
            <ToolSectionView>
                {fileDiffs.map((fd, idx) => {
                    const isExpanded = expandedIndex === idx;
                    const fileName = fd.fileName ?? t('tools.unknownFile');
                    const chevron = isExpanded ? '▾' : '▸';
                    return (
                        <View key={`${fd.fileName ?? 'unknown'}-${idx}`} style={styles.fileRow}>
                            <Pressable
                                onPress={() => setExpandedIndex(isExpanded ? null : idx)}
                                style={({ pressed }) => [
                                    styles.fileRowButton,
                                    { opacity: pressed ? 0.85 : 1 },
                                ]}
                            >
                                <Text style={styles.fileName}>{fileName}</Text>
                                <Text style={styles.fileRowAction}>{chevron}</Text>
                            </Pressable>
                            {isExpanded && (
                                <View style={styles.expandedDiff}>
                                    <ToolDiffView
                                        oldText={fd.oldText}
                                        newText={fd.newText}
                                        showLineNumbers={showLineNumbersInToolViews}
                                        showPlusMinusSymbols={showLineNumbersInToolViews}
                                        forceVisible
                                    />
                                </View>
                            )}
                        </View>
                    );
                })}
            </ToolSectionView>
        );
    }

    return (
        <>
            {fileDiffs.map((fd, idx) => (
                <React.Fragment key={`${fd.fileName ?? 'unknown'}-${idx}`}>
                    <View style={styles.fileHeader}>
                        <Text style={styles.fileName}>{fd.fileName ?? t('tools.unknownFile')}</Text>
                    </View>
                    <ToolSectionView fullWidth>
                        <ToolDiffView
                            oldText={fd.oldText}
                            newText={fd.newText}
                            showLineNumbers={showLineNumbersInToolViews}
                            showPlusMinusSymbols={showLineNumbersInToolViews}
                        />
                    </ToolSectionView>
                </React.Fragment>
            ))}
        </>
    );
});

const styles = StyleSheet.create((theme) => ({
    fileHeader: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: theme.colors.surfaceHigh,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    fileName: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontFamily: 'monospace',
    },
    fileRow: {
        marginBottom: 8,
    },
    fileRowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: theme.colors.surfaceHigh,
        borderRadius: 8,
    },
    fileRowAction: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    expandedDiff: {
        marginTop: 8,
    },
}));
