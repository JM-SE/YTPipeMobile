import { testStatusConnection } from '../api/statusTestClient';

jest.mock('../api/mobileApi', () => ({
  getStatus: jest.fn(),
}));

const { getStatus } = jest.requireMock('../api/mobileApi') as {
  getStatus: jest.Mock;
};

describe('statusTestClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns environment and ready on success', async () => {
    getStatus.mockResolvedValue({ environment: 'mock', ready: true });

    await expect(testStatusConnection('http://10.0.2.2:4000', 'dev-mobile-token')).resolves.toEqual({
      environment: 'mock',
      ready: true,
    });
  });

  it('maps 401 to authentication guidance', async () => {
    getStatus.mockRejectedValue(new Error('Authentication failed (401). Verify API base URL and mobile token in Settings.'));

    await expect(testStatusConnection('http://10.0.2.2:4000', 'wrong-token')).rejects.toThrow(/Authentication failed/i);
  });

  it('maps 422 using backend detail when available', async () => {
    getStatus.mockRejectedValue(new Error('limit must be an integer'));

    await expect(testStatusConnection('http://10.0.2.2:4000', 'dev-mobile-token')).rejects.toThrow(
      'limit must be an integer',
    );
  });

  it('maps 5xx to backend unavailable/degraded message', async () => {
    getStatus.mockRejectedValue(
      new Error('Backend appears unavailable or degraded. It may be sleeping on Render; try again shortly.'),
    );

    await expect(testStatusConnection('http://10.0.2.2:4000', 'dev-mobile-token')).rejects.toThrow(/unavailable or degraded/i);
  });

  it('maps AbortError to timeout message', async () => {
    getStatus.mockRejectedValue(new Error('Request timed out. Backend may be sleeping or unreachable. Please retry.'));

    await expect(testStatusConnection('http://10.0.2.2:4000', 'dev-mobile-token')).rejects.toThrow(/timed out/i);
  });

  it('maps TypeError to connectivity/emulator guidance', async () => {
    getStatus.mockRejectedValue(
      new Error(
        'Could not reach backend. Check connection, API base URL, and emulator mapping (10.0.2.2 for Android Emulator).',
      ),
    );

    await expect(testStatusConnection('http://10.0.2.2:4000', 'dev-mobile-token')).rejects.toThrow(/10.0.2.2/i);
  });

  it('throws parse error when success body is not valid JSON', async () => {
    getStatus.mockRejectedValue(new Error('Unexpected API response format. Could not parse JSON.'));

    await expect(testStatusConnection('http://10.0.2.2:4000', 'dev-mobile-token')).rejects.toThrow(/Could not parse JSON/i);
  });
});
