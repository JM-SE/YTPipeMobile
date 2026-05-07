import { parseApiResponse } from '../api/validation/parseResponse';
import { activityResponseSchema, channelsResponseSchema, statusResponseSchema } from '../api/validation/schemas';

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
    last_run: null,
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

describe('response validation hardening', () => {
  it('accepts extra fields while validating required status fields', () => {
    const parsed = parseApiResponse(statusResponseSchema, { ...validStatus, future_field: 'kept-compatible' }, 'GET /status');

    expect(parsed.ready).toBe(true);
    expect(parsed.environment).toBe('mock');
  });

  it('rejects missing required status fields with friendly parse error', () => {
    expect(() => parseApiResponse(statusResponseSchema, { ...validStatus, ready: undefined }, 'GET /status')).toThrow(
      /Unexpected API response format/i,
    );
  });

  it('sanitizes configured token from validation technical details', () => {
    try {
      parseApiResponse(statusResponseSchema, { detail: 'Bearer secret-token' }, 'GET /status', 'secret-token');
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect(error).toMatchObject({ kind: 'parse' });
      expect(String((error as { technical?: string }).technical)).not.toContain('secret-token');
      expect(String((error as { technical?: string }).technical)).toContain('response validation failed');
    }
  });

  it('validates channel and activity collection shapes', () => {
    const channels = parseApiResponse(
      channelsResponseSchema,
      { channels: [], pagination: { limit: 25, offset: 0, total: 0 }, extra: true },
      'GET /internal/channels',
    );
    const activity = parseApiResponse(
      activityResponseSchema,
      { items: [], pagination: { limit: 25, offset: 0, total: 0 }, extra: true },
      'GET /internal/activity',
    );

    expect(channels.channels).toEqual([]);
    expect(activity.items).toEqual([]);
  });
});
