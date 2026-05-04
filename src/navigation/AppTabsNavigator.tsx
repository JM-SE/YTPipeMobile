import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ActivityScreen } from '../screens/ActivityScreen';
import { ChannelsScreen } from '../screens/ChannelsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AppTabsParamList } from './types';
import { colors } from '../theme/tokens';

const Tab = createBottomTabNavigator<AppTabsParamList>();

export function AppTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Channels" component={ChannelsScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
    </Tab.Navigator>
  );
}
