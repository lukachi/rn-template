'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.withNfc = void 0
const config_plugins_1 = require('@expo/config-plugins')
const config_plugins_2 = require('@expo/config-plugins')
const NFC_READER = 'Interact with nearby NFC devices'
function withIosPermission(c, props = {}) {
  const { nfcPermission } = props
  return (0, config_plugins_2.withInfoPlist)(c, config => {
    // https://developer.apple.com/documentation/bundleresources/information_property_list/nfcreaderusagedescription?language=objc
    config.modResults.NFCReaderUsageDescription =
      nfcPermission || config.modResults.NFCReaderUsageDescription || NFC_READER
    return config
  })
}
function addValuesToArray(obj, key, values) {
  if (!Array.isArray(values) || !values.length) {
    return obj
  }
  if (!Array.isArray(obj[key])) {
    obj[key] = []
  }
  // Add the required values
  obj[key].push(...values)
  // Remove duplicates
  obj[key] = [...new Set(obj[key])]
  // Prevent adding empty arrays to Info.plist or *.entitlements
  if (!obj[key].length) {
    delete obj[key]
  }
  return obj
}
function withIosNfcEntitlement(c, { includeNdefEntitlement }) {
  return (0, config_plugins_2.withEntitlementsPlist)(c, config => {
    // Add the required formats
    let entitlements = ['NDEF', 'TAG']
    if (includeNdefEntitlement === false) {
      entitlements = ['TAG']
    }
    config.modResults = addValuesToArray(
      config.modResults,
      'com.apple.developer.nfc.readersession.formats',
      entitlements,
    )
    return config
  })
}
function withIosNfcSelectIdentifiers(c, { selectIdentifiers }) {
  return (0, config_plugins_2.withInfoPlist)(c, config => {
    // Add the user defined identifiers
    config.modResults = addValuesToArray(
      config.modResults,
      // https://developer.apple.com/documentation/bundleresources/information_property_list/select-identifiers
      'com.apple.developer.nfc.readersession.iso7816.select-identifiers',
      selectIdentifiers || [
        'A0000002471001',
        'A0000002472001',
        'E80704007F00070302',
        'A000000167455349474E',
        'A0000002480100',
        'A0000002480200',
        'A0000002480300',
        'A00000045645444C2D3031',
      ],
    )
    return config
  })
}
function withIosNfcSystemCodes(c, { systemCodes }) {
  return (0, config_plugins_2.withInfoPlist)(c, config => {
    // Add the user defined identifiers
    config.modResults = addValuesToArray(
      config.modResults,
      // https://developer.apple.com/documentation/bundleresources/information_property_list/systemcodes
      'com.apple.developer.nfc.readersession.felica.systemcodes',
      systemCodes || [],
    )
    return config
  })
}
function addNfcUsesFeatureTagToManifest(androidManifest) {
  if (!Array.isArray(androidManifest.manifest['uses-feature'])) {
    androidManifest.manifest['uses-feature'] = []
  }
  if (
    !androidManifest.manifest['uses-feature'].find(
      item => item.$['android:name'] === 'android.hardware.nfc',
    )
  ) {
    androidManifest.manifest['uses-feature']?.push({
      $: {
        'android:name': 'android.hardware.nfc',
        'android:required': 'true',
      },
    })
  }
  return androidManifest
}
function withCustomBuildGradle(config) {
  return (0, config_plugins_1.withAppBuildGradle)(config, async c => {
    if (c.modResults.language === 'groovy') {
      c.modResults.contents += `

    // this configuration is added by a custom expo mod (plugin) to resolve "Duplicate class org.bouncycastle.." error
    configurations {
        all*.exclude group: 'org.bouncycastle', module: 'bcprov-jdk15to18'
        all*.exclude group: 'org.bouncycastle', module: 'bcutil-jdk15to18'
    }
    `
    } else {
      throw new Error(
        "The 'withCustomBuildGradle' plugin is only compatible with Groovy gradle files.",
      )
    }
    return c
  })
}
const withNfcAndroidManifest = c => {
  return (0, config_plugins_2.withAndroidManifest)(c, config => {
    config.modResults = addNfcUsesFeatureTagToManifest(config.modResults)
    return config
  })
}
const withNfc = (config, props = {}) => {
  const { nfcPermission, selectIdentifiers, systemCodes, includeNdefEntitlement } = props
  config = withIosNfcEntitlement(config, { includeNdefEntitlement })
  config = withIosNfcSelectIdentifiers(config, { selectIdentifiers })
  config = withIosNfcSystemCodes(config, { systemCodes })
  config = withCustomBuildGradle(config)
  // We start to support Android 12 from v3.11.1, and you will need to update compileSdkVersion to 31,
  // otherwise the build will fail:
  config = config_plugins_2.AndroidConfig.Version.withBuildScriptExtMinimumVersion(config, {
    name: 'compileSdkVersion',
    minVersion: 31,
  })
  if (nfcPermission !== false) {
    config = withIosPermission(config, props)
    config = config_plugins_2.AndroidConfig.Permissions.withPermissions(config, [
      'android.permission.NFC',
    ])
    config = withNfcAndroidManifest(config)
  }
  return config
}
exports.withNfc = withNfc
exports.default = exports.withNfc
