import type { ApiClientConfig } from './client';
import { apiRequest } from './client';
import type {
  ActivityQuery,
  ActivityResponse,
  ChannelsQuery,
  ChannelsResponse,
  PollResult,
  StatusResponse,
  SyncResult,
  UpdateChannelMonitoringPayload,
  UpdateChannelMonitoringResponse,
} from './types';

export function getStatus(config: ApiClientConfig): Promise<StatusResponse> {
  return apiRequest<StatusResponse>(config, '/status', { method: 'GET' });
}

export function getChannels(config: ApiClientConfig, query: ChannelsQuery = {}): Promise<ChannelsResponse> {
  return apiRequest<ChannelsResponse>(config, '/internal/channels', {
    method: 'GET',
    query: query as Record<string, string | number | boolean | undefined>,
  });
}

export function updateChannelMonitoring(
  config: ApiClientConfig,
  channelId: number,
  payload: UpdateChannelMonitoringPayload,
): Promise<UpdateChannelMonitoringResponse> {
  return apiRequest<UpdateChannelMonitoringResponse>(config, `/internal/channels/${channelId}/monitoring`, {
    method: 'PATCH',
    body: payload,
  });
}

export function syncSubscriptions(config: ApiClientConfig): Promise<SyncResult> {
  return apiRequest<SyncResult>(config, '/internal/subscriptions/sync', {
    method: 'POST',
  });
}

export function runPoll(config: ApiClientConfig): Promise<PollResult> {
  return apiRequest<PollResult>(config, '/internal/run-poll', {
    method: 'POST',
  });
}

export function getActivity(config: ApiClientConfig, query: ActivityQuery = {}): Promise<ActivityResponse> {
  return apiRequest<ActivityResponse>(config, '/internal/activity', {
    method: 'GET',
    query: query as Record<string, string | number | boolean | undefined>,
  });
}
