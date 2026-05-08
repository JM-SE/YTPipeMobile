import { InfiniteData, QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';

import { useConfigStatus } from '../config/ConfigStatusContext';
import { ApiError } from './errors';
import { updateChannelMonitoring } from './mobileApi';
import { queryKeys } from './queryKeys';
import { requireActiveConfig } from './queryGuards';
import type { ChannelsResponse } from './types';

type Variables = {
  channelId: number;
  isMonitored: boolean;
};

type Snapshot = Array<[readonly unknown[], InfiniteData<ChannelsResponse> | undefined]>;

function updateChannelInPages(data: InfiniteData<ChannelsResponse> | undefined, variables: Variables) {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      channels: page.channels.map((channel) =>
        channel.channel_id === variables.channelId
          ? { ...channel, is_monitored: variables.isMonitored }
          : channel,
      ),
    })),
  } satisfies InfiniteData<ChannelsResponse>;
}

function restoreSnapshots(queryClient: QueryClient, snapshots: Snapshot | undefined) {
  snapshots?.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
}

export function useUpdateChannelMonitoringMutation() {
  const { config } = useConfigStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId, isMonitored }: Variables) =>
      updateChannelMonitoring(requireActiveConfig(config), channelId, { is_monitored: isMonitored }),
    onMutate: async (variables): Promise<Snapshot> => {
      await queryClient.cancelQueries({ predicate: (query) => queryKeys.isChannels(query.queryKey) });

      const snapshots = queryClient.getQueriesData<InfiniteData<ChannelsResponse>>({
        predicate: (query) => queryKeys.isChannels(query.queryKey),
      });

      snapshots.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, updateChannelInPages(data, variables));
      });

      return snapshots;
    },
    onError: (_error: ApiError, _variables, snapshots) => {
      restoreSnapshots(queryClient, snapshots);
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ predicate: (query) => queryKeys.isChannels(query.queryKey) }),
        config ? queryClient.invalidateQueries({ queryKey: queryKeys.status(config.apiBaseUrl) }) : Promise.resolve(),
      ]);
    },
  });
}
