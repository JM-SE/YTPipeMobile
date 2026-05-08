import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';

import { AppTabsNavigator } from '../navigation/AppTabsNavigator';

jest.mock('@expo/vector-icons/Ionicons', () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => {
    const { Text } = require('react-native');
    return <Text testID={`tab-icon-${name}`}>{name}</Text>;
  },
}));

jest.mock('../screens/DashboardScreen', () => ({
  DashboardScreen: () => {
    const { Text } = require('react-native');
    return <Text>Dashboard screen</Text>;
  },
}));

jest.mock('../screens/ChannelsScreen', () => ({
  ChannelsScreen: () => {
    const { Text } = require('react-native');
    return <Text>Channels screen</Text>;
  },
}));

jest.mock('../screens/ActivityScreen', () => ({
  ActivityScreen: () => {
    const { Text } = require('react-native');
    return <Text>Activity screen</Text>;
  },
}));

describe('AppTabsNavigator', () => {
  it('renders stable icons for the MVP tabs', async () => {
    render(
      <NavigationContainer>
        <AppTabsNavigator />
      </NavigationContainer>,
    );

    expect(await screen.findByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Channels')).toBeTruthy();
    expect(screen.getByText('Activity')).toBeTruthy();

    expect(screen.getAllByTestId('tab-icon-speedometer-outline').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('tab-icon-list-outline').length).toBeGreaterThan(0);
    expect(screen.getAllByTestId('tab-icon-time-outline').length).toBeGreaterThan(0);
  });
});
