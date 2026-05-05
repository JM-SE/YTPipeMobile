import { z } from 'zod';

const allowedProtocols = new Set(['http:', 'https:']);

export const normalizeApiBaseUrl = (value: string) => value.trim().replace(/\/+$/, '');

export const normalizeToken = (value: string) => value.trim();

const isValidBaseUrl = (value: string) => {
  try {
    const parsed = new URL(normalizeApiBaseUrl(value));
    if (!allowedProtocols.has(parsed.protocol)) return false;
    return parsed.hostname.trim().length > 0;
  } catch {
    return false;
  }
};

export const configFormSchema = z.object({
  apiBaseUrl: z
    .string()
    .min(1, 'API Base URL is required')
    .refine(isValidBaseUrl, 'Enter a valid HTTP/HTTPS base URL'),
  mobileApiToken: z.string().min(1, 'Mobile API token is required'),
});

export type ConfigFormValues = z.infer<typeof configFormSchema>;
