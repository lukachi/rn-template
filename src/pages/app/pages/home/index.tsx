import { identityStore } from '@/store'

import { HomeWithDocs, HomeWithoutDocs } from './components'

export default function HomeScreen() {
  const identities = identityStore.useIdentityStore(state => state.identities)

  if (!identities.length) {
    return <HomeWithoutDocs />
  }

  return <HomeWithDocs />
}
