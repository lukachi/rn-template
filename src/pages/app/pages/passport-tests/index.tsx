/* eslint-disable unused-imports/no-unused-vars */
import { parseLdifString } from '@lukachi/rn-csca'
import { AsnConvert } from '@peculiar/asn1-schema'
import { Certificate } from '@peculiar/asn1-x509'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { Asset } from 'expo-asset'
import * as FileSystem from 'expo-file-system'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { NoirEIDRegistration } from '@/api/modules/registration/variants/noir-eid'
import AppContainer from '@/pages/app/components/AppContainer'
import { walletStore } from '@/store'
import { useAppPaddings } from '@/theme'
import { UiButton, UiScreenScrollable } from '@/ui'
import { EID } from '@/utils/e-document/e-document'
import { ExtendedCertificate } from '@/utils/e-document/extended-cert'

const downloadUrl =
  'https://www.googleapis.com/download/storage/v1/b/rarimo-temp/o/icaopkd-list.ldif?generation=1715355629405816&alt=media'
const icaopkdFileUri = `${FileSystem.documentDirectory}/icaopkd-list.ldif`

const getIcaoPkdLdifFile = async () => {
  const downloadResumable = FileSystem.createDownloadResumable(downloadUrl, icaopkdFileUri, {})

  if (!(await FileSystem.getInfoAsync(icaopkdFileUri)).exists) {
    await downloadResumable.downloadAsync()
  }

  const icaoLdif = await FileSystem.readAsStringAsync(icaopkdFileUri, {
    encoding: FileSystem.EncodingType.UTF8,
  })

  return parseLdifString(icaoLdif)
}

const eidRegistration = new NoirEIDRegistration()

export default function PassportTests() {
  const privateKey = walletStore.useWalletStore(state => state.privateKey)
  const publicKeyHash = walletStore.usePublicKeyHash()

  const insets = useSafeAreaInsets()
  const appPaddings = useAppPaddings()
  const bottomBarHeight = useBottomTabBarHeight()

  const [isSubmitting, setIsSubmitting] = useState(false)

  // const { createIdentity } = useRegistration()

  const testCert = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const [authAsset] = await Asset.loadAsync(
        require('@assets/certificates/AuthCert_0897A6C3.cer'),
      )

      if (!authAsset.localUri) throw new Error('authAsset local URI is not available')

      const authAssetInfo = await FileSystem.getInfoAsync(authAsset.localUri)

      if (!authAssetInfo.uri) throw new Error('authAsset local URI is not available')

      const authFileContent = await FileSystem.readAsStringAsync(authAssetInfo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      const authContentBytes = Buffer.from(authFileContent, 'base64')

      const authCertificate = new ExtendedCertificate(
        AsnConvert.parse(authContentBytes, Certificate),
      )

      // ------------------------------------------------------------------------------------------------------------------------------

      const [signingCertAsset] = await Asset.loadAsync(
        require('@assets/certificates/SigningCert_084384FC.cer'),
      )

      if (!signingCertAsset.localUri) throw new Error('signingCertAsset local URI is not available')

      const signingCertAssetInfo = await FileSystem.getInfoAsync(signingCertAsset.localUri)

      if (!signingCertAssetInfo.uri) throw new Error('signingCertAsset local URI is not available')

      const signingCertFileContent = await FileSystem.readAsStringAsync(signingCertAssetInfo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      const signingCertFileContentBytes = Buffer.from(signingCertFileContent, 'base64')

      const sigCertificate = new ExtendedCertificate(
        AsnConvert.parse(signingCertFileContentBytes, Certificate),
      )

      // ------------------------------------------------------------------------------------------------------------------------------

      const eID = new EID(sigCertificate, authCertificate)

      await eidRegistration.createIdentity(eID, privateKey, publicKeyHash)
    } catch (error) {
      console.error('Error in testCert:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [privateKey, publicKeyHash])

  return (
    <AppContainer>
      <UiScreenScrollable
        style={{
          paddingTop: insets.top,
          paddingBottom: bottomBarHeight,
          paddingLeft: appPaddings.left,
          paddingRight: appPaddings.right,
        }}
        className='gap-3'
      >
        <View className='flex gap-4'>
          <UiButton disabled={isSubmitting} onPress={testCert} title='Test Cert' />
        </View>
      </UiScreenScrollable>
    </AppContainer>
  )
}
