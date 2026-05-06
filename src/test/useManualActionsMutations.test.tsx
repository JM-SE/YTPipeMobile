import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import { useRunPollMutation, useSyncSubscriptionsMutation } from '../api/useManualActionsMutations';

jest.mock('../config/ConfigStatusContext', () => ({
  useConfigStatus: jest.fn(),
}));

jest.mock('../api/mobileApi', () => ({
  syncSubscriptions: jest.fn(),
  runPoll: jest.fn(),
}));

const { useConfigStatus } = jest.requireMock('../config/ConfigStatusContext') as {
  useConfigStatus: jest.Mock;
};

const { syncSubscriptions, runPoll } = jest.requireMock('../api/mobileApi') as {
  syncSubscriptions: jest.Mock;
  runPoll: jest.Mock;
};

const config = { apiBaseUrl: 'http://10.0.2.2:4000', mobileApiToken: 'dev-mobile-token' };

function wrapperFactory(queryClient: QueryClient) {
  return ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('manual action mutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useConfigStatus.mockReturnValue({ config });
  });

  it('sync subscriptions calls endpoint and invalidates status plus channels queries', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    syncSubscriptions.mockResolvedValue({ status: 'ok', channels_imported: 3 });

    const { result } = renderHook(() => useSyncSubscriptionsMutation(), { wrapper: wrapperFactory(queryClient) });

    await act(async () => {
      await result.current.mutateAsync();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(syncSubscriptions).toHaveBeenCalledWith(config);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['status', config.apiBaseUrl] });

    const channelsInvalidation = invalidateSpy.mock.calls.find(([filters]) =>
      Boolean((filters as { predicate?: unknown }).predicate),
    );
    const predicate = (channelsInvalidation?.[0] as { predicate: (query: { queryKey: readonly unknown[] }) => boolean }).predicate;
    expect(predicate({ queryKey: ['channels', config.apiBaseUrl] })).toBe(true);
    expect(predicate({ queryKey: ['activity', config.apiBaseUrl] })).toBe(false);
    queryClient.clear();
  });

  it('run poll calls endpoint and invalidates status, channels, and activity queries', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    runPoll.mockResolvedValue({
      run_outcome: 'success',
      channels_processed: 2,
      channels_failed: 0,
      baselines_established: 1,
      new_videos_detected: 1,
      quota_blocked: false,
    });

    const { result } = renderHook(() => useRunPollMutation(), { wrapper: wrapperFactory(queryClient) });

    await act(async () => {
      await result.current.mutateAsync();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(runPoll).toHaveBeenCalledWith(config);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['status', config.apiBaseUrl] });

    const predicateCalls = invalidateSpy.mock.calls
      .map(([filters]) => (filters as { predicate?: (query: { queryKey: readonly unknown[] }) => boolean }).predicate)
      .filter((predicate): predicate is (query: { queryKey: readonly unknown[] }) => boolean => Boolean(predicate));

    expect(predicateCalls.some((predicate) => predicate({ queryKey: ['channels', config.apiBaseUrl] }))).toBe(true);
    expect(predicateCalls.some((predicate) => predicate({ queryKey: ['activity', config.apiBaseUrl] }))).toBe(true);
    queryClient.clear();
  });
});
