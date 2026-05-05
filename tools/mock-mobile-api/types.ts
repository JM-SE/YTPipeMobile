export type DeliveryStatus = 'pending' | 'delivered' | 'pending_retry' | 'failed';

export type MonitoringFilter = 'monitored' | 'unmonitored' | 'all';

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
