import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { MOCK_TOKEN, now } from './seed';
import { createInitialState, refreshStatusCounts } from './state';
import type { ActivityItem, PollResult, StatusResponse, SyncResult } from './types';
import {
  assertKnownScenario,
  authError,
  filterChannels,
  getStringQuery,
  hasValidMobileToken,
  notFoundError,
  paginate,
  parseDeliveryStatusFilter,
  parseLimitOffset,
  parseMonitoringFilter,
  prerequisiteError,
  upstreamError,
  validationError,
} from './helpers';

const DEFAULT_PORT = 4000;
const port = Number(process.env.MOCK_API_PORT ?? DEFAULT_PORT);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error('MOCK_API_PORT must be a valid TCP port');
}

const app = express();
let state = createInitialState();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  if (hasValidMobileToken(req)) {
    next();
    return;
  }

  authError(res);
});

app.post('/__mock/reset', (_req, res) => {
  state = createInitialState();
  res.json({ status: 'reset' });
});

app.get('/status', (req, res) => {
  const scenario = getStringQuery(req.query.scenario);
  if (!assertKnownScenario(res, scenario, ['degraded', 'quota_blocked', 'upstream_error'])) return;

  if (scenario === 'upstream_error') {
    upstreamError(res, 'Mock upstream provider error while building status');
    return;
  }

  refreshStatusCounts(state);
  const response: StatusResponse = structuredClone(state.status);

  if (scenario === 'degraded') {
    response.ready = false;
    response.polling.last_error_at = now;
    response.polling.last_error_message = 'Mock degraded polling dependency';
  }

  if (scenario === 'quota_blocked') {
    response.ready = false;
    response.quota.estimated_units_used_today = response.quota.daily_quota_budget;
    response.quota.last_run_estimated_units = 0;
    response.quota.safety_stop_active = true;
    response.quota.safety_stop_triggered_at = now;
    response.polling.last_run = {
      run_outcome: 'quota_blocked',
      channels_processed: 0,
      channels_failed: 0,
      baselines_established: 0,
      new_videos_detected: 0,
      quota_blocked: true,
      channel_errors: [],
    };
  }

  res.json(response);
});

app.get('/internal/channels', (req, res) => {
  const monitoring = parseMonitoringFilter(req.query.monitoring);
  if (!monitoring) {
    validationError(res, 'monitoring must be monitored, unmonitored, or all');
    return;
  }

  const parsedPagination = parseLimitOffset(req);
  if ('error' in parsedPagination) {
    validationError(res, parsedPagination.error);
    return;
  }

  const query = getStringQuery(req.query.query);
  const filtered = filterChannels(state.channels, monitoring, query);
  const page = paginate(filtered, parsedPagination.limit, parsedPagination.offset);

  res.json({ channels: page.items, pagination: page.pagination });
});

app.patch('/internal/channels/:channel_id/monitoring', (req, res) => {
  const channelId = Number(req.params.channel_id);
  if (!Number.isInteger(channelId)) {
    validationError(res, 'channel_id must be an integer');
    return;
  }

  if (typeof req.body?.is_monitored !== 'boolean') {
    validationError(res, 'body.is_monitored must be a boolean');
    return;
  }

  const channel = state.channels.find((item) => item.channel_id === channelId);
  if (!channel) {
    notFoundError(res, `Channel ${channelId} was not found`);
    return;
  }

  channel.is_monitored = req.body.is_monitored;
  refreshStatusCounts(state);

  res.json({
    channel_id: channel.channel_id,
    is_monitored: channel.is_monitored,
    last_seen_video_id: channel.last_seen_video_id,
    baseline_established_at: channel.baseline_established_at,
  });
});

app.post('/internal/subscriptions/sync', (req, res) => {
  const scenario = getStringQuery(req.query.scenario);
  if (!assertKnownScenario(res, scenario, ['oauth_missing'])) return;

  if (scenario === 'oauth_missing') {
    prerequisiteError(res, 'Mock Google OAuth authorization is missing');
    return;
  }

  const result: SyncResult = {
    status: 'success',
    channels_imported: state.channels.length,
    channels_created: 0,
    channels_updated: state.channels.length,
  };

  state.status.subscription_sync.last_success_at = now;
  state.status.subscription_sync.last_error_at = null;
  state.status.subscription_sync.last_error_message = null;
  state.status.subscription_sync.metadata = { last_mock_sync: now };

  res.json(result);
});

