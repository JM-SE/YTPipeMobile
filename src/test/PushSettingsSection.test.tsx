import { fireEvent, render, screen } from '@testing-library/react-native';

import { PushSettingsSection } from '../screens/settings/PushSettingsSection';

const mockController = {
  delivery: null,
  feedback: null,
  globalStatus: {
    enabled: false,
    default_for_monitored_channels: true,
    first_enabled_at: null,
    updated_at: null,
  },
  installationStatus: null,
  isBusy: false,
  isOffline: false,
  isRegistered: false,
  maskedInstallationId: null,
  permissionState: 'undetermined',
  pushStatusError: null,
  pushStatusLoading: false,
  sendTestPush: jest.fn(),
  setGlobalPushEnabled: jest.fn(),
  setupDisabled: false,
  setupPush: jest.fn(),
  testDisabled: true,
  unregisterDisabled: true,
  unregisterPush: jest.fn(),
  globalToggleDisabled: true,
  remotePushUnavailableReason: null,
};

jest.mock('../screens/settings/usePushSettingsController', () => ({
  usePushSettingsController: jest.fn(() => mockController),
}));

const { usePushSettingsController } = jest.requireMock('../screens/settings/usePushSettingsController') as {
  usePushSettingsController: jest.Mock;
};

describe('PushSettingsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePushSettingsController.mockReturnValue(mockController);
  });

  it('renders setup state and starts registration from Settings', () => {
    render(<PushSettingsSection />);

    expect(screen.getByText('Push notifications')).toBeTruthy();
    expect(screen.getByText('Permission: undetermined')).toBeTruthy();
    expect(screen.getByText('Backend registration: Not registered')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Set up push notifications'));

    expect(mockController.setupPush).toHaveBeenCalledTimes(1);
  });

  it('renders registered state with global toggle, test, unregister and diagnostics', () => {
    const registeredController = {
      ...mockController,
      delivery: {
        last_attempt_at: '2026-05-08T12:00:00Z',
        last_success_at: '2026-05-08T12:01:00Z',
        last_error: null,
        last_expo_ticket_id: 'ticket-id',
        last_expo_status: 'ok',
        last_receipt_checked_at: null,
      },
      globalStatus: {
        enabled: true,
        default_for_monitored_channels: true,
        first_enabled_at: '2026-05-08T12:00:00Z',
        updated_at: '2026-05-08T12:00:00Z',
      },
      installationStatus: {
        installation_id: 'installation-123',
        registered: true,
        enabled: true,
        platform: 'android',
        app_version: null,
        build_number: null,
        device_name: null,
        token_masked: 'ExponentPushToken[abcd…wxyz]',
        last_registered_at: '2026-05-08T12:00:00Z',
        last_seen_at: '2026-05-08T12:00:00Z',
        last_unregistered_at: null,
      },
      isRegistered: true,
      maskedInstallationId: 'inst…-123',
      permissionState: 'granted',
      setupDisabled: true,
      testDisabled: false,
      unregisterDisabled: false,
      globalToggleDisabled: false,
      sendTestPush: jest.fn(),
      setGlobalPushEnabled: jest.fn(),
      unregisterPush: jest.fn(),
    };
    usePushSettingsController.mockReturnValue(registeredController);

    render(<PushSettingsSection />);

    expect(screen.getByText('Backend registration: Registered')).toBeTruthy();
    expect(screen.getByText('Token: ExponentPushToken[abcd…wxyz]')).toBeTruthy();
    expect(screen.getByText('Expo status: ok')).toBeTruthy();

    fireEvent(screen.getByLabelText('Toggle global push notifications'), 'valueChange', false);
    fireEvent.press(screen.getByLabelText('Send test push notification'));
    fireEvent.press(screen.getByLabelText('Unregister this device from push notifications'));

    expect(registeredController.setGlobalPushEnabled).toHaveBeenCalledWith(false);
    expect(registeredController.sendTestPush).toHaveBeenCalledTimes(1);
    expect(registeredController.unregisterPush).toHaveBeenCalledTimes(1);
  });

  it('disables push actions while offline', () => {
    usePushSettingsController.mockReturnValue({
      ...mockController,
      isOffline: true,
      setupDisabled: true,
      testDisabled: true,
      unregisterDisabled: true,
      globalToggleDisabled: true,
    });

    render(<PushSettingsSection />);

    expect(screen.getByText('Push actions are disabled while offline. Cached status remains visible.')).toBeTruthy();
    expect(screen.getByLabelText('Set up push notifications')).toBeDisabled();
    expect(screen.getByLabelText('Send test push notification')).toBeDisabled();
    expect(screen.getByLabelText('Unregister this device from push notifications')).toBeDisabled();
  });

  it('renders the development build requirement when remote push is unavailable', () => {
    usePushSettingsController.mockReturnValue({
      ...mockController,
      remotePushUnavailableReason:
        'Remote push notifications require a development build on Android; Expo Go cannot register or receive remote pushes.',
      setupDisabled: true,
      testDisabled: true,
      globalToggleDisabled: true,
    });

    render(<PushSettingsSection />);

    expect(
      screen.getByText('Remote push notifications require a development build on Android; Expo Go cannot register or receive remote pushes.'),
    ).toBeTruthy();
  });
});
