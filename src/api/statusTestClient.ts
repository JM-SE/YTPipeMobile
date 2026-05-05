export type TestStatusSuccess = {
  environment?: string;
  ready?: boolean;
};

const REQUEST_TIMEOUT_MS = 12000;

function mapStatusError(status: number, detail?: string) {
  if (status === 401) {
    return 'Authentication failed (401). Verify API base URL and mobile token in Settings.';
  }
  if (status === 422) {
    return detail ?? 'Validation error (422). Check request values and try again.';
  }
  if ([502, 503, 504].includes(status)) {
    return 'Backend appears unavailable or degraded. It may be sleeping on Render; try again shortly.';
  }
  return `Request failed (${status}). Check backend availability and configuration.`;
}

export async function testStatusConnection(apiBaseUrl: string, mobileApiToken: string): Promise<TestStatusSuccess> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${apiBaseUrl}/status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${mobileApiToken}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      let detail: string | undefined;
      try {
        const body = (await response.json()) as { detail?: string };
        detail = typeof body.detail === 'string' ? body.detail : undefined;
      } catch {
        detail = undefined;
      }
      throw new Error(mapStatusError(response.status, detail));
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error('Unexpected /status response format. Could not parse JSON.');
    }

    const result = data as { environment?: string; ready?: boolean };
    return {
      environment: result.environment,
      ready: result.ready,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Backend may be sleeping or unreachable. Please retry.');
    }

    if (error instanceof TypeError) {
      throw new Error(
        'Could not reach backend. Check connection, API base URL, and emulator mapping (10.0.2.2 for Android Emulator).',
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