app.post('/internal/run-poll', (req, res) => {
  const scenario = getStringQuery(req.query.scenario);
  if (!assertKnownScenario(res, scenario, ['no_new_videos', 'partial_failure', 'quota_blocked'])) return;

  const monitoredChannels = state.channels.filter((channel) => channel.is_monitored);
  let result: PollResult = {
    run_outcome: 'success',
    channels_processed: monitoredChannels.length,
    channels_failed: 0,
    baselines_established: monitoredChannels.filter((channel) => !channel.baseline_established_at).length,
    new_videos_detected: monitoredChannels.length > 0 ? 1 : 0,
    quota_blocked: false,
    channel_errors: [],
  };

  if (scenario === 'no_new_videos') {
    result = {
      ...result,
      run_outcome: 'no_new_videos',
      baselines_established: 0,
      new_videos_detected: 0,
    };
  }

  if (scenario === 'partial_failure') {
    result = {
      ...result,
      run_outcome: 'partial_failure',
      channels_failed: monitoredChannels.length > 0 ? 1 : 0,
      channel_errors: monitoredChannels.length > 0 ? ['Mock transient YouTube API failure for one monitored channel'] : [],
    };
  }

  if (scenario === 'quota_blocked') {
    result = {
      run_outcome: 'quota_blocked',
      channels_processed: 0,
      channels_failed: 0,
      baselines_established: 0,
      new_videos_detected: 0,
      quota_blocked: true,
      channel_errors: [],
    };
  }

  for (const channel of monitoredChannels.filter((item) => !item.baseline_established_at)) {
    channel.baseline_established_at = now;
  }

  if (result.new_videos_detected > 0 && monitoredChannels[0]) {
    const channel = monitoredChannels[0];
    const videoId = state.nextVideoId++;
    const youtubeVideoId = `mock-poll-${videoId}`;
    channel.last_seen_video_id = youtubeVideoId;
    channel.latest_detected_video = {
      video_id: videoId,
      youtube_video_id: youtubeVideoId,
      title: `Mock newly detected video ${videoId}`,
      youtube_url: `https://www.youtube.com/watch?v=${youtubeVideoId}`,
      published_at: now,
    };

    const activityItem: ActivityItem = {
      activity_id: state.nextActivityId++,
      delivery_id: state.nextDeliveryId++,
      video_id: videoId,
      youtube_video_id: youtubeVideoId,
      video_title: `Mock newly detected video ${videoId}`,
      youtube_url: `https://www.youtube.com/watch?v=${youtubeVideoId}`,
      channel_id: channel.channel_id,
      channel_title: channel.title,
      delivery_status: 'pending',
      published_at: now,
      detected_at: now,
      last_attempt_at: null,
      last_error: null,
    };

    state.activity.unshift(activityItem);
  }

  state.status.polling.last_success_at = result.quota_blocked ? state.status.polling.last_success_at : now;
  state.status.polling.last_error_at = scenario === 'partial_failure' ? now : null;
  state.status.polling.last_error_message = scenario === 'partial_failure' ? 'Mock partial polling failure' : null;
  state.status.polling.last_run = result;
  state.status.quota.last_run_estimated_units = result.quota_blocked ? 0 : Math.max(result.channels_processed, 1);
  state.status.quota.estimated_units_used_today += state.status.quota.last_run_estimated_units;
  state.status.quota.safety_stop_active = result.quota_blocked;
  state.status.quota.safety_stop_triggered_at = result.quota_blocked ? now : null;
  refreshStatusCounts(state);

  res.json(result);
});

app.get('/internal/activity', (req, res) => {
  const status = parseDeliveryStatusFilter(req.query.status);
  if (!status) {
    validationError(res, 'status must be all, pending, delivered, pending_retry, or failed');
    return;
  }

  const parsedPagination = parseLimitOffset(req);
  if ('error' in parsedPagination) {
    validationError(res, parsedPagination.error);
    return;
  }

  const filtered = status === 'all'
    ? state.activity
    : state.activity.filter((item) => item.delivery_status === status);
  const page = paginate(filtered, parsedPagination.limit, parsedPagination.offset);

  res.json({ items: page.items, pagination: page.pagination });
});

app.use((_req, res) => {
  notFoundError(res, 'Mock route not found');
});

app.listen(port, () => {
  console.log('YTPipe Mobile mock API started');
  console.log(`Host URL: http://localhost:${port}`);
  console.log(`Android Emulator URL: http://10.0.2.2:${port}`);
  console.log(`Mock mobile API token: ${MOCK_TOKEN}`);
});
