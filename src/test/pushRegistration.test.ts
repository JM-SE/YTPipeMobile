import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { getExpoProjectId, getExpoPushToken } from '../notifications/pushRegistration';

function mockedNotifications() {
  return Notifications as jest.Mocked<typeof Notifications>;
}

describe('pushRegistration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Constants.expoConfig = { name: 'YTPipe Mobile', slug: 'ytpipe-mobile', extra: { eas: { projectId: 'project-id-1' } } } as unknown as typeof Constants.expoConfig;
    Constants.easConfig = null;
  });

  it('reads Expo project id from app config', () => {
    expect(getExpoProjectId()).toBe('project-id-1');
  });

  it('passes project id when requesting an Expo push token', async () => {
    await expect(getExpoPushToken()).resolves.toBe('ExponentPushToken[test-token]');

    expect(mockedNotifications().getExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: 'project-id-1' });
  });

  it('throws a clear error when project id is missing', async () => {
    Constants.expoConfig = { name: 'YTPipe Mobile', slug: 'ytpipe-mobile', extra: {} } as unknown as typeof Constants.expoConfig;
    Constants.easConfig = null;

    await expect(getExpoPushToken()).rejects.toThrow(/Expo projectId is required/i);
    expect(mockedNotifications().getExpoPushTokenAsync).not.toHaveBeenCalled();
  });
});
