/**
 * ElectroGo super app (host).
 * File này chỉ gắn các provider; giao diện nằm trong src/ (xem src/app và src/features).
 *
 * @format
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/app/RootNavigator';
import {initMonitoring} from './src/shared/monitoring/crashlytics';

initMonitoring();

function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}

export default App;
