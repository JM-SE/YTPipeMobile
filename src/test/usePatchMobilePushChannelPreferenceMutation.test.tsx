import { InfiniteData } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';

import { ApiError } from '../api/errors';
import { queryKeys } from '../api/queryKeys';
import type { MobilePushChannelPreferencesResponse } from '../api/types';
import { usePatchMobilePushChannelPreferenceMutation } from '../hooks/usePatchMobilePushChannelPreferenceMutation';
import { createQueryClientWrapper } from './testUtils';

jest.mock('../config/ConfigStatusContext', () => ({
  useConfigStatus: jest.fn(),
}));

jest.mock('../connectivity/ConnectivityContext', () => ({
  useConnectivityStatus: jest.fn(),
}));

jest.mock('../api/mobilePushApi', () => ({
  patchMobilePushChannelPreference: jest.fn(),
}));

const { useConfigStatus } = jest.requireMock('../config/ConfigStatusContext') as {
  useConfigStatus: jest.Mock;
};

const { useConnectivityStatus } = jest.requireMock('../connectivity/ConnectivityContext') as {
  useConnectivityStatus: jest.Mock;
};

const { patchMobilePushChannelPreference } = jest.requireMock('../api/mobilePushApi') as {
  patchMobilePushChannelPreference: jest.Mock;
};

const config = { apiBaseUrl: 'https://api.example.com', mobileApiToken: 'mobile-token' };
const queryKey = queryKeys.mobilePush.channelPreferences(config.apiBaseUrl, 'monitored', '');
const initialData: InfiniteData<MobilePushChannelPreferencesResponse> = {
  pageParams: [0],
  pages: [
    {
      channels: [
        {
          channel_id: 1,
          youtube_channel_id: 'yt-1',
          title: 'React Native Weekly',
          is_monitored: true,
          push_eligible: true,
          push_enabled: true,
          preference: { explicitly_set: false, explicit_push_enabled: null, updated_at: null },
        },
      ],
      pagination: { limit: 25, offset: 0, total: 1 },
    },
  ],
};

describe('usePatchMobilePushChannelPreferenceMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useConfigStatus.mockReturnValue({ config });
    useConnectivityStatus.mockReturnValue({ isOffline: false });
  });

  it('patches exact body and updates cached preference on success', async () => {
    patchMobilePushChannelPreference.mockResolvedValue({
      ...initialData.pages[0].channels[0],
      push_enabled: false,
      preference: { explicitly_set: true, explicit_push_enabled: false, updated_at: '2026-05-08T12:30:00Z' },
    });
    const { queryClient, Wrapper } = createQueryClientWrapper();
    queryClient.setQueryData(queryKey, initialData);

    const { result } = renderHook(() => usePatchMobilePushChannelPreferenceMutation(), { wrapper: Wrapper });
    result.current.mutate({ channelId: 1, pushEnabled: false });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(patchMobilePushChannelPreference).toHaveBeenCalledWith(config, 1, { push_enabled: false });
    const cached = queryClient.getQueryData<InfiniteData<MobilePushChannelPreferencesResponse>>(queryKey);
    expect(cached?.pages[0].channels[0].push_enabled).toBe(false);
    expect(cached?.pages[0].channels[0].preference.explicitly_set).toBe(true);
  });

  it('rolls back optimistic cache update on error', async () => {
    patchMobilePushChannelPreference.mockRejectedValue(new ApiError({ kind: 'server', message: 'server failed', status: 502 }));
    const { queryClient, Wrapper } = createQueryClientWrapper();
    queryClient.setQueryData(queryKey, initialData);

    const { result } = renderHook(() => usePatchMobilePushChannelPreferenceMutation(), { wrapper: Wrapper });
    result.current.mutate({ channelId: 1, pushEnabled: false });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const cached = queryClient.getQueryData<InfiniteData<MobilePushChannelPreferencesResponse>>(queryKey);
    expect(cached?.pages[0].channels[0].push_enabled).toBe(true);
  });

  it('fails fast while offline', async () => {
    useConnectivityStatus.mockReturnValue({ isOffline: true });
    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => usePatchMobilePushChannelPreferenceMutation(), { wrapper: Wrapper });

    result.current.mutate({ channelId: 1, pushEnabled: false });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(patchMobilePushChannelPreference).not.toHaveBeenCalled();
  });
});
