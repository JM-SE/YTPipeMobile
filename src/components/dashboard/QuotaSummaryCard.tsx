import { Text, View } from 'react-native';

import type { StatusResponse } from '../../api/types';
import { DashboardCard, dashboardCardStyles } from './DashboardCard';
import { isQuotaRisk, quotaUsagePercent } from './dashboardFormatters';

type Props = { status: StatusResponse };

export function QuotaSummaryCard({ status }: Props) {
  const { daily_quota_budget, estimated_units_used_today, safety_stop_active } = status.quota;
  const risk = isQuotaRisk(status);
  const usagePercent = quotaUsagePercent(status.quota);

  return (
    <DashboardCard title="Quota/safety" warning={risk}>
      <View style={dashboardCardStyles.row}>
        <Text style={dashboardCardStyles.label}>Budget</Text>
        <Text style={dashboardCardStyles.value}>{String(daily_quota_budget)}</Text>
      </View>
      <View style={dashboardCardStyles.row}>
        <Text style={dashboardCardStyles.label}>Used today</Text>
        <Text style={dashboardCardStyles.value}>{String(estimated_units_used_today)}</Text>
      </View>
      <Text style={dashboardCardStyles.info}>
        Usage: {usagePercent === null ? 'Unknown' : `${usagePercent}%`} · Safety stop: {safety_stop_active ? 'Active' : 'Inactive'}
      </Text>
      {risk ? <Text style={dashboardCardStyles.info}>Risk state detected. Backend activity may be paused or blocked.</Text> : null}
    </DashboardCard>
  );
}
