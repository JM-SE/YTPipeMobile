import { parsePushNotificationPayload, PUSH_NOTIFICATION_TYPE } from '../notifications/pushNotificationPayloads';

describe('parsePushNotificationPayload', () => {
  it('parses a new video payload with all optional IDs', () => {
    expect(
      parsePushNotificationPayload({
        type: 'new_video',
        activity_id: 10,
        delivery_id: 'delivery-1',
        video_id: 20,
        channel_id: 'channel-1',
        sent_at: '2026-05-11T10:00:00Z',
      }),
    ).toEqual({
      type: PUSH_NOTIFICATION_TYPE.NEW_VIDEO,
      activity_id: 10,
      delivery_id: 'delivery-1',
      video_id: 20,
      channel_id: 'channel-1',
      sent_at: '2026-05-11T10:00:00Z',
    });
  });

  it('parses a new video payload with omitted optional IDs', () => {
    expect(parsePushNotificationPayload({ type: 'new_video' })).toEqual({
      type: PUSH_NOTIFICATION_TYPE.NEW_VIDEO,
      activity_id: undefined,
      delivery_id: undefined,
      video_id: undefined,
      channel_id: undefined,
      sent_at: undefined,
    });
  });

  it('parses a test payload', () => {
    expect(parsePushNotificationPayload({ type: 'test', sent_at: '2026-05-11T10:00:00Z' })).toEqual({
      type: PUSH_NOTIFICATION_TYPE.TEST,
      sent_at: '2026-05-11T10:00:00Z',
    });
  });

  it('ignores unknown or malformed payloads', () => {
    expect(parsePushNotificationPayload(null)).toBeNull();
    expect(parsePushNotificationPayload('new_video')).toBeNull();
    expect(parsePushNotificationPayload({ type: 'unknown' })).toBeNull();
    expect(parsePushNotificationPayload({})).toBeNull();
  });
});
