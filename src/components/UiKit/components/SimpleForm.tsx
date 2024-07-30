import { Button, Text, View } from 'react-native'

import { bus, DefaultBusEvents, ErrorHandler } from '@/core'
import { sleep } from '@/helpers'
import { useForm } from '@/hooks'
import { cn } from '@/theme'
import { ControlledUiTextField, UiIcon } from '@/ui'

enum FieldNames {
  First = 'first',
  Second = 'second',
  Third = 'third',
}

export default function SimpleForm() {
  const { formState, isFormDisabled, handleSubmit, disableForm, enableForm, control } = useForm(
    {
      [FieldNames.First]: '',
      [FieldNames.Second]: '',
      [FieldNames.Third]: '',
    },
    yup =>
      yup.object().shape({
        [FieldNames.First]: yup.string().required(),
        [FieldNames.Second]: yup.number().required(),
        [FieldNames.Third]: yup.string().email().required(),
      }),
  )

  const submit = async () => {
    disableForm()

    try {
      await sleep(12_000)
      bus.emit(DefaultBusEvents.success, {
        title: 'success submit',
        message: JSON.stringify(formState),
      })
    } catch (error) {
      ErrorHandler.process(error)
    }
    enableForm()
  }

  return (
    <View className={cn('flex w-full gap-4')}>
      <Text className={cn('text-textPrimary')}>This is the simple form</Text>

      <View className={cn('flex gap-2 rounded-xl border-textPrimary')}>
        <ControlledUiTextField
          name={FieldNames.First}
          label={FieldNames.First}
          placeholder={FieldNames.First}
          control={control}
          disabled={isFormDisabled}
        />
      </View>

      <View className={cn('flex gap-2')}>
        <ControlledUiTextField
          name={FieldNames.Second}
          label={FieldNames.Second}
          placeholder={FieldNames.Second}
          control={control}
          disabled={isFormDisabled}
        />
      </View>

      <View className={cn('flex gap-2')}>
        <ControlledUiTextField
          name={FieldNames.Third}
          label={FieldNames.Third}
          placeholder={FieldNames.Third}
          control={control}
          leadingContent={<UiIcon componentName={'arrowRightIcon'} className={'size-[14px]'} />}
          trailingContent={<UiIcon componentName={'arrowLeftIcon'} className={'size-[14px]'} />}
          disabled={isFormDisabled}
        />
      </View>

      <Button title='submit' onPress={handleSubmit(submit)} disabled={isFormDisabled} />
    </View>
  )
}
