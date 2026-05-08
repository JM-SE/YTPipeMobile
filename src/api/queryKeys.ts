import type { ActivityStatusFilter, MonitoringFilter } from './types';

export const QUERY_PAGE_SIZE = {
  channels: 25,
  activity: 25,
} as const;

export const QUERY_ROOT = {
  status: 'status',
  channels: 'channels',
  activity: 'activity',
} as const;

export const queryKeys = {
  status: (baseUrl: string) => [QUERY_ROOT.status, baseUrl] as const,
  channelsInfinite: (baseUrl: string, monitoring: MonitoringFilter, query: string) =>
    [QUERY_ROOT.channels, baseUrl, monitoring, query, QUERY_PAGE_SIZE.channels] as const,
  activityInfinite: (baseUrl: string, status: ActivityStatusFilter) =>
    [QUERY_ROOT.activity, baseUrl, status, QUERY_PAGE_SIZE.activity] as const,
  isChannels: (queryKey: readonly unknown[]) => queryKey[0] === QUERY_ROOT.channels,
  isActivity: (queryKey: readonly unknown[]) => queryKey[0] === QUERY_ROOT.activity,
} as const;
