import { renderHook, waitFor } from '@testing-library/react-native';

import { ApiError } from '../api/errors';
import { QUERY_PAGE_SIZE, queryKeys } from '../api/queryKeys';
import { useMobilePushChannelPreferencesQuery } from '../hooks/useMobilePushChannelPreferencesQuery';
import { createQueryClientWrapper } from './testUtils';

jest.mock('../config/ConfigStatusContext', () => ({
  useConfigStatus: jest.fn(),
}));

jest.mock('../api/mobilePushApi', () => ({
  getMobilePushChannelPreferences: jest.fn(),
}));

const { useConfigStatus } = jest.requireMock('../config/ConfigStatusContext') as {
  useConfigStatus: jest.Mock;
};

const { getMobilePushChannelPreferences } = jest.requireMock('../api/mobilePushApi') as {
  getMobilePushChannelPreferences: jest.Mock;
};

const config = { apiBaseUrl: 'https://api.example.com', mobileApiToken: 'mobile-token' };

describe('useMobilePushChannelPreferencesQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stays disabled without active config', () => {
    useConfigStatus.mockReturnValue({ status: 'missing', config: null });

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useMobilePushChannelPreferencesQuery(), { wrapper: Wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getMobilePushChannelPreferences).not.toHaveBeenCalled();
  });

  it('loads monitored preferences with fixed page size and token-free key', async () => {
    useConfigStatus.mockReturnValue({ status: 'present', config });
    getMobilePushChannelPreferences.mockResolvedValue({ channels: [], pagination: { limit: 25, offset: 0, total: 0 } });

    const { queryClient, Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useMobilePushChannelPreferencesQuery({ query: 'react' }), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getMobilePushChannelPreferences).toHaveBeenCalledWith(config, {
      monitoring: 'monitored',
      query: 'react',
      limit: QUERY_PAGE_SIZE.mobilePushChannelPreferences,
      offset: 0,
    });
    expect(queryClient.getQueryCache().getAll()[0]?.queryKey).toEqual(queryKeys.mobilePush.channelPreferences(config.apiBaseUrl, 'monitored', 'react'));
    expect(JSON.stringify(queryClient.getQueryCache().getAll()[0]?.queryKey)).not.toContain(config.mobileApiToken);
  });

  it('does not retry auth errors', async () => {
    useConfigStatus.mockReturnValue({ status: 'present', config });
    getMobilePushChannelPreferences.mockRejectedValue(new ApiError({ kind: 'auth', message: 'auth failed', status: 401 }));

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useMobilePushChannelPreferencesQuery(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(getMobilePushChannelPreferences).toHaveBeenCalledTimes(1);
  });
});
