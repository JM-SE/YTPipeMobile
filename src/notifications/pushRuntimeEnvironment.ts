import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

export const REMOTE_PUSH_UNAVAILABLE_REASON =
  'Remote push notifications require a development build on Android; Expo Go cannot register or receive remote pushes.';

export interface PushRuntimeEnvironment {
  executionEnvironment: ExecutionEnvironment | null;
  os: typeof Platform.OS;
}

export function getPushRuntimeEnvironment(): PushRuntimeEnvironment {
  return {
    executionEnvironment: Constants.executionEnvironment ?? null,
    os: Platform.OS,
  };
}

export function isRemotePushRuntimeAvailable(environment = getPushRuntimeEnvironment()): boolean {
  return !(environment.os === 'android' && environment.executionEnvironment === ExecutionEnvironment.StoreClient);
}

export function getRemotePushUnavailableReason(environment = getPushRuntimeEnvironment()): string | null {
  return isRemotePushRuntimeAvailable(environment) ? null : REMOTE_PUSH_UNAVAILABLE_REASON;
}
