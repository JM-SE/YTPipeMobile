import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ApiError } from '../api/errors';
import { ChannelEducationModal } from '../components/channels/ChannelEducationModal';
import { ChannelErrorBanner } from '../components/channels/ChannelErrorBanner';
import { ScreenShell } from '../components/ScreenShell';
import { useChannelMonitoringToggle } from '../hooks/useChannelMonitoringToggle';
import { useMobilePushChannelPreferencesQuery } from '../hooks/useMobilePushChannelPreferencesQuery';
import { usePatchMobilePushChannelPreferenceMutation } from '../hooks/usePatchMobilePushChannelPreferenceMutation';
import type { AppStackParamList } from '../navigation/types';
import { colors, spacing, typography } from '../theme/tokens';

type Props = NativeStackScreenProps<AppStackParamList, 'ChannelDetail'>;

export function ChannelDetailScreen({ route }: Props) {
  const { channel } = route.params;
  const [isMonitored, setIsMonitored] = useState(channel.is_monitored);
  const [pushError, setPushError] = useState<ApiError | null>(null);
  const monitoringToggle = useChannelMonitoringToggle();
  const pushPreferencesQuery = useMobilePushChannelPreferencesQuery({ monitoring: 'all', query: channel.title });
  const pushPreferenceMutation = usePatchMobilePushChannelPreferenceMutation();
  const pushPreference = pushPreferencesQuery.data?.pages.flatMap((page) => page.channels).find((preference) => preference.channel_id === channel.channel_id);

  const handleToggle = (nextValue: boolean) => {
    monitoringToggle.requestToggle(
      { ...channel, is_monitored: isMonitored },
      nextValue,
      {
        onOptimistic: setIsMonitored,
        onRollback: setIsMonitored,
      },
    );
  };

  const handlePushToggle = (nextValue: boolean) => {
    setPushError(null);
    pushPreferenceMutation.mutate(
      { channelId: channel.channel_id, pushEnabled: nextValue },
      {
        onError: (error) => {
          if (error.status === 404) {
            setPushError(new ApiError({ kind: error.kind, status: error.status, message: 'Channel no longer exists. Refreshing channel data.' }));
            void pushPreferencesQuery.refetch();
            return;
          }

          if (error.status === 409) {
            setPushError(new ApiError({ kind: error.kind, status: error.status, message: 'This channel is not currently monitored, so push preferences cannot be changed.' }));
            void pushPreferencesQuery.refetch();
            return;
          }

          if (error.status === 422) {
            setPushError(new ApiError({ kind: error.kind, status: error.status, message: 'Push preference request was not accepted by the backend. Refresh and try again.' }));
            return;
          }

          setPushError(error);
        },
      },
    );
  };

  return (
    <ScreenShell title={channel.title} subtitle="Channel monitoring details.">
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.copy}>
            <Text style={styles.label}>Monitoring</Text>
            <Text style={styles.description}>
              {isMonitored
                ? 'This channel is eligible for future polling and detection.'
                : 'This channel is catalog-only until monitoring is enabled.'}
            </Text>
          </View>
            <Switch
            value={isMonitored}
            disabled={monitoringToggle.isPending || monitoringToggle.isOffline}
            onValueChange={handleToggle}
            accessibilityLabel={`${isMonitored ? 'Disable' : 'Enable'} monitoring for ${channel.title}`}
          />
        </View>
        {monitoringToggle.isOffline ? <Text style={styles.description}>Monitoring changes are disabled while offline.</Text> : null}
      </View>

      {channel.latest_detected_video ? (
        <View style={styles.card}>
          <Text style={styles.label}>Latest detected video</Text>
          <Text style={styles.title}>{channel.latest_detected_video.title}</Text>
          <Text style={styles.description}>Published: {channel.latest_detected_video.published_at}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Latest detected video</Text>
          <Text style={styles.description}>No detected video is available yet.</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>How monitoring works</Text>
        <Text style={styles.description}>
          Enabling monitoring affects future polling only. It does not notify for older videos. Disabling monitoring
          removes this channel from future polling, detection, and notification workflows.
        </Text>
      </View>

      {isMonitored ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.label}>Push alerts</Text>
              <Text style={styles.description}>
                {pushPreference
                  ? pushPreference.push_enabled
                    ? 'Push is enabled for future new videos on this monitored channel.'
                    : 'Push is disabled or currently ineffective for this monitored channel.'
                  : 'Loading push preference for this channel…'}
              </Text>
              {pushPreference?.preference.explicitly_set ? (
                <Text style={styles.description}>This channel has an explicit push preference.</Text>
              ) : (
                <Text style={styles.description}>When no explicit preference exists, backend global defaults apply.</Text>
              )}
            </View>
            <Switch
              value={Boolean(pushPreference?.push_enabled)}
              disabled={!pushPreference || pushPreferenceMutation.isPending || monitoringToggle.isOffline || !pushPreference.push_eligible}
              onValueChange={handlePushToggle}
              accessibilityLabel={`${pushPreference?.push_enabled ? 'Disable' : 'Enable'} push alerts for ${channel.title}`}
            />
          </View>
          {monitoringToggle.isOffline ? <Text style={styles.description}>Push preference changes are disabled while offline.</Text> : null}
          {!pushPreference?.push_eligible && pushPreference ? <Text style={styles.description}>This channel is not currently eligible for push alerts.</Text> : null}
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Push alerts</Text>
          <Text style={styles.description}>Push alerts are available only for monitored channels.</Text>
        </View>
      )}

      <ChannelErrorBanner error={monitoringToggle.lastError} onDismiss={monitoringToggle.clearError} />
      <ChannelErrorBanner error={pushError} onDismiss={() => setPushError(null)} />
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
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.subtitle,
    fontWeight: '700',
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.caption,
    lineHeight: 20,
  },
});
