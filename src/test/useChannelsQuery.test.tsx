import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import { ApiError } from '../api/errors';
import { QUERY_PAGE_SIZE } from '../api/queryKeys';
import { useChannelsQuery } from '../api/useChannelsQuery';

jest.mock('../config/ConfigStatusContext', () => ({
  useConfigStatus: jest.fn(),
}));

jest.mock('../api/mobileApi', () => ({
  getChannels: jest.fn(),
}));

const { useConfigStatus } = jest.requireMock('../config/ConfigStatusContext') as {
  useConfigStatus: jest.Mock;
};

const { getChannels } = jest.requireMock('../api/mobileApi') as {
  getChannels: jest.Mock;
};

const config = { apiBaseUrl: 'http://10.0.2.2:4000', mobileApiToken: 'dev-mobile-token' };

function wrapperFactory() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useChannelsQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stays disabled without active config', () => {
    useConfigStatus.mockReturnValue({ status: 'missing', config: null });

    const { result } = renderHook(() => useChannelsQuery(), { wrapper: wrapperFactory() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getChannels).not.toHaveBeenCalled();
  });

  it('loads first page with normalized search and fixed page size', async () => {
    useConfigStatus.mockReturnValue({ status: 'present', config });
    getChannels.mockResolvedValue({ channels: [], pagination: { limit: 25, offset: 0, total: 0 } });

    const { result } = renderHook(() => useChannelsQuery({ monitoring: 'all', query: '  react  ' }), {
      wrapper: wrapperFactory(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getChannels).toHaveBeenCalledWith(config, {
      monitoring: 'all',
      query: 'react',
      limit: QUERY_PAGE_SIZE.channels,
      offset: 0,
    });
  });

  it('does not retry auth errors', async () => {
    useConfigStatus.mockReturnValue({ status: 'present', config });
    getChannels.mockRejectedValue(new ApiError({ kind: 'auth', message: 'auth failed', status: 401 }));

    const { result } = renderHook(() => useChannelsQuery(), { wrapper: wrapperFactory() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(getChannels).toHaveBeenCalledTimes(1);
  });
});
