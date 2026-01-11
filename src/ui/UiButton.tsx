import { Button as HNButton } from 'heroui-native'
import { ComponentProps } from 'react'

import { cn } from '@/theme/utils'

const Button = (props: ComponentProps<typeof HNButton>) => {
  return <HNButton {...props} className={cn('rounded-(--radius)', props.className)} />
}

export { Button as UiButton }
