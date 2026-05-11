import { useInfiniteQuery } from '@tanstack/react-query';

import { ApiError } from '../api/errors';
import { getMobilePushChannelPreferences } from '../api/mobilePushApi';
import { queryKeys, QUERY_PAGE_SIZE } from '../api/queryKeys';
import { requireActiveConfig, retryTransientApiError } from '../api/queryGuards';
import type { MobilePushChannelPreferenceMonitoring, MobilePushChannelPreferencesResponse } from '../api/types';
import { MOBILE_PUSH_CHANNEL_PREFERENCE_MONITORING } from '../api/types';
import { useConfigStatus } from '../config/ConfigStatusContext';

type UseMobilePushChannelPreferencesQueryParams = {
  monitoring?: MobilePushChannelPreferenceMonitoring;
  query?: string;
};

export function useMobilePushChannelPreferencesQuery({
  monitoring = MOBILE_PUSH_CHANNEL_PREFERENCE_MONITORING.MONITORED,
  query = '',
}: UseMobilePushChannelPreferencesQueryParams = {}) {
  const { config, status } = useConfigStatus();
  const enabled = status === 'present' && Boolean(config);
  const baseUrl = config?.apiBaseUrl ?? 'no-config';
  const normalizedQuery = query.trim();

  return useInfiniteQuery<MobilePushChannelPreferencesResponse, ApiError>({
    queryKey: queryKeys.mobilePush.channelPreferences(baseUrl, monitoring, normalizedQuery),
    queryFn: ({ pageParam }) =>
      getMobilePushChannelPreferences(requireActiveConfig(config), {
        monitoring,
        query: normalizedQuery || undefined,
        limit: QUERY_PAGE_SIZE.mobilePushChannelPreferences,
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
