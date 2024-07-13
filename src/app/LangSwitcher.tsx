import {Button, Text, XStack, YStack} from "tamagui";
import {useSelectedLanguage} from "@/core";
import {Language, resources} from "@/core/localization/resources";

console.log(resources)

export default function LangSwitcher() {
    const {language, setLanguage} = useSelectedLanguage()

    return (
        <YStack gap={24} alignItems={'center'}>
            <Text>current lang: {language}</Text>

            <XStack gap={8}>
                {Object.keys(resources).map((el) => (
                    <Button key={el} onPress={() => {setLanguage(el as Language)}}>{el}</Button>
                ))}
            </XStack>
        </YStack>
    )
}
