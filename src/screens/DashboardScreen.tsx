import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';

import { useStatusQuery } from '../api/useStatusQuery';
import { ChannelSummaryCard } from '../components/dashboard/ChannelSummaryCard';
import { DashboardQuickActionsCard } from '../components/dashboard/DashboardQuickActionsCard';
import { EmailSummaryCard } from '../components/dashboard/EmailSummaryCard';
import { PollingSummaryCard } from '../components/dashboard/PollingSummaryCard';
import { QuotaSummaryCard } from '../components/dashboard/QuotaSummaryCard';
import { ServiceReadinessCard } from '../components/dashboard/ServiceReadinessCard';
import { ScreenShell } from '../components/ScreenShell';
import { useConnectivityStatus } from '../connectivity/ConnectivityContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme/tokens';

type Navigation = NativeStackNavigationProp<AppStackParamList>;

export function DashboardScreen() {
  const navigation = useNavigation<Navigation>();
  const { data, error, isLoading, isFetching, isRefetchError, refetch } = useStatusQuery();
  const { isOffline } = useConnectivityStatus();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <ScreenShell
      title="Dashboard"
      subtitle="Service readiness, polling, quota, and channel status from /status."
    >
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={isFetching && !isOffline} onRefresh={() => { if (!isOffline) void refetch(); }} />}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.xl }]}
      >
        <ServiceReadinessCard
          statusData={data ?? null}
          error={error ?? null}
          isLoading={isLoading}
          isStaleFailure={Boolean(data) && isRefetchError}
          onRetry={() => void refetch()}
          isFetching={isFetching}
          isOffline={isOffline}
          onOpenSettings={() => navigation.navigate('Settings')}
        />

        {data ? (
          <>
            <PollingSummaryCard status={data} />
            {DASHBOARD_FEATURE_FLAGS.showEmailDelivery ? <EmailSummaryCard status={data} /> : null}
            <QuotaSummaryCard status={data} />
            <ChannelSummaryCard status={data} />
            <DashboardQuickActionsCard />
          </>
        ) : (
          <Text style={styles.loadingHint}>Status summaries appear after successful /status response.</Text>
        )}
      </ScrollView>
    </ScreenShell>
  );
}

const DASHBOARD_FEATURE_FLAGS = {
  showEmailDelivery: false,
} as const;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
  },
  loadingHint: {
    color: colors.textSecondary,
  },
});
