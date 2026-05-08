import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import type { Channel } from '../api/types';
import { ChannelDetailScreen } from '../screens/ChannelDetailScreen';

jest.mock('../api/useUpdateChannelMonitoringMutation', () => ({
  useUpdateChannelMonitoringMutation: jest.fn(),
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
});
