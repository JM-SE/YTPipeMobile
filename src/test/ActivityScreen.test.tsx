import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import type { ActivityItem } from '../api/types';
import { ActivityScreen } from '../screens/ActivityScreen';

jest.mock('../api/useActivityQuery', () => ({
  useActivityQuery: jest.fn(),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 56,
}));

const { useActivityQuery } = jest.requireMock('../api/useActivityQuery') as {
  useActivityQuery: jest.Mock;
};

const activity: ActivityItem = {
  activity_id: 101,
  delivery_id: 202,
  video_id: 303,
  youtube_video_id: 'yt-video-1',
  video_title: 'React Native Activity Feed',
  youtube_url: 'https://www.youtube.com/watch?v=yt-video-1',
  channel_id: 404,
  channel_title: 'YTPipe Channel',
  delivery_status: 'failed',
  published_at: '2026-05-05T10:00:00.000Z',
  detected_at: '2026-05-05T10:05:00.000Z',
  last_attempt_at: '2026-05-05T10:06:00.000Z',
  last_error: 'SMTP unavailable',
};

function mockActivityQuery(overrides: Record<string, unknown> = {}) {
  useActivityQuery.mockReturnValue({
    data: { pages: [{ items: [activity], pagination: { limit: 25, offset: 0, total: 1 } }] },
    error: null,
    isLoading: false,
    isFetching: false,
    isFetchingNextPage: false,
    isRefetchError: false,
    hasNextPage: false,
    refetch: jest.fn(),
    fetchNextPage: jest.fn(),
    ...overrides,
  });
}

describe('ActivityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders filters and activity rows', () => {
    mockActivityQuery();

    render(<ActivityScreen />);

    expect(screen.getByText('All')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
    expect(screen.getByText('React Native Activity Feed')).toBeTruthy();
    expect(screen.getByText('YTPipe Channel')).toBeTruthy();
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0);
    expect(screen.getByText('Error details available')).toBeTruthy();
  });

  it('changes filter and collapses expanded row', () => {
    mockActivityQuery();

    render(<ActivityScreen />);

    fireEvent.press(screen.getByLabelText('Expand activity for React Native Activity Feed'));
    expect(screen.getByText('Activity ID')).toBeTruthy();

    fireEvent.press(screen.getAllByText('Failed')[0]);

    expect(useActivityQuery).toHaveBeenLastCalledWith({ status: 'failed' });
    expect(screen.queryByText('Activity ID')).toBeNull();
  });

  it('expands a single row with read-only delivery details', () => {
    mockActivityQuery();

    render(<ActivityScreen />);

    fireEvent.press(screen.getByLabelText('Expand activity for React Native Activity Feed'));

    expect(screen.getByText('Activity ID')).toBeTruthy();
    expect(screen.getByText('101')).toBeTruthy();
    expect(screen.getByText('Delivery ID')).toBeTruthy();
    expect(screen.getByText('202')).toBeTruthy();
    expect(screen.getByText('Last error')).toBeTruthy();
    expect(screen.getByText('SMTP unavailable')).toBeTruthy();
  });

  it('opens the external YouTube link without mutating activity state', async () => {
    mockActivityQuery();

    render(<ActivityScreen />);
    fireEvent.press(screen.getByText('Open YouTube'));

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalledWith('https://www.youtube.com/watch?v=yt-video-1');
    });
  });

  it('shows an inline error when the YouTube link cannot open', async () => {
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(false);
    mockActivityQuery();

    render(<ActivityScreen />);
    fireEvent.press(screen.getByText('Open YouTube'));

    expect(await screen.findByText('Could not open YouTube link. Try again from another device/browser.')).toBeTruthy();
  });

  it('shows filter-aware empty state', () => {
    mockActivityQuery({
      data: { pages: [{ items: [], pagination: { limit: 25, offset: 0, total: 0 } }] },
    });

    render(<ActivityScreen />);

    expect(screen.getByText('No activity yet. Run Poll from Dashboard after monitoring channels to create activity.')).toBeTruthy();
  });
});
