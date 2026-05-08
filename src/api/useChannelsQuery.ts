import { useInfiniteQuery } from '@tanstack/react-query';

import { useConfigStatus } from '../config/ConfigStatusContext';
import { ApiError } from './errors';
import { getChannels } from './mobileApi';
import { queryKeys, QUERY_PAGE_SIZE } from './queryKeys';
import { requireActiveConfig, retryTransientApiError } from './queryGuards';
import type { ChannelsResponse, MonitoringFilter } from './types';

type UseChannelsQueryParams = {
  monitoring?: MonitoringFilter;
  query?: string;
};

export function useChannelsQuery({ monitoring = 'monitored', query = '' }: UseChannelsQueryParams = {}) {
  const { status, config } = useConfigStatus();
  const enabled = status === 'present' && Boolean(config);
  const baseUrl = config?.apiBaseUrl ?? 'no-config';
  const normalizedQuery = query.trim();

  return useInfiniteQuery<ChannelsResponse, ApiError>({
    queryKey: queryKeys.channelsInfinite(baseUrl, monitoring, normalizedQuery),
    queryFn: ({ pageParam }) =>
      getChannels(requireActiveConfig(config), {
        monitoring,
        query: normalizedQuery || undefined,
        limit: QUERY_PAGE_SIZE.channels,
        offset: typeof pageParam === 'number' ? pageParam : 0,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((count, page) => count + page.channels.length, 0);
      return loaded < lastPage.pagination.total ? loaded : undefined;
    },
    enabled,
    retry: (failureCount, error) => retryTransientApiError(failureCount, error),
    placeholderData: (previousData) => previousData,
  });
}
