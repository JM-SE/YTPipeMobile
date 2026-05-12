export const PUSH_NOTIFICATION_TYPE = {
  NEW_VIDEO: 'new_video',
  TEST: 'test',
} as const;

export type PushNotificationType = (typeof PUSH_NOTIFICATION_TYPE)[keyof typeof PUSH_NOTIFICATION_TYPE];

type PushContextId = string | number;

export interface NewVideoPushPayload {
  type: typeof PUSH_NOTIFICATION_TYPE.NEW_VIDEO;
  activity_id?: PushContextId;
  delivery_id?: PushContextId;
  video_id?: PushContextId;
  channel_id?: PushContextId;
  sent_at?: string;
}

export interface TestPushPayload {
  type: typeof PUSH_NOTIFICATION_TYPE.TEST;
  sent_at?: string;
}

export type ParsedPushNotificationPayload = NewVideoPushPayload | TestPushPayload;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function optionalContextId(value: unknown): PushContextId | undefined {
  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function parsePushNotificationPayload(value: unknown): ParsedPushNotificationPayload | null {
  if (!isRecord(value)) {
    return null;
  }

  if (value.type === PUSH_NOTIFICATION_TYPE.NEW_VIDEO) {
    return {
      type: PUSH_NOTIFICATION_TYPE.NEW_VIDEO,
      activity_id: optionalContextId(value.activity_id),
      delivery_id: optionalContextId(value.delivery_id),
      video_id: optionalContextId(value.video_id),
      channel_id: optionalContextId(value.channel_id),
      sent_at: optionalString(value.sent_at),
    };
  }

  if (value.type === PUSH_NOTIFICATION_TYPE.TEST) {
    return {
      type: PUSH_NOTIFICATION_TYPE.TEST,
      sent_at: optionalString(value.sent_at),
    };
  }

  return null;
}
