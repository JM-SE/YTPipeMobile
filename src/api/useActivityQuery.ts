import { useInfiniteQuery } from '@tanstack/react-query';

import { useConfigStatus } from '../config/ConfigStatusContext';
import { ApiError } from './errors';
import { getActivity } from './mobileApi';
import { queryKeys, QUERY_PAGE_SIZE } from './queryKeys';
import { requireActiveConfig, retryTransientApiError } from './queryGuards';
import type { ActivityResponse, ActivityStatusFilter } from './types';

type UseActivityQueryParams = {
  status?: ActivityStatusFilter;
};

export function useActivityQuery({ status = 'all' }: UseActivityQueryParams = {}) {
  const { status: configStatus, config } = useConfigStatus();
  const enabled = configStatus === 'present' && Boolean(config);
  const baseUrl = config?.apiBaseUrl ?? 'no-config';

  return useInfiniteQuery<ActivityResponse, ApiError>({
    queryKey: queryKeys.activityInfinite(baseUrl, status),
    queryFn: ({ pageParam }) =>
      getActivity(requireActiveConfig(config), {
        status,
        limit: QUERY_PAGE_SIZE.activity,
        offset: typeof pageParam === 'number' ? pageParam : 0,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((count, page) => count + page.items.length, 0);
      return loaded < lastPage.pagination.total ? loaded : undefined;
    },
    enabled,
    retry: (failureCount, error) => retryTransientApiError(failureCount, error),
    placeholderData: (previousData) => previousData,
  });
}
