import { useNavigation } from '@react-navigation/native'
import { useCallback, useMemo } from 'react'
import type { ViewProps } from 'react-native'
import { ScrollView } from 'react-native'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ErrorHandler, useSoftKeyboardEffect } from '@/core'
import { useCopyToClipboard, useForm, useLoading } from '@/hooks'
import type { AuthStackScreenProps } from '@/route-types'
import { authStore, walletStore } from '@/store'
import { cn } from '@/theme'
import { ControlledUiTextField, UiButton, UiCard, UiHorizontalDivider, UiIcon } from '@/ui'

type Props = ViewProps & AuthStackScreenProps<'CreateWallet'>

export default function CreateWallet({ route }: Props) {
  const generatePrivateKey = walletStore.useGeneratePrivateKey()
  const setPrivateKey = walletStore.useWalletStore(state => state.setPrivateKey)
  const login = authStore.useLogin()

  const isImporting = useMemo(() => {
    return route?.params?.isImporting
  }, [route])

  const navigation = useNavigation()

  const insets = useSafeAreaInsets()

  const { isCopied, copy, fetchFromClipboard } = useCopyToClipboard()

  const { formState, isFormDisabled, handleSubmit, disableForm, enableForm, control, setValue } =
    useForm(
      {
        privateKey: '0ae3584bb3028e79639b743f41bb119a9a80821443e1ac5532a8fa9b5d0a6646',
      },
      yup =>
        yup.object().shape({
          privateKey: yup.string().test('is-valid-pk', 'Invalid Private Key', value => {
            return value?.length === 64 || value?.length === 32
          }),
        }),
    )

  const submit = useCallback(async () => {
    disableForm()
    try {
      setPrivateKey(formState.privateKey)
      await login(formState.privateKey)
    } catch (error) {
      // TODO: network inspector
      ErrorHandler.process(error)
    }
    enableForm()
  }, [disableForm, enableForm, formState.privateKey, login, setPrivateKey])

  const pasteFromClipboard = useCallback(async () => {
    const res = await fetchFromClipboard()
    setValue('privateKey', res)
  }, [fetchFromClipboard, setValue])

  useSoftKeyboardEffect()

  useLoading(
    false,
    async () => {
      if (isImporting) {
        return true
      }

      const pk = await generatePrivateKey()

      setValue('privateKey', pk)

      return true
    },
    {
      loadOnMount: true,
    },
  )

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className='flex flex-1 flex-col'
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className='flex flex-1 flex-col'>
          <View className='flex w-full flex-row'>
            <UiButton
              leadingIcon='arrowLeftIcon'
              variant='text'
              onPress={() => {
                navigation.goBack()
              }}
            />
          </View>
          <View className='flex flex-1 flex-col px-5'>
            <View className='my-auto flex flex-col items-center gap-4'>
              <UiIcon componentName='starFillIcon' className='size-[200px] text-primaryMain' />
              <Text className='text-textPrimary typography-h4'>Your keys</Text>
            </View>
            <UiCard className={cn('mt-5 flex gap-4')}>
              {isImporting ? (
                <>
                  <ControlledUiTextField
                    name={'privateKey'}
                    placeholder={'Your private key'}
                    control={control}
                    disabled={isFormDisabled}
                  />

                  <UiButton
                    variant='text'
                    color='text'
                    leadingIcon={isCopied ? 'checkIcon' : 'copySimpleIcon'}
                    title='Paste From Clipboard'
                    onPress={pasteFromClipboard}
                  />
                </>
              ) : (
                <>
                  <UiCard className='bg-backgroundPrimary'>
                    <Text className='text-textPrimary typography-body3'>
                      {formState.privateKey}
                    </Text>
                  </UiCard>

                  <UiButton
                    variant='text'
                    color='text'
                    leadingIcon={isCopied ? 'checkIcon' : 'copySimpleIcon'}
                    title='Copy to Clipboard'
                    onPress={() => copy(formState.privateKey)}
                  />
                </>
              )}
            </UiCard>
          </View>
          <View className='p-5'>
            <UiHorizontalDivider />
          </View>
          <View className='flex w-full flex-row px-5'>
            <UiButton
              title={isImporting ? 'Import Key' : 'Create Key'}
              className='mt-auto w-full'
              onPress={handleSubmit(submit)}
              disabled={isFormDisabled}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
