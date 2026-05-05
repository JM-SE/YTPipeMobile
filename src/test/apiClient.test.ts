import { apiRequest } from '../api/client';

const config = {
  apiBaseUrl: 'http://10.0.2.2:4000/',
  mobileApiToken: 'dev-mobile-token',
};

describe('apiRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds URL/query and sends auth header', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ ok: true }),
    }) as unknown as Response) as jest.Mock;

    await apiRequest<{ ok: boolean }>(config, '/internal/channels', {
      method: 'GET',
      query: { monitoring: 'all', limit: 50, offset: 0 },
    });

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(url).toContain('http://10.0.2.2:4000/internal/channels');
    expect(url).toContain('monitoring=all');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer dev-mobile-token');
  });

  it('maps 401 into auth ApiError', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ detail: 'bad token dev-mobile-token' }),
      headers: { get: () => 'application/json' },
    }) as unknown as Response) as jest.Mock;

    await expect(apiRequest(config, '/status')).rejects.toMatchObject({ kind: 'auth', status: 401 });
    await expect(apiRequest(config, '/status')).rejects.not.toThrow(/dev-mobile-token/);
  });

  it('maps 5xx into server ApiError', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: async () => ({ detail: 'provider unavailable' }),
      headers: { get: () => 'application/json' },
    }) as unknown as Response) as jest.Mock;

    await expect(apiRequest(config, '/status')).rejects.toMatchObject({ kind: 'server', status: 503 });
  });

  it('maps TypeError to network ApiError', async () => {
    global.fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    }) as jest.Mock;

    await expect(apiRequest(config, '/status')).rejects.toMatchObject({ kind: 'network' });
  });
});
