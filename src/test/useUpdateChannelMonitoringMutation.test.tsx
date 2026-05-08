import { InfiniteData } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { ApiError } from '../api/errors';
import { queryKeys } from '../api/queryKeys';
import type { ChannelsResponse } from '../api/types';
import { useUpdateChannelMonitoringMutation } from '../api/useUpdateChannelMonitoringMutation';
import { createQueryClientWrapper } from './testUtils';

jest.mock('../config/ConfigStatusContext', () => ({
  useConfigStatus: jest.fn(),
}));

jest.mock('../api/mobileApi', () => ({
  updateChannelMonitoring: jest.fn(),
}));

const { useConfigStatus } = jest.requireMock('../config/ConfigStatusContext') as {
  useConfigStatus: jest.Mock;
};

const { updateChannelMonitoring } = jest.requireMock('../api/mobileApi') as {
  updateChannelMonitoring: jest.Mock;
};

const config = { apiBaseUrl: 'http://10.0.2.2:4000', mobileApiToken: 'dev-mobile-token' };

const channelsData: InfiniteData<ChannelsResponse> = {
  pageParams: [0],
  pages: [
    {
      channels: [
        {
          channel_id: 1,
          youtube_channel_id: 'yt-1',
          title: 'React Native Weekly',
          is_monitored: false,
          last_seen_video_id: null,
          baseline_established_at: null,
          latest_detected_video: null,
        },
      ],
      pagination: { limit: 25, offset: 0, total: 1 },
    },
  ],
};

describe('useUpdateChannelMonitoringMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useConfigStatus.mockReturnValue({ config });
  });

  it('optimistically updates channel caches and calls PATCH endpoint', async () => {
    const { queryClient, Wrapper } = createQueryClientWrapper();
    const queryKey = queryKeys.channelsInfinite(config.apiBaseUrl, 'unmonitored', '');
    queryClient.setQueryData(queryKey, channelsData);
    updateChannelMonitoring.mockResolvedValue({ channel_id: 1, is_monitored: true });

    const { result } = renderHook(() => useUpdateChannelMonitoringMutation(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({ channelId: 1, isMonitored: true });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(updateChannelMonitoring).toHaveBeenCalledWith(config, 1, { is_monitored: true });
    queryClient.clear();
  });

  it('rolls back optimistic cache updates when PATCH fails', async () => {
    const { queryClient, Wrapper } = createQueryClientWrapper();
    const queryKey = queryKeys.channelsInfinite(config.apiBaseUrl, 'unmonitored', '');
    queryClient.setQueryData(queryKey, channelsData);
    updateChannelMonitoring.mockRejectedValue(new ApiError({ kind: 'server', message: 'server down', status: 502 }));

    const { result } = renderHook(() => useUpdateChannelMonitoringMutation(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await expect(result.current.mutateAsync({ channelId: 1, isMonitored: true })).rejects.toThrow('server down');
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    await waitFor(() => {
      const data = queryClient.getQueryData<InfiniteData<ChannelsResponse>>(queryKey);
      expect(data?.pages[0]?.channels[0]?.is_monitored).toBe(false);
    });
    queryClient.clear();
  });

  it('returns a friendly validation error when config is missing', async () => {
    useConfigStatus.mockReturnValue({ config: null });
    const { queryClient, Wrapper } = createQueryClientWrapper();

    const { result } = renderHook(() => useUpdateChannelMonitoringMutation(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await expect(result.current.mutateAsync({ channelId: 1, isMonitored: true })).rejects.toMatchObject({
        kind: 'validation',
        message: expect.stringContaining('API configuration is missing'),
      });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(updateChannelMonitoring).not.toHaveBeenCalled();
    queryClient.clear();
  });
});
