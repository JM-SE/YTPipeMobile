import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { SettingsScreen } from '../screens/SettingsScreen';
import * as environment from '../config/environment';

jest.mock('../api/statusTestClient', () => ({
  testStatusConnection: jest.fn(),
}));

jest.mock('../config/ConfigStatusContext', () => ({
  useConfigStatus: jest.fn(),
}));

jest.mock('../connectivity/ConnectivityContext', () => ({
  useConnectivityStatus: jest.fn(),
}));

const { useConfigStatus } = jest.requireMock('../config/ConfigStatusContext') as {
  useConfigStatus: jest.Mock;
};

const { testStatusConnection } = jest.requireMock('../api/statusTestClient') as {
  testStatusConnection: jest.Mock;
};

const { useConnectivityStatus } = jest.requireMock('../connectivity/ConnectivityContext') as {
  useConnectivityStatus: jest.Mock;
};

const navigation = {
  canGoBack: () => true,
  goBack: jest.fn(),
} as any;

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(environment, 'isDevelopmentBuild').mockReturnValue(true);
    useConnectivityStatus.mockReturnValue({ isOffline: false });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('activates config after successful save and test', async () => {
    const activateConfig = jest.fn(async () => undefined);
    useConfigStatus.mockReturnValue({ activateConfig, clearConfig: jest.fn(), config: null });
    testStatusConnection.mockResolvedValue({ environment: 'mock', ready: true });

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <SettingsScreen navigation={navigation} route={{ key: 'Settings', name: 'Settings' } as any} />
      </QueryClientProvider>,
    );

    fireEvent.changeText(screen.getByPlaceholderText('https://your-backend.example.com'), 'http://10.0.2.2:4000');
    fireEvent.changeText(screen.getByPlaceholderText('MOBILE_API_BEARER_TOKEN'), 'dev-mobile-token');
    fireEvent.press(screen.getByText('Save and Test'));

    await waitFor(() => {
      expect(activateConfig).toHaveBeenCalledWith({
        apiBaseUrl: 'http://10.0.2.2:4000',
        mobileApiToken: 'dev-mobile-token',
      });
      expect(navigation.goBack).toHaveBeenCalled();
    });
  });

  it('shows error and does not activate config when /status fails', async () => {
    const activateConfig = jest.fn(async () => undefined);
    useConfigStatus.mockReturnValue({ activateConfig, clearConfig: jest.fn(), config: null });
    testStatusConnection.mockRejectedValue(new Error('Authentication failed (401). Verify API base URL and mobile token in Settings.'));

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsScreen navigation={navigation} route={{ key: 'Settings', name: 'Settings' } as any} />
      </QueryClientProvider>,
    );

    fireEvent.changeText(screen.getByPlaceholderText('https://your-backend.example.com'), 'http://10.0.2.2:4000');
    fireEvent.changeText(screen.getByPlaceholderText('MOBILE_API_BEARER_TOKEN'), 'wrong-token');
    fireEvent.press(screen.getByText('Save and Test'));

    await waitFor(() => {
      expect(activateConfig).not.toHaveBeenCalled();
      expect(screen.getByText(/Authentication failed/i)).toBeTruthy();
    });
  });

  it('clears local config when pressing Clear Config', async () => {
    const clearConfig = jest.fn(async () => undefined);
    useConfigStatus.mockReturnValue({ activateConfig: jest.fn(), clearConfig, config: null });
    testStatusConnection.mockResolvedValue({ environment: 'mock', ready: true });

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsScreen navigation={navigation} route={{ key: 'Settings', name: 'Settings' } as any} />
      </QueryClientProvider>,
    );

    fireEvent.press(screen.getByText('Clear Config'));

    await waitFor(() => {
      expect(clearConfig).toHaveBeenCalledTimes(1);
    });
  });

  it('disables Save and Test while offline but keeps local Clear Config available', () => {
    useConnectivityStatus.mockReturnValue({ isOffline: true });
    useConfigStatus.mockReturnValue({ activateConfig: jest.fn(), clearConfig: jest.fn(), config: null });

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsScreen navigation={navigation} route={{ key: 'Settings', name: 'Settings' } as any} />
      </QueryClientProvider>,
    );

    expect(screen.getByLabelText('Save and Test settings')).toBeDisabled();
    expect(screen.getByText('Offline - reconnect to test')).toBeTruthy();
    expect(screen.getByLabelText('Clear Config')).not.toBeDisabled();
  });

  it('hides the local mock helper outside development builds', () => {
    jest.spyOn(environment, 'isDevelopmentBuild').mockReturnValue(false);
    useConfigStatus.mockReturnValue({ activateConfig: jest.fn(), clearConfig: jest.fn(), config: null });

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsScreen navigation={navigation} route={{ key: 'Settings', name: 'Settings' } as any} />
      </QueryClientProvider>,
    );

    expect(screen.queryByText('Local mock helper')).toBeNull();
    expect(screen.queryByText('Mock token: dev-mobile-token')).toBeNull();
  });
});
