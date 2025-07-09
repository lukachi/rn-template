import type {ConfigContext, ExpoConfig} from '@expo/config';

import {ClientEnv, Env} from './env';

// TODO: rollback once ready
// import {
//   extraBuildPropertyProps as eDocExtraBuildPropertyProps
// } from './modules/e-document/extra-build-properties'
// import {
//   extraBuildPropertyProps as tfExecExtraBuildPropertyProps
// } from './modules/tf-exec/extra-build-properties'

// const buildPropertiesProps = tfExecExtraBuildPropertyProps(
//   eDocExtraBuildPropertyProps({
//     android: {
//       minSdkVersion: 27,
//       targetSdkVersion: 34,
//     },
//     ios: {
//       deploymentTarget: '17.5',
//     },
//   })
// )

export default ({config}: ConfigContext): ExpoConfig => ({
  ...config,
  newArchEnabled: true,
  name: Env.NAME,
  description: `${Env.NAME} Mobile App`,
  owner: Env.EXPO_ACCOUNT_OWNER,
  scheme: Env.SCHEME,
  slug: 'template',
  version: Env.VERSION.toString(),
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  updates: {
    fallbackToCacheTimeout: 0,
    url: `https://u.expo.dev/${Env.EAS_PROJECT_ID}`
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  // assetBundlePatterns: ['**/*'],
  ios: {
    // supportsTablet: true,
    bundleIdentifier: Env.BUNDLE_ID,
  },
  // experiments: {
  //   typedRoutes: true,
  // },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#2E3C4B',
    },
    package: Env.PACKAGE,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    ['expo-asset'],
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/PlaywriteCU-ExtraLight.ttf',
          './assets/fonts/PlaywriteCU-Light.ttf',
          './assets/fonts/PlaywriteCU-Regular.ttf',
          './assets/fonts/PlaywriteCU-Thin.ttf',
          './assets/fonts/Roboto-Black.ttf',
          './assets/fonts/Roboto-BlackItalic.ttf',
          './assets/fonts/Roboto-Bold.ttf',
          './assets/fonts/Roboto-BoldItalic.ttf',
          './assets/fonts/Roboto-Italic.ttf',
          './assets/fonts/Roboto-Light.ttf',
          './assets/fonts/Roboto-LightItalic.ttf',
          './assets/fonts/Roboto-Medium.ttf',
          './assets/fonts/Roboto-MediumItalic.ttf',
          './assets/fonts/Roboto-Regular.ttf',
          './assets/fonts/Roboto-Thin.ttf',
          './assets/fonts/Roboto-ThinItalic.ttf',
        ],
      },
    ],
    [
      "expo-splash-screen",
      {
        "backgroundColor": "#f5f6f6",
        "image": "./assets/icon.png",
        "dark": {
          "image": "./assets/icon.png",
          "backgroundColor": "#111111"
        },
        "imageWidth": 200
      }
    ],
    // 'expo-localization',
    [
      "expo-secure-store",
      {
        "faceIDPermission": "Allow $(PRODUCT_NAME) to access your Face ID biometric data."
      }
    ],
    // since "modules/e-document" uses custom pod,
    // we need to use `withBuildProperties` in module's plugin
    // in order to incapsulate per module configuration.
    // But `withBuildProperties` method ain't supposed to be called multiple times,
    // so we treat this case as we merge objects
    // plugins order matter: the later one would run first
    // https://github.com/expo/expo/blob/sdk-52/packages/expo-build-properties/src/withBuildProperties.ts#L31C6-L31C57
    ['expo-build-properties', {
      android: {
        minSdkVersion: 27,
        targetSdkVersion: 34,
      },
      ios: {
        deploymentTarget: '17.5',
        extraPods: [
          // {
          //   name: 'TensorFlowLiteSwift',
          //   git: 'https://github.com/rarimo/TensorFlowLiteSwift.git',
          //   commit: '8c3b0f9638eedfa9138789cf07b55433c03b8225',
          // },

          {
            name: "OpenSSL-Universal",
            configurations: ["Release", "Debug"],
            modular_headers: true,
          },
          {
            name: 'NFCPassportReader',
            git: 'https://github.com/rarimo/NFCPassportReader.git',
            commit: '4c463a687f59eb6cc5c7955af854c7d41295d54f',
          },
          // {
          //   name: 'SwoirCore',
          //   podspec: 'https://raw.githubusercontent.com/lukachi/rn-template/refs/heads/feature/upd-e-doc/modules/noir/ios/specs/SwoirCore.podspec',
          //   // git: 'https://github.com/Swoir/SwoirCore.git',
          //   // tag: '0.7.1',
          //   // source: 'https://github.com/Swoir/SwoirCore.git'
          // },
          // {
          //   name: 'Swoir',
          //   podspec: 'https://raw.githubusercontent.com/lukachi/rn-template/refs/heads/feature/upd-e-doc/modules/noir/ios/specs/Swoir.podspec'
          //   // git: 'https://github.com/rarimo/Swoir.git',
          //   // commit: '59bf91879d5aca5c275d6c646f65d47c97fa14eb',
          // },
        ]
      },
    }],
    [
      'app-icon-badge',
      {
        enabled: Env.APP_ENV !== 'production',
        badges: [
          {
            text: Env.APP_ENV,
            type: 'banner',
            color: 'white',
          },
          {
            text: Env.VERSION.toString(),
            type: 'ribbon',
            color: 'white',
          },
        ],
      },
    ],
    [
      "expo-local-authentication",
      {
        "faceIDPermission": "Allow $(PRODUCT_NAME) to use Face ID."
      }
    ],
    [ "react-native-vision-camera", {
      "cameraPermissionText": "$(PRODUCT_NAME) needs access to your Camera.",
    }],
    ['./modules/e-document/app.plugin.js'],
    ['./plugins/withLocalAar.plugin.js']
  ],
  extra: {
    ...ClientEnv,
    eas: {
      projectId: Env.EAS_PROJECT_ID,
    },
  },
});
