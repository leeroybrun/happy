import * as React from 'react';
import { View, Text } from 'react-native';
import { ToolSectionView } from '../../tools/ToolSectionView';
import { ToolViewProps } from './_all';
import { ToolDiffView } from '@/components/tools/ToolDiffView';
import { knownTools } from '../../tools/knownTools';
import { useSetting } from '@/sync/storage';

export const NotebookEditView = React.memo<ToolViewProps>(({ tool }) => {
    const showLineNumbersInToolViews = useSetting('showLineNumbersInToolViews');

    const parsed = knownTools.NotebookEdit.input.safeParse(tool.input);
    if (!parsed.success) {
        return null;
    }

    const newSource = typeof parsed.data.new_source === 'string' ? parsed.data.new_source : '';
    const mode = (parsed.data.edit_mode as string | undefined) || 'replace';
    const cellId = (parsed.data.cell_id as string | undefined) || '';

    return (
        <>
            <ToolSectionView>
                <View style={{ gap: 2 }}>
                    <Text style={{ fontSize: 12, opacity: 0.7 }}>
                        {cellId ? `cell: ${cellId} · mode: ${mode}` : `mode: ${mode}`}
                    </Text>
                </View>
            </ToolSectionView>
            <ToolSectionView fullWidth>
                <ToolDiffView
                    oldText={''}
                    newText={newSource}
                    showLineNumbers={showLineNumbersInToolViews}
                    showPlusMinusSymbols={showLineNumbersInToolViews}
                />
            </ToolSectionView>
        </>
    );
});

