import { render, screen } from '@testing-library/react-native';
import { RootNavigator } from '../navigation/RootNavigator';

jest.mock('../navigation/SetupNavigator', () => ({
  SetupNavigator: () => {
    const { Text } = require('react-native');
    return <Text>Setup Navigator</Text>;
  },
}));

jest.mock('../navigation/AppNavigator', () => ({
  AppNavigator: () => {
    const { Text } = require('react-native');
    return <Text>App Navigator</Text>;
  },
}));

jest.mock('../config/ConfigStatusContext', () => ({
  useConfigStatus: jest.fn(),
}));

const { useConfigStatus } = jest.requireMock('../config/ConfigStatusContext') as {
  useConfigStatus: jest.Mock;
};

describe('RootNavigator gating', () => {
  it('shows setup flow when config missing', async () => {
    useConfigStatus.mockReturnValue({ status: 'missing' });
    render(<RootNavigator />);

    expect(await screen.findByText('Setup Navigator')).toBeTruthy();
  });

  it('shows loading screen while config loads', async () => {
    useConfigStatus.mockReturnValue({ status: 'loading' });
    render(<RootNavigator />);

    expect(await screen.findByText('Loading local configuration...')).toBeTruthy();
  });

  it('shows app flow when config is present', async () => {
    useConfigStatus.mockReturnValue({ status: 'present' });
    render(<RootNavigator />);

    expect(await screen.findByText('App Navigator')).toBeTruthy();
  });

  it('shows error state when config load fails', async () => {
    useConfigStatus.mockReturnValue({ status: 'error' });
    render(<RootNavigator />);

    expect(await screen.findByText('Failed to load local configuration.')).toBeTruthy();
  });
});
