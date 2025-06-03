// polyfills
import 'react-native-get-random-values'
import '@react-native/js-polyfills'

import { Buffer } from 'buffer'
import { registerRootComponent } from 'expo'

import App from '@/App'

// Add Buffer to global
global.Buffer = Buffer

registerRootComponent(App)
