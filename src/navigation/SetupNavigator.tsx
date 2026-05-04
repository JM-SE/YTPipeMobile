import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SettingsScreen } from '../screens/SettingsScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { SetupStackParamList } from './types';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator<SetupStackParamList>();

export function SetupNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ title: 'YTPipe Mobile' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings (Phase 1 placeholder)' }} />
    </Stack.Navigator>
  );
}
