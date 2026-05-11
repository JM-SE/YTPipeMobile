import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearPushInstallationId,
  getOrCreatePushInstallationId,
  getPushInstallationId,
  maskInstallationId,
  setPushInstallationIdForTest,
} from '../storage/pushInstallationStorage';

describe('push installation storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates and persists an installation id when missing', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const installationId = await getOrCreatePushInstallationId();

    expect(installationId).toMatch(/[0-9a-f-]{36}/);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('ytpipe:push:installation_id', installationId);
  });

  it('reuses an existing installation id', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('existing-installation-id');

    await expect(getOrCreatePushInstallationId()).resolves.toBe('existing-installation-id');
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('reads, sets, clears, and masks installation ids', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('stored-installation-id');

    await expect(getPushInstallationId()).resolves.toBe('stored-installation-id');
    await setPushInstallationIdForTest('test-installation-id');
    await clearPushInstallationId();

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('ytpipe:push:installation_id', 'test-installation-id');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('ytpipe:push:installation_id');
    expect(maskInstallationId('12345678-1234-1234-1234-123456789abc')).toBe('12345678…9abc');
  });
});
