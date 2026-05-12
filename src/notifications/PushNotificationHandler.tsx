import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../api/queryKeys';
import { navigateToActivityFromNotification, navigateToSettingsFromNotification } from '../navigation/navigationRef';
import { parsePushNotificationPayload, PUSH_NOTIFICATION_TYPE } from './pushNotificationPayloads';

import './configureNotificationHandler';

type NotificationResponse = Notifications.NotificationResponse;

function notificationDataFromResponse(response: NotificationResponse | null | undefined): unknown {
  return response?.notification.request.content.data;
}

export function PushNotificationHandler() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let isMounted = true;

    const handleResponse = (response: NotificationResponse | null | undefined) => {
      const parsedPayload = parsePushNotificationPayload(notificationDataFromResponse(response));

      if (!parsedPayload) {
        return;
      }

      if (parsedPayload.type === PUSH_NOTIFICATION_TYPE.NEW_VIDEO) {
        queryClient.invalidateQueries({ predicate: (query) => queryKeys.isActivity(query.queryKey) });
        navigateToActivityFromNotification();
        return;
      }

      if (parsedPayload.type === PUSH_NOTIFICATION_TYPE.TEST) {
        queryClient.invalidateQueries({ predicate: (query) => queryKeys.isMobilePush(query.queryKey) });
        navigateToSettingsFromNotification();
      }
    };

    const lastResponse = Notifications.getLastNotificationResponse();

    if (isMounted && lastResponse) {
      handleResponse(lastResponse);
      Notifications.clearLastNotificationResponse();
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [queryClient]);

  return null;
}
