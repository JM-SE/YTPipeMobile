import { act, renderHook, waitFor } from '@testing-library/react-native';

import { REMOTE_PUSH_UNAVAILABLE_REASON } from '../notifications/pushRuntimeEnvironment';
import { usePushSettingsController } from '../screens/settings/usePushSettingsController';

jest.mock('../notifications/pushRuntimeEnvironment', () => ({
  REMOTE_PUSH_UNAVAILABLE_REASON:
    'Remote push notifications require a development build on Android; Expo Go cannot register or receive remote pushes.',
  getRemotePushUnavailableReason: jest.fn(
    () => 'Remote push notifications require a development build on Android; Expo Go cannot register or receive remote pushes.',
  ),
}));

jest.mock('../config/ConfigStatusContext', () => ({
  useConfigStatus: () => ({
    config: { apiBaseUrl: 'https://api.example.com', token: 'token' },
    status: 'present',
  }),
}));

jest.mock('../hooks/useMobilePushStatus', () => ({
  useMobilePushStatus: () => ({ data: null, error: null, isLoading: false }),
}));

jest.mock('../hooks/useMobilePushMutations', () => ({
  useRegisterMobilePushInstallation: () => ({ isPending: false, mutateAsync: jest.fn() }),
  useUnregisterMobilePushInstallation: () => ({ isPending: false, mutateAsync: jest.fn() }),
  usePatchMobilePushSettings: () => ({ isPending: false, mutateAsync: jest.fn() }),
  useSendMobilePushTest: () => ({ isPending: false, mutateAsync: jest.fn() }),
}));

describe('usePushSettingsController Expo Go guard', () => {
  it('disables unsupported push actions and shows development-build feedback', async () => {
    const { result } = renderHook(() => usePushSettingsController());

    await waitFor(() => expect(result.current.permissionState).toBe('not_requested'));

    expect(result.current.remotePushUnavailableReason).toBe(REMOTE_PUSH_UNAVAILABLE_REASON);
    expect(result.current.setupDisabled).toBe(true);
    expect(result.current.testDisabled).toBe(true);
    expect(result.current.globalToggleDisabled).toBe(true);

    await act(async () => {
      await result.current.setupPush();
    });

    expect(result.current.feedback).toEqual({ type: 'error', message: REMOTE_PUSH_UNAVAILABLE_REASON });
  });
});
