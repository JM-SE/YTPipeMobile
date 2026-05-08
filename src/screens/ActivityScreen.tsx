import { useMemo, useState } from 'react';
import { FlatList, Linking, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import type { ActivityItem, ActivityStatusFilter } from '../api/types';
import { useActivityQuery } from '../api/useActivityQuery';
import { ActivityListItem } from '../components/activity/ActivityListItem';
import { ActivityStatusFilterTabs } from '../components/activity/ActivityStatusFilterTabs';
import { filterAwareEmptyMessage } from '../components/activity/activityFormatters';
import { isAllowedYouTubeUrl, YOUTUBE_LINK_ERROR } from '../components/activity/youtubeLinks';
import { ScreenShell } from '../components/ScreenShell';
import { useConnectivityStatus } from '../connectivity/ConnectivityContext';
import { colors, spacing, typography } from '../theme/tokens';

export function ActivityScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { isOffline } = useConnectivityStatus();
  const [filter, setFilter] = useState<ActivityStatusFilter>('all');
  const [expandedActivityId, setExpandedActivityId] = useState<number | null>(null);
  const [linkErrors, setLinkErrors] = useState<Record<number, string>>({});
  const {
    data,
    error,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isRefetchError,
    hasNextPage,
    refetch,
    fetchNextPage,
  } = useActivityQuery({ status: filter });
  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const showInitialLoading = isLoading && items.length === 0;
  const showEmpty = !isLoading && items.length === 0 && !error;
  const showFullError = !isLoading && items.length === 0 && error;
  const showStaleWarning = items.length > 0 && isRefetchError;

  const toggleExpanded = (activityId: number) => {
    setExpandedActivityId((current) => (current === activityId ? null : activityId));
  };

  const openYoutube = async (item: ActivityItem) => {
    setLinkErrors((current) => ({ ...current, [item.activity_id]: '' }));

    try {
      if (!isAllowedYouTubeUrl(item.youtube_url)) throw new Error('Untrusted YouTube URL');
      const supported = await Linking.canOpenURL(item.youtube_url);
      if (!supported) throw new Error('Unsupported URL');
      await Linking.openURL(item.youtube_url);
    } catch {
      setLinkErrors((current) => ({
        ...current,
        [item.activity_id]: YOUTUBE_LINK_ERROR,
      }));
    }
  };

  return (
    <ScreenShell title="Activity" subtitle="Read-only history of detected videos and delivery state.">
      <FlatList
        style={styles.list}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.xl }]}
        data={items}
        keyExtractor={(item) => String(item.activity_id)}
        renderItem={({ item }) => (
          <ActivityListItem
            item={item}
            expanded={expandedActivityId === item.activity_id}
            linkError={linkErrors[item.activity_id]}
            onToggleExpanded={toggleExpanded}
            onOpenYoutube={openYoutube}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <ActivityStatusFilterTabs
              selected={filter}
              onChange={(nextFilter) => {
                setFilter(nextFilter);
                setExpandedActivityId(null);
              }}
            />
            {showStaleWarning ? (
              <View style={styles.warning} accessibilityRole="alert">
                <Text style={styles.warningText}>Refresh failed, showing stale activity data.</Text>
              </View>
            ) : null}
            {showInitialLoading ? <Text style={styles.message}>Loading activity…</Text> : null}
            {isOffline ? <Text style={styles.message}>Activity refresh and pagination are paused while offline.</Text> : null}
            {showFullError ? (
              <View style={styles.error} accessibilityRole="alert">
                <Text style={styles.errorTitle}>Activity request failed</Text>
                <Text style={styles.message}>{error.message}</Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={showEmpty ? <Text style={styles.message}>{filterAwareEmptyMessage(filter)}</Text> : null}
        ListFooterComponent={isFetchingNextPage ? <Text style={styles.message}>Loading more activity…</Text> : null}
        refreshControl={<RefreshControl refreshing={isFetching && !isFetchingNextPage && !isOffline} onRefresh={() => { if (!isOffline) void refetch(); }} />}
        onEndReached={() => {
          if (!isOffline && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.md,
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
  warning: {
    borderColor: '#F2C66D',
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    backgroundColor: '#2A2418',
  },
  warningText: {
    color: colors.textPrimary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  error: {
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: 'rgba(239, 107, 115, 0.12)',
  },
  errorTitle: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
