import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useConfigStatus } from '../config/ConfigStatusContext';
import { ApiError } from './errors';
import { runPoll, syncSubscriptions } from './mobileApi';
import { queryKeys } from './queryKeys';
import { requireActiveConfig } from './queryGuards';
import type { PollResult, SyncResult } from './types';

export function useSyncSubscriptionsMutation() {
  const { config } = useConfigStatus();
  const queryClient = useQueryClient();

  return useMutation<SyncResult, ApiError>({
    mutationKey: ['manualAction', 'sync'],
    retry: false,
    mutationFn: () => syncSubscriptions(requireActiveConfig(config)),
    onSettled: async () => {
      if (!config) return;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.status(config.apiBaseUrl) }),
        queryClient.invalidateQueries({ predicate: (query) => queryKeys.isChannels(query.queryKey) }),
      ]);
    },
  });
}

export function useRunPollMutation() {
  const { config } = useConfigStatus();
  const queryClient = useQueryClient();

  return useMutation<PollResult, ApiError>({
    mutationKey: ['manualAction', 'poll'],
    retry: false,
    mutationFn: () => runPoll(requireActiveConfig(config)),
    onSettled: async () => {
      if (!config) return;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.status(config.apiBaseUrl) }),
        queryClient.invalidateQueries({ predicate: (query) => queryKeys.isChannels(query.queryKey) }),
        queryClient.invalidateQueries({ predicate: (query) => queryKeys.isActivity(query.queryKey) }),
      ]);
    },
  });
}
