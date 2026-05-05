import { Pressable, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SettingsScreen } from '../screens/SettingsScreen';
import { AppTabsNavigator } from './AppTabsNavigator';
import { AppStackParamList } from './types';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator<AppStackParamList>();

type Props = {
  onOpenSettings?: () => void;
};

export function AppNavigator({ onOpenSettings }: Props) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={AppTabsNavigator}
        options={({ navigation }) => ({
          title: 'YTPipe Mobile',
          headerRight: () => (
            <Pressable onPress={() => (onOpenSettings ? onOpenSettings() : navigation.navigate('Settings'))}>
              <Text style={{ color: colors.accent }}>Settings</Text>
            </Pressable>
          ),
        })}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}
