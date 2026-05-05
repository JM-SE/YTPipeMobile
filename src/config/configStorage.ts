import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { normalizeApiBaseUrl, normalizeToken } from './configSchema';

export const STORAGE_KEYS = {
  apiBaseUrl: 'ytpipe.apiBaseUrl',
  token: 'ytpipe.mobileApiToken',
  metadata: 'ytpipe.configMetadata',
} as const;

export type ActiveConfig = {
  apiBaseUrl: string;
  mobileApiToken: string;
};

export type ConfigMetadata = {
  lastValidatedAt: string;
  environment?: string;
  ready?: boolean;
};

export async function readStoredConfig(): Promise<ActiveConfig | null> {
  const [apiBaseUrlRaw, tokenRaw] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.apiBaseUrl),
    SecureStore.getItemAsync(STORAGE_KEYS.token),
  ]);

  if (!apiBaseUrlRaw || !tokenRaw) return null;

  const apiBaseUrl = normalizeApiBaseUrl(apiBaseUrlRaw);
  const mobileApiToken = normalizeToken(tokenRaw);

  if (!apiBaseUrl || !mobileApiToken) return null;

  return { apiBaseUrl, mobileApiToken };
}

export async function persistConfig(config: ActiveConfig, metadata?: ConfigMetadata) {
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.apiBaseUrl, normalizeApiBaseUrl(config.apiBaseUrl)),
    SecureStore.setItemAsync(STORAGE_KEYS.token, normalizeToken(config.mobileApiToken)),
    metadata
      ? AsyncStorage.setItem(STORAGE_KEYS.metadata, JSON.stringify(metadata))
      : Promise.resolve(),
  ]);
}

export async function clearStoredConfig() {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.apiBaseUrl),
    AsyncStorage.removeItem(STORAGE_KEYS.metadata),
    SecureStore.deleteItemAsync(STORAGE_KEYS.token),
  ]);
}
