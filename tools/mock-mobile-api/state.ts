import { seedActivity, seedChannels, seedStatus } from './seed';
import type { ActivityItem, Channel, MockPushDeliveryStatus, MockPushGlobalSettings, MockPushInstallation, MockPushPreference, StatusResponse } from './types';

export interface MockState {
  channels: Channel[];
  activity: ActivityItem[];
  status: StatusResponse;
  pushGlobalSettings: MockPushGlobalSettings;
  pushInstallations: Record<string, MockPushInstallation>;
  pushDelivery: MockPushDeliveryStatus;
  pushPreferences: Record<number, MockPushPreference>;
  nextActivityId: number;
  nextDeliveryId: number;
  nextVideoId: number;
}

export const createInitialState = (): MockState => ({
  channels: structuredClone(seedChannels),
  activity: structuredClone(seedActivity),
  status: structuredClone(seedStatus),
  pushGlobalSettings: {
    enabled: false,
    default_for_monitored_channels: true,
    first_enabled_at: null,
    updated_at: null,
  },
  pushInstallations: {},
  pushDelivery: {
    last_attempt_at: null,
    last_success_at: null,
    last_error: null,
    last_expo_ticket_id: null,
    last_expo_status: null,
    last_receipt_checked_at: null,
  },
  pushPreferences: {},
  nextActivityId: 9100,
  nextDeliveryId: 8100,
  nextVideoId: 600,
});

export const refreshStatusCounts = (state: MockState) => {
  state.status.channels.imported_count = state.channels.length;
  state.status.channels.monitored_count = state.channels.filter((channel) => channel.is_monitored).length;
  state.status.email.pending_count = state.activity.filter((item) => item.delivery_status === 'pending').length;
  state.status.email.pending_retry_count = state.activity.filter((item) => item.delivery_status === 'pending_retry').length;
  state.status.email.delivered_count = state.activity.filter((item) => item.delivery_status === 'delivered').length;
  state.status.email.failed_count = state.activity.filter((item) => item.delivery_status === 'failed').length;
};
