import * as React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { DiffView } from '@/components/diff/DiffView';
import { useSetting } from '@/sync/storage';
import { useUnistyles } from 'react-native-unistyles';
import { t } from '@/text';

interface ToolDiffViewProps {
    oldText: string;
    newText: string;
    style?: any;
    showLineNumbers?: boolean;
    showPlusMinusSymbols?: boolean;
    forceVisible?: boolean;
}

export const ToolDiffView = React.memo<ToolDiffViewProps>(({ 
    oldText, 
    newText, 
    style, 
    showLineNumbers = false,
    showPlusMinusSymbols = false,
    forceVisible = false,
}) => {
    const { theme } = useUnistyles();
    const wrapLines = useSetting('wrapLinesInDiffs');
    const showDiffsInToolViews = useSetting('showDiffsInToolViews');
    const [revealed, setRevealed] = React.useState(false);

    if (!forceVisible && !showDiffsInToolViews && !revealed) {
        return (
            <Pressable
                onPress={() => setRevealed(true)}
                style={({ pressed }) => [
                    {
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: theme.colors.surfaceHigh,
                        opacity: pressed ? 0.85 : 1,
                    },
                    style,
                ]}
            >
                <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                    {t('tools.diffHidden')}
                </Text>
            </Pressable>
        );
    }
    
    const diffView = (
        <DiffView 
            oldText={oldText} 
            newText={newText} 
            wrapLines={wrapLines}
            showLineNumbers={showLineNumbers}
            showPlusMinusSymbols={showPlusMinusSymbols}
            style={{ flex: 1, ...style }}
        />
    );
    
    if (wrapLines) {
        // When wrapping lines, no horizontal scroll needed
        return <View style={{ flex: 1 }}>{diffView}</View>;
    }
    
    // When not wrapping, use horizontal scroll
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ flexGrow: 1 }}
        >
            {diffView}
        </ScrollView>
    );
});
