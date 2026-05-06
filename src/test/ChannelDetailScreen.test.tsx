import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Channel } from '../api/types';
import { ChannelDetailScreen } from '../screens/ChannelDetailScreen';

jest.mock('../api/useUpdateChannelMonitoringMutation', () => ({
  useUpdateChannelMonitoringMutation: jest.fn(),
}));

const { useUpdateChannelMonitoringMutation } = jest.requireMock('../api/useUpdateChannelMonitoringMutation') as {
  useUpdateChannelMonitoringMutation: jest.Mock;
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
});
