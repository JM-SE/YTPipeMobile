export type DeliveryStatus = 'pending' | 'delivered' | 'pending_retry' | 'failed';

export type MonitoringFilter = 'monitored' | 'unmonitored' | 'all';

export type MobilePushPlatform = 'ios' | 'android' | 'unknown';

export type RunOutcome = 'success' | 'partial_failure' | 'quota_blocked' | 'no_new_videos';

export interface FastApiError {
  detail: string | Array<Record<string, unknown>>;
}

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

export interface MonitoringUpdateResponse {
  channel_id: number;
  is_monitored: boolean;
  last_seen_video_id: string | null;
  baseline_established_at: string | null;
}

export interface PollResult {
  run_outcome: RunOutcome;
  channels_processed: number;
  channels_failed: number;
  baselines_established: number;
  new_videos_detected: number;
  quota_blocked: boolean;
  channel_errors: string[];
}

export interface SyncResult {
  status: 'success';
  channels_imported: number;
  channels_created: number;
  channels_updated: number;
}

export interface StatusResponse {
  service: 'ytpipe';
  environment: 'mock';
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

export interface MockPushGlobalSettings {
  enabled: boolean;
  default_for_monitored_channels: boolean;
  first_enabled_at: string | null;
  updated_at: string | null;
}

export interface MockPushInstallation {
  installation_id: string;
  expo_push_token: string;
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

export interface MockPushDeliveryStatus {
  last_attempt_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  last_expo_ticket_id: string | null;
  last_expo_status: string | null;
  last_receipt_checked_at: string | null;
}

export interface MockPushPreference {
  explicit_push_enabled: boolean;
  updated_at: string;
}
