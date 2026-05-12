import { createNavigationContainerRef } from '@react-navigation/native';

import type { AppStackParamList } from './types';

type PendingNavigationAction = () => void;

const pendingNavigationActions: PendingNavigationAction[] = [];

export const navigationRef = createNavigationContainerRef<AppStackParamList>();

function runOrQueue(action: PendingNavigationAction) {
  if (navigationRef.isReady()) {
    action();
    return;
  }

  pendingNavigationActions.push(action);
}

export function navigateToActivityFromNotification() {
  runOrQueue(() => {
    navigationRef.navigate('MainTabs', { screen: 'Activity' });
  });
}

export function navigateToSettingsFromNotification() {
  runOrQueue(() => {
    navigationRef.navigate('Settings');
  });
}

export function flushPendingNotificationNavigation() {
  if (!navigationRef.isReady()) {
    return;
  }

  while (pendingNavigationActions.length > 0) {
    const action = pendingNavigationActions.shift();
    action?.();
  }
}

export function clearPendingNotificationNavigationForTest() {
  pendingNavigationActions.length = 0;
}
