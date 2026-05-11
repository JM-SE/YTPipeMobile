import { InfiniteData, QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '../api/errors';
import { patchMobilePushChannelPreference } from '../api/mobilePushApi';
import { queryKeys } from '../api/queryKeys';
import { requireActiveConfig } from '../api/queryGuards';
import type { MobilePushChannelPreferencesResponse, PatchMobilePushChannelPreferenceResponse } from '../api/types';
import { useConfigStatus } from '../config/ConfigStatusContext';
import { useConnectivityStatus } from '../connectivity/ConnectivityContext';

type Variables = {
  channelId: number;
  pushEnabled: boolean;
};

type Snapshot = Array<[readonly unknown[], InfiniteData<MobilePushChannelPreferencesResponse> | undefined]>;

function offlineError() {
  return new ApiError({
    kind: 'network',
    message: 'Reconnect before changing push preferences.',
  });
}

function isMobilePushChannelPreferencesKey(queryKey: readonly unknown[]) {
  return queryKey[0] === 'mobilePush' && queryKey[2] === 'channelPreferences';
}

function updatePreferenceInPages(
  data: InfiniteData<MobilePushChannelPreferencesResponse> | undefined,
  updatedPreference: PatchMobilePushChannelPreferenceResponse,
) {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      channels: page.channels.map((channel) =>
        channel.channel_id === updatedPreference.channel_id ? updatedPreference : channel,
      ),
    })),
  } satisfies InfiniteData<MobilePushChannelPreferencesResponse>;
}

function optimisticallyUpdatePreferenceInPages(
  data: InfiniteData<MobilePushChannelPreferencesResponse> | undefined,
  variables: Variables,
) {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      channels: page.channels.map((channel) =>
        channel.channel_id === variables.channelId
          ? {
              ...channel,
              push_enabled: variables.pushEnabled,
              preference: {
                ...channel.preference,
                explicitly_set: true,
                explicit_push_enabled: variables.pushEnabled,
              },
            }
          : channel,
      ),
    })),
  } satisfies InfiniteData<MobilePushChannelPreferencesResponse>;
}

function restoreSnapshots(queryClient: QueryClient, snapshots: Snapshot | undefined) {
  snapshots?.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
}

export function usePatchMobilePushChannelPreferenceMutation() {
  const { config } = useConfigStatus();
  const { isOffline } = useConnectivityStatus();
  const queryClient = useQueryClient();

  return useMutation<PatchMobilePushChannelPreferenceResponse, ApiError, Variables, Snapshot>({
    mutationKey: ['mobilePush', 'channelPreference'],
    mutationFn: ({ channelId, pushEnabled }) => {
      if (isOffline) throw offlineError();
      return patchMobilePushChannelPreference(requireActiveConfig(config), channelId, { push_enabled: pushEnabled });
    },
    retry: false,
    onMutate: async (variables): Promise<Snapshot> => {
      await queryClient.cancelQueries({ predicate: (query) => isMobilePushChannelPreferencesKey(query.queryKey) });

      const snapshots = queryClient.getQueriesData<InfiniteData<MobilePushChannelPreferencesResponse>>({
        predicate: (query) => isMobilePushChannelPreferencesKey(query.queryKey),
      });

      snapshots.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, optimisticallyUpdatePreferenceInPages(data, variables));
      });

      return snapshots;
    },
    onSuccess: (updatedPreference) => {
      queryClient.getQueriesData<InfiniteData<MobilePushChannelPreferencesResponse>>({
        predicate: (query) => isMobilePushChannelPreferencesKey(query.queryKey),
      }).forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, updatePreferenceInPages(data, updatedPreference));
      });
    },
    onError: (_error, _variables, snapshots) => {
      restoreSnapshots(queryClient, snapshots);
    },
    onSettled: async () => {
      if (!config) return;

      await Promise.all([
        queryClient.invalidateQueries({ predicate: (query) => isMobilePushChannelPreferencesKey(query.queryKey) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.mobilePush.all(config.apiBaseUrl) }),
      ]);
    },
  });
}
