import type { ActiveConfig } from '../config/configStorage';
import { ApiError, sanitizeSensitiveText, toApiError } from './errors';

const REQUEST_TIMEOUT_MS = 12000;

export type ApiClientConfig = Pick<ActiveConfig, 'apiBaseUrl' | 'mobileApiToken'>;

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  protected?: boolean;
};

function normalizePath(path: string): string {
  if (!path.startsWith('/')) return `/${path}`;
  return path;
}

function buildUrl(baseUrl: string, path: string, query?: RequestOptions['query']): string {
  const base = baseUrl.replace(/\/+$/, '');
  const url = new URL(`${base}${normalizePath(path)}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

function asDetail(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const detail = (body as { detail?: unknown }).detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return JSON.stringify(detail);
  return undefined;
}

export async function apiRequest<T>(config: ApiClientConfig, path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = buildUrl(config.apiBaseUrl, path, options.query);
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (options.protected !== false) {
      headers.Authorization = `Bearer ${config.mobileApiToken}`;
    }

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });

    if (!response.ok) {
      let parsedBody: unknown;
      try {
        parsedBody = await response.json();
      } catch {
        parsedBody = undefined;
      }

      throw toApiError({
        status: response.status,
        detail: asDetail(parsedBody),
        technical: `HTTP ${response.status} ${response.statusText}`,
        token: config.mobileApiToken,
      });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.toLowerCase().includes('application/json')) {
      return undefined as T;
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new ApiError({
        kind: 'parse',
        message: 'Unexpected API response format. Could not parse JSON.',
        technical: sanitizeSensitiveText(String(error), config.mobileApiToken),
      });
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError({
        kind: 'timeout',
        message: 'Request timed out. Backend may be sleeping or unreachable. Please retry.',
      });
    }

    if (error instanceof TypeError) {
      throw new ApiError({
        kind: 'network',
        message:
          'Could not reach backend. Check connection, API base URL, and emulator mapping (10.0.2.2 for Android Emulator).',
        technical: sanitizeSensitiveText(error.message, config.mobileApiToken),
      });
    }

    throw new ApiError({
      kind: 'unknown',
      message: 'Unexpected request error.',
      technical: sanitizeSensitiveText(String(error), config.mobileApiToken),
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
