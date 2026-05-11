import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { MobilePushPlatform } from '../api/types';

export type PushPermissionState = 'not_requested' | 'granted' | 'denied' | 'undetermined';

export interface PushRegistrationMetadata {
  platform: MobilePushPlatform;
  app_version: string | null;
  build_number: string | null;
  device_name: string | null;
}

function toPermissionState(status: Notifications.PermissionStatus): PushPermissionState {
  if (status === Notifications.PermissionStatus.GRANTED) return 'granted';
  if (status === Notifications.PermissionStatus.DENIED) return 'denied';
  return 'undetermined';
}

export async function getPushPermissionState(): Promise<PushPermissionState> {
  const permissions = await Notifications.getPermissionsAsync();
  return toPermissionState(permissions.status);
}

export async function requestPushPermission(): Promise<PushPermissionState> {
  const permissions = await Notifications.requestPermissionsAsync();
  return toPermissionState(permissions.status);
}

export async function configureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function getExpoPushToken(): Promise<string> {
  await configureAndroidNotificationChannel();
  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

export function getPushRegistrationMetadata(): PushRegistrationMetadata {
  return {
    platform: Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'unknown',
    app_version: null,
    build_number: null,
    device_name: null,
  };
}
