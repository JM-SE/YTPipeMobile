import { formatDistanceToNowStrict, parseISO } from 'date-fns';

import type { StatusResponse } from '../../api/types';

export function formatRelativeTime(value: string | null | undefined, fallback = 'Never'): string {
  if (!value) return fallback;

  try {
    const date = parseISO(value);
    if (Number.isNaN(date.getTime())) return 'Unknown';
    return `${formatDistanceToNowStrict(date)} ago`;
  } catch {
    return 'Unknown';
  }
}

export function readinessLabel(ready: boolean): string {
  return ready ? 'Operational' : 'Degraded';
}

export function quotaUsagePercent(quota: StatusResponse['quota']): number | null {
  if (!quota || !quota.daily_quota_budget || quota.daily_quota_budget <= 0) return null;
  return Math.round((quota.estimated_units_used_today / quota.daily_quota_budget) * 100);
}

export function isQuotaRisk(status: StatusResponse): boolean {
  if (status.quota.safety_stop_active) return true;
  if (status.polling.last_run?.quota_blocked) return true;

  const percent = quotaUsagePercent(status.quota);
  if (percent === null) return false;
  return percent >= 80;
}
