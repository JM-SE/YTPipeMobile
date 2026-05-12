import { z } from 'zod';

import type {
  ActivityResponse,
  MobilePushChannelPreference,
  MobilePushChannelPreferencesResponse,
  ChannelsResponse,
  MobilePushStatusResponse,
  PatchMobilePushSettingsResponse,
  PollResult,
  RegisterMobilePushInstallationResponse,
  SendMobilePushTestResponse,
  StatusResponse,
  SyncResult,
  UnregisterMobilePushInstallationResponse,
  UpdateChannelMonitoringResponse,
} from '../types';

const nullableStringSchema = z.string().nullable();
const metadataSchema = z.record(z.string(), z.unknown());

const paginationSchema = z
  .object({
    limit: z.number(),
    offset: z.number(),
    total: z.number(),
  })
  .loose();

const latestDetectedVideoSchema = z
  .object({
    video_id: z.number(),
    youtube_video_id: z.string(),
    title: z.string(),
    youtube_url: z.string(),
    published_at: z.string(),
  })
  .loose();

const channelSchema = z
  .object({
    channel_id: z.number(),
    youtube_channel_id: z.string(),
    title: z.string(),
    is_monitored: z.boolean(),
    last_seen_video_id: nullableStringSchema,
    baseline_established_at: nullableStringSchema,
    latest_detected_video: latestDetectedVideoSchema.nullable(),
  })
  .loose();

const pollResultSchema = z
  .object({
    run_outcome: z.string(),
    channels_processed: z.number(),
    channels_failed: z.number(),
    baselines_established: z.number(),
    new_videos_detected: z.number(),
    quota_blocked: z.boolean(),
    channel_errors: z.array(z.string()).optional(),
  })
  .loose();

export const statusResponseSchema = z
  .object({
    service: z.string(),
    environment: z.string(),
    ready: z.boolean(),
    subscription_sync: z
      .object({
        last_success_at: nullableStringSchema,
        last_error_at: nullableStringSchema,
        last_error_message: nullableStringSchema,
        metadata: metadataSchema,
      })
      .loose(),
    polling: z
      .object({
        last_success_at: nullableStringSchema,
        last_error_at: nullableStringSchema,
        last_error_message: nullableStringSchema,
        last_run: pollResultSchema.nullable(),
      })
      .loose(),
    email: z
      .object({
        last_attempt_at: nullableStringSchema,
        last_success_at: nullableStringSchema,
        last_failure_at: nullableStringSchema,
        last_error: nullableStringSchema,
        pending_count: z.number(),
        pending_retry_count: z.number(),
        delivered_count: z.number(),
        failed_count: z.number(),
      })
      .loose(),
    quota: z
      .object({
        daily_quota_budget: z.number(),
        estimated_units_used_today: z.number(),
        last_run_estimated_units: z.number(),
        safety_stop_active: z.boolean(),
        safety_stop_enabled: z.boolean(),
        safety_stop_triggered_at: nullableStringSchema,
      })
      .loose(),
    channels: z
      .object({
        imported_count: z.number(),
        monitored_count: z.number(),
      })
      .loose(),
  })
  .loose() satisfies z.ZodType<StatusResponse>;

export const channelsResponseSchema = z
  .object({
    channels: z.array(channelSchema),
    pagination: paginationSchema,
  })
  .loose() satisfies z.ZodType<ChannelsResponse>;

export const updateChannelMonitoringResponseSchema = z
  .object({
    channel_id: z.number(),
    is_monitored: z.boolean(),
    last_seen_video_id: nullableStringSchema,
    baseline_established_at: nullableStringSchema,
  })
  .loose() satisfies z.ZodType<UpdateChannelMonitoringResponse>;

export const syncResultSchema = z
  .object({
    status: z.string(),
    channels_imported: z.number().optional(),
    channels_created: z.number().optional(),
    channels_updated: z.number().optional(),
  })
  .loose() satisfies z.ZodType<SyncResult>;

export const pollResultResponseSchema = pollResultSchema satisfies z.ZodType<PollResult>;

const deliveryStatusSchema = z.enum(['pending', 'delivered', 'pending_retry', 'failed']);

