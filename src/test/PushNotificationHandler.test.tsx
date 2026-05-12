import { act, render, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';

import { PushNotificationHandler } from '../notifications/PushNotificationHandler';
import { queryKeys } from '../api/queryKeys';
import { createQueryClientWrapper } from './testUtils';

const mockNavigateToActivityFromNotification = jest.fn();
const mockNavigateToSettingsFromNotification = jest.fn();

jest.mock('../navigation/navigationRef', () => ({
  navigateToActivityFromNotification: () => mockNavigateToActivityFromNotification(),
  navigateToSettingsFromNotification: () => mockNavigateToSettingsFromNotification(),
}));

type NotificationListener = (response: Notifications.NotificationResponse) => void;

function notificationResponse(data: Record<string, unknown>): Notifications.NotificationResponse {
  return {
    notification: {
      request: {
        content: { data },
      },
    },
  } as Notifications.NotificationResponse;
}

function mockedNotifications() {
  return Notifications as jest.Mocked<typeof Notifications>;
}

describe('PushNotificationHandler', () => {
  let listener: NotificationListener | null;
  let removeSubscription: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    listener = null;
    removeSubscription = jest.fn();

    mockedNotifications().getLastNotificationResponse.mockReturnValue(null);
    mockedNotifications().addNotificationResponseReceivedListener.mockImplementation((callback) => {
      listener = callback as NotificationListener;
      return { remove: removeSubscription } as Notifications.Subscription;
    });
  });

  it('handles a runtime new_video tap by invalidating Activity and opening Activity', async () => {
    const { queryClient, Wrapper } = createQueryClientWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    render(<PushNotificationHandler />, { wrapper: Wrapper });

    await waitFor(() => expect(mockedNotifications().addNotificationResponseReceivedListener).toHaveBeenCalledTimes(1));

    act(() => {
      listener?.(notificationResponse({ type: 'new_video', activity_id: 1, delivery_id: 2 }));
    });

    expect(mockNavigateToActivityFromNotification).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ predicate: expect.any(Function) });

    const predicate = invalidateSpy.mock.calls[0]?.[0]?.predicate;
    const activityQuery = { queryKey: queryKeys.activityInfinite('https://api.example.com', 'all') } as unknown as Parameters<
      NonNullable<typeof predicate>
    >[0];
    expect(predicate?.(activityQuery)).toBe(true);
  });

  it('handles a cold-start new_video response once on mount', async () => {
    const { Wrapper } = createQueryClientWrapper();
    mockedNotifications().getLastNotificationResponse.mockReturnValue(notificationResponse({ type: 'new_video', video_id: 1 }));

    render(<PushNotificationHandler />, { wrapper: Wrapper });

    await waitFor(() => expect(mockNavigateToActivityFromNotification).toHaveBeenCalledTimes(1));
    expect(mockedNotifications().clearLastNotificationResponse).toHaveBeenCalledTimes(1);
  });

  it('handles a test tap by invalidating mobile push status and opening Settings', async () => {
    const { queryClient, Wrapper } = createQueryClientWrapper();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    render(<PushNotificationHandler />, { wrapper: Wrapper });
    await waitFor(() => expect(mockedNotifications().addNotificationResponseReceivedListener).toHaveBeenCalledTimes(1));

    act(() => {
      listener?.(notificationResponse({ type: 'test', sent_at: '2026-05-11T10:00:00Z' }));
    });

    expect(mockNavigateToSettingsFromNotification).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ predicate: expect.any(Function) });

    const predicate = invalidateSpy.mock.calls[0]?.[0]?.predicate;
    const mobilePushQuery = { queryKey: queryKeys.mobilePush.status('https://api.example.com', 'installation-1') } as unknown as Parameters<
      NonNullable<typeof predicate>
    >[0];
    expect(predicate?.(mobilePushQuery)).toBe(true);
  });

  it('no-ops unknown payloads and cleans up the listener', async () => {
    const { Wrapper } = createQueryClientWrapper();

    const { unmount } = render(<PushNotificationHandler />, { wrapper: Wrapper });
    await waitFor(() => expect(mockedNotifications().addNotificationResponseReceivedListener).toHaveBeenCalledTimes(1));

    act(() => {
      listener?.(notificationResponse({ type: 'unknown' }));
    });

    expect(mockNavigateToActivityFromNotification).not.toHaveBeenCalled();
    expect(mockNavigateToSettingsFromNotification).not.toHaveBeenCalled();

    unmount();

    expect(removeSubscription).toHaveBeenCalledTimes(1);
  });
});
