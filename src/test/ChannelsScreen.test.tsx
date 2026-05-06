import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import type { Channel } from '../api/types';
import { ChannelsScreen } from '../screens/ChannelsScreen';

jest.mock('../api/useChannelsQuery', () => ({
  useChannelsQuery: jest.fn(),
}));

jest.mock('../api/useUpdateChannelMonitoringMutation', () => ({
  useUpdateChannelMonitoringMutation: jest.fn(),
}));

jest.mock('../config/ConfigStatusContext', () => ({
  useConfigStatus: jest.fn(),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 56,
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const { useChannelsQuery } = jest.requireMock('../api/useChannelsQuery') as {
  useChannelsQuery: jest.Mock;
};

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
  is_monitored: false,
  last_seen_video_id: null,
  baseline_established_at: null,
  latest_detected_video: null,
};

describe('ChannelsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useConfigStatus.mockReturnValue({ config: { apiBaseUrl: 'http://10.0.2.2:4000' } });
    useUpdateChannelMonitoringMutation.mockReturnValue({ mutate: jest.fn(), isPending: false, variables: undefined });
  });

  it('renders channel filters, search, and list items', () => {
    useChannelsQuery.mockReturnValue({
      data: { pages: [{ channels: [channel], pagination: { limit: 25, offset: 0, total: 1 } }] },
      error: null,
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
    });

    render(<ChannelsScreen />);

    expect(screen.getByText('Monitored')).toBeTruthy();
    expect(screen.getByText('Unmonitored')).toBeTruthy();
    expect(screen.getByText('React Native Weekly')).toBeTruthy();
    expect(screen.getByText('No detected video yet.')).toBeTruthy();
  });

  it('navigates to channel detail when item is pressed', () => {
    useChannelsQuery.mockReturnValue({
      data: { pages: [{ channels: [channel], pagination: { limit: 25, offset: 0, total: 1 } }] },
      error: null,
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
    });

    render(<ChannelsScreen />);

    fireEvent.press(screen.getByText('React Native Weekly'));

    expect(mockNavigate).toHaveBeenCalledWith('ChannelDetail', { channel });
  });

  it('shows first-activation education before enabling monitoring', async () => {
    const mutate = jest.fn();
    useUpdateChannelMonitoringMutation.mockReturnValue({ mutate, isPending: false, variables: undefined });
    useChannelsQuery.mockReturnValue({
      data: { pages: [{ channels: [channel], pagination: { limit: 25, offset: 0, total: 1 } }] },
      error: null,
      isLoading: false,
      isFetching: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
    });

    render(<ChannelsScreen />);

    fireEvent(screen.getByLabelText('Enable monitoring for React Native Weekly'), 'valueChange', true);

    expect(await screen.findByText('Enable monitoring?')).toBeTruthy();

    fireEvent.press(screen.getByText('I understand, enable monitoring'));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith(
        { channelId: 1, isMonitored: true },
        expect.objectContaining({ onError: expect.any(Function) }),
      );
    });
  });
});
