import { useQuery } from '@tanstack/react-query';

import { useConfigStatus } from '../config/ConfigStatusContext';
import { ApiError } from './errors';
import { getStatus } from './mobileApi';
import { queryKeys } from './queryKeys';
import type { StatusResponse } from './types';

function canRetry(error: ApiError, failureCount: number) {
  if (failureCount >= 1) return false;
  if (error.kind === 'network' || error.kind === 'timeout' || error.kind === 'server') return true;
  return false;
}

export function useStatusQuery() {
  const { status, config } = useConfigStatus();
  const enabled = status === 'present' && Boolean(config);
  const baseUrl = config?.apiBaseUrl ?? 'no-config';

  return useQuery<StatusResponse, ApiError>({
    queryKey: queryKeys.status(baseUrl),
    queryFn: () => getStatus(config!),
    enabled,
    refetchInterval: enabled ? 30_000 : false,
    retry: (failureCount, error) => canRetry(error, failureCount),
    placeholderData: (previousData) => previousData,
  });
}