const activityItemSchema = z
  .object({
    activity_id: z.number(),
    delivery_id: z.number(),
    video_id: z.number(),
    youtube_video_id: z.string(),
    video_title: z.string(),
    youtube_url: z.string(),
    channel_id: z.number(),
    channel_title: z.string(),
    delivery_status: deliveryStatusSchema,
    published_at: z.string(),
    detected_at: z.string(),
    last_attempt_at: nullableStringSchema,
    last_error: nullableStringSchema,
  })
  .loose();

export const activityResponseSchema = z
  .object({
    items: z.array(activityItemSchema),
    pagination: paginationSchema,
  })
  .loose() satisfies z.ZodType<ActivityResponse>;

const mobilePushPlatformSchema = z.enum(['ios', 'android', 'unknown']);

export const mobilePushStatusResponseSchema = z
  .object({
    global: z
      .object({
        enabled: z.boolean(),
        default_for_monitored_channels: z.boolean(),
        first_enabled_at: nullableStringSchema,
        updated_at: nullableStringSchema,
      })
      .loose(),
    installation: z
      .object({
        installation_id: z.string(),
        registered: z.boolean(),
        enabled: z.boolean(),
        platform: mobilePushPlatformSchema,
        app_version: nullableStringSchema,
        build_number: nullableStringSchema,
        device_name: nullableStringSchema,
        token_masked: nullableStringSchema,
        last_registered_at: nullableStringSchema,
        last_seen_at: nullableStringSchema,
        last_unregistered_at: nullableStringSchema,
      })
      .loose(),
    delivery: z
      .object({
        last_attempt_at: nullableStringSchema,
        last_success_at: nullableStringSchema,
        last_error: nullableStringSchema,
        last_expo_ticket_id: nullableStringSchema,
        last_expo_status: nullableStringSchema,
        last_receipt_checked_at: nullableStringSchema,
      })
      .loose(),
  })
  .loose() satisfies z.ZodType<MobilePushStatusResponse>;

export const registerMobilePushInstallationResponseSchema = z
  .object({
    installation_id: z.string(),
    registered: z.boolean(),
    enabled: z.boolean(),
    global_enabled: z.boolean(),
    token_masked: nullableStringSchema,
    last_registered_at: nullableStringSchema,
  })
  .loose() satisfies z.ZodType<RegisterMobilePushInstallationResponse>;

export const unregisterMobilePushInstallationResponseSchema = z
  .object({
    installation_id: z.string(),
    registered: z.boolean(),
    enabled: z.boolean(),
    unregistered_at: nullableStringSchema,
  })
  .loose() satisfies z.ZodType<UnregisterMobilePushInstallationResponse>;

export const patchMobilePushSettingsResponseSchema = z
  .object({
    enabled: z.boolean(),
    default_for_monitored_channels: z.boolean(),
    first_enabled_at: nullableStringSchema,
    updated_at: nullableStringSchema,
    monitored_channels_effectively_enabled_count: z.number(),
  })
  .loose() satisfies z.ZodType<PatchMobilePushSettingsResponse>;

export const sendMobilePushTestResponseSchema = z
  .object({
    sent: z.boolean(),
    installation_id: z.string(),
    event_type: z.literal('test'),
    last_attempt_at: nullableStringSchema,
    expo_status: nullableStringSchema,
    expo_ticket_id: nullableStringSchema,
    message: z.string(),
  })
  .loose() satisfies z.ZodType<SendMobilePushTestResponse>;

const mobilePushChannelPreferenceValueSchema = z
  .object({
    explicitly_set: z.boolean(),
    explicit_push_enabled: z.boolean().nullable(),
    updated_at: nullableStringSchema,
  })
  .loose();

export const mobilePushChannelPreferenceSchema = z
  .object({
    channel_id: z.number(),
    youtube_channel_id: z.string(),
    title: z.string(),
    is_monitored: z.boolean(),
    push_eligible: z.boolean(),
    push_enabled: z.boolean(),
    preference: mobilePushChannelPreferenceValueSchema,
  })
  .loose() satisfies z.ZodType<MobilePushChannelPreference>;

export const mobilePushChannelPreferencesResponseSchema = z
  .object({
    channels: z.array(mobilePushChannelPreferenceSchema),
    pagination: paginationSchema,
  })
  .loose() satisfies z.ZodType<MobilePushChannelPreferencesResponse>;
