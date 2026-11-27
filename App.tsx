/**
 * ElectroGo super app (host).
 * File này chỉ gắn các provider; giao diện nằm trong src/ (xem src/app và src/features).
 *
 * @format
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/app/RootNavigator';
import {withOta} from './src/app/ota';
import {initMonitoring} from './src/shared/monitoring/crashlytics';

initMonitoring();

function App() {
  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}

// Bản Release tự nhận cập nhật OTA (src/app/ota.tsx)
export default withOta(App);
