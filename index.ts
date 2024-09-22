import 'react-native-url-polyfill/auto'
import { AppRegistry } from 'react-native'
import { name as appName } from './app.json'
import { App } from './app/app'
import './db'

AppRegistry.registerComponent(appName, () => App)
