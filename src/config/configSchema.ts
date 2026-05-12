import { z } from 'zod';

import { isDevelopmentBuild } from './environment';

const API_PROTOCOL = {
  HTTP: 'http:',
  HTTPS: 'https:',
} as const;

const LOCAL_HTTP_HOSTS = new Set(['localhost', '127.0.0.1', '10.0.2.2', '10.0.3.2']);

export const normalizeApiBaseUrl = (value: string) => value.trim().replace(/\/+$/, '');

export const normalizeToken = (value: string) => value.trim();

export const isValidApiBaseUrl = (value: string, isDev = isDevelopmentBuild()) => {
  try {
    const parsed = new URL(normalizeApiBaseUrl(value));
    const hostname = parsed.hostname.trim().toLowerCase();

    if (!hostname) return false;
    if (parsed.protocol === API_PROTOCOL.HTTPS) return true;
    if (parsed.protocol === API_PROTOCOL.HTTP) return isDev && LOCAL_HTTP_HOSTS.has(hostname);

    return false;
  } catch {
    return false;
  }
};

export const configFormSchema = z.object({
  apiBaseUrl: z
    .string()
    .min(1, 'API Base URL is required')
    .refine(
      (value) => isValidApiBaseUrl(value),
      'Enter an HTTPS API URL. In development, HTTP is only supported for local hosts like http://10.0.2.2:4000 on the Android Emulator.',
    ),
  mobileApiToken: z.string().min(1, 'Mobile API token is required'),
});

export type ConfigFormValues = z.infer<typeof configFormSchema>;
