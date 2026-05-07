import * as client from '../api/client';
import {
  getActivity,
  getChannels,
  getStatus,
  runPoll,
  syncSubscriptions,
  updateChannelMonitoring,
} from '../api/mobileApi';

const config = {
  apiBaseUrl: 'http://10.0.2.2:4000',
  mobileApiToken: 'dev-mobile-token',
};

const validPollResult = {
  run_outcome: 'completed',
  channels_processed: 1,
  channels_failed: 0,
  baselines_established: 0,
  new_videos_detected: 1,
  quota_blocked: false,
};

const validStatus = {
  service: 'ytpipe',
  environment: 'mock',
  ready: true,
  subscription_sync: {
    last_success_at: null,
    last_error_at: null,
    last_error_message: null,
    metadata: {},
  },
  polling: {
    last_success_at: null,
    last_error_at: null,
    last_error_message: null,
    last_run: validPollResult,
  },
  email: {
    last_attempt_at: null,
    last_success_at: null,
    last_failure_at: null,
    last_error: null,
    pending_count: 0,
    pending_retry_count: 0,
    delivered_count: 0,
    failed_count: 0,
  },
  quota: {
    daily_quota_budget: 10000,
    estimated_units_used_today: 10,
    last_run_estimated_units: 1,
    safety_stop_active: false,
    safety_stop_enabled: true,
    safety_stop_triggered_at: null,
  },
  channels: {
    imported_count: 1,
    monitored_count: 1,
  },
};

const validChannels = {
  channels: [
    {
      channel_id: 1,
      youtube_channel_id: 'yt-channel-1',
      title: 'React Native Weekly',
      is_monitored: true,
      last_seen_video_id: null,
      baseline_established_at: null,
      latest_detected_video: null,
    },
  ],
  pagination: { limit: 10, offset: 0, total: 1 },
};

const validActivity = {
  items: [
    {
      activity_id: 1,
      delivery_id: 2,
      video_id: 3,
      youtube_video_id: 'yt-video-1',
      video_title: 'New video',
      youtube_url: 'https://www.youtube.com/watch?v=yt-video-1',
      channel_id: 4,
      channel_title: 'React Native Weekly',
      delivery_status: 'delivered',
      published_at: '2026-05-05T10:00:00.000Z',
      detected_at: '2026-05-05T10:05:00.000Z',
      last_attempt_at: null,
      last_error: null,
    },
  ],
  pagination: { limit: 20, offset: 0, total: 1 },
};

describe('mobileApi endpoint coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls status endpoint', async () => {
    const spy = jest.spyOn(client, 'apiRequest').mockResolvedValue(validStatus as never);
    await getStatus(config);
    expect(spy).toHaveBeenCalledWith(config, '/status', { method: 'GET' });
  });

  it('calls channels endpoint', async () => {
    const spy = jest.spyOn(client, 'apiRequest').mockResolvedValue(validChannels as never);
    await getChannels(config, { monitoring: 'all', limit: 10, offset: 0, query: 'react' });
    expect(spy).toHaveBeenCalledWith(config, '/internal/channels', {
      method: 'GET',
      query: { monitoring: 'all', limit: 10, offset: 0, query: 'react' },
    });
  });

  it('calls channel monitoring update endpoint', async () => {
    const spy = jest.spyOn(client, 'apiRequest').mockResolvedValue({
      channel_id: 123,
      is_monitored: true,
      last_seen_video_id: null,
      baseline_established_at: null,
    } as never);
    await updateChannelMonitoring(config, 123, { is_monitored: true });
    expect(spy).toHaveBeenCalledWith(config, '/internal/channels/123/monitoring', {
      method: 'PATCH',
      body: { is_monitored: true },
    });
  });

  it('calls sync endpoint', async () => {
    const spy = jest.spyOn(client, 'apiRequest').mockResolvedValue({ status: 'ok' } as never);
    await syncSubscriptions(config);
    expect(spy).toHaveBeenCalledWith(config, '/internal/subscriptions/sync', { method: 'POST' });
  });

  it('calls run poll endpoint', async () => {
    const spy = jest.spyOn(client, 'apiRequest').mockResolvedValue(validPollResult as never);
    await runPoll(config);
    expect(spy).toHaveBeenCalledWith(config, '/internal/run-poll', { method: 'POST' });
  });

  it('calls activity endpoint', async () => {
    const spy = jest.spyOn(client, 'apiRequest').mockResolvedValue(validActivity as never);
    await getActivity(config, { status: 'failed', limit: 20, offset: 0 });
    expect(spy).toHaveBeenCalledWith(config, '/internal/activity', {
      method: 'GET',
      query: { status: 'failed', limit: 20, offset: 0 },
    });
  });

  it('maps malformed responses to sanitized parse errors', async () => {
    jest.spyOn(client, 'apiRequest').mockResolvedValue({ service: 'ytpipe', environment: 'mock' } as never);

    await expect(getStatus(config)).rejects.toMatchObject({
      kind: 'parse',
      message: expect.stringMatching(/Unexpected API response format/i),
      technical: expect.not.stringContaining('dev-mobile-token'),
    });
  });
});
