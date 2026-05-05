import { testStatusConnection } from '../api/statusTestClient';

describe('statusTestClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns environment and ready on success', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ environment: 'mock', ready: true }),
    }) as Response) as jest.Mock;

    await expect(testStatusConnection('http://10.0.2.2:4000', 'dev-mobile-token')).resolves.toEqual({
      environment: 'mock',
      ready: true,
    });
  });

  it('maps 401 to authentication guidance', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'bad token' }),
    }) as Response) as jest.Mock;

    await expect(testStatusConnection('http://10.0.2.2:4000', 'wrong-token')).rejects.toThrow(/Authentication failed/i);
  });

  it('maps 422 using backend detail when available', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 422,
      json: async () => ({ detail: 'limit must be an integer' }),
    }) as Response) as jest.Mock;

    await expect(testStatusConnection('http://10.0.2.2:4000', 'dev-mobile-token')).rejects.toThrow(
      'limit must be an integer',
    );
  });

  it('maps 5xx to backend unavailable/degraded message', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({ detail: 'service unavailable' }),
    }) as Response) as jest.Mock;

    await expect(testStatusConnection('http://10.0.2.2:4000', 'dev-mobile-token')).rejects.toThrow(/unavailable or degraded/i);
  });

  it('maps AbortError to timeout message', async () => {
    global.fetch = jest.fn(async () => {
      const abortError = new Error('aborted');
      abortError.name = 'AbortError';
      throw abortError;
    }) as jest.Mock;

    await expect(testStatusConnection('http://10.0.2.2:4000', 'dev-mobile-token')).rejects.toThrow(/timed out/i);
  });

  it('maps TypeError to connectivity/emulator guidance', async () => {
    global.fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    }) as jest.Mock;

    await expect(testStatusConnection('http://10.0.2.2:4000', 'dev-mobile-token')).rejects.toThrow(/10.0.2.2/i);
  });

  it('throws parse error when success body is not valid JSON', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => {
        throw new Error('invalid json');
      },
    }) as unknown as Response) as jest.Mock;

    await expect(testStatusConnection('http://10.0.2.2:4000', 'dev-mobile-token')).rejects.toThrow(/Could not parse JSON/i);
  });
});
