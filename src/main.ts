// polyfills
import 'react-native-get-random-values'
import '@react-native/js-polyfills'

import { Buffer } from 'buffer'
import { registerRootComponent } from 'expo'

import App from '@/App'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.Buffer = Buffer

registerRootComponent(App)
