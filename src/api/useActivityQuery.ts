import { useInfiniteQuery } from '@tanstack/react-query';

import { useConfigStatus } from '../config/ConfigStatusContext';
import { ApiError } from './errors';
import { getActivity } from './mobileApi';
import type { ActivityResponse, ActivityStatusFilter } from './types';

export const ACTIVITY_PAGE_SIZE = 25;

type UseActivityQueryParams = {
  status?: ActivityStatusFilter;
};

function canRetry(error: ApiError, failureCount: number) {
  if (failureCount >= 1) return false;
  return error.kind === 'network' || error.kind === 'timeout' || error.kind === 'server';
}

export function activityInfiniteQueryKey(baseUrl: string, status: ActivityStatusFilter) {
  return ['activity', baseUrl, status, ACTIVITY_PAGE_SIZE] as const;
}

export function useActivityQuery({ status = 'all' }: UseActivityQueryParams = {}) {
  const { status: configStatus, config } = useConfigStatus();
  const enabled = configStatus === 'present' && Boolean(config);
  const baseUrl = config?.apiBaseUrl ?? 'no-config';

  return useInfiniteQuery<ActivityResponse, ApiError>({
    queryKey: activityInfiniteQueryKey(baseUrl, status),
    queryFn: ({ pageParam }) =>
      getActivity(config!, {
        status,
        limit: ACTIVITY_PAGE_SIZE,
        offset: typeof pageParam === 'number' ? pageParam : 0,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((count, page) => count + page.items.length, 0);
      return loaded < lastPage.pagination.total ? loaded : undefined;
    },
    enabled,
    retry: (failureCount, error) => canRetry(error, failureCount),
    placeholderData: (previousData) => previousData,
  });
}
