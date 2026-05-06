import { isQuotaRisk, formatRelativeTime, quotaUsagePercent, readinessLabel } from '../components/dashboard/dashboardFormatters';

describe('dashboardFormatters', () => {
  it('formats relative time with fallback and invalid handling', () => {
    expect(formatRelativeTime(null)).toBe('Never');
    expect(formatRelativeTime(undefined, 'N/A')).toBe('N/A');
    expect(formatRelativeTime('not-a-date')).toBe('Unknown');
    expect(formatRelativeTime('2026-05-01T10:00:00.000Z')).toMatch(/ago$/);
  });

  it('returns readiness labels', () => {
    expect(readinessLabel(true)).toBe('Operational');
    expect(readinessLabel(false)).toBe('Degraded');
  });

  it('computes quota percent safely', () => {
    expect(quotaUsagePercent({ daily_quota_budget: 500, estimated_units_used_today: 250 } as any)).toBe(50);
    expect(quotaUsagePercent({ daily_quota_budget: 0, estimated_units_used_today: 250 } as any)).toBeNull();
  });

  it('detects quota risk by threshold or flags', () => {
    const base = {
      quota: { daily_quota_budget: 500, estimated_units_used_today: 300, safety_stop_active: false },
      polling: { last_run: { quota_blocked: false } },
    } as any;
    expect(isQuotaRisk(base)).toBe(false);
    expect(isQuotaRisk({ ...base, quota: { ...base.quota, estimated_units_used_today: 400 } })).toBe(true);
    expect(isQuotaRisk({ ...base, quota: { ...base.quota, safety_stop_active: true } })).toBe(true);
    expect(isQuotaRisk({ ...base, polling: { last_run: { quota_blocked: true } } })).toBe(true);
  });
});
