import { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { ApiError } from '../api/errors';
import type { Channel, MonitoringFilter } from '../api/types';
import { useChannelsQuery } from '../api/useChannelsQuery';
import { useUpdateChannelMonitoringMutation } from '../api/useUpdateChannelMonitoringMutation';
import { ChannelEducationModal } from '../components/channels/ChannelEducationModal';
import { ChannelErrorBanner } from '../components/channels/ChannelErrorBanner';
import { ChannelFilterTabs } from '../components/channels/ChannelFilterTabs';
import { ChannelListItem } from '../components/channels/ChannelListItem';
import { ScreenShell } from '../components/ScreenShell';
import { useConfigStatus } from '../config/ConfigStatusContext';
import { useConnectivityStatus } from '../connectivity/ConnectivityContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { AppStackParamList } from '../navigation/types';
import { acknowledgeChannelEducation, hasAcknowledgedChannelEducation } from '../storage/channelEducationStorage';
import { colors, spacing, typography } from '../theme/tokens';

const SEARCH_DEBOUNCE_MS = 400;

type Navigation = NativeStackNavigationProp<AppStackParamList>;

export function ChannelsScreen() {
  const navigation = useNavigation<Navigation>();
  const tabBarHeight = useBottomTabBarHeight();
  const { config } = useConfigStatus();
  const { isOffline } = useConnectivityStatus();
  const [filter, setFilter] = useState<MonitoringFilter>('monitored');
  const [search, setSearch] = useState('');
  const [educationAcknowledged, setEducationAcknowledged] = useState(false);
  const [educationChannel, setEducationChannel] = useState<Channel | null>(null);
  const [lastError, setLastError] = useState<ApiError | null>(null);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const query = useChannelsQuery({ monitoring: filter, query: debouncedSearch });
  const mutation = useUpdateChannelMonitoringMutation();

  useEffect(() => {
    let active = true;
    if (!config?.apiBaseUrl) return;

    hasAcknowledgedChannelEducation(config.apiBaseUrl).then((acknowledged) => {
      if (active) setEducationAcknowledged(acknowledged);
    });

    return () => {
      active = false;
    };
  }, [config?.apiBaseUrl]);

  const channels = useMemo(() => query.data?.pages.flatMap((page) => page.channels) ?? [], [query.data]);
  const total = query.data?.pages[0]?.pagination.total ?? 0;
  const pendingChannelId = mutation.variables?.channelId;
  const showInitialLoading = query.isLoading && channels.length === 0;
  const showEmpty = !query.isLoading && channels.length === 0 && !query.error;

  const runToggle = (channel: Channel, nextValue: boolean) => {
    if (isOffline) return;

    setLastError(null);
    mutation.mutate(
      { channelId: channel.channel_id, isMonitored: nextValue },
      {
        onError: (error) => setLastError(error),
      },
    );
  };

  const handleToggle = (channel: Channel, nextValue: boolean) => {
    if (nextValue && !educationAcknowledged) {
      setEducationChannel(channel);
      return;
    }

    runToggle(channel, nextValue);
  };

  const confirmEducation = async () => {
    if (!educationChannel || !config?.apiBaseUrl) return;

    await acknowledgeChannelEducation(config.apiBaseUrl);
    setEducationAcknowledged(true);
    const channel = educationChannel;
    setEducationChannel(null);
    runToggle(channel, true);
  };

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
              disabled={isOffline || (mutation.isPending && pendingChannelId === item.channel_id)}
            onPress={(channel) => navigation.navigate('ChannelDetail', { channel })}
            onToggle={handleToggle}
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
            {isOffline ? <Text style={styles.message}>Monitoring toggles and refresh are disabled while offline.</Text> : null}
            <ChannelErrorBanner error={lastError ?? query.error ?? null} onDismiss={() => setLastError(null)} />
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
        refreshControl={<RefreshControl refreshing={query.isFetching && !query.isFetchingNextPage && !isOffline} onRefresh={() => { if (!isOffline) void query.refetch(); }} />}
        onEndReached={() => {
          if (!isOffline && query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
      />
      <ChannelEducationModal
        visible={Boolean(educationChannel)}
        channelTitle={educationChannel?.title}
        onCancel={() => setEducationChannel(null)}
        onConfirm={confirmEducation}
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
