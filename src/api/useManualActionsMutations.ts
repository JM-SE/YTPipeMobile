import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useConfigStatus } from '../config/ConfigStatusContext';
import { ApiError } from './errors';
import { runPoll, syncSubscriptions } from './mobileApi';
import { queryKeys } from './queryKeys';
import type { PollResult, SyncResult } from './types';

function isChannelsQuery(queryKey: readonly unknown[]) {
  return queryKey[0] === 'channels';
}

function isActivityQuery(queryKey: readonly unknown[]) {
  return queryKey[0] === 'activity';
}

function missingConfigError() {
  return new ApiError({
    kind: 'validation',
    message: 'API configuration is missing. Open Settings and save a valid API base URL and mobile token.',
  });
}

export function useSyncSubscriptionsMutation() {
  const { config } = useConfigStatus();
  const queryClient = useQueryClient();

  return useMutation<SyncResult, ApiError>({
    mutationKey: ['manualAction', 'sync'],
    retry: false,
    mutationFn: () => {
      if (!config) throw missingConfigError();
      return syncSubscriptions(config);
    },
    onSettled: async () => {
      if (!config) return;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.status(config.apiBaseUrl) }),
        queryClient.invalidateQueries({ predicate: (query) => isChannelsQuery(query.queryKey) }),
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
    mutationFn: () => {
      if (!config) throw missingConfigError();
      return runPoll(config);
    },
    onSettled: async () => {
      if (!config) return;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.status(config.apiBaseUrl) }),
        queryClient.invalidateQueries({ predicate: (query) => isChannelsQuery(query.queryKey) }),
        queryClient.invalidateQueries({ predicate: (query) => isActivityQuery(query.queryKey) }),
      ]);
    },
  });
}
