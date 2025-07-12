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
function addValuesToArray(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj,
  key,
  values,
) {
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
// FIXME: couldn't be chained with other similar configs
// const withNFCPassportReader: ConfigPlugin<PluginConfigType> = (c: ExpoConfig, props) => {
//   return withBuildProperties(c, {
//     ...props,
//     ios: {
//       ...props.ios,
//       extraPods: [
//         ...(props?.ios?.extraPods ?? []),
//         {
//           name: 'NFCPassportReader',
//           git: 'https://github.com/rarimo/NFCPassportReader.git',
//           commit: '4c463a687f59eb6cc5c7955af854c7d41295d54f',
//         },
//       ],
//     },
//   })
// }
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
// const addSPMDependenciesToMainTarget: ConfigPlugin<{
//   version?: string
//   commit?: string
//   repositoryUrl: string
//   repoName: string
//   productName: string
// }> = (config, options) =>
//   withXcodeProject(config, config => {
//     const { version, commit, repositoryUrl, repoName, productName } = options
//     const xcodeProject = config.modResults
//     // update XCRemoteSwiftPackageReference
//     const spmReferences = xcodeProject.hash.project.objects['XCRemoteSwiftPackageReference']
//     if (!spmReferences) {
//       xcodeProject.hash.project.objects['XCRemoteSwiftPackageReference'] = {}
//     }
//     const packageReferenceUUID = xcodeProject.generateUuid()
//     xcodeProject.hash.project.objects['XCRemoteSwiftPackageReference'][
//       `${packageReferenceUUID} /* XCRemoteSwiftPackageReference "${repoName}" */`
//     ] = {
//       isa: 'XCRemoteSwiftPackageReference',
//       repositoryURL: repositoryUrl,
//       ...(version && {
//         requirement: {
//           kind: 'upToNextMajorVersion',
//           minimumVersion: version,
//         },
//       }),
//       ...(commit && { commit }),
//     }
//     // update XCSwiftPackageProductDependency
//     const spmProducts = xcodeProject.hash.project.objects['XCSwiftPackageProductDependency']
//     if (!spmProducts) {
//       xcodeProject.hash.project.objects['XCSwiftPackageProductDependency'] = {}
//     }
//     const packageUUID = xcodeProject.generateUuid()
//     xcodeProject.hash.project.objects['XCSwiftPackageProductDependency'][
//       `${packageUUID} /* ${productName} */`
//     ] = {
//       isa: 'XCSwiftPackageProductDependency',
//       // from step before
//       package: `${packageReferenceUUID} /* XCRemoteSwiftPackageReference "${repoName}" */`,
//       productName: productName,
//     }
//     // update PBXProject
//     const projectId = Object.keys(xcodeProject.hash.project.objects['PBXProject']).at(0)
//     if (!xcodeProject.hash.project.objects['PBXProject'][projectId]['packageReferences']) {
//       xcodeProject.hash.project.objects['PBXProject'][projectId]['packageReferences'] = []
//     }
//     xcodeProject.hash.project.objects['PBXProject'][projectId]['packageReferences'] = [
//       ...xcodeProject.hash.project.objects['PBXProject'][projectId]['packageReferences'],
//       `${packageReferenceUUID} /* XCRemoteSwiftPackageReference "${repoName}" */`,
//     ]
//     // update PBXBuildFile
//     const frameworkUUID = xcodeProject.generateUuid()
//     xcodeProject.hash.project.objects['PBXBuildFile'][`${frameworkUUID}_comment`] =
//       `${productName} in Frameworks`
//     xcodeProject.hash.project.objects['PBXBuildFile'][frameworkUUID] = {
//       isa: 'PBXBuildFile',
//       productRef: packageUUID,
//       productRef_comment: productName,
//     }
//     // update PBXFrameworksBuildPhase
//     const buildPhaseId = Object.keys(
//       xcodeProject.hash.project.objects['PBXFrameworksBuildPhase'],
//     ).at(0)
//     if (!xcodeProject.hash.project.objects['PBXFrameworksBuildPhase'][buildPhaseId]['files']) {
//       xcodeProject.hash.project.objects['PBXFrameworksBuildPhase'][buildPhaseId]['files'] = []
//     }
//     xcodeProject.hash.project.objects['PBXFrameworksBuildPhase'][buildPhaseId]['files'] = [
//       ...xcodeProject.hash.project.objects['PBXFrameworksBuildPhase'][buildPhaseId]['files'],
//       `${frameworkUUID} /* ${productName} in Frameworks */`,
//     ]
//     return config
//   })
const withNfc = (config, props = {}) => {
  const { nfcPermission, selectIdentifiers, systemCodes, includeNdefEntitlement } = props
  config = withIosNfcEntitlement(config, { includeNdefEntitlement })
  config = withIosNfcSelectIdentifiers(config, { selectIdentifiers })
  config = withIosNfcSystemCodes(config, { systemCodes })
  config = withCustomBuildGradle(config)
  // config = addSPMDependenciesToMainTarget(config, {
  //   commit: '4c463a687f59eb6cc5c7955af854c7d41295d54f',
  //   repositoryUrl: 'https://github.com/rarimo/NFCPassportReader.git',
  //   repoName: 'NFCPassportReader',
  //   productName: 'NFCPassportReader',
  // })
  // config = withNFCPassportReader(config, props)
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
