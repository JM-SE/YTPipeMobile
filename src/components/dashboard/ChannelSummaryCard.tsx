import { Text, View } from 'react-native';

import type { StatusResponse } from '../../api/types';
import { DashboardCard, dashboardCardStyles } from './DashboardCard';

type Props = { status: StatusResponse };

export function ChannelSummaryCard({ status }: Props) {
  const { imported_count, monitored_count } = status.channels;

  return (
    <DashboardCard title="Channel summary">
      <View style={dashboardCardStyles.row}>
        <Text style={dashboardCardStyles.label}>Imported</Text>
        <Text style={dashboardCardStyles.value}>{String(imported_count)}</Text>
      </View>
      <View style={dashboardCardStyles.row}>
        <Text style={dashboardCardStyles.label}>Monitored</Text>
        <Text style={dashboardCardStyles.value}>{String(monitored_count)}</Text>
      </View>
    </DashboardCard>
  );
}
