export type MonitoringFilter = 'monitored' | 'unmonitored' | 'all';
export type ActivityStatusFilter = 'all' | 'pending' | 'delivered' | 'pending_retry' | 'failed';
export type DeliveryStatus = 'pending' | 'delivered' | 'pending_retry' | 'failed';

export interface Pagination {
  limit: number;
  offset: number;
  total: number;
}

export interface LatestDetectedVideo {
  video_id: number;
  youtube_video_id: string;
  title: string;
  youtube_url: string;
  published_at: string;
}

export interface Channel {
  channel_id: number;
  youtube_channel_id: string;
  title: string;
  is_monitored: boolean;
  last_seen_video_id: string | null;
  baseline_established_at: string | null;
  latest_detected_video: LatestDetectedVideo | null;
}

export interface ChannelsResponse {
  channels: Channel[];
  pagination: Pagination;
}

export interface UpdateChannelMonitoringPayload {
  is_monitored: boolean;
}

export interface UpdateChannelMonitoringResponse {
  channel_id: number;
  is_monitored: boolean;
  last_seen_video_id: string | null;
  baseline_established_at: string | null;
}

export interface PollResult {
  run_outcome: string;
  channels_processed: number;
  channels_failed: number;
  baselines_established: number;
  new_videos_detected: number;
  quota_blocked: boolean;
  channel_errors?: string[];
}

export interface SyncResult {
  status: string;
  channels_imported?: number;
  channels_created?: number;
  channels_updated?: number;
}

export interface StatusResponse {
  service: string;
  environment: string;
  ready: boolean;
  subscription_sync: {
    last_success_at: string | null;
    last_error_at: string | null;
    last_error_message: string | null;
    metadata: Record<string, unknown>;
  };
  polling: {
    last_success_at: string | null;
    last_error_at: string | null;
    last_error_message: string | null;
    last_run: PollResult | null;
  };
  email: {
    last_attempt_at: string | null;
    last_success_at: string | null;
    last_failure_at: string | null;
    last_error: string | null;
    pending_count: number;
    pending_retry_count: number;
    delivered_count: number;
    failed_count: number;
  };
  quota: {
    daily_quota_budget: number;
    estimated_units_used_today: number;
    last_run_estimated_units: number;
    safety_stop_active: boolean;
    safety_stop_enabled: boolean;
    safety_stop_triggered_at: string | null;
  };
  channels: {
    imported_count: number;
    monitored_count: number;
  };
}

export interface ActivityItem {
  activity_id: number;
  delivery_id: number;
  video_id: number;
  youtube_video_id: string;
  video_title: string;
  youtube_url: string;
  channel_id: number;
  channel_title: string;
  delivery_status: DeliveryStatus;
  published_at: string;
  detected_at: string;
  last_attempt_at: string | null;
  last_error: string | null;
}

export interface ActivityResponse {
  items: ActivityItem[];
  pagination: Pagination;
}

export interface ChannelsQuery {
  monitoring?: MonitoringFilter;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityQuery {
  status?: ActivityStatusFilter;
  limit?: number;
  offset?: number;
}

export type MobilePushPlatform = 'ios' | 'android' | 'unknown';

export interface MobilePushGlobalStatusDto {
  enabled: boolean;
  default_for_monitored_channels: boolean;
  first_enabled_at: string | null;
  updated_at: string | null;
}

export interface MobilePushInstallationStatusDto {
  installation_id: string;
  registered: boolean;
  enabled: boolean;
  platform: MobilePushPlatform;
  app_version: string | null;
  build_number: string | null;
  device_name: string | null;
  token_masked: string | null;
  last_registered_at: string | null;
  last_seen_at: string | null;
  last_unregistered_at: string | null;
}

export interface MobilePushDeliveryStatusDto {
  last_attempt_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  last_expo_ticket_id: string | null;
  last_expo_status: string | null;
  last_receipt_checked_at: string | null;
}

export interface MobilePushStatusResponse {
  global: MobilePushGlobalStatusDto;
  installation: MobilePushInstallationStatusDto;
  delivery: MobilePushDeliveryStatusDto;
}

export interface RegisterMobilePushInstallationRequest {
  installation_id: string;
  expo_push_token: string;
  platform: MobilePushPlatform;
  app_version: string | null;
  build_number: string | null;
  device_name: string | null;
}

export interface RegisterMobilePushInstallationResponse {
  installation_id: string;
  registered: boolean;
  enabled: boolean;
  global_enabled: boolean;
  token_masked: string | null;
  last_registered_at: string | null;
}

export interface UnregisterMobilePushInstallationResponse {
  installation_id: string;
  registered: boolean;
  enabled: boolean;
  unregistered_at: string | null;
}

export interface PatchMobilePushSettingsRequest {
  enabled: boolean;
  default_for_monitored_channels: boolean;
}

export interface PatchMobilePushSettingsResponse {
  enabled: boolean;
  default_for_monitored_channels: boolean;
  first_enabled_at: string | null;
  updated_at: string | null;
  monitored_channels_effectively_enabled_count: number;
}

export interface SendMobilePushTestRequest {
  installation_id: string;
}

export interface SendMobilePushTestResponse {
  sent: boolean;
  installation_id: string;
  event_type: 'test';
  last_attempt_at: string | null;
  expo_status: string | null;
  expo_ticket_id: string | null;
  message: string;
}

export const MOBILE_PUSH_CHANNEL_PREFERENCE_MONITORING = {
  MONITORED: 'monitored',
  ALL: 'all',
} as const;

export type MobilePushChannelPreferenceMonitoring =
  (typeof MOBILE_PUSH_CHANNEL_PREFERENCE_MONITORING)[keyof typeof MOBILE_PUSH_CHANNEL_PREFERENCE_MONITORING];

export interface MobilePushChannelPreferenceValue {
  explicitly_set: boolean;
  explicit_push_enabled: boolean | null;
  updated_at: string | null;
}

export interface MobilePushChannelPreference {
  channel_id: number;
  youtube_channel_id: string;
  title: string;
  is_monitored: boolean;
  push_eligible: boolean;
  push_enabled: boolean;
  preference: MobilePushChannelPreferenceValue;
}

export interface MobilePushChannelPreferencesResponse {
  channels: MobilePushChannelPreference[];
  pagination: Pagination;
}

export interface MobilePushChannelPreferencesQueryParams {
  monitoring?: MobilePushChannelPreferenceMonitoring;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface PatchMobilePushChannelPreferenceRequest {
  push_enabled: boolean;
}

export type PatchMobilePushChannelPreferenceResponse = MobilePushChannelPreference;
