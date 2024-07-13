import {ScrollView, Square, Text, useTheme, XStack} from "tamagui";
import {allThemes, typography} from "@/theme";

export default function ColorsScreen() {
    const theme = useTheme()

    return (
        <ScrollView>
            <XStack flexWrap="wrap" gap={16} alignItems="center" justifyContent="center">
                {Object.keys(allThemes.light).map((el) => (
                    <Square
                        key={el}
                        size={120}
                        backgroundColor={theme[el]?.val}
                    >
                        <Text
                            {...typography.body3}
                            color={theme.textPrimary.val}
                            backgroundColor={theme.background.val}
                            padding={8}
                        >
                            {el}
                        </Text>
                    </Square>
                ))}
            </XStack>
        </ScrollView>
    )
}
