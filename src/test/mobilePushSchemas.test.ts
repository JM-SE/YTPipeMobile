import {
  mobilePushChannelPreferenceSchema,
  mobilePushChannelPreferencesResponseSchema,
  mobilePushStatusResponseSchema,
  patchMobilePushSettingsResponseSchema,
  registerMobilePushInstallationResponseSchema,
  sendMobilePushTestResponseSchema,
  unregisterMobilePushInstallationResponseSchema,
} from '../api/validation/schemas';

const installationId = 'b8d2b241-5e24-4e80-9b4d-17c8922ecb21';

describe('mobile push response schemas', () => {
  it('validates registered and unknown-installation status responses with extra fields', () => {
    const base = {
      global: { enabled: false, default_for_monitored_channels: true, first_enabled_at: null, updated_at: null },
      installation: {
        installation_id: installationId,
        registered: false,
        enabled: false,
        platform: 'android',
        app_version: null,
        build_number: null,
        device_name: null,
        token_masked: null,
        last_registered_at: null,
        last_seen_at: null,
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
      extra: true,
    };

    expect(mobilePushStatusResponseSchema.safeParse(base).success).toBe(true);
    expect(
      mobilePushStatusResponseSchema.safeParse({
        ...base,
        installation: { ...base.installation, registered: true, token_masked: 'ExponentPushToken[abcd…wxyz]' },
      }).success,
    ).toBe(true);
  });

  it('rejects camelCase replacement fields', () => {
    expect(
      registerMobilePushInstallationResponseSchema.safeParse({
        installationId,
        registered: true,
        enabled: true,
        globalEnabled: false,
        tokenMasked: 'masked',
        lastRegisteredAt: '2026-05-08T12:00:00Z',
      }).success,
    ).toBe(false);
  });

  it('validates register, unregister, settings, and test responses', () => {
    expect(
      registerMobilePushInstallationResponseSchema.safeParse({
        installation_id: installationId,
        registered: true,
        enabled: true,
        global_enabled: false,
        token_masked: 'ExponentPushToken[xxxx…xxxx]',
        last_registered_at: '2026-05-08T12:00:00Z',
      }).success,
    ).toBe(true);
    expect(
      unregisterMobilePushInstallationResponseSchema.safeParse({
        installation_id: installationId,
        registered: false,
        enabled: false,
        unregistered_at: null,
      }).success,
    ).toBe(true);
    expect(
      patchMobilePushSettingsResponseSchema.safeParse({
        enabled: true,
        default_for_monitored_channels: true,
        first_enabled_at: null,
        updated_at: '2026-05-08T12:00:00Z',
        monitored_channels_effectively_enabled_count: 12,
      }).success,
    ).toBe(true);
    expect(
      sendMobilePushTestResponseSchema.safeParse({
        sent: true,
        installation_id: installationId,
        event_type: 'test',
        last_attempt_at: '2026-05-08T12:15:00Z',
        expo_status: 'ok',
        expo_ticket_id: 'ticket-id',
        message: 'Test notification sent.',
      }).success,
    ).toBe(true);
  });

  it('validates channel preference response shapes and rejects camelCase replacement fields', () => {
    const channelPreference = {
      channel_id: 1,
      youtube_channel_id: 'yt-1',
      title: 'React Native Weekly',
      is_monitored: true,
      push_eligible: true,
      push_enabled: true,
      preference: { explicitly_set: false, explicit_push_enabled: null, updated_at: null },
      extra: 'accepted',
    };

    expect(mobilePushChannelPreferenceSchema.safeParse(channelPreference).success).toBe(true);
    expect(
      mobilePushChannelPreferencesResponseSchema.safeParse({
        channels: [channelPreference],
        pagination: { limit: 25, offset: 0, total: 1 },
      }).success,
    ).toBe(true);
    expect(
      mobilePushChannelPreferenceSchema.safeParse({
        channelId: 1,
        youtubeChannelId: 'yt-1',
        title: 'React Native Weekly',
        isMonitored: true,
        pushEligible: true,
        pushEnabled: true,
        preference: { explicitlySet: false, explicitPushEnabled: null, updatedAt: null },
      }).success,
    ).toBe(false);
  });
});
