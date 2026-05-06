import { Text, View } from 'react-native';

import type { StatusResponse } from '../../api/types';
import { DashboardCard, dashboardCardStyles } from './DashboardCard';
import { formatRelativeTime } from './dashboardFormatters';

type Props = { status: StatusResponse };

export function EmailSummaryCard({ status }: Props) {
  const {
    delivered_count,
    failed_count,
    pending_count,
    pending_retry_count,
    last_attempt_at,
    last_error,
  } = status.email;

  return (
    <DashboardCard title="Email/delivery summary">
      <View style={dashboardCardStyles.row}>
        <Text style={dashboardCardStyles.label}>Delivered</Text>
        <Text style={dashboardCardStyles.value}>{String(delivered_count)}</Text>
      </View>
      <View style={dashboardCardStyles.row}>
        <Text style={dashboardCardStyles.label}>Failed</Text>
        <Text style={dashboardCardStyles.value}>{String(failed_count)}</Text>
      </View>
      <View style={dashboardCardStyles.row}>
        <Text style={dashboardCardStyles.label}>Pending</Text>
        <Text style={dashboardCardStyles.value}>{String(pending_count + pending_retry_count)}</Text>
      </View>
      <Text style={dashboardCardStyles.info}>Last attempt: {formatRelativeTime(last_attempt_at, 'Unknown')}</Text>
      {last_error ? <Text style={dashboardCardStyles.info}>Last error: {last_error}</Text> : null}
    </DashboardCard>
  );
}
