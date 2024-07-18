import { createContext, type PropsWithChildren, useContext } from 'react'

import { SecureStoreKeys, useStorageState } from '@/core'

const AuthContext = createContext<{
  signIn: () => void
  signOut: () => void
  session?: string | null
  isLoading: boolean
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
})

// This hook can be used to access the user info.
export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new TypeError('useSession must be wrapped in a <SessionProvider />')
  }

  return value
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState(SecureStoreKeys.Session)

  return (
    <AuthContext.Provider
      value={{
        signIn: () => {
          // Perform sign-in logic here
          setSession('xxx')
        },
        signOut: () => {
          setSession(null)
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
