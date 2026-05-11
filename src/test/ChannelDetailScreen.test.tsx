import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import type { Channel } from '../api/types';
import { ChannelDetailScreen } from '../screens/ChannelDetailScreen';

jest.mock('../api/useUpdateChannelMonitoringMutation', () => ({
  useUpdateChannelMonitoringMutation: jest.fn(),
}));

jest.mock('../hooks/useMobilePushChannelPreferencesQuery', () => ({
  useMobilePushChannelPreferencesQuery: jest.fn(),
}));

jest.mock('../hooks/usePatchMobilePushChannelPreferenceMutation', () => ({
  usePatchMobilePushChannelPreferenceMutation: jest.fn(),
}));

jest.mock('../config/ConfigStatusContext', () => ({
  useConfigStatus: jest.fn(),
}));

jest.mock('../storage/channelEducationStorage', () => ({
  hasAcknowledgedChannelEducation: jest.fn().mockResolvedValue(false),
  acknowledgeChannelEducation: jest.fn().mockResolvedValue(undefined),
}));

const { useUpdateChannelMonitoringMutation } = jest.requireMock('../api/useUpdateChannelMonitoringMutation') as {
  useUpdateChannelMonitoringMutation: jest.Mock;
};

const { useMobilePushChannelPreferencesQuery } = jest.requireMock('../hooks/useMobilePushChannelPreferencesQuery') as {
  useMobilePushChannelPreferencesQuery: jest.Mock;
};

const { usePatchMobilePushChannelPreferenceMutation } = jest.requireMock('../hooks/usePatchMobilePushChannelPreferenceMutation') as {
  usePatchMobilePushChannelPreferenceMutation: jest.Mock;
};

const { useConfigStatus } = jest.requireMock('../config/ConfigStatusContext') as {
  useConfigStatus: jest.Mock;
};

const channel: Channel = {
  channel_id: 1,
  youtube_channel_id: 'yt-1',
  title: 'React Native Weekly',
  is_monitored: true,
  last_seen_video_id: null,
  baseline_established_at: null,
  latest_detected_video: {
    video_id: 10,
    youtube_video_id: 'abc',
    title: 'Latest RN video',
    youtube_url: 'https://youtube.com/watch?v=abc',
    published_at: '2026-05-01T10:00:00.000Z',
  },
};

describe('ChannelDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useConfigStatus.mockReturnValue({ config: { apiBaseUrl: 'http://10.0.2.2:4000' } });
    usePatchMobilePushChannelPreferenceMutation.mockReturnValue({ mutate: jest.fn(), isPending: false });
    useMobilePushChannelPreferencesQuery.mockReturnValue({
      data: {
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
      },
      refetch: jest.fn(),
    });
  });

  it('renders detail content and toggles monitoring', () => {
    const mutate = jest.fn();
    useUpdateChannelMonitoringMutation.mockReturnValue({ mutate, isPending: false });

    render(<ChannelDetailScreen route={{ key: 'ChannelDetail', name: 'ChannelDetail', params: { channel } }} navigation={{} as never} />);

    expect(screen.getByText('React Native Weekly')).toBeTruthy();
    expect(screen.getByText('Latest RN video')).toBeTruthy();

    fireEvent(screen.getByLabelText('Disable monitoring for React Native Weekly'), 'valueChange', false);

    expect(mutate).toHaveBeenCalledWith(
      { channelId: 1, isMonitored: false },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });

  it('shows first-activation education before enabling from detail', async () => {
    const mutate = jest.fn();
    const unmonitoredChannel = { ...channel, is_monitored: false };
    useUpdateChannelMonitoringMutation.mockReturnValue({ mutate, isPending: false, variables: undefined });

    render(<ChannelDetailScreen route={{ key: 'ChannelDetail', name: 'ChannelDetail', params: { channel: unmonitoredChannel } }} navigation={{} as never} />);

    fireEvent(screen.getByLabelText('Enable monitoring for React Native Weekly'), 'valueChange', true);

    expect(await screen.findByText('Enable monitoring?')).toBeTruthy();
    expect(mutate).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('I understand, enable monitoring'));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        { channelId: 1, isMonitored: true },
        expect.objectContaining({ onError: expect.any(Function) }),
      );
    });
  });

  it('shows monitored push switch and patches explicit channel preference', () => {
    const pushMutate = jest.fn();
    useUpdateChannelMonitoringMutation.mockReturnValue({ mutate: jest.fn(), isPending: false });
    usePatchMobilePushChannelPreferenceMutation.mockReturnValue({ mutate: pushMutate, isPending: false });

    render(<ChannelDetailScreen route={{ key: 'ChannelDetail', name: 'ChannelDetail', params: { channel } }} navigation={{} as never} />);

    expect(screen.getByText('Push alerts')).toBeTruthy();
    fireEvent(screen.getByLabelText('Disable push alerts for React Native Weekly'), 'valueChange', false);

    expect(pushMutate).toHaveBeenCalledWith(
      { channelId: 1, pushEnabled: false },
      expect.objectContaining({ onError: expect.any(Function) }),
    );
  });

  it('hides active push switch for unmonitored channels', () => {
    useUpdateChannelMonitoringMutation.mockReturnValue({ mutate: jest.fn(), isPending: false, variables: undefined });

    render(<ChannelDetailScreen route={{ key: 'ChannelDetail', name: 'ChannelDetail', params: { channel: { ...channel, is_monitored: false } } }} navigation={{} as never} />);

    expect(screen.getByText('Push alerts are available only for monitored channels.')).toBeTruthy();
    expect(screen.queryByLabelText('Enable push alerts for React Native Weekly')).toBeNull();
  });
});
