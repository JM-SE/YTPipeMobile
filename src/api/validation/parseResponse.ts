import { z } from 'zod';

import { ApiError, sanitizeSensitiveText } from '../errors';

export function parseApiResponse<T>(schema: z.ZodType<T>, value: unknown, endpointName: string, token?: string): T {
  const result = schema.safeParse(value);

  if (result.success) return result.data;

  const issues = result.error.issues.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`).join('; ');

  throw new ApiError({
    kind: 'parse',
    message: 'Unexpected API response format. Please retry or verify backend compatibility.',
    technical: sanitizeSensitiveText(`${endpointName} response validation failed: ${issues}`, token),
  });
}
