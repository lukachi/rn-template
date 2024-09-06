import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { identityStore } from '@/store'
import { UiScreenScrollable } from '@/ui'

import { DocumentCard } from './components'

export default function HomeWithDocs() {
  const identities = identityStore.useIdentityStore(state => state.identities)

  const insets = useSafeAreaInsets()

  return (
    <UiScreenScrollable
      style={{
        paddingTop: insets.top,
      }}
      className={'px-5'}
    >
      <DocumentCard identity={identities[0]} />
    </UiScreenScrollable>
  )
}
