import { AsnConvert } from '@peculiar/asn1-schema'
import { Certificate } from '@peculiar/asn1-x509'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Button, SafeAreaView, Text } from 'react-native'

import { initNfc, readSigningAndAuthCertificates } from '@/utils/inid/inid-nfc-reader'

export default function ExampleCertReader() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // start NFC once, right after mount
  useEffect(() => {
    initNfc().catch(e => console.warn('NFC init error', e))
  }, [])

  // single handler – will be attached to the <Button>
  const onReadPress = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      // const signingCertHex = await readSigningCertificate()

      // if (!signingCertHex) throw new Error('Signing certificate not found')

      // console.log(AsnConvert.parse(Buffer.from(signingCertHex, 'hex'), Certificate))

      // await sleep(2_000)

      // const authCertHex = await readAuthenticationCertificate()

      // if (!authCertHex) throw new Error('Authentication certificate not found')

      // console.log(AsnConvert.parse(Buffer.from(authCertHex, 'hex'), Certificate))

      const { signingCert, authCert } = await readSigningAndAuthCertificates()

      if (!signingCert) throw new Error('Signing certificate not found')

      console.log(AsnConvert.parse(Buffer.from(signingCert, 'hex'), Certificate))

      if (!authCert) throw new Error('Authentication certificate not found')

      console.log(AsnConvert.parse(Buffer.from(authCert, 'hex'), Certificate))
    } catch (e) {
      console.error({ e })
      setError(e.message ?? String(e))
    } finally {
      setBusy(false)
    }
  }, [])

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Button title='Read Signing Certificate' onPress={onReadPress} />

      {busy && <ActivityIndicator style={{ marginTop: 16 }} />}

      {error && <Text style={{ marginTop: 16, color: 'red' }}>{error}</Text>}
    </SafeAreaView>
  )
}
