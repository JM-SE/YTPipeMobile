import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { MobilePushPlatform } from '../api/types';

export type PushPermissionState = 'not_requested' | 'granted' | 'denied' | 'undetermined';

export interface PushRegistrationMetadata {
  platform: MobilePushPlatform;
  app_version: string | null;
  build_number: string | null;
  device_name: string | null;
}

interface ExpoExtraConfig {
  eas?: {
    projectId?: unknown;
  };
}

interface EASConfig {
  projectId?: unknown;
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

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function getExpoProjectId(): string | null {
  const extra = Constants.expoConfig?.extra as ExpoExtraConfig | undefined;
  const easConfig = Constants.easConfig as EASConfig | undefined;

  return stringOrNull(extra?.eas?.projectId) ?? stringOrNull(easConfig?.projectId);
}

export async function getExpoPushToken(): Promise<string> {
  await configureAndroidNotificationChannel();
  const projectId = getExpoProjectId();

  if (!projectId) {
    throw new Error('Expo projectId is required to register push notifications. Run EAS init and rebuild the development build.');
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
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
