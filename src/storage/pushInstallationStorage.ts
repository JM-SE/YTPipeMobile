import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_INSTALLATION_ID_KEY = 'ytpipe:push:installation_id';

function createUuid(): string {
  const randomUuid = globalThis.crypto?.randomUUID?.();
  if (randomUuid) return randomUuid;

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export async function getPushInstallationId(): Promise<string | null> {
  return AsyncStorage.getItem(PUSH_INSTALLATION_ID_KEY);
}

export async function getOrCreatePushInstallationId(): Promise<string> {
  const existing = await getPushInstallationId();
  if (existing) return existing;

  const installationId = createUuid();
  await AsyncStorage.setItem(PUSH_INSTALLATION_ID_KEY, installationId);
  return installationId;
}

export async function setPushInstallationIdForTest(installationId: string): Promise<void> {
  await AsyncStorage.setItem(PUSH_INSTALLATION_ID_KEY, installationId);
}

export async function clearPushInstallationId(): Promise<void> {
  await AsyncStorage.removeItem(PUSH_INSTALLATION_ID_KEY);
}

export function maskInstallationId(installationId: string): string {
  if (installationId.length <= 12) return '<masked>';
  return `${installationId.slice(0, 8)}…${installationId.slice(-4)}`;
}
