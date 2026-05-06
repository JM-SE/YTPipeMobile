import type { StatusResponse } from '../../api/types';
import { Text, View } from 'react-native';

import { DashboardCard, dashboardCardStyles } from './DashboardCard';
import { formatRelativeTime } from './dashboardFormatters';

type Props = { status: StatusResponse };

export function PollingSummaryCard({ status }: Props) {
  const { last_success_at, last_run, last_error_at, last_error_message } = status.polling;

  return (
    <DashboardCard title="Polling summary">
      <View style={dashboardCardStyles.row}>
        <Text style={dashboardCardStyles.label}>Last success</Text>
        <Text style={dashboardCardStyles.value}>{formatRelativeTime(last_success_at)}</Text>
      </View>
      <View style={dashboardCardStyles.row}>
        <Text style={dashboardCardStyles.label}>Latest outcome</Text>
        <Text style={dashboardCardStyles.value}>{last_run?.run_outcome ?? 'Unknown'}</Text>
      </View>
      <View style={dashboardCardStyles.row}>
        <Text style={dashboardCardStyles.label}>New videos</Text>
        <Text style={dashboardCardStyles.value}>{String(last_run?.new_videos_detected ?? 0)}</Text>
      </View>
      <Text style={dashboardCardStyles.info}>Error state: {last_error_at || last_error_message ? 'Detected' : 'None'}</Text>
    </DashboardCard>
  );
}
