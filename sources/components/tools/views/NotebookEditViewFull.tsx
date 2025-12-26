import * as React from 'react';
import { View, Text } from 'react-native';
import { ToolCall } from '@/sync/typesMessage';
import { Metadata } from '@/sync/storageTypes';
import { knownTools } from '@/components/tools/knownTools';
import { toolFullViewStyles } from '../ToolFullView';
import { ToolDiffView } from '@/components/tools/ToolDiffView';

interface NotebookEditViewFullProps {
    tool: ToolCall;
    metadata: Metadata | null;
}

export const NotebookEditViewFull = React.memo<NotebookEditViewFullProps>(({ tool, metadata }) => {
    const parsed = knownTools.NotebookEdit.input.safeParse(tool.input);
    if (!parsed.success) {
        return null;
    }

    const newSource = typeof parsed.data.new_source === 'string' ? parsed.data.new_source : '';
    const mode = (parsed.data.edit_mode as string | undefined) || 'replace';
    const cellId = (parsed.data.cell_id as string | undefined) || '';

    return (
        <View style={toolFullViewStyles.sectionFullWidth}>
            <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 13, opacity: 0.7 }}>
                    {cellId ? `cell: ${cellId} · mode: ${mode}` : `mode: ${mode}`}
                </Text>
            </View>
            <ToolDiffView oldText={''} newText={newSource} style={{ width: '100%' }} showLineNumbers={true} showPlusMinusSymbols={true} />
        </View>
    );
});

