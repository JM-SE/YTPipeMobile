export type ApiErrorKind = 'auth' | 'notFound' | 'validation' | 'server' | 'network' | 'timeout' | 'parse' | 'unknown';

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  detail?: string;
  technical?: string;

  constructor(params: { kind: ApiErrorKind; message: string; status?: number; detail?: string; technical?: string }) {
    super(params.message);
    this.name = 'ApiError';
    this.kind = params.kind;
    this.status = params.status;
    this.detail = params.detail;
    this.technical = params.technical;
  }
}

const REDACTED_TOKEN = '[REDACTED_TOKEN]';

export function sanitizeSensitiveText(input: string, token?: string): string {
  if (!input) return input;

  let output = input.replace(/authorization\s*:\s*bearer\s+[^\s",}]+/gi, `Authorization: Bearer ${REDACTED_TOKEN}`);
  output = output.replace(/bearer\s+[^\s",}]+/gi, `Bearer ${REDACTED_TOKEN}`);

  if (token) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    output = output.replace(new RegExp(escaped, 'g'), REDACTED_TOKEN);
  }

  return output;
}

export function toApiError(params: {
  status?: number;
  detail?: string;
  technical?: string;
  token?: string;
}): ApiError {
  const detail = params.detail ? sanitizeSensitiveText(params.detail, params.token) : undefined;
  const technical = params.technical ? sanitizeSensitiveText(params.technical, params.token) : undefined;
  const status = params.status;

  if (status === 401) {
    return new ApiError({
      kind: 'auth',
      status,
      detail,
      technical,
      message:
        'Authentication failed (401). Configuration was not saved; the app is still using the previous valid settings. Verify API base URL and mobile token in Settings.',
    });
  }

  if (status === 404) {
    return new ApiError({
      kind: 'notFound',
      status,
      detail,
      technical,
      message: 'Requested resource was not found (404).',
    });
  }

  if (status === 422) {
    return new ApiError({
      kind: 'validation',
      status,
      detail,
      technical,
      message: detail ?? 'Validation error (422). Check request values and try again.',
    });
  }

  if (status !== undefined && status >= 500) {
    return new ApiError({
      kind: 'server',
      status,
      detail,
      technical,
      message: 'Backend appears unavailable or degraded. It may be sleeping on Render; try again shortly.',
    });
  }

  if (status !== undefined) {
    return new ApiError({
      kind: 'unknown',
      status,
      detail,
      technical,
      message: `Request failed (${status}). Check backend availability and configuration.`,
    });
  }

  return new ApiError({
    kind: 'unknown',
    detail,
    technical,
    message: 'Unexpected API error.',
  });
}
