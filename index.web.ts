import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import './index.ts';

AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
