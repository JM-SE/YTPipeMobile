import { z } from 'zod';

import type {
  ActivityResponse,
  ChannelsResponse,
  PollResult,
  StatusResponse,
  SyncResult,
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
  .passthrough();

const latestDetectedVideoSchema = z
  .object({
    video_id: z.number(),
    youtube_video_id: z.string(),
    title: z.string(),
    youtube_url: z.string(),
    published_at: z.string(),
  })
  .passthrough();

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
  .passthrough();

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
  .passthrough();

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
      .passthrough(),
    polling: z
      .object({
        last_success_at: nullableStringSchema,
        last_error_at: nullableStringSchema,
        last_error_message: nullableStringSchema,
        last_run: pollResultSchema.nullable(),
      })
      .passthrough(),
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
      .passthrough(),
    quota: z
      .object({
        daily_quota_budget: z.number(),
        estimated_units_used_today: z.number(),
        last_run_estimated_units: z.number(),
        safety_stop_active: z.boolean(),
        safety_stop_enabled: z.boolean(),
        safety_stop_triggered_at: nullableStringSchema,
      })
      .passthrough(),
    channels: z
      .object({
        imported_count: z.number(),
        monitored_count: z.number(),
      })
      .passthrough(),
  })
  .passthrough() satisfies z.ZodType<StatusResponse>;

export const channelsResponseSchema = z
  .object({
    channels: z.array(channelSchema),
    pagination: paginationSchema,
  })
  .passthrough() satisfies z.ZodType<ChannelsResponse>;

export const updateChannelMonitoringResponseSchema = z
  .object({
    channel_id: z.number(),
    is_monitored: z.boolean(),
    last_seen_video_id: nullableStringSchema,
    baseline_established_at: nullableStringSchema,
  })
  .passthrough() satisfies z.ZodType<UpdateChannelMonitoringResponse>;

export const syncResultSchema = z
  .object({
    status: z.string(),
    channels_imported: z.number().optional(),
    channels_created: z.number().optional(),
    channels_updated: z.number().optional(),
  })
  .passthrough() satisfies z.ZodType<SyncResult>;

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
  .passthrough();

export const activityResponseSchema = z
  .object({
    items: z.array(activityItemSchema),
    pagination: paginationSchema,
  })
  .passthrough() satisfies z.ZodType<ActivityResponse>;
