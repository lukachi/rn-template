import { useSafeAreaInsets } from 'react-native-safe-area-context'

import AppContainer from '@/pages/app/components/AppContainer'
import { identityStore } from '@/store'
import { useAppPaddings, useBottomBarOffset } from '@/theme'
import { UiScreenScrollable } from '@/ui'

import { DocumentCard } from './components'

export default function HomeWithDocs() {
  const identities = identityStore.useIdentityStore(state => state.identities)

  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()
  const offset = useBottomBarOffset()

  return (
    <AppContainer>
      <UiScreenScrollable
        style={{
          paddingTop: insets.top,
          paddingLeft: appPaddings.left,
          paddingRight: appPaddings.right,
          paddingBottom: offset,
        }}
        className='px-5'
      >
        <DocumentCard identity={identities[0]} />
      </UiScreenScrollable>
    </AppContainer>
  )
}
