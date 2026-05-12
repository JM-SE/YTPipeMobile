import { ExecutionEnvironment } from 'expo-constants';

import {
  getRemotePushUnavailableReason,
  isRemotePushRuntimeAvailable,
  REMOTE_PUSH_UNAVAILABLE_REASON,
} from '../notifications/pushRuntimeEnvironment';

describe('pushRuntimeEnvironment', () => {
  it('blocks remote push runtime in Android Expo Go', () => {
    const environment = { os: 'android' as const, executionEnvironment: ExecutionEnvironment.StoreClient };

    expect(isRemotePushRuntimeAvailable(environment)).toBe(false);
    expect(getRemotePushUnavailableReason(environment)).toBe(REMOTE_PUSH_UNAVAILABLE_REASON);
  });

  it('allows remote push runtime in Android development/native builds', () => {
    const environment = { os: 'android' as const, executionEnvironment: ExecutionEnvironment.Standalone };

    expect(isRemotePushRuntimeAvailable(environment)).toBe(true);
    expect(getRemotePushUnavailableReason(environment)).toBeNull();
  });

  it('does not block non-Android Expo Go environments', () => {
    const environment = { os: 'ios' as const, executionEnvironment: ExecutionEnvironment.StoreClient };

    expect(isRemotePushRuntimeAvailable(environment)).toBe(true);
  });
});
