import type { ActivityStatusFilter, MobilePushChannelPreferenceMonitoring, MonitoringFilter } from './types';

export const QUERY_PAGE_SIZE = {
  channels: 25,
  activity: 25,
  mobilePushChannelPreferences: 25,
} as const;

export const QUERY_ROOT = {
  status: 'status',
  channels: 'channels',
  activity: 'activity',
  mobilePush: 'mobilePush',
} as const;

export const queryKeys = {
  status: (baseUrl: string) => [QUERY_ROOT.status, baseUrl] as const,
  channelsInfinite: (baseUrl: string, monitoring: MonitoringFilter, query: string) =>
    [QUERY_ROOT.channels, baseUrl, monitoring, query, QUERY_PAGE_SIZE.channels] as const,
  activityInfinite: (baseUrl: string, status: ActivityStatusFilter) =>
    [QUERY_ROOT.activity, baseUrl, status, QUERY_PAGE_SIZE.activity] as const,
  mobilePush: {
    all: (baseUrl: string) => [QUERY_ROOT.mobilePush, baseUrl] as const,
    status: (baseUrl: string, installationId: string) => [QUERY_ROOT.mobilePush, baseUrl, 'status', installationId] as const,
    channelPreferences: (baseUrl: string, monitoring: MobilePushChannelPreferenceMonitoring, query: string) =>
      [QUERY_ROOT.mobilePush, baseUrl, 'channelPreferences', monitoring, query, QUERY_PAGE_SIZE.mobilePushChannelPreferences] as const,
  },
  isChannels: (queryKey: readonly unknown[]) => queryKey[0] === QUERY_ROOT.channels,
  isActivity: (queryKey: readonly unknown[]) => queryKey[0] === QUERY_ROOT.activity,
  isMobilePush: (queryKey: readonly unknown[]) => queryKey[0] === QUERY_ROOT.mobilePush,
} as const;
