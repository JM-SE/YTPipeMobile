import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { clearStoredConfig, persistConfig, readStoredConfig, STORAGE_KEYS } from '../config/configStorage';

describe('config storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists and reads config', async () => {
    await persistConfig({ apiBaseUrl: 'https://api.example.com/', mobileApiToken: ' token ' });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.apiBaseUrl, 'https://api.example.com');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.token, 'token');

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('https://api.example.com');
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('token');

    await expect(readStoredConfig()).resolves.toEqual({
      apiBaseUrl: 'https://api.example.com',
      mobileApiToken: 'token',
    });
  });

  it('clears config keys', async () => {
    await clearStoredConfig();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.apiBaseUrl);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.metadata);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.token);
  });
});
