import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import { ApiError } from '../api/errors';
import { QUERY_PAGE_SIZE } from '../api/queryKeys';
import { useActivityQuery } from '../api/useActivityQuery';

jest.mock('../config/ConfigStatusContext', () => ({
  useConfigStatus: jest.fn(),
}));

jest.mock('../api/mobileApi', () => ({
  getActivity: jest.fn(),
}));

const { useConfigStatus } = jest.requireMock('../config/ConfigStatusContext') as {
  useConfigStatus: jest.Mock;
};

const { getActivity } = jest.requireMock('../api/mobileApi') as {
  getActivity: jest.Mock;
};

const config = { apiBaseUrl: 'http://10.0.2.2:4000', mobileApiToken: 'dev-mobile-token' };

function wrapperFactory() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useActivityQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stays disabled without active config', () => {
    useConfigStatus.mockReturnValue({ status: 'missing', config: null });

    const { result } = renderHook(() => useActivityQuery(), { wrapper: wrapperFactory() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getActivity).not.toHaveBeenCalled();
  });

  it('loads first page with selected status and fixed page size', async () => {
    useConfigStatus.mockReturnValue({ status: 'present', config });
    getActivity.mockResolvedValue({ items: [], pagination: { limit: 25, offset: 0, total: 0 } });

    const { result } = renderHook(() => useActivityQuery({ status: 'failed' }), {
      wrapper: wrapperFactory(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getActivity).toHaveBeenCalledWith(config, {
      status: 'failed',
      limit: QUERY_PAGE_SIZE.activity,
      offset: 0,
    });
  });

  it('does not retry auth errors', async () => {
    useConfigStatus.mockReturnValue({ status: 'present', config });
    getActivity.mockRejectedValue(new ApiError({ kind: 'auth', message: 'auth failed', status: 401 }));

    const { result } = renderHook(() => useActivityQuery(), { wrapper: wrapperFactory() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(getActivity).toHaveBeenCalledTimes(1);
  });
});
