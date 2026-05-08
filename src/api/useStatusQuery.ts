import { useQuery } from '@tanstack/react-query';

import { useConfigStatus } from '../config/ConfigStatusContext';
import { ApiError } from './errors';
import { getStatus } from './mobileApi';
import { queryKeys } from './queryKeys';
import { requireActiveConfig, retryTransientApiError } from './queryGuards';
import type { StatusResponse } from './types';

export function useStatusQuery() {
  const { status, config } = useConfigStatus();
  const enabled = status === 'present' && Boolean(config);
  const baseUrl = config?.apiBaseUrl ?? 'no-config';

  return useQuery<StatusResponse, ApiError>({
    queryKey: queryKeys.status(baseUrl),
    queryFn: () => getStatus(requireActiveConfig(config)),
    enabled,
    refetchInterval: enabled ? 30_000 : false,
    retry: (failureCount, error) => retryTransientApiError(failureCount, error),
    placeholderData: (previousData) => previousData,
  });
}
