import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import { ApiError } from '../api/errors';
import { useStatusQuery } from '../api/useStatusQuery';

jest.mock('../config/ConfigStatusContext', () => ({
  useConfigStatus: jest.fn(),
}));

jest.mock('../api/mobileApi', () => ({
  getStatus: jest.fn(),
}));

const { useConfigStatus } = jest.requireMock('../config/ConfigStatusContext') as {
  useConfigStatus: jest.Mock;
};

const { getStatus } = jest.requireMock('../api/mobileApi') as {
  getStatus: jest.Mock;
};

function wrapperFactory() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useStatusQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stays disabled when config is missing', () => {
    useConfigStatus.mockReturnValue({ status: 'missing', config: null });

    const { result } = renderHook(() => useStatusQuery(), { wrapper: wrapperFactory() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(getStatus).not.toHaveBeenCalled();
  });

  it('runs query when config is present', async () => {
    useConfigStatus.mockReturnValue({
      status: 'present',
      config: { apiBaseUrl: 'http://10.0.2.2:4000', mobileApiToken: 'dev-mobile-token' },
    });
    getStatus.mockResolvedValue({ environment: 'mock', ready: true });

    const { result } = renderHook(() => useStatusQuery(), { wrapper: wrapperFactory() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getStatus).toHaveBeenCalled();
  });

  it('does not retry auth errors', async () => {
    useConfigStatus.mockReturnValue({
      status: 'present',
      config: { apiBaseUrl: 'http://10.0.2.2:4000', mobileApiToken: 'dev-mobile-token' },
    });
    getStatus.mockRejectedValue(new ApiError({ kind: 'auth', message: 'auth fail', status: 401 }));

    const { result } = renderHook(() => useStatusQuery(), { wrapper: wrapperFactory() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(getStatus).toHaveBeenCalledTimes(1);
  });
});
