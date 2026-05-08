import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { Channel, MonitoringFilter } from '../api/types';
import { useChannelsQuery } from '../api/useChannelsQuery';
import { AuthConfigErrorBanner } from '../components/AuthConfigErrorBanner';
import { ChannelEducationModal } from '../components/channels/ChannelEducationModal';
import { ChannelErrorBanner } from '../components/channels/ChannelErrorBanner';
import { ChannelFilterTabs } from '../components/channels/ChannelFilterTabs';
import { ChannelListItem } from '../components/channels/ChannelListItem';
import { ScreenShell } from '../components/ScreenShell';
import { useChannelMonitoringToggle } from '../hooks/useChannelMonitoringToggle';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { AppStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

const SEARCH_DEBOUNCE_MS = 400;

type Navigation = NativeStackNavigationProp<AppStackParamList>;

export function ChannelsScreen() {
  const navigation = useNavigation<Navigation>();
  const tabBarHeight = useBottomTabBarHeight();
  const [filter, setFilter] = useState<MonitoringFilter>('monitored');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const query = useChannelsQuery({ monitoring: filter, query: debouncedSearch });
  const monitoringToggle = useChannelMonitoringToggle();

  const channels = useMemo(() => query.data?.pages.flatMap((page) => page.channels) ?? [], [query.data]);
  const total = query.data?.pages[0]?.pagination.total ?? 0;
  const showInitialLoading = query.isLoading && channels.length === 0;
  const showEmpty = !query.isLoading && channels.length === 0 && !query.error;
  const authError = monitoringToggle.lastError?.kind === 'auth' ? monitoringToggle.lastError : query.error?.kind === 'auth' ? query.error : null;
  const channelError = monitoringToggle.lastError?.kind === 'auth' ? null : monitoringToggle.lastError ?? (query.error?.kind === 'auth' ? null : query.error ?? null);

  return (
    <ScreenShell title="Channels" subtitle="Manage which imported channels are eligible for future polling.">
      <FlatList
        style={styles.list}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + spacing.xl }]}
        data={channels}
        keyExtractor={(channel) => String(channel.channel_id)}
        renderItem={({ item }) => (
            <ChannelListItem
              channel={item}
              disabled={monitoringToggle.isOffline || (monitoringToggle.isPending && monitoringToggle.pendingChannelId === item.channel_id)}
            onPress={(channel) => navigation.navigate('ChannelDetail', { channel })}
            onToggle={monitoringToggle.requestToggle}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <ChannelFilterTabs selected={filter} onChange={setFilter} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search channels"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.search}
              accessibilityLabel="Search channels"
            />
            <Text style={styles.count}>{total} channels found</Text>
            {monitoringToggle.isOffline ? <Text style={styles.message}>Monitoring toggles and refresh are disabled while offline.</Text> : null}
            <AuthConfigErrorBanner error={authError} onOpenSettings={() => navigation.navigate('Settings')} />
            <ChannelErrorBanner error={channelError} onDismiss={monitoringToggle.clearError} />
            {showInitialLoading ? <Text style={styles.message}>Loading channels…</Text> : null}
          </View>
        }
        ListEmptyComponent={
          showEmpty ? (
            <Text style={styles.message}>
              {filter === 'monitored'
                ? 'No monitored channels yet. Use Dashboard Sync subscriptions to import channels, then enable monitoring here.'
                : 'No channels match this view. Try another filter or search.'}
            </Text>
          ) : null
        }
        ListFooterComponent={
          query.isFetchingNextPage ? <Text style={styles.message}>Loading more channels…</Text> : null
        }
        refreshControl={<RefreshControl refreshing={query.isFetching && !query.isFetchingNextPage && !monitoringToggle.isOffline} onRefresh={() => { if (!monitoringToggle.isOffline) void query.refetch(); }} />}
        onEndReached={() => {
          if (!monitoringToggle.isOffline && query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
      />
      <ChannelEducationModal
        visible={Boolean(monitoringToggle.educationChannel)}
        channelTitle={monitoringToggle.educationChannel?.title}
        onCancel={monitoringToggle.cancelEducation}
        onConfirm={monitoringToggle.confirmEducation}
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
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  count: {
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22,
  },
});
