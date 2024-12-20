import type {ConfigContext, ExpoConfig} from '@expo/config';

import {ClientEnv, Env} from './env';

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
    [
      'expo-build-properties',
      {
        android: {
          // kotlinVersion: '1.8.0', // this is for softinput package
          minSdkVersion: 27,
          targetSdkVersion: 34,
        },
        ios: {
          deploymentTarget: '17.5',

          extraPods: [ // related to "./modules/e-document/app.plugin.js"
            {
              name: 'NFCPassportReader',
              git: 'https://github.com/rarimo/NFCPassportReader.git',
            }
          ],
        },
      },
    ],
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
