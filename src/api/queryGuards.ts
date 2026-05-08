import type { ActiveConfig } from '../config/configStorage';
import { ApiError } from './errors';

export function retryTransientApiError(failureCount: number, error: ApiError) {
  if (failureCount >= 1) return false;
  return error.kind === 'network' || error.kind === 'timeout' || error.kind === 'server';
}

export function missingConfigError() {
  return new ApiError({
    kind: 'validation',
    message: 'API configuration is missing. Open Settings and save a valid API base URL and mobile token.',
  });
}

export function requireActiveConfig(config: ActiveConfig | null | undefined) {
  if (!config) throw missingConfigError();
  return config;
}
