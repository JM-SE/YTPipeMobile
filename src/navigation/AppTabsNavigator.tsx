import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { ActivityScreen } from '../screens/ActivityScreen';
import { ChannelsScreen } from '../screens/ChannelsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AppTabsParamList } from './types';
import { colors } from '../theme/tokens';

const Tab = createBottomTabNavigator<AppTabsParamList>();

const TAB_ICONS = {
  Dashboard: 'speedometer-outline',
  Channels: 'list-outline',
  Activity: 'time-outline',
} as const satisfies Record<keyof AppTabsParamList, ComponentProps<typeof Ionicons>['name']>;

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
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS.Dashboard} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Channels"
        component={ChannelsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS.Channels} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS.Activity} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
