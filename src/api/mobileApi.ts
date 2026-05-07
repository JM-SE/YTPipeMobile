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
import { parseApiResponse } from './validation/parseResponse';
import {
  activityResponseSchema,
  channelsResponseSchema,
  pollResultResponseSchema,
  statusResponseSchema,
  syncResultSchema,
  updateChannelMonitoringResponseSchema,
} from './validation/schemas';

export async function getStatus(config: ApiClientConfig): Promise<StatusResponse> {
  const response = await apiRequest<unknown>(config, '/status', { method: 'GET' });
  return parseApiResponse(statusResponseSchema, response, 'GET /status', config.mobileApiToken);
}

export async function getChannels(config: ApiClientConfig, query: ChannelsQuery = {}): Promise<ChannelsResponse> {
  const response = await apiRequest<unknown>(config, '/internal/channels', {
    method: 'GET',
    query: query as Record<string, string | number | boolean | undefined>,
  });
  return parseApiResponse(channelsResponseSchema, response, 'GET /internal/channels', config.mobileApiToken);
}

export async function updateChannelMonitoring(
  config: ApiClientConfig,
  channelId: number,
  payload: UpdateChannelMonitoringPayload,
): Promise<UpdateChannelMonitoringResponse> {
  const response = await apiRequest<unknown>(config, `/internal/channels/${channelId}/monitoring`, {
    method: 'PATCH',
    body: payload,
  });
  return parseApiResponse(
    updateChannelMonitoringResponseSchema,
    response,
    'PATCH /internal/channels/{id}/monitoring',
    config.mobileApiToken,
  );
}

export async function syncSubscriptions(config: ApiClientConfig): Promise<SyncResult> {
  const response = await apiRequest<unknown>(config, '/internal/subscriptions/sync', {
    method: 'POST',
  });
  return parseApiResponse(syncResultSchema, response, 'POST /internal/subscriptions/sync', config.mobileApiToken);
}

export async function runPoll(config: ApiClientConfig): Promise<PollResult> {
  const response = await apiRequest<unknown>(config, '/internal/run-poll', {
    method: 'POST',
  });
  return parseApiResponse(pollResultResponseSchema, response, 'POST /internal/run-poll', config.mobileApiToken);
}

export async function getActivity(config: ApiClientConfig, query: ActivityQuery = {}): Promise<ActivityResponse> {
  const response = await apiRequest<unknown>(config, '/internal/activity', {
    method: 'GET',
    query: query as Record<string, string | number | boolean | undefined>,
  });
  return parseApiResponse(activityResponseSchema, response, 'GET /internal/activity', config.mobileApiToken);
}
