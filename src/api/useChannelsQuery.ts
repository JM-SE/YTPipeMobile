import { useInfiniteQuery } from '@tanstack/react-query';

import { useConfigStatus } from '../config/ConfigStatusContext';
import { ApiError } from './errors';
import { getChannels } from './mobileApi';
import type { ChannelsResponse, MonitoringFilter } from './types';

export const CHANNELS_PAGE_SIZE = 25;

type UseChannelsQueryParams = {
  monitoring?: MonitoringFilter;
  query?: string;
};

function canRetry(error: ApiError, failureCount: number) {
  if (failureCount >= 1) return false;
  return error.kind === 'network' || error.kind === 'timeout' || error.kind === 'server';
}

export function channelsInfiniteQueryKey(baseUrl: string, monitoring: MonitoringFilter, query: string) {
  return ['channels', baseUrl, monitoring, query, CHANNELS_PAGE_SIZE] as const;
}

export function useChannelsQuery({ monitoring = 'monitored', query = '' }: UseChannelsQueryParams = {}) {
  const { status, config } = useConfigStatus();
  const enabled = status === 'present' && Boolean(config);
  const baseUrl = config?.apiBaseUrl ?? 'no-config';
  const normalizedQuery = query.trim();

  return useInfiniteQuery<ChannelsResponse, ApiError>({
    queryKey: channelsInfiniteQueryKey(baseUrl, monitoring, normalizedQuery),
    queryFn: ({ pageParam }) =>
      getChannels(config!, {
        monitoring,
        query: normalizedQuery || undefined,
        limit: CHANNELS_PAGE_SIZE,
        offset: typeof pageParam === 'number' ? pageParam : 0,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((count, page) => count + page.channels.length, 0);
      return loaded < lastPage.pagination.total ? loaded : undefined;
    },
    enabled,
    retry: (failureCount, error) => canRetry(error, failureCount),
    placeholderData: (previousData) => previousData,
  });
}
