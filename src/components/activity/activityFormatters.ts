import type { ActivityStatusFilter, DeliveryStatus } from '../../api/types';
import { formatRelativeTime } from '../dashboard/dashboardFormatters';

const DELIVERY_STATUS_LABEL = {
  pending: 'Pending',
  delivered: 'Delivered',
  pending_retry: 'Retry',
  failed: 'Failed',
} as const satisfies Record<DeliveryStatus, string>;

const ACTIVITY_FILTER_LABEL = {
  all: 'All',
  pending: 'Pending',
  delivered: 'Delivered',
  pending_retry: 'Retry',
  failed: 'Failed',
} as const satisfies Record<ActivityStatusFilter, string>;

export function deliveryStatusLabel(status: DeliveryStatus) {
  return DELIVERY_STATUS_LABEL[status];
}

export function activityFilterLabel(status: ActivityStatusFilter) {
  return ACTIVITY_FILTER_LABEL[status];
}

export function hasDeliveryError(status: DeliveryStatus) {
  return status === 'failed' || status === 'pending_retry';
}

export function formatActivityTime(label: string, value: string | null | undefined) {
  return `${label}: ${formatRelativeTime(value, 'Unavailable')}`;
}

export function filterAwareEmptyMessage(status: ActivityStatusFilter) {
  if (status === 'all') return 'No activity yet. Run Poll from Dashboard after monitoring channels to create activity.';
  return `No ${activityFilterLabel(status).toLowerCase()} activity found.`;
}
