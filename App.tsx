import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { ConfigStatusProvider } from './src/config/ConfigStatusContext';
import { ConnectivityProvider } from './src/connectivity/ConnectivityContext';
import { PushNotificationHandler } from './src/notifications/PushNotificationHandler';
import { flushPendingNotificationNavigation, navigationRef } from './src/navigation/navigationRef';

const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ConnectivityProvider>
          <ConfigStatusProvider>
            <NavigationContainer ref={navigationRef} onReady={flushPendingNotificationNavigation}>
              <PushNotificationHandler />
              <RootNavigator />
              <StatusBar style="light" />
            </NavigationContainer>
          </ConfigStatusProvider>
        </ConnectivityProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
