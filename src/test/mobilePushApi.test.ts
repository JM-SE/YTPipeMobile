import * as client from '../api/client';
import {
  getMobilePushChannelPreferences,
  getMobilePushStatus,
  patchMobilePushChannelPreference,
  patchMobilePushSettings,
  registerMobilePushInstallation,
  sendMobilePushTest,
  unregisterMobilePushInstallation,
} from '../api/mobilePushApi';

const config = {
  apiBaseUrl: 'https://api.example.com',
  mobileApiToken: 'mobile-token',
};

const installationId = 'b8d2b241-5e24-4e80-9b4d-17c8922ecb21';

const validStatus = {
  global: {
    enabled: true,
    default_for_monitored_channels: true,
    first_enabled_at: '2026-05-08T12:00:00Z',
    updated_at: '2026-05-08T12:00:00Z',
  },
  installation: {
    installation_id: installationId,
    registered: true,
    enabled: true,
    platform: 'android',
    app_version: '1.0.0',
    build_number: '42',
    device_name: 'Owner Phone',
    token_masked: 'ExponentPushToken[abcd…wxyz]',
    last_registered_at: '2026-05-08T12:00:00Z',
    last_seen_at: '2026-05-08T12:00:00Z',
    last_unregistered_at: null,
  },
  delivery: {
    last_attempt_at: null,
    last_success_at: null,
    last_error: null,
    last_expo_ticket_id: null,
    last_expo_status: null,
    last_receipt_checked_at: null,
  },
};

describe('mobile push API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls status endpoint with installation_id query', async () => {
    const spy = jest.spyOn(client, 'apiRequest').mockResolvedValue(validStatus as never);

    await getMobilePushStatus(config, installationId);

    expect(spy).toHaveBeenCalledWith(config, '/internal/mobile-push/status', {
      method: 'GET',
      query: { installation_id: installationId },
    });
  });

  it('registers installation with exact snake_case body', async () => {
    const response = {
      installation_id: installationId,
      registered: true,
      enabled: true,
      global_enabled: false,
      token_masked: 'ExponentPushToken[xxxx…xxxx]',
      last_registered_at: '2026-05-08T12:00:00Z',
    };
    const spy = jest.spyOn(client, 'apiRequest').mockResolvedValue(response as never);

    await registerMobilePushInstallation(config, {
      installation_id: installationId,
      expo_push_token: 'ExponentPushToken[test-token]',
      platform: 'android',
      app_version: '1.0.0',
      build_number: '42',
      device_name: 'Owner Phone',
    });

    expect(spy).toHaveBeenCalledWith(config, '/internal/mobile-push/register', {
      method: 'POST',
      body: {
        installation_id: installationId,
        expo_push_token: 'ExponentPushToken[test-token]',
        platform: 'android',
        app_version: '1.0.0',
        build_number: '42',
        device_name: 'Owner Phone',
      },
    });
  });

  it('calls unregister, settings, and test endpoints', async () => {
    const spy = jest.spyOn(client, 'apiRequest');
    spy.mockResolvedValueOnce({ installation_id: installationId, registered: false, enabled: false, unregistered_at: '2026-05-08T12:10:00Z' } as never);
    spy.mockResolvedValueOnce({
      enabled: true,
      default_for_monitored_channels: true,
      first_enabled_at: '2026-05-08T12:00:00Z',
      updated_at: '2026-05-08T12:00:00Z',
      monitored_channels_effectively_enabled_count: 12,
    } as never);
    spy.mockResolvedValueOnce({
      sent: true,
      installation_id: installationId,
      event_type: 'test',
      last_attempt_at: '2026-05-08T12:15:00Z',
      expo_status: 'ok',
      expo_ticket_id: 'ticket-id',
      message: 'Test notification sent.',
    } as never);

    await unregisterMobilePushInstallation(config, installationId);
    await patchMobilePushSettings(config, { enabled: true, default_for_monitored_channels: true });
    await sendMobilePushTest(config, { installation_id: installationId });

    expect(spy).toHaveBeenNthCalledWith(1, config, `/internal/mobile-push/installations/${installationId}`, { method: 'DELETE' });
    expect(spy).toHaveBeenNthCalledWith(2, config, '/internal/mobile-push/settings', {
      method: 'PATCH',
      body: { enabled: true, default_for_monitored_channels: true },
    });
    expect(spy).toHaveBeenNthCalledWith(3, config, '/internal/mobile-push/test', {
      method: 'POST',
      body: { installation_id: installationId },
    });
  });

  it('calls channel preference endpoints with exact params and body', async () => {
    const channelPreference = {
      channel_id: 1,
      youtube_channel_id: 'yt-1',
      title: 'React Native Weekly',
      is_monitored: true,
      push_eligible: true,
      push_enabled: true,
      preference: { explicitly_set: false, explicit_push_enabled: null, updated_at: null },
    };
    const spy = jest.spyOn(client, 'apiRequest');
    spy.mockResolvedValueOnce({
      channels: [channelPreference],
      pagination: { limit: 25, offset: 0, total: 1 },
    } as never);
    spy.mockResolvedValueOnce({ ...channelPreference, push_enabled: false, preference: { explicitly_set: true, explicit_push_enabled: false, updated_at: '2026-05-08T12:30:00Z' } } as never);

    await getMobilePushChannelPreferences(config, { monitoring: 'monitored', query: 'react', limit: 25, offset: 0 });
    await patchMobilePushChannelPreference(config, 1, { push_enabled: false });

    expect(spy).toHaveBeenNthCalledWith(1, config, '/internal/mobile-push/channel-preferences', {
      method: 'GET',
      query: { monitoring: 'monitored', query: 'react', limit: 25, offset: 0 },
    });
    expect(spy).toHaveBeenNthCalledWith(2, config, '/internal/mobile-push/channels/1', {
      method: 'PATCH',
      body: { push_enabled: false },
    });
  });
});
