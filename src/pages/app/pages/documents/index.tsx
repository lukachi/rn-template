import type { AppTabScreenProps } from '@/route-types'
import { identityStore } from '@/store'

import { DocumentsWithDocs, DocumentsWithoutDocs } from './components'

// eslint-disable-next-line no-empty-pattern
export default function DocumentsScreen({}: AppTabScreenProps<'Documents'>) {
  const identities = identityStore.useIdentityStore(state => state.identities)

  if (!identities.length) {
    return <DocumentsWithoutDocs />
  }

  return <DocumentsWithDocs />
}
